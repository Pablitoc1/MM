//! La draft sur la vraie base livrée (`data/seed/world.sqlite`).

use std::path::PathBuf;

use mm_data::Db;
use mm_world::draft::{analyse, DraftTeam, Knowledge, Role};

fn db() -> Db {
    let path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../data/seed/world.sqlite");
    Db::open_read_only(&path).expect("data/seed/world.sqlite manque : lance `just seed`")
}

#[test]
fn meta_du_debut_de_saison() {
    let db = db();
    let k = Knowledge::load(&db, "2026-01-05").unwrap();
    assert_eq!(k.patch, "26.1");
    assert!(k.champs.len() >= 170, "{} champions", k.champs.len());
    let tier_a = k.champs.values().filter(|c| c.tier == Some('A')).count();
    assert_eq!(tier_a, 12);
    // Aucun duel connu avant le premier match de 2026 n'est de l'avenir.
    let later = Knowledge::load(&db, "2026-06-01").unwrap();
    assert_ne!(later.patch, "26.1");
    assert!(later.matchups.len() > k.matchups.len());
}

#[test]
fn chaque_club_lec_peut_drafter() {
    let db = db();
    for team in db.teams("LEC").unwrap() {
        let t = DraftTeam::load(&db, &team.id).unwrap();
        assert_eq!(t.players.len(), 5, "{} : {:?}", team.id, t.players);
        for (p, role) in t.players.iter().zip(Role::ALL) {
            assert_eq!(p.role, role);
            assert!(!p.pool.is_empty(), "{} sans champions joués", p.handle);
        }
    }
}

#[test]
fn analyse_d_une_compo() {
    let k = Knowledge::load(&db(), "2026-01-17").unwrap();
    let a = analyse(&["KSante", "XinZhao", "Orianna", "Varus", "Rakan"], &k);
    assert!(a.physical > 0.3 && a.physical < 0.8, "{a:?}");
    assert!(a.styles[0] > 0.6, "engage : {a:?}");
}
