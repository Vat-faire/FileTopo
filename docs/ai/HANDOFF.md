# HANDOFF.md — Passation

**Date :** 2026-08-25
**De :** orchestrateur, clôture de `ACTION-0006`
**Vers :** Codex, exécution de `TASK-0004`

## État vérifié

- `TASK-0001`, `TASK-0002`, `TASK-0003` : `VERIFIED`.
- Nom de travail public : **FileTopo**, décision `DEC-0001` vérifiée.
- Phase 2 : `IN_PROGRESS`; tâche unique `TASK-0004`.
- Aucun code applicatif, dépendance, commit, remote ou corpus réel.

## Mission actuelle

Produire l'architecture complète avant le code : licence, pile bureau
Windows, moteur local, index, modèle de données, rendu, relief, sécurité,
performance, accessibilité et tests synthétiques. Lire
`docs/tasks/TASK-0004-phase-2-architecture.md` puis suivre `ACTION-0007`.

## Contraintes dominantes

- Corpus source strictement en lecture seule; index séparé et reconstructible.
- Local et hors ligne; aucune télémétrie ni donnée envoyée.
- Plusieurs collections indépendantes; surveillance incrémentale.
- Grands arbres, progression, annulation et rendu progressif.
- Windows d'abord, FR/EN, clavier et lecteur d'écran.
- Aucun code ni installation de dépendance pendant `TASK-0004`.

## Points d'arrêt

Publication, dépôt distant, achat, réservation, secret manquant, action
destructive ou accès à un corpus privé. Le reste s'enchaîne automatiquement.
