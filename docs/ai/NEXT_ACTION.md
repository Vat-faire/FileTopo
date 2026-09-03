# Prochaine action

## Re-contrôler `X7` — la collision d'identifiant, corrigée

- **Statut de `TASK-0021` :** **`IMPLEMENTED`** le 2026-09-02 —
  [fiche](../tasks/TASK-0021-product-realignment.md). **Livrable
  DOCUMENTAIRE.** **L'exécuteur ne s'est pas attribué `VERIFIED`**
- **Contrôle indépendant :**
  [`ACTION-0033`](../reviews/ACTION-0033-independent-control.md),
  **`CHANGES_REQUIRED`** le 2026-09-02 sur `HEAD` `68211c8`. **Le FOND de
  `TASK-0021` est accepté en entier.** Une **seule** réserve, documentaire :
  **`X7`**, **`OPEN`**
- **Statut de `TASK-0020` :** **`VERIFIED`** —
  [`ACTION-0032`](../reviews/ACTION-0032-independent-control.md), `CLOSED`
- **Tâche `IN_PROGRESS` :** **aucune**
- **Branche :** `build/v0.2-a5-interbrain-relations`
- **Action unique :** **re-contrôle indépendant ciblé de `X7` / `TASK-0021`**,
  et **rien d'autre**

### La réserve X7, et la correction exécutée

`X2` désignait **déjà** la réserve technique de `TASK-0016`,
[`ACTION-0026`](../reviews/ACTION-0026-independent-control.md), **`CLOSED`**.
`TASK-0021` avait **réutilisé le même nom** pour la correction normative de
`P-02` : **deux sens simultanés dans le même corpus**. L'ambiguïté est refusée.

**La correction de `P-02` s'appelle désormais `P02-R1`** — `P-02`, révision
normative 1. **La substance de `P-02` n'a pas changé.**

### Ce qu'il y a à re-contrôler — et rien d'autre

1. **toute référence** à la révision de `P-02` utilise **`P02-R1`**;
2. le **`X2` historique de `TASK-0016`** existe toujours et ne signifie
   **toujours que** sa réserve historique, **`CLOSED`**;
3. **aucune occurrence ambiguë** ne subsiste — `X2` n'est plus employé nulle
   part comme nom de la révision de `P-02`;
4. **`P-02` est inchangée sur le fond** — nouveau comportement et **huit**
   contrôles identiques;
5. **`DEC-0019` à `DEC-0023` inchangées sur le fond**;
6. **matrice** : `F-001` à `F-049`, **49** uniques, `MVP` 41 / `ULTÉRIEUR` 3 /
   `DIFFÉRÉ` 5;
7. **aucune preuve historique modifiée**, **aucun code produit modifié**,
   **aucune garde `X5` modifiée**, **`main` intacte**.

**`X7` ne peut être fermée que par le contrôleur indépendant.** L'exécuteur a
enregistré la correction; **il ne s'est pas prononcé sur elle**.

### Ce que cette action n'autorise pas

- **`VERIFIED` pour `TASK-0021` avant la fermeture de `X7`.**
- **Aucun code d'implémentation** : ni layout, ni moteur de règles, ni IA, ni
  serveur, ni permissions.
- **Aucune nouvelle `TASK` d'implémentation créée.** Aucune fiche `TASK-0022`
  n'existe.
- **Aucun rejeu** de `M12`, `J12`, `L12`, `H9` ni d'aucun test.
- **Aucune fusion vers `main`, PR, release, étiquette, `force push`**, aucune
  réécriture d'historique.

### La première tranche recommandée — toujours `PROPOSED`, NON exécutée

**Tranche 1 — nouveau layout topographique à nœuds/cartes/liens**, satisfaisant
`P-02` sous sa formulation corrigée `P02-R1`, sous
[`DEC-0020`](../decisions/DEC-0020-topographic-node-graph.md). **Elle n'est pas
créée tant que `X7` n'est pas fermée et `TASK-0021` pas `VERIFIED`.**

### Ce qui reste hors sujet

- **Aucune campagne `H9`**, aucun seuil. **`R8` entière.**
- **`I-E` complète** hors périmètre; **`cek1` reste le repli déclaré**.
- **`P-19`** et **`P-21`** demeurent. **`P-04` reste PARTIELLE.** **`P-02`
  n'est pas satisfaite**, sous sa formulation corrigée.
- **`B0` n'est pas corrigé** — reproduit une **sixième** fois; rien n'est
  nettoyé dans `src-tauri/target/`.
