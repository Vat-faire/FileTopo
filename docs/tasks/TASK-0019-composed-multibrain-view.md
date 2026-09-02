# TASK-0019 — A-4 : vue composée multi-cerveaux, plusieurs cerveaux dans UN SEUL graphique

- **Identifiant :** `TASK-0019`
- **Titre :** Quatrième tranche de production de l'étape **A** — **vue composée
  multi-cerveaux** : plusieurs cerveaux affichés **simultanément** dans **un
  seul graphique**, un seul canevas `SVG`, **sans fusionner leurs stockages** et
  **sans créer aucune relation entre eux**
- **Statut :** **`APPROVED`** le 2026-09-01
- **Phase :** étape **A** de la feuille de route — parité fonctionnelle MVP,
  **quatrième** tranche
- **Proposée le :** 2026-09-01
- **Rédacteur de la fiche :** Claude Code
- **Exécuteur :** Claude Code
- **GO d'exécution :** **ACQUIS** le 2026-09-01 — **GO technique** de
  l'orchestrateur, nommant `TASK-0019` et son périmètre écrit. Un GO technique
  n'autorise **que ce qu'il nomme**
- **Décision produit fondatrice :**
  [`DEC-0017`](../decisions/DEC-0017-multibrain-and-composed-views.md),
  fonction **`F-040`**
- **Branche :** `build/v0.2-a4-composed-view`, créée depuis le tip **contrôlé**
  `9e77a6d83fcde194af26da6d356483f592452612` de
  `build/v0.2-a3-multibrain-foundation`
- **Préalables, vérifiés au départ :** `TASK-0018` **`VERIFIED`**,
  `ACTION-0028` **`CLOSED`**, réserve **`X5` `CLOSED`**
  ([`ACTION-0029`](../reviews/ACTION-0029-independent-recontrol.md));
  `TASK-0017` **`VERIFIED`**, `TASK-0016` **`VERIFIED`**, `TASK-0015`
  **`VERIFIED`**; **aucune** tâche `IN_PROGRESS`; arbre Git **propre**;
  `HEAD` = `9e77a6d`; `main` = `91bbe90f0f99026c28cd345784d4f579a0016db2`,
  **non touchée**

> **§4 fige, avant la première ligne de code**, le modèle de vue composée, les
> **trois compositions synthétiques**, la disposition en territoires et les
> critères **`L1` à `L12`**.
>
> **Rien de §4 ne se retouche après le premier résultat. Une cible manquée
> reste manquée, et se publie comme manquée.**

## 1. Pourquoi cette tranche

`TASK-0018` a donné à FileTopo des **cerveaux** : une identité `brain_id`
distincte de la source, un stockage physiquement séparé, un cerveau actif qui
survit au redémarrage. Mais elle n'en affiche **qu'un à la fois**, et c'est la
première ligne de la séquence décidée par `DEC-0017`, pas la dernière.

`F-040` demande davantage : **voir plusieurs cerveaux ensemble**, dans **le même
graphique**, sans que les voir ensemble ne les mélange. C'est la différence
entre un produit qui juxtapose des cartes et un produit qui compose une vue.

**Une vue composée est une COMPOSITION D'AFFICHAGE, pas un nouveau cerveau.**
Elle n'a pas d'identité propre, pas de stockage propre, pas de relations
propres. Elle ne crée rien; elle montre.

## 2. Périmètre

**Dans le périmètre.**

1. Un modèle de **vue composée** : liste ordonnée de cerveaux affichés, cerveau
   **focused**, sélection `BrainNodeRef`, vue globale.
2. Le **chargement séparé** de plusieurs cerveaux, chacun gardant son
   `BrainRecord`, son instantané, sa hiérarchie, ses relations et son intégrité.
3. Un **rendu dans un seul `SVG`**, en **territoires** identifiables.
4. Une **interface de composition** : cerveaux affichés, `+ Ajouter`,
   `× Retirer`, souris **et** clavier.
5. Une **identité DOM namespacée par `brain_id`**.
6. Une **mémoire de session par composition**, **session-only**.
7. Les preuves `L1` à `L12`, dont `L12` dans l'**hôte réel**.

**Hors périmètre — explicitement.**

- **Relations inter-cerveaux** — `TASK-0020`.
- **Vues composées sauvegardées sur disque** — la persistance de vue reste
  `P-19`.
