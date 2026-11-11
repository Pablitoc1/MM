import { useEffect, useState } from 'react';
import { FALLBACK_WORLD, getWorldInfo, type WorldInfo } from './api';
import { SideNav } from './components/SideNav';
import { TopBar } from './components/TopBar';
import { NAV, type ScreenId } from './nav';
import { Home } from './screens/Home';
import { MatchLive } from './screens/MatchLive';
import { Placeholder } from './screens/Placeholder';
import { Squad } from './screens/Squad';

export function App() {
  const [world, setWorld] = useState<WorldInfo>(FALLBACK_WORLD);
  const [screen, setScreen] = useState<ScreenId>('accueil');

  useEffect(() => {
    getWorldInfo().then(setWorld).catch((e) => console.error('world_info', e));
  }, []);

  const item = NAV.find((n) => n.id === screen) ?? NAV[0];

  // Le match en direct s'affiche en plein écran, sans menu (maquette v2).
  if (screen === 'match') return <MatchLive onExit={() => setScreen('accueil')} />;

  return (
    <div className="shell">
      <TopBar world={world} />
      <div className="body">
        <SideNav active={screen} onSelect={setScreen} />
        <main className="main">
          {screen === 'accueil' && <Home world={world} />}
          {screen === 'effectif' && <Squad />}
          {!['accueil', 'effectif', 'match'].includes(screen) && <Placeholder item={item} />}
        </main>
      </div>
    </div>
  );
}
