//! Leaguepedia (lol.fandom.com) via `Special:CargoExport`.
//!
//! Tables utilisées : Tournaments, TournamentPlayers, PlayerRedirects, Players,
//! Teams, PlayerImages, ScoreboardPlayers + ScoreboardGames.

use std::collections::{BTreeMap, HashMap, HashSet};
use std::fmt;

use rusqlite::{params, Transaction};
use serde_json::Value;

use super::ddragon::ChampionNames;
use super::http::Fetcher;
use super::{LeagueConfig, Result};

const EXPORT: &str = "https://lol.fandom.com/wiki/Special:CargoExport";
const PAGE: usize = 500;
/// Date de départ de la partie : l'effectif de référence est celui du premier
/// tournoi qui commence après cette date.
const ROSTER_CUTOFF: &str = "2025-12-15";
const PLAYER_ROLES: [&str; 5] = ["Top", "Jungle", "Mid", "Bot", "Support"];

#[derive(Default)]
pub struct Summary {
    pub leagues: usize,
    pub teams: usize,
    pub people: usize,
    pub with_stats: usize,
    pub missing_leagues: Vec<String>,
}

impl fmt::Display for Summary {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "{} ligues, {} clubs, {} personnes ({} avec stats 2025)",
            self.leagues, self.teams, self.people, self.with_stats
        )?;
        if !self.missing_leagues.is_empty() {
            write!(
                f,
                "\nLigues sans tournoi trouvé : {}",
                self.missing_leagues.join(", ")
            )?;
        }
        Ok(())
    }
}

/// Une requête Cargo, toutes pages confondues.
struct Query<'a> {
    tables: &'a str,
    fields: &'a str,
    where_: String,
    join: Option<&'a str>,
    group: Option<&'a str>,
    order: Option<&'a str>,
}

impl Query<'_> {
    fn run(&self, fetch: &Fetcher) -> Result<Vec<Value>> {
        let mut out = Vec::new();
        loop {
            let mut url = format!(
                "{EXPORT}?format=json&limit={PAGE}&offset={}&tables={}&fields={}&where={}",
                out.len(),
                enc(self.tables),
                enc(self.fields),
                enc(&self.where_)
            );
            for (k, v) in [
                ("join on", self.join),
                ("group by", self.group),
                ("order by", self.order),
            ] {
                if let Some(v) = v {
                    url.push_str(&format!("&{}={}", enc(k), enc(v)));
                }
            }
            let rows = match fetch.get_json(&url)? {
                Value::Array(rows) => rows,
                other => return Err(format!("réponse Cargo inattendue : {other}").into()),
            };
            let n = rows.len();
            out.extend(rows);
            if n < PAGE {
                return Ok(out);
            }
        }
    }
}

fn enc(s: &str) -> String {
    let mut out = String::new();
    for b in s.bytes() {
        match b {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => {
                out.push(b as char)
            }
            _ => out.push_str(&format!("%{b:02X}")),
        }
    }
    out
}

/// `'a','b'` pour une clause SQL IN.
fn sql_list<S: AsRef<str>>(values: &[S]) -> String {
    values
        .iter()
        .map(|v| format!("'{}'", v.as_ref().replace('\'', "''")))
        .collect::<Vec<_>>()
        .join(",")
}

fn s(v: &Value, key: &str) -> Option<String> {
    match &v[key] {
        Value::String(x) if !x.is_empty() => Some(unescape(x)),
        Value::Number(n) => Some(n.to_string()),
        _ => None,
    }
}

/// Cargo renvoie les textes échappés pour le HTML (`Nunu &amp; Willump`).
fn unescape(x: &str) -> String {
    x.replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&quot;", "\"")
        .replace("&#039;", "'")
        .replace("&#39;", "'")
        .replace("&amp;", "&")
        .replace("&nbsp;", " ")
}

fn n(v: &Value, key: &str) -> f64 {
    match &v[key] {
        Value::Number(x) => x.as_f64().unwrap_or(0.0),
        Value::String(x) => x.parse().unwrap_or(0.0),
        _ => 0.0,
    }
}

#[derive(Debug, Clone)]
struct Tournament {
    page: String,
    league: String,
    region: Option<String>,
    start: String,
}