- Vraie racine utilisateur, sélecteur de dossier, suppression de cerveau,
  recherche `P-08`, filtres, `watcher`, journal, vu/non-vu, `P-19` complète,
  révocation de `P-04`, IA/OCR/RAG/GraphRAG, `I-E` complète.
- **Aucune nouvelle dépendance.** Si une s'avérait nécessaire : **`BLOCKED`
  avant toute installation.**
- **`B0` n'est pas corrigé.** Rien n'est supprimé dans `src-tauri/target/`.
- **Aucune campagne `H9`**, aucun seuil de performance. `R8` reste entière.

## 3. Direction produit — ce que FileTopo doit permettre

1. Afficher **un seul** cerveau.
2. Afficher **plusieurs** cerveaux **simultanément**.
3. Dans **UN SEUL graphique**, **UN SEUL canevas `SVG`**.
4. **Sans fusionner leurs stockages.**
5. **Sans créer automatiquement de relation** entre cerveaux.

**Pour `TASK-0019`, la composition est `SESSION-ONLY`.** Au redémarrage :

- le **cerveau actif persiste**, comme `TASK-0018` le garantit;
- la **composition multiple ne persiste pas**;
- l'application redémarre avec **le cerveau actif seul**.

C'est une limite **déclarée**, pas un défaut : les vues sauvegardées viendront
plus tard.

---

# 4. Le gel

**Tout ce qui suit est figé avant la première ligne de code de cette tranche.**

## 4.1 Modèle de vue composée

```
ComposedView
  displayedBrainIds : liste NON VIDE, SANS DOUBLON, de brain_id CONNUS
  focusedBrainId    : DOIT appartenir à displayedBrainIds
  selected          : BrainNodeRef | null
  globalView        : pan/zoom commun au graphique composé
```

**Sept règles, et aucune n'est négociable.**

1. **`displayedBrainIds` est ordonnée par la position du catalogue.** L'ordre
   est **déterministe** et ne dépend ni de l'ordre d'ajout ni d'un hasard de
   rendu.
2. **Une composition vide est interdite.** Un doublon est interdit. Un
   `brain_id` inconnu est interdit. Chacun de ces trois cas produit une
   **erreur nommée**, jamais un repli silencieux :
   `composed_view_empty`, `composed_view_duplicate_brain`,
   `composed_view_unknown_brain`, `composed_view_focus_not_displayed`,
   `composed_view_cannot_remove_last_brain`.
3. **Chaque cerveau chargé conserve séparément** son `BrainRecord`, son
   instantané, sa hiérarchie, ses relations, son intégrité et l'état nécessaire
   à son rendu. **Aucun gros instantané fusionné n'est créé en `SQLite`.**
4. **Un `node_id` n'est jamais global.** Toute sélection reste un
   **`BrainNodeRef` = `brain_id` + `node_id`**, comme `TASK-0018` §4.1 règle 4
   l'a établi.
5. **Le cerveau `focused` est le cerveau « actif » au sens utilisateur.**
   Quand le focus passe à un autre cerveau, **`map_brain_activate` persiste ce
   cerveau**.
6. **Charger un cerveau secondaire ne le rend PAS actif.** Lire ses données
   n'est pas le choisir : le chargement passe par `map_open`, `map_snapshot`,
   `map_integrity` et `map_relations_open`, et **jamais** par
   `map_brain_activate`.
7. **La composition ne modifie aucune source, aucun index, aucun catalogue et
   aucune relation.** Ajouter et retirer sont des actes d'**affichage**.

## 4.2 Les trois compositions synthétiques — figées

| Code | Composition | Cerveaux | Nœuds | Pourquoi |
|---|---|---|---|---|
| **`C1`** | `SINGLE_ALPHA` | `[brain-alpha]` | **12** | Le mode « un cerveau », qui doit rester exactement celui de `TASK-0018` |
| **`C2`** | `TWIN_SAME_SOURCE` | `[brain-alpha, brain-gamma]` | **12 + 12 = 24** | Les deux lisent `quasi-empty`, **volontairement** : mêmes `node_id` locaux, donc collision garantie |
| **`C3`** | `ALL_THREE` | `[brain-alpha, brain-beta, brain-gamma]` | **12 + 157 + 12 = 181** | Trois territoires, deux tailles très différentes |

