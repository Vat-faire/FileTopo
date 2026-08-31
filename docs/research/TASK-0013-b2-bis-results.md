# TASK-0013 — B2 bis : journal, preuves et verdicts

- **Tâche :** [TASK-0013](../tasks/TASK-0013-b2-bis-layout-and-render-budget.md)
- **Branche :** `spike/v0.2-render-budget`, créée depuis
  `746f1b5f93c9d7085516c0e56473a95dc2c2d178`
- **Spike :** `spikes/b2bis-layout-and-budget/`
- **Mesures :** [PERF-0004](../performance/PERF-0004-b2bis-layout-and-budget.md)
- **Date :** 2026-08-31
- **Exécuteur :** Claude Code, sous le **GO technique de l'orchestrateur**,
  porte **P3 bis franchie**
- **Statut de la tâche à l'issue :** **`IMPLEMENTED`, jamais `VERIFIED`.**
  L'exécuteur ne juge pas ses propres preuves.

> **Ce document publie des résultats, y compris ceux qui manquent leur cible.**
> Deux des huit énoncés falsifiables sont **réfutés**, et ils sont écrits comme
> tels. Aucun seuil n'a été ajusté après mesure.

---

## 1. Ce qui a été fait, et dans quel ordre

| # | Étape | Preuve |
|---|---|---|
| 1 | Annexe `R1` à `R9` jointe au dossier `ACTION-0021` | commit `746f1b5` |
| 2 | Branche dédiée `spike/v0.2-render-budget` créée depuis la pointe contrôlée | §11 |
| 3 | `TASK-0013` passée `APPROVED` puis `IN_PROGRESS` | fiche §12 |
| 4 | Banc d'essai écrit : deux calepins, budget, quatre formes, pilote | `spikes/b2bis-layout-and-budget/` |
| 5 | **Critères, plancher de lisibilité et matériel commités AVANT mesure** | commit `85a4a05` |
| 6 | Tentative d'instrumentation de **WebView2** | §3, `detect-webview2.mjs` |
| 7 | Campagne de mesure, **cinq exécutions par mesure** | §4 à §8, `PERF-0004` |
| 8 | Verdicts `F1` à `F8` calculés **littéralement** par script | §9, `verdicts.mjs` |

**La préséance est vérifiable dans l'historique Git** : le commit `85a4a05`
contient le contrôleur de budget, son plancher de lisibilité et le matériel de
référence; il précède toute mesure publiée.

## 2. Ce qui n'a pas été touché

- **Aucun fichier de production.** `src/`, `src-tauri/`, `tests/`, `public/`,
  `scripts/`, `.github/`, `graph/` : **zéro modification**.
- **Aucune dépendance**, aucun verrou, aucun manifeste. Le moteur est piloté
  par le protocole CDP sur le client `WebSocket` **intégré** à Node 24.
- **Ni Canvas 2D ni WebGL.** `DEC-0013` C ne les ouvre pas; rien n'a été
  prototypé, mesuré ni comparé de ce côté.
- **Aucune correction de l'échec de `B0`**, aucune suppression du cache
  incrémental de `src-tauri/target/`.
- **Aucun test inter-volume** : il exigerait d'écrire hors du dépôt.
- **Aucune donnée réelle.** Toutes les arborescences sont produites par un
  générateur à graine fixe `20260831`.
- **Aucune écriture hors du dépôt** — profils de navigateur compris, placés
  sous `spikes/.work/`, ignoré par Git.
- Aucune fusion, aucune pull request, aucune release, aucune étiquette, aucune
  modification de `main`.

## 3. Le moteur — WebView2 d'abord, et pourquoi il n'a pas pu servir

`TASK-0013` §5.4 impose un ordre : **WebView2 d'abord**. Il a été tenté en
premier, avant toute mesure.

### 3.1 Ce qui est installé

| Composant | Version | Source de la version |
|---|---|---|
| **WebView2 Evergreen Runtime** | **151.0.4129.107** | clé `EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}`, valeur `pv` |
| Microsoft Edge (stable) | 152.0.4191.53 | ressource de version de `msedge.exe` |
| Google Chrome | 151.0.7922.175 | ressource de version de `chrome.exe` |

Le composant visé **est présent** sur la machine : l'échec n'est pas une
absence d'installation.

### 3.2 Les six tentatives, avec leurs codes de sortie

Toutes sont rejouables : `node spikes/b2bis-layout-and-budget/detect-webview2.mjs`.
Journal brut : `spikes/.work/b2bis/webview2-tentatives.json`.

| # | Commande, en plus de `--remote-debugging-port` et `--user-data-dir` | Code de sortie | Point d'accès annoncé | Serveur CDP joint |
|---|---|---:|---|---|
| T1 | page du banc en argument | **13** | aucun | **non** |
| T2 | `--version` | **13** | aucun | **non** |
| T3 | `--headless=new about:blank` | **13** | aucun | **non** |
| T4 | `--embedded-browser-webview=1 about:blank` | 0, après **246 ms** | `ws://127.0.0.1:9474/devtools/browser/…` | **non** |
| T5 | `--embedded-browser-webview=1 --keep-alive-for-test` | 0, après **236 ms** | annoncé | **non** |
| T6 | `--embedded-browser-webview=1`, page du banc | 0, après **236 ms** | annoncé | **non** |

### 3.3 Ce que ces tentatives établissent

**`msedgewebview2.exe` refuse de démarrer sans le commutateur
`--embedded-browser-webview=1`** : code de sortie **13**, sans aucune sortie,
en 14 à 32 ms.

**Avec ce commutateur, il démarre, annonce un point d'accès DevTools, puis
s'arrête de lui-même en environ 236 ms.** Une sonde qui interroge le serveur
HTTP CDP **toutes les 50 ms** ne l'a jamais joint : le processus était déjà
terminé au premier essai, à 148 ms. La sortie d'erreur observée est celle d'un
WebView2 normal — `Edge LLM: Not supported on WebView2` — puis
`DevTools listening on ws://…`.

