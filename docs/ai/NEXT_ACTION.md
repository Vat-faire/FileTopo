# Prochaine action

## Implémenter `TASK-0020` — relations inter-cerveaux explicites

- **Statut de la tâche :** **`APPROVED`** le 2026-09-02, sous le GO technique
  de l'orchestrateur
- **Fiche :** [`TASK-0020`](../tasks/TASK-0020-interbrain-relations.md),
  **§4 GELÉE** — stockage, endpoint `cek1`, modèle relationnel, jeu synthétique
  `XBR-1`, critères `M1` à `M12`
- **Décision produit :**
  [`DEC-0018`](../decisions/DEC-0018-explicit-interbrain-relations.md),
  fonction **`F-041`**, `MVP`
- **Branche :** `build/v0.2-a5-interbrain-relations`, créée depuis le tip
  **contrôlé** `8d1e27151f53d082551e05b00816100cb790542b`
- **Action unique :** **écrire la tranche**, dans le périmètre écrit de §2, et
  rien d'autre

### Ce qui est déjà acquis, et ne se rejuge pas

`TASK-0019` est **`VERIFIED`** depuis le 2026-09-02 —
[`ACTION-0031`](../reviews/ACTION-0031-independent-recontrol.md), réserve
**`X6` `CLOSED`**, `ACTION-0030` **`CLOSED`**, `HEAD` contrôlé `8d1e271`. Le
verdict a été **rendu par l'orchestrateur** et **enregistré** par l'exécuteur.

`X5` a été **étendue** en conséquence : les **six** preuves de `TASK-0019`
rejoignent la liste protégée, qui passe de **8** à **14** noms, tenue à la
porte Rust, dans `runArtifacts.ts`, et dans un **seul** fichier PowerShell
dot-sourcé.

### Ce que la tranche doit produire

- magasin commun **`brains/interbrain/relations.sqlite`**, distinct du
  catalogue et des magasins intra-cerveau, qu'aucun rebuild ne supprime;
- endpoint versionné **`cek1|<brain_id>|<relative_path>`**, résolu à la lecture;
- modèle : deux extrémités, **deux cerveaux différents**, un type, une
  provenance `DETERMINISTIC` **ou** `APPROVED`, sans troisième valeur;
- **`XBR-1`** : 6 déterministes, 0 approuvée, 4 suggestions `pending`;
- quatre commandes **`map_*`** seulement;
- arêtes qui **traversent** réellement les territoires, panneau qui sépare
  interne et inter-cerveaux, navigation vers un cerveau **hors de la vue**;
- **`M12` en deux passes** dans le vrai `WebView2`, variant **neuf**, plus les
  régressions `J12` intra et `L12` composée sous des noms `TASK-0020`.

### Ce qui reste interdit

- **Aucune détection automatique**, aucune heuristique, aucun glisser-déposer,
  aucun éditeur manuel de relations.
- **Aucune fusion de cerveaux**, jamais.
- **Aucune révocation `P-04`**, aucune recherche `P-08`, aucun filtre, aucun
  watcher, aucun journal, aucun vu/non-vu, aucune vue sauvegardée.
- **Aucune persistance de vue composée** — `P-19` entière.
- **Aucune campagne `H9`**, aucun seuil. `R8` entière.
- **`I-E` complète** hors périmètre; `cek1` est le repli déterministe déclaré.
- **`B0` n'est pas corrigé**; rien n'est nettoyé dans `src-tauri/target/`.
- **Aucune nouvelle dépendance** — sinon **`BLOCKED` avant installation**.
- **Aucune suppression** du bac à sable, d'un variant, du catalogue, d'un
  magasin de relations ou d'une preuve protégée.
- **Aucune fusion vers `main`, PR, release, étiquette, `force push`**, aucune
  réécriture d'historique.

**`TASK-0020` se terminera `IMPLEMENTED`. L'exécuteur ne s'attribue pas
`VERIFIED`.**
