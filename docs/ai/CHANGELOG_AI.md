# CHANGELOG_AI.md — Journal des interventions d'agents

Ordre chronologique, du plus ancien au plus récent. Une entrée par intervention.

---

## 2026-08-25 — TASK-0001 — Amorçage de la mémoire (phase 0)

**Agent :** exécuteur Claude Code
**Statut à l'issue :** `VERIFIED` (livré `IMPLEMENTED`, puis vérifié par
l'orchestrateur sur preuves le 2026-08-25)

### Fait

- Création des règles de travail : `AGENTS.md` et `CLAUDE.md` (contenu
  identique) — périmètre au dépôt, lecture seule des documents utilisateur,
  une seule tâche `IN_PROGRESS`, preuves obligatoires, GO humain avant étape
  importante.
- Création de `PROJECT_VISION.md` : application publique, générale, gratuite,
  MIT sous réserve de vérification, carte topographique locale, Windows d'abord,
  MVP hors ligne sans IA, collections indépendantes, surveillance incrémentale,
  accessibilité FR/EN, non-destruction.
- Création de `ROADMAP.md` : phases 0 à 7, phase 0 seule engagée.
- Création de `README.md` : dépôt local d'amorçage, nom de dossier provisoire,
  aucune fonction terminée, création originale de Sébastien Dubé, aucune adresse
  de dépôt public inventée.
- Création de `docs/ai/` : `START_HERE.md`, `OPERATING_MANUAL.md`,
  `CURRENT_STATE.md`, `NEXT_ACTION.md`, `HANDOFF.md`, `VALIDATION.md`,
  `CHANGELOG_AI.md`.
- Création de `docs/tasks/TASK-0001-phase-0-bootstrap.md`.
- Création de `docs/decisions/README.md` et `docs/performance/README.md`.
- Création de `graph/project_graph.yaml`, `graph/current_state.yaml`,
  `graph/history.jsonl` (schémas minimaux versionnés).
- Création de `tests/fixtures_synthetic/README.md` : aucune donnée réelle
  autorisée.

### Non fait, volontairement

- Aucun code applicatif, aucune dépendance, aucune installation.
- Aucun accès réseau, aucune publication, aucun commit.
- Aucune recherche, aucune architecture, aucun prototype.
- Aucun choix de nom public, de licence ni de pile technologique.

### Vérifié par l'orchestrateur (2026-08-25)

19 fichiers, absence de référence privée, encodage UTF-8, syntaxe du JSONL et
des deux YAML, état Git local. Avertissement Git **non bloquant** : fichier
d'exclusion global inaccessible, sans effet sur la lecture de l'état local.

### Non testé

Fins de ligne sur le disque, cohérence des liens relatifs. Détail dans
`VALIDATION.md`.

---

## 2026-08-25 — TASK-0001 — Correction du vocabulaire d'états

**Agent :** exécuteur Claude Code
**Motif :** non-conformité relevée par l'orchestrateur — emploi de `VALIDATED`
et `NOT_STARTED`, hors des huit états permis.

- Les huit états permis (`PROPOSED`, `APPROVED`, `IN_PROGRESS`, `BLOCKED`,
  `IMPLEMENTED`, `VERIFIED`, `REJECTED`, `DEFERRED`) et leur sens sont inscrits
  dans `AGENTS.md`, `CLAUDE.md`, `OPERATING_MANUAL.md` et
  `graph/project_graph.yaml`.
- `VALIDATED` → `VERIFIED` ; `human_validated` → `verified`.
- Phase 0 et TASK-0001 → `VERIFIED`, sur preuves de l'orchestrateur.
- Phase 1 → `PROPOSED` ; phases 2 à 7 → `DEFERRED`.
- `VALIDATION.md`, `graph/current_state.yaml` et `graph/history.jsonl` portent
  les preuves réelles de la vérification.

Aucun fichier créé, aucun fichier supprimé. `NEXT_ACTION.md` inchangé : une
seule action, `ACTION-0002`, `PROPOSED`, GO requis. **Aucun travail de phase 1
n'a démarré.**

### Suite

`ACTION-0002` dans `NEXT_ACTION.md` : préparer la recherche de phase 1.
`PROPOSED`, **GO humain requis**, sans exécution de la recherche.

---

## 2026-08-25 — Correction documentaire : alignement sur le prompt maître