**Le motif est structurel, pas accidentel.** WebView2 n'est pas un navigateur :
c'est un composant *embarqué*. Le processus navigateur n'existe que tant qu'un
**hôte embarqueur** détient un contrôleur créé par `WebView2Loader`. Sans hôte,
il n'a rien à afficher et se termine — ce que le code de sortie 0 confirme :
c'est un arrêt normal, pas un échec.

### 3.4 Ce qu'il aurait fallu, et pourquoi cela a été refusé

Instrumenter WebView2 exigerait d'**écrire un hôte embarqueur** — application
WinForms, WPF, Win32 ou WinUI — liée au paquet `Microsoft.Web.WebView2`.

Cela **sort du périmètre**, pour trois raisons cumulatives, chacune suffisante :

1. **Ce serait une dépendance nouvelle.** §4.3 de `TASK-0013` exige que les
   cinq conditions de `TASK-0012` §6 — nom et version épinglés, licence
   vérifiée sur la source officielle avec date, compatibilité MIT,
   justification écrite, confinement dans `spikes/` — soient satisfaites **et
   écrites d'avance**. Elles ne l'étaient pas. §4.3 conclut : « une dépendance
   qui ne les satisfait pas rend le banc d'essai **bloqué**, jamais contourné ».
2. **Ce serait du code d'hôte applicatif**, c'est-à-dire exactement ce que la
   porte **P4** protège.
3. **Le chemin par Tauri a été écarté**, et pas par confort : `B0` a établi
   que `cargo build --locked` échoue sur cette machine par une panique interne
   de `rustc 1.98.0` due au cache incrémental, et `DEC-0013` E **interdit** de
   toucher ce cache dans l'étape courante.

**Rien n'a été contourné.** §5.4 prévoit ce cas et impose la conduite
appliquée ici : **`F8` est publiée comme réfutée**.

### 3.5 Le substitut, et en quoi il diffère

**Substitut de référence : Microsoft Edge 152.0.4191.53.**

**Pourquoi celui-là.** WebView2 Evergreen *est* le code de Microsoft Edge en
mode embarqué : même éditeur, même lignée de construction, mêmes composants
propres à Edge. Chrome est une construction différente, de Google.

**En quoi il diffère de WebView2, précisément :**

| Point | WebView2 Evergreen | Microsoft Edge stable | Écart |
|---|---|---|---|
| Version | **151.0.4129.107** | **152.0.4191.53** | **une version majeure d'écart** |
| Mode d'exécution | composant embarqué, piloté par un hôte | navigateur autonome | **différent** |
| Interface d'accueil | surface fournie par l'hôte | fenêtre, onglets, interface du navigateur | **différent** |
| Fonctions désactivées | certaines fonctions d'Edge sont désactivées en mode WebView2 (observé : `Edge LLM: Not supported on WebView2`) | activées | **différent** |
| Moteur de rendu | Blink / Chromium | Blink / Chromium | même famille |

**Contrôle de continuité : Google Chrome 151.0.7922.175.** Il est mesuré en
plus, sur la matrice et la volumétrie, pour deux raisons : c'est le moteur
qu'a employé `B2`, ce qui rend la comparaison avec `B2` licite; et sa version
majeure — **151** — est celle du runtime WebView2 installé, alors qu'Edge est
en 152.

### 3.6 Ce qui est déclaré NON MESURÉ

**L'écart entre WebView2 et les deux moteurs mesurés n'est pas mesuré.** Il
n'est pas estimé, pas borné, pas réputé négligeable. Aucune valeur de ce
document ne peut être présentée comme une mesure WebView2, ni comme une mesure
de production.

Cette limite **prolonge la réserve `R8`** du contrôle indépendant
`ACTION-0021`, qui reste en vigueur : *« les mesures ne sont pas directement
transposables à la production […] `B2` utilise Chrome et non WebView2 »*. Le
présent banc ne la lève pas — il la **rétrécit** d'un moteur Google à un
moteur Microsoft de la bonne lignée, et l'écrit.

**Chaque tableau de `PERF-0004` porte le nom du moteur réellement employé.**

## 4. Les quatre formes synthétiques, dont `SYN-100K`

Toutes viennent du même générateur à graine fixe `20260831`
([`spikes/fixtures/synthetic-shapes.mjs`](../../spikes/fixtures/synthetic-shapes.mjs)).
`SYN-DEEP`, `SYN-WIDE` et `SYN-EQUILIBRE` sont **repris sans modification** de
`B2`, pour que la comparaison avec `B2` reste licite. **`SYN-100K` est ajouté
par cette tâche.**

| Forme | Nœuds visés | Nœuds obtenus | Profondeur max | Dossiers | Feuilles | Branchement moyen | Enfants directs, médian / max | Poids médian / p99 / max |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `SYN-EQUILIBRE` | 20 000 | **20 000** | 24 | 9 999 | 10 001 | 2,00 | 1 / 13 | 1 / 107 / 20 000 |
| `SYN-DEEP` | 20 000 | **20 000** | 54 | 9 900 | 10 100 | 2,02 | 2 / 14 | 1 / 113 / 20 000 |
| `SYN-WIDE` | 20 000 | **20 000** | 2 | 4 768 | 15 232 | 4,19 | 3 / **5 000** | 1 / 7 / 20 000 |
| **`SYN-100K`** | **100 000** | **100 000** | **6** | 11 160 | 88 840 | **8,96** | 9 / 14 | 1 / 61 / 100 000 |

**`SYN-100K` est décrit par sa forme, comme l'exige §5.3** : remplissage en
largeur d'abord, facteur de branchement tiré uniformément dans `[4, 14]`,
profondeur maximale autorisée de 8 niveaux — **6 atteints** —, graine fixe.
La distribution des tailles n'est pas inventée séparément : la surface d'un
bloc est proportionnelle à son **poids**, c'est-à-dire à son nombre de
descendants, exactement comme dans `B2`. Elle découle donc de la forme, et elle
est mesurée ci-dessus.

**Coût de construction et de calepinage, hors navigateur** (`describe-shapes.mjs`) :

