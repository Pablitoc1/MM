// Écran « Entrainement » de la maquette v2, reproduit à l'identique.
// Généré depuis le rendu de la maquette, puis branché sur les fichiers de M1 (photos, logos).
// Les chiffres sont ceux de la maquette : des exemples en attendant les jalons qui les calculent.
import { assetUrl as asset } from '../../api';

export function EcranEntrainement() {
  return (
    <main style={{ flex: '1', minWidth: '0', padding: '20px 24px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
        <div>
          <h1 style={{ margin: '0', fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '26px' }}>Entraînement</h1>
          <div className="m-muted" style={{ fontSize: '13px', marginTop: '2px' }}>
            {'Semaine du 12 janvier · objectif : battre '}
            <img src={asset('logos/g2-esports-7d6673d3.png')} alt="" width="14" height="14" style={{ objectFit: 'contain', flex: 'none' }} />
            {' G2 samedi'}
          </div>
        </div>
        {' '}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button type="button" className="m-btn m-on">{'Planning d\'équipe'}</button>
          <button type="button" className="m-btn">Travail individuel</button>
          <button type="button" className="m-btn">Déléguer au coach</button>
        </div>
      </div>
      {' '}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'flex-start' }}>
        <section className="m-card" style={{ flex: '3 1 640px', minWidth: '0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
            <h2 className="m-h2" style={{ margin: '0' }}>Planning de la semaine</h2>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <span className="m-muted" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'var(--team-us)' }} />
                Scrim
              </span>
              <span className="m-muted" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'var(--accent-blue)' }} />
                VOD
              </span>
              <span className="m-muted" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'var(--accent-violet)' }} />
                SoloQ
              </span>
              <span className="m-muted" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'var(--accent-gold)' }} />
                Patch
              </span>
              <span className="m-muted" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'var(--accent-gold)' }} />
                Prépa draft
              </span>
              <span className="m-muted" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'var(--text-dim)' }} />
                Repos
              </span>
              <span className="m-muted" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'var(--team-them)' }} />
                Match
              </span>
            </div>
          </div>
          {' '}
          <div style={{ overflowX: 'auto' }}>
            <table className="m-plan" style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  <th />
                  <th style={{ textAlign: 'center', color: 'var(--text)' }}>
                    <div style={{ fontSize: '12px' }}>Lun.</div>
                    <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: '18px', color: 'var(--team-us)' }}>12</div>
                  </th>
                  <th style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px' }}>Mar.</div>
                    <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: '18px', color: 'var(--text)' }}>13</div>
                  </th>
                  <th style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px' }}>Mer.</div>
                    <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: '18px', color: 'var(--text)' }}>14</div>
                  </th>
                  <th style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px' }}>Jeu.</div>
                    <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: '18px', color: 'var(--text)' }}>15</div>
                  </th>
                  <th style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px' }}>Ven.</div>
                    <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: '18px', color: 'var(--text)' }}>16</div>
                  </th>
                  <th style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px' }}>Sam.</div>
                    <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: '18px', color: 'var(--text)' }}>17</div>
                  </th>
                  <th style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px' }}>Dim.</div>
                    <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: '18px', color: 'var(--text)' }}>18</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th style={{ textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500', width: '70px' }}>Matin</th>
                  <td>
                    <div style={{ background: 'color-mix(in srgb, var(--accent-blue) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--accent-blue) 33%, transparent)', borderRadius: '8px', padding: '7px 8px', display: 'flex', flexDirection: 'column', gap: '4px', minHeight: '46px', boxSizing: 'border-box' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: '700', letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--accent-blue)' }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M7 5l12 7-12 7z" />
                        </svg>
                        VOD
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <img src={asset('logos/g2-esports-7d6673d3.png')} alt="" width="18" height="18" style={{ objectFit: 'contain', flex: 'none' }} />
                        <span style={{ fontWeight: '700', fontSize: '12px' }}>G2</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ background: 'color-mix(in srgb, var(--accent-violet) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--accent-violet) 33%, transparent)', borderRadius: '8px', padding: '7px 8px', display: 'flex', flexDirection: 'column', gap: '4px', minHeight: '46px', boxSizing: 'border-box' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: '700', letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--accent-violet)' }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="12" cy="12" r="8" />
                          <circle cx="12" cy="12" r="4" />
                          <circle cx="12" cy="12" r="1" />
                        </svg>
                        SoloQ
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ background: 'color-mix(in srgb, var(--accent-gold) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--accent-gold) 33%, transparent)', borderRadius: '8px', padding: '7px 8px', display: 'flex', flexDirection: 'column', gap: '4px', minHeight: '46px', boxSizing: 'border-box' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: '700', letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--accent-gold)' }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M6 3h8l4 4v14H6z" />
                          <path d="M14 3v4h4" />
                        </svg>
                        Patch
                      </span>
                      <span style={{ fontWeight: '600', fontSize: '12px' }}>Patch 26.2</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ background: 'color-mix(in srgb, var(--accent-violet) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--accent-violet) 33%, transparent)', borderRadius: '8px', padding: '7px 8px', display: 'flex', flexDirection: 'column', gap: '4px', minHeight: '46px', boxSizing: 'border-box' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: '700', letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--accent-violet)' }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="12" cy="12" r="8" />
                          <circle cx="12" cy="12" r="4" />
                          <circle cx="12" cy="12" r="1" />
                        </svg>
                        SoloQ
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ background: 'color-mix(in srgb, var(--accent-gold) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--accent-gold) 33%, transparent)', borderRadius: '8px', padding: '7px 8px', display: 'flex', flexDirection: 'column', gap: '4px', minHeight: '46px', boxSizing: 'border-box' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: '700', letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--accent-gold)' }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <rect x="3" y="7" width="18" height="13" rx="2" />
                          <path d="M9 7V5h6v2M3 13h18" />
                        </svg>
                        Prépa draft
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <img src={asset('logos/g2-esports-7d6673d3.png')} alt="" width="18" height="18" style={{ objectFit: 'contain', flex: 'none' }} />
                        <span style={{ fontWeight: '700', fontSize: '12px' }}>G2</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ background: 'color-mix(in srgb, var(--text-dim) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--text-dim) 33%, transparent)', borderRadius: '8px', padding: '7px 8px', display: 'flex', flexDirection: 'column', gap: '4px', minHeight: '46px', boxSizing: 'border-box' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: '700', letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M3 11l9-7 9 7" />
                          <path d="M5 10v10h14V10" />
                        </svg>
                        Repos
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ background: 'color-mix(in srgb, var(--text-dim) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--text-dim) 33%, transparent)', borderRadius: '8px', padding: '7px 8px', display: 'flex', flexDirection: 'column', gap: '4px', minHeight: '46px', boxSizing: 'border-box' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: '700', letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M3 11l9-7 9 7" />
                          <path d="M5 10v10h14V10" />
                        </svg>
                        Repos
                      </span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th style={{ textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500', width: '70px' }}>Après-midi</th>
                  <td>
                    <div style={{ background: 'color-mix(in srgb, var(--team-us) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--team-us) 33%, transparent)', borderRadius: '8px', padding: '7px 8px', display: 'flex', flexDirection: 'column', gap: '4px', minHeight: '70px', boxSizing: 'border-box' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: '700', letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--team-us)' }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M14 4h6v6L9 21l-6-6z" />
                          <path d="M5 13l6 6" />
                        </svg>
                        Scrim
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <img src={asset('logos/fnatic-78f183fa.png')} alt="" width="26" height="26" style={{ objectFit: 'contain', flex: 'none' }} />
                        <span style={{ fontWeight: '700', fontSize: '12px' }}>vs Fnatic</span>
                      </div>
                      <span className="m-muted" style={{ fontSize: '10px' }}>2 parties · Bo2</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ background: 'color-mix(in srgb, var(--team-us) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--team-us) 33%, transparent)', borderRadius: '8px', padding: '7px 8px', display: 'flex', flexDirection: 'column', gap: '4px', minHeight: '70px', boxSizing: 'border-box' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: '700', letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--team-us)' }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M14 4h6v6L9 21l-6-6z" />
                          <path d="M5 13l6 6" />
                        </svg>
                        Scrim
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <img src={asset('logos/movistar-koi-4acc4065.png')} alt="" width="26" height="26" style={{ objectFit: 'contain', flex: 'none' }} />
                        <span style={{ fontWeight: '700', fontSize: '12px' }}>vs MKOI</span>
                      </div>
                      <span className="m-muted" style={{ fontSize: '10px' }}>2 parties · Bo2</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ background: 'color-mix(in srgb, var(--team-us) 10%, transparent)', border: '2px dashed var(--team-them)', borderRadius: '8px', padding: '7px 8px', display: 'flex', flexDirection: 'column', gap: '4px', minHeight: '70px', boxSizing: 'border-box' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: '700', letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--team-us)' }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M14 4h6v6L9 21l-6-6z" />
                          <path d="M5 13l6 6" />
                        </svg>
                        Scrim
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <img src={asset('logos/sk-gaming-75760dca.png')} alt="" width="26" height="26" style={{ objectFit: 'contain', flex: 'none' }} />
                        <span style={{ fontWeight: '700', fontSize: '12px' }}>vs SK</span>
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--team-them)', fontWeight: '700', display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M12 3l10 18H2z" />
                          <path d="M12 10v5M12 18v.5" />
                        </svg>
                        {' Caliste fatigué'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ background: 'color-mix(in srgb, var(--text-dim) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--text-dim) 33%, transparent)', borderRadius: '8px', padding: '7px 8px', display: 'flex', flexDirection: 'column', gap: '4px', minHeight: '70px', boxSizing: 'border-box' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: '700', letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M3 11l9-7 9 7" />
                          <path d="M5 10v10h14V10" />
                        </svg>
                        Repos
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ background: 'color-mix(in srgb, var(--team-us) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--team-us) 33%, transparent)', borderRadius: '8px', padding: '7px 8px', display: 'flex', flexDirection: 'column', gap: '4px', minHeight: '70px', boxSizing: 'border-box' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: '700', letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--team-us)' }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M14 4h6v6L9 21l-6-6z" />
                          <path d="M5 13l6 6" />
                        </svg>
                        Scrim
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <img src={asset('logos/team-heretics-1285e1c0.png')} alt="" width="26" height="26" style={{ objectFit: 'contain', flex: 'none' }} />
                        <span style={{ fontWeight: '700', fontSize: '12px' }}>vs Heretics</span>
                      </div>
                      <span className="m-muted" style={{ fontSize: '10px' }}>2 parties · Bo2</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ background: 'color-mix(in srgb, var(--team-them) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--team-them) 33%, transparent)', borderRadius: '8px', padding: '7px 8px', display: 'flex', flexDirection: 'column', gap: '4px', minHeight: '70px', boxSizing: 'border-box' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: '700', letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--team-them)' }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M8 4h8v5a4 4 0 01-8 0z" />
                          <path d="M8 6H5a3 3 0 003 4M16 6h3a3 3 0 01-3 4M12 13v4M8 20h8" />
                        </svg>
                        Match
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <img src={asset('logos/g2-esports-7d6673d3.png')} alt="" width="26" height="26" style={{ objectFit: 'contain', flex: 'none' }} />
                        <span style={{ fontWeight: '700', fontSize: '12px' }}>vs G2</span>
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--team-them)', fontWeight: '700' }}>LEC · 18h00</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ background: 'color-mix(in srgb, var(--text-dim) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--text-dim) 33%, transparent)', borderRadius: '8px', padding: '7px 8px', display: 'flex', flexDirection: 'column', gap: '4px', minHeight: '70px', boxSizing: 'border-box' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: '700', letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M3 11l9-7 9 7" />
                          <path d="M5 10v10h14V10" />
                        </svg>
                        Repos
                      </span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th style={{ textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500', width: '70px' }}>Soir</th>
                  <td>
                    <div style={{ background: 'color-mix(in srgb, var(--accent-violet) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--accent-violet) 33%, transparent)', borderRadius: '8px', padding: '7px 8px', display: 'flex', flexDirection: 'column', gap: '4px', minHeight: '46px', boxSizing: 'border-box' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: '700', letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--accent-violet)' }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="12" cy="12" r="8" />
                          <circle cx="12" cy="12" r="4" />
                          <circle cx="12" cy="12" r="1" />
                        </svg>
                        SoloQ
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ background: 'color-mix(in srgb, var(--accent-violet) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--accent-violet) 33%, transparent)', borderRadius: '8px', padding: '7px 8px', display: 'flex', flexDirection: 'column', gap: '4px', minHeight: '46px', boxSizing: 'border-box' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: '700', letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--accent-violet)' }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="12" cy="12" r="8" />
                          <circle cx="12" cy="12" r="4" />
                          <circle cx="12" cy="12" r="1" />
                        </svg>
                        SoloQ
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ background: 'color-mix(in srgb, var(--accent-violet) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--accent-violet) 33%, transparent)', borderRadius: '8px', padding: '7px 8px', display: 'flex', flexDirection: 'column', gap: '4px', minHeight: '46px', boxSizing: 'border-box' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: '700', letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--accent-violet)' }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="12" cy="12" r="8" />
                          <circle cx="12" cy="12" r="4" />
                          <circle cx="12" cy="12" r="1" />
                        </svg>
                        SoloQ
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ background: 'color-mix(in srgb, var(--text-dim) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--text-dim) 33%, transparent)', borderRadius: '8px', padding: '7px 8px', display: 'flex', flexDirection: 'column', gap: '4px', minHeight: '46px', boxSizing: 'border-box' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: '700', letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Libre</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ background: 'color-mix(in srgb, var(--accent-violet) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--accent-violet) 33%, transparent)', borderRadius: '8px', padding: '7px 8px', display: 'flex', flexDirection: 'column', gap: '4px', minHeight: '46px', boxSizing: 'border-box' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: '700', letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--accent-violet)' }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="12" cy="12" r="8" />
                          <circle cx="12" cy="12" r="4" />
                          <circle cx="12" cy="12" r="1" />
                        </svg>
                        SoloQ
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ background: 'color-mix(in srgb, var(--text-dim) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--text-dim) 33%, transparent)', borderRadius: '8px', padding: '7px 8px', display: 'flex', flexDirection: 'column', gap: '4px', minHeight: '46px', boxSizing: 'border-box' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: '700', letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Libre</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ background: 'color-mix(in srgb, var(--text-dim) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--text-dim) 33%, transparent)', borderRadius: '8px', padding: '7px 8px', display: 'flex', flexDirection: 'column', gap: '4px', minHeight: '46px', boxSizing: 'border-box' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: '700', letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Libre</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th style={{ textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>Charge</th>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ flex: '1' }}>
                        <span style={{ display: 'block', width: '100%', height: '5px', borderRadius: '2px', background: 'var(--border)', overflow: 'hidden' }}>
                          <span style={{ display: 'block', height: '100%', width: '70%', background: 'var(--team-us)' }} />
                        </span>
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>70</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ flex: '1' }}>
                        <span style={{ display: 'block', width: '100%', height: '5px', borderRadius: '2px', background: 'var(--border)', overflow: 'hidden' }}>
                          <span style={{ display: 'block', height: '100%', width: '75%', background: 'var(--team-us)' }} />
                        </span>
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>75</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ flex: '1' }}>
                        <span style={{ display: 'block', width: '100%', height: '5px', borderRadius: '2px', background: 'var(--border)', overflow: 'hidden' }}>
                          <span style={{ display: 'block', height: '100%', width: '85%', background: 'var(--team-them)' }} />
                        </span>
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--team-them)' }}>85</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ flex: '1' }}>
                        <span style={{ display: 'block', width: '100%', height: '5px', borderRadius: '2px', background: 'var(--border)', overflow: 'hidden' }}>
                          <span style={{ display: 'block', height: '100%', width: '40%', background: 'var(--team-us)' }} />
                        </span>
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>40</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ flex: '1' }}>
                        <span style={{ display: 'block', width: '100%', height: '5px', borderRadius: '2px', background: 'var(--border)', overflow: 'hidden' }}>
                          <span style={{ display: 'block', height: '100%', width: '75%', background: 'var(--team-us)' }} />
                        </span>
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>75</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ flex: '1' }}>
                        <span style={{ display: 'block', width: '100%', height: '5px', borderRadius: '2px', background: 'var(--border)', overflow: 'hidden' }}>
                          <span style={{ display: 'block', height: '100%', width: '100%', background: 'var(--team-them)' }} />
                        </span>
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--team-them)' }}>100</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ flex: '1' }}>
                        <span style={{ display: 'block', width: '100%', height: '5px', borderRadius: '2px', background: 'var(--border)', overflow: 'hidden' }}>
                          <span style={{ display: 'block', height: '100%', width: '10%', background: 'var(--team-us)' }} />
                        </span>
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>10</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        {' '}
        <div style={{ flex: '1 1 260px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <section className="m-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h2 className="m-h2" style={{ margin: '0' }}>Effet prévu sur la semaine</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span>Préparation contre G2</span>
                <strong style={{ color: 'var(--team-us)' }}>
                  {'Bonne '}
                  <span style={{ fontSize: '11px' }}>▲ +18</span>
                </strong>
              </div>
              <span style={{ display: 'block', width: '100%', height: '8px', borderRadius: '4px', background: 'var(--border)', overflow: 'hidden' }}>
                <span style={{ display: 'block', height: '100%', width: '78%', background: 'var(--team-us)' }} />
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span>Maîtrise du patch 26.2</span>
                <strong style={{ color: 'var(--accent-gold)' }}>
                  {'Moyenne '}
                  <span style={{ fontSize: '11px' }}>▲ +9</span>
                </strong>
              </div>
              <span style={{ display: 'block', width: '100%', height: '8px', borderRadius: '4px', background: 'var(--border)', overflow: 'hidden' }}>
                <span style={{ display: 'block', height: '100%', width: '52%', background: 'var(--accent-gold)' }} />
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span>{'Fatigue de l\'équipe'}</span>
                <strong style={{ color: 'var(--team-them)' }}>
                  {'Élevée '}
                  <span style={{ fontSize: '11px' }}>▲ +12 %</span>
                </strong>
              </div>
              <span style={{ display: 'block', width: '100%', height: '8px', borderRadius: '4px', background: 'var(--border)', overflow: 'hidden' }}>
                <span style={{ display: 'block', height: '100%', width: '61%', background: 'var(--team-them)' }} />
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span>Chimie</span>
                <strong style={{ color: 'var(--team-us)' }}>
                  {'En hausse '}
                  <span style={{ fontSize: '11px' }}>▲ +4</span>
                </strong>
              </div>
              <span style={{ display: 'block', width: '100%', height: '8px', borderRadius: '4px', background: 'var(--border)', overflow: 'hidden' }}>
                <span style={{ display: 'block', height: '100%', width: '70%', background: 'var(--team-us)' }} />
              </span>
            </div>
          </section>
          {' '}
          <section className="m-card" style={{ borderLeft: '3px solid var(--team-them)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--bg-active)', color: 'var(--accent-gold)', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>HC</span>
              <div>
                <strong style={{ fontSize: '13px' }}>Avis du coach</strong>
                <div className="m-muted" style={{ fontSize: '11px' }}>Coach principal</div>
              </div>
            </div>
            <p style={{ margin: '0 0 10px', fontSize: '13px', lineHeight: '1.5' }}>« Le planning est chargé avant G2. Je conseille de remplacer le scrim de mercredi par du repos pour Caliste. »</p>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button type="button" className="m-btn m-cta" style={{ flex: '1' }}>Appliquer</button>
              <button type="button" className="m-btn" style={{ flex: '1' }}>Ignorer</button>
            </div>
          </section>
        </div>
      </div>
      {' '}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
        <section className="m-card" style={{ flex: '3 1 560px', minWidth: '0' }}>
          <h2 className="m-h2">Objectifs individuels</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
            <img src={asset('photos/canna-7577c239.jpg')} alt="" width="36" height="36" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
            <span style={{ color: 'var(--accent-gold)', display: 'flex' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" role="img" aria-label="Top" style={{ flex: 'none' }}>
                <g fill="currentColor" fillOpacity=".35">
                  <path d="M22 6V22H6L10 18H18V10Z" />
                </g>
                <g fill="currentColor">
                  <path d="M2 2H18L14 6H6V14L2 18Z" />
                  <rect x="9.5" y="9.5" width="5" height="5" />
                </g>
              </svg>
            </span>
            <div style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px' }}>
                <span style={{ fontSize: '13px' }}>
                  <strong>Canna</strong>
                  {' · Apprendre K\'Santé'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src={asset('champions/KSante.png')} alt="KSante" width="20" height="20" style={{ borderRadius: '5px', objectFit: 'cover', flex: 'none' }} />
                <span style={{ flex: '1' }}>
                  <span style={{ display: 'block', width: '100%', height: '5px', borderRadius: '2px', background: 'var(--border)', overflow: 'hidden' }}>
                    <span style={{ display: 'block', height: '100%', width: '35%', background: 'var(--team-us)' }} />
                  </span>
                </span>
                <span className="m-muted" style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>Maîtrise 35 % → objectif 70 %</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
            <img src={asset('photos/yike-4203fc46.jpg')} alt="" width="36" height="36" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
            <span style={{ color: 'var(--accent-gold)', display: 'flex' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" role="img" aria-label="Jungle" style={{ flex: 'none' }}>
                <g fill="currentColor" fillOpacity=".35" />
                <g fill="currentColor">
                  <path d="M5 22C3.5 16 3 10 4 3C7 8 9 13 9.5 19Z" />
                  <path d="M11.2 22C10.3 15 10.6 8 12 1.5C13.4 8 13.7 15 12.8 22Z" />
                  <path d="M19 22C20.5 16 21 10 20 3C17 8 15 13 14.5 19Z" />
                </g>
              </svg>
            </span>
            <div style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px' }}>
                <span style={{ fontSize: '13px' }}>
                  <strong>Yike</strong>
                  {' · Pathing côté bot avec le duo'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src={asset('champions/Vi.png')} alt="Vi" width="20" height="20" style={{ borderRadius: '5px', objectFit: 'cover', flex: 'none' }} />
                <span style={{ flex: '1' }}>
                  <span style={{ display: 'block', width: '100%', height: '5px', borderRadius: '2px', background: 'var(--border)', overflow: 'hidden' }}>
                    <span style={{ display: 'block', height: '100%', width: '60%', background: 'var(--team-us)' }} />
                  </span>
                </span>
                <span className="m-muted" style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>Synchronisation en hausse</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
            <img src={asset('photos/kyeahoo-308e48bf.jpg')} alt="" width="36" height="36" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
            <span style={{ color: 'var(--accent-gold)', display: 'flex' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" role="img" aria-label="Mid" style={{ flex: 'none' }}>
                <g fill="currentColor" fillOpacity=".35">
                  <path d="M2 2H13L2 13Z" />
                  <path d="M22 22H11L22 11Z" />
                </g>
                <g fill="currentColor">
                  <path d="M17 2H22V7L7 22H2V17Z" />
                </g>
              </svg>
            </span>
            <div style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px' }}>
                <span style={{ fontSize: '13px' }}>
                  <strong>kyeahoo</strong>
                  {' · Améliorer la vision'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src={asset('champions/Orianna.png')} alt="Orianna" width="20" height="20" style={{ borderRadius: '5px', objectFit: 'cover', flex: 'none' }} />
                <span style={{ flex: '1' }}>
                  <span style={{ display: 'block', width: '100%', height: '5px', borderRadius: '2px', background: 'var(--border)', overflow: 'hidden' }}>
                    <span style={{ display: 'block', height: '100%', width: '40%', background: 'var(--accent-gold)' }} />
                  </span>
                </span>
                <span className="m-muted" style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>Wards / min 0,9 → objectif 1,2</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
            <img src={asset('photos/caliste-e2af2b77.jpeg')} alt="" width="36" height="36" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
            <span style={{ color: 'var(--accent-gold)', display: 'flex' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" role="img" aria-label="ADC" style={{ flex: 'none' }}>
                <g fill="currentColor" fillOpacity=".35">
                  <path d="M2 18V2H18L14 6H6V14Z" />
                </g>
                <g fill="currentColor">
                  <path d="M22 22H6L10 18H18V10L22 6Z" />
                  <rect x="9.5" y="9.5" width="5" height="5" />
                </g>
              </svg>
            </span>
            <div style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px' }}>
                <span style={{ fontSize: '13px' }}>
                  <strong>Caliste</strong>
                  {' · Repos demandé'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src={asset('champions/Varus.png')} alt="Varus" width="20" height="20" style={{ borderRadius: '5px', objectFit: 'cover', flex: 'none' }} />
                <span style={{ flex: '1' }}>
                  <span style={{ display: 'block', width: '100%', height: '5px', borderRadius: '2px', background: 'var(--border)', overflow: 'hidden' }}>
                    <span style={{ display: 'block', height: '100%', width: '68%', background: 'var(--team-them)' }} />
                  </span>
                </span>
                <span className="m-muted" style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>Fatigue 68 % : alléger la semaine</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
            <img src={asset('photos/busio-3e722c8e.jpg')} alt="" width="36" height="36" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
            <span style={{ color: 'var(--accent-gold)', display: 'flex' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" role="img" aria-label="Support" style={{ flex: 'none' }}>
                <g fill="currentColor" fillOpacity=".35" />
                <g fill="currentColor">
                  <path d="M12 6.5L15.2 10.5L12 22L8.8 10.5Z" />
                  <path d="M1.5 6H9L10.2 9L7.5 12.5L5 9.5Z" />
                  <path d="M22.5 6H15L13.8 9L16.5 12.5L19 9.5Z" />
                  <path d="M9.5 2.5H14.5L12 5.2Z" />
                </g>
              </svg>
            </span>
            <div style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px' }}>
                <span style={{ fontSize: '13px' }}>
                  <strong>Busio</strong>
                  {' · Roaming en début de partie'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src={asset('champions/Rakan.png')} alt="Rakan" width="20" height="20" style={{ borderRadius: '5px', objectFit: 'cover', flex: 'none' }} />
                <span style={{ flex: '1' }}>
                  <span style={{ display: 'block', width: '100%', height: '5px', borderRadius: '2px', background: 'var(--border)', overflow: 'hidden' }}>
                    <span style={{ display: 'block', height: '100%', width: '55%', background: 'var(--team-us)' }} />
                  </span>
                </span>
                <span className="m-muted" style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>Roams avant 10 min : 2,1 → 3</span>
              </div>
            </div>
          </div>
        </section>
        {' '}
        <section className="m-card" style={{ flex: '2 1 300px', minWidth: '0' }}>
          <h2 className="m-h2">Partenaires de scrim</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 0' }}>
            <img src={asset('logos/fnatic-78f183fa.png')} alt="" width="28" height="28" style={{ objectFit: 'contain', flex: 'none' }} />
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>Fnatic</span>
              <span className="m-muted" style={{ fontSize: '11px' }}>Lun. 14h · Bo2, draft fearless</span>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 9px', borderRadius: '999px', fontSize: '12px', fontWeight: '600', border: '1px solid var(--team-us)', color: 'var(--team-us)' }}>Confirmé</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 0' }}>
            <img src={asset('logos/movistar-koi-4acc4065.png')} alt="" width="28" height="28" style={{ objectFit: 'contain', flex: 'none' }} />
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>Movistar KOI</span>
              <span className="m-muted" style={{ fontSize: '11px' }}>Mar. 14h · Bo2, draft fearless</span>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 9px', borderRadius: '999px', fontSize: '12px', fontWeight: '600', border: '1px solid var(--team-us)', color: 'var(--team-us)' }}>Confirmé</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 0' }}>
            <img src={asset('logos/sk-gaming-75760dca.png')} alt="" width="28" height="28" style={{ objectFit: 'contain', flex: 'none' }} />
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>SK Gaming</span>
              <span className="m-muted" style={{ fontSize: '11px' }}>Mer. 14h · Bo2, draft fearless</span>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 9px', borderRadius: '999px', fontSize: '12px', fontWeight: '600', border: '1px solid var(--team-us)', color: 'var(--team-us)' }}>Confirmé</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 0' }}>
            <img src={asset('logos/team-heretics-1285e1c0.png')} alt="" width="28" height="28" style={{ objectFit: 'contain', flex: 'none' }} />
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>Team Heretics</span>
              <span className="m-muted" style={{ fontSize: '11px' }}>Ven. 14h · Bo2, draft fearless</span>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 9px', borderRadius: '999px', fontSize: '12px', fontWeight: '600', border: '1px solid var(--team-them)', color: 'var(--team-them)' }}>En attente</span>
          </div>
        </section>
      </div>
    </main>
  );
}
