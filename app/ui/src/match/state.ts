// État de la partie à un instant donné, calculé à partir du flux.
// Fonction pure : le même flux et le même instant donnent toujours le même état.
import { CAMPS, STRUCTURES, wavePosition, type Camp, type Point, type Structure } from './map';
import type { ChampionInfo, Frame, Lane, MatchEvent, MatchReplay, TeamIndex } from './replay';

export interface ChampionView extends ChampionInfo {
  index: number;
  x: number;
  y: number;
  hp: number;
  resource: number | null;
  alive: boolean;
  /** Secondes avant la réapparition, si le champion est mort. */
  respawnIn: number | null;
  level: number;
  cs: number;
  gold: number;
  items: number[];
  kills: number;
  deaths: number;
  assists: number;
}

/** Objectifs pris par une équipe. */
export interface TeamObjectives {
  /** Variantes des dragons pris, dans l'ordre (« Infernal », « Océan »…). */
  dragons: string[];
  grubs: number;
  barons: number;
}

export interface WaveView { id: number; team: TeamIndex; lane: Lane; x: number; y: number; n: number }

export interface CampView {
  camp: Camp;
  status: 'waiting' | 'alive' | 'dead';
  variant: string | null;
  /** Secondes avant la réapparition (ou la première apparition). */
  respawnIn: number | null;
}

export interface WardView { id: number; team: TeamIndex; x: number; y: number }

export type Effect =
  | { kind: 'kill'; t: number; x: number; y: number; team: TeamIndex }
  | { kind: 'multikill'; t: number; x: number; y: number; team: TeamIndex; count: number; label: string }
  | { kind: 'teamfight'; t: number; end: number; x: number; y: number; radius: number; kills: [number, number] };

export interface MatchState {
  t: number;
  kills: [number, number];
  /** Tours détruites par chaque équipe. */
  towers: [number, number];
  destroyed: Set<string>;
  champions: ChampionView[];
  waves: WaveView[];
  camps: CampView[];
  wards: WardView[];
  /** Effets visibles à cet instant. */
  effects: Effect[];
  winner: TeamIndex | null;
  /** Or total de chaque équipe. */
  gold: [number, number];
  objectives: [TeamObjectives, TeamObjectives];
  /** Chances de victoire du côté bleu (0 à 1). */
  blueWin: number;
}

/** Durées d'affichage des effets, en secondes. */
export const EFFECT_DURATION = { kill: 2, multikill: 4, teamfightTail: 4 };
/** Fenêtre entre deux kills d'un même champion pour un multi-kill. */
export const MULTIKILL_WINDOW = 10;
/** Un teamfight : au moins 3 morts, chacune à moins de 15 s de la précédente. */
export const TEAMFIGHT_MIN_KILLS = 3;
export const TEAMFIGHT_GAP = 15;

const MULTI_LABELS = ['', '', 'Double kill', 'Triple kill', 'Quadra kill', 'Penta kill'];

type KillEvent = Extract<MatchEvent, { type: 'kill' }>;

