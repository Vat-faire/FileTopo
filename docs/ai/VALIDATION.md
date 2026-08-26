# VALIDATION.md — État de vérification

**Dernière mise à jour :** 2026-08-25
**Portée :** TASK-0001 (phase 0) — `VERIFIED` ; TASK-0002 (phase 1) —
`VERIFIED` le 2026-08-25, sur preuves indépendantes de l'orchestrateur
(section A.7)

Trois qualificatifs seulement : **vérifié**, **non testé**, **inconnu**.

---

## A. TASK-0002 — Phase 1, recherche et positionnement (2026-08-25)

**Statut : `VERIFIED`** le 2026-08-25, sur preuves indépendantes de
l'orchestrateur (section A.7). L'agent exécuteur ne s'était pas attribué cet
état ; il a été posé par une instance indépendante de l'exécuteur, conformément
à `AGENTS.md`/`CLAUDE.md` §3. `ACTION-0004` (`docs/ai/NEXT_ACTION.md`) est
close par cette vérification.

### A.1 Vérifié par l'agent exécuteur — lecture directe, **non indépendante**

| Élément | Preuve |
|---------|--------|
| Le livrable existe | `docs/research/phase-1-research-and-positioning.md` créé ; création confirmée par l'outil d'écriture |
| Les huit sous-sections 7.1 à 7.8 sont présentes | Rédigées et relues dans cet ordre, plus les sections « Non testé » et « Risques » |
| Les quatorze questions figurent dans leur libellé exact | Recopiées depuis la section 7.1 de `TASK-0002` en sous-sections 7.1.1 à 7.1.14 |
| Chaque question porte faits sourcés, inférences signalées et incertitudes | Marquage `[FAIT]`, `[INFÉRENCE]`, `[RECOMMANDATION]`, `[INCERTITUDE]` appliqué |
| Le tableau comparatif couvre dix solutions | Section 7.2, une ligne par solution, source citée par ligne |
| Sept noms candidats avec constats de disponibilité | Section 7.4, cinq registres interrogés |
| **Aucune réservation, aucun achat, aucun compte créé** | Toutes les requêtes réseau ont été des lectures : `GET` sur registres npm, PyPI, crates.io, API GitHub, RDAP Verisign, et pages web publiques |
| Les termes de MIT sont cités depuis une source officielle | Texte SPDX reproduit en 7.5.1 |
| Une alternative est examinée sans être retenue | Apache-2.0, texte officiel de l'ASF, section 7.5.3 |
| La recommandation finale est marquée « SOUMISE À DÉCISION HUMAINE » | Section 7.8, encadré en tête |
| Aucune pile technologique n'est choisie | Section 7.8.3, qui le déclare explicitement |
| Aucune référence à un projet privé | Rapport rédigé uniquement à partir de sources publiques citées |
| Aucun code tiers copié | Seuls des textes de licence et des accroches produit sont cités, en citation attribuée |
| Une seule tâche `IN_PROGRESS` pendant l'exécution, aucune à la clôture | `graph/current_state.yaml` : `in_progress_count: 0` à la clôture |
| `NEXT_ACTION.md` contient exactement une action | `ACTION-0004`, seule entrée |
| `graph/history.jsonl` n'a subi que des ajouts | Les lignes 1 à 15 existantes sont inchangées ; les nouvelles lignes sont ajoutées en fin de fichier |

### A.2 Non testé — déclaré explicitement

