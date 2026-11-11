# 002 · Moteur déterministe

Date : 11 novembre 2026.

Tout l'aléatoire du moteur passe par `mm_engine::SimRng` (SplitMix64, sans dépendance).
La même graine donne exactement la même partie, sur toutes les plateformes.

Pourquoi : rejouer un match pour la vue 2D (M6), reproduire un bug, et garder des
sauvegardes stables. Les valeurs de référence sont figées par un test : les changer
demande une nouvelle note de décision.
