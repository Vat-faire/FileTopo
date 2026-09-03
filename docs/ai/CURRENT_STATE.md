# État courant

- **Dernière mise à jour :** 2026-09-02
- **Dernière tâche vérifiée :** **`TASK-0020`, `VERIFIED` le 2026-09-02** —
  **relations inter-cerveaux explicites**,
  [fiche](../tasks/TASK-0020-interbrain-relations.md), sous
  [`DEC-0018`](../decisions/DEC-0018-explicit-interbrain-relations.md),
  fonction **`F-041`**. Contrôle indépendant
  [`ACTION-0032`](../reviews/ACTION-0032-independent-control.md), **`CLOSED`**,
  `HEAD` contrôlé **`9a7206a1e246258259096b1679f19ac5b53005d7`**. **Gel
  `M1`–`M12` en `7746fd4`, avant toute ligne de code**, accepté; `M1`–`M12`
  **acceptés**; `M12` aux **vingt-huit étapes** dans le vrai `WebView2`, deux
  passes, redémarrage réel. Le verdict a été **rendu par l'orchestrateur** et
  **enregistré** par l'exécuteur; **l'exécuteur ne s'est rien attribué**. C'est
  la **sixième** tâche `VERIFIED` de l'étape A
- **Ce que ce `VERIFIED` n'emporte pas :** **`cek1` est accepté uniquement
  comme repli déclaré, PAS comme `I-E` complète.** Aucune campagne `H9`, aucun
  seuil — `R8` **entière**. Aucune détection automatique entre cerveaux.
  **`P-19`** et **`P-21`** demeurent. **`B0`** n'est pas corrigé
- **Tâche livrée, NON vérifiée :** aucune
- **Matrice fonctionnelle :** **41** lignes après l'ajout de `F-041` par
  `DEC-0018`. Répartition : **`MVP` 37, `ULTÉRIEUR` 0, `DIFFÉRÉ` 4**. Aucune
  ligne existante n'a changé de classification, aucune n'est descendue
- **Branche active :** **`build/v0.2-a5-interbrain-relations`**, créée depuis
  le tip **contrôlé** `8d1e27151f53d082551e05b00816100cb790542b` de
  `build/v0.2-a4-composed-view`
- **`build/v0.2-a4-composed-view` :** `8d1e271`, **non touchée** depuis la
  vérification — la branche contrôlée et le `SHA` contrôlé désignent le même
  arbre, et rien n'y a été ajouté après le verdict
- **`build/v0.2-a3-multibrain-foundation` :** `9e77a6d`, **non touchée** depuis
  la vérification — la branche contrôlée et le `SHA` contrôlé désignent le même
  arbre, et rien n'y a été ajouté après le verdict
- **`build/v0.2-a2-relations` :** `50de16b`, **non touchée** depuis la
  vérification
- **`build/v0.2-p4-vertical-slice` :** `33704a1`, **non touchée**
- **`spike/v0.2-budget-controller` :** porte la clôture d'`ACTION-0025`
- **`spike/v0.2-render-budget` :** `933bd0d…`, **non touchée**
- **`spike/v0.2-technical-risk-gates` :** `746f1b5…`, **non touchée**
- **`rebuild/v0.2-project-brain` :** `db8d3de0…`, **non touchée**
- **`main` :** inchangée, `91bbe90f0f99026c28cd345784d4f579a0016db2`, **non
  touchée**
- **Tâche vérifiée précédente :** **`TASK-0019`, `VERIFIED` le 2026-09-02**, sur
  **re-contrôle indépendant**
  [`ACTION-0031`](../reviews/ACTION-0031-independent-recontrol.md) —
  **`X6` : `CLOSED`**, **`ACTION-0030` : `CLOSED`**, `HEAD` contrôlé
  **`8d1e27151f53d082551e05b00816100cb790542b`**. Le verdict a été **rendu par
  l'orchestrateur** et **enregistré** par l'exécuteur; **l'exécuteur ne s'est
  rien attribué**. C'est la **cinquième** tâche `VERIFIED` de l'étape A
- **Tâches vérifiées précédemment :** `TASK-0018`, `VERIFIED` le 2026-09-01
  ([`ACTION-0029`](../reviews/ACTION-0029-independent-recontrol.md),
  **`X5` : `CLOSED`**); `TASK-0017`, `VERIFIED` le 2026-09-01
  ([`ACTION-0027`](../reviews/ACTION-0027-independent-control.md), **`X3`** et
  **`X4` : `CLOSED`**); `TASK-0016`, `VERIFIED` le 2026-08-31
  ([`ACTION-0026`](../reviews/ACTION-0026-independent-control.md), réserve
  **`X2` : `CLOSED`**); `TASK-0015`, `VERIFIED`
  ([`ACTION-0025`](../reviews/ACTION-0025-independent-control.md)), avec la
  réserve normative `X1`, corrigée
- **Règle instaurée le 2026-09-01 :** **une exécution d'une tâche ultérieure ne
  remplace jamais la preuve canonique d'une tâche antérieure `VERIFIED`.** Elle
  est tenue **à la porte d'écriture** — `write_run_artifact` refuse les noms
  protégés — et non par convention. Les scénarios migrés écrivent sous un nom
  `TASK-0018` de **régression**, et le `J12` de régression **a été rejoué**
  dans le vrai WebView2, sans toucher à la preuve de `TASK-0017`.
