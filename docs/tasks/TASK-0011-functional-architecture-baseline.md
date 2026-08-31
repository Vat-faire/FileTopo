# TASK-0011 — Baseline des exigences fonctionnelles et décisions d'architecture

- **Identifiant :** `TASK-0011`
- **Titre :** Établir la baseline fonctionnelle et les décisions d'architecture
  de reconstruction, avant toute écriture de code
- **Statut :** `IMPLEMENTED`
- **Phase :** 1 — Exigences, matrice fonctionnelle et architecture
  ([ROADMAP.md](../../ROADMAP.md))
- **Proposée le :** 2026-08-31
- **Rédacteur de la fiche :** Claude Code, sous `ACTION-0016`
- **Exécuteur prévu :** non assigné; tout agent capable, après GO séparé
- **Effort recommandé :** une à deux sessions documentaires. Aucun
  développement, aucun prototype, aucune dépendance.
- **GO humain :** **acquis le 2026-08-31.** Sébastien a franchi la porte P1 et
  a explicitement approuvé cette fiche pour exécution documentaire, y compris
  le push final du commit documentaire vers `origin/rebuild/v0.2-project-brain`.
  Le GO ne couvre ni publication du produit, ni release, ni fusion.

> Cette fiche **prépare** la baseline. Elle ne la produit pas. Toute case
> « Résultat », « Décision retenue » ou « Mesure » reste vide tant que
> l'exécution n'a pas eu lieu sous un GO distinct.

---

## 1. Objectif unique

Produire une baseline écrite, vérifiable et suffisante pour qu'une phase de
développement puisse démarrer sans redécouvrir la conception : quelles
fonctions appartiennent au MVP, quel parcours utilisateur elles servent, et
quelles décisions d'architecture les soutiennent — **sans écrire une ligne de
code et sans trancher elle-même**, toutes les décisions restant `PROPOSED`
jusqu'au GO de Sébastien.

## 2. Contexte et problème réel

`TASK-0010` a rétabli une mémoire honnête : FileTopo est conservé, le
prototype 0.1 alpha reste une référence historique, et la reconstruction se
fait dans le dépôt existant ([DEC-0006](../decisions/DEC-0006-rebuild-in-place.md)).
La [matrice fonctionnelle](../product/FEATURE_MATRIX.md) recense 39 fonctions,
mais elle décrit surtout l'**écart** entre le prototype et la cible. Trois
manques bloquent aujourd'hui toute écriture de code responsable.

1. **Aucun périmètre de MVP arbitré.** 39 fonctions portent des priorités P0 à
   P3, mais rien ne dit lesquelles doivent exister pour qu'une première version
   reconstruite soit utile. Sans cette coupe, un développeur choisira par
   défaut, et le produit dérivera comme le prototype a dérivé.
2. **Des décisions d'architecture vérifiées mais possiblement périmées.**
   `DEC-0003` (Tauri 2 / Rust / React / TypeScript), `DEC-0004` (SQLite et
   modèle de données) et `DEC-0005` (PixiJS/WebGL et relief) ont été prises le
   2026-08-25 pour une conception de carte en relief à un million de nœuds. La
   cible actuelle est une **carte hiérarchique en blocs** dérivée de
   l'arborescence réelle. Ces décisions doivent être **réexaminées sur preuves**,
   pas reconduites par inertie ni jetées par réflexe.
3. **Le prototype contredit la vision sur des points structurels.** Carte en
   nuage de points artificiel, identifiants recréés à chaque parcours,
   réindexation destructive, absence de surveillance, onglet de cerveau qui ne
   charge pas son index. Chacun de ces écarts est une décision d'architecture
   déguisée en défaut d'implémentation; il faut les trancher explicitement.

Le problème réel n'est donc pas « que reste-t-il à coder », mais « quelles
questions doivent être répondues par écrit pour que le code qui suivra soit
justifiable ». `TASK-0011` répond à cette seconde question.

## 3. Périmètre

