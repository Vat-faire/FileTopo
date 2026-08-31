# TEST_STRATEGY — Plan de tests de la reconstruction

- **Date :** 2026-08-31
- **Tâche :** `TASK-0011`, livrable `L6`
- **Portée couverte :** point 16 de `TASK-0011` §7.1
- **Statut :** soumis à l'examen humain (porte P2)
- **Nature :** **plan.** Aucun test n'a été écrit ni exécuté pendant
  `TASK-0011`. **Non testé.**

Toutes les données de tests sont **exclusivement synthétiques**. Aucun test ne
pointe vers un dossier utilisateur réel, vers un corpus personnel ni vers une
interface privée de référence.

---

## 1. État réel des tests existants

**Fait, par lecture statique au commit `01e6860f`** (repris de
[BASELINE_ASSESSMENT.md](../archive/v0.1-alpha/BASELINE_ASSESSMENT.md)) :

| Emplacement | Contenu déclaré | Portée |
|---|---|---|
| `src/App.test.tsx`, `src/lib/locale.test.ts` | 36 cas Vitest | Démonstration, filtres, collections affichées, langue |
| `src-tauri/src/*.rs` | 13 tests Rust | Scanner, index, registre, données synthétiques, confinement de chemin |
| `tests/fixtures_synthetic/` | 6 fichiers, 2 dossiers | Fixture de démonstration minimale |

**Fait.** Ces tests **n'ont pas été rejoués** pendant `TASK-0010` ni pendant
`TASK-0011`. Leur réussite au commit de base n'est pas établie par cette
tâche. C'est la première chose que la phase de développement devra constater.

**Inférence.** Leur portée correspond au prototype, pas à la baseline : ils ne
couvrent ni identifiants stables, ni surveillance, ni relations, ni migrations,
ni disposition hiérarchique. Ils ne sont donc **pas une base de couverture**,
seulement un point de départ à conserver ou à remplacer après inspection.

## 2. Les cinq catégories exigées

| Catégorie | Question à laquelle elle répond | Critère qui la rend satisfaisante |
|---|---|---|
| **T1 — Unitaires** | Chaque règle isolée est-elle correcte ? | Toute règle de classification, de corrélation, de disposition et de migration a au moins un cas nominal **et** un cas limite; aucune règle de sûreté (non-suivi, non-écriture, confinement) n'est sans test. |
| **T2 — Intégration** | La chaîne racine → index → carte est-elle exacte ? | Pour chaque jeu synthétique, l'index produit égale l'arbre attendu élément par élément, et l'empreinte des sources est identique avant et après. |
| **T3 — Manuels Windows** | Le produit se comporte-t-il ainsi sur une vraie machine ? | Chaque scénario de la liste §5 est exécuté par une personne, avec son résultat consigné, sur au moins une machine Windows réelle. |
| **T4 — Récupération** | Le produit survit-il aux pannes ? | Chaque scénario de la liste §6 laisse l'index ouvrable ou reconstructible, et les sources intactes, sans exception. |
| **T5 — Performance** | Les cibles sont-elles tenues ? | Chaque cible de [BASELINE_TARGETS.md](../performance/BASELINE_TARGETS.md) est mesurée, rapportée avec ses conditions, et son échec est publié comme échec. |

## 3. T1 — Tests unitaires

| Domaine | Cas nominaux | Cas limites obligatoires |
|---|---|---|
| Classification de nœud | Dossier, fichier | Point de réanalyse, jonction, lien symbolique, entrée ni fichier ni dossier |
| Attributs Windows | Fichier local ordinaire | `FILE_ATTRIBUTE_OFFLINE`, `RECALL_ON_DATA_ACCESS`, `RECALL_ON_OPEN`, et la **collision de valeur** entre `RECALL_ON_OPEN` et `FILE_ATTRIBUTE_EA` signalée dans [ARCHITECTURE_BASELINE.md](ARCHITECTURE_BASELINE.md) §6.3 |
| Chemins | Chemin court ASCII | Longueur > 260, unités UTF-16 non représentables en UTF-8, collision de casse, nom réservé Windows, séparateurs mêlés |
| Exclusions | Règle par défaut | Règle utilisateur qui exclut la racine elle-même; règles contradictoires |
| Clé stable | Renommage, déplacement intra-volume | Déplacement inter-volume, copie puis suppression, identité indisponible, restauration depuis sauvegarde |
| Corrélation de changements | Renommage simple | Renommage en chaîne (A→B, B→C), échange de deux noms, renommage non corrélable |
| Disposition hiérarchique | Arbre équilibré | Arbre vide, dossier vide, un seul enfant, 5 000 enfants, profondeur 40 |
| Journal de changements | Cinq types d'événements | Événements hors ordre, doublons, événement pour un nœud absent de l'index |
| Migrations | Version N → N+1 | Version inconnue future, migration interrompue, base déjà à jour |
| Confinement d'ouverture | Chemin sous la racine | Chemin hors racine, `..`, identifiant inexistant, nœud supprimé entre validation et ouverture |