| Forme | Construction de l'arbre | `CAL-A` | `CAL-B` |
|---|---:|---:|---:|
| `SYN-EQUILIBRE` | 10,3 ms | 7,8 ms | 11,4 ms |
| `SYN-DEEP` | 5,5 ms | 4,6 ms | 11,1 ms |
| `SYN-WIDE` | 3,8 ms | 1,0 ms | 3,2 ms |
| `SYN-100K` | 93,4 ms | 7,8 ms | **45,9 ms** |

**Le squarifié coûte plus cher à calculer** — jusqu'à **5,9 fois** sur
`SYN-100K` — parce qu'il trie les enfants de chaque nœud. Ce coût est payé
**une fois** par arborescence, pas par image; il n'apparaît donc pas dans les
images par seconde. **Il devra être compté** le jour où le calepin sera
recalculé à chaud.

## 5. Les deux calepins comparés

Protocole : **mêmes** arborescences, **même** trajectoire scriptée, **même**
nombre de blocs visibles demandé, **même** session, **cinq** exécutions.
Tableaux complets dans [PERF-0004](../performance/PERF-0004-b2bis-layout-and-budget.md).

### 5.1 Le résultat central

**Sur `SYN-WIDE`, à 3 000 blocs demandés, le calepin change tout.**

| | `CAL-A` — alterné | `CAL-B` — squarifié |
|---|---:|---:|
| Blocs visibles | 2 856 | 2 856 |
| Nœuds DOM construits | 5 714 | 5 714 |
| **Images par seconde, déplacement** | **21,79** [21,79 – 21,83] | **119,05** [80,00 – 119,05] |
| Images par seconde, zoom | 20,00 | 80,65 |
| Sélection, p95 | 43,5 ms | 14,1 ms |
| **Rapport d'aspect médian** | **3 987,79** | **1,01** |

**Les deux calepins construisent exactement le même nombre de nœuds DOM.** La
différence n'est donc **pas** une différence de quantité : c'est une
différence de **forme**. Le découpage alterné produit sur `SYN-WIDE` des
lamelles dont le grand côté vaut en moyenne **près de quatre mille fois** le
petit; le squarifié produit des rectangles **quasi carrés**.

`B2` avait supposé que l'effondrement de `SYN-WIDE` venait du calepin
(rapport §3.6, §3.9.5). **C'est mesuré, et c'est exact.**

### 5.2 Le squarifié ne coûte rien ailleurs — il gagne

À nombre de blocs égal, `CAL-B` n'a **jamais** perdu d'images par seconde
contre `CAL-A`, sur aucune forme, à aucune des trois densités.

| Forme | Blocs demandés | ips `CAL-A` | ips `CAL-B` | Variation |
|---|---:|---:|---:|---:|
| `SYN-DEEP` | 1 000 | 120,48 | 238,10 | **+97,6 %** |
| `SYN-DEEP` | 3 000 | 59,52 | 80,00 | **+34,4 %** |
| `SYN-DEEP` | 5 000 | 30,03 | 47,85 | **+59,3 %** |
| `SYN-EQUILIBRE` | 1 000 | 238,10 | 238,10 | 0,0 % |
| `SYN-EQUILIBRE` | 3 000 | 60,24 | 80,00 | **+32,8 %** |
| `SYN-EQUILIBRE` | 5 000 | 40,00 | 48,08 | **+20,2 %** |

L'écart de nombre de blocs entre les deux calepins ne dépasse jamais **0,1 %**
sur ces six couples : la comparaison est bien faite « à nombre de blocs égal ».

### 5.3 Le classement géométrique et le classement des performances coïncident

À 3 000 blocs demandés :

| Forme | Aspect médian `CAL-A` | Aspect médian `CAL-B` | Meilleur aspect | ips `CAL-A` | ips `CAL-B` | Meilleures ips |
|---|---:|---:|---|---:|---:|---|
| `SYN-WIDE` | 3 987,79 | **1,01** | `CAL-B` | 21,79 | **119,05** | `CAL-B` |
| `SYN-DEEP` | 28,84 | **1,46** | `CAL-B` | 59,52 | **80,00** | `CAL-B` |
| `SYN-EQUILIBRE` | 7,22 | **1,38** | `CAL-B` | 60,24 | **80,00** | `CAL-B` |

Les deux classements coïncident sur les trois formes.

**Attention à ce que cela prouve, et à ce que cela ne prouve pas.** La
coïncidence est **complète** : `CAL-B` gagne partout, sur les deux grandeurs.
Un classement où le gagnant est le même partout est **compatible** avec
l'hypothèse géométrique, mais il ne la **discrimine** pas d'une autre cause
commune. `F2` est confirmée **selon son énoncé écrit**; la démonstration
causale, elle, resterait à faire par une expérience où les deux classements
pourraient diverger. C'est repris en §11.

## 6. Le budget de rendu auto-régulé

### 6.1 Ce qui a été écrit, avant mesure

Le contrôleur est dans
[`spikes/b2bis-layout-and-budget/budget.mjs`](../../spikes/b2bis-layout-and-budget/budget.mjs),
commité en `85a4a05`, **avant** toute mesure publiée.

| Paramètre | Valeur | Rôle |
|---|---:|---|
| Cible | **30 ips** | temps d'image visé : 33,33 ms |
| Fenêtre d'observation | **12 images** | une décision par fenêtre, sur la **médiane** observée |
| Zone morte | **25,00 – 38,33 ms** | `margeBasse` 0,75 et `margeHaute` 1,15 |
| Échelle des seuils d'aire | **60 → 2 400 px²**, pas × 1,35, **14 niveaux** | échelle **finie**, donc terminaison garantie |
| **Plancher de lisibilité** | **2 400 px²** | **jamais dépassé**, même si la cible n'est pas tenue |
| Refroidissement | **2 fenêtres** | interdit d'inverser le sens trop vite |
| Niveau initial | 4, soit 199,29 px² | — |

Les cinq exigences de §5.2 sont tenues ainsi :

