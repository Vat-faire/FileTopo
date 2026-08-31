# PERF-0004 — Mesures de B2 bis : calepins comparés, budget de rendu, SYN-100K

- **Banc d'essai :** `B2 bis` de
  [TASK-0013](../tasks/TASK-0013-b2-bis-layout-and-render-budget.md)
- **Spike :** `spikes/b2bis-layout-and-budget/`
- **Date de mesure :** 2026-08-31
- **Journal complet, preuves et verdicts `F1` à `F8` :**
  [TASK-0013-b2-bis-results.md](../research/TASK-0013-b2-bis-results.md)
- **Statut :** mesures de banc d'essai. **Aucune n'est une performance
  annoncée de FileTopo.**

> Ces chiffres viennent d'un prototype jetable, sur **une** machine, avec des
> arborescences **synthétiques**, et **pas dans le moteur de production**. Une
> cible manquée est publiée comme manquée; aucune n'a été ajustée après coup.
>
> **Réserve `R8` du contrôle indépendant `ACTION-0021`** : les mesures ne sont
> pas directement transposables à la production. `B2` mesurait Chrome; `B2 bis`
> mesure **Microsoft Edge** et **Google Chrome** — **pas WebView2**. Voir §3.

## 1. Matériel de référence

Déclaré **avant la première mesure publiée**, conformément à §6 de `TASK-0013`.
Ce paragraphe a été écrit et **commité avant** le lancement de la campagne.

| Élément | Valeur |
|---|---|
| Processeur | Intel Core i9-9900K, 8 cœurs / 16 fils, 3 600 MHz nominal |
| Mémoire vive | 63,9 Gio |
| Carte graphique | NVIDIA GeForce RTX 2070, pilote 32.0.16.1656 |
| Écran | 1920 × 1080, **240 Hz** |
| Système | Windows 11 Professionnel, 10.0.26200, build 26200 |
| Pilotage | protocole CDP sur le client `WebSocket` **intégré** à Node v24.13.1 |
| Dépendances installées | **aucune** |

**Trois moteurs sont en présence sur cette machine**, et ils sont nommés
partout où une mesure est publiée :

| Moteur | Version | Rôle dans `B2 bis` |
|---|---|---|
| **Microsoft Edge** | **152.0.4191.53** | **substitut de référence**, §3 |
| **Google Chrome** | **151.0.7922.175** | **contrôle de continuité** avec `B2`, §3 |
| **WebView2 Evergreen Runtime** | **151.0.4129.107** | **moteur visé, non instrumentable**, §3 |

**C'est le même matériel que `B2`** ([PERF-0001](PERF-0001-b2-rendering.md) §1).
Les comparaisons avec `B2` portent donc sur la même machine — mais **pas** sur
le même moteur.

**L'écran est à 240 Hz.** Le seuil de 30 images par seconde n'est donc pas
masqué par un plafond de synchronisation verticale à 60 Hz, et les valeurs
supérieures à 60 ips publiées plus bas sont réelles.

**Ce matériel est nettement au-dessus d'un poste ordinaire.** Les valeurs
publiées sont un **plafond favorable**, pas un cas moyen.

## 2. Protocole

Repris de `B2`, inchangé sur tous les points communs, afin que la comparaison
entre `B2` et `B2 bis` reste licite.

1. **Images par seconde relevées par l'horloge de rendu du moteur**
   (`requestAnimationFrame`), **dans la page**, jamais estimées côté Node.
   Valeur publiée : `1000 / médiane(intervalle entre images)`.
2. **Trajectoire scriptée identique** entre exécutions, entre calepins et
   entre formes : réinitialisation de la page, puis 120 images le long d'un
   chemin déterministe.
3. **Cinq exécutions** par mesure. **Médiane et écart min–max publiés.** Aucune
   exécution écartée.
4. **Aucun drapeau ne débride la fréquence d'images** : ni
   `--disable-gpu-vsync`, ni `--disable-frame-rate-limit`.
5. **Nœuds DOM comptés**, jamais estimés (`querySelectorAll('*')`).
6. **Latence de sélection** : d'un `MouseEvent` réel distribué sur l'élément
   jusqu'à l'image portant le changement, lecture de disposition forcée.
   40 sélections par exécution; 95<sup>e</sup> centile publié.
7. **Fenêtre affichée : `--headless=new`.** `B2` a montré qu'une fenêtre
   visible passée en arrière-plan cesse d'émettre des images; le mode sans
   affichage évite ce piège de mesure.
8. **Données synthétiques**, graine fixe `20260831`.
9. **Mode de rendu fixé à `transform`** pour les deux calepins : la seule
   variable de cette campagne est le **calepin**, puis le **budget**.

### 2.1 Ce qui a été écrit avant toute mesure publiée

- les **huit critères `F1` à `F8`**, dans `TASK-0013` §6, **avant** l'ouverture
  de la tâche;
