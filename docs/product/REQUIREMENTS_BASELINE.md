# REQUIREMENTS_BASELINE — Baseline fonctionnelle de reconstruction

- **Date :** 2026-08-31
- **Tâche :** `TASK-0011`, sous le GO de Sébastien du 2026-08-31
- **Statut du document :** livrable `L1`, soumis à l'examen humain (porte P2)
- **Portée couverte :** points 1 et 11 de `TASK-0011` §7.1
- **Nature :** arbitrage écrit du périmètre. Aucune ligne de code n'est écrite,
  aucune mesure n'est exécutée, aucun test n'est rejoué. **Non testé.**

Ce document classe les 39 fonctions de la
[matrice fonctionnelle](FEATURE_MATRIX.md) et fixe, pour chacune, un critère
d'acceptation mesurable. Il ne remplace pas la matrice : celle-ci conserve les
constats d'audit et les preuves de code; celui-ci ajoute la **coupe de MVP**
qui manquait.

---

## 1. Définitions employées

| Classification | Sens exact |
|---|---|
| `MVP` | Doit exister et satisfaire son critère pour qu'une première version reconstruite soit **utile et honnête**. Son absence rend le produit trompeur ou inutilisable. |
| `ULTÉRIEUR` | Prévu dans la reconstruction, mais après le MVP. Son absence dégrade le confort, pas la véracité du produit. |
| `DIFFÉRÉ` | Hors du MVP structurel. Facultatif, conditionné à un besoin mesuré et à une décision humaine séparée. |

**Fait.** La règle de coupe dérive du paragraphe « MVP de reconstruction » de
[PROJECT_VISION.md](../../PROJECT_VISION.md) : « un index de métadonnées fiable
et reconstructible, une persistance versionnée, une carte hiérarchique en
blocs, la navigation et les détails essentiels, puis une surveillance
incrémentale robuste ».

**Inférence.** La coupe est donc **conservatrice sur la chaîne structurelle**
(racine → index → carte → navigation → surveillance) : rien n'y est retiré,
parce qu'un maillon manquant y rend les autres mensongers. Elle est
**agressive au-dessus** : relations transversales, personnalisation,
enrichissement, extraction et IA sortent du MVP.

**Incertitude.** Cette coupe est un jugement de projet, pas un résultat
mesuré. Elle est falsifiable par la phase de développement : si un critère
d'acceptation `MVP` s'avère impossible à tenir, la fonction redescend par une
décision écrite, jamais par omission silencieuse.

## 2. Répartition obtenue

| Classification | Nombre | Fonctions |
|---|---:|---|
| `MVP` | 29 | F-001 à F-012, F-014 à F-016, F-020, F-022, F-023, F-025 à F-032, F-034 à F-036 |
| `ULTÉRIEUR` | 6 | F-013, F-017, F-018, F-019, F-024, F-033 |
| `DIFFÉRÉ` | 4 | F-021, F-037, F-038, F-039 |
| **Total** | **39** | `F-001` à `F-039`, sans trou ni doublon |

## 3. Baseline des 39 fonctions

Colonne « Écart » : justification obligatoire lorsque la classification
s'écarte de la colonne « Priorité » de la matrice fonctionnelle. Un `P0`
classé `MVP`, un `P2`/`P3` classé `DIFFÉRÉ` et un `P1` classé `ULTÉRIEUR` sont
des correspondances attendues et ne constituent pas un écart.

