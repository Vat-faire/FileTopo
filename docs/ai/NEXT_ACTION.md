# Prochaine action

## Première tranche d'implémentation de la cible post-réalignement

**`TASK-0022` — layout topographique hiérarchique à nœuds/cartes et connexions
explicites**, sous
[`DEC-0020`](../decisions/DEC-0020-topographic-node-graph.md) et **`P02-R1`**.

- **Statut de `TASK-0021` :** **`VERIFIED`** le 2026-09-02 —
  [fiche](../tasks/TASK-0021-product-realignment.md). Livrable
  **DOCUMENTAIRE**. Re-contrôle indépendant ciblé
  [`ACTION-0034`](../reviews/ACTION-0034-independent-recontrol.md),
  **`CLOSED`**, `HEAD` contrôlé `10cf54e`. **L'exécuteur ne se l'est pas
  attribué**
- **`X7` :** **`CLOSED`**. **`ACTION-0033` :** **`CLOSED`**
- **Réserve ouverte :** **aucune** — `X1` à `X7` sont **toutes `CLOSED`**
- **Tâche `IN_PROGRESS` :** **aucune**. **Tâche `IMPLEMENTED` en attente :**
  **aucune**
- **Branche :** `build/v0.2-a5-interbrain-relations`
- **Action unique :** **`TASK-0022`**, et **rien d'autre**

### Ce que TASK-0022 devra faire

**Remplacer la représentation principale imbriquée par une vraie topographie à
nœuds reliés**, satisfaisant `P-02` sous sa formulation corrigée **`P02-R1`**,
**sans supprimer les capacités `VERIFIED` existantes**.

Le **treemap n'est plus la cible visuelle** — `DEC-0020`. Ce que
`TASK-0015` à `TASK-0020` ont rendu `VERIFIED` **reste acquis et ne doit pas
régresser**.

### Ce qui n'est PAS encore décidé, et ne doit pas être improvisé

Le **prochain prompt de l'orchestrateur** définira, et lui seul :

- l'**architecture**;
- les **fixtures**;
- les **critères gelés** — gelés **avant** toute ligne de code;
- la **compatibilité multi-cerveaux**;
- les **relations intra-cerveaux et inter-cerveaux**;
- le **`pan`/`zoom`**;
- le **clavier**;
- les **labels**;
- les **tests réels `WebView2`**.

### Ce que cette action n'autorise pas

- **La création ou l'exécution de `TASK-0022` avant son prompt.** **Aucune
  fiche `TASK-0022` n'existe.**
- **Aucune ligne de code d'implémentation** tant que les critères ne sont pas
  gelés dans une fiche `APPROVED` au périmètre écrit.
- **Aucune suppression ni régression** d'une capacité `VERIFIED`.
- **Aucun rejeu** de `M12`, `J12`, `L12`, `H9` ni d'aucun test hors périmètre.
- **Aucune fusion vers `main`, PR, release, étiquette, `force push`**, aucune
  réécriture d'historique.
- **Aucune écriture** sous un nom de preuve protégé par les gardes `X5` —
  **19** noms; la porte **refuse** au lieu d'écrire.

### Ce qui reste hors sujet

- **Aucune campagne `H9`**, aucun seuil. **`R8` entière.**
- **`I-E` complète** hors périmètre; **`cek1` reste le repli déclaré**.
- **`P-19`** et **`P-21`** demeurent. **`P-04` reste PARTIELLE.** **`P-02`
  n'est pas satisfaite**, sous sa formulation corrigée **`P02-R1`**.
- **`B0` n'est pas corrigé** — reproduit une **sixième** fois; rien n'est
  nettoyé dans `src-tauri/target/`.
- **Aucune cible de `DEC-0019` à `DEC-0023` n'est prouvée.** Ce sont des
  **cibles à falsifier**, pas des résultats.
