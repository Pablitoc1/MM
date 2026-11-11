// Graphiques des maquettes v2 en SVG pur : écart d'or, forme, radar.
// Aucune bibliothèque : les tracés sont simples et restent légers.
import { useId } from 'react';
import { ChampionIcon } from './Images';
import { TONE_VAR, formatEcart, formatNombre } from './tone';
import type { ChampionRef } from './types';
// Icônes d'objectifs reprises des maquettes v2.
import dragonIcon from './assets/dragon.webp';
import larvesIcon from './assets/larves.webp';
import nashorIcon from './assets/nashor.webp';

const AXIS_FONT = { fontSize: 11, fontFamily: 'var(--font-body)' };

/** Pas « rond » pour un axe : 500, 1 000, 2 000, 5 000… */
export function niceStep(maxAbs: number, lines = 3): number {
  const raw = Math.max(maxAbs, 1) / lines;
  const pow = 10 ** Math.floor(Math.log10(raw));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * pow >= raw) return m * pow;
  return 10 * pow;
}

export interface GoldSummary {
  final: number;
  /** Plus grand avantage de l'adversaire (valeur négative) et sa minute. */
  worst: { value: number; minute: number };
  best: { value: number; minute: number };
  /** Dernière minute où le signe change, si la courbe bascule. */
  swingMinute?: number;
}

/** Résumé d'une courbe d'écart d'or (nous moins eux, une valeur par minute). */
export function summarizeGold(values: number[]): GoldSummary {
  let worst = { value: 0, minute: 0 };
  let best = { value: 0, minute: 0 };
  let swingMinute: number | undefined;
  values.forEach((v, m) => {
    if (v < worst.value) worst = { value: v, minute: m };
    if (v > best.value) best = { value: v, minute: m };
    const prev = values[m - 1];
    if (m > 0 && prev !== undefined && Math.sign(prev) !== Math.sign(v) && v !== 0) swingMinute = m;
  });
  return { final: values[values.length - 1] ?? 0, worst, best, swingMinute };
}

export type GoldEventKind = 'kill' | 'dragon' | 'larves' | 'nashor' | 'tour';

export const GOLD_EVENT_LABEL: Record<GoldEventKind, string> = {
  kill: 'Kill (tueur)', dragon: 'Dragon', tour: 'Tour', larves: 'Larves', nashor: 'Nashor',
};

/** Icônes des objectifs neutres (maquettes v2). */
export const OBJECTIVE_ICON: Partial<Record<GoldEventKind, string>> = {
  dragon: dragonIcon, larves: larvesIcon, nashor: nashorIcon,
};

export interface GoldEvent {
  /** Minute de l'événement (décimales acceptées : 11.7 = 11 min 42). */
  minute: number;
  side: 'us' | 'them';
  kind: GoldEventKind;
  /** Pour un kill : le champion du tueur. */
  champion?: ChampionRef;
  /** Icône à afficher, prioritaire sur celle du champion ou de l'objectif. */
  icon?: string;
  /** Plusieurs icônes qui se chevauchent (combat d'équipe : les tueurs). */
  icons?: string[];
  /** Petit badge : « ⚔ 3 – 1 » au-dessus d'un combat, « ×2 » sur un multi-kill. */
  badge?: string;
  /** Moment fort : halo et trait plus marqué. */
  highlight?: boolean;
  /** Ce qui s'est passé : « Premier sang de Yike ». */
  label: string;
}

const sideVar = (side: 'us' | 'them') => (side === 'us' ? 'var(--team-us)' : 'var(--team-them)');

/** Tour stylisée des maquettes, avec la gemme à la couleur de l'équipe. */
export function TowerIcon({ side = 'us', width = 14 }: { side?: 'us' | 'them'; width?: number }) {
  return (
    <svg width={width} height={(width * 26) / 20} viewBox="0 0 20 26" aria-hidden="true" style={{ display: 'block' }}>
      <path d="M4 25 L6 12 L14 12 L16 25 Z" fill="var(--tower-body)" stroke="var(--bg-page)" strokeWidth={1.2} />
      <path d="M6 25 L7.5 14 L9 25 Z" fill="var(--tower-light)" />
      <path d="M3 12 L17 12 L15 9 L5 9 Z" fill="var(--tower-top)" stroke="var(--bg-page)" strokeWidth={1} />
      <path d="M10 1 L14 6 L10 10 L6 6 Z" fill={sideVar(side)} stroke="var(--bg-page)" strokeWidth={1} />
      <circle cx="10" cy="5.5" r="1.4" fill="var(--text)" fillOpacity={0.8} />
    </svg>
  );
}

