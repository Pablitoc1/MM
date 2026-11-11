// Passage des données de la base (api.ts) aux composants. Ce qui vient de la
// base est repris tel quel ; ce qui n'existe pas encore (niveau en M2, moral et
// fatigue en M10, valeur en M11) arrive par `extras`.
import { assetUrl, championIcon, type RosterMember } from '../../api';
import { ageAt, countryCode, monthYear } from '../../format';
import type { Statut } from './StatusTag';
import { roleFromDb, type Result, type SquadPlayer } from './types';

/** Date de début de la partie : l'âge et les fins de contrat sont comptés à partir d'elle. */
export const DEBUT_PARTIE = '2026-01-05';

/** Valeurs que la base ne fournit pas encore. */
export interface SquadExtras {
  level: number;
  potential: number;
  form: Result[];
  morale: number;
  fatigue: number;
  value: number;
  statuts: Statut[];
}

/** Un joueur de la base vers une ligne de l'effectif. Renvoie null pour le staff. */
export function toSquadPlayer(m: RosterMember, extras: SquadExtras, today = DEBUT_PARTIE): SquadPlayer | null {
  const role = roleFromDb(m.role);
  if (m.isStaff || !role) return null;
  const endYear = m.contractEnd ? Number(m.contractEnd.slice(0, 4)) : null;
  return {
    id: m.personId,
    pseudo: m.handle,
    realName: m.realName ?? '',
    country: countryCode(m.country) ?? '',
    role,
    age: ageAt(m.birthdate, today) ?? 0,
    photo: m.photoFile ? assetUrl(m.photoFile) : undefined,
    champions: m.topChampions.map((key) => ({ name: key, icon: championIcon(key) })),
    contractEnd: monthYear(m.contractEnd) ?? '—',
    contractEndsThisYear: endYear === Number(today.slice(0, 4)),
    ...extras,
  };
}

/** Un membre du staff de la base, pour la liste du staff. */
export function toStaff(m: RosterMember): { id: string; name: string; realName: string; role: string; photo?: string } {
  return {
    id: m.personId,
    name: m.handle,
    realName: m.realName ?? '',
    role: m.role === 'Coach' ? 'Coach' : m.role,
    photo: m.photoFile ? assetUrl(m.photoFile) : undefined,
  };
}
