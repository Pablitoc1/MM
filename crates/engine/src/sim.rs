//! Une partie, seconde par seconde : vagues, bâtiments, camps, et les dix champions
//! qui farment (voies et jungle), rentrent à la base, posent des balises et se battent
//! (M4b, `combat`, au quart de seconde). Pas encore de plan d'équipe (M5).

mod combat;

use combat::{Fighter, Mode};

use crate::geo::{Lane, Point, Side, BLUE, RED};
use crate::item::{Inventory, Item};
use crate::kit::Kit;
use crate::map::{self, Camp, CampKind, Nav, StructureKind};
use crate::player::{Attr, Attributes, ChampionStats};
use crate::replay::{
    ChampionFrame, ChampionInfo, Event, Frame, MatchContext, Replay, Role, TeamInfo, WaveFrame,
    REPLAY_VERSION,
};
use crate::rules;
use crate::waves::{Death, Lanes};
use crate::SimRng;

#[derive(Debug, Clone)]
pub struct PlayerSetup {
    pub name: String,
    pub role: Role,
    pub champion: ChampionStats,
    pub attrs: Attributes,
    pub spells: [String; 2],
    /// Sorts du champion (note 011). Sans eux, il ne se bat qu'avec ses attaques.
    pub kit: Option<Kit>,
    /// Objets à acheter, dans l'ordre (note 014). Vide : il ne s'équipe pas.
    pub build: Vec<Item>,
}

#[derive(Debug, Clone)]
pub struct TeamSetup {
    pub tag: String,
    pub name: String,
    /// Cinq joueurs, dans l'ordre des rôles (haut, jungle, milieu, bas, support).
    pub players: Vec<PlayerSetup>,
}

pub struct MatchSetup {
    pub seed: u64,
    pub patch: String,
    pub teams: [TeamSetup; 2],
    /// Durée maximale simulée, en secondes (M3 : sans combat, aucune équipe ne gagne seule).
    pub duration: f64,
    pub context: Option<MatchContext>,
}

/// État d'un joueur à un instant, pour les rapports.
#[derive(Debug, Clone, Copy, Default, PartialEq)]
pub struct Snapshot {
    pub cs: u32,
    pub gold: f64,
    pub xp: f64,
    pub level: u32,
    pub kills: u32,
    pub deaths: u32,
    /// Objets terminés.
    pub items: u32,
}

#[derive(Debug, Clone, Default, PartialEq)]
pub struct PlayerReport {
    pub at10: Snapshot,
    pub at15: Snapshot,
    pub at20: Snapshot,
    pub at25: Snapshot,
    pub end: Snapshot,
    /// Secondes passées dans la vision de l'adversaire.
    pub seen: f64,
    pub wards: u32,
    pub recalls: u32,
    pub kills: u32,
    pub deaths: u32,
    pub assists: u32,
    /// Dégâts infligés aux champions, après résistances.
    pub damage: f64,
}

pub struct MatchResult {
    pub replay: Replay,
    /// Dans l'ordre des champions du flux (0 à 4 bleu, 5 à 9 rouge).
    pub players: Vec<PlayerReport>,
}

// ---- Comportements (estimé, calés sur le rapport de calibrage) ----
/// Chance de réussir un dernier coup pour un joueur moyen de LEC.
const LAST_HIT_BASE: f64 = 0.80; // estimé, calé sur les CS à 10 min LEC 2025
/// Chance qu'un support prenne un sbire que son tireur laisse filer.
const SUPPORT_TAKE: f64 = 0.50; // estimé, calé sur les CS à 10 min des supports
/// Distance à laquelle un champion peut prendre un sbire qui meurt.
const LAST_HIT_RANGE: f64 = 1100.0; // estimé
/// Dégâts de clear d'un jungler = dégâts de ses attaques × ce facteur (sorts, châtiment, compagnon).
/// estimé : remplacé par les vrais sorts en M4 ; calé pour un tour complet vers 3:15.
const JUNGLE_CLEAR: f64 = 3.6;
/// Or gagné depuis le dernier retour au-delà duquel un joueur cherche à rentrer.
const RECALL_GOLD: f64 = 1300.0; // estimé (prix d'un premier objet)
/// Écart d'or qui donne environ 75 % de chances de victoire.
const WIN_GOLD_SCALE: f64 = 3000.0; // estimé, à caler en M5

