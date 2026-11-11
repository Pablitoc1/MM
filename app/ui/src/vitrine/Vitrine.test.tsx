import { afterEach, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { Vitrine } from './Vitrine';
import { Ecrans, ECRANS } from './ecrans';
import { Shell } from '../components/ui';

describe('Vitrine', () => {
  it('montre les quatre familles de composants', () => {
    render(<Vitrine />);
    for (const titre of ['Petits éléments', 'Jauges et barres', 'Blocs', 'Graphiques']) {
      expect(screen.getByRole('heading', { level: 2, name: titre })).toBeInTheDocument();
    }
    expect(screen.getAllByRole('row')).toHaveLength(6);
  });
});

describe('Écrans de la maquette', () => {
  afterEach(() => { window.location.hash = ''; });

  it.each(ECRANS.map((e) => [e.id]))('affiche l\'écran %s', (id) => {
    const { container } = render(<Ecrans id={id} />);
    expect(container.querySelector('.m-screen')).not.toBeNull();
    expect(container.querySelectorAll('img').length).toBeGreaterThan(3);
  });

  it('ouvre un écran depuis le lien de la vitrine', () => {
    window.location.hash = '#accueil';
    render(<Vitrine />);
    const menu = screen.getByRole('navigation', { name: 'Menu principal' });
    expect(within(menu).getByRole('link', { current: 'page' })).toHaveTextContent('Accueil');
    expect(screen.getByText('Boîte de réception')).toBeInTheDocument();
  });
});

describe('Shell', () => {
  it('montre le club, le prochain match, le budget et le menu', () => {
    render(
      <Shell club={{ name: 'Karmine Corp' }} standing="LEC Versus · 1er (0 – 0)" date="Lun. 12 janvier 2026"
        next={{ name: 'G2 Esports', date: 'sam. 17 janv.' }} budget="2,4 M€" active="entrainement" badges={{ accueil: 3 }}>
        <main>contenu</main>
      </Shell>,
    );
    expect(screen.getByText('G2 Esports')).toBeInTheDocument();
    expect(screen.getByText('2,4 M€', { exact: false })).toBeInTheDocument();
    expect(screen.getByRole('link', { current: 'page' })).toHaveTextContent('Entraînement');
    expect(screen.getByRole('link', { name: /Accueil/ })).toHaveTextContent('3');
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeInTheDocument();
  });
});
