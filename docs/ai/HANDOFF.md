# HANDOFF — passage de relais

- **Dernière mise à jour :** 2026-08-31
- **Branche active :** `spike/v0.2-budget-controller`, publiée sur origin
- **Dernière tâche vérifiée :** `TASK-0013`, **`VERIFIED`** le 2026-08-31, sur
  contrôle indépendant [`ACTION-0023`](../reviews/ACTION-0023-independent-control.md),
  **avec quatre réserves `V1` à `V4`**
- **Tâche livrée, NON vérifiée :** `TASK-0014`, **`IMPLEMENTED`** le 2026-08-31
- **Tâche IN_PROGRESS :** aucune

## Où en est le projet

`ACTION-0023` a **clos** `TASK-0013` : contrôle **accepté**, `VERIFIED` sur
preuves, **quatre réserves**. `DEC-0014` en a tiré six décisions, dont le
**calepin baseline** et la **non-adoption du contrôleur de budget**.

`TASK-0014` — le `B2 ter` — a ensuite éprouvé une **correction minimale** de ce
contrôleur. **Neuf verdicts : deux réfutations, un critère bloqué, six
confirmations.** La tâche attend son contrôle indépendant, `ACTION-0024`.

## Ce qu'il faut savoir en dix lignes

1. **`CAL-B`, le pavage squarifié, est le calepin baseline** — `DEC-0014` B. À
   nombre de nœuds DOM identique il rend `SYN-WIDE` 5,5 fois plus vite et
   ramène le rapport d'aspect médian de 3 987,79 à 1,01. **Mais la causalité
   géométrique n'est pas établie** — réserve `V2`.
2. **Ne jamais écrire « 3 000 blocs visibles mesurés »** — réserve `V1`. Le
   scénario demandé à 3 000 en construit **2 856**. Le résultat tient aussi sur
   **5 012 blocs visibles**, une charge supérieure : c'est cela qu'il faut
   citer.
3. **Le contrôleur de budget de `TASK-0013` n'est pas adopté** — `F4` réfutée.
   **Le principe du budget auto-régulé est conservé** — `DEC-0014` D et E.
4. **La correction minimale de `TASK-0014` n'est pas validée non plus.** Elle
   corrige les deux causes mesurées — c'est vérifiable — mais **ne tient ni la
   cible `G1` ni la convergence `G2`** dès que la charge varie réellement.
5. **Cause mesurée du battement :** les **deux bornes** de la zone morte
   tombent **exactement** sur un pas de synchronisation verticale de 4,1667 ms.
   Supprimer toute marge à la cible place le point de bascule là où le moteur
   produit le plus de valeurs.
6. **`B2 ter` a mesuré de vraies revirtualisations** — 42 à 51 par exécution,
   contre **0** dans `B2 bis` — et chronométré chaque reconstruction DOM :
   **0,57 à 0,76 image** du budget de 33,3 ms.
7. **Le plancher de lisibilité tient absolument.** Sous contrainte
   inatteignable, le contrôleur monte au niveau 13 sur 13, atteint exactement
   **2 400 px²**, **s'y arrête et y reste** — les deux moteurs, toutes formes,
   toutes exécutions.
8. **`SYN-100K` tient les deux seuils** avec budget actif, et **`R1` est
   levée** depuis `ACTION-0023`. **`R8` reste en vigueur** : aucune mesure de
   production.
9. **Aucune tentative WebView2** n'est autorisée avant qu'un véritable hôte
   Tauri existe — `DEC-0014` F.
10. **Deux défauts de protocole ont été publiés** plutôt que corrigés après
    coup. Une valeur `ips régime stable` de **0** signifie **« aucune image
    après le dernier changement »**, jamais « zéro image par seconde ».

## Gouvernance en vigueur