struct CampState {
    def: Camp,
    alive: bool,
    hp: f64,
    next_spawn: f64,
}

struct Ward {
    side: Side,
    pos: Point,
    expires: f64,
}

struct Champ {
    side: Side,
    role: Role,
    stats: ChampionStats,
    attrs: Attributes,
    pos: Point,
    path: Vec<Point>,
    goal: Option<Point>,
    xp: f64,
    gold: f64,
    gold_since_recall: f64,
    /// Or pas encore dépensé.
    purse: f64,
    inv: Inventory,
    cs: u32,
    /// Attaques disponibles (la vitesse d'attaque les recharge).
    charge: f64,
    recall_until: Option<f64>,
    trinket_at: f64,
    camp: Option<usize>,
    report: PlayerReport,
    fighter: Fighter,
}

impl Champ {
    fn level(&self) -> u32 {
        rules::level_for_xp(self.xp)
    }

    /// Dégâts d'attaque du champion seul (sans objets).
    fn base_ad(&self) -> f64 {
        rules::stat_at_level(self.stats.ad, self.stats.ad_per_level, self.level())
    }

    fn ad(&self) -> f64 {
        self.base_ad() + self.inv.stats.attack_damage
    }

    fn attack_speed(&self) -> f64 {
        let bonus = rules::stat_at_level(0.0, self.stats.attack_speed_per_level, self.level());
        // Plafond du jeu : 2,5 attaques par seconde.
        (self.stats.attack_speed * (1.0 + bonus / 100.0 + self.inv.stats.attack_speed)).min(2.5)
    }

    fn earn(&mut self, gold: f64) {
        self.gold += gold;
        self.gold_since_recall += gold;
        self.purse += gold;
    }

    /// Passage à la boutique (à la fontaine) : l'or va dans les objets du build.
    fn shop(&mut self) {
        self.purse = self.inv.shop(self.purse);
    }

    fn snapshot(&self) -> Snapshot {
        Snapshot {
            cs: self.cs,
            gold: self.gold,
            xp: self.xp,
            level: self.level(),
            kills: self.report.kills,
            deaths: self.report.deaths,
            items: self.inv.done as u32,
        }
    }

    fn last_hit_chance(&self) -> f64 {
        let z = 0.06 * self.attrs.z(Attr::Farm) + 0.02 * self.attrs.z(Attr::Mechanics); // estimé
        (LAST_HIT_BASE + z).clamp(0.3, 0.99)
    }

    fn walk(&mut self, nav: &Nav, goal: Point, dt: f64) {
        let speed = self.stats.move_speed;
        self.walk_at(nav, goal, dt, speed);
    }

    fn walk_at(&mut self, nav: &Nav, goal: Point, dt: f64, speed: f64) {
        if self.path.is_empty() || self.goal.is_none_or(|g| g.dist(goal) > 700.0) {
            self.path = nav.route(self.pos, goal);
        } else if let Some(last) = self.path.last_mut() {
            *last = goal;
        }
        self.goal = Some(goal);
        let mut step = speed * dt;
        while step > 0.0 && !self.path.is_empty() {
            let next = self.path[0];
            let d = self.pos.dist(next);
            if d <= step {
                self.pos = next;
                step -= d;
                self.path.remove(0);
            } else {
                self.pos = self.pos.toward(next, step);
                step = 0.0;
            }
        }
    }
}

struct Game {
    nav: Nav,
    lanes: Lanes,
    camps: Vec<CampState>,
    champs: Vec<Champ>,
    wards: Vec<Ward>,
    next_ward: u32,
    events: Vec<Event>,
    rng: SimRng,
    t: f64,
    first_blood: bool,
}

