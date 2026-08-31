# TASK-0013 — B2 bis : calepin squarifié, budget de rendu auto-régulé, SYN-100K

- **Identifiant :** `TASK-0013`
- **Titre :** Comparer le calepin actuel à un calepin squarifié, éprouver un
  budget de rendu auto-régulé, et combler la réserve de volumétrie `SYN-100K`,
  en conservant HTML/SVG et l'accessibilité
- **Statut :** `VERIFIED` — attribué le 2026-08-31 par le contrôle indépendant
  [ACTION-0023](../reviews/ACTION-0023-independent-control.md), **avec quatre
  réserves `V1` à `V4`**
- **Phase :** 1 bis — seconde porte technique, après
  [DEC-0013](../decisions/DEC-0013-post-risk-gate-technical-arbitration.md)
- **Proposée le :** 2026-08-31
- **Rédacteur de la fiche :** Claude Code, sous le GO technique de
  l'orchestrateur du 2026-08-31 (étape documentaire)
- **Exécuteur :** Claude Code, session `filetopo-task-0013-b2bis`
- **Effort estimé :** une à deux sessions d'expérimentation
- **GO d'exécution :** **ACQUIS le 2026-08-31**, de l'orchestrateur technique,
  sous la délégation inscrite dans [AGENTS.md](../../AGENTS.md). Porte **P3 bis
  franchie**. Le GO n'autorise que ce que cette fiche nomme. **P4 reste non
  franchie : aucun code de production.**
- **Branche dédiée :** `spike/v0.2-render-budget`, créée le 2026-08-31 depuis
  la pointe contrôlée `746f1b5f93c9d7085516c0e56473a95dc2c2d178` de
  `spike/v0.2-technical-risk-gates`.

> **Note de traçabilité.** Le texte d'origine de cette fiche est conservé. Seuls
> le statut, l'exécuteur, la ligne de GO, l'historique d'état (§12), le
> rapport d'exécution (§13) et la clôture du contrôle (§14) sont mis à jour.
> **Aucune preuve n'a été retouchée** : ni le journal, ni `PERF-0004`, ni le
> code du spike.

> Cette fiche **spécifie**. Elle ne contient **aucun résultat**, et n'en
> contiendra jamais : les résultats vivront dans
> `docs/research/TASK-0013-b2-bis-results.md` et dans `PERF-0004`.
>
> **Les critères de §6 sont écrits avant toute mesure**, conformément à
> `DEC-0013` C et à §12 de
> [TASK-0012](TASK-0012-technical-risk-gates.md). Aucun ne peut être ajusté
> après coup pour être atteint.

---

## 1. Objectif unique

Décider, **sur mesures**, comment la carte en blocs borne ce qu'elle dessine :
par un **algorithme de calepin** mieux choisi, par un **budget de rendu
auto-régulé**, ou par les deux — **sans** ouvrir Canvas 2D et **sans** perdre
l'accessibilité déjà acquise.

## 2. Contexte : ce que `B2` a laissé ouvert

`B2` a mesuré, et trois constats fondent cette tâche :

1. **Le plafond dépend de la forme, d'un facteur 4.** 3 743 blocs sur
   `SYN-EQUILIBRE`, 3 063 sur `SYN-DEEP`, **entre 939 et 1 795** sur
   `SYN-WIDE`. `DEC-0013` C en tire l'abandon du plafond universel de 3 000.
2. **L'effondrement de `SYN-WIDE` vient probablement du calepin.** Le découpage
   alterné produit des lamelles très étroites et très hautes, coûteuses à
   tramer. Un pavage **squarifié** donnerait d'autres formes — et
   **n'a pas été testé** (rapport §3.6, §3.9.5).
3. **`SYN-100K` n'a jamais été joué.** Le protocole de falsification écrit par
   `DEC-0008` exige `SYN-100K`, `SYN-DEEP` **et** `SYN-WIDE`. `B2` a mesuré
   `SYN-EQUILIBRE` à la place de `SYN-100K` : **`B2` ne falsifie donc pas
   littéralement `DEC-0008` selon son protocole complet.** C'est un trou de
   preuve déclaré, et cette tâche existe pour le combler.

