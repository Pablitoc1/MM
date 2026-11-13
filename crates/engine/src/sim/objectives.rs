//! Grands objectifs (M5b, note 016) : dragons et dragon ancestral, larves du Néant, Héraut,
//! Nashor. Qui les prend, comment, et ce qu'ils rapportent. Les chiffres viennent du wiki
//! (saison 2025) et sont estimés.

use super::{Game, Mode};
use crate::geo::Point;
use crate::map::CampKind;
use crate::player::Attr;
use crate::replay::{Event, Role};

const DRAGONS: [&str; 6] = [
    "Infernal", "Océan", "Montagne", "Nuage", "Chimtech", "Hextech",
];
pub const ELDER: &str = "Ancestral";
pub const GRUBS: &str = "Larves du Néant";
pub const HERALD: &str = "Héraut de la faille";
pub const BARON: &str = "Nashor";

// ---- Calendrier (estimé, wiki saison 2025) ----
const DRAGON_FIRST: f64 = 300.0;
const DRAGON_RESPAWN: f64 = 300.0;
const ELDER_RESPAWN: f64 = 360.0;
/// Âme : quatre dragons pour une équipe.
const SOUL: usize = 4;
const GRUBS_FIRST: f64 = 360.0;
const GRUBS_RESPAWN: f64 = 240.0;
/// La seconde vague de larves n'apparaît que si elle peut le faire avant cet instant.
const GRUBS_LAST_SPAWN: f64 = 825.0;
const HERALD_SPAWN: f64 = 900.0;
const HERALD_DESPAWN: f64 = 1485.0;
const BARON_SPAWN: f64 = 1500.0;
const BARON_RESPAWN: f64 = 360.0;

// ---- Effets (estimés) ----
/// Chaque dragon élémentaire : dégâts de l'équipe en plus (bonus moyen des six dragons).
const DRAGON_POWER: f64 = 0.04;
const SOUL_POWER: f64 = 0.12;
const ELDER_POWER: f64 = 0.35;
const ELDER_DURATION: f64 = 150.0;
const BARON_POWER: f64 = 0.15;
const BARON_DURATION: f64 = 180.0;
/// Or donné par le Nashor à chaque membre vivant de l'équipe.
const BARON_GOLD: f64 = 300.0;
/// Sbires renforcés par le Nashor : dégâts aux bâtiments et aux vagues.
const BARON_MINIONS_STRUCTURE: f64 = 2.5;
const BARON_MINIONS_WAVE: f64 = 1.5;
/// Chaque larve : dégâts des champions aux bâtiments en plus.
const GRUB_STRUCTURE: f64 = 0.08;
/// Dégâts du Héraut sur la première tour adverse debout.
const HERALD_CHARGE: f64 = 3000.0;
/// XP donnée à chaque participant.
const OBJECTIVE_XP: f64 = 300.0;
/// Châtiment : dégâts bruts qui achèvent le monstre.
const SMITE: f64 = 1200.0;
/// Chance de base qu'un jungler adverse vole le monstre au châtiment.
const STEAL: f64 = 0.10;

/// Un champion compte sur l'objectif à cette distance de la fosse.
pub(super) const PIT_RANGE: f64 = 800.0;
/// Un champion vient aider sur l'objectif s'il est à moins de cette distance.
pub(super) const ROTATE_RANGE: f64 = 9000.0;

/// Ce que chaque équipe a pris aux monstres.
#[derive(Debug, Clone, Default, PartialEq)]
pub struct ObjectiveReport {
    pub dragons: Vec<String>,
    pub elders: u32,
    pub grubs: u32,
    pub heralds: u32,
    pub barons: u32,
}

#[derive(Debug, Clone, Default)]
pub(super) struct Objectives {
    pub teams: [ObjectiveReport; 2],
    /// Monstre présent ou à venir dans chaque fosse.
    pub dragon: Option<&'static str>,
    pub pit: Option<&'static str>,
    pub grub_waves: u32,
    pub elder_until: [f64; 2],
    pub baron_until: [f64; 2],
    /// L'équipe joue-t-elle la vague de larves en cours ? (tiré une fois par vague)
    pub grubs_wanted: [Option<bool>; 2],
}

