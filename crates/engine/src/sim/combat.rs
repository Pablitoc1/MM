//! Combat entre champions (M4b, note 012) : attaques, sorts du patch 26.1, contrôles, boucliers,
//! soins, tirs des tours, morts, primes, XP et réapparition. Pas de 0,25 s pendant un combat.
//!
//! Le choix de se battre est local (chaque champion juge le rapport de force autour de lui) :
//! le plan d'équipe, les rotations et les objectifs arrivent en M5.

use super::{Champ, Game};
use crate::geo::Point;
use crate::kit::{mitigate, CcKind, DamageType, Kit, Spell, StatBlock, Targeting};
use crate::map::{self, StructureKind};
use crate::player::Attr;
use crate::replay::Event;
use crate::rules;

/// Pas de temps du combat, en secondes (fiche M4).
pub const COMBAT_DT: f64 = 0.25;
/// Distance à laquelle deux champions ennemis peuvent entrer en combat.
const ENGAGE_RANGE: f64 = 1000.0; // estimé
/// Rayon dans lequel on compte les alliés et les ennemis pour juger un combat.
const FIGHT_RADIUS: f64 = 1500.0; // estimé
/// Avantage de force qu'un joueur moyen demande pour engager.
const ENGAGE_EDGE: f64 = 1.4; // estimé, calé sur les kills LEC (rapport M4c)
/// Sous cet avantage, on quitte le combat.
const RETREAT_EDGE: f64 = 0.75; // estimé
/// Chance par seconde, à force égale, de lancer un échange de sorts en voie.
const TRADE_CHANCE: f64 = 0.03; // estimé
const TRADE_LENGTH: f64 = 2.5; // estimé
/// Part des PV sous laquelle un champion rentre à la base.
const LOW_HP: f64 = 0.30; // estimé
/// Recharge minimale d'un sort à charges ou à posture (le fichier du jeu donne 0 ou 1 s).
const MIN_COOLDOWN: f64 = 4.0; // estimé
/// Poursuite abandonnée après autant de secondes sans toucher la cible.
const CHASE_GIVE_UP: f64 = 4.0; // estimé
const FLASH_RANGE: f64 = 400.0; // estimé (wiki)
const FLASH_COOLDOWN: f64 = 300.0; // estimé (wiki)
/// Distance de poursuite maximale depuis le début du combat.
const LEASH: f64 = 2500.0; // estimé
/// Fenêtre pendant laquelle un dégât compte pour une aide.
const ASSIST_WINDOW: f64 = 10.0; // estimé (wiki : 10 s)
/// Ordre des points de compétence (rang monté à chaque niveau) : R aux niveaux 6, 11 et 16.
const SKILL_ORDER: [usize; 18] = [0, 1, 2, 0, 0, 3, 0, 1, 0, 1, 3, 1, 1, 2, 2, 3, 2, 2]; // estimé
/// Dégâts d'un tir de tour sur un champion.
const TURRET_CHAMPION_SHOT: f64 = 180.0; // estimé (wiki : environ 150 à 250 selon la tour)
const KILL_GOLD: f64 = 300.0; // estimé (wiki)
const FIRST_BLOOD_GOLD: f64 = 100.0; // estimé (wiki)
/// Part de la prime partagée entre les joueurs qui aident.
const ASSIST_SHARE: f64 = 0.5; // estimé (wiki)

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum Mode {
    /// Pas de combat : farm, déplacements (M3).
    Idle,
    /// Échange court en voie, jusqu'à `until`.
    Trade { target: usize, until: f64 },
    /// Combat jusqu'à la mort ou la fuite.
    Fight { target: usize },
    /// Fuite vers sa base.
    Flee,
}

/// État de combat d'un champion.
pub struct Fighter {
    pub kit: Option<Kit>,
    pub hp: f64,
    pub mana: f64,
    pub shield: f64,
    pub ranks: [usize; 4],
    pub ready_at: [f64; 4],
    /// Incantation en cours ou contrôle qui empêche d'agir.
    pub busy_until: f64,
    pub stunned_until: f64,
    pub rooted_until: f64,
    pub slow_until: f64,
    pub slow: f64,
    pub dead_until: Option<f64>,
    pub mode: Mode,
    /// Derniers champions ennemis qui l'ont touché : (index, instant).
    pub hit_by: Vec<(usize, f64)>,
    /// A frappé un champion récemment : les tours le visent.
    pub aggro_until: f64,
    /// Kills d'affilée (positif) ou morts d'affilée (négatif).
    pub streak: i32,
    /// Dernier instant où il a touché un champion (une poursuite sans touche s'arrête).
    pub last_dealt: f64,
    pub flash_ready_at: f64,
    pub has_flash: bool,
    /// Où le combat a commencé : on ne poursuit pas indéfiniment.
    pub fight_from: Point,
}

impl Fighter {
    pub fn new(kit: Option<Kit>) -> Self {
        Fighter {
            kit,
            hp: 0.0,
            mana: 0.0,
            shield: 0.0,
            ranks: [0; 4],
            ready_at: [0.0; 4],
            busy_until: 0.0,
            stunned_until: 0.0,
            rooted_until: 0.0,
            slow_until: 0.0,
            slow: 0.0,
            dead_until: None,
            mode: Mode::Idle,
            hit_by: Vec::new(),
            aggro_until: 0.0,
            streak: 0,
            last_dealt: 0.0,
            flash_ready_at: 0.0,
            has_flash: true,
            fight_from: Point::new(0.0, 0.0),
        }
    }
}

