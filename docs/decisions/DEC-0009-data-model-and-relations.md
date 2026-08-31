# DEC-0009 — Modèle de données, identifiants stables et relations

- **Date :** 2026-08-31
- **Statut :** `PROPOSED`
- **Phase :** 1
- **Décideur :** Sébastien — **décision non prise.** Fiche soumise à la porte
  P2 de [TASK-0011](../tasks/TASK-0011-functional-architecture-baseline.md).
- **replaced_by :** —

> Cette fiche **compare** et **classe**. Elle ne tranche pas.

## Contexte

Deux questions distinctes, réunies parce qu'elles partagent le même modèle :

1. **Quelle identité un nœud conserve-t-il** à travers un renommage, un
   déplacement, un changement de volume ? Sans réponse, le journal de
   changements (F-027) et l'état vu/non vu (F-028) produisent du bruit :
   chaque renommage apparaît comme une suppression suivie d'une création, et
   l'attention de l'utilisateur est réinitialisée sans raison.
2. **Comment une relation prouve-t-elle sa provenance ?** La vision interdit
   d'inventer une relation silencieusement.

**Constat sur le prototype.** Les identifiants sont des entiers attribués par
ordre de parcours (`src-tauri/src/scanner.rs:66`, `next_id` incrémenté), donc
**recréés à chaque scan**. Le seul état préservé entre deux scans l'est par
**chemin relatif** : `replace_nodes` relève les chemins marqués vus avant le
`DELETE`, puis les réapplique (`src-tauri/src/index.rs:75-107`). Un renommage
perd donc l'état vu. Le modèle ne connaît que `parent_id`
(`src-tauri/src/domain.rs:36`) : aucune relation transversale, aucune
provenance.

**Contrainte majeure découverte pendant `TASK-0011`.** `DEC-0004` fait de
« identité de volume + identifiant de fichier Windows » la clé stable
préférée. Or, en **Rust stable**, `volume_serial_number()`, `file_index()`,
`number_of_links()` et `change_time()` de `std::os::windows::fs::MetadataExt`
sont **`nightly-only`**, et renvoient `None` si la métadonnée provient de
`DirEntry::metadata`. `DEC-0003` impose Rust **stable**. Ces deux fiches
vérifiées sont donc en tension, et il faut la résoudre explicitement.

## Options examinées — identifiant stable

| Option | Avantages | Inconvénients |
|--------|-----------|---------------|
| **I-A — Identité système Windows**, via `GetFileInformationByHandleEx(FileIdInfo)` : `VolumeSerialNumber` + `FileId` 128 bits | La seule identité que Microsoft documente comme identifiant un fichier de façon unique sur un ordinateur; survit au renommage et au déplacement intra-volume; supportée sur SMB 3.0, CsvFS et ReFS; zéro faux positif par construction | Non atteignable par la bibliothèque standard Rust sur le canal stable : exige une **dépendance d'API Windows** ou l'ouverture d'un handle par fichier, avec un coût d'entrées/sorties à mesurer; ne survit ni au changement de volume, ni à une copie, ni à une restauration depuis une sauvegarde; les fournisseurs infonuagiques peuvent l'invalider |
| **I-B — Empreinte versionnée du chemin relatif et du type** (position de repli de `DEC-0004`) | Aucune dépendance; calculable depuis ce que le scanner lit déjà; déterministe et reproductible; fonctionne sur tout système de fichiers | **Ne survit ni au renommage ni au déplacement** — c'est exactement le défaut du prototype, formalisé; ne résout donc pas le problème posé |
| **I-C — Corrélation heuristique** : nom, taille, dates, type, position dans l'arbre, appariement par score sur un lot de changements | Aucune dépendance; peut corréler un déplacement inter-volume, une copie et une restauration, là où I-A échoue; dégrade proprement | Produit des **faux positifs** (deux fichiers identiques déplacés en même temps); non déterministe au sens strict; le seuil de score est un paramètre à justifier et à mesurer; explicable difficilement à un utilisateur |
| **I-D — I-A avec repli sur I-C** : identité système quand elle est disponible et fiable, corrélation heuristique sinon, chaque nœud portant la **provenance de son identité** | Couvre les deux familles de cas; l'utilisateur et le journal peuvent afficher « corrélé par identité système » contre « corrélé par ressemblance » contre « non corrélé »; les cas non corrélables sont **comptés et déclarés** au lieu d'être masqués | Deux mécanismes à écrire, à tester et à maintenir; la logique de bascule est elle-même une source de bogues; coût d'entrées/sorties de I-A toujours présent |

