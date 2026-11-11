// Écran « Joueur » de la maquette v2, reproduit à l'identique.
// Généré depuis le rendu de la maquette, puis branché sur les fichiers de M1 (photos, logos).
// Les chiffres sont ceux de la maquette : des exemples en attendant les jalons qui les calculent.
import { assetUrl as asset } from '../../api';
import { Flag } from '../../components/ui';

export function EcranJoueur() {
  return (
    <main style={{ flex: '1', minWidth: '0', padding: '20px 24px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <section className="m-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', padding: '16px 20px', background: 'linear-gradient(90deg,var(--hero-bg),var(--bg-card) 60%)' }}>
        <div style={{ position: 'relative', flex: 'none' }}>
          <img src={asset('photos/caliste-e2af2b77.jpeg')} alt="Photo de Caliste" width="120" height="104" style={{ objectFit: 'cover', objectPosition: 'top', borderRadius: '10px', background: 'var(--bg-active)', display: 'block' }} />
          <img src={asset('logos/karmine-corp-f3aa9bbd.png')} alt="" width="30" height="30" style={{ position: 'absolute', right: '-8px', bottom: '-8px', background: 'var(--bg-bar)', borderRadius: '50%', padding: '3px', border: '1px solid var(--border-strong)' }} />
        </div>
        {' '}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h1 style={{ margin: '0', fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '32px' }}>Caliste</h1>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '6px', background: 'var(--bg-active)', fontSize: '13px', fontWeight: '600', color: 'var(--team-us)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" role="img" aria-label="ADC" style={{ flex: 'none' }}>
                <g fill="currentColor" fillOpacity=".35">
                  <path d="M2 18V2H18L14 6H6V14Z" />
                </g>
                <g fill="currentColor">
                  <path d="M22 22H6L10 18H18V10L22 6Z" />
                  <rect x="9.5" y="9.5" width="5" height="5" />
                </g>
              </svg>
              {' ADC'}
            </span>
            <span style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '13px', fontWeight: '700', background: 'var(--team-us)', color: 'var(--bg-page)', borderRadius: '6px', padding: '4px 8px' }}>#1</span>
          </div>
          {' '}
          <div className="m-muted" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', flexWrap: 'wrap' }}>
            <Flag code="FR" width={22} />
            {' '}
            <span>France</span>
            <span>·</span>
            <span>19 ans</span>
            <span>·</span>
            <span>Karmine Corp depuis nov. 2024</span>
            <span>·</span>
            <span>Contrat : nov. 2028</span>
          </div>
          {' '}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 9px', borderRadius: '999px', fontSize: '12px', fontWeight: '600', border: '1px solid var(--team-us)', color: 'var(--team-us)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3c1 4 5 5 5 10a5 5 0 01-10 0c0-3 2-4 2-7 1.5 1 3 2.5 3-3z" />
              </svg>
              En feu
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 9px', borderRadius: '999px', fontSize: '12px', fontWeight: '600', border: '1px solid var(--accent-blue)', color: 'var(--accent-blue)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
              </svg>
              Pépite
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 9px', borderRadius: '999px', fontSize: '12px', fontWeight: '600', border: '1px solid var(--team-them)', color: 'var(--team-them)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3l10 18H2z" />
                <path d="M12 10v5M12 18v.5" />
              </svg>
              Fatigué
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 9px', borderRadius: '999px', fontSize: '12px', fontWeight: '600', border: '1px solid var(--text-muted)', color: 'var(--text-muted)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
              </svg>
              Intransférable
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 9px', borderRadius: '999px', fontSize: '12px', fontWeight: '600', border: '1px solid var(--team-them)', color: 'var(--team-them)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />
                <circle cx="12" cy="12" r="2.5" />
              </svg>
              Convoité : 3 clubs
            </span>
          </div>
        </div>
        {' '}
        <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <span className="m-muted" style={{ fontSize: '12px' }}>Niveau</span>
            <span style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '30px', fontWeight: '700', color: 'var(--team-us)' }}>84</span>
            <span className="m-muted" style={{ fontSize: '11px' }}>Potentiel 93</span>
          </div>
          {' '}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '13px' }}>
            <span className="m-muted" style={{ fontSize: '12px' }}>Valeur estimée</span>
            <strong style={{ fontSize: '18px' }}>1,8 M€</strong>
            <span className="m-muted">Salaire : 32 k€ / mois</span>
          </div>
          {' '}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button type="button" className="m-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 5h16v11H9l-5 4z" />
              </svg>
              {' Discuter'}
            </button>
            <button type="button" className="m-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 3h8l4 4v14H6z" />
                <path d="M14 3v4h4" />
              </svg>
              {' Contrat'}
            </button>
          </div>
        </div>
      </section>
      {' '}
      <div role="tablist" aria-label="Sections de la fiche" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', borderBottom: '1px solid var(--border)' }}>
        <button type="button" role="tab" aria-selected="true" style={{ minHeight: '40px', padding: '0 16px', border: 'none', borderBottom: '2px solid var(--team-us)', background: 'transparent', color: 'var(--text)', fontWeight: '600', fontSize: '14px', fontFamily: 'inherit' }}>Aperçu</button>
        {' '}
        <button type="button" role="tab" aria-selected="false" style={{ minHeight: '40px', padding: '0 16px', border: 'none', background: 'transparent', color: 'var(--text-muted)', fontSize: '14px', fontFamily: 'inherit' }}>Attributs détaillés</button>
        <button type="button" role="tab" aria-selected="false" style={{ minHeight: '40px', padding: '0 16px', border: 'none', background: 'transparent', color: 'var(--text-muted)', fontSize: '14px', fontFamily: 'inherit' }}>Champions</button>
        <button type="button" role="tab" aria-selected="false" style={{ minHeight: '40px', padding: '0 16px', border: 'none', background: 'transparent', color: 'var(--text-muted)', fontSize: '14px', fontFamily: 'inherit' }}>Statistiques</button>
        <button type="button" role="tab" aria-selected="false" style={{ minHeight: '40px', padding: '0 16px', border: 'none', background: 'transparent', color: 'var(--text-muted)', fontSize: '14px', fontFamily: 'inherit' }}>Carrière</button>
        <button type="button" role="tab" aria-selected="false" style={{ minHeight: '40px', padding: '0 16px', border: 'none', background: 'transparent', color: 'var(--text-muted)', fontSize: '14px', fontFamily: 'inherit' }}>Personnalité</button>
        <button type="button" role="tab" aria-selected="false" style={{ minHeight: '40px', padding: '0 16px', border: 'none', background: 'transparent', color: 'var(--text-muted)', fontSize: '14px', fontFamily: 'inherit' }}>Relations</button>
        <button type="button" role="tab" aria-selected="false" style={{ minHeight: '40px', padding: '0 16px', border: 'none', background: 'transparent', color: 'var(--text-muted)', fontSize: '14px', fontFamily: 'inherit' }}>Rapports de scouting</button>
      </div>
      {' '}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '14px' }}>
        <section className="m-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2 className="m-h2" style={{ margin: '0' }}>État du joueur</h2>
          {' '}
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 120px' }}>
              <div className="m-muted" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span>Forme</span>
                <span style={{ color: 'var(--team-us)', display: 'flex' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 15l6-6 6 6" />
                  </svg>
                </span>
              </div>
              <div style={{ height: '8px', borderRadius: '4px', background: 'var(--border)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '88%', background: 'var(--team-us)' }} />
              </div>
              <strong style={{ fontSize: '13px', color: 'var(--team-us)' }}>Excellente</strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 120px' }}>
              <div className="m-muted" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span>Moral</span>
                <span style={{ color: 'var(--text-muted)', display: 'flex' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14" />
                  </svg>
                </span>
              </div>
              <div style={{ height: '8px', borderRadius: '4px', background: 'var(--border)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '72%', background: 'var(--team-us)' }} />
              </div>
              <strong style={{ fontSize: '13px', color: 'var(--team-us)' }}>Bon</strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 120px' }}>
              <div className="m-muted" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span>Fatigue</span>
                <span style={{ color: 'var(--team-us)', display: 'flex' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 15l6-6 6 6" />
                  </svg>
                </span>
              </div>
              <div style={{ height: '8px', borderRadius: '4px', background: 'var(--border)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '68%', background: 'var(--team-them)' }} />
              </div>
              <strong style={{ fontSize: '13px', color: 'var(--team-them)' }}>68 %</strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 120px' }}>
              <div className="m-muted" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span>Confiance</span>
                <span style={{ color: 'var(--team-us)', display: 'flex' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 15l6-6 6 6" />
                  </svg>
                </span>
              </div>
              <div style={{ height: '8px', borderRadius: '4px', background: 'var(--border)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '80%', background: 'var(--team-us)' }} />
              </div>
              <strong style={{ fontSize: '13px', color: 'var(--team-us)' }}>Haute</strong>
            </div>
          </div>
          {' '}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', padding: '8px 10px', borderRadius: '8px', background: 'var(--warn-bg)', color: 'var(--team-them)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3l10 18H2z" />
              <path d="M12 10v5M12 18v.5" />
            </svg>
            {' Risque de burn-out modéré si la charge reste à ce niveau 2 semaines.'}
          </div>
          {' '}
          <h2 className="m-h2" style={{ margin: '4px 0 0' }}>Forme : 10 derniers matchs</h2>
          {' '}
          <svg viewBox="0 0 300 90" role="img" aria-label="Notes des 10 derniers matchs, en hausse, dernière 8,7" style={{ width: '100%', height: 'auto' }}>
            <line x1="0" y1="51" x2="300" y2="51" strokeDasharray="3 3" style={{ stroke: 'var(--border)' }} />
            <polyline points="15,50 45,58 75,37 105,41 135,52 165,32 195,46 225,28 255,38 285,31" fill="none" strokeWidth="2.5" style={{ stroke: 'var(--team-us)' }} />
            <circle cx="15" cy="50" r="4.5" strokeWidth="2" style={{ fill: 'var(--team-us)', stroke: 'var(--bg-card)' }} />
            <circle cx="45" cy="58" r="4.5" strokeWidth="2" style={{ fill: 'var(--team-them)', stroke: 'var(--bg-card)' }} />
            <circle cx="75" cy="37" r="4.5" strokeWidth="2" style={{ fill: 'var(--team-us)', stroke: 'var(--bg-card)' }} />
            <circle cx="105" cy="41" r="4.5" strokeWidth="2" style={{ fill: 'var(--team-us)', stroke: 'var(--bg-card)' }} />
            <circle cx="135" cy="52" r="4.5" strokeWidth="2" style={{ fill: 'var(--team-them)', stroke: 'var(--bg-card)' }} />
            <circle cx="165" cy="32" r="4.5" strokeWidth="2" style={{ fill: 'var(--team-us)', stroke: 'var(--bg-card)' }} />
            <circle cx="195" cy="46" r="4.5" strokeWidth="2" style={{ fill: 'var(--team-us)', stroke: 'var(--bg-card)' }} />
            <circle cx="225" cy="28" r="4.5" strokeWidth="2" style={{ fill: 'var(--team-us)', stroke: 'var(--bg-card)' }} />
            <circle cx="255" cy="38" r="4.5" strokeWidth="2" style={{ fill: 'var(--team-us)', stroke: 'var(--bg-card)' }} />
            <circle cx="285" cy="31" r="4.5" strokeWidth="2" style={{ fill: 'var(--team-us)', stroke: 'var(--bg-card)' }} />
          </svg>
          {' '}
          <div className="m-muted" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <span>
              {'Moyenne : '}
              <strong style={{ color: 'var(--text)' }}>7,8</strong>
            </span>
            <span>
              <span style={{ color: 'var(--team-us)' }}>●</span>
              {' victoire '}
              <span style={{ color: 'var(--team-them)' }}>●</span>
              {' défaite'}
            </span>
          </div>
        </section>
        {' '}
        <section className="m-card" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h2 className="m-h2">Attributs (sur 20)</h2>
          {' '}
          <span className="m-muted" style={{ fontSize: '11px', letterSpacing: '.06em', textTransform: 'uppercase' }}>Mécanique</span>
          {' '}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', padding: '3px 0' }}>
            <span style={{ width: '118px', flex: 'none' }}>Mécanique</span>
            <span style={{ flex: '1', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden', display: 'block', minWidth: '50px' }}>
              <span style={{ display: 'block', height: '100%', width: '85%', background: 'var(--team-us)', borderRadius: '3px' }} />
            </span>
            <strong style={{ width: '20px', textAlign: 'right' }}>17</strong>
            <span style={{ color: 'var(--team-us)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 15l6-6 6 6" />
              </svg>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', padding: '3px 0' }}>
            <span style={{ width: '118px', flex: 'none' }}>Laning</span>
            <span style={{ flex: '1', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden', display: 'block', minWidth: '50px' }}>
              <span style={{ display: 'block', height: '100%', width: '80%', background: 'var(--team-us)', borderRadius: '3px' }} />
            </span>
            <strong style={{ width: '20px', textAlign: 'right' }}>16</strong>
            <span style={{ width: '14px' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', padding: '3px 0' }}>
            <span style={{ width: '118px', flex: 'none' }}>Farm</span>
            <span style={{ flex: '1', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden', display: 'block', minWidth: '50px' }}>
              <span style={{ display: 'block', height: '100%', width: '85%', background: 'var(--team-us)', borderRadius: '3px' }} />
            </span>
            <strong style={{ width: '20px', textAlign: 'right' }}>17</strong>
            <span style={{ color: 'var(--team-us)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 15l6-6 6 6" />
              </svg>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', padding: '3px 0' }}>
            <span style={{ width: '118px', flex: 'none' }}>Teamfight</span>
            <span style={{ flex: '1', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden', display: 'block', minWidth: '50px' }}>
              <span style={{ display: 'block', height: '100%', width: '75%', background: 'var(--accent-blue)', borderRadius: '3px' }} />
            </span>
            <strong style={{ width: '20px', textAlign: 'right' }}>15</strong>
            <span style={{ width: '14px' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', padding: '3px 0' }}>
            <span style={{ width: '118px', flex: 'none' }}>Escarmouche</span>
            <span style={{ flex: '1', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden', display: 'block', minWidth: '50px' }}>
              <span style={{ display: 'block', height: '100%', width: '75%', background: 'var(--accent-blue)', borderRadius: '3px' }} />
            </span>
            <strong style={{ width: '20px', textAlign: 'right' }}>15</strong>
            <span style={{ color: 'var(--team-us)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 15l6-6 6 6" />
              </svg>
            </span>
          </div>
          {' '}
          <span className="m-muted" style={{ fontSize: '11px', letterSpacing: '.06em', textTransform: 'uppercase', marginTop: '6px' }}>Jeu</span>
          {' '}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', padding: '3px 0' }}>
            <span style={{ width: '118px', flex: 'none' }}>Lecture de carte</span>
            <span style={{ flex: '1', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden', display: 'block', minWidth: '50px' }}>
              <span style={{ display: 'block', height: '100%', width: '65%', background: 'var(--accent-blue)', borderRadius: '3px' }} />
            </span>
            <strong style={{ width: '20px', textAlign: 'right' }}>13</strong>
            <span style={{ width: '14px' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', padding: '3px 0' }}>
            <span style={{ width: '118px', flex: 'none' }}>Décision</span>
            <span style={{ flex: '1', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden', display: 'block', minWidth: '50px' }}>
              <span style={{ display: 'block', height: '100%', width: '65%', background: 'var(--accent-blue)', borderRadius: '3px' }} />
            </span>
            <strong style={{ width: '20px', textAlign: 'right' }}>13</strong>
            <span style={{ color: 'var(--team-us)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 15l6-6 6 6" />
              </svg>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', padding: '3px 0' }}>
            <span style={{ width: '118px', flex: 'none' }}>Vision</span>
            <span style={{ flex: '1', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden', display: 'block', minWidth: '50px' }}>
              <span style={{ display: 'block', height: '100%', width: '55%', background: 'var(--accent-blue)', borderRadius: '3px' }} />
            </span>
            <strong style={{ width: '20px', textAlign: 'right' }}>11</strong>
            <span style={{ width: '14px' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', padding: '3px 0' }}>
            <span style={{ width: '118px', flex: 'none' }}>Shotcalling</span>
            <span style={{ flex: '1', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden', display: 'block', minWidth: '50px' }}>
              <span style={{ display: 'block', height: '100%', width: '45%', background: 'var(--team-them)', borderRadius: '3px' }} />
            </span>
            <strong style={{ width: '20px', textAlign: 'right' }}>9</strong>
            <span style={{ color: 'var(--team-them)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', padding: '3px 0' }}>
            <span style={{ width: '118px', flex: 'none' }}>Communication</span>
            <span style={{ flex: '1', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden', display: 'block', minWidth: '50px' }}>
              <span style={{ display: 'block', height: '100%', width: '65%', background: 'var(--accent-blue)', borderRadius: '3px' }} />
            </span>
            <strong style={{ width: '20px', textAlign: 'right' }}>13</strong>
            <span style={{ width: '14px' }} />
          </div>
          {' '}
          <span className="m-muted" style={{ fontSize: '11px', letterSpacing: '.06em', textTransform: 'uppercase', marginTop: '6px' }}>Mental (estimé par le staff, fourchette)</span>
          {' '}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', padding: '3px 0' }}>
            <span style={{ width: '118px', flex: 'none' }}>Sang-froid</span>
            <span style={{ flex: '1', height: '6px', borderRadius: '3px', background: 'var(--border)', position: 'relative', display: 'block', minWidth: '50px' }}>
              <span style={{ position: 'absolute', left: '60%', width: '15%', top: '0', bottom: '0', background: 'var(--accent-blue)', opacity: '.85', borderRadius: '3px' }} />
            </span>
            <strong style={{ width: '38px', textAlign: 'right' }}>12-15</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', padding: '3px 0' }}>
            <span style={{ width: '118px', flex: 'none' }}>Régularité</span>
            <span style={{ flex: '1', height: '6px', borderRadius: '3px', background: 'var(--border)', position: 'relative', display: 'block', minWidth: '50px' }}>
              <span style={{ position: 'absolute', left: '65%', width: '15%', top: '0', bottom: '0', background: 'var(--accent-blue)', opacity: '.85', borderRadius: '3px' }} />
            </span>
            <strong style={{ width: '38px', textAlign: 'right' }}>13-16</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', padding: '3px 0' }}>
            <span style={{ width: '118px', flex: 'none' }}>Grands matchs</span>
            <span style={{ flex: '1', height: '6px', borderRadius: '3px', background: 'repeating-linear-gradient(90deg,var(--border) 0 6px,var(--bg-active) 6px 12px)', display: 'block', minWidth: '50px' }} />
            <strong style={{ width: '38px', textAlign: 'right' }}>?</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', padding: '3px 0' }}>
            <span style={{ width: '118px', flex: 'none' }}>Professionnalisme</span>
            <span style={{ flex: '1', height: '6px', borderRadius: '3px', background: 'var(--border)', position: 'relative', display: 'block', minWidth: '50px' }}>
              <span style={{ position: 'absolute', left: '75%', width: '15%', top: '0', bottom: '0', background: 'var(--accent-blue)', opacity: '.85', borderRadius: '3px' }} />
            </span>
            <strong style={{ width: '38px', textAlign: 'right' }}>15-18</strong>
          </div>
        </section>
        {' '}
        <section className="m-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <h2 className="m-h2" style={{ alignSelf: 'flex-start', margin: '0' }}>Profil</h2>
          {' '}
          <svg viewBox="0 0 260 240" role="img" aria-label="Profil radar de Caliste comparé à la moyenne des ADC de la LEC" style={{ width: '100%', maxWidth: '300px', height: 'auto' }}>
            <polygon points="130.0,98.0 149.1,109.0 149.1,131.0 130.0,142.0 110.9,131.0 110.9,109.0" fill="none" style={{ stroke: 'var(--border)' }} />
            <polygon points="130.0,76.0 168.1,98.0 168.1,142.0 130.0,164.0 91.9,142.0 91.9,98.0" fill="none" style={{ stroke: 'var(--border)' }} />
            <polygon points="130.0,54.0 187.2,87.0 187.2,153.0 130.0,186.0 72.8,153.0 72.8,87.0" fill="none" style={{ stroke: 'var(--border)' }} />
            <polygon points="130.0,32.0 206.2,76.0 206.2,164.0 130.0,208.0 53.8,164.0 53.8,76.0" fill="none" style={{ stroke: 'var(--border)' }} />
            <line x1="130" y1="120" x2="130.0" y2="32.0" style={{ stroke: 'var(--border)' }} />
            <line x1="130" y1="120" x2="206.2" y2="76.0" style={{ stroke: 'var(--border)' }} />
            <line x1="130" y1="120" x2="206.2" y2="164.0" style={{ stroke: 'var(--border)' }} />
            <line x1="130" y1="120" x2="130.0" y2="208.0" style={{ stroke: 'var(--border)' }} />
            <line x1="130" y1="120" x2="53.8" y2="164.0" style={{ stroke: 'var(--border)' }} />
            <line x1="130" y1="120" x2="53.8" y2="76.0" style={{ stroke: 'var(--border)' }} />
            <polygon points="130.0,62.8 179.5,91.4 179.5,148.6 130.0,177.2 84.3,146.4 84.3,93.6" fill="none" strokeDasharray="4 3" style={{ stroke: 'var(--text-muted)' }} />
            <polygon points="130.0,49.6 194.8,82.6 187.2,153.0 130.0,194.8 88.1,144.2 76.7,89.2" fillOpacity="0.25" strokeWidth="2" style={{ fill: 'var(--team-us)', stroke: 'var(--team-us)' }} />
            <text x="130" y="14" textAnchor="middle" fontSize="11" fontFamily="Inter" style={{ fill: 'var(--text-muted)' }}>
              {'Laning '}
              <tspan fontWeight="700" style={{ fill: 'var(--text)' }}>16</tspan>
            </text>
            <text x="225" y="69" textAnchor="start" fontSize="11" fontFamily="Inter" style={{ fill: 'var(--text-muted)' }}>
              {'Mécanique '}
              <tspan fontWeight="700" style={{ fill: 'var(--text)' }}>17</tspan>
            </text>
            <text x="225" y="179" textAnchor="start" fontSize="11" fontFamily="Inter" style={{ fill: 'var(--text-muted)' }}>
              {'Teamfight '}
              <tspan fontWeight="700" style={{ fill: 'var(--text)' }}>15</tspan>
            </text>
            <text x="130" y="234" textAnchor="middle" fontSize="11" fontFamily="Inter" style={{ fill: 'var(--text-muted)' }}>
              {'Farm '}
              <tspan fontWeight="700" style={{ fill: 'var(--text)' }}>17</tspan>
            </text>
            <text x="35" y="179" textAnchor="end" fontSize="11" fontFamily="Inter" style={{ fill: 'var(--text-muted)' }}>
              {'Vision '}
              <tspan fontWeight="700" style={{ fill: 'var(--text)' }}>11</tspan>
            </text>
            <text x="35" y="69" textAnchor="end" fontSize="11" fontFamily="Inter" style={{ fill: 'var(--text-muted)' }}>
              {'Mental '}
              <tspan fontWeight="700" style={{ fill: 'var(--text)' }}>14</tspan>
            </text>
          </svg>
          {' '}
          <div className="m-muted" style={{ display: 'flex', gap: '14px', fontSize: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '14px', height: '3px', background: 'var(--team-us)', display: 'inline-block' }} />
              Caliste
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '14px', borderTop: '2px dashed var(--text-muted)', display: 'inline-block' }} />
              Moyenne ADC LEC
            </span>
          </div>
          {' '}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '4px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 9px', borderRadius: '999px', fontSize: '12px', fontWeight: '600', border: '1px solid var(--text)', color: 'var(--text)' }}>Compétiteur</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 9px', borderRadius: '999px', fontSize: '12px', fontWeight: '600', border: '1px solid var(--text)', color: 'var(--text)' }}>Ambitieux</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 9px', borderRadius: '999px', fontSize: '12px', fontWeight: '600', border: '1px solid var(--text)', color: 'var(--text)' }}>Sensible à la pression</span>
          </div>
        </section>
        {' '}
        <section className="m-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 className="m-h2">Champions</h2>
          {' '}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0' }}>
            <img src={asset('champions/Varus.png')} alt="Varus" width="40" height="40" style={{ borderRadius: '8px', objectFit: 'cover', flex: 'none' }} />
            <div style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <strong>Varus</strong>
                <span className="m-muted">
                  {'34 parties · '}
                  <span style={{ color: 'var(--team-us)' }}>62 %</span>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ flex: '1', height: '5px', borderRadius: '3px', background: 'var(--border)', display: 'block' }}>
                  <span style={{ display: 'block', height: '100%', width: '92%', background: 'var(--team-us)', borderRadius: '3px' }} />
                </span>
                <span style={{ fontSize: '11px', color: 'var(--team-us)', fontWeight: '700', width: '64px', textAlign: 'right' }}>Excellente</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0' }}>
            <img src={asset('champions/Kaisa.png')} alt="Kai'Sa" width="40" height="40" style={{ borderRadius: '8px', objectFit: 'cover', flex: 'none' }} />
            <div style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <strong>{'Kai\'Sa'}</strong>
                <span className="m-muted">
                  {'41 parties · '}
                  <span style={{ color: 'var(--team-us)' }}>59 %</span>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ flex: '1', height: '5px', borderRadius: '3px', background: 'var(--border)', display: 'block' }}>
                  <span style={{ display: 'block', height: '100%', width: '90%', background: 'var(--team-us)', borderRadius: '3px' }} />
                </span>
                <span style={{ fontSize: '11px', color: 'var(--team-us)', fontWeight: '700', width: '64px', textAlign: 'right' }}>Excellente</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0' }}>
            <img src={asset('champions/Ezreal.png')} alt="Ezreal" width="40" height="40" style={{ borderRadius: '8px', objectFit: 'cover', flex: 'none' }} />
            <div style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <strong>Ezreal</strong>
                <span className="m-muted">
                  {'27 parties · '}
                  <span style={{ color: 'var(--text)' }}>52 %</span>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ flex: '1', height: '5px', borderRadius: '3px', background: 'var(--border)', display: 'block' }}>
                  <span style={{ display: 'block', height: '100%', width: '78%', background: 'var(--accent-blue)', borderRadius: '3px' }} />
                </span>
                <span style={{ fontSize: '11px', color: 'var(--accent-blue)', fontWeight: '700', width: '64px', textAlign: 'right' }}>Très bonne</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0' }}>
            <img src={asset('champions/Xayah.png')} alt="Xayah" width="40" height="40" style={{ borderRadius: '8px', objectFit: 'cover', flex: 'none' }} />
            <div style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <strong>Xayah</strong>
                <span className="m-muted">
                  {'12 parties · '}
                  <span style={{ color: 'var(--text)' }}>50 %</span>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ flex: '1', height: '5px', borderRadius: '3px', background: 'var(--border)', display: 'block' }}>
                  <span style={{ display: 'block', height: '100%', width: '64%', background: 'var(--accent-blue)', borderRadius: '3px' }} />
                </span>
                <span style={{ fontSize: '11px', color: 'var(--accent-blue)', fontWeight: '700', width: '64px', textAlign: 'right' }}>Bonne</span>
              </div>
            </div>
          </div>
        </section>
        {' '}
        <section className="m-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 className="m-h2">{'Chimie avec l\'équipe'}</h2>
          {' '}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 0' }}>
            <img src={asset('photos/busio-3e722c8e.jpg')} alt="Busio" width="34" height="34" style={{ borderRadius: '17px', objectFit: 'cover', flex: 'none', background: 'var(--bg-active)' }} />
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <strong>Busio</strong>
                  <span style={{ color: 'var(--accent-gold)', display: 'flex' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" role="img" aria-label="Support" style={{ flex: 'none' }}>
                      <g fill="currentColor" fillOpacity=".35" />
                      <g fill="currentColor">
                        <path d="M12 6.5L15.2 10.5L12 22L8.8 10.5Z" />
                        <path d="M1.5 6H9L10.2 9L7.5 12.5L5 9.5Z" />
                        <path d="M22.5 6H15L13.8 9L16.5 12.5L19 9.5Z" />
                        <path d="M9.5 2.5H14.5L12 5.2Z" />
                      </g>
                    </svg>
                  </span>
                </span>
                <span style={{ color: 'var(--team-us)', fontSize: '12px', fontWeight: '600' }}>Excellente</span>
              </div>
              <span style={{ height: '4px', borderRadius: '2px', background: 'var(--border)', display: 'block' }}>
                <span style={{ display: 'block', height: '100%', width: '92%', background: 'var(--team-us)', borderRadius: '2px' }} />
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 0' }}>
            <img src={asset('photos/yike-4203fc46.jpg')} alt="Yike" width="34" height="34" style={{ borderRadius: '17px', objectFit: 'cover', flex: 'none', background: 'var(--bg-active)' }} />
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <strong>Yike</strong>
                  <span style={{ color: 'var(--accent-gold)', display: 'flex' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" role="img" aria-label="Jungle" style={{ flex: 'none' }}>
                      <g fill="currentColor" fillOpacity=".35" />
                      <g fill="currentColor">
                        <path d="M5 22C3.5 16 3 10 4 3C7 8 9 13 9.5 19Z" />
                        <path d="M11.2 22C10.3 15 10.6 8 12 1.5C13.4 8 13.7 15 12.8 22Z" />
                        <path d="M19 22C20.5 16 21 10 20 3C17 8 15 13 14.5 19Z" />
                      </g>
                    </svg>
                  </span>
                </span>
                <span style={{ color: 'var(--team-us)', fontSize: '12px', fontWeight: '600' }}>Bonne</span>
              </div>
              <span style={{ height: '4px', borderRadius: '2px', background: 'var(--border)', display: 'block' }}>
                <span style={{ display: 'block', height: '100%', width: '74%', background: 'var(--team-us)', borderRadius: '2px' }} />
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 0' }}>
            <img src={asset('photos/kyeahoo-308e48bf.jpg')} alt="kyeahoo" width="34" height="34" style={{ borderRadius: '17px', objectFit: 'cover', flex: 'none', background: 'var(--bg-active)' }} />
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <strong>kyeahoo</strong>
                  <span style={{ color: 'var(--accent-gold)', display: 'flex' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" role="img" aria-label="Mid" style={{ flex: 'none' }}>
                      <g fill="currentColor" fillOpacity=".35">
                        <path d="M2 2H13L2 13Z" />
                        <path d="M22 22H11L22 11Z" />
                      </g>
                      <g fill="currentColor">
                        <path d="M17 2H22V7L7 22H2V17Z" />
                      </g>
                    </svg>
                  </span>
                </span>
                <span style={{ color: 'var(--accent-blue)', fontSize: '12px', fontWeight: '600' }}>Correcte</span>
              </div>
              <span style={{ height: '4px', borderRadius: '2px', background: 'var(--border)', display: 'block' }}>
                <span style={{ display: 'block', height: '100%', width: '58%', background: 'var(--accent-blue)', borderRadius: '2px' }} />
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 0' }}>
            <img src={asset('photos/canna-7577c239.jpg')} alt="Canna" width="34" height="34" style={{ borderRadius: '17px', objectFit: 'cover', flex: 'none', background: 'var(--bg-active)' }} />
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <strong>Canna</strong>
                  <span style={{ color: 'var(--accent-gold)', display: 'flex' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" role="img" aria-label="Top" style={{ flex: 'none' }}>
                      <g fill="currentColor" fillOpacity=".35">
                        <path d="M22 6V22H6L10 18H18V10Z" />
                      </g>
                      <g fill="currentColor">
                        <path d="M2 2H18L14 6H6V14L2 18Z" />
                        <rect x="9.5" y="9.5" width="5" height="5" />
                      </g>
                    </svg>
                  </span>
                </span>
                <span style={{ color: 'var(--team-them)', fontSize: '12px', fontWeight: '600' }}>Tendue</span>
              </div>
              <span style={{ height: '4px', borderRadius: '2px', background: 'var(--border)', display: 'block' }}>
                <span style={{ display: 'block', height: '100%', width: '35%', background: 'var(--team-them)', borderRadius: '2px' }} />
              </span>
            </div>
          </div>
        </section>
        {' '}
        <section className="m-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h2 className="m-h2" style={{ margin: '0' }}>Avis du staff</h2>
          {' '}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <span style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--bg-active)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '12px', flex: 'none', color: 'var(--team-us)' }}>HC</span>
            <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
              <strong>Coach principal</strong>
              <br />
              {'« Un talent rare, déjà parmi les meilleurs ADC d\'Europe. Il doit progresser sur la vision et ses placements en fin de partie. »'}
            </div>
          </div>
          {' '}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <span style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--bg-active)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '12px', flex: 'none', color: 'var(--team-them)' }}>PS</span>
            <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
              <strong>Psychologue</strong>
              <br />
              « Fatigue en hausse. Une journée de repos avant G2 serait utile. »
            </div>
          </div>
        </section>
      </div>
      {' '}
      <p className="m-note">Photos, logos et icônes de champions sont réels (Leaguepedia, Riot Data Dragon). Notes, attributs, valeurs et avis sont des exemples pour la maquette.</p>
    </main>
  );
}
