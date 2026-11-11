// Présentation des notes : groupes d'attributs de la fiche joueur (maquette v2),
// et affichage d'une note seule ou d'une fourchette.
import type { AttrScore } from './api';

export const ATTR_LABEL: Record<string, string> = {
  mecanique: 'Mécanique',
  laning: 'Laning',
  farm: 'Farm',
  teamfight: 'Teamfight',
  escarmouche: 'Escarmouche',
  lecture_carte: 'Lecture de carte',
  decision: 'Décision',
  vision: 'Vision',
  pool_champions: 'Pool de champions',
  shotcalling: 'Shotcalling',
  communication: 'Communication',
  sang_froid: 'Sang-froid',
  regularite: 'Régularité',
  grands_matchs: 'Grands matchs',
  professionnalisme: 'Professionnalisme',
};

export const ATTR_GROUPS: { title: string; keys: string[] }[] = [
  { title: 'Mécanique', keys: ['mecanique', 'laning', 'farm', 'teamfight', 'escarmouche'] },
  { title: 'Jeu', keys: ['lecture_carte', 'decision', 'vision', 'pool_champions', 'shotcalling', 'communication'] },
  { title: 'Mental', keys: ['sang_froid', 'regularite', 'grands_matchs', 'professionnalisme'] },
];

/** Demi-largeur (sur 20) au-delà de laquelle on montre une fourchette : même seuil que
 * `RANGE_SHOWN` dans crates/data/src/ratings.rs (environ un split et demi de parties). */
export const RANGE_SHOWN = 1;

/** Une fourchette s'affiche quand la note est estimée ou incertaine. `scale` : 20 ou 100. */
export function isRange(a: { value?: number; low: number; high: number; estimated?: boolean }, scale = 20): boolean {
  return Boolean(a.estimated) || a.high - a.low >= (2 * RANGE_SHOWN * scale) / 20;
}

/** « 16 » ou « 12-15 ». */
export function scoreText(a: { value: number; low: number; high: number; estimated?: boolean }, scale = 20): string {
  if (!isRange(a, scale)) return String(Math.round(a.value));
  return `${Math.round(a.low)}-${Math.round(a.high)}`;
}

export function byKey(attrs: AttrScore[]): Map<string, AttrScore> {
  return new Map(attrs.map((a) => [a.key, a]));
}

/** Couleur d'une note sur 20 : 15 = joueur moyen de LEC, 17 et plus = très haut niveau. */
export function tone(value: number): 'high' | 'mid' | 'low' {
  if (value >= 17) return 'high';
  if (value >= 13) return 'mid';
  return 'low';
}
