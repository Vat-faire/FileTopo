# DEC-0008 — Rendu de la carte en blocs hiérarchiques

- **Date :** 2026-08-31
- **Statut :** `APPROVED`
- **Phase :** 1
- **Décideur :** **Sébastien — GO explicite du 2026-08-31.** Porte P2 de
  [TASK-0011](../tasks/TASK-0011-functional-architecture-baseline.md)
  franchie; cette fiche est **approuvée**.
- **Approuvée le :** 2026-08-31
- **replaced_by :** —

> **Décision arrêtée.** Sébastien a franchi la porte P2 le 2026-08-31 et a
> retenu l'**option A**, avec `B2` comme unique voie de réfutation. Le
> classement et les options écartées sont conservés ci-dessous comme motif.
> **Aucun rendu n'a été exécuté, aucune image par seconde mesurée.**

## Contexte

La cible n'est plus celle de `DEC-0005`. `DEC-0005` a choisi PixiJS 8 sur
WebGL pour un **relief à un million de nœuds** avec tuiles logiques et champ
scalaire. La cible de la reconstruction est une **carte en blocs
hiérarchiques** dérivée de l'arborescence réelle (F-007, F-008), à
**100 000 éléments au MVP**
([BASELINE_TARGETS.md](../performance/BASELINE_TARGETS.md)).

Trois éléments changent la question :

1. **Le nombre de primitives simultanées est très inférieur.** Une carte en
   blocs avec niveau de détail n'affiche pas un bloc par fichier : elle
   affiche les dossiers du niveau visible et agrège le reste. L'ordre de
   grandeur passe du million au millier.
2. **PixiJS 8 n'a pas de repli Canvas 2D.** Le renderer Canvas est listé
   « ❌ Coming-soon » dans la documentation officielle. `DEC-0005` le notait
   déjà (« Canvas fallback annoncé mais non disponible »); c'est toujours vrai.
3. **L'accessibilité est un critère de comparaison, pas un ajout.** F-036 est
   classée `MVP` et vise WCAG 2.2 AA.

`TASK-0011` §7.1 point 4 impose que « WebGL n'est retenu que si un besoin est
démontré par volumétrie et interactions attendues ». Aucune volumétrie n'ayant
été mesurée, **ce besoin n'est pas démontré à ce jour**.

## Options examinées

| Option | Avantages | Inconvénients |
|--------|-----------|---------------|
| **A — HTML/SVG dans le DOM** | Chaque bloc est un élément du DOM : accessible nativement, focusable, annonçable, inspectable, stylable par CSS (contraste, `prefers-reduced-motion`, contraste élevé Windows) sans code de rendu dédié; le motif ARIA « Tree View » s'applique directement; **aucun repli à écrire**, puisqu'il n'y a pas de GPU à perdre; export et impression naturels; zéro dépendance de rendu | Le coût par élément est celui du DOM : au-delà de quelques milliers de nœuds simultanés, la mise en page et l'interaction se dégradent; la virtualisation doit être écrite; les animations fluides sont plus difficiles à garantir |
| **B — Canvas 2D** | Coût par primitive très inférieur au DOM; disponible partout où le WebView fonctionne, sans exigence GPU; contrôle total du dessin; largement suffisant pour quelques milliers de rectangles et libellés | Ne fournit **aucune** sémantique : toute l'accessibilité doit être portée par une représentation DOM parallèle, qui devient obligatoire et doit rester synchronisée; le picking, le batching et le texte sont à écrire; `getContext('2d')` peut lui aussi renvoyer `null` en principe |
| **C — WebGL, via PixiJS 8 ou directement** | Le plus haut plafond de primitives; déjà présent dans le dépôt (`pixi.js ^8.12.0`) et déjà décidé par `DEC-0005`; batching, scène et interaction fournis | **Aucun repli Canvas 2D dans PixiJS 8** : sans WebGL utilisable, il n'y a pas de carte du tout; exige une couche sémantique DOM parallèle, comme B, donc le même coût d'accessibilité; le besoin de volumétrie n'est pas démontré pour une carte en blocs; le texte et les contours nets demandent un travail supplémentaire; contrainte forte sur les machines à GPU intégré ou pilotes défaillants |
| **D — Canvas 2D avec montée vers WebGL sur seuil mesuré** | Retient le plafond de B pour le MVP et garde C ouvert; le passage est conditionné à une mesure, pas à une intuition; la couche sémantique DOM, obligatoire dans les deux cas, est écrite une seule fois | Exige de définir le seuil **et** de le mesurer avant tout basculement; deux chemins de rendu à maintenir si le basculement a lieu; risque de ne jamais franchir le seuil et d'avoir conçu pour rien |

## Décision

