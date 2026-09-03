# DEC-0021 — Moteur de relations déterministe et explicable : FileTopo doit être très utile sans aucun LLM

- **Date :** 2026-09-02
- **Statut :** `APPROVED`
- **Phase :** étape **A** de la feuille de route — **réalignement produit**,
  avant la première tranche de la nouvelle cible
- **Décideur :** **Sébastien**, direction produit, relayée par l'orchestrateur
  technique dans le prompt de réalignement du 2026-09-02. **La direction
  produit n'est pas déléguée.**
- **Rédacteur de la fiche :** Claude Code, **exécuteur**. **Cette fiche
  enregistre une décision; elle ne la prend pas.**
- **Fondée sur :** [DEC-0009](DEC-0009-data-model-and-relations.md)
  (provenance des relations, `I-E` et `R-C`),
  [DEC-0012](DEC-0012-ai-architectural-boundary.md) (frontière `F-D`, aucune IA
  dans le noyau MVP), [DEC-0018](DEC-0018-explicit-interbrain-relations.md)
  (provenance inter-cerveaux), la correction normative **`X1`** du contrat de
  parité, et [DEC-0019](DEC-0019-general-purpose-product-scope.md) (aucune
  catégorie métier dans le noyau)
- **replaced_by :** —
- **Supplante :** rien. Elle **construit sur** `DEC-0009` et `X1` : le modèle
  de provenance ne change **pas d'un iota**, et cette fiche dit **qui le
  remplit**

> **Cette fiche ne mesure rien, n'exécute rien et n'implémente rien.**
>
> **Aucune règle n'est écrite ici. Aucun signal n'est calculé. Aucun hash n'est
> lu.** C'est une **architecture de signaux extensible**, pas une
> implémentation.
>
> **Le modèle de provenance est inchangé : une relation établie vaut
> `DETERMINISTIC` ou `APPROVED`, et il n'existe pas de troisième valeur.**

## Contexte

Six tranches `VERIFIED` ont construit le **modèle** de relation : deux
extrémités, un type, une provenance, un magasin hors de la source, des
relations intra-cerveau puis inter-cerveaux. Le modèle tient.

Ce qu'il n'a pas, c'est un **producteur**. Toute relation existante vient d'une
fixture ou d'un geste d'utilisateur. `DETERMINISTIC` — « produite par une règle
nommée et versionnée » — désigne aujourd'hui une valeur d'énumération dont
**aucune règle** ne remplit la définition. Un utilisateur qui ouvre FileTopo
sur son arborescence obtient une carte et **zéro** relation transversale.

La question est donc : **qu'est-ce qui produit des relations, et avec quel
droit ?** Elle se pose maintenant parce que c'est le moment où deux mauvaises
réponses sont les plus tentantes : « un LLM les trouvera » et « un score de
similarité suffira ».

## La décision

### 1. Le principe fondamental

**FileTopo doit être TRÈS UTILE SANS LLM.**

L'IA employée **pendant le développement** — pour concevoir les règles, les
tester, les critiquer et les améliorer — est légitime et n'entre pas dans le
produit. **Le moteur installé chez l'utilisateur doit pouvoir fonctionner
entièrement avec des algorithmes classiques.**

Un utilisateur sans clé, sans compte, sans connexion et sans modèle local doit
obtenir un produit **complet**, pas un produit dégradé qui attend une clé.

Le nom conceptuel de cette couche : **Deterministic Relation Engine** — moteur
de relations explicables.

### 2. Trois niveaux sémantiques, obligatoires et distincts

| Niveau | Nom | Ce que c'est | Ce que ça vaut |
|---|---|---|---|
| **1** | **PROUVÉ / OBSERVÉ** | Information **directement démontrable** à partir de ce qui a été lu | Un fait. Se réaffirme à l'identique à chaque scan tant que la source ne change pas |
| **2** | **RELATION DÉTERMINISTE** | Produite par une **règle nommée, versionnée et explicable** appliquée à des faits de niveau 1 | Une **relation établie**, de provenance `DETERMINISTIC` |
| **3** | **SUGGESTION** | Signaux **suffisants pour demander une confirmation**, **insuffisants pour affirmer** | **Jamais** une relation. Un objet et un état distincts |

