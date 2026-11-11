import { ROLE_LABEL, type Role } from './types';

// Icônes de rôle des maquettes v2 : une partie pleine, une partie à 35 %.
const SHAPES: Record<Role, { faint: string[]; full: string[]; square?: boolean }> = {
  top: {
    faint: ['M22 6V22H6L10 18H18V10Z'],
    full: ['M2 2H18L14 6H6V14L2 18Z'],
    square: true,
  },
  jungle: {
    faint: [],
    full: [
      'M5 22C3.5 16 3 10 4 3C7 8 9 13 9.5 19Z',
      'M11.2 22C10.3 15 10.6 8 12 1.5C13.4 8 13.7 15 12.8 22Z',
      'M19 22C20.5 16 21 10 20 3C17 8 15 13 14.5 19Z',
    ],
  },
  mid: {
    faint: ['M2 2H13L2 13Z', 'M22 22H11L22 11Z'],
    full: ['M17 2H22V7L7 22H2V17Z'],
  },
  adc: {
    faint: ['M2 18V2H18L14 6H6V14Z'],
    full: ['M22 22H6L10 18H18V10L22 6Z'],
    square: true,
  },
  support: {
    faint: [],
    full: [
      'M12 6.5L15.2 10.5L12 22L8.8 10.5Z',
      'M1.5 6H9L10.2 9L7.5 12.5L5 9.5Z',
      'M22.5 6H15L13.8 9L16.5 12.5L19 9.5Z',
      'M9.5 2.5H14.5L12 5.2Z',
    ],
  },
};

export interface RoleIconProps {
  role: Role;
  size?: number;
  /** Couleur : or par défaut, comme dans les tableaux des maquettes. */
  color?: string;
}

export function RoleIcon({ role, size = 16, color = 'var(--accent-gold)' }: RoleIconProps) {
  const shape = SHAPES[role];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label={ROLE_LABEL[role]}
      style={{ flex: 'none', color }}>
      <g fill="currentColor" fillOpacity={0.35}>
        {shape.faint.map((d) => <path key={d} d={d} />)}
      </g>
      <g fill="currentColor">
        {shape.full.map((d) => <path key={d} d={d} />)}
        {shape.square && <rect x="9.5" y="9.5" width="5" height="5" />}
      </g>
    </svg>
  );
}

/** Rôle en badge : icône + nom, comme dans l'en-tête de la fiche joueur. */
export function RoleBadge({ role }: { role: Role }) {
  return (
    <span className="ui-role-badge">
      <RoleIcon role={role} size={15} color="currentColor" />
      {ROLE_LABEL[role]}
    </span>
  );
}
