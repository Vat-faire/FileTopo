# CURRENT_STATE.md — État courant

**Dernière mise à jour :** 2026-08-26 — phases 0 à 5 vérifiées; publication différée.

## Résumé

FileTopo possède maintenant un MVP Windows local construit et vérifié.
L'application Tauri/Rust/React affiche une carte topographique synthétique,
un index accessible, une interface FR/EN et un pipeline réel
scanner → SQLite → DTO. Un exécutable release et un installateur NSIS ont été
produits localement, sans signature ni distribution. Le dossier de
préparation publique est complet et audité.

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
| 4 — MVP local | `VERIFIED` | `TASK-0006` |
| 5 — Préparation publique | `VERIFIED` | `TASK-0007` |
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

## Preuves de phase 4

- 11 tests Rust, 4 tests Vitest, TypeScript, Vite et Clippy strict réussis.
- Registre/index persistants, annulation sans index partiel, recherche et filtres paginés, état vu/non vu et ouverture confinée.
- Audit de dépendances de production : aucune vulnérabilité connue.
- 100 000 éléments synthétiques : indexation 587 ms, lecture 181 ms, recherche filtrée paginée 126 ms.
- Exécutable release et installateur NSIS construits; inspection visuelle FR/EN réussie.

## Preuves de phase 5

- Sécurité, confidentialité, modèle de menace, contribution, notes de version
  et checklist documentés.
- Inventaire reproductible : 16 entrées JavaScript de production, 172 entrées
  JavaScript complètes, 456 paquets Rust toutes cibles, aucune licence absente.
- Audit public réussi sur 102 fichiers candidats : aucun secret ou chemin
  personnel, aucun fichier supérieur à 5 Mio et aucun remote Git.
- Chaîne complète revue : 4 tests interface, 11 tests Rust, TypeScript, Vite,
  format Rust, Clippy strict, audit de vulnérabilités et build release/NSIS.
- Empreintes SHA-256 consignées dans `docs/releases/0.1.0.md`.

## Tâche active

Aucune tâche n'est active. `TASK-0007` et la phase 5 sont `VERIFIED`.
`ACTION-0011` demeure `DEFERRED` jusqu'au GO humain spécial de phase 6.

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

`ACTION-0011` : attendre le GO humain spécial avant toute action de phase 6.