| Élément | Raison |
|---------|--------|
| **Analyse syntaxique automatisée des fichiers YAML** | **Aucun outil d'exécution de commande n'est disponible dans cette session** : ni interpréteur, ni analyseur YAML. `graph/current_state.yaml` et `graph/project_graph.yaml` ont été **relus à l'écran** après édition, pas passés dans un analyseur. |
| **Analyse syntaxique automatisée de `graph/history.jsonl`** | Même raison. Les lignes ajoutées ont été relues : accolades et guillemets appariés, une ligne par événement, aucune virgule terminale. **Non validé par un analyseur JSON.** |
| Couverture exhaustive du tableau des sources | Chaque affirmation factuelle porte un identifiant `S-nn`, mais **aucun contrôle croisé automatisé** n'a été fait entre le corps du rapport et le tableau 7.6. Ce contrôle est confié à `ACTION-0004`, point 7. |
| Comportement réel des dix outils comparés | **Aucun n'a été installé ni exécuté.** Toutes les cellules du tableau 7.2 reposent sur des déclarations d'éditeurs. |
| Toute mesure de performance ou de volumétrie | Aucune n'a été prise, pour aucun outil. |
| `crates.io` pour cinq des sept noms candidats | Non interrogé. Ces noms ne sont **pas** déclarés libres sur ce registre. |
| Antériorité de marque des noms candidats | Les bases officielles (USPTO, CIPO, EUIPO, WIPO) exigent une session interactive ou une requête POST. La tentative sur le service de l'USPTO n'a renvoyé aucun résultat exploitable. |
| TLD autres que `.com` | Non interrogés. |
| Validité juridique des raisonnements de licence | **Aucun avis juridique.** Le rapport n'en tient pas lieu. |
| Fins de ligne sur le disque | Non contrôlées ; aucun `.gitattributes` n'a été posé. |
| Cohérence des liens relatifs entre documents | Aucun vérificateur de liens n'a été exécuté. |

### A.3 Inconnu

- Si un outil existant applique déjà la métaphore topographique à des fichiers
  locaux. La recherche menée n'a rien trouvé de pertinent, ce qui **ne prouve
  pas** l'absence.
- Si le relief est réellement plus lisible qu'un pavage rectangulaire pour
  cette tâche. C'est l'hypothèse centrale du projet ; elle n'est pas éprouvée.
- Si le public cible postulé correspond à une demande réelle.
- Faisabilité et coût des principes annoncés (surveillance incrémentale,
  volumétrie, rendu) — phases 3 à 5.

### A.4 Non-conformité résiduelle — **corrigée le 2026-08-25**

`ROADMAP.md`, ligne 19, énonçait « Chaque passage d'une phase à la suivante
requiert un **GO humain explicite** », obsolète depuis l'autorisation
permanente du 2026-08-25. Cette correction, hors du périmètre de `TASK-0002`,
a été effectuée par l'orchestrateur dans le cadre de la présente correction
post-vérification (section A.6) : le passage d'une phase à l'autre est
désormais décrit comme autonome dès critères et preuves satisfaits, la phase 6
conservant son GO humain spécial et sa condition d'audits préalables.

### A.6 Corrections apportées après vérification indépendante de l'orchestrateur (2026-08-25)

**Contexte.** L'orchestrateur a conduit une vérification indépendante de
`docs/research/phase-1-research-and-positioning.md` et a obtenu, en lecture
seule, les preuves suivantes — distinctes de celles rassemblées par l'agent
exécuteur en A.1 :

| Élément vérifié | Preuve indépendante obtenue |
|---|---|
| Identité du dépôt GraphRAG Workbench | API GitHub : `full_name: lyon-industries/graphrag-workbench`, licence `MIT`, `created_at: 2025-09-04T15:29:08Z`, `pushed_at: 2026-07-18T09:47:42Z`, 713 étoiles, 91 bifurcations, `archived: false`, langage TypeScript |
| Version publiée | API des releases : tag `v0.1.0-alpha.1`, nom exact « v0.1.0-alpha.1 — GraphRAG Workbench (First alpha) », `prerelease: true`, `published_at: 2025-09-04T16:22:04Z` — **le rapport citait auparavant un intitulé inventé (« Initial Alpha ») et une année inférée plutôt que constatée** ; corrigé (section 7.1.0 et tableau des sources, S-04) |
| Contributeurs | API GitHub : un seul contributeur, `ChristopherLyon`, 14 contributions |
| Citations du README/LICENSE | Toutes les expressions citées dans le rapport confirmées telles quelles |
| Microsoft GraphRAG | MIT, `pushed_at: 2026-08-24`, 35 679 étoiles, 3 747 bifurcations, non archivé ; mention « largely in maintenance mode » et avertissement de coût d'indexation confirmés |
| Noms candidats `folderscape` et `cartodoc` | HTTP 404 confirmé sur npm, PyPI, `crates.io`, comptes/organisations GitHub, et RDAP Verisign `.com` — disponibilité déclarée par le rapport confirmée |
| 25 liens officiels du tableau de sources (7.6) | HTTP 200 |
| Source S-27 (Softpedia) | HTTP **403** — reste une source **secondaire non vérifiée indépendamment**, déjà signalée comme secondaire dans le rapport |

