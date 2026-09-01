# TASK-0018 — A-3 : fondation multi-cerveaux, catalogue, isolation réelle et bascule complète

- **Identifiant :** `TASK-0018`
- **Titre :** Troisième tranche de production de l'étape **A** — **fondation
  multi-cerveaux** : catalogue de cerveaux, identité `brain_id` distincte de la
  source, stockage isolé par cerveau, un cerveau actif à la fois, sélecteur de
  cerveau et **vraie bascule** de l'index, de la carte et des relations
- **Statut :** **`APPROVED`** le 2026-09-01
- **Phase :** étape **A** de la feuille de route — parité fonctionnelle MVP,
  **troisième** tranche
- **Proposée le :** 2026-09-01
- **Rédacteur de la fiche :** Claude Code
- **Exécuteur :** Claude Code
- **GO d'exécution :** **ACQUIS** le 2026-09-01 — **GO technique** de
  l'orchestrateur, nommant `TASK-0018` et son périmètre écrit. Un GO technique
  n'autorise **que ce qu'il nomme**
- **Décision produit fondatrice :**
  [`DEC-0017`](../decisions/DEC-0017-multibrain-and-composed-views.md)
- **Branche :** `build/v0.2-a3-multibrain-foundation`, créée depuis le tip
  **contrôlé** `50de16b3d69996f13eb4e6b467273373abce35bf` de
  `build/v0.2-a2-relations`
- **Préalables, vérifiés au départ :** `TASK-0017` **`VERIFIED`**,
  `ACTION-0027` **`CLOSED`**, réserves **`X3` `CLOSED`** et **`X4` `CLOSED`**,
  `TASK-0016` **`VERIFIED`**, `X2` **`CLOSED`**, **aucune** tâche
  `IN_PROGRESS`, arbre Git **propre**, `HEAD` = `50de16b`,
  `main` = `91bbe90f0f99026c28cd345784d4f579a0016db2`, **non touchée**

> **§4 fige, avant la première ligne de code**, le modèle de cerveau, les trois
> cerveaux synthétiques, la disposition du stockage et les critères **`K1` à
> `K12`**.
>
> **Rien de §4 ne se retouche après le premier résultat. Une cible manquée
> reste manquée, et se publie comme manquée.**

## 1. Pourquoi cette tranche

`TASK-0016` et `TASK-0017` ont livré une carte et des relations pour **une
fixture à la fois**. Dans ce code, **l'identité d'un cerveau et l'identité de
sa source sont la même chaîne** : `fixture_id`. Deux cerveaux ne peuvent donc
pas partager une source, et rien n'empêche un identifiant de source de servir
de frontière de sécurité — ce qu'il n'est pas.

`DEC-0017` fait du multi-cerveaux la **forme du produit**. Cette tranche pose
la fondation : une identité FileTopo propre, un catalogue, un stockage
**physiquement** séparé, et une bascule qui charge réellement les données du
cerveau choisi.

Le test décisif n'est pas « deux cerveaux différents fonctionnent ». C'est
**deux cerveaux sur la MÊME source restent totalement indépendants**.

## 2. Périmètre

### 2.1 Ce que `TASK-0018` implémente

- **catalogue de cerveaux**, persistant;
- **identité `brain_id`** distincte de la source;
- **stockage physiquement et logiquement isolé** par cerveau;
- **un cerveau actif à la fois**;
- **sélecteur de cerveau** dans l'interface;
- **vraie bascule** de l'index, de la carte et des relations;
- **identité visuelle** : nom + couleur + icône;
- **métadonnées persistantes**;
- **état actif persistant** au redémarrage;
- **isolation démontrée** même entre deux cerveaux utilisant **la même
  fixture**.

### 2.2 Ce que `TASK-0018` n'implémente PAS — et ne prétendra pas avoir fait