| # | Fonction | Classification | Motif (une phrase) | Dépendance amont | Critère d'acceptation mesurable | Écart vs Priorité |
|---|---|---|---|---|---|---|
| F-001 | Choix de racine | `MVP` | Sans racine choisie, aucun cerveau n'existe et le produit n'a pas de point d'entrée. | — | Sur trois racines synthétiques (courte, profonde, à noms longs), la sélection crée un cerveau; l'annulation ne crée rien et ne laisse aucun fichier. | — (P0) |
| F-002 | Cerveau indépendant | `MVP` | La vision promet plusieurs cerveaux isolés; un état partagé ferait mentir la promesse dès le deuxième cerveau. | F-001 | Deux cerveaux synthétiques ouverts successivement ne partagent aucune ligne d'index, aucune préférence et aucun état vu/non vu; contrôle par comparaison des fichiers de données. | — (P0) |
| F-003 | Scan hiérarchique | `MVP` | La carte n'a aucune source de vérité sans parcours des dossiers, fichiers, noms et métadonnées. | F-001 | Sur une arborescence synthétique connue, l'ensemble des nœuds indexés égale l'ensemble attendu; empreinte des sources identique avant et après scan. | — (P0) |
| F-004 | Identifiants stables | `MVP` | Sans identité qui survit à un renommage, le journal de changements et l'état vu/non vu deviennent du bruit. | F-003 | Sur un jeu synthétique, renommer et déplacer 50 éléments produit 50 corrélations et 0 paire création/suppression non corrélée; les cas non corrélables sont comptés et déclarés. | — (P0) |
| F-005 | Exclusions | `MVP` | Une politique d'exclusion absente expose l'utilisateur à des parcours interminables et à des points de réanalyse suivis par accident. | F-003 | Chaque exclusion appliquée est listable dans l'interface avec sa règle et son motif; une fixture contenant jonction, lien symbolique et dossier exclu produit exactement les exclusions attendues. | — (P0) |
| F-006 | Index reconstructible | `MVP` | Un index non reconstructible transforme une corruption en perte définitive. | F-003 | Supprimer l'index d'un cerveau synthétique puis relancer produit un index équivalent au précédent (mêmes nœuds, mêmes relations hiérarchiques); l'état non reconstructible restauré est explicitement énuméré. | — (P0) |
| F-007 | Carte en blocs | `MVP` | Le nuage de points artificiel du prototype est précisément ce que la reconstruction doit remplacer. | F-003, F-006 | Sur quatre arbres synthétiques de formes différentes, chaque bloc affiché correspond à un dossier réel et la relation d'inclusion visuelle reproduit la relation parent/enfant de l'index, contrôlée nœud par nœud. | — (P0) |
| F-008 | Adaptation aux arbres | `MVP` | Une disposition qui ne tient que sur un arbre équilibré n'est pas une carte générique. | F-007 | Arbres large (1 dossier, 5 000 enfants), profond (profondeur 40), vide et mixte : aucun bloc de largeur nulle, aucun chevauchement de frères, et le libellé du bloc sélectionné reste lisible. | — (P0) |
| F-009 | Panoramique | `MVP` | Une carte plus grande que l'écran et non déplaçable n'est pas navigable. | F-007 | Déplacement à la souris, au pavé tactile et au clavier; après déplacement, la position du bloc sélectionné dans l'index est inchangée. | **Oui** : P1 → `MVP`, car la navigation est nommée dans le paragraphe MVP de la vision et une carte immobile rend F-007 inutile. |
| F-010 | Zoom | `MVP` | Sans zoom, les niveaux profonds d'un arbre réel sont inatteignables. | F-009 | Zoom borné (facteur minimal et maximal déclarés), centré sur le pointeur ou sur la sélection, accessible au clavier; aucun état de vue hors bornes atteignable. | **Oui** : P1 → `MVP`, même motif que F-009. |
| F-011 | Ajuster à l'écran | `MVP` | Sans recadrage, un utilisateur qui s'est perdu n'a aucun moyen de revenir à une vue utile. | F-010 | Depuis n'importe quel état de vue atteignable, la commande rend la carte complète — ou la sélection — entièrement visible en une action. | **Oui** : P1 → `MVP`, sortie de secours indispensable dès que F-009 et F-010 existent. |
| F-012 | Réinitialiser la vue | `MVP` | Une commande déterministe de retour à l'état initial est le filet de sécurité minimal du parcours. | F-010 | La commande produit exactement la même vue que l'ouverture du cerveau, vérifiée par comparaison des paramètres de vue; elle est atteignable au clavier. | **Oui** : P1 → `MVP`. Le rappel d'une vue *enregistrée* dépend de F-033 et reste hors du critère MVP. |
| F-013 | Panneau latéral | `ULTÉRIEUR` | Masquer le panneau est un gain d'espace, pas une condition de véracité de la carte. | F-023 | Masquer puis afficher conserve la sélection, le défilement et les filtres; l'état survit au redémarrage. | — (P1) |
| F-014 | Légende | `MVP` | Un codage couleur non expliqué contrevient au critère WCAG 1.4.1 et rend la carte indéchiffrable. | F-007 | Chaque couleur ou motif employé sur la carte figure dans la légende avec son sens; la légende est atteignable au clavier et lisible sans distinction de couleur. | **Oui** : P1 → `MVP`, exigence d'accessibilité de niveau A, pas un ornement (voir §5). |
| F-015 | Sélection | `MVP` | Sans sélection, ni le panneau de détails ni l'ouverture Windows n'ont d'objet. | F-007 | Sélection à la souris et au clavier; la carte et la liste sémantique désignent le même nœud à tout instant, contrôlé sur une fixture synthétique. | — (P0) |
| F-016 | Relations hiérarchiques | `MVP` | La hiérarchie est la seule relation que la vision autorise à dériver automatiquement; c'est le contenu même de la carte. | F-007, F-023 | Pour chaque nœud d'une fixture, le parent et les enfants directs affichés égalent ceux de l'index; aucun lien affiché sans contrepartie dans l'arborescence. | — (P0) |
| F-017 | Relations transversales | `ULTÉRIEUR` | Une carte hiérarchique fidèle est déjà utile; les relations transversales exigent un modèle de provenance non nécessaire au premier usage. | F-016 | Chaque relation affichée expose son type et sa provenance (`déterministe`, `approuvée`, `suggérée`); aucune relation sans provenance n'est représentable dans le modèle. | — (P1) |
| F-018 | Mise en évidence | `ULTÉRIEUR` | La mise en évidence sert surtout les relations transversales, elles-mêmes `ULTÉRIEUR`. | F-017 | Les états « accentué » et « atténué » sont distinguables sans recours à la seule couleur et n'altèrent aucun contenu de l'index. | — (P1) |
| F-019 | Relations entrantes/sortantes | `ULTÉRIEUR` | Distinguer les directions n'a de sens qu'une fois les relations transversales existantes. | F-017 | Pour une fixture de relations synthétiques, les comptes entrants et sortants du panneau et de la carte coïncident exactement. | — (P2) |
| F-020 | Recherche nom/chemin | `MVP` | Sur un arbre réel, retrouver un élément sans recherche est impraticable. | F-006 | Sur une fixture de 100 000 nœuds synthétiques, une requête retourne exactement l'ensemble attendu, paginé et borné, et aucun résultat hors du cerveau actif. | — (P0) |
| F-021 | Recherche sujet/rôle | `DIFFÉRÉ` | Elle suppose une couche d'extraction de contenu explicitement hors du MVP structurel. | F-037 | Chaque résultat cite le fichier et l'emplacement extrait; fonctionnement entièrement local. | — (P2) |
| F-022 | Filtres dynamiques | `MVP` | « Tout / Nouveaux / Non vus » est le mécanisme par lequel l'utilisateur consomme le journal de changements. | F-027, F-028 | Les trois filtres de base plus type et disponibilité sont combinables et dérivés de l'index; le total filtré égale le compte issu d'une requête indépendante. Les **facettes dynamiques dérivées des données** restent hors du critère MVP. | — (P1) |
| F-023 | Détails | `MVP` | Sans chemin, dates, parent, enfants et état, la sélection n'apprend rien à l'utilisateur. | F-015 | Pour chaque nœud d'une fixture, les propriétés essentielles affichées égalent celles de l'index; les diagnostics d'accès sont affichés au lieu d'être masqués. | — (P0) |
| F-024 | Copier le chemin | `ULTÉRIEUR` | L'ouverture dans l'Explorateur (F-025) couvre déjà le besoin d'agir sur un élément au MVP. | F-023 | La copie reproduit le chemin réel exact; aucun chemin n'est écrit dans un journal exportable. | — (P1) |
| F-025 | Ouvrir dans Explorateur | `MVP` | C'est la seule action sortante du produit et un critère de succès explicite de la vision. | F-023 | Sur une fixture synthétique Windows, un dossier s'ouvre et un fichier est sélectionné; une cible hors racine ou disparue produit une erreur explicite sans modification de la source. | — (P0) |
| F-026 | Contenu du dossier | `MVP` | Descendre dans un dossier est le geste central d'une carte hiérarchique; sans lui, la carte ne se parcourt pas. | F-016 | La liste affiche exactement les enfants directs du nœud, paginée, et chaque entrée est sélectionnable au clavier. | **Oui** : P1 → `MVP`, parce que F-007 et F-016 ne produisent une navigation qu'accompagnés de ce geste. |
| F-027 | Journal de changements | `MVP` | Sans journal, « Nouveaux », « Non vus » et la surveillance n'ont rien à afficher. | F-004, F-006 | Un scénario synthétique de créations, modifications, déplacements, renommages et suppressions produit exactement les événements attendus, ordonnés et attribués au bon nœud. | — (P0) |
| F-028 | Vu/non vu | `MVP` | Un journal sans marquage vu oblige l'utilisateur à relire indéfiniment les mêmes changements. | F-027 | Marquer un élément, marquer un changement et « tout marquer vu » persistent au redémarrage et n'affectent aucun autre cerveau. | **Oui** : P1 → `MVP`, l'état vu/non vu fait partie de l'isolation des cerveaux exigée par la vision. |
| F-029 | Actualisation manuelle | `MVP` | L'utilisateur doit pouvoir forcer une mise à jour sans attendre la surveillance. | F-031 | L'actualisation produit un résumé des changements et **ne vide jamais** l'index courant avant d'avoir un remplacement valide, vérifié par interruption forcée en cours d'opération. | — (P0) |
| F-030 | Surveillance automatique | `MVP` | La vision promet une carte « maintenue à jour »; sans surveillance, la promesse est fausse. | F-027, F-031 | Rafale de 10 000 événements synthétiques, perte simulée d'événements et reprise après interruption aboutissent tous à un index égal à celui d'un scan complet de référence. | — (P0) |
| F-031 | Mise à jour incrémentale | `MVP` | Le `DELETE` puis réinsertion du prototype rend toute surveillance inutilisable en coût. | F-004 | Le coût d'une mise à jour est proportionnel au nombre de changements, non à la taille de l'index : mesuré sur 1 000, 10 000 et 100 000 nœuds avec 10 changements, l'écart de durée reste sous un facteur déclaré. | — (P0) |
| F-032 | Indisponibilité temporaire | `MVP` | Un lecteur débranché ne doit jamais être interprété comme une suppression massive. | F-030 | Racine rendue inaccessible : l'index et les préférences sont intacts, l'état est signalé, et aucun événement de suppression n'est journalisé. | — (P0) |
| F-033 | Personnalisation | `ULTÉRIEUR` | Nom, couleur et icône améliorent le repérage sans conditionner l'exactitude de la carte. | F-002 | Les valeurs éditées persistent par cerveau au redémarrage et n'apparaissent dans aucun document analysé. | — (P1) |
| F-034 | Plusieurs cerveaux | `MVP` | Le défaut connu du prototype — l'onglet ne charge pas son index — est traité ici comme exigence, pas comme bogue reporté. | F-002 | Basculer d'onglet charge l'index, la carte, les filtres et la vue du cerveau visé; après redémarrage, chaque cerveau retrouve son état, vérifié sur trois cerveaux synthétiques. | — (P0) |
| F-035 | FR/EN | `MVP` | Le bilinguisme persistant existe déjà dans le prototype; le perdre serait une régression visible. | — | Les deux langues couvrent l'intégralité des libellés de l'interface, le choix persiste au redémarrage, et un libellé manquant est détecté par un contrôle automatisé. | **Oui** : P1 → `MVP`, la vision exige FR/EN persistants et le prototype le fournit déjà. |
| F-036 | Accessibilité | `MVP` | Le clavier (WCAG 2.1.1, niveau A) et le non-recours à la seule couleur (1.4.1, niveau A) sont des exigences, pas des ajouts. | F-009, F-014, F-015 | Niveau visé **WCAG 2.2 AA** : parcours complet au clavier sans piège, contraste ≥ 4,5:1 pour le texte, alternative non colorée pour chaque codage, `prefers-reduced-motion` respecté; audit automatisé plus contrôle clavier manuel. | **Oui** : P1 → `MVP`, motif ci-dessus et §5. |
| F-037 | Extraction de contenu | `DIFFÉRÉ` | La vision place l'extraction hors du MVP structurel et la conditionne au consentement. | F-006 | Chaque format déclare sa couche, sa provenance et son traitement d'erreur; l'extraction est désactivée par défaut. | — (P2) |
| F-038 | RAG cité | `DIFFÉRÉ` | Facultatif par décision de vision; sa présence ne doit jamais devenir nécessaire au produit. | F-037 | Réponse fondée sur des sources locales citées; aucun transfert distant sans consentement explicite et révocable. | — (P3) |
| F-039 | GraphRAG | `DIFFÉRÉ` | À n'étudier qu'après un RAG hybride cité et sur besoin mesuré. | F-038 | Gain mesuré et reproductible contre le RAG cité, sur données synthétiques. | — (P3) |

