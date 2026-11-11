//! Données de la draft, tirées des parties pro d'Oracle's Elixir :
//! - méta de chaque patch (picks, bans, victoires, rôles) dans les ligues majeures ;
//! - champions joués par chaque joueur de la base, 2014-2025 ;
//! - profil des champions selon la durée des parties et l'or à 10 et 15 min ;
//! - vraies drafts des ligues majeures 2025-2026, dans l'ordre (rapport adverse, démo).
//!
//! Voir `docs/decisions/008-donnees-de-draft.md`.

use std::collections::{BTreeMap, HashMap};
use std::path::Path;

use rusqlite::{params, Transaction};

use super::oracles::file_name;
use super::{LeagueConfig, Result};

/// Années de la méta et des vraies drafts : les patches du jeu (saison 2026) et
/// ceux de 2025, pour comparer.
pub const META_YEARS: std::ops::RangeInclusive<u16> = 2025..=2026;
/// Années des champions joués par les joueurs : jusqu'à la veille de la partie.
pub const POOL_YEARS: std::ops::RangeInclusive<u16> = 2014..=2025;
/// Années du profil des champions (durée, or) : les deux dernières saisons connues.
pub const PROFILE_YEARS: std::ops::RangeInclusive<u16> = 2024..=2025;

/// Compétitions internationales comptées dans la méta avec les ligues de tier 1.
const INTERNATIONAL: &[&str] = &["MSI", "WLDs", "FST", "EWC"];

/// Maîtrise : une partie compte moitié moins chaque année. // estimé (un champion
/// non joué depuis un an se reprend vite, depuis trois ans beaucoup moins)
fn mastery_weight(year: u16) -> f64 {
    0.5f64.powf((2025.0 - year as f64) / 1.0)
}

/// Bornes des durées de partie (minutes) du profil : début de partie gagné tôt,
/// milieu, fin. Coupes proches des tiers des durées LEC 2025 (moyenne 33,6 min).
pub const SHORT_GAME: f64 = 29.0;
pub const LONG_GAME: f64 = 36.0;

/// Patch au format du jeu (« 26.2 ») depuis la colonne d'Oracle's Elixir
/// (« 16.02 » en 2026, « 15.24 » en 2025 : Riot compte désormais par année).
pub fn game_patch(year: u16, oe_patch: &str) -> Option<String> {
    let minor: u32 = oe_patch.split('.').nth(1)?.trim().parse().ok()?;
    Some(format!("{}.{}", year % 100, minor))
}

/// Nom d'un champion chez Oracle's Elixir → clé Data Dragon.
pub fn champion_key(name: &str, by_norm: &HashMap<String, String>) -> Option<String> {
    let name = match name {
        "Wukong" => "MonkeyKing",
        "Nunu & Willump" => "Nunu",
        "Renata Glasc" => "Renata",
        n => n,
    };
    by_norm.get(&normalize(name)).cloned()
}

fn normalize(s: &str) -> String {
    s.chars()
        .filter(|c| c.is_ascii_alphanumeric())
        .map(|c| c.to_ascii_lowercase())
        .collect()
}

const ROLES: [&str; 5] = ["top", "jng", "mid", "bot", "sup"];

/// Une ligne du CSV, réduite à ce qui sert à la draft.
#[derive(Default)]
struct Line {
    game: String,
    date: String,
    league: String,
    patch: String,
    game_no: u8,
    side: String,
    position: String,
    player: String,
    player_id: String,
    team: String,
    champion: String,
    bans: [String; 5],
    picks: [String; 5],
    minutes: Option<f64>,
    win: bool,
    gd10: Option<f64>,
    gd15: Option<f64>,
}

