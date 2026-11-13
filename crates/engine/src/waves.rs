//! Vagues de sbires et bâtiments : apparition, marche, combat entre vagues, tirs des tours.
//!
//! Une vague est repérée par la distance de son front le long de sa voie, depuis son nexus
//! (comme dans le flux de la vue 2D). Ses sbires sont rangés de l'avant vers l'arrière.

use crate::geo::{Lane, Point, Side};
use crate::map::{self, Structure, StructureKind};
use crate::rules::{self, MinionKind};

#[derive(Debug, Clone)]
pub struct Minion {
    pub kind: MinionKind,
    pub hp: f64,
}

#[derive(Debug, Clone)]
pub struct Wave {
    pub id: u32,
    pub side: Side,
    pub lane: Lane,
    pub d: f64,
    pub minions: Vec<Minion>,
}

impl Wave {
    pub fn pos(&self) -> Point {
        self.lane.point_at(self.side, self.d)
    }

    fn dps(&self) -> f64 {
        self.minions
            .iter()
            .map(|m| {
                let s = rules::minion(m.kind);
                s.ad * s.attack_speed
            })
            .sum()
    }
}

/// Un sbire qui vient de mourir : les champions adverses proches peuvent le récupérer.
#[derive(Debug, Clone)]
pub struct Death {
    /// Équipe du sbire mort.
    pub side: Side,
    pub lane: Lane,
    pub kind: MinionKind,
    pub pos: Point,
}

#[derive(Debug, Clone)]
pub struct Building {
    pub def: Structure,
    pub hp: f64,
    /// Distance le long de chaque voie depuis le nexus adverse (pour les vagues qui l'attaquent).
    along: [f64; 3],
    shot_charge: f64,
    /// Un inhibiteur détruit revient à cet instant.
    pub respawn_at: Option<f64>,
}

impl Building {
    pub fn alive(&self) -> bool {
        self.hp > 0.0
    }

    /// Le bâtiment barre-t-il cette voie ? (les bâtiments du nexus barrent les trois).
    fn on_lane(&self, lane: Lane) -> bool {
        self.def.lane.is_none_or(|l| l == lane)
    }

    /// Distance le long de la voie depuis le nexus de ceux qui l'attaquent.
    pub fn along(&self, lane: Lane) -> f64 {
        self.along[lane.index()]
    }
}

pub struct Lanes {
    pub waves: Vec<Wave>,
    pub buildings: Vec<Building>,
    /// Inhibiteurs revenus pendant le dernier pas (index).
    pub respawned: Vec<usize>,
    next_id: u32,
    wave_number: u32,
}

impl Default for Lanes {
    fn default() -> Self {
        Self::new()
    }
}

impl Lanes {
    pub fn new() -> Self {
        let buildings = map::structures()
            .into_iter()
            .map(|def| {
                let along = Lane::ALL.map(|l| l.along(1 - def.side, def.pos));
                Building {
                    hp: def.max_hp,
                    def,
                    along,
                    shot_charge: 0.0,
                    respawn_at: None,
                }
            })
            .collect();
        Lanes {
            waves: Vec::new(),
            buildings,
            respawned: Vec::new(),
            next_id: 1,
            wave_number: 0,
        }
    }

    /// Un bâtiment est vulnérable si ceux qui le protègent sur sa voie sont tombés.
    /// Simplifié en M3 : le premier bâtiment debout de la voie, depuis l'adversaire.
    pub fn next_target(&self, side: Side, lane: Lane, d: f64) -> Option<usize> {
        let mut best: Option<usize> = None;
        for (i, b) in self.buildings.iter().enumerate() {
            if b.def.side == side || !b.alive() || !b.on_lane(lane) {
                continue;
            }
            let bd = b.along[lane.index()];
            if bd + 200.0 >= d && best.is_none_or(|j| bd < self.buildings[j].along[lane.index()]) {
                best = Some(i);
            }
        }
        best
    }

