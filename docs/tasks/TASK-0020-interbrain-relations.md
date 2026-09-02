# TASK-0020 — A-5 : relations inter-cerveaux explicites, sans jamais fusionner deux cerveaux

- **Identifiant :** `TASK-0020`
- **Titre :** Cinquième tranche de production de l'étape **A** — **relations
  inter-cerveaux explicites** : un nœud d'un cerveau relié à un nœud d'un autre
  cerveau, avec **provenance**, dans un **magasin commun distinct**, visible
  comme une arête qui **traverse réellement** les territoires de la vue
  composée, et **sans aucune fusion**
- **Statut :** **`APPROVED`** le 2026-09-02
- **Phase :** étape **A** de la feuille de route — parité fonctionnelle MVP,
  **cinquième** tranche
- **Proposée le :** 2026-09-02
- **Rédacteur de la fiche :** Claude Code
- **Exécuteur :** Claude Code
- **GO d'exécution :** **ACQUIS** le 2026-09-02 — **GO technique** de
  l'orchestrateur, nommant `TASK-0020` et son périmètre écrit. Un GO technique
  n'autorise **que ce qu'il nomme**
- **Décision produit fondatrice :**
  [`DEC-0018`](../decisions/DEC-0018-explicit-interbrain-relations.md),
  fonction **`F-041`**
- **Branche :** `build/v0.2-a5-interbrain-relations`, créée depuis le tip
  **contrôlé** `8d1e27151f53d082551e05b00816100cb790542b` de
  `build/v0.2-a4-composed-view`
- **Préalables, vérifiés au départ :** `TASK-0019` **`VERIFIED`**,
  `ACTION-0030` **`CLOSED`**, réserve **`X6` `CLOSED`**
  ([`ACTION-0031`](../reviews/ACTION-0031-independent-recontrol.md));
  `TASK-0018`, `TASK-0017`, `TASK-0016`, `TASK-0015` **`VERIFIED`**; **aucune**
  tâche `IN_PROGRESS`; arbre Git **propre**; `HEAD` = `8d1e271`; `main` =
  `91bbe90f0f99026c28cd345784d4f579a0016db2`, **non touchée**

> **§4 fige, avant la première ligne de code**, l'architecture de stockage, le
> modèle d'endpoint, le modèle relationnel, le jeu synthétique **`XBR-1`** et
> les critères **`M1` à `M12`**.
>
> **Rien de §4 ne se retouche après le premier résultat. Une cible manquée
> reste manquée, et se publie comme manquée.**

## 1. Pourquoi cette tranche

`TASK-0019` a livré la **vue composée** : Alpha, Bêta et Gamma dans un seul
`SVG`, chacun sur son territoire, **sans aucune arête entre eux**. `L8`
l'exigeait, et c'était juste : une arête qui traverse une frontière de cerveau
n'a de sens que si un **modèle** la porte, avec une provenance, un stockage et
une identité qui survivent à une reconstruction.

Ce modèle n'existait pas. `TASK-0017` a donné des relations **à l'intérieur**
d'un cerveau, avec une provenance qui ne s'invente pas et un endpoint `ek1` qui
survit à une renumérotation. Rien n'existait **entre** deux cerveaux.

Cette tranche l'ajoute — et la difficulté n'est pas de dessiner une ligne d'un
territoire à l'autre. Elle est de répondre à trois questions que la vue
composée ne posait pas :

1. **Où vit une relation qui n'appartient à aucun des deux cerveaux ?** Pas
   dans le magasin privé d'Alpha : une reconstruction d'Alpha effacerait alors
   un lien dont Gamma est la moitié.
2. **Comment une extrémité reste-t-elle valide après un rebuild ?** Les
   `map_nodes.id` changent. Un lien qui pointe sur un numéro de ligne est un
   lien qui casse.
3. **Que voit-on quand un des deux cerveaux n'est pas affiché ?** Une relation
   n'est pas une propriété de la composition. Elle existe même hors champ, et
   l'interface doit le **dire**, pas la masquer.

## 2. Périmètre

### Dans le périmètre

- Un **magasin commun distinct** pour les relations inter-cerveaux, hors des
  magasins intra-cerveau, hors du catalogue, hors de `map/`.
- Un **endpoint inter-cerveaux versionné** `cek1`, résolu vers le `node_id`
  courant à la lecture.
- Le **modèle relationnel** : deux extrémités, deux cerveaux **différents**, un
  type, une provenance `DETERMINISTIC` ou `APPROVED`, et rien d'autre.
- Les **suggestions inter-cerveaux**, objet distinct, jamais comptées avant
  approbation, avec les défenses `X3` transposées **au niveau `SQLite`**.
- Le **jeu synthétique gelé `XBR-1`** : six relations déterministes, quatre
  suggestions en attente.
- Quatre commandes `map_*`, et **aucune** autre surface.
- Le **rendu inter-territoires** dans le `SVG` unique de `TASK-0019`.
- Le **panneau Relations**, qui distingue interne et inter-cerveaux, entrant et
  sortant.
- La **navigation** entre cerveaux, y compris vers un cerveau **non affiché**.
- L'**accentuation** du voisin inter-cerveaux et de son arête.
- La **persistance** au travers d'une reconstruction complète des trois index.

### Hors périmètre — et pas par oubli

- **Aucune détection automatique** de relations entre cerveaux. Les six
  relations `DETERMINISTIC` de `XBR-1` viennent de **règles nommées et
  versionnées** appliquées à un jeu **figé**; elles ne sont pas découvertes.
