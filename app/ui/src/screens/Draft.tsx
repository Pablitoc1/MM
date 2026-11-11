// Écran « Draft » (maquette v2), branché sur la draft du Rust : règles officielles,
// méta du patch, IA adverse et conseil du coach (notes 011 et 012). Le club du joueur
// est à gauche. 30 s par choix : à zéro, le coach choisit à sa place.
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  WEB_DRAFT_NOTE, assetUrl, championIcon, draftDelegate, draftPlay, draftStart, draftView, getRoster, isTauriApp,
  listTeams, type CompAnalysis, type DraftCard, type DraftRole, type DraftSide, type DraftSlot, type DraftView,
} from '../api';
import { Icon } from '../components/Icon';
import { RoleIcon, type Role } from '../components/ui';

/** Match de démonstration tant que le calendrier n'existe pas (M9). */
export const DRAFT_BLUE = 'Karmine Corp';
export const DRAFT_RED = 'G2 Esports';
const SECONDS = 30;

const UI_ROLE: Record<DraftRole, Role> = { top: 'top', jungle: 'jungle', mid: 'mid', bot: 'adc', support: 'support' };
const ROLE_NAME: Record<DraftRole, string> = { top: 'Top', jungle: 'Jungle', mid: 'Mid', bot: 'ADC', support: 'Support' };
const ROLES: DraftRole[] = ['top', 'jungle', 'mid', 'bot', 'support'];
/** Ordre des styles de la maquette, en index de `CompAnalysis.styles`. */
const STYLE_ROWS: [string, number][] = [['Engage', 0], ['Teamfight', 4], ['Peel', 2], ['Poke', 1], ['Split push', 3]];
const LETTER_COLOR: Record<DraftCard['letter'], string> = {
  A: 'var(--team-us)', B: 'var(--accent-blue)', C: 'var(--accent-gold)', D: 'var(--team-them)',
};

interface Look { name: string; short: string; logo?: string; photos: Record<string, string> }

/** Nom court, logo et photos des deux clubs (base de départ, M1). */
function useLooks(view: DraftView | null): Record<string, Look> {
  const [looks, setLooks] = useState<Record<string, Look>>({});
  const blue = view?.blueTeam;
  const red = view?.redTeam;
  useEffect(() => {
    if (!blue || !red) return;
    let live = true;
    (async () => {
      const teams = await listTeams('LEC');
      const out: Record<string, Look> = {};
      for (const id of [blue, red]) {
        const t = teams.find((x) => x.id === id);
        const photos: Record<string, string> = {};
        for (const m of await getRoster(id)) if (m.photoFile) photos[m.personId] = assetUrl(m.photoFile);
        out[id] = { name: id, short: t?.short ?? id, logo: t?.logoFile ? assetUrl(t.logoFile) : undefined, photos };
      }
      if (live) setLooks(out);
    })().catch((e) => console.error('logos et photos', e));
    return () => { live = false; };
  }, [blue, red]);
  return looks;
}

const lookOf = (looks: Record<string, Look>, id: string): Look => looks[id] ?? { name: id, short: id, photos: {} };
const sideName = (s: DraftSide) => (s === 'blue' ? 'bleu' : 'rouge');
const pct = (v: number) => `${Math.round(v * 100)}%`;

