# TASK-0012 — Résultats des bancs d'essai de levée des risques techniques

- **Tâche :** [TASK-0012](../tasks/TASK-0012-technical-risk-gates.md)
- **Branche d'exécution :** `spike/v0.2-technical-risk-gates`
- **Commit de départ :** `db8d3de0b20e7efbfe463a17c218cc14face39a8`
- **Autorisation :** GO P3 explicite de Sébastien, 2026-08-31
- **Exécuteur :** Claude Code
- **Date d'exécution :** 2026-08-31
- **Statut de ce document :** journal de preuves. Il **n'attribue aucun
  `VERIFIED`** et ne modifie aucune fiche `DEC`.

> **Lecture obligatoire.** Chaque chiffre de ce document est une mesure de banc
> d'essai obtenue dans les conditions déclarées ci-dessous, sur du matériel
> unique, avec des données **entièrement synthétiques**. Ce n'est **jamais**
> une capacité annoncée de FileTopo. Ce qui n'a pas été exécuté est marqué
> **« non testé »**. Une cible manquée est publiée comme manquée.

---

## 0. Matériel et outillage de référence

Déclaré **avant la première mesure**, conformément à §12.4 de `TASK-0012`.
Toutes les mesures de `B0` à `B4` proviennent de cette configuration unique.

### 0.1 Machine

| Élément | Valeur |
|---|---|
| Processeur | Intel Core i9-9900K, 3,60 GHz nominal |
| Cœurs | 8 physiques / 16 logiques |
| Mémoire vive | 63,9 Gio |
| Carte graphique | NVIDIA GeForce RTX 2070, pilote 32.0.16.1656 |
| Disque du dépôt | Samsung SSD 970 EVO Plus 1 To, NVMe |
| Volume du dépôt | `C:`, NTFS, 930,6 Gio, 301,6 Gio libres au départ |
| Système | Windows 11 Professionnel, version 10.0.26200, build 26200, 64 bits |
| Mode d'alimentation | « Utilisation normale » (`381b4222-f694-41f0-9685-ff5bb260df2e`) |

**Machine unique.** Aucune mesure n'a été reproduite sur une seconde machine.
Toute conclusion de portabilité est donc **non testée**.

**Machine de développement, non isolée.** Les mesures ont été prises sur un
poste de travail ordinaire, avec ses services habituels en arrière-plan et son
antivirus actif. Elles n'ont **pas** été prises dans un banc d'essai maîtrisé.
Le bruit de fond est réel et non quantifié; c'est la raison pour laquelle les
écarts min–max sont publiés à côté de chaque médiane.

### 0.2 Outillage

| Outil | Version exacte | Relevée par |
|---|---|---|
| Node.js | v24.13.1 | `node --version` |
| pnpm | 10.31.0 | `pnpm --version` |
| npm | 11.17.0 | `npm --version` |
| rustc | 1.98.0 (88d9e12ae 2026-08-18) | `rustc --version` |
| cargo | 1.98.0 (797e8a9bc 2026-08-05) | `cargo --version` |
| Chaîne Rust active | `stable-x86_64-pc-windows-msvc` (défaut) | `rustup show active-toolchain` |

Le canal Rust utilisé est **`stable`**. Le canal `nightly` n'est employé nulle
part, conformément à §10.1.1 de `TASK-0012`.

### 0.3 Protocole commun aux mesures chronométrées

1. **Cinq exécutions minimum** par scénario chronométré.
2. **Médiane** publiée comme valeur de référence, avec **l'écart min–max**
   complet. Aucune moyenne, aucune exécution écartée comme « aberrante ».
3. Le protocole exact de chaque banc est décrit dans sa section.
4. Aucun chiffre n'entre dans `docs/performance/` sans avoir été mesuré.

### 0.4 Isolation et données

- Toutes les données sont **synthétiques**, générées par les spikes.
- Toute écriture disque des spikes reste sous `spikes/.work/`, ignoré par Git.
- Aucun manifeste ni verrou de la racine n'est modifié.
- Aucun fichier de production n'est touché.

---

## Sommaire des verdicts

| Banc | Objet | Verdict | Section |
|---|---|---|---|
| `B0` | Santé du prototype | **SUCCÈS** — état réel connu et écrit; 36/36 Vitest et 13/13 Rust réussis; `cargo build` en échec déterministe (ICE de cache incrémental), non corrigé | §1 |
| `B1` | Migration SQLite Windows | *en attente* | §2 |
| `B2` | Rendu HTML/SVG | *en attente* | §3 |
| `B3` | Identité Windows | *en attente* | §4 |
| `B4` | Attributs infonuagiques | *en attente* | §5 |

