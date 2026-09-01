---
name: debut-session
description: Ouvrir une session FileTopo avec le minimum de tokens : confirmer la racine Git, la branche, HEAD, l'upstream et la propreté de l'arbre, puis lire seulement AGENTS.md, CURRENT_STATE.md, NEXT_ACTION.md et la fiche que NEXT_ACTION nomme. Utiliser au démarrage d'une session, quand l'utilisateur demande de reprendre le projet, ou avant d'exécuter un prompt de l'orchestrateur.
---

# Début de session

Lire **`.orchestrator/protocols/debut-session.md`** et l'exécuter intégralement.

Ouvre la session sans lire large. **Si un travail interrompu est détecté** — arbre non propre, `RESULT.md` en `PAUSED`/`BLOCKED`/`FAILED`, commits inattendus — basculer vers `reprise-session`.

La procédure est **partagée avec Codex** et vit dans un seul endroit :
`.orchestrator/protocols/`. Elle n'est pas recopiée ici, pour qu'il n'existe
jamais deux versions divergentes de la même règle.
