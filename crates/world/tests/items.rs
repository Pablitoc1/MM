//! Contrôle de chaque objet (fiche M4) sur la base livrée, et des builds types.

use std::path::PathBuf;

use mm_data::Db;
use mm_engine::item::Item;
use mm_engine::Role;
use mm_world::build::{archetype, build, items, Archetype};
use mm_world::lineup::kit;

fn db() -> Db {
    let path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../data/seed/world.sqlite");
    Db::open_read_only(&path).expect("data/seed/world.sqlite manque : lance `just seed`")
}

fn all_items(db: &Db) -> Vec<Item> {
    items(db, &db.item_ids().unwrap()).unwrap()
}

#[test]
fn chaque_objet_est_lisible() {
    let db = db();
    let all = all_items(&db);
    assert!(all.len() >= 200, "{} objets", all.len());
    let mut with_stats = 0;
    for it in &all {
        let s = &it.stats;
        assert!(
            it.gold > 0.0 && it.gold <= 5000.0,
            "{} : {} or",
            it.name,
            it.gold
        );
        assert!(!it.name.is_empty());
        let values = [
            s.attack_damage,
            s.ability_power,
            s.health,
            s.mana,
            s.armor,
            s.magic_resist,
            s.attack_speed,
            s.crit_chance,
            s.crit_damage,
            s.ability_haste,
            s.move_speed,
            s.move_speed_pct,
            s.armor_pen_pct,
            s.lethality,
            s.magic_pen,
            s.magic_pen_pct,
            s.life_steal,
        ];
        assert!(
            values.iter().all(|v| v.is_finite() && *v >= 0.0),
            "{} : {s:?}",
            it.name
        );
        // Bornes du jeu : aucun objet ne donne plus que ça seul.
        assert!(
            s.attack_damage <= 100.0 && s.ability_power <= 150.0,
            "{}",
            it.name
        );
        assert!(
            s.health <= 1200.0 && s.armor <= 100.0 && s.magic_resist <= 100.0,
            "{}",
            it.name
        );
        assert!(s.attack_speed <= 1.0 && s.crit_chance <= 0.5, "{}", it.name);
        assert!(
            s.armor_pen_pct <= 0.4 && s.magic_pen_pct <= 0.45,
            "{}",
            it.name
        );
        if values.iter().any(|v| *v > 0.0) {
            with_stats += 1;
        }
    }
    // Les autres sont des consommables, des balises ou des objets à effet seul.
    assert!(
        with_stats * 100 / all.len() >= 70,
        "{with_stats} sur {}",
        all.len()
    );
}

/// Chiffres relevés à la main dans les fichiers du jeu du patch 26.1.
#[test]
fn objets_de_reference() {
    let db = db();
    let get = |id| items(&db, &[id]).unwrap().pop().unwrap();
    let rabadon = get(3089);
    assert_eq!(rabadon.gold, 3500.0);
    assert_eq!(rabadon.stats.ability_power, 130.0);
    let ie = get(3031);
    assert_eq!(ie.stats.attack_damage, 75.0);
    assert_eq!(ie.stats.crit_chance, 0.25);
    assert_eq!(ie.stats.crit_damage, 0.3);
    assert_eq!(get(3135).stats.magic_pen_pct, 0.4);
    assert_eq!(get(3142).stats.lethality, 18.0);
    assert_eq!(get(3020).stats.magic_pen, 12.0);
    let thornmail = get(3075);
    assert_eq!(
        (thornmail.stats.health, thornmail.stats.armor),
        (150.0, 75.0)
    );
}

#[test]
fn chaque_build_type_existe() {
    let db = db();
    for a in [
        Archetype::Marksman,
        Archetype::Mage,
        Archetype::AdAssassin,
        Archetype::Fighter,
        Archetype::Tank,
        Archetype::SupportTank,
        Archetype::Enchanter,
    ] {
        let got = items(&db, a.items()).unwrap();
        assert_eq!(got.len(), a.items().len(), "{a:?} : un objet manque");
    }
}

#[test]
fn profils_des_champions() {
    let db = db();
    let cases = [
        ("Ahri", Role::Mid, Archetype::Mage),
        ("Jinx", Role::Bot, Archetype::Marksman),
        ("Zed", Role::Mid, Archetype::AdAssassin),
        ("Ornn", Role::Top, Archetype::Tank),
        ("Aatrox", Role::Top, Archetype::Fighter),
        ("Nautilus", Role::Support, Archetype::SupportTank),
        ("Lulu", Role::Support, Archetype::Enchanter),
    ];
    for (id, role, want) in cases {
        let k = kit(&db, id).unwrap();
        let tags: Vec<String> =
            serde_json::from_str(&db.champion_tags(id).unwrap().unwrap()).unwrap();
        assert_eq!(archetype(&tags, role, k.as_ref()), want, "{id}");
        assert!(!build(&db, id, role, k.as_ref()).unwrap().is_empty());
    }
}
