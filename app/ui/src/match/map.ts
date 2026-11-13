// La Faille de l'invocateur (carte 11) en unités de jeu Riot.
//
// Sources :
// - Limites de la carte et image : Data Dragon 16.22.1 (`img/map/map11.png`, 512 × 512),
//   cadre min (-120, -120) max (14870, 14980) donné par Riot pour la carte 11.
// - Tours et inhibiteurs : positions des bâtiments dans les timelines de l'API Riot (match-v5).
// - Nexus, camps, voies et alcôves : relevés sur la minimap 16.22 et superposés
//   pour contrôle (voir docs/decisions/003-flux-vue-2d.md). Ils sont marqués `// estimé`.
import type { Lane, TeamIndex } from './replay';

export interface Point { x: number; y: number }

export const MAP_MIN: Point = { x: -120, y: -120 };
export const MAP_MAX: Point = { x: 14870, y: 14980 };

/** Position de jeu → fraction de l'image (0 à 1, origine en haut à gauche). */
export function toUnit(p: Point): Point {
  return {
    x: (p.x - MAP_MIN.x) / (MAP_MAX.x - MAP_MIN.x),
    y: 1 - (p.y - MAP_MIN.y) / (MAP_MAX.y - MAP_MIN.y),
  };
}

export type StructureKind = 'turret' | 'inhibitor' | 'nexus';

export interface Structure {
  id: string;
  team: TeamIndex;
  kind: StructureKind;
  lane: Lane | null;
  x: number;
  y: number;
}

function s(id: string, team: TeamIndex, kind: StructureKind, lane: Lane | null, x: number, y: number): Structure {
  return { id, team, kind, lane, x, y };
}

/** 22 tours, 6 inhibiteurs, 2 nexus. */
export const STRUCTURES: Structure[] = [
  s('blue_top_outer', 0, 'turret', 'top', 981, 10441),
  s('blue_top_inner', 0, 'turret', 'top', 1512, 6699),
  s('blue_top_inhib', 0, 'turret', 'top', 1169, 4287),
  s('blue_mid_outer', 0, 'turret', 'mid', 5846, 6396),
  s('blue_mid_inner', 0, 'turret', 'mid', 5048, 4812),
  s('blue_mid_inhib', 0, 'turret', 'mid', 3651, 3696),
  s('blue_bot_outer', 0, 'turret', 'bot', 10504, 1029),
  s('blue_bot_inner', 0, 'turret', 'bot', 6919, 1483),
  s('blue_bot_inhib', 0, 'turret', 'bot', 4281, 1253),
  s('blue_nexus_top', 0, 'turret', null, 1748, 2270),
  s('blue_nexus_bot', 0, 'turret', null, 2177, 1807),
  s('red_top_outer', 1, 'turret', 'top', 4316, 13891),
  s('red_top_inner', 1, 'turret', 'top', 7901, 13437),
  s('red_top_inhib', 1, 'turret', 'top', 10539, 13667),
  s('red_mid_outer', 1, 'turret', 'mid', 8974, 8524),
  s('red_mid_inner', 1, 'turret', 'mid', 9772, 10108),
  s('red_mid_inhib', 1, 'turret', 'mid', 11169, 11224),
  s('red_bot_outer', 1, 'turret', 'bot', 13839, 4479),
  s('red_bot_inner', 1, 'turret', 'bot', 13308, 8221),
  s('red_bot_inhib', 1, 'turret', 'bot', 13651, 10633),
  s('red_nexus_top', 1, 'turret', null, 12643, 13113),
  s('red_nexus_bot', 1, 'turret', null, 13072, 12650),
  s('blue_inhibitor_top', 0, 'inhibitor', 'top', 1171, 3571),
  s('blue_inhibitor_mid', 0, 'inhibitor', 'mid', 3203, 3208),
  s('blue_inhibitor_bot', 0, 'inhibitor', 'bot', 3452, 1236),
  s('red_inhibitor_top', 1, 'inhibitor', 'top', 11368, 13684),
  s('red_inhibitor_mid', 1, 'inhibitor', 'mid', 11617, 11712),
  s('red_inhibitor_bot', 1, 'inhibitor', 'bot', 13649, 11349),
  s('blue_nexus', 0, 'nexus', null, 1551, 1661), // estimé (minimap)
  s('red_nexus', 1, 'nexus', null, 13269, 13259), // estimé (minimap)
];

export type CampKind =
  | 'blue' | 'red' | 'gromp' | 'wolves' | 'raptors' | 'krugs' | 'scuttle' | 'dragon' | 'baron';

export interface Camp {
  id: string;
  kind: CampKind;
  /** Côté de la jungle, ou null pour la rivière. */
  side: TeamIndex | null;
  x: number;
  y: number;
}

