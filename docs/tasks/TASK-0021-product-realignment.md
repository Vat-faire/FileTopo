# TASK-0021 — Réalignement produit post-`TASK-0020` : figer la cible avant toute nouvelle implémentation

- **Identifiant :** `TASK-0021`
- **Titre :** **Réalignement produit** — enregistrer, avant toute nouvelle
  ligne de code d'implémentation, ce que FileTopo vise réellement : une
  **topographie à nœuds reliés** plutôt qu'un pavage imbriqué, un **moteur de
  relations déterministe et explicable sans IA**, un **workflow humain de
  validation des suggestions**, une **IA facultative `BYOK` qui ne crée jamais
  de vérité**, et une **architecture mono/multi-utilisateur consciente des
  permissions de la source**
- **Statut :** **`IMPLEMENTED`** le 2026-09-02 — **livrable documentaire
  produit**, en attente de **contrôle indépendant**. **L'exécuteur ne
  s'attribue pas `VERIFIED`**
- **Nature :** **DOCUMENTAIRE et PRODUIT.** Une **seule** exception de code est
  autorisée et bornée : l'extension des **gardes `X5`** aux cinq preuves
  désormais canoniques de `TASK-0020` — §2.1
- **Phase :** étape **A** de la feuille de route — **réalignement**, entre la
  cinquième tranche livrée et la première tranche de la nouvelle cible
- **Proposée le :** 2026-09-02
- **Rédacteur de la fiche :** Claude Code, **exécuteur**
- **Exécuteur :** Claude Code
- **GO d'exécution :** **ACQUIS** le 2026-09-02 — **instruction produit de
  Sébastien**, relayée par l'orchestrateur technique, nommant ce réalignement
  et son périmètre écrit. Les points `B` à `N` du prompt relèvent de la
  **direction produit**, que la délégation d'orchestration technique **ne
  couvre pas** : ils sont **enregistrés**, pas décidés par l'exécuteur
- **Branche :** `build/v0.2-a5-interbrain-relations`, `HEAD` de départ
  `c1c747a2bbcbc45bb2920378e4967fe81004a2c8`
- **Préalables, vérifiés au départ :** `TASK-0020` **`VERIFIED`**,
  `ACTION-0032` **`CLOSED`**; **aucune** tâche `IN_PROGRESS`; arbre Git
  **propre**; `HEAD` = `c1c747a` = `origin/build/v0.2-a5-interbrain-relations`;
  `main` = `91bbe90f0f99026c28cd345784d4f579a0016db2`, **non touchée**

> **Cette tâche n'implémente ni layout, ni moteur de règles, ni IA, ni
> serveur.** Elle **écrit la cible**. Ce qui n'y est pas prouvé n'y est pas
> prétendu.
>
> **Aucune preuve historique n'est touchée. Aucun test `WebView2` n'est
> rejoué.**

## 1. Pourquoi ce réalignement

`TASK-0016` à `TASK-0020` ont construit, tranche après tranche, une carte
réelle : hiérarchie issue de l'arborescence, relations transversales avec
provenance, plusieurs cerveaux, vue composée, relations inter-cerveaux. Six
tâches `VERIFIED`. Rien de cela n'est remis en cause.

Ce qui doit être corrigé est **la cible**, sur deux points que le travail
accompli a rendus visibles :

1. **La représentation.** Le pavage de rectangles imbriqués — `CAL-B`, hérité
   de `DEC-0014` — s'est installé comme la forme du produit alors que
   `DEC-0015` l'avait déjà réduit à une **primitive technique**. Pire, le
   contrat de parité **encode l'imbrication dans une exigence** : `P-02` exige
   que « l'inclusion visuelle reproduise la relation parent/enfant ». Une
   exigence formulée ainsi rend le treemap **obligatoire** et interdit
   contractuellement la topographie que le produit vise.
2. **L'automatisation des relations.** `TASK-0017` et `TASK-0020` ont livré le
   **modèle** de relation avec provenance, mais **aucune règle n'en produit**.
   Toute relation existante vient d'une fixture. Sans moteur, `DETERMINISTIC`
   est une valeur d'énumération, pas une capacité.

À quoi s'ajoutent quatre questions que la suite ne peut pas laisser ouvertes
sans se figer par accident : ce que FileTopo **est** (§B), ce qu'une
**suggestion** vaut face à une relation (§E à §I), ce que l'**IA** a le droit
de faire (§J, §K), et ce qu'un **deuxième utilisateur** change (§L, §M).

## 2. Périmètre

### 2.1 La seule modification de code autorisée — gardes `X5`

