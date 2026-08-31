# DEC-0008 — Rendu de la carte en blocs hiérarchiques

- **Date :** 2026-08-31
- **Statut :** `PROPOSED`
- **Phase :** 1
- **Décideur :** Sébastien — **décision non prise.** Fiche soumise à la porte
  P2 de [TASK-0011](../tasks/TASK-0011-functional-architecture-baseline.md).
- **replaced_by :** —

> Cette fiche **compare** et **classe**. Elle ne tranche pas.

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

**Aucune.** Le classement recommandé, soumis à Sébastien :

1. **D — Canvas 2D au MVP, montée vers WebGL sur seuil mesuré** (recommandé);
2. **A — HTML/SVG** (recommandé si la volumétrie visible réelle s'avère
   faible; c'est l'option la plus sûre pour l'accessibilité);
3. **B — Canvas 2D seul** (équivalent à D sans la porte de sortie);
4. **C — WebGL** (non justifié à ce jour, faute de besoin de volumétrie
   démontré, et pénalisé par l'absence de repli).

**Élément commun à toutes les options, non négociable.** La représentation
sémantique DOM — arbre ou liste virtuelle suivant le motif ARIA « Tree View » —
est **autoritative** pour le clavier et les technologies d'assistance. Sous
l'option A elle *est* la carte; sous B, C et D elle est parallèle et doit
rester synchronisée. Aucune option ne permet de s'en passer.

## Motif

**Pourquoi C recule.** Le seul argument de C est le plafond de primitives, et
ce plafond n'est requis que si la carte affiche simultanément beaucoup plus
d'éléments qu'une carte en blocs à niveau de détail n'en affiche. Cette
volumétrie n'est **pas mesurée**. En face, l'absence de repli Canvas 2D dans
PixiJS 8 est un fait vérifié : une machine sans WebGL utilisable n'a alors
aucune carte, et la spécification HTML établit que `getContext()` peut
renvoyer `null`. Retenir C aujourd'hui, ce serait accepter un risque
d'indisponibilité totale du rendu pour un gain non démontré.

**Pourquoi A n'est pas premier.** SVG place chaque bloc dans le DOM, ce qui
est exactement ce qu'il faut pour l'accessibilité — mais la spécification SVG
précise aussi que les éléments non rendus ne figurent pas dans l'arbre
d'accessibilité, et le coût DOM par élément reste le facteur limitant à
100 000 éléments indexés. A devient premier si la mesure montre que le nombre
de blocs **simultanément visibles** reste de l'ordre du millier.

**Pourquoi D plutôt que B.** D est B, plus une porte de sortie explicitement
conditionnée à une mesure. Le coût supplémentaire est celui d'écrire le seuil,
pas d'écrire deux moteurs.

## Conséquences

- Le **plafond de primitives simultanées** doit être déclaré et mesuré
  (§3.6 de `BASELINE_TARGETS.md`). Sans ce chiffre, aucune des options ne peut
  être départagée par autre chose qu'une opinion.
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