| Exigence | Comment |
|---|---|
| 1 — mesure avant de décider | la **seule** entrée est un temps d'image relevé par `requestAnimationFrame` dans la page |
| 2 — converge | échelle **finie**, zone morte, refroidissement |
| 3 — borné en lisibilité | `seuilMax` = 2 400 px² : au-delà, décision `plancher-lisibilite`, **échec déclaré, jamais succès** |
| 4 — déterministe à conditions égales | ni horloge, ni aléa, ni accès au document — **vérifié par rejeu**, §6.4 |
| 5 — n'écrit rien | aucun stockage; **contrôle statique** de la source, §6.4 |

### 6.2 Ce que le budget a fait — cible 30 ips

Protocole : vue ajustée au contenu, **changement brusque de vue à 600 ms**
(saut vers une région dense et zoom × 3,5 en une image), puis déplacement
continu déterministe pendant 14 s. Cinq exécutions par ligne. Moteur : Edge.

| Calepin | Forme | Dernier changement de niveau | ips régime stable | Inversions / 10 s | Niveau final | Blocs | ips après convergence | Sélection p95 |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| `CAL-A` | `SYN-EQUILIBRE` | **5 363 ms** | 40,00 | 0 | 0 | 5 880 | 59,52 | 17,9 ms |
| `CAL-A` | `SYN-DEEP` | **2 154 ms** | 59,52 | 0 | 0 | 4 561 | 80,00 | 18,7 ms |
| `CAL-A` | `SYN-WIDE` | **6 065 ms** | **26,60** | 0 | 9 | 2 721 | 26,67 | 37,7 ms |
| `CAL-A` | `SYN-100K` | 1 382 ms | 34,13 | 0 | 0 | 11 646 | 39,84 | 34,5 ms |
| `CAL-B` | `SYN-EQUILIBRE` | 1 899 ms | 59,88 | 0 | 0 | 6 065 | 79,37 | 10,7 ms |
| `CAL-B` | `SYN-DEEP` | **2 062 ms** | 59,88 | 0 | 0 | 6 044 | 80,00 | 20,4 ms |
| `CAL-B` | `SYN-WIDE` | 1 882 ms | 60,24 | 0 | 0 | 6 005 | 80,00 | 10,6 ms |
| `CAL-B` | `SYN-100K` | 1 064 ms | **120,48** | 0 | 0 | 3 582 | 120,48 | 8,2 ms |

### 6.3 Pourquoi `F4` est réfutée — deux causes, mesurées

**`F4` exige trois choses à la fois, sur les quatre formes : convergence en
≤ 2 s, ≥ 30 ips en régime stable, au plus deux inversions sur 10 s.** La
troisième est tenue partout — **zéro inversion**, sur les huit lignes et les
cinq exécutions. Les deux autres ne le sont pas.

**Cause 1 — la zone morte tolère un régime stable sous la cible.** La marge
haute de 1,15 fixe le déclenchement de l'agrégation à **38,33 ms**, ce qui
correspond à **26,1 ips**. Un état qui rend **26,6 ips** est donc, pour le
contrôleur, un état satisfaisant : il ne fait plus rien. C'est exactement ce
qu'on observe sur `CAL-A` / `SYN-WIDE`, bloqué à **26,60 ips** — **sous les
30 exigées** — sans avoir atteint le plancher de lisibilité, encore éloigné de
quatre niveaux. **Un contrôleur qui vise 30 ips ne doit pas tolérer 26,1 ips.**
C'est un défaut de conception du contrôleur, pas du principe.

**Cause 2 — la descente vers le détail est volontairement lente.** Le
refroidissement de deux fenêtres impose **trois fenêtres par niveau affiné**.
Partant du niveau 4, il faut **douze fenêtres** pour atteindre le niveau 0.
À 40 ips, une fenêtre de 12 images dure 300 ms : la descente coûte donc
**environ 3,6 s**, ce qui dépasse mécaniquement les 2 s de `F4` **dès que la
machine a de la marge**. Les trois lignes qui échouent uniquement sur la
convergence — `CAL-A`/`SYN-EQUILIBRE`, `CAL-A`/`SYN-DEEP`, `CAL-B`/`SYN-DEEP` —
sont toutes dans ce cas : elles tiennent 40 à 60 ips, largement au-dessus de
la cible, mais mettent trop longtemps à **cesser d'agréger**.

**Ce qui est réfuté est le contrôleur écrit, pas le principe du budget.** Les
deux causes sont des constantes déclarées avant mesure, et **elles n'ont pas
été retouchées** pour faire passer le critère. La décision ultérieure qui
choisira un budget dispose maintenant de deux corrections précises à examiner :
resserrer la marge haute jusqu'à la cible, et distinguer le refroidissement de
l'agrégation de celui de l'affinage.

### 6.4 Déterminisme et absence d'écriture — vérifiés

`replay-budget.mjs` rejoue **hors navigateur**, avec le **même fichier
source**, les temps d'image réellement observés **dans** le navigateur, puis
compare la suite de décisions caractère par caractère à la signature produite
par la page au moment de la mesure.

| Contrôle | Résultat |
|---|---|
| Trace synthétique de 600 images, rejouée deux fois | **50 décisions, signatures identiques** |
| Traces réelles de la campagne, rejouées hors navigateur | **aucune divergence** — voir §9 |
| Double rejeu de chaque trace réelle | aucune divergence interne |
| Contrôle statique de `budget.mjs`, commentaires retirés | **aucun** `localStorage`, `sessionStorage`, `indexedDB`, `document.cookie`, `writeFile`, `fetch(`, `Date.now`, `Math.random`, `new Date`, `performance.now` |

**Ce que ce contrôle prouve, et ce qu'il ne prouve pas.** Il prouve que le
contrôleur est une **fonction pure** de la suite des temps d'image. Il ne
prouve pas que deux exécutions du banc produisent la même suite de décisions :
les temps d'image réels diffèrent d'une exécution à l'autre. **L'exigence
§5.2.4 est tenue au sens où elle peut l'être**, et cette précision est écrite
plutôt que masquée.

## 7. `SYN-100K` — la réserve de volumétrie est comblée

