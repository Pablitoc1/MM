# 004 · Base de départ livrée avec le jeu

Date : 11 novembre 2026.

## Ce qui est livré
- `data/seed/world.sqlite` : la base de départ, versionnée dans le dépôt et livrée dans
  l'installateur (ressource Tauri). L'application l'ouvre en lecture seule ; les
  sauvegardes (M8) seront des copies.
- `data/seed/public/` : icônes de tous les champions du patch 26.1, logos des clubs et
  photos des joueurs et du staff de la LEC (voir plus bas), et `apercu.json`, un extrait de la base
  pour faire tourner l'interface hors de Tauri (`just dev-web`, démos). Vite sert ce
  dossier tel quel.
- `data/raw/` (non versionné) : cache des réponses brutes. `just seed` le réutilise.

`just seed` reconstruit tout de zéro. Le schéma n'a donc pas encore de migrations
incrémentales : elles arriveront avec les sauvegardes (M8).

## Sources
- Leaguepedia (lol.fandom.com, licence CC BY-SA 3.0) via `Special:CargoExport` :
  effectifs, joueurs, staff, contrats, stats 2025.
- Liquipedia (liquipedia.net, licence CC BY-SA 3.0) via son API, en respectant ses
  règles (outil nommé, gzip, 2 s entre les requêtes) : photos et logos.
- Data Dragon 16.1.1 (patch 26.1, début de saison), en français : champions (avec sorts
  et statistiques complètes), objets, sorts d'invocateur.

## Écarts avec la fiche M1
- **Stats pro 2025 : Leaguepedia au lieu d'Oracle's Elixir.** Les fichiers d'Oracle's
  Elixir sont hébergés sur Google Drive, que le réseau de développement bloque.
  Leaguepedia donne les mêmes chiffres de base par match (KDA, CS, or, dégâts, vision,
  durée), agrégés par joueur et par tournoi pour toute l'année 2025. Les stats avancées
  d'Oracle's Elixir (GD@15, XPD@15, etc.) seront utiles pour les notes (M2) : à ajouter
  à ce moment-là si l'accès réseau est ouvert.
- **Contrats.** Leaguepedia ne garde que la date de fin de contrat actuelle (vue de
  novembre 2026), pas l'historique. La date affichée est donc celle connue aujourd'hui,
  qui peut différer de celle de janvier 2026 pour un joueur prolongé entre-temps.
  Pas de salaires : ils seront estimés en M11 (marqués `// estimé`).
- **Photos et logos : LEC seulement** pour garder la base légère. Les autres ligues
  suivront quand leurs écrans en auront besoin.
- **Photos et logos : Liquipedia au lieu de Leaguepedia.** Le serveur d'images de
  Leaguepedia refuse les outils d'import qui se présentent comme tels, et on ne le
  contourne pas. Liquipedia les accepte. 9 personnes de la LEC restent sans photo
  (surtout du staff, et deux homonymes qu'on préfère ne pas confondre) : l'écran
  affiche leur initiale.
- **Ligues retirées** de la liste : LVP SuperLiga (remplacée par la LES en 2026),
  LFL Division 2 (fondue dans la LFL en 2026), Liga Valkyria (que des qualifications).
  Il reste 42 ligues.
- **12 clubs en LEC** (et non 10) : le LEC Versus 2026 compte deux invités,
  Karmine Corp Blue et Los Ratones.