| Hors périmètre | Où cela appartient |
|---|---|
| Plusieurs cerveaux **simultanément dans le même graphique** | `TASK-0019` |
| **Relations inter-cerveaux** | `TASK-0020` |
| **Vraie racine utilisateur** | tranche distincte, après GO |
| **Sélecteur de dossier** | interdit; réserve `X2` close, et respectée |
| **Suppression d'un vrai cerveau utilisateur** | tranche distincte |
| Recherche `P-08` | tranche ultérieure |
| Filtres `P-09` | tranche ultérieure |
| Watcher | tranche ultérieure |
| Journal de changements | tranche ultérieure |
| Vu / non vu | tranche ultérieure |
| **Persistance complète `P-19`** | tranche ultérieure |
| IA, OCR, RAG, GraphRAG | `DIFFÉRÉ`, `DEC-0012` inchangée |
| **Révocation de `P-04`** | **déclarée manquante hors `TASK-0017`; NON implémentée ici** |
| `I-E` complète | non; `ek1` reste le repli déterministe |
| Migration de données utilisateur | **il n'en existe aucune** |

**Toutes les sources restent SYNTHÉTIQUES.** Aucune donnée réelle, aucune
donnée personnelle, aucun chemin local personnel dans le dépôt.

**Aucune mesure de performance, aucun seuil de fps.** `R8` reste entière.

**Aucune nouvelle dépendance.** Si une nouvelle dépendance paraît nécessaire,
la tâche passe **`BLOCKED` avant toute installation**.

**`B0` n'est pas corrigé.** Rien n'est supprimé, nettoyé ni renommé dans
`src-tauri/target/`.

## 3. Fichiers autorisés

- `src-tauri/src/map/` — nouveau module `brains.rs`, et adaptation de
  `sandbox.rs`, `commands.rs`, `relations.rs`, `relation_commands.rs`,
  `store.rs`, `mod.rs`;
- `src-tauri/src/lib.rs` — surface de commandes, **`map_` uniquement**;
- `src/map/` — types, sélecteur de cerveau, état de session, scénario `K12`;
- `docs/` — cette fiche, `DEC-0017`, documents durables;
- `.orchestrator/RESULT.md`.

**Interdit :** `graph/`, `spikes/`, `src-tauri/target/`, tout ce qui est hors
du dépôt.

---

# 4. GEL — modèle, cerveaux, stockage et critères

> **Cette section est figée avant tout code.** Le commit qui la porte précède
> le premier commit de code.

## 4.1 Modèle de cerveau — figé

Un **`BrainRecord`** durable porte **au minimum** :

| Champ | Type | Sens |
|---|---|---|
| `brain_id` | chaîne | **Identité FileTopo.** Ni un chemin, ni un identifiant de source |
| `display_name` | chaîne | Nom affiché, modifiable par l'utilisateur |
| `color` | chaîne | Couleur d'identité, modifiable |
| `icon` | chaîne | Icône d'identité, modifiable |
| `source_kind` | énumération | **`SYNTHETIC_FIXTURE` uniquement** pour cette tranche |
| `source_ref` | chaîne | Référence de la source, résolue par le backend |

**Règles figées :**

1. **`brain_id` n'est PAS égal par nécessité à `source_ref`.** Deux cerveaux
   peuvent porter le même `source_ref` et **doivent** rester indépendants.
2. **Le code de carte ne traite plus `fixture_id` comme l'identité d'un
   cerveau.**
3. **Toute opération publique du runtime portant sur une carte ou une relation
   est scoped par `brain_id`.** Le backend résout ensuite `brain_id` →
   source synthétique.
4. **Un `node_id` seul n'est jamais une identité globale.** La frontière
   logique est **`BrainNodeRef = brain_id + node_id`**.
5. **Un `node_id` identique dans deux cerveaux ne doit jamais permettre une
   fuite.**
6. **`ek1` reste interne à la tranche.** Le magasin est **physiquement** scoped
   par `brain_id`, et **rien ne prétend qu'`ek1` est globalement unique entre
   cerveaux**.

## 4.2 Les trois cerveaux synthétiques — figés