- **La règle s'applique à `TASK-0019` elle-même depuis sa vérification :** ses
  **six** preuves — `TASK-0019-J12-relations-regression-webview2.json`,
  `TASK-0019-K11-readonly-regression-webview2.json`,
  `TASK-0019-K12-foundation-regression-webview2-pass{1,2}.json` et
  `TASK-0019-L12-composed-view-webview2-pass{1,2}.json` — rejoignent la liste
  protégée, qui passe de **8** à **14** noms. **Quatre d'entre elles sont
  elles-mêmes des rejeux de régression** : être un rejeu ne rend pas une preuve
  moins canonique une fois la tâche qui l'a publiée contrôlée. La liste vit
  désormais à **trois** endroits et **une seule fois à chacun** — la porte Rust
  `write_run_artifact`, `src/map/runArtifacts.ts`, et
  `scripts/protected-run-artifacts.ps1`, dot-sourcé par les scripts de rejeu au
  lieu d'être recopié dans chacun.
- **La règle s'appliquait déjà à `TASK-0018` :** ses
  quatre preuves — `TASK-0018-K11-readonly-and-isolation.json`,
  `TASK-0018-K12-webview2-pass1.json`, `TASK-0018-K12-webview2-pass2.json`,
  `TASK-0018-J12-relations-regression-webview2.json` — sont **protégées à la
  porte d'écriture**, et **le runtime de `TASK-0019` n'écrit plus aucun
  résultat sous un nom `TASK-0018`**.
- **Contrôle indépendant de `TASK-0019` :**
  [`ACTION-0030`](../reviews/ACTION-0030-independent-control.md),
  `CHANGES_REQUIRED` le 2026-09-02 sur `21acd64` — **`CLOSED`** le 2026-09-02.
  Le fond avait été **accepté** dès le premier contrôle; la seule réserve `X6`
  disait que `L12` étape 7 exigeait l'**acte** — approuver `S-005` dans Alpha —
  et qu'il n'avait pas eu lieu. La correction a ajouté un **espace de noms**
  sans rien supprimer, `L12` a été rejoué **en entier**, et
  [`ACTION-0031`](../reviews/ACTION-0031-independent-recontrol.md) a clos `X6`
- **Contrôle indépendant de `TASK-0020` :**
  [`ACTION-0032`](../reviews/ACTION-0032-independent-control.md), **`CLOSED`**
  le 2026-09-02 sur `9a7206a` — verdict **`APPROVED`**, `TASK-0020`
  **`VERIFIED`**. Acceptés : le gel `7746fd4` antérieur au premier code
  `d1adcf2`, `M1`–`M12`, les relations inter-cerveaux explicites, le magasin
  commun `brains/interbrain/relations.sqlite`, l'approbation `XB-S01` et les
  contraintes `SQLite`, la navigation affichée et hors vue, le rebuild des
  trois index à digest inchangé et **0** extrémité non résolue, `M12` en deux
  passes dans le vrai `WebView2`, les régressions `J12` intra et `L12`
  composée, et `main` intacte à `91bbe90f`
- **Réserves `X2`, `X3`, `X4`, `X5`, `X6` :** **maintenues et closes**;
  `X5` étendue une seconde fois, à **quatorze** noms protégés
- **`X5` s'applique désormais aux cinq preuves de `TASK-0020`**, la tâche étant
  `VERIFIED` — `M12` `pass{1,2}`, `J12` intra, `L12` composée `pass{1,2}`.
  **L'extension des gardes n'a PAS été exécutée dans la clôture
  `ACTION-0032`**, qui est documentaire : la **tâche de réalignement à venir
  devra commencer par protéger ces preuves** avant toute autre écriture de
  preuve
- **Tâche IN_PROGRESS :** aucune
- **Réserve ouverte :** aucune. `X2`, `X3`, `X4`, `X5`, `X6` sont **closes**, et
  `TASK-0020` les a toutes revérifiées sur ses propres preuves
- **Porte `P4` :** **FRANCHIE** —
  [`DEC-0016`](../decisions/DEC-0016-p4-gate-crossing-and-first-slice.md)

## Ce qui a changé, en une phrase

**Deux cerveaux peuvent maintenant être reliés sans être fusionnés.** Une
relation `Alpha → Gamma` vit dans un magasin qui n'appartient à **aucun des
deux** — `brains/interbrain/relations.sqlite` —, porte une provenance qui ne
s'invente pas, survit à une reconstruction complète des trois index sans qu'une
extrémité casse, et se dessine comme une arête qui **traverse réellement** les
territoires. Elle existe même quand l'autre cerveau n'est pas à l'écran : le
panneau le dit en toutes lettres — « hors de la vue » — et suivre la relation
**amène** ce cerveau dans la vue sans rien créer, modifier ni approuver.

**Ce qui n'a pas bougé compte autant.** Aucune détection automatique, aucune
heuristique : les six relations viennent de règles **nommées et versionnées**
appliquées à un jeu **figé**. Aucune inverse n'est jamais inventée. Une
suggestion n'entre dans aucun compte avant d'être approuvée. Et les relations
**intra**-cerveau de `TASK-0017` sont restées exactement où elles étaient, dans
leur magasin, comptées par leur propre panneau.

**Ce que `TASK-0019` a établi tient, et est désormais `VERIFIED` :**
**FileTopo affiche plusieurs cerveaux dans UN SEUL graphique, sans
les mélanger.** Un canevas `SVG`, un territoire par cerveau, chacun gardant son
index, ses relations et son état. `C2` montre 12 + 12 nœuds venus de **deux**
fichiers `SQLite` distincts; `C3` en montre 181 en trois territoires; **aucune**
arête ne traverse une frontière de cerveau, et deux cerveaux qui lisent la même
source portent des `id` DOM **distincts** pour le même `node_id`. Composer est
un acte d'**affichage** : ajouter ou retirer ne touche ni catalogue, ni index,
ni relation, ni source.

