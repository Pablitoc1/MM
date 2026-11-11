// Faux match KC contre G2, scripté, pour construire la vue 2D avant le moteur.
//
// Ce n'est PAS une simulation : les actions (kills, objectifs, tours) sont écrites
// à la main ci-dessous, et les déplacements en sont déduits. Le résultat suit
// exactement le format du flux (`replay.ts`) que le moteur Rust produira en M6.
// Toujours identique : aucun Math.random, seulement le générateur à graine ci-dessous.
//
// Les durées de jeu (réapparitions, apparition des camps, vitesses) sont des valeurs
// de démonstration, estimé : ordre de grandeur du patch 16.22, à remplacer par le moteur.
import {
  CAMPS, STRUCTURES, distanceAlongLane, laneLength, pointOnLane, type Point,
} from './map';
import type {
  ChampionFrame, ChampionInfo, Frame, Lane, MatchEvent, MatchReplay, Role, TeamIndex, WaveFrame,
} from './replay';
import { REPLAY_VERSION } from './replay';

/** Générateur pseudo-aléatoire à graine (mulberry32). */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEED = 20260111;
const DURATION = 1445;

// Valeurs de démonstration, estimé.
const CHAMP_SPEED = 380; // unités par seconde
const MINION_SPEED = 325;
const FIRST_WAVE = 65;
const WAVE_EVERY = 30;
const CAMP_FIRST_SPAWN = 90;
const SCUTTLE_FIRST_SPAWN = 210;
const RESPAWN_SMALL_CAMP = 135;
const RESPAWN_BUFF = 300;
const RESPAWN_SCUTTLE = 150;
const WARD_LIFETIME = 90;
const respawnDelay = (t: number) => 8 + (t / 60) * 1.25;

const FOUNTAIN: [Point, Point] = [{ x: 560, y: 580 }, { x: 14200, y: 14270 }]; // estimé (minimap)

const ROSTER: ChampionInfo[] = [
  { team: 0, role: 'top', player: 'Canna', champion: 'Renekton', spells: ['SummonerFlash', 'SummonerTeleport'] },
  { team: 0, role: 'jungle', player: 'Yike', champion: 'XinZhao', spells: ['SummonerFlash', 'SummonerSmite'] },
  { team: 0, role: 'mid', player: 'kyeahoo', champion: 'Orianna', spells: ['SummonerFlash', 'SummonerTeleport'] },
  { team: 0, role: 'bot', player: 'Caliste', champion: 'Varus', spells: ['SummonerFlash', 'SummonerHeal'] },
  { team: 0, role: 'support', player: 'Busio', champion: 'Rakan', spells: ['SummonerFlash', 'SummonerExhaust'] },
  { team: 1, role: 'top', player: 'BrokenBlade', champion: 'Gnar', spells: ['SummonerFlash', 'SummonerTeleport'] },
  { team: 1, role: 'jungle', player: 'SkewMond', champion: 'Sejuani', spells: ['SummonerFlash', 'SummonerSmite'] },
  { team: 1, role: 'mid', player: 'Caps', champion: 'Taliyah', spells: ['SummonerFlash', 'SummonerTeleport'] },
  { team: 1, role: 'bot', player: 'Hans Sama', champion: 'Ezreal', spells: ['SummonerFlash', 'SummonerHeal'] },
  { team: 1, role: 'support', player: 'Labrov', champion: 'Braum', spells: ['SummonerFlash', 'SummonerExhaust'] },
];

const LANE_OF: Record<Role, Lane | null> = { top: 'top', mid: 'mid', bot: 'bot', support: 'bot', jungle: null };

const at = (id: string): Point => {
  const p = STRUCTURES.find((s) => s.id === id) ?? CAMPS.find((c) => c.id === id);
  if (!p) throw new Error(`lieu inconnu : ${id}`);
  return { x: p.x, y: p.y };
};
const toward = (from: Point, to: Point, dist: number): Point => {
  const d = Math.hypot(to.x - from.x, to.y - from.y) || 1;
  return { x: from.x + ((to.x - from.x) / d) * dist, y: from.y + ((to.y - from.y) / d) * dist };
};
/** Position en pourcentage de la minimap → unités de jeu (pour reprendre la maquette). */
const pct = (px: number, py: number): Point => ({ x: (px / 100) * 14990 - 120, y: (1 - py / 100) * 15100 - 120 });

