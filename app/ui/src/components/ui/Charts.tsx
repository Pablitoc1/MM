// Graphiques des maquettes v2 en SVG pur : écart d'or, forme, radar.
// Aucune bibliothèque : les tracés sont simples et restent légers.
import { useId } from 'react';
import { ChampionIcon } from './Images';
import { TONE_VAR, formatEcart, formatNombre } from './tone';
import type { ChampionRef } from './types';

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

export interface GoldEvent {
  minute: number;
  side: 'us' | 'them';
  /** Ce qui s'est passé : « Dragon », « Premier sang de Yike ». */
  label: string;
}

export interface GoldDiffChartProps {
  /** Écart d'or nous moins eux, une valeur par minute (index 0 = 0 min). */
  values: number[];
  us: string;
  them: string;
  events?: GoldEvent[];
}

/**
 * Courbe d'écart d'or : teal quand nous menons, orange quand l'adversaire mène.
 * Sert au match en direct (M6), à la pause (M8) et à l'après-match (M8).
 */
export function GoldDiffChart({ values, us, them, events = [] }: GoldDiffChartProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const W = 620, H = 250, left = 46, right = 600, top = 16, bottom = 222;
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
  const minuteStep = [1, 2, 3, 5, 10].find((s) => last / s <= 7) ?? 10;
  const ticks = Array.from({ length: Math.floor(last / minuteStep) + 1 }, (_, i) => i * minuteStep);
  const levels = Array.from({ length: lines * 2 + 1 }, (_, i) => (i - lines) * step);
  const s = summarizeGold(values);
  const leader = s.final >= 0 ? us : them;
  const aria = `Écart d'or minute par minute : ${leader} mène de ${formatNombre(Math.abs(s.final))} à ${last} minutes`
    + (s.worst.value < 0 ? `, plus grand retard ${formatEcart(s.worst.value)} à ${s.worst.minute} minutes` : '')
    + (s.swingMinute !== undefined ? `, bascule à ${s.swingMinute} minutes` : '');
  const up = `gpos${uid}`, dn = `gneg${uid}`;

  return (
    <figure className="ui-chart">
      <figcaption className="ui-chart__caption">
        <span>{us} <strong style={{ color: s.final >= 0 ? TONE_VAR.good : TONE_VAR.bad }}>{formatEcart(s.final)}</strong></span>
        {s.worst.value < 0 && (
          <span> · max {them} <strong style={{ color: TONE_VAR.bad }}>{formatEcart(s.worst.value)}</strong> ({s.worst.minute} min)</span>
        )}
        {s.swingMinute !== undefined && <span> · bascule à {s.swingMinute} min</span>}
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={aria} style={{ width: '100%', height: 'auto' }}>
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
              {v === 0 ? '0' : `${v > 0 ? '+' : '\u2212'}${formatNombre(Math.abs(v) / 1000, Math.abs(v) % 1000 ? 1 : 0)}k`}
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
        {events.map((e, i) => {
          const v = values[Math.min(Math.max(Math.round(e.minute), 0), values.length - 1)] ?? 0;
          return (
            <circle key={i} cx={x(e.minute)} cy={y(v)} r={5.5} fill="var(--bg-card)" strokeWidth={2.5}
              stroke={e.side === 'us' ? 'var(--team-us)' : 'var(--team-them)'}>
              <title>{`${e.minute} min · ${e.label}`}</title>
            </circle>
          );
        })}
      </svg>
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
