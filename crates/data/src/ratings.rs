//! Notes des joueurs, calculées à partir de leurs vraies parties pro.
//!
//! Aucune source ne note les joueurs : chaque attribut compare un joueur aux autres
//! pros du même poste, puis tient compte du niveau de sa ligue, du nombre de parties
//! jouées (peu de parties = note proche de la moyenne, et fourchette large) et de
//! l'ancienneté des parties (2025 compte double par rapport à 2024).
//! La méthode complète est décrite dans `docs/decisions/007-notes-des-joueurs.md`.
//!
//! Module pur : pas d'I/O, déterministe (tris explicites, pas de HashMap itérée
//! pour produire un résultat).

use std::collections::BTreeMap;

/// Poste, comme dans Oracle's Elixir.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum Role {
    Top,
    Jungle,
    Mid,
    Bot,
    Support,
}

impl Role {
    pub const ALL: [Role; 5] = [Role::Top, Role::Jungle, Role::Mid, Role::Bot, Role::Support];

    pub fn from_oe(s: &str) -> Option<Role> {
        match s {
            "top" => Some(Role::Top),
            "jng" => Some(Role::Jungle),
            "mid" => Some(Role::Mid),
            "bot" => Some(Role::Bot),
            "sup" => Some(Role::Support),
            _ => None,
        }
    }

    pub fn name(self) -> &'static str {
        match self {
            Role::Top => "Top",
            Role::Jungle => "Jungle",
            Role::Mid => "Mid",
            Role::Bot => "Bot",
            Role::Support => "Support",
        }
    }
}

/// Une partie d'un joueur. Les champs optionnels manquent dans certaines ligues.
#[derive(Debug, Clone, PartialEq)]
pub struct GameLine {
    pub player: String,
    pub league: String,
    pub year: u16,
    /// Playoffs ou compétition internationale.
    pub big_match: bool,
    pub role: Role,
    pub champion: String,
    pub win: bool,
    pub minutes: f64,
    pub kills: f64,
    pub deaths: f64,
    pub assists: f64,
    pub team_kills: f64,
    pub damage: f64,
    pub damage_share: Option<f64>,
    pub earned_gold_share: Option<f64>,
    pub cs: f64,
    pub vision_score: Option<f64>,
    pub wards_placed: Option<f64>,
    pub wards_killed: Option<f64>,
    pub control_wards: Option<f64>,
    pub gold_diff_15: Option<f64>,
    pub cs_diff_15: Option<f64>,
    pub xp_diff_15: Option<f64>,
    pub kills_15: Option<f64>,
    pub assists_15: Option<f64>,
    pub deaths_15: Option<f64>,
    /// A participé au premier sang (kill ou assistance).
    pub first_blood: Option<bool>,
    /// Écart d'or de l'équipe à 15 min.
    pub team_gold_diff_15: Option<f64>,
}

/// Les attributs, dans l'ordre de la fiche joueur (maquette v2).
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum Attr {
    Mechanics,
    Laning,
    Farm,
    Teamfight,
    Skirmish,
    MapReading,
    Decision,
    Vision,
    ChampionPool,
    Shotcalling,
    Communication,
    Composure,
    Consistency,
    BigGames,
    Professionalism,
}

impl Attr {
    pub const ALL: [Attr; 15] = [
        Attr::Mechanics,
        Attr::Laning,
        Attr::Farm,
        Attr::Teamfight,
        Attr::Skirmish,
        Attr::MapReading,
        Attr::Decision,
        Attr::Vision,
        Attr::ChampionPool,
        Attr::Shotcalling,
        Attr::Communication,
        Attr::Composure,
        Attr::Consistency,
        Attr::BigGames,
        Attr::Professionalism,
    ];

