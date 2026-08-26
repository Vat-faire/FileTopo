# Guide utilisateur — FileTopo

FileTopo transforme les métadonnées d’un dossier en carte topographique locale. L’application fonctionne hors ligne, sans IA ni télémétrie, et ne lit jamais le contenu des fichiers pendant l’indexation.

## Ajouter et indexer une collection

1. Cliquez sur **Ajouter une collection**.
2. Choisissez vous-même le dossier racine dans la fenêtre Windows. Annuler ne crée rien.
3. La racine est seulement enregistrée; aucun scan ne démarre automatiquement.
4. Cliquez sur **Indexer maintenant** pour lancer le scan. Le bouton affiche la progression et permet d’annuler.

L’index SQLite est écrit dans les données privées de l’application, jamais dans le dossier choisi. Les liens symboliques, jonctions et autres points de réanalyse sont signalés comme ignorés et ne sont pas suivis. Une annulation ne remplace pas un index valide par un index partiel.

## Explorer

- Cliquez sur un relief ou une ligne pour synchroniser la carte et la fiche de sélection.
- Les points turquoise indiquent les éléments non encore consultés.
- Utilisez la recherche, le filtre **Dossiers/Fichiers**, **En ligne** ou **Non vus**. Les grandes listes sont paginées par blocs de 120.
- Les boutons **−** et **+** règlent le nombre de repères affichés sur la carte.
- Pour une collection locale, **Afficher dans l’Explorateur** est la seule action qui ouvre Windows. Elle exige un clic explicite et ne peut viser qu’un chemin déjà indexé sous la racine enregistrée.

## Confidentialité et limites

- Les noms, chemins relatifs, tailles, dates et attributs nécessaires restent sur l’ordinateur.
- Un fichier « en ligne seulement » est détecté par ses attributs; FileTopo ne demande pas son téléchargement.
- Si un élément change après l’indexation, reconstruisez l’index. Un élément supprimé ou remplacé par un point de réanalyse refuse de s’ouvrir.
- La version actuelle est un MVP Windows local. Elle n’est pas publiée et ne contient pas de mise à jour automatique.

Les boutons **Démonstration** et **Fixture synthétique** permettent d’explorer FileTopo sans choisir un dossier personnel.
