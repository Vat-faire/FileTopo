# TASK-0022 — Topographie hiérarchique à nœuds/cartes et connexions explicites

- **Date :** 2026-09-03
- **Branche :** `build/v0.2-a6-topographic-node-graph`
- **Base contrôlée :** `c16396d41d24866bd9ea9b229c5815c9518ed552`
- **Statut courant :** `VERIFIED` — verdict indépendant enregistré par
  [`ACTION-0036`](../reviews/ACTION-0036-independent-recontrol.md)
- **Agent d'exécution :** Codex
- **GO :** prompt technique explicite `TASK-0022` du 2026-09-03
- **Décisions :** [`DEC-0020`](../decisions/DEC-0020-topographic-node-graph.md),
  [`DEC-0024`](../decisions/DEC-0024-deterministic-layered-node-card-layout.md)
- **Contrat :** `P-02` corrigée par `P02-R1`, sans régression de `P-03` à
  `P-07`, `P-11`, `P-12` ni des extensions `F-040`/`F-041`

## 1. Objectif unique

Remplacer réellement la représentation principale imbriquée de FileTopo par
une topographie hiérarchique déterministe à cartes indépendantes reliées par
des connexions parent/enfant explicites, dans le vrai Tauri/WebView2, sans
perdre une capacité `VERIFIED` de `TASK-0016` à `TASK-0020`.

Ce livrable est du code produit durable, pas une maquette visuelle.

## 2. Préconditions contrôlées

Avant cette fiche : racine Git correcte; branche
`build/v0.2-a5-interbrain-relations`; HEAD `c16396d41d24866bd9ea9b229c5815c9518ed552`;
upstream aligné; arbre propre; `TASK-0021 = VERIFIED`; `ACTION-0034 = CLOSED`;
`X1` à `X7 = CLOSED`; aucune tâche `IN_PROGRESS`; aucune tâche `IMPLEMENTED`
en attente; `main = 91bbe90f0f99026c28cd345784d4f579a0016db2`.

Aucune interruption antérieure de `TASK-0022` n'a été détectée : fiche absente,
dernier `RESULT = DONE`, arbre propre et HEAD exactement attendu.

## 3. Périmètre produit

Dans le périmètre :

- schéma de carte 3 et rebuild sûr d'un index v2;
- layout `layered-tree-cards-v1` exactement défini par `DEC-0024`;
- une carte indépendante par nœud;
- une arête hiérarchique exacte par nœud non racine;
- quatre familles graphiques distinctes en monochrome;
- ancrage bord à bord des relations intra, suggestions et relations inter;
- labels, sélection et accentuation `P-06`;
- navigation clavier gauche/droite et frères haut/bas;
- rendre visible toute destination sélectionnée hors viewport sans relayout;
- pan, zoom, ajuster et reset comme transformations de vue seulement;
- un à trois cerveaux dans le même SVG, par translation de territoires;
- intégrité complète des stores et comportements de `TASK-0017` à `TASK-0020`;
- tests synthétiques et scénarios réels WebView2 nommés `TASK-0022-*`.

## 4. Géométrie et complexité gelées

Nom exact : `layered-tree-cards-v1`.

```text
CARD_WIDTH  = 240.0
CARD_HEIGHT = 64.0
COLUMN_GAP  = 120.0
ROW_GAP     = 28.0
x(node)     = depth(node) * (CARD_WIDTH + COLUMN_GAP)
```

L'algorithme bottom-up/top-down, le calcul de `subtree_span`, le centrage du
parent, les dimensions du monde et les défenses numériques sont exactement
ceux de `DEC-0024`; ils font partie du gel de cette tâche.

L'ordre vertical est l'ordre du scan/index. Aucun `node_id`, chemin, nom,
seed, ordre, poids ou fixture historique n'est modifié. Le calcul emploie un
nombre borné de parcours O(n), sans comparaison globale de paires, solveur de
collision, simulation physique ou recalcul d'interaction.

`layout_invocations = 1` par build/rebuild. La composition applique seulement
les translations de territoires.

## 5. Schéma et rebuild gelés

`MAP_SCHEMA_VERSION = 3`. `layout_algorithm = layered-tree-cards-v1` est
persisté et relu. `MapSnapshot.layoutAlgorithm` et
`MapBuildReport.layoutAlgorithm` exposent la valeur backend réelle.