// ---------------------------------------------------------------- Le script

/** Un regroupement : ces champions vont à ce point pendant ce créneau. */
interface Play { from: number; to: number; who: number[]; at: Point; fight?: boolean }

const PLAYS: Play[] = [
  { from: 176, to: 196, who: [1, 0], at: pointOnLane('top', 0, laneLength('top') * 0.52), fight: true },
  { from: 318, to: 345, who: [1, 3, 4], at: at('dragon') },
  { from: 405, to: 425, who: [6, 7], at: pointOnLane('mid', 0, laneLength('mid') * 0.47), fight: true },
  { from: 495, to: 530, who: [6, 5, 7], at: at('baron') },
  { from: 620, to: 640, who: [1, 3, 4, 8, 9], at: pointOnLane('bot', 0, laneLength('bot') * 0.53), fight: true },
  { from: 675, to: 702, who: [6, 8, 9], at: at('dragon') },
  { from: 728, to: 752, who: [3, 4], at: toward(at('red_bot_outer'), FOUNTAIN[0], 450) },
  { from: 795, to: 822, who: [5, 6], at: toward(at('blue_top_outer'), FOUNTAIN[1], 450) },
  { from: 940, to: 962, who: [2, 1], at: toward(at('red_mid_outer'), FOUNTAIN[0], 450) },
  { from: 1015, to: 1042, who: [1, 3, 4, 2], at: at('dragon') },
  { from: 1170, to: 1195, who: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], at: at('scuttle_bot'), fight: true },
  { from: 1200, to: 1230, who: [0, 1, 2, 3], at: at('baron') },
  { from: 1255, to: 1311, who: [0, 1, 2, 3, 4], at: toward(at('red_mid_inner'), FOUNTAIN[0], 450) },
  { from: 1311, to: 1351, who: [0, 1, 2, 3, 4], at: toward(at('red_mid_inhib'), FOUNTAIN[0], 450), fight: true },
  { from: 1325, to: 1365, who: [5, 6, 7, 8, 9], at: toward(at('red_mid_inhib'), FOUNTAIN[1], 350), fight: true },
  { from: 1351, to: 1372, who: [0, 1, 2, 3, 4], at: toward(at('red_inhibitor_mid'), FOUNTAIN[0], 350) },
  { from: 1372, to: DURATION, who: [0, 1, 2, 3, 4], at: toward(at('red_nexus'), FOUNTAIN[0], 450), fight: true },
  { from: 1395, to: DURATION, who: [5, 6, 7, 8, 9], at: toward(at('red_nexus'), FOUNTAIN[1], 300), fight: true },
];

const KILLS: { t: number; killer: number; victim: number; assists: number[] }[] = [
  { t: 192, killer: 1, victim: 5, assists: [0] },
  { t: 422, killer: 7, victim: 2, assists: [6] },
  { t: 632, killer: 3, victim: 8, assists: [4, 1] },
  { t: 635, killer: 3, victim: 9, assists: [4] },
  { t: 1180, killer: 7, victim: 4, assists: [6] },
  { t: 1183, killer: 3, victim: 8, assists: [2] },
  { t: 1186, killer: 3, victim: 9, assists: [2, 1] },
  { t: 1189, killer: 3, victim: 7, assists: [1] },
  { t: 1191, killer: 0, victim: 5, assists: [1] },
  { t: 1345, killer: 2, victim: 6, assists: [1] },
  { t: 1348, killer: 2, victim: 7, assists: [3] },
  { t: 1352, killer: 2, victim: 9, assists: [4] },
  { t: 1356, killer: 8, victim: 0, assists: [] },
  { t: 1360, killer: 3, victim: 8, assists: [4] },
  { t: 1422, killer: 3, victim: 5, assists: [4] },
  { t: 1425, killer: 0, victim: 6, assists: [1] },
  { t: 1428, killer: 1, victim: 7, assists: [2] },
];