**Validations de format déjà effectuées par l'orchestrateur** (reprises de
l'exercice de vérification, en complément de A.1) : structure en huit
sous-sections, présence des quatorze questions dans leur libellé exact,
marquage systématique faits/inférences/recommandations/incertitudes, mention
« soumise à décision humaine », absence de choix de pile technologique,
absence de réservation de nom/domaine/compte.

**Corrections apportées au rapport à la suite de cette vérification :**

1. **Intitulé et date de la version `v0.1.0-alpha.1`** — l'intitulé inventé
   « Initial Alpha » et l'année inférée sont remplacés par le nom exact et la
   date officielle de l'API des releases ; la source `S-04` pointe désormais
   vers l'URL API officielle des releases plutôt que vers la page HTML.
2. **Nuance Apache-2.0** — les formulations affirmant un fichier `NOTICE`
   « obligatoire » sont corrigées : la clause §4(d) n'impose de reproduire les
   notices d'un fichier `NOTICE` que **si l'œuvre distribuée en comporte déjà
   un**. Ce n'est pas un fichier universellement à créer.
3. **Nuance GPL/AGPL** — le tableau de compatibilité de licence précise
   qu'une distribution combinée ou liée à un composant copyleft doit
   respecter sa licence et ne peut pas se présenter comme « MIT seul », mais
   que les limites exactes (module en plugiciel, processus séparé, liaison
   dynamique) restent des questions de qualification juridique non tranchées
   par ce rapport, qui ne constitue pas un avis juridique.

**Limites de cette vérification, déclarées explicitement :**

- **Aucune vérification formelle en base de marques** n'a été faite par
  l'orchestrateur, pour les mêmes raisons d'accès que celles déjà rapportées
  par l'agent exécuteur (A.2) : les bases officielles (USPTO, CIPO, EUIPO,
  WIPO) exigent une session interactive ou une requête POST.
- **Softpedia (S-27) a répondu HTTP 403** lors de cette vérification et reste
  une **source secondaire non vérifiée indépendamment** ; le rapport le
  signale déjà comme tel et aucune affirmation factuelle ne repose sur cette
  seule source sans l'indiquer.
- Cette vérification ne porte pas sur la totalité des contrôles de
  `ACTION-0004` (par exemple le contrôle croisé exhaustif du corps du rapport
  contre le tableau des sources) : elle documente les preuves obtenues à ce
  stade, pas une clôture de `ACTION-0004`.

**Statut à l'issue de cette étape.** `TASK-0002` restait `IMPLEMENTED` à
l'issue de cette correction partielle. La clôture finale est en section A.7.

### A.7 Vérification indépendante finale et clôture de `ACTION-0004` (2026-08-25)

**Exécutant :** orchestrateur, instance indépendante de l'agent exécuteur.
**Résultat :** `TASK-0002` déclarée **`VERIFIED`** sur la grille de preuves
ci-dessous, en complément des preuves déjà rassemblées en A.1 et A.6.

**Grille de preuves.**