**Et ce que la tranche précédente avait établi tient :**
**FileTopo n'a plus une seule carte : il a des cerveaux, et ils existent.** La
direction produit avait tranché; la fondation est maintenant écrite. Deux
cerveaux qui lisent **la même source** ont une identité, un index, des
relations et un état **entièrement séparés** — et c'est le **stockage** qui
l'impose, pas une convention d'appel.

**Et ce qui avait changé à la tranche précédente tient :** FileTopo sait dire
d'où vient une relation, avec un modèle de **provenance** bâti de telle sorte
qu'une **relation établie sans provenance n'est pas représentable** — désormais
**`VERIFIED`**.

## TASK-0019 — la quatrième tranche verticale

Le **gel** de `TASK-0019` §4 — modèle `ComposedView` et ses sept règles, les
**trois compositions** `C1`/`C2`/`C3`, les formules de territoire, l'identité
DOM namespacée, la mémoire par composition, et les **critères `L1` à `L12`** —
a été commité en `bcbc4aa`, **avant la première ligne de code** de la tranche.
**Aucun critère n'a été retouché après le premier résultat.**

### Les douze critères gelés

| Critère | Verdict |
|---|---|
| `L1` composition valide, cinq erreurs nommées | **TENU** |
| `L2` données non fusionnées, index distincts | **TENU** |
| `L3` collision `node_id`, `id` DOM distincts | **TENU** |
| `L4` territoires nommés, sans couleur seule | **TENU** |
| `L5` géométrie, translation seule | **TENU** |
| `L6` ajout / retrait, dernier refusé | **TENU** |
| `L7` focus, détails, cerveau actif | **TENU** |
| `L8` relations isolées, 0 arête inter-cerveaux | **TENU** |
| `L9` mémoire par composition, `C2 → C3 → C2` | **TENU** |
| `L10` clavier, **vraie frappe** | **TENU**, 0 clic programmatique |
| `L11` lecture seule, preuves protégées intactes | **TENU** |
| `L12` hôte réel, dix-sept étapes | **TENU, 17/17** après `X6`, WebView2 `152.0.4191.53` |

### La cible d'abord manquée, puis tenue — réserve `X6`

**Au premier résultat :** `L12` étape 7, moitié « approuver `S-005` dans
Alpha », **NON REJOUÉE**. Le bac à sable est **persistant** et `S-005` y était
déjà approuvée par une exécution antérieure du rejeu `K12`; le magasin refuse
une seconde approbation, ce qui est **`X3` qui fonctionne**. L'échec a été
publié tel quel, `approvalReplayable: false` et sa raison.

**Le contrôle indépendant a refusé cette moitié** — `ACTION-0030`,
`CHANGES_REQUIRED`, réserve `X6` : « Gamma inchangé » était prouvé, mais
l'**ACTE** que le critère nomme n'avait pas eu lieu.

**Corrigé sans rien supprimer.** Effacer le bac à sable serait une
**suppression**, donc un point d'arrêt réservé à Sébastien. Le bac existant est
resté **intact** — empreinte identique avant et après. Ce qui a été ajouté est
un **namespace neuf, confiné sous le même répertoire** :
`<dépôt>/.filetopo-sandbox/variants/<variant>`, demandé par la variable de
développement `FILETOPO_SANDBOX_VARIANT`. **Variable absente : comportement
exactement inchangé.** La valeur est un **nom**, jamais un chemin — basename
ASCII `[A-Za-z0-9_-]`, 1 à 64 caractères, et tout le reste est une **erreur
explicite**, jamais un repli silencieux. **Aucun sélecteur de dossier, aucune
racine choisie par l'utilisateur.**

**Le rejeu, dans le vrai WebView2 `152.0.4191.53` :** Alpha passe de **4
approuvées / 4 en attente** à **5 / 3**, `S-005` approuvée, variation
**exactement `+1` / `-1`**, pendant que `C2` [Alpha, Gamma] est affichée. Gamma
reste à **4 / 4**, `S-005` toujours en attente, magasin distinct.
`s005WasPending: true`, `approvalReplayable: true`,
`alphaMovedByExactlyOne: true`, `gammaStrictlyUnchanged: true`,
`separateStores: true`.

**`X6` reste `OPEN`** : l'exécuteur ne ferme pas sa propre réserve.

### Composer est un affichage, et le code l'impose

**Un `id` DOM n'est jamais partagé.** Alpha et Gamma lisent la même fixture,
donc `node_id = 4` existe des deux côtés; les éléments s'appellent
`brain-alpha-map-node-4` et `brain-gamma-map-node-4`. `aria-activedescendant`
pointe vers **un** `id` et `getElementById` renvoie **le premier** : un `id`
partagé aurait envoyé le lecteur d'écran et le scénario dans le mauvais cerveau,
en silence.

**Aucune arête ne traverse une frontière**, et c'est lu en comparant les **deux**
extrémités de chaque arête, pas en comptant.

**Composer ne recalcule aucun calepinage** : les rectangles d'Alpha seul et
d'Alpha dans `C2` sont **identiques**, et un pan ou un zoom ne les touche pas.

**L'UX du sélecteur unique est remplacée** — `BrainSelector.tsx` est supprimé.
Les affirmations `K7`, `K8` et `K10` qu'il portait sont **reprises une à une**
contre la barre de composition.

### Défauts trouvés en chemin, corrigés et gardés

1. `scripts/k12-run-real-host.ps1` **supprimait** une preuve devenue canonique
   d'une tâche `VERIFIED`. **La porte d'écriture de l'application ne dit rien
   d'un script qui la contourne** : les deux scripts portent désormais une liste
   protégée et un `Assert-NotProtected`.
2. Le rejeu `J12` déclarait `task: "TASK-0018"` dans un fichier `TASK-0019`; un
   test de garde exige maintenant l'accord du nom et de la charge utile.
