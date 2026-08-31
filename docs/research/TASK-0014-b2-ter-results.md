# TASK-0014 — B2 ter : journal, preuves et verdicts G1 à G9

- **Banc d'essai :** `B2 ter`, correction minimale du contrôleur de budget
  auto-régulé
- **Fiche :** [TASK-0014](../tasks/TASK-0014-b2-ter-budget-controller.md)
- **Mesures :** [PERF-0005](../performance/PERF-0005-b2ter-budget-controller.md)
- **Spike :** `spikes/b2ter-budget-controller/`
- **Date :** 2026-08-31
- **Branche :** `spike/v0.2-budget-controller`, créée depuis `933bd0d`
- **Statut de la tâche à l'issue :** **`IMPLEMENTED`, jamais `VERIFIED`.**
  L'exécuteur ne juge pas ses propres preuves.

---

## 1. Résultat, en une phrase

**La correction minimale est RÉFUTÉE sur ses deux critères principaux.** Elle
corrige bien les deux causes que `TASK-0013` avait mesurées, et cela se voit;
mais elle ne tient **ni la cible** `G1`, **ni la convergence** `G2` dès que la
charge varie réellement — et la mesure de la stabilité `G3` s'est révélée
**incapable de falsifier**, donc **bloquée**.

| Critère | Verdict |
|---|---|
| `G1` — cible ≥ 30 ips en régime stable | **RÉFUTÉE** |
| `G2` — convergence ≤ 2 000 ms | **RÉFUTÉE** |
| `G3` — au plus 2 inversions / 10 s | **BLOQUÉ** — mesure vacueuse |
| `G4` — plancher de lisibilité | **CONFIRMÉE** |
| `G5` — déterminisme | **CONFIRMÉE** |
| `G6` — reconstruction réelle | **CONFIRMÉE** |
| `G7` — accessibilité | **CONFIRMÉE** |
| `G8` — `SYN-100K` | **CONFIRMÉE** |
| `G9` — intégrité du protocole | **CONFIRMÉE**, avec une déclaration en §8 |

**Aucun contrôleur n'est adopté par cette tâche.** `DEC-0014` D et E restent en
vigueur.

## 2. Ce qui a été éprouvé, et ce qui ne l'a pas été

**Éprouvé :** un contrôleur corrigé sur les **deux causes** mesurées de la
réfutation de `F4` — plus de zone morte sous la cible, plus de refroidissement
sur un mouvement de même sens —, sur `CAL-B`, sur les **quatre formes**, avec
de **vraies** revirtualisations et de **vraies** reconstructions DOM.

**Non éprouvé :** WebView2 — `DEC-0014` F l'interdit; Canvas 2D et WebGL;
tout autre calepin que `CAL-B`, hors le contrôle ponctuel de la phase 3; toute
autre machine; tout lecteur d'écran réel; toute donnée réelle.

## 3. Préséance : les critères précèdent les mesures, et c'est vérifiable

| Élément | Où | Commit |
|---|---|---|
| Critères `G1` à `G9` | `TASK-0014` §6 | `4a5520b` |
| Configuration du contrôleur | `spikes/b2ter-budget-controller/budget2.mjs` | `4a5520b` |
| Matériel de référence | `PERF-0005` §1 | `4a5520b` |
| Protocole, amplitudes, contrainte de la phase 2 | `PERF-0005` §2 | `4a5520b` |

**Le commit `4a5520b` précède toute mesure de cette campagne.** La préséance est
vérifiable dans l'historique Git.

**Empreintes SHA-256, disque contre commit `4a5520b`, après la campagne :**

| Fichier | Empreinte, 16 premiers caractères | Identique au commit ? |
|---|---|---|
| `budget2.mjs` | `0023b50e7e47c45e` | **oui** |
| `map3.html` | `ed4d4014b69f4611` | **oui** |
| `run-b2ter.mjs` | `c5907d8b841e7128` | **oui** |

**Le contrôleur, la page de mesure et le pilote sont octet pour octet ceux qui
ont été commités avant la première mesure.**

## 4. Les deux causes de `F4` sont bien corrigées — et cela se mesure

### 4.1 Cause 2 — l'affinage continu n'est plus interrompu