Un index v2 représentatif de l'ancien treemap n'est jamais servi comme v3. Il
est déclaré incompatible/reconstructible et rebâti depuis la source synthétique
en lecture seule. Le rebuild ne supprime que l'index carte reconstructible et
ses compagnons SQLite sous `brains/<brain>/map/`; il ne touche jamais au
catalogue, à l'identité, aux stores intra/inter-cerveaux, aux relations
`APPROVED`, suggestions, préférences ou autre état non reconstructible.

`NON_RECONSTRUCTIBLE_KEYS` reste exact. Le fingerprint source reste identique.

## 6. Rendu gelé

`MapView` conserve un seul SVG principal et le même composant pour C1/C2/C3.
Chaque nœud est une carte indépendante de 240 x 64. Root, directory et file
portent chacun une forme/glyphe structurel distinct, pas seulement une couleur.
Un diagnostic skipped/unreadable reste marqué par un motif hachuré ou
équivalent et reste lisible dans le panneau.

Pour chaque nœud non racine, une seule arête `HIERARCHY EDGE` relie son parent
réel à lui : bord droit du parent vers bord gauche de l'enfant, chemin
orthogonal via le milieu horizontal. Elle se trouve sous les cartes, porte
`vectorEffect="non-scaling-stroke"`, une classe propre et :

```text
data-edge-kind="hierarchy"
data-brain-id
data-parent-node-id
data-child-node-id
```

Son id DOM est déterministe et namespacé par `brain_id`. Elle ne relie jamais
deux cerveaux, n'est jamais une `RelationEdge`, n'est jamais stockée et n'entre
dans aucun compteur relationnel.

Les quatre familles graphiques restent distinctes sans couleur seule :
hiérarchie orthogonale; relation intra établie pleine et fléchée; suggestion
pointillée, annelée et non établie; relation inter-cerveaux à double trait et
chevron. Provenance et nature restent écrites en mots.

## 7. Ancres bord à bord gelées

Un helper TypeScript pur partagé reçoit deux `Rect` et renvoie les intersections
du rayon centre-source vers centre-cible avec les frontières des deux
rectangles. Il traite droite, gauche, haut, bas, diagonale, grandes distances et
centres identiques sans NaN ni Inf.

Il s'applique uniquement à la projection graphique des relations établies
intra, suggestions et relations inter-cerveaux. Endpoints, type, direction,
provenance, stores, compteurs, états de suggestion et absence d'inverse restent
inchangés.

## 8. Labels, sélection et navigation gelés

Le nom est directement affiché quand la carte projetée est suffisamment grande.
Le label du nœud sélectionné reste toujours disponible visuellement. Le nom
complet est toujours dans `aria-label` et dans `title`/tooltip ou équivalent;
l'affichage tronque proprement les noms longs sans changer la donnée, sans
wrapping structurel et sans layout dépendant du texte. La fixture `mixed`
éprouve les noms longs.

La sélection reste un `BrainNodeRef { brainId, nodeId }`. Elle accentue la
carte sélectionnée, parent direct, enfants directs, relations intra établies et
relations inter-cerveaux établies. Les arêtes hiérarchiques sélection-parent et
sélection-enfants sont accentuées. Les suggestions ne reçoivent jamais
l'accentuation d'une relation établie. Tout élément atténué reste visible,
atteignable, accessible et sélectionnable.

Clavier gauche vers droite :

```text
ArrowLeft  -> parent
ArrowRight -> premier enfant direct
ArrowUp    -> frère précédent
ArrowDown  -> frère suivant
```

`role=tree/treeitem`, `aria-level`, `aria-selected` et
`aria-activedescendant` restent exacts et namespacés. Une destination clavier,
de panneau intra/inter ou de cerveau ajouté qui est hors viewport est rendue
visible par pan minimal ou centrage déterministe, sans relayout.

## 9. Vue, multi-cerveaux et relations gelés

Pan pointeur, molette, pan clavier, zoom clavier, fit et reset sont conservés.
Ils ne modifient aucun rectangle, dimension de layout, hiérarchie, store,
composition interne ou relation.

Chaque cerveau conserve un nodegraph interne. C2/C3 restent dans un seul SVG,
avec territoire, ordre catalogue, nom, icône et ids DOM brain+nœud. Alpha et
Gamma, sur la même fixture, ont la même géométrie relative mais des identités,
sélections et offsets distincts. Ajouter/retirer un cerveau peut recalculer les
offsets seulement.

