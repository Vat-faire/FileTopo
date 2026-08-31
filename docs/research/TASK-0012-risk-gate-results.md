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
| `B1` | Migration SQLite Windows | **`M-C` RÉFUTÉE telle qu'elle est écrite** (un `-wal` orphelin survit à la permutation et corrompt la base neuve); **`M-C` durcie** — avec repli du WAL et suppression des annexes — et **`M-B`** observent tous deux les points 2 à 7 | §2 |
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

---

# 2. B1 — Migration SQLite sur Windows

- **Spike :** `spikes/b1-sqlite-migration/`, exécuté par
  `node run-b1.mjs 50000 5`
- **Moteur :** `node:sqlite` (intégré à Node v24.13.1), **SQLite 3.51.2**.
  **Aucune dépendance externe n'a été installée.**
- **Données :** 50 000 nœuds **synthétiques** à graine fixe (`20260831`), base
  héritée v1 de 2 514 944 octets. Aucun fichier de l'utilisateur.
- **Verdict :** **`M-C` RÉFUTÉE telle qu'elle est écrite, et confirmée
  seulement sous une condition de mise en œuvre explicite.** Voir §2.7.

## 2.1 Ce qui a été migré

| | Schéma v1 (hérité) | Schéma v2 (cible) |
|---|---|---|
| Table `nodes` | 6 colonnes | 8 colonnes (`+depth`, `+path_hash`) |
| Index | `idx_nodes_parent` | `+ idx_nodes_hash` |
| Table `node_stats` | absente | créée |
| `PRAGMA user_version` | `1` | `2` |

Trois stratégies ont été mises en concurrence :

| Code | Stratégie |
|---|---|
| `M-C` | **naïve** : lire l'ancienne, écrire une neuve à côté, copie de sûreté, permutation par `rename` |
| `M-C durcie` | idem, **plus** deux étapes : `S0` checkpoint de l'ancienne, `S5b` suppression des annexes de la cible avant la permutation |
| `M-B` | copie de sûreté, migration **en place**, restauration en cas d'échec |

## 2.2 Point 2 — la permutation

La permutation utilise `fs.renameSync(tmp, cible)`. Sur Windows, sur un même
volume, Node passe par `MoveFileExW` avec `MOVEFILE_REPLACE_EXISTING`.

**Observé :** aucune des 20 interruptions de §2.4 n'a produit un chemin cible
dans un état intermédiaire. Le classement est toujours `ANCIENNE-INTACTE` ou
`NOUVELLE-COMPLETE`, **jamais `MELANGE`, jamais `ABSENTE`**.

**Limite de portée.** Ceci démontre l'atomicité **du point de vue de
l'application** : le chemin cible n'est jamais observé à moitié permuté. Ce
n'est **pas** une preuve d'atomicité au niveau du système de fichiers, et ce
n'est **pas** une preuve de résistance à une coupure de courant. Voir §2.8.

## 2.3 Point 3 — `.wal` et `.shm` : le résultat le plus important de B1

### Comportement nominal

| Moment | Fichiers réellement présents sur le disque |
|---|---|
| Après fermeture nette | `p23.sqlite:2514944` |
| Connexion ouverte | `p23.sqlite:2514944`, `p23.sqlite-wal:8272`, `p23.sqlite-shm:32768` |
| Après fermeture | `p23.sqlite:2514944` |

SQLite supprime bien `-wal` et `-shm` à la fermeture nette de la dernière
connexion. Ces relevés sont pris **sans jamais ouvrir la base** : ouvrir une
base WAL **crée** `-wal` et `-shm`, et s'en servir pour observer le disque
fabriquerait l'observation.

### La défaillance

Un `-wal` non checkpointé peut rester sur le disque quand un écrivain meurt
brutalement. Scénario joué : un processus écrit 20 000 lignes avec
`wal_autocheckpoint = 0`, valide sa transaction, puis est tué par `SIGKILL`.

    orphelin.sqlite:2514944  orphelin.sqlite-wal:922912  orphelin.sqlite-shm:32768

L'ancienne base reste **parfaitement valide** : un lecteur rejoue le `-wal` et
lit ses **70 000** lignes, `integrity_check = ok`. Puis la migration s'exécute.

| Stratégie | `-wal` survivant à la permutation | État final | `integrity_check` | Lignes lisibles |
|---|---|---|---|---|
| **`M-C` naïve** | `orphelin-mc-naive.sqlite-wal:922912` | **`CORROMPUE`** | **échec** | **illisible** |
| **`M-C` durcie** | *(aucun)* | `NOUVELLE-COMPLETE` | `ok` | 70 000 |

