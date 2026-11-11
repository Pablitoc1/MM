import {
  Alert, AttributeBar, Card, ChampionIcon, ChampionMastery, ChemistryRow, Flag, FormChart, FormStreak,
  GoldDiffChart, InboxItem, KeyMoments, KindLabel, MiniGauge, PlayerHeader, PlayerPhoto, ProbabilityBar,
  RadarChart, ROLES, RoleBadge, RoleIcon, SquadTable, StaffQuote, StaffRow, Stars, StatCard, StateGauge,
  StatusTag, STATUTS, TeamLogo, toSquadPlayer, toStaff, formatNombre, type SquadPlayer, type Statut,
} from '../components/ui';
import { useEffect, useState } from 'react';
import { getRoster } from '../api';
import {
  CHAMPIONS_CALISTE, ECART_OR, EFFECTIF_SECOURS, EVENEMENTS_OR, EXTRAS, FORME_CALISTE, G2, KC, MOMENTS, RADAR_CALISTE,
} from './exemple';
import './vitrine.css';
import { Ecrans, ECRANS, useEcran } from './ecrans';

function Section({ id, title, milestone, children }: { id: string; title: string; milestone: string; children: React.ReactNode }) {
  return (
    <section className="vt-section" aria-labelledby={id}>
      <div className="vt-section__head">
        <h2 id={id} className="vt-h2">{title}</h2>
        <span className="vt-milestone">Servira en {milestone}</span>
      </div>
      {children}
    </section>
  );
}

interface StaffMember { id: string; name: string; realName: string; role: string; photo?: string }

/** Effectif et staff réels de Karmine Corp (base de M1), avec les valeurs d'exemple. */
function useKarmine(): { players: SquadPlayer[]; staff: StaffMember[]; fromBase: boolean } {
  const [data, setData] = useState({ players: EFFECTIF_SECOURS, staff: [] as StaffMember[], fromBase: false });
  useEffect(() => {
    let alive = true;
    getRoster(KC.name).then((roster) => {
      const players = roster
        .map((m) => (EXTRAS[m.handle] ? toSquadPlayer(m, EXTRAS[m.handle]) : null))
        .filter((p): p is SquadPlayer => p !== null);
      const staff = roster.filter((m) => m.isStaff).map(toStaff);
      if (alive && players.length) setData({ players, staff, fromBase: true });
    }).catch(() => { /* hors base : l'effectif de secours reste affiché */ });
    return () => { alive = false; };
  }, []);
  return data;
}