    /// Clé stable, utilisée dans la base et par l'interface.
    pub fn key(self) -> &'static str {
        match self {
            Attr::Mechanics => "mecanique",
            Attr::Laning => "laning",
            Attr::Farm => "farm",
            Attr::Teamfight => "teamfight",
            Attr::Skirmish => "escarmouche",
            Attr::MapReading => "lecture_carte",
            Attr::Decision => "decision",
            Attr::Vision => "vision",
            Attr::ChampionPool => "pool_champions",
            Attr::Shotcalling => "shotcalling",
            Attr::Communication => "communication",
            Attr::Composure => "sang_froid",
            Attr::Consistency => "regularite",
            Attr::BigGames => "grands_matchs",
            Attr::Professionalism => "professionnalisme",
        }
    }
}

/// Une note sur 20, avec sa fourchette (égale à la note quand elle est sûre).
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Score {
    pub value: f64,
    pub low: f64,
    pub high: f64,
    /// Estimée faute de stats qui la mesurent (fourchette « du staff »).
    pub estimated: bool,
}

#[derive(Debug, Clone, PartialEq)]
pub struct PlayerRating {
    pub role: Role,
    pub league: String,
    pub games: u32,
    pub attrs: BTreeMap<Attr, Score>,
    /// Niveau actuel, sur 100.
    pub level: Score,
}

/// Paramètres de la méthode (voir la note de décision).
pub struct Params {
    /// Poids d'une partie selon l'année.
    pub year_weight: fn(u16) -> f64,
    /// Nombre de parties « fictives » à la moyenne de la ligue (lissage).
    pub prior_games: f64,
    /// Décalage de niveau par ligue, en écarts-types (0 = niveau de la LEC).
    pub league_offset: BTreeMap<String, f64>,
    /// Décalage pour une ligue absente de `league_offset`.
    pub default_offset: f64,
}

/// Échelle /20 : moyenne de la LEC à 10,5, un écart-type vaut 3 points.
const MID_20: f64 = 10.5;
const SD_20: f64 = 3.0;
/// Échelle /100 du niveau.
const MID_100: f64 = 60.0;
const SD_100: f64 = 10.0;
/// En dessous de cette demi-largeur (sur 20), la note est affichée seule, sans fourchette :
/// environ 36 parties pondérées, soit un split et demi. Le front applique le même seuil.
pub const RANGE_SHOWN: f64 = 1.5;

/// Statistiques par minute ou par partie, pour un joueur.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
enum Metric {
    Kda,
    KillParticipation,
    DamageShare,
    DamagePerMin,
    DamagePerGold,
    GoldShare,
    CsPerMin,
    DeathsPerMin,
    LateDeathsPerMin,
    VisionPerMin,
    WardsPerMin,
    WardsKilledPerMin,
    ControlWardsPerMin,
    GoldDiff15,
    CsDiff15,
    XpDiff15,
    Deaths15,
    KillsAssists15,
    FirstBlood,
    WinRate,
}

/// Valeur d'une métrique pour une partie (None si la donnée manque).
fn metric(g: &GameLine, m: Metric) -> Option<f64> {
    let min = g.minutes.max(1.0);
    Some(match m {
        Metric::Kda => (g.kills + g.assists) / g.deaths.max(1.0),
        Metric::KillParticipation => {
            if g.team_kills <= 0.0 {
                return None;
            }
            (g.kills + g.assists) / g.team_kills
        }
        Metric::DamageShare => g.damage_share?,
        Metric::DamagePerMin => g.damage / min,
        Metric::DamagePerGold => {
            let share = g.earned_gold_share?;
            if share <= 0.0 {
                return None;
            }
            g.damage_share? / share
        }
        Metric::GoldShare => g.earned_gold_share?,
        Metric::CsPerMin => g.cs / min,
        Metric::DeathsPerMin => g.deaths / min,
        Metric::LateDeathsPerMin => {
            let late = (min - 15.0).max(1.0);
            (g.deaths - g.deaths_15?).max(0.0) / late
        }
        Metric::VisionPerMin => g.vision_score? / min,
        Metric::WardsPerMin => g.wards_placed? / min,
        Metric::WardsKilledPerMin => g.wards_killed? / min,
        Metric::ControlWardsPerMin => g.control_wards? / min,
        Metric::GoldDiff15 => g.gold_diff_15?,
        Metric::CsDiff15 => g.cs_diff_15?,
        Metric::XpDiff15 => g.xp_diff_15?,
        Metric::Deaths15 => g.deaths_15?,
        Metric::KillsAssists15 => g.kills_15? + g.assists_15?,
        Metric::FirstBlood => {
            if g.first_blood? {
                1.0
            } else {
                0.0
            }
        }
        Metric::WinRate => {
            if g.win {
                1.0
            } else {
                0.0
            }
        }
    })
}

