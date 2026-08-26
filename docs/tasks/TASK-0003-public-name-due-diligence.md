# TASK-0003 — Diligence raisonnable et décision du nom public

- **Statut :** `VERIFIED`
- **Phase :** 1 — Recherche et positionnement (complément, après `VERIFIED`)
- **Ouverte le :** 2026-08-25
- **Démarrée le :** 2026-08-25 (passage à `IN_PROGRESS` avant toute
  consultation de source, sous l'autorisation permanente du 2026-08-25)
- **Livrée le :** 2026-08-25 par Codex; en attente de vérification de
  cohérence avant passage éventuel à `VERIFIED`
- **Vérifiée le :** 2026-08-25 par l'orchestrateur, `ACTION-0006`; voir
  `docs/ai/VALIDATION.md`, section C
- **Approuvée via :** autorisation permanente du 2026-08-25 — aucun GO humain
  distinct requis pour démarrer la recherche en lecture seule.
- **Effort recommandé :** modèle **Opus**, effort **élevé**. Recherche
  documentaire multi-registres, comparaison de candidats, rédaction d'une
  fiche de décision. Aucun développement, aucun prototype.

---

## 1. Objectif unique

Compléter la diligence raisonnable engagée par `TASK-0002` (section 7.4,
« Noms publics candidats ») sur les points explicitement non couverts par ce
rapport, puis **décider ou recommander** le nom public du projet, consigné
dans `docs/decisions/DEC-0001-public-name.md`. Cette tâche ne fixe pas la
licence ni la pile technologique.

## 2. Contexte hérité de TASK-0002 (`VERIFIED`)

- Sept candidats déjà vérifiés sur cinq registres chacun (npm, PyPI,
  `crates.io`, GitHub, RDAP `.com`), le 2026-08-25 :
  `topodoc`, `docscape`, `cartodoc`, `folderscape`, `isodoc`, `terradoc`,
  `reliefdoc`. `crates.io` désormais confirmé pour les sept (HTTP 404 =
  libre).
- `folderscape` proposé en premier choix (libre sur les cinq registres, sans
  collision de marque relevée dans le champ logiciel), avec réserve sur les
  noms voisins « Folderscope » (source secondaire) et « Foldscape ».
  `cartodoc` explicitement déconseillé (collision avec le produit « CARTO »
  de deux éditeurs distincts).
- **Limites explicitement non levées par `TASK-0002` :** aucune recherche
  formelle en base de marques déposées ; seul le TLD `.com` a été vérifié.
  Ces deux limites sont l'objet principal de `TASK-0003`.

## 3. Répertoire autorisé

- Lecture et écriture strictement limitées à ce dépôt
  (`TopographicDocumentMap`).
- Aucune lecture, aucun listage, aucune écriture en dehors du dépôt.
- Accès réseau limité à la **consultation en lecture** de sources publiques :
  bases de marques officielles (CIPO, USPTO, WIPO, EUIPO) si accessibles sans
  session interactive ni requête bloquée, moteurs de recherche généralistes,
  registres de noms de domaine (RDAP ou WHOIS en lecture), registres de
  paquets. **Aucune écriture réseau** : aucune réservation, aucun achat,
  aucun compte créé, aucun paiement, quel qu'il soit.

## 4. Fichiers créables ou modifiables

**Livrable principal (créable) :**

- `docs/decisions/DEC-0001-public-name.md`, au gabarit de
  `docs/decisions/README.md`.

**Fichiers d'état à mettre à jour à la clôture (existants, modifiables) :**

- `docs/ai/CURRENT_STATE.md`
- `docs/ai/NEXT_ACTION.md`
- `docs/ai/HANDOFF.md`
- `docs/ai/CHANGELOG_AI.md`
- `graph/current_state.yaml`
- `graph/project_graph.yaml`
- `graph/history.jsonl` (ajout seul)
- `ROADMAP.md` (mention de la diligence complémentaire, si utile)
- Cette fiche, `docs/tasks/TASK-0003-*.md` (progression de statut)
- Éventuellement `docs/research/phase-1-research-and-positioning.md`, en
  ajout seul (section « Complément »), pas en réécriture des constats déjà
  vérifiés.

**Aucun autre fichier n'est créé ou modifié.**

## 5. Interdictions

1. Lire, lister ou écrire hors du dépôt.
2. Réserver, acheter ou créer un nom de domaine, un compte, un dépôt distant
   ou une marque, sous quelque forme que ce soit.
3. Fixer **définitivement** le nom public sans que la fiche de décision ne
   marque explicitement si elle est actée ou soumise à un GO humain restant.
   Fixer le nom public de façon irréversible (dépôt, publication, marque)
   reste un point d'arrêt de `AGENTS.md`/`CLAUDE.md` §5.
4. Décider la licence définitive ou la pile technologique.
5. Copier du code source d'un tiers dans ce dépôt.
6. Ajouter une dépendance, installer un outil.
7. Mentionner, comparer à, ou réutiliser quoi que ce soit d'un projet privé.
8. Créer un commit, une branche publique, un dépôt distant ; publier.
9. Présenter une affirmation non sourcée comme un fait.
10. Démarrer la phase 2 ou produire du code applicatif.
11. S'attribuer l'état `VERIFIED`.

## 6. Méthode

### 6.1 Recherche officielle de marques (si accessible)

- Tenter une recherche en lecture seule sur les bases officielles
  canadienne (CIPO), américaine (USPTO), internationale (WIPO Global Brand
  Database) et européenne (EUIPO), pour chacun des candidats retenus
  (`folderscape` en priorité, puis `reliefdoc` et tout nouveau candidat émis
  par cette tâche).
- Si une base exige une session interactive ou bloque la requête en lecture
  automatisée (comme constaté pour l'USPTO dans `TASK-0002`), consigner
  l'échec d'accès explicitement, avec la preuve (code de réponse ou
  constat), plutôt que de l'omettre.

### 6.2 Recherche Web générale et collisions

- Recherche générale par moteur de recherche sur chaque candidat retenu, en
  plus des registres de code déjà vérifiés.
- Recherche explicite de collisions **phonétiques** (sonorité proche),
  **orthographiques** (graphie proche) et **logicielles** (produits ou
  projets logiciels existants portant un nom proche), pour chaque candidat.

### 6.3 TLD complémentaires

- Vérifier la disponibilité de `.org`, `.app`, `.dev` et `.ca` pour les
  candidats retenus, en RDAP ou WHOIS officiel en lecture seule.

### 6.4 Nouveaux candidats, si nécessaire

- Si `folderscape` reste jugé à risque significatif après les recherches
  6.1 à 6.3 (collision de marque ou de logiciel avérée, pas seulement une
  proximité phonétique), proposer **au moins trois** nouveaux noms candidats
  distinctifs, vérifiés selon la même méthode que `TASK-0002` (les cinq
  registres) et cette même fiche (marques, Web, TLD).

### 6.5 Décision consignée

- Rédiger `docs/decisions/DEC-0001-public-name.md` au gabarit de
  `docs/decisions/README.md` : contexte, options examinées (les candidats de
  `TASK-0002` et, le cas échéant, les nouveaux candidats de 6.4), décision ou
  recommandation, motif, conséquences, preuves.
- Si l'ensemble des vérifications ne laisse subsister aucune ambiguïté
  importante et aucun risque de marque non maîtrisé, cette tâche peut
  **recommander** un nom avec un niveau de confiance élevé ; la fixation
  **irréversible** (réservation, dépôt public, marque) reste hors du
  périmètre de cette tâche et de l'autorisation permanente (point d'arrêt
  explicite de `AGENTS.md`/`CLAUDE.md` §5).

## 7. Critères d'acceptation

| # | Critère |
|---|---------|
| 1 | `docs/decisions/DEC-0001-public-name.md` existe, au gabarit du dossier |
| 2 | Recherche de marques officielle tentée pour CIPO, USPTO, WIPO et EUIPO, avec résultat ou échec d'accès consigné pour chacune |
| 3 | Recherche Web générale et collisions phonétiques/orthographiques/logicielles documentées pour chaque candidat retenu |
| 4 | Disponibilité de `.org`, `.app`, `.dev` et `.ca` vérifiée pour les candidats retenus |
| 5 | Si `folderscape` reste risqué, au moins trois nouveaux candidats distinctifs sont proposés et vérifiés sur les cinq registres de `TASK-0002` |
| 6 | Aucune réservation, aucun achat, aucun compte créé |
| 7 | Aucune référence à un projet privé |
| 8 | Aucune pile technologique ni licence définitive décidée par cette tâche |
| 9 | Une seule tâche `IN_PROGRESS` à tout instant ; aucune à la clôture |
| 10 | `NEXT_ACTION.md` contient exactement une action à la clôture |

## 8. Conditions d'arrêt

L'exécution s'arrête, et un GO humain est demandé, dès que l'un de ces cas se
présente :

- une réservation, un achat ou une création de compte deviendrait nécessaire
  pour compléter une vérification ;
- une base de marques officielle exigerait une action au-delà de la lecture
  (paiement, création de compte, CAPTCHA non contournable) ;
- le nom public serait sur le point d'être **fixé de façon irréversible**
  (dépôt public créé, marque déposée, domaine acheté) plutôt que recommandé ;
- une source suggérerait un lien, direct ou indirect, avec un projet privé ;
- la phase 2 deviendrait nécessaire pour conclure.

## 9. Rapport

### 9.1 Résultat livré

- Fiche de décision complétée : `docs/decisions/DEC-0001-public-name.md`.
- Nom de travail public retenu de façon réversible : **FileTopo**
  (`filetopo` comme identifiant technique).
- `folderscape` écarté à cause des collisions proches `Foldscape` et
  `Folderscope`.
- Trois nouveaux candidats contrôlés sur neuf points chacun : npm, PyPI,
  `crates.io`, GitHub exact, puis `.com`, `.org`, `.app`, `.dev` et `.ca`.
  `filetopo`, `folderatlas` et `terrafolder` ont retourné 404 sur les neuf
  contrôles au moment de la vérification.
- `FolderAtlas` écarté à cause d'Atlas Intel, produit récent du même espace
  fonctionnel; `TerraFolder` écarté à cause des proximités
  `terra-folder-tree` et `terra folder`.
- CIPO : 0 résultat exact pour la requête combinée des trois candidats.
- EUIPO : 0 résultat simple exact pour chacun des trois candidats.
- USPTO : tentative bloquée par le mécanisme AWS WAF; résultat non vérifié.
- WIPO : service et portée officiels confirmés, mais aucune requête
  automatisée effectuée puisque les conditions officielles l'interdisent;
  résultat non vérifié.

### 9.2 Vérifié

- Les quatre bases officielles exigées ont été tentées ou évaluées, et leur
  résultat ou limite est consigné.
- Les TLD `.org`, `.app`, `.dev` et `.ca` ont été contrôlés pour le trio final.
- Les collisions Web, phonétiques, orthographiques et logicielles sont
  documentées dans `DEC-0001`.
- Aucun domaine, compte, dépôt distant ou marque n'a été réservé, acheté ou
  créé.
- Aucune licence ni pile technologique n'a été décidée par cette tâche.

### 9.3 Non vérifié / inconnu

- Résultat de recherche USPTO et WIPO.
- Recherche juridique exhaustive par classes, similarités et droits non
  enregistrés.
- Disponibilité future des registres et domaines.

### 9.4 État de clôture

Le livrable est `VERIFIED` après contrôle des dix critères, des documents,
des deux YAML et du JSONL par l'orchestrateur. Le choix n'est pas une fixation
irréversible : aucune action externe n'a été entreprise.