Sur la trace synthétique de `replay-budget2.mjs`, le contrôleur enchaîne
**13 affinages consécutifs sans une seule fenêtre perdue**. Le contrôleur de
`TASK-0013` en aurait consommé **trois fenêtres par niveau**.

Sur mesure réelle, `CAL-B` / `SYN-WIDE` sur Edge descend du niveau 4 au
niveau 0 en **quatre fenêtres consécutives** — 321 ms, 542 ms, 759 ms,
1 018 ms — et **converge en 1 030,8 ms [1 018,3 – 1 064,2]**, sur les cinq
exécutions. C'est **la seule forme** où `G2` est tenue, et elle l'est
largement.

### 4.2 Cause 1 — un régime à 29,94 ips n'est plus considéré comme stable

Le contrôleur de `TASK-0013` tolérait jusqu'à **26,1 ips**. Le contrôleur
corrigé agrège dès **33,4 ms**, soit **29,94 ips**. Sur Edge, **40 agrégations**
ont été déclenchées entre 33,333 et 34,5 ms, c'est-à-dire **juste au-dessus de
la cible** : le contrôleur refuse désormais un régime sous 30 ips.

### 4.3 Le contrôle ponctuel `CAL-A` / `SYN-WIDE` le montre en clair

C'est la configuration exacte qui avait réfuté `F4`, à **26,60 ips** en régime
stable. **Ce contrôle ne fonde aucun critère `G1` à `G9`.**

| Moteur | Niveau final | Seuil atteint (px²) | ips médian sur toute la période, 5 exécutions | Blocs |
|---|---:|---:|---|---:|
| Edge | 9 à 10 | 1 628,63 | **30,03 · 34,13 · 34,25 · 34,25 · 30,03** | 2 129 à 2 995 |
| Chrome | 10 | 2 198,65 | **26,60 · 26,60 · 26,60 · 26,60 · 26,67** | 1 382 à 1 404 |

**Sur Edge, le contrôleur corrigé sort de la zone à 26,6 ips** : il continue
d'agréger jusqu'au niveau 9-10 et tient 30 ips ou plus. **Sur Chrome, il
n'y parvient pas** : il agrège jusqu'au niveau 10 et reste à **26,60 ips**,
exactement la valeur de `TASK-0013`. La correction déplace le problème sur le
moteur le plus lent; elle ne le supprime pas.

## 5. Ce qui a changé dans le banc, et pourquoi cela rend le test plus dur

`B2 bis` mesurait **`revirtualisations = 0`** : le mode `transform` y était
éprouvé dans son cas **le plus favorable**. `TASK-0014` §5.4 l'interdit.

La trajectoire de ce banc dépasse **les deux** seuils de revirtualisation, en
translation et en zoom. Résultat mesuré : **42 à 51 revirtualisations par
exécution**, sur toutes les formes et les deux moteurs.

**Le coût d'une reconstruction est réel, et il tient dans l'image.** Coût
médian mesuré : **18,1 à 25,5 ms**, soit **0,57 à 0,76 image** du budget de
33,3 ms d'une image à 30 ips. Coût maximal observé : **76,1 ms** sur Chrome,
soit plus de deux images.

**Ce coût est payé dans l'image où le seuil change**, donc il se retrouve dans
le temps de l'image suivante, que le contrôleur observe. Il n'a jamais été
mesuré à part puis retranché.

## 6. Verdicts, calculés par script

Les tableaux ci-dessous sont produits par
`spikes/b2ter-budget-controller/verdicts2.mjs` à partir des mesures brutes.
Aucun verdict n'est écrit à la main. Les critères « sur chacune des
5 exécutions » sont jugés sur la **pire** exécution, jamais sur la médiane.

### 6.1 Moteur principal — Microsoft Edge 152.0.4191.53

