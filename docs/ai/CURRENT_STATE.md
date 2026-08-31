# État courant

- **Dernière mise à jour :** 2026-08-31
- **Branche active :** **`spike/v0.2-render-budget`**, publiée sur origin,
  créée depuis `746f1b5f93c9d7085516c0e56473a95dc2c2d178`
- **`spike/v0.2-technical-risk-gates` :** `746f1b5…`, publiée — un seul commit
  ajouté depuis la clôture d'`ACTION-0021` : l'**annexe `R1` à `R9`**
- **`rebuild/v0.2-project-brain` :** inchangée, `db8d3de0…`, **non touchée**
- **`main` :** inchangée, `91bbe90f0f99026c28cd345784d4f579a0016db2`, **non
  touchée**
- **Dernière tâche vérifiée :** **`TASK-0012`, `VERIFIED` le 2026-08-31**, sur
  contrôle indépendant [`ACTION-0021`](../reviews/ACTION-0021-independent-control.md),
  **avec neuf réserves `R1` à `R9` maintenues**
- **Tâche livrée, NON vérifiée :** **`TASK-0013`, `IMPLEMENTED` le
  2026-08-31** — `B2 bis`, calepin squarifié, budget de rendu, `SYN-100K`
- **Tâche IN_PROGRESS :** aucune
- **Code applicatif :** **inchangé.** 0 fichier modifié sous `src/`,
  `src-tauri/`, `tests/`, `public/`, `scripts/`, `.github/` ou `graph/`. Les
  quatre empreintes SHA-256 de `package.json`, `pnpm-lock.yaml`,
  `src-tauri/Cargo.toml` et `src-tauri/Cargo.lock` sont **identiques avant et
  après**

## TASK-0013 est exécutée : huit verdicts, deux réfutations

`B2 bis` a été joué de bout en bout. Preuves :
[journal et verdicts](../research/TASK-0013-b2-bis-results.md),
[PERF-0004](../performance/PERF-0004-b2bis-layout-and-budget.md).

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
référence; il **précède** toute mesure publiée. La préséance est vérifiable
dans l'historique Git.

### Le calepin est la variable qui décide, pas le nombre de blocs

Sur `SYN-WIDE`, à **nombre de nœuds DOM identique** — 5 714 dans les deux cas :

| | `CAL-A`, alterné | `CAL-B`, squarifié |
|---|---:|---:|
| Images par seconde, déplacement | **21,79** | **119,05** |
| Sélection, p95 | 43,5 ms | 14,1 ms |
| **Rapport d'aspect médian** | **3 987,79** | **1,01** |

`B2` avait *supposé* que l'effondrement de `SYN-WIDE` venait du calepin.
**C'est mesuré, et c'est exact.** Ailleurs, le squarifié ne coûte rien : il
gagne de **+20 %** à **+98 %** d'images par seconde sur `SYN-DEEP` et
`SYN-EQUILIBRE`, à nombre de blocs égal.

**Son prix est au calcul, pas à l'image** : jusqu'à **5,9 fois** le temps de
calepinage sur `SYN-100K`, payé une fois par arborescence.

### SYN-100K a été joué — la réserve de volumétrie est comblée quant au protocole

100 000 nœuds, graine fixe, profondeur 6, branchement moyen 8,96. Avec `CAL-B`
et budget actif : **120,48 ips** et **8,2 ms** au 95<sup>e</sup> centile — les
**deux** seuils de §3.6 de `BASELINE_TARGETS`, tenus sur les cinq exécutions.

**3 461 blocs construits pour 100 000 éléments indexés**, soit **29 pour 1**.
C'est exactement l'argument de fond de `DEC-0008` : le volume indexé n'est pas
le volume dessiné.

**L'exécuteur ne déclare pas la réserve `R1` levée.** Il écrit qu'elle est
comblée **quant au protocole** — `SYN-100K` a été joué — et laisse le contrôle
indépendant trancher.

### Le budget fonctionne en principe; le contrôleur écrit ne tient pas F4

Ce qui tient : **zéro oscillation** sur les huit lignes et les cinq exécutions;
**plancher de lisibilité jamais franchi** sur seize lignes; sous une contrainte
volontairement inatteignable, le budget monte au **niveau 13 sur 13**, atteint
exactement **2 400 px²**, **s'y arrête et y reste** — il refuse d'agréger
davantage alors qu'il n'atteint pas sa cible; **déterminisme vérifié** par
rejeu hors navigateur de **80 traces réelles**, zéro divergence.

Ce qui ne tient pas, et pourquoi :

1. **La zone morte tolère un régime stable sous la cible.** La marge haute de
   1,15 place le déclenchement à 38,33 ms, soit **26,1 ips**. `CAL-A` sur
   `SYN-WIDE` se stabilise à **26,60 ips**, sous les 30 exigées, sans même
   approcher le plancher.
2. **La descente vers le détail est trop lente.** Le refroidissement impose
   trois fenêtres par niveau affiné : environ **3,6 s** pour revenir au détail
   maximal, ce qui dépasse mécaniquement les 2 s dès que la machine a de la
   marge.