- **Aucune heuristique utilisateur**, aucun glisser-déposer, aucun éditeur
  manuel générique de relations.
- **Aucune révocation** — `P-04` révocation demeure, `P-21` non satisfaite.
- **Aucune recherche `P-08`**, aucun filtre, aucun watcher, aucun journal,
  aucun vu/non-vu, aucune vue sauvegardée. **`P-19` reste entière** : la
  composition demeure de session.
- **Aucune racine réelle, aucun sélecteur de dossier, aucune donnée réelle,
  aucune suppression de cerveau.**
- **Aucune IA, OCR, RAG, GraphRAG.** `DEC-0012` intacte.
- **`I-E` complète n'est pas implémentée.** `cek1` est le repli déterministe et
  se déclare comme tel : `VolumeSerialNumber`/`FileId` et les déplacements ou
  renommages réels restent hors périmètre.
- **Aucune nouvelle dépendance.** Si une s'avérait nécessaire : **`BLOCKED`
  avant installation**.
- **`B0` n'est pas corrigé.** Rien n'est supprimé dans `src-tauri/target/`.
- **Aucune campagne `H9`**, aucun seuil de performance. `R8` reste entière.

## 3. Direction produit — ce que FileTopo doit permettre

Reprise de [`DEC-0018`](../decisions/DEC-0018-explicit-interbrain-relations.md),
sans reformulation :

> Une relation inter-cerveaux relie explicitement un nœud d'un cerveau `A` à un
> nœud d'un cerveau `B`. Elle **ne fusionne jamais** les cerveaux; elle **n'est
> jamais** créée simplement parce que `A` et `B` sont affichés ensemble; elle
> respecte les **mêmes règles de provenance** que `TASK-0017`; elle **peut
> exister** même si un de ses cerveaux n'est pas actuellement affiché; et elle
> **reste persistante** indépendamment de la composition courante.
>
> **La simple ressemblance de fichiers ou de noms ne crée rien.**

---

# 4. Le gel

**Tout ce qui suit est figé avant la première ligne de code de cette tranche.**

## 4.1 Architecture de stockage — figée

Une relation `A → B` **appartient au lien entre les deux**, pas à l'un des
deux. Elle ne va donc **ni** dans le magasin privé d'Alpha, **ni** dans celui de
Gamma.

```
<bac à sable>/
  fixtures/                         sources synthétiques, lecture seule
  brains/
    catalog.sqlite                  catalogue commun — TASK-0018
    interbrain/
      relations.sqlite              ← LE MAGASIN COMMUN DE CETTE TRANCHE
    brain-alpha/
      map/index.sqlite              index dérivé, reconstructible
      relations/relations.sqlite    relations INTRA-cerveau — TASK-0017
    brain-beta/  …
    brain-gamma/ …
```

Ce fichier est, et reste :

- **dans l'espace FileTopo**, jamais dans une source analysée — `I-2`;
- **hors de `map/`**, qui est reconstructible et qu'un rebuild remplace;
- **distinct du catalogue**, qui porte l'identité des cerveaux et rien d'autre;
- **distinct des magasins intra-cerveau**, qui restent la propriété d'un seul
  cerveau.

**Un rebuild d'Alpha, de Bêta ou de Gamma ne supprime jamais ce magasin**, et
n'en modifie aucune ligne.

**Les relations intra-cerveau existantes ne sont pas fusionnées dans ce
magasin.** `TASK-0017` reste valide, son schéma reste le sien, et ses tables ne
sont ni lues ni écrites par cette tranche.

`interbrain` **n'est pas un `brain_id`** : le catalogue ne peut pas en contenir
un qui collisionnerait avec ce répertoire, et un test le tient.

## 4.2 Endpoint inter-cerveaux — figé

```
CrossBrainEndpoint
  brain_id       obligatoire, non vide
  endpoint_key   cek1|<brain_id>|<relative_path>
```

- **`brain_id` obligatoire.** Une extrémité qui ne nomme pas son cerveau est
  refusée : c'est exactement la confusion que `TASK-0018` a passé une tranche à
  rendre impossible.
- **Chemin relatif déterministe**, celui que l'index tient, séparateurs `/`.
- **Version `cek1` explicite, portée dans la clé elle-même**, et enregistrée
  dans les métadonnées du magasin : un schéma ultérieur sera une **migration**,
  jamais une réinterprétation silencieuse des lignes existantes.
- **Aucune dépendance à un `map_nodes.id`.** Un rebuild peut renuméroter toutes
  les lignes sans casser une relation.
- **Résolution vers le `node_id` courant à la lecture**, dans le cerveau que la
  clé nomme et **nulle part ailleurs**.
- **Un endpoint dont le `brain_id` est inconnu du catalogue est rejeté**, avec
  un motif nommé.

> **`cek1` n'implémente pas `I-E`.** C'est le **repli déterministe**, déclaré
> comme tel. `VolumeSerialNumber` + `FileId`, les déplacements et les
> renommages réels restent hors de cette tranche.

## 4.3 Modèle relationnel — figé

**Une relation inter-cerveaux ÉTABLIE contient obligatoirement :**

| Champ | Contrainte |
|---|---|
| `source_brain_id` | non vide |
| `source_endpoint_key` | non vide, schéma `cek1` |
| `target_brain_id` | non vide |
| `target_endpoint_key` | non vide, schéma `cek1` |
| `relation_type` | non vide, et **déclaré** : `reference` ou `revision` |
| `provenance` | **`DETERMINISTIC`** ou **`APPROVED`**, sans troisième valeur |

