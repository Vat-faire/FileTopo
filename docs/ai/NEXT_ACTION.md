# Prochaine action

## Contrôle indépendant de TASK-0017

- **Statut :** en attente — `TASK-0017` est **`IMPLEMENTED`**, jamais
  `VERIFIED`
- **Responsable :** une instance **distincte de l'exécuteur**, se prononçant
  **sur preuves**; l'orchestrateur technique peut attribuer `VERIFIED` à cette
  condition
- **Action unique :** **contrôler `TASK-0017` de façon indépendante**, sur les
  preuves publiées, et statuer.
- **Fiche :** [`TASK-0017`](../tasks/TASK-0017-crosscutting-relations.md) —
  gel en §4, résultat en §7
- **Branche :** `build/v0.2-a2-relations`, poussée

### Ce qu'il y a à contrôler

- **Le gel précède le code**, sans exception : `git show 51a8cac --stat` est le
  gel, `git show a98676e --stat` le premier code de production. **Aucun critère
  `J1` à `J12` ne doit avoir bougé après le premier résultat.**
- **`J1` et `J2` sont structurels ou ils ne valent rien** : vérifier qu'il
  n'existe **aucune colonne `provenance`** dans le schéma, **aucune colonne de
  règle** dans `relations_approved`, et que la seule voie vers une ligne
  approuvée passe par `approve`.
- **Les cinq tentatives invalides** de §4.6.4 et leurs motifs observés.
- **`J5` contre l'attendu gelé** de §4.6.3, y compris l'ajustement
  `approved_since_seed`, qui doit être **listé** et non silencieux.
- **`J12`** : `docs/performance/runs/TASK-0017-J12-webview2.json`.
- **`J11`** : `docs/performance/runs/TASK-0017-J11-isolation.json`, et les
  deux tests-gardes `X2`.
- **Les quatre défauts de protocole** déclarés en §7.5, et le fait que la
  campagne publiée provient d'une **exécution unique sur le binaire final**.
- **Ce qui est déclaré non prouvé** en §7.9 — notamment que l'activation au
  clavier d'une entrée de panneau n'a **pas** été jouée par une frappe de
  confiance.

### Rejouer les preuves

    git rev-parse --abbrev-ref HEAD          # build/v0.2-a2-relations
    git log --oneline 33704a1..HEAD
    git show 51a8cac --stat                  # le gel, AVANT tout code
    git show a98676e --stat                  # le premier code de production

    CARGO_INCREMENTAL=0 cargo test --manifest-path src-tauri/Cargo.toml --lib
    pnpm check && pnpm test
    CARGO_INCREMENTAL=0 pnpm tauri build --no-bundle

    rm -rf .filetopo-sandbox/relations       # une seule instance a la fois
    CARGO_INCREMENTAL=0 FILETOPO_AUTO_RELATIONS=1 pnpm tauri dev   # rejoue J12

### Ce qui reste interdit

- **Ne pas s'attribuer `VERIFIED`** en tant qu'exécuteur.
- **Ne pas commencer une tranche suivante** : elle exigera sa propre fiche, ses
  critères gelés et son propre GO.
- **Ne pas commencer l'étape B**, ne pas lever `R8`, ne rien conclure sur le
  budget adaptatif, ne pas corriger `B0`.
- **Aucune donnée réelle, aucun sélecteur de dossier, aucune nouvelle
  dépendance.**
- **Aucune fusion vers `main`, PR, release, étiquette, `force push`**, aucune
  réécriture d'historique.
