# 008 · Liens de test et mise à jour automatique

Date : 11 novembre 2026. Demandé par Yahia (« on fait les 2 pour simplifier le process »).

## Problème
Pour tester une PR, il fallait télécharger et réinstaller le jeu à chaque fois.

## Choix
- **Lien de test web par PR** (`.github/workflows/apercu-web.yml`) : chaque PR construit
  l'interface et la publie sur GitHub Pages, dans `pr/pr-<numéro>/`. Le lien est posté en
  commentaire de la PR et retiré à sa fermeture. La version de `main` est publiée à la racine.
  Dans le navigateur, l'interface lit `apercu.json` à la place de la base SQLite (déjà le cas
  avec `just dev-web`). Limite : ce qui tourne en Rust (moteur de match à partir de M3) ne
  tourne pas dans le navigateur. On décidera à ce moment-là entre compiler le moteur pour le
  web (WASM) ou tester ces parties dans le jeu installé.
- **Mise à jour automatique** (plugin `updater` de Tauri) : chaque fusion dans `main` fabrique
  une version `0.1.<n>` (`.github/workflows/version.yml`), signée, publiée en release GitHub
  avec `latest.json`. Au lancement, le jeu installé la propose dans un bandeau
  « Mettre à jour / Plus tard ». Rien ne s'installe sans un clic.
- Mac : une seule app universelle (Intel et Apple). Windows : installateur NSIS en mode passif.
- Le jeu n'étant pas signé chez Apple ni Microsoft, seule la première installation affiche
  l'avertissement du système ; les mises à jour passent par l'app et ne le montrent pas.

## Clé de signature
La clé publique est dans `app/src-tauri/tauri.conf.json`. La clé privée est un secret GitHub
(`TAURI_SIGNING_PRIVATE_KEY`), sans mot de passe. La perdre empêche de publier des mises à jour
pour les jeux déjà installés (il faudrait réinstaller une fois).

## Hébergement
GitHub Pages et le téléchargement des releases ne marchent gratuitement que pour un dépôt
public. Choix soumis à Yahia : dépôt public (recommandé, rien à créer) ou dépôt privé avec un
hébergement à part.

## Dépendances ajoutées
`tauri-plugin-updater`, `tauri-plugin-process` (Rust) et leurs paquets JS : plugins officiels
de Tauri, nécessaires à la mise à jour et au redémarrage.