/** Étoile de combat derrière un regroupement d'icônes. */
function Burst({ side }: { side: 'us' | 'them' }) {
  const pts = Array.from({ length: 16 }, (_, i) => {
    const r = i % 2 ? 6.5 : 12;
    const a = (Math.PI * i) / 8;
    return `${(r * Math.cos(a)).toFixed(1)},${(r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
  return (
    <span className="ui-gold-mark__burst" aria-hidden="true">
      <svg viewBox="-13 -13 26 26" width="52" height="52"><polygon points={pts} fill={sideVar(side)} fillOpacity={0.35} /></svg>
    </span>
  );
}

/** Repère d'un événement, posé au-dessus de la courbe (HTML par-dessus le SVG). */
function GoldMarker({ e }: { e: GoldEvent }) {
  const color = sideVar(e.side);
  const icons = e.icons ?? [e.icon ?? (e.kind === 'kill' ? e.champion?.icon : OBJECTIVE_ICON[e.kind])].filter(Boolean) as string[];
  if (e.kind === 'tour' && !e.icon && !e.icons) {
    return <span className="ui-gold-mark" title={e.label}><TowerIcon side={e.side} /></span>;
  }
  const group = icons.length > 1;
  return (
    <span className="ui-gold-mark" title={e.label}>
      {group && <Burst side={e.side} />}
      <span className="ui-gold-mark__icons">
        {icons.map((src, i) => (
          <img key={i} src={src} alt="" width={group ? 20 : 22} height={group ? 20 : 22}
            style={{ borderColor: color, marginLeft: i ? -8 : 0, boxShadow: e.highlight ? `0 0 0 2px var(--bg-page), 0 0 10px 2px ${color}` : undefined }} />
        ))}
        {icons.length === 0 && <span className="ui-gold-mark__empty" style={{ borderColor: color }} />}
      </span>
      {e.badge && (
        <span className={group ? 'ui-gold-mark__badge ui-gold-mark__badge--top' : 'ui-gold-mark__badge ui-gold-mark__badge--corner'}
          style={{ background: color }}>{e.badge}</span>
      )}
    </span>
  );
}

/** Légende des repères, comme au-dessus de la courbe des maquettes. */
export function GoldLegend({ kinds, us, them, killIcon }: { kinds: GoldEventKind[]; us: string; them: string; killIcon?: string }) {
  return (
    <div className="ui-chart__legend">
      {kinds.map((k) => {
        const src = k === 'kill' ? killIcon : OBJECTIVE_ICON[k];
        return (
          <span key={k} className="ui-inline" style={{ gap: 5 }}>
            {k === 'tour' ? <TowerIcon width={12} /> : src ? <img src={src} alt="" width={16} height={16} style={{ borderRadius: '50%' }} /> : null}
            {GOLD_EVENT_LABEL[k]}
          </span>
        );
      })}
      <span>Contour <span style={{ color: 'var(--team-us)' }}>{us}</span> / <span style={{ color: 'var(--team-them)' }}>{them}</span></span>
    </div>
  );
}

export interface GoldDiffChartProps {
  /** Écart d'or nous moins eux, une valeur par minute (index 0 = 0 min). */
  values: number[];
  us: string;
  them: string;
  events?: GoldEvent[];
  /** Légende des repères (par défaut quand il y a des repères). */
  legend?: boolean;
  /** Résumé en tête (« KC +2 400 · max G2 −420 (8 min) · bascule à 10 min »). */
  summary?: boolean;
  /** Pastille de la valeur finale au bout de la courbe (« +2,4k »). */
  finalPill?: boolean;
}

/** « +2,4k », « −420 » : valeur courte pour la pastille et les axes. */
export function formatK(v: number): string {
  const sign = v > 0 ? '+' : v < 0 ? '−' : '';
  const a = Math.abs(v);
  if (a < 1000) return `${sign}${formatNombre(a)}`;
  return `${sign}${formatNombre(a / 1000, a % 1000 ? 1 : 0)}k`;
}

/**
 * Courbe d'écart d'or des maquettes v2 : un point par minute, teal quand nous
 * menons, orange quand l'adversaire mène ; repères en icônes au-dessus,
 * reliés à leur minute par un trait. Sert au match (M6), à la pause et à
 * l'après-match (M8).
 */
export function GoldDiffChart({ values, us, them, events = [], legend, summary = true, finalPill = true }: GoldDiffChartProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const hasMarks = events.length > 0;
  const W = 620, H = 250, left = 46, right = 568, top = hasMarks ? 52 : 16, bottom = 222, markY = 26;
  const maxAbs = Math.max(...values.map(Math.abs), 1);
  const step = niceStep(maxAbs);
  const lines = Math.max(1, Math.ceil(maxAbs / step));
  const yMax = lines * step;
  const last = Math.max(values.length - 1, 1);
  const x = (m: number) => left + ((right - left) * m) / last;
  const mid = (top + bottom) / 2;
  const y = (v: number) => mid - ((bottom - top) / 2) * (v / yMax);
  const pts = values.map((v, m) => `${x(m).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const area = `M${x(0)},${mid} L${pts.replaceAll(' ', ' L')} L${x(values.length - 1)},${mid} Z`;
  const minuteStep = [1, 2, 3, 5, 10].find((st) => last / st <= 7) ?? 10;
  const ticks = Array.from({ length: Math.floor(last / minuteStep) + 1 }, (_, i) => i * minuteStep);
  const levels = Array.from({ length: lines * 2 + 1 }, (_, i) => (i - lines) * step);
  const s = summarizeGold(values);
  const leader = s.final >= 0 ? us : them;
  const aria = `Écart d'or minute par minute : ${leader} mène de ${formatNombre(Math.abs(s.final))} à ${last} minutes`
    + (s.worst.value < 0 ? `, plus grand retard ${formatEcart(s.worst.value)} à ${s.worst.minute} minutes` : '')
    + (s.swingMinute !== undefined ? `, bascule à ${s.swingMinute} minutes` : '');
  const up = `gpos${uid}`, dn = `gneg${uid}`;
  const showLegend = legend ?? hasMarks;
  const lastX = x(values.length - 1), lastY = y(s.final);

  return (
    <figure className="ui-chart">
      {(summary || showLegend) && (
        <div className="ui-chart__head">
          {showLegend && (
            <GoldLegend us={us} them={them} killIcon={events.find((e) => e.kind === 'kill')?.champion?.icon}
              kinds={(Object.keys(GOLD_EVENT_LABEL) as GoldEventKind[]).filter((k) => events.some((e) => e.kind === k))} />
          )}
          {summary && (
            <figcaption className="ui-chart__caption">
              {us} <strong style={{ color: s.final >= 0 ? TONE_VAR.good : TONE_VAR.bad }}>{formatEcart(s.final)}</strong>
              {s.worst.value < 0 && <> · max {them} <strong style={{ color: TONE_VAR.bad }}>{formatEcart(s.worst.value)}</strong> ({s.worst.minute} min)</>}
              {s.swingMinute !== undefined && <> · bascule à {s.swingMinute} min</>}
            </figcaption>
          )}
        </div>
      )}
      <div className="ui-gold">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={aria} style={{ width: '100%', height: 'auto', display: 'block' }}>
          <defs>
            <clipPath id={up}><rect x="0" y="0" width={W} height={mid} /></clipPath>
            <clipPath id={dn}><rect x="0" y={mid} width={W} height={H - mid} /></clipPath>
          </defs>
          {levels.map((v) => (
            <g key={v}>
              <line x1={left} x2={right} y1={y(v)} y2={y(v)} stroke={v === 0 ? 'var(--border-strong)' : 'var(--grid-line)'}
                strokeDasharray={v === 0 ? undefined : '2 4'} />
              <text x={left - 8} y={y(v) + 4} textAnchor="end" style={AXIS_FONT}
                fill={v > 0 ? 'var(--teal-text)' : v < 0 ? 'var(--team-them)' : 'var(--text-muted)'}>
                {v === 0 ? '0' : formatK(v)}
              </text>
            </g>
          ))}
          {ticks.map((m) => (
            <text key={m} x={x(m)} y={H - 12} textAnchor="middle" fill="var(--text-muted)" style={AXIS_FONT}>{m} min</text>
          ))}
          <path d={area} fill="var(--team-us)" fillOpacity={0.22} clipPath={`url(#${up})`} />
          <path d={area} fill="var(--team-them)" fillOpacity={0.22} clipPath={`url(#${dn})`} />
          <polyline points={pts} fill="none" stroke="var(--team-us)" strokeWidth={2.5} strokeLinejoin="round" clipPath={`url(#${up})`} />
          <polyline points={pts} fill="none" stroke="var(--team-them)" strokeWidth={2.5} strokeLinejoin="round" clipPath={`url(#${dn})`} />
          {values.map((v, m) => (
            <circle key={m} cx={x(m)} cy={y(v)} r={2.5} fill={v < 0 ? 'var(--team-them)' : 'var(--team-us)'} />
          ))}
          {events.map((e, i) => (
            <line key={i} x1={x(e.minute)} x2={x(e.minute)} y1={markY + 14} y2={bottom} stroke={sideVar(e.side)}
              strokeOpacity={e.highlight ? 0.6 : 0.25} strokeWidth={e.highlight ? 2 : 1} />
          ))}
          {finalPill && (
            <g>
              <rect x={lastX + 6} y={lastY - 11} width={44} height={20} rx={4} fill={s.final >= 0 ? 'var(--team-us)' : 'var(--team-them)'} />
              <text x={lastX + 28} y={lastY + 3} textAnchor="middle" fill="var(--bg-page)" fontSize={11} fontWeight={700}
                fontFamily="var(--font-body)">{formatK(s.final)}</text>
            </g>
          )}
        </svg>
        {events.map((e, i) => (
          <span key={i} className="ui-gold__at" style={{ left: `${(x(e.minute) / W) * 100}%`, top: `${(markY / H) * 100}%` }}>
            <GoldMarker e={e} />
          </span>
        ))}
      </div>
    </figure>
  );
}

export interface FormPoint {
  /** Note du match sur 10. */
  rating: number;
  win: boolean;
}

/** Notes des derniers matchs : points teal (victoire) ou orange (défaite). */
export function FormChart({ points }: { points: FormPoint[] }) {
  const W = 300, H = 90, pad = 15;
  const lo = 4, hi = 10;
  const y = (r: number) => H - 8 - ((H - 16) * (Math.min(Math.max(r, lo), hi) - lo)) / (hi - lo);
  const x = (i: number) => pad + ((W - pad * 2) * i) / Math.max(points.length - 1, 1);
  const avg = points.reduce((a, p) => a + p.rating, 0) / Math.max(points.length, 1);
  const lastRating = points[points.length - 1]?.rating ?? 0;
  const trend = points.length > 1 && lastRating > points[0].rating ? 'en hausse' : 'en baisse ou stable';
  return (
    <figure className="ui-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" style={{ width: '100%', height: 'auto' }}
        aria-label={`Notes des ${points.length} derniers matchs, ${trend}, dernière ${formatNombre(lastRating, 1)}`}>
        <line x1="0" x2={W} y1={y(avg)} y2={y(avg)} stroke="var(--track)" strokeDasharray="3 3" />
        <polyline points={points.map((p, i) => `${x(i)},${y(p.rating)}`).join(' ')}
          fill="none" stroke="var(--team-us)" strokeWidth={2.5} strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={x(i)} cy={y(p.rating)} r={4.5} stroke="var(--bg-card)" strokeWidth={2}
            fill={p.win ? 'var(--team-us)' : 'var(--team-them)'} />
        ))}
      </svg>
      <figcaption className="ui-row muted" style={{ fontSize: 12 }}>
        <span>Moyenne : <strong style={{ color: 'var(--text)' }}>{formatNombre(avg, 1)}</strong></span>
        <span>
          <span style={{ color: 'var(--team-us)' }}>●</span> victoire{'  '}
          <span style={{ color: 'var(--team-them)' }}>●</span> défaite
        </span>
      </figcaption>
    </figure>
  );
}