function Composants() {
  const { players: EFFECTIF, staff, fromBase } = useKarmine();
  const caliste = EFFECTIF.find((j) => j.pseudo === 'Caliste') ?? EFFECTIF[0];
  const photoOf = (pseudo: string) => EFFECTIF.find((j) => j.pseudo === pseudo)?.photo;
  return (
    <main className="vt">
      <header className="vt-head">
        <h1 className="vt-h1">Vitrine des composants</h1>
        <p className="muted">
          Les briques des maquettes v2, branchées sur la base de M1 quand c'est possible. Réel : joueurs et staff
          de Karmine Corp, photos, logos, pays, âges, fins de contrat et champions les plus joués. Exemples en
          attendant leurs jalons : niveau (M2), forme, moral et fatigue (M10), valeur (M11), courbes de match (M6).
        </p>
        <p className="muted" data-testid="source">{fromBase ? 'Source : base de départ (M1).' : 'Base indisponible : données de secours.'}</p>
      </header>

      <Section id="s-petits" title="Petits éléments" milestone="tous les écrans">
        <div className="vt-grid">
          <Card title="Rôles">
            <div className="vt-line">{ROLES.map((r) => <RoleIcon key={r} role={r} size={22} />)}</div>
            <div className="vt-line">{ROLES.map((r) => <RoleBadge key={r} role={r} />)}</div>
          </Card>
          <Card title="Drapeaux">
            <div className="vt-line">
              {['FR', 'KR', 'SE', 'US', 'DE', 'ES', 'DK', 'PL', 'BE', 'IT', 'NL', 'GR'].map((c) => (
                <span key={c} className="ui-inline muted" style={{ fontSize: 12, gap: 4 }}><Flag code={c} width={22} />{c}</span>
              ))}
            </div>
          </Card>
          <Card title="Étoiles Niveau / Potentiel">
            <div className="vt-col">{[5, 4.5, 3.5, 2, 0.5].map((v) => <Stars key={v} value={v} />)}</div>
          </Card>
          <Card title="Statuts et tags">
            <div className="vt-line">{(Object.keys(STATUTS) as Statut[]).map((s) => <StatusTag key={s} statut={s} />)}</div>
            <div className="vt-line">
              <StatusTag label="Convoité : 3 clubs" glyph="eye" tone="bad" />
              {['Compétiteur', 'Ambitieux', 'Sensible à la pression'].map((t) => <StatusTag key={t} label={t} plain />)}
            </div>
            <div className="vt-line">
              <KindLabel tone="mid">ANALYSTE</KindLabel><KindLabel tone="bad">JOUEUR</KindLabel>
              <KindLabel tone="good">PATCH 26.2</KindLabel><KindLabel tone="gold">DIRECTION</KindLabel>
              <KindLabel>MARCHÉ</KindLabel>
            </div>
          </Card>
          <Card title="Forme et images">
            <div className="vt-line"><FormStreak results={['V', 'V', 'D', 'V', 'V']} /><FormStreak results={['D', 'V', 'D', 'V', 'D']} /></div>
            <div className="vt-line">
              {EFFECTIF.map((j) => <PlayerPhoto key={j.id} name={j.pseudo} src={j.photo} size={44}
                ring={j.fatigue > 50 ? 'var(--team-them)' : 'var(--team-us)'} />)}
            </div>
            <div className="vt-line">
              {CHAMPIONS_CALISTE.map((c) => <ChampionIcon key={c.name} name={c.name} src={c.icon} size={32} />)}
              <ChampionIcon name="Sans image" />
              <TeamLogo name={KC.name} src={KC.logo} /><TeamLogo name={G2.name} src={G2.logo} />
            </div>
          </Card>
        </div>
      </Section>

      <Section id="s-jauges" title="Jauges et barres" milestone="M2, M8 et M10">
        <div className="vt-grid">
          <Card title="État du joueur">
            <div className="vt-line" style={{ alignItems: 'stretch' }}>
              <StateGauge label="Forme" percent={88} valueText="Excellente" tone="good" trend="up" />
              <StateGauge label="Moral" percent={72} valueText="Bon" tone="good" trend="flat" />
              <StateGauge label="Fatigue" percent={68} valueText="68 %" tone="bad" trend="up" trendTone="bad" />
              <StateGauge label="Confiance" percent={80} valueText="Haute" tone="good" trend="up" />
            </div>
            <Alert>Risque de burn-out modéré si la charge reste à ce niveau 2 semaines.</Alert>
          </Card>
          <Card title="Attributs (sur 20)">
            <span className="ui-section-label">Mécanique</span>
            <AttributeBar name="Mécanique" value={17} trend="up" />
            <AttributeBar name="Teamfight" value={15} />
            <AttributeBar name="Shotcalling" value={9} trend="down" />
            <span className="ui-section-label">Mental (estimé par le staff, fourchette)</span>
            <AttributeBar name="Sang-froid" range={[12, 15]} />
            <AttributeBar name="Grands matchs" />
          </Card>
          <Card title="Barres compactes et pronostic">
            <div className="vt-col" style={{ width: 160 }}>
              <MiniGauge label="Moral" percent={45} valueText="45" tone="bad" />
              <MiniGauge label="Fatigue" percent={30} valueText="30 %" tone="good" />
            </div>
            <div style={{ marginTop: 16 }}><ProbabilityBar us={46} /></div>
          </Card>
        </div>
      </Section>

      <Section id="s-blocs" title="Blocs" milestone="M1, M2, M10 et M11">
        <PlayerHeader pseudo={caliste.pseudo} role={caliste.role} rank={1} country={caliste.country} age={caliste.age}
          club={KC} photo={caliste.photo} since="nov. 2024" contractEnd={caliste.contractEnd} statuts={['enFeu', 'pepite', 'fatigue', 'intransferable']}
          extraTags={<StatusTag label="Convoité : 3 clubs" glyph="eye" tone="bad" />}
          level={84} potential={93} value={1_800_000} salary={32_000} />
        <div className="vt-line" style={{ alignItems: 'stretch' }}>
          <StatCard label="Niveau moyen" value="★ 3,8 / 5" sub="2e de la LEC" tone="gold" />
          <StatCard label="Âge moyen" value={`${formatNombre(EFFECTIF.reduce((a, j) => a + j.age, 0) / EFFECTIF.length, 1)} ans`} sub="Au 5 janvier 2026" />
          <StatCard label="Masse salariale" value="1,6 M€" sub="84 % du plafond fixé" tone="bad" />
          <StatCard label="Valeur de l'effectif" value="5,45 M€" sub="En hausse de 12 %" tone="good" />
        </div>
        <SquadTable players={EFFECTIF} />
        <div className="vt-grid">
          <Card title="Champions">
            {CHAMPIONS_CALISTE.map((c) => (
              <ChampionMastery key={c.name} champion={c.name} icon={c.icon} games={c.games} winrate={c.winrate} mastery={c.mastery} />
            ))}
          </Card>
          <Card title="Chimie avec l'équipe">
            <ChemistryRow name="Busio" photo={photoOf('Busio')} role="support" percent={92} />
            <ChemistryRow name="Yike" photo={photoOf('Yike')} role="jungle" percent={74} />
            <ChemistryRow name="kyeahoo" photo={photoOf('kyeahoo')} role="mid" percent={58} />
            <ChemistryRow name="Canna" photo={photoOf('Canna')} role="top" percent={35} />
          </Card>
          <Card title="Staff" action={<a href="#s-blocs" style={{ fontSize: 12 }}>Gérer</a>}>
            {staff.length > 0
              ? staff.map((m) => <StaffRow key={m.id} initials="CO" role={m.role} name={m.name} photo={m.photo} />)
              : <>
                <StaffRow initials="HC" role="Coach principal" stars={4.5} />
                <StaffRow initials="AN" role="Analyste" stars={3.5} />
                <StaffRow initials="PS" role="Psychologue" stars={3} />
              </>}
          </Card>
          <Card title="Avis du staff">
            <div className="vt-col" style={{ gap: 10 }}>
              <StaffQuote initials="HC" role="Coach principal" quote="Un talent rare. Il doit progresser sur la vision et ses placements en fin de partie." />
              <StaffQuote initials="PS" role="Psychologue" tone="bad" quote="Fatigue en hausse. Une journée de repos avant G2 serait utile." />
            </div>
          </Card>
        </div>
        <Card title="Boîte de réception">
          <InboxItem unread kind="ANALYSTE" kindTone="mid" title="Rapport sur G2 Esports prêt" time="09:12"
            visual={<TeamLogo name={G2.name} src={G2.logo} size={38} />}
            body="Caps joue surtout Azir et Taliyah. G2 bannit souvent les champions de Canna." />
          <InboxItem unread kind="JOUEUR" kindTone="bad" title="Caliste demande une journée de repos" time="08:40"
            visual={<PlayerPhoto name="Caliste" src={photoOf('Caliste')} size={38} ring="var(--team-them)" />}
            body="Il trouve les scrims trop nombreux et se dit fatigué.">
            <div className="vt-line">
              <span style={{ width: 170 }}><MiniGauge label="Fatigue" percent={68} valueText="68 %" tone="bad" labelWidth={44} /></span>
              <button type="button" className="ui-btn">Accorder le repos</button>
              <button type="button" className="ui-btn">Refuser</button>
            </div>
          </InboxItem>
          <InboxItem kind="MARCHÉ" title="Rumeur : un club LCK s'intéresse à Yike" time="Sam."
            visual={<PlayerPhoto name="Yike" src={photoOf('Yike')} size={38} />}
            body="Selon la presse coréenne, une offre pourrait arriver en mai." />
        </Card>
      </Section>

      <Section id="s-graphes" title="Graphiques" milestone="M2, M6 et M8">
        <div className="vt-grid vt-grid--wide">
          <Card title="Écart d'or minute par minute">
            <GoldDiffChart values={ECART_OR} us="KC" them="G2" events={EVENEMENTS_OR} />
          </Card>
          <Card title="Moments clés"><KeyMoments moments={MOMENTS} /></Card>
        </div>
        <div className="vt-grid">
          <Card title="Forme : 10 derniers matchs"><FormChart points={FORME_CALISTE} /></Card>
          <Card title="Profil"><RadarChart axes={RADAR_CALISTE} name="Caliste" referenceName="Moyenne ADC LEC" /></Card>
        </div>
      </Section>
    </main>
  );
}

/** Vitrine : les composants, puis chaque écran de la maquette v2 (lien #accueil, #effectif…). */
export function Vitrine() {
  const ecran = useEcran();
  return (
    <>
      <nav className="vt-tabs" aria-label="Pages de la vitrine">
        <a href="#composants" aria-current={ecran === null ? 'page' : undefined}>Composants</a>
        {ECRANS.map((e) => (
          <a key={e.id} href={`#${e.id}`} aria-current={ecran === e.id ? 'page' : undefined}>{e.label}</a>
        ))}
      </nav>
      {ecran === null ? <Composants /> : <Ecrans id={ecran} />}
    </>
  );
}
