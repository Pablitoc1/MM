// Pont vers le Rust. Hors de Tauri (navigateur, tests), on renvoie l'état
// d'une nouvelle partie, identique à celui du Rust.
import { invoke, isTauri } from '@tauri-apps/api/core';

export interface WorldInfo {
  date: string;
  schemaVersion: number;
  engineVersion: string;
}

export const FALLBACK_WORLD: WorldInfo = {
  date: 'Lun. 5 janvier 2026',
  schemaVersion: 0,
  engineVersion: 'navigateur',
};

export async function getWorldInfo(): Promise<WorldInfo> {
  if (!isTauri()) return FALLBACK_WORLD;
  return invoke<WorldInfo>('world_info');
}
