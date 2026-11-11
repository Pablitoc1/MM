//! Le monde du jeu : calendrier, gestion des clubs, IA, sauvegardes.

pub mod date;
pub mod draft;

pub use date::GameDate;

/// Résumé de l'état du jeu affiché par l'interface en M0.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct WorldInfo {
    pub date: GameDate,
    pub schema_version: u32,
}

impl WorldInfo {
    /// État d'une nouvelle partie : la saison démarre début janvier 2026.
    pub fn new_game() -> Self {
        Self {
            date: GameDate::SEASON_START,
            schema_version: mm_data::SCHEMA_VERSION,
        }
    }
}
