// Les écrans des maquettes v2, reproduits dans la vitrine. Les liens de la
// maquette (#accueil, #effectif…) passent d'un écran à l'autre.
import { useEffect, useState } from 'react';
import { assetUrl } from '../../api';
import { Shell, type NavKey } from '../../components/ui';
import { EcranAccueil } from './Accueil';
import { EcranEffectif } from './Effectif';
import { EcranEntrainement } from './Entrainement';
import { EcranJoueur } from './Joueur';

export type EcranId = 'accueil' | 'effectif' | 'joueur' | 'entrainement' | 'draft' | 'pause' | 'apres-match';

interface EcranDef { id: EcranId; label: string; nav?: NavKey; shell: boolean; after?: boolean; render: () => React.ReactNode }

export const ECRANS: EcranDef[] = [
  { id: 'accueil', label: 'Accueil', nav: 'accueil', shell: true, render: () => <EcranAccueil /> },
  { id: 'effectif', label: 'Effectif', nav: 'effectif', shell: true, render: () => <EcranEffectif /> },
  { id: 'joueur', label: 'Fiche joueur', nav: 'effectif', shell: true, render: () => <EcranJoueur /> },
  { id: 'entrainement', label: 'Entraînement', nav: 'entrainement', shell: true, render: () => <EcranEntrainement /> },
];

const HREFS: Partial<Record<NavKey, string>> = { accueil: '#accueil', effectif: '#effectif', entrainement: '#entrainement' };

function lireEcran(): EcranId | null {
  const id = window.location.hash.slice(1);
  return ECRANS.some((e) => e.id === id) ? (id as EcranId) : null;
}

export function useEcran(): EcranId | null {
  const [id, setId] = useState(lireEcran);
  useEffect(() => {
    const onHash = () => { setId(lireEcran()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return id;
}

export function Ecrans({ id }: { id: EcranId }) {
  const def = ECRANS.find((e) => e.id === id)!;
  if (!def.shell) return <div className="m-screen">{def.render()}</div>;
  // Barre du haut de la maquette : avant le match contre G2, ou juste après.
  const avant = !def.after;
  return (
    <Shell
      club={{ name: 'Karmine Corp', logo: assetUrl('logos/karmine-corp-f3aa9bbd.png') }}
      standing={avant ? 'LEC Versus · 1er (0 – 0)' : 'LEC Versus · 3e (1 – 0)'}
      date={avant ? 'Lun. 12 janvier 2026' : 'Sam. 17 janvier 2026'}
      next={avant
        ? { name: 'G2 Esports', logo: assetUrl('logos/g2-esports-7d6673d3.png'), date: 'sam. 17 janv.' }
        : { name: 'Movistar KOI', logo: assetUrl('logos/movistar-koi-4acc4065.png'), date: 'sam. 24 janv.' }}
      budget={'2,4 M€'}
      active={def.nav}
      badges={{ accueil: 3 }}
      hrefs={HREFS}
    >
      {def.render()}
    </Shell>
  );
}
