# ACTION-0038 — Re-contrôle indépendant ciblé X9 : CHANGES_REQUIRED

- **Date :** 2026-09-04
- **Objet :** enregistrement du re-contrôle indépendant ciblé `X9` de
  `TASK-0023`, sans réouverture des éléments déjà acceptés
- **Contrôleur :** **orchestrateur technique indépendant**, instance distincte
  de l'exécuteur de `TASK-0023`
- **Rédacteur :** Codex. **Ce document ENREGISTRE le verdict rendu par
  l'orchestrateur; Codex ne rend pas ce verdict, ne ferme pas `X10` et ne
  s'attribue pas `VERIFIED`.**
- **HEAD contrôlé :**
  `d017c7814ac13c3c7249259a3b354812fd934d8d`
- **Commit substantif de correction `X9` :**
  `ca90b2aa162dae7f97d2c87f3a177b55c097941d`
- **`main` :** `91bbe90f0f99026c28cd345784d4f579a0016db2`, intacte

## 1. Verdict externe enregistré

| Élément | Verdict |
|---|---|
| Réserve `X9` | **`CLOSED`** |
| `ACTION-0038` | **`CHANGES_REQUIRED`** |
| `TASK-0023` | **`IMPLEMENTED`** |
| Réserve `X10` | **`OPEN`** |

## 2. Motifs de clôture de X9

- `sha256-tree-v1` est réellement utilisé par la campagne;
- la lecture des contenus est faite en streaming par blocs de 64 KiB;
- les liens et reparse points statiques ne sont pas suivis;
- une vraie jonction Windows a été testée;
- les deux preuves `EC15` ont été régénérées;
- `X5` et `main` sont intacts.

Aucun autre élément déjà accepté de `TASK-0023` n'est rouvert.

## 3. Réserve unique — X10

Il subsiste une race TOCTOU entre la validation d'un pathname et son
ouverture ou son parcours effectif.

Dans le fingerprint d'arbre, `visit_source_tree` observe une entrée par
`symlink_metadata`, la classe par `tree_marker`, puis ouvre plus tard le même
pathname par `File::open` ou `read_dir`. Dans l'observation de fichier,
`observe_file` exécute `symlink_metadata`, `canonicalize` et le contrôle de
containment, puis ouvre plus tard `candidate` par `File::open`.

Un remplacement concurrent peut donc faire porter la validation et
l'ouverture sur deux objets différents. Une nouvelle vérification par
pathname, même placée immédiatement avant ou après l'ouverture, ne serait pas
une garantie structurelle.

## 4. Exigence de correction

La décision d'autoriser une lecture ou un parcours doit porter sur l'objet
réellement ouvert. Les composants intermédiaires de `root/a/b/file` font partie
de la garantie : le remplacement d'un fichier par un lien/reparse point ou
d'un répertoire par une jonction/reparse point ne doit jamais permettre de
lire ni de parcourir une cible hors racine.

## 5. État et action suivante

`X9` est `CLOSED`; `ACTION-0038` reste `CHANGES_REQUIRED`, `TASK-0023` reste
`IMPLEMENTED` et `X10` reste `OPEN`. L'action suivante est la correction
ciblée `X10`, suivie d'un re-contrôle indépendant distinct.
