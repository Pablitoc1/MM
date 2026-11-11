//! Règles chiffrées du jeu (timers, sbires, or, XP).
//!
//! Source : wiki officiel de League of Legends (saison 2025), relevé de mémoire car le
//! site n'est pas joignable depuis l'environnement de construction. Tout est donc
//! marqué `// estimé` et contrôlé par le rapport de calibrage contre Oracle's Elixir
//! (`just sim`). À remplacer par les valeurs exactes du patch dès que la source est accessible.

/// Durée d'un pas de simulation hors combat, en secondes.
pub const TICK: f64 = 1.0;

// ---- Sbires ----
pub const WAVE_FIRST_SPAWN: f64 = 30.0; // estimé (wiki : 0:30 depuis la saison 2024)
pub const WAVE_INTERVAL: f64 = 30.0; // estimé (wiki)
pub const MINION_SPEED: f64 = 325.0; // estimé (wiki)
/// Distance entre les fronts de deux vagues adverses à laquelle elles s'arrêtent et se battent.
pub const WAVE_CONTACT: f64 = 500.0; // estimé (portée des casters 550)
/// Portée d'une tour (750) plus le rayon d'un sbire.
pub const TURRET_RANGE: f64 = 800.0; // estimé (wiki : 750)
pub const TURRET_ATTACK_SPEED: f64 = 0.833; // estimé (wiki)

/// Vague qui porte un sbire canon : toutes les 3 vagues avant 15:00, toutes les 2 avant 25:00, puis toutes.
pub fn has_cannon(wave_number: u32, t: f64) -> bool {
    let every = if t < 900.0 {
        3
    } else if t < 1500.0 {
        2
    } else {
        1
    }; // estimé (wiki)
    wave_number.is_multiple_of(every)
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum MinionKind {
    Melee,
    Caster,
    Cannon,
}

pub struct MinionStats {
    pub hp: f64,
    /// Points de vie gagnés à chaque amélioration (toutes les 90 s).
    pub hp_per_upgrade: f64,
    pub ad: f64,
    pub attack_speed: f64,
    pub gold: f64,
    pub xp: f64,
    /// Part des PV max retirée par un tir de tour.
    pub turret_shot: f64,
}

pub fn minion(kind: MinionKind) -> MinionStats {
    // estimé (wiki, saison 2025)
    match kind {
        MinionKind::Melee => MinionStats {
            hp: 477.0,
            hp_per_upgrade: 22.0,
            ad: 12.0,
            attack_speed: 1.25,
            gold: 21.0,
            xp: 60.45,
            turret_shot: 0.45,
        },
        MinionKind::Caster => MinionStats {
            hp: 296.0,
            hp_per_upgrade: 6.5,
            ad: 23.6,
            attack_speed: 0.667,
            gold: 14.0,
            xp: 29.76,
            turret_shot: 0.70,
        },
        MinionKind::Cannon => MinionStats {
            hp: 912.0,
            hp_per_upgrade: 63.0,
            ad: 40.5,
            attack_speed: 1.0,
            gold: 60.0,
            xp: 93.6,
            turret_shot: 0.14,
        },
    }
}

pub fn minion_upgrades(t: f64) -> f64 {
    ((t - WAVE_FIRST_SPAWN) / 90.0).floor().max(0.0) // estimé
}

/// Les sbires infligent moins de dégâts aux bâtiments.
pub const MINION_VS_STRUCTURE: f64 = 0.5; // estimé

// ---- Champions ----
pub const STARTING_GOLD: f64 = 500.0; // estimé (wiki)
pub const PASSIVE_GOLD_START: f64 = 65.0; // estimé (wiki : 1:05)
pub const PASSIVE_GOLD_PER_SEC: f64 = 2.04; // estimé (wiki : 20,4 toutes les 10 s)
/// Rayon dans lequel un champion reçoit l'XP d'un sbire ennemi qui meurt.
pub const XP_RANGE: f64 = 1600.0; // estimé (wiki : 1 600)
/// Temps de canalisation du retour à la base.
pub const RECALL_CHANNEL: f64 = 8.0; // estimé (wiki)

/// XP totale pour atteindre chaque niveau (index 0 = niveau 1).
pub fn level_for_xp(xp: f64) -> u32 {
    // estimé (wiki) : 280 pour le niveau 2, puis +100 par niveau.
    let mut need = 280.0;
    let mut total = 0.0;
    let mut level = 1;
    while level < 18 {
        total += need;
        if xp < total {
            break;
        }
        level += 1;
        need += 100.0;
    }
    level
}

/// Valeur d'une stat au niveau `level` (formule de croissance de Riot).
pub fn stat_at_level(base: f64, per_level: f64, level: u32) -> f64 {
    let n = f64::from(level - 1);
    base + per_level * n * (0.7025 + 0.0175 * n)
}

// ---- Vision ----
pub const CHAMPION_SIGHT: f64 = 1350.0; // estimé (wiki)
pub const MINION_SIGHT: f64 = 1200.0; // estimé (wiki)
pub const TURRET_SIGHT: f64 = 1350.0; // estimé (wiki)
pub const WARD_SIGHT: f64 = 900.0; // estimé (wiki)
pub const WARD_LIFETIME: f64 = 105.0; // estimé (wiki : 90 à 120 s selon le niveau moyen)
pub const TRINKET_COOLDOWN: f64 = 180.0; // estimé (wiki : 210 à 120 s selon le niveau moyen)

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn niveaux() {
        assert_eq!(level_for_xp(0.0), 1);
        assert_eq!(level_for_xp(279.0), 1);
        assert_eq!(level_for_xp(280.0), 2);
        assert_eq!(level_for_xp(660.0), 3);
        assert_eq!(level_for_xp(1_000_000.0), 18);
    }

    #[test]
    fn croissance_des_stats() {
        assert_eq!(stat_at_level(53.0, 3.0, 1), 53.0);
        // Niveau 18 : base + croissance × 17 × (0,7025 + 0,0175 × 17) = base + 17 × croissance.
        assert!((stat_at_level(53.0, 3.0, 18) - (53.0 + 3.0 * 17.0)).abs() < 1e-9);
    }

    #[test]
    fn canons() {
        assert!(!has_cannon(1, 60.0) && has_cannon(3, 120.0));
        assert!(has_cannon(2, 1000.0) && has_cannon(5, 1600.0));
    }
}