**Ordre toujours déterministe selon la position du catalogue** —
`brain-alpha` (1), `brain-beta` (2), `brain-gamma` (3). **Aucun doublon. Une
composition vide est interdite.**

`C2` est choisie pour ce qu'elle rend inévitable : Alpha et Gamma lisent la
**même** fixture, donc les mêmes `node_id` existent des deux côtés. Une
composition qui ne collisionne pas ne prouve rien sur les collisions.

## 4.3 Territoires — la disposition, figée

**Un seul `SVG` principal.** Pas trois cartes empilées, pas trois `<svg>`, pas
trois composants indépendants : **un** canevas, dans lequel chaque cerveau
occupe un **territoire**.

**Constantes figées**, en unités de calepinage :

```
TERRITORY_PADDING = 48    marge autour de la boîte propre du cerveau
TERRITORY_HEADER  = 96    bandeau d'identité, au-dessus de la boîte
TERRITORY_GUTTER  = 120   espace entre deux territoires
```

**Disposition, pour `n` territoires ordonnés par position de catalogue**, avec
`w_i` et `h_i` les `layoutWidth` / `layoutHeight` propres au cerveau `i`, et
`H = max(h_i)` :

```
frame_i.x = Σ_{j<i} ( frame_j.w + TERRITORY_GUTTER )
frame_i.y = 0
frame_i.w = w_i + 2 · TERRITORY_PADDING
frame_i.h = TERRITORY_HEADER + H + 2 · TERRITORY_PADDING      (identique pour tous)

offset_i.x = frame_i.x + TERRITORY_PADDING
offset_i.y = frame_i.y + TERRITORY_PADDING + TERRITORY_HEADER

world = { x: 0, y: 0,
          w: Σ frame_j.w + (n−1) · TERRITORY_GUTTER,
          h: frame_0.h }
```

**Chaque territoire affiche au minimum :** le **nom** du cerveau, son **icône**,
un **contour/zone**, et une **identité accessible sans couleur seule**.

**Le calepinage INTERNE de chaque cerveau est préservé :** mêmes rectangles,
mêmes proportions, **aucune reconstruction de l'arbre** pour composer la vue.
La composition applique **uniquement une translation de territoire** au
calepinage interne, puis le **pan/zoom global**.

**Ajouter ou retirer un cerveau peut recalculer les offsets** des territoires.
**Un pan ou un zoom ne recalcule jamais un calepinage interne.**

**Le bouton `Ajuster` cadre toute la composition**, pas un territoire.

## 4.4 Interface de composition

L'UX « un sélecteur unique » de `TASK-0018` est **remplacée**.

```
Cerveaux affichés

[ ▲ Cerveau Alpha  actif  × ]   [ ◆ Cerveau Gamma  × ]   [ + Ajouter ]
```

- Le cerveau **focused/actif** est indiqué **explicitement par un mot** —
  « actif » — et par un état sémantique (`aria-current`), **jamais par la seule
  couleur**.
- **`+ Ajouter`** affiche les cerveaux du catalogue **non déjà présents**;
  utilisable **souris ET clavier**; ajouter un cerveau **ne modifie aucune
  source**; **ajouter deux fois le même cerveau est impossible**.
- **`× Retirer`** retire le cerveau **de la vue** seulement : **ni catalogue,
  ni index, ni relations, ni source** ne sont touchés. **Retirer le dernier
  cerveau affiché est refusé.**
- **Si le cerveau focused est retiré**, le premier cerveau restant **selon
  l'ordre du catalogue** devient focused, **de façon déterministe**, et est
  rendu actif **via le catalogue**.

## 4.5 Identité DOM

Alpha et Gamma peuvent porter les **mêmes** `node_id` locaux. Les identifiants
DOM sont donc **namespacés par `brain_id`** :

```
brain-alpha-map-node-6
brain-gamma-map-node-6
```

**Jamais deux `id` DOM identiques.** `aria-activedescendant`, le focus clavier,
la sélection et les détails respectent le **`BrainNodeRef`**.

**Cliquer ou sélectionner `node_id = 6` dans Alpha ne sélectionne jamais le `6`
de Gamma.**

## 4.6 Relations

**`TASK-0019` ne crée AUCUNE relation inter-cerveaux.** Les relations de
`TASK-0017` restent internes à leur cerveau.

- Les relations internes d'Alpha sont dessinées **dans le territoire Alpha**;
  celles de Gamma **dans Gamma**.
