# NEXT_ACTION.md — Prochaine action

**Dernière mise à jour :** 2026-08-26

Ce fichier contient **exactement une** action.

---

## ACTION-0009 — Construire TASK-0006 : MVP local sans IA

- **Tâche visée :** `TASK-0006`
- **Fiche :** `docs/tasks/TASK-0006-phase-4-local-mvp.md`
- **Statut :** `IN_PROGRESS`
- **Exécutant :** Codex
- **GO humain :** non requis pour les changements locaux réversibles
- **Phase :** 4

### Objet

Passer du pipeline synthétique vérifié à un MVP Windows utilisable : registre
de collections, choix natif explicite d'une racine, index persistant hors du
corpus, progression et annulation, requêtes paginées, recherche, filtres et
ouverture explicite d'un élément.

### Première tranche

Implémenter le modèle persistant des collections et les commandes Rust
étroites, puis les tester exclusivement avec des répertoires temporaires et
les fixtures synthétiques du dépôt.

### Interdictions

Aucun scan de dossier utilisateur pendant le développement, aucun corpus
privé, aucun réseau à l'exécution, aucune IA, télémétrie, publication, Claude
ou crédit Anthropic.
