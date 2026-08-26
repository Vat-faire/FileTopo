# DEC-0005 — Rendu cartographique et modèle de relief

- **Date :** 2026-08-25
- **Statut :** `VERIFIED`
- **Phase :** 2
- **Décideur :** orchestrateur, sous l'autorisation permanente du 2026-08-25
- **replaced_by :** —

## Contexte

La carte doit rester fluide avec un index pouvant atteindre un million
d'éléments, tout en étant utilisable au clavier et avec un lecteur d'écran.
Afficher un objet graphique par fichier est exclu à cette échelle.

## Options examinées

| Option | Avantages | Inconvénients |
|--------|-----------|---------------|
| SVG/DOM | Accessibilité et inspection natives | Trop d'éléments DOM; interaction lourde à grand volume |
| Canvas 2D maison | Contrôle simple, peu de dépendances | Fallback/accélération variables; batching et interaction à construire |
| PixiJS 8 / WebGL | Moteur 2D GPU, batching, scène, interaction, accessibilité DOM optionnelle | Canvas fallback annoncé mais non disponible; nécessite une couche sémantique séparée |
| WebGPU maison | Potentiel futur élevé | Implémentation et compatibilité encore plus risquées; Pixi le qualifie encore d'expérimental |

## Décision

Rendu principal avec **PixiJS 8 sur WebGL/WebGL2**. WebGPU reste une option
expérimentale désactivée par défaut. Un mode DOM parallèle — arbre/liste
virtuelle, recherche et fiche de sélection — est la représentation
sémantique autoritative pour clavier et lecteurs d'écran. Les objets Pixi
accessibles sont limités aux éléments sélectionnables visibles, jamais à un
million d'overlays DOM.

## Stratégie multi-échelle

- L'index complet reste dans SQLite/Rust.
- Le frontend demande des **tuiles logiques** par fenêtre, zoom, filtres et
  révision.
- Chaque tuile contient des agrégats ou feuilles visibles, plafonnés à
  50 000 primitives simultanées; cible normale : 5 000 à 20 000.
- Les niveaux éloignés affichent collections, grands dossiers et agrégats;
  les fichiers individuels apparaissent seulement à un zoom suffisant.
- Culling spatial, batching par type/couleur, textures minimales, pas de filtre
  GPU par nœud, textes dynamiques bornés.
- Le picking utilise un index spatial côté frontend pour le visible et une
  résolution autoritative côté Rust au besoin.

## Géographie stable

1. Chaque collection forme un continent.
2. Chaque dossier forme un territoire imbriqué, disposé par un treemap
   déterministe et stable.
3. Les fichiers/agrégats forment des sites dans leur territoire, positionnés
   par hash versionné de clé stable afin de limiter les déplacements visuels.
4. Une modification recalcule d'abord le sous-arbre affecté; un changement de
   version d'algorithme déclenche un nouveau `layout_version` reconstructible.

## Relief

Le relief n'est **jamais** la taille brute du fichier. L'élévation normalisée
par territoire est une combinaison versionnée et explicable :

| Signal | Poids initial | Interprétation |
|--------|--------------:|----------------|
| Nombre logarithmique de descendants | 30 % | Masse structurelle |
| Récence de modification, décroissance bornée | 20 % | Activité récente |
| Diversité de types | 15 % | Variété documentaire |
| Centralité structurelle / liens locaux disponibles | 15 % | Rôle de carrefour |
| Attention locale (vu/non vu, épinglé), privée | 15 % | Pertinence pour l'utilisateur |
| Taille logarithmique plafonnée | 5 % | Empreinte, sans dominer la carte |

Les poids sont configurables dans une plage sûre et affichés dans une légende.
Les signaux absents sont redistribués proportionnellement. Un champ scalaire
est construit à partir des sites agrégés; lissage déterministe, courbes de
niveau par marching squares et ombrage léger créent le relief. Les calculs
lourds se font dans Rust et se mettent en cache par tuile/version.

## Accessibilité et réduction de mouvement

- Navigation clavier indépendante du canvas : collection → territoire →
  élément, avec fil d'Ariane et commande « centrer sur la sélection ».
- Liste virtuelle synchronisée à la carte, libellés FR/EN et annonces d'état.
- Palette testée pour contraste, motifs/contours en plus de la couleur.
- Mode relief plat, contraste élevé et `prefers-reduced-motion` respecté.
- Zoom, déplacement et sélection possibles sans souris.

## Conséquences

- Un prototype doit vérifier WebGL/WebView2 sur matériel intégré courant.
- Aucun rendu total d'un million de nœuds; le succès dépend du LOD et des
  tuiles.
- Un export SVG/PDF éventuel sera une fonctionnalité séparée et agrégée.
- Le mode DOM garantit l'accès aux données même si WebGL est indisponible.

## Preuves

- PixiJS, renderers : https://pixijs.com/8.x/guides/components/renderers
- PixiJS, accessibilité :
  https://pixijs.com/8.x/guides/components/accessibility
- PixiJS, performance :
  https://pixijs.com/8.x/guides/concepts/performance-tips

## Limites

Les 50 000 primitives et les poids de relief sont des budgets/hypothèses à
falsifier par le squelette. La qualité perceptuelle devra être évaluée avec
des utilisateurs et des corpus synthétiques variés.
