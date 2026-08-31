# TASK-0015 — Réalignement produit sur la référence fonctionnelle CarteTopo

- **Identifiant :** `TASK-0015`
- **Titre :** Réaligner définitivement FileTopo sur la **référence
  fonctionnelle CarteTopo**, avant `P4`, par un contrat de parité écrit, un
  ajustement de la baseline d'exigences, une décision qui supplante `DEC-0014`
  sur la lecture produit de `CAL-B`, une feuille de route en quatre étapes et
  la fiche `PROPOSED` de la première tâche `P4`
- **Statut :** `IMPLEMENTED`
- **Phase :** réalignement produit — après la clôture
  [ACTION-0024](../reviews/ACTION-0024-independent-control.md)
- **Proposée le :** 2026-08-31
- **Rédacteur de la fiche :** Claude Code
- **Exécuteur :** Claude Code, session `filetopo-task-0015-product-parity`
- **Nature :** **strictement documentaire. Aucune ligne de code, aucune mesure,
  aucune exécution, aucune dépendance.**
- **Branche :** `spike/v0.2-budget-controller`, déjà publiée sur origin

## 0. Autorisations, et ce qu'elles couvrent exactement

Cette tâche est portée par **deux autorisations distinctes**, et il importe de
ne pas les confondre.

| Autorisation | Origine | Ce qu'elle couvre |
|---|---|---|
| **Instruction produit autoritative** | **Sébastien**, 2026-08-31 | La **direction produit** : CarteTopo est la référence fonctionnelle; l'ancienne version publique de FileTopo est un prototype d'audit technique et **non** la référence produit; la parité fonctionnelle devient un contrat; l'interface visuelle est libre; `F-013` et `F-017` à `F-019` remontent au rang de parité. **Ce point n'est pas délégué** : c'est un changement important de portée produit, réservé à Sébastien par `AGENTS.md` |
| **GO technique** | **Orchestrateur technique**, 2026-08-31, sous la délégation inscrite dans [AGENTS.md](../../AGENTS.md) | L'**exécution documentaire** de cette fiche, dans son périmètre écrit, et le **push vers la branche de travail déjà publiée** |

**Le GO n'autorise que ce que cette fiche nomme.** La porte **`P4` reste
ouverte et non franchie**.

## 1. Objectif unique

**Faire que FileTopo cesse d'être aligné sur son propre prototype et soit
aligné sur la référence fonctionnelle CarteTopo**, par écrit, avant qu'une
seule ligne de code de production ne soit écrite.

Rien d'autre. Cette tâche n'écrit pas de code, ne mesure rien, ne franchit
aucune porte et ne conçoit aucune maquette.

## 2. Ce que l'instruction produit dit, mot pour mot dans son intention

1. **CarteTopo est la RÉFÉRENCE FONCTIONNELLE.**
2. **L'ancienne version publique de FileTopo est un prototype / audit
   technique, PAS la référence produit.**
3. **FileTopo final doit généraliser le bon fonctionnement de CarteTopo pour
   n'importe quelle arborescence ou « cerveau numérique ».**
4. **L'interface visuelle peut être entièrement modernisée** — formes,
   couleurs, typographie, panneaux, animations et organisation. **Aucune copie
   pixel pour pixel n'est demandée.** Une nouvelle UX est **encouragée** si
   elle est plus claire et plus attirante.
5. **Mais aucune amélioration visuelle ne doit supprimer la parité
   fonctionnelle.**

## 3. Périmètre autorisé — fichiers, et rien d'autre

**Créés :**

- `docs/product/CARTETOPO_FUNCTIONAL_PARITY.md` — le contrat produit;
- `docs/decisions/DEC-0015-product-parity-and-layout-scope.md`;
- `docs/tasks/TASK-0016-p4-vertical-slice.md` — **`PROPOSED` seulement**;
- la présente fiche.

**Modifiés :**

