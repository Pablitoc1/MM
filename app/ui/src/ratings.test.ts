import { describe, expect, it } from 'vitest';
import { ATTR_GROUPS, ATTR_LABEL, isRange, scoreText } from './ratings';

describe('notes', () => {
  it('affiche une note sûre seule et une note incertaine en fourchette', () => {
    expect(scoreText({ value: 16.4, low: 15.9, high: 16.9 })).toBe('16');
    expect(scoreText({ value: 13.5, low: 12.1, high: 15.2 })).toBe('12-15');
    expect(isRange({ value: 10, low: 10, high: 10, estimated: true })).toBe(true);
    // Niveau sur 100 : même seuil, mis à l'échelle.
    expect(scoreText({ value: 82.3, low: 76, high: 88 }, 100)).toBe('82');
    expect(scoreText({ value: 70, low: 60, high: 80 }, 100)).toBe('60-80');
  });

  it('range chacun des 15 attributs dans un groupe', () => {
    const keys = ATTR_GROUPS.flatMap((g) => g.keys);
    expect(keys).toHaveLength(15);
    expect(new Set(keys)).toEqual(new Set(Object.keys(ATTR_LABEL)));
  });
});