**Règle de sûreté.** Tout invariant de
[threat-model.md](../security/threat-model.md) §« Invariants à préserver »
doit avoir un test qui **échoue si l'invariant est violé**. Un invariant sans
test négatif n'est pas préservé, il est espéré.

## 4. T2 — Tests d'intégration

| Scénario | Attendu |
|---|---|
| Créer un cerveau sur `SYN-1K` | Index complet, égal à l'arbre attendu; sources inchangées (empreinte avant/après) |
| Créer un cerveau sur `SYN-HOSTILE` | Exclusions et diagnostics exactement ceux attendus; aucun point de réanalyse suivi; aucun cerveau en échec |
| Annuler une indexation à mi-parcours | Index partiel conservé, cerveau « incomplet », reprise possible |
| Reprendre une indexation | Aucun sous-arbre déjà lu n'est reparcouru; l'index final égale celui d'un scan complet |
| Réindexer un cerveau à jour | Zéro changement journalisé; index inchangé; **l'index n'est vidé à aucun instant** (vérifié par interruption forcée) |
| Appliquer 10 changements | Exactement 10 événements journalisés, du bon type, sur le bon nœud |
| Basculer entre trois cerveaux | Chaque bascule charge l'index, la carte et les préférences du cerveau visé (falsifie le défaut connu du prototype) |
| Redémarrer l'application | Chaque cerveau retrouve index, vue, filtres et état vu/non vu |
| Rechercher sur `SYN-100K` | Résultats exacts, paginés, bornés, limités au cerveau actif |
| Deux cerveaux ouverts | Aucune ligne d'index, préférence ni état vu/non vu partagée |

**Contrainte de non-écriture.** Chaque scénario d'intégration calcule une
empreinte de l'arborescence source **avant et après**, et échoue si elle
diffère. C'est le test qui rend l'affirmation « lecture seule » vérifiable
plutôt que déclarative.

## 5. T3 — Tests manuels Windows

Ces tests ne peuvent pas être automatisés de façon crédible; ils sont donc
consignés dans une liste de contrôle exécutée par une personne, avec date,
version de Windows et résultat.

| # | Scénario | Attendu |
|---|---|---|
| M1 | Choisir une racine par le sélecteur natif | Cerveau créé; annulation ne crée rien |
| M2 | Ouvrir un dossier dans l'Explorateur | Le dossier s'ouvre |
| M3 | Ouvrir un fichier dans l'Explorateur | Le fichier est sélectionné, non ouvert par son application |
| M4 | Ouvrir un fichier en ligne seulement | Avertissement d'hydratation affiché **avant** toute action |
| M5 | Débrancher un lecteur amovible pendant l'usage | Cerveau « indisponible »; index intact; aucune suppression journalisée |
| M6 | Rebrancher le lecteur | Réconciliation; retour à « à jour » |
| M7 | Créer, renommer, déplacer, supprimer des fichiers hors de l'application | Événements détectés et journalisés correctement |
| M8 | Créer 10 000 fichiers d'un coup | Rafale absorbée; en cas de perte, cerveau « à vérifier » puis réconcilié |
| M9 | Mettre l'ordinateur en veille puis le réveiller | Cerveau « à vérifier » puis réconcilié |
| M10 | Parcours complet au clavier, sans souris | Toutes les étapes E1 à E8 du [parcours](../product/USER_JOURNEY.md) franchissables |
| M11 | Lecteur d'écran Windows sur la liste sémantique | Nœuds, niveau et état annoncés |
| M12 | Contraste élevé et `prefers-reduced-motion` activés | Interface lisible; aucune animation non essentielle |
| M13 | Machine sans WebGL utilisable | Le produit reste **entièrement utilisable** par la représentation sémantique |
| M14 | Chemin dépassant 260 caractères | Diagnostic nommé, cerveau non mis en échec |
| M15 | Bascule FR ↔ EN | Aucun libellé manquant; choix persistant au redémarrage |