| # | Énoncé | Verdict | Mesure qui le fonde |
|---|---|---|---|
| **`G1`** | Cible : régime stable ≥ 30 ips sur chacune des 5 exécutions et les quatre formes | **RÉFUTÉE** | ips en régime stable, médiane [min – max] : SYN-EQUILIBRE 40 [34,25 – 40]; SYN-DEEP 34,13 [9,98 – 40]; SYN-WIDE 59,52 [59,52 – 59,52]; SYN-100K 59,88 [59,88 – 59,88]. Formes en défaut : SYN-DEEP min=9,98 |
| **`G2`** | Convergence : dernier changement de niveau ≤ 2 000 ms sur chacune des 5 exécutions et les quatre formes | **RÉFUTÉE** | instant du dernier changement de niveau après le choc : SYN-EQUILIBRE 10192,6 ms [2433,4 – 11845,5]; SYN-DEEP 12096 ms [2387,5 – 13231,1]; SYN-WIDE 1030,8 ms [1018,3 – 1064,2]; SYN-100K 12934,8 ms [5480,1 – 13018,3]. Formes en défaut : SYN-EQUILIBRE max=11845,5 ms, SYN-DEEP max=13231,1 ms, SYN-100K max=13018,3 ms |
| **`G3`** | Stabilité : au plus 2 inversions de direction sur toute fenêtre glissante de 10 s du régime stable | **BLOQUÉE** | **MESURE VACUEUSE** : le régime stable commence au dernier changement de niveau, donc il ne contient aucun changement et aucune inversion ne peut y être comptée. Valeurs relevées, toutes nulles par construction : SYN-EQUILIBRE pire=0; SYN-DEEP pire=0; SYN-WIDE pire=0; SYN-100K pire=0. Voir le défaut `D2` et la lecture supplémentaire sur toute la période observée. |
| **`G4`** | Lisibilité : 2 400 px² jamais dépassé, plancher réellement atteint au moins une fois, et le contrôleur y reste | **CONFIRMÉE** | plancher jamais franchi : true. Plancher réellement atteint sous contrainte inatteignable de 1000 ips : true (toutes exécutions : true). Phase 2 : SYN-EQUILIBRE niveau=13/13 seuil=2400 fenêtres au plancher=72; SYN-DEEP niveau=13/13 seuil=2400 fenêtres au plancher=80; SYN-WIDE niveau=13/13 seuil=2400 fenêtres au plancher=143; SYN-100K niveau=13/13 seuil=2400 fenêtres au plancher=116. |
| **`G5`** | Déterminisme : rejeu de toutes les traces réelles, zéro divergence | **VOIR replay-budget2.mjs** | calculé par `replay-budget2.mjs`, hors navigateur — voir le journal |
| **`G6`** | Reconstruction réelle : au moins un scénario par forme change le nombre de blocs DOM construits, coût mesuré et inclus dans les temps d'image | **CONFIRMÉE** | SYN-EQUILIBRE reconstructions=8 dont changeant les blocs=8, Δblocs max=1526, coût médian=21,5 ms, coût max=44,6 ms, revirtualisations=49; SYN-DEEP reconstructions=16 dont changeant les blocs=16, Δblocs max=2100, coût médian=22,2 ms, coût max=55,3 ms, revirtualisations=44; SYN-WIDE reconstructions=4 dont changeant les blocs=3, Δblocs max=1135, coût médian=23,4 ms, coût max=25,3 ms, revirtualisations=50; SYN-100K reconstructions=7 dont changeant les blocs=7, Δblocs max=9639, coût médian=18,1 ms, coût max=57,2 ms, revirtualisations=48. Revirtualisations non nulles sur toutes les exécutions : true. |
| **`G7`** | Accessibilité : zéro régression ARIA et clavier sur tous les scénarios, après les changements de niveau | **CONFIRMÉE** | 25 exécutions contrôlées après les changements de niveau du budget; ARIA conforme partout : true; clavier conforme partout : true. |
| **`G8`** | SYN-100K : ≥ 30 ips et p95 de sélection ≤ 150 ms sur chacune des 5 exécutions, budget actif | **CONFIRMÉE** | ips en régime stable 59,88 [59,88 – 59,88]; p95 de sélection 6,5 ms [6,2 – 6,7]; blocs construits 4502 pour 100 000 éléments indexés; nœuds DOM 9400 |
| **`G9`** | Intégrité du protocole : aucun seuil, constante, critère ou paramètre modifié après le premier résultat | **CONFIRMÉE** | configuration employée pendant la campagne identique à TASK-0014 §5.2 : cibleIps=30, fenetre=12, seuilMin=60, seuilMax=2400, ratio=1,35, niveauInitial=4, seuilRapideMs=25, refroidissementApresInversion=2; seuil lent = 1000/30 = 33,3333 ms, sans marge. Contrainte de la phase 2 déclarée avant mesure : 1000 ips. |

