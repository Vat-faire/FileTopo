# PERF-0002 — Mesures de B1, migration SQLite sur Windows

- **Banc d'essai :** `B1` de
  [TASK-0012](../tasks/TASK-0012-technical-risk-gates.md)
- **Spike :** `spikes/b1-sqlite-migration/`
- **Date de mesure :** 2026-08-31
- **Journal complet, preuves et verdict :**
  [TASK-0012-risk-gate-results.md §2](../research/TASK-0012-risk-gate-results.md)
- **Statut :** mesures de banc d'essai. **Aucune n'est une performance
  annoncée de FileTopo.**

> Ces chiffres proviennent d'un prototype jetable, sur une machine unique, avec
> des données entièrement synthétiques et un moteur SQLite différent de celui
> de la production. Ils servent à **comparer deux stratégies entre elles**, pas
> à promettre une durée à un utilisateur.

## 1. Matériel et outillage

Déclarés **avant** la première mesure, conformément à §12.4 de `TASK-0012`.

| Élément | Valeur |
|---|---|
| Processeur | Intel Core i9-9900K, 8 cœurs / 16 fils, 3,60 GHz nominal |
| Mémoire vive | 63,9 Gio |
| Disque | Samsung SSD 970 EVO Plus 1 To, NVMe |
| Volume | `C:`, NTFS, 301,6 Gio libres |
| Système | Windows 11 Professionnel, 10.0.26200, build 26200 |
| Alimentation | mode « Utilisation normale » |
| Exécution | Node.js v24.13.1, module intégré `node:sqlite`, **SQLite 3.51.2** |
| Machine de mesure | poste de développement ordinaire, services et antivirus **actifs** |

**Le moteur n'est pas celui de la production.** FileTopo utilise
`rusqlite 0.40.2` avec SQLite embarqué. Les durées ci-dessous ne sont donc
**pas** transposables telles quelles au futur code Rust.

## 2. Protocole

1. Base héritée **synthétique** : 50 000 nœuds, graine fixe `20260831`,
   2 514 944 octets, schéma v1, mode WAL, checkpointée avant chaque mesure.
2. Migration du schéma v1 vers v2 : deux colonnes ajoutées (`depth`,
   `path_hash`), un index ajouté, une table ajoutée.
3. **Cinq exécutions** par stratégie. **Médiane** publiée, avec l'**écart
   min–max complet**. Aucune moyenne. **Aucune exécution écartée.**
4. Chronométrage par `process.hrtime.bigint()`, autour du seul appel de
   migration; la construction de la base héritée est **hors** chronomètre.
5. Espace disque relevé **aux frontières d'étapes** de la migration. Les
   migrations étant synchrones, elles bloquent la boucle d'événements : un
   échantillonnage par minuterie ne se déclenche jamais et mesurerait 0.
   Un pic survenant **à l'intérieur** d'une étape est donc sous-estimé.

## 3. Durées

| Stratégie | Médiane | min | max | Écart max−min |
|---|---|---|---|---|
| `M-C` naïve | **778,4 ms** | 775,7 ms | 800,1 ms | 24,4 ms |
| `M-C durcie` | **776,9 ms** | 770,4 ms | 785,3 ms | 14,9 ms |
| `M-B` en place | **663,3 ms** | 655,0 ms | 666,8 ms | 11,8 ms |

Séries brutes, en millisecondes, dans l'ordre d'exécution :

| Stratégie | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| `M-C` naïve | 798,4 | 800,1 | 778,4 | 775,7 | 776,4 |
| `M-C durcie` | 773,4 | 785,3 | 770,4 | 779,6 | 776,9 |
| `M-B` en place | 662,4 | 655,0 | 664,1 | 666,8 | 663,3 |

## 4. Espace disque

Base héritée de référence : **2 514 944 octets** (2,40 Mio).

| Stratégie | Pic total | Supplément transitoire | Pic / base | Taille finale |
|---|---|---|---|---|
| `M-C` naïve | 12,38 Mio | +9,98 Mio | 5,16 × | 4,93 Mio |
| `M-C durcie` | 12,38 Mio | +9,98 Mio | 5,16 × | 4,93 Mio |
| `M-B` en place | 12,07 Mio | +9,68 Mio | 5,03 × | **5,08 Mio** |

## 5. Ce que les chiffres disent

1. **Le durcissement de `M-C` ne coûte rien de mesurable.** 776,9 ms contre
   778,4 ms, avec des intervalles qui se recouvrent entièrement. Les deux
   étapes qui évitent la corruption décrite au §2.3 du journal de résultats
   sont **gratuites en temps**.
2. **`M-B` est plus rapide d'environ 15 %**, parce qu'elle ne recopie pas les
   lignes dans un fichier neuf.
3. **L'argument d'espace disque en faveur de `M-B` ne se vérifie pas ici.**
   2,6 % d'écart entre les pics. Ce qui domine le pic n'est pas la seconde
   base, c'est le `-wal` de la transaction d'écriture, présent dans les deux
   stratégies.
4. **`M-B` laisse une base 3,0 % plus grosse**, la migration en place
   fragmentant le fichier sans `VACUUM`.

**Aucun de ces écarts ne tranche la décision.** Le verdict de `B1` se joue sur
la **sûreté**, pas sur la vitesse : voir §2.7 du journal de résultats.

## 6. Limites de ces mesures

- **Une seule volumétrie** — 50 000 nœuds, 2,4 Mio. Aucune mesure à 1 million
  de nœuds. **Les durées ne sont pas extrapolables.**
- **Une seule machine, un seul volume, un seul système de fichiers.**
- **Machine non isolée** : services et antivirus actifs. C'est la raison pour
  laquelle les écarts min–max sont publiés à côté de chaque médiane.
- **Un seul enchaînement de migration.** L'effet de fragmentation cumulée de
  `M-B` sur plusieurs migrations successives n'a **pas** été mesuré.
- **Moteur SQLite différent de la production**, via un module Node et non
  `rusqlite`.
- Les durées de `B0` — installation, tests, construction — ne sont **pas** des
  mesures de performance : une seule exécution chacune, publiées comme
  constats de faisabilité.