## Options examinées — relations

| Option | Avantages | Inconvénients |
|--------|-----------|---------------|
| **R-A — Provenance comme champ obligatoire** : toute relation stockée porte un type et une provenance (`dérivée`, `déterministe`, `approuvée`, `suggérée`); une relation sans provenance n'est pas représentable | L'invariant « aucune relation inventée » devient une propriété du schéma, pas une discipline de code; l'interface peut toujours afficher l'origine; la révocation d'une suggestion est triviale | Alourdit chaque ligne de relation; exige de nommer et de versionner chaque règle déterministe |
| **R-B — Provenance comme métadonnée facultative** : relations stockées uniformément, provenance ajoutée quand elle est connue | Schéma plus simple; moins d'écriture | Une relation sans provenance devient représentable, donc elle finira par exister; l'invariant redevient une promesse au lieu d'une garantie; c'est le chemin par lequel une suggestion se transforme silencieusement en fait |
| **R-C — Séparer les tables** : relations dérivées d'un côté, relations non dérivées de l'autre, chacune avec son propre schéma | Les relations hiérarchiques, seules présentes au MVP, restent minimales et rapides; les relations non dérivées portent naturellement leur provenance, leur date et leur auteur; supprimer toutes les suggestions est une seule opération | Deux chemins de lecture à unifier pour l'affichage; une relation qui change de nature migre d'une table à l'autre |

## Décision

**Aucune.** Classements recommandés, soumis à Sébastien :

**Identifiant stable :** 1. **I-D** (recommandé) — 2. I-A — 3. I-C — 4. I-B
(insuffisant seul, puisqu'il reproduit le défaut connu).

**Relations :** 1. **R-C** (recommandé) — 2. R-A — 3. R-B (rejetée : elle rend
l'invariant inapplicable).

**Proposition annexe, à trancher avec `DEC-0007`.** Si I-D ou I-A est retenue,
le projet doit accepter une **dépendance d'API Windows** dans le cœur Rust.
C'est le point où `DEC-0003` (Rust stable) et `DEC-0004` (identité de volume +
identifiant de fichier) se rejoignent. Ni l'une ni l'autre n'est modifiée ici;
la révision est **proposée**, pas appliquée.

## Motif

**I-D plutôt que I-A** parce que I-A échoue précisément sur les cas que
l'utilisateur perçoit comme les plus évidents : « j'ai copié mon dossier sur
un autre disque », « j'ai restauré une sauvegarde ». Une identité qui casse
là où l'utilisateur voit une continuité produit un journal de changements
qu'il cessera de lire.

**I-D plutôt que I-C** parce que l'heuristique seule produit des faux
positifs, et qu'un faux positif dans un journal de changements est pire qu'un
« non corrélé » honnête : il affirme un déplacement qui n'a pas eu lieu.

**La clause décisive de I-D** est la **provenance de l'identité**. Elle rend
le compromis visible au lieu de le cacher : `TASK-0011` §7.1 point 5 exige
d'indiquer « ce qui survit... et ce qui ne survit pas », et un nœud qui porte
la provenance de sa propre identité répond à cette exigence par construction.

**R-C plutôt que R-A** parce que le MVP ne contient que des relations
hiérarchiques dérivées (F-016), et que R-C les garde minimales tout en
préparant F-017 sans dette. R-A reste correcte et n'est pas rejetée.

**R-B est rejetée** parce qu'un champ facultatif finit toujours par être vide.

## Conséquences

- Le schéma doit distinguer explicitement l'**index dérivé** (jetable,
  reconstructible) de l'**état non reconstructible** : nom, couleur, icône,
  préférences, vue, état vu/non vu, relations approuvées, journal de
  changements. Les seconds doivent survivre à une reconstruction complète des
  premiers — voir [DEC-0011](DEC-0011-brain-isolation-and-migrations.md).
