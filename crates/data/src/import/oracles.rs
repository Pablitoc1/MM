//! Oracle's Elixir : une ligne par joueur et par partie pro, pour toutes les ligues.
//! Sert à calculer les notes des joueurs (`crate::ratings`).
//!
//! Fichiers CSV publics, hébergés sur Google Drive par Tim Sevenhuysen
//! (oracleselixir.com), gratuits pour les analystes et les fans.

use std::collections::{BTreeMap, BTreeSet, HashMap};
use std::path::Path;

use rusqlite::{params, Transaction};

use super::http::Fetcher;
use super::{LeagueConfig, Result};
use crate::ratings::{self, Attr, GameLine, Params, PlayerRating, Role, Score};

/// Fichiers utilisés : 2024 et 2025 (la partie commence en janvier 2026).
pub const FILES: &[(u16, &str)] = &[
    (2024, "1IjIEhLc9n8eLKeY-yh_YigKVWbhgGBsN"),
    (2025, "1v6LRphp2kYciU4SXp0PCjEMuev1bDejc"),
];

/// Compétitions qui opposent des équipes de ligues différentes (LTA : finales
/// communes de la LCS et du CBLOL en 2025).
const CROSS_LEAGUE: &[&str] = &["MSI", "WLDs", "EWC", "FST", "EM", "LTA"];

/// Une ligne du CSV, telle quelle.
struct Row {
    game: String,
    league: String,
    year: u16,
    playoffs: bool,
    position: String,
    player: String,
    player_id: String,
    team: String,
    team_id: String,
    champion: String,
    win: bool,
    fields: HashMap<String, String>,
}

impl Row {
    fn f(&self, k: &str) -> Option<f64> {
        self.fields.get(k).and_then(|v| v.parse().ok())
    }
}

pub struct Summary {
    pub games: usize,
    pub rated: usize,
    pub matched: usize,
    pub estimated: usize,
}

impl std::fmt::Display for Summary {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "Oracle's Elixir : {} lignes joueur, {} joueurs notés, {} rapprochés de la base, {} notes estimées (sans stats)",
            self.games, self.rated, self.matched, self.estimated
        )
    }
}

/// Nom du fichier tel que publié par Oracle's Elixir.
pub fn file_name(year: u16) -> String {
    format!("{year}_LoL_esports_match_data_from_OraclesElixir.csv")
}

/// Lit le CSV de l'année : copie locale dans `local_dir` si elle existe (fichier
/// téléchargé à la main depuis oracleselixir.com), sinon téléchargement depuis Drive.
fn download(fetch: &Fetcher, local_dir: &Path, year: u16, id: &str) -> Result<Vec<Row>> {
    let local = local_dir.join(file_name(year));
    if local.exists() {
        let bytes = std::fs::read(&local)?;
        if !bytes.starts_with(b"gameid,") {
            return Err(format!("{} n'est pas un CSV d'Oracle's Elixir", local.display()).into());
        }
        return parse(&bytes, year);
    }
    let url =
        format!("https://drive.usercontent.google.com/download?id={id}&export=download&confirm=t");
    let bytes = fetch.get(&url)?;
    if !bytes.starts_with(b"gameid,") {
        // Page HTML de Google Drive (« quota dépassé ») : on ne la garde pas.
        fetch.forget(&url);
        return Err(format!(
            "Oracle's Elixir {year} : Google Drive refuse le téléchargement pour l'instant \
             (quota du fichier dépassé). Réessayer plus tard, ou déposer {} dans {}.",
            file_name(year),
            local_dir.display()
        )
        .into());
    }
    parse(&bytes, year)
}

