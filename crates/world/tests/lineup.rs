//! La draft change le match : le moteur joue les champions choisis.

use std::path::PathBuf;

use mm_data::Db;
use mm_world::draft::Pick;
use mm_world::lineup::{drafted_match, lec_match};
use mm_world::mm_engine::Role;

fn db() -> Db {
    let path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../data/seed/world.sqlite");
    Db::open_read_only(&path).expect("data/seed/world.sqlite manque : lance `just seed`")
}

#[test]
fn le_moteur_joue_les_champions_de_la_draft() {
    let db = db();
    let base = lec_match(&db, "KC", "G2", 1, 1.0).unwrap();
    let pool = [
        ["Renekton", "Sejuani", "Orianna", "Jinx", "Nautilus"],
        ["KSante", "MonkeyKing", "Taliyah", "Varus", "Braum"],
    ];
    let mut ids = Vec::new();
    let picks: Vec<Vec<Pick>> = base
        .teams
        .iter()
        .zip(pool)
        .map(|(team, champs)| {
            team.players
                .iter()
                .zip(champs)
                .map(|(p, c)| {
                    let roster_id = db
                        .teams("LEC")
                        .unwrap()
                        .into_iter()
                        .find(|t| t.id == team.name)
                        .map(|t| t.id)
                        .unwrap();
                    let person = db
                        .roster(&roster_id)
                        .unwrap()
                        .into_iter()
                        .find(|m| m.handle == p.name)
                        .unwrap()
                        .person_id;
                    Pick {
                        role: p.role,
                        person_id: person,
                        champion: c.to_string(),
                    }
                })
                .collect()
        })
        .collect();
    for t in &base.teams {
        ids.push(t.name.clone());
    }
    let s = drafted_match(
        &db,
        "KC",
        "G2",
        Some((&ids[0], &picks[0], &ids[1], &picks[1])),
        1,
        1.0,
    )
    .unwrap();
    let champs: Vec<&str> = s.teams[0]
        .players
        .iter()
        .map(|p| p.champion.id.as_str())
        .collect();
    assert_eq!(champs, pool[0]);
    assert_eq!(s.teams[1].players[2].champion.id, "Taliyah");
    assert_eq!(s.teams[0].players[3].role, Role::Bot);
    assert!(s
        .teams
        .iter()
        .all(|t| t.players.iter().all(|p| p.kit.is_some())));
    // Les mêmes joueurs qu'avant la draft.
    assert_eq!(s.teams[0].players[0].name, base.teams[0].players[0].name);

    // Une draft entre d'autres clubs est ignorée.
    let other = drafted_match(
        &db,
        "KC",
        "G2",
        Some(("Autre", &picks[0], "Club", &picks[1])),
        1,
        1.0,
    )
    .unwrap();
    assert_eq!(
        other.teams[0].players[0].champion.id,
        base.teams[0].players[0].champion.id
    );
}
