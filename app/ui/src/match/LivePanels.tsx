// Les blocs de l'écran « Match en direct » autour de la carte (maquette v2) :
// tableau de score, cartes des joueurs, fil du match. Ils ne lisent que l'état
// calculé depuis le flux (state.ts, feed.ts) et les composants d'interface communs.
import { PlayerPhoto, ProbabilityBar, RoleIcon, TeamLogo, type Role as UiRole } from '../components/ui';
import { Icon, type IconName } from '../components/Icon';
import type { FeedEntry, ObjectiveCamp } from './feed';
import { championIcon, dragonIcon, itemIcon, localAsset, spellIcon } from './icons';
import type { MatchReplay, Role, TeamIndex } from './replay';
import { formatClock, type ChampionView, type MatchState } from './state';

const UI_ROLE: Record<Role, UiRole> = { top: 'top', jungle: 'jungle', mid: 'mid', bot: 'adc', support: 'support' };
const TEAM_VAR = ['var(--team-us)', 'var(--team-them)'] as const;

/** 6 800 → « 6,8k » ; 640 → « 640 ». */
export function formatGold(n: number): string {
  if (Math.abs(n) < 1000) return String(Math.round(n));
  return `${(n / 1000).toFixed(1).replace('.', ',')}k`;
}

/** Ce que la base de départ sait d'une équipe (logo, photos). Facultatif. */
export interface TeamLook {
  logo?: string;
  photos: Record<string, string | undefined>;
}

export function ScoreBoard({ replay, state, looks }: { replay: MatchReplay; state: MatchState; looks: [TeamLook, TeamLook] }) {
  const [blue, red] = replay.teams;
  const o = state.objectives;
  return (
    <section className="card live-score" aria-label="Score">
      <div className="live-score__top">
        <div className="live-team">
          <TeamLogo name={blue.name} src={looks[0].logo} size={48} />
          <div><div className="live-team__name">{blue.name}</div><div className="muted live-team__side">Côté bleu</div></div>
        </div>
        <div className="live-score__mid">
          <div className="live-kills" data-testid="match-kills">
            <span style={{ color: TEAM_VAR[0] }}>{state.kills[0]}</span> <span className="muted">–</span> <span style={{ color: TEAM_VAR[1] }}>{state.kills[1]}</span>
          </div>
          <span className="live-clock" data-testid="match-clock">{formatClock(state.t)}</span>
          {state.winner !== null && <div className="live-winner" style={{ color: TEAM_VAR[state.winner] }}>Victoire {replay.teams[state.winner].tag}</div>}
        </div>
        <div className="live-team live-team--right">
          <TeamLogo name={red.name} src={looks[1].logo} size={48} />
          <div><div className="live-team__name">{red.name}</div><div className="muted live-team__side">Côté rouge</div></div>
        </div>
      </div>
      <div className="live-stats">
        <Stat label="Or" a={formatGold(state.gold[0])} b={formatGold(state.gold[1])} icon={<CoinIcon />} />
        <Stat label="Tours" a={state.towers[0]} b={state.towers[1]} icon={<TowerIcon />} />
        <Stat label="Dragons" a={o[0].dragons.length} b={o[1].dragons.length}
          icon={<DragonStack dragons={[...o[0].dragons, ...o[1].dragons]} />} />
        <Stat label="Larves" a={o[0].grubs} b={o[1].grubs} icon={<Objective src={localAsset('camps/voidgrubs.webp')} />} />
        <Stat label="Nashor" a={o[0].barons} b={o[1].barons} icon={<Objective src={localAsset('camps/baron.webp')} />} />
      </div>
      <ProbabilityBar us={state.blueWin * 100} showLabel height={8} />
    </section>
  );
}

