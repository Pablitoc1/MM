//! Styles des champions, part de dégâts physiques et analyse d'une composition.
//!
//! Les styles n'existent dans aucune source de données : listes écrites à la main
//! d'après le jeu pro récent. // estimé (méthode : rôle du champion en compétition)
//! Les champions absents d'une liste reçoivent une valeur moyenne selon leurs classes
//! Data Dragon.

use serde::Serialize;

use super::knowledge::Knowledge;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum Style {
    Engage,
    Poke,
    Peel,
    Split,
    Teamfight,
}

impl Style {
    pub const ALL: [Style; 5] = [
        Style::Engage,
        Style::Poke,
        Style::Peel,
        Style::Split,
        Style::Teamfight,
    ];

    /// Libellé de l'écran Draft.
    pub fn label(self) -> &'static str {
        ["Engage", "Poke", "Peel", "Split push", "Teamfight"][self as usize]
    }
}

// Listes estimées (voir l'en-tête du module).
const ENGAGE: &[&str] = &[
    "Alistar",
    "Amumu",
    "Ambessa",
    "Blitzcrank",
    "Diana",
    "Galio",
    "Gnar",
    "Gragas",
    "Hecarim",
    "JarvanIV",
    "Kennen",
    "KSante",
    "LeeSin",
    "Leona",
    "Lillia",
    "Malphite",
    "Maokai",
    "MonkeyKing",
    "Nautilus",
    "Neeko",
    "Nocturne",
    "Ornn",
    "Poppy",
    "Pyke",
    "Rakan",
    "Rammus",
    "Rell",
    "Sejuani",
    "Sion",
    "Skarner",
    "Thresh",
    "Vi",
    "Volibear",
    "XinZhao",
    "Yone",
    "Zac",
];
const POKE: &[&str] = &[
    "AurelionSol",
    "Caitlyn",
    "Corki",
    "Ezreal",
    "Hwei",
    "Jayce",
    "Jhin",
    "Karma",
    "Lux",
    "Mel",
    "Nidalee",
    "Seraphine",
    "Smolder",
    "Taliyah",
    "Varus",
    "Velkoz",
    "Xerath",
    "Ziggs",
    "Zoe",
];
const PEEL: &[&str] = &[
    "Bard",
    "Braum",
    "Ivern",
    "Janna",
    "Karma",
    "Lulu",
    "Milio",
    "Nami",
    "Orianna",
    "Renata",
    "Seraphine",
    "Sona",
    "Soraka",
    "TahmKench",
    "Taric",
    "Yuumi",
    "Zilean",
];
const SPLIT: &[&str] = &[
    "Aatrox",
    "Camille",
    "Fiora",
    "Gangplank",
    "Gwen",
    "Irelia",
    "Jax",
    "Kayle",
    "Nasus",
    "Quinn",
    "Renekton",
    "Riven",
    "Shen",
    "Trundle",
    "Tryndamere",
    "TwistedFate",
    "Udyr",
    "Yorick",
];
const TEAMFIGHT: &[&str] = &[
    "Amumu",
    "Annie",
    "Aphelios",
    "Azir",
    "Brand",
    "Cassiopeia",
    "Diana",
    "Galio",
    "Gragas",
    "Hwei",
    "JarvanIV",
    "Jinx",
    "Kaisa",
    "Kennen",
    "Lillia",
    "Malphite",
    "Maokai",
    "Mel",
    "MissFortune",
    "MonkeyKing",
    "Neeko",
    "Orianna",
    "Ornn",
    "Rell",
    "Rumble",
    "Ryze",
    "Sejuani",
    "Seraphine",
    "Sion",
    "Swain",
    "Taliyah",
    "Varus",
    "Viktor",
    "Vladimir",
    "Xayah",
    "Yasuo",
    "Yone",
    "Yunara",
    "Zeri",
    "Ziggs",
    "Zyra",
];