/// Recette de chaque attribut mesuré : (métrique, poids). Poids négatif = moins c'est mieux.
fn recipe(a: Attr) -> &'static [(Metric, f64)] {
    use Metric::*;
    match a {
        Attr::Mechanics => &[(Kda, 0.3), (DamagePerGold, 0.35), (DamagePerMin, 0.35)],
        Attr::Laning => &[
            (GoldDiff15, 0.35),
            (XpDiff15, 0.25),
            (CsDiff15, 0.25),
            (Deaths15, -0.15),
        ],
        Attr::Farm => &[(CsPerMin, 0.6), (GoldShare, 0.4)],
        Attr::Teamfight => &[
            (DamageShare, 0.35),
            (DamagePerMin, 0.2),
            (KillParticipation, 0.3),
            (LateDeathsPerMin, -0.15),
        ],
        Attr::Skirmish => &[(KillsAssists15, 0.6), (FirstBlood, 0.4)],
        Attr::MapReading => &[
            (DeathsPerMin, -0.4),
            (KillParticipation, 0.3),
            (FirstBlood, 0.3),
        ],
        Attr::Decision => &[(Kda, 0.4), (DeathsPerMin, -0.3), (WinRate, 0.3)],
        Attr::Vision => &[
            (VisionPerMin, 0.5),
            (WardsPerMin, 0.2),
            (WardsKilledPerMin, 0.2),
            (ControlWardsPerMin, 0.1),
        ],
        _ => &[],
    }
}

/// Poids des attributs dans le niveau, par poste.
fn level_weights(role: Role) -> &'static [(Attr, f64)] {
    use Attr::*;
    match role {
        Role::Support => &[
            (Mechanics, 0.15),
            (Laning, 0.15),
            (Teamfight, 0.2),
            (MapReading, 0.15),
            (Decision, 0.1),
            (Vision, 0.25),
        ],
        Role::Jungle => &[
            (Mechanics, 0.15),
            (Laning, 0.1),
            (Farm, 0.1),
            (Teamfight, 0.2),
            (Skirmish, 0.15),
            (MapReading, 0.15),
            (Decision, 0.1),
            (Vision, 0.05),
        ],
        _ => &[
            (Mechanics, 0.2),
            (Laning, 0.2),
            (Farm, 0.1),
            (Teamfight, 0.2),
            (Skirmish, 0.05),
            (MapReading, 0.1),
            (Decision, 0.1),
            (Vision, 0.05),
        ],
    }
}

/// Moyenne et écart-type pondérés.
fn mean_sd(values: &[(f64, f64)]) -> Option<(f64, f64)> {
    let w: f64 = values.iter().map(|v| v.1).sum();
    if w <= 0.0 || values.len() < 2 {
        return None;
    }
    let mean = values.iter().map(|v| v.0 * v.1).sum::<f64>() / w;
    let var = values
        .iter()
        .map(|v| (v.0 - mean).powi(2) * v.1)
        .sum::<f64>()
        / w;
    Some((mean, var.sqrt().max(1e-9)))
}

/// Ce qu'on retient d'un joueur avant de le noter.
struct Profile {
    role: Role,
    league: String,
    games: u32,
    /// Somme des poids des parties (année).
    weight: f64,
    metrics: BTreeMap<Metric, f64>,
    /// Score de chaque partie (pour régularité, grands matchs, sang-froid).
    game_scores: Vec<(f64, f64, bool, Option<f64>)>, // (score, poids, grand match, écart d'or équipe à 15)
    champions: BTreeMap<String, u32>,
}