**`source_brain_id` DOIT être différent de `target_brain_id`.** Une relation
« inter-cerveaux » à l'intérieur d'un seul cerveau n'est pas une relation
inter-cerveaux; elle est refusée, et la contrainte est tenue **aussi** par le
schéma `SQLite`.

**Provenance :**

- **`DETERMINISTIC`** — `rule_name` **non vide** et `rule_version` **non
  vide**. Sans les deux, la relation est refusée.
- **`APPROVED`** — produite **uniquement** par l'approbation explicite d'une
  suggestion inter-cerveaux. **Aucune `rule_name`/`rule_version`
  déterministe** : la table n'a pas de colonne où elle pourrait en inventer une.

Comme dans `TASK-0017`, **il n'y a pas de colonne `provenance`** : la table dans
laquelle une ligne se trouve **est** sa provenance. C'est ce qui rend une
relation sans provenance **irreprésentable**, et non simplement interdite.

**Une suggestion est un objet distinct**, dans sa propre table, avec sa propre
clé, ses deux extrémités, son type et son état. **Elle n'est jamais comptée
comme une relation avant approbation.**

**Défenses `X3`, transposées :**

- **aucune insertion `APPROVED` parallèle** : la porte d'écriture générale
  refuse `APPROVED` inconditionnellement;
- **`suggestion_key` unique** dans la table des relations approuvées;
- **une relation approuvée doit correspondre EXACTEMENT à sa suggestion** — les
  deux cerveaux, les deux clés, le type;
- **une seconde approbation est refusée**;
- **la correspondance est défendue au niveau `SQLite`**, par des déclencheurs,
  pas seulement par la couche Rust : une garantie qui ne tient que si l'appelant
  utilise la bonne fonction n'est pas une garantie.

**Aucune relation inverse n'est jamais inventée. `A → B` n'implique jamais
`B → A`.**

## 4.4 Le jeu synthétique gelé `XBR-1`

Les **trois cerveaux synthétiques existants** et eux seuls : `brain-alpha` et
`brain-gamma` lisent `quasi-empty`, `brain-beta` lit `deep`.

**Vérification des chemins, faite avant le gel.** Chaque chemin ci-dessous a
été confronté au planificateur de fixtures figé
(`src-tauri/src/map/fixtures.rs`, `plan_quasi_empty` et `plan_deep`) :
`quasi-empty` produit `dossier-a`, `dossier-a/note-{1,2,3}.txt`, `dossier-b`,
`dossier-b/note-1.txt`, `dossier-b/sous-dossier`,
`dossier-b/sous-dossier/note-{1,2}.txt`, `racine-{1,2}.txt` — douze nœuds avec
la racine; `deep` produit, pour chaque niveau `01` à `39`, le répertoire
`niveau-NN`, deux `note-{1,2}.txt` et un répertoire `annexe` — cent
cinquante-sept nœuds avec la racine. **Les seize chemins de `XBR-1` existent
tous. Aucune substitution n'a été nécessaire, et aucune n'a été faite.**

### Relations `DETERMINISTIC` initiales — six

| Ref | Source | Cible | Type | Règle |
|---|---|---|---|---|
| `XB-D01` | Alpha `dossier-a/note-1.txt` | Gamma `dossier-b/note-1.txt` | `reference` | `cross-homonymes` `v1` |
| `XB-D02` | Gamma `dossier-a/note-2.txt` | Alpha `dossier-b/sous-dossier/note-2.txt` | `reference` | `cross-homonymes` `v1` |
| `XB-D03` | Alpha `racine-1.txt` | Bêta `niveau-01` | `reference` | `cross-root-level` `v1` |
| `XB-D04` | Bêta `niveau-01/niveau-02` | Gamma `racine-2.txt` | `reference` | `cross-root-level` `v1` |
| `XB-D05` | Gamma `dossier-a/note-3.txt` | Bêta `niveau-01/niveau-02/niveau-03/annexe` | `revision` | `cross-revision` `v1` |
| `XB-D06` | Bêta `niveau-01/niveau-02/niveau-03` | Alpha `dossier-b/sous-dossier/note-1.txt` | `revision` | `cross-revision` `v1` |

**Les trois règles sont déclarées non symétriques.** Aucune n'autorise
d'inverse, et c'est ce qui rend « aucune inverse n'est inventée » vérifiable
plutôt qu'espéré.

### Suggestions initiales — quatre, toutes `pending`

| Ref | Source | Cible | Type |
|---|---|---|---|
| `XB-S01` | Alpha `dossier-a/note-2.txt` | Gamma `dossier-a/note-2.txt` | `reference` |
| `XB-S02` | Gamma `racine-1.txt` | Alpha `racine-2.txt` | `revision` |
| `XB-S03` | Alpha `racine-2.txt` | Bêta `niveau-01/niveau-02/niveau-03/annexe` | `reference` |
| `XB-S04` | Bêta `niveau-01/niveau-02/niveau-03` | Gamma `dossier-b/note-1.txt` | `revision` |

Origine déclarée : `fixture-synthetique-task-0020`. **Aucune heuristique réelle
n'existe, et aucune n'est sous-entendue.**

### État initial, figé

| | |
|---|---|
| relations inter-cerveaux `DETERMINISTIC` | **6** |
| relations inter-cerveaux `APPROVED` | **0** |
| suggestions `pending` | **4** |

### Attendu de direction, figé — indépendant du magasin

Écrit **avant** le code, pour que `M4` compare le magasin à une table gelée
plutôt qu'à lui-même. **Comptes inter-cerveaux uniquement**, à l'état semé.