/// Valeur de chaque style pour un champion, de 0 à 1.
pub fn styles_of(id: &str, tags: &[String]) -> [f64; 5] {
    let has = |t: &str| tags.iter().any(|x| x == t);
    // Valeur par défaut selon les classes. // estimé
    let mut v: [f64; 5] = [0.1; 5];
    if has("Tank") {
        v[0] = v[0].max(0.35);
        v[4] = v[4].max(0.35);
    }
    if has("Mage") {
        v[1] = v[1].max(0.3);
        v[4] = v[4].max(0.35);
    }
    if has("Marksman") {
        v[1] = v[1].max(0.25);
        v[4] = v[4].max(0.35);
    }
    if has("Support") {
        v[2] = v[2].max(0.35);
    }
    if has("Fighter") {
        v[3] = v[3].max(0.3);
    }
    if has("Assassin") {
        v[3] = v[3].max(0.2);
    }
    for (i, list) in [ENGAGE, POKE, PEEL, SPLIT, TEAMFIGHT].iter().enumerate() {
        if list.contains(&id) {
            v[i] = 1.0;
        }
    }
    v
}

/// Part de dégâts physiques d'un champion (0 à 1), d'après les notes d'attaque et de
/// magie de Data Dragon. // estimé (Data Dragon ne donne pas la part réelle)
pub fn physical_share(attack: u8, magic: u8) -> f64 {
    let total = attack as f64 + magic as f64;
    if total == 0.0 {
        0.5
    } else {
        attack as f64 / total
    }
}

/// Ce que montre l'écran Draft pour une composition.
#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CompAnalysis {
    /// Part de dégâts physiques (0 à 1) ; le reste est magique.
    pub physical: f64,
    /// Engage, poke, peel, split push, teamfight : de 0 à 1.
    pub styles: [f64; 5],
    /// Puissance au début (< 29 min), au milieu et en fin de partie, sur 100
    /// (50 = champion moyen), d'après les victoires réelles selon la durée.
    pub curve: [f64; 3],
}

/// Analyse des champions choisis (clés Data Dragon). Composition vide : valeurs neutres.
pub fn analyse(champions: &[&str], k: &Knowledge) -> CompAnalysis {
    let infos: Vec<_> = champions.iter().filter_map(|c| k.champ(c)).collect();
    if infos.is_empty() {
        return CompAnalysis {
            physical: 0.5,
            styles: [0.0; 5],
            curve: [50.0; 3],
        };
    }
    let n = infos.len() as f64;
    let physical = infos.iter().map(|i| i.physical).sum::<f64>() / n;
    let mut styles = [0.0; 5];
    let mut curve = [0.0; 3];
    for i in &infos {
        // Un style se construit à plusieurs : trois champions forts suffisent.
        for (acc, v) in styles.iter_mut().zip(i.styles) {
            *acc += v / 3.0;
        }
        for (acc, v) in curve.iter_mut().zip(i.curve) {
            *acc += v / n;
        }
    }
    CompAnalysis {
        physical,
        styles: styles.map(|v: f64| v.min(1.0)),
        // Un écart de 10 points de victoire = 30 points sur la courbe. // estimé
        curve: curve.map(|d| (50.0 + 300.0 * d).clamp(0.0, 100.0)),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn styles_ecrits_et_par_defaut() {
        let s = styles_of("Malphite", &["Tank".into(), "Fighter".into()]);
        assert_eq!(s[0], 1.0);
        assert_eq!(s[4], 1.0);
        let s = styles_of("Inconnu", &["Mage".into()]);
        assert_eq!(s[1], 0.3);
        assert_eq!(s[0], 0.1);
    }

    #[test]
    fn listes_sans_doublon() {
        for list in [ENGAGE, POKE, PEEL, SPLIT, TEAMFIGHT] {
            let mut v = list.to_vec();
            v.sort();
            v.dedup();
            assert_eq!(v.len(), list.len());
        }
    }

    #[test]
    fn part_physique() {
        assert_eq!(physical_share(8, 2), 0.8);
        assert_eq!(physical_share(0, 0), 0.5);
    }
}
