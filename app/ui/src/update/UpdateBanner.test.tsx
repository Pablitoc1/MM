import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { UpdateBanner } from './UpdateBanner';
import { findUpdate, type AvailableUpdate } from './updates';

describe('UpdateBanner', () => {
  it("n'affiche rien quand le jeu est à jour", async () => {
    const find = vi.fn(async () => null);
    const { container } = render(<UpdateBanner find={find} />);
    await waitFor(() => expect(find).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });

  it('propose la nouvelle version et installe au clic', async () => {
    const install = vi.fn(async (onProgress: (p: number | null) => void) => onProgress(40));
    const update: AvailableUpdate = { version: '0.1.7', install };
    render(<UpdateBanner find={async () => update} />);
    expect(await screen.findByRole('status')).toHaveTextContent('Nouvelle version 0.1.7 disponible.');
    fireEvent.click(screen.getByRole('button', { name: 'Mettre à jour' }));
    expect(install).toHaveBeenCalledOnce();
    expect(await screen.findByText(/40 %/)).toBeInTheDocument();
  });

  it('se cache avec « Plus tard »', async () => {
    render(<UpdateBanner find={async () => ({ version: '0.1.7', install: vi.fn() })} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Plus tard' }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it("ne cherche rien dans le navigateur (lien de test d'une PR)", async () => {
    expect(await findUpdate()).toBeNull();
  });
});
