# DEC-0023 — Un seul modèle pour un ou plusieurs utilisateurs, et la source reste autoritaire sur les permissions

- **Date :** 2026-09-02
- **Statut :** `APPROVED`
- **Phase :** étape **A** de la feuille de route — **réalignement produit**.
  **Aucun serveur n'est construit**; seule la forme du modèle est arrêtée
- **Décideur :** **Sébastien**, direction produit, relayée par l'orchestrateur
  technique dans le prompt de réalignement du 2026-09-02. **La direction
  produit n'est pas déléguée.**
- **Rédacteur de la fiche :** Claude Code, **exécuteur**. **Cette fiche
  enregistre une décision; elle ne la prend pas.**
- **Fondée sur :** [DEC-0017](DEC-0017-multibrain-and-composed-views.md)
  (`brain_id` distinct de la source, vues composées),
  [DEC-0011](DEC-0011-brain-isolation-and-migrations.md) (isolation et
  magasins), [DEC-0018](DEC-0018-explicit-interbrain-relations.md) (magasin
  commun inter-cerveaux), et les invariants `I-1`, `I-2`, `I-3`
- **replaced_by :** —
- **Supplante :** rien. Elle **généralise** le modèle de `DEC-0017` d'un cran,
  **sans affaiblir** l'isolation exigée par `P-20`

> **Cette fiche ne construit aucun serveur, aucun compte, aucune
> authentification, aucun annuaire.**
>
> **Rien de ce qui suit n'est implémenté**, et cette fiche ne prétend
> **d'aucune manière** que FileTopo respecte aujourd'hui les permissions d'un
> quelconque système de fichiers au-delà de ce que `TASK-0016` à `TASK-0020`
> ont réellement livré et prouvé.
>
> **Aucune donnée réelle, aucun compte réel, aucun annuaire réel** n'est
> touché : ce sont des points d'arrêt réservés à Sébastien.

## Contexte

`DEC-0017` a séparé le **cerveau** de sa **source** : `brain_id` est une
identité propre, et un cerveau porte son index, ses relations, son état, son
nom, sa couleur et son icône. Cette séparation était faite pour le
multi-cerveaux. Elle se trouve être, incidemment, la moitié du travail
nécessaire au multi-**utilisateur**.

L'autre moitié n'existe pas, et deux questions se posent avant d'écrire la
suite, parce qu'elles sont beaucoup moins chères à trancher maintenant qu'après
trois tranches de code :

1. **Un ou plusieurs utilisateurs ?** Si la réponse se décide plus tard, elle
   se décidera par un fork — un « FileTopo Personnel » et un « FileTopo Équipe »
   qui divergent — et c'est exactement ce qu'il faut éviter.
2. **Qui décide de ce qu'un utilisateur voit ?** La réponse naïve — « le
   système d'exploitation, quand il ouvrira le fichier » — est **fausse et
   dangereuse**, pour la raison développée en §5.

## La décision

### 1. Un seul produit, deux modes, un seul modèle conceptuel

**Ne pas créer trois produits séparés.** Un seul modèle conceptuel doit pouvoir
représenter les deux modes.

**MODE PERSONNEL**

- **un** utilisateur;
- **identité de l'OS courante** — aucun compte, aucune inscription, aucune
  connexion;
- **cerveaux personnels**.

C'est le mode par défaut, et il reste **complet**. Un utilisateur qui n'aura
jamais de collègue ne doit jamais rencontrer la moindre trace du mode équipe.

**MODE ÉQUIPE / ORGANISATION**

- **plusieurs** utilisateurs;
- **plusieurs** groupes;
- **index partagé possible**;
- **droits respectés par utilisateur**.

### 2. Les six notions du modèle conceptuel

Le même modèle doit pouvoir représenter :

| Notion | Ce qu'elle porte |
|---|---|
| **`Identity`** | Qui agit. En mode personnel, l'identité de l'OS courante suffit et n'est jamais demandée à l'utilisateur |
| **`Groups`** | Appartenances. Vide et sans effet en mode personnel |
| **`Brains`** | Ce que `DEC-0017` a déjà défini — inchangé |
| **`Views`** | Y compris les vues composées de `DEC-0017`, inchangées |
| **`Relations`** | Y compris les relations inter-cerveaux de `DEC-0018`, inchangées |
| **`Permissions`** | Ce qui est **dérivé** de la source, jamais inventé — §3 |