impl Champ {
    pub(super) fn alive(&self) -> bool {
        self.fighter.dead_until.is_none()
    }

    fn base_hp(&self) -> f64 {
        rules::stat_at_level(self.stats.hp, self.stats.hp_per_level, self.level())
    }

    pub(super) fn max_hp(&self) -> f64 {
        self.base_hp() + self.inv.stats.health
    }

    pub(super) fn max_mana(&self) -> f64 {
        rules::stat_at_level(self.stats.mp, self.stats.mp_per_level, self.level())
            + self.inv.stats.mana
    }

    fn base_armor(&self) -> f64 {
        rules::stat_at_level(self.stats.armor, self.stats.armor_per_level, self.level())
    }

    fn armor(&self) -> f64 {
        self.base_armor() + self.inv.stats.armor
    }

    fn base_magic_resist(&self) -> f64 {
        rules::stat_at_level(
            self.stats.magic_resist,
            self.stats.magic_resist_per_level,
            self.level(),
        )
    }

    fn magic_resist(&self) -> f64 {
        self.base_magic_resist() + self.inv.stats.magic_resist
    }

    /// Multiplicateur moyen d'une attaque avec les critiques : 175 % de base, plus les bonus.
    pub(super) fn crit_factor(&self) -> f64 {
        let s = &self.inv.stats;
        1.0 + s.crit_chance.min(1.0) * (0.75 + s.crit_damage)
    }

    /// Recharge réduite par l'accélération de compétence : × 100 / (100 + AC).
    pub(super) fn haste_factor(&self) -> f64 {
        100.0 / (100.0 + self.inv.stats.ability_haste)
    }

    pub(super) fn stat_block(&self) -> StatBlock {
        StatBlock {
            ability_power: self.inv.stats.ability_power,
            attack_damage: self.ad(),
            base_attack_damage: self.base_ad(),
            armor: self.armor(),
            base_armor: self.base_armor(),
            magic_resist: self.magic_resist(),
            base_magic_resist: self.base_magic_resist(),
            health: self.max_hp(),
            base_health: self.base_hp(),
            attack_speed: self.attack_speed(),
            move_speed: self.speed(0.0),
            crit_chance: self.inv.stats.crit_chance.min(1.0),
            lethality: self.inv.stats.lethality,
            mana: self.max_mana(),
        }
    }

    pub(super) fn speed(&self, t: f64) -> f64 {
        let slow = if t < self.fighter.slow_until {
            self.fighter.slow
        } else {
            0.0
        };
        let s = &self.inv.stats;
        (self.stats.move_speed + s.move_speed) * (1.0 + s.move_speed_pct) * (1.0 - slow)
    }

    /// Monte les rangs des sorts jusqu'au niveau atteint.
    pub(super) fn level_up(&mut self) {
        let level = self.level() as usize;
        let spent: usize = self.fighter.ranks.iter().sum();
        for &s in SKILL_ORDER.iter().take(level.min(18)).skip(spent) {
            self.fighter.ranks[s] += 1;
        }
    }

    pub(super) fn regen(&mut self, dt: f64, at_base: bool) {
        let level = self.level();
        let hp5 = rules::stat_at_level(self.stats.hp_regen, self.stats.hp_regen_per_level, level);
        let mp5 = rules::stat_at_level(self.stats.mp_regen, self.stats.mp_regen_per_level, level);
        let k = if at_base { 40.0 } else { 1.0 }; // estimé (la fontaine soigne vite)
        self.fighter.hp = (self.fighter.hp + k * hp5 / 5.0 * dt).min(self.max_hp());
        self.fighter.mana = (self.fighter.mana + k * mp5 / 5.0 * dt).min(self.max_mana());
    }

    /// Dégâts qu'il peut infliger en quelques secondes à une cible moyenne (pour juger un combat).
    fn threat(&self, t: f64) -> f64 {
        let stats = self.stat_block();
        let level = self.level();
        let mut dmg = self.ad() * self.crit_factor() * self.attack_speed() * 3.0;
        if let Some(kit) = &self.fighter.kit {
            for (s, spell) in kit.spells.iter().enumerate() {
                let rank = self.fighter.ranks[s];
                if rank == 0 || self.fighter.ready_at[s] > t + 1.0 {
                    continue;
                }
                if let Some(f) = &spell.damage {
                    dmg += f.eval(rank, level, &stats);
                }
                // Un contrôle vaut des dégâts : la cible ne répond pas.
                for cc in &spell.cc {
                    if cc.kind.disables() || cc.kind.immobilizes() {
                        dmg += 0.25 * self.ad() * self.attack_speed() * spell.cc_duration(cc, rank);
                    }
                }
            }
        }
        dmg * mitigate(1.0, 40.0) // estimé (résistances moyennes)
    }

    fn effective_hp(&self) -> f64 {
        self.fighter.hp + self.fighter.shield
    }
}

