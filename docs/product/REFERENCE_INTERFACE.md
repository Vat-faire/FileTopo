# Référence comportementale générique

Cette référence traduit le comportement souhaité sans reprendre code, données
ou catégories d'une interface privée de référence. Elle ne constitue pas une maquette finale.

| Domaine | Comportement cible | Mode |
|---|---|---|
| Création | Choisir une racine crée ou enregistre un cerveau et lance un flux guidé | Automatique avec confirmation |
| Blocs topographiques | Chaque dossier devient un bloc lisible; les fichiers apparaissent au niveau de détail pertinent | Automatique |
| Hiérarchie | Containment, parent et enfants directs proviennent de l'arborescence réelle | Automatique |
| Relations transversales | Montrées seulement si déterministes, approuvées ou suggérées explicitement | Configurable/futur |
| Couleurs et légende | Codage cohérent, accessible et expliqué; jamais fondé sur des catégories personnelles codées | Automatique et configurable |
| Recherche | Dossier, fichier, chemin, sujet ou rôle selon les couches disponibles | Automatique; sujet/rôle futur |
| Filtres | Tout, Nouveaux, Non vus et filtres issus des données du cerveau | Automatique et dynamique |
| Navigation | Déplacement libre de la carte, sélection clavier/souris et retour au contexte | Automatique |
| Zoom | Zoom avant/arrière centré de façon prévisible | Automatique |
| Ajustement | Ajuster la carte complète ou la sélection à l'écran | Automatique |
| Réinitialisation | Restaurer la vue enregistrée ou la vue initiale | Configurable |
| Panneau latéral | Masquer/afficher sans perdre sélection ni espace de travail | Configurable |
| Détails | Nom, type, chemin réel, taille, dates, état, parent, enfants et diagnostics | Automatique |
| Mise en évidence | Accentuer les relations de la sélection et atténuer le reste | Automatique |
| Relations | Distinguer hiérarchiques, entrantes, sortantes et transversales | Automatique selon provenance |
| Contenu d'un dossier | Lister les enfants directs et permettre leur sélection | Automatique |
| Chemin | Afficher et copier le chemin réel sans l'exposer ailleurs | Action explicite |
| Explorateur Windows | Ouvrir le dossier ou sélectionner le fichier après validation du confinement | Action explicite |
| Changements récents | Journaliser et filtrer créations, modifications, mouvements, renommages et suppressions | Automatique futur MVP |
| Vu/non vu | Marquer un élément ou changement vu, ou tout marquer vu | Action explicite |
| Actualisation | Commande manuelle et surveillance automatique incrémentale | Configurable |
| Indisponibilité | Conserver l'état et signaler lecteurs/fichiers temporaires inaccessibles | Automatique |
| Préférences | Mémoriser vue, panneau, filtres, légende, densité et accessibilité | Configurable |
| Plusieurs écrans | Adapter la disposition aux tailles d'écran; vues ou fenêtres multiples à étudier | Automatique/futur |
| Plusieurs cerveaux | Séparer racine, index, nom, couleur, icône, préférences et état | Configurable |
| Personnalisation | Nom, couleur, icône et présentation sans modifier les documents | Configurable |

## Règles de comportement

La carte se construit sans programmation manuelle. Une sélection ne crée jamais
de relation. Les relations suggérées sont visuellement distinctes et révocables.
Une opération d'interface ne renomme, ne déplace, ne supprime et ne réécrit
jamais les documents. Toute action externe ou coûteuse exige consentement.
