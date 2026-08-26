# PROJECT_VISION.md — Vision du projet

> Document d'intention. Rien de ce qui suit n'est développé à ce jour.
> Statut : **vision initiale, non validée par la recherche de phase 1.**

## 1. Idée directrice

Offrir une **carte topographique** de dossiers et de documents : au lieu d'une
arborescence en liste, une représentation en relief où la densité, le volume,
l'ancienneté ou la parenté des contenus dessinent un paysage lisible d'un coup
d'œil. L'utilisateur retrouve, comprend et navigue son propre corpus.

## 2. Positionnement

- **Application publique et générale.** Elle ne vise aucun métier, aucune
  organisation et aucun corpus particulier. Tout utilisateur doit pouvoir
  l'employer sur ses propres dossiers.
- **Gratuite.** Aucun paiement, aucun compte requis, aucune fonction retenue
  derrière une offre payante.
- **MVP sans compte, sans clé, sans abonnement, sans télémétrie
  obligatoire.** Aucun de ces éléments n'est requis pour utiliser le produit
  local hors ligne.
- **Licence envisagée : MIT**, *sous réserve de vérification* en phase 1
  (compatibilité avec les composants éventuellement réutilisés, disponibilité du
  nom, obligations d'attribution). La licence n'est **pas** figée.

## 3. Principes fondateurs

### 3.1 Local d'abord

La carte est **locale**. L'analyse s'exécute sur la machine de l'utilisateur.
Aucun envoi de contenu de document vers un service distant n'est prévu.

### 3.2 Windows d'abord

La première plateforme cible est **Windows**. Les autres systèmes ne sont pas
exclus mais ne sont pas un objectif du MVP.

### 3.3 MVP hors ligne et sans IA

Le premier produit utilisable fonctionne **sans connexion réseau** et **sans
modèle d'intelligence artificielle**. Le classement, le regroupement et le
relief reposent sur des signaux déterministes et explicables (structure,
métadonnées, tailles, dates, extensions, similarité textuelle simple).
Toute couche d'IA éventuelle serait postérieure, optionnelle et désactivable.

### 3.4 Plusieurs cerveaux indépendants

Un utilisateur peut créer **plusieurs cerveaux** (chacun doté d'un nom, d'une
couleur et d'une icône), chacun associé à une **racine** choisie par
l'utilisateur. Chaque cerveau est **indépendant** : son index, sa carte et ses
réglages lui sont propres, et en supprimer un n'affecte pas les autres.
Dans un cerveau, l'utilisateur **navigue**, **recherche** et **filtre** une
carte progressive, et peut **ouvrir un fichier ou un dossier avec
l'application Windows associée**. La carte distingue les changements récents
et un état **vu / non vu** par élément.

### 3.5 Index reconstructible, versionné, et surveillance incrémentale

L'index d'un cerveau est **reconstructible** (il peut être régénéré à
l'identique depuis la racine) et **versionné** (son format porte un numéro de
version). Des **exclusions sûres** (dossiers système, temporaires, volumineux
non pertinents, etc.) peuvent être définies pour ne pas indexer ce qui n'a pas
lieu de l'être. Après une première analyse, les évolutions sont prises en
compte de façon **incrémentale** : seuls les éléments modifiés sont retraités,
sans re-parcours complet systématique. Les **fichiers en ligne seulement**
(par exemple des espaces de stockage synchronisés à la demande) ne sont
**jamais téléchargés automatiquement** par l'application.

### 3.6 Robustesse Windows et accessibilité FR/EN

L'application vise une **robustesse** particulière sur Windows (chemins
longs, caractères spéciaux, verrous de fichiers, permissions, lecteurs
amovibles ou réseau). L'interface est prévue **bilingue français / anglais**
dès la conception, avec attention aux contrastes, à la navigation au clavier,
aux tailles de texte et aux alternatives non purement visuelles à la carte.

### 3.7 Rendu non décidé

Le mode de rendu de la carte (SVG, Canvas, WebGL) n'est **pas décidé** à ce
stade. Le choix se fait après comparaison, en phase 2 (voir `ROADMAP.md`).

### 3.8 Non-destruction par défaut

**Par défaut, et pour tout le MVP, l'application ne modifie jamais les
documents ni les dossiers analysés.** Aucune réorganisation physique du
corpus n'est prévue dans le MVP : lecture seule, aucun renommage, déplacement,
réécriture ni suppression des documents de l'utilisateur. Les artefacts
produits (index, cache) sont stockés à part et sont supprimables sans
conséquence sur le corpus.

Une **fonction future et facultative** de classement pourrait proposer un
classement **virtuel** (sans toucher aux fichiers réels), avec aperçu,
simulation, confirmation explicite, journal des actions et possibilité de
restauration. Une telle fonction reste hypothétique : elle n'est ni décidée ni
développée à ce jour (voir phase 7 de `ROADMAP.md`).

## 4. Hors périmètre du MVP

- Synchronisation dans le nuage, comptes utilisateurs, collaboration.
- Rangement automatique ou correction physique de l'arborescence de
  l'utilisateur.
- Fonctions payantes, télémétrie obligatoire, publicité.
- **IA, OCR et connecteurs vers des services distants** : envisageables
  seulement comme fonctions **futures**, **facultatives** et **explicitement
  activées** par l'utilisateur (voir phase 7 de `ROADMAP.md`) ; absents du
  MVP.

## 5. Non décidé

Entrants de la **phase 1** (voir `ROADMAP.md`) :
- **Nom public final** du projet — le nom de dossier actuel est provisoire.
- **Licence définitive** (MIT reste l'hypothèse de travail).

Entrants de la **phase 2** (voir `ROADMAP.md`) :
- **Pile technologique** (langage, format d'index).
- **Mode de rendu** (SVG, Canvas, WebGL) et méthode de disposition.
- Modèle de représentation du relief.
