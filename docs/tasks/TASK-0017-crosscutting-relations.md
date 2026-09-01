# TASK-0017 — A-2 : relations transversales avec provenance

- **Identifiant :** `TASK-0017`
- **Titre :** Deuxième tranche de production de l'étape **A** — **relations
  transversales explicites avec provenance**, entrantes et sortantes
  distinguées, panneau des relations, et la part « relations transversales » de
  l'accentuation de sélection
- **Statut :** **`IMPLEMENTED`** le 2026-09-01 — résultat en §7, contrôle
  indépendant et corrections `X3`/`X4` en §9. **Pas `VERIFIED` :** l'exécuteur
  ne s'auto-vérifie pas, et le re-contrôle indépendant reste à faire
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

---

## 7. Résultat — état `IMPLEMENTED`

**Statut : `IMPLEMENTED` le 2026-09-01.** **Pas `VERIFIED` :** l'exécuteur ne
s'auto-vérifie pas. Le contrôle indépendant reste à faire.

**Gel commité avant tout code** — `51a8cac`. **Premier code de production** —
`a98676e`. **Aucun critère `J1` à `J12` n'a été retouché** après le premier
résultat.

### 7.1 Les douze critères gelés

| Critère | Verdict | Preuve |
|---|---|---|
| `J1` modèle, provenance à deux valeurs | **TENU** | tables séparées; `Provenance::parse` rejette `suggested`, vide, inconnu; `X-a` et `X-b` rejetés |
| `J2` `X1` — suggestion ≠ relation | **TENU** | table distincte; 0 suggestion dans un compte établi; `X-e` rejeté |
| `J3` règle déterministe versionnée | **TENU** | 8/8 portent `rule_name` + `rule_version`; `X-c` et `X-d` rejetés; rejeu identique |
| `J4` approbation | **TENU** | +1 relation `APPROVED`, état passé à `approved`, 2ᵉ approbation refusée |
| `J5` direction | **TENU** | 12/12 nœuds conformes à l'attendu gelé; 0 inverse inventé |
| `J6` panneau | **TENU** | 2 sections de direction, type, direction, provenance, règle consultable, entrées `<button>` |
| `J7` navigation | **TENU** | activer une entrée sélectionne l'autre extrémité; carte et panneau synchronisés |
| `J8` accentuation `P-06` | **TENU** | 1 sélectionné, 1 parent, 3 voisins établis, 7 atténués **visibles et nommés** |
| `J9` affichage | **TENU** | 12 têtes de flèche sur 12 relations établies, **0** sur 4 suggestions |
| `J10` reconstruction | **TENU** | après reconstruction des 4 index : 5 approuvées, 3 suggestions, digest identique |
| `J11` lecture seule et isolation | **TENU** | empreintes identiques, 0 artefact dans la racine analysée, gardes `X2` `PASS` |
| `J12` hôte réel | **TENU** | scénario complet dans **WebView2 `151.0.4129.107`** |

### 7.2 Le modèle, tel qu'il est réellement stocké

**La provenance n'est pas une colonne. C'est la table.** Lu directement dans le
fichier SQLite après exécution — `TASK-0017-J11-isolation.json` :

| Table | Colonnes |
|---|---|
| `relations_deterministic` | `id`, `source_key`, `target_key`, `relation_type`, `rule_name`, `rule_version`, `rule_symmetric` |
| `relations_approved` | `id`, `source_key`, `target_key`, `relation_type`, `suggestion_key`, `approved_unix_ms` |
| `relation_suggestions` | `suggestion_key`, `source_key`, `target_key`, `relation_type`, `basis`, `state`, `created_unix_ms`, `decided_unix_ms` |

**Il n'existe nulle part une colonne `provenance`** qu'un `NULL` pourrait vider,
ni une colonne de règle dans la table des relations approuvées : une relation
`APPROVED` **ne peut pas** prétendre venir d'une règle, faute d'endroit où
l'écrire. `relation_meta` porte `schema_version=1`, `endpoint_key_scheme=ek1`,
`seed_version=task-0017-v1`.

### 7.3 Les cinq tentatives invalides, et leurs motifs observés

