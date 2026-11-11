//! Oracle's Elixir : une ligne par joueur et par partie pro, pour toutes les ligues,
//! de 2014 à 2025. Sert à calculer les notes des joueurs (`crate::ratings`).
//!
//! Fichiers CSV publics, publiés par Tim Sevenhuysen (oracleselixir.com), gratuits
//! pour les analystes et les fans. Copie locale dans `data/raw/oracles/` (fichiers
//! téléchargés à la main), sinon téléchargement depuis Google Drive pour 2024-2025.

use std::collections::{BTreeMap, BTreeSet, HashMap};
use std::path::Path;

use rusqlite::{params, Transaction};

use super::http::Fetcher;
use super::{LeagueConfig, Result};
use crate::ratings::{self, Attr, GameLine, LeagueLink, Params, PlayerRating, Role, Score};

/// Années utilisées : toute l'histoire disponible jusqu'à la veille du début de la
/// partie (janvier 2026). 2026 serait l'avenir pour le joueur.
pub const YEARS: std::ops::RangeInclusive<u16> = 2014..=2025;

/// Fichiers récents aussi disponibles sur le Google Drive d'Oracle's Elixir.
const DRIVE: &[(u16, &str)] = &[
    (2024, "1IjIEhLc9n8eLKeY-yh_YigKVWbhgGBsN"),
    (2025, "1v6LRphp2kYciU4SXp0PCjEMuev1bDejc"),
];

/// Compétitions qui opposent des équipes de ligues différentes : internationaux,
/// EMEA Masters, finales communes.
const CROSS_LEAGUE: &[&str] = &[
    "MSI", "WLDs", "EWC", "FST", "EM", "EUM", "LTA", "IEM", "IWCI", "MSC", "ASCI", "AmCh",
];

/// Coupes nationales hors saison (Demacia Cup, KeSPA Cup, NEST) : les clubs y alignent
/// souvent remplaçants et académie. Ignorées pour l'écart entre les ligues.
const OFFSEASON_CUPS: &[&str] = &["DCup", "KeSPA Cup", "KeSPA", "NEST"];

/// Poids d'une partie pour la forme actuelle : demi-vie d'un an et demi.
/// 2025 compte 1, 2024 : 0,63, 2023 : 0,40, 2020 : 0,10. // estimé
fn form_weight(year: u16) -> f64 {
    0.5f64.powf((2025.0 - year as f64) / 1.5)
}

/// Poids d'une partie pour la carrière (régularité, grands matchs, sang-froid) et
/// pour l'écart entre les ligues : demi-vie de quatre ans. // estimé
fn career_weight(year: u16) -> f64 {
    0.5f64.powf((2025.0 - year as f64) / 4.0)
}

/// Colonnes numériques lues dans le CSV.
const NUM_COLS: [&str; 23] = [
    "gamelength",
    "kills",
    "deaths",
    "assists",
    "teamkills",
    "damagetochampions",
    "damageshare",
    "earnedgoldshare",
    "total cs",
    "visionscore",
    "wardsplaced",
    "wardskilled",
    "controlwardsbought",
    "golddiffat15",
    "csdiffat15",
    "xpdiffat15",
    "killsat15",
    "assistsat15",
    "deathsat15",
    "firstbloodkill",
    "firstbloodassist",
    "result",
    "playoffs",
];

/// Une ligne du CSV, réduite à ce qui sert.
struct Row {
    game: String,
    date: String,
    league: String,
    position: String,
    player: String,
    player_id: String,
    team: String,
    team_id: String,
    champion: String,
    nums: [Option<f32>; NUM_COLS.len()],
}

impl Row {
    fn f(&self, k: &str) -> Option<f64> {
        let i = NUM_COLS.iter().position(|c| *c == k)?;
        self.nums[i].map(f64::from)
    }
    fn win(&self) -> bool {
        self.f("result") == Some(1.0)
    }
    fn playoffs(&self) -> bool {
        self.f("playoffs") == Some(1.0)
    }
    /// Clé d'un joueur : l'identifiant Oracle's Elixir (stable d'une année à l'autre),
    /// sinon le pseudo.
    fn player_key(&self) -> String {
        if self.player_id.is_empty() {
            format!("nom:{}", self.player.to_lowercase())
        } else {
            self.player_id.clone()
        }
    }
    fn team_key(&self) -> String {
        if self.team_id.is_empty() {
            self.team.clone()
        } else {
            self.team_id.clone()
        }
    }
}

