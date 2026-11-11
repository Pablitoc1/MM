// Écran « Pause » de la maquette v2, reproduit à l'identique.
// Généré depuis le rendu de la maquette, puis branché sur les fichiers de M1 (photos, logos).
// Les chiffres sont ceux de la maquette : des exemples en attendant les jalons qui les calculent.
import { assetUrl as asset } from '../../api';
import { OBJECTIVE_ICON } from '../../components/ui';

export function EcranPause() {
  return (
    <div style={{ minHeight: '920px', background: 'var(--bg-page)', color: 'var(--text)', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '12px 24px', background: 'var(--bg-bar)', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img src={asset('logos/karmine-corp-f3aa9bbd.png')} alt="" width="48" height="48" style={{ objectFit: 'contain', flex: 'none' }} />
          <span style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '40px', fontWeight: '700', color: 'var(--team-us)' }}>1</span>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <span className="m-muted" style={{ fontSize: '11px' }}>LEC Versus · Playoffs · Bo5</span>
            <span style={{ fontSize: '13px', fontWeight: '600' }}>Pause avant la partie 3</span>
          </div>
          <span style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '40px', fontWeight: '700', color: 'var(--team-them)' }}>1</span>
          <img src={asset('logos/g2-esports-7d6673d3.png')} alt="" width="48" height="48" style={{ objectFit: 'contain', flex: 'none' }} />
        </div>
        {' '}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px 10px', borderRadius: '10px', background: 'color-mix(in srgb, var(--team-us) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--team-us) 33%, transparent)', minWidth: '150px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
              <span className="m-muted">Partie 1 · 34:02</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700', color: 'var(--team-us)' }}>
                <img src={asset('logos/karmine-corp-f3aa9bbd.png')} alt="" width="14" height="14" style={{ objectFit: 'contain', flex: 'none' }} />
                {' Victoire'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '2px' }}>
              <img src={asset('champions/Renekton.png')} alt="Renekton" width="22" height="22" style={{ borderRadius: '4px', objectFit: 'cover', flex: 'none' }} />
              <img src={asset('champions/XinZhao.png')} alt="XinZhao" width="22" height="22" style={{ borderRadius: '4px', objectFit: 'cover', flex: 'none' }} />
              <img src={asset('champions/Orianna.png')} alt="Orianna" width="22" height="22" style={{ borderRadius: '4px', objectFit: 'cover', flex: 'none' }} />
              <img src={asset('champions/Varus.png')} alt="Varus" width="22" height="22" style={{ borderRadius: '4px', objectFit: 'cover', flex: 'none' }} />
              <img src={asset('champions/Rakan.png')} alt="Rakan" width="22" height="22" style={{ borderRadius: '4px', objectFit: 'cover', flex: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: '2px' }}>
              <img src={asset('champions/Gnar.png')} alt="Gnar" width="22" height="22" style={{ borderRadius: '4px', objectFit: 'cover', flex: 'none' }} />
              <img src={asset('champions/Sejuani.png')} alt="Sejuani" width="22" height="22" style={{ borderRadius: '4px', objectFit: 'cover', flex: 'none' }} />
              <img src={asset('champions/Syndra.png')} alt="Syndra" width="22" height="22" style={{ borderRadius: '4px', objectFit: 'cover', flex: 'none' }} />
              <img src={asset('champions/Ezreal.png')} alt="Ezreal" width="22" height="22" style={{ borderRadius: '4px', objectFit: 'cover', flex: 'none' }} />
              <img src={asset('champions/Braum.png')} alt="Braum" width="22" height="22" style={{ borderRadius: '4px', objectFit: 'cover', flex: 'none' }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px 10px', borderRadius: '10px', background: 'color-mix(in srgb, var(--team-them) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--team-them) 33%, transparent)', minWidth: '150px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
              <span className="m-muted">Partie 2 · 31:15</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700', color: 'var(--team-them)' }}>
                <img src={asset('logos/g2-esports-7d6673d3.png')} alt="" width="14" height="14" style={{ objectFit: 'contain', flex: 'none' }} />
                {' Victoire'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '2px' }}>
              <img src={asset('champions/KSante.png')} alt="KSante" width="22" height="22" style={{ borderRadius: '4px', objectFit: 'cover', flex: 'none' }} />
              <img src={asset('champions/Vi.png')} alt="Vi" width="22" height="22" style={{ borderRadius: '4px', objectFit: 'cover', flex: 'none' }} />
              <img src={asset('champions/Azir.png')} alt="Azir" width="22" height="22" style={{ borderRadius: '4px', objectFit: 'cover', flex: 'none' }} />
              <img src={asset('champions/Kaisa.png')} alt="Kaisa" width="22" height="22" style={{ borderRadius: '4px', objectFit: 'cover', flex: 'none' }} />
              <img src={asset('champions/Braum.png')} alt="Braum" width="22" height="22" style={{ borderRadius: '4px', objectFit: 'cover', flex: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: '2px' }}>
              <img src={asset('champions/Rumble.png')} alt="Rumble" width="22" height="22" style={{ borderRadius: '4px', objectFit: 'cover', flex: 'none' }} />
              <img src={asset('champions/XinZhao.png')} alt="XinZhao" width="22" height="22" style={{ borderRadius: '4px', objectFit: 'cover', flex: 'none' }} />
              <img src={asset('champions/Taliyah.png')} alt="Taliyah" width="22" height="22" style={{ borderRadius: '4px', objectFit: 'cover', flex: 'none' }} />
              <img src={asset('champions/Xayah.png')} alt="Xayah" width="22" height="22" style={{ borderRadius: '4px', objectFit: 'cover', flex: 'none' }} />
              <img src={asset('champions/Rakan.png')} alt="Rakan" width="22" height="22" style={{ borderRadius: '4px', objectFit: 'cover', flex: 'none' }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '8px 10px', borderRadius: '10px', border: '1px dashed var(--border-strong)', minWidth: '110px', color: 'var(--text-muted)', fontSize: '12px' }}>
            <span>Partie 3</span>
            <span style={{ fontSize: '11px' }}>À venir</span>
          </div>
        </div>
        {' '}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
          <span className="m-muted" style={{ fontSize: '12px' }}>Temps restant</span>
          <span className="m-pulse" style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '30px', fontWeight: '700', color: 'var(--accent-gold)' }}>6:40</span>
        </div>
      </header>
      {' '}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', padding: '16px 24px', alignItems: 'flex-start' }}>
        <div style={{ flex: '3 1 640px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <section className="m-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h2 className="m-h2" style={{ margin: '0' }}>Analyse du staff · partie 2</h2>
              <span className="m-muted" style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <img src={asset('logos/g2-esports-7d6673d3.png')} alt="" width="16" height="16" style={{ objectFit: 'contain', flex: 'none' }} />
                {' G2 a gagné en 31 min'}
              </span>
            </div>
            {' '}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: '3 1 320px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                <div className="m-muted" style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{'Écart d\'or par poste à 15 min'}</span>
                  <span>
                    <img src={asset('logos/karmine-corp-f3aa9bbd.png')} alt="" width="14" height="14" style={{ objectFit: 'contain', flex: 'none' }} />
                    {' vs '}
                    <img src={asset('logos/g2-esports-7d6673d3.png')} alt="" width="14" height="14" style={{ objectFit: 'contain', flex: 'none' }} />
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
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
                  <img src={asset('photos/canna-7577c239.jpg')} alt="" width="24" height="24" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
                  <div style={{ position: 'relative', flex: '1', height: '14px', background: 'var(--bg-bar)', borderRadius: '4px' }}>
                    <span style={{ position: 'absolute', left: '50%', top: '-3px', bottom: '-3px', width: '1px', background: 'var(--border-strong)' }} />
                    <span style={{ position: 'absolute', top: '0', bottom: '0', right: '50%', width: '8.333333333333332%', background: 'var(--team-them)', borderRadius: '3px' }} />
                  </div>
                  <img src={asset('photos/brokenblade-84bff3a3.jpg')} alt="" width="24" height="24" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
                  <b style={{ width: '52px', textAlign: 'right', color: 'var(--team-them)' }}>{'\u2212200'}</b>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
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
                  <img src={asset('photos/yike-4203fc46.jpg')} alt="" width="24" height="24" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
                  <div style={{ position: 'relative', flex: '1', height: '14px', background: 'var(--bg-bar)', borderRadius: '4px' }}>
                    <span style={{ position: 'absolute', left: '50%', top: '-3px', bottom: '-3px', width: '1px', background: 'var(--border-strong)' }} />
                    <span style={{ position: 'absolute', top: '0', bottom: '0', left: '50%', width: '12.5%', background: 'var(--team-us)', borderRadius: '3px' }} />
                  </div>
                  <img src={asset('photos/skewmond-ab15060e.jpg')} alt="" width="24" height="24" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
                  <b style={{ width: '52px', textAlign: 'right', color: 'var(--team-us)' }}>+300</b>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
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
                  <img src={asset('photos/kyeahoo-308e48bf.jpg')} alt="" width="24" height="24" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
                  <div style={{ position: 'relative', flex: '1', height: '14px', background: 'var(--bg-bar)', borderRadius: '4px' }}>
                    <span style={{ position: 'absolute', left: '50%', top: '-3px', bottom: '-3px', width: '1px', background: 'var(--border-strong)' }} />
                    <span style={{ position: 'absolute', top: '0', bottom: '0', right: '50%', width: '45.83333333333333%', background: 'var(--team-them)', borderRadius: '3px' }} />
                  </div>
                  <img src={asset('photos/caps-55dd587c.jpg')} alt="" width="24" height="24" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
                  <b style={{ width: '52px', textAlign: 'right', color: 'var(--team-them)' }}>{'\u22121 100'}</b>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
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
                  <img src={asset('photos/caliste-e2af2b77.jpeg')} alt="" width="24" height="24" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
                  <div style={{ position: 'relative', flex: '1', height: '14px', background: 'var(--bg-bar)', borderRadius: '4px' }}>
                    <span style={{ position: 'absolute', left: '50%', top: '-3px', bottom: '-3px', width: '1px', background: 'var(--border-strong)' }} />
                    <span style={{ position: 'absolute', top: '0', bottom: '0', right: '50%', width: '18.75%', background: 'var(--team-them)', borderRadius: '3px' }} />
                  </div>
                  <img src={asset('photos/hans-sama-c62a5235.jpg')} alt="" width="24" height="24" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
                  <b style={{ width: '52px', textAlign: 'right', color: 'var(--team-them)' }}>{'\u2212450'}</b>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
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
                  <img src={asset('photos/busio-3e722c8e.jpg')} alt="" width="24" height="24" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
                  <div style={{ position: 'relative', flex: '1', height: '14px', background: 'var(--bg-bar)', borderRadius: '4px' }}>
                    <span style={{ position: 'absolute', left: '50%', top: '-3px', bottom: '-3px', width: '1px', background: 'var(--border-strong)' }} />
                    <span style={{ position: 'absolute', top: '0', bottom: '0', right: '50%', width: '14.583333333333334%', background: 'var(--team-them)', borderRadius: '3px' }} />
                  </div>
                  <img src={asset('photos/labrov-bb6ac576.jpg')} alt="" width="24" height="24" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
                  <b style={{ width: '52px', textAlign: 'right', color: 'var(--team-them)' }}>{'\u2212350'}</b>
                </div>
              </div>
              {' '}
              <div style={{ flex: '1 1 170px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="m-muted" style={{ fontSize: '12px' }}>Objectifs</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                  <img src={OBJECTIVE_ICON.dragon} alt="Infernal" width="22" height="22" style={{ borderRadius: '11px', objectFit: 'cover', flex: 'none' }} />
                  <span style={{ flex: '1' }}>Dragons</span>
                  <b style={{ color: 'var(--team-us)' }}>1</b>
                  <span className="m-muted">–</span>
                  <b style={{ color: 'var(--team-them)' }}>3</b>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                  <img src={OBJECTIVE_ICON.larves} alt="Grub" width="22" height="22" style={{ borderRadius: '11px', objectFit: 'cover', flex: 'none' }} />
                  <span style={{ flex: '1' }}>Larves</span>
                  <b style={{ color: 'var(--team-us)' }}>3</b>
                  <span className="m-muted">–</span>
                  <b style={{ color: 'var(--team-them)' }}>3</b>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                  <img src={OBJECTIVE_ICON.nashor} alt="Baron" width="22" height="22" style={{ borderRadius: '11px', objectFit: 'cover', flex: 'none' }} />
                  <span style={{ flex: '1' }}>Baron</span>
                  <b style={{ color: 'var(--team-us)' }}>0</b>
                  <span className="m-muted">–</span>
                  <b style={{ color: 'var(--team-them)' }}>1</b>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                  <svg width="22" height="22" viewBox="0 0 20 26" aria-hidden="true">
                    <path d="M4 25 L6 12 L14 12 L16 25 Z" strokeWidth="1.2" style={{ fill: 'var(--tower-body)', stroke: 'var(--bg-page)' }} />
                    <path d="M6 25 L7.5 14 L9 25 Z" style={{ fill: 'var(--tower-light)' }} />
                    <path d="M3 12 L17 12 L15 9 L5 9 Z" strokeWidth="1" style={{ fill: 'var(--tower-top)', stroke: 'var(--bg-page)' }} />
                    <path d="M10 1 L14 6 L10 10 L6 6 Z" strokeWidth="1" style={{ fill: 'var(--accent-blue)', stroke: 'var(--bg-page)' }} />
                    <circle cx="10" cy="5.5" r="1.4" fillOpacity=".8" style={{ fill: 'var(--white)' }} />
                  </svg>
                  <span style={{ flex: '1' }}>Tours</span>
                  <b style={{ color: 'var(--team-us)' }}>4</b>
                  <span className="m-muted">–</span>
                  <b style={{ color: 'var(--team-them)' }}>9</b>
                </div>
              </div>
            </div>
            {' '}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 9px', borderRadius: '999px', fontSize: '12px', fontWeight: '600', border: '1px solid var(--team-them)', color: 'var(--team-them)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 3l10 18H2z" />
                  <path d="M12 10v5M12 18v.5" />
                </svg>
                Caps a dominé sur Taliyah
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 9px', borderRadius: '999px', fontSize: '12px', fontWeight: '600', border: '1px solid var(--team-them)', color: 'var(--team-them)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 3l10 18H2z" />
                  <path d="M12 10v5M12 18v.5" />
                </svg>
                Busio trop loin du bot : 2 plaques perdues
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 9px', borderRadius: '999px', fontSize: '12px', fontWeight: '600', border: '1px solid var(--team-us)', color: 'var(--team-us)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M14 4h6v6L9 21l-6-6z" />
                  <path d="M5 13l6 6" />
                </svg>
                Combats autour du dragon : 3 gagnés sur 4
              </span>
            </div>
            {' '}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '12px', padding: '10px 12px', borderRadius: '8px', background: 'var(--bg-bar)' }}>
              <span style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--bg-active)', color: 'var(--accent-gold)', fontSize: '10px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>HC</span>
              <p style={{ margin: '0', fontSize: '13px', lineHeight: '1.45' }}>« Il faut bannir Taliyah et jouer côté bleu pour garder le premier pick. »</p>
            </div>
          </section>
          {' '}
          <section className="m-card">
            <h2 className="m-h2">État des joueurs</h2>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 0', minWidth: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '10px 6px', borderRadius: '10px', background: 'var(--bg-bar)', border: '1px solid var(--border)' }}>
                <img src={asset('photos/canna-7577c239.jpg')} alt="" width="56" height="56" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--team-us)', flex: 'none' }} />
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '700', fontSize: '13px' }}>
                  <span style={{ color: 'var(--accent-gold)', display: 'flex' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" role="img" aria-label="Top" style={{ flex: 'none' }}>
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
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 9px', borderRadius: '999px', fontSize: '12px', fontWeight: '600', border: '1px solid var(--team-us)', color: 'var(--team-us)' }}>Concentré</span>
                <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px' }}>
                  <span style={{ flex: '1' }}>
                    <span style={{ display: 'block', width: '100%', height: '5px', borderRadius: '2px', background: 'var(--border)', overflow: 'hidden' }}>
                      <span style={{ display: 'block', height: '100%', width: '72%', background: 'var(--team-us)' }} />
                    </span>
                  </span>
                  <span style={{ color: 'var(--team-us)', display: 'flex' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14" />
                    </svg>
                  </span>
                </div>
              </div>
              <div style={{ flex: '1 1 0', minWidth: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '10px 6px', borderRadius: '10px', background: 'var(--bg-bar)', border: '1px solid var(--border)' }}>
                <img src={asset('photos/yike-4203fc46.jpg')} alt="" width="56" height="56" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--team-us)', flex: 'none' }} />
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '700', fontSize: '13px' }}>
                  <span style={{ color: 'var(--accent-gold)', display: 'flex' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" role="img" aria-label="Jungle" style={{ flex: 'none' }}>
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
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 9px', borderRadius: '999px', fontSize: '12px', fontWeight: '600', border: '1px solid var(--team-us)', color: 'var(--team-us)' }}>Confiant</span>
                <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px' }}>
                  <span style={{ flex: '1' }}>
                    <span style={{ display: 'block', width: '100%', height: '5px', borderRadius: '2px', background: 'var(--border)', overflow: 'hidden' }}>
                      <span style={{ display: 'block', height: '100%', width: '80%', background: 'var(--team-us)' }} />
                    </span>
                  </span>
                  <span style={{ color: 'var(--team-us)', display: 'flex' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M6 15l6-6 6 6" />
                    </svg>
                  </span>
                </div>
              </div>
              <div style={{ flex: '1 1 0', minWidth: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '10px 6px', borderRadius: '10px', background: 'var(--bg-bar)', border: '1px solid var(--team-them)' }}>
                <img src={asset('photos/kyeahoo-308e48bf.jpg')} alt="" width="56" height="56" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--team-them)', flex: 'none' }} />
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '700', fontSize: '13px' }}>
                  <span style={{ color: 'var(--accent-gold)', display: 'flex' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" role="img" aria-label="Mid" style={{ flex: 'none' }}>
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
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 9px', borderRadius: '999px', fontSize: '12px', fontWeight: '600', border: '1px solid var(--team-them)', color: 'var(--team-them)' }}>Frustré</span>
                <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px' }}>
                  <span style={{ flex: '1' }}>
                    <span style={{ display: 'block', width: '100%', height: '5px', borderRadius: '2px', background: 'var(--border)', overflow: 'hidden' }}>
                      <span style={{ display: 'block', height: '100%', width: '35%', background: 'var(--team-them)' }} />
                    </span>
                  </span>
                  <span style={{ color: 'var(--team-them)', display: 'flex' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                </div>
              </div>
              <div style={{ flex: '1 1 0', minWidth: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '10px 6px', borderRadius: '10px', background: 'var(--bg-bar)', border: '1px solid var(--border)' }}>
                <img src={asset('photos/caliste-e2af2b77.jpeg')} alt="" width="56" height="56" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--team-us)', flex: 'none' }} />
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '700', fontSize: '13px' }}>
                  <span style={{ color: 'var(--accent-gold)', display: 'flex' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" role="img" aria-label="ADC" style={{ flex: 'none' }}>
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
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 9px', borderRadius: '999px', fontSize: '12px', fontWeight: '600', border: '1px solid var(--team-us)', color: 'var(--team-us)' }}>Confiant</span>
                <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px' }}>
                  <span style={{ flex: '1' }}>
                    <span style={{ display: 'block', width: '100%', height: '5px', borderRadius: '2px', background: 'var(--border)', overflow: 'hidden' }}>
                      <span style={{ display: 'block', height: '100%', width: '78%', background: 'var(--team-us)' }} />
                    </span>
                  </span>
                  <span style={{ color: 'var(--team-us)', display: 'flex' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M6 15l6-6 6 6" />
                    </svg>
                  </span>
                </div>
              </div>
              <div style={{ flex: '1 1 0', minWidth: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '10px 6px', borderRadius: '10px', background: 'var(--bg-bar)', border: '1px solid var(--border)' }}>
                <img src={asset('photos/busio-3e722c8e.jpg')} alt="" width="56" height="56" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--accent-gold)', flex: 'none' }} />
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '700', fontSize: '13px' }}>
                  <span style={{ color: 'var(--accent-gold)', display: 'flex' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" role="img" aria-label="Support" style={{ flex: 'none' }}>
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
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 9px', borderRadius: '999px', fontSize: '12px', fontWeight: '600', border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)' }}>Tendu</span>
                <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px' }}>
                  <span style={{ flex: '1' }}>
                    <span style={{ display: 'block', width: '100%', height: '5px', borderRadius: '2px', background: 'var(--border)', overflow: 'hidden' }}>
                      <span style={{ display: 'block', height: '100%', width: '48%', background: 'var(--accent-gold)' }} />
                    </span>
                  </span>
                  <span style={{ color: 'var(--accent-gold)', display: 'flex' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </section>
          {' '}
          <section className="m-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h2 className="m-h2" style={{ margin: '0' }}>{'Discours à l\'équipe'}</h2>
              <span className="m-muted" style={{ fontSize: '11px' }}>Effet prévu sur le moral : ▲ hausse · ▼ baisse</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '8px' }}>
              <button type="button" aria-pressed="true" style={{ all: 'unset', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '6px', padding: '10px 12px', borderRadius: '10px', background: 'var(--bg-active)', border: '2px solid var(--team-us)' }}>
                <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '14px' }}>Rassurer</strong>
                </span>
                <span className="m-muted" style={{ fontSize: '12px' }}>« Une partie perdue, rien de plus. »</span>
                <span style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <img src={asset('photos/canna-7577c239.jpg')} alt="" width="22" height="22" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
                    <b style={{ fontSize: '11px', color: 'var(--team-us)' }}>▲</b>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <img src={asset('photos/yike-4203fc46.jpg')} alt="" width="22" height="22" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
                    <b style={{ fontSize: '11px', color: 'var(--team-us)' }}>▲</b>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <img src={asset('photos/kyeahoo-308e48bf.jpg')} alt="" width="22" height="22" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
                    <b style={{ fontSize: '11px', color: 'var(--team-us)' }}>▲</b>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <img src={asset('photos/caliste-e2af2b77.jpeg')} alt="" width="22" height="22" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
                    <b style={{ fontSize: '11px', color: 'var(--team-us)' }}>▲</b>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <img src={asset('photos/busio-3e722c8e.jpg')} alt="" width="22" height="22" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
                    <b style={{ fontSize: '11px', color: 'var(--team-us)' }}>▲</b>
                  </span>
                </span>
              </button>
              <button type="button" aria-pressed="false" style={{ all: 'unset', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '6px', padding: '10px 12px', borderRadius: '10px', background: 'var(--bg-bar)', border: '1px solid var(--border)' }}>
                <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '14px' }}>Exiger plus</strong>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 9px', borderRadius: '999px', fontSize: '12px', fontWeight: '600', border: '1px solid var(--team-them)', color: 'var(--team-them)' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 3l10 18H2z" />
                      <path d="M12 10v5M12 18v.5" />
                    </svg>
                    Risqué
                  </span>
                </span>
                <span className="m-muted" style={{ fontSize: '12px' }}>{'« Ce n\'est pas notre niveau. »'}</span>
                <span style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <img src={asset('photos/canna-7577c239.jpg')} alt="" width="22" height="22" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
                    <b style={{ fontSize: '11px', color: 'var(--team-us)' }}>▲</b>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <img src={asset('photos/yike-4203fc46.jpg')} alt="" width="22" height="22" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
                    <b style={{ fontSize: '11px', color: 'var(--team-us)' }}>▲</b>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <img src={asset('photos/kyeahoo-308e48bf.jpg')} alt="" width="22" height="22" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
                    <b style={{ fontSize: '11px', color: 'var(--team-them)' }}>▼</b>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <img src={asset('photos/caliste-e2af2b77.jpeg')} alt="" width="22" height="22" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
                    <b style={{ fontSize: '11px', color: 'var(--team-us)' }}>▲</b>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <img src={asset('photos/busio-3e722c8e.jpg')} alt="" width="22" height="22" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
                    <b style={{ fontSize: '11px', color: 'var(--team-them)' }}>▼</b>
                  </span>
                </span>
              </button>
              <button type="button" aria-pressed="false" style={{ all: 'unset', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '6px', padding: '10px 12px', borderRadius: '10px', background: 'var(--bg-bar)', border: '1px solid var(--border)' }}>
                <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '14px' }}>Parler à kyeahoo</strong>
                </span>
                <span className="m-muted" style={{ fontSize: '12px' }}>Seul à seul, avant la draft</span>
                <span style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <img src={asset('photos/kyeahoo-308e48bf.jpg')} alt="" width="22" height="22" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
                    <b style={{ fontSize: '11px', color: 'var(--team-us)' }}>▲</b>
                  </span>
                </span>
              </button>
            </div>
          </section>
        </div>
        {' '}
        <div style={{ flex: '1 1 280px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <section className="m-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h2 className="m-h2" style={{ margin: '0' }}>Plan pour la partie 3</h2>
            <span className="m-muted" style={{ fontSize: '11px' }}>2 choix maximum</span>
            <button type="button" aria-pressed="true" style={{ all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', background: 'var(--bg-active)', border: '2px solid var(--team-us)', fontSize: '13px' }}>
              <img src={asset('photos/caliste-e2af2b77.jpeg')} alt="" width="26" height="26" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
              <span style={{ flex: '1' }}>Jouer autour du bot</span>
              <span style={{ color: 'var(--team-us)' }}>✓</span>
            </button>
            <button type="button" aria-pressed="false" style={{ all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', background: 'var(--bg-bar)', border: '1px solid var(--border)', fontSize: '13px' }}>
              <img src={asset('photos/kyeahoo-308e48bf.jpg')} alt="" width="26" height="26" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
              <span style={{ flex: '1' }}>Sécuriser le mid</span>
            </button>
            <button type="button" aria-pressed="true" style={{ all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', background: 'var(--bg-active)', border: '2px solid var(--team-us)', fontSize: '13px' }}>
              <img src={OBJECTIVE_ICON.dragon} alt="Infernal" width="26" height="26" style={{ borderRadius: '13px', objectFit: 'cover', flex: 'none' }} />
              <span style={{ flex: '1' }}>Combats aux dragons</span>
              <span style={{ color: 'var(--team-us)' }}>✓</span>
            </button>
            <button type="button" aria-pressed="false" style={{ all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', background: 'var(--bg-bar)', border: '1px solid var(--border)', fontSize: '13px' }}>
              <img src={OBJECTIVE_ICON.nashor} alt="Baron" width="26" height="26" style={{ borderRadius: '13px', objectFit: 'cover', flex: 'none' }} />
              <span style={{ flex: '1' }}>Jeu lent et propre</span>
            </button>
          </section>
          {' '}
          <section className="m-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h2 className="m-h2" style={{ margin: '0' }}>Draft</h2>
            {' '}
            <div>
              <div className="m-muted" style={{ fontSize: '12px', marginBottom: '6px' }}>Côté</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" aria-pressed="true" style={{ all: 'unset', cursor: 'pointer', flex: '1', display: 'flex', flexDirection: 'column', gap: '2px', padding: '10px', borderRadius: '8px', background: 'color-mix(in srgb, var(--accent-blue) 20%, transparent)', border: '2px solid var(--accent-blue)' }}>
                  <strong style={{ fontSize: '14px', color: 'var(--accent-blue)' }}>Bleu</strong>
                  <span className="m-muted" style={{ fontSize: '11px' }}>Premier pick</span>
                </button>
                <button type="button" aria-pressed="false" style={{ all: 'unset', cursor: 'pointer', flex: '1', display: 'flex', flexDirection: 'column', gap: '2px', padding: '10px', borderRadius: '8px', background: 'color-mix(in srgb, var(--danger) 7%, transparent)', border: '1px solid var(--border)' }}>
                  <strong style={{ fontSize: '14px', color: 'var(--danger)' }}>Rouge</strong>
                  <span className="m-muted" style={{ fontSize: '11px' }}>Dernier pick</span>
                </button>
              </div>
            </div>
            {' '}
            <div>
              <div className="m-muted" style={{ fontSize: '12px', marginBottom: '6px' }}>Ban prioritaire</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '8px', background: 'var(--bg-bar)', border: '1px solid color-mix(in srgb, var(--danger) 40%, transparent)' }}>
                <img src={asset('champions/Taliyah.png')} alt="Taliyah" width="44" height="44" style={{ borderRadius: '8px', objectFit: 'cover', flex: 'none', border: '2px solid var(--danger)' }} />
                <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <strong style={{ fontSize: '14px' }}>Taliyah</strong>
                  <span className="m-muted" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <img src={asset('photos/caps-55dd587c.jpg')} alt="" width="18" height="18" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
                    {' Caps : 7/1/9 en partie 2'}
                  </span>
                </div>
              </div>
            </div>
            {' '}
            <div>
              <div className="m-muted" style={{ fontSize: '12px', marginBottom: '6px' }}>Remplacement</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', padding: '8px', borderRadius: '8px', background: 'var(--bg-bar)' }}>
                <img src={asset('logos/karmine-corp-f3aa9bbd.png')} alt="" width="20" height="20" style={{ objectFit: 'contain', flex: 'none' }} />
                {' Aucun · même cinq'}
              </div>
            </div>
            {' '}
            <a href="#draft" className="m-cta" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {'Passer à la draft '}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 6l8 6-8 6zM12 6l8 6-8 6z" />
              </svg>
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