`integrity_check` sur la base issue de la bascule naïve, extrait :

    *** in database main ***
    Tree 2 page 2 cell 43: Rowid 4806 out of order
    ...
    Tree 2 page 4 cell 0: invalid page number 402
    Tree 2 page 2 cell 0: Child page depth differs

**Le mécanisme.** `rename` remplace le fichier principal, mais **ne touche pas
les fichiers annexes**. Le `-wal` de l'**ancienne** base garde son nom, dérivé
du chemin cible : il devient donc mécaniquement le `-wal` de la **nouvelle**. À
la première ouverture, SQLite rejoue des pages de l'ancienne base par-dessus la
nouvelle. **La base neuve est détruite par la migration censée la produire.**

C'est exactement le risque que §8.1.3 de `TASK-0012` demandait de vérifier. Il
**n'est pas théorique** : il est reproduit, avec sa sortie d'erreur.

**À noter, même sans écrivain tué :** la bascule naïve laisse déjà
`p23.sqlite-wal:0` et `p23.sqlite-shm` derrière elle — résidus de sa **propre**
connexion en lecture seule sur l'ancienne base, une connexion en lecture seule
ne pouvant pas supprimer les annexes à la fermeture. Ils sont vides, donc
inoffensifs dans ce cas précis. Le mécanisme d'héritage est donc actif **à
chaque bascule**; seul le contenu du `-wal` décide si le résultat est bénin ou
destructeur.

### Le correctif observé

La variante durcie ajoute deux étapes, **et l'ordre compte** :

1. **`S0`** — ouvrir l'ancienne base, `PRAGMA wal_checkpoint(TRUNCATE)`, fermer
   proprement. Le contenu du `-wal` est replié dans le fichier principal, puis
   `-wal` et `-shm` disparaissent. **Supprimer le `-wal` avant de le replier
   perdrait les transactions qu'il contient.**
2. **`S5b`** — après la copie de sûreté et **avant** la permutation, supprimer
   tout fichier annexe résiduel du chemin cible.

## 2.4 Point 4 — arrêt brutal, une étape à la fois

Chaque étape est interrompue par un `SIGKILL` du processus enfant sur
**lui-même** : aucun `finally`, aucune fermeture de base, aucun nettoyage.
20 interruptions au total, une par étape.

| Stratégie | Étape | État de la cible | `integrity_check` | Lignes | Copie de sûreté utilisable |
|---|---|---|---|---|---|
| `M-C` | `S1-ancienne-ouverte` | `ANCIENNE-INTACTE` | `ok` | 50 000 | — |
| `M-C` | `S2-nouvelle-a-moitie-ecrite` | `ANCIENNE-INTACTE` | `ok` | 50 000 | — |
| `M-C` | `S3-nouvelle-ecrite-non-fermee` | `ANCIENNE-INTACTE` | `ok` | 50 000 | — |
| `M-C` | `S4-nouvelle-fermee-et-checkpointee` | `ANCIENNE-INTACTE` | `ok` | 50 000 | — |
| `M-C` | `S5-copie-de-surete-faite` | `ANCIENNE-INTACTE` | `ok` | 50 000 | **oui** |
| `M-C` | `S6-permutation-faite` | `NOUVELLE-COMPLETE` | `ok` | 50 000 | **oui** |
| `M-C` | `S7-nettoyage-fait` | `NOUVELLE-COMPLETE` | `ok` | 50 000 | **oui** |
| `M-C durcie` | `S0-ancienne-checkpointee` | `ANCIENNE-INTACTE` | `ok` | 50 000 | — |
| `M-C durcie` | `S1` à `S4` (4 étapes) | `ANCIENNE-INTACTE` | `ok` | 50 000 | — |
| `M-C durcie` | `S5-copie-de-surete-faite` | `ANCIENNE-INTACTE` | `ok` | 50 000 | **oui** |
| `M-C durcie` | `S5b-annexes-cibles-supprimees` | `ANCIENNE-INTACTE` | `ok` | 50 000 | **oui** |
| `M-C durcie` | `S6-permutation-faite` | `NOUVELLE-COMPLETE` | `ok` | 50 000 | **oui** |
| `M-C durcie` | `S7-nettoyage-fait` | `NOUVELLE-COMPLETE` | `ok` | 50 000 | **oui** |
| `M-B` | `T1-copie-de-surete-faite` | `ANCIENNE-INTACTE` | `ok` | 50 000 | **oui** |
| `M-B` | `T2-migration-a-moitie` | `ANCIENNE-INTACTE` | `ok` | 50 000 | **oui** |
| `M-B` | `T3-transaction-validee` | `NOUVELLE-COMPLETE` | `ok` | 50 000 | **oui** |
| `M-B` | `T4-base-fermee` | `NOUVELLE-COMPLETE` | `ok` | 50 000 | **oui** |

