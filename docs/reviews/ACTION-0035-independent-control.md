# ACTION-0035 — Contrôle indépendant de TASK-0022 : CHANGES_REQUIRED, réserve X8

- **Date :** 2026-09-03
- **Objet :** **contrôle indépendant** de `TASK-0022` — topographie
  hiérarchique réelle, `layered-tree-cards-v1`, schéma carte `3` — sur la
  branche `build/v0.2-a6-topographic-node-graph`
- **Contrôleur :** **orchestrateur technique indépendant**, instance
  **distincte** de l'exécuteur de `TASK-0022`
- **Rédacteur de la présente fiche :** Claude Code, **exécuteur** de la
  correction. **Cette fiche ENREGISTRE un verdict rendu par l'orchestrateur;
  elle ne le rend pas, et l'exécuteur ne s'attribue rien.**
- **`HEAD` contrôlé :** **`f6f02143585251eb403c7546b2ed78eb111e9fd6`**, tip de
  `build/v0.2-a6-topographic-node-graph` au moment du contrôle
- **Verdict :** **`CHANGES_REQUIRED`** — `TASK-0022` reste **`IMPLEMENTED`**,
  **une seule réserve : `X8`, `OPEN`**

## 1. Le verdict, tel qu'il a été rendu

| Élément | État attribué par l'orchestrateur |
|---|---|
| `ACTION-0035` | **`CHANGES_REQUIRED`** |
| `TASK-0022` | **`IMPLEMENTED`** — pas `VERIFIED` |
| Réserve `X8` | **`OPEN`** |
| `HEAD` contrôlé | `f6f02143585251eb403c7546b2ed78eb111e9fd6` |
| `main` | `91bbe90f0f99026c28cd345784d4f579a0016db2`, **intacte** |

## 2. Ce que le contrôle indépendant ACCEPTE

Ces points sont **acceptés** et **ne sont pas rouverts**. La correction
enregistrée en §5 ne touche à aucun d'eux.

| # | Élément accepté |
|---|---|
| 1 | Gel `289cf9b` **antérieur** au code |
| 2 | `DEC-0024` |
| 3 | `layered-tree-cards-v1` |
| 4 | `MAP_SCHEMA_VERSION` `3` |
| 5 | Reconstruction `v2 → v3` |
| 6 | `N1` à `N12` |
| 7 | `N14` |
| 8 | `N15` |
| 9 | Cartes `240 × 64` |
| 10 | Hiérarchie explicite |
| 11 | Quatre fixtures |
| 12 | Navigation |
| 13 | Pan / zoom / fit / reset |
| 14 | Relations intra |
| 15 | Multibrain |
| 16 | Relations inter-cerveaux |
| 17 | Ancres bord-à-bord |
| 18 | Lecture seule |
| 19 | `B0` toujours déclaré |
| 20 | `F-007` / `F-008` / `F-016` = `IMPLEMENTED` |
| 21 | `main` intacte |

## 3. La réserve unique — X8

**`X8` — `M12`/`N13` evidence migration defect.** `OPEN` au verdict.

L'artefact publié
`docs/performance/runs/TASK-0022-M12-interbrain-relations-regression-webview2-pass2.json`
portait, au `HEAD` contrôlé :

| Champ | Valeur publiée | Réalité du produit |
|---|---|---|
| `artefactWritten` | `TASK-0022-M12-…-pass2.json` | conforme |
| `writesUnderItsOwnTaskOnly` | **`false`** | le runtime écrit bien sous `TASK-0022` |
| `protectedNamesNeverWritten` | « **14** noms proteges » | **19** preuves protégées |

**Cause identifiée**, dans `src/map/crossScenario.ts`, étape `M12.28` :

    writesUnderItsOwnTaskOnly: m12Artifact(2, "written").startsWith("TASK-0020-")

Le scénario testait un **préfixe `TASK-0020-` codé en dur** alors que les noms
de destination avaient migré sous `TASK-0022`, et le commentaire comme la
chaîne associée annonçaient encore **quatorze** noms protégés alors que la
garde `X5` en compte **dix-neuf** depuis `ACTION-0032`.

**C'est une migration incomplète du HARNAIS DE PREUVE. Ce n'est PAS un défaut
du modèle interbrain.** Aucun des vingt-huit constats de `M12` portant sur les
relations inter-cerveaux n'est mis en cause par `X8`.

## 4. Ce que X8 n'emporte PAS

- **Aucun des 19 noms protégés n'est en cause.** La garde `X5` fonctionnait :
  c'est l'affirmation *publiée à son sujet* qui était périmée, pas la garde.
