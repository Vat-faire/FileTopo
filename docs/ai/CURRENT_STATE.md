# État courant

- **Dernière mise à jour :** 2026-08-31
- **Branche active :** **`spike/v0.2-budget-controller`**, publiée sur origin,
  créée depuis `933bd0d5e7e05e4e7fe233c5fc6b9320a194264d`
- **`spike/v0.2-render-budget` :** `933bd0d…`, publiée, **non touchée**
- **`spike/v0.2-technical-risk-gates` :** `746f1b5…`, publiée, **non touchée**
- **`rebuild/v0.2-project-brain` :** inchangée, `db8d3de0…`, **non touchée**
- **`main` :** inchangée, `91bbe90f0f99026c28cd345784d4f579a0016db2`, **non
  touchée**
- **Dernière tâche vérifiée :** **`TASK-0014`, `VERIFIED` le 2026-08-31**, sur
  contrôle indépendant
  [`ACTION-0024`](../reviews/ACTION-0024-independent-control.md), **avec quatre
  réserves `W1` à `W4`**
- **Tâche livrée, NON vérifiée :** **`TASK-0015`, `IMPLEMENTED` le
  2026-08-31** — réalignement produit sur la référence fonctionnelle CarteTopo,
  **strictement documentaire**
- **Tâche IN_PROGRESS :** aucune
- **Code applicatif :** **inchangé.** 0 fichier modifié sous `src/`,
  `src-tauri/`, `tests/`, `public/`, `scripts/`, `.github/`, `spikes/` ou
  `graph/`

## Ce que la clôture d'ACTION-0024 a décidé

`TASK-0014` est **`VERIFIED`**, sur preuves, par une instance **distincte de
l'exécuteur**. **`VERIFIED` porte sur la qualité des preuves, pas sur le succès
du mécanisme.**

| Décision | Ce qui est retenu |
|---|---|
| **Correction minimale du budget** | **REJETÉE.** `G1` et `G2` sont réfutées. Aucun code ne peut la reprendre |
| **`G3` bloqué** | **Accepté.** La mesure était **vacueuse par construction** : **aucune stabilité n'est prouvée** |
| **`G9`** | **Accepté.** Rien n'a changé après mesure; le geste sur `G3` **retire une fausse confirmation** |
| **`G8`** | **Accepté avec la réserve `W1`** : la grandeur « régime stable » est fragile, mais la mesure possède des échantillons et est corroborée sur toute la période |
| **Budget adaptatif** | **Reste une piste. Cesse d'être un prérequis à `P4`.** Réévalué dans le véritable hôte Tauri/WebView2 — étape **C** |
| **Contrôleurs de `TASK-0013` et `TASK-0014`** | **Aucun ne devient du code de production** |

**Quatre réserves s'ajoutent, et voyagent avec tout résultat cité :**

| Réserve | Ce qu'elle impose |
|---|---|
| `W1` | Toute citation de `G8` porte le **nombre d'échantillons** et la **corroboration sur toute la période**. Une valeur `ips régime stable` de **0** signifie « aucune image après le dernier changement », jamais « zéro image par seconde » |
| `W2` | **Aucune stabilité n'est prouvée.** Interdit d'écrire que le contrôleur corrigé est stable ou qu'il n'oscille pas |
| `W3` | **Le contrôle ponctuel `CAL-A` / `SYN-WIDE` ne valide rien** : il tient sur Edge, pas sur Chrome. Rien n'en est déductible pour WebView2 |
| `W4` | **Aucune marge alternative n'a été mesurée** — ni hystérésis, ni marge intermédiaire. Aucune valeur ne peut être supposée |

## TASK-0015 : la référence produit a été corrigée

**Instruction produit autoritative de Sébastien**, enregistrée dans
[`DEC-0015`](../decisions/DEC-0015-product-parity-and-layout-scope.md). Ce
point relève de la **direction produit** et **n'est pas délégué**.

1. **CarteTopo est la RÉFÉRENCE FONCTIONNELLE.**
2. **L'ancienne version publique de FileTopo est un prototype et un audit
   technique, PAS la référence produit.**
3. **FileTopo final doit généraliser le bon fonctionnement de CarteTopo à
   n'importe quelle arborescence ou « cerveau numérique ».**
4. **L'interface visuelle peut être entièrement modernisée** — formes,
   couleurs, typographie, panneaux, animations, organisation. **Aucune copie
   pixel pour pixel n'est demandée**; une nouvelle UX est **encouragée**.
5. **Aucune amélioration visuelle ne doit supprimer la parité fonctionnelle.**
   En cas de conflit, **la parité gagne**.

Le contrat exigible est
[`CARTETOPO_FUNCTIONAL_PARITY.md`](../product/CARTETOPO_FUNCTIONAL_PARITY.md) :
**22 exigences `P-01` à `P-22`**, chacune avec un critère falsifiable, plus
**trois invariants** — lecture seule absolue, rien de FileTopo dans
l'arborescence analysée, rien d'inventé silencieusement.

**Relations transversales, règle complète :** jamais inventées; provenance
**déterministe** ou **approbation utilisateur**, sans troisième origine;
provenance **visible à l'écran**; **stockage hors de l'arborescence analysée**;
une suggestion n'est pas une relation et ne compte pas dans les comptes
entrants/sortants.

### Quatre fonctions remontent, aucune ne descend

| Fonction | `TASK-0011` | Courante | Parité |
|---|---|---|---|
| `F-013` — panneau latéral masquable | `ULTÉRIEUR` | **`MVP`** | `P-12` |
| `F-017` — relations transversales | `ULTÉRIEUR` | **`MVP`** | `P-04` |
| `F-018` — mise en évidence | `ULTÉRIEUR` | **`MVP`** | `P-06` |
| `F-019` — relations entrantes/sortantes | `ULTÉRIEUR` | **`MVP`** | `P-05` |

