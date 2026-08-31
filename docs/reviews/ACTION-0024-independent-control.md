# ACTION-0024 — Contrôle indépendant de TASK-0014, et clôture

- **Date :** 2026-08-31
- **Objet :** contrôle indépendant des preuves publiées par
  [TASK-0014](../tasks/TASK-0014-b2-ter-budget-controller.md) — banc d'essai
  `B2 ter`, correction minimale du contrôleur de budget auto-régulé — sur la
  branche `spike/v0.2-budget-controller`
- **Contrôleur :** **orchestrateur technique**, instance **distincte** de
  l'exécuteur de `B2 ter`
- **Cadre :** délégation d'orchestration technique de Sébastien du 2026-08-31
  (voir [AGENTS.md](../../AGENTS.md), section « Délégation d'orchestration
  technique »)
- **Rédacteur de la présente fiche :** Claude Code, sous le **GO technique de
  l'orchestrateur** pour cette **étape documentaire uniquement**
- **Résultat :** **contrôle accepté**. `TASK-0014` passe de `IMPLEMENTED` à
  **`VERIFIED`**, **avec quatre réserves `W1` à `W4`**. **La correction
  minimale du budget est REJETÉE.**

> **Ce que cette fiche est.** L'enregistrement, dans le dépôt, d'un contrôle
> indépendant, des réserves qui l'accompagnent et des suites qu'il ordonne.
>
> **Ce qu'elle n'est pas.** Elle **ne rejoue aucune mesure**, n'exécute aucun
> banc d'essai et **ne produit aucune preuve nouvelle**. Les preuves restent
> celles de `TASK-0014`, **inchangées** : ni le journal, ni `PERF-0005`, ni le
> code du spike n'ont été retouchés par cette clôture.
>
> **Elle ne franchit pas la porte `P4`** et **n'autorise aucune ligne de code
> de production.**

## 1. Ce qui a été contrôlé

| Objet | Emplacement |
|---|---|
| Journal, preuves et verdicts `G1` à `G9` | [TASK-0014-b2-ter-results.md](../research/TASK-0014-b2-ter-results.md) |
| Mesures de `B2 ter` | [PERF-0005](../performance/PERF-0005-b2ter-budget-controller.md) |
| Banc d'essai, contrôleur corrigé, page de mesure, pilote | `spikes/b2ter-budget-controller/` |
| Préséance des critères sur les mesures | historique Git, commit `4a5520b` |
| Contrôles d'exécution de l'exécuteur | [VALIDATION.md](../ai/VALIDATION.md), section `TASK-0014` |
| Arbitrages en vigueur | [DEC-0014](../decisions/DEC-0014-layout-baseline-and-budget-direction.md), [ACTION-0023](ACTION-0023-independent-control.md) |

## 2. Résultat du contrôle

**Le contrôle indépendant est accepté.** `TASK-0014` remplit les huit critères
d'acceptation de sa §9 : les neuf énoncés `G1` à `G9` ont chacun un verdict
écrit avec la mesure qui le fonde, la configuration de §5.2 est commitée avant
la première mesure et **identique octet pour octet** après la campagne, de
vraies reconstructions DOM ont eu lieu et leur coût est payé dans l'image, le
plancher de lisibilité a été réellement atteint et tenu, aucune régression
d'accessibilité n'est observée, aucun fichier de production n'a changé, et
**les deux cibles manquées sont publiées comme manquées**.

**`TASK-0014` passe donc à `VERIFIED`.** Cette attribution vient d'une instance
**distincte de l'exécuteur**, conformément à `AGENTS.md` : l'exécuteur ne
s'attribue jamais `VERIFIED`.

**`VERIFIED` porte sur la qualité des preuves, pas sur le succès du
mécanisme.** Les deux réfutations `G1` et `G2` et le critère bloqué `G3` ne
bloquent pas `VERIFIED` : §6 et §6.1 de `TASK-0014` écrivent qu'une réfutation
est un résultat valide et qu'un défaut de protocole découvert après la première
mesure se publie plutôt qu'il ne se corrige. Publier une cible manquée est le
livrable conforme, pas un manquement.

**La correction minimale du budget est, elle, REJETÉE.** Voir §3.1 et §5.

## 3. Les cinq points que `NEXT_ACTION.md` imposait de regarder

### 3.1 Les deux réfutations `G1` et `G2` — publiées sans atténuation, correction REJETÉE