S'y ajoute une limite de moteur : **`B2` a mesuré Chrome, pas WebView2**, alors
que FileTopo rendra dans WebView2 (`DEC-0007`).

## 3. Périmètre

**Dans le périmètre :**

- un spike jetable, isolé, sous `spikes/b2bis-layout-and-budget/`;
- deux algorithmes de calepin comparés sur les **mêmes** données et la **même**
  trajectoire;
- un mécanisme de **budget de rendu auto-régulé**, écrit puis éprouvé;
- des arborescences **entièrement synthétiques**, dont **`SYN-100K`**;
- des mesures dans **WebView2** si l'instrumentation directe est possible,
  sinon la démonstration écrite de son impossibilité et un **substitut le plus
  proche** explicitement déclaré;
- la vérification que l'accessibilité **ne régresse pas**.

**Hors périmètre, sans exception :**

- **tout code de production** — `src/`, `src-tauri/`, `tests/`, `public/`,
  `scripts/`, `.github/` restent intacts;
- **Canvas 2D et WebGL** : `DEC-0013` C ne les ouvre pas. Ni prototype, ni
  mesure, ni comparaison;
- toute correction de l'échec de `B0`, et **toute suppression** du cache
  incrémental de `src-tauri/target/` (`DEC-0013` E);
- toute donnée réelle, tout fichier de l'utilisateur;
- toute modification de `graph/`, d'un verrou de dépendances, ou d'une fiche
  `DEC` existante;
- toute fusion, PR, release, étiquette;
- toute écriture, lecture ou listage **hors du dépôt public**.

## 4. Branche et fichiers autorisés

Branche dédiée, **jetable**, créée au moment du GO d'exécution depuis la pointe
de `spike/v0.2-technical-risk-gates` — nom proposé :
`spike/v0.2-render-budget`. Aucune fusion automatique.

### 4.1 Créations autorisées

| Chemin | Contenu |
|---|---|
| `spikes/b2bis-layout-and-budget/` | Prototype de calepin et de budget, isolé |
| `spikes/fixtures/` (ajouts) | Générateurs synthétiques, dont `SYN-100K` |
| `docs/performance/PERF-0004-b2bis-layout-and-budget.md` | Mesures réelles |
| `docs/research/TASK-0013-b2-bis-results.md` | Journal, preuves et verdicts |

### 4.2 Modifications autorisées

La mémoire obligatoire à la fin de l'exécution — `CURRENT_STATE.md`,
`NEXT_ACTION.md`, `HANDOFF.md`, `VALIDATION.md`, `CHANGELOG_AI.md` — plus la
section « rapport d'exécution » de **cette** fiche. Rien d'autre.

### 4.3 Dépendances

**Aucune par défaut.** Les cinq exigences de §6 de `TASK-0012` s'appliquent
telles quelles : nom et version épinglés, licence vérifiée sur la source
officielle avec date, compatibilité MIT, justification en une phrase,
confinement dans `spikes/`. Une dépendance qui ne les satisfait pas rend le
banc d'essai **bloqué**, jamais contourné.

L'algorithme squarifié doit être **écrit dans le spike** à partir de sa
description publiée, pas importé d'une bibliothèque, sauf si les cinq exigences
sont satisfaites et écrites d'avance.

## 5. Ce que la tâche doit produire

### 5.1 Deux calepins comparés

1. **`CAL-A` — découpage alterné**, l'algorithme déjà mesuré par `B2`,
   reconduit **sans modification** pour servir de référence.
2. **`CAL-B` — pavage squarifié**, qui minimise les rapports d'aspect extrêmes.

Les deux calepins reçoivent **les mêmes** arborescences, **la même** trajectoire
scriptée, **le même** nombre de blocs visibles demandé, et sont mesurés dans la
**même** session.

Sont relevés, par scénario : nombre de nœuds DOM **construits** (compté, pas
estimé), images par seconde, latence de sélection avec centiles, **et la
distribution des rapports d'aspect des rectangles produits** — c'est la
grandeur qui doit expliquer l'écart, si écart il y a.

