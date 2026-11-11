// Écran « Accueil » de la maquette v2, reproduit à l'identique.
// Généré depuis le rendu de la maquette, puis branché sur les fichiers de M1 (photos, logos).
// Les chiffres sont ceux de la maquette : des exemples en attendant les jalons qui les calculent.
import { assetUrl as asset } from '../../api';

export function EcranAccueil() {
  return (
    <main style={{ flex: '1', minWidth: '0', padding: '20px 24px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <section className="m-card" style={{ padding: '14px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h2 className="m-h2" style={{ margin: '0' }}>Cette semaine</h2>
          <span className="m-muted" style={{ fontSize: '12px' }}>12 – 18 janvier 2026</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
          <div style={{ flex: '1', minWidth: '70px', display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px', borderRadius: '8px', background: 'var(--bg-active)', border: '1px solid var(--team-us)' }}>
            <span className="m-muted" style={{ fontSize: '11px' }}>Lun.</span>
            <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 5px', borderRadius: '4px', background: 'var(--violet-bg)', color: 'var(--text)' }}>VOD</span>
            <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 5px', borderRadius: '4px', background: 'var(--teal-bg)', color: 'var(--text)' }}>Scrim FNC</span>
          </div>
          <div style={{ flex: '1', minWidth: '70px', display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border)' }}>
            <span className="m-muted" style={{ fontSize: '11px' }}>Mar.</span>
            <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 5px', borderRadius: '4px', background: 'var(--bg-raised)', color: 'var(--text)' }}>SoloQ</span>
            <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 5px', borderRadius: '4px', background: 'var(--teal-bg)', color: 'var(--text)' }}>Scrim MKOI</span>
          </div>
          <div style={{ flex: '1', minWidth: '70px', display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border)' }}>
            <span className="m-muted" style={{ fontSize: '11px' }}>Mer.</span>
            <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 5px', borderRadius: '4px', background: 'var(--violet-bg)', color: 'var(--text)' }}>Patch</span>
            <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 5px', borderRadius: '4px', background: 'var(--teal-bg)', color: 'var(--text)' }}>Scrim SK</span>
          </div>
          <div style={{ flex: '1', minWidth: '70px', display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border)' }}>
            <span className="m-muted" style={{ fontSize: '11px' }}>Jeu.</span>
            <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 5px', borderRadius: '4px', background: 'var(--gold-bg)', color: 'var(--text)' }}>Repos</span>
          </div>
          <div style={{ flex: '1', minWidth: '70px', display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border)' }}>
            <span className="m-muted" style={{ fontSize: '11px' }}>Ven.</span>
            <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 5px', borderRadius: '4px', background: 'var(--violet-bg)', color: 'var(--text)' }}>Prépa draft</span>
          </div>
          <div style={{ flex: '1', minWidth: '70px', display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border)' }}>
            <span className="m-muted" style={{ fontSize: '11px' }}>Sam.</span>
            <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 5px', borderRadius: '4px', background: 'var(--team-us)', color: 'var(--bg-page)' }}>vs G2</span>
          </div>
          <div style={{ flex: '1', minWidth: '70px', display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border)' }}>
            <span className="m-muted" style={{ fontSize: '11px' }}>Dim.</span>
            <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 5px', borderRadius: '4px', background: 'var(--gold-bg)', color: 'var(--text)' }}>Repos</span>
          </div>
        </div>
      </section>
      {' '}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'flex-start' }}>
        <section className="m-card" style={{ flex: '2 1 520px', padding: '14px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ margin: '0', fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '20px' }}>Boîte de réception</h1>
            <span style={{ background: 'var(--team-us)', color: 'var(--bg-page)', borderRadius: '10px', padding: '1px 8px', fontSize: '12px', fontWeight: '700' }}>3 non lus</span>
          </div>
          {' '}
          <div style={{ display: 'flex', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--border)', alignItems: 'flex-start' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--team-us)', flex: 'none', marginTop: '6px' }} />
            <img src={asset('logos/g2-esports-7d6673d3.png')} alt="" width="38" height="38" style={{ objectFit: 'contain', flex: 'none' }} />
            {' '}
            <div style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '.06em', color: 'var(--accent-blue)', border: '1px solid color-mix(in srgb, var(--accent-blue) 53%, transparent)', borderRadius: '4px', padding: '1px 6px' }}>ANALYSTE</span>
                <strong style={{ fontSize: '14px' }}>Rapport sur G2 Esports prêt</strong>
                <span className="m-muted" style={{ marginLeft: 'auto', fontSize: '12px' }}>09:12</span>
              </div>
              {' '}
              <div style={{ fontSize: '13px', lineHeight: '1.45', color: 'var(--text-soft)' }}>Caps joue surtout Azir et Taliyah. G2 bannit souvent les champions de Canna.</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <img src={asset('photos/caps-55dd587c.jpg')} alt="" width="26" height="26" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
                <span className="m-muted" style={{ fontSize: '12px' }}>Pool de Caps :</span>
                <img src={asset('champions/Azir.png')} alt="Azir" width="24" height="24" style={{ borderRadius: '8px', objectFit: 'cover', flex: 'none' }} />
                <img src={asset('champions/Taliyah.png')} alt="Taliyah" width="24" height="24" style={{ borderRadius: '8px', objectFit: 'cover', flex: 'none' }} />
                <img src={asset('champions/Sylas.png')} alt="Sylas" width="24" height="24" style={{ borderRadius: '8px', objectFit: 'cover', flex: 'none' }} />
                <span className="m-muted" style={{ fontSize: '12px', marginLeft: '8px' }}>Bans contre Canna :</span>
                <img src={asset('champions/KSante.png')} alt="KSante" width="24" height="24" style={{ borderRadius: '8px', objectFit: 'cover', flex: 'none' }} />
                <img src={asset('champions/Rumble.png')} alt="Rumble" width="24" height="24" style={{ borderRadius: '8px', objectFit: 'cover', flex: 'none' }} />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--border)', alignItems: 'flex-start' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--team-us)', flex: 'none', marginTop: '6px' }} />
            <img src={asset('photos/caliste-e2af2b77.jpeg')} alt="" width="38" height="38" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--team-them)', flex: 'none' }} />
            {' '}
            <div style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '.06em', color: 'var(--team-them)', border: '1px solid color-mix(in srgb, var(--team-them) 53%, transparent)', borderRadius: '4px', padding: '1px 6px' }}>JOUEUR</span>
                <strong style={{ fontSize: '14px' }}>Caliste demande une journée de repos</strong>
                <span className="m-muted" style={{ marginLeft: 'auto', fontSize: '12px' }}>08:40</span>
              </div>
              {' '}
              <div style={{ fontSize: '13px', lineHeight: '1.45', color: 'var(--text-soft)' }}>Il trouve les scrims trop nombreux et se dit fatigué.</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span className="m-muted" style={{ fontSize: '12px' }}>Fatigue</span>
                <span style={{ width: '120px' }}>
                  <span style={{ display: 'block', width: '100%', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
                    <span style={{ display: 'block', height: '100%', width: '68%', background: 'var(--team-them)' }} />
                  </span>
                </span>
                <strong style={{ fontSize: '12px', color: 'var(--team-them)' }}>68 %</strong>
                <button type="button" className="m-btn" style={{ minHeight: '34px', marginLeft: 'auto' }}>Accorder le repos</button>
                <button type="button" className="m-btn" style={{ minHeight: '34px' }}>Refuser</button>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--border)', alignItems: 'flex-start' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--team-us)', flex: 'none', marginTop: '6px' }} />
            <span style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'color-mix(in srgb, var(--team-us) 13%, transparent)', color: 'var(--team-us)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 4h16v16H4z" />
                <path d="M8 9h8M8 13h8M8 17h5" />
              </svg>
            </span>
            {' '}
            <div style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '.06em', color: 'var(--team-us)', border: '1px solid color-mix(in srgb, var(--team-us) 53%, transparent)', borderRadius: '4px', padding: '1px 6px' }}>PATCH 26.2</span>
                <strong style={{ fontSize: '14px' }}>Le nouveau patch arrive mercredi</strong>
                <span className="m-muted" style={{ marginLeft: 'auto', fontSize: '12px' }}>Hier</span>
              </div>
              {' '}
              <div style={{ fontSize: '13px', lineHeight: '1.45', color: 'var(--text-soft)' }}>Trois champions joués par ton équipe sont affaiblis.</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 6px 2px 2px', borderRadius: '12px', background: 'var(--warn-bg)', fontSize: '11px', fontWeight: '700', color: 'var(--team-them)' }}>
                  <img src={asset('champions/Varus.png')} alt="Varus" width="20" height="20" style={{ borderRadius: '10px', objectFit: 'cover', flex: 'none' }} />
                  ▼ affaibli
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 6px 2px 2px', borderRadius: '12px', background: 'var(--warn-bg)', fontSize: '11px', fontWeight: '700', color: 'var(--team-them)' }}>
                  <img src={asset('champions/XinZhao.png')} alt="XinZhao" width="20" height="20" style={{ borderRadius: '10px', objectFit: 'cover', flex: 'none' }} />
                  ▼ affaibli
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 6px 2px 2px', borderRadius: '12px', background: 'var(--warn-bg)', fontSize: '11px', fontWeight: '700', color: 'var(--team-them)' }}>
                  <img src={asset('champions/Rakan.png')} alt="Rakan" width="20" height="20" style={{ borderRadius: '10px', objectFit: 'cover', flex: 'none' }} />
                  ▼ affaibli
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--border)', alignItems: 'flex-start' }}>
            <span style={{ width: '8px', flex: 'none' }} />
            <span style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'color-mix(in srgb, var(--accent-gold) 13%, transparent)', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M8 4h8v5a4 4 0 01-8 0z" />
                <path d="M8 6H5a3 3 0 003 4M16 6h3a3 3 0 01-3 4M12 13v4M8 20h8" />
              </svg>
            </span>
            {' '}
            <div style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '.06em', color: 'var(--accent-gold)', border: '1px solid color-mix(in srgb, var(--accent-gold) 53%, transparent)', borderRadius: '4px', padding: '1px 6px' }}>DIRECTION</span>
                <strong style={{ fontSize: '14px' }}>Objectif de la saison confirmé</strong>
                <span className="m-muted" style={{ marginLeft: 'auto', fontSize: '12px' }}>Hier</span>
              </div>
              {' '}
              <div style={{ fontSize: '13px', lineHeight: '1.45', color: 'var(--text-soft)' }}>Se qualifier pour le MSI. Budget transferts : 400 k€.</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--border)', alignItems: 'flex-start' }}>
            <span style={{ width: '8px', flex: 'none' }} />
            <img src={asset('photos/yike-4203fc46.jpg')} alt="" width="38" height="38" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
            {' '}
            <div style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '.06em', color: 'var(--text-muted)', border: '1px solid color-mix(in srgb, var(--text-muted) 53%, transparent)', borderRadius: '4px', padding: '1px 6px' }}>MARCHÉ</span>
                <strong style={{ fontSize: '14px' }}>{'Rumeur : un club LCK s\'intéresse à Yike'}</strong>
                <span className="m-muted" style={{ marginLeft: 'auto', fontSize: '12px' }}>Sam.</span>
              </div>
              {' '}
              <div style={{ fontSize: '13px', lineHeight: '1.45', color: 'var(--text-soft)' }}>Selon la presse coréenne, une offre pourrait arriver en mai.</div>
            </div>
          </div>
          {' '}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '14px' }}>
            <div style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px', borderRadius: '10px', background: 'var(--bg-bar)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--accent-gold)', display: 'flex' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M8 4h8v5a4 4 0 01-8 0z" />
                    <path d="M8 6H5a3 3 0 003 4M16 6h3a3 3 0 01-3 4M12 13v4M8 20h8" />
                  </svg>
                </span>
                <h2 className="m-h2" style={{ margin: '0' }}>Objectifs de la direction</h2>
              </div>
              {' '}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span>Top 4 du LEC Versus</span>
                <span className="m-muted">Attendu</span>
              </div>
              <span style={{ display: 'block', width: '100%', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
                <span style={{ display: 'block', height: '100%', width: '0%', background: 'var(--team-us)' }} />
              </span>
              {' '}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span>Qualification MSI</span>
                <span style={{ color: 'var(--accent-gold)', fontWeight: '700' }}>Objectif principal</span>
              </div>
              <span style={{ display: 'block', width: '100%', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
                <span style={{ display: 'block', height: '100%', width: '0%', background: 'var(--accent-gold)' }} />
              </span>
              {' '}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span>Confiance de la direction</span>
                <strong style={{ color: 'var(--team-us)' }}>78 %</strong>
              </div>
              <span style={{ display: 'block', width: '100%', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
                <span style={{ display: 'block', height: '100%', width: '78%', background: 'var(--team-us)' }} />
              </span>
            </div>
            {' '}
            <div style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px', borderRadius: '10px', background: 'var(--bg-bar)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--accent-gold)', display: 'flex' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <ellipse cx="12" cy="7" rx="7" ry="3" />
                    <path d="M5 7v5c0 1.7 3.1 3 7 3s7-1.3 7-3V7M5 12v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5" />
                  </svg>
                </span>
                <h2 className="m-h2" style={{ margin: '0' }}>Finances</h2>
              </div>
              {' '}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span>Budget restant</span>
                <strong>2,4 M€</strong>
              </div>
              {' '}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span>Masse salariale</span>
                <span>1,6 M€ / 1,9 M€</span>
              </div>
              <span style={{ display: 'block', width: '100%', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
                <span style={{ display: 'block', height: '100%', width: '84%', background: 'var(--team-them)' }} />
              </span>
              {' '}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span>Revenus sponsors</span>
                <span style={{ color: 'var(--team-us)' }}>+120 k€ / mois</span>
              </div>
            </div>
          </div>
        </section>
        {' '}
        <div style={{ flex: '1 1 300px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <section className="m-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'linear-gradient(160deg,var(--hero-bg),var(--bg-card) 70%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="m-h2" style={{ margin: '0' }}>Prochain match</h2>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--team-them)' }}>J-5</span>
            </div>
            {' '}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <img src={asset('logos/karmine-corp-f3aa9bbd.png')} alt="" width="56" height="56" style={{ objectFit: 'contain', flex: 'none' }} />
                <strong style={{ fontSize: '13px' }}>Karmine Corp</strong>
              </div>
              {' '}
              <span className="m-muted" style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '22px', fontWeight: '700' }}>VS</span>
              {' '}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <img src={asset('logos/g2-esports-7d6673d3.png')} alt="" width="56" height="56" style={{ objectFit: 'contain', flex: 'none' }} />
                <strong style={{ fontSize: '13px' }}>G2 Esports</strong>
              </div>
            </div>
            {' '}
            <div className="m-muted" style={{ fontSize: '12px', textAlign: 'center' }}>LEC Versus · Semaine 1 · Bo1 · Sam. 17 janv. 18:00</div>
            {' '}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
              <span style={{ color: 'var(--team-us)', fontWeight: '700' }}>46 %</span>
              <span style={{ flex: '1', height: '6px', borderRadius: '3px', background: 'var(--team-them)', overflow: 'hidden', display: 'block' }}>
                <span style={{ display: 'block', height: '100%', width: '46%', background: 'var(--team-us)' }} />
              </span>
              <span style={{ color: 'var(--team-them)', fontWeight: '700' }}>54 %</span>
            </div>
            {' '}
            <div className="m-muted" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span>Confrontations 2025 : 2 V – 3 D</span>
              <span>
                {'Forme G2 : '}
                <span style={{ color: 'var(--team-us)' }}>V V</span>
                {' '}
                <span style={{ color: 'var(--team-them)' }}>D</span>
              </span>
            </div>
            {' '}
            <a href="#draft" className="m-cta" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>Préparer le match</a>
          </section>
          {' '}
          <section className="m-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h2 className="m-h2" style={{ margin: '0' }}>{'État de l\'équipe'}</h2>
            {' '}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <img src={asset('photos/canna-7577c239.jpg')} alt="" width="44" height="44" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--team-us)', flex: 'none' }} />
                <span style={{ fontSize: '11px', fontWeight: '600' }}>Canna</span>
                <span style={{ color: 'var(--accent-gold)', display: 'flex' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" role="img" aria-label="Top" style={{ flex: 'none' }}>
                    <g fill="currentColor" fillOpacity=".35">
                      <path d="M22 6V22H6L10 18H18V10Z" />
                    </g>
                    <g fill="currentColor">
                      <path d="M2 2H18L14 6H6V14L2 18Z" />
                      <rect x="9.5" y="9.5" width="5" height="5" />
                    </g>
                  </svg>
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <img src={asset('photos/yike-4203fc46.jpg')} alt="" width="44" height="44" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--team-us)', flex: 'none' }} />
                <span style={{ fontSize: '11px', fontWeight: '600' }}>Yike</span>
                <span style={{ color: 'var(--accent-gold)', display: 'flex' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" role="img" aria-label="Jungle" style={{ flex: 'none' }}>
                    <g fill="currentColor" fillOpacity=".35" />
                    <g fill="currentColor">
                      <path d="M5 22C3.5 16 3 10 4 3C7 8 9 13 9.5 19Z" />
                      <path d="M11.2 22C10.3 15 10.6 8 12 1.5C13.4 8 13.7 15 12.8 22Z" />
                      <path d="M19 22C20.5 16 21 10 20 3C17 8 15 13 14.5 19Z" />
                    </g>
                  </svg>
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <img src={asset('photos/kyeahoo-308e48bf.jpg')} alt="" width="44" height="44" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--team-them)', flex: 'none' }} />
                <span style={{ fontSize: '11px', fontWeight: '600' }}>kyeahoo</span>
                <span style={{ color: 'var(--accent-gold)', display: 'flex' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" role="img" aria-label="Mid" style={{ flex: 'none' }}>
                    <g fill="currentColor" fillOpacity=".35">
                      <path d="M2 2H13L2 13Z" />
                      <path d="M22 22H11L22 11Z" />
                    </g>
                    <g fill="currentColor">
                      <path d="M17 2H22V7L7 22H2V17Z" />
                    </g>
                  </svg>
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <img src={asset('photos/caliste-e2af2b77.jpeg')} alt="" width="44" height="44" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--team-them)', flex: 'none' }} />
                <span style={{ fontSize: '11px', fontWeight: '600' }}>Caliste</span>
                <span style={{ color: 'var(--accent-gold)', display: 'flex' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" role="img" aria-label="ADC" style={{ flex: 'none' }}>
                    <g fill="currentColor" fillOpacity=".35">
                      <path d="M2 18V2H18L14 6H6V14Z" />
                    </g>
                    <g fill="currentColor">
                      <path d="M22 22H6L10 18H18V10L22 6Z" />
                      <rect x="9.5" y="9.5" width="5" height="5" />
                    </g>
                  </svg>
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <img src={asset('photos/busio-3e722c8e.jpg')} alt="" width="44" height="44" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--team-us)', flex: 'none' }} />
                <span style={{ fontSize: '11px', fontWeight: '600' }}>Busio</span>
                <span style={{ color: 'var(--accent-gold)', display: 'flex' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" role="img" aria-label="Support" style={{ flex: 'none' }}>
                    <g fill="currentColor" fillOpacity=".35" />
                    <g fill="currentColor">
                      <path d="M12 6.5L15.2 10.5L12 22L8.8 10.5Z" />
                      <path d="M1.5 6H9L10.2 9L7.5 12.5L5 9.5Z" />
                      <path d="M22.5 6H15L13.8 9L16.5 12.5L19 9.5Z" />
                      <path d="M9.5 2.5H14.5L12 5.2Z" />
                    </g>
                  </svg>
                </span>
              </div>
            </div>
            {' '}
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '8px 10px', alignItems: 'center', fontSize: '12px' }}>
              <span className="m-muted">Moral</span>
              <span style={{ display: 'block', width: '100%', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
                <span style={{ display: 'block', height: '100%', width: '74%', background: 'var(--team-us)' }} />
              </span>
              <strong style={{ color: 'var(--team-us)' }}>Bon</strong>
              {' '}
              <span className="m-muted">Fatigue</span>
              <span style={{ display: 'block', width: '100%', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
                <span style={{ display: 'block', height: '100%', width: '58%', background: 'var(--team-them)' }} />
              </span>
              <strong style={{ color: 'var(--team-them)' }}>Élevée</strong>
              {' '}
              <span className="m-muted">Chimie</span>
              <span style={{ display: 'block', width: '100%', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
                <span style={{ display: 'block', height: '100%', width: '62%', background: 'var(--accent-blue)' }} />
              </span>
              <strong>Correcte</strong>
            </div>
          </section>
          {' '}
          <section className="m-card" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <h2 className="m-h2" style={{ margin: '0' }}>LEC Versus · Pronostics médias</h2>
              <a href="#" style={{ fontSize: '12px' }}>Tout voir</a>
            </div>
            {' '}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 6px', borderRadius: '6px', fontSize: '13px', background: 'var(--bg-active)' }}>
              <span className="m-muted" style={{ width: '18px', textAlign: 'right' }}>1</span>
              <img src={asset('logos/karmine-corp-f3aa9bbd.png')} alt="" width="20" height="20" style={{ objectFit: 'contain', flex: 'none' }} />
              <span style={{ flex: '1', fontWeight: '700' }}>Karmine Corp</span>
              <span className="m-muted">0 – 0</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 6px', borderRadius: '6px', fontSize: '13px' }}>
              <span className="m-muted" style={{ width: '18px', textAlign: 'right' }}>2</span>
              <img src={asset('logos/g2-esports-7d6673d3.png')} alt="" width="20" height="20" style={{ objectFit: 'contain', flex: 'none' }} />
              <span style={{ flex: '1' }}>G2 Esports</span>
              <span className="m-muted">0 – 0</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 6px', borderRadius: '6px', fontSize: '13px' }}>
              <span className="m-muted" style={{ width: '18px', textAlign: 'right' }}>3</span>
              <img src={asset('logos/fnatic-78f183fa.png')} alt="" width="20" height="20" style={{ objectFit: 'contain', flex: 'none' }} />
              <span style={{ flex: '1' }}>Fnatic</span>
              <span className="m-muted">0 – 0</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 6px', borderRadius: '6px', fontSize: '13px' }}>
              <span className="m-muted" style={{ width: '18px', textAlign: 'right' }}>4</span>
              <img src={asset('logos/movistar-koi-4acc4065.png')} alt="" width="20" height="20" style={{ objectFit: 'contain', flex: 'none' }} />
              <span style={{ flex: '1' }}>Movistar KOI</span>
              <span className="m-muted">0 – 0</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 6px', borderRadius: '6px', fontSize: '13px' }}>
              <span className="m-muted" style={{ width: '18px', textAlign: 'right' }}>5</span>
              <img src={asset('logos/team-heretics-1285e1c0.png')} alt="" width="20" height="20" style={{ objectFit: 'contain', flex: 'none' }} />
              <span style={{ flex: '1' }}>Team Heretics</span>
              <span className="m-muted">0 – 0</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 6px', borderRadius: '6px', fontSize: '13px' }}>
              <span className="m-muted" style={{ width: '18px', textAlign: 'right' }}>6</span>
              <img src={asset('logos/team-vitality-e8d8ae99.png')} alt="" width="20" height="20" style={{ objectFit: 'contain', flex: 'none' }} />
              <span style={{ flex: '1' }}>Team Vitality</span>
              <span className="m-muted">0 – 0</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 6px', borderRadius: '6px', fontSize: '13px' }}>
              <span className="m-muted" style={{ width: '18px', textAlign: 'right' }}>7</span>
              <img src={asset('logos/giantx-6cd05f0a.png')} alt="" width="20" height="20" style={{ objectFit: 'contain', flex: 'none' }} />
              <span style={{ flex: '1' }}>GIANTX</span>
              <span className="m-muted">0 – 0</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 6px', borderRadius: '6px', fontSize: '13px' }}>
              <span className="m-muted" style={{ width: '18px', textAlign: 'right' }}>8</span>
              <img src={asset('logos/natus-vincere-d2ba9f92.png')} alt="" width="20" height="20" style={{ objectFit: 'contain', flex: 'none' }} />
              <span style={{ flex: '1' }}>Natus Vincere</span>
              <span className="m-muted">0 – 0</span>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
