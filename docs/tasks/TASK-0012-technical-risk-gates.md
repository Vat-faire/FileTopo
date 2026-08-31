# TASK-0012 — Bancs d'essai de levée des risques techniques

- **Identifiant :** `TASK-0012`
- **Titre :** Exécuter des bancs d'essai synthétiques permettant de lever les
  risques techniques avant le premier code de production
- **Statut :** `PROPOSED`
- **Phase :** 1 bis — porte technique entre la baseline approuvée et la
  phase 2 de [ROADMAP.md](../../ROADMAP.md)
- **Proposée le :** 2026-08-31
- **Rédacteur de la fiche :** Claude Code, sous le GO P2 de Sébastien du
  2026-08-31
- **Exécuteur prévu :** non assigné; tout agent capable, **après un GO P3
  séparé**
- **Effort recommandé :** une à trois sessions d'expérimentation. Aucun code de
  production, aucune fonctionnalité.
- **GO humain :** **non acquis.** Cette fiche est soumise à l'examen de
  Sébastien. **Rien ne peut être exécuté avant la porte P3.**

> Cette fiche **spécifie** cinq bancs d'essai. Elle ne les exécute pas. Toute
> case « Résultat », « Mesure » ou « Verdict » reste vide tant que la porte P3
> n'a pas été franchie. **Aucun chiffre de cette fiche n'est un résultat.**

---

## 1. Objectif unique

Exécuter des bancs d'essai synthétiques permettant de **lever les risques
techniques avant le premier code de production**.

Cet objectif est unique et volontairement étroit. `TASK-0012` ne construit
aucune fonctionnalité, ne corrige aucun défaut et ne fait progresser aucune
fonction de [REQUIREMENTS_BASELINE.md](../product/REQUIREMENTS_BASELINE.md).
Elle produit des **preuves** — ou des réfutations — pour les hypothèses sur
lesquelles la baseline approuvée repose.

## 2. Contexte et problème réel

La porte **P2** a été franchie le 2026-08-31 :
[TASK-0011](TASK-0011-functional-architecture-baseline.md) est `VERIFIED` et
les six décisions [DEC-0007](../decisions/DEC-0007-rebuild-tech-stack.md) à
[DEC-0012](../decisions/DEC-0012-ai-architectural-boundary.md) sont
`APPROVED`.

Cette approbation fixe une **direction**. Elle ne fournit **aucune preuve
exécutée**. Quatre risques techniques restent entiers, et chacun peut invalider
du code déjà écrit s'il n'est pas levé d'abord :

1. **L'état réel du prototype est inconnu.** Les 36 cas Vitest et les 13 tests
   Rust déclarés n'ont pas été rejoués depuis `TASK-0010`. Personne ne sait si
   le dépôt se construit aujourd'hui.
2. **La migration `M-C` de `DEC-0011` est une hypothèse.** La bascule atomique
   sur Windows, le traitement de `.wal` et `.shm`, l'arrêt brutal et le disque
   plein n'ont jamais été observés.
3. **Le rendu HTML/SVG de `DEC-0008` est une hypothèse.** Le plafond de 3 000
   blocs DOM/SVG proposé par `DEC-0008` est explicitement « à falsifier » et
   **n'est pas une capacité déclarée**.
4. **L'identité Windows de `DEC-0009` n'est pas atteignable sur Rust stable
   par la bibliothèque standard.** `volume_serial_number()` et `file_index()`
   sont `nightly-only`. Une dépendance devient probablement nécessaire; son
   nom, sa version, sa licence et son coût sont inconnus.

S'y ajoute une ambiguïté déclarée mais non levée : le comportement des
**attributs Windows infonuagiques** vis-à-vis de la lecture et de l'identité.

Écrire du code de production avant de lever ces quatre risques revient à parier
que la baseline a raison. `TASK-0012` remplace le pari par des mesures.

## 3. Périmètre

**Dans le périmètre :**

- écriture et exécution de **spikes** jetables, isolés du code de production;
- génération de **jeux de données entièrement synthétiques**;
- exécution des tests et builds **déjà présents** dans le dépôt, sans les
  modifier;
