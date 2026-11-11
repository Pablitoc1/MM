import { useEffect, useRef } from 'react';
import type { MatchReplay } from './replay';
import { stateAt, type Effect } from './state';

interface Props {
  replay: MatchReplay;
  effects: Effect[];
  /** Lu à chaque image : l'heure de jeu à afficher. */
  timeRef: React.RefObject<number>;
}

/** Taille logique de la carte ; le canevas s'adapte ensuite à sa colonne. */
const MAP_SIZE = 640;

/** La carte PixiJS. Chargée à part : Pixi n'est importé que sur cet écran. */
export function MatchMap({ replay, effects, timeRef }: Props) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    (async () => {
      const { MatchRenderer } = await import('./renderer');
      if (disposed || !host.current) return;
      const r = new MatchRenderer(replay);
      await r.init(host.current, MAP_SIZE);
      if (disposed) { r.destroy(); return; }
      host.current.dataset.ready = 'true';
      const tick = () => r.render(stateAt(replay, timeRef.current ?? 0, effects));
      r.app.ticker.add(tick);
      cleanup = () => { r.app.ticker.remove(tick); r.destroy(); };
    })().catch((e) => console.error('carte du match', e));
    return () => { disposed = true; cleanup(); };
  }, [replay, effects, timeRef]);

  return <div ref={host} className="match-map" data-testid="match-map" />;
}
