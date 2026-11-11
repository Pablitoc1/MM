//! Les sorts d'un champion, tels que le moteur les utilise (note 011).
//!
//! Les chiffres viennent des fichiers du jeu du patch 26.1 (CommunityDragon) : valeurs par rang,
//! ratios, temps de recharge, coûts, portées. Le format est produit par l'import (`just seed`)
//! et rangé dans la table `champion_kits` de la base.

use serde::{Deserialize, Serialize};

/// Statistique sur laquelle porte un ratio.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Stat {
    AbilityPower,
    Armor,
    AttackDamage,
    AttackSpeed,
    MagicResist,
    MoveSpeed,
    CritChance,
    CritDamage,
    Health,
    Lethality,
    Mana,
    /// Statistique que le moteur ne suit pas : le ratio vaut 0.
    Other,
}

/// Partie de la statistique : totale, de base (niveau) ou bonus (objets).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum StatPart {
    Total,
    Base,
    Bonus,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Ratio {
    pub stat: Stat,
    pub part: StatPart,
    /// Coefficient à chaque rang du sort (0,5 = 50 %).
    pub coef: Vec<f64>,
}

/// Une valeur de sort : base par rang, plus un terme qui dépend du niveau du champion, plus des ratios.
#[derive(Debug, Clone, PartialEq, Default, Serialize, Deserialize)]
pub struct Formula {
    pub base: Vec<f64>,
    /// Ajout selon le niveau du champion (18 valeurs), s'il y en a un.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub by_level: Option<Vec<f64>>,
    #[serde(default)]
    pub ratios: Vec<Ratio>,
}

/// Statistiques d'un champion à un instant, pour évaluer une formule.
#[derive(Debug, Clone, Copy, PartialEq, Default)]
pub struct StatBlock {
    pub ability_power: f64,
    pub attack_damage: f64,
    pub base_attack_damage: f64,
    pub armor: f64,
    pub base_armor: f64,
    pub magic_resist: f64,
    pub base_magic_resist: f64,
    pub health: f64,
    pub base_health: f64,
    pub attack_speed: f64,
    pub move_speed: f64,
    pub crit_chance: f64,
    pub lethality: f64,
    pub mana: f64,
}

impl StatBlock {
    fn value(&self, stat: Stat, part: StatPart) -> f64 {
        let (total, base) = match stat {
            Stat::AbilityPower => (self.ability_power, 0.0),
            Stat::AttackDamage => (self.attack_damage, self.base_attack_damage),
            Stat::Armor => (self.armor, self.base_armor),
            Stat::MagicResist => (self.magic_resist, self.base_magic_resist),
            Stat::Health => (self.health, self.base_health),
            Stat::AttackSpeed => (self.attack_speed, 0.0),
            Stat::MoveSpeed => (self.move_speed, 0.0),
            Stat::CritChance => (self.crit_chance, 0.0),
            Stat::Lethality => (self.lethality, 0.0),
            Stat::Mana => (self.mana, 0.0),
            Stat::CritDamage | Stat::Other => (0.0, 0.0),
        };
        match part {
            StatPart::Total => total,
            StatPart::Base => base,
            StatPart::Bonus => total - base,
        }
    }
}

/// Valeur au rang `rank` (1 = premier rang) ; au-delà du dernier rang connu, garde le dernier.
fn at(values: &[f64], rank: usize) -> f64 {
    if values.is_empty() {
        return 0.0;
    }
    values[rank.clamp(1, values.len()) - 1]
}

impl Formula {
    /// Valeur de la formule pour un sort de rang `rank` (1 à 5) lancé par un champion de niveau `level`.
    pub fn eval(&self, rank: usize, level: u32, stats: &StatBlock) -> f64 {
        let mut v = at(&self.base, rank);
        if let Some(by_level) = &self.by_level {
            v += at(by_level, level as usize);
        }
        for r in &self.ratios {
            v += at(&r.coef, rank) * stats.value(r.stat, r.part);
        }
        v
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum DamageType {
    Physical,
    Magic,
    True,
}

/// Contrôles. `Slow` porte un pourcentage de ralentissement.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum CcKind {
    Stun,
    Root,
    Knockup,
    Charm,
    Fear,
    Taunt,
    Silence,
    Sleep,
    Suppress,
    Ground,
    Blind,
    Pull,
    Slow,
}

impl CcKind {
    /// Le contrôle empêche la cible d'agir (attaquer, lancer un sort).
    pub fn disables(self) -> bool {
        !matches!(
            self,
            CcKind::Root | CcKind::Ground | CcKind::Blind | CcKind::Slow
        )
    }

