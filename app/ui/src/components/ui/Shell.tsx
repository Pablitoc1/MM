// Cadre de l'application des maquettes v2 : barre du haut (club, classement,
// date, prochain match, budget, Continuer) et menu de gauche.
import type { ReactNode } from 'react';

export type NavKey =
  | 'accueil' | 'effectif' | 'entrainement' | 'tactique' | 'recrutement' | 'competitions' | 'finances' | 'direction';

const ICON_PROPS = {
  width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2,
  strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
} as const;

export const NAV: { key: NavKey; label: string; icon: ReactNode }[] = [
  { key: 'accueil', label: 'Accueil', icon: <><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></> },
  {
    key: 'effectif', label: 'Effectif',
    icon: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5" /><circle cx="17" cy="9" r="2.5" /><path d="M17 14.5c2.3.3 3.9 2 4.5 4.5" /></>,
  },
  { key: 'entrainement', label: 'Entraînement', icon: <path d="M6 7v10M3 9v6M18 7v10M21 9v6M6 12h12" /> },
  { key: 'tactique', label: 'Tactique', icon: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="1" /></> },
  { key: 'recrutement', label: 'Recrutement', icon: <><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.2-4.2" /></> },
  {
    key: 'competitions', label: 'Compétitions',
    icon: <><path d="M8 4h8v5a4 4 0 01-8 0z" /><path d="M8 6H5a3 3 0 003 4M16 6h3a3 3 0 01-3 4M12 13v4M8 20h8" /></>,
  },
  {
    key: 'finances', label: 'Finances',
    icon: <><ellipse cx="12" cy="7" rx="7" ry="3" /><path d="M5 7v5c0 1.7 3.1 3 7 3s7-1.3 7-3V7M5 12v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5" /></>,
  },
  { key: 'direction', label: 'Direction', icon: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5h6v2M3 13h18" /></> },
];

export interface ShellProps {
  club: { name: string; logo?: string };
  /** Ligue et classement, par exemple « LEC Versus · 1er (0 – 0) ». */
  standing: string;
  /** Date du jour en toutes lettres. */
  date: string;
  next?: { name: string; logo?: string; date: string };
  /** Budget déjà formaté (formatEuros). */
  budget: string;
  active?: NavKey;
  badges?: Partial<Record<NavKey, number>>;
  hrefs?: Partial<Record<NavKey, string>>;
  onContinue?: () => void;
  children: ReactNode;
}

export function Shell({ club, standing, date, next, budget, active, badges = {}, hrefs = {}, onContinue, children }: ShellProps) {
  return (
    <div className="m-screen">
      <header className="m-top">
        <div className="m-top__club">
          {club.logo && <img src={club.logo} alt={`Logo ${club.name}`} width={34} height={34} />}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="m-top__name">{club.name}</span>
            <span className="m-muted" style={{ fontSize: 12 }}>{standing}</span>
          </div>
        </div>
        <div className="m-top__info">
          <span>{date}</span>
          {next && (
            <span className="m-top__item">
              Prochain match : {next.logo && <img src={next.logo} alt="" width={22} height={22} />}{' '}
              <strong>{next.name}</strong> · {next.date}
            </span>
          )}
          <span className="m-top__item" style={{ gap: 6 }}>
            <svg {...ICON_PROPS} width={16} height={16}>{NAV[6].icon}</svg> {budget}
          </span>
        </div>
        <button type="button" className="m-cta" onClick={onContinue}>Continuer</button>
      </header>
      <div className="m-body">
        <nav aria-label="Menu principal" className="m-nav">
          {NAV.map((item) => (
            <a
              key={item.key}
              href={hrefs[item.key] ?? '#'}
              className={`m-nav__item${item.key === active ? ' m-nav__item--on' : ''}`}
              aria-current={item.key === active ? 'page' : undefined}
            >
              <svg {...ICON_PROPS}>{item.icon}</svg>
              <span>{item.label}</span>
              {badges[item.key] ? <span className="m-nav__badge">{badges[item.key]}</span> : null}
            </a>
          ))}
        </nav>
        {children}
      </div>
    </div>
  );
}