    /// Avance d'un pas. Renvoie les sbires morts et les bâtiments détruits (index).
    pub fn step(&mut self, t: f64, dt: f64) -> (Vec<Death>, Vec<usize>) {
        for (i, b) in self.buildings.iter_mut().enumerate() {
            if b.respawn_at.is_some_and(|r| t >= r) {
                b.respawn_at = None;
                b.hp = b.def.max_hp;
                self.respawned.push(i);
            }
        }
        self.spawn(t);
        let mut deaths = Vec::new();
        let mut destroyed = Vec::new();
        for lane in Lane::ALL {
            let len = lane.length();
            let front = |w: &Vec<Wave>, side: Side| {
                w.iter()
                    .enumerate()
                    .filter(|(_, w)| w.side == side && w.lane == lane)
                    .max_by(|a, b| a.1.d.total_cmp(&b.1.d))
                    .map(|(i, _)| i)
            };
            // 1. Marche : chaque vague avance jusqu'au contact d'une vague ou d'un bâtiment adverse.
            for side in [0, 1] {
                let enemy = front(&self.waves, 1 - side).map(|i| len - self.waves[i].d);
                for i in 0..self.waves.len() {
                    let w = &self.waves[i];
                    if w.side != side || w.lane != lane {
                        continue;
                    }
                    let mut stop = enemy.map_or(f64::MAX, |e| e - rules::WAVE_CONTACT);
                    if let Some(b) = self.next_target(side, lane, w.d) {
                        stop = stop.min(self.buildings[b].along[lane.index()] - 450.0);
                    }
                    let d = (w.d + rules::MINION_SPEED * dt).min(stop.max(w.d));
                    self.waves[i].d = d;
                }
            }
            // 2. Les vagues d'une même équipe qui se rejoignent n'en font plus qu'une.
            self.merge(lane);
            // 3. Combats : vague contre vague, tours contre vague, vague contre bâtiment.
            let (fb, fr) = (front(&self.waves, 0), front(&self.waves, 1));
            let contact = match (fb, fr) {
                (Some(b), Some(r)) => {
                    len - self.waves[r].d - self.waves[b].d <= rules::WAVE_CONTACT + 1.0
                }
                _ => false,
            };
            // Les deux vagues frappent en même temps : dégâts calculés avant d'être appliqués.
            let dps = [fb, fr].map(|o| o.map_or(0.0, |i| self.waves[i].dps()));
            for (me, other) in [(fb, fr), (fr, fb)] {
                let Some(me) = me else { continue };
                let side = self.waves[me].side;
                let target = self.next_target(side, lane, self.waves[me].d);
                if contact {
                    if let Some(o) = other {
                        let dmg = dps[side] * dt;
                        self.hit_wave(o, dmg, &mut deaths);
                    }
                } else if let Some(b) = target {
                    let in_range =
                        self.buildings[b].along[lane.index()] - self.waves[me].d <= 600.0;
                    if in_range {
                        let dmg = dps[side] * rules::MINION_VS_STRUCTURE * dt;
                        let bld = &mut self.buildings[b];
                        // La tour extérieure tient jusqu'à 14:00 grâce aux plaques (simplifié).
                        bld.hp -= dmg;
                        if !bld.alive() {
                            self.destroy(b, t);
                            destroyed.push(b);
                        }
                    }
                }
                // Une tour adverse tire sur le premier sbire à sa portée.
                if let Some(b) = target {
                    let bld = &self.buildings[b];
                    if bld.def.kind == StructureKind::Turret
                        && bld.along[lane.index()] - self.waves[me].d <= rules::TURRET_RANGE
                    {
                        let charge =
                            self.buildings[b].shot_charge + rules::TURRET_ATTACK_SPEED * dt;
                        let shots = charge.floor();
                        self.buildings[b].shot_charge = charge - shots;
                        for _ in 0..shots as u32 {
                            let Some(m) = self.waves[me].minions.first() else {
                                break;
                            };
                            let max = max_hp(m.kind, t);
                            self.hit_wave(me, rules::minion(m.kind).turret_shot * max, &mut deaths);
                        }
                    }
                }
            }
        }
        self.waves.retain(|w| !w.minions.is_empty());
        (deaths, destroyed)
    }

    /// Un bâtiment tombe : PV à zéro, et un inhibiteur reviendra.
    pub fn destroy(&mut self, b: usize, t: f64) {
        let bld = &mut self.buildings[b];
        bld.hp = 0.0;
        if bld.def.kind == StructureKind::Inhibitor {
            bld.respawn_at = Some(t + rules::INHIBITOR_RESPAWN);
        }
    }

    /// Inhibiteurs de l'équipe `side` tombés : sur une voie, et en tout.
    fn inhibitors_down(&self, side: Side, lane: Lane) -> (bool, usize) {
        let down = |b: &&Building| {
            b.def.side == side && b.def.kind == StructureKind::Inhibitor && !b.alive()
        };
        let total = self.buildings.iter().filter(down).count();
        let here = self
            .buildings
            .iter()
            .filter(down)
            .any(|b| b.def.lane == Some(lane));
        (here, total)
    }

