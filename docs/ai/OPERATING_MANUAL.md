# OPERATING_MANUAL.md — Manuel opératoire

Comment un agent travaille sur ce projet. Complète `AGENTS.md`, ne le remplace
pas.

## 1. Cycle d'une session

1. **Lire** `START_HERE.md`, puis les fichiers qu'il indique.
2. **Vérifier** qu'aucune tâche n'est déjà `IN_PROGRESS`.
   Si une tâche l'est, la reprendre ; ne jamais en ouvrir une seconde.
3. **Prendre** l'unique action de `NEXT_ACTION.md`, et **demander le GO**
   seulement si elle relève d'un point d'arrêt (section 4) non couvert par
   l'autorisation permanente.
4. **Exécuter** dans le périmètre, sans élargir la portée.
5. **Consigner** les preuves au fur et à mesure.
6. **Clôturer** : mettre à jour l'état, la prochaine action, le journal, le
   graphe, la passation.

## 2. Cycle de vie d'une tâche

```
PROPOSED → APPROVED → IN_PROGRESS → IMPLEMENTED → VERIFIED
                            ↓
                  BLOCKED | REJECTED | DEFERRED
```

Les **huit** états permis, et aucun autre :

- `PROPOSED` : décrite, pas démarrée. Attend une approbation.
- `APPROVED` : GO donné, autorisée à démarrer, pas encore démarrée.
- `IN_PROGRESS` : en cours. **Une seule à la fois, tout le projet confondu.**
- `BLOCKED` : arrêtée par un obstacle, avec la cause écrite.
- `IMPLEMENTED` : livrable produit et auto-vérifié, pas encore vérifié
  indépendamment.
- `VERIFIED` : vérifié **sur preuves** par une instance indépendante de
  l'exécuteur (orchestrateur ou humain). Un agent exécuteur ne pose jamais cet
  état lui-même.
- `REJECTED` : refusée ou rejetée après examen, avec le motif écrit.
- `DEFERRED` : reportée, sans travail engagé.

Chaque tâche a une fiche `docs/tasks/TASK-XXXX-<slug>.md` contenant :
objectif, périmètre, fichiers, interdictions, livrables, validations, critères
d'acceptation, conditions d'arrêt, rapport.

## 3. Régime de preuve

Trois qualificatifs, et seulement ceux-là :

- **Vérifié** — une action a été faite et son résultat constaté. La preuve est
  citée (fichier, extrait, sortie).
- **Non testé** — prévu ou écrit mais jamais exécuté ni contrôlé.
- **Inconnu** — hors de ce qui a pu être observé.

Une intention n'est jamais rapportée comme un résultat. Un échec est rapporté
avec sa sortie réelle. Un travail partiel est rapporté comme partiel, en
précisant ce qui manque.

## 4. Autorisation permanente et points d'arrêt

Depuis le **2026-08-25**, une **autorisation permanente** couvre, sans GO
répété : la recherche publique en lecture, les décisions documentées,
l'architecture, le développement, les tests, la documentation, et les
**commits locaux**. L'**enchaînement autonome des tâches** est permis dès
que les critères d'acceptation et les preuves d'une tâche sont satisfaits
(section 3, une seule tâche `IN_PROGRESS`).

Points d'arrêt (**GO humain requis**) :

- une ambiguïté importante sur l'intention ou la portée ;
- un secret, une clé ou un identifiant manquant, indispensable à la suite ;
- toute dépense ou achat ;
- une action destructive sur des documents utilisateur ;
- une action externe hors de l'objectif : publication, dépôt distant,
  branche publique, accès réseau au-delà de la lecture de sources publiques ;
- fixer le nom public, la licence définitive ou la pile technologique ;
- activer ou utiliser un portefeuille payant Anthropic, ou toute dépense
  externe, sans instruction explicite.

En cas de doute : s'arrêter et demander.

## 5. Écriture

- Français clair, phrases courtes, pas de superlatif.
- Encodage **UTF-8**, fins de ligne cohérentes, Markdown simple.
- Dates absolues au format `AAAA-MM-JJ`. Jamais « hier », « la semaine passée ».
- Identifiants de tâche sur quatre chiffres : `TASK-0001`.

## 6. Fichiers d'état et leur rôle

| Fichier | Rôle | Fréquence |
|---------|------|-----------|
| `CURRENT_STATE.md` | Où en est le projet, en clair | à chaque session |
| `NEXT_ACTION.md` | **Exactement une** action proposée | à chaque session |
| `HANDOFF.md` | Passation au prochain agent | à chaque session |
| `VALIDATION.md` | Ce qui est vérifié, non testé, inconnu | à chaque session |
| `CHANGELOG_AI.md` | Journal chronologique des interventions | à chaque session |
| `graph/current_state.yaml` | Même état, lisible par machine | à chaque session |
| `graph/history.jsonl` | Un événement par ligne, en ajout seul | à chaque événement |
| `graph/project_graph.yaml` | Structure du projet et de ses phases | à chaque changement |

`history.jsonl` est **en ajout seul** : on n'y réécrit ni n'y supprime de ligne.

## 7. Interdits permanents

- Sortir du dépôt, sous quelque prétexte que ce soit.
- Écrire une donnée réelle, un secret ou un chemin local personnel.
- Mentionner un projet privé, ses noms, ses chemins ou ses contenus.
- Modifier des documents utilisateur.
- Déclarer terminé ce qui ne l'est pas.
