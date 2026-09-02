# DEC-0018 — Une relation inter-cerveaux est explicite, et elle ne fusionne rien

- **Date :** 2026-09-02
- **Statut :** `APPROVED`
- **Phase :** étape **A** de la feuille de route — parité fonctionnelle MVP,
  **cinquième** tranche, ouverture des **relations inter-cerveaux**
- **Décideur :** **Sébastien**, direction produit, relayée par l'orchestrateur
  technique dans le prompt d'ouverture de `TASK-0020`. **La direction produit
  n'est pas déléguée** : les points 1 à 12 ci-dessous sont une décision
  **produit**, pas un arbitrage technique.
- **Rédacteur de la fiche :** Claude Code, **exécuteur**. **Cette fiche
  enregistre une décision; elle ne la prend pas.**
- **Fondée sur :** [DEC-0017](DEC-0017-multibrain-and-composed-views.md)
  (FileTopo est multi-cerveaux, une vue peut en composer plusieurs),
  [DEC-0011](DEC-0011-brain-isolation-and-migrations.md) (isolation et
  magasins), [DEC-0009](DEC-0009-data-model-and-relations.md) (provenance des
  relations), et les tranches `VERIFIED` `TASK-0017`, `TASK-0018`, `TASK-0019`
- **replaced_by :** —
- **Supplante :** rien. Elle **prolonge** `DEC-0017` d'un cran et
  **n'affaiblit** aucune des décisions ci-dessus.

> **Cette fiche ne mesure rien, n'exécute rien et ne lève aucune réserve.**
>
> **Elle ne change pas les invariants `I-1`, `I-2`, `I-3`.**
>
> **Elle n'autorise aucune fusion de cerveaux.** Une relation inter-cerveaux
> est un **lien**, jamais une union.

## Contexte

`DEC-0017` a fait du multi-cerveaux la forme du produit, et `TASK-0019` a livré
la **vue composée** : plusieurs cerveaux dans un seul graphique, chacun sur son
territoire, **sans aucune arête entre eux**. C'était voulu — `L8` interdisait
explicitement qu'une arête traverse une frontière de cerveau — parce qu'une
arête inter-territoires n'a de sens que si un **modèle** la porte.

Ce modèle n'existait pas. Deux cerveaux affichés côte à côte se voyaient sans
se toucher, et rien ne permettait de dire « ce document d'Alpha référence ce
document de Gamma ». La direction produit ouvre ce cran.

## La décision

### 1. Une relation inter-cerveaux relie explicitement deux nœuds de deux cerveaux différents

Elle relie **un nœud d'un cerveau `A`** à **un nœud d'un cerveau `B`**, et
`A ≠ B`. Ce n'est pas une propriété d'affichage : c'est une donnée.

### 2. Elle ne fusionne jamais les cerveaux

Deux cerveaux reliés restent **deux cerveaux**. Aucun index, aucun catalogue,
aucun magasin intra-cerveau n'est mis en commun. `DEC-0011` reste entière, et
l'isolation exigée par `P-20` reste exigée à l'identique.

### 3. Elle n'est jamais créée par le simple fait d'un affichage

Afficher `A` et `B` ensemble ne crée **rien**. Retirer `B` de la vue n'efface
**rien**. La composition est un mode d'affichage, et une relation est une
donnée : les deux ne se déterminent pas l'une l'autre.

### 4. Elle obéit aux mêmes règles de provenance que `TASK-0017`

**`DETERMINISTIC`** — produite par une **règle nommée et versionnée** — ou
**`APPROVED`** — issue de l'**approbation explicite** d'une suggestion. Il n'y
a pas de troisième valeur, ici comme ailleurs, et une suggestion **n'est pas**
une provenance.

### 5. Elle peut exister alors qu'un de ses cerveaux n'est pas affiché

Une relation `Alpha → Gamma` existe et se consulte même si Gamma n'est pas à
l'écran. L'interface le **dit en mots** — « cerveau Gamma, hors de la vue » —
plutôt que de la masquer.

### 6. Elle est persistante, indépendamment de la composition courante

Elle survit à un changement de composition, à une fermeture, à un redémarrage,
et à une **reconstruction d'index**. Une reconstruction change les numéros de
ligne; elle ne casse pas un lien.

### 7. La ressemblance ne crée rien

