# TASK-0005 — Phase 3 : squelette vérifiable

- **Statut :** `VERIFIED`
- **Phase :** 3 — Squelette vérifiable
- **Ouverte et démarrée le :** 2026-08-25
- **Approuvée via :** autorisation permanente du 2026-08-25
- **Exécutant :** Codex
- **Livrée le :** 2026-08-26
- **Vérifiée le :** 2026-08-26
- **Vérifiée par :** orchestrateur, sur tests et inspection visuelle séparés

## Objectif

Construire la première preuve locale de bout en bout de FileTopo : projet
Tauri/Rust/React, licence MIT, domaine et SQLite testés, fixture synthétique
en lecture seule, commandes IPC étroites, rendu PixiJS minimal et liste DOM
accessible. Le squelette doit construire et tester sur la machine disponible.

## Livrables

- Projet Tauri 2 + Vite + React + TypeScript dans le dépôt existant.
- Cœur Rust structuré en modules domaine/index/scanner/commandes.
- Base SQLite versionnée et migrations initiales.
- Fixture physique synthétique et générateur logique déterministe.
- Interface FR/EN minimalement navigable.
- Carte agrégée PixiJS + liste DOM synchronisée.
- Tests unitaires Rust/frontend et premiers benchmarks synthétiques.
- Documentation de construction et résultats mesurés.

## Périmètre fonctionnel

1. Écran d'accueil FileTopo et création d'une collection synthétique.
2. Scan strictement limité à une racine choisie ou fixture du dépôt.
3. Aucune lecture du contenu; métadonnées seulement.
4. Index SQLite dans un dossier temporaire/AppData, jamais dans la racine.
5. Requête paginée d'éléments et statistiques de base.
6. Carte minimale avec agrégats et sélection; liste accessible équivalente.
7. Annulation et erreurs affichées sans crash.

## Critères d'acceptation

1. `pnpm install`, vérification TypeScript, tests et build réussissent.
2. `cargo test` et vérifications Rust réussissent.
3. Test d'intégration : fixture → index → requête → DTO de rendu.
4. Le scanner ne modifie aucun fichier source; preuve par empreintes avant/après.
5. Aucun chemin arbitraire/SQL brut exposé au frontend.
6. Aucun réseau à l'exécution de l'application.
7. Aucune donnée réelle ou référence privée.
8. Licence MIT et avis de tiers préparés.
9. Mesures 10 k et 100 k publiées, ou limite d'environnement explicitée.
10. États et mémoire synchronisés; livraison `IMPLEMENTED`, vérification séparée.

## Interdictions

- Ne jamais scanner un dossier utilisateur réel pendant les tests.
- Ne pas suivre jonctions/liens symboliques.
- Ne pas publier ni créer de dépôt distant.
- Ne pas activer télémétrie, mise à jour automatique ou CDN.
- Ne pas utiliser Claude ni des crédits Anthropic pour cette tâche.

## Résultat livré

- Squelette Tauri/Rust/React construit sous Windows.
- Scanner de métadonnées sans suivi de liens ou points de réanalyse.
- SQLite embarqué 3.53.2 et requêtes paginées côté Rust seulement.
- Fixture physique synthétique, générateur déterministe et empreinte
  avant/après inchangée.
- Carte PixiJS et relief SVG de secours, liste DOM accessible, FR/EN.
- Exécutable et installateur NSIS locaux.

## Vérification

| Contrôle | Résultat |
|----------|----------|
| `pnpm check` | réussi |
| `pnpm test` | 1 test réussi |
| `pnpm build` | réussi, 748 modules |
| `cargo test` | 5 tests réussis |
| Pipeline fixture → index → DTO | réussi, 9 éléments |
| Empreinte fixture avant/après | identique |
| Mesure 10 k | 97 ms total |
| Mesure 100 k | 1 027 ms total |
| Build Tauri + NSIS | réussi |
| Inspection visuelle Ordinateur | relief visible et fixture fonctionnelle |

Les résultats détaillés sont consignés dans
`docs/performance/phase-3-measurements.md` et
`docs/ai/VALIDATION.md`. Les critères de la tâche sont satisfaits; les
limites de mesure restent explicitement transmises à la phase 4.
