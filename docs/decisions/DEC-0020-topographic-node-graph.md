# DEC-0020 — La représentation principale finale est un graphe topographique hiérarchique à nœuds reliés, et `P-02` est corrigée en conséquence

- **Date :** 2026-09-02
- **Statut :** `APPROVED`
- **Phase :** étape **A** de la feuille de route — **réalignement produit**,
  avant la première tranche de la nouvelle cible
- **Décideur :** **Sébastien**, direction produit, relayée par l'orchestrateur
  technique dans le prompt de réalignement du 2026-09-02. **La direction
  produit n'est pas déléguée.** Le point `D` — correction de `P-02` — est une
  **modification normative du contrat de parité** et relève, à ce titre, de la
  même autorité
- **Rédacteur de la fiche :** Claude Code, **exécuteur**. **Cette fiche
  enregistre une décision; elle ne la prend pas.**
- **Fondée sur :** [DEC-0014](DEC-0014-layout-baseline-and-budget-direction.md)
  (`CAL-B`, pavage squarifié, baseline de calepin),
  [DEC-0015](DEC-0015-product-parity-and-layout-scope.md) (`CAL-B` est une
  **primitive technique**, pas un contrat visuel),
  [DEC-0008](DEC-0008-hierarchical-rendering.md) (HTML/SVG accessible), et le
  [contrat de parité](../product/CARTETOPO_FUNCTIONAL_PARITY.md) §3
- **replaced_by :** —
- **Supplante :** rien intégralement. Elle **corrige `P-02`** du contrat de
  parité — correction normative **`X2`**, §5 — et **prolonge `DEC-0015`** en
  disant, cette fois, ce que la cible **est** et non seulement ce qu'elle
  n'est pas

> **Cette fiche ne mesure rien, n'exécute rien et n'implémente rien.**
>
> **Elle n'impose aucun algorithme de disposition.** Sugiyama, *layered graph*,
> *tree layout*, *orthogonal layout* et les autres restent des **choix
> techniques futurs**, à arbitrer sur mesure.
>
> **Elle ne demande aucune copie pixel de CarteTopo.**

## Contexte

`DEC-0014` a retenu le **pavage squarifié `CAL-B`** comme calepin baseline.
`DEC-0015` a immédiatement réduit sa portée : « `CAL-B` reste une **primitive
technique**, pas un contrat visuel ni comportemental ». La distinction était
juste, et elle n'a pas tenu — non par désobéissance, mais par un mécanisme plus
banal : **une exigence du contrat de parité encode le pavage**.

`P-02`, dans sa formulation d'origine, exige que « la relation d'**inclusion
visuelle** reproduise la relation parent/enfant **nœud par nœud** ». Une carte
qui exprime la hiérarchie par des **arêtes** — un enfant *relié* à son parent
plutôt que *contenu* dans lui — **échoue** ce critère, quelle que soit sa
qualité. Autrement dit : le contrat rend le treemap **obligatoire** et la
topographie visée **contractuellement interdite**.

Ce n'est pas un détail de rédaction. `P-02` est un critère falsifiable sur
quatre fixtures, et c'est exactement ce genre d'exigence qui gouverne
réellement la conception, longtemps après que la fiche `DEC` qui disait le
contraire a été oubliée.

## La décision

### 1. L'instruction produit autoritative

**La représentation principale finale de FileTopo est un GRAPHE TOPOGRAPHIQUE
HIÉRARCHIQUE À NŒUDS/CARTES ET CONNEXIONS EXPLICITES.**

### 2. Le principe fonctionnel

- **Chaque dossier ou fichier est représenté par un nœud/carte
  identifiable** — une entité que l'œil isole, pas une zone d'un pavage.
- **Son nom est directement lisible** dès que le niveau de zoom le permet. La
  lisibilité du nom est un **service rendu**, pas un effet de bord de la taille
  du rectangle.
- **La hiérarchie parent/enfant est exprimée principalement par POSITION et
  CONNEXION EXPLICITE** — une arête, un rattachement visible —, et non par
  l'imbrication.
- **Branches, niveaux, colonnes ou zones structurées** organisent l'espace.
- **Les relations transversales sont visibles entre les nœuds**, distinctes de
  la hiérarchie.