fn read_year(path: &Path, mut each: impl FnMut(Line)) -> Result<()> {
    let mut reader = csv::Reader::from_path(path)?;
    let headers = reader.headers()?.clone();
    let col = |name: &str| headers.iter().position(|h| h == name);
    let c = [
        "gameid",
        "date",
        "league",
        "patch",
        "game",
        "side",
        "position",
        "playername",
        "playerid",
        "teamname",
        "champion",
        "gamelength",
        "result",
        "golddiffat10",
        "golddiffat15",
    ]
    .map(col);
    let bans = ["ban1", "ban2", "ban3", "ban4", "ban5"].map(col);
    let picks = ["pick1", "pick2", "pick3", "pick4", "pick5"].map(col);
    for rec in reader.byte_records() {
        let rec = rec?;
        let get = |i: Option<usize>| {
            i.and_then(|i| rec.get(i))
                .map(|v| String::from_utf8_lossy(v).trim().to_string())
                .unwrap_or_default()
        };
        let num = |i: Option<usize>| -> Option<f64> { get(i).parse().ok() };
        each(Line {
            game: get(c[0]),
            date: get(c[1]),
            league: get(c[2]),
            patch: get(c[3]),
            game_no: num(c[4]).map_or(1, |g| g as u8),
            side: get(c[5]),
            position: get(c[6]),
            player: get(c[7]),
            player_id: get(c[8]),
            team: get(c[9]),
            champion: get(c[10]),
            minutes: num(c[11]).map(|s| s / 60.0),
            win: num(c[12]) == Some(1.0),
            gd10: num(c[13]),
            gd15: num(c[14]),
            bans: bans.map(get),
            picks: picks.map(get),
        });
    }
    Ok(())
}

#[derive(Default)]
struct MetaCount {
    picks: u32,
    wins: u32,
    bans: u32,
    roles: BTreeMap<&'static str, (u32, u32)>,
}

#[derive(Default)]
struct PoolCount {
    games: u32,
    wins: u32,
    weight: f64,
    last: String,
}

#[derive(Default)]
struct ProfileCount {
    // (parties, victoires) : courtes, moyennes, longues.
    by_length: [(u32, u32); 3],
    gd10: (f64, u32),
    gd15: (f64, u32),
}

/// Une équipe dans une vraie draft.
#[derive(Default)]
struct DraftSide {
    team: String,
    win: bool,
    bans: Vec<String>,
    picks: Vec<String>,
    roles: HashMap<String, &'static str>,
}

#[derive(Default)]
struct DraftGame {
    date: String,
    league: String,
    patch: String,
    game_no: u8,
    blue: DraftSide,
    red: DraftSide,
}

pub struct Summary {
    pub patches: usize,
    pub meta_rows: usize,
    pub pools: usize,
    pub players: usize,
    pub profiles: usize,
    pub drafts: usize,
    pub unknown_champions: Vec<String>,
}

impl std::fmt::Display for Summary {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "Draft : {} patches ({} lignes de méta), {} champions joués pour {} joueurs, \
             {} profils de champions, {} vraies drafts",
            self.patches, self.meta_rows, self.pools, self.players, self.profiles, self.drafts
        )?;
        if !self.unknown_champions.is_empty() {
            write!(
                f,
                " ; champions inconnus de Data Dragon : {}",
                self.unknown_champions.join(", ")
            )?;
        }
        Ok(())
    }
}