**Agent :** exécuteur Claude Code
**Motif :** non-conformités relevées entre la documentation existante et le
prompt maître (intitulés de phases, éléments de vision manquants, vocabulaire
d'états hors gabarits de décisions/performance).

- `ROADMAP.md` : intitulés des huit phases corrigés — 0 Isolation et
  démarrage (`VERIFIED`), 1 Recherche et positionnement (`PROPOSED`), 2
  Architecture, 3 Squelette vérifiable, 4 MVP local sans IA, 5 Préparation
  publique, 6 Publication (GO humain spécial obligatoire), 7 Fonctions
  avancées facultatives (`DEFERRED`). Nom public et licence rattachés à la
  phase 1 ; pile technologique et mode de rendu rattachés à la phase 2.
  Contenus décrits comme envisagés, non comme exécutés.
- `PROJECT_VISION.md` : ajout des éléments de vision absents — cerveaux
  nommés/colorés/iconisés, navigation/recherche/filtre de la carte
  progressive, ouverture des fichiers et dossiers via Windows, état vu/non
  vu, MVP sans compte/clé/abonnement/télémétrie obligatoire, index
  reconstructible et versionné, exclusions sûres, surveillance incrémentale,
  fichiers en ligne seulement non téléchargés automatiquement, robustesse
  Windows, mode de rendu (SVG/Canvas/WebGL) non décidé avant comparaison,
  IA/OCR/connecteurs distants comme fonctions futures, facultatives et
  explicites. La non-destruction est reformulée comme règle du MVP (« par
  défaut »), sans clause « sans exception » présentée comme permanente ; une
  fonction future de classement virtuel avec aperçu, simulation,
  confirmation, journal et restauration est mentionnée comme hypothèse non
  décidée.
- `docs/ai/CURRENT_STATE.md` et `docs/ai/HANDOFF.md` : mis en cohérence avec
  les nouveaux intitulés de phases et de vision.
- `docs/decisions/README.md` : le gabarit remplace `ACCEPTED`/`SUPERSEDED`
  par les huit états permis et ajoute un champ `replaced_by` séparé.
- `docs/performance/README.md` : le gabarit remplace le statut
  `MESURÉ`/`NON TESTÉ` par un état permis, avec un champ `Résultat` distinct
  (mesuré / non testé) pour le constat textuel.
- `graph/project_graph.yaml` : intitulés des phases 0 à 7 et cibles des
  questions ouvertes (Q-001, Q-002 → phase 1 ; Q-003, Q-004 → phase 2)
  alignés sur `ROADMAP.md`.
- `graph/history.jsonl` : événement `documentation_corrected` ajouté en fin
  de fichier, sans suppression d'événement existant.

### Non modifié

`TASK-0001` reste `VERIFIED` avec ses preuves réelles (19 fichiers), et
`ACTION-0002` reste seule action, `PROPOSED`, dans `NEXT_ACTION.md`. Aucun
fichier créé, aucun accès réseau, aucune dépendance, aucun commit, aucun
travail de phase 1.

---

## 2026-08-25 — TASK-0002 — Préparation de la recherche de phase 1

**Agent :** exécuteur Claude Code
**Statut à l'issue :** `PROPOSED`

### Fait

- Lecture préalable de `AGENTS.md`, `docs/ai/START_HERE.md`,
  `docs/ai/OPERATING_MANUAL.md`, `docs/ai/CURRENT_STATE.md`,
  `docs/ai/NEXT_ACTION.md`, `PROJECT_VISION.md`, `ROADMAP.md`, ainsi que
  `TASK-0001`, `HANDOFF.md`, `VALIDATION.md`, `graph/project_graph.yaml`,
  `graph/current_state.yaml`, `graph/history.jsonl`,
  `docs/decisions/README.md`, `docs/performance/README.md`.
- Création de `docs/tasks/TASK-0002-phase-1-research-and-positioning.md`
  (`PROPOSED`) : objectif unique, répertoire autorisé, fichiers à lire,
  fichiers créables ou modifiables lors de l'exécution future, dix
  interdictions, livrables, méthode en huit sous-sections (analyse sourcée de
  GraphRAG Workbench avec quatorze questions explicites, comparaison de
  solutions réellement comparables, public cible et limites du MVP sans IA,
  recherche de plusieurs noms publics candidats sans réservation,
  vérification des termes de MIT et d'une alternative, tableau des sources,
  distinction faits/inférences/recommandations/incertitudes, recommandation
  finale soumise à décision humaine), tests et validations prévus, quatorze
  critères d'acceptation, conditions d'arrêt, et format du rapport final
  attendu.
- Mise à jour de `docs/ai/CURRENT_STATE.md` : ajout de TASK-0002
  `PROPOSED` au tableau des tâches, aucune tâche `IN_PROGRESS`, précision que
  la recherche n'est pas exécutée, ajout de `docs/research/` (dossier pas
  encore créé) à l'inventaire.
- Remplacement de `docs/ai/NEXT_ACTION.md` par `ACTION-0003` (action unique,
  `PROPOSED`) : demander le GO humain pour approuver et exécuter TASK-0002 ;
  la recherche n'est pas lancée par cette action.
