# PERF-0005 — Mesures de B2 ter : contrôleur de budget corrigé

- **Banc d'essai :** `B2 ter` de
  [TASK-0014](../tasks/TASK-0014-b2-ter-budget-controller.md)
- **Spike :** `spikes/b2ter-budget-controller/`
- **Date de mesure :** 2026-08-31
- **Journal complet, preuves et verdicts `G1` à `G9` :**
  [TASK-0014-b2-ter-results.md](../research/TASK-0014-b2-ter-results.md)
- **Statut :** mesures de banc d'essai. **Aucune n'est une performance
  annoncée de FileTopo.**

> Ces chiffres viennent d'un prototype jetable, sur **une** machine, avec des
> arborescences **synthétiques**, et **pas dans le moteur de production**. Une
> cible manquée est publiée comme manquée; aucune n'est ajustée après coup.
>
> **Réserve `R8` d'`ACTION-0021`, en vigueur et renforcée par `DEC-0014` F :**
> ces mesures ne sont pas transposables à la production. Elles portent sur
> **Microsoft Edge** et **Google Chrome**, **jamais WebView2**.

## 1. Matériel de référence

**Déclaré et commité AVANT la première mesure**, conformément à §6 de
`TASK-0014`. Relevé par lecture minimale, ciblée et non récursive de
métadonnées système, autorisée par §3 de la fiche.

| Élément | Valeur |
|---|---|
| Processeur | Intel Core i9-9900K, 8 cœurs / 16 fils, 3 600 MHz nominal |
| Mémoire vive | 63,9 Gio |
| Carte graphique | NVIDIA GeForce RTX 2070, pilote 32.0.16.1656 |
| Écran | 1920 × 1080, **240 Hz** |
| Système | Windows 11 Professionnel, 10.0.26200, build 26200 |
| Pilotage | protocole CDP sur le client `WebSocket` **intégré** à Node v24.13.1 |
| Dépendances installées | **aucune** |

**C'est le même matériel que `B2` et `B2 bis`** ([PERF-0001](PERF-0001-b2-rendering.md) §1,
[PERF-0004](PERF-0004-b2bis-layout-and-budget.md) §1).

**Deux moteurs, et deux seulement :**

| Moteur | Version | Rôle dans `B2 ter` |
|---|---|---|
| **Microsoft Edge** | **152.0.4191.53** | **moteur principal du spike** |
| **Google Chrome** | **151.0.7922.175** | **contrôle de continuité** avec `B2` et `B2 bis` |

**Aucune tentative WebView2.** `DEC-0014` F l'interdit avant qu'un véritable
hôte Tauri existe. L'écart entre ces moteurs et WebView2 reste **NON MESURÉ**.

**Ce matériel est nettement au-dessus d'un poste ordinaire.** Les valeurs
publiées sont un **plafond favorable**, pas un cas moyen.

## 2. Protocole

**Déclaré et commité avant la première mesure.**

1. **Images par seconde relevées par l'horloge de rendu du moteur**
   (`requestAnimationFrame`), **dans la page**, jamais estimées côté Node.
   Valeur publiée : `1000 / médiane(intervalle entre images)`.
2. **Cinq exécutions** par scénario. **Médiane et écart min–max publiés.**
   Aucune exécution écartée. **Les critères « sur chacune des 5 exécutions »
   se jugent sur la pire, jamais sur la médiane.**
3. **Aucun drapeau ne débride la fréquence d'images** : ni
   `--disable-gpu-vsync`, ni `--disable-frame-rate-limit`.
4. **Nœuds DOM comptés**, jamais estimés (`querySelectorAll('*')`).
5. **Latence de sélection** : d'un `MouseEvent` réel distribué sur l'élément
   jusqu'à l'image portant le changement, lecture de disposition forcée.
   40 sélections par exécution; 95<sup>e</sup> centile publié.