/// Lit les CSV de `local_dir` et remplit les tables de la draft (déjà créées, vides).
/// Les champions et l'effectif doivent déjà être dans la base.
pub fn import(tx: &Transaction, local_dir: &Path, leagues: &[LeagueConfig]) -> Result<Summary> {
    let by_norm: HashMap<String, String> = tx
        .prepare("SELECT id FROM champions")?
        .query_map([], |r| r.get::<_, String>(0))?
        .collect::<rusqlite::Result<Vec<_>>>()?
        .into_iter()
        .map(|id| (normalize(&id), id))
        .collect();
    let mut major: HashMap<String, String> = HashMap::new();
    for l in leagues.iter().filter(|l| l.tier == 1) {
        major.insert(l.id.clone(), l.id.clone());
        for code in &l.oe {
            major.insert(code.clone(), l.id.clone());
        }
    }
    for code in INTERNATIONAL {
        major.insert(code.to_string(), code.to_string());
    }
    let mut unknown: BTreeMap<String, u32> = BTreeMap::new();
    let mut key = |name: &str| -> Option<String> {
        if name.is_empty() {
            return None;
        }
        let k = champion_key(name, &by_norm);
        if k.is_none() {
            *unknown.entry(name.to_string()).or_default() += 1;
        }
        k
    };

    let mut meta: BTreeMap<(String, String), MetaCount> = BTreeMap::new();
    let mut patch_games: BTreeMap<String, u32> = BTreeMap::new();
    let mut pools: HashMap<String, BTreeMap<String, PoolCount>> = HashMap::new();
    // Pseudo en minuscules → (clé du joueur, ligue) → parties.
    let mut names: HashMap<String, HashMap<(String, String), u32>> = HashMap::new();
    let mut profiles: BTreeMap<String, ProfileCount> = BTreeMap::new();
    let mut drafts: BTreeMap<String, DraftGame> = BTreeMap::new();

    let first = *POOL_YEARS.start().min(PROFILE_YEARS.start());
    for year in first..=*META_YEARS.end() {
        let path = local_dir.join(file_name(year));
        if !path.exists() {
            continue;
        }
        eprintln!("  draft {year}…");
        read_year(&path, |l| {
            let role = ROLES.iter().find(|r| **r == l.position).copied();
            let league = major.get(&l.league).cloned();
            let complete = l.minutes.is_some();
            if !complete {
                return;
            }
            if let Some(role) = role {
                let Some(champ) = key(&l.champion) else {
                    return;
                };
                if POOL_YEARS.contains(&year) {
                    let pkey = if l.player_id.is_empty() {
                        format!("nom:{}", l.player.to_lowercase())
                    } else {
                        l.player_id.clone()
                    };
                    let p = pools
                        .entry(pkey.clone())
                        .or_default()
                        .entry(champ.clone())
                        .or_default();
                    p.games += 1;
                    p.wins += l.win as u32;
                    p.weight += mastery_weight(year);
                    if l.date > p.last {
                        p.last = l.date.get(0..10).unwrap_or(&l.date).to_string();
                    }
                    let lid = leagues
                        .iter()
                        .find(|c| c.id == l.league || c.oe.contains(&l.league))
                        .map_or(l.league.clone(), |c| c.id.clone());
                    *names
                        .entry(l.player.to_lowercase())
                        .or_default()
                        .entry((pkey, lid))
                        .or_default() += 1;
                }
                if league.is_some() && PROFILE_YEARS.contains(&year) {
                    let p = profiles.entry(champ.clone()).or_default();
                    let m = l.minutes.unwrap_or(0.0);
                    let b = if m < SHORT_GAME {
                        0
                    } else if m < LONG_GAME {
                        1
                    } else {
                        2
                    };
                    p.by_length[b].0 += 1;
                    p.by_length[b].1 += l.win as u32;
                    if let Some(g) = l.gd10 {
                        p.gd10.0 += g;
                        p.gd10.1 += 1;
                    }
                    if let Some(g) = l.gd15 {
                        p.gd15.0 += g;
                        p.gd15.1 += 1;
                    }
                }
                if let (Some(_), true, Some(patch)) = (
                    &league,
                    META_YEARS.contains(&year),
                    game_patch(year, &l.patch),
                ) {
                    let m = meta.entry((patch, champ.clone())).or_default();
                    m.picks += 1;
                    m.wins += l.win as u32;
                    let r = m.roles.entry(role).or_default();
                    r.0 += 1;
                    r.1 += l.win as u32;
                    let g = drafts.entry(l.game.clone()).or_default();
                    let s = if l.side == "Blue" {
                        &mut g.blue
                    } else {
                        &mut g.red
                    };
                    s.roles.insert(champ, role);
                }
                return;
            }
            // Ligne d'équipe : bans et ordre des picks.
            let (Some(league), true, Some(patch)) = (
                league,
                META_YEARS.contains(&year),
                game_patch(year, &l.patch),
            ) else {
                return;
            };
            if l.side == "Blue" {
                *patch_games.entry(patch.clone()).or_default() += 1;
            }
            for b in &l.bans {
                if let Some(c) = key(b) {
                    meta.entry((patch.clone(), c)).or_default().bans += 1;
                }
            }
            let g = drafts.entry(l.game.clone()).or_default();
            g.date = l.date.clone();
            g.league = league;
            g.patch = patch;
            g.game_no = l.game_no;
            let s = if l.side == "Blue" {
                &mut g.blue
            } else {
                &mut g.red
            };
            s.team = l.team.clone();
            s.win = l.win;
            s.bans = l.bans.iter().filter_map(|b| key(b)).collect();
            s.picks = l.picks.iter().filter_map(|p| key(p)).collect();
        })?;
    }

    // Méta : présence et rang du champion sur le patch.
    let mut sum = Summary {
        patches: patch_games.len(),
        meta_rows: 0,
        pools: 0,
        players: 0,
        profiles: 0,
        drafts: 0,
        unknown_champions: unknown.keys().cloned().collect(),
    };
    let mut ins = tx.prepare(
        "INSERT INTO champion_meta (patch, champion, games, picks, bans, wins, tier)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
    )?;
    let mut ins_role = tx.prepare(
        "INSERT INTO champion_meta_roles (patch, champion, role, picks, wins)
         VALUES (?1, ?2, ?3, ?4, ?5)",
    )?;
    for (patch, games) in &patch_games {
        let mut rows: Vec<(&String, &MetaCount, f64)> = meta
            .iter()
            .filter(|((p, _), _)| p == patch)
            .map(|((_, c), m)| (c, m, power(m, *games)))
            .collect();
        rows.sort_by(|a, b| b.2.total_cmp(&a.2).then(a.0.cmp(b.0)));
        for (rank, (champ, m, _)) in rows.iter().enumerate() {
            ins.execute(params![
                patch,
                champ,
                games,
                m.picks,
                m.bans,
                m.wins,
                tier(rank)
            ])?;
            for (role, (p, w)) in &m.roles {
                ins_role.execute(params![patch, champ, role, p, w])?;
            }
            sum.meta_rows += 1;
        }
    }

    // Champions des joueurs de la base : pseudo identique, la clé la plus jouée dans
    // la ligue actuelle du joueur, sinon la plus jouée tout court.
    let people: Vec<(String, String, String)> = tx
        .prepare(
            "SELECT p.id, p.handle, t.league_id FROM roster r
             JOIN people p ON p.id = r.person_id JOIN teams t ON t.id = r.team_id
             WHERE r.is_staff = 0 GROUP BY p.id",
        )?
        .query_map([], |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)))?
        .collect::<rusqlite::Result<_>>()?;
    let mut ins_pool = tx.prepare(
        "INSERT INTO player_pool (person_id, champion, games, wins, mastery, last_played)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
    )?;
    for (person, handle, league) in &people {
        let Some(cands) = names.get(&handle.to_lowercase()) else {
            continue;
        };
        let mut totals: HashMap<&str, (u32, u32)> = HashMap::new();
        for ((k, l), n) in cands {
            let t = totals.entry(k.as_str()).or_default();
            t.0 += if l == league { *n } else { 0 };
            t.1 += *n;
        }
        let Some((pkey, _)) = totals.iter().max_by(|a, b| a.1.cmp(b.1).then(b.0.cmp(a.0))) else {
            continue;
        };
        let Some(pool) = pools.get(*pkey) else {
            continue;
        };
        sum.players += 1;
        for (champ, p) in pool {
            ins_pool.execute(params![
                person,
                champ,
                p.games,
                p.wins,
                (p.weight * 100.0).round() / 100.0,
                p.last
            ])?;
            sum.pools += 1;
        }
    }

    let mut ins_prof = tx.prepare(
        "INSERT INTO champion_profile (champion, games_short, wins_short, games_mid, wins_mid,
            games_long, wins_long, gold_diff_10, gold_diff_15)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
    )?;
    for (champ, p) in &profiles {
        let avg = |(s, n): (f64, u32)| (n > 0).then(|| (s / n as f64).round());
        ins_prof.execute(params![
            champ,
            p.by_length[0].0,
            p.by_length[0].1,
            p.by_length[1].0,
            p.by_length[1].1,
            p.by_length[2].0,
            p.by_length[2].1,
            avg(p.gd10),
            avg(p.gd15)
        ])?;
        sum.profiles += 1;
    }

    let mut ins_draft = tx.prepare(
        "INSERT INTO pro_drafts (game_id, date, league, patch, game_no, blue_team, red_team,
            blue_win, actions)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
    )?;
    for (id, g) in &drafts {
        let Some(actions) = official_order(g) else {
            continue;
        };
        ins_draft.execute(params![
            id,
            g.date.get(0..10).unwrap_or(&g.date),
            g.league,
            g.patch,
            g.game_no,
            g.blue.team,
            g.red.team,
            g.blue.win,
            actions
        ])?;
        sum.drafts += 1;
    }
    Ok(sum)
}

