# TASK-0010 — Rebaseline et mémoire permanente

- **Identifiant :** `TASK-0010`
- **Titre :** Établir le cerveau persistant de reconstruction de FileTopo
- **Statut :** `VERIFIED`
- **Approbation :** GO explicite de Sébastien, 2026-08-31
- **Vérification humaine :** approuvée par Sébastien le 2026-08-31, sur
  contrôle indépendant du commit publié
- **Exécuteur :** Codex, agent principal

## Objectif

Établir une mémoire permanente, compacte et indépendante du clavardage, puis
replacer officiellement FileTopo sur une base de reconstruction honnête sans
supprimer le dépôt, son historique, sa licence MIT ni le prototype alpha.

## Contexte

Le prototype public existant est une référence historique. Sa portée ne couvre
pas encore la vision réelle du produit. La reconstruction doit se faire dans
le dépôt existant, progressivement et sans réécriture d'historique.

## Périmètre

- Audit local, ciblé et en lecture seule du dépôt public.
- Documentation de la vision, du rebaseline, du pipeline futur et des preuves.
- Création de la mémoire de reprise et de la décision de reconstruction.
- Commit et publication de la seule branche autorisée par le GO du 2026-08-31.

## Fichiers lisibles

Les fichiers du dépôt nécessaires à l'audit, notamment la mémoire existante,
le manifeste, le code, les tests, les décisions, les tâches et `graph/`.

## Fichiers modifiables

- `AGENTS.md`, `CLAUDE.md`, `PROJECT_VISION.md`, `ROADMAP.md`;
- les fichiers nommés par TASK-0010 sous `docs/ai/`, `docs/product/`,
  `docs/architecture/`, `docs/tasks/`, `docs/decisions/` et
  `docs/archive/v0.1-alpha/`.

## Interdictions

- Aucun code, test, configuration, dépendance, fichier généré ou graphe modifié.
- Aucun accès à une interface privée de référence ni à des données réelles.
- Aucun effacement du prototype, tag, release, fusion ou réécriture d'historique.
- Aucun développement de la tâche suivante.
- Aucun push hors de `rebuild/v0.2-project-brain`, explicitement autorisée.

## Livrables

Les vingt documents explicitement énumérés dans le mandat TASK-0010, dont la
mémoire minimale, la matrice fonctionnelle, la vision du pipeline, la décision
`DEC-0006` et le bilan alpha.

## Critères d'acceptation

1. Tous les livrables existent et se recoupent sans contradiction trompeuse.
2. `AGENTS.md` est compact et `CLAUDE.md` commence exactement par `@AGENTS.md`.
3. La mémoire permet une reprise minimale par un humain, Codex ou Claude Code.
4. L'audit du prototype distingue preuves, limites et éléments non testés.
5. Une seule action subsiste dans `NEXT_ACTION.md`.
6. Aucun état non officiel, chemin personnel, secret ou donnée privée n'apparaît.
7. Aucun fichier hors périmètre, code, dépendance, graphe, tag ou historique
   n'est modifié.
8. Les validations documentaires et Git prescrites réussissent.
9. L'exécuteur livre à `IMPLEMENTED`; seul un contrôle indépendant peut poser
   `VERIFIED`.

## Validations exécutées

- Vingt livrables présents; première ligne de CLAUDE.md et taille d'AGENTS.md contrôlées.
- Quinze liens locaux contrôlés, aucun cassé.
- Une action unique; aucun statut IN_PROGRESS à la clôture; états officiels contrôlés.
- Recherche ciblée de secrets, chemins personnels et références non autorisées sans résultat.
- Portée Git, branche, parent, remote et tags contrôlés; graph/ et code inchangés.
- git diff --check et examen du diff complet réussis avant commit.
- Aucun test applicatif, build ou installation : tâche documentaire.

## Résultats réels

- Mémoire minimale, vision produit, feuille de route, passation et récupération établies.
- Décision de reconstruction dans le dépôt existant documentée dans DEC-0006.
- Audit statique du prototype et matrice de 39 fonctions produits avec preuves ciblées.
- Pipeline local à six couches documenté sans rendre l'IA nécessaire au MVP.
- Prototype, historique et licence conservés; aucun code ni graphe modifié.
- Livrables commités et publiés : commit `d1119fad06b4296d67bcd0365572b78517b9fb29`,
  message `docs: establish v0.2 project brain`, branche
  `rebuild/v0.2-project-brain` poussée vers `origin`.

## Vérification indépendante

Contrôle mené par l'orchestrateur directement sur GitHub, hors du poste
d'exécution, puis confirmé localement le 2026-08-31.

| Point contrôlé | Résultat |
|---|---|
| Branches de secours et de reconstruction présentes | oui |
| SHA annoncés conformes | oui |
| Commits documentaires au-dessus de `main` | 1 |
| Fichiers du commit | 20, tous autorisés |
| Fichiers de code, tests, dépendances ou `graph/` modifiés | 0 |
| Première ligne de `CLAUDE.md` | `@AGENTS.md` |
| `AGENTS.md` compact | oui |
| Cohérence CURRENT_STATE, NEXT_ACTION, HANDOFF et TASK-0010 | vérifiée |
| `main`, prototype, historique et licence MIT conservés | oui |

La vérification reste documentaire et Git. Elle ne couvre aucun test
automatisé, manuel ou physique du logiciel.

## Limites

Audit statique ciblé; aucune validation complète du logiciel ni essai physique
Windows n'est prévu dans cette tâche.

## Prochaines décisions

La validation humaine est acquise. La suite consiste à rédiger et à soumettre
à Sébastien une spécification TASK-0011 portant sur la baseline des exigences
fonctionnelles et les décisions d'architecture requises avant tout code.
TASK-0011 n'est ni créée ni démarrée ici.

## Historique de l'état

- 2026-08-31 — `APPROVED` : GO explicite de Sébastien.
- 2026-08-31 — `IN_PROGRESS` : branche créée et audit documentaire commencé.
- 2026-08-31 — `IMPLEMENTED` : livrables et auto-contrôles documentaires terminés; vérification humaine en attente.
- 2026-08-31 — `VERIFIED` : commit `d1119fa` publié, vérification indépendante réussie, approbation explicite de Sébastien.
