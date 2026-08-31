# DEC-0007 — Pile technologique de reconstruction

- **Date :** 2026-08-31
- **Statut :** `APPROVED`
- **Phase :** 1
- **Décideur :** **Sébastien — GO explicite du 2026-08-31.** Porte P2 de
  [TASK-0011](../tasks/TASK-0011-functional-architecture-baseline.md)
  franchie; cette fiche est **approuvée**.
- **Approuvée le :** 2026-08-31
- **replaced_by :** —

> **Décision arrêtée.** Sébastien a franchi la porte P2 le 2026-08-31 et a
> retenu l'**option B**. Le classement et les options écartées sont conservés
> ci-dessous comme motif de la décision. **Aucune ligne de code n'a été écrite
> et rien n'a été exécuté :** cette fiche reste entièrement documentaire.

## Contexte

`DEC-0003` (Tauri 2, Rust, React, TypeScript), `DEC-0004` (SQLite) et
`DEC-0005` (PixiJS/WebGL et relief) sont `VERIFIED` et datent du 2026-08-25.
Elles ont été prises pour une conception de **carte en relief à un million de
nœuds**. La cible actuelle est une **carte hiérarchique en blocs** dérivée de
l'arborescence réelle, à 100 000 éléments au MVP
([BASELINE_TARGETS.md](../performance/BASELINE_TARGETS.md)).

Le changement de cible impose de réexaminer la pile **sur preuves**. Aucune
réécriture n'est supposée : l'option « conserver intégralement » est traitée
comme une option de plein droit, avec ses avantages propres.

Un actif réel existe : environ 1 725 lignes de Rust et 1 077 lignes de
TypeScript/TSX au commit `01e6860f`, dont une séparation registre/index, un
scanner prudent qui ne suit pas les points de réanalyse, des requêtes paginées
et un confinement de chemin — tous listés « à conserver après preuve » par
[BASELINE_ASSESSMENT.md](../archive/v0.1-alpha/BASELINE_ASSESSMENT.md).

## Options examinées

| Option | Avantages | Inconvénients |
|--------|-----------|---------------|
| **A — Conserver intégralement** (Tauri 2 + Rust + React + TypeScript + SQLite) | Zéro coût de migration; l'actif de 2 800 lignes reste utilisable; la frontière de confiance de `DEC-0003` est documentée par l'éditeur (Tauri : cœur « full access », WebView « only access via the well-defined IPC layer »); WebView2 préinstallé depuis Windows 10 1803; les modules à conserver (scanner, confinement, pagination) le sont sans réécriture; MIT et licences déjà inventoriées | Ne corrige rien par elle-même : la carte en blocs, les identifiants stables et la surveillance restent entièrement à construire; l'identité de fichier Windows n'est pas atteignable par la bibliothèque standard Rust sur le canal stable (voir §Preuves, C5); PixiJS 8 n'offre **aucun** repli Canvas 2D |
| **B — Conserver le cœur, faire évoluer l'interface** (Tauri 2 + Rust + SQLite conservés; couche de rendu réexaminée par `DEC-0008`) | Conserve tout l'actif privilégié — scanner, index, confinement — qui est la partie coûteuse et la plus sensible en sûreté; permet de sortir de PixiJS/WebGL si `DEC-0008` le justifie, sans toucher au reste; le rendu est précisément la partie du prototype déclarée « à remplacer » | Deux décisions couplées (`DEC-0007` et `DEC-0008`) doivent rester cohérentes; les 1 077 lignes de TypeScript sont partiellement à refaire; le travail de rendu est le moins avancé et le moins mesuré |
| **C — Faire évoluer le conteneur** (quitter Tauri 2 pour WinUI 3/.NET, Wails ou Electron) | WinUI 3 offre l'intégration Windows la plus directe; Electron a l'écosystème le plus large | Rejette l'intégralité de l'actif Rust; `DEC-0003` avait déjà classé ces options en dessous de Tauri sur sécurité, performance et distribution; aucune preuve nouvelle ne contredit ce classement; le principe du moindre privilège serait affaibli par Electron; portabilité nulle avec WinUI 3 |
| **D — Faire évoluer le stockage** (quitter SQLite pour un magasin clé-valeur ou une base graphe) | Écritures ordonnées à gros volume (RocksDB); relations natives (base graphe) | SQLite couvre déjà les besoins établis : transactions, WAL à un écrivain, FTS5, `user_version`, `integrity_check`, API de sauvegarde en ligne, limites très au-delà des cibles du MVP; aucune contrainte mesurée ne justifie le changement; une base graphe est explicitement inutile pour un MVP hiérarchique |