- Bêta peut déclarer ses relations **hors périmètre**, comme avant.
- **Aucune arête ne traverse une frontière de cerveau.**
- Le panneau Relations correspond **uniquement** au `BrainNodeRef` sélectionné.
- **Approuver `S-005` dans Alpha pendant que Gamma est affiché : Alpha change,
  Gamma reste strictement inchangé.**

`TASK-0020` généralisera ensuite les relations inter-cerveaux.

## 4.7 Mémoire de session par composition

Le comportement `TASK-0018` est **conservé pour une composition à un cerveau**.

Une mémoire **`SESSION-ONLY` par composition** est ajoutée. **Clé
déterministe** : la liste ordonnée des `brain_id` affichés —

```
brain-alpha|brain-gamma
```

Sont mémorisés au minimum : le **pan/zoom global**, et le **`BrainNodeRef`
sélectionné s'il est encore valide**.

**Scénario figé :** `C2` → modifier vue et sélection → `C3` → modifier vue et
sélection → revenir à `C2` **⇒ retrouver exactement l'état `C2`**.

**Aucune persistance disque de cette composition dans `TASK-0019`.**

## 4.8 Artefacts de mesure — `X5` étendue

`TASK-0018` est **`VERIFIED`**. Ses preuves entrent donc dans la liste
**protégée** :

- `TASK-0018-K11-readonly-and-isolation.json`
- `TASK-0018-K12-webview2-pass1.json`
- `TASK-0018-K12-webview2-pass2.json`
- `TASK-0018-J12-relations-regression-webview2.json`

**Le runtime de `TASK-0019` n'écrit plus aucun résultat sous un nom
`TASK-0018`.** Les noms sont centralisés dans `src/map/runArtifacts.ts` :

| Ce qui écrit | Nom figé |
|---|---|
| Boucle de mesure, par cerveau composé | `TASK-0019-H9-composed-runtime-regression-webview2.json` |
| Scénario relations, sur `brain-alpha` | `TASK-0019-J12-relations-regression-webview2.json` |
| Vérification lecture seule et isolation | `TASK-0019-K11-readonly-regression-webview2.json` |
| Régression de la fondation, passes 1 et 2 | `TASK-0019-K12-foundation-regression-webview2-pass1.json`, `…-pass2.json` |
| **`L12` — vue composée dans l'hôte réel** | `TASK-0019-L12-composed-view-webview2-pass1.json`, `…-pass2.json` |

plus les variantes `-abandon` correspondantes.

**Aucune preuve historique n'est réécrite.** **`H9` n'est pas exécutée** et
**aucun seuil de performance n'est posé**.

---

## 4.9 Critères gelés `L1` à `L12`

**Aucun `L1`–`L12` ne peut être retouché après le premier résultat.**

### `L1` — COMPOSITION

Composition **non vide**, **sans doublon**, **uniquement des `brain_id`
connus**. `focusedBrainId` appartient **toujours** à la composition. Une entrée
invalide produit une **erreur explicite et nommée**, jamais un repli.

### `L2` — DONNÉES NON FUSIONNÉES

`C2` expose **exactement deux instantanés indépendants de 12 nœuds**. `C3`
expose **12, 157 et 12**. Le total visuel peut être **24** ou **181**, mais
**aucun index `SQLite` fusionné n'est créé** : chaque cerveau garde son
`brains/<brain_id>/map/index.sqlite`, et les chemins réels le montrent.

### `L3` — COLLISION

Alpha et Gamma rendent **au moins un même `node_id` simultanément**. Leurs `id`
DOM sont **distincts**. **Sélectionner l'un ne sélectionne pas l'autre.**

### `L4` — TERRITOIRES

Chaque cerveau possède un **territoire nommé et accessible dans le même `SVG`**.
**Nom + icône** identifient l'origine **sans couleur seule**. **Aucun nœud
n'apparaît dans le mauvais territoire.**

### `L5` — GÉOMÉTRIE

Les rectangles internes d'un cerveau sont **identiques** à ceux du mode seul,
**à une translation de territoire près**. **Pan/zoom global ne provoque aucun
recalepinage interne.**

### `L6` — AJOUT / RETRAIT

Ajouter Gamma à Alpha donne **`C2`**. Ajouter Bêta donne **`C3`**. **Retirer un
cerveau ne touche aucune donnée persistée** du cerveau. **Retirer le dernier
cerveau est refusé.**

