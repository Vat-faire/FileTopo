# `B2 ter` — contrôleur de budget de rendu corrigé

**Spike jetable.** Banc d'essai de
[TASK-0014](../../docs/tasks/TASK-0014-b2-ter-budget-controller.md).

> **Ce code ne sera pas livré.** Il n'est lié à aucun composant de `src/`, et
> la porte `P4` interdit toute ligne de code de production. Il existe pour
> **valider ou réfuter** une correction, pas pour être repris.

## Ce que ce banc éprouve, et rien d'autre

`TASK-0013` a **réfuté** `F4` — « le budget auto-régulé tient la cible ».
`ACTION-0023` a accepté cette réfutation; `DEC-0014` D en tire que **le
contrôleur écrit n'est pas adopté**, et `DEC-0014` E que **le principe est
conservé**.

Deux causes mesurées, et deux seulement, sont corrigées ici :

| Cause | Avant | Après |
|---|---|---|
| **1** — la zone morte tolérait un régime stable **sous** la cible | `margeHaute = 1,15` → déclenchement à 38,33 ms, soit **26,1 ips** | seuil lent **exactement `1000 / 30` ms**. **Aucune marge** |
| **2** — l'affinage continu coûtait **trois fenêtres par niveau** | tout mouvement armait le refroidissement | plusieurs mouvements **de même sens** s'enchaînent librement; le refroidissement n'empêche qu'une **inversion**, pendant **2 fenêtres** |

Rien d'autre ne change : ni la cible, ni la fenêtre de 12 images, ni l'échelle
des seuils, ni le plancher de **2 400 px²**, ni le niveau initial.

## Fichiers

| Fichier | Rôle |
|---|---|
| `budget2.mjs` | **Le contrôleur corrigé.** Configuration figée avant mesure. Source unique : importé par Node **et** injecté dans la page |
| `map3.html` | Page de mesure. Rendu, virtualisation, ARIA et clavier **repris sans modification** de `b2bis-layout-and-budget/map2.html` |
| `run-b2ter.mjs` | Pilote CDP. Trois phases : contrôleur, plancher, contrôle ponctuel `CAL-A` |
| `replay-budget2.mjs` | Contrôle de déterminisme `G5`, hors navigateur, + contrôle statique d'absence d'écriture |
| `verdicts2.mjs` | Calcule les verdicts `G1` à `G9` **par script**, jamais à la main |
| `tables2.mjs` | Produit les tableaux Markdown de `PERF-0005` à partir des mesures brutes |

Le générateur d'arborescences (`../fixtures/synthetic-shapes.mjs`) et les
calepins (`../b2bis-layout-and-budget/calepins.mjs`) sont **repris tels
quels** : la seule variable de cette campagne est le contrôleur.

## Ce que ce banc ne fait pas

- **Aucune tentative WebView2** — `DEC-0014` F l'interdit.
- **Aucun Canvas 2D, aucun WebGL.**
- **Aucune comparaison de calepins** : `CAL-B` est fixé; `CAL-A` n'apparaît que
  dans un contrôle ponctuel qui ne fonde aucun critère.
- **Aucune donnée réelle.** Tout est produit par un générateur à graine fixe
  **20260831**, identique à `TASK-0013`.
- **Aucune écriture hors du dépôt** : tout va sous `spikes/.work/b2ter/`,
  ignoré par Git.

## Lancer

```
node run-b2ter.mjs edge                    # les trois phases, 5 exécutions
node run-b2ter.mjs chrome controleur       # contrôle de continuité
node replay-budget2.mjs                    # déterminisme G5
node verdicts2.mjs                         # verdicts G1 à G9
node tables2.mjs                           # tableaux de PERF-0005
```