**Contrôlé.** Les deux réfutations sont publiées telles quelles, en tête du
journal (§1), dans les tableaux de verdicts calculés par script (§6.1 et §6.2),
dans `CURRENT_STATE.md`, dans `HANDOFF.md` et dans la fiche de tâche (§13.1).
Aucune formulation ne les présente comme partielles, provisoires ou compensées.

**Les mesures qui les fondent sont citées avec leur pire exécution**, jamais
avec la seule médiane, conformément au protocole : `SYN-DEEP` tombe à
**9,98 ips** en régime stable sur Edge, et le dernier changement de niveau
intervient jusqu'à **13 306,4 ms** après le choc, contre 2 000 ms exigées.

**Les lectures supplémentaires ne sont jamais présentées comme des verdicts.**
Le contrôle a vérifié les trois : le coût d'une reconstruction rapporté au
temps d'image, la coïncidence des deux bornes avec le pas de synchronisation
verticale, et le contrôle ponctuel `CAL-A` / `SYN-WIDE`. Toutes trois sont
étiquetées « lecture supplémentaire » ou « ne fonde aucun critère » à l'endroit
même où elles apparaissent, et `analyse-defauts.mjs` — qui les produit — ne
mesure rien et ne rejoue rien.

**Décision du contrôle : la correction minimale est REJETÉE.** Elle a été
éprouvée sur ses propres critères, écrits avant mesure, et elle en manque les
deux principaux. Aucun code ne peut la reprendre, pas plus que le contrôleur de
`TASK-0013`. `DEC-0014` D est **étendue** à ce second contrôleur.

**Ce qui est rejeté reste le contrôleur écrit, pas le principe.** Voir §5.

### 3.2 `G3` bloqué — accepté, et aucune stabilité n'est prouvée

**Contrôlé.** Le défaut `D2` est réel et le contrôle le confirme par lecture :
la fenêtre stable de `G3` commence **au dernier changement de niveau**; elle ne
peut donc contenir aucun changement, et **aucune inversion ne peut y être
comptée**. La mesure était **vacueuse par construction**, avant toute donnée.

**Publier `G3` bloqué est la bonne application de §6.1 de `TASK-0014`.** Le
texte de `G3` ne peut être ni confirmé ni réfuté par une mesure incapable de le
falsifier : « bloqué » est le seul verdict honnête. Le protocole n'a pas été
changé, aucune mesure n'a été rejouée, aucune cible n'a été déplacée.

**Conséquence obligatoire, réserve `W2` :** **aucune stabilité n'est prouvée.**
Il est **interdit** d'écrire que le contrôleur corrigé est stable, qu'il
n'oscille pas, ou que `B2 ter` corrobore l'absence d'oscillation mesurée par
`B2 bis`. La grandeur qui aurait pu l'établir n'a pas été mesurée.

### 3.3 `G9` — accepté

**Contrôlé, et accepté.** Aucun critère, aucun seuil, aucune constante, aucune
configuration, aucun contrôleur, aucune page de mesure et aucun pilote n'a
changé après la première mesure. Les empreintes SHA-256 de `budget2.mjs`,
`map3.html` et `run-b2ter.mjs` relevées après la campagne sont **identiques** à
celles du commit `4a5520b`, antérieur à toute mesure — journal §3.

Les deux gestes déclarés en §8 du journal sont jugés **conformes à `G9`** :

1. **La ligne de verdict de `G3` dans `verdicts2.mjs`.** Elle rendait
   « CONFIRMÉE » sur une mesure nulle par construction; elle rend désormais
   « BLOQUÉE ». **Ce geste retire une fausse confirmation et n'en ajoute
   aucune.** Il rend le verdict plus strict, ne touche aucun seuil, et va dans
   le sens exact que §6.1 impose. Un contrôle qui refuserait ce geste
   obligerait à publier une confirmation que l'exécuteur savait fausse.
2. **`analyse-defauts.mjs`, fichier nouveau.** Il **ne mesure rien**, ne rejoue
   rien, n'exécute aucun navigateur : il relit les mesures déjà collectées. Il
   ne peut donc pas déplacer un résultat.

**Le geste 1 est accepté parce qu'il ne peut que durcir le verdict.** Cette
acceptation ne crée aucun précédent pour un geste qui en assouplirait un.

### 3.4 `G8` — accepté avec réserve `W1`

