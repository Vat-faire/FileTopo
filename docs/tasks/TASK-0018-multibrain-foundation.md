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

**Écrit après l'exécution. §4 n'a pas été retouchée** — le gel `51bb687`
précède le premier commit de code `4cb1cf4`, et aucun critère `K1`–`K12` n'a
été modifié après le premier résultat.

### 7.1 Les douze critères gelés

| Critère | Verdict | Où c'est prouvé |
|---|---|---|
| `K1` catalogue, trois cerveaux, `brain_id` unique, `source_ref` partagé | **TENU** | `brains.rs` tests; `K12` passe 1 §1 : 3 cerveaux, `brains/catalog.sqlite` |
| `K2` identité, `brain_id` frontière, inconnu = erreur nommée | **TENU** | `MapError::UnknownBrain`; `map_brains`/`map_brain_*` + toutes les commandes carte et relations scopées |
| `K3` isolation physique | **TENU** | `brains/brain-alpha/map/index.sqlite` ≠ `brains/brain-gamma/map/index.sqlite`, **chemins réels publiés** |
| `K4` bascule réelle 12 → 157 → 12 → 12 | **TENU** | `K12` passe 1 §2–4, comptes lus par commande |
| `K5` collision d'identifiants locaux | **TENU** | même `node_id`, deux clés d'extrémité; une référence d'un autre cerveau est **refusée** |
| `K6` relations isolées | **TENU** | Alpha 4→5 approuvées / 4→3 en attente; Gamma **inchangé**, sa `S-005` toujours en attente |
| `K7` métadonnées | **TENU** | modification par le chemin applicatif, les autres cerveaux inchangés, conservée après redémarrage |
| `K8` état de session par cerveau | **TENU** | `alphaRestored=true`, `betaRestored=true`, les deux états différents |
| `K9` cerveau actif persistant | **TENU** | après **fermeture et redémarrage réels** : Gamma actif dans le catalogue **et** dans l'interface |
| `K10` sélecteur accessible, **vraie frappe** | **TENU** | 4 bascules, `activationIsTrusted=true`, `keydownIsTrusted=true`, **0** clic programmatique |
| `K11` lecture seule / `X2` | **TENU** | empreintes identiques avant/après ×3, **0** artefact FileTopo dans les racines, surface `map_` seule |
| `K12` hôte réel, douze étapes | **TENU** | `TASK-0018-K12-webview2-pass{1,2}.json`, WebView2 `151.0.4129.107` |

### 7.2 Ce qui rend l'isolation structurelle

**Le `brain_id` est le nom d'un répertoire, pas une colonne.** `brain-alpha` et
`brain-gamma` lisent la **même** fixture; leurs états ne peuvent pas se
rencontrer parce qu'ils ne sont pas dans le même fichier, et non parce qu'une
clause `WHERE` les sépare.

**L'index dit pour quel cerveau il a été construit.** Le schéma passe en
**version 2** et `map_meta` porte `brain_id`. `open_store` refuse un index
construit pour un autre cerveau — `MapError::BrainMismatch` — et un index de
version 1, qui ne nomme aucun cerveau, n'est celui de personne. Le test qui le
prouve **copie réellement** l'index d'Alpha à la place de celui de Gamma.

**Un `node_id` ne voyage jamais seul.** `map_node_detail` et
`map_relations_for_node` prennent un **`BrainNodeRef`**. Ce n'est pas une
formalité : après une bascule, l'interface tient encore la sélection du cerveau
précédent, et `12` est une ligne valide dans Alpha **comme** dans Gamma. Un
numéro nu se résoudrait, silencieusement, dans le mauvais cerveau.

**Les clés d'extrémité sont construites sur le cerveau.** Deux cerveaux sur une
même source produisent deux espaces de clés **disjoints**, ce qu'un test
vérifie plutôt que de le supposer.

### 7.3 Trouvés en chemin, et publiés

**Deux défauts du produit**, tous deux trouvés par les critères eux-mêmes :

1. **Le menu du sélecteur se refermait sur un `blur` à `relatedTarget` nul.**
   Une **désactivation de fenêtre** produit exactement ce `blur`. La frappe
   réelle de `K10` arrivait donc sur un bouton démonté à l'instant où l'hôte
   ramenait la fenêtre au premier plan. **Le critère avait raison, le contrôle
   avait tort.** Le menu ne se referme plus que si le focus part vers un autre
   élément **de la page**; un appui pointeur hors du contrôle le ferme aussi.
   Deux tests de régression.
2. **La vue était ré-ajustée quand le viewport se stabilisait une image plus
   tard**, ce qui effaçait la vue qu'un cerveau venait de retrouver. `K12` a
   publié `alphaRestored=false` **sur un produit dont la sélection revenait
   parfaitement**. La règle est maintenant écrite une seule fois —
   `shouldFitOnOpen` — et testée : on ajuste **une fois par cerveau**, et de
   nouveau seulement si le premier ajustement précédait toute mesure du
   viewport.

