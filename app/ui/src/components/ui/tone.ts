import type { Tone } from './types';

/** Variable CSS de chaque ton (définies dans tokens.css). */
export const TONE_VAR: Record<Tone, string> = {
  good: 'var(--team-us)',
  mid: 'var(--accent-blue)',
  bad: 'var(--team-them)',
  neutral: 'var(--text-muted)',
  gold: 'var(--accent-gold)',
};

/**
 * Ton d'une valeur sur 100 (moral, confiance, chimie, maîtrise) :
 * 70 et plus = bon, 50 à 69 = moyen, en dessous = à surveiller.
 */
export function toneOf100(value: number): Tone {
  if (value >= 70) return 'good';
  if (value >= 50) return 'mid';
  return 'bad';
}

/** Ton de la fatigue (en %) : au-delà de 50 % elle devient à surveiller. */
export function toneOfFatigue(percent: number): Tone {
  return percent > 50 ? 'bad' : 'good';
}

/** Ton d'un attribut sur 20 : 16 et plus = bon, 10 à 15 = moyen, en dessous = faible. */
export function toneOf20(value: number): Tone {
  if (value >= 16) return 'good';
  if (value >= 10) return 'mid';
  return 'bad';
}

/** Borne une valeur entre min et max. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Nombre au format français : 2 400, 1,8. */
export function formatNombre(value: number, decimales = 0): string {
  return value.toLocaleString('fr-FR', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });
}

/** Écart signé au format français : +2 400, \u2212420 (vrai signe moins). */
export function formatEcart(value: number): string {
  const abs = formatNombre(Math.abs(Math.round(value)));
  if (value > 0) return `+${abs}`;
  if (value < 0) return `\u2212${abs}`;
  return '0';
}

/** Montant en euros façon maquettes : 950 k€, 1,2 M€, 5,45 M€. */
export function formatEuros(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    const m = value / 1_000_000;
    return `${m.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}\u00a0M€`;
  }
  if (Math.abs(value) >= 1_000) return `${formatNombre(Math.round(value / 1_000))}\u00a0k€`;
  return `${formatNombre(value)}\u00a0€`;
}