/// Simule une partie. La même configuration (graine comprise) donne exactement la même partie.
pub fn simulate(setup: &MatchSetup) -> MatchResult {
    let (mut g, infos) = new_game(setup);
    let mut frames = Vec::new();
    let dt = rules::TICK;
    let mut winner = None;
    while g.t <= setup.duration + 1e-9 {
        g.spawn_camps();
        let (deaths, destroyed) = g.lanes.step(g.t, dt);
        for b in destroyed {
            let def = &g.lanes.buildings[b].def;
            g.events.push(Event::Structure {
                t: g.t,
                id: def.id.to_string(),
                team: def.side,
                by: None,
            });
            if def.kind == StructureKind::Nexus {
                winner = Some(1 - def.side);
            }
        }
        g.farm(&deaths);
        g.respawn();
        g.decide();
        for i in 0..g.champs.len() {
            let c = &g.champs[i];
            if c.alive() && c.fighter.mode == Mode::Idle {
                g.think(i, dt);
            }
        }
        g.combat(dt);
        g.vision(dt);
        for c in &mut g.champs {
            c.level_up();
            if c.alive() {
                let at_base = c.pos.dist(map::fountain(c.side)) < 1200.0;
                c.regen(dt, at_base);
            }
            c.charge = (c.charge + c.attack_speed() * dt).min(2.0);
            if g.t >= rules::PASSIVE_GOLD_START {
                c.earn(rules::PASSIVE_GOLD_PER_SEC * dt);
            }
            if g.t == 600.0 {
                c.report.at10 = c.snapshot();
            }
            if g.t == 900.0 {
                c.report.at15 = c.snapshot();
            }
            if g.t == 1200.0 {
                c.report.at20 = c.snapshot();
            }
            if g.t == 1500.0 {
                c.report.at25 = c.snapshot();
            }
        }
        frames.push(g.frame());
        if winner.is_some() {
            break;
        }
        g.t += dt;
    }
    let end = frames.last().map_or(0.0, |f| f.t);
    let winner = winner.unwrap_or_else(|| {
        if g.team_gold(BLUE) >= g.team_gold(RED) {
            BLUE
        } else {
            RED
        }
    });
    g.events.push(Event::End { t: end, winner });
    g.events.sort_by(|a, b| a.t().total_cmp(&b.t()));
    let players = g
        .champs
        .iter()
        .map(|c| PlayerReport {
            end: c.snapshot(),
            ..c.report.clone()
        })
        .collect();
    MatchResult {
        replay: Replay {
            version: REPLAY_VERSION,
            map: "summoners-rift",
            patch: setup.patch.clone(),
            seed: setup.seed,
            context: setup.context.clone(),
            duration: end,
            teams: [0, 1].map(|s| TeamInfo {
                tag: setup.teams[s].tag.clone(),
                name: setup.teams[s].name.clone(),
            }),
            champions: infos,
            frames,
            events: g.events,
        },
        players,
    }
}

/// La partie à 0:00 : champions à la fontaine, camps en attente.
fn new_game(setup: &MatchSetup) -> (Game, Vec<ChampionInfo>) {
    let mut rng = SimRng::new(setup.seed);
    let mut champs = Vec::new();
    let mut infos = Vec::new();
    for (side, team) in setup.teams.iter().enumerate() {
        for p in &team.players {
            infos.push(ChampionInfo {
                team: side,
                role: p.role,
                player: p.name.clone(),
                champion: p.champion.id.clone(),
                spells: p.spells.clone(),
            });
            champs.push(Champ {
                side,
                role: p.role,
                stats: p.champion.clone(),
                attrs: p.attrs,
                pos: map::fountain(side),
                path: Vec::new(),
                goal: None,
                xp: 0.0,
                gold: rules::STARTING_GOLD,
                gold_since_recall: 0.0,
                purse: rules::STARTING_GOLD,
                inv: Inventory::new(p.build.clone()),
                cs: 0,
                charge: 0.0,
                recall_until: None,
                trinket_at: 0.0,
                camp: None,
                report: PlayerReport::default(),
                fighter: Fighter {
                    has_flash: p.spells.iter().any(|s| s == "SummonerFlash"),
                    ..Fighter::new(p.kit.clone())
                },
            });
        }
    }
    for c in &mut champs {
        c.shop();
        c.level_up();
        c.fighter.hp = c.max_hp();
        c.fighter.mana = c.max_mana();
    }
    let camps: Vec<CampState> = map::camps()
        .into_iter()
        .map(|def| CampState {
            next_spawn: def.kind.first_spawn(),
            alive: false,
            hp: 0.0,
            def,
        })
        .collect();
    // Premier camp de chaque jungler : son buff rouge ou son buff bleu, au hasard.
    for c in champs.iter_mut().filter(|c| c.role == Role::Jungle) {
        let kind = if rng.chance(0.5) {
            CampKind::Red
        } else {
            CampKind::Blue
        };
        c.camp = camps
            .iter()
            .position(|k| k.def.kind == kind && k.def.side == Some(c.side));
    }
    let g = Game {
        nav: Nav::build(),
        lanes: Lanes::new(),
        camps,
        champs,
        wards: Vec::new(),
        next_ward: 1,
        events: Vec::new(),
        rng,
        t: 0.0,
        first_blood: false,
    };
    (g, infos)
}

