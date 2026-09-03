TASK_ID: TASK-0021 — réalignement produit post-TASK-0020
AGENT: CLAUDE
RESULT: DONE
BRANCH: build/v0.2-a5-interbrain-relations
BASE_HEAD: c1c747a2bbcbc45bb2920378e4967fe81004a2c8
FINAL_HEAD: <renseigné au commit>
TASK_STATE: TASK-0021 = IMPLEMENTED (en attente de contrôle indépendant)

SESSION: début de session normal. Git vérifié AVANT toute lecture : racine
`C:/Users/Vatfaire/Documents/TopographicDocumentMap`, branche
`build/v0.2-a5-interbrain-relations`, `HEAD` `c1c747a2` = `origin` `c1c747a2`
(0/0), arbre PROPRE, `main` `91bbe90f`, `TASK-0020` `VERIFIED`, `ACTION-0032`
`CLOSED`, aucune tâche `IN_PROGRESS`. AUCUN écart avec l'état attendu par le
prompt.

SUMMARY:
- LES GARDES X5 ONT ÉTÉ ÉTENDUES D'ABORD, AVANT TOUT TRAVAIL DOCUMENTAIRE.
  Les cinq preuves `TASK-0020` — `M12` `pass{1,2}`, `J12` intra, `L12`
  composée `pass{1,2}` — sont protégées dans les TROIS gardes : porte Rust
  `write_run_artifact`, `src/map/runArtifacts.ts`,
  `scripts/protected-run-artifacts.ps1`. Liste 14 → 19 noms. TESTÉ :
  `vitest` 14/14, `cargo test map::commands::tests` 14/14, module PowerShell
  refusant effectivement les cinq et laissant passer les `-abandon`.

- CONSÉQUENCE ASSUMÉE, ÉCRITE PLUTÔT QUE DÉCOUVERTE. C'est la première
  extension d'`X5` dont les noms sont ENCORE des destinations du runtime
  livré : les boutons `M12`, `J12` et `L12` n'écrivent plus, la porte refuse,
  et les scripts de campagne refusent de supprimer une copie périmée. C'est le
  résultat voulu. Le constant `SEALED_RUNTIME_DESTINATIONS` nomme les cinq et
  un test asserte que l'intersection vaut EXACTEMENT ces cinq.

- CINQ DÉCISIONS PRODUIT ENREGISTRÉES, PAS PRISES PAR L'EXÉCUTEUR.
  `DEC-0019` FileTopo n'est PAS un produit juridique — cible générique, aucune
  catégorie métier codée en dur, packs ultérieurs possibles.
  `DEC-0020` la représentation principale finale est un GRAPHE TOPOGRAPHIQUE
  HIÉRARCHIQUE À NŒUDS/CARTES ET CONNEXIONS EXPLICITES; le treemap reste
  primitive de calcul, représentation technique et vue secondaire éventuelle,
  et n'impose plus l'UX; aucun algorithme imposé; aucune copie pixel.
  `DEC-0021` moteur déterministe explicable, très utile SANS LLM : trois
  niveaux, architecture de signaux, « hash identique » = contenu binaire
  identique et JAMAIS « même fichier physique », score ≠ vérité, workflow
  `PENDING`/`APPROVED`/`REJECTED` avec file de révision et mémoire des rejets.
  `DEC-0022` IA facultative `BYOK`, provider-agnostic; un LLM suggère et
  n'établit jamais; AUCUNE troisième provenance « AI ».
  `DEC-0023` un seul modèle mono/multi-utilisateur; la source reste
  autoritaire; « ne peut pas ouvrir le fichier » n'est PAS suffisant —
  permission-aware AVANT rendu, recherche et relations.

- P-02 EST CORRIGÉE, PAS RÉÉCRITE EN SILENCE. Correction normative `X2`, en
  tête du contrat, sur le modèle de `X1`. L'ancienne formulation est CONSERVÉE
  ET VISIBLE sous la nouvelle, avec ce qui a été retiré et ce qui a été
  ajouté. Le contrat reste à 22 exigences; `P-01` et `P-03` à `P-22` sont
  inchangées. `P-02` ne descend pas — elle est plus forte — et n'est PAS
  satisfaite.

