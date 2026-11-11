import { describe, expect, it } from 'vitest';
import { buildDemoReplay } from './demoReplay';
import {
  CAMPS, LANES, STRUCTURES, WAVE_CLEARANCE, laneLength, pointOnLane, toUnit, wavePosition,
} from './map';
import { analyzeEffects, formatClock, frameIndex, stateAt } from './state';

const replay = buildDemoReplay();
const effects = analyzeEffects(replay);

describe('carte', () => {
  it('compte 22 tours, 6 inhibiteurs, 2 nexus et 16 camps', () => {
    expect(STRUCTURES.filter((s) => s.kind === 'turret')).toHaveLength(22);
    expect(STRUCTURES.filter((s) => s.kind === 'inhibitor')).toHaveLength(6);
    expect(STRUCTURES.filter((s) => s.kind === 'nexus')).toHaveLength(2);
    expect(CAMPS).toHaveLength(16);
  });

  it('place tout dans le cadre de la minimap', () => {
    for (const p of [...STRUCTURES, ...CAMPS]) {
      const u = toUnit(p);
      expect(u.x).toBeGreaterThan(0);
      expect(u.x).toBeLessThan(1);
      expect(u.y).toBeGreaterThan(0);
      expect(u.y).toBeLessThan(1);
    }
  });

  it('relie les deux nexus par chaque voie, dans les deux sens', () => {
    for (const lane of ['top', 'mid', 'bot'] as const) {
      const len = laneLength(lane);
      expect(pointOnLane(lane, 0, 0)).toEqual(LANES[lane][0]);
      const back = pointOnLane(lane, 1, len);
      expect(back.x).toBeCloseTo(LANES[lane][0].x, 6);
      expect(back.y).toBeCloseTo(LANES[lane][0].y, 6);
      const mid0 = pointOnLane(lane, 0, len / 2);
      const mid1 = pointOnLane(lane, 1, len / 2);
      expect(Math.hypot(mid0.x - mid1.x, mid0.y - mid1.y)).toBeLessThan(1);
    }
  });

  it('ne dessine jamais une vague sur un bâtiment debout', () => {
    for (const lane of ['top', 'mid', 'bot'] as const) {
      for (let d = 0; d < laneLength(lane); d += 50) {
        const p = wavePosition(lane, 0, d, STRUCTURES);
        if (!p) continue;
        for (const st of STRUCTURES) expect(Math.hypot(p.x - st.x, p.y - st.y)).toBeGreaterThan(WAVE_CLEARANCE - 1);
      }
    }
  });
});

describe('faux match', () => {
  it('suit le format v1 : 10 champions, images et événements triés', () => {
    expect(replay.version).toBe(1);
    expect(replay.champions).toHaveLength(10);
    for (let i = 1; i < replay.frames.length; i++) expect(replay.frames[i].t).toBeGreaterThan(replay.frames[i - 1].t);
    for (let i = 1; i < replay.events.length; i++) expect(replay.events[i].t).toBeGreaterThanOrEqual(replay.events[i - 1].t);
    for (const f of replay.frames) expect(f.champions).toHaveLength(10);
  });

  it('donne 4 images par seconde en combat et 1 sinon', () => {
    const around = (t: number) => replay.frames.filter((f) => f.t >= t && f.t < t + 1).length;
    expect(around(1182)).toBe(4);
    expect(around(60)).toBe(1);
  });

  it('est toujours identique', () => {
    expect(JSON.stringify(buildDemoReplay())).toBe(JSON.stringify(replay));
  });

  it('garde les vagues dans leur voie et hors des bâtiments debout', () => {
    for (let t = 0; t <= replay.duration; t += 7) {
      const s = stateAt(replay, t);
      const standing = STRUCTURES.filter((st) => !s.destroyed.has(st.id));
      for (const w of s.waves) {
        // Chaque sbire dessiné de la file, pas seulement la tête de vague.
        expect(w.trail.length).toBeLessThanOrEqual(Math.min(4, w.n));
        for (const p of w.trail) {
          for (const st of standing) expect(Math.hypot(p.x - st.x, p.y - st.y)).toBeGreaterThan(WAVE_CLEARANCE - 1);
        }
      }
    }
  });

  it('se termine par la victoire de KC', () => {
    const end = stateAt(replay, replay.duration, effects);
    expect(end.winner).toBe(0);
    expect(end.destroyed.has('red_nexus')).toBe(true);
    expect(end.kills[0]).toBeGreaterThan(end.kills[1]);
  });
});

describe('état à un instant', () => {
  it('interpole les positions entre deux images', () => {
    const i = frameIndex(replay.frames, 100);
    const a = replay.frames[i];
    const b = replay.frames[i + 1];
    const mid = stateAt(replay, (a.t + b.t) / 2);
    expect(mid.champions[0].x).toBeCloseTo((a.champions[0].x + b.champions[0].x) / 2, 5);
  });

  it('grise un mort et affiche son temps de réapparition', () => {
    const s = stateAt(replay, 195, effects);
    expect(s.champions[5].alive).toBe(false);
    expect(s.champions[5].respawnIn).toBeGreaterThan(0);
    expect(s.kills).toEqual([1, 0]);
  });

  it('montre un camp pris avec son compte à rebours', () => {
    const s = stateAt(replay, 400, effects);
    const dragon = s.camps.find((c) => c.camp.id === 'dragon')!;
    expect(dragon.status).toBe('dead');
    expect(dragon.respawnIn).toBeCloseTo(642 - 400);
  });

  it('repère le double kill, le triple kill et les teamfights', () => {
    const labels = effects.filter((e) => e.kind === 'multikill').map((e) => e.kind === 'multikill' && e.label);
    expect(labels).toContain('Double kill');
    expect(labels).toContain('Triple kill');
    expect(effects.filter((e) => e.kind === 'teamfight').length).toBeGreaterThanOrEqual(2);
    expect(stateAt(replay, 1186, effects).effects.some((e) => e.kind === 'teamfight')).toBe(true);
  });

  it('formate l\'horloge', () => {
    expect(formatClock(1122.7)).toBe('18:42');
    expect(formatClock(5)).toBe('0:05');
  });
});