- le **plancher de lisibilité** du budget, `2 400 px²`, et toute la
  configuration du contrôleur, dans `spikes/b2bis-layout-and-budget/budget.mjs`;
- le **matériel de référence**, §1 ci-dessus.

**Aucun de ces éléments n'a été modifié après la première mesure.**

### 2.2 Une correction de protocole, déclarée

La phase de contrainte du plancher de lisibilité a d'abord été jouée avec une
cible portée à **240 ips**. Cette contrainte s'est révélée **atteignable** en
mode sans affichage sur un écran à 240 Hz : le contrôleur atteignait sa cible,
s'arrêtait dans sa zone morte et **n'approchait jamais le plancher**. La phase
ne prouvait donc rien.

La contrainte publiée est portée à **1 000 ips**, qu'aucune configuration de
cette machine ne peut tenir. **Ce changement porte sur le protocole de cette
seule phase; le critère `F5` est inchangé**, ainsi que les sept autres. La
première tentative est conservée ici plutôt qu'effacée.

## 3. Le moteur réellement employé

**Aucune mesure de ce document n'a été relevée dans WebView2.** La tentative
d'instrumentation, ses six commandes et leurs codes de sortie sont dans
[le journal de `TASK-0013`, §3](../research/TASK-0013-b2-bis-results.md).

| Rôle | Moteur | Version |
|---|---|---|
| **Substitut de référence** | **Microsoft Edge** | **152.0.4191.53** |
| **Contrôle de continuité avec `B2`** | **Google Chrome** | **151.0.7922.175** |
| Moteur visé, **non mesuré** | WebView2 Evergreen Runtime | 151.0.4129.107 |

**L'écart entre WebView2 et ces deux moteurs est NON MESURÉ.** Il n'est ni
estimé, ni borné, ni réputé négligeable. `F8` est publiée **réfutée**.

## 4. Mesures

Tous les tableaux ci-dessous sont **produits par script** à partir des mesures
brutes (`spikes/b2bis-layout-and-budget/tables.mjs`); aucun chiffre n'est
recopié à la main. Chaque cellule porte la **médiane de cinq exécutions**, et
l'**écart min–max** entre crochets lorsqu'il n'est pas nul.

### Moteur : Microsoft Edge 152.0.4191.53 — 5 exécutions par mesure

#### Matrice des calepins — déplacement continu, zoom, sélection

