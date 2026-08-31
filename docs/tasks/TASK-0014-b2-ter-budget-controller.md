# TASK-0014 — B2 ter : correction minimale du contrôleur de budget auto-régulé

- **Identifiant :** `TASK-0014`
- **Titre :** Valider ou réfuter une **correction minimale** du contrôleur de
  budget auto-régulé, sur `CAL-B` comme calepin de référence, avec de
  **vraies** variations du seuil de visibilité et le **coût mesuré** des
  reconstructions DOM qu'elles provoquent
- **Statut :** `IN_PROGRESS`
- **Phase :** 1 ter — après
  [DEC-0014](../decisions/DEC-0014-layout-baseline-and-budget-direction.md) et
  le contrôle indépendant
  [ACTION-0023](../reviews/ACTION-0023-independent-control.md)
- **Proposée le :** 2026-08-31
- **Rédacteur de la fiche :** Claude Code, sous le GO technique de
  l'orchestrateur du 2026-08-31
- **Exécuteur :** Claude Code, session `filetopo-task-0014-budget`
- **Effort estimé :** une session d'expérimentation
- **GO d'exécution :** **ACQUIS le 2026-08-31**, de l'orchestrateur technique,
  sous la délégation inscrite dans [AGENTS.md](../../AGENTS.md). Le GO
  n'autorise **que ce que cette fiche nomme**. **P4 reste non franchie :
  aucun code de production.**
- **Branche dédiée :** `spike/v0.2-budget-controller`, créée le 2026-08-31
  depuis la pointe contrôlée `933bd0d5e7e05e4e7fe233c5fc6b9320a194264d` de
  `spike/v0.2-render-budget`.

> Cette fiche **spécifie**. Elle ne contient **aucun résultat**, et n'en
> contiendra jamais : les résultats vivront dans
> `docs/research/TASK-0014-b2-ter-results.md` et dans `PERF-0005`.
>
> **Les critères de §6 et la configuration de §5.2 sont écrits et commités
> avant toute mesure.** Aucun ne peut être ajusté après coup pour être atteint.

---

## 1. Objectif unique

**Valider ou réfuter une correction minimale du contrôleur auto-régulé**, en
utilisant `CAL-B` comme calepin de référence.

Rien d'autre. Cette tâche ne compare pas de calepins, n'ouvre pas Canvas 2D, ne
mesure aucun moteur nouveau et n'écrit aucun code de production.

## 2. Contexte : les deux causes mesurées de la réfutation de `F4`

`TASK-0013` a réfuté `F4` — « le budget auto-régulé tient la cible » — et
`ACTION-0023` a accepté cette réfutation. `DEC-0014` D en tire que **le
contrôleur écrit n'est pas adopté**, et `DEC-0014` E que **le principe est
conservé**.

Deux causes, mesurées, toutes deux issues de constantes déclarées avant mesure :

1. **La zone morte tolère un régime stable sous la cible.** La marge haute de
   1,15 plaçait le déclenchement de l'agrégation à **38,33 ms**, soit
   **26,1 ips**. Un état à **26,60 ips** était donc considéré comme *stable*
   par un contrôleur qui vise 30 ips.
2. **La descente vers le détail était trop lente.** Le refroidissement imposait
   **trois fenêtres par niveau** lors d'un affinage continu — environ **3,6 s**
   pour revenir au détail maximal, ce qui dépasse mécaniquement les 2 s dès que
   la machine a de la marge.

**La correction doit traiter ces deux causes, et seulement elles.**

### 2.1 Une seconde faiblesse de preuve, à corriger dans le protocole

`B2 bis` a mesuré **`revirtualisations = 0`** sur toutes ses mesures à seuil
imposé : le mode `transform` y était éprouvé dans son cas **le plus
favorable**. Cette tâche doit provoquer de **vraies** revirtualisations et de
**vraies** reconstructions DOM, et en **mesurer le coût**.

## 3. Périmètre

**Dans le périmètre :**

- un spike jetable, isolé, sous `spikes/b2ter-budget-controller/`;
- un **contrôleur corrigé**, écrit dans ce spike, éprouvé sur ses propres
  critères;
- `CAL-B` comme calepin de référence, **repris sans modification** de
  `spikes/b2bis-layout-and-budget/calepins.mjs`;
- des arborescences **entièrement synthétiques**, **graine identique à
  `TASK-0013`**;
- de **vraies** variations du seuil de visibilité, et la **mesure du coût** des
  reconstructions DOM qu'elles provoquent;
- la vérification que l'accessibilité **ne régresse pas** après les changements
  de niveau;
- la **lecture minimale, ciblée et non récursive** des métadonnées d'outillage
  nécessaires à l'exécution : **présence, chemin et version** des exécutables
  Edge et Chrome déjà installés. Autorisée explicitement par cette fiche, au
  titre de la section « Lecture minimale de l'environnement technique »
  d'[AGENTS.md](../../AGENTS.md). **Aucun contenu utilisateur, aucun dossier
  personnel, aucune donnée réelle.**

