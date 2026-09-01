# Prochaine action

## Re-contrôle indépendant de TASK-0017

- **Statut :** en attente — `TASK-0017` est **`IMPLEMENTED`**, jamais
  `VERIFIED`
- **Responsable :** une instance **distincte de l'exécuteur**, se prononçant
  **sur preuves**
- **Action unique :** **re-contrôler `TASK-0017` de façon indépendante**, après
  les corrections des réserves `X3` et `X4`, et statuer.
- **Fiche :** [`TASK-0017`](../tasks/TASK-0017-crosscutting-relations.md) —
  gel en §4, résultat en §7, corrections `X3`/`X4` en §9
- **Contrôle enregistré :**
  [`ACTION-0027`](../reviews/ACTION-0027-independent-control.md) — **`OPEN`**
- **Branche :** `build/v0.2-a2-relations`, poussée

### Ce que le re-contrôle doit trancher

- **`X3`** — la création d'une relation `APPROVED` est-elle **structurellement**
  verrouillée ? À vérifier dans le schéma lui-même, pas dans le Rust :
  `suggestion_key` **`UNIQUE`**, **clé étrangère** vers
  `relation_suggestions`, et les **trois déclencheurs**
  `approved_must_match_its_suggestion_on_insert`,
  `..._on_update`, `suggestion_cannot_drift_from_its_relation`. Puis que
  `insert_established` refuse `APPROVED` **sans condition**, et que la
  migration de version 1 **nomme** ce qu'elle écarte plutôt que de l'effacer.
- **`X4`** — la frappe est-elle réelle ? Dans
  `docs/performance/runs/TASK-0017-J12-webview2.json` :
  `activationIsTrusted: true`, `keydownIsTrusted: true`,
  `programmaticClickCalls: 0`, `programmaticClickDispatches: 0`, et
  `selectionFollowedTheRelation: true` **contre l'extrémité lue sur l'entrée
  activée**, confirmée par l'index.
- **Que rien de gelé n'a bougé** : aucun critère `J1` à `J12`, aucune fixture,
  aucune règle.
- **Les cinq défauts de protocole déclarés** — §7.5 et §9.3.
- **Ce qui reste déclaré non prouvé**, §7.9, dont **`P-04` PARTIELLE** faute de
  révocation.

### Rejouer les preuves

    git rev-parse --abbrev-ref HEAD          # build/v0.2-a2-relations
    git log --oneline 33704a1..HEAD
    git show 51a8cac --stat                  # le gel, AVANT tout code
    git show a98676e --stat                  # le premier code de production
    git show 8a259e9 --stat                  # les corrections X3 et X4

    CARGO_INCREMENTAL=0 cargo test --manifest-path src-tauri/Cargo.toml --lib
    pnpm check && pnpm test
    CARGO_INCREMENTAL=0 pnpm tauri build --no-bundle

Pour `J12`, **deux processus**, et **une seule instance de l'application** :

    rm -rf .filetopo-sandbox/relations
    CARGO_INCREMENTAL=0 FILETOPO_AUTO_RELATIONS=1 pnpm tauri dev > run.log 2>&1
    # dans un autre terminal, la vraie frappe clavier :
    pwsh scripts/j12-send-real-key.ps1 -LogPath run.log

### Ce qui reste interdit

- **Ne pas s'attribuer `VERIFIED`** en tant qu'exécuteur.
- **Ne pas ajouter la révocation de `P-04`** : hors du périmètre gelé, réservée
  à une tranche future avec sa propre fiche et son propre GO.
- **Ne pas commencer l'étape B**, ne pas lever `R8`, ne rien conclure sur le
  budget adaptatif, ne pas corriger `B0`.
- **Aucune donnée réelle, aucun sélecteur de dossier, aucune nouvelle
  dépendance.**
- **Aucune fusion vers `main`, PR, release, étiquette, `force push`**, aucune
  réécriture d'historique.
