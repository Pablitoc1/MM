//! Le flux d'une partie, lu par la vue 2D. Copie exacte du format version 1
//! (`app/ui/src/match/replay.ts`, note 003) : les noms des champs JSON sont les mêmes.

use serde::Serialize;

use crate::geo::{Lane, Side};

pub const REPLAY_VERSION: u32 = 1;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum Role {
    Top,
    Jungle,
    Mid,
    Bot,
    Support,
}

impl Role {
    pub const ALL: [Role; 5] = [Role::Top, Role::Jungle, Role::Mid, Role::Bot, Role::Support];

    /// Voie de départ du joueur ; `None` pour le jungler.
    pub fn lane(self) -> Option<Lane> {
        match self {
            Role::Top => Some(Lane::Top),
            Role::Mid => Some(Lane::Mid),
            Role::Bot | Role::Support => Some(Lane::Bot),
            Role::Jungle => None,
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct TeamInfo {
    pub tag: String,
    pub name: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct ChampionInfo {
    pub team: Side,
    pub role: Role,
    pub player: String,
    pub champion: String,
    pub spells: [String; 2],
}

#[derive(Debug, Clone, Serialize)]
pub struct ChampionFrame {
    pub x: f64,
    pub y: f64,
    pub hp: f64,
    pub resource: Option<f64>,
    pub alive: bool,
    pub level: u32,
    pub cs: u32,
    pub gold: f64,
    pub items: Vec<u32>,
}

#[derive(Debug, Clone, Serialize)]
pub struct WaveFrame {
    pub id: u32,
    pub team: Side,
    pub lane: Lane,
    pub d: f64,
    pub n: u32,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Frame {
    pub t: f64,
    pub blue_win: f64,
    pub champions: Vec<ChampionFrame>,
    pub waves: Vec<WaveFrame>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(
    tag = "type",
    rename_all = "snake_case",
    rename_all_fields = "camelCase"
)]
pub enum Event {
    Structure {
        t: f64,
        id: String,
        team: Side,
        #[serde(skip_serializing_if = "Option::is_none")]
        by: Option<usize>,
    },
    CampSpawn {
        t: f64,
        camp: String,
        #[serde(skip_serializing_if = "Option::is_none")]
        variant: Option<String>,
    },
    CampKilled {
        t: f64,
        camp: String,
        team: Side,
        respawn_at: Option<f64>,
        #[serde(skip_serializing_if = "Option::is_none")]
        by: Option<usize>,
    },
    WardPlaced {
        t: f64,
        id: u32,
        team: Side,
        x: f64,
        y: f64,
        expires_at: f64,
        #[serde(skip_serializing_if = "Option::is_none")]
        by: Option<usize>,
    },
    End {
        t: f64,
        winner: Side,
    },
}

impl Event {
    pub fn t(&self) -> f64 {
        match self {
            Event::Structure { t, .. }
            | Event::CampSpawn { t, .. }
            | Event::CampKilled { t, .. }
            | Event::WardPlaced { t, .. }
            | Event::End { t, .. } => *t,
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct MatchContext {
    pub competition: String,
    pub stage: String,
    pub format: String,
    pub date: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct Replay {
    pub version: u32,
    pub map: &'static str,
    pub patch: String,
    pub seed: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub context: Option<MatchContext>,
    pub duration: f64,
    pub teams: [TeamInfo; 2],
    pub champions: Vec<ChampionInfo>,
    pub frames: Vec<Frame>,
    pub events: Vec<Event>,
}