Les invariants de `TASK-0017` et `TASK-0020` restent intégralement gelés :
provenance structurelle; suggestion séparée; `approve()` seule voie; compteurs
exacts; règles/version; aucune inverse; panneaux et navigation; store commun
interbrain; `source brain != target brain`; CEK1 inchangé; fresh seed interbrain
6 déterministes, 0 approuvée, 4 pending; `XB-S01` approuvable; cible visible ou
hors vue; auto-add; focus/active exacts; rebuild sans perte et 0 endpoint non
résolu.

## 10. Fixtures et sécurité gelées

Les fixtures historiques `quasi-empty`, `deep`, `wide`, `mixed` sont utilisées
exactement telles quelles. Aucun chemin, nom, seed, structure, plafond ou
contenu n'est modifié. De petits arbres synthétiques peuvent être déclarés
directement dans les unit tests de coordonnées.

Sources strictement en lecture seule; tests exclusivement synthétiques; aucun
picker réel, aucune donnée privée/réelle, aucun état FileTopo dans une racine
analysée. `I-1`, `I-2`, `I-3`, `X2` à `X7` et les 19 preuves protégées restent
intacts.

## 11. Critères d'acceptation immuables N1 à N14

À partir du commit de gel, `N1` à `N15` ne peuvent être modifiés. Un besoin de
les changer après observation du résultat produit `BLOCKED`, jamais une
réécriture.

### N1 — ENGINE / VERSION

Schéma 3; algorithme exact exposé par backend snapshot/report; v2 jamais servi
comme v3; rebuild sûr; `layout_invocations = 1`.

### N2 — EXACTITUDE HIÉRARCHIQUE

Sur les quatre fixtures : nœuds affichables = indexés = attendus; une racine;
parents et enfants directs exacts; `hierarchyEdgeCount = nodeCount - 1`; zéro
arête inventée et zéro mauvais `brain_id`.

### N3 — GÉOMÉTRIE

Chaque nœud fait 240 x 64; x dépend uniquement de la profondeur; zéro overlap
de cartes ou sous-arbres frères; aucun enfant contenu dans son parent;
dimensions positives et finies.

### N4 — DÉTERMINISME

Même fixture et version, deux rebuilds : rectangles, sérialisation et digest
reconstructible identiques; aucun hasard.

### N5 — P02-R1

Les huit contrôles passent : ensemble, parent, enfants directs, zéro arête
inventée, zéro mauvais branchement, labels disponibles, souris+clavier,
structure compréhensible sans couleur seule.

### N6 — LABELS / CARDS

Une carte par nœud; root/directory/file distincts sans couleur; label sélectionné
disponible; noms longs sûrs; nom complet accessible; aucune donnée renommée.

### N7 — VIEW

Pan, zoom, fit, reset sans relayout; invocation et rectangles inchangés après
les gestes.

### N8 — INTRA RELATIONS

Comptes et provenance inchangés; suggestions séparées; navigation exacte;
ancres bord à bord; aucune inverse.

### N9 — MULTIBRAIN

C2/C3 : un SVG, 2/3 territoires, géométrie interne stable, DOM namespacé,
`BrainNodeRef`, aucune collision Alpha/Gamma, add/remove sans relayout interne.

### N10 — INTERBRAIN

Source, cible et cerveaux exacts; arête visible entre territoires; cible cachée
reste dans le panneau; activation ajoute le cerveau et sélectionne la cible;
aucune inverse ni confusion d'identité.

### N11 — REBUILD / STORES

Après rebuild v3 Alpha/Gamma/Beta : stores intra, cross, approved et suggestions
intacts; 0 unresolved; catalogue et sources intacts.

### N12 — READ-ONLY / SÉCURITÉ

Fingerprints avant/après identiques; zéro état dans les fixtures; zéro réel,
picker ou donnée privée; `I-1`/`I-2`/`I-3` maintenus.

### N13 — HISTORIQUE / X5

Les 19 preuves protégées sont bit-identical; aucune preuve 0016–0020 réécrite;
les nouveaux rejeux sont `TASK-0022-*`; les gardes refusent les anciens noms;
`main` reste intacte.

### N14 — RÉGRESSION GLOBALE

