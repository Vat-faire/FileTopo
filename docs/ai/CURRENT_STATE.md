# État courant

- **Dernière mise à jour :** 2026-08-31
- **Branche :** rebuild/v0.2-project-brain, publiée sur origin
- **Commit de base de la branche :** 91bbe90f0f99026c28cd345784d4f579a0016db2
- **Dernière tâche vérifiée :** TASK-0010, VERIFIED le 2026-08-31
- **Tâche livrée, non vérifiée :** TASK-0011, IMPLEMENTED le 2026-08-31,
  **révisée le 2026-08-31** après quatre corrections motivées de
  l'orchestrateur; toujours pas VERIFIED
- **Tâche IN_PROGRESS :** aucune
- **Dernière validation :** contrôles documentaires de la révision de
  TASK-0011 exécutés et consignés dans [VALIDATION.md](VALIDATION.md),
  section M; les contrôles de la livraison initiale restent en section L.
  Aucun test applicatif, aucun build, aucune mesure
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

La coupe de MVP arbitrée, **après la révision du 2026-08-31**, est
**31 `MVP`, 4 `ULTÉRIEUR`, 4 `DIFFÉRÉ`**, avec 11 écarts déclarés et justifiés
par rapport à la colonne « Priorité » de la matrice fonctionnelle.
`ULTÉRIEUR` : F-013, F-017, F-018, F-019. `DIFFÉRÉ` : F-021, F-037, F-038,
F-039.

## Corrections appliquées le 2026-08-31 (révision de TASK-0011)

La baseline générale est **acceptée**. La porte **P2 n'est pas franchie**.
Quatre corrections motivées ont été appliquées; le détail est en section 17 de
la [fiche TASK-0011](../tasks/TASK-0011-functional-architecture-baseline.md).

1. **Périmètre MVP.** `F-024` (copier le chemin) et `F-033` (personnalisation
   du cerveau) passent à `MVP`. La portée `MVP` de `F-033` couvre nom, couleur
   et icône modifiables, persistance indépendante par cerveau, et valeurs par
   défaut utilisables sans configuration obligatoire.
2. **Rendu hiérarchique (`DEC-0008`).** HTML/SVG avec virtualisation et
   niveaux de détail au MVP; Canvas 2D **seulement** si un banc d'essai
   synthétique démontre que HTML/SVG ne tient pas; WebGL **différé** jusqu'à
   un besoin mesuré. Un plafond initial de blocs DOM/SVG simultanément
   visibles est proposé, marqué **« non testé »** — ce n'est **pas** une
   capacité déclarée.
3. **Identité des fichiers (`DEC-0009`).** Le repli automatique sur
   l'heuristique est remplacé par une stratégie sûre : identité Windows quand
   elle est disponible, repli déterministe par chemin relatif versionné sinon,
   heuristique **uniquement** comme suggestion visible et révocable. Aucune
   heuristique ne préserve automatiquement l'identité, le vu/non-vu ou le
   journal. Un déplacement inter-volume non prouvable reste création +
   suppression.
4. **Migration (`DEC-0011`).** `S-C` conservée. `M-C` reste une **direction
   proposée**, approuvable pour implémentation **seulement après** un banc
   d'essai synthétique Windows (bascule sûre, `.wal`/`.shm`, arrêt brutal,
   disque insuffisant, retour à l'ancienne base). `M-B` demeure le repli.

Points acceptés sans correction : `DEC-0007`, `DEC-0010`, `DEC-0012`;
l'absence de source externe dans `DEC-0012`; le journal USN comme piste
différée; la lacune WebGL, non bloquante. L'ambiguïté des attributs
infonuagiques reste à résoudre **avant leur implémentation**.

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
   Depuis la révision du 2026-08-31, ce constat n'est plus décisif pour le
   MVP : `DEC-0008` recommande HTML/SVG et **diffère** WebGL.

Aucune de ces fiches vérifiées n'a été modifiée. Les révisions sont
**proposées**, pas appliquées.

## Limites et risques

- **Rien n'a été exécuté.** Aucun test, build, installation, essai manuel
  Windows ni mesure de performance. Les deux bancs d'essai introduits par la
  révision — `B1`, bascule de migration; `B2`, plafond DOM/SVG — **n'ont pas
  été exécutés**. Toute cible de
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
baseline **corrigée** et les six décisions, puis décider. **Aucune ligne de
code ne peut être écrite avant P2 puis P3.**
