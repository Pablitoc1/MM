# État du projet

Mis à jour à la fin de chaque jalon.

## Jalon en cours
Aucun. M0 · Socle du projet validé par Yahia le 11 novembre 2026 (installateur testé sur son ordinateur).
Prochain jalon : M1, à lancer quand Yahia dit « go M1 ».

## Ce qui marche
- Workspace Rust : `mm-data`, `mm-engine`, `mm-world`, `mm-app` (Tauri 2).
- Générateur déterministe `SimRng` (moteur) et date du jeu `GameDate` (monde).
- Interface React : barre du haut, menu latéral, Accueil de démonstration aux couleurs des maquettes v2.
  La date de la barre du haut vient du Rust via la commande Tauri `world_info`.
- `just check` (Rust + interface), `just demo M0`, CI GitHub (contrôles + installateurs Windows, Mac, Linux).

## En parallèle (préparation de M6, hors plan)
Vue 2D du match sur un faux match scripté : écran « Match en direct », format du flux
(note 003), captures dans `docs/demo/vue-2d/` (`just demo vue-2d`). Le plan ne change pas.

## Ce qui manque (prochain jalon)
M1 · Base de données et import réel : schéma SQLite, import Data Dragon, Leaguepedia (toutes les ligues tier 1 à 3), Oracle's Elixir.

## Décisions prises
Voir `docs/decisions/`.
