import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { App } from './App';
import { NAV } from './nav';

describe('App', () => {
  it('affiche la barre du haut avec la date de début de saison', async () => {
    render(<App />);
    expect(await screen.findByTestId('game-date')).toHaveTextContent('Lun. 5 janvier 2026');
  });

  it('affiche les 8 entrées du menu latéral, Accueil actif', () => {
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
});