- Analyse documentaire du dépôt public, en lecture seule.
- Recherche de sources officielles publiques, en lecture seule.
- Rédaction de documents d'exigences, d'architecture, de formats, de
  performance et de tests.
- Rédaction de fiches de décision au statut `PROPOSED` uniquement.

Hors périmètre : toute écriture de code, toute dépendance, toute mesure
exécutée, toute publication et toute décision finale.

## 4. Fichiers à lire avant exécution

Dans cet ordre, et sans élargir la lecture au-delà :

1. [AGENTS.md](../../AGENTS.md) ou [CLAUDE.md](../../CLAUDE.md);
2. [docs/ai/START_HERE.md](../ai/START_HERE.md);
3. [docs/ai/CURRENT_STATE.md](../ai/CURRENT_STATE.md);
4. [docs/ai/NEXT_ACTION.md](../ai/NEXT_ACTION.md);
5. cette fiche;
6. [PROJECT_VISION.md](../../PROJECT_VISION.md);
7. [ROADMAP.md](../../ROADMAP.md);
8. [docs/product/FEATURE_MATRIX.md](../product/FEATURE_MATRIX.md);
9. [docs/product/REFERENCE_INTERFACE.md](../product/REFERENCE_INTERFACE.md);
10. [docs/architecture/DATA_PIPELINE_VISION.md](../architecture/DATA_PIPELINE_VISION.md);
11. [docs/archive/v0.1-alpha/BASELINE_ASSESSMENT.md](../archive/v0.1-alpha/BASELINE_ASSESSMENT.md);
12. [docs/decisions/README.md](../decisions/README.md) et les fiches
    [DEC-0003](../decisions/DEC-0003-tech-stack.md),
    [DEC-0004](../decisions/DEC-0004-index-and-data-model.md),
    [DEC-0005](../decisions/DEC-0005-rendering-and-relief.md) et
    [DEC-0006](../decisions/DEC-0006-rebuild-in-place.md);
13. [docs/architecture/phase-2-architecture.md](../architecture/phase-2-architecture.md)
    et [docs/security/threat-model.md](../security/threat-model.md);
14. [docs/performance/README.md](../performance/README.md) et les mesures
    historiques de [phase 3](../performance/phase-3-measurements.md) et
    [phase 4](../performance/phase-4-mvp-measurements.md);
15. le code du prototype **en lecture seule**, strictement pour constater
    l'existant : `src/`, `src-tauri/src/`, `tests/`, `package.json`,
    `src-tauri/Cargo.toml`.

`graph/` peut être lu pour information, mais reste déclaré non fiable comme
source d'état et ne doit être ni cité comme preuve ni modifié.

## 5. Fichiers modifiables pendant l'exécution future

Créations attendues :

- `docs/product/REQUIREMENTS_BASELINE.md`
- `docs/product/USER_JOURNEY.md`
- `docs/architecture/ARCHITECTURE_BASELINE.md`
- `docs/architecture/FORMAT_MATRIX.md`
- `docs/architecture/TEST_STRATEGY.md`
- `docs/performance/BASELINE_TARGETS.md`
- `docs/decisions/DEC-0007-rebuild-tech-stack.md`
- `docs/decisions/DEC-0008-hierarchical-rendering.md`
- `docs/decisions/DEC-0009-data-model-and-relations.md`
- `docs/decisions/DEC-0010-indexing-and-watching.md`
- `docs/decisions/DEC-0011-brain-isolation-and-migrations.md`
- `docs/decisions/DEC-0012-ai-architectural-boundary.md`

Modifications attendues :