**Hors périmètre, sans exception :**

- **tout code de production** — `src/`, `src-tauri/`, `tests/`, `public/`,
  `scripts/`, `.github/` restent intacts;
- **Canvas 2D et WebGL** : ni prototype, ni mesure, ni comparaison;
- **toute nouvelle tentative d'instrumentation de WebView2** : `DEC-0014` F
  l'interdit avant qu'un véritable hôte Tauri existe;
- toute comparaison de calepins : `CAL-A` n'est joué qu'en **contrôle ponctuel**
  déclaré en §5.4, sur un seul scénario;
- toute modification du spike `b2bis-layout-and-budget/`, de ses mesures, de
  son journal ou de `PERF-0004` — **ce sont des preuves, elles ne se
  réécrivent pas**;
- toute correction de l'échec de `B0`, et toute suppression du cache
  incrémental de `src-tauri/target/`;
- toute donnée réelle, tout fichier de l'utilisateur;
- toute modification de `graph/`, d'un verrou de dépendances, ou d'une fiche
  `DEC` existante;
- toute fusion, PR, release, étiquette;
- toute écriture hors du dépôt public.

## 4. Branche et fichiers autorisés

### 4.1 Créations autorisées

| Chemin | Contenu |
|---|---|
| `spikes/b2ter-budget-controller/` | Contrôleur corrigé, page de mesure, pilote, rejeu, tableaux |
| `docs/performance/PERF-0005-b2ter-budget-controller.md` | Mesures réelles |
| `docs/research/TASK-0014-b2-ter-results.md` | Journal, preuves et verdicts |

### 4.2 Modifications autorisées

La mémoire obligatoire à la fin de l'exécution — `CURRENT_STATE.md`,
`NEXT_ACTION.md`, `HANDOFF.md`, `VALIDATION.md`, `CHANGELOG_AI.md` — plus la
section « rapport d'exécution » de **cette** fiche. Rien d'autre.

### 4.3 Dépendances

**Aucune par défaut.** Les cinq exigences de §6 de `TASK-0012` s'appliquent
telles quelles. Une dépendance qui ne les satisfait pas rend le banc d'essai
**bloqué**, jamais contourné.

## 5. Ce que la tâche doit produire

### 5.1 La correction, et rien de plus

La correction doit traiter les **deux** causes de `F4`, et seulement elles :

1. **Ne plus considérer 26 à 29,9 ips comme stable.** Le seuil « trop lent »
   est porté à **exactement `1000 / 30` ms**. **Aucune marge ne peut permettre
   un régime stable sous 30 ips.**
2. **Ne plus imposer trois fenêtres par niveau lors d'un affinage continu.** Le
   contrôleur peut enchaîner **plusieurs mouvements dans le même sens sans
   refroidissement entre chaque niveau**. Le refroidissement sert **uniquement**
   à empêcher une **inversion de direction** trop rapide.

Les cinq exigences de §5.2 de `TASK-0013` restent obligatoires, inchangées :
il mesure avant de décider, il converge, il est borné en lisibilité, il est
déterministe à conditions égales, il n'écrit rien.

### 5.2 Configuration FIXÉE avant mesure

| Paramètre | Valeur | Rôle |
|---|---|---|
| `cibleIps` | **30** | cible d'images par seconde |
| `fenetre` | **12 images** | observations avant chaque décision |
| `seuilMin` | **60 px²** | plafond de détail |
| `seuilMax` | **2 400 px²** | **plancher de lisibilité**, jamais franchi |
| `ratio` | **1,35** | pas géométrique entre deux niveaux |
| `niveauInitial` | **4** | niveau de départ |
| **seuil lent** | **exactement `1000 / 30` ms** | au-delà, le contrôleur agrège. **Aucune marge permettant un régime stable sous 30 ips** |
| **seuil rapide** | **25 ms** | en deçà, le contrôleur affine |
| **mouvements de même sens** | **sans refroidissement** | plusieurs niveaux d'affilée sont permis |
| **refroidissement après inversion** | **2 fenêtres** | seule fonction du refroidissement |

**Aucun de ces paramètres ne peut être retouché après la première mesure.**
Ils sont écrits dans `spikes/b2ter-budget-controller/budget2.mjs` et commités
avant le lancement de la campagne.

### 5.3 Données

| Forme | Éléments | Graine |
|---|---:|---|
| `SYN-EQUILIBRE` | 20 000 | **20260831** |
| `SYN-DEEP` | 20 000 | **20260831** |
| `SYN-WIDE` | 20 000 | **20260831** |
| `SYN-100K` | 100 000 | **20260831** |

