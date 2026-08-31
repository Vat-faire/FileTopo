# État courant

- **Dernière mise à jour :** 2026-08-31
- **Branche :** rebuild/v0.2-project-brain, publiée sur origin
- **Commit de base de la branche :** 91bbe90f0f99026c28cd345784d4f579a0016db2
- **HEAD au démarrage de cette session :** 57e181f5100d69bfbb3dc2bfc749d9ebd96507d7
- **Dernière tâche vérifiée :** **TASK-0011, VERIFIED le 2026-08-31** par
  Sébastien, porte P2 franchie. TASK-0010 reste VERIFIED
- **Tâche livrée, non vérifiée :** aucune
- **Tâche IN_PROGRESS :** aucune
- **Tâche proposée, non approuvée :** **TASK-0012**, `PROPOSED`, non exécutée
- **Dernière validation :** contrôles documentaires du franchissement P2,
  consignés dans [VALIDATION.md](VALIDATION.md), section N. Les sections L et
  M conservent la livraison et la révision de TASK-0011. **Aucun test
  applicatif, aucun build, aucune mesure**
- **Code applicatif :** inchangé. 0 fichier modifié sous `src/`,
  `src-tauri/`, `tests/`, `public/`, `scripts/`, `.github/` ou `graph/`;
  aucune dépendance ajoutée, retirée ni mise à jour

## Porte P2 franchie le 2026-08-31

Sébastien a donné un **GO explicite**. `TASK-0011` passe à `VERIFIED` et les
six décisions passent à `APPROVED` :

| Fiche | Option retenue |
|---|---|
| [DEC-0007](../decisions/DEC-0007-rebuild-tech-stack.md) | **B** — conserver Tauri 2, Rust stable, React, TypeScript et SQLite; remplacer ou faire évoluer **uniquement** le rendu |
| [DEC-0008](../decisions/DEC-0008-hierarchical-rendering.md) | **A** — HTML/SVG avec virtualisation et niveaux de détail au MVP; Canvas 2D **seulement** si `B2` réfute cette option; WebGL **différé** |
| [DEC-0009](../decisions/DEC-0009-data-model-and-relations.md) | **I-E** et **R-C** — l'heuristique reste **seulement une suggestion** et ne préserve jamais automatiquement l'identité ni l'état |
| [DEC-0010](../decisions/DEC-0010-indexing-and-watching.md) | **W-B avec repli W-C** pour la réconciliation, **U-B** pour l'application différentielle |
| [DEC-0011](../decisions/DEC-0011-brain-isolation-and-migrations.md) | Stockage **S-C**; **M-C** cible **conditionnelle à `B1`**, **M-B** repli **obligatoire** si `B1` échoue |
| [DEC-0012](../decisions/DEC-0012-ai-architectural-boundary.md) | **F-D** — aucune IA, extraction, embeddings, RAG ni GraphRAG dans le noyau MVP |

**Exception humaine acceptée.** L'absence de source primaire externe dans
`DEC-0012` est acceptée explicitement par Sébastien : décision **interne de
périmètre**, fondée sur la vision approuvée. L'absence reste déclarée dans la
fiche, pas comblée.

Les sept livrables `L1` à `L7` portent l'état approuvé. **Aucun n'a été testé
physiquement** : ce sont des documents, et leur approbation porte sur leur
contenu écrit.

Trois champs `replaced_by` ont été renseignés sur des fiches `VERIFIED`, seule
modification permise et autorisée : `DEC-0003` → `DEC-0007`,
`DEC-0004` → `DEC-0009`, `DEC-0005` → `DEC-0008`. **Aucun autre contenu de
`DEC-0001` à `DEC-0006` n'a changé.**

## Ce qui existe maintenant

La baseline documentaire de reconstruction est **approuvée** :

| Livrable | Fichier | État |
|---|---|---|
| L1 — baseline des 39 fonctions | [REQUIREMENTS_BASELINE.md](../product/REQUIREMENTS_BASELINE.md) | approuvé |
| L2 — parcours utilisateur | [USER_JOURNEY.md](../product/USER_JOURNEY.md) | approuvé |
| L3 — synthèse d'architecture | [ARCHITECTURE_BASELINE.md](../architecture/ARCHITECTURE_BASELINE.md) | approuvé |
| L4 — matrice de formats | [FORMAT_MATRIX.md](../architecture/FORMAT_MATRIX.md) | approuvé |
| L5 — objectifs mesurables | [BASELINE_TARGETS.md](../performance/BASELINE_TARGETS.md) | approuvé, toutes cibles **non testées** |
| L6 — plan de tests | [TEST_STRATEGY.md](../architecture/TEST_STRATEGY.md) | approuvé, aucun test exécuté |
| L7 — six décisions | [DEC-0007](../decisions/DEC-0007-rebuild-tech-stack.md) à [DEC-0012](../decisions/DEC-0012-ai-architectural-boundary.md) | toutes `APPROVED` |

