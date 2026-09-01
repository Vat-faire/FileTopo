# DEC-0017 — FileTopo est multi-cerveaux, et une vue peut en composer plusieurs

- **Date :** 2026-09-01
- **Statut :** `APPROVED`
- **Phase :** étape **A** de la feuille de route — parité fonctionnelle MVP,
  ouverture de la **fondation multi-cerveaux**
- **Décideur :** **Sébastien**, direction produit, relayée par l'orchestrateur
  technique dans le prompt d'ouverture de `TASK-0018`. **La direction produit
  n'est pas déléguée** : les points 1 à 12 ci-dessous sont une décision
  **produit**, pas un arbitrage technique.
- **Rédacteur de la fiche :** Claude Code, **exécuteur**. **Cette fiche
  enregistre une décision; elle ne la prend pas.**
- **Fondée sur :** [DEC-0011](DEC-0011-brain-isolation-and-migrations.md)
  (isolation et migrations), [DEC-0009](DEC-0009-data-model-and-relations.md)
  (provenance des relations), la correction normative `X1` de
  [DEC-0016](DEC-0016-p4-gate-crossing-and-first-slice.md), et l'exigence de
  parité `P-20` de
  [CARTETOPO_FUNCTIONAL_PARITY.md](../product/CARTETOPO_FUNCTIONAL_PARITY.md)
- **replaced_by :** —
- **Supplante :** rien. Elle **généralise** `P-20` sans en affaiblir
  l'exigence d'isolation, et **n'affaiblit aucune** des décisions ci-dessus.

> **Cette fiche ne mesure rien, n'exécute rien et ne lève aucune réserve.**
>
> **Elle ne change pas les invariants `I-1`, `I-2`, `I-3`.**
>
> **Elle ne rend `P-20` ni plus facile ni plus permissive.** Une vue composée
> est un mode d'**affichage**; elle n'est jamais une dérogation à l'isolation.

## Contexte

`TASK-0016` et `TASK-0017` ont livré une carte et des relations pour **une
fixture à la fois**. Dans ce code, l'identité d'un cerveau et l'identité de sa
**source** sont la même chaîne : `fixture_id`. C'était acceptable pour deux
tranches qui n'avaient qu'une source par carte, et c'est **structurellement
faux** dès que deux cerveaux peuvent partager une source.

`P-20` exige déjà plusieurs cerveaux indépendants. La direction produit va plus
loin : une **vue** de FileTopo devra pouvoir montrer **plusieurs cerveaux dans
le même graphique**, sans jamais les fusionner.

Cette fiche fixe ce que cela veut dire, avant qu'une ligne de code ne le
suppose.

## Décision

### 1. FileTopo est une application MULTI-CERVEAUX

Ce n'est pas une extension optionnelle : c'est la forme du produit.

### 2. Un cerveau est une unité indépendante

Un cerveau possède, **en propre et sans partage** :

- une **identité** — `brain_id`, une identité **FileTopo**, distincte de sa
  source;
- une **source / racine**;
- un **index**;
- des **relations**;
- un **état**;
- un **nom**, une **couleur** et une **icône**.

### 3. Le mode normal affiche UN cerveau actif

Un cerveau actif à la fois, et c'est le mode par défaut.

### 4. Une vue composée pourra contenir un ou plusieurs cerveaux

FileTopo devra aussi permettre une **vue composée** contenant **un ou
plusieurs** cerveaux dans **le même graphique**.

### 5. Une vue composée NE FUSIONNE JAMAIS les cerveaux

Elle **compose leur affichage**, et rien d'autre. Aucun index n'est joint,
aucun magasin de relations n'est réuni, aucun état n'est mêlé.

### 6. Composer ne modifie aucune donnée

Ajouter ou retirer un cerveau d'une vue ne modifie **aucune donnée** du
cerveau : ni son index, ni ses relations, ni son état, ni ses métadonnées.

### 7. Une relation inter-cerveaux est possible, mais explicite

Elle peut exister **uniquement** comme relation **explicite**, respectant le
**même modèle de provenance** que `TASK-0017` : `DETERMINISTIC` ou `APPROVED`,
sans troisième valeur, et une **suggestion n'est pas une relation** —
correction `X1`, inchangée.

### 8. Afficher ensemble ne crée jamais une relation

Le simple fait d'afficher deux cerveaux dans la même vue **ne crée jamais**
une relation entre eux. La coprésence à l'écran n'est pas une donnée.

### 9. Toute origine est non ambiguë

Chaque élément affiché dans une vue composée doit **toujours** porter une
**origine de cerveau non ambiguë**. Un élément dont on ne sait pas de quel
cerveau il vient est un défaut, pas une imprécision.

### 10. Ce que l'utilisateur devra pouvoir faire

- créer / ajouter plusieurs cerveaux;
- changer rapidement de cerveau;
- gérer leur nom, leur couleur et leur icône;
- ajouter plusieurs cerveaux à une même vue;
- retirer un cerveau d'une vue **sans le supprimer**;
- éventuellement **sauvegarder des compositions de vues**.

### 11. Supprimer un cerveau ne supprime jamais sa source

Supprimer un cerveau de FileTopo **ne supprime jamais** sa racine ni sa source.
Toute suppression de cerveau sera une **action distincte et confirmée**.

