import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import {
  AttributeBar, ChemistryRow, Flag, FormChart, FormStreak, GoldDiffChart, PlayerHeader, PlayerPhoto,
  ProbabilityBar, RadarChart, RoleIcon, SquadTable, StateGauge, Stars, StatusTag, chemistryLabel, formatEcart,
  formatEuros, masteryLabel, niceStep, summarizeGold, toneOf100, toneOf20, toneOfFatigue,
} from '.';
import { EFFECTIF_SECOURS as EFFECTIF } from '../../vitrine/exemple';
import { toSquadPlayer, toStaff } from './adapt';
import type { RosterMember } from '../../api';

// toLocaleString('fr-FR') sépare les milliers par une espace fine insécable.
const norm = (s: string | null) => (s ?? '').replace(/[\u202f\u00a0]/g, ' ');

describe('règles de couleur', () => {
  it('suit les seuils des maquettes', () => {
    expect([toneOf100(72), toneOf100(62), toneOf100(45)]).toEqual(['good', 'mid', 'bad']);
    expect([toneOf20(17), toneOf20(15), toneOf20(9)]).toEqual(['good', 'mid', 'bad']);
    expect([toneOfFatigue(35), toneOfFatigue(68)]).toEqual(['good', 'bad']);
    expect(masteryLabel(92).label).toBe('Excellente');
    expect(masteryLabel(78).label).toBe('Très bonne');
    expect([chemistryLabel(92), chemistryLabel(74), chemistryLabel(58), chemistryLabel(35)])
      .toEqual(['Excellente', 'Bonne', 'Correcte', 'Tendue']);
  });

  it('formate les montants et les écarts en français', () => {
    expect(norm(formatEuros(950_000))).toBe('950 k€');
    expect(norm(formatEuros(1_200_000))).toBe('1,2 M€');
    expect(norm(formatEuros(5_450_000))).toBe('5,45 M€');
    expect(norm(formatEcart(2400))).toBe('+2 400');
    expect(norm(formatEcart(-420))).toBe('\u2212420');
  });
});

describe('petits éléments', () => {
  it('nomme chaque rôle', () => {
    render(<RoleIcon role="adc" />);
    expect(screen.getByRole('img', { name: 'ADC' })).toBeInTheDocument();
  });

  it('affiche les demi-étoiles', () => {
    render(<Stars value={3.5} />);
    expect(screen.getByRole('img', { name: '3,5 sur 5' })).toBeInTheDocument();
  });

  it('montre le libellé d\'un statut connu ou libre', () => {
    render(<><StatusTag statut="enFeu" /><StatusTag label="Convoité : 3 clubs" /></>);
    expect(screen.getByText('En feu')).toBeInTheDocument();
    expect(screen.getByText('Convoité : 3 clubs')).toBeInTheDocument();
  });

  it('donne le nom du pays, ou son code s\'il est inconnu', () => {
    render(<><Flag code="fr" /><Flag code="GR" /></>);
    expect(screen.getByRole('img', { name: 'France' })).toBeInTheDocument();
    expect(screen.getByText('GR')).toBeInTheDocument();
  });

  it('compte victoires et défaites', () => {
    render(<FormStreak results={['V', 'D', 'V']} />);
    expect(screen.getByRole('img', { name: 'Forme : 2 victoires, 1 défaites' })).toBeInTheDocument();
  });

  it('remplace une photo absente ou cassée par les initiales', () => {
    const { container, rerender } = render(<PlayerPhoto name="Kim Chang-dong" />);
    expect(container).toHaveTextContent('KC');
    rerender(<PlayerPhoto name="Caliste" src="/manquante.png" alt="Photo de Caliste" />);
    fireEvent.error(screen.getByRole('img', { name: 'Photo de Caliste' }));
    expect(screen.getByRole('img', { name: 'Photo de Caliste' })).toHaveTextContent('CA');
  });
});

describe('jauges', () => {
  it('expose la jauge d\'état comme une mesure', () => {
    render(<StateGauge label="Fatigue" percent={68} valueText="68 %" tone="bad" trend="up" />);
    expect(screen.getByRole('meter', { name: 'Fatigue' })).toHaveAttribute('aria-valuenow', '68');
    expect(screen.getByRole('img', { name: 'en hausse' })).toBeInTheDocument();
  });

  it('gère note exacte, fourchette et inconnu', () => {
    render(<>
      <AttributeBar name="Mécanique" value={17} />
      <AttributeBar name="Sang-froid" range={[12, 15]} />
      <AttributeBar name="Grands matchs" />
    </>);
    expect(screen.getByRole('group', { name: 'Mécanique : 17 sur 20' })).toHaveTextContent('17');
    expect(screen.getByRole('group', { name: /entre 12 et 15/ })).toHaveTextContent('12-15');
    expect(screen.getByRole('group', { name: 'Grands matchs : inconnu' })).toHaveTextContent('?');
  });

  it('complète le pronostic à 100 %', () => {
    render(<ProbabilityBar us={46} />);
    expect(screen.getByRole('img', { name: 'Probabilité de victoire : 46 % contre 54 %' })).toBeInTheDocument();
  });
});

