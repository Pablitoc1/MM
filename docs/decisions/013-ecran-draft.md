# 013 · Écran Draft branché

Date : 2026-11-11. Fil « Construire la draft » (partie draft de M7, en avance).

## Choix
- L'écran reprend la maquette v2 (`app/ui/src/vitrine/ecrans/Draft.tsx`) avec les données
  de `world::draft::Session` : bans, picks, grille des champions du joueur au poste regardé,
  composition, courbe de puissance, conseil du coach, « Ce que G2 prépare ».
- Le club du joueur est toujours à gauche (couleur « nous »), comme dans le match en direct.
- Plein écran comme le match en direct, avec un bouton retour (absent de la maquette).
- Le conseil du coach et « Déléguer » donnent le même champion : un tirage `SimRng` par tour,
  à partir de la graine de la draft.
- 30 s par choix : à zéro, le coach choisit à la place du joueur.
- Tour de ban : la grille montre les 10 bans conseillés, la lettre est le rang sur le patch.
- Match de démonstration KC (bleu) contre G2, le 17 janvier 2026 (patch 26.1), tant que le
  calendrier n'existe pas (M9).
- Hors de Tauri (navigateur, lien de test, captures), le Rust ne tourne pas : l'écran rejoue
  `data/seed/public/draft-demo.json` (`just draft-demo`), où chaque choix suit le conseil.
  Seuls ce choix et « Déléguer » avancent ; changer de poste ne recalcule pas la grille.

## Reste à faire
- Brancher la composition finale sur le moteur (`lineup_from_picks`, fil du moteur) pour
  que la draft change le match.
- Séries Fearless (Bo3, Bo5) avec le calendrier (M9).