**Deux défauts d'outillage**, publiés avec ce qu'ils ont produit :

3. **Un binaire `release` ne peut pas écrire d'artefact** —
   `map_write_run_artifact` n'existe qu'en `debug`. La première tentative de
   `K12` a donc **échoué en ne publiant rien du tout**, pas même son abandon.
   Le scénario construit désormais son évidence dans un objet fourni par
   l'appelant : un échec publie ce qu'il savait au moment de tomber. C'est
   ainsi que le défaut n° 1 a été diagnostiqué, sur la ligne
   `focus atteint=false`.
4. **`Write-Output` dans une fonction PowerShell entre dans sa valeur de
   retour.** Le lanceur a donc **annoncé un succès** alors que la passe 1 avait
   abandonné. Corrigé en `Write-Host`, et la boucle d'attente s'arrête
   désormais aussi sur l'artefact d'abandon.

### 7.4 Ce que cette tranche ne prouve pas

- **`J12` n'avait pas été rejoué dans l'hôte au moment de `7.1`.** Le scénario
  avait été migré vers `brain-alpha` — même fixture gelée, même mécanisme de
  frappe réelle, extrait dans `realInput.ts` sans changement — mais il
  **n'avait pas été exécuté** : le rejouer aurait **écrasé
  `TASK-0017-J12-webview2.json`**, preuve publiée d'une tâche `VERIFIED`.
  **C'est exactement la réserve `X5`.** Depuis la correction enregistrée en
  **§8**, le scénario écrit sous un nom `TASK-0018` de régression et **il a été
  rejoué une fois dans le vrai WebView2**. Ce point n'est plus « non testé »;
  voir §8.2.
- **La campagne `H9` n'a pas été reprise**, et aucune mesure n'a été faite.
  `R8` reste entière.
- **Les boucles de vérification et de mesure marchent désormais par cerveau**,
  puisque le runtime n'expose plus aucune commande indexée par fixture. Elles
  couvrent donc `quasi-empty` (deux fois) et `deep`, **et non** `wide` ni
  `mixed`. Les artefacts publiés de `TASK-0016` sont **inchangés** et restent
  le relevé pour ces deux fixtures.
- **La persistance complète `P-19` n'est pas revendiquée** : l'état de vue est
  **session seulement**. Seul le **cerveau actif** et les **métadonnées**
  survivent au redémarrage.
- **La révocation de `P-04` n'est toujours pas implémentée.** `P-04` demeure
  **PARTIELLE**.
- **`ek1` n'est pas `I-E`**, et rien ne prétend qu'il est globalement unique
  entre cerveaux — l'isolation vient du **stockage**, pas de la clé.
- **`P-21` n'est pas satisfaite** : français seulement, aucun audit WCAG
  complet, **aucun lecteur d'écran réel**. `K10` prouve une **vraie frappe**,
  ce qui n'est pas un audit d'accessibilité.
- **`B0` s'est reproduit une quatrième fois** pendant cette tranche, sur un
  `pnpm tauri build --debug`. **Rien n'a été supprimé ni renommé** dans
  `src-tauri/target/`; `CARGO_INCREMENTAL=0` suffit à contourner.
- **Une seule machine, un seul écran, un seul runtime WebView2.**

### 7.5 Validations exécutées

| Validation | Résultat |
|---|---|
| Tests Rust | **104/104** (84 → 104) |
| Tests TypeScript | **97/97** (82 → 97) |
| `pnpm check` | **PASS** |
| `pnpm build` | **PASS** |
| Build Tauri `debug --no-bundle` | **PASS** |
| Build Tauri `release --no-bundle` | **PASS**, 33,17 s |
| Tests-gardes `X2` | **PASS**, plus un test positif sur la surface cerveaux |
| Tests `X3` / `X4` | **PASS**, inchangés |
| `K11` dans l'hôte réel | **PASS** — `TASK-0018-K11-readonly-and-isolation.json` |
| `K12` dans l'hôte réel, deux passes | **PASS** — `pass1` et `pass2` |
| Redémarrage réel pour `K9` et `K12` | **PASS** |
| Nouvelle dépendance | **aucune** — `package.json`, `pnpm-lock.yaml`, `Cargo.toml` inchangés |

### 7.6 État final

**`IMPLEMENTED`.** L'exécuteur ne s'attribue pas `VERIFIED`.

`NEXT_ACTION` = **contrôle indépendant de `TASK-0018`**, par une instance
distincte de l'exécuteur, **sur preuves**.

## 8. Correction de la réserve `X5` — ACTION-0028