### 7.1 Ce que la réserve disait

`DEC-0008` écrit sa condition de falsification sur **`SYN-100K`, `SYN-DEEP` et
`SYN-WIDE`**. `B2` a mesuré `SYN-EQUILIBRE` à la place de `SYN-100K` :
**`B2` ne falsifiait donc pas littéralement `DEC-0008` selon son protocole
complet**. C'est la réserve `R1` du contrôle indépendant `ACTION-0021`, et
c'est le point C de `DEC-0013`.

**`SYN-100K` a été réellement joué.** 100 000 nœuds, graine fixe, forme
décrite en §4, mesurée en phase B à seuil imposé et en phase C sous budget.

### 7.2 Les deux seuils de `§3.6` de `BASELINE_TARGETS`, sous budget actif

Cinq exécutions, calepin `CAL-B`, budget actif, moteur **Microsoft Edge
152.0.4191.53** — **pas WebView2**.

| Grandeur | Cible de `§3.6` | Mesuré, médiane [min – max] | Verdict |
|---|---|---:|---|
| Images par seconde, déplacement continu | **≥ 30 ips soutenues** | **120,48** [120,48 – 120,48] | **tenue** |
| Latence de sélection, 95<sup>e</sup> centile | **≤ 150 ms** | **8,2 ms** [7,0 – 8,5] | **tenue** |
| Blocs simultanément visibles | à **relever**, pas à supposer | **3 461** [3 461 – 3 462] | **relevé** |
| Nœuds DOM construits | — | **7 269** | compté |

Avec `CAL-A` et le même budget, les deux seuils sont également tenus, mais avec
beaucoup moins de marge : **39,84 ips** et **34,5 ms**, pour **11 708** blocs.

### 7.3 Ce que cela ferme, et ce que cela ne ferme pas

**Ce que cela ferme.** Le protocole de `DEC-0008` est désormais applicable à la
lettre et **il a été appliqué** : les trois formes qu'il nomme ont été jouées,
`SYN-100K` compris. Sur cette machine, dans ce moteur, avec ce calepin et ce
budget, **l'option A de `DEC-0008` — HTML/SVG dans le DOM — tient les deux
seuils sur 100 000 éléments indexés**, en n'en construisant que **3 461**.

Cela confirme au passage l'argument de fond de `DEC-0008` : **les 100 000
éléments sont un volume indexé, pas un volume dessiné.** Le rapport mesuré est
de **29 pour 1**.

**Ce que cela ne ferme pas.** La mesure n'est pas faite dans WebView2 (§3), ni
sur un poste ordinaire (§11). La réserve `R1` est **comblée quant au protocole**
— `SYN-100K` a été joué — mais la réserve `R8` sur la transposition à la
production **reste entière**.

## 8. Accessibilité — aucune régression

Les contrôles de `B2` §3.8 sont **rejoués tels quels**, sur le **même** code :
`role`, `aria-expanded`, `aria-selected`, `aria-level`, `aria-setsize`,
`aria-posinset`, puis navigation par flèches, `Home` et `End`, vérifiée à la
fois sur l'état interne **et** sur `document.activeElement`.

| Grandeur | Résultat |
|---|---|
| Scénarios contrôlés | **32** — 24 à seuil imposé, 8 sous budget actif |
| Scénarios `treeitem` conformes | **32 / 32** |
| Scénarios clavier conformes | **32 / 32** |
| Attributs ARIA manquants, tous scénarios confondus | **0** |
| Nœuds à enfants construits sans `aria-expanded` | **0** |
| Régressions | **aucune** |

**Le calepin squarifié ne dégrade pas l'accessibilité, par construction.**
`CAL-B` trie une **copie** des enfants pour poser ses rangées : `n.enfants`
conserve son ordre d'origine. `aria-posinset`, `aria-setsize` et l'ordre de
parcours au clavier sont donc **identiques** entre les deux calepins. Ce n'est
pas une coïncidence de mesure, c'est une propriété du code, et elle est
mesurée par-dessus.

**Ce que ce contrôle ne dit pas.** La conformité porte sur les **attributs
produits** et sur `document.activeElement`. **Aucun lecteur d'écran réel n'a
été essayé.** C'est la même limite que `B2`, et elle n'est pas levée.

## 9. Verdicts `F1` à `F8` — un par ligne, avec la mesure qui le fonde

Les huit verdicts sont **calculés par script**
([`verdicts.mjs`](../../spikes/b2bis-layout-and-budget/verdicts.mjs)), qui
applique les énoncés de `TASK-0013` §6 **à la lettre**, sur le rapport JSON
brut. Aucun seuil n'y est négocié. Sortie complète :
`spikes/.work/b2bis/verdicts-edge.json`.

**Moteur de tous les verdicts : Microsoft Edge 152.0.4191.53 — pas WebView2.**

