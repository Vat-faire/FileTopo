# Avis de composants tiers

FileTopo utilise des composants open source. Les versions ci-dessous sont
résolues par `pnpm-lock.yaml` et `src-tauri/Cargo.lock` au 2026-08-26. Le
script `scripts/dependency-inventory.ps1` reproduit l'inventaire à partir de
ces fichiers verrouillés et échoue si un paquet Rust ne déclare aucune
licence.

## Dépendances JavaScript distribuées

| Licence déclarée | Paquets et versions résolus |
|---|---|
| Apache-2.0 OR MIT | `@tauri-apps/api 2.11.1` |
| BSD-3-Clause | `@webgpu/types 0.1.72`, `tiny-lru 11.4.7` |
| ISC | `earcut 3.2.3` |
| MIT | `@pixi/colord 2.9.6`, `@types/earcut 3.0.0`, `@xmldom/xmldom 0.8.15`, `eventemitter3 5.0.4`, `gifuct-js 2.1.2`, `ismobilejs 1.1.1`, `js-binary-schema-parser 2.0.3`, `parse-svg-path 0.2.0`, `pixi.js 8.20.0`, `react 19.2.8`, `react-dom 19.2.8`, `scheduler 0.27.0` |

Les outils de développement JavaScript ne sont pas distribués dans
l'application. Ils restent néanmoins couverts par l'inventaire complet du
script. Le graphe JavaScript complet contient 172 entrées : Apache-2.0 (5),
Apache-2.0 OR MIT (3), BSD-2-Clause (2), BSD-3-Clause (4), CC-BY-4.0 (1),
ISC (8), MIT (148) et MIT-0 (1).

## Dépendances Rust directes

| Usage | Composant | Version | Licence déclarée |
|---|---|---:|---|
| compilation | tauri-build | 2.6.3 | Apache-2.0 OR MIT |
| test | tempfile | 3.27.0 | MIT OR Apache-2.0 |
| exécution | rusqlite | 0.40.2 | MIT |
| exécution | serde | 1.0.229 | MIT OR Apache-2.0 |
| exécution | serde_json | 1.0.151 | MIT OR Apache-2.0 |
| exécution | tauri | 2.11.5 | Apache-2.0 OR MIT |
| exécution | tauri-plugin-dialog | 2.7.2 | Apache-2.0 OR MIT |
| exécution | thiserror | 2.0.20 | MIT OR Apache-2.0 |
| exécution | uuid | 1.25.0 | Apache-2.0 OR MIT |

Le graphe Rust verrouillé conservateur contient 456 paquets et couvre toutes
les cibles connues par Cargo, y compris des dépendances conditionnelles qui
ne sont pas embarquées dans le binaire Windows. Aucune licence n'est absente.
Les expressions rencontrées appartiennent aux familles suivantes : MIT,
Apache-2.0, BSD-3-Clause, ISC, Zlib, Unicode-3.0, Unlicense, CC0-1.0,
MIT-0 et MPL-2.0, ainsi qu'à des alternatives entre ces licences. Deux
expressions offrent aussi LGPL-2.1-or-later comme alternative à MIT ou
Apache-2.0; elles ne constituent donc pas une dépendance exclusivement LGPL.

## SQLite

`rusqlite` est compilé avec la fonction `bundled`. La version SQLite observée
dans le binaire vérifié est 3.53.2. SQLite est déclaré domaine public par son
projet; `rusqlite` est sous licence MIT.

## Distribution

Ce document est un inventaire technique, pas un avis juridique. Avant toute
distribution, la personne responsable doit générer de nouveau l'inventaire,
examiner les choix de licence applicables au binaire ciblé et joindre les
textes de licence ou avis exigés par ces choix. Aucun artefact n'est publié
au stade actuel.
