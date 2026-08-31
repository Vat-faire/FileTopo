# DEC-0015 — Parité fonctionnelle CarteTopo, portée de CAL-B et sort du budget adaptatif

- **Date :** 2026-08-31
- **Statut :** `APPROVED`
- **Phase :** réalignement produit — après le contrôle indépendant
  [ACTION-0024](../reviews/ACTION-0024-independent-control.md)
- **Décideurs :** **Sébastien** pour les points `A`, `B` et `C` — **direction
  produit, non déléguée**; **orchestrateur technique** pour les points `D`, `E`
  et `F`, sous la délégation du 2026-08-31 inscrite dans
  [AGENTS.md](../../AGENTS.md)
- **replaced_by :** —
- **Supplante :** [DEC-0014](DEC-0014-layout-baseline-and-budget-direction.md)
  **sur deux points seulement** — la **lecture produit** de son point `B`, et
  le **statut de prérequis** de son point `E`. **Tout le reste de `DEC-0014`
  demeure en vigueur**, et son texte est **conservé intact**.

> **Cette fiche ne mesure rien.** Elle arbitre sur l'instruction produit de
> Sébastien et sur les preuves déjà publiées par `TASK-0013` et `TASK-0014`,
> avec **toutes** les limites que celles-ci déclarent.
>
> **Elle ne réécrit aucun historique.** `DEC-0014` reçoit un **renvoi** vers
> cette fiche; aucun de ses paragraphes n'est modifié.
>
> **Elle n'autorise aucune ligne de code de production.** La porte **`P4`
> reste ouverte et non franchie**.

## Contexte

Deux constats convergent au 2026-08-31.

**Côté produit.** Le périmètre de la reconstruction avait été arrêté par
`TASK-0011` en prenant pour point de comparaison **l'ancienne version publique
de FileTopo**. Sébastien établit que ce point de comparaison est erroné :
l'ancienne version est un **prototype et un audit technique**, pas la référence
produit. La **référence fonctionnelle est CarteTopo**. Quatre fonctions
avaient, en conséquence, été classées trop bas.

**Côté technique.** `ACTION-0024` a clos `TASK-0014` : deux contrôleurs de
budget auto-régulé successifs ont été éprouvés sur leurs propres critères, et
**tous deux sont rejetés**. La cause mesurée du second échec — les deux bornes
de la zone morte tombant exactement sur un pas de synchronisation verticale de
4,1667 ms — est une **propriété du moteur et de l'écran du banc**, pas du
mécanisme. Continuer à le régler dans Edge et Chrome n'apprendrait rien sur le
moteur de production.

Six points sont arbitrés ici, et seulement six.

## Décision

| # | Objet | Ce qui est retenu | Décideur |
|---|---|---|---|
| A | Référence produit | **CarteTopo est la référence fonctionnelle.** L'ancienne version publique de FileTopo est un **prototype et audit technique**, jamais la référence produit | Sébastien |
| B | Contrat de parité | [`CARTETOPO_FUNCTIONAL_PARITY.md`](../product/CARTETOPO_FUNCTIONAL_PARITY.md) devient le **contrat produit courant**, avec ses 22 exigences `P-01` à `P-22` et ses trois invariants | Sébastien |
| C | Reclassement | **`F-013`, `F-017`, `F-018` et `F-019` deviennent nécessaires à la parité** et passent d'`ULTÉRIEUR` à `MVP`. **IA, OCR, extraction, RAG et GraphRAG restent `DIFFÉRÉ`** | Sébastien |
| D | Portée de `CAL-B` | **`CAL-B` reste un candidat technique performant et une primitive possible. Il n'est ni le contrat visuel, ni le contrat comportemental de FileTopo** | Orchestrateur |
| E | Technologie de rendu | **HTML/SVG accessible reste une technologie candidate autorisée.** Le rendu réel sera **validé dans Tauri/WebView2** | Orchestrateur |
| F | Budget adaptatif | **Reste une piste. Cesse d'être un prérequis à `P4`.** Réévalué dans le véritable hôte Tauri/WebView2 avant la validation de performance finale. **Aucun contrôleur de `TASK-0013` ou `TASK-0014` ne devient du code de production** | Orchestrateur |

---

## A. CarteTopo est la référence fonctionnelle

