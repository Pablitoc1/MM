// Fil du match : les événements du flux mis en phrases, les plus récents d'abord.
// Les kills d'un même teamfight sont regroupés dans un seul bloc, comme sur la maquette.
import { STRUCTURES } from './map';
import type { MatchReplay, TeamIndex } from './replay';
import { GRUBS, type Effect } from './state';

export type FeedEntry =
  | { kind: 'kill'; t: number; team: TeamIndex; killer: number | null; victim: number; multikill: string | null }
  | { kind: 'structure'; t: number; team: TeamIndex; text: string }
  | { kind: 'objective'; t: number; team: TeamIndex; by: number | null; camp: 'dragon' | 'baron' | 'grubs'; variant: string | null; text: string }
  | {
    kind: 'teamfight'; t: number; end: number; score: [number, number];
    /** Champions tombés, par équipe (indices du flux). */
    lost: [number[], number[]];
    multikills: { champion: number; label: string }[];
  };

const TIER: Record<string, string> = { outer: 'extérieure', inner: 'intérieure', inhib: "d'inhibiteur" };
const LANE: Record<string, string> = { top: 'top', mid: 'mid', bot: 'bot' };

/** « la tour bot extérieure », « l'inhibiteur mid », « le nexus ». */
export function structureLabel(id: string): string {
  const st = STRUCTURES.find((s) => s.id === id);
  if (!st) return id;
  if (st.kind === 'nexus') return 'le nexus';
  if (st.kind === 'inhibitor') return `l'inhibiteur ${LANE[st.lane ?? 'mid']}`;
  if (st.lane === null) return 'une tour du nexus';
  const tier = id.split('_').pop() ?? '';
  return `la tour ${LANE[st.lane]} ${TIER[tier] ?? ''}`.trim();
}

/** Les entrées du fil jusqu'à l'instant `t`, la plus récente en premier. */
export function buildFeed(replay: MatchReplay, t: number, effects: Effect[]): FeedEntry[] {
  const out: FeedEntry[] = [];
  const fights = effects.filter((e): e is Extract<Effect, { kind: 'teamfight' }> => e.kind === 'teamfight' && e.t <= t);
  const multis = effects.filter((e): e is Extract<Effect, { kind: 'multikill' }> => e.kind === 'multikill' && e.t <= t);
  const variant = new Map<string, string | undefined>();
  const tag = (team: TeamIndex) => replay.teams[team].tag;

  for (const e of replay.events) {
    if (e.t > t) break;
    if (e.type === 'camp_spawn') variant.set(e.camp, e.variant);
    if (e.type === 'kill') {
      const fight = fights.find((f) => e.t >= f.t && e.t <= f.end);
      const multi = multis.find((m) => m.t === e.t);
      const killerChamp = e.killer;
      if (fight) {
        let block = out.find((o): o is Extract<FeedEntry, { kind: 'teamfight' }> => o.kind === 'teamfight' && o.t === fight.t);
        if (!block) {
          block = { kind: 'teamfight', t: fight.t, end: fight.t, score: [0, 0], lost: [[], []], multikills: [] };
          out.push(block);
        }
        const victimTeam = replay.champions[e.victim].team;
        block.end = e.t;
        block.score[victimTeam === 0 ? 1 : 0]++;
        block.lost[victimTeam].push(e.victim);
        if (multi && killerChamp !== null) {
          block.multikills = block.multikills.filter((m) => m.champion !== killerChamp);
          block.multikills.push({ champion: killerChamp, label: multi.label });
        }
      } else {
        out.push({
          kind: 'kill', t: e.t, team: replay.champions[e.victim].team === 0 ? 1 : 0,
          killer: killerChamp, victim: e.victim, multikill: multi?.label ?? null,
        });
      }
    }
    if (e.type === 'structure') {
      out.push({ kind: 'structure', t: e.t, team: e.team, text: `${tag(e.team)} détruit ${structureLabel(e.id)}` });
    }
    if (e.type === 'camp_killed' && (e.camp === 'dragon' || e.camp === 'baron')) {
      const v = variant.get(e.camp);
      const camp = e.camp === 'dragon' ? 'dragon' : v === GRUBS ? 'grubs' : 'baron';
      const what = camp === 'dragon' ? `le drake ${(v ?? '').toLowerCase()}`.trim() : camp === 'grubs' ? 'les larves du Néant' : 'le Nashor';
      const who = e.by !== undefined ? replay.champions[e.by].player : tag(e.team);
      out.push({ kind: 'objective', t: e.t, team: e.team, by: e.by ?? null, camp, variant: v ?? null, text: `${who} prend ${what} pour ${tag(e.team)}` });
    }
  }
  return out.sort((a, b) => b.t - a.t);
}
