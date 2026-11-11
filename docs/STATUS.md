# État du projet

Mis à jour à la fin de chaque jalon.

## Jalon en cours
M0 · Socle du projet : en attente de validation par Yahia.

## Ce qui marche
- Workspace Rust : `mm-data`, `mm-engine`, `mm-world`, `mm-app` (Tauri 2).
- Générateur déterministe `SimRng` (moteur) et date du jeu `GameDate` (monde).
- Interface React : barre du haut, menu latéral, Accueil de démonstration aux couleurs des maquettes v2.
  La date de la barre du haut vient du Rust via la commande Tauri `world_info`.
- `just check` (Rust + interface), `just demo M0`, CI GitHub (contrôles + installateurs Windows, Mac, Linux).

## Ce qui manque (prochain jalon)
M1 · Base de données et import réel : schéma SQLite, import Data Dragon, Leaguepedia (toutes les ligues tier 1 à 3), Oracle's Elixir.

## Décisions prises
Voir `docs/decisions/`.
