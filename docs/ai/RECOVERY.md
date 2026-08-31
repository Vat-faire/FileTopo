# Reprise après interruption

1. Rouvrir le dépôt FileTopo sans parcourir ses répertoires parents.
2. Confirmer la racine avec git rev-parse --show-toplevel.
3. Exécuter git status --short; ne supprimer ni écraser une modification incomplète.
4. Lire la séquence minimale de [START_HERE.md](START_HERE.md).
5. Vérifier la tâche active et qu'elle est la seule IN_PROGRESS.
6. Identifier le dernier point sûr avec la branche, HEAD, le diff et la fiche de tâche.
7. Continuer seulement si l'état est compréhensible et dans le périmètre approuvé.
8. Sinon, arrêter et demander à Sébastien sans nettoyer, réinitialiser ou déplacer les fichiers.

## Message générique de reprise

« Reprends FileTopo uniquement depuis sa mémoire versionnée. Lis AGENTS.md ou
CLAUDE.md, docs/ai/START_HERE.md, CURRENT_STATE.md, NEXT_ACTION.md et la fiche
active. Vérifie Git, préserve tout changement existant et rapporte tout état
ambigu avant d'écrire. »