- `docs/product/REQUIREMENTS_BASELINE.md` — amendement de classification;
- `docs/product/FEATURE_MATRIX.md` — colonne de baseline et renvoi;
- `docs/product/REFERENCE_INTERFACE.md` — renvoi vers le contrat de parité;
- `docs/decisions/DEC-0014-...md` — **ajout d'un renvoi uniquement**, le texte
  d'origine étant **conservé intact**;
- `docs/decisions/README.md` — index des décisions;
- `ROADMAP.md` — les quatre étapes `A` à `D`;
- `docs/ai/CURRENT_STATE.md`, `NEXT_ACTION.md`, `HANDOFF.md`, `VALIDATION.md`,
  `CHANGELOG_AI.md`;
- `docs/tasks/TASK-0014-...md` — passage à `VERIFIED` par `ACTION-0024`.

**Interdit, sans exception :**

- toute écriture sous `src/`, `src-tauri/`, `tests/`, `public/`, `scripts/`,
  `.github/`, `spikes/` et `graph/`;
- toute exécution, mesure, installation de dépendance ou lancement de
  navigateur;
- toute lecture, tout listage et toute écriture **hors du dépôt**;
- toute donnée réelle, tout nom privé, tout chemin privé, toute métadonnée et
  tout code provenant de la référence privée;
- toute fusion, PR, release, étiquette, `force push` ou réécriture
  d'historique;
- **toute ligne de code de production** : `P4` n'est pas franchie.

## 4. Confidentialité — la règle qui gouverne tout ce document

`AGENTS.md` interdit l'accès à l'interface privée de référence et interdit d'en
copier noms, chemins, données, métadonnées, code et historique.

**Sébastien a nommé lui-même « CarteTopo » comme référence fonctionnelle et a
nommé le fichier à produire.** Le nom de la référence est donc employé; **rien
d'autre ne l'est.**

Le contrat de parité décrit **des comportements**, jamais un contenu. Il ne
contient **aucune** capture, **aucun** nom de dossier ou de fichier réel,
**aucun** chemin, **aucune** catégorie personnelle, **aucune** valeur de
données, **aucune** ligne de code et **aucune** structure interne de la
référence. Chaque exigence y est formulée de façon **générique**, applicable à
n'importe quelle arborescence.

## 5. Livrables

| # | Livrable | Contenu exigé |
|---|---|---|
| `L1` | `CARTETOPO_FUNCTIONAL_PARITY.md` | Le contrat produit courant : les **22 exigences de parité** `P-01` à `P-22`, chacune avec son comportement attendu, son critère d'acceptation et sa correspondance dans la matrice fonctionnelle; la **règle de liberté visuelle**; la **règle des relations transversales**; les **invariants non négociables**; les écarts et manques déclarés |
| `L2` | Reclassement | `F-013`, `F-017`, `F-018`, `F-019` deviennent **nécessaires à la parité**; `REQUIREMENTS_BASELINE.md` et `FEATURE_MATRIX.md` sont ajustés, **avec l'ancienne valeur conservée et visible** |
| `L3` | `DEC-0015` | Supplante `DEC-0014` **sur le seul point de la lecture produit de `CAL-B`**, sans réécrire `DEC-0014`; enregistre aussi la suite d'`ACTION-0024` F sur le budget |
| `L4` | Feuille de route | Étapes **A** parité fonctionnelle MVP, **B** finition visuelle moderne, **C** validation Windows/WebView2 réelle, **D** empaquetage et publication |
| `L5` | `TASK-0016` | Fiche de la **première tâche `P4`**, statut **`PROPOSED` seulement**, **non exécutée** : une **tranche verticale de production minimale** sur données synthétiques, pas l'application entière |
| `L6` | Mémoire | `CURRENT_STATE`, `NEXT_ACTION`, `HANDOFF`, `VALIDATION`, `CHANGELOG_AI` à jour; `NEXT_ACTION` contient **exactement une** action |

## 6. Critères d'acceptation de la tâche

