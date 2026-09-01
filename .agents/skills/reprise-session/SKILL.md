---
name: reprise-session
description: Reprendre FileTopo après un crash, un terminal fermé, une nouvelle session ou un compactage : établir l'état réel par Git avant toute lecture, retrouver la dernière action sûre et continuer à partir de là, sans rien refaire ni rien effacer. Utiliser quand une session précédente ne s'est pas fermée proprement.
---

# Reprise de session

Lire **`.orchestrator/protocols/reprise-session.md`** à la racine du dépôt et
l'exécuter intégralement.

**Git et les fichiers réels priment sur tout résumé contradictoire.** Aucune récupération destructive. Si l'ambiguïté est dangereuse : `BLOCKED`, expliqué précisément.

La procédure est **partagée avec Claude Code** et vit dans un seul endroit :
`.orchestrator/protocols/`. Elle n'est pas recopiée ici, pour qu'il n'existe
jamais deux versions divergentes de la même règle.
