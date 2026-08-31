# HANDOFF — passage de relais

- **Dernière mise à jour :** 2026-08-31
- **Branche active :** `spike/v0.2-technical-risk-gates`, publiée sur origin
- **Tâche livrée, NON vérifiée :** `TASK-0012`, **`IMPLEMENTED`**
- **Tâche IN_PROGRESS :** aucune

## Où en est le projet

La porte **P3 est franchie**. `TASK-0012` a été **exécutée** : cinq bancs
d'essai, cinq verdicts, des mesures réelles. C'est la **première fois depuis
`TASK-0010`** que quelque chose est exécuté plutôt qu'écrit.

`TASK-0012` est **`IMPLEMENTED`**, pas `VERIFIED`. L'exécuteur ne juge pas ses
propres preuves.

## Ce qu'il faut savoir en cinq lignes

1. **`M-C` est réfutée telle que `DEC-0011` l'écrit** : un `-wal` orphelin
   survit à la permutation et corrompt la base neuve. Preuve jointe.
2. **Le plafond de 3 000 blocs de `DEC-0008` est remplacé** par trois plafonds
   mesurés, de 939 à 3 743 selon la forme.
3. **L'identité Windows fonctionne sur Rust stable**, à 28,3 µs par élément.
4. **`cargo build` échoue** — cache incrémental, pas le code source — et n'a
   **pas** été corrigé, volontairement.
5. **Aucune fiche `DEC` n'a été modifiée.** Les verdicts alimentent des
   décisions; ils n'en prennent aucune.

## État Git

| Référence | SHA |
|---|---|
| `main` locale et distante | `91bbe90f0f99026c28cd345784d4f579a0016db2` — **non touchée** |
| `rebuild/v0.2-project-brain` locale et distante | `db8d3de0b20e7efbfe463a17c218cc14face39a8` — **non touchée** |
| `spike/v0.2-technical-risk-gates` | voir `git rev-parse HEAD`, égal à `origin/` |

Six points de contrôle poussés, SHA local vérifié égal au distant à chaque fois.
Aucune fusion, aucune PR, aucune release, aucune étiquette, aucun `force push`.

## Blocages ouverts, qui demandent une décision humaine

| # | Blocage | Ce qui est demandé |
|---|---|---|
| 1 | **`B3`, inter-volume non observé.** Le tester exige d'écrire sur un second volume; §13.2 en fait une condition d'arrêt | Autoriser, ou non, un répertoire synthétique sur un second volume. Travail court |
| 2 | **`B0`, échec non corrigé.** `cargo build` échoue sur le cache incrémental de `src-tauri/target/` | Autoriser, ou non, une tâche distincte de renouvellement du cache |
| 3 | **`B4`, question 3 non résolue.** Aucune source Microsoft trouvée sur la survie de l'identité à une hydratation; la recherche a été interrompue par une limite de dépense du compte | Reprendre la recherche, ou accepter la lacune déclarée |

## Prochaine action unique

Sébastien **contrôle les preuves** de `TASK-0012` et attribue `VERIFIED`, ou
renvoie la tâche avec des corrections motivées (`ACTION-0021`).

## Commandes sûres

    git rev-parse --show-toplevel
    git branch --show-current
    git rev-parse HEAD
    git status --short
    git log --oneline db8d3de..HEAD
    git diff --stat db8d3de -- src src-tauri tests public scripts .github graph

La dernière doit rendre **une sortie vide** : aucun fichier de production n'a
changé.

## Message court pour Claude Code

Lis seulement CLAUDE.md, docs/ai/START_HERE.md, docs/ai/CURRENT_STATE.md et
docs/ai/NEXT_ACTION.md. La porte **P3 est franchie** et `TASK-0012` est
**`IMPLEMENTED`** : les bancs d'essai ont été exécutés, leurs verdicts sont
écrits, **ne les rejoue pas** pour les lire. `TASK-0012` **n'autorise plus
rien** : elle est terminée et attend un contrôle humain.

**N'écris aucune ligne de code de production** — la porte P4 n'est pas
franchie. **Ne corrige pas l'échec de `B0`.** **Ne teste pas l'inter-volume**
sans un GO explicite : cela suppose d'écrire hors du dépôt. **Ne modifie aucune
fiche `DEC`** : les verdicts alimentent des décisions, ils n'en prennent
aucune. Ne fusionne rien, ne crée ni PR, ni release, ni étiquette.

Si Sébastien demande la suite, l'action est `ACTION-0021` — et elle lui
appartient, pas à toi.
