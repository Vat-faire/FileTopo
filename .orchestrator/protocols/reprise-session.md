# Protocole — reprise de session

**Procédure partagée. Claude Code et Codex l'exécutent à l'identique.**

**Objectif : reprendre après un crash, un terminal fermé, une nouvelle session
ou un compactage, sans rien casser et sans rien refaire.**

La règle qui gouverne tout le reste : **Git et les fichiers réels priment sur
n'importe quel résumé.** Un résumé de session, un `RESULT.md` ou même ce que
l'on croit se rappeler peuvent être en retard, incomplets ou faux. Le dépôt,
lui, dit ce qui existe. **En cas de contradiction, le dépôt gagne.**

## 1. Établir l'état réel — Git d'abord

    git rev-parse --show-toplevel
    git branch --show-current
    git rev-parse HEAD
    git rev-parse --abbrev-ref @{upstream}
    git status --short
    git log --oneline -5
    git diff --stat

Puis, si `HEAD` et l'upstream diffèrent :

    git log --oneline @{upstream}..HEAD    # commits locaux non poussés
    git log --oneline HEAD..@{upstream}    # commits distants non intégrés

## 2. Lectures, dans cet ordre

1. **`.orchestrator/RESULT.md`**, s'il est pertinent — il donne l'état déclaré
   de la **dernière exécution seulement**. **Le lire comme un indice, pas comme
   une vérité :** il peut dater d'avant un travail non commité.
2. **`docs/ai/CURRENT_STATE.md`**.
3. **`docs/ai/NEXT_ACTION.md`**.
4. **Seulement** les fichiers directement nécessaires au travail interrompu —
   ceux que `RESULT.md` ou `NEXT_ACTION.md` nomment.

## 3. Retrouver la dernière action sûre

Le but n'est **pas** de reprendre au début, ni de recommencer par précaution.
Il est de **situer précisément le point d'arrêt**, puis de continuer.

Se demander, dans l'ordre :

- **Qu'est-ce qui est déjà commité ?** C'est acquis; ne pas le refaire.
- **Qu'est-ce qui est modifié mais non commité ?** C'est du travail en cours,
  potentiellement à moitié fait. L'examiner avant d'y toucher.
- **Qu'est-ce que `RESULT.md` annonçait comme restant à faire ?** Le confronter
  à ce que le dépôt montre réellement.
- **Une étape a-t-elle été faite sans être enregistrée ?** C'est le cas le plus
  dangereux : la refaire aveuglément peut dupliquer un effet.

**Ne jamais recommencer une étape déjà réalisée sans avoir vérifié qu'elle ne
l'était pas.**

## 4. Interdictions absolues

**Aucune récupération destructive**, en aucune circonstance :

- pas de `git reset --hard`;
- pas de `git clean`;
- pas de `git restore` ni `git checkout --` massif;
- pas de `git stash drop`, ni suppression de branche;
- pas de `force push`, ni réécriture d'historique.

Du travail non commité qui gêne **se décrit et s'annonce**; il ne s'efface pas.
Perdre le travail d'autrui est un dommage irréversible; un arbre en désordre ne
l'est pas.

## 5. Si l'ambiguïté est dangereuse

Quand l'état ne permet pas de trancher sans risque — deux versions
contradictoires, une étape peut-être appliquée, un doute sur ce qui a déjà eu
effet — **s'arrêter en `BLOCKED`** et l'écrire précisément :

- ce qui a été observé, avec les commandes et leurs sorties;
- les hypothèses possibles, et pourquoi elles ne se départagent pas;
- ce qu'il faudrait savoir pour trancher;
- ce qui a été laissé exactement en l'état.

**Un `BLOCKED` explicite vaut mieux qu'une reprise qui détruit.**

## 6. Avant de continuer

Annoncer en quelques lignes : l'état Git réel, la dernière action sûre
identifiée, ce qui reste, et le point exact où le travail reprend. **Puis
continuer** — sans refaire, sans effacer.