### 6.2 Contrôle de continuité — Google Chrome 151.0.7922.175

| # | Énoncé | Verdict | Mesure qui le fonde |
|---|---|---|---|
| **`G1`** | Cible : régime stable ≥ 30 ips sur chacune des 5 exécutions et les quatre formes | **RÉFUTÉE** | ips en régime stable, médiane [min – max] : SYN-EQUILIBRE 34,13 [0 – 34,25]; SYN-DEEP 0 [0 – 29,94]; SYN-WIDE 29,94 [29,85 – 40,16]; SYN-100K 47,85 [40,16 – 48,08]. Formes en défaut : SYN-EQUILIBRE min=0, SYN-DEEP min=0, SYN-WIDE min=29,85 |
| **`G2`** | Convergence : dernier changement de niveau ≤ 2 000 ms sur chacune des 5 exécutions et les quatre formes | **RÉFUTÉE** | instant du dernier changement de niveau après le choc : SYN-EQUILIBRE 12137,8 ms [11782,9 – 13227]; SYN-DEEP 13264,7 ms [12279,7 – 13306,4]; SYN-WIDE 12780,5 ms [12112,6 – 12897,4]; SYN-100K 12058,4 ms [9646 – 12901,5]. Formes en défaut : SYN-EQUILIBRE max=13227 ms, SYN-DEEP max=13306,4 ms, SYN-WIDE max=12897,4 ms, SYN-100K max=12901,5 ms |
| **`G3`** | Stabilité : au plus 2 inversions de direction sur toute fenêtre glissante de 10 s du régime stable | **BLOQUÉE** | **MESURE VACUEUSE** : le régime stable commence au dernier changement de niveau, donc il ne contient aucun changement et aucune inversion ne peut y être comptée. Valeurs relevées, toutes nulles par construction : SYN-EQUILIBRE pire=0; SYN-DEEP pire=0; SYN-WIDE pire=0; SYN-100K pire=0. Voir le défaut `D2` et la lecture supplémentaire sur toute la période observée. |
| **`G4`** | Lisibilité : 2 400 px² jamais dépassé, plancher réellement atteint au moins une fois, et le contrôleur y reste | **CONFIRMÉE** | plancher jamais franchi : true. Plancher réellement atteint sous contrainte inatteignable de 1000 ips : true (toutes exécutions : true). Phase 2 : SYN-EQUILIBRE niveau=13/13 seuil=2400 fenêtres au plancher=64; SYN-DEEP niveau=13/13 seuil=2400 fenêtres au plancher=70; SYN-WIDE niveau=13/13 seuil=2400 fenêtres au plancher=134; SYN-100K niveau=13/13 seuil=2400 fenêtres au plancher=115. |
| **`G5`** | Déterminisme : rejeu de toutes les traces réelles, zéro divergence | **VOIR replay-budget2.mjs** | calculé par `replay-budget2.mjs`, hors navigateur — voir le journal |
| **`G6`** | Reconstruction réelle : au moins un scénario par forme change le nombre de blocs DOM construits, coût mesuré et inclus dans les temps d'image | **CONFIRMÉE** | SYN-EQUILIBRE reconstructions=17 dont changeant les blocs=17, Δblocs max=2076, coût médian=22,7 ms, coût max=60,4 ms, revirtualisations=44; SYN-DEEP reconstructions=22 dont changeant les blocs=22, Δblocs max=2720, coût médian=24,3 ms, coût max=46,7 ms, revirtualisations=41; SYN-WIDE reconstructions=18 dont changeant les blocs=15, Δblocs max=7996, coût médian=24,5 ms, coût max=76,1 ms, revirtualisations=43; SYN-100K reconstructions=10 dont changeant les blocs=10, Δblocs max=10353, coût médian=20,5 ms, coût max=39,2 ms, revirtualisations=46. Revirtualisations non nulles sur toutes les exécutions : true. |
| **`G7`** | Accessibilité : zéro régression ARIA et clavier sur tous les scénarios, après les changements de niveau | **CONFIRMÉE** | 25 exécutions contrôlées après les changements de niveau du budget; ARIA conforme partout : true; clavier conforme partout : true. |
| **`G8`** | SYN-100K : ≥ 30 ips et p95 de sélection ≤ 150 ms sur chacune des 5 exécutions, budget actif | **CONFIRMÉE** | ips en régime stable 47,85 [40,16 – 48,08]; p95 de sélection 13,6 ms [12,4 – 17,8]; blocs construits 4537 pour 100 000 éléments indexés; nœuds DOM 9467 |
| **`G9`** | Intégrité du protocole : aucun seuil, constante, critère ou paramètre modifié après le premier résultat | **CONFIRMÉE** | configuration employée pendant la campagne identique à TASK-0014 §5.2 : cibleIps=30, fenetre=12, seuilMin=60, seuilMax=2400, ratio=1,35, niveauInitial=4, seuilRapideMs=25, refroidissementApresInversion=2; seuil lent = 1000/30 = 33,3333 ms, sans marge. Contrainte de la phase 2 déclarée avant mesure : 1000 ips. |

