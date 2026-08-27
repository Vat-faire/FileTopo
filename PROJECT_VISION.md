# PROJECT_VISION.md — Project vision

> Statement of intent, written before any code existed. It is kept as a record
> of the original intention. Where a point has since been decided or built, the
> note says so; nothing else has been rewritten after the fact.

## 1. Guiding idea

Offer a **topographic map** of folders and documents: instead of a tree shown
as a list, a relief in which density, volume, age and kinship of the contents
draw a landscape readable at a glance. People find, understand and navigate
their own corpus.

## 2. Positioning

- **A public, general application.** It targets no profession, no organisation
  and no particular corpus. Anyone must be able to use it on their own folders.
- **Free.** No payment, no account required, no feature held back behind a paid
  tier.
- **An MVP with no account, no key, no subscription and no mandatory
  telemetry.** None of these is required to use the local, offline product.
- **Licence considered: MIT**, *subject to verification* in phase 1
  (compatibility with any reused components, name availability, attribution
  obligations). *Decided since: MIT, see `docs/decisions/DEC-0002-license.md`.*

## 3. Founding principles

### 3.1 Local first

The map is **local**. Analysis runs on the user's machine. No document content
is sent to a remote service.

### 3.2 Windows first

The first target platform is **Windows**. Other systems are not excluded but
are not an MVP goal.

### 3.3 An offline MVP with no AI

The first usable product works **without a network connection** and **without
any artificial intelligence model**. Ranking, grouping and relief rest on
deterministic, explainable signals: structure, metadata, sizes, dates,
extensions, simple textual similarity. Any AI layer would come later, be
optional, and be switchable.

### 3.4 Several independent brains

A user can create **several brains** (each with a name, a colour and an icon),
each tied to a **root** they choose. Each brain is **independent**: its index,
its map and its settings are its own, and deleting one does not affect the
others. Within a brain, the user **navigates**, **searches** and **filters** a
progressive map, and can **open a file or folder with the associated Windows
application**. The map distinguishes recent changes and a **seen / unseen**
state per item.

### 3.5 A rebuildable, versioned index with incremental watching

A brain's index is **rebuildable** (it can be regenerated identically from the
root) and **versioned** (its format carries a version number). **Safe
exclusions** — system folders, temporary files, large irrelevant trees — can be
defined so that what should not be indexed is not. After a first analysis,
changes are picked up **incrementally**: only modified items are reprocessed,
without a systematic full re-walk. **Online-only files**, such as
sync-on-demand cloud storage, are **never downloaded automatically** by the
application.

*Status: rebuildable and versioned indexes are built. Incremental watching is
not implemented in 0.1.0-alpha.1; the index is rebuilt in full.*

### 3.6 Windows robustness and FR/EN accessibility

The application aims at particular **robustness** on Windows: long paths,
special characters, file locks, permissions, removable and network drives. The
interface is **bilingual French / English** by design, with attention to
contrast, keyboard navigation, text sizes, and non-visual alternatives to the
map.

*Status: the interface is bilingual and follows the system language, with
English as the fallback. Accessibility has been inspected visually but never
audited by a tool or a specialist.*

### 3.7 Rendering not decided

The map's rendering mode — SVG, Canvas or WebGL — is **not decided** at this
stage. The choice follows a comparison in phase 2 (see `ROADMAP.md`).

*Decided since: PixiJS/WebGL with an SVG relief fallback, see
`docs/decisions/DEC-0005-rendering-and-relief.md`.*

### 3.8 Non-destruction by default

**By default, and for the whole MVP, the application never modifies the
documents or folders it analyses.** No physical reorganisation of the corpus is
planned in the MVP: read-only, no renaming, moving, rewriting or deletion of
the user's documents. The artifacts produced — index, cache — are stored
separately and can be deleted with no consequence for the corpus.

A **future, optional** filing feature could propose a **virtual** arrangement,
without touching the real files, with preview, simulation, explicit
confirmation, an action log and the ability to restore. Such a feature remains
hypothetical: it is neither decided nor built (see phase 7 of `ROADMAP.md`).

## 4. Outside the MVP scope

- Cloud synchronisation, user accounts, collaboration.
- Automatic tidying or physical correction of the user's tree.
- Paid features, mandatory telemetry, advertising.
- **AI, OCR and connectors to remote services**: conceivable only as
  **future**, **optional** features that the user **explicitly enables** (see
  phase 7 of `ROADMAP.md`); absent from the MVP.

## 5. Originally undecided

Inputs to **phase 1** (see `ROADMAP.md`):
- The project's **final public name** — *decided since: FileTopo, as a
  reversible working name, see `docs/decisions/DEC-0001-public-name.md`.*
- The **definitive licence** — *decided since: MIT.*

Inputs to **phase 2** (see `ROADMAP.md`):
- The **technology stack** and index format — *decided since: Tauri 2, Rust,
  React/TypeScript, Vite, and one embedded SQLite index per collection.*
- The **rendering mode** and layout method — *decided since: PixiJS/WebGL.*
- The relief representation model — *decided since, see
  `docs/decisions/DEC-0005-rendering-and-relief.md`.*

Still undecided today: the final visual identity, and the definitive UX for
exclusions and level of detail.
