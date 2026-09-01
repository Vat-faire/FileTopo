# Protocole — début de session

**Procédure partagée. Claude Code et Codex l'exécutent à l'identique.** Les
wrappers `.claude/skills/debut-session/` et `.agents/skills/debut-session/` ne
font que renvoyer ici.

**Objectif : reprendre FileTopo avec le minimum de tokens.** Ce protocole
existe parce que la reprise coûteuse est celle qui lit tout « pour être sûr ».
Lire large n'est pas lire prudemment : c'est brûler le budget qui servira au
vrai travail.

## 1. Git d'abord, toujours

Avant toute lecture de document :

    git rev-parse --show-toplevel
    git branch --show-current
    git rev-parse HEAD
    git rev-parse --abbrev-ref @{upstream}
    git status --short

**Confirmer la racine Git** et travailler depuis elle.

**S'arrêter et signaler immédiatement** si l'un de ces points apparaît :

- la racine n'est pas le dépôt FileTopo attendu;
- la branche n'est pas celle que `CURRENT_STATE.md` déclare active;
- `git status` n'est pas propre — du travail non commité existe;
- `HEAD` diverge de son `upstream` dans un sens inattendu;
- une branche protégée est sortie de son SHA connu.

**Ne rien corriger de sa propre initiative.** Signaler, décrire l'écart, et
attendre.

## 2. Si un travail interrompu est détecté

Un arbre non propre, un `RESULT.md` en `PAUSED`, `BLOCKED` ou `FAILED`, ou des
commits inattendus depuis le dernier état connu **signifient qu'une session
précédente ne s'est pas fermée proprement**.

Dans ce cas : **basculer vers [reprise-session](reprise-session.md)** et suivre
ce protocole-là. Ne pas continuer un début de session normal par-dessus un
travail en suspens.

## 3. Lectures, dans cet ordre et pas plus

1. **`AGENTS.md`** — règles canoniques. `CLAUDE.md` le reprend et n'ajoute que
   les précisions propres à Claude Code.
2. **`docs/ai/CURRENT_STATE.md`** — où en est le projet.
3. **`docs/ai/NEXT_ACTION.md`** — l'action unique en cours.
4. **Seulement** la fiche de tâche, la fiche `DEC` ou le document de référence
   que `NEXT_ACTION.md` **nomme explicitement**, et seulement si le travail
   demandé l'exige.

## 4. Ce qu'il ne faut pas faire

- **Ne pas parcourir tout `docs/`.** Les fiches non nommées ne servent pas.
- **Ne pas lire tout le code**, ni `src/`, ni `src-tauri/` « pour se situer ».
- **Ne pas relire l'historique Git** au-delà des quelques commits nécessaires.
- **Ne pas ouvrir `graph/`**, ni `spikes/`, ni les journaux de mesure, sauf
  demande explicite.
- **Ne pas lire `VALIDATION.md` ni `CHANGELOG_AI.md` en entier** : ce sont des
  registres d'ajout, très longs, et `CURRENT_STATE.md` en porte la synthèse.

## 5. Ce qu'il faut annoncer avant de commencer

Une confirmation courte, en quelques lignes :

- racine, branche, `HEAD`, propreté de l'arbre;
- la tâche active et son statut;
- l'action unique en cours;
- tout écart constaté.

**Puis attendre l'instruction**, ou exécuter le prompt de l'orchestrateur s'il
a déjà été donné. Ce protocole prépare le terrain; il ne choisit pas le
travail.
