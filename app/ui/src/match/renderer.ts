// Dessin de la carte en PixiJS. Lit seulement un `MatchState` (state.ts) :
// aucune règle du jeu ici, tout vient du flux.
import {
  Application, Assets, BlurFilter, ColorMatrixFilter, Container, Graphics, Sprite, Text, type Texture,
} from 'pixi.js';
import { ALCOVES, CAMPS, STRUCTURES, toUnit, type CampKind, type Point } from './map';
import type { MatchReplay, TeamIndex } from './replay';
import { championIcon, localAsset } from './icons';
import { GRUBS, formatClock, type CampView, type MatchState } from './state';

/** Couleurs lues dans tokens.css au démarrage (Pixi ne lit pas le CSS lui-même). */
const TOKENS = {
  page: '--bg-page', text: '--text', muted: '--text-muted', us: '--team-us', them: '--team-them',
  campRing: '--map-camp', campTaken: '--map-camp-taken', ward: '--map-ward', alcove: '--map-alcove',
  stone: '--map-stone', stoneLight: '--map-stone-light', rubble: '--map-rubble', kill: '--map-kill',
  buffBlue: '--map-buff-blue', buffRed: '--map-buff-red', scuttle: '--map-scuttle', clash: '--map-clash',
  cross: '--map-dead-cross', infernal: '--drake-infernal', ocean: '--drake-ocean', void: '--objective-void',
} as const;

type Palette = Record<keyof typeof TOKENS, number> & { team: [number, number] };
let COLORS: Palette;