**Répartition courante : `MVP` 35, `ULTÉRIEUR` 0, `DIFFÉRÉ` 4.** La matrice
reste à **39** lignes; aucune fonction n'a été inventée.

**IA, OCR, extraction de contenu, RAG et GraphRAG restent `DIFFÉRÉ`** —
`F-021`, `F-037`, `F-038`, `F-039`. `DEC-0012` est inchangée. **Aucune exigence
de parité ne peut être satisfaite au moyen de l'une de ces couches.**

### `CAL-B` cesse d'être lu comme un contrat

`DEC-0015` D supplante `DEC-0014` B **sur sa seule lecture produit** :
**`CAL-B` reste un candidat technique performant et une primitive de calepinage
possible; il n'est ni le contrat visuel, ni le contrat comportemental.** Ses
**mesures** et ses **trois restrictions obligatoires** — `V1`, `V2`, `R8` —
demeurent entières. **Aucune décision de layout ne peut supprimer une fonction
de la référence** : si un calepinage rend une exigence inatteignable, c'est
l'algorithme qui cède.

**HTML/SVG accessible reste une technologie candidate autorisée**, à valider
dans Tauri/WebView2. Canvas 2D et WebGL restent fermés.

**`DEC-0014` n'a pas été réécrite** : elle reçoit un **renvoi** en tête de
fiche, aucun de ses paragraphes n'a changé.

## Feuille de route courante — quatre étapes

| Étape | Objet | État |
|---|---|---|
| **A** | **Parité fonctionnelle MVP** — les 22 exigences prouvées sur fixtures synthétiques | **PROPOSED**, première tranche spécifiée par [`TASK-0016`](../tasks/TASK-0016-p4-vertical-slice.md) |
| **B** | **Finition visuelle moderne** — sans perdre une seule exigence, contrôlé en rejouant tous les critères de **A** | PROPOSED |
| **C** | **Validation Windows/WebView2 réelle** — hôte Tauri réel, mesures refaites dans le moteur de production. **`R8` ne peut être levée qu'ici.** Budget adaptatif réévalué ici | PROPOSED |
| **D** | **Empaquetage et publication** — décision de publier **réservée à Sébastien** | PROPOSED |

**La parité précède l'esthétique** : **B** ne commence pas avant que **A** soit
contrôlée.

## Ce qui n'a pas changé

- **Aucun budget n'est adopté.** Deux contrôleurs éprouvés, deux rejetés. Le
  **principe** est conservé, sans mécanisme.
- **Aucune réserve n'est levée.** `V1` à `V4`, `W1` à `W4`, `R2` à `R9` restent
  en vigueur. `R1` reste levée depuis `ACTION-0023`.
- **Canvas 2D n'est pas ouvert**, ni WebGL.
- **Aucune tentative WebView2** avant qu'un véritable hôte Tauri existe —
  `DEC-0014` F, inchangée.
- **L'échec de `B0` n'est pas corrigé** et le cache incrémental fautif est
  **conservé** — `DEC-0013` E.
- **L'inter-volume de `B3` reste NON TESTÉ**, la **question 3 de `B4` reste
  ouverte**.
- **`PROJECT_VISION.md` est inchangé.** Le contrat de parité en est
  l'application, pas une révision.

## Limites et risques

- **Aucune mesure de production.** Ni WebView2, ni `rusqlite`, ni application
  empaquetée. **Réserve `R8`, en vigueur et renforcée.**
- **`TASK-0015` est un livrable documentaire. Non testé :** aucun des 22
  critères de parité n'a été exécuté. Ce sont des **cibles à falsifier**.
- **Le reclassement augmente la charge du MVP** de quatre fonctions, dont un
  **modèle de provenance entièrement à écrire**. Aucune estimation d'effort
  n'est fournie, et aucune ne doit être supposée.
- **Manque déclaré `M-1` :** la **persistance des préférences** n'a pas de
  fonction propre dans la matrice; elle est répartie entre `F-012`, `F-013`,
  `F-022`, `F-033` et `F-034`. **Aucune fonction n'a été inventée pour le
  combler.**
- **Une seule machine** pour toutes les mesures existantes, nettement au-dessus
  d'un poste ordinaire, écran **240 Hz**, mode sans affichage. Plafond
  favorable.
- **Les temps d'image sont quantifiés** en marches de **4,1667 ms**. Les
  valeurs de **238,10** sont **butées**, pas mesurées.
- **`ips régime stable` est une grandeur fragile** — défaut `D1`, réserve `W1`.
- **Aucune stabilité n'est prouvée** — `G3` bloqué, réserve `W2`.
- **Le plancher de lisibilité de 2 400 px² est un choix, pas une mesure.**
- **Aucun lecteur d'écran réel.**
- **La causalité géométrique n'est pas établie** — réserve `V2`.

## Porte humaine

Les portes **P3** et **P3 bis** sont **franchies**. La porte **P4 est ouverte
et non franchie**.

`TASK-0015` a été livrée **`IMPLEMENTED`, jamais auto-déclarée `VERIFIED`**.
L'action unique suivante est **`ACTION-0025`** : le contrôle indépendant du
réalignement produit, **puis la décision de franchir `P4`**.

**Aucune ligne de code de production ne peut être écrite avant P4.**
[`TASK-0016`](../tasks/TASK-0016-p4-vertical-slice.md) est **`PROPOSED` et non
exécutée**. Les trois branches de spike ne sont ni fusionnées, ni destinées à
l'être automatiquement : les conserver, les fusionner ou les supprimer
appartient à Sébastien.
