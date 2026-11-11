//! Lien entre le Rust et l'interface : les commandes appelées par React.

use std::sync::Mutex;

use mm_data::{Db, League, PlayerDetail, RosterMember, Team};
use serde::Serialize;
use tauri::{Manager, State};

/// Ce que l'interface affiche en M0. Les noms passent en camelCase côté TypeScript.
#[derive(Debug, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct WorldInfoDto {
    pub date: String,
    pub schema_version: u32,
    pub engine_version: String,
}

impl From<mm_world::WorldInfo> for WorldInfoDto {
    fn from(w: mm_world::WorldInfo) -> Self {
        Self {
            date: w.date.to_string(),
            schema_version: w.schema_version,
            engine_version: env!("CARGO_PKG_VERSION").to_string(),
        }
    }
}

#[tauri::command]
fn world_info() -> WorldInfoDto {
    mm_world::WorldInfo::new_game().into()
}

/// Base de départ, livrée avec l'application et ouverte en lecture seule.
struct Seed(Mutex<Db>);

fn with_db<T>(
    seed: &State<Seed>,
    f: impl FnOnce(&Db) -> mm_data::rusqlite::Result<T>,
) -> Result<T, String> {
    let db = seed.0.lock().map_err(|e| e.to_string())?;
    f(&db).map_err(|e| e.to_string())
}

#[tauri::command]
fn leagues(seed: State<Seed>) -> Result<Vec<League>, String> {
    with_db(&seed, Db::leagues)
}

#[tauri::command]
fn teams(seed: State<Seed>, league_id: String) -> Result<Vec<Team>, String> {
    with_db(&seed, |db| db.teams(&league_id))
}

#[tauri::command]
fn roster(seed: State<Seed>, team_id: String) -> Result<Vec<RosterMember>, String> {
    with_db(&seed, |db| db.roster(&team_id))
}

#[tauri::command]
fn player(seed: State<Seed>, person_id: String) -> Result<Option<PlayerDetail>, String> {
    with_db(&seed, |db| db.player(&person_id))
}

/// Simule une partie entre deux clubs de LEC et renvoie son flux pour la vue 2D (M3 : 15 min de farm).
#[tauri::command]
fn simulate_match(
    seed: State<Seed>,
    blue: String,
    red: String,
    match_seed: u64,
) -> Result<mm_world::mm_engine::Replay, String> {
    let db = seed.0.lock().map_err(|e| e.to_string())?;
    let setup = mm_world::lineup::lec_match(&db, &blue, &red, match_seed, 15.0)
        .map_err(|e| e.to_string())?;
    Ok(mm_world::mm_engine::simulate(&setup).replay)
}

pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let path = app.path().resource_dir()?.join("world.sqlite");
            let db = Db::open_read_only(&path)
                .map_err(|e| format!("base de départ introuvable ({}) : {e}", path.display()))?;
            app.manage(Seed(Mutex::new(db)));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            world_info,
            leagues,
            teams,
            roster,
            player,
            simulate_match
        ])
        .run(tauri::generate_context!())
        .expect("erreur au lancement de l'application");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn world_info_nouvelle_partie() {
        let info = world_info();
        assert_eq!(info.date, "Lun. 5 janvier 2026");
        assert_eq!(info.schema_version, mm_data::SCHEMA_VERSION);
    }
}
