//! `just seed` : fabrique `data/seed/world.sqlite` à partir des vraies données.
//! `just seed-draft` (`--draft`) : refait seulement les données de la draft.
//! `just seed-kits` (`--kits`) : refait seulement les sorts des champions.

use std::path::PathBuf;

fn main() {
    let root = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../..");
    let root = root.canonicalize().unwrap_or(root);
    let out = root.join("data/seed/world.sqlite");
    if let Some(dir) = out.parent() {
        std::fs::create_dir_all(dir).expect("dossier data/seed");
    }
    let opts = mm_data::import::Options { root, out };
    let args: Vec<String> = std::env::args().collect();
    let res = if args.iter().any(|a| a == "--draft") {
        mm_data::import::run_draft_only(&opts)
    } else if args.iter().any(|a| a == "--kits") {
        mm_data::import::run_kits_only(&opts)
    } else {
        mm_data::import::run(&opts)
    };
    if let Err(e) = res {
        eprintln!("Import échoué : {e}");
        std::process::exit(1);
    }
}
