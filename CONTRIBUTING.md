# Contributing to FileTopo

Thank you for keeping the central principle intact: **no contribution may
require access to personal documents, and none may modify an indexed
collection.**

By taking part you accept the [code of conduct](CODE_OF_CONDUCT.md). FileTopo
is at **alpha** status: read the known limits in [CHANGELOG.md](CHANGELOG.md)
before reporting something as missing.

Issues and pull requests may be written in English or French. Public
documentation is written in English, with a French translation of the README.

## Environment and verification

On Windows, install Node.js 24, pnpm 10, Rust stable MSVC, WebView2 and the
Visual Studio Build Tools 2022. Then run:

```powershell
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
$env:CARGO_INCREMENTAL = '0'
cargo fmt --manifest-path src-tauri/Cargo.toml --all -- --check
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
cargo test --manifest-path src-tauri/Cargo.toml
pwsh -File scripts/dependency-inventory.ps1
pwsh -File scripts/audit-public-readiness.ps1
```

The publishability audit fails when a Git remote is configured. That is
deliberate while the project is unpublished. On a clone from GitHub, or in
continuous integration, pass `-AllowRemotes`: the checks for secrets, personal
paths and large files stay strict.

The same chain runs automatically on Windows through
[`.github/workflows/ci.yml`](.github/workflows/ci.yml), except for the NSIS
bundle build.

## Building a release

Do not run `pnpm tauri build` directly for anything you intend to share. Use:

```powershell
pwsh -File scripts/build-release-clean.ps1
```

It remaps build-machine paths out of the binary, then scans the artifact with
`scripts/scan-binary-for-personal-paths.ps1` and fails if anything leaked. You
can run that scan on its own at any time:

```powershell
pwsh -File scripts/scan-binary-for-personal-paths.ps1
```

## Test data

- Use only `tests/fixtures_synthetic` or a temporary directory created and
  destroyed by the test.
- Never add a personal absolute path, a copy of a real file, a client name, a
  secret, or a screenshot containing private data.
- Never point a test, a demo or a benchmark at a user folder.
- Fixtures must be small, deterministic and obviously fictional.

## Sensitive changes

Any change to the scanner, path resolution, the File Explorer reveal, storage
or the Tauri commands must come with refusal tests: traversal, symbolic
link or reparse point, unknown identifier, cancellation, and absence of writes
inside the root.

Network, AI, OCR or physical reorganisation features are outside the MVP. They
must stay optional, disabled by default, and be covered by a documented
decision.

## Interface language

The interface resolves its language in this order: an explicit choice stored by
the user, then the system or browser language (any `fr` locale gets French),
then English as the fallback. When you add a user-facing string, add it to
**both** dictionaries in `src/App.tsx`. Language behaviour is covered by
`src/lib/locale.test.ts` and `src/App.test.tsx`.

## Dependencies and publication

Both lockfiles must be updated with any dependency change. Re-run the inventory
and update `THIRD_PARTY_NOTICES.md`. A local commit authorises neither a
remote, nor signing, nor distribution, nor publication.