3. Trois scénarios lisaient trop tôt après `showOnly`, qui n'est pas `await`é.
4. Un octet `NUL` était **commité** dans `src/map/brainScenario.ts`.

## La direction produit a changé — `DEC-0017`

**FileTopo est une application MULTI-CERVEAUX.** Décision de direction produit
du 2026-09-01, enregistrée par
[`DEC-0017`](../decisions/DEC-0017-multibrain-and-composed-views.md).

**Un cerveau est une unité indépendante :** identité `brain_id` **distincte de
sa source**, index propre, relations propres, état propre, nom, couleur et
icône propres. Le mode normal affiche **un** cerveau actif.

**Une vue composée pourra afficher plusieurs cerveaux dans le même
graphique — sans jamais les fusionner.** Composer n'est qu'un affichage :
ajouter ou retirer un cerveau d'une vue ne modifie aucune de ses données, et
**afficher deux cerveaux ensemble ne crée jamais de relation entre eux**. Une
relation inter-cerveaux ne peut exister qu'**explicitement**, sous le modèle de
provenance de `TASK-0017`. **Supprimer un cerveau ne supprime jamais sa
source.** **La couleur n'est jamais le seul identifiant.**

**Une fonction est ajoutée au modèle produit :** **`F-040` — vue composée
multi-cerveaux**, `MVP`. Répartition : **`MVP` 36, `ULTÉRIEUR` 0, `DIFFÉRÉ` 4,
total 40**. **`P-20` reste une exigence de parité entière**, et le contrat
CarteTopo n'est pas retouché : `F-040` est une **extension produit déclarée**,
pas une modification silencieuse.

**Les invariants `I-1`, `I-2`, `I-3` sont inchangés.**

**Séquence technique décidée :** `TASK-0018` fondation multi-cerveaux et
bascule → `TASK-0019` vue composée → `TASK-0020` relations inter-cerveaux.
**`TASK-0018` n'implémente que la première ligne.**

## TASK-0018 — la troisième tranche verticale

Le **gel** de `TASK-0018` §4 — modèle de cerveau, **trois cerveaux synthétiques
figés**, disposition du stockage, et **critères `K1` à `K12`** — a été commité
**avant la première ligne de code**, comme pour `TASK-0016` et `TASK-0017`.
**Aucun critère n'a été retouché après le premier résultat.**

### Les douze critères gelés sont tenus

| Critère | Verdict |
|---|---|
| `K1` catalogue, trois cerveaux, identité unique | **TENU** |
| `K2` `brain_id` frontière, inconnu = erreur nommée | **TENU** |
| `K3` isolation physique, chemins réels comparés | **TENU** |
| `K4` bascule réelle 12 → 157 → 12 → 12 | **TENU** |
| `K5` collision d'identifiants locaux | **TENU** |
| `K6` relations isolées, scénario §4.5 | **TENU** |
| `K7` métadonnées, propres au cerveau | **TENU** |
| `K8` état de session par cerveau | **TENU** |
| `K9` cerveau actif persistant | **TENU**, redémarrage réel |
| `K10` sélecteur accessible, **vraie frappe** | **TENU**, 0 clic programmatique |
| `K11` lecture seule, `X2` respectée | **TENU** |
| `K12` hôte réel, douze étapes | **TENU**, WebView2 `151.0.4129.107` |

### L'isolation est une affaire de stockage, pas de discipline

**Le `brain_id` est le nom d'un répertoire.** `brains/<brain_id>/map/` et
`brains/<brain_id>/relations/` : `brain-alpha` et `brain-gamma` lisent la
**même** fixture `quasi-empty` et leurs états ne peuvent pas se rencontrer,
parce qu'ils ne sont **pas dans le même fichier** — et non parce qu'une clause
`WHERE` les sépare. Les deux chemins réels sont **publiés** dans la preuve.

**L'index dit pour quel cerveau il a été construit.** Le schéma passe en
**version 2** et `map_meta` porte `brain_id`. `open_store` **refuse** un index
construit pour un autre cerveau, et un index de version 1 — qui ne nomme aucun
cerveau — n'est celui de personne. Le test qui l'établit **copie réellement**
l'index d'Alpha à la place de celui de Gamma.

**Un `node_id` ne voyage jamais seul.** Les commandes de nœud prennent un
**`BrainNodeRef`**. Après une bascule, l'interface tient encore la sélection du
cerveau précédent, et `12` est une ligne valide dans Alpha **comme** dans
Gamma : un numéro nu se résoudrait, silencieusement, dans le mauvais cerveau.

**Les clés d'extrémité sont construites sur le cerveau**, donc deux cerveaux
sur une même source produisent deux espaces de clés **disjoints**.

### Ce qui a été trouvé en chemin, et publié

**Deux défauts du produit, trouvés par les critères eux-mêmes.**

Le **menu du sélecteur se refermait sur un `blur` à `relatedTarget` nul** — ce
qu'une **désactivation de fenêtre** produit exactement. La frappe réelle de
`K10` arrivait donc sur un bouton démonté à l'instant où l'hôte ramenait la
fenêtre au premier plan. **Le critère avait raison, le contrôle avait tort.**

**La vue était ré-ajustée** quand le viewport se stabilisait une image plus
tard, effaçant la vue qu'un cerveau venait de retrouver : `K12` a publié
`alphaRestored=false` **sur un produit dont la sélection revenait
parfaitement**. La règle est désormais écrite **une seule fois**,
`shouldFitOnOpen`, et testée.