const STRUCTURE_KILLS: { t: number; id: string; team: TeamIndex }[] = [
  { t: 750, id: 'red_bot_outer', team: 0 },
  { t: 820, id: 'blue_top_outer', team: 1 },
  { t: 960, id: 'red_mid_outer', team: 0 },
  { t: 1310, id: 'red_mid_inner', team: 0 },
  { t: 1350, id: 'red_mid_inhib', team: 0 },
  { t: 1370, id: 'red_inhibitor_mid', team: 0 },
  { t: 1400, id: 'red_nexus_top', team: 0 },
  { t: 1414, id: 'red_nexus_bot', team: 0 },
  { t: 1440, id: 'red_nexus', team: 0 },
];

/** Objectifs neutres : apparitions et prises. */
const OBJECTIVES: MatchEvent[] = [
  { t: 300, type: 'camp_spawn', camp: 'dragon', variant: 'Infernal' },
  { t: 342, type: 'camp_killed', camp: 'dragon', team: 0, respawnAt: 642, by: 1 },
  { t: 480, type: 'camp_spawn', camp: 'baron', variant: 'Larves du Néant' },
  { t: 528, type: 'camp_killed', camp: 'baron', team: 1, respawnAt: 1200, by: 6 },
  { t: 642, type: 'camp_spawn', camp: 'dragon', variant: 'Océan' },
  { t: 700, type: 'camp_killed', camp: 'dragon', team: 1, respawnAt: 1000, by: 6 },
  { t: 1000, type: 'camp_spawn', camp: 'dragon', variant: 'Infernal' },
  { t: 1040, type: 'camp_killed', camp: 'dragon', team: 0, respawnAt: 1340, by: 1 },
  { t: 1200, type: 'camp_spawn', camp: 'baron', variant: 'Nashor' },
  { t: 1228, type: 'camp_killed', camp: 'baron', team: 0, respawnAt: 1588, by: 1 },
  { t: 1340, type: 'camp_spawn', camp: 'dragon', variant: 'Infernal' },
];

/** Tournée de chaque jungler : [arrivée, camp]. */
const JUNGLE_ROUTES: Record<1 | 6, [number, string][]> = {
  1: [[90, 'blue_red'], [118, 'blue_krugs'], [140, 'blue_raptors'], [160, 'blue_wolves'], [214, 'scuttle_top'],
    [250, 'blue_blue'], [270, 'blue_gromp'], [380, 'blue_red'], [410, 'blue_krugs'], [440, 'blue_raptors'],
    [560, 'blue_wolves'], [580, 'blue_blue'], [600, 'blue_gromp'], [700, 'blue_red'], [870, 'blue_blue'],
    [900, 'red_raptors'], [1090, 'blue_red'], [1120, 'blue_krugs'], [1240, 'blue_blue']],
  6: [[90, 'red_blue'], [112, 'red_gromp'], [136, 'red_wolves'], [160, 'red_raptors'], [214, 'scuttle_bot'],
    [250, 'red_red'], [272, 'red_krugs'], [360, 'red_blue'], [385, 'red_gromp'], [560, 'red_red'],
    [585, 'red_krugs'], [610, 'red_raptors'], [740, 'red_blue'], [760, 'red_wolves'], [880, 'red_red'],
    [905, 'red_krugs'], [1100, 'red_blue'], [1125, 'red_gromp'], [1240, 'red_red']],
};

/** Front de chaque voie (fraction depuis le nexus bleu) au fil du temps. */
const FRONT: Record<Lane, [number, number][]> = {
  top: [[0, 0.5], [700, 0.44], [800, 0.38], [1000, 0.5], [1300, 0.6], [1445, 0.62]],
  mid: [[0, 0.5], [880, 0.55], [960, 0.62], [1250, 0.7], [1320, 0.85], [1445, 0.9]],
  bot: [[0, 0.5], [650, 0.6], [750, 0.68], [1100, 0.62], [1445, 0.7]],
};

