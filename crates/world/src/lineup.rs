//! Prépare un match pour le moteur à partir de la base : les cinq titulaires de chaque club,
//! leur champion et ses stats Data Dragon.
//!
//! En attendant la draft (M7), chaque joueur prend son champion le plus joué en 2025
//! qui n'est pas déjà pris. En attendant les notes (M2), tous les attributs sont à la moyenne LEC.

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
            attrs: Attributes::default(),
            spells: spells(*role),
        });
    }
    Ok(TeamSetup {
        tag: team.short.clone().unwrap_or_else(|| team.id.clone()),
        name: team.id.clone(),
        players,
    })
}
