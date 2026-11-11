//! Import des vraies données (feature `import`, lancé par `just seed`).
//!
//! Sources :
//! - Leaguepedia (lol.fandom.com, tables Cargo) : ligues, tournois, effectifs,
//!   joueurs, contrats, stats pro 2025 ;
//! - Liquipedia (liquipedia.net, API MediaWiki) : photos des joueurs et logos des clubs ;
//! - Data Dragon (Riot) : champions, objets, sorts d'invocateur du patch de départ.
//!
//! Les réponses brutes sont gardées dans `data/raw/` : relancer l'import
//! ne refait pas les requêtes (supprime le dossier pour tout retélécharger).

pub mod ddragon;
pub mod http;
pub mod leaguepedia;
pub mod liquipedia;

use std::path::{Path, PathBuf};

use rusqlite::{params, Connection};
use serde::Deserialize;

use crate::schema;
use http::Fetcher;

pub type Result<T> = std::result::Result<T, Box<dyn std::error::Error>>;

/// Patch Data Dragon du début de saison 2026 (patch 26.1, 8 janvier 2026).
pub const DDRAGON_VERSION: &str = "16.1.1";

/// Ligues dont on télécharge les logos et les photos (taille de la base livrée).
pub const IMAGE_LEAGUES: &[&str] = &["LEC"];

#[derive(Debug, Clone, Deserialize)]
pub struct LeagueConfig {
    pub id: String,
    pub name: String,
    pub tier: u8,
}

#[derive(Debug, Deserialize)]
struct LeaguesFile {
    league: Vec<LeagueConfig>,
}

pub fn read_leagues(path: &Path) -> Result<Vec<LeagueConfig>> {
    let file: LeaguesFile = toml::from_str(&std::fs::read_to_string(path)?)?;
    Ok(file.league)
}

pub struct Options {
    /// Racine du dépôt.
    pub root: PathBuf,
    /// Base produite.
    pub out: PathBuf,
}

/// Fabrique la base de départ de zéro.
pub fn run(opts: &Options) -> Result<()> {
    let leagues = read_leagues(&opts.root.join("data/leagues.toml"))?;
    let images_dir = opts.out.parent().unwrap_or(Path::new(".")).join("public");
    let fetch = Fetcher::new(opts.root.join("data/raw"));

    let tmp = opts.out.with_extension("sqlite.tmp");
    let _ = std::fs::remove_file(&tmp);
    let mut conn = Connection::open(&tmp)?;
    schema::create(&conn)?;
    let tx = conn.transaction()?;

    eprintln!("Data Dragon {DDRAGON_VERSION}…");
    let champs = ddragon::import(&fetch, &tx, DDRAGON_VERSION, &images_dir)?;

    eprintln!("Leaguepedia…");
    let summary = leaguepedia::import(&fetch, &tx, &leagues, &champs)?;

    eprintln!("Liquipedia (photos et logos)…");
    let slow = Fetcher::with_delay(
        opts.root.join("data/raw"),
        std::time::Duration::from_secs(2),
    );
    let images = liquipedia::import_images(&slow, &tx, IMAGE_LEAGUES, &images_dir)?;

    for (k, v) in [
        ("schema_version", schema::SCHEMA_VERSION.to_string()),
        ("ddragon_version", DDRAGON_VERSION.to_string()),
        ("roster_date", "2026-01-05".to_string()),
        ("stats_season", "2025".to_string()),
        (
            "sources",
            "Leaguepedia (lol.fandom.com, CC BY-SA 3.0) ; photos et logos : Liquipedia \
             (liquipedia.net, CC BY-SA 3.0) ; Data Dragon (Riot Games)"
                .to_string(),
        ),
    ] {
        tx.execute(
            "INSERT INTO meta (key, value) VALUES (?1, ?2)",
            params![k, v],
        )?;
    }
    tx.commit()?;
    conn.execute_batch("VACUUM")?;
    drop(conn);
    std::fs::rename(&tmp, &opts.out)?;

    let preview = images_dir.join("apercu.json");
    write_preview(&opts.out, &preview)?;

    eprintln!("{summary}, {images}");
    eprintln!("Base écrite : {}", opts.out.display());
    Ok(())
}

/// Extrait de la base pour l'interface hors Tauri (`just dev-web`, démos) :
/// les ligues, et les clubs et effectifs des ligues de `IMAGE_LEAGUES`.
/// Produit avec les mêmes fonctions de lecture que l'application.
pub fn write_preview(db_path: &Path, dest: &Path) -> Result<()> {
    let db = crate::Db::open_read_only(db_path)?;
    let mut teams = Vec::new();
    let mut rosters = serde_json::Map::new();
    for league in IMAGE_LEAGUES {
        for team in db.teams(league)? {
            rosters.insert(team.id.clone(), serde_json::to_value(db.roster(&team.id)?)?);
            teams.push(team);
        }
    }
    let json = serde_json::json!({
        "leagues": db.leagues()?,
        "teams": teams,
        "rosters": rosters,
    });
    std::fs::write(dest, serde_json::to_string(&json)?)?;
    Ok(())
}
