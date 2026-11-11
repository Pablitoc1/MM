import type { IconName } from './components/Icon';

export type ScreenId =
  | 'accueil' | 'effectif' | 'entrainement' | 'tactique' | 'draft' | 'match'
  | 'recrutement' | 'competitions' | 'finances' | 'direction';

export interface NavItem {
  id: ScreenId;
  label: string;
  icon: IconName;
  /** Jalon du plan où l'écran devient réel. */
  milestone: string;
}

export const NAV: NavItem[] = [
  { id: 'accueil', label: 'Accueil', icon: 'home', milestone: 'M10' },
  { id: 'effectif', label: 'Effectif', icon: 'users', milestone: 'M1' },
  { id: 'entrainement', label: 'Entraînement', icon: 'dumbbell', milestone: 'M10' },
  { id: 'tactique', label: 'Tactique', icon: 'target', milestone: 'M7' },
  { id: 'draft', label: 'Draft', icon: 'sword', milestone: 'M7' },
  { id: 'match', label: 'Match en direct', icon: 'play', milestone: 'M6' },
  { id: 'recrutement', label: 'Recrutement', icon: 'search', milestone: 'M11' },
  { id: 'competitions', label: 'Compétitions', icon: 'trophy', milestone: 'M9' },
  { id: 'finances', label: 'Finances', icon: 'coins', milestone: 'M11' },
  { id: 'direction', label: 'Direction', icon: 'brief', milestone: 'M11' },
];
