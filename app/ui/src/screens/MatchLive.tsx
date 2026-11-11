// Écran « Match en direct » (maquette v2), en plein écran : barre du match en haut,
// tableau de score, cartes des 10 joueurs, carte 2D, courbe d'écart d'or et fil du match.
// Tout est lu depuis le flux du match ; aujourd'hui le faux match de démonstration, en M6 le moteur.
import { useEffect, useMemo, useRef, useState } from 'react';
import { assetUrl, getRoster, listTeams } from '../api';
import { Icon } from '../components/Icon';
import { GoldDiffChart, GoldLegend, formatEcart, summarizeGold, type GoldEvent } from '../components/ui';
import { buildDemoReplay } from '../match/demoReplay';
import { buildFeed } from '../match/feed';
import { championIcon, dragonIcon } from '../match/icons';
import { Feed, ScoreBoard, TeamColumn, type TeamLook } from '../match/LivePanels';
import { MatchMap } from '../match/MatchMap';
import type { MatchReplay, TeamIndex } from '../match/replay';
import { GRUBS, analyzeEffects, formatClock, goldDiffByMinute, stateAt, type Effect } from '../match/state';

/** Vitesses de la maquette. */
export const SPEEDS = [1, 4, 16] as const;
/** « Temps forts » : vitesse hors action, et vitesse autour d'une action. */
const HIGHLIGHT_FAST = 16;
const HIGHLIGHT_SLOW = 2;
/** Fenêtre ralentie autour d'une action, en secondes : avant, après. */
const HIGHLIGHT_WINDOW = [8, 4] as const;

const NO_LOOK: TeamLook = { photos: {} };
const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const DAYS = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];