- recherche de sources **officielles Microsoft** pour `B4`;
- consignation de résultats réels, réussites comme échecs.

**Hors périmètre, sans exception :**

- toute modification du code de production (`src/`, `src-tauri/src/`, `tests/`,
  `public/`, `scripts/`, `.github/`);
- toute correction d'un échec constaté par `B0`;
- toute implémentation d'une fonction de la baseline;
- toute donnée utilisateur réelle;
- toute fusion, publication, release, étiquette ou PR;
- toute modification de `graph/`;
- toute modification d'une fiche `DEC` (les verdicts de `B1` et `B2`
  **alimentent** une décision ultérieure, ils ne la prennent pas).

## 4. Branche dédiée

L'exécution se fait sur une **branche future dédiée**, créée depuis la pointe
de `rebuild/v0.2-project-brain` au moment du GO P3 :

    spike/v0.2-technical-risk-gates

Cette branche est **jetable**. Elle n'est **jamais fusionnée automatiquement**.
Aucune fusion, aucun rebase et aucune PR ne sont autorisés par cette fiche.
La décision de conserver, de fusionner ou de supprimer la branche appartient à
Sébastien, après lecture du rapport.

`main` n'est jamais touchée. Aucun `force push`, aucun `reset` destructif,
aucun `clean`, aucune réécriture d'historique.

## 5. Fichiers autorisés

### 5.1 Créations autorisées

| Chemin | Contenu |
|---|---|
| `spikes/README.md` | Rôle du répertoire, règle de non-production, règle de données synthétiques |
| `spikes/b1-sqlite-migration/` | Spike de bascule de migration Windows |
| `spikes/b2-svg-rendering/` | Spike de rendu HTML/SVG isolé |
| `spikes/b3-windows-identity/` | Spike d'identité Windows en Rust stable |
| `spikes/b4-cloud-attributes/` | Fixture ou simulation d'attributs infonuagiques |
| `spikes/fixtures/` | Générateurs de données **synthétiques** uniquement |
| `docs/performance/PERF-0001-b2-rendering.md` | Mesures réelles de `B2` |
| `docs/research/TASK-0012-risk-gate-results.md` | Résultats, verdicts et preuves de `B0` à `B4` |

### 5.2 Modifications autorisées

Uniquement la mémoire obligatoire, et seulement à la fin de l'exécution :
[CURRENT_STATE.md](../ai/CURRENT_STATE.md),
[NEXT_ACTION.md](../ai/NEXT_ACTION.md), [HANDOFF.md](../ai/HANDOFF.md),
[VALIDATION.md](../ai/VALIDATION.md),
[CHANGELOG_AI.md](../ai/CHANGELOG_AI.md), plus la section « rapport
d'exécution » de **cette** fiche.

### 5.3 Répertoire isolé des spikes

`spikes/` est **isolé par construction** :

1. aucun fichier de `src/`, `src-tauri/`, `tests/`, `public/`, `scripts/`,
   `.github/` ni `graph/` n'est créé, modifié ou supprimé;
2. aucun fichier de `spikes/` n'est importé, référencé ou compilé par le code
   de production;
3. `spikes/` ne partage **aucun** manifeste de dépendances avec la racine :
   chaque spike porte le sien, isolé;
4. tout ce que `spikes/` écrit sur le disque reste **sous `spikes/`** ou sous
   un répertoire temporaire créé par le spike lui-même, jamais dans une racine
   analysée.

### 5.4 Interdits absolus

Aucune écriture, lecture ou listage hors du dépôt public. Aucun accès à
l'interface privée de référence. Aucun chemin local personnel, aucun secret,
aucune donnée réelle dans un fichier commité.

## 6. Dépendances

Aucune dépendance n'est autorisée **par défaut**. Une dépendance ne peut être
ajoutée à un spike qu'après avoir satisfait, **dans cet ordre**, les cinq
points suivants, consignés par écrit avant l'installation :