Tests Rust complets; tests TypeScript complets; `pnpm check`; `pnpm build`;
Tauri debug `--no-bundle`; aucune dépendance; `B0` non corrigé/non masqué;
aucun clean ni suppression de `target`.

## 12. N15 immuable — topographic-node-graph real-host

Variant frais `task0022-n15-<timestamp>-<suffix>`, identique sur les deux
passes, jamais supprimé. Vrai processus Tauri/WebView2; toutes les interactions
probatoires passent par de vraies entrées Windows avec `keydownIsTrusted =
true`, `activationIsTrusted = true` lorsque pertinent,
`programmaticClickCount = 0`, `dispatchEventClickCount = 0`.

### Passe 1, ordre obligatoire

1. Fresh variant.
2. Alpha actif, Alpha seul.
3. Build/rebuild Alpha schema 3.
4. `layoutAlgorithm = layered-tree-cards-v1`.
5. `nodeCount` exact.
6. `hierarchyEdgeCount = nodeCount - 1`.
7. Cartes = 240 x 64.
8. Root/directory/file distincts.
9. `dossier-a` n'englobe pas ses enfants.
10. Parent/enfant exact sur plusieurs chemins `quasi-empty`.
11. Sélectionner `dossier-a` par vraie interaction.
12. Label visible et nom complet accessible.
13. Vraie `ArrowRight` vers le premier enfant.
14. Vraie `ArrowDown` vers le frère suivant si applicable.
15. Vraie `ArrowUp` vers le frère précédent.
16. Vraie `ArrowLeft` vers le parent.
17. `BrainNodeRef` exact après chaque navigation.
18. Pan réel.
19. Zoom réel.
20. Fit réel.
21. Reset réel.
22. Digest et rectangles inchangés après les étapes 18 à 21.
23. Observer les relations intra.
24. Une relation établie bord à bord.
25. Une suggestion visuellement distincte.
26. Ajouter Gamma par vraie frappe.
27. C2 = un SVG / deux territoires.
28. Alpha/Gamma ont la même géométrie interne relative.
29. Identités DOM distinctes.
30. Afficher `XB-D01` Alpha vers Gamma.
31. Arête cross bord à bord entre deux territoires.
32. Activer `XB-D01` au clavier.
33. Cible Gamma exacte sélectionnée.
34. Revenir Alpha.
35. Retirer Gamma.
36. La relation vers Gamma reste dans le panneau « hors de la vue ».
37. Une activation clavier ajoute Gamma et sélectionne la cible exacte.
38. Ajouter Beta.
39. C3 = un SVG / trois territoires.
40. Construire Beta schema 3.
41. Compte de nœuds `deep` exact.
42. `deep hierarchyEdgeCount = nodeCount - 1`.
43. Profondeur 40 perceptible en colonnes.
44. Sélectionner un nœud profond.
45. Label disponible.
46. Aucune collision de cartes Beta.
47. Approuver `XB-S01` par vraie frappe si pending.
48. `APPROVED +1`, `pending -1`, aucune fausse règle.
49. Rebuild Alpha.
50. Rebuild Gamma.
51. Rebuild Beta.
52. Layout digests déterministes.
53. Relation stores inchangés.
54. `XB-S01` reste `APPROVED`.
55. Six cross déterministes identiques.
56. Zéro endpoint non résolu.
57. Fingerprints source avant/après identiques.
58. Zéro état FileTopo dans les roots.
59. Fermeture réelle du processus.

### Passe 2, nouveau processus et même variant

60. Relancer réellement Tauri.
61. Même sandbox variant.
62. Version WebView2 réelle.
63. Map schema 3.
64. Layout algorithm exact.
65. Aucun rebuild inattendu si l'index est compatible.
66. Active brain persiste selon le comportement actuellement livré.
67. Ne pas prétendre que C3 persiste si `P-19` n'est pas implémentée.
68. `XB-S01` toujours `APPROVED`.
69. Six cross déterministes identiques.
70. Relations intra intactes.
71. Zéro endpoint non résolu.
72. Aucune preuve historique modifiée.

Artefacts obligatoires :

- `TASK-0022-N15-topographic-node-graph-webview2-pass1.json`
- `TASK-0022-N15-topographic-node-graph-webview2-pass2.json`

## 13. Régressions WebView2 obligatoires et noms gelés

