import { Glyph, type GlyphName } from './glyphs';
import { TONE_VAR } from './tone';
import type { Tone } from './types';

/** Statuts des maquettes v2, avec leur icône et leur couleur. */
export const STATUTS = {
  enFeu: { label: 'En feu', glyph: 'flame', tone: 'good' },
  pepite: { label: 'Pépite', glyph: 'star', tone: 'mid' },
  fatigue: { label: 'Fatigué', glyph: 'warning', tone: 'bad' },
  inquiet: { label: 'Inquiet', glyph: 'warning', tone: 'bad' },
  blesse: { label: 'Blessé', glyph: 'cross', tone: 'bad' },
  convoite: { label: 'Convoité', glyph: 'eye', tone: 'bad' },
  leader: { label: 'Leader', glyph: 'star', tone: 'gold' },
  intransferable: { label: 'Intransférable', glyph: 'shield', tone: 'neutral' },
} as const satisfies Record<string, { label: string; glyph: GlyphName; tone: Tone }>;

export type Statut = keyof typeof STATUTS;

export interface StatusTagProps {
  /** Un statut connu… */
  statut?: Statut;
  /** …ou un tag libre (trait de personnalité, « Convoité : 3 clubs »). */
  label?: string;
  tone?: Tone;
  glyph?: GlyphName;
  /** Blanc cassé, pour les traits de personnalité. */
  plain?: boolean;
}

export function StatusTag({ statut, label, tone, glyph, plain }: StatusTagProps) {
  const def = statut ? STATUTS[statut] : undefined;
  const text = label ?? def?.label ?? '';
  const icon = glyph ?? def?.glyph;
  const color = plain ? 'var(--text)' : TONE_VAR[tone ?? def?.tone ?? 'neutral'];
  return (
    <span className="ui-tag" style={{ color, borderColor: color }}>
      {icon && <Glyph name={icon} />}
      {text}
    </span>
  );
}

/** Petit label en capitales devant un message (ANALYSTE, JOUEUR, PATCH 26.2…). */
export function KindLabel({ children, tone = 'neutral' }: { children: string; tone?: Tone }) {
  const color = TONE_VAR[tone];
  return (
    <span className="ui-kind" style={{ color, borderColor: `color-mix(in srgb, ${color} 55%, transparent)` }}>
      {children}
    </span>
  );
}
