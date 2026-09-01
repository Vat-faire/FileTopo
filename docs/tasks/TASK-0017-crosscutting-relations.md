# TASK-0017 — A-2 : relations transversales avec provenance

- **Identifiant :** `TASK-0017`
- **Titre :** Deuxième tranche de production de l'étape **A** — **relations
  transversales explicites avec provenance**, entrantes et sortantes
  distinguées, panneau des relations, et la part « relations transversales » de
  l'accentuation de sélection
- **Statut :** **`APPROVED`** le 2026-09-01, sous le GO technique de
  l'orchestrateur qui nomme cette fiche
- **Phase :** étape **A** de la feuille de route — parité fonctionnelle MVP,
  **deuxième** tranche
- **Proposée le :** 2026-09-01
- **Rédacteur de la fiche :** Claude Code
- **Exécuteur :** Claude Code
- **GO d'exécution :** **ACQUIS** le 2026-09-01 — GO technique de
  l'orchestrateur, nommant `TASK-0017` et son périmètre
- **Branche :** `build/v0.2-a2-relations`, créée depuis le tip contrôlé
  `33704a1b900f664c3957927d5bd4d3502054f95c` de
  `build/v0.2-p4-vertical-slice`
- **Préalables, vérifiés au départ :** `TASK-0016` **`VERIFIED`**,
  `ACTION-0026` **`CLOSED`**, réserve `X2` **`CLOSED`**, porte `P4`
  **franchie**, **aucune** tâche `IN_PROGRESS`, arbre Git **propre**,
  `HEAD` = `33704a1`

> **§4 fige, avant la première ligne de code**, le modèle normatif, la clé
> d'endpoint, la fixture de relations et les critères `J1` à `J12`.
> **Rien de §4 ne se retouche après le premier résultat. Une cible manquée
> reste manquée.**

## 1. Objectif unique

Rendre **représentable, persistant, affichable et parcourable** un modèle de
relations transversales dans lequel **une relation établie sans provenance
n'existe pas**, et dans lequel **une suggestion n'est jamais une relation**.

Cette tranche est la première du projet à écrire un modèle de **provenance**.
`TASK-0016` n'en contenait aucun : sa portée s'arrêtait à la hiérarchie.

## 2. Périmètre — quatre exigences de parité, et aucune autre

| Exigence | Ce que cette tranche en couvre |
|---|---|
| `P-04` | **Relations transversales explicites avec provenance** — modèle, stockage, rejet des formes invalides, affichage de la provenance |
| `P-05` | **Entrantes et sortantes distinguées** — comptes exacts, distinction perceptible sans recourir à la seule couleur |
| `P-07` | **Panneau des relations** — groupé par direction puis par type, chaque entrée atteignable au clavier et menant à l'autre extrémité |
| `P-06` | **La part « relations transversales » de l'accentuation** — la part hiérarchique est déjà livrée par `TASK-0016` |

### 2.1 Ce que cette tranche n'implémente pas

Interdits par le GO, et **non commencés** :

- `P-08` recherche; `P-09` filtres;
- surveillance de l'arborescence, journal de changements;
- état vu / non vu;
- `P-19` persistance des préférences;
- IA, OCR, extraction, RAG, GraphRAG — `DEC-0012` inchangée;
- **toute heuristique réelle de suggestion**;
- toute donnée utilisateur, tout sélecteur de dossier réel.

**Les suggestions de cette tranche sont exclusivement SYNTHÉTIQUES.** Elles
existent pour prouver le modèle et l'interface, **pas** pour proposer quoi que
ce soit d'utile.

### 2.2 Ce que cette tranche laisse explicitement entier

**La révocation d'une relation approuvée n'est pas implémentée.**
`CARTETOPO_FUNCTIONAL_PARITY.md` §5.2 interdit de rendre une relation
irrévocable; aucun critère `J1` à `J12` ne porte sur la révocation, et le GO ne
la nomme pas. Elle est donc **déclarée manquante** et reportée à une tranche
suivante. `P-04` restera **partielle** à la fin de `TASK-0017` pour cette
raison, et pour elle seule.

## 3. Conditions d'arrêt immédiat

S'arrêter et déclarer `BLOCKED` — sans contourner — devant :

- le besoin d'une **nouvelle dépendance**, quelle qu'elle soit;
- le besoin d'une **donnée réelle** ou d'un **sélecteur de dossier**;
- le besoin de **réactiver une commande héritée de la 0.1**;
- le besoin de modifier un critère `J1` à `J12` après un premier résultat;
- toute **opération destructive ou hors dépôt**.

