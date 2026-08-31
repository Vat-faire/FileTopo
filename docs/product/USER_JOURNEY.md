# USER_JOURNEY — Parcours de la racine à la carte construite

- **Date :** 2026-08-31
- **Tâche :** `TASK-0011`, livrable `L2`
- **Portée couverte :** point 2 de `TASK-0011` §7.1
- **Statut :** soumis à l'examen humain (porte P2)
- **Nature :** description d'un parcours **cible**. Rien n'a été exécuté ni
  observé dans une interface. **Non testé.**

Ce parcours décrit ce qu'une personne **non technique** vit, de la sélection
d'une racine jusqu'à une carte construite automatiquement. Il ne comporte
**aucune étape de configuration manuelle de la carte** : c'est une contrainte
de conception, pas une simplification de rédaction.

Toutes les arborescences, volumétries et durées citées sont **synthétiques**
ou des **cibles**; aucune n'est un résultat mesuré.

---

## 1. Persona et hypothèses

**Fait (issu de la vision).** L'utilisateur cible est une personne non
technique, sur Windows, sans compte, sans connexion Internet obligatoire et
sans modèle d'IA.

**Inférence.** Elle ne connaît ni les notions d'index, ni de schéma, ni de
surveillance. Le vocabulaire de l'interface doit donc rester celui de ses
dossiers : « votre dossier », « en cours de lecture », « nouveautés ».

**Incertitude.** Aucun utilisateur réel n'a été observé. Ce parcours est une
hypothèse d'ergonomie à falsifier par un test manuel de la phase 8.

## 2. Vue d'ensemble du parcours

```text
E0  Premier lancement, aucun cerveau
     │
E1  Choisir un dossier racine  ──── annulation ──▶ retour E0, rien créé
     │
E2  Confirmation et création du cerveau (nom, couleur par défaut)
     │
E3  Lecture de la structure — la carte apparaît par paliers
     │   ├── annulation ──▶ E3b : index partiel conservé, état « incomplet »
     │   └── erreurs d'accès ──▶ comptées, affichées, jamais bloquantes
     │
E4  Première carte utile (blocs de premier niveau navigables)
     │
E5  Carte complète, cerveau « à jour »
     │
E6  Usage : parcourir, chercher, filtrer, sélectionner, ouvrir
     │
E7  Surveillance en arrière-plan ──▶ « Nouveautés » s'incrémente
     │
E8  Retour : redémarrage, bascule de cerveau, indisponibilité temporaire
```

## 3. Étapes détaillées

### E0 — Premier lancement

| Aspect | Comportement cible |
|---|---|
| Ce que l'utilisateur voit | Un écran d'accueil vide, avec une seule action principale : « Choisir un dossier ». |
| Ce qui n'arrive pas | **Aucune démonstration synthétique n'est chargée à la place d'un vrai cerveau.** Le prototype fait l'inverse (`demo_snapshot` appelé au démarrage, `src/App.tsx:94`); c'est un comportement à supprimer, pas à reproduire. |
| Fonctions | F-001 |

### E1 — Choisir une racine

| Aspect | Comportement cible |
|---|---|
| Geste | Un sélecteur de dossier Windows natif. L'utilisateur ne saisit jamais un chemin au clavier. |
| Annulation | Fermer le sélecteur ramène en E0. **Aucun cerveau, aucun fichier, aucune ligne de journal n'est créé.** |
| Refus explicites | Racine qui est un point de réanalyse, une jonction ou un lien symbolique : refus motivé, avec explication en langage ordinaire et proposition de choisir le dossier cible directement. |
| Cas limite | Racine sur un lecteur amovible : accepté, avec un avertissement que le cerveau sera marqué indisponible quand le lecteur est absent (voir E8). |
| Fonctions | F-001, F-005 |

### E2 — Création du cerveau

| Aspect | Comportement cible |
|---|---|
| Ce que l'utilisateur voit | Un écran de confirmation : le nom du dossier choisi, un nom de cerveau pré-rempli et modifiable, une couleur et une icône par défaut, l'une et l'autre modifiables. Un bouton « Créer ». |
| Ce qu'il ne fait pas | Il ne choisit **ni** disposition, **ni** algorithme, **ni** métrique de carte. La carte n'est pas configurable : elle est dérivée. La personnalisation du cerveau reste **facultative** : les valeurs par défaut sont utilisables telles quelles, sans configuration obligatoire. |
| Effet | Le cerveau est enregistré, son espace de données est créé **dans l'espace applicatif**, jamais dans la racine analysée. |
| Fonctions | F-001, F-002, F-033 (nom, couleur et icône modifiables au `MVP`; valeurs par défaut utilisables sans édition) |

### E3 — Lecture de la structure

C'est l'étape la plus longue et celle où le prototype n'offre rien. Elle doit
donc être décrite précisément.

