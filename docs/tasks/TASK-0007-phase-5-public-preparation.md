# TASK-0007 — Phase 5 : préparation publique

- **Statut :** `VERIFIED`
- **Phase :** 5 — Préparation publique
- **Ouverte et démarrée le :** 2026-08-26
- **Approuvée via :** autorisation permanente du 2026-08-25
- **Exécutant :** Codex
- **Livrée et vérifiée le :** 2026-08-26
- **Vérifiée par :** orchestrateur, sur preuves locales reproductibles

## Objectif

Rendre le dépôt local publiable sans risque, tout en maintenant la publication elle-même hors périmètre : avis de tiers reproductible, confidentialité et sécurité relues, absence de données réelles, documentation de contribution, notes de version, checklist de publication et artefacts vérifiés.

## Livrables

- `SECURITY.md`, politique de confidentialité locale et modèle de menace actualisé.
- `CONTRIBUTING.md`, conduite des tests synthétiques et règles de non-accès aux données privées.
- `THIRD_PARTY_NOTICES.md` exact et inventaire de dépendances reproductible.
- Notes de version et checklist de publication/signature.
- Audit des secrets, chemins personnels, données réelles, licences, dépendances et artefacts.
- Vérification d’une construction propre locale et des guides FR/EN.

## Critères d’acceptation

1. Aucun secret, jeton, chemin personnel absolu ou contenu réel versionné.
2. Licence MIT et mentions de tiers cohérentes avec les dépendances verrouillées.
3. Sécurité, confidentialité, contribution et limites du MVP documentées.
4. Tests, analyses statiques, audits et build Windows réussissent depuis l’état documenté.
5. Une checklist distingue clairement préparation, signature et publication.
6. Aucun dépôt distant, release, compte, achat, signature ou publication créé.

## Interdictions

- Ne jamais publier ni créer de dépôt distant.
- Ne jamais signer ou distribuer un artefact.
- Ne jamais accéder à un corpus utilisateur ou au corpus privé interdit.
- La phase 6 demeure bloquée jusqu’à un GO humain spécial et distinct.

## Résultat et preuves

- Politiques de sécurité et de confidentialité, modèle de menace, guide de
  contribution, notes de version et checklist créés et relus.
- Inventaire reproductible : 16 entrées JavaScript de production, 172 entrées
  JavaScript dans le graphe complet, 456 paquets Rust toutes cibles et zéro
  licence Rust manquante.
- Audit public : 102 fichiers candidats, aucun motif sensible, aucun chemin
  personnel absolu, aucun fichier supérieur à 5 Mio et aucun remote Git.
- `pnpm install --frozen-lockfile`, TypeScript, 4 tests Vitest, Vite,
  `pnpm audit --prod`, format Rust, Clippy strict et 11 tests Rust réussis.
- Exécutable release et installateur NSIS reconstruits localement; empreintes
  SHA-256 consignées dans `docs/releases/0.1.0.md`.
- Aucun corpus réel ou privé, aucune signature, distribution ou publication.

## Conclusion

Les six critères d'acceptation sont satisfaits. `TASK-0007` et la phase 5
passent à `VERIFIED`. La phase 6 demeure `DEFERRED` et exige un GO humain
spécial et distinct avant toute action externe.