fn parse(bytes: &[u8], year: u16) -> Result<Vec<Row>> {
    let mut reader = csv::Reader::from_reader(bytes);
    let headers: Vec<String> = reader.headers()?.iter().map(str::to_string).collect();
    let mut rows = Vec::new();
    for rec in reader.records() {
        let rec = rec?;
        let fields: HashMap<String, String> = headers
            .iter()
            .zip(rec.iter())
            .filter(|(_, v)| !v.is_empty())
            .map(|(k, v)| (k.clone(), v.to_string()))
            .collect();
        let get = |k: &str| fields.get(k).cloned().unwrap_or_default();
        rows.push(Row {
            game: get("gameid"),
            league: get("league"),
            // Année du fichier (année civile) : la colonne `year` d'Oracle's Elixir est
            // la saison, et range déjà en 2026 des parties jouées en décembre 2025.
            year,
            playoffs: get("playoffs") == "1",
            position: get("position"),
            player: get("playername"),
            player_id: get("playerid"),
            team: get("teamname"),
            team_id: get("teamid"),
            champion: get("champion"),
            win: get("result") == "1",
            fields,
        });
    }
    Ok(rows)
}

/// Clé d'un joueur : l'identifiant Oracle's Elixir, sinon le pseudo.
fn player_key(r: &Row) -> String {
    if r.player_id.is_empty() {
        format!("nom:{}", r.player.to_lowercase())
    } else {
        r.player_id.clone()
    }
}

fn team_key(r: &Row) -> String {
    if r.team_id.is_empty() {
        r.team.clone()
    } else {
        r.team_id.clone()
    }
}