| # | Motif attendu | Motif observé | Rejetée |
|---|---|---|---|
| `X-a` | `relation_rejected_unknown_provenance` | `relation_rejected_unknown_provenance` | **oui** |
| `X-b` | `relation_rejected_unknown_provenance` | `relation_rejected_unknown_provenance` | **oui** |
| `X-c` | `relation_rejected_missing_rule` | `relation_rejected_missing_rule` | **oui** |
| `X-d` | `relation_rejected_missing_rule` | `relation_rejected_missing_rule` | **oui** |
| `X-e` | `relation_rejected_suggestion_is_not_a_relation` | `relation_rejected_suggestion_is_not_a_relation` | **oui** |

**Aucune tentative n'a laissé la moindre ligne** dans les tables de relations
établies — vérifié après coup, et non déduit du fait que l'appel a échoué.

### 7.4 Ce que `J12` a réellement exécuté dans WebView2

`docs/performance/runs/TASK-0017-J12-webview2.json`, hôte **WebView2
`151.0.4129.107`**, Tauri `2.11.5`, SQLite `3.53.2`.

- **Ouverture :** 12 relations établies — 8 `DETERMINISTIC`, 4 `APPROVED` —,
  4 suggestions en attente, **0 extrémité non résolue**.
- **Nœud bidirectionnel :** `dossier-a/note-1.txt`, **3 sortantes, 1 entrante**.
- **Panneau lu à l'écran :** sections « Sortantes (3) » et « Entrantes (1) »,
  4 entrées, provenances rendues `◆ déterministe` ×3 et `● approuvée` ×1,
  lignes de règle `homonymes version v1` ×2, `suites-numerotees version v1`, et
  pour l'approuvée « Approuvée par une action explicite. Aucune règle
  déterministe. » Total affiché : **« 3 sortante(s) · 1 entrante(s) ·
  1 suggestion(s) non comptée(s) »**.
- **Clavier de la carte, réellement exercé :** un `keydown` `ArrowUp` reçu par
  le gestionnaire du composant fait passer `aria-activedescendant` de
  `map-node-6` à `map-node-2`, puis `ArrowDown` le ramène.
- **Traversée d'une relation :** l'entrée est un `<button>` non désactivé,
  **atteint par le focus**; son activation porte la sélection sur `map-node-9`,
  l'autre extrémité.
- **Accentuation :** 1 sélectionné, 1 parent, **3 voisins par relation
  établie**, 7 atténués. L'atténué garde `role="treeitem"`, un `aria-label` non
  vide, une opacité de remplissage de **0,28** et un contour à **0,45** —
  **visible, lisible, atteignable**. Le lien se distingue en plus par un contour
  de **2,5 px** en **tirets `6 2`** : jamais la couleur seule.
- **Suggestions sur la carte :** 12 relations établies portent **12** têtes de
  flèche; 4 suggestions en portent **0**, avec un trait `5 5` et 8 anneaux
  ouverts.
- **Approbation :** avant, `S-005` **n'est comptée nulle part** —
  `beforeCountedAmongEstablished: false`, 3 sortantes. Après, **4 sortantes**,
  provenance `APPROVED`, **aucun nom de règle**, plus aucune suggestion en
  attente sur ce nœud. `enteredCountsOnlyAfterApproval: true`.
- **Contrôle rejoué dans l'hôte :** 5/5 rejets, rejeu stable
  (`fnv1a64:d794113801460e7f` deux fois), **12/12 nœuds conformes**, 0 inverse
  inventé, 0 suggestion dans les établies, 0 extrémité non résolue.

### 7.5 Trois défauts de protocole, trouvés et corrigés avant la campagne publiée

Comme pour `TASK-0016` §13.4, ils sont publiés **avec ce qu'ils auraient
produit**. **Aucune mesure publiée ne provient d'avant leur correction.**

1. **Le panneau était lu trop tôt.** La première exécution a publié
   « 0 sortante(s) · 0 entrante(s) » : le panneau lit ses relations par une
   commande, donc il accuse un retard sur la sélection. **Le chiffre publié
   aurait été celui de la sélection précédente.** Corrigé par une attente
   **bornée en temps**; l'artefact publie désormais `settled` et le temps
   attendu.
2. **L'attente était bornée en images, pas en temps.** Une image dure 4 ms sur
   cet écran 240 Hz et 16 ms sur un écran 60 Hz : le même budget aurait été une
   attente différente sur chaque machine, et ici il valait **une seconde**, trop
   court pour un aller-retour de commande. Corrigé.
3. **L'atténuation était lue au mauvais endroit.** La première exécution lisait
   l'`opacity` du groupe et publiait un **`1` plat** qui ne disait rien;
   l'atténuation vit sur le `fill-opacity` et le `stroke-opacity` du rectangle.
   **Le chiffre publié aurait fait croire à une absence d'atténuation.**
   Corrigé.