/// Choisit le tournoi de référence d'une ligue : le premier tournoi régulier qui
/// commence après `ROSTER_CUTOFF`, sinon le dernier qui a commencé avant.
/// Renvoie les candidats dans l'ordre de préférence.
fn reference_candidates(mut tours: Vec<Tournament>) -> Vec<Tournament> {
    const SKIP: [&str; 8] = [
        "Playoffs",
        "Qualifier",
        "Promotion",
        "Relegation",
        "Tiebreaker",
        "Play-In",
        "Last Chance",
        "Invitational",
    ];
    tours.retain(|t| !SKIP.iter().any(|w| t.page.contains(w)));
    tours.sort_by(|a, b| a.start.cmp(&b.start));
    let (before, after): (Vec<_>, Vec<_>) = tours
        .into_iter()
        .partition(|t| t.start.as_str() < ROSTER_CUTOFF);
    after.into_iter().chain(before.into_iter().rev()).collect()
}

pub fn import(
    fetch: &Fetcher,
    tx: &Transaction,
    leagues: &[LeagueConfig],
    champs: &ChampionNames,
) -> Result<Summary> {
    let mut sum = Summary::default();
    let mut leagues = leagues.to_vec();
    leagues.sort_by_key(|l| l.tier); // tri stable : l'ordre du fichier compte à tier égal

    // 1. Tournois candidats.
    let names: Vec<&str> = leagues.iter().map(|l| l.name.as_str()).collect();
    let rows = Query {
        tables: "Tournaments",
        fields: "OverviewPage,League,Region,DateStart,IsQualifier",
        where_: format!(
            "League IN ({}) AND DateStart >= '2025-01-01' AND DateStart < '2026-07-01' AND IsQualifier = 0",
            sql_list(&names)
        ),
        join: None,
        group: None,
        order: Some("DateStart"),
    }
    .run(fetch)?;
    let mut by_league: HashMap<String, Vec<Tournament>> = HashMap::new();
    for r in &rows {
        let (Some(page), Some(league), Some(start)) =
            (s(r, "OverviewPage"), s(r, "League"), s(r, "DateStart"))
        else {
            continue;
        };
        by_league
            .entry(league.clone())
            .or_default()
            .push(Tournament {
                page,
                league,
                region: s(r, "Region"),
                start,
            });
    }

    // 2. Effectifs : premier candidat qui a des joueurs inscrits.
    let mut team_league: BTreeMap<String, String> = BTreeMap::new(); // club → ligue
    let mut roster: Vec<(String, String, String, i64)> = Vec::new(); // club, lien, rôle, ordre
    for league in &leagues {
        let candidates = reference_candidates(by_league.remove(&league.name).unwrap_or_default());
        let mut chosen = None;
        for t in candidates {
            let rows = Query {
                tables: "TournamentPlayers",
                fields: "Team,Link,Role,N_PlayerInTeam",
                where_: format!("OverviewPage = {}", sql_list(&[&t.page])),
                join: None,
                group: None,
                order: None,
            }
            .run(fetch)?;
            if !rows.is_empty() {
                chosen = Some((t, rows));
                break;
            }
        }
        let Some((t, rows)) = chosen else {
            sum.missing_leagues.push(league.id.clone());
            continue;
        };
        tx.execute(
            "INSERT INTO leagues (id, name, region, tier, ref_tournament) VALUES (?1, ?2, ?3, ?4, ?5)",
            params![league.id, t.league, t.region, league.tier, t.page],
        )?;
        sum.leagues += 1;
        for r in rows {
            let (Some(team), Some(link), Some(role)) =
                (s(&r, "Team"), s(&r, "Link"), s(&r, "Role"))
            else {
                continue;
            };
            if !PLAYER_ROLES.contains(&role.as_str()) && role != "Coach" {
                continue;
            }
            // Un club inscrit dans deux ligues (invité) reste dans la première (tier le plus haut).
            let owner = team_league
                .entry(team.clone())
                .or_insert_with(|| league.id.clone());
            if *owner != league.id {
                continue;
            }
            roster.push((team, link, role, n(&r, "N PlayerInTeam") as i64));
        }
    }

    // 3. Pages canoniques des joueurs (les liens peuvent être des redirections).
    let links: Vec<String> = unique(roster.iter().map(|r| r.1.clone()));
    let mut canonical: HashMap<String, String> = HashMap::new();
    for chunk in links.chunks(50) {
        let rows = Query {
            tables: "PlayerRedirects",
            fields: "AllName,OverviewPage",
            where_: format!("AllName IN ({})", sql_list(chunk)),
            join: None,
            group: None,
            order: None,
        }
        .run(fetch)?;
        for r in rows {
            if let (Some(a), Some(o)) = (s(&r, "AllName"), s(&r, "OverviewPage")) {
                canonical.insert(a.to_lowercase(), o);
            }
        }
    }
    let canon = |link: &str| {
        canonical
            .get(&link.to_lowercase())
            .cloned()
            .unwrap_or_else(|| link.to_string())
    };

    // 4. Fiches joueurs.
    let pages: Vec<String> = unique(links.iter().map(|l| canon(l)));
    let mut people: HashMap<String, Value> = HashMap::new(); // clé en minuscules
    for chunk in pages.chunks(50) {
        let rows = Query {
            tables: "Players",
            fields: "ID,OverviewPage,Name,NativeName,Country,Birthdate,Residency,Contract",
            where_: format!("OverviewPage IN ({})", sql_list(chunk)),
            join: None,
            group: None,
            order: None,
        }
        .run(fetch)?;
        for r in rows {
            if let Some(o) = s(&r, "OverviewPage") {
                people.insert(o.to_lowercase(), r);
            }
        }
    }
    for page in &pages {
        let p = people.get(&page.to_lowercase());
        let handle = p
            .and_then(|p| s(p, "ID"))
            .unwrap_or_else(|| strip_disambiguation(page));
        tx.execute(
            "INSERT INTO people (id, handle, real_name, native_name, country, birthdate, residency)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![
                page,
                handle,
                p.and_then(|p| s(p, "Name")),
                p.and_then(|p| s(p, "NativeName")),
                p.and_then(|p| s(p, "Country")),
                p.and_then(|p| s(p, "Birthdate")),
                p.and_then(|p| s(p, "Residency")),
            ],
        )?;
        tx.execute(
            "INSERT INTO contracts (person_id, end_date) VALUES (?1, ?2)",
            params![page, p.and_then(|p| s(p, "Contract"))],
        )?;
        sum.people += 1;
    }

    // 5. Clubs.
    let team_names: Vec<String> = team_league.keys().cloned().collect();
    let mut team_info: HashMap<String, Value> = HashMap::new();
    for chunk in team_names.chunks(50) {
        let rows = Query {
            tables: "Teams",
            fields: "Name,Short,Region,Image",
            where_: format!("Name IN ({})", sql_list(chunk)),
            join: None,
            group: None,
            order: None,
        }
        .run(fetch)?;
        for r in rows {
            if let Some(name) = s(&r, "Name") {
                team_info.insert(name.to_lowercase(), r);
            }
        }
    }
    for (team, league) in &team_league {
        let info = team_info.get(&team.to_lowercase());
        tx.execute(
            "INSERT INTO teams (id, short, region, league_id) VALUES (?1, ?2, ?3, ?4)",
            params![
                team,
                info.and_then(|i| s(i, "Short")),
                info.and_then(|i| s(i, "Region")),
                league,
            ],
        )?;
        sum.teams += 1;
    }

    // 6. Effectif de départ.
    for (team, link, role, sort) in &roster {
        let is_staff = !PLAYER_ROLES.contains(&role.as_str());
        tx.execute(
            "INSERT OR IGNORE INTO roster (team_id, person_id, role, is_staff, sort) VALUES (?1, ?2, ?3, ?4, ?5)",
            params![team, canon(link), role, is_staff, sort],
        )?;
    }

    // 7. Stats pro 2025 (joueurs uniquement).
    let players: Vec<String> = unique(
        roster
            .iter()
            .filter(|r| PLAYER_ROLES.contains(&r.2.as_str()))
            .map(|r| canon(&r.1)),
    );
    let ids: HashMap<String, String> = players
        .iter()
        .map(|p| (p.to_lowercase(), p.clone()))
        .collect();
    let year = "SG.DateTime_UTC >= '2025-01-01' AND SG.DateTime_UTC < '2026-01-01'";
    let mut with_stats = HashSet::new();
    for chunk in players.chunks(40) {
        let rows = Query {
            tables: "ScoreboardPlayers=SP,ScoreboardGames=SG",
            fields: "SP.Link=Link,SP.OverviewPage=Tournament,COUNT(*)=Games,SUM(SP.PlayerWin='Yes')=Wins,\
                     SUM(SP.Kills)=Kills,SUM(SP.Deaths)=Deaths,SUM(SP.Assists)=Assists,SUM(SP.CS)=CS,\
                     SUM(SP.Gold)=Gold,SUM(SP.DamageToChampions)=Damage,SUM(SP.VisionScore)=Vision,\
                     SUM(SG.Gamelength_Number)=Minutes",
            where_: format!("SP.Link IN ({}) AND {year}", sql_list(chunk)),
            join: Some("SP.GameId=SG.GameId"),
            group: Some("SP.Link,SP.OverviewPage"),
            order: None,
        }
        .run(fetch)?;
        for r in rows {
            let (Some(link), Some(tour)) = (s(&r, "Link"), s(&r, "Tournament")) else {
                continue;
            };
            let Some(id) = ids.get(&link.to_lowercase()) else {
                continue;
            };
            tx.execute(
                "INSERT OR REPLACE INTO player_stats_2025
                 (person_id, tournament, games, wins, kills, deaths, assists, cs, gold, damage, vision, minutes)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
                params![
                    id,
                    tour,
                    n(&r, "Games") as i64,
                    n(&r, "Wins") as i64,
                    n(&r, "Kills") as i64,
                    n(&r, "Deaths") as i64,
                    n(&r, "Assists") as i64,
                    n(&r, "CS") as i64,
                    n(&r, "Gold") as i64,
                    n(&r, "Damage") as i64,
                    n(&r, "Vision") as i64,
                    n(&r, "Minutes"),
                ],
            )?;
            with_stats.insert(id.clone());
        }

        let rows = Query {
            tables: "ScoreboardPlayers=SP,ScoreboardGames=SG",
            fields: "SP.Link=Link,SP.Champion=Champion,COUNT(*)=Games,SUM(SP.PlayerWin='Yes')=Wins",
            where_: format!("SP.Link IN ({}) AND {year}", sql_list(chunk)),
            join: Some("SP.GameId=SG.GameId"),
            group: Some("SP.Link,SP.Champion"),
            order: None,
        }
        .run(fetch)?;
        for r in rows {
            let (Some(link), Some(champ)) = (s(&r, "Link"), s(&r, "Champion")) else {
                continue;
            };
            let Some(id) = ids.get(&link.to_lowercase()) else {
                continue;
            };
            let key = champs.key_for(&champ).map(str::to_string).unwrap_or(champ);
            tx.execute(
                "INSERT INTO player_champions_2025 (person_id, champion, games, wins) VALUES (?1, ?2, ?3, ?4)
                 ON CONFLICT (person_id, champion) DO UPDATE
                 SET games = games + excluded.games, wins = wins + excluded.wins",
                params![id, key, n(&r, "Games") as i64, n(&r, "Wins") as i64],
            )?;
        }
    }
    sum.with_stats = with_stats.len();
    Ok(sum)
}

