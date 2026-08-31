# DEC-0011 — Isolation des cerveaux, migrations et intégrité

- **Date :** 2026-08-31
- **Statut :** `PROPOSED`
- **Phase :** 1
- **Décideur :** Sébastien — **décision non prise.** Fiche soumise à la porte
  P2 de [TASK-0011](../tasks/TASK-0011-functional-architecture-baseline.md).
- **replaced_by :** —

> Cette fiche **compare** et **classe**. Elle ne tranche pas.

## Contexte

Deux exigences se rejoignent sur le même objet — l'espace de données d'un
cerveau :

1. **L'isolation réelle** (F-002, F-034). Racine, index, nom, couleur, icône,
   préférences, vue et état vu/non vu doivent être séparés. Le défaut connu du
   prototype — basculer d'onglet ne charge pas l'index correspondant — est
   traité comme une **exigence d'architecture**, pas comme un bogue à corriger
   plus tard.
2. **La survie des données** : versions de schéma, migration atomique, copie
   de sûreté, détection de corruption, reconstruction, retour arrière.

**Constat vérifié par lecture du code au commit `01e6860f`.** Le registre
(`src-tauri/src/registry.rs`) conserve plusieurs collections avec racine, nom
dérivé, couleur et statistiques, et un index SQLite existe par collection.
Mais `src/App.tsx:314` n'exécute que `setActiveCollectionId(collection.id)` et
`setPageOffset(0)`, sans commande de chargement; or `persistentSnapshot`
(`src/App.tsx:110`) exige `snapshot.collectionId === activeCollectionId`.
Basculer d'onglet laisse donc l'interface sans instantané. L'isolation du
stockage existe; l'isolation du **chargement** n'existe pas.

Par ailleurs, `Index::initialize` (`src-tauri/src/index.rs:32-71`) porte déjà
une migration : ajout conditionnel de la colonne `seen`, puis
`PRAGMA user_version=2`. Il existe donc un embryon de versionnement, mais
aucune copie de sûreté, aucun contrôle d'intégrité et aucun retour arrière.

## Options examinées — stockage par cerveau

| Option | Avantages | Inconvénients |
|--------|-----------|---------------|
| **S-A — Un fichier de base par cerveau** (position de `DEC-0004`, et comportement actuel) | Isolation physique : supprimer un cerveau, c'est supprimer un fichier; une corruption n'atteint qu'un cerveau; la sauvegarde et la reconstruction sont par cerveau; les migrations peuvent progresser cerveau par cerveau, donc échouer partiellement sans tout bloquer; un seul écrivain par fichier, ce que WAL exige | Autant de connexions et de fichiers `.wal`/`.shm` que de cerveaux ouverts; une requête inter-cerveaux est impossible sans `ATTACH`, et SQLite documente que l'atomicité multi-bases est **par base**, pas globale; le catalogue devient un point de cohérence à part |
| **S-B — Une base unique partitionnée par colonne de cerveau** | Une seule connexion, un seul fichier, une seule migration; requêtes inter-cerveaux triviales; moins d'artefacts sur le disque | L'isolation devient une **discipline de requête** : un `WHERE` oublié fait fuiter un cerveau dans un autre, ce qui est exactement la classe de défaut à éliminer; une corruption atteint **tous** les cerveaux; supprimer un cerveau devient une suppression de masse; un seul écrivain pour l'ensemble, donc contention entre cerveaux; une migration ratée bloque tout |
| **S-C — Hybride** : un catalogue commun (identité, nom, couleur, icône, racine, état) plus un fichier d'index dérivé par cerveau | Sépare l'**état non reconstructible** (petit, précieux, dans le catalogue) de l'**index dérivé** (gros, jetable, par cerveau); détruire et reconstruire un index n'efface jamais le nom, la couleur ni l'attention de l'utilisateur; le catalogue seul suffit à sauvegarder ce qui compte | Deux schémas à versionner et à migrer de façon coordonnée; une incohérence entre catalogue et index devient possible et doit être détectée; c'est le modèle le plus proche de l'existant, donc le moins « neuf », ce qui peut masquer ses défauts |

## Options examinées — migrations