| Élément | Preuve |
|---|---|
| Quatorze questions du prompt maître | Réponses présentes et complètes en sections 7.1.1 à 7.1.14 du rapport |
| Sources définies dans le tableau 7.6 | **32 sources** (`S-01` à `S-31`, y compris `S-21bis`), chacune avec URL, organisme, nature et affirmation soutenue |
| API GraphRAG (dépôt, releases, contributeurs) | Confirmée en A.6 : `full_name`, licence, dates, étoiles, bifurcations, tag `v0.1.0-alpha.1`, contributeur unique |
| Liens officiels du tableau des sources | **25 liens vérifiés, 25 en HTTP 200** (A.6) ; Softpedia (S-27) en HTTP 403, resté signalé comme source secondaire |
| Registres de noms candidats | **7 candidats × 5 registres** (npm, PyPI, `crates.io`, GitHub, RDAP `.com`) : `crates.io` confirmé en HTTP 404 pour les **sept** candidats le 2026-08-25 — `topodoc`, `docscape`, `cartodoc`, `folderscape`, `isodoc`, `terradoc`, `reliefdoc`. Résultats complémentaires confirmés : `topodoc` npm+RDAP `.com` = HTTP 200 (pris) ; `docscape` GitHub+RDAP = HTTP 200 (pris) ; `cartodoc` cinq registres = HTTP 404 (libre) ; `folderscape` cinq registres = HTTP 404 (libre) ; `isodoc` GitHub+RDAP = HTTP 200 (pris) ; `terradoc` PyPI+GitHub+RDAP = HTTP 200 (pris) ; `reliefdoc` RDAP = HTTP 200 (domaine pris), npm/PyPI/`crates.io`/GitHub = HTTP 404 (libres) |
| Syntaxe et encodage des fichiers d'état | `graph/current_state.yaml`, `graph/project_graph.yaml` : YAML lu et cohérent ; `graph/history.jsonl` : JSONL en ajout seul ; encodage UTF-8 conservé sur tous les fichiers modifiés |
| Absence de donnée réelle ou de scan privé | Aucune référence à un projet privé, aucun secret, aucun chemin local personnel introduit par le rapport ni par ses corrections |
| Pile technologique | **Aucune choisie** — confirmé en section 7.8.3 du rapport, inchangée par cette vérification |
| Limite marques | **Conservée** : aucune recherche formelle en base de marques (USPTO/CIPO/EUIPO/WIPO) n'a pu être faite ; reste déclarée non testée |
| Limite TLD | **Conservée** : seul `.com` a été vérifié ; les autres TLD (`.org`, `.app`, `.dev`, `.ca`) restent non testés |

**Correction apportée au rapport à la suite de cette clôture.** La limite
« `crates.io` n'a été vérifié que pour deux candidats » est **retirée** de la
section 7.4 du rapport, remplacée par le constat que les sept candidats sont
confirmés libres sur `crates.io`. Les sections « Non testé » (§8) et
« Incertitudes » (§7.7.4) du rapport sont mises à jour en conséquence. Les
limites relatives aux marques et aux TLD **restent intactes**, non levées par
cette vérification.

**Ce que cette vérification ne couvre pas.** Aucune recherche formelle de
marque, aucun TLD hors `.com`, aucune mesure de performance, aucun test
d'utilisabilité. Ces points demeurent « non testé », transmis à `TASK-0003`
(diligence raisonnable sur le nom public).

**Conséquence.** `TASK-0002` et la phase 1 passent à `VERIFIED`,
`verified_by: orchestrator`, `verified_on: 2026-08-25`. `ACTION-0004` est
close. Une nouvelle action unique, `ACTION-0005`, ouvre `TASK-0003`.

### A.5 Ce qu'un humain reste seul à pouvoir juger

1. Le **nom public** — le rapport propose `folderscape`, déconseille
   `cartodoc`. Rien n'est arrêté ni réservé.
2. La **licence définitive** — le rapport propose MIT et écarte Apache-2.0
   après examen. Rien n'est apposé.