En mode personnel, `Identity` est implicite, `Groups` est vide et `Permissions`
se réduit à ce que l'OS accorde déjà à la session courante. **Le modèle est le
même; c'est son remplissage qui diffère.** Aucune branche de code « si mode
équipe » ne doit gouverner la forme des données.

### 3. La source reste autoritaire

**FileTopo ne remplace pas les permissions du stockage source. Il les
respecte.**

Il doit respecter ce qui existe déjà, selon l'environnement :

- **Windows/NTFS**;
- **partage SMB**;
- **NAS**;
- **comptes locaux**;
- **groupes**;
- **Active Directory**;
- **autres fournisseurs futurs**.

**Aucun contrôleur de domaine n'est exigé.** Un utilisateur seul sur un poste
Windows, sans domaine, sans serveur et sans réseau, reste un cas pleinement
supporté — c'est même le cas nominal.

**FileTopo n'invente aucun droit, n'en accorde aucun, n'en retire aucun.** Il
ne devient pas un second système de permissions à administrer. Ce qu'il fait,
c'est **ne pas divulguer** ce que la source protège.

### 4. Aucune écriture dans la source, aucune exception

**Réaffirmation de `I-1` et `I-2`**, dans ce contexte précis :

- **aucune permission n'est écrite** dans la source;
- **aucun `ACL` n'est modifié**, créé ni supprimé;
- **aucun compte, aucun groupe** n'est créé dans un annuaire;
- **aucune relation, aucune approbation, aucun rejet** ne modifie la source.

**Tout l'état FileTopo reste dans l'espace applicatif.** `P-22` reste
**bloquante**.

### 5. « Ne peut pas ouvrir le fichier » n'est PAS suffisant

C'est le point central de cette fiche, et le plus facile à manquer.

Se reposer sur le refus d'ouverture revient à dire : *l'utilisateur verra le
nom, le chemin, la taille, la date, les relations et le nombre d'éléments — il
sera seulement bloqué au dernier moment.* **C'est une fuite**, et souvent la
seule qui compte : dans beaucoup d'environnements, le **nom** d'un dossier est
plus révélateur que son contenu.

**FileTopo ne doit divulguer à un utilisateur, pour un objet qu'il n'est pas
autorisé à voir selon le modèle de permissions retenu :**

- ni le **nom**;
- ni le **chemin**;
- ni les **métadonnées**;
- ni une **relation**;
- ni une **suggestion**;
- ni un **résultat de recherche**;
- ni un **compteur révélateur**.

Le **compteur révélateur** mérite d'être nommé séparément parce que c'est la
fuite la plus discrète : « ce dossier contient 47 éléments » alors que
l'utilisateur n'en voit que 12 lui apprend qu'il en existe 35 qu'il ne devrait
pas connaître. Un total, un badge, un compte de relations entrantes, une
statistique de carte : chacun peut divulguer par soustraction.

**Conséquence :** toute architecture future multi-utilisateur doit être
**PERMISSION-AWARE avant le rendu, avant la recherche et avant les
relations** — pas après, pas au moment de l'ouverture. Le filtrage appartient à
la **couche qui produit les données**, jamais à la couche qui les affiche.

**Rien de ceci n'est implémenté aujourd'hui, et cette fiche ne prétend pas le
contraire.** L'état livré ne connaît qu'un utilisateur — celui qui exécute
l'application — et n'a jamais été contrôlé sous un autre.

### 6. Le mode personnel ne paie pas le prix du mode équipe

Une contrainte de conception, pas seulement une intention : les notions de §2
doivent avoir un **coût nul et une visibilité nulle** en mode personnel.
Aucune connexion, aucun choix de profil, aucun écran de droits, aucune latence.
Un modèle multi-utilisateur qui rend le produit personnel plus lourd a échoué,
même s'il est correct.

## Options examinées

