# 007 : Notes des joueurs (M2)

Date : 2026-11-11. Code : `crates/data/src/ratings.rs` (calcul, pur et testé),
`crates/data/src/import/oracles.rs` (données et rapprochement).

## Source

Oracle's Elixir : une ligne par joueur et par partie pro, toutes les ligues suivies,
**de 2014 à 2025** (12 saisons, 932 200 lignes joueur). 2026 n'est pas utilisé : la partie
commence en janvier 2026, ce serait l'avenir. Fichiers téléchargés par Yahia depuis
oracleselixir.com et lus depuis `data/raw/oracles/` (Google Drive refusait le
téléchargement automatique, « quota dépassé », et on ne contourne pas un quota).

## Méthode

1. **Chaque partie est comparée à sa ligue et à son année.** Chaque stat est ramenée
   en écarts-types par rapport aux joueurs du même poste, de la même ligue, la même
   année (au moins 40 parties, sinon tous les pros du poste cette année-là). Une
   ligue plus lente, un méta différent ou une époque différente ne faussent plus
   la comparaison. À l'international, un joueur compte dans sa ligue d'origine.
   Les anciens noms des ligues sont reliés aux nouveaux (`oe` dans `data/leagues.toml` :
   EU LCS → LEC, NA LCS → LCS, LMS → PCS, Challengers Korea → LCKCL…).
2. **Poids des années.** Forme actuelle : demi-vie d'un an et demi (2025 : 1 ;
   2024 : 0,63 ; 2023 : 0,40 ; 2020 : 0,10). Carrière (régularité, grands matchs,
   sang-froid, écart entre ligues) : demi-vie de quatre ans. Expérience : toutes les
   parties (`// estimé`).
3. **Recette de chaque attribut** : une moyenne pondérée de stats standardisées.

   | Attribut | Stats utilisées |
   |---|---|
   | Mécanique | KDA, dégâts par or, dégâts/min |
   | Laning | écart d'or à 15 (0,35), d'XP (0,25), de CS (0,25), morts avant 15 (−0,15) ; support : or 0,3, XP 0,4, morts −0,3 (sans CS) |
   | Farm | CS/min, part de l'or |
   | Teamfight | part des dégâts, dégâts/min, participation aux kills, morts tardives (−) |
   | Escarmouche | kills + assists avant 15, first blood |
   | Lecture de carte | morts/min (−), participation aux kills, first blood |
   | Décision | KDA, morts/min (−), victoires |
   | Vision | vision/min, wards posées, détruites, pinks |
   | Pool de champions | ln(1 + champions joués 2 fois ou plus) + entropie, dernière saison |
   | Régularité | écart-type (−) du score par partie, sur la carrière |
   | Grands matchs | score en playoffs et à l'international moins sa moyenne, sur la carrière |
   | Sang-froid | score dans les parties où l'équipe est à −1 500 d'or à 15 min |

4. **Écart entre les ligues** (table `league_strength`), en écarts-types de niveau,
   LEC = 0. Moindres carrés sur deux sources réelles :
   - les **matchs entre ligues** (Worlds, MSI, EWC, First Stand, EMEA Masters, IEM…) :
     modèle de Bradley-Terry, comparé paire par paire de ligues qui se sont
     affrontées ; une log-cote de 1 vaut 0,9 écart-type (`// estimé`). Les coupes hors
     saison (Demacia Cup, KeSPA Cup, NEST) sont exclues : les clubs y alignent leurs
     remplaçants ;
   - les **joueurs passés d'une ligue à l'autre** (9 650 cas, deux saisons d'au moins
     10 parties à un an d'écart au plus) : à niveau égal, l'écart de leurs scores
     dans chaque ligue mesure l'écart entre les ligues.

   Un a priori par tier (−0,5 / −1,2 / −1,8, `// estimé`) ne compte que pour une ligue
   que rien ne relie aux autres. Académies : a priori = ligue principale − 1,5.
   Résultat : LCK +0,84, LPL +0,61, LEC 0, LCKCL −0,03, LCS −0,11, LCP −0,29,
   LDL −0,35, LFL −0,47 … NLC −1,29.
5. **Force des équipes : Elo mondial** sur toutes les parties de 2014 à 2025, dans
   l'ordre des dates (K = 24, × 1,5 en playoffs et à l'international, `// estimé`).
   Une équipe nouvelle part du niveau mesuré de sa ligue (point 4), et chaque année
   son Elo revient d'un tiers vers ce niveau (changements d'effectif, `// estimé`).
   1 écart-type de niveau = 193 points d'Elo (même conversion que pour les ligues).
6. **Apport individuel** : chaque stat est comparée à celles de ses coéquipiers dans
   la même partie (80 % de leur moyenne retirée, `// estimé`), pour qu'une
   super-équipe ne gonfle pas tous ses joueurs. Les écarts hors normes (au-delà
   d'un écart-type) disent surtout un style de jeu : ils sont resserrés en douceur
   (`// estimé`). Lissage w / (w + 12) selon le nombre de parties. Dans une ligue
   plus faible, l'apport compte un peu moins (75 % pour un écart-type sous la LEC).
7. **Niveau** = force moyenne de ses équipes (Elo, pondérée comme ses parties)
   + 70 % de l'apport individuel (`// estimé` : les stats viennent aussi de l'équipe).
   **Échelle /100** : 75 + 10 z, une équipe moyenne de LEC à 75, resserrée au-dessus
   de 85 pour que seuls les meilleurs du monde approchent 95-99. Moyennes :
   LCK 85, LPL 81, LEC 77, LCS 75, LCKCL 71, LFL 69, NLC 62. **Attributs /20** : même
   échelle divisée par 5 (15/20 = 75/100), centrés sur la force de ses équipes.
   Fourchette : ± 2 × √(12 / (w + 12)), affichée dès que la demi-largeur dépasse 1.
8. **Potentiel /100** : mesuré sur les vraies carrières. Pour chaque âge, évolution
   moyenne du niveau d'une saison à la suivante (joueurs de la base dont on connaît
   la date de naissance, 12 ans de saisons) : environ +3 points par an à 17-18 ans,
   +1,5 à 19-20, 0 à 21, puis légère baisse. Potentiel = niveau + somme des
   progressions moyennes de son âge jusqu'au pic + la moitié de la dispersion à son
   âge s'il a moins de 24 ans (certains progressent bien plus que la moyenne).
   Plafond 99. Âge inconnu : 22 ans.

## Ce que les stats ne mesurent pas

Shotcalling, communication et professionnalisme sont marqués « estimé » et toujours
affichés en fourchette de ± 2 : force de ses équipes, plus un bonus d'expérience
(jusqu'à 4 saisons pleines, toutes les parties de la carrière) et, pour le shotcalling, un bonus de poste (support,
jungle, mid). Ils seront affinés quand le staff et les rapports de scouts arriveront.

Un joueur absent d'Oracle's Elixir (académie, nouveau venu) reçoit des notes estimées
au niveau de sa ligue, toutes en fourchette.

## Rapprochement avec la base

Pseudo en minuscules, en préférant la même ligue, puis le plus de parties.
Les codes de ligue d'Oracle's Elixir différents des nôtres sont dans `data/leagues.toml`
(clé `oe`).
