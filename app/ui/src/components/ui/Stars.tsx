import { useId } from 'react';
import { clamp } from './tone';

const STAR = 'M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z';

export interface StarsProps {
  /** Note de 0 à 5, par demi-étoile (3,5 = trois étoiles et demie). */
  value: number;
  size?: number;
}

/** Étoiles or façon Niveau / Potentiel (tableau de l'effectif, staff). */
export function Stars({ value, size = 13 }: StarsProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const v = Math.round(clamp(value, 0, 5) * 2) / 2;
  const label = `${String(v).replace('.', ',')} sur 5`;
  return (
    <span className="ui-stars" role="img" aria-label={label}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = clamp(v - i, 0, 1); // 1 pleine, 0,5 moitié, 0 vide
        const id = `ui-star-${uid}-${i}`;
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
            {fill === 0.5 && (
              <defs>
                <clipPath id={id}><rect width="12" height="24" /></clipPath>
              </defs>
            )}
            <path d={STAR} fill="var(--border-strong)" />
            {fill > 0 && (
              <path d={STAR} fill="var(--accent-gold)" clipPath={fill === 0.5 ? `url(#${id})` : undefined} />
            )}
          </svg>
        );
      })}
    </span>
  );
}