Chaque script utilise un `FILETOPO_SANDBOX_VARIANT` frais, ne supprime aucun
variant historique et ne touche aucune preuve historique.

- `TASK-0022-J12-intrabrain-relations-regression-webview2.json` : comptes,
  pending séparés, provenance, navigation par vraie frappe, aucune inverse,
  approbation valide.
- `TASK-0022-K11-readonly-isolation-regression-webview2.json` : fingerprints,
  aucune écriture source, isolation cerveaux/stores.
- `TASK-0022-L12-composed-view-regression-webview2-pass1.json` et `pass2` :
  C2/C3, un SVG, territoires, sélection, add/remove, dernier cerveau refusé,
  active brain, restart réel, aucune fausse persistance de composition.
- `TASK-0022-M12-interbrain-relations-regression-webview2-pass1.json` et
  `pass2` : deterministic/approved/pending, panneau, cibles visibles/cachées,
  approbation, aucune inverse, rebuild et restart.

## 14. Tests spécifiques gelés

Rust : empty défensif, racine seule, chaîne, nombreux frères, multi-branche,
depth 40, wide, mixed, dimensions fixes, x par profondeur, non-overlap des
sous-arbres et cartes, répétition déterministe, compte d'arêtes dérivable,
parcours O(n), compatibilité schéma/algorithme, v2 non courant et rebuild v3.

TypeScript : construction d'arêtes hiérarchiques, parent/enfant exact, ids DOM
namespacés, états de cartes, seuil/label sélectionné, ancres droite/gauche/
haut/bas/diagonale/centres identiques/cross, zéro NaN, un SVG, C2/C3,
géométrie stable, mapping clavier et ensure-visible sans relayout.

Aucun pseudo-test tautologique n'est accepté.

## 15. Validation due

- tous les tests Rust et TypeScript;
- `pnpm check`;
- `pnpm build`;
- Tauri debug `--no-bundle`, avec `CARGO_INCREMENTAL=0` si `B0` réapparaît;
- `N1` à `N14`;
- `N15` pass1/pass2;
- régressions `J12`, `K11`, `L12` pass1/pass2, `M12` pass1/pass2;
- intégrité avant/après des 19 preuves protégées et de `main`.

Les temps peuvent être observés, jamais employés comme seuil ni comme levée de
`R8`. Aucun `H9`.

## 16. Fichiers autorisés

- `docs/tasks/TASK-0022-topographic-node-graph.md`;
- `docs/decisions/DEC-0024-deterministic-layered-node-card-layout.md`;
- `src-tauri/src/map/layout.rs`, `store.rs`, `commands.rs` et tests associés;
- `src-tauri/src/map/mod.rs` et `src-tauri/src/lib.rs` seulement si requis pour
  exposer le scénario N15 ou ses métadonnées;
- `src/map/types.ts`, `hierarchy.ts`, `viewState.ts`, `territories.ts`,
  `relations.ts`, `crossRelations.ts`, `MapView.tsx`, `MapApp.tsx`, `map.css`
  et leurs tests ciblés;
- nouveaux helpers/scénarios TypeScript sous `src/map/` strictement nécessaires;
- `src/map/runArtifacts.ts` et son test pour les nouveaux noms, sans retirer ni
  modifier les 19 noms protégés;
- nouveaux scripts `scripts/task0022-*.ps1`, plus adaptations strictement
  nécessaires des lanceurs partagés sans modifier leur cible historique;
- nouveaux artefacts `docs/performance/runs/TASK-0022-*` seulement;
- `docs/product/FEATURE_MATRIX.md` uniquement aux lignes F-007, F-008, F-016;
- documents durables de clôture `CURRENT_STATE.md`, `NEXT_ACTION.md`,
  `HANDOFF.md`, `VALIDATION.md`, `CHANGELOG_AI.md` et `.orchestrator/RESULT.md`;
- documentation layout technique seulement si elle devient nécessaire.

## 17. Hors périmètre absolu

`F-042`; moteur `F-043`; hash/doublons `F-046`; workflows `F-044/F-045`; IA,
LLM, BYOK, OCR, extraction, RAG/GraphRAG; recherche, filtres, watcher, journal,
vu/non-vu; identité utilisateurs, groupes, permissions, serveur; vraie racine
utilisateur ou picker; pack juridique; drag/drop ou éditeur de relations;
collapse/expand/focus/clustering/virtualisation/semantic zoom/minimap/résumé;
`H9`; release.

