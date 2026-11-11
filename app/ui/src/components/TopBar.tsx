import type { WorldInfo } from '../api';

export function TopBar({ world }: { world: WorldInfo }) {
  return (
    <header className="topbar">
      <div className="topbar__club">
        <span className="topbar__badge" aria-hidden="true">EM</span>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="topbar__name">Esport Manager</span>
          <span className="topbar__sub">Aucun club choisi · LEC 2026</span>
        </div>
      </div>
      <div className="topbar__info">
        <span data-testid="game-date">{world.date}</span>
        <span>Prochain match : —</span>
      </div>
      <button type="button" className="btn-cta" disabled title="Disponible en M9 (calendrier)">
        Continuer
      </button>
    </header>
  );
}
