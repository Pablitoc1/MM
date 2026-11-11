//! Prépare un match pour le moteur à partir de la base : les cinq titulaires de chaque club,
//! leur champion et ses stats Data Dragon.
//!
//! En attendant la draft (M7), chaque joueur prend son champion le plus joué en 2025
//! qui n'est pas déjà pris. Les attributs viennent des notes M2 (note 007) ; un attribut absent
//! vaut la moyenne LEC.

use mm_data::read::{Db, Team};
use mm_engine::{Attributes, ChampionStats, PlayerSetup, Role, TeamSetup};

const ROLES: [(&str, Role); 5] = [
    ("Top", Role::Top),
    ("Jungle", Role::Jungle),
    ("Mid", Role::Mid),
    ("Bot", Role::Bot),
    ("Support", Role::Support),
];

/// Champion de secours par rôle, si un joueur n'a aucun champion connu.
const FALLBACK: [&str; 5] = ["Gnar", "XinZhao", "Orianna", "Varus", "Rakan"];

#[derive(Debug)]
pub enum LineupError {
    Db(mm_data::rusqlite::Error),
    MissingRole(String, &'static str),
    BadChampion(String),
}

impl std::fmt::Display for LineupError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            LineupError::Db(e) => write!(f, "base : {e}"),
            LineupError::MissingRole(team, role) => {
                write!(f, "{team} : aucun joueur au poste {role}")
            }
            LineupError::BadChampion(id) => write!(f, "stats illisibles pour le champion {id}"),
        }
    }
}

impl std::error::Error for LineupError {}

impl From<mm_data::rusqlite::Error> for LineupError {
    fn from(e: mm_data::rusqlite::Error) -> Self {
        LineupError::Db(e)
    }
}

/// Stats de base d'un champion, lues dans le JSON Data Dragon de la base.
pub fn champion_stats(db: &Db, id: &str) -> Result<Option<ChampionStats>, LineupError> {
    let Some(json) = db.champion_json(id)? else {
        return Ok(None);
    };
    let v: serde_json::Value =
        serde_json::from_str(&json).map_err(|_| LineupError::BadChampion(id.into()))?;
    let s = &v["stats"];
    let f = |k: &str| {
        s[k].as_f64()
            .ok_or_else(|| LineupError::BadChampion(id.into()))
    };
    Ok(Some(ChampionStats {
        id: id.to_string(),
        hp: f("hp")?,
        hp_per_level: f("hpperlevel")?,
        ad: f("attackdamage")?,
        ad_per_level: f("attackdamageperlevel")?,
        attack_speed: f("attackspeed")?,
        attack_speed_per_level: f("attackspeedperlevel")?,
        attack_range: f("attackrange")?,
        move_speed: f("movespeed")?,
        mp: f("mp")?,
    }))
}

/// Les sorts d'un champion (note 011), lus dans la base.
pub fn kit(db: &Db, id: &str) -> Result<Option<mm_engine::Kit>, LineupError> {
    let Some(json) = db.champion_kit(id)? else {
        return Ok(None);
    };
    serde_json::from_str(&json)
        .map(Some)
        .map_err(|_| LineupError::BadChampion(id.into()))
}

/// Clés des attributs dans la base (table `player_attributes`), dans l'ordre de `mm_engine::Attr`.
const ATTR_KEYS: [&str; 15] = [
    "mecanique",
    "laning",
    "farm",
    "teamfight",
    "escarmouche",
    "lecture_carte",
    "decision",
    "vision",
    "pool_champions",
    "shotcalling",
    "communication",
    "sang_froid",
    "regularite",
    "grands_matchs",
    "professionnalisme",
];

/// Les 15 attributs d'un joueur, lus dans la base.
pub fn attributes(db: &Db, person_id: &str) -> Result<Attributes, LineupError> {
    let mut attrs = Attributes::default();
    for score in db.attributes(person_id)? {
        if let Some(i) = ATTR_KEYS.iter().position(|k| *k == score.key) {
            attrs.0[i] = score.value;
        }
    }
    Ok(attrs)
}

fn spells(role: Role) -> [String; 2] {
    let second = match role {
        Role::Top | Role::Mid => "SummonerTeleport",
        Role::Jungle => "SummonerSmite",
        Role::Bot => "SummonerHeal",
        Role::Support => "SummonerExhaust",
    };
    ["SummonerFlash".to_string(), second.to_string()]
}

/// Les cinq titulaires d'un club. `taken` : champions déjà choisis dans ce match.
pub fn lineup(db: &Db, team: &Team, taken: &mut Vec<String>) -> Result<TeamSetup, LineupError> {
    let team_id = team.id.as_str();
    let roster = db.roster(team_id)?;
    let mut players = Vec::new();
    for (i, (name, role)) in ROLES.iter().enumerate() {
        let p = roster
            .iter()
            .find(|m| !m.is_staff && m.role == *name)
            .ok_or_else(|| LineupError::MissingRole(team_id.into(), name))?;
        let mut champion = None;
        let pool = db.top_champions(&p.person_id, 20)?;
        for id in pool.iter().map(String::as_str).chain([FALLBACK[i]]) {
            if taken.iter().any(|t| t == id) {
                continue;
            }
            if let Some(stats) = champion_stats(db, id)? {
                champion = Some(stats);
                break;
            }
        }
        let champion = champion.ok_or_else(|| LineupError::BadChampion(FALLBACK[i].into()))?;
        taken.push(champion.id.clone());
        players.push(PlayerSetup {
            name: p.handle.clone(),
            role: *role,
            champion,
            attrs: attributes(db, &p.person_id)?,
            spells: spells(*role),
        });
    }
    Ok(TeamSetup {
        tag: team.short.clone().unwrap_or_else(|| team.id.clone()),
        name: team.id.clone(),
        players,
    })
}

/// Un match entre deux clubs de LEC, désignés par leur sigle (ex. « KC », « G2 »).
pub fn lec_match(
    db: &Db,
    blue: &str,
    red: &str,
    seed: u64,
    minutes: f64,
) -> Result<mm_engine::MatchSetup, LineupError> {
    let lec = db.teams("LEC")?;
    let find = |tag: &str| {
        lec.iter()
            .find(|t| {
                t.short
                    .as_deref()
                    .is_some_and(|s| s.eq_ignore_ascii_case(tag))
                    || t.id == tag
            })
            .ok_or_else(|| LineupError::MissingRole(tag.into(), "club"))
    };
    let mut taken = Vec::new();
    let teams = [
        lineup(db, find(blue)?, &mut taken)?,
        lineup(db, find(red)?, &mut taken)?,
    ];
    Ok(mm_engine::MatchSetup {
        seed,
        patch: "26.1".into(),
        teams,
        duration: minutes * 60.0,
        context: Some(mm_engine::replay::MatchContext {
            competition: "LEC Versus".into(),
            stage: "Partie simulée".into(),
            format: "Bo1".into(),
            date: "2026-01-17".into(),
        }),
    })
}