impl Game {
    /// Chaque seconde : chaque champion vivant juge s'il se bat, échange, fuit ou continue à farmer.
    pub(super) fn decide(&mut self) {
        let t = self.t;
        for i in 0..self.champs.len() {
            let me = &self.champs[i];
            if !me.alive() || me.recall_until.is_some() {
                continue;
            }
            let near: Vec<usize> = (0..self.champs.len())
                .filter(|&j| {
                    let o = &self.champs[j];
                    o.side != me.side && o.alive() && o.pos.dist(me.pos) <= ENGAGE_RANGE
                })
                .collect();
            if near.is_empty() {
                // Plus personne : on reprend le farm, ou on rentre à la base si on est trop bas.
                self.champs[i].fighter.mode = Mode::Idle;
                continue;
            }
            let edge = self.edge(i);
            let target = *near
                .iter()
                .min_by(|&&a, &&b| {
                    let (ca, cb) = (&self.champs[a], &self.champs[b]);
                    ca.effective_hp()
                        .total_cmp(&cb.effective_hp())
                        .then(ca.pos.dist(me.pos).total_cmp(&cb.pos.dist(me.pos)))
                })
                .unwrap_or(&near[0]);
            // Un joueur décidé engage un peu plus tôt ; le sang-froid réduit les erreurs de lecture.
            let z_decision = me.attrs.z(Attr::Decision);
            let z_aggro = 0.5 * (me.attrs.z(Attr::Skirmish) + me.attrs.z(Attr::Laning));
            let noise =
                (self.rng.next_f64() - 0.5) * 0.3 * (1.0 - 0.15 * me.attrs.z(Attr::Composure));
            let mut need = ENGAGE_EDGE - 0.05 * z_aggro + noise; // estimé
                                                                 // Avant l'arrivée des premières vagues, on ne se bat qu'avec une grosse avance.
            if t < 90.0 {
                need += 0.6; // estimé
            }
            // Plonger sous une tour demande une avance nette.
            if self.under_enemy_turret(me.side, self.champs[target].pos) {
                need += 0.9 - 0.05 * z_decision; // estimé
            }
            let low = me.fighter.hp < LOW_HP * me.max_hp();
            let mode = me.fighter.mode;
            let new_mode = match mode {
                Mode::Fight { .. } if edge < RETREAT_EDGE || (low && edge < 1.5) => Mode::Flee,
                Mode::Fight { .. } if me.pos.dist(me.fighter.fight_from) > LEASH => Mode::Idle,
                // Plonger sous la tour adverse : seulement en forme et pour achever.
                Mode::Fight { .. }
                    if self.under_enemy_turret(me.side, self.champs[target].pos)
                        && (me.fighter.hp < 0.6 * me.max_hp()
                            || self.champs[target].fighter.hp
                                > 0.25 * self.champs[target].max_hp()) =>
                {
                    Mode::Idle
                }
                // Une poursuite qui ne touche plus rien s'arrête.
                Mode::Fight { .. }
                    if t - me.fighter.last_dealt > CHASE_GIVE_UP
                        && self.champs[target].pos.dist(me.pos) > me.stats.attack_range + 150.0 =>
                {
                    Mode::Idle
                }
                // L'avantage a disparu : on se désengage.
                Mode::Fight { .. } if edge < 1.0 => Mode::Idle,
                // On ne suit pas sous une tour sans une avance nette.
                Mode::Fight { .. }
                    if edge < need && self.under_enemy_turret(me.side, self.champs[target].pos) =>
                {
                    Mode::Idle
                }
                Mode::Fight { .. } => Mode::Fight { target },
                Mode::Trade { until, .. } if t < until && !low => Mode::Trade { target, until },
                Mode::Flee if !low && edge >= need => Mode::Fight { target },
                Mode::Flee => Mode::Flee,
                _ if low => Mode::Flee,
                _ if edge >= need => Mode::Fight { target },
                _ if me.role.lane().is_some()
                    && t >= 90.0
                    && edge >= 1.0
                    && self.rng.chance(TRADE_CHANCE * (1.0 + 0.2 * z_aggro)) =>
                {
                    Mode::Trade {
                        target,
                        until: t + TRADE_LENGTH,
                    }
                }
                _ => Mode::Idle,
            };
            if matches!(new_mode, Mode::Fight { .. }) && !matches!(mode, Mode::Fight { .. }) {
                // Début d'un combat : la poursuite compte à partir de maintenant.
                self.champs[i].fighter.last_dealt = t;
                self.champs[i].fighter.fight_from = self.champs[i].pos;
            }
            self.champs[i].fighter.mode = new_mode;
        }
    }

    /// Le champion `i` est menacé : son vis-à-vis gagnerait un combat.
    pub(super) fn outmatched(&self, i: usize) -> bool {
        let me = &self.champs[i];
        let close = self
            .champs
            .iter()
            .any(|o| o.side != me.side && o.alive() && o.pos.dist(me.pos) <= FIGHT_RADIUS);
        close && self.edge(i) < 1.0 / ENGAGE_EDGE
    }

    /// Rapport de force autour du champion `i` : dégâts de son camp sur la vie adverse, divisé par
    /// l'inverse. Au-dessus de 1, son camp gagne l'échange.
    fn edge(&self, i: usize) -> f64 {
        let me = &self.champs[i];
        let t = self.t;
        let (mut ours, mut theirs, mut our_hp, mut their_hp) = (0.0, 0.0, 0.0, 0.0);
        for c in &self.champs {
            if !c.alive() || c.recall_until.is_some() || c.pos.dist(me.pos) > FIGHT_RADIUS {
                continue;
            }
            if c.side == me.side {
                ours += c.threat(t);
                our_hp += c.effective_hp();
            } else {
                theirs += c.threat(t);
                their_hp += c.effective_hp();
            }
        }
        if theirs <= 0.0 || their_hp <= 0.0 {
            return 10.0;
        }
        (ours / their_hp) / (theirs / our_hp.max(1.0)).max(1e-6)
    }

    fn under_enemy_turret(&self, side: usize, p: Point) -> bool {
        self.lanes.buildings.iter().any(|b| {
            b.def.side != side
                && b.alive()
                && matches!(b.def.kind, StructureKind::Turret)
                && b.def.pos.dist(p) <= rules::TURRET_RANGE
        })
    }