`TASK-0020` étant `VERIFIED`, ses **cinq** preuves sont canoniques.
`ACTION-0032` était documentaire et **n'a pas étendu les gardes** : c'est le
**premier** travail de cette tâche, avant toute autre écriture.

| Preuve devenue canonique |
|---|
| `TASK-0020-M12-interbrain-relations-webview2-pass1.json` |
| `TASK-0020-M12-interbrain-relations-webview2-pass2.json` |
| `TASK-0020-J12-intrabrain-regression-webview2.json` |
| `TASK-0020-L12-composed-regression-webview2-pass1.json` |
| `TASK-0020-L12-composed-regression-webview2-pass2.json` |

Les **trois** gardes portent les mêmes cinq noms : la porte Rust
`write_run_artifact`, `src/map/runArtifacts.ts`, et
`scripts/protected-run-artifacts.ps1`. La liste passe de **14 à 19** noms.

**Conséquence assumée, écrite plutôt que découverte.** Cette extension est la
première dont les noms sont **encore employés comme destinations** par le
runtime livré : `crossScenario`, `relationScenario` et `composedScenario` les
demandent, et la porte répond désormais **non**. Les boutons `M12`, `J12` et
`L12` ne produisent plus de fichier sous ces noms, et les scripts de campagne
refusent de supprimer une copie périmée avant une passe. **C'est le résultat
voulu** : `TASK-0020` est close et contrôlée, aucune exécution légitime n'a
besoin de réécrire ces cinq fichiers, et une tranche qui aurait besoin de
rejouer l'un de ces scénarios le republie **sous son propre nom de tâche** —
exactement ce que `TASK-0020` a fait pour `TASK-0019`. Le constant
`SEALED_RUNTIME_DESTINATIONS` nomme les cinq pour que l'état soit **asserté**,
pas subi.

### 2.2 Ce que cette tâche produit

- **Cinq fiches `DEC`** : `DEC-0019` à `DEC-0023`;
- **une correction normative `X2`** du contrat de parité, sur `P-02`;
- **huit fonctions** ajoutées à la matrice : `F-042` à `F-049`;
- **une séquence de tranches futures**, ordonnée par dépendances,
  **`PROPOSED`, non exécutée**;
- la mise à jour des documents durables.

### 2.3 Ce que cette tâche NE fait PAS

- **Aucun code d'implémentation du nouveau layout.** Rien n'est écrit dans
  `src/map/layout*`, ni dans le rendu.
- **Aucun moteur de règles implémenté.** Aucun signal calculé, aucun hash.
- **Aucune IA**, aucune dépendance, aucun fournisseur, aucune clé.
- **Aucun serveur, aucune identité, aucune permission** implémentés.
- **Aucune campagne rejouée** : ni `M12`, ni `J12`, ni `L12`, ni `H9`. **`R8`
  reste entière.**
- **Aucune nouvelle `TASK` d'implémentation créée** : la séquence de §6 est une
  **proposition**, et l'orchestrateur décide.
- **Aucune preuve historique modifiée**, aucune fusion vers `main`, aucune
  `PR`, aucune release, aucune étiquette, aucun `force push`, aucune
  réécriture d'historique.

## 3. Les décisions enregistrées

Chacune est une **décision produit de Sébastien**, relayée par l'orchestrateur.
La fiche **enregistre**; elle ne décide pas.

| Fiche | Objet | Points du prompt |
|---|---|---|
| [`DEC-0019`](../decisions/DEC-0019-general-purpose-product-scope.md) | **FileTopo n'est pas un produit juridique.** Cible générique; aucune catégorie métier codée en dur dans le noyau; packs spécialisés possibles plus tard | `B` |
| [`DEC-0020`](../decisions/DEC-0020-topographic-node-graph.md) | La représentation principale finale est un **graphe topographique hiérarchique à nœuds/cartes et connexions explicites**. Le treemap reste une **primitive**, jamais l'UX finale. **Correction normative `X2` de `P-02`** | `C`, `D` |
| [`DEC-0021`](../decisions/DEC-0021-deterministic-relation-engine.md) | **Moteur de relations déterministe et explicable, sans IA** : trois niveaux sémantiques, architecture de signaux, score ≠ vérité, workflow humain de validation, mémoire des rejets | `E`, `F`, `G`, `H`, `I` |
| [`DEC-0022`](../decisions/DEC-0022-optional-byok-ai-layer.md) | **IA facultative, `BYOK`, provider-agnostic**, jamais requise par le noyau; un `LLM` produit une **suggestion**, jamais une relation établie; **pas de troisième provenance** | `J`, `K` |
| [`DEC-0023`](../decisions/DEC-0023-identity-and-source-permissions.md) | **Mono/multi-utilisateur** sous un seul modèle conceptuel; **la source reste autoritaire** sur les permissions; **rien n'est divulgué** — nom, chemin, métadonnée, relation, suggestion, résultat, compteur — d'un objet non autorisé | `L`, `M` |

