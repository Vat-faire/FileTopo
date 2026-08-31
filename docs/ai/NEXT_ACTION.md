# Prochaine action

## ACTION-0024 — Contrôle indépendant de TASK-0014

- **Statut :** PROPOSED
- **Responsable :** une instance **distincte de l'exécuteur** — orchestrateur
  technique, sous la délégation du 2026-08-31
- **Action unique :** **contrôler les preuves de
  [TASK-0014](../tasks/TASK-0014-b2-ter-budget-controller.md)** —
  [journal et verdicts](../research/TASK-0014-b2-ter-results.md),
  [PERF-0005](../performance/PERF-0005-b2ter-budget-controller.md) — puis
  **attribuer `VERIFIED` ou renvoyer la tâche** avec des réserves écrites.
- **Résultat attendu :** `TASK-0014` passe de `IMPLEMENTED` à `VERIFIED`, avec
  ou sans réserves, ou elle est renvoyée.

### Pourquoi c'est la seule action

`TASK-0014` est livrée **`IMPLEMENTED`** et **ne s'est pas auto-attribué
`VERIFIED`** : l'exécuteur ne juge pas ses propres preuves. Aucune tâche n'est
`IN_PROGRESS`. Rien d'autre ne peut avancer avant que ces preuves soient
jugées : ni l'adoption d'un budget, ni la porte **P4**.

### Ce que le contrôle doit regarder en priorité

1. **Les deux réfutations.** `G1` — la cible n'est pas tenue — et `G2` — la
   convergence dépasse 2 000 ms sur trois formes sur quatre. Vérifier qu'elles
   sont publiées **sans atténuation** et que les lectures supplémentaires ne
   sont jamais présentées comme des verdicts.
2. **Le critère bloqué `G3`.** La mesure s'est révélée **nulle par
   construction** : le régime stable commence au dernier changement de niveau,
   donc il ne peut contenir aucune inversion. Juger si publier `G3` **bloqué**
   plutôt que confirmé est la bonne application de §6.1 de `TASK-0014`.
3. **`G9` et les deux gestes déclarés en §8 du journal.** Après la première
   mesure, deux fichiers ont été touchés : la **ligne de verdict de `G3`** dans
   `verdicts2.mjs`, et l'ajout d'`analyse-defauts.mjs`. Juger si cela respecte
   `G9`. **Le contrôleur, la page de mesure et le pilote sont octet pour octet
   ceux du commit `4a5520b`**, antérieur à toute mesure — empreintes SHA-256 en
   §3 du journal.
4. **La solidité de `G8`.** Sa confirmation repose sur `ips régime stable`,
   grandeur atteinte par le défaut `D1`. Juger si la corroboration par la
   médiane sur toute la période observée suffit.
5. **Le contrôle ponctuel `CAL-A` / `SYN-WIDE`.** Il ne fonde aucun critère,
   mais il montre que la correction sort de la zone à 26,6 ips **sur Edge** et
   **pas sur Chrome**. Juger ce que cela impose à la suite.

### Interdit tant que ce contrôle n'a pas conclu

Ne pas adopter de budget : `TASK-0014` §6.2 l'interdit et `DEC-0014` D et E
restent en vigueur. Ne pas ouvrir Canvas 2D ni WebGL. **Ne tenter aucune
instrumentation de WebView2** : `DEC-0014` F l'interdit avant qu'un véritable
hôte Tauri existe. Ne rien supprimer du cache incrémental de
`src-tauri/target/` — `DEC-0013` E l'interdit. **N'écrire aucune ligne de code
de production : la porte P4 reste ouverte et non franchie.** Ne fusionner rien,
ne créer ni PR, ni release, ni étiquette.
