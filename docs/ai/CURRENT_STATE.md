# CURRENT_STATE.md — État courant

**Dernière mise à jour :** 2026-08-26 — phase 3 vérifiée; phase 4 démarrée.

## Résumé

FileTopo possède maintenant un squelette Windows local construit et vérifié.
L'application Tauri/Rust/React affiche une carte topographique synthétique,
un index accessible, une interface FR/EN et un pipeline réel
scanner → SQLite → DTO. Un exécutable et un installateur NSIS de débogage ont
été produits localement.

Les tests n'ont utilisé que `tests/fixtures_synthetic/demo` et des répertoires
temporaires. Aucun dossier utilisateur réel et aucun corpus privé n'ont été
lus, listés ou scannés.

Claude Code demeure arrêté. Codex poursuit directement; aucun crédit
Anthropic payant ne doit être consommé automatiquement.

## Phases

| Phase | Statut | Preuve |
|-------|--------|--------|
| 0 — Isolation et démarrage | `VERIFIED` | `TASK-0001` |
| 1 — Recherche et positionnement | `VERIFIED` | `TASK-0002`, `TASK-0003` |
| 2 — Architecture | `VERIFIED` | `TASK-0004`, `DEC-0002` à `DEC-0005` |
| 3 — Squelette | `VERIFIED` | `TASK-0005`, tests, mesures et inspection visuelle |
| 4 — MVP local | `IN_PROGRESS` | `TASK-0006` |
| 5 — Préparation publique | `DEFERRED` | — |
| 6 — Publication | `DEFERRED` | GO humain spécial requis |

## Preuves de phase 3

- TypeScript, Vitest et Vite réussis.
- Cinq tests Rust réussis, dont intégration fixture → SQLite → DTO.
- SQLite embarqué 3.53.2.
- 10 000 éléments : 97 ms pour génération, indexation et requête.
- 100 000 éléments : 1 027 ms pour le même pipeline.
- Exécutable Tauri et installateur NSIS construits.
- Inspection réelle via Ordinateur : relief visible, liste défilable et
  fixture synthétique chargée avec 9 éléments.

## Tâche active

`TASK-0006` est l'unique tâche `IN_PROGRESS`. Sa première tranche porte sur
le registre persistant des collections et les commandes Rust étroites, testés
uniquement dans des emplacements temporaires.

## Décidé

- Nom de travail public réversible : **FileTopo**.
- Licence MIT.
- Tauri 2 + Rust + React/TypeScript + Vite.
- SQLite embarqué, un index indépendant par collection.
- PixiJS/WebGL avec relief SVG de secours et liste DOM accessible.
- Windows d'abord, local, hors ligne, sans IA.

## Non décidé

- Identité visuelle finale.
- Paramètres UX définitifs des exclusions et du niveau de détail.

## Garde-fous

- Ne jamais lire, lister, copier ou modifier le corpus privé interdit.
- N'utiliser que des données synthétiques et des répertoires temporaires dans
  les tests.
- Ne pas choisir ou scanner un dossier réel à la place de l'utilisateur.
- Ne pas publier, réserver, acheter ou créer un dépôt distant sans le GO
  humain spécial requis.
- Ne pas relancer Claude ni activer des crédits Anthropic payants sans une
  nouvelle demande explicite de l'utilisateur.

## Prochaine action

`ACTION-0009` : construire le MVP local sans IA, en commençant par les
collections persistantes et leurs tests synthétiques.
