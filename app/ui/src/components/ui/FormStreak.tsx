import type { Result } from './types';

/** Pastilles V / D des derniers matchs, du plus ancien au plus récent. */
export function FormStreak({ results }: { results: Result[] }) {
  const v = results.filter((r) => r === 'V').length;
  return (
    <span className="ui-streak" role="img" aria-label={`Forme : ${v} victoires, ${results.length - v} défaites`}>
      {results.map((r, i) => (
        <span key={i} className={r === 'V' ? 'ui-streak__v' : 'ui-streak__d'} aria-hidden="true">{r}</span>
      ))}
    </span>
  );
}