    /// Le contrôle empêche la cible de bouger.
    pub fn immobilizes(self) -> bool {
        !matches!(self, CcKind::Silence | CcKind::Blind | CcKind::Slow)
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Cc {
    pub kind: CcKind,
    /// Durée à chaque rang, en secondes.
    pub duration: Vec<f64>,
    /// Ralentissement à chaque rang (0,3 = 30 %), pour `Slow` seulement.
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub amount: Vec<f64>,
}

/// Comment le sort vise.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Targeting {
    /// Sur une cible : touche toujours si elle est à portée.
    Unit,
    /// Projectile ou ligne : peut être esquivé.
    Skillshot,
    /// Zone au sol ou autour du lanceur.
    Area,
    /// Sur soi (bouclier, vitesse, renforcement).
    SelfCast,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Spell {
    /// « Q », « W », « E » ou « R ».
    pub slot: String,
    /// Nom interne du sort dans les fichiers du jeu.
    pub name: String,
    pub cooldown: Vec<f64>,
    pub cost: Vec<f64>,
    pub range: f64,
    pub radius: f64,
    pub width: f64,
    pub missile_speed: f64,
    pub cast_time: f64,
    pub targeting: Targeting,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub damage: Option<Formula>,
    /// Dégâts en part des PV max de la cible (0,08 = 8 %), en plus de `damage`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub max_health_damage: Option<Formula>,
    pub damage_type: DamageType,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub heal: Option<Formula>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub shield: Option<Formula>,
    #[serde(default)]
    pub cc: Vec<Cc>,
    /// D'où vient chaque partie : « cdragon 16.1 », ou « meraki » pour un complément.
    pub source: String,
}

impl Spell {
    /// Nombre de rangs (5, ou 3 pour l'ultime).
    pub fn ranks(&self) -> usize {
        if self.slot == "R" {
            3
        } else {
            5
        }
    }

    pub fn cooldown_at(&self, rank: usize) -> f64 {
        at(&self.cooldown, rank)
    }

    pub fn cost_at(&self, rank: usize) -> f64 {
        at(&self.cost, rank)
    }

    pub fn cc_duration(&self, cc: &Cc, rank: usize) -> f64 {
        at(&cc.duration, rank)
    }
}

/// Les quatre sorts d'un champion.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Kit {
    pub champion: String,
    pub spells: Vec<Spell>,
}

/// Dégâts après armure ou résistance magique (formule de Riot : 100 / (100 + résistance)).
pub fn mitigate(raw: f64, resist: f64) -> f64 {
    if resist >= 0.0 {
        raw * 100.0 / (100.0 + resist)
    } else {
        raw * (2.0 - 100.0 / (100.0 - resist))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn ahri_q() -> Formula {
        Formula {
            base: vec![40.0, 65.0, 90.0, 115.0, 140.0],
            by_level: None,
            ratios: vec![Ratio {
                stat: Stat::AbilityPower,
                part: StatPart::Total,
                coef: vec![0.5; 5],
            }],
        }
    }

    #[test]
    fn formule_par_rang_et_ratio() {
        let stats = StatBlock {
            ability_power: 100.0,
            ..Default::default()
        };
        assert_eq!(ahri_q().eval(1, 1, &stats), 90.0);
        assert_eq!(ahri_q().eval(5, 9, &stats), 190.0);
        // Rang hors bornes : on garde la dernière valeur.
        assert_eq!(ahri_q().eval(7, 9, &stats), 190.0);
    }

    #[test]
    fn ratio_sur_les_stats_bonus() {
        let f = Formula {
            base: vec![10.0],
            by_level: Some((1..=18).map(f64::from).collect()),
            ratios: vec![Ratio {
                stat: Stat::AttackDamage,
                part: StatPart::Bonus,
                coef: vec![1.0],
            }],
        };
        let stats = StatBlock {
            attack_damage: 150.0,
            base_attack_damage: 100.0,
            ..Default::default()
        };
        assert_eq!(f.eval(1, 6, &stats), 10.0 + 6.0 + 50.0);
    }

    #[test]
    fn reduction_des_degats() {
        assert_eq!(mitigate(200.0, 100.0), 100.0);
        assert_eq!(mitigate(200.0, 0.0), 200.0);
        assert!((mitigate(100.0, -100.0) - 150.0).abs() < 1e-9);
    }

    #[test]
    fn controles() {
        assert!(CcKind::Stun.disables() && CcKind::Stun.immobilizes());
        assert!(!CcKind::Root.disables() && CcKind::Root.immobilizes());
        assert!(CcKind::Silence.disables() && !CcKind::Silence.immobilizes());
    }
}
