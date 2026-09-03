# Prochaine action

## Réalignement produit post-`TASK-0020` — formaliser AVANT tout nouveau code

- **Statut de `TASK-0020` :** **`VERIFIED`** le 2026-09-02 —
  [`ACTION-0032`](../reviews/ACTION-0032-independent-control.md), `CLOSED`,
  `HEAD` contrôlé `9a7206a1e246258259096b1679f19ac5b53005d7`
- **Tâche `IN_PROGRESS` :** **aucune**
- **Tâche `IMPLEMENTED` en attente de contrôle :** **aucune**
- **Branche :** `build/v0.2-a5-interbrain-relations`
- **Action unique :** **formaliser le réalignement produit**, et **rien
  d'autre**

### Ce qu'il y a à formaliser, avant toute nouvelle ligne de code

1. **La topographie finale à cartes/nœuds reliés** plutôt que l'imbrication de
   rectangles comme représentation principale;
2. **la correction explicite du contrat `P-02`**;
3. **le moteur déterministe de relations automatiques, sans IA**;
4. **le workflow humain simple pour confirmer/rejeter les suggestions**;
5. **l'IA comme couche optionnelle `BYOK`, jamais requise par le noyau**;
6. **la préparation architecture mono-utilisateur / multi-utilisateur /
   permissions héritées de la source.**

### Ce que cette action n'autorise pas

- **Aucune nouvelle `TASK` d'implémentation n'est créée à ce stade.** Le
  **prochain prompt de l'orchestrateur** décidera précisément les `DEC`, les
  exigences et les tâches à créer.
- **Aucune modification de code produit.**
- **Aucune modification de décision produit** n'a été faite par la clôture
  d'`ACTION-0032`.
- **Aucun rejeu** de `M12`, `J12`, `L12`, `H9` ni d'aucun test.
- **Aucune fusion vers `main`, PR, release, étiquette, `force push`**, aucune
  réécriture d'historique.

### Le préalable de la tâche de réalignement

`TASK-0020` étant `VERIFIED`, ses **cinq** preuves deviennent canoniques au
sens de `X5` :

| Preuve désormais canonique |
|---|
| `TASK-0020-M12-interbrain-relations-webview2-pass1.json` |
| `TASK-0020-M12-interbrain-relations-webview2-pass2.json` |
| `TASK-0020-J12-intrabrain-regression-webview2.json` |
| `TASK-0020-L12-composed-regression-webview2-pass1.json` |
| `TASK-0020-L12-composed-regression-webview2-pass2.json` |

**Les gardes `X5` n'ont PAS été étendues** par la clôture `ACTION-0032`, qui
est documentaire. **La tâche de réalignement devra commencer par protéger ces
preuves** — porte Rust `write_run_artifact`, `src/map/runArtifacts.ts`,
`scripts/protected-run-artifacts.ps1` — **avant toute autre écriture de
preuve.**

### Ce qui reste hors sujet

- **Aucune campagne `H9`**, aucun seuil. **`R8` entière.**
- **`I-E` complète** hors périmètre; **`cek1` reste le repli déclaré**, et le
  contrôle indépendant ne l'a accepté qu'à ce titre.
- **`P-19`** et **`P-21`** demeurent. **`P-04` reste PARTIELLE.**
- **`B0` n'est pas corrigé**; rien n'est nettoyé dans `src-tauri/target/`.