### 6.3 `G5` — déterminisme, calculé hors navigateur

`replay-budget2.mjs`, exécuté après la campagne :

- trace synthétique de 600 images, rejouée deux fois : **signatures
  identiques**;
- **95 traces réelles** relevées dans la page — 70 sur Edge, 25 sur Chrome —
  rejouées hors navigateur et comparées décision par décision à la signature
  produite dans le moteur : **0 divergence**;
- chaque trace rejouée **deux fois** : **0 divergence interne**;
- contrôle statique de `budget2.mjs`, commentaires retirés, 101 lignes de code :
  **aucun** motif interdit — ni stockage, ni écriture, ni `Date.now`, ni
  `Math.random`, ni `performance.now`.

**`G5` est CONFIRMÉE.** Le contrôleur qui décide dans le moteur et celui qui
est rejoué dans Node sont **le même fichier**, injecté sans copie.

## 7. Les deux défauts de protocole, publiés sans atténuation

**Découverts APRÈS la première mesure.** Conformément à §6.1 de `TASK-0014` :
le protocole **n'a pas été changé**, **aucune mesure n'a été rejouée**, et le
critère concerné est rendu **bloqué**. Aucune cible n'a été déplacée.

> **Écrit après la première mesure.** Aucun seuil, aucune constante, aucun
> critère et aucun paramètre du contrôleur n'a été modifié. Aucune mesure
> n'a été rejouée. `G1` et `G2` restent **RÉFUTÉES**; `G3` est **BLOQUÉE**.

### Défaut `D1` — le « régime stable » peut ne contenir presque aucune image

Le protocole définit le régime stable comme *tout ce qui suit le dernier
changement de niveau, plus 200 ms*. Quand le dernier changement tombe près
de la fin de l'exécution, cette fenêtre ne contient plus qu'une poignée
d'images — parfois **une seule**, parfois **aucune**. `1000 / médiane` sur
un tel échantillon n'est pas une fréquence de régime : c'est un artefact.

**Conséquence de lecture, obligatoire.** Une valeur `ips régime stable` de
**0** ne signifie PAS « zéro image par seconde mesurée » : elle signifie
**« aucune image après le dernier changement »**. Aucune de ces valeurs ne
peut être citée comme une performance.

