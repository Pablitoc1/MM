# 016 · Grands objectifs, ganks et équilibre des côtés (M5b)

Date : 13 novembre 2026. Code : `crates/engine/src/sim/objectives.rs` (règles et chiffres),
`jungle_plan`, `jungle` et `joins_objective` dans `crates/engine/src/sim.rs`, `crates/engine/src/map.rs`,
`crates/engine/src/geo.rs`, `crates/engine/src/waves.rs`.

## Les monstres (wiki, saison 2025, estimés)
- **Dragons** : premier à 5:00, puis toutes les 5 min, un des six élémentaires au hasard. Chacun donne
  +4 % de dégâts à l'équipe (moyenne des six bonus) ; le 4ᵉ donne l'âme (+12 %), et le dragon suivant
  est l'**ancestral** (6 min après) : +35 % pendant 2 min 30.
- **Larves du Néant** : vague de 3 à 6:00, une seconde 4 min après sa prise si elle peut apparaître
  avant 13:45. Chaque larve : +8 % de dégâts aux bâtiments.
- **Héraut de la faille** : à 15:00, jusqu'à 24:45. Pris, il charge la première tour adverse debout
  (milieu, puis haut, puis bas) : 3 000 dégâts.
- **Nashor** : à 25:00, revient 6 min après sa prise. +15 % de dégâts pendant 3 min, 300 or à chaque
  membre vivant, sbires renforcés (dégâts ×2,5 aux bâtiments, ×1,5 aux vagues).
- 300 XP à chaque participant. Le jungler achève au châtiment (1 200 dégâts) ; un jungler adverse à
  moins de 1 200 unités le vole une fois sur dix environ (selon la mécanique des deux).

## Qui y va
- Le **jungler** choisit toutes les 8 s entre farmer, un objectif et un gank. Il part sur un objectif
  présent (ou dans 30 s) si son équipe a au moins autant de joueurs disponibles autour (vivants, pas
  en retour à la base, à moins de 9 000 unités, rôles concernés) que l'autre. Il lâche quand
  l'adversaire en a nettement plus.
- **Nashor et ancestral** : seulement avec un adversaire mort et un joueur disponible de plus, et on
  lâche dès que l'avantage disparaît.
- **Larves** : à chaque vague, chaque équipe décide une fois si elle la joue (62 %, calé sur les
  4,6 larves par partie en LEC 2025).
- Les **joueurs de voie** (bas, support et milieu pour le dragon ; haut et milieu pour la fosse du
  haut) ne quittent leur vague qu'au dernier moment : monstre là dans moins de 10 s et jungler à
  moins de 3 000 unités de la fosse. S'ils arrivent moins nombreux que l'adversaire déjà dans la
  fosse, ils attendent les autres en retrait.
- Le monstre n'est frappé que par l'équipe seule dans la fosse, et venue pour lui : deux équipes
  dans la fosse se battent d'abord.
- **Gank** : un adversaire de voie loin de sa tour, face à un coéquipier présent, à moins de
  6 000 unités de trajet. Chance 12 % à chaque choix, plus ou moins selon la lecture de la carte et
  l'escarmouche du jungler. Abandon après 35 s ou si la cible rentre sous sa tour.

## Équilibre bleu / rouge
Avec les objectifs, le côté bleu gagnait 80 à 90 % des parties. Trois défauts du moteur, corrigés :
1. **Chemins de la jungle rouge** : les liaisons sont décrites pour la moitié bleue et reflétées,
   mais une liaison « vers la voie du haut » restait vers le haut au lieu de devenir le bas. La jungle
   rouge avait des raccourcis à travers les murs et pas d'accès à sa voie du bas.
2. **Vagues de sbires** : la vague bleue avançait avant la rouge à chaque seconde, et les vagues se
   rencontraient plus près de la tour rouge. Les deux avancent maintenant en même temps.
3. **Accès au dragon** : par reflet, le côté rouge de la voie du bas avait un accès direct au dragon
   et le côté bleu non. Le côté bleu remonte maintenant la rivière depuis sa voie.

Puis la carte du moteur est rendue **exactement symétrique** : la moitié rouge (voies, tours,
inhibiteurs, Nexus, camps, Nashor) est le reflet de la moitié bleue relevée sur la minimap. Le relevé
s'en écartait de 7 à 217 unités. La vue 2D utilise les mêmes positions.

Résultat, en miroir (même équipe, mêmes champions des deux côtés, 9 clubs × 200 parties) : le bleu
gagne 54,4 % (LEC 2025 : 56 %, avec des drafts différentes). Dragons 2,98 bleu contre 2,55 rouge ;
larves 2,37 contre 2,39. En LEC le rouge prend un peu plus de dragons (2,45 contre 2,32) et le bleu
bien plus de larves (2,86 contre 1,71) : ces préférences de côté viennent de la draft et des
habitudes d'équipe, pas de la carte. Elles pourront être ajoutées avec le plan d'équipe (M5c).

## Résultat (1 000 parties KC–G2, limite 60 min, `docs/demo/M5/rapport-objectifs.md`)
| Mesure | Simulé | LEC 2025 |
|---|---|---|
| Dragons élémentaires | 5,4 | 4,8 |
| Larves | 4,8 | 4,6 |
| Hérauts | 1,0 | 1,0 |
| Nashors | 3,1 | 1,2 |
| Ancestraux | 2,0 | 0,1 |
| Victoires du bleu | 62 % | 56 % |
| Durée | 46 min | 33,6 min |

Les objectifs sont pris au bon rythme quand ils sont là ; il y en a trop parce que les parties
durent 46 min au lieu de 34 (Nashor et ancestral n'existent qu'en fin de partie). Raccourcir les
parties, c'est le plan d'équipe de M5c : se regrouper après un Nashor pour finir.
