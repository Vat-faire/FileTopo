# Prochaine action

## ACTION-0019 — Examen humain final et décision P2 après corrections

- **Statut :** PROPOSED
- **Responsable :** Sébastien
- **Action unique :** examiner la baseline de `TASK-0011` **après application des quatre corrections du 2026-08-31**, puis franchir ou refuser la porte P2 en décidant l'état de `TASK-0011` et celui de chacune des décisions `DEC-0007` à `DEC-0012`.
- **Résultat attendu :** `TASK-0011` passe à VERIFIED ou reçoit de nouvelles corrections motivées; chaque décision de `DEC-0007` à `DEC-0012` reçoit un état décidé par Sébastien.
- **Corrections à examiner :** périmètre MVP porté à 31 / 4 / 4 avec `F-024` et `F-033` au MVP; recommandation de rendu inversée vers HTML/SVG avec virtualisation et niveaux de détail, Canvas 2D conditionné à un banc d'essai et WebGL différé; stratégie d'identité `I-E` où aucune heuristique ne peut préserver l'identité, le vu/non-vu ni le journal; `M-C` maintenue comme direction proposée mais conditionnée à un banc d'essai synthétique Windows, `M-B` restant le repli. Détail en section 17 de la [fiche TASK-0011](../tasks/TASK-0011-functional-architecture-baseline.md).
- **Points restant ouverts :** le plafond de blocs DOM/SVG est **non testé** et n'est pas une capacité déclarée; les bancs d'essai `B1` et `B2` de [TEST_STRATEGY.md](../architecture/TEST_STRATEGY.md) §6.1 n'ont pas été exécutés; l'ambiguïté des attributs infonuagiques doit être résolue avant leur implémentation; le journal USN reste une piste différée.
- **Interdit :** ne pas écrire de code, de test ni de dépendance; ne pas démarrer une tâche d'implémentation; ne pas modifier `DEC-0001` à `DEC-0006`; ne pas faire passer une décision à un autre état sans GO de Sébastien.
