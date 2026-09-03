# Action suivante

## Re-contrôle indépendant ciblé de X8 / TASK-0022

Re-contrôler indépendamment la **seule** réserve `X8` de
[`ACTION-0035`](../reviews/ACTION-0035-independent-control.md), sur la branche
`build/v0.2-a6-topographic-node-graph`, au commit de correction publié.

Périmètre du re-contrôle, et rien d'autre : la correction est **structurelle**
et non un remplacement littéral — l'identité de tâche est dérivée du nom
d'artefact et de l'ensemble des destinations, non codée en dur; le compte des
preuves protégées est dérivé de la liste, dont la parité avec la garde Rust
canonique est testée; le test de garde échoue bien sur le code contrôlé
`f6f0214`; le rejeu réel `M12` passes 1 et 2 publie
`writesUnderItsOwnTaskOnly: true` et `protectedArtifactCount: 19` sans
affirmation « 14 protected names »; aucun critère de `M12` n'a régressé; les
19 preuves protégées et `main` sont intactes.

Le contrôleur indépendant décide seul si `X8` peut passer de `OPEN` à `CLOSED`,
et si `TASK-0022` peut passer de `IMPLEMENTED` à `VERIFIED`. Ne pas rouvrir le
layout, le schéma 3, `DEC-0024`, `N1` à `N15` ni les fixtures, déjà acceptés.
Ne pas créer `TASK-0023` pendant ce re-contrôle.
