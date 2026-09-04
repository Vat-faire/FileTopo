# Action suivante

## Re-contrôle indépendant ciblé X10 de TASK-0023

Re-contrôler indépendamment la **seule** réserve `X10` d'`ACTION-0038` sur le
commit substantif de correction de `build/v0.2-a7-exact-content-observations` :
ouverture sans suivi du composant final reparse, décision sur la metadata du
handle réellement ouvert, maintien des handles de racine et de répertoires
intermédiaires sans partage écriture/suppression, lecture du même handle,
parcours `read_dir` seulement pendant l'épinglage, trois tests TOCTOU
synchronisés, EC15 régénérée et intégrité des 27 preuves X5. Ne rouvrir aucun
autre élément accepté de `TASK-0023`; `X9` est `CLOSED`, mais `TASK-0023` reste
`IMPLEMENTED`, `ACTION-0038` reste `CHANGES_REQUIRED` et `X10` reste `OPEN`
tant que ce re-contrôle n'a pas conclu. Ne créer aucune `TASK-0024`.
