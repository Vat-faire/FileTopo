# Matrice fonctionnelle de reconstruction

Les états portent sur la cible réelle, pas sur les anciennes phases. Aucune
ligne n'est VERIFIED par TASK-0010; les preuves sont des constats statiques et
les tests applicatifs n'ont pas été rejoués.

| Identifiant | Fonction | Comportement cible | Prototype actuel | Preuve dans le dépôt | Écart | Priorité | Phase | État | Critères d'acceptation |
|---|---|---|---|---|---|---|---|---|---|
| F-001 | Choix de racine | Sélecteur Windows guidé | Présent | src-tauri/src/lib.rs:136 | Flux cerveau incomplet | P0 | 2 | IMPLEMENTED | Sélection synthétique testée, annulation sûre |
| F-002 | Cerveau indépendant | Racine, index et état isolés | Présent mais incomplet | registry.rs:60; lib.rs:229 | Préférences et reprise manquent | P0 | 3 | PROPOSED | Deux cerveaux ne partagent aucun état |
| F-003 | Scan hiérarchique | Dossiers, fichiers, noms, métadonnées | Présent | scanner.rs:46 | Robustesse à étendre | P0 | 2 | IMPLEMENTED | Arbre synthétique exact, sources inchangées |
| F-004 | Identifiants stables | Survivre aux changements raisonnables | IDs recréés par parcours | scanner.rs:68; index.rs:85 | Instables au déplacement | P0 | 2 | PROPOSED | Renommage/déplacement corrélé sans faux positif |
| F-005 | Exclusions | Règles sûres, visibles et configurables | Reparse points ignorés | scanner.rs:121 | Pas de politique complète | P0 | 2 | PROPOSED | Exclusions testées et explicables |
| F-006 | Index reconstructible | Refaire depuis la source sans perte | Schéma versionné, remplacement complet | index.rs:70,75 | Migration/reprise à préciser | P0 | 3 | PROPOSED | Reconstruction déterministe et atomique |
| F-007 | Carte en blocs | Blocs issus de la hiérarchie réelle | Points en spirale | synthetic.rs:79 | À remplacer | P0 | 4 | PROPOSED | Parent/enfants lisibles sur arbres variés |
| F-008 | Adaptation aux arbres | Disposition générique | Échantillonnage uniforme | TerrainMap.tsx:19 | Hiérarchie ignorée | P0 | 4 | PROPOSED | Fixtures de formes différentes restent lisibles |
| F-009 | Panoramique | Déplacer la carte | Aucune preuve trouvée | TerrainMap.tsx | Manquant | P1 | 5 | PROPOSED | Souris, pavé et clavier testés |
| F-010 | Zoom | Zoom avant/arrière | Niveau de détail seulement | TerrainMap.tsx:77 | Pas de transformation de vue | P1 | 5 | PROPOSED | Zoom borné et centré |
| F-011 | Ajuster à l'écran | Cadrer carte ou sélection | Aucune preuve trouvée | TerrainMap.tsx | Manquant | P1 | 5 | PROPOSED | Toute carte peut être recadrée |
| F-012 | Réinitialiser la vue | Restaurer vue initiale/enregistrée | Aucune preuve trouvée | App.tsx | Manquant | P1 | 5 | PROPOSED | Commande déterministe et accessible |
| F-013 | Panneau latéral | Masquer/afficher sans perte | Panneau fixe | App.tsx:358 | Commande et persistance manquent | P1 | 5 | PROPOSED | État conservé au redémarrage |
| F-014 | Légende | Couleurs expliquées | Légende dossiers/fichiers/en ligne | App.tsx:345 | Sémantique limitée | P1 | 5 | IMPLEMENTED | Légende accessible suit les données |
| F-015 | Sélection | Sélectionner un bloc | Points/liste sélectionnables | App.tsx:244; TerrainMap.tsx | Pas un bloc hiérarchique | P0 | 5 | IMPLEMENTED | Sélection synchronisée clavier/souris |
| F-016 | Relations hiérarchiques | Parent et enfants directs visibles | parent_id stocké | domain.rs:31 | Non visualisé | P0 | 5 | PROPOSED | Arêtes et panneau concordent avec l'arbre |
| F-017 | Relations transversales | Provenance explicite, jamais inventée | Aucun modèle observé | domain.rs | Manquant | P1 | 5 | PROPOSED | Chaque relation expose type et provenance |
| F-018 | Mise en évidence | Accentuer liés, atténuer non liés | Sélection agrandit un point | TerrainMap.tsx:59 | Relations non prises en compte | P1 | 5 | PROPOSED | États visuels accessibles et testés |
| F-019 | Relations entrantes/sortantes | Distinguer directions | Aucune preuve trouvée | domain.rs | Manquant | P2 | 5 | PROPOSED | Panneau et carte donnent mêmes comptes |
| F-020 | Recherche nom/chemin | Recherche locale simple | Présente et paginée | index.rs:128; App.tsx:113 | Sujet/rôle absent | P0 | 5 | IMPLEMENTED | Résultats exacts, bornés et cités |
| F-021 | Recherche sujet/rôle | Exploiter contenu/enrichissement | Non présente | aucun extracteur | Future | P2 | 10 | DEFERRED | Sources citées, fonctionnement local |
| F-022 | Filtres dynamiques | Tout, nouveaux, non vus et facettes | Type, en ligne, non vus | App.tsx:366 | Nouveaux et facettes manquent | P1 | 5 | PROPOSED | Filtres dérivés des données et combinables |
| F-023 | Détails | Chemin, dates, parent, enfants, état | Type, taille, nombre d'enfants | App.tsx:389 | Panneau insuffisant | P0 | 5 | PROPOSED | Toutes propriétés essentielles cohérentes |
| F-024 | Copier le chemin | Presse-papiers explicite | Aucune preuve trouvée | App.tsx | Manquant | P1 | 5 | PROPOSED | Copie exacte sans journal sensible |
| F-025 | Ouvrir dans Explorateur | Dossier ouvert/fichier sélectionné | Présent, confinement vérifié par code | lib.rs:310 | Non rejoué dans TASK-0010 | P0 | 5 | IMPLEMENTED | Essai Windows synthétique et erreurs gérées |
| F-026 | Contenu du dossier | Enfants directs consultables | Liste globale filtrée | App.tsx:378 | Vue contextuelle manque | P1 | 5 | PROPOSED | Liste exacte, paginée et navigable |
| F-027 | Journal de changements | Créations, modifications, mouvements, renommages, suppressions | Absent | replace_nodes dans index.rs | Manquant | P0 | 6 | PROPOSED | Événements synthétiques complets et ordonnés |
| F-028 | Vu/non vu | Élément/changement et tout marquer vu | Marquage d'un nœud vu | index.rs:178; App.tsx:244 | Pas changements ni tout marquer | P1 | 6 | PROPOSED | Persistance et commandes unitaires/globales |
| F-029 | Actualisation manuelle | Rafraîchir le cerveau | Réindexation manuelle complète | App.tsx:215 | Destructive pour l'index courant | P0 | 6 | PROPOSED | Mise à jour sûre avec résumé de changements |
| F-030 | Surveillance automatique | Observer sans rescanner inutilement | Absente | aucune commande watcher dans lib.rs | Manquant | P0 | 6 | PROPOSED | Rafales, pertes et reprise testées |
| F-031 | Mise à jour incrémentale | Modifier seulement les éléments touchés | DELETE puis réinsertion | index.rs:75-110 | À remplacer | P0 | 6 | PROPOSED | Coût proportionnel aux changements |
| F-032 | Indisponibilité temporaire | Conserver le dernier état fiable | Diagnostics de lecture | scanner.rs:92 | Reprise complète non prouvée | P0 | 6 | PROPOSED | Lecteur absent ne vide pas l'index |
| F-033 | Personnalisation | Nom, couleur, icône, préférences | Nom/couleur générés, pas d'icône | registry.rs:99-115 | Non configurable | P1 | 7 | PROPOSED | Valeurs éditables et persistantes |
| F-034 | Plusieurs cerveaux | Sélection et chargement indépendants | Onglets enregistrés | App.tsx:148,310 | Onglet ne charge pas l'index | P0 | 7 | PROPOSED | Redémarrage et bascule restaurent chaque carte |
| F-035 | FR/EN | Interface bilingue persistante | Présente | App.tsx; lib/locale.ts | Revalidation requise | P1 | 8 | IMPLEMENTED | Tests des deux langues et repli |
| F-036 | Accessibilité | Clavier, contraste, alternatives | Liste DOM et attributs partiels | App.tsx; TerrainMap.tsx | Audit absent | P1 | 8 | PROPOSED | Audit automatisé, clavier et manuel |
| F-037 | Extraction de contenu | Formats approuvés, facultatifs | Absente | aucun extracteur | Hors MVP structurel | P2 | 10 | DEFERRED | Provenance, opt-in et erreurs par format |
| F-038 | RAG cité | Réponses avec citations et choix fournisseur | Absent | aucune dépendance IA | Facultatif | P3 | 11 | DEFERRED | Réponse locale/citée, consentement distant |
| F-039 | GraphRAG | Seulement si besoin démontré | Absent | aucune dépendance graphe IA | Facultatif | P3 | 12 | DEFERRED | Gain mesuré après RAG fiable |