| # | Exigence |
|---|---|
| 1 | Nom exact et version exacte, épinglée |
| 2 | **Licence vérifiée** sur la source officielle du paquet, citée avec sa date de consultation |
| 3 | Compatibilité avec la licence MIT du projet ([DEC-0002](../decisions/DEC-0002-license.md)) |
| 4 | Justification en une phrase : quel banc d'essai serait impossible sans elle |
| 5 | Confinement : la dépendance vit dans `spikes/`, **jamais** dans `package.json` ni `src-tauri/Cargo.toml` de la racine |

**Aucune dépendance n'est ajoutée au code de production par cette tâche**, y
compris la dépendance d'API Windows envisagée par `DEC-0007` et `DEC-0009`.
`B3` en établit la candidature; il ne l'adopte pas.

Si une dépendance ne peut pas satisfaire ces cinq points, le banc d'essai
concerné est déclaré **bloqué** et rapporté comme tel, jamais contourné.

---

## 7. B0 — Santé du prototype

### 7.1 Ce que B0 doit faire

1. **Installer uniquement les dépendances verrouillées.** `pnpm-lock.yaml` et
   `src-tauri/Cargo.lock` font foi. Aucune mise à jour, aucune résolution
   nouvelle, aucun ajout, aucun retrait. Si l'installation exige de modifier un
   verrou, elle **s'arrête** et le fait est rapporté.
2. **Lancer les tests et builds existants**, tels qu'ils sont, sans les
   modifier : suite Vitest, tests Rust, vérification de types, construction du
   frontal, et compilation Rust si elle aboutit sans installation nouvelle.
3. **Consigner les résultats réels** : commande exacte, sortie, code de retour,
   durée, nombre de cas réussis et échoués.
4. **Ne corriger aucun échec.** Un échec est une **donnée**, pas un défaut à
   réparer dans cette tâche. Toute correction exige une **nouvelle
   autorisation** de Sébastien et une tâche distincte.

### 7.2 Critères

| Verdict | Condition |
|---|---|
| **Succès** | Chaque commande a été exécutée et son résultat réel est consigné, **que la commande réussisse ou échoue** |
| **Échec** | Une commande n'a pas pu être lancée, ou son résultat n'a pas été consigné, ou un verrou a été modifié |

B0 ne « réussit » pas parce que les tests passent : il réussit parce que
l'état réel est **connu et écrit**.

### 7.3 Preuves attendues

Journal complet des commandes et de leurs sorties dans
`docs/research/TASK-0012-risk-gate-results.md`, avec le SHA du commit testé,
la version des outils utilisés et la configuration matérielle déclarée.

---

## 8. B1 — Migration SQLite sur Windows

Conditionne **`M-C`** de
[DEC-0011](../decisions/DEC-0011-brain-isolation-and-migrations.md). Décrit
comme scénarios de récupération dans
[TEST_STRATEGY.md](../architecture/TEST_STRATEGY.md) §6 (R2, R4, R10, R11) et
§6.1.

### 8.1 Ce que B1 doit démontrer

1. **Bases entièrement synthétiques.** L'ancienne base **et** la nouvelle sont
   générées par le spike, à partir d'une arborescence synthétique. Aucune base
   d'un cerveau réel, aucun index d'un dossier utilisateur.
2. **Bascule `M-C`.** Lecture de l'ancienne base, écriture d'une base neuve,
   permutation finale. La permutation doit être observée comme **atomique du
   point de vue de l'application** : aucun état intermédiaire ouvrable.
3. **`.wal` et `.shm`.** Les fichiers annexes de l'ancienne et de la nouvelle
   base sont traités correctement à la bascule. **Aucun `.wal` orphelin n'est
   réassocié à la mauvaise base.** Vérification par inspection du disque avant,
   pendant et après.
4. **Arrêt brutal à chaque étape.** Le processus est interrompu à **chacune**
   des étapes de la bascule, une étape à la fois, énumérées avant l'essai.
   Après chaque interruption, l'état doit être **soit** l'ancienne base intacte
   et ouvrable, **soit** la nouvelle complète — jamais un mélange.