impl Game {
    fn team_gold(&self, side: Side) -> f64 {
        self.champs
            .iter()
            .filter(|c| c.side == side)
            .map(|c| c.gold)
            .sum()
    }

    fn spawn_camps(&mut self) {
        const DRAGONS: [&str; 6] = [
            "Infernal", "Océan", "Montagne", "Nuage", "Chimtech", "Hextech",
        ];
        for i in 0..self.camps.len() {
            let c = &self.camps[i];
            if c.alive || self.t < c.next_spawn {
                continue;
            }
            let variant = match c.def.kind {
                CampKind::Dragon => Some(DRAGONS[(self.rng.next_u64() % 6) as usize].to_string()),
                CampKind::Baron if self.t < 1200.0 => Some("Larves du Néant".to_string()),
                CampKind::Baron => Some("Nashor".to_string()),
                _ => None,
            };
            let c = &mut self.camps[i];
            c.alive = true;
            c.hp = c.def.kind.hp();
            // Les larves restent jusqu'à l'arrivée du Nashor (personne ne les prend en M3).
            if c.def.kind == CampKind::Baron && self.t < 1200.0 {
                c.next_spawn = 1200.0;
                c.alive = false;
            }
            self.events.push(Event::CampSpawn {
                t: self.t,
                camp: c.def.id.to_string(),
                variant,
            });
        }
    }

    /// Les sbires qui meurent donnent de l'XP aux champions proches, et de l'or au champion
    /// qui réussit le dernier coup. Sinon, le sbire est perdu.
    fn farm(&mut self, deaths: &[Death]) {
        for d in deaths {
            let enemy = 1 - d.side;
            let stats = rules::minion(d.kind);
            let near: Vec<usize> = (0..self.champs.len())
                .filter(|&i| {
                    self.champs[i].side == enemy
                        && self.champs[i].pos.dist(d.pos) <= rules::XP_RANGE
                })
                .collect();
            // estimé (wiki) : à plusieurs, chacun reçoit un peu plus que sa part (65 % à deux).
            let share = match near.len() {
                0 | 1 => 1.0,
                n => (1.0 + 0.3 * (n - 1) as f64) / n as f64,
            };
            for &i in &near {
                self.champs[i].xp += stats.xp * share;
            }
            // Le joueur de la voie d'abord, puis son support. Le jungler ne farme pas les voies en M3.
            let mut order: Vec<usize> = near
                .iter()
                .copied()
                .filter(|&i| {
                    let c = &self.champs[i];
                    c.role.lane() == Some(d.lane)
                        && c.recall_until.is_none()
                        && c.pos.dist(d.pos) <= LAST_HIT_RANGE
                })
                .collect();
            order.sort_by_key(|&i| self.champs[i].role == Role::Support);
            for i in order {
                let c = &self.champs[i];
                if c.charge < 1.0 {
                    continue;
                }
                let p = if c.role == Role::Support {
                    SUPPORT_TAKE
                } else {
                    c.last_hit_chance()
                };
                let hit = self.rng.chance(p);
                let c = &mut self.champs[i];
                c.charge -= 1.0;
                if hit {
                    c.cs += 1;
                    c.earn(stats.gold);
                    break;
                }
            }
        }
    }

    fn think(&mut self, i: usize, dt: f64) {
        let t = self.t;
        if let Some(until) = self.champs[i].recall_until {
            if t >= until {
                let c = &mut self.champs[i];
                c.pos = map::fountain(c.side);
                c.path.clear();
                c.recall_until = None;
                c.fighter.mode = Mode::Idle;
                c.shop();
                // La fontaine soigne en quelques secondes : on repart plein.
                c.fighter.hp = c.max_hp();
                c.fighter.mana = c.max_mana();
                c.gold_since_recall = 0.0;
                c.report.recalls += 1;
            }
            return;
        }
        // Trop peu de PV pour rester : retour à la base (pas depuis la fontaine).
        let c = &self.champs[i];
        if c.fighter.hp < 0.35 * c.max_hp() && c.pos.dist(map::fountain(c.side)) > 1200.0 {
            self.start_recall(i);
            return;
        }
        if self.champs[i].role == Role::Jungle {
            self.jungle(i, dt);
        } else {
            self.laning(i, dt);
        }
        // Balise du support, vers la rivière, dès que le totem est rechargé.
        let c = &self.champs[i];
        if c.role == Role::Support
            && t >= 90.0
            && t >= c.trinket_at
            && c.goal.is_some_and(|g| g.dist(c.pos) < 300.0)
        {
            let pos = c.pos.toward(Point::new(7410.0, 7460.0), 900.0);
            self.place_ward(i, pos);
        }
    }

