//! Géométrie de la Faille de l'invocateur (carte 11), en unités de jeu Riot :
//! origine en bas à gauche côté bleu, y vers le haut, comme les timelines de l'API Riot
//! et la vue 2D (`app/ui/src/match/map.ts`, note 003).

use serde::Serialize;

/// 0 = côté bleu, 1 = côté rouge.
pub type Side = usize;
pub const BLUE: Side = 0;
pub const RED: Side = 1;

#[derive(Debug, Clone, Copy, PartialEq, Serialize)]
pub struct Point {
    pub x: f64,
    pub y: f64,
}

/// Centre de symétrie de la carte : un point côté bleu et son reflet côté rouge.
/// estimé : moyenne des paires de tours symétriques (positions API Riot).
pub const MIRROR: Point = Point::new(14_820.0, 14_920.0);

impl Point {
    pub const fn new(x: f64, y: f64) -> Self {
        Self { x, y }
    }

    /// Distance euclidienne. `sqrt` seulement : résultat identique sur toutes les plateformes.
    pub fn dist(self, o: Point) -> f64 {
        let (dx, dy) = (self.x - o.x, self.y - o.y);
        (dx * dx + dy * dy).sqrt()
    }

    pub fn lerp(self, o: Point, k: f64) -> Point {
        Point::new(self.x + (o.x - self.x) * k, self.y + (o.y - self.y) * k)
    }

    /// Avance vers `o` d'au plus `step` ; renvoie le point atteint.
    pub fn toward(self, o: Point, step: f64) -> Point {
        let d = self.dist(o);
        if d <= step || d == 0.0 {
            o
        } else {
            self.lerp(o, step / d)
        }
    }

    /// Le point symétrique, de l'autre côté de la carte.
    pub fn mirror(self) -> Point {
        Point::new(MIRROR.x - self.x, MIRROR.y - self.y)
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum Lane {
    Top,
    Mid,
    Bot,
}

impl Lane {
    pub const ALL: [Lane; 3] = [Lane::Top, Lane::Mid, Lane::Bot];

    pub fn index(self) -> usize {
        self as usize
    }

    /// Tracé de la voie, du nexus bleu au nexus rouge, virages compris.
    /// estimé : relevé sur la minimap Data Dragon 16.22 (même tracé que la vue 2D).
    pub fn points(self) -> &'static [Point] {
        match self {
            Lane::Top => &TOP,
            Lane::Mid => &MID,
            Lane::Bot => &BOT,
        }
    }

    pub fn length(self) -> f64 {
        self.points().windows(2).map(|w| w[0].dist(w[1])).sum()
    }

    /// Point à la distance `d` le long de la voie, comptée depuis le nexus de `side`.
    pub fn point_at(self, side: Side, d: f64) -> Point {
        let pts = self.points();
        let d = if side == BLUE { d } else { self.length() - d };
        let mut rest = d.max(0.0);
        for w in pts.windows(2) {
            let seg = w[0].dist(w[1]);
            if rest <= seg {
                return w[0].lerp(w[1], rest / seg);
            }
            rest -= seg;
        }
        pts[pts.len() - 1]
    }

    /// Distance le long de la voie (depuis le nexus de `side`) du point de la voie le plus proche de `p`.
    pub fn along(self, side: Side, p: Point) -> f64 {
        let (mut best, mut best_d, mut acc) = (f64::MAX, 0.0, 0.0);
        for w in self.points().windows(2) {
            let (a, b) = (w[0], w[1]);
            let seg = a.dist(b);
            let k = (((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / (seg * seg))
                .clamp(0.0, 1.0);
            let e = p.dist(a.lerp(b, k));
            if e < best {
                best = e;
                best_d = acc + seg * k;
            }
            acc += seg;
        }
        if side == BLUE {
            best_d
        } else {
            self.length() - best_d
        }
    }
}

const fn p(x: f64, y: f64) -> Point {
    Point::new(x, y)
}

const TOP: [Point; 8] = [
    p(1551.0, 1661.0),
    p(1150.0, 3000.0),
    p(1100.0, 10500.0),
    p(1350.0, 12500.0),
    p(2400.0, 13550.0),
    p(4300.0, 13850.0),
    p(10500.0, 13750.0),
    p(13265.0, 13207.0),
];
const MID: [Point; 4] = [
    p(1551.0, 1661.0),
    p(3203.0, 3208.0),
    p(11598.0, 11667.0),
    p(13265.0, 13207.0),
];
const BOT: [Point; 8] = [
    p(1551.0, 1661.0),
    p(3000.0, 1150.0),
    p(10500.0, 1050.0),
    p(12500.0, 1350.0),
    p(13550.0, 2400.0),
    p(13850.0, 4300.0),
    p(13750.0, 10500.0),
    p(13265.0, 13207.0),
];

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn aller_retour_sur_la_voie() {
        for lane in Lane::ALL {
            for side in [BLUE, RED] {
                for d in [0.0, 1234.0, 5000.0, lane.length() / 2.0] {
                    let back = lane.along(side, lane.point_at(side, d));
                    assert!((back - d).abs() < 1.0, "{lane:?} {side} {d} -> {back}");
                }
            }
        }
    }

    #[test]
    fn les_deux_nexus_aux_extremites() {
        let l = Lane::Mid.length();
        assert_eq!(Lane::Mid.point_at(BLUE, 0.0), Lane::Mid.point_at(RED, l));
    }
}