- MATRICE 41 → 49, RECOMPTÉE. `F-042` à `F-049` ajoutées; `MVP` 41,
  `ULTÉRIEUR` 3, `DIFFÉRÉ` 5; `F-001` à `F-049` SANS TROU NI DOUBLON, vérifié
  mécaniquement sur les deux documents. AUCUNE classification existante
  changée, aucune descendue, aucune disparue. `F-007` et `F-008` changent de
  COMPORTEMENT CIBLE sous `DEC-0020`, déclaré, classification inchangée. Un
  écart d'une nature nouvelle est déclaré séparément : `F-049`, `P0` classée
  `ULTÉRIEUR` — aucun abaissement, la fonction est nouvelle.

- SÉQUENCE DE SEPT TRANCHES PROPOSÉE, NON EXÉCUTÉE. Layout à nœuds → moteur de
  signaux → workflow de validation → doublons à l'échelle →
  recherche/filtres/watchers → fondation permissions/identités → couche IA
  `BYOK`. Ordre justifié par dépendances. AUCUNE `TASK` d'implémentation créée.

FILES:
- docs/tasks/TASK-0021-product-realignment.md (nouveau)
- docs/decisions/DEC-0019..DEC-0023 (cinq nouveaux)
- docs/decisions/README.md
- docs/product/CARTETOPO_FUNCTIONAL_PARITY.md (correction X2), FEATURE_MATRIX.md,
  REQUIREMENTS_BASELINE.md
- PROJECT_VISION.md, ROADMAP.md
- src-tauri/src/map/commands.rs, src/map/runArtifacts.ts,
  src/map/runArtifacts.test.ts, scripts/protected-run-artifacts.ps1
- docs/ai/CURRENT_STATE.md, NEXT_ACTION.md, HANDOFF.md, VALIDATION.md,
  CHANGELOG_AI.md
- .orchestrator/RESULT.md

VALIDATIONS:
- `npx vitest run src/map/runArtifacts.test.ts` → 14 passés / 14.
- `CARGO_INCREMENTAL=0 cargo test --lib map::commands::tests` → 14 passés / 14.
- Module PowerShell `protected-run-artifacts.ps1` → 19 noms; cinq preuves
  refusées; variantes `-abandon` acceptées.
- `git status --porcelain docs/performance/runs/` → VIDE, aucune preuve
  touchée.
- Contrôle mécanique de la matrice : 49 identifiants, 49 uniques, `F-001` à
  `F-049`, aucun manquant, aucun dupliqué, sur FEATURE_MATRIX et
  REQUIREMENTS_BASELINE. Contrat de parité : 22 exigences.

NON TESTÉ / LIMITES:
- AUCUNE campagne WebView2 rejouée — ni `M12`, ni `J12`, ni `L12`, ni `H9`.
  `R8` ENTIÈRE, aucun seuil, aucune mesure.
- La suite COMPLÈTE `vitest` et `cargo test` n'a PAS été exécutée : seuls les
  deux fichiers de garde `X5` l'ont été. Rien d'autre n'a été touché dans le
  code, mais ce n'est pas la même chose que l'avoir vérifié.
- AUCUNE cible de `DEC-0019` à `DEC-0023` n'est prouvée : aucun layout, aucun
  moteur de règles, aucune suggestion, aucune IA, aucune identité, aucune
  permission n'existe. Ce sont des cibles à falsifier.
- `B0` s'est reproduit une SIXIÈME fois, au premier `cargo test`, en
  compilation incrémentale. `CARGO_INCREMENTAL=0` contourne — `DEC-0013` E.
  RIEN n'a été supprimé ni renommé dans `src-tauri/target/`.
- `I-E` complète hors périmètre; `cek1` reste le repli déclaré. `P-19`,
  `P-21` demeurent; `P-04` reste PARTIELLE; `P-02` n'est pas satisfaite.
- `TASK-0021` n'est PAS `VERIFIED` : l'exécuteur ne s'attribue rien.

GIT: commits sur `build/v0.2-a5-interbrain-relations`, push vers
`origin/build/v0.2-a5-interbrain-relations` — branche de travail DÉJÀ publiée,
avance rapide seule. AUCUNE fusion vers `main`, aucune PR, aucune release,
aucune étiquette, aucun `force push`, aucune réécriture d'historique, aucun
nettoyage, aucune suppression.

NEXT: contrôle indépendant de `TASK-0021`. La première tranche recommandée —
LAYOUT TOPOGRAPHIQUE À NŒUDS/CARTES/LIENS satisfaisant `P-02` corrigée — reste
`PROPOSED` et n'est pas créée tant que l'orchestrateur n'a pas contrôlé le
réalignement.
