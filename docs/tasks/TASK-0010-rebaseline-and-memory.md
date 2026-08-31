# TASK-0010 — Rebaseline et mémoire permanente

- **Identifiant :** `TASK-0010`
- **Titre :** Établir le cerveau persistant de reconstruction de FileTopo
- **Statut :** `IMPLEMENTED`
- **Approbation :** GO explicite de Sébastien, 2026-08-31
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
9. La tâche termine à `IMPLEMENTED`, en attente de vérification humaine.

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
- Livrables prêts pour le commit documentaire et la vérification humaine.

## Limites

Audit statique ciblé; aucune validation complète du logiciel ni essai physique
Windows n'est prévu dans cette tâche.

## Prochaines décisions

Validation humaine du rebaseline et de la mémoire avant toute modification du
code. La tâche suivante ne sera ni créée ni démarrée ici.

## Historique de l'état

- 2026-08-31 — `APPROVED` : GO explicite de Sébastien.
- 2026-08-31 — `IN_PROGRESS` : branche créée et audit documentaire commencé.
- 2026-08-31 — `IMPLEMENTED` : livrables et auto-contrôles documentaires terminés; vérification humaine en attente.