// Positions des camps : estimé (relevées sur la minimap 16.22, contrôlées par superposition).
export const CAMPS: Camp[] = [
  { id: 'blue_blue', kind: 'blue', side: 0, x: 3821, y: 8101 },
  { id: 'blue_gromp', kind: 'gromp', side: 0, x: 2288, y: 8448 },
  { id: 'blue_wolves', kind: 'wolves', side: 0, x: 3780, y: 6443 },
  { id: 'blue_raptors', kind: 'raptors', side: 0, x: 6943, y: 5422 },
  { id: 'blue_red', kind: 'red', side: 0, x: 7765, y: 4020 },
  { id: 'blue_krugs', kind: 'krugs', side: 0, x: 8482, y: 2705 },
  { id: 'red_blue', kind: 'blue', side: 1, x: 10999, y: 6819 },
  { id: 'red_gromp', kind: 'gromp', side: 1, x: 12532, y: 6472 },
  { id: 'red_wolves', kind: 'wolves', side: 1, x: 11040, y: 8477 },
  { id: 'red_raptors', kind: 'raptors', side: 1, x: 7877, y: 9498 },
  { id: 'red_red', kind: 'red', side: 1, x: 7055, y: 10900 },
  { id: 'red_krugs', kind: 'krugs', side: 1, x: 6338, y: 12215 },
  { id: 'scuttle_top', kind: 'scuttle', side: null, x: 4400, y: 9600 },
  { id: 'scuttle_bot', kind: 'scuttle', side: null, x: 10420, y: 5320 },
  { id: 'dragon', kind: 'dragon', side: null, x: 9866, y: 4414 },
  { id: 'baron', kind: 'baron', side: null, x: 4954, y: 10506 },
];

/** Alcôves des virages top et bot (petites boucles au bord de la carte). */
export const ALCOVES: Point[] = [
  { x: 1197, y: 13447 }, // estimé (minimap)
  { x: 13495, y: 1427 }, // estimé (minimap)
];

/**
 * Tracé des voies, du nexus bleu au nexus rouge. Virages compris.
 * estimé : relevé sur la minimap 16.22 (centre de la voie).
 */
export const LANES: Record<Lane, Point[]> = {
  top: [
    { x: 1551, y: 1661 }, { x: 1150, y: 3000 }, { x: 1100, y: 10500 }, { x: 1350, y: 12500 },
    { x: 2400, y: 13550 }, { x: 4300, y: 13850 }, { x: 10500, y: 13750 }, { x: 13269, y: 13259 },
  ],
  mid: [
    { x: 1551, y: 1661 }, { x: 3203, y: 3208 }, { x: 11617, y: 11712 }, { x: 13269, y: 13259 },
  ],
  bot: [
    { x: 1551, y: 1661 }, { x: 4320, y: 1170 }, { x: 10520, y: 1070 }, { x: 12420, y: 1370 },
    { x: 13470, y: 2420 }, { x: 13720, y: 4420 }, { x: 13670, y: 11920 }, { x: 13269, y: 13259 },
  ],
};

const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

/** Longueur totale d'une voie, en unités de jeu. */
export function laneLength(lane: Lane): number {
  const pts = LANES[lane];
  let len = 0;
  for (let i = 1; i < pts.length; i++) len += dist(pts[i - 1], pts[i]);
  return len;
}

/** Point situé à la distance `d` le long de la voie, depuis le nexus de `team`. */
export function pointOnLane(lane: Lane, team: TeamIndex, d: number): Point {
  const pts = team === 0 ? LANES[lane] : [...LANES[lane]].reverse();
  let rest = Math.max(0, d);
  for (let i = 1; i < pts.length; i++) {
    const seg = dist(pts[i - 1], pts[i]);
    if (rest <= seg) {
      const k = rest / seg;
      return { x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * k, y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * k };
    }
    rest -= seg;
  }
  return { ...pts[pts.length - 1] };
}

/** Distance le long de la voie (depuis le nexus de `team`) du point de la voie le plus proche de `p`. */
export function distanceAlongLane(lane: Lane, team: TeamIndex, p: Point): number {
  const pts = team === 0 ? LANES[lane] : [...LANES[lane]].reverse();
  let best = Infinity;
  let bestD = 0;
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const seg = dist(a, b);
    const k = Math.max(0, Math.min(1, ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / (seg * seg)));
    const q = { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
    const e = dist(p, q);
    if (e < best) { best = e; bestD = acc + seg * k; }
    acc += seg;
  }
  return bestD;
}

/** Rayon autour d'un bâtiment debout où l'on ne dessine jamais une vague (unités de jeu). */
export const WAVE_CLEARANCE = 800;

/** Une vague ne s'affiche qu'une fois sortie de sa base (distance depuis son nexus). */
export const WAVE_HIDDEN_IN_BASE = 2600;

/**
 * Position d'affichage d'une vague : sa place dans la voie, écartée en douceur
 * de tout bâtiment encore debout (elle le contourne au lieu de le chevaucher).
 * Renvoie null tant que la vague est dans sa base.
 */
export function wavePosition(lane: Lane, team: TeamIndex, d: number, standing: Structure[]): Point | null {
  if (d < WAVE_HIDDEN_IN_BASE || d > laneLength(lane) - WAVE_HIDDEN_IN_BASE) return null;
  const p = pointOnLane(lane, team, d);
  for (let pass = 0; pass < 4; pass++) {
    let moved = false;
    for (const st of standing) {
      const e = dist(p, st);
      if (e >= WAVE_CLEARANCE) continue;
      // Écarte vers l'intérieur de la carte si la vague est pile sur le bâtiment.
      const ux = e > 1 ? (p.x - st.x) / e : 7400 - st.x;
      const uy = e > 1 ? (p.y - st.y) / e : 7400 - st.y;
      const n = Math.hypot(ux, uy) || 1;
      p.x = st.x + (ux / n) * WAVE_CLEARANCE;
      p.y = st.y + (uy / n) * WAVE_CLEARANCE;
      moved = true;
    }
    if (!moved) break;
  }
  return p;
}
export function structureById(id: string): Structure | undefined {
  return STRUCTURES.find((st) => st.id === id);
}

export function campById(id: string): Camp | undefined {
  return CAMPS.find((c) => c.id === id);
}