### 5.2 Un budget de rendu auto-régulé

Un mécanisme qui ajuste ce que le rendu construit **en fonction de ce que la
machine soutient**, au lieu d'obéir à une constante écrite d'avance. Exigences
minimales, à respecter par toute mise en œuvre proposée :

1. **Il mesure avant de décider.** L'ajustement s'appuie sur le temps d'image
   réellement observé, jamais sur une estimation.
2. **Il converge.** Il ne doit pas osciller indéfiniment entre deux niveaux de
   détail.
3. **Il est borné en lisibilité.** Il existe un plancher en dessous duquel il
   n'agrège pas davantage, même s'il n'atteint pas sa cible d'images par
   seconde : une carte illisible qui va vite est un échec, pas un succès.
4. **Il est déterministe à conditions égales.** Deux exécutions identiques
   produisent la même suite de décisions.
5. **Il n'écrit rien.** Aucun état persistant, aucun fichier.

### 5.3 `SYN-100K`

Une arborescence synthétique de **100 000 éléments**, à graine fixe, décrite
par sa forme (profondeur, facteur de branchement, distribution des tailles).
Elle comble la réserve de volumétrie et rend enfin le protocole de `DEC-0008`
applicable **à la lettre**.

### 5.4 WebView2, ou la démonstration de son impossibilité

**L'ordre de préférence est : WebView2 d'abord.**

Si l'instrumentation directe de WebView2 est possible sans dépendance nouvelle
et sans sortir du dépôt, elle est **le moteur de référence** de cette tâche.

Si elle ne l'est pas, l'exécuteur doit :

1. **écrire précisément pourquoi** — commande tentée, message d'erreur, version
   du composant, ce qui manquait;
2. **définir le substitut le plus proche** et **dire en quoi il diffère** —
   même moteur Chromium, version, mode d'exécution, différences connues avec
   WebView2;
3. **étiqueter toute mesure publiée** avec le moteur réellement employé;
4. **déclarer l'écart comme non mesuré**, jamais comme négligeable.

Un substitut n'est jamais présenté comme WebView2.

### 5.5 L'accessibilité ne régresse pas

Les contrôles ARIA et clavier de `B2` §3.8 sont **rejoués tels quels** sur
chaque calepin et sous le budget auto-régulé : `role`, `aria-expanded`,
`aria-selected`, `aria-level`, `aria-setsize`, `aria-posinset`, et la
navigation par flèches, `Home`, `End`, vérifiée sur l'état interne **et** sur
`document.activeElement`.

**Toute régression disqualifie la variante concernée**, quels que soient ses
chiffres de performance.

## 6. Critères falsifiables — écrits avant toute mesure

Protocole commun, repris de `B2` : trajectoire scriptée identique entre
exécutions, images par seconde relevées **par l'horloge de rendu du navigateur**
dans la page, **cinq exécutions minimum**, médiane et écart min–max publiés,
matériel de référence déclaré **avant** la première mesure.

