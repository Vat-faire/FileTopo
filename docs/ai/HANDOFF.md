# HANDOFF.md — Passation

**Date :** 2026-08-26
**De :** orchestrateur, clôture de `ACTION-0009`
**Vers :** Codex, exécution de `TASK-0007`

## État vérifié

- `TASK-0001` à `TASK-0006` : `VERIFIED`.
- Nom de travail public : **FileTopo**, décision `DEC-0001` vérifiée.
- Phase 5 : `IN_PROGRESS`; tâche unique `TASK-0007`.
- MVP Windows, release et NSIS construits; aucun remote, publication ou corpus réel.

## Mission actuelle

Préparer localement le dépôt à une publication sûre : sécurité,
confidentialité, contribution, avis de tiers exacts, inventaire, notes de
version et checklist. Lire `docs/tasks/TASK-0007-phase-5-public-preparation.md`
puis suivre `ACTION-0010`.

## Contraintes dominantes

- Ne versionner aucun secret, chemin personnel ou donnée réelle.
- Conserver les tests exclusivement synthétiques ou temporaires.
- Distinguer préparation locale, signature, distribution et publication.
- Ne pas créer de remote, release, compte ou artefact distribué.

## Points d'arrêt

Publication, dépôt distant, signature, achat, réservation, secret manquant,
action destructive ou accès à un corpus privé. La phase 6 exige un GO humain
spécial; le reste de la phase 5 s’enchaîne automatiquement.