| Calepin | Forme | Blocs demandés | Blocs visibles | Nœuds DOM construits | ips déplacement (méd. [min–max]) | ips zoom | Sélection p95 (ms) | Ajustement (ms) | Revirt. |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `CAL-A` | `SYN-EQUILIBRE` | 1000 | **1000** | 2141 | **238,1** | 238,1 | 5,4 [4,3 – 5,9] | 6,1 [5,2 – 7,7] | 0 |
| `CAL-A` | `SYN-EQUILIBRE` | 3000 | **3000** | 6141 | **60,24** | 59,88 | 13,6 [13,5 – 14,6] | 13,8 [12,9 – 14,4] | 0 |
| `CAL-A` | `SYN-EQUILIBRE` | 5000 | **5001** | 10143 | **40 [39,84 – 40]** | 30,03 [29,94 – 34,13] | 22,7 [22,5 – 25] | 21,8 [21,3 – 22,1] | 0 |
| `CAL-A` | `SYN-DEEP` | 1000 | **1000** | 2103 | **120,48** | 120,48 | 6,2 [5,8 – 6,3] | 6,6 [4,7 – 7,1] | 0 |
| `CAL-A` | `SYN-DEEP` | 3000 | **3000** | 6103 | **59,52 [48,08 – 59,52]** | 48,08 [47,85 – 48,08] | 16,7 [16,6 – 16,8] | 13,7 [12,9 – 19,7] | 0 |
| `CAL-A` | `SYN-DEEP` | 5000 | **5000** | 10103 | **30,03** | 26,67 [26,6 – 29,94] | 28,5 [28,2 – 29,3] | 22,3 [20,6 – 22,8] | 0 |
| `CAL-A` | `SYN-WIDE` | 1000 | **939** | 1880 | **80** | 59,88 [59,88 – 79,37] | 11,1 [10,8 – 11,6] | 8,5 [5,2 – 11] | 0 |
| `CAL-A` | `SYN-WIDE` | 3000 | **2856** | 5714 | **21,79 [21,79 – 21,83]** | 20 [19,96 – 21,74] | 43,5 [43,3 – 43,7] | 13,6 [13,4 – 14,2] | 0 |
| `CAL-A` | `SYN-WIDE` | 5000 | **4768** | 9538 | **13,32 [13,3 – 13,32]** | 14,08 [11,96 – 14,97] | 87,4 [86 – 89,2] | 21,4 [21,2 – 22,2] | 0 |
| `CAL-B` | `SYN-EQUILIBRE` | 1000 | **1001** | 2181 | **238,1** | 238,1 | 4,3 | 6,2 [5,8 – 7] | 0 |
| `CAL-B` | `SYN-EQUILIBRE` | 3000 | **3000** | 6179 | **80** | 79,37 [60,24 – 79,37] | 11,7 [10,8 – 12] | 13,6 [13,3 – 13,9] | 0 |
| `CAL-B` | `SYN-EQUILIBRE` | 5000 | **5000** | 10179 | **48,08** | 40 [39,84 – 40] | 19,1 [18,2 – 19,5] | 21,4 [21,2 – 21,9] | 0 |
| `CAL-B` | `SYN-DEEP` | 1000 | **999** | 2153 | **238,1** | 238,1 | 4,3 [4,3 – 5] | 6,2 [5 – 7,7] | 0 |
| `CAL-B` | `SYN-DEEP` | 3000 | **3001** | 6157 | **80** | 79,37 [79,37 – 80] | 11,8 [10,9 – 12,3] | 13,8 [13,3 – 14,7] | 0 |
| `CAL-B` | `SYN-DEEP` | 5000 | **4999** | 10153 | **47,85** | 39,84 [39,68 – 39,84] | 15,9 [14,3 – 20,6] | 21,3 [20,7 – 22,3] | 0 |
| `CAL-B` | `SYN-WIDE` | 1000 | **939** | 1880 | **238,1** | 121,95 [120,48 – 232,56] | 4,5 [4,3 – 5,6] | 8,7 [7,1 – 10,7] | 0 |
| `CAL-B` | `SYN-WIDE` | 3000 | **2856** | 5714 | **119,05 [80 – 119,05]** | 80,65 [80 – 119,05] | 14,1 [13,3 – 14,6] | 13,4 [13,2 – 13,9] | 0 |
| `CAL-B` | `SYN-WIDE` | 5000 | **5012** | 10026 | **59,88** | 34,13 [30,03 – 34,25] | 20,1 [19,5 – 20,7] | 22,4 [21,4 – 22,4] | 0 |
| `CAL-A` | `SYN-100K` | 1000 | **1001** | 2096 | **238,1** | 238,1 | 4,5 [4,3 – 4,8] | 6,8 [5,5 – 9,5] | 0 |
| `CAL-A` | `SYN-100K` | 3000 | **3000** | 6094 | **80** | 79,37 [78,74 – 79,37] | 13,9 [13,4 – 14,2] | 16,5 [16,1 – 17,8] | 0 |
| `CAL-A` | `SYN-100K` | 5000 | **5003** | 10100 | **48,08** | 39,84 [39,84 – 47,85] | 20,6 [20,4 – 20,8] | 24,7 [24,4 – 26] | 0 |
| `CAL-B` | `SYN-100K` | 1000 | **1001** | 2101 | **238,1** | 238,1 | 4,4 [4,3 – 4,7] | 8,2 [6,9 – 10,3] | 0 |
| `CAL-B` | `SYN-100K` | 3000 | **3003** | 6105 | **119,05 [80,65 – 119,05]** | 79,37 | 10,6 [10,2 – 11,4] | 16,7 [15,9 – 16,9] | 0 |
| `CAL-B` | `SYN-100K` | 5000 | **5001** | 10101 | **59,88** | 47,85 [40 – 48,08] | 17,8 [16,7 – 18,7] | 24,7 [24,5 – 25,4] | 0 |

#### Distribution des rapports d'aspect des rectangles construits

Rapport = grand côté / petit côté, en pixels d'écran. **1,0 est le carré parfait.**