- La table de recherche plein texte est concernée : une table FTS5
  « contentless » classique ne supporte ni `UPDATE` ni `DELETE`, ce qui rend
  la mise à jour incrémentale (F-031) impossible sans reconstruction. La
  variante `contentless_delete=1` (SQLite 3.43.0+) ou une table à contenu
  externe lève cette contrainte. **Le choix reste ouvert.**
- Chaque règle déterministe de relation transversale devra être **nommée et
  versionnée** avant d'être activée; c'est ce qui rend une relation
  « déterministe » vérifiable.
- Le coût d'entrées/sorties de l'ouverture d'un handle par fichier (I-A, I-D)
  doit être mesuré avant approbation définitive : il pèse directement sur les
  cibles §3.1 et §3.2 de
  [BASELINE_TARGETS.md](../performance/BASELINE_TARGETS.md).

## Preuves

| # | Fait | Source primaire | Consultée le |
|---|---|---|---|
| P1 | `FILE_ID_INFO` = `VolumeSerialNumber` (ULONGLONG) + `FileId` (FILE_ID_128). « The file identifier and the volume serial number uniquely identify a file on a single computer. » | https://learn.microsoft.com/en-us/windows/win32/api/winbase/ns-winbase-file_id_info | 2026-08-31 |
| P2 | `GetFileInformationByHandleEx` accepte la classe `FileIdInfo` (0x12); supporté à partir de Windows Vista; supporté sur SMB 3.0, CsvFS et ReFS | https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-getfileinformationbyhandleex | 2026-08-31 |
| P3 | **Rust stable :** `volume_serial_number()`, `file_index()`, `number_of_links()`, `change_time()` sont `nightly-only`; ils renvoient `None` si `Metadata` vient de `DirEntry::metadata`, mais `Some` via `fs::metadata()` ou `File::metadata()` | https://doc.rust-lang.org/std/os/windows/fs/trait.MetadataExt.html | 2026-08-31 |
| P4 | `fs::symlink_metadata` interroge les métadonnées « without following symlinks » | https://doc.rust-lang.org/std/fs/fn.symlink_metadata.html | 2026-08-31 |
| P5 | FTS5 « contentless » (`content=''`) : ne supporte ni `UPDATE` ni `DELETE`; `contentless_delete=1` (3.43.0+) les supporte; une table à contenu externe doit être maintenue cohérente par l'application | https://www.sqlite.org/fts5.html | 2026-08-31 |
| P6 | Le journal USN NTFS enregistre les changements de volume et sert notamment à « recover file system indexing... after a computer or volume failure » | https://learn.microsoft.com/en-us/windows/win32/fileio/change-journals | 2026-08-31 |
| P7 | Constat de code au commit `01e6860f` : identifiants entiers recréés par parcours; état vu préservé **par chemin relatif** au travers d'un `DELETE` puis réinsertion; aucune relation transversale ni provenance dans le modèle | `src-tauri/src/scanner.rs:66`, `src-tauri/src/index.rs:75-107`, `src-tauri/src/domain.rs:36` | 2026-08-31 |

**Piste non explorée, signalée honnêtement.** Le journal USN (P6) pourrait
fournir une réconciliation plus fiable que la surveillance de répertoire, mais
il n'a **pas** été étudié dans cette fiche : ses exigences de privilèges, sa
troncature et son support par système de fichiers n'ont pas été vérifiés sur
source primaire. Cela relève de
[DEC-0010](DEC-0010-indexing-and-watching.md) et reste une **incertitude**.

## Limites

- **Non testé.** Aucune compilation, aucun appel d'API, aucune mesure du coût
  d'ouverture d'un handle par fichier.
- Le tableau de survie de
  [ARCHITECTURE_BASELINE.md](../architecture/ARCHITECTURE_BASELINE.md) §3.2
  est une **inférence** à partir de P1, pas un résultat expérimental.
- Le comportement des fournisseurs de synchronisation infonuagique vis-à-vis
  de l'identité de fichier n'est **établi par aucune source consultée**, ni
  dans un sens ni dans l'autre. `DEC-0004` l'avait signalé; cette fiche ne
  peut pas le lever.
- Aucune caisse Rust n'est recommandée nommément pour l'accès à l'API
  Windows; son nom, sa version et sa licence relèvent d'une tâche ultérieure.
- Le seuil de score de l'option I-C n'est pas proposé : il n'a aucun
  fondement mesuré à ce jour.
