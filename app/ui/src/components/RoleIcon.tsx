// Icônes de poste, reprises des maquettes v2 (pleines, deux opacités).
import type { ReactNode } from 'react';

const SHAPES: Record<string, { faded?: ReactNode; solid: ReactNode }> = {
  Top: {
    faded: <path d="M22 6V22H6L10 18H18V10Z" />,
    solid: <><path d="M2 2H18L14 6H6V14L2 18Z" /><rect x="9.5" y="9.5" width="5" height="5" /></>,
  },
  Jungle: {
    solid: <><path d="M5 22C3.5 16 3 10 4 3C7 8 9 13 9.5 19Z" /><path d="M11.2 22C10.3 15 10.6 8 12 1.5C13.4 8 13.7 15 12.8 22Z" /><path d="M19 22C20.5 16 21 10 20 3C17 8 15 13 14.5 19Z" /></>,
  },
  Mid: {
    faded: <><path d="M2 2H13L2 13Z" /><path d="M22 22H11L22 11Z" /></>,
    solid: <path d="M17 2H22V7L7 22H2V17Z" />,
  },
  Bot: {
    faded: <path d="M2 18V2H18L14 6H6V14Z" />,
    solid: <><path d="M22 22H6L10 18H18V10L22 6Z" /><rect x="9.5" y="9.5" width="5" height="5" /></>,
  },
  Support: {
    solid: <><path d="M12 6.5L15.2 10.5L12 22L8.8 10.5Z" /><path d="M1.5 6H9L10.2 9L7.5 12.5L5 9.5Z" /><path d="M22.5 6H15L13.8 9L16.5 12.5L19 9.5Z" /><path d="M9.5 2.5H14.5L12 5.2Z" /></>,
  },
};

export const ROLE_LABEL: Record<string, string> = {
  Top: 'Top', Jungle: 'Jungle', Mid: 'Mid', Bot: 'ADC', Support: 'Support', Coach: 'Coach',
};

export function RoleIcon({ role, size = 20 }: { role: string; size?: number }) {
  const shape = SHAPES[role];
  if (!shape) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label={ROLE_LABEL[role]} className="role-icon">
      <g fill="currentColor" fillOpacity=".35">{shape.faded}</g>
      <g fill="currentColor">{shape.solid}</g>
    </svg>
  );
}
