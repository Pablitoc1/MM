import type { WorldInfo } from '../api';

const COLORS: [string, string][] = [
  ['Fond', 'var(--bg-page)'],
  ['Carte', 'var(--bg-card)'],
  ['Nous', 'var(--team-us)'],
  ['Adversaire', 'var(--team-them)'],
  ['Bleu', 'var(--accent-blue)'],
  ['Or', 'var(--accent-gold)'],
];

const NEXT: [string, string][] = [
  ['M1', 'Base de données et import réel'],
  ['M2', 'Notes des joueurs'],
  ['M3', 'Carte et déplacements'],
];

export function Home({ world }: { world: WorldInfo }) {
  return (
    <>
      <h1 className="h1">Accueil</h1>
      <p className="muted" style={{ margin: 0 }}>
        La base de données réelle est en place : l'écran Effectif montre les vrais clubs de la LEC. Les autres écrans arrivent jalon par jalon.
      </p>
      <div className="grid">
        <section className="card">
          <h2 className="card__title">Prochains jalons</h2>
          <ul className="milestones">
            {NEXT.map(([id, label], i) => (
              <li key={id}>
                <span className="pill" style={{ color: i === 0 ? 'var(--team-us)' : 'var(--text-muted)' }}>{id}</span>
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="card">
          <h2 className="card__title">Style des maquettes</h2>
          <div className="swatches">
            {COLORS.map(([name, value]) => (
              <div key={name} className="swatch">
                <span style={{ background: value }} />
                <span>{name}</span>
              </div>
            ))}
          </div>
          <p style={{ margin: '12px 0 0', fontFamily: 'var(--font-title)', fontSize: 20, fontWeight: 700 }}>
            Space Grotesk pour les titres
          </p>
          <p style={{ margin: '4px 0 0' }}>Inter pour le texte courant.</p>
        </section>
        <section className="card">
          <h2 className="card__title">Moteur</h2>
          <p style={{ margin: 0 }} data-testid="engine-info">
            Base v{world.schemaVersion} · moteur {world.engineVersion}
          </p>
          <p className="muted" style={{ margin: '6px 0 0' }}>
            Le Rust répond à l'interface : la date en haut vient du moteur.
          </p>
        </section>
      </div>
    </>
  );
}
