// Adresses des images du match : celles livrées avec la vue (minimap, camps, sbires)
// et celles de la base de départ (champions, objets, sorts d'invocateur, logos, photos).
import { assetUrl, championIcon } from '../api';

const LOCAL = import.meta.glob('./assets/**/*.{png,webp}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

/** Image livrée avec la vue, ex. « camps/baron.webp ». */
export function localAsset(path: string): string {
  const url = LOCAL[`./assets/${path}`];
  if (!url) throw new Error(`image manquante : ${path}`);
  return url;
}

export { championIcon };
export const itemIcon = (id: number) => assetUrl(`items/${id}.png`);
export const spellIcon = (id: string) => assetUrl(`spells/${id}.png`);

/** Icône d'un dragon selon sa variante (repli : drake infernal). */
export function dragonIcon(variant: string): string {
  return localAsset(variant === 'Océan' ? 'camps/dragon-ocean.webp' : 'camps/dragon.webp');
}
