import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import type { AttrScore, PlayerDetail } from '../api';
import { ATTR_GROUPS } from '../ratings';
import { Player } from './Player';

const KEYS = ATTR_GROUPS.flatMap((g) => g.keys);

function attrs(over: Partial<Record<string, Partial<AttrScore>>>): AttrScore[] {
  return KEYS.map((key) => ({ key, value: 14, low: 13.2, high: 14.8, estimated: false, ...over[key] }));
}

const CALISTE: PlayerDetail = {
  member: {
    personId: 'Caliste', handle: 'Caliste', realName: 'Caliste Henry-Hennebert', country: 'France',
    birthdate: '2006-08-28', role: 'Bot', isStaff: false, photoFile: null, contractEnd: '2028-11-20',
    stats2025: { games: 10, wins: 7, kills: 40, deaths: 10, assists: 50, csPerMin: 10.04, goldPerMin: 450, damagePerMin: 812 },
    topChampions: ['Varus'],
    rating: { level: 84.2, levelLow: 80.1, levelHigh: 88.3, potential: 93.6, games: 96, source: 'stats' },
  },
  teamId: 'Karmine Corp', leagueId: 'LEC', residency: 'EMEA', nativeName: null,
  attributes: attrs({
    mecanique: { value: 17.2, low: 16.4, high: 18 },
    shotcalling: { value: 9, low: 6, high: 12, estimated: true },
  }),
  tournaments: [{
    tournament: 'LEC 2025 Winter',
    stats: { games: 10, wins: 7, kills: 40, deaths: 10, assists: 50, csPerMin: 10.04, goldPerMin: 450, damagePerMin: 812 },
    visionPerMin: 0.92,
  }],
  champions: [{ champion: 'Varus', games: 6, wins: 5 }, { champion: 'Kaisa', games: 4, wins: 2 }],
};

beforeEach(() => {
  const preview = { leagues: [], teams: [], rosters: {}, players: { Caliste: CALISTE } };
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(preview))));
});
afterEach(() => vi.unstubAllGlobals());

describe('Fiche joueur', () => {
  it('affiche niveau, potentiel et profil', async () => {
    render(<Player personId="Caliste" onBack={() => {}} />);
    expect(await screen.findByRole('heading', { name: 'Caliste' })).toBeInTheDocument();
    expect(screen.getByText('84')).toBeInTheDocument();
    expect(screen.getByText('94')).toBeInTheDocument();
    expect(screen.getByText('France · 19 ans · Karmine Corp · Contrat : nov. 2028')).toBeInTheDocument();
    expect(screen.getByText('Mécanique')).toBeInTheDocument();
    expect(screen.getByText(/96 parties pro/)).toBeInTheDocument();
  });

  it('montre les 15 attributs, en fourchette quand ils sont estimés', async () => {
    render(<Player personId="Caliste" onBack={() => {}} />);
    await screen.findByRole('heading', { name: 'Caliste' });
    fireEvent.click(screen.getByRole('tab', { name: 'Attributs' }));
    expect(document.querySelectorAll('.attr')).toHaveLength(15);
    const shot = screen.getByText('Shotcalling').closest('.attr')!;
    expect(within(shot as HTMLElement).getByText('6-12')).toBeInTheDocument();
    expect(screen.getAllByText('estimé')).toHaveLength(1);
    expect(within(screen.getByText('Mécanique', { selector: '.attr__label' }).closest('.attr') as HTMLElement).getByText('17')).toBeInTheDocument();
  });

  it('liste champions et stats par tournoi', async () => {
    render(<Player personId="Caliste" onBack={() => {}} />);
    await screen.findByRole('heading', { name: 'Caliste' });
    fireEvent.click(screen.getByRole('tab', { name: 'Champions' }));
    expect(screen.getByText('6 parties · 83 %')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Statistiques' }));
    const row = screen.getByText('LEC 2025 Winter').closest('tr')!;
    expect(within(row).getByText('0,9')).toBeInTheDocument();
  });

  it('revient à l’effectif', async () => {
    const back = vi.fn();
    render(<Player personId="Caliste" onBack={back} />);
    fireEvent.click(screen.getByRole('button', { name: '← Effectif' }));
    expect(back).toHaveBeenCalled();
  });

  it('signale un joueur inconnu', async () => {
    render(<Player personId="Personne" onBack={() => {}} />);
    expect(await screen.findByText('Joueur introuvable.')).toBeInTheDocument();
  });
});
