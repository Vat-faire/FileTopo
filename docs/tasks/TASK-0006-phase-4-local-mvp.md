# TASK-0006 — Phase 4 : MVP local sans IA

- **Statut :** `VERIFIED`
- **Phase :** 4 — MVP local sans IA
- **Ouverte et démarrée le :** 2026-08-26
- **Approuvée via :** autorisation permanente du 2026-08-25
- **Exécutant :** Codex
- **Livrée et vérifiée le :** 2026-08-26
- **Vérifiée par :** orchestrateur

## Objectif

Transformer le squelette vérifié en MVP Windows utilisable, local et hors
ligne : collections indépendantes, sélection explicite d'une racine,
indexation annulable et reconstructible, navigation progressive, recherche,
filtres et ouverture contrôlée d'un élément.

## Livrables

- Registre local de collections, sans donnée du corpus dans le dépôt.
- Sélecteur de dossier natif déclenché explicitement par l'utilisateur.
- Index SQLite persistant dans les données d'application, jamais dans la
  racine choisie.
- Scan en arrière-plan avec progression, annulation et diagnostics.
- Recherche et filtres paginés côté Rust.
- Carte progressive avec niveau de détail et navigation synchronisée.
- États vu/non vu, fichiers en ligne seulement et exclusions sûres.
- Ouverture explicite d'un fichier ou dossier par commande étroite.
- Tests uniquement sur répertoires temporaires et fixtures synthétiques.
- Guide utilisateur FR/EN et mesures actualisées.

## Critères d'acceptation

1. Aucune racine n'est scannée sans choix explicite dans l'interface.
2. Le contenu des fichiers n'est jamais lu pour l'indexation.
3. Les liens, jonctions et points de réanalyse ne sont jamais suivis.
4. L'index persistant réside hors du corpus et peut être reconstruit.
5. Progression, annulation et erreurs partielles n'entraînent aucun crash.
6. Recherche, filtres et pagination fonctionnent à 100 k synthétiques.
7. Carte et liste restent utilisables au clavier et en FR/EN.
8. L'ouverture d'un élément exige une action explicite de l'utilisateur.
9. Tests, build Windows et audit local réussissent.
10. Aucun réseau, IA, télémétrie, donnée réelle ou publication.

## Interdictions

- Ne jamais choisir, parcourir ou scanner un dossier utilisateur à la place
  de l'utilisateur pendant le développement ou les tests.
- Ne jamais utiliser le corpus privé interdit, même pour un test en lecture.
- Ne pas publier ni créer de dépôt distant.
- Ne pas relancer Claude ou consommer des crédits Anthropic.

## Résultat vérifié

- Registre SQLite de collections persistant, racines encodées et jamais exposées au frontend.
- Choix natif explicite sans scan automatique; index séparé, progression, annulation et conservation atomique de l’index valide.
- Scanner de métadonnées seulement, sans suivi de liens, jonctions ou points de réanalyse.
- Recherche et filtres paginés côté Rust, états vu/non vu persistants et détection des fichiers en ligne seulement.
- Carte synchronisée avec niveau de détail de 150 à 2 000 repères et liste DOM navigable au clavier.
- Ouverture explicite confinée à un ID déjà indexé; chemins échappés, absents, ignorés ou devenus points de réanalyse refusés.
- Guides FR/EN et mesures à 10 000/100 000 éléments produits.
- 11 tests Rust, 4 tests Vitest, TypeScript, Vite, Clippy strict, audit de dépendances, exécutable release et installateur NSIS réussis.
- Deux inspections réelles de l’exécutable ont validé mise en page, filtres, sélection, LOD et bilinguisme. Données synthétiques seulement.

Les 10 critères d’acceptation sont conformes. Aucun corpus réel ou privé, aucune publication et aucun crédit Anthropic n’ont été utilisés.
