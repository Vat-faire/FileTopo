# DEC-0014 — Calepin baseline, direction de rendu et sort du budget auto-régulé

- **Date :** 2026-08-31
- **Statut :** `APPROVED`
- **Phase :** 1 bis — après le banc d'essai `B2 bis` de
  [TASK-0013](../tasks/TASK-0013-b2-bis-layout-and-render-budget.md) et son
  contrôle indépendant
  [ACTION-0023](../reviews/ACTION-0023-independent-control.md)
- **Décideur :** **orchestrateur technique**, sous la **délégation explicite de
  Sébastien du 2026-08-31** (voir [AGENTS.md](../../AGENTS.md), section
  « Délégation d'orchestration technique »). Sébastien conserve la direction
  produit et les points d'arrêt réservés.
- **Approuvée le :** 2026-08-31
- **replaced_by :** —

> **Cette fiche ne remplace ni `DEC-0008`, ni `DEC-0013`.** Elle les
> **complète** sur les points que `B2 bis` a atteints. Leur texte est conservé
> intact. Aucun historique n'est réécrit, aucune preuve n'est retouchée.
>
> **Cette fiche ne mesure rien.** Elle arbitre sur les mesures de `TASK-0013`,
> avec **toutes** les limites que celles-ci déclarent.

## Contexte

`DEC-0013` C avait fixé une direction sans rien décider de concret : abandon du
plafond universel de 3 000 blocs, **étude** d'un calepin squarifié, **direction**
d'un budget de rendu auto-régulé. Cette fiche écrivait elle-même, en limites :
« le budget de rendu auto-régulé n'existe pas » et « le calepin squarifié n'a
pas été testé ».

`TASK-0013` a testé les deux. Huit verdicts, **deux réfutations**. Le contrôle
indépendant `ACTION-0023` a accepté ces preuves et attribué `VERIFIED` avec
quatre réserves `V1` à `V4`. La présente fiche est le lieu prévu où ces
verdicts deviennent des décisions.

Six points sont arbitrés ici, et seulement six.

## Décision

| # | Objet | Ce qui est retenu |
|---|---|---|
| A | Statut de `TASK-0013` | **`VERIFIED`**, réserves `V1` à `V4` d'`ACTION-0023` **maintenues** |
| B | Algorithme de calepin | **`CAL-B`, pavage squarifié, devient la direction baseline.** `CAL-A`, découpage alterné, cesse d'être la référence |
| C | Technologie de rendu | **HTML/SVG accessible reste la direction.** Canvas 2D et WebGL ne sont toujours pas ouverts |
| D | Contrôleur de budget de `TASK-0013` | **NON ADOPTÉ.** `F4` est réfutée : aucun code ne peut reprendre ce contrôleur tel quel |
| E | Principe d'un budget auto-régulé | **CONSERVÉ.** C'est le contrôleur écrit qui est rejeté, pas le principe |
| F | WebView2 | **Aucune nouvelle tentative** avant qu'un **véritable hôte Tauri** existe. Edge et Chrome restent des mesures de **spike**, jamais de production |

---

## A. `TASK-0013` est `VERIFIED`, avec ses quatre réserves

Le contrôle indépendant est accepté. `TASK-0013` passe de `IMPLEMENTED` à
`VERIFIED`, sur les preuves publiées, pas sur une déclaration de l'exécuteur.

**Les quatre réserves `V1` à `V4` sont conservées explicitement**, avec leur
texte, dans [ACTION-0023](../reviews/ACTION-0023-independent-control.md) §3.
Elles ne sont ni effacées, ni atténuées, ni réputées levées par le passage à
`VERIFIED`.

**`R1` d'`ACTION-0021` est levée**, parce que son objet était l'**absence** de
`SYN-100K` et que `SYN-100K` a été réellement joué. **`R8` reste en vigueur**,
et sort **renforcée** de la campagne.

## B. `CAL-B`, le pavage squarifié, devient la direction baseline

**Retenu :** le **pavage squarifié** est la direction de calepin baseline pour
la carte en blocs. Le découpage alterné `CAL-A` cesse d'être la référence.

Motif, mesuré à **nombre de nœuds DOM identique** — 5 714 dans les deux cas,
`SYN-WIDE`, Edge :

| | `CAL-A`, alterné | `CAL-B`, squarifié |
|---|---:|---:|
| Images par seconde, déplacement | 21,79 | **119,05** |
| Sélection, p95 | 43,5 ms | **14,1 ms** |
| Rapport d'aspect médian | 3 987,79 | **1,01** |

Le squarifié **ne coûte rien ailleurs** : `F3` demandait qu'il ne perde pas
plus de 5 % d'images par seconde sur `SYN-DEEP` et `SYN-EQUILIBRE`; il **gagne**
de +20 % à +98 %, à nombre de blocs égal.

**Son prix est au calcul, pas à l'image** : jusqu'à **5,9 fois** le temps de
calepinage sur `SYN-100K`, payé **une fois par arborescence**, pas par image.
Tout code écrit ensuite doit traiter le calepinage comme un coût d'indexation,
jamais comme un coût de rendu.

### Trois restrictions obligatoires sur cette décision

1. **La causalité géométrique n'est pas établie** — réserve `V2`. Le
   classement des rapports d'aspect et celui des images par seconde coïncident;
   aucune expérience n'a pu les faire diverger. **Il est interdit d'écrire que
   la géométrie des rectangles est la cause mesurée de l'écart.**
2. **Le nombre littéral de `F1` n'a pas été mesuré** — réserve `V1`. Le
   scénario demandé à 3 000 blocs en construit **2 856**. Le résultat est
   accepté parce que `CAL-B` tient aussi les deux seuils sur une charge
   **supérieure**, **5 012 blocs visibles** : 59,88 ips et 20,1 ms p95.
   **Toute citation doit porter le nombre réellement construit.**
3. **`CAL-B` n'est pas mesuré dans le moteur de production.** Réserve `R8`.

## C. HTML/SVG accessible reste la direction

**Canvas 2D et WebGL ne sont pas ouverts.** `DEC-0013` C ne les ouvrait pas;
`B2 bis` n'en a mesuré aucun. Rien dans cette campagne ne justifie de rouvrir
la question.

Motif conservé de `DEC-0013` C, désormais mesuré plus largement :
l'accessibilité est conforme sur **32 scénarios sur 32** de `B2 bis` — ARIA et
clavier, deux calepins, budget actif —, un acquis que Canvas 2D devrait
**entièrement reconstruire**.

**Limite conservée :** aucun lecteur d'écran réel n'a été employé. La
conformité porte sur les attributs produits et sur `document.activeElement`.

## D. Le contrôleur de budget de `TASK-0013` n'est pas adopté

**`F4` est réfutée. Le contrôleur écrit par `TASK-0013` n'est pas adopté, et
aucun code ne peut le reprendre tel quel.**

Deux causes mesurées, toutes deux issues de **constantes déclarées avant
mesure** et **non retouchées** :

1. **La zone morte tolère un régime stable sous la cible.** La marge haute de
   1,15 place le déclenchement de l'agrégation à **38,33 ms**, soit
   **26,1 ips**. `CAL-A` sur `SYN-WIDE` se stabilise à **26,60 ips** — sous les
   30 exigées — sans jamais approcher le plancher. **Un contrôleur qui vise
   30 ips ne doit pas tolérer 26,1 ips.**
2. **La descente vers le détail est trop lente.** Le refroidissement impose
   **trois fenêtres par niveau** lors d'un affinage continu : environ **3,6 s**
   pour revenir au détail maximal, ce qui dépasse mécaniquement les 2 s exigées
   dès que la machine a de la marge. Quatre lignes sur huit manquent la
   convergence.

**Ce qui est réfuté est le contrôleur écrit, pas le principe.** Voir E.

## E. Le principe d'un budget auto-régulé est conservé

Ce qui a tenu, et qui fonde la conservation du principe :

- **zéro oscillation** sur les huit lignes et les cinq exécutions;
- **plancher de lisibilité jamais franchi**, sur seize lignes;
- sous une contrainte volontairement inatteignable, le contrôleur monte au
  **niveau 13 sur 13**, atteint exactement **2 400 px²**, **s'y arrête et y
  reste** : il refuse d'agréger davantage alors même qu'il n'atteint pas sa
  cible;
- **déterminisme vérifié** par rejeu hors navigateur de **80 traces réelles**,
  **zéro divergence**.

**La direction de `DEC-0013` C — un budget auto-régulé plutôt qu'une constante
écrite d'avance — est donc maintenue.** Ce qui manque est une **correction
minimale** des deux causes de D, éprouvée sur ses propres critères. C'est
l'objet de
[TASK-0014](../tasks/TASK-0014-b2-ter-budget-controller.md).

**Aucun budget n'est adopté par cette fiche.** Une direction n'est pas un
mécanisme.

## F. WebView2 : aucune nouvelle tentative avant un véritable hôte Tauri

`F8` est réfutée : WebView2 **n'a pas pu être instrumenté**. Le runtime
**151.0.4129.107** est installé; sans hôte embarqueur, `msedgewebview2.exe`
sort en code 13, ou démarre et s'arrête seul en 236 ms. Écrire un hôte
embarqueur exigerait une **dépendance nouvelle** — §4.3 de `TASK-0013` la rend
**bloquante, jamais contournable** — et du **code d'hôte applicatif**, que la
porte **P4** protège.

**Décidé :** aucune nouvelle tentative d'instrumentation de WebView2 tant qu'un
**véritable hôte Tauri** n'existe pas dans le projet. Les tentatives répétées
sans hôte ne produiraient que la même démonstration d'impossibilité.

**Les mesures Edge et Chrome restent des mesures de spike, jamais de
production.** Edge 152.0.4191.53 est le **substitut de référence** — WebView2
*est* Edge en mode embarqué, mais **une version majeure** les sépare. Chrome
151.0.7922.175 est le **contrôle de continuité** avec `B2`.

**L'écart avec WebView2 est déclaré NON MESURÉ.** Ni estimé, ni borné, ni
réputé négligeable. Aucune fiche, aucun code et aucune communication ne peut
présenter une mesure Edge ou Chrome comme une mesure de WebView2.

### Le moteur pèse plus lourd que le calepin sur deux formes

Sur les 18 couples non butés contre la synchronisation verticale, Chrome rend
entre **0,50 et 0,71** fois les images par seconde d'Edge — médiane **0,60** —
sur la **même machine**, la **même page**, le **même jour**. Sur `SYN-DEEP` et
`SYN-EQUILIBRE`, cet écart est **du même ordre que le gain du calepin**.

**Conséquence de lecture, obligatoire :** tant que le moteur de production n'est
pas mesuré, aucun chiffre de cette campagne ne borne ce que FileTopo rendra.

---

## Conséquences

- **`DEC-0008`** : l'algorithme de calepin cesse d'être une variable ouverte;
  le **squarifié** est la direction baseline. Le protocole de falsification de
  §3.6 a été joué **à la lettre** pour la première fois, `SYN-100K` compris.
- **`DEC-0013` C** : la direction « budget de rendu auto-régulé » est
  **maintenue**, mais **aucun contrôleur n'est adopté**. Le premier rendu écrit
  devra porter un budget **dont la correction aura été éprouvée**, pas celui de
  `TASK-0013`.
- **`ACTION-0021`** : `R1` est **levée**; `R8` reste **en vigueur** et
  renforcée; les sept autres réserves sont inchangées.
- Le **coût de calepinage** doit être traité comme un coût d'indexation, payé
  une fois par arborescence.
- **Aucune ligne de code de production n'est autorisée par cette fiche.** La
  porte **P4 reste ouverte et non franchie**.

## Preuves

| # | Fait | Source | Consultée le |
|---|---|---|---|
| S1 | `CAL-B` / `SYN-WIDE`, 2 856 blocs, 5 714 nœuds DOM : 119,05 ips et 14,1 ms p95, cinq exécutions, Edge | [PERF-0004](../performance/PERF-0004-b2bis-layout-and-budget.md), [journal §9](../research/TASK-0013-b2-bis-results.md) | 2026-08-31 |
| S2 | `CAL-B` / `SYN-WIDE`, **5 012 blocs**, 10 026 nœuds DOM : 59,88 ips et 20,1 ms p95, Edge — charge supérieure à celle de `F1` | [PERF-0004](../performance/PERF-0004-b2bis-layout-and-budget.md) | 2026-08-31 |
| S3 | Rapport d'aspect médian 3 987,79 (`CAL-A`) contre 1,01 (`CAL-B`) sur `SYN-WIDE` | [PERF-0004](../performance/PERF-0004-b2bis-layout-and-budget.md) | 2026-08-31 |
| S4 | `CAL-B` gagne de +20 % à +98 % sur `SYN-DEEP` et `SYN-EQUILIBRE`, à nombre de blocs égal | [journal, verdict `F3`](../research/TASK-0013-b2-bis-results.md) | 2026-08-31 |
| S5 | Coût de calepinage jusqu'à 5,9 fois celui de `CAL-A` sur `SYN-100K`, payé une fois par arborescence | [journal](../research/TASK-0013-b2-bis-results.md) | 2026-08-31 |
| S6 | Zone morte 25,00 – 38,33 ms; `CAL-A` / `SYN-WIDE` stable à 26,60 ips, sous la cible de 30 | [journal §6.3](../research/TASK-0013-b2-bis-results.md) | 2026-08-31 |
| S7 | Refroidissement à trois fenêtres par niveau; convergence manquée sur 4 lignes sur 8 | [journal §6.3, verdict `F4`](../research/TASK-0013-b2-bis-results.md) | 2026-08-31 |
| S8 | Plancher de 2 400 px² atteint au niveau 13 sur 13 sous contrainte inatteignable, jamais franchi; zéro oscillation | [journal, verdict `F5`](../research/TASK-0013-b2-bis-results.md) | 2026-08-31 |
| S9 | Déterminisme : 80 traces réelles rejouées hors navigateur, zéro divergence | `spikes/b2bis-layout-and-budget/replay-budget.mjs`, [journal](../research/TASK-0013-b2-bis-results.md) | 2026-08-31 |
| S10 | `SYN-100K` joué : 120,48 ips et 8,2 ms p95, 3 461 blocs construits pour 100 000 éléments indexés | [journal, verdict `F6`](../research/TASK-0013-b2-bis-results.md) | 2026-08-31 |
| S11 | ARIA et clavier conformes sur 32 scénarios sur 32 | [journal, verdict `F7`](../research/TASK-0013-b2-bis-results.md) | 2026-08-31 |
| S12 | WebView2 non instrumentable sans hôte embarqueur : code 13, ou arrêt seul en 236 ms | [journal §3](../research/TASK-0013-b2-bis-results.md) | 2026-08-31 |
| S13 | Chrome rend 0,50 à 0,71 fois les ips d'Edge, médiane 0,60, sur 18 couples non butés | [PERF-0004](../performance/PERF-0004-b2bis-layout-and-budget.md) | 2026-08-31 |
| S14 | Contrôle indépendant accepté, quatre réserves `V1` à `V4`, `R1` levée, `R8` en vigueur | [ACTION-0023](../reviews/ACTION-0023-independent-control.md) | 2026-08-31 |

## Limites

- **Cette fiche ne mesure rien.** Elle arbitre sur les mesures de `TASK-0013`,
  avec toutes leurs limites : **une seule machine**, nettement au-dessus d'un
  poste ordinaire, écran **240 Hz**, **mode sans affichage**, arborescences
  **synthétiques**, moteurs **Edge et Chrome**, jamais WebView2.
- **Les images par seconde sont quantifiées** par la synchronisation verticale,
  en marches de 4,17 ms. Les valeurs de 238,10 sont **butées**, pas mesurées.
- **`revirtualisations = 0`** sur toutes les mesures à seuil imposé de
  `B2 bis` : le mode `transform` y est mesuré dans son cas **le plus
  favorable**. La réserve de `B2` sur ce point **n'est pas levée**.
- **Le plancher de lisibilité de 2 400 px² est un choix, pas une mesure.**
  Aucun essai avec des personnes ne l'a établi.
- **Aucun lecteur d'écran réel** n'a été employé.
- **La causalité géométrique n'est pas établie** — réserve `V2`.
- **Aucun budget n'est adopté.** `E` conserve un principe, pas un mécanisme.
- L'**inter-volume de `B3` reste NON TESTÉ**, la **question 3 de `B4` reste
  ouverte**, l'**échec de `B0` n'est pas corrigé** : `DEC-0013` D, E et F sont
  inchangées.
