# Passation

- **Date :** 2026-08-31
- **Branche :** rebuild/v0.2-project-brain
- **Base :** 91bbe90f0f99026c28cd345784d4f579a0016db2
- **Commit livré :** celui portant le message « docs: establish v0.2 project brain »
- **Tâche :** TASK-0010, IMPLEMENTED, non VERIFIED

## Livré et pourquoi

La mémoire de reprise, la vision réelle, le rebaseline du prototype, la matrice
fonctionnelle, la vision du pipeline et la décision de reconstruire dans le
dépôt existant ont été établis. Le prototype alpha reste intact comme référence
historique; aucun code n'a été modifié.

## Fichiers essentiels

Lire [CLAUDE.md](../../CLAUDE.md), [START_HERE.md](START_HERE.md),
[CURRENT_STATE.md](CURRENT_STATE.md), [NEXT_ACTION.md](NEXT_ACTION.md), puis la
fiche de la prochaine tâche seulement après son approbation.

## Non vérifié et blocages

- Aucun test applicatif, build, test manuel ou essai physique n'a été exécuté.
- TASK-0010 attend la vérification humaine de Sébastien.
- graph/ est ancien et contradictoire; sa normalisation est reportée.
- Aucun blocage technique n'est ouvert.

## Prochaine action unique

Validation humaine de la mémoire et du rebaseline, sans changement de code.

## Commandes sûres

    git rev-parse --show-toplevel
    git branch --show-current
    git rev-parse HEAD
    git status --short
    git show --stat --oneline HEAD

## Message court pour Claude Code

Lis seulement CLAUDE.md, docs/ai/START_HERE.md, docs/ai/CURRENT_STATE.md,
docs/ai/NEXT_ACTION.md, puis le fichier de la prochaine tâche une fois
approuvée. Ne modifie rien avant d'avoir vérifié Git et confirmé son périmètre.
