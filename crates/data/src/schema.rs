//! Schéma de la base. Une seule migration pour l'instant : la base de départ
//! est toujours reconstruite de zéro par `just seed`.

use rusqlite::Connection;

/// Version du schéma de la base. Augmente à chaque migration.
pub const SCHEMA_VERSION: u32 = 2;

const V1: &str = r#"
CREATE TABLE meta (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Ligues importées (liste choisie dans data/leagues.toml).
CREATE TABLE leagues (
    id            TEXT PRIMARY KEY,   -- LEC, LFL...
    name          TEXT NOT NULL,      -- nom Leaguepedia
    region        TEXT,
    tier          INTEGER NOT NULL CHECK (tier BETWEEN 1 AND 3),
    ref_tournament TEXT NOT NULL      -- tournoi Leaguepedia d'où vient l'effectif de départ
);

CREATE TABLE teams (
    id        TEXT PRIMARY KEY,       -- nom Leaguepedia
    short     TEXT,
    region    TEXT,
    league_id TEXT NOT NULL REFERENCES leagues(id),
    logo_file TEXT                    -- chemin relatif dans data/seed/images, ou NULL
);

-- Joueurs et staff.
CREATE TABLE people (
    id          TEXT PRIMARY KEY,     -- page Leaguepedia
    handle      TEXT NOT NULL,        -- pseudo
    real_name   TEXT,
    native_name TEXT,
    country     TEXT,
    birthdate   TEXT,                 -- AAAA-MM-JJ
    residency   TEXT,
    photo_file  TEXT
);

-- Effectif de départ (janvier 2026). role : Top, Jungle, Mid, Bot, Support, Coach.
CREATE TABLE roster (
    team_id   TEXT NOT NULL REFERENCES teams(id),
    person_id TEXT NOT NULL REFERENCES people(id),
    role      TEXT NOT NULL,
    is_staff  INTEGER NOT NULL DEFAULT 0,
    sort      INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (team_id, person_id, role)
);
CREATE INDEX roster_person ON roster(person_id);

-- Fin de contrat connue (Leaguepedia). NULL = inconnue.
CREATE TABLE contracts (
    person_id TEXT PRIMARY KEY REFERENCES people(id),
    end_date  TEXT
);

-- Stats pro 2025 par joueur et par tournoi (Leaguepedia, ScoreboardPlayers).
CREATE TABLE player_stats_2025 (
    person_id  TEXT NOT NULL,
    tournament TEXT NOT NULL,
    games      INTEGER NOT NULL,
    wins       INTEGER NOT NULL,
    kills      INTEGER NOT NULL,
    deaths     INTEGER NOT NULL,
    assists    INTEGER NOT NULL,
    cs         INTEGER NOT NULL,
    gold       INTEGER NOT NULL,
    damage     INTEGER NOT NULL,
    vision     INTEGER NOT NULL,
    minutes    REAL NOT NULL,
    PRIMARY KEY (person_id, tournament)
);

-- Champions joués en 2025, tous tournois confondus.
CREATE TABLE player_champions_2025 (
    person_id TEXT NOT NULL,
    champion  TEXT NOT NULL,          -- clé Data Dragon (ex. Kaisa), sinon nom Leaguepedia
    games     INTEGER NOT NULL,
    wins      INTEGER NOT NULL,
    PRIMARY KEY (person_id, champion)
);

-- Niveau des ligues, en écarts-types par rapport à la LEC (voir docs/decisions/007).
CREATE TABLE league_strength (
    league_id TEXT PRIMARY KEY,
    offset    REAL NOT NULL,
    source    TEXT NOT NULL
);

-- Notes calculées (M2). Niveau et potentiel sur 100 ; source : stats ou estimé.
CREATE TABLE player_ratings (
    person_id  TEXT PRIMARY KEY REFERENCES people(id),
    role       TEXT NOT NULL,
    games      INTEGER NOT NULL,          -- parties 2024-2025 prises en compte
    level      REAL NOT NULL,
    level_low  REAL NOT NULL,
    level_high REAL NOT NULL,
    potential  REAL NOT NULL,
    source     TEXT NOT NULL
);

-- Attributs sur 20, avec fourchette. estimated = pas mesuré par les stats.
CREATE TABLE player_attributes (
    person_id TEXT NOT NULL REFERENCES people(id),
    attr      TEXT NOT NULL,
    value     REAL NOT NULL,
    low       REAL NOT NULL,
    high      REAL NOT NULL,
    estimated INTEGER NOT NULL,
    PRIMARY KEY (person_id, attr)
);

-- Data Dragon (patch de départ). Les données brutes sont gardées en JSON :
-- le moteur les lira en M4.
CREATE TABLE champions (
    id     TEXT PRIMARY KEY,          -- clé Data Dragon (ex. Kaisa)
    key    INTEGER NOT NULL,
    name   TEXT NOT NULL,             -- nom affiché en français
    title  TEXT NOT NULL,
    tags   TEXT NOT NULL,             -- JSON
    data   TEXT NOT NULL              -- JSON complet (stats, sorts, passif)
);

CREATE TABLE items (
    id    INTEGER PRIMARY KEY,
    name  TEXT NOT NULL,
    gold  INTEGER NOT NULL,
    data  TEXT NOT NULL
);

CREATE TABLE summoner_spells (
    id    TEXT PRIMARY KEY,
    name  TEXT NOT NULL,
    data  TEXT NOT NULL
);
"#;

/// Crée toutes les tables dans une base vide.
pub fn create(conn: &Connection) -> rusqlite::Result<()> {
    conn.execute_batch(V1)?;
    conn.pragma_update(None, "user_version", SCHEMA_VERSION)?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn schema_se_cree_sur_une_base_vide() {
        let conn = Connection::open_in_memory().unwrap();
        create(&conn).unwrap();
        let v: u32 = conn
            .pragma_query_value(None, "user_version", |r| r.get(0))
            .unwrap();
        assert_eq!(v, SCHEMA_VERSION);
    }
}