/// Calcule les notes de tous les joueurs (clé = identifiant du joueur dans `lines`).
pub fn rate(lines: &[GameLine], params: &Params) -> BTreeMap<String, PlayerRating> {
    // 1. Regroupe les parties par joueur ; poste et ligue = les plus joués.
    let mut by_player: BTreeMap<&str, Vec<&GameLine>> = BTreeMap::new();
    for g in lines {
        by_player.entry(&g.player).or_default().push(g);
    }

    // Moyenne et écart-type de chaque métrique par poste, partie par partie,
    // pour standardiser le score d'une partie.
    let metrics_all = [
        Metric::Kda,
        Metric::KillParticipation,
        Metric::DamageShare,
        Metric::DamagePerMin,
        Metric::DamagePerGold,
        Metric::GoldShare,
        Metric::CsPerMin,
        Metric::DeathsPerMin,
        Metric::LateDeathsPerMin,
        Metric::VisionPerMin,
        Metric::WardsPerMin,
        Metric::WardsKilledPerMin,
        Metric::ControlWardsPerMin,
        Metric::GoldDiff15,
        Metric::CsDiff15,
        Metric::XpDiff15,
        Metric::Deaths15,
        Metric::KillsAssists15,
        Metric::FirstBlood,
        Metric::WinRate,
    ];
    let mut per_game: BTreeMap<(Role, Metric), Vec<(f64, f64)>> = BTreeMap::new();
    for g in lines {
        let w = (params.year_weight)(g.year);
        for m in [
            Metric::DamageShare,
            Metric::KillParticipation,
            Metric::DeathsPerMin,
            Metric::GoldDiff15,
        ] {
            if let Some(v) = metric(g, m) {
                per_game.entry((g.role, m)).or_default().push((v, w));
            }
        }
    }
    let per_game_stats: BTreeMap<(Role, Metric), (f64, f64)> = per_game
        .into_iter()
        .filter_map(|(k, v)| mean_sd(&v).map(|s| (k, s)))
        .collect();
    let game_score = |g: &GameLine| -> f64 {
        let parts = [
            (Metric::DamageShare, 1.0),
            (Metric::KillParticipation, 1.0),
            (Metric::DeathsPerMin, -1.0),
            (Metric::GoldDiff15, 1.0),
        ];
        let (mut s, mut n) = (0.0, 0.0);
        for (m, sign) in parts {
            if let (Some(v), Some((mu, sd))) = (metric(g, m), per_game_stats.get(&(g.role, m))) {
                s += sign * (v - mu) / sd;
                n += 1.0;
            }
        }
        if n > 0.0 {
            s / n
        } else {
            0.0
        }
    };

    let mut profiles: BTreeMap<&str, Profile> = BTreeMap::new();
    for (player, games) in &by_player {
        let mut role_count: BTreeMap<Role, f64> = BTreeMap::new();
        let mut league_count: BTreeMap<&str, f64> = BTreeMap::new();
        for g in games {
            let w = (params.year_weight)(g.year);
            *role_count.entry(g.role).or_default() += w;
            *league_count.entry(&g.league).or_default() += w;
        }
        let role = *max_key(&role_count);
        let league = max_key(&league_count).to_string();
        let games: Vec<&&GameLine> = games.iter().filter(|g| g.role == role).collect();

        let mut metrics = BTreeMap::new();
        for m in metrics_all {
            let vals: Vec<(f64, f64)> = games
                .iter()
                .filter_map(|g| metric(g, m).map(|v| (v, (params.year_weight)(g.year))))
                .collect();
            let w: f64 = vals.iter().map(|v| v.1).sum();
            if w > 0.0 {
                metrics.insert(m, vals.iter().map(|v| v.0 * v.1).sum::<f64>() / w);
            }
        }
        let mut champions = BTreeMap::new();
        for g in games.iter().filter(|g| g.year == max_year(lines)) {
            *champions.entry(g.champion.clone()).or_default() += 1;
        }
        profiles.insert(
            player,
            Profile {
                role,
                league,
                games: games.len() as u32,
                weight: games.iter().map(|g| (params.year_weight)(g.year)).sum(),
                metrics,
                game_scores: games
                    .iter()
                    .map(|g| {
                        (
                            game_score(g),
                            (params.year_weight)(g.year),
                            g.big_match,
                            g.team_gold_diff_15,
                        )
                    })
                    .collect(),
                champions,
            },
        );
    }

    // 2. Une valeur brute par attribut et par joueur.
    let mut raw: BTreeMap<(Attr, &str), f64> = BTreeMap::new();
    // Référence par poste : joueurs avec assez de parties.
    let reference = |p: &Profile| p.weight >= 10.0;
    for role in Role::ALL {
        let in_role: Vec<(&str, &Profile)> = profiles
            .iter()
            .filter(|(_, p)| p.role == role)
            .map(|(k, p)| (*k, p))
            .collect();
        // Standardisation de chaque métrique sur le poste.
        let mut z: BTreeMap<(Metric, &str), f64> = BTreeMap::new();
        for m in metrics_all {
            let vals: Vec<(f64, f64)> = in_role
                .iter()
                .filter(|(_, p)| reference(p))
                .filter_map(|(_, p)| p.metrics.get(&m).map(|v| (*v, p.weight)))
                .collect();
            if let Some((mu, sd)) = mean_sd(&vals) {
                for (k, p) in &in_role {
                    if let Some(v) = p.metrics.get(&m) {
                        z.insert((m, k), (v - mu) / sd);
                    }
                }
            }
        }
        for a in Attr::ALL {
            let rec = recipe(a);
            if !rec.is_empty() {
                for (k, _) in &in_role {
                    let (mut s, mut wsum) = (0.0, 0.0);
                    for (m, w) in rec {
                        if let Some(v) = z.get(&(*m, *k)) {
                            s += w * v;
                            wsum += w.abs();
                        }
                    }
                    if wsum > 0.0 {
                        raw.insert((a, k), s / wsum);
                    }
                }
            }
        }
        // Attributs tirés du score de chaque partie.
        for (k, p) in &in_role {
            let all: Vec<(f64, f64)> = p.game_scores.iter().map(|s| (s.0, s.1)).collect();
            if let Some((mu, sd)) = mean_sd(&all) {
                if p.games >= 8 {
                    raw.insert((Attr::Consistency, k), -sd);
                }
                let big: Vec<(f64, f64)> = p
                    .game_scores
                    .iter()
                    .filter(|s| s.2)
                    .map(|s| (s.0, s.1))
                    .collect();
                if big.len() >= 5 {
                    let b = big.iter().map(|v| v.0 * v.1).sum::<f64>()
                        / big.iter().map(|v| v.1).sum::<f64>();
                    raw.insert((Attr::BigGames, k), b - mu);
                }
                let behind: Vec<(f64, f64)> = p
                    .game_scores
                    .iter()
                    .filter(|s| s.3.is_some_and(|d| d <= -1500.0))
                    .map(|s| (s.0, s.1))
                    .collect();
                if behind.len() >= 5 {
                    let b = behind.iter().map(|v| v.0 * v.1).sum::<f64>()
                        / behind.iter().map(|v| v.1).sum::<f64>();
                    raw.insert((Attr::Composure, k), b);
                }
            }
            // Pool : nombre de champions joués au moins deux fois, et diversité.
            let total: u32 = p.champions.values().sum();
            if total >= 5 {
                let regular = p.champions.values().filter(|n| **n >= 2).count() as f64;
                let entropy: f64 = p
                    .champions
                    .values()
                    .map(|n| {
                        let q = *n as f64 / total as f64;
                        -q * q.ln()
                    })
                    .sum();
                raw.insert((Attr::ChampionPool, k), regular.ln_1p() + entropy);
            }
        }
    }

    // 3. Restandardise chaque attribut par poste, ajoute le niveau de la ligue, lisse.
    let mut out = BTreeMap::new();
    let offset_of = |league: &str| {
        params
            .league_offset
            .get(league)
            .copied()
            .unwrap_or(params.default_offset)
    };
    let mut attr_stats: BTreeMap<(Role, Attr), (f64, f64)> = BTreeMap::new();
    for role in Role::ALL {
        for a in Attr::ALL {
            let vals: Vec<(f64, f64)> = profiles
                .iter()
                .filter(|(_, p)| p.role == role && reference(p))
                .filter_map(|(k, p)| raw.get(&(a, *k)).map(|v| (*v, p.weight)))
                .collect();
            if let Some(s) = mean_sd(&vals) {
                attr_stats.insert((role, a), s);
            }
        }
    }
    for (k, p) in &profiles {
        let off = offset_of(&p.league);
        let shrink = p.weight / (p.weight + params.prior_games);
        let half = SD_20 * (params.prior_games / (p.weight + params.prior_games)).sqrt();
        let mut attrs = BTreeMap::new();
        let mut zs = BTreeMap::new();
        for a in Attr::ALL {
            let measured = match (raw.get(&(a, *k)), attr_stats.get(&(p.role, a))) {
                (Some(v), Some((mu, sd))) => Some((v - mu) / sd),
                _ => None,
            };
            let score = match measured {
                Some(zr) => {
                    let z = off + zr * shrink;
                    zs.insert(a, z);
                    let value = to20(z);
                    Score {
                        value,
                        low: (value - half).clamp(1.0, 20.0),
                        high: (value + half).clamp(1.0, 20.0),
                        estimated: false,
                    }
                }
                None => estimated(a, p, off),
            };
            attrs.insert(a, score);
        }
        let weights = level_weights(p.role);
        let (mut s, mut w) = (0.0, 0.0);
        for (a, wt) in weights {
            if let Some(z) = zs.get(a) {
                s += wt * z;
                w += wt;
            }
        }
        let z = if w > 0.0 { s / w } else { off };
        let level = (MID_100 + SD_100 * z).clamp(25.0, 99.0);
        let half100 = SD_100 * (params.prior_games / (p.weight + params.prior_games)).sqrt();
        out.insert(
            k.to_string(),
            PlayerRating {
                role: p.role,
                league: p.league.clone(),
                games: p.games,
                attrs,
                level: Score {
                    value: level,
                    low: (level - half100).clamp(1.0, 99.0),
                    high: (level + half100).clamp(1.0, 99.0),
                    estimated: false,
                },
            },
        );
    }
    out
}

