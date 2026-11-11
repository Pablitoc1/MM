# État du projet

Mis à jour à la fin de chaque jalon.

## Jalon en cours
M3 · Carte et déplacements : lancé avec l'accord de Yahia dans le fil « Construire le moteur de match » (puis M4 et M5).
Dernier jalon terminé : M2 · Notes des joueurs, validé par Yahia le 11 novembre 2026 (PR #12 et #13).

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
- Notes des joueurs (M2, note 007) : niveau et potentiel /100, 15 attributs /20, calculés sur toutes
  les parties pro 2014-2025 d'Oracle's Elixir (fichiers dans `data/raw/oracles/`, téléchargés à la main) :
  écarts entre ligues, Elo mondial des équipes, apport face aux coéquipiers, courbe de progression par âge.
  75 = joueur moyen de LEC ; meilleurs mondiaux vers 95-97. Fourchette quand la note est incertaine.
- Fiche joueur (aperçu, attributs, champions, statistiques, contrat), ouverte depuis l'Effectif,
  qui affiche aussi niveau et potentiel.
- `just check`, `just seed`, `just demo M0|M1|M2`, CI GitHub (contrôles + installateurs Windows, Mac, Linux).
- Lien de test web sur chaque PR, et mise à jour automatique du jeu installé à chaque fusion
  dans `main` (décision 009).

## En parallèle (préparation de M6, hors plan)
Vue 2D du match sur un faux match scripté : écran « Match en direct », format du flux
(note 003), captures dans `docs/demo/vue-2d/` (`just demo vue-2d`). Le plan ne change pas.
Écran complet autour de la carte (tableau de score, cartes des 10 joueurs, courbe d'or, fil du match),
monté sur les composants d'interface préparés à part.

## M3 · où on en est
Moteur seconde par seconde : carte en réseau de points, vagues, tours, camps, farm, vision et balises,
flux de la vue 2D (note 009). `just sim KC G2 --n 100` compare les CS, l'or et l'XP à la LEC 2025
(rapport dans `docs/demo/M3/`). L'écran Match en direct joue une partie du moteur (app : simulée à la
demande ; navigateur : partie KC–G2 graine 1, `data/seed/public/match-demo.json`).
Les attributs des notes M2 sont lus par le moteur (farm et mécanique en M3).

## Ce qui manque
M3 en cours (voir plus haut), puis M4 · Combat et M5 · IA d'équipe.
Pistes ouvertes : photos des autres ligues ; palmarès (titres) dans les notes ; carrière à d'autres
postes (Rekkles noté sur ses seules parties de support) ; les notes n'évoluent pas encore (M10).

## Décisions prises
Voir `docs/decisions/`.