---

## 4. GEL AVANT EXÉCUTION

**Écrit et commité avant la première ligne de code de production.**

### 4.1 Modèle normatif figé

Conforme à `CARTETOPO_FUNCTIONAL_PARITY.md` §5, à la correction **`X1`** et à
`DEC-0009` **`R-C`**.

**Une relation établie possède obligatoirement, et sans exception :**

| Champ | Obligation |
|---|---|
| `source` | clé d'endpoint non vide |
| `target` | clé d'endpoint non vide |
| `type` | valeur non vide parmi les types déclarés |
| `provenance` | **`DETERMINISTIC`** ou **`APPROVED`**, et **rien d'autre** |

**Il n'existe aucune troisième provenance.** Toute autre valeur — `suggested`,
chaîne vide, valeur inconnue — est **rejetée explicitement**, avec un motif
nommé, jamais convertie ni ignorée.

**Provenance structurelle.** Conformément à `DEC-0009` `R-C`, les relations
**dérivées** et les relations **non dérivées** vivent dans **deux tables
séparées**. La provenance n'est donc pas une colonne que l'on pourrait laisser
nulle : elle est **la table elle-même**. Une relation établie sans provenance
n'est pas seulement interdite, elle est **non représentable**.

**Une relation `DETERMINISTIC` porte obligatoirement `rule_name` et
`rule_version`, tous deux non vides.** Une règle absente ou non versionnée est
rejetée.

**Une relation `APPROVED` ne prétend jamais venir d'une règle déterministe :**
elle ne porte ni `rule_name` ni `rule_version`, et sa table n'en a pas les
colonnes.

**Une suggestion** est un **objet et un état distincts**, dans sa **propre
table**. Elle :

- n'est **jamais** une ligne de relation établie;
- n'entre **jamais** dans les comptes entrants ou sortants;
- ne devient une relation **que** par une **action d'approbation explicite**,
  qui produit une relation `APPROVED` et change l'état de la suggestion.

**Aucune relation inverse n'est jamais déduite.** `A → B` n'implique pas
`B → A`. Une règle peut se déclarer symétrique; **aucune règle de cette
tranche ne l'est**, et l'absence d'inverse est vérifiée.

### 4.2 Types de relation figés

Exactement deux, pour cette tranche :

| Valeur machine | Libellé FR | Sens |
|---|---|---|
| `reference` | « référence » | la source renvoie à la cible |
| `revision` | « révision de » | la source précède la cible dans une suite |

### 4.3 Clé d'endpoint figée — repli déterministe, et rien de plus

**Schéma `ek1`**, versionné dans la valeur elle-même :

    ek1|<fixture_id>|<relative_path>

- `<fixture_id>` est le **cerveau** de cette tranche : la fixture synthétique.
- `<relative_path>` est le chemin relatif à la racine analysée, séparé par
  `/`, tel que l'index le stocke. La racine a le chemin **vide** : sa clé est
  `ek1|quasi-empty|`.
- La version `ek1` est **stockée** dans le méta du magasin de relations, pour
  qu'un changement de schéma soit une migration explicite et jamais une
  réinterprétation silencieuse.

**Les endpoints persistés ne dépendent donc jamais de l'`id` entier d'une ligne
`map_nodes`**, qui est temporaire et change à chaque reconstruction de l'index.

> **Ce que cette clé n'est pas.** Elle **n'implémente pas** l'identité `I-E` de
> `DEC-0009`. `VolumeSerialNumber` + `FileId`, ainsi que les **déplacements et
> renommages réels**, restent **hors périmètre**. `ek1` est le **repli
> déterministe** que `I-E` prévoit là où l'identité système n'est pas
> mobilisée, et il est déclaré comme tel — pas davantage.

### 4.4 Où vivent les relations — figé

- **Jamais** dans l'arborescence analysée. Invariant `I-2`, inchangé.
- **Jamais** mélangées à l'index reconstructible de `TASK-0016`, que
  `map_open(rebuild: true)` supprime et reconstruit.
- Dans un magasin **distinct**, du SQLite déjà présent, **sans nouvelle
  dépendance** :

      <bac à sable>/relations/<fixture_id>/relations.sqlite

- Trois ensembles **explicitement séparés** : relations **déterministes**,
  relations **approuvées**, **suggestions**.