| Cerveau | Chemin | Sortantes | Entrantes |
|---|---|---|---|
| Alpha | `` (racine) | 0 | 0 |
| Alpha | `dossier-a/note-1.txt` | 1 | 0 |
| Alpha | `dossier-a/note-2.txt` | 0 | 0 |
| Alpha | `dossier-b/note-1.txt` | 0 | 0 |
| Alpha | `dossier-b/sous-dossier/note-1.txt` | 0 | 1 |
| Alpha | `dossier-b/sous-dossier/note-2.txt` | 0 | 1 |
| Alpha | `racine-1.txt` | 1 | 0 |
| Alpha | `racine-2.txt` | 0 | 0 |
| Bêta | `` (racine) | 0 | 0 |
| Bêta | `niveau-01` | 0 | 1 |
| Bêta | `niveau-01/niveau-02` | 1 | 0 |
| Bêta | `niveau-01/niveau-02/niveau-03` | 1 | 0 |
| Bêta | `niveau-01/niveau-02/niveau-03/annexe` | 0 | 1 |
| Gamma | `dossier-a/note-2.txt` | 1 | 0 |
| Gamma | `dossier-a/note-3.txt` | 1 | 0 |
| Gamma | `dossier-b/note-1.txt` | 0 | 1 |
| Gamma | `dossier-b/sous-dossier/note-1.txt` | 0 | 0 |
| Gamma | `racine-1.txt` | 0 | 0 |
| Gamma | `racine-2.txt` | 0 | 1 |

Somme : **6 sortantes, 6 entrantes**.

**Quatre lignes de cette table sont des témoins** : Alpha `dossier-b/note-1.txt`
et Gamma `dossier-b/sous-dossier/note-1.txt` portent des relations
**intra-cerveau** — `TASK-0017` leur en donne respectivement 2 sortantes / 1
entrante et 1 sortante / 3 entrantes — et **zéro** relation inter-cerveaux. Si
une relation interne était comptée comme inter-cerveaux, ou l'inverse, ces deux
lignes le diraient.

**Approuver `XB-S01` ajoute exactement une sortante à Alpha
`dossier-a/note-2.txt` et exactement une entrante à Gamma
`dossier-a/note-2.txt`, et rien d'autre.**

### Inverses interdits, figés

Aucune des dix paires suivantes n'existe, ni après le semis, ni après une
approbation, ni après un rebuild :

| Source | Cible |
|---|---|
| Gamma `dossier-b/note-1.txt` | Alpha `dossier-a/note-1.txt` |
| Alpha `dossier-b/sous-dossier/note-2.txt` | Gamma `dossier-a/note-2.txt` |
| Bêta `niveau-01` | Alpha `racine-1.txt` |
| Gamma `racine-2.txt` | Bêta `niveau-01/niveau-02` |
| Bêta `niveau-01/niveau-02/niveau-03/annexe` | Gamma `dossier-a/note-3.txt` |
| Alpha `dossier-b/sous-dossier/note-1.txt` | Bêta `niveau-01/niveau-02/niveau-03` |
| Gamma `dossier-a/note-2.txt` | Alpha `dossier-a/note-2.txt` |
| Alpha `racine-2.txt` | Gamma `racine-1.txt` |
| Bêta `niveau-01/niveau-02/niveau-03/annexe` | Alpha `racine-2.txt` |
| Gamma `dossier-b/note-1.txt` | Bêta `niveau-01/niveau-02/niveau-03` |

## 4.5 Surface d'API — figée

Quatre commandes, **toutes préfixées `map_`**, et **aucune** commande héritée :

| Commande | Ce qu'elle fait |
|---|---|
| `map_cross_relations_open` | ouvre le magasin commun, sème `XBR-1` **une fois**, renvoie tout, résolu |
| `map_cross_relations_for_node` | entrantes et sortantes **inter-cerveaux** d'un `BrainNodeRef` |
| `map_cross_relations_approve` | l'acte explicite qui transforme **une** suggestion en **une** relation |
| `map_cross_relations_self_check` | rejoue `M1`–`M5` contre le magasin vivant et **rapporte** |

- **Aucun sélecteur de dossier**, ici comme partout.
- Les commandes travaillent avec `BrainNodeRef` et l'endpoint inter-cerveaux.
- **Le magasin ne dépend jamais de la composition affichée.** Aucune de ces
  commandes ne prend la composition en argument, ne la lit, ni ne s'y adapte.

## 4.6 Rendu — figé

Quand **les deux** cerveaux d'une relation établie sont affichés, l'arête
**traverse réellement** les territoires.

- **distincte d'une arête hiérarchique** et **distincte d'une relation
  intra-cerveau**, par la forme et par le nombre de traits, pas par la teinte;
- **direction perceptible sans couleur seule** — tête de flèche pleine, et
  chevron à mi-parcours;
- **indication « inter-cerveaux » accessible et sémantique** : `<title>` en
  toutes lettres, plus `data-cross="true"` et deux `data-*-brain-id`
  **différents**;
- **provenance consultable**, en mots, dans le panneau;
- **source et cible identifiables par nom de cerveau**;
- **aucun nouveau calepinage interne**.

L'arête utilise **uniquement** : le rectangle interne tel que l'index le tient,
plus l'offset du territoire **source** pour un bout et du territoire **cible**
pour l'autre, plus la transformation globale existante. **Un panoramique ou un
zoom ne recalcule jamais un calepinage interne.**

Les **suggestions inter-cerveaux** sont distinctes des relations établies,
explicitement nommées « suggestion », ne donnent jamais l'impression d'exister
déjà, et **ne sont comptées nulle part** avant approbation.