| Calepin | Forme | Blocs demandés | Médian | p90 | p99 | Maximum | Part ≥ 10 | Part ≥ 50 |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| `CAL-A` | `SYN-EQUILIBRE` | 1000 | **5,29** | 45,55 | 411,1 | 1096,42 | 36 % | 9 % |
| `CAL-A` | `SYN-EQUILIBRE` | 3000 | **7,22** | 89,87 | 693,35 | 2848,42 | 43 % | 16 % |
| `CAL-A` | `SYN-EQUILIBRE` | 5000 | **9,14** | 144,24 | 1420,62 | 7168,18 | 49 % | 21 % |
| `CAL-A` | `SYN-DEEP` | 1000 | **17,88** | 211,98 | 1287,36 | 1491,73 | 62 % | 33 % |
| `CAL-A` | `SYN-DEEP` | 3000 | **28,84** | 472,93 | 2492,37 | 6646,31 | 66 % | 42 % |
| `CAL-A` | `SYN-DEEP` | 5000 | **38,89** | 653,43 | 4018,31 | 10069,21 | 69 % | 46 % |
| `CAL-A` | `SYN-WIDE` | 1000 | **3323,16** | 3323,16 | 3323,16 | 3323,16 | 100 % | 100 % |
| `CAL-A` | `SYN-WIDE` | 3000 | **3987,79** | 4984,74 | 4984,74 | 4984,74 | 100 % | 100 % |
| `CAL-A` | `SYN-WIDE` | 5000 | **4984,74** | 9969,47 | 9969,47 | 9969,47 | 100 % | 100 % |
| `CAL-B` | `SYN-EQUILIBRE` | 1000 | **1,37** | 1,98 | 6,06 | 34,63 | 1 % | 0 % |
| `CAL-B` | `SYN-EQUILIBRE` | 3000 | **1,38** | 2 | 5,8 | 36,11 | 0 % | 0 % |
| `CAL-B` | `SYN-EQUILIBRE` | 5000 | **1,38** | 2,05 | 5,9 | 36,11 | 0 % | 0 % |
| `CAL-B` | `SYN-DEEP` | 1000 | **1,46** | 9,93 | 82,75 | 234,1 | 10 % | 3 % |
| `CAL-B` | `SYN-DEEP` | 3000 | **1,46** | 4,58 | 61,86 | 234,1 | 6 % | 1 % |
| `CAL-B` | `SYN-DEEP` | 5000 | **1,46** | 3,79 | 50,39 | 234,1 | 5 % | 1 % |
| `CAL-B` | `SYN-WIDE` | 1000 | **1,01** | 1,1 | 1,19 | 1,21 | 0 % | 0 % |
| `CAL-B` | `SYN-WIDE` | 3000 | **1,01** | 1,06 | 1,16 | 1,21 | 0 % | 0 % |
| `CAL-B` | `SYN-WIDE` | 5000 | **1,01** | 1,08 | 1,45 | 1,45 | 0 % | 0 % |
| `CAL-A` | `SYN-100K` | 1000 | **9,13** | 28,46 | 99,48 | 751,32 | 46 % | 4 % |
| `CAL-A` | `SYN-100K` | 3000 | **3,75** | 25,23 | 114,2 | 751,32 | 27 % | 4 % |
| `CAL-A` | `SYN-100K` | 5000 | **2,79** | 21,1 | 110 | 751,32 | 20 % | 4 % |
| `CAL-B` | `SYN-100K` | 1000 | **1,3** | 1,73 | 2,07 | 6,21 | 0 % | 0 % |
| `CAL-B` | `SYN-100K` | 3000 | **1,27** | 1,6 | 2,35 | 6,21 | 0 % | 0 % |
| `CAL-B` | `SYN-100K` | 5000 | **1,27** | 1,57 | 2,04 | 6,21 | 0 % | 0 % |

#### Budget de rendu auto-régulé — cible 30 ips

| Calepin | Forme | Convergence (ms) | ips régime stable | Inversions / 10 s | Niveau final | Seuil d'aire final (px²) | Blocs | Nœuds DOM | ips après conv. | Sélection p95 (ms) |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `CAL-A` | `SYN-EQUILIBRE` | 5363,3 [5096 – 5367,4] | **40 [40 – 40,16]** | 0 | 0 | 199,29 | 5880 [5876 – 6109] | 12087 [12079 – 12567] | 59,52 [59,52 – 59,88] | 17,9 [17,7 – 23,7] |
| `CAL-A` | `SYN-DEEP` | 2153,6 [2128,6 – 2178,5] | **59,52** | 0 | 0 | 199,29 | 4561 [4552 – 4567] | 9387 [9369 – 9404] | 80 [80 – 80,65] | 18,7 [18,4 – 18,7] |
| `CAL-A` | `SYN-WIDE` | 6064,5 [6035,2 – 12972,3] | **26,6 [26,6 – 30,03]** | 0 | 9 | 893,62 | 2721 [2721 – 2890] | 5444 [5444 – 5782] | 26,67 [26,67 – 34,13] | 37,7 [34,3 – 38,6] |
| `CAL-A` | `SYN-100K` | 1381,6 [1360,7 – 1427,4] | **34,13** | 0 | 0 | 199,29 | 11646 [11645 – 11707] | 23360 [23358 – 23482] | 39,84 | 34,5 [34 – 35,9] |
| `CAL-B` | `SYN-EQUILIBRE` | 1899,1 [1869,8 – 1928] | **59,88** | 0 | 0 | 199,29 | 6065 [6059 – 6081] | 12699 [12689 – 12731] | 79,37 | 10,7 [10 – 15,6] |
| `CAL-B` | `SYN-DEEP` | 2061,9 [2053,3 – 2103,5] | **59,88** | 0 | 0 | 199,29 | 6044 [6035 – 6045] | 12592 [12571 – 12594] | 80 [79,37 – 80] | 20,4 [20,1 – 21,6] |
| `CAL-B` | `SYN-WIDE` | 1882,2 [1878 – 1894,7] | **60,24 [59,88 – 60,24]** | 0 | 0 | 199,29 | 6005 [6005 – 6076] | 12033 [12033 – 12175] | 80 | 10,6 [10,3 – 10,7] |
| `CAL-B` | `SYN-100K` | 1064,2 [1047,4 – 1085,1] | **120,48** | 0 | 0 | 199,29 | 3582 [3575 – 3584] | 7529 [7515 – 7533] | 120,48 | 8,2 [7 – 8,5] |

