TASK_ID: TASK-0023 — correction X9
AGENT: CLAUDE
RESULT: DONE
BRANCH: build/v0.2-a7-exact-content-observations
FINAL_HEAD: <a-remplir>

SUMMARY:
- `ACTION-0037` enregistré : verdict indépendant `CHANGES_REQUIRED`, `TASK-0023` `IMPLEMENTED`, réserve unique `X9` `OPEN`. Claude enregistre, ne rend pas le verdict.
- Nouvelle primitive `content_signals::content_source_fingerprint` publiée `sha256-tree-v1:<64 hex>` : déterministe, streaming par tampon borné de 64 KiB réutilisé, symlink/jonction/reparse marqués comme lien sans jamais ouvrir, lire, parcourir ni canonicaliser la cible; type non interprétable = non traversable.
- `observe_root_with_hook` publie `sourceFingerprintBefore/After` par ce seul moteur; `fixtures::fingerprint` (`fnv1a64:`) inchangée et réservée aux fixtures gelées et aux preuves `TASK-0016`..`TASK-0022`.
- `TASK-0023` reste `IMPLEMENTED`, `X9` reste `OPEN`, `ACTION-0037` reste `CHANGES_REQUIRED`; aucun `VERIFIED` auto-attribué.

VALIDATIONS:
- `cargo test` **178/178** (171 avant, +7 exécutés ici), `pnpm test` **208/208**, `pnpm check`, `pnpm build`, `pnpm tauri build --debug --no-bundle` : PASS.
- EC15 pass1/pass2 régénérées, deux vrais processus WebView2 `152.0.4191.62`, variante fraîche `task0023-ec15-x9-20260904145356-6ebb99` : PASS. `sourceFingerprintBefore == sourceFingerprintAfter == sha256-tree-v1:85f73748…`; passe 2 = 8 fichiers ouverts, 1 424 octets relus, 8 digests = `hashedCount`.
- Preuve X9 réellement exécutée : jonction Windows `mklink /J` hors racine classée comme lien, cible agrandie sans changer l'empreinte; l'ancien moteur échouait sur le même arbre en `Accès refusé`. Détection `FILE_ATTRIBUTE_REPARSE_POINT` et classification pure déterministes. Streaming prouvé par compteur de chunks (≥ 3 chunks bornés sur `2 × 64 KiB + 17`).
- X5 : 27 noms identiques et même ordre dans les gardes Rust/TypeScript/PowerShell; 27 preuves protégées bit-for-bit inchangées; `protectedDestinations = []`, `writesUnderItsOwnTaskOnly = true`; `main` intacte.

IMPORTANT_FILES:
- `src-tauri/src/map/content_signals.rs`; `src-tauri/src/map/fixtures.rs` (commentaire seul); `src/map/contentScenario.ts`; `scripts/task0023-ec15-run-real-host.ps1` (préfixe de variante `x9`); `docs/reviews/ACTION-0037-independent-control.md`; `docs/tasks/TASK-0023-exact-content-observations.md`; `docs/decisions/DEC-0025-exact-content-observation-boundary.md`; deux preuves `docs/performance/runs/TASK-0023-EC15-*`.

COMMIT: <a-remplir>
PUSHED: yes

LIMITS_OR_BLOCKERS:
- Les quatre tests `#[cfg(unix)]` de non-suivi de lien ne sont pas compilés sur cet hôte Windows; la création de `symlink_file`/`symlink_dir` a été refusée faute de privilège, donc la preuve exécutée du non-suivi est la jonction, plus deux tests déterministes de classification.
- Preuve de streaming comportementale (compteur de lectures), pas un profileur mémoire; aucune dépendance ajoutée.
- `cargo fmt --check` et `cargo clippy -D warnings` signalent des écarts **préexistants** hors du code ajouté (chaîne d'outils locale plus récente); aucun reformatage global effectué.
- Aucun rejeu `J12`/`K11`/`K12`/`L12`/`M12`/`N15`/`H9` : code non touché. `B0` contourné par `CARGO_INCREMENTAL=0`, sans `clean`.
- DEC-0013/F physical identity persistence remains blocked.

NEXT_ORCHESTRATOR_DECISION:
- re-contrôle indépendant X9 / TASK-0023