**Retenu :** la référence fonctionnelle de FileTopo est **CarteTopo**.
**L'ancienne version publique de FileTopo — la 0.1 alpha — est un prototype et
un audit technique.** Elle n'est pas, et n'a jamais été, la référence produit.

**Motif.** La 0.1 alpha a servi à établir ce qui **ne** fonctionnait pas : sa
carte de points artificielle, sa persistance partielle et l'absence de
surveillance sont documentées dans
[le bilan alpha](../archive/v0.1-alpha/BASELINE_ASSESSMENT.md) et dans
[FEATURE_MATRIX.md](../product/FEATURE_MATRIX.md). Un audit de ce qui manque
est un point de départ utile; ce n'est pas une cible.

**Conséquence obligatoire :** aucune décision de périmètre ne peut être
justifiée par « l'ancienne version ne le faisait pas ». Ce n'est plus un
argument recevable.

**Ce que cette décision ne fait pas.** Elle ne déprécie pas les preuves
techniques du prototype dans leur portée d'origine, ne retire rien de
`PROJECT_VISION.md`, et n'ouvre aucun accès à la référence privée —
`AGENTS.md` reste entier.

## B. Le contrat de parité devient le contrat produit courant

**Retenu :** [`CARTETOPO_FUNCTIONAL_PARITY.md`](../product/CARTETOPO_FUNCTIONAL_PARITY.md)
est le **contrat produit courant**. Ses **22 exigences** `P-01` à `P-22` et ses
**trois invariants** `I-1` à `I-3` sont exigibles.

**La règle centrale du contrat, reprise ici :** **l'interface visuelle est
entièrement libre — formes, couleurs, typographie, panneaux, animations,
organisation —, et aucune amélioration visuelle ne peut supprimer la parité
fonctionnelle.** En cas de conflit, **la parité gagne**, et l'intention
visuelle doit être réalisée autrement. Une exigence ne peut disparaître que par
une **fiche `DEC`**, jamais par omission silencieuse.

**Non testé.** Aucun critère du contrat n'a été exécuté. Ce sont des cibles à
falsifier.

## C. Quatre fonctions remontent au rang de parité

**Retenu :**

| Fonction | Classification `TASK-0011` | Nouvelle classification | Motif |
|---|---|---|---|
| `F-013` — panneau latéral masquable | `ULTÉRIEUR` | **`MVP`** | Le motif d'origine — « masquer le panneau est un gain d'espace » — supposait que la référence produit tolérait un panneau fixe. Sur la référence fonctionnelle, le masquage **et la restitution intégrale de l'état** font partie du geste de navigation. Exigence `P-12` |
| `F-017` — relations transversales | `ULTÉRIEUR` | **`MVP`** | Le motif d'origine — « une carte hiérarchique fidèle est déjà utile » — reste vrai, mais décrit un produit **en deçà** de la référence. Les relations transversales avec provenance sont un comportement de la référence, pas un enrichissement. Exigence `P-04` |
| `F-018` — mise en évidence | `ULTÉRIEUR` | **`MVP`** | Elle était classée en aval de `F-017`; `F-017` remontant, elle remonte. Elle sert **aussi** la hiérarchie : accentuer parent et enfants directs, atténuer le reste, est un comportement de parité indépendant des relations transversales. Exigence `P-06` |
| `F-019` — relations entrantes/sortantes | `ULTÉRIEUR` | **`MVP`** | Même dépendance. Une relation dont la direction n'est pas lisible est une information incomplète. Exigence `P-05` |

**Répartition après reclassement :** `MVP` **35**, `ULTÉRIEUR` **0**, `DIFFÉRÉ`
**4**. Total **39**, sans trou ni doublon.

**Ce qui ne remonte pas, explicitement.** `F-021` recherche par sujet ou rôle,
`F-037` extraction de contenu et OCR, `F-038` RAG cité, `F-039` GraphRAG
**restent `DIFFÉRÉ`**. `DEC-0012` — frontière `F-D`, aucune IA dans le noyau
MVP — est **inchangée**. Aucune exigence de parité ne peut être satisfaite au
moyen d'une de ces couches.