| Option | Avantages | Inconvénients |
|--------|-----------|---------------|
| **M-A — Migration en place, transactionnelle, sans copie** | Simple; SQLite garantit l'atomicité de la transaction, donc pas d'état à moitié migré | **Aucun retour arrière** si la migration est *correcte mais indésirable* (perte de données par transformation, bogue découvert après coup); une corruption révélée pendant la migration n'a aucune sauvegarde à restaurer |
| **M-B — Copie de sûreté, puis migration en place, restauration si échec** | Retour arrière réel; correspond à l'exigence de `TASK-0011` §7.1 point 15 | La copie peut **ne jamais aboutir** : l'API de sauvegarde en ligne redémarre à chaque écriture externe, et « if the backup process is restarted frequently enough it may never run to completion »; il faut donc suspendre les écritures et poser un délai maximal |
| **M-C — Migration vers une base neuve, bascule atomique** : lire l'ancienne, écrire une neuve, permuter à la fin | L'ancienne base **reste intacte** jusqu'à la bascule : c'est un retour arrière par construction, sans dépendre de l'API de sauvegarde; la bascule est un renommage de fichier; un échec ne laisse aucun état intermédiaire | Exige transitoirement l'espace disque des deux bases; la bascule doit être écrite avec soin (fichiers `.wal`/`.shm` associés); plus lent qu'une migration en place sur un gros index |
| **M-D — Pas de migration : reconstruire depuis les sources** | Le plus simple; l'index étant dérivé, il est par définition reconstructible | **Détruit l'état non reconstructible** (nom, couleur, préférences, vu/non vu, relations approuvées, journal) s'il n'est pas stocké ailleurs; coûte une indexation complète à chaque changement de schéma; inacceptable seul |

## Décision

**Aucune.** Classements recommandés, soumis à Sébastien :

**Stockage :** 1. **S-C** (recommandé) — 2. S-A — 3. S-B (rejetée :
l'isolation par discipline de requête est exactement le défaut à éliminer).

**Migrations :** 1. **M-C** (recommandé) — 2. M-B — 3. M-D en **repli** de
M-C, jamais seul — 4. M-A (rejetée : pas de retour arrière).

## Motif

**S-C plutôt que S-A** parce que S-A confond deux natures de données. Dans
S-A, détruire l'index d'un cerveau pour le reconstruire détruit aussi son nom,
sa couleur et son état vu/non vu, à moins de les sauver et de les réappliquer
à chaque fois — ce que le prototype fait déjà pour le seul état vu, **par
chemin relatif**, donc en le perdant au premier renommage. S-C élimine la
classe entière de ce défaut : ce qui n'est pas reconstructible ne vit pas dans
ce qui est jetable.

**S-B est rejetée** parce qu'elle transforme l'isolation en discipline. Une
clause `WHERE brain_id = ?` oubliée fait apparaître les données d'un cerveau
dans un autre. F-002 exige que deux cerveaux ne partagent **aucun** état;
une garantie qui dépend de ne jamais oublier une clause n'est pas une
garantie.

**M-C plutôt que M-B** parce que M-B dépend d'une API dont l'éditeur
documente qu'elle peut ne jamais terminer sous écritures concurrentes. M-C
n'a pas ce problème : l'ancienne base n'est pas copiée, elle est **laissée
telle quelle** pendant que la nouvelle se construit. Le retour arrière n'est
pas une opération de restauration, c'est l'absence de bascule.

**M-D en repli, jamais seul.** Quand M-C échoue — schéma trop divergent,
espace insuffisant, corruption — la reconstruction depuis les sources reste
possible **parce que** S-C a mis l'état non reconstructible ailleurs. C'est
la raison pour laquelle les deux classements sont couplés : M-D n'est
acceptable que si S-C est retenue.

## Conséquences

- **Basculer de cerveau est une opération du cœur**, pas un changement d'état
  de l'interface. C'est la traduction directe de F-034 et la correction du
  défaut constaté à `src/App.tsx:314`.
- Le **catalogue** contient l'état non reconstructible et doit être sauvegardé
  et versionné indépendamment des index dérivés.
- **`integrity_check` ne suffit pas** : il ne détecte pas les erreurs de clé
  étrangère; `foreign_key_check` est nécessaire si le schéma en utilise.
  `quick_check` est en O(N) contre O(N log N) mais ne vérifie ni l'unicité ni
  la cohérence des index : il convient à un contrôle de démarrage, pas à une
  validation post-migration.
- **Une migration impossible ne touche jamais les sources.** Pire cas
  admissible : ancien index conservé, cerveau ouvert en lecture seule,
  avertissement affiché, reconstruction proposée.
- Une **version de schéma inconnue et plus récente** doit provoquer un refus
  d'ouvrir en écriture, jamais une migration à rebours (test R9 de
  [TEST_STRATEGY.md](../architecture/TEST_STRATEGY.md)).
