# Toutes les commandes du projet. `just` seul liste les commandes.
set windows-shell := ["powershell.exe", "-NoLogo", "-Command"]

default:
    @just --list

# Formatage, lint et tous les tests. Doit être vert avant chaque PR.
check: check-rust check-ui

check-rust:
    cargo fmt --all -- --check
    cargo clippy --workspace --all-targets -- -D warnings
    cargo test --workspace

check-ui:
    cd app && npm ci --silent
    cd app && npm run typecheck
    cd app && npm run lint
    cd app && npm test

# Lance l'application en mode développement (fenêtre Tauri).
dev:
    cd app && npm install --silent && npm run tauri dev

# Lance seulement l'interface dans un navigateur (http://localhost:1420).
dev-web:
    cd app && npm install --silent && npm run dev

# Télécharge les vraies données et reconstruit data/seed/world.sqlite.
# Les réponses sont gardées dans data/raw/ (supprime ce dossier pour tout retélécharger).
seed:
    cargo run --release -p mm-data --features import --bin seed

# Refait seulement les données de la draft (CSV d'Oracle's Elixir dans data/raw/oracles/).
seed-draft:
    cargo run --release -p mm-data --features import --bin seed -- --draft

# Refait seulement les sorts des champions (CommunityDragon, patch 26.1).
seed-kits:
    cargo run --release -p mm-data --features import --bin seed -- --kits

# L'IA de draft rejouée sur les vraies drafts de la LEC 2025 (docs/demo/draft/rapport-ia.md).
rapport-draft:
    cargo run --release -p mm-world --bin rapport-draft

# Draft de démonstration KC – G2 pour l'écran Draft hors de Tauri (data/seed/public/draft-demo.json).
draft-demo:
    cargo run --release -p mm-world --bin draft-demo

# Simule des parties sans interface et les compare à la LEC 2025.
# Exemple : just sim KC G2 --n 100 --report docs/demo/M3/rapport-farm.md --replay partie.json
sim *args:
    cargo run --release -q -p mm-world --bin sim -- {{args}}

# Prépare la démo de validation d'un jalon (captures dans docs/demo/<jalon>/).
demo milestone:
    cd app && npm run build
    node tools/demo.mjs {{milestone}}

# Fabrique l'installateur pour la machine courante.
bundle:
    cd app && npm ci --silent && npm run tauri build