5. **Espace disque insuffisant simulé.** La construction de la nouvelle base
   échoue **proprement**, l'ancienne reste intacte et ouvrable, et l'échec est
   signalé. La pénurie est **simulée** — quota, volume virtuel de taille
   bornée, ou injection d'erreur — jamais provoquée sur le disque système.
6. **Retour à l'ancienne base.** Après une bascule, le retour à la base
   précédente est effectivement possible tant qu'elle n'a pas été supprimée, et
   la **procédure de retour est écrite**.
7. **Comparaison avec `M-B`.** La même migration est exécutée en `M-B` — copie
   de sûreté, migration en place, restauration si échec — et les deux
   stratégies sont comparées sur : durée, espace disque transitoire, sûreté
   observée à l'arrêt brutal, et complexité de la procédure de retour.
8. **Aucun fichier utilisateur réel** n'est lu, copié, déplacé, migré ni même
   listé.

### 8.2 Critères

| Verdict | Condition |
|---|---|
| **`M-C` confirmée** | Les six points 2 à 7 sont **observés**, pas supposés, et la comparaison avec `M-B` est publiée |
| **`M-C` réfutée** | **Un seul** des points 2 à 6 n'est pas démontré. `M-B` devient alors la stratégie **obligatoire**, conformément à `DEC-0011` |
| **Échec du banc d'essai** | Le banc d'essai n'a pas pu être exécuté; aucun verdict n'est rendu et aucune stratégie n'est confirmée |

Une réfutation de `M-C` est un **résultat valide**, pas un échec de la tâche.

### 8.3 Preuves attendues

Pour chaque point : commande, état du disque avant/après (liste de fichiers,
tailles, empreintes), sortie de `PRAGMA integrity_check` sur les deux bases,
et journal des interruptions. Cinq exécutions minimum par scénario chronométré;
médiane et écart min–max rapportés.

---

## 9. B2 — Rendu HTML/SVG

Conditionne l'option **A** de
[DEC-0008](../decisions/DEC-0008-hierarchical-rendering.md) et le plafond
proposé de §3.6 de
[BASELINE_TARGETS.md](../performance/BASELINE_TARGETS.md).

### 9.1 Ce que B2 doit faire

1. **Prototype isolé** de carte en blocs, alimenté **exclusivement** par des
   arborescences synthétiques générées sur place. Le prototype vit dans
   `spikes/b2-svg-rendering/` et n'est lié à aucun composant de `src/`.
2. **Virtualisation et niveaux de détail** implémentés : seuls les blocs
   pertinents pour le niveau visible sont construits dans le DOM; le reste est
   agrégé.
3. **Scénarios de volumétrie :** **1 000**, **3 000** et **5 000** blocs
   **simultanément visibles**. Le nombre de nœuds DOM réellement construits est
   compté, pas estimé.
4. **Scénarios de forme :** `SYN-DEEP` — **profondeur 40** — et `SYN-WIDE` —
   une branche de **5 000 enfants** directs.
5. **Interactions mesurées :** déplacement continu, zoom, sélection d'un bloc,
   et ajustement de la vue au contenu.
6. **Mesure réelle** des images par seconde et des latences. Les images par
   seconde sont relevées par l'horloge de rendu du navigateur embarqué, **pas
   estimées**. Trajectoire de déplacement et de zoom **scriptée et identique**
   entre exécutions. Cinq exécutions minimum; médiane et écart min–max.
7. **Clavier et structure ARIA minimale :** navigation au clavier selon le
   motif « Tree View » — flèches, `Home`, `End` — et présence de `role`,
   `aria-expanded`, `aria-selected`, `aria-level`, `aria-setsize`,
   `aria-posinset` sur les nœuds construits. La vérification porte sur la
   **structure produite**, pas sur une revue d'intention.
8. **Aucune réutilisation d'une donnée ou d'un code privé.** Aucune capture,
   aucune structure, aucun nom, aucune métrique provenant de l'interface privée
   de référence. Le prototype est écrit depuis les documents publics du dépôt.

### 9.2 Critères écrits

