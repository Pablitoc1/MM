// Fil du match : les événements du flux mis en phrases, les plus récents d'abord.
// Comme sur la maquette : un multi-kill tient sur une ligne, les kills d'un teamfight
// sont regroupés dans un encadré titré, avec l'objectif pris pendant le combat.
import { LANES, STRUCTURES, campById, laneLength, pointOnLane, type Point } from './map';
import type { Lane, MatchReplay, TeamIndex } from './replay';
import { GRUBS, MULTIKILL_WINDOW, type Effect } from './state';

export type ObjectiveCamp = 'dragon' | 'baron' | 'grubs';

export interface FeedObjective {
  t: number; team: TeamIndex; by: number | null; camp: ObjectiveCamp; variant: string | null;
  /** « Drake infernal », « Larves du Néant », « Nashor ». */
  name: string;
}

export type FeedEntry =
  | {
    kind: 'kill'; t: number; team: TeamIndex; killer: number | null;
    /** Victimes, dans l'ordre (plusieurs pour un multi-kill). */
    victims: number[];
    multikill: string | null;
  }
  | { kind: 'structure'; t: number; team: TeamIndex; by: number | null; text: string }
  | ({ kind: 'objective'; text: string } & FeedObjective)
  | { kind: 'ward'; t: number; team: TeamIndex; by: number; text: string }
  | {
    kind: 'teamfight'; t: number; end: number;
    /** « Combat au dragon », « Combat en mid »… */
    title: string;
    score: [number, number];
    /** Champions tombés, par équipe (indices du flux). */
    lost: [number[], number[]];
    multikills: { champion: number; label: string }[];
    objectives: FeedObjective[];
  };

const TIER: Record<string, string> = { outer: 'extérieure', inner: 'intérieure', inhib: "d'inhibiteur" };

/** « la tour bot extérieure », « l'inhibiteur mid », « le nexus ». */
export function structureLabel(id: string): string {
  const st = STRUCTURES.find((s) => s.id === id);
  if (!st) return id;
  if (st.kind === 'nexus') return 'le nexus';
  if (st.kind === 'inhibitor') return `l'inhibiteur ${st.lane ?? 'mid'}`;
  if (st.lane === null) return 'une tour du nexus';
  const tier = id.split('_').pop() ?? '';
  return `la tour ${st.lane} ${TIER[tier] ?? ''}`.trim();
}

/** Distance sous laquelle une balise ou un combat est « au dragon » ou « au Nashor ». */
export const NEAR_OBJECTIVE = 2200;
/** Une balise compte si l'objectif tombe dans ce délai, en secondes. */
export const WARD_LEAD = 120;
/** Distance sous laquelle un combat est « en voie ». */
const NEAR_LANE = 1300;

const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

/** Où se trouve un point, pour un titre : « au dragon », « au Nashor », « en mid », « en jungle ». */
export function placeName(p: Point): string {
  const dragon = campById('dragon')!;
  const baron = campById('baron')!;
  if (dist(p, dragon) < NEAR_OBJECTIVE) return 'au dragon';
  if (dist(p, baron) < NEAR_OBJECTIVE) return 'au Nashor';
  let best: { lane: Lane; d: number } | null = null;
  for (const lane of Object.keys(LANES) as Lane[]) {
    const len = laneLength(lane);
    for (let d = 0; d <= len; d += 300) {
      const e = dist(p, pointOnLane(lane, 0, d));
      if (!best || e < best.d) best = { lane, d: e };
    }
  }
  return best && best.d < NEAR_LANE ? `en ${best.lane}` : 'en jungle';
}

function objectiveName(camp: ObjectiveCamp, variant: string | null): string {
  if (camp === 'grubs') return 'Larves du Néant';
  if (camp === 'baron') return 'Nashor';
  return variant ? `Drake ${variant.toLowerCase()}` : 'Dragon';
}

type Fight = Extract<Effect, { kind: 'teamfight' }>;