| # | Énoncé falsifiable | Confirmé si | Réfuté si |
|---|---|---|---|
| **F1** | Le calepin squarifié corrige l'effondrement de `SYN-WIDE` | `CAL-B` tient **≥ 30 ips soutenues** et **p95 de sélection ≤ 150 ms** à **3 000 blocs visibles** sur `SYN-WIDE` | l'un des deux seuils est manqué, mesure jointe |
| **F2** | L'avantage du squarifié s'explique par la géométrie | la médiane du rapport d'aspect des rectangles de `CAL-B` est **strictement plus proche de 1** que celle de `CAL-A` sur `SYN-WIDE`, et l'écart d'images par seconde suit ce classement sur les trois formes | le classement des rapports d'aspect et celui des images par seconde **ne coïncident pas** |
| **F3** | Le squarifié ne coûte rien ailleurs | sur `SYN-DEEP` et `SYN-EQUILIBRE`, `CAL-B` ne perd **pas plus de 5 %** d'images par seconde contre `CAL-A` à nombre de blocs égal | la perte dépasse 5 % sur l'une des deux formes |
| **F4** | Le budget auto-régulé tient la cible | sur les quatre formes, après un changement brusque de vue, le budget **converge en ≤ 2 s** vers un état qui tient **≥ 30 ips**, et **n'oscille pas** : au plus **deux** inversions de sens sur 10 s en régime stable | le temps de convergence, le seuil d'images par seconde ou le critère d'oscillation est manqué |
| **F5** | Le budget reste lisible | le plancher de lisibilité déclaré en §5.2.3 **n'est jamais franchi**, sur aucune forme, y compris quand la cible d'images par seconde n'est pas atteinte | le budget agrège au-delà du plancher pour tenir sa cible |
| **F6** | `SYN-100K` tient le protocole de `DEC-0008` | sur `SYN-100K`, avec budget actif et `CAL-B`, les **deux** seuils de `DEC-0008` §3.6 sont tenus, et le nombre de blocs simultanément visibles est **relevé, pas supposé** | l'un des deux seuils est manqué sur `SYN-100K` |
| **F7** | L'accessibilité ne régresse pas | **zéro** attribut ARIA manquant et navigation clavier conforme sur **tous** les scénarios, les deux calepins, budget actif | une seule régression, sur un seul scénario |
| **F8** | Le moteur de référence est WebView2 | les mesures publiées sont relevées **dans WebView2** | l'instrumentation est impossible — alors §5.4 s'applique intégralement, et **F8 est publiée comme réfutée**, jamais contournée |

**Aucun de ces huit énoncés n'est ajustable après mesure.** Une cible manquée
est publiée comme manquée. Une réfutation est un résultat valide.

### 6.1 Ce que la tâche décide, et ce qu'elle ne décide pas

Cette tâche **ne choisit pas** le calepin du produit et **n'adopte pas** un
budget. Elle produit les mesures qui rendront ce choix possible. L'arbitrage
appartient à une décision ultérieure, prise sur ses preuves.

## 7. Preuves attendues

1. Matériel de référence déclaré **avant** la première mesure.
2. Pour chaque scénario : forme, graine, nombre de blocs visibles demandé,
   nombre de nœuds DOM **construits**, images par seconde (5 exécutions,
   médiane, écart), latences avec centiles, moteur employé.
3. Distribution des rapports d'aspect par calepin et par forme.
4. Journal de décisions du budget auto-régulé sur au moins une trajectoire,
   suffisant pour vérifier convergence et absence d'oscillation.
5. Tableau ARIA et clavier, par calepin et par scénario.
6. Verdict explicite `F1` à `F8`, un par ligne, avec la mesure qui le fonde.
7. Section « non testé et limites », écrite sans atténuation.

## 8. Conditions d'arrêt immédiat

Reprises de §13 de `TASK-0012`, elles s'appliquent intégralement. L'exécution
**s'arrête et demande**, sans contourner, si :

1. un essai exigerait une donnée réelle, un fichier ou un dossier de
   l'utilisateur;
2. une action sortirait du dépôt public en lecture, en listage ou en écriture;
3. une dépendance ne satisfait pas les cinq exigences de §4.3;
4. une opération toucherait le code de production, `graph/`, `main`, ou un
   verrou;
5. l'état Git observé diffère de l'état attendu;
6. une action risquerait de modifier, d'hydrater ou de déplacer un fichier de
   l'utilisateur;
7. la portée s'élargit au-delà de cette fiche — **notamment** vers Canvas 2D,
   que `DEC-0013` C n'ouvre pas.

## 9. Critères d'acceptation de la tâche

| # | Condition |
|---|---|
| 1 | `F1` à `F8` ont chacun un verdict écrit, confirmé ou réfuté, mesure jointe |
| 2 | Les deux calepins ont été mesurés sur les **mêmes** données et la **même** trajectoire |
| 3 | `SYN-100K` a été joué, et la réserve de volumétrie est **close ou déclarée toujours ouverte** |
| 4 | Le moteur de mesure est déclaré, et §5.4 est appliqué intégralement si WebView2 n'a pas pu servir |
| 5 | Aucune régression d'accessibilité, ou la variante fautive est écartée |
| 6 | Aucun fichier de production, de test, de dépendance ni de `graph/` n'a changé |
| 7 | Les cibles manquées sont publiées comme manquées |
| 8 | La mémoire obligatoire est à jour et `NEXT_ACTION.md` contient exactement une action |