function Stat({ label, a, b, icon }: { label: string; a: number | string; b: number | string; icon: React.ReactNode }) {
  return (
    <div className="live-stat" aria-label={`${label} : ${a} contre ${b}`}>
      <strong style={{ color: TEAM_VAR[0] }}>{a}</strong>
      <span className="muted live-stat__icon" title={label}>{icon}</span>
      <strong style={{ color: TEAM_VAR[1] }}>{b}</strong>
    </div>
  );
}

function Objective({ src, ring = 'var(--objective-void)' }: { src: string; ring?: string }) {
  return <img className="live-objective" src={src} alt="" width={20} height={20} style={{ borderColor: ring }} />;
}

function DragonStack({ dragons }: { dragons: string[] }) {
  const shown = dragons.length ? dragons : ['Infernal'];
  return (
    <span className="live-dragons">
      {shown.slice(0, 4).map((v, i) => (
        <Objective key={i} src={dragonIcon(v)} ring={v === 'Océan' ? 'var(--drake-ocean)' : 'var(--drake-infernal)'} />
      ))}
    </span>
  );
}

const CoinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <ellipse cx="12" cy="7" rx="7" ry="3" /><path d="M5 7v5c0 1.7 3.1 3 7 3s7-1.3 7-3V7M5 12v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5" />
  </svg>
);
/** Tour du bandeau, gemme neutre (maquette). */
const TowerIcon = () => (
  <svg width="14" height="18" viewBox="0 0 20 26" aria-hidden="true">
    <path d="M4 25 L6 12 L14 12 L16 25 Z" fill="var(--tower-body)" stroke="var(--bg-page)" strokeWidth="1.2" />
    <path d="M6 25 L7.5 14 L9 25 Z" fill="var(--tower-light)" />
    <path d="M3 12 L17 12 L15 9 L5 9 Z" fill="var(--tower-top)" stroke="var(--bg-page)" strokeWidth="1" />
    <path d="M10 1 L14 6 L10 10 L6 6 Z" fill="var(--text-muted)" stroke="var(--bg-page)" strokeWidth="1" />
  </svg>
);

/** Carte d'un joueur : champion et niveau, joueur, KDA, vie et mana, sorts, objets, or et écart avec son vis-à-vis. */
export function PlayerCard({ c, rival, photo }: { c: ChampionView; rival: ChampionView; photo?: string }) {
  const diff = c.gold - rival.gold;
  const ahead = diff >= 0;
  return (
    <article className={`live-player${c.alive ? '' : ' live-player--dead'}`} aria-label={`${c.player}, ${c.champion}`}>
      <div className="live-player__champ" style={{ borderColor: TEAM_VAR[c.team] }}>
        <img src={championIcon(c.champion)} alt={c.champion} width={44} height={44} />
        <span className="live-player__level" style={{ borderColor: TEAM_VAR[c.team] }}>{c.level}</span>
      </div>
      <div className="live-player__body">
        <div className="live-player__line">
          <span className="live-player__who">
            <RoleIcon role={UI_ROLE[c.role]} size={15} />
            <PlayerPhoto name={c.player} src={photo} size={22} />
            <strong>{c.player}</strong>
          </span>
          <span className="live-player__kda">
            {!c.alive && <span className="live-player__dead">MORT {formatClock(c.respawnIn ?? 0)}</span>}
            <span className="muted">{c.kills}/{c.deaths}/{c.assists} · {c.cs} cs</span>
          </span>
        </div>
        <div className="live-player__bars">
          <span className="live-bar live-bar--hp"><span style={{ width: `${Math.round(c.hp * 100)}%` }} /></span>
          <span className="live-bar live-bar--mana"><span style={{ width: `${Math.round((c.resource ?? 0) * 100)}%` }} /></span>
        </div>
        <div className="live-player__line">
          <span className="live-player__spells">
            {c.spells.map((s) => <img key={s} src={spellIcon(s)} alt="" width={16} height={16} />)}
          </span>
          <span className="live-player__items">
            {Array.from({ length: 6 }, (_, i) => c.items[i] !== undefined
              ? <img key={i} src={itemIcon(c.items[i])} alt="" width={18} height={18} />
              : <span key={i} className="live-player__slot" />)}
          </span>
          <span className="live-player__gold">
            <span className="live-player__total">{formatGold(c.gold)}</span>
            <span className="live-player__diff" title="Écart d'or avec son vis-à-vis"
              style={{ color: TEAM_VAR[ahead ? c.team : rival.team], borderColor: TEAM_VAR[ahead ? c.team : rival.team] }}>
              <img src={championIcon(rival.champion)} alt="" width={15} height={15} />
              {ahead ? '▲+' : '▼−'}{formatGold(Math.abs(diff))}
            </span>
          </span>
        </div>
      </div>
    </article>
  );
}

