// En-tête de la fiche joueur et tableau de l'effectif (maquettes v2).
import type { ReactNode } from 'react';
import { BigNumber } from './Blocks';
import { Flag, FLAGS } from './Flag';
import { MiniGauge } from './Gauges';
import { Glyph } from './glyphs';
import { ChampionIcon, PlayerPhoto, TeamLogo } from './Images';
import { RoleBadge, RoleIcon } from './RoleIcon';
import { Stars } from './Stars';
import { FormStreak } from './FormStreak';
import { StatusTag, type Statut } from './StatusTag';
import { formatEuros, formatNombre, toneOf100, toneOfFatigue } from './tone';
import type { Role, SquadPlayer } from './types';

export interface PlayerHeaderProps {
  pseudo: string;
  role: Role;
  /** Rang du joueur à son poste dans la ligue (#1). */
  rank?: number;
  country: string;
  age: number;
  club: { name: string; logo?: string };
  since: string;
  contractEnd: string;
  photo?: string;
  statuts: Statut[];
  /** Tags libres en plus des statuts (« Convoité : 3 clubs »). */
  extraTags?: ReactNode;
  level: number;
  potential: number;
  value: number;
  /** Salaire mensuel en euros. */
  salary: number;
  onTalk?: () => void;
  onContract?: () => void;
}

/** En-tête de la fiche joueur : photo, identité, statuts, niveau, valeur. */
export function PlayerHeader(p: PlayerHeaderProps) {
  const pays = FLAGS[p.country.toUpperCase()]?.name ?? p.country;
  return (
    <section className="ui-card ui-card--hero ui-player">
      <div className="ui-player__photo">
        <PlayerPhoto name={p.pseudo} src={p.photo} size={112} shape="card" alt={`Photo de ${p.pseudo}`} />
        <span className="ui-player__club"><TeamLogo name={p.club.name} src={p.club.logo} size={24} /></span>
      </div>
      <div className="ui-player__id">
        <div className="ui-inline ui-wrap" style={{ gap: 12 }}>
          <h1 className="ui-player__name">{p.pseudo}</h1>
          <RoleBadge role={p.role} />
          {p.rank !== undefined && <span className="ui-rank">#{p.rank}</span>}
        </div>
        <div className="ui-inline ui-wrap muted" style={{ fontSize: 13 }}>
          <Flag code={p.country} width={22} />
          <span>{pays}</span><span aria-hidden="true">·</span>
          <span>{p.age} ans</span><span aria-hidden="true">·</span>
          <span>{p.club.name} depuis {p.since}</span><span aria-hidden="true">·</span>
          <span>Contrat : {p.contractEnd}</span>
        </div>
        <div className="ui-inline ui-wrap" style={{ gap: 6 }}>
          {p.statuts.map((s) => <StatusTag key={s} statut={s} />)}
          {p.extraTags}
        </div>
      </div>
      <div className="ui-inline ui-wrap" style={{ gap: 18 }}>
        <BigNumber label="Niveau" value={p.level} sub={`Potentiel ${formatNombre(p.potential)}`} />
        <div className="ui-player__money">
          <span className="muted">Valeur estimée</span>
          <strong>{formatEuros(p.value)}</strong>
          <span className="muted">Salaire : {formatEuros(p.salary)} / mois</span>
        </div>
        <div className="ui-player__actions">
          <button type="button" className="ui-btn" onClick={p.onTalk}><Glyph name="chat" size={16} /> Discuter</button>
          <button type="button" className="ui-btn" onClick={p.onContract}><Glyph name="doc" size={16} /> Contrat</button>
        </div>
      </div>
    </section>
  );
}

export interface SquadTableProps {
  players: SquadPlayer[];
  /** Clic sur le nom d'un joueur (ouvre sa fiche). */
  onOpen?: (id: string) => void;
}

/** Tableau de l'effectif : une ligne par joueur. */
export function SquadTable({ players, onOpen }: SquadTableProps) {
  return (
    <div className="ui-card ui-table-wrap">
      <table className="ui-table">
        <thead>
          <tr>
            <th scope="col">Poste</th><th scope="col">Joueur</th><th scope="col">Âge</th>
            <th scope="col">Champions</th><th scope="col">Niveau</th><th scope="col">Forme</th>
            <th scope="col">Moral / fatigue</th><th scope="col">Valeur · contrat</th><th scope="col">Statut</th>
          </tr>
        </thead>
        <tbody>
          {players.map((j) => (
            <tr key={j.id}>
              <td><RoleIcon role={j.role} /></td>
              <td>
                <div className="ui-inline" style={{ gap: 10 }}>
                  <PlayerPhoto name={j.pseudo} src={j.photo} />
                  <div className="ui-col">
                    <button type="button" className="ui-link-name" onClick={() => onOpen?.(j.id)}>{j.pseudo}</button>
                    <span className="ui-inline muted" style={{ fontSize: 11, gap: 6 }}>
                      <Flag code={j.country} />{j.realName}
                    </span>
                  </div>
                </div>
              </td>
              <td>{j.age}</td>
              <td>
                <div className="ui-inline" style={{ gap: 3 }}>
                  {j.champions.map((c) => <ChampionIcon key={c.name} name={c.name} src={c.icon} />)}
                </div>
              </td>
              <td>
                <div className="ui-col ui-levels">
                  <span className="ui-inline"><span className="ui-levels__k">Niv.</span><Stars value={j.level} /></span>
                  <span className="ui-inline"><span className="ui-levels__k">Pot.</span><Stars value={j.potential} /></span>
                </div>
              </td>
              <td><FormStreak results={j.form} /></td>
              <td>
                <div className="ui-col ui-table__gauges">
                  <MiniGauge label="Moral" percent={j.morale} valueText={String(j.morale)} tone={toneOf100(j.morale)} />
                  <MiniGauge label="Fatigue" percent={j.fatigue} valueText={`${j.fatigue} %`} tone={toneOfFatigue(j.fatigue)} />
                </div>
              </td>
              <td>
                <div className="ui-col">
                  <span><strong>{formatEuros(j.value)}</strong> <span className="muted" style={{ fontSize: 11 }}>· {j.contractEnd}</span></span>
                  {j.contractEndsThisYear && <span className="ui-warn-text">Fin de contrat cette année</span>}
                </div>
              </td>
              <td>
                <div className="ui-inline ui-wrap" style={{ gap: 4, maxWidth: 140 }}>
                  {j.statuts.map((s) => <StatusTag key={s} statut={s} />)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