**Une suggestion n'est JAMAIS une relation établie.** C'est la correction
normative `X1`, et elle est ici **réaffirmée sans changement**.

**Le modèle existant est conservé intégralement :**

> **relation établie ⇒ provenance `DETERMINISTIC` ou `APPROVED`.**

Il n'y a pas de troisième provenance, et il n'y en aura pas — voir aussi
[`DEC-0022`](DEC-0022-optional-byok-ai-layer.md) §4.

### 3. Une règle est une chose nommée

Une règle déterministe qui produit du niveau 2 porte **au minimum** :

- un **identifiant stable** et un **nom lisible**;
- une **version**;
- une **définition explicite de ce qu'elle affirme** — le *sens* de la relation
  produite, pas seulement sa condition de déclenchement;
- les **signaux** qu'elle consomme;
- une **explication** rendue à l'utilisateur, en langage ordinaire.

**Une règle sans sens défini ne produit pas de relation.** Une condition qui
déclenche sans qu'on puisse dire *ce qu'elle affirme* produit, au mieux, une
suggestion.

### 4. Architecture de signaux extensible — pas une implémentation

Ce qui suit est une **architecture**, formalisée pour que les tranches futures
s'y insèrent sans refonte. **Aucun de ces signaux n'est implémenté, promis pour
une date, ni garanti disponible.** La disponibilité de chacun dépend du système
de fichiers, du volume, des droits et du format.

**Certitude forte / observable — candidats au niveau 1 :**

- **parent/enfant du système de fichiers** — déjà acquis;
- **identité physique de fichier** quand l'OS permet de la déterminer;
- **hash cryptographique identique**;
- **hyperlien explicite** dans un format supporté;
- **chemin explicitement référencé**;
- **identifiant exact structuré**.

**Signaux combinables — candidats aux niveaux 2 et 3 selon la règle :**

- **nom normalisé**;
- **extension**;
- **taille**;
- **horodatages**;
- **emplacement**;
- **identifiants structurés**;
- **numéros présents dans le nom**;
- **conventions de versions**;
- **métadonnées disponibles**;
- **références explicites dans les formats supportés**.

Conformément à [`DEC-0019`](DEC-0019-general-purpose-product-scope.md), tous
ces signaux sont **génériques**. Un signal qui n'a de sens que dans un métier
appartient à un **pack**, pas au noyau.

### 5. Ce que « même hash » veut dire, et ce que ça ne veut pas dire

**« Hash identique » signifie : CONTENU BINAIRE IDENTIQUE. Rien d'autre.**

**Ne jamais appeler cela automatiquement « même fichier physique ».**

Cinq concepts, **jamais confondus**, chacun avec sa propre valeur de vérité :

| Concept | Ce qui l'établit | Niveau |
|---|---|---|
| **Même objet physique** | L'OS le dit — identité de fichier, lien physique. `DEC-0013` a déjà tranché la forme : le couple **`VolumeSerialNumber` + `FileId`**, jamais `FileId` seul | **1**, quand disponible |
| **Contenu identique** | Hash cryptographique égal | **1** |
| **Copie probable** | Contenu identique **plus** un contexte qui suggère une filiation | **3** — une copie a un *sens directionnel* que le hash ne donne pas |
| **Nom similaire** | Comparaison de chaînes normalisées | **3** au mieux |
| **Relation logique** | Ce que l'utilisateur ou une règle **affirme** | **2** ou `APPROVED` |

Deux fichiers de contenu identique peuvent être : le même objet vu deux fois,
une copie de sauvegarde, deux téléchargements indépendants de la même source,
ou deux fichiers vides. **Le hash ne les distingue pas**, et une interface qui
prétend le contraire ment.

### 6. Un score n'est pas une vérité

**Une combinaison de signaux peut produire une SUGGESTION. Un score numérique
seul ne transforme jamais une hypothèse en vérité.**

Exemples, **conceptuels** :

