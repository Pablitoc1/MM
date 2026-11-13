//! Ce que le moteur reçoit pour chaque joueur : ses attributs et les stats de son champion.

/// Les 15 attributs de la note 007, dans le même ordre que `mm_data::ratings::Attr`.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Attr {
    Mechanics,
    Laning,
    Farm,
    Teamfight,
    Skirmish,
    MapReading,
    Decision,
    Vision,
    ChampionPool,
    Shotcalling,
    Communication,
    Composure,
    Consistency,
    BigGames,
    Professionalism,
}

/// Notes sur 20. Un joueur moyen de LEC vaut 15, un écart-type 2 points (note 007).
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Attributes(pub [f64; 15]);

pub const LEC_AVERAGE: f64 = 15.0;
pub const ONE_SD: f64 = 2.0;

impl Default for Attributes {
    /// Notes provisoires : tout le monde à la moyenne LEC, en attendant les vraies notes (M2).
    fn default() -> Self {
        Attributes([LEC_AVERAGE; 15])
    }
}

impl Attributes {
    pub fn get(&self, a: Attr) -> f64 {
        self.0[a as usize]
    }

    /// Écart à la moyenne LEC, en écarts-types.
    pub fn z(&self, a: Attr) -> f64 {
        (self.get(a) - LEC_AVERAGE) / ONE_SD
    }
}

/// Stats de base d'un champion (Data Dragon, `champion.json` → `stats`).
#[derive(Debug, Clone, PartialEq)]
pub struct ChampionStats {
    /// Clé Data Dragon, ex. « Ahri ».
    pub id: String,
    pub hp: f64,
    pub hp_per_level: f64,
    pub ad: f64,
    pub ad_per_level: f64,
    pub attack_speed: f64,
    /// Croissance de la vitesse d'attaque, en % par niveau.
    pub attack_speed_per_level: f64,
    pub attack_range: f64,
    pub move_speed: f64,
    /// Mana (ou énergie) de base ; 0 pour un champion sans ressource.
    pub mp: f64,
    pub mp_per_level: f64,
    pub armor: f64,
    pub armor_per_level: f64,
    pub magic_resist: f64,
    pub magic_resist_per_level: f64,
    /// Régénération de PV et de mana, par tranche de 5 s (comme Data Dragon).
    pub hp_regen: f64,
    pub hp_regen_per_level: f64,
    pub mp_regen: f64,
    pub mp_regen_per_level: f64,
}

impl ChampionStats {
    pub fn is_ranged(&self) -> bool {
        self.attack_range >= 300.0
    }
}
