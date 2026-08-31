# Passation

- **Date :** 2026-08-31
- **Branche :** rebuild/v0.2-project-brain
- **Base :** 91bbe90f0f99026c28cd345784d4f579a0016db2
- **Commit livré :** celui portant le message « docs: propose functional architecture baseline », publié sur origin
- **Tâches :** TASK-0010 VERIFIED le 2026-08-31; TASK-0011 PROPOSED, non démarrée

## Livré et pourquoi

La mémoire de reprise, la vision réelle, le rebaseline du prototype, la matrice
fonctionnelle, la vision du pipeline et la décision de reconstruire dans le
dépôt existant ont été établis, puis vérifiés. La fiche TASK-0011 a ensuite été
rédigée et soumise : elle spécifie la baseline des 39 fonctions, le parcours
utilisateur, six décisions d'architecture à comparer, les objectifs mesurables
et le plan de tests, sans rien trancher. Le prototype alpha reste intact comme
référence historique; aucun code n'a été modifié.

## Fichiers essentiels

Lire [CLAUDE.md](../../CLAUDE.md), [START_HERE.md](START_HERE.md),
[CURRENT_STATE.md](CURRENT_STATE.md), [NEXT_ACTION.md](NEXT_ACTION.md), puis la
fiche de la prochaine tâche seulement après son approbation.

## Non vérifié et blocages

- Aucun test applicatif, build, test manuel ou essai physique n'a été exécuté.
- La vérification de TASK-0010 est documentaire et Git seulement; elle ne dit
  rien du comportement réel du logiciel.
- TASK-0011 n'est qu'une proposition : rien de son contenu n'est décidé, et
  aucune de ses décisions n'existe encore.
- graph/ est ancien et contradictoire; sa normalisation est reportée.
- Aucun blocage technique n'est ouvert.

## Prochaine action unique

Sébastien examine TASK-0011, puis la corrige, l'approuve ou la rejette. Aucun
agent ne démarre cette tâche avant un GO explicite.

## Commandes sûres

    git rev-parse --show-toplevel
    git branch --show-current
    git rev-parse HEAD
    git status --short
    git show --stat --oneline HEAD

## Message court pour Claude Code

Lis seulement CLAUDE.md, docs/ai/START_HERE.md, docs/ai/CURRENT_STATE.md,
docs/ai/NEXT_ACTION.md, puis docs/tasks/TASK-0011-functional-architecture-baseline.md
une fois cette tâche approuvée. Ne modifie rien avant d'avoir vérifié Git et
confirmé son périmètre.