impl Game {
    /// Index du camp `dragon` et du camp `baron` (la fosse du haut).
    pub(super) fn objective_camps(&self) -> (usize, usize) {
        let find = |k: CampKind| self.camps.iter().position(|c| c.def.kind == k).unwrap();
        (find(CampKind::Dragon), find(CampKind::Baron))
    }

    /// Monstre du camp `k` (dragon ou fosse du haut), s'il y en a un.
    pub(super) fn variant(&self, k: usize) -> Option<&'static str> {
        match self.camps[k].def.kind {
            CampKind::Dragon => self.obj.dragon,
            _ => self.obj.pit,
        }
    }

    /// Apparition des dragons et des monstres de la fosse du haut, selon le calendrier.
    pub(super) fn spawn_objectives(&mut self) {
        let t = self.t;
        let (dk, bk) = self.objective_camps();
        if t == 0.0 {
            self.camps[dk].next_spawn = DRAGON_FIRST;
            self.camps[bk].next_spawn = GRUBS_FIRST;
        }
        // La fosse du haut : larves, puis Héraut, puis Nashor. Un monstre pas pris s'en va
        // quand le suivant arrive.
        let leaves = match self.obj.pit {
            Some(GRUBS) => Some((HERALD_SPAWN, HERALD_SPAWN)),
            Some(HERALD) => Some((HERALD_DESPAWN, BARON_SPAWN)),
            _ => None,
        };
        if let Some((at, next)) = leaves {
            if self.camps[bk].alive && t >= at {
                self.camps[bk].alive = false;
                self.camps[bk].next_spawn = next;
                self.obj.pit = None;
            }
        }
        for k in [dk, bk] {
            if self.camps[k].alive || t < self.camps[k].next_spawn {
                continue;
            }
            let variant = if k == dk {
                let soul = self.obj.teams.iter().any(|r| r.dragons.len() >= SOUL);
                if soul {
                    ELDER
                } else {
                    DRAGONS[(self.rng.next_u64() % 6) as usize]
                }
            } else if t < HERALD_SPAWN && self.obj.grub_waves < 2 {
                GRUBS
            } else if t < HERALD_DESPAWN && self.obj.teams.iter().all(|r| r.heralds == 0) {
                HERALD
            } else if t >= BARON_SPAWN {
                BARON
            } else {
                self.camps[k].next_spawn = BARON_SPAWN;
                continue;
            };
            if k == dk {
                self.obj.dragon = Some(variant);
            } else {
                self.obj.pit = Some(variant);
                if variant == GRUBS {
                    self.obj.grub_waves += 1;
                }
            }
            self.camps[k].alive = true;
            self.camps[k].hp = self.monster_hp(variant);
            self.events.push(Event::CampSpawn {
                t,
                camp: self.camps[k].def.id.to_string(),
                variant: Some(variant.to_string()),
            });
        }
    }

    /// PV d'un grand monstre : ils grandissent avec la partie. estimé (wiki)
    fn monster_hp(&self, variant: &str) -> f64 {
        let minutes = self.t / 60.0;
        match variant {
            GRUBS => 3.0 * (1500.0 + 40.0 * minutes),
            HERALD => 6000.0 + 120.0 * minutes,
            BARON => 12000.0 + 190.0 * (minutes - 25.0).max(0.0),
            ELDER => 6400.0 + 180.0 * minutes,
            _ => 3500.0 + 120.0 * minutes,
        }
    }

    /// Multiplicateur des dégâts des champions d'une équipe : dragons, âme, ancestral, Nashor.
    pub(super) fn power(&self, side: usize) -> f64 {
        let r = &self.obj.teams[side];
        let elemental = r.dragons.iter().filter(|d| **d != ELDER).count();
        let mut p = 1.0 + DRAGON_POWER * elemental.min(SOUL) as f64;
        if elemental >= SOUL {
            p += SOUL_POWER;
        }
        if self.t < self.obj.elder_until[side] {
            p += ELDER_POWER;
        }
        if self.t < self.obj.baron_until[side] {
            p += BARON_POWER;
        }
        p
    }

    /// Dégâts des champions d'une équipe aux bâtiments : larves.
    pub(super) fn structure_power(&self, side: usize) -> f64 {
        1.0 + GRUB_STRUCTURE * f64::from(self.obj.teams[side].grubs)
    }

    /// Sbires renforcés par le Nashor (pour la simulation des vagues).
    pub(super) fn minion_buffs(&mut self) {
        for side in 0..2 {
            let on = self.t < self.obj.baron_until[side];
            self.lanes.buffs[side] = if on {
                (BARON_MINIONS_WAVE, BARON_MINIONS_STRUCTURE)
            } else {
                (1.0, 1.0)
            };
        }
    }

    /// Les rôles qui viennent sur un objectif : le jungler et les voies proches.
    pub(super) fn objective_roles(&self, k: usize) -> &'static [Role] {
        match self.camps[k].def.kind {
            CampKind::Dragon => &[Role::Jungle, Role::Bot, Role::Support, Role::Mid],
            _ => &[Role::Jungle, Role::Top, Role::Mid],
        }
    }

    /// Champions de `side` qui peuvent venir sur l'objectif `k` (vivants, pas en retour à la
    /// base, assez près, et de l'un des rôles concernés).
    pub(super) fn available(&self, side: usize, k: usize) -> usize {
        let pos = self.camps[k].def.pos;
        let roles = self.objective_roles(k);
        self.champs
            .iter()
            .filter(|c| {
                c.side == side
                    && c.alive()
                    && c.recall_until.is_none()
                    && roles.contains(&c.role)
                    && c.pos.dist(pos) < ROTATE_RANGE
            })
            .count()
    }

    /// Le jungler `i` choisit-il d'aller sur un objectif ? Il y va quand le monstre est là (ou
    /// le sera dans 30 s) et que son équipe a au moins autant de monde disponible que l'autre.
    pub(super) fn pick_objective(&mut self, i: usize) -> Option<usize> {
        let (dk, bk) = self.objective_camps();
        let side = self.champs[i].side;
        let z = self.champs[i].attrs.z(Attr::Decision);
        for k in [bk, dk] {
            let camp = &self.camps[k];
            let soon = camp.alive || camp.next_spawn - self.t <= 30.0;
            if !soon {
                continue;
            }
            let (ours, theirs) = (self.available(side, k), self.available(1 - side, k));
            if ours == 0 || ours < theirs {
                continue;
            }
            if self.risky(k) && (ours < theirs + RISKY_EDGE || self.dead(1 - side) == 0) {
                continue;
            }
            // Chaque vague de larves, l'équipe décide une fois si elle la joue (souvent elle
            // passe pour farmer ou ganker : en LEC 2025, 4,6 larves sur 6 sont prises).
            if k == bk && self.grubs_next() {
                let wanted = match self.obj.grubs_wanted[side] {
                    Some(w) => w,
                    None => {
                        let w = self.rng.chance(GRUBS_PLAY);
                        self.obj.grubs_wanted[side] = Some(w);
                        w
                    }
                };
                if !wanted {
                    continue;
                }
            }
            // Un peu de hasard : on ne joue pas chaque objectif dès qu'il est là. estimé
            let p = if theirs == 0 { 0.9 } else { 0.5 + 0.1 * z };
            if self.rng.chance(p.clamp(0.1, 0.95)) {
                return Some(k);
            }
        }
        None
    }

    /// Nashor et ancestral : on ne s'y lance qu'avec un avantage numérique (un adversaire mort,
    /// et plus de monde autour), comme en compétition où ils se jouent après un pick. estimé
    pub(super) fn risky(&self, k: usize) -> bool {
        matches!(self.variant(k), Some(BARON) | Some(ELDER))
    }

    /// Le monstre (présent ou à venir) de la fosse du haut est-il une vague de larves ?
    fn grubs_next(&self) -> bool {
        let (_, bk) = self.objective_camps();
        match self.variant(bk) {
            Some(v) => v == GRUBS,
            None => self.camps[bk].next_spawn < HERALD_SPAWN,
        }
    }

    /// Champions morts de `side`.
    pub(super) fn dead(&self, side: usize) -> usize {
        self.champs
            .iter()
            .filter(|c| c.side == side && !c.alive())
            .count()
    }

    /// Une seconde sur les objectifs : l'équipe seule dans la fosse frappe le monstre, le
    /// jungler l'achève au châtiment (un jungler adverse proche peut le voler).
    pub(super) fn objectives(&mut self, dt: f64) {
        let (dk, bk) = self.objective_camps();
        for k in [dk, bk] {
            if !self.camps[k].alive {
                continue;
            }
            let pos = self.camps[k].def.pos;
            let near = |side: usize| -> Vec<usize> {
                (0..self.champs.len())
                    .filter(|&j| {
                        let c = &self.champs[j];
                        c.side == side
                            && c.alive()
                            && c.recall_until.is_none()
                            && c.pos.dist(pos) <= PIT_RANGE
                    })
                    .collect()
            };
            let (blue, red) = (near(0), near(1));
            // Les deux équipes dans la fosse : elles se battent d'abord.
            let side = match (blue.is_empty(), red.is_empty()) {
                (false, true) => 0,
                (true, false) => 1,
                _ => continue,
            };
            // On ne frappe un grand monstre que si on est venu pour lui (pas en passant).
            let planned = self
                .champs
                .iter()
                .any(|c| c.side == side && c.plan == super::Plan::Objective(k));
            if !planned {
                continue;
            }
            let team = if side == 0 { &blue } else { &red };
            let dps: f64 = team
                .iter()
                .filter(|&&j| self.champs[j].fighter.mode == Mode::Idle)
                .map(|&j| self.clear_dps(j, true).0 * self.power(side))
                .sum();
            self.camps[k].hp -= dps * dt;
            let smiter = team
                .iter()
                .copied()
                .find(|&j| self.champs[j].role == Role::Jungle);
            let finish = self.camps[k].hp <= 0.0 || (smiter.is_some() && self.camps[k].hp <= SMITE);
            if !finish {
                continue;
            }
            // Vol au châtiment : le jungler adverse à portée tente sa chance.
            let thief = (0..self.champs.len()).find(|&j| {
                let c = &self.champs[j];
                c.side != side && c.alive() && c.role == Role::Jungle && c.pos.dist(pos) <= 1200.0
            });
            let mut winner = (side, smiter.or(team.first().copied()));
            if let Some(j) = thief {
                let z = self.champs[j].attrs.z(Attr::Mechanics)
                    - smiter.map_or(0.0, |s| self.champs[s].attrs.z(Attr::Mechanics));
                if self.rng.chance((STEAL + 0.05 * z).clamp(0.02, 0.3)) {
                    winner = (1 - side, Some(j));
                }
            }
            self.objective_taken(k, winner.0, winner.1, team);
        }
    }

    /// Le monstre `k` est pris par `side` : récompenses, effets, événement, réapparition.
    fn objective_taken(&mut self, k: usize, side: usize, by: Option<usize>, team: &[usize]) {
        let t = self.t;
        let (dk, _) = self.objective_camps();
        let variant = self.variant(k).unwrap_or(BARON);
        let respawn = match variant {
            ELDER => Some(t + ELDER_RESPAWN),
            BARON => Some(t + BARON_RESPAWN),
            GRUBS if t + GRUBS_RESPAWN <= GRUBS_LAST_SPAWN && self.obj.grub_waves < 2 => {
                Some(t + GRUBS_RESPAWN)
            }
            GRUBS | HERALD => Some(if t < HERALD_SPAWN {
                HERALD_SPAWN
            } else {
                BARON_SPAWN
            }),
            _ => {
                // Le quatrième dragon donne l'âme : le suivant est l'ancestral.
                let soul = self.obj.teams[side].dragons.len() + 1 >= SOUL && variant != ELDER;
                Some(t + if soul { ELDER_RESPAWN } else { DRAGON_RESPAWN })
            }
        };
        let camp = &mut self.camps[k];
        camp.alive = false;
        camp.hp = 0.0;
        camp.next_spawn = respawn.unwrap_or(f64::MAX);
        self.events.push(Event::CampKilled {
            t,
            camp: camp.def.id.to_string(),
            team: side,
            respawn_at: respawn,
            by,
        });
        let r = &mut self.obj.teams[side];
        match variant {
            GRUBS => {
                r.grubs += 3;
                self.obj.grubs_wanted = [None; 2];
            }
            HERALD => r.heralds += 1,
            BARON => {
                r.barons += 1;
                self.obj.baron_until[side] = t + BARON_DURATION;
                for c in self
                    .champs
                    .iter_mut()
                    .filter(|c| c.side == side && c.alive())
                {
                    c.earn(BARON_GOLD);
                }
            }
            ELDER => {
                r.elders += 1;
                self.obj.elder_until[side] = t + ELDER_DURATION;
            }
            d => r.dragons.push(d.to_string()),
        }
        if k == dk {
            self.obj.dragon = None;
        } else {
            self.obj.pit = None;
        }
        for &j in team {
            if self.champs[j].side == side {
                self.champs[j].xp += OBJECTIVE_XP;
            }
        }
        // Les plans tournés vers ce monstre sont finis.
        for c in &mut self.champs {
            if c.plan == super::Plan::Objective(k) {
                c.plan = super::Plan::None;
            }
        }
        if variant == HERALD {
            self.herald_charge(side);
        }
    }

    /// Le Héraut charge la première tour adverse debout (milieu, puis haut, puis bas).
    fn herald_charge(&mut self, side: usize) {
        use crate::geo::Lane;
        for lane in [Lane::Mid, Lane::Top, Lane::Bot] {
            let target = self
                .lanes
                .buildings
                .iter()
                .enumerate()
                .filter(|(_, b)| {
                    b.def.side != side
                        && b.alive()
                        && b.def.lane == Some(lane)
                        && b.def.kind == crate::map::StructureKind::Turret
                })
                .min_by(|a, b| a.1.along(lane).total_cmp(&b.1.along(lane)))
                .map(|(b, _)| b);
            if let Some(b) = target {
                let bld = &mut self.lanes.buildings[b];
                bld.hp -= HERALD_CHARGE;
                if !bld.alive() {
                    self.lanes.destroy(b, self.t);
                    self.structure_destroyed(b);
                }
                return;
            }
        }
    }

    /// Où se placer pour l'objectif `k` : dans la fosse, sauf si l'adversaire y est en plus grand
    /// nombre que ceux de son équipe déjà regroupés ; on attend alors les autres un peu en retrait
    /// pour entrer ensemble (pas un par un).
    pub(super) fn objective_spot(&self, k: usize, side: usize) -> Point {
        let pit = self.camps[k].def.pos;
        let staging = pit.toward(crate::map::fountain(side), STAGING_BACK);
        let count = |s: usize, at: Point, r: f64| {
            self.champs
                .iter()
                .filter(|c| c.side == s && c.alive() && c.pos.dist(at) <= r)
                .count()
        };
        let theirs = count(1 - side, pit, 1500.0);
        let ours = count(side, staging, 2200.0);
        if theirs > 0 && ours < theirs {
            staging
        } else {
            pit
        }
    }

    pub(super) fn objective_report(&self) -> [ObjectiveReport; 2] {
        self.obj.teams.clone()
    }

    /// Un gank pour le jungler `i` : un adversaire de voie avancé loin de sa tour, face à un
    /// coéquipier présent. Le plus proche du jungler, avec une chance qui dépend de sa lecture
    /// de la carte. estimé
    pub(super) fn pick_gank(&mut self, i: usize) -> Option<usize> {
        let me = &self.champs[i];
        let side = me.side;
        let mut best: Option<(f64, usize)> = None;
        for (j, o) in self.champs.iter().enumerate() {
            if o.side == side || !o.alive() || o.recall_until.is_some() || o.role == Role::Jungle {
                continue;
            }
            if self.under_enemy_turret(side, o.pos) || self.near_own_turret(o.side, o.pos) {
                continue;
            }
            let ally = self.champs.iter().any(|a| {
                a.side == side
                    && a.alive()
                    && a.role != Role::Jungle
                    && a.role.lane() == o.role.lane()
                    && a.pos.dist(o.pos) <= GANK_ALLY_RANGE
            });
            let d = self.nav.route_length(me.pos, o.pos);
            if ally && d <= GANK_RANGE && best.is_none_or(|(bd, _)| d < bd) {
                best = Some((d, j));
            }
        }
        let (_, j) = best?;
        let z = 0.5 * (me.attrs.z(Attr::MapReading) + me.attrs.z(Attr::Skirmish));
        self.rng
            .chance((GANK_CHANCE + 0.05 * z).clamp(0.05, 0.6))
            .then_some(j)
    }

    /// `p` est-il à moins de `NEAR_TURRET` d'une tour de `side` ?
    fn near_own_turret(&self, side: usize, p: Point) -> bool {
        self.lanes.buildings.iter().any(|b| {
            b.def.side == side
                && b.alive()
                && b.def.kind == crate::map::StructureKind::Turret
                && b.def.pos.dist(p) <= NEAR_TURRET
        })
    }
}

