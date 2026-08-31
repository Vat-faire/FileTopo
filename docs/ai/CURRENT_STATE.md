# État courant

- **Dernière mise à jour :** 2026-08-31
- **Branche :** rebuild/v0.2-project-brain, publiée sur origin
- **Commit de base de la branche :** 91bbe90f0f99026c28cd345784d4f579a0016db2
- **Dernière tâche vérifiée :** TASK-0010, VERIFIED le 2026-08-31
- **Tâche livrée, non vérifiée :** TASK-0011, IMPLEMENTED le 2026-08-31
- **Tâche IN_PROGRESS :** aucune
- **Dernière validation :** contrôles documentaires de TASK-0011 exécutés et
  consignés dans [VALIDATION.md](VALIDATION.md), section L; aucun test
  applicatif, aucun build, aucune mesure
- **Code applicatif :** inchangé. 0 fichier modifié sous `src/`,
  `src-tauri/`, `tests/`, `public/`, `scripts/`, `.github/` ou `graph/`;
  aucune dépendance ajoutée, retirée ni mise à jour

## Ce qui existe maintenant

TASK-0011 a produit la baseline documentaire de reconstruction, sous le GO de
Sébastien du 2026-08-31 :

| Livrable | Fichier |
|---|---|
| L1 — baseline des 39 fonctions | [REQUIREMENTS_BASELINE.md](../product/REQUIREMENTS_BASELINE.md) |
| L2 — parcours utilisateur | [USER_JOURNEY.md](../product/USER_JOURNEY.md) |
| L3 — synthèse d'architecture | [ARCHITECTURE_BASELINE.md](../architecture/ARCHITECTURE_BASELINE.md) |
| L4 — matrice de formats | [FORMAT_MATRIX.md](../architecture/FORMAT_MATRIX.md) |
| L5 — objectifs mesurables | [BASELINE_TARGETS.md](../performance/BASELINE_TARGETS.md) |
| L6 — plan de tests | [TEST_STRATEGY.md](../architecture/TEST_STRATEGY.md) |
| L7 — six décisions, toutes `PROPOSED` | [DEC-0007](../decisions/DEC-0007-rebuild-tech-stack.md) à [DEC-0012](../decisions/DEC-0012-ai-architectural-boundary.md) |

La coupe de MVP arbitrée est **29 `MVP`, 6 `ULTÉRIEUR`, 4 `DIFFÉRÉ`**, avec 9
écarts déclarés et justifiés par rapport à la colonne « Priorité » de la
matrice fonctionnelle.

## Décision

FileTopo, son dépôt, son historique, sa licence MIT et le prototype alpha sont
conservés. La reconstruction progresse sur branche. Aucune fonction partielle
du prototype n'est réputée terminée sans inspection, tests et décision
documentée.

## Constats établis pendant TASK-0011

Deux constats méritent l'attention de Sébastien, parce qu'ils touchent des
fiches déjà `VERIFIED` :

1. **`DEC-0003` (Rust stable) et `DEC-0004` (clé stable = identité de volume +
   identifiant de fichier Windows) sont en tension.** La documentation
   officielle de Rust indique que `volume_serial_number()`, `file_index()`,
   `number_of_links()` et `change_time()` sont `nightly-only`. Sur le canal
   stable, la clé préférée de `DEC-0004` n'est pas accessible par la
   bibliothèque standard. Voir [DEC-0009](../decisions/DEC-0009-data-model-and-relations.md).
2. **PixiJS 8 n'offre aucun repli Canvas 2D** — le renderer Canvas est listé
   « Coming-soon » par l'éditeur. Une machine sans WebGL utilisable n'aurait
   donc aucune carte. Voir [DEC-0008](../decisions/DEC-0008-hierarchical-rendering.md).

Aucune de ces fiches vérifiées n'a été modifiée. Les révisions sont
**proposées**, pas appliquées.

## Limites et risques

- **Rien n'a été exécuté.** Aucun test, build, installation, essai manuel
  Windows ni mesure de performance. Toute cible de
  [BASELINE_TARGETS.md](../performance/BASELINE_TARGETS.md) porte la mention
  « non testé ».
- Les tests existants du prototype (36 cas Vitest, 13 tests Rust déclarés)
  **n'ont pas été rejoués** depuis TASK-0010.
- `DEC-0012` ne cite **aucune source primaire externe** : c'est une décision
  de périmètre de produit. Elle est déclarée **incertaine** et son risque est
  écrit dans la fiche.
- Les spécifications WebGL du registre Khronos ont renvoyé une erreur HTTP 403
  et **n'ont pas pu être consultées**; `DEC-0008` s'appuie donc sur la
  spécification HTML du WHATWG et la documentation PixiJS.
- Le journal USN n'a **pas** été instruit sur source primaire; c'est une
  lacune déclarée de `DEC-0010`.
- Le dossier `graph/` n'a été ni lu comme source ni modifié. Ses fichiers
  restent contradictoires et non fiables comme état courant.
- `docs/tasks/TASK-0008-*.md` demeure `IMPLEMENTED` et se décrit encore comme
  « non commitée » : incohérence historique connue, hors du périmètre de
  TASK-0011.

## Porte humaine

TASK-0011 est `IMPLEMENTED`, **jamais `VERIFIED` par son exécuteur**. Les six
décisions `DEC-0007` à `DEC-0012` sont toutes `PROPOSED` et n'autorisent rien.

La porte **P2** est ouverte et non franchie : Sébastien doit examiner la
baseline et les six décisions. **Aucune ligne de code ne peut être écrite
avant P2 puis P3.**