**Deux défauts d'outillage, publiés avec ce qu'ils ont produit.** Un binaire
`release` **ne peut pas écrire d'artefact**, si bien que la première tentative
de `K12` a **échoué sans rien publier, pas même son abandon** — le scénario
construit maintenant son évidence dans un objet fourni par l'appelant, et c'est
ainsi que le premier défaut a été diagnostiqué. Et **`Write-Output` dans une
fonction PowerShell entre dans sa valeur de retour**, ce qui a fait **annoncer
un succès** alors que la passe 1 avait abandonné.

## Ce que TASK-0018 ne prouve pas

- **`J12` a été rejoué dans l'hôte — depuis la correction d'`X5`.** Il ne
  l'avait pas été à la livraison, faute de pouvoir écrire sans **écraser**
  `TASK-0017-J12-webview2.json`. C'était la réserve elle-même. Le scénario
  écrit désormais sous
  `TASK-0018-J12-relations-regression-webview2.json`, et une exécution réelle a
  eu lieu sur `brain-alpha`, WebView2 `151.0.4129.107`, **vraie frappe
  Windows** : `isTrusted` à `true`, **0** clic programmatique, approbation
  explicite, `X3` respecté, comptes cohérents. **La preuve de `TASK-0017` est
  inchangée.** Ce que ce rejeu prouve est une **non-régression**, pas une
  réédition de `J12`.
- **Les boucles de vérification et de mesure marchent désormais par cerveau**,
  le runtime n'exposant plus aucune commande indexée par fixture. Elles
  couvrent donc `quasi-empty` (deux fois) et `deep`, **et non** `wide` ni
  `mixed`. **Les artefacts publiés de `TASK-0016` sont inchangés** et restent
  le relevé pour ces deux fixtures.
- **Aucune mesure de performance, aucun seuil.** `R8` reste entière.
- **La persistance complète `P-19` n'est pas revendiquée** : l'état de vue est
  **session seulement**. Seuls le **cerveau actif** et les **métadonnées**
  survivent au redémarrage.
- **La révocation de `P-04` n'est toujours pas implémentée** : `P-04` demeure
  **PARTIELLE**.
- **`ek1` n'est pas `I-E`**, et rien ne prétend qu'il soit globalement unique
  entre cerveaux — l'isolation vient du **stockage**.
- **`B0` s'est reproduit une cinquième fois**, la dernière sur `cargo test`
  pendant la correction d'`X5`. **Rien n'a été supprimé ni renommé** dans
  `src-tauri/target/`; `CARGO_INCREMENTAL=0` suffit à contourner —
  `DEC-0013` E.
- **`P-21` n'est pas satisfaite** : français seulement, aucun audit WCAG
  complet, **aucun lecteur d'écran réel**.

## TASK-0018 — le gel a précédé le code

**`brain-alpha` et `brain-gamma` partagent volontairement la fixture
`quasi-empty`.** C'était le test principal : même source, mêmes chemins
relatifs, mêmes identifiants locaux possibles, et **deux cerveaux totalement
indépendants**. La preuve le confirme sur les **empreintes** : les deux racines
analysées ont la même empreinte `fnv1a64:bddfe1a1…`, et les deux index sont
dans deux fichiers différents.

**Hors périmètre et déclaré tel :** affichage simultané, relations
inter-cerveaux, racine utilisateur, sélecteur de dossier, `P-08`, `P-09`,
watcher, journal, vu/non-vu, `P-19` complète, IA/OCR/RAG/GraphRAG,
**révocation de `P-04`**, `I-E` complète, migration de données utilisateur.

## TASK-0017 — la deuxième tranche verticale

**`P-04`, `P-05`, `P-07`, et la part « relations transversales » de `P-06`.**
Critères `J1` à `J12` **gelés et commités avant la première ligne de code** —
commit `51a8cac`, puis le code en `a98676e`. **Aucun critère n'a été retouché
après le premier résultat.**

### Les douze critères gelés sont tenus

| Critère | Verdict |
|---|---|
| `J1` modèle, provenance à deux valeurs | **TENU** |
| `J2` `X1` — une suggestion n'est pas une relation | **TENU** |
| `J3` règle déterministe nommée et versionnée | **TENU** |
| `J4` approbation explicite | **TENU** |
| `J5` entrantes et sortantes exactes | **TENU**, 12/12 nœuds |
| `J6` panneau des relations | **TENU** |
| `J7` navigation vers l'autre extrémité | **TENU** |
| `J8` accentuation `P-06` | **TENU** |
| `J9` affichage, jamais par la couleur seule | **TENU** |
| `J10` reconstruction de l'index | **TENU** |
| `J11` lecture seule et isolation | **TENU** |
| `J12` dans **WebView2 `151.0.4129.107`** | **TENU** |

### La provenance est la table, pas une colonne

Conformément à `DEC-0009` `R-C`, les relations **dérivées** et **non dérivées**
vivent dans **deux tables séparées**. Le schéma, lu directement dans le SQLite
après exécution, **ne contient nulle part une colonne `provenance`** qu'un
`NULL` pourrait vider, et `relations_approved` **n'a aucune colonne de règle** :
une relation approuvée **ne peut pas** prétendre venir d'une règle
déterministe, faute d'endroit où l'écrire.

**Les cinq tentatives invalides gelées ont toutes été rejetées**, avec
exactement le motif prévu — provenance `suggested`, provenance vide, règle sans
nom, règle sans version, et une suggestion tentant de s'insérer comme
relation — et **aucune n'a laissé la moindre ligne**.

**Aucun inverse n'est jamais déduit** : aucune des deux règles n'est déclarée
symétrique, et l'absence des huit inverses est vérifiée.

### Le contrôle indépendant, et les deux réserves

**`ACTION-0027` a rendu `CHANGES_REQUIRED`.** Le gel `51a8cac` est accepté
comme antérieur au code `a98676e`, et `J1` à `J11` sont acceptables sous
réserve de `X3`.

