// Blocs composés des maquettes v2 : carte de chiffre, alerte, maîtrise d'un
// champion, chimie, message de la boîte de réception, membre du staff.
import type { ReactNode } from 'react';
import { Bar } from './Gauges';
import { Glyph } from './glyphs';
import { ChampionIcon, PlayerPhoto } from './Images';
import { RoleIcon } from './RoleIcon';
import { Stars } from './Stars';
import { KindLabel } from './StatusTag';
import { TONE_VAR, formatNombre, toneOf100 } from './tone';
import type { Role, Tone } from './types';

/** Carte et titre de carte, comme partout dans les maquettes. */
export function Card({ title, action, children, hero, className }: {
  title?: string; action?: ReactNode; children: ReactNode; hero?: boolean; className?: string;
}) {
  return (
    <section className={`ui-card ${hero ? 'ui-card--hero' : ''} ${className ?? ''}`}>
      {(title || action) && (
        <div className="ui-card__head">
          {title && <h2 className="ui-card__title">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

/** Chiffre clé (« Masse salariale 1,6 M€ · 84 % du plafond »). */
export function StatCard({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: Tone }) {
  return (
    <div className="ui-card ui-stat">
      <span className="ui-stat__label">{label}</span>
      <strong className="ui-stat__value" style={{ color: tone ? TONE_VAR[tone] : undefined }}>{value}</strong>
      {sub && <span className="ui-stat__sub">{sub}</span>}
    </div>
  );
}

/** Bandeau d'alerte orange (risque de burn-out, poste sans remplaçant). */
export function Alert({ children }: { children: ReactNode }) {
  return (
    <div className="ui-alert" role="note">
      <Glyph name="warning" size={15} />
      <span>{children}</span>
    </div>
  );
}

export function masteryLabel(percent: number): { label: string; tone: Tone } {
  if (percent >= 85) return { label: 'Excellente', tone: 'good' };
  if (percent >= 70) return { label: 'Très bonne', tone: 'mid' };
  if (percent >= 55) return { label: 'Bonne', tone: 'mid' };
  return { label: 'Moyenne', tone: 'bad' };
}

export interface ChampionMasteryProps {
  champion: string;
  icon?: string;
  games: number;
  /** Taux de victoire en %. */
  winrate: number;
  /** Maîtrise de 0 à 100. */
  mastery: number;
}

/** Ligne « Varus · 34 parties · 62 % · maîtrise Excellente ». */
export function ChampionMastery({ champion, icon, games, winrate, mastery }: ChampionMasteryProps) {
  const m = masteryLabel(mastery);
  return (
    <div className="ui-mastery">
      <ChampionIcon name={champion} src={icon} size={40} />
      <div className="ui-mastery__body">
        <div className="ui-row">
          <strong>{champion}</strong>
          <span className="muted">
            {games} parties · <span style={{ color: winrate >= 55 ? 'var(--team-us)' : 'var(--text)' }}>{winrate} %</span>
          </span>
        </div>
        <div className="ui-mastery__bar">
          <Bar percent={mastery} tone={m.tone} height={5} label={`Maîtrise de ${champion}`} />
          <span style={{ color: TONE_VAR[m.tone] }}>{m.label}</span>
        </div>
      </div>
    </div>
  );
}

export function chemistryLabel(percent: number): string {
  if (percent >= 85) return 'Excellente';
  if (percent >= 70) return 'Bonne';
  if (percent >= 50) return 'Correcte';
  return 'Tendue';
}

/** Ligne de chimie entre deux joueurs. */
export function ChemistryRow({ name, photo, role, percent }: { name: string; photo?: string; role: Role; percent: number }) {
  const tone = toneOf100(percent);
  return (
    <div className="ui-chem">
      <PlayerPhoto name={name} src={photo} size={34} ring="var(--bg-active)" />
      <div className="ui-chem__body">
        <div className="ui-row">
          <span className="ui-inline"><strong>{name}</strong><RoleIcon role={role} size={14} /></span>
          <span style={{ color: TONE_VAR[tone], fontSize: 12, fontWeight: 600 }}>{chemistryLabel(percent)}</span>
        </div>
        <Bar percent={percent} tone={tone} height={4} label={`Chimie avec ${name}`} />
      </div>
    </div>
  );
}

export interface InboxItemProps {
  kind: string;
  kindTone?: Tone;
  title: string;
  time: string;
  body?: ReactNode;
  unread?: boolean;
  /** Visuel de gauche : photo, logo ou icône. */
  visual?: ReactNode;
  /** Contenu en plus : champions, jauge, boutons de réponse. */
  children?: ReactNode;
}

/** Message de la boîte de réception (accueil). */
export function InboxItem({ kind, kindTone = 'neutral', title, time, body, unread, visual, children }: InboxItemProps) {
  return (
    <article className="ui-inbox" aria-label={`${unread ? 'Non lu : ' : ''}${title}`}>
      <span className={unread ? 'ui-inbox__dot' : 'ui-inbox__dot ui-inbox__dot--read'} aria-hidden="true" />
      {visual}
      <div className="ui-inbox__body">
        <div className="ui-inline ui-wrap">
          <KindLabel tone={kindTone}>{kind}</KindLabel>
          <strong>{title}</strong>
          <span className="ui-inbox__time muted">{time}</span>
        </div>
        {body && <div className="ui-inbox__text">{body}</div>}
        {children}
      </div>
    </article>
  );
}

/** Membre du staff : photo (ou initiales du poste), poste, nom, étoiles. */
export function StaffRow({ initials, role, name, photo, stars }: {
  initials: string; role: string; name?: string; photo?: string; stars?: number;
}) {
  return (
    <div className="ui-staff">
      {photo
        ? <PlayerPhoto name={name ?? role} src={photo} size={34} ring="var(--bg-active)" />
        : <span className="ui-staff__badge" aria-hidden="true">{initials}</span>}
      <div className="ui-staff__body">
        <span className="ui-staff__role">{name ?? role}</span>
        <span className="muted">{name ? role : 'Nom à charger depuis la base'}</span>
      </div>
      {stars !== undefined && <Stars value={stars} />}
    </div>
  );
}

/** Avis d'un membre du staff, entre guillemets. */
export function StaffQuote({ initials, role, quote, tone = 'good' }: { initials: string; role: string; quote: string; tone?: Tone }) {
  return (
    <div className="ui-quote">
      <span className="ui-staff__badge" style={{ color: TONE_VAR[tone] }} aria-hidden="true">{initials}</span>
      <p><strong>{role}</strong><br />« {quote} »</p>
    </div>
  );
}

/** Chiffre mis en avant (« Niveau 84 · Potentiel 93 »). */
export function BigNumber({ label, value, sub, tone = 'good' }: { label: string; value: number; sub?: string; tone?: Tone }) {
  return (
    <div className="ui-big">
      <span className="muted">{label}</span>
      <span className="ui-big__value" style={{ color: TONE_VAR[tone] }}>{formatNombre(value)}</span>
      {sub && <span className="muted ui-big__sub">{sub}</span>}
    </div>
  );
}