**Graine identique à `TASK-0013`.** Les générateurs sont repris sans
modification de `spikes/fixtures/synthetic-shapes.mjs`. Les données restent
conservées : elles sont **reconstructibles à l'identique** depuis la graine, ce
que le journal doit démontrer.

### 5.4 De vraies variations de seuil, et leur coût

Le banc **doit** provoquer :

1. de **vraies** modifications du seuil de visibilité, décidées par le
   contrôleur, qui **changent le nombre de blocs DOM construits**;
2. de **vraies** revirtualisations, par une trajectoire d'amplitude suffisante
   en déplacement **et** en zoom;
3. la **mesure du coût** de chaque reconstruction — durée, blocs avant et
   après, nœuds DOM avant et après — et ce coût doit être **inclus dans les
   temps d'image observés**, jamais mesuré à part puis retranché.

**Aucune conclusion de cette tâche ne peut reposer sur `revirtualisations = 0`.**

**Contrôle ponctuel `CAL-A`.** Un seul scénario `CAL-A` / `SYN-WIDE` est joué,
pour situer le contrôleur corrigé sur la configuration exacte qui avait réfuté
`F4`. Ce contrôle **ne fonde aucun critère** `G1` à `G9`.

### 5.5 Moteurs

**Edge** est le moteur principal du spike. **Chrome** est le contrôle de
continuité, **si et seulement si** cela reste **sans dépendance nouvelle**.

**Aucune nouvelle tentative WebView2** : `DEC-0014` F l'interdit. La réserve
`R8` d'`ACTION-0021` s'applique intégralement : **aucune mesure de cette tâche
n'est une mesure de production**.

### 5.6 L'accessibilité ne régresse pas

Les contrôles ARIA et clavier de `B2` sont rejoués **tels quels**, **après**
les changements de niveau du budget, sur **tous** les scénarios.

## 6. Critères falsifiables — écrits et commités avant toute mesure

Protocole commun : trajectoire scriptée identique entre exécutions, images par
seconde relevées **par l'horloge de rendu du navigateur** dans la page,
**minimum cinq exécutions par scénario**, **médiane et écart min–max publiés**,
matériel de référence déclaré **avant** la première mesure.

| # | Énoncé falsifiable | Confirmé si | Réfuté si |
|---|---|---|---|
| **G1** | **Cible** | Sur `CAL-B` et **chacune des quatre formes**, après le changement brusque de vue, le **régime stable tient ≥ 30 ips** sur **chacune des 5 exécutions** | une seule exécution, sur une seule forme, tient un régime stable sous 30 ips |
| **G2** | **Convergence** | Le **dernier changement de niveau** intervient **≤ 2 000 ms** après le changement brusque de vue, sur **chacune des 5 exécutions** et **les quatre formes** | un seul dépassement, sur une seule exécution |
| **G3** | **Stabilité** | **Au plus 2 inversions de direction** sur toute fenêtre stable de 10 s, sur **chacune des 5 exécutions** | une fenêtre stable de 10 s porte 3 inversions ou plus |
| **G4** | **Lisibilité** | Le seuil de **2 400 px² n'est jamais dépassé**, même sous une contrainte volontairement inatteignable — **et** la campagne **atteint réellement le plancher au moins une fois** et démontre que le contrôleur **y reste** | le plancher est franchi, **ou** la campagne n'atteint jamais le plancher et ne peut donc rien démontrer |
| **G5** | **Déterminisme** | Rejeu de **toutes** les traces réelles avec le même contrôleur, hors navigateur : **zéro divergence de décision** | une seule divergence |
| **G6** | **Reconstruction réelle** | **Au moins un scénario par forme** provoque une modification réelle du seuil qui **change le nombre de blocs DOM construits**; le coût de cette reconstruction est **mesuré** et **inclus dans les temps d'image** | aucune reconstruction réelle sur une forme, **ou** une conclusion fondée uniquement sur `revirtualisations = 0` |
| **G7** | **Accessibilité** | **Zéro** régression ARIA et clavier sur **tous** les scénarios, **après** les changements de niveau | une seule régression, sur un seul scénario |
| **G8** | **`SYN-100K`** | Avec budget actif, les 100 000 éléments indexés tiennent **≥ 30 ips** et **p95 de sélection ≤ 150 ms** sur **chacune des 5 exécutions** | l'un des deux seuils est manqué sur une seule exécution |
| **G9** | **Intégrité du protocole** | **Aucun** seuil, constante, critère ou paramètre du contrôleur n'est modifié après le premier résultat de performance | une seule modification après la première mesure |

**Aucune cible manquée n'est réécrite. Toute cible manquée est publiée comme
RÉFUTÉE.**

### 6.1 Si un défaut de protocole est découvert après la première mesure

