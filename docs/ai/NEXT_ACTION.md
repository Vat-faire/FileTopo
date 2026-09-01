# Prochaine action

## Re-contrôle indépendant de TASK-0018 — `X5` uniquement

- **Statut de la tâche :** **`IMPLEMENTED`** — **`VERIFIED` non attribué**,
  l'exécuteur ne s'auto-vérifie pas
- **Responsable :** une instance **distincte de l'exécuteur**, se prononçant
  **sur preuves**
- **Action unique :** **re-contrôler la correction de la réserve `X5`**, et
  **rien d'autre**. Le fond de `K1` à `K12` a déjà été accepté par
  [`ACTION-0028`](../reviews/ACTION-0028-independent-control.md) §0 et n'est pas
  rouvert
- **Fiches :** [`ACTION-0028`](../reviews/ACTION-0028-independent-control.md),
  puis [`TASK-0018`](../tasks/TASK-0018-multibrain-foundation.md) **§8**
- **Branche :** `build/v0.2-a3-multibrain-foundation`

### Ce qu'il faut trancher

- **Les preuves gelées sont-elles intactes ?** `TASK-0016-H9-webview2.json` et
  `TASK-0017-J12-webview2.json` doivent être **bit-for-bit** ceux d'avant la
  correction — ni réécrits, ni supprimés, ni renommés. À vérifier **par Git**,
  pas sur parole.
- **La règle est-elle tenue à la porte, ou seulement par convention ?**
  `write_run_artifact` refuse-t-il réellement un nom protégé **avant** tout
  accès au disque ?
- **Le runtime courant écrit-il bien ailleurs ?**
  `TASK-0018-H9-multibrain-regression-webview2.json` et
  `TASK-0018-J12-relations-regression-webview2.json`, et l'artefact **dit-il**
  qu'il ne remplace pas la campagne gelée dont il vient ?
- **Le `J12` de régression prouve-t-il quelque chose ?** Vraie frappe —
  `activationIsTrusted` et `keydownIsTrusted` à `true`, **0** `click()`
  programmatique, **0** `dispatchEvent(click)` — traversée réelle, approbation
  explicite, `X3` respecté, comptes cohérents.
- **La garde empêche-t-elle le retour de `X5` ?** 9 tests neufs, éprouvés par
  mutation.
- **Que rien de gelé n'a bougé :** aucun critère `H`, `J` ou `K`, aucune
  fixture, aucune règle.

### Ce qui est déclaré, et ne doit pas être compté comme tenu

- **Aucune campagne `H9` n'a été exécutée.** `TASK-0018` n'a aucun critère de
  performance, **aucun seuil n'est posé**, `R8` reste entière.
- **`K12` n'a pas été rejoué** : aucun code produit de bascule, de catalogue ou
  de session n'a été modifié par la correction.
- **La persistance de la vue reste `P-19`.**
- **La révocation de `P-04` n'est toujours pas implémentée.** `P-04` demeure
  **PARTIELLE**.
- **`B0` s'est reproduit une cinquième fois**, non corrigé, rien supprimé dans
  `src-tauri/target/`.

### Ce qui reste interdit

- **Ne pas afficher plusieurs cerveaux dans le même graphique** — `TASK-0019`.
- **Ne pas créer de relation inter-cerveaux** — `TASK-0020`.
- **Aucune racine utilisateur, aucun folder picker, aucune donnée réelle,
  aucune nouvelle dépendance.**
- **Aucune fusion vers `main`, PR, release, étiquette, `force push`**, aucune
  réécriture d'historique.