**M13 est un test de rejet.** Si le produit devient inutilisable sans WebGL,
la décision de rendu ([DEC-0008](../decisions/DEC-0008-hierarchical-rendering.md))
est réfutée, quelle que soit sa performance par ailleurs. La spécification
HTML établit que `getContext()` « Returns null if contextId is not supported »
([WHATWG HTML](https://html.spec.whatwg.org/multipage/canvas.html), consultée
le 2026-08-31); le cas n'est donc pas hypothétique.

## 6. T4 — Tests de récupération

| # | Panne simulée | Attendu |
|---|---|---|
| R1 | Arrêt brutal du processus pendant l'indexation | Index ouvrable; cerveau « incomplet »; sources intactes |
| R2 | Arrêt brutal pendant une migration | Copie de sûreté restaurable, ou ancien index conservé et reconstruction proposée; **sources intactes dans tous les cas** |
| R3 | Base corrompue par altération d'octets | Détectée par `integrity_check`; reconstruction proposée; l'état non reconstructible (nom, couleur, vu/non vu) préservé si possible |
| R4 | Disque plein pendant une écriture | Erreur récupérable; ancien index intact |
| R5 | `SQLITE_BUSY` prolongé | Opération abandonnée proprement; aucun index à moitié écrit |
| R6 | Perte d'événements de surveillance forcée | Cerveau « à vérifier »; réconciliation produit un index égal à un scan complet de référence |
| R7 | Racine supprimée entre deux lancements | Cerveau consultable en lecture; avertissement; aucune suppression de fichier |
| R8 | Copie de sûreté impossible (écritures concurrentes permanentes) | Migration **différée**, pas forcée; cerveau ouvert en lecture seule; avertissement |
| R9 | Version de schéma inconnue et plus récente | Refus d'ouvrir en écriture; aucune migration à rebours tentée |
| R10 | Bascule de migration interrompue à chaque étape (base neuve, `.wal`, `.shm`, permutation) | Soit l'ancienne base intacte et ouvrable, soit la nouvelle complète; **jamais un mélange**; aucun `.wal` orphelin réassocié à la mauvaise base |
| R11 | Retour à l'ancienne base après une bascule réussie | Retour effectif tant que l'ancienne base n'est pas supprimée; procédure de retour écrite et exécutée |

**R8 est directement issu d'une source officielle.** L'API de sauvegarde en
ligne redémarre à chaque écriture externe et « if the backup process is
restarted frequently enough it may never run to completion »
([SQLite Online Backup API](https://www.sqlite.org/backup.html), consultée le
2026-08-31). Un plan de tests qui ignorerait ce cas laisserait passer un
blocage documenté par l'éditeur.

### 6.1 Bancs d'essai conditionnant deux décisions

Deux décisions `PROPOSED` ne peuvent pas être approuvées pour implémentation
sans un banc d'essai synthétique préalable. Ces bancs d'essai ne sont pas des
tests de non-régression : ce sont les **preuves manquantes** de ces décisions.
Aucun n'a été exécuté.

| Banc d'essai | Conditionne | Doit démontrer | Statut |
|---|---|---|---|
| **B1 — Bascule de migration sur Windows** | [DEC-0011](../decisions/DEC-0011-brain-isolation-and-migrations.md), option M-C | Bascule sûre; traitement de `.wal` et `.shm`; arrêt brutal (R2, R10); espace disque insuffisant (R4); retour à l'ancienne base (R11) | **non exécuté** |
| **B2 — Plafond de blocs DOM/SVG simultanément visibles** | [DEC-0008](../decisions/DEC-0008-hierarchical-rendering.md), option A | Sur `SYN-100K`, `SYN-DEEP` et `SYN-WIDE` : nombre réel de nœuds DOM construits, images par seconde soutenues, latence de sélection, sous le plafond initial proposé | **non exécuté** |

**Conséquence pour B1.** Si l'un des cinq points de B1 n'est pas démontré,
M-C n'est pas approuvable et **M-B demeure le repli**. **Conséquence pour
B2.** Si A ne tient pas les objectifs de §3.6 de
[BASELINE_TARGETS.md](../performance/BASELINE_TARGETS.md), alors — et seulement
alors — Canvas 2D devient justifiée, mesure jointe.

## 7. T5 — Tests de performance

Chaque cible de [BASELINE_TARGETS.md](../performance/BASELINE_TARGETS.md)
devient un test, avec son protocole. Règles :

1. Le matériel de référence est déclaré **avant** la première mesure.
2. Cinq exécutions minimum; médiane et écart min–max rapportés.
3. Une cible manquée est publiée comme manquée; elle n'est **jamais** ajustée
   après coup pour être atteinte.
4. Le critère de rejet de §3.3 de `BASELINE_TARGETS.md` (rapport entre
   `SYN-100K` et `SYN-1K` à nombre de changements égal) prime sur les valeurs
   absolues, parce qu'il ne dépend pas du matériel.
5. Aucun chiffre ne sort de `docs/performance/` avant d'être mesuré.

## 8. Ce qui rend chaque catégorie satisfaisante

| Catégorie | Satisfaisante quand |
|---|---|
| T1 | Chaque invariant de sûreté a un test **négatif** qui échoue si l'invariant est violé, et chaque cas limite de §3 est couvert. |
| T2 | Tous les scénarios de §4 passent, **et** l'empreinte des sources est identique avant et après dans chacun. |
| T3 | Les 15 scénarios de §5 sont exécutés et consignés sur au moins une machine Windows réelle, M13 inclus. |
| T4 | Les 11 scénarios de §6 laissent l'index ouvrable ou reconstructible et les sources intactes, sans exception, **et** les deux bancs d'essai de §6.1 ont été exécutés et publiés avant que les décisions qu'ils conditionnent changent d'état. |
| T5 | Chaque cible de `BASELINE_TARGETS.md` a un fichier `PERF-XXXX` correspondant, réussite ou échec. |

**Aucune catégorie ne compense une autre.** Une couverture unitaire élevée ne
remplace pas M13; une performance atteinte ne remplace pas R2.

## 9. Ce qui est interdit dans les tests

1. Pointer vers un dossier utilisateur réel, un lecteur réseau personnel ou
   une interface privée de référence.
2. Committer un chemin local personnel, un secret ou un jeton.
3. Écrire dans une arborescence de test après le calcul de son empreinte de
   référence, hors du scénario qui l'exige explicitement.
4. Déclarer réussi un test non exécuté.
5. Extrapoler un résultat d'un jeu synthétique à un autre.
6. Utiliser une mesure de `phase-3-measurements.md` ou
   `phase-4-mvp-measurements.md` comme preuve d'une cible de la baseline :
   elles mesurent un pipeline en mémoire, pas les grandeurs visées.

## 10. Sources officielles citées

| Source | URL | Consultée le | Sert à |
|---|---|---|---|
| WHATWG HTML — Canvas | https://html.spec.whatwg.org/multipage/canvas.html | 2026-08-31 | M13 |
| SQLite — Online Backup API | https://www.sqlite.org/backup.html | 2026-08-31 | R8 |
| SQLite — PRAGMA `integrity_check`, `quick_check` | https://www.sqlite.org/pragma.html#pragma_user_version | 2026-08-31 | R3 |
| WCAG 2.2 | https://www.w3.org/WAI/WCAG22/quickref/ | 2026-08-31 | M10 à M12 |
| ARIA Authoring Practices — Tree View | https://www.w3.org/WAI/ARIA/apg/patterns/treeview/ | 2026-08-31 | M11 |

## 11. Limites

- **Non testé.** Aucun test de ce plan n'existe ni n'a été exécuté.
- Les tests existants du prototype **n'ont pas été rejoués**; leur état de
  réussite au commit `01e6860f` est inconnu de cette tâche.
- Aucun outil n'est choisi : ni cadre de test, ni pilote d'interface, ni
  bibliothèque d'audit d'accessibilité. Ce choix appartient à la tâche de
  développement, après GO.
- La simulation de certaines pannes (R3, R4, R5) demandera des mécanismes
  qui n'existent pas encore; leur faisabilité n'est pas établie.
- Le nombre de machines Windows disponibles pour T3 n'est pas connu; « au
  moins une » est un plancher, pas une couverture représentative.