fn to20(z: f64) -> f64 {
    (MID_20 + SD_20 * z).clamp(1.0, 20.0)
}

/// Note estimée quand les stats ne la mesurent pas (ou pas assez de parties) :
/// centrée sur le niveau de la ligue, avec une fourchette large.
/// Shotcalling, communication et professionnalisme ne se mesurent pas : on part
/// de l'expérience (nombre de parties pro) et du poste. // estimé
fn estimated(a: Attr, p: &Profile, off: f64) -> Score {
    let experience = ((p.games as f64) / 60.0).min(2.0); // 0 à 2 saisons pleines
    let bonus = match a {
        Attr::Shotcalling => {
            experience * 0.4
                + match p.role {
                    Role::Support => 0.5,
                    Role::Jungle => 0.4,
                    Role::Mid => 0.2,
                    _ => -0.2,
                }
        }
        Attr::Communication | Attr::Professionalism => experience * 0.3,
        _ => 0.0,
    };
    let value = to20(off + bonus);
    Score {
        value,
        low: (value - 3.0).clamp(1.0, 20.0),
        high: (value + 3.0).clamp(1.0, 20.0),
        estimated: true,
    }
}

/// Potentiel sur 100 : le niveau, plus une marge de progression selon l'âge
/// (2 points par année avant 24 ans). // estimé : courbe de progression usuelle
/// des joueurs pro, à calibrer avec la carrière des joueurs (M10).
pub fn potential(level: f64, age: Option<u32>) -> f64 {
    let growth = age.map_or(4.0, |a| (24.0 - a as f64).max(0.0) * 2.0);
    (level + growth).clamp(level, 99.0)
}

