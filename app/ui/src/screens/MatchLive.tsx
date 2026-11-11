// Écran « Match en direct » : pour l'instant la carte 2D seule, lue depuis le faux
// match de démonstration. Le reste de la maquette (cartes joueurs, courbe d'or,
// fil du match) viendra avec les composants d'interface.
import { useEffect, useMemo, useRef, useState } from 'react';
import { buildDemoReplay } from '../match/demoReplay';
import { MatchMap } from '../match/MatchMap';
import { analyzeEffects, formatClock, stateAt } from '../match/state';

export const SPEEDS = [1, 2, 4, 8, 16] as const;

export function MatchLive() {
  const replay = useMemo(() => buildDemoReplay(), []);
  const effects = useMemo(() => analyzeEffects(replay), [replay]);
  const timeRef = useRef(0);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState<number>(4);

  // Horloge de lecture : avance le temps de jeu, l'affichage React suit 10 fois par seconde.
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

  const state = stateAt(replay, time);
  const [blue, red] = replay.teams;

  const seek = (t: number) => { timeRef.current = t; setTime(t); };

  return (
    <>
      <h1 className="h1">Match en direct</h1>
      <section className="card match-score" aria-label="Score">
        <div className="match-team">
          <span className="match-team__tag" style={{ color: 'var(--team-us)' }}>{blue.tag}</span>
          <span><strong>{blue.name}</strong><br /><span className="muted">Côté bleu · {state.towers[0]} tours</span></span>
        </div>
        <div className="match-clock">
          <div className="match-kills" data-testid="match-kills">{state.kills[0]} – {state.kills[1]}</div>
          <div className="muted" data-testid="match-clock">{formatClock(time)}</div>
          {state.winner !== null && <div className="match-winner">Victoire {replay.teams[state.winner].tag}</div>}
        </div>
        <div className="match-team match-team--right">
          <span className="match-team__tag" style={{ color: 'var(--team-them)' }}>{red.tag}</span>
          <span><strong>{red.name}</strong><br /><span className="muted">Côté rouge · {state.towers[1]} tours</span></span>
        </div>
      </section>

      <div className="match-layout">
      <section className="card match-board">
        <MatchMap replay={replay} effects={effects} timeRef={timeRef} />
      </section>
      <section className="card match-side">
        <h2 className="card__title">Lecture</h2>
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
            <input type="range" min={0} max={replay.duration} step={1} value={Math.floor(time)}
              aria-label="Temps de jeu" aria-valuetext={formatClock(time)}
              onChange={(e) => seek(Number(e.target.value))} />
          </label>
          <span className="muted match-duration">{formatClock(time)} / {formatClock(replay.duration)}</span>
        </div>
        <h2 className="card__title">Légende</h2>
        <Legend />
        <p className="muted match-note">
          Match de démonstration scripté (KC contre G2), au format que le moteur produira.
        </p>
      </section>
      </div>
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