### `L7` — FOCUS / DÉTAILS

**Une seule sélection sémantique globale = `BrainNodeRef`.** Cliquer un nœud
d'un autre territoire **change `focusedBrainId` et le cerveau actif**. Détails
et relations proviennent **exactement de ce cerveau**.

### `L8` — RELATIONS ISOLÉES

**Aucune relation inter-cerveaux n'existe ni n'est dessinée.** Toute arête
établie a **ses deux extrémités dans le même `brain_id`**. **Approuver `S-005`
dans Alpha ne modifie pas Gamma.**

### `L9` — SESSION PAR COMPOSITION

`C2` et `C3` peuvent conserver des **pan/zoom et sélections différents**.
`C2 → C3 → C2` **restitue exactement l'état session de `C2`**. Le mode un
cerveau **conserve la régression `TASK-0018`**.

### `L10` — CLAVIER

Dans le **vrai WebView2** :

- `+ Ajouter` **atteignable au clavier**;
- **ajouter Gamma par vraie frappe**;
- **changer le cerveau focused par clavier**;
- **retirer un cerveau par vraie frappe**;
- **impossible de retirer le dernier**.

**`isTrusted` doit être vrai** pour la preuve hôte. **Aucun clic programmatique
de remplacement.**

### `L11` — SÉCURITÉ / HISTORIQUE

- **Empreintes des sources identiques avant/après.**
- **Aucun artefact FileTopo dans les sources.**
- **Aucun sélecteur de dossier.**
- **Surface runtime `map_` seulement.**
- **`X2`, `X3`, `X4`, `X5` restent `PASS`.**
- **Aucune preuve `VERIFIED` antérieure n'est modifiée.**
- **Les nouvelles preuves portent `TASK-0019`.**

### `L12` — HÔTE RÉEL

Dans **Tauri/WebView2 final**, dix-sept étapes, dans cet ordre :

1. préparer déterministement **Alpha actif**;
2. démarrer avec **Alpha SEUL**;
3. **ajouter Gamma par vraie frappe clavier**;
4. confirmer **un seul `SVG`**, **deux territoires**, **12 + 12**;
5. sélectionner **le même `node_id`** dans Alpha puis Gamma et confirmer **deux
   `BrainNodeRef` et deux `id` DOM distincts**;
6. créer un **pan/zoom propre à `C2`**;
7. **approuver `S-005` dans Alpha** et confirmer **Gamma inchangé**;
8. **ajouter Bêta par vraie frappe** → **`C3`**, **12 + 157 + 12 = 181**;
9. confirmer **zéro arête inter-cerveaux**;
10. sélectionner un nœud **Bêta** et confirmer **détails + `focusedBrainId`
    Bêta**;
11. créer un **autre pan/zoom `C3`**;
12. **revenir à `C2`** et confirmer la **restauration exacte** de son état;
13. **retirer Alpha par vraie frappe**, **Gamma devient focused/actif**;
14. **tenter de retirer le dernier Gamma : refus**;
15. **fermer réellement** l'application;
16. **redémarrer réellement**;
17. confirmer **Gamma actif** mais **composition = Gamma SEUL**, puisque la
    composition persistante n'est pas encore implémentée.

**Une preuve `TASK-0019` distincte est publiée.**

---

# 5. Ce que cette tranche ne prouvera pas

Déclaré **avant** l'exécution, pour qu'aucun lecteur n'ait à le déduire :

- **Aucune campagne `H9`**, aucun seuil, aucune mesure de performance. `R8`
  reste entière.
- **La persistance de la composition n'est pas implémentée.** `P-19` demeure.
- **La révocation de `P-04` n'est pas implémentée.** `P-04` demeure
  **PARTIELLE**; `P-21` non satisfaite.
- **Aucune relation inter-cerveaux** — `TASK-0020`.
- **`B0` n'est pas corrigé.**
- **Une seule machine, un seul runtime WebView2.**

# 6. Validation attendue

Tous les tests Rust; tous les tests TypeScript; `pnpm check`; `pnpm build`;
build Tauri `debug --no-bundle`; tests `X2` / `X3` / `X4` / `X5`; compositions
`C1` / `C2` / `C3`; collisions Alpha/Gamma; DOM namespacé; relations isolées;
mémoire `C2` / `C3`; ajout et retrait au clavier; `L11` lecture seule; **`L12`
dans le vrai WebView2**, en deux processus pour le redémarrage.