**Ce qui est réfuté est le contrôleur écrit, pas le principe du budget.** Les
deux causes sont des constantes déclarées avant mesure, et **elles n'ont pas
été retouchées** pour faire passer le critère.

### WebView2 n'a pas pu être instrumenté — F8 réfutée, §5.4 appliqué

WebView2 a été tenté **en premier**, comme la fiche l'exige. Le runtime
**151.0.4129.107 est installé**. Sans `--embedded-browser-webview=1`,
`msedgewebview2.exe` sort en **code 13** en 14 à 32 ms. Avec, il démarre,
annonce un point d'accès DevTools, puis **s'arrête seul en 236 ms** : sans hôte
embarqueur, le processus n'a rien à afficher. Une sonde toutes les 50 ms ne l'a
**jamais** joint.

Écrire un hôte embarqueur exigerait une **dépendance nouvelle** non préparée
d'avance — ce que §4.3 rend **bloquant, jamais contournable** — et du **code
d'hôte applicatif**, que la porte **P4** protège.

**Substitut de référence : Microsoft Edge 152.0.4191.53** — WebView2 *est* Edge
en mode embarqué, mais **une version majeure d'écart** les sépare.
**Contrôle de continuité : Google Chrome 151.0.7922.175**, le moteur de `B2`,
dont la version majeure est celle du runtime WebView2 installé.

**L'écart avec WebView2 est déclaré NON MESURÉ.** Ni estimé, ni borné, ni
réputé négligeable.

### Deux constats de méthode qui pèsent sur toute lecture future

**1. Le moteur pèse plus lourd que le calepin sur deux formes.** Sur les 18
couples non butés contre la synchronisation verticale, Chrome rend entre
**0,50 et 0,71** fois les images par seconde d'Edge — médiane **0,60** — sur la
**même machine**, la **même page**, le **même jour**. Sur `SYN-DEEP` et
`SYN-EQUILIBRE`, cet écart est du même ordre que le gain du calepin. **La
réserve `R8` sort renforcée de cette campagne, pas levée.**

**2. Le banc reproduit `B2`.** `B2` avait mesuré `SYN-WIDE` à **14,08 ips** dans
Chrome 151; `B2 bis` mesure **13,32 ips** avec le même calepin, le même moteur.
L'instrument est vérifié.

## Ce qui n'a pas changé

- **Aucune décision n'est prise.** `TASK-0013` §6.1 : la tâche ne choisit pas
  le calepin du produit et n'adopte pas un budget. **Aucune fiche `DEC` n'a été
  modifiée.**
- **Aucune réserve n'est levée.** `R1` à `R9` d'`ACTION-0021` restent en
  vigueur; leur texte intégral est désormais **joint en annexe** de cette fiche.
- **Canvas 2D n'est pas ouvert**, ni WebGL. Rien n'a été prototypé de ce côté.
- **L'échec de `B0` n'est pas corrigé** et le cache incrémental fautif est
  **conservé**, conformément à `DEC-0013` E.
- **L'inter-volume de `B3` reste NON TESTÉ**, la **question 3 de `B4` reste
  ouverte**.

## Limites et risques

- **Aucune mesure de production.** Ni WebView2, ni `rusqlite`, ni application
  empaquetée. `B2 bis` mesure Edge et Chrome.
- **Une seule machine**, nettement au-dessus d'un poste ordinaire, écran
  **240 Hz**, **mode sans affichage**. Les valeurs sont un **plafond
  favorable**.
- **Les images par seconde sont quantifiées** par la synchronisation verticale,
  en marches de 4,17 ms. Aucun écart ne doit être lu plus finement qu'une
  marche. Les valeurs de **238,10** sont **butées**, pas mesurées.
- **`revirtualisations = 0`** sur toutes les mesures à seuil imposé : le mode
  `transform` est mesuré dans son cas **le plus favorable**. Réserve de `B2`
  **non levée**.
- **`F2` n'établit pas la causalité** : `CAL-B` gagne sur les deux grandeurs et
  les trois formes, donc aucune expérience n'a pu faire diverger les deux
  classements.
- **Le plancher de lisibilité est un choix, pas une mesure.** 2 400 px² :
  **aucun essai avec des personnes** ne l'a établi.
- **Aucun lecteur d'écran réel.** La conformité ARIA porte sur les attributs
  produits et sur `document.activeElement`.
- Toutes les limites publiées par `TASK-0012` **restent entières** : `SIGKILL`
  n'est pas une coupure de courant, disque plein simulé, une seule machine,
  moteurs différents de la production.

## Porte humaine

Les portes **P3** et **P3 bis** sont **franchies**. La porte **P4 est ouverte
et non franchie**.

`TASK-0013` a été livrée **`IMPLEMENTED`, jamais auto-déclarée `VERIFIED`**.
L'action unique suivante est **`ACTION-0023`** : un contrôle indépendant, mené
par une instance **distincte de l'exécuteur**.

**Aucune ligne de code de production ne peut être écrite avant P4.** Les deux
branches de spike ne sont ni fusionnées, ni destinées à l'être automatiquement :
les conserver, les fusionner ou les supprimer appartient à Sébastien.
