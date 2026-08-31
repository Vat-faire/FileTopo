# Vision de FileTopo

## Vision finale

FileTopo doit permettre à une personne non technique de comprendre et parcourir
son cerveau numérique sans programmer une carte. L'utilisateur choisit un
répertoire racine; l'application construit automatiquement une représentation
topographique interactive de sa hiérarchie réelle, puis la maintient à jour.

Le produit vise le grand public sur Windows : gratuit, général, open source,
local d'abord et utilisable sans compte, connexion Internet ou modèle d'IA.
La métaphore topographique doit rester lisible pour des arborescences
différentes, sans catégories personnelles codées en dur.

## Expérience souhaitée

Après la sélection d'une racine, FileTopo crée un cerveau indépendant, indexe
dossiers, fichiers, noms et métadonnées, puis affiche des blocs représentant la
structure réelle. La personne recherche, filtre, déplace et zoome la carte,
sélectionne un bloc, comprend parents, enfants et relations autorisées, consulte
les changements et ouvre un élément dans l'Explorateur Windows.

Plusieurs cerveaux peuvent coexister. Chacun conserve sa racine, son nom, sa
couleur, son icône, ses préférences, sa vue, son index et son état vu/non vu.

## Carte générique et relations

La hiérarchie vient exclusivement de l'arborescence observée. Les relations
transversales ne sont jamais inventées silencieusement : elles résultent d'une
règle déterministe documentée, d'une relation approuvée par l'utilisateur, ou
d'une suggestion facultative clairement identifiée et validée.

## MVP de reconstruction

Le MVP doit d'abord offrir un index de métadonnées fiable et reconstructible,
une persistance versionnée, une carte hiérarchique en blocs, la navigation et
les détails essentiels, puis une surveillance incrémentale robuste. Il demeure
en lecture seule sur les documents analysés. Extraction de contenu, OCR, IA,
RAG et GraphRAG sont hors du MVP structurel.

## Évolution facultative

L'extraction de formats approuvés et la recherche plein texte peuvent suivre
l'index fiable. Un futur chatbot RAG doit rester facultatif, citer précisément
les fichiers, accepter des fournisseurs configurables et des modèles locaux,
et exiger un consentement avant tout transfert distant. GraphRAG ne sera étudié
qu'après un RAG hybride cité et seulement si un besoin mesuré le justifie.

## Confidentialité et robustesse

Les index et caches vivent dans l'espace applicatif, jamais dans la racine
analysée. Les fichiers en ligne ne sont pas téléchargés automatiquement. Les
erreurs d'accès, lecteurs absents et fichiers verrouillés sont signalés sans
corrompre l'état. Aucune opération de renommage, déplacement, suppression ou
réécriture n'est permise sur les documents utilisateur.

## État actuel distinct

La version 0.1 alpha est conservée comme prototype historique. Elle prouve des
éléments techniques utiles, mais sa carte de points artificielle, sa persistance
partielle et l'absence de surveillance complète ne satisfont pas cette vision.
Voir [le bilan alpha](docs/archive/v0.1-alpha/BASELINE_ASSESSMENT.md) et
[la matrice fonctionnelle](docs/product/FEATURE_MATRIX.md).

## Critères de succès

- Une personne crée un cerveau en choisissant simplement une racine.
- La carte reflète automatiquement la hiérarchie réelle sans configuration codée.
- Plusieurs cerveaux reprennent leur état exact après redémarrage.
- Recherche, filtres, sélection, détails et ouverture Windows sont cohérents.
- Les changements sont détectés et appliqués incrémentalement avec historique.
- Une indisponibilité temporaire ne détruit ni l'index ni les préférences.
- Les documents sources restent inchangés, démontré par tests synthétiques.
- Le produit reste utile hors ligne et sans IA.
