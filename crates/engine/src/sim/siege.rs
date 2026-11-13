//! Siège des bâtiments (M5a, note 015) : les champions frappent les tours derrière leur vague,
//! les plaques et les bâtiments rapportent de l'or, la partie se finit sur le Nexus.

use super::{Game, Mode};
use crate::geo::Lane;
use crate::kit::{mitigate, Targeting};
use crate::map::StructureKind;
use crate::replay::Event;
use crate::rules;

/// Un champion frappe un bâtiment seulement si sa vague est au pied (elle prend les tirs).
const WAVE_AT_STRUCTURE: f64 = 750.0; // estimé
/// Personne en face à moins de cette distance du bâtiment : on peut le frapper.
const DEFENDER_RANGE: f64 = 1400.0; // estimé
/// Sous ce niveau de PV, on ne reste pas sous une tour.
const SIEGE_MIN_HP: f64 = 0.45; // estimé
/// Le dernier champion à avoir frappé un bâtiment depuis moins longtemps compte pour sa chute.
const LAST_HIT_WINDOW: f64 = 5.0;
/// Sbires touchés en moyenne par un sort de zone ou un projectile qui traverse.
const AREA_TARGETS: f64 = 3.0; // estimé
const SKILLSHOT_TARGETS: f64 = 1.5; // estimé
/// On ne pousse avec ses sorts qu'au-dessus de cette part de mana.
const PUSH_MANA: f64 = 0.3; // estimé
/// Une vague adverse à moins de cette distance d'un bâtiment de la base la menace.
const BASE_THREAT: f64 = 1200.0; // estimé

/// Ce que chaque équipe a pris aux bâtiments adverses.
#[derive(Debug, Clone, Copy, Default, PartialEq)]
pub struct TeamReport {
    pub towers: u32,
    pub plates: u32,
    pub inhibitors: u32,
}

impl Game {
    /// Le bâtiment que le champion `i` peut frapper sur sa voie, s'il le peut maintenant :
    /// sa vague est au pied, aucun défenseur en vue, il a assez de PV.
    pub(super) fn siege_target(&self, i: usize, lane: Lane) -> Option<usize> {
        let c = &self.champs[i];
        if c.fighter.hp < SIEGE_MIN_HP * c.max_hp() || c.fighter.mode != Mode::Idle {
            return None;
        }
        let side = c.side;
        let wave = self
            .lanes
            .waves
            .iter()
            .filter(|w| w.side == side && w.lane == lane)
            .map(|w| w.d)
            .fold(None, |a: Option<f64>, d| Some(a.map_or(d, |a| a.max(d))))?;
        let b = self.lanes.next_target(side, lane, wave)?;
        let bld = &self.lanes.buildings[b];
        if bld.along(lane) - wave > WAVE_AT_STRUCTURE {
            return None;
        }
        let defended = self
            .champs
            .iter()
            .any(|o| o.side != side && o.alive() && o.pos.dist(bld.def.pos) <= DEFENDER_RANGE);
        (!defended).then_some(b)
    }

    /// Le champion `i` frappe le bâtiment `b` pendant `dt` secondes (attaques seulement).
    pub(super) fn hit_structure(&mut self, i: usize, b: usize, dt: f64) {
        let c = &self.champs[i];
        let dmg = c.ad()
            * c.crit_factor()
            * c.attack_speed()
            * dt
            * mitigate(1.0, rules::STRUCTURE_ARMOR)
            * self.power(c.side)
            * self.structure_power(c.side);
        self.champs[i].report.structure_damage += dmg;
        self.last_structure_hit[b] = Some((i, self.t));
        let bld = &mut self.lanes.buildings[b];
        bld.hp -= dmg;
        if !bld.alive() {
            self.lanes.destroy(b, self.t);
            self.structure_destroyed(b);
        }
    }

    /// Dégâts par seconde du champion `i` sur une vague quand il la pousse : attaques, plus ses
    /// sorts de dégâts à chaque recharge, multipliés par les sbires qu'ils touchent.
    /// Renvoie aussi le mana dépensé par seconde.
    /// `monster` : un seul grand monstre (les sorts ne touchent qu'une cible).
    pub(super) fn clear_dps(&self, i: usize, monster: bool) -> (f64, f64) {
        let c = &self.champs[i];
        let mut dps = c.ad() * c.crit_factor() * c.attack_speed();
        let mut mana = 0.0;
        if c.fighter.mana < PUSH_MANA * c.max_mana() && c.stats.mp > 0.0 {
            return (dps, 0.0);
        }
        if let Some(kit) = &c.fighter.kit {
            let stats = c.stat_block();
            let level = c.level();
            for (s, spell) in kit.spells.iter().enumerate().take(3) {
                let rank = c.fighter.ranks[s];
                let Some(f) = spell.damage.as_ref().filter(|_| rank > 0) else {
                    continue;
                };
                let cd = (spell.cooldown_at(rank) * c.haste_factor()).max(1.0);
                let targets = match spell.targeting {
                    _ if monster => 1.0,
                    Targeting::Area | Targeting::SelfCast => AREA_TARGETS,
                    Targeting::Skillshot => SKILLSHOT_TARGETS,
                    Targeting::Unit => 1.0,
                };
                dps += f.eval(rank, level, &stats).max(0.0) * targets / cd;
                mana += spell.cost_at(rank) / cd;
            }
        }
        (dps, mana)
    }

