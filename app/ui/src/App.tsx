import { useEffect, useState } from 'react';
import { FALLBACK_WORLD, getWorldInfo, type WorldInfo } from './api';
import { SideNav } from './components/SideNav';
import { TopBar } from './components/TopBar';
import { NAV, type ScreenId } from './nav';
import { Home } from './screens/Home';
import { MatchLive } from './screens/MatchLive';
import { Placeholder } from './screens/Placeholder';
import { Player } from './screens/Player';
import { DEFAULT_TEAM, Squad } from './screens/Squad';
import { UpdateBanner } from './update/UpdateBanner';

export function App() {
  const [world, setWorld] = useState<WorldInfo>(FALLBACK_WORLD);
  const [screen, setScreen] = useState<ScreenId>('accueil');
  const [teamId, setTeamId] = useState(DEFAULT_TEAM);
  const [playerId, setPlayerId] = useState<string | null>(null);

  useEffect(() => {
    getWorldInfo().then(setWorld).catch((e) => console.error('world_info', e));
  }, []);

  const item = NAV.find((n) => n.id === screen) ?? NAV[0];

  // Le match en direct s'affiche en plein écran, sans menu (maquette v2).
  if (screen === 'match') return <MatchLive onExit={() => setScreen('accueil')} />;

  return (
    <div className="shell">
      <UpdateBanner />
      <TopBar world={world} />
      <div className="body">
        <SideNav active={screen} onSelect={(s) => { setScreen(s); setPlayerId(null); }} />
        <main className="main">
          {screen === 'accueil' && <Home world={world} />}
          {screen === 'effectif' && playerId === null && (
            <Squad teamId={teamId} onTeamChange={setTeamId} onOpenPlayer={setPlayerId} />
          )}
          {screen === 'effectif' && playerId !== null && <Player personId={playerId} onBack={() => setPlayerId(null)} />}
          {!['accueil', 'effectif', 'match'].includes(screen) && <Placeholder item={item} />}
        </main>
      </div>
    </div>
  );
}