/** Multi-kills et teamfights repérés dans les kills du flux. Calculé une fois par flux. */
export function analyzeEffects(replay: MatchReplay): Effect[] {
  const kills = replay.events.filter((e): e is KillEvent => e.type === 'kill');
  const effects: Effect[] = [];
  const at = (k: KillEvent) => championAt(replay, k.victim, k.t);

  for (const k of kills) {
    const p = at(k);
    effects.push({ kind: 'kill', t: k.t, x: p.x, y: p.y, team: replay.champions[k.victim].team === 0 ? 1 : 0 });
  }

  const streak = new Map<number, { count: number; last: number }>();
  for (const k of kills) {
    if (k.killer === null) continue;
    const prev = streak.get(k.killer);
    const count = prev && k.t - prev.last <= MULTIKILL_WINDOW ? prev.count + 1 : 1;
    streak.set(k.killer, { count, last: k.t });
    if (count >= 2) {
      const p = championAt(replay, k.killer, k.t);
      effects.push({
        kind: 'multikill', t: k.t, x: p.x, y: p.y, team: replay.champions[k.killer].team,
        count, label: MULTI_LABELS[Math.min(count, 5)],
      });
    }
  }

  let group: KillEvent[] = [];
  const flush = () => {
    if (group.length >= TEAMFIGHT_MIN_KILLS) {
      const pts = group.map(at);
      const cx = pts.reduce((a, p) => a + p.x, 0) / pts.length;
      const cy = pts.reduce((a, p) => a + p.y, 0) / pts.length;
      const radius = Math.max(900, ...pts.map((p) => Math.hypot(p.x - cx, p.y - cy) + 600));
      const blueDeaths = group.filter((k) => replay.champions[k.victim].team === 0).length;
      effects.push({
        kind: 'teamfight', t: group[0].t, end: group[group.length - 1].t, x: cx, y: cy, radius,
        kills: [group.length - blueDeaths, blueDeaths],
      });
    }
    group = [];
  };
  for (const k of kills) {
    if (group.length && k.t - group[group.length - 1].t > TEAMFIGHT_GAP) flush();
    group.push(k);
  }
  flush();
  return effects.sort((a, b) => a.t - b.t);
}

