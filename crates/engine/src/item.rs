//! Objets du patch 26.1 (note 014) : leurs stats, lues dans les fichiers du jeu.
//! Les effets passifs et actifs ne sont pas encore simulés.

use serde::{Deserialize, Serialize};

/// Stats données par un objet (ou par plusieurs, additionnées).
#[derive(Debug, Clone, Copy, PartialEq, Default, Serialize, Deserialize)]
#[serde(default)]
pub struct ItemStats {
    pub attack_damage: f64,
    pub ability_power: f64,
    pub health: f64,
    pub mana: f64,
    pub armor: f64,
    pub magic_resist: f64,
    /// Vitesse d'attaque bonus (0,25 = +25 %).
    pub attack_speed: f64,
    /// Chance de coup critique (0,25 = 25 %).
    pub crit_chance: f64,
    /// Dégâts critiques en plus des 175 % de base.
    pub crit_damage: f64,
    pub ability_haste: f64,
    pub move_speed: f64,
    pub move_speed_pct: f64,
    pub armor_pen_pct: f64,
    /// Létalité : pénétration d'armure fixe.
    pub lethality: f64,
    pub magic_pen: f64,
    pub magic_pen_pct: f64,
    pub life_steal: f64,
}

impl ItemStats {
    /// `self + other × k` (k < 1 : objet acheté en partie, ses composants).
    pub fn add_scaled(&mut self, o: &ItemStats, k: f64) {
        self.attack_damage += o.attack_damage * k;
        self.ability_power += o.ability_power * k;
        self.health += o.health * k;
        self.mana += o.mana * k;
        self.armor += o.armor * k;
        self.magic_resist += o.magic_resist * k;
        self.attack_speed += o.attack_speed * k;
        self.crit_chance += o.crit_chance * k;
        self.crit_damage += o.crit_damage * k;
        self.ability_haste += o.ability_haste * k;
        self.move_speed += o.move_speed * k;
        self.move_speed_pct += o.move_speed_pct * k;
        self.armor_pen_pct += o.armor_pen_pct * k;
        self.lethality += o.lethality * k;
        self.magic_pen += o.magic_pen * k;
        self.magic_pen_pct += o.magic_pen_pct * k;
        self.life_steal += o.life_steal * k;
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Item {
    pub id: u32,
    pub name: String,
    /// Prix total (composants compris).
    pub gold: f64,
    pub stats: ItemStats,
}

/// Les objets d'un champion pendant la partie : ceux de son build, achetés dans l'ordre.
#[derive(Debug, Clone, Default)]
pub struct Inventory {
    pub build: Vec<Item>,
    /// Objets terminés.
    pub done: usize,
    /// Or déjà mis dans l'objet en cours (ses composants).
    pub progress: f64,
    pub stats: ItemStats,
}

impl Inventory {
    pub fn new(build: Vec<Item>) -> Self {
        Inventory {
            build,
            ..Default::default()
        }
    }

    /// Dépense l'or à la boutique ; renvoie l'or restant. Un objet en partie acheté donne ses stats
    /// au prorata de l'or investi (approximation de ses composants, `// estimé`).
    pub fn shop(&mut self, mut gold: f64) -> f64 {
        while let Some(item) = self.build.get(self.done) {
            let left = item.gold - self.progress;
            let spend = gold.min(left);
            if spend <= 0.0 {
                break;
            }
            self.stats.add_scaled(&item.stats, spend / item.gold);
            self.progress += spend;
            gold -= spend;
            if self.progress >= item.gold - 1e-9 {
                self.done += 1;
                self.progress = 0.0;
            } else {
                break;
            }
        }
        gold
    }

    /// Identifiants des objets terminés (pour la vue).
    pub fn ids(&self) -> Vec<u32> {
        self.build[..self.done].iter().map(|i| i.id).collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn item(id: u32, gold: f64, ad: f64) -> Item {
        Item {
            id,
            name: format!("Objet {id}"),
            gold,
            stats: ItemStats {
                attack_damage: ad,
                ..Default::default()
            },
        }
    }

    #[test]
    fn achats_dans_l_ordre_avec_composants() {
        let mut inv = Inventory::new(vec![item(1, 3000.0, 60.0), item(2, 1000.0, 20.0)]);
        // 1 500 or : la moitié du premier objet.
        assert_eq!(inv.shop(1500.0), 0.0);
        assert!((inv.stats.attack_damage - 30.0).abs() < 1e-9);
        assert!(inv.ids().is_empty());
        // 2 000 or de plus : le premier est fini, le second à moitié.
        assert_eq!(inv.shop(2000.0), 0.0);
        assert_eq!(inv.ids(), vec![1]);
        assert!((inv.stats.attack_damage - 70.0).abs() < 1e-9);
        // Tout acheté : l'or reste.
        assert_eq!(inv.shop(900.0), 400.0);
        assert_eq!(inv.ids(), vec![1, 2]);
    }
}