export function Draft({ onExit }: { onExit?: () => void }) {
  const [view, setView] = useState<DraftView | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Sélection et chrono valent pour un tour : au tour suivant, retour au conseil et à 30 s.
  const [picked, setPicked] = useState<{ turn: number; champion: string } | null>(null);
  const [clock, setClock] = useState({ turn: -1, left: SECONDS });
  const clockRef = useRef(clock);
  const looks = useLooks(view);

  const run = useCallback((p: Promise<DraftView>) => {
    p.then((v) => { setView(v); setError(null); })
      .catch((e: unknown) => setError(String(e instanceof Error ? e.message : e)));
  }, []);

  useEffect(() => { run(draftStart(DRAFT_BLUE, DRAFT_RED, 'blue', 1)); }, [run]);

  const turnIndex = view?.turn?.index ?? -1;
  const userTurn = view?.turn?.side === view?.user;
  const selected = picked?.turn === turnIndex ? picked.champion : null;
  const setSelected = (champion: string | null) => setPicked(champion ? { turn: turnIndex, champion } : null);
  const left = clock.turn === turnIndex ? clock.left : SECONDS;
  useEffect(() => {
    if (!userTurn) return;
    const id = window.setInterval(() => {
      const c = clockRef.current;
      const next = Math.max((c.turn === turnIndex ? c.left : SECONDS) - 1, 0);
      clockRef.current = { turn: turnIndex, left: next };
      setClock(clockRef.current);
      // Temps écoulé : le coach choisit (une seule fois par tour).
      if (next === 0 && c.left !== 0) run(draftDelegate());
    }, 1000);
    return () => window.clearInterval(id);
  }, [turnIndex, userTurn, run]);

  if (!view) {
    return <div className="m-muted" style={{ padding: '24px' }}>{error ?? 'Préparation de la draft…'}</div>;
  }

  const us = view.user;
  const them: DraftSide = us === 'blue' ? 'red' : 'blue';
  const usId = us === 'blue' ? view.blueTeam : view.redTeam;
  const themId = us === 'blue' ? view.redTeam : view.blueTeam;
  const usLook = lookOf(looks, usId);
  const themLook = lookOf(looks, themId);
  const slots = (s: DraftSide) => (s === 'blue' ? view.blue : view.red);
  const bans = (s: DraftSide) => (s === 'blue' ? view.blueBans : view.redBans);
  const lookSide = (s: DraftSide) => (s === us ? usLook : themLook);
  const turn = view.turn;
  const banTurn = turn?.kind === 'ban';
  const preview = selected ?? view.preview;
  const previewName = view.cards.find((c) => c.champion === preview)?.name ?? view.advice?.name ?? preview;
  const choice = selected ?? view.advice?.champion ?? null;
  const choiceName = view.cards.find((c) => c.champion === choice)?.name ?? view.advice?.name ?? choice;

  const select = (c: DraftCard) => {
    if (!c.available) return;
    setSelected(c.champion);
    if (!banTurn) run(draftView(view.focus, c.champion));
  };
  const focus = (r: DraftRole) => { setSelected(null); run(draftView(r, null)); };
  const validate = () => {
    if (!choice) return;
    // Champion choisi dans la grille : au poste regardé ; conseil : au poste du conseil.
    const role = banTurn ? null : selected ? view.focus : (view.advice?.role ?? view.focus);
    run(draftPlay(choice, role));
  };

  const status = turn
    ? `${lookSide(turn.side).short} ${turn.kind === 'ban' ? 'BANNIT' : 'CHOISIT'}${turn.role ? ` · ${ROLE_NAME[turn.role].toUpperCase()}` : ''}`
    : 'DRAFT TERMINÉE';
  const nextText = view.next
    ? `Ensuite : ${lookSide(view.next.side).short} ${view.next.kind === 'ban' ? 'bannit' : 'choisit'} ${view.next.count} champion${view.next.count > 1 ? 's' : ''}`
    : turn ? 'Dernier choix de la draft' : 'Les compositions partent au moteur de match';
  const usFirst = us === 'blue';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', color: 'var(--text)', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '10px 24px', background: 'var(--bg-bar)', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {onExit && <button type="button" className="btn live-top__back" onClick={onExit} aria-label="Quitter la draft"><Icon name="back" size={16} /></button>}
          <TeamHead look={usLook} sub={`Côté ${sideName(us)}${usFirst ? ' · 1er choix' : ''}`} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <span className="m-muted" style={{ fontSize: '12px' }}>LEC Versus · Bo1 · Patch {view.patch}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600' }}>{turn?.phase ?? 'Draft terminée'}</span>
            <Pill text={status} color={turn && turn.side === us ? 'var(--team-us)' : 'var(--team-them)'} pulse={!!turn} />
            {turn && (
              <span style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '24px', fontWeight: '700', color: 'var(--team-us)' }} aria-label="Temps restant">
                0:{String(Math.max(left, 0)).padStart(2, '0')}
              </span>
            )}
          </div>
          <span style={{ width: '220px' }}>
            <span style={{ display: 'block', width: '100%', height: '4px', borderRadius: '2px', background: 'var(--border)', overflow: 'hidden' }}>
              <span style={{ display: 'block', height: '100%', width: turn ? pct(left / SECONDS) : '0%', background: 'var(--team-us)', transition: 'width 1s linear' }} />
            </span>
          </span>
        </div>
        <TeamHead look={themLook} sub={`Côté ${sideName(them)}${usFirst ? '' : ' · 1er choix'}`} right />
      </header>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 24px', gap: '16px', flexWrap: 'wrap', borderBottom: '1px solid var(--border)' }}>
        <BanRow bans={bans(us)} color="var(--team-us)" />
        <div className="m-muted" style={{ display: 'flex', gap: '6px', fontSize: '11px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 6l8 6-8 6zM12 6l8 6-8 6z" />
            </svg>
            {` ${nextText}`}
          </span>
        </div>
        <BanRow bans={bans(them)} color="var(--team-them)" right />
      </div>

      <div style={{ display: 'flex', gap: '16px', padding: '16px 24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '0' }}>
          {slots(us).map((s) => (
            <SlotCard key={s.role} slot={s} photo={usLook.photos[s.personId]} preview={s.current ? preview : null} previewName={previewName} />
          ))}
        </div>

        <div style={{ flex: '2 1 560px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <section className="m-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <h2 className="m-h2" style={{ margin: '0' }}>
                {banTurn ? 'Bans conseillés' : `Champions de ${view.focusHandle} · ${ROLE_NAME[view.focus]}`}
              </h2>
              {!banTurn && (
                <div style={{ display: 'flex', gap: '4px' }}>
                  {ROLES.map((r) => {
                    const taken = slots(us).find((s) => s.role === r)?.champion != null;
                    return (
                      <button key={r} type="button" className={`m-btn${view.focus === r ? ' m-on' : ''}`} aria-label={ROLE_NAME[r]}
                        disabled={taken || !turn} onClick={() => focus(r)}
                        style={{ padding: '0 10px', minHeight: '34px', display: 'flex', alignItems: 'center', color: 'var(--accent-gold)', opacity: taken ? 0.4 : 1 }}>
                        <RoleIcon role={UI_ROLE[r]} />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="m-muted" style={{ display: 'flex', gap: '10px', fontSize: '11px', marginBottom: '10px', flexWrap: 'wrap' }}>
              {banTurn ? 'Rang sur le patch : ' : 'Maîtrise : '}
              {(['A', 'B', 'C', 'D'] as const).map((l) => <span key={l} style={{ color: LETTER_COLOR[l], fontWeight: '700' }}>{l}</span>)}
              {banTurn ? ' · V = victoires sur le patch' : ' · V = victoires en compétition'}
            </div>
            {turn && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '8px' }}>
              {view.cards.map((c) => (
                <ChampCard key={c.champion} card={c} pressed={c.champion === choice} onClick={() => select(c)} ban={banTurn} />
              ))}
            </div>}
            {!turn && <p className="m-muted" style={{ margin: '0', fontSize: '12px' }}>Draft terminée : les dix champions sont choisis.</p>}
          </section>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <CompCard view={view} usLook={usLook} themLook={themLook} previewName={banTurn ? null : previewName} />
            <section className="m-card" style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h2 className="m-h2" style={{ margin: '0' }}>Courbe de puissance</h2>
              <PowerCurve us={view.compUs} them={view.compThem} />
              <p className="m-muted" style={{ margin: '0', fontSize: '12px' }}>{view.curveText}</p>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--bg-active)', color: 'var(--accent-gold)', fontSize: '10px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>HC</span>
                  <strong style={{ fontSize: '13px' }}>Conseil du coach</strong>
                </div>
                <p style={{ margin: '0', fontSize: '13px', lineHeight: '1.45' }}>
                  {view.advice?.text ?? (turn ? '« À l’adversaire de jouer. »' : '« Draft terminée. Les compositions sont prêtes pour le match. »')}
                </p>
                {turn && userTurn && (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button type="button" className="m-btn m-cta" onClick={validate} disabled={!choice}
                      style={{ flex: '1', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      {banTurn ? `Bannir ${choiceName ?? ''}` : `Valider ${choiceName ?? ''}`}
                    </button>
                    <button type="button" className="m-btn" style={{ whiteSpace: 'nowrap' }} onClick={() => run(draftDelegate())}>Déléguer</button>
                  </div>
                )}
                {!turn && (
                  <button type="button" className="m-btn" onClick={() => run(draftStart(DRAFT_BLUE, DRAFT_RED, 'blue', Date.now() % 1_000_000))}>
                    Nouvelle draft
                  </button>
                )}
                {error && <p role="alert" style={{ margin: '0', fontSize: '12px', color: 'var(--danger)' }}>{error}</p>}
                {!error && !isTauriApp() && turn && <p className="m-muted" style={{ margin: '0', fontSize: '11px' }}>{WEB_DRAFT_NOTE}</p>}
              </div>
            </section>
          </div>
        </div>

        <div style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '0' }}>
          {slots(them).map((s) => (
            <SlotCard key={s.role} slot={s} photo={themLook.photos[s.personId]} right preview={null} previewName={null} />
          ))}
          {view.threats.length > 0 && (
            <section className="m-card" style={{ padding: '12px', marginTop: '4px' }}>
              <h2 className="m-h2" style={{ margin: '0 0 8px' }}>Ce que {themLook.short} prépare</h2>
              {view.threats.map((t, i) => (
                <div key={t.personId || t.role} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', marginTop: i ? '8px' : '0' }}>
                  <Photo src={themLook.photos[t.personId]} size={28} border="var(--border)" />
                  <span style={{ flex: '1' }}>{t.handle} : {t.label}</span>
                  {t.champions.map((c) => <img key={c} src={championIcon(c)} alt={c} width="24" height="24" style={{ borderRadius: '5px', objectFit: 'cover', flex: 'none' }} />)}
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function TeamHead({ look, sub, right }: { look: Look; sub: string; right?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexDirection: right ? 'row-reverse' : 'row', textAlign: right ? 'right' : 'left' }}>
      {look.logo && <img src={look.logo} alt="" width="40" height="40" style={{ objectFit: 'contain', flex: 'none' }} />}
      <div>
        <div style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontWeight: '700', fontSize: '18px' }}>{look.name}</div>
        <div className="m-muted" style={{ fontSize: '12px' }}>{sub}</div>
      </div>
    </div>
  );
}

function Pill({ text, color, pulse }: { text: string; color: string; pulse?: boolean }) {
  return (
    <span className={pulse ? 'm-pulse' : undefined} style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '.06em', color: 'var(--bg-page)', background: color, borderRadius: '4px', padding: '2px 6px', whiteSpace: 'nowrap' }}>
      {text}
    </span>
  );
}

function BanRow({ bans, color, right }: { bans: string[]; color: string; right?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexDirection: right ? 'row-reverse' : 'row' }}>
      <span className="m-muted" style={{ fontSize: '12px', width: '46px', textAlign: right ? 'right' : 'left' }}>Bans</span>
      {Array.from({ length: 5 }, (_, i) => bans[i]).map((c, i) => c ? (
        <div key={c} title={`${c} banni`} style={{ position: 'relative', width: '46px', height: '46px', flex: 'none' }}>
          <img src={championIcon(c)} alt={c} width="46" height="46" style={{ borderRadius: '8px', objectFit: 'cover', flex: 'none', filter: 'grayscale(1) brightness(.55)' }} />
          <svg width="46" height="46" viewBox="0 0 46 46" aria-hidden="true" style={{ position: 'absolute', inset: '0' }}>
            <path d="M6 40L40 6" strokeWidth="3" strokeLinecap="round" style={{ stroke: color }} />
          </svg>
        </div>
      ) : (
        <span key={`vide-${i}`} style={{ width: '46px', height: '46px', borderRadius: '8px', border: '1px dashed var(--border-strong)' }} />
      ))}
    </div>
  );
}

function Photo({ src, size, border }: { src?: string; size: number; border: string }) {
  const style = { borderRadius: '50%', objectFit: 'cover' as const, objectPosition: 'top', background: 'var(--bg-active)', border: `2px solid ${border}`, flex: 'none', width: `${size}px`, height: `${size}px` };
  return src ? <img src={src} alt="" width={size} height={size} style={style} /> : <span style={style} />;
}

function SlotCard({ slot, photo, right, preview, previewName }: { slot: DraftSlot; photo?: string; right?: boolean; preview: string | null; previewName: string | null }) {
  const color = right ? 'var(--team-them)' : 'var(--team-us)';
  const dir = right ? 'row-reverse' : 'row';
  const role = (
    <span className="m-muted" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', justifyContent: right ? 'flex-end' : 'flex-start' }}>
      <span style={{ color: 'var(--accent-gold)', display: 'flex' }}><RoleIcon role={UI_ROLE[slot.role]} size={14} color="currentColor" /></span>
      {slot.handle || '—'}
    </span>
  );
  const text = { flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column' as const, gap: '4px', textAlign: right ? 'right' as const : 'left' as const };
  if (slot.champion) {
    return (
      <div style={{ display: 'flex', flexDirection: dir, alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '10px', background: `linear-gradient(${right ? 270 : 90}deg,color-mix(in srgb, ${color} 13%, transparent),var(--bg-card) 70%)`, border: '1px solid var(--border)' }}>
        <div style={{ position: 'relative', width: '64px', height: '64px', flex: 'none' }}>
          <img src={championIcon(slot.champion)} alt={slot.champion} width="64" height="64" style={{ borderRadius: '10px', objectFit: 'cover', flex: 'none', border: `2px solid ${color}` }} />
        </div>
        <div style={text}><strong style={{ fontSize: '15px' }}>{slot.championName ?? slot.champion}</strong>{role}</div>
        <Photo src={photo} size={40} border={color} />
      </div>
    );
  }
  if (slot.current) {
    return (
      <div style={{ display: 'flex', flexDirection: dir, alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '10px', background: `color-mix(in srgb, ${color} 8%, transparent)`, border: `1px solid ${color}` }}>
        <div className="m-pulse" style={{ width: '64px', height: '64px', borderRadius: '10px', border: `2px dashed ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', position: 'relative' }}>
          {preview && <img src={championIcon(preview)} alt={preview} width="56" height="56" style={{ borderRadius: '8px', objectFit: 'cover', flex: 'none', opacity: '.55' }} />}
        </div>
        <div style={text}>
          <span><Pill text="EN COURS" color={color} pulse /></span>
          {previewName && <strong style={{ fontSize: '15px', color }}>{previewName} ?</strong>}
          {role}
        </div>
        <Photo src={photo} size={40} border={color} />
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: dir, alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div style={{ width: '64px', height: '64px', borderRadius: '10px', border: '1px solid var(--border-strong)', background: 'var(--bg-bar)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', color: 'var(--border-strong)' }}>
        <RoleIcon role={UI_ROLE[slot.role]} size={26} color="var(--border-strong)" />
      </div>
      <div style={text}><span className="m-muted" style={{ fontSize: '13px' }}>À venir</span>{role}</div>
      <Photo src={photo} size={40} border="var(--border)" />
    </div>
  );
}

function tagColor(tag: string, advised: boolean): string {
  if (advised) return 'var(--team-us)';
  if (tag.startsWith('Contre') || tag.startsWith('Rang')) return 'var(--accent-blue)';
  return 'var(--team-them)';
}

function ChampCard({ card, pressed, onClick, ban }: { card: DraftCard; pressed: boolean; onClick: () => void; ban: boolean }) {
  const off = !card.available;
  const letterColor = off ? 'var(--text-dim)' : LETTER_COLOR[card.letter];
  return (
    <button type="button" aria-pressed={pressed} onClick={onClick} aria-label={card.name}
      style={{ all: 'unset', cursor: off ? 'default' : 'pointer', display: 'flex', flexDirection: 'column', gap: '5px', padding: '8px', borderRadius: '10px', background: 'var(--bg-bar)', border: pressed ? '2px solid var(--team-us)' : '1px solid var(--border)', boxShadow: pressed ? '0 0 0 3px color-mix(in srgb, var(--team-us) 20%, transparent)' : undefined, position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <img src={championIcon(card.champion)} alt={card.champion} width="72" height="72" style={{ borderRadius: '8px', objectFit: 'cover', flex: 'none', filter: off ? 'grayscale(1) brightness(.5)' : undefined, width: '100%', height: 'auto', aspectRatio: '1' }} />
        <span style={{ position: 'absolute', top: '4px', left: '4px', width: '22px', height: '22px', borderRadius: '5px', background: 'color-mix(in srgb, var(--bg-page) 85%, transparent)', color: letterColor, fontWeight: '800', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${off ? 'var(--border-strong)' : letterColor}` }}>{card.letter}</span>
        {off && (
          <span style={{ position: 'absolute', inset: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="40" height="40" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="15" fill="none" strokeWidth="3" style={{ stroke: 'var(--danger)' }} />
              <path d="M9 31L31 9" strokeWidth="3" style={{ stroke: 'var(--danger)' }} />
            </svg>
          </span>
        )}
      </div>
      <span style={{ fontSize: '13px', fontWeight: '700', color: off ? 'var(--text-dim)' : undefined }}>{card.name}</span>
      <span className="m-muted" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', whiteSpace: 'nowrap', gap: '4px' }}>
        <span>{card.winPct === null ? '—' : `${card.winPct} % V`}</span>
        <span>{ban ? '' : `${card.games} partie${card.games > 1 ? 's' : ''}`}</span>
      </span>
      {card.tag
        ? <span style={{ fontSize: '10px', fontWeight: off ? undefined : '700', color: off ? 'var(--text-dim)' : tagColor(card.tag, card.advised) }}>{card.tag}</span>
        : <span style={{ fontSize: '10px' }}>{' '}</span>}
    </button>
  );
}

function Bar({ value, color }: { value: number; color: string }) {
  return (
    <span style={{ display: 'block', width: '100%', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
      <span style={{ display: 'block', height: '100%', width: pct(value), background: color }} />
    </span>
  );
}

function CompCard({ view, usLook, themLook, previewName }: { view: DraftView; usLook: Look; themLook: Look; previewName: string | null }) {
  const phys = Math.round(view.compUs.physical * 100);
  const before = view.physicalBefore;
  const verdict = (p: number) => (p >= 70 ? ', trop physique' : p <= 30 ? ', trop magique' : '');
  const better = before !== null && Math.abs(view.compUs.physical - 0.5) <= Math.abs(before - 0.5);
  const legend = (look: Look) => (
    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      {look.logo && <img src={look.logo} alt="" width="14" height="14" style={{ objectFit: 'contain', flex: 'none' }} />}
      {` ${look.short}`}
    </span>
  );
  return (
    <section className="m-card" style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: '9px' }}>
      <h2 className="m-h2" style={{ margin: '0' }}>{previewName && view.preview ? `Composition avec ${previewName}` : 'Composition'}</h2>
      <div className="m-muted" style={{ display: 'flex', gap: '12px', fontSize: '11px' }}>{legend(usLook)}{legend(themLook)}</div>
      {STYLE_ROWS.map(([label, i]) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
          <span className="m-muted" style={{ width: '76px' }}>{label}</span>
          <span style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <Bar value={view.compUs.styles[i]} color="var(--team-us)" />
            <Bar value={view.compThem.styles[i]} color="var(--team-them)" />
          </span>
        </div>
      ))}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
          <span className="m-muted">Dégâts {usLook.short}</span>
          <span>
            <span style={{ color: 'var(--team-them)' }}>{phys} % phys.</span>
            {' / '}
            <span style={{ color: 'var(--accent-blue)' }}>{100 - phys} % magiques</span>
          </span>
        </div>
        <div style={{ display: 'flex', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
          <span style={{ width: `${phys}%`, background: 'var(--team-them)' }} />
          <span style={{ flex: '1', background: 'var(--accent-blue)' }} />
        </div>
        {before !== null && previewName && (
          <span style={{ fontSize: '11px', color: better ? 'var(--team-us)' : 'var(--team-them)' }}>
            {better ? '▲' : '▼'} avant {previewName} : {Math.round(before * 100)} / {100 - Math.round(before * 100)}{verdict(Math.round(before * 100))}
          </span>
        )}
      </div>
    </section>
  );
}

/** Puissance sur 100 (50 = champion moyen) → hauteur dans le dessin de la maquette (50 → 35). */
function curvePath(c: CompAnalysis['curve']): string {
  const pts = [c[0], (c[0] + c[1]) / 2, c[1], (c[1] + c[2]) / 2, c[2]];
  return pts.map((v, i) => `${i ? 'L' : 'M'}${i * 65},${(70 - 0.7 * v).toFixed(1)}`).join(' ');
}

function PowerCurve({ us, them }: { us: CompAnalysis; them: CompAnalysis }) {
  return (
    <svg viewBox="0 0 260 86" width="100%" height="86" role="img" aria-label="Courbe de puissance des deux compositions">
      <line x1="0" y1="35" x2="260" y2="35" strokeDasharray="3 3" style={{ stroke: 'var(--border)' }} />
      <path d={curvePath(us.curve)} fill="none" strokeWidth="2.5" strokeLinejoin="round" style={{ stroke: 'var(--team-us)' }} />
      <path d={curvePath(them.curve)} fill="none" strokeWidth="2.5" strokeLinejoin="round" style={{ stroke: 'var(--team-them)' }} />
      <text x="0" y="84" fontSize="10" style={{ fill: 'var(--text-muted)' }}>Début</text>
      <text x="118" y="84" fontSize="10" style={{ fill: 'var(--text-muted)' }}>Milieu</text>
      <text x="260" y="84" fontSize="10" textAnchor="end" style={{ fill: 'var(--text-muted)' }}>Fin</text>
    </svg>
  );
}