**Ce que ce reclassement coûte, et il faut le dire.** Il **augmente** la charge
du MVP de quatre fonctions, dont une — `F-017` — apporte un **modèle de
provenance** qui n'existait dans aucune décision d'implémentation à ce jour.
`DEC-0009` en fixe déjà les principes (`R-C`); leur mise en œuvre reste
entièrement à écrire. La feuille de route en tient compte : l'étape **A** est
plus longue qu'avant cette décision.

## D. `CAL-B` : une primitive technique, pas un contrat

**Retenu :** **`CAL-B`, le pavage squarifié, reste un candidat technique
performant et une primitive de calepinage possible. Il n'est ni le contrat
visuel, ni le contrat comportemental de FileTopo.**

**Ce qui est supplanté.** `DEC-0014` B écrivait que `CAL-B` « devient la
direction baseline » pour la carte en blocs. **Cette formulation est
supplantée** en tant que **lecture produit** : elle a été prise sur un critère
unique — la vitesse de rendu à nombre de nœuds DOM égal — et ne peut pas tenir
lieu de spécification de ce que la carte doit **montrer** et **permettre**.

**Ce qui demeure.** Les **mesures** de `DEC-0014` B restent valides dans leur
portée d'origine et ne sont pas retouchées : à nombre de nœuds DOM identique,
`CAL-B` rend `SYN-WIDE` bien plus vite que `CAL-A`, et ramène le rapport
d'aspect médian de 3 987,79 à 1,01. Les trois restrictions obligatoires de
`DEC-0014` B **restent entières** : la **causalité géométrique n'est pas
établie** (`V2`), le **nombre littéral de `F1` n'a pas été mesuré** (`V1` — le
scénario demandé à 3 000 blocs en construit **2 856**, et le résultat tient sur
une charge supérieure de **5 012 blocs visibles**), et **`CAL-B` n'est pas
mesuré dans le moteur de production** (`R8`).

**Les trois règles qui découlent de `D` :**

1. **Aucune décision de layout ne peut supprimer une fonction de la
   référence.** Si un algorithme de calepinage rend une exigence `P-01` à
   `P-22` inatteignable, **c'est l'algorithme qui cède**, pas l'exigence.
2. **`CAL-B` n'impose aucune apparence.** Rien n'oblige la carte finale à
   ressembler à un pavage de rectangles squarifiés : c'est une manière de
   **calculer des positions**, pas une manière de **dessiner**.
3. **`CAL-B` n'est pas le seul candidat.** Un autre calepinage — ou une
   combinaison — reste recevable s'il satisfait la parité. `CAL-B` est le
   candidat le mieux mesuré à ce jour, et rien de plus.

**Conservé de `DEC-0014` B :** le **coût de calepinage est un coût
d'indexation**, payé une fois par arborescence, jamais un coût par image.

## E. HTML/SVG accessible reste une technologie candidate autorisée

**Retenu :** **HTML/SVG accessible reste une technologie candidate
autorisée** pour le rendu. **Le rendu réel sera validé dans Tauri/WebView2.**

**Motif conservé.** L'acquis d'accessibilité mesuré par les spikes est réel —
conformité ARIA et clavier sur 32 scénarios sur 32 dans `B2 bis`, aucune
régression sur 50 exécutions dans `B2 ter` — et Canvas 2D devrait le
reconstruire entièrement. **Limite conservée :** aucun lecteur d'écran réel n'a
été employé; la conformité porte sur les attributs produits et sur
`document.activeElement`.

**Ce qui est précisé par rapport à `DEC-0014` C.** « Direction » devient
« technologie candidate autorisée ». La nuance est délibérée : la technologie
de rendu **n'est pas définitivement arrêtée tant qu'elle n'a pas été validée
dans le moteur de production**. Canvas 2D et WebGL **restent fermés** — rien
dans les campagnes ne justifie de les rouvrir —, mais leur fermeture est
motivée par l'absence de besoin démontré, pas par une victoire mesurée de
HTML/SVG dans WebView2, qui n'a **jamais été mesuré**.

## F. Le budget adaptatif reste une piste, et cesse d'être un prérequis

**Retenu :** le principe d'un budget de rendu adaptatif **reste une piste**.
Il **cesse d'être un prérequis à la porte `P4`**. Il sera **réévalué dans le
véritable hôte Tauri/WebView2**, avant la validation de performance finale —
étape **C** de la feuille de route.