## 18. Conditions de stop

`BLOCKED` sans contournement si une fixture, un schéma relationnel, une preuve
protégée ou N1–N15 devrait changer; si une dépendance, donnée réelle, picker,
opération destructive, modification de `main`, suppression d'état non
reconstructible ou régression `VERIFIED` devient nécessaire; ou si v2 vers v3
met en danger un store hors map/index.

## 19. État final attendu

Si les critères passent : `F-007`, `F-008` et `F-016` deviennent
`IMPLEMENTED`; `F-042` reste `PROPOSED / ULTÉRIEUR`; `TASK-0022` devient
`IMPLEMENTED`, jamais `VERIFIED`. L'action suivante unique est son contrôle
indépendant. Aucune `TASK-0023` n'est créée.

## 20. Historique d'état

| Date | État | Motif |
|---|---|---|
| 2026-09-03 | `PROPOSED` | Fiche créée depuis le prompt technique autoritatif, avant toute ligne de code |
| 2026-09-03 | `APPROVED` | Périmètre, architecture, N1–N15, validations, limites et hors-scope intégralement écrits |
| 2026-09-03 | `IN_PROGRESS` | Gel prêt à être commité et poussé avant la première modification de code produit |
| 2026-09-03 | `IMPLEMENTED` | Layout v3, cartes et arêtes hiérarchiques, ancres bord-à-bord, navigation et régressions livrés; N15 et rejeux WebView2 passés; `VERIFIED` réservé au contrôle indépendant |
| 2026-09-03 | `IMPLEMENTED` | `ACTION-0035` `CHANGES_REQUIRED` : fond accepté, réserve unique `X8` `OPEN` — défaut de migration du harnais de preuve `M12`, corrigé et rejoué; statut inchangé, re-contrôle ciblé requis |
| 2026-09-03 | `VERIFIED` | Verdict rendu par l'orchestrateur technique indépendant et enregistré dans `ACTION-0036`; `X8` et `ACTION-0035` `CLOSED`, aucun autre point rouvert |

## 21. Résultat et preuves d'exécution

- Gel antérieur au code : commit `289cf9b`, poussé avant la première ligne de
  produit; N1 à N15 n'ont pas été modifiés ensuite.
- Backend : schéma carte `3`, algorithme persisté
  `layered-tree-cards-v1`, reconstruction contrôlée d'un v2, une invocation de
  layout par build/rebuild, stores relationnels hors index préservés.
- Layout : cartes `240 × 64`, colonnes de profondeur espacées de `120`, lignes
  espacées de `28`, aucun chevauchement sur les quatre fixtures, profondeur 40
  à `x = 14 400` sans compression.
- Rendu : un SVG pour C1/C2/C3, une carte et une arête hiérarchique exacte par
  nœud non racine, quatre familles graphiques distinctes, noms complets
  accessibles et ancres bord-à-bord intra/suggestion/inter.
- Validation locale : `149` tests Rust et `188` tests TypeScript passés;
  `pnpm check`, `pnpm build` et `pnpm tauri build --debug --no-bundle` passés.
- Hôte réel : WebView2 `152.0.4191.53`; N15 pass1/pass2, J12, K11, L12
  pass1/pass2 et M12 pass1/pass2 publiés sous les huit noms `TASK-0022-*`.
- N15 : frappes probatoires `isTrusted = true`, activation `isTrusted = true`
  quand applicable, `programmaticClickCount = 0`,
  `dispatchEventClickCount = 0`; zéro collision Beta; zéro endpoint inter non
  résolu; XB-S01 reste `APPROVED` après rebuild et redémarrage.
- Lecture seule : empreintes sources identiques, zéro état FileTopo dans les
  racines analysées; aucune fixture historique changée.
- X5 : 19 preuves protégées, zéro modification depuis la base contrôlée.
- B0 : l'ICE incrémental `rustc 1.98.0` a été observé; la validation Rust et le
  build Tauri ont réussi avec `CARGO_INCREMENTAL=0`. B0 n'est pas déclaré
  corrigé.

Limites inchangées : `F-042` non implémentée; `R8` non levée; `P-19` maintenue;
aucun `H9`, aucune nouvelle dépendance, aucune donnée réelle, aucun picker,
aucune modification de `main`.

