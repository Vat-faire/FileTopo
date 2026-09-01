# ACTION-0029 — Re-contrôle indépendant de TASK-0018 : clôture de X5, TASK-0018 VERIFIED

- **Date :** 2026-09-01
- **Objet :** **re-contrôle indépendant** de la correction de la réserve `X5`
  d'[`ACTION-0028`](ACTION-0028-independent-control.md), et **rien d'autre** —
  le fond de `K1` à `K12` avait déjà été accepté par `ACTION-0028` §0 et n'a
  pas été rouvert
- **Contrôleur :** **orchestrateur technique**, instance **distincte** de
  l'exécuteur de `TASK-0018` et de l'exécuteur de la correction `X5`
- **Rédacteur de la présente fiche :** Claude Code, **exécuteur**, sous le GO
  technique de l'orchestrateur ouvrant `TASK-0019`. **Cette fiche enregistre un
  verdict rendu par l'orchestrateur; elle ne le rend pas.**
- **`HEAD` contrôlé :** **`9e77a6d83fcde194af26da6d356483f592452612`**, tip de
  `build/v0.2-a3-multibrain-foundation`
- **Verdict :** **`APPROVED`**

## 1. Le verdict, tel qu'il a été rendu

| Élément | État attribué par l'orchestrateur |
|---|---|
| Réserve `X5` | **`CLOSED`** |
| `ACTION-0028` | **`CLOSED`** |
| `TASK-0018` | **`VERIFIED`** |
| `HEAD` contrôlé | `9e77a6d83fcde194af26da6d356483f592452612` |

**`TASK-0018` est la quatrième tâche `VERIFIED` de l'étape A**, après
`TASK-0015`, `TASK-0016` et `TASK-0017`. Comme les précédentes, elle l'est
**sur preuves** et **par une instance distincte de l'exécuteur** :
l'exécuteur n'a rien attribué et ne s'est rien attribué.

## 2. Ce que la clôture de `X5` emporte

`X5` disait que **les outils du runtime courant pouvaient écraser les artefacts
canoniques de tâches déjà `VERIFIED`**. Sa correction a instauré une règle, et
c'est la règle — pas l'intention — qui est close :

> **Une exécution d'une tâche ultérieure ne remplace jamais la preuve canonique
> d'une tâche antérieure `VERIFIED`.**

Elle est tenue **à la porte d'écriture** : `write_run_artifact` refuse un nom de
`PROTECTED_RUN_ARTIFACTS` **avant tout accès au disque**. Ce n'est pas une
convention d'appel, c'est un refus.

**Conséquence directe, appliquée par `TASK-0019` §5 :** `TASK-0018` étant
désormais `VERIFIED`, **ses preuves entrent à leur tour dans la liste
protégée** —

- `TASK-0018-K11-readonly-and-isolation.json`
- `TASK-0018-K12-webview2-pass1.json`
- `TASK-0018-K12-webview2-pass2.json`
- `TASK-0018-J12-relations-regression-webview2.json`

— et **le runtime de `TASK-0019` n'écrit plus aucun résultat sous un nom
`TASK-0018`**.

## 3. Correction d'une imprécision documentaire

**Le fond n'est pas touché; une phrase l'était.**

Le `J12` de régression de `TASK-0018` a produit **deux** observations au
clavier, et certains résumés les ont confondues :

| Ce qui a été fait | Ce que l'artefact publie | Ce que c'est |
|---|---|---|
| Navigation **de carte** au clavier | `map-node-6` → `map-node-2` → `map-node-6` | `ArrowUp` vers le parent, `ArrowDown` qui revient. Une preuve de navigation hiérarchique |
| **Traversée d'une relation** | `map-node-6` → **`map-node-9`** | L'activation d'une entrée du panneau porte la sélection sur l'**extrémité** de la relation, `ek1\|brain-alpha\|dossier-b/note-1.txt` |

**La vraie traversée de relation est `map-node-6 → map-node-9`.** Le couple
`6 → 2 → 6` est le test clavier de la carte, pas la traversée.

**Ce qui a été corrigé :** les **résumés** qui présentaient `6 → 2` comme la
traversée de relation — `ACTION-0028` §2. **Rien d'autre.**

**Ce qui n'a pas été touché :** l'artefact
[`TASK-0018-J12-relations-regression-webview2.json`](../performance/runs/TASK-0018-J12-relations-regression-webview2.json),
qui publiait déjà les deux observations correctement et séparément
(`activeAfterArrowUp: "map-node-2"` d'un côté,
`activeDescendantAfterKeystroke: "map-node-9"` et
`expectedEndpointNodeId: 9` de l'autre). **Aucune preuve n'a été réécrite pour
faire coïncider un résumé avec elle.** C'est le résumé qui a été corrigé, dans
le sens qui préserve la preuve.

## 4. Ce qui reste déclaré, et n'est pas compté comme tenu

Le re-contrôle **ne requalifie aucune de ces déclarations** : elles restent
telles que `TASK-0018` les a publiées.

- **Aucune campagne `H9` n'a été exécutée.** `TASK-0018` n'a aucun critère de
  performance, **aucun seuil n'est posé**, `R8` reste entière.
- **`K12` n'a pas été rejoué** après la correction `X5` : aucun code produit de
  bascule, de catalogue ou de session n'avait été modifié.
- **La persistance de la vue reste `P-19`**, non implémentée.
- **La révocation de `P-04` n'est pas implémentée.** `P-04` demeure
  **PARTIELLE**. `P-21` non satisfaite.
- **`B0`** s'est reproduit une cinquième fois, non corrigé; rien n'a été
  supprimé dans `src-tauri/target/`.
- **Une seule machine, un seul runtime WebView2.**

## 5. Suite

L'action unique suivante ouverte par ce verdict est **`TASK-0019` — vue
composée multi-cerveaux**, sous
[`DEC-0017`](../decisions/DEC-0017-multibrain-and-composed-views.md), sur la
branche `build/v0.2-a4-composed-view` créée depuis le `HEAD` contrôlé
`9e77a6d`.

`build/v0.2-a3-multibrain-foundation` **reste exactement au `SHA` contrôlé** :
rien n'y a été ajouté après le verdict, pour que la branche contrôlée et le
`SHA` contrôlé continuent de désigner le même arbre.
