import { useEffect, useState } from 'react';
import { findUpdate, type AvailableUpdate } from './updates';

type State =
  | { step: 'idle' }
  | { step: 'available'; update: AvailableUpdate }
  | { step: 'installing'; update: AvailableUpdate; percent: number | null }
  | { step: 'failed'; update: AvailableUpdate; message: string };

/** Bandeau en haut du jeu quand une nouvelle version existe. Rien ne s'installe sans un clic. */
export function UpdateBanner({ find = findUpdate }: { find?: () => Promise<AvailableUpdate | null> }) {
  const [state, setState] = useState<State>({ step: 'idle' });
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let alive = true;
    find().then((update) => {
      if (alive && update) setState({ step: 'available', update });
    });
    return () => {
      alive = false;
    };
  }, [find]);

  if (state.step === 'idle' || hidden) return null;
  const { update } = state;

  const install = () => {
    setState({ step: 'installing', update, percent: null });
    update
      .install((percent) => setState({ step: 'installing', update, percent }))
      .catch((e: unknown) => setState({ step: 'failed', update, message: String(e) }));
  };

  return (
    <div className="update-banner" role="status">
      {state.step === 'available' && (
        <>
          <span>
            Nouvelle version <strong>{update.version}</strong> disponible.
          </span>
          <button type="button" className="btn-cta" onClick={install}>
            Mettre à jour
          </button>
          <button type="button" className="btn" onClick={() => setHidden(true)}>
            Plus tard
          </button>
        </>
      )}
      {state.step === 'installing' && (
        <span>
          Mise à jour vers la version {update.version}
          {state.percent === null ? '…' : ` : ${state.percent} %`} Le jeu va redémarrer.
        </span>
      )}
      {state.step === 'failed' && (
        <>
          <span>La mise à jour a échoué ({state.message}).</span>
          <button type="button" className="btn" onClick={install}>
            Réessayer
          </button>
          <button type="button" className="btn" onClick={() => setHidden(true)}>
            Fermer
          </button>
        </>
      )}
    </div>
  );
}
