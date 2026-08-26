# TASK-0002 — Phase 1 : recherche et positionnement

- **Statut :** `VERIFIED`
- **Phase :** 1 — Recherche et positionnement (`VERIFIED`)
- **Vérifiée le :** 2026-08-25 — **vérifié par l'orchestrateur sur preuves
  indépendantes**, `verified_by: orchestrator`. Voir `docs/ai/VALIDATION.md`,
  section A.7. L'agent exécuteur ne s'est pas attribué cet état.
- **Ouverte le :** 2026-08-25
- **Livrée le :** 2026-08-25
- **Effort recommandé :** une session de recherche documentaire, bornée à un
  seul rapport. Pas de développement, pas de prototype.
- **GO humain :** couvert par l'**autorisation permanente du 2026-08-25**
  (recherche publique en lecture) — aucun GO distinct requis pour démarrer
  l'exécution. L'accès réseau reste borné à la lecture seule de sources
  publiques, telle que décrite en section 2.

Cette fiche **prépare** la recherche. Elle ne l'a pas encore exécutée. Toute
case « Résultat », « Source consultée » ou « Conclusion » reste vide tant que
l'exécution n'a pas eu lieu. Le passage à `APPROVED` autorise le démarrage ;
il ne constitue pas un début d'exécution.

---

## 1. Objectif unique

Produire un rapport de recherche daté et sourcé qui permette de trancher,
plus tard et par un humain, le **nom public** et la **licence** du projet, et
qui situe le projet par rapport à l'existant — sans que cette tâche ne
décide elle-même ni l'un ni l'autre, et sans produire de code.

## 2. Répertoire autorisé

- Lecture et écriture strictement limitées à ce dépôt
  (`TopographicDocumentMap`).
- Aucune lecture, aucun listage, aucune écriture en dehors du dépôt, y
  compris sur le système de fichiers local hors dépôt.
- Accès réseau limité à la **consultation en lecture** de sources publiques
  nécessaires à la recherche (dépôts de code, pages de documentation,
  registres de paquets, moteurs de recherche, registres de noms de domaine).
  Aucune écriture, aucun compte créé, aucune réservation, aucun paiement.

## 3. Fichiers à lire avant exécution

Dans l'ordre :

1. `AGENTS.md` ou `CLAUDE.md`
2. `docs/ai/OPERATING_MANUAL.md`
3. `docs/ai/CURRENT_STATE.md`
4. `docs/ai/NEXT_ACTION.md`
5. `PROJECT_VISION.md`
6. `ROADMAP.md` (section Phase 1)
7. Cette fiche, en entier

## 4. Fichiers créables ou modifiables lors de l'exécution future

**Livrable principal (créable) :**

- `docs/research/phase-1-research-and-positioning.md`

**Fichiers d'état à mettre à jour à la clôture de l'exécution (existants,
modifiables) :**

- `docs/ai/CURRENT_STATE.md`
- `docs/ai/NEXT_ACTION.md`
- `docs/ai/HANDOFF.md`
- `docs/ai/VALIDATION.md`
- `docs/ai/CHANGELOG_AI.md`
- `graph/current_state.yaml`
- `graph/project_graph.yaml`
- `graph/history.jsonl` (ajout seul, aucune ligne existante modifiée)
- `ROADMAP.md` (statut de la phase 1 uniquement)
- Cette fiche elle-même, `docs/tasks/TASK-0002-*.md` (progression de statut)

**Aucun autre fichier n'est créé ou modifié.** En particulier, aucun fichier
sous `docs/decisions/` n'est créé par cette tâche : le nom et la licence n'y
sont **pas tranchés** par cette tâche ; une décision éventuelle appartient à
un humain, dans une tâche ultérieure distincte.

## 5. Interdictions

1. Lire, lister ou écrire hors du dépôt.
2. Créer, réserver ou acheter un nom de domaine, un compte, un dépôt distant
   ou une marque, sous quelque forme que ce soit.