6. **Fenêtre : `--headless=new`**, 1600 × 900.
7. **Données synthétiques**, graine fixe **20260831** — **identique à
   `TASK-0013`**. Générateurs et calepins repris **sans modification** de
   `spikes/fixtures/synthetic-shapes.mjs` et
   `spikes/b2bis-layout-and-budget/calepins.mjs`.
8. **Calepin fixé à `CAL-B`.** La seule variable de cette campagne est le
   **contrôleur de budget**. `CAL-A` n'apparaît que dans le contrôle ponctuel
   de la phase 3, qui ne fonde aucun critère.

### 2.1 Déroulement d'une exécution du banc de budget

1. la vue part de l'ajustement au contenu, budget au **niveau initial 4**;
2. à **600 ms**, **changement brusque de vue** : saut vers une région dense et
   zoom × 3,5 en une seule image;
3. ensuite, **déplacement continu déterministe fonction du temps écoulé**, en
   translation **et** en zoom;
4. le budget n'observe que les images **postérieures au choc**;
5. **durée observée : 14 000 ms** en phase 1 et 3, **9 000 ms** en phase 2.

### 2.2 De vraies revirtualisations, déclarées avant mesure

`B2 bis` mesurait **`revirtualisations = 0`** : le mode `transform` y était
éprouvé dans son cas **le plus favorable**. `TASK-0014` §5.4 l'interdit.

Le seuil de revirtualisation du prototype est `|k / k_ancre − 1| > 0,10` en
zoom, et un déplacement d'écran supérieur à `0,8 × marge` de la fenêtre en
translation. Les amplitudes de la trajectoire du banc — **rayon 600 unités de
monde**, **± 18 % de zoom**, **période 4 000 ms** — **dépassent les deux
seuils**. Les revirtualisations sont donc **garanties par construction**, pas
espérées.

**Le coût des reconstructions est payé dans l'image** où le contrôleur change
de seuil. Il se retrouve donc dans le temps de l'image suivante, que le
contrôleur observe. **Il n'est jamais mesuré à part puis retranché.**

### 2.3 La contrainte de la phase 2 est déclarée inatteignable AVANT mesure

Réserve `V3` d'`ACTION-0023` : une contrainte destinée à être inatteignable
doit être **déclarée inatteignable avant la mesure**, avec son motif.

La phase 2 porte la cible à **1 000 images par seconde**, ce qui place le seuil
« trop lent » à **1 ms**. **Aucune configuration de cette machine ne peut tenir
1 ms par image** : `B2 bis` a mesuré au mieux 238,10 ips, soit 4,20 ms, et
cette valeur était déjà **butée** contre la synchronisation verticale. Le seuil
rapide est abaissé à **0,8 ms** pour la seule phase 2, afin que l'ordre des
deux seuils reste cohérent.

**Ces deux valeurs ne concernent que la phase 2.** La configuration de
`TASK-0014` §5.2 est **inchangée**, et le plancher de **2 400 px²** ne bouge
pas.

### 2.4 Ce qui a été écrit et commité avant toute mesure

- les **neuf critères `G1` à `G9`**, dans `TASK-0014` §6;
- la **configuration complète du contrôleur**, dans
  `spikes/b2ter-budget-controller/budget2.mjs`;
- le **matériel de référence**, §1 ci-dessus;
- le **protocole**, §2 ci-dessus, y compris les amplitudes de §2.2 et la
  contrainte de §2.3.

**Aucun de ces éléments ne peut être modifié après la première mesure. Toute
modification serait une violation de `G9`, et serait publiée comme telle.**

## 3. Mesures

**Tous les tableaux ci-dessous sont produits par
`spikes/b2ter-budget-controller/tables2.mjs` à partir des mesures brutes.
Aucun chiffre n'est recopié à la main.**