La coupe de MVP arbitrée est **31 `MVP`, 4 `ULTÉRIEUR`, 4 `DIFFÉRÉ`**, avec
11 écarts déclarés. `ULTÉRIEUR` : F-013, F-017, F-018, F-019. `DIFFÉRÉ` :
F-021, F-037, F-038, F-039.

## TASK-0012 — proposée, non exécutée

[TASK-0012](../tasks/TASK-0012-technical-risk-gates.md) est créée au statut
`PROPOSED`. Son objectif futur unique : exécuter des bancs d'essai synthétiques
permettant de lever les risques techniques **avant le premier code de
production**. Cinq bancs d'essai :

| Banc | Objet |
|---|---|
| `B0` | Santé du prototype : dépendances verrouillées, tests et builds existants, résultats réels, **aucune correction** |
| `B1` | Migration SQLite Windows : bascule `M-C`, `.wal`/`.shm`, arrêt brutal, disque insuffisant, retour arrière, comparaison `M-B` |
| `B2` | Rendu HTML/SVG : 1 000, 3 000 et 5 000 blocs visibles, profondeur 40, branche de 5 000 enfants, images/seconde et latences réelles, clavier et ARIA |
| `B3` | Identité Windows : `VolumeSerialNumber + FileId` en Rust stable, licence vérifiée, renommage, déplacement, coût à 1 000/10 000/100 000, repli déterministe |
| `B4` | Attributs infonuagiques : sources **Microsoft uniquement**, fixture synthétique, aucune lecture de contenu, aucune hydratation |

**Aucun de ces bancs d'essai n'a été exécuté.** `TASK-0012` exige un **GO P3**
avant toute exécution, se terminera `IMPLEMENTED` et jamais `VERIFIED`.

## Décision

FileTopo, son dépôt, son historique, sa licence MIT et le prototype alpha sont
conservés. La reconstruction progresse sur branche. Aucune fonction partielle
du prototype n'est réputée terminée sans inspection, tests et décision
documentée.

## Limites et risques

- **Rien n'a jamais été exécuté depuis TASK-0010.** Aucun test, build,
  installation, essai manuel Windows ni mesure de performance. L'approbation du
  2026-08-31 est **documentaire** : elle fixe une direction, elle ne prouve
  rien.
- Les tests existants du prototype (36 cas Vitest, 13 tests Rust déclarés)
  **n'ont pas été rejoués**. Leur état de réussite est **inconnu** — c'est
  précisément l'objet de `B0`.
- `M-C` est approuvée comme **cible** et **ne peut pas être implémentée** tant
  que `B1` n'a pas été exécuté et publié. `M-B` reste le repli obligatoire.
- Le plafond de 3 000 blocs DOM/SVG de `DEC-0008` reste une **hypothèse à
  réfuter**; ce **n'est pas une capacité déclarée** du produit.
- L'identité Windows n'est pas atteignable en Rust stable par la bibliothèque
  standard; une dépendance sera probablement nécessaire, **aucune n'est
  choisie**, et son inventaire de licence appartient à `B3`.
- L'ambiguïté des attributs infonuagiques reste **non résolue**; `B4` doit la
  lever sur sources Microsoft uniquement.
- `DEC-0012` ne cite aucune source primaire externe : exception acceptée,
  déclarée, non comblée.
- Les spécifications WebGL du registre Khronos ont renvoyé HTTP 403 et
  **n'ont pas pu être consultées**.
- Le journal USN n'a **pas** été instruit sur source primaire; lacune déclarée
  de `DEC-0010`.
- Le dossier `graph/` n'a été ni lu comme source ni modifié. Ses fichiers
  restent contradictoires et non fiables comme état courant.
- `docs/tasks/TASK-0008-*.md` demeure `IMPLEMENTED` et se décrit encore comme
  « non commitée » : incohérence historique connue, hors périmètre.

## Porte humaine

La porte **P2 est franchie**. La porte **P3 est ouverte et non franchie** :
Sébastien doit examiner et approuver ou corriger `TASK-0012` avant que le
moindre banc d'essai soit exécuté.

**Aucune ligne de code de production ne peut être écrite avant que les bancs
d'essai aient rendu leurs verdicts et qu'une tâche d'implémentation ait été
approuvée séparément.**
