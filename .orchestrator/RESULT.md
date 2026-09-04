TASK_ID: TASK-0023 — correction X10
AGENT: CODEX
RESULT: DONE
BRANCH: build/v0.2-a7-exact-content-observations
FINAL_HEAD: 9e9fb37ac8129e32d439a7d0a7b3759523858739

SUMMARY:
- `ACTION-0038` enregistre le verdict externe `X9 = CLOSED`, `ACTION-0038 = CHANGES_REQUIRED`, `TASK-0023 = IMPLEMENTED`, `X10 = OPEN`; Codex ne rend pas ce verdict, ne ferme pas X10 et ne s'attribue pas VERIFIED.
- Sur Windows, `open_confined_regular_file` ouvre sans suivre le composant final reparse, décide sur la metadata du handle réel, épingle racine/composants intermédiaires sans partage écriture/suppression et lit le même handle. `sha256-tree-v1` partage cette primitive et garde les répertoires épinglés pendant `read_dir`.
- Aucune dépendance, identité physique persistée, fixture historique, preuve protégée, relation ou schéma n'a changé. Les deux seules preuves réécrites sont EC15, non protégées.

VALIDATIONS:
- `content_signals` 29/29; Rust 181/181; TypeScript 208/208; `pnpm check`; `pnpm build`; Tauri debug `--no-bundle`: PASS.
- Trois tests TOCTOU synchronisés Windows: remplacement fichier par reparse, répertoire par vraie jonction et refus de renommage d'un composant intermédiaire épinglé; aucun octet extérieur lu.
- EC15 pass1/pass2: deux processus WebView2 152.0.4191.62, variante fraîche `task0023-ec15-x10-20260904153755-5a40e1`; 8 fichiers, 1424 octets, 8 digests, redémarrage réel, Alpha/Gamma, relations et stale UI conformes.
- X5 exactement 27, preuves historiques inchangées, `protectedDestinations = []`, `writesUnderItsOwnTaskOnly = true`; `main` intacte à `91bbe90f0f99026c28cd345784d4f579a0016db2`.

IMPORTANT_FILES:
- `src-tauri/src/map/content_signals.rs`; `scripts/task0023-ec15-run-real-host.ps1`; `docs/reviews/ACTION-0038-independent-recontrol.md`; `docs/tasks/TASK-0023-exact-content-observations.md`; `docs/decisions/DEC-0025-exact-content-observation-boundary.md`; deux preuves `docs/performance/runs/TASK-0023-EC15-*`; documents durables `docs/ai/*` requis.

COMMIT: 9e9fb37ac8129e32d439a7d0a7b3759523858739
PUSHED: yes

LIMITS_OR_BLOCKERS:
- DEC-0013/F demeure bloquante pour toute identité physique persistante.
- La garantie X10 livrée et exécutée cible Windows. Le repli `cfg(not(windows))` conserve le non-suivi statique historique mais n'est pas revendiqué race-safe et n'a pas été compilé/exécuté ici.
- `cargo fmt --check` reste rouge sur le formatage historique global avec rustfmt 1.98; aucun reformatage global. Aucun rejeu J12/K11/K12/L12/M12/N15/H9; aucun clean ni suppression de `target`.

NEXT_ORCHESTRATOR_DECISION:
- re-contrôle indépendant X10 / TASK-0023