/// Chance qu'une équipe joue une vague de larves. estimé, calé sur les 4,6 larves par partie
/// de la LEC 2025.
const GRUBS_PLAY: f64 = 0.62;

/// Avantage numérique (joueurs disponibles en plus) pour lancer Nashor ou l'ancestral.
const RISKY_EDGE: usize = 1; // estimé

/// Les joueurs de voie rejoignent l'objectif quand il apparaît dans moins de ce délai…
pub(super) const JOIN_BEFORE: f64 = 10.0; // estimé
/// … et que leur jungler est à moins de cette distance de la fosse.
pub(super) const JUNGLER_THERE: f64 = 3000.0; // estimé

/// Point de regroupement avant d'entrer dans une fosse occupée : en retrait vers sa base.
const STAGING_BACK: f64 = 1500.0; // estimé

/// Un jungler va ganker une cible à moins de cette distance (en chemin).
const GANK_RANGE: f64 = 6000.0; // estimé
/// Le coéquipier de voie doit être à moins de cette distance de la cible.
const GANK_ALLY_RANGE: f64 = 1600.0; // estimé
/// Une cible à moins de cette distance de sa tour n'est pas gankable.
const NEAR_TURRET: f64 = 1600.0; // estimé
/// Chance de partir ganker quand une cible se présente (à chaque choix du jungler).
const GANK_CHANCE: f64 = 0.12; // estimé
/// Durée maximale d'un gank avant d'abandonner.
pub(super) const GANK_TIMEOUT: f64 = 35.0; // estimé

