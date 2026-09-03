# ACTION-0033 — Contrôle indépendant de TASK-0021 : CHANGES_REQUIRED, réserve X7

- **Date :** 2026-09-02
- **Objet :** **contrôle indépendant** de `TASK-0021` — réalignement produit,
  livrable **documentaire** — **sur les documents publiés**, et rien d'autre
- **Contrôleur :** **orchestrateur technique indépendant**, instance
  **distincte** de l'exécuteur de `TASK-0021`
- **Rédacteur de la présente fiche :** Claude Code, **exécuteur**. **Cette
  fiche ENREGISTRE un verdict rendu par l'orchestrateur; elle ne le rend pas,
  et l'exécuteur ne s'attribue rien.**
- **`HEAD` contrôlé :** **`68211c83c2390a250d6b9a42679202ee14782977`**, tip de
  `build/v0.2-a5-interbrain-relations` au moment du contrôle
- **Verdict :** **`CHANGES_REQUIRED`** — `ACTION-0033` **ouverte**, réserve
  **`X7`** **`OPEN`**
- **`TASK-0021` :** reste **`IMPLEMENTED`**. **`VERIFIED` est interdit avant
  re-contrôle indépendant ciblé de `X7`.**

## 1. Le verdict, tel qu'il a été rendu

| Élément | État attribué par l'orchestrateur |
|---|---|
| `ACTION-0033` | **`CHANGES_REQUIRED`** |
| Réserve `X7` | **`OPEN`** |
| `TASK-0021` | **`IMPLEMENTED`** — inchangée |
| Fond de `TASK-0021` | **accepté** — voir §2 |
| `HEAD` contrôlé | `68211c83c2390a250d6b9a42679202ee14782977` |
| `main` | `91bbe90f0f99026c28cd345784d4f579a0016db2`, **intacte** |

**La réserve est documentaire et ne porte que sur une nomenclature.** Elle ne
remet en cause **aucun** contenu de fond de `TASK-0021`.

## 2. Ce que le contrôle accepte — le FOND, en entier

Enregistré tel que rendu. **Aucun élément n'est réinterprété ici.**

- l'**extension des gardes `X5` à 19 preuves** : **acceptée**;
- l'**ordre des commits** — `aeee5a8` gardes `X5` **AVANT** `7f97fc6`
  réalignement produit : **accepté**;
- **`DEC-0019` à `DEC-0023`** : **acceptées**;
- la **nouvelle direction topographique** : **acceptée**;
- la **correction de fond de `P-02`** : **acceptée**;
- le **moteur déterministe sans IA** : **accepté comme cible**;
- le **workflow humain de validation** : **accepté comme cible**;
- l'**IA facultative `BYOK`** : **acceptée comme cible**;
- l'**architecture mono/multi-utilisateur et les permissions** : **acceptées
  comme cibles**;
- la **matrice `F-001` à `F-049`** : **acceptée**;
- la **séquence future proposée** : **acceptée**.

**Aucune de ces cibles n'est considérée implémentée.** Ce sont des cibles à
falsifier, pas des résultats.

## 3. La réserve X7 — collision d'identifiant

**Une seule réserve, documentaire, bloquante pour `VERIFIED`.**

`X2` désigne **déjà, historiquement**, la **réserve technique de `TASK-0016`**
sur la surface runtime héritée —
[`ACTION-0026`](ACTION-0026-independent-control.md), **`CLOSED`** le
2026-08-31.

`TASK-0021` a **réutilisé le nom `X2`** pour désigner la **correction normative
de `P-02`**. Les **deux sens** apparaissaient dès lors **simultanément** dans
`CURRENT_STATE.md` et dans les documents produit.

**Cette ambiguïté est refusée.** Un identifiant de réserve ne peut pas désigner
deux objets distincts dans le même corpus.

## 4. Correction exigée, et exécutée

**Identifiant canonique de la correction de `P-02` :**

| Ancien | Nouveau | Signification |
|---|---|---|
| `X2` | **`P02-R1`** | `P-02` — **Révision normative 1** |

**Ce qui n'a PAS bougé, et ne devait pas bouger :**

- **`X2` de `TASK-0016` reste `X2`**, et reste **`CLOSED`**. Il n'est ni
  renommé, ni réinterprété;
- **`X1` de `TASK-0015` reste `X1`**;
- **`X3`, `X4`, `X5`, `X6` sont inchangées**;
- **`X7` désigne uniquement la présente réserve de contrôle**;
- **la substance de `P-02` ne change pas** — ni le nouveau comportement, ni les
  **huit** contrôles;
- **`P-01`, `P-03` à `P-22` sont inchangées**; le contrat reste à **22**
  exigences;
- **`DEC-0020` ne change que de nomenclature** : décision topographique, `T-B`,
  statut du treemap, critères et conséquences **inchangés**.