- **Pan et zoom**, avec une **navigation claire**.
- **Possibilité future de replier/déplier des branches** — fonction `F-042`.
- **Possibilité future de focaliser sur une branche ou un sous-ensemble** —
  fonction `F-042`.

### 3. Ce qui reste libre

**Couleurs, formes, typographie et organisation visuelle restent entièrement
libres.** Cette fiche décrit une **structure de représentation**, pas un style.
L'étape **B** de la feuille de route conserve toute sa latitude.

**Aucune copie pixel-perfect de CarteTopo n'est demandée, ni acceptable comme
objectif.** CarteTopo reste la référence **fonctionnelle** — ce que
l'utilisateur doit pouvoir faire —, jamais une référence d'apparence. C'est le
point 4 des cinq énoncés fondateurs du contrat de parité, inchangé.

### 4. Le treemap n'est pas la cible visuelle principale finale

**Le pavage de rectangles imbriqués actuellement employé n'est PAS la
représentation principale finale.**

Il peut demeurer :

- **primitive de calcul** — répartir une surface entre des poids reste un
  problème résolu et utile;
- **représentation technique** — diagnostic, mesure, densité;
- **vue secondaire éventuelle** — un mode parmi d'autres, si un besoin le
  justifie.

**Il ne doit jamais imposer l'UX finale.** Aucune exigence, aucun critère
d'acceptation et aucun test ne peut, à partir d'aujourd'hui, présupposer
l'imbrication.

### 5. Correction normative `X2` — `P-02`

**L'ancienne formulation de `P-02` est remplacée sur ce point précis.** Elle
n'est **ni supprimée ni réécrite en silence** : elle reste visible dans le
contrat, sous la correction, et dans l'historique Git.

**Ancienne formulation, conservée pour mémoire :**

> `P-02` — **Blocs et nœuds hiérarchiques lisibles.** La carte montre des blocs
> et des nœuds dont l'**imbrication visuelle est** la hiérarchie réelle […] la
> relation d'**inclusion visuelle** reproduit la relation parent/enfant nœud
> par nœud […]

**Nouvelle intention de `P-02` :**

> « La topographie rend la hiérarchie réelle **lisible et non ambiguë**.
> Chaque nœud/fichier/dossier possède une **représentation identifiable**. La
> relation parent/enfant est représentée **nœud par nœud** par une **connexion
> et/ou une organisation spatiale explicite**. **Aucune relation hiérarchique
> affichée ne peut être inventée. Aucun parent/enfant réel ne peut être
> attribué au mauvais nœud.** »

### 6. Ce que le critère futur devra vérifier

Le critère d'acceptation reste **falsifiable sur les quatre fixtures**
synthétiques déjà employées — large, profonde, mixte, quasi vide. Il doit
vérifier **au minimum** :

| # | Ce qui est vérifié |
|---|---|
| 1 | **Ensemble de nœuds correct** — l'ensemble affiché égale l'ensemble indexé, qui égale l'ensemble attendu |
| 2 | **Parent exact** — pour chaque nœud, le parent affiché est le parent réel |
| 3 | **Enfants directs exacts** — pour chaque nœud, l'ensemble des enfants affichés égale l'ensemble réel |
| 4 | **Aucune arête hiérarchique inventée** — toute arête affichée a une contrepartie dans l'arborescence |
| 5 | **Aucun nœud attribué à la mauvaise branche** |
| 6 | **Labels disponibles** — le nom est lisible au niveau de zoom prévu pour cela, et son indisponibilité éventuelle est un état **déclaré**, jamais un silence |
| 7 | **Navigation souris ET clavier** — tout ce qui est atteignable à la souris l'est au clavier, sans piège |
| 8 | **Hiérarchie compréhensible sans la couleur seule** — la structure survit à un affichage monochrome |

### 7. Aucun algorithme n'est imposé

**Sugiyama, *layered graph*, *tree layout*, *orthogonal layout*, *force
directed* contraint, ou toute autre approche** restent des **choix techniques
futurs**. Le critère porte sur le **résultat lisible et exact**, jamais sur la
méthode. Un algorithme sera choisi sur mesure, dans une tranche, avec ses
propres bancs d'essai.

## Options examinées

