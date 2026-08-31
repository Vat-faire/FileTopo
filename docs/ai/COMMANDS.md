# Commandes et continuité de session

La mémoire du dépôt reste la source de vérité. Une commande de session ne
remplace jamais CURRENT_STATE.md, NEXT_ACTION.md, HANDOFF.md et les preuves.

## Claude Code

- /goal : formuler un objectif borné, mesurable et vérifiable.
- /compact : continuer la même tâche avec un contexte résumé.
- /clear : repartir seulement après mise à jour complète de la mémoire et état Git connu.
- /rename : nommer une session.
- /resume : reprendre une session existante.
- /context : examiner l'utilisation du contexte.
- /loop : observation temporaire limitée à la session; jamais une mémoire permanente.

## Codex

Aucune commande oblique Codex précise n'a été vérifiée dans l'environnement de
TASK-0010; ne pas transposer les commandes Claude. Avant une tâche, choisir le
modèle et l'effort adaptés dans le sélecteur disponible. Utiliser le mode plan
lorsqu'une proposition doit précéder l'exécution. Employer les outils de
révision lorsqu'ils sont disponibles. Les fichiers du dépôt restent
autoritaires, quelle que soit la continuité de la session.

## Git générique en lecture seule

    git rev-parse --show-toplevel
    git branch --show-current
    git rev-parse HEAD
    git status --short
    git diff --check
    git diff --stat

Commit, push, tag, fusion et publication exigent l'autorisation précise de la
tâche. Ne jamais utiliser reset --hard, clean ou force push pour résoudre une
ambiguïté.

## Quand compacter

Utiliser /compact si la même tâche continue, que le contexte devient volumineux,
que les décisions importantes sont déjà écrites, que Git est connu et qu'un
résumé suffit pour poursuivre.

## Quand effacer le contexte

Utiliser /clear seulement si la tâche est terminée ou arrêtée proprement,
CURRENT_STATE.md et HANDOFF.md sont à jour, NEXT_ACTION.md contient une seule
action, les preuves sont consignées, Git est connu et aucun fait essentiel ne
reste seulement dans le clavardage.

## Quand boucler

/loop est permis pour attendre un build, surveiller un processus, vérifier
périodiquement un état temporaire ou observer sans destruction. Il est interdit
comme substitut à une tâche, une feuille de route, une mémoire, un service
permanent ou un processus capable de modifier ou publier sans supervision.