**Aucun contrôleur de `TASK-0013` ni de `TASK-0014` ne devient du code de
production.** Ce sont des prototypes jetables de spike.

**Motif.** Deux contrôleurs ont été éprouvés sur des critères écrits avant
mesure; les deux sont rejetés. La cause mesurée du second échec est une
propriété **du moteur et de l'écran du banc** — un pas de synchronisation
verticale de 4,1667 ms sur lequel tombent exactement les deux bornes de la zone
morte —, pas une propriété du mécanisme. Une troisième itération dans Edge et
Chrome ajusterait un mécanisme à un banc plutôt qu'à un produit.

**Ce qui est conservé, et qui n'est pas rien :** le plancher de lisibilité tient
absolument — niveau 13 sur 13, exactement 2 400 px², jamais franchi, sur les
deux moteurs et toutes les exécutions —; le déterminisme est vérifié par rejeu
hors navigateur de 95 traces réelles, zéro divergence; l'accessibilité ne
régresse pas après les changements de niveau.

**Ce qui est interdit d'écrire ou de faire :**

- écrire que le budget adaptatif est **abandonné** — il ne l'est pas;
- écrire qu'il est **validé** — il ne l'est pas;
- écrire que le contrôleur corrigé est **stable** — réserve `W2` : `G3` est
  bloqué, la mesure était vacueuse par construction, **aucune stabilité n'est
  prouvée**;
- **reprendre** l'un des deux contrôleurs, en tout ou en partie;
- **fixer une nouvelle constante de budget sans mesure**;
- supposer quoi que ce soit d'une **marge alternative** ou d'une **hystérésis**
  — réserve `W4` : aucune n'a été mesurée.

**Ce que cela impose à la première tranche de production.** Une tranche qui
n'embarque pas de budget adaptatif **doit borner sa charge autrement, et le
déclarer explicitement** — par exemple par une profondeur ou une volumétrie de
fixture bornée et écrite dans la fiche. Elle **ne peut pas** se contenter de ne
rien dire.

---

## Conséquences

- **`DEC-0014` B** : sa **lecture produit** est supplantée par `D`. Ses
  **mesures** et ses **trois restrictions obligatoires** demeurent.
- **`DEC-0014` C** : précisé par `E` — « technologie candidate autorisée »
  plutôt que « direction »; Canvas 2D et WebGL restent fermés.
- **`DEC-0014` D** : **étendue**. Le contrôleur de `TASK-0014` rejoint celui de
  `TASK-0013` parmi les mécanismes non adoptés.
- **`DEC-0014` E** : le principe reste conservé, mais **perd son statut de
  prérequis** à `P4` — point `F`.
- **`DEC-0014` F** : **inchangée**. Aucune tentative d'instrumentation de
  WebView2 avant qu'un véritable hôte Tauri existe. Cet hôte est précisément
  ce que l'étape **C** de la feuille de route doit produire.
- **`DEC-0012`** : **inchangée**. Aucune IA, extraction, embeddings, RAG ni
  GraphRAG dans le noyau MVP.
- **`DEC-0009`** : ses principes de relations (`R-C`) deviennent **exigibles au
  MVP** par le point `C`; leur mise en œuvre reste entièrement à écrire.
- **`REQUIREMENTS_BASELINE.md`** et **`FEATURE_MATRIX.md`** sont amendés par
  `TASK-0015`, avec la classification antérieure **conservée et visible**.
- **`ROADMAP.md`** reçoit les quatre étapes `A` à `D`.
- **Aucune ligne de code de production n'est autorisée par cette fiche.** La
  porte **`P4` reste ouverte et non franchie**.

## Preuves

