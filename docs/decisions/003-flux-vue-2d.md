# 003 · Flux de la vue 2D du match

Date : 11 novembre 2026. Chantier mené en parallèle de M1, avec l'accord de Yahia.
Il prépare l'écran de M6 sans changer le plan : M6 branchera ce même écran sur le vrai moteur.

## Le format (version 1)
Défini dans `app/ui/src/match/replay.ts`. Le moteur Rust devra produire exactement ce format.

- En-tête : patch, graine, durée, les 2 équipes, les 10 champions (joueur, rôle, champion Data Dragon).
- Images horodatées (`t` en secondes) : 1 par seconde, 4 par seconde en combat.
  Chaque image donne, pour les 10 champions, la position, la vie (0 à 1) et vivant ou mort,
  et la liste des vagues de sbires.
- Une vague est notée par sa voie et sa **distance le long de la voie** depuis son nexus,
  pas par x et y : elle reste forcément dans sa voie, virages compris.
- Événements horodatés : kill (tueur, victime, assistants, heure de réapparition),
  bâtiment détruit, camp apparu (avec la variante : type de dragon, larves ou Nashor),
  camp tué (avec l'heure de réapparition), balise posée ou détruite, fin de partie.
- Positions en unités de jeu Riot (carte 11, origine en bas à gauche côté bleu), comme les
  timelines de l'API Riot : on pourra comparer le moteur à de vraies parties.

## Ajouts pour l'écran complet (deuxième PR)
- Champion : ses 2 sorts d'invocateur (en-tête) ; à chaque image, ressource (mana ou énergie,
  `null` pour un champion sans ressource), niveau, cs, or gagné et objets possédés (ids Data Dragon).
- Image : `blueWin`, les chances de victoire du côté bleu, que le moteur calculera.
- Camp tué et bâtiment détruit : `by`, le champion qui donne le dernier coup ; balise posée :
  `by`, le champion qui la pose. Pour le fil du match.
- En-tête : `context` (compétition, journée, format, date), pour la barre du haut.
- La vue en déduit seule : KDA, or par équipe, dragons, larves et Nashor pris, courbe d'écart d'or,
  fil du match (kills d'un teamfight regroupés dans un bloc, comme sur la maquette).
- L'économie du faux match (achats, revenus, cs, chances de victoire) est marquée `// estimé` :
  le moteur M3 la remplacera.

## Ce que fait la vue, et ce qu'elle ne fait pas
- Elle interpole linéairement entre deux images ; elle ne connaît aucune règle du jeu.
  Les timers (réapparitions, camps) viennent tous du flux.
- Elle déduit seule les effets : multi-kill (kills d'un même champion à moins de 10 s),
  teamfight (au moins 3 morts, chacune à moins de 15 s de la précédente).
- Elle ne dessine jamais une vague à moins de 800 unités d'un bâtiment debout : la vague
  contourne le bâtiment. Testé sur toute la partie.

## Carte
`app/ui/src/match/map.ts`. Tours et inhibiteurs : positions de l'API Riot. Nexus, camps, tracé des
voies et alcôves : relevés sur la minimap Data Dragon 16.22 et contrôlés en les superposant à
l'image ; marqués `// estimé`.

## Images
`app/ui/src/match/assets/` : minimap Data Dragon 16.22.1, icônes des camps
et des sbires reprises de la maquette v2. Les icônes de champions viennent de la base
de départ (M1, `data/seed/public/champions`). L'import Data Dragon télécharge en plus
les icônes des objets (ceux de la carte 11) et des sorts d'invocateur, dans `items/` et `spells/`.
Icône du drake océan reprise de la maquette v2.

## Nouvelle dépendance
PixiJS 8 (rendu 2D WebGL), prévu dans la stack (note 001). Chargé seulement sur l'écran du match.

## Écran aligné sur la maquette v2 (11 novembre 2026)
Yahia a relevé que l'écran ne ressemblait pas assez à la maquette. Comparaison côte à côte, puis :
- Plein écran, sans le menu : barre du match en haut (compétition, date, patch ; pause, x1, x4, x16,
  « Temps forts », « Aller au résultat »).
- Carte : portraits de 30 px cerclés de la couleur de l'équipe, morts grisés et barrés,
  vagues en file de 4 sbires avec leur nombre, point de choc entre deux vagues, camps avec leur
  anneau (buffs bleu et rouge, carapateur), grands objectifs en 34 px avec halo.
- Fil : tueur, action, victime ; un multi-kill sur une ligne ; teamfight dans un encadré titré
  (« Combat au dragon ») avec l'objectif pris pendant le combat ; balises posées avant un objectif.
- Courbe d'or : composant commun mis à jour dans la PR des composants (repères en icônes).

Écarts assumés avec la maquette :
- Un bouton retour (‹) à gauche de la barre : sans le menu, il faut pouvoir quitter l'écran.
- Une fine réglette d'avancement au bas de la barre, pour revoir un moment du match.
- « Temps forts » joue en x16 hors action et ralentit en x2 autour des kills, bâtiments et objectifs.
- « Aller au résultat » saute à la fin du match ; l'écran d'après-match arrive en M8.
