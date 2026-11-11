import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Vitrine } from './Vitrine';

describe('Vitrine', () => {
  it('montre les quatre familles de composants', () => {
    render(<Vitrine />);
    for (const titre of ['Petits éléments', 'Jauges et barres', 'Blocs', 'Graphiques']) {
      expect(screen.getByRole('heading', { level: 2, name: titre })).toBeInTheDocument();
    }
    expect(screen.getAllByRole('row')).toHaveLength(6);
  });
});