## 4. Contrôle de couverture

**Fait, contrôlé mécaniquement pendant l'exécution** (résultats reportés dans
[VALIDATION.md](../ai/VALIDATION.md), section `TASK-0011`) :

- 39 lignes, identifiants `F-001` à `F-039`, aucun manquant, aucun dupliqué;
- chaque ligne porte exactement une valeur parmi `MVP`, `ULTÉRIEUR`, `DIFFÉRÉ`;
- **9 écarts** avec la colonne « Priorité » de la matrice fonctionnelle sont
  déclarés et justifiés : F-009, F-010, F-011, F-012, F-014, F-026, F-028,
  F-035, F-036. Tous vont de `P1` vers `MVP`; aucun n'abaisse une fonction
  `P0`.

**Inférence.** Ces 9 écarts se concentrent tous dans « la navigation et les
détails essentiels » que la vision place explicitement dans le MVP, plus
l'accessibilité et le bilinguisme, qui sont des exigences de niveau A ou déjà
acquises. Aucun écart n'élargit le MVP vers l'enrichissement ou l'IA.

## 5. Sources officielles citées par ce document

| Source | URL | Consultée le | Sert à |
|---|---|---|---|
| WCAG 2.2, critères 2.1.1 (Clavier, A), 1.4.1 (Utilisation de la couleur, A), 1.4.3 (Contraste minimal, AA), 2.4.7 (Visibilité du focus, AA) | https://www.w3.org/WAI/WCAG22/quickref/ | 2026-08-31 | Niveau visé de F-036 et exigence de F-014 |
| W3C Media Queries Level 5, `prefers-reduced-motion` | https://www.w3.org/TR/mediaqueries-5/#prefers-reduced-motion | 2026-08-31 | Critère de réduction de mouvement de F-036 |
| ARIA Authoring Practices Guide, motif « Tree View » | https://www.w3.org/WAI/ARIA/apg/patterns/treeview/ | 2026-08-31 | Modèle clavier de F-015, F-016 et F-026 |

