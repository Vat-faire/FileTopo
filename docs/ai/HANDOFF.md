# HANDOFF — passage de relais

- **Dernière mise à jour :** 2026-08-31
- **Branche active :** `spike/v0.2-render-budget`, publiée sur origin
- **Dernière tâche vérifiée :** `TASK-0012`, **`VERIFIED`** le 2026-08-31, sur
  contrôle indépendant [`ACTION-0021`](../reviews/ACTION-0021-independent-control.md),
  **avec neuf réserves `R1` à `R9` maintenues**
- **Tâche livrée, NON vérifiée :** `TASK-0013`, **`IMPLEMENTED`** le 2026-08-31
- **Tâche IN_PROGRESS :** aucune

## Où en est le projet

Les portes **P3** et **P3 bis** sont **franchies**. `TASK-0013` — le `B2 bis` —
a été **exécutée de bout en bout** : deux calepins comparés, un budget de rendu
auto-régulé éprouvé, `SYN-100K` réellement joué, accessibilité recontrôlée.
**Huit verdicts, dont deux réfutations, publiées sans atténuation.**

La tâche attend son **contrôle indépendant** : `ACTION-0023`.

## Ce qu'il faut savoir en huit lignes

1. **Le calepin décide, pas le nombre de blocs.** À nombre de nœuds DOM
   **identique**, le pavage squarifié rend `SYN-WIDE` **5,5 fois** plus rapide
   que le découpage alterné — 119,05 ips contre 21,79 — et ramène le rapport
   d'aspect médian de **3 987,79** à **1,01**.
2. **Le squarifié ne coûte rien ailleurs** : de **+20 %** à **+98 %** d'images
   par seconde sur les deux autres formes. Son prix est **au calcul**, jusqu'à
   **5,9 fois** le temps de calepinage, payé une fois par arborescence.
3. **`SYN-100K` a été joué.** 120,48 ips et 8,2 ms p95 sous budget, avec
   **3 461 blocs construits pour 100 000 indexés**. La réserve `R1` est
   **comblée quant au protocole**; l'exécuteur **ne la déclare pas levée**.
4. **`F4` est réfutée.** Le budget n'oscille jamais et ne franchit jamais son
   plancher, mais son contrôleur tolère un régime stable à **26,1 ips** alors
   qu'il vise 30, et met jusqu'à **6 s** à cesser d'agréger. **Deux constantes
   à corriger, pas une refonte.**
5. **`F8` est réfutée.** WebView2 n'est pas instrumentable sans hôte
   embarqueur. Substitut déclaré : **Edge 152.0.4191.53**; contrôle de
   continuité : **Chrome 151.0.7922.175**. **L'écart avec WebView2 est NON
   MESURÉ.**
6. **Le moteur pèse plus lourd que le calepin sur deux formes.** Chrome rend
   **0,50 à 0,71** fois les ips d'Edge, sur la même machine. **`R8` sort
   renforcée, pas levée.**
7. **L'accessibilité est intacte** : 32 / 32 scénarios, les deux calepins,
   budget actif. `CAL-B` trie une **copie** des enfants, donc `aria-posinset`,
   `aria-setsize` et l'ordre clavier sont identiques à `CAL-A`.
8. **Aucune décision n'est prise.** Aucune fiche `DEC` n'a été modifiée, aucune
   réserve levée, Canvas 2D n'est pas ouvert, **P4 n'est pas franchie**.

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
| `spike/v0.2-render-budget` | branche de travail de `TASK-0013`, voir `git rev-parse HEAD`, égal à `origin/` |

Aucune fusion, aucune PR, aucune release, aucune étiquette, aucun `force push`,
aucune réécriture d'historique, aucune suppression de branche.

## Points ouverts

| # | Point | Ce qui est demandé |
|---|---|---|
| 1 | **`TASK-0013` est `IMPLEMENTED`** | Contrôle indépendant `ACTION-0023`, par une instance **distincte de l'exécuteur** |
| 2 | **`F4` réfutée** — le contrôleur de budget ne tient pas la cible | Une décision ultérieure devra trancher les deux constantes en cause; **aucune n'a été retouchée** |
| 3 | **`F8` réfutée** — WebView2 non mesuré | Mesurer dans WebView2 exigera un **hôte embarqueur**, donc une dépendance préparée d'avance et du code d'hôte : **hors P4** |
| 4 | **Réserves `R1` à `R9`** | Texte intégral désormais **joint en annexe** d'`ACTION-0021`. Aucune n'est levée; seul un contrôle indépendant peut le faire |
| 5 | **`B3`, inter-volume non observé** | Écrire hors du dépôt reste **réservé à Sébastien**. Point conservé **NON TESTÉ** |
| 6 | **`B0`, échec non corrigé** | Tâche distincte, **avec conservation préalable** du cache fautif |
| 7 | **`B4`, question 3 ouverte** | À fermer **avant** l'identité persistante et l'état vu/non vu |

## Prochaine action unique

`ACTION-0023` — **contrôler les preuves de `TASK-0013`**, puis attribuer
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

Pour rejouer le banc `B2 bis`, voir
[`spikes/b2bis-layout-and-budget/README.md`](../../spikes/b2bis-layout-and-budget/README.md).
Les mesures brutes ne sont **pas** commitées : elles vivent sous
`spikes/.work/b2bis/`, ignoré par Git, et sont reproductibles.

## Message court pour Claude Code

Lis seulement CLAUDE.md, docs/ai/START_HERE.md, docs/ai/CURRENT_STATE.md et
docs/ai/NEXT_ACTION.md. `TASK-0012` est **close et `VERIFIED`**; `TASK-0013`
est **`IMPLEMENTED` et attend un contrôle indépendant**. **Ne rejoue aucun banc
d'essai** sans GO, et **ne t'attribue pas `VERIFIED`**.

Les arbitrages en vigueur sont dans `DEC-0013`. **Aucune décision n'a été prise
par `TASK-0013`** : ni le calepin du produit, ni l'adoption d'un budget.

**N'écris aucune ligne de code de production** — la porte P4 n'est pas
franchie. **N'ouvre pas Canvas 2D.** **Ne corrige pas l'échec de `B0` et ne
supprime rien** dans `src-tauri/target/`. **Ne teste pas l'inter-volume** :
cela suppose d'écrire hors du dépôt, ce qui est réservé à Sébastien. Ne
fusionne rien, ne crée ni PR, ni release, ni étiquette.
