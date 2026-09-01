# Prochaine action

## Contrôle indépendant de TASK-0018

- **Statut de la tâche :** **`IMPLEMENTED`** le 2026-09-01 — **`VERIFIED` non
  attribué**, l'exécuteur ne s'auto-vérifie pas
- **Responsable :** une instance **distincte de l'exécuteur**, se prononçant
  **sur preuves**
- **Action unique :** **contrôler `TASK-0018`** sur les critères **gelés
  `K1` à `K12`** de sa §4.8, contre les preuves publiées.
- **Fiche :** [`TASK-0018`](../tasks/TASK-0018-multibrain-foundation.md), §7
- **Décision fondatrice :**
  [`DEC-0017`](../decisions/DEC-0017-multibrain-and-composed-views.md)
- **Branche :** `build/v0.2-a3-multibrain-foundation`

### Ce qu'il faut trancher

- **Le gel précède-t-il le code ?** `51bb687` (gel `K1`–`K12`) puis `4cb1cf4`
  (premier code) puis `2424ef2` (preuves). Aucun critère retouché après le
  premier résultat.
- **`K3` — l'isolation est-elle STRUCTURELLE ?** À lire dans la **disposition
  du stockage** et dans le **schéma d'index version 2**, pas dans le TypeScript
  : `brains/<brain_id>/…`, `map_meta.brain_id`, et `open_store` qui refuse un
  index construit pour un autre cerveau. Le test qui le prouve **copie
  réellement** l'index d'Alpha à la place de celui de Gamma.
- **`K5` — un `node_id` peut-il fuir ?** Les commandes de nœud prennent un
  `BrainNodeRef`. Une référence frappée dans un autre cerveau est **refusée**,
  pas résolue.
- **`K6` — Alpha et Gamma sont-ils indépendants sur la MÊME fixture ?** Deux
  magasins de relations, deux espaces de clés disjoints, et une approbation
  d'un côté qui ne bouge rien de l'autre.
- **`K10` et `K12` — la frappe est-elle réelle ?** `activationIsTrusted` et
  `keydownIsTrusted` à `true`, **0** appel programmatique à `click()` et **0**
  `dispatchEvent` de type `click`, sur les quatre bascules.
- **`K9` — le redémarrage est-il réel ?** Deux passes, deux processus, deux
  artefacts. La passe 2 ne prouve rien de la passe 1 sinon que le catalogue y
  a survécu.
- **Que rien de gelé n'a bougé :** aucun critère `H`, `J` ou `K`, aucune
  fixture, aucune règle, aucun artefact publié de `TASK-0016` ou `TASK-0017`.

### Ce qui est déclaré manquant, et ne doit pas être compté comme tenu

- **`J12` n'a PAS été rejoué dans l'hôte** — le rejouer aurait écrasé la preuve
  publiée d'une tâche `VERIFIED`. **Non testé, déclaré.**
- **Aucune mesure de performance, aucun seuil.** `R8` entière.
- **La persistance de la vue reste `P-19`** : l'état de session ne survit pas
  au redémarrage, et rien ne le prétend.
- **La révocation de `P-04` n'est toujours pas implémentée.** `P-04` demeure
  **PARTIELLE**.
- **`B0` s'est reproduit une quatrième fois**, non corrigé, rien supprimé dans
  `src-tauri/target/`.

### Ce qui reste interdit

- **Ne pas afficher plusieurs cerveaux dans le même graphique** — `TASK-0019`.
- **Ne pas créer de relation inter-cerveaux** — `TASK-0020`.
- **Aucune racine utilisateur, aucun folder picker, aucune donnée réelle,
  aucune nouvelle dépendance.**
- **Aucune fusion vers `main`, PR, release, étiquette, `force push`**, aucune
  réécriture d'historique.
