// Effectif (M1) : les vrais joueurs et le staff d'un club, au 5 janvier 2026.
// Niveau, forme, moral et valeur arrivent avec les jalons de gestion.
import { useEffect, useMemo, useState } from 'react';
import { assetUrl, championIcon, getRoster, listTeams, type RosterMember, type Team } from '../api';
import { ROLE_LABEL, RoleIcon } from '../components/RoleIcon';
import { ageAt, countryFr, fmt0, fmt1, kda, monthYear } from '../format';

/** Date de début de partie, pour l'âge. */
const GAME_START = '2026-01-05';
const DEFAULT_TEAM = 'Karmine Corp';
const LEAGUE = 'LEC';

type Tab = 'joueurs' | 'staff';

export function Squad() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamId, setTeamId] = useState(DEFAULT_TEAM);
  const [loaded, setLoaded] = useState<{ teamId: string; members: RosterMember[] } | null>(null);
  const [tab, setTab] = useState<Tab>('joueurs');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listTeams(LEAGUE).then(setTeams).catch((e) => setError(String(e)));
  }, []);

  useEffect(() => {
    let live = true;
    getRoster(teamId)
      .then((members) => live && setLoaded({ teamId, members }))
      .catch((e) => live && setError(String(e)));
    return () => { live = false; };
  }, [teamId]);

  const team = teams.find((t) => t.id === teamId);
  const roster = loaded?.teamId === teamId ? loaded.members : null;
  const players = useMemo(() => roster?.filter((m) => !m.isStaff) ?? [], [roster]);
  const staff = useMemo(() => roster?.filter((m) => m.isStaff) ?? [], [roster]);

  return (
    <>
      <div className="squad__head">
        <div className="squad__title">
          {team?.logoFile && <img src={assetUrl(team.logoFile)} alt="" width={40} height={40} />}
          <h1 className="h1">Effectif</h1>
        </div>
        <label className="field">
          <span className="muted">Club</span>
          <select value={teamId} onChange={(e) => setTeamId(e.target.value)}>
            {teams.map((t) => <option key={t.id} value={t.id}>{t.id}</option>)}
          </select>
        </label>
      </div>

      {error && <section className="card" role="alert">Lecture de la base impossible : {error}</section>}

      <Summary players={players} />

      <div role="tablist" aria-label="Groupes" className="tabs">
        <button type="button" role="tab" aria-selected={tab === 'joueurs'} className="btn" onClick={() => setTab('joueurs')}>
          Joueurs <span className="muted">{players.length}</span>
        </button>
        <button type="button" role="tab" aria-selected={tab === 'staff'} className="btn" onClick={() => setTab('staff')}>
          Staff <span className="muted">{staff.length}</span>
        </button>
      </div>

      <section className="card card--table" aria-busy={roster === null}>
        {tab === 'joueurs' ? <PlayersTable players={players} /> : <StaffTable staff={staff} />}
      </section>
      <p className="note">
        Effectif de départ et contrats : Leaguepedia. Stats : matchs pro 2025 (tous tournois). Le niveau, la forme et la valeur arrivent aux jalons suivants.
      </p>
    </>
  );
}

function Summary({ players }: { players: RosterMember[] }) {
  const ages = players.map((p) => ageAt(p.birthdate, GAME_START)).filter((a): a is number => a !== null);
  const avgAge = ages.length ? ages.reduce((a, b) => a + b, 0) / ages.length : null;
  const games = players.reduce((n, p) => n + (p.stats2025?.games ?? 0), 0);
  const nations = new Set(players.map((p) => p.country).filter(Boolean)).size;
  const ending = players.filter((p) => p.contractEnd?.startsWith('2026')).length;
  return (
    <div className="kpis">
      <Kpi label="Âge moyen" value={avgAge === null ? '–' : `${fmt1(avgAge)} ans`} sub="au 5 janvier 2026" />
      <Kpi label="Matchs pro en 2025" value={fmt0(games)} sub="cumul des joueurs" />
      <Kpi label="Nationalités" value={String(nations)} sub={`${players.length} joueurs`} />
      <Kpi label="Contrats finissant en 2026" value={String(ending)} sub="selon Leaguepedia" tone={ending > 0 ? 'warn' : undefined} />
    </div>
  );
}

function Kpi({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: 'warn' }) {
  return (
    <div className="card kpi">
      <span className="muted kpi__label">{label}</span>
      <strong className={tone === 'warn' ? 'kpi__value kpi__value--warn' : 'kpi__value'}>{value}</strong>
      <span className="muted kpi__label">{sub}</span>
    </div>
  );
}

function Person({ m }: { m: RosterMember }) {
  const country = countryFr(m.country);
  return (
    <div className="person">
      {m.photoFile
        ? <img className="person__photo" src={assetUrl(m.photoFile)} alt="" width={40} height={40} />
        : <span className="person__photo person__photo--empty" aria-hidden="true">{m.handle.slice(0, 1)}</span>}
      <div className="person__names">
        <strong>{m.handle}</strong>
        <span className="muted">{[country, m.realName].filter(Boolean).join(' · ')}</span>
      </div>
    </div>
  );
}

function PlayersTable({ players }: { players: RosterMember[] }) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Poste</th><th>Joueur</th><th>Âge</th><th>Champions 2025</th>
          <th className="num">Matchs</th><th className="num">Victoires</th><th className="num">KDA</th>
          <th className="num">CS/min</th><th className="num">Dégâts/min</th><th>Fin de contrat</th>
        </tr>
      </thead>
      <tbody>
        {players.map((m) => {
          const s = m.stats2025;
          return (
            <tr key={`${m.personId}-${m.role}`}>
              <td><span className="role">{<RoleIcon role={m.role} />}</span></td>
              <td><Person m={m} /></td>
              <td>{ageAt(m.birthdate, GAME_START) ?? '–'}</td>
              <td>
                <div className="champs">
                  {m.topChampions.map((c) => (
                    <img key={c} src={championIcon(c)} alt={c} title={c} width={24} height={24} />
                  ))}
                </div>
              </td>
              <td className="num">{s ? s.games : '–'}</td>
              <td className="num">{s ? `${Math.round((100 * s.wins) / s.games)} %` : '–'}</td>
              <td className="num">{s ? fmt1(kda(s)) : '–'}</td>
              <td className="num">{s ? fmt1(s.csPerMin) : '–'}</td>
              <td className="num">{s ? fmt0(s.damagePerMin) : '–'}</td>
              <td>{monthYear(m.contractEnd) ?? <span className="muted">inconnue</span>}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function StaffTable({ staff }: { staff: RosterMember[] }) {
  return (
    <table className="table">
      <thead>
        <tr><th>Rôle</th><th>Nom</th><th>Âge</th><th>Fin de contrat</th></tr>
      </thead>
      <tbody>
        {staff.map((m) => (
          <tr key={`${m.personId}-${m.role}`}>
            <td>{ROLE_LABEL[m.role] ?? m.role}</td>
            <td><Person m={m} /></td>
            <td>{ageAt(m.birthdate, GAME_START) ?? '–'}</td>
            <td>{monthYear(m.contractEnd) ?? <span className="muted">inconnue</span>}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
