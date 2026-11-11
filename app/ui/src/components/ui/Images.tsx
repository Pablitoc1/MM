// Images du jeu : photo de joueur, icône de champion, logo de club.
// Sans image (données pas encore importées, fichier manquant), on montre
// des initiales : l'écran reste lisible.
import { useState } from 'react';

function initiales(name: string): string {
  const parts = name.trim().split(/[\s'-]+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (/^[A-Z0-9]{2,3}$/.test(parts[0])) return parts[0]; // « G2 Esports » → G2
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

interface ImgProps {
  name: string;
  src?: string;
  size?: number;
  radius: number | string;
  className?: string;
  border?: string;
  /** Texte alternatif ; vide = image décorative (le nom est déjà écrit à côté). */
  alt?: string;
}

function ImageOrInitials({ name, src, size = 40, radius, className, border, alt }: ImgProps) {
  const [broken, setBroken] = useState(false);
  const style = { width: size, height: size, borderRadius: radius, border };
  if (!src || broken) {
    return (
      <span className={`ui-img ui-img--empty ${className ?? ''}`} style={{ ...style, fontSize: Math.max(9, size * 0.32) }}
        role={alt ? 'img' : undefined} aria-label={alt || undefined} aria-hidden={alt ? undefined : true}>
        {initiales(name)}
      </span>
    );
  }
  return (
    <img className={`ui-img ${className ?? ''}`} src={src} alt={alt ?? ''} width={size} height={size}
      style={style} onError={() => setBroken(true)} />
  );
}

export interface PlayerPhotoProps {
  name: string;
  src?: string;
  size?: number;
  /** Couleur du contour (état du joueur) ; neutre par défaut. */
  ring?: string;
  /** Rond (listes) ou carré arrondi (en-tête de fiche). */
  shape?: 'round' | 'card';
  alt?: string;
}

export function PlayerPhoto({ name, src, size = 40, ring, shape = 'round', alt }: PlayerPhotoProps) {
  return (
    <ImageOrInitials name={name} src={src} size={size} alt={alt}
      radius={shape === 'round' ? '50%' : 10} className="ui-img--photo"
      border={shape === 'round' ? `2px solid ${ring ?? 'var(--border-strong)'}` : undefined} />
  );
}

export function ChampionIcon({ name, src, size = 24 }: { name: string; src?: string; size?: number }) {
  return <ImageOrInitials name={name} src={src} size={size} radius={size >= 32 ? 8 : 6} alt={name} />;
}

export function TeamLogo({ name, src, size = 34 }: { name: string; src?: string; size?: number }) {
  return <ImageOrInitials name={name} src={src} size={size} radius={6} className="ui-img--logo" alt={`Logo ${name}`} />;
}