    fn place_ward(&mut self, i: usize, pos: Point) {
        let c = &mut self.champs[i];
        c.trinket_at = self.t + rules::TRINKET_COOLDOWN;
        c.report.wards += 1;
        let expires = self.t + rules::WARD_LIFETIME;
        self.wards.push(Ward {
            side: c.side,
            pos,
            expires,
        });
        self.events.push(Event::WardPlaced {
            t: self.t,
            id: self.next_ward,
            team: c.side,
            x: pos.x.round(),
            y: pos.y.round(),
            expires_at: expires,
            by: Some(i),
        });
        self.next_ward += 1;
    }

    fn start_recall(&mut self, i: usize) {
        self.champs[i].recall_until = Some(self.t + rules::RECALL_CHANNEL);
    }

    fn laning(&mut self, i: usize, dt: f64) {
        let c = &self.champs[i];
        let (side, lane) = (c.side, c.role.lane().unwrap_or(Lane::Mid));
        let len = lane.length();
        // Le front de sa vague, et le premier bâtiment adverse debout sur la voie.
        let own = self
            .lanes
            .waves
            .iter()
            .filter(|w| w.side == side && w.lane == lane && w.d > 1500.0)
            .map(|w| w.d)
            .fold(None, |a: Option<f64>, d| Some(a.map_or(d, |a| a.max(d))));
        let (mut own_turret, mut enemy_turret) = (0.0_f64, len);
        for b in &self.lanes.buildings {
            if b.def.kind != StructureKind::Turret || b.def.lane != Some(lane) || !b.alive() {
                continue;
            }
            let d = lane.along(side, b.def.pos);
            if b.def.side == side {
                own_turret = own_turret.max(d);
            } else {
                enemy_turret = enemy_turret.min(d);
            }
        }
        let mut back = match (c.role, c.stats.is_ranged()) {
            (Role::Support, _) => 550.0,
            (_, true) => 450.0,
            _ => 200.0,
        }; // estimé
           // Menacé par son vis-à-vis : il joue prudemment, plus loin de la vague (perd des sbires).
        if self.outmatched(i) {
            back += 350.0; // estimé
        }
        // Il se place derrière le point de contact des vagues (le front adverse s'il est seul).
        let enemy_front = self
            .lanes
            .waves
            .iter()
            .filter(|w| w.side != side && w.lane == lane && w.d > 1500.0)
            .map(|w| len - w.d - rules::WAVE_CONTACT)
            .fold(None, |a: Option<f64>, d| Some(a.map_or(d, |a| a.min(d))));
        let front = match (own, enemy_front) {
            (Some(o), Some(e)) => Some(o.max(e)),
            (o, e) => o.or(e),
        };
        let d = front
            .map_or(own_turret - 300.0, |f| f - back)
            .min(enemy_turret - 900.0);
        let goal = lane.point_at(side, d);
        // Retour à la base : assez d'or et aucune vague adverse à farmer tout près.
        let enemy_close = self
            .lanes
            .waves
            .iter()
            .any(|w| w.side != side && w.lane == lane && w.pos().dist(c.pos) < 1400.0);
        // Comme les pros : on rentre quand sa vague pousse chez l'adversaire, pour ne rien perdre.
        let pushing = own.is_some_and(|w| w > len / 2.0);
        let wants = (c.gold_since_recall >= RECALL_GOLD && pushing && !enemy_close)
            || c.gold_since_recall >= 2.0 * RECALL_GOLD;
        // Le support rentre avec son tireur.
        let follows = c.role == Role::Support
            && self
                .champs
                .iter()
                .any(|o| o.side == side && o.role == Role::Bot && o.recall_until.is_some());
        if follows || (c.role != Role::Support && wants && self.rng.chance(0.3)) {
            self.start_recall(i);
            return;
        }
        self.champs[i].walk(&self.nav, goal, dt);
    }