fn unique(it: impl Iterator<Item = String>) -> Vec<String> {
    let mut seen = HashSet::new();
    it.filter(|x| seen.insert(x.to_lowercase())).collect()
}

/// `Canna (Kim Chang-dong)` → `Canna`.
fn strip_disambiguation(page: &str) -> String {
    page.split(" (").next().unwrap_or(page).to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn t(page: &str, start: &str) -> Tournament {
        Tournament {
            page: page.into(),
            league: "L".into(),
            region: None,
            start: start.into(),
        }
    }

    #[test]
    fn tournoi_de_reference() {
        let c = reference_candidates(vec![
            t("LEC/2025 Season/Summer Season", "2025-08-01"),
            t("LEC/2026 Season/Versus Playoffs", "2026-02-16"),
            t("LEC/2026 Season/Spring Season", "2026-03-28"),
            t("LEC/2026 Season/Versus Season", "2026-01-17"),
        ]);
        let pages: Vec<_> = c.iter().map(|t| t.page.as_str()).collect();
        assert_eq!(
            pages,
            [
                "LEC/2026 Season/Versus Season",
                "LEC/2026 Season/Spring Season",
                "LEC/2025 Season/Summer Season"
            ]
        );
    }

    #[test]
    fn textes_cargo_desechappes() {
        assert_eq!(unescape("Nunu &amp; Willump"), "Nunu & Willump");
        assert_eq!(unescape("Kai&#039;Sa"), "Kai'Sa");
    }

    #[test]
    fn echappement_sql() {
        assert_eq!(
            sql_list(&["Goose (Connor O'Brien)", "Caps"]),
            "'Goose (Connor O''Brien)','Caps'"
        );
    }
}
