# HANDOFF — passage de relais

- **Dernière mise à jour :** 2026-08-31
- **Branche active :** `spike/v0.2-budget-controller`, publiée sur origin
- **Dernière tâche vérifiée :** `TASK-0015`, **`VERIFIED`** le 2026-08-31, sur
  contrôle indépendant
  [`ACTION-0025`](../reviews/ACTION-0025-independent-control.md), **avec la
  réserve normative `X1`, corrigée**
- **Porte `P4` :** **FRANCHIE** —
  [`DEC-0016`](../decisions/DEC-0016-p4-gate-crossing-and-first-slice.md). Elle
  autorise **`TASK-0016`, et rien d'autre**
- **Tâche IN_PROGRESS :** aucune

## Où en est le projet

`ACTION-0024` a **clos** `TASK-0014` : contrôle **accepté**, `VERIFIED` sur
preuves, quatre réserves — **et la correction minimale du budget est
REJETÉE**. Deux contrôleurs de budget auto-régulé successifs ont maintenant été
éprouvés sur leurs propres critères; **les deux sont rejetés**. Le principe
reste une piste, mais **cesse d'être un prérequis à `P4`**.

`TASK-0015` a ensuite **corrigé la référence produit**. Le projet n'est plus
aligné sur son propre prototype : **CarteTopo est la référence fonctionnelle**,
et un **contrat de parité** de 22 exigences devient exigible.

`ACTION-0025` a **contrôlé** ce réalignement — contrôle **accepté**,
`TASK-0015` **`VERIFIED`** — et émis la réserve normative **`X1`**, corrigée
dans le même geste : **une suggestion n'est pas une provenance de relation**.

**Dans le même geste, la porte `P4` a été FRANCHIE**
([`DEC-0016`](../decisions/DEC-0016-p4-gate-crossing-and-first-slice.md)).
Elle autorise **`TASK-0016`, et rien d'autre** : une **tranche verticale**, sur
fixtures synthétiques, dans un **véritable hôte Tauri/WebView2**, **sans
budget adaptatif**, avec une **borne de charge déclarée d'avance**.

**Rien n'a encore été mesuré dans WebView2.** `R8` reste en vigueur; sa levée
appartient à l'**étape C**.

## Ce qu'il faut savoir en dix lignes

1. **CarteTopo est la RÉFÉRENCE FONCTIONNELLE.** L'**ancienne version publique
   de FileTopo est un prototype et un audit technique**, jamais la référence
   produit. « L'ancienne version ne le faisait pas » **n'est plus un argument
   recevable**.
2. **L'interface visuelle est entièrement libre** — formes, couleurs,
   typographie, panneaux, animations, organisation. **Aucune copie pixel pour
   pixel.** Une nouvelle UX est **encouragée**. **Mais aucune amélioration
   visuelle ne peut supprimer la parité fonctionnelle.** En cas de conflit,
   **la parité gagne**, et une suppression exige une fiche `DEC`.
3. **Le contrat exigible est
   [`CARTETOPO_FUNCTIONAL_PARITY.md`](../product/CARTETOPO_FUNCTIONAL_PARITY.md)** :
   22 exigences `P-01` à `P-22`, trois invariants `I-1` à `I-3`. **Non testé :
   aucun critère n'a été exécuté.**
4. **Quatre fonctions remontent** — `F-013`, `F-017`, `F-018`, `F-019`,
   d'`ULTÉRIEUR` à `MVP`. Répartition courante : **`MVP` 35, `ULTÉRIEUR` 0,
   `DIFFÉRÉ` 4**, sur 39 lignes. **IA, OCR, extraction, RAG et GraphRAG restent
   `DIFFÉRÉ`**, et **aucune exigence de parité ne peut être satisfaite au moyen
   de l'une de ces couches**.
5. **Les relations transversales ne sont jamais inventées** — corrigé par
   `X1` : une **relation établie** a pour provenance **`déterministe`** ou
   **`approuvée`**, **sans troisième valeur**; provenance **visible à
   l'écran**; stockage **hors de l'arborescence analysée**. Une **suggestion**
   est un **objet et un état distincts** — affichable, **jamais** présentée
   comme relation établie, **jamais** comptée dans les relations entrantes ou
   sortantes. L'approbation la **transforme** en relation `approuvée`.