## 10. État final attendu

**`TASK-0013` se terminera `IMPLEMENTED`, jamais `VERIFIED`.** L'exécuteur ne
juge pas ses propres preuves. `VERIFIED` appartient à un contrôle indépendant,
conformément à [AGENTS.md](../../AGENTS.md).

## 11. Portes

| Porte | Objet | État |
|---|---|---|
| P3 | Bancs d'essai de `TASK-0012` | **Franchie le 2026-08-31** |
| P3 bis | **Approuver cette fiche et autoriser son exécution** | **Ouverte, non franchie** |
| P4 | Autoriser la première tâche d'implémentation | Ultérieure. **Aucune ligne de code de production avant P4** |
| P5 | GO de Sébastien pour publication externe exceptionnelle, dépense, donnée réelle, opération destructive ou hors dépôt | Permanente |

## 12. Historique de l'état

- 2026-08-31 — `PROPOSED` : fiche rédigée à la clôture d'`ACTION-0021`, sous le
  GO technique de l'orchestrateur pour l'étape documentaire. **Aucune
  exécution, aucun spike, aucune branche, aucune mesure.**
- 2026-08-31 — `APPROVED` : **porte P3 bis franchie**. GO d'exécution donné par
  l'orchestrateur technique dans le périmètre exact de cette fiche. Aucune
  modification des critères `F1` à `F8`.
- 2026-08-31 — `IN_PROGRESS` : branche dédiée `spike/v0.2-render-budget` créée
  depuis `746f1b5`; arbre Git propre vérifié; aucune autre tâche
  `IN_PROGRESS`. **Aucune mesure n'a encore été prise à cet instant.**
- 2026-08-31 — `IMPLEMENTED` : campagne exécutée, huit verdicts publiés dont
  **deux réfutations**, `F4` et `F8`. Mémoire obligatoire mise à jour.
  **`VERIFIED` n'est pas attribuée** : elle appartient à un contrôle
  indépendant.
- 2026-08-31 — `VERIFIED` : contrôle indépendant
  [`ACTION-0023`](../reviews/ACTION-0023-independent-control.md) **accepté**,
  mené par une instance **distincte de l'exécuteur**, **sur preuves**. Quatre
  réserves `V1` à `V4` sont attachées à cette acceptation. Les décisions
  techniques qui en découlent sont enregistrées dans
  [`DEC-0014`](../decisions/DEC-0014-layout-baseline-and-budget-direction.md).
  **Aucune preuve de cette tâche n'a été modifiée par la clôture.**

## 13. Rapport d'exécution

- **Exécutée le :** 2026-08-31
- **Branche :** `spike/v0.2-render-budget`, publiée sur origin, créée depuis
  `746f1b5f93c9d7085516c0e56473a95dc2c2d178`
- **Statut à l'issue :** **`IMPLEMENTED`, jamais `VERIFIED`.** L'exécuteur ne
  juge pas ses propres preuves.
- **Journal, preuves et verdicts :**
  [TASK-0013-b2-bis-results.md](../research/TASK-0013-b2-bis-results.md)
- **Mesures :** [PERF-0004](../performance/PERF-0004-b2bis-layout-and-budget.md)

### 13.1 Verdicts

| # | Énoncé | Verdict |
|---|---|---|
| `F1` | Le calepin squarifié corrige l'effondrement de `SYN-WIDE` | **CONFIRMÉE** |
| `F2` | L'avantage du squarifié s'explique par la géométrie | **CONFIRMÉE** |
| `F3` | Le squarifié ne coûte rien ailleurs | **CONFIRMÉE** |
| `F4` | Le budget auto-régulé tient la cible | **RÉFUTÉE** |
| `F5` | Le budget reste lisible | **CONFIRMÉE** |
| `F6` | `SYN-100K` tient le protocole de `DEC-0008` | **CONFIRMÉE** |
| `F7` | L'accessibilité ne régresse pas | **CONFIRMÉE** |
| `F8` | Le moteur de référence est WebView2 | **RÉFUTÉE** |

