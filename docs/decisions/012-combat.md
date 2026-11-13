# 012 · Combat entre champions (M4b)

Date : 11 novembre 2026. Code : `crates/engine/src/sim/combat.rs`, rapport `docs/demo/M4/rapport-combat.md`.

## Ce que simule M4b
- **Pas de 0,25 s** dès qu'un champion est en combat (fiche M4) ; le reste de la partie reste à 1 s.
- **Sorts** : ceux de la note 011 (patch 26.1). Rang des sorts monté à chaque niveau, ultime aux
  niveaux 6, 11 et 16 (`// estimé`, ordre générique). Coût en mana, recharge, temps d'incantation.
- **Toucher** : un sort ciblé touche toujours ; une zone 80 % et un projectile 65 % pour un joueur
  moyen, plus ou moins selon la Mécanique du lanceur et de la cible (`// estimé`). Une cible
  immobilisée est toujours touchée.
- **Dégâts** : formules du jeu (ratios), réduction par l'armure et la résistance magique
  (100 / (100 + résistance)), boucliers, soins, dégâts en % des PV max.
- **Contrôles** : étourdissement, immobilisation, ralentissement, projection… empêchent d'agir
  ou de bouger pendant leur durée.
- **Tours** : visent un champion qui vient de frapper un champion ennemi à leur portée.
- **Morts** : prime de 300 or, premier sang +100, primes de série et de malchance, aides (50 % de la
  prime partagée), XP du kill, temps de mort selon le niveau et la durée de la partie (`// estimé`, wiki).

## Décider de se battre
Chaque seconde, chaque champion compare les dégâts que son camp peut infliger aux PV adverses
dans un rayon de 1 500 unités, et l'inverse. Il engage avec une avance d'environ 1,4
(moins pour un joueur agressif : Escarmouche, Laning ; erreur de lecture réduite par le Sang-froid),
échange quelques secondes en voie quand il est en avance, fuit (Flash compris) quand il est bas ou
dominé, abandonne une poursuite qui ne touche plus ou qui l'éloigne de plus de 2 500 unités, et ne
plonge sous une tour que pour achever. Un joueur dominé par son vis-à-vis farme plus en retrait.
Avant 1:30, on ne se bat qu'avec une grosse avance.

## Draft
`lineup_from_picks` (et `drafted_match`) : le moteur joue les champions de la draft terminée (M7).
Dans l'application, `simulate_match` les utilise quand une draft entre ces deux clubs est finie.

## Résultat (1 000 parties KC contre G2, 15 min)
CS proches de la LEC sauf la jungle (+30 %, pas de ganks avant M5) ; kills nettement plus bas que
la LEC (0,9 à 15 min contre 6,3) : en LEC, la plupart des kills du début viennent des ganks, des
plongées à plusieurs et des combats autour du dragon et des larves, qui arrivent avec le plan
d'équipe (M5). Les objets (M4c) changeront aussi les dégâts. Le calibrage final des kills se fera
après M4c et M5, sur des parties complètes.

## Limites connues
Passifs non lus, pas de dash ni de déplacement par les sorts, pas de murs ni de buissons,
sorts d'invocateur réduits à Flash pour fuir.
