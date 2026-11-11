# Plan de construction · version jouable

Copie du document de référence : https://claude.ai/artifact/TWWvquu9i993iBQmWTb5gY
(en cas d'écart, le document en ligne fait foi ; mettre cette copie à jour).

La version jouable est finie quand on peut jouer toute la saison LEC 2026 avec le club
de son choix, de début janvier à la fin des playoffs, sans plantage. Chaque match du
club est simulé par le moteur de positions et peut se regarder en 2D.

Décisions de Yahia : installateurs Windows **et** Mac ; tous les joueurs du monde
(ligues tier 1 à 3) importés dès M1 ; le match passe avant la gestion du club.

## Les jalons

### M0 · Socle du projet
- Résultat : dépôt, `CLAUDE.md`, structure, CI GitHub, application Tauri vide qui s'ouvre.
- Démo : l'app s'ouvre avec la barre du haut, le menu latéral, les couleurs et les polices des maquettes.
- Contrôle : `just check` vert en local et dans la CI.

### M1 · Base de données et import réel
- Résultat : schéma SQLite et import. Data Dragon (champions, sorts, objets). Leaguepedia (clubs et effectifs de toutes les ligues tier 1 à 3, staff, contrats, photos, logos). Oracle's Elixir (stats pro 2025).
- Démo : l'écran Effectif de n'importe quel club LEC, avec les vrais joueurs et leurs photos.
- Contrôle : les 10 clubs LEC et toutes les ligues tier 1 à 3, tous les champions du patch, aucun joueur LEC sans rôle ni club.

### M2 · Notes des joueurs
- Résultat : attributs calculés depuis les stats (formule dans `docs/decisions/`). Fiche joueur : aperçu, attributs, champions, stats, contrat.
- Démo : Yahia ouvre 10 joueurs qu'il connaît et juge si les notes sonnent juste.
- Contrôle : chaque attribut a une note pour chaque joueur ; un joueur peu connu affiche une fourchette.

### M3 · Carte et déplacements
- Résultat : vraie carte en graphe, vision, sbires, tours, camps, farm, à 1 s par tick. Pas encore de combat entre champions.
- Démo : rapport sur 100 parties de farm seul, CS à 10 min par rôle comparés aux vrais chiffres LEC.
- Contrôle : la même graine donne exactement la même partie.

### M4 · Combat
- Résultat : sorts, objets, dégâts réels ; tick de 0,25 s en combat ; morts, or, XP, niveaux.
- Démo : rapport sur 1 000 parties KC contre G2 (durée, kills, or) comparé aux vrais matchs.
- Contrôle : tests de chaque sort et de chaque objet calculé.

### M5 · IA d'équipe et objectifs
- Résultat : plan d'équipe toutes les 5 à 10 s, rotations, dragons, larves, Nashor, teamfights.
- Démo : tableau de calibration contre la LEC 2025 (durée, kills, premier sang, dragons, Nashors, taux de victoire du favori).
- Contrôle : chaque mesure dans la fourchette réelle sur 1 000 parties.

### M6 · Vue 2D du match
- Résultat : écran Match en direct de la maquette v2 en PixiJS ; vitesse x1 à x16.
- Démo : regarder un KC contre G2 complet.
- Contrôle : la partie affichée est identique à la même partie simulée sans interface.

### M7 · Draft et avant-match
- Résultat : tactique, rapport sur l'adversaire, plan de draft, avant-match, draft en direct (conseils du coach ou draft déléguée).
- Démo : une draft dont la composition change le match qui suit.
- Contrôle : ordre officiel de la draft et bans respectés.

### M8 · Séries, pause et après-match
- Résultat : Bo1, Bo3, Bo5 ; pause entre les parties (discours, plan, côté, remplacements) ; après-match (notes, MVP, moments clés).
- Démo : un Bo5 où les choix pendant la pause changent la partie suivante.
- Contrôle : le moral et le plan choisis sont transmis au moteur.

### M9 · Calendrier et saison
- Résultat : avancer jour par jour dans le calendrier LEC 2026 ; autres matchs en mode rapide ; classement, résultats, playoffs, fiche des autres clubs, patchs.
- Démo : une saison entière simulée d'un coup, champion et classement crédibles.
- Contrôle : la saison se simule sans erreur sur 50 graines.

### M10 · Le club au quotidien
- Résultat : accueil et boîte de réception, planning et entraînement individuel, moral, fatigue, discussions, discours, staff.
- Démo : une semaine d'entraînement change notes, fatigue et moral.
- Exigence de Yahia (11/11/2026) : de la variance dans l'évolution des joueurs. Certains dépassent leur
  potentiel, d'autres ne l'atteignent jamais ; pic plus tôt ou plus tard ; déclins et rebonds. Les carrières
  ne doivent pas se ressembler, tout en restant réalistes (calées sur les vraies carrières, note 007)
  et en gardant une part d'inconnu.
- Contrôle : les effets suivent les règles du document gestion.

### M11 · Mercato, finances et direction
- Résultat : recherche de joueurs, négociations de transfert et de contrat, IA des autres clubs, finances, objectifs de la direction.
- Démo : recruter un joueur ; la masse salariale bouge, la direction réagit.
- Contrôle : le budget ne passe jamais sous zéro sans conséquence.

### M12 · Version jouable 1.0
- Résultat : menu principal, nouvelle partie, sauvegardes, paramètres, installateurs Windows et Mac.
- Démo : Yahia joue une saison complète ; les bugs trouvés sont corrigés dans ce jalon.
- Contrôle : une partie sauvegardée puis rechargée continue à l'identique.
