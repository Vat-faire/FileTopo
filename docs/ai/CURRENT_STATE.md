# CURRENT_STATE.md — État courant

**Dernière mise à jour :** 2026-08-26 — `TASK-0008` vérifiée;
`TASK-0009` approuvée, en attente de réauthentification GitHub.

## Résumé

FileTopo possède un MVP Windows local construit et vérifié. L'application
Tauri/Rust/React affiche une carte topographique, un index accessible, une
interface FR/EN et un pipeline réel scanner → SQLite → DTO.

Le **GO humain spécial de phase 6** a été donné par le propriétaire le
2026-08-26. Ce GO autorise la préparation et la publication contrôlée du code
source par l'orchestrateur, sans binaire, signature ni dépense. Le compte
GitHub cible est `Vat-faire`; son
authentification `gh` est **expirée**. Toute action distante — remote, push,
dépôt public, release — reste à faire par l'orchestrateur ou l'humain **après
réauthentification humaine**.

`TASK-0008` s'est déroulée en trois tours : une revue de
pré-publication, cinq décisions du propriétaire sur la langue, la détection
de locale, la fuite de chemins de compilation et les mentions nominatives,
puis une divulgation publique de l'assistance IA via `AI_ASSISTANCE.md`. Ces
changements ont été vérifiés indépendamment par l'orchestrateur et attendent
le commit local de clôture.

Les tests n'ont utilisé que `tests/fixtures_synthetic/demo` et des répertoires
temporaires. Aucun dossier utilisateur réel et aucun corpus privé n'ont été
lus, listés ou scannés.

## Identité publique approuvée

Approuvée par le propriétaire le 2026-08-26, pour rendre le projet attribuable
dans un portfolio professionnel :

- **publiable** : nom « Sébastien Dubé », copyright 2026, profil GitHub
  `https://github.com/Vat-faire`;
- **jamais publiable** : courriel réel, nom de compte Windows, chemin local
  absolu, document privé, toute autre donnée personnelle.

Les mentions nominatives se limitent à la paternité, la licence, la maintenance
et les métadonnées. Les mentions opérationnelles disent « le propriétaire ».

## Phases

| Phase | Statut | Preuve |
|-------|--------|--------|
| 0 — Isolation et démarrage | `VERIFIED` | `TASK-0001` |
| 1 — Recherche et positionnement | `VERIFIED` | `TASK-0002`, `TASK-0003` |
| 2 — Architecture | `VERIFIED` | `TASK-0004`, `DEC-0002` à `DEC-0005` |
| 3 — Squelette | `VERIFIED` | `TASK-0005` |
| 4 — MVP local | `VERIFIED` | `TASK-0006` |
| 5 — Préparation publique | `VERIFIED` | `TASK-0007` |
| 6 — Publication | `IN_PROGRESS` | `TASK-0008` vérifiée; `TASK-0009` approuvée |
| 7 — Fonctions avancées | `DEFERRED` | — |

## Preuves vérifiées de `TASK-0008`

Rapport complet : `docs/reviews/TASK-0008-independent-review.md`.
Preuves : `docs/ai/VALIDATION.md`, sections H et H bis.

- Chaîne de vérification : **12 étapes, 0 échec**. Tests d'interface **4 → 36**,
  tests Rust **11 → 13**, Clippy strict en debug **et** release.
- Formats validés par analyseur réel : 6 YAML, 3 JSON, 2 JSONC, **57 lignes
  JSONL sans erreur**, UTF-8 sans BOM.
- Documentation : 49 fichiers `.md`, **0 lien cassé**, 4 liens externes.
- Historique Git complet audité : **143 blobs**, objets non atteignables
  compris. **0 secret, 0 chemin personnel, 0 référence à un projet privé.**
- **Fuite de chemins de compilation corrigée et mesurée : 336 occurrences → 0**
  sur cinq motifs, deux encodages et deux artefacts. Nouvelles empreintes
  SHA-256 de la candidate finale dans `docs/releases/0.1.0-alpha.1.md`; les
  empreintes antérieures sont périmées.
- Documentation publique en **anglais**, avec `README.fr.md` équivalent.
- Langue de l'application : détection système, repli anglais, choix explicite
  mémorisé, **32 tests réels**.
- `AI_ASSISTANCE.md` (bilingue) : Sébastien Dubé détient l'idée, la vision,
  les décisions finales; orchestration OpenAI Codex; implémentation par
  OpenAI Codex et Anthropic Claude Code; aucun outil n'est auteur ni
  mainteneur, aucune affiliation impliquée. Réaudité : 118 fichiers, 0 motif
  sensible, 0 lien cassé.

## Tâche active

Aucune tâche n'est `IN_PROGRESS`. `TASK-0008` est `VERIFIED`; `TASK-0009` est
`APPROVED` et attend la réauthentification humaine du compte GitHub.

## Décidé

- Nom de travail public réversible : **FileTopo**.
- Licence MIT.
- Tauri 2 + Rust + React/TypeScript + Vite.
- SQLite embarqué, un index indépendant par collection.
- PixiJS/WebGL avec relief SVG de secours et liste DOM accessible.
- Windows d'abord, local, hors ligne, sans IA.
- **Anglais** comme langue principale de la documentation publique; français
  conservé pour `docs/ai/**`, `graph/**` et la checklist de release.
- Langue de l'application : choix explicite d'abord, puis langue système,
  puis anglais en repli.
- Nettoyage des chemins de compilation par `--remap-path-prefix`;
  `trim-paths` écarté car non stabilisé dans Cargo 1.98.
- Version publique candidate : **`0.1.0-alpha.1`**.
- Forme de publication : **prerelease source seulement**, aucun binaire non signé.

## Non décidé

- Identité visuelle finale.
- Paramètres UX définitifs des exclusions et du niveau de détail.
- Exécution réelle du workflow CI sur GitHub, impossible avant le premier push.

## Garde-fous

- Ne jamais lire, lister, copier ou modifier le corpus privé interdit.
- N'utiliser que des données synthétiques et des répertoires temporaires dans
  les tests.
- Ne pas choisir ou scanner un dossier réel à la place de l'utilisateur.
- Le GO de phase 6 autorise l'orchestrateur à publier la source selon
  `TASK-0009`; il n'autorise aucun binaire, signature ou dépense.
- Tout artefact destiné à sortir de la machine doit passer
  `scripts/scan-binary-for-personal-paths.ps1`, y compris après signature.
- Ne pas coller un journal de construction brut dans une issue publique : il
  contient le chemin de compilation, contrairement à l'artefact.
- Un seul exécuteur modifie le dépôt à la fois.

## Prochaine action

`ACTION-0013` : réauthentifier GitHub, puis publier la prerelease source
seulement selon `TASK-0009`.