#### Plancher de lisibilité sous contrainte — cible portée à 1000 ips, physiquement inatteignable

| Calepin | Forme | Seuil d'aire atteint (px²) | Plancher déclaré (px²) | Plancher franchi ? | Plancher atteint et tenu ? | Niveau final | Blocs | ips régime stable |
|---|---|---:|---:|---|---|---:|---:|---:|
| `CAL-A` | `SYN-EQUILIBRE` | **2400** | 2400 | non | **oui** | 13 | 838 [836 – 841] | 238,1 |
| `CAL-A` | `SYN-DEEP` | **2400** | 2400 | non | **oui** | 13 | 584 | 238,1 |
| `CAL-A` | `SYN-WIDE` | **2400** | 2400 | non | **oui** | 13 | 301 [299 – 303] | 238,1 |
| `CAL-A` | `SYN-100K` | **2400** | 2400 | non | **oui** | 13 | 450 [448 – 450] | 238,1 |
| `CAL-B` | `SYN-EQUILIBRE` | **2400** | 2400 | non | **oui** | 13 | 754 | 238,1 |
| `CAL-B` | `SYN-DEEP` | **2400** | 2400 | non | **oui** | 13 | 629 | 238,1 |
| `CAL-B` | `SYN-WIDE` | **2400** | 2400 | non | **oui** | 13 | 176 | 238,1 |
| `CAL-B` | `SYN-100K` | **2400** | 2400 | non | **oui** | 13 | 396 | 238,1 |

#### ARIA et clavier

Scénarios contrôlés : **32**. `treeitem` conformes : **32/32**. Clavier conforme : **32/32**.

**Aucune régression.** Zéro attribut `aria-level`, `aria-selected`, `aria-setsize` ou `aria-posinset` manquant; zéro nœud à enfants construits sans `aria-expanded`; `document.activeElement` suit le focus interne sur les huit touches, dans tous les scénarios.

### Moteur : Google Chrome 151.0.7922.175 — 5 exécutions par mesure

#### Matrice des calepins — déplacement continu, zoom, sélection