#[cfg(test)]
mod tests {
    use super::super::{new_game, simulate, tests::setup, Plan};
    use super::*;

    fn champ(g: &Game, side: usize, role: Role) -> usize {
        g.champs
            .iter()
            .position(|c| c.side == side && c.role == role)
            .unwrap()
    }

    /// Une partie au moment `t`, avec les monstres de ce moment apparus.
    fn game_at(t: f64) -> Game {
        let (mut g, _) = new_game(&setup(5, 1800.0));
        g.t = t;
        g.spawn_objectives();
        g
    }

    /// Envoie `who` dans la fosse `k`, venus pour le monstre.
    fn send(g: &mut Game, k: usize, who: &[usize]) {
        let pos = g.camps[k].def.pos;
        for &i in who {
            g.champs[i].pos = pos;
            g.champs[i].plan = Plan::Objective(k);
        }
    }

    #[test]
    fn le_calendrier_des_monstres() {
        let r = simulate(&setup(3, 1560.0));
        let spawn = |variant: &str| {
            r.replay.events.iter().find_map(|e| match e {
                Event::CampSpawn {
                    t,
                    variant: Some(v),
                    ..
                } if v == variant => Some(*t),
                _ => None,
            })
        };
        let first_dragon = r.replay.events.iter().find_map(|e| match e {
            Event::CampSpawn { t, camp, .. } if camp == "dragon" => Some(*t),
            _ => None,
        });
        assert_eq!(first_dragon, Some(DRAGON_FIRST));
        assert_eq!(spawn(GRUBS), Some(GRUBS_FIRST));
        let herald = spawn(HERALD).expect("le Héraut apparaît");
        assert!((HERALD_SPAWN..BARON_SPAWN).contains(&herald));
        assert_eq!(spawn(BARON), Some(BARON_SPAWN));
    }

