# FORMAT_MATRIX — Matrice des formats et des couches d'extraction

- **Date :** 2026-08-31
- **Tâche :** `TASK-0011`, livrable `L4`
- **Portée couverte :** point 13 de `TASK-0011` §7.1
- **Statut :** livrable `L4`, **APPROUVÉ** — approuvé par Sébastien le 2026-08-31 (porte P2 franchie). Livrable documentaire; **rien n'a été exécuté ni mesuré : non testé physiquement**
- **Nature :** **aucun extracteur n'existe, aucun n'a été exécuté. Non testé.**

Cette matrice fixe **où s'arrête le MVP** en matière de lecture de fichiers.
Elle traduit une règle simple, issue de
[PROJECT_VISION.md](../../PROJECT_VISION.md) et de
[DATA_PIPELINE_VISION.md](DATA_PIPELINE_VISION.md) :

> **Au MVP, FileTopo lit des métadonnées. Il n'ouvre aucun contenu de
> document.**

---

## 1. Couches

| Couche | Contenu | Classification | Fonction associée |
|---|---|---|---|
| **L-META** | Nom, extension, taille, dates, attributs, type, état local/infonuagique, diagnostics | `MVP` | F-003, F-023 |
| **L-TEXT** | Extraction de texte de formats approuvés | `DIFFÉRÉ` | F-037 |
| **L-MAIL** | Courriels et pièces jointes | `DIFFÉRÉ` | F-037 |
| **L-OCR** | Reconnaissance de caractères sur images et PDF image | `DIFFÉRÉ`, **désactivé par défaut** | F-037 |
| **L-ENRICH** | Catégories, entités, similarités, relations suggérées | `DIFFÉRÉ` | F-017, F-021 |

**Fait.** La couche L-META est la seule couche du MVP. Les couches L-TEXT à
L-ENRICH sont conditionnées à un GO humain séparé et à une analyse de menace
renouvelée ([threat-model.md](../security/threat-model.md), §« Hors portée du
MVP »).

## 2. Contrainte transversale : les espaces réservés infonuagiques