## 6. Limites de ce livrable

- **Non testé.** Aucun critère d'acceptation de ce document n'a été exécuté.
  Ce sont des cibles à falsifier, pas des résultats.
- La classification est un **arbitrage soumis à Sébastien** : elle n'engage
  rien tant que la porte P2 n'est pas franchie.
- Certains critères délèguent leurs seuils chiffrés à
  [BASELINE_TARGETS.md](../performance/BASELINE_TARGETS.md) (facteur de F-031)
  ou à la phase de développement (bornes de zoom de F-010).
- Un `MVP` impossible à tenir doit être **redescendu par décision écrite**;
  le livrer partiellement en le déclarant fait serait exactement la dérive que
  `TASK-0010` a documentée sur le prototype.

## 7. Documents liés

- [FEATURE_MATRIX.md](FEATURE_MATRIX.md) — constats d'audit et preuves de code
- [USER_JOURNEY.md](USER_JOURNEY.md) — parcours servi par ces fonctions
- [ARCHITECTURE_BASELINE.md](../architecture/ARCHITECTURE_BASELINE.md)
- [FORMAT_MATRIX.md](../architecture/FORMAT_MATRIX.md)
- [BASELINE_TARGETS.md](../performance/BASELINE_TARGETS.md)
- [TEST_STRATEGY.md](../architecture/TEST_STRATEGY.md)