/** Indice de la dernière image dont `t` est inférieur ou égal à `t`. */
export function frameIndex(frames: Frame[], t: number): number {
  let lo = 0;
  let hi = frames.length - 1;
  if (t <= frames[0].t) return 0;
  if (t >= frames[hi].t) return hi;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (frames[mid].t <= t) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

function championAt(replay: MatchReplay, i: number, t: number): Point {
  const f = frameIndex(replay.frames, t);
  const c = replay.frames[f].champions[i];
  return { x: c.x, y: c.y };
}

/** Calcule l'état affiché à l'instant `t`. `effects` vient de `analyzeEffects`. */
export function stateAt(replay: MatchReplay, t: number, effects: Effect[] = []): MatchState {
  const time = Math.max(0, Math.min(replay.duration, t));
  const frames = replay.frames;
  const i = frameIndex(frames, time);
  const a = frames[i];
  const b = frames[Math.min(i + 1, frames.length - 1)];
  const k = b.t > a.t ? (time - a.t) / (b.t - a.t) : 0;

  const kills: [number, number] = [0, 0];
  const towers: [number, number] = [0, 0];
  const destroyed = new Set<string>();
  const respawnAt = new Map<number, number>();
  const camps = new Map<string, CampView>();
  for (const camp of CAMPS) camps.set(camp.id, { camp, status: 'waiting', variant: null, respawnIn: null });
  const wards = new Map<number, WardView & { expiresAt: number }>();
  let winner: TeamIndex | null = null;
  const kda = replay.champions.map(() => ({ kills: 0, deaths: 0, assists: 0 }));
  const objectives: [TeamObjectives, TeamObjectives] = [
    { dragons: [], grubs: 0, barons: 0 }, { dragons: [], grubs: 0, barons: 0 },
  ];
  const variantOf = new Map<string, string | undefined>();

  for (const e of replay.events) {
    if (e.t > time) break;
    switch (e.type) {
      case 'kill': {
        kills[replay.champions[e.victim].team === 0 ? 1 : 0]++;
        respawnAt.set(e.victim, e.respawnAt);
        kda[e.victim].deaths++;
        if (e.killer !== null) kda[e.killer].kills++;
        for (const a of e.assists) kda[a].assists++;
        break;
      }
      case 'structure': {
        destroyed.add(e.id);
        const st = STRUCTURES.find((x) => x.id === e.id);
        if (st?.kind === 'turret') towers[e.team]++;
        break;
      }
      case 'camp_spawn': {
        const c = camps.get(e.camp);
        if (c) camps.set(e.camp, { ...c, status: 'alive', variant: e.variant ?? null, respawnIn: null });
        variantOf.set(e.camp, e.variant);
        break;
      }
      case 'camp_killed': {
        const c = camps.get(e.camp);
        if (c) camps.set(e.camp, { ...c, status: 'dead', respawnIn: e.respawnAt === null ? null : e.respawnAt - time });
        const variant = variantOf.get(e.camp);
        if (e.camp === 'dragon') objectives[e.team].dragons.push(variant ?? 'Dragon');
        if (e.camp === 'baron' && variant === GRUBS) objectives[e.team].grubs += GRUBS_PER_TAKE;
        else if (e.camp === 'baron') objectives[e.team].barons++;
        break;
      }
      case 'ward_placed':
        wards.set(e.id, { id: e.id, team: e.team, x: e.x, y: e.y, expiresAt: e.expiresAt });
        break;
      case 'ward_killed':
        wards.delete(e.id);
        break;
      case 'end':
        winner = e.winner;
        break;
    }
  }
  // Prochaine apparition des camps encore jamais apparus.
  for (const e of replay.events) {
    if (e.type !== 'camp_spawn' || e.t <= time) continue;
    const c = camps.get(e.camp);
    if (c && c.status === 'waiting' && c.respawnIn === null) camps.set(e.camp, { ...c, respawnIn: e.t - time });
  }

  const champions: ChampionView[] = replay.champions.map((info, idx) => {
    const ca = a.champions[idx];
    const cb = b.champions[idx];
    const smooth = ca.alive === cb.alive;
    const alive = k < 1 ? ca.alive : cb.alive;
    const until = respawnAt.get(idx);
    return {
      ...info,
      ...kda[idx],
      index: idx,
      x: smooth ? lerp(ca.x, cb.x, k) : ca.x,
      y: smooth ? lerp(ca.y, cb.y, k) : ca.y,
      hp: smooth ? lerp(ca.hp, cb.hp, k) : ca.hp,
      resource: ca.resource,
      level: ca.level,
      cs: ca.cs,
      gold: ca.gold,
      items: ca.items,
      alive,
      respawnIn: !alive && until !== undefined ? Math.max(0, until - time) : null,
    };
  });

  const standing: Structure[] = STRUCTURES.filter((st) => !destroyed.has(st.id));
  const waves: WaveView[] = [];
  for (const wa of a.waves) {
    const wb = b.waves.find((w) => w.id === wa.id);
    const d = wb ? lerp(wa.d, wb.d, k) : wa.d;
    const p = wavePosition(wa.lane, wa.team, d, standing);
    if (p) waves.push({ id: wa.id, team: wa.team, lane: wa.lane, x: p.x, y: p.y, n: wb && k > 0.5 ? wb.n : wa.n });
  }

  const visible = effects.filter((e) => {
    if (e.t > time) return false;
    if (e.kind === 'kill') return time - e.t < EFFECT_DURATION.kill;
    if (e.kind === 'multikill') return time - e.t < EFFECT_DURATION.multikill;
    return time <= e.end + EFFECT_DURATION.teamfightTail;
  });

  return {
    t: time,
    kills,
    towers,
    destroyed,
    champions,
    waves,
    camps: [...camps.values()],
    wards: [...wards.values()].filter((w) => w.expiresAt > time).map(({ id, team, x, y }) => ({ id, team, x, y })),
    effects: visible,
    winner,
    gold: [0, 1].map((team) => champions.filter((c) => c.team === team).reduce((sum, c) => sum + c.gold, 0)) as [number, number],
    objectives,
    blueWin: lerp(a.blueWin, b.blueWin, k),
  };
}

/** Variante du camp du Nashor avant son apparition. */
export const GRUBS = 'Larves du Néant';
/** Larves tuées à chaque prise du camp (une vague de 3). */
export const GRUBS_PER_TAKE = 3;

/** Écart d'or (bleu moins rouge) à chaque minute jusqu'à `t`, pour la courbe. */
export function goldDiffByMinute(replay: MatchReplay, t: number): number[] {
  const out: number[] = [];
  for (let m = 0; m * 60 <= t; m++) {
    const f = replay.frames[frameIndex(replay.frames, m * 60)];
    out.push(f.champions.reduce((sum, c, i) => sum + (replay.champions[i].team === 0 ? c.gold : -c.gold), 0));
  }
  return out;
}

/** « 18:42 » */
export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
