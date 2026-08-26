# Checklist de release

Cette checklist sépare volontairement les opérations locales des actions
externes irréversibles ou coûteuses.

## A. Préparation locale — autorisée en phase 5

- [x] Arbre Git propre avant préparation; commit local final effectué à la clôture.
- [x] Verrous installés sans modification inattendue.
- [x] TypeScript, tests interface, Vite, format Rust, Clippy et tests Rust verts.
- [x] `pnpm audit --prod` sans vulnérabilité connue.
- [x] Inventaire de dépendances régénéré et avis de tiers relu.
- [x] Audit des fichiers versionnés sans secret, chemin personnel ni gros fichier.
- [x] Guides FR/EN, politique de confidentialité, sécurité et modèle de menace relus.
- [x] Exécutable et installateur reconstruits; hachages consignés dans les notes de version.
- [x] Test manuel effectué uniquement sur fixtures synthétiques.
- [x] Notes de version et limites connues exactes.

## B. Signature — action humaine séparée

- [ ] **STOP : obtenir une autorisation humaine explicite.**
- [ ] Confirmer le propriétaire du certificat et tout coût associé.
- [ ] Protéger la clé privée hors du dépôt et des journaux.
- [ ] Signer l'exécutable et l'installateur avec horodatage approuvé.
- [ ] Vérifier la signature sur une machine Windows propre.
- [ ] Recalculer et consigner les hachages après signature.

## C. Publication — phase 6, GO spécial obligatoire

- [ ] **STOP : obtenir le GO humain spécial et distinct de phase 6.**
- [ ] Refaire la diligence sur le nom public et confirmer la destination.
- [ ] Créer ou confirmer le dépôt distant et ses protections.
- [ ] Configurer un canal privé de signalement de sécurité.
- [ ] Publier le code source avec licence et avis de tiers.
- [ ] Créer la release, téléverser seulement les artefacts signés approuvés.
- [ ] Vérifier publiquement les liens, hachages, notes et téléchargements.
- [ ] Documenter la procédure de retrait ou correction.

Aucune case des sections B ou C n'est autorisée par la préparation locale.