**Contrôlé.** La confirmation de `G8` repose sur `ips régime stable`, grandeur
atteinte par le défaut `D1` : le régime stable peut ne contenir qu'une poignée
d'images.

**Accepté, pour deux motifs joints.** D'abord, la mesure **possède réellement
des échantillons** sur `SYN-100K` : 11 à 384 images sur Edge, 14 à 137 sur
Chrome — jamais un échantillon vide, contrairement à d'autres formes où la
valeur 0 signifie « aucune image après le dernier changement ». Ensuite, elle
est **corroborée par la médiane sur toute la période observée** — 59,88 ips sur
Edge, 48,08 ips sur Chrome, sur les cinq exécutions —, une grandeur qui ne
souffre pas de `D1`. Le second seuil de `G8`, le p95 de sélection, ne dépend
pas du tout de `D1` : 6,5 ms sur Edge, 13,6 ms sur Chrome, très en deçà des
150 ms.

**Réserve `W1` :** la grandeur reste fragile. Toute citation de `G8` doit
porter **le nombre d'échantillons** et **la corroboration sur toute la
période**. Une valeur `ips régime stable` de **0** signifie **« aucune image
après le dernier changement »**, jamais « zéro image par seconde ».

### 3.5 Le contrôle ponctuel `CAL-A` / `SYN-WIDE` — réserve `W3`

**Contrôlé.** Le contrôle ponctuel montre que la correction sort de la zone à
26,6 ips **sur Edge**, où elle monte au niveau 9-10 et tient 30,03 à
34,25 ips. **Sur Chrome, elle n'en sort pas.** Il ne fonde aucun critère `G1` à
`G9`, et la fiche le déclarait ainsi **avant** la mesure — `TASK-0014` §5.4.

**Ce que le contrôle en tire :** un résultat qui tient sur un moteur et pas sur
l'autre, sur la même machine et la même page, ne peut pas être présenté comme
une propriété du contrôleur. Il rappelle ce que `DEC-0014` F mesurait déjà :
**le moteur pèse au moins autant que le mécanisme**, et le moteur de production
n'est pas mesuré.

**Réserve `W3` :** il est interdit de citer ce contrôle ponctuel comme une
validation, même partielle, de la correction. Il est interdit d'en déduire quoi
que ce soit pour WebView2.

## 4. Les quatre réserves du contrôle

| Réserve | Ce qu'elle impose |
|---|---|
| `W1` | **`ips régime stable` reste une grandeur fragile.** Toute citation de `G8` porte le **nombre d'échantillons** et la **corroboration sur toute la période observée**. Une valeur de **0** signifie « aucune image après le dernier changement », jamais « zéro image par seconde » |
| `W2` | **Aucune stabilité n'est prouvée.** `G3` est bloqué : sa mesure était **vacueuse par construction**. Interdit d'écrire que le contrôleur corrigé est stable ou qu'il n'oscille pas. Toute reprise devra **définir la fenêtre stable autrement, et le déclarer avant mesure** |
| `W3` | **Le contrôle ponctuel `CAL-A` / `SYN-WIDE` ne valide rien.** Il tient sur Edge et pas sur Chrome. Interdit de le citer comme validation, et interdit d'en déduire quoi que ce soit pour WebView2 |
| `W4` | **Aucune marge alternative n'a été mesurée.** Ni hystérésis, ni marge non nulle inférieure à celle de `TASK-0013`, ni fenêtre de décision désalignée du pas de synchronisation verticale. Aucune valeur ne peut être supposée à partir de cette campagne |

**Ces quatre réserves voyagent avec tout résultat cité de `TASK-0014`**, au
même titre que `V1` à `V4` d'`ACTION-0023`.

## 5. Décisions du contrôle

| # | Objet | Ce qui est retenu |
|---|---|---|
| A | Statut de `TASK-0014` | **`VERIFIED`**, avec les réserves `W1` à `W4` |
| B | Correction minimale du budget de `TASK-0014` | **REJETÉE.** `G1` et `G2` sont réfutées. Aucun code ne peut la reprendre |
| C | Verdict `G3` | **Bloqué, accepté.** La mesure était vacueuse par construction : **aucune stabilité n'est prouvée** |
| D | Intégrité du protocole `G9` | **Acceptée.** Rien n'a changé après mesure; le geste sur `G3` **retire une fausse confirmation** |
| E | Volumétrie `G8` | **Acceptée avec la réserve `W1`** |
| F | Principe du budget adaptatif | **Reste une piste. Cesse d'être un prérequis à `P4`.** Réévalué dans le **véritable hôte Tauri/WebView2**, avant la validation de performance finale |
| G | Contrôleurs de `TASK-0013` et `TASK-0014` | **Aucun ne devient du code de production.** Ce sont des prototypes jetables de spike |

