# DEC-0009 — Modèle de données, identifiants stables et relations

- **Date :** 2026-08-31
- **Statut :** `APPROVED`
- **Phase :** 1
- **Décideur :** **Sébastien — GO explicite du 2026-08-31.** Porte P2 de
  [TASK-0011](../tasks/TASK-0011-functional-architecture-baseline.md)
  franchie; cette fiche est **approuvée**.
- **Approuvée le :** 2026-08-31
- **replaced_by :** —

> **Décision arrêtée.** Sébastien a franchi la porte P2 le 2026-08-31 et a
> retenu **I-E** pour l'identité et **R-C** pour les relations. Le classement
> et les options écartées sont conservés ci-dessous comme motif. **Rien n'a
> été compilé, appelé ni mesuré.**

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
| **I-D — I-A avec repli automatique sur I-C** : identité système quand elle est disponible, corrélation heuristique sinon, chaque nœud portant la **provenance de son identité** | Couvre les deux familles de cas; l'utilisateur et le journal peuvent afficher « corrélé par identité système » contre « corrélé par ressemblance » contre « non corrélé » | Deux mécanismes à écrire, à tester et à maintenir; la logique de bascule est elle-même une source de bogues; **surtout : une heuristique y devient une source d'identité**, donc un faux positif y préserve l'identité, l'état vu/non vu et le journal d'un fichier qui n'est pas le même. Le produit affirme alors un fait qu'il n'a pas prouvé |
| **I-E — I-A quand elle est disponible, I-B déterministe sinon, I-C réduite à une suggestion visible** : l'identité vient de `VolumeSerialNumber` + `FileId` quand la plateforme la fournit; à défaut, elle vient d'une empreinte versionnée du chemin relatif; l'heuristique ne produit **jamais** une identité, seulement un « déplacement possible » proposé à l'utilisateur | Aucune identité n'est jamais affirmée sans preuve : l'identité est soit prouvée par le système, soit déterministe et reproductible; un faux positif heuristique ne peut plus corrompre l'état vu/non vu ni le journal, puisqu'il ne fait qu'afficher une suggestion révocable; le comportement est explicable en une phrase à l'utilisateur; la provenance de l'identité reste obligatoire et n'a que deux valeurs prouvables | Un déplacement inter-volume non prouvable reste journalisé comme création **plus** suppression, ce qui est moins confortable que I-D; l'utilisateur doit accepter une suggestion pour recoller les deux; le repli I-B conserve le défaut connu du prototype **là où l'identité système est indisponible**, défaut alors **visible et déclaré** au lieu d'être masqué par une heuristique |

## Options examinées — relations

| Option | Avantages | Inconvénients |
|--------|-----------|---------------|
| **R-A — Provenance comme champ obligatoire** : toute relation stockée porte un type et une provenance (`dérivée`, `déterministe`, `approuvée`, `suggérée`); une relation sans provenance n'est pas représentable | L'invariant « aucune relation inventée » devient une propriété du schéma, pas une discipline de code; l'interface peut toujours afficher l'origine; la révocation d'une suggestion est triviale | Alourdit chaque ligne de relation; exige de nommer et de versionner chaque règle déterministe |
| **R-B — Provenance comme métadonnée facultative** : relations stockées uniformément, provenance ajoutée quand elle est connue | Schéma plus simple; moins d'écriture | Une relation sans provenance devient représentable, donc elle finira par exister; l'invariant redevient une promesse au lieu d'une garantie; c'est le chemin par lequel une suggestion se transforme silencieusement en fait |
| **R-C — Séparer les tables** : relations dérivées d'un côté, relations non dérivées de l'autre, chacune avec son propre schéma | Les relations hiérarchiques, seules présentes au MVP, restent minimales et rapides; les relations non dérivées portent naturellement leur provenance, leur date et leur auteur; supprimer toutes les suggestions est une seule opération | Deux chemins de lecture à unifier pour l'affichage; une relation qui change de nature migre d'une table à l'autre |

## Décision

**I-E retenue pour l'identité, R-C retenue pour les relations.** L'heuristique
de ressemblance demeure **uniquement une suggestion visible et révocable** :
elle ne préserve jamais automatiquement l'identité, l'état vu/non vu ni le
journal de changements. Sébastien a arrêté ce choix le 2026-08-31 en
franchissant la porte P2.

Les classements qui avaient été soumis, et qui restent le motif de la
décision :

