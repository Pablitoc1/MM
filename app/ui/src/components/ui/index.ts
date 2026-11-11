// Composants d'interface des maquettes v2, prêts à brancher sur les vraies
// données dans les jalons (Effectif en M1, fiche joueur en M2, match en M6…).
// Vitrine : `just dev-web` puis http://localhost:1420/vitrine.html
import './ui.css';

export * from './types';
export * from './tone';
export { RoleIcon, RoleBadge } from './RoleIcon';
export { Flag, FLAGS } from './Flag';
export { Glyph, type GlyphName } from './glyphs';
export { Stars } from './Stars';
export { StatusTag, KindLabel, STATUTS, type Statut } from './StatusTag';
export { FormStreak } from './FormStreak';
export { PlayerPhoto, ChampionIcon, TeamLogo } from './Images';
export { Bar, TrendArrow, StateGauge, MiniGauge, AttributeBar, ProbabilityBar } from './Gauges';
export {
  Card, StatCard, Alert, ChampionMastery, ChemistryRow, InboxItem, StaffRow, StaffQuote, BigNumber,
  masteryLabel, chemistryLabel,
} from './Blocks';
export { PlayerHeader, SquadTable } from './Player';
export {
  GoldDiffChart, FormChart, RadarChart, KeyMoments, summarizeGold, niceStep,
  type GoldEvent, type FormPoint, type RadarAxis, type KeyMoment,
} from './Charts';