> **Deux défauts de protocole ont été découverts APRÈS la première mesure.**
> Conformément à §6.1 de `TASK-0014`, le protocole n'a **pas** été changé,
> aucune mesure n'a été rejouée, et les défauts sont publiés — voir §4 et le
> [journal](../research/TASK-0014-b2-ter-results.md).
>
> En particulier : une valeur **`ips régime stable` de 0 ne signifie pas
> « zéro image par seconde »**. Elle signifie **« aucune image après le dernier
> changement de niveau »**. Aucune de ces valeurs ne peut être citée comme une
> performance.

### Moteur : Microsoft Edge 152.0.4191.53 — 5 exécutions par scénario

#### Phase 1 — contrôleur corrigé, `CAL-B`, quatre formes

| Forme | ips régime stable (méd. [min–max]) | ≥ 30 ips sur les 5 ? | Dernier changement (ms) | ≤ 2 s sur les 5 ? | Pire inversions / 10 s | Niveau final | Seuil final (px²) | Blocs | Nœuds DOM |
|---|---:|:---:|---:|:---:|---:|---:|---:|---:|---:|
| `SYN-EQUILIBRE` | **40 [34,25 – 40]** | **oui** | **10192,6 [2433,4 – 11845,5]** | **NON** | 0 | 0 [0 – 1] | 199,29 | 8085 [7060 – 8176] | 16731 [14706 – 16909] |
| `SYN-DEEP` | **34,13 [9,98 – 40]** | **NON** | **12096 [2387,5 – 13231,1]** | **NON** | 0 | 1 [0 – 2] | 199,29 [199,29 – 269,04] | 7958 [7621 – 8778] | 16548 [15824 – 18139] |
| `SYN-WIDE` | **59,52** | **oui** | **1030,8 [1018,3 – 1064,2]** | **oui** | 0 | 0 | 199,29 | 8056 [7296 – 8256] | 16114 [14594 – 16514] |
| `SYN-100K` | **59,88** | **oui** | **12934,8 [5480,1 – 13018,3]** | **NON** | 0 | 1 [0 – 1] | 199,29 | 4502 [4054 – 4564] | 9400 [8503 – 9519] |

#### Phase 1 — reconstructions réelles et revirtualisations

> `B2 bis` mesurait `revirtualisations = 0`. Ce banc ne le fait plus : la trajectoire dépasse les deux seuils de revirtualisation, en translation et en zoom.

| Forme | Revirtualisations | Reconstructions | dont changeant le nombre de blocs | Δ blocs max | Coût médian (ms) | Coût max (ms) | Coût total (ms) |
|---|---:|---:|---:|---:|---:|---:|---:|
| `SYN-EQUILIBRE` | **49 [47 – 51]** | 8 [4 – 10] | **8 [4 – 10]** | 747 [470 – 1526] | 21,5 [18,6 – 24] | 35,4 [27,9 – 44,6] | 198,2 [90,6 – 271,6] |
| `SYN-DEEP` | **44 [42 – 49]** | 16 [4 – 18] | **16 [4 – 18]** | 973 [751 – 2100] | 22,2 [16,2 – 28,7] | 41,5 [37,5 – 55,3] | 418 [100,3 – 508,3] |
| `SYN-WIDE` | **50** | 4 | **3 [3 – 4]** | 1090 [996 – 1135] | 23,4 [22,4 – 23,7] | 24,3 [23,5 – 25,3] | 94 [91,3 – 96] |
| `SYN-100K` | **48 [44 – 50]** | 7 [5 – 13] | **7 [5 – 13]** | 8433 [6591 – 9639] | 18,1 [16,2 – 23] | 30,6 [25 – 57,2] | 146,5 [122,7 – 285] |

#### Phase 1 — après convergence : déplacement, sélection, accessibilité

