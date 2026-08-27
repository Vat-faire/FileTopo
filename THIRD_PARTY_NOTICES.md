# Third-party notices

FileTopo uses open source components. The versions below are resolved by
`pnpm-lock.yaml` and `src-tauri/Cargo.lock` as of 2026-08-26. The script
`scripts/dependency-inventory.ps1` reproduces this inventory from those
lockfiles and fails if a Rust package declares no licence.

## Distributed JavaScript dependencies

| Declared licence | Resolved packages and versions |
|---|---|
| Apache-2.0 OR MIT | `@tauri-apps/api 2.11.1` |
| BSD-3-Clause | `@webgpu/types 0.1.72`, `tiny-lru 11.4.7` |
| ISC | `earcut 3.2.3` |
| MIT | `@pixi/colord 2.9.6`, `@types/earcut 3.0.0`, `@xmldom/xmldom 0.8.15`, `eventemitter3 5.0.4`, `gifuct-js 2.1.2`, `ismobilejs 1.1.1`, `js-binary-schema-parser 2.0.3`, `parse-svg-path 0.2.0`, `pixi.js 8.20.0`, `react 19.2.8`, `react-dom 19.2.8`, `scheduler 0.27.0` |

JavaScript development tools are not distributed inside the application. They
are nonetheless covered by the script's full inventory. The complete JavaScript
graph contains 172 entries: Apache-2.0 (5), Apache-2.0 OR MIT (3),
BSD-2-Clause (2), BSD-3-Clause (4), CC-BY-4.0 (1), ISC (8), MIT (148) and
MIT-0 (1).

## Direct Rust dependencies

| Use | Component | Version | Declared licence |
|---|---|---:|---|
| build | tauri-build | 2.6.3 | Apache-2.0 OR MIT |
| test | tempfile | 3.27.0 | MIT OR Apache-2.0 |
| runtime | rusqlite | 0.40.2 | MIT |
| runtime | serde | 1.0.229 | MIT OR Apache-2.0 |
| runtime | serde_json | 1.0.151 | MIT OR Apache-2.0 |
| runtime | tauri | 2.11.5 | Apache-2.0 OR MIT |
| runtime | tauri-plugin-dialog | 2.7.2 | Apache-2.0 OR MIT |
| runtime | thiserror | 2.0.20 | MIT OR Apache-2.0 |
| runtime | uuid | 1.25.0 | Apache-2.0 OR MIT |

The conservative locked Rust graph contains 456 packages and covers every
target Cargo knows about, including conditional dependencies that are not
embedded in the Windows binary. No licence is missing. The expressions
encountered belong to these families: MIT, Apache-2.0, BSD-3-Clause, ISC, Zlib,
Unicode-3.0, Unlicense, CC0-1.0, MIT-0 and MPL-2.0, along with choices between
them. Two expressions also offer LGPL-2.1-or-later as an alternative to MIT or
Apache-2.0; they are therefore not exclusively LGPL dependencies.

## SQLite

`rusqlite` is compiled with the `bundled` feature. The SQLite version observed
in the verified binary is 3.53.2. SQLite is declared public domain by its
project; `rusqlite` is MIT licensed.

## Documentation

The [code of conduct](CODE_OF_CONDUCT.md) is inspired by the spirit of the
[Contributor Covenant](https://www.contributor-covenant.org) but is an original
text, not a copy or an official translation of it.

## Distribution

This document is a technical inventory, not legal advice. Before any
distribution, the responsible person must regenerate the inventory, review the
licence choices applicable to the targeted binary, and include the licence
texts or notices those choices require. No artifact is published at this stage.