**`X3` — la création d'une relation `APPROVED` n'était pas verrouillée.**
`insert_established()` acceptait `provenance=APPROVED` dès lors que la
suggestion nommée était déjà approuvée, **sans vérifier que source, cible et
type correspondaient à cette suggestion**. Une suggestion pouvait donc
justifier une relation qui n'était pas elle-même. **La garde contrôlait qu'une
clé existe, pas ce qu'elle désigne** — le même défaut de famille que `X2` :
juger ce que le code *appelle* plutôt que ce que le stockage *permet*.

**Corrigé, et structurellement.** `insert_established` refuse `APPROVED` sans
condition; `approve()` est la seule voie applicative; et le **schéma passe en
version 2** : `suggestion_key` **`UNIQUE`**, **clé étrangère** vers
`relation_suggestions`, et **trois déclencheurs** SQLite qui exigent que la
ligne approuvée **soit exactement sa suggestion**, à l'insertion comme à la
mise à jour, et qui empêchent la suggestion de dériver ensuite. La migration
d'un magasin de version 1 **nomme** la ligne qu'elle écarte, dans
`relation_meta`, plutôt que de l'effacer en silence.

**`X4` — `J12` n'était pas prouvé intégralement.** L'artefact précédent
déclarait lui-même qu'aucune frappe `Enter` de confiance n'avait été jouée.
**Une déclaration d'honnêteté n'est pas une preuve.**

**Corrigé.** Le scénario n'active plus rien : il pose le focus, écrit un
marqueur, et attend une **vraie frappe Windows** envoyée par
`scripts/j12-send-real-key.ps1` via `WScript.Shell`. La preuve enregistre
`activationIsTrusted: true`, `keydownIsTrusted: true`, et **0** appel
programmatique à `click()` comme **0** `dispatchEvent` de type `click` pendant
toute la fenêtre. **Si la frappe n'arrive pas, le scénario échoue** — il ne se
rabat jamais sur un clic synthétique. L'approbation passe par le même chemin.

**Les deux réserves sont corrigées, pas closes.** Leur clôture appartient au
re-contrôle.

### Ce qui a été trouvé en chemin, et publié

**Une lacune du modèle :** le type d'une relation était vérifié non vide mais
**jamais confronté aux deux types déclarés**. Corrigé avant publication.

**Cinq défauts de protocole**, publiés **avec ce qu'ils auraient produit** —
panneau lu trop tôt, attente bornée en images plutôt qu'en temps, atténuation
lue sur le mauvais élément, **deux instances de l'application en parallèle** sur
le même magasin, et une **extrémité attendue calculée depuis l'ordre de
l'index** alors que le panneau groupe par direction puis par type. Ce dernier
a publié un **faux négatif** sur un produit qui avait raison; l'entrée porte
désormais son extrémité en attribut `data-`, et la preuve la lit sur l'entrée
activée. Les artefacts contradictoires ont été **détruits**; la campagne
publiée provient d'une **exécution unique sur le binaire final**.

## Ce que TASK-0017 ne prouve pas

- **`P-04` reste PARTIELLE** : la **révocation** d'une relation approuvée n'est
  pas implémentée, alors que la parité §5.2 l'exige. **Déclarée manquante.**
- **`ek1` n'est pas `I-E`.** C'est le **repli déterministe**;
  `VolumeSerialNumber` + `FileId`, déplacements et renommages réels restent
  entiers.
- **Aucune heuristique réelle de suggestion n'existe.** Les huit suggestions
  sont écrites d'avance dans la fiche.
- **Les relations ne sont ouvertes que pour la fixture gelée `quasi-empty`.**
  Toute autre est refusée **en toutes lettres** : la règle `homonymes` est
  quadratique et produirait des centaines de milliers de paires sur `wide`.
  **C'est une portée, pas une troncature.**
- **Aucune mesure de performance n'a été prise, aucun seuil n'a été inventé.**
  `TASK-0017` n'en demandait aucun, et **`R8` reste entière**.
- **Douze exigences de parité restent entières**, dont `P-08`, `P-09`, `P-19`
  et `P-20`.

## TASK-0016 — la première tranche verticale

**La chaîne complète, en code de production durable :** fixture synthétique →
scan Rust en lecture seule → index SQLite persistant et reconstructible →
calepinage hiérarchique → carte HTML/SVG accessible dans WebView2 →
panoramique, zoom, ajuster, réinitialiser → sélection souris **et** clavier →
détails avec parent et enfants directs.

**Aucun code de spike n'a été repris.** L'application démarre désormais sur
cette tranche; **`src/App.tsx`, l'écran 0.1 alpha, est conservé intact** comme
l'audit technique qu'il est — `DEC-0015` A.

### Les onze critères gelés sont tenus

Gelés et commités **avant la première ligne de code** — commit `6edd5bd`, puis
le code en `130b670`. **Aucun critère n'a été retouché après le premier
résultat.**

| Critère | Verdict |
|---|---|
| `H1` plan = disque = index | **TENU** |
| `H2` aucune dimension nulle, aucun chevauchement | **TENU**, 0 violation |
| `H3` parent et enfants directs = index | **TENU**, 0 écart |
| `H4` souris **et** clavier, 10 000 opérations sans état hors bornes | **TENU** |
| `H5` détails = index, diagnostics **affichés** | **TENU**, 0 écart |
| `H6` empreinte source identique avant/après | **TENU**, 4/4 |
| `H7` index reconstruit équivalent, non reconstructible **énuméré** | **TENU** |
| `H8` rend dans **WebView2 `151.0.4129.107`** | **TENU** |
| `H9` 5 exécutions par fixture, publiées sans sélection | **TENU** — **aucune cible n'était fixée** |
| `H10` calepinage payé une fois, 0 appel en navigation | **TENU**, < 1 % |
| `H11` bornes déclarées d'avance et respectées | **TENU** |

