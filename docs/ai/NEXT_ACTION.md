# Prochaine action

## Exécuter TASK-0017 — relations transversales avec provenance

- **Statut :** `IN_PROGRESS` — GO technique **acquis**, critères **gelés**
- **Responsable :** Claude Code, exécuteur; **Sébastien** pour tout point
  d'arrêt réservé
- **Action unique :** **implémenter `TASK-0017` dans le périmètre gelé en §4 de
  sa fiche**, puis la laisser `IMPLEMENTED` pour contrôle indépendant.
- **Fiche :** [`TASK-0017`](../tasks/TASK-0017-crosscutting-relations.md)
- **Branche :** `build/v0.2-a2-relations`, créée depuis le tip contrôlé
  `33704a1b900f664c3957927d5bd4d3502054f95c`

### Le périmètre, en une phrase

**`P-04`, `P-05`, `P-07`, et la part « relations transversales » de `P-06`** —
un modèle de relations où **une relation établie sans provenance n'est pas
représentable**, et où **une suggestion n'est jamais une relation**.

### Ce qui est gelé et ne se retouche plus

- le **modèle normatif** — `DETERMINISTIC` ou `APPROVED`, **aucune troisième
  provenance** — §4.1;
- les **deux types** `reference` et `revision` — §4.2;
- la **clé d'endpoint `ek1`**, repli déterministe qui **n'implémente pas**
  `I-E` — §4.3;
- le **lieu de stockage**, séparé de l'index reconstructible — §4.4;
- les **deux règles déterministes versionnées** — §4.5;
- la **fixture de relations** : 12 relations établies, 2 types, 4 suggestions
  en attente, 5 tentatives invalides, et **les comptes attendus nœud par
  nœud** — §4.6;
- les **critères `J1` à `J12`** — §4.7.

**Aucun critère `J1` à `J12` ne peut être modifié après le premier résultat.
Une cible manquée reste manquée.**

### Ce qui reste interdit

- **Ne pas implémenter** `P-08`, `P-09`, la surveillance, le vu/non-vu, `P-19`,
  ni aucune heuristique **réelle** de suggestion.
- **Aucune donnée réelle, aucun sélecteur de dossier.**
- **Aucune nouvelle dépendance** : devant ce besoin, **`BLOCKED`** avant
  installation.
- **Ne pas commencer l'étape B**, ne pas lever `R8`, ne rien conclure sur le
  budget adaptatif.
- **Ne pas corriger `B0`**, ne rien supprimer dans `src-tauri/target/`.
- **Ne pas contourner les tests-gardes `X2`** : les commandes nouvelles portent
  le préfixe `map_`.
- **Aucune fusion vers `main`, PR, release, étiquette, `force push`**, aucune
  réécriture d'historique.
- **Ne pas s'attribuer `VERIFIED`.**