    /// Une seconde de combat, en pas de 0,25 s.
    pub(super) fn combat(&mut self, dt: f64) {
        if !self
            .champs
            .iter()
            .any(|c| c.alive() && c.fighter.mode != Mode::Idle)
        {
            return;
        }
        let steps = (dt / COMBAT_DT).round() as usize;
        let start = self.t;
        for k in 0..steps {
            let t = start + k as f64 * COMBAT_DT;
            for i in 0..self.champs.len() {
                if self.champs[i].alive() {
                    self.act(i, t);
                }
            }
            self.turrets(t);
        }
    }

    fn act(&mut self, i: usize, t: f64) {
        let mode = self.champs[i].fighter.mode;
        let target = match mode {
            Mode::Idle => return,
            Mode::Flee => {
                self.flee(i, t);
                return;
            }
            Mode::Trade { target, .. } | Mode::Fight { target } => target,
        };
        if !self.champs[target].alive() {
            self.champs[i].fighter.mode = Mode::Idle;
            return;
        }
        let c = &self.champs[i];
        if t < c.fighter.busy_until || t < c.fighter.stunned_until {
            return;
        }
        let dist = c.pos.dist(self.champs[target].pos);
        // Un sort prêt et à portée ?
        if let Some(s) = self.pick_spell(i, target, dist, t, mode) {
            self.cast(i, s, target, t);
            return;
        }
        let reach = c.stats.attack_range + 100.0; // estimé (rayons des deux champions)
        if dist <= reach {
            if self.champs[i].charge >= 1.0 {
                self.champs[i].charge -= 1.0;
                let c = &self.champs[i];
                let raw = c.ad() * c.crit_factor();
                let dealt = self.hit(i, target, raw, DamageType::Physical, t);
                // Vol de vie sur les attaques.
                let c = &mut self.champs[i];
                let heal = dealt * c.inv.stats.life_steal;
                c.fighter.hp = (c.fighter.hp + heal).min(c.max_hp());
            }
        } else {
            let to = self.champs[target].pos;
            self.step_toward(i, to, t);
        }
    }

    /// Fuite par les chemins de la carte vers sa base ; Flash si un ennemi est au contact.
    fn flee(&mut self, i: usize, t: f64) {
        let c = &self.champs[i];
        if t < c.fighter.rooted_until || t < c.fighter.stunned_until {
            return;
        }
        let home = map::fountain(c.side);
        let threatened = self.champs.iter().any(|o| {
            o.side != c.side && o.alive() && o.pos.dist(c.pos) <= o.stats.attack_range + 150.0
        });
        let speed = c.speed(t);
        let c = &mut self.champs[i];
        c.walk_at(&self.nav, home, COMBAT_DT, speed);
        if threatened && c.fighter.has_flash && t >= c.fighter.flash_ready_at {
            c.fighter.flash_ready_at = t + FLASH_COOLDOWN;
            let next = c.path.first().copied().unwrap_or(home);
            c.pos = c.pos.toward(next, FLASH_RANGE);
        }
    }

    fn step_toward(&mut self, i: usize, to: Point, t: f64) {
        let c = &mut self.champs[i];
        if t < c.fighter.rooted_until || t < c.fighter.stunned_until {
            return;
        }
        let step = c.speed(t) * COMBAT_DT;
        c.pos = c.pos.toward(to, step);
        c.path.clear();
    }

    fn pick_spell(&self, i: usize, target: usize, dist: f64, t: f64, mode: Mode) -> Option<usize> {
        let c = &self.champs[i];
        let kit = c.fighter.kit.as_ref()?;
        let target_hp = self.champs[target].fighter.hp / self.champs[target].max_hp();
        for (s, spell) in kit.spells.iter().enumerate() {
            let rank = c.fighter.ranks[s];
            if rank == 0 || c.fighter.ready_at[s] > t || c.fighter.mana < spell.cost_at(rank) {
                continue;
            }
            let hostile =
                spell.damage.is_some() || spell.max_health_damage.is_some() || !spell.cc.is_empty();
            let support = spell.heal.is_some() || spell.shield.is_some();
            // L'ultime : gardé pour un vrai combat, ou pour achever.
            if s == 3
                && (matches!(mode, Mode::Trade { .. }) || (target_hp > 0.7 && !self.teamfight(i)))
            {
                continue;
            }
            if hostile && dist <= spell_range(spell, c.stats.attack_range) {
                return Some(s);
            }
            if support && !hostile && c.fighter.hp < 0.7 * c.max_hp() {
                return Some(s);
            }
        }
        None
    }

    fn teamfight(&self, i: usize) -> bool {
        let me = &self.champs[i];
        self.champs
            .iter()
            .filter(|c| c.side != me.side && c.alive() && c.pos.dist(me.pos) <= FIGHT_RADIUS)
            .count()
            >= 2
    }

