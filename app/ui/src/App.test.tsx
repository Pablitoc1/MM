import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { App } from './App';

// Pixi ne tourne pas dans jsdom : la carte est remplacée par un cadre vide.
vi.mock('./match/MatchMap', () => ({ MatchMap: () => <div data-testid="match-map" /> }));
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
    fireEvent.click(screen.getByRole('button', { name: 'Effectif' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Effectif');
    expect(screen.getByText('Cet écran arrive au jalon M1.')).toBeInTheDocument();
  });

  it('ouvre le match en direct avec le score et les commandes de lecture', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Match en direct' }));
    expect(screen.getByTestId('match-map')).toBeInTheDocument();
    expect(screen.getByTestId('match-kills')).toHaveTextContent('0 – 0');
    for (const s of ['x1', 'x2', 'x4', 'x8', 'x16']) expect(screen.getByRole('button', { name: s })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Temps de jeu'), { target: { value: '1200' } });
    expect(screen.getByTestId('match-clock')).toHaveTextContent('20:00');
    expect(screen.getByTestId('match-kills')).toHaveTextContent('7 – 2');
  });
});
