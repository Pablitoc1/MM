# 009 · Moteur : carte, vagues et farm (M3)

Date : 11 novembre 2026. Code : `crates/engine` (moteur), `crates/world/src/lineup.rs`
(préparation du match depuis la base), `crates/world/src/bin/sim.rs` (`just sim`).

## Ce que simule M3
Une partie seconde par seconde, sans combat entre champions (M4) ni plan d'équipe (M5) :
- **Carte** : réseau de points (voies échantillonnées tous les 500 unités, 16 carrefours de
  jungle et de rivière par moitié, la moitié rouge étant le reflet de la bleue). Chemin le plus
  court par Dijkstra, ordre de parcours fixe. Carrefours relevés sur la minimap (`// estimé`).
- **Vagues** : une vague toutes les 30 s par voie, canon toutes les 3 vagues avant 15:00.
  Elles marchent, s'arrêtent au contact, se battent (dégâts des deux vagues calculés avant d'être
  appliqués : aucun avantage au côté bleu), fusionnent, et les tours tirent sur le premier sbire.
- **Camps** : timers d'apparition et de réapparition, PV, CS, or et XP. Dragon, larves et Nashor
  apparaissent (pour la vue) mais personne ne les prend avant M5.
- **Champions** : stats Data Dragon par niveau (formule de croissance de Riot). Les joueurs de
  voie se placent derrière le point de contact des vagues et tentent chaque dernier coup quand
  une attaque est prête ; la réussite dépend de l'attribut Farm (et un peu de la Mécanique).
  Le support prend une partie des sbires que son tireur laisse filer. Le jungler enchaîne ses
  camps et le carapateur au plus tôt prêt. Retour à la base quand sa vague pousse et qu'il a
  l'or d'un objet. XP partagée (65 % chacun à deux).
- **Vision** : qui est vu par l'adversaire (champions, sbires, tours, balises), sans murs ni
  buissons pour l'instant. Le support pose une balise vers la rivière à chaque recharge, le
  jungler en pose une au carapateur.
- **Sortie** : le flux version 1 de la vue 2D (note 003), une image par seconde.

## Chiffres
`crates/engine/src/rules.rs` : valeurs du wiki officiel (saison 2025) relevées de mémoire, car
le wiki, Meraki Analytics et CommunityDragon sont bloqués par le réseau de construction. Toutes
marquées `// estimé`. À remplacer par les valeurs exactes dès qu'une source est autorisée.

## Calibrage
`tools/reference_lec.py` tire d'Oracle's Elixir 2025 (LEC, parties complètes) la moyenne et
l'écart-type de chaque mesure par rôle : `data/reference/lec-2025.json`. `just sim` compare.
Trois constantes de comportement sont calées sur ce rapport (`sim.rs`) : la chance de dernier
coup d'un joueur moyen (0,80), la part du support (0,50), l'or qui déclenche un retour (1 300).

## Écarts connus, laissés tels quels
- **Jungle +33 % de CS** : le jungler ne fait que farmer. Les pros gankent, prennent les dragons
  et les larves : c'est M5 qui fermera l'écart, on ne fausse pas les camps pour le cacher.
- **Support +38 % d'XP** : il ne quitte jamais sa voie (pas de roam avant M5).
- **Dispersion trop faible** (± 3 CS contre ± 11) : personne ne meurt et les matchups ne comptent
  pas encore. Les combats (M4) l'élargiront.

## Notes des joueurs
`crates/world/src/lineup.rs` lit les 15 attributs de la table `player_attributes` (M2, note 007 :
15/20 = joueur moyen de LEC, un écart-type = 2 points). En M3, seuls Farm et Mécanique jouent
(derniers coups). KC et G2 étant au-dessus de la moyenne, leurs joueurs de voie farment un peu
plus que la moyenne LEC du rapport.
- Les tours extérieures n'ont pas encore de plaques distinctes ; aucun champion ne pousse sa vague.

## Déterminisme
Une seule source d'aléatoire (`SimRng`), aucune table de hachage, et seulement `+ − × ÷ √`
sur les flottants (pas d'`exp` ni de `hypot`, dont le résultat peut varier selon la plateforme).
Testé : même graine, même partie ; autre graine, autre partie.