| Moteur | Forme | Images du régime stable, par exécution | ips régime stable, par exécution | ips médian sur TOUTE la période observée |
|---|---|---|---|---|
| Microsoft Edge | `CAL-B` / `SYN-EQUILIBRE` | 390, 112, 231, 100, 42 | 40, 40, 40, 39,84, 34,25 | 40, 40, 40, 40, 39,84 |
| Microsoft Edge | `CAL-B` / `SYN-DEEP` | 248, 26, 1, 31, 411 | 39,84, 34,13, 9,98, 30,03, 40 | 40, 39,84, 39,84, 39,68, 40 |
| Microsoft Edge | `CAL-B` / `SYN-WIDE` | 570, 580, 576, 587, 586 | 59,52, 59,52, 59,52, 59,52, 59,52 | 59,52, 59,52, 59,52, 59,88, 59,88 |
| Microsoft Edge | `CAL-B` / `SYN-100K` | 13, 68, 384, 16, 11 | 59,88, 59,88, 59,88, 59,88, 59,88 | 59,88, 59,88, 60,24, 59,88, 59,88 |
| Microsoft Edge | `CAL-A` / `SYN-WIDE` | 2, 10, 35, 7, 7 | 40, 47,85, 34,13, 47,85, 40 | 30,03, 34,13, 34,25, 34,25, 30,03 |
| Google Chrome | `CAL-B` / `SYN-EQUILIBRE` | 30, 36, 0, 41, 29 | 29,94, 34,25, aucune, 34,13, 34,13 | 34,25, 34,25, 34,25, 34,25, 34,25 |
| Google Chrome | `CAL-B` / `SYN-DEEP` | 3, 24, 0, 0, 0 | 21,79, 29,94, aucune, aucune, aucune | 34,36, 39,84, 34,36, 39,84, 34,25 |
| Google Chrome | `CAL-B` / `SYN-WIDE` | 12, 12, 8, 10, 41 | 29,85, 29,94, 29,94, 29,94, 40,16 | 39,84, 39,84, 39,84, 40, 39,84 |
| Google Chrome | `CAL-B` / `SYN-100K` | 37, 18, 137, 14, 34 | 47,85, 47,85, 48,08, 48,08, 40,16 | 48,08, 48,08, 48,08, 48,08, 48,08 |
| Google Chrome | `CAL-A` / `SYN-WIDE` | 0, 0, 0, 0, 0 | aucune, aucune, aucune, aucune, aucune | 26,6, 26,6, 26,6, 26,6, 26,67 |

### Défaut `D2` — la fenêtre stable de `G3` est vide par construction

`G3` compte les inversions de direction **sur une fenêtre stable de 10 s**.
Le protocole fait commencer le régime stable **au dernier changement de
niveau**. Après ce point, il n'existe **plus aucun changement**, donc
**plus aucune inversion possible** : la mesure vaut **0 par construction**,
quelle que soit la conduite réelle du contrôleur.

**La mesure de `G3` ne peut donc pas falsifier `G3`.** Conformément à
§6.1 de `TASK-0014`, le critère est publié **BLOQUÉ**, jamais confirmé.
Une mesure incapable de réfuter n'est pas une confirmation.

**Lecture supplémentaire, qui n'est PAS `G3`.** Ci-dessous, le pire nombre
d'inversions sur une fenêtre glissante de 10 s de **toute la période
observée après le choc**, et non de la seule fenêtre stable. Cette lecture
**n'établit aucun verdict** : elle porte sur une fenêtre que le critère ne
nomme pas.

| Moteur | Forme | Pire inversions / 10 s sur TOUTE la période, par exécution | Inversions totales, par exécution |
|---|---|---|---|
| Microsoft Edge | `CAL-B` / `SYN-EQUILIBRE` | 0, 4, 2, 4, 3 | 0, 4, 2, 4, 3 |
| Microsoft Edge | `CAL-B` / `SYN-DEEP` | 2, 5, 5, 5, 0 | 2, 5, 5, 6, 0 |
| Microsoft Edge | `CAL-B` / `SYN-WIDE` | 0, 0, 0, 0, 0 | 0, 0, 0, 0, 0 |
| Microsoft Edge | `CAL-B` / `SYN-100K` | 0, 7, 2, 8, 2 | 1, 8, 2, 9, 3 |
| Microsoft Edge | `CAL-A` / `SYN-WIDE` | 6, 6, 5, 6, 6 | 6, 6, 5, 6, 6 |
| Google Chrome | `CAL-B` / `SYN-EQUILIBRE` | 5, 5, 5, 5, 5 | 5, 5, 5, 5, 5 |
| Google Chrome | `CAL-B` / `SYN-DEEP` | 5, 5, 5, 5, 5 | 5, 5, 6, 5, 5 |
| Google Chrome | `CAL-B` / `SYN-WIDE` | 6, 8, 6, 8, 7 | 8, 10, 8, 10, 9 |
| Google Chrome | `CAL-B` / `SYN-100K` | 5, 4, 6, 10, 5 | 6, 5, 6, 11, 6 |
| Google Chrome | `CAL-A` / `SYN-WIDE` | 3, 3, 3, 3, 3 | 3, 3, 3, 3, 3 |

**Pire valeur observée, tous moteurs et toutes formes confondus : **10**.** Si `G3` avait été écrit sur cette fenêtre, il aurait été **RÉFUTÉ**. Ce n'est pas ce qui a été écrit,
donc ce n'est pas le verdict : `G3` est **BLOQUÉ**.