fn max_key<K: Ord>(m: &BTreeMap<K, f64>) -> &K {
    let mut best: Option<(&K, f64)> = None;
    for (k, v) in m {
        if best.is_none_or(|b| *v > b.1) {
            best = Some((k, *v));
        }
    }
    best.expect("au moins une partie").0
}

fn max_year(lines: &[GameLine]) -> u16 {
    lines.iter().map(|g| g.year).max().unwrap_or(0)
}

/// Niveau relatif des ligues, à partir des matchs entre équipes de ligues
/// différentes (compétitions internationales, EMEA Masters…).
/// Modèle de Bradley-Terry : renvoie, pour chaque ligue reliée aux autres, une
/// force en log-cote, la LEC valant 0.
pub fn league_strength(matches: &[(String, String, bool)]) -> BTreeMap<String, f64> {
    let mut leagues: Vec<&str> = matches
        .iter()
        .flat_map(|m| [m.0.as_str(), m.1.as_str()])
        .collect();
    leagues.sort_unstable();
    leagues.dedup();
    let mut s: BTreeMap<&str, f64> = leagues.iter().map(|l| (*l, 0.0)).collect();
    // Montée de gradient avec un léger rappel vers 0 (évite l'infini pour une ligue invaincue).
    for _ in 0..500 {
        let mut grad: BTreeMap<&str, f64> = leagues.iter().map(|l| (*l, 0.0)).collect();
        for (a, b, a_won) in matches {
            let p = 1.0 / (1.0 + (s[b.as_str()] - s[a.as_str()]).exp());
            let y = if *a_won { 1.0 } else { 0.0 };
            *grad.get_mut(a.as_str()).unwrap() += y - p;
            *grad.get_mut(b.as_str()).unwrap() -= y - p;
        }
        for l in &leagues {
            let g = grad[l] - 0.5 * s[l];
            *s.get_mut(l).unwrap() += 0.02 * g;
        }
    }
    let base = s.get("LEC").copied().unwrap_or(0.0);
    s.into_iter()
        .map(|(k, v)| (k.to_string(), v - base))
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn game(player: &str, league: &str, role: Role, quality: f64, i: u32) -> GameLine {
        // Une partie dont toutes les stats montent avec `quality`, avec un peu de bruit déterministe.
        let n = ((i * 37 + player.len() as u32 * 11) % 7) as f64 / 7.0 - 0.5;
        let q = quality + 0.3 * n;
        GameLine {
            player: player.into(),
            league: league.into(),
            year: 2025,
            big_match: i.is_multiple_of(4),
            role,
            champion: format!("C{}", i % (3 + quality.max(0.0) as u32 * 2)),
            win: q > 0.0,
            minutes: 32.0,
            kills: 3.0 + q,
            deaths: (3.0 - q).max(0.0),
            assists: 6.0 + q,
            team_kills: 15.0,
            damage: 20000.0 + 3000.0 * q,
            damage_share: Some(0.22 + 0.03 * q),
            earned_gold_share: Some(0.22 + 0.01 * q),
            cs: 260.0 + 20.0 * q,
            vision_score: Some(40.0 + 5.0 * q),
            wards_placed: Some(12.0 + q),
            wards_killed: Some(5.0 + q),
            control_wards: Some(3.0 + 0.5 * q),
            gold_diff_15: Some(400.0 * q),
            cs_diff_15: Some(6.0 * q),
            xp_diff_15: Some(300.0 * q),
            kills_15: Some(1.0 + 0.5 * q),
            assists_15: Some(1.0 + 0.5 * q),
            deaths_15: Some((1.0 - 0.4 * q).max(0.0)),
            first_blood: Some(q > 0.5),
            team_gold_diff_15: Some(if i.is_multiple_of(3) { -2000.0 } else { 1000.0 }),
        }
    }

    fn params() -> Params {
        let mut league_offset = BTreeMap::new();
        league_offset.insert("LEC".to_string(), 0.0);
        league_offset.insert("LCK".to_string(), 0.6);
        league_offset.insert("LFL".to_string(), -0.8);
        Params {
            year_weight: |y| if y >= 2025 { 1.0 } else { 0.5 },
            prior_games: 12.0,
            league_offset,
            default_offset: -1.5,
        }
    }

    fn sample() -> Vec<GameLine> {
        let mut lines = Vec::new();
        for (p, league, q, n) in [
            ("star", "LEC", 1.5, 40),
            ("bon", "LEC", 0.5, 40),
            ("moyen", "LEC", 0.0, 40),
            ("faible", "LEC", -1.0, 40),
            ("nouveau", "LEC", 1.5, 3),
            ("erl", "LFL", 0.5, 40),
            ("lck", "LCK", 0.5, 40),
        ] {
            for i in 0..n {
                lines.push(game(p, league, Role::Mid, q, i));
            }
        }
        lines
    }

    #[test]
    fn le_meilleur_joueur_a_les_meilleures_notes() {
        let r = rate(&sample(), &params());
        let lvl = |p: &str| r[p].level.value;
        assert!(lvl("star") > lvl("bon"));
        assert!(lvl("bon") > lvl("moyen"));
        assert!(lvl("moyen") > lvl("faible"));
        assert!(r["star"].attrs[&Attr::Laning].value > r["faible"].attrs[&Attr::Laning].value);
    }

    #[test]
    fn chaque_attribut_a_une_note() {
        let r = rate(&sample(), &params());
        for p in r.values() {
            for a in Attr::ALL {
                let s = p.attrs[&a];
                assert!((1.0..=20.0).contains(&s.value));
                assert!(s.low <= s.value && s.value <= s.high);
            }
        }
    }

    #[test]
    fn peu_de_parties_donne_une_fourchette_et_une_note_prudente() {
        let r = rate(&sample(), &params());
        let star = r["star"].attrs[&Attr::Laning];
        let new = r["nouveau"].attrs[&Attr::Laning];
        assert!(
            new.value < star.value,
            "le nouveau reste plus près de la moyenne"
        );
        assert!(new.high - new.low > star.high - star.low);
        assert!(new.high - new.low > 2.0 * RANGE_SHOWN);
    }

    #[test]
    fn le_niveau_de_la_ligue_compte() {
        let r = rate(&sample(), &params());
        assert!(r["lck"].level.value > r["bon"].level.value);
        assert!(r["bon"].level.value > r["erl"].level.value);
    }

    #[test]
    fn shotcalling_est_estime() {
        let r = rate(&sample(), &params());
        let s = r["star"].attrs[&Attr::Shotcalling];
        assert!(s.estimated);
        assert!(s.high - s.low >= 5.0);
    }

    #[test]
    fn meme_entree_meme_resultat() {
        assert_eq!(rate(&sample(), &params()), rate(&sample(), &params()));
    }

    #[test]
    fn potentiel_selon_l_age() {
        assert_eq!(potential(70.0, Some(19)), 80.0);
        assert_eq!(potential(70.0, Some(27)), 70.0);
        assert_eq!(potential(95.0, Some(17)), 99.0);
    }

    #[test]
    fn force_des_ligues() {
        let mut m = Vec::new();
        for i in 0..30 {
            m.push(("LCK".to_string(), "LEC".to_string(), i % 10 < 7));
            m.push(("LEC".to_string(), "LCS".to_string(), i % 10 < 6));
        }
        let s = league_strength(&m);
        assert_eq!(s["LEC"], 0.0);
        assert!(s["LCK"] > 0.3);
        assert!(s["LCS"] < -0.1);
    }
}