- Mise à jour de `docs/ai/HANDOFF.md` en cohérence avec TASK-0002 et
  `ACTION-0003`.
- Correction de `docs/ai/START_HERE.md` : la règle réseau absolue
  (« tout accès réseau interdit ») est remplacée par une règle conditionnelle
  — accès réseau interdit sans GO humain, mais permis en lecture seule et de
  façon bornée pour une tâche de recherche explicitement approuvée.
- Mise à jour de `graph/project_graph.yaml` : ajout de TASK-0002 à la liste
  des tâches et à la phase 1 ; `next_action` mis à jour vers `ACTION-0003`.
- Mise à jour de `graph/current_state.yaml` : ajout de TASK-0002 `PROPOSED`,
  `next_action` mis à jour vers `ACTION-0003`.
- Ajout, en fin de `graph/history.jsonl` (append-only, aucune ligne
  existante modifiée), des événements `task_proposed` (TASK-0002),
  `next_action_proposed` (ACTION-0003) et `documentation_corrected`
  (règle réseau de `START_HERE.md`).

### Non fait, volontairement

- **Aucune recherche exécutée.** Aucune source consultée, aucun accès
  réseau effectué, aucun nom candidat identifié, aucune conclusion de
  licence, aucune comparaison de solutions menée.
- `docs/research/phase-1-research-and-positioning.md` n'a **pas** été créé :
  c'est le livrable de l'exécution future de TASK-0002, après GO.
- Aucun choix de nom public, de licence ou de pile technologique.
- Aucun code applicatif, aucune dépendance, aucun commit, aucune publication.

### Vérifié par l'agent exécuteur (lecture directe, non indépendante)

- `docs/tasks/TASK-0002-*.md` créé et lu après écriture : présent, structuré
  selon le gabarit demandé.
- `docs/ai/NEXT_ACTION.md` : une seule action, `ACTION-0003`, `PROPOSED`.
- `graph/current_state.yaml` et `graph/project_graph.yaml` : syntaxe YAML
  relue visuellement après édition, cohérente avec les autres fichiers.
- `graph/history.jsonl` : lignes 1 à 8 non modifiées ; nouvelles lignes
  ajoutées après la ligne 8 uniquement.
- Aucune référence à un projet privé introduite.

### Non testé