| | `BRAIN-A` | `BRAIN-B` | `BRAIN-C` |
|---|---|---|---|
| `brain_id` | **`brain-alpha`** | **`brain-beta`** | **`brain-gamma`** |
| `display_name` | **`Cerveau Alpha`** | **`Cerveau Bêta`** | **`Cerveau Gamma`** |
| `source_kind` | `SYNTHETIC_FIXTURE` | `SYNTHETIC_FIXTURE` | `SYNTHETIC_FIXTURE` |
| `source_ref` | **`quasi-empty`** | **`deep`** | **`quasi-empty`** |
| `icon` | **`▲`** (U+25B2) | **`■`** (U+25A0) | **`◆`** (U+25C6) |
| `color` | **`#1F6F5C`** | **`#4A4FA8`** | **`#9A5A18`** |
| Position au catalogue | 1 | 2 | 3 |

**Point capital, et raison d'être de la tranche : `brain-alpha` et
`brain-gamma` utilisent VOLONTAIREMENT la même fixture `quasi-empty`.**

Même structure de source, mêmes chemins relatifs, **mêmes identifiants locaux
possibles**, et pourtant **deux cerveaux FileTopo totalement indépendants**.
C'est le **test principal d'isolation** de cette tranche.

Les trois icônes sont **trois formes géométriques distinctes**, lisibles sans
couleur. Les trois couleurs sont des **valeurs synthétiques fixes**, et
**aucune n'est le seul moyen d'identifier son cerveau** — `DEC-0017` point 12.

**Aucune donnée personnelle ou réelle.** Ces valeurs sont inventées.

## 4.3 Catalogue — figé

- **SQLite existant**, aucune nouvelle dépendance.
- **Catalogue commun dans l'espace FileTopo**, jamais dans une source
  analysée — `I-2`.
- Modèle cohérent avec **`DEC-0011` `S-C`** : petit **catalogue commun** pour
  l'état **non reconstructible** du cerveau; **index dérivé séparé** par
  cerveau; **relations et état séparés** par cerveau.
- Le catalogue **persiste au minimum** : `brain_id`, `display_name`, `color`,
  `icon`, `source_kind`, `source_ref`, et le **cerveau actif**.
- **Le seed est idempotent** : il crée ce qui manque et **ne réécrit jamais
  silencieusement** un nom, une couleur ou une icône déjà modifiés.

## 4.4 Stockage par cerveau — figé

    <bac>/brains/catalog.sqlite
    <bac>/brains/<brain_id>/map/index.sqlite
    <bac>/brains/<brain_id>/relations/relations.sqlite

**Exigence :** les fichiers SQLite de `brain-alpha` et de `brain-gamma`
**DOIVENT être différents**, alors même que leur `source_ref` est identique.

**Aucun cerveau n'est reconstruit en supprimant l'état d'un autre.**

Les anciens chemins synthétiques de `TASK-0016` / `TASK-0017` —
`<bac>/maps/<fixture>/` et `<bac>/relations/<fixture>/` — **peuvent rester
comme artefacts de développement non utilisés**. **Aucune migration de données
utilisateur** n'est due : il n'en existe aucune. **Rien n'est supprimé de façon
destructive pour faire propre.**

## 4.5 Relations sous multi-cerveaux — figé

`X1`, `X3`, `X4` et le schéma de relations de `TASK-0017` sont **préservés
intégralement**.

`brain-alpha` et `brain-gamma` utilisent tous deux `quasi-empty` et ont donc
**chacun leur propre magasin de relations**, indépendant.

**Scénario d'isolation figé :**

| Étape | `brain-alpha` | `brain-gamma` |
|---|---|---|
| État initial | 8 déterministes + 4 approuvées + 4 en attente | 8 déterministes + 4 approuvées + 4 en attente |
| Approuver `S-005` dans **Alpha** | 8 + **5** + **3** | **inchangé** : 8 + 4 + 4 |
| Approuver une **autre** suggestion dans **Gamma** | **inchangé** | 8 + **5** + **3** |