- Les artefacts — index, catalogue, copies, fichiers `.wal` et `.shm` —
  résident **exclusivement dans l'espace applicatif**, jamais dans la racine
  analysée. Cette règle n'est ouverte à aucune option.
- WAL exige que tous les processus soient sur le même hôte : un espace de
  données de cerveau ne doit jamais être placé sur un partage réseau.

## Preuves

| # | Fait | Source primaire | Consultée le |
|---|---|---|---|
| P1 | API de sauvegarde en ligne : produit « a bit-wise identical copy of the source database as it was when the copying commenced »; une écriture externe « usually restarts the backup process »; « If the backup process is restarted frequently enough it may never run to completion. » | https://www.sqlite.org/backup.html | 2026-08-31 |
| P2 | `PRAGMA user_version` : entier à l'offset 60 de l'en-tête, « entirely application-defined », SQLite n'en fait aucun usage | https://www.sqlite.org/pragma.html#pragma_user_version | 2026-08-31 |
| P3 | `integrity_check` : détecte enregistrements malformés, pages manquantes, entrées d'index manquantes ou surnuméraires, violations UNIQUE/CHECK/NOT NULL; **ne détecte pas** les erreurs de clé étrangère (`foreign_key_check`). `quick_check` : O(N) contre O(N log N), ignore les contraintes UNIQUE et la cohérence des index | idem | 2026-08-31 |
| P4 | WAL : « All processes using a database must be on the same host computer; WAL does not work over a network filesystem. » Un seul écrivain; les longues transactions de lecture peuvent affamer le checkpoint; fichiers `.wal` et `.shm` supplémentaires; transactions multi-bases atomiques **par base**, pas globalement | https://www.sqlite.org/wal.html | 2026-08-31 |
| P5 | Limites SQLite : ~281 To par base, chaîne/BLOB 1 000 000 000 octets par défaut, 2 000 colonnes par défaut — sans effet limitant sur les cibles du MVP | https://www.sqlite.org/limits.html | 2026-08-31 |
| P6 | Constat de code au commit `01e6860f` : registre SQLite multi-collections avec racine, nom, couleur et statistiques; index par collection; migration embryonnaire (ajout conditionnel de `seen`, `PRAGMA user_version=2`); **aucune** copie de sûreté, **aucun** contrôle d'intégrité, **aucun** retour arrière | `src-tauri/src/registry.rs:58-75`, `src-tauri/src/index.rs:32-71` | 2026-08-31 |
| P7 | Constat de code : basculer d'onglet n'exécute que `setActiveCollectionId` et `setPageOffset(0)`, sans chargement; `persistentSnapshot` exige `snapshot.collectionId === activeCollectionId` | `src/App.tsx:110`, `src/App.tsx:314` | 2026-08-31 |

## Limites

- **Non testé.** Aucune migration n'a été écrite ni exécutée; aucune copie de
  sûreté n'a été tentée; aucune corruption n'a été simulée.
- Le coût en espace disque de M-C (deux index transitoires) n'est pas estimé;
  il dépend de la taille d'index visée par §3.5 de
  [BASELINE_TARGETS.md](../performance/BASELINE_TARGETS.md), elle-même non
  mesurée.
- La mécanique exacte de bascule atomique sous Windows — renommage de la base
  **et** de ses fichiers `.wal`/`.shm` associés — n'a **pas** été vérifiée sur
  source primaire. C'est une incertitude qui pèse directement sur M-C et qui
  doit être levée avant approbation.
- Le comportement d'un antivirus vis-à-vis d'un renommage de base pendant une
  bascule n'est pas connu.
- Cette fiche dépend de [DEC-0009](DEC-0009-data-model-and-relations.md) pour
  la définition précise de l'état non reconstructible.