| # | Énoncé | **Verdict** | Mesure qui le fonde |
|---|---|---|---|
| **`F1`** | Le calepin squarifié corrige l'effondrement de `SYN-WIDE` | **CONFIRMÉE** | `CAL-B`, `SYN-WIDE`, **2 856 blocs**, 5 714 nœuds DOM : **119,05 ips** [80,00 – 119,05] et **14,1 ms** p95 [13,3 – 14,6]. Les deux seuils — ≥ 30 ips, ≤ 150 ms — sont tenus **sur les cinq exécutions**, la pire comprise. Référence `CAL-A`, mêmes blocs : 21,79 ips, 43,5 ms |
| **`F2`** | L'avantage du squarifié s'explique par la géométrie | **CONFIRMÉE** | Aspect médian `CAL-B` **strictement plus proche de 1** sur `SYN-WIDE` : **1,01** contre **3 987,79**. Classement aspect et classement images par seconde **coïncident sur les trois formes** (§5.3). **Voir la restriction de portée en §11.4** |
| **`F3`** | Le squarifié ne coûte rien ailleurs | **CONFIRMÉE** | Sur `SYN-DEEP` et `SYN-EQUILIBRE`, aux trois densités, `CAL-B` ne perd **jamais** : de **+20,2 %** à **+97,6 %** d'images par seconde. Tolérance de 5 % **jamais approchée**. Écart de nombre de blocs ≤ **0,1 %** |
| **`F4`** | Le budget auto-régulé tient la cible | **RÉFUTÉE** | Sur 8 lignes, **4 échouent**. `CAL-A`/`SYN-WIDE` : régime stable à **26,60 ips**, **sous les 30 exigées**, et dernier changement à **6 065 ms**. `CAL-A`/`SYN-EQUILIBRE` **5 363 ms**, `CAL-A`/`SYN-DEEP` **2 154 ms**, `CAL-B`/`SYN-DEEP` **2 062 ms** : convergence au-delà des 2 s. **Le critère d'oscillation, lui, est tenu partout : zéro inversion**, 8 lignes × 5 exécutions. Causes mesurées en §6.3 |
| **`F5`** | Le budget reste lisible | **CONFIRMÉE** | Plancher déclaré **2 400 px²**, jamais franchi sur **16 lignes** — 8 à cible 30 ips, 8 sous contrainte. Sous contrainte à 1 000 ips, **physiquement inatteignable**, le budget monte jusqu'au **niveau 13 sur 13**, atteint **exactement 2 400 px²**, **s'y arrête et y reste** : il refuse d'agréger davantage alors qu'il n'atteint pas sa cible. C'est précisément l'exigence §5.2.3, et elle est **réellement exercée** |
| **`F6`** | `SYN-100K` tient le protocole de `DEC-0008` | **CONFIRMÉE** | `SYN-100K` **réellement joué**, 100 000 nœuds. Avec `CAL-B` et budget actif : **120,48 ips** [120,48 – 120,48] et **8,2 ms** p95 [7,0 – 8,5]. Les **deux** seuils de `§3.6` tenus sur les cinq exécutions. Blocs simultanément visibles **comptés dans la page** : **3 461** [3 461 – 3 462], pour 7 269 nœuds DOM |
| **`F7`** | L'accessibilité ne régresse pas | **CONFIRMÉE** | **32 / 32** scénarios conformes — 24 à seuil imposé, 8 sous budget actif, les deux calepins. **Zéro** attribut ARIA manquant, **zéro** nœud à enfants construits sans `aria-expanded`, `document.activeElement` conforme sur les huit touches. **Aucune variante n'est disqualifiée** |
| **`F8`** | Le moteur de référence est WebView2 | **RÉFUTÉE** | Six tentatives, aucune n'ouvre un serveur CDP joignable. Sans `--embedded-browser-webview=1`, code de sortie **13** en 14 à 32 ms; avec, arrêt spontané en **236 ms**, serveur jamais joint malgré une sonde toutes les 50 ms. **§5.4 appliqué intégralement** : substitut déclaré, différences énumérées, écart **NON MESURÉ**, chaque tableau étiqueté |

**Deux réfutations sur huit.** Elles sont publiées telles quelles. **Aucun
seuil n'a été modifié après la première mesure**, et la préséance est
vérifiable : le commit `85a4a05` porte les critères, le plancher et le
matériel; il précède toute mesure publiée.

### 9.1 Contrôle du déterminisme — 80 traces réelles rejouées

| Contrôle | Résultat |
|---|---|
| Traces de temps d'image relevées **dans le moteur**, rejouées **hors navigateur** avec le même fichier source | **80 traces, 0 divergence** |
| Double rejeu de chacune | **0 divergence interne** |
| Trace synthétique de 600 images, deux rejeux | 50 décisions, **signatures identiques** |
| Contrôle statique de `budget.mjs`, commentaires retirés, 89 lignes de code | **aucun** motif d'écriture, d'horloge ou d'aléa |

Le contrôleur exécuté **dans** Edge et celui exécuté **dans** Node produisent
la **même suite de décisions**, caractère par caractère, sur les **mêmes**
temps d'image. L'exigence §5.2.4 est tenue au sens où elle peut l'être; la
restriction est écrite en §6.4.

### 9.2 Ce que le contrôle de continuité Chrome ajoute

Chrome 151.0.7922.175 a joué **la même matrice et la même volumétrie**, cinq
exécutions, même machine, même page, même jour.

**1. Le banc reproduit `B2`.** `B2` avait mesuré `SYN-WIDE` à **14,08 ips** à
3 000 blocs, dans Chrome 151. `B2 bis` mesure **13,32 ips** avec le même
calepin `CAL-A`, le même moteur, **2 856** blocs. Les deux concordent à une
marche de quantification près. **Les comparaisons établies par ce banc reposent
donc sur un instrument vérifié.**

**2. Le moteur pèse très lourd.** Sur les **18** couples où aucun des deux
moteurs n'est buté contre la synchronisation verticale, Chrome rend entre
**0,50 et 0,71** fois les images par seconde d'Edge, **médiane 0,60**.

Sur `SYN-DEEP` et `SYN-EQUILIBRE`, cet écart de moteur est **du même ordre que
le gain du calepin**, parfois supérieur. Sur `SYN-WIDE`, le calepin domine
largement : **× 5,5** contre **× 0,6**.

**3. `F1` tient aussi dans Chrome.** `CAL-B`/`SYN-WIDE`/2 856 blocs y donne
**59,88 ips** et **23,0 ms** p95 : les deux seuils sont tenus dans les **deux**
moteurs mesurés. Cela ne dit **rien** de WebView2.

**Conséquence.** Un écart de moteur de cette taille, entre deux constructions
Chromium proches, interdit de traiter l'écart avec WebView2 comme négligeable.
**La réserve `R8` sort renforcée de cette campagne, pas levée.**


## 10. Ce que cette tâche décide, et ce qu'elle ne décide pas

`TASK-0013` §6.1 est explicite : cette tâche **ne choisit pas** le calepin du
produit et **n'adopte pas** un budget. Elle produit les mesures qui rendront ce
choix possible. **Rien ici n'est une décision.**

Ce que les mesures rendent disponible pour une décision ultérieure :