3. Si la valeur distincte formulée en 7.3.2 correspond bien à son intention.
4. S'il accepte les limites du MVP sans IA énoncées en 7.3.3.

---

## B. TASK-0001 — Phase 0, isolation et démarrage

**Statut : `VERIFIED` le 2026-08-25**, sur vérification indépendante de
l'orchestrateur. L'agent exécuteur ne s'est pas attribué cet état.

### B.1 Vérification indépendante de l'orchestrateur — 2026-08-25

| Contrôle | Indicateur | Résultat |
|----------|-----------|----------|
| Décompte des fichiers du dépôt | `file_count` | 19 |
| Syntaxe des deux fichiers YAML | `yaml_parsed_by_tool` | `true` |
| Syntaxe de `graph/history.jsonl` | `jsonl_parsed_by_tool` | `true` |
| Encodage des fichiers | `encoding_inspected` | `true` — UTF-8 |
| Absence de référence privée | `private_reference_scan` | `true` — aucune |
| État Git local | — | obtenu |

**Avertissement Git, non bloquant.** Le fichier d'exclusion global déclaré dans
la configuration n'était pas accessible lors du contrôle. Cet avertissement n'a
pas empêché l'obtention de l'état local du dépôt, qui a bien été lu.

### B.2 Vérifié

| Élément | Preuve |
|---------|--------|
| Le dépôt ne contenait aucun fichier de projet avant TASK-0001 | Listage du dépôt : seuls `.git/` et ses gabarits de crochets existaient |
| Tous les fichiers listés dans `CURRENT_STATE.md` ont été créés | Confirmation de création retournée pour chaque écriture |
| `AGENTS.md` et `CLAUDE.md` portent les mêmes règles | Rédigés à partir du même texte, sections 1 à 7 identiques |
| Aucun code applicatif, aucune dépendance | Aucun fichier source ni manifeste de dépendances créé |
| Aucune installation, aucune publication, aucun commit | Aucune commande de ce type exécutée pendant la tâche |
| Aucun secret ni chemin local personnel dans les fichiers versionnés | Rédaction sans chemin absolu ni identifiant ; relecture du contenu produit |
| Aucune donnée réelle, aucune référence à un projet tiers privé | Contenu entièrement rédigé pour ce projet |

### B.3 Non testé

| Élément | Raison |
|---------|--------|
| Fins de ligne | Non contrôlées ; aucun `.gitattributes` n'a été posé |
| Cohérence des liens relatifs entre documents | Aucun vérificateur de liens n'a été exécuté |

**Note.** La ligne « Adéquation de la vision au besoin réel — relève de la
phase 1, non faite » figurait ici avant le 2026-08-25. La phase 1 est
désormais **exécutée** : voir la section A et
`docs/research/phase-1-research-and-positioning.md`. Cette adéquation reste
néanmoins **non validée auprès d'utilisateurs** (section A.3).

---

## C. TASK-0003 — Diligence du nom public (2026-08-25)

### C.1 Vérification de l'orchestrateur — ACTION-0006

L'orchestrateur a relu le livrable, contrôlé les dix critères d'acceptation,
parsée les deux structures YAML et les 39 lignes JSONL, inspecté l'état Git et
recherché toute référence au corpus privé interdit. Cette vérification est
distincte de la rédaction du livrable attribuée à Codex dans la fiche de
tâche et le journal.