describe('blocs', () => {
  it('liste l\'effectif et ouvre la fiche au clic', () => {
    const onOpen = vi.fn();
    render(<SquadTable players={EFFECTIF} onOpen={onOpen} />);
    expect(screen.getAllByRole('row')).toHaveLength(EFFECTIF.length + 1);
    expect(screen.getAllByText('Fin de contrat cette année')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'Caliste' }));
    expect(onOpen).toHaveBeenCalledWith('Caliste');
  });

  it('affiche l\'en-tête de la fiche joueur', () => {
    const onTalk = vi.fn();
    render(<PlayerHeader pseudo="Caliste" role="adc" rank={1} country="FR" age={19} club={{ name: 'Karmine Corp' }}
      since="nov. 2024" contractEnd="nov. 2028" statuts={['pepite']} level={84} potential={93}
      value={1_800_000} salary={32_000} onTalk={onTalk} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Caliste');
    expect(screen.getByText('France')).toBeInTheDocument();
    expect(screen.getByText('Potentiel 93')).toBeInTheDocument();
    expect(norm(screen.getByText(/Salaire/).textContent)).toBe('Salaire : 32 k€ / mois');
    fireEvent.click(screen.getByRole('button', { name: 'Discuter' }));
    expect(onTalk).toHaveBeenCalled();
  });

  it('écrit le niveau de chimie', () => {
    render(<ChemistryRow name="Canna" role="top" percent={35} />);
    expect(screen.getByText('Tendue')).toBeInTheDocument();
  });
});

describe('graphiques', () => {
  const ecart = [0, -100, -420, -150, 300, 1200, 2400];

  it('choisit des pas d\'axe ronds', () => {
    expect(niceStep(2400)).toBe(1000);
    expect(niceStep(6800)).toBe(2500);
    expect(niceStep(420)).toBe(200);
  });

  it('résume l\'écart d\'or', () => {
    expect(summarizeGold(ecart)).toEqual({
      final: 2400, worst: { value: -420, minute: 2 }, best: { value: 2400, minute: 6 }, swingMinute: 4,
    });
  });

  it('décrit la courbe pour les lecteurs d\'écran', () => {
    render(<GoldDiffChart values={ecart} us="KC" them="G2" />);
    const svg = screen.getByRole('img');
    expect(norm(svg.getAttribute('aria-label'))).toBe(
      'Écart d\'or minute par minute : KC mène de 2 400 à 6 minutes, plus grand retard \u2212420 à 2 minutes, bascule à 4 minutes',
    );
  });

  it('dessine la forme et sa moyenne', () => {
    render(<FormChart points={[{ rating: 7, win: true }, { rating: 8, win: false }]} />);
    expect(screen.getByText('7,5')).toBeInTheDocument();
  });

  it('dessine un radar avec la référence', () => {
    const { container } = render(<RadarChart name="Caliste" referenceName="Moyenne ADC LEC"
      axes={[{ label: 'Laning', value: 16, reference: 14 }, { label: 'Farm', value: 17, reference: 13 }, { label: 'Vision', value: 11 }]} />);
    expect(screen.getByRole('img', { name: /Profil de Caliste comparé à : Moyenne ADC LEC/ })).toBeInTheDocument();
    expect(container.querySelectorAll('polygon[stroke-dasharray]')).toHaveLength(1);
  });
});

describe('événements de la courbe d\'or', () => {
  it('pose un marqueur par événement et légende les types présents', () => {
    const { container } = render(<GoldDiffChart values={[0, -200, 300, 900]} us="KC" them="G2" events={[
      { minute: 1, side: 'them', kind: 'dragon', label: 'Dragon pour G2' },
      { minute: 2, side: 'us', kind: 'tour', label: 'Tour pour KC' },
      { minute: 3, side: 'us', kind: 'kill', champion: { name: 'Varus', icon: '/champions/Varus.png' }, label: 'Kill' },
    ]} />);
    expect(container.querySelectorAll('svg[role="img"] title')).toHaveLength(3);
    expect(container.querySelector('svg[role="img"] title')).toHaveTextContent('1 min · Dragon pour G2');
    for (const t of ['Dragon', 'Tour', 'Kill (tueur)']) expect(screen.getByText(t)).toBeInTheDocument();
    expect(screen.queryByText('Nashor')).not.toBeInTheDocument();
  });
});

describe('données de la base', () => {
  const base: RosterMember = {
    personId: 'Caliste', handle: 'Caliste', realName: 'Caliste Henry-Hennebert', country: 'France',
    birthdate: '2006-08-28', role: 'Bot', isStaff: false, photoFile: 'photos/caliste.jpeg',
    contractEnd: '2026-11-20', stats2025: null, topChampions: ['Ezreal', 'Varus'],
  };
  const extras = { level: 4, potential: 5, form: [], morale: 80, fatigue: 20, value: 1, statuts: [] };

  it('convertit un joueur de la base en ligne d\'effectif', () => {
    const p = toSquadPlayer(base, extras);
    expect(p).toMatchObject({
      pseudo: 'Caliste', role: 'adc', country: 'FR', age: 19, contractEnd: 'nov. 2026', contractEndsThisYear: true,
    });
    expect(p?.photo).toMatch(/photos\/caliste\.jpeg$/);
    expect(p?.champions.map((c) => c.name)).toEqual(['Ezreal', 'Varus']);
  });

  it('écarte le staff de l\'effectif et le garde pour la liste du staff', () => {
    const coach = { ...base, handle: 'Reapered', role: 'Coach', isStaff: true };
    expect(toSquadPlayer(coach, extras)).toBeNull();
    expect(toStaff(coach)).toMatchObject({ name: 'Reapered', role: 'Coach' });
  });
});
