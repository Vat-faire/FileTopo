# Protocole — fermeture de session

**Procédure partagée. Claude Code et Codex l'exécutent à l'identique.**

**Objectif : pouvoir quitter sans perdre l'état logique.** Une session qui se
ferme mal coûte bien plus cher que celle qui prend trois minutes à se fermer
proprement : la suivante doit tout redécouvrir, et parfois refait ce qui était
déjà fait.

## 1. Qualifier le résultat, honnêtement

Choisir **un** état, et le choisir sur les faits :

| État | Quand |
|---|---|
| `DONE` | Le travail demandé est **entièrement** fait **et** validé. |
| `PAUSED` | Le travail avance, rien ne bloque, il reste des étapes. |
| `BLOCKED` | Le travail ne peut pas continuer sans une décision, une autorisation ou une information qui manque. |
| `FAILED` | Le travail a été tenté et n'aboutit pas; la cause est connue ou décrite. |

**`DONE` ne s'invente jamais.** Un travail partiel est `PAUSED`, pas `DONE`.
Une cible manquée se publie comme manquée. Un test non exécuté se déclare non
exécuté. **Rien de ce qui n'a pas été vérifié ne se rapporte comme vérifié.**

## 2. Si `DONE`

1. **Exécuter les validations exigées** par la tâche — tests, contrôles,
   critères gelés. Rapporter les échecs tels quels.
2. **Mettre à jour les documents durables nécessaires**, et seulement eux :
   `docs/ai/CURRENT_STATE.md`, `docs/ai/NEXT_ACTION.md`,
   `docs/ai/HANDOFF.md`, `docs/ai/VALIDATION.md`, `docs/ai/CHANGELOG_AI.md`,
   plus la fiche de tâche. **Ne modifier `graph/` que si la tâche l'autorise
   explicitement.**
3. **Écrire `.orchestrator/RESULT.md`** — §4.
4. **Commiter et pousser** selon les règles Git du projet (`AGENTS.md`) :
   branche de travail, **jamais** de fusion vers `main`, ni PR, ni release, ni
   étiquette, ni `force push`, ni réécriture d'historique.
5. **Contrôler l'état Git final** : `git status` propre, `HEAD` connu, branches
   protégées intactes.

## 3. Si `PAUSED`, `BLOCKED` ou `FAILED`

1. **Ne pas annoncer `DONE`.**
2. **Écrire `.orchestrator/RESULT.md`** avec l'**état réel** : ce qui est fait,
   ce qui reste, et **l'action exacte de reprise** — assez précise pour qu'une
   session neuve la reprenne sans redécouvrir le contexte.
3. **Conserver le travail.** Aucune opération destructive : ni `reset --hard`,
   ni `clean`, ni `restore` massif, ni suppression de branche. Du travail non
   commité **se décrit**, il ne s'efface pas.
4. **Commiter et pousser seulement si les règles de la tâche et du dépôt
   l'autorisent.** Si un commit intermédiaire est permis, le message doit dire
   franchement que le travail est incomplet.
5. Mettre `docs/ai/NEXT_ACTION.md` en cohérence : il contient **exactement une
   action**, et ce doit être celle de la reprise.

## 4. `.orchestrator/RESULT.md`

C'est le **rapport compact de la dernière exécution seulement**. Il est
**remplacé** à chaque exécution — **Git fournit l'historique**, ce fichier n'a
pas à le porter.

**Format obligatoire**, sans rien y ajouter :

    TASK_ID:
    AGENT: CLAUDE | CODEX
    RESULT: DONE | PAUSED | BLOCKED | FAILED
    BRANCH:
    FINAL_HEAD:

    SUMMARY:
    -

    VALIDATIONS:
    -

    IMPORTANT_FILES:
    -

    COMMIT:
    PUSHED: yes/no

    LIMITS_OR_BLOCKERS:
    -

    NEXT_ORCHESTRATOR_DECISION:
    -

`FINAL_HEAD` **nomme le commit de travail** que ce rapport décrit. Quand
`RESULT.md` est écrit dans un commit de rapport distinct, ce commit-là suit
immédiatement et Git le montre; le champ ne cherche pas à se désigner
lui-même.

**Ce que ce fichier n'est pas :** pas de copie de terminal, pas de journal
long, pas de duplication de `CURRENT_STATE.md`. S'il faut faire défiler pour le
lire, il est trop long.

## 5. Le rapport terminal peut être très court

Le rapport **exploitable** vit dans `RESULT.md`, commité et poussé. Le rapport
terminal n'a donc qu'à donner l'essentiel : résultat, commit, push, et le
point non résolu s'il y en a un.

Le circuit visé est celui-ci : l'agent finit, écrit `RESULT.md`, commite et
pousse; Sébastien dit simplement « Claude a fini, vérifie » ou « Codex a fini,
vérifie »; l'orchestrateur lit `RESULT.md` puis contrôle GitHub directement.

**C'est pourquoi `RESULT.md` doit être exact.** C'est lui qui est lu, pas le
terminal.
