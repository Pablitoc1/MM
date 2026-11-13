# 015 · Bâtiments, vagues poussées et fin de partie (M5a)

Date : 13 novembre 2026. Code : `crates/engine/src/sim/siege.rs`, `crates/engine/src/waves.rs`,
`crates/engine/src/rules.rs` (chiffres), `laning` et `think` dans `crates/engine/src/sim.rs`.

## Ce que font les champions
- **Pousser sa vague** : un joueur de voie frappe la vague adverse avec ses attaques et ses sorts de
  dégâts (un sort de zone touche 3 sbires, un projectile 1,5 ; estimés), en dépensant son mana. Il
  pousse quand son vis-à-vis n'est pas là, avant de rentrer à la base, et toujours après 14:00.
  Les sbires qu'il tue ainsi sont à lui (CS et or).
- **Frapper un bâtiment** : seulement quand sa vague est au pied (elle prend les tirs de la tour),
  qu'aucun adversaire n'est à moins de 1 400 unités et qu'il a plus de 45 % de ses PV (estimés).
  Attaques seulement, réduites par 40 d'armure (estimé, wiki).
- **Laisser une tour** : un joueur dominé autour de sa tour recule 1 300 unités derrière elle au
  lieu de mourir en la défendant seul (estimé).
- **Défendre la base** : une vague adverse au pied d'un bâtiment de la base (tour d'inhibiteur,
  inhibiteur, tours du Nexus, Nexus) fait venir le joueur de cette voie et tous les champions à moins
  de 6 000 unités.

## Règles du jeu (wiki, saison 2025, estimées)
- Plaques : 5 par tour extérieure, une tous les 1 000 PV perdus, 250 or partagés entre les champions
  proches (même si ce sont les sbires qui la font tomber), jusqu'à 14:00.
- Or des bâtiments (local partagé entre les champions à moins de 1 500 unités, plus un or pour
  chaque membre de l'équipe) : tour extérieure 250 ; intérieure 300 + 50 ; d'inhibiteur 250 + 50 ;
  du Nexus 50 ; inhibiteur 50.
- Inhibiteur : revient 5 minutes après sa chute. Tant qu'il est tombé, chaque vague adverse de sa voie
  porte un super sbire à la place du canon (deux si l'équipe a perdu au moins deux inhibiteurs).
- La partie se finit quand un Nexus tombe.

## Correction
L'événement `structure` du flux portait l'équipe à qui appartenait le bâtiment ; la vue 2D lit
l'équipe qui l'a détruit. Le moteur envoie maintenant l'équipe qui détruit. Le nouvel événement
`structure_respawn` dit à la vue qu'un inhibiteur est revenu.

## Résultat (1 000 parties KC–G2, limite 60 min, `docs/demo/M5/rapport-batiments.md`)
| Mesure | Simulé | LEC 2025 |
|---|---|---|
| Tours détruites | 11,0 | 12,4 |
| Plaques | 5,9 | 8,0 |
| Inhibiteurs | 1,0 | 1,9 |
| Kills par minute | 0,73 | 0,81 |

Les kills viennent surtout de la voie du bas (trop) et pas assez du haut et de la jungle : les ganks
arrivent en M5b. Seules 17 % des parties se finissent avant 60 min, en 53 min en moyenne (33,6 en
LEC) : sans plan d'équipe, personne ne se regroupe pour finir. C'est l'objet de M5c.