### Fixtures réalisées

| Fixture | Nœuds | Plafond gelé | Profondeur |
|---|---:|---:|---:|
| `QUASI_EMPTY` | 12 | 25 | 3 |
| `DEEP` | 157 | 500 | **40** |
| `WIDE` | 2 207 | 3 000 | 3 |
| `MIXED` | 2 420 | 5 000 | 32 |

**Ces bornes sont des limites de `TASK-0016`, pas des limites produit.**

### La réserve bloquante X2, et sa correction

**Constat du contrôle indépendant.** Le runtime du produit courant
**enregistrait encore** huit commandes héritées de la 0.1 — dont
`choose_collection`, un **sélecteur de dossier réel** — et initialisait
`tauri_plugin_dialog`. **Enregistrer une commande est ce qui la rend
invocable** depuis la WebView, que l'interface propose ou non un bouton : un
sélecteur de dossier réel était donc à **un `invoke` de distance** d'une
tranche qui ne doit pas en avoir. Le défaut était né **par addition**, et le
rapport de clôture avait jugé sur ce que l'interface *appelle* plutôt que sur
ce que le runtime *expose*.

**Corrigé.** L'`invoke_handler` n'enregistre plus que les **neuf commandes
`map_*`**; le plugin de dialogue n'est plus initialisé. **Le code historique
est conservé** — aucune fonction supprimée, `src/App.tsx` et ses douze tests
intacts — et **deux tests-gardes** échouent désormais si une commande hors
tranche est réenregistrée, ce qui a été **éprouvé en réintroduisant
temporairement le défaut**.

### Mesures dans WebView2 — binaire corrigé

| Fixture | Nœuds | Image médiane | Image min–max | Sélection médiane |
|---|---:|---:|---:|---:|
| `quasi-empty` | 12 | 4,20 ms **(butée)** | 2,00 – 8,80 | 8,30 ms |
| `deep` | 157 | 4,20 ms **(butée)** | 2,20 – 8,70 | 8,40 ms |
| `wide` | 2 207 | **17,80 ms** | 4,10 – 32,10 | 38,45 ms |
| `mixed` | 2 420 | **21,35 ms** | 4,60 – 40,30 | 42,95 ms |

**Ces chiffres sont légèrement moins bons que ceux du commit `8cb752b`** —
`wide` 17,80 contre 16,70 ms, `mixed` 21,35 contre 20,20 ms. **Publiés tels
quels**, ils **remplacent** les précédents : ils portent sur le binaire
corrigé. **Aucune explication a posteriori n'est proposée** — l'écart est du
même ordre que la dispersion entre exécutions, et rien dans les mesures ne
permet de trancher.

**`4,20 ms` est butée** par la synchronisation verticale à 4,1667 ms sur cet
écran 240 Hz : la mesure dit que le rendu **tient dans une image**, pas ce
qu'il coûte. **Aucune valeur de 4,20 ms ne peut être citée comme une
performance.**

## Ce que TASK-0016 ne prouve pas

- **`R8` n'est pas levée**, et ne peut pas l'être ici : **une** machine, écran
  **240 Hz**, **binaire de développement non optimisé**, fixtures **≤ 2 420
  nœuds**. Sa levée appartient à l'**étape C**.
- **`P-21` n'est pas satisfaite** : interface **en français seulement**, aucun
  audit WCAG complet, **aucun lecteur d'écran réel**.
- **Seize exigences de parité restent entières**, dont **toutes** les relations
  transversales. Six sont satisfaites **sur ce périmètre**, `P-12` et `P-06`
  sont **partielles** et déclarées telles.
- **Trois défauts de protocole** ont été trouvés en essayant de mesurer —
  fenêtre occultée, carte de 1 × 1 pixel, remise en page pendant la course.
  Chacun aurait produit un chiffre flatteur; tous sont publiés avec ce qu'ils
  auraient produit. **Aucune mesure n'existait avant leur correction.**
- **`B0` s'est reproduit trois fois et n'est pas corrigé.** Rien n'a été
  supprimé, nettoyé ni renommé dans `src-tauri/target/` — `DEC-0013` E.

## Ce qui n'a pas changé

- **Aucun budget n'est adopté**, ni abandonné, ni validé. La borne `B-1` de
  5 000 nœuds est un **plafond déclaré** qui ne s'ajuste à rien. **Aucun
  contrôleur de spike n'est devenu du code de production** — `DEC-0015` F.
- **Aucune réserve n'est levée.** `V1` à `V4`, `W1` à `W4`, `R2` à `R9` restent
  en vigueur; `R1` reste levée depuis `ACTION-0023`.
- **Canvas 2D et WebGL restent fermés.** Le rendu est **HTML/SVG accessible**.
- **Aucune dépendance nouvelle.**
- **Aucune donnée réelle, aucun sélecteur de dossier utilisateur.** Les quatre
  fixtures sont **engendrées** à partir de graines fixes.
- **Aucun chemin local personnel dans le dépôt** : le bac à sable est **nommé**
  — `<dépôt>/.filetopo-sandbox` — et jamais épelé, artefacts compris.
- **L'inter-volume de `B3` reste NON TESTÉ**, la **question 3 de `B4` reste
  ouverte**.
- **`PROJECT_VISION.md` est inchangé.**

## La référence produit, rappel

1. **CarteTopo est la RÉFÉRENCE FONCTIONNELLE.** L'ancienne version publique de
   FileTopo est un **prototype et un audit technique**, jamais la référence
   produit.
2. **L'apparence est entièrement libre** et peut être **entièrement
   modernisée**. **Aucune copie pixel pour pixel n'est demandée.**