### 12. La couleur n'est jamais le seul identifiant

La couleur ne sera **jamais** le seul moyen d'identifier un cerveau : le
**nom**, la **structure / le territoire** et/ou l'**icône** doivent aussi
l'identifier. Même exigence d'esprit que `P-06` et `J9`, appliquée à
l'identité des cerveaux.

## Gestion des cerveaux — décidée ici, implémentée plus tard

Les quatre actions suivantes sont **décidées** par cette fiche et **ne sont pas
implémentées par `TASK-0018`** :

| Action | Ce qu'elle fait | Ce qu'elle ne fait jamais |
|---|---|---|
| **Ajouter un cerveau** | Crée une entrée de catalogue avec sa propre identité et sa propre source | Ne lit ni n'écrit hors de la source déclarée |
| **Gérer les cerveaux** | Modifie nom, couleur, icône, ordre | Ne touche jamais à l'index ni aux relations |
| **Retirer un cerveau d'une vue** | Retire son affichage de la composition | Ne supprime **rien** |
| **Supprimer un cerveau FileTopo** | Retire le cerveau et son espace de données FileTopo | **Ne touche jamais à sa racine ni à sa source** |

`TASK-0018` **prépare le catalogue** à les supporter et **ne simule pas** un
ajout utilisateur avec une fixture comme si c'était le produit final.

**L'ouverture d'une vraie racine et le flux « Nouveau cerveau » seront une
tranche distincte**, autorisée d'abord **sur données synthétiques**, avant
toute exposition à des données réelles — laquelle reste un **point d'arrêt
réservé à Sébastien**. **Aucun sélecteur de dossier n'est remis dans le
runtime**, et la réserve `X2` reste close et respectée.

## Ce que cette décision ajoute au modèle produit

Une fonction, et une seule :

**`F-040` — Vue composée multi-cerveaux.** Classification : **`MVP`**.

> Une vue FileTopo peut contenir un ou plusieurs cerveaux indépendants,
> affichés ensemble **sans fusion** de leurs stockages ni de leurs états.

Répartition du modèle produit après ajout : **`MVP` 36**, **`ULTÉRIEUR` 0**,
**`DIFFÉRÉ` 4**, **total 40**.

**`P-20` reste une exigence de parité, entière.** `F-040` est une **extension
produit autorisée**, **pas** une modification silencieuse du contrat CarteTopo :
le contrat de parité conserve ses 22 exigences et n'est pas retouché.

## Séquence technique décidée

| Tâche | Objet | Portée |
|---|---|---|
| **`TASK-0018`** | **Fondation multi-cerveaux + bascule** | Catalogue, identité, isolation réelle, un cerveau actif, bascule complète |
| **`TASK-0019`** | **Vue composée multi-cerveaux** | Plusieurs cerveaux dans le même graphique, sans fusion |
| **`TASK-0020`** | **Relations inter-cerveaux** | Relation explicite entre deux cerveaux, même modèle de provenance |

**`TASK-0018` n'implémente QUE la première ligne.** Elle n'affiche jamais deux
cerveaux dans le même graphique et ne crée aucune relation inter-cerveaux.

## Alternatives écartées

**Garder `fixture_id` comme identité de cerveau.** Écartée : deux cerveaux
peuvent légitimement partager une source, et le produit final aura des racines
utilisateur qu'un identifiant de fixture ne peut pas nommer. Confondre
l'identité et la source rend l'isolation invérifiable — c'est exactement ce que
`K3` de `TASK-0018` va mesurer.

**Un magasin unique portant une colonne `brain_id`.** Écartée : c'est le même
défaut de famille que `X3` et `X2` — juger ce que le code *appelle* plutôt que
ce que le stockage *permet*. Une colonne s'oublie dans une clause `WHERE`; un
fichier distinct ne s'oublie pas. `DEC-0011` `S-C` est conservée : petit
catalogue commun pour l'état non reconstructible du cerveau, **index dérivé
séparé par cerveau**, **relations et état séparés par cerveau**.

**Fusionner les cerveaux dans une vue composée.** Écartée par la direction
produit, points 5 et 8.

## Conséquences

- **Le code de carte ne doit plus traiter `fixture_id` comme l'identité d'un
  cerveau.** C'est une **source**, et rien d'autre.
- **Une opération publique du runtime portant sur une carte ou une relation est
  scoped par `brain_id`.** Le backend résout ensuite `brain_id` → source.
- **Un `node_id` seul n'est jamais une identité globale.** La frontière
  logique est **`BrainNodeRef = brain_id + node_id`**.
- **`ek1` n'est pas déclaré globalement unique entre cerveaux.** Il reste
  interne à la tranche, et le magasin est **physiquement** scoped par
  `brain_id`.
- **Aucune migration de données utilisateur** n'est due : il n'en existe
  aucune.
- **Les invariants `I-1`, `I-2`, `I-3` sont inchangés**, et le restent.

## Preuves

**Aucune.** Cette fiche est une **décision produit**, pas un résultat. Elle
n'est appuyée sur aucune mesure et n'en revendique aucune.

Ce qui sera prouvé le sera par `TASK-0018`, sur ses critères `K1` à `K12`
**gelés avant tout code**, et jugé par un **contrôle indépendant**.
