// Fiche joueur (M2) : aperçu, attributs, champions, stats et contrat.
// Les notes viennent des vraies parties (Oracle's Elixir) ; ce que les stats
// ne mesurent pas s'affiche en fourchette « estimé ».
import { useEffect, useState } from 'react';
import { assetUrl, championIcon, getPlayer, type AttrScore, type PlayerDetail } from '../api';
import { ROLE_LABEL, RoleIcon } from '../components/RoleIcon';
import { ageAt, countryFr, fmt0, fmt1, kda, monthYear } from '../format';
import { ATTR_GROUPS, ATTR_LABEL, byKey, isRange, scoreText, tone } from '../ratings';

const GAME_START = '2026-01-05';

type Tab = 'apercu' | 'attributs' | 'champions' | 'stats' | 'contrat';
const TABS: [Tab, string][] = [
  ['apercu', 'Aperçu'],
  ['attributs', 'Attributs'],
  ['champions', 'Champions'],
  ['stats', 'Statistiques'],
  ['contrat', 'Contrat'],
];

/** Attributs du profil de l'aperçu (comme la maquette). */
const PROFILE = ['laning', 'mecanique', 'teamfight', 'farm', 'vision', 'lecture_carte'];

interface Props {
  personId: string;
  onBack: () => void;
}

export function Player({ personId, onBack }: Props) {
  const [loaded, setLoaded] = useState<{ id: string; detail: PlayerDetail | null } | null>(null);
  const [tab, setTab] = useState<Tab>('apercu');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    getPlayer(personId)
      .then((detail) => live && setLoaded({ id: personId, detail }))
      .catch((e) => live && setError(String(e)));
    return () => { live = false; };
  }, [personId]);

  const p = loaded?.id === personId ? loaded.detail : undefined;

  return (
    <>
      <div>
        <button type="button" className="btn btn--small" onClick={onBack}>← Effectif</button>
      </div>
      {error && <section className="card" role="alert">Lecture de la base impossible : {error}</section>}
      {p === null && <section className="card">Joueur introuvable.</section>}
      {p && (
        <>
          <Header p={p} />
          <div role="tablist" aria-label="Fiche joueur" className="tabs">
            {TABS.filter(([t]) => !p.member.isStaff || t === 'apercu' || t === 'contrat').map(([t, label]) => (
              <button key={t} type="button" role="tab" aria-selected={tab === t} className="btn" onClick={() => setTab(t)}>
                {label}
              </button>
            ))}
          </div>
          {tab === 'apercu' && <Overview p={p} />}
          {tab === 'attributs' && <Attributes p={p} />}
          {tab === 'champions' && <Champions p={p} />}
          {tab === 'stats' && <Stats p={p} />}
          {tab === 'contrat' && <Contract p={p} />}
        </>
      )}
    </>
  );
}

function Header({ p }: { p: PlayerDetail }) {
  const m = p.member;
  const age = ageAt(m.birthdate, GAME_START);
  const facts = [countryFr(m.country), age !== null ? `${age} ans` : null, p.teamId,
    m.contractEnd ? `Contrat : ${monthYear(m.contractEnd)}` : null].filter(Boolean);
  const r = m.rating;
  return (
    <section className="card player-head">
      {m.photoFile
        ? <img className="player-head__photo" src={assetUrl(m.photoFile)} alt="" width={96} height={96} />
        : <span className="player-head__photo person__photo--empty" aria-hidden="true">{m.handle.slice(0, 1)}</span>}
      <div className="player-head__id">
        <h1 className="h1">{m.handle}</h1>
        <div className="player-head__role">
          <span className="role"><RoleIcon role={m.role} /></span>
          <span>{ROLE_LABEL[m.role] ?? m.role}</span>
          {m.realName && <span className="muted">· {m.realName}</span>}
        </div>
        <p className="muted player-head__facts">{facts.join(' · ')}</p>
      </div>
      {r && (
        <div className="player-head__scores">
          <Big label="Niveau" value={scoreText({ value: r.level, low: r.levelLow, high: r.levelHigh }, 100)} tone="gold" />
          <Big label="Potentiel" value={String(Math.round(r.potential))} tone="blue" />
        </div>
      )}
    </section>
  );
}

function Big({ label, value, tone: t }: { label: string; value: string; tone: 'gold' | 'blue' }) {
  return (
    <div className="big-score">
      <span className="muted">{label}</span>
      <strong className={`big-score__value big-score__value--${t}`}>{value}</strong>
    </div>
  );
}

function RatingNote({ p }: { p: PlayerDetail }) {
  const r = p.member.rating;
  if (!r) return null;
  if (r.source !== 'stats') {
    return <p className="note">Aucune partie pro de ce joueur dans nos données (2014-2025) : ses notes sont estimées au niveau de sa ligue.</p>;
  }
  return (
    <p className="note">
      Niveau calculé sur {r.games} parties pro de 2014 à 2025 (les plus récentes comptent le plus) : la force réelle de ses équipes (Elo mondial), plus son apport face à ses coéquipiers. 75 = joueur moyen de LEC. Potentiel : progression observée des joueurs de son âge.
      Une fourchette signale une note incertaine ; « estimé » une qualité que les stats ne mesurent pas.
    </p>
  );
}