pub struct Summary {
    pub years: usize,
    pub games: usize,
    pub rated: usize,
    pub matched: usize,
    pub estimated: usize,
    pub bridges: usize,
    pub cross_matches: usize,
}

impl std::fmt::Display for Summary {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "Oracle's Elixir : {} années, {} lignes joueur, {} matchs entre ligues, {} transferts entre ligues, \
             {} joueurs notés, {} rapprochés de la base, {} notes estimées (sans stats)",
            self.years,
            self.games,
            self.cross_matches,
            self.bridges,
            self.rated,
            self.matched,
            self.estimated
        )
    }
}

/// Nom du fichier tel que publié par Oracle's Elixir.
pub fn file_name(year: u16) -> String {
    format!("{year}_LoL_esports_match_data_from_OraclesElixir.csv")
}

/// Lit le CSV de l'année : copie locale dans `local_dir` si elle existe, sinon
/// téléchargement depuis Drive (2024-2025 seulement). `None` : année absente.
fn load(fetch: &Fetcher, local_dir: &Path, year: u16) -> Result<Option<Vec<Row>>> {
    let local = local_dir.join(file_name(year));
    if local.exists() {
        let bytes = std::fs::read(&local)?;
        if !bytes.starts_with(b"gameid,") {
            return Err(format!("{} n'est pas un CSV d'Oracle's Elixir", local.display()).into());
        }
        return parse(&bytes).map(Some);
    }
    let Some((_, id)) = DRIVE.iter().find(|(y, _)| *y == year) else {
        return Ok(None);
    };
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
    parse(&bytes).map(Some)
}

fn parse(bytes: &[u8]) -> Result<Vec<Row>> {
    let mut reader = csv::Reader::from_reader(bytes);
    let headers = reader.headers()?.clone();
    let col = |name: &str| headers.iter().position(|h| h == name);
    let text = [
        "gameid",
        "date",
        "league",
        "position",
        "playername",
        "playerid",
        "teamname",
        "teamid",
        "champion",
    ]
    .map(col);
    let nums = NUM_COLS.map(col);
    let mut rows = Vec::new();
    for rec in reader.byte_records() {
        let rec = rec?;
        let get = |i: Option<usize>| {
            i.and_then(|i| rec.get(i))
                .map(|v| String::from_utf8_lossy(v).into_owned())
                .unwrap_or_default()
        };
        let num = |i: Option<usize>| -> Option<f32> {
            i.and_then(|i| rec.get(i))
                .and_then(|v| std::str::from_utf8(v).ok())
                .and_then(|v| v.trim().parse().ok())
        };
        rows.push(Row {
            game: get(text[0]),
            date: get(text[1]),
            league: get(text[2]),
            position: get(text[3]),
            player: get(text[4]),
            player_id: get(text[5]),
            team: get(text[6]),
            team_id: get(text[7]),
            champion: get(text[8]),
            nums: nums.map(num),
        });
    }
    Ok(rows)
}

/// Une année : parties des joueurs, et matchs entre ligues (ligue A, ligue B, A gagne).
struct YearData {
    lines: Vec<GameLine>,
    cross: Vec<(String, String, bool)>,
    /// Pseudo en minuscules → identifiants Oracle's Elixir.
    names: Vec<(String, String)>,
    /// Parties d'équipe, pour l'Elo : (date, partie, équipe A, ligue A, équipe B, ligue B, A gagne, grand match).
    games: Vec<TeamGame>,
    /// Pour chaque ligne de `lines` : (partie, équipe), pour lui rattacher l'Elo.
    line_teams: Vec<(String, String)>,
}

struct TeamGame {
    date: String,
    game: String,
    year: u16,
    teams: [(String, String); 2], // (équipe, ligue maison)
    a_won: bool,
    big: bool,
}