pub fn import(
    fetch: &Fetcher,
    local_dir: &Path,
    tx: &Transaction,
    leagues: &[LeagueConfig],
) -> Result<Summary> {
    let mut rows = Vec::new();
    for (year, id) in FILES {
        rows.extend(download(fetch, local_dir, *year, id)?);
    }

    // Code Oracle's Elixir → identifiant de nos ligues.
    let mut oe_to_ours: HashMap<String, String> = HashMap::new();
    for l in leagues {
        oe_to_ours.insert(l.id.clone(), l.id.clone());
        for code in &l.oe {
            oe_to_ours.insert(code.clone(), l.id.clone());
        }
    }

    // Ligue principale de chaque équipe (hors compétitions inter-ligues), par année.
    let mut team_league: BTreeMap<(u16, String), BTreeMap<String, u32>> = BTreeMap::new();
    for r in rows
        .iter()
        .filter(|r| r.position == "team" && !CROSS_LEAGUE.contains(&r.league.as_str()))
    {
        *team_league
            .entry((r.year, team_key(r)))
            .or_default()
            .entry(r.league.clone())
            .or_default() += 1;
    }
    let home = |year: u16, team: &str| -> Option<String> {
        let counts = team_league.get(&(year, team.to_string()))?;
        let best = counts
            .iter()
            .max_by_key(|(l, n)| (**n, std::cmp::Reverse((*l).clone())))?;
        Some(best.0.clone())
    };

    // Matchs entre ligues → force des ligues.
    let mut by_game: BTreeMap<&str, Vec<&Row>> = BTreeMap::new();
    for r in rows
        .iter()
        .filter(|r| r.position == "team" && CROSS_LEAGUE.contains(&r.league.as_str()))
    {
        by_game.entry(&r.game).or_default().push(r);
    }
    let mut cross = Vec::new();
    for teams in by_game.values() {
        if let [a, b] = teams.as_slice() {
            if let (Some(la), Some(lb)) = (home(a.year, &team_key(a)), home(b.year, &team_key(b))) {
                if la != lb {
                    cross.push((la, lb, a.win));
                }
            }
        }
    }
    let offsets = league_offsets(&ratings::league_strength(&cross), leagues, &oe_to_ours);
    for (league, (offset, source)) in &offsets {
        tx.execute(
            "INSERT INTO league_strength (league_id, offset, source) VALUES (?1, ?2, ?3)",
            params![league, offset, source],
        )?;
    }

    // Lignes joueur → parties pour le calcul. Écart d'or de l'équipe à 15 min par partie.
    let mut team_gd15: HashMap<(String, String), f64> = HashMap::new();
    for r in rows.iter().filter(|r| r.position == "team") {
        if let Some(gd) = r.f("golddiffat15") {
            team_gd15.insert((r.game.clone(), team_key(r)), gd);
        }
    }
    let mut lines = Vec::new();
    for r in &rows {
        let Some(role) = Role::from_oe(&r.position) else {
            continue;
        };
        // Ligue « maison » du joueur pour cette partie (sa ligue même à l'international).
        let oe_league = if CROSS_LEAGUE.contains(&r.league.as_str()) {
            home(r.year, &team_key(r)).unwrap_or_else(|| r.league.clone())
        } else {
            r.league.clone()
        };
        let league = oe_to_ours.get(&oe_league).cloned().unwrap_or(oe_league);
        let fb = match (r.f("firstbloodkill"), r.f("firstbloodassist")) {
            (None, None) => None,
            (k, a) => Some(k.unwrap_or(0.0) + a.unwrap_or(0.0) > 0.0),
        };
        lines.push(GameLine {
            player: player_key(r),
            league,
            year: r.year,
            big_match: r.playoffs || CROSS_LEAGUE.contains(&r.league.as_str()),
            role,
            champion: r.champion.clone(),
            win: r.win,
            minutes: r.f("gamelength").unwrap_or(1800.0) / 60.0,
            kills: r.f("kills").unwrap_or(0.0),
            deaths: r.f("deaths").unwrap_or(0.0),
            assists: r.f("assists").unwrap_or(0.0),
            team_kills: r.f("teamkills").unwrap_or(0.0),
            damage: r.f("damagetochampions").unwrap_or(0.0),
            damage_share: r.f("damageshare"),
            earned_gold_share: r.f("earnedgoldshare"),
            cs: r.f("total cs").unwrap_or(0.0),
            vision_score: r.f("visionscore"),
            wards_placed: r.f("wardsplaced"),
            wards_killed: r.f("wardskilled"),
            control_wards: r.f("controlwardsbought"),
            gold_diff_15: r.f("golddiffat15"),
            cs_diff_15: r.f("csdiffat15"),
            xp_diff_15: r.f("xpdiffat15"),
            kills_15: r.f("killsat15"),
            assists_15: r.f("assistsat15"),
            deaths_15: r.f("deathsat15"),
            first_blood: fb,
            team_gold_diff_15: team_gd15.get(&(r.game.clone(), team_key(r))).copied(),
        });
    }

    let params_ = Params {
        year_weight: |y| if y >= 2025 { 1.0 } else { 0.5 },
        prior_games: 12.0,
        league_offset: offsets.iter().map(|(k, v)| (k.clone(), v.0)).collect(),
        default_offset: TIER_DEFAULT[2],
    };
    let rated = ratings::rate(&lines, &params_);

    // Noms connus de chaque joueur Oracle's Elixir, et ses parties par ligue (2025 d'abord).
    let mut names: BTreeMap<String, BTreeSet<String>> = BTreeMap::new();
    for r in rows.iter().filter(|r| Role::from_oe(&r.position).is_some()) {
        names
            .entry(r.player.to_lowercase())
            .or_default()
            .insert(player_key(r));
    }

    // Rapprochement avec nos joueurs : même pseudo ; si plusieurs joueurs portent ce
    // pseudo, celui qui a joué dans la ligue du club, sinon celui qui a le plus joué.
    let people: Vec<(String, String, String, String, Option<String>)> = tx
        .prepare(
            "SELECT p.id, p.handle, r.role, t.league_id, p.birthdate FROM roster r
             JOIN people p ON p.id = r.person_id JOIN teams t ON t.id = r.team_id
             WHERE r.is_staff = 0 GROUP BY p.id",
        )?
        .query_map([], |r| {
            Ok((r.get(0)?, r.get(1)?, r.get(2)?, r.get(3)?, r.get(4)?))
        })?
        .collect::<rusqlite::Result<_>>()?;
    let leagues_by_id: HashMap<&str, &LeagueConfig> =
        leagues.iter().map(|l| (l.id.as_str(), l)).collect();
    let mut sum = Summary {
        games: lines.len(),
        rated: rated.len(),
        matched: 0,
        estimated: 0,
    };
    for (person, handle, role, league, birthdate) in &people {
        let candidates = names.get(&handle.to_lowercase());
        let chosen = candidates.and_then(|c| {
            c.iter()
                .filter_map(|k| rated.get(k).map(|r| (k, r)))
                .max_by_key(|(k, r)| {
                    (
                        (r.league == *league) as u8,
                        r.games,
                        std::cmp::Reverse((*k).clone()),
                    )
                })
        });
        let age = age_on_start(birthdate.as_deref());
        let (rating, source) = match chosen {
            Some((_, r)) => {
                sum.matched += 1;
                (r.clone(), "stats")
            }
            None => {
                sum.estimated += 1;
                let tier = leagues_by_id.get(league.as_str()).map_or(3, |l| l.tier);
                let off = offsets
                    .get(league)
                    .map_or(TIER_DEFAULT[(tier as usize).clamp(1, 3) - 1], |o| o.0);
                (unrated(role, league, off), "estimé")
            }
        };
        write_rating(tx, person, &rating, age, source)?;
    }
    Ok(sum)
}

