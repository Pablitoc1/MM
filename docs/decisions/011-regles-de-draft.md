# 011 · Règles de la draft et connaissance du patch

Date : 11 novembre 2026. Partie draft du jalon M7 (suite de la note 008).
L'IA de draft, qui s'appuie sur ces règles et cette connaissance, fait l'objet de la note 012.

## Règles (`crates/world/src/draft/mod.rs`)
- Ordre officiel des tournois : bans B R B R B R, picks B R R B B R, bans R B R B,
  picks R B B R. 30 s par choix.
- Draft Fearless en série, comme en LEC : un champion joué dans une partie de la série
  est interdit aux deux équipes pour les parties suivantes. Les bans ne comptent pas.
- Chaque pick est rattaché à un poste ; un poste ne prend qu'un champion.
- Sortie pour le moteur : 5 `Pick { role, person_id, champion }` par côté, dans l'ordre
  des postes (convenu avec le moteur, qui les lit dans `lineup_from_picks`).
- Postes : `mm_engine::Role`, celui du moteur et de la vue 2D.

## Connaissance (`knowledge.rs`)
- Méta du patch en vigueur à la date du match (patch 2026 réel, choix de Yahia).
- Duels en ligne : vraies parties des ligues majeures depuis 2025, jouées avant la date
  du match, lissés vers 50 % avec 10 parties fictives.
- Champions des titulaires (`player_pool`), aisance = 1 − e^(−maîtrise / 5) : une
  dizaine de parties récentes donnent 0,85.
- Niveau de draft du coach : 0,5 pour tous tant que le staff n'a pas de notes (M10).

## Styles et compo (`styles.rs`), estimés
- Engage, poke, peel, split push, teamfight : listes écrites à la main d'après le jeu pro
  récent ; sinon une valeur moyenne selon les classes Data Dragon.
- Part physique : notes d'attaque et de magie de Data Dragon.
- Courbe de puissance : victoires réelles selon la durée de la partie (2024-2025),
  plus l'or d'avance à 15 min pour le début.

## Contrôles
- Tests des règles : ordre officiel (10 bans, 5 picks par côté), tour, champion banni,
  déjà choisi ou interdit par le Fearless, poste déjà pris.
- Tests sur la vraie base : méta du patch 26.1 au début de saison (12 champions de rang A),
  pas de duel venu de l'avenir, chaque club LEC a 5 titulaires avec leurs champions joués.