| # | Critère | Résultat | Preuve |
|---|---------|----------|--------|
| 1 | `DEC-0001` existe au gabarit | Conforme | Contexte, options, décision, motif, conséquences, preuves et limites présents |
| 2 | CIPO, USPTO, WIPO, EUIPO tentés | Conforme avec limites | CIPO/EUIPO : résultats directs; USPTO : WAF; WIPO : conditions interdisant l'automatisation |
| 3 | Collisions Web et proches documentées | Conforme | `FileTopo`, `FolderAtlas`, `TerraFolder`, `folderscape` comparés dans `DEC-0001` |
| 4 | `.org`, `.app`, `.dev`, `.ca` vérifiés | Conforme | Trio final contrôlé, 404 ponctuel sur les quatre TLD et `.com` |
| 5 | Trois nouveaux candidats si risque `folderscape` | Conforme | `filetopo`, `folderatlas`, `terrafolder`, neuf contrôles chacun |
| 6 | Aucune réservation, achat ou compte | Conforme | Aucun remote Git; aucune opération d'écriture réseau ou financière |
| 7 | Aucune référence au projet privé | Conforme | 0 correspondance au scan ciblé dans 23 fichiers |
| 8 | Licence et pile non décidées | Conforme | YAML et `CURRENT_STATE.md` conservent ces questions ouvertes |
| 9 | Aucune tâche `IN_PROGRESS` à la clôture | Conforme | `in_progress_count: 0`; `TASK-0003: IMPLEMENTED` avant vérification |
| 10 | Exactement une prochaine action | Conforme | `NEXT_ACTION.md` contient seulement `ACTION-0006` |

### C.2 Contrôles structurels

- `graph/current_state.yaml` : parse valide; compteur `IN_PROGRESS` à 0;
  `TASK-0003` à `IMPLEMENTED` lors du contrôle.
- `graph/project_graph.yaml` : parse valide; `public_name: FileTopo` et
  `public_name_decided: true`; `TASK-0003` à `IMPLEMENTED` lors du contrôle.
- `graph/history.jsonl` : 39 lignes valides avant ajout de l'événement de
  vérification.
- Git : aucun remote; tous les fichiers restent locaux et non suivis, aucun
  commit.
- Corpus privé interdit : zéro référence textuelle introduite; aucun accès au
  corpus n'a été effectué.

### C.3 Limites maintenues

- Résultats USPTO et WIPO non vérifiés.
- Pas de recherche juridique exhaustive par classes, similarités ou droits
  non enregistrés.
- Les disponibilités techniques sont ponctuelles et devront être refaites
  avant publication.

### C.4 Conclusion

Les critères de `TASK-0003` sont satisfaits sans masquer les limites. Le nom
**FileTopo** est acceptable pour poursuivre localement et de façon réversible.
`ACTION-0006` peut être close et `TASK-0003` portée à `VERIFIED`. Cette
conclusion n'autorise aucune fixation externe ou irréversible du nom.

---

## D. TASK-0004 — Architecture (2026-08-25)

### D.1 Vérification de l'orchestrateur

| # | Critère | Résultat | Preuve |
|---|---------|----------|--------|
| 1 | Quatre décisions, ≥3 options | Conforme | `DEC-0002` à `DEC-0005`, quatre options chacune |
| 2 | Pile Windows sourcée | Conforme | Tauri, Microsoft, Electron et Wails officiels cités |
| 3 | Frontières/processus explicites | Conforme | Diagramme, IPC typé, capacités minimales, menaces |
| 4 | Données/migrations définies | Conforme | Tables logiques, UTF-16LE, `user_version`, reconstruction |
| 5 | Rendu/relief pour 1 M | Conforme comme stratégie | Tuiles, LOD, ≤50 k primitives, calcul Rust |
| 6 | Budgets falsifiables | Conforme | Tableau 10 k/100 k/1 M avec p95, mémoire, FPS |
| 7 | Lecture seule testable | Conforme | Non-suivi reparse, placeholders, IDs IPC, aucune écriture corpus |
| 8 | Tests synthétiques erreurs/volumes | Conforme | Plan unitaire, SQLite, I/O, benchmarks, E2E |
| 9 | Aucun code/dépendance | Conforme | 0 source applicative, 0 manifeste |
| 10 | États structurés cohérents | Conforme | Deux YAML et JSONL parsés avant clôture |

### D.2 Contrôles observés

