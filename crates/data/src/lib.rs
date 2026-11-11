//! Données du jeu : schéma SQLite, migrations et import des vraies données.
//!
//! Vide en M0. Le schéma et l'import arrivent en M1
//! (Data Dragon, Leaguepedia, Oracle's Elixir).

/// Version du schéma de la base. Augmente à chaque migration.
pub const SCHEMA_VERSION: u32 = 0;
