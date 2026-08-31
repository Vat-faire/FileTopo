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
| `B2` | Rendu HTML/SVG | **Étude Canvas 2D autorisée** — seuil d'images par seconde manqué à 3 000 blocs sur `SYN-WIDE` (14,08 ips contre 30). Plafonds réels mesurés : 3 743 / 3 063 / 939 blocs selon la forme | §3 |
| `B3` | Identité Windows | **`I-E` confirmée sur 5 des 6 points**, coût mesuré à 28,3 µs/élément soit 3,1 % du budget d'indexation. **Point 4, inter-volume : NON OBSERVÉ**, bloqué par §13.2 | §4 |
| `B4` | Attributs infonuagiques | **SUCCÈS** — 3 questions répondues sur sources Microsoft, la 4<sup>e</sup> (survie de l'identité à l'hydratation) **déclarée non résolue**. Aucune hydratation déclenchée, aucun fichier réel touché | §5 |

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

---

# 3. B2 — Rendu HTML/SVG

- **Spike :** `spikes/b2-svg-rendering/`, page `map.html`, pilote `run-b2.mjs`
- **Navigateur :** Google Chrome **151.0.7922.175**, piloté par le protocole
  CDP sur le client `WebSocket` **intégré** à Node v24.13.1.
  **Aucune dépendance n'a été installée** — ni Playwright, ni Puppeteer, ni
  aucun paquet.
- **Données :** arborescences **entièrement synthétiques**, 20 000 nœuds,
  graine fixe `20260831`, générées dans la page.
- **Verdict :** **Étude Canvas 2D autorisée** — le seuil d'images par seconde
  est manqué à 3 000 blocs visibles sur `SYN-WIDE`, mesure jointe. Voir §3.7.

## 3.1 Ce qui a été construit

Un prototype de carte en blocs, **isolé**, écrit à partir des seuls documents
publics du dépôt. Il n'importe aucun composant de `src/` et n'en réutilise
aucun. **Aucune capture, aucune structure, aucun nom et aucune métrique ne
provient d'une interface privée de référence.**

- **Calepin** : découpage récursif alterné, surface proportionnelle au nombre
  de descendants.
- **Virtualisation** : descente récursive qui s'arrête dès qu'un nœud sort du
  cadre ou passe sous un seuil d'aire. Les nœuds élagués **ne sont pas
  construits**; ils restent agrégés dans la surface de leur parent.
- **Niveau de détail** : le seuil d'aire est le bouton de détail. Une recherche
  dichotomique le règle au démarrage pour atteindre le nombre de blocs visibles
  demandé. Les étiquettes n'apparaissent qu'au-dessus de 60 × 16 pixels.
- **Réconciliation par clé** : les éléments SVG sont **réutilisés** d'une image
  à l'autre; seuls les entrants sont créés et les sortants retirés.

## 3.2 Deux mises en œuvre, pas une

Condamner l'option A de `DEC-0008` sur la foi d'une seule mise en œuvre
médiocre serait malhonnête. **Deux** variantes du même rendu HTML/SVG ont donc
été mesurées :

| Code | Mise en œuvre |
|---|---|
| `reecriture` | La géométrie de **chaque** bloc visible est réécrite à chaque image |
| `transform` | Les blocs sont posés en coordonnées **monde**; le déplacement et le zoom se font par **une seule** transformation de groupe, la virtualisation n'étant refaite qu'en sortie de marge ou sur un zoom marqué |

`transform` est ce que ferait une mise en œuvre compétente. C'est elle qui doit
servir de base au verdict.

## 3.3 Protocole de mesure

1. **Images par seconde relevées par l'horloge de rendu du navigateur**, via
   `requestAnimationFrame`, **à l'intérieur de la page**. Elles ne sont ni
   estimées, ni calculées côté Node. La valeur publiée est
   `1000 / médiane(intervalle entre images)`.
2. **Trajectoire scriptée et identique** entre exécutions : la page est
   réinitialisée avant chaque exécution et parcourt le même chemin de 120
   images, dérivé d'une fonction sinusoïdale déterministe.
3. **Cinq exécutions** par scénario, médiane et écart min–max publiés.
4. **Aucun drapeau ne débride la fréquence d'images.** Ni `--disable-gpu-vsync`,
   ni `--disable-frame-rate-limit`. L'écran de référence est à **240 Hz** : le
   seuil de 30 ips n'est donc **pas** masqué par un plafond de synchronisation
   verticale, et les valeurs supérieures à 60 ips sont réelles.
5. **Nombre de nœuds DOM compté**, jamais estimé : `querySelectorAll('*')` sur
   le SVG.
