# Prochaine action

## ACTION-0021 — Contrôle indépendant des preuves de TASK-0012

- **Statut :** PROPOSED
- **Responsable :** Sébastien
- **Action unique :** **contrôler les preuves** publiées par `TASK-0012` sur la
  branche `spike/v0.2-technical-risk-gates`, puis attribuer `VERIFIED` ou
  renvoyer la tâche avec des corrections motivées.
- **Résultat attendu :** `TASK-0012` passe à `VERIFIED`, ou reçoit des
  corrections et reste `IMPLEMENTED`.
- **Pourquoi c'est à Sébastien :** l'exécuteur ne s'attribue pas `VERIFIED`.
  `TASK-0012` est `IMPLEMENTED`; aucun contrôle indépendant n'a eu lieu.

### Ce qu'il faut contrôler

1. [TASK-0012-risk-gate-results.md](../research/TASK-0012-risk-gate-results.md)
   — journal, preuves et verdicts de `B0` à `B4`;
2. [PERF-0001](../performance/PERF-0001-b2-rendering.md),
   [PERF-0002](../performance/PERF-0002-b1-sqlite-migration.md),
   [PERF-0003](../performance/PERF-0003-b3-windows-identity.md);
3. `spikes/`, et notamment
   `spikes/b3-windows-identity/LICENCE.md`.

### Les quatre points qui appellent une décision humaine

| # | Point | Décision attendue |
|---|---|---|
| 1 | **`M-C` est réfutée telle que `DEC-0011` l'écrit** : un `-wal` orphelin survit à la permutation et **corrompt** la base neuve. La variante durcie passe, pour un coût en temps nul | Compléter `DEC-0011` avec l'obligation de replier puis supprimer les fichiers annexes, ou retenir `M-B` |
| 2 | **`B2` autorise l'étude de Canvas 2D** : à 3 000 blocs visibles, `SYN-WIDE` plafonne à 14,08 ips contre 30 exigées. Les plafonds réels mesurés sont 3 743 / 3 063 / **939** blocs selon la forme | Plafonner selon la forme, changer d'algorithme de calepin, ou ouvrir l'étude Canvas 2D — en sachant qu'elle imposerait de reconstruire l'accessibilité |
| 3 | **`B3` est incomplet par périmètre** : le comportement **inter-volume** n'a pas été observé, car le tester exigerait d'écrire hors du dépôt, ce que §13.2 érige en condition d'arrêt | Autoriser, ou non, un répertoire de travail synthétique sur un second volume |
| 4 | **L'échec de `B0` n'a pas été corrigé** : `cargo build` échoue sur une panique interne du compilateur, causée par le cache incrémental hérité de `src-tauri/target/`, ignoré par Git. Le code source, lui, compile | Autoriser, ou non, une tâche distincte de renouvellement de ce cache |

### État acquis, à ne pas rejouer

La porte **P3 est franchie** depuis le 2026-08-31. `B0` à `B4` ont été
exécutés; leurs verdicts sont écrits. Les mesures ne sont **pas** à refaire
pour être lues.

### Interdit tant que P4 n'est pas franchie

N'écrire aucune ligne de code de production. Ne modifier aucune fiche `DEC-0001`
à `DEC-0012`. Ne fusionner ni la branche de spike, ni quoi que ce soit. Ne
créer aucune PR, release ni étiquette. Ne toucher ni `graph/`, ni `main`, ni un
verrou de dépendances. Ne pas corriger l'échec de `B0`.