| Calepin | Forme | Blocs demandés | Blocs visibles | Nœuds DOM construits | ips déplacement (méd. [min–max]) | ips zoom | Sélection p95 (ms) | Ajustement (ms) | Revirt. |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `CAL-A` | `SYN-EQUILIBRE` | 1000 | **1000** | 2139 | **119,05** | 119,05 [117,65 – 119,05] | 8,3 [8,2 – 8,7] | 6,3 [5,4 – 8] | 0 |
| `CAL-A` | `SYN-EQUILIBRE` | 3000 | **3000** | 6139 | **40** | 39,84 [39,84 – 40] | 22,6 [21,8 – 22,7] | 14,3 [14,1 – 14,9] | 0 |
| `CAL-A` | `SYN-EQUILIBRE` | 5000 | **5002** | 10143 | **23,92 [23,92 – 23,98]** | 21,79 [21,74 – 21,79] | 36,9 [36,7 – 38] | 22,7 [22,4 – 23,8] | 0 |
| `CAL-A` | `SYN-DEEP` | 1000 | **1000** | 2102 | **80** | 80,65 [80 – 80,65] | 10,4 [9,8 – 11,1] | 5,8 [5,3 – 7,1] | 0 |
| `CAL-A` | `SYN-DEEP` | 3000 | **3000** | 6102 | **30,03** | 34,13 [29,94 – 34,25] | 27 [26,7 – 28,1] | 14,7 [13,8 – 15,7] | 0 |
| `CAL-A` | `SYN-DEEP` | 5000 | **5000** | 10102 | **18,45** | 18,42 [18,42 – 18,45] | 46,6 [45,8 – 47,3] | 22,1 [21,6 – 23,9] | 0 |
| `CAL-A` | `SYN-WIDE` | 1000 | **939** | 1880 | **47,85** | 39,84 [39,84 – 40] | 17,2 [16,9 – 17,4] | 7,8 [6,2 – 9,6] | 0 |
| `CAL-A` | `SYN-WIDE` | 3000 | **2856** | 5714 | **13,32** | 10,43 [10,42 – 10,89] | 72,6 [72,1 – 74,3] | 14,6 [13,7 – 14,9] | 0 |
| `CAL-A` | `SYN-WIDE` | 5000 | **4768** | 9538 | **7,99 [7,73 – 8,26]** | 7,5 [7,49 – 8,55] | 140,8 [140,2 – 142,2] | 23,2 [22,9 – 24,1] | 0 |
| `CAL-B` | `SYN-EQUILIBRE` | 1000 | **1000** | 2179 | **120,48 [119,05 – 120,48]** | 120,48 | 6,4 [5,9 – 7,2] | 6,7 [5,6 – 7,2] | 0 |
| `CAL-B` | `SYN-EQUILIBRE` | 3000 | **3000** | 6179 | **47,85 [47,85 – 48,08]** | 47,85 | 19,2 [18,9 – 19,8] | 14,6 [13,8 – 14,7] | 0 |
| `CAL-B` | `SYN-EQUILIBRE` | 5000 | **5000** | 10179 | **30,03 [29,94 – 30,03]** | 26,67 | 31,2 [26,8 – 31,4] | 23,2 [22,7 – 23,7] | 0 |
| `CAL-B` | `SYN-DEEP` | 1000 | **999** | 2153 | **119,05** | 119,05 [119,05 – 120,48] | 7,7 [6,2 – 8,3] | 6,9 [5,4 – 9,4] | 0 |
| `CAL-B` | `SYN-DEEP` | 3000 | **3001** | 6157 | **47,85** | 47,62 [40,16 – 47,62] | 19,4 [17,3 – 19,6] | 15,4 [14,4 – 16,3] | 0 |
| `CAL-B` | `SYN-DEEP` | 5000 | **4999** | 10153 | **29,85 [29,85 – 29,94]** | 26,6 [26,6 – 26,67] | 31,1 [28,7 – 31,8] | 23 [22,3 – 23,6] | 0 |
| `CAL-B` | `SYN-WIDE` | 1000 | **939** | 1880 | **238,1** | 119,05 | 6,7 [6,1 – 8,3] | 6 [5,3 – 7,1] | 0 |
| `CAL-B` | `SYN-WIDE` | 3000 | **2856** | 5714 | **59,88** | 40 [40 – 40,16] | 23 [20,8 – 24,5] | 14,9 [13,9 – 15,3] | 0 |
| `CAL-B` | `SYN-WIDE` | 5000 | **5012** | 10026 | **34,36 [34,25 – 39,68]** | 23,98 [23,98 – 26,6] | 30,7 [30,4 – 32,9] | 23,7 [22,9 – 24] | 0 |
| `CAL-A` | `SYN-100K` | 1000 | **1001** | 2096 | **119,05 [119,05 – 120,48]** | 120,48 | 6,8 [6,2 – 7,1] | 6,7 [6,4 – 7,2] | 0 |
| `CAL-A` | `SYN-100K` | 3000 | **3000** | 6094 | **47,85** | 47,85 [40 – 47,85] | 22,6 [22,3 – 23,1] | 17,4 [16,7 – 18,6] | 0 |
| `CAL-A` | `SYN-100K` | 5000 | **5003** | 10100 | **34,13 [34,01 – 34,13]** | 26,53 [23,98 – 26,6] | 33,5 [33 – 33,5] | 26,3 [25,7 – 27,7] | 0 |
| `CAL-B` | `SYN-100K` | 1000 | **1001** | 2101 | **120,48** | 232,56 [121,95 – 238,1] | 4,3 [4,3 – 4,6] | 7,3 [6,4 – 8,8] | 0 |
| `CAL-B` | `SYN-100K` | 3000 | **3003** | 6105 | **59,88** | 59,52 [47,85 – 59,88] | 17,5 [16,6 – 18,3] | 16,7 [16,5 – 16,8] | 0 |
| `CAL-B` | `SYN-100K` | 5000 | **5001** | 10101 | **34,36 [34,36 – 39,68]** | 29,85 [26,67 – 29,94] | 28,9 [28,4 – 29,3] | 26,1 [25,7 – 26,3] | 0 |

#### Distribution des rapports d'aspect des rectangles construits

Rapport = grand côté / petit côté, en pixels d'écran. **1,0 est le carré parfait.**