/// Transforme les lignes d'une année. La ligue d'une partie est la ligue « maison »
/// de l'équipe cette année-là, même à l'international.
fn year_data(rows: &[Row], year: u16, oe_to_ours: &HashMap<String, String>) -> YearData {
    let ours = |oe: &str| {
        oe_to_ours
            .get(oe)
            .cloned()
            .unwrap_or_else(|| oe.to_string())
    };
    let mut team_league: BTreeMap<String, BTreeMap<String, u32>> = BTreeMap::new();
    for r in rows.iter().filter(|r| {
        r.position == "team"
            && !CROSS_LEAGUE.contains(&r.league.as_str())
            && !OFFSEASON_CUPS.contains(&r.league.as_str())
    }) {
        *team_league
            .entry(r.team_key())
            .or_default()
            .entry(ours(&r.league))
            .or_default() += 1;
    }
    let home = |r: &Row| -> String {
        team_league
            .get(&r.team_key())
            .and_then(|c| {
                c.iter()
                    .max_by_key(|(l, n)| (**n, std::cmp::Reverse((*l).clone())))
                    .map(|b| b.0.clone())
            })
            .unwrap_or_else(|| ours(&r.league))
    };

    // Matchs entre deux équipes de ligues différentes.
    let mut by_game: BTreeMap<&str, Vec<&Row>> = BTreeMap::new();
    let mut team_gd15: HashMap<(&str, String), f64> = HashMap::new();
    for r in rows.iter().filter(|r| r.position == "team") {
        if !OFFSEASON_CUPS.contains(&r.league.as_str()) {
            by_game.entry(&r.game).or_default().push(r);
        }
        if let Some(gd) = r.f("golddiffat15") {
            team_gd15.insert((&r.game, r.team_key()), gd);
        }
    }
    let mut cross = Vec::new();
    let mut games = Vec::new();
    for teams in by_game.values() {
        if let [a, b] = teams.as_slice() {
            let (la, lb) = (home(a), home(b));
            if la != lb {
                cross.push((la.clone(), lb.clone(), a.win()));
            }
            games.push(TeamGame {
                date: a.date.clone(),
                game: a.game.clone(),
                year,
                teams: [(a.team_key(), la), (b.team_key(), lb)],
                a_won: a.win(),
                big: a.playoffs() || CROSS_LEAGUE.contains(&a.league.as_str()),
            });
        }
    }

    let mut lines = Vec::new();
    let mut line_teams = Vec::new();
    let mut names = BTreeSet::new();
    for r in rows {
        let Some(role) = Role::from_oe(&r.position) else {
            continue;
        };
        names.insert((r.player.to_lowercase(), r.player_key()));
        line_teams.push((r.game.clone(), r.team_key()));
        let fb = match (r.f("firstbloodkill"), r.f("firstbloodassist")) {
            (None, None) => None,
            (k, a) => Some(k.unwrap_or(0.0) + a.unwrap_or(0.0) > 0.0),
        };
        lines.push(GameLine {
            player: r.player_key(),
            league: home(r),
            year,
            big_match: r.playoffs() || CROSS_LEAGUE.contains(&r.league.as_str()),
            role,
            champion: r.champion.clone(),
            win: r.win(),
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
            team_gold_diff_15: team_gd15.get(&(r.game.as_str(), r.team_key())).copied(),
            team_strength: None,
            team_game: team_game_id(&r.game, &r.team_key()),
        });
    }
    YearData {
        lines,
        cross,
        names: names.into_iter().collect(),
        games,
        line_teams,
    }
}

/// Écart entre deux ligues mesuré par les joueurs passés de l'une à l'autre :
/// deux saisons d'au moins 10 parties, la même année ou à un an d'écart.
fn bridges(seasons: &[ratings::Season]) -> Vec<LeagueLink> {
    let mut by_player: BTreeMap<&str, Vec<&ratings::Season>> = BTreeMap::new();
    for s in seasons {
        by_player.entry(&s.player).or_default().push(s);
    }
    let mut out = Vec::new();
    for list in by_player.values() {
        for (i, a) in list.iter().enumerate() {
            for b in &list[i + 1..] {
                if a.league == b.league || a.year.abs_diff(b.year) > 1 {
                    continue;
                }
                let n = a.games.min(b.games) as f64;
                let w = (n / 20.0).min(1.0) * career_weight(a.year.max(b.year));
                out.push(LeagueLink {
                    a: a.league.clone(),
                    b: b.league.clone(),
                    gap: b.z - a.z,
                    weight: w,
                });
            }
        }
    }
    out
}