const WARD_SPOTS: [Point[], Point[]] = [
  [pct(45, 47), pct(30, 40), pct(62, 55), pct(52, 82), pct(36, 28), pct(68, 62)],
  [pct(60, 32), pct(78, 52), pct(40, 20), pct(70, 80), pct(55, 40), pct(32, 45)],
];

// ---------------------------------------------------------------- Économie (démonstration, estimé)

/** Objets achetés dans l'ordre : [identifiant Data Dragon 16.1, coût]. Le premier est l'objet de départ. */
const BUILDS: Record<string, [number, number][]> = {
  Renekton: [[1055, 450], [3047, 1200], [6610, 3100], [3053, 3200], [6333, 3300], [3071, 3000]],
  XinZhao: [[1101, 450], [3047, 1200], [6631, 3300], [3071, 3000], [3053, 3200], [6333, 3300]],
  Orianna: [[1056, 400], [3020, 1100], [6655, 2750], [4645, 3200], [3157, 3250], [3089, 3500]],
  Varus: [[1055, 450], [3006, 1100], [3032, 3100], [3031, 3500], [3036, 3300], [3046, 2650]],
  Rakan: [[3870, 400], [3117, 1000], [3190, 2200], [3050, 2200], [3109, 2300], [3065, 2700]],
  Gnar: [[1054, 450], [3047, 1200], [3078, 3333], [3053, 3200], [6333, 3300], [3748, 3300]],
  Sejuani: [[1102, 450], [3111, 1250], [6665, 3200], [3068, 2700], [3075, 2450], [3143, 2700]],
  Taliyah: [[1056, 400], [3020, 1100], [2503, 2800], [4645, 3200], [3157, 3250], [3135, 3000]],
  Ezreal: [[1055, 450], [3158, 900], [3004, 2900], [3078, 3333], [6694, 3000], [3033, 3000]],
  Braum: [[3876, 400], [3111, 1250], [3190, 2200], [3109, 2300], [2504, 2900], [3075, 2450]],
};

const START_GOLD = 500;
/** Or et CS par minute de jeu en vie, selon le rôle. */
const INCOME: Record<Role, number> = { top: 330, jungle: 320, mid: 360, bot: 380, support: 220 };
const CS_RATE: Record<Role, number> = { top: 7.8, jungle: 6.2, mid: 8.4, bot: 9, support: 1.1 };
const LEVEL_OFFSET: Record<Role, number> = { top: 0, jungle: -0.5, mid: 0.3, bot: -0.3, support: -1.5 };
const NO_RESOURCE = new Set(['Renekton', 'Gnar']);
const KILL_GOLD = 300;
const ASSIST_GOLD = 150;
const TOWER_GOLD_TEAM = 100;
const BARON_GOLD_TEAM = 300;

function itemsFor(champion: string, gold: number): number[] {
  const build = BUILDS[champion] ?? [];
  let left = gold;
  const bought: number[] = [];
  for (const [id, cost] of build) {
    if (left < cost) break;
    left -= cost;
    bought.push(id);
  }
  // L'objet de départ est revendu quand l'inventaire se remplit.
  return bought.length >= 5 ? bought.slice(1) : bought;
}

// ---------------------------------------------------------------- Génération

function interp(points: [number, number][], t: number): number {
  if (t <= points[0][0]) return points[0][1];
  for (let i = 1; i < points.length; i++) {
    const [t1, v1] = points[i];
    const [t0, v0] = points[i - 1];
    if (t <= t1) return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0);
  }
  return points[points.length - 1][1];
}

/** Distance (depuis le nexus de `team`) du premier bâtiment adverse encore debout sur la voie. */
function enemyWall(lane: Lane, team: TeamIndex, destroyed: Set<string>): number {
  const len = laneLength(lane);
  let wall = len;
  for (const st of STRUCTURES) {
    if (st.team === team || destroyed.has(st.id)) continue;
    if (st.lane !== lane && st.kind !== 'nexus' && st.lane !== null) continue;
    wall = Math.min(wall, distanceAlongLane(lane, team, st));
  }
  return wall;
}

