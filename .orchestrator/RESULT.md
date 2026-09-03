TASK_ID: TASK-0022 — correction X8
AGENT: CLAUDE
RESULT: DONE
BRANCH: build/v0.2-a6-topographic-node-graph
FINAL_HEAD: d6963e65e9829b8c17196eeb469eabfb3aa86aeb

SUMMARY:
- `ACTION-0035` enregistree `CHANGES_REQUIRED` sur `HEAD` controle `f6f0214`; fond de `TASK-0022` accepte, reserve unique `X8` `OPEN`.
- `X8` corrige structurellement : l'identite de tache est **derivee** du nom d'artefact et de l'ensemble des destinations (`artifactTaskId`, `runtimeWriteOwnership`), plus aucun prefixe `TASK-00xx-` code en dur — la correction ne cassera pas a `TASK-0023`.
- Nombre de preuves protegees derive de la longueur de la liste; parite testee contre la source canonique Rust `PROTECTED_RUN_ARTIFACTS: [&str; 19]`. Aucune constante independante ajoutee, aucun des 19 noms touche.
- Huit tests de garde `X8`, dont un qui **echoue** sur le code controle `f6f0214` et passe sur le code corrige.
- `M12` rejoue en entier, passes 1 et 2, dans le vrai hote, avec un variant neuf; `step28` publie desormais `writesUnderItsOwnTaskOnly: true` et `protectedArtifactCount: 19`, sans aucune affirmation « 14 protected names ».

VALIDATIONS:
- `pnpm check` PASS; `pnpm test` PASS — **196** tests TypeScript (188 -> 196); build Tauri debug `--no-bundle` PASS avec `CARGO_INCREMENTAL=0`, aucun clean.
- `M12` passe 1 et passe 2 PASS, hote reel WebView2 `152.0.4191.53`, variant neuf `task0022-m12-20260903173531-65e5a8`, ancien variant `task0022-m12-20260903005349-eb4823` conserve.
- Non-regression §8 mesuree feuille par feuille contre le rejeu accepte : passe 1 = **1** feuille differente (`step7_followByKey/waitedMs` 1180 -> 958, gigue d'attente); passe 2 = **11** feuilles, **toutes** dans `step28`. Tout le reste identique bit a bit.
- 19 preuves protegees : empreintes `sha256` identiques avant et apres le rejeu. `main` intacte a `91bbe90f0f99026c28cd345784d4f579a0016db2`.
- Non teste volontairement, hors perimetre `X8` : `N15`, `J12`, `K11`, `L12`, `H9`, suite Rust (aucun source Rust modifie).

IMPORTANT_FILES:
- `docs/reviews/ACTION-0035-independent-control.md`; `src/map/runArtifacts.ts`; `src/map/crossScenario.ts`; `src/map/runArtifacts.test.ts`; `docs/performance/runs/TASK-0022-M12-interbrain-relations-regression-webview2-pass{1,2}.json`.

COMMIT:
d6963e65e9829b8c17196eeb469eabfb3aa86aeb
PUSHED: yes

LIMITS_OR_BLOCKERS:
- `X8` reste `OPEN`, `ACTION-0035` reste `CHANGES_REQUIRED`, `TASK-0022` reste `IMPLEMENTED` — l'executeur ne ferme pas sa propre reserve et ne s'attribue pas `VERIFIED`.
- `B0` inchange : contourne par `CARGO_INCREMENTAL=0`, non corrige. Aucune nouvelle dependance.

NEXT_ORCHESTRATOR_DECISION:
- re-controle independant X8 / TASK-0022
