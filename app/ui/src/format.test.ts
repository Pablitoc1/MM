import { describe, expect, it } from 'vitest';
import { ageAt, countryFr, kda, monthYear } from './format';

describe('format', () => {
  it('traduit les pays de Leaguepedia', () => {
    expect(countryFr('South Korea')).toBe('Corée du Sud');
    expect(countryFr('Germany')).toBe('Allemagne');
    expect(countryFr('Atlantis')).toBe('Atlantis');
    expect(countryFr(null)).toBeNull();
  });

  it('calcule l\'âge au début de la partie', () => {
    expect(ageAt('2006-08-28', '2026-01-05')).toBe(19);
    expect(ageAt('2000-01-05', '2026-01-05')).toBe(26);
    expect(ageAt('2000-01-06', '2026-01-05')).toBe(25);
    expect(ageAt(null, '2026-01-05')).toBeNull();
  });

  it('écrit la fin de contrat en mois et année', () => {
    expect(monthYear('2027-11-20')).toBe('nov. 2027');
    expect(monthYear(null)).toBeNull();
  });

  it('calcule le KDA sans diviser par zéro', () => {
    expect(kda({ kills: 4, deaths: 2, assists: 6 })).toBe(5);
    expect(kda({ kills: 4, deaths: 0, assists: 6 })).toBe(10);
  });
});