    fn jungle(&mut self, i: usize, dt: f64) {
        let t = self.t;
        let side = self.champs[i].side;
        // Le camp visé a été pris par un autre (carapateur) : on en choisit un autre.
        if let Some(k) = self.champs[i].camp {
            if !self.camps[k].alive && self.camps[k].next_spawn > t + 20.0 && t > 100.0 {
                self.champs[i].camp = None;
            }
        }
        if self.champs[i].camp.is_none() {
            if self.champs[i].gold_since_recall >= RECALL_GOLD {
                self.start_recall(i);
                return;
            }
            let c = &self.champs[i];
            let mut best: Option<(f64, usize)> = None;
            for (k, camp) in self.camps.iter().enumerate() {
                if !camp.def.kind.farmable() || camp.def.side.is_some_and(|s| s != side) {
                    continue;
                }
                let arrive = t + self.nav.route_length(c.pos, camp.def.pos) / c.stats.move_speed;
                let ready = if camp.alive {
                    arrive
                } else {
                    arrive.max(camp.next_spawn)
                };
                if best.is_none_or(|(r, _)| ready < r) {
                    best = Some((ready, k));
                }
            }
            self.champs[i].camp = best.map(|(_, k)| k);
        }
        let Some(k) = self.champs[i].camp else { return };
        let target = self.camps[k].def.pos;
        if self.champs[i].pos.dist(target) > 350.0 {
            self.champs[i].walk(&self.nav, target, dt);
            return;
        }
        if !self.camps[k].alive {
            return;
        }
        let c = &self.champs[i];
        let dps = c.ad() * c.attack_speed() * JUNGLE_CLEAR;
        self.camps[k].hp -= dps * dt;
        if self.camps[k].hp > 0.0 {
            return;
        }
        let kind = self.camps[k].def.kind;
        let (cs, gold, xp) = kind.rewards();
        let camp = &mut self.camps[k];
        camp.alive = false;
        camp.next_spawn = t + kind.respawn();
        self.events.push(Event::CampKilled {
            t,
            camp: camp.def.id.to_string(),
            team: side,
            respawn_at: Some(camp.next_spawn),
            by: Some(i),
        });
        let c = &mut self.champs[i];
        c.cs += cs;
        c.xp += xp;
        c.earn(gold);
        c.camp = None;
        if kind == CampKind::Scuttle && t >= c.trinket_at {
            self.place_ward(i, target);
        }
    }

    /// Qui voit qui : champions, sbires, tours et balises de chaque équipe.
    fn vision(&mut self, dt: f64) {
        let t = self.t;
        self.wards.retain(|w| w.expires > t);
        for i in 0..self.champs.len() {
            let me = &self.champs[i];
            if !me.alive() {
                continue;
            }
            let enemy = 1 - me.side;
            let p = me.pos;
            let seen =
                self.champs.iter().any(|o| {
                    o.side == enemy && o.alive() && o.pos.dist(p) <= rules::CHAMPION_SIGHT
                }) || self
                    .lanes
                    .waves
                    .iter()
                    .any(|w| w.side == enemy && w.pos().dist(p) <= rules::MINION_SIGHT)
                    || self.lanes.buildings.iter().any(|b| {
                        b.def.side == enemy
                            && b.alive()
                            && b.def.kind == StructureKind::Turret
                            && b.def.pos.dist(p) <= rules::TURRET_SIGHT
                    })
                    || self
                        .wards
                        .iter()
                        .any(|w| w.side == enemy && w.pos.dist(p) <= rules::WARD_SIGHT);
            if seen {
                self.champs[i].report.seen += dt;
            }
        }
    }

