// Drapeaux simplifiés (code pays ISO à 2 lettres). Les couleurs sont celles
// des drapeaux officiels : ce sont des données, pas des couleurs du thème.
// Un pays absent de la liste s'affiche avec son code en texte.
import type { ReactNode } from 'react';

interface FlagDef {
  name: string;
  viewBox: string;
  body: ReactNode;
}

const tricoloreV = (a: string, b: string, c: string) => (
  <><rect width="1" height="2" fill={a} /><rect x="1" width="1" height="2" fill={b} /><rect x="2" width="1" height="2" fill={c} /></>
);
const tricoloreH = (a: string, b: string, c: string) => (
  <><rect width="3" height="0.67" fill={a} /><rect y="0.66" width="3" height="0.68" fill={b} /><rect y="1.33" width="3" height="0.67" fill={c} /></>
);
const croixNordique = (fond: string, croix: string) => (
  <><rect width="16" height="10" fill={fond} /><rect x="5" width="2" height="10" fill={croix} /><rect y="4" width="16" height="2" fill={croix} /></>
);

const US_STRIPES = [1, 3, 5, 7, 9, 11].map((i) => (
  <rect key={i} y={(i * 10) / 13} width="19" height={10 / 13} fill="#FFFFFF" />
));

export const FLAGS: Record<string, FlagDef> = {
  FR: { name: 'France', viewBox: '0 0 3 2', body: tricoloreV('#0055A4', '#FFFFFF', '#EF4135') },
  BE: { name: 'Belgique', viewBox: '0 0 3 2', body: tricoloreV('#000000', '#FDDA24', '#EF3340') },
  IT: { name: 'Italie', viewBox: '0 0 3 2', body: tricoloreV('#009246', '#FFFFFF', '#CE2B37') },
  DE: { name: 'Allemagne', viewBox: '0 0 3 2', body: tricoloreH('#000000', '#DD0000', '#FFCE00') },
  NL: { name: 'Pays-Bas', viewBox: '0 0 3 2', body: tricoloreH('#AE1C28', '#FFFFFF', '#21468B') },
  ES: {
    name: 'Espagne', viewBox: '0 0 3 2',
    body: <><rect width="3" height="2" fill="#AA151B" /><rect y="0.5" width="3" height="1" fill="#F1BF00" /></>,
  },
  PL: {
    name: 'Pologne', viewBox: '0 0 3 2',
    body: <><rect width="3" height="1" fill="#FFFFFF" /><rect y="1" width="3" height="1" fill="#DC143C" /></>,
  },
  SE: { name: 'Suède', viewBox: '0 0 16 10', body: croixNordique('#006AA7', '#FECC00') },
  DK: { name: 'Danemark', viewBox: '0 0 16 10', body: croixNordique('#C8102E', '#FFFFFF') },
  KR: {
    name: 'Corée du Sud', viewBox: '0 0 3 2',
    body: <><rect width="3" height="2" fill="#FFFFFF" /><circle cx="1.5" cy="1" r="0.5" fill="#CD2E3A" /><path d="M1 1a0.5 0.5 0 001 0z" fill="#0047A0" /></>,
  },
  US: {
    name: 'États-Unis', viewBox: '0 0 19 10',
    body: <><rect width="19" height="10" fill="#B22234" />{US_STRIPES}<rect width="7.6" height="5.4" fill="#3C3B6E" /></>,
  },
};

export interface FlagProps {
  /** Code pays ISO 3166 à 2 lettres, par exemple « FR ». */
  code: string;
  width?: number;
}

export function Flag({ code, width = 16 }: FlagProps) {
  const height = Math.round((width * 11) / 16);
  const def = FLAGS[code.toUpperCase()];
  if (!def) {
    return <span className="ui-flag-code" aria-label={code.toUpperCase()}>{code.toUpperCase()}</span>;
  }
  return (
    <svg width={width} height={height} viewBox={def.viewBox} role="img" aria-label={def.name}
      preserveAspectRatio="none" style={{ borderRadius: 2, flex: 'none' }}>
      {def.body}
    </svg>
  );
}