| Calepin | Forme | Blocs demandés | Médian | p90 | p99 | Maximum | Part ≥ 10 | Part ≥ 50 |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| `CAL-A` | `SYN-EQUILIBRE` | 1000 | **5,29** | 45,55 | 411,1 | 1096,42 | 36 % | 9 % |
| `CAL-A` | `SYN-EQUILIBRE` | 3000 | **7,22** | 89,87 | 693,35 | 2848,42 | 43 % | 16 % |
| `CAL-A` | `SYN-EQUILIBRE` | 5000 | **9,14** | 144,24 | 1420,62 | 7168,18 | 49 % | 21 % |
| `CAL-A` | `SYN-DEEP` | 1000 | **17,88** | 211,98 | 1287,36 | 1491,73 | 62 % | 33 % |
| `CAL-A` | `SYN-DEEP` | 3000 | **28,84** | 472,93 | 2492,37 | 6646,31 | 66 % | 42 % |
| `CAL-A` | `SYN-DEEP` | 5000 | **38,89** | 653,43 | 4018,31 | 10069,21 | 69 % | 46 % |
| `CAL-A` | `SYN-WIDE` | 1000 | **3323,16** | 3323,16 | 3323,16 | 3323,16 | 100 % | 100 % |
| `CAL-A` | `SYN-WIDE` | 3000 | **3987,79** | 4984,74 | 4984,74 | 4984,74 | 100 % | 100 % |
| `CAL-A` | `SYN-WIDE` | 5000 | **4984,74** | 9969,47 | 9969,47 | 9969,47 | 100 % | 100 % |
| `CAL-B` | `SYN-EQUILIBRE` | 1000 | **1,37** | 1,98 | 6,09 | 34,63 | 1 % | 0 % |
| `CAL-B` | `SYN-EQUILIBRE` | 3000 | **1,38** | 2 | 5,8 | 36,11 | 0 % | 0 % |
| `CAL-B` | `SYN-EQUILIBRE` | 5000 | **1,38** | 2,05 | 5,9 | 36,11 | 0 % | 0 % |
| `CAL-B` | `SYN-DEEP` | 1000 | **1,46** | 9,93 | 82,75 | 234,1 | 10 % | 3 % |
| `CAL-B` | `SYN-DEEP` | 3000 | **1,46** | 4,58 | 61,86 | 234,1 | 6 % | 1 % |
| `CAL-B` | `SYN-DEEP` | 5000 | **1,46** | 3,79 | 50,39 | 234,1 | 5 % | 1 % |
| `CAL-B` | `SYN-WIDE` | 1000 | **1,01** | 1,1 | 1,19 | 1,21 | 0 % | 0 % |
| `CAL-B` | `SYN-WIDE` | 3000 | **1,01** | 1,06 | 1,16 | 1,21 | 0 % | 0 % |
| `CAL-B` | `SYN-WIDE` | 5000 | **1,01** | 1,08 | 1,45 | 1,45 | 0 % | 0 % |
| `CAL-A` | `SYN-100K` | 1000 | **9,13** | 28,46 | 99,48 | 751,32 | 46 % | 4 % |
| `CAL-A` | `SYN-100K` | 3000 | **3,75** | 25,23 | 114,2 | 751,32 | 27 % | 4 % |
| `CAL-A` | `SYN-100K` | 5000 | **2,79** | 21,1 | 110 | 751,32 | 20 % | 4 % |
| `CAL-B` | `SYN-100K` | 1000 | **1,3** | 1,73 | 2,07 | 6,21 | 0 % | 0 % |
| `CAL-B` | `SYN-100K` | 3000 | **1,27** | 1,6 | 2,35 | 6,21 | 0 % | 0 % |
| `CAL-B` | `SYN-100K` | 5000 | **1,27** | 1,57 | 2,04 | 6,21 | 0 % | 0 % |

#### ARIA et clavier

Scénarios contrôlés : **24**. `treeitem` conformes : **24/24**. Clavier conforme : **24/24**.

**Aucune régression.** Zéro attribut `aria-level`, `aria-selected`, `aria-setsize` ou `aria-posinset` manquant; zéro nœud à enfants construits sans `aria-expanded`; `document.activeElement` suit le focus interne sur les huit touches, dans tous les scénarios.

### Écart entre les deux moteurs mesurés

| Calepin | Forme | Blocs demandés | Microsoft Edge — ips | Google Chrome — ips | Écart |
|---|---|---:|---:|---:|---:|
| `CAL-A` | `SYN-EQUILIBRE` | 1000 | 238,1 | 119,05 | -50 % |
| `CAL-A` | `SYN-EQUILIBRE` | 3000 | 60,24 | 40 | -33,6 % |
| `CAL-A` | `SYN-EQUILIBRE` | 5000 | 40 | 23,92 | -40,2 % |
| `CAL-A` | `SYN-DEEP` | 1000 | 120,48 | 80 | -33,6 % |
| `CAL-A` | `SYN-DEEP` | 3000 | 59,52 | 30,03 | -49,5 % |
| `CAL-A` | `SYN-DEEP` | 5000 | 30,03 | 18,45 | -38,6 % |
| `CAL-A` | `SYN-WIDE` | 1000 | 80 | 47,85 | -40,2 % |
| `CAL-A` | `SYN-WIDE` | 3000 | 21,79 | 13,32 | -38,9 % |
| `CAL-A` | `SYN-WIDE` | 5000 | 13,32 | 7,99 | -40 % |
| `CAL-B` | `SYN-EQUILIBRE` | 1000 | 238,1 | 120,48 | -49,4 % |
| `CAL-B` | `SYN-EQUILIBRE` | 3000 | 80 | 47,85 | -40,2 % |
| `CAL-B` | `SYN-EQUILIBRE` | 5000 | 48,08 | 30,03 | -37,5 % |
| `CAL-B` | `SYN-DEEP` | 1000 | 238,1 | 119,05 | -50 % |
| `CAL-B` | `SYN-DEEP` | 3000 | 80 | 47,85 | -40,2 % |
| `CAL-B` | `SYN-DEEP` | 5000 | 47,85 | 29,85 | -37,6 % |
| `CAL-B` | `SYN-WIDE` | 1000 | 238,1 | 238,1 | 0 % |
| `CAL-B` | `SYN-WIDE` | 3000 | 119,05 | 59,88 | -49,7 % |
| `CAL-B` | `SYN-WIDE` | 5000 | 59,88 | 34,36 | -42,6 % |
| `CAL-A` | `SYN-100K` | 1000 | 238,1 | 119,05 | -50 % |
| `CAL-A` | `SYN-100K` | 3000 | 80 | 47,85 | -40,2 % |
| `CAL-A` | `SYN-100K` | 5000 | 48,08 | 34,13 | -29 % |
| `CAL-B` | `SYN-100K` | 1000 | 238,1 | 120,48 | -49,4 % |
| `CAL-B` | `SYN-100K` | 3000 | 119,05 | 59,88 | -49,7 % |
| `CAL-B` | `SYN-100K` | 5000 | 59,88 | 34,36 | -42,6 % |