export function TeamColumn({ state, team, look }: { state: MatchState; team: TeamIndex; look: TeamLook }) {
  const mine = state.champions.filter((c) => c.team === team);
  const theirs = state.champions.filter((c) => c.team !== team);
  return (
    <section className="card live-column" aria-label={`Joueurs côté ${team === 0 ? 'bleu' : 'rouge'}`}>
      {mine.map((c) => (
        <PlayerCard key={c.index} c={c} rival={theirs.find((r) => r.role === c.role) ?? theirs[0]} photo={look.photos[c.player]} />
      ))}
    </section>
  );
}

/** Icône d'action entre le tueur et sa cible (épée, tour, œil…), à la couleur de l'équipe. */
function Action({ name, team }: { name: IconName; team: TeamIndex }) {
  return <span className="live-feed__action" style={{ color: TEAM_VAR[team] }}><Icon name={name} size={15} /></span>;
}

const Badge = ({ label, team }: { label: string; team: TeamIndex }) => (
  <span className="live-badge pulse" style={{ background: TEAM_VAR[team] }}>{label.toUpperCase()}</span>
);

function objectiveIcon(camp: ObjectiveCamp, variant: string | null): string {
  if (camp === 'dragon') return dragonIcon(variant ?? 'Infernal');
  return localAsset(camp === 'grubs' ? 'camps/voidgrubs.webp' : 'camps/baron.webp');
}

function objectiveRing(camp: ObjectiveCamp, variant: string | null): string {
  if (camp === 'dragon') return variant === 'Océan' ? 'var(--drake-ocean)' : 'var(--drake-infernal)';
  return 'var(--objective-void)';
}