## Décision

**Option B retenue — conserver le cœur, faire évoluer uniquement le rendu.**
Tauri 2, Rust stable, React, TypeScript et SQLite sont **conservés**; seule la
couche de rendu est remplacée ou fait évoluer, sous [DEC-0008](DEC-0008-hierarchical-rendering.md).
Sébastien a arrêté ce choix le 2026-08-31 en franchissant la porte P2.

Le classement qui avait été soumis, et qui reste le motif de la décision :


1. **B — conserver le cœur, réexaminer le rendu** (recommandé);
2. **A — conserver intégralement** (acceptable, si `DEC-0008` conclut au
   maintien de WebGL);
3. **D — faire évoluer le stockage** (non justifié par une preuve à ce jour);
4. **C — faire évoluer le conteneur** (rejeté sauf preuve nouvelle).

Ce que la fiche propose de **reconduire**, de **réviser** et de rendre
**caduc** dans les fiches vérifiées — sans les modifier :

| Fiche vérifiée | Élément | Proposition |
|---|---|---|
| `DEC-0003` | Tauri 2 comme conteneur | **Reconduit** — confirmé par la documentation Tauri sur les frontières de confiance et les capacités |
| `DEC-0003` | Rust stable comme cœur privilégié | **Reconduit avec une réserve** — l'identité de fichier Windows n'est pas accessible sur stable par la bibliothèque standard; une dépendance d'API Windows devient probablement nécessaire (voir `DEC-0009`) |
| `DEC-0003` | React + TypeScript + Vite | **Reconduit** — aucune preuve contraire |
| `DEC-0003` | Frontière de confiance et commandes étroites | **Reconduit sans réserve** — c'est la partie la mieux étayée |
| `DEC-0003` | « Rendu : PixiJS/WebGL, décidé dans `DEC-0005` » | **Renvoyé à `DEC-0008`** |
| `DEC-0004` | SQLite par cerveau, accès Rust exclusif, WAL à un écrivain | **Reconduit** |
| `DEC-0004` | Chemin relatif UTF-16LE autoritatif | **Reconduit** |
| `DEC-0004` | Clé stable = identité de volume + identifiant de fichier Windows | **À réviser** — atteignable en principe, mais **pas** via la bibliothèque standard Rust sur stable; voir `DEC-0009` |
| `DEC-0004` | Tables `layout_cells` et `map_tiles` dimensionnées pour un million de nœuds | **Probablement caduc** — l'échelle du MVP est 100 000; à trancher avec `DEC-0008` |
| `DEC-0005` | Relief composite à six signaux, un million de nœuds, tuiles logiques | **Probablement caduc pour le MVP** — la cible est une carte en blocs hiérarchiques, pas un relief; voir `DEC-0008` |

**Le contenu historique de ces trois fiches reste intact.** Sous le GO du
2026-08-31, seul leur champ `replaced_by` a été mis à jour, conformément à
[docs/decisions/README.md](README.md) : `DEC-0003` → `DEC-0007`,
`DEC-0004` → [DEC-0009](DEC-0009-data-model-and-relations.md),
`DEC-0005` → [DEC-0008](DEC-0008-hierarchical-rendering.md). Aucune autre
ligne de `DEC-0001` à `DEC-0006` n'a été touchée.

## Motif

**B plutôt que A** parce que le seul élément de la pile que le changement de
cible remet réellement en cause est le **rendu** : la carte en blocs n'a pas
les mêmes contraintes qu'un relief à un million de nœuds, et PixiJS 8 ne
fournit aucun repli Canvas 2D, ce qui est un fait vérifié et non une
supposition. Le reste de la pile — conteneur, cœur, stockage — n'est
contredit par aucune source consultée.

