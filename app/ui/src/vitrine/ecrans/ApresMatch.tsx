// Écran « ApresMatch » de la maquette v2, reproduit à l'identique.
// Généré depuis le rendu de la maquette, puis branché sur les fichiers de M1 (photos, logos).
// Les chiffres sont ceux de la maquette : des exemples en attendant les jalons qui les calculent.
import { assetUrl as asset } from '../../api';
import { Flag, OBJECTIVE_ICON } from '../../components/ui';

export function EcranApresMatch() {
  return (
    <main style={{ flex: '1', minWidth: '0', padding: '18px 24px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <section style={{ borderRadius: '14px', padding: '16px 22px', background: 'linear-gradient(100deg,color-mix(in srgb, var(--team-us) 20%, transparent),var(--bg-card) 45%,var(--bg-card) 60%,color-mix(in srgb, var(--team-them) 10%, transparent))', border: '1px solid color-mix(in srgb, var(--team-us) 33%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img src={asset('logos/karmine-corp-f3aa9bbd.png')} alt="" width="56" height="56" style={{ objectFit: 'contain', flex: 'none' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '.12em', color: 'var(--team-us)' }}>VICTOIRE</span>
            <span style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '34px', fontWeight: '700' }}>1 – 0</span>
            <span className="m-muted" style={{ fontSize: '12px' }}>LEC Versus · Semaine 1 · Bo1 · 32:14 · Sam. 17 janvier</span>
          </div>
          <img src={asset('logos/g2-esports-7d6673d3.png')} alt="" width="52" height="52" style={{ objectFit: 'contain', flex: 'none' }} />
        </div>
        {' '}
        <div style={{ flex: '1 1 260px', maxWidth: '340px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <b style={{ width: '46px', color: 'var(--team-us)' }}>18</b>
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span className="m-muted" style={{ fontSize: '11px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '5px', alignItems: 'center' }}>Kills</span>
              <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', gap: '2px' }}>
                <span style={{ width: '67%', background: 'var(--team-us)' }} />
                <span style={{ flex: '1', background: 'var(--team-them)' }} />
              </div>
            </div>
            <b style={{ width: '46px', textAlign: 'right', color: 'var(--team-them)' }}>9</b>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <b style={{ width: '46px', color: 'var(--team-us)' }}>9</b>
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span className="m-muted" style={{ fontSize: '11px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '5px', alignItems: 'center' }}>
                <svg width="12" height="14" viewBox="0 0 20 26" aria-hidden="true">
                  <path d="M4 25 L6 12 L14 12 L16 25 Z" strokeWidth="1.2" style={{ fill: 'var(--tower-body)', stroke: 'var(--bg-page)' }} />
                  <path d="M6 25 L7.5 14 L9 25 Z" style={{ fill: 'var(--tower-light)' }} />
                  <path d="M3 12 L17 12 L15 9 L5 9 Z" strokeWidth="1" style={{ fill: 'var(--tower-top)', stroke: 'var(--bg-page)' }} />
                  <path d="M10 1 L14 6 L10 10 L6 6 Z" strokeWidth="1" style={{ fill: 'var(--accent-blue)', stroke: 'var(--bg-page)' }} />
                  <circle cx="10" cy="5.5" r="1.4" fillOpacity=".8" style={{ fill: 'var(--white)' }} />
                </svg>
                Tours
              </span>
              <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', gap: '2px' }}>
                <span style={{ width: '75%', background: 'var(--team-us)' }} />
                <span style={{ flex: '1', background: 'var(--team-them)' }} />
              </div>
            </div>
            <b style={{ width: '46px', textAlign: 'right', color: 'var(--team-them)' }}>3</b>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <b style={{ width: '46px', color: 'var(--team-us)' }}>3</b>
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span className="m-muted" style={{ fontSize: '11px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '5px', alignItems: 'center' }}>
                <img src={OBJECTIVE_ICON.dragon} alt="Infernal" width="14" height="14" style={{ borderRadius: '7px', objectFit: 'cover', flex: 'none' }} />
                Dragons
              </span>
              <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', gap: '2px' }}>
                <span style={{ width: '75%', background: 'var(--team-us)' }} />
                <span style={{ flex: '1', background: 'var(--team-them)' }} />
              </div>
            </div>
            <b style={{ width: '46px', textAlign: 'right', color: 'var(--team-them)' }}>1</b>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <b style={{ width: '46px', color: 'var(--team-us)' }}>1</b>
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span className="m-muted" style={{ fontSize: '11px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '5px', alignItems: 'center' }}>
                <img src={OBJECTIVE_ICON.nashor} alt="Baron" width="14" height="14" style={{ borderRadius: '7px', objectFit: 'cover', flex: 'none' }} />
                Barons
              </span>
              <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', gap: '2px' }}>
                <span style={{ width: '100%', background: 'var(--team-us)' }} />
                <span style={{ flex: '1', background: 'var(--team-them)' }} />
              </div>
            </div>
            <b style={{ width: '46px', textAlign: 'right', color: 'var(--team-them)' }}>0</b>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <b style={{ width: '46px', color: 'var(--team-us)' }}>4</b>
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span className="m-muted" style={{ fontSize: '11px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '5px', alignItems: 'center' }}>
                <img src={OBJECTIVE_ICON.larves} alt="Grub" width="14" height="14" style={{ borderRadius: '7px', objectFit: 'cover', flex: 'none' }} />
                Larves
              </span>
              <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', gap: '2px' }}>
                <span style={{ width: '67%', background: 'var(--team-us)' }} />
                <span style={{ flex: '1', background: 'var(--team-them)' }} />
              </div>
            </div>
            <b style={{ width: '46px', textAlign: 'right', color: 'var(--team-them)' }}>2</b>
          </div>
        </div>
        {' '}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', whiteSpace: 'nowrap' }}>
          <button type="button" className="m-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7 5l12 7-12 7z" />
            </svg>
            {' Revoir les temps forts'}
          </button>
          <a href="#accueil" className="m-cta" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{'Retour à l\'accueil'}</a>
        </div>
      </section>
      {' '}
      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <section className="m-card" style={{ flex: '3 1 620px', minWidth: '0', padding: '10px 14px', overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
            <img src={asset('logos/karmine-corp-f3aa9bbd.png')} alt="" width="18" height="18" style={{ objectFit: 'contain', flex: 'none' }} />
            <strong style={{ fontSize: '13px' }}>Karmine Corp</strong>
            <span className="m-muted" style={{ fontSize: '12px' }}>· 18 kills · 64,2k or</span>
          </div>
          {' '}
          <table className="m-sb" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th />
                <th>Joueur</th>
                <th>K/D/A</th>
                <th>CS/min</th>
                <th>Dégâts</th>
                <th>Objets</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{  }}>
                <td>
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
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src={asset('champions/Renekton.png')} alt="Renekton" width="34" height="34" style={{ borderRadius: '8px', objectFit: 'cover', flex: 'none', border: '2px solid var(--team-us)' }} />
                    <img src={asset('photos/canna-7577c239.jpg')} alt="" width="30" height="30" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ fontSize: '13px' }}>{'Canna '}</strong>
                      <span className="m-muted" style={{ fontSize: '11px' }}>Renekton</span>
                    </div>
                  </div>
                </td>
                <td>
                  <b>2</b>
                  {' / '}
                  <span style={{ color: 'inherit' }}>2</span>
                  {' / 7'}
                </td>
                <td>8,1</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '120px' }}>
                    <span style={{ flex: '1' }}>
                      <span style={{ display: 'block', width: '100%', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
                        <span style={{ display: 'block', height: '100%', width: '52.01465201465201%', background: 'var(--team-us)' }} />
                      </span>
                    </span>
                    <span style={{ fontSize: '12px' }}>14,2k</span>
                  </div>
                </td>
                <td>
                  <span style={{ display: 'flex', gap: '2px' }}>
                    <img src="https://ddragon.leagueoflegends.com/cdn/16.1.1/img/item/3078.png" alt="i3078" width="22" height="22" style={{ borderRadius: '4px', objectFit: 'cover', flex: 'none' }} />
                    <img src="https://ddragon.leagueoflegends.com/cdn/16.1.1/img/item/3047.png" alt="i3047" width="22" height="22" style={{ borderRadius: '4px', objectFit: 'cover', flex: 'none' }} />
                    <img src="https://ddragon.leagueoflegends.com/cdn/16.1.1/img/item/6672.png" alt="i6672" width="22" height="22" style={{ borderRadius: '4px', objectFit: 'cover', flex: 'none' }} />
                  </span>
                </td>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '24px', borderRadius: '6px', background: 'color-mix(in srgb, var(--accent-gold) 15%, transparent)', color: 'var(--accent-gold)', fontWeight: '800', fontSize: '13px' }}>7,0</span>
                </td>
              </tr>
              <tr style={{  }}>
                <td>
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
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src={asset('champions/XinZhao.png')} alt="XinZhao" width="34" height="34" style={{ borderRadius: '8px', objectFit: 'cover', flex: 'none', border: '2px solid var(--team-us)' }} />
                    <img src={asset('photos/yike-4203fc46.jpg')} alt="" width="30" height="30" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ fontSize: '13px' }}>{'Yike '}</strong>
                      <span className="m-muted" style={{ fontSize: '11px' }}>Xin Zhao</span>
                    </div>
                  </div>
                </td>
                <td>
                  <b>4</b>
                  {' / '}
                  <span style={{ color: 'inherit' }}>2</span>
                  {' / 9'}
                </td>
                <td>5,6</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '120px' }}>
                    <span style={{ flex: '1' }}>
                      <span style={{ display: 'block', width: '100%', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
                        <span style={{ display: 'block', height: '100%', width: '43.223443223443226%', background: 'var(--team-us)' }} />
                      </span>
                    </span>
                    <span style={{ fontSize: '12px' }}>11,8k</span>
                  </div>
                </td>
                <td>
                  <span style={{ display: 'flex', gap: '2px' }}>
                    <img src="https://ddragon.leagueoflegends.com/cdn/16.1.1/img/item/3078.png" alt="i3078" width="22" height="22" style={{ borderRadius: '4px', objectFit: 'cover', flex: 'none' }} />
                    <img src="https://ddragon.leagueoflegends.com/cdn/16.1.1/img/item/3111.png" alt="i3111" width="22" height="22" style={{ borderRadius: '4px', objectFit: 'cover', flex: 'none' }} />
                    <img src="https://ddragon.leagueoflegends.com/cdn/16.1.1/img/item/3068.png" alt="i3068" width="22" height="22" style={{ borderRadius: '4px', objectFit: 'cover', flex: 'none' }} />
                  </span>
                </td>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '24px', borderRadius: '6px', background: 'color-mix(in srgb, var(--team-us) 15%, transparent)', color: 'var(--team-us)', fontWeight: '800', fontSize: '13px' }}>7,6</span>
                </td>
              </tr>
              <tr style={{  }}>
                <td>
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
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src={asset('champions/Orianna.png')} alt="Orianna" width="34" height="34" style={{ borderRadius: '8px', objectFit: 'cover', flex: 'none', border: '2px solid var(--team-us)' }} />
                    <img src={asset('photos/kyeahoo-308e48bf.jpg')} alt="" width="30" height="30" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ fontSize: '13px' }}>{'kyeahoo '}</strong>
                      <span className="m-muted" style={{ fontSize: '11px' }}>Orianna</span>
                    </div>
                  </div>
                </td>
                <td>
                  <b>3</b>
                  {' / '}
                  <span style={{ color: 'inherit' }}>1</span>
                  {' / 10'}
                </td>
                <td>9,0</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '120px' }}>
                    <span style={{ flex: '1' }}>
                      <span style={{ display: 'block', width: '100%', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
                        <span style={{ display: 'block', height: '100%', width: '78.75457875457876%', background: 'var(--team-us)' }} />
                      </span>
                    </span>
                    <span style={{ fontSize: '12px' }}>21,5k</span>
                  </div>
                </td>
                <td>
                  <span style={{ display: 'flex', gap: '2px' }}>
                    <img src="https://ddragon.leagueoflegends.com/cdn/16.1.1/img/item/6655.png" alt="i6655" width="22" height="22" style={{ borderRadius: '4px', objectFit: 'cover', flex: 'none' }} />
                    <img src="https://ddragon.leagueoflegends.com/cdn/16.1.1/img/item/3020.png" alt="i3020" width="22" height="22" style={{ borderRadius: '4px', objectFit: 'cover', flex: 'none' }} />
                    <img src="https://ddragon.leagueoflegends.com/cdn/16.1.1/img/item/3190.png" alt="i3190" width="22" height="22" style={{ borderRadius: '4px', objectFit: 'cover', flex: 'none' }} />
                  </span>
                </td>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '24px', borderRadius: '6px', background: 'color-mix(in srgb, var(--team-us) 15%, transparent)', color: 'var(--team-us)', fontWeight: '800', fontSize: '13px' }}>7,9</span>
                </td>
              </tr>
              <tr style={{ background: 'color-mix(in srgb, var(--accent-gold) 7%, transparent)' }}>
                <td>
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
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src={asset('champions/Varus.png')} alt="Varus" width="34" height="34" style={{ borderRadius: '8px', objectFit: 'cover', flex: 'none', border: '2px solid var(--team-us)' }} />
                    <img src={asset('photos/caliste-e2af2b77.jpeg')} alt="" width="30" height="30" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ fontSize: '13px' }}>
                        {'Caliste '}
                        <span className="m-pulse" style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '.06em', color: 'var(--bg-page)', background: 'var(--accent-gold)', borderRadius: '4px', padding: '2px 6px', whiteSpace: 'nowrap' }}>MVP</span>
                      </strong>
                      <span className="m-muted" style={{ fontSize: '11px' }}>Varus</span>
                    </div>
                  </div>
                </td>
                <td>
                  <b>8</b>
                  {' / '}
                  <span style={{ color: 'inherit' }}>1</span>
                  {' / 6'}
                </td>
                <td>9,8</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '120px' }}>
                    <span style={{ flex: '1' }}>
                      <span style={{ display: 'block', width: '100%', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
                        <span style={{ display: 'block', height: '100%', width: '100.0%', background: 'var(--team-us)' }} />
                      </span>
                    </span>
                    <span style={{ fontSize: '12px' }}>27,3k</span>
                  </div>
                </td>
                <td>
                  <span style={{ display: 'flex', gap: '2px' }}>
                    <img src="https://ddragon.leagueoflegends.com/cdn/16.1.1/img/item/3124.png" alt="i3124" width="22" height="22" style={{ borderRadius: '4px', objectFit: 'cover', flex: 'none' }} />
                    <img src="https://ddragon.leagueoflegends.com/cdn/16.1.1/img/item/3006.png" alt="i3006" width="22" height="22" style={{ borderRadius: '4px', objectFit: 'cover', flex: 'none' }} />
                    <img src="https://ddragon.leagueoflegends.com/cdn/16.1.1/img/item/3153.png" alt="i3153" width="22" height="22" style={{ borderRadius: '4px', objectFit: 'cover', flex: 'none' }} />
                    <img src="https://ddragon.leagueoflegends.com/cdn/16.1.1/img/item/6672.png" alt="i6672" width="22" height="22" style={{ borderRadius: '4px', objectFit: 'cover', flex: 'none' }} />
                  </span>
                </td>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '24px', borderRadius: '6px', background: 'color-mix(in srgb, var(--team-us) 15%, transparent)', color: 'var(--team-us)', fontWeight: '800', fontSize: '13px' }}>8,7</span>
                </td>
              </tr>
              <tr style={{  }}>
                <td>
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
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src={asset('champions/Rakan.png')} alt="Rakan" width="34" height="34" style={{ borderRadius: '8px', objectFit: 'cover', flex: 'none', border: '2px solid var(--team-us)' }} />
                    <img src={asset('photos/busio-3e722c8e.jpg')} alt="" width="30" height="30" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ fontSize: '13px' }}>{'Busio '}</strong>
                      <span className="m-muted" style={{ fontSize: '11px' }}>Rakan</span>
                    </div>
                  </div>
                </td>
                <td>
                  <b>1</b>
                  {' / '}
                  <span style={{ color: 'var(--team-them)' }}>3</span>
                  {' / 14'}
                </td>
                <td>1,1</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '120px' }}>
                    <span style={{ flex: '1' }}>
                      <span style={{ display: 'block', width: '100%', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
                        <span style={{ display: 'block', height: '100%', width: '17.94871794871795%', background: 'var(--team-us)' }} />
                      </span>
                    </span>
                    <span style={{ fontSize: '12px' }}>4,9k</span>
                  </div>
                </td>
                <td>
                  <span style={{ display: 'flex', gap: '2px' }}>
                    <img src="https://ddragon.leagueoflegends.com/cdn/16.1.1/img/item/3190.png" alt="i3190" width="22" height="22" style={{ borderRadius: '4px', objectFit: 'cover', flex: 'none' }} />
                    <img src="https://ddragon.leagueoflegends.com/cdn/16.1.1/img/item/3158.png" alt="i3158" width="22" height="22" style={{ borderRadius: '4px', objectFit: 'cover', flex: 'none' }} />
                  </span>
                </td>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '24px', borderRadius: '6px', background: 'color-mix(in srgb, var(--accent-gold) 15%, transparent)', color: 'var(--accent-gold)', fontWeight: '800', fontSize: '13px' }}>7,3</span>
                </td>
              </tr>
              <tr>
                <td colSpan={7} style={{ paddingTop: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src={asset('logos/g2-esports-7d6673d3.png')} alt="" width="18" height="18" style={{ objectFit: 'contain', flex: 'none' }} />
                    <strong style={{ fontSize: '13px' }}>G2 Esports</strong>
                    <span className="m-muted" style={{ fontSize: '12px' }}>· 9 kills · 57,4k or</span>
                  </div>
                </td>
              </tr>
              <tr style={{  }}>
                <td>
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
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src={asset('champions/Gnar.png')} alt="Gnar" width="34" height="34" style={{ borderRadius: '8px', objectFit: 'cover', flex: 'none', border: '2px solid var(--team-them)' }} />
                    <img src={asset('photos/brokenblade-84bff3a3.jpg')} alt="" width="30" height="30" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ fontSize: '13px' }}>{'BrokenBlade '}</strong>
                      <span className="m-muted" style={{ fontSize: '11px' }}>Gnar</span>
                    </div>
                  </div>
                </td>
                <td>
                  <b>2</b>
                  {' / '}
                  <span style={{ color: 'var(--team-them)' }}>4</span>
                  {' / 3'}
                </td>
                <td>7,8</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '120px' }}>
                    <span style={{ flex: '1' }}>
                      <span style={{ display: 'block', width: '100%', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
                        <span style={{ display: 'block', height: '100%', width: '55.31135531135531%', background: 'var(--team-them)' }} />
                      </span>
                    </span>
                    <span style={{ fontSize: '12px' }}>15,1k</span>
                  </div>
                </td>
                <td>
                  <span style={{ display: 'flex', gap: '2px' }}>
                    <img src="https://ddragon.leagueoflegends.com/cdn/16.1.1/img/item/3047.png" alt="i3047" width="22" height="22" style={{ borderRadius: '4px', objectFit: 'cover', flex: 'none' }} />
                    <img src="https://ddragon.leagueoflegends.com/cdn/16.1.1/img/item/3068.png" alt="i3068" width="22" height="22" style={{ borderRadius: '4px', objectFit: 'cover', flex: 'none' }} />
                  </span>
                </td>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '24px', borderRadius: '6px', background: 'color-mix(in srgb, var(--team-them) 15%, transparent)', color: 'var(--team-them)', fontWeight: '800', fontSize: '13px' }}>6,4</span>
                </td>
              </tr>
              <tr style={{  }}>
                <td>
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
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src={asset('champions/Sejuani.png')} alt="Sejuani" width="34" height="34" style={{ borderRadius: '8px', objectFit: 'cover', flex: 'none', border: '2px solid var(--team-them)' }} />
                    <img src={asset('photos/skewmond-ab15060e.jpg')} alt="" width="30" height="30" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ fontSize: '13px' }}>{'SkewMond '}</strong>
                      <span className="m-muted" style={{ fontSize: '11px' }}>Sejuani</span>
                    </div>
                  </div>
                </td>
                <td>
                  <b>1</b>
                  {' / '}
                  <span style={{ color: 'var(--team-them)' }}>4</span>
                  {' / 5'}
                </td>
                <td>5,2</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '120px' }}>
                    <span style={{ flex: '1' }}>
                      <span style={{ display: 'block', width: '100%', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
                        <span style={{ display: 'block', height: '100%', width: '30.76923076923077%', background: 'var(--team-them)' }} />
                      </span>
                    </span>
                    <span style={{ fontSize: '12px' }}>8,4k</span>
                  </div>
                </td>
                <td>
                  <span style={{ display: 'flex', gap: '2px' }}>
                    <img src="https://ddragon.leagueoflegends.com/cdn/16.1.1/img/item/3068.png" alt="i3068" width="22" height="22" style={{ borderRadius: '4px', objectFit: 'cover', flex: 'none' }} />
                    <img src="https://ddragon.leagueoflegends.com/cdn/16.1.1/img/item/3111.png" alt="i3111" width="22" height="22" style={{ borderRadius: '4px', objectFit: 'cover', flex: 'none' }} />
                  </span>
                </td>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '24px', borderRadius: '6px', background: 'color-mix(in srgb, var(--team-them) 15%, transparent)', color: 'var(--team-them)', fontWeight: '800', fontSize: '13px' }}>6,1</span>
                </td>
              </tr>
              <tr style={{  }}>
                <td>
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
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src={asset('champions/Syndra.png')} alt="Syndra" width="34" height="34" style={{ borderRadius: '8px', objectFit: 'cover', flex: 'none', border: '2px solid var(--team-them)' }} />
                    <img src={asset('photos/caps-55dd587c.jpg')} alt="" width="30" height="30" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ fontSize: '13px' }}>{'Caps '}</strong>
                      <span className="m-muted" style={{ fontSize: '11px' }}>Syndra</span>
                    </div>
                  </div>
                </td>
                <td>
                  <b>3</b>
                  {' / '}
                  <span style={{ color: 'var(--team-them)' }}>3</span>
                  {' / 4'}
                </td>
                <td>8,7</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '120px' }}>
                    <span style={{ flex: '1' }}>
                      <span style={{ display: 'block', width: '100%', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
                        <span style={{ display: 'block', height: '100%', width: '69.59706959706959%', background: 'var(--team-them)' }} />
                      </span>
                    </span>
                    <span style={{ fontSize: '12px' }}>19,0k</span>
                  </div>
                </td>
                <td>
                  <span style={{ display: 'flex', gap: '2px' }}>
                    <img src="https://ddragon.leagueoflegends.com/cdn/16.1.1/img/item/6655.png" alt="i6655" width="22" height="22" style={{ borderRadius: '4px', objectFit: 'cover', flex: 'none' }} />
                    <img src="https://ddragon.leagueoflegends.com/cdn/16.1.1/img/item/3020.png" alt="i3020" width="22" height="22" style={{ borderRadius: '4px', objectFit: 'cover', flex: 'none' }} />
                  </span>
                </td>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '24px', borderRadius: '6px', background: 'color-mix(in srgb, var(--accent-gold) 15%, transparent)', color: 'var(--accent-gold)', fontWeight: '800', fontSize: '13px' }}>6,8</span>
                </td>
              </tr>
              <tr style={{  }}>
                <td>
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
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src={asset('champions/Ezreal.png')} alt="Ezreal" width="34" height="34" style={{ borderRadius: '8px', objectFit: 'cover', flex: 'none', border: '2px solid var(--team-them)' }} />
                    <img src={asset('photos/hans-sama-c62a5235.jpg')} alt="" width="30" height="30" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ fontSize: '13px' }}>{'Hans Sama '}</strong>
                      <span className="m-muted" style={{ fontSize: '11px' }}>Ezreal</span>
                    </div>
                  </div>
                </td>
                <td>
                  <b>3</b>
                  {' / '}
                  <span style={{ color: 'var(--team-them)' }}>3</span>
                  {' / 3'}
                </td>
                <td>9,1</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '120px' }}>
                    <span style={{ flex: '1' }}>
                      <span style={{ display: 'block', width: '100%', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
                        <span style={{ display: 'block', height: '100%', width: '66.66666666666666%', background: 'var(--team-them)' }} />
                      </span>
                    </span>
                    <span style={{ fontSize: '12px' }}>18,2k</span>
                  </div>
                </td>
                <td>
                  <span style={{ display: 'flex', gap: '2px' }}>
                    <img src="https://ddragon.leagueoflegends.com/cdn/16.1.1/img/item/3042.png" alt="i3042" width="22" height="22" style={{ borderRadius: '4px', objectFit: 'cover', flex: 'none' }} />
                    <img src="https://ddragon.leagueoflegends.com/cdn/16.1.1/img/item/3158.png" alt="i3158" width="22" height="22" style={{ borderRadius: '4px', objectFit: 'cover', flex: 'none' }} />
                  </span>
                </td>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '24px', borderRadius: '6px', background: 'color-mix(in srgb, var(--accent-gold) 15%, transparent)', color: 'var(--accent-gold)', fontWeight: '800', fontSize: '13px' }}>6,6</span>
                </td>
              </tr>
              <tr style={{  }}>
                <td>
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
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src={asset('champions/Braum.png')} alt="Braum" width="34" height="34" style={{ borderRadius: '8px', objectFit: 'cover', flex: 'none', border: '2px solid var(--team-them)' }} />
                    <img src={asset('photos/labrov-bb6ac576.jpg')} alt="" width="30" height="30" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--border)', flex: 'none' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ fontSize: '13px' }}>{'Labrov '}</strong>
                      <span className="m-muted" style={{ fontSize: '11px' }}>Braum</span>
                    </div>
                  </div>
                </td>
                <td>
                  <b>0</b>
                  {' / '}
                  <span style={{ color: 'var(--team-them)' }}>4</span>
                  {' / 6'}
                </td>
                <td>1,0</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '120px' }}>
                    <span style={{ flex: '1' }}>
                      <span style={{ display: 'block', width: '100%', height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
                        <span style={{ display: 'block', height: '100%', width: '13.553113553113553%', background: 'var(--team-them)' }} />
                      </span>
                    </span>
                    <span style={{ fontSize: '12px' }}>3,7k</span>
                  </div>
                </td>
                <td>
                  <span style={{ display: 'flex', gap: '2px' }}>
                    <img src="https://ddragon.leagueoflegends.com/cdn/16.1.1/img/item/3190.png" alt="i3190" width="22" height="22" style={{ borderRadius: '4px', objectFit: 'cover', flex: 'none' }} />
                    <img src="https://ddragon.leagueoflegends.com/cdn/16.1.1/img/item/3047.png" alt="i3047" width="22" height="22" style={{ borderRadius: '4px', objectFit: 'cover', flex: 'none' }} />
                  </span>
                </td>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '24px', borderRadius: '6px', background: 'color-mix(in srgb, var(--team-them) 15%, transparent)', color: 'var(--team-them)', fontWeight: '800', fontSize: '13px' }}>6,2</span>
                </td>
              </tr>
            </tbody>
          </table>
        </section>
        {' '}
        <section className="m-card" style={{ flex: '1 1 250px', minWidth: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center', background: 'linear-gradient(180deg,color-mix(in srgb, var(--accent-gold) 13%, transparent),var(--bg-card) 60%)', border: '1px solid color-mix(in srgb, var(--accent-gold) 40%, transparent)' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '.14em', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M8 4h8v5a4 4 0 01-8 0z" />
              <path d="M8 6H5a3 3 0 003 4M16 6h3a3 3 0 01-3 4M12 13v4M8 20h8" />
            </svg>
            {' MVP DU MATCH'}
          </span>
          {' '}
          <div style={{ position: 'relative' }}>
            <img src={asset('photos/caliste-e2af2b77.jpeg')} alt="" width="110" height="110" style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--bg-active)', border: '2px solid var(--accent-gold)', flex: 'none' }} />
            <span style={{ position: 'absolute', right: '-6px', bottom: '-2px' }}>
              <img src={asset('champions/Varus.png')} alt="Varus" width="44" height="44" style={{ borderRadius: '22px', objectFit: 'cover', flex: 'none', border: '2px solid var(--accent-gold)' }} />
            </span>
          </div>
          {' '}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '22px', fontWeight: '700' }}>
            <Flag code="FR" width={20} />
            {' Caliste'}
          </div>
          {' '}
          <span className="m-muted" style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
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
            ADC · Varus
          </span>
          {' '}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '6px', width: '100%', marginTop: '4px' }}>
            <div style={{ background: 'var(--bg-bar)', borderRadius: '8px', padding: '8px 4px' }}>
              <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontWeight: '700', fontSize: '17px' }}>8/1/6</div>
              <div className="m-muted" style={{ fontSize: '10px' }}>K/D/A</div>
            </div>
            <div style={{ background: 'var(--bg-bar)', borderRadius: '8px', padding: '8px 4px' }}>
              <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontWeight: '700', fontSize: '17px' }}>9,8</div>
              <div className="m-muted" style={{ fontSize: '10px' }}>CS/min</div>
            </div>
            <div style={{ background: 'var(--bg-bar)', borderRadius: '8px', padding: '8px 4px' }}>
              <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontWeight: '700', fontSize: '17px' }}>27,3k</div>
              <div className="m-muted" style={{ fontSize: '10px' }}>Dégâts</div>
            </div>
          </div>
          {' '}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 9px', borderRadius: '999px', fontSize: '12px', fontWeight: '600', border: '1px solid var(--team-them)', color: 'var(--team-them)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
              </svg>
              Double kill 16:24
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 9px', borderRadius: '999px', fontSize: '12px', fontWeight: '600', border: '1px solid var(--team-us)', color: 'var(--team-us)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3c1 4 5 5 5 10a5 5 0 01-10 0c0-3 2-4 2-7 1.5 1 3 2.5 3-3z" />
              </svg>
              38 % des dégâts
            </span>
          </div>
          {' '}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '24px', borderRadius: '6px', background: 'color-mix(in srgb, var(--team-us) 15%, transparent)', color: 'var(--team-us)', fontWeight: '800', fontSize: '13px' }}>8,7</span>
            <span className="m-muted" style={{ fontSize: '12px' }}>Meilleure note de la semaine</span>
          </div>
        </section>
      </div>
      {' '}
      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <section className="m-card" style={{ flex: '3 1 520px', minWidth: '0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="m-h2" style={{ margin: '0' }}>Moments clés</h2>
            <span className="m-muted" style={{ fontSize: '11px' }}>
              {'Écart d\'or · '}
              <span style={{ color: 'var(--team-us)' }}>KC</span>
              {' / '}
              <span style={{ color: 'var(--team-them)' }}>G2</span>
            </span>
          </div>
          <div style={{ position: 'relative', paddingTop: '20px' }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '36.6%', top: '-4px', transform: 'translateX(-50%)' }}>
                <img src={asset('champions/XinZhao.png')} alt="XinZhao" width="24" height="24" style={{ borderRadius: '12px', objectFit: 'cover', flex: 'none', border: '2px solid var(--team-us)' }} />
              </span>
              <span style={{ position: 'absolute', left: '59.1%', top: '-4px', transform: 'translateX(-50%)' }}>
                <img src={asset('champions/Varus.png')} alt="Varus" width="24" height="24" style={{ borderRadius: '12px', objectFit: 'cover', flex: 'none', border: '2px solid var(--team-us)' }} />
              </span>
              <span style={{ position: 'absolute', left: '81.9%', top: '-4px', transform: 'translateX(-50%)' }}>
                <img src={OBJECTIVE_ICON.nashor} alt="Baron" width="24" height="24" style={{ borderRadius: '12px', objectFit: 'cover', flex: 'none', border: '2px solid var(--team-us)' }} />
              </span>
              <span style={{ position: 'absolute', left: '100.6%', top: '-4px', transform: 'translateX(-50%)' }}>
                <img src={asset('logos/karmine-corp-f3aa9bbd.png')} alt="" width="24" height="24" style={{ objectFit: 'contain', flex: 'none' }} />
              </span>
            </div>
            <svg viewBox="0 0 560 130" width="100%" height="130" preserveAspectRatio="none" role="img" aria-label="Écart d'or : KC en tête à partir de 6 min, +6 800 à la fin">
              <defs>
                <clipPath id="up">
                  <rect x="0" y="0" width="560" height="65.0" />
                </clipPath>
                <clipPath id="dn">
                  <rect x="0" y="65.0" width="560" height="65.0" />
                </clipPath>
              </defs>
              <line x1="0" y1="65.0" x2="560" y2="65.0" style={{ stroke: 'var(--border-strong)' }} />
              <line x1="205" y1="8" x2="205" y2="126" strokeDasharray="3 3" style={{ stroke: 'var(--border-strong)' }} />
              <line x1="331" y1="8" x2="331" y2="126" strokeDasharray="3 3" style={{ stroke: 'var(--border-strong)' }} />
              <line x1="458" y1="8" x2="458" y2="126" strokeDasharray="3 3" style={{ stroke: 'var(--border-strong)' }} />
              <line x1="564" y1="8" x2="564" y2="126" strokeDasharray="3 3" style={{ stroke: 'var(--border-strong)' }} />
              <polygon points="0,65.0 0.0,65.0 17.5,65.0 35.0,64.6 52.5,66.3 70.0,67.5 87.5,66.7 105.0,64.2 122.5,62.9 140.0,59.9 157.5,60.8 175.0,57.4 192.5,52.4 210.0,54.0 227.5,51.5 245.0,50.7 262.5,47.3 280.0,43.1 297.5,38.9 315.0,39.7 332.5,33.0 350.0,29.6 367.5,27.9 385.0,30.4 402.5,24.5 420.0,21.2 437.5,17.8 455.0,13.6 472.5,14.4 490.0,11.9 507.5,10.2 525.0,8.5 542.5,7.7 560.0,7.7 560,65.0" fillOpacity=".25" clipPath="url(#up)" style={{ fill: 'var(--team-us)' }} />
              <polygon points="0,65.0 0.0,65.0 17.5,65.0 35.0,64.6 52.5,66.3 70.0,67.5 87.5,66.7 105.0,64.2 122.5,62.9 140.0,59.9 157.5,60.8 175.0,57.4 192.5,52.4 210.0,54.0 227.5,51.5 245.0,50.7 262.5,47.3 280.0,43.1 297.5,38.9 315.0,39.7 332.5,33.0 350.0,29.6 367.5,27.9 385.0,30.4 402.5,24.5 420.0,21.2 437.5,17.8 455.0,13.6 472.5,14.4 490.0,11.9 507.5,10.2 525.0,8.5 542.5,7.7 560.0,7.7 560,65.0" fillOpacity=".3" clipPath="url(#dn)" style={{ fill: 'var(--team-them)' }} />
              <polyline points="0.0,65.0 17.5,65.0 35.0,64.6 52.5,66.3 70.0,67.5 87.5,66.7 105.0,64.2 122.5,62.9 140.0,59.9 157.5,60.8 175.0,57.4 192.5,52.4 210.0,54.0 227.5,51.5 245.0,50.7 262.5,47.3 280.0,43.1 297.5,38.9 315.0,39.7 332.5,33.0 350.0,29.6 367.5,27.9 385.0,30.4 402.5,24.5 420.0,21.2 437.5,17.8 455.0,13.6 472.5,14.4 490.0,11.9 507.5,10.2 525.0,8.5 542.5,7.7 560.0,7.7" fill="none" strokeWidth="2.2" strokeLinejoin="round" style={{ stroke: 'var(--team-us)' }} />
            </svg>
            {' '}
            <div className="m-muted" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
              <span>0 min</span>
              <span>10</span>
              <span>20</span>
              <span>32 min</span>
            </div>
          </div>
          <div style={{ marginTop: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', padding: '5px 0' }}>
              <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontWeight: '700', color: 'var(--team-us)', width: '44px' }}>11:42</span>
              <img src={asset('champions/XinZhao.png')} alt="XinZhao" width="22" height="22" style={{ borderRadius: '11px', objectFit: 'cover', flex: 'none' }} />
              <span>Gank top de Yike, premier sang</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', padding: '5px 0' }}>
              <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontWeight: '700', color: 'var(--team-us)', width: '44px' }}>18:54</span>
              <img src={asset('champions/Varus.png')} alt="Varus" width="22" height="22" style={{ borderRadius: '11px', objectFit: 'cover', flex: 'none' }} />
              <span>Combat au 3e dragon gagné 4 pour 1</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', padding: '5px 0' }}>
              <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontWeight: '700', color: 'var(--team-us)', width: '44px' }}>26:12</span>
              <img src={OBJECTIVE_ICON.nashor} alt="Baron" width="22" height="22" style={{ borderRadius: '11px', objectFit: 'cover', flex: 'none' }} />
              <span>Baron sécurisé par kyeahoo</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', padding: '5px 0' }}>
              <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontWeight: '700', color: 'var(--team-us)', width: '44px' }}>32:12</span>
              <img src={asset('logos/karmine-corp-f3aa9bbd.png')} alt="" width="22" height="22" style={{ objectFit: 'contain', flex: 'none' }} />
              <span>Nexus détruit</span>
            </div>
          </div>
          {' '}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '8px', padding: '10px 12px', borderRadius: '8px', background: 'var(--bg-bar)' }}>
            <span style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--bg-active)', color: 'var(--accent-gold)', fontSize: '10px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>HC</span>
            <p style={{ margin: '0', fontSize: '13px', lineHeight: '1.45' }}>« Le plan autour du bot a marché. Nos débuts de partie restent lents : 2 tours perdues avant 14 min. À travailler en scrim cette semaine. »</p>
          </div>
        </section>
        {' '}
        <div style={{ flex: '1 1 280px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <section className="m-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h2 className="m-h2" style={{ margin: '0' }}>Conséquences</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <span style={{ flex: '1' }}>{'Moral de l\'équipe'}</span>
              <span style={{ width: '90px' }}>
                <span style={{ display: 'block', width: '100%', height: '5px', borderRadius: '2px', background: 'var(--border)', overflow: 'hidden' }}>
                  <span style={{ display: 'block', height: '100%', width: '82%', background: 'var(--team-us)' }} />
                </span>
              </span>
              <b style={{ color: 'var(--team-us)', display: 'flex', alignItems: 'center', gap: '3px', width: '96px', justifyContent: 'flex-end' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 15l6-6 6 6" />
                </svg>
                En hausse
              </b>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <span style={{ flex: '1' }}>Fans</span>
              <span style={{ width: '90px' }}>
                <span style={{ display: 'block', width: '100%', height: '5px', borderRadius: '2px', background: 'var(--border)', overflow: 'hidden' }}>
                  <span style={{ display: 'block', height: '100%', width: '64%', background: 'var(--team-us)' }} />
                </span>
              </span>
              <b style={{ color: 'var(--team-us)', display: 'flex', alignItems: 'center', gap: '3px', width: '96px', justifyContent: 'flex-end' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 15l6-6 6 6" />
                </svg>
                +2 %
              </b>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <span style={{ flex: '1' }}>Direction</span>
              <span style={{ width: '90px' }}>
                <span style={{ display: 'block', width: '100%', height: '5px', borderRadius: '2px', background: 'var(--border)', overflow: 'hidden' }}>
                  <span style={{ display: 'block', height: '100%', width: '75%', background: 'var(--team-us)' }} />
                </span>
              </span>
              <b style={{ color: 'var(--team-us)', display: 'flex', alignItems: 'center', gap: '3px', width: '96px', justifyContent: 'flex-end' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 15l6-6 6 6" />
                </svg>
                Satisfaite
              </b>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <span style={{ flex: '1' }}>Valeur de Caliste</span>
              <span style={{ width: '90px' }}>
                <span style={{ display: 'block', width: '100%', height: '5px', borderRadius: '2px', background: 'var(--border)', overflow: 'hidden' }}>
                  <span style={{ display: 'block', height: '100%', width: '88%', background: 'var(--team-us)' }} />
                </span>
              </span>
              <b style={{ color: 'var(--team-us)', display: 'flex', alignItems: 'center', gap: '3px', width: '96px', justifyContent: 'flex-end' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 15l6-6 6 6" />
                </svg>
                +150 k€
              </b>
            </div>
          </section>
          {' '}
          <section className="m-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <h2 className="m-h2" style={{ margin: '0' }}>Classement LEC</h2>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 9px', borderRadius: '999px', fontSize: '12px', fontWeight: '600', border: '1px solid var(--team-us)', color: 'var(--team-us)' }}>3e ▲ 4</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', padding: '4px 6px', borderRadius: '6px' }}>
              <span className="m-muted" style={{ width: '16px' }}>1</span>
              <img src={asset('logos/movistar-koi-4acc4065.png')} alt="" width="20" height="20" style={{ objectFit: 'contain', flex: 'none' }} />
              <span style={{ flex: '1' }}>MKOI</span>
              <span>1 – 0</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', padding: '4px 6px', borderRadius: '6px' }}>
              <span className="m-muted" style={{ width: '16px' }}>2</span>
              <img src={asset('logos/fnatic-78f183fa.png')} alt="" width="20" height="20" style={{ objectFit: 'contain', flex: 'none' }} />
              <span style={{ flex: '1' }}>FNC</span>
              <span>1 – 0</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', padding: '4px 6px', borderRadius: '6px', background: 'var(--bg-active)', fontWeight: '700' }}>
              <span className="m-muted" style={{ width: '16px' }}>3</span>
              <img src={asset('logos/karmine-corp-f3aa9bbd.png')} alt="" width="20" height="20" style={{ objectFit: 'contain', flex: 'none' }} />
              <span style={{ flex: '1' }}>KC</span>
              <span>1 – 0</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', padding: '4px 6px', borderRadius: '6px' }}>
              <span className="m-muted" style={{ width: '16px' }}>4</span>
              <img src={asset('logos/team-vitality-e8d8ae99.png')} alt="" width="20" height="20" style={{ objectFit: 'contain', flex: 'none' }} />
              <span style={{ flex: '1' }}>VIT</span>
              <span>1 – 0</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', padding: '4px 6px', borderRadius: '6px' }}>
              <span className="m-muted" style={{ width: '16px' }}>7</span>
              <img src={asset('logos/g2-esports-7d6673d3.png')} alt="" width="20" height="20" style={{ objectFit: 'contain', flex: 'none' }} />
              <span style={{ flex: '1' }}>G2</span>
              <span>0 – 1</span>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
