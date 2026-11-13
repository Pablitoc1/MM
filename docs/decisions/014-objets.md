# 014 · Objets (M4c)

Date : 11 novembre 2026. Code : `crates/engine/src/item.rs` (stats et boutique),
`crates/data/src/import/cdragon.rs` (`import_items`), `crates/world/src/build.rs` (builds types),
`crates/world/tests/items.rs` et les tests du combat (contrôles).

## Source
- **Stats** : fichier des objets du patch 26.1 publié par CommunityDragon
  (`raw.communitydragon.org/16.1/game/items.cdtb.bin.json`, autorisé par Yahia le 11 novembre 2026).
  On lit les stats chiffrées du jeu : dégâts d'attaque, puissance, PV, mana, armure, résistance
  magique, vitesse d'attaque, critiques, accélération, vitesse de déplacement, pénétrations, vol de
  vie. La létalité n'est pas une stat du fichier mais une valeur nommée de l'objet (« LethalityAmount »).
- **Prix total et nom français** : Data Dragon (table `items`). Seuls les objets de la Faille de
  l'invocateur (carte 11) sont gardés : 274 objets, table `item_stats`, `just seed-kits`.

## Comment le moteur s'en sert
- Chaque joueur a un build : six objets dans l'ordre d'achat.
- Il achète à la fontaine : au départ, à chaque retour à la base et à chaque réapparition.
  Un objet pas encore terminé donne ses stats au prorata de l'or déjà mis dedans. C'est une
  approximation de ses composants (`// estimé`).
- Les stats des objets entrent partout : PV, mana, armure et RM, dégâts des attaques, ratios des
  sorts (puissance, dégâts bonus, PV bonus…), vitesse d'attaque (plafond 2,5), vitesse de
  déplacement, critiques (valeur moyenne : 1 + chance × (0,75 + bonus)), recharges
  (× 100 / (100 + accélération)), pénétration (en % puis fixe, jamais sous zéro), vol de vie.
- La vue reçoit les objets terminés de chaque joueur.

## Les builds (estimés)
Les vrais builds des pros (Leaguepedia) restent à importer : leur API nous a limités pendant M4 et
on ne contourne pas une limite. En attendant, un build type par profil, avec les objets les plus
courants en LEC 2025-2026 (`// estimé`, relevé à la main) :

| Profil | Build |
|---|---|
| Tireur | Jambières du berzerker, Tueur de krakens, Lame d'infini, Salutations de Dominik, Soif-de-sang, Ange gardien |
| Mage | Chaussures de sorcier, Écho de Luden, Flamme-ombre, Coiffe de Rabadon, Bâton du vide, Sablier de Zhonya |
| Assassin AD | Bottes de lucidité, Éclipse, Lame spectre de Youmuu, Rancune de Serylda, Manteau de la nuit, Danse de la mort |
| Combattant | Coques en acier, Couperet noir, Gage de Sterak, Danse de la mort, Visage spirituel |
| Tank | Sandales de Mercure, Égide solaire, Cotte épineuse, Visage spirituel, Présage de Randuin, Armure de Warmog |
| Support tank | Mélodie du sang, Sandales de Mercure, Médaillon de l'Iron Solari, Vœu du chevalier, Rookern kaénique |
| Enchanteur | Mélodie du sang, Bottes de lucidité, Régénérateur de pierre de lune, Encensoir ardent |

Le profil vient du rôle, des mots-clés Data Dragon du champion (« Mage », « Tank »…) et des ratios
de ses sorts (puissance ou dégâts d'attaque) pour départager, par exemple, un combattant AP.

## Limites connues
- Les passifs et actifs des objets (Zhonya, Ange gardien, Sterak…) ne sont pas simulés.
- Pas d'objets de départ, de potions ni de quête de support : l'or de départ va dans le premier objet.
- Pas de vente ni de changement de build selon la partie (M5 ou plus tard).

## Résultat (1 000 parties KC–G2 de 35 min, `docs/demo/M4/rapport-objets.md`)
Les joueurs terminent environ 2,4 objets à 25 minutes. L'or d'une équipe à 25 minutes est à −19 %
de la LEC (34 974 contre 43 242) : il manque les kills, les plaques et les objectifs, qui arrivent
en M5. Même graine, même partie ; 41 ms par partie de 35 minutes.