**Le noyau reste en lecture seule sur les sources** — point `N` du prompt. Ce
n'est pas une nouvelle décision : `I-1` et `I-2` sont **réaffirmés** dans
`DEC-0021` §7 et `DEC-0023` §7, et `P-22` reste bloquante.

## 4. Effet sur la matrice fonctionnelle

**Huit fonctions ajoutées, aucune retirée, aucune reclassée.**

| Fonction | Classification | Décision |
|---|---|---|
| `F-042` — repli/dépli et focus de branche | `ULTÉRIEUR` | `DEC-0020` |
| `F-043` — moteur de signaux et relations déterministes explicables | `MVP` | `DEC-0021` |
| `F-044` — file de révision des suggestions | `MVP` | `DEC-0021` |
| `F-045` — mémoire des décisions humaines sur les suggestions | `MVP` | `DEC-0021` |
| `F-046` — identité de contenu et doublons exacts | `MVP` | `DEC-0021` |
| `F-047` — couche IA facultative `BYOK` | `DIFFÉRÉ` | `DEC-0022` |
| `F-048` — identités, groupes et mode équipe | `ULTÉRIEUR` | `DEC-0023` |
| `F-049` — rendu, recherche et relations conscients des permissions | `ULTÉRIEUR` | `DEC-0023` |

**La matrice passe de 41 à 49 lignes.** Répartition : **`MVP` 41**,
**`ULTÉRIEUR` 3**, **`DIFFÉRÉ` 5**, **total 49**. `F-001` à `F-049`, **sans
trou ni doublon**. **Aucune classification existante n'a changé.**

## 5. Effet sur le contrat de parité

**Une seule exigence est corrigée : `P-02`.** La correction est enregistrée
comme **`X2`**, en tête du contrat, sur le modèle de `X1`. **L'ancienne
formulation est conservée et visible**; elle n'est ni supprimée ni réécrite en
silence.

- **Le nombre d'exigences ne change pas : 22.**
- **`P-01`, `P-03` à `P-22` sont inchangées.**
- `P-02` **ne descend pas** : elle devient **plus** exigeante — l'ancienne
  version se satisfaisait d'une inclusion géométrique, la nouvelle demande une
  hiérarchie **exacte nœud par nœud**, sans arête inventée et sans nœud placé
  dans la mauvaise branche.
- `P-02` **n'est pas satisfaite** par l'état livré et n'a jamais été déclarée
  telle.

## 6. Séquence proposée pour la suite — `PROPOSED`, non exécutée

**Sept tranches, ordonnées par dépendances**, à créer une par une par
l'orchestrateur. **Aucune n'est créée par cette tâche.**

| # | Tranche proposée | Pourquoi à ce rang | Dépend de |
|---|---|---|---|
| 1 | **Layout topographique à nœuds/cartes/liens** et satisfaction de `P-02` corrigée | La représentation conditionne tout ce qui s'affiche ensuite : une relation, une suggestion et une permission se **montrent** sur une carte. Construire le moteur avant la carte produirait des relations invisibles | `DEC-0020`, `X2` |
| 2 | **Moteur générique de signaux et relations déterministes** — `F-043`, `F-046` | Premier producteur réel de provenance `DETERMINISTIC`. `F-046` (identité de contenu) est **dans** cette tranche parce que le hash est le signal le plus fort et le plus simple à falsifier | tranche 1, `DEC-0021` |
| 3 | **Workflow humain de validation** — `F-044`, `F-045` | Une suggestion sans moyen de la confirmer est une nuisance. Vient **après** le moteur parce qu'il faut de vraies suggestions à trier, et **avant** toute autre source de suggestions | tranche 2 |
| 4 | **Doublons exacts et identité de fichier, à l'échelle** | Sépare le **signal** (tranche 2) de sa **mise à l'échelle** : coût de hachage, cache, invalidation, gros volumes. Découpé pour que la tranche 2 ne devienne pas énorme | tranche 2 |
| 5 | **Recherche, filtres et surveillance** — `F-020`, `F-022`, `F-027` à `F-032` | Déjà au périmètre `MVP`, indépendant des tranches 1 à 4, mais placé après elles parce que la recherche doit devenir **permission-aware** en tranche 6 sans être réécrite | — |
| 6 | **Fondation identités / permissions** — `F-048`, `F-049` | **Avant** toute IA et **avant** tout partage. Une couche IA posée sur un modèle non conscient des permissions exfiltrerait ce que le modèle ne sait pas cacher | tranches 2, 3, 5, `DEC-0023` |
| 7 | **Couche IA `BYOK`** — `F-047` | En dernier, et `DIFFÉRÉ` : elle ne produit que des **suggestions**, donc elle a besoin du workflow (3) et des permissions (6) pour être autre chose qu'un risque | tranches 3, 6, `DEC-0022` |

