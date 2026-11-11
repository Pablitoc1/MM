# 003 · Composants d'interface des maquettes v2

Date : 11 novembre 2026.

Travail préparé en parallèle de M1, sans changer le plan ni les jalons : les écrans
des jalons (Effectif en M1, fiche joueur en M2, match en M6, pause et après-match en M8,
accueil en M10) réutiliseront ces briques au lieu de les refaire.

- **Où** : `app/ui/src/components/ui/`, exportés par `index.ts`. Styles dans `ui.css`,
  uniquement avec les variables de `tokens.css` (sept variables ajoutées, reprises des
  maquettes : `--text-soft`, `--teal-text`, `--track`, `--grid-line`, `--row-hover`,
  `--warn-bg`, `--hero-bg`).
- **Vitrine** : page à part `ui/vitrine.html` (`just dev-web` puis `/vitrine.html`).
  Elle n'est pas dans l'application livrée et ne touche ni au menu ni aux écrans.
- **Graphiques** en SVG écrit à la main (écart d'or, forme, radar) : aucune
  bibliothèque de graphiques, les tracés sont simples.
- **Couleurs selon la valeur**, reprises des maquettes :
  sur 100 (moral, confiance, chimie) 70 et plus teal, 50 à 69 bleu, sinon orange ;
  attribut sur 20 : 16 et plus teal, 10 à 15 bleu, sinon orange ;
  fatigue au-delà de 50 % en orange.
- **Images absentes** (avant l'import M1 ou fichier manquant) : initiales à la place,
  pour que l'écran reste lisible.
- **Drapeaux** dessinés en SVG pour les pays courants de la LEC ; un pays absent
  s'affiche avec son code. Leurs couleurs sont celles des drapeaux, pas du thème.

## Mise à jour après M1
- **Branchés sur la base** : la vitrine lit l'effectif et le staff réels de Karmine Corp
  (`api.ts`, donc `apercu.json` hors de Tauri), avec photos, logos et icônes de champions
  locaux. `components/ui/adapt.ts` fait le passage base → composants ; les valeurs que la
  base n'a pas encore (niveau M2, moral et fatigue M10, valeur M11) arrivent à part et
  sont marquées comme exemples.
- **Une seule icône de poste** : `components/RoleIcon.tsx` (écran Effectif de M1) dessine
  désormais avec le composant partagé, sans changer son apparence.
- **Courbe d'or** : les événements portent leur icône comme dans la maquette (champion du
  tueur, dragon, larves, Nashor, tour), cerclée à la couleur de l'équipe, avec la légende.
  Les trois icônes d'objectifs sont celles des maquettes v2 (`components/ui/assets/`).