**20 interruptions sur 20 acceptables.** Aucun `MELANGE`, aucune base
illisible, aucune perte de ligne.

`M-B` résiste à `T2` — interruption au milieu de la réécriture — parce que la
migration entière tient dans **une seule** transaction : SQLite défait le
`-wal` non validé à la réouverture. C'est la garantie transactionnelle du
moteur, pas une propriété de la stratégie.

## 2.5 Point 5 — espace disque insuffisant

**Méthode : injection d'erreur**, l'une des trois formes permises par §8.1.5.
`PRAGMA max_page_count = 64` sur la base **en construction** force SQLite à
retourner un véritable `SQLITE_FULL`.

**Aucun disque réel n'a été rempli. Le disque système n'a jamais été touché.**

| Stratégie | Échec propre | Message | Ancienne intacte | Lignes avant → après | `integrity_check` |
|---|---|---|---|---|---|
| `M-C` | oui | `database or disk is full` | **oui** | 50 000 → 50 000 | `ok` |
| `M-C durcie` | oui | `database or disk is full` | **oui** | 50 000 → 50 000 | `ok` |
| `M-B` | oui | `database or disk is full` | **oui** | 50 000 → 50 000 | `ok` |

Les trois échouent proprement, signalent l'erreur, et laissent l'ancienne base
ouvrable et complète. `M-B` restaure depuis sa copie de sûreté; `M-C` n'a
jamais touché l'ancienne base et abandonne simplement son fichier temporaire.

**Ce qui n'est pas prouvé :** un `SQLITE_FULL` injecté par `max_page_count`
reproduit le **code d'erreur**, pas un volume réellement saturé. Un vrai disque
plein peut aussi faire échouer `fs.copyFileSync` ou `fs.renameSync`, chemins
**non couverts** par cette injection. Voir §2.8.

## 2.6 Points 6 et 7 — retour en arrière, et comparaison chiffrée

**Retour à l'ancienne base.** Après une bascule durcie réussie
(50 000 lignes, v2), la restauration depuis `cible.bak` ramène une base
`ANCIENNE-INTACTE`, `integrity_check = ok`, **50 000 lignes**, avec les
6 colonnes d'origine. **Retour réussi.**

Procédure de retour, écrite comme l'exige §8.1.6 :

1. fermer toute connexion à la base courante;
2. supprimer `cible-wal` et `cible-shm` s'ils existent;
3. copier `cible.bak` sur `cible`;
4. rouvrir et vérifier `PRAGMA integrity_check` **et** `PRAGMA user_version`.

Le retour n'est possible que **tant que `cible.bak` n'a pas été supprimée**.
Aucune purge automatique de la copie de sûreté n'est proposée ici.

**Comparaison chronométrée.** 50 000 nœuds, **5 exécutions** par stratégie,
médiane et écart min–max, mesure par `process.hrtime.bigint()`.

| Stratégie | Durée médiane | min–max | Pic disque total | Supplément transitoire | Taille finale |
|---|---|---|---|---|---|
| `M-C` | **778,4 ms** | 775,7 – 800,1 | 12,38 Mio | +9,98 Mio | 4,93 Mio |
| `M-C durcie` | **776,9 ms** | 770,4 – 785,3 | 12,38 Mio | +9,98 Mio | 4,93 Mio |
| `M-B` | **663,3 ms** | 655,0 – 666,8 | 12,07 Mio | +9,68 Mio | **5,08 Mio** |

Séries brutes, en millisecondes :

- `M-C` : 798,4 · 800,1 · 778,4 · 775,7 · 776,4
- `M-C durcie` : 773,4 · 785,3 · 770,4 · 779,6 · 776,9
- `M-B` : 662,4 · 655,0 · 664,1 · 666,8 · 663,3

Quatre constats **mesurés** :

1. **Le durcissement est gratuit en temps.** 776,9 ms contre 778,4 ms : les
   deux intervalles se recouvrent entièrement. Le checkpoint et la suppression
   des annexes ne coûtent rien de mesurable ici.
