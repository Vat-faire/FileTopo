# État courant

- **Dernière mise à jour :** 2026-08-31
- **Branche active :** **`spike/v0.2-budget-controller`**, publiée sur origin,
  créée depuis `933bd0d5e7e05e4e7fe233c5fc6b9320a194264d`
- **`spike/v0.2-render-budget` :** `933bd0d…`, publiée, **non touchée** depuis
  la clôture de `TASK-0013`
- **`spike/v0.2-technical-risk-gates` :** `746f1b5…`, publiée, **non touchée**
- **`rebuild/v0.2-project-brain` :** inchangée, `db8d3de0…`, **non touchée**
- **`main` :** inchangée, `91bbe90f0f99026c28cd345784d4f579a0016db2`, **non
  touchée**
- **Dernière tâche vérifiée :** **`TASK-0013`, `VERIFIED` le 2026-08-31**, sur
  contrôle indépendant
  [`ACTION-0023`](../reviews/ACTION-0023-independent-control.md), **avec quatre
  réserves `V1` à `V4`**
- **Tâche livrée, NON vérifiée :** **`TASK-0014`, `IMPLEMENTED` le
  2026-08-31** — `B2 ter`, correction minimale du contrôleur de budget
- **Tâche IN_PROGRESS :** aucune
- **Code applicatif :** **inchangé.** 0 fichier modifié sous `src/`,
  `src-tauri/`, `tests/`, `public/`, `scripts/`, `.github/` ou `graph/`

## Ce que la clôture d'ACTION-0023 a décidé

`TASK-0013` est **`VERIFIED`**, sur preuves, par une instance **distincte de
l'exécuteur**. Quatre réserves l'accompagnent, et elles voyagent avec tout
résultat cité :

| Réserve | Ce qu'elle impose |
|---|---|
| `V1` | **Ne jamais écrire que 3 000 blocs visibles ont été mesurés.** Le scénario demandé à 3 000 en construit **2 856**. Le résultat est accepté parce que `CAL-B` tient aussi les deux seuils sur **5 012 blocs visibles** — une charge **supérieure** |
| `V2` | **La causalité géométrique n'est pas établie.** `F2` est conforme à son énoncé; aucune expérience n'a pu faire diverger les deux classements |
| `V3` | La correction de protocole **240 → 1 000 ips** est **acceptée** : elle a renforcé le test. Aucun critère ni le plancher de 2 400 px² n'a changé |
| `V4` | La lecture minimale de métadonnées système est acceptée comme **déviation procédurale** causée par une contradiction de `TASK-0013`. `AGENTS.md` et `CLAUDE.md` sont clarifiés en conséquence |

**`R1` d'`ACTION-0021` est LEVÉE** : son objet était l'absence de `SYN-100K`,
et `SYN-100K` a été réellement joué. **`R8` reste EN VIGUEUR** et sort
**renforcée** : aucune mesure WebView2 de production.

[`DEC-0014`](../decisions/DEC-0014-layout-baseline-and-budget-direction.md)
enregistre six décisions : **`CAL-B` squarifié devient le calepin baseline**;
**HTML/SVG accessible** reste la direction; **le contrôleur de budget de
`TASK-0013` n'est pas adopté**; **le principe** du budget auto-régulé est
**conservé**; **aucune nouvelle tentative WebView2** avant qu'un véritable hôte
Tauri existe.

## TASK-0014 est exécutée : la correction n'est pas validée

`B2 ter` a été joué de bout en bout, sur deux moteurs. Preuves :
[journal et verdicts](../research/TASK-0014-b2-ter-results.md),
[PERF-0005](../performance/PERF-0005-b2ter-budget-controller.md).

| # | Énoncé | Verdict |
|---|---|---|
| `G1` | Cible : régime stable ≥ 30 ips sur chacune des 5 exécutions | **RÉFUTÉE** |
| `G2` | Convergence : dernier changement ≤ 2 000 ms | **RÉFUTÉE** |
| `G3` | Stabilité : au plus 2 inversions / 10 s | **BLOQUÉ** |
| `G4` | Lisibilité : plancher jamais franchi, atteint et tenu | **CONFIRMÉE** |
| `G5` | Déterminisme | **CONFIRMÉE** |
| `G6` | Reconstruction réelle, coût mesuré | **CONFIRMÉE** |
| `G7` | Accessibilité | **CONFIRMÉE** |
| `G8` | `SYN-100K` | **CONFIRMÉE** |
| `G9` | Intégrité du protocole | **CONFIRMÉE**, avec déclaration |

**Le commit `4a5520b` porte les neuf critères, la configuration du contrôleur,
le matériel et le protocole; il précède toute mesure.** Après la campagne, les
empreintes SHA-256 de `budget2.mjs`, `map3.html` et `run-b2ter.mjs` sont
**identiques** à celles de ce commit.

### Les deux causes de F4 sont corrigées, et cela se mesure