3. **Aucune amélioration visuelle ne supprime la parité fonctionnelle.** En cas
   de conflit, **la parité gagne**.
4. **`F-013`, `F-017`, `F-018`, `F-019` restent `MVP`**, et **`F-040` est
   ajoutée** par `DEC-0017`. Répartition : `MVP` **36**, `ULTÉRIEUR` 0,
   `DIFFÉRÉ` 4, sur **40** lignes.
5. **IA, OCR, extraction, RAG et GraphRAG restent `DIFFÉRÉ`.** `DEC-0012`
   inchangée; **aucune exigence de parité ne peut être satisfaite au moyen de
   l'une de ces couches**.

### La correction normative X1

Une **suggestion n'est pas une provenance de relation**. Une **relation
établie** a pour provenance **`déterministe`** ou **`approuvée`**, sans
troisième valeur. Une suggestion est un **objet et un état distincts** —
affichable, mais **jamais** présentée comme relation établie ni comptée dans
les relations entrantes ou sortantes. L'approbation la **transforme** en
relation `approuvée`, seule voie.

**Portée immédiate nulle :** `TASK-0016` ne contient aucune relation
transversale. `X1` contraint la tranche qui implémentera `P-04`, `P-05`, `P-07`.

## Feuille de route courante

| Étape | Objet | État |
|---|---|---|
| **A** | **Parité fonctionnelle MVP** | **EN COURS** — `TASK-0015`, `TASK-0016`, `TASK-0017`, `TASK-0018`, `TASK-0019` et `TASK-0020` **`VERIFIED`**; **aucune tâche `IMPLEMENTED` en attente**, aucune `IN_PROGRESS`; **douze exigences restent entières**, dont `P-20`. **Réalignement produit en cours de formalisation avant tout nouveau code** — voir [NEXT_ACTION.md](NEXT_ACTION.md) |
| **B** | Finition visuelle moderne | PROPOSED — **ne commence pas** avant que **A** soit contrôlée |
| **C** | Validation Windows/WebView2 réelle. **`R8` ne peut être levée qu'ici** | PROPOSED |
| **D** | Empaquetage et publication — **réservé à Sébastien** | PROPOSED |

## Porte humaine

**`TASK-0016` est `VERIFIED`**, sur re-contrôle indépendant mené directement
sur GitHub, commit `a6cf092`. **`X2` et `ACTION-0026` sont `CLOSED`.**

**Ce que `VERIFIED` porte :** la qualité des preuves de la tranche et la
conformité de sa surface exposée. **Pas** la faisabilité du reste du contrat de
parité — **seize exigences ne sont pas commencées**.

**`TASK-0017` est `VERIFIED`**, sur **re-contrôle indépendant** mené par une
instance **distincte de l'exécuteur** et se prononçant **sur preuves** —
`ACTION-0027` §7. **`X3`, `X4` et `ACTION-0027` sont `CLOSED`.**

**Ce que ce `VERIFIED` porte :** la qualité des preuves de la tranche, le
verrouillage **structurel** de la création d'une relation `APPROVED`, et la
réalité de la frappe clavier de `J12`. **Pas** le reste du contrat de parité.

**Ce qu'il ne porte pas :** **la révocation de `P-04` n'est toujours pas
implémentée**. Elle reste **déclarée manquante et hors périmètre**, et
**`P-04` demeure PARTIELLE**. **`TASK-0018` ne l'implémente pas.**

**`TASK-0018`, `TASK-0019` et `TASK-0020` sont `VERIFIED`**, chacune sur
contrôle indépendant mené par une instance **distincte de l'exécuteur** et se
prononçant **sur preuves** — `ACTION-0029`, `ACTION-0031`, `ACTION-0032`.
L'exécuteur ne s'est rien attribué.

**Ce que le `VERIFIED` de `TASK-0020` porte :** la qualité des preuves de la
tranche, le gel antérieur au code, `M1`–`M12`, le magasin commun, la navigation
inter-cerveaux et la survie des extrémités à un rebuild. **Pas** le reste du
contrat de parité, et **pas** `I-E` : **`cek1` n'est accepté que comme repli
déclaré**.

**Aucune tâche n'est `IMPLEMENTED` en attente de contrôle, aucune n'est
`IN_PROGRESS`.** **L'action unique suivante est un réalignement produit
formalisé AVANT tout nouveau code** — voir [NEXT_ACTION.md](NEXT_ACTION.md).
**Aucune nouvelle tâche d'implémentation n'est créée à ce stade.**

**Une tranche suivante exigera sa propre fiche, ses critères gelés d'avance et
son propre GO.**

## Sessions : trois procédures partagées

Depuis le 2026-08-31, l'ouverture, la reprise et la fermeture de session
suivent des procédures écrites, **partagées par Claude Code et Codex** et
rangées dans `.orchestrator/protocols/` : `/debut-session`,
`/reprise-session`, `/fermeture-session` côté Claude; `$debut-session`,
`$reprise-session`, `$fermeture-session` côté Codex.

**`.orchestrator/RESULT.md`** porte le **rapport compact de la dernière
exécution seulement**, commité et poussé. **Les sources durables ne changent
pas** : `CURRENT_STATE.md`, `NEXT_ACTION.md`, `HANDOFF.md`, `VALIDATION.md`,
`CHANGELOG_AI.md`, les fiches et Git.

**`/debut-session` a été réellement exercée le 2026-09-01**, dans une nouvelle
session Claude Code `2.1.252` ouverte après l'installation des skills : skill
découvert et résolu, protocole partagé lu et exécuté, Git vérifié avant toute
lecture, lecture minimale respectée. **La réserve « non testé » du 2026-08-31
est levée pour Claude Code**; elle **reste entière pour Codex**.