3. Trancher le nom public, la licence définitive ou la pile technologique :
   cette tâche **recommande**, elle ne **décide** pas.
4. Copier du code source d'un tiers dans ce dépôt, sous quelque licence que
   ce soit.
5. Ajouter une dépendance, installer un outil.
6. Mentionner, comparer à, ou réutiliser quoi que ce soit d'un projet privé.
7. Créer un commit, une branche publique, un dépôt distant ; publier.
8. Présenter une affirmation non sourcée comme un fait.
9. Démarrer la phase 2 ou produire du code applicatif.
10. S'attribuer l'état `VERIFIED`.

## 6. Livrables

- `docs/research/phase-1-research-and-positioning.md`, contenant au minimum
  les sept sections décrites en section 7 (Méthode) ci-dessous.
- Une mémoire d'état mise à jour et cohérente (fichiers listés en section 4).
- Aucun nom ni aucune licence réservés ou installés : seulement documentés
  comme candidats ou comme recommandation soumise à GO humain.

## 7. Méthode prévue pour l'exécution future

### 7.1 Analyse de GraphRAG Workbench

À partir de sources officielles uniquement (dépôt de code, documentation
publiée par le ou les mainteneurs, pages de release) — pas de blogs tiers non
vérifiés comme source primaire.

**Éléments factuels à relever** (utiles pour répondre aux quatorze questions
ci-dessous, mais ne remplaçant pas ces questions) :

