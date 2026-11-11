// Pont vers le Rust. Hors de Tauri (navigateur, démos, tests), les données
// viennent de `apercu.json`, un extrait de la base produit par `just seed`
// avec les mêmes fonctions de lecture que l'application.
import { invoke, isTauri } from '@tauri-apps/api/core';
import type { MatchReplay } from './match/replay';

export interface WorldInfo {
  date: string;
  schemaVersion: number;
  engineVersion: string;
}

export interface League {
  id: string;
  name: string;
  region: string | null;
  tier: number;
  teamCount: number;
}

export interface Team {
  id: string;
  short: string | null;
  leagueId: string;
  logoFile: string | null;
}

export interface SeasonStats {
  games: number;
  wins: number;
  kills: number;
  deaths: number;
  assists: number;
  csPerMin: number;
  goldPerMin: number;
  damagePerMin: number;
}

export interface RosterMember {
  personId: string;
  handle: string;
  realName: string | null;
  country: string | null;
  birthdate: string | null;
  role: string;
  isStaff: boolean;
  photoFile: string | null;
  contractEnd: string | null;
  stats2025: SeasonStats | null;
  topChampions: string[];
  rating: Rating | null;
}

export interface Rating {
  level: number;
  levelLow: number;
  levelHigh: number;
  potential: number;
  games: number;
  /** « stats » ou « estimé ». */
  source: string;
}

export interface AttrScore {
  key: string;
  value: number;
  low: number;
  high: number;
  estimated: boolean;
}

export interface TournamentStats {
  tournament: string;
  stats: SeasonStats;
  visionPerMin: number;
}

export interface ChampionUse {
  champion: string;
  games: number;
  wins: number;
}

export interface PlayerDetail {
  member: RosterMember;
  teamId: string;
  leagueId: string;
  residency: string | null;
  nativeName: string | null;
  attributes: AttrScore[];
  tournaments: TournamentStats[];
  champions: ChampionUse[];
}

interface Preview {
  leagues: League[];
  teams: Team[];
  rosters: Record<string, RosterMember[]>;
  players: Record<string, PlayerDetail | null>;
}

export const FALLBACK_WORLD: WorldInfo = {
  date: 'Lun. 5 janvier 2026',
  schemaVersion: 2,
  engineVersion: 'navigateur',
};

/** Chemin d'un fichier de `data/seed/public` (logos, photos, champions). */
export function assetUrl(file: string): string {
  return `${import.meta.env.BASE_URL}${file}`;
}

export function championIcon(key: string): string {
  return assetUrl(`champions/${key}.png`);
}

let preview: Promise<Preview> | null = null;
function loadPreview(): Promise<Preview> {
  preview ??= fetch(assetUrl('apercu.json')).then((r) => {
    if (!r.ok) throw new Error(`apercu.json : ${r.status}`);
    return r.json() as Promise<Preview>;
  });
  return preview;
}

export async function getWorldInfo(): Promise<WorldInfo> {
  if (!isTauri()) return FALLBACK_WORLD;
  return invoke<WorldInfo>('world_info');
}

export async function listLeagues(): Promise<League[]> {
  if (isTauri()) return invoke<League[]>('leagues');
  return (await loadPreview()).leagues;
}

export async function listTeams(leagueId: string): Promise<Team[]> {
  if (isTauri()) return invoke<Team[]>('teams', { leagueId });
  return (await loadPreview()).teams.filter((t) => t.leagueId === leagueId);
}

/**
 * Une partie simulée par le moteur (M3 : 15 min de farm, sans combat).
 * Dans l'app : simulée à la demande. Dans le navigateur : la partie KC–G2 graine 3,
 * produite par le même moteur (`just sim KC G2 --n 1 --replay data/seed/public/match-demo.json`).
 */
export async function simulateMatch(blue: string, red: string, matchSeed: number): Promise<MatchReplay> {
  if (isTauri()) return invoke<MatchReplay>('simulate_match', { blue, red, matchSeed });
  const r = await fetch(assetUrl('match-demo.json'));
  if (!r.ok) throw new Error(`match-demo.json : ${r.status}`);
  return r.json() as Promise<MatchReplay>;
}

export async function getRoster(teamId: string): Promise<RosterMember[]> {
  if (isTauri()) return invoke<RosterMember[]>('roster', { teamId });
  return (await loadPreview()).rosters[teamId] ?? [];
}

export async function getPlayer(personId: string): Promise<PlayerDetail | null> {
  if (isTauri()) return invoke<PlayerDetail | null>('player', { personId });
  return (await loadPreview()).players[personId] ?? null;
}
