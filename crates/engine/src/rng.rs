//! Générateur pseudo-aléatoire déterministe du moteur.
//!
//! On utilise SplitMix64 : rapide, sans dépendance, et identique sur
//! toutes les plateformes (Windows, Mac, Linux). Tout tirage aléatoire
//! du moteur doit passer par ce type, jamais par une source système.

/// Générateur déterministe, initialisé par une graine.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SimRng {
    state: u64,
}

impl SimRng {
    /// Crée un générateur à partir d'une graine.
    pub fn new(seed: u64) -> Self {
        Self { state: seed }
    }

    /// Prochain entier 64 bits.
    pub fn next_u64(&mut self) -> u64 {
        self.state = self.state.wrapping_add(0x9E37_79B9_7F4A_7C15);
        let mut z = self.state;
        z = (z ^ (z >> 30)).wrapping_mul(0xBF58_476D_1CE4_E5B9);
        z = (z ^ (z >> 27)).wrapping_mul(0x94D0_49BB_1331_11EB);
        z ^ (z >> 31)
    }

    /// Flottant uniforme dans [0, 1).
    pub fn next_f64(&mut self) -> f64 {
        // 53 bits de mantisse.
        (self.next_u64() >> 11) as f64 * (1.0 / (1u64 << 53) as f64)
    }

    /// Vrai avec la probabilité `p` (bornée à [0, 1]).
    pub fn chance(&mut self, p: f64) -> bool {
        self.next_f64() < p.clamp(0.0, 1.0)
    }

    /// Crée un sous-générateur indépendant (par joueur, par partie...).
    pub fn fork(&mut self) -> SimRng {
        SimRng::new(self.next_u64())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn meme_graine_meme_suite() {
        let mut a = SimRng::new(42);
        let mut b = SimRng::new(42);
        for _ in 0..1000 {
            assert_eq!(a.next_u64(), b.next_u64());
        }
    }

    #[test]
    fn graines_differentes_suites_differentes() {
        let mut a = SimRng::new(1);
        let mut b = SimRng::new(2);
        assert_ne!(a.next_u64(), b.next_u64());
    }

    #[test]
    fn valeurs_de_reference_stables() {
        // Valeurs figées : si ce test casse, toutes les parties sauvegardées
        // changeraient. Ne jamais modifier sans note de décision.
        let mut r = SimRng::new(0);
        assert_eq!(r.next_u64(), 0xE220_A839_7B1D_CDAF);
        assert_eq!(r.next_u64(), 0x6E78_9E6A_A1B9_65F4);
    }

    #[test]
    fn flottants_dans_l_intervalle() {
        let mut r = SimRng::new(7);
        for _ in 0..10_000 {
            let x = r.next_f64();
            assert!((0.0..1.0).contains(&x));
        }
    }

    #[test]
    fn chance_respecte_les_bornes() {
        let mut r = SimRng::new(3);
        assert!(!r.chance(0.0));
        assert!(r.chance(1.0));
        assert!(!r.chance(-5.0));
    }
}
