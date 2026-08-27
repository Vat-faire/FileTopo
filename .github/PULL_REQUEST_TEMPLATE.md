## What this changes

<!-- What does this contribution change, and why? -->

## Checks actually run

Tick what you **actually ran**, and leave the rest unticked. An unticked box is
not a reproach; a false claim is.

- [ ] `pnpm install --frozen-lockfile`
- [ ] `pnpm check`
- [ ] `pnpm test`
- [ ] `pnpm build`
- [ ] `cargo fmt --manifest-path src-tauri/Cargo.toml --all -- --check`
- [ ] `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`
- [ ] `cargo test --manifest-path src-tauri/Cargo.toml`
- [ ] `pwsh -File scripts/audit-public-readiness.ps1`

## Data

- [ ] No personal path, real file name, document content or screenshot of
      private data is added.
- [ ] Added tests use `tests/fixtures_synthetic` or a temporary directory
      created and destroyed by the test.

## Sensitive changes

If this contribution touches the scanner, path resolution, the File Explorer
reveal, storage or the Tauri commands:

- [ ] Refusal tests are added: traversal, symbolic link or reparse point,
      unknown identifier, cancellation, and absence of writes inside the root.

## User-facing strings

- [ ] No new string, **or** the string was added to both the `fr` and `en`
      dictionaries in `src/App.tsx`.

## Dependencies

- [ ] No dependency added, **or** both lockfiles are updated, the inventory is
      regenerated and `THIRD_PARTY_NOTICES.md` is corrected.