pub fn import(
    fetch: &Fetcher,
    local_dir: &Path,
    tx: &Transaction,
    leagues: &[LeagueConfig],
) -> Result<Summary> {
    // Code Oracle's Elixir → identifiant de nos ligues (noms anciens compris).
    let mut oe_to_ours: HashMap<String, String> = HashMap::new();
    for l in leagues {
        oe_to_ours.insert(l.id.clone(), l.id.clone());
        for code in &l.oe {
            oe_to_ours.insert(code.clone(), l.id.clone());
        }
    }

    let mut lines = Vec::new();
    let mut line_teams = Vec::new();
    let mut team_games = Vec::new();
    let mut cross = Vec::new();
    let mut names: BTreeMap<String, BTreeSet<String>> = BTreeMap::new();
    let mut years = 0;
    for year in YEARS {
        let Some(rows) = load(fetch, local_dir, year)? else {
            continue;
        };
        years += 1;
        let data = year_data(&rows, year, &oe_to_ours);
        lines.extend(data.lines);
        line_teams.extend(data.line_teams);
        team_games.extend(data.games);
        for (name, key) in data.names {
            names.entry(name).or_default().insert(key);
        }
        cross.extend(
            data.cross
                .into_iter()
                .map(|(a, b, w)| (a, b, w, career_weight(year))),
        );
    }
    for y in [2024, 2025] {
        if !lines.iter().any(|g| g.year == y) {
            return Err(format!(
                "Oracle's Elixir {y} manquant : déposer {} dans {}",
                file_name(y),
                local_dir.display()
            )
            .into());
        }
    }

    // Écart entre les ligues : matchs entre ligues (Bradley-Terry, comparé paire par
    // paire, donc seulement entre ligues qui se sont affrontées) + joueurs passés d'une
    // ligue à l'autre.
    let strength = ratings::league_strength(&cross);
    let mut pairs: BTreeMap<(&str, &str), f64> = BTreeMap::new();
    let mut matches_per_league: BTreeMap<&str, f64> = BTreeMap::new();
    for (a, b, _, w) in &cross {
        let key = if a < b {
            (a.as_str(), b.as_str())
        } else {
            (b.as_str(), a.as_str())
        };
        *pairs.entry(key).or_default() += w;
        *matches_per_league.entry(a).or_default() += w;
        *matches_per_league.entry(b).or_default() += w;
    }
    let mut links: Vec<LeagueLink> = pairs
        .iter()
        .map(|((a, b), n)| LeagueLink {
            a: a.to_string(),
            b: b.to_string(),
            gap: ratings::LOGODDS_TO_LEVEL * (strength[*a] - strength[*b]),
            weight: n * MATCH_WEIGHT,
        })
        .collect();
    let seasons = ratings::seasons(&lines, 10);
    let transfers = bridges(&seasons);
    let mut transfers_per_league: BTreeMap<&str, usize> = BTreeMap::new();
    for t in &transfers {
        *transfers_per_league.entry(&t.a).or_default() += 1;
        *transfers_per_league.entry(&t.b).or_default() += 1;
    }
    let n_transfers = transfers.len();
    links.extend(transfers.iter().cloned());
    let mut priors: BTreeMap<String, f64> = leagues
        .iter()
        .map(|l| {
            (
                l.id.clone(),
                TIER_DEFAULT[(l.tier as usize).clamp(1, 3) - 1],
            )
        })
        .collect();
    let mut offsets = ratings::solve_offsets(&links, &priors, PRIOR_WEIGHT);
    // Académies : a priori = ligue principale moins l'écart académique, puis on refait.
    for l in leagues {
        if let Some(parent) = l.academy_of.as_ref().and_then(|p| offsets.get(p)) {
            priors.insert(l.id.clone(), parent - ACADEMY_GAP);
        }
    }
    offsets = ratings::solve_offsets(&links, &priors, PRIOR_WEIGHT);

    for l in leagues {
        let off = offsets.get(&l.id).copied().unwrap_or(priors[&l.id]);
        let n_matches = matches_per_league
            .get(l.id.as_str())
            .copied()
            .unwrap_or(0.0);
        let n_bridges = transfers_per_league
            .get(l.id.as_str())
            .copied()
            .unwrap_or(0);
        let source = if n_matches == 0.0 && n_bridges == 0 {
            "a priori du tier (estimé)".to_string()
        } else {
            format!(
                "{n_matches:.0} matchs entre ligues (pondérés), {n_bridges} transferts de joueurs"
            )
        };
        tx.execute(
            "INSERT INTO league_strength (league_id, offset, source) VALUES (?1, ?2, ?3)",
            params![l.id, round2(off), source],
        )?;
    }

    // Force des équipes : Elo mondial sur toutes les parties, dans l'ordre des dates.
    let elo = team_elo(&mut team_games, &offsets);
    for (g, key) in lines.iter_mut().zip(&line_teams) {
        if let Some(e) = elo.get(key) {
            g.team_strength = Some((e - ELO_LEC) / ELO_PER_SD);
        }
    }

    let params_ = Params {
        year_weight: form_weight,
        career_weight,
        prior_games: 12.0,
        league_offset: offsets.clone(),
        default_offset: TIER_DEFAULT[2],
    };
    let rated = ratings::rate(&lines, &params_);

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
        years,
        games: lines.len(),
        rated: rated.len(),
        matched: 0,
        estimated: 0,
        bridges: n_transfers,
        cross_matches: cross.len(),
    };
    let mut chosen_all = Vec::new();
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
        chosen_all.push((person, role, league, birthdate, chosen));
    }

    // Progression selon l'âge : saisons successives des joueurs dont on connaît la
    // date de naissance (niveau de la saison = niveau de la ligue + écart avec elle).
    let mut birth_year: HashMap<&str, i32> = HashMap::new();
    for (_, _, _, birthdate, chosen) in &chosen_all {
        if let (Some(b), Some((key, _))) = (birthdate.as_deref(), chosen) {
            if let Some(y) = b.get(0..4).and_then(|y| y.parse().ok()) {
                birth_year.insert(key.as_str(), y);
            }
        }
    }
    let mut by_player_year: BTreeMap<(&str, u16), (f64, u32)> = BTreeMap::new();
    for s in &seasons {
        if birth_year.contains_key(s.player.as_str()) {
            let off = offsets.get(&s.league).copied().unwrap_or(TIER_DEFAULT[2]);
            let e = by_player_year.entry((&s.player, s.year)).or_default();
            e.0 += (off + s.z) * s.games as f64;
            e.1 += s.games;
        }
    }
    let mut pairs = Vec::new();
    for ((player, year), (sum, n)) in &by_player_year {
        if let Some((next_sum, next_n)) = by_player_year.get(&(*player, year + 1)) {
            let age = (*year as i32 - birth_year[player]).max(0) as u32;
            let delta = 10.0 * (next_sum / *next_n as f64 - sum / *n as f64);
            pairs.push((age, delta));
        }
    }
    let curve = ratings::AgeCurve::from_pairs(&pairs);
    if std::env::var("MM_DEBUG").is_ok() {
        for (a, (m, sd, n)) in &curve.by_age {
            eprintln!("âge {a} : {m:+.1} points/an (écart-type {sd:.1}, {n} cas)");
        }
    }

    for (person, role, league, birthdate, chosen) in chosen_all {
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
                    .copied()
                    .unwrap_or(TIER_DEFAULT[(tier as usize).clamp(1, 3) - 1]);
                (unrated(role, league, off), "estimé")
            }
        };
        let potential = curve.potential(rating.level.value, age);
        write_rating(tx, person, &rating, potential, source)?;
    }
    Ok(sum)
}