## 4.7 Panneau Relations — figé

Pour un `BrainNodeRef` sélectionné, quatre sections nettement séparées :

```
Relations internes            Relations inter-cerveaux
  entrantes                     entrantes
  sortantes                     sortantes
```

Chaque relation inter-cerveaux montre **au minimum** : cerveau source, cerveau
cible, type, direction, provenance.

- **`DETERMINISTIC`** : règle et version consultables.
- **`APPROVED`** : l'approbation explicite est indiquée, et **aucune fausse
  règle** n'est affichée.

**Les comptes du panneau viennent du stockage**, jamais d'un incrément
optimiste. Une suggestion inter-cerveaux est dans une **zone séparée** et
n'entre dans **aucun** compte établi avant approbation.

## 4.8 Navigation — figée

**Cas 1 — cible déjà affichée.** Activer au clavier une relation
`Alpha → Gamma` : la sélection devient le `BrainNodeRef` **de Gamma**,
`focusedBrainId` devient Gamma, Gamma devient cerveau **actif** via le
catalogue, et **aucun autre nœud portant le même `node_id`** n'est sélectionné.

**Cas 2 — cible non affichée.** Le panneau montre quand même la relation, avec
l'indication en toutes lettres :

> **« Cerveau Gamma — hors de la vue »**

Activer cette relation : **1.** ajoute Gamma à la composition; **2.** respecte
l'**ordre du catalogue**; **3.** charge Gamma **sans fusion**; **4.** met le
focus sur Gamma; **5.** sélectionne **exactement** l'endpoint cible.

**Cette action est une navigation. Elle ne crée, ne modifie ni n'approuve aucune
relation.**

## 4.9 Accentuation — figée

Si les deux extrémités sont affichées et qu'un nœud est sélectionné : son
voisin inter-cerveaux **établi** est accentué, l'arête inter-cerveaux
correspondante est accentuée, les autres éléments peuvent être atténués mais
**restent visibles et lisibles**, et **pas uniquement par la couleur**.

**Une suggestion non approuvée n'est PAS accentuée comme une relation établie.**

## 4.10 Reconstruction — figée

Rebuild complet de l'index d'Alpha, puis de Gamma, puis de Bêta. Après :

- le magasin `interbrain` est **intact**;
- les **six** déterministes sont rejouées **identiquement**;
- les `APPROVED` déjà créées **persistent**;
- les suggestions et leurs états **persistent**;
- **chaque** endpoint `cek1` se résout au **nouveau** `node_id`;
- **aucune** relation ne change de cerveau;
- **aucun** endpoint non résolu.

## 4.11 Artefacts de mesure — `X5` étendue une seconde fois

`TASK-0019` est **`VERIFIED`** depuis
[`ACTION-0031`](../reviews/ACTION-0031-independent-recontrol.md). Ses **six**
preuves rejoignent la liste protégée, qui passe de **8** à **14** noms :

| Preuve protégée | Depuis |
|---|---|
| `TASK-0016-H1-H7-verification.json` | `ACTION-0026` |
| `TASK-0016-H9-webview2.json` | `ACTION-0026` |
| `TASK-0017-J11-isolation.json` | `ACTION-0027` |
| `TASK-0017-J12-webview2.json` | `ACTION-0027` |
| `TASK-0018-K11-readonly-and-isolation.json` | `ACTION-0029` |
| `TASK-0018-K12-webview2-pass1.json` | `ACTION-0029` |
| `TASK-0018-K12-webview2-pass2.json` | `ACTION-0029` |
| `TASK-0018-J12-relations-regression-webview2.json` | `ACTION-0029` |
| `TASK-0019-J12-relations-regression-webview2.json` | **`ACTION-0031`** |
| `TASK-0019-K11-readonly-regression-webview2.json` | **`ACTION-0031`** |
| `TASK-0019-K12-foundation-regression-webview2-pass1.json` | **`ACTION-0031`** |
| `TASK-0019-K12-foundation-regression-webview2-pass2.json` | **`ACTION-0031`** |
| `TASK-0019-L12-composed-view-webview2-pass1.json` | **`ACTION-0031`** |
| `TASK-0019-L12-composed-view-webview2-pass2.json` | **`ACTION-0031`** |

La protection existe **à trois endroits**, parce qu'il y a **trois** façons de
détruire une preuve :

1. **la porte Rust `write_run_artifact`** — refus **avant** tout accès disque;
2. **`src/map/runArtifacts.ts`** — un seul endroit où chaque nom s'épelle, tenu
   par `runArtifacts.test.ts`;
3. **les scripts PowerShell** — qui ne *écrivent* pas mais **suppriment** un
   artefact périmé avant un rejeu. La liste y vit désormais dans **un seul**
   fichier, `scripts/protected-run-artifacts.ps1`, dot-sourcé : deux copies
   d'une même liste finissent toujours par diverger.

**Aucun runtime `TASK-0020` ne produit un résultat sous un nom `TASK-0019`.**
**Aucune preuve historique n'est modifiée.**

Ce que cette tranche écrit :

| Artefact | Nature |
|---|---|
| `TASK-0020-M12-interbrain-relations-webview2-pass1.json` | **preuve de critère** `M12`, passe 1 |
| `TASK-0020-M12-interbrain-relations-webview2-pass2.json` | **preuve de critère** `M12`, passe 2 |
| `TASK-0020-J12-intrabrain-regression-webview2.json` | **régression** — `J12` intra-cerveau |
| `TASK-0020-L12-composed-regression-webview2-pass1.json` | **régression** — vue composée |
| `TASK-0020-L12-composed-regression-webview2-pass2.json` | **régression** — vue composée |

