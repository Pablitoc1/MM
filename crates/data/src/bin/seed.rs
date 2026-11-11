//! `just seed` : fabrique `data/seed/world.sqlite` à partir des vraies données.
//! `just seed-draft` (`--draft`) : refait seulement les données de la draft.

use std::path::PathBuf;

fn main() {
    let root = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../..");
    let root = root.canonicalize().unwrap_or(root);
    let out = root.join("data/seed/world.sqlite");
    if let Some(dir) = out.parent() {
        std::fs::create_dir_all(dir).expect("dossier data/seed");
    }
    let opts = mm_data::import::Options { root, out };
    let draft_only = std::env::args().any(|a| a == "--draft");
    let res = if draft_only {
        mm_data::import::run_draft_only(&opts)
    } else {
        mm_data::import::run(&opts)
    };
    if let Err(e) = res {
        eprintln!("Import échoué : {e}");
        std::process::exit(1);
    }
}