### F, en clair : le budget cesse de bloquer P4

**Ce qui change.** `DEC-0014` E conservait le principe d'un budget auto-régulé
et faisait de sa correction la condition d'un premier rendu écrit. Deux
campagnes l'ont éprouvé; deux contrôleurs sont rejetés. **Une troisième
itération mesurée dans Edge et Chrome n'apprendrait rien de plus sur le moteur
qui compte.**

La cause mesurée du battement est instructive : les **deux bornes** de la zone
morte tombent **exactement** sur un pas de synchronisation verticale de
**4,1667 ms**, et 5,8 % des fenêtres de décision sur Edge, 10,7 % sur Chrome,
se présentent sur la borne haute. **Ce pas est une propriété du moteur et de
l'écran, pas du contrôleur.** Le régler dans un moteur qui n'est pas celui de
production, sur un écran 240 Hz qui n'est pas celui d'un poste ordinaire,
reviendrait à ajuster un mécanisme à un banc plutôt qu'à un produit.

**Ce qui ne change pas.** Le principe reste une piste sérieuse : le plancher de
lisibilité tient absolument, le déterminisme est vérifié sur 95 traces réelles,
l'accessibilité ne régresse pas. **Rien de cela n'est jeté.** Ce qui est
retiré, c'est le statut de **prérequis** : la première tranche de production
n'a pas à embarquer un budget auto-régulé validé.

**Ce qui est explicitement interdit.** Écrire que le budget adaptatif est
abandonné. Écrire qu'il est validé. Reprendre l'un des deux contrôleurs. Fixer
une nouvelle constante de budget sans mesure. **Une tranche de production qui
n'embarque pas de budget doit borner sa charge autrement, et le déclarer.**

## 6. Sort des réserves antérieures

| Réserve | Sort | Motif |
|---|---|---|
| `V1` à `V4` d'`ACTION-0023` | **Inchangées, toutes en vigueur** | `TASK-0014` n'a rien mesuré qui les concerne. Aucune n'est levée, aucune n'est atténuée |
| `R1` d'`ACTION-0021` | **Levée**, depuis `ACTION-0023` | Inchangé par ce contrôle |
| `R8` d'`ACTION-0021` | **En vigueur, renforcée** | `B2 ter` mesure Edge et Chrome. **Aucune mesure de production.** Le contrôle ponctuel de §3.5 la renforce encore |
| `R2` à `R7`, `R9` | **Inchangées** | Hors du périmètre de ce contrôle |

**Aucune réserve n'est levée par cette clôture.** Quatre s'y ajoutent : `W1` à
`W4`.

## 7. Ce que ce contrôle ne fait pas

- Il **ne rejoue aucune mesure** et ne produit aucune preuve nouvelle.
- Il **ne réécrit rien** des preuves de `TASK-0013` ni de `TASK-0014` : les
  journaux, `PERF-0004`, `PERF-0005` et le code des spikes sont conservés tels
  quels.
- Il **ne franchit pas la porte `P4`** et **n'autorise aucune ligne de code de
  production**.
- Il **n'ouvre pas** Canvas 2D ni WebGL.
- Il **n'autorise aucune tentative d'instrumentation de WebView2** : `DEC-0014`
  F reste en vigueur tant qu'un véritable hôte Tauri n'existe pas.
- Il **ne fusionne rien**, ne crée ni PR, ni release, ni étiquette.
- Il **ne touche pas** au cache incrémental de `src-tauri/target/` —
  `DEC-0013` E.

## 8. Action suivante

Le contrôle ouvre **`TASK-0015`** : un **réalignement produit strictement
documentaire** sur la référence fonctionnelle, décidé par Sébastien au titre de
la **direction produit**, qu'aucune délégation ne couvre. Il produit le contrat
de parité fonctionnelle, l'ajustement de la baseline d'exigences, une décision
qui supplante `DEC-0014` sur la lecture produit de `CAL-B`, une feuille de
route en quatre étapes, et la fiche `PROPOSED` de la **première tâche `P4`**.

**`TASK-0015` n'écrit aucune ligne de code et ne franchit pas `P4`.**