    #[test]
    fn un_dragon_pris_renforce_son_equipe() {
        let mut g = game_at(DRAGON_FIRST);
        let (dk, _) = g.objective_camps();
        assert!(g.camps[dk].alive);
        let team = [
            champ(&g, 0, Role::Jungle),
            champ(&g, 0, Role::Bot),
            champ(&g, 0, Role::Support),
        ];
        send(&mut g, dk, &team);
        for _ in 0..300 {
            g.objectives(1.0);
            if !g.camps[dk].alive {
                break;
            }
        }
        assert!(!g.camps[dk].alive, "le dragon tombe");
        assert_eq!(g.obj.teams[0].dragons.len(), 1);
        assert!(g.power(0) > 1.0);
        assert_eq!(g.power(1), 1.0);
        assert!(
            g.champs.iter().all(|c| c.plan != Plan::Objective(dk)),
            "plan terminé"
        );
    }

    #[test]
    fn le_chatiment_acheve_et_peut_etre_vole() {
        let mut g = game_at(DRAGON_FIRST);
        let (dk, _) = g.objective_camps();
        let jungler = champ(&g, 0, Role::Jungle);
        send(&mut g, dk, &[jungler]);
        g.camps[dk].hp = SMITE - 1.0;
        g.objectives(0.0);
        assert!(!g.camps[dk].alive, "achevé au châtiment");
        let by = g.events.iter().rev().find_map(|e| match e {
            Event::CampKilled { by, team, .. } => Some((*by, *team)),
            _ => None,
        });
        assert_eq!(by, Some((Some(jungler), 0)));

        // Un jungler adverse à portée vole parfois le monstre.
        let mut steals = 0;
        for seed in 0..200 {
            let (mut g, _) = new_game(&setup(seed, 1800.0));
            g.t = DRAGON_FIRST;
            g.spawn_objectives();
            let jungler = champ(&g, 0, Role::Jungle);
            let thief = champ(&g, 1, Role::Jungle);
            send(&mut g, dk, &[jungler]);
            let pos = g.camps[dk].def.pos;
            g.champs[thief].pos = Point::new(pos.x + 1000.0, pos.y);
            g.camps[dk].hp = 1.0;
            g.objectives(0.0);
            if g.obj.teams[1].dragons.len() == 1 {
                steals += 1;
            }
        }
        assert!((5..60).contains(&steals), "vols : {steals} sur 200");
    }