**Un quatrième incident, d'exécution :** deux instances de l'application ont
tourné en parallèle sur le même magasin, produisant un artefact d'abandon et un
artefact de succès contradictoires. **Les deux ont été détruits**, et la
campagne publiée provient d'une **exécution unique** sur le **binaire final**,
relancée après le dernier changement de code.

### 7.6 Une lacune du modèle, trouvée en supprimant du code mort

Le compilateur a signalé la constante `RELATION_TYPES` comme jamais utilisée.
Elle l'était en effet : **le type d'une relation était vérifié non vide, mais
jamais confronté aux deux types déclarés** en §4.2, ce que le modèle gelé exige.
Corrigé — un type inventé est désormais rejeté par
`relation_rejected_unknown_type` — et couvert par un test.

### 7.7 Une borne ajoutée, déclarée

`MAX_DERIVED_RELATIONS = 5 000`, dans l'esprit de `B-1` : la dérivation
**refuse** au lieu de tronquer. Ce n'est **pas** un critère gelé, c'est une
garde ajoutée. La règle `homonymes` est quadratique en nombre de fichiers
homonymes; sur la fixture `wide`, où `piece-00.txt` existe dans 240 répertoires,
elle produirait des centaines de milliers de paires.

**Conséquence assumée :** les relations ne sont ouvertes que pour la fixture
gelée `quasi-empty` — §4.6. Toute autre fixture est refusée **en toutes
lettres**, motif `relations_out_of_scope_for_fixture`, et le panneau l'écrit à
l'écran. **Ce n'est pas une troncature, c'est une portée.**

### 7.8 État de chaque exigence de parité touchée

| Exigence | État | Ce qui manque |
|---|---|---|
| `P-04` | **PARTIELLE** | **La révocation n'est pas implémentée** — §2.2. `CARTETOPO_FUNCTIONAL_PARITY.md` §5.2 interdit une relation irrévocable |
| `P-05` | **SATISFAITE sur ce périmètre** | la fixture gelée seulement |
| `P-07` | **SATISFAITE sur ce périmètre** | la fixture gelée seulement |
| `P-06` | **PARTIELLE**, avancée | la part hiérarchique et la part transversale sont livrées; `F-017` reste hors périmètre |

### 7.9 Ce que cette tranche ne prouve pas

- **`R8` n'est pas levée** et ne peut pas l'être ici. Aucune mesure de
  performance n'a été prise, **aucun seuil n'a été inventé**, et `TASK-0017`
  n'en demandait aucun.
- **`I-E` n'est pas implémentée.** `ek1` est un **repli déterministe**;
  `VolumeSerialNumber` + `FileId` et les déplacements ou renommages réels
  restent entiers.
- **Aucune heuristique réelle de suggestion n'existe.** Les huit suggestions
  sont **écrites d'avance** dans la fiche; leur `basis` est
  `fixture-synthetique-task-0017` et ne prétend à rien d'autre.
- **Les relations d'un seul cerveau synthétique sont exercées.** `P-20`, les
  cerveaux multiples, reste entier.
- **`P-21` n'est pas satisfaite :** interface **en français seulement**, aucun
  audit WCAG complet, **aucun lecteur d'écran réel**. Ce qui est démontré est
  l'atteignabilité au clavier et l'absence de codage par la seule couleur.
- **L'activation au clavier d'une entrée de panneau n'a pas été jouée par une
  frappe de confiance.** Un script ne peut pas forger un `Enter` de confiance.
  Ce qui est prouvé : l'entrée est un `<button>` non désactivé **atteint par le
  focus**, et son activation passe par le comportement d'activation du bouton —
  **celui-là même qu'`Enter` déclenche**. **L'artefact le dit explicitement.**
  Les flèches de la carte, elles, sont exercées pour de vrai.
- **`B0` n'est pas corrigé**, rien n'a été supprimé dans `src-tauri/target/`.
- **Douze exigences de parité restent entières.**

### 7.10 Validation exécutée

| Contrôle | Résultat |
|---|---|
| Tests Rust | **75 / 75**, dont les deux tests-gardes `X2` |
| Tests TypeScript | **81 / 81**, dont 22 nouveaux sur `J6` à `J9` |
| `tsc --noEmit` | **PASS** |
| `pnpm build` | **PASS** |
| Build Tauri release, sans empaquetage | **PASS**, `1 min 21 s` |
| `J12` dans WebView2 réel | **PASS**, artefact publié |
| Rejeu `H1` à `H7` de `TASK-0016`, relations en place | **PASS** sur les 4 fixtures, verdicts identiques au relevé publié |

