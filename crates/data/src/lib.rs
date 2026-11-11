//! Données du jeu : schéma SQLite, lecture de la base, et import des vraies données.
//!
//! La base de départ (`data/seed/world.sqlite`) est fabriquée par `just seed`
//! (feature `import`) puis livrée avec l'application, qui la lit en lecture seule.

pub mod ratings;
pub mod read;
pub mod read_draft;
pub mod schema;

#[cfg(feature = "import")]
pub mod import;

pub use read::{
    AttrScore, ChampionUse, Db, League, PlayerDetail, Rating, RosterMember, SeasonStats, Team,
    TournamentStats,
};
pub use read_draft::{ChampionKind, MetaChampion, PoolEntry, ProDraft, Profile};
pub use schema::SCHEMA_VERSION;
// Pour que l'application manipule les erreurs sans dépendre directement de rusqlite.
pub use rusqlite;