---

# 1. B0 — Santé du prototype

- **Commit testé :** `1f990689c0329b5ee17cac00b09315e9b281cab3`
- **Arbre de travail :** propre avant et après (`git status --porcelain` vide)
- **Verdict :** **SUCCÈS**, au sens de §7.2 de `TASK-0012` — chaque commande a
  été exécutée et son résultat réel est consigné, **y compris l'échec**.
- **Aucune correction n'a été appliquée**, conformément à §7.1.4 et §14.

> Rappel du critère : `B0` ne réussit pas parce que les tests passent. Il
> réussit parce que l'état réel est **connu et écrit**. Une commande a échoué;
> elle est publiée telle quelle.

## 1.1 Résultats bruts

| # | Commande | Code de retour | Durée | Résultat |
|---|---|---|---|---|
| 1 | `pnpm install --frozen-lockfile` | `0` | 849 ms | Verrou déjà à jour, étape de résolution ignorée |
| 2 | `pnpm test` (`vitest run`) | `0` | 11 182 ms | **36 / 36 réussis**, 0 échec, 2 fichiers |
| 3 | `pnpm check` (`tsc --noEmit`) | `0` | 2 807 ms | Aucune erreur de type |
| 4 | `pnpm build` (`tsc && vite build`) | `0` | 7 400 ms | 749 modules transformés, 13 artefacts émis |
| 5 | `cargo test --locked` | `0` | 46 517 ms | **13 / 13 réussis**, 0 échec, 0 ignoré |
| 6 | `cargo build --locked` | **`101`** | ~1 600 ms | **ÉCHEC — panique interne du compilateur (ICE)** |
| 7 | `CARGO_INCREMENTAL=0 cargo build --locked` | `0` | 14 708 ms | Compilation **réussie** |

Les durées des commandes 1 à 5 sont **une exécution unique** : ce sont des
constats de faisabilité, pas des mesures de performance. Elles ne sont donc pas
soumises à la règle des cinq exécutions de §12.5, qui s'applique aux mesures
chronométrées de `B1`, `B2` et `B3`. Elles ne doivent pas être citées comme des
performances.

## 1.2 Le décompte déclaré est confirmé

`CURRENT_STATE.md` annonçait « 36 cas Vitest et 13 tests Rust déclarés », sans
savoir s'ils passaient encore. Le décompte est exact **et** ils passent tous :

    Test Files  2 passed (2)
         Tests  36 passed (36)

    running 13 tests
    ...
    test result: ok. 13 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out

Les 13 tests Rust couvrent : `synthetic`, `index` (dont
`measures_synthetic_10k_and_100k_pipeline`), `scanner`, `registry` et six tests
d'intégration.

## 1.3 L'échec : panique interne du compilateur Rust

`cargo build --locked` échoue de façon **déterministe**, avec le code `101` :

    thread 'rustc' panicked at compiler\rustc_query_impl\src\plumbing.rs:147:9:
    Failed to recover key for impl_trait_header(93d4b58bede9df2a-9e6631c9f296cf3d)
    with key fingerprint 93d4b58bede9df2a-9e6631c9f296cf3d
    ...
    19: rustc_incremental::persist::save::save_dep_graph
    17: <rustc_middle::dep_graph::graph::DepGraph>::exec_cache_promotions
    ...
    error: the compiler unexpectedly panicked. This is a bug
    note: rustc 1.98.0 (88d9e12ae 2026-08-18) running on x86_64-pc-windows-msvc

### Reproductibilité observée

| Exécution | Résultat | Empreinte de la clé |
|---|---|---|
| 1 (initiale) | ICE, `101` | `93d4b58bede9df2a-9e6631c9f296cf3d` |
| 2 | ICE, `101` | identique |
| 3 | ICE, `101` | identique |
| 4 (après le build sans cache incrémental) | ICE, `101` | identique |

**4 échecs sur 4.** L'échec est déterministe, pas intermittent.

### Ce que l'échec est, et ce qu'il n'est pas

Un **diagnostic complémentaire** a été exécuté — une mesure supplémentaire,
**pas** une correction : la même commande relancée avec `CARGO_INCREMENTAL=0`
**réussit** en 14,7 s. Rien n'a été supprimé, déplacé ni réparé; le cache
incrémental de 779 Mio est toujours en place et l'ICE se reproduit toujours
après coup (exécution 4 ci-dessus).