**Option A retenue — HTML/SVG dans le DOM, avec virtualisation et niveaux de
détail, pour le MVP.** Canvas 2D n'est autorisé à l'étude **que si** le banc
d'essai synthétique `B2` réfute l'option A contre les objectifs de
[BASELINE_TARGETS.md](../performance/BASELINE_TARGETS.md) §3.6. WebGL est
**différé** jusqu'à un besoin mesuré. Sébastien a arrêté ce choix le
2026-08-31 en franchissant la porte P2.

Le classement qui avait été soumis, et qui reste le motif de la décision :


1. **A — HTML/SVG avec virtualisation et niveaux de détail, pour le MVP**
   (recommandé);
2. **B ou D — Canvas 2D**, **seulement si** un banc d'essai synthétique
   démontre que HTML/SVG ne tient pas les objectifs de
   [BASELINE_TARGETS.md](../performance/BASELINE_TARGETS.md) §3.6;
3. **C — WebGL, différé** jusqu'à ce qu'un besoin **mesuré** le justifie.

Ce classement inverse celui d'une première rédaction de cette fiche, qui
plaçait D en tête. Le motif du changement est écrit ci-dessous : aucune mesure
ne justifie aujourd'hui d'imposer une seconde représentation DOM synchronisée,
et la carte visée n'affiche jamais 100 000 blocs simultanément.

**Élément commun à toutes les options, non négociable.** La représentation
sémantique DOM — arbre ou liste virtuelle suivant le motif ARIA « Tree View » —
est **autoritative** pour le clavier et les technologies d'assistance. Sous
l'option A elle *est* la carte; sous B, C et D elle est parallèle et doit
rester synchronisée. Aucune option ne permet de s'en passer.

## Motif

**Pourquoi A est premier.** Cinq raisons, dont aucune ne dépend d'une mesure
absente :

1. **La carte n'affiche jamais 100 000 blocs simultanément.** Les 100 000
   éléments visés par §3.6 de `BASELINE_TARGETS.md` sont un volume **indexé**,
   pas un volume **dessiné**. Une carte hiérarchique à niveaux de détail
   n'affiche que les niveaux pertinents et agrège le reste; le raisonnement qui
   plaçait Canvas en tête confondait ces deux grandeurs.
2. **Seuls les niveaux pertinents sont visibles.** Avec virtualisation — ne
   construire que les blocs intersectant la fenêtre — et niveaux de détail —
   remplacer un sous-arbre par un bloc agrégé sous un seuil de surface — le
   nombre de nœuds DOM simultanés est borné par la surface de l'écran, pas par
   la taille de l'index.
3. **L'accessibilité est native, pas reconstruite.** Le clavier, les libellés,
   le focus, le contraste élevé de Windows et `prefers-reduced-motion` sont
   fournis par le DOM et le CSS. Sous B, C et D, chacun de ces points doit être
   réimplémenté ou porté par une couche parallèle.
4. **Le repli sans GPU est acquis par construction.** Il n'y a aucun contexte
   de rendu à obtenir, donc aucun `null` à traiter : la spécification HTML
   établit que `getContext()` peut échouer (P2), et A est la seule option qui
   ne dépend d'aucun contexte.
5. **Canvas imposerait immédiatement une deuxième représentation.** La
   représentation sémantique DOM étant obligatoire dans tous les cas, choisir
   Canvas revient à écrire et à **maintenir synchronisées** deux structures
   décrivant le même arbre. C'est un coût certain contre un gain non mesuré.

**Pourquoi B et D reculent sans être rejetées.** Leur seul argument est le
coût par primitive, qui ne devient décisif que si le nombre de blocs
simultanément visibles dépasse ce que le DOM absorbe. Cette grandeur n'est
**pas mesurée**. B et D restent donc des options légitimes, mais leur adoption
est conditionnée à un **banc d'essai synthétique** qui falsifie A, jamais à une
intuition. D conserve sur B l'avantage d'écrire son seuil.

**Pourquoi C est différée.** Le seul argument de C est le plafond de
primitives, et ce plafond n'est requis que si la carte affiche simultanément
beaucoup plus d'éléments qu'une carte en blocs à niveaux de détail n'en
affiche. En face, l'absence de repli Canvas 2D dans PixiJS 8 est un fait
vérifié : une machine sans WebGL utilisable n'a alors aucune carte. Retenir C
aujourd'hui, ce serait accepter un risque d'indisponibilité totale du rendu
pour un gain non démontré. C n'est pas rejetée : elle est **différée jusqu'à ce
qu'un besoin mesuré la justifie**.