6. **`CAL-B` n'est pas un contrat** — `DEC-0015` D. C'est un **candidat
   technique performant** et une **primitive de calepinage possible**. Ses
   mesures et ses trois restrictions — `V1`, `V2`, `R8` — demeurent. **Si un
   calepinage rend une exigence inatteignable, c'est l'algorithme qui cède.**
7. **Le budget adaptatif cesse d'être un prérequis à `P4`** — `DEC-0015` F.
   **Aucun contrôleur de `TASK-0013` ni de `TASK-0014` ne devient du code de
   production.** Interdit d'écrire qu'il est abandonné; interdit d'écrire qu'il
   est validé; interdit de fixer une constante de budget sans mesure.
8. **Aucune stabilité n'est prouvée** — réserve `W2`. `G3` est **bloqué** : sa
   mesure était **vacueuse par construction**. Ne jamais écrire que le
   contrôleur corrigé est stable.
9. **Aucune mesure de production n'existe encore.** `R8` en vigueur et
   renforcée : `B2`, `B2 bis` et `B2 ter` mesurent **Edge et Chrome**, jamais
   WebView2. Aucun de ces chiffres ne borne ce que FileTopo rendra.
10. **La feuille de route a quatre étapes** : **A** parité fonctionnelle MVP,
    **B** finition visuelle moderne, **C** validation Windows/WebView2 réelle,
    **D** empaquetage et publication. **La parité précède l'esthétique.**

## Gouvernance en vigueur