/** Énumération à la française : « A », « A et B », « A, B et C ». */
function list(names: string[]): string {
  return names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} et ${names[names.length - 1]}`;
}

export function Feed({ entries, replay, limit = 9 }: { entries: FeedEntry[]; replay: MatchReplay; limit?: number }) {
  const champ = (i: number) => replay.champions[i];
  const square = (i: number, size = 26) => (
    <img className="live-feed__champ" src={championIcon(champ(i).champion)} alt={champ(i).champion} width={size} height={size} />
  );
  const dead = (i: number, k: number) => (
    <span key={k} className="live-dead" style={{ marginLeft: k ? -6 : 0 }}>
      <img src={championIcon(champ(i).champion)} alt={champ(i).champion} width={24} height={24} style={{ borderColor: TEAM_VAR[champ(i).team] }} />
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7 L17 17 M17 7 L7 17" /></svg>
    </span>
  );
  return (
    <section className="card live-feed">
      <h2 className="card__title">Fil du match</h2>
      {entries.length === 0 && <p className="muted live-feed__empty">Le match commence.</p>}
      <ol className="live-feed__list">
        {entries.slice(0, limit).map((e, n) => {
          const key = `${e.kind}-${e.t}-${n}`;
          const time = <span className="muted live-feed__time">{formatClock(e.t)}</span>;
          if (e.kind === 'teamfight') {
            const winner: TeamIndex = e.score[0] >= e.score[1] ? 0 : 1;
            return (
              <li key={key} className={`live-fight live-fight--${winner === 0 ? 'us' : 'them'}`}>
                <div className="live-fight__head">
                  {time}
                  <Badge label="Teamfight" team={winner} />
                  <strong>{e.title}</strong>
                  <span className="live-fight__score">
                    <span style={{ color: TEAM_VAR[0] }}>{e.score[0]}</span> – <span style={{ color: TEAM_VAR[1] }}>{e.score[1]}</span>
                  </span>
                </div>
                <div className="live-fight__row">
                  {([1, 0] as TeamIndex[]).filter((tm) => e.lost[tm].length).map((tm) => (
                    <span key={tm} className="live-fight__side">
                      <span className="muted">{replay.teams[tm].tag} perd</span>
                      <span className="live-dead-row">{e.lost[tm].map(dead)}</span>
                    </span>
                  ))}
                </div>
                {(e.multikills.length > 0 || e.objectives.length > 0) && (
                  <div className="live-fight__row live-fight__row--small">
                    {e.multikills.map((m, k) => (
                      <span key={`m${k}`} className="live-fight__side">
                        <img className="live-round" src={championIcon(champ(m.champion).champion)} alt="" width={18} height={18} />
                        <Badge label={m.label} team={champ(m.champion).team} />
                        <span>{champ(m.champion).player}</span>
                      </span>
                    ))}
                    {e.objectives.map((o, k) => (
                      <span key={`o${k}`} className="live-fight__side">
                        {(e.multikills.length > 0 || k > 0) && <span className="muted">·</span>}
                        <img className="live-round" src={objectiveIcon(o.camp, o.variant)} alt="" width={18} height={18}
                          style={{ border: `1.5px solid ${objectiveRing(o.camp, o.variant)}` }} />
                        <span>{o.name} pour {replay.teams[o.team].tag}</span>
                      </span>
                    ))}
                  </div>
                )}
              </li>
            );
          }
          if (e.kind === 'kill' && e.multikill && e.killer !== null) {
            return (
              <li key={key} className="live-feed__item live-feed__item--big">
                {time}
                <img className="live-feed__champ live-feed__champ--glow" src={championIcon(champ(e.killer).champion)} alt={champ(e.killer).champion}
                  width={30} height={30} style={{ borderColor: TEAM_VAR[e.team], boxShadow: `0 0 10px 2px color-mix(in srgb, ${TEAM_VAR[e.team]} 55%, transparent)` }} />
                <Action name="sword" team={e.team} />
                <span className="live-dead-row">{e.victims.map(dead)}</span>
                <span className="live-feed__text live-feed__text--stack">
                  <Badge label={e.multikill} team={e.team} />
                  <span>{champ(e.killer).player} élimine {list(e.victims.map((v) => champ(v).player))}</span>
                </span>
              </li>
            );
          }
          return (
            <li key={key} className="live-feed__item">
              {time}
              {e.kind === 'kill' && (
                <>
                  {e.killer !== null && square(e.killer)}
                  <Action name="sword" team={e.team} />
                  {square(e.victims[0])}
                  <span className="live-feed__text">
                    {e.killer !== null ? `${champ(e.killer).player} élimine ${champ(e.victims[0]).player}` : `${champ(e.victims[0]).player} est exécuté`}
                  </span>
                </>
              )}
              {e.kind === 'structure' && (
                <>
                  {e.by !== null && square(e.by)}
                  <Action name="tower" team={e.team} />
                  <span className="live-feed__text">{e.text}</span>
                </>
              )}
              {e.kind === 'ward' && (
                <>
                  {square(e.by)}
                  <Action name="eye" team={e.team} />
                  <span className="live-feed__text">{e.text}</span>
                </>
              )}
              {e.kind === 'objective' && (
                <>
                  {e.by !== null && square(e.by)}
                  <img className="live-round" src={objectiveIcon(e.camp, e.variant)} alt="" width={18} height={18}
                    style={{ border: `1.5px solid ${objectiveRing(e.camp, e.variant)}` }} />
                  <span className="live-feed__text">{e.text}</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