/// Décalage par défaut d'une ligue sans match contre d'autres ligues, par tier,
/// en écarts-types par rapport à la LEC. // estimé : les ligues tier 1 sans
/// confrontation sont rares ; tier 2 et 3 d'après l'écart observé entre la LEC
/// et les ligues régionales européennes (joueurs promus, résultats en EMEA Masters).
const TIER_DEFAULT: [f64; 3] = [-0.5, -1.2, -1.8];

/// Décalage de chaque ligue, à partir de la force mesurée (log-cote).
/// Une log-cote de 1 (73 % de victoires) vaut 0,9 écart-type de niveau. // estimé
fn league_offsets(
    strength: &BTreeMap<String, f64>,
    leagues: &[LeagueConfig],
    oe_to_ours: &HashMap<String, String>,
) -> BTreeMap<String, (f64, String)> {
    let mut out = BTreeMap::new();
    let lec_connected = strength.contains_key("LEC");
    // Ligues hors du groupe de la LEC (ex. ligues régionales reliées par les EMEA Masters) :
    // on recentre leur groupe sur le défaut de leur tier.
    let tier_of = |oe: &str| {
        let ours = oe_to_ours.get(oe).map(String::as_str).unwrap_or(oe);
        leagues.iter().find(|l| l.id == ours).map(|l| l.tier)
    };
    let mut others: Vec<(&String, f64, u8)> = Vec::new();
    for (oe, s) in strength {
        let Some(tier) = tier_of(oe) else { continue };
        if tier == 1 && lec_connected {
            let ours = oe_to_ours.get(oe).cloned().unwrap_or(oe.clone());
            out.insert(
                ours,
                (
                    (0.9 * s).clamp(-2.5, 1.5),
                    "matchs internationaux".to_string(),
                ),
            );
        } else {
            others.push((oe, *s, tier));
        }
    }
    if !others.is_empty() {
        let mean = others.iter().map(|o| o.1).sum::<f64>() / others.len() as f64;
        for (oe, s, tier) in others {
            let ours = oe_to_ours.get(oe).cloned().unwrap_or(oe.clone());
            // Une ligue de tier 2 ou 3 ne passe pas au-dessus du défaut du tier supérieur :
            // sans match contre la LEC, rien ne permet de la placer plus haut. // estimé
            let t = (tier as usize).clamp(1, 3) - 1;
            let cap = if t == 0 { 1.5 } else { TIER_DEFAULT[t - 1] };
            let off = (TIER_DEFAULT[t] + 0.9 * (s - mean)).min(cap);
            out.insert(
                ours,
                (
                    off.clamp(-3.0, 1.5),
                    "EMEA Masters et défaut du tier".to_string(),
                ),
            );
        }
    }
    // Ligues académiques sans confrontation : la ligue principale de la région moins
    // ACADEMY_GAP, jamais en dessous du défaut de leur tier.
    for l in leagues {
        if out.contains_key(&l.id) {
            continue;
        }
        let tier_default = TIER_DEFAULT[(l.tier as usize).clamp(1, 3) - 1];
        let parent = l.academy_of.as_ref().and_then(|p| out.get(p).map(|o| o.0));
        let entry = match parent {
            Some(p) => (
                (p - ACADEMY_GAP).max(tier_default),
                "ligue principale de la région moins l'écart académique (estimé)".to_string(),
            ),
            None => (tier_default, "défaut du tier (estimé)".to_string()),
        };
        out.insert(l.id.clone(), entry);
    }
    out
}

/// Écart entre une ligue principale et son académie, en écarts-types. // estimé :
/// un titulaire de ligue principale domine nettement en académie, sans écart de
/// deux tiers entiers (joueurs promus en LCK/LPL qui y tiennent leur place).
const ACADEMY_GAP: f64 = 1.5;