**Un avertissement de compilation subsiste**, `unused import: self` dans
`src-tauri/src/map/commands.rs` : il est **antérieur** à cette tâche et n'a pas
été touché, le périmètre de `TASK-0017` ne le nommant pas.

## 8. Historique de l'état, suite

| Date | État | Motif |
|---|---|---|
| 2026-09-01 | `IMPLEMENTED` | Douze critères tenus, preuves publiées, contrôle indépendant à faire |

---

## 9. Contrôle indépendant — réserves `X3` et `X4`, corrigées

**Verdict du contrôle indépendant :** **`CHANGES_REQUIRED`**, deux réserves.
Enregistré en
[`ACTION-0027`](../reviews/ACTION-0027-independent-control.md).
**`TASK-0017` reste `IMPLEMENTED`. `VERIFIED` n'est pas attribué.**

Le contrôle a **accepté** que le gel `51a8cac` précède le code `a98676e`, et
que `J1` à `J11` soient acceptables sous réserve de `X3`. Il a aussi confirmé
que **la révocation de `P-04` reste hors périmètre** — §2.2 — et n'est donc
**pas** une réserve.

### 9.1 `X3` — la création d'une relation `APPROVED` n'était pas verrouillée

**Le constat.** `insert_established()` acceptait `provenance=APPROVED` dès lors
que la suggestion nommée était déjà `approved`, **sans vérifier que la source,
la cible et le type correspondaient à cette suggestion**. Une suggestion déjà
approuvée pouvait donc **justifier une relation qui n'était pas elle-même**.

**Pourquoi c'était bloquant.** La garde contrôlait qu'une clé **existe**, pas
ce qu'elle **désigne**. Cela contredisait §4.1 — une suggestion ne devient
relation que par approbation explicite — et `J4` — **exactement une** relation
`APPROVED` **correspondante**, **aucun passage silencieux**. **Le défaut était
de la même famille que `X2` :** ce qui avait été jugé, c'est ce que le code
*appelle*, pas ce que le stockage *permet*.

**La correction, sur trois plans dont deux structurels.**

| Plan | Ce qui a changé |
|---|---|
| API | `insert_established` refuse `APPROVED` **sans condition**. `approve()` est la **seule** voie applicative |
| Schéma, **version 2** | `suggestion_key` **`UNIQUE`**, **clé étrangère** vers `relation_suggestions`, **trois déclencheurs** SQLite |
| Transaction | `approve()` écrit un `INSERT` **simple** — `OR IGNORE` transformait un refus en non-événement silencieux |

Les trois déclencheurs, lus dans le fichier après exécution :
`approved_must_match_its_suggestion_on_insert`,
`approved_must_match_its_suggestion_on_update`, et
`suggestion_cannot_drift_from_its_relation`. **La correspondance n'est plus
vérifiée en Rust : elle est portée par le stockage.** Une garantie qui ne tient
que si l'appelant emploie la bonne fonction n'est pas une garantie.

**La migration est explicite.** Un magasin de version 1 peut contenir la ligne
que `X3` décrit. Elle **n'est pas reprise**, et **n'est pas supprimée en
silence** : sa clé est écrite dans `relation_meta` sous
`migration_v2_discarded`. Données **synthétiques** uniquement.

**Neuf tests ajoutés**, dont **cinq écrivent directement en SQL** pour prouver
les contraintes **au niveau du stockage**, et non au niveau de l'API qui refuse
déjà.

### 9.2 `X4` — `J12` n'était pas prouvé intégralement

**Le constat.** Le gel exige « parcourir au clavier au moins une relation ».
L'artefact précédent prouvait le focus, le bouton natif et une activation
fonctionnelle — mais **déclarait lui-même qu'aucune frappe `Enter` de confiance
n'avait été jouée**. **Une déclaration d'honnêteté n'est pas une preuve.**

**La correction.** Le scénario **n'active plus rien lui-même**. Il pose le
focus, écrit un marqueur sur la sortie de l'hôte, et attend une **frappe réelle
Windows** envoyée par
[`scripts/j12-send-real-key.ps1`](../../scripts/j12-send-real-key.ps1) via
`WScript.Shell`, après `AppActivate`. **Aucune nouvelle dépendance :**
`WScript.Shell` fait partie de Windows.