1. **Le calepin est une variable de conception qui pèse lourd**, plus que le
   nombre de blocs. À nombre de nœuds DOM **identique**, le pavage squarifié
   rend `SYN-WIDE` **5,5 fois** plus rapide que le découpage alterné.
2. **Le squarifié ne coûte rien à l'image, mais coûte au calcul** : jusqu'à
   **5,9 fois** le temps de calepinage sur `SYN-100K`, payé une fois par
   arborescence.
3. **Le principe du budget auto-régulé fonctionne**; le **contrôleur écrit
   pour ce banc ne tient pas `F4`**, pour deux causes identifiées et mesurées
   (§6.3). Les deux se corrigent par des constantes, pas par une refonte.
4. **`SYN-100K` tient les deux seuils** de `§3.6` sous budget et calepin
   squarifié, en construisant **3 461** blocs pour **100 000** éléments
   indexés.
5. **L'accessibilité n'est pas un arbitrage** : elle est intacte sur les 32
   scénarios, avec les deux calepins et sous budget.

## 11. Non testé, et limites — sans atténuation

### 11.1 Le moteur

- **WebView2 n'a pas été mesuré.** L'instrumentation directe est impossible
  sans hôte embarqueur, donc sans dépendance nouvelle et sans code d'hôte
  applicatif (§3). **`F8` est réfutée.**
- **L'écart entre WebView2 et les moteurs mesurés est NON MESURÉ.** Il n'est
  ni estimé, ni borné, ni réputé négligeable.
- **Aucun chiffre de ce document n'est une mesure de production.** La réserve
  `R8` d'`ACTION-0021` **reste en vigueur**.

### 11.2 Le matériel et l'environnement

- **Une seule machine**, nettement **au-dessus d'un poste ordinaire** :
  i9-9900K, 64 Gio, RTX 2070, écran **240 Hz**. Les valeurs publiées sont un
  **plafond favorable**.
- **Aucune mesure reproduite ailleurs**, sur aucune autre machine, sur aucun
  autre système.
- **Mode sans affichage** (`--headless=new`). Le rendu réel de FileTopo se
  fera dans une fenêtre visible, dont le comportement de composition peut
  différer.
- **Aucun autre travail concurrent contrôlé** : la machine n'était pas isolée,
  seulement inactive par ailleurs.

### 11.3 Le protocole de mesure

- **`revirtualisations = 0`** sur toutes les mesures de déplacement à seuil
  imposé : le mode `transform` est mesuré dans son cas **le plus favorable**.
  C'est la même réserve que `B2` §3.9.6, et elle **n'est pas levée**.
- **Le mode `reecriture` de `B2` n'a pas été rejoué.** Le mode de rendu est
  fixé à `transform` pour que la seule variable soit le calepin.
- **La trajectoire est une seule trajectoire.** Un autre parcours pourrait
  donner d'autres nombres.
- **Les images par seconde sont QUANTIFIÉES par la synchronisation
  verticale.** Les temps d'image observés sont des multiples de l'intervalle
  de 4,17 ms d'un écran à 240 Hz : 4,17, 8,33, 12,50, 16,67, 20,83, 25,00,
  33,33, 41,7, 54,2, 75,1, 125,2 ms. Les images par seconde publiées sont donc
  des **marches**, pas une grandeur continue. Deux configurations séparées par
  une marche affichent un écart relatif important même si leur coût réel
  diffère peu. **Aucun écart mesuré ici ne doit être lu comme une précision
  meilleure qu'une marche.**
- **Les valeurs de 238,10 ips sont BUTÉES** contre la synchronisation
  verticale : elles signifient « au moins 238 », pas « exactement 238 ». Les
  six couples concernés sont exclus du calcul d'écart entre moteurs (§9.2).
- **Trois densités seulement** — 1 000, 3 000 et 5 000 blocs demandés. Aucun
  plafond par dichotomie n'a été recherché dans cette campagne, contrairement
  à `B2`.

### 11.4 Ce que `F2` ne démontre pas

`F2` est confirmée selon son énoncé écrit. **Elle n'établit pas la causalité.**
`CAL-B` gagne à la fois sur le rapport d'aspect et sur les images par seconde,
sur les trois formes : les deux classements coïncident, mais **aucune
expérience n'a été conduite où ils auraient pu diverger**. L'hypothèse
géométrique est **compatible** avec les mesures, elle n'est pas **isolée**
d'une autre cause commune.

### 11.5 Le budget

- **`F4` est réfutée** (§6.3). Le contrôleur mesuré tolère un régime stable à
  **26,1 ips** alors qu'il vise 30, et met jusqu'à **6 s** à cesser d'agréger
  quand la machine a de la marge.
- **Le déterminisme est vérifié pour le contrôleur, pas pour le banc.** Deux
  exécutions du banc ne produisent pas la même suite de décisions, parce que
  les temps d'image réels diffèrent (§6.4).
- **Le plancher de lisibilité est un choix, pas une mesure.** 2 400 px²
  correspond à un bloc d'environ 60 × 40 pixels, la plus petite surface qui
  porte encore son étiquette de 11 px dans ce prototype. **Aucun essai avec
  des personnes** n'a établi ce seuil.
- **Le budget n'a été éprouvé que sur un changement brusque de vue suivi d'un
  déplacement continu.** Ni redimensionnement de fenêtre, ni changement de
  densité de pixels, ni arrivée de données pendant l'indexation.

### 11.6 L'accessibilité

- **Aucun lecteur d'écran réel** n'a été essayé. La conformité porte sur les
  **attributs produits** et sur `document.activeElement`.
- Aucun contrôle de contraste, de `prefers-reduced-motion`, ni de contraste
  élevé de Windows.

### 11.7 Ce qui reste ouvert, hors de cette tâche

- **L'échec de `B0`** n'est pas corrigé, et le cache incrémental fautif de
  `src-tauri/target/` est **conservé**, conformément à `DEC-0013` E.