    fn frame(&self) -> Frame {
        let gd = self.team_gold(BLUE) - self.team_gold(RED);
        let x = gd / WIN_GOLD_SCALE;
        Frame {
            t: self.t,
            blue_win: 0.5 + 0.5 * x / (1.0 + x.abs()), // estimé, sans exp : identique partout
            champions: self
                .champs
                .iter()
                .map(|c| ChampionFrame {
                    x: c.pos.x.round(),
                    y: c.pos.y.round(),
                    hp: (c.fighter.hp / c.max_hp()).clamp(0.0, 1.0),
                    resource: (c.stats.mp > 0.0)
                        .then(|| (c.fighter.mana / c.max_mana()).clamp(0.0, 1.0)),
                    alive: c.alive(),
                    level: c.level(),
                    cs: c.cs,
                    gold: c.gold.round(),
                    items: c.inv.ids(),
                })
                .collect(),
            waves: self
                .lanes
                .waves
                .iter()
                .map(|w| WaveFrame {
                    id: w.id,
                    team: w.side,
                    lane: w.lane,
                    d: w.d.round(),
                    n: w.minions.len() as u32,
                })
                .collect(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn champion(id: &str, ranged: bool) -> ChampionStats {
        ChampionStats {
            id: id.to_string(),
            hp: 600.0,
            hp_per_level: 100.0,
            ad: 60.0,
            ad_per_level: 3.0,
            attack_speed: 0.65,
            attack_speed_per_level: 2.5,
            attack_range: if ranged { 550.0 } else { 175.0 },
            move_speed: 340.0,
            mp: 300.0,
            mp_per_level: 30.0,
            armor: 30.0,
            armor_per_level: 4.5,
            magic_resist: 30.0,
            magic_resist_per_level: 1.3,
            hp_regen: 6.0,
            hp_regen_per_level: 0.6,
            mp_regen: 8.0,
            mp_regen_per_level: 0.8,
        }
    }

    fn team(tag: &str) -> TeamSetup {
        TeamSetup {
            tag: tag.to_string(),
            name: tag.to_string(),
            players: Role::ALL
                .iter()
                .map(|&role| PlayerSetup {
                    name: format!("{tag} {role:?}"),
                    role,
                    champion: champion(
                        "Ahri",
                        matches!(role, Role::Mid | Role::Bot | Role::Support),
                    ),
                    attrs: Attributes::default(),
                    spells: ["SummonerFlash".into(), "SummonerTeleport".into()],
                    kit: None,
                    build: Vec::new(),
                })
                .collect(),
        }
    }

    pub fn setup(seed: u64, duration: f64) -> MatchSetup {
        MatchSetup {
            seed,
            patch: "26.1".into(),
            teams: [team("BLU"), team("RED")],
            duration,
            context: None,
        }
    }

    #[test]
    fn meme_graine_meme_partie() {
        let a = simulate(&setup(7, 600.0));
        let b = simulate(&setup(7, 600.0));
        assert_eq!(a.players, b.players);
        assert_eq!(a.replay.frames.len(), b.replay.frames.len());
        let fa = &a.replay.frames[450].champions;
        let fb = &b.replay.frames[450].champions;
        for (x, y) in fa.iter().zip(fb) {
            assert_eq!((x.x, x.y, x.cs, x.gold), (y.x, y.y, y.cs, y.gold));
        }
        let c = simulate(&setup(8, 600.0));
        assert_ne!(
            a.players, c.players,
            "une autre graine donne une autre partie"
        );
    }

    #[test]
    fn une_partie_de_farm_ressemble_a_une_vraie() {
        let r = simulate(&setup(1, 600.0));
        let at10: Vec<u32> = r.players.iter().map(|p| p.at10.cs).collect();
        // Chaque joueur de voie farme, le support beaucoup moins, le jungler fait ses camps.
        for side in [0, 5] {
            for role in [0, 2, 3] {
                assert!(at10[side + role] > 50, "rôle {role}: {at10:?}");
            }
            assert!(at10[side + 4] < 40, "support: {at10:?}");
            assert!(at10[side + 1] > 30, "jungle: {at10:?}");
        }
        assert!(
            r.players.iter().all(|p| p.at10.level >= 5),
            "niveaux à 10 min"
        );
        assert!(r.players.iter().any(|p| p.wards > 0), "des balises posées");
        assert!(r
            .replay
            .events
            .iter()
            .any(|e| matches!(e, Event::CampKilled { .. })));
        assert!(matches!(r.replay.events.last(), Some(Event::End { .. })));
    }

    #[test]
    fn le_flux_suit_le_format_de_la_vue() {
        let r = simulate(&setup(3, 120.0));
        let json = serde_json::to_value(&r.replay).unwrap();
        assert_eq!(json["version"], 1);
        assert_eq!(json["champions"][1]["role"], "jungle");
        assert!(json["frames"][100]["blueWin"].is_number());
        assert_eq!(json["frames"][100]["waves"][0]["lane"], "top");
        let spawn = json["events"]
            .as_array()
            .unwrap()
            .iter()
            .find(|e| e["type"] == "camp_spawn");
        assert!(spawn.is_some());
        assert!(json["events"]
            .as_array()
            .unwrap()
            .iter()
            .any(|e| e["type"] == "end"));
    }
}