**Justification de l'ordre, en une phrase :** on rend visible avant de
produire, on produit avant de faire trier, on fait trier avant d'ouvrir la
porte à une source qui se trompe, et on protège avant d'ouvrir.

## 7. Validation attendue

Cette tâche est **documentaire**. Sa validation est une **relecture**, pas une
exécution — à une exception près, §2.1, qui est du code et se teste.

| # | Contrôle | Comment |
|---|---|---|
| `N1` | Les cinq preuves `TASK-0020` sont protégées dans les **trois** gardes | Exécuté — voir §8 |
| `N2` | Aucune preuve sous `docs/performance/runs/` n'est modifiée | `git status` sur le dossier |
| `N3` | La matrice n'a ni trou ni doublon, et le total est recompté | Relecture, `F-001` à `F-049` |
| `N4` | Aucune exigence de parité supprimée; le contrat reste à 22 | Relecture |
| `N5` | Toute modification normative pointe vers sa `DEC` | Relecture |
| `N6` | `main` intacte, aucun `H9`, aucune campagne rejouée | `git`, relecture du diff |

## 8. Ce qui a été exécuté, et ce qui ne l'a pas été

**Exécuté — uniquement les gardes `X5` de §2.1 :**

- `npx vitest run src/map/runArtifacts.test.ts` — **14 tests, 14 passés**;
- `CARGO_INCREMENTAL=0 cargo test --lib map::commands::tests` — **14 tests, 14
  passés**, dont
  `task_0020s_own_evidence_became_protected_when_it_was_verified`;
- chargement de `scripts/protected-run-artifacts.ps1` : **19** noms, et
  `Assert-NotProtectedRunArtifact` **refuse** les cinq preuves tout en
  **laissant passer** les variantes `-abandon`.

**`B0` s'est reproduit une sixième fois**, sur le premier `cargo test` :
panique interne du compilateur en compilation incrémentale.
`CARGO_INCREMENTAL=0` suffit à contourner — `DEC-0013` `E`. **Rien n'a été
supprimé ni renommé dans `src-tauri/target/`.**

**Non testé, et déclaré tel :**

- **Aucune campagne `WebView2`**, aucune mesure, aucun seuil. **`R8` entière.**
- **La suite complète `vitest` et `cargo test` n'a pas été exécutée** : seuls
  les deux fichiers de garde `X5` l'ont été. Rien d'autre n'a été touché dans
  le code, mais cela n'est pas la même chose que l'avoir vérifié.
- **Aucune des cibles écrites dans `DEC-0019` à `DEC-0023` n'est prouvée.** Ce
  sont des **cibles à falsifier**, pas des résultats.
- `P-19`, `P-21` demeurent; `P-04` reste **PARTIELLE**; `P-02` reste **non
  satisfaite**, désormais sous sa formulation corrigée.

## Historique d'état

| Date | État | Détail |
|---|---|---|
| 2026-09-02 | `PROPOSED` | Réalignement produit demandé par Sébastien, relayé par l'orchestrateur |
| 2026-09-02 | `APPROVED` | GO nommant le réalignement et son périmètre écrit |
| 2026-09-02 | `IN_PROGRESS` | Gardes `X5` étendues d'abord, puis travail documentaire |
| 2026-09-02 | `IMPLEMENTED` | Cinq `DEC`, correction `X2`, huit fonctions, séquence proposée. **En attente de contrôle indépendant** |

## Documents liés

- [`DEC-0019`](../decisions/DEC-0019-general-purpose-product-scope.md),
  [`DEC-0020`](../decisions/DEC-0020-topographic-node-graph.md),
  [`DEC-0021`](../decisions/DEC-0021-deterministic-relation-engine.md),
  [`DEC-0022`](../decisions/DEC-0022-optional-byok-ai-layer.md),
  [`DEC-0023`](../decisions/DEC-0023-identity-and-source-permissions.md)
- [CARTETOPO_FUNCTIONAL_PARITY.md](../product/CARTETOPO_FUNCTIONAL_PARITY.md)
- [FEATURE_MATRIX.md](../product/FEATURE_MATRIX.md)
- [REQUIREMENTS_BASELINE.md](../product/REQUIREMENTS_BASELINE.md)
- [`TASK-0020`](TASK-0020-interbrain-relations.md),
  [`ACTION-0032`](../reviews/ACTION-0032-independent-control.md)
