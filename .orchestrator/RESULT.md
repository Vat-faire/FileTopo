TASK_ID: TASK-0022 — enregistrement VERIFIED / scellement X5
AGENT: CODEX
RESULT: DONE
BRANCH: build/v0.2-a6-topographic-node-graph
FINAL_HEAD: 4e48b046d6402b09edf968df88324c72da00dd3f

SUMMARY:
- Verdict indépendant enregistré dans `ACTION-0036` sur `645b9484790f8e766f7eed93107b9431d144aaa6`, correction `X8` `d6963e65e9829b8c17196eeb469eabfb3aa86aeb` : `ACTION-0036`, `X8` et `ACTION-0035` `CLOSED`; `TASK-0022` `VERIFIED`. Codex n'a pas rendu le verdict.
- X5 étendue de 19 à 27 noms identiques dans Rust, TypeScript et PowerShell : ajout exact des huit preuves TASK-0022 J12, K11, L12 pass1/pass2, M12 pass1/pass2 et N15 pass1/pass2. H9, K12 et `-abandon` restent non protégés; aucune preuve modifiée.

VALIDATIONS:
- `pnpm test -- src/map/runArtifacts.test.ts` PASS — 26/26; parité exacte Rust/TypeScript/PowerShell, 19 anciens noms et 8 nouveaux contrôlés, aucune neuvième destination.
- Rust ciblé X5 PASS — 3/3 avec `CARGO_INCREMENTAL=0`; chacun des 27 noms refusé et variantes non canoniques non protégées.
- PowerShell ciblé PASS — 27/27 refus attendus; variantes non canoniques contrôlées autorisées. `main` intacte à `91bbe90f0f99026c28cd345784d4f579a0016db2`.

IMPORTANT_FILES:
- `docs/reviews/ACTION-0036-independent-recontrol.md`; `src-tauri/src/map/commands.rs`; `src/map/runArtifacts.ts`; `src/map/runArtifacts.test.ts`; `scripts/protected-run-artifacts.ps1`; documents durables `docs/ai/`.

COMMIT:
4e48b046d6402b09edf968df88324c72da00dd3f
PUSHED: yes

LIMITS_OR_BLOCKERS:
- N15, J12, K11, L12, M12 et H9 non rejoués conformément au périmètre; aucun test complet, check ou build. B0 inchangé; aucune dépendance, aucun clean, aucune suppression de `target`, aucune action destructive.

NEXT_ORCHESTRATOR_DECISION:
- Définir la prochaine tranche; `TASK-0023` n'est pas créée.