## 22. ACTION-0035 — contrôle indépendant, CHANGES_REQUIRED, réserve X8

`ACTION-0035` a contrôlé `TASK-0022` au `HEAD`
`f6f02143585251eb403c7546b2ed78eb111e9fd6` et a rendu **`CHANGES_REQUIRED`** :
tout le fond est **accepté** — gel `289cf9b` antérieur au code, `DEC-0024`,
`layered-tree-cards-v1`, schéma `3`, reconstruction v2 → v3, `N1` à `N12`,
`N14`, `N15`, cartes `240 × 64`, hiérarchie explicite, quatre fixtures,
navigation, pan/zoom/fit/reset, relations intra, multibrain, relations
inter-cerveaux, ancres bord-à-bord, lecture seule, `B0` déclaré,
`F-007`/`F-008`/`F-016` `IMPLEMENTED`, `main` intacte — **sous une seule
réserve**.

**`X8` — `M12`/`N13` evidence migration defect, `OPEN`.** L'artefact `M12`
passe 2 publiait `writesUnderItsOwnTaskOnly: false` et « 14 noms proteges »
alors que le runtime écrit sous `TASK-0022` et que la garde `X5` protège **19**
noms. Cause : `src/map/crossScenario.ts` `M12.28` testait un préfixe
`TASK-0020-` **codé en dur** et annonçait un compte périmé. **Défaut du
harnais de preuve, pas du modèle interbrain.**

**Correction livrée sous ce `CHANGES_REQUIRED`**, dans le seul périmètre nommé :
l'identité de tâche est **dérivée** du nom d'artefact et de l'ensemble complet
des destinations — `artifactTaskId` et `runtimeWriteOwnership` dans
`src/map/runArtifacts.ts` — et le compte protégé est la **longueur** de la
liste, dont un test vérifie la parité avec la garde Rust canonique
`PROTECTED_RUN_ARTIFACTS: [&str; 19]` de `src-tauri/src/map/commands.rs`.
Aucune constante indépendante n'a été ajoutée, aucun des 19 noms n'a été
touché. Huit tests de garde `X8`, dont un qui **échoue sur le code contrôlé**.

`M12` a été rejoué **en entier**, passes 1 et 2, dans le vrai hôte, avec un
**variant neuf** `task0022-m12-20260903173531-65e5a8`; l'ancien variant est
conservé. Écart avec le rejeu accepté : **une** feuille en passe 1
(`step7_followByKey/waitedMs`, gigue) et **onze** en passe 2, **toutes** dans
`step28`. Le reste est identique bit à bit. Empreintes `sha256` des **19**
preuves protégées identiques avant/après.

`TASK-0022` **reste `IMPLEMENTED`**. `X8` **reste `OPEN`**. `ACTION-0035`
**reste `CHANGES_REQUIRED`**. L'action suivante unique est le **re-contrôle
indépendant ciblé `X8`**.

## 23. ACTION-0036 — re-contrôle indépendant et scellement X5

Le verdict rendu par l'orchestrateur technique indépendant est enregistré dans
[`ACTION-0036`](../reviews/ACTION-0036-independent-recontrol.md), sur le `HEAD`
`645b9484790f8e766f7eed93107b9431d144aaa6` et le commit substantif de
correction `X8` `d6963e65e9829b8c17196eeb469eabfb3aa86aeb` :
`ACTION-0036` **`CLOSED`**, `X8` **`CLOSED`**, `ACTION-0035` **`CLOSED`** et
`TASK-0022` **`VERIFIED`**. Codex enregistre ce verdict; il ne le rend pas.

Conséquence de `VERIFIED`, les huit artefacts canoniques énumérés au §13 et les
deux passes N15 du §12 rejoignent la garde `X5`. Les trois gardes Rust,
TypeScript et PowerShell contiennent exactement **27** noms : les 19 anciens,
inchangés, suivis des 8 preuves `TASK-0022`. Le `H9` non exécuté, les sorties
`K12` non publiées comme preuves de la tâche et toutes les variantes
`-abandon` restent non protégés. Les preuves elles-mêmes sont inchangées.

Validations ciblées seulement : `runArtifacts.test.ts` **26/26**, tests Rust
X5 ciblés **3/3**, exercice direct PowerShell **27/27 refus** et variantes
non canoniques acceptées. Aucun rejeu N15/J12/K11/L12/M12/H9 n'a été effectué.