| Option | Avantages | Inconvénients |
|--------|-----------|---------------|
| **U-A — Mono-utilisateur définitif** | Le plus simple; aucune notion inutile; performance maximale | Ferme l'équipe et l'entreprise, deux des cibles nommées par `DEC-0019`; le rattrapage ultérieur serait une refonte du modèle de données |
| **U-B — Deux produits séparés, personnel et équipe** | Chacun optimal pour son cas | Deux modèles de données, deux jeux de tests, deux vitesses; ils divergent, et les relations, vues et cerveaux cessent d'être les mêmes objets |
| **U-C — Un modèle conceptuel unique, deux modes de remplissage, permissions dérivées de la source** *(retenue)* | Un seul produit; le mode personnel reste trivial parce que `Identity` est implicite et `Groups` vide; l'ajout du mode équipe est un remplissage, pas une refonte; FileTopo n'administre aucun droit | Demande de penser `Permissions` dès la conception des requêtes, y compris là où personne n'en a besoin encore; le filtrage permission-aware a un coût de conception réel |
| **U-D — FileTopo gère ses propres permissions** | Indépendant du système; uniforme partout | Un second système de droits à administrer, à synchroniser et à auditer; incohérent avec la source par construction; devient faux dès que la source change; hors de la portée d'un outil de lecture |

## Motif

**`U-C` plutôt que `U-A`** parce que `DEC-0019` nomme explicitement les
équipes, les entreprises et les cabinets parmi les cibles. Un modèle
mono-utilisateur les exclut dès la première ligne de schéma.

**`U-C` plutôt que `U-B`** parce que la divergence est certaine : deux produits
qui partagent une vision et pas un modèle finissent par ne plus partager la
vision.

**`U-C` plutôt que `U-D`** parce qu'un outil en lecture seule qui prétendrait
définir des droits serait à la fois inutile — la source décide de toute façon —
et dangereux : un droit accordé par FileTopo et refusé par le système est une
promesse fausse, et un droit refusé par FileTopo et accordé par le système est
une fausse sécurité.

**Le point 5 est la vraie décision de cette fiche.** Les trois autres options
se discutent; le fait qu'un nom soit une donnée protégée ne se discute pas, et
c'est ce qui impose que le filtrage remonte **avant** le rendu.

## Conséquences

- **Deux fonctions sont ajoutées à la matrice**, toutes deux `ULTÉRIEUR` :
  `F-048` (identités, groupes et mode équipe) et `F-049` (rendu, recherche et
  relations conscients des permissions de la source).
- **`F-049` est un prérequis dur de `F-048`.** Un mode équipe livré sans
  filtrage permission-aware serait une régression de confidentialité, pas une
  fonction incomplète. Les deux se livrent ensemble ou pas du tout.
- **`P-20` est inchangée** et son exigence d'isolation reste entière.
  L'isolation entre **cerveaux** et le filtrage par **utilisateur** sont deux
  mécanismes distincts qui ne se remplacent pas.
- **`DEC-0011`, `DEC-0017` et `DEC-0018` sont inchangées.** Le magasin commun
  inter-cerveaux de `DEC-0018` devra, en mode équipe, être lu **à travers** le
  filtre de permissions : une relation dont une extrémité n'est pas visible ne
  se montre pas, et son absence ne se signale pas par un compteur.
- **La couche IA (`DEC-0022`) dépend de cette fiche.** Ce qu'un utilisateur n'a
  pas le droit de voir ne peut pas être envoyé à un fournisseur externe en son
  nom. C'est pourquoi les permissions occupent le rang **6** de la séquence
  proposée, et l'IA le rang **7**.
- **Aucune donnée réelle, aucun compte réel, aucun annuaire réel** n'est
  approché. Toute vérification future se fera sur des **fixtures
  synthétiques** représentant des identités et des droits fictifs, ou pas du
  tout.

## Preuves

**Aucune. Cette fiche est une décision d'architecture future, pas un
résultat.** Aucun serveur, aucune identité, aucune permission n'a été
implémenté, exécuté ni mesuré. **Rien ici ne décrit un comportement actuel de
FileTopo.**
