# Esport Manager

Jeu de gestion esport (League of Legends, LEC 2026) : Tauri + React + Rust + SQLite.

- Règles du projet et point d'entrée pour un agent : [CLAUDE.md](CLAUDE.md)
- Où on en est : [docs/STATUS.md](docs/STATUS.md)
- Le plan par jalons : [docs/PLAN.md](docs/PLAN.md)

## Lancer le projet

Prérequis : Rust stable, Node 22, [just](https://github.com/casey/just) et les
[prérequis système de Tauri](https://tauri.app/start/prerequisites/).

```sh
just check   # tous les contrôles
just dev     # l'application
```

## Tester et mettre à jour

- **Une PR** : un lien « version web » est posté en commentaire de la PR. Il s'ouvre dans le
  navigateur, sans rien installer. Les installateurs de la PR sont aussi dans l'onglet Actions.
- **Le jeu installé** : chaque fusion dans `main` publie une nouvelle version. Au lancement, le
  jeu la propose dans un bandeau « Mettre à jour ». Il suffit de l'installer une seule fois depuis
  la page [Releases](https://github.com/Pablitoc1/MM/releases/latest).