Deux fichiers de même nom, deux chemins voisins, deux tailles identiques : rien
de tout cela ne crée une relation. **Aucune détection automatique entre
cerveaux n'est décidée par cette fiche**, et aucune heuristique utilisateur
n'est ouverte. Les règles `DETERMINISTIC` de la tranche synthétique sont des
**règles nommées, versionnées et déclarées**, appliquées à un jeu **figé**,
pas des devinettes.

### 8. Une relation `A → B` n'implique jamais `B → A`

Aucune inverse n'est inventée, jamais. C'est la même règle que `TASK-0017`, et
elle vaut d'autant plus entre cerveaux : l'inverse d'une référence est une
affirmation que personne n'a faite.

### 9. Le lien appartient au lien, pas à l'un des deux cerveaux

Une relation `A → B` **n'est pas** une donnée privée d'`A`, ni de `B`. La
ranger dans le magasin d'`A` ferait d'une reconstruction d'`A` une destruction
du lien, et donnerait à `A` autorité sur une donnée qui ne lui appartient pas
seul.

### 10. Une suggestion inter-cerveaux n'est pas une relation

Elle vit dans son propre objet, avec son propre état. Elle **ne compte dans
aucun total** de relations établies, elle n'est **pas dessinée** comme une
arête établie, et elle ne devient une relation que par une **approbation
explicite**.

### 11. L'origine reste lisible sans couleur

Une arête inter-cerveaux se distingue d'une arête hiérarchique et d'une
relation intra-cerveau, sa direction se perçoit, et son caractère
« inter-cerveaux » est **accessible et sémantique** — jamais porté par la seule
teinte. Même exigence que `DEC-0017` point 12.

### 12. Naviguer n'est pas modifier

Suivre une relation vers un cerveau non affiché **ajoute ce cerveau à la vue**
et y sélectionne la cible. C'est une **navigation** : elle ne crée, ne modifie
et n'approuve aucune relation.

## Ce que cette fiche n'ouvre pas

- **Aucune détection automatique** de relations entre cerveaux.
- **Aucune heuristique utilisateur**, aucun glisser-déposer, aucun éditeur
  manuel générique de relations.
- **Aucune révocation** — `P-04` révocation reste ouverte, `P-21` non
  satisfaite.
- **Aucune recherche, aucun filtre, aucun watcher, aucun journal, aucun
  vu/non-vu, aucune vue sauvegardée** — `P-08`, `P-19` restent entières.
- **Aucune racine réelle, aucun sélecteur de dossier, aucune donnée réelle.**
- **`I-E` complète n'est pas décidée ici** : la résolution d'une extrémité
  reste un chemin relatif versionné, et `VolumeSerialNumber`/`FileId` ainsi que
  les déplacements et renommages réels restent hors périmètre.
- **Aucune IA, aucun OCR, aucun RAG, aucun GraphRAG.** `DEC-0012` est intacte.

## Conséquence produit

Une ligne est **ajoutée** à la matrice fonctionnelle :

| Identifiant | Fonction | Classification |
|---|---|---|
| **`F-041`** | **Relations inter-cerveaux explicites** | **`MVP`** |

**C'est une extension produit décidée, déclarée comme telle**, et **non** une
reclassification silencieuse : aucune ligne existante ne change de
classification, aucune ne descend, aucune ne disparaît.

**La matrice passe de 40 à 41 lignes :**

| Classification | Nombre |
|---|---|
| `MVP` | **37** |
| `ULTÉRIEUR` | **0** |
| `DIFFÉRÉ` | **4** |
| **Total** | **41** |

`F-041` **n'est pas une exigence de parité** et n'en remplace aucune. Le
contrat [CARTETOPO_FUNCTIONAL_PARITY.md](../product/CARTETOPO_FUNCTIONAL_PARITY.md)
**n'est pas retouché** et conserve ses 22 exigences; `P-04`, `P-05`, `P-06` et
`P-20` restent entières et inchangées.

## Preuves

**Aucune. Cette fiche est une décision, pas un résultat.** Sa mise en œuvre est
`TASK-0020`, dont les critères `M1` à `M12` sont gelés **avant** toute ligne de
code, et dont les preuves seront publiées sous `docs/performance/runs/` sous des
noms `TASK-0020-`.