- **Aucune preuve `TASK-0016` à `TASK-0020` n'est concernée.**
- **Le layout, le schéma 3, `DEC-0024`, `N1` à `N15` et les fixtures ne sont
  pas rouverts.**

## 5. Correction enregistrée par l'exécuteur

Exécutée sous ce `CHANGES_REQUIRED`, dans le seul périmètre qu'il nomme.

### 5.1 Correction structurelle, non ponctuelle

Le remplacement littéral de `TASK-0020` par `TASK-0022` aurait recréé le même
défaut à `TASK-0023`. L'identité de tâche est désormais **dérivée** :

- `artifactTaskId(name)` — `src/map/runArtifacts.ts` — lit le propriétaire
  **dans le nom d'artefact lui-même**, et ne connaît aucune tâche courante;
- `runtimeWriteOwnership()` **découvre** la tâche propriétaire en analysant
  **toutes** les destinations de `RUNTIME_RUN_ARTIFACTS`, et ne publie
  `writesUnderItsOwnTaskOnly` que si les trois faits tiennent ensemble : une
  seule identité de tâche parmi les destinations, aucune destination sans
  identité, aucune destination appartenant à l'ensemble protégé;
- `M12.28` consomme ce résultat. **`writesUnderItsOwnTaskOnly` n'est jamais
  écrit `true` : il est calculé.**

### 5.2 Nombre de preuves protégées

**Jamais codé en dur.** `protectedArtifactCount` est la **longueur** de
`PROTECTED_RUN_ARTIFACTS`, et la chaîne `protectedNamesNeverWritten` interpole
cette même longueur.

La **source canonique** est la garde Rust — `PROTECTED_RUN_ARTIFACTS: [&str; 19]`
dans `src-tauri/src/map/commands.rs`, celle qui **refuse réellement l'écriture**.
La liste TypeScript n'en est que le miroir; un test lit désormais le source Rust
et **échoue si les deux divergent**, en noms, en ordre et en longueur déclarée.
Aucune constante indépendante susceptible de dériver n'a été ajoutée.

### 5.3 Test de garde

`src/map/runArtifacts.test.ts`, bloc `X8` — huit tests. Le test
« no writing source hard-codes a task prefix or a protected-name count »
**échoue sur le code au `HEAD` contrôlé** et passe sur le code corrigé
(vérifié en restaurant `crossScenario.ts` depuis `f6f0214`). Les autres
établissent : parité TypeScript/Rust de la liste protégée; les **19** noms
historiques nommés un à un, aucun retiré; `artifactTaskId` distingue réellement
`TASK-0020` de `TASK-0022`; l'artefact `M12` appartient à la tâche propriétaire
et **n'est pas** protégé; `protectedArtifactCount` == longueur déclarée par la
garde Rust; une identité périmée parmi les destinations casserait le verdict.

### 5.4 Rejeu réel

`M12` **complet**, passes 1 et 2, dans le vrai hôte Tauri/WebView2
`152.0.4191.53`, avec un **variant de bac à sable neuf**
`task0022-m12-20260903173531-65e5a8`. L'ancien variant
`task0022-m12-20260903005349-eb4823` est **conservé**; rien n'a été supprimé.

Seuls les deux artefacts `TASK-0022 M12` ont été réécrits — `TASK-0022` n'est
pas `VERIFIED`. Les **19** preuves protégées ont été comparées par empreinte
`sha256` **avant et après** : **identiques**.

Écart entre l'ancien artefact accepté et le nouveau, feuille par feuille :

- passe 1 : **une** feuille, `step7_followByKey/waitedMs` `1180 → 958` — gigue
  d'attente, aucun constat;
- passe 2 : **onze** feuilles, **toutes** dans `step28_historicalEvidenceUntouched`.

Tout le reste est **identique bit à bit**. Aucun critère de §8 n'a régressé.

`step28` publie désormais :

    writesUnderItsOwnTaskOnly : true
    protectedArtifactCount    : 19
    protectedDestinations     : []
    protectedNamesNeverWritten: « … refuse les 19 noms proteges … »

Aucune affirmation « 14 protected names » ne subsiste dans le produit.

## 6. Ce que l'exécuteur ne fait pas

- **`X8` reste `OPEN`.** Claude ne ferme pas sa propre réserve.
- **`ACTION-0035` reste `CHANGES_REQUIRED`.**
- **`TASK-0022` reste `IMPLEMENTED`.** L'exécuteur ne s'attribue pas
  `VERIFIED`.
- **Un re-contrôle indépendant ciblé `X8` est requis** avant toute suite.
