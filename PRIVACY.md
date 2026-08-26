# Politique de confidentialité locale

FileTopo est conçu pour fonctionner hors ligne. Le MVP n'envoie aucune donnée
à un serveur, ne contient aucune télémétrie, publicité, IA distante ou mise à
jour automatique.

## Données traitées

Une collection n'est ajoutée qu'après choix explicite d'un dossier. Son
indexation ne commence qu'après une autre action explicite. Le scanner traite
des métadonnées de système de fichiers : noms, chemins relatifs, type,
taille, dates, attributs utiles et état en ligne seulement. Il ne lit pas le
contenu des documents et ne force pas le téléchargement d'un fichier en
ligne seulement.

## Stockage

Le chemin racine est conservé localement dans un registre natif; sous
Windows, sa représentation est stockée comme données UTF-16LE. L'interface
web n'en reçoit pas la valeur absolue. Les index SQLite sont enregistrés dans
le dossier de données local de FileTopo, séparément des collections. L'état
vu/non vu est également local.

## Contrôle de l'utilisateur

L'utilisateur choisit les dossiers, déclenche l'indexation, peut annuler un
scan et décide d'ouvrir un élément dans l'Explorateur. Une annulation ne
remplace pas l'index valide par un index partiel. La suppression manuelle des
données d'application relève actuellement des outils du système
d'exploitation; le MVP ne fournit pas encore une commande intégrée d'effacement.

## Limites

Les noms et chemins relatifs peuvent eux-mêmes contenir de l'information
sensible. Toute personne ayant accès au compte Windows et aux données locales
de l'application peut potentiellement les voir. FileTopo n'ajoute pas de
chiffrement applicatif et dépend des protections du compte, du disque et du
système d'exploitation.