| # | Condition |
|---|---|
| 1 | Le contrat de parité couvre **au minimum** les 22 points nommés par l'instruction produit, chacun avec un critère d'acceptation vérifiable |
| 2 | La règle de liberté visuelle est écrite, et la subordination « aucune amélioration visuelle ne supprime la parité » l'est aussi |
| 3 | La règle des relations transversales est écrite : jamais inventées, provenance déterministe ou approbation utilisateur, provenance **visible**, stockage **hors de l'arborescence analysée** |
| 4 | `F-013`, `F-017`, `F-018` et `F-019` sont reclassées, **avec leur classification antérieure conservée et visible**, dans les deux documents produit |
| 5 | IA, OCR, extraction de contenu, RAG et GraphRAG **restent `DIFFÉRÉ`** — aucun ne remonte |
| 6 | `DEC-0015` existe, supplante `DEC-0014` **sur le seul point CAL-B**, et **`DEC-0014` n'est pas réécrite** : seul un renvoi y est ajouté |
| 7 | La feuille de route `A` à `D` est écrite et ordonnée |
| 8 | `TASK-0016` existe, est **`PROPOSED`**, décrit une **tranche verticale**, et **n'a pas été exécutée** |
| 9 | **Aucun** fichier de `src/`, `src-tauri/`, `tests/`, `public/`, `scripts/`, `.github/`, `spikes/` ni `graph/` n'a changé |
| 10 | **Aucune** donnée, nom, chemin, métadonnée ni code de la référence privée n'apparaît nulle part |
| 11 | La mémoire obligatoire est à jour et `NEXT_ACTION.md` contient **exactement une** action |

## 7. Conditions d'arrêt immédiat

L'exécution **s'arrête et demande**, sans contourner, si :

1. une étape exigerait de lire ou d'ouvrir la référence privée;
2. une étape exigerait une donnée réelle, un fichier ou un dossier de
   l'utilisateur;
3. une action écrirait hors du dépôt public;
4. une action toucherait le code de production, `spikes/`, `graph/`, `main` ou
   les preuves de `TASK-0012` à `TASK-0014`;
5. l'état Git observé diffère de l'état attendu;
6. la portée s'élargit au-delà de cette fiche — **notamment** vers du code, une
   maquette exécutable ou le franchissement de `P4`.

## 8. Portes

| Porte | Objet | État |
|---|---|---|
| P3, P3 bis | Bancs d'essai `B2`, `B2 bis` | **Franchies le 2026-08-31** |
| **P4** | **Autoriser la première tâche d'implémentation** | **Ouverte, non franchie.** Cette tâche ne la franchit pas |
| P5 | GO de Sébastien pour publication externe exceptionnelle, dépense, donnée réelle, opération destructive ou hors dépôt | Permanente |

## 9. État final attendu

**`TASK-0015` se termine `IMPLEMENTED`, jamais `VERIFIED`.** L'exécuteur ne
juge pas son propre livrable. `VERIFIED` appartient à un contrôle indépendant,
conformément à [AGENTS.md](../../AGENTS.md).

## 10. Historique de l'état

- 2026-08-31 — `PROPOSED` : fiche rédigée à la clôture d'`ACTION-0024`, sur
  l'instruction produit autoritative de Sébastien.
- 2026-08-31 — `APPROVED` : instruction produit de **Sébastien** pour la
  direction, **GO technique de l'orchestrateur** pour l'exécution documentaire,
  dans le périmètre exact de §3.
- 2026-08-31 — `IN_PROGRESS` : branche `spike/v0.2-budget-controller`, arbre
  Git propre vérifié, aucune autre tâche `IN_PROGRESS`.
- 2026-08-31 — `IMPLEMENTED` : les six livrables `L1` à `L6` sont produits.
  **Aucun fichier de production, de test, de spike ni de `graph/` n'a changé.**
  **`P4` n'est pas franchie.** `VERIFIED` appartient au contrôle indépendant.

