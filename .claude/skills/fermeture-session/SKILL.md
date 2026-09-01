---
name: fermeture-session
description: Fermer une session FileTopo sans perdre l'état logique : qualifier le résultat en DONE, PAUSED, BLOCKED ou FAILED, exécuter les validations dues, mettre à jour les documents durables, écrire .orchestrator/RESULT.md, puis commiter et pousser selon les règles Git du projet. Utiliser avant de quitter, de mettre en pause ou quand le travail est terminé ou bloqué.
---

# Fermeture de session

Lire **`.orchestrator/protocols/fermeture-session.md`** et l'exécuter intégralement.

**`DONE` ne s'invente jamais** : un travail partiel est `PAUSED`. `RESULT.md` est le rapport compact de la **dernière exécution seulement**, et c'est lui qui sera lu — pas le terminal.

La procédure est **partagée avec Codex** et vit dans un seul endroit :
`.orchestrator/protocols/`. Elle n'est pas recopiée ici, pour qu'il n'existe
jamais deux versions divergentes de la même règle.