- Analyse syntaxique automatisée des fichiers YAML et JSONL modifiés (relue
  à l'œil, non passée dans un analyseur).
- Vérification indépendante par l'orchestrateur : non effectuée à ce stade.

### Suite

`ACTION-0003` dans `NEXT_ACTION.md` : demander le GO humain pour approuver
et exécuter TASK-0002 (recherche de phase 1). **Aucune recherche n'a
démarré.**

---

## 2026-08-25 — TASK-0002 — Correction de la fiche : alignement sur les quatorze questions du prompt maître

**Agent :** exécuteur Claude Code
**Motif :** la section 7.1 de `TASK-0002-phase-1-research-and-positioning.md`
contenait quatorze questions techniques inventées (objectif, licence,
mainteneur, activité, architecture, dépendance IA, hors ligne, plateformes,
etc.) qui ne correspondaient pas aux quatorze questions obligatoires du
prompt maître.

### Fait

- `docs/tasks/TASK-0002-phase-1-research-and-positioning.md`, section 7.1 :
  la liste numérotée des quatorze questions inventées est remplacée par les
  quatorze questions exactes du prompt maître (même besoin, fonctions
  semblables, différences fondamentales, simplicité/légèreté/accessibilité,
  ce que GraphRAG fait mieux, remplacement complet possible, usage en moteur
  ou module facultatif, idées reprenables légalement, reconstruction
  inutile, valeur distincte de l'approche topographique, caractère facultatif
  de GraphRAG, obligations de licence/attribution, éviter l'apparence de
  copie, positionnement public distinct).
- Les éléments factuels auparavant listés comme questions (objectif,
  licence, architecture, activité, dépendances, hors ligne, plateformes,
  limites) sont conservés, reformulés comme « éléments factuels à relever »
  au service des quatorze questions, et non comme questions à part entière.
- Chaque question est explicitement assortie de l'exigence : faits sourcés,
  inférences signalées comme telles, incertitudes marquées.
- Critère d'acceptation n°2 et étape de vérification de la section 8
  reformulés en cohérence avec les quatorze questions du prompt maître.

### Non fait, volontairement

- Aucune recherche exécutée, aucun résultat, aucun nom candidat, aucune
  conclusion ajoutée.
- Aucune autre exigence de la fiche supprimée (méthode 7.2 à 7.8, tests,
  critères d'acceptation restants, conditions d'arrêt, format du rapport :
  inchangés).
- Aucune ligne existante de `graph/history.jsonl` modifiée ; ajout en fin de
  fichier uniquement.

### Suite

`ACTION-0003` dans `NEXT_ACTION.md` reste l'action unique, `PROPOSED` : GO
humain requis pour approuver et exécuter TASK-0002. Aucune recherche n'a
démarré.

---

## 2026-08-25 — Mise à jour administrative : autorisation permanente

**Agent :** orchestrateur (mise en cohérence documentaire)
**Motif :** l'utilisateur remplace l'obligation de GO répété par une
autorisation permanente : l'orchestrateur mène le projet de bout en bout de
façon autonome, ne demandant que lorsqu'une ambiguïté réelle ou une
information/clé indispensable manque, une dépense est en jeu, une action
destructive sur des documents utilisateur est envisagée, ou une action
externe sort de l'objectif. Claude Code demeure l'exécuteur principal. Aucune
activation automatique d'un portefeuille payant Anthropic ni de dépense
externe sans instruction explicite.

### Fait

- `AGENTS.md` et `CLAUDE.md` : section 5 réécrite en « Autorisation
  permanente et points d'arrêt », contenu identique dans les deux fichiers.
  Les sections 1 (périmètre) et 2 (lecture seule des documents utilisateur)
  restent inchangées.
- `docs/ai/START_HERE.md` : règle 5 des cinq règles réécrite ; règle réseau
  de la section 5 (« Ce qui est interdit ») reformulée — la lecture seule de
  sources publiques pour une tâche de recherche documentée est désormais
  couverte par l'autorisation permanente, sans GO répété par tâche.
- `docs/ai/OPERATING_MANUAL.md` : section 4 réécrite en « Autorisation
  permanente et points d'arrêt » ; étape 3 du cycle de session (section 1)
  mise en cohérence.
- `docs/ai/CURRENT_STATE.md` : résumé et section « Tâches » mis à jour —
  TASK-0002 `PROPOSED` → `APPROVED` ; phase 1 `PROPOSED` → `APPROVED` ;
  mention explicite de l'autorisation permanente et de ses limites.
- `docs/ai/NEXT_ACTION.md` : `ACTION-0003` reformulée en « Exécuter
  TASK-0002 », statut `APPROVED`, sans demande de GO.
- `docs/ai/HANDOFF.md` : réécrit en cohérence avec l'autorisation permanente
  et le statut `APPROVED` de TASK-0002.
- `docs/tasks/TASK-0002-phase-1-research-and-positioning.md` : statut
  `PROPOSED` → `APPROVED` ; en-tête et section 12 (rapport de préparation)
  mis à jour pour refléter l'autorisation permanente, sans GO distinct.
- `graph/project_graph.yaml` : phase 1 et `TASK-0002` → `APPROVED` ;
  `network_access` de TASK-0002 précisé comme couvert par l'autorisation
  permanente.
- `graph/current_state.yaml` : `TASK-0002` → `APPROVED` ; `next_action`
  (`ACTION-0003`) → `APPROVED`.
- `graph/history.jsonl` (ajout seul, aucune ligne existante modifiée) :
  ajout d'un événement `policy_updated` documentant l'autorisation
  permanente et le passage de TASK-0002/`ACTION-0003` à `APPROVED`.

### Non fait, volontairement

- **Aucune recherche exécutée.** TASK-0002 est `APPROVED`, pas
  `IN_PROGRESS` : cette mise à jour ne lance pas la recherche elle-même.
- **Aucune tâche `IN_PROGRESS`** ouverte par cette mise à jour.
- Aucun code applicatif, aucune dépendance, aucun commit, aucune
  publication, aucun accès réseau effectué.
- `ROADMAP.md` non modifié par cette mise à jour (hors périmètre demandé).

### Vérifié par l'agent exécuteur (lecture directe, non indépendante)

- Les onze fichiers listés ci-dessus ont été relus après édition : contenu
  cohérent entre eux, mêmes dates, mêmes statuts.
- `graph/history.jsonl` : lignes existantes non modifiées ; nouvel événement
  ajouté en fin de fichier uniquement.
- Une seule action dans `NEXT_ACTION.md` (`ACTION-0003`).
- Aucune tâche `IN_PROGRESS` dans `CURRENT_STATE.md` ni `graph/current_state.yaml`.
- Aucune référence à un projet privé introduite.

### Non testé

- Analyse syntaxique automatisée des fichiers YAML et JSONL modifiés (relue
  à l'œil, non passée dans un analyseur externe).
- Vérification indépendante de cette mise à jour par un humain.

### Suite

`ACTION-0003` dans `NEXT_ACTION.md` : exécuter TASK-0002 (recherche de
phase 1), sans nouveau GO. L'exécution proprement dite n'a pas démarré par
cette mise à jour.

---

## 2026-08-25 — TASK-0002 — Exécution de la recherche de phase 1

**Agent :** exécuteur Claude Code
**Statut à l'issue :** `IMPLEMENTED` — **pas** `VERIFIED`

### Fait

- Lecture préalable, dans l'ordre imposé : `AGENTS.md`,
  `docs/ai/START_HERE.md`, `docs/ai/OPERATING_MANUAL.md`,
  `docs/ai/CURRENT_STATE.md`, `docs/ai/NEXT_ACTION.md`, `PROJECT_VISION.md`,
  `ROADMAP.md`, `README.md`, `docs/ai/HANDOFF.md`, `docs/ai/VALIDATION.md`,
  `graph/project_graph.yaml`, `graph/current_state.yaml`,
  `graph/history.jsonl`, et la fiche
  `docs/tasks/TASK-0002-phase-1-research-and-positioning.md` en entier.
- **Passage de TASK-0002 à `IN_PROGRESS` avant toute consultation de
  source** : fiche de tâche, `CURRENT_STATE.md`, `graph/current_state.yaml`,
  `graph/project_graph.yaml`, et événement `task_started` ajouté en fin de
  `graph/history.jsonl`.
- Recherche menée **en lecture seule** sur des sources publiques, priorité
  stricte aux sources officielles et primaires : dépôts de code, fichiers
  `README` et `LICENSE` bruts, pages de release, API GitHub, sites officiels
  d'éditeurs, registres officiels de paquets (npm, PyPI, `crates.io`),
  service RDAP officiel de Verisign pour `.com`, texte SPDX de la licence
  MIT, texte officiel de la licence Apache 2.0, liste de licences de la Free
  Software Foundation.
- Création du livrable
  **`docs/research/phase-1-research-and-positioning.md`** : en-tête daté,
  analyse de GraphRAG Workbench et de sa dépendance amont Microsoft GraphRAG,
  **quatorze questions exactes** avec réponses séparant faits, inférences et
  incertitudes, tableau comparatif de **dix** solutions, public cible et
  valeur distincte, **neuf** limites du MVP sans IA, **sept** noms candidats
  avec constats de disponibilité sur cinq registres, vérification des termes
  de MIT et examen d'Apache-2.0 comme alternative non retenue, tableau des
  sources à cinq colonnes, section faits/inférences/recommandations/
  incertitudes, recommandation finale marquée « SOUMISE À DÉCISION HUMAINE »,
  sections « Non testé » et « Risques ».
- Trois sources **secondaires** seulement, explicitement signalées comme
  telles dans le rapport : Softpedia pour l'existence de « Folderscope », un
  résultat de moteur de recherche pour une absence de résultat, et les listes
  de résultats ayant servi à repérer deux pages officielles ensuite
  consultées directement.
- **Passage de TASK-0002 à `IMPLEMENTED`** et mise à jour de la mémoire :
  fiche de tâche (statut + section 13, rapport d'exécution),
  `docs/ai/CURRENT_STATE.md`, `docs/ai/NEXT_ACTION.md` (`ACTION-0004`,
  action unique), `docs/ai/VALIDATION.md` (réécrit, section A pour
  TASK-0002), `docs/ai/HANDOFF.md`, `graph/current_state.yaml`,
  `graph/project_graph.yaml`, `graph/history.jsonl` (ajout seul), et
  `ROADMAP.md` **statut de la phase 1 uniquement**.
- Correction demandée dans `CURRENT_STATE.md` : la phrase obsolète « GO
  humain avant étape importante » est remplacée par l'énoncé de
  l'autorisation permanente du 2026-08-25 et la liste exacte des cas
  réservés où un agent s'arrête et demande un GO.

### Non fait, volontairement

- **Aucune décision** de nom public, de licence ou de pile technologique. Le
  rapport recommande et marque ses recommandations « soumises à décision
  humaine ».
- **Aucun nom réservé, aucun domaine acheté, aucun compte créé, aucun dépôt
  distant ouvert.** Toutes les requêtes réseau ont été des lectures.
- Aucun code applicatif, aucune dépendance, aucun commit, aucune publication.
- Aucun code tiers copié dans le dépôt.
- Aucune référence à un projet privé.
- `ROADMAP.md` ligne 18 (« GO humain explicite » à chaque passage de phase),
  devenue obsolète, **n'a pas été corrigée** : la fiche `TASK-0002` limitait
  les modifications de ce fichier au statut de la phase 1. Non-conformité
  consignée dans `VALIDATION.md` section A.4, `CURRENT_STATE.md` et
  `HANDOFF.md`.

### Vérifié par l'agent exécuteur (lecture directe, **non indépendante**)

Détail dans `docs/ai/VALIDATION.md`, section A.1 : existence du livrable,
présence des huit sous-sections et des quatorze questions dans leur libellé
exact, marquage systématique faits/inférences/recommandations/incertitudes,
absence de toute réservation ou achat, mention « soumise à décision humaine »,
absence de choix de pile technologique, une seule action dans
`NEXT_ACTION.md`, aucune tâche `IN_PROGRESS` à la clôture, et ajouts seuls
dans `graph/history.jsonl`.

### Non testé

- **Analyse syntaxique automatisée des fichiers YAML et JSONL : non
  effectuée.** Aucun outil d'exécution de commande n'était disponible dans
  cette session — ni interpréteur, ni analyseur. Les fichiers ont été relus à
  l'écran après édition, sans validation par un analyseur.
- Contrôle croisé automatisé entre les affirmations du corps du rapport et le
  tableau des sources : non effectué ; confié à `ACTION-0004`.
- Aucun des dix outils comparés n'a été installé ni exécuté.
- Aucune mesure de performance, pour aucun outil.
- `crates.io` non vérifié pour cinq des sept noms candidats.
- Aucune recherche d'antériorité de marque ; la tentative sur le service de
  l'USPTO n'a renvoyé aucun résultat exploitable.
- Aucun TLD autre que `.com`.
- Aucun avis juridique sur les raisonnements de licence.
- Vérification indépendante de TASK-0002 : non effectuée.

### Suite

`ACTION-0004` dans `NEXT_ACTION.md` : vérification indépendante de TASK-0002
sur preuves, par l'orchestrateur, contre les quatorze critères d'acceptation
de la fiche. Débouche sur `VERIFIED` ou `REJECTED` avec motif écrit.

---

## 2026-08-25 — TASK-0002 — Corrections après vérification indépendante partielle

**Agent :** orchestrateur
**Statut à l'issue :** `TASK-0002` reste `IMPLEMENTED` — **pas** `VERIFIED`
**Motif :** l'orchestrateur, instance distincte de l'agent exécuteur, a obtenu
des preuves indépendantes contredisant certaines affirmations du rapport de
phase 1 et a corrigé le rapport, sans clore `ACTION-0004`.

### Preuves indépendantes obtenues

- API GitHub du dépôt `graphrag-workbench` : `full_name`
  `lyon-industries/graphrag-workbench`, licence MIT, `created_at`
  `2025-09-04T15:29:08Z`, `pushed_at` `2026-07-18T09:47:42Z`, 713 étoiles, 91
  bifurcations, non archivé, TypeScript.
- API des releases : tag `v0.1.0-alpha.1`, nom exact « v0.1.0-alpha.1 —
  GraphRAG Workbench (First alpha) », `prerelease: true`, `published_at`
  `2025-09-04T16:22:04Z`.
- API des contributeurs : `ChristopherLyon`, 14 contributions.
- Citations du README et du `LICENSE` : confirmées.
- Microsoft GraphRAG : MIT, `pushed_at` `2026-08-24`, 35 679 étoiles, 3 747
  bifurcations, non archivé ; mention « maintenance mode » et avertissement de
  coût confirmés.
- `folderscape` et `cartodoc` : HTTP 404 confirmé sur npm, PyPI, `crates.io`,
  comptes/organisations GitHub, et RDAP Verisign `.com`.
- 25 liens officiels du tableau de sources (7.6) répondaient HTTP 200 ;
  Softpedia (S-27) a répondu **HTTP 403** et reste une source secondaire non
  vérifiée indépendamment.

### Corrections apportées à `docs/research/phase-1-research-and-positioning.md`

1. Intitulé inventé « Initial Alpha » et année inférée remplacés par le nom
   exact et la date officielle de l'API des releases ; `S-04` pointe
   désormais vers l'URL API officielle des releases.
2. Formulations « fichier NOTICE obligatoire » d'Apache-2.0 nuancées : la
   clause §4(d) n'impose la reproduction des notices que si l'œuvre
   distribuée comporte déjà un fichier `NOTICE`.
3. Tableau de compatibilité GPL/AGPL nuancé : une distribution combinée ou
   liée à un composant copyleft doit respecter sa licence et ne peut pas se
   présenter comme « MIT seule » ; les limites plugiciel/processus
   séparé/liaison dynamique restent des questions juridiques non tranchées
   ici, sans valoir avis juridique.

### Corrections apportées à `ROADMAP.md`

Ligne 19 : la formulation obsolète « GO humain explicite » à chaque passage
de phase est remplacée par la description des transitions autonomes dès que
critères et preuves sont satisfaits, conformément à l'autorisation permanente
du 2026-08-25 ; la phase 6 conserve son GO humain spécial, désormais
explicitement conditionné à des audits préalables.

### Fichiers modifiés

`docs/research/phase-1-research-and-positioning.md`, `ROADMAP.md`,
`docs/ai/VALIDATION.md` (section A.4 mise à jour, section A.6 ajoutée),
`docs/ai/CURRENT_STATE.md`, `docs/ai/NEXT_ACTION.md`,
`graph/current_state.yaml`, `graph/history.jsonl` (ajout seul).

### Non fait, volontairement

- **`TASK-0002` n'est pas portée à `VERIFIED`** par cette correction : cette
  vérification est **partielle**, elle ne couvre pas l'intégralité des
  quatorze critères d'acceptation ni le contrôle croisé exhaustif du corps du
  rapport contre le tableau des sources.
- Aucune recherche formelle de marque n'a été faite (mêmes limites d'accès
  que celles déjà rapportées par l'agent exécuteur).
- Aucune tâche `IN_PROGRESS` ouverte.

### Suite

`ACTION-0004` reste l'action unique de `docs/ai/NEXT_ACTION.md` :
vérification indépendante **finale**, débouchant sur `VERIFIED` ou
`REJECTED` avec motif écrit.

---

## 2026-08-25 — TASK-0002 — Vérification indépendante finale : VERIFIED, et ouverture de TASK-0003

**Agent :** orchestrateur
**Statut à l'issue :** `TASK-0002` et la phase 1 → `VERIFIED` ;
`TASK-0003` ouverte, `APPROVED`

### Fait

- **`crates.io` vérifié pour les cinq candidats restants** (`topodoc`,
  `docscape`, `isodoc`, `terradoc`, `reliefdoc`) : HTTP 404 confirmé pour
  chacun, comme déjà constaté pour `cartodoc` et `folderscape`. Les **sept**
  candidats sont désormais confirmés libres sur `crates.io`.
- `docs/research/phase-1-research-and-positioning.md` corrigé, section 7.4 :
  la limite « `crates.io` non vérifié pour cinq candidats » retirée,
  remplacée par la confirmation des sept ; source `S-24` mise à jour ;
  sections 7.7.4 (Incertitudes) et 8 (Non testé) mises en cohérence. **Les
  limites relatives aux marques déposées et aux TLD hors `.com` restent
  intactes.** En-tête et dernière ligne du rapport mis à jour pour refléter
  la vérification indépendante.
- **Vérification indépendante finale de `TASK-0002`**, grille de preuves
  consignée dans `docs/ai/VALIDATION.md`, section A.7 : quatorze questions
  répondues, 32 sources définies (tableau 7.6), API GraphRAG confirmée
  (dépôt, releases, contributeurs), 25 liens officiels en HTTP 200, sept
  candidats vérifiés sur cinq registres chacun (7×5), syntaxe YAML/JSONL et
  encodage UTF-8 cohérents, absence de tout scan de document privé et de
  toute référence privée, aucune pile technologique choisie.
- `TASK-0002` et la **phase 1** passées à `VERIFIED`, `verified_by:
  orchestrator`, `verified_on: 2026-08-25`, dans la fiche de tâche (section
  14 ajoutée), `docs/ai/CURRENT_STATE.md`, `ROADMAP.md`,
  `graph/current_state.yaml`, `graph/project_graph.yaml`, avec événements
  `crates_io_verified`, `report_corrected`, `independent_verification_final`,
  `task_verified` et `phase_verified` ajoutés en fin de
  `graph/history.jsonl` (ajout seul).
- `ACTION-0004` close.
- Création de `docs/tasks/TASK-0003-public-name-due-diligence.md`, statut
  `APPROVED` via l'autorisation permanente du 2026-08-25 : diligence
  raisonnable complémentaire sur le nom public — recherche officielle de
  marques (CIPO, USPTO, WIPO, EUIPO) si accessible, recherche Web générale,
  collisions phonétiques/orthographiques/logicielles, TLD
  `.org`/`.app`/`.dev`/`.ca`, au moins trois nouveaux candidats distinctifs si
  `folderscape` reste jugé risqué, aucune réservation ni achat, décision
  consignée dans `docs/decisions/DEC-0001-public-name.md`, modèle recommandé
  Opus à effort élevé.
- Création de `docs/decisions/DEC-0001-public-name.md`, statut `PROPOSED`,
  décision non encore prise, options reprises de `TASK-0002`.
- `docs/ai/NEXT_ACTION.md` remplacé par `ACTION-0005`, action unique,
  `APPROVED` : exécuter `TASK-0003` immédiatement.
- `docs/ai/HANDOFF.md` réécrit en cohérence avec cette clôture et l'ouverture
  de `TASK-0003`.

### Non fait, volontairement

- **`TASK-0003` n'a pas été exécutée** par cette mise à jour : aucune
  recherche de marque complémentaire, aucune collision phonétique,
  orthographique ou logicielle, aucun TLD hors `.com` vérifié. C'est l'objet
  d'`ACTION-0005`.
- Aucune décision de nom public, de licence ou de pile technologique.
- Aucun nom réservé, aucun domaine acheté, aucun compte créé.
- Aucun code applicatif, aucune dépendance, aucun commit, aucune publication.
- Les limites « marques déposées » et « TLD autres que `.com` » du rapport de
  phase 1 **ne sont pas levées** par cette mise à jour.

### Vérifié par l'orchestrateur (indépendant)

Détail complet dans `docs/ai/VALIDATION.md`, section A.7.

### Non testé

- Recherche formelle de marques déposées (CIPO, USPTO, WIPO, EUIPO) —
  transmise à `TASK-0003`.
- TLD autres que `.com` — transmis à `TASK-0003`.
- Fins de ligne sur le disque, cohérence des liens relatifs entre documents.

### Suite

`ACTION-0005` dans `docs/ai/NEXT_ACTION.md` : exécuter `TASK-0003`
immédiatement, sans GO distinct pour la recherche en lecture seule. Un GO
humain reste requis avant toute fixation irréversible du nom public.

---

## 2026-08-25 — TASK-0003 — Diligence du nom public

**Agent :** Codex
**Statut à l'issue :** `IMPLEMENTED`, vérification `ACTION-0006` ouverte

### Fait

- Claude Code arrêté dès le constat de limite Pro atteinte; aucune reprise sur
  crédits Anthropic payants.
- Contrôle de trois nouveaux candidats (`filetopo`, `folderatlas`,
  `terrafolder`) sur npm, PyPI, `crates.io`, GitHub exact et cinq TLD.
- Recherche officielle exacte CIPO : 0 résultat combiné pour le trio.
- Recherche officielle exacte EUIPO : 0 résultat pour chacun.
- Limite USPTO consignée (AWS WAF) et limite WIPO respectée (conditions
  interdisant les requêtes automatisées).
- Recherche Web de collisions : `folderscape`, `FolderAtlas` et
  `TerraFolder` écartés.
- `DEC-0001` complétée : **FileTopo** retenu comme nom de travail public
  réversible.
- Documents d'état et graphes synchronisés vers `IMPLEMENTED`.

### Non fait, volontairement

- Aucun domaine, compte, dépôt distant ou marque réservé, acheté ou créé.
- Aucune licence ni pile technologique décidée.
- Aucun code applicatif, aucune dépendance, aucun commit, aucune publication.
- Aucun accès à un corpus privé.

### Limites

- USPTO et WIPO non vérifiés au niveau des résultats exacts.
- Recherche juridique exhaustive à refaire avant fixation irréversible.

### Suite

`ACTION-0006` : vérification de cohérence de `TASK-0003`; si conforme,
ouverture automatique de la phase 2 — architecture.

---

## 2026-08-25 — ACTION-0006 — Vérification de TASK-0003

**Agent :** orchestrateur
**Résultat :** `TASK-0003` et `DEC-0001` → `VERIFIED`

- Dix critères d'acceptation contrôlés.
- Deux YAML parsés, 39 lignes JSONL validées avant ajout des événements.
- Zéro référence au corpus privé interdit dans 23 fichiers.
- Aucun remote Git, achat, compte, domaine ou publication.
- Limites USPTO/WIPO et recherche juridique exhaustive maintenues.
- Phase 2 et `TASK-0004` ouvertes automatiquement; `ACTION-0007` devient
  l'action unique en cours.

---

## 2026-08-26 — TASK-0006 — MVP local sans IA

**Agent :** Codex puis vérification orchestrateur
**Résultat :** `VERIFIED`, phase 4 close, `TASK-0007` ouverte

### Fait

- Registre de collections et index SQLite persistants hors corpus.
- Sélecteur de dossier natif, scan asynchrone, progression et annulation sans index partiel.
- Recherche et filtres paginés, état vu/non vu, détection en ligne seulement.
- Carte à niveau de détail progressif et liste accessible synchronisée.
- Ouverture explicite confinée dans l’Explorateur Windows.
- Guides FR/EN, mesures 10 k/100 k, 11 tests Rust et 4 tests d’interface.
- Clippy strict, audit de dépendances sans vulnérabilité connue, build release et NSIS.
- Inspection visuelle corrigée et revérifiée en français et en anglais.

### Sécurité

Aucun dossier utilisateur choisi par l’agent, aucun corpus privé, aucun contenu réel, aucune publication, aucun dépôt distant et aucun crédit Anthropic.

### Suite

`ACTION-0010` : exécuter `TASK-0007`, préparation publique strictement locale. La phase 6 reste soumise à un GO humain spécial.