| Situation | Ce qui est légitime |
|---|---|
| **Même hash** | Relation **prouvable de contenu identique** — niveau 1, puis une règle de niveau 2 si son sens est défini |
| **Même numéro + nom proche + date proche** | **Suggestion possible** — niveau 3 |
| **Similarité seule** | **Jamais** une relation établie automatiquement, sans une règle dont le sens est explicitement défini et vérifiable |

**Chaque résultat doit être EXPLICABLE**, en langage ordinaire, à l'endroit où
il est montré. Forme attendue :

> « Suggestion créée parce que :
> — même identifiant;
> — nom normalisé similaire;
> — même branche logique. »

Un seuil peut exister **à l'intérieur** d'une règle nommée. Il ne peut pas
**remplacer** la règle. « Score 0,87 » n'est pas une explication.

### 7. Le noyau reste en lecture seule sur les sources

**Réaffirmation de `I-1` et `I-2`**, sans exception ni assouplissement :

- **aucune relation FileTopo ne déplace un document**;
- **aucune approbation ne modifie la source**;
- **aucun rejet ne modifie la source**;
- **aucun calcul de hash ne modifie la source** — lecture seule, horodatages
  d'accès compris dans la mesure où le système le permet;
- **aucun moteur de règles ne modifie la source**.

**Tout l'état FileTopo — relations, suggestions, décisions, mémoire des
rejets — vit dans l'espace applicatif du cerveau**, jamais dans la racine
analysée. `P-22` reste **bloquante** et se rejoue à chaque clôture de tranche.

### 8. Le workflow humain de validation

Les suggestions deviennent une **partie centrale de l'expérience**, pas un
recoin.

**États minimaux :** `PENDING`, `APPROVED`, `REJECTED`.

**État optionnel :** `DEFERRED` / `REVIEW_LATER`, si et seulement si le besoin
est démontré. **Ne pas multiplier les états sans besoin** — chaque état
supplémentaire est une colonne, un filtre, un libellé bilingue et une règle de
transition.

**Dans la topographie**, une suggestion est **perceptible sans dépendre
uniquement de la couleur** — `P-21`, inchangée. Formes acceptables, à titre
conceptuel :

| | Suggestion | Relation approuvée |
|---|---|---|
| Trait | **pointillé** | **plein** |
| Marque | symbole `?` | symbole ou absence de marque, distinct |
| Texte | « à confirmer » | type de la relation |

**Activer une suggestion ouvre une explication simple**, contenant :

- la **source**;
- la **cible**;
- le **type proposé**;
- **pourquoi FileTopo la propose**;
- les **signaux observés**.

**Actions principales, trois, pas plus :**

> `[ Confirmer ]`  `[ Rejeter ]`  `[ Plus tard ]`

**Une file de révision simple** existe, du genre « **17 relations à
confirmer** », où l'utilisateur traite rapidement **oui / non / plus tard**.
**Aucune obligation d'ouvrir une interface technique** : ni éditeur de règles,
ni console, ni fichier de configuration.

**`Confirmer` transforme la suggestion en relation de provenance `APPROVED`.**
C'est la seule voie, et elle est inchangée depuis `X1`.

### 9. Mémoire des décisions humaines

**Le système mémorise les décisions.** Si une suggestion déterministe donnée a
été **rejetée**, FileTopo **ne la repropose pas indéfiniment** à chaque scan,
**sans changement pertinent** des données ou de la règle.

Une politique future devra identifier **au minimum** :

- la **suggestion**;
- la **règle** et sa **version**;
- les **extrémités**;
- la **décision**;
- la **date**;
- l'**éventuelle cause de réévaluation**.

**Ce n'est pas implémenté maintenant**, et la politique de réévaluation — quand
un rejet redevient discutable — n'est **pas arrêtée** par cette fiche. Ce qui
est arrêté, c'est qu'un rejet **coûte quelque chose au produit** et n'est pas
gratuit à ignorer.

## Options examinées

