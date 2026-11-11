import type { Statut } from './StatusTag';

// Types partagés par les composants d'interface. Les écrans des jalons
// (M1, M2, M6, M8, M10…) les rempliront avec les vraies données.

export type Role = 'top' | 'jungle' | 'mid' | 'adc' | 'support';

export const ROLES: Role[] = ['top', 'jungle', 'mid', 'adc', 'support'];

export const ROLE_LABEL: Record<Role, string> = {
  top: 'Top',
  jungle: 'Jungle',
  mid: 'Mid',
  adc: 'ADC',
  support: 'Support',
};

/** Couleur sémantique des maquettes : teal = bon, bleu = moyen, orange = à surveiller. */
export type Tone = 'good' | 'mid' | 'bad' | 'neutral' | 'gold';

export type Trend = 'up' | 'down' | 'flat';

/** Résultat d'un match pour les pastilles de forme. */
export type Result = 'V' | 'D';

/** Un champion à afficher (nom et icône Data Dragon quand elle est importée). */
export interface ChampionRef {
  name: string;
  icon?: string;
}

/** Ce que la ligne de l'effectif affiche pour un joueur. */
export interface SquadPlayer {
  id: string;
  pseudo: string;
  realName: string;
  /** Code pays ISO à 2 lettres. */
  country: string;
  role: Role;
  age: number;
  photo?: string;
  champions: ChampionRef[];
  /** Niveau et potentiel en étoiles (0 à 5, par demi). */
  level: number;
  potential: number;
  /** 5 derniers matchs, du plus ancien au plus récent. */
  form: Result[];
  morale: number;
  /** Fatigue en %. */
  fatigue: number;
  /** Valeur estimée en euros. */
  value: number;
  /** Fin de contrat, par exemple « nov. 2026 ». */
  contractEnd: string;
  contractEndsThisYear?: boolean;
  statuts: Statut[];
}

/** Poste tel qu'il est écrit dans la base (Leaguepedia) → poste de l'interface. */
export function roleFromDb(role: string): Role | null {
  const map: Record<string, Role> = { Top: 'top', Jungle: 'jungle', Mid: 'mid', Bot: 'adc', Support: 'support' };
  return map[role] ?? null;
}
