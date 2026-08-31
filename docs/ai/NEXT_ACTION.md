# Prochaine action

## ACTION-0020 — Examen humain de TASK-0012 avant la porte P3

- **Statut :** PROPOSED
- **Responsable :** Sébastien
- **Action unique :** examiner
  [TASK-0012](../tasks/TASK-0012-technical-risk-gates.md), puis l'**approuver
  ou la corriger** avant la porte P3.
- **Résultat attendu :** `TASK-0012` passe à `APPROVED` et la porte P3 est
  franchie, ou la fiche reçoit des corrections motivées et reste `PROPOSED`.
- **Ce qu'il faut examiner :** l'objectif futur unique; les cinq bancs d'essai
  `B0` à `B4` et leurs critères de succès et d'échec; la branche future dédiée
  `spike/v0.2-technical-risk-gates`; les fichiers autorisés et le répertoire
  isolé `spikes/`; la règle d'inventaire de licence avant toute dépendance; les
  conditions d'arrêt immédiat; l'état final `IMPLEMENTED`, jamais `VERIFIED`.
- **État acquis, à ne pas rejouer :** la porte P2 est **franchie** depuis le
  2026-08-31. `TASK-0011` est `VERIFIED`; `DEC-0007` à `DEC-0012` sont
  `APPROVED`; les sept livrables sont approuvés; trois champs `replaced_by`
  sont renseignés.
- **Interdit tant que P3 n'est pas franchie :** n'exécuter aucun banc d'essai;
  ne créer aucune branche de spike; n'installer aucune dépendance; n'écrire ni
  code, ni test, ni mesure; ne modifier aucune fiche `DEC-0001` à `DEC-0012`;
  ne toucher ni `graph/`, ni `main`, ni un verrou de dépendances.
