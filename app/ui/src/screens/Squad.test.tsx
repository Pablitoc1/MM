import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import type { RosterMember } from '../api';
import { Squad } from './Squad';

function member(p: Partial<RosterMember> & Pick<RosterMember, 'handle' | 'role'>): RosterMember {
  return {
    personId: p.handle, realName: null, country: null, birthdate: null, isStaff: false,
    photoFile: null, contractEnd: null, stats2025: null, topChampions: [], rating: null, ...p,
  };
}

const PREVIEW = {
  leagues: [{ id: 'LEC', name: 'LoL EMEA Championship', region: 'EMEA', tier: 1, teamCount: 2 }],
  teams: [
    { id: 'Fnatic', short: 'FNC', leagueId: 'LEC', logoFile: null },
    { id: 'Karmine Corp', short: 'KC', leagueId: 'LEC', logoFile: 'logos/kc.webp' },
  ],
  rosters: {
    'Karmine Corp': [
      member({ handle: 'Canna', role: 'Top', country: 'South Korea', realName: 'Kim Chang-dong', birthdate: '2000-09-21', contractEnd: '2026-11-20' }),
      member({
        handle: 'Caliste', role: 'Bot', country: 'France', birthdate: '2006-08-28', contractEnd: '2028-11-20',
        topChampions: ['Varus', 'Kaisa'],
        rating: { level: 84.2, levelLow: 80.1, levelHigh: 88.3, potential: 93.6, games: 96, source: 'stats' },
        stats2025: { games: 10, wins: 7, kills: 40, deaths: 10, assists: 50, csPerMin: 10.04, goldPerMin: 450, damagePerMin: 812 },
      }),
      member({ handle: 'Reapered', role: 'Coach', isStaff: true }),
    ],
    Fnatic: [member({ handle: 'Oscarinin', role: 'Top' })],
  },
};

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(PREVIEW))));
});
afterEach(() => vi.unstubAllGlobals());

describe('Effectif', () => {
  it('affiche les joueurs du club par défaut avec leurs stats 2025', async () => {
    render(<Squad />);
    expect(await screen.findByText('Caliste')).toBeInTheDocument();
    const row = screen.getByText('Caliste').closest('tr')!;
    expect(within(row).getByText('70 %')).toBeInTheDocument();
    expect(within(row).getByText('9,0')).toBeInTheDocument(); // KDA (40 + 50) / 10
    expect(within(row).getByText('nov. 2028')).toBeInTheDocument();
    expect(within(row).getByAltText('Varus')).toBeInTheDocument();
    expect(screen.getByText('Corée du Sud · Kim Chang-dong')).toBeInTheDocument();
    expect(screen.queryByText('Reapered')).not.toBeInTheDocument();
  });

  it('compte les contrats qui finissent en 2026', async () => {
    render(<Squad />);
    await screen.findByText('Caliste');
    const kpi = screen.getByText('Contrats finissant en 2026').closest('.kpi')!;
    expect(kpi).toHaveTextContent('1');
  });

  it('montre le staff dans son onglet', async () => {
    render(<Squad />);
    await screen.findByText('Caliste');
    fireEvent.click(screen.getByRole('tab', { name: /Staff/ }));
    expect(screen.getByText('Reapered')).toBeInTheDocument();
  });

  it('montre le niveau et le potentiel, et ouvre la fiche au clic', async () => {
    const open = vi.fn();
    render(<Squad onOpenPlayer={open} />);
    await screen.findByText('Caliste');
    const row = screen.getByText('Caliste').closest('tr')!;
    expect(within(row).getByText('84')).toBeInTheDocument();
    expect(within(row).getByText('94')).toBeInTheDocument();
    fireEvent.click(within(row).getByRole('button', { name: 'Fiche de Caliste' }));
    expect(open).toHaveBeenCalledWith('Caliste');
  });

  it('change de club', async () => {
    render(<Squad />);
    await screen.findByText('Caliste');
    fireEvent.change(screen.getByLabelText('Club'), { target: { value: 'Fnatic' } });
    expect(await screen.findByText('Oscarinin')).toBeInTheDocument();
  });
});