## 11. Rapport d'exécution

- **Exécutée le :** 2026-08-31
- **Branche :** `spike/v0.2-budget-controller`, publiée sur origin
- **Statut à l'issue :** **`IMPLEMENTED`, jamais `VERIFIED`**
- **Nature des preuves :** **aucune mesure. Ce livrable est documentaire :
  rien n'a été exécuté, rien n'a été testé.** Les critères de §6 sont des
  contrôles de contenu et de périmètre, vérifiables par lecture et par `git
  diff`, pas des résultats d'exécution.

### 11.1 Livrables produits

| # | Livrable | État |
|---|---|---|
| `L1` | [`CARTETOPO_FUNCTIONAL_PARITY.md`](../product/CARTETOPO_FUNCTIONAL_PARITY.md) | **produit** — 22 exigences `P-01` à `P-22` |
| `L2` | Reclassement de `F-013`, `F-017` à `F-019` | **produit** — `REQUIREMENTS_BASELINE.md` §2, §3 et §8; `FEATURE_MATRIX.md` |
| `L3` | [`DEC-0015`](../decisions/DEC-0015-product-parity-and-layout-scope.md) | **produit** — `DEC-0014` conservée intacte, renvoi ajouté |
| `L4` | Feuille de route `A` à `D` | **produit** — [`ROADMAP.md`](../../ROADMAP.md) |
| `L5` | [`TASK-0016`](TASK-0016-p4-vertical-slice.md) | **produit, `PROPOSED`, non exécutée** |
| `L6` | Mémoire obligatoire | **produit** |

### 11.2 Critères de §6

| # | Condition | État |
|---|---|---|
| 1 | 22 exigences de parité avec critère vérifiable | **rempli** — `P-01` à `P-22`, contrat §4 |
| 2 | Règle de liberté visuelle et sa subordination | **rempli** — contrat §3 |
| 3 | Règle des relations transversales | **rempli** — contrat §5 |
| 4 | Reclassement avec valeur antérieure conservée | **rempli** — `REQUIREMENTS_BASELINE.md` §8, colonne « Classification `TASK-0011` » conservée |
| 5 | IA, OCR, extraction, RAG, GraphRAG restent `DIFFÉRÉ` | **rempli** — `F-021`, `F-037`, `F-038`, `F-039` inchangées |
| 6 | `DEC-0015` supplante `DEC-0014` sur le seul point `CAL-B`; `DEC-0014` non réécrite | **rempli** — un renvoi ajouté en tête de `DEC-0014`, aucun paragraphe existant modifié |
| 7 | Feuille de route `A` à `D` ordonnée | **rempli** — `ROADMAP.md` |
| 8 | `TASK-0016` `PROPOSED`, tranche verticale, non exécutée | **rempli** |
| 9 | Aucun fichier de production, de test, de spike ni de `graph/` changé | **rempli** — contrôlé par `git diff --stat` sur ces chemins, **sortie vide** |
| 10 | Aucune donnée, nom, chemin, métadonnée ni code de la référence privée | **rempli** — contrat §1.2 et §9; contrôle par relecture |
| 11 | Mémoire à jour, `NEXT_ACTION` avec exactement une action | **rempli** |

### 11.3 Ce que la tâche ne fait pas

Elle **ne franchit pas `P4`**, **n'écrit aucune ligne de code**, **ne mesure
rien**, **ne lève aucune réserve** — `V1` à `V4`, `W1` à `W4`, `R2` à `R9`
restent en vigueur —, **n'ouvre pas** Canvas 2D ni WebGL, **ne tente aucune**
instrumentation de WebView2, **ne fusionne rien** et **ne crée** ni PR, ni
release, ni étiquette.

Elle **ne conçoit aucune maquette** et ne fixe aucun choix visuel : le contrat
de parité dit ce que l'interface doit **permettre**, jamais à quoi elle doit
**ressembler**.