| Verdict | Condition |
|---|---|
| **HTML/SVG conservé** | À **3 000 blocs visibles**, sur `SYN-DEEP` et `SYN-WIDE` : ≥ **30 ips soutenues** pendant le déplacement continu **et** latence de sélection ≤ **150 ms** au 95<sup>e</sup> centile, avec la navigation clavier fonctionnelle |
| **Étude Canvas 2D autorisée** | L'un des deux seuils ci-dessus est manqué à **3 000 blocs visibles**, **mesure jointe**. L'autorisation porte sur l'**étude**, jamais sur l'adoption |
| **Plafond réel établi** | Le nombre de blocs au-delà duquel les seuils ne tiennent plus est mesuré et publié, qu'il soit supérieur ou inférieur à 3 000 |

Le plafond de 3 000 de `DEC-0008` est une **hypothèse à réfuter**. Le résultat
de `B2` le remplace, quel qu'il soit. Un résultat de 1 000 est aussi
recevable qu'un résultat de 5 000.

### 9.3 Preuves attendues

`docs/performance/PERF-0001-b2-rendering.md` : matériel de référence déclaré
**avant** la première mesure, protocole, nombre de nœuds DOM construits par
scénario, séries d'images par seconde, latences avec centiles, et verdict par
critère. Une cible manquée est **publiée comme manquée**, jamais ajustée après
coup.

---

## 10. B3 — Identité Windows

Conditionne **`I-E`** de
[DEC-0009](../decisions/DEC-0009-data-model-and-relations.md) et la réserve de
`DEC-0007` sur Rust stable.

### 10.1 Ce que B3 doit démontrer

1. **Preuve en Rust stable** que `VolumeSerialNumber` + `FileId` sont
   obtenables — le canal `nightly` est **interdit**. La preuve est un programme
   qui compile et s'exécute sur le canal stable.
2. **Dépendance Windows candidate** : nom exact, **version épinglée**, et
   **licence vérifiée** sur la source officielle du paquet, avec date de
   consultation. Elle reste confinée à `spikes/b3-windows-identity/`.
3. **Renommage et déplacement intra-volume** : l'identité obtenue est-elle
   **identique avant et après** ? Observé sur une arborescence synthétique,
   pour un fichier et pour un dossier.
4. **Comportement inter-volume** : l'identité obtenue sur un volume est-elle
   distincte, absente ou trompeuse sur un autre ? Le comportement est
   **constaté**, pas supposé.
5. **Mesure du coût** sur **1 000**, **10 000** et **100 000** éléments
   synthétiques : durée totale et durée par élément, avec et sans
   l'obtention de l'identité, afin d'isoler son coût propre.
6. **Repli déterministe par chemin** : l'empreinte versionnée du chemin relatif
   est implémentée et vérifiée **reproductible** — même entrée, même sortie,
   entre deux exécutions et entre deux machines si possible.
7. **Aucune heuristique utilisée comme identité.** Le spike ne contient
   **aucun** appariement par ressemblance. Si une suggestion de déplacement est
   esquissée, elle est strictement séparée et ne peut écrire aucune identité.

### 10.2 Critères

| Verdict | Condition |
|---|---|
| **`I-E` confirmée** | Les points 1 à 6 sont observés, **et** le coût mesuré à 100 000 éléments reste compatible avec §3.2 de `BASELINE_TARGETS.md` |
| **`I-E` sous réserve** | L'identité est obtenable mais son coût dégrade la cible d'indexation. La réserve est chiffrée et publiée; l'arbitrage appartient à Sébastien |
| **`I-E` réfutée** | L'identité n'est pas obtenable en Rust stable dans des conditions de licence acceptables. Le repli déterministe par chemin devient alors la **seule** source d'identité, avec son défaut déclaré |

### 10.3 Preuves attendues

Sortie du programme pour chaque scénario, avant/après renommage et
déplacement; tableau de coûts par volumétrie, cinq exécutions, médiane et
écart; fiche de licence de la dépendance candidate avec sa source et sa date.

---

## 11. B4 — Attributs infonuagiques

