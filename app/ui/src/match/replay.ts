// Format du flux d'une partie (version 1).
//
// Aujourd'hui ce flux vient d'un faux match scripté (`demoReplay.ts`).
// Au jalon M6, le moteur Rust produira exactement ce format, et la vue 2D
// n'aura rien d'autre à lire. Détails et raisons : docs/decisions/003-flux-vue-2d.md.
//
// Unités : temps en secondes de jeu depuis 0:00. Positions en unités de jeu Riot
// (carte 11, origine en bas à gauche côté bleu, y vers le haut), comme les
// timelines de l'API Riot.

export const REPLAY_VERSION = 1;

/** 0 = côté bleu, 1 = côté rouge. */
export type TeamIndex = 0 | 1;
export type Role = 'top' | 'jungle' | 'mid' | 'bot' | 'support';
export type Lane = 'top' | 'mid' | 'bot';

export interface TeamInfo {
  /** Sigle affiché, ex. « KC ». */
  tag: string;
  name: string;
}

export interface ChampionInfo {
  team: TeamIndex;
  role: Role;
  player: string;
  /** Identifiant Data Dragon du champion, ex. « XinZhao ». */
  champion: string;
  /** Sorts d'invocateur (identifiants Data Dragon, ex. « SummonerFlash »). */
  spells: [string, string];
}

/** État d'un champion dans une image. L'ordre suit `MatchReplay.champions`. */
export interface ChampionFrame {
  x: number;
  y: number;
  /** Points de vie, de 0 à 1. */
  hp: number;
  /** Mana ou énergie, de 0 à 1 ; null pour un champion sans ressource à afficher. */
  resource: number | null;
  alive: boolean;
  level: number;
  /** Sbires et monstres tués. */
  cs: number;
  /** Or total gagné depuis le début. */
  gold: number;
  /** Objets portés (identifiants Data Dragon), 6 au plus, sans la balise. */
  items: number[];
}

/**
 * Une vague de sbires. Elle est repérée par sa distance le long de sa voie,
 * comptée depuis le nexus de son équipe : elle reste donc dans sa voie.
 */
export interface WaveFrame {
  /** Identifiant stable d'une image à l'autre (pour l'interpolation). */
  id: number;
  team: TeamIndex;
  lane: Lane;
  /** Distance parcourue le long de la voie, en unités de jeu. */
  d: number;
  /** Nombre de sbires encore en vie. */
  n: number;
}

/** Une image horodatée : 1 par seconde, 4 par seconde en combat. */
export interface Frame {
  t: number;
  /** Chances de victoire du côté bleu, de 0 à 1, selon le moteur. */
  blueWin: number;
  champions: ChampionFrame[];
  waves: WaveFrame[];
}

export type MatchEvent =
  | { t: number; type: 'kill'; killer: number | null; victim: number; assists: number[]; respawnAt: number }
  /** `by` : le champion qui donne le dernier coup, s'il y en a un. */
  | { t: number; type: 'structure'; id: string; team: TeamIndex; by?: number }
  /** Un inhibiteur revient (M5a) ; `team` : l'équipe à qui il appartient. */
  | { t: number; type: 'structure_respawn'; id: string; team: TeamIndex }
  | { t: number; type: 'camp_spawn'; camp: string; variant?: string }
  | { t: number; type: 'camp_killed'; camp: string; team: TeamIndex; respawnAt: number | null; by?: number }
  /** `by` : le champion qui pose la balise. */
  | { t: number; type: 'ward_placed'; id: number; team: TeamIndex; x: number; y: number; expiresAt: number; by?: number }
  | { t: number; type: 'ward_killed'; id: number }
  | { t: number; type: 'end'; winner: TeamIndex };

export interface MatchReplay {
  version: typeof REPLAY_VERSION;
  map: 'summoners-rift';
  /** Patch du jeu, ex. « 16.22 ». */
  patch: string;
  /** Graine du moteur qui a produit la partie. */
  seed: number;
  /** Où et quand se joue le match, pour la barre du haut. */
  context?: { competition: string; stage: string; format: string; date: string };
  duration: number;
  teams: [TeamInfo, TeamInfo];
  /** 10 champions : 0 à 4 côté bleu, 5 à 9 côté rouge. */
  champions: ChampionInfo[];
  /** Triées par `t` croissant. */
  frames: Frame[];
  /** Triés par `t` croissant. */
  events: MatchEvent[];
}
