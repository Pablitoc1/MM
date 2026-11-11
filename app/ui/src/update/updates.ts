// Mise à jour automatique de l'application installée (plugin updater de Tauri).
// Dans le navigateur (lien de test d'une PR), il n'y a rien à mettre à jour.
import { isTauri } from '@tauri-apps/api/core';
import { check, type Update } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

export interface AvailableUpdate {
  version: string;
  /** Télécharge, installe puis relance le jeu. `onProgress` reçoit un pourcentage (ou null s'il est inconnu). */
  install: (onProgress: (percent: number | null) => void) => Promise<void>;
}

/** Cherche une nouvelle version. Renvoie null si le jeu est à jour, hors ligne ou dans le navigateur. */
export async function findUpdate(): Promise<AvailableUpdate | null> {
  if (!isTauri()) return null;
  let update: Update | null;
  try {
    update = await check();
  } catch (e) {
    // Pas de réseau ou serveur indisponible : on joue avec la version actuelle.
    console.warn('mise à jour', e);
    return null;
  }
  if (!update) return null;
  const found = update;
  return {
    version: found.version,
    install: async (onProgress) => {
      let total = 0;
      let received = 0;
      await found.downloadAndInstall((event) => {
        if (event.event === 'Started') total = event.data.contentLength ?? 0;
        if (event.event === 'Progress') {
          received += event.data.chunkLength;
          onProgress(total > 0 ? Math.min(100, Math.round((received / total) * 100)) : null);
        }
      });
      await relaunch();
    },
  };
}