## 4.12 Critères gelés `M1` à `M12`

### `M1` — MODÈLE / STOCKAGE

Il est **impossible** de persister une relation inter-cerveaux établie :

- sans **deux** extrémités;
- avec le **même** `brain_id` des deux côtés;
- sans type;
- sans provenance;
- avec une provenance autre que `DETERMINISTIC` ou `APPROVED`.

Les suggestions sont **séparées**, dans leur propre table.

### `M2` — DÉTERMINISME

Les **six** relations `DETERMINISTIC` gelées existent **exactement**, ni plus
ni moins. `rule_name` et `rule_version` sont obligatoires. **Deux rejeux donnent
exactement le même digest.** **Aucune inverse n'est inventée.**

### `M3` — APPROBATION / `X3`

`XB-S01` `pending` → approbation explicite → **exactement UNE** relation
`APPROVED` correspondante.

`XB-S01` **ne compte pas** avant; elle **compte** après.

Sont **rejetées** : une insertion `APPROVED` directe; des extrémités erronées
présentées avec la même suggestion; une **seconde** approbation.

### `M4` — DIRECTION / COMPTES

Pour **tous** les endpoints de `XBR-1`, les entrantes et sortantes **observées**
égalent les **attentes indépendantes** de §4.4.

**Aucune relation interne n'est comptée comme inter-cerveaux, et
inversement** — les quatre témoins de la table le disent.

### `M5` — PERSISTANCE / REBUILD

Après un rebuild d'Alpha, de Gamma et de Bêta : déterministes **identiques**,
`APPROVED` **persistantes**, suggestions **persistantes**, endpoints **tous
résolus**, magasin `interbrain` **non supprimé**.

### `M6` — RENDU INTER-TERRITOIRES

Dans `C2` et `C3` : les relations inter-cerveaux sont **visibles entre
territoires**; **0** relation inter-cerveaux dessinée dans le mauvais cerveau;
la **direction** ne repose pas sur la couleur; la différence **intra / inter**
ne repose pas sur la couleur; la **géométrie interne est inchangée**.

### `M7` — PANNEAU

Le panneau distingue **interne / inter-cerveaux** et **entrant / sortant**.
Chaque relation inter-cerveaux expose : **cerveau source, cerveau cible, type,
provenance**.

### `M8` — NAVIGATION AFFICHÉE

Une **vraie activation clavier** d'une relation inter-cerveaux dont la cible est
affichée sélectionne **exactement** l'autre `BrainNodeRef` et met le focus sur
le cerveau cible.

### `M9` — NAVIGATION HORS VUE

Avec **Alpha seul**, une relation `Alpha → Gamma` **reste visible** dans le
panneau, marquée « cible hors de la vue ». Une activation **réelle au clavier**
ajoute Gamma, produit `C2`, sélectionne l'endpoint de Gamma, et met Gamma en
focus **et** actif.

### `M10` — SUGGESTION

`XB-S01` est **visuellement et sémantiquement** une suggestion : **pas d'arête
établie**, **aucun compte** avant approbation.

Après approbation : elle devient **`APPROVED`**, le compte établi bouge de
**+1 exactement**, l'arête établie apparaît, la provenance est `APPROVED`, et
**aucune règle déterministe n'est inventée**.

### `M11` — SÉCURITÉ / HISTORIQUE

Sources synthétiques **inchangées**; **aucun** artefact FileTopo dans leurs
racines; **aucun** sélecteur de dossier; **aucune** donnée réelle; `X2`, `X3`,
`X4`, `X5`, `X6` restent **`PASS`**; les preuves `VERIFIED` de `TASK-0016`,
`TASK-0017`, `TASK-0018` et `TASK-0019` sont **inchangées**; les nouveaux
artefacts appartiennent **uniquement** à `TASK-0020`; `main` est **intacte**.

### `M12` — HÔTE RÉEL

Dans un **vrai Tauri/WebView2**, avec `FILETOPO_SANDBOX_VARIANT` sur un variant
**NEUF** propre à `TASK-0020`. **Aucune suppression, nulle part.**

**Passe 1 :**

| # | Étape |
|---|---|
| 1 | Alpha actif, composition **Alpha seul** |
| 2 | vérifier les **six** déterministes inter-cerveaux dans le magasin |
| 3 | ajouter Gamma par **vraie frappe** → `C2` |
| 4 | vérifier **au moins une** arête `Alpha → Gamma` traversant les territoires |
| 5 | sélectionner la **source** de `XB-D01` |
| 6 | vérifier le panneau : interne **séparé** de inter-cerveaux, entrantes/sortantes, cerveau source/cible, type, provenance, règle/version |
| 7 | activer `XB-D01` par **vraie frappe clavier** |
| 8 | vérifier la sélection **exacte** dans Gamma, et Gamma focused **et** actif |
| 9 | revenir sur Alpha |
| 10 | vérifier `XB-S01` `pending` et **NON comptée** |
| 11 | approuver `XB-S01` par **vraie frappe réelle** |
| 12 | vérifier Alpha/Gamma : relation `APPROVED` **exacte**, **+1** établi, suggestion `pending` disparue, arête établie visible |
| 13 | retirer Gamma de la vue |
| 14 | Alpha seul : sélectionner une source d'une relation vers Gamma |
| 15 | vérifier **« Gamma — hors de la vue »** |
| 16 | activer la relation par **vraie frappe** |
| 17 | vérifier Gamma ajouté automatiquement, cible sélectionnée, Gamma focused |
| 18 | ajouter Bêta → `C3` |
| 19 | vérifier les relations Alpha/Bêta et Bêta/Gamma |
| 20 | vérifier **aucune** relation inverse inventée |
| 21 | rebuild Alpha, Gamma, Bêta |
| 22 | vérifier `APPROVED` + suggestions + déterministes **persistantes et résolues** |
| 23 | fermer **réellement** |