    pub fn hit_wave(&mut self, i: usize, mut dmg: f64, deaths: &mut Vec<Death>) {
        let w = &mut self.waves[i];
        let pos = w.pos();
        while dmg > 0.0 && !w.minions.is_empty() {
            let m = &mut w.minions[0];
            if m.hp > dmg {
                m.hp -= dmg;
                break;
            }
            dmg -= m.hp;
            let kind = m.kind;
            w.minions.remove(0);
            deaths.push(Death {
                side: w.side,
                lane: w.lane,
                kind,
                pos,
            });
        }
    }

    fn merge(&mut self, lane: Lane) {
        let mut i = 0;
        while i < self.waves.len() {
            let mut j = i + 1;
            while j < self.waves.len() {
                let (a, b) = (&self.waves[i], &self.waves[j]);
                if a.side == b.side && a.lane == lane && b.lane == lane && (a.d - b.d).abs() < 300.0
                {
                    let back = self.waves.remove(j);
                    self.waves[i].minions.extend(back.minions);
                    self.waves[i].d = self.waves[i].d.max(back.d);
                    self.waves[i].minions.sort_by_key(|m| front_rank(m.kind));
                } else {
                    j += 1;
                }
            }
            i += 1;
        }
    }

    fn spawn(&mut self, t: f64) {
        let due = rules::WAVE_FIRST_SPAWN + f64::from(self.wave_number) * rules::WAVE_INTERVAL;
        if t + 1e-9 < due {
            return;
        }
        self.wave_number += 1;
        let cannon = rules::has_cannon(self.wave_number, t);
        for side in [0, 1] {
            for lane in Lane::ALL {
                let mut minions = Vec::new();
                // Inhibiteur adverse tombé sur cette voie : un super sbire à la place du canon,
                // deux si l'adversaire a perdu au moins deux inhibiteurs. estimé (wiki)
                let (open, total) = self.inhibitors_down(1 - side, lane);
                let supers = match (open, total) {
                    (false, _) => 0,
                    (true, 1) => 1,
                    (true, _) => 2,
                };
                for kind in [
                    MinionKind::Super,
                    MinionKind::Melee,
                    MinionKind::Cannon,
                    MinionKind::Caster,
                ] {
                    let n = match kind {
                        MinionKind::Super => supers,
                        MinionKind::Cannon => usize::from(cannon && supers == 0),
                        _ => 3,
                    };
                    for _ in 0..n {
                        minions.push(Minion {
                            kind,
                            hp: max_hp(kind, t),
                        });
                    }
                }
                self.waves.push(Wave {
                    id: self.next_id,
                    side,
                    lane,
                    d: 0.0,
                    minions,
                });
                self.next_id += 1;
            }
        }
    }
}

fn front_rank(kind: MinionKind) -> u8 {
    match kind {
        MinionKind::Super | MinionKind::Melee => 0,
        MinionKind::Cannon => 1,
        MinionKind::Caster => 2,
    }
}

pub fn max_hp(kind: MinionKind, t: f64) -> f64 {
    let s = rules::minion(kind);
    s.hp + s.hp_per_upgrade * rules::minion_upgrades(t)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn run(seconds: u32) -> (Lanes, usize) {
        let mut l = Lanes::new();
        let mut dead = 0;
        for s in 0..seconds {
            dead += l.step(f64::from(s), 1.0).0.len();
        }
        (l, dead)
    }

    #[test]
    fn les_vagues_se_rencontrent_au_milieu() {
        let (l, dead) = run(70);
        assert!(dead > 0, "les premières vagues se sont battues");
        // Les vagues qui ont quitté leur base attendent au milieu de leur voie.
        for w in l.waves.iter().filter(|w| w.d > 4000.0) {
            let half = w.lane.length() / 2.0;
            assert!((w.d - half).abs() < 1500.0, "{:?} {} {}", w.lane, w.d, half);
        }
    }

    #[test]
    fn sans_champions_les_voies_restent_equilibrees() {
        // Cinq minutes de vagues symétriques : aucune tour ne tombe.
        let (l, _) = run(300);
        assert!(l.buildings.iter().all(|b| b.alive()));
    }
}