- **Date :** 2026-09-01
- **Origine :** contrôle indépendant enregistré dans
  [`ACTION-0028`](../reviews/ACTION-0028-independent-control.md) —
  **`CHANGES_REQUIRED`**, une seule réserve, **`X5`**
- **État de la tâche :** **inchangé — `IMPLEMENTED`.** `VERIFIED` n'est pas
  attribué
- **Rien de §4 n'a été retouché.** Aucun critère `K`, aucune fixture, aucune
  règle gelée. Aucun critère `H` ou `J` non plus

### 8.1 Ce que `X5` reprochait, et ce qui a changé

Les scénarios migrés par cette tranche écrivaient encore sous les noms
canoniques de `TASK-0016` et de `TASK-0017`, et `write_run_artifact` écrit par
**remplacement** : une exécution du runtime courant pouvait donc détruire la
preuve publiée d'une tâche déjà `VERIFIED`.

La règle instaurée : **une exécution d'une tâche ultérieure ne remplace jamais
la preuve canonique d'une tâche antérieure `VERIFIED`.** Elle est tenue **à la
porte** — `write_run_artifact` refuse les noms protégés avant tout accès au
disque — et non par convention.

| Ce qui s'exécute | Écrit désormais |
|---|---|
| boucle de mesure, par cerveau | `TASK-0018-H9-multibrain-regression-webview2.json` |
| scénario relations, sur `brain-alpha` | `TASK-0018-J12-relations-regression-webview2.json` |

Chaque artefact déclare `task`, `sourceCriterion`, `nature`,
`doesNotReplace` et `replacesCanonicalEvidence: false`.

**Aucune mesure `H9` n'a été exécutée** : cette tranche n'a aucun critère de
performance. **`R8` reste entière.**

### 8.2 Le `J12` de régression, rejoué dans l'hôte réel

Une exécution, sur `brain-alpha`, WebView2 `151.0.4129.107`, **frappe Windows
réelle** : `activationIsTrusted = true`, `keydownIsTrusted = true`, **0**
`click()` programmatique, **0** `dispatchEvent(click)`, traversée réelle au
clavier, approbation explicite de `S-005` (`3 → 4` sortantes,
`enteredCountsOnlyAfterApproval = true`), `X3` respecté (5/5 rejets),
comptes cohérents (`countsAgree`, `replayStable`).

**Preuve :**
[`TASK-0018-J12-relations-regression-webview2.json`](../performance/runs/TASK-0018-J12-relations-regression-webview2.json).

**La preuve originale de `TASK-0017` est inchangée**, empreinte et `git diff`
à l'appui.

### 8.3 Garde de régression

**9 tests neufs** — 7 en TypeScript (`src/map/runArtifacts.test.ts`), 2 en Rust
(`map::commands::tests`) — éprouvés **par mutation**. Ils échouent si un site
d'écriture du runtime redevient un nom protégé.

### 8.4 Revalidation

| Validation | Résultat |
|---|---|
| Tests Rust | **106/106** (104 → 106) |
| Tests TypeScript | **104/104** (97 → 104) |
| `pnpm check` | **PASS** |
| `pnpm build` | **PASS** |
| Build Tauri `debug --no-bundle` | **PASS**, 12,12 s |
| Tests-gardes `X2` | **PASS** |
| Tests `X3` / `X4` | **PASS**, inchangés |
| Nouveau test `X5` | **PASS** |
| `J12` de régression dans WebView2 | **PASS** |
| `TASK-0016-H9-webview2.json` | **inchangé**, `git diff` vide |
| `TASK-0017-J12-webview2.json` | **inchangé**, `git diff` vide |
| Nouvelle dépendance | **aucune** |

`K12` n'a pas été rejoué : **aucun code produit de bascule, de catalogue ou de
session n'a été modifié.**

### 8.5 État

**`X5` est corrigée, NON close.** Sa clôture appartient au **re-contrôle
indépendant**, qui reste l'action unique suivante.

## Historique d'état

| Date | État | Motif |
|---|---|---|
| 2026-09-01 | `PROPOSED` | Fiche créée sous `DEC-0017` |
| 2026-09-01 | `APPROVED` | GO technique de l'orchestrateur, périmètre écrit en §2 et §3 |
| 2026-09-01 | `IN_PROGRESS` | Exécution commencée après le gel `51bb687`; §4 n'est pas retouchée |
| 2026-09-01 | `IMPLEMENTED` | `K1`–`K12` tenus, preuves publiées; `VERIFIED` non attribué par l'exécuteur |
| 2026-09-01 | `IMPLEMENTED` | Correction de la réserve `X5` d'`ACTION-0028`; `J12` de régression rejoué; statut inchangé, `VERIFIED` toujours non attribué |