| # | Fait | Source | Consultée le |
|---|---|---|---|
| T1 | Instruction produit autoritative : CarteTopo est la référence fonctionnelle; l'ancienne version publique est un prototype/audit; liberté visuelle sans perte de parité; reclassement de `F-013` et `F-017` à `F-019` | **Sébastien**, 2026-08-31 | 2026-08-31 |
| T2 | `TASK-0014` `VERIFIED` avec réserves `W1` à `W4`; correction minimale **REJETÉE**; `G3` bloqué accepté; budget adaptatif retiré des prérequis à `P4` | [ACTION-0024](../reviews/ACTION-0024-independent-control.md) | 2026-08-31 |
| T3 | `G1` réfutée : `SYN-DEEP` tombe à **9,98 ips** en régime stable sur Edge, pire exécution | [journal §6.1](../research/TASK-0014-b2-ter-results.md), [PERF-0005](../performance/PERF-0005-b2ter-budget-controller.md) | 2026-08-31 |
| T4 | `G2` réfutée : dernier changement de niveau jusqu'à **13 306,4 ms** après le choc, contre 2 000 ms exigées | [journal §6.1 et §6.2](../research/TASK-0014-b2-ter-results.md) | 2026-08-31 |
| T5 | Les deux bornes de la zone morte tombent exactement sur un pas de synchronisation verticale de **4,1667 ms**; 5,8 % des fenêtres sur Edge et 10,7 % sur Chrome se présentent sur la borne haute | [journal §7](../research/TASK-0014-b2-ter-results.md) | 2026-08-31 |
| T6 | Plancher de lisibilité : niveau 13/13, exactement 2 400 px², jamais franchi, deux moteurs, toutes exécutions | [journal, verdict `G4`](../research/TASK-0014-b2-ter-results.md) | 2026-08-31 |
| T7 | Déterminisme : 95 traces réelles rejouées hors navigateur, **0 divergence** | [journal §6.3](../research/TASK-0014-b2-ter-results.md) | 2026-08-31 |
| T8 | Accessibilité : 50 exécutions contrôlées après les changements de niveau, ARIA et clavier conformes | [journal, verdict `G7`](../research/TASK-0014-b2-ter-results.md) | 2026-08-31 |
| T9 | `CAL-B` : mesures et trois restrictions obligatoires (`V1`, `V2`, `R8`) | [DEC-0014](DEC-0014-layout-baseline-and-budget-direction.md) B, [ACTION-0023](../reviews/ACTION-0023-independent-control.md) | 2026-08-31 |
| T10 | WebView2 non instrumentable sans hôte embarqueur; écart avec Edge et Chrome **NON MESURÉ** | [DEC-0014](DEC-0014-layout-baseline-and-budget-direction.md) F | 2026-08-31 |
| T11 | Classification `TASK-0011` de `F-013`, `F-017`, `F-018`, `F-019` : `ULTÉRIEUR`, avec leurs motifs d'origine | [REQUIREMENTS_BASELINE.md](../product/REQUIREMENTS_BASELINE.md) §3 | 2026-08-31 |
| T12 | Vision : relations jamais inventées; extraction, OCR, IA, RAG et GraphRAG hors du MVP structurel | [PROJECT_VISION.md](../../PROJECT_VISION.md) | 2026-08-31 |

## Limites

- **Cette fiche ne mesure rien.** Les points `A`, `B` et `C` sont un
  **arbitrage produit** de Sébastien; les points `D`, `E` et `F` arbitrent sur
  des mesures déjà publiées, avec toutes leurs limites.
- **Le contrat de parité n'a pas été exécuté.** Ses 22 critères sont des cibles
  à falsifier, jamais des résultats. **Non testé.**
- **Le reclassement augmente la charge du MVP** de quatre fonctions, dont un
  modèle de provenance entièrement à écrire. Aucune estimation d'effort n'est
  fournie ici, et aucune ne doit être supposée.
- **Aucune mesure de production.** `R8` reste **en vigueur** : ni WebView2, ni
  `rusqlite`, ni application empaquetée. Aucun chiffre de spike ne borne ce que
  FileTopo rendra.
- **Réserves en vigueur, toutes :** `V1` à `V4` d'`ACTION-0023`, `W1` à `W4`
  d'`ACTION-0024`, `R2` à `R9` d'`ACTION-0021`. **Aucune n'est levée par cette
  fiche.**
- **L'inter-volume de `B3` reste NON TESTÉ**, la **question 3 de `B4` reste
  ouverte**, l'**échec de `B0` n'est pas corrigé** : `DEC-0013` D, E et F sont
  inchangées.
- **Manques déclarés du contrat** : `M-1` à `M-5`, dont l'absence de fonction
  propre pour la persistance des préférences.