| Forme | ips déplacement | Sélection p95 (ms) | ≤ 150 ms sur les 5 ? | Revirt. du déplacement | Blocs | Nœuds DOM | ARIA | Clavier |
|---|---:|---:|:---:|---:|---:|---:|:---:|:---:|
| `SYN-EQUILIBRE` | 48,08 [47,85 – 59,52] | **15,9 [12,8 – 34,7]** | **oui** | 12 | 8207 [8018 – 8228] | 16959 [16592 – 16999] | **oui** | **oui** |
| `SYN-DEEP` | 48,08 [47,85 – 59,52] | **24,2 [22 – 30,7]** | **oui** | 12 | 8432 [7506 – 8867] | 17446 [15596 – 18319] | **oui** | **oui** |
| `SYN-WIDE` | 59,88 | **13,5 [12,6 – 21]** | **oui** | 12 | 8270 [8256 – 8270] | 16542 [16514 – 16542] | **oui** | **oui** |
| `SYN-100K` | 119,05 | **6,5 [6,2 – 6,7]** | **oui** | 12 | 4635 [4622 – 4640] | 9674 [9647 – 9682] | **oui** | **oui** |

#### Phase 2 — plancher de lisibilité sous contrainte inatteignable de 1000 ips

> Contrainte déclarée inatteignable **avant** mesure : elle place le seuil « trop lent » à 1 ms, que cette machine ne peut pas tenir.

| Forme | Niveau final / max | Seuil max observé (px²) | Plancher | Fenêtres au plancher | Plancher franchi ? | Atteint sur les 5 ? | Blocs | ips régime stable |
|---|---:|---:|---:|---:|:---:|:---:|---:|---:|
| `SYN-EQUILIBRE` | 13 / 13 | **2400** | 2400 | 72 [66 – 74] | **non** | **oui** | 841 [838 – 845] | 120,48 |
| `SYN-DEEP` | 13 / 13 | **2400** | 2400 | 80 [79 – 83] | **non** | **oui** | 922 [919 – 924] | 121,95 [121,95 – 232,56] |
| `SYN-WIDE` | 13 / 13 | **2400** | 2400 | 143 [143 – 144] | **non** | **oui** | 710 | 238,1 |
| `SYN-100K` | 13 / 13 | **2400** | 2400 | 116 [115 – 117] | **non** | **oui** | 385 [383 – 388] | 238,1 |

#### Phase 3 — contrôle ponctuel `CAL-A` / `SYN-WIDE`

> Configuration exacte qui avait réfuté `F4` dans `TASK-0013`, à 26,60 ips en régime stable. **Ce contrôle ne fonde aucun critère `G1` à `G9`.**

| Calepin | Forme | ips régime stable | ≥ 30 ips sur les 5 ? | Dernier changement (ms) | Niveau final | Seuil max (px²) | Revirtualisations | Blocs |
|---|---|---:|:---:|---:|---:|---:|---:|---:|
| `CAL-A` | `SYN-WIDE` | **40 [34,13 – 47,85]** | **oui** | 13064,3 [12141,7 – 13189,5] | 10 [9 – 10] | 1628,63 | 42 [42 – 43] | 2171 [2129 – 2995] |

### Moteur : Google Chrome 151.0.7922.175 — 5 exécutions par scénario

#### Phase 1 — contrôleur corrigé, `CAL-B`, quatre formes

| Forme | ips régime stable (méd. [min–max]) | ≥ 30 ips sur les 5 ? | Dernier changement (ms) | ≤ 2 s sur les 5 ? | Pire inversions / 10 s | Niveau final | Seuil final (px²) | Blocs | Nœuds DOM |
|---|---:|:---:|---:|:---:|---:|---:|---:|---:|---:|
| `SYN-EQUILIBRE` | **34,13 [0 – 34,25]** | **NON** | **12137,8 [11782,9 – 13227]** | **NON** | 0 | 3 [2 – 3] | 199,29 | 6593 [6428 – 7581] | 13760 [13435 – 15718] |
| `SYN-DEEP` | **0 [0 – 29,94]** | **NON** | **13264,7 [12279,7 – 13306,4]** | **NON** | 0 | 3 [2 – 3] | 199,29 [199,29 – 269,04] | 6280 [6278 – 7608] | 13169 [13156 – 15798] |
| `SYN-WIDE` | **29,94 [29,85 – 40,16]** | **NON** | **12780,5 [12112,6 – 12897,4]** | **NON** | 0 | 1 [0 – 5] | 199,29 [199,29 – 490,33] | 7555 [2735 – 8016] | 15112 [5472 – 16034] |
| `SYN-100K` | **47,85 [40,16 – 48,08]** | **oui** | **12058,4 [9646 – 12901,5]** | **NON** | 0 | 0 [0 – 1] | 199,29 | 4537 [4148 – 4679] | 9467 [8692 – 9765] |