/** Les entrées du fil jusqu'à l'instant `t`, la plus récente en premier. */
export function buildFeed(replay: MatchReplay, t: number, effects: Effect[]): FeedEntry[] {
  const out: FeedEntry[] = [];
  const fights = effects.filter((e): e is Fight => e.kind === 'teamfight' && e.t <= t);
  const multis = effects.filter((e): e is Extract<Effect, { kind: 'multikill' }> => e.kind === 'multikill' && e.t <= t);
  const variant = new Map<string, string | undefined>();
  const tag = (team: TeamIndex) => replay.teams[team].tag;
  const player = (i: number) => replay.champions[i].player;
  const blocks = new Map<Fight, Extract<FeedEntry, { kind: 'teamfight' }>>();
  const fightOf = (time: number, tail = 0) => fights.find((f) => time >= f.t && time <= f.end + tail);

  for (const e of replay.events) {
    if (e.t > t) break;
    if (e.type === 'camp_spawn') variant.set(e.camp, e.variant);

    if (e.type === 'kill') {
      const victimTeam = replay.champions[e.victim].team;
      const multi = multis.find((m) => m.t === e.t);
      const fight = fightOf(e.t);
      if (fight) {
        let block = blocks.get(fight);
        if (!block) {
          block = {
            kind: 'teamfight', t: fight.t, end: fight.t, title: `Combat ${placeName(fight)}`,
            score: [0, 0], lost: [[], []], multikills: [], objectives: [],
          };
          blocks.set(fight, block);
          out.push(block);
        }
        block.end = e.t;
        block.score[victimTeam === 0 ? 1 : 0]++;
        block.lost[victimTeam].push(e.victim);
        if (multi && e.killer !== null) {
          block.multikills = block.multikills.filter((m) => m.champion !== e.killer);
          block.multikills.push({ champion: e.killer, label: multi.label });
        }
        continue;
      }
      // Un multi-kill hors combat : la ligne du kill précédent s'allonge.
      const prev = out.find((o): o is Extract<FeedEntry, { kind: 'kill' }> => o.kind === 'kill' && o.killer === e.killer);
      if (multi && prev && e.killer !== null && e.t - prev.t <= MULTIKILL_WINDOW) {
        prev.t = e.t;
        prev.victims.push(e.victim);
        prev.multikill = multi.label;
        continue;
      }
      out.push({ kind: 'kill', t: e.t, team: victimTeam === 0 ? 1 : 0, killer: e.killer, victims: [e.victim], multikill: null });
    }

    if (e.type === 'structure') {
      const by = e.by ?? null;
      out.push({ kind: 'structure', t: e.t, team: e.team, by, text: `${tag(e.team)} détruit ${structureLabel(e.id)}` });
    }

    if (e.type === 'camp_killed' && (e.camp === 'dragon' || e.camp === 'baron')) {
      const v = variant.get(e.camp) ?? null;
      const camp: ObjectiveCamp = e.camp === 'dragon' ? 'dragon' : v === GRUBS ? 'grubs' : 'baron';
      const obj: FeedObjective = { t: e.t, team: e.team, by: e.by ?? null, camp, variant: v, name: objectiveName(camp, v) };
      // Un objectif pris pendant un combat (ou juste après) va dans l'encadré du combat.
      const fight = fightOf(e.t, 20);
      const block = fight && blocks.get(fight);
      if (block) { block.objectives.push(obj); continue; }
      const who = obj.by !== null ? player(obj.by) : tag(e.team);
      const what = camp === 'dragon' ? `le ${obj.name.toLowerCase()}` : camp === 'grubs' ? 'les larves du Néant' : 'le Nashor';
      out.push({ kind: 'objective', ...obj, text: `${who} prend ${what} pour ${tag(e.team)}` });
    }

    if (e.type === 'ward_placed' && e.by !== undefined) {
      // Seules les balises posées sur un grand objectif comptent : les autres noieraient le fil.
      const place = placeName(e);
      const camp = place === 'au dragon' ? 'dragon' : 'baron';
      // … et seulement quand l'objectif se joue dans les deux minutes qui suivent.
      const soon = replay.events.some((o) => o.type === 'camp_killed' && o.camp === camp && o.t >= e.t && o.t - e.t <= WARD_LEAD);
      if ((place === 'au dragon' || place === 'au Nashor') && soon) {
        out.push({ kind: 'ward', t: e.t, team: e.team, by: e.by, text: `${player(e.by)} pose une balise ${place}` });
      }
    }
  }
  return out.sort((a, b) => b.t - a.t);
}