**Identifiant stable :** 1. **I-E** (recommandé) — 2. I-A — 3. I-D — 4. I-B
(insuffisant seul, puisqu'il reproduit le défaut connu) — 5. I-C, **rejetée
comme source d'identité** et admise uniquement comme suggestion.

**Règles de sûreté attachées à I-E, non négociables.**

1. L'identité d'un nœud provient **soit** de l'identité Windows
   `VolumeSerialNumber` + `FileId` lorsqu'elle est disponible, **soit** d'une
   empreinte **déterministe et versionnée** du chemin relatif à la racine
   lorsqu'elle ne l'est pas. Il n'y a pas de troisième source.
2. Une heuristique de ressemblance n'est utilisée qu'à un seul titre :
   proposer un **« déplacement possible »**, affiché comme suggestion visible
   et révocable.
3. **Aucune heuristique ne peut préserver automatiquement l'identité, l'état
   vu/non vu ou le journal de changements comme s'il s'agissait d'un fait.**
   Une suggestion non acceptée ne modifie aucun état.
4. Un **déplacement inter-volume non prouvable** reste journalisé comme une
   **création plus une suppression**, avec une suggestion facultative de
   rapprochement. C'est un aveu d'ignorance honnête, pas un défaut.
5. La **provenance de l'identité** reste un champ obligatoire du modèle. Sous
   I-E elle ne prend que des valeurs prouvables — « identité système » ou
   « empreinte de chemin versionnée » — et jamais « ressemblance ».

**Relations :** 1. **R-C** (recommandé) — 2. R-A — 3. R-B (rejetée : elle rend
l'invariant inapplicable).

**Conséquence arrêtée, cohérente avec [DEC-0007](DEC-0007-rebuild-tech-stack.md).**
I-E s'appuyant sur l'identité Windows lorsqu'elle est disponible, le projet
**accepte le principe** d'une dépendance d'API Windows dans le cœur Rust.
C'est le point où `DEC-0003` (Rust stable) et `DEC-0004` (identité de volume +
identifiant de fichier) se rejoignent. **Aucune caisse n'est choisie ici** :
son nom, sa version et sa licence doivent être établis par le banc d'essai
`B3` de [TASK-0012](../tasks/TASK-0012-technical-risk-gates.md), après
inventaire de licence. Le contenu de `DEC-0003` et `DEC-0004` reste intact;
seul le `replaced_by` de `DEC-0004` pointe désormais vers cette fiche.

## Motif

**I-E plutôt que I-D.** Une première rédaction de cette fiche recommandait
I-D, c'est-à-dire un repli **automatique** sur l'heuristique. Ce classement est
révisé, et le motif du changement est une question de sûreté, pas de confort.
Sous I-D, une heuristique devient une **source d'identité** : un faux positif y
transporte silencieusement l'état vu/non vu et le journal d'un fichier vers un
autre, et le produit affirme alors un fait qu'il n'a jamais prouvé. C'est
exactement la classe d'erreur que la vision interdit lorsqu'elle proscrit
d'inventer une relation. Une identité inventée est pire qu'une relation
inventée : elle réécrit l'attention de l'utilisateur.

**I-E plutôt que I-A seule** parce que I-A n'est pas toujours disponible :
`DEC-0003` impose Rust **stable**, où la clé n'est pas atteignable par la
bibliothèque standard (P3), et rien ne garantit sa disponibilité sur tout
système de fichiers. Il faut donc un repli, et I-E le rend **déterministe**
plutôt que probabiliste.

**I-C est rejetée comme source d'identité.** L'heuristique seule produit des
faux positifs, et un faux positif dans un journal de changements est pire
qu'un « non corrélé » honnête : il affirme un déplacement qui n'a pas eu lieu.
Elle reste utile — mais seulement comme **suggestion visible**, qui n'engage
rien tant que l'utilisateur ne l'a pas acceptée.

**Ce que I-E coûte, écrit franchement.** Là où l'identité système est
indisponible, un renommage ou un déplacement reste non corrélé : le produit
journalise une création et une suppression, et propose éventuellement un
rapprochement. C'est le défaut connu du prototype — mais **déclaré, compté et
visible**, au lieu d'être masqué par une corrélation invérifiable. C'est le
compromis **assumé et approuvé** par Sébastien le 2026-08-31 : I-D a été
écartée précisément parce qu'elle laisserait une heuristique produire une
identité.

**La clause décisive reste la provenance de l'identité.** `TASK-0011` §7.1
point 5 exige d'indiquer « ce qui survit... et ce qui ne survit pas »; un nœud
qui porte la provenance de sa propre identité répond à cette exigence par
construction. Sous I-E, cette provenance a la propriété supplémentaire de
n'être **jamais** une conjecture.

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
- **L'empreinte de repli est versionnée.** Le mode de calcul de l'empreinte de
  chemin relatif porte un numéro de version stocké avec l'index : changer ce
  calcul est une migration, jamais une réécriture silencieuse des identités.
- **Les suggestions de déplacement sont un objet du modèle**, distinct de
  l'identité : elles ont un état (proposée, acceptée, refusée), sont
  révocables, et n'écrivent rien tant qu'elles ne sont pas acceptées. Elles
  relèvent du même invariant de provenance que les relations non dérivées
  (R-C).
- **Le compte de non-corrélations est affiché**, jamais masqué : c'est la
  mesure honnête du coût de I-E, et le signal qui justifierait plus tard de
  reconsidérer I-D.
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
  fondement mesuré à ce jour. Sous I-E ce seuil ne gouverne qu'un affichage de
  suggestion, jamais une écriture d'identité, ce qui abaisse son enjeu sans le
  supprimer.
- **Le taux de non-corrélation attendu sous I-E n'est pas estimé.** Il dépend
  de la disponibilité réelle de l'identité Windows sur les volumes des
  utilisateurs, qui n'a été mesurée sur aucune machine. C'est la principale
  incertitude de cette recommandation.
