# DEC-0004 — Index local et modèle de données

- **Date :** 2026-08-25
- **Statut :** `VERIFIED`
- **Phase :** 2
- **Décideur :** orchestrateur, sous l'autorisation permanente du 2026-08-25
- **replaced_by :** [DEC-0009](DEC-0009-data-model-and-relations.md), approuvée par Sébastien le 2026-08-31 (porte P2)

## Contexte

L'index doit accepter un million d'éléments, permettre recherche et
pagination pendant une mise à jour, survivre à un arrêt brutal et être
entièrement reconstructible depuis les métadonnées du corpus.

## Options examinées

| Option | Avantages | Inconvénients |
|--------|-----------|---------------|
| SQLite embarqué | Transactions, index, FTS5, récupération, fichier unique principal, migrations | Écriture à sérialiser; checkpoints WAL; schéma à maintenir |
| JSON/CBOR segmenté | Simple à inspecter et reconstruire | Recherche, concurrence, mises à jour partielles et migrations plus complexes |
| RocksDB/LevelDB | Écritures ordonnées et gros volumes | Dépendance native plus lourde; requêtes relationnelles et migrations à construire |
| Base graphe embarquée | Relations naturelles | Écosystème/distribution plus risqués; inutile pour le MVP hiérarchique |

## Décision

Un **fichier SQLite par collection**, plus une petite base de catalogue pour
les réglages non sensibles. Accès exclusivement depuis Rust avec `rusqlite`
et SQLite embarqué corrigé. Version minimale autorisée : **SQLite 3.51.3** ou
une version officiellement rétroportée (`3.50.7`/`3.44.6`) corrigeant le bogue
WAL-reset. La version embarquée ciblée au 2026-08-25 est 3.53.2.

Le mode WAL est autorisé avec **un seul écrivain applicatif**, transactions
courtes et checkpoints contrôlés pendant les périodes d'inactivité. Les
lectures UI utilisent des transactions courtes; aucun lecteur durable.

## Schéma logique initial

| Table | Rôle / colonnes essentielles |
|-------|------------------------------|
| `schema_meta` | `schema_version`, `created_by`, `layout_version`, état de migration |
| `collection_meta` | UUID, racine d'affichage, identité de volume, options, état de scan, curseurs |
| `nodes` | ID entier, parent, type, nom affiché, chemin relatif UTF-16LE en BLOB, clé stable, attributs, taille, dates, indicateurs nuage/erreur/exclusion |
| `node_stats` | descendants, tailles agrégées, diversité, récence, centralité structurelle, score d'attention |
| `layout_cells` | version, niveau de détail, boîte/forme, centre, importance, élévation |
| `map_tiles` | version de layout, zoom, x/y, révision et agrégats sérialisés |
| `changes` | séquence locale bornée pour diagnostic et reprise; pas un journal permanent des noms privés |
| `errors` | code normalisé, node ID, phase et compteur; message nettoyé |
| `search_names` | table FTS5 externe/contentless pour noms et chemins affichables seulement |

Les chemins Windows peuvent contenir des unités UTF-16 non représentables
proprement en UTF-8. La forme autoritative est donc un BLOB de chemin relatif
UTF-16LE; le texte affiché est une projection avec remplacement, jamais la clé
de round-trip.

## Identité et migrations

- Clé primaire interne monotone par base.
- Clé stable préférée : identité de volume + identifiant de fichier Windows,
  si disponible et fiable; repli : hash versionné du chemin relatif brut et
  du type. Les fournisseurs nuage et systèmes de fichiers peuvent invalider
  cette stabilité; la réconciliation doit tolérer les remplacements.
- `PRAGMA user_version` et table `schema_meta` pilotent des migrations
  séquentielles et transactionnelles.
- Avant migration destructive : copie cohérente de l'index dans le dossier de
  données de l'application, jamais dans le corpus.
- Si migration incompatible/échoue : conserver l'ancien index, créer un nouvel
  index et reconstruire. Le corpus reste intact.

## Indexation sûre

- Parcours itératif borné; `symlink_metadata`/attributs Windows sans suivre
  jonctions, liens symboliques ou points de réanalyse par défaut.
- Aucun contenu de fichier lu dans le MVP; seulement métadonnées nécessaires.
- Les fichiers avec `FILE_ATTRIBUTE_RECALL_ON_DATA_ACCESS` sont marqués en
  ligne seulement et ne sont jamais ouverts pour lecture/miniature/hash.
- Erreurs de permission, chemins disparus et cycles potentiels deviennent des
  diagnostics; ils ne font pas échouer toute la collection.
- Écriture par lots bornés, annulation vérifiée entre lots, progression
  monotone mais explicitement estimée.
- Surveillance Windows : perte/overflow d'événements => collection `dirty` et
  réénumération; jamais supposer le watcher exhaustif.

## Conséquences

- SQLite n'est jamais placé dans le dossier observé.
- Aucune requête SQL brute n'est acceptée depuis l'interface.
- FTS5 indexe par défaut les noms et chemins, pas le contenu documentaire.
- Une base par collection facilite suppression, reconstruction et isolation.
- Les tests doivent simuler corruption, migration interrompue, `SQLITE_BUSY`,
  disque plein et overflow de watcher.

## Preuves

- SQLite WAL : https://www.sqlite.org/wal.html
- SQLite FTS5 : https://www.sqlite.org/fts5.html
- SQLite `user_version` : https://www.sqlite.org/pragma.html#pragma_user_version
- Rust `symlink_metadata` :
  https://doc.rust-lang.org/std/fs/fn.symlink_metadata.html
- Windows `ReadDirectoryChangesExW` :
  https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-readdirectorychangesexw
- Windows placeholders :
  https://learn.microsoft.com/en-us/windows-hardware/drivers/ifs/placeholders_guidance
- rusqlite : https://github.com/rusqlite/rusqlite

## Limites

Le schéma physique et les index SQL exacts seront validés par benchmarks en
phase 3. Le mode WAL doit être désactivable si le support de fichiers ou les
tests de robustesse l'exigent.
