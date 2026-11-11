# 012 · IA de draft

Date : 11 novembre 2026. Partie draft du jalon M7. S'appuie sur les règles et la
connaissance du patch de la note 011.

## Poids, estimés (`crates/world/src/draft/ai.rs`)
- Pick : force sur le patch × part du poste + 0,9 × aisance du joueur − 0,35 si le
  joueur ne l'a presque jamais joué + 2 × avantage en duel + équilibre des dégâts
  (pénalité au-delà de 70 % d'un type) + cohérence de style + 0,1 si flexible
  + 0,25 × privation (champion favori d'un adversaire encore sans pick).
- Force sur le patch = présence + 1,5 × (victoires − 50 %) + 0,3 × rang (A = 1).
- Ban : valeur du champion pour l'adversaire à son meilleur poste encore libre,
  moins la moitié de ce qu'il vaut pour nous.
- Erreur du coach : écart-type de 0,05 (meilleur coach) à 0,40 (plus faible) sur la
  note, parmi les 15 meilleurs choix. Tirages par `SimRng` : même graine, même draft.
- La même IA sert à l'adversaire, à « Déléguer » et au « Conseil du coach ».

## Vérification
`just rapport-draft` rejoue les 308 vraies drafts de la LEC 2025 et regarde, à chaque
tour, si le vrai choix est dans les 5 premiers de l'IA (équipes vues sans leurs
champions favoris) : picks 36 %, bans 36 %, contre 25 % et 33 % pour un simple
classement par présence. Détail dans `docs/demo/draft/rapport-ia.md`.