Le **même `suggestion_key` peut donc exister dans deux cerveaux**, parce que
son **espace d'identité est le cerveau**.

**Aucune généralisation des relations d'un cerveau vers un autre.** C'est
`TASK-0020`.

## 4.6 Interface — figée

Le **choix de fixture cesse d'être le concept utilisateur principal**. Il est
remplacé par un **sélecteur de cerveau**.

Cible minimale :

    Cerveau actif
    [ ▲  Cerveau Alpha  ▼ ]

    Menu :
      ▲  Cerveau Alpha
      ■  Cerveau Bêta
      ◆  Cerveau Gamma

Chaque entrée porte **son nom**, **son icône**, et une **indication visuelle
qui ne dépend pas de la seule couleur**.

La **source fixture** peut rester visible dans un **diagnostic développeur**,
mais **n'est pas présentée comme l'identité utilisateur du cerveau**.

**Changer de cerveau charge réellement** : le bon snapshot, la bonne carte, le
bon magasin de relations, les bons détails. **Pas seulement un identifiant qui
change dans React.**

**Aucun affichage simultané de plusieurs cerveaux.** L'architecture est
préparée pour que `TASK-0019` compose plusieurs `BrainView` **sans réécrire le
catalogue**, et `TASK-0019` **n'est pas codée maintenant**.

## 4.7 État de vue — figé

Dans **une même session** : sélectionner un nœud dans Alpha, faire un
panoramique et un zoom, passer à Bêta, revenir à Alpha → **FileTopo retrouve la
sélection et la transformation de vue d'Alpha**. Idem, **indépendamment**, pour
chaque cerveau.

Cette mémoire **peut être session-only** dans `TASK-0018`. **La persistance
complète de la vue après redémarrage reste `P-19` et n'est PAS revendiquée
ici.**

**En revanche, le CERVEAU ACTIF et ses métadonnées de catalogue DOIVENT
persister au redémarrage.**

---

## 4.8 Critères gelés `K1` à `K12`

> **Gelés. Aucun ne sera retouché après le premier résultat.**

### `K1` — CATALOGUE

Le catalogue retourne **exactement trois** cerveaux synthétiques gelés.
`brain_id` est **unique**. `brain-alpha` et `brain-gamma` ont un `source_ref`
**identique** et un `brain_id` **différent**.

### `K2` — IDENTITÉ

Toute commande runtime de carte ou de relations **introduite ou adaptée pour
l'utilisation normale prend `brain_id` comme frontière**.
Un `brain_id` **inconnu produit une erreur explicite**.
Un `node_id` d'un **autre** cerveau **ne peut jamais être résolu
silencieusement** dans le cerveau actif.

### `K3` — ISOLATION PHYSIQUE

Alpha, Bêta et Gamma utilisent **trois espaces de données différents**.
Alpha et Gamma, **malgré la même fixture**, n'utilisent **ni le même index
SQLite ni le même magasin de relations**.
**Comparer leurs chemins réels sous le bac synthétique et prouver qu'ils sont
distincts.**

### `K4` — BASCULE RÉELLE

Alpha → Bêta → Gamma charge successivement les snapshots attendus :

| Cerveau | Nœuds attendus |
|---|---:|
| Alpha | **12** |
| Bêta | **157** |
| Gamma | **12** |

Les cartes et les détails affichés correspondent au **cerveau actif**. **Aucun
snapshot précédent ne reste présenté comme courant.**

### `K5` — COLLISION D'IDS LOCAUX

Choisir **au moins un `node_id` présent dans Alpha ET dans Gamma**.
Sélectionner ce `node_id` dans Alpha **ne touche aucun état de Gamma**.
**Même test en sens inverse.**

### `K6` — RELATIONS ISOLÉES

Exécuter **exactement** le scénario d'isolation de §4.5 : une approbation dans
Alpha **ne modifie jamais** Gamma, et **inversement**.

### `K7` — MÉTADONNÉES