**Passe 2, même variant, nouveau processus :**

| # | Étape |
|---|---|
| 24 | confirmer le magasin `interbrain` **persistant** |
| 25 | confirmer `XB-S01` **`APPROVED`** |
| 26 | confirmer les **six** déterministes **identiques** |
| 27 | **aucune** composition multiple revendiquée persistante |
| 28 | **aucune** preuve historique modifiée |

**Vraies frappes**, pour toutes les actions clavier probantes :
`keydownIsTrusted = true`, `activationIsTrusted = true`, **0** `click()`
programmatique, **0** `dispatchEvent(click)`.

**Publie :**

- `TASK-0020-M12-interbrain-relations-webview2-pass1.json`
- `TASK-0020-M12-interbrain-relations-webview2-pass2.json`

## 4.13 Régressions dues — figées

Le panneau Relations et `MapView` sont touchés. Sont donc **rejoués après
implémentation**, sur des **variants frais** :

1. `J12` intra-cerveau, sous un **nouveau** nom :
   `TASK-0020-J12-intrabrain-regression-webview2.json`
2. la vue composée `L12`, sous de **nouveaux** noms :
   `TASK-0020-L12-composed-regression-webview2-pass{1,2}.json`

**`TASK-0019` n'est jamais réécrite.** Pas de rejeu `H9`. Aucun seuil de
performance.

## 5. Validation attendue

- **tous** les tests Rust;
- **tous** les tests TypeScript;
- `pnpm check`, `pnpm build`;
- build Tauri `debug --no-bundle`;
- tests **négatifs** `M1`, `M2`, `M3`;
- comptes `M4`; rebuild `M5`; rendu inter-territoires `M6`; panneau `M7`;
  clavier `M8` et `M9`; suggestion `M10`;
- `X2`, `X3`, `X4`, `X5`, `X6`;
- régression `J12` intra; régression `L12` composée;
- **`M12` en deux passes dans le vrai `WebView2`**.

**Aucune campagne `H9`.**

**`TASK-0020` se termine `IMPLEMENTED`, jamais `VERIFIED`.** L'exécuteur ne
s'auto-vérifie pas.

## Historique d'état

| Date | État | Motif |
|---|---|---|
| 2026-09-02 | `PROPOSED` | Fiche créée sous `DEC-0018`, fonction `F-041` |
| 2026-09-02 | `APPROVED` | GO technique de l'orchestrateur, périmètre écrit en §2 et §3 |

---

# 7. Résultat

## 7.1 Ce qui a été livré

**FileTopo sait relier deux cerveaux sans les fusionner.** Le magasin commun
`brains/interbrain/relations.sqlite` porte six relations `DETERMINISTIC`,
quatre suggestions et, après approbation, une relation `APPROVED` — et il
survit à une reconstruction complète des trois index sans qu'une seule
extrémité casse.

**Le gel a été commité en `7746fd4`, avant la première ligne de code** de la
tranche. **Aucun critère `M1`–`M12` n'a été retouché après le premier
résultat.**

## 7.2 Les douze critères

| Critère | Verdict | Preuve |
|---|---|---|
| `M1` — modèle / stockage | **TENU** | 9 tentatives invalides, 9 refus nommés; `CHECK(source_brain_id <> target_brain_id)` attaqué **en contournant Rust**; pas de colonne `provenance` |
| `M2` — déterminisme | **TENU** | 6 relations exactement, règle et version obligatoires, digest `fnv1a64:3020af7489aab581` **identique** sur deux rejeux; 0 inverse |
| `M3` — approbation / `X3` | **TENU** | `XB-S01` `pending` → **une** relation `APPROVED`; insertion directe, mauvaises extrémités et seconde approbation **refusées**, y compris au niveau `SQLite` |
| `M4` — direction / comptes | **TENU** | 19 extrémités contre l'attendu **gelé**, deux requêtes séparées; les 4 témoins à `0`/`0` |
| `M5` — persistance / rebuild | **TENU** | rebuild Alpha → Gamma → Bêta : magasin intact, digest inchangé, `APPROVED` et suggestions persistantes, **0 extrémité non résolue** |
| `M6` — rendu inter-territoires | **TENU** | 10 arêtes en `C3` sur 6 paires ordonnées, **0** dessinée dans un seul cerveau; trait doublé, tête + chevron, `<title>` en toutes lettres |
| `M7` — panneau | **TENU** | deux sections, deux totaux, **deux espaces de noms `CSS` disjoints** : 4 entrées internes, 1 inter-cerveaux |
| `M8` — navigation affichée | **TENU** | vraie frappe → `brain-gamma-map-node-9` sélectionné, Gamma focused **et** actif, **1** seul nœud sélectionné |
| `M9` — navigation hors vue | **TENU** | « hors de la vue » en mots; vraie frappe → Gamma ajouté, ordre catalogue, endpoint exact, **rien créé** (digest inchangé) |
| `M10` — suggestion | **TENU** | non comptée avant, **+1 exactement** après, `APPROVED`, **aucune règle inventée**, arête établie apparue |
| `M11` — sécurité / historique | **TENU** | 12 et 157 entrées dans les racines, **0 artefact FileTopo**; les **14** preuves protégées **inchangées**; `main` intacte |
| `M12` — hôte réel | **TENU** | deux passes, `WebView2 152.0.4191.53`, variant neuf, redémarrage réel; **aucun indicateur faux dans tout l'arbre de preuve** |