- **Le comportement inter-volume de `B3` reste NON TESTÉ**, par décision.
- **La question 3 de `B4` reste ouverte** : l'identité après hydratation.
- **Les réserves `R1` à `R9`** d'`ACTION-0021` restent en vigueur. `R1` est
  **comblée quant au protocole** — `SYN-100K` a été joué — mais aucune fiche ne
  peut la déclarer levée sans une preuve écrite qui la lève nommément; c'est au
  contrôle indépendant de le dire, pas à l'exécuteur.

## 12. Fichiers, état Git et preuves brutes

### 12.1 Créés

| Chemin | Nature |
|---|---|
| `spikes/fixtures/synthetic-shapes.mjs` | Générateur des quatre formes, dont **`SYN-100K`** |
| `spikes/b2bis-layout-and-budget/README.md` | Règles et mode d'emploi du banc |
| `spikes/b2bis-layout-and-budget/calepins.mjs` | `CAL-A` repris sans modification, `CAL-B` squarifié |
| `spikes/b2bis-layout-and-budget/budget.mjs` | Contrôleur de budget auto-régulé |
| `spikes/b2bis-layout-and-budget/map2.html` | Page de mesure |
| `spikes/b2bis-layout-and-budget/run-b2bis.mjs` | Pilote CDP, quatre phases |
| `spikes/b2bis-layout-and-budget/detect-webview2.mjs` | Tentative WebView2, rejouable |
| `spikes/b2bis-layout-and-budget/describe-shapes.mjs` | Description des formes, contrôle des calepins |
| `spikes/b2bis-layout-and-budget/replay-budget.mjs` | Contrôle de déterminisme |
| `spikes/b2bis-layout-and-budget/verdicts.mjs` | Application littérale de `F1` à `F8` |
| `spikes/b2bis-layout-and-budget/tables.mjs` | Génération des tableaux publiés |
| `docs/performance/PERF-0004-b2bis-layout-and-budget.md` | Mesures |
| `docs/research/TASK-0013-b2-bis-results.md` | Le présent journal |

### 12.2 Modifiés

`docs/tasks/TASK-0013-*.md` — statut, exécuteur, ligne de GO, historique d'état
et rapport d'exécution, comme l'autorise §4.2. Plus la mémoire obligatoire :
`CURRENT_STATE.md`, `NEXT_ACTION.md`, `HANDOFF.md`, `VALIDATION.md`,
`CHANGELOG_AI.md`.

Sur la branche de départ `spike/v0.2-technical-risk-gates`, un seul fichier a
été touché avant la bifurcation : `docs/reviews/ACTION-0021-independent-control.md`,
pour y **joindre en annexe le texte intégral des réserves `R1` à `R9`**. Aucune
réserve n'y est levée.

### 12.3 Aucun fichier de production touché

`git diff --name-only` entre la pointe de départ et la pointe de travail,
restreint à `src/`, `src-tauri/`, `tests/`, `public/`, `scripts/`, `.github/`
et `graph/` : **vide**.

Empreintes SHA-256 des quatre manifestes et verrous, **inchangées** :

| Fichier | SHA-256 |
|---|---|
| `package.json` | `77c94b806e045c38f352e0f568ae75fe2f19042aa29dbccbbdc7df46756a8127` |
| `pnpm-lock.yaml` | `e1563316e9b38847337e568b59a7639b3c4d05c2c5c706279f2fa4ee0272d949` |
| `src-tauri/Cargo.toml` | `efe6d6dcdb1abf63a54505d0907a18edda7268b905659f92610763f5ca51aa95` |
| `src-tauri/Cargo.lock` | `f6d6da5595378e9a3f9f702c50bd6dbbd9e177bc6697fa4ba1a6bcbad6b73e63` |

### 12.4 Preuves brutes, non commitées

Elles vivent sous `spikes/.work/b2bis/`, **ignoré par Git**, conformément aux
règles d'isolation de `spikes/README.md`. Elles sont **reproductibles** par les
commandes du `README.md` du banc.

| Fichier | Contenu |
|---|---|
| `rapport-b2bis-edge.json` | Toutes les mesures Edge, quatre phases, cinq exécutions |
| `rapport-b2bis-chrome.json` | Matrice et volumétrie Chrome |
| `verdicts-edge.json` | Les huit verdicts et leurs mesures |
| `webview2-tentatives.json` | Les six tentatives WebView2 |
| `formes-et-calepins.json` | Description des formes, contrôle des calepins |
| `tableaux-perf-0004.md` | Les tableaux publiés, tels que générés |
| `journal-edge.txt`, `journal-chrome.txt`, `journal-edge-plancher.txt` | Sorties de console des campagnes |

### 12.5 Actions distantes

| Action | Fait |
|---|---|
| Push vers `spike/v0.2-technical-risk-gates` | **oui**, un commit, annexe `R1`–`R9` |
| Push vers `spike/v0.2-render-budget` | **oui**, branche de travail publiée |
| Réécriture d'historique, `force push`, suppression de branche | **non** |
| Fusion, pull request, release, étiquette | **non** |
| Push vers `main` ou `rebuild/v0.2-project-brain` | **non** |
| Dépense, achat, usage payant | **non** |
| Lecture, listage ou écriture hors du dépôt | **non**, hors le lancement des navigateurs installés — voir §12.6 |

### 12.6 Une précision de périmètre, déclarée plutôt que tue

`TASK-0013` §5.4 **impose** de tenter WebView2 en premier. Tenter WebView2
suppose de **localiser puis lancer un exécutable installé sur le système**, ce
que `B2` avait déjà fait pour Chrome sous le GO P3.

Ce qui a été fait, exactement : lecture d'**une** valeur de version dans le
registre, contrôle d'existence de **trois** chemins d'exécutables, et
**lancement** de ces programmes. Ce qui n'a **pas** été fait : aucune lecture
de document, de dossier utilisateur, de donnée personnelle ou de contenu hors
du dépôt; **aucune écriture** hors du dépôt — les profils de navigateur sont
créés sous `spikes/.work/b2bis/`, à l'intérieur du dépôt, contrairement à `B2`
qui les plaçait dans le répertoire temporaire du système.

Cette précision est écrite ici pour qu'un contrôle indépendant puisse la juger,
plutôt que de la découvrir.
