# docs/decisions — Décisions du projet

**Décisions vérifiées :** `DEC-0001` (nom FileTopo), `DEC-0002` (MIT),
`DEC-0003` (Tauri/Rust/React), `DEC-0004` (SQLite et modèle de données),
`DEC-0005` (PixiJS/WebGL et relief). `DEC-0006` (reconstruction sur place)
est `IMPLEMENTED`.

**Décisions approuvées le 2026-08-31**, porte P2 de
[TASK-0011](../tasks/TASK-0011-functional-architecture-baseline.md) franchie
par Sébastien :

| Fiche | État | Ce qui est retenu |
|---|---|---|
| [DEC-0007](DEC-0007-rebuild-tech-stack.md) | `APPROVED` | Option **B** : Tauri 2, Rust stable, React, TypeScript et SQLite conservés; seul le rendu évolue |
| [DEC-0008](DEC-0008-hierarchical-rendering.md) | `APPROVED` | Option **A** : HTML/SVG avec virtualisation et niveaux de détail au MVP; Canvas 2D seulement si `B2` réfute A; WebGL différé |
| [DEC-0009](DEC-0009-data-model-and-relations.md) | `APPROVED` | **I-E** et **R-C** : l'heuristique reste une suggestion et ne préserve jamais automatiquement l'identité ni l'état |
| [DEC-0010](DEC-0010-indexing-and-watching.md) | `APPROVED` | **W-B** avec repli **W-C**; application différentielle **U-B** |
| [DEC-0011](DEC-0011-brain-isolation-and-migrations.md) | `APPROVED` | Stockage **S-C**; **M-C** cible conditionnelle à `B1`, **M-B** repli obligatoire si `B1` échoue |
| [DEC-0012](DEC-0012-ai-architectural-boundary.md) | `APPROVED` | Frontière **F-D** : aucune IA, extraction, embeddings, RAG ni GraphRAG dans le noyau MVP |

**`APPROVED` fixe une direction; ce n'est pas une preuve.** Aucune de ces six
fiches n'a été validée par une exécution : rien n'a été construit, testé ni
mesuré. `M-C` et l'option A restent conditionnées aux bancs d'essai `B1` et
`B2`, spécifiés par [TASK-0012](../tasks/TASK-0012-technical-risk-gates.md),
qui reste `PROPOSED`.

**Exception humaine consignée.** `DEC-0012` ne cite aucune source primaire
externe. Sébastien a accepté cette absence le 2026-08-31 : c'est une décision
**interne de périmètre**, fondée sur la vision approuvée, et l'absence de
source reste déclarée dans la fiche.

Aucune décision n'autorise une réservation, un achat, une publication ni une
ligne de code de production.

## Rôle

Consigner les décisions qui engagent le projet, avec leur date, leur motif et
les options écartées, afin que personne n'ait à les redécouvrir ni à les
rejouer.

## Ce qui mérite une fiche

- Nom public du projet.
- Licence.
- Plateformes cibles.
- Pile technologique et format de stockage de l'index.
- Modèle de données et modèle de relief.
- Toute règle qui contraint durablement la suite.

## Nommage

`DEC-XXXX-<slug>.md`, numérotation à quatre chiffres, dans l'ordre de décision.

## Gabarit

```markdown
# DEC-XXXX — <titre>

- **Date :** AAAA-MM-JJ
- **Statut :** PROPOSED | APPROVED | IN_PROGRESS | BLOCKED | IMPLEMENTED | VERIFIED | REJECTED | DEFERRED
- **Phase :** <numéro>
- **Décideur :** <humain ayant donné le GO>
- **replaced_by :** <DEC-YYYY ou vide>

## Contexte
Ce qui a rendu la décision nécessaire.

## Options examinées
| Option | Avantages | Inconvénients |
|--------|-----------|---------------|

## Décision
Ce qui est retenu, en une phrase.

## Motif
Pourquoi cette option et pas les autres.

## Conséquences
Ce que cela impose ou interdit pour la suite.

## Preuves
Sources, mesures ou constats à l'appui. « Non testé » si rien n'a été vérifié.
```

## Règles

- Une fiche n'est pas modifiée après avoir atteint `VERIFIED` : elle est
  **remplacée** par une nouvelle fiche, et son champ `replaced_by` pointe vers
  la fiche remplaçante (ex. `DEC-0002`). Renseigner `replaced_by` sur une fiche
  `VERIFIED` est la **seule** modification permise, et seulement sous GO
  humain. Trois l'ont été le 2026-08-31 : `DEC-0003` → `DEC-0007`,
  `DEC-0004` → `DEC-0009`, `DEC-0005` → `DEC-0008`; aucun autre contenu de
  `DEC-0001` à `DEC-0006` n'a changé.
- Une fiche `APPROVED` fixe une direction. Elle ne devient `IMPLEMENTED` qu'une
  fois le code correspondant écrit, ni `VERIFIED` avant un contrôle
  indépendant sur preuves.
- Une décision locale et réversible peut être prise sous l'autorisation
  permanente du 2026-08-25. Une fixation externe ou irréversible requiert le
  GO humain spécial prévu par les règles du projet.
- Une décision sans preuve est marquée comme telle.