export interface RadarAxis {
  label: string;
  /** Note sur 20 du joueur. */
  value: number;
  /** Note de référence (moyenne du poste), en pointillés. */
  reference?: number;
}

/** Radar de profil (fiche joueur, comparaison avec la moyenne du poste). */
export function RadarChart({ axes, name, referenceName, max = 20 }: {
  axes: RadarAxis[]; name: string; referenceName?: string; max?: number;
}) {
  const cx = 130, cy = 120, R = 88, n = axes.length;
  const angle = (i: number) => -Math.PI / 2 + (2 * Math.PI * i) / n;
  const pt = (i: number, ratio: number) =>
    [cx + R * ratio * Math.cos(angle(i)), cy + R * ratio * Math.sin(angle(i))] as const;
  const poly = (ratios: number[]) => ratios.map((r, i) => pt(i, r).map((v) => v.toFixed(1)).join(',')).join(' ');
  const hasRef = axes.some((a) => a.reference !== undefined);
  const aria = `Profil de ${name}${referenceName ? ` comparé à : ${referenceName}` : ''}. `
    + axes.map((a) => `${a.label} ${a.value}`).join(', ');
  return (
    <figure className="ui-chart ui-radar">
      <svg viewBox="-50 0 360 240" role="img" aria-label={aria} style={{ width: '100%', maxWidth: 380, height: 'auto' }}>
        {[0.25, 0.5, 0.75, 1].map((r) => (
          <polygon key={r} points={poly(axes.map(() => r))} fill="none" stroke="var(--track)" />
        ))}
        {axes.map((a, i) => {
          const [ex, ey] = pt(i, 1);
          return <line key={a.label} x1={cx} y1={cy} x2={ex} y2={ey} stroke="var(--track)" />;
        })}
        {hasRef && (
          <polygon points={poly(axes.map((a) => (a.reference ?? 0) / max))} fill="none"
            stroke="var(--text-muted)" strokeDasharray="4 3" />
        )}
        <polygon points={poly(axes.map((a) => a.value / max))} fill="var(--team-us)" fillOpacity={0.25}
          stroke="var(--team-us)" strokeWidth={2} />
        {axes.map((a, i) => {
          const [lx, ly] = pt(i, 1.17);
          const c = Math.cos(angle(i));
          const anchor = Math.abs(c) < 0.2 ? 'middle' : c > 0 ? 'start' : 'end';
          return (
            <text key={a.label} x={lx} y={ly + 4} textAnchor={anchor} fill="var(--text-muted)" style={AXIS_FONT}>
              {a.label} <tspan fill="var(--text)" fontWeight={700}>{a.value}</tspan>
            </text>
          );
        })}
      </svg>
      <figcaption className="ui-inline muted" style={{ fontSize: 12, gap: 14, justifyContent: 'center' }}>
        <span className="ui-inline"><span className="ui-legend ui-legend--us" />{name}</span>
        {hasRef && referenceName && <span className="ui-inline"><span className="ui-legend ui-legend--ref" />{referenceName}</span>}
      </figcaption>
    </figure>
  );
}

export interface KeyMoment {
  time: string;
  text: string;
  side: 'us' | 'them';
  icon?: ChampionRef;
}

/** Liste des moments clés (après-match, fil du match). */
export function KeyMoments({ moments }: { moments: KeyMoment[] }) {
  return (
    <ol className="ui-moments">
      {moments.map((m, i) => (
        <li key={i}>
          <span className="ui-moments__time" style={{ color: m.side === 'us' ? TONE_VAR.good : TONE_VAR.bad }}>{m.time}</span>
          {m.icon && <ChampionIcon name={m.icon.name} src={m.icon.icon} size={22} />}
          <span>{m.text}</span>
        </li>
      ))}
    </ol>
  );
}
