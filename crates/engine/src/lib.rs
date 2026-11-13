//! Moteur de match : simulation par agents, sans interface.
//!
//! Règle d'or : le moteur est déterministe. La même graine donne
//! exactement la même partie (voir `docs/decisions/002-determinisme.md`).
//!
//! M3 : carte en réseau de points, vagues, bâtiments, camps, farm et vision
//! (note `docs/decisions/010-moteur-carte-et-farm.md`).

pub mod geo;
pub mod kit;
pub mod map;
pub mod player;
pub mod replay;
pub mod rng;
pub mod rules;
pub mod sim;
pub mod waves;

pub use kit::Kit;
pub use player::{Attr, Attributes, ChampionStats};
pub use replay::{Replay, Role};
pub use rng::SimRng;
pub use sim::{simulate, MatchResult, MatchSetup, PlayerSetup, TeamSetup};
