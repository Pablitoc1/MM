# Esport Manager : règles du projet

Jeu de gestion esport façon Football Manager, League of Legends d'abord (LEC 2026).
Le propriétaire du projet est Yahia. Il parle français : toute la communication,
les textes du jeu, les messages de commit et les PR sont en français.

## À lire avant tout travail, dans cet ordre
1. Ce fichier.
2. `docs/STATUS.md` : où on en est.
3. La fiche de ton jalon dans `docs/PLAN.md`.

## Boucle d'un jalon
1. Ne commence un jalon que si Yahia a donné son feu vert (« go M<n> »).
2. Écris un mini-plan de 10 lignes maximum en tête de la PR. Un choix qui change le jeu : demande à Yahia avant de coder.
3. Branche `m<n>-<nom>`, code et tests, jusqu'à `just check` vert.
4. PR : ce qui est fait, comment voir la démo (`just demo M<n>`, captures dans `docs/demo/M<n>/`), écarts avec la fiche.
5. Fusion seulement après la validation de Yahia.
6. Mets à jour `docs/STATUS.md` et ajoute une note dans `docs/decisions/` pour chaque choix pris.

## Règles qu'on ne contourne jamais
- Un jalon = une branche = une PR. Au-delà d'environ 1 500 lignes, découpe (M4a, M4b).
- Ne commence jamais le jalon suivant, même en avance.
- Données réelles uniquement. Un chiffre estimé est marqué `// estimé` dans le code avec sa source ou sa méthode.
- Ne désactive jamais un test pour passer au vert.
- Nouvelle grosse dépendance : à justifier dans la PR.
- Le moteur (`crates/engine`) reste en Rust pur, sans interface ni I/O, et déterministe :
  tout aléatoire passe par `SimRng`. La même graine donne la même partie.

## Organisation
- `crates/data` : schéma SQLite, migrations, import des données réelles.
- `crates/engine` : moteur de match (agents, carte, combat). Aucune dépendance vers `world` ou l'app.
- `crates/world` : calendrier, gestion, IA des clubs, sauvegardes. Dépend de `engine` et `data`.
- `app/src-tauri` : commandes Tauri, seul lien entre le Rust et l'interface.
- `app/ui` : React + TypeScript. Style : variables de `app/ui/src/styles/tokens.css` (couleurs des maquettes v2), jamais de couleur en dur ailleurs.
- `tools/` : scripts (démo, import).

## Commandes
- `just check` : formatage, clippy, tests Rust, typecheck, lint et tests de l'interface.
- `just dev` : l'application Tauri en développement. `just dev-web` : l'interface seule dans le navigateur.
- `just demo M<n>` : captures de démo (Playwright requis).
- `just seed`, `just sim` : arrivent en M1 et M3.

## Références (documents de conception, en français)
- Plan de construction : https://claude.ai/artifact/TWWvquu9i993iBQmWTb5gY
- Vision : https://claude.ai/artifact/DxTKBDRPS4XnXAQ1Z7m4ob
- Base de données : https://claude.ai/artifact/7Fv8BKakxEXHJFYARGZNz1
- Moteur de match : https://claude.ai/artifact/SEv1G5SSXMSferZfUey6Kf
- Gestion : https://claude.ai/artifact/AKKrShNMz1EbABBeCRzudh
- Liste des écrans : https://claude.ai/artifact/GzSW1Xry39gKazMvygdxA7
- Maquettes v2 : https://claude.ai/artifact/LxeBXNz4GqtdnjL3QuzeAR