- **Une reconstruction complète de l'index de carte n'efface ni les relations
  approuvées ni les suggestions.** Les relations déterministes, elles, sont
  **rejouables** depuis les règles et l'index, sans divergence.

### 4.5 Règles déterministes figées

Deux règles, appliquées à l'index de la fixture, **documentées et versionnées**.

| Règle | Version | Type produit | Énoncé |
|---|---|---|---|
| `homonymes` | `v1` | `reference` | Deux **fichiers** de **répertoires différents** portant **exactement le même nom** produisent une relation, **dirigée du chemin lexicographiquement plus petit vers le plus grand**. **Non symétrique.** |
| `suites-numerotees` | `v1` | `revision` | Deux **fichiers du même répertoire** dont les noms ne diffèrent **que** par un entier terminal, **consécutif** (`n` puis `n+1`), produisent une relation dirigée **du plus petit entier vers le plus grand**. **Non symétrique.** |

**Aucune de ces deux règles n'est déclarée symétrique**, donc **aucune relation
inverse n'est produite**.

### 4.6 Fixture de relations synthétique — figée

**Cerveau : `quasi-empty`**, la fixture de 12 nœuds de `TASK-0016`, dont
l'arborescence est déterministe et déjà gelée. Les noms courts ci-dessous sont
des abréviations de lecture; la valeur persistée est toujours la clé `ek1`.

| Abrév. | Chemin relatif |
|---|---|
| `A` | `dossier-a` |
| `A1` | `dossier-a/note-1.txt` |
| `A2` | `dossier-a/note-2.txt` |
| `A3` | `dossier-a/note-3.txt` |
| `B` | `dossier-b` |
| `B1` | `dossier-b/note-1.txt` |
| `BS` | `dossier-b/sous-dossier` |
| `BS1` | `dossier-b/sous-dossier/note-1.txt` |
| `BS2` | `dossier-b/sous-dossier/note-2.txt` |
| `R1` | `racine-1.txt` |
| `R2` | `racine-2.txt` |

#### 4.6.1 Les huit relations DETERMINISTIC — produites par les règles

| # | Source | Cible | Type | Règle | Version |
|---|---|---|---|---|---|
| `D1` | `A1` | `B1` | `reference` | `homonymes` | `v1` |
| `D2` | `A1` | `BS1` | `reference` | `homonymes` | `v1` |
| `D3` | `B1` | `BS1` | `reference` | `homonymes` | `v1` |
| `D4` | `A2` | `BS2` | `reference` | `homonymes` | `v1` |
| `D5` | `A1` | `A2` | `revision` | `suites-numerotees` | `v1` |
| `D6` | `A2` | `A3` | `revision` | `suites-numerotees` | `v1` |
| `D7` | `BS1` | `BS2` | `revision` | `suites-numerotees` | `v1` |
| `D8` | `R1` | `R2` | `revision` | `suites-numerotees` | `v1` |

#### 4.6.2 Les huit suggestions synthétiques — quatre approuvées d'avance, quatre en attente

**Aucune ligne `APPROVED` n'est jamais écrite autrement que par le chemin
d'approbation.** Les quatre premières sont semées **en attente** puis
**approuvées par ce même chemin**, ce qui fige l'état de départ sans ouvrir de
porte dérobée.

| Clé | Source | Cible | Type | État figé de départ | Relation `APPROVED` produite |
|---|---|---|---|---|---|
| `S-001` | `B1` | `A3` | `reference` | **approuvée** | `P1` |
| `S-002` | `BS2` | `A1` | `reference` | **approuvée** | `P2` |
| `S-003` | `R2` | `BS1` | `revision` | **approuvée** | `P3` |
| `S-004` | `A3` | `R1` | `reference` | **approuvée** | `P4` |
| `S-005` | `A1` | `R2` | `reference` | **en attente** | aucune |
| `S-006` | `BS1` | `A2` | `revision` | **en attente** | aucune |
| `S-007` | `B1` | `R1` | `reference` | **en attente** | aucune |
| `S-008` | `A3` | `BS2` | `reference` | **en attente** | aucune |

**Total figé : 12 relations établies** — 8 `DETERMINISTIC` + 4 `APPROVED` —
**2 types**, **4 suggestions en attente**.

#### 4.6.3 Comptes attendus, figés

Attendu **indépendant**, écrit ici avant tout code. `J5` compare le stockage à
**cette** table, pas l'inverse.

