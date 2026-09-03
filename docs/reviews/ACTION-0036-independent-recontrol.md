# ACTION-0036 — Re-contrôle indépendant ciblé de X8 / TASK-0022 : CLOSED

- **Date :** 2026-09-03
- **Objet :** enregistrement du re-contrôle indépendant ciblé de la seule
  réserve `X8` de `ACTION-0035`
- **Contrôleur :** **orchestrateur technique indépendant**, instance distincte
  de l'exécuteur de `TASK-0022` et de la correction `X8`
- **Rédacteur :** Codex. **Ce document ENREGISTRE le verdict rendu par
  l'orchestrateur; Codex ne rend pas ce verdict et ne s'attribue pas
  `VERIFIED`.**
- **HEAD re-contrôlé :**
  `645b9484790f8e766f7eed93107b9431d144aaa6`
- **Commit substantif de correction `X8` :**
  `d6963e65e9829b8c17196eeb469eabfb3aa86aeb`
- **`main` :** `91bbe90f0f99026c28cd345784d4f579a0016db2`,
  intacte

## 1. Verdict rendu par l'orchestrateur

| Élément | Verdict |
|---|---|
| `ACTION-0036` | **`CLOSED`** |
| Réserve `X8` | **`CLOSED`** |
| `ACTION-0035` | **`CLOSED`** |
| `TASK-0022` | **`VERIFIED`** |

## 2. Motif du verdict

- `artifactTaskId` et `runtimeWriteOwnership` dérivent réellement l'identité;
- aucun préfixe de tâche n'est codé en dur dans `M12.28`;
- le compte protégé est dérivé;
- la parité TypeScript/Rust est testée;
- `M12` passes 1 et 2 a réellement réussi sur un nouveau variant;
- `writesUnderItsOwnTaskOnly = true`;
- `protectedArtifactCount = 19`;
- `protectedDestinations = []`;
- les critères `M12` sont inchangés;
- `main` est intacte;
- `X8` est corrigée.

Ces valeurs décrivent le HEAD re-contrôlé et les preuves `M12` publiées avant
le scellement consécutif à `VERIFIED`.

## 3. Portée exacte

Le re-contrôle ne rouvre **aucun autre point** de `TASK-0022`. Le fond accepté
par `ACTION-0035` demeure accepté : gel antérieur au code, `DEC-0024`, layout
`layered-tree-cards-v1`, schéma `3`, `N1` à `N15`, fixtures, navigation,
relations, lecture seule et limites déclarées.

## 4. Conséquence X5 de VERIFIED

Les huit preuves canoniques de `TASK-0022` rejoignent les dix-neuf noms déjà
protégés, pour un total exact de **27** :

1. `TASK-0022-J12-intrabrain-relations-regression-webview2.json`
2. `TASK-0022-K11-readonly-isolation-regression-webview2.json`
3. `TASK-0022-L12-composed-view-regression-webview2-pass1.json`
4. `TASK-0022-L12-composed-view-regression-webview2-pass2.json`
5. `TASK-0022-M12-interbrain-relations-regression-webview2-pass1.json`
6. `TASK-0022-M12-interbrain-relations-regression-webview2-pass2.json`
7. `TASK-0022-N15-topographic-node-graph-webview2-pass1.json`
8. `TASK-0022-N15-topographic-node-graph-webview2-pass2.json`

Le `H9` de `TASK-0022`, ses sorties `K12` et toutes les variantes `-abandon`
restent non canoniques et ne sont pas protégés. Aucune preuve elle-même n'est
modifiée par ce scellement.