    fn cast(&mut self, i: usize, s: usize, target: usize, t: f64) {
        let Some(spell) = self.champs[i]
            .fighter
            .kit
            .as_ref()
            .map(|k| k.spells[s].clone())
        else {
            return;
        };
        let c = &mut self.champs[i];
        let rank = c.fighter.ranks[s];
        c.fighter.mana -= spell.cost_at(rank);
        let cd = spell.cooldown_at(rank) * c.haste_factor();
        c.fighter.ready_at[s] = t + if cd < 2.0 { MIN_COOLDOWN } else { cd };
        c.fighter.busy_until = t + spell.cast_time.min(1.0);
        let stats = c.stat_block();
        let level = c.level();
        // Soin et bouclier sur soi.
        if let Some(f) = &spell.heal {
            let v = f.eval(rank, level, &stats).max(0.0);
            c.fighter.hp = (c.fighter.hp + v).min(c.max_hp());
        }
        if let Some(f) = &spell.shield {
            c.fighter.shield += f.eval(rank, level, &stats).max(0.0);
        }
        if spell.damage.is_none() && spell.max_health_damage.is_none() && spell.cc.is_empty() {
            return;
        }
        // Cibles touchées : la cible, et les ennemis proches pour une zone.
        let center = self.champs[target].pos;
        let radius = match spell.targeting {
            Targeting::Area | Targeting::SelfCast => spell.radius.max(150.0),
            Targeting::Skillshot => spell.width.max(60.0) / 2.0 + 60.0,
            Targeting::Unit => 0.0,
        };
        let victims: Vec<usize> = (0..self.champs.len())
            .filter(|&j| {
                let o = &self.champs[j];
                o.side != self.champs[i].side
                    && o.alive()
                    && (j == target || (radius > 0.0 && o.pos.dist(center) <= radius))
            })
            .collect();
        for j in victims {
            if !self.rng.chance(self.hit_chance(i, j, &spell, t)) {
                continue;
            }
            let mut raw = spell
                .damage
                .as_ref()
                .map_or(0.0, |f| f.eval(rank, level, &stats));
            if let Some(f) = &spell.max_health_damage {
                raw += f.eval(rank, level, &stats) * self.champs[j].max_hp();
            }
            if raw > 0.0 {
                self.hit(i, j, raw, spell.damage_type, t);
            }
            self.apply_cc(j, &spell, rank, t);
        }
    }

    /// Chance de toucher : un projectile s'esquive, une zone un peu, une cible jamais.
    fn hit_chance(&self, i: usize, j: usize, spell: &Spell, t: f64) -> f64 {
        let target = &self.champs[j];
        if t < target.fighter.rooted_until || t < target.fighter.stunned_until {
            return 1.0;
        }
        let skill =
            0.07 * self.champs[i].attrs.z(Attr::Mechanics) - 0.05 * target.attrs.z(Attr::Mechanics); // estimé
        let base = match spell.targeting {
            Targeting::Unit | Targeting::SelfCast => return 1.0,
            Targeting::Skillshot => 0.65, // estimé
            Targeting::Area => 0.80,      // estimé
        };
        (base + skill).clamp(0.3, 0.97)
    }

    fn apply_cc(&mut self, j: usize, spell: &Spell, rank: usize, t: f64) {
        let f = &mut self.champs[j].fighter;
        for cc in &spell.cc {
            let d = spell.cc_duration(cc, rank);
            match cc.kind {
                CcKind::Slow => {
                    f.slow_until = f.slow_until.max(t + d);
                    f.slow = f.slow.max(cc.amount.get(rank - 1).copied().unwrap_or(0.3));
                }
                k => {
                    if k.disables() {
                        f.stunned_until = f.stunned_until.max(t + d);
                    }
                    if k.immobilizes() {
                        f.rooted_until = f.rooted_until.max(t + d);
                    }
                }
            }
        }
    }

    /// Dégâts de `i` sur `j`, après résistances (moins la pénétration) et bouclier. Renvoie les
    /// dégâts infligés.
    fn hit(&mut self, i: usize, j: usize, raw: f64, kind: DamageType, t: f64) -> f64 {
        let target = &self.champs[j];
        let pen = &self.champs[i].inv.stats;
        // Ordre du jeu : pénétration en % puis fixe ; elle ne fait pas passer sous zéro.
        let resist = |r: f64, pct: f64, flat: f64| {
            if r <= 0.0 {
                r
            } else {
                (r * (1.0 - pct) - flat).max(0.0)
            }
        };
        let dmg = match kind {
            DamageType::Physical => mitigate(
                raw,
                resist(target.armor(), pen.armor_pen_pct, pen.lethality),
            ),
            DamageType::Magic => mitigate(
                raw,
                resist(target.magic_resist(), pen.magic_pen_pct, pen.magic_pen),
            ),
            DamageType::True => raw,
        };
        self.champs[i].fighter.aggro_until = t + 2.0;
        self.champs[i].fighter.last_dealt = t;
        self.champs[i].report.damage += dmg;
        let f = &mut self.champs[j].fighter;
        f.hit_by.retain(|(k, _)| *k != i);
        f.hit_by.push((i, t));
        // Un champion touché interrompt son retour à la base.
        self.champs[j].recall_until = None;
        let f = &mut self.champs[j].fighter;
        let absorbed = f.shield.min(dmg);
        f.shield -= absorbed;
        f.hp -= dmg - absorbed;
        // Touché sans être en combat : il répond le temps d'un échange.
        if f.mode == Mode::Idle {
            f.mode = Mode::Trade {
                target: i,
                until: t + TRADE_LENGTH,
            };
        }
        if f.hp <= 0.0 {
            self.death(j, Some(i), t);
        }
        dmg
    }

