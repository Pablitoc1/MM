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

/// Draft en cours (une à la fois).
struct DraftState(Mutex<Option<mm_world::draft::Session>>);

/// Date des matchs tant que le calendrier n'existe pas (M9) : 1re semaine de la LEC 2026.
const DRAFT_DATE: &str = "2026-01-17";

fn parse_role(role: &str) -> Option<mm_world::draft::Role> {
    use mm_world::draft::Role;
    Role::ALL
        .into_iter()
        .find(|r| format!("{r:?}").eq_ignore_ascii_case(role))
}

fn with_draft(
    state: &State<DraftState>,
    f: impl FnOnce(&mut mm_world::draft::Session) -> Result<(), mm_world::draft::DraftError>,
    focus: Option<String>,
    preview: Option<String>,
) -> Result<mm_world::draft::View, String> {
    let mut guard = state.0.lock().map_err(|e| e.to_string())?;
    let session = guard.as_mut().ok_or("aucune draft en cours")?;
    f(session).map_err(|e| e.to_string())?;
    Ok(session.view(focus.as_deref().and_then(parse_role), preview.as_deref()))
}

/// Nouvelle draft entre deux clubs ; `side` : côté du club du joueur (« blue » ou « red »).
#[tauri::command]
fn draft_start(
    seed: State<Seed>,
    state: State<DraftState>,
    blue: String,
    red: String,
    side: String,
    draft_seed: u64,
) -> Result<mm_world::draft::View, String> {
    use mm_world::draft::{Session, Side};
    let user = if side == "red" { Side::Red } else { Side::Blue };
    let session = {
        let db = seed.0.lock().map_err(|e| e.to_string())?;
        Session::start(&db, &blue, &red, user, DRAFT_DATE, draft_seed).map_err(|e| e.to_string())?
    };
    let view = session.view(None, None);
    *state.0.lock().map_err(|e| e.to_string())? = Some(session);
    Ok(view)
}

/// Ce que montre l'écran : `focus` = poste regardé, `preview` = champion sélectionné.
#[tauri::command]
fn draft_view(
    state: State<DraftState>,
    focus: Option<String>,
    preview: Option<String>,
) -> Result<mm_world::draft::View, String> {
    with_draft(&state, |_| Ok(()), focus, preview)
}

/// Choix du joueur ; l'adversaire répond aussitôt.
#[tauri::command]
fn draft_play(
    state: State<DraftState>,
    champion: String,
    role: Option<String>,
) -> Result<mm_world::draft::View, String> {
    let role = role.as_deref().and_then(parse_role);
    with_draft(&state, |s| s.play(&champion, role), None, None)
}

/// Le coach choisit à la place du joueur (« Déléguer », ou temps écoulé).
#[tauri::command]
fn draft_delegate(state: State<DraftState>) -> Result<mm_world::draft::View, String> {
    with_draft(&state, |s| s.delegate(), None, None)
}

pub fn run() {
    let builder = tauri::Builder::default();
    // Mise à jour automatique : l'interface cherche une nouvelle version au lancement.
    #[cfg(desktop)]
    let builder = builder
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init());
    builder
        .setup(|app| {
            let path = app.path().resource_dir()?.join("world.sqlite");
            let db = Db::open_read_only(&path)
                .map_err(|e| format!("base de départ introuvable ({}) : {e}", path.display()))?;
            app.manage(Seed(Mutex::new(db)));
            app.manage(DraftState(Mutex::new(None)));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            world_info,
            leagues,
            teams,
            roster,
            player,
            simulate_match,
            draft_start,
            draft_view,
            draft_play,
            draft_delegate
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

    #[test]
    fn postes_lus_depuis_l_interface() {
        use mm_world::draft::Role;
        assert_eq!(parse_role("jungle"), Some(Role::Jungle));
        assert_eq!(parse_role("support"), Some(Role::Support));
        assert_eq!(parse_role("adc"), None);
    }
}