| Option | Avantages | Inconvénients |
|--------|-----------|---------------|
| **T-A — Conserver le treemap comme représentation principale** | Déjà implémenté, mesuré, et `P-02` est satisfaite telle qu'écrite; coût nul | Ne montre pas de nœud identifiable; les noms deviennent illisibles dès que l'arbre est profond ou déséquilibré; aucune place naturelle pour une arête transversale; contredit la direction produit |
| **T-B — Graphe hiérarchique à nœuds reliés comme représentation principale, treemap conservé comme primitive et vue secondaire éventuelle** *(retenue)* | Nom lisible par construction; place naturelle pour les relations transversales, les suggestions et les états; repli/dépli et focus deviennent possibles; le travail de pavage n'est pas perdu | Le layout est un problème plus difficile — croisements, densité, stabilité; `P-02` doit être corrigée, ce qui est une modification normative; la performance devra être re-mesurée à l'étape **C** |
| **T-C — Laisser les deux ouverts sans trancher** | Aucun engagement | La tranche suivante rechoisirait le treemap par gravité — c'est le seul des deux qui est déjà là et déjà couvert par `P-02` |

## Motif

**`T-B` plutôt que `T-A`** parce que la limite du treemap n'est pas
esthétique, elle est **fonctionnelle**. Un pavage exprime *une seule* chose —
la containment — et FileTopo doit en exprimer au moins quatre : la hiérarchie,
les relations transversales, la provenance de ces relations, et l'état des
suggestions (`DEC-0021`). Trois de ces quatre n'ont **aucune place** dans un
pavage sans le surcharger d'artifices.

**`T-B` plutôt que `T-C`** parce que ne pas trancher, ici, revient à trancher
pour `T-A` : `P-02` telle qu'écrite **récompense** le pavage et **sanctionne**
le graphe. Une direction produit qui n'est pas inscrite dans le critère
falsifiable ne survit pas à la tranche suivante.

**La correction de `P-02` n'est pas un affaiblissement.** L'exigence corrigée
est **strictement plus forte** : l'ancienne se satisfaisait d'une inclusion
géométrique correcte, la nouvelle demande en plus qu'**aucune arête ne soit
inventée** et qu'**aucun nœud ne soit attribué à la mauvaise branche** — deux
échecs qu'un pavage peut commettre sans violer l'inclusion. Rien n'est retiré;
c'est la **méthode imposée** qui est retirée, pas la garantie.

## Conséquences

- **Le contrat de parité conserve ses 22 exigences.** `P-02` est corrigée, pas
  supprimée; aucune autre exigence n'est retouchée. `P-01`, `P-03`, `P-06`,
  `P-10` et `P-11` restent entières et deviennent, si tout va bien, **plus
  faciles** à satisfaire sur un graphe que sur un pavage.
- **`P-02` n'est pas satisfaite** par l'état livré, et ne l'a jamais été
  déclarée.
- **Une fonction est ajoutée à la matrice : `F-042`** — repli/dépli et focus de
  branche, classée **`ULTÉRIEUR`**. Ce sont des « possibilités futures » au
  sens strict : nommées pour ne pas être oubliées, **non promises au MVP**.
- **`F-007` et `F-008` changent de comportement cible, pas de
  classification.** Leur cible n'est plus « blocs issus de la hiérarchie » mais
  « nœuds identifiables reliés ». **Aucune reclassification**, aucune
  descente : elles restent `MVP`, et la modification est **déclarée** dans la
  matrice avec renvoi vers cette fiche.
- **`DEC-0014` et `DEC-0015` ne sont pas modifiées.** `CAL-B` conserve son
  statut de primitive; ses mesures et ses réserves `V1`, `V2`, `R8` demeurent
  entières.
- **Aucun chiffre de performance ne se transporte.** Les mesures de pavage ne
  disent rien d'un graphe. La performance du nouveau layout sera mesurée dans
  sa propre tranche, et **`R8` n'est pas levée** : rien n'est publié avant
  l'étape **C**.
- **Le code de pavage existant n'est ni supprimé ni déprécié par cette
  fiche.** Il reste en place tant qu'une tranche n'en décide pas autrement.

## Preuves

**Aucune. Cette fiche est une décision, pas un résultat.** Rien n'a été
implémenté, exécuté ni mesuré. Les huit points de §6 sont des **cibles à
falsifier** dans une tranche future, pas des constats.