| Option | Avantages | Inconvénients |
|--------|-----------|---------------|
| **R-A — Aucun moteur : seules les relations saisies par l'utilisateur existent** | Coût nul; aucun faux positif possible | `DETERMINISTIC` reste une valeur morte; l'utilisateur doit tout saisir à la main, ce qui ne se fait jamais à l'échelle; le produit reste une visionneuse |
| **R-B — Moteur de score : une similarité pondérée crée les relations au-delà d'un seuil** | Simple à écrire; produit beaucoup de liens tout de suite | Inexplicable — « 0,87 » ne veut rien dire pour un utilisateur; produit des relations **fausses** avec l'autorité d'un fait; contredit `DEC-0009` et `X1`; un seuil est un réglage que personne ne sait choisir |
| **R-C — Moteur déterministe à règles nommées + suggestions explicites, sans IA** *(retenue)* | Chaque relation est explicable; la frontière entre fait, règle et hypothèse est **dans le modèle**, pas dans l'interface; fonctionne hors ligne, sans clé, sans compte; extensible par packs et, plus tard, par une couche IA qui ne produit que du niveau 3 | Demande d'écrire de vraies règles, une par une; certaines relations utiles resteront hors de portée sans extraction de contenu; le workflow humain est un travail à part entière |
| **R-D — LLM au cœur** | Trouve des liens qu'aucune règle n'atteint | Contredit `PROJECT_VISION.md` et `DEC-0012`; rend le produit inutilisable hors ligne; transforme chaque relation en affirmation invérifiable; expose des données par construction |

## Motif

**`R-C` plutôt que `R-B`** parce que le score est le piège précis que
`DEC-0009` et `X1` ont déjà refusé, sous un autre nom. Une relation créée par
un seuil est **indiscernable**, pour l'utilisateur, d'une relation prouvée : ni
l'une ni l'autre ne s'expliquent, et il n'a aucun moyen de savoir laquelle
croire. Le jour où il en trouve une fausse, il cesse de croire aux vraies.

**`R-C` plutôt que `R-A`** parce qu'un produit qui exige la saisie manuelle de
toutes ses relations n'en aura aucune. L'automatisation n'est pas un luxe :
c'est ce qui distingue une carte d'un tableur.

**`R-C` plutôt que `R-D`** parce que la vision l'exige — « utilisable sans
compte, connexion Internet ou modèle d'IA » — et parce que `DEC-0012` a placé
la frontière `F-D` exactement là. Cette fiche ne déplace pas la frontière :
elle remplit le côté **noyau** de la ligne, celui qui doit se suffire.

## Conséquences

- **Quatre fonctions sont ajoutées à la matrice**, toutes `MVP` :
  `F-043` (moteur de signaux et relations déterministes explicables),
  `F-044` (file de révision des suggestions),
  `F-045` (mémoire des décisions humaines),
  `F-046` (identité de contenu et doublons exacts).
- **`P-04` reste PARTIELLE** et n'est pas satisfaite par cette fiche. Elle le
  deviendra quand une règle réelle produira une relation réelle, prouvée sur
  fixtures.
- **`DEC-0012` est inchangée.** La frontière `F-D` tient : le noyau ne
  référence aucune table d'enrichissement, et cette fiche n'en crée aucune.
- **`F-021`, `F-037`, `F-038`, `F-039` restent `DIFFÉRÉ`.** Aucune règle du
  noyau ne dépend d'une extraction de contenu ou d'un OCR. Une règle qui en
  dépendrait appartient à la couche différée.
- **Le coût du hachage n'est pas évalué.** Hacher une arborescence entière est
  une opération dont le coût, le cache et l'invalidation sont un sujet à part —
  c'est pourquoi la séquence de `TASK-0021` §6 le sépare en deux tranches.
- **Aucun seuil, aucune pondération, aucune valeur numérique** n'est fixé par
  cette fiche, et aucun ne le sera hors d'une règle nommée.

## Preuves

**Aucune. Cette fiche est une décision d'architecture, pas un résultat.** Rien
n'a été implémenté, exécuté ni mesuré. Les niveaux, les signaux et le workflow
sont des **cibles à falsifier** dans des tranches futures.