Depuis le 2026-08-31, les **GO techniques** viennent de l'**orchestrateur
technique**, sous délégation de Sébastien (`AGENTS.md`, section « Délégation
d'orchestration technique »). **Restent réservés à Sébastien**, sans
délégation : dépense, donnée réelle ou personnelle, publication externe
exceptionnelle (fusion vers `main`, PR, release, étiquette, nouveau distant),
opération destructive ou hors dépôt, **changement important de portée
produit**.

**Les points `A`, `B` et `C` de `DEC-0015` relèvent de ce dernier point** :
c'est **Sébastien** qui a décidé de la référence produit, du contrat de parité
et du reclassement. L'orchestrateur technique n'a décidé que des points `D`,
`E` et `F`.

## État Git

| Référence | SHA |
|---|---|
| `main` locale et distante | `91bbe90f0f99026c28cd345784d4f579a0016db2` — **non touchée** |
| `rebuild/v0.2-project-brain` locale et distante | `db8d3de0b20e7efbfe463a17c218cc14face39a8` — **non touchée** |
| `spike/v0.2-technical-risk-gates` locale et distante | `746f1b5f93c9d7085516c0e56473a95dc2c2d178` — **non touchée** |
| `spike/v0.2-render-budget` | `933bd0d5e7e05e4e7fe233c5fc6b9320a194264d` — **non touchée** depuis la clôture de `TASK-0013` |
| `spike/v0.2-budget-controller` | branche de travail de `TASK-0014` puis `TASK-0015`, voir `git rev-parse HEAD`, égal à `origin/` |

Aucune fusion, aucune PR, aucune release, aucune étiquette, aucun `force push`,
aucune réécriture d'historique, aucune suppression de branche.

## Points ouverts

| # | Point | Ce qui est demandé |
|---|---|---|
| 1 | **`TASK-0015` est `VERIFIED`** | Clos par `ACTION-0025`, avec la réserve normative **`X1`**, **corrigée**. Le contrat de parité reste **non testé** |
| 2 | **`TASK-0016` est `APPROVED`** | `P4` est **franchie**. Les critères `H1` à `H11`, les fixtures et la **borne de charge** se figent **avant** la première ligne de code, et **ne se retouchent pas** après le premier résultat |
| 3 | **Aucun critère de parité n'a été exécuté** | Les 22 exigences sont des **cibles à falsifier**. Un `MVP` impossible à tenir **redescend par décision écrite**, jamais par omission |
| 4 | **Manque `M-1`** — persistance des préférences sans fonction propre | Une révision de la matrice devra créer une fonction ou rattacher explicitement chaque valeur. **Aucune fonction n'a été inventée** |
| 5 | **Charge accrue du MVP** | Quatre fonctions de plus, dont un **modèle de provenance entièrement à écrire**. Aucune estimation d'effort n'existe |
| 6 | **Réserves `W1` à `W4`** d'`ACTION-0024` | Toutes en vigueur |
| 7 | **Réserves `V1` à `V4`** d'`ACTION-0023` | Toutes en vigueur. Aucune levée par `TASK-0014` ni `TASK-0015` |
| 8 | **Réserve `R8`** | En vigueur, **renforcée**. `R1` levée; `R2` à `R7` et `R9` inchangées. **`R8` ne peut être levée qu'à l'étape C** |
| 9 | **WebView2 non mesuré** | `DEC-0014` F visait l'absence d'**hôte embarqueur**. Cet hôte est le premier livrable de `TASK-0016`; hors de lui, aucune tentative |
| 10 | **`B3` inter-volume, `B0` échec, `B4` question 3** | Inchangés : écrire hors du dépôt reste réservé à Sébastien; le cache fautif est conservé; la question 3 se ferme avant l'identité persistante |

## Prochaine action unique

**Figer puis exécuter `TASK-0016`** — la première tranche verticale de
production, sur la branche `build/v0.2-p4-vertical-slice`. Détail dans
[NEXT_ACTION.md](NEXT_ACTION.md).

## Commandes sûres

    git rev-parse --show-toplevel
    git branch --show-current
    git rev-parse HEAD
    git status --short
    git log --oneline db8d3de..HEAD
    git diff --stat db8d3de -- src src-tauri tests public scripts .github graph

La dernière doit rendre **une sortie vide** : aucun fichier de production n'a
changé.

Pour rejouer les bancs d'essai, voir
[`spikes/b2ter-budget-controller/README.md`](../../spikes/b2ter-budget-controller/README.md)
et
[`spikes/b2bis-layout-and-budget/README.md`](../../spikes/b2bis-layout-and-budget/README.md).
Les mesures brutes ne sont **pas** commitées : elles vivent sous
`spikes/.work/`, ignoré par Git, et sont reproductibles depuis la graine fixe
`20260831`.

## Message court pour Claude Code

Lis seulement CLAUDE.md, docs/ai/START_HERE.md, docs/ai/CURRENT_STATE.md et
docs/ai/NEXT_ACTION.md. `TASK-0012`, `TASK-0013` et `TASK-0014` sont **closes
et `VERIFIED`**; `TASK-0015` est **`IMPLEMENTED` et attend un contrôle
indépendant**; `TASK-0016` est **`PROPOSED` et ne s'exécute pas**.

**La référence produit est CarteTopo**, pas l'ancienne version publique de
FileTopo. Le contrat exigible est `docs/product/CARTETOPO_FUNCTIONAL_PARITY.md`.
**Le visuel est libre; la parité fonctionnelle ne l'est pas.**

Les arbitrages en vigueur sont dans `DEC-0013`, `DEC-0014` et `DEC-0015`.
**Aucun budget n'est adopté** et **aucun contrôleur de spike ne devient du code
de production**. **Ne rejoue aucun banc d'essai** sans GO et **ne t'attribue pas
`VERIFIED`**.

**La porte `P4` est franchie** : le code de production est autorisé, **pour
`TASK-0016` seulement** et dans son périmètre écrit. **N'ouvre pas Canvas 2D
ni WebGL.** **Ne mesure WebView2 que dans l'hôte Tauri réel** construit par la
tranche. **Ne corrige pas l'échec de `B0` et
ne supprime rien** dans `src-tauri/target/`. **Ne teste pas l'inter-volume.**
**Ne retouche aucune preuve** de `TASK-0012` à `TASK-0014`, ni le texte de
`DEC-0014`. Ne fusionne rien, ne crée ni PR, ni release, ni étiquette.
