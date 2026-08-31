# ACTION-0023 — Contrôle indépendant de TASK-0013, et clôture

- **Date :** 2026-08-31
- **Objet :** contrôle indépendant des preuves publiées par
  [TASK-0013](../tasks/TASK-0013-b2-bis-layout-and-render-budget.md) sur la
  branche `spike/v0.2-render-budget`
- **Contrôleur :** **orchestrateur technique**, instance **distincte** de
  l'exécuteur du banc d'essai `B2 bis`
- **Cadre :** délégation d'orchestration technique de Sébastien du 2026-08-31
  (voir [AGENTS.md](../../AGENTS.md), section « Délégation d'orchestration
  technique »)
- **Rédacteur de la présente fiche :** Claude Code, sous le **GO technique de
  l'orchestrateur** pour cette **étape documentaire uniquement**
- **Résultat :** **contrôle accepté**. `TASK-0013` passe de `IMPLEMENTED` à
  **`VERIFIED`**, **avec quatre réserves `V1` à `V4`**

> **Ce que cette fiche est.** L'enregistrement, dans le dépôt, d'un contrôle
> indépendant et des réserves qui l'accompagnent.
>
> **Ce qu'elle n'est pas.** Elle **ne rejoue aucune mesure**, n'exécute aucun
> banc d'essai et **ne produit aucune preuve nouvelle**. Les preuves restent
> celles de `TASK-0013`, **inchangées** : ni le journal, ni `PERF-0004`, ni le
> code du spike n'ont été retouchés par cette clôture.

## 1. Ce qui a été contrôlé

| Objet | Emplacement |
|---|---|
| Journal, preuves et verdicts `F1` à `F8` | [TASK-0013-b2-bis-results.md](../research/TASK-0013-b2-bis-results.md) |
| Mesures de `B2 bis` | [PERF-0004](../performance/PERF-0004-b2bis-layout-and-budget.md) |
| Banc d'essai, calepins, contrôleur de budget | `spikes/b2bis-layout-and-budget/` |
| Préséance des critères sur les mesures | historique Git, commit `85a4a05` |
| Contrôles d'exécution de l'exécuteur | [VALIDATION.md](../ai/VALIDATION.md) |

## 2. Résultat du contrôle

**Le contrôle indépendant est accepté.** `TASK-0013` remplit les huit critères
d'acceptation de sa §9 : les huit énoncés `F1` à `F8` ont chacun un verdict
écrit avec sa mesure, les deux calepins ont été mesurés sur les mêmes données
et la même trajectoire, `SYN-100K` a été joué, le moteur réellement employé est
déclaré et étiqueté partout, aucune régression d'accessibilité n'est observée,
aucun fichier de production n'a changé, et **les deux cibles manquées sont
publiées comme manquées**.

**`TASK-0013` passe donc à `VERIFIED`.** Cette attribution vient d'une instance
**distincte de l'exécuteur**, conformément à `AGENTS.md` : l'exécuteur ne
s'attribue jamais `VERIFIED`.

Les deux réfutations `F4` et `F8` **ne bloquent pas** `VERIFIED` : §6 de
`TASK-0013` écrit qu'« une réfutation est un résultat valide », et §5.4 prévoit
explicitement le cas où WebView2 ne peut pas être instrumenté. Publier une
cible manquée est le livrable conforme, pas un manquement.

## 3. Les quatre réserves du contrôle

### `V1` — « 3 000 blocs visibles » n'a pas été mesuré tel quel, mais la charge retenue est supérieure

Le critère `F1` était écrit **à 3 000 blocs visibles**. Le verdict principal
cite un scénario **demandé** à 3 000 qui construit **2 856 blocs visibles** —
la recherche dichotomique du seuil d'aire ne tombe pas sur un compte exact.

**Il est interdit d'écrire qu'exactement 3 000 blocs visibles ont été
mesurés.** Toute citation de ce résultat doit porter le nombre réellement
construit.