function laneSpot(lane: Lane, team: TeamIndex, t: number, destroyed: Set<string>, back: number): number {
  const len = laneLength(lane);
  const front = interp(FRONT[lane], t) * len;
  const own = team === 0 ? front : len - front;
  return Math.max(2600, Math.min(own - back, enemyWall(lane, team, destroyed) - 900));
}

export function buildDemoReplay(): MatchReplay {
  const rand = rng(SEED);
  const events: MatchEvent[] = [];
  const frames: Frame[] = [];

  // Kills et bâtiments, connus d'avance.
  const deathUntil = new Map<number, [number, number][]>();
  for (const k of KILLS) {
    const respawnAt = Math.round(k.t + respawnDelay(k.t));
    events.push({ t: k.t, type: 'kill', killer: k.killer, victim: k.victim, assists: k.assists, respawnAt });
    deathUntil.set(k.victim, [...(deathUntil.get(k.victim) ?? []), [k.t, respawnAt]]);
  }
  for (const s of STRUCTURE_KILLS) events.push({ t: s.t, type: 'structure', id: s.id, team: s.team });
  events.push(...OBJECTIVES);
  events.push({ t: 1440, type: 'end', winner: 0 });

  // Camps de la jungle : premières apparitions, prises par les junglers, réapparitions.
  for (const camp of CAMPS) {
    if (camp.kind === 'dragon' || camp.kind === 'baron') continue;
    events.push({ t: camp.kind === 'scuttle' ? SCUTTLE_FIRST_SPAWN : CAMP_FIRST_SPAWN, type: 'camp_spawn', camp: camp.id });
  }
  const campReady = new Map<string, number>();
  for (const camp of CAMPS) campReady.set(camp.id, camp.kind === 'scuttle' ? SCUTTLE_FIRST_SPAWN : CAMP_FIRST_SPAWN);
  for (const [jg, route] of Object.entries(JUNGLE_ROUTES)) {
    const team = ROSTER[Number(jg)].team;
    for (const [arrive, id] of route) {
      const camp = CAMPS.find((c) => c.id === id)!;
      const ready = campReady.get(id)!;
      const done = Math.max(arrive, ready) + (camp.kind === 'scuttle' ? 12 : 18);
      const delay = camp.kind === 'scuttle' ? RESPAWN_SCUTTLE : camp.kind === 'blue' || camp.kind === 'red' ? RESPAWN_BUFF : RESPAWN_SMALL_CAMP;
      events.push({ t: done, type: 'camp_killed', camp: id, team, respawnAt: done + delay, by: Number(jg) });
      events.push({ t: done + delay, type: 'camp_spawn', camp: id });
      campReady.set(id, done + delay);
    }
  }

  // Balises : chaque support et chaque jungler en pose une toutes les 45 s environ.
  let wardId = 0;
  for (const team of [0, 1] as TeamIndex[]) {
    const spots = WARD_SPOTS[team];
    for (let t = 75 + team * 11; t < 1430; t += 40 + Math.floor(rand() * 15)) {
      const p = spots[wardId % spots.length];
      const id = ++wardId;
      const placed = { t, type: 'ward_placed' as const, id, team, x: Math.round(p.x), y: Math.round(p.y), expiresAt: t + WARD_LIFETIME };
      events.push(placed);
      if (rand() < 0.3) events.push({ t: t + 20 + Math.floor(rand() * 50), type: 'ward_killed', id });
    }
  }
  events.sort((a, b) => a.t - b.t);

  // Déplacements.
  const pos: Point[] = ROSTER.map((c) => ({ ...FOUNTAIN[c.team] }));
  const hp = ROSTER.map(() => 1);
  const isDead = (i: number, t: number) => (deathUntil.get(i) ?? []).some(([a, b]) => t >= a && t < b);
  const nextDeath = (i: number, t: number) => (deathUntil.get(i) ?? []).find(([a]) => a >= t)?.[0];
  const wasDead = ROSTER.map(() => false);
  const phase = ROSTER.map(() => rand() * Math.PI * 2);
  const aliveFarm = ROSTER.map(() => 0);

  const destroyedAt = (t: number) => new Set(STRUCTURE_KILLS.filter((s) => s.t <= t).map((s) => s.id));

  const target = (i: number, t: number, destroyed: Set<string>): Point => {
    const c = ROSTER[i];
    const wobble = (r: number) => ({ x: Math.cos(t / 3 + phase[i]) * r, y: Math.sin(t / 4 + phase[i]) * r });
    const play = PLAYS.find((p) => t >= p.from && t < p.to && p.who.includes(i));
    if (play) {
      const w = wobble(play.fight ? 380 : 220);
      const side = c.team === 0 ? -1 : 1;
      return { x: play.at.x + w.x + side * 150, y: play.at.y + w.y + side * 150 };
    }
    const lane = LANE_OF[c.role];
    if (lane) {
      const back = c.role === 'support' ? 900 : 650;
      const d = laneSpot(lane, c.team, t, destroyed, back);
      const p = pointOnLane(lane, c.team, d);
      const w = wobble(160);
      return { x: p.x + w.x, y: p.y + w.y };
    }
    if (t < CAMP_FIRST_SPAWN - 25) return toward(FOUNTAIN[c.team], { x: 7400, y: 7400 }, 4200);
    const route = JUNGLE_ROUTES[i as 1 | 6];
    let camp = route[0][1];
    for (const [arrive, id] of route) if (t >= arrive - 15) camp = id;
    const w = wobble(120);
    const p = at(camp);
    return { x: p.x + w.x, y: p.y + w.y };
  };

  const fightAt = (t: number) => PLAYS.some((p) => p.fight && t >= p.from - 2 && t < p.to);

  // Vagues de sbires.
  interface LiveWave { id: number; team: TeamIndex; lane: Lane; d: number; n: number; arrived: number | null }
  let waves: LiveWave[] = [];
  let waveId = 0;
  const lanes: Lane[] = ['top', 'mid', 'bot'];

  const dt = 0.25;
  for (let step = 0; step <= DURATION / dt; step++) {
    const t = step * dt;
    const destroyed = destroyedAt(t);

    for (let i = 0; i < ROSTER.length; i++) {
      const dead = isDead(i, t);
      if (dead) { hp[i] = 0; wasDead[i] = true; continue; }
      if (wasDead[i]) { pos[i] = { ...FOUNTAIN[ROSTER[i].team] }; wasDead[i] = false; hp[i] = 1; }
      const goal = target(i, t, destroyed);
      const dx = goal.x - pos[i].x;
      const dy = goal.y - pos[i].y;
      const d = Math.hypot(dx, dy);
      const stepLen = CHAMP_SPEED * dt;
      if (d > stepLen) { pos[i].x += (dx / d) * stepLen; pos[i].y += (dy / d) * stepLen; } else { pos[i].x = goal.x; pos[i].y = goal.y; }
      const death = nextDeath(i, t);
      if (death !== undefined && death - t < 6) hp[i] = Math.max(0.04, (death - t) / 6 * 0.6);
      else if (fightAt(t) && PLAYS.some((p) => p.fight && t >= p.from && t < p.to && p.who.includes(i))) hp[i] = 0.45 + 0.35 * (0.5 + 0.5 * Math.sin(t * 1.7 + phase[i]));
      else hp[i] = Math.min(1, hp[i] + 0.01 * dt);
    }

    if (t >= FIRST_WAVE && (t - FIRST_WAVE) % WAVE_EVERY === 0) {
      for (const lane of lanes) for (const team of [0, 1] as TeamIndex[]) {
        if (destroyed.has(team === 0 ? 'blue_nexus' : 'red_nexus')) continue;
        waves.push({ id: ++waveId, team, lane, d: 0, n: 6, arrived: null });
      }
    }
    for (const w of waves) {
      const cap = Math.min(
        (() => { const len = laneLength(w.lane); const f = interp(FRONT[w.lane], t) * len; return (w.team === 0 ? f : len - f) - 150; })(),
        enemyWall(w.lane, w.team, destroyed) - 250,
      );
      if (w.d < cap) { w.d = Math.min(cap, w.d + MINION_SPEED * dt); w.arrived = null; }
      else {
        w.d = Math.max(cap, w.d - MINION_SPEED * dt);
        if (w.arrived === null) w.arrived = t;
        else if (t - w.arrived >= 4.5) { w.n -= 1; w.arrived = t; }
      }
    }
    // Deux vagues alliées au même endroit n'en font qu'une.
    for (const w of waves) {
      const ahead = waves.find((o) => o !== w && o.n > 0 && o.team === w.team && o.lane === w.lane && o.id < w.id && Math.abs(o.d - w.d) < 200);
      if (ahead && w.n > 0) { ahead.n = Math.min(12, ahead.n + w.n); w.n = 0; }
    }
    waves = waves.filter((w) => w.n > 0);

    for (let i = 0; i < ROSTER.length; i++) if (!isDead(i, t) && t >= CAMP_FIRST_SPAWN) aliveFarm[i] += dt;

    const emit = Math.abs(t - Math.round(t)) < 1e-9 || fightAt(t);
    if (emit) {
      const champions: ChampionFrame[] = ROSTER.map((c, i) => {
        const kills = KILLS.filter((k) => k.t <= t && k.killer === i).length;
        const assists = KILLS.filter((k) => k.t <= t && k.assists.includes(i)).length;
        const towers = STRUCTURE_KILLS.filter((st) => st.t <= t && st.team === c.team).length;
        const barons = OBJECTIVES.filter((o) => o.t <= t && o.type === 'camp_killed' && o.camp === 'baron' && o.team === c.team && o.t > 1000).length;
        const gold = Math.round(START_GOLD + (INCOME[c.role] * aliveFarm[i]) / 60 + KILL_GOLD * kills + ASSIST_GOLD * assists
          + TOWER_GOLD_TEAM * towers + BARON_GOLD_TEAM * barons);
        const level = Math.max(1, Math.min(18, Math.floor(1 + 17 * Math.pow(t / 2100, 0.75) + LEVEL_OFFSET[c.role] + 0.25 * kills)));
        const resource = NO_RESOURCE.has(c.champion) ? null
          : Math.round((0.35 + 0.6 * (0.5 + 0.5 * Math.sin(t / 23 + phase[i]))) * 100) / 100;
        return {
          x: Math.round(pos[i].x), y: Math.round(pos[i].y), hp: Math.round(hp[i] * 100) / 100, resource,
          alive: !isDead(i, t), level, cs: Math.floor((CS_RATE[c.role] * aliveFarm[i]) / 60), gold,
          items: itemsFor(c.champion, gold),
        };
      });
      const goldDiff = champions.reduce((a, ch, i) => a + (ROSTER[i].team === 0 ? ch.gold : -ch.gold), 0);
      const towerDiff = STRUCTURE_KILLS.filter((st) => st.t <= t).reduce((a, st) => a + (st.team === 0 ? 1 : -1), 0);
      const ended = t >= 1440;
      const blueWin = ended ? 1 : 1 / (1 + Math.exp(-(goldDiff / 4000 + 0.15 * towerDiff)));
      const waveFrames: WaveFrame[] = waves.map((w) => ({ id: w.id, team: w.team, lane: w.lane, d: Math.round(w.d), n: w.n }));
      frames.push({ t, blueWin: Math.round(blueWin * 1000) / 1000, champions, waves: waveFrames });
    }
  }

  return {
    version: REPLAY_VERSION,
    map: 'summoners-rift',
    patch: '26.1',
    seed: SEED,
    duration: DURATION,
    teams: [{ tag: 'KC', name: 'Karmine Corp' }, { tag: 'G2', name: 'G2 Esports' }],
    champions: ROSTER,
    frames,
    events,
  };
}
