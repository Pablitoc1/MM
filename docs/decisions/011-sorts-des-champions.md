# 011 · Sorts des champions (M4a)

Date : 11 novembre 2026. Code : `crates/data/src/import/cdragon.rs` (import),
`crates/engine/src/kit.rs` (format lu par le moteur), `crates/world/tests/kits.rs` (contrôles).

## Source
Yahia a autorisé CommunityDragon et Meraki Analytics le 11 novembre 2026 (« Go M4, j'autorise
les 2 sites »).
- **CommunityDragon** (`raw.communitydragon.org/16.1/…`) publie les fichiers de données du client
  pour chaque patch. La version 16.1 du client est le patch 26.1, celui du début de la saison 2026.
  C'est la source de tous les chiffres : valeurs par rang, formules et ratios, recharges, coûts,
  portées, vitesse des projectiles, durées des contrôles.
- **Meraki Analytics** n'est plus tenu à jour (dernières données au patch 25.x). Il sert seulement
  à compléter ce que le fichier du jeu ne nomme pas : le type de dégâts quand l'IA des bots de Riot
  ne le donne pas, et un contrôle dont la durée n'est écrite que dans le texte du sort. 80 sorts
  sur 688 sont complétés ainsi ; le champ `source` de chaque sort le dit.

## Comment on lit un sort
- **Dégâts** : le calcul que l'IA des bots de Riot utilise pour ce sort (`BotData`), sinon le
  calcul nommé « …Damage » le plus probable. Les formules du jeu (valeurs nommées, ratios sur une
  stat totale, de base ou bonus, paliers selon le niveau, sommes, produits) sont réduites à une
  forme simple : base par rang + terme selon le niveau + ratios par rang.
- **Dégâts en % des PV max de la cible** : rangés à part (`max_health_damage`).
- **Contrôles** : lus dans les valeurs nommées (« StunDuration », « SlowPercent »…).
- **Type de dégâts** : `DamageTag` de l'IA des bots (0 physique, 1 magique, 2 brut).

## Limites connues
- Les cumuls (charges, marques, stacks) comptent pour zéro : ils dépendent de la partie.
- Les coups critiques ne sont pas encore des stats suivies : leurs ratios comptent pour zéro.
- Un ratio qui change avec le niveau est pris au niveau 9 (`// estimé`, milieu de partie).
- Sorts à plusieurs coups : la valeur est celle du calcul choisi (par coup ou totale selon le
  sort). Les ultimes canalisés (Fiddlesticks, Miss Fortune, Lucian) donnent leur total.
- Les passifs ne sont pas lus (M4b les traitera au cas par cas si le calibrage le demande).

## Résultat
172 champions, 688 sorts : 547 avec des dégâts, 274 avec un contrôle. Comparé aux chiffres de
Meraki (patch 25.x), la base au rang 1 concorde pour 381 sorts ; les écarts restants viennent
surtout des changements d'équilibrage depuis et des dégâts « par tick » que Meraki donne à part.
`crates/world/tests/kits.rs` contrôle chaque sort de chaque champion (recharges, portées, valeurs
finies et plausibles à tous les rangs et niveaux) et des chiffres relevés à la main (Ahri, Lux, Garen).

`just seed-kits` refait seulement cette table dans la base existante.
