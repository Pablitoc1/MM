//! `just draft-demo` : une draft Karmine Corp – G2 Esports où le joueur (KC, côté bleu)
//! suit à chaque tour le conseil du coach. Écrit `data/seed/public/draft-demo.json` :
//! l'écran Draft hors de Tauri (navigateur, lien de test, captures) rejoue ces étapes.

use std::path::PathBuf;

use mm_data::Db;
use mm_world::draft::{Session, Side};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let root = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../..");
    let db = Db::open_read_only(&root.join("data/seed/world.sqlite"))?;
    let mut s = Session::start(
        &db,
        "Karmine Corp",
        "G2 Esports",
        Side::Blue,
        "2026-01-17",
        1,
    )?;
    let mut steps = vec![s.view(None, None)];
    while s.draft.turn().is_some() {
        s.delegate()?;
        steps.push(s.view(None, None));
    }
    let out = root.join("data/seed/public/draft-demo.json");
    std::fs::write(
        &out,
        serde_json::to_string(&serde_json::json!({ "steps": steps }))?,
    )?;
    println!("{} étapes écrites dans {}", steps.len(), out.display());
    Ok(())
}