    /// Le champion `i` frappe la vague adverse la plus proche de lui sur sa voie, s'il est à
    /// portée. Renvoie vrai s'il a frappé.
    pub(super) fn push_wave(&mut self, i: usize, lane: Lane, dt: f64) -> bool {
        let c = &self.champs[i];
        let reach = c.stats.attack_range + 300.0; // estimé (sorts plus longs que les attaques)
        let target = self
            .lanes
            .waves
            .iter()
            .enumerate()
            .filter(|(_, w)| w.side != c.side && w.lane == lane && !w.minions.is_empty())
            .map(|(k, w)| (k, w.pos().dist(c.pos)))
            .filter(|&(_, d)| d <= reach)
            .min_by(|a, b| a.1.total_cmp(&b.1))
            .map(|(k, _)| k);
        let Some(k) = target else { return false };
        let (dps, mana) = self.clear_dps(i, false);
        let c = &mut self.champs[i];
        c.fighter.mana = (c.fighter.mana - mana * dt).max(0.0);
        let mut deaths = Vec::new();
        self.lanes.hit_wave(k, dps * dt, &mut deaths);
        self.lanes.waves.retain(|w| !w.minions.is_empty());
        self.farm(&deaths, Some(i));
        true
    }

    /// Une vague adverse au pied d'un bâtiment de la base (tour d'inhibiteur, inhibiteur, tours
    /// du Nexus, Nexus) de l'équipe `side` : sa voie et sa position.
    pub(super) fn base_threat(&self, side: usize) -> Option<(Lane, crate::geo::Point)> {
        let base = self.lanes.buildings.iter().filter(|b| {
            b.def.side == side
                && b.alive()
                && (b.def.lane.is_none()
                    || b.def.kind == StructureKind::Inhibitor
                    || b.def.id.contains("inhib"))
        });
        let mut best: Option<(f64, Lane, crate::geo::Point)> = None;
        for b in base {
            for w in self.lanes.waves.iter().filter(|w| w.side != side) {
                let d = w.pos().dist(b.def.pos);
                if d <= BASE_THREAT && best.is_none_or(|(bd, _, _)| d < bd) {
                    best = Some((d, w.lane, w.pos()));
                }
            }
        }
        best.map(|(_, l, p)| (l, p))
    }

    /// Plaques : chaque tranche de 1 000 PV perdue par une tour extérieure avant 14:00 rapporte
    /// de l'or aux champions adverses proches, même si ce sont les sbires qui l'ont fait tomber.
    pub(super) fn plates(&mut self) {
        if self.t >= rules::PLATES_END {
            return;
        }
        for b in 0..self.lanes.buildings.len() {
            let bld = &self.lanes.buildings[b];
            if bld.def.kind != StructureKind::Turret || !bld.def.id.contains("outer") {
                continue;
            }
            let lost = ((bld.def.max_hp - bld.hp.max(0.0)) / rules::PLATE_HP).floor() as u8;
            let lost = lost.min(rules::PLATES);
            let (side, pos) = (bld.def.side, bld.def.pos);
            while self.plates_taken[b] < lost {
                self.plates_taken[b] += 1;
                self.teams[1 - side].plates += 1;
                self.share_gold(1 - side, pos, rules::PLATE_GOLD);
            }
        }
    }

    /// L'or est partagé entre les champions vivants de `side` proches de `pos`.
    fn share_gold(&mut self, side: usize, pos: crate::geo::Point, gold: f64) {
        let near: Vec<usize> = (0..self.champs.len())
            .filter(|&j| {
                let c = &self.champs[j];
                c.side == side && c.alive() && c.pos.dist(pos) <= rules::STRUCTURE_GOLD_RANGE
            })
            .collect();
        for &j in &near {
            self.champs[j].earn(gold / near.len() as f64);
        }
    }

    /// Un bâtiment vient de tomber : événement, or, et victoire si c'est un Nexus.
    pub(super) fn structure_destroyed(&mut self, b: usize) {
        let t = self.t;
        let def = self.lanes.buildings[b].def.clone();
        let by = self.last_structure_hit[b]
            .filter(|(_, at)| t - at <= LAST_HIT_WINDOW)
            .map(|(i, _)| i);
        let winners = 1 - def.side;
        self.events.push(Event::Structure {
            t,
            id: def.id.to_string(),
            team: winners,
            by,
        });
        match def.kind {
            StructureKind::Turret => self.teams[winners].towers += 1,
            StructureKind::Inhibitor => self.teams[winners].inhibitors += 1,
            StructureKind::Nexus => self.winner = Some(winners),
        }
        let (local, global) = rules::structure_gold(def.id, def.kind);
        self.share_gold(winners, def.pos, local);
        for c in self.champs.iter_mut().filter(|c| c.side == winners) {
            c.earn(global);
        }
    }

