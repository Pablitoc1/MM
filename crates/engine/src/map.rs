//! La carte : bâtiments, camps de la jungle et réseau de points pour les déplacements.
//!
//! Les positions des tours et inhibiteurs viennent des timelines de l'API Riot ;
//! nexus, camps et chemins de jungle sont relevés sur la minimap (`// estimé`),
//! les mêmes que la vue 2D (`app/ui/src/match/map.ts`).

use crate::geo::{Lane, Point, Side, BLUE, RED};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum StructureKind {
    Turret,
    Inhibitor,
    Nexus,
}

#[derive(Debug, Clone)]
pub struct Structure {
    pub id: &'static str,
    pub side: Side,
    pub kind: StructureKind,
    pub lane: Option<Lane>,
    pub pos: Point,
    pub max_hp: f64,
}

/// Les 30 bâtiments, dans l'ordre de la vue 2D.
pub fn structures() -> Vec<Structure> {
    use Lane::*;
    use StructureKind::*;
    // PV : estimé (wiki, saison 2025) ; tour extérieure avec ses plaques.
    let turret_hp = |id: &str| {
        if id.contains("outer") {
            5000.0
        } else if id.contains("inner") {
            3600.0
        } else if id.contains("inhib") {
            3300.0
        } else {
            2700.0
        }
    };
    type Row = (&'static str, Side, StructureKind, Option<Lane>, f64, f64);
    let raw: [Row; 30] = [
        ("blue_top_outer", BLUE, Turret, Some(Top), 981.0, 10441.0),
        ("blue_top_inner", BLUE, Turret, Some(Top), 1512.0, 6699.0),
        ("blue_top_inhib", BLUE, Turret, Some(Top), 1169.0, 4287.0),
        ("blue_mid_outer", BLUE, Turret, Some(Mid), 5846.0, 6396.0),
        ("blue_mid_inner", BLUE, Turret, Some(Mid), 5048.0, 4812.0),
        ("blue_mid_inhib", BLUE, Turret, Some(Mid), 3651.0, 3696.0),
        ("blue_bot_outer", BLUE, Turret, Some(Bot), 10504.0, 1029.0),
        ("blue_bot_inner", BLUE, Turret, Some(Bot), 6919.0, 1483.0),
        ("blue_bot_inhib", BLUE, Turret, Some(Bot), 4281.0, 1253.0),
        ("blue_nexus_top", BLUE, Turret, None, 1748.0, 2270.0),
        ("blue_nexus_bot", BLUE, Turret, None, 2177.0, 1807.0),
        ("red_top_outer", RED, Turret, Some(Top), 4318.0, 13875.0),
        ("red_top_inner", RED, Turret, Some(Top), 7943.0, 13411.0),
        ("red_top_inhib", RED, Turret, Some(Top), 10481.0, 13650.0),
        ("red_mid_outer", RED, Turret, Some(Mid), 8955.0, 8510.0),
        ("red_mid_inner", RED, Turret, Some(Mid), 9767.0, 10113.0),
        ("red_mid_inhib", RED, Turret, Some(Mid), 11134.0, 11207.0),
        ("red_bot_outer", RED, Turret, Some(Bot), 13866.0, 4505.0),
        ("red_bot_inner", RED, Turret, Some(Bot), 13327.0, 8226.0),
        ("red_bot_inhib", RED, Turret, Some(Bot), 13624.0, 10572.0),
        ("red_nexus_top", RED, Turret, None, 12611.0, 13084.0),
        ("red_nexus_bot", RED, Turret, None, 13052.0, 12612.0),
        (
            "blue_inhibitor_top",
            BLUE,
            Inhibitor,
            Some(Top),
            1171.0,
            3571.0,
        ),
        (
            "blue_inhibitor_mid",
            BLUE,
            Inhibitor,
            Some(Mid),
            3203.0,
            3208.0,
        ),
        (
            "blue_inhibitor_bot",
            BLUE,
            Inhibitor,
            Some(Bot),
            3452.0,
            1236.0,
        ),
        (
            "red_inhibitor_top",
            RED,
            Inhibitor,
            Some(Top),
            11261.0,
            13676.0,
        ),
        (
            "red_inhibitor_mid",
            RED,
            Inhibitor,
            Some(Mid),
            11598.0,
            11667.0,
        ),
        (
            "red_inhibitor_bot",
            RED,
            Inhibitor,
            Some(Bot),
            13604.0,
            11316.0,
        ),
        ("blue_nexus", BLUE, Nexus, None, 1551.0, 1661.0), // estimé (minimap)
        ("red_nexus", RED, Nexus, None, 13265.0, 13207.0), // estimé (minimap)
    ];
    raw.into_iter()
        .map(|(id, side, kind, lane, x, y)| Structure {
            id,
            side,
            kind,
            lane,
            pos: Point::new(x, y),
            max_hp: match kind {
                Turret => turret_hp(id),
                Inhibitor => 4000.0, // estimé (wiki)
                Nexus => 5500.0,     // estimé (wiki)
            },
        })
        .collect()
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CampKind {
    Blue,
    Red,
    Gromp,
    Wolves,
    Raptors,
    Krugs,
    Scuttle,
    Dragon,
    Baron,
}

impl CampKind {
    /// Camp que le jungler farme (les grands objectifs arrivent en M5).
    pub fn farmable(self) -> bool {
        !matches!(self, CampKind::Dragon | CampKind::Baron)
    }

    pub fn first_spawn(self) -> f64 {
        match self {
            CampKind::Scuttle => 210.0, // estimé (wiki : 3:30)
            CampKind::Dragon => 300.0,  // estimé (wiki : 5:00)
            CampKind::Baron => 480.0,   // estimé : larves du Néant à 8:00, Nashor à 20:00
            _ => 90.0,                  // estimé (wiki : 1:30)
        }
    }

    pub fn respawn(self) -> f64 {
        match self {
            CampKind::Blue | CampKind::Red => 300.0, // estimé (wiki)
            CampKind::Scuttle => 150.0,              // estimé (wiki)
            _ => 135.0,                              // estimé (wiki)
        }
    }

    /// PV totaux du camp (gros monstre et petits) à l'apparition.
    pub fn hp(self) -> f64 {
        match self {
            CampKind::Blue | CampKind::Red => 2300.0, // estimé (wiki)
            CampKind::Gromp => 2050.0,                // estimé (wiki)
            CampKind::Wolves => 2000.0,               // estimé (wiki, loup + 2 louveteaux)
            CampKind::Raptors => 2000.0,              // estimé (wiki, 1 + 5 petits)
            CampKind::Krugs => 2400.0,                // estimé (wiki, krugs et leurs divisions)
            CampKind::Scuttle => 1250.0,              // estimé (wiki)
            CampKind::Dragon | CampKind::Baron => 0.0,
        }
    }

    /// Sbires comptés (CS), or et XP donnés au jungler.
    pub fn rewards(self) -> (u32, f64, f64) {
        // estimé : calé pour qu'un tour complet donne le niveau 4 et ~30 CS, comme chez les pros.
        match self {
            CampKind::Blue | CampKind::Red => (4, 90.0, 200.0),
            CampKind::Gromp => (4, 80.0, 180.0),
            CampKind::Wolves => (6, 85.0, 180.0),
            CampKind::Raptors => (6, 85.0, 180.0),
            CampKind::Krugs => (6, 85.0, 200.0),
            CampKind::Scuttle => (4, 70.0, 150.0),
            CampKind::Dragon | CampKind::Baron => (0, 0.0, 0.0),
        }
    }
}

#[derive(Debug, Clone)]
pub struct Camp {
    pub id: &'static str,
    pub kind: CampKind,
    /// Côté de la jungle, ou `None` pour la rivière.
    pub side: Option<Side>,
    pub pos: Point,
}

pub fn camps() -> Vec<Camp> {
    use CampKind::*;
    // estimé : relevés sur la minimap 16.22, comme la vue 2D.
    let raw: [(&'static str, CampKind, Option<Side>, f64, f64); 16] = [
        ("blue_blue", Blue, Some(BLUE), 3821.0, 8101.0),
        ("blue_gromp", Gromp, Some(BLUE), 2288.0, 8448.0),
        ("blue_wolves", Wolves, Some(BLUE), 3780.0, 6443.0),
        ("blue_raptors", Raptors, Some(BLUE), 6943.0, 5422.0),
        ("blue_red", Red, Some(BLUE), 7765.0, 4020.0),
        ("blue_krugs", Krugs, Some(BLUE), 8482.0, 2705.0),
        ("red_blue", Blue, Some(RED), 10984.0, 6960.0),
        ("red_gromp", Gromp, Some(RED), 12671.0, 6306.0),
        ("red_wolves", Wolves, Some(RED), 11008.0, 8387.0),
        ("red_raptors", Raptors, Some(RED), 7852.0, 9419.0),
        ("red_red", Red, Some(RED), 7101.0, 10900.0),
        ("red_krugs", Krugs, Some(RED), 6317.0, 12146.0),
        ("scuttle_top", Scuttle, None, 4400.0, 9600.0),
        ("scuttle_bot", Scuttle, None, 10500.0, 5170.0),
        ("dragon", Dragon, None, 9866.0, 4414.0),
        ("baron", Baron, None, 5007.0, 10471.0),
    ];
    raw.into_iter()
        .map(|(id, kind, side, x, y)| Camp {
            id,
            kind,
            side,
            pos: Point::new(x, y),
        })
        .collect()
}

/// Fontaine de chaque équipe (point d'apparition). estimé (minimap).
pub fn fountain(side: Side) -> Point {
    let blue = Point::new(500.0, 500.0);
    if side == BLUE {
        blue
    } else {
        blue.mirror()
    }
}

/// Réseau de points : voies échantillonnées, chemins de jungle et rivière.
/// Les champions se déplacent d'un point à l'autre ; les murs sont entre les liaisons.
pub struct Nav {
    pub nodes: Vec<Point>,
    adj: Vec<Vec<(usize, f64)>>,
    /// Points de chaque voie, du nexus bleu au nexus rouge.
    lanes: [Vec<usize>; 3],
}

/// Espacement des points le long des voies.
const LANE_STEP: f64 = 500.0;

/// Un bout de liaison décrit pour la moitié bleue ; la moitié rouge en est le reflet.
#[derive(Clone, Copy)]
enum End {
    /// Point de cette moitié (index dans `HALF`).
    Own(usize),
    /// Le reflet d'un point de cette moitié, dans l'autre moitié.
    Other(usize),
    /// Le centre de la carte (rivière au milieu de la voie du milieu).
    Center,
    /// Le point le plus proche de cette voie.
    Near(Lane),
}

/// Points de la moitié bleue. Les camps reprennent la position des camps ;
/// les autres sont des carrefours relevés sur la minimap (estimé).
const HALF: [(f64, f64); 16] = [
    (3821.0, 8101.0),  // 0 buff bleu
    (2288.0, 8448.0),  // 1 golem
    (3780.0, 6443.0),  // 2 loups
    (6943.0, 5422.0),  // 3 raptors
    (7765.0, 4020.0),  // 4 buff rouge
    (8482.0, 2705.0),  // 5 krugs
    (4400.0, 9600.0),  // 6 carapateur du haut
    (5007.0, 10471.0), // 7 fosse du Nashor
    (2700.0, 7300.0),  // 8 carrefour golem / buff bleu / loups
    (5100.0, 7900.0),  // 9 sortie du buff bleu vers le milieu
    (2900.0, 10200.0), // 10 entrée de la rivière du haut
    (2900.0, 5400.0),  // 11 entrée de la jungle depuis la base (haut)
    (6100.0, 4300.0),  // 12 carrefour raptors / buff rouge / milieu
    (5300.0, 2900.0),  // 13 entrée de la jungle depuis la base (bas)
    (8600.0, 4700.0),  // 14 sortie du buff rouge vers la rivière
    (9900.0, 2600.0),  // 15 entrée de la rivière du bas, côté krugs
];

const LINKS: [(End, End); 31] = {
    use End::*;
    [
        (Own(1), Own(8)),
        (Own(0), Own(8)),
        (Own(2), Own(8)),
        (Own(8), Near(Lane::Top)),
        (Own(0), Own(9)),
        (Own(2), Own(9)),
        (Own(9), Near(Lane::Mid)),
        (Own(9), Own(6)),
        (Own(1), Own(10)),
        (Own(10), Near(Lane::Top)),
        (Own(10), Own(6)),
        (Own(6), Own(7)),
        (Own(7), Own(10)),
        (Own(6), Center),
        (Own(2), Own(11)),
        (Own(11), Own(8)),
        (Own(11), Near(Lane::Mid)),
        (Own(11), Near(Lane::Top)),
        (Own(3), Own(12)),
        (Own(4), Own(12)),
        (Own(12), Near(Lane::Mid)),
        (Own(4), Own(13)),
        (Own(13), Near(Lane::Bot)),
        (Own(13), Near(Lane::Mid)),
        (Own(4), Own(14)),
        (Own(3), Own(14)),
        (Own(14), Other(6)),
        (Own(14), Other(7)),
        (Own(4), Own(5)),
        (Own(5), Own(15)),
        (Own(15), Near(Lane::Bot)),
    ]
};

impl Nav {
    pub fn build() -> Nav {
        let mut nav = Nav {
            nodes: Vec::new(),
            adj: Vec::new(),
            lanes: [Vec::new(), Vec::new(), Vec::new()],
        };
        let blue_nexus = nav.add(Lane::Mid.points()[0]);
        let red_nexus = nav.add(*Lane::Mid.points().last().unwrap_or(&Point::new(0.0, 0.0)));
        for lane in Lane::ALL {
            let len = lane.length();
            let steps = (len / LANE_STEP).ceil() as usize;
            let mut prev = blue_nexus;
            let mut ids = vec![blue_nexus];
            for i in 1..steps {
                let id = nav.add(lane.point_at(BLUE, len * i as f64 / steps as f64));
                nav.link(prev, id);
                ids.push(id);
                prev = id;
            }
            nav.link(prev, red_nexus);
            ids.push(red_nexus);
            nav.lanes[lane.index()] = ids;
        }
        let center = nav.add(Point::new(MIRROR_CENTER.0, MIRROR_CENTER.1));
        let mid = nav.nearest_on_lane(Lane::Mid, nav.nodes[center]);
        nav.link(center, mid);
        // Les deux moitiés de la jungle. Les camps prennent leur position réelle.
        let camp_list = camps();
        let mut half = [[0usize; 16]; 2];
        for side in [BLUE, RED] {
            for (i, &(x, y)) in HALF.iter().enumerate() {
                let p = Point::new(x, y);
                let p = if side == BLUE { p } else { p.mirror() };
                // Un point qui tombe sur un camp prend la position exacte du camp.
                let p = camp_list
                    .iter()
                    .map(|c| c.pos)
                    .find(|c| c.dist(p) < 400.0)
                    .unwrap_or(p);
                half[side][i] = nav.add(p);
            }
        }
        for side in [BLUE, RED] {
            for (a, b) in LINKS {
                let resolve = |nav: &Nav, e: End, from: Point| match e {
                    End::Own(i) => half[side][i],
                    End::Other(i) => half[1 - side][i],
                    End::Center => center,
                    End::Near(l) => nav.nearest_on_lane(l, from),
                };
                let a = resolve(&nav, a, Point::new(0.0, 0.0));
                let b = resolve(&nav, b, nav.nodes[a]);
                nav.link(a, b);
            }
        }
        for side in [BLUE, RED] {
            let f = nav.add(fountain(side));
            nav.link(f, if side == BLUE { blue_nexus } else { red_nexus });
        }
        nav
    }

    fn add(&mut self, p: Point) -> usize {
        self.nodes.push(p);
        self.adj.push(Vec::new());
        self.nodes.len() - 1
    }

    fn link(&mut self, a: usize, b: usize) {
        let d = self.nodes[a].dist(self.nodes[b]);
        self.adj[a].push((b, d));
        self.adj[b].push((a, d));
    }

    fn nearest_on_lane(&self, lane: Lane, p: Point) -> usize {
        let ids = &self.lanes[lane.index()];
        let mut best = ids[0];
        for &i in ids {
            if self.nodes[i].dist(p) < self.nodes[best].dist(p) {
                best = i;
            }
        }
        best
    }

    fn nearest(&self, p: Point) -> usize {
        let mut best = 0;
        for i in 0..self.nodes.len() {
            if self.nodes[i].dist(p) < self.nodes[best].dist(p) {
                best = i;
            }
        }
        best
    }

    /// Chemin le plus court de `from` à `to`, en points à suivre (le dernier est `to`).
    pub fn route(&self, from: Point, to: Point) -> Vec<Point> {
        if from.dist(to) < 1200.0 {
            return vec![to];
        }
        let (s, g) = (self.nearest(from), self.nearest(to));
        // Dijkstra sur ~200 points : ordre de parcours fixe, donc déterministe.
        let n = self.nodes.len();
        let mut dist = vec![f64::MAX; n];
        let mut prev = vec![usize::MAX; n];
        let mut done = vec![false; n];
        dist[s] = 0.0;
        loop {
            let mut u = usize::MAX;
            for i in 0..n {
                if !done[i] && dist[i] < f64::MAX && (u == usize::MAX || dist[i] < dist[u]) {
                    u = i;
                }
            }
            if u == usize::MAX || u == g {
                break;
            }
            done[u] = true;
            for &(v, w) in &self.adj[u] {
                if dist[u] + w < dist[v] {
                    dist[v] = dist[u] + w;
                    prev[v] = u;
                }
            }
        }
        let mut path = vec![to];
        let mut cur = g;
        while cur != usize::MAX && cur != s {
            path.push(self.nodes[cur]);
            cur = prev[cur];
        }
        path.reverse();
        path
    }

    /// Longueur d'un trajet (pour estimer un temps de déplacement).
    pub fn route_length(&self, from: Point, to: Point) -> f64 {
        let mut last = from;
        let mut len = 0.0;
        for p in self.route(from, to) {
            len += last.dist(p);
            last = p;
        }
        len
    }
}

/// Centre de la carte, sur la voie du milieu. estimé (minimap).
const MIRROR_CENTER: (f64, f64) = (7410.0, 7460.0);

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn la_carte_est_complete() {
        let s = structures();
        assert_eq!(
            s.iter().filter(|s| s.kind == StructureKind::Turret).count(),
            22
        );
        assert_eq!(camps().len(), 16);
    }

    #[test]
    fn tous_les_points_sont_relies() {
        let nav = Nav::build();
        let from = fountain(BLUE);
        for (i, p) in nav.nodes.iter().enumerate() {
            let len = nav.route_length(from, *p);
            assert!(len < 40_000.0, "point {i} {p:?} injoignable ({len})");
        }
    }

    #[test]
    fn trajet_de_jungle_plausible() {
        // Du buff rouge bleu aux krugs : proche, le trajet ne fait pas le tour de la carte.
        let nav = Nav::build();
        let red = Point::new(7765.0, 4020.0);
        let krugs = Point::new(8482.0, 2705.0);
        let len = nav.route_length(red, krugs);
        assert!(len < 1.6 * red.dist(krugs) + 1500.0, "{len}");
        // D'une fontaine à l'autre : au moins la diagonale.
        let across = nav.route_length(fountain(BLUE), fountain(RED));
        assert!(across >= fountain(BLUE).dist(fountain(RED)));
    }
}
