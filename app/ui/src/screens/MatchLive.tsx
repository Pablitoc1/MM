// Écran « Match en direct » (maquette v2) : tableau de score, cartes des 10 joueurs,
// carte 2D, courbe d'écart d'or et fil du match. Tout est lu depuis le flux du match ;
// aujourd'hui le faux match de démonstration, en M6 le moteur.
import { useEffect, useMemo, useRef, useState } from 'react';
import { assetUrl, getRoster, listTeams } from '../api';
import { GoldDiffChart, type GoldEvent } from '../components/ui';
import { buildDemoReplay } from '../match/demoReplay';
import { buildFeed } from '../match/feed';
import { Feed, ScoreBoard, TeamColumn, type TeamLook } from '../match/LivePanels';
import { MatchMap } from '../match/MatchMap';
import type { MatchReplay } from '../match/replay';
import { GRUBS, analyzeEffects, formatClock, goldDiffByMinute, stateAt } from '../match/state';

export const SPEEDS = [1, 2, 4, 8, 16] as const;

const NO_LOOK: TeamLook = { photos: {} };

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

/** Repères de la courbe d'or : premier sang, tours, dragons, larves, Nashor. */
function goldEvents(replay: MatchReplay, t: number): GoldEvent[] {
  const out: GoldEvent[] = [];
  const side = (team: number) => (team === 0 ? 'us' : 'them') as GoldEvent['side'];
  const first = replay.events.find((e) => e.type === 'kill');
  const variant = new Map<string, string | undefined>();
  for (const e of replay.events) {
    if (e.t > t) break;
    if (e.type === 'camp_spawn') variant.set(e.camp, e.variant);
    const minute = Math.round((e.t / 60) * 10) / 10;
    if (e === first && e.type === 'kill') {
      out.push({ minute, side: side(replay.champions[e.victim].team === 0 ? 1 : 0), label: `Premier sang de ${replay.champions[e.killer ?? e.victim].player}` });
    }
    if (e.type === 'structure' && e.id.includes('outer')) out.push({ minute, side: side(e.team), label: 'Tour' });
    if (e.type === 'camp_killed' && (e.camp === 'dragon' || e.camp === 'baron')) {
      out.push({ minute, side: side(e.team), label: e.camp === 'dragon' ? 'Dragon' : variant.get(e.camp) === GRUBS ? 'Larves' : 'Nashor' });
    }
  }
  return out;
}

export function MatchLive() {
  const replay = useMemo(() => buildDemoReplay(), []);
  const effects = useMemo(() => analyzeEffects(replay), [replay]);
  const looks = useTeamLooks(replay);
  const timeRef = useRef(0);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState<number>(4);

  // Horloge de lecture : avance le temps de jeu ; l'affichage React suit 10 fois par seconde.
  useEffect(() => {
    let last = performance.now();
    let shown = 0;
    let raf = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (playing) timeRef.current = Math.min(replay.duration, timeRef.current + dt * speed);
      if (now - shown > 100) { shown = now; setTime(timeRef.current); }
      if (timeRef.current >= replay.duration) setPlaying(false);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed, replay.duration]);

  const state = stateAt(replay, time, effects);
  // La courbe et le fil ne changent qu'à la seconde : inutile de les recalculer 10 fois par seconde.
  const second = Math.floor(time);
  const gold = useMemo(() => goldDiffByMinute(replay, second), [replay, second]);
  const markers = useMemo(() => goldEvents(replay, second), [replay, second]);
  const feed = useMemo(() => buildFeed(replay, second, effects), [replay, second, effects]);
  const seek = (t: number) => { timeRef.current = t; setTime(t); };
  const [blue, red] = replay.teams;

  return (
    <>
      <ScoreBoard replay={replay} state={state} looks={looks} />

      <div className="live-grid">
        <TeamColumn state={state} team={0} look={looks[0]} />
        <section className="card live-center">
          <MatchMap replay={replay} effects={effects} timeRef={timeRef} />
          <Legend />
          <div className="match-controls">
            <button type="button" className="btn" onClick={() => {
              if (timeRef.current >= replay.duration) seek(0);
              setPlaying(!playing);
            }} aria-pressed={playing}>
              {playing ? 'Pause' : 'Lecture'}
            </button>
            <div role="group" aria-label="Vitesse" className="match-speeds">
              {SPEEDS.map((s) => (
                <button key={s} type="button" className={`btn${s === speed ? ' btn--on' : ''}`} aria-pressed={s === speed} onClick={() => setSpeed(s)}>
                  x{s}
                </button>
              ))}
            </div>
            <label className="match-seek">
              <span className="sr-only">Temps de jeu</span>
              <input type="range" min={0} max={replay.duration} step={1} value={second}
                aria-label="Temps de jeu" aria-valuetext={formatClock(time)}
                onChange={(e) => seek(Number(e.target.value))} />
            </label>
            <span className="muted match-duration">{formatClock(time)} / {formatClock(replay.duration)}</span>
          </div>
        </section>
        <TeamColumn state={state} team={1} look={looks[1]} />
      </div>

      <div className="live-bottom">
        <section className="card live-gold">
          <h2 className="card__title">Écart d'or minute par minute</h2>
          {gold.length > 1
            ? <GoldDiffChart values={gold} us={blue.tag} them={red.tag} events={markers} />
            : <p className="muted">La courbe démarre à la première minute.</p>}
        </section>
        <Feed entries={feed} replay={replay} />
      </div>
      <p className="muted match-note">
        Match de démonstration scripté (KC contre G2, patch 26.1), au format que le moteur produira en M6.
      </p>
    </>
  );
}

function Legend() {
  return (
    <div className="match-legend">
      <span><i className="lg lg--tower" />Tour</span>
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