- Identité déclarée : objectif, éditeur ou mainteneur, licence exacte (nom,
  fichier `LICENSE`, obligations d'attribution), date de première publication
  et de dernière activité constatée.
- Architecture déclarée : langage, dépendances majeures, mode de stockage,
  dépendance ou non à un modèle d'IA/LLM ou à un service distant.
- Activité réelle : dernière release, dernier commit constaté, nombre de
  mainteneurs actifs visibles, présence ou non d'un avertissement
  d'abandon/expérimental posé par les auteurs eux-mêmes.
- Fonctionnement hors ligne ou non, plateformes officiellement supportées,
  limites ou avertissements documentés par les auteurs eux-mêmes.

Réponse explicite, une à une, aux **quatorze questions** suivantes (à
recopier dans le rapport, chacune avec faits sourcés, inférences signalées
comme telles, et incertitudes marquées « non trouvé » avec la raison) :

1. Les deux projets répondent-ils au même besoin ?
2. Quelles fonctions sont semblables ?
3. Quelles différences sont fondamentales ?
4. Notre projet peut-il être plus simple, plus léger ou plus accessible ?
5. Qu'est-ce que GraphRAG Workbench fait mieux ?
6. Pourrait-il remplacer complètement le nouveau projet ?
7. Pourrait-il servir de moteur ou de module facultatif ?
8. Quelles idées peuvent être reprises légalement ?
9. Sommes-nous en train de reconstruire inutilement une solution existante ?
10. L'approche topographique possède-t-elle une valeur distincte ?
11. GraphRAG doit-il rester facultatif ?
12. Quelles obligations de licence ou d'attribution s'appliqueraient ?
13. Comment éviter de présenter notre produit comme une copie ?
14. Quel positionnement public serait réellement distinct ?

### 7.2 Comparaison de solutions réellement comparables

- Cadre de comparaison : outils de visualisation, cartographie ou
  organisation de dossiers/documents locaux, existants et publiquement
  documentés — à l'exclusion de tout projet privé.
- Critères : type de représentation, volumétrie annoncée ou observée,
  plateformes supportées, licence, respect de la lecture seule des documents
  analysés, fonctionnement hors ligne, dépendance à l'IA.
- Forme du résultat : un tableau comparatif dans le rapport, une ligne par
  solution, avec source pour chaque cellule factuelle.

### 7.3 Public cible, valeur distincte et limites du MVP sans IA

- Décrire le public cible envisagé pour ce projet, en cohérence avec
  `PROJECT_VISION.md` (application publique et générale, gratuite, sans
  compte).
- Formuler la valeur distincte par rapport aux solutions comparées en 7.2,
  en s'appuyant sur les constats de 7.1 et 7.2, pas sur une intuition non
  sourcée.
- Lister explicitement les limites exactes du MVP sans IA (ce qu'il ne fait
  pas), en cohérence avec la section 4 de `PROJECT_VISION.md`.

### 7.4 Recherche de noms publics candidats

- Rechercher plusieurs noms publics candidats (pluriel, pas un choix unique)
  sur : GitHub (disponibilité d'organisation ou de dépôt), un moteur de
  recherche généraliste, les gestionnaires de paquets pertinents pour la
  pile probable, les registres de domaines pertinents, et une vérification
  de non-collision avec des marques déposées évidentes (recherche simple,
  pas une recherche juridique formelle).
- Pour chaque nom candidat : noter la disponibilité constatée à la date de
  consultation, sans réserver ni acheter quoi que ce soit.
- Le rapport présente une liste de candidats avec leurs constats, pas un
  choix arrêté.

### 7.5 Vérification de licence

- Vérifier les termes exacts de la licence MIT (obligations d'attribution,
  limites de garantie).
- Vérifier la compatibilité de MIT avec toute bibliothèque tierce dont
  l'usage serait envisagé (aucune n'est décidée à ce stade : la vérification
  porte sur le principe de compatibilité, pas sur une liste figée).
- Identifier au moins une licence alternative pertinente (par exemple une
  licence permissive alternative) à titre de comparaison, sans la retenir.

### 7.6 Tableau des sources

Chaque affirmation factuelle du rapport renvoie à une ligne de ce tableau :

| URL | Organisme / auteur | Date de consultation | Nature (primaire/secondaire) | Affirmation soutenue |
|-----|--------------------|-----------------------|-------------------------------|-----------------------|

### 7.7 Distinction faits / inférences / recommandations / incertitudes

Le rapport sépare explicitement, dans des sections ou une mise en forme
distinctes :

- **Faits** — constatés directement dans une source citée.
- **Inférences** — déductions raisonnables à partir de faits, signalées comme
  telles.
- **Recommandations** — propositions soumises à décision humaine, jamais
  présentées comme actées.
- **Incertitudes** — ce qui n'a pas pu être établi, avec la raison.

### 7.8 Recommandation finale

- Une recommandation finale de nom(s) et de licence, clairement marquée
  **« soumise à décision humaine »**.
- Cette tâche ne choisit **pas** la pile technologique : ce point reste
  entrant de la phase 2 et n'est pas traité dans ce rapport, sauf comme
  contrainte constatée (ex. compatibilité de licence) sans décision.

## 8. Tests et validations prévus

À l'exécution, avant de clore la tâche :

- Vérifier par lecture que `docs/research/phase-1-research-and-positioning.md`
  contient les huit sous-sections de la section 7 (7.1 à 7.8), y compris les
  quatorze réponses de 7.1, chacune avec faits sourcés, inférences signalées
  et incertitudes explicites.
- Vérifier par lecture qu'aucun nom n'a été réservé ni aucun paiement engagé
  (aucune preuve d'achat ou de réservation ne doit apparaître).
- Vérifier par lecture qu'aucune référence à un projet privé n'apparaît.
- Vérifier que chaque affirmation factuelle du corps du rapport a une entrée
  correspondante dans le tableau des sources (section 7.6).
- Vérifier la syntaxe des fichiers YAML et JSONL modifiés.
- Vérifier qu'au plus une tâche reste `IN_PROGRESS` à la clôture.
- Vérifier que `NEXT_ACTION.md` contient exactement une action proposée à la
  clôture.

## 9. Critères d'acceptation

| # | Critère |
|---|---------|
| 1 | Le rapport existe à `docs/research/phase-1-research-and-positioning.md` |
| 2 | Les quatorze questions du prompt maître ont chacune une réponse avec faits sourcés, inférences signalées et incertitudes explicites |
| 3 | Un tableau comparatif de solutions réellement comparables est présent, sans mention de projet privé |
| 4 | Le public cible, la valeur distincte et les limites du MVP sans IA sont formulés |
| 5 | Plusieurs noms candidats sont listés avec constats de disponibilité, sans réservation |
| 6 | Les termes de MIT et la compatibilité avec d'éventuels composants tiers sont vérifiés et cités |
| 7 | Le tableau des sources couvre toutes les affirmations factuelles |
| 8 | Faits, inférences, recommandations et incertitudes sont distingués sans ambiguïté |
| 9 | La recommandation finale de nom et de licence est marquée « soumise à décision humaine » |
| 10 | Aucune pile technologique n'est choisie dans ce rapport |
| 11 | Aucun code applicatif, aucune dépendance, aucun commit, aucune publication |
| 12 | Aucun achat, aucune réservation, aucun compte créé |
| 13 | Aucune donnée réelle, aucun secret, aucun chemin local personnel |
| 14 | Seuls les huit états permis sont employés dans les fichiers d'état |

## 10. Conditions d'arrêt

L'exécution future de cette tâche s'arrête, et un GO humain est demandé, dès
que l'un de ces cas se présente :

- une action exigerait un accès réseau au-delà de la consultation en lecture
  de sources publiques ;
- une réservation, un achat ou une création de compte deviendrait nécessaire
  pour vérifier la disponibilité d'un nom ;
- une décision de nom ou de licence serait sur le point d'être présentée
  comme actée plutôt que recommandée ;
- une source suggérerait un lien, direct ou indirect, avec un projet privé ;
- du code applicatif ou une dépendance deviendrait nécessaire pour produire
  le rapport ;
- la phase 2 (architecture, pile technologique) deviendrait nécessaire pour
  conclure le rapport.

## 11. Format du rapport final attendu

`docs/research/phase-1-research-and-positioning.md`, en français, encodage
UTF-8, daté, structuré au minimum ainsi :

1. En-tête (date, statut, auteur agent, portée)
2. 7.1 Analyse de GraphRAG Workbench (quatorze questions et réponses)
3. 7.2 Comparaison de solutions comparables (tableau)
4. 7.3 Public cible, valeur distincte, limites du MVP sans IA
5. 7.4 Noms publics candidats et constats de disponibilité
6. 7.5 Vérification de licence (MIT et alternative)
7. 7.6 Tableau des sources
8. 7.7 Faits / inférences / recommandations / incertitudes
9. 7.8 Recommandation finale, marquée « soumise à décision humaine »
10. Section « Non testé » et section « Risques »

## 12. Rapport de préparation (cette tâche, TASK-0002)

**Résultat :** fiche de tâche produite, statut `APPROVED` depuis le
2026-08-25 (autorisation permanente de l'utilisateur, sans GO distinct).
**Aucune recherche exécutée** à ce stade de la préparation. Le contenu des
sections 7.1 à 7.8 ci-dessus décrit la méthode à suivre, pas un résultat
obtenu.

**Suite :** exécution autonome de la recherche de phase 1, dans le respect
strict du périmètre (section 2), des interdictions (section 5) et des
conditions d'arrêt (section 10), avec passage à `IN_PROGRESS` au démarrage.

## 13. Rapport d'exécution — 2026-08-25

**Statut à l'issue :** `IMPLEMENTED`. L'agent exécuteur ne s'attribue pas
`VERIFIED`.

**Déroulement.** TASK-0002 est passée de `APPROVED` à `IN_PROGRESS` **avant**
toute consultation de source (événement `task_started` dans
`graph/history.jsonl`). La recherche a été menée en lecture seule sur des
sources publiques, puis la tâche est passée à `IMPLEMENTED`.

**Livrable produit :** `docs/research/phase-1-research-and-positioning.md`.

**Ce qui a été fait.**

- Analyse de GraphRAG Workbench sur sources primaires : dépôt, `README.md`
  brut, `LICENSE` brut, page des versions, API de dépôt et de contributeurs
  GitHub, site officiel de l'éditeur. Analyse de la dépendance amont
  Microsoft GraphRAG sur son dépôt et l'API GitHub.
- Réponse explicite aux **quatorze questions exactes** de la section 7.1,
  chacune avec faits sourcés, inférences signalées et incertitudes marquées.
- Tableau comparatif de **dix** solutions, chaque cellule factuelle sourcée
  sur un site officiel d'éditeur ou un registre officiel.
- Public cible, valeur distincte et **neuf** limites explicites du MVP sans IA.
- **Sept** noms candidats, vérifiés sur npm, PyPI, `crates.io` (partiel),
  l'API GitHub et le service RDAP officiel de Verisign pour `.com`. **Aucune
  réservation, aucun achat, aucun compte créé.**
- Vérification des termes exacts de MIT (texte SPDX), de la position de la FSF
  sur la compatibilité GPL, et d'une alternative (Apache-2.0, texte officiel
  de l'ASF), sans retenir cette alternative.
- Tableau des sources à cinq colonnes, avec nature primaire ou secondaire.
  Trois entrées secondaires seulement, signalées comme telles.
- Séparation explicite faits / inférences / recommandations / incertitudes.
- Recommandation finale de nom et de licence marquée
  **« SOUMISE À DÉCISION HUMAINE »**.
- Sections « Non testé » (dix points) et « Risques » (neuf risques).

**Ce qui n'a pas été fait, volontairement.**

- Aucun nom, domaine, compte ou dépôt distant réservé, acheté ou créé.
- Aucune décision de nom, de licence ou de pile technologique.
- Aucun code applicatif, aucune dépendance, aucun commit, aucune publication.
- Aucun code tiers copié dans le dépôt.
- Aucune référence à un projet privé.

**Aucune condition d'arrêt de la section 10 ne s'est présentée.**

**Non testé, déclaré :** aucun analyseur YAML ni JSONL n'a pu être exécuté —
aucun outil d'exécution de commande n'est disponible dans cette session. Les
fichiers modifiés ont été relus. Détail dans `docs/ai/VALIDATION.md`.

## 14. Vérification indépendante finale — 2026-08-25

**Statut à l'issue :** `VERIFIED`, `verified_by: orchestrator`,
`verified_on: 2026-08-25`.

L'orchestrateur, instance indépendante de l'agent exécuteur, a complété la
vérification partielle du 2026-08-25 (`docs/ai/VALIDATION.md`, section A.6)
par une grille de preuves supplémentaire (section A.7) : quatorze questions
répondues, 32 sources définies au tableau 7.6, API GraphRAG confirmée, 25
liens officiels en HTTP 200, sept noms candidats vérifiés sur cinq registres
chacun (`crates.io` désormais confirmé en HTTP 404 pour les sept), syntaxe
YAML/JSONL et encodage UTF-8 cohérents, absence de donnée réelle ou de scan
d'un document privé, aucune pile technologique choisie. Les limites relatives
aux marques déposées et aux TLD autres que `.com` **restent non levées** et
demeurent déclarées non testées.

Le rapport `docs/research/phase-1-research-and-positioning.md`, section 7.4,
est corrigé en conséquence : la limite « `crates.io` non vérifié pour cinq
candidats » est retirée et remplacée par le constat des sept résultats
confirmés.

`TASK-0002` et la phase 1 passent à `VERIFIED`. `ACTION-0004` est close.
Aucune tâche `IN_PROGRESS` à l'issue de cette clôture.