## 7.3 Ce que le vrai hôte a mesuré

Variant neuf `task0020-m12-20260902134545-ac5cd8`, deux processus, fermeture et
redémarrage réels.

**Vraies frappes aux étapes 3, 7, 11, 16 et 18 :** `keydownIsTrusted: true`,
`activationIsTrusted: true`, **0** `click()` programmatique, **0**
`dispatchEvent(click)`.

| Étape | Ce qui a été observé |
|---|---|
| 2 | 6 déterministes, 0 approuvée, 4 en attente, dans `brains/interbrain/relations.sqlite` |
| 4 | 4 arêtes inter-cerveaux en `C2`, dont 2 `Alpha → Gamma`; 32 arêtes intra, **0** sortie de territoire |
| 6 | interne `3 sortante(s) · 1 entrante(s)` **≠** inter-cerveaux `1 sortante(s) · 0 entrante(s)` |
| 12 | approuvées `0 → 1`, en attente `4 → 3`, provenance `APPROVED`, `ruleName: null` |
| 19 | 10 arêtes sur **6 paires ordonnées**, `0` dessinée dans un seul cerveau |
| 22 | après rebuild : digest **identique**, `APPROVED` survit, `0` extrémité non résolue |
| 24–28 | après redémarrage : magasin persistant, `XB-S01` toujours `APPROVED`, 6 déterministes identiques, **composition Gamma seul** |

## 7.4 Deux défauts trouvés par la mesure, et corrigés

**Le rejeu a servi à quelque chose, et cela se dit.**

1. **Les classes `CSS` partagées contaminaient deux mesures antérieures.** Le
   panneau inter-cerveaux portait `relation__link`, et ses arêtes `map-edge`.
   Le scénario `J12` compte `.relations__direction .relation__link` sur tout le
   document, et `L12` compte `.map-edge` : les deux se sont mis à compter des
   éléments qui ne les regardaient pas — `J12` a publié un panneau « non
   stabilisé » et `L12` un `everyEdgeStaysInOneBrain: false` **alors que rien
   n'était cassé**. C'est la même faute qu'un `id` `DOM` pour deux cerveaux,
   sous un autre habit. **Corrigé à la source** : le panneau et les arêtes
   inter-cerveaux ont leur **propre espace de noms**, ne partagent **aucun**
   nom de classe dans le balisage, et partagent leur style par la feuille de
   style. Deux tests le tiennent.
2. **Un contrôle `DOM` capturé avant un `await` peut être remplacé par un
   re-rendu.** L'étape 16 a échoué une fois exactement ainsi : le bouton lu à
   l'étape 14 était détaché, la frappe est partie dans le vide. Corrigé :
   le contrôle est **re-interrogé à l'instant où il est pressé**.

Deux autres écarts, plus petits, venaient aussi de la mesure : le message de
navigation était effacé par le rechargement qu'il décrit — il est désormais
posé **après** —, et l'étape 12 lisait le panneau entre deux rendus.

## 7.5 Régressions rejouées

| Rejeu | Résultat |
|---|---|
| `TASK-0020-J12-intrabrain-regression-webview2.json` | **PASS** — panneau stabilisé en 22 ms, 4 entrées, 2 sections, frappe réelle `isTrusted`, approbation `3 → 4`, `countsAgree`, 0 inverse |
| `TASK-0020-L12-composed-regression-webview2-pass{1,2}.json` | **PASS** — `L8` retrouvé exact : 32 arêtes intra, **0** traversante; la couche inter-cerveaux est déclarée **à côté**, pas fondue dedans |

**`TASK-0019` n'a pas été réécrite.** Les 14 preuves protégées sont
**inchangées**.

## 7.6 Ce qui n'a pas été fait, et se déclare tel

- **Aucune campagne `H9`**, aucun seuil, aucune mesure de performance. `R8`
  reste entière.
- **Aucune détection automatique** entre cerveaux; les six relations viennent
  de règles **nommées et versionnées** appliquées à un jeu **figé**.
- **`I-E` complète non implémentée.** `cek1` est le repli déterministe :
  `VolumeSerialNumber`/`FileId`, déplacements et renommages réels restent hors
  périmètre. **Un déplacement réel casserait une extrémité**, et rien ici ne
  prétend le contraire.
- **Aucune révocation** — `P-21` demeure. **Aucune persistance de vue
  composée** — `P-19` entière, confirmée à l'étape 27.
- **`K11`/`L11` n'a pas été rejoué** : son code fonctionnel n'a pas changé.
  Déclaré tel, pas supposé. L'absence d'artefact FileTopo dans les racines a
  été vérifiée **directement sur le bac à sable de la preuve** — 12 et 157
  entrées, aucun `.sqlite`, `.json` ni fichier `filetopo`.
- **`B0` n'est pas corrigé**; rien n'a été supprimé dans `src-tauri/target/`.
  `CARGO_INCREMENTAL=0` a été utilisé, qui **ne supprime rien**.
- **Une seule machine, un seul runtime `WebView2`.**

**`TASK-0020` est livrée `IMPLEMENTED`. L'exécuteur ne s'attribue pas
`VERIFIED`.**
| 2026-09-02 | `IMPLEMENTED` | Tranche livrée; `M1`–`M12` tenus, `M12` en deux passes dans le vrai `WebView2`. **`VERIFIED` non attribué** — contrôle indépendant attendu |