**Limite honnête de A.** La spécification SVG précise que les éléments non
rendus ne figurent pas dans l'arbre d'accessibilité (P3) : une virtualisation
qui retire des blocs du DOM doit donc porter `aria-level`, `aria-setsize` et
`aria-posinset`, comme le motif ARIA « Tree View » l'exige quand l'ensemble des
nœuds n'est pas dans le DOM (P6). Ce n'est pas un obstacle : c'est une
obligation d'écriture.

## Conséquences

- Le **plafond de blocs DOM/SVG simultanément visibles** doit être déclaré,
  puis falsifié par un banc d'essai (§3.6 de `BASELINE_TARGETS.md`). Un
  plafond initial est proposé ci-dessous, explicitement **non testé**.
- **La virtualisation et les niveaux de détail ne sont pas des optimisations
  ultérieures** : ils sont la condition qui rend A tenable, donc ils
  appartiennent au premier rendu écrit.
- **B, C et D ne peuvent être adoptées que sur preuve.** Le banc d'essai
  synthétique décrit ci-dessous est la condition d'un changement de moteur;
  sans lui, le MVP reste en A.
- Le test manuel **M13** de [TEST_STRATEGY.md](../architecture/TEST_STRATEGY.md)
  — « machine sans WebGL utilisable, le produit reste entièrement utilisable »
  — devient un **test de rejet** de cette décision.
- L'accessibilité (F-036, WCAG 2.2 AA), le contraste, les alternatives non
  colorées et `prefers-reduced-motion` sont des critères de comparaison
  intégrés ci-dessus, jamais des ajouts ultérieurs.
- Si C est retenue malgré tout, un repli explicite doit être écrit et testé,
  puisque la bibliothèque n'en fournit pas.
- La question du relief composite de `DEC-0005` (six signaux pondérés) est
  **hors du MVP** : une carte en blocs n'en a pas besoin. Cette fiche ne
  modifie pas `DEC-0005`; elle propose de la considérer caduque pour le MVP.

## Plafond initial proposé — **non testé**, à falsifier

**Ce n'est pas une capacité déclarée du produit.** C'est une hypothèse de
travail écrite pour être **réfutée** par un banc d'essai synthétique, au même
titre que toute ligne de
[BASELINE_TARGETS.md](../performance/BASELINE_TARGETS.md). Aucune
communication, aucune documentation d'utilisateur et aucune fiche ultérieure
ne peut la citer comme une performance atteinte.

| Grandeur | Plafond initial proposé | Statut |
|---|---:|---|
| Blocs DOM/SVG construits et simultanément visibles, toutes profondeurs confondues | **≤ 3 000** | **non testé** |
| Blocs DOM/SVG conservés hors fenêtre par la virtualisation (marge de défilement) | **≤ 1 000** | **non testé** |
| Profondeur de niveaux de détail dessinée simultanément | **≤ 6 niveaux** sous la racine visible | **non testé** |

**Origine du chiffre.** Il ne dérive d'aucune mesure. Il est posé comme une
borne basse plausible, afin qu'un banc d'essai ait une hypothèse précise à
contredire; il est volontairement inférieur à ce qu'un DOM moderne absorbe,
pour qu'un dépassement constaté soit un signal et non une surprise.

**Banc d'essai qui doit le falsifier.** Sur `SYN-100K`, `SYN-DEEP` et
`SYN-WIDE`, avec une trajectoire de déplacement et de zoom scriptée identique
entre exécutions : relever le nombre réel de nœuds DOM construits, les images
par seconde soutenues et la latence de sélection. **Si A ne tient pas les
objectifs de §3.6 de `BASELINE_TARGETS.md` sous ce plafond, alors — et
seulement alors — B ou D devient justifiée**, mesure jointe. Tant que ce banc
d'essai n'a pas été exécuté, la présente fiche ne prouve rien sur les
performances : elle argumente sur des coûts d'architecture.


## Preuves

