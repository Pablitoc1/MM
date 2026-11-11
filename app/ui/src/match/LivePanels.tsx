// Les blocs de l'écran « Match en direct » autour de la carte (maquette v2) :
// tableau de score, cartes des joueurs, fil du match. Ils ne lisent que l'état
// calculé depuis le flux (state.ts, feed.ts) et les composants d'interface communs.
import { ChampionIcon, PlayerPhoto, ProbabilityBar, RoleIcon, TeamLogo, type Role as UiRole } from '../components/ui';
import type { FeedEntry } from './feed';
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
      <ProbabilityBar us={state.blueWin * 100} />
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
const TowerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 20 26" aria-hidden="true">
    <path d="M4 25 L6 12 L14 12 L16 25 Z" fill="currentColor" /><path d="M10 1 L14 6 L10 10 L6 6 Z" fill="currentColor" />
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

const KillIcon = ({ team }: { team: TeamIndex }) => (
  <span className="live-feed__arrow" style={{ color: TEAM_VAR[team] }} aria-hidden="true">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M14.5 17.5 3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2" /></svg>
  </span>
);

export function Feed({ entries, replay }: { entries: FeedEntry[]; replay: MatchReplay }) {
  const champ = (i: number) => replay.champions[i];
  const icon = (i: number, size = 26) => <ChampionIcon name={champ(i).champion} src={championIcon(champ(i).champion)} size={size} />;
  return (
    <section className="card live-feed">
      <h2 className="card__title">Fil du match</h2>
      {entries.length === 0 && <p className="muted live-feed__empty">Le match commence.</p>}
      <ol className="live-feed__list">
        {entries.slice(0, 14).map((e, n) => (
          <li key={`${e.kind}-${e.t}-${n}`} className="live-feed__item">
            <span className="muted live-feed__time">{formatClock(e.t)}</span>
            {e.kind === 'kill' && (
              <>
                {e.killer !== null && icon(e.killer)}
                <KillIcon team={e.team} />
                {icon(e.victim)}
                <span className="live-feed__text">
                  {e.killer !== null ? `${champ(e.killer).player} élimine ${champ(e.victim).player}` : `${champ(e.victim).player} est exécuté`}
                  {e.multikill && <span className="live-badge" style={{ background: TEAM_VAR[e.team] }}>{e.multikill.toUpperCase()}</span>}
                </span>
              </>
            )}
            {e.kind === 'structure' && (
              <>
                <span className="live-feed__glyph" style={{ color: TEAM_VAR[e.team] }}><TowerIcon /></span>
                <span className="live-feed__text">{e.text}</span>
              </>
            )}
            {e.kind === 'objective' && (
              <>
                {e.by !== null && icon(e.by)}
                <img className="live-objective" alt="" width={22} height={22}
                  src={e.camp === 'dragon' ? dragonIcon(e.variant ?? 'Infernal') : localAsset(e.camp === 'grubs' ? 'camps/voidgrubs.webp' : 'camps/baron.webp')}
                  style={{ borderColor: TEAM_VAR[e.team] }} />
                <span className="live-feed__text">{e.text}</span>
              </>
            )}
            {e.kind === 'teamfight' && (
              <div className="live-fight">
                <div className="live-fight__head">
                  <span className="live-badge" style={{ background: TEAM_VAR[e.score[0] >= e.score[1] ? 0 : 1] }}>TEAMFIGHT</span>
                  <strong className="live-fight__score">
                    <span style={{ color: TEAM_VAR[0] }}>{e.score[0]}</span> – <span style={{ color: TEAM_VAR[1] }}>{e.score[1]}</span>
                  </strong>
                </div>
                <div className="live-fight__lost">
                  {([0, 1] as TeamIndex[]).filter((tm) => e.lost[tm].length).map((tm) => (
                    <span key={tm} className="live-fight__side">
                      <span className="muted">{replay.teams[tm].tag} perd</span>
                      {e.lost[tm].map((v, k) => (
                        <span key={k} className="live-fight__dead" style={{ borderColor: TEAM_VAR[tm] }}>{icon(v, 22)}</span>
                      ))}
                    </span>
                  ))}
                </div>
                {e.multikills.map((m) => (
                  <div key={m.champion} className="live-fight__multi">
                    {icon(m.champion, 18)}
                    <span className="live-badge" style={{ background: TEAM_VAR[champ(m.champion).team] }}>{m.label.toUpperCase()}</span>
                    <span>{champ(m.champion).player}</span>
                  </div>
                ))}
              </div>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
