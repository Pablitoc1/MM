// Pont vers le Rust. Hors de Tauri (navigateur, démos, tests), les données
// viennent de `apercu.json`, un extrait de la base produit par `just seed`
// avec les mêmes fonctions de lecture que l'application.
import { invoke, isTauri } from '@tauri-apps/api/core';

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
}

interface Preview {
  leagues: League[];
  teams: Team[];
  rosters: Record<string, RosterMember[]>;
}

export const FALLBACK_WORLD: WorldInfo = {
  date: 'Lun. 5 janvier 2026',
  schemaVersion: 1,
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

export async function getRoster(teamId: string): Promise<RosterMember[]> {
  if (isTauri()) return invoke<RosterMember[]>('roster', { teamId });
  return (await loadPreview()).rosters[teamId] ?? [];
}