| # | Fait | Source primaire | Consultée le |
|---|---|---|---|
| P1 | PixiJS 8 : WebGLRenderer « ✅ Recommended »; WebGPURenderer « 🚧 Experimental »; renderer Canvas « ❌ Coming-soon » — **il n'existe pas de repli Canvas 2D en v8** | https://pixijs.com/8.x/guides/components/renderers | 2026-08-31 |
| P2 | `getContext()` « Returns null if contextId is not supported »; les auteurs « must also provide content that... conveys essentially the same function or purpose as the canvas's bitmap » | https://html.spec.whatwg.org/multipage/canvas.html | 2026-08-31 |
| P3 | SVG 2 : « Non-rendered elements are not represented in the document accessibility tree », tout en participant au modèle du document et à la cascade | https://www.w3.org/TR/SVG2/render.html | 2026-08-31 |
| P4 | WCAG 2.2 : 2.1.1 Clavier (A), 1.4.1 Utilisation de la couleur (A), 1.4.3 Contraste minimal (AA), 2.4.7 Visibilité du focus (AA) | https://www.w3.org/WAI/WCAG22/quickref/ | 2026-08-31 |
| P5 | `prefers-reduced-motion` : valeurs `no-preference` et `reduce`, indiquant une préférence système pour un mouvement réduit | https://www.w3.org/TR/mediaqueries-5/#prefers-reduced-motion | 2026-08-31 |
| P6 | Motif ARIA « Tree View » : rôles `tree`, `treeitem`, `group`; navigation par flèches, Home/End; `aria-expanded`, `aria-selected`, `aria-level`, `aria-setsize`, `aria-posinset` requis quand l'ensemble des nœuds n'est pas dans le DOM | https://www.w3.org/WAI/ARIA/apg/patterns/treeview/ | 2026-08-31 |
| P7 | Constat de code au commit `01e6860f` : le rendu actuel place des points en spirale plafonnés à 2 000 repères, avec un niveau de détail initial de 600, échantillonnés par pas — la hiérarchie n'intervient pas dans le placement | `src/components/TerrainMap.tsx:19-24`, `src-tauri/src/synthetic.rs` | 2026-08-31 |

**Source non obtenue, déclarée comme telle.** Les spécifications WebGL 1.0 et
2.0 du registre Khronos (`https://registry.khronos.org/webgl/specs/latest/`)
ont renvoyé une erreur HTTP 403 lors des tentatives du 2026-08-31 et
**n'ont pas pu être consultées**. Les affirmations de cette fiche sur le
comportement en l'absence de WebGL s'appuient donc sur la spécification HTML
du WHATWG (P2) et sur la documentation PixiJS (P1), pas sur la spécification
WebGL elle-même. Cette lacune est signalée plutôt que comblée par une source
secondaire.

## Limites

- **Non testé.** Aucun rendu n'a été exécuté, aucune image par seconde
  mesurée, aucune machine sans WebGL essayée.
- Le classement dépend d'une grandeur non mesurée : le nombre de blocs
  **simultanément visibles** sur une carte en blocs à 100 000 éléments
  indexés. Tant qu'elle n'est pas mesurée, le classement reste réfutable.
- Aucune bibliothèque de rendu n'est recommandée nommément pour les options
  A, B ou D; ce choix appartient à une tâche ultérieure, avec licence à
  vérifier.
- L'algorithme de disposition hiérarchique (treemap déterministe ou autre)
  n'est pas décidé ici : c'est une question distincte du moteur de rendu.

---

## Amendement du 2026-08-31 — DEC-0013, après le banc d'essai B2

**Le texte ci-dessus est conservé intact**, y compris le plafond initial de
3 000 blocs, qui reste lisible comme ce qu'il a toujours été : une hypothèse
écrite pour être réfutée. Ce qui suit le complète.

`B2` a été exécuté, et [DEC-0013](DEC-0013-post-risk-gate-technical-arbitration.md)
a arbitré :

- **L'option A — HTML/SVG accessible — est conservée.** Canvas 2D **n'est pas
  ouvert** : l'autorisation d'étude rendue par `B2` n'est **pas exercée**.
- **Le plafond universel fixe de 3 000 blocs est abandonné comme règle de
  conception.** Les plafonds mesurés varient d'un facteur 4 selon la forme —
  3 743 sur `SYN-EQUILIBRE`, 3 063 sur `SYN-DEEP`, **entre 939 et 1 795** sur
  `SYN-WIDE`. Un décompte de blocs ne décrit pas ce qui détermine le coût.
- **Direction retenue à sa place :** un **budget de rendu auto-régulé**, plus
  l'**étude d'un calepin squarifié** — l'algorithme de calepin devient une
  variable de conception, pas un acquis.
- **Les valeurs de `B2` ne sont pas des plafonds universels** : une machine
  au-dessus d'un poste ordinaire, Chrome et non WebView2, un seul calepin,
  `revirtualisations = 0`. Aucune ne peut être citée comme capacité du produit.
- **Réserve `SYN-100K`, à ne pas perdre :** le protocole de falsification écrit
  ci-dessus exige `SYN-100K`, `SYN-DEEP` **et** `SYN-WIDE`. `B2` a mesuré
  `SYN-EQUILIBRE` à la place de `SYN-100K`. **`B2` ne falsifie donc pas
  littéralement la présente fiche selon son protocole complet.** Le trou de
  preuve est déclaré, et sa fermeture est spécifiée par
  [TASK-0013](../tasks/TASK-0013-b2-bis-layout-and-render-budget.md).

Preuves : [rapport de TASK-0012 §3](../research/TASK-0012-risk-gate-results.md),
[PERF-0001](../performance/PERF-0001-b2-rendering.md).
