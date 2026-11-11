//! Lien entre le Rust et l'interface : les commandes appelées par React.

use serde::Serialize;

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

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![world_info])
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
        assert_eq!(info.schema_version, 1);
    }
}