| Aspect | Comportement cible |
|---|---|
| Progression | Une barre indique le nombre d'éléments lus et le dossier en cours, en **chemin relatif** à la racine. Le total est explicitement présenté comme **estimé**, parce qu'il ne peut pas être connu avant la fin du parcours. |
| Ce que l'utilisateur voit **pendant** | La carte **n'est pas vide et n'est pas une attente**. Les blocs de premier niveau apparaissent dès qu'un dossier est parcouru, puis se subdivisent. L'utilisateur peut déjà sélectionner un bloc et lire ses détails partiels. |
| Marquage de l'incomplétude | Tout bloc dont le sous-arbre n'est pas terminé porte un état visuel **et textuel** « en cours de lecture ». Le nombre d'enfants affiché est marqué « au moins N », jamais un nombre définitif. |
| Annulation | Un bouton « Arrêter » à tout moment. L'index partiel déjà écrit **est conservé**, le cerveau passe à l'état « incomplet » et propose « Reprendre ». Rien n'est effacé. |
| Erreurs | Dossier illisible, fichier verrouillé, chemin disparu pendant le parcours : comptés dans un bandeau « N éléments n'ont pas pu être lus », consultable. Le parcours **continue**. Aucune erreur d'accès n'interrompt le cerveau entier. |
| Fichiers en ligne seulement | Représentés par leurs métadonnées, avec un marquage visuel distinct. **Aucun téléchargement, aucune ouverture, aucune miniature, aucun calcul d'empreinte.** |
| Fonctions | F-003, F-005, F-007, F-008, F-014 |

### E3b — Reprise après arrêt ou interruption

| Aspect | Comportement cible |
|---|---|
| Après un arrêt volontaire | « Reprendre la lecture » repart du point atteint, sans recommencer le sous-arbre déjà lu. |
| Après une fermeture brutale | Au lancement suivant, le cerveau est détecté « incomplet » et la reprise est proposée. **L'index existant n'est jamais vidé pour laisser place à un scan qui n'a pas encore réussi.** |
| Fonctions | F-006, F-029, F-032 |

### E4 — Première carte utile

**Définition retenue.** La « première carte utile » est atteinte quand les
blocs de **premier et deuxième niveau** sous la racine sont placés et
navigables, même si les niveaux inférieurs sont encore en lecture.

**Inférence.** C'est ce seuil, et non la fin de l'indexation, qui doit être
mesuré comme « temps de première carte utile » dans
[BASELINE_TARGETS.md](../performance/BASELINE_TARGETS.md). Mesurer la fin de
l'indexation à sa place surestimerait l'attente perçue.

| Fonctions | F-007, F-008, F-009, F-010, F-015 |

### E5 — Carte complète

| Aspect | Comportement cible |
|---|---|
| Signal | Le cerveau passe à « à jour », avec la date et l'heure du dernier parcours complet, et le nombre d'éléments et d'erreurs. |
| Légende | La légende est complète et explique chaque couleur, motif et marquage effectivement présent sur la carte — jamais un jeu fixe indépendant des données. |
| Fonctions | F-005, F-007, F-014 |

### E6 — Usage courant

| Geste | Ce qui se passe | Fonctions |
|---|---|---|
| Se déplacer, zoomer | Déplacement libre à la souris, au pavé tactile et au clavier; zoom borné. | F-009, F-010 |
| Se retrouver | « Ajuster à l'écran » et « Réinitialiser la vue » sont toujours atteignables, y compris au clavier. | F-011, F-012 |
| Sélectionner | Un bloc sélectionné sur la carte est simultanément sélectionné dans la liste sémantique, et réciproquement. | F-015 |
| Comprendre | Le panneau donne nom, type, chemin réel, taille, dates, état, parent, enfants directs et diagnostics. | F-023, F-016 |
| Descendre | La liste des enfants directs est navigable au clavier; activer un enfant le sélectionne et recentre la carte. | F-026 |
| Chercher | Recherche locale sur nom et chemin, résultats paginés et bornés, limités au cerveau actif. | F-020 |
| Filtrer | « Tout », « Nouveaux », « Non vus », plus type et disponibilité, combinables. | F-022 |
| Agir | « Ouvrir dans l'Explorateur » ouvre le dossier ou sélectionne le fichier, après revalidation du confinement sous la racine. Pour un fichier en ligne seulement, un avertissement d'hydratation possible précède l'action. | F-025 |
| Copier | « Copier le chemin » place le chemin réel exact de l'élément sélectionné dans le presse-papiers, sans l'écrire dans un journal exportable. | F-024 |
| Marquer | Marquer un élément vu, un changement vu, ou tout marquer vu. | F-028 |

**Règle de comportement, reprise de
[REFERENCE_INTERFACE.md](REFERENCE_INTERFACE.md) :** aucune opération de
l'interface ne renomme, ne déplace, ne supprime ni ne réécrit un document.
Une sélection ne crée jamais de relation.

### E7 — Surveillance et nouveautés

