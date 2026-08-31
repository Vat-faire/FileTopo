# Prochaine action

## ACTION-0023 — Contrôle indépendant de TASK-0013

- **Statut :** PROPOSED
- **Responsable :** une instance **distincte de l'exécuteur** — orchestrateur
  technique, sous la délégation du 2026-08-31
- **Action unique :** **contrôler les preuves de
  [TASK-0013](../tasks/TASK-0013-b2-bis-layout-and-render-budget.md)** —
  [journal et verdicts](../research/TASK-0013-b2-bis-results.md),
  [PERF-0004](../performance/PERF-0004-b2bis-layout-and-budget.md) — puis
  **attribuer `VERIFIED` ou renvoyer la tâche** avec des réserves écrites.
- **Résultat attendu :** `TASK-0013` passe de `IMPLEMENTED` à `VERIFIED`, avec
  ou sans réserves, ou elle est renvoyée.

### Pourquoi c'est la seule action

`TASK-0013` est livrée **`IMPLEMENTED`** et **ne s'est pas auto-attribué
`VERIFIED`** : l'exécuteur ne juge pas ses propres preuves. Aucune tâche n'est
`IN_PROGRESS`. Rien d'autre ne peut avancer avant que ces preuves soient
jugées : ni le choix du calepin, ni l'adoption d'un budget, ni la porte **P4**.

### Ce que le contrôle doit regarder en priorité

1. **Les deux réfutations.** `F4` — le budget ne tient pas la cible — et `F8` —
   WebView2 n'a pas pu être instrumenté. Vérifier qu'elles sont publiées sans
   atténuation et que §5.4 de `TASK-0013` a été appliqué **intégralement**.
2. **La préséance des critères.** Le commit `85a4a05` doit contenir les
   critères, le plancher de lisibilité et le matériel de référence, **avant**
   toute mesure publiée.
3. **La correction de protocole de la phase D**, déclarée en §2.2 de
   `PERF-0004` : la contrainte est passée de 240 à 1 000 ips parce que 240
   s'est révélée atteignable. Juger si cela reste une correction de protocole
   et non un ajustement de critère.
4. **La précision de périmètre de §12.6** du journal : localiser et lancer un
   navigateur installé, pour tenter WebView2 comme la fiche l'exige.
5. **Le sort de la réserve `R1`.** L'exécuteur écrit qu'elle est *comblée quant
   au protocole* — `SYN-100K` a été joué — et **ne la déclare pas levée**.
   C'est au contrôle de trancher.

### Interdit tant que ce contrôle n'a pas conclu

Ne pas choisir le calepin du produit, ne pas adopter de budget : `TASK-0013`
§6.1 l'interdit et aucune décision n'est prise. Ne pas ouvrir Canvas 2D —
`DEC-0013` C ne l'ouvre pas. Ne rien supprimer du cache incrémental de
`src-tauri/target/` — `DEC-0013` E l'interdit. **N'écrire aucune ligne de code
de production : la porte P4 reste ouverte et non franchie.** Ne fusionner rien,
ne créer ni PR, ni release, ni étiquette.