    #[test]
    fn deux_equipes_dans_la_fosse_se_battent_d_abord() {
        let mut g = game_at(DRAGON_FIRST);
        let (dk, _) = g.objective_camps();
        let blue = champ(&g, 0, Role::Jungle);
        let red = champ(&g, 1, Role::Jungle);
        send(&mut g, dk, &[blue, red]);
        let hp = g.camps[dk].hp;
        g.objectives(1.0);
        assert_eq!(g.camps[dk].hp, hp);
        // De passage sans être venu pour lui : on ne le frappe pas non plus.
        g.champs[red].pos = Point::new(0.0, 0.0);
        g.champs[blue].plan = Plan::None;
        g.objectives(1.0);
        assert_eq!(g.camps[dk].hp, hp);
    }

    #[test]
    fn le_nashor_donne_or_et_sbires_renforces() {
        let mut g = game_at(BARON_SPAWN);
        let (_, bk) = g.objective_camps();
        assert_eq!(g.variant(bk), Some(BARON));
        let team: Vec<usize> = (0..g.champs.len())
            .filter(|&i| g.champs[i].side == 0)
            .collect();
        let gold: Vec<f64> = team.iter().map(|&i| g.champs[i].gold).collect();
        send(&mut g, bk, &team);
        g.camps[bk].hp = 1.0;
        g.objectives(0.0);
        assert_eq!(g.obj.teams[0].barons, 1);
        for (&i, before) in team.iter().zip(gold) {
            assert_eq!(g.champs[i].gold, before + BARON_GOLD);
        }
        g.minion_buffs();
        assert!(g.lanes.buffs[0].1 > 1.0 && g.lanes.buffs[1] == (1.0, 1.0));
        assert!(g.power(0) > 1.0);
        g.t += BARON_DURATION + 1.0;
        g.minion_buffs();
        assert_eq!(g.lanes.buffs[0], (1.0, 1.0), "le buff s'arrête");
    }