On peut donc écrire, avec preuve :

- **Le code source du prototype compile** sur `rustc 1.98.0` stable. Les
  commandes 5 et 7 le démontrent : `cargo test --locked` et
  `CARGO_INCREMENTAL=0 cargo build --locked` réussissent toutes deux.
- **L'échec provient du cache de compilation incrémentale** de
  `src-tauri/target/debug/incremental/`, visible dans la pile d'appel
  (`rustc_incremental::persist::save::save_dep_graph`,
  `DepGraph::exec_cache_promotions`).
- Ce répertoire est un **artefact de construction ignoré par Git**
  (`/src-tauri/target/` dans `.gitignore`). Il **ne fait pas partie du dépôt**
  et n'est pas distribué.

**Distinction à ne pas effacer.** « Le dépôt ne se construit pas » serait faux.
« Sur cette machine, `cargo build` échoue tant que le cache incrémental hérité
n'est pas renouvelé » est ce qui a été observé. Un poste neuf, une intégration
continue ou un dépôt fraîchement cloné n'ont pas ce cache et ne sont **pas**
concernés — mais cela n'a **pas été testé** ici et reste une déduction.

### Ce qui n'est pas fait

La correction évidente — renouveler le cache incrémental — **n'a pas été
appliquée**. §7.1.4 et §14 de `TASK-0012` l'interdisent sans une autorisation
écrite distincte de Sébastien. L'échec est laissé en place.

## 1.4 Observations secondaires consignées

1. **Script de construction ignoré.** `pnpm install` signale :
   `Ignored build scripts: esbuild@0.28.2`. Le script de post-installation
   d'`esbuild` n'est pas exécuté par défaut sous pnpm 10. Cela n'a empêché ni
   les tests ni la construction du frontal, qui réussissent. Aucune action.
2. **Versions résolues plus récentes que les bornes du manifeste.** Le verrou
   fournit `vitest 3.2.7` (manifeste `^3.2.4`) et `vite 7.3.6` (manifeste
   `^7.0.4`). Comportement normal des bornes `^`; le verrou fait foi et n'a pas
   été modifié.
3. **Mise à jour de pnpm disponible** (10.31.0 → 11.24.0), **non appliquée** :
   `packageManager` épingle `pnpm@10.31.0` et §7.1.1 interdit toute mise à jour.

## 1.5 Intégrité : rien n'a été modifié

Empreintes SHA-256 relevées **avant** et **après** la totalité de `B0` :

| Fichier | SHA-256 | Identique après ? |
|---|---|---|
| `pnpm-lock.yaml` | `e1563316e9b38847337e568b59a7639b3c4d05c2c5c706279f2fa4ee0272d949` | **oui** |
| `src-tauri/Cargo.lock` | `f6d6da5595378e9a3f9f702c50bd6dbbd9e177bc6697fa4ba1a6bcbad6b73e63` | **oui** |
| `package.json` | `77c94b806e045c38f352e0f568ae75fe2f19042aa29dbccbbdc7df46756a8127` | **oui** |
| `src-tauri/Cargo.toml` | `efe6d6dcdb1abf63a54505d0907a18edda7268b905659f92610763f5ca51aa95` | **oui** |

`git status --porcelain` est **vide** après `B0`. Les seules écritures disque
sont `dist/` et `src-tauri/target/`, tous deux ignorés par `.gitignore`.
L'option `--locked` de Cargo garantit qu'un verrou qui aurait dû changer aurait
fait **échouer** la commande au lieu d'être réécrit.

## 1.6 Non testé dans B0

- **La construction complète de l'application Tauri** (`tauri build`) n'a
  **pas** été tentée. Elle télécharge des empaqueteurs (WiX, NSIS) absents de la
  machine, ce qui constituerait une installation nouvelle, interdite par
  §7.1.2. **L'application n'a donc jamais été empaquetée ni lancée** dans ce
  banc d'essai.
- **Aucune exécution manuelle de l'interface.** Aucun essai fonctionnel, aucune
  capture, aucun comportement d'exécution observé.
- **Aucune couverture de code** n'a été mesurée. « 36 tests passent » ne dit
  **rien** de ce que ces tests couvrent.
- **Une seule machine, un seul système.** Aucune vérification sur un poste
  neuf, sur une intégration continue, ni sur un autre système d'exploitation.