- **Affinage continu.** 13 affinages consécutifs sans une fenêtre perdue sur la
  trace de contrôle; sur mesure réelle, `SYN-WIDE` descend de quatre niveaux en
  **quatre fenêtres** et converge en **1 030,8 ms** sur les cinq exécutions.
  Le contrôleur de `TASK-0013` mettait **trois fenêtres par niveau**.
- **Zone morte.** Le contrôleur agrège désormais dès **29,94 ips**; il tolérait
  **26,1 ips**. Sur `CAL-A` / `SYN-WIDE` — la configuration qui avait réfuté
  `F4` à 26,60 ips — il monte au niveau 9-10 et tient **30,03 à 34,25 ips**
  dans Edge.

### Mais la correction ne tient ni la cible ni la convergence

Sur `SYN-DEEP`, une exécution tombe à **9,98 ips** en régime stable. Le dernier
changement de niveau intervient à **10 192 ms**, **12 096 ms** et **12 934 ms**
selon la forme, très au-delà des 2 000 ms exigées : **sous charge variable, le
contrôleur n'atteint pas d'état fixe**, il ajuste jusqu'à la fin.

**Cause mesurée.** Les **deux bornes** de la zone morte tombent **exactement**
sur un pas de synchronisation verticale de **4,1667 ms** — `1000 / 30` vaut 8
pas, et 25 ms en vaut 6. **5,8 %** des fenêtres de décision sur Edge et
**10,7 %** sur Chrome se présentent **sur la borne haute**. Une fluctuation
inférieure à la milliseconde fait alors basculer la décision. Supprimer toute
marge à la cible, comme la correction l'exigeait, place le point de bascule là
où le moteur produit le plus de valeurs.

### Le banc est plus dur que celui de B2 bis, volontairement

`B2 bis` mesurait **`revirtualisations = 0`** : le cas le plus favorable.
`B2 ter` en mesure **42 à 51 par exécution**, et chronomètre chaque
reconstruction DOM : coût médian **18,1 à 25,5 ms**, soit **0,57 à 0,76 image**
du budget de 33,3 ms. Ce coût est payé **dans l'image**, jamais retranché.

### Deux défauts de protocole, publiés

`D1` — le « régime stable » peut ne contenir qu'une poignée d'images, parfois
aucune. **Une valeur `ips régime stable` de 0 signifie « aucune image après le
dernier changement », jamais « zéro image par seconde ».**

`D2` — la fenêtre stable de `G3` est **vide par construction**, donc la mesure
ne peut pas falsifier `G3`.

**Le protocole n'a pas été changé, aucune mesure n'a été rejouée, aucune cible
n'a été déplacée.** `G3` est publié **bloqué**, jamais confirmé.

## Ce qui n'a pas changé

- **Aucun budget n'est adopté.** `DEC-0014` D et E restent en vigueur : le
  contrôleur de `TASK-0013` n'est pas adopté, le principe est conservé.
- **Aucune réserve n'est levée par `TASK-0014`.** `V1` à `V4` et `R2` à `R9`
  restent en vigueur.
- **Canvas 2D n'est pas ouvert**, ni WebGL.
- **Aucune tentative WebView2**, conformément à `DEC-0014` F.
- **L'échec de `B0` n'est pas corrigé** et le cache incrémental fautif est
  **conservé**, conformément à `DEC-0013` E.
- **L'inter-volume de `B3` reste NON TESTÉ**, la **question 3 de `B4` reste
  ouverte**.

## Limites et risques

- **Aucune mesure de production.** Ni WebView2, ni `rusqlite`, ni application
  empaquetée. `B2 ter` mesure Edge et Chrome. **Réserve `R8`, en vigueur.**
- **Une seule machine**, nettement au-dessus d'un poste ordinaire, écran
  **240 Hz**, **mode sans affichage**. Les valeurs sont un **plafond
  favorable**.
- **Les temps d'image sont quantifiés** en marches de **4,1667 ms**. Aucun
  écart ne doit être lu plus finement qu'une marche. Les valeurs de **238,10**
  sont **butées**, pas mesurées.
- **`ips régime stable` est une grandeur fragile** — défaut `D1`.
- **Le plancher de lisibilité de 2 400 px² est un choix, pas une mesure.**
- **Aucun lecteur d'écran réel.**
- **La causalité géométrique n'est pas établie** — réserve `V2`.
- Toutes les limites publiées par `TASK-0012` et `TASK-0013` **restent
  entières**.

## Porte humaine

Les portes **P3** et **P3 bis** sont **franchies**. La porte **P4 est ouverte
et non franchie**.

`TASK-0014` a été livrée **`IMPLEMENTED`, jamais auto-déclarée `VERIFIED`**.
L'action unique suivante est **`ACTION-0024`** : un contrôle indépendant, mené
par une instance **distincte de l'exécuteur**.

**Aucune ligne de code de production ne peut être écrite avant P4.** Les trois
branches de spike ne sont ni fusionnées, ni destinées à l'être automatiquement :
les conserver, les fusionner ou les supprimer appartient à Sébastien.