**Fichiers corrigés — 12 fichiers, 22 occurrences, substitution d'identifiant
seule :** `ROADMAP.md`, `docs/product/CARTETOPO_FUNCTIONAL_PARITY.md`,
`docs/product/FEATURE_MATRIX.md`, `docs/product/REQUIREMENTS_BASELINE.md`,
`docs/decisions/DEC-0020-topographic-node-graph.md`,
`docs/decisions/README.md`, `docs/tasks/TASK-0021-product-realignment.md`,
`docs/ai/CURRENT_STATE.md`, `docs/ai/NEXT_ACTION.md`, `docs/ai/HANDOFF.md`,
`docs/ai/VALIDATION.md`, `docs/ai/CHANGELOG_AI.md`. `PROJECT_VISION.md` ne
contenait **aucune** occurrence. `.orchestrator/RESULT.md` est **remplacé**.

**Aucun remplacement aveugle n'a été fait.** Les **110** occurrences de `X2` du
dépôt ont été examinées une par une; **22** désignaient la correction de `P-02`
et ont été renommées; les autres désignent la réserve historique de
`TASK-0016`, ses tests-gardes ou les mentions « `X2` maintenue » des contrôles
successifs, et sont **conservées telles quelles**.

## 5. Vérifications mécaniques de la correction

| # | Contrôle | Constat |
|---|---|---|
| `G1` | Toute référence à la révision de `P-02` utilise `P02-R1` | **TENU** — 22 occurrences renommées |
| `G2` | Le `X2` historique de `TASK-0016` existe toujours et ne signifie que sa réserve historique | **TENU** — `docs/reviews/ACTION-0026-independent-control.md` et `docs/tasks/TASK-0016-p4-vertical-slice.md` **non modifiés** |
| `G3` | Aucune occurrence ambiguë ne subsiste — `X2` n'est plus employé nulle part comme nom de la révision de `P-02` | **TENU** — recherche vide |
| `G4` | `P-02` inchangée sur le fond | **TENU** — le `diff` mot-à-mot ne porte **que** sur l'identifiant : 22 retraits `X2`, 22 ajouts `P02-R1`, **aucun autre mot changé** |
| `G5` | `DEC-0019` à `DEC-0023` inchangées sur le fond | **TENU** — seul `DEC-0020` est touché, sur **deux** lignes de nomenclature |
| `G6` | Matrice | **TENU** — `F-001` à `F-049`, **49** identifiants, **49** uniques, aucun trou, aucun doublon; `MVP` **41**, `ULTÉRIEUR` **3**, `DIFFÉRÉ` **5**; contrat à **22** exigences |
| `G7` | Aucune preuve historique modifiée | **TENU** — `git status docs/performance/runs/` **vide** |
| `G8` | Aucun code produit modifié | **TENU** — `git status src/ src-tauri/ scripts/` **vide** |
| `G9` | Aucune garde `X5` modifiée | **TENU** — les trois fichiers de garde **non modifiés** (`git status` vide); la liste de `scripts/protected-run-artifacts.ps1` compte toujours **19** noms |
| `G10` | `main` intacte | **TENU** — `91bbe90f0f99026c28cd345784d4f579a0016db2` |

**Non exécuté, et volontairement :** aucun `WebView2`, aucun `H9`, aucun test
produit, aucun build. La correction est **strictement documentaire**.

## 6. Ce que cette fiche ne fait pas

- **Elle ne ferme PAS `X7`.** `X7` reste **`OPEN`** jusqu'au **re-contrôle
  indépendant ciblé**. L'exécuteur enregistre la correction; **il ne se
  prononce pas sur elle**.
- **Elle n'attribue PAS `VERIFIED` à `TASK-0021`**, qui reste
  **`IMPLEMENTED`**.
- Elle ne lève **aucune** limite déclarée en `TASK-0021` : aucune cible de
  `DEC-0019` à `DEC-0023` n'est prouvée; `R8` **entière**; `P-02` **n'est pas
  satisfaite**; `P-19`, `P-21` demeurent; `P-04` reste **PARTIELLE**; `B0`
  n'est pas corrigé.
- Elle ne porte **aucune** autorisation de fusion vers `main`, de `PR`, de
  release, d'étiquette, de `force push` ni de réécriture d'historique.
- Elle n'ouvre **aucune** tranche suivante.

## 7. Suite

**Re-contrôle indépendant ciblé de `X7` / `TASK-0021`.** Il porte sur la
**seule** question ouverte : la nomenclature est-elle désormais non ambiguë, et
la substance est-elle restée intacte.

## Historique

| Date | État | Détail |
|---|---|---|
| 2026-09-02 | `CHANGES_REQUIRED` | Fond de `TASK-0021` **accepté**; réserve `X7` **`OPEN`** — collision entre le `X2` historique de `TASK-0016` et le nom donné à la révision de `P-02`. `HEAD` contrôlé `68211c8` |
| 2026-09-02 | correction exécutée | `X2` → `P02-R1` sur les **22** occurrences de la révision de `P-02`, dans **12** fichiers. **`X7` NON fermée par l'exécuteur** |