/// Force d'un champion sur un patch, pour le classer : présence (picks + bans) et
/// victoires, lissées vers 50 % avec 20 parties fictives. // estimé (méthode)
fn power(m: &MetaCount, games: u32) -> f64 {
    let games = games.max(1) as f64;
    let presence = (m.picks + m.bans) as f64 / games;
    let win = (m.wins as f64 + 10.0) / (m.picks as f64 + 20.0);
    presence + 2.0 * (win - 0.5)
}

/// Rang sur le patch → lettre de la grille de draft (maquette : A à D).
/// A : les 12 premiers (les bans et picks prioritaires), B : 13 à 35, C : 36 à 70,
/// D : le reste. // estimé (méthode : coupes proches des paliers de présence pro)
pub fn tier(rank: usize) -> &'static str {
    match rank {
        0..=11 => "A",
        12..=34 => "B",
        35..=69 => "C",
        _ => "D",
    }
}

/// Reconstitue la draft dans l'ordre officiel du tournoi (côté bleu = B, rouge = R) :
/// bans B R B R B R, picks B R R B B R, bans R B R B, picks R B B R.
/// Rend la liste en JSON : [["B","ban","Ahri"], ["B","pick","Azir","mid"], …].
/// `None` si la draft est incomplète (5 picks par équipe requis).
fn official_order(g: &DraftGame) -> Option<String> {
    if g.blue.picks.len() != 5 || g.red.picks.len() != 5 {
        return None;
    }
    let mut out = Vec::new();
    let ban = |s: &DraftSide, side: &str, i: usize, out: &mut Vec<serde_json::Value>| {
        if let Some(c) = s.bans.get(i) {
            out.push(serde_json::json!([side, "ban", c]));
        }
    };
    let pick = |s: &DraftSide, side: &str, i: usize, out: &mut Vec<serde_json::Value>| {
        let c = &s.picks[i];
        let role = s.roles.get(c).copied().unwrap_or("");
        out.push(serde_json::json!([side, "pick", c, role]));
    };
    for i in 0..3 {
        ban(&g.blue, "B", i, &mut out);
        ban(&g.red, "R", i, &mut out);
    }
    pick(&g.blue, "B", 0, &mut out);
    pick(&g.red, "R", 0, &mut out);
    pick(&g.red, "R", 1, &mut out);
    pick(&g.blue, "B", 1, &mut out);
    pick(&g.blue, "B", 2, &mut out);
    pick(&g.red, "R", 2, &mut out);
    for i in 3..5 {
        ban(&g.red, "R", i, &mut out);
        ban(&g.blue, "B", i, &mut out);
    }
    pick(&g.red, "R", 3, &mut out);
    pick(&g.blue, "B", 3, &mut out);
    pick(&g.blue, "B", 4, &mut out);
    pick(&g.red, "R", 4, &mut out);
    Some(serde_json::Value::Array(out).to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn patch_au_format_du_jeu() {
        assert_eq!(game_patch(2026, "16.02").as_deref(), Some("26.2"));
        assert_eq!(game_patch(2025, "15.24").as_deref(), Some("25.24"));
        assert_eq!(game_patch(2025, "patch"), None);
    }

    #[test]
    fn noms_des_champions() {
        let by_norm: HashMap<String, String> = ["MonkeyKing", "Kaisa", "Nunu", "Renata"]
            .iter()
            .map(|id| (normalize(id), id.to_string()))
            .collect();
        assert_eq!(champion_key("Kai'Sa", &by_norm).as_deref(), Some("Kaisa"));
        assert_eq!(
            champion_key("Wukong", &by_norm).as_deref(),
            Some("MonkeyKing")
        );
        assert_eq!(
            champion_key("Nunu & Willump", &by_norm).as_deref(),
            Some("Nunu")
        );
        assert_eq!(
            champion_key("Renata Glasc", &by_norm).as_deref(),
            Some("Renata")
        );
        assert_eq!(champion_key("Inconnu", &by_norm), None);
    }

    #[test]
    fn ordre_officiel_de_la_draft() {
        let side = |p: &str, b: &str| DraftSide {
            picks: (1..=5).map(|i| format!("{p}{i}")).collect(),
            bans: (1..=5).map(|i| format!("{b}{i}")).collect(),
            ..Default::default()
        };
        let g = DraftGame {
            blue: side("bp", "bb"),
            red: side("rp", "rb"),
            ..Default::default()
        };
        let v: Vec<Vec<String>> = serde_json::from_str(&official_order(&g).unwrap()).unwrap();
        let seq: Vec<&str> = v.iter().map(|a| a[2].as_str()).collect();
        assert_eq!(
            seq,
            [
                "bb1", "rb1", "bb2", "rb2", "bb3", "rb3", "bp1", "rp1", "rp2", "bp2", "bp3", "rp3",
                "rb4", "bb4", "rb5", "bb5", "rp4", "bp4", "bp5", "rp5"
            ]
        );
    }

    #[test]
    fn rangs_de_la_grille() {
        assert_eq!(tier(0), "A");
        assert_eq!(tier(12), "B");
        assert_eq!(tier(40), "C");
        assert_eq!(tier(120), "D");
    }
}
