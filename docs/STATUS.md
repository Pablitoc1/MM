# État du projet

Mis à jour à la fin de chaque jalon.

## Jalon en cours
Aucun. M1 · Base de données et import réel validé par Yahia le 11 novembre 2026 (PR #4 et #5).
Prochain jalon : M2, à lancer quand Yahia dit « go M2 ».

## Ce qui marche
- Workspace Rust : `mm-data`, `mm-engine`, `mm-world`, `mm-app` (Tauri 2).
- Générateur déterministe `SimRng` (moteur) et date du jeu `GameDate` (monde).
- Base de départ `data/seed/world.sqlite` (schéma v1), reconstruite par `just seed` :
  - 42 ligues tier 1 à 3 (liste dans `data/leagues.toml`), 377 clubs, 2 562 joueurs et membres du staff
    avec pays, date de naissance et fin de contrat (Leaguepedia) ;
  - stats pro 2025 par joueur et par tournoi, et champions joués (Leaguepedia) ;
  - 172 champions, objets et sorts d'invocateur du patch 26.1, en français (Data Dragon 16.1.1) ;
  - logos des 12 clubs LEC et 86 photos (Liquipedia), icônes des champions.
- Commandes Tauri `leagues`, `teams`, `roster` ; la base est livrée dans l'installateur.
- Écran Effectif : n'importe quel club LEC, joueurs et staff réels, âge, champions, stats 2025, fin de contrat.
- `just check`, `just seed`, `just demo M0|M1`, CI GitHub (contrôles + installateurs Windows, Mac, Linux).
- Lien de test web sur chaque PR, et mise à jour automatique du jeu installé à chaque fusion
  dans `main` (décision 008).

## Ce qui manque (prochain jalon)
M2 · Notes des joueurs (attributs calculés à partir des stats).
Pistes ouvertes par M1 : stats avancées d'Oracle's Elixir (réseau bloqué), photos des autres ligues.

## Décisions prises
Voir `docs/decisions/`.