**`TASK-0019` termine `IMPLEMENTED`, jamais `VERIFIED`.** L'exécuteur ne
s'auto-vérifie pas.

# 7. Résultat

**Écrit après l'exécution. §4 n'a pas été retouchée** — le gel `bcbc4aa`
précède la première ligne de code de cette tranche, et **aucun critère
`L1`–`L12` n'a été modifié après le premier résultat.**

## 7.1 Les douze critères gelés

| Critère | Verdict | Où c'est prouvé |
|---|---|---|
| `L1` composition non vide, sans doublon, cerveaux connus, focus affiché | **TENU** | `composedView.test.ts` — les **cinq** codes d'erreur nommés sont produits, aucun repli silencieux |
| `L2` données non fusionnées | **TENU** | `L12` §4 : `brains/brain-alpha/…/index.sqlite` ≠ `brain-gamma`; `L11` : **trois** chemins d'index distincts |
| `L3` collision `node_id` Alpha/Gamma | **TENU** | `L12` §5 : `node_id` 4 des deux côtés, `brain-alpha-map-node-4` ≠ `brain-gamma-map-node-4`, sélection de l'un = **0** sélectionné dans l'autre, **tous** les `id` DOM uniques |
| `L4` territoires nommés et accessibles dans le même `SVG` | **TENU** | `L12` §4 et §8 : **1** canevas, libellés « territoire Cerveau Alpha, icône ▲, 12 nœuds, actif » |
| `L5` géométrie, translation seule | **TENU** | `L12` §4 `alphaRectanglesUnchanged=true`, §6 `internalLayoutUnchangedByPanZoom=true`; formules §4.3 vérifiées une à une dans `composedView.test.ts` |
| `L6` ajout / retrait | **TENU** | `L12` §3 → `C2`, §8 → `C3`, §12 Bêta retiré et **catalogue, index et 157 nœuds intacts**, §14 dernier retrait **refusé** |
| `L7` focus / détails | **TENU** | `L12` §10 : nœud Bêta → `focusedBrainId` **et** cerveau actif = `brain-beta`, détails `annexe` |
| `L8` relations isolées | **TENU** | `L12` §9 : **32** arêtes dessinées, **0** inter-cerveaux; §7 Gamma **strictement** inchangé, magasins séparés |
| `L9` mémoire par composition | **TENU** | `L12` §12 : `C2 → C3 → C2` restitue **exactement** l'état de `C2`; `brains.test.tsx` conserve `K8` sous la clé d'un seul cerveau |
| `L10` clavier | **TENU** | `L12` §3, §8, §13, §14 : `isTrusted=true`, **0** `click()` programmatique, **0** `dispatchEvent(click)` |
| `L11` sécurité / historique | **TENU** | `TASK-0019-K11-readonly-regression-webview2.json` : empreintes identiques ×3, **0** artefact FileTopo dans les racines; les **huit** preuves protégées inchangées |
| `L12` hôte réel, dix-sept étapes | **TENU, les dix-sept** — étape 7 comprise, **rejouée** après la réserve `X6` | `TASK-0019-L12-composed-view-webview2-pass{1,2}.json`, WebView2 `152.0.4191.53`, deux processus |

## 7.2 La cible d'abord manquée, puis tenue — réserve `X6`

**Premier résultat, publié comme manqué :** `L12` étape 7, moitié « approuver
`S-005` dans Alpha », **NON REJOUÉE**. Le bac à sable
`<dépôt>/.filetopo-sandbox` est **persistant**, et une exécution antérieure du
rejeu `K12` avait déjà approuvé `S-005` dans `brain-alpha`. Le magasin refuse
alors une seconde approbation — `relation_rejected_suggestion_already_decided` —
ce qui est **`X3` qui fonctionne**, pas le produit qui échoue. L'artefact portait
`s005WasPending: false`, `approvalReplayable: false`,
`alphaMovedByExactlyOne: false`.

**Le contrôle indépendant a refusé cet état de fait** — `ACTION-0030`,
`CHANGES_REQUIRED`, réserve **`X6`** : « Gamma inchangé » était prouvé, mais
l'**ACTE** que le critère nomme n'avait pas eu lieu pendant `L12`.