/// Joueur sans partie dans Oracle's Elixir : tout est estimé au niveau de sa ligue.
fn unrated(role: &str, league: &str, offset: f64) -> PlayerRating {
    let role = match role {
        "Top" => Role::Top,
        "Jungle" => Role::Jungle,
        "Mid" => Role::Mid,
        "Bot" => Role::Bot,
        _ => Role::Support,
    };
    let v20 = (10.5 + 3.0 * offset).clamp(1.0, 20.0);
    let v100 = (60.0 + 10.0 * offset).clamp(25.0, 99.0);
    PlayerRating {
        role,
        league: league.to_string(),
        games: 0,
        attrs: Attr::ALL
            .iter()
            .map(|a| {
                (
                    *a,
                    Score {
                        value: v20,
                        low: (v20 - 3.0).max(1.0),
                        high: (v20 + 3.0).min(20.0),
                        estimated: true,
                    },
                )
            })
            .collect(),
        level: Score {
            value: v100,
            low: (v100 - 10.0).max(1.0),
            high: (v100 + 10.0).min(99.0),
            estimated: true,
        },
    }
}

/// Âge au 5 janvier 2026.
fn age_on_start(birthdate: Option<&str>) -> Option<u32> {
    let b = birthdate?;
    let y: i32 = b.get(0..4)?.parse().ok()?;
    let md: u32 = b.get(5..7)?.parse::<u32>().ok()? * 100 + b.get(8..10)?.parse::<u32>().ok()?;
    let age = 2026 - y - if md > 105 { 1 } else { 0 };
    u32::try_from(age).ok()
}

fn write_rating(
    tx: &Transaction,
    person: &str,
    r: &PlayerRating,
    age: Option<u32>,
    source: &str,
) -> Result<()> {
    let potential = ratings::potential(r.level.value, age);
    tx.execute(
        "INSERT INTO player_ratings (person_id, role, games, level, level_low, level_high, potential, source)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![
            person,
            r.role.name(),
            r.games,
            round1(r.level.value),
            round1(r.level.low),
            round1(r.level.high),
            round1(potential),
            source
        ],
    )?;
    for (a, s) in &r.attrs {
        tx.execute(
            "INSERT INTO player_attributes (person_id, attr, value, low, high, estimated)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![
                person,
                a.key(),
                round1(s.value),
                round1(s.low),
                round1(s.high),
                s.estimated
            ],
        )?;
    }
    Ok(())
}

fn round1(v: f64) -> f64 {
    (v * 10.0).round() / 10.0
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn age_au_debut_de_partie() {
        assert_eq!(age_on_start(Some("2006-08-28")), Some(19));
        assert_eq!(age_on_start(Some("2000-01-05")), Some(26));
        assert_eq!(age_on_start(Some("2000-01-06")), Some(25));
        assert_eq!(age_on_start(None), None);
    }

    #[test]
    fn decalages_par_defaut_selon_le_tier() {
        let leagues = vec![
            LeagueConfig {
                id: "LEC".into(),
                name: "x".into(),
                tier: 1,
                oe: vec![],
                academy_of: None,
            },
            LeagueConfig {
                id: "LCK".into(),
                name: "x".into(),
                tier: 1,
                oe: vec![],
                academy_of: None,
            },
            LeagueConfig {
                id: "LFL".into(),
                name: "x".into(),
                tier: 2,
                oe: vec![],
                academy_of: None,
            },
            LeagueConfig {
                id: "HC".into(),
                name: "x".into(),
                tier: 3,
                oe: vec![],
                academy_of: None,
            },
        ];
        let mut s = BTreeMap::new();
        s.insert("LEC".to_string(), 0.0);
        s.insert("LCK".to_string(), 0.8);
        let o = league_offsets(&s, &leagues, &HashMap::new());
        assert_eq!(o["LEC"].0, 0.0);
        assert!(o["LCK"].0 > 0.5);
        assert_eq!(o["LFL"].0, TIER_DEFAULT[1]);
        assert_eq!(o["HC"].0, TIER_DEFAULT[2]);
    }
}
