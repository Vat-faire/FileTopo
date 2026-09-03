# DEC-0019 — FileTopo est un produit général : le juridique est un cas d'usage, jamais une hypothèse d'architecture

- **Date :** 2026-09-02
- **Statut :** `APPROVED`
- **Phase :** étape **A** de la feuille de route — **réalignement produit**,
  avant la première tranche de la nouvelle cible
- **Décideur :** **Sébastien**, direction produit, relayée par l'orchestrateur
  technique dans le prompt de réalignement du 2026-09-02. **La direction
  produit n'est pas déléguée.**
- **Rédacteur de la fiche :** Claude Code, **exécuteur**. **Cette fiche
  enregistre une décision; elle ne la prend pas.**
- **Fondée sur :** [PROJECT_VISION.md](../../PROJECT_VISION.md) (« produit
  général », « sans catégories personnelles codées en dur »),
  [DEC-0015](DEC-0015-product-parity-and-layout-scope.md) (CarteTopo est la
  référence **fonctionnelle**), et le contrat de parité §1.1 point 3
- **replaced_by :** —
- **Supplante :** rien. Elle **explicite** une contrainte déjà présente dans la
  vision, que rien n'avait jusqu'ici formulée comme **interdiction vérifiable**

> **Cette fiche ne mesure rien et n'exécute rien.**
>
> **Elle n'ajoute aucune fonction et n'en retire aucune.** Elle borne ce que le
> **noyau** a le droit de savoir.

## Contexte

CarteTopo, la référence fonctionnelle, a été construite pour un domaine
documentaire précis. Le risque, quand une référence vient d'un domaine, est de
le laisser entrer dans le produit par la porte de derrière : une catégorie ici,
un type de document là, un vocabulaire, une règle par défaut. Chacun de ces
gestes paraît anodin et aucun n'est réversible sans refonte, parce qu'ils
finissent dans le schéma, dans les libellés et dans les tests.

`PROJECT_VISION.md` dit déjà « général » et « sans catégories personnelles
codées en dur ». Cela n'a jamais été formulé comme une **règle de conception
falsifiable**, et la question se pose maintenant, au moment précis où l'on
s'apprête à écrire un **moteur de règles** — c'est-à-dire l'endroit exact où
une catégorie métier s'installerait le plus facilement.

## La décision

### 1. FileTopo n'est PAS un produit juridique

Ce n'est pas une nuance de positionnement, c'est une contrainte d'architecture.
Le noyau ne connaît **aucun** domaine.

### 2. La cible est générique

FileTopo s'adresse indifféremment à :

- des **particuliers**;
- des **équipes**;
- des **entreprises**;
- des **cabinets professionnels**;
- des **développeurs**;
- des **chercheurs**;
- l'**architecture**;
- la **comptabilité**;
- le **juridique**;
- **tout autre environnement documentaire**.

Cette liste est **illustrative, non limitative**. Un environnement absent de la
liste n'est pas hors périmètre : c'est la liste qui est incomplète par nature.

### 3. Le juridique est un cas d'usage important, pas une hypothèse du noyau

Il peut être **le premier** cas d'usage démontré, **le mieux documenté**, et
celui qui inspire le plus d'exemples. Cela ne lui donne **aucun** droit sur le
modèle de données, le vocabulaire de l'interface, les règles par défaut ou les
priorités de développement du noyau.

### 4. Aucune catégorie métier codée en dur dans le noyau

Le noyau ne contient **aucun** de ces éléments :

- type de document propre à un métier;
- nomenclature, plan de classement ou taxonomie d'un domaine;
- règle de relation qui ne serait vraie que dans un métier;
- libellé d'interface qui suppose un métier;
- valeur par défaut, seuil ou priorité justifiés par un seul métier.

**Le test à appliquer** est simple et se pose à chaque ajout : *un chercheur en
biologie, un architecte et un développeur voient-ils la même chose ?* Si la
réponse est non, la règle n'appartient pas au noyau.

### 5. Des packs métier spécialisés pourront exister — plus tard, et dehors

Un **pack de règles** spécialisé est une extension **légitime et prévue** :
règles nommées et versionnées, activables, désactivables, **jamais actives par
défaut**, et **jamais nécessaires** au bon fonctionnement du produit. Un pack
se pose **par-dessus** le noyau; il ne s'y insère pas.

**Aucun pack n'est spécifié, construit ni promis par cette fiche.** Elle
réserve la place et interdit qu'on l'occupe par accident.

## Options examinées

| Option | Avantages | Inconvénients |
|--------|-----------|---------------|
| **G-A — Spécialiser le produit sur le juridique** | Positionnement clair, cas d'usage immédiatement démontrable, vocabulaire précis | Ferme le produit; contredit `PROJECT_VISION.md`; rend inatteignable le grand public visé; une spécialisation de schéma ne se retire pas |
| **G-B — Noyau générique + packs métier ultérieurs** *(retenue)* | Tient la vision; le juridique reste démontrable **comme pack**; la contrainte est vérifiable ligne à ligne; réversible dans le bon sens — on peut toujours ajouter un pack, jamais retirer une hypothèse | Demande de la discipline à chaque ajout; un pack coûte une abstraction que rien n'utilise encore |
| **G-C — Ne rien décider et voir venir** | Coût nul immédiat | C'est le chemin par défaut vers `G-A` sans l'avoir choisi : les hypothèses métier entrent une par une et sont irréversibles quand on s'en aperçoit |

## Motif

**`G-B` plutôt que `G-A`** parce que la généralité **est** le produit. Le point
3 des cinq énoncés fondateurs du contrat de parité l'écrit déjà : ce qui
fonctionne pour une structure donnée doit fonctionner « sans catégorie codée en
dur, sans configuration manuelle préalable et sans hypothèse sur la forme de
l'arbre ». Un noyau juridique violerait cet énoncé sans qu'un seul test échoue.

**`G-B` plutôt que `G-C`** parce que l'absence de décision n'est pas neutre
ici. La référence fonctionnelle vient d'un domaine, le premier cas d'usage
viendra probablement du même domaine, et sans règle écrite, chaque petit
emprunt sera justifié individuellement. C'est ainsi qu'un produit général
devient un produit de niche sans que personne ne l'ait décidé.

## Conséquences

- **Aucune fonction n'est ajoutée ni retirée** par cette fiche. La matrice ne
  bouge pas de son fait.
- **Toute règle du futur moteur de relations** (`DEC-0021`) doit être
  **générique** ou **empaquetée**. Une règle qui ne se démontre que sur un
  métier est un pack, pas une règle du noyau.
- **Les fixtures de test restent synthétiques et neutres.** Une fixture ne doit
  pas raconter un dossier de contentieux, un permis de construire ou un plan
  comptable : elle raconte une **forme d'arbre**.
- **Le vocabulaire de l'interface reste générique** : « élément », « dossier »,
  « fichier », « relation », « suggestion ». Pas de « pièce », « annexe »,
  « lot », « écriture ».
- **Rien n'interdit de démontrer le juridique.** Une démonstration n'est pas
  une hypothèse d'architecture, tant qu'elle ne laisse rien derrière elle dans
  le noyau.

## Preuves

**Aucune. Cette fiche est une décision de portée, pas un résultat.** Rien n'a
été exécuté, mesuré ni testé pour l'établir. Elle est **falsifiable par
relecture** : une catégorie métier trouvée dans le noyau la contredit.