| Aspect | Comportement cible |
|---|---|
| En arrière-plan | Les changements sont détectés sans que l'utilisateur relance quoi que ce soit; seuls les éléments touchés sont mis à jour. |
| Ce qu'il voit | Un compteur « Nouveautés » et un journal filtrable : créations, modifications, déplacements, renommages, suppressions. |
| Perte d'événements | Quand le mécanisme de surveillance perd des changements — cas documenté et attendu, voir [DEC-0010](../decisions/DEC-0010-indexing-and-watching.md) — le cerveau affiche « vérification en cours » et se réconcilie par réénumération. **L'utilisateur n'a rien à faire, et rien n'est perdu.** |
| Actualisation manuelle | Toujours disponible, avec un résumé des changements appliqués. Elle **ne vide jamais** l'index avant d'avoir un remplacement valide. |
| Fonctions | F-027, F-028, F-029, F-030, F-031 |

### E8 — Retours et cas dégradés

| Situation | Comportement cible | Fonctions |
|---|---|---|
| Redémarrage de l'application | Chaque cerveau retrouve son index, sa vue, ses filtres et son état vu/non vu. Aucune démonstration ne s'affiche à la place. | F-002, F-034 |
| Bascule d'onglet de cerveau | Charge l'index, la carte et les préférences du cerveau visé. **C'est l'exigence qui corrige le défaut observé du prototype** (`src/App.tsx:314` ne fait que changer l'identifiant actif). | F-034 |
| Lecteur absent ou déconnecté | Le cerveau est marqué « indisponible », son dernier état fiable reste consultable, et **aucun événement de suppression n'est journalisé**. | F-032 |
| Racine supprimée durablement | Le cerveau reste consultable en lecture, avec un avertissement explicite. La suppression du cerveau est une action utilisateur distincte et confirmée; elle ne touche jamais la racine. | F-002, F-032 |
| Index corrompu | Détection au démarrage, proposition de reconstruction depuis les sources, et conservation de l'état non reconstructible (nom, couleur, vu/non vu) quand c'est possible. | F-006 |

## 4. Accessibilité du parcours

**Fait (source W3C, consultée le 2026-08-31).** WCAG 2.2 exige au niveau A que
toute fonctionnalité soit opérable au clavier (2.1.1) et que la couleur ne
soit pas le seul moyen de transmettre une information (1.4.1); au niveau AA,
un contraste minimal de 4,5:1 pour le texte (1.4.3) et un focus visible
(2.4.7).

**Conséquence sur ce parcours.** Chaque étape E1 à E8 doit être franchissable
sans souris. La liste sémantique — arbre ou liste virtuelle — est la
représentation autoritative pour le clavier et les technologies d'assistance;
la carte en est l'exploration visuelle. Le motif clavier suit le patron
« Tree View » de l'ARIA Authoring Practices Guide.

**Incertitude.** Aucun audit d'accessibilité n'a été exécuté. Le niveau
**WCAG 2.2 AA** est une cible déclarée, pas une conformité constatée.

## 5. Ce que le parcours interdit explicitement

1. Charger une démonstration synthétique au démarrage à la place d'un cerveau.
2. Demander à l'utilisateur de configurer la carte, ses métriques ou sa
   disposition.
3. Afficher un écran d'attente vide pendant l'indexation.
4. Présenter un nombre d'enfants ou un total comme définitif tant que le
   sous-arbre est en lecture.
5. Vider un index valide avant d'avoir un remplacement valide.
6. Télécharger un fichier en ligne seulement sans action explicite et
   avertissement.
7. Interpréter une indisponibilité de lecteur comme une suppression.
8. Écrire quoi que ce soit dans la racine analysée.

## 6. Sources officielles citées

| Source | URL | Consultée le | Sert à |
|---|---|---|---|
| WCAG 2.2 (critères 1.4.1, 1.4.3, 2.1.1, 2.1.2, 2.4.7) | https://www.w3.org/WAI/WCAG22/quickref/ | 2026-08-31 | §4 |
| ARIA Authoring Practices Guide — Tree View | https://www.w3.org/WAI/ARIA/apg/patterns/treeview/ | 2026-08-31 | §4, modèle clavier |
| Microsoft — `FILE_ATTRIBUTE_RECALL_ON_DATA_ACCESS` | https://learn.microsoft.com/en-us/windows/win32/fileio/file-attribute-constants | 2026-08-31 | E3, E6 : fichiers en ligne seulement |
| Microsoft — Handling placeholders | https://learn.microsoft.com/en-us/windows-hardware/drivers/ifs/placeholders_guidance | 2026-08-31 | E3, E6 : éviter l'hydratation involontaire |

## 7. Limites

- **Non testé.** Aucune interface n'a été exécutée, aucun utilisateur observé.
- Les seuils de temps (« première carte utile ») sont fixés dans
  [BASELINE_TARGETS.md](../performance/BASELINE_TARGETS.md) et sont des cibles.
- Le parcours suppose des décisions encore `PROPOSED`
  ([DEC-0008](../decisions/DEC-0008-hierarchical-rendering.md),
  [DEC-0010](../decisions/DEC-0010-indexing-and-watching.md),
  [DEC-0011](../decisions/DEC-0011-brain-isolation-and-migrations.md)). Si
  Sébastien tranche autrement, ce parcours doit être révisé, pas contourné.