- Six livrables : 209, 57, 88, 109, 106 et 39 lignes.
- Zéro fichier `.rs`, `.ts`, `.tsx`, `.js`, `.jsx` ou `.toml`.
- Zéro `package.json`, `Cargo.toml` ou fichier de verrouillage.
- Zéro correspondance au nom du corpus privé interdit.
- Source SQLite officielle datée du 2026-08-24 intégrée : exigence d'une
  version corrigée du bogue WAL-reset.

### D.3 Conclusion

`TASK-0004` et les décisions `DEC-0002` à `DEC-0005` passent à `VERIFIED`.
Les performances demeurent des budgets, non des résultats; elles doivent être
mesurées dans le squelette avant toute promesse publique.

---

## E. TASK-0005 — Squelette vérifiable (2026-08-26)

### E.1 Vérification de l'orchestrateur

| # | Critère | Résultat | Preuve |
|---|---------|----------|--------|
| 1 | Installation, TypeScript, tests et build Web | Conforme | `pnpm install`, `check`, 1 test Vitest et build Vite réussis |
| 2 | Tests Rust | Conforme | 5 tests réussis avec cache incrémental désactivé |
| 3 | Fixture → index → DTO | Conforme | test d'intégration et commande Tauri, 9 éléments |
| 4 | Fixture inchangée | Conforme | empreinte des chemins et octets identique avant/après |
| 5 | IPC étroit | Conforme | trois commandes sans chemin ou SQL fourni par le frontend |
| 6 | Aucun réseau à l'exécution | Conforme | aucune permission réseau, CDN, télémétrie ou mise à jour |
| 7 | Aucune donnée réelle | Conforme | fixtures inventées et répertoires temporaires seulement |
| 8 | Licence et avis | Conforme | `LICENSE` MIT et `THIRD_PARTY_NOTICES.md` présents |
| 9 | Mesures 10 k/100 k | Conforme | 97 ms et 1 027 ms pour le pipeline mesuré |
| 10 | Mémoire synchronisée | Conforme | tâche, README, deux YAML, feuille de route et action actualisés |

### E.2 Chaîne Windows

- Rust 1.98.0 et Visual Studio Build Tools 2022 détectés.
- SQLite embarqué : 3.53.2, supérieur au minimum fixé pour le correctif WAL.
- Exécutable produit dans la sortie Tauri de débogage.
- Installateur NSIS `FileTopo_0.1.0_x64-setup.exe` produit localement.
- Aucun installateur n'a été exécuté et rien n'a été publié.

### E.3 Inspection visuelle avec Ordinateur

L'application compilée a été ouverte directement. La première inspection a
révélé que la liste accessible agrandissait toute la grille et repoussait le
centre de la carte hors écran. Un relief SVG de secours a été ajouté sous
PixiJS et la grille a été contrainte avec une liste interne défilable. Après
reconstruction, l'inspection a confirmé :

- relief et points visibles;
- statistiques 96 éléments et SQLite 3.53.2;
- bouton Fixture synthétique fonctionnel;
- pipeline réel affichant 9 éléments et 390 octets;
- aucune fenêtre d'autorisation, aucun réseau et aucun accès à une donnée
  utilisateur.

### E.4 Mesures observées

| Éléments | Génération | Indexation | Requête | Total |
|----------|-----------:|-----------:|--------:|------:|
| 10 000 | 18 ms | 55 ms | 24 ms | 97 ms |
| 100 000 | 77 ms | 726 ms | 224 ms | 1 027 ms |

Les limites sont détaillées dans
`docs/performance/phase-3-measurements.md`. Il s'agit d'un profil de test non
optimisé et d'un index en mémoire, pas d'une promesse de performance disque.

### E.5 Conclusion

`TASK-0005` et la phase 3 passent à `VERIFIED`. `ACTION-0008` est close.
L'autorisation permanente permet d'ouvrir immédiatement `TASK-0006` et
`ACTION-0009` pour la phase 4, sans autoriser de scan réel par l'agent ni de
publication.
