# CLAUDE.md — Règles de travail pour les agents

Ce fichier et `AGENTS.md` contiennent les **mêmes règles**. Toute modification de
l'un doit être répercutée à l'identique dans l'autre.

## 1. Périmètre

- Le travail est **strictement limité à ce dépôt**
  (`TopographicDocumentMap`, nom de dossier provisoire).
- Aucune lecture, aucun listage, aucune écriture en dehors du dépôt.
- Aucune référence à un projet privé, à ses noms, chemins, données ou
  identifiants ne doit apparaître dans ce dépôt.
- Aucun secret, aucune clé, aucun chemin local personnel ne doit être écrit
  dans un fichier versionné.

## 2. Lecture seule des documents utilisateur

- L'application visée **ne modifie jamais** les fichiers ou dossiers analysés.
- Aucune opération d'écriture, de renommage, de déplacement ou de suppression
  sur les documents d'un utilisateur, ni maintenant ni dans les prototypes.
- Toute production d'artefact (index, cache, rapport) se fait dans un
  emplacement dédié au projet, jamais dans les dossiers analysés.
- Les jeux d'essai sont **synthétiques uniquement**
  (voir `tests/fixtures_synthetic/README.md`).

## 3. Une seule tâche IN_PROGRESS

- À tout instant, **au plus une** tâche est à l'état `IN_PROGRESS`.
- Les **huit** états permis, et aucun autre :

  | État | Sens |
  |------|------|
  | `PROPOSED` | Décrite, pas démarrée. Attend une approbation. |
  | `APPROVED` | Approuvée, autorisée à démarrer, pas encore démarrée. |
  | `IN_PROGRESS` | En cours d'exécution. |
  | `BLOCKED` | Arrêtée par un obstacle, avec la cause écrite. |
  | `IMPLEMENTED` | Livrable produit, pas encore vérifié indépendamment. |
  | `VERIFIED` | Vérifié sur preuves par une instance indépendante de l'exécuteur. |
  | `REJECTED` | Refusée ou rejetée après examen, avec le motif écrit. |
  | `DEFERRED` | Reportée à plus tard, sans travail engagé. |

- Un agent exécuteur ne s'attribue **jamais** `VERIFIED` : cet état ne peut être
  posé que sur une **preuve indépendante**, par l'orchestrateur ou un humain.
- Une tâche est décrite dans `docs/tasks/TASK-XXXX-*.md` avant d'être démarrée.

## 4. Preuves obligatoires

- Toute affirmation de résultat doit être adossée à une **preuve vérifiable** :
  fichier créé, contenu cité, sortie de commande, ou constat de lecture.
- Ce qui n'a pas été exécuté est déclaré **« non testé »**, explicitement.
- Interdiction de présenter comme fait ce qui est prévu, supposé ou souhaité.
- Les échecs sont rapportés tels quels, sans reformulation avantageuse.

## 5. Autorisation permanente et points d'arrêt

- Depuis le **2026-08-25**, l'utilisateur a donné une **autorisation
  permanente** : l'orchestrateur mène le projet de bout en bout de façon
  autonome, **sans GO répété**, pour la recherche publique en lecture, les
  décisions documentées, l'architecture, le développement, les tests, la
  documentation et les **commits locaux**.
- L'**enchaînement autonome des tâches** est permis dès lors que les critères
  d'acceptation et les preuves d'une tâche sont satisfaits, en respectant la
  règle d'une seule tâche `IN_PROGRESS` (section 3).
- Un agent **s'arrête et demande un GO** uniquement dans ces cas :
  - une **ambiguïté importante** sur l'intention ou la portée ;
  - un **secret, une clé ou un identifiant manquant**, indispensable à la
    suite du travail ;
  - toute **dépense ou achat**, quel qu'il soit ;
  - une **action destructive** sur des documents utilisateur ;
  - une **action externe hors de l'objectif du projet** : publication, dépôt
    distant, branche publique, accès réseau au-delà de la lecture de sources
    publiques.
- **Aucune activation ni utilisation automatique d'un portefeuille payant
  Anthropic**, ni aucune dépense externe, sans instruction explicite de
  l'utilisateur.
- Figer le nom public du projet, la licence définitive ou la pile
  technologique reste soumis à GO humain explicite : ce sont des décisions
  d'auteur, pas des points de blocage d'exécution.
- Les sections 1 (périmètre) et 2 (lecture seule des documents utilisateur)
  restent **absolues et inchangées** : cette autorisation ne les modifie pas.

## 6. Journalisation

- Chaque intervention d'agent est consignée dans `docs/ai/CHANGELOG_AI.md`
  et dans `graph/history.jsonl` (une ligne JSON par événement).
- L'état courant est reflété dans `docs/ai/CURRENT_STATE.md` et
  `graph/current_state.yaml`.
- `docs/ai/NEXT_ACTION.md` contient **exactement une** action proposée.

## 7. Point d'entrée

Tout agent commence par lire `docs/ai/START_HERE.md`.
