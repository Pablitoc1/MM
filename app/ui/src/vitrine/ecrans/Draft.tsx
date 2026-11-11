// Écran « Draft » de la maquette v2, reproduit à l'identique.
// Généré depuis le rendu de la maquette, puis branché sur les fichiers de M1 (photos, logos).
// Les chiffres sont ceux de la maquette : des exemples en attendant les jalons qui les calculent.
import { assetUrl as asset } from '../../api';

export function EcranDraft() {
  return (
    <div style={{ minHeight: '1000px', background: 'var(--bg-page)', color: 'var(--text)', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '10px 24px', background: 'var(--bg-bar)', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={asset('logos/karmine-corp-f3aa9bbd.png')} alt="" width="40" height="40" style={{ objectFit: 'contain', flex: 'none' }} />
          <div>
            <div style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontWeight: '700', fontSize: '18px' }}>Karmine Corp</div>
            <div className="m-muted" style={{ fontSize: '12px' }}>Côté bleu · 1er choix</div>
          </div>
        </div>
        {' '}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <span className="m-muted" style={{ fontSize: '12px' }}>LEC Versus · Semaine 1 · Bo1 · Patch 26.2</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600' }}>Phase de picks 1</span>
            <span className="m-pulse" style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '.06em', color: 'var(--bg-page)', background: 'var(--team-us)', borderRadius: '4px', padding: '2px 6px', whiteSpace: 'nowrap' }}>KC CHOISIT · MID</span>
            <span style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '24px', fontWeight: '700', color: 'var(--team-us)' }}>0:24</span>
          </div>
          <span style={{ width: '220px' }}>
            <span style={{ display: 'block', width: '100%', height: '4px', borderRadius: '2px', background: 'var(--border)', overflow: 'hidden' }}>
              <span style={{ display: 'block', height: '100%', width: '80%', background: 'var(--team-us)' }} />
            </span>
          </span>
        </div>
        {' '}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexDirection: 'row-reverse', textAlign: 'right' }}>
          <img src={asset('logos/g2-esports-7d6673d3.png')} alt="" width="40" height="40" style={{ objectFit: 'contain', flex: 'none' }} />
          <div>
            <div style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontWeight: '700', fontSize: '18px' }}>G2 Esports</div>
            <div className="m-muted" style={{ fontSize: '12px' }}>Côté rouge</div>
          </div>
        </div>
      </header>
      {' '}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 24px', gap: '16px', flexWrap: 'wrap', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="m-muted" style={{ fontSize: '12px', width: '46px' }}>Bans</span>
          <div title="Azir banni" style={{ position: 'relative', width: '46px', height: '46px', flex: 'none' }}>
            <img src={asset('champions/Azir.png')} alt="Azir" width="46" height="46" style={{ borderRadius: '8px', objectFit: 'cover', flex: 'none', filter: 'grayscale(1) brightness(.55)' }} />
            <svg width="46" height="46" viewBox="0 0 46 46" aria-hidden="true" style={{ position: 'absolute', inset: '0' }}>
              <path d="M6 40L40 6" strokeWidth="3" strokeLinecap="round" style={{ stroke: 'var(--team-us)' }} />
            </svg>
          </div>
          <div title="Rumble banni" style={{ position: 'relative', width: '46px', height: '46px', flex: 'none' }}>
            <img src={asset('champions/Rumble.png')} alt="Rumble" width="46" height="46" style={{ borderRadius: '8px', objectFit: 'cover', flex: 'none', filter: 'grayscale(1) brightness(.55)' }} />
            <svg width="46" height="46" viewBox="0 0 46 46" aria-hidden="true" style={{ position: 'absolute', inset: '0' }}>
              <path d="M6 40L40 6" strokeWidth="3" strokeLinecap="round" style={{ stroke: 'var(--team-us)' }} />
            </svg>
          </div>
          <div title="Vi banni" style={{ position: 'relative', width: '46px', height: '46px', flex: 'none' }}>
            <img src={asset('champions/Vi.png')} alt="Vi" width="46" height="46" style={{ borderRadius: '8px', objectFit: 'cover', flex: 'none', filter: 'grayscale(1) brightness(.55)' }} />
            <svg width="46" height="46" viewBox="0 0 46 46" aria-hidden="true" style={{ position: 'absolute', inset: '0' }}>
              <path d="M6 40L40 6" strokeWidth="3" strokeLinecap="round" style={{ stroke: 'var(--team-us)' }} />
            </svg>
          </div>
          <span style={{ width: '46px', height: '46px', borderRadius: '8px', border: '1px dashed var(--border-strong)' }} />
          <span style={{ width: '46px', height: '46px', borderRadius: '8px', border: '1px dashed var(--border-strong)' }} />
        </div>
        {' '}
        <div className="m-muted" style={{ display: 'flex', gap: '6px', fontSize: '11px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 6l8 6-8 6zM12 6l8 6-8 6z" />
            </svg>
            {' Ensuite : G2 choisit 2 champions (Mid, Support)'}
          </span>
        </div>
        {' '}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexDirection: 'row-reverse' }}>
          <span className="m-muted" style={{ fontSize: '12px', width: '46px', textAlign: 'right' }}>Bans</span>
          <div title="K'Santé banni" style={{ position: 'relative', width: '46px', height: '46px', flex: 'none' }}>
            <img src={asset('champions/KSante.png')} alt="KSante" width="46" height="46" style={{ borderRadius: '8px', objectFit: 'cover', flex: 'none', filter: 'grayscale(1) brightness(.55)' }} />
            <svg width="46" height="46" viewBox="0 0 46 46" aria-hidden="true" style={{ position: 'absolute', inset: '0' }}>
              <path d="M6 40L40 6" strokeWidth="3" strokeLinecap="round" style={{ stroke: 'var(--team-them)' }} />
            </svg>
          </div>
          <div title="Kai'Sa banni" style={{ position: 'relative', width: '46px', height: '46px', flex: 'none' }}>
            <img src={asset('champions/Kaisa.png')} alt="Kaisa" width="46" height="46" style={{ borderRadius: '8px', objectFit: 'cover', flex: 'none', filter: 'grayscale(1) brightness(.55)' }} />
            <svg width="46" height="46" viewBox="0 0 46 46" aria-hidden="true" style={{ position: 'absolute', inset: '0' }}>
              <path d="M6 40L40 6" strokeWidth="3" strokeLinecap="round" style={{ stroke: 'var(--team-them)' }} />
            </svg>
          </div>
          <div title="Taliyah banni" style={{ position: 'relative', width: '46px', height: '46px', flex: 'none' }}>
            <img src={asset('champions/Taliyah.png')} alt="Taliyah" width="46" height="46" style={{ borderRadius: '8px', objectFit: 'cover', flex: 'none', filter: 'grayscale(1) brightness(.55)' }} />
            <svg width="46" height="46" viewBox="0 0 46 46" aria-hidden="true" style={{ position: 'absolute', inset: '0' }}>
              <path d="M6 40L40 6" strokeWidth="3" strokeLinecap="round" style={{ stroke: 'var(--team-them)' }} />
            </svg>
          </div>
          <span style={{ width: '46px', height: '46px', borderRadius: '8px', border: '1px dashed var(--border-strong)' }} />
          <span style={{ width: '46px', height: '46px', borderRadius: '8px', border: '1px dashed var(--border-strong)' }} />
        </div>
      </div>
      {' '}
      <div style={{ display: 'flex', gap: '16px', padding: '16px 24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '0' }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '10px', background: 'linear-gradient(90deg,color-mix(in srgb, var(--team-us) 13%, transparent),var(--bg-card) 70%)', border: '1px solid var(--border)' }}>
            <div style={{ position: 'relative', width: '64px', height: '64px', flex: 'none' }}>
              <img src={asset('champions/Renekton.png')} alt="Renekton" width="64" height="64" style={{ borderRadius: '10px', objectFit: 'cover', flex: 'none', border: '2px solid var(--team-us)' }} />
            </div>
            <div style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
              <strong style={{ fontSize: '15px' }}>Renekton</strong>
              <span className="m-muted" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
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
                Canna
              </span>
            </div>
            <img src={asset('photos/canna-7577c239.jpg')} alt="" width="40" height="40" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--team-us)', flex: 'none' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '10px', background: 'linear-gradient(90deg,color-mix(in srgb, var(--team-us) 13%, transparent),var(--bg-card) 70%)', border: '1px solid var(--border)' }}>
            <div style={{ position: 'relative', width: '64px', height: '64px', flex: 'none' }}>
              <img src={asset('champions/XinZhao.png')} alt="XinZhao" width="64" height="64" style={{ borderRadius: '10px', objectFit: 'cover', flex: 'none', border: '2px solid var(--team-us)' }} />
            </div>
            <div style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
              <strong style={{ fontSize: '15px' }}>Xin Zhao</strong>
              <span className="m-muted" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
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
                Yike
              </span>
            </div>
            <img src={asset('photos/yike-4203fc46.jpg')} alt="" width="40" height="40" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--team-us)', flex: 'none' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '10px', background: 'color-mix(in srgb, var(--team-us) 8%, transparent)', border: '1px solid var(--team-us)' }}>
            <div className="m-pulse" style={{ width: '64px', height: '64px', borderRadius: '10px', border: '2px dashed var(--team-us)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', position: 'relative' }}>
              <img src={asset('champions/Orianna.png')} alt="Orianna" width="56" height="56" style={{ borderRadius: '8px', objectFit: 'cover', flex: 'none', opacity: '.55' }} />
            </div>
            <div style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
              <span>
                <span className="m-pulse" style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '.06em', color: 'var(--bg-page)', background: 'var(--team-us)', borderRadius: '4px', padding: '2px 6px', whiteSpace: 'nowrap' }}>EN COURS</span>
              </span>
              <strong style={{ fontSize: '15px', color: 'var(--team-us)' }}>Orianna ?</strong>
              <span className="m-muted" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
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
                kyeahoo
              </span>
            </div>
            <img src={asset('photos/kyeahoo-308e48bf.jpg')} alt="" width="40" height="40" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--team-us)', flex: 'none' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '10px', border: '1px solid var(--border-strong)', background: 'var(--bg-bar)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', color: 'var(--border-strong)' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" role="img" aria-label="ADC" style={{ flex: 'none' }}>
                <g fillOpacity=".35" style={{ fill: 'var(--border-strong)' }}>
                  <path d="M2 18V2H18L14 6H6V14Z" />
                </g>
                <g style={{ fill: 'var(--border-strong)' }}>
                  <path d="M22 22H6L10 18H18V10L22 6Z" />
                  <rect x="9.5" y="9.5" width="5" height="5" />
                </g>
              </svg>
            </div>
            <div style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
              <span className="m-muted" style={{ fontSize: '13px' }}>À venir</span>
              <span className="m-muted" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                <span style={{ color: 'var(--accent-gold)', display: 'flex' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" role="img" aria-label="ADC" style={{ flex: 'none' }}>
                    <g fill="currentColor" fillOpacity=".35">
                      <path d="M2 18V2H18L14 6H6V14Z" />
                    </g>
                    <g fill="currentColor">
                      <path d="M22 22H6L10 18H18V10L22 6Z" />
                      <rect x="9.5" y="9.5" width="5" height="5" />
                    </g>
                  </svg>
                </span>
                Caliste
              </span>
            </div>
            <img src={asset('photos/caliste-e2af2b77.jpeg')} alt="" width="40" height="40" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '10px', border: '1px solid var(--border-strong)', background: 'var(--bg-bar)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', color: 'var(--border-strong)' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" role="img" aria-label="Support" style={{ flex: 'none' }}>
                <g fillOpacity=".35" style={{ fill: 'var(--border-strong)' }} />
                <g style={{ fill: 'var(--border-strong)' }}>
                  <path d="M12 6.5L15.2 10.5L12 22L8.8 10.5Z" />
                  <path d="M1.5 6H9L10.2 9L7.5 12.5L5 9.5Z" />
                  <path d="M22.5 6H15L13.8 9L16.5 12.5L19 9.5Z" />
                  <path d="M9.5 2.5H14.5L12 5.2Z" />
                </g>
              </svg>
            </div>
            <div style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
              <span className="m-muted" style={{ fontSize: '13px' }}>À venir</span>
              <span className="m-muted" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
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
                Busio
              </span>
            </div>
            <img src={asset('photos/busio-3e722c8e.jpg')} alt="" width="40" height="40" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
          </div>
        </div>
        {' '}
        <div style={{ flex: '2 1 560px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <section className="m-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <h2 className="m-h2" style={{ margin: '0' }}>Champions de kyeahoo · Mid</h2>
              {' '}
              <div style={{ display: 'flex', gap: '4px' }}>
                <button type="button" className="m-btn" aria-label="Top" style={{ padding: '0 10px', minHeight: '34px', display: 'flex', alignItems: 'center', color: 'var(--accent-gold)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" role="img" aria-label="Top" style={{ flex: 'none' }}>
                    <g fill="currentColor" fillOpacity=".35">
                      <path d="M22 6V22H6L10 18H18V10Z" />
                    </g>
                    <g fill="currentColor">
                      <path d="M2 2H18L14 6H6V14L2 18Z" />
                      <rect x="9.5" y="9.5" width="5" height="5" />
                    </g>
                  </svg>
                </button>
                <button type="button" className="m-btn" aria-label="Jungle" style={{ padding: '0 10px', minHeight: '34px', display: 'flex', alignItems: 'center', color: 'var(--accent-gold)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" role="img" aria-label="Jungle" style={{ flex: 'none' }}>
                    <g fill="currentColor" fillOpacity=".35" />
                    <g fill="currentColor">
                      <path d="M5 22C3.5 16 3 10 4 3C7 8 9 13 9.5 19Z" />
                      <path d="M11.2 22C10.3 15 10.6 8 12 1.5C13.4 8 13.7 15 12.8 22Z" />
                      <path d="M19 22C20.5 16 21 10 20 3C17 8 15 13 14.5 19Z" />
                    </g>
                  </svg>
                </button>
                <button type="button" className="m-btn m-on" aria-label="Mid" style={{ padding: '0 10px', minHeight: '34px', display: 'flex', alignItems: 'center', color: 'var(--accent-gold)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" role="img" aria-label="Mid" style={{ flex: 'none' }}>
                    <g fill="currentColor" fillOpacity=".35">
                      <path d="M2 2H13L2 13Z" />
                      <path d="M22 22H11L22 11Z" />
                    </g>
                    <g fill="currentColor">
                      <path d="M17 2H22V7L7 22H2V17Z" />
                    </g>
                  </svg>
                </button>
                <button type="button" className="m-btn" aria-label="ADC" style={{ padding: '0 10px', minHeight: '34px', display: 'flex', alignItems: 'center', color: 'var(--accent-gold)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" role="img" aria-label="ADC" style={{ flex: 'none' }}>
                    <g fill="currentColor" fillOpacity=".35">
                      <path d="M2 18V2H18L14 6H6V14Z" />
                    </g>
                    <g fill="currentColor">
                      <path d="M22 22H6L10 18H18V10L22 6Z" />
                      <rect x="9.5" y="9.5" width="5" height="5" />
                    </g>
                  </svg>
                </button>
                <button type="button" className="m-btn" aria-label="Support" style={{ padding: '0 10px', minHeight: '34px', display: 'flex', alignItems: 'center', color: 'var(--accent-gold)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" role="img" aria-label="Support" style={{ flex: 'none' }}>
                    <g fill="currentColor" fillOpacity=".35" />
                    <g fill="currentColor">
                      <path d="M12 6.5L15.2 10.5L12 22L8.8 10.5Z" />
                      <path d="M1.5 6H9L10.2 9L7.5 12.5L5 9.5Z" />
                      <path d="M22.5 6H15L13.8 9L16.5 12.5L19 9.5Z" />
                      <path d="M9.5 2.5H14.5L12 5.2Z" />
                    </g>
                  </svg>
                </button>
              </div>
            </div>
            {' '}
            <div className="m-muted" style={{ display: 'flex', gap: '10px', fontSize: '11px', marginBottom: '10px', flexWrap: 'wrap' }}>
              {'Maîtrise : '}
              <span style={{ color: 'var(--team-us)', fontWeight: '700' }}>A</span>
              <span style={{ color: 'var(--accent-blue)', fontWeight: '700' }}>B</span>
              <span style={{ color: 'var(--accent-gold)', fontWeight: '700' }}>C</span>
              <span style={{ color: 'var(--team-them)', fontWeight: '700' }}>D</span>
              {' · V = victoires en compétition'}
            </div>
            {' '}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '8px' }}>
              <button type="button" aria-pressed="true" style={{ all: 'unset', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '5px', padding: '8px', borderRadius: '10px', background: 'var(--bg-bar)', border: '2px solid var(--team-us)', boxShadow: '0 0 0 3px color-mix(in srgb, var(--team-us) 20%, transparent)', position: 'relative' }}>
                <div style={{ position: 'relative' }}>
                  <img src={asset('champions/Orianna.png')} alt="Orianna" width="72" height="72" style={{ borderRadius: '8px', objectFit: 'cover', flex: 'none', width: '100%', height: 'auto', aspectRatio: '1' }} />
                  <span style={{ position: 'absolute', top: '4px', left: '4px', width: '22px', height: '22px', borderRadius: '5px', background: 'color-mix(in srgb, var(--bg-page) 85%, transparent)', color: 'var(--team-us)', fontWeight: '800', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--team-us)' }}>A</span>
                </div>
                {' '}
                <span style={{ fontSize: '13px', fontWeight: '700' }}>Orianna</span>
                {' '}
                <span className="m-muted" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span>62 % V</span>
                  <span>12 parties</span>
                </span>
                {' '}
                <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--team-us)' }}>Conseil du coach</span>
              </button>
              <button type="button" aria-pressed="false" style={{ all: 'unset', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '5px', padding: '8px', borderRadius: '10px', background: 'var(--bg-bar)', border: '1px solid var(--border)', position: 'relative' }}>
                <div style={{ position: 'relative' }}>
                  <img src={asset('champions/Syndra.png')} alt="Syndra" width="72" height="72" style={{ borderRadius: '8px', objectFit: 'cover', flex: 'none', width: '100%', height: 'auto', aspectRatio: '1' }} />
                  <span style={{ position: 'absolute', top: '4px', left: '4px', width: '22px', height: '22px', borderRadius: '5px', background: 'color-mix(in srgb, var(--bg-page) 85%, transparent)', color: 'var(--team-us)', fontWeight: '800', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--team-us)' }}>A</span>
                </div>
                {' '}
                <span style={{ fontSize: '13px', fontWeight: '700' }}>Syndra</span>
                {' '}
                <span className="m-muted" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span>58 % V</span>
                  <span>12 parties</span>
                </span>
                {' '}
                <span style={{ fontSize: '10px' }}>{' '}</span>
              </button>
              <button type="button" aria-pressed="false" style={{ all: 'unset', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '5px', padding: '8px', borderRadius: '10px', background: 'var(--bg-bar)', border: '1px solid var(--border)', position: 'relative' }}>
                <div style={{ position: 'relative' }}>
                  <img src={asset('champions/Ahri.png')} alt="Ahri" width="72" height="72" style={{ borderRadius: '8px', objectFit: 'cover', flex: 'none', width: '100%', height: 'auto', aspectRatio: '1' }} />
                  <span style={{ position: 'absolute', top: '4px', left: '4px', width: '22px', height: '22px', borderRadius: '5px', background: 'color-mix(in srgb, var(--bg-page) 85%, transparent)', color: 'var(--accent-blue)', fontWeight: '800', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--accent-blue)' }}>B</span>
                </div>
                {' '}
                <span style={{ fontSize: '13px', fontWeight: '700' }}>Ahri</span>
                {' '}
                <span className="m-muted" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span>54 % V</span>
                  <span>6 parties</span>
                </span>
                {' '}
                <span style={{ fontSize: '10px' }}>{' '}</span>
              </button>
              <button type="button" aria-pressed="false" style={{ all: 'unset', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '5px', padding: '8px', borderRadius: '10px', background: 'var(--bg-bar)', border: '1px solid var(--border)', position: 'relative' }}>
                <div style={{ position: 'relative' }}>
                  <img src={asset('champions/Sylas.png')} alt="Sylas" width="72" height="72" style={{ borderRadius: '8px', objectFit: 'cover', flex: 'none', width: '100%', height: 'auto', aspectRatio: '1' }} />
                  <span style={{ position: 'absolute', top: '4px', left: '4px', width: '22px', height: '22px', borderRadius: '5px', background: 'color-mix(in srgb, var(--bg-page) 85%, transparent)', color: 'var(--accent-blue)', fontWeight: '800', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--accent-blue)' }}>B</span>
                </div>
                {' '}
                <span style={{ fontSize: '13px', fontWeight: '700' }}>Sylas</span>
                {' '}
                <span className="m-muted" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span>51 % V</span>
                  <span>6 parties</span>
                </span>
                {' '}
                <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--accent-blue)' }}>Contre Sejuani</span>
              </button>
              <button type="button" aria-pressed="false" style={{ all: 'unset', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '5px', padding: '8px', borderRadius: '10px', background: 'var(--bg-bar)', border: '1px solid var(--border)', position: 'relative' }}>
                <div style={{ position: 'relative' }}>
                  <img src={asset('champions/Viktor.png')} alt="Viktor" width="72" height="72" style={{ borderRadius: '8px', objectFit: 'cover', flex: 'none', width: '100%', height: 'auto', aspectRatio: '1' }} />
                  <span style={{ position: 'absolute', top: '4px', left: '4px', width: '22px', height: '22px', borderRadius: '5px', background: 'color-mix(in srgb, var(--bg-page) 85%, transparent)', color: 'var(--accent-gold)', fontWeight: '800', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--accent-gold)' }}>C</span>
                </div>
                {' '}
                <span style={{ fontSize: '13px', fontWeight: '700' }}>Viktor</span>
                {' '}
                <span className="m-muted" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span>49 % V</span>
                  <span>2 parties</span>
                </span>
                {' '}
                <span style={{ fontSize: '10px' }}>{' '}</span>
              </button>
              <button type="button" aria-pressed="false" style={{ all: 'unset', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '5px', padding: '8px', borderRadius: '10px', background: 'var(--bg-bar)', border: '1px solid var(--border)', position: 'relative' }}>
                <div style={{ position: 'relative' }}>
                  <img src={asset('champions/Corki.png')} alt="Corki" width="72" height="72" style={{ borderRadius: '8px', objectFit: 'cover', flex: 'none', width: '100%', height: 'auto', aspectRatio: '1' }} />
                  <span style={{ position: 'absolute', top: '4px', left: '4px', width: '22px', height: '22px', borderRadius: '5px', background: 'color-mix(in srgb, var(--bg-page) 85%, transparent)', color: 'var(--accent-gold)', fontWeight: '800', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--accent-gold)' }}>C</span>
                </div>
                {' '}
                <span style={{ fontSize: '13px', fontWeight: '700' }}>Corki</span>
                {' '}
                <span className="m-muted" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span>52 % V</span>
                  <span>2 parties</span>
                </span>
                {' '}
                <span style={{ fontSize: '10px' }}>{' '}</span>
              </button>
              <button type="button" aria-pressed="false" style={{ all: 'unset', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '5px', padding: '8px', borderRadius: '10px', background: 'var(--bg-bar)', border: '1px solid var(--border)', position: 'relative' }}>
                <div style={{ position: 'relative' }}>
                  <img src={asset('champions/Yone.png')} alt="Yone" width="72" height="72" style={{ borderRadius: '8px', objectFit: 'cover', flex: 'none', width: '100%', height: 'auto', aspectRatio: '1' }} />
                  <span style={{ position: 'absolute', top: '4px', left: '4px', width: '22px', height: '22px', borderRadius: '5px', background: 'color-mix(in srgb, var(--bg-page) 85%, transparent)', color: 'var(--accent-blue)', fontWeight: '800', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--accent-blue)' }}>B</span>
                </div>
                {' '}
                <span style={{ fontSize: '13px', fontWeight: '700' }}>Yone</span>
                {' '}
                <span className="m-muted" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span>47 % V</span>
                  <span>6 parties</span>
                </span>
                {' '}
                <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--team-them)' }}>Dégâts physiques</span>
              </button>
              <button type="button" aria-pressed="false" style={{ all: 'unset', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '5px', padding: '8px', borderRadius: '10px', background: 'var(--bg-bar)', border: '1px solid var(--border)', position: 'relative' }}>
                <div style={{ position: 'relative' }}>
                  <img src={asset('champions/Leblanc.png')} alt="Leblanc" width="72" height="72" style={{ borderRadius: '8px', objectFit: 'cover', flex: 'none', width: '100%', height: 'auto', aspectRatio: '1' }} />
                  <span style={{ position: 'absolute', top: '4px', left: '4px', width: '22px', height: '22px', borderRadius: '5px', background: 'color-mix(in srgb, var(--bg-page) 85%, transparent)', color: 'var(--team-them)', fontWeight: '800', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--team-them)' }}>D</span>
                </div>
                {' '}
                <span style={{ fontSize: '13px', fontWeight: '700' }}>LeBlanc</span>
                {' '}
                <span className="m-muted" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span>44 % V</span>
                  <span>2 parties</span>
                </span>
                {' '}
                <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--team-them)' }}>Peu joué</span>
              </button>
              <button type="button" aria-pressed="false" style={{ all: 'unset', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '5px', padding: '8px', borderRadius: '10px', background: 'var(--bg-bar)', border: '1px solid var(--border)', position: 'relative' }}>
                <div style={{ position: 'relative' }}>
                  <img src={asset('champions/Azir.png')} alt="Azir" width="72" height="72" style={{ borderRadius: '8px', objectFit: 'cover', flex: 'none', filter: 'grayscale(1) brightness(.5)', width: '100%', height: 'auto', aspectRatio: '1' }} />
                  <span style={{ position: 'absolute', top: '4px', left: '4px', width: '22px', height: '22px', borderRadius: '5px', background: 'color-mix(in srgb, var(--bg-page) 85%, transparent)', color: 'var(--text-dim)', fontWeight: '800', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-strong)' }}>A</span>
                  <span style={{ position: 'absolute', inset: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="40" height="40" viewBox="0 0 40 40">
                      <circle cx="20" cy="20" r="15" fill="none" strokeWidth="3" style={{ stroke: 'var(--danger)' }} />
                      <path d="M9 31L31 9" strokeWidth="3" style={{ stroke: 'var(--danger)' }} />
                    </svg>
                  </span>
                </div>
                {' '}
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-dim)' }}>Azir</span>
                {' '}
                <span className="m-muted" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span>60 % V</span>
                  <span>12 parties</span>
                </span>
                {' '}
                <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Banni</span>
              </button>
              <button type="button" aria-pressed="false" style={{ all: 'unset', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '5px', padding: '8px', borderRadius: '10px', background: 'var(--bg-bar)', border: '1px solid var(--border)', position: 'relative' }}>
                <div style={{ position: 'relative' }}>
                  <img src={asset('champions/Taliyah.png')} alt="Taliyah" width="72" height="72" style={{ borderRadius: '8px', objectFit: 'cover', flex: 'none', filter: 'grayscale(1) brightness(.5)', width: '100%', height: 'auto', aspectRatio: '1' }} />
                  <span style={{ position: 'absolute', top: '4px', left: '4px', width: '22px', height: '22px', borderRadius: '5px', background: 'color-mix(in srgb, var(--bg-page) 85%, transparent)', color: 'var(--text-dim)', fontWeight: '800', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-strong)' }}>B</span>
                  <span style={{ position: 'absolute', inset: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="40" height="40" viewBox="0 0 40 40">
                      <circle cx="20" cy="20" r="15" fill="none" strokeWidth="3" style={{ stroke: 'var(--danger)' }} />
                      <path d="M9 31L31 9" strokeWidth="3" style={{ stroke: 'var(--danger)' }} />
                    </svg>
                  </span>
                </div>
                {' '}
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-dim)' }}>Taliyah</span>
                {' '}
                <span className="m-muted" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span>55 % V</span>
                  <span>6 parties</span>
                </span>
                {' '}
                <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Banni</span>
              </button>
            </div>
          </section>
          {' '}
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <section className="m-card" style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: '9px' }}>
              <h2 className="m-h2" style={{ margin: '0' }}>Composition avec Orianna</h2>
              {' '}
              <div className="m-muted" style={{ display: 'flex', gap: '12px', fontSize: '11px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <img src={asset('logos/karmine-corp-f3aa9bbd.png')} alt="" width="14" height="14" style={{ objectFit: 'contain', flex: 'none' }} />
                  {' KC'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <img src={asset('logos/g2-esports-7d6673d3.png')} alt="" width="14" height="14" style={{ objectFit: 'contain', flex: 'none' }} />
                  {' G2'}
                </span>
              </div>
              {' '}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                <span className="m-muted" style={{ width: '76px' }}>Engage</span>
                <span style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span style={{ display: 'block', width: '100%', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
                    <span style={{ display: 'block', height: '100%', width: '85%', background: 'var(--team-us)' }} />
                  </span>
                  <span style={{ display: 'block', width: '100%', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
                    <span style={{ display: 'block', height: '100%', width: '70%', background: 'var(--team-them)' }} />
                  </span>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                <span className="m-muted" style={{ width: '76px' }}>Teamfight</span>
                <span style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span style={{ display: 'block', width: '100%', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
                    <span style={{ display: 'block', height: '100%', width: '80%', background: 'var(--team-us)' }} />
                  </span>
                  <span style={{ display: 'block', width: '100%', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
                    <span style={{ display: 'block', height: '100%', width: '75%', background: 'var(--team-them)' }} />
                  </span>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                <span className="m-muted" style={{ width: '76px' }}>Peel</span>
                <span style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span style={{ display: 'block', width: '100%', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
                    <span style={{ display: 'block', height: '100%', width: '40%', background: 'var(--team-us)' }} />
                  </span>
                  <span style={{ display: 'block', width: '100%', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
                    <span style={{ display: 'block', height: '100%', width: '65%', background: 'var(--team-them)' }} />
                  </span>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                <span className="m-muted" style={{ width: '76px' }}>Poke</span>
                <span style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span style={{ display: 'block', width: '100%', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
                    <span style={{ display: 'block', height: '100%', width: '30%', background: 'var(--team-us)' }} />
                  </span>
                  <span style={{ display: 'block', width: '100%', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
                    <span style={{ display: 'block', height: '100%', width: '60%', background: 'var(--team-them)' }} />
                  </span>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                <span className="m-muted" style={{ width: '76px' }}>Split push</span>
                <span style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span style={{ display: 'block', width: '100%', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
                    <span style={{ display: 'block', height: '100%', width: '55%', background: 'var(--team-us)' }} />
                  </span>
                  <span style={{ display: 'block', width: '100%', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
                    <span style={{ display: 'block', height: '100%', width: '40%', background: 'var(--team-them)' }} />
                  </span>
                </span>
              </div>
              {' '}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span className="m-muted">Dégâts KC</span>
                  <span>
                    <span style={{ color: 'var(--team-them)' }}>60 % phys.</span>
                    {' / '}
                    <span style={{ color: 'var(--accent-blue)' }}>40 % magiques</span>
                  </span>
                </div>
                <div style={{ display: 'flex', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                  <span style={{ width: '60%', background: 'var(--team-them)' }} />
                  <span style={{ flex: '1', background: 'var(--accent-blue)' }} />
                </div>
                <span style={{ fontSize: '11px', color: 'var(--team-us)' }}>▲ avant Orianna : 80 / 20, trop physique</span>
              </div>
            </section>
            {' '}
            <section className="m-card" style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h2 className="m-h2" style={{ margin: '0' }}>Courbe de puissance</h2>
              <svg viewBox="0 0 260 86" width="100%" height="86" role="img" aria-label="Courbe de puissance : KC plus fort en début de partie, G2 plus fort en fin de partie">
                <line x1="0" y1="35" x2="260" y2="35" strokeDasharray="3 3" style={{ stroke: 'var(--border)' }} />
                <path d="M0,32 L65,15 L130,18 L195,28 L260,36" fill="none" strokeWidth="2.5" strokeLinejoin="round" style={{ stroke: 'var(--team-us)' }} />
                <path d="M0,38 L65,35 L130,27 L195,20 L260,13" fill="none" strokeWidth="2.5" strokeLinejoin="round" style={{ stroke: 'var(--team-them)' }} />
                <text x="0" y="84" fontSize="10" style={{ fill: 'var(--text-muted)' }}>Début</text>
                <text x="118" y="84" fontSize="10" style={{ fill: 'var(--text-muted)' }}>Milieu</text>
                <text x="260" y="84" fontSize="10" textAnchor="end" style={{ fill: 'var(--text-muted)' }}>Fin</text>
              </svg>
              {' '}
              <p className="m-muted" style={{ margin: '0', fontSize: '12px' }}>{'KC domine entre 10 et 20 min. G2 prend l\'avantage après 25 min avec Ezreal et Gnar.'}</p>
              {' '}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--bg-active)', color: 'var(--accent-gold)', fontSize: '10px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>HC</span>
                  <strong style={{ fontSize: '13px' }}>Conseil du coach</strong>
                </div>
                <p style={{ margin: '0', fontSize: '13px', lineHeight: '1.45' }}>« Orianna équilibre nos dégâts et combo avec Xin Zhao. Ensuite, bannissez Rakan pour priver Labrov de son engage. »</p>
                {' '}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button type="button" className="m-btn m-cta" style={{ flex: '1', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>Valider Orianna</button>
                  <button type="button" className="m-btn" style={{ whiteSpace: 'nowrap' }}>Déléguer</button>
                </div>
              </div>
            </section>
          </div>
        </div>
        {' '}
        <div style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '0' }}>
          <div style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '10px', background: 'linear-gradient(270deg,color-mix(in srgb, var(--team-them) 13%, transparent),var(--bg-card) 70%)', border: '1px solid var(--border)' }}>
            <div style={{ position: 'relative', width: '64px', height: '64px', flex: 'none' }}>
              <img src={asset('champions/Gnar.png')} alt="Gnar" width="64" height="64" style={{ borderRadius: '10px', objectFit: 'cover', flex: 'none', border: '2px solid var(--team-them)' }} />
            </div>
            <div style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'right' }}>
              <strong style={{ fontSize: '15px' }}>Gnar</strong>
              <span className="m-muted" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', justifyContent: 'flex-end' }}>
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
                BrokenBlade
              </span>
            </div>
            <img src={asset('photos/brokenblade-84bff3a3.jpg')} alt="" width="40" height="40" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--team-them)', flex: 'none' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '10px', background: 'linear-gradient(270deg,color-mix(in srgb, var(--team-them) 13%, transparent),var(--bg-card) 70%)', border: '1px solid var(--border)' }}>
            <div style={{ position: 'relative', width: '64px', height: '64px', flex: 'none' }}>
              <img src={asset('champions/Sejuani.png')} alt="Sejuani" width="64" height="64" style={{ borderRadius: '10px', objectFit: 'cover', flex: 'none', border: '2px solid var(--team-them)' }} />
            </div>
            <div style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'right' }}>
              <strong style={{ fontSize: '15px' }}>Sejuani</strong>
              <span className="m-muted" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', justifyContent: 'flex-end' }}>
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
                SkewMond
              </span>
            </div>
            <img src={asset('photos/skewmond-ab15060e.jpg')} alt="" width="40" height="40" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--team-them)', flex: 'none' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '10px', border: '1px solid var(--border-strong)', background: 'var(--bg-bar)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', color: 'var(--border-strong)' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" role="img" aria-label="Mid" style={{ flex: 'none' }}>
                <g fillOpacity=".35" style={{ fill: 'var(--border-strong)' }}>
                  <path d="M2 2H13L2 13Z" />
                  <path d="M22 22H11L22 11Z" />
                </g>
                <g style={{ fill: 'var(--border-strong)' }}>
                  <path d="M17 2H22V7L7 22H2V17Z" />
                </g>
              </svg>
            </div>
            <div style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'right' }}>
              <span className="m-muted" style={{ fontSize: '13px' }}>À venir</span>
              <span className="m-muted" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', justifyContent: 'flex-end' }}>
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
                Caps
              </span>
            </div>
            <img src={asset('photos/caps-55dd587c.jpg')} alt="" width="40" height="40" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '10px', background: 'linear-gradient(270deg,color-mix(in srgb, var(--team-them) 13%, transparent),var(--bg-card) 70%)', border: '1px solid var(--border)' }}>
            <div style={{ position: 'relative', width: '64px', height: '64px', flex: 'none' }}>
              <img src={asset('champions/Ezreal.png')} alt="Ezreal" width="64" height="64" style={{ borderRadius: '10px', objectFit: 'cover', flex: 'none', border: '2px solid var(--team-them)' }} />
            </div>
            <div style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'right' }}>
              <strong style={{ fontSize: '15px' }}>Ezreal</strong>
              <span className="m-muted" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', justifyContent: 'flex-end' }}>
                <span style={{ color: 'var(--accent-gold)', display: 'flex' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" role="img" aria-label="ADC" style={{ flex: 'none' }}>
                    <g fill="currentColor" fillOpacity=".35">
                      <path d="M2 18V2H18L14 6H6V14Z" />
                    </g>
                    <g fill="currentColor">
                      <path d="M22 22H6L10 18H18V10L22 6Z" />
                      <rect x="9.5" y="9.5" width="5" height="5" />
                    </g>
                  </svg>
                </span>
                Hans Sama
              </span>
            </div>
            <img src={asset('photos/hans-sama-c62a5235.jpg')} alt="" width="40" height="40" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--team-them)', flex: 'none' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '10px', border: '1px solid var(--border-strong)', background: 'var(--bg-bar)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', color: 'var(--border-strong)' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" role="img" aria-label="Support" style={{ flex: 'none' }}>
                <g fillOpacity=".35" style={{ fill: 'var(--border-strong)' }} />
                <g style={{ fill: 'var(--border-strong)' }}>
                  <path d="M12 6.5L15.2 10.5L12 22L8.8 10.5Z" />
                  <path d="M1.5 6H9L10.2 9L7.5 12.5L5 9.5Z" />
                  <path d="M22.5 6H15L13.8 9L16.5 12.5L19 9.5Z" />
                  <path d="M9.5 2.5H14.5L12 5.2Z" />
                </g>
              </svg>
            </div>
            <div style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'right' }}>
              <span className="m-muted" style={{ fontSize: '13px' }}>À venir</span>
              <span className="m-muted" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', justifyContent: 'flex-end' }}>
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
                Labrov
              </span>
            </div>
            <img src={asset('photos/labrov-bb6ac576.jpg')} alt="" width="40" height="40" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
          </div>
          {' '}
          <section className="m-card" style={{ padding: '12px', marginTop: '4px' }}>
            <h2 className="m-h2" style={{ margin: '0 0 8px' }}>Ce que G2 prépare</h2>
            {' '}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
              <img src={asset('photos/caps-55dd587c.jpg')} alt="" width="28" height="28" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
              <span style={{ flex: '1' }}>Caps : pool restant</span>
              <img src={asset('champions/Syndra.png')} alt="Syndra" width="24" height="24" style={{ borderRadius: '5px', objectFit: 'cover', flex: 'none' }} />
              <img src={asset('champions/Ahri.png')} alt="Ahri" width="24" height="24" style={{ borderRadius: '5px', objectFit: 'cover', flex: 'none' }} />
              <img src={asset('champions/Sylas.png')} alt="Sylas" width="24" height="24" style={{ borderRadius: '5px', objectFit: 'cover', flex: 'none' }} />
            </div>
            {' '}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', marginTop: '8px' }}>
              <img src={asset('photos/labrov-bb6ac576.jpg')} alt="" width="28" height="28" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
              <span style={{ flex: '1' }}>Labrov : engage probable</span>
              <img src={asset('champions/Rakan.png')} alt="Rakan" width="24" height="24" style={{ borderRadius: '5px', objectFit: 'cover', flex: 'none' }} />
              <img src={asset('champions/Braum.png')} alt="Braum" width="24" height="24" style={{ borderRadius: '5px', objectFit: 'cover', flex: 'none' }} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