Lève l'ambiguïté déclarée par `DEC-0004`, `DEC-0009` et
[FORMAT_MATRIX.md](../architecture/FORMAT_MATRIX.md) sur les fichiers gérés
par un fournisseur de synchronisation.

### 11.1 Ce que B4 doit faire

1. **Résoudre l'ambiguïté des attributs Windows uniquement avec des sources
   Microsoft.** Aucune source secondaire, aucun blog, aucun forum, aucune
   réponse d'agent. Chaque affirmation cite une page officielle Microsoft avec
   sa date de consultation. Une question qui reste sans source officielle est
   **déclarée non résolue**, jamais comblée.
2. **Fixture ou simulation synthétique.** Le comportement est vérifié sur une
   fixture construite de toutes pièces, ou sur une simulation des attributs,
   décrite explicitement comme telle.
3. **Aucune lecture de contenu.** Le spike lit des métadonnées et des attributs;
   il n'ouvre le contenu d'aucun fichier.
4. **Aucune hydratation d'un fichier réel.** Aucun espace réservé appartenant à
   un fournisseur de synchronisation installé sur la machine n'est touché,
   ouvert, ni même énuméré d'une manière susceptible de déclencher un
   téléchargement.

### 11.2 Questions à trancher

| # | Question |
|---|---|
| 1 | Quels attributs Windows distinguent un espace réservé d'un fichier présent localement, et quelle est leur définition officielle ? |
| 2 | Quelle opération risque de déclencher une hydratation, et laquelle est sûre ? |
| 3 | L'identité de fichier survit-elle à une hydratation ou à une déshydratation, selon la documentation officielle ? |
| 4 | Quelle règle FileTopo doit-il appliquer pour n'hydrater **jamais** un fichier de l'utilisateur ? |

### 11.3 Critères

| Verdict | Condition |
|---|---|
| **Succès** | Les quatre questions reçoivent une réponse **sourcée Microsoft**, ou sont explicitement déclarées non résolues avec la recherche menée |
| **Échec** | Une réponse repose sur une source non officielle, ou une hydratation réelle a été déclenchée |

Une hydratation réelle déclenchée est un **échec grave** de la tâche : elle
constitue une action sur un fichier de l'utilisateur.

---

## 12. Preuves et mesures réelles

Règles applicables à `B0` à `B4`, sans exception :

1. Toute affirmation cite une **preuve vérifiable** : commande, sortie, fichier
   produit, ou source officielle avec sa date de consultation.
2. Ce qui n'a pas été exécuté est marqué **« non testé »**, explicitement.
3. Les échecs sont rapportés **tels quels**. Une cible manquée est publiée
   comme manquée; elle n'est jamais ajustée après coup pour être atteinte.
4. Le matériel de référence est déclaré **avant** la première mesure.
5. Cinq exécutions minimum pour toute mesure chronométrée; médiane et écart
   min–max rapportés.
6. Aucun chiffre ne sort de `docs/performance/` avant d'avoir été mesuré.
7. Un résultat qui **réfute** une décision approuvée est un résultat valide et
   doit être publié avec la même force qu'une confirmation.

## 13. Conditions d'arrêt immédiat

L'exécution **s'arrête immédiatement**, sans modification supplémentaire, et
le fait est rapporté, si :

1. **un test exigerait une donnée privée** — fichier réel, dossier utilisateur,
   corpus personnel, base d'un cerveau existant, ou tout élément de l'interface
   privée de référence;
2. une action sortirait du dépôt public en lecture, en listage ou en écriture;
3. une dépendance ne peut pas satisfaire les cinq exigences de §6;
4. une opération toucherait le code de production, `graph/`, `main`, ou un
   verrou de dépendances;
5. l'état Git observé diffère de l'état attendu au démarrage;
6. une action risquerait de modifier, d'hydrater ou de déplacer un fichier de
   l'utilisateur;
7. la portée demandée s'élargit au-delà de cette fiche.

Dans chacun de ces cas, l'agent **s'arrête et demande**. Il ne contourne pas.

## 14. Interdictions

