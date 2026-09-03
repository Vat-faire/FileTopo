# ACTION-0032 — Contrôle indépendant de TASK-0020 : CLOSED, TASK-0020 VERIFIED

- **Date :** 2026-09-02
- **Objet :** **contrôle indépendant** de `TASK-0020` — relations
  inter-cerveaux explicites — **sur les preuves publiées**, et rien d'autre
- **Contrôleur :** **orchestrateur technique**, instance **distincte** de
  l'exécuteur de `TASK-0020`
- **Rédacteur de la présente fiche :** Claude Code, **exécuteur**. **Cette
  fiche ENREGISTRE un verdict rendu par l'orchestrateur; elle ne le rend pas,
  et l'exécuteur ne s'attribue rien.**
- **`HEAD` contrôlé :** **`9a7206a1e246258259096b1679f19ac5b53005d7`**, tip de
  `build/v0.2-a5-interbrain-relations`
- **Verdict :** **`APPROVED`** — `ACTION-0032` **`CLOSED`**

## 1. Le verdict, tel qu'il a été rendu

| Élément | État attribué par l'orchestrateur |
|---|---|
| `ACTION-0032` | **`CLOSED`** |
| `TASK-0020` | **`VERIFIED`** |
| `M1` à `M12` | **acceptés** |
| `X2`, `X3`, `X4`, `X5`, `X6` | **maintenues** |
| `HEAD` contrôlé | `9a7206a1e246258259096b1679f19ac5b53005d7` |
| `main` contrôlée | `91bbe90f0f99026c28cd345784d4f579a0016db2`, **intacte** |

**`TASK-0020` est la sixième tâche `VERIFIED` de l'étape A**, après
`TASK-0015`, `TASK-0016`, `TASK-0017`, `TASK-0018` et `TASK-0019`. Comme les
précédentes, elle l'est **sur preuves** et **par une instance distincte de
l'exécuteur**.

## 2. Ce que le contrôle accepte

Enregistré tel que rendu. **Aucun critère n'est réinterprété ici, aucun
`M1`–`M12` n'est modifié, aucun test n'est rejoué.**

- le **gel `7746fd4` précède le premier code `d1adcf2`** — `M1`–`M12` figés
  avant la première ligne de code de la tranche;
- **`M1` à `M12` : acceptés**;
- les **relations inter-cerveaux explicites** : acceptées;
- le **magasin commun** `brains/interbrain/relations.sqlite` : accepté;
- **`cek1` accepté uniquement comme repli déclaré**, **PAS** comme `I-E`
  complète;
- l'**approbation `XB-S01`** et les **contraintes `SQLite`** : acceptées;
- la **navigation inter-cerveaux**, cerveau **affiché** et cerveau **hors de la
  vue** : acceptée;
- le **rebuild des trois index**, **digest inchangé** et **0 extrémité non
  résolue** : accepté;
- **`M12` en deux passes dans le vrai `WebView2`** : accepté;
- les **régressions `J12` intra-cerveau et `L12` composée** : acceptées;
- **`main` contrôlée intacte** à `91bbe90f0f99026c28cd345784d4f579a0016db2`.

## 3. Ce que ce verdict n'emporte pas

- Il ne rend **`I-E` complète** en rien acquise : `cek1` reste le **repli
  déterministe déclaré**, et un déplacement ou un renommage réel casserait une
  extrémité.
- Il ne lève **aucune** limite déclarée en `TASK-0020` §7.6 : **aucune campagne
  `H9`**, aucun seuil, `R8` **entière**; **aucune détection automatique** entre
  cerveaux; **`P-19`** et **`P-21`** demeurent; **`B0`** n'est pas corrigé.
- Il ne porte **aucune** autorisation de fusion vers `main`, de `PR`, de
  release, d'étiquette, de `force push` ni de réécriture d'historique.
- Il n'ouvre **aucune** tranche suivante : une tranche suivante exige sa
  **propre fiche**, ses **critères gelés d'avance** et son **propre GO**.

## 4. Conséquence directe — `X5` s'applique aux preuves de `TASK-0020`

`TASK-0020` étant désormais `VERIFIED`, **ses preuves deviennent canoniques**,
et la règle instaurée le 2026-09-01 s'y applique sans retouche :

> **Une exécution d'une tâche ultérieure ne remplace jamais la preuve canonique
> d'une tâche antérieure `VERIFIED`.**

| Preuve à protéger | Ce qu'elle porte |
|---|---|
| `TASK-0020-M12-interbrain-relations-webview2-pass1.json` | `M12` étapes 1 à 22, vrai `WebView2`, vraies frappes |
| `TASK-0020-M12-interbrain-relations-webview2-pass2.json` | `M12` étapes 24 à 28, après fermeture et redémarrage réels |
| `TASK-0020-J12-intrabrain-regression-webview2.json` | régression `J12` intra-cerveau |
| `TASK-0020-L12-composed-regression-webview2-pass1.json` | régression `L12` vue composée, passe 1 |
| `TASK-0020-L12-composed-regression-webview2-pass2.json` | régression `L12` vue composée, passe 2 |

**L'extension des gardes `X5` n'est PAS exécutée dans la présente clôture** —
elle est **documentaire seulement**. La tâche de réalignement à venir devra
**commencer par protéger ces preuves** avant toute autre écriture de preuve.

## 5. Preuves contrôlées

- `docs/performance/runs/TASK-0020-M12-interbrain-relations-webview2-pass{1,2}.json`
- `docs/performance/runs/TASK-0020-J12-intrabrain-regression-webview2.json`
- `docs/performance/runs/TASK-0020-L12-composed-regression-webview2-pass{1,2}.json`
- `docs/tasks/TASK-0020-interbrain-relations.md` §4 (gelée) et §7 (résultat)
- `docs/decisions/DEC-0018-explicit-interbrain-relations.md`, fonction `F-041`
- `git` : `7746fd4` (gel) → `d1adcf2` (premier code) → `eed36e5` (preuves) →
  `4a49f8f` → `9a7206a` (tip contrôlé)

**Aucun artefact de preuve `TASK-0020` n'a été modifié par la présente
clôture.** `M12`, `J12`, `L12` et `H9` n'ont **pas** été rejoués.