### Lecture supplémentaire — le coût d'une reconstruction, rapporté au temps d'image

Le coût d'une reconstruction est payé **dans l'image** où le contrôleur
change de seuil. À 30 images par seconde, le budget d'une image est de
**33,3 ms**. Les valeurs ci-dessous disent combien d'images ce coût occupe.

| Moteur | Forme | Coût médian (ms) | Coût max (ms) | Coût médian, en images de 33,3 ms | Reconstructions changeant le nombre de blocs |
|---|---|---:|---:|---:|---:|
| Microsoft Edge | `SYN-EQUILIBRE` | 24,00 | 44,60 | 0,72 | 37 |
| Microsoft Edge | `SYN-DEEP` | 25,50 | 55,30 | 0,76 | 61 |
| Microsoft Edge | `SYN-WIDE` | 23,50 | 25,30 | 0,70 | 17 |
| Microsoft Edge | `SYN-100K` | 19,10 | 57,20 | 0,57 | 43 |
| Google Chrome | `SYN-EQUILIBRE` | 23,50 | 60,40 | 0,70 | 82 |
| Google Chrome | `SYN-DEEP` | 24,10 | 46,70 | 0,72 | 103 |
| Google Chrome | `SYN-WIDE` | 24,60 | 76,10 | 0,74 | 73 |
| Google Chrome | `SYN-100K` | 20,50 | 39,20 | 0,61 | 51 |

### Lecture supplémentaire — les deux seuils tombent sur un pas de synchronisation verticale

L'écran est à **240 Hz** : les temps d'image sont quantifiés en marches de
**4,1667 ms**. Or :

- le seuil lent vaut **1000 / 30 = 33,3333 ms**, soit **exactement 8 marches**;
- le seuil rapide vaut **25,0 ms**, soit **exactement 6 marches**.

Les deux bornes de la zone morte coïncident donc avec une valeur que le
moteur produit **très fréquemment**. Une fluctuation inférieure à la
milliseconde fait alors basculer la décision d'un côté ou de l'autre.

| Moteur | Fenêtres de décision | Médianes dans la marche des 33,3 ms (= 30,0 ips) | Part | Médianes dans la marche des 25,0 ms (= 40,0 ips) | Part |
|---|---:|---:|---:|---:|---:|
| Microsoft Edge | 1066 | **62** | 5,8 % | **157** | 14,7 % |
| Google Chrome | 832 | **89** | 10,7 % | **112** | 13,5 % |

Ce que cela explique, et qui est mesuré. Une part importante des fenêtres
de décision se présente **exactement sur une borne**. Le contrôleur corrigé
n'a **aucune marge** au seuil lent — c'est la correction demandée de la
CAUSE 1 — et **aucun refroidissement** ne freine un mouvement de même sens —
correction de la CAUSE 2. Sur cette borne, il **bascule**. C’est la cause
mesurée du battement observé plus haut, et de la convergence tardive : une
médiane à 25,0 ms n'est **pas** « strictement inférieure à 25 », donc le
contrôleur **n'affine pas** et attend.

**Ce constat n’excuse aucun critère manqué.** `G1` et `G2` restent réfutées.

## 8. `G9` — déclaration intégrale de ce qui a été touché après la première mesure

**Le contrôleur, la page de mesure et le pilote sont octet pour octet ceux du
commit `4a5520b`** — empreintes en §3. Aucun seuil, aucune constante, aucun
critère et aucun paramètre du contrôleur n'a bougé.

**Deux fichiers ont été touchés après la première mesure, et les voici :**

1. **`verdicts2.mjs`, ligne de verdict de `G3`.** Le script rendait `G3`
   « CONFIRMÉE » sur une mesure nulle **par construction**. Cette ligne a été
   changée pour rendre **`BLOQUÉE`**. Ce changement **retire une confirmation
   et n'en ajoute aucune** : il rend le verdict **plus strict**. Aucun seuil
   n'a été touché.
2. **`analyse-defauts.mjs`, fichier nouveau.** Il **ne mesure rien** et ne
   rejoue rien : il relit les mesures déjà collectées pour publier les défauts
   et des lectures supplémentaires, toutes étiquetées comme n'établissant aucun
   verdict.

**C'est au contrôle indépendant de juger si ces deux gestes respectent `G9`.**
L'exécuteur les déclare; il ne se donne pas quitus.

