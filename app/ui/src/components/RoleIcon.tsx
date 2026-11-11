// Icône de poste de l'écran Effectif. Le dessin vient du composant partagé
// `components/ui` (maquettes v2) ; ici on traduit les postes de la base.
import { RoleIcon as UiRoleIcon, roleFromDb } from './ui';

export const ROLE_LABEL: Record<string, string> = {
  Top: 'Top', Jungle: 'Jungle', Mid: 'Mid', Bot: 'ADC', Support: 'Support', Coach: 'Coach',
};

export function RoleIcon({ role, size = 20 }: { role: string; size?: number }) {
  const r = roleFromDb(role);
  if (!r) return null;
  return (
    <span className="role-icon" style={{ display: 'inline-flex' }}>
      <UiRoleIcon role={r} size={size} color="currentColor" />
    </span>
  );
}
