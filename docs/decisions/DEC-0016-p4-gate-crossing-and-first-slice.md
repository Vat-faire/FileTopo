# DEC-0016 — Franchissement de la porte P4, correction normative X1 et autorisation de la première tranche

- **Date :** 2026-08-31
- **Statut :** `APPROVED`
- **Phase :** ouverture de l'étape **A** de la feuille de route — parité
  fonctionnelle MVP, première tranche
- **Décideur :** **orchestrateur technique**, sous la délégation explicite de
  Sébastien du 2026-08-31 (voir [AGENTS.md](../../AGENTS.md), section
  « Délégation d'orchestration technique »). `P4` est une **porte technique**,
  définie par `TASK-0012` §18. **Sébastien peut la reprendre à tout moment.**
- **Fondée sur :** [ACTION-0025](../reviews/ACTION-0025-independent-control.md)
- **replaced_by :** —
- **Supplante :** rien. Elle **complète** `DEC-0015` en tirant la conséquence
  de son contrôle.

> **Cette fiche ne mesure rien** et **n'exécute rien.**
>
> **Elle ne réécrit aucun historique** : ni `DEC-0014`, ni `DEC-0015`, ni
> aucune preuve de `TASK-0012` à `TASK-0014`.
>
> **Elle ne lève aucune réserve.** `V1` à `V4`, `W1` à `W4`, `R2` à `R9`
> restent en vigueur; `R1` reste levée depuis `ACTION-0023`.

## Contexte

`TASK-0015` a réaligné le produit sur la **référence fonctionnelle CarteTopo**
et livré un **contrat de parité** de 22 exigences, `IMPLEMENTED` et non
vérifié. `NEXT_ACTION.md` faisait du contrôle de ce livrable et de la décision
sur `P4` une **seule action**, au motif que franchir la porte avant d'avoir
jugé le contrat autoriserait du code contre une cible non contrôlée.

`ACTION-0025` a mené ce contrôle. Il est **accepté**, avec une réserve
normative `X1` **corrigée dans le même geste**.

Quatre points sont arbitrés ici, et seulement quatre.

## Décision

| # | Objet | Ce qui est retenu |
|---|---|---|
| A | Statut de `TASK-0015` | **`VERIFIED`**, sur contrôle indépendant, **avec la réserve `X1`, corrigée** |
| B | Correction normative `X1` | Une **suggestion n'est pas une provenance de relation**. Une **relation établie** a pour provenance `déterministe` **ou** `approuvée`, sans troisième valeur. Une suggestion est un **objet et un état distincts**, **affichable**, **jamais comptée comme relation** avant approbation |
| C | Porte `P4` | **FRANCHIE.** Elle autorise l'approbation puis l'exécution de **`TASK-0016`**, et **rien d'autre** |
| D | Échéance du manque `M-1` | **Ne bloque pas `P4`.** Doit être **résolu avant la tranche qui implémente réellement la persistance complète des préférences** (`P-19`) |

---

## A. `TASK-0015` est `VERIFIED`

Le contrôle indépendant `ACTION-0025` est accepté. `TASK-0015` passe de
`IMPLEMENTED` à **`VERIFIED`**, par une instance **distincte de son
exécuteur**, conformément à `AGENTS.md`.

**`VERIFIED` porte sur la qualité du livrable documentaire, pas sur la
faisabilité du contrat de parité.** Aucun des 22 critères n'a été exécuté :
ce sont des **cibles à falsifier** (manque `M-4` du contrat, réserve `M-5` sur
la performance). Un critère qui s'avérerait intenable devra **redescendre par
décision écrite**, jamais par omission.

**Ce qui est accepté avec ce statut, et reste inchangé :**

- **CarteTopo est la référence FONCTIONNELLE** de FileTopo;
- **l'apparence de FileTopo reste libre** et **peut être entièrement
  modernisée** — formes, couleurs, typographie, panneaux, animations,
  organisation. **Aucune copie pixel pour pixel n'est demandée.** En cas de
  conflit entre une intention visuelle et une exigence de parité, **la parité
  gagne**, et l'intention visuelle est réalisée autrement;
- **`F-013`, `F-017`, `F-018` et `F-019` restent `MVP`**;
- **IA, OCR, extraction de contenu, RAG et GraphRAG restent `DIFFÉRÉ`** —
  `F-021`, `F-037`, `F-038`, `F-039`. `DEC-0012` est **inchangée**, et
  **aucune exigence de parité ne peut être satisfaite au moyen d'une de ces
  couches**.

## B. Correction normative `X1`

**Le défaut.** Le contrat employait `suggérée` comme **troisième valeur de
provenance** d'une relation, en §4 (`P-04`) et en §5.1.2 — alors que §5.1.3
établit qu'**une suggestion n'est pas une relation**. La même chose y était à
la fois relation et non-relation.

**Ce n'est pas une querelle de mots.** Une provenance `suggérée` autorise, à
la lettre, un modèle de données où une suggestion est **une ligne de la table
des relations**. Tout compte de relations entrantes et sortantes (`P-05`)
devient alors un piège : il faut se souvenir d'exclure une valeur
d'énumération, et l'oubli est silencieux — exactement ce que l'invariant `I-3`
interdit.

**Ce qui est désormais normatif :**

1. **Relation établie** ⇒ provenance **`déterministe`** ou **`approuvée`**.
   **Il n'existe aucune troisième provenance.**
2. **Suggestion** ⇒ **objet et état distincts**, jamais une valeur de
   provenance. Elle **ne compte dans aucun compte de relations** entrantes ou
   sortantes tant qu'elle n'est pas approuvée.
3. **Une suggestion peut être affichée** — sur la carte comme dans les
   panneaux; c'est même souhaitable, sans quoi elle ne serait pas
   approuvable — mais **jamais présentée comme une relation établie**, et elle
   reste distinguable **sans recourir à la seule couleur**.
4. **L'approbation transforme** la suggestion en relation de provenance
   `approuvée`. **C'est la seule voie.** Toute relation approuvée reste
   **révocable**.

**Ce que la correction n'a pas fait.** Elle n'a **changé aucune portée**,
n'a **ajouté ni retiré aucune exigence**, et n'a touché que les formulations
**directement contradictoires**. §5.2 — qui interdisait déjà de présenter une
suggestion comme établie — est **conservée telle quelle**. **Aucun historique
n'a été réécrit.**

**Conséquence obligatoire pour tout code futur.** Le modèle de données rend
**non représentable** une relation établie sans provenance `déterministe` ou
`approuvée`, et **ne range pas** les suggestions parmi les relations établies
sans un état qui les en sépare structurellement.

**Portée immédiate : nulle.** `TASK-0016` ne contient **aucune relation
transversale**. `X1` contraint la tranche qui implémentera `P-04`, `P-05` et
`P-07`, pas la première.

## C. La porte `P4` est FRANCHIE

**`P4` est FRANCHIE.**

**Ce qu'elle autorise :** l'**approbation puis l'exécution de
[`TASK-0016`](../tasks/TASK-0016-p4-vertical-slice.md)** — une **tranche
verticale minimale**, sur **fixtures synthétiques**, dans un **véritable hôte
Tauri/WebView2**, **sans budget adaptatif**, avec une **borne de charge
déclarée avant exécution** — dans le périmètre écrit de sa §4, et **rien
d'autre**.

**Ce qu'elle n'autorise pas**, explicitement :

| Interdit | Fondement |
|---|---|
| Toute **autre** tâche d'implémentation | Une tranche suivante exige sa propre fiche et son propre GO |
| Tout **élargissement** au-delà de §4 de `TASK-0016` — relations transversales, recherche, filtres, légende, surveillance, journal, vu/non vu, plusieurs cerveaux, bilinguisme intégral | `TASK-0016` §4 et §7.6 |
| Tout **budget de rendu adaptatif**, et toute **reprise** d'un contrôleur de `TASK-0013` ou `TASK-0014` | `DEC-0015` F |
| **Canvas 2D** et **WebGL** | `DEC-0013` C, `DEC-0015` E |
| Tout **sélecteur de dossier réel**, toute **donnée réelle**, toute **dépense**, toute **publication externe exceptionnelle**, toute **opération destructive ou hors dépôt** | Points d'arrêt **réservés à Sébastien**, `AGENTS.md` — **inchangés** |
| Toute **suppression ou altération** de `src-tauri/target/` | `DEC-0013` E |
| Toute **levée de réserve** | `R8` en particulier ne peut être levée qu'à l'**étape C** |

**Ce que le franchissement ne présume pas.** Il ne présume ni que le contrat
de parité est tenable, ni que HTML/SVG accessible suffira dans WebView2, ni
qu'une performance quelconque sera atteinte. Il constate que **la cible est
écrite et contrôlée**, et que la seule façon d'en apprendre davantage est
désormais d'écrire du code et de mesurer dans le moteur de production.

**Les premières mesures dans WebView2 sont un point de comparaison, pas une
validation.** `R8` porte sur la transposabilité à la production dans son
ensemble; sa levée appartient à l'**étape C**.

## D. Échéance du manque `M-1`

**`M-1` — la persistance des préférences n'a pas de fonction propre dans la
matrice — ne bloque pas `P4`.** Le déclarer était le bon geste : inventer une
ligne de matrice pour combler un trou de couverture aurait produit une matrice
fausse.

**Mais il porte désormais une échéance :** `M-1` **doit être résolu avant la
tranche qui implémente réellement la persistance complète des préférences**,
c'est-à-dire avant que `P-19` soit tenue. Le résoudre veut dire, au choix :

1. **créer une fonction propre** dans la matrice, par décision écrite; **ou**
2. **rattacher explicitement chaque valeur** — vue, panneau, filtres, légende,
   densité, langue, options d'accessibilité, sélection, état vu/non vu — à une
   fonction existante, par décision écrite.

**Aucune fonction n'est inventée par la présente fiche.** La matrice reste à
**39** lignes.

---

## Conséquences

- **`TASK-0015`** : `IMPLEMENTED` → **`VERIFIED`**, avec `X1` corrigée.
- **`CARTETOPO_FUNCTIONAL_PARITY.md`** : corrigé sur `X1`, **portée
  inchangée**. Il reste le **contrat produit courant**.
- **`TASK-0016`** : peut passer à **`APPROVED`**, puis être **figée** —
  critères `H1` à `H11` complets, fixtures et borne de charge déclarées —
  **avant toute modification de code**. Elle se terminera **`IMPLEMENTED`**,
  jamais `VERIFIED`.
- **`DEC-0015`** : **inchangée**, et confirmée dans tous ses points.
- **`DEC-0014`** : **inchangée**. Ses mesures et ses trois restrictions
  obligatoires `V1`, `V2`, `R8` demeurent. Son point `F` — aucune tentative
  d'instrumentation de WebView2 **avant qu'un véritable hôte Tauri existe** —
  cesse d'être bloquant **par la construction de cet hôte**, qui est
  précisément le premier livrable de `TASK-0016`, et **jamais autrement**.
- **`DEC-0013`** : **inchangée**. `E` en particulier : le cache incrémental
  fautif de `src-tauri/target/` est **conservé**, et l'échec de `B0` n'est
  **pas** corrigé par `TASK-0016`.
- **`DEC-0012`** : **inchangée**.
- **Réserves** : aucune n'est levée. `V1` à `V4`, `W1` à `W4`, `R2` à `R9` en
  vigueur.
- **Étape B de la feuille de route** — finition visuelle moderne — **ne
  commence pas** : la parité précède l'esthétique.

## Preuves

| # | Fait | Source | Consultée le |
|---|---|---|---|
| U1 | Contrôle indépendant de `TASK-0015` accepté; réserve `X1`; `P4` franchie | [ACTION-0025](../reviews/ACTION-0025-independent-control.md) | 2026-08-31 |
| U2 | Contradiction interne : `suggérée` employée comme provenance en §4 `P-04` et §5.1.2, contre §5.1.3 | [CARTETOPO_FUNCTIONAL_PARITY.md](../product/CARTETOPO_FUNCTIONAL_PARITY.md), état avant correction, historique Git | 2026-08-31 |
| U3 | `P4` est une **porte technique** — « autoriser la première tâche d'implémentation, après lecture des verdicts » | [TASK-0012](../tasks/TASK-0012-technical-risk-gates.md) §18 | 2026-08-31 |
| U4 | Le budget adaptatif **cesse d'être un prérequis à `P4`**; aucun contrôleur de spike ne devient du code de production | [DEC-0015](DEC-0015-product-parity-and-layout-scope.md) F | 2026-08-31 |
| U5 | WebView2 non instrumentable **sans hôte embarqueur**; écart avec Edge et Chrome **NON MESURÉ** | [DEC-0014](DEC-0014-layout-baseline-and-budget-direction.md) F | 2026-08-31 |
| U6 | `TASK-0016` est une tranche verticale, six exigences couvertes, borne de charge exigée avant exécution | [TASK-0016](../tasks/TASK-0016-p4-vertical-slice.md) §4 et §5.2 | 2026-08-31 |

## Limites

- **Cette fiche ne mesure rien.** Elle arbitre sur un contrôle documentaire.
- **Le contrat de parité reste non testé.** Ses 22 critères sont des cibles.
- **Aucune mesure de production n'existe encore.** `R8` en vigueur.
- **`M-1` est déclaré et daté, pas comblé.**
- **La question 3 de `B4` reste ouverte**, l'**inter-volume de `B3` reste NON
  TESTÉ**, l'**échec de `B0` n'est pas corrigé** — `DEC-0013` D, E, F
  inchangées.
- **Aucune estimation d'effort** n'accompagne l'étape `A`, et aucune ne doit
  être supposée.