    /// Les inhibiteurs revenus : un événement pour la vue.
    pub(super) fn structures_respawned(&mut self) {
        for b in std::mem::take(&mut self.lanes.respawned) {
            let def = &self.lanes.buildings[b].def;
            self.plates_taken[b] = 0;
            self.events.push(Event::StructureRespawn {
                t: self.t,
                id: def.id.to_string(),
                team: def.side,
            });
        }
    }
}

#[cfg(test)]
mod tests {
    use super::super::{new_game, tests::setup};
    use super::*;
    use crate::map;
    use crate::waves::Wave;

    fn building(g: &Game, id: &str) -> usize {
        g.lanes
            .buildings
            .iter()
            .position(|b| b.def.id == id)
            .unwrap()
    }

    /// Une vague bleue au pied de la tour extérieure rouge du milieu.
    fn wave_at(g: &mut Game, id: &str) {
        let b = building(g, id);
        let d = g.lanes.buildings[b].along(Lane::Mid) - 400.0;
        let minions = g
            .lanes
            .waves
            .first()
            .map_or_else(Vec::new, |w| w.minions.clone());
        g.lanes.waves.clear();
        g.lanes.waves.push(Wave {
            id: 99,
            side: 0,
            lane: Lane::Mid,
            d,
            minions: if minions.is_empty() {
                vec![crate::waves::Minion {
                    kind: rules::MinionKind::Melee,
                    hp: 1e9,
                }]
            } else {
                minions
            },
        });
    }

    #[test]
    fn un_champion_frappe_la_tour_derriere_sa_vague_et_prend_les_plaques() {
        let (mut g, _) = new_game(&setup(1, 600.0));
        g.t = 300.0;
        for c in &mut g.champs {
            c.pos = map::fountain(c.side);
        }
        wave_at(&mut g, "red_mid_outer");
        let b = building(&g, "red_mid_outer");
        let mid = 2; // milieu bleu
        g.champs[mid].pos = g.lanes.buildings[b].def.pos.toward(map::fountain(0), 500.0);
        assert_eq!(g.siege_target(mid, Lane::Mid), Some(b));
        let gold = g.champs[mid].gold;
        let hp = g.lanes.buildings[b].hp;
        // Assez de coups pour faire tomber une plaque.
        while g.lanes.buildings[b].hp > hp - rules::PLATE_HP {
            g.hit_structure(mid, b, 1.0);
        }
        g.plates();
        assert_eq!(g.teams[0].plates, 1);
        assert!(g.champs[mid].gold >= gold + rules::PLATE_GOLD - 1e-9);
        // Un défenseur rouge arrive : on ne frappe plus.
        g.champs[7].pos = g.lanes.buildings[b].def.pos;
        assert_eq!(g.siege_target(mid, Lane::Mid), None);
    }

    #[test]
    fn la_chute_du_nexus_finit_la_partie() {
        let (mut g, _) = new_game(&setup(1, 600.0));
        g.t = 1500.0;
        let b = building(&g, "red_nexus");
        g.champs[2].pos = g.lanes.buildings[b].def.pos;
        g.lanes.buildings[b].hp = 1.0;
        g.hit_structure(2, b, 1.0);
        assert_eq!(g.winner, Some(0));
        let ev = g.events.iter().find_map(|e| match e {
            Event::Structure { id, team, by, .. } => Some((id.clone(), *team, *by)),
            _ => None,
        });
        // L'événement nomme l'équipe qui détruit, et le champion qui a donné le dernier coup.
        assert_eq!(ev, Some(("red_nexus".to_string(), 0, Some(2))));
    }

    #[test]
    fn l_inhibiteur_revient_et_libere_les_super_sbires() {
        let (mut g, _) = new_game(&setup(1, 600.0));
        let b = building(&g, "red_inhibitor_mid");
        g.t = 600.0;
        g.lanes.destroy(b, g.t);
        g.structure_destroyed(b);
        assert_eq!(g.teams[0].inhibitors, 1);
        // La vague bleue suivante du milieu porte un super sbire.
        g.lanes.waves.clear();
        g.lanes.step(630.0, 1.0);
        let blue_mid = g
            .lanes
            .waves
            .iter()
            .find(|w| w.side == 0 && w.lane == Lane::Mid)
            .unwrap();
        assert!(blue_mid
            .minions
            .iter()
            .any(|m| m.kind == rules::MinionKind::Super));
        // Cinq minutes plus tard, il est de retour.
        g.lanes.step(600.0 + rules::INHIBITOR_RESPAWN, 1.0);
        g.structures_respawned();
        assert!(g.lanes.buildings[b].alive());
        assert!(g
            .events
            .iter()
            .any(|e| matches!(e, Event::StructureRespawn { .. })));
    }
}