2. **`M-B` est plus rapide d'environ 15 %** — 663 ms contre 777 ms — parce
   qu'elle ne recopie pas les lignes dans un fichier neuf.
3. **L'argument « `M-C` coûte le double d'espace » ne se vérifie pas ici.** Les
   pics sont quasi identiques : 12,38 Mio contre 12,07 Mio, soit **2,6 %**
   d'écart. Ce qui domine le pic n'est pas la seconde base, c'est le `-wal` de
   la transaction d'écriture, présent dans les deux cas.
4. **`M-B` laisse une base 3,0 % plus grosse** — 5,08 Mio contre 4,93 Mio —
   parce que la migration en place fragmente sans `VACUUM`. L'écart croîtrait
   probablement à chaque migration successive; **cela n'a pas été mesuré sur
   plusieurs migrations enchaînées.**

Le pic est relevé **aux frontières d'étapes**, pas en continu : les migrations
sont synchrones et bloquent la boucle d'événements, ce qui rend inopérant tout
échantillonnage par minuterie — la première version de ce banc d'essai mesurait
0 pour cette raison exacte. Un pic survenant **à l'intérieur** d'une étape
serait donc sous-estimé.

## 2.7 Verdict de B1

`TASK-0012` §8.2 : « **`M-C` réfutée** — un seul des points 2 à 6 n'est pas
démontré. »

**Le point 3 n'est pas démontré pour `M-C` telle que `DEC-0011` la décrit.**
La formulation approuvée — lire, écrire à côté, permuter — produit une base
**corrompue** dès qu'un `-wal` orphelin traîne sur le chemin cible. C'est
prouvé, sortie d'`integrity_check` à l'appui.

Le verdict, en trois lignes qu'il ne faut pas confondre :

| Objet | Verdict |
|---|---|
| **`M-C` naïve**, telle qu'écrite | **RÉFUTÉE.** Preuve de corruption jointe |
| **`M-C` durcie**, avec `S0` et `S5b` | **Points 2 à 7 tous observés** sur les scénarios joués |
| **`M-B`** | **Points 2 à 7 tous observés** également; plus rapide, base finale plus grosse |

**Ce que B1 n'autorise pas à conclure.** « `M-C` durcie a passé ces scénarios »
n'est pas « `M-C` durcie est sûre ». Les scénarios non joués de §2.8 — coupure
de courant en particulier — restent entiers. `M-B` demeure le repli obligatoire
de `DEC-0011` tant que Sébastien n'a pas arbitré.

**Conséquence pour `DEC-0011`, sans modifier la fiche :** si `M-C` est retenue,
la décision doit être **complétée** par l'obligation explicite de replier puis
de supprimer les fichiers annexes de la cible à la bascule. Sans cette clause,
`M-C` est une procédure de corruption. Cet arbitrage appartient à Sébastien.

## 2.8 Non testé et limites de B1

1. **Aucune coupure de courant.** `SIGKILL` tue un **processus**; le système
   d'exploitation conserve ses caches et les écrit ensuite. La durabilité face
   à une coupure d'alimentation dépend de `fsync` et du matériel, et n'est
   **pas** testée ici. **Ne pas lire les 20 sur 20 de §2.4 comme une
   résistance à une panne de courant.**
2. **Disque plein simulé, pas réel.** `max_page_count` reproduit le code
   d'erreur, pas la saturation d'un volume. Les échecs de `copyFileSync` et de
   `renameSync` par manque d'espace ne sont **pas** couverts.
3. **Un seul volume, un seul système de fichiers.** NTFS sur SSD NVMe local.
   Aucun essai sur volume réseau, sur support amovible, ni dans un dossier
   synchronisé par un fournisseur infonuagique — où `rename` n'a pas les mêmes
   propriétés.
4. **Aucun accès concurrent.** Aucune seconde connexion, aucun lecteur pendant
   la bascule, aucun antivirus tenant un verrou sur le fichier. Un fichier
   verrouillé par un tiers ferait échouer `rename` sur Windows; **non testé**.
5. **Volumétrie unique.** 50 000 nœuds, base de 2,4 Mio. Rien à 1 million de
   nœuds. Les durées ne sont **pas** extrapolables.
6. **Moteur différent de celui de la production.** Le spike utilise
   SQLite 3.51.2 via `node:sqlite`; FileTopo utilise `rusqlite 0.40.2` avec
   SQLite embarqué. Le comportement des fichiers annexes vient du moteur SQLite
   et devrait se transposer, mais **cela n'a pas été vérifié en Rust**.
7. **Une seule machine.** Aucune reproduction ailleurs.
