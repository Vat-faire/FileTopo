# TASK-0007 — Phase 5 : préparation publique

- **Statut :** `IN_PROGRESS`
- **Phase :** 5 — Préparation publique
- **Ouverte et démarrée le :** 2026-08-26
- **Approuvée via :** autorisation permanente du 2026-08-25
- **Exécutant :** Codex

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