    #[test]
    fn nashor_seulement_avec_l_avantage_numerique() {
        let mut g = game_at(BARON_SPAWN);
        let (_, bk) = g.objective_camps();
        let jungler = champ(&g, 0, Role::Jungle);
        // Tout le monde près de la fosse, personne de mort : on ne lance pas le Nashor.
        let pos = g.camps[bk].def.pos;
        for c in &mut g.champs {
            c.pos = pos;
        }
        assert!((0..200).all(|_| g.pick_objective(jungler) != Some(bk)));
        // Un adversaire mort : on y va.
        let red_mid = champ(&g, 1, Role::Mid);
        g.champs[red_mid].fighter.dead_until = Some(g.t + 30.0);
        assert!((0..200).any(|_| g.pick_objective(jungler) == Some(bk)));
    }

    #[test]
    fn le_jungler_gank_un_adversaire_avance() {
        let (mut g, _) = new_game(&setup(9, 1800.0));
        g.t = 400.0;
        let jungler = champ(&g, 0, Role::Jungle);
        let (ally, target) = (champ(&g, 0, Role::Mid), champ(&g, 1, Role::Mid));
        // Le milieu rouge loin de ses tours, face au milieu bleu ; le jungler bleu tout près.
        let spot = Point::new(6800.0, 6900.0);
        g.champs[target].pos = spot;
        g.champs[ally].pos = Point::new(spot.x - 500.0, spot.y - 500.0);
        g.champs[jungler].pos = Point::new(spot.x - 2000.0, spot.y);
        assert!((0..200).any(|_| g.pick_gank(jungler) == Some(target)));
        // Sous sa tour, il n'est pas gankable.
        let tower = g
            .lanes
            .buildings
            .iter()
            .find(|b| b.def.id == "red_mid_outer")
            .unwrap()
            .def
            .pos;
        g.champs[target].pos = tower;
        g.champs[ally].pos = Point::new(tower.x - 500.0, tower.y - 500.0);
        assert!((0..200).all(|_| g.pick_gank(jungler) != Some(target)));
    }
}