    /// Les tours tirent sur un champion ennemi qui vient de frapper un champion à leur portée.
    fn turrets(&mut self, t: f64) {
        let shots = rules::TURRET_ATTACK_SPEED * COMBAT_DT;
        for b in 0..self.lanes.buildings.len() {
            let bd = &self.lanes.buildings[b];
            if !bd.alive() || !matches!(bd.def.kind, StructureKind::Turret) {
                continue;
            }
            let (side, pos) = (bd.def.side, bd.def.pos);
            let target = (0..self.champs.len()).find(|&j| {
                let c = &self.champs[j];
                c.side != side
                    && c.alive()
                    && c.fighter.aggro_until > t
                    && c.pos.dist(pos) <= rules::TURRET_RANGE
            });
            if let Some(j) = target {
                let dmg = mitigate(TURRET_CHAMPION_SHOT * shots, self.champs[j].armor());
                let f = &mut self.champs[j].fighter;
                f.hp -= dmg;
                if f.hp <= 0.0 {
                    let killer = f
                        .hit_by
                        .last()
                        .filter(|(_, at)| t - at < ASSIST_WINDOW)
                        .map(|(k, _)| *k);
                    self.death(j, killer, t);
                }
            }
        }
    }

    fn death(&mut self, j: usize, killer: Option<usize>, t: f64) {
        let level = self.champs[j].level();
        let respawn_at = t + respawn_time(level, t);
        let assists: Vec<usize> = self.champs[j]
            .fighter
            .hit_by
            .iter()
            .filter(|(k, at)| Some(*k) != killer && t - at <= ASSIST_WINDOW)
            .map(|(k, _)| *k)
            .collect();
        let victim_streak = self.champs[j].fighter.streak;
        {
            let v = &mut self.champs[j];
            v.fighter.dead_until = Some(respawn_at);
            v.fighter.mode = Mode::Idle;
            v.fighter.hit_by.clear();
            v.fighter.shield = 0.0;
            v.fighter.streak = v.fighter.streak.min(0) - 1;
            v.recall_until = None;
            v.camp = None;
            v.path.clear();
            v.report.deaths += 1;
            v.pos = map::fountain(v.side);
        }
        let first = !self.first_blood;
        self.first_blood = true;
        // Prime : plus haute sur un joueur en série, plus basse sur un joueur qui meurt souvent.
        let bounty = if victim_streak >= 2 {
            KILL_GOLD + 100.0 * f64::from(victim_streak - 1).min(4.0)
        } else if victim_streak <= -2 {
            (KILL_GOLD * (1.0 - 0.15 * f64::from(-victim_streak - 1))).max(100.0)
        } else {
            KILL_GOLD
        }; // estimé (wiki)
           // XP d'un kill : environ ce qu'il faut pour un demi-niveau de la victime.
        let xp = 100.0 + 50.0 * f64::from(level); // estimé
        if let Some(k) = killer {
            let c = &mut self.champs[k];
            c.earn(bounty + if first { FIRST_BLOOD_GOLD } else { 0.0 });
            c.xp += xp;
            c.report.kills += 1;
            c.fighter.streak = c.fighter.streak.max(0) + 1;
        }
        if !assists.is_empty() {
            let share = bounty * ASSIST_SHARE / assists.len() as f64;
            for &a in &assists {
                let c = &mut self.champs[a];
                c.earn(share);
                c.xp += xp * 0.5 / assists.len() as f64;
                c.report.assists += 1;
            }
        }
        // Ceux qui le visaient passent à autre chose.
        for c in &mut self.champs {
            if matches!(c.fighter.mode, Mode::Fight { target } | Mode::Trade { target, .. } if target == j)
            {
                c.fighter.mode = Mode::Idle;
            }
        }
        self.events.push(Event::Kill {
            t,
            killer,
            victim: j,
            assists,
            respawn_at,
        });
    }

    /// Réapparition à la fontaine, PV et mana pleins.
    pub(super) fn respawn(&mut self) {
        let t = self.t;
        for c in &mut self.champs {
            if c.fighter.dead_until.is_some_and(|u| t >= u) {
                c.fighter.dead_until = None;
                c.shop();
                c.fighter.hp = c.max_hp();
                c.fighter.mana = c.max_mana();
                c.fighter.slow_until = 0.0;
                c.fighter.stunned_until = 0.0;
                c.fighter.rooted_until = 0.0;
            }
        }
    }
}

/// Portée d'un sort pour le lancer : sa portée, sinon celle des attaques (sort autour de soi).
fn spell_range(spell: &Spell, attack_range: f64) -> f64 {
    match spell.targeting {
        Targeting::SelfCast => spell.radius.max(attack_range + 100.0),
        _ if spell.range > 0.0 => spell.range.min(1500.0), // estimé : pas de tir à travers la carte
        _ => attack_range + 100.0,
    }
}

/// Temps de mort selon le niveau, plus long en fin de partie.
pub fn respawn_time(level: u32, t: f64) -> f64 {
    // estimé (wiki : 10 s au niveau 1, environ 52 s au niveau 18, avant le bonus de fin de partie)
    const BASE: [f64; 18] = [
        10.0, 10.0, 12.0, 12.0, 14.0, 16.0, 20.0, 25.0, 28.0, 32.5, 35.0, 37.5, 40.0, 42.5, 45.0,
        47.5, 50.0, 52.5,
    ];
    let base = BASE[(level.clamp(1, 18) - 1) as usize];
    let minutes = t / 60.0;
    // estimé (wiki) : +0,425 % par demi-minute après 15 min, jusqu'à +50 %.
    let bonus = if minutes > 15.0 {
        ((minutes - 15.0) * 2.0 * 0.00425).min(0.5)
    } else {
        0.0
    };
    base * (1.0 + bonus)
}