#### Phase 1 — reconstructions réelles et revirtualisations

> `B2 bis` mesurait `revirtualisations = 0`. Ce banc ne le fait plus : la trajectoire dépasse les deux seuils de revirtualisation, en translation et en zoom.

| Forme | Revirtualisations | Reconstructions | dont changeant le nombre de blocs | Δ blocs max | Coût médian (ms) | Coût max (ms) | Coût total (ms) |
|---|---:|---:|---:|---:|---:|---:|---:|
| `SYN-EQUILIBRE` | **44 [41 – 44]** | 17 [15 – 17] | **17 [15 – 17]** | 1842 [1226 – 2076] | 22,7 [22,4 – 24,2] | 49,3 [45 – 60,4] | 449,9 [437,2 – 466,7] |
| `SYN-DEEP` | **41 [39 – 42]** | 22 [17 – 23] | **22 [17 – 23]** | 1699 [1296 – 2720] | 24,3 [17,1 – 29,1] | 41,6 [39,6 – 46,7] | 551,3 [443,4 – 576,1] |
| `SYN-WIDE` | **43 [40 – 45]** | 18 [16 – 19] | **15 [11 – 17]** | 2895 [1307 – 7996] | 24,5 [22,9 – 25,9] | 47 [37,4 – 76,1] | 488,7 [412,2 – 534,6] |
| `SYN-100K` | **46 [43 – 47]** | 10 [9 – 15] | **10 [8 – 14]** | 8915 [624 – 10353] | 20,5 [19,2 – 22,4] | 30,2 [26,9 – 39,2] | 219,4 [211,7 – 357,3] |

#### Phase 1 — après convergence : déplacement, sélection, accessibilité

| Forme | ips déplacement | Sélection p95 (ms) | ≤ 150 ms sur les 5 ? | Revirt. du déplacement | Blocs | Nœuds DOM | ARIA | Clavier |
|---|---:|---:|:---:|---:|---:|---:|:---:|:---:|
| `SYN-EQUILIBRE` | 34,25 [34,25 – 39,84] | **29,3 [21,4 – 32,4]** | **oui** | 12 | 6660 [6649 – 7620] | 13875 [13853 – 15785] | **oui** | **oui** |
| `SYN-DEEP` | 39,84 [34,13 – 40] | **29,3 [27,6 – 34,2]** | **oui** | 12 | 6123 [6095 – 7613] | 12826 [12768 – 15807] | **oui** | **oui** |
| `SYN-WIDE` | 30,03 [30,03 – 120,48] | **26,3 [6,3 – 32,6]** | **oui** | 12 | 8289 [2729 – 8316] | 16580 [5460 – 16634] | **oui** | **oui** |
| `SYN-100K` | 59,88 [59,52 – 60,24] | **13,6 [12,4 – 17,8]** | **oui** | 12 | 4679 [4660 – 4699] | 9765 [9729 – 9808] | **oui** | **oui** |

#### Phase 2 — plancher de lisibilité sous contrainte inatteignable de 1000 ips

> Contrainte déclarée inatteignable **avant** mesure : elle place le seuil « trop lent » à 1 ms, que cette machine ne peut pas tenir.