| Nœud | Sortantes | Entrantes | Suggestions en attente touchant le nœud |
|---|---:|---:|---:|
| racine | 0 | 0 | 0 |
| `A` | 0 | 0 | 0 |
| `A1` | **3** | **1** | 1 (`S-005`) |
| `A2` | **2** | **1** | 1 (`S-006`) |
| `A3` | **1** | **2** | 1 (`S-008`) |
| `B` | 0 | 0 | 0 |
| `B1` | **2** | **1** | 1 (`S-007`) |
| `BS` | 0 | 0 | 0 |
| `BS1` | **1** | **3** | 1 (`S-006`) |
| `BS2` | **1** | **2** | 1 (`S-008`) |
| `R1` | **1** | **1** | 1 (`S-007`) |
| `R2` | **1** | **1** | 1 (`S-005`) |
| **Total** | **12** | **12** | — |

**Absence d'inverse, vérifiée :** aucune des paires `(B1, A1)`, `(BS1, A1)`,
`(BS1, B1)`, `(BS2, A2)`, `(A2, A1)`, `(A3, A2)`, `(BS2, BS1)`, `(R2, R1)`
n'existe comme relation établie.

#### 4.6.4 Les cinq tentatives invalides, figées

Chacune doit être **rejetée avec un motif nommé**, jamais convertie, jamais
ignorée en silence.

| # | Tentative | Motif attendu |
|---|---|---|
| `X-a` | `A1 → B1`, `reference`, provenance `suggested` | `relation_rejected_unknown_provenance` |
| `X-b` | `A2 → A3`, `reference`, **provenance vide** | `relation_rejected_unknown_provenance` |
| `X-c` | `A1 → A3`, `reference`, `DETERMINISTIC`, **`rule_name` vide** | `relation_rejected_missing_rule` |
| `X-d` | `A1 → A3`, `reference`, `DETERMINISTIC`, `rule_name` présent, **`rule_version` vide** | `relation_rejected_missing_rule` |
| `X-e` | insérer **`S-005` telle quelle** comme relation établie | `relation_rejected_suggestion_is_not_a_relation` |

**Aucun nom réel ou personnel** n'apparaît dans cette fixture. Tous les
chemins sont ceux de la fixture synthétique `quasi-empty`, engendrée depuis une
graine fixe.

### 4.7 Critères d'acceptation figés — `J1` à `J12`

**`J1` — MODÈLE.** Il est impossible de persister une relation établie sans
`type`, `source`, `cible` et `provenance`. La provenance n'accepte que
`DETERMINISTIC` ou `APPROVED`. Toute autre valeur est **rejetée
explicitement**, avec motif.

**`J2` — `X1` / SUGGESTION.** Une suggestion est stockée **séparément**. Elle
ne figure dans **aucune** requête ni **aucun** compte de relations établies
avant approbation. La tentative de la faire passer directement pour une
relation est **rejetée**.

**`J3` — RÈGLE DÉTERMINISTE.** Toute relation `DETERMINISTIC` expose
`rule_name` et `rule_version` **non vides**. Une règle absente ou non versionnée
est rejetée. **Deux rejeux du même jeu synthétique produisent exactement le même
ensemble déterministe.**

**`J4` — APPROBATION.** Approuver explicitement une suggestion produit
**exactement une** relation `APPROVED` correspondante **et** change l'état de la
suggestion. Une suggestion non approuvée ne modifie **aucune** relation.
**Aucun passage silencieux.**

**`J5` — DIRECTION.** Pour **chaque** nœud de la fixture, les ensembles et les
comptes **entrants** et **sortants** retournés par le stockage **égalent
exactement** l'attendu indépendant de §4.6.3. **Aucune relation inverse n'est
inventée.**

**`J6` — PANNEAU.** Le panneau des relations de la sélection groupe **au
minimum par direction** et présente pour chaque relation son **type**, sa
**direction** et sa **provenance**. Pour `DETERMINISTIC`, le **nom et la
version de règle sont consultables**. **Chaque entrée est atteignable au
clavier.**

**`J7` — NAVIGATION.** Activer une relation dans le panneau sélectionne
**exactement** son autre extrémité sur la carte. Carte, panneau et sélection
sémantique restent **synchronisés**.