/// Identifiant stable d'une équipe dans une partie (FNV-1a, déterministe).
fn team_game_id(game: &str, team: &str) -> u64 {
    let mut h: u64 = 0xcbf29ce484222325;
    for b in game.bytes().chain([0u8]).chain(team.bytes()) {
        h ^= u64::from(b);
        h = h.wrapping_mul(0x100000001b3);
    }
    h
}

/// Elo de référence : une équipe moyenne de la LEC.
const ELO_LEC: f64 = 1500.0;
/// Points d'Elo pour un écart-type de niveau : 1 écart-type = 0,9 log-cote / 0,9
/// (voir LOGODDS_TO_LEVEL) ; une log-cote vaut 400 / ln 10 = 173,7 points d'Elo.
const ELO_PER_SD: f64 = 173.7 / ratings::LOGODDS_TO_LEVEL;
/// Ce que gagne ou perd une équipe par partie. Grands matchs (playoffs,
/// international) : × 1,5. // estimé, valeurs usuelles des Elo d'esport.
const ELO_K: f64 = 24.0;
/// Au début de chaque année (changements d'effectif), l'Elo d'une équipe revient
/// d'un tiers vers le niveau mesuré de sa ligue. // estimé
const ELO_SEASON_REGRESSION: f64 = 1.0 / 3.0;

