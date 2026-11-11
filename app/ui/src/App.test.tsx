import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { App } from './App';

// Pixi ne tourne pas dans jsdom : la carte est remplacée par un cadre vide.
vi.mock('./match/MatchMap', () => ({ MatchMap: () => <div data-testid="match-map" /> }));
// Le moteur ne tourne pas dans les tests : le flux est le faux match scripté.
vi.mock('./api', async (original) => ({
  ...(await original<typeof import('./api')>()),
  simulateMatch: async () => (await import('./match/demoReplay')).buildDemoReplay(),
}));
import { NAV } from './nav';

describe('App', () => {
  it('affiche la barre du haut avec la date de début de saison', async () => {
    render(<App />);
    expect(await screen.findByTestId('game-date')).toHaveTextContent('Lun. 5 janvier 2026');
  });

  it('affiche toutes les entrées du menu latéral, Accueil actif', () => {
    render(<App />);
    const nav = screen.getByRole('navigation', { name: 'Menu principal' });
    for (const item of NAV) expect(nav).toHaveTextContent(item.label);
    expect(screen.getByRole('button', { name: 'Accueil' })).toHaveAttribute('aria-current', 'page');
  });

  it('change d\'écran au clic dans le menu', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Tactique' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Tactique');
    expect(screen.getByText('Cet écran arrive au jalon M7.')).toBeInTheDocument();
  });

  it('ouvre le match en direct avec le score et les commandes de lecture', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Match en direct' }));
    expect(await screen.findByTestId('match-map')).toBeInTheDocument();
    expect(screen.getByTestId('match-kills')).toHaveTextContent('0 – 0');
    // Plein écran, comme la maquette : plus de menu, une barre du match en haut.
    expect(screen.queryByRole('button', { name: 'Effectif' })).not.toBeInTheDocument();
    expect(screen.getByText(/LEC Versus · Semaine 1 · Bo1 · Sam\. 17 janvier 2026 · Patch 26\.1/)).toBeInTheDocument();
    for (const s of ['x1', 'x4', 'x16', 'Temps forts', 'Aller au résultat']) {
      expect(screen.getByRole('button', { name: s })).toBeInTheDocument();
    }
    fireEvent.change(screen.getByLabelText('Temps de jeu'), { target: { value: '1200' } });
    expect(screen.getByTestId('match-clock')).toHaveTextContent('20:00');
    expect(screen.getByTestId('match-kills')).toHaveTextContent('7 – 2');
    fireEvent.click(screen.getByRole('button', { name: 'Aller au résultat' }));
    expect(screen.getByText('Victoire KC')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Quitter le match' }));
    expect(screen.getByRole('button', { name: 'Effectif' })).toBeInTheDocument();
  });
});