**Le résultat technique est néanmoins accepté, sur une charge supérieure.**
`CAL-B` tient également largement les deux seuils de `F1` sur le scénario à
**5 012 blocs visibles**, 10 026 nœuds DOM : **59,88 ips** et **20,1 ms** au
95<sup>e</sup> centile de sélection dans Edge
([PERF-0004](../performance/PERF-0004-b2bis-layout-and-budget.md) §, ligne
`CAL-B` / `SYN-WIDE` / 5000). Une charge de 5 012 blocs visibles **dépasse** la
charge de 3 000 que le critère demandait.

**Cette nuance est conservée explicitement** : le critère n'a pas été atteint à
son nombre littéral, il a été dépassé sur une charge plus lourde. Les deux
faits sont vrais et doivent voyager ensemble.

### `V2` — `F2` est confirmée selon son énoncé, mais n'établit pas la causalité géométrique

`F2` demandait que le classement des rapports d'aspect et celui des images par
seconde **coïncident**. Ils coïncident : le verdict est conforme à son énoncé.

**Cela n'établit pas la causalité géométrique.** `CAL-B` gagne sur les deux
grandeurs et sur les trois formes à la fois; aucune expérience de la campagne
n'a pu faire **diverger** les deux classements, donc aucune n'a pu réfuter
l'hypothèse concurrente. L'exécuteur l'écrit déjà dans ses limites; **cette
restriction est confirmée par le contrôle et reste en vigueur**.

Aucune fiche, aucun code et aucune communication ne peut écrire que la
géométrie des rectangles est la **cause** mesurée de l'écart d'images par
seconde.

### `V3` — La correction de protocole 240 → 1 000 ips est acceptée

La phase de contrainte du plancher de lisibilité a été rejouée avec une cible
portée de **240** à **1 000 ips**, parce que 240 ips s'est révélée
**atteignable** en mode sans affichage sur un écran à 240 Hz : le contrôleur
atteignait sa cible, s'arrêtait dans sa zone morte et n'approchait jamais le
plancher. La phase ne prouvait alors rien.

**Le contrôle accepte cette correction.** Elle a **renforcé** le test, en
rendant la cible réellement inatteignable. **Aucun critère `F1` à `F8` n'a
changé, et le plancher de 2 400 px² n'a pas bougé.** Ce n'est donc **pas** un
déplacement de cible : c'est la correction d'une phase qui ne mesurait pas ce
qu'elle prétendait mesurer, déclarée en §2.2 de `PERF-0004` plutôt qu'effacée.

**Ce qui est exigé pour l'avenir :** une contrainte destinée à être
inatteignable doit être **déclarée inatteignable avant la mesure**, avec le
motif, et non découverte atteignable après coup.

### `V4` — La lecture minimale de métadonnées système est acceptée comme déviation procédurale

Pour tenter WebView2 **en premier**, comme §5.4 de `TASK-0013` l'exige,
l'exécuteur a dû localiser, versionner et lancer `msedgewebview2.exe`, puis
Edge et Chrome. Ces lectures portent sur des **chemins d'exécutables installés**
et des **versions de composants** — des métadonnées d'outillage.

`TASK-0013` exigeait cette tentative tout en interdisant, par §3 et §8.2, toute
lecture hors du dépôt. **La fiche se contredisait.** Le contrôle qualifie la
lecture effectuée de **déviation procédurale causée par cette contradiction**,
et l'**accepte**.

Constats du contrôle : **aucune donnée utilisateur n'a été consultée**, aucun
dossier personnel n'a été listé, **aucune écriture n'a eu lieu hors du dépôt** —
tout ce que la campagne a écrit est allé sous `spikes/.work/`, ignoré par Git.

**Conséquence normative.** La contradiction est corrigée à la source :
`AGENTS.md` et `CLAUDE.md` sont clarifiés par cette clôture (§5).

## 4. Sort des réserves d'`ACTION-0021`