function Bar({ a }: { a: AttrScore }) {
  const range = isRange(a);
  return (
    <div className="attr">
      <span className="attr__label">{ATTR_LABEL[a.key] ?? a.key}</span>
      <span className="attr__track" aria-hidden="true">
        {range && <span className="attr__range" style={{ left: `${(a.low / 20) * 100}%`, width: `${((a.high - a.low) / 20) * 100}%` }} />}
        {!range && <span className={`attr__fill attr__fill--${tone(a.value)}`} style={{ width: `${(a.value / 20) * 100}%` }} />}
      </span>
      <span className={`attr__value attr__value--${range ? 'range' : tone(a.value)}`}>{scoreText(a)}</span>
    </div>
  );
}

function Overview({ p }: { p: PlayerDetail }) {
  if (p.member.isStaff) {
    return <section className="card"><p className="note">Les notes du staff arrivent avec la gestion du club.</p></section>;
  }
  const attrs = byKey(p.attributes);
  const s = p.member.stats2025;
  return (
    <>
      <div className="grid">
        <section className="card">
          <h2 className="card__title">Profil</h2>
          {PROFILE.map((k) => attrs.get(k)).filter((a): a is AttrScore => Boolean(a)).map((a) => <Bar key={a.key} a={a} />)}
        </section>
        <section className="card">
          <h2 className="card__title">Champions les plus joués en 2025</h2>
          <ChampionList p={p} limit={4} />
        </section>
        <section className="card">
          <h2 className="card__title">Saison 2025</h2>
          {s ? (
            <dl className="facts">
              <dt>Matchs</dt><dd>{s.games}</dd>
              <dt>Victoires</dt><dd>{Math.round((100 * s.wins) / s.games)} %</dd>
              <dt>KDA</dt><dd>{fmt1(kda(s))}</dd>
              <dt>CS/min</dt><dd>{fmt1(s.csPerMin)}</dd>
              <dt>Dégâts/min</dt><dd>{fmt0(s.damagePerMin)}</dd>
            </dl>
          ) : <p className="note">Aucun match pro en 2025.</p>}
        </section>
      </div>
      <RatingNote p={p} />
    </>
  );
}

function Attributes({ p }: { p: PlayerDetail }) {
  const attrs = byKey(p.attributes);
  return (
    <>
      <div className="grid">
        {ATTR_GROUPS.map((g) => (
          <section key={g.title} className="card">
            <h2 className="card__title">{g.title}</h2>
            {g.keys.map((k) => attrs.get(k)).filter((a): a is AttrScore => Boolean(a)).map((a) => (
              <div key={a.key}>
                <Bar a={a} />
                {a.estimated && <span className="attr__tag">estimé</span>}
              </div>
            ))}
          </section>
        ))}
      </div>
      <RatingNote p={p} />
    </>
  );
}

function ChampionList({ p, limit }: { p: PlayerDetail; limit?: number }) {
  const list = limit ? p.champions.slice(0, limit) : p.champions;
  if (list.length === 0) return <p className="note">Aucun champion joué en match pro en 2025.</p>;
  return (
    <ul className="champ-list">
      {list.map((c) => (
        <li key={c.champion}>
          <img src={championIcon(c.champion)} alt="" width={32} height={32} />
          <strong>{c.champion}</strong>
          <span className="muted">{c.games} parties · {Math.round((100 * c.wins) / c.games)} %</span>
        </li>
      ))}
    </ul>
  );
}

function Champions({ p }: { p: PlayerDetail }) {
  return (
    <section className="card">
      <h2 className="card__title">Champions joués en match pro en 2025</h2>
      <ChampionList p={p} />
    </section>
  );
}

function Stats({ p }: { p: PlayerDetail }) {
  if (p.tournaments.length === 0) return <section className="card"><p className="note">Aucun match pro en 2025.</p></section>;
  return (
    <section className="card card--table">
      <table className="table">
        <thead>
          <tr>
            <th>Tournoi 2025</th><th className="num">Matchs</th><th className="num">Victoires</th><th className="num">KDA</th>
            <th className="num">CS/min</th><th className="num">Or/min</th><th className="num">Dégâts/min</th><th className="num">Vision/min</th>
          </tr>
        </thead>
        <tbody>
          {p.tournaments.map((t) => (
            <tr key={t.tournament}>
              <td>{t.tournament}</td>
              <td className="num">{t.stats.games}</td>
              <td className="num">{Math.round((100 * t.stats.wins) / t.stats.games)} %</td>
              <td className="num">{fmt1(kda(t.stats))}</td>
              <td className="num">{fmt1(t.stats.csPerMin)}</td>
              <td className="num">{fmt0(t.stats.goldPerMin)}</td>
              <td className="num">{fmt0(t.stats.damagePerMin)}</td>
              <td className="num">{fmt1(t.visionPerMin)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function Contract({ p }: { p: PlayerDetail }) {
  const m = p.member;
  return (
    <section className="card">
      <dl className="facts">
        <dt>Club</dt><dd>{p.teamId}</dd>
        <dt>Fin de contrat</dt><dd>{monthYear(m.contractEnd) ?? 'inconnue'}</dd>
        <dt>Résidence</dt><dd>{p.residency ?? 'inconnue'}</dd>
        <dt>Salaire</dt><dd className="muted">arrive avec les finances (M11)</dd>
      </dl>
    </section>
  );
}
