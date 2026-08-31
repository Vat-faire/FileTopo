# HANDOFF — passage de relais

- **Dernière mise à jour :** 2026-08-31
- **Branche active :** `spike/v0.2-technical-risk-gates`, publiée sur origin
- **Dernière tâche vérifiée :** `TASK-0012`, **`VERIFIED`** le 2026-08-31, sur
  contrôle indépendant [`ACTION-0021`](../reviews/ACTION-0021-independent-control.md),
  **avec neuf réserves `R1` à `R9` maintenues**
- **Tâche préparée, NON exécutée :** `TASK-0013`, **`PROPOSED`**
- **Tâche IN_PROGRESS :** aucune

## Où en est le projet

La porte **P3 est franchie** et `TASK-0012` est **close** : cinq bancs d'essai,
cinq verdicts, un contrôle indépendant accepté. Les verdicts sont devenus des
décisions, dans
[DEC-0013](../decisions/DEC-0013-post-risk-gate-technical-arbitration.md).

La suite technique est décidée mais **non ouverte** : `TASK-0013` — un `B2 bis`
— est spécifiée, `PROPOSED`, et attend un GO d'exécution.

## Ce qu'il faut savoir en six lignes

1. **`M-B` est la baseline de migration.** Copie de sûreté **de fichier** sur
   base **quiescée**, migration transactionnelle **en place**, restauration si
   échec. `M-C` naïve est **réfutée**, preuve de corruption à l'appui; `M-C`
   durcie reste une alternative **documentée**, jamais la baseline.
2. **Le `M-B` mesuré n'exerçait pas l'API SQLite Online Backup** : c'était une
   copie de fichier. Ne jamais écrire le contraire.
3. **Canvas 2D n'est pas ouvert.** HTML/SVG accessible reste la direction. Le
   plafond universel de 3 000 blocs est **abandonné** : budget de rendu
   **auto-régulé** + étude d'un **calepin squarifié**.
4. **Identité : la paire `VolumeSerialNumber` + `FileId` est obligatoire**,
   `FileId` seul **interdit**. L'inter-volume reste **NON TESTÉ**.
5. **Rien n'est supprimé** du cache incrémental de `src-tauri/target/` : il faut
   le conserver ou le renommer avant tout renouvellement, dans une tâche
   distincte, pour préserver la reproduction de la panique du compilateur.
6. **L'identité après hydratation est une question ouverte**, et son risque est
   **requalifié** : perte potentielle d'état utilisateur **non
   reconstructible**, possiblement **en masse**. À fermer **avant**
   l'identité persistante et l'état vu/non vu.

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
| `spike/v0.2-technical-risk-gates` | voir `git rev-parse HEAD`, égal à `origin/` |

Aucune fusion, aucune PR, aucune release, aucune étiquette, aucun `force push`.

## Points ouverts

| # | Point | Ce qui est demandé |
|---|---|---|
| 1 | **Texte intégral de `R1` à `R9`** absent du dépôt | L'orchestrateur le joint au dossier `ACTION-0021`; la lacune est déclarée, pas comblée |
| 2 | **Réserve `SYN-100K`** : `B2` ne falsifie pas littéralement `DEC-0008` | Fermée par `TASK-0013`, une fois approuvée |
| 3 | **`B3`, inter-volume non observé** | Écrire hors du dépôt reste **réservé à Sébastien**. Point conservé **NON TESTÉ** |
| 4 | **`B0`, échec non corrigé** | Tâche distincte, **avec conservation préalable** du cache fautif |
| 5 | **`B4`, question 3 ouverte** | À fermer **avant** l'identité persistante et l'état vu/non vu |

## Prochaine action unique

`ACTION-0022` — examiner
[TASK-0013](../tasks/TASK-0013-b2-bis-layout-and-render-budget.md), puis donner
le GO d'exécution ou renvoyer la fiche avec des corrections motivées.

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
docs/ai/NEXT_ACTION.md. `TASK-0012` est **close et `VERIFIED`** : **ne rejoue
aucun banc d'essai**. Les arbitrages sont dans `DEC-0013` — lis-la avant de
proposer quoi que ce soit sur la migration, le rendu ou l'identité.

**N'écris aucune ligne de code de production** — la porte P4 n'est pas
franchie. **N'ouvre pas Canvas 2D.** **Ne corrige pas l'échec de `B0` et ne
supprime rien** dans `src-tauri/target/`. **Ne teste pas l'inter-volume** :
cela suppose d'écrire hors du dépôt, ce qui est réservé à Sébastien.
**N'exécute pas `TASK-0013`** sans GO : elle est `PROPOSED`. Ne fusionne rien,
ne crée ni PR, ni release, ni étiquette.
