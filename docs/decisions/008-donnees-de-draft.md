# 008 · Données de la draft

Date : 11 novembre 2026. Partie draft du jalon M7, construite en avance avec l'accord de
Yahia (en parallèle du moteur, comme la vue 2D).

## Source
Les CSV d'Oracle's Elixir (`data/raw/oracles/`, 2016-2026), déjà utilisés pour les notes.
Chaque partie donne, par équipe, les 5 bans et les 5 picks dans l'ordre, le côté, et
le champion et le rôle de chaque joueur. `just seed-draft` refait seulement ces tables
dans la base existante, sans réseau, en une dizaine de secondes.

## Tables
- `champion_meta` et `champion_meta_roles` : pour chaque patch de 2025 et 2026, picks,
  bans, victoires et rôles de chaque champion dans les ligues de tier 1 et les
  internationaux (MSI, Mondial, First Stand, EWC). Patch au format du jeu : « 16.02 »
  chez Oracle's Elixir devient « 26.2 ».
- `player_pool` : champions joués en compétition par chaque joueur de la base, toutes
  ligues, 2014-2025 (2026 est l'avenir pour le joueur). `mastery` = parties pondérées
  par leur ancienneté (demi-vie d'un an, estimé).
- `champion_profile` : ligues majeures 2024-2025, victoires selon la durée de la
  partie (moins de 29 min, 29 à 36, plus de 36) et écart d'or moyen à 10 et 15 min.
  Sert à la courbe de puissance.
- `pro_drafts` : les 5 400 vraies drafts des ligues majeures 2025-2026, remises dans
  l'ordre officiel (bans B R B R B R, picks B R R B B R, bans R B R B, picks R B B R).
  Servira au rapport sur l'adversaire (« Ce que G2 prépare ») et à la démo (l'IA comparée
  aux vraies drafts).

## Méthodes estimées
- Rang de la grille (A à D) : champions du patch triés par présence (picks + bans par
  partie) + 2 × (victoires lissées − 50 %), lissage de 20 parties fictives à 50 %.
  A = 12 premiers, B = 13 à 35, C = 36 à 70, D = le reste.
- Demi-vie de la maîtrise : un an.

## Pas encore là
- Part de dégâts physiques et magiques (Data Dragon, champ `info`) et styles des
  champions (engage, poke, peel, split, teamfight) : avec les règles et l'IA de draft.
- Choix de Yahia en attente : la saison 2026 du jeu suit-elle la vraie méta de chaque
  patch 2026, ou seulement la méta connue fin 2025 ? Les deux sont importées.
- « Locke », champion sorti en 2026, est absent de Data Dragon 16.1.1 : ses parties sont
  ignorées.