- **Aucun changement de code de production.** `src/`, `src-tauri/src/`,
  `tests/`, `public/`, `scripts/`, `.github/` restent intacts.
- **Aucune correction d'un échec de `B0`** sans une nouvelle autorisation
  écrite de Sébastien.
- **Aucune fusion automatique**, aucune PR, aucune release, aucune étiquette,
  aucun `force push`, aucun push vers `main`.
- Aucune modification de `graph/`.
- Aucune modification d'une fiche `DEC-0001` à `DEC-0012`.
- Aucune donnée réelle, aucun secret, aucun chemin local personnel.
- Aucun accès à l'interface privée de référence, sous aucune forme.
- Aucune dépense, aucun achat, aucun service payant.

## 15. Critères d'acceptation de la tâche

`TASK-0012` est acceptable quand **toutes** les conditions suivantes sont
vraies :

| # | Condition |
|---|---|
| 1 | `B0` à `B4` ont été exécutés, ou leur non-exécution est expliquée et rapportée |
| 2 | Chaque banc d'essai a rendu un **verdict écrit** selon ses propres critères |
| 3 | Toutes les données utilisées sont **synthétiques**, sans exception |
| 4 | Aucun fichier de production, de test, de dépendance ni de `graph/` n'a changé |
| 5 | Chaque mesure est accompagnée de son protocole et de son matériel |
| 6 | Les échecs et les réfutations sont publiés sans atténuation |
| 7 | La mémoire obligatoire est à jour et `NEXT_ACTION.md` contient exactement une action |
| 8 | Le rapport final de §17 est complet |

## 16. État final de la tâche

**`TASK-0012` se terminera `IMPLEMENTED`, jamais `VERIFIED`.**

L'exécuteur ne s'attribue pas `VERIFIED` : ce serait juger ses propres preuves.
Le passage à `VERIFIED` appartient à Sébastien, sur contrôle indépendant des
preuves publiées, conformément à [AGENTS.md](../../AGENTS.md).

## 17. Format du rapport final attendu

Le rapport final doit donner, dans cet ordre :

1. **Résultat** — ce qui a été fait, en quelques lignes;
2. **Branche et commits** — `spike/v0.2-technical-risk-gates`, SHA de chaque
   commit;
3. **Fichiers touchés** — liste exhaustive, créations et modifications
   séparées;
4. **Verdicts** — un par banc d'essai, `B0` à `B4`, avec le critère appliqué;
5. **Validations et sorties utiles** — commandes, sorties, mesures;
6. **Non testé et limites** — ce qui n'a pas été exécuté, et pourquoi;
7. **Conséquences pour les décisions approuvées** — ce que `B1` et `B2`
   confirment ou réfutent, **sans modifier aucune fiche `DEC`**;
8. **État exact de la tâche** — `IMPLEMENTED`, jamais `VERIFIED`;
9. **État Git final** — branche, `HEAD`, propreté, SHA local contre distant;
10. **Action unique suivante**;
11. **Confirmation des actions distantes ou destructives** — aucune, ou
    lesquelles et sous quelle autorisation.

## 18. Portes d'approbation

| Porte | Objet | État |
|---|---|---|
| P2 | Approuver la baseline de `TASK-0011` et les six décisions | **Franchie le 2026-08-31** |
| P3 | **Approuver cette fiche et autoriser l'exécution des bancs d'essai** | **Ouverte, non franchie** |
| P4 | Autoriser la première tâche d'implémentation, après lecture des verdicts | Ultérieure |
| P5 | GO explicite pour toute publication, écriture distante, dépense ou opération destructive | Permanente |

**Le GO P3 est obligatoire avant toute exécution.** Aucun spike, aucune
installation, aucune mesure et aucune branche ne peuvent être créés avant lui.
Aucune ligne de code de production ne peut être écrite avant `P4`.

## 19. Historique de l'état

- 2026-08-31 — `PROPOSED` : fiche rédigée après le franchissement de la porte
  P2, soumise à Sébastien. **Aucune exécution, aucun spike, aucune dépendance,
  aucune branche créée.**