- `docs/tasks/TASK-0011-functional-architecture-baseline.md` (cette fiche :
  états, rapport d'exécution)
- `docs/ai/CURRENT_STATE.md`, `docs/ai/NEXT_ACTION.md`, `docs/ai/HANDOFF.md`,
  `docs/ai/VALIDATION.md`, `docs/ai/CHANGELOG_AI.md`
- `docs/product/FEATURE_MATRIX.md`, **seulement** pour ajouter une colonne ou
  une référence de baseline; les preuves et constats existants ne sont pas
  réécrits
- `ROADMAP.md`, **seulement** pour refléter l'état réel des phases

Aucun autre fichier. En particulier, `DEC-0003`, `DEC-0004` et `DEC-0005` sont
`VERIFIED` : conformément à [docs/decisions/README.md](../decisions/README.md),
une fiche vérifiée **n'est jamais modifiée**. Elle est remplacée par une fiche
nouvelle dont le champ `replaced_by` de l'ancienne fiche sera mis à jour
**uniquement après approbation humaine**, dans une tâche ultérieure.

## 6. Interdictions

1. Aucun fichier sous `src/`, `src-tauri/`, `tests/`, `public/`, `scripts/`,
   `.github/` ou `graph/`.
2. Aucun code, aucun prototype, aucun script, aucune dépendance ajoutée,
   supprimée ou mise à jour; aucun `npm install`, `cargo add`, `cargo build`.
3. Aucune exécution du logiciel, aucun build, aucune mesure de performance
   présentée comme réelle.
4. Aucune fiche de décision à un statut autre que `PROPOSED`.
5. Aucune modification de `DEC-0001` à `DEC-0006`.
6. Aucun accès à l'interface privée de référence : ni lecture, ni listage, ni
   recherche, ni citation de ses noms, chemins, données, métadonnées ou code.
7. Aucune donnée réelle. Les exemples, arborescences et volumétries sont
   exclusivement synthétiques et décrits comme tels.
8. Aucun chemin local personnel, secret, jeton ni identifiant dans le dépôt.
9. Aucune modification des documents analysés, aucune écriture dans une racine
   analysée.
10. Aucun accès réseau en écriture : aucun compte, aucune réservation, aucun
    achat, aucune dépense, aucun envoi de données. Lecture seule de sources
    publiques.
11. Aucun push hors de `rebuild/v0.2-project-brain`, aucune fusion, aucune
    pull request, aucune release, aucun tag, aucun force push, aucune
    réécriture d'historique, aucune modification de `main`.
12. Aucune tâche suivante créée ou démarrée; au plus une tâche `IN_PROGRESS`.

## 7. Livrables documentaires

Chaque livrable est daté, cite ses sources et distingue **fait**, **inférence**
et **incertitude**. Toute affirmation non exécutée porte la mention
**« non testé »**.

| # | Livrable | Contenu obligatoire | Couvre |
|---|---|---|---|
| L1 | `docs/product/REQUIREMENTS_BASELINE.md` | Baseline des 39 fonctions `F-001` à `F-039`, une ligne chacune, sans omission | Portées 1, 11 |
| L2 | `docs/product/USER_JOURNEY.md` | Parcours complet, de la sélection d'une racine à la carte construite automatiquement | Portée 2 |
| L3 | `docs/architecture/ARCHITECTURE_BASELINE.md` | Synthèse d'architecture reliant modèle de données, indexation, surveillance, exclusions, relations et cerveaux multiples | Portées 5 à 10, 15 |
| L4 | `docs/architecture/FORMAT_MATRIX.md` | Matrice de formats et de couches d'extraction | Portée 13 |
| L5 | `docs/performance/BASELINE_TARGETS.md` | Objectifs mesurables à 1 000, 10 000 et 100 000 fichiers synthétiques | Portée 12 |
| L6 | `docs/architecture/TEST_STRATEGY.md` | Plan de tests unitaires, intégration, Windows manuel, récupération et performance | Portée 16 |
| L7 | `DEC-0007` à `DEC-0012`, toutes `PROPOSED` | Six fiches de décision au gabarit officiel | Portées 3, 4, 5, 6, 7, 8, 9, 10, 14, 15 |

### 7.1 Portée détaillée exigée de l'exécution

L'exécution approuvée devra couvrir les seize points suivants, sans en omettre
ni en ajouter.

1. **Baseline des 39 fonctions.** Chaque fonction `F-001` à `F-039` reçoit
   exactement une classification : `MVP`, `ULTÉRIEUR` ou `DIFFÉRÉ`, un motif
   d'une phrase, une dépendance amont s'il y en a une, et un critère
   d'acceptation mesurable. Aucune fonction n'est laissée sans classification.
   Un écart avec la colonne « Priorité » existante doit être justifié.
2. **Parcours utilisateur.** De la sélection d'une racine par une personne non
   technique jusqu'à une carte construite automatiquement : étapes, états
   intermédiaires, progression, annulation, erreurs, premier rendu utile,
   et ce que l'utilisateur voit tant que l'indexation n'est pas terminée.
   Aucune étape ne suppose de configuration manuelle de la carte.
3. **Pile technologique.** Comparaison documentée : conserver Tauri 2, Rust,
   React, TypeScript et SQLite, ou les faire évoluer. **Aucune réécriture n'est
   supposée.** L'option « conserver » doit être traitée sérieusement, avec ses
   avantages, et non comme une option de repli. Coût de migration, maturité,
   risques Windows, licences et réutilisation du prototype doivent apparaître.
4. **Rendu hiérarchique.** Comparaison HTML/SVG, Canvas 2D et WebGL pour une
   carte **en blocs hiérarchiques**, pas pour un relief à un million de nœuds.
   WebGL n'est retenu que si un besoin est démontré par volumétrie et
   interactions attendues. L'accessibilité et le repli sans GPU sont des
   critères de comparaison, pas des ajouts ultérieurs.
5. **Modèle de données.** Cerveaux, nœuds, identifiants stables, relations,
   préférences, état vu/non vu, journal de changements et versions de schéma.
   La stratégie d'identifiant stable doit indiquer ce qui survit à un
   renommage, à un déplacement, à un changement de volume, et ce qui ne survit
   pas.
6. **Indexation.** Sûre, reconstructible, incrémentale et **strictement non
   destructive** sur les sources. La réindexation ne doit jamais vider l'index
   courant avant d'avoir un remplacement valide.
7. **Surveillance Windows.** Rafales d'événements, débordement de tampon,
   renommages, déplacements, suppressions, lecteurs absents ou déconnectés, et
   reprise après interruption. Le comportement attendu quand le mécanisme de
   surveillance perd des événements doit être écrit, pas supposé.
8. **Exclusions et fichiers infonuagiques.** Politique d'exclusion sûre,
   visible et configurable; traitement des points de réanalyse, jonctions et
   liens symboliques; représentation des fichiers en ligne seulement **sans
   téléchargement automatique**.
9. **Relations.** Relations hiérarchiques dérivées automatiquement de
   l'arborescence réelle, et relations transversales à **provenance explicite**
   — règle déterministe documentée, approbation utilisateur, ou suggestion
   clairement identifiée et révocable. Aucune relation n'est jamais inventée
   silencieusement.
10. **Cerveaux multiples réellement isolés.** Racine, index, nom, couleur,
    icône, préférences, vue et état vu/non vu séparés. Le défaut connu du
    prototype — changer d'onglet ne charge pas l'index correspondant — doit
    être traité comme exigence, pas comme bogue à corriger plus tard.
11. **Accessibilité et langues.** Navigation clavier complète, français et
    anglais persistants, contraste, alternatives non colorées, respect de la
    réduction de mouvement. Le niveau visé est nommé explicitement.
12. **Objectifs mesurables.** Pour des arborescences synthétiques de 1 000,
    10 000 et 100 000 fichiers : temps de première carte utile, temps
    d'indexation complète, coût d'une mise à jour incrémentale, mémoire,
    taille d'index, fluidité de navigation. Chaque objectif porte une méthode
    de mesure reproductible et la mention **« non testé »**.
13. **Matrice de formats.** Métadonnées au MVP; extraction de contenu et
    courriels ultérieurs; **OCR désactivé par défaut**, coûteux et soumis à
    consentement. Chaque format indique la couche, la provenance conservée et
    le traitement des erreurs.
14. **Limite architecturale de l'IA.** IA, embeddings, chatbot/RAG et GraphRAG
    restent **facultatifs et hors du MVP structurel**. L'architecture doit
    rendre leur absence normale et leur ajout possible sans refonte, sans les
    rendre nécessaires.
15. **Migrations, sauvegarde, intégrité et retour arrière.** Versions de
    schéma, migration atomique, copie de sûreté dans l'espace applicatif,
    détection de corruption, reconstruction depuis les sources, et retour
    arrière lorsqu'il est possible. Une migration impossible ne doit jamais
    toucher les documents sources.
16. **Plan de tests.** Tests unitaires, tests d'intégration, tests manuels
    Windows, tests de récupération et tests de performance, tous sur données
    **synthétiques**, avec le critère qui rendrait chaque catégorie
    satisfaisante.

## 8. Recherches officielles requises

Sources **primaires et officielles** uniquement, consultées en lecture seule,
chacune citée avec son URL et sa date de consultation. Une source secondaire
peut illustrer mais ne prouve rien; elle est marquée comme telle.

| Domaine | Sources officielles attendues |
|---|---|
| Surveillance de système de fichiers Windows | Documentation Microsoft de `ReadDirectoryChangesW` / `ReadDirectoryChangesExW`, `FILE_NOTIFY_INFORMATION`, comportement en cas de débordement de tampon |
| Identité de fichier | Documentation Microsoft de `GetFileInformationByHandleEx`, `FILE_ID_INFO`, numéro de série de volume, journal USN |
| Fichiers infonuagiques | Documentation Microsoft des espaces réservés (« placeholders »), `FILE_ATTRIBUTE_RECALL_ON_DATA_ACCESS`, `FILE_ATTRIBUTE_OFFLINE` |
| Points de réanalyse et chemins | Documentation Microsoft des points de réanalyse, jonctions, liens symboliques, limites de longueur de chemin et chemins longs |
| Stockage local | Documentation officielle SQLite : WAL, FTS5, `pragma user_version`, API de sauvegarde, limites |
| Conteneur applicatif | Documentation officielle Tauri 2 : sécurité, capacités, dépendance à WebView2 |
| Rendu | Spécifications officielles SVG et WebGL, documentation Canvas 2D de référence, documentation officielle de toute bibliothèque de rendu envisagée |
| Accessibilité | WCAG et pratiques d'auteur ARIA, publications officielles du W3C |
| Langage et bibliothèques | Documentation officielle Rust et documentation officielle des bibliothèques réellement envisagées, avec leur licence |

Chaque source alimente au moins une décision. Une décision sans source
officielle est déclarée **incertaine** et son risque est écrit.

## 9. Décisions à comparer

Six fiches, gabarit de [docs/decisions/README.md](../decisions/README.md),
toutes créées au statut **`PROPOSED`**, chacune avec au minimum deux options
réellement examinées, leurs avantages, leurs inconvénients et le motif du
classement.

| Fiche | Question tranchée plus tard par Sébastien | Options minimales à comparer |
|---|---|---|
| `DEC-0007` — Pile de reconstruction | Conserver ou faire évoluer Tauri 2 / Rust / React / TypeScript / SQLite | Conserver intégralement; conserver le cœur et faire évoluer l'interface; faire évoluer le conteneur ou le stockage |
| `DEC-0008` — Rendu hiérarchique | Comment dessiner une carte en blocs hiérarchiques | HTML/SVG; Canvas 2D; WebGL, seulement si justifié par la volumétrie |
| `DEC-0009` — Modèle de données et relations | Cerveaux, nœuds, identifiants stables, relations, préférences, vu/non vu, changements, versions | Au moins deux stratégies d'identifiant stable et deux modèles de relations avec provenance |
| `DEC-0010` — Indexation et surveillance | Indexation incrémentale non destructive et surveillance Windows robuste | Au moins deux stratégies de réconciliation après perte d'événements |
| `DEC-0011` — Isolation des cerveaux et migrations | Isolation réelle, migrations, sauvegarde, intégrité, retour arrière | Au moins deux stratégies de stockage par cerveau et deux stratégies de migration |
| `DEC-0012` — Limite architecturale de l'IA | Où s'arrête le MVP structurel et où commence le facultatif | Au moins deux frontières possibles, avec leurs conséquences sur le couplage |

`DEC-0007` doit expliciter le rapport aux fiches vérifiées `DEC-0003`,
`DEC-0004` et `DEC-0005` : ce qui est reconduit, ce qui est révisé, ce qui
devient caduc. Aucune de ces trois fiches n'est modifiée par `TASK-0011`.

## 10. Tests et preuves

`TASK-0011` est une tâche **documentaire**. Elle ne produit aucune preuve
d'exécution du logiciel. Les contrôles suivants sont exigés, et leurs résultats
réels sont consignés :

| Contrôle | Attendu |
|---|---|
| Couverture fonctionnelle | 39 lignes, `F-001` à `F-039`, aucune manquante, aucune dupliquée |
| Classification | Chaque fonction porte `MVP`, `ULTÉRIEUR` ou `DIFFÉRÉ`, sans autre valeur |
| Vocabulaire d'états | Seuls les huit états permis apparaissent dans les fiches créées |
| Statut des décisions | `DEC-0007` à `DEC-0012` sont toutes `PROPOSED` |
| Liens Markdown locaux | Tous contrôlés, aucun cassé |
| Action unique | `docs/ai/NEXT_ACTION.md` contient exactement une action |
| Tâches `IN_PROGRESS` | 0 à la clôture |
| Recherche de données sensibles | Aucun chemin personnel, secret, jeton ni donnée réelle |
| Portée du diff | Aucun fichier hors de la liste de la section 5 |
| Code, dépendances, `graph/` | 0 fichier modifié |
| `git diff --check` | Réussi |
| Sources officielles | Chaque décision cite au moins une source primaire datée |

**Non testé, à déclarer explicitement :** aucun test automatisé, aucun build,
aucune installation, aucun test manuel d'interface, aucun essai physique
Windows, aucune mesure de performance réelle. Les objectifs de la section 7.1,
point 12, sont des cibles à falsifier plus tard, jamais des résultats.

## 11. Critères d'acceptation

1. Les sept livrables `L1` à `L7` existent et se recoupent sans contradiction
   trompeuse.
2. Les 39 fonctions sont classées sans exception, avec motif, dépendance et
   critère mesurable.
3. Le parcours utilisateur va de la sélection d'une racine à une carte
   construite automatiquement, sans étape de configuration manuelle de la
   carte.
4. Les seize points de la section 7.1 sont traités, chacun repérable dans un
   livrable nommé.
5. Chaque décision compare au moins deux options réelles et cite au moins une
   source officielle datée.
6. `DEC-0007` à `DEC-0012` sont toutes `PROPOSED`; aucune n'est présentée comme
   arrêtée.
7. `DEC-0001` à `DEC-0006` sont inchangées.
8. Aucun code, test, dépendance, fichier généré, `graph/`, tag, release ni
   historique n'est modifié.
9. Les objectifs de performance sont mesurables, reproductibles et marqués
   « non testé ».
10. Aucune donnée réelle, aucun chemin personnel, aucun secret, aucune
    référence à l'interface privée.
11. Les validations de la section 10 sont exécutées et leurs résultats réels
    sont rapportés, échecs compris.
12. `NEXT_ACTION.md` contient exactement une action et aucune tâche n'est
    `IN_PROGRESS` à la clôture.
13. La tâche termine à `IMPLEMENTED`. L'exécuteur ne s'attribue jamais
    `VERIFIED`.

## 12. Conditions d'arrêt

L'exécution s'arrête immédiatement, sans modification supplémentaire, et
rapporte l'état exact si :

- une vérification Git préalable échoue : racine, branche, HEAD, arbre propre,
  amont, ou `main` déplacée;
- une tâche est déjà `IN_PROGRESS`;
- un livrable exigerait d'écrire du code, d'ajouter une dépendance ou
  d'exécuter le logiciel pour être honnête;
- une décision exigerait un engagement externe, une dépense, un achat, une
  réservation ou une publication;
- une information ne serait accessible que par l'interface privée de
  référence, ou par une donnée réelle;
- le périmètre devrait s'élargir au-delà de la section 5;
- une source officielle contredit une hypothèse structurelle du projet — le
  constat est écrit et la décision correspondante est marquée `BLOCKED` au lieu
  d'être forcée;
- l'exécuteur ne peut pas produire une preuve pour une affirmation exigée.

Dans tous ces cas : ne rien supprimer, ne rien forcer, ne rien pousser, et
attendre Sébastien.

## 13. Format du rapport final attendu

À la clôture, l'exécuteur fournit exactement :

1. résultat, en une phrase;
2. branche, ancien et nouveau SHA, et le message de commit employé;
3. liste complète des fichiers créés et modifiés;
4. résumé de la baseline : nombre de fonctions `MVP`, `ULTÉRIEUR`, `DIFFÉRÉ`,
   et les décisions proposées;
5. validations exécutées de la section 10, avec leurs **résultats réels**,
   échecs inclus;
6. ce qui est **non testé** et les limites assumées;
7. état exact de `TASK-0011` — attendu : `IMPLEMENTED`;
8. état Git final;
9. confirmation qu'aucune action distante ou destructive n'a été faite au-delà
   du push autorisé;
10. confirmation qu'aucun accès privé n'a eu lieu;
11. l'action unique suivante.

Puis l'exécuteur s'arrête et attend l'examen humain.

## 14. Portes d'approbation de Sébastien

| Porte | Objet | État |
|---|---|---|
| P1 | Approuver cette fiche : `TASK-0011` passe de `PROPOSED` à `APPROVED` | **Franchie le 2026-08-31** |
| P2 | Approuver la baseline livrée et les six décisions `PROPOSED` | **Ouverte, non franchie** |
| P3 | Autoriser la tâche d'implémentation qui suivra, avec périmètre écrit | Ultérieure |
| P4 | GO explicite pour toute publication, écriture distante, dépense ou opération destructive | Permanente |

Aucune ligne de code ne peut être écrite avant `P2` **et** `P3`. Les décisions
produites restent `PROPOSED` jusqu'à `P2`; leur passage à un autre état
appartient à Sébastien.

## 15. Historique de l'état

- 2026-08-31 — `PROPOSED` : fiche rédigée sous `ACTION-0016`, soumise à
  Sébastien. Aucune exécution, aucun code, aucune décision arrêtée.
- 2026-08-31 — `APPROVED` : GO explicite de Sébastien, porte P1 franchie.
- 2026-08-31 — `IN_PROGRESS` : exécution documentaire démarrée après
  vérifications Git préalables réussies.
- 2026-08-31 — `IMPLEMENTED` : les sept livrables `L1` à `L7` sont produits et
  les validations de la section 10 exécutées. **L'exécuteur ne s'attribue pas
  `VERIFIED`**; la vérification indépendante appartient à Sébastien (porte P2).

## 16. Rapport d'exécution — 2026-08-31

### 16.1 Résultat

La baseline fonctionnelle et d'architecture est livrée : 39 fonctions
classées, parcours utilisateur, synthèse d'architecture, matrice de formats,
objectifs mesurables, plan de tests et six décisions toutes `PROPOSED`, sans
qu'une seule ligne de code, de test ou de dépendance soit modifiée.

### 16.2 Vérifications Git préalables

Racine du dépôt conforme; branche `rebuild/v0.2-project-brain`; HEAD au
démarrage `01e6860fbbe68b98da8a28bec7b65ba796090cf1`; arbre propre; SHA local
égal au SHA distant; `main` à `91bbe90f0f99026c28cd345784d4f579a0016db2` en
local et sur origin; aucune tâche `IN_PROGRESS`. Toutes réussies. Aucune
condition d'arrêt de la section 12 n'a été rencontrée.

### 16.3 Couverture des seize points de la section 7.1

| Point | Traité dans |
|---|---|
| 1 — Baseline des 39 fonctions | `L1` §3 |
| 2 — Parcours utilisateur | `L2` §2 et §3 |
| 3 — Pile technologique | `DEC-0007` |
| 4 — Rendu hiérarchique | `DEC-0008` |
| 5 — Modèle de données | `L3` §3, `DEC-0009` |
| 6 — Indexation | `L3` §4, `DEC-0010` |
| 7 — Surveillance Windows | `L3` §5, `DEC-0010` |
| 8 — Exclusions et fichiers infonuagiques | `L3` §6, `L4` §2 |
| 9 — Relations | `L3` §7, `DEC-0009` |
| 10 — Cerveaux multiples isolés | `L3` §8, `DEC-0011` |
| 11 — Accessibilité et langues | `L1` F-035 et F-036, `L2` §4; niveau visé **WCAG 2.2 AA** |
| 12 — Objectifs mesurables | `L5` §3, tous « non testé » |
| 13 — Matrice de formats | `L4` §3 |
| 14 — Limite architecturale de l'IA | `DEC-0012` |
| 15 — Migrations, sauvegarde, intégrité, retour arrière | `L3` §9, `DEC-0011` |
| 16 — Plan de tests | `L6` §2 à §8 |

### 16.4 Validations de la section 10

Douze contrôles exécutés : **onze réussis**, **un partiellement réussi**. Les
résultats réels, chiffres compris, sont consignés en section L de
[VALIDATION.md](../ai/VALIDATION.md). Le contrôle partiellement réussi est
« sources officielles » : `DEC-0012` ne cite aucune source primaire externe,
étant une décision de périmètre de produit; elle est déclarée **incertaine**
avec son risque écrit, conformément à la section 8 de cette fiche.

### 16.5 Non testé et limites

Aucun test automatisé, build, installation, test manuel d'interface, essai
physique Windows ni mesure de performance réelle. Les tests existants du
prototype n'ont pas été rejoués. Les constats sur le prototype proviennent
d'une lecture statique au commit `01e6860f`.

Trois lacunes de recherche sont déclarées et non comblées : les spécifications
WebGL de Khronos ont renvoyé HTTP 403 et n'ont pas pu être consultées; le
journal USN n'a pas été instruit sur source primaire; l'ambiguïté de valeur
entre `FILE_ATTRIBUTE_RECALL_ON_OPEN` et `FILE_ATTRIBUTE_EA` reste non
tranchée.

### 16.6 Points appelant l'attention de Sébastien

1. La tension entre `DEC-0003` (Rust stable) et `DEC-0004` (identité de
   fichier Windows), exposée par `DEC-0009` : sur le canal stable, la clé
   stable préférée n'est pas accessible par la bibliothèque standard.
2. L'absence de repli Canvas 2D dans PixiJS 8, exposée par `DEC-0008` : sans
   WebGL utilisable, il n'y aurait aucune carte.
3. Le placement des relations transversales déterministes dans `DEC-0012`,
   signalé comme la frontière la moins nette de cette fiche.

### 16.7 État final

`TASK-0011` est `IMPLEMENTED`. `DEC-0007` à `DEC-0012` sont toutes
`PROPOSED`. `DEC-0001` à `DEC-0006` sont inchangées. Aucune tâche n'est
`IN_PROGRESS`. Action unique suivante : `ACTION-0018`, examen humain de la
baseline et des six décisions par Sébastien.
