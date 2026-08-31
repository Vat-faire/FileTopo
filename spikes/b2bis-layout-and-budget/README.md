# `b2bis-layout-and-budget/` — banc d'essai de TASK-0013

Banc d'essai **jetable** de [TASK-0013](../../docs/tasks/TASK-0013-b2-bis-layout-and-render-budget.md),
exécuté sous le **GO technique de l'orchestrateur** du 2026-08-31, porte
**P3 bis franchie**.

**Ce n'est pas du code de production.** Rien ici n'est destiné à être livré,
importé, compilé ou réutilisé par FileTopo. Les règles d'isolation de
[`spikes/README.md`](../README.md) s'appliquent intégralement : aucun fichier
de production touché, aucun import croisé, aucun manifeste partagé, **aucune
écriture hors du dépôt** — profils de navigateur compris, qui vont sous
`spikes/.work/b2bis/`.

**Aucune dépendance n'a été ajoutée**, ni ici, ni ailleurs. Le moteur est
piloté par le protocole CDP sur le client `WebSocket` **intégré** à Node 24.

## Ce que le banc compare

| Objet | Où |
|---|---|
| `CAL-A` — découpage alterné, **repris sans modification** de `B2` | `calepins.mjs`, `calepinAlterne()` |
| `CAL-B` — pavage **squarifié**, écrit ici d'après sa description publiée | `calepins.mjs`, `calepinSquarifie()` |
| Budget de rendu **auto-régulé** | `budget.mjs` |
| Quatre formes synthétiques, dont **`SYN-100K`** | [`../fixtures/synthetic-shapes.mjs`](../fixtures/synthetic-shapes.mjs) |

## Fichiers

| Fichier | Rôle |
|---|---|
| `map2.html` | Page de mesure : rendu HTML/SVG virtualisé, ARIA, clavier, trajectoire scriptée, protocole du budget. Le rendu et les contrôles sont repris de `B2` pour que la **seule** variable soit le calepin et le budget |
| `calepins.mjs` | Les deux calepins. Source unique : importée par Node **et** injectée dans la page |
| `budget.mjs` | Le contrôleur de budget. Source unique, sans horloge ni aléa |
| `run-b2bis.mjs` | Pilote CDP : quatre phases de mesure, cinq exécutions par mesure |
| `detect-webview2.mjs` | Tentative d'instrumentation de **WebView2**, exigée en premier par §5.4. Conserve commandes, codes de sortie et sorties d'erreur |
| `describe-shapes.mjs` | Décrit les quatre formes et contrôle les deux calepins hors navigateur |
| `replay-budget.mjs` | Contrôle du **déterminisme** du budget : rejeu hors navigateur des traces réellement observées dans la page |

## Injection des sources — pourquoi

Une page ouverte en `file://` ne peut pas importer de module ES : l'origine est
`null` et l'import est refusé. Plutôt que de **recopier** les générateurs et
les calepins dans la page — deux copies qui divergeraient —, `run-b2bis.mjs`
**lit les fichiers source** et les évalue tels quels dans la page, après
retrait des lignes `import` et `export`.

Conséquence utile : le code exécuté dans le moteur est **littéralement** celui
que Node importe. `replay-budget.mjs` s'en sert pour rejouer hors navigateur
les décisions prises dans le navigateur, et vérifier qu'elles coïncident.

## Ordre d'exécution

```
node spikes/b2bis-layout-and-budget/detect-webview2.mjs
node spikes/b2bis-layout-and-budget/describe-shapes.mjs
node spikes/b2bis-layout-and-budget/run-b2bis.mjs edge
node spikes/b2bis-layout-and-budget/run-b2bis.mjs chrome matrice,volumetrie
node spikes/b2bis-layout-and-budget/replay-budget.mjs
```

## Où sont les résultats

Les mesures et les verdicts ne vivent **pas** ici :

- [docs/research/TASK-0013-b2-bis-results.md](../../docs/research/TASK-0013-b2-bis-results.md) — journal, preuves, verdicts `F1` à `F8`;
- [docs/performance/PERF-0004-b2bis-layout-and-budget.md](../../docs/performance/PERF-0004-b2bis-layout-and-budget.md) — mesures.

## Données

**Toutes les données sont synthétiques**, produites par un générateur à graine
fixe (`20260831`). Aucun fichier réel, aucun dossier utilisateur, aucune base
d'un cerveau existant, aucun élément d'une interface privée n'est lu, listé,
copié ni mesuré.
