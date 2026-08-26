# TASK-0001 — Phase 0 : amorçage de la mémoire

- **Statut :** `VERIFIED`
- **Phase :** 0 — Amorçage de la mémoire (`VERIFIED`)
- **Ouverte le :** 2026-08-25
- **Livrée le :** 2026-08-25 (`IMPLEMENTED`)
- **Vérifiée le :** 2026-08-25 — **vérifié par l'orchestrateur sur preuves**
  (19 fichiers, absence de référence privée, UTF-8, JSONL, les deux YAML,
  état Git). L'agent exécuteur ne s'attribue pas `VERIFIED`.

---

## 1. Objectif

Amorcer la **mémoire permanente écrite** d'un nouveau projet public original de
cartographie topographique de dossiers et documents, afin que tout agent ou
toute personne reprenant le projet sache, sans contexte extérieur, ce que le
projet vise, ce qui est décidé, ce qui ne l'est pas, et quelle est la seule
action suivante.

**Aucun code applicatif.**

## 2. Périmètre

**Inclus** — création de fichiers de documentation et d'état dans le seul dépôt
`TopographicDocumentMap` : règles pour agents, vision, feuille de route,
`docs/ai/`, `docs/tasks/`, `docs/decisions/`, `docs/performance/`, `graph/`,
`tests/fixtures_synthetic/`.

**Exclu** — recherche, comparaison, architecture, modèle de données, prototype,
code, dépendance, test exécutable, décision de nom, de licence ou de pile
technologique, commit, publication.

## 3. Fichiers

| Fichier | État |
|---------|------|
| `AGENTS.md` | créé |
| `CLAUDE.md` | créé (contenu identique à `AGENTS.md`) |
| `PROJECT_VISION.md` | créé |
| `ROADMAP.md` | créé |
| `README.md` | créé |
| `docs/ai/START_HERE.md` | créé |
| `docs/ai/OPERATING_MANUAL.md` | créé |
| `docs/ai/CURRENT_STATE.md` | créé |
| `docs/ai/NEXT_ACTION.md` | créé |
| `docs/ai/HANDOFF.md` | créé |
| `docs/ai/VALIDATION.md` | créé |
| `docs/ai/CHANGELOG_AI.md` | créé |
| `docs/tasks/TASK-0001-phase-0-bootstrap.md` | créé (ce fichier) |
| `docs/decisions/README.md` | créé |
| `docs/performance/README.md` | créé |
| `graph/project_graph.yaml` | créé |
| `graph/current_state.yaml` | créé |
| `graph/history.jsonl` | créé |
| `tests/fixtures_synthetic/README.md` | créé |

## 4. Interdictions

1. Lire, lister ou écrire hors du dépôt.
2. Chercher, mentionner ou réutiliser quoi que ce soit d'un projet privé :
   nom, chemin, donnée, référence.
3. Écrire une donnée réelle, un secret, un jeton, un chemin local personnel.
4. Accéder au réseau, installer un outil, ajouter une dépendance.
5. Produire du code applicatif.
6. Créer un commit, une branche publique, un dépôt distant ; publier.
7. Décider le nom public, la licence ou la pile technologique.
8. Présenter la recherche, l'architecture ou le développement comme faits.
9. Inventer une adresse de dépôt, un compte ou un lien pour l'auteur.
10. S'attribuer l'état `VERIFIED` sans preuve indépendante.

## 5. Livrables

- Un jeu de règles unique et cohérent, dupliqué à l'identique dans `AGENTS.md`
  et `CLAUDE.md`.
- Une vision écrite énonçant les principes fondateurs et **ce qui reste ouvert**.
- Une feuille de route en 8 phases (0 à 7), sans surestimation de l'avancement.
- Une mémoire de travail dans `docs/ai/` couvrant : entrée, méthode, état,
  prochaine action, passation, vérification, journal.
- Des dossiers `docs/decisions/` et `docs/performance/` prêts à recevoir du
  contenu, avec leur convention d'usage.