**Trois instruments simultanés**, parce qu'aucun ne suffit seul : `isTrusted`
de l'événement d'activation; les compteurs d'appels à
`HTMLElement.prototype.click` et de `dispatchEvent` de type `click`, qui
doivent rester à **zéro**; et le changement observable lui-même. **Si la frappe
n'arrive pas, le scénario échoue.** Il ne se rabat **jamais** sur un clic
synthétique. **L'approbation passe par le même chemin** : un clic envoyé par un
script n'est pas quelqu'un qui approuve.

**La preuve rejouée**, `TASK-0017-J12-webview2.json`, **WebView2
`151.0.4129.107`**, sur le **binaire portant les deux corrections** :

| Élément | Traversée | Approbation |
|---|---|---|
| Méthode d'entrée | `WScript.Shell SendKeys` après `AppActivate` | idem |
| Touche | `{ENTER}` | `{ENTER}` |
| Focus avant | `BUTTON` `relation__link`, « →note-1.txt ◆ déterministe » | `BUTTON` `suggestion__approve`, « Approuver S-005 » |
| `keydown` de confiance | **`true`**, `Enter` | **`true`**, `Enter` |
| Activation de confiance | **`true`** | **`true`** |
| Appels `click()` programmatiques | **0** | **0** |
| `dispatchEvent` de type `click` | **0** | **0** |
| Endpoint avant → après | `map-node-6` → **`map-node-9`** | — |
| Endpoint attendu, lu **sur l'entrée activée** | `map-node-9` | — |
| L'index confirme la relation | **`true`** | — |
| Changement dû à la frappe | **`true`** | **`true`** |

### 9.3 Un cinquième défaut de protocole, trouvé en rejouant

**Ma preuve était fausse, pas le produit.** Le premier rejeu avec frappe réelle
a publié `selectionFollowedTheRelation: false` : l'extrémité attendue était
calculée depuis `outgoing[0]` **de l'index**, alors que le panneau **groupe par
direction puis par type**. La sélection était allée **exactement** où l'entrée
activée menait.

**Corrigé à la source :** chaque entrée porte son extrémité en attributs
`data-`; la preuve la lit **sur l'entrée activée**, puis demande à l'index si
c'est bien une relation de ce nœud — ni hypothèse d'ordre, ni tautologie. Un
test unitaire verrouille la correspondance.

**Ce défaut allait dans le bon sens** — un faux négatif — mais il est publié
comme les quatre autres.

### 9.4 Revalidation complète

| Contrôle | Résultat |
|---|---|
| Tests Rust | **84 / 84** (75 avant, **+9** pour `X3`) |
| Tests-gardes `X2` | **PASS** |
| Tests TypeScript | **82 / 82** (81 avant, **+1**) |
| `pnpm check`, `pnpm build` | **PASS** |
| Build Tauri release, sans empaquetage | **PASS**, `47,8 s` |
| `J1` à `J5` dans l'hôte | 5/5 rejets, rejeu stable, **12/12 nœuds**, 0 inverse |
| `J10` | **PASS** — après reconstruction des 4 index : 8 déterministes, **5 approuvées**, 3 en attente, **0 correspondance rompue** |
| `J11` | **PASS** — `H1` à `H7` identiques, **0 artefact** dans la racine analysée |
| `J12` | **PASS**, complet, sur le binaire final |

Schéma lu dans le fichier : `user_version = 2`, `suggestion_key` en index
**unique**, clé étrangère présente, **trois déclencheurs**, et **0** ligne
approuvée ne correspondant pas à sa suggestion.

### 9.5 Ce qui n'a pas changé

**Aucun critère `J1` à `J12`, aucune fixture gelée, aucune règle gelée** n'a
été modifié. **Aucune mesure de performance, aucun seuil, aucune nouvelle
dépendance, aucune donnée réelle, aucun sélecteur de dossier.** `R8` entière,
`B0` non corrigé, rien supprimé dans `src-tauri/target/`. **La révocation de
`P-04` n'est toujours pas implémentée** : `P-04` demeure **PARTIELLE**.

## 10. Historique de l'état, suite

| Date | État | Motif |
|---|---|---|
| 2026-09-01 | `IMPLEMENTED` | Contrôle indépendant `ACTION-0027` : `X3` et `X4` **corrigées**, **non closes**. **`VERIFIED` non attribué.** Re-contrôle indépendant attendu |
