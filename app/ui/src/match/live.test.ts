import { describe, expect, it } from 'vitest';
import { buildDemoReplay } from './demoReplay';
import { buildFeed, placeName, structureLabel } from './feed';
import { campById } from './map';
import { formatMatchDate, goldEvents } from '../screens/MatchLive';
import { GRUBS_PER_TAKE, analyzeEffects, goldDiffByMinute, stateAt } from './state';

const replay = buildDemoReplay();
const effects = analyzeEffects(replay);

describe('économie du faux match', () => {
  it('ne dépasse jamais 6 objets et ne fait jamais baisser or, niveau ou cs', () => {
    for (let i = 1; i < replay.frames.length; i++) {
      const prev = replay.frames[i - 1];
      replay.frames[i].champions.forEach((c, j) => {
        expect(c.items.length).toBeLessThanOrEqual(6);
        expect(c.gold).toBeGreaterThanOrEqual(prev.champions[j].gold);
        expect(c.level).toBeGreaterThanOrEqual(prev.champions[j].level);
        expect(c.cs).toBeGreaterThanOrEqual(prev.champions[j].cs);
        expect(c.level).toBeLessThanOrEqual(18);
      });
    }
  });

  it('donne des chances de victoire entre 0 et 1, à 100 % pour KC à la fin', () => {
    for (const f of replay.frames) {
      expect(f.blueWin).toBeGreaterThanOrEqual(0);
      expect(f.blueWin).toBeLessThanOrEqual(1);
    }
    expect(stateAt(replay, replay.duration).blueWin).toBe(1);
  });

  it('garde deux sorts d\'invocateur par champion', () => {
    for (const c of replay.champions) expect(c.spells).toHaveLength(2);
  });
});

describe('état enrichi', () => {
  it('additionne l\'or des joueurs par équipe', () => {
    const s = stateAt(replay, 1190, effects);
    const blue = s.champions.filter((c) => c.team === 0).reduce((a, c) => a + c.gold, 0);
    expect(s.gold[0]).toBe(blue);
  });

  it('fait correspondre les KDA au score', () => {
    const s = stateAt(replay, 1190, effects);
    for (const team of [0, 1] as const) {
      const kills = s.champions.filter((c) => c.team === team).reduce((a, c) => a + c.kills, 0);
      const deaths = s.champions.filter((c) => c.team !== team).reduce((a, c) => a + c.deaths, 0);
      expect(kills).toBeLessThanOrEqual(s.kills[team]);
      expect(deaths).toBe(s.kills[team]);
    }
  });

  it('compte dragons, larves et Nashor', () => {
    const end = stateAt(replay, replay.duration, effects);
    const all = [...end.objectives[0].dragons, ...end.objectives[1].dragons];
    expect(all.length).toBeGreaterThan(0);
    expect(end.objectives[0].grubs + end.objectives[1].grubs).toBeGreaterThanOrEqual(GRUBS_PER_TAKE);
    expect(end.objectives[0].barons + end.objectives[1].barons).toBeGreaterThanOrEqual(1);
  });

  it('donne une valeur d\'écart d\'or par minute écoulée', () => {
    const gold = goldDiffByMinute(replay, 600);
    expect(gold).toHaveLength(11);
    expect(gold[0]).toBe(0);
  });
});

describe('fil du match', () => {
  it('nomme les bâtiments en français', () => {
    expect(structureLabel('red_bot_outer')).toBe('la tour bot extérieure');
    expect(structureLabel('blue_mid_inhib')).toBe('la tour mid d\'inhibiteur');
  });

  it('montre le plus récent d\'abord et rien du futur', () => {
    const feed = buildFeed(replay, 1200, effects);
    expect(feed.length).toBeGreaterThan(5);
    for (let i = 1; i < feed.length; i++) expect(feed[i - 1].t).toBeGreaterThanOrEqual(feed[i].t);
    expect(feed.every((e) => e.t <= 1200)).toBe(true);
  });

  it('regroupe les kills d\'un teamfight dans un seul bloc', () => {
    const feed = buildFeed(replay, replay.duration, effects);
    const fights = feed.filter((e) => e.kind === 'teamfight');
    expect(fights.length).toBe(effects.filter((e) => e.kind === 'teamfight').length);
    for (const f of fights) {
      if (f.kind !== 'teamfight') continue;
      expect(f.lost[0].length + f.lost[1].length).toBeGreaterThanOrEqual(3);
      expect(f.score[0]).toBe(f.lost[1].length);
    }
  });

  it('met un multi-kill hors combat sur une seule ligne', () => {
    const feed = buildFeed(replay, 700, effects);
    const double = feed.find((e) => e.kind === 'kill' && e.multikill === 'Double kill');
    expect(double?.kind === 'kill' && double.victims.length).toBe(2);
  });

  it('nomme le lieu d\'un combat', () => {
    expect(placeName(campById('dragon')!)).toBe('au dragon');
    expect(placeName(campById('baron')!)).toBe('au Nashor');
    expect(placeName({ x: 7400, y: 7400 })).toBe('en mid');
  });

  it('ne garde que les balises posées avant un objectif', () => {
    const wards = buildFeed(replay, replay.duration, effects).filter((e) => e.kind === 'ward');
    expect(wards.length).toBeGreaterThan(0);
    expect(wards.length).toBeLessThan(12);
  });

  it('attribue les objectifs au joueur qui les prend', () => {
    const feed = buildFeed(replay, replay.duration, effects);
    const dragon = feed.find((e) => e.kind === 'objective' && e.camp === 'dragon');
    expect(dragon?.kind === 'objective' && dragon.by).not.toBeNull();
    expect(feed.some((e) => e.kind === 'objective' && e.camp === 'baron')).toBe(true);
  });
});

describe('barre et courbe du match', () => {
  it('écrit la date du match à la française', () => {
    expect(formatMatchDate('2026-01-17')).toBe('Sam. 17 janvier 2026');
  });

  it('place les repères de la courbe sans annoncer les kills à venir', () => {
    const marks = goldEvents(replay, 1190, effects);
    expect(marks.some((m) => m.kind === 'dragon')).toBe(true);
    const fight = marks.find((m) => m.highlight && m.kind === 'kill');
    expect(fight?.badge).toBe('×3–1');
    expect(marks.every((m) => m.minute <= 1190 / 60)).toBe(true);
  });
});
