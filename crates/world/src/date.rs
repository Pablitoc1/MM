//! Date du jeu (calendrier grégorien, sans heure).

use std::fmt;

const JOURS: [&str; 7] = ["Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam.", "Dim."];
const MOIS: [&str; 12] = [
    "janvier",
    "février",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "août",
    "septembre",
    "octobre",
    "novembre",
    "décembre",
];

/// Une date du calendrier du jeu.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct GameDate {
    pub year: i32,
    pub month: u8,
    pub day: u8,
}

impl GameDate {
    /// Début de la partie : lundi 5 janvier 2026.
    pub const SEASON_START: GameDate = GameDate {
        year: 2026,
        month: 1,
        day: 5,
    };

    pub fn new(year: i32, month: u8, day: u8) -> Option<Self> {
        if !(1..=12).contains(&month) || day == 0 || day > days_in_month(year, month) {
            return None;
        }
        Some(Self { year, month, day })
    }

    /// Le jour suivant.
    pub fn next_day(self) -> Self {
        if self.day < days_in_month(self.year, self.month) {
            Self {
                day: self.day + 1,
                ..self
            }
        } else if self.month < 12 {
            Self {
                month: self.month + 1,
                day: 1,
                ..self
            }
        } else {
            Self {
                year: self.year + 1,
                month: 1,
                day: 1,
            }
        }
    }

    /// Jour de la semaine, 0 = lundi.
    pub fn weekday(self) -> u8 {
        // Algorithme de Sakamoto (0 = dimanche), ramené à 0 = lundi.
        const T: [i32; 12] = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
        let m = self.month as usize;
        let y = if self.month < 3 {
            self.year - 1
        } else {
            self.year
        };
        let d = (y + y / 4 - y / 100 + y / 400 + T[m - 1] + self.day as i32).rem_euclid(7);
        ((d + 6) % 7) as u8
    }
}

impl fmt::Display for GameDate {
    /// Format affiché dans la barre du haut : « Lun. 5 janvier 2026 ».
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "{} {} {} {}",
            JOURS[self.weekday() as usize],
            self.day,
            MOIS[self.month as usize - 1],
            self.year
        )
    }
}

fn is_leap(y: i32) -> bool {
    (y % 4 == 0 && y % 100 != 0) || y % 400 == 0
}

fn days_in_month(y: i32, m: u8) -> u8 {
    match m {
        1 | 3 | 5 | 7 | 8 | 10 | 12 => 31,
        4 | 6 | 9 | 11 => 30,
        2 if is_leap(y) => 29,
        2 => 28,
        _ => 0,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn debut_de_saison_est_un_lundi() {
        assert_eq!(GameDate::SEASON_START.weekday(), 0);
        assert_eq!(GameDate::SEASON_START.to_string(), "Lun. 5 janvier 2026");
    }

    #[test]
    fn jours_suivants() {
        let d = GameDate::new(2026, 1, 31).unwrap().next_day();
        assert_eq!(d, GameDate::new(2026, 2, 1).unwrap());
        let d = GameDate::new(2026, 12, 31).unwrap().next_day();
        assert_eq!(d, GameDate::new(2027, 1, 1).unwrap());
        let d = GameDate::new(2028, 2, 28).unwrap().next_day();
        assert_eq!(d, GameDate::new(2028, 2, 29).unwrap());
    }

    #[test]
    fn dates_invalides_refusees() {
        assert!(GameDate::new(2026, 2, 29).is_none());
        assert!(GameDate::new(2026, 13, 1).is_none());
        assert!(GameDate::new(2026, 4, 31).is_none());
    }

    #[test]
    fn samedi_17_janvier_2026() {
        assert_eq!(
            GameDate::new(2026, 1, 17).unwrap().to_string(),
            "Sam. 17 janvier 2026"
        );
    }
}
