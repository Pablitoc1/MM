# 007 : Notes des joueurs (M2)

Date : 2026-11-11. Code : `crates/data/src/ratings.rs` (calcul, pur et testé),
`crates/data/src/import/oracles.rs` (données et rapprochement).

## Source

Oracle's Elixir, une ligne par joueur et par partie pro, années 2024 et 2025
(toutes les ligues suivies). Fichiers publics sur le Google Drive d'Oracle's Elixir,
téléchargés tels quels avec un User-Agent honnête. Si Drive répond « quota dépassé »,
l'import échoue proprement et on réessaie plus tard : on ne contourne pas le quota.

## Méthode

1. **Statistiques par joueur**, pondérées par l'année : une partie 2025 compte 1,
   une partie 2024 compte 0,5. Le poste retenu est celui le plus joué.
2. **Recette de chaque attribut** : une moyenne pondérée de stats standardisées.

   | Attribut | Stats utilisées |
   |---|---|
   | Mécanique | KDA, dégâts par or, dégâts/min |
   | Laning | écart d'or à 15 (0,35), d'XP (0,25), de CS (0,25), morts avant 15 (−0,15) |
   | Farm | CS/min, part de l'or |
   | Teamfight | part des dégâts, dégâts/min, participation aux kills, morts tardives (−) |
   | Escarmouche | kills + assists avant 15, first blood |
   | Lecture de carte | morts/min (−), participation aux kills, first blood |
   | Décision | KDA, morts/min (−), victoires |
   | Vision | vision/min, wards posées, détruites, pinks |
   | Pool de champions | ln(1 + champions joués 2 fois ou plus) + entropie |
   | Régularité | écart-type (−) du score par partie, 8 parties minimum |
   | Grands matchs | score en playoffs et à l'international moins sa moyenne, 5 parties minimum |
   | Sang-froid | score dans les parties où l'équipe est à −1 500 d'or à 15 min, 5 minimum |

3. **Comparaison au sein du poste** : chaque attribut est ramené en écarts-types (z)
   par rapport aux joueurs du même poste ayant au moins 10 parties pondérées.
4. **Force de la ligue** : modèle de Bradley-Terry sur les matchs entre ligues
   (MSI, Worlds, EWC, First Stand, EM), LEC = 0. Une log-cote de 1 vaut 0,9 écart-type
   (`// estimé`). Une ligue sans match international reprend la valeur de son tier :
   −0,5 / −1,2 / −1,8 (`// estimé`, à recaler quand les ligues se croisent davantage).
   Les forces sont dans la table `league_strength`.
5. **Rétrécissement** vers la moyenne de la ligue quand il y a peu de parties :
   z = force de la ligue + z brut × w / (w + 12), w = parties pondérées.
6. **Échelle** : note /20 = 10,5 + 3 z (moyenne LEC à 10,5). Fourchette :
   ± 3 × √(12 / (w + 12)). Elle s'affiche dès que la demi-largeur dépasse 1,5 point,
   soit moins d'environ 36 parties pondérées (un split et demi).
7. **Niveau /100** = 60 + 10 z, z moyen pondéré par poste (le support pèse surtout
   la vision et le teamfight, le jungler la lecture de carte et l'escarmouche, les
   autres la mécanique, le laning et le teamfight). Même fourchette, sur 100.
8. **Potentiel /100** = niveau + 2 points par année avant 24 ans, plafonné à 99
   (`// estimé`, courbe usuelle à calibrer avec les carrières en M10). Âge inconnu : +4.

## Ce que les stats ne mesurent pas

Shotcalling, communication et professionnalisme sont marqués « estimé » et toujours
affichés en fourchette de ± 3 : niveau de la ligue, plus un bonus d'expérience
(jusqu'à 2 saisons pleines) et, pour le shotcalling, un bonus de poste (support,
jungle, mid). Ils seront affinés quand le staff et les rapports de scouts arriveront.

Un joueur absent d'Oracle's Elixir (académie, nouveau venu) reçoit des notes estimées
au niveau de sa ligue, toutes en fourchette.

## Rapprochement avec la base

Pseudo en minuscules, en préférant la même ligue, puis le plus de parties.
Les codes de ligue d'Oracle's Elixir différents des nôtres sont dans `data/leagues.toml`
(clé `oe`).
