//! Données du jeu : schéma SQLite, lecture de la base, et import des vraies données.
//!
//! La base de départ (`data/seed/world.sqlite`) est fabriquée par `just seed`
//! (feature `import`) puis livrée avec l'application, qui la lit en lecture seule.

pub mod read;
pub mod schema;

#[cfg(feature = "import")]
pub mod import;

pub use read::{Db, League, RosterMember, SeasonStats, Team};
pub use schema::SCHEMA_VERSION;
// Pour que l'application manipule les erreurs sans dépendre directement de rusqlite.
pub use rusqlite;
