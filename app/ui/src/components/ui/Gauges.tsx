// Jauges et barres des maquettes v2.
import { Glyph } from './glyphs';
import { TONE_VAR, clamp, formatNombre, toneOf20 } from './tone';
import type { Tone, Trend } from './types';

/** Barre fine sans texte : la brique commune des autres jauges. */
export function Bar({ percent, tone = 'good', height = 6, label }: {
  percent: number; tone?: Tone; height?: number; label?: string;
}) {
  const p = clamp(percent, 0, 100);
  return (
    <span className="ui-bar" style={{ height, borderRadius: height / 2 }}
      role={label ? 'meter' : undefined} aria-label={label} aria-valuemin={label ? 0 : undefined}
      aria-valuemax={label ? 100 : undefined} aria-valuenow={label ? Math.round(p) : undefined}>
      <span className="ui-bar__fill" style={{ width: `${p}%`, background: TONE_VAR[tone] }} />
    </span>
  );
}

const TREND_LABEL: Record<Trend, string> = { up: 'en hausse', down: 'en baisse', flat: 'stable' };

export function TrendArrow({ trend, tone }: { trend: Trend; tone?: Tone }) {
  const t = tone ?? (trend === 'up' ? 'good' : trend === 'down' ? 'bad' : 'neutral');
  return (
    <span className="ui-trend" style={{ color: TONE_VAR[t] }} role="img" aria-label={TREND_LABEL[trend]}>
      <Glyph name={trend} size={14} />
    </span>
  );
}

export interface StateGaugeProps {
  /** Forme, Moral, Fatigue, Confiance… */
  label: string;
  /** Remplissage de 0 à 100. */
  percent: number;
  /** Texte sous la jauge : « Excellente », « 68 % ». */
  valueText: string;
  tone: Tone;
  trend?: Trend;
  /** Ton de la flèche, si différent du sens (fatigue en hausse = mauvais). */
  trendTone?: Tone;
}

/** Jauge d'état du joueur (fiche joueur, pause entre les parties). */
export function StateGauge({ label, percent, valueText, tone, trend, trendTone }: StateGaugeProps) {
  return (
    <div className="ui-state">
      <div className="ui-state__head">
        <span>{label}</span>
        {trend && <TrendArrow trend={trend} tone={trendTone} />}
      </div>
      <Bar percent={percent} tone={tone} height={8} label={label} />
      <strong style={{ color: TONE_VAR[tone] }}>{valueText}</strong>
    </div>
  );
}

/** Ligne compacte « Moral ▬▬▬ 72 » du tableau de l'effectif et de l'accueil. */
export function MiniGauge({ label, percent, valueText, tone, labelWidth = 36 }: {
  label: string; percent: number; valueText: string; tone: Tone; labelWidth?: number;
}) {
  return (
    <span className="ui-mini">
      <span style={{ width: labelWidth }}>{label}</span>
      <span style={{ flex: 1 }}><Bar percent={percent} tone={tone} label={label} /></span>
      <b style={{ color: TONE_VAR[tone] }}>{valueText}</b>
    </span>
  );
}

export interface AttributeBarProps {
  name: string;
  /** Note sur 20, connue précisément… */
  value?: number;
  /** …ou fourchette estimée par le staff ([12, 15]). */
  range?: [number, number];
  trend?: Trend;
}

/**
 * Attribut sur 20 (fiche joueur). Trois cas : note exacte, fourchette
 * estimée (mental, joueurs peu connus) ou inconnu (« ? »).
 */
export function AttributeBar({ name, value, range, trend }: AttributeBarProps) {
  let bar;
  let text;
  let aria;
  if (value !== undefined) {
    bar = <Bar percent={(value / 20) * 100} tone={toneOf20(value)} />;
    text = formatNombre(value);
    aria = `${name} : ${value} sur 20`;
  } else if (range) {
    const [lo, hi] = range;
    bar = (
      <span className="ui-bar ui-bar--range">
        <span className="ui-bar__range" style={{ left: `${(lo / 20) * 100}%`, width: `${((hi - lo) / 20) * 100}%` }} />
      </span>
    );
    text = `${lo}-${hi}`;
    aria = `${name} : entre ${lo} et ${hi} sur 20 (estimation)`;
  } else {
    bar = <span className="ui-bar ui-bar--unknown" />;
    text = '?';
    aria = `${name} : inconnu`;
  }
  return (
    <div className="ui-attr" role="group" aria-label={aria}>
      <span className="ui-attr__name">{name}</span>
      {bar}
      <strong className={range ? 'ui-attr__val ui-attr__val--wide' : 'ui-attr__val'}>{text}</strong>
      <span className="ui-attr__trend">{trend && trend !== 'flat' && <TrendArrow trend={trend} />}</span>
    </div>
  );
}

/** Barre de pronostic : nous à gauche (teal), l'adversaire à droite (orange). */
export function ProbabilityBar({ us, label = 'Probabilité de victoire', showLabel = false, height = 6 }: {
  us: number; label?: string;
  /** Libellé écrit à droite, comme dans le bandeau du match en direct. */
  showLabel?: boolean;
  height?: number;
}) {
  const p = Math.round(clamp(us, 0, 100));
  return (
    <div className="ui-proba" role="img" aria-label={`${label} : ${p} % contre ${100 - p} %`}>
      <span className="ui-proba__us">{p} %</span>
      <span className="ui-proba__bar" style={{ height, borderRadius: height / 2 }}><span style={{ width: `${p}%` }} /></span>
      <span className="ui-proba__them">{100 - p} %</span>
      {showLabel && <span className="ui-proba__label" aria-hidden="true">{label}</span>}
    </div>
  );
}
