import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import demo from '../../../../data/seed/public/draft-demo.json';
import { Draft } from './Draft';

const PREVIEW = {
  leagues: [],
  teams: [
    { id: 'Karmine Corp', short: 'KC', leagueId: 'LEC', logoFile: null },
    { id: 'G2 Esports', short: 'G2', leagueId: 'LEC', logoFile: null },
  ],
  rosters: {},
  players: {},
};

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async (url: string) =>
    new Response(JSON.stringify(String(url).includes('draft-demo') ? demo : PREVIEW))));
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('Draft', () => {
  it('montre le premier ban, le conseil du coach et les bans conseillés', async () => {
    render(<Draft />);
    expect(await screen.findByText('Bans conseillés')).toBeInTheDocument();
    expect(screen.getByText('Phase de bans 1')).toBeInTheDocument();
    expect(await screen.findByText(/KC BANNIT/)).toBeInTheDocument();
    const advice = demo.steps[0].advice!;
    expect(screen.getByText(advice.text)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: `Bannir ${advice.name}` })).toBeInTheDocument();
  });

  it('suit la draft jusqu’au bout avec « Déléguer »', async () => {
    render(<Draft />);
    await screen.findByText('Bans conseillés');
    for (let i = 1; i < demo.steps.length; i++) {
      fireEvent.click(screen.getByRole('button', { name: 'Déléguer' }));
      await screen.findByText(demo.steps[i].turn?.phase ?? 'DRAFT TERMINÉE');
    }
    expect(screen.getByText(/Draft terminée : les dix champions/)).toBeInTheDocument();
    const last = demo.steps[demo.steps.length - 1];
    for (const slot of [...last.blue, ...last.red]) expect(screen.getAllByText(slot.championName!).length).toBeGreaterThan(0);
  });

  it('refuse dans le navigateur un autre choix que le conseil', async () => {
    render(<Draft />);
    await screen.findByText('Bans conseillés');
    const other = demo.steps[0].cards.find((c) => !c.advised)!;
    const grid = screen.getByText('Bans conseillés').closest('section')!;
    fireEvent.click(within(grid).getByRole('button', { name: other.name }));
    fireEvent.click(screen.getByRole('button', { name: `Bannir ${other.name}` }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Aperçu web');
  });

  it('le coach choisit quand les 30 secondes sont écoulées', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(<Draft />);
    await screen.findByText('Bans conseillés');
    expect(screen.getByLabelText('Temps restant')).toHaveTextContent('0:30');
    await act(async () => { for (let i = 0; i < 31; i++) await vi.advanceTimersByTimeAsync(1000); });
    expect(await screen.findByText(demo.steps[1].advice!.text)).toBeInTheDocument();
  });
});