6. **Latence de sélection** mesurée d'un **vrai** événement de pointeur
   (`MouseEvent` distribué sur l'élément) jusqu'à l'image qui porte le
   changement, avec lecture forcée de la disposition. 40 sélections par
   exécution, 95<sup>e</sup> centile publié.

**Fenêtre affichée, pas seulement hors écran.** Les mesures publiées viennent
d'un navigateur **avec fenêtre visible** sur l'écran 240 Hz. Une exécution
complète en mode sans affichage (`--headless=new`) a donné des valeurs
**équivalentes** — par exemple, à 3 000 blocs `SYN-DEEP` en mode `transform` :
34,13 ips avec fenêtre contre 34,13 sans. Le mode sans affichage ne fausse donc
pas ces mesures.

## 3.4 Résultats — 5 exécutions, mise en œuvre `transform`

| Blocs visibles demandés | Forme | Blocs visibles réels | Nœuds DOM | Déplacement, ips médianes | min–max | Zoom, ips | Sélection p95 |
|---|---|---|---|---|---|---|---|
| 1 000 | `SYN-DEEP` | 1 000 | 2 102 | **80,00** | 80,00 – 80,00 | 80,65 | 10,0 ms |
| 1 000 | `SYN-WIDE` | 939 | 1 880 | **47,85** | 47,85 – 48,08 | 40,00 | 17,0 ms |
| 1 000 | `SYN-EQUILIBRE` | 1 000 | 2 139 | **119,05** | 119,05 – 119,05 | 119,05 | 8,3 ms |
| 3 000 | `SYN-DEEP` | 3 000 | 6 102 | **34,13** | 30,12 – 34,13 | 34,13 | 26,6 ms |
| 3 000 | `SYN-WIDE` | 2 856 | 5 714 | **14,08** | 14,08 – 14,08 | 10,89 | 71,4 ms |
| 3 000 | `SYN-EQUILIBRE` | 3 000 | 6 139 | **40,00** | 40,00 – 40,00 | 39,84 | 22,2 ms |
| 5 000 | `SYN-DEEP` | 5 000 | 10 102 | **18,45** | 18,45 – 19,96 | 18,45 | 45,9 ms |
| 5 000 | `SYN-WIDE` | 4 768 | 9 538 | **8,26** | 7,99 – 8,26 | 7,99 | 137,4 ms |
| 5 000 | `SYN-EQUILIBRE` | 5 002 | 10 143 | **23,98** | 23,98 – 23,98 | 21,79 | 36,1 ms |

## 3.5 Résultats — mise en œuvre `reecriture`, pour comparaison

| Blocs | Forme | Déplacement, ips médianes | min–max | Sélection p95 |
|---|---|---|---|---|
| 1 000 | `SYN-DEEP` | 80,00 | 80,00 – 80,00 | 9,5 ms |
| 1 000 | `SYN-WIDE` | 47,85 | 47,85 – 47,85 | 16,8 ms |
| 1 000 | `SYN-EQUILIBRE` | 80,00 | 80,00 – 80,00 | 8,3 ms |
| 3 000 | `SYN-DEEP` | **29,94** | 29,94 – 29,94 | 25,1 ms |
| 3 000 | `SYN-WIDE` | 13,30 | 13,30 – 13,32 | 68,7 ms |
| 3 000 | `SYN-EQUILIBRE` | 34,25 | 34,25 – 34,25 | 20,8 ms |
| 5 000 | `SYN-DEEP` | 18,38 | 17,15 – 18,42 | 41,6 ms |
| 5 000 | `SYN-WIDE` | 7,98 | 7,49 – 7,98 | 138,2 ms |
| 5 000 | `SYN-EQUILIBRE` | 20,00 | 20,00 – 21,74 | 33,4 ms |

**La mise en œuvre compte, mais elle ne sauve pas le seuil.** Passer de
`reecriture` à `transform` fait gagner environ **14 %** sur `SYN-DEEP` à
3 000 blocs (29,94 → 34,13 ips), ce qui fait franchir les 30 ips à cette forme.
Sur `SYN-WIDE`, le gain est de **6 %** seulement (13,30 → 14,08) : très loin
du seuil. Le goulot n'est donc **pas** le JavaScript de mise à jour — sinon
`transform`, qui ne touche qu'un attribut par image, serait rapide. **Le coût
est celui du rendu SVG lui-même.**

## 3.6 Pourquoi `SYN-WIDE` s'effondre

`SYN-WIDE` — une branche de **5 000 enfants directs**, profondeur maximale
mesurée 2 — est de loin la forme la plus coûteuse, à nombre de nœuds DOM
**comparable** :

| Forme | Nœuds DOM à 3 000 blocs | ips |
|---|---|---|
| `SYN-EQUILIBRE` | 6 139 | 40,00 |
| `SYN-DEEP` | 6 102 | 34,13 |
| `SYN-WIDE` | 5 714 | **14,08** |

`SYN-WIDE` a **moins** de nœuds DOM et va **presque trois fois moins vite**.
Le nombre de blocs n'explique donc pas tout : la **géométrie** produite compte
autant. Un découpage alterné qui répartit 5 000 frères sur un seul axe produit
des rectangles en lamelles, très étroits et très hauts, dont le contour coûte
cher à tramer.

**Conséquence pour la conception, à ne pas confondre avec un verdict :** un
plafond exprimé en « nombre de blocs » est un mauvais indicateur. Deux cartes
de 3 000 blocs peuvent différer d'un facteur 3. C'est une observation de ce
banc d'essai, sur ce calepin; un autre algorithme de calepin — un pavage
« squarifié », par exemple — donnerait d'autres formes et **n'a pas été
testé**.

## 3.7 Le plafond réel, mesuré

§9.2 exige que « le nombre de blocs au-delà duquel les seuils ne tiennent plus »
soit **mesuré et publié**, quel qu'il soit. Recherche dichotomique, 7 itérations
au plus, 3 exécutions par point, mise en œuvre `transform`, seuils
`≥ 30 ips` **et** `p95 de sélection ≤ 150 ms`.

| Forme | **Plafond mesuré** | ips au plafond | Sélection p95 au plafond | Premier point qui rompt |
|---|---|---|---|---|
| `SYN-EQUILIBRE` | **3 743 blocs visibles** | 30,03 | 33,4 ms | 3 805 → 29,94 ips |
| `SYN-DEEP` | **3 063 blocs visibles** | 34,13 | 32,7 ms | 3 124 → 29,76 ips |
| `SYN-WIDE` | **939 blocs visibles** | 47,85 | 28,8 ms | 1 795 → 19,96 ips |

Points intermédiaires de la recherche, `SYN-DEEP` :

| Blocs visibles | Nœuds DOM | ips | Verdict |
|---|---|---|---|
| 2 075 | 4 252 | 47,85 | tient |
| **3 063** | 6 228 | 34,13 | **tient** |
| 3 124 | 6 350 | 29,76 | rompt |
| 3 188 | 6 478 | 26,60 | rompt |
| 4 050 | 8 202 | 23,92 | rompt |

**Le plafond dépend de la forme, d'un facteur 4.** De 939 blocs pour
`SYN-WIDE` à 3 743 pour `SYN-EQUILIBRE`.

**Précision du plafond de `SYN-WIDE`.** Cette forme **quantifie** : ses
5 000 frères ont tous la même surface, donc le seuil d'aire les fait entrer ou
sortir **par paliers entiers**. La recherche n'observe que deux paliers,
939 et 1 795 blocs; le premier tient largement (47,85 ips), le second rompt
nettement (19,96 ips). **Le plafond réel se situe donc entre 939 et 1 795, et
ce banc d'essai ne le résout pas plus finement.** C'est publié comme tel, pas
arrondi.

### Ce que devient l'hypothèse de 3 000 de DEC-0008

`DEC-0008` proposait 3 000 blocs DOM/SVG comme plafond « à falsifier », en
disant explicitement que ce **n'est pas une capacité déclarée**. La mesure
donne :

- **`SYN-EQUILIBRE` : 3 743** — l'hypothèse était **prudente** de 25 %;
- **`SYN-DEEP` : 3 063** — l'hypothèse était **juste**, à 2 % près;
- **`SYN-WIDE` : 939** — l'hypothèse était **optimiste d'un facteur 3**.

**L'hypothèse de 3 000 n'était donc ni bonne ni mauvaise : elle était mal
posée.** Un plafond unique exprimé en nombre de blocs ne capture pas ce qui
détermine réellement le coût. Un plafond utilisable doit dépendre de la
**géométrie produite**, pas seulement du décompte.

## 3.7 bis Verdict de B2

Critère de §9.2, appliqué à la **meilleure** mise en œuvre (`transform`), à
**3 000 blocs visibles**, sur `SYN-DEEP` **et** `SYN-WIDE` :

| Condition | `SYN-DEEP` | `SYN-WIDE` | Tenue ? |
|---|---|---|---|
| ≥ 30 ips soutenues en déplacement | 34,13 (min 30,12) | **14,08** | **NON** |
| Sélection p95 ≤ 150 ms | 26,6 ms | 71,4 ms | oui |
| Navigation clavier fonctionnelle | oui | oui | oui |

> **Verdict : « Étude Canvas 2D autorisée ».**
> L'un des deux seuils est manqué à 3 000 blocs visibles, **mesure jointe** :
> `SYN-WIDE` plafonne à **14,08 ips**, soit **47 %** du seuil de 30 ips.

**Ce que cette autorisation n'est pas.** §9.2 est explicite : « L'autorisation
porte sur l'**étude**, jamais sur l'adoption. » `B2` **n'a mesuré ni Canvas 2D
ni WebGL** et ne dit **rien** de leurs performances. Il ne dit pas non plus
que HTML/SVG est inutilisable : deux formes sur trois tiennent le seuil à
3 000 blocs, et toutes trois le tiennent largement à 1 000.

**Ce que B2 établit malgré tout en faveur de l'option A :**

- la virtualisation et les niveaux de détail **fonctionnent** : le nombre de
  nœuds DOM construits suit le nombre de blocs demandé, sans dérive;
- **ARIA et clavier sont conformes** dans les 18 scénarios, jusqu'à
  5 002 blocs — c'est un point que Canvas 2D devrait **reconstruire
  entièrement**, puisqu'un canevas ne produit aucun arbre d'accessibilité;
- la latence de sélection tient partout, avec une marge large à 3 000 blocs.

**L'arbitrage appartient à Sébastien**, et `B2` ne le prend pas. Trois voies
restent ouvertes, aucune n'est recommandée ici : plafonner le nombre de blocs
visibles selon la forme; changer l'algorithme de calepin pour éviter les
lamelles de `SYN-WIDE`; ou étudier Canvas 2D, en acceptant d'avoir à
reconstruire l'accessibilité.

## 3.8 Clavier et ARIA

Vérification portée sur la **structure réellement construite**, jamais sur une
intention.

**ARIA — conforme dans les 18 scénarios.** Sur l'ensemble des `treeitem`
construits :

| Contrôle | Résultat |
|---|---|
| `role="tree"` sur le conteneur | présent |
| `role="treeitem"` sur les blocs | présent, jusqu'à 5 002 éléments |
| `aria-level` manquants | **0** |
| `aria-selected` manquants | **0** |
| `aria-setsize` manquants | **0** |
| `aria-posinset` manquants | **0** |
| Nœuds à enfants construits **sans** `aria-expanded` | **0** |

**Clavier — fonctionnel dans les 18 scénarios.** Motif « Tree View » :
`ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`, `Home`, `End`. Chaque touche
est envoyée comme un **vrai** `KeyboardEvent`, et l'on vérifie à la fois l'état
interne **et** `document.activeElement`.

Une correction du banc d'essai lui-même mérite d'être signalée : la première
version comptait `SYN-WIDE` en échec parce que `ArrowRight` ne déplaçait pas le
focus. C'était **le contrôle qui avait tort**, pas le rendu : sur un nœud dont
les enfants ne sont pas construits au niveau de détail courant, ne pas bouger
est le comportement **correct** du motif. Le contrôle vérifie désormais
l'attente juste — `ArrowRight` ne doit bouger **que si** le nœud focalisé a des
enfants construits — et les 18 scénarios sont conformes.

## 3.9 Non testé et limites de B2

1. **Aucun lecteur d'écran réel.** La conformité constatée porte sur les
   **attributs produits**, pas sur l'expérience réelle sous NVDA, JAWS ou le
   Narrateur. **Non testé.**
2. **Un seul navigateur, un seul moteur.** Chrome 151 / Blink. **Le rendu réel
   de FileTopo passera par WebView2**, non mesuré ici. Edge 152 est installé
   mais n'a pas servi aux mesures publiées.
3. **Une seule machine, un seul écran.** i9-9900K, RTX 2070, 1920 × 1080 à
   240 Hz, `devicePixelRatio` = 1. Un portable, un écran à 60 Hz ou un
   affichage à forte densité donneraient d'autres chiffres. **Le matériel
   utilisé ici est nettement au-dessus d'un poste ordinaire** : les valeurs
   publiées sont donc plutôt un plafond favorable qu'un cas moyen.
4. **Aucune donnée réelle, aucun rendu de document.** Ni miniature, ni icône,
   ni texte extrait. Seuls des rectangles et des étiquettes courtes.
5. **Un seul algorithme de calepin.** Découpage alterné. Un pavage
   « squarifié » changerait la géométrie et donc les mesures de `SYN-WIDE`.
6. **`revirtualisations = 0`** sur toutes les mesures de déplacement : la
   trajectoire scriptée reste à l'intérieur de la marge de 25 %. Le coût d'une
   revirtualisation en cours de déplacement n'est donc **pas** mesuré, et le
   mode `transform` est mesuré dans son **cas le plus favorable**.
7. **Aucun test de mémoire**, aucune mesure de consommation, aucune session
   longue.
8. **Ni Canvas 2D ni WebGL n'ont été mesurés.** `B2` ne dit **rien** de leurs
   performances : il ne fait qu'ouvrir le droit d'étudier Canvas 2D.

---

# 4. B3 — Identité Windows

- **Spike :** `spikes/b3-windows-identity/`, projet Cargo **isolé**
- **Chaîne :** `stable-x86_64-pc-windows-msvc`, `rustc 1.98.0`. **Le canal
  `nightly` n'a été employé nulle part**, conformément à §10.1.1.
- **Données :** arborescences **entièrement synthétiques** créées sous
  `spikes/.work/b3/`. Aucun fichier de l'utilisateur lu, ouvert, déplacé ni
  énuméré.
- **Verdict :** **`I-E` confirmée sur cinq des six points, avec un coût
  compatible avec la cible.** Le **point 4 — comportement inter-volume — n'a
  pas été observé** : il est **bloqué** par §13.2. Voir §4.6.

## 4.1 Point 1 — l'identité est obtenable sur le canal stable

**Oui, observé.** Le programme compile et s'exécute sur `stable` et rend :

    28a4a87da4a84ede:27ec010000004b000000000000000000

soit `VolumeSerialNumber` (64 bits) suivi du `FileId` 128 bits, obtenus par
`GetFileInformationByHandleEx` avec la classe `FileIdInfo`, qui remplit la
structure `FILE_ID_INFO`.

**Le descripteur est ouvert en accès NUL.** `CreateFileW` est appelé avec
`dwDesiredAccess = 0` — un « attribute-only open » au sens de la documentation
Microsoft citée en §5.3. Ni `GENERIC_READ`, ni lecture de flux. C'est ce qui
rend l'opération compatible avec la règle de non-hydratation de `B4`.
`FILE_FLAG_BACKUP_SEMANTICS` est nécessaire pour ouvrir un **dossier**.

## 4.2 Point 2 — la dépendance candidate

| Élément | Valeur |
|---|---|
| Nom, version épinglée | `windows-sys` **`=0.61.2`** |
| Licence **vérifiée** | **`MIT OR Apache-2.0`**, relevée le 2026-08-31 sur `crates.io/api/v1/crates/windows-sys/0.61.2` |
| Dépendance transitive | `windows-link` **0.2.1**, **`MIT OR Apache-2.0`**, vérifiée à la même date et à la même source |
| Compatibilité MIT | **compatible** — licence au choix, branche MIT retenable |
| Confinement | `spikes/b3-windows-identity/` **uniquement** |

Fiche complète : `spikes/b3-windows-identity/LICENCE.md`.

**`B3` établit une candidature; il n'adopte pas la dépendance.** §6 l'interdit
explicitement. Les quatre empreintes des manifestes et verrous de la racine
sont **inchangées** — vérifiées après l'exécution.

Deux points d'honnêteté :

1. **Une seconde caisse est apparue à la compilation.** `windows-link 0.2.1`,
   tirée transitivement. Elle est compilée et liée dans le binaire, donc elle
   compte : sa licence a été vérifiée à la même source et à la même date.
2. **Le manifeste initial ne compilait pas.** `CreateFileW` référence
   `SECURITY_ATTRIBUTES`; la fonctionnalité `Win32_Security` a dû être ajoutée.
   C'est une fonctionnalité, pas un paquet : aucune dépendance nouvelle.

## 4.3 Point 3 — renommage et déplacement intra-volume

**L'identité survit, pour un fichier comme pour un dossier.**

| Scénario | Identité | Conservée ? |
|---|---|---|
| Fichier, avant | `28a4…4ede:29ec010000003c00…` | — |
| Fichier, **après renommage** | `28a4…4ede:29ec010000003c00…` | **oui** |
| Fichier, **après déplacement** intra-volume | `28a4…4ede:29ec010000003c00…` | **oui** |
| Dossier, avant | `28a4…4ede:2bec010000001900…` | — |
| Dossier, **après renommage** | `28a4…4ede:2bec010000001900…` | **oui** |
| Dossier, **après déplacement** intra-volume | `28a4…4ede:2bec010000001900…` | **oui** |

Ce résultat concorde avec la documentation officielle (S7 de §5.1) : « In the
NTFS file system, a file keeps the same file ID **until it is deleted**. »

**Copie puis suppression — l'identité change.**

| | Identité |
|---|---|
| Source | `28a4…4ede:3bec010000001400…` |
| Destination copiée | `28a4…4ede:43ec010000004300…` |
| **Identités différentes** | **oui** |

C'est le résultat attendu, et il porte une conséquence directe : **une copie
n'est pas un déplacement**. Un fichier copié est un fichier **neuf**.

## 4.4 Point 4 — inter-volume : NON OBSERVÉ, et voici pourquoi

**Ce point n'a pas été testé. Il n'est ni contourné, ni simulé, ni déduit en
douce.**

Observer le comportement inter-volume exige d'écrire une arborescence
synthétique sur un **second volume**. La machine en possède (`E:`, `F:`), mais
§13.2 de `TASK-0012` fait de cette action une **condition d'arrêt immédiat** :
« une action sortirait du dépôt public en lecture, en listage ou en
écriture ». `AGENTS.md` est du même ordre : « ne jamais lire, lister ou écrire
ailleurs ». La règle dit aussi quoi faire : « l'agent **s'arrête et demande**.
Il ne contourne pas. »

**Ce qui a été mesuré à la place, et ce que cela vaut.** Le scénario
copie-puis-suppression de §4.3 est le **mécanisme** d'un déplacement
inter-volume : Windows ne peut pas déplacer un fichier entre volumes autrement
qu'en le recopiant puis en supprimant l'original. La mesure montre que ce
mécanisme **produit une identité différente**.

**Mais ce n'est pas une observation du cas inter-volume.** Deux choses
resteraient à constater et **ne l'ont pas été** :

1. la valeur de `VolumeSerialNumber` sur un **autre** volume, et donc le fait
   qu'elle diffère effectivement;
2. le risque de **collision de `FileId` entre deux volumes** — deux fichiers
   distincts, sur deux volumes, peuvent porter le même `FileId`, ce qui rend la
   comparaison du seul `FileId` **trompeuse**. La documentation impose de
   combiner les deux champs; cela n'a pas été **vérifié** ici.

**Autorisation demandée.** Lever ce point suppose un GO explicite de Sébastien
pour créer un répertoire de travail synthétique sur un second volume. C'est un
travail court. Il n'est pas fait.

## 4.5 Points 5 et 6 — coût, et repli déterministe

### Coût de l'identité

Cinq exécutions par volumétrie, médiane et écart min–max. Arborescences
synthétiques de 200 fichiers par dossier.

| Éléments | Parcours **sans** identité (médiane) | Parcours **avec** identité (médiane) | Surcoût | Surcoût relatif | **Coût par élément** |
|---|---|---|---|---|---|
| 1 000 | 0,872 ms | 33,674 ms | +32,80 ms | +3 762 % | **32,80 µs** |
| 10 000 | 7,613 ms | 291,148 ms | +283,54 ms | +3 724 % | **28,35 µs** |
| 100 000 | 73,665 ms | 2 903,309 ms | +2 829,64 ms | +3 841 % | **28,30 µs** |

**100 000 identités sur 100 000 ont été obtenues**, à chaque volumétrie : aucun
échec, aucun élément sauté.

Deux lectures opposées du même chiffre, et il faut donner les deux :

- **En relatif, le coût est énorme** : obtenir l'identité multiplie la durée du
  parcours par **environ 38**. Ce n'est pas un détail d'optimisation; c'est le
  poste dominant de l'indexation.
- **En absolu, le coût est petit devant la cible.** §3.2 de
  `BASELINE_TARGETS.md` fixe l'indexation complète de `SYN-100K` à **≤ 90 s**.
  Le surcoût d'identité y pèse **2,83 s**, soit **3,1 %** du budget.

Le coût par élément est **stable** — 28,3 µs à 10 000 comme à 100 000 — donc
**linéaire**. Il n'y a pas d'effondrement à l'échelle.

**Le critère de §10.2 est donc satisfait** : « le coût mesuré à 100 000
éléments reste compatible avec §3.2 ».

**Ce que ce chiffre ne dit pas.** Le parcours mesuré ne fait **que** parcourir
et ouvrir; il n'écrit dans aucune base, ne calcule aucune empreinte de contenu
et ne construit aucun index. L'indexation réelle fera davantage, et les 90 s de
budget devront couvrir le tout. **2,83 s n'est pas « négligeable » dans
l'absolu : c'est 3,1 % d'un budget qui n'a jamais été mesuré en entier.**

### Repli déterministe par chemin

L'empreinte versionnée `v1:` du chemin relatif est reproductible :

| Entrée | Empreinte |
|---|---|
| `racine-synthetique/alpha/bravo.txt` | `v1:2125a54fc3bd9ca1` |
| `racine-synthetique/alpha/bravo.txt` *(répétée)* | `v1:2125a54fc3bd9ca1` |
| `racine-synthetique/charlie/delta.dat` | `v1:18b1d0160f2afe30` |
| *(chaîne vide)* | `v1:cbf29ce484222325` |

**Même entrée, même sortie : oui.**

§10.3 demandait une reproductibilité « entre deux machines si possible ». Une
seule machine était disponible. À la place, un contrôle **plus fort qu'une
simple répétition** a été fait : l'empreinte a été calculée par **deux mises en
œuvre indépendantes**, celle en **Rust** de `B3` et celle en **JavaScript** de
`B1`, écrites séparément. **Les trois valeurs concordent exactement.** Cela
démontre que l'algorithme ne dépend ni du langage, ni de la représentation
interne — mais **cela ne remplace pas** un essai sur une seconde machine, qui
reste **non fait**.

### Point 7 — aucune heuristique comme identité

Le spike ne contient **aucun** appariement par ressemblance, aucune suggestion
de déplacement, aucun rapprochement par nom ou par taille. L'identité provient
**exclusivement** de l'API du système; le repli par chemin est **étiqueté comme
un repli** et n'est jamais présenté comme une identité prouvée.

## 4.6 Verdict de B3

| Point | Objet | Résultat |
|---|---|---|
| 1 | Identité sur Rust stable | **observé** |
| 2 | Dépendance, version, licence vérifiée | **observé**, transitive comprise |
| 3 | Renommage et déplacement intra-volume | **observé**, fichier et dossier |
| 4 | Comportement inter-volume | **NON OBSERVÉ — bloqué par §13.2** |
| 5 | Coût à 1 000 / 10 000 / 100 000 | **observé**, compatible avec §3.2 |
| 6 | Repli déterministe par chemin | **observé** |
| 7 | Aucune heuristique comme identité | **respecté** |

§10.2 conditionne « `I-E` confirmée » à ce que **les points 1 à 6** soient
observés. **Le point 4 ne l'est pas.** Le verdict honnête n'est donc pas
« confirmée » :

> **`I-E` est confirmée sur les points 1, 2, 3, 5 et 6, avec un coût mesuré
> compatible avec la cible d'indexation. Le point 4 reste ouvert, bloqué par la
> règle de périmètre de la tâche, et demande une autorisation distincte.**

Ce n'est **pas** « `I-E` sous réserve » au sens de §10.2 — cette catégorie vise
un coût qui dégraderait la cible, et le coût, lui, est compatible. C'est un
verdict **incomplet par périmètre**, pas par performance.

## 4.7 Non testé et limites de B3

1. **Le comportement inter-volume n'a pas été observé** (§4.4), y compris le
   risque de collision de `FileId` entre volumes.
2. **Aucun essai sur un second poste.** La reproductibilité inter-machines du
   repli par chemin reste **non testée**; seule la concordance entre deux mises
   en œuvre a été vérifiée.
3. **NTFS seulement.** Rien sur ReFS, FAT32, exFAT, volume réseau ou support
   amovible. C'est une limite sérieuse : la documentation officielle avertit
   qu'« un identifiant FAT peut changer au fil du temps » et que
   « l'identifiant 64 bits n'est pas garanti unique sur ReFS » (S7).
4. **Aucun fichier infonuagique.** L'effet d'une hydratation sur l'identité
   n'est ni mesuré ici, ni résolu par `B4` (§5.6).
5. **Aucune réutilisation d'identifiant observée.** La documentation prévient
   que les identifiants « ne sont pas garantis uniques dans le temps, les
   systèmes de fichiers étant libres de les réutiliser ». Ce banc d'essai ne
   met **rien** en place contre cette réutilisation et ne l'a pas provoquée.
6. **Aucune écriture en base.** Le coût mesuré est celui de l'obtention de
   l'identité, pas d'une indexation complète.
7. **Aucun accès concurrent, aucun fichier verrouillé, aucun refus de
   permission.** Tous les éléments étaient accessibles; `identite()` rend
   `None` en cas d'échec d'ouverture, mais **ce chemin de code n'a jamais été
   emprunté** pendant les mesures.

---

# 5. B4 — Attributs infonuagiques

- **Spike :** `spikes/b4-cloud-attributes/simulation.mjs`
- **Sources :** **exclusivement Microsoft**, consultées le **2026-08-31**.
  Aucun blogue, aucun forum, aucune réponse d'agent, aucune source secondaire.
- **Verdict :** **SUCCÈS** au sens de §11.3 — trois questions reçoivent une
  réponse sourcée Microsoft, la quatrième est **explicitement déclarée non
  résolue** avec la recherche menée. **Aucune hydratation n'a été déclenchée.**

## 5.0 Ce que le spike n'a pas fait, et c'est essentiel

**Aucun fichier réel n'a été touché.** Le spike :

- n'ouvre aucun fichier;
- ne lit aucun contenu;
- n'énumère aucun dossier du disque;
- **ne touche à aucun espace réservé** d'un fournisseur de synchronisation
  installé sur la machine, ni pour le lire, ni pour l'énumérer.

Il ne prouve donc **rien** sur le comportement réel de Windows. C'est une
**simulation** sur des vecteurs d'attributs **fabriqués** à partir des
constantes officielles, qui vérifie qu'une règle de décision est cohérente avec
la documentation. §11.1.2 autorise explicitement cette forme, à condition
qu'elle soit « décrite explicitement comme telle ». Elle l'est ici.

## 5.1 Sources officielles retenues

| # | Page Microsoft | Consultée |
|---|---|---|
| S1 | *File Attribute Constants (WinNT.h)* — `learn.microsoft.com/en-us/windows/win32/fileio/file-attribute-constants` | 2026-08-31 |
| S2 | *CreateFileW function (fileapi.h)* — `learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-createfilew` | 2026-08-31 |
| S3 | *Handling Placeholders* (guide pour pilotes de systèmes de fichiers) — `learn.microsoft.com/en-us/windows-hardware/drivers/ifs/placeholders_guidance` | 2026-08-31 |
| S4 | *CF_PLACEHOLDER_STATE (cfapi.h)* — `learn.microsoft.com/en-us/windows/win32/api/cfapi/ne-cfapi-cf_placeholder_state` | 2026-08-31 |
| S5 | *CfGetPlaceholderStateFromFindData (cfapi.h)* — `learn.microsoft.com/en-us/windows/win32/api/cfapi/nf-cfapi-cfgetplaceholderstatefromfinddata` | 2026-08-31 |
| S6 | *FILE_ID_INFO (winbase.h)* — `learn.microsoft.com/en-us/windows/win32/api/winbase/ns-winbase-file_id_info` | 2026-08-31 |
| S7 | *BY_HANDLE_FILE_INFORMATION (fileapi.h)* — `learn.microsoft.com/en-us/windows/win32/api/fileapi/ns-fileapi-by_handle_file_information` | 2026-08-31 |

## 5.2 Question 1 — quels attributs distinguent un espace réservé ?

**Réponse sourcée.** Trois attributs, plus deux d'intention, plus une API
dédiée.

| Attribut | Valeur | Définition officielle (S1), citée |
|---|---|---|
| `FILE_ATTRIBUTE_RECALL_ON_DATA_ACCESS` | `0x00400000` | « the file or directory is not fully present locally. For a file that means that not all of its data is on local storage… Reading the file / enumerating the directory will be more expensive than normal, e.g. it will cause at least some of the file/directory content to be fetched from a remote store. **Only kernel-mode callers can set this bit.** » |
| `FILE_ATTRIBUTE_RECALL_ON_OPEN` | `0x00040000` | « **This attribute only appears in directory enumeration classes**… the file or directory has no physical representation on the local system; **the item is virtual**. Opening the item will be more expensive than normal… » |
| `FILE_ATTRIBUTE_OFFLINE` | `0x00001000` | « The data of a file is not available immediately… physically moved to offline storage. This attribute is used by Remote Storage… **Applications should not arbitrarily change this attribute.** » |
| `FILE_ATTRIBUTE_PINNED` | `0x00080000` | « user intent that the file or directory should be kept fully present locally even when not being actively accessed » |
| `FILE_ATTRIBUTE_UNPINNED` | `0x00100000` | « should not be kept fully present locally except when being actively accessed » |

**L'attribut normatif est `RECALL_ON_DATA_ACCESS`.** S3 est catégorique :
« All virtualization implementations that use placeholders **must set** the
FILE_ATTRIBUTE_RECALL_ON_DATA_ACCESS file attribute on these placeholders. »

**L'API officielle de classement** est `CfGetPlaceholderStateFromFindData`
(S5), qui prend une structure `WIN32_FIND_DATA` — « obtained from the
FindFirstFile/FindNextFile functions » — et rend un `CF_PLACEHOLDER_STATE`
(S4) :

| Valeur | Signification officielle |
|---|---|
| `CF_PLACEHOLDER_STATE_NO_STATES` `0x0` | l'élément « is not a placeholder » |
| `CF_PLACEHOLDER_STATE_PLACEHOLDER` `0x1` | l'élément « is a placeholder » |
| `CF_PLACEHOLDER_STATE_SYNC_ROOT` `0x2` | dossier à la fois espace réservé et racine de synchronisation |
| `CF_PLACEHOLDER_STATE_ESSENTIAL_PROP_PRESENT` `0x4` | propriété essentielle présente dans le magasin de propriétés |
| `CF_PLACEHOLDER_STATE_IN_SYNC` `0x8` | contenu « in sync with the cloud » |
| `CF_PLACEHOLDER_STATE_PARTIAL` `0x10` | contenu « not ready to be consumed by the user application, though it may or may not be fully present locally » |
| `CF_PLACEHOLDER_STATE_PARTIALLY_ON_DISK` `0x20` | contenu « not fully present locally »; implique `PARTIAL` |
| `CF_PLACEHOLDER_STATE_INVALID` `0xffffffff` | l'API n'a pas su interpréter les informations |

### Une ambiguïté réelle, trouvée dans la source officielle elle-même

**Sur la même page S1, deux constantes différentes portent la même valeur :**

    FILE_ATTRIBUTE_EA              262144 (0x00040000)   « for internal use only »
    FILE_ATTRIBUTE_RECALL_ON_OPEN  262144 (0x00040000)

Le bit `0x00040000` est donc **ambigu hors contexte**. S1 lève l'ambiguïté par
le contexte, et non par la valeur : `RECALL_ON_OPEN` « only appears in
directory enumeration classes (FILE_DIRECTORY_INFORMATION,
FILE_BOTH_DIR_INFORMATION, etc.) ».

**Conséquence directe :** lire `0x00040000` sur des attributs qui ne viennent
**pas** d'une énumération de répertoire et en conclure « espace réservé » est
un **défaut**. La simulation de §5.5 contient les deux cas explicitement.

## 5.3 Question 2 — quelle opération risque une hydratation ?

**Réponse sourcée.**

**Ce qui risque une hydratation :**

- **Lire les données.** S3 : « Filters should also not issue reads and writes
  on placeholder files that have the FILE_ATTRIBUTE_RECALL_ON_DATA_ACCESS
  attribute set… Such a read or write **causes unnecessary hydration when no
  user application has requested the file data**. »
- **Ouvrir l'élément**, quand `RECALL_ON_OPEN` est posé : S1, « Opening the
  item will be more expensive than normal, e.g. it will cause at least some of
  it to be fetched from a remote store. »
- **Énumérer un dossier virtualisé.** S1, sur `RECALL_ON_DATA_ACCESS` :
  « **enumerating the directory** will be more expensive than normal, e.g. it
  will cause at least some of the file/directory content to be fetched from a
  remote store. » **L'énumération n'est donc pas inconditionnellement
  gratuite** quand c'est le **dossier** qui est virtualisé — elle peut
  provoquer la récupération du **contenu de répertoire**, ce qui n'est pas
  l'hydratation d'un fichier de l'utilisateur, mais reste un accès distant.

**Ce qui est sûr :**

- **L'énumération de répertoire** `FindFirstFile` / `FindNextFile`, puis
  `CfGetPlaceholderStateFromFindData` sur la `WIN32_FIND_DATA` obtenue (S5).
  Aucune ouverture de fichier n'est nécessaire pour classer l'élément.
- **L'ouverture en accès nul** — « attribute-only open ». S3 la distingue
  explicitement d'un accès aux données : « A minifilter shouldn't issue
  reads/writes on intercepting **attribute-only opens**. Such read/writes can
  cause deadlocks as certain implementations **don't expect attribute-only
  opens to be converted to data access operations**. » C'est exactement ce que
  fait le spike `B3` : `CreateFileW` avec `dwDesiredAccess = 0`.

**Un drapeau à ne PAS utiliser.** `FILE_FLAG_OPEN_NO_RECALL` (`0x00100000`, S2)
demande que les données restent en stockage distant. Mais S2 précise :
« **This flag is for use by remote storage systems.** » FileTopo n'en est pas
un. S'appuyer dessus serait détourner un drapeau de son usage documenté, et ne
dispenserait de toute façon pas de la règle de §5.4. **Il n'est pas retenu.**

## 5.4 Question 4 — la règle que FileTopo doit appliquer

**Réponse.** Une règle **inconditionnelle**, qui ne dépend d'aucun bit :

> **FileTopo ne lit jamais le contenu d'un fichier de l'utilisateur.**

Elle se décline en cinq points :

1. **Énumération seulement.** Les métadonnées viennent de `FindFirstFile` /
   `FindNextFile`. Le classement d'un espace réservé se fait par
   `CfGetPlaceholderStateFromFindData`, sans ouvrir quoi que ce soit.
2. **Si un descripteur est nécessaire** — pour l'identité de `B3` — il est
   ouvert en **accès nul**, jamais avec `GENERIC_READ`, et aucun flux de
   données n'est lu.
3. **Les bits de rappel ne conditionnent pas la lecture, ils conditionnent
   l'affichage.** `RECALL_ON_DATA_ACCESS`, `RECALL_ON_OPEN` — lu uniquement en
   contexte d'énumération — et `OFFLINE` servent à **montrer** à l'utilisateur
   qu'un élément n'est pas entièrement local. Comme le contenu n'est jamais lu,
   la sûreté ne dépend pas de leur lecture correcte.
4. **Aucune écriture d'attribut.** S1 : « Applications should not arbitrarily
   change this attribute. » FileTopo est en lecture seule; il n'en pose ni n'en
   retire aucun.
5. **Aucun recours à `FILE_FLAG_OPEN_NO_RECALL`**, réservé aux systèmes de
   stockage distant.

**Pourquoi une règle inconditionnelle plutôt qu'une règle conditionnée aux
bits.** Une règle du type « si `RECALL_ON_DATA_ACCESS` est posé, ne pas lire »
est fragile : elle dépend d'une lecture correcte d'un bit ambigu (§5.2), du
contexte d'obtention des attributs, et d'une course entre le moment de la
lecture de l'attribut et celui de la lecture des données. Ne jamais lire le
contenu **supprime la classe entière de défauts**.

## 5.5 La simulation, et ce qu'elle vaut

`spikes/b4-cloud-attributes/simulation.mjs` applique la règle à une fixture de
dix cas **fabriqués**, dont les deux cas ambigus de `0x00040000`.

**Résultat : 10 cas sur 10 conformes.**

| Cas fabriqué | Attributs | Contexte d'énumération | État classé | Contenu lu ? | Hydratation risquée *si* on lisait le contenu |
|---|---|---|---|---|---|
| `fichier-ordinaire-local` | `0x00000020` | oui | `PRESENT-LOCALEMENT` | **non** | non |
| `dossier-ordinaire-local` | `0x00000010` | oui | `PRESENT-LOCALEMENT` | **non** | non |
| `espace-reserve-integral` | `0x00401420` | oui | `PAS-ENTIEREMENT-LOCAL` | **non** | oui |
| `espace-reserve-partiel` | `0x00400220` | oui | `PAS-ENTIEREMENT-LOCAL` | **non** | oui |
| `fichier-nuage-hydrate-epingle` | `0x00080020` | oui | `PRESENT-LOCALEMENT` | **non** | non |
| `fichier-nuage-desepingle` | `0x00500020` | oui | `PAS-ENTIEREMENT-LOCAL` | **non** | oui |
| `archive-hors-ligne-hsm` | `0x00001020` | oui | `STOCKAGE-HORS-LIGNE` | **non** | oui |
| `dossier-virtualise` | `0x00400010` | oui | `PAS-ENTIEREMENT-LOCAL` | **non** | oui |
| **`ambigu-0x40000`** | `0x00040020` | **non** | `PRESENT-LOCALEMENT` | **non** | non |
| **`ambigu-0x40000`** | `0x00040020` | **oui** | `PAS-ENTIEREMENT-LOCAL` | **non** | oui |

Les deux dernières lignes portent **exactement les mêmes bits** et reçoivent
**deux classements différents**, selon le seul contexte d'obtention. C'est le
piège de §5.2 rendu explicite : hors énumération, `0x00040000` est
`FILE_ATTRIBUTE_EA`, et le lire comme « espace réservé » serait un défaut.

**Invariant vérifié sur les dix cas :** `lectureContenuAutorisee` vaut
**`false`** partout, sans exception et sans condition. C'est la règle §5.4.1
rendue mécanique.

**Ce que cela prouve, et ne prouve pas.** Cela prouve que la règle est
**cohérente** et que le cas ambigu est traité selon le contexte. Cela ne prouve
**rien** sur le comportement réel de Windows, puisque aucun vrai fichier
infonuagique n'a été observé. C'est une vérification de logique, pas une
observation du système.

## 5.6 Question 3 — NON RÉSOLUE, et déclarée telle

> **L'identité de fichier survit-elle à une hydratation ou à une
> déshydratation, selon la documentation officielle ?**

**Aucune source officielle Microsoft répondant directement à cette question
n'a été trouvée.** §11.1 impose de le déclarer plutôt que de combler. C'est
donc déclaré.

**Recherche menée :**

- **S6**, la page de `FILE_ID_INFO`, décrit `VolumeSerialNumber` et le `FileId`
  128 bits et dit seulement : « The file identifier and the volume serial
  number uniquely identify a file on a single computer. To determine whether
  two open handles represent the same file, combine the identifier and the
  volume serial number for each file and compare them. » **Rien sur
  l'hydratation, rien sur la déshydratation, rien sur les espaces réservés.**
- **S7**, `BY_HANDLE_FILE_INFORMATION`, est la page la plus précise sur la
  stabilité de l'identifiant, mais elle parle du **système de fichiers**, pas
  de la synchronisation infonuagique :
  - « In the NTFS file system, a file keeps the same file ID **until it is
    deleted**. »
  - « File IDs are **not guaranteed to be unique over time**, because file
    systems are free to reuse them. **In some cases, the file ID for a file can
    change over time.** »
  - « You can replace one file with another file without changing the file ID
    by using the ReplaceFile function. However, **the file ID of the
    replacement file, not the replaced file, is retained** as the file ID of
    the resulting file. »
  - « The 64-bit identifier in this structure is **not guaranteed to be unique
    on ReFS**. »
- **S3** et **S4** décrivent les états d'espace réservé et les obligations des
  pilotes, **sans jamais mentionner l'identifiant de fichier**.

**Ce qu'on pourrait déduire, et pourquoi ce n'est pas une réponse.** Si une
hydratation ne fait que remplir les données d'un fichier NTFS existant, alors
S7 laisse penser que l'identifiant est conservé, puisque le fichier n'est pas
supprimé. Mais c'est une **déduction**, pas une affirmation sourcée, et elle
suppose que le fournisseur de synchronisation n'utilise ni `ReplaceFile` ni un
remplacement équivalent — ce qui, d'après S7, **changerait** l'identifiant
retenu. Cette déduction est donc consignée comme **hypothèse non vérifiée**,
et non comme réponse.

**Limite de la recherche, à déclarer.** La recherche par moteur a été
**interrompue** : l'outil de recherche web a renvoyé une limite de dépense du
compte avant que toutes les pistes soient épuisées. Les sept sources ci-dessus
ont été obtenues par accès direct aux pages Microsoft. **Il est donc possible
qu'une page officielle réponde à la question 3 sans avoir été trouvée.** La
question reste ouverte, et une reprise de recherche est une action légitime.

**Conséquence pratique — et elle est faible.** `DEC-0009` retient déjà `I-E` :
l'heuristique n'est **qu'une suggestion** et ne préserve jamais
automatiquement l'identité. Si un espace réservé change d'identité à
l'hydratation, FileTopo le verra comme un élément nouveau et proposera au plus
une suggestion à l'utilisateur. **Aucune perte de données ne peut en découler**
— seulement une suggestion de plus. Le risque non résolu est donc un risque
d'**ergonomie**, pas d'intégrité.

## 5.7 Non testé et limites de B4

1. **Aucune observation réelle.** Aucun fichier infonuagique réel n'a été
   examiné. Toutes les affirmations de comportement viennent de la
   documentation, pas de la mesure.
2. **Aucun fournisseur de synchronisation testé.** Ni OneDrive, ni aucun autre.
   §11.1.4 l'interdit, et c'est respecté.
3. **La question 3 reste ouverte** (§5.6), et la recherche a été interrompue
   par une limite d'outil.
4. **Aucune vérification que `CfGetPlaceholderStateFromFindData` est appelable
   depuis Rust stable.** L'API existe dans `CldApi.dll`; son accessibilité et
   son coût **n'ont pas été mesurés**. C'est un travail distinct.
5. **Les étiquettes de point d'analyse ne sont pas énumérées** de source
   officielle. La simulation ne se sert de l'étiquette que comme indice, jamais
   comme critère de décision.
