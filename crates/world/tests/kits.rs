//! Contrôle de chaque sort de chaque champion (fiche M4) sur la base livrée.

use std::path::PathBuf;

use mm_data::Db;
use mm_engine::kit::{CcKind, DamageType, StatBlock, Targeting};
use mm_world::lineup::kit;

fn db() -> Db {
    let path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../data/seed/world.sqlite");
    Db::open_read_only(&path).expect("data/seed/world.sqlite manque : lance `just seed`")
}

#[test]
fn chaque_sort_de_chaque_champion_est_lisible() {
    let db = db();
    let ids = db.champion_ids().unwrap();
    assert!(ids.len() >= 170);
    let late = StatBlock {
        ability_power: 300.0,
        attack_damage: 250.0,
        base_attack_damage: 100.0,
        health: 3000.0,
        base_health: 2000.0,
        armor: 120.0,
        base_armor: 80.0,
        magic_resist: 80.0,
        base_magic_resist: 50.0,
        mana: 1500.0,
        ..Default::default()
    };
    let (mut spells, mut useful) = (0, 0);
    for id in &ids {
        let k = kit(&db, id)
            .unwrap()
            .unwrap_or_else(|| panic!("{id} : pas de sorts"));
        assert_eq!(k.spells.len(), 4, "{id}");
        for (s, slot) in k.spells.iter().zip(["Q", "W", "E", "R"]) {
            spells += 1;
            assert_eq!(s.slot, slot);
            assert_eq!(s.cooldown.len(), s.ranks(), "{id} {slot}");
            assert!(
                s.cooldown
                    .iter()
                    .all(|c| c.is_finite() && (0.0..=300.0).contains(c)),
                "{id} {slot} : recharge {:?}",
                s.cooldown
            );
            assert!((0.0..=25_000.0).contains(&s.range), "{id} {slot}");
            for f in [&s.damage, &s.heal, &s.shield, &s.max_health_damage]
                .into_iter()
                .flatten()
            {
                for rank in 1..=s.ranks() {
                    for level in [1, 9, 18] {
                        let v = f.eval(rank, level, &late);
                        assert!(v.is_finite(), "{id} {slot} rang {rank}");
                    }
                }
            }
            if let Some(d) = &s.damage {
                // Les plus gros sorts canalisés (Fiddlesticks R, Miss Fortune R) restent sous 6 000.
                let v = d.eval(s.ranks(), 18, &late);
                assert!((0.0..6_000.0).contains(&v), "{id} {slot} : {v} dégâts");
            }
            for cc in &s.cc {
                assert_eq!(cc.duration.len(), s.ranks(), "{id} {slot}");
                assert!(
                    cc.duration.iter().all(|d| (0.0..=10.0).contains(d)),
                    "{id} {slot} : {cc:?}"
                );
                if cc.kind == CcKind::Slow {
                    assert!(
                        cc.amount.iter().all(|a| (0.0..=1.0).contains(a)),
                        "{id} {slot} : {cc:?}"
                    );
                }
            }
            if s.damage.is_some()
                || s.max_health_damage.is_some()
                || !s.cc.is_empty()
                || s.heal.is_some()
                || s.shield.is_some()
            {
                useful += 1;
            }
        }
    }
    // Les autres sorts sont des déplacements ou des renforcements sans chiffre de combat direct.
    assert!(
        useful * 100 / spells >= 80,
        "{useful} sorts utiles sur {spells}"
    );
}

/// Chiffres relevés à la main dans les fichiers du jeu du patch 26.1.
#[test]
fn sorts_de_reference() {
    let db = db();
    let ap100 = StatBlock {
        ability_power: 100.0,
        ..Default::default()
    };

    let ahri = kit(&db, "Ahri").unwrap().unwrap();
    let q = &ahri.spells[0];
    assert_eq!(q.cost, vec![55.0, 65.0, 75.0, 85.0, 95.0]);
    assert_eq!(q.cooldown, vec![7.0; 5]);
    assert_eq!(q.range, 970.0);
    assert_eq!(q.targeting, Targeting::Skillshot);
    assert_eq!(q.damage_type, DamageType::Magic);
    assert_eq!(q.damage.as_ref().unwrap().eval(1, 1, &ap100), 90.0);
    let e = &ahri.spells[2];
    assert_eq!(e.cc[0].kind, CcKind::Charm);
    assert!((e.cc[0].duration[0] - 1.2).abs() < 1e-6);

    let lux = kit(&db, "Lux").unwrap().unwrap();
    assert_eq!(lux.spells[0].cooldown, vec![11.0, 10.5, 10.0, 9.5, 9.0]);
    assert!(lux.spells[0].cc.iter().any(|c| c.kind == CcKind::Root));

    let garen = kit(&db, "Garen").unwrap().unwrap();
    assert_eq!(garen.spells[0].damage_type, DamageType::Physical);
    assert_eq!(garen.spells[3].damage_type, DamageType::True);
}