- Un graphe d'état minimal, versionné, dans `graph/`.
- Un dossier de jeux d'essai **synthétiques uniquement**.

## 6. Validations effectuées

Détail complet et preuves dans `docs/ai/VALIDATION.md`.

**Vérifié :** dépôt initialement vide de tout fichier de projet ; création
effective de chacun des 19 fichiers ; règles identiques entre `AGENTS.md` et
`CLAUDE.md` ; `NEXT_ACTION.md` ne contient qu'une action, `PROPOSED`, avec GO
requis ; aucune tâche `IN_PROGRESS` ; aucun code, aucune dépendance, aucun
commit, aucun accès réseau ; aucun secret ni chemin local personnel.

**Vérifié par l'orchestrateur le 2026-08-25, sur preuves :** décompte de
19 fichiers ; absence de référence privée ; encodage UTF-8 ; syntaxe du JSONL ;
syntaxe des deux YAML ; état Git local. Un avertissement Git **non bloquant**
signale un fichier d'exclusion global inaccessible ; l'état local a bien été
obtenu.

**Non testé :** fins de ligne sur le disque ; cohérence des liens relatifs
entre documents.

**Inconnu :** tout ce qui relève de la phase 1 et au-delà.

## 7. Critères d'acceptation

| # | Critère | Résultat |
|---|---------|----------|
| 1 | Tous les fichiers de la section 3 existent | satisfait |
| 2 | `AGENTS.md` et `CLAUDE.md` portent les mêmes règles | satisfait |
| 3 | La vision couvre les dix principes demandés | satisfait |
| 4 | `ROADMAP.md` couvre les phases 0 à 7 sans surestimer l'avancement | satisfait |
| 5 | Aucune tâche `IN_PROGRESS` en fin de tâche | satisfait |
| 6 | `NEXT_ACTION.md` contient **exactement une** action `PROPOSED` avec GO requis | satisfait |
| 7 | Nom public et pile technologique restent non décidés | satisfait |
| 8 | Aucun code, dépendance, commit, réseau, publication | satisfait |
| 9 | Aucune donnée réelle, aucun secret, aucun chemin local personnel | satisfait |
| 10 | Aucune référence à un projet privé | satisfait |
| 11 | Textes en français, encodage UTF-8 | satisfait ; encodage **vérifié par l'orchestrateur** |
| 12 | Seuls les huit états permis sont employés | satisfait après correction du 2026-08-25 |

## 8. Conditions d'arrêt

La tâche s'arrête, et un GO humain est demandé, dès que l'un de ces cas se
présente :

- une action exigerait de sortir du dépôt ;
- une action exigerait le réseau, une installation ou une dépendance ;
- une décision de nom, de licence ou de pile technologique deviendrait
  nécessaire ;
- du code applicatif deviendrait nécessaire ;
- un commit ou une publication deviendrait nécessaire ;
- une donnée réelle serait requise pour avancer.

**Aucune de ces conditions n'a été rencontrée.** La tâche s'est arrêtée par
achèvement de ses livrables.

## 9. Rapport

**Résultat :** livrables produits (`IMPLEMENTED`), puis `VERIFIED` le
2026-08-25 par l'orchestrateur sur preuves.

19 fichiers créés dans un dépôt qui n'en contenait aucun. Le projet dispose
désormais d'une mémoire écrite autoportante : règles d'agent, vision assortie
de ses limites, feuille de route honnête sur l'avancement, état courant,
prochaine action unique, passation et régime de preuve.

**Ce qui n'est pas exécuté :** la recherche, l'architecture, le développement.
Le nom public, la licence et la pile technologique restent ouverts.

**Risques :** qu'un lecteur prenne cette mémoire pour un acquis technique ;
qu'un agent enchaîne sur la phase 1 sans GO ; que des données réelles soient
introduites plus tard dans un dépôt destiné à devenir public.

**Suite :** `ACTION-0002` (`docs/ai/NEXT_ACTION.md`) — préparer la recherche de
phase 1, sans l'exécuter, sous réserve d'un GO humain.