## 9. Ce que ce banc établit, et ce qu'il n'établit pas

**Il établit :**

1. la correction des **deux causes** de `F4` fonctionne, et se mesure — §4;
2. le contrôleur **ne tient toujours pas la cible** dès que la charge varie
   réellement — `G1` réfutée;
3. il **ne converge pas** au sens de `G2` : sous charge variable, il continue
   d'ajuster jusqu'à la fin de l'exécution;
4. il **respecte absolument le plancher de lisibilité** — `G4`, sur les deux
   moteurs, toutes formes, toutes exécutions;
5. il est **déterministe** — `G5`, 95 traces réelles;
6. il **n'abîme pas l'accessibilité** — `G7`, 50 exécutions contrôlées après
   les changements de niveau;
7. `SYN-100K` **tient les deux seuils** avec budget actif — `G8`.

**Il n'établit pas :**

- que le principe du budget auto-régulé soit invalide. **Ce qui est réfuté est
  cette correction, pas le principe.** `DEC-0014` E reste en vigueur;
- ce que ferait un contrôleur avec une **marge non nulle mais inférieure à
  celle de `TASK-0013`**, ou avec une **hystérésis** : cela n'a **pas été
  mesuré**, et aucune valeur ne peut être supposée;
- ce que ferait ce contrôleur dans **WebView2** : **NON MESURÉ**;
- ce que ferait ce contrôleur sur un **poste ordinaire** : **NON MESURÉ**.

## 10. Non testé, et limites

- **Aucune mesure de production.** Ni WebView2, ni application empaquetée.
  Réserve `R8` d'`ACTION-0021`, **en vigueur**.
- **Une seule machine**, nettement au-dessus d'un poste ordinaire, écran
  **240 Hz**, **mode sans affichage**. Plafond favorable.
- **Les temps d'image sont quantifiés** en marches de **4,1667 ms**. Aucun
  écart ne doit être lu plus finement qu'une marche. Les valeurs de
  **238,10 ips** sont **butées**, pas mesurées.
- **`ips régime stable` est une grandeur fragile** — défaut `D1`. Une valeur
  de **0** signifie **« aucune image après le dernier changement »**, jamais
  « zéro image par seconde ». `G8` repose sur cette même grandeur : ses
  échantillons stables comptent **11 à 384 images** sur Edge et **14 à 137**
  sur Chrome, et la médiane sur **toute** la période observée la corrobore —
  59,88 ips sur Edge, 48,08 ips sur Chrome, sur les cinq exécutions.
- **Le plancher de 2 400 px² est un choix, pas une mesure.** Aucun essai avec
  des personnes ne l'a établi.
- **Aucun lecteur d'écran réel.** La conformité ARIA porte sur les attributs
  produits et sur `document.activeElement`.
- **Arborescences entièrement synthétiques**, graine **20260831**, identique à
  `TASK-0013`. Aucune donnée réelle, aucun fichier de l'utilisateur.
- **Aucune dépendance installée**, ni dans le dépôt, ni sur le système.
- **Aucun code de production n'a été écrit.** La porte **P4** reste ouverte et
  non franchie.
- Le **contrôle ponctuel `CAL-A`** de la phase 3 **ne fonde aucun critère**.

## 11. Périmètre respecté

- **Aucune écriture hors du dépôt.** Tout ce que la campagne a écrit est allé
  sous `spikes/.work/b2ter/`, ignoré par Git, y compris les profils de
  navigateur.
- **Lecture d'environnement** : présence, chemin et version des exécutables
  Edge et Chrome, et métadonnées matérielles du poste. Lecture **minimale,
  ciblée et non récursive**, autorisée par `TASK-0014` §3 au titre de la
  section « Lecture minimale de l'environnement technique » d'`AGENTS.md`.
  **Aucun dossier personnel, aucun document, aucun contenu utilisateur, aucune
  donnée réelle.**
- **Aucune fiche `DEC` existante modifiée**, aucune preuve de `TASK-0013`
  retouchée, aucun fichier de production, de test, de dépendance ni de `graph/`
  touché.
- **Aucune tentative WebView2.**
- **Aucune fusion, aucune PR, aucune release, aucune étiquette, aucun
  `force push`, aucune réécriture d'historique.**