**Fait, source officielle consultée le 2026-08-31.** Microsoft recommande que
rien n'émette de lecture ou d'écriture sur un fichier portant
`FILE_ATTRIBUTE_RECALL_ON_DATA_ACCESS`, une telle lecture causant « unnecessary
hydration when no user application has requested the file data »
([Handling placeholders](https://learn.microsoft.com/en-us/windows-hardware/drivers/ifs/placeholders_guidance)).

**Fait.** `FILE_ATTRIBUTE_RECALL_ON_OPEN` « only appears in directory
enumeration classes », et `FILE_ATTRIBUTE_OFFLINE` indique une donnée déplacée
en stockage hors ligne
([File Attribute Constants](https://learn.microsoft.com/en-us/windows/win32/fileio/file-attribute-constants)).

**Règle applicable à toutes les couches, sans exception :**

1. Un fichier marqué en ligne seulement n'est **jamais** ouvert pour extraire
   son contenu, y compris quand la couche correspondante est activée.
2. Il apparaît dans la carte et la recherche par ses **métadonnées seules**,
   avec un marquage visuel **et** textuel.
3. L'hydratation ne peut résulter que d'une action utilisateur explicite,
   précédée d'un avertissement (F-025).
4. La détection de l'état « en ligne seulement » se fait à l'**énumération de
   répertoire**, seule voie où `FILE_ATTRIBUTE_RECALL_ON_OPEN` est documenté
   comme visible.

## 3. Matrice par format

Colonne « Provenance conservée » : ce que le produit doit enregistrer pour
qu'un résultat soit explicable et révocable.

### 3.1 Couche L-META — `MVP`

| Portée | Couche | Provenance conservée | Traitement des erreurs |
|---|---|---|---|
| **Tous les fichiers, quelle que soit l'extension** | L-META | Chemin relatif autoritatif, horodatage de lecture, version de l'indexeur | Permission refusée, chemin disparu, chemin dépassant `MAX_PATH`, verrouillage : diagnostic nommé et compté, parcours poursuivi |
| **Tous les dossiers** | L-META | idem, plus le compte d'enfants directs au moment de la lecture | idem |
| **Points de réanalyse, jonctions, liens symboliques** | L-META | Type de nœud `ignoré`, cause de l'exclusion | Non suivis par défaut; comptés et affichés, jamais silencieux |
| **Espaces réservés infonuagiques** | L-META | Attributs bruts observés, horodatage | Aucune ouverture; l'absence de contenu n'est pas une erreur |

**Aucune extension n'est traitée différemment au MVP.** C'est ce qui rend la
carte générique : le produit ne sait rien du sens des fichiers, seulement de
leur structure.

### 3.2 Couche L-TEXT — `DIFFÉRÉ`

| Format | Couche | Provenance à conserver | Traitement des erreurs |
|---|---|---|---|
| `.txt` | L-TEXT | Encodage détecté, version de l'extracteur, horodatage | Encodage indécidable : texte marqué « incertain », jamais rejeté silencieusement |
| `.md` | L-TEXT | idem | idem |
| `.csv` | L-TEXT | Séparateur détecté, version de l'extracteur | Ligne malformée : conservée telle quelle, comptée |
| `.pdf` (couche texte présente) | L-TEXT | Producteur du PDF, présence ou absence de couche texte, version de l'extracteur | PDF chiffré ou corrompu : diagnostic; **aucune tentative de contournement** |
| `.docx`, `.xlsx`, `.pptx` | L-TEXT | Version de l'extracteur, parties du paquet lues | Paquet invalide : diagnostic; aucune écriture dans le fichier |
| `.rtf`, `.odt` | L-TEXT | idem | idem |

**Règle commune.** Chaque extraction enregistre le **format**, la **version de
l'extracteur** et l'**erreur éventuelle**. Un changement de version
d'extracteur invalide les résultats dérivés de ce format, sans toucher
l'index structurel.

### 3.3 Couche L-MAIL — `DIFFÉRÉ`

| Format | Couche | Provenance à conserver | Traitement des erreurs |
|---|---|---|---|
| `.eml` | L-MAIL | En-têtes conservés, version de l'extracteur | En-tête illisible : message conservé, en-tête marqué invalide |
| `.msg` | L-MAIL | idem | idem |
| Pièces jointes | L-MAIL → L-TEXT | Lien vers le message porteur, chemin d'imbrication | Imbrication bornée en profondeur; dépassement = diagnostic |
| `.pst`, `.ost` (conteneurs) | L-MAIL | Décision séparée requise | **Hors périmètre tant qu'aucune décision ne l'autorise** : ce sont des fichiers verrouillés par des applications tierces et une lecture concurrente est risquée |

### 3.4 Couche L-OCR — `DIFFÉRÉ`, désactivée par défaut

| Format | Couche | Provenance à conserver | Traitement des erreurs |
|---|---|---|---|
| `.png`, `.jpg`, `.tiff` | L-OCR | Moteur, version, langue, score de confiance | Échec : aucun texte produit; jamais de texte inventé |
| `.pdf` sans couche texte | L-OCR | idem, plus la page traitée | idem |

**Trois conditions cumulatives** avant toute exécution d'OCR :

1. la couche L-OCR est explicitement activée par l'utilisateur;
2. un consentement distinct est donné, expliquant le coût en temps et en
   énergie;
3. le fichier n'est pas un espace réservé infonuagique (§2).

**Fait.** C'est la règle de `DATA_PIPELINE_VISION.md` : « L'OCR est facultatif,
coûteux, désactivé par défaut et soumis à consentement. » Cette matrice ne la
modifie pas, elle la rend opérationnelle format par format.

### 3.5 Couche L-ENRICH — `DIFFÉRÉ`

Aucune ligne de format. L'enrichissement ne consomme pas de fichiers
directement : il consomme les sorties de L-TEXT et L-MAIL. Toute relation
qu'il produit est une **suggestion** au sens de
[ARCHITECTURE_BASELINE.md](ARCHITECTURE_BASELINE.md) §7 : distincte,
révocable, jamais promue sans action utilisateur.

## 4. Règles de recherche par couche

| Couche active | Ce que la recherche couvre | Fonction |
|---|---|---|
| L-META seule (**MVP**) | Noms et chemins | F-020 |
| L-META + L-TEXT | Ajoute le texte extrait, avec citation du fichier et de l'emplacement | F-021 (`DIFFÉRÉ`) |
| L-META + L-TEXT + L-OCR | Ajoute le texte reconnu, avec son score de confiance affiché | F-021 (`DIFFÉRÉ`) |

**Contrainte technique, source officielle.** Une table FTS5 « contentless »
(`content=''`) ne supporte ni `UPDATE` ni `DELETE`, et la lecture d'une
colonne autre que `rowid` renvoie `NULL`; la variante `contentless_delete=1`
(SQLite 3.43.0 et plus) lève cette limite.
[SQLite FTS5](https://www.sqlite.org/fts5.html), consultée le 2026-08-31.

**Conséquence.** Le choix entre table externe et table sans contenu n'est pas
neutre pour F-031 (mise à jour incrémentale) : une table sans contenu classique
obligerait à reconstruire l'index de recherche à chaque changement. Cette
contrainte est reportée à
[DEC-0009](../decisions/DEC-0009-data-model-and-relations.md).

## 5. Ce que cette matrice interdit

1. Ouvrir le contenu d'un fichier au MVP, quel que soit son format.
2. Extraire quoi que ce soit d'un espace réservé infonuagique.
3. Activer l'OCR par défaut.
4. Produire un texte extrait sans provenance ni version d'extracteur.
5. Faire échouer un cerveau entier à cause d'un fichier illisible.
6. Écrire, renommer, déplacer ou réparer un fichier source, y compris un
   fichier corrompu.

## 6. Sources officielles citées

| Source | URL | Consultée le | Sert à |
|---|---|---|---|
| Microsoft — File Attribute Constants | https://learn.microsoft.com/en-us/windows/win32/fileio/file-attribute-constants | 2026-08-31 | §2 |
| Microsoft — Handling placeholders | https://learn.microsoft.com/en-us/windows-hardware/drivers/ifs/placeholders_guidance | 2026-08-31 | §2 |
| SQLite — FTS5 | https://www.sqlite.org/fts5.html | 2026-08-31 | §4 |

## 7. Limites

- **Non testé.** Aucun extracteur n'existe dans le dépôt; aucun format n'a été
  lu. Le prototype ne contient aucun extracteur (constat de
  [BASELINE_ASSESSMENT.md](../archive/v0.1-alpha/BASELINE_ASSESSMENT.md)).
- Les listes de formats sont **indicatives** et non exhaustives; chaque ajout
  ultérieur exige une décision écrite, pas une extension silencieuse.
- Les bibliothèques d'extraction ne sont **pas choisies** : ni nom, ni version,
  ni licence. Ce choix appartient à une tâche ultérieure, après GO.
- Aucune volumétrie ni performance d'extraction n'est estimée ici.