1. **le protocole n'est pas changé;**
2. le défaut est **publié**;
3. le critère concerné est rendu **réfuté** ou **bloqué**, selon son texte;
4. **on ne recommence pas en modifiant la cible.**

### 6.2 Ce que la tâche décide, et ce qu'elle ne décide pas

Cette tâche **n'adopte aucun budget** et **ne franchit aucune porte**. Elle
produit les mesures qui rendront l'arbitrage possible. `DEC-0014` D et E restent
en vigueur jusqu'à une décision ultérieure, prise sur ces preuves.

## 7. Preuves attendues

1. Matériel de référence déclaré **avant** la première mesure.
2. Configuration du contrôleur, commitée **avant** la première mesure, avec le
   SHA du commit qui la porte.
3. Pour chaque scénario : forme, calepin, graine, journal complet des décisions
   du contrôleur, temps de convergence, ips en régime stable, inversions,
   niveau et seuil finaux, blocs et nœuds DOM.
4. **Reconstructions** : nombre, coût en millisecondes, blocs et nœuds DOM
   avant et après, et **revirtualisations réellement observées**.
5. Latences de sélection avec centiles, moteur employé, sur `SYN-100K`.
6. Tableau ARIA et clavier, par scénario, **après** les changements de niveau.
7. Contrôle de déterminisme : nombre de traces rejouées, divergences.
8. Verdict explicite `G1` à `G9`, un par ligne, avec la mesure qui le fonde.
9. Section « non testé et limites », écrite **sans atténuation**.

## 8. Conditions d'arrêt immédiat

L'exécution **s'arrête et demande**, sans contourner, si :

1. un essai exigerait une donnée réelle, un fichier ou un dossier de
   l'utilisateur;
2. une action écrirait hors du dépôt public, ou lirait autre chose que les
   métadonnées d'outillage autorisées en §3;
3. une dépendance ne satisfait pas les cinq exigences de §4.3;
4. une opération toucherait le code de production, `graph/`, `main`, un verrou,
   ou les preuves de `TASK-0013`;
5. l'état Git observé diffère de l'état attendu;
6. la portée s'élargit au-delà de cette fiche — **notamment** vers Canvas 2D ou
   vers une nouvelle tentative WebView2.

## 9. Critères d'acceptation de la tâche

| # | Condition |
|---|---|
| 1 | `G1` à `G9` ont chacun un verdict écrit, confirmé ou réfuté, mesure jointe |
| 2 | La configuration de §5.2 est commitée **avant** la première mesure, et **inchangée** après |
| 3 | De **vraies** reconstructions DOM ont eu lieu, leur coût est mesuré et inclus dans les temps d'image |
| 4 | Le plancher de lisibilité a été **réellement atteint** au moins une fois, et le contrôleur y est resté |
| 5 | Aucune régression d'accessibilité |
| 6 | Aucun fichier de production, de test, de dépendance, de `graph/` ni de preuve de `TASK-0013` n'a changé |
| 7 | Les cibles manquées sont publiées comme manquées |
| 8 | La mémoire obligatoire est à jour et `NEXT_ACTION.md` contient **exactement une** action |

## 10. État final attendu

**`TASK-0014` se terminera `IMPLEMENTED`, jamais `VERIFIED`.** L'exécuteur ne
juge pas ses propres preuves. `VERIFIED` appartient à un contrôle indépendant,
conformément à [AGENTS.md](../../AGENTS.md).

## 11. Portes

| Porte | Objet | État |
|---|---|---|
| P3 | Bancs d'essai de `TASK-0012` | **Franchie le 2026-08-31** |
| P3 bis | Banc d'essai `B2 bis` de `TASK-0013` | **Franchie le 2026-08-31** |
| P4 | Autoriser la première tâche d'implémentation | **Ouverte, non franchie. Aucune ligne de code de production** |
| P5 | GO de Sébastien pour publication externe exceptionnelle, dépense, donnée réelle, opération destructive ou hors dépôt | Permanente |

## 12. Historique de l'état

- 2026-08-31 — `PROPOSED` : fiche rédigée à la clôture d'`ACTION-0023`, sous le
  GO technique de l'orchestrateur. **Aucune exécution, aucune mesure.**
- 2026-08-31 — `APPROVED` : GO d'exécution donné par l'orchestrateur technique
  dans le périmètre exact de cette fiche. Critères `G1` à `G9` et configuration
  de §5.2 figés.
- 2026-08-31 — `IN_PROGRESS` : branche dédiée `spike/v0.2-budget-controller`
  créée depuis `933bd0d`; arbre Git propre vérifié; aucune autre tâche
  `IN_PROGRESS`. **Aucune mesure n'a encore été prise à cet instant.**

## 13. Rapport d'exécution

*À remplir à l'issue de l'exécution. Vide tant que la campagne n'a pas été
jouée.*
