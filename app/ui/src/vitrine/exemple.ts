// Données d'exemple de la vitrine, reprises des maquettes v2 (effectif KC 2026).
// Les noms, rôles, nationalités et champions sont réels ; les notes, valeurs,
// moral, fatigue et l'écart d'or sont des exemples pour la maquette // estimé
// (ils seront remplacés par les vraies données en M1 et M2).
import type { ChampionRef, GoldEvent, KeyMoment, RadarAxis, SquadPlayer } from '../components/ui';

/** Patch Data Dragon des icônes de champions (début de saison 2026). */
const DDRAGON = 'https://ddragon.leagueoflegends.com/cdn/16.1.1/img/champion';
const champ = (id: string, name = id): ChampionRef => ({ name, icon: `${DDRAGON}/${id}.png` });

export const KC = { name: 'Karmine Corp' };
export const G2 = { name: 'G2 Esports' };

export const EFFECTIF: SquadPlayer[] = [
  {
    id: 'canna', pseudo: 'Canna', realName: 'Kim Chang-dong', country: 'KR', role: 'top', age: 25,
    champions: [champ('Renekton'), champ('KSante', "K'Santé"), champ('Gnar')],
    level: 4, potential: 4, form: ['V', 'V', 'D', 'V', 'V'], morale: 72, fatigue: 35,
    value: 950_000, contractEnd: 'nov. 2026', contractEndsThisYear: true, statuts: ['leader'],
  },
  {
    id: 'yike', pseudo: 'Yike', realName: 'Martin Sundelin', country: 'SE', role: 'jungle', age: 23,
    champions: [champ('XinZhao', 'Xin Zhao'), champ('Vi'), champ('Sejuani')],
    level: 4, potential: 4.5, form: ['V', 'V', 'V', 'D', 'V'], morale: 80, fatigue: 40,
    value: 1_200_000, contractEnd: 'nov. 2027', statuts: ['convoite'],
  },
  {
    id: 'kyeahoo', pseudo: 'kyeahoo', realName: 'Kang Ye-hoo', country: 'KR', role: 'mid', age: 22,
    champions: [champ('Orianna'), champ('Azir'), champ('Syndra')],
    level: 3.5, potential: 4.5, form: ['D', 'V', 'D', 'V', 'D'], morale: 45, fatigue: 30,
    value: 800_000, contractEnd: 'nov. 2027', statuts: ['inquiet'],
  },
  {
    id: 'caliste', pseudo: 'Caliste', realName: 'Caliste Henry-Hennebert', country: 'FR', role: 'adc', age: 19,
    champions: [champ('Varus'), champ('Kaisa', "Kai'Sa"), champ('Ezreal')],
    level: 4, potential: 5, form: ['V', 'V', 'V', 'V', 'V'], morale: 88, fatigue: 68,
    value: 1_800_000, contractEnd: 'nov. 2028', statuts: ['enFeu', 'pepite', 'fatigue'],
  },
  {
    id: 'busio', pseudo: 'Busio', realName: 'Alan Cwalina', country: 'US', role: 'support', age: 21,
    champions: [champ('Rakan'), champ('Braum')],
    level: 3.5, potential: 4, form: ['V', 'D', 'V', 'V', 'V'], morale: 84, fatigue: 30,
    value: 700_000, contractEnd: 'nov. 2026', contractEndsThisYear: true, statuts: [],
  },
];

export const CHAMPIONS_CALISTE = [
  { ...champ('Varus'), games: 34, winrate: 62, mastery: 92 },
  { ...champ('Kaisa', "Kai'Sa"), games: 41, winrate: 59, mastery: 90 },
  { ...champ('Ezreal'), games: 27, winrate: 52, mastery: 78 },
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

export const EVENEMENTS_OR: GoldEvent[] = [
  { minute: 5, side: 'them', label: 'Premier dragon pour G2' },
  { minute: 8, side: 'them', label: 'Tour du bas détruite par G2' },
  { minute: 11, side: 'us', label: 'Gank top de Yike, premier sang' },
  { minute: 15, side: 'us', label: 'Larves du Néant pour KC' },
  { minute: 18, side: 'us', label: 'Combat au dragon gagné 4 pour 1' },
];

export const MOMENTS: KeyMoment[] = [
  { time: '11:42', side: 'us', text: 'Gank top de Yike, premier sang', icon: champ('XinZhao', 'Xin Zhao') },
  { time: '18:54', side: 'us', text: 'Combat au 3e dragon gagné 4 pour 1', icon: champ('Varus') },
  { time: '22:10', side: 'them', text: 'Caps vole le Héraut', icon: champ('Azir') },
  { time: '26:12', side: 'us', text: 'Baron sécurisé par kyeahoo', icon: champ('Orianna') },
];
