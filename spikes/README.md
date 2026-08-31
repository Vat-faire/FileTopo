# spikes/ — Bancs d'essai jetables de TASK-0012

Ce répertoire contient les **bancs d'essai** (`spikes`) écrits pour
[TASK-0012](../docs/tasks/TASK-0012-technical-risk-gates.md), sous le GO P3 de
Sébastien du 2026-08-31.

## Ce que ce répertoire n'est pas

**Ce n'est pas du code de production.** Rien ici n'est destiné à être livré,
importé, compilé ou réutilisé par FileTopo. Le contenu de `spikes/` est
**jetable** : il existe pour produire des mesures et des verdicts, puis pour
être lu comme preuve. Il ne définit aucune capacité du produit.

Un chiffre produit ici est une **mesure de banc d'essai**, obtenue dans les
conditions décrites par sa fiche. Ce n'est jamais une performance annoncée de
FileTopo.

## Règles d'isolation

1. **Aucun fichier de production n'est touché.** `src/`, `src-tauri/`,
   `tests/`, `public/`, `scripts/`, `.github/` et `graph/` restent intacts.
2. **Aucun import croisé.** Aucun fichier de `spikes/` n'est importé, référencé
   ni compilé par le code de production, et réciproquement.
3. **Aucun manifeste partagé.** `spikes/` ne touche ni `package.json`, ni
   `pnpm-lock.yaml`, ni `src-tauri/Cargo.toml`, ni `src-tauri/Cargo.lock`.
   Chaque spike qui a besoin d'une dépendance porte **son propre** manifeste et
   **son propre** verrou, confinés dans son sous-répertoire.
4. **Aucune écriture hors du dépôt.** Tout ce que les spikes écrivent sur le
   disque va sous `spikes/.work/`, ignoré par Git et supprimé après usage.
   Aucun répertoire temporaire système, aucun autre volume, aucune racine
   analysée.

## Règle de données

**Toutes les données sont synthétiques**, générées sur place par les
générateurs de `fixtures/`. Aucun fichier réel, aucun dossier utilisateur,
aucune base d'un cerveau existant, aucun corpus personnel, aucun élément d'une
interface privée de référence n'est lu, listé, copié ni mesuré.

Aucun chemin local personnel et aucun secret n'apparaît dans un fichier
commité.

## Contenu

| Répertoire | Banc | Objet |
|---|---|---|
| `fixtures/` | commun | Générateurs d'arborescences et de bases synthétiques |
| `b1-sqlite-migration/` | `B1` | Bascule de migration SQLite sur Windows, `M-C` contre `M-B` |
| `b2-svg-rendering/` | `B2` | Rendu HTML/SVG virtualisé, mesures d'images par seconde et de latence |
| `b3-windows-identity/` | `B3` | Identité `VolumeSerialNumber` + `FileId` en Rust stable |
| `b4-cloud-attributes/` | `B4` | Attributs infonuagiques Windows, fixture simulée |

## Où sont les résultats

Les mesures et les verdicts ne vivent **pas** ici :

- [docs/research/TASK-0012-risk-gate-results.md](../docs/research/TASK-0012-risk-gate-results.md) — journal, preuves et verdicts de `B0` à `B4`;
- [docs/performance/PERF-0001-b2-rendering.md](../docs/performance/PERF-0001-b2-rendering.md) — mesures de `B2`;
- [docs/performance/PERF-0002-b1-sqlite-migration.md](../docs/performance/PERF-0002-b1-sqlite-migration.md) — mesures de `B1`;
- [docs/performance/PERF-0003-b3-windows-identity.md](../docs/performance/PERF-0003-b3-windows-identity.md) — mesures de `B3`.