| Forme | Niveau final / max | Seuil max observé (px²) | Plancher | Fenêtres au plancher | Plancher franchi ? | Atteint sur les 5 ? | Blocs | ips régime stable |
|---|---:|---:|---:|---:|:---:|:---:|---:|---:|
| `SYN-EQUILIBRE` | 13 / 13 | **2400** | 2400 | 64 [59 – 65] | **non** | **oui** | 839 [837 – 841] | 120,48 |
| `SYN-DEEP` | 13 / 13 | **2400** | 2400 | 70 [69 – 71] | **non** | **oui** | 923 [915 – 923] | 120,48 |
| `SYN-WIDE` | 13 / 13 | **2400** | 2400 | 134 [133 – 134] | **non** | **oui** | 710 | 238,1 |
| `SYN-100K` | 13 / 13 | **2400** | 2400 | 115 [114 – 115] | **non** | **oui** | 389 [388 – 389] | 238,1 |

#### Phase 3 — contrôle ponctuel `CAL-A` / `SYN-WIDE`

> Configuration exacte qui avait réfuté `F4` dans `TASK-0013`, à 26,60 ips en régime stable. **Ce contrôle ne fonde aucun critère `G1` à `G9`.**

| Calepin | Forme | ips régime stable | ≥ 30 ips sur les 5 ? | Dernier changement (ms) | Niveau final | Seuil max (px²) | Revirtualisations | Blocs |
|---|---|---:|:---:|---:|---:|---:|---:|---:|
| `CAL-A` | `SYN-WIDE` | **0** | **NON** | 13302,2 [13277,1 – 13377,3] | 10 | 2198,65 | 36 [35 – 38] | 1388 [1382 – 1404] |


## 4. Les deux défauts de protocole, publiés

`D1` — **le « régime stable » peut ne contenir presque aucune image.** Le
protocole le fait commencer au dernier changement de niveau; quand ce
changement tombe près de la fin de l'exécution, la fenêtre ne contient plus
qu'une poignée d'images, parfois **une seule**, parfois **aucune**.

`D2` — **la fenêtre stable de `G3` est vide par construction.** Le régime
stable commence au dernier changement de niveau : après ce point il n'existe
plus aucun changement, donc **aucune inversion ne peut y être comptée**. La
mesure vaut **0 par construction** et **ne peut pas falsifier `G3`**.

**Ni l'un ni l'autre n'excuse un critère manqué.** `G1` et `G2` sont
**RÉFUTÉES**; `G3` est **BLOQUÉ**, jamais confirmé.

Le détail chiffré, les lectures supplémentaires et l'analyse de la
**quantification par la synchronisation verticale** — les deux bornes de la
zone morte tombent **exactement** sur un pas de 4,1667 ms — sont dans le
[journal](../research/TASK-0014-b2-ter-results.md) et produits par
`spikes/b2ter-budget-controller/analyse-defauts.mjs`.

## 5. Limites

- **Une seule machine**, nettement au-dessus d'un poste ordinaire, écran
  **240 Hz**, **mode sans affichage**. Les valeurs sont un **plafond
  favorable**.
- **Les temps d'image sont quantifiés** par la synchronisation verticale, en
  marches de **4,1667 ms**. Aucun écart ne doit être lu plus finement qu'une
  marche. Les valeurs de **238,10 ips** sont **butées**, pas mesurées.
- **Aucune mesure de production.** Ni WebView2, ni application empaquetée.
  Réserve `R8` d'`ACTION-0021`, en vigueur.
- **`ips régime stable` est une grandeur fragile** — défaut `D1`. Là où elle
  est citée, le nombre d'images qui la fondent est publié à côté.
- **Le plancher de lisibilité de 2 400 px² est un choix, pas une mesure.**
  Aucun essai avec des personnes ne l'a établi.
- **Aucun lecteur d'écran réel.** La conformité ARIA porte sur les attributs
  produits et sur `document.activeElement`.
- **Arborescences entièrement synthétiques**, graine fixe. Aucune donnée
  réelle.
