# 003 · Ligues importées et tiers

Date : 11 novembre 2026.

Leaguepedia ne classe pas les ligues en tiers. La liste des ligues et leur tier
sont donc écrits à la main dans `data/leagues.toml` :

- Tier 1 : les six ligues majeures de 2026 (LEC, LCK, LPL, LCS, CBLOL, LCP).
- Tier 2 : les ligues régionales européennes (ERL) qui ont la place la plus haute,
  plus les ligues de développement officielles (LCK CL, LDL, NACL, Circuito Desafiante,
  LRN, LRS), et les ligues Asie-Pacifique qui alimentent la LCP (LJL, VCS, PCS, LTS).
- Tier 3 : les deuxièmes divisions et les petites ligues européennes.

Effectif de départ : pour chaque ligue, l'import prend le premier tournoi régulier
qui commence après le 15 décembre 2025 (pas les playoffs, qualifications ou
promotions). S'il n'y en a pas, il prend le dernier qui a commencé avant. C'est
l'effectif inscrit à ce tournoi qui forme le club au 5 janvier 2026.

Un club inscrit dans deux ligues (par exemple un invité en LEC) reste dans la ligue
du tier le plus haut.

Pour ajouter ou déplacer une ligue : modifier `data/leagues.toml`, puis `just seed`.