function readPalette(): Palette {
  const css = getComputedStyle(document.documentElement);
  const out = {} as Record<keyof typeof TOKENS, number>;
  for (const [key, name] of Object.entries(TOKENS) as [keyof typeof TOKENS, string][]) {
    let v = css.getPropertyValue(name).trim();
    // La minification du CSS raccourcit « #ffffff » en « #fff ».
    if (/^#[0-9a-f]{3}$/i.test(v)) v = `#${[...v.slice(1)].map((c) => c + c).join('')}`;
    if (!/^#[0-9a-f]{6}$/i.test(v)) throw new Error(`couleur ${name} absente de tokens.css`);
    out[key] = parseInt(v.slice(1), 16);
  }
  return { ...out, team: [out.us, out.them] };
}

const CAMP_ICON: Record<CampKind, string> = {
  blue: 'blue', red: 'red', gromp: 'gromp', wolves: 'wolves', raptors: 'raptors',
  krugs: 'krugs', scuttle: 'scuttle', dragon: 'dragon', baron: 'baron',
};

/** Adresse d'une image : icônes de champions de la base (M1), le reste livré avec la vue. */
function urlOf(path: string): string {
  if (path.startsWith('champions/')) return championIcon(path.slice('champions/'.length, -'.png'.length));
  return localAsset(path);
}

export function assetPaths(replay: MatchReplay): string[] {
  return [
    'map11.png', 'camps/voidgrubs.webp', 'camps/dragon-ocean.webp',
    'minion-blue-melee.webp', 'minion-blue-caster.webp', 'minion-red-melee.webp', 'minion-red-caster.webp',
    ...Object.values(CAMP_ICON).map((k) => `camps/${k}.webp`),
    ...replay.champions.map((c) => `champions/${c.champion}.png`),
  ];
}

/** Couleur de l'anneau d'un camp en vie (maquette). */
function campColor(kind: CampKind): number {
  if (kind === 'blue') return COLORS.buffBlue;
  if (kind === 'red') return COLORS.buffRed;
  if (kind === 'scuttle') return COLORS.scuttle;
  return COLORS.campRing;
}

function greyFilter(): ColorMatrixFilter {
  const f = new ColorMatrixFilter();
  f.greyscale(0.2, false); // gris et assombri : grayscale(1) brightness(.6) de la maquette
  return f;
}

/** Image ronde avec un anneau de couleur. */
class Badge extends Container {
  readonly img: Sprite;
  readonly ring = new Graphics();
  readonly caption: Text;
  private back = new Graphics();
  private halo = new Graphics();
  private haloColor: number | null = null;
  private grey = greyFilter();
  private isGrey = false;

  constructor(tex: Texture, readonly radius: number, ringColor: number, labelSize = 9) {
    super();
    this.img = new Sprite(tex);
    this.img.anchor.set(0.5);
    this.img.width = this.img.height = radius * 2;
    const mask = new Graphics().circle(0, 0, radius).fill(0xffffff);
    this.img.mask = mask;
    this.halo.filters = [new BlurFilter({ strength: radius / 3 })];
    this.halo.visible = false;
    this.addChild(this.halo, this.back, this.img, mask, this.ring);
    this.setRing(ringColor);
    this.caption = new Text({
      text: '',
      style: { fontFamily: 'Inter, sans-serif', fontSize: labelSize, fontWeight: '700', fill: COLORS.text },
      resolution: 3,
    });
    this.caption.anchor.set(0.5, 0);
    this.caption.y = radius + 2;
    this.addChild(this.caption);
  }

  /** Anneau de couleur, entouré d'un liseré sombre (`outline`) comme sur la maquette. */
  setRing(color: number, width = 2, outline = 1) {
    this.ring.clear()
      .circle(0, 0, this.radius + outline / 2 + width / 2).stroke({ width: outline, color: COLORS.page })
      .circle(0, 0, this.radius).stroke({ width, color });
  }

  /** Fond plein sous l'image (icônes de sbires détourées). */
  bg(color: number) {
    this.back.clear().circle(0, 0, this.radius).fill(color);
  }

  /** Halo coloré autour de l'image, ou rien. */
  setHalo(color: number | null) {
    if (color === this.haloColor) return;
    this.haloColor = color;
    this.halo.visible = color !== null;
    if (color !== null) this.halo.clear().circle(0, 0, this.radius + 3).fill({ color, alpha: 0.8 });
  }

  /** Petite étiquette sur fond sombre (compte à rebours, nom d'objectif). */
  pill(below: boolean) {
    this.caption.anchor.set(0.5, below ? 0 : 1);
    this.caption.y = below ? this.radius + 1 : -this.radius - 3;
    this.caption.style.stroke = { color: COLORS.page, width: 3 };
  }

  setGrey(on: boolean) {
    if (on === this.isGrey) return;
    this.isGrey = on;
    this.img.filters = on ? [this.grey] : [];
  }

  /** Met le texte au centre de l'image (temps de réapparition d'un champion). */
  captionInside() {
    this.caption.anchor.set(0.5, 0.5);
    this.caption.y = 0;
    this.caption.style.stroke = { color: COLORS.page, width: 3 };
  }

  setLabel(text: string) {
    if (this.caption.text !== text) this.caption.text = text;
    this.caption.visible = text !== '';
  }
}

function drawTurret(g: Graphics, team: TeamIndex, scale: number) {
  const k = scale;
  g.poly([-6 * k, 12 * k, -4 * k, -1 * k, 4 * k, -1 * k, 6 * k, 12 * k]).fill(COLORS.stone).stroke({ width: 1.2, color: COLORS.page });
  g.poly([-7 * k, -1 * k, 7 * k, -1 * k, 5 * k, -4 * k, -5 * k, -4 * k]).fill(COLORS.stoneLight).stroke({ width: 1, color: COLORS.page });
  g.poly([0, -12 * k, 4 * k, -7 * k, 0, -3 * k, -4 * k, -7 * k]).fill(COLORS.team[team]).stroke({ width: 1, color: COLORS.page });
}

function drawInhibitor(g: Graphics, team: TeamIndex, scale: number) {
  const k = scale;
  g.ellipse(0, 6 * k, 8 * k, 3 * k).fill(COLORS.stone).stroke({ width: 1, color: COLORS.page });
  g.poly([0, -9 * k, 5 * k, -1 * k, 0, 7 * k, -5 * k, -1 * k]).fill(COLORS.team[team]).stroke({ width: 1.2, color: COLORS.page });
}

function drawNexus(g: Graphics, team: TeamIndex, scale: number) {
  const k = scale;
  g.circle(0, 0, 11 * k).fill({ color: COLORS.stone, alpha: 0.9 }).stroke({ width: 1.5, color: COLORS.page });
  g.poly([0, -10 * k, 7 * k, 0, 0, 10 * k, -7 * k, 0]).fill(COLORS.team[team]).stroke({ width: 1.2, color: COLORS.page });
}

function drawRubble(g: Graphics, scale: number) {
  const k = scale;
  g.poly([-8 * k, 10 * k, -5 * k, 3 * k, -2 * k, 6 * k, 1 * k, 1 * k, 4 * k, 5 * k, 8 * k, 10 * k]).fill(COLORS.rubble).stroke({ width: 1.2, color: COLORS.page });
}

/** Cercle en pointillés (Pixi ne fait pas de trait pointillé). */
function dashedCircle(g: Graphics, x: number, y: number, r: number, color: number, alpha: number) {
  const dashes = Math.max(12, Math.round((2 * Math.PI * r) / 9));
  for (let i = 0; i < dashes; i += 1) {
    if (i % 2) continue;
    const a0 = (i / dashes) * Math.PI * 2;
    const a1 = ((i + 1) / dashes) * Math.PI * 2;
    g.moveTo(x + Math.cos(a0) * r, y + Math.sin(a0) * r).arc(x, y, r, a0, a1).stroke({ width: 2, color, alpha });
  }
}

export class MatchRenderer {
  readonly app = new Application();
  private size = 640;
  private textures = new Map<string, Texture>();
  private world = new Container();
  private structures = new Map<string, { icon: Graphics; rubble: Graphics }>();
  private camps = new Map<string, Badge>();
  private champions: Badge[] = [];
  private crosses: Graphics[] = [];
  private clashes = new Graphics();
  private waves = new Map<number, Container>();
  private waveLayer = new Container();
  private wards = new Graphics();
  private effects = new Graphics();
  private effectTexts = new Container();
  private destroyedKey = '';

  constructor(private replay: MatchReplay) {}

  async init(host: HTMLElement, size: number) {
    this.size = size;
    COLORS = readPalette();
    await this.app.init({
      width: size, height: size, background: COLORS.page, antialias: true,
      resolution: Math.max(2, window.devicePixelRatio || 1), autoDensity: true,
    });
    this.app.canvas.style.width = '100%';
    this.app.canvas.style.height = 'auto';
    this.app.canvas.setAttribute('role', 'img');
    this.app.canvas.setAttribute('aria-label', 'Carte du match en direct');
    host.appendChild(this.app.canvas);
    const paths = assetPaths(this.replay);
    const loaded = await Assets.load(paths.map(urlOf));
    for (const p of paths) this.textures.set(p, loaded[urlOf(p)] as Texture);
    this.build();
  }

  private tex(path: string): Texture {
    const t = this.textures.get(path);
    if (!t) throw new Error(`image manquante : ${path}`);
    return t;
  }

  /** Position de jeu → pixels du canevas. */
  px(p: Point): Point {
    const u = toUnit(p);
    return { x: u.x * this.size, y: u.y * this.size };
  }

  private build() {
    const S = this.size;
    const k = S / 470; // les tailles des maquettes sont données pour une carte de 470 px
    const bg = new Sprite(this.tex('map11.png'));
    bg.width = bg.height = S;
    const dim = new ColorMatrixFilter();
    dim.saturate(-0.4, false);
    dim.brightness(0.7, true);
    bg.filters = [dim];
    this.world.addChild(bg);

    const alcoves = new Graphics();
    for (const a of ALCOVES) {
      const p = this.px(a);
      alcoves.circle(p.x, p.y, 7 * k).fill({ color: COLORS.alcove, alpha: 0.55 }).stroke({ width: 1.5 * k, color: COLORS.alcove });
    }
    this.world.addChild(alcoves);

    const structLayer = new Container();
    for (const st of STRUCTURES) {
      const p = this.px(st);
      const icon = new Graphics();
      const rubble = new Graphics();
      const draw = { turret: drawTurret, inhibitor: drawInhibitor, nexus: drawNexus }[st.kind];
      draw(icon, st.team, k);
      drawRubble(rubble, k);
      for (const g of [icon, rubble]) g.position.set(p.x, p.y);
      rubble.visible = false;
      structLayer.addChild(rubble, icon);
      this.structures.set(st.id, { icon, rubble });
    }

    const campLayer = new Container();
    for (const camp of CAMPS) {
      const big = camp.kind === 'dragon' || camp.kind === 'baron';
      const buff = camp.kind === 'blue' || camp.kind === 'red';
      // Tailles de la maquette (carte de 470 px) : 34 px pour dragon et Nashor, 24 pour les buffs, 20 sinon.
      const radius = (big ? 17 : buff ? 12 : 10) * k;
      const badge = new Badge(this.tex(`camps/${CAMP_ICON[camp.kind]}.webp`), radius, campColor(camp.kind), 9 * k);
      badge.pill(!big);
      const p = this.px(camp);
      badge.position.set(p.x, p.y);
      campLayer.addChild(badge);
      this.camps.set(camp.id, badge);
    }

    const champLayer = new Container();
    champLayer.sortableChildren = true;
    this.replay.champions.forEach((c, i) => {
      const badge = new Badge(this.tex(`champions/${c.champion}.png`), 15 * k, COLORS.team[c.team], 9 * k);
      badge.pill(true);
      const cross = new Graphics();
      const r = 6 * k;
      cross.moveTo(-r, -r).lineTo(r, r).moveTo(r, -r).lineTo(-r, r).stroke({ width: 2.5 * k, color: COLORS.cross, cap: 'round' });
      cross.visible = false;
      badge.addChild(cross);
      champLayer.addChild(badge);
      this.champions[i] = badge;
      this.crosses[i] = cross;
    });

    this.world.addChild(structLayer, campLayer, this.wards, this.waveLayer, this.clashes, this.effects, champLayer, this.effectTexts);
    this.app.stage.addChild(this.world);
  }

  /** Redessine la carte pour l'état donné. Appelé à chaque image affichée. */
  render(state: MatchState) {
    const k = this.size / 470;
    this.renderStructures(state);
    for (const c of state.camps) this.renderCamp(c);
    this.renderWards(state, k);
    this.renderWaves(state, k);
    this.renderChampions(state);
    this.renderEffects(state, k);
  }

  private renderStructures(state: MatchState) {
    const key = [...state.destroyed].sort().join(',');
    if (key === this.destroyedKey) return;
    this.destroyedKey = key;
    for (const [id, g] of this.structures) {
      const down = state.destroyed.has(id);
      g.icon.visible = !down;
      g.rubble.visible = down;
    }
  }

  private renderCamp(c: CampView) {
    const badge = this.camps.get(c.camp.id)!;
    const big = c.camp.kind === 'dragon' || c.camp.kind === 'baron';
    const alive = c.status === 'alive';
    const grubs = c.camp.kind === 'baron' && c.variant === GRUBS;
    if (c.camp.kind === 'baron') badge.img.texture = this.tex(`camps/${grubs ? 'voidgrubs' : 'baron'}.webp`);
    if (c.camp.kind === 'dragon') badge.img.texture = this.tex(`camps/${c.variant === 'Océan' ? 'dragon-ocean' : 'dragon'}.webp`);
    // Un camp encore jamais apparu ne s'affiche qu'à moins d'une minute (sauf les grands objectifs).
    badge.visible = alive || c.respawnIn !== null && (big || c.status === 'dead' || c.respawnIn < 60);
    badge.setGrey(!alive);
    const color = !alive ? COLORS.campTaken
      : c.camp.kind === 'dragon' ? (c.variant === 'Océan' ? COLORS.ocean : COLORS.infernal)
        : c.camp.kind === 'baron' ? COLORS.void : campColor(c.camp.kind);
    badge.setRing(color, 2, 1);
    // Halo des grands objectifs en jeu, comme sur la maquette.
    badge.setHalo(big && alive ? color : null);
    let label = '';
    if (!alive && c.respawnIn !== null) label = formatClock(c.respawnIn);
    if (big && alive) label = grubs ? 'Larves en jeu' : c.camp.kind === 'baron' ? 'Nashor en jeu' : `${c.variant ?? 'Dragon'} en jeu`;
    if (big && !alive && c.respawnIn !== null) {
      label = `${c.camp.kind === 'baron' ? (c.variant === GRUBS ? 'Larves' : 'Nashor') : 'Dragon'} ${formatClock(c.respawnIn)}`;
    }
    badge.setLabel(label);
  }

  private renderWards(state: MatchState, k: number) {
    const g = this.wards.clear();
    for (const w of state.wards) {
      const p = this.px(w);
      g.circle(p.x, p.y, 6 * k).fill({ color: COLORS.team[w.team], alpha: 0.2 });
      g.circle(p.x, p.y, 4 * k).fill(COLORS.ward).stroke({ width: 2 * k, color: COLORS.team[w.team] });
    }
  }

  private renderWaves(state: MatchState, k: number) {
    const seen = new Set<number>();
    for (const w of state.waves) {
      seen.add(w.id);
      let node = this.waves.get(w.id);
      if (!node) {
        node = new Container();
        const side = w.team === 0 ? 'blue' : 'red';
        // Deux sbires de mêlée devant, deux casters derrière (maquette).
        for (let j = 0; j < 4; j++) {
          const tex = this.tex(`minion-${side}-${j < 2 ? 'melee' : 'caster'}.webp`);
          const b = new Badge(tex, 6.5 * k, COLORS.team[w.team]);
          b.setRing(COLORS.team[w.team], 1.5, 0);
          b.bg(COLORS.page);
          node.addChild(b);
        }
        const pill = new Graphics();
        const count = new Text({
          text: '', resolution: 3,
          style: { fontFamily: 'Inter, sans-serif', fontSize: 9 * k, fontWeight: '800', fill: COLORS.page },
        });
        count.anchor.set(0.5);
        node.addChild(pill, count);
        this.waveLayer.addChild(node);
        this.waves.set(w.id, node);
      }
      const icons = node.children.slice(0, 4) as Container[];
      icons.forEach((icon, j) => {
        const q = w.trail[j];
        icon.visible = q !== undefined;
        if (q) { const p = this.px(q); icon.position.set(p.x, p.y); }
      });
      // Le nombre se place derrière le dernier sbire, dans l'axe de la file.
      const last = this.px(w.trail[w.trail.length - 1]);
      const prev = this.px(w.trail[Math.max(0, w.trail.length - 2)]);
      let dx = last.x - prev.x;
      let dy = last.y - prev.y;
      const len = Math.hypot(dx, dy);
      if (len < 1) { dx = w.team === 0 ? -1 : 1; dy = w.team === 0 ? 1 : -1; } else { dx /= len; dy /= len; }
      const pill = node.children[4] as Graphics;
      const count = node.children[5] as Text;
      const text = String(w.n);
      if (count.text !== text) count.text = text;
      const cx = last.x + dx * 12 * k;
      const cy = last.y + dy * 12 * k;
      const pw = Math.max(10 * k, count.width + 7 * k);
      pill.clear().roundRect(cx - pw / 2, cy - 6 * k, pw, 12 * k, 6 * k).fill(COLORS.team[w.team]);
      count.position.set(cx, cy);
    }
    for (const [id, node] of this.waves) {
      if (!seen.has(id)) { node.destroy({ children: true }); this.waves.delete(id); }
    }
    const g = this.clashes.clear();
    for (const c of state.clashes) {
      const p = this.px(c);
      g.circle(p.x, p.y, 8 * k).fill({ color: COLORS.clash, alpha: 0.18 });
      g.circle(p.x, p.y, 5 * k).fill({ color: COLORS.clash, alpha: 0.85 });
    }
  }

  private renderChampions(state: MatchState) {
    for (const c of state.champions) {
      const badge = this.champions[c.index];
      const p = this.px(c);
      badge.position.set(p.x, p.y);
      badge.setGrey(!c.alive);
      // Un mort est plus petit, grisé et barré d'une croix rouge (maquette).
      badge.scale.set(c.alive ? 1 : 0.8);
      badge.setRing(COLORS.team[c.team], 2, c.alive ? 2 : 1);
      this.crosses[c.index].visible = !c.alive;
      badge.setLabel(!c.alive && c.respawnIn !== null ? formatClock(c.respawnIn) : '');
      badge.zIndex = c.alive ? 1 : 0;
    }
  }

  private renderEffects(state: MatchState, k: number) {
    const g = this.effects.clear();
    this.effectTexts.removeChildren().forEach((c) => c.destroy());
    for (const e of state.effects) {
      const p = this.px(e);
      const age = state.t - e.t;
      if (e.kind === 'kill') {
        const r = (10 + age * 14) * k;
        g.circle(p.x, p.y, r).stroke({ width: 2.5 * k, color: COLORS.kill, alpha: Math.max(0, 1 - age / 2) });
      } else if (e.kind === 'teamfight') {
        const r = (e.radius / 14990) * this.size;
        const pulse = 1 + 0.04 * Math.sin(state.t * 4);
        dashedCircle(g, p.x, p.y, r * pulse, COLORS.text, 0.55);
      } else {
        const s = 1 + 0.12 * Math.sin(age * 8) * Math.max(0, 1 - age / 4);
        const label = this.addLabel(e.label, p.x, p.y - 28 * k, COLORS.page, 11 * k, COLORS.team[e.team]);
        label.scale.set(s);
        const rays = 8;
        for (let i = 0; i < rays; i++) {
          const a = (i / rays) * Math.PI * 2 + age * 0.8;
          g.moveTo(p.x + Math.cos(a) * 16 * k, p.y + Math.sin(a) * 16 * k)
            .lineTo(p.x + Math.cos(a) * (22 + 4 * Math.sin(age * 6)) * k, p.y + Math.sin(a) * (22 + 4 * Math.sin(age * 6)) * k)
            .stroke({ width: 2 * k, color: COLORS.team[e.team], alpha: Math.max(0, 1 - age / 4) });
        }
      }
    }
  }

  private addLabel(text: string, x: number, y: number, color: number, size: number, bg: number): Container {
    const c = new Container();
    const t = new Text({ text, resolution: 3, style: { fontFamily: 'Inter, sans-serif', fontSize: size, fontWeight: '700', fill: color } });
    t.anchor.set(0.5);
    const pad = size * 0.45;
    const box = new Graphics().roundRect(-t.width / 2 - pad, -t.height / 2 - pad / 2, t.width + pad * 2, t.height + pad, size * 0.5).fill({ color: bg, alpha: 0.92 });
    c.addChild(box, t);
    c.position.set(x, y);
    this.effectTexts.addChild(c);
    return c;
  }

  destroy() {
    this.app.destroy(true, { children: true });
  }
}

