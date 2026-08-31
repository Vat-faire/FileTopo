# Bilan du prototype public v0.1 alpha

- **Date d'audit :** 2026-08-31
- **Méthode :** lecture statique ciblée du dépôt au commit de base
  91bbe90f0f99026c28cd345784d4f579a0016db2
- **Tests exécutés pendant TASK-0010 :** aucun test applicatif

## Présent et vérifié dans le code

- Tauri 2 et backend Rust : package.json, src-tauri/Cargo.toml et src-tauri/src/lib.rs.
- React/TypeScript et Vite : package.json et src/.
- SQLite embarqué : rusqlite dans Cargo.toml; registre et index dans
  src-tauri/src/registry.rs et index.rs.
- Sélection d'une racine, registre de collections, scan de métadonnées,
  indexation hors de la racine et diagnostics : lib.rs, registry.rs, scanner.rs.
- Recherche simple, filtres type/en ligne/non vu et pagination : index.rs et App.tsx.
- Ouverture confinée dans l'Explorateur Windows : reveal_indexed_node dans lib.rs.
- Interface française et anglaise, préférence de langue locale : App.tsx et lib/locale.ts.
- État vu/non vu minimal persistant par chemin : index.rs et App.tsx.

Vérifié signifie ici présence et lecture du code, pas exécution durant TASK-0010.

## Démonstration synthétique

App.tsx appelle demo_snapshot au démarrage, indépendamment de la collection
active. synthetic.rs et lib/demo.ts créent des territoires et documents
inventés. La disposition emploie un angle, une racine carrée de l'index et une
spirale; elle n'est pas dérivée de la hiérarchie pour former des blocs.

## Persistant mais incomplet

Le registre SQLite conserve plusieurs collections, leur racine, un nom dérivé,
une couleur et des statistiques. Un index SQLite existe par collection. Le
choix de langue persiste dans localStorage et le vu/non vu dans l'index.

Cependant l'interface choisit le premier identifiant enregistré sans charger
son instantané. Cliquer un onglet change seulement activeCollectionId; aucune
commande ne recharge la carte. Le nom, la couleur et l'icône ne sont pas tous
personnalisables; l'état de vue et les préférences complètes ne sont pas
persistés.

## Fonctionnement partiel

- Le scan lit métadonnées et hiérarchie, mais replace_nodes supprime puis
  réinsère tous les nœuds : aucune actualisation incrémentale.
- Le panneau montre quelques propriétés et l'ouverture Windows, mais pas le
  chemin complet copiable, le parent, les enfants détaillés ni les relations.
- La carte sélectionne des points avec niveau de détail, mais n'offre pas les
  blocs hiérarchiques, pan/zoom/ajustement/réinitialisation attendus.
- Vu/non vu concerne les nœuds; aucun journal complet de changements.
- Les fichiers en ligne seulement sont détectés par attributs, sans preuve
  d'un scénario complet d'indisponibilité temporaire.

## Manquant par rapport à la vision

Carte hiérarchique en blocs, relations visuelles et provenance, surveillance
automatique, journal des créations/modifications/déplacements/renommages/
suppressions, nouveaux éléments, tout marquer vu, panneau détaillé, copie du
chemin, contenu du dossier, préférences complètes, chargement persistant au
redémarrage et robustesse complète des lecteurs absents.

## À conserver ou réutiliser après preuve

À conserver : historique, licence MIT, fixtures synthétiques, séparation
registre/index, scanner de métadonnées prudent, requêtes paginées, confinement
des chemins, socle FR/EN et principes de lecture seule. Réutilisation seulement
après tests ciblés et décision de phase.

## À remplacer ou réévaluer

À remplacer : placement artificiel de la carte et démarrage centré sur la
démonstration. À réévaluer : schéma d'identifiants numériques reconstruits,
préservation du vu par chemin, stratégie de remplacement complet, modèle
collection/cerveau, limites à 2 000/5 000 points et architecture des panneaux.

## Documentation historique

Les documents antérieurs déclarant les phases 0 à 6 VERIFIED décrivent une
portée plus réduite. Leurs preuves historiques ne sont pas effacées, mais elles
ne prouvent pas la vision réelle reformulée par TASK-0010. Le fichier de tâche
TASK-0008 porte encore IMPLEMENTED alors que d'autres mémoires le disent
VERIFIED : exemple d'incohérence historique à ne pas utiliser comme état courant.

## Tests réellement présents

Lecture statique : 36 cas Vitest sont déclarés dans App.test.tsx et
lib/locale.test.ts, surtout démonstration, filtres, collections affichées et
langue. Treize tests Rust sont déclarés dans scanner, index, registry, synthetic
et lib, couvrant aussi lecture seule synthétique, index et confinement. Ces
comptages décrivent les tests présents au commit de base.

## Non exécuté pendant TASK-0010

Vitest, TypeScript, Vite, Cargo test, rustfmt, Clippy, build Tauri, installateur,
inspection manuelle de l'interface et essai physique Windows : non testés.

## Limites de l'audit

Audit statique ciblé, sans installation ni compilation. L'absence d'un symbole
recherché ne prouve pas l'absence de tout comportement indirect. Aucun document
réel, lecteur externe ou interface privée de référence n'a été consulté. graph/ a été lu
sans modification : current_state.yaml et project_graph.yaml se contredisent
sur les phases et tâches, donc le graphe nécessite une future normalisation
approuvée avant de redevenir une source d'état fiable.