/** « 2026-01-17 » → « Sam. 17 janvier 2026 ». */
export function formatMatchDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const day = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${DAYS[day]} ${d} ${MONTHS[m - 1]} ${y}`;
}

/** Logos et photos des deux clubs, depuis la base de départ (M1). */
function useTeamLooks(replay: MatchReplay): [TeamLook, TeamLook] {
  const [looks, setLooks] = useState<[TeamLook, TeamLook]>([NO_LOOK, NO_LOOK]);
  useEffect(() => {
    let live = true;
    (async () => {
      const teams = await listTeams('LEC');
      const out = await Promise.all(replay.teams.map(async (info): Promise<TeamLook> => {
        const team = teams.find((t) => t.id === info.name);
        if (!team) return NO_LOOK;
        const roster = await getRoster(team.id);
        const photos: TeamLook['photos'] = {};
        for (const m of roster) if (m.photoFile) photos[m.handle] = assetUrl(m.photoFile);
        return { logo: team.logoFile ? assetUrl(team.logoFile) : undefined, photos };
      }));
      if (live) setLooks([out[0], out[1]]);
    })().catch((e) => console.error('logos et photos', e));
    return () => { live = false; };
  }, [replay]);
  return looks;
}

/** Repères de la courbe d'or (maquette) : tueurs, combats, dragons, larves, Nashor, tours extérieures. */
export function goldEvents(replay: MatchReplay, t: number, effects: Effect[]): GoldEvent[] {
  const out: GoldEvent[] = [];
  const side = (team: TeamIndex): GoldEvent['side'] => (team === 0 ? 'us' : 'them');
  const minute = (s: number) => Math.round((s / 60) * 10) / 10;
  const champ = (i: number) => replay.champions[i];
  const fights = effects.filter((e): e is Extract<Effect, { kind: 'teamfight' }> => e.kind === 'teamfight' && e.t <= t);
  const multis = effects.filter((e): e is Extract<Effect, { kind: 'multikill' }> => e.kind === 'multikill' && e.t <= t);
  const variant = new Map<string, string | undefined>();
  const seenFights = new Set<Effect>();
  for (const e of replay.events) {
    if (e.t > t) break;
    if (e.type === 'camp_spawn') variant.set(e.camp, e.variant);
    if (e.type === 'kill' && e.killer !== null) {
      const fight = fights.find((f) => e.t >= f.t && e.t <= f.end);
      if (fight) {
        if (seenFights.has(fight)) continue;
        seenFights.add(fight);
        // Seulement les kills déjà joués : le combat peut être en cours.
        const kills = replay.events.filter((k): k is Extract<typeof k, { type: 'kill' }> => k.type === 'kill' && k.t >= fight.t && k.t <= Math.min(fight.end, t));
        const score: [number, number] = [0, 0];
        for (const k of kills) score[champ(k.victim).team === 0 ? 1 : 0]++;
        const winner: TeamIndex = score[0] >= score[1] ? 0 : 1;
        const killers = [...new Set(kills.filter((k) => k.killer !== null && champ(k.killer).team === winner).map((k) => k.killer!))];
        out.push({
          minute: minute(fight.t), side: side(winner), kind: 'kill', highlight: true,
          icons: killers.slice(0, 3).map((i) => championIcon(champ(i).champion)),
          badge: `×${score[winner]}–${score[winner === 0 ? 1 : 0]}`,
          label: `Combat gagné ${score[0]}–${score[1]} par ${replay.teams[winner].tag}`,
        });
        continue;
      }
      const multi = multis.find((m) => m.t === e.t);
      const prev = out[out.length - 1];
      if (multi && prev?.kind === 'kill' && prev.champion?.name === champ(e.killer).champion) {
        prev.badge = `×${multi.count}`;
        prev.label = `${multi.label} de ${champ(e.killer).player}`;
        continue;
      }
      const c = champ(e.killer);
      out.push({
        minute: minute(e.t), side: side(c.team), kind: 'kill',
        champion: { name: c.champion, icon: championIcon(c.champion) },
        label: `${c.player} élimine ${champ(e.victim).player}`,
      });
    }
    if (e.type === 'structure' && e.id.endsWith('_outer')) {
      out.push({ minute: minute(e.t), side: side(e.team), kind: 'tour', label: `Tour pour ${replay.teams[e.team].tag}` });
    }
    if (e.type === 'camp_killed' && (e.camp === 'dragon' || e.camp === 'baron')) {
      const v = variant.get(e.camp);
      const tag = replay.teams[e.team].tag;
      if (e.camp === 'dragon') out.push({ minute: minute(e.t), side: side(e.team), kind: 'dragon', icon: dragonIcon(v ?? 'Infernal'), label: `Drake ${(v ?? '').toLowerCase()} pour ${tag}` });
      else if (v === GRUBS) out.push({ minute: minute(e.t), side: side(e.team), kind: 'larves', label: `Larves pour ${tag}` });
      else out.push({ minute: minute(e.t), side: side(e.team), kind: 'nashor', highlight: true, label: `Nashor pour ${tag}` });
    }
  }
  return out;
}

/** Vrai si une action (kill, bâtiment, objectif) a lieu près de `t` : « Temps forts » ralentit. */
function nearAction(replay: MatchReplay, t: number): boolean {
  const [before, after] = HIGHLIGHT_WINDOW;
  return replay.events.some((e) => (e.type === 'kill' || e.type === 'structure' || e.type === 'camp_killed' && (e.camp === 'dragon' || e.camp === 'baron'))
    && t >= e.t - before && t <= e.t + after);
}

export function MatchLive({ onExit }: { onExit?: () => void }) {
  const replay = useMemo(() => buildDemoReplay(), []);
  const effects = useMemo(() => analyzeEffects(replay), [replay]);
  const looks = useTeamLooks(replay);
  const timeRef = useRef(0);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState<number>(4);
  const [highlights, setHighlights] = useState(false);

  // Horloge de lecture : avance le temps de jeu ; l'affichage React suit 10 fois par seconde.
  useEffect(() => {
    let last = performance.now();
    let shown = 0;
    let raf = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const rate = highlights ? (nearAction(replay, timeRef.current) ? HIGHLIGHT_SLOW : HIGHLIGHT_FAST) : speed;
      if (playing) timeRef.current = Math.min(replay.duration, timeRef.current + dt * rate);
      if (now - shown > 100) { shown = now; setTime(timeRef.current); }
      if (timeRef.current >= replay.duration) setPlaying(false);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed, highlights, replay]);

  const state = stateAt(replay, time, effects);
  // La courbe et le fil ne changent qu'à la seconde : inutile de les recalculer 10 fois par seconde.
  const second = Math.floor(time);
  const gold = useMemo(() => goldDiffByMinute(replay, second), [replay, second]);
  const markers = useMemo(() => goldEvents(replay, second, effects), [replay, second, effects]);
  const feed = useMemo(() => buildFeed(replay, second, effects), [replay, second, effects]);
  const seek = (t: number) => { timeRef.current = t; setTime(t); };
  const [blue, red] = replay.teams;
  const ctx = replay.context;
  const firstKiller = markers.find((m) => m.champion)?.champion?.icon;

  return (
    <div className="live">
      <header className="live-top">
        <div className="live-top__info muted">
          {onExit && (
            <button type="button" className="btn live-top__back" onClick={onExit} aria-label="Quitter le match"><Icon name="back" size={16} /></button>
          )}
          <Icon name="trophy" size={16} />
          <span>
            {ctx ? `${ctx.competition} · ${ctx.stage} · ${ctx.format} · ${formatMatchDate(ctx.date)} · ` : ''}Patch {replay.patch}
          </span>
        </div>
        <div className="live-top__controls">
          <button type="button" className="btn btn--icon" aria-label={playing ? 'Pause' : 'Lecture'} onClick={() => {
            if (timeRef.current >= replay.duration) seek(0);
            setPlaying(!playing);
          }}>
            <Icon name={playing ? 'pause' : 'resume'} size={16} />
          </button>
          <div role="group" aria-label="Vitesse" className="live-top__speeds">
            {SPEEDS.map((s) => (
              <button key={s} type="button" className={`btn${!highlights && s === speed ? ' btn--on' : ''}`}
                aria-pressed={!highlights && s === speed} onClick={() => { setSpeed(s); setHighlights(false); }}>
                x{s}
              </button>
            ))}
          </div>
          <button type="button" className={`btn live-top__wide${highlights ? ' btn--on' : ''}`} aria-pressed={highlights}
            onClick={() => setHighlights(!highlights)}>
            <Icon name="star" size={16} /> Temps forts
          </button>
          <button type="button" className="btn live-top__wide" onClick={() => { seek(replay.duration); setPlaying(false); }}>
            <Icon name="skip" size={16} /> Aller au résultat
          </button>
        </div>
        <label className="live-top__seek">
          <span className="sr-only">Temps de jeu</span>
          <input type="range" min={0} max={replay.duration} step={1} value={second}
            aria-label="Temps de jeu" aria-valuetext={`${formatClock(time)} sur ${formatClock(replay.duration)}`}
            style={{ '--progress': `${(time / replay.duration) * 100}%` } as React.CSSProperties}
            onChange={(e) => seek(Number(e.target.value))} />
        </label>
      </header>

      <main className="live-main">
        <ScoreBoard replay={replay} state={state} looks={looks} />

        <div className="live-grid">
          <TeamColumn state={state} team={0} look={looks[0]} />
          <section className="card live-center">
            <MatchMap replay={replay} effects={effects} timeRef={timeRef} />
            <Legend us={blue.tag} them={red.tag} />
          </section>
          <TeamColumn state={state} team={1} look={looks[1]} />
        </div>

        <div className="live-bottom">
          <section className="card live-gold">
            <div className="live-gold__head">
              <h2 className="card__title">Écart d'or minute par minute</h2>
              {gold.length > 1 && <GoldSummary values={gold} us={blue.tag} them={red.tag} />}
            </div>
            {gold.length > 1 && (
              <GoldLegend us={blue.tag} them={red.tag} killIcon={firstKiller}
                kinds={(['kill', 'dragon', 'tour', 'larves', 'nashor'] as const).filter((k) => markers.some((m) => m.kind === k))} />
            )}
            {gold.length > 1
              ? <GoldDiffChart values={gold} us={blue.tag} them={red.tag} events={markers} legend={false} summary={false} />
              : <p className="muted">La courbe démarre à la première minute.</p>}
          </section>
          <Feed entries={feed} replay={replay} />
        </div>
        <p className="muted match-note">
          Match de démonstration scripté (KC contre G2), au format que le moteur produira en M6.
        </p>
      </main>
    </div>
  );
}

/** « KC +2 400 · max G2 −420 (8 min) · bascule à 10 min », à droite du titre (maquette). */
function GoldSummary({ values, us, them }: { values: number[]; us: string; them: string }) {
  const s = summarizeGold(values);
  return (
    <span className="live-gold__summary">
      {s.final >= 0 ? us : them} <strong style={{ color: s.final >= 0 ? 'var(--team-us)' : 'var(--team-them)' }}>{formatEcart(Math.abs(s.final))}</strong>
      {s.worst.value < 0 && <> · max {them} <strong style={{ color: 'var(--team-them)' }}>{formatEcart(s.worst.value)}</strong> ({s.worst.minute} min)</>}
      {s.swingMinute !== undefined && <> · bascule à {s.swingMinute} min</>}
    </span>
  );
}

function Legend({ us, them }: { us: string; them: string }) {
  return (
    <div className="match-legend">
      <span><i className="lg lg--tower" />Tour {us}</span>
      <span><i className="lg lg--tower lg--them" />Tour {them}</span>
      <span><i className="lg lg--rubble" />Tour détruite</span>
      <span><i className="lg lg--inhib" />Inhibiteur</span>
      <span><i className="lg lg--camp" />Camp</span>
      <span><i className="lg lg--camp-taken" />Camp pris</span>
      <span><i className="lg lg--wave" />Vague de sbires</span>
      <span><i className="lg lg--ward" />Balise</span>
      <span><i className="lg lg--alcove" />Alcôve (coin top / bot)</span>
    </div>
  );
}
