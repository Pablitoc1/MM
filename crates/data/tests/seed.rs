//! Contrôles de la fiche M1 sur la base livrée (`data/seed/world.sqlite`).

use std::path::PathBuf;

use mm_data::rusqlite::{Connection, OpenFlags};
use mm_data::Db;

fn seed_path() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../data/seed/world.sqlite")
}

fn count(conn: &Connection, sql: &str) -> i64 {
    conn.query_row(sql, [], |r| r.get(0)).unwrap()
}

#[test]
fn base_de_depart_complete() {
    let path = seed_path();
    let db = Db::open_read_only(&path).expect("data/seed/world.sqlite manque : lance `just seed`");
    let conn = Connection::open_with_flags(&path, OpenFlags::SQLITE_OPEN_READ_ONLY).unwrap();

    // Schéma à jour.
    let v: u32 = conn
        .pragma_query_value(None, "user_version", |r| r.get(0))
        .unwrap();
    assert_eq!(
        v,
        mm_data::SCHEMA_VERSION,
        "base à régénérer avec `just seed`"
    );

    // Toutes les ligues de data/leagues.toml, dans les trois tiers.
    let leagues = db.leagues().unwrap();
    for tier in 1..=3 {
        assert!(
            leagues.iter().any(|l| l.tier == tier),
            "aucune ligue de tier {tier}"
        );
    }
    for l in &leagues {
        assert!(l.team_count >= 4, "{} n'a que {} clubs", l.id, l.team_count);
    }

    // LEC : au moins les 10 clubs, chacun avec ses 5 postes.
    // Les images présentes doivent exister sur le disque (le serveur d'images du wiki
    // refuse pour l'instant l'import : voir docs/decisions/004-base-de-depart.md).
    let public = path.parent().unwrap().join("public");
    let lec = db.teams("LEC").unwrap();
    assert!(lec.len() >= 10, "LEC : {} clubs", lec.len());
    for team in &lec {
        if let Some(logo) = &team.logo_file {
            assert!(public.join(logo).exists(), "logo manquant : {logo}");
        }
        let roster = db.roster(&team.id).unwrap();
        for role in ["Top", "Jungle", "Mid", "Bot", "Support"] {
            assert!(
                roster.iter().any(|m| m.role == role),
                "{} sans {role}",
                team.id
            );
        }
        for photo in roster.iter().filter_map(|m| m.photo_file.as_ref()) {
            assert!(public.join(photo).exists(), "photo manquante : {photo}");
        }
    }

    // Aucun joueur LEC sans rôle ni club.
    let orphans = count(
        &conn,
        "SELECT COUNT(*) FROM roster r JOIN teams t ON t.id = r.team_id
         WHERE t.league_id = 'LEC' AND (r.role IS NULL OR r.role = '')",
    );
    assert_eq!(orphans, 0);
    assert_eq!(
        count(
            &conn,
            "SELECT COUNT(*) FROM roster WHERE team_id NOT IN (SELECT id FROM teams)"
        ),
        0
    );
    assert_eq!(
        count(
            &conn,
            "SELECT COUNT(*) FROM roster WHERE person_id NOT IN (SELECT id FROM people)"
        ),
        0
    );

    // Tous les champions du patch de départ.
    assert!(count(&conn, "SELECT COUNT(*) FROM champions") >= 170);
    assert!(count(&conn, "SELECT COUNT(*) FROM items") > 100);
    assert!(count(&conn, "SELECT COUNT(*) FROM summoner_spells") >= 9);

    // Les joueurs LEC ont presque tous des stats 2025.
    let lec_players = count(
        &conn,
        "SELECT COUNT(DISTINCT r.person_id) FROM roster r JOIN teams t ON t.id = r.team_id
         WHERE t.league_id = 'LEC' AND r.is_staff = 0",
    );
    let with_stats = count(
        &conn,
        "SELECT COUNT(DISTINCT r.person_id) FROM roster r JOIN teams t ON t.id = r.team_id
         JOIN player_stats_2025 s ON s.person_id = r.person_id
         WHERE t.league_id = 'LEC' AND r.is_staff = 0",
    );
    assert!(
        with_stats * 10 >= lec_players * 9,
        "{with_stats} / {lec_players} joueurs LEC avec stats"
    );
}