#[cfg(test)]
mod tests {
    use super::super::{new_game, tests::setup};
    use super::*;
    use crate::kit::{Cc, Formula, Ratio, Stat, StatPart};

    /// Un sort ciblé : 100 dégâts magiques (+50 % PA), étourdit 1 s, recharge 6 s.
    fn stun_kit() -> Kit {
        let spell = |slot: &str| Spell {
            slot: slot.into(),
            name: format!("Test{slot}"),
            cooldown: vec![6.0; 5],
            cost: vec![0.0; 5],
            range: 600.0,
            radius: 0.0,
            width: 0.0,
            missile_speed: 0.0,
            cast_time: 0.25,
            targeting: Targeting::Unit,
            damage: Some(Formula {
                base: vec![100.0; 5],
                by_level: None,
                ratios: vec![Ratio {
                    stat: Stat::AbilityPower,
                    part: StatPart::Total,
                    coef: vec![0.5; 5],
                }],
            }),
            max_health_damage: None,
            damage_type: DamageType::Magic,
            heal: None,
            shield: None,
            cc: vec![Cc {
                kind: CcKind::Stun,
                duration: vec![1.0; 5],
                amount: Vec::new(),
            }],
            source: "test".into(),
        };
        Kit {
            champion: "Test".into(),
            spells: ["Q", "W", "E", "R"].map(spell).to_vec(),
        }
    }

    /// Deux hauts face à face au milieu de la carte, à 5:00.
    fn duel() -> Game {
        let mut s = setup(1, 600.0);
        s.teams[0].players[0].kit = Some(stun_kit());
        let (mut g, _) = new_game(&s);
        g.t = 300.0;
        let mid = Point::new(7400.0, 7400.0);
        for (i, c) in g.champs.iter_mut().enumerate() {
            c.xp = 2000.0; // niveau 6
            c.level_up();
            c.fighter.hp = c.max_hp();
            c.pos = if i == 0 || i == 5 {
                mid
            } else {
                map::fountain(c.side)
            };
        }
        g
    }

    fn item(stats: crate::item::ItemStats) -> crate::item::Item {
        crate::item::Item {
            id: 1,
            name: "Test".into(),
            gold: 1000.0,
            stats,
        }
    }

    /// Chaque stat d'objet arrive dans le calcul qui l'utilise.
    #[test]
    fn chaque_stat_d_objet_compte() {
        use crate::item::{Inventory, ItemStats};
        let base = duel();
        let equip = |stats: ItemStats| {
            let mut g = duel();
            g.champs[0].inv = Inventory::new(vec![item(stats)]);
            g.champs[0].purse = 1000.0;
            g.champs[0].shop();
            g
        };
        let (c0, b0) = (|g: &Game| -> f64 { g.champs[0].ad() }, base.champs[0].ad());
        assert_eq!(
            c0(&equip(ItemStats {
                attack_damage: 50.0,
                ..Default::default()
            })),
            b0 + 50.0
        );
        let g = equip(ItemStats {
            health: 400.0,
            armor: 30.0,
            magic_resist: 20.0,
            mana: 300.0,
            ..Default::default()
        });
        let (c, b) = (&g.champs[0], &base.champs[0]);
        assert_eq!(c.max_hp(), b.max_hp() + 400.0);
        assert_eq!(c.armor(), b.armor() + 30.0);
        assert_eq!(c.magic_resist(), b.magic_resist() + 20.0);
        assert_eq!(c.max_mana(), b.max_mana() + 300.0);
        // Les stats « de base » des sorts n'incluent pas les objets.
        assert_eq!(c.stat_block().base_health, b.max_hp());
        let g = equip(ItemStats {
            ability_power: 80.0,
            ..Default::default()
        });
        assert_eq!(g.champs[0].stat_block().ability_power, 80.0);
        let g = equip(ItemStats {
            attack_speed: 0.4,
            ..Default::default()
        });
        assert!(g.champs[0].attack_speed() > base.champs[0].attack_speed() * 1.3);
        let g = equip(ItemStats {
            move_speed: 45.0,
            move_speed_pct: 0.04,
            ..Default::default()
        });
        let expected = (base.champs[0].speed(0.0) + 45.0) * 1.04;
        assert!((g.champs[0].speed(0.0) - expected).abs() < 1e-9);
        // Critiques : 25 % de chances à 175 % (+30 %) = ×1,2625 en moyenne.
        let g = equip(ItemStats {
            crit_chance: 0.25,
            crit_damage: 0.3,
            ..Default::default()
        });
        assert!((g.champs[0].crit_factor() - 1.2625).abs() < 1e-9);
        // Accélération : 20 AC raccourcit la recharge de 1/6.
        let mut g = equip(ItemStats {
            ability_haste: 20.0,
            ..Default::default()
        });
        g.cast(0, 0, 5, 300.0);
        assert!((g.champs[0].fighter.ready_at[0] - (300.0 + 6.0 * 100.0 / 120.0)).abs() < 1e-9);
    }

