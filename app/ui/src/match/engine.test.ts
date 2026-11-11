// Le flux produit par le moteur Rust (M3) se lit sans erreur par la vue.
import json from '../../../../data/seed/public/match-demo.json';
import { describe, expect, it } from 'vitest';
import type { MatchReplay } from './replay';
import { analyzeEffects, stateAt } from './state';


const replay = json as unknown as MatchReplay;

describe('partie simulée par le moteur', () => {
  it('suit le format version 1', () => {
    expect(replay.version).toBe(1);
    expect(replay.champions).toHaveLength(10);
    expect(replay.frames.length).toBeGreaterThan(800);
    expect(replay.events.at(-1)?.type).toBe('end');
  });

  it('donne un état à chaque instant, avec des vagues et du farm', () => {
    const effects = analyzeEffects(replay);
    const at10 = stateAt(replay, 600, effects);
    expect(at10.waves.length).toBeGreaterThan(0);
    expect(at10.champions.every((c) => c.cs > 0 && c.level > 1)).toBe(true);
    expect(at10.camps.some((c) => c.status === 'dead')).toBe(true);
  });
});