Nom, couleur et icône **appartiennent au cerveau**.
Modifier les métadonnées synthétiques d'**UN** cerveau **via le chemin
applicatif prévu** ne change **aucun autre** cerveau.
**Après réouverture du catalogue, elles sont toujours présentes.**
**L'interface utilise ces métadonnées.**

### `K8` — ÉTAT DE SESSION PAR CERVEAU

Dans **une seule session** : modifier sélection et vue d'Alpha; basculer sur
Bêta et modifier les siennes; revenir à Alpha.
**La sélection et la transformation d'Alpha reviennent exactement à leurs
valeurs de session**, et **celles de Bêta restent intactes**.

### `K9` — CERVEAU ACTIF PERSISTANT

Définir **Gamma** actif. **Fermer proprement l'hôte. Redémarrer.**
Le catalogue **et** l'interface rouvrent **Gamma** comme cerveau actif.
**Aucune autre persistance `P-19` n'est revendiquée.**

### `K10` — SÉLECTEUR ACCESSIBLE

Le sélecteur de cerveau est **atteignable et utilisable au clavier dans le vrai
WebView2**.
**Une vraie frappe clavier doit pouvoir changer de cerveau.**
Le cerveau actif est **identifiable sans dépendre de la couleur seule**.

### `K11` — LECTURE SEULE / `X2`

- Empreintes des fixtures **identiques avant / après**;
- **aucun artefact FileTopo** dans les racines analysées;
- **aucune donnée réelle**;
- **aucun folder picker**;
- **aucune commande héritée 0.1 réactivée**;
- **les tests-gardes `X2` restent `PASS`**;
- **toutes les commandes exposées restent dans la surface `map_` actuelle**.

### `K12` — HÔTE RÉEL

Dans **Tauri / WebView2 final**, dans cet ordre :

1. démarrer sur le **cerveau actif**;
2. basculer **Alpha → Bêta → Gamma → Alpha**;
3. confirmer les comptes **12 → 157 → 12 → 12**;
4. confirmer **noms et icônes**;
5. créer une **sélection et un pan/zoom différents** dans Alpha et dans Bêta;
6. **revenir à chacun** et vérifier l'état de session;
7. **approuver `S-005` dans Alpha**;
8. basculer sur **Gamma** et confirmer que **sa `S-005` est toujours en
   attente**;
9. **changer le cerveau actif sur Gamma**;
10. **fermer réellement l'application**;
11. **la redémarrer**;
12. confirmer **Gamma actif** et **métadonnées persistantes**.

**Publier une preuve compacte.**

**Aucune mesure de performance ni seuil de fps n'est ajouté.**

---

## 5. Validation due

**Avant code :** commit du **gel** (cette section §4), poussé.

**Après code :**

- tous les tests Rust;
- tous les tests TypeScript;
- `pnpm check`;
- `pnpm build`;
- build Tauri;
- tests `X3` / `X4`;
- tests-gardes `X2`;
- tests catalogue;
- tests de collisions `brain_id` / `node_id`;
- tests Alpha / Gamma sur la **même fixture**;
- isolation des relations;
- métadonnées;
- état de session;
- **`K12` dans le vrai WebView2**;
- **redémarrage réel** pour `K9` et `K12`.

## 6. État final attendu

`TASK-0018` se termine **`IMPLEMENTED`**, **jamais `VERIFIED`**. **L'exécuteur
ne s'auto-vérifie pas.**

`NEXT_ACTION` = **contrôle indépendant de `TASK-0018`**.

**Aucune fusion vers `main`, aucune PR, aucune release, aucune étiquette, aucun
`force push`, aucune réécriture d'historique.**

---

## 7. Résultat

*Section vide au moment du gel. Elle sera écrite après l'exécution, et le gel
de §4 ne sera pas retouché.*

## Historique d'état

| Date | État | Motif |
|---|---|---|
| 2026-09-01 | `PROPOSED` | Fiche créée sous `DEC-0017` |
| 2026-09-01 | `APPROVED` | GO technique de l'orchestrateur, périmètre écrit en §2 et §3 |