**Ce qui a été corrigé, sans rien supprimer.** Effacer le bac à sable pour
retrouver un `S-005` en attente serait une **suppression**, donc un point
d'arrêt réservé à Sébastien. Le bac existant est donc resté **intact** — son
empreinte est identique avant et après ce rejeu. Ce qui a été ajouté est un
**namespace neuf**, demandé par le scénario de preuve et **confiné sous le même
répertoire** :

    <dépôt>/.filetopo-sandbox/variants/<variant>

Le mécanisme tient en une variable d'environnement de **développement**,
`FILETOPO_SANDBOX_VARIANT`, lue par `map/sandbox.rs` :

- **variable absente : comportement exactement inchangé**,
  `<dépôt>/.filetopo-sandbox`;
- la variable porte un **nom**, jamais un chemin — un seul basename ASCII
  `[A-Za-z0-9_-]`, 1 à 64 caractères;
- un séparateur, un `..`, un chemin absolu, une valeur vide ou trop longue est
  une **erreur explicite** — **jamais** un repli silencieux vers un chemin
  fourni par l'appelant;
- **aucune racine choisie par l'utilisateur, aucun sélecteur de dossier**;
- le libellé publié reste non personnel :
  `<dépôt>/.filetopo-sandbox/variants/task0019-l12-…`.

`scripts/l12-run-real-host.ps1` tire désormais un variant **neuf** à chaque
invocation, le garde **identique** pour les deux passes, et retire la variable
en sortant. **Il ne supprime pas le répertoire du variant** : la preuve
n'exige aucune suppression, et une invocation ultérieure crée simplement un
autre variant.

**Le rejeu complet, dans le vrai `WebView2` `152.0.4191.53` :**

| | Alpha avant | Alpha après | Gamma avant | Gamma après |
|---|---|---|---|---|
| approuvées | **4** | **5** | 4 | 4 |
| en attente | **4** | **3** | 4 | 4 |
| `S-005` | **en attente** | **approuvée** | en attente | **en attente** |

L'artefact `pass1` déclare `s005WasPending: true`, `approvalReplayable: true`,
`approvalError: null`, `alphaMovedByExactlyOne: true` — variation **exactement**
`+1` / `-1` — `gammaStrictlyUnchanged: true`, `gammaS005StillPending: true`,
`separateStores: true`. L'approbation a eu lieu **pendant que `C2`
[`brain-alpha`, `brain-gamma`] était affichée**, entre l'étape 6 et l'étape 8.

**Les deux moitiés de l'étape 7 tiennent donc maintenant :** l'acte, et
l'isolation. `X6` reste **`OPEN`** jusqu'au re-contrôle indépendant —
l'exécuteur ne ferme pas sa propre réserve.

## 7.3 Trouvés en chemin, et publiés

1. **Un défaut de mesure dans le scénario, pas dans le produit.** La première
   exécution de `L12` a publié `restoredExactly=false` à l'étape 12 : la
   sélection était revenue, la vue non. Elle **l'était**, un rendu plus tard —
   un changement de composition atterrit en deux commits, et le scénario lisait
   entre les deux. Corrigé en attendant que la valeur **cesse de changer**,
   jamais qu'elle atteigne une valeur attendue. `waitedMs=33`,
   `restoredExactly=true`.
2. **`scripts/k12-run-real-host.ps1` supprimait une preuve protégée.** Il
   effaçait `TASK-0018-K12-webview2-pass$Pass.json` avant chaque passe — devenu
   preuve canonique d'une tâche `VERIFIED` par `ACTION-0029`. La porte
   d'écriture de l'application ne dit rien d'un script qui l'évite. Les deux
   scripts de passe portent désormais une liste protégée et un `Assert-NotProtected`.
3. **Le rejeu `J12` déclarait `task: "TASK-0018"` dans un fichier `TASK-0019`.**
   Le nom et la charge utile se contredisaient. Corrigé, et **un test de garde**
   exige maintenant que toute source qui écrit un artefact déclare `TASK-0019`.
4. **Trois scénarios lisaient trop tôt après `showOnly`.** Le sélecteur qu'ils
   pilotaient était `await`é; la composition ne l'est pas. `J12` attendait un
   cerveau sur lequel l'amorçage l'avait déjà contredit. Corrigé en attendant
   l'amorçage **avant** de demander.