Depuis le 2026-08-31, les **GO techniques** viennent de l'**orchestrateur
technique**, sous délégation de Sébastien (`AGENTS.md`, section « Délégation
d'orchestration technique »). **Restent réservés à Sébastien**, sans
délégation : dépense, donnée réelle ou personnelle, publication externe
exceptionnelle (fusion vers `main`, PR, release, étiquette, nouveau distant),
opération destructive ou hors dépôt, changement important de portée produit.

## État Git

| Référence | SHA |
|---|---|
| `main` locale et distante | `91bbe90f0f99026c28cd345784d4f579a0016db2` — **non touchée** |
| `rebuild/v0.2-project-brain` locale et distante | `db8d3de0b20e7efbfe463a17c218cc14face39a8` — **non touchée** |
| `spike/v0.2-technical-risk-gates` locale et distante | `746f1b5f93c9d7085516c0e56473a95dc2c2d178` — **un seul commit ajouté** : annexe `R1` à `R9` |
| `spike/v0.2-render-budget` | `933bd0d5e7e05e4e7fe233c5fc6b9320a194264d` — branche de `TASK-0013`, **non touchée** depuis sa clôture |
| `spike/v0.2-budget-controller` | branche de travail de `TASK-0014`, voir `git rev-parse HEAD`, égal à `origin/` |

Aucune fusion, aucune PR, aucune release, aucune étiquette, aucun `force push`,
aucune réécriture d'historique, aucune suppression de branche.

## Points ouverts

| # | Point | Ce qui est demandé |
|---|---|---|
| 1 | **`TASK-0014` est `IMPLEMENTED`** | Contrôle indépendant `ACTION-0024`, par une instance **distincte de l'exécuteur** |
| 2 | **`G1` et `G2` réfutées** — la correction ne tient ni la cible ni la convergence | Une décision ultérieure devra trancher. **Aucune constante n'a été retouchée**, aucune cible déplacée |
| 3 | **`G3` bloqué** — mesure nulle par construction | Toute reprise devra définir la fenêtre stable autrement, **et le déclarer avant mesure** |
| 4 | **Les deux bornes tombent sur un pas de synchronisation verticale** | Aucune marge alternative n'a été mesurée. Rien ne peut être supposé d'une hystérésis non éprouvée |
| 5 | **Réserves `V1` à `V4`** d'`ACTION-0023` | Toutes en vigueur. Aucune n'est levée par `TASK-0014` |
| 6 | **Réserve `R8`** — mesures non transposables à la production | En vigueur, **renforcée**. `R1` est **levée**; `R2` à `R7` et `R9` inchangées |
| 7 | **WebView2 non mesuré** | Interdit d'essayer avant un **véritable hôte Tauri** — `DEC-0014` F |
| 8 | **`B3`, inter-volume non observé** | Écrire hors du dépôt reste **réservé à Sébastien**. Point conservé **NON TESTÉ** |
| 9 | **`B0`, échec non corrigé** | Tâche distincte, **avec conservation préalable** du cache fautif |
| 10 | **`B4`, question 3 ouverte** | À fermer **avant** l'identité persistante et l'état vu/non vu |

## Prochaine action unique

`ACTION-0024` — **contrôler les preuves de `TASK-0014`**, puis attribuer
`VERIFIED` ou renvoyer la tâche. Détail dans
[NEXT_ACTION.md](NEXT_ACTION.md).

## Commandes sûres

    git rev-parse --show-toplevel
    git branch --show-current
    git rev-parse HEAD
    git status --short
    git log --oneline db8d3de..HEAD
    git diff --stat db8d3de -- src src-tauri tests public scripts .github graph

La dernière doit rendre **une sortie vide** : aucun fichier de production n'a
changé.

Pour rejouer le banc `B2 ter`, voir
[`spikes/b2ter-budget-controller/README.md`](../../spikes/b2ter-budget-controller/README.md);
pour `B2 bis`,
[`spikes/b2bis-layout-and-budget/README.md`](../../spikes/b2bis-layout-and-budget/README.md).
Les mesures brutes ne sont **pas** commitées : elles vivent sous
`spikes/.work/`, ignoré par Git, et sont reproductibles depuis la graine fixe
`20260831`.

## Message court pour Claude Code

Lis seulement CLAUDE.md, docs/ai/START_HERE.md, docs/ai/CURRENT_STATE.md et
docs/ai/NEXT_ACTION.md. `TASK-0012` et `TASK-0013` sont **closes et
`VERIFIED`**; `TASK-0014` est **`IMPLEMENTED` et attend un contrôle
indépendant**. **Ne rejoue aucun banc d'essai** sans GO, et **ne t'attribue pas
`VERIFIED`**.

Les arbitrages en vigueur sont dans `DEC-0013` et `DEC-0014`. **Aucun budget
n'est adopté**, ni celui de `TASK-0013`, ni la correction de `TASK-0014`.

**N'écris aucune ligne de code de production** — la porte P4 n'est pas
franchie. **N'ouvre pas Canvas 2D.** **Ne tente aucune instrumentation de
WebView2** avant un véritable hôte Tauri. **Ne corrige pas l'échec de `B0` et
ne supprime rien** dans `src-tauri/target/`. **Ne teste pas l'inter-volume** :
cela suppose d'écrire hors du dépôt, ce qui est réservé à Sébastien. **Ne
retouche aucune preuve de `TASK-0013` ni de `TASK-0014`.** Ne fusionne rien, ne
crée ni PR, ni release, ni étiquette.