| Réserve | Sort | Motif |
|---|---|---|
| `R1` — `SYN-100K` n'a pas été joué | **LEVÉE** | Son objet était l'**absence** de `SYN-100K`. `SYN-100K` a maintenant été **réellement joué** : 100 000 nœuds, graine fixe, `CAL-B`, budget actif, les deux seuils de §3.6 tenus sur cinq exécutions |
| `R8` — mesures non transposables à la production | **EN VIGUEUR** | **Aucune mesure WebView2 de production.** `B2 bis` mesure Edge et Chrome. La campagne **renforce** `R8` : sur 18 couples non butés, Chrome rend 0,50 à 0,71 fois les images par seconde d'Edge sur la même machine et la même page |
| `R2`, `R3`, `R4`, `R5`, `R6`, `R7`, `R9` | **Inchangées** | Hors du périmètre de ce contrôle; aucune n'est levée, aucune n'est atténuée |

**`R1` est la seule réserve levée par cette clôture.** Sa levée porte sur le
**protocole de volumétrie**, et sur rien d'autre : elle ne dit rien de la
transposabilité à la production, qui reste couverte par `R8`.

## 5. Clarification normative d'`AGENTS.md` et `CLAUDE.md`

La contradiction relevée en `V4` est corrigée pour l'avenir. `AGENTS.md` et
`CLAUDE.md` reçoivent, par cette clôture, la règle suivante :

- une tâche `APPROVED` peut autoriser la **lecture minimale, ciblée et non
  récursive** de métadonnées d'environnement et d'outillage **nécessaires à son
  exécution** : version de compilateur, de moteur d'exécution ou de navigateur;
  **présence et chemin** d'un exécutable; métadonnées système **strictement
  techniques**;
- cela **n'autorise jamais** la lecture ni le listage de **contenu
  utilisateur**, de dossiers personnels, de documents, de secrets ou de
  **données réelles**, sous quelque forme que ce soit;
- **aucune écriture hors du dépôt** n'est ajoutée à cette permission;
- **les points d'arrêt réservés à Sébastien restent inchangés.**

## 6. Décisions techniques qui découlent du contrôle

Elles sont enregistrées, avec leurs motifs et leurs preuves, dans
[DEC-0014](../decisions/DEC-0014-layout-baseline-and-budget-direction.md) :

| # | Objet | Ce qui est retenu |
|---|---|---|
| A | Statut de `TASK-0013` | `VERIFIED`, avec les réserves `V1` à `V4` |
| B | Calepin | **`CAL-B`, pavage squarifié, devient la direction baseline** |
| C | Technologie de rendu | **HTML/SVG accessible reste la direction** |
| D | Contrôleur de budget de `TASK-0013` | **Non adopté** : `F4` est réfutée |
| E | Principe du budget auto-régulé | **Conservé** |
| F | WebView2 | **Aucune nouvelle tentative** avant qu'un véritable hôte Tauri existe; Edge et Chrome restent des mesures de **spike**, jamais de production |

## 7. Ce que ce contrôle ne fait pas

- Il **ne rejoue aucune mesure** et ne produit aucune preuve nouvelle.
- Il **ne réécrit rien** des preuves de `TASK-0013` : le journal, `PERF-0004`
  et le code du spike sont conservés tels quels, y compris leurs erreurs
  cosmétiques éventuelles.
- Il **ne franchit pas la porte `P4`.** Aucune ligne de code de production
  n'est autorisée.
- Il **n'ouvre pas** Canvas 2D ni WebGL.
- Il **ne fusionne rien**, ne crée ni PR, ni release, ni étiquette.

## 8. Action suivante

Le contrôle ouvre **`TASK-0014`** : un banc d'essai `B2 ter` ciblé sur la
**correction minimale du contrôleur auto-régulé**, avec `CAL-B` comme calepin
de référence. Sa fiche, ses critères `G1` à `G9`, son matériel et son
contrôleur sont écrits et commités **avant la première mesure**.