/// Elo de chaque équipe avant chaque partie : clé (partie, équipe). Une équipe
/// nouvelle part du niveau mesuré de sa ligue (`offsets`).
fn team_elo(
    games: &mut [TeamGame],
    offsets: &BTreeMap<String, f64>,
) -> HashMap<(String, String), f64> {
    games.sort_by(|a, b| {
        (a.date.as_str(), a.game.as_str()).cmp(&(b.date.as_str(), b.game.as_str()))
    });
    let league_base =
        |l: &str| ELO_LEC + ELO_PER_SD * offsets.get(l).copied().unwrap_or(TIER_DEFAULT[2]);
    let mut rating: HashMap<String, (f64, u16)> = HashMap::new();
    let mut out = HashMap::new();
    for g in games.iter() {
        let mut pre = [0.0; 2];
        for (i, (team, league)) in g.teams.iter().enumerate() {
            let base = league_base(league);
            let e = rating.entry(team.clone()).or_insert((base, g.year));
            if e.1 != g.year {
                e.0 += (base - e.0) * ELO_SEASON_REGRESSION;
                e.1 = g.year;
            }
            pre[i] = e.0;
            out.insert((g.game.clone(), team.clone()), e.0);
        }
        let expected = 1.0 / (1.0 + 10f64.powf((pre[1] - pre[0]) / 400.0));
        let k = if g.big { ELO_K * 1.5 } else { ELO_K };
        let delta = k * (if g.a_won { 1.0 } else { 0.0 } - expected);
        rating.get_mut(&g.teams[0].0).unwrap().0 += delta;
        rating.get_mut(&g.teams[1].0).unwrap().0 -= delta;
    }
    out
}

/// A priori par tier, en écarts-types de niveau par rapport à la LEC : ne sert que
/// pour une ligue que rien ne relie aux autres (ni match, ni transfert). // estimé
const TIER_DEFAULT: [f64; 3] = [-0.5, -1.2, -1.8];

/// Poids de l'a priori, en « transferts » équivalents : très léger. // estimé
const PRIOR_WEIGHT: f64 = 2.0;

/// Poids d'un match entre ligues face à un transfert de joueur. // estimé : les
/// résultats directs entre ligues font foi autant qu'un transfert ; les transferts
/// gardent un biais (un joueur promu progresse souvent, un joueur relégué décline).
const MATCH_WEIGHT: f64 = 1.0;

/// A priori d'une académie : la ligue principale de la région moins cet écart. // estimé
const ACADEMY_GAP: f64 = 1.5;

fn round2(v: f64) -> f64 {
    (v * 100.0).round() / 100.0
}

/// Joueur sans partie dans Oracle's Elixir : tout est estimé au niveau de sa ligue.
fn unrated(role: &str, league: &str, offset: f64) -> PlayerRating {
    let role = match role {
        "Top" => Role::Top,
        "Jungle" => Role::Jungle,
        "Mid" => Role::Mid,
        "Bot" => Role::Bot,
        _ => Role::Support,
    };
    let v100 = (75.0 + 10.0 * offset).clamp(25.0, 99.0);
    let v20 = (v100 / 5.0).clamp(1.0, 20.0);
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
                        low: (v20 - 2.0).max(1.0),
                        high: (v20 + 2.0).min(20.0),
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
    potential: f64,
    source: &str,
) -> Result<()> {
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
}
