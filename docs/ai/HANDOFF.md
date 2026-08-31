# Passation

- **Date :** 2026-08-31
- **Branche :** rebuild/v0.2-project-brain
- **Base :** 91bbe90f0f99026c28cd345784d4f579a0016db2
- **Commit livré :** d1119fad06b4296d67bcd0365572b78517b9fb29, « docs: establish v0.2 project brain », publié sur origin
- **Tâche :** TASK-0010, VERIFIED le 2026-08-31

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
- La vérification de TASK-0010 est documentaire et Git seulement; elle ne dit
  rien du comportement réel du logiciel.
- graph/ est ancien et contradictoire; sa normalisation est reportée.
- Aucun blocage technique n'est ouvert.

## Prochaine action unique

Créer et soumettre à Sébastien la spécification TASK-0011 sur la baseline des
exigences fonctionnelles et les décisions d'architecture, sans écrire de code.

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