**Aucun des huit énoncés n'a été modifié après la première mesure.** Le commit
`85a4a05` porte les critères, le plancher de lisibilité et le matériel de
référence, et il précède toute mesure publiée.

### 13.2 Critères d'acceptation de §9

| # | Condition | État |
|---|---|---|
| 1 | `F1` à `F8` ont chacun un verdict écrit, mesure jointe | **rempli** — §9 du journal, calculé par script |
| 2 | Les deux calepins mesurés sur les **mêmes** données et la **même** trajectoire | **rempli** — même générateur, même graine, même trajectoire, même session |
| 3 | `SYN-100K` joué, réserve **close ou déclarée ouverte** | **rempli** — joué; réserve `R1` **comblée quant au protocole**, réserve `R8` **déclarée entière** |
| 4 | Moteur déclaré, §5.4 appliqué intégralement si WebView2 n'a pas servi | **rempli** — §3 du journal, six tentatives, substitut déclaré, écart **NON MESURÉ** |
| 5 | Aucune régression d'accessibilité, ou variante écartée | **rempli** — 32 / 32 scénarios conformes, aucune variante écartée |
| 6 | Aucun fichier de production, de test, de dépendance ni de `graph/` changé | **rempli** — diff vide, quatre empreintes SHA-256 inchangées |
| 7 | Les cibles manquées sont publiées comme manquées | **rempli** — `F4` et `F8` réfutées, causes mesurées |
| 8 | Mémoire obligatoire à jour, `NEXT_ACTION.md` avec **exactement une** action | **rempli** |

### 13.3 Ce que la tâche ne fait pas

Elle **ne choisit pas** le calepin du produit et **n'adopte pas** un budget,
conformément à §6.1. Elle **ne lève aucune réserve** : `R1` à `R9`
d'`ACTION-0021` restent en vigueur, et seul un contrôle indépendant peut se
prononcer sur leur sort. Elle **n'ouvre pas** Canvas 2D. La porte **P4 reste
ouverte et non franchie** : aucune ligne de code de production n'a été écrite.


---

## 14. Clôture du contrôle indépendant

- **Contrôle :** [ACTION-0023](../reviews/ACTION-0023-independent-control.md),
  mené par l'**orchestrateur technique**, instance **distincte de
  l'exécuteur**, **sur preuves**
- **Résultat :** **accepté**. `TASK-0013` passe de `IMPLEMENTED` à
  **`VERIFIED`**, **avec quatre réserves**

| Réserve | Objet, en une ligne |
|---|---|
| `V1` | « 3 000 blocs visibles » n'a **pas** été mesuré tel quel — 2 856 construits. Le résultat est accepté sur une charge **supérieure**, 5 012 blocs visibles. Ne jamais écrire que 3 000 visibles ont été mesurés |
| `V2` | `F2` est conforme à son énoncé mais **n'établit pas la causalité géométrique**. Restriction conservée |
| `V3` | La correction de protocole **240 → 1 000 ips** est **acceptée** : elle a renforcé le test; aucun critère `F1` à `F8` ni le plancher de 2 400 px² n'a changé. Ce n'est **pas** un déplacement de cible |
| `V4` | La lecture minimale de métadonnées système pour localiser, versionner et lancer WebView2, Edge et Chrome est acceptée comme **déviation procédurale** causée par une **contradiction de cette fiche**. Aucune donnée utilisateur consultée, aucune écriture hors dépôt. `AGENTS.md` et `CLAUDE.md` sont clarifiés en conséquence |

**Réserves d'`ACTION-0021` :** **`R1` est LEVÉE** — son objet était l'absence de
`SYN-100K`, qui a maintenant été réellement joué. **`R8` reste EN VIGUEUR** :
aucune mesure WebView2 de production.

**Décisions techniques issues de ce contrôle :**
[`DEC-0014`](../decisions/DEC-0014-layout-baseline-and-budget-direction.md).

**La porte `P4` reste ouverte et non franchie.**