## 5. Trois lectures obligatoires de ces chiffres

### 5.1 Le moteur pèse plus lourd que le calepin sur deux formes

Sur les **18** couples où aucun des deux moteurs n'est buté contre la
synchronisation verticale, Chrome rend entre **0,50 et 0,71** fois les images
par seconde d'Edge, **médiane 0,60** — sur la **même machine**, la **même
page**, le **même protocole**, le **même jour**.

Sur `SYN-DEEP` et `SYN-EQUILIBRE`, cet écart de moteur (−33 % à −50 %) est du
même ordre que le gain apporté par le calepin squarifié (+20 % à +98 %), voire
supérieur. **Sur `SYN-WIDE`, en revanche, le calepin domine largement le
moteur** : ×5,5 contre ×0,6.

**Conséquence directe :** aucun chiffre de ce document ne peut être présenté
comme une capacité du produit tant que le moteur de production n'a pas été
mesuré. C'est la réserve `R8`, et elle est **renforcée** par cette campagne,
pas levée.

### 5.2 Les images par seconde sont quantifiées

Les temps d'image observés sont des **multiples de l'intervalle de 4,17 ms**
d'un écran à 240 Hz. Les images par seconde publiées sont donc des **marches** :
238,10 · 119,05 · 80,00 · 59,88 · 47,85 · 40,00 · 34,36 · 30,03 · 23,92 ·
18,45 · 13,32 · 7,99. Deux configurations séparées par une seule marche
affichent un écart relatif important même si leur coût réel diffère peu.
**Aucun écart mesuré ici ne doit être lu avec une précision meilleure qu'une
marche.**

Les valeurs de **238,10** sont **butées** contre la synchronisation verticale :
elles signifient « au moins 238 », pas « exactement 238 ».

### 5.3 La continuité avec `B2` est vérifiée

`B2` avait publié, dans **Chrome 151**, un effondrement de `SYN-WIDE` à
**14,08 ips** à 3 000 blocs visibles
([PERF-0001](PERF-0001-b2-rendering.md)). Le présent banc, avec le **même
calepin** `CAL-A`, le **même** moteur Chrome 151 et **2 856** blocs visibles,
mesure **13,32 ips**.

**Les deux mesures concordent**, à une marche de quantification près. Le banc
`B2 bis` reproduit donc `B2` là où il doit le reproduire, ce qui rend licites
les comparaisons qu'il établit par ailleurs.

**Rappel de la réserve `R7`** : le plafond `SYN-WIDE` publié par `B2` est un
**encadrement de 939 à 1 795 blocs**, jamais le seul chiffre 939. Le présent
banc n'a pas cherché de plafond par dichotomie et **ne rétrécit pas** cet
encadrement.

## 6. Ce que ces mesures ne sont pas

- **Pas des mesures de production.** Ni WebView2, ni `rusqlite`, ni application
  empaquetée.
- **Pas des plafonds universels.** Une seule machine, nettement au-dessus d'un
  poste ordinaire, en mode sans affichage.
- **Pas une décision.** `TASK-0013` §6.1 : cette tâche ne choisit pas le
  calepin du produit et n'adopte pas un budget.
- **Pas une levée de réserve.** `R1` à `R9` d'`ACTION-0021` restent en vigueur;
  seul un contrôle indépendant peut se prononcer sur leur sort.

La liste complète des limites est dans
[le journal de `TASK-0013`, §11](../research/TASK-0013-b2-bis-results.md).

