// Données de la vitrine.
// - Réelles (base de M1, `apercu.json`) : joueurs et staff de Karmine Corp, photos,
//   logos, pays, âges, fins de contrat, champions les plus joués.
// - Exemples des maquettes, en attendant les jalons qui les calculeront : niveau
//   et potentiel (M2), forme, moral et fatigue (M10), valeur (M11), écart d'or (M6).
//   Ces chiffres sont inventés pour la démonstration // estimé (repris des maquettes v2).
import { assetUrl, championIcon } from '../api';
import { OBJECTIVE_ICON } from '../components/ui';
import type { ChampionRef, GoldEvent, KeyMoment, RadarAxis, SquadExtras, SquadPlayer } from '../components/ui';

const champ = (key: string, name = key): ChampionRef => ({ name, icon: championIcon(key) });

export const KC = { name: 'Karmine Corp', logo: assetUrl('logos/karmine-corp-f3aa9bbd.png') };
export const G2 = { name: 'G2 Esports', logo: assetUrl('logos/g2-esports-7d6673d3.png') };

/** Valeurs d'exemple par joueur (pseudo de la base). */
export const EXTRAS: Record<string, SquadExtras> = {
  Canna: { level: 4, potential: 4, form: ['V', 'V', 'D', 'V', 'V'], morale: 72, fatigue: 35, value: 950_000, statuts: ['leader'] },
  Yike: { level: 4, potential: 4.5, form: ['V', 'V', 'V', 'D', 'V'], morale: 80, fatigue: 40, value: 1_200_000, statuts: ['convoite'] },
  kyeahoo: { level: 3.5, potential: 4.5, form: ['D', 'V', 'D', 'V', 'D'], morale: 45, fatigue: 30, value: 800_000, statuts: ['inquiet'] },
  Caliste: { level: 4, potential: 5, form: ['V', 'V', 'V', 'V', 'V'], morale: 88, fatigue: 68, value: 1_800_000, statuts: ['enFeu', 'pepite', 'fatigue'] },
  Busio: { level: 3.5, potential: 4, form: ['V', 'D', 'V', 'V', 'V'], morale: 84, fatigue: 30, value: 700_000, statuts: [] },
};

/** Effectif de secours si la base n'est pas disponible (tests sans `apercu.json`). */
export const EFFECTIF_SECOURS: SquadPlayer[] = [
  { id: 'Canna', pseudo: 'Canna', realName: 'Kim Chang-dong', country: 'KR', role: 'top', age: 25,
    champions: [champ('Ambessa'), champ('Jayce'), champ('Gnar')], contractEnd: 'nov. 2027', ...EXTRAS.Canna },
  { id: 'Yike', pseudo: 'Yike', realName: 'Martin Sundelin', country: 'SE', role: 'jungle', age: 25,
    champions: [champ('Vi'), champ('XinZhao'), champ('Sejuani')], contractEnd: 'nov. 2026', contractEndsThisYear: true, ...EXTRAS.Yike },
  { id: 'Kyeahoo', pseudo: 'kyeahoo', realName: 'Kang Ye-hoo', country: 'KR', role: 'mid', age: 20,
    champions: [champ('Azir'), champ('Taliyah'), champ('Ahri')], contractEnd: 'nov. 2026', contractEndsThisYear: true, ...EXTRAS.kyeahoo },
  { id: 'Caliste', pseudo: 'Caliste', realName: 'Caliste Henry-Hennebert', country: 'FR', role: 'adc', age: 19,
    champions: [champ('Ezreal'), champ('Varus'), champ('MissFortune')], contractEnd: 'nov. 2028', ...EXTRAS.Caliste },
  { id: 'Busio', pseudo: 'Busio', realName: 'Alan Cwalina', country: 'US', role: 'support', age: 22,
    champions: [champ('Alistar'), champ('Neeko'), champ('Rakan')], contractEnd: 'nov. 2027', ...EXTRAS.Busio },
];

export const CHAMPIONS_CALISTE = [
  { ...champ('Ezreal'), games: 34, winrate: 62, mastery: 92 },
  { ...champ('Varus'), games: 41, winrate: 59, mastery: 90 },
  { ...champ('MissFortune', 'Miss Fortune'), games: 27, winrate: 52, mastery: 78 },
  { ...champ('Xayah'), games: 12, winrate: 50, mastery: 64 },
];

export const RADAR_CALISTE: RadarAxis[] = [
  { label: 'Laning', value: 16, reference: 14 },
  { label: 'Mécanique', value: 17, reference: 13 },
  { label: 'Teamfight', value: 15, reference: 13 },
  { label: 'Farm', value: 17, reference: 13 },
  { label: 'Vision', value: 11, reference: 12 },
  { label: 'Mental', value: 14, reference: 12 },
];

export const FORME_CALISTE = [6.9, 6.1, 7.6, 7.3, 6.7, 8.2, 7.1, 8.6, 7.9, 8.7].map((rating, i) => ({
  rating, win: ![1, 4].includes(i),
}));

/** Écart d'or KC moins G2, une valeur par minute (exemple de la maquette du match en direct). */
export const ECART_OR = [
  0, 0, 20, -60, -150, -220, -80, -300, -420, -150, 100, 350, 620, 800, 700, 1150, 1500, 1700, 2400,
];

/** Repères de la maquette du match en direct (minute, équipe, icône). */
export const EVENEMENTS_OR: GoldEvent[] = [
  { minute: 3.5, side: 'them', kind: 'kill', champion: champ('Gnar'), label: 'BrokenBlade élimine Canna' },
  { minute: 5.5, side: 'them', kind: 'dragon', label: 'Premier dragon pour G2' },
  { minute: 8.2, side: 'them', kind: 'kill', champion: champ('Syndra'), label: 'Caps élimine kyeahoo' },
  { minute: 9.6, side: 'us', kind: 'larves', label: 'Yike vole les larves du néant' },
  { minute: 11.2, side: 'us', kind: 'kill', champion: champ('XinZhao', 'Xin Zhao'), label: 'Gank top de Yike, premier sang' },
  {
    minute: 13.4, side: 'us', kind: 'kill', badge: '⚔ 3 – 1', highlight: true, label: 'Combat au dragon gagné 3 pour 1',
    icons: [championIcon('Orianna'), championIcon('XinZhao'), championIcon('Renekton')],
  },
  { minute: 15.2, side: 'them', kind: 'kill', champion: champ('Ezreal'), label: 'Hans Sama élimine Busio' },
  { minute: 16.4, side: 'us', kind: 'kill', champion: champ('Varus'), badge: '×2', highlight: true, label: 'Double kill de Caliste' },
  { minute: 17.3, side: 'us', kind: 'tour', label: 'KC détruit la tour bot extérieure' },
  { minute: 18.4, side: 'us', kind: 'kill', champion: champ('Varus'), label: 'Caliste élimine Hans Sama' },
];

export const MOMENTS: KeyMoment[] = [
  { time: '11:42', side: 'us', text: 'Gank top de Yike, premier sang', icon: champ('XinZhao', 'Xin Zhao') },
  { time: '18:54', side: 'us', text: 'Combat au 3e dragon gagné 4 pour 1', icon: champ('Varus') },
  { time: '22:10', side: 'them', text: 'Caps vole le Héraut', icon: champ('Azir') },
  { time: '26:12', side: 'us', text: 'Nashor sécurisé par kyeahoo', icon: { name: 'Nashor', icon: OBJECTIVE_ICON.nashor } },
];
