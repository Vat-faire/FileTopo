# DEC-0024 — deterministic layered node-card layout

- **Date :** 2026-09-03
- **Statut :** `IMPLEMENTED` par `TASK-0022`, contrôle indépendant attendu
- **Nom versionné :** `layered-tree-cards-v1`
- **Portée :** `TASK-0022`, première tranche d'implémentation post-réalignement
- **Autorité :** GO technique explicite de l'orchestrateur dans le prompt
  `TASK-0022` du 2026-09-03, sous la direction produit déjà enregistrée par
  [`DEC-0020`](DEC-0020-topographic-node-graph.md)
- **Dépendances :** aucune nouvelle dépendance Rust ou JavaScript
- **Remplace :** la représentation principale reconstructible
  `squarified-min-area-v1`; ne supprime pas `CAL-B` comme primitive historique
  ou éventuelle vue secondaire

## Décision

La représentation principale de FileTopo emploie un graphe hiérarchique
déterministe de type tidy/layered tree, orienté **gauche vers droite**. Chaque
nœud est une carte indépendante et chaque parent/enfant est relié par une
arête hiérarchique explicite.

L'algorithme est nommé et persisté exactement :

```text
layered-tree-cards-v1
```

Ce nom est versionné pour permettre un remplacement futur explicite. Cette
décision ne prétend pas que l'algorithme est définitif pour toujours.

## Géométrie v1

Constantes exactes, en unités du monde :

```text
CARD_WIDTH  = 240.0
CARD_HEIGHT = 64.0
COLUMN_GAP  = 120.0
ROW_GAP     = 28.0
```

Toutes les cartes ont la même boîte. Le texte ne modifie jamais leur largeur,
leur hauteur ni leur placement.

Pour un nœud de profondeur `d` :

```text
x = d * (CARD_WIDTH + COLUMN_GAP)
```

Le parent n'englobe jamais l'enfant. L'ordre vertical conserve exactement
l'ordre déterministe fourni par le scan/index : aucun tri par taille, aucune
renumérotation, aucun poids fondé sur `size_bytes`, aucune heuristique aléatoire.

## Algorithme exact

La table `parent -> children` est construite en O(n), dans l'ordre d'entrée.

**Passe 1, bottom-up :**

```text
feuille : subtree_span = CARD_HEIGHT

parent : subtree_span = max(
  CARD_HEIGHT,
  somme(subtree_span(enfant)) + ROW_GAP * (nombre_enfants - 1)
)
```

**Passe 2, top-down :** chaque sous-arbre reçoit un intervalle vertical. Les
enfants occupent successivement cet intervalle, dans leur ordre déterministe.
Une feuille centre sa carte dans son intervalle. Un parent avec plusieurs
enfants est centré entre le centre de son premier enfant direct et celui de son
dernier enfant direct. Avec un seul enfant, les deux centres sont identiques.

Pour un arbre non vide :

```text
layout_width  = (max_depth + 1) * CARD_WIDTH + max_depth * COLUMN_GAP
layout_height = subtree_span(root)
```

Le résultat doit rester fini, positif pour un arbre non vide, sans NaN, Inf,
dimension négative ni `-0` significatif. Un cerveau valide possède exactement
une racine. Le monde grandit; les cartes ne sont jamais réduites pour faire
tenir un grand arbre.

Le calcul utilise un nombre borné de parcours O(n). Il n'exécute aucun solveur
de collision O(n²), aucune relaxation physique, aucune convergence asynchrone,
aucun recalcul par frame, pan, zoom, sélection, panneau, accentuation ou
translation de territoire. `layout_invocations = 1` par build/rebuild.

## Arêtes hiérarchiques

Chaque nœud non racine produit exactement une arête du parent réel vers
l'enfant réel, soit `node_count - 1` pour un arbre valide.

Le chemin orthogonal part du centre du bord droit du parent, va jusqu'à
`midpointX`, descend ou monte jusqu'au centre vertical de l'enfant, puis rejoint
le centre du bord gauche de l'enfant :

```text
midpointX = (parentRightX + childLeftX) / 2
```

Cette arête est une famille graphique propre : sous les cartes, discrète,
orthogonale, `vector-effect="non-scaling-stroke"`, distincte des relations
établies, suggestions et relations inter-cerveaux. Elle n'est jamais persistée
comme `RelationEdge` et n'entre dans aucun compteur relationnel.

## Options examinées

### A — treemap imbriqué comme vue principale

**Rejeté.** Il contredit `DEC-0020` et `P02-R1` : la cible principale est une
topographie à nœuds/cartes et connexions explicites.

### B — force-directed libre

**Rejeté pour cette tranche.** Instabilité, croisements difficiles à contrôler,
dépendance à une convergence, positions moins reproductibles et mauvaise base
pour une hiérarchie documentaire.

### C — Dagre, ELK, Graphviz, Cytoscape ou autre bibliothèque externe

**Non retenu pour v1.** L'entrée est un arbre pur, l'algorithme local est
suffisamment défini, linéaire et compatible SVG. Une dépendance supplémentaire
n'est pas justifiée.

### D — `layered-tree-cards-v1`

**Retenu.** La profondeur devient une colonne directement perceptible; chaque
fichier/dossier reste une carte indépendante; l'ordre et le résultat sont
stables; l'approche est compatible SVG, pan/zoom, multi-cerveaux, relations
intra/inter-cerveaux et avec une future `F-042` sans l'implémenter maintenant.

## Compatibilité et persistance

Le sens de `rect_x`, `rect_y`, `rect_w`, `rect_h` change. Le schéma de carte
passe de 2 à 3 et persiste `layout_algorithm = layered-tree-cards-v1`.

Un index v1/v2 ou portant un autre algorithme n'est jamais servi comme v3. Il
est considéré reconstructible et rebâti depuis la source synthétique en lecture
seule. Le rebuild ne touche ni au catalogue, ni à l'identité des cerveaux, ni
aux relations intra/inter-cerveaux, ni aux approbations, suggestions ou autres
états non reconstructibles. `NON_RECONSTRUCTIBLE_KEYS` reste exact et honnête.

## Conséquences

- `MapSnapshot` et `MapBuildReport` exposent l'algorithme réellement lu/écrit
  par le backend.
- Le rendu principal peut prouver une carte indépendante par nœud et une arête
  parent/enfant exacte.
- Les relations existantes changent uniquement de projection graphique : leurs
  extrémités sont ancrées bord à bord, sans changement de store ni de modèle.
- La composition multi-cerveaux reste une translation de territoires.
- `F-042` (repli, focus, clustering, virtualisation, zoom sémantique) reste hors
  périmètre.

## Preuves attendues

Les preuves appartiennent à `TASK-0022`: tests Rust et TypeScript, contrôles
`N1` à `N14`, scénario réel Tauri/WebView2 `N15` en deux passes, et régressions
`J12`, `K11`, `L12`, `M12` sous huit nouveaux noms `TASK-0022-*`. Elles ont été
exécutées le 2026-09-03; l'attribution `VERIFIED` reste réservée au contrôle
indépendant.