5. **Un octet `NUL` était commité dans `src/map/brainScenario.ts`**, dans un
   littéral `?? "<NUL>"` de `TASK-0018`. Réparé en `?? ""`.
6. **Le même octet `NUL` était dans CETTE fiche**, dans la phrase ci-dessus qui
   le décrit : il y rendait le fichier **binaire** pour `git diff` et pour
   `grep`, donc illisible en revue — exactement le fichier qu'un contrôle
   indépendant doit lire. Écrit `<NUL>` désormais.

## 7.4 Validations exécutées

`pnpm check` **PASS**; **139/139** tests TypeScript (107 → 139); **107/107**
tests Rust; `pnpm build` **PASS**; build Tauri `debug --no-bundle` **PASS**;
`L12` **deux passes** dans WebView2 `152.0.4191.53` avec fermeture et
redémarrage **réels**; `K12` de régression **deux passes**; `J12` de
régression **une passe**, vraie frappe; `L11` lecture seule **trois cerveaux**.

**Après la correction de `X6` :** **113/113** tests Rust (107 → 113, **six**
nouveaux sur le confinement du variant : variable absente = chemin historique;
variant valide **sous** `variants/`; refus de `..`, `../x`, `..\x`, `a/b`,
`a\b`, `/abs`, `\\share`, `C:\abs`, `C:`, `a.b`, `x/../../y`, `a b`, `é`,
`%TEMP%` et de la chaîne **vide**; borne à **64** caractères exactement;
**aucun variant accepté ne sort du bac à sable**; libellé publié sans chemin
absolu); **139/139** tests TypeScript; `pnpm check`, `pnpm build` et le build
Tauri `debug --no-bundle` **PASS**; **`L12` rejoué en entier**, deux passes,
même variant, deux processus réels. **Aucune dépendance ajoutée.** `K11`, `K12`
et `J12` n'ont **pas** été rejoués : leur code fonctionnel n'a pas changé.

**Le bac à sable existant n'a pas été touché :** l'empreinte de
`.filetopo-sandbox/`, variants exclus, est **identique** avant et après le rejeu
(`17186576c4df5b5d…`). Les **huit** preuves protégées `TASK-0016`/`0017`/`0018`
restent **bit-for-bit** inchangées; seuls les deux artefacts `L12` de
`TASK-0019`, **non encore `VERIFIED`**, ont été remplacés.

**`B0` s'est reproduit** — `rustc` a paniqué sur son cache incrémental au
premier `cargo test`. Contourné par `CARGO_INCREMENTAL=0`, qui **ne supprime
rien**; **rien n'a été effacé ni renommé dans `src-tauri/target/`.**

## 7.5 Ce qui n'a pas été fait, et se déclare tel

- **Aucune campagne `H9`**, aucun seuil, aucune mesure de performance. `R8`
  reste entière.
- **La persistance de la composition n'est pas implémentée** — `L12` §17 le
  confirme : Gamma actif, composition **Gamma seul**. `P-19` demeure.
- **Aucune relation inter-cerveaux** — `TASK-0020`.
- **La révocation de `P-04` n'est pas implémentée**; `P-21` non satisfaite.
- **`B0` n'est pas corrigé.**
- **Une seule machine, un seul runtime WebView2.**
- **`BrainSelector.tsx` a été supprimé** — §4.4 remplace son UX. Les
  affirmations `K7`, `K8` et `K10` qu'il portait sont **reprises une à une**
  dans `brains.test.tsx`, contre la barre de composition.

**`TASK-0019` est livrée `IMPLEMENTED`. L'exécuteur ne s'attribue pas
`VERIFIED`.**

## Historique d'état

| Date | État | Motif |
|---|---|---|
| 2026-09-01 | `PROPOSED` | Fiche créée sous `DEC-0017`, fonction `F-040` |
| 2026-09-01 | `APPROVED` | GO technique de l'orchestrateur, périmètre écrit en §2 et §3 |
| 2026-09-02 | `IMPLEMENTED` | Tranche livrée; `L12` tenu à seize étapes sur dix-sept |
| 2026-09-02 | `IMPLEMENTED` | `ACTION-0030` `CHANGES_REQUIRED`, réserve `X6`; correction exécutée et `L12` rejoué en entier. **`VERIFIED` toujours non attribué** — re-contrôle indépendant attendu |