**B plutôt que C** parce que rejeter l'actif Rust coûterait la partie la plus
coûteuse et la plus sensible du prototype (scanner prudent, confinement de
chemin, séparation registre/index) sans qu'aucune preuve n'établisse un gain.
`DEC-0003` avait classé C en dessous sur des critères que rien n'a invalidés.

**B plutôt que D** parce que SQLite couvre chaque besoin établi de la baseline
avec des primitives officiellement documentées, et que ses limites publiées
sont de plusieurs ordres de grandeur au-delà des cibles du MVP.

**Réserve honnête sur A.** Si `DEC-0008` conclut que WebGL reste le bon
moteur, A et B deviennent équivalents en pratique. Le classement ne préjuge
donc pas de `DEC-0008` : il exige seulement que la question soit posée.

## Conséquences

- `DEC-0007` n'a pas été approuvée seule : l'option B renvoie explicitement à
  [DEC-0008](DEC-0008-hierarchical-rendering.md), et les deux fiches ont été
  approuvées ensemble le 2026-08-31.
- B étant retenue, une dépendance d'API Windows devient probablement nécessaire
  pour l'identité de fichier; son nom, sa version et sa licence doivent être
  établis par le banc d'essai `B3` de
  [TASK-0012](../tasks/TASK-0012-technical-risk-gates.md), après inventaire de
  licence, jamais ajoutés silencieusement.
- Aucune dépendance n'est ajoutée, retirée ni mise à jour par cette fiche.
- L'inventaire de licences reste à refaire au moment du verrouillage des
  versions, comme `DEC-0003` le prévoyait.

## Preuves

| # | Fait | Source primaire | Consultée le |
|---|---|---|---|
| P1 | Tauri 2 : le cœur Rust a « full access to all available system resources »; le WebView « only access to exposed system resources via the well-defined IPC layer » | https://v2.tauri.app/security/ | 2026-08-31 |
| P2 | Les capacités déclarent quelles permissions sont accordées à quelles fenêtres; « The security boundaries are depending on window labels (not titles) » | https://v2.tauri.app/security/capabilities/ | 2026-08-31 |
| P3 | « WebView 2 is already installed on Windows 10 (from version 1803 onward) and later versions of Windows » | https://v2.tauri.app/start/prerequisites/ | 2026-08-31 |
| P4 | SQLite WAL : un écrivain, lecteurs concurrents; « WAL does not work over a network filesystem » | https://www.sqlite.org/wal.html | 2026-08-31 |
| P5 | SQLite : `PRAGMA user_version` application-défini; `integrity_check` ne détecte pas les erreurs de clé étrangère | https://www.sqlite.org/pragma.html#pragma_user_version | 2026-08-31 |
| P6 | SQLite : base jusqu'à ~281 To, chaîne/BLOB 1 000 000 000 octets par défaut — très au-delà des cibles du MVP | https://www.sqlite.org/limits.html | 2026-08-31 |
| P7 (C5) | Rust stable : `volume_serial_number()`, `file_index()`, `number_of_links()`, `change_time()` sont **`nightly-only`** et renvoient `None` depuis `DirEntry::metadata` | https://doc.rust-lang.org/std/os/windows/fs/trait.MetadataExt.html | 2026-08-31 |
| P8 | PixiJS 8 : WebGL « ✅ Recommended », WebGPU « 🚧 Experimental », Canvas « ❌ Coming-soon » | https://pixijs.com/8.x/guides/components/renderers | 2026-08-31 |
| P9 | Constat de code, lecture statique au commit `01e6860f` : 1 725 lignes Rust, 1 077 lignes TS/TSX; `rusqlite 0.40.2`, `tauri 2`, `pixi.js ^8.12.0`, `react ^19.1.0` | `src-tauri/Cargo.toml`, `package.json` | 2026-08-31 |

## Limites

- **Non testé.** Aucun build, aucune compilation, aucune installation, aucune
  mesure. P7 est vérifié sur la documentation officielle, **pas** par une
  compilation qui échouerait.
- Le classement est un jugement de projet appuyé sur des sources, pas un
  résultat expérimental.
- Aucune version exacte n'est verrouillée ni recommandée ici.
- L'inventaire de licences des dépendances actuelles n'a pas été refait
  pendant `TASK-0011`.