**`J8` — ACCENTUATION `P-06`.** La sélection accentue le **nœud**, son
**parent**, ses **enfants directs** et ses **voisins par relations
transversales établies**. Le reste est **atténué mais reste visible, lisible et
atteignable**. Les états ne reposent **pas sur la couleur seule**. **Les
suggestions ne sont pas accentuées comme des relations établies.**

**`J9` — AFFICHAGE DES RELATIONS.** Les relations établies apparaissent sur la
carte avec une **direction perceptible sans recourir à la seule couleur**. Les
suggestions peuvent être affichées, mais sont **visuellement et sémantiquement
distinctes** des relations établies, **sans recourir à la seule couleur**.
**Aucune suggestion ne peut donner l'impression d'être déjà une relation.**

**`J10` — RECONSTRUCTION.** Après **suppression et reconstruction complète** de
l'index de carte de la fixture : les relations `APPROVED` **persistent**; les
suggestions **persistent avec leur état**; les relations `DETERMINISTIC` sont
**rejouables sans divergence**; les endpoints **se résolvent correctement** vers
les nouveaux nœuds de carte.

**`J11` — LECTURE SEULE ET ISOLATION.** Empreinte de l'arborescence synthétique
**identique avant et après**. **Aucun fichier FileTopo dans la racine
analysée.** **Aucune donnée réelle.** Les **tests-gardes `X2` restent `PASS`**.
**Aucune commande de sélecteur ou d'indexation réelle ne réapparaît** dans
`invoke_handler`.

**`J12` — HÔTE RÉEL.** Dans le **véritable Tauri/WebView2** : charger la
fixture; sélectionner un nœud ayant des relations **entrantes et sortantes**;
vérifier le panneau; parcourir **au clavier** au moins une relation;
sélectionner son extrémité; vérifier l'accentuation; afficher au moins une
**suggestion distincte**; **approuver** une suggestion synthétique; vérifier
**immédiatement** qu'elle devient `APPROVED` et **entre alors, et seulement
alors**, dans les comptes. **La preuve compacte de cette exécution est
publiée.**

### 4.8 Aucune cible de performance

**`TASK-0017` n'ajoute aucune cible de performance et n'invente aucun seuil.**
Aucune mesure n'est obligatoire. Le calepinage **n'est pas recalculé** pour
dessiner des relations — les arêtes se déduisent des rectangles déjà persistés.

### 4.9 Ce que l'exécution n'a pas le droit de faire

- Ajouter **une seule** dépendance. Devant ce besoin : **`BLOCKED`** avant
  installation.
- Réactiver **une seule** commande héritée de la 0.1. Les commandes nouvelles
  portent le préfixe **`map_`**, pour rester sous la protection des
  tests-gardes `X2`.
- Toucher à `src/App.tsx`, l'écran 0.1 alpha conservé — `DEC-0015` A.
- **Corriger `B0`**, ou supprimer, nettoyer ou renommer quoi que ce soit dans
  `src-tauri/target/` — `DEC-0013` E. Si l'ICE incrémental revient : le
  **déclarer**, puis utiliser `CARGO_INCREMENTAL=0`.
- Lever `R8`, conclure sur le budget adaptatif, commencer l'étape **B**.
- Ouvrir Canvas ou WebGL. **HTML/SVG reste le chemin.**
- Copier CarteTopo pixel pour pixel.

### 4.10 État final attendu

`TASK-0017` se termine **`IMPLEMENTED`**, **jamais `VERIFIED`**. **L'exécuteur
ne s'auto-vérifie pas.** L'action suivante est le **contrôle indépendant** de
cette tranche.

---

## 5. Validation due

- **Tous** les tests Rust; **tous** les tests TypeScript.
- Nouveaux tests du **stockage des relations**.
- Tests **négatifs** `J1`, `J2`, `J3`.
- Test **exact des comptes** `J5`, contre l'attendu figé de §4.6.3.
- Tests **clavier**, **panneau**, **navigation**.
- Test de **reconstruction** `J10`.
- **Tests-gardes `X2`.**
- **Build Tauri.**
- **`J12` dans un vrai WebView2**, preuve compacte publiée.

## 6. Historique de l'état

| Date | État | Motif |
|---|---|---|
| 2026-09-01 | `PROPOSED` | Fiche rédigée, tranche choisie par l'orchestrateur technique |
| 2026-09-01 | `APPROVED` | GO technique nommant `TASK-0017` et son périmètre |
| 2026-09-01 | `IN_PROGRESS` | Gel §4 commité **avant** la première ligne de code de production |