    #[test]
    fn la_penetration_et_le_vol_de_vie() {
        use crate::item::{Inventory, ItemStats};
        let dealt = |stats: ItemStats, kind: DamageType| {
            let mut g = duel();
            g.champs[0].inv = Inventory::new(vec![item(stats)]);
            g.champs[0].purse = 1000.0;
            g.champs[0].shop();
            g.hit(0, 5, 100.0, kind, 300.0)
        };
        let none = dealt(ItemStats::default(), DamageType::Physical);
        let pen = dealt(
            ItemStats {
                armor_pen_pct: 0.35,
                lethality: 10.0,
                ..Default::default()
            },
            DamageType::Physical,
        );
        let g = duel();
        let armor = g.champs[5].armor();
        assert!((none - mitigate(100.0, armor)).abs() < 1e-9);
        assert!((pen - mitigate(100.0, armor * 0.65 - 10.0)).abs() < 1e-9);
        let mr = g.champs[5].magic_resist();
        let magic = dealt(
            ItemStats {
                magic_pen_pct: 0.4,
                magic_pen: 15.0,
                ..Default::default()
            },
            DamageType::Magic,
        );
        assert!((magic - mitigate(100.0, (mr * 0.6 - 15.0).max(0.0))).abs() < 1e-9);

        // Vol de vie : 15 % des dégâts des attaques reviennent en PV.
        let mut g = duel();
        g.champs[0].inv = Inventory::new(vec![item(ItemStats {
            life_steal: 0.15,
            ..Default::default()
        })]);
        g.champs[0].purse = 1000.0;
        g.champs[0].shop();
        g.champs[0].fighter.hp = 100.0;
        g.champs[0].charge = 1.0;
        g.champs[0].pos = g.champs[5].pos;
        g.champs[0].fighter.kit = None;
        g.champs[0].fighter.mode = Mode::Fight { target: 5 };
        g.act(0, 300.0);
        let dealt = g.champs[0].report.damage;
        assert!(dealt > 0.0);
        assert!((g.champs[0].fighter.hp - (100.0 + 0.15 * dealt)).abs() < 1e-6);
    }

    #[test]
    fn la_boutique_au_retour_a_la_base() {
        use crate::item::{Inventory, ItemStats};
        let mut g = duel();
        let base = g.champs[0].ad();
        g.champs[0].inv = Inventory::new(vec![item(ItemStats {
            attack_damage: 40.0,
            ..Default::default()
        })]);
        g.champs[0].purse = 0.0;
        g.champs[0].earn(1000.0);
        assert_eq!(g.champs[0].ad(), base);
        g.champs[0].recall_until = Some(g.t);
        g.think(0, 1.0);
        assert_eq!(g.champs[0].ad(), base + 40.0);
        assert_eq!(g.champs[0].purse, 0.0);
    }

    #[test]
    fn un_duel_finit_par_un_kill() {
        let mut g = duel();
        g.champs[0].fighter.mode = Mode::Fight { target: 5 };
        g.champs[5].fighter.mode = Mode::Fight { target: 0 };
        for _ in 0..60 {
            g.combat(1.0);
            g.t += 1.0;
            for c in &mut g.champs {
                c.charge = (c.charge + c.attack_speed()).min(2.0);
            }
            if g.events.iter().any(|e| matches!(e, Event::Kill { .. })) {
                break;
            }
        }
        let kill = g.events.iter().find_map(|e| match e {
            Event::Kill { killer, victim, .. } => Some((*killer, *victim)),
            _ => None,
        });
        // Celui qui a les sorts gagne le duel, touche la prime et le premier sang.
        assert_eq!(kill, Some((Some(0), 5)));
        assert!(g.champs[0].gold >= rules::STARTING_GOLD + KILL_GOLD + FIRST_BLOOD_GOLD);
        assert!(!g.champs[5].alive());
        assert_eq!(g.champs[5].report.deaths, 1);
        assert_eq!(g.champs[0].report.kills, 1);
        // Il réapparaît à la fontaine après son temps de mort.
        g.t = 400.0;
        g.respawn();
        assert!(g.champs[5].alive());
        assert_eq!(g.champs[5].fighter.hp, g.champs[5].max_hp());
    }

    #[test]
    fn sort_cible_etourdit_et_reduit_par_la_resistance() {
        let mut g = duel();
        let hp = g.champs[5].fighter.hp;
        g.cast(0, 0, 5, g.t);
        let taken = hp - g.champs[5].fighter.hp;
        let expected = mitigate(100.0, g.champs[5].magic_resist());
        assert!((taken - expected).abs() < 1e-9, "{taken} contre {expected}");
        assert!(g.champs[5].fighter.stunned_until >= g.t + 1.0);
        // Le sort est en recharge.
        assert!(g.champs[0].fighter.ready_at[0] >= g.t + 6.0);
    }

    #[test]
    fn la_tour_tire_sur_un_champion_qui_attaque_sous_elle() {
        let mut g = duel();
        // Le haut rouge se bat sous la tour extérieure bleue du milieu.
        let turret = g
            .lanes
            .buildings
            .iter()
            .find(|b| b.def.side == 0 && matches!(b.def.kind, StructureKind::Turret))
            .map(|b| b.def.pos)
            .unwrap();
        g.champs[5].pos = turret;
        g.champs[5].fighter.aggro_until = g.t + 2.0;
        let hp = g.champs[5].fighter.hp;
        g.turrets(g.t);
        assert!(g.champs[5].fighter.hp < hp);
    }

    #[test]
    fn temps_de_mort() {
        assert_eq!(respawn_time(1, 120.0), 10.0);
        assert_eq!(respawn_time(18, 600.0), 52.5);
        assert!(respawn_time(18, 2400.0) > 52.5);
        assert!(respawn_time(18, 6000.0) <= 52.5 * 1.5 + 1e-9);
    }

    #[test]
    fn ordre_des_competences() {
        let mut counts = [0; 4];
        for s in SKILL_ORDER {
            counts[s] += 1;
        }
        assert_eq!(counts, [5, 5, 5, 3]);
        assert_eq!(SKILL_ORDER[5], 3);
    }
}
