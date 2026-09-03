# Prochaine action

## Contrôler `TASK-0021` — le réalignement produit, livré `IMPLEMENTED`

- **Statut de `TASK-0021` :** **`IMPLEMENTED`** le 2026-09-02 —
  [fiche](../tasks/TASK-0021-product-realignment.md). **Livrable
  DOCUMENTAIRE.** **L'exécuteur ne s'est pas attribué `VERIFIED`**
- **Statut de `TASK-0020` :** **`VERIFIED`** —
  [`ACTION-0032`](../reviews/ACTION-0032-independent-control.md), `CLOSED`
- **Tâche `IN_PROGRESS` :** **aucune**
- **Branche :** `build/v0.2-a5-interbrain-relations`
- **Action unique :** **contrôle indépendant du réalignement produit**, et
  **rien d'autre**

### Ce qu'il y a à contrôler

1. **Les gardes `X5`** couvrent bien les **cinq** preuves `TASK-0020`, dans les
   **trois** listes, et **aucune preuve n'a été touchée**;
2. **les cinq fiches `DEC-0019` à `DEC-0023`** enregistrent la direction
   produit **sans rien décider** que le prompt n'ait nommé;
3. **la correction normative `X2`** de `P-02` conserve l'ancienne formulation,
   **ne descend pas** l'exigence, et laisse le contrat à **22** exigences;
4. **la matrice** est cohérente : **49** lignes, `F-001` à `F-049`, **sans trou
   ni doublon**, `MVP` 41 / `ULTÉRIEUR` 3 / `DIFFÉRÉ` 5, **aucune
   classification existante changée**;
5. **la séquence de sept tranches** de `TASK-0021` §6 est justifiée par des
   **dépendances réelles**, et reste `PROPOSED`.

### La première tranche recommandée — `PROPOSED`, NON exécutée

**Tranche 1 — nouveau layout topographique à nœuds/cartes/liens**, satisfaisant
`P-02` sous sa formulation corrigée, sous
[`DEC-0020`](../decisions/DEC-0020-topographic-node-graph.md).

**Pourquoi celle-là d'abord :** la représentation conditionne tout ce qui
s'affiche ensuite. Une relation, une suggestion, un état de validation et une
permission se **montrent** sur une carte; construire le moteur de relations
avant la carte produirait des relations que rien n'affiche, et le pavage
imbriqué actuel n'a de place ni pour une arête transversale, ni pour un état
« à confirmer ».

**Elle reste `PROPOSED` et n'est pas créée tant que l'orchestrateur n'a pas
contrôlé le réalignement.** Aucune fiche `TASK-0022` n'existe.

### Ce que cette action n'autorise pas

- **Aucun code d'implémentation** : ni layout, ni moteur de règles, ni IA, ni
  serveur, ni permissions.
- **Aucune nouvelle `TASK` d'implémentation créée.**
- **Aucun rejeu** de `M12`, `J12`, `L12`, `H9` ni d'aucun test.
- **Aucune fusion vers `main`, PR, release, étiquette, `force push`**, aucune
  réécriture d'historique.

### Ce qui reste hors sujet

- **Aucune campagne `H9`**, aucun seuil. **`R8` entière.**
- **`I-E` complète** hors périmètre; **`cek1` reste le repli déclaré**.
- **`P-19`** et **`P-21`** demeurent. **`P-04` reste PARTIELLE.** **`P-02`
  n'est pas satisfaite**, sous sa formulation corrigée.
- **`B0` n'est pas corrigé** — reproduit une **sixième** fois; rien n'est
  nettoyé dans `src-tauri/target/`.
