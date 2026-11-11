//! `just seed` : fabrique `data/seed/world.sqlite` à partir des vraies données.

use std::path::PathBuf;

fn main() {
    let root = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../..");
    let root = root.canonicalize().unwrap_or(root);
    let out = root.join("data/seed/world.sqlite");
    if let Some(dir) = out.parent() {
        std::fs::create_dir_all(dir).expect("dossier data/seed");
    }
    let opts = mm_data::import::Options { root, out };
    if let Err(e) = mm_data::import::run(&opts) {
        eprintln!("Import échoué : {e}");
        std::process::exit(1);
    }
}
