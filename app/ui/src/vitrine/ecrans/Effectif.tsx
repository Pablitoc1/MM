// Écran « Effectif » de la maquette v2, reproduit à l'identique.
// Généré depuis le rendu de la maquette, puis branché sur les fichiers de M1 (photos, logos).
// Les chiffres sont ceux de la maquette : des exemples en attendant les jalons qui les calculent.
import { assetUrl as asset } from '../../api';
import { Flag } from '../../components/ui';

export function EcranEffectif() {
  return (
    <main style={{ flex: '1', minWidth: '0', padding: '20px 24px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={asset('logos/karmine-corp-f3aa9bbd.png')} alt="" width="40" height="40" style={{ objectFit: 'contain', flex: 'none' }} />
          <h1 style={{ margin: '0', fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '26px' }}>Effectif</h1>
        </div>
        {' '}
        <div role="tablist" aria-label="Groupes" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button type="button" role="tab" aria-selected="true" className="m-btn m-on">
            {'Équipe première '}
            <span className="m-muted">5</span>
          </button>
          {' '}
          <button type="button" role="tab" aria-selected="false" className="m-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <img src={asset('logos/karmine-corp-f3aa9bbd.png')} alt="" width="16" height="16" style={{ objectFit: 'contain', flex: 'none' }} />
            {' Académie (KC Blue) '}
            <span className="m-muted">5</span>
          </button>
          {' '}
          <button type="button" role="tab" aria-selected="false" className="m-btn">
            {'Staff '}
            <span className="m-muted">5</span>
          </button>
        </div>
      </div>
      {' '}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
        <div className="m-card" style={{ flex: '1 1 180px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span className="m-muted" style={{ fontSize: '12px' }}>Niveau moyen</span>
          <strong style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '22px', color: 'var(--accent-gold)' }}>★ 3,8 / 5</strong>
          <span className="m-muted" style={{ fontSize: '12px' }}>2e de la LEC</span>
        </div>
        <div className="m-card" style={{ flex: '1 1 180px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span className="m-muted" style={{ fontSize: '12px' }}>Âge moyen</span>
          <strong style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '22px', color: 'var(--text)' }}>22 ans</strong>
          <span className="m-muted" style={{ fontSize: '12px' }}>Le plus jeune top 4</span>
        </div>
        <div className="m-card" style={{ flex: '1 1 180px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span className="m-muted" style={{ fontSize: '12px' }}>Masse salariale</span>
          <strong style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '22px', color: 'var(--team-them)' }}>1,6 M€</strong>
          <span className="m-muted" style={{ fontSize: '12px' }}>84 % du plafond fixé</span>
        </div>
        <div className="m-card" style={{ flex: '1 1 180px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span className="m-muted" style={{ fontSize: '12px' }}>{'Valeur de l\'effectif'}</span>
          <strong style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '22px', color: 'var(--team-us)' }}>5,45 M€</strong>
          <span className="m-muted" style={{ fontSize: '12px' }}>En hausse de 12 %</span>
        </div>
      </div>
      {' '}
      <section className="m-card" style={{ padding: '6px 14px', overflowX: 'auto' }}>
        <table className="m-table" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th>Poste</th>
              <th>Joueur</th>
              <th>Âge</th>
              <th>Champions</th>
              <th>Niveau</th>
              <th>Forme</th>
              <th>Moral / fatigue</th>
              <th>Valeur · contrat</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <span style={{ color: 'var(--accent-gold)', display: 'flex' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" role="img" aria-label="Top" style={{ flex: 'none' }}>
                    <g fill="currentColor" fillOpacity=".35">
                      <path d="M22 6V22H6L10 18H18V10Z" />
                    </g>
                    <g fill="currentColor">
                      <path d="M2 2H18L14 6H6V14L2 18Z" />
                      <rect x="9.5" y="9.5" width="5" height="5" />
                    </g>
                  </svg>
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={asset('photos/canna-7577c239.jpg')} alt="" width="40" height="40" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border-strong)', flex: 'none' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <a href="#joueur" style={{ fontWeight: '700', color: 'var(--text)', textDecoration: 'none', fontSize: '14px' }}>Canna</a>
                    <span className="m-muted" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                      <Flag code="KR" width={16} />
                      Kim Chang-dong
                    </span>
                  </div>
                </div>
              </td>
              <td>25</td>
              <td>
                <div style={{ display: 'flex', gap: '3px' }}>
                  <img src={asset('champions/Renekton.png')} alt="Renekton" width="24" height="24" style={{ borderRadius: '6px', objectFit: 'cover', flex: 'none' }} />
                  <img src={asset('champions/KSante.png')} alt="KSante" width="24" height="24" style={{ borderRadius: '6px', objectFit: 'cover', flex: 'none' }} />
                  <img src={asset('champions/Gnar.png')} alt="Gnar" width="24" height="24" style={{ borderRadius: '6px', objectFit: 'cover', flex: 'none' }} />
                </div>
              </td>
              <td>
                <div className="m-muted" style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10px' }}>
                  <span style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ width: '20px' }}>Niv.</span>
                    <span style={{ display: 'inline-flex', gap: '1px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-gold)' }} />
                      </svg>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-gold)' }} />
                      </svg>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-gold)' }} />
                      </svg>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-gold)' }} />
                      </svg>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--border-strong)' }} />
                      </svg>
                      <span className="visually-hidden" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>4 sur 5</span>
                    </span>
                  </span>
                  <span style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ width: '20px' }}>Pot.</span>
                    <span style={{ display: 'inline-flex', gap: '1px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-blue)' }} />
                      </svg>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-blue)' }} />
                      </svg>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-blue)' }} />
                      </svg>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-blue)' }} />
                      </svg>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--border-strong)' }} />
                      </svg>
                      <span className="visually-hidden" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>4 sur 5</span>
                    </span>
                  </span>
                </div>
              </td>
              <td>
                <span style={{ display: 'inline-flex', gap: '3px' }}>
                  <span title="Victoire" style={{ width: '16px', height: '16px', borderRadius: '4px', fontSize: '9px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in srgb, var(--team-us) 20%, transparent)', color: 'var(--team-us)' }}>V</span>
                  <span title="Victoire" style={{ width: '16px', height: '16px', borderRadius: '4px', fontSize: '9px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in srgb, var(--team-us) 20%, transparent)', color: 'var(--team-us)' }}>V</span>
                  <span title="Défaite" style={{ width: '16px', height: '16px', borderRadius: '4px', fontSize: '9px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in srgb, var(--team-them) 20%, transparent)', color: 'var(--team-them)' }}>D</span>
                  <span title="Victoire" style={{ width: '16px', height: '16px', borderRadius: '4px', fontSize: '9px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in srgb, var(--team-us) 20%, transparent)', color: 'var(--team-us)' }}>V</span>
                  <span title="Victoire" style={{ width: '16px', height: '16px', borderRadius: '4px', fontSize: '9px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in srgb, var(--team-us) 20%, transparent)', color: 'var(--team-us)' }}>V</span>
                </span>
              </td>
              <td>
                <div className="m-muted" style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '120px', fontSize: '10px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '36px' }}>Moral</span>
                    <span style={{ flex: '1' }}>
                      <span style={{ display: 'block', width: '100%', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
                        <span style={{ display: 'block', height: '100%', width: '72%', background: 'var(--team-us)' }} />
                      </span>
                    </span>
                    <b style={{ color: 'var(--team-us)', width: '30px', textAlign: 'right' }}>72</b>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '36px' }}>Fatigue</span>
                    <span style={{ flex: '1' }}>
                      <span style={{ display: 'block', width: '100%', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
                        <span style={{ display: 'block', height: '100%', width: '35%', background: 'var(--team-us)' }} />
                      </span>
                    </span>
                    <b style={{ color: 'var(--team-us)', width: '30px', textAlign: 'right' }}>35 %</b>
                  </span>
                </div>
              </td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span>
                    <strong>950 k€</strong>
                    {' '}
                    <span className="m-muted" style={{ fontSize: '11px' }}>· nov. 2026</span>
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--team-them)', fontWeight: '600' }}>Fin de contrat cette année</span>
                </div>
              </td>
              <td>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', maxWidth: '130px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 9px', borderRadius: '999px', fontSize: '12px', fontWeight: '600', border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
                    </svg>
                    Leader
                  </span>
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <span style={{ color: 'var(--accent-gold)', display: 'flex' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" role="img" aria-label="Jungle" style={{ flex: 'none' }}>
                    <g fill="currentColor" fillOpacity=".35" />
                    <g fill="currentColor">
                      <path d="M5 22C3.5 16 3 10 4 3C7 8 9 13 9.5 19Z" />
                      <path d="M11.2 22C10.3 15 10.6 8 12 1.5C13.4 8 13.7 15 12.8 22Z" />
                      <path d="M19 22C20.5 16 21 10 20 3C17 8 15 13 14.5 19Z" />
                    </g>
                  </svg>
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={asset('photos/yike-4203fc46.jpg')} alt="" width="40" height="40" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border-strong)', flex: 'none' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <a href="#joueur" style={{ fontWeight: '700', color: 'var(--text)', textDecoration: 'none', fontSize: '14px' }}>Yike</a>
                    <span className="m-muted" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                      <Flag code="SE" width={16} />
                      Martin Sundelin
                    </span>
                  </div>
                </div>
              </td>
              <td>23</td>
              <td>
                <div style={{ display: 'flex', gap: '3px' }}>
                  <img src={asset('champions/XinZhao.png')} alt="XinZhao" width="24" height="24" style={{ borderRadius: '6px', objectFit: 'cover', flex: 'none' }} />
                  <img src={asset('champions/Vi.png')} alt="Vi" width="24" height="24" style={{ borderRadius: '6px', objectFit: 'cover', flex: 'none' }} />
                  <img src={asset('champions/Sejuani.png')} alt="Sejuani" width="24" height="24" style={{ borderRadius: '6px', objectFit: 'cover', flex: 'none' }} />
                </div>
              </td>
              <td>
                <div className="m-muted" style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10px' }}>
                  <span style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ width: '20px' }}>Niv.</span>
                    <span style={{ display: 'inline-flex', gap: '1px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-gold)' }} />
                      </svg>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-gold)' }} />
                      </svg>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-gold)' }} />
                      </svg>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-gold)' }} />
                      </svg>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--border-strong)' }} />
                      </svg>
                      <span className="visually-hidden" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>4 sur 5</span>
                    </span>
                  </span>
                  <span style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ width: '20px' }}>Pot.</span>
                    <span style={{ display: 'inline-flex', gap: '1px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-blue)' }} />
                      </svg>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-blue)' }} />
                      </svg>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-blue)' }} />
                      </svg>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-blue)' }} />
                      </svg>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="0.5" style={{ fill: 'var(--accent-blue)' }} />
                      </svg>
                      <span className="visually-hidden" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>4.5 sur 5</span>
                    </span>
                  </span>
                </div>
              </td>
              <td>
                <span style={{ display: 'inline-flex', gap: '3px' }}>
                  <span title="Victoire" style={{ width: '16px', height: '16px', borderRadius: '4px', fontSize: '9px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in srgb, var(--team-us) 20%, transparent)', color: 'var(--team-us)' }}>V</span>
                  <span title="Victoire" style={{ width: '16px', height: '16px', borderRadius: '4px', fontSize: '9px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in srgb, var(--team-us) 20%, transparent)', color: 'var(--team-us)' }}>V</span>
                  <span title="Victoire" style={{ width: '16px', height: '16px', borderRadius: '4px', fontSize: '9px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in srgb, var(--team-us) 20%, transparent)', color: 'var(--team-us)' }}>V</span>
                  <span title="Défaite" style={{ width: '16px', height: '16px', borderRadius: '4px', fontSize: '9px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in srgb, var(--team-them) 20%, transparent)', color: 'var(--team-them)' }}>D</span>
                  <span title="Victoire" style={{ width: '16px', height: '16px', borderRadius: '4px', fontSize: '9px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in srgb, var(--team-us) 20%, transparent)', color: 'var(--team-us)' }}>V</span>
                </span>
              </td>
              <td>
                <div className="m-muted" style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '120px', fontSize: '10px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '36px' }}>Moral</span>
                    <span style={{ flex: '1' }}>
                      <span style={{ display: 'block', width: '100%', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
                        <span style={{ display: 'block', height: '100%', width: '80%', background: 'var(--team-us)' }} />
                      </span>
                    </span>
                    <b style={{ color: 'var(--team-us)', width: '30px', textAlign: 'right' }}>80</b>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '36px' }}>Fatigue</span>
                    <span style={{ flex: '1' }}>
                      <span style={{ display: 'block', width: '100%', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
                        <span style={{ display: 'block', height: '100%', width: '40%', background: 'var(--team-us)' }} />
                      </span>
                    </span>
                    <b style={{ color: 'var(--team-us)', width: '30px', textAlign: 'right' }}>40 %</b>
                  </span>
                </div>
              </td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span>
                    <strong>1,2 M€</strong>
                    {' '}
                    <span className="m-muted" style={{ fontSize: '11px' }}>· nov. 2027</span>
                  </span>
                </div>
              </td>
              <td>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', maxWidth: '130px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 9px', borderRadius: '999px', fontSize: '12px', fontWeight: '600', border: '1px solid var(--team-them)', color: 'var(--team-them)' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />
                      <circle cx="12" cy="12" r="2.5" />
                    </svg>
                    Convoité
                  </span>
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <span style={{ color: 'var(--accent-gold)', display: 'flex' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" role="img" aria-label="Mid" style={{ flex: 'none' }}>
                    <g fill="currentColor" fillOpacity=".35">
                      <path d="M2 2H13L2 13Z" />
                      <path d="M22 22H11L22 11Z" />
                    </g>
                    <g fill="currentColor">
                      <path d="M17 2H22V7L7 22H2V17Z" />
                    </g>
                  </svg>
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={asset('photos/kyeahoo-308e48bf.jpg')} alt="" width="40" height="40" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border-strong)', flex: 'none' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <a href="#joueur" style={{ fontWeight: '700', color: 'var(--text)', textDecoration: 'none', fontSize: '14px' }}>kyeahoo</a>
                    <span className="m-muted" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                      <Flag code="KR" width={16} />
                      Kang Ye-hoo
                    </span>
                  </div>
                </div>
              </td>
              <td>22</td>
              <td>
                <div style={{ display: 'flex', gap: '3px' }}>
                  <img src={asset('champions/Orianna.png')} alt="Orianna" width="24" height="24" style={{ borderRadius: '6px', objectFit: 'cover', flex: 'none' }} />
                  <img src={asset('champions/Azir.png')} alt="Azir" width="24" height="24" style={{ borderRadius: '6px', objectFit: 'cover', flex: 'none' }} />
                  <img src={asset('champions/Syndra.png')} alt="Syndra" width="24" height="24" style={{ borderRadius: '6px', objectFit: 'cover', flex: 'none' }} />
                </div>
              </td>
              <td>
                <div className="m-muted" style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10px' }}>
                  <span style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ width: '20px' }}>Niv.</span>
                    <span style={{ display: 'inline-flex', gap: '1px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-gold)' }} />
                      </svg>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-gold)' }} />
                      </svg>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-gold)' }} />
                      </svg>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="0.5" style={{ fill: 'var(--accent-gold)' }} />
                      </svg>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--border-strong)' }} />
                      </svg>
                      <span className="visually-hidden" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>3.5 sur 5</span>
                    </span>
                  </span>
                  <span style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ width: '20px' }}>Pot.</span>
                    <span style={{ display: 'inline-flex', gap: '1px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-blue)' }} />
                      </svg>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-blue)' }} />
                      </svg>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-blue)' }} />
                      </svg>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-blue)' }} />
                      </svg>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="0.5" style={{ fill: 'var(--accent-blue)' }} />
                      </svg>
                      <span className="visually-hidden" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>4.5 sur 5</span>
                    </span>
                  </span>
                </div>
              </td>
              <td>
                <span style={{ display: 'inline-flex', gap: '3px' }}>
                  <span title="Défaite" style={{ width: '16px', height: '16px', borderRadius: '4px', fontSize: '9px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in srgb, var(--team-them) 20%, transparent)', color: 'var(--team-them)' }}>D</span>
                  <span title="Victoire" style={{ width: '16px', height: '16px', borderRadius: '4px', fontSize: '9px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in srgb, var(--team-us) 20%, transparent)', color: 'var(--team-us)' }}>V</span>
                  <span title="Défaite" style={{ width: '16px', height: '16px', borderRadius: '4px', fontSize: '9px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in srgb, var(--team-them) 20%, transparent)', color: 'var(--team-them)' }}>D</span>
                  <span title="Victoire" style={{ width: '16px', height: '16px', borderRadius: '4px', fontSize: '9px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in srgb, var(--team-us) 20%, transparent)', color: 'var(--team-us)' }}>V</span>
                  <span title="Défaite" style={{ width: '16px', height: '16px', borderRadius: '4px', fontSize: '9px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in srgb, var(--team-them) 20%, transparent)', color: 'var(--team-them)' }}>D</span>
                </span>
              </td>
              <td>
                <div className="m-muted" style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '120px', fontSize: '10px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '36px' }}>Moral</span>
                    <span style={{ flex: '1' }}>
                      <span style={{ display: 'block', width: '100%', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
                        <span style={{ display: 'block', height: '100%', width: '45%', background: 'var(--team-them)' }} />
                      </span>
                    </span>
                    <b style={{ color: 'var(--team-them)', width: '30px', textAlign: 'right' }}>45</b>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '36px' }}>Fatigue</span>
                    <span style={{ flex: '1' }}>
                      <span style={{ display: 'block', width: '100%', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
                        <span style={{ display: 'block', height: '100%', width: '30%', background: 'var(--team-us)' }} />
                      </span>
                    </span>
                    <b style={{ color: 'var(--team-us)', width: '30px', textAlign: 'right' }}>30 %</b>
                  </span>
                </div>
              </td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span>
                    <strong>800 k€</strong>
                    {' '}
                    <span className="m-muted" style={{ fontSize: '11px' }}>· nov. 2027</span>
                  </span>
                </div>
              </td>
              <td>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', maxWidth: '130px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 9px', borderRadius: '999px', fontSize: '12px', fontWeight: '600', border: '1px solid var(--team-them)', color: 'var(--team-them)' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 3l10 18H2z" />
                      <path d="M12 10v5M12 18v.5" />
                    </svg>
                    Inquiet
                  </span>
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <span style={{ color: 'var(--accent-gold)', display: 'flex' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" role="img" aria-label="ADC" style={{ flex: 'none' }}>
                    <g fill="currentColor" fillOpacity=".35">
                      <path d="M2 18V2H18L14 6H6V14Z" />
                    </g>
                    <g fill="currentColor">
                      <path d="M22 22H6L10 18H18V10L22 6Z" />
                      <rect x="9.5" y="9.5" width="5" height="5" />
                    </g>
                  </svg>
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={asset('photos/caliste-e2af2b77.jpeg')} alt="" width="40" height="40" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border-strong)', flex: 'none' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <a href="#joueur" style={{ fontWeight: '700', color: 'var(--text)', textDecoration: 'none', fontSize: '14px' }}>Caliste</a>
                    <span className="m-muted" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                      <Flag code="FR" width={16} />
                      Caliste Henry-Hennebert
                    </span>
                  </div>
                </div>
              </td>
              <td>19</td>
              <td>
                <div style={{ display: 'flex', gap: '3px' }}>
                  <img src={asset('champions/Varus.png')} alt="Varus" width="24" height="24" style={{ borderRadius: '6px', objectFit: 'cover', flex: 'none' }} />
                  <img src={asset('champions/Kaisa.png')} alt="Kaisa" width="24" height="24" style={{ borderRadius: '6px', objectFit: 'cover', flex: 'none' }} />
                  <img src={asset('champions/Ezreal.png')} alt="Ezreal" width="24" height="24" style={{ borderRadius: '6px', objectFit: 'cover', flex: 'none' }} />
                </div>
              </td>
              <td>
                <div className="m-muted" style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10px' }}>
                  <span style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ width: '20px' }}>Niv.</span>
                    <span style={{ display: 'inline-flex', gap: '1px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-gold)' }} />
                      </svg>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-gold)' }} />
                      </svg>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-gold)' }} />
                      </svg>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-gold)' }} />
                      </svg>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--border-strong)' }} />
                      </svg>
                      <span className="visually-hidden" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>4 sur 5</span>
                    </span>
                  </span>
                  <span style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ width: '20px' }}>Pot.</span>
                    <span style={{ display: 'inline-flex', gap: '1px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-blue)' }} />
                      </svg>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-blue)' }} />
                      </svg>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-blue)' }} />
                      </svg>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-blue)' }} />
                      </svg>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-blue)' }} />
                      </svg>
                      <span className="visually-hidden" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>5 sur 5</span>
                    </span>
                  </span>
                </div>
              </td>
              <td>
                <span style={{ display: 'inline-flex', gap: '3px' }}>
                  <span title="Victoire" style={{ width: '16px', height: '16px', borderRadius: '4px', fontSize: '9px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in srgb, var(--team-us) 20%, transparent)', color: 'var(--team-us)' }}>V</span>
                  <span title="Victoire" style={{ width: '16px', height: '16px', borderRadius: '4px', fontSize: '9px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in srgb, var(--team-us) 20%, transparent)', color: 'var(--team-us)' }}>V</span>
                  <span title="Victoire" style={{ width: '16px', height: '16px', borderRadius: '4px', fontSize: '9px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in srgb, var(--team-us) 20%, transparent)', color: 'var(--team-us)' }}>V</span>
                  <span title="Victoire" style={{ width: '16px', height: '16px', borderRadius: '4px', fontSize: '9px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in srgb, var(--team-us) 20%, transparent)', color: 'var(--team-us)' }}>V</span>
                  <span title="Victoire" style={{ width: '16px', height: '16px', borderRadius: '4px', fontSize: '9px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in srgb, var(--team-us) 20%, transparent)', color: 'var(--team-us)' }}>V</span>
                </span>
              </td>
              <td>
                <div className="m-muted" style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '120px', fontSize: '10px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '36px' }}>Moral</span>
                    <span style={{ flex: '1' }}>
                      <span style={{ display: 'block', width: '100%', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
                        <span style={{ display: 'block', height: '100%', width: '88%', background: 'var(--team-us)' }} />
                      </span>
                    </span>
                    <b style={{ color: 'var(--team-us)', width: '30px', textAlign: 'right' }}>88</b>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '36px' }}>Fatigue</span>
                    <span style={{ flex: '1' }}>
                      <span style={{ display: 'block', width: '100%', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
                        <span style={{ display: 'block', height: '100%', width: '68%', background: 'var(--team-them)' }} />
                      </span>
                    </span>
                    <b style={{ color: 'var(--team-them)', width: '30px', textAlign: 'right' }}>68 %</b>
                  </span>
                </div>
              </td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span>
                    <strong>1,8 M€</strong>
                    {' '}
                    <span className="m-muted" style={{ fontSize: '11px' }}>· nov. 2028</span>
                  </span>
                </div>
              </td>
              <td>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', maxWidth: '130px' }}>
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
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <span style={{ color: 'var(--accent-gold)', display: 'flex' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" role="img" aria-label="Support" style={{ flex: 'none' }}>
                    <g fill="currentColor" fillOpacity=".35" />
                    <g fill="currentColor">
                      <path d="M12 6.5L15.2 10.5L12 22L8.8 10.5Z" />
                      <path d="M1.5 6H9L10.2 9L7.5 12.5L5 9.5Z" />
                      <path d="M22.5 6H15L13.8 9L16.5 12.5L19 9.5Z" />
                      <path d="M9.5 2.5H14.5L12 5.2Z" />
                    </g>
                  </svg>
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={asset('photos/busio-3e722c8e.jpg')} alt="" width="40" height="40" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border-strong)', flex: 'none' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <a href="#joueur" style={{ fontWeight: '700', color: 'var(--text)', textDecoration: 'none', fontSize: '14px' }}>Busio</a>
                    <span className="m-muted" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                      <Flag code="US" width={16} />
                      Alan Cwalina
                    </span>
                  </div>
                </div>
              </td>
              <td>21</td>
              <td>
                <div style={{ display: 'flex', gap: '3px' }}>
                  <img src={asset('champions/Rakan.png')} alt="Rakan" width="24" height="24" style={{ borderRadius: '6px', objectFit: 'cover', flex: 'none' }} />
                  <img src={asset('champions/Braum.png')} alt="Braum" width="24" height="24" style={{ borderRadius: '6px', objectFit: 'cover', flex: 'none' }} />
                </div>
              </td>
              <td>
                <div className="m-muted" style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10px' }}>
                  <span style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ width: '20px' }}>Niv.</span>
                    <span style={{ display: 'inline-flex', gap: '1px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-gold)' }} />
                      </svg>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-gold)' }} />
                      </svg>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-gold)' }} />
                      </svg>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="0.5" style={{ fill: 'var(--accent-gold)' }} />
                      </svg>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--border-strong)' }} />
                      </svg>
                      <span className="visually-hidden" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>3.5 sur 5</span>
                    </span>
                  </span>
                  <span style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ width: '20px' }}>Pot.</span>
                    <span style={{ display: 'inline-flex', gap: '1px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-blue)' }} />
                      </svg>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-blue)' }} />
                      </svg>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-blue)' }} />
                      </svg>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-blue)' }} />
                      </svg>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--border-strong)' }} />
                      </svg>
                      <span className="visually-hidden" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>4 sur 5</span>
                    </span>
                  </span>
                </div>
              </td>
              <td>
                <span style={{ display: 'inline-flex', gap: '3px' }}>
                  <span title="Victoire" style={{ width: '16px', height: '16px', borderRadius: '4px', fontSize: '9px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in srgb, var(--team-us) 20%, transparent)', color: 'var(--team-us)' }}>V</span>
                  <span title="Défaite" style={{ width: '16px', height: '16px', borderRadius: '4px', fontSize: '9px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in srgb, var(--team-them) 20%, transparent)', color: 'var(--team-them)' }}>D</span>
                  <span title="Victoire" style={{ width: '16px', height: '16px', borderRadius: '4px', fontSize: '9px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in srgb, var(--team-us) 20%, transparent)', color: 'var(--team-us)' }}>V</span>
                  <span title="Victoire" style={{ width: '16px', height: '16px', borderRadius: '4px', fontSize: '9px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in srgb, var(--team-us) 20%, transparent)', color: 'var(--team-us)' }}>V</span>
                  <span title="Victoire" style={{ width: '16px', height: '16px', borderRadius: '4px', fontSize: '9px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in srgb, var(--team-us) 20%, transparent)', color: 'var(--team-us)' }}>V</span>
                </span>
              </td>
              <td>
                <div className="m-muted" style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '120px', fontSize: '10px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '36px' }}>Moral</span>
                    <span style={{ flex: '1' }}>
                      <span style={{ display: 'block', width: '100%', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
                        <span style={{ display: 'block', height: '100%', width: '84%', background: 'var(--team-us)' }} />
                      </span>
                    </span>
                    <b style={{ color: 'var(--team-us)', width: '30px', textAlign: 'right' }}>84</b>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '36px' }}>Fatigue</span>
                    <span style={{ flex: '1' }}>
                      <span style={{ display: 'block', width: '100%', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
                        <span style={{ display: 'block', height: '100%', width: '30%', background: 'var(--team-us)' }} />
                      </span>
                    </span>
                    <b style={{ color: 'var(--team-us)', width: '30px', textAlign: 'right' }}>30 %</b>
                  </span>
                </div>
              </td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span>
                    <strong>700 k€</strong>
                    {' '}
                    <span className="m-muted" style={{ fontSize: '11px' }}>· nov. 2026</span>
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--team-them)', fontWeight: '600' }}>Fin de contrat cette année</span>
                </div>
              </td>
              <td>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', maxWidth: '130px' }} />
              </td>
            </tr>
          </tbody>
        </table>
      </section>
      {' '}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
        <section className="m-card" style={{ flex: '1 1 380px' }}>
          <h2 className="m-h2">Profondeur par poste</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', padding: '4px 0' }}>
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
            <span style={{ width: '70px' }}>Canna</span>
            <span style={{ flex: '1' }}>
              <span style={{ display: 'block', width: '100%', height: '5px', borderRadius: '2px', background: 'var(--border)', overflow: 'hidden' }}>
                <span style={{ display: 'block', height: '100%', width: '100%', background: 'var(--team-us)' }} />
              </span>
            </span>
            <span style={{ color: 'var(--team-them)', fontWeight: '700', fontSize: '11px' }}>Aucun remplaçant</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', padding: '4px 0' }}>
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
            <span style={{ width: '70px' }}>Yike</span>
            <span style={{ flex: '1' }}>
              <span style={{ display: 'block', width: '100%', height: '5px', borderRadius: '2px', background: 'var(--border)', overflow: 'hidden' }}>
                <span style={{ display: 'block', height: '100%', width: '100%', background: 'var(--team-us)' }} />
              </span>
            </span>
            <span style={{ color: 'var(--team-them)', fontWeight: '700', fontSize: '11px' }}>Aucun remplaçant</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', padding: '4px 0' }}>
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
            <span style={{ width: '70px' }}>kyeahoo</span>
            <span style={{ flex: '1' }}>
              <span style={{ display: 'block', width: '100%', height: '5px', borderRadius: '2px', background: 'var(--border)', overflow: 'hidden' }}>
                <span style={{ display: 'block', height: '100%', width: '100%', background: 'var(--team-us)' }} />
              </span>
            </span>
            <span style={{ color: 'var(--team-them)', fontWeight: '700', fontSize: '11px' }}>Aucun remplaçant</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', padding: '4px 0' }}>
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
            <span style={{ width: '70px' }}>Caliste</span>
            <span style={{ flex: '1' }}>
              <span style={{ display: 'block', width: '100%', height: '5px', borderRadius: '2px', background: 'var(--border)', overflow: 'hidden' }}>
                <span style={{ display: 'block', height: '100%', width: '100%', background: 'var(--team-us)' }} />
              </span>
            </span>
            <span style={{ color: 'var(--team-them)', fontWeight: '700', fontSize: '11px' }}>Aucun remplaçant</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', padding: '4px 0' }}>
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
            <span style={{ width: '70px' }}>Busio</span>
            <span style={{ flex: '1' }}>
              <span style={{ display: 'block', width: '100%', height: '5px', borderRadius: '2px', background: 'var(--border)', overflow: 'hidden' }}>
                <span style={{ display: 'block', height: '100%', width: '100%', background: 'var(--team-us)' }} />
              </span>
            </span>
            <span style={{ color: 'var(--team-them)', fontWeight: '700', fontSize: '11px' }}>Aucun remplaçant</span>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: '12px', color: 'var(--team-them)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3l10 18H2z" />
              <path d="M12 10v5M12 18v.5" />
            </svg>
            {' Aucun remplaçant en équipe première : une blessure obligera à monter un joueur de KC Blue.'}
          </p>
        </section>
        {' '}
        <section className="m-card" style={{ flex: '1 1 380px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="m-h2" style={{ margin: '0' }}>Staff</h2>
            <a href="#" style={{ fontSize: '12px' }}>Gérer</a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0' }}>
            <span style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--bg-active)', color: 'var(--accent-gold)', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>HC</span>
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>Coach principal</span>
              <span className="m-muted" style={{ fontSize: '11px' }}>Nom à charger depuis la base</span>
            </div>
            <span style={{ display: 'inline-flex', gap: '1px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-gold)' }} />
              </svg>
              <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-gold)' }} />
              </svg>
              <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-gold)' }} />
              </svg>
              <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-gold)' }} />
              </svg>
              <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="0.5" style={{ fill: 'var(--accent-gold)' }} />
              </svg>
              <span className="visually-hidden" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>4.5 sur 5</span>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0' }}>
            <span style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--bg-active)', color: 'var(--accent-gold)', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>AC</span>
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>Coach adjoint</span>
              <span className="m-muted" style={{ fontSize: '11px' }}>Nom à charger depuis la base</span>
            </div>
            <span style={{ display: 'inline-flex', gap: '1px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-gold)' }} />
              </svg>
              <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-gold)' }} />
              </svg>
              <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-gold)' }} />
              </svg>
              <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="0.5" style={{ fill: 'var(--accent-gold)' }} />
              </svg>
              <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--border-strong)' }} />
              </svg>
              <span className="visually-hidden" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>3.5 sur 5</span>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0' }}>
            <span style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--bg-active)', color: 'var(--accent-gold)', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>AN</span>
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>Analyste</span>
              <span className="m-muted" style={{ fontSize: '11px' }}>Nom à charger depuis la base</span>
            </div>
            <span style={{ display: 'inline-flex', gap: '1px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-gold)' }} />
              </svg>
              <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-gold)' }} />
              </svg>
              <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-gold)' }} />
              </svg>
              <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="0.5" style={{ fill: 'var(--accent-gold)' }} />
              </svg>
              <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--border-strong)' }} />
              </svg>
              <span className="visually-hidden" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>3.5 sur 5</span>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0' }}>
            <span style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--bg-active)', color: 'var(--accent-gold)', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>PS</span>
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>Psychologue</span>
              <span className="m-muted" style={{ fontSize: '11px' }}>Nom à charger depuis la base</span>
            </div>
            <span style={{ display: 'inline-flex', gap: '1px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-gold)' }} />
              </svg>
              <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-gold)' }} />
              </svg>
              <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-gold)' }} />
              </svg>
              <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--border-strong)' }} />
              </svg>
              <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--border-strong)' }} />
              </svg>
              <span className="visually-hidden" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>3 sur 5</span>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0' }}>
            <span style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--bg-active)', color: 'var(--accent-gold)', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>PH</span>
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>Préparateur physique</span>
              <span className="m-muted" style={{ fontSize: '11px' }}>Nom à charger depuis la base</span>
            </div>
            <span style={{ display: 'inline-flex', gap: '1px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-gold)' }} />
              </svg>
              <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-gold)' }} />
              </svg>
              <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--accent-gold)' }} />
              </svg>
              <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--border-strong)' }} />
              </svg>
              <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fillOpacity="1" style={{ fill: 'var(--border-strong)' }} />
              </svg>
              <span className="visually-hidden" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>3 sur 5</span>
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}
