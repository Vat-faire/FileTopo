# Prochaine action

## Re-contrôler `TASK-0019` sur la seule réserve `X6`

- **Statut de la tâche :** **`IMPLEMENTED`** — `VERIFIED` **non attribué**;
  l'exécuteur ne s'auto-vérifie pas
- **Réserve ouverte :** **`X6`**, `OPEN` —
  [`ACTION-0030`](../reviews/ACTION-0030-independent-control.md),
  `CHANGES_REQUIRED` le 2026-09-02
- **Fiche :**
  [`TASK-0019`](../tasks/TASK-0019-composed-multibrain-view.md), **§4 gelée**,
  **§7.2 résultat corrigé**
- **Branche :** `build/v0.2-a4-composed-view`
- **Action unique :** **rendre un verdict sur `X6` uniquement**, par une
  instance **distincte de l'exécuteur**, **sur les preuves publiées** — et rien
  d'autre

### Ce qui n'est PAS rouvert

`ACTION-0030` §2 a **accepté** le fond : gel `bcbc4aa` avant code `6dd3585`,
`L1`–`L11`, `L12` étapes 1–6 et 8–17, `C2`/`C3`, un seul `SVG`, les territoires,
les collisions `DOM` Alpha/Gamma, les relations intra-cerveau seulement, la
mémoire par composition, le clavier réel, le redémarrage réel. **Ne pas le
rejuger.**

### Ce que `X6` demande de contrôler

`L12` étape 7 exigeait **l'ACTE** : « approuver `S-005` dans Alpha et confirmer
Gamma inchangé ». Il a été rejoué. À vérifier dans
`docs/performance/runs/TASK-0019-L12-composed-view-webview2-pass1.json` :

| Ce qu'il faut voir | Valeur déclarée |
|---|---|
| `s005WasPending` | `true` |
| `approvalReplayable` | `true` |
| `approvalError` | `null` |
| Alpha approuvées | `4` → `5` |
| Alpha en attente | `4` → `3` |
| `alphaMovedByExactlyOne` | `true` |
| `gammaStrictlyUnchanged` | `true` |
| `gammaS005StillPending` | `true` |
| `separateStores` | `true` |

Et, autour :

- l'approbation a-t-elle eu lieu **pendant que `C2` [Alpha, Gamma] était
  affichée** — entre l'étape 6 et l'étape 8 ?
- `pass2` porte-t-il le **même** `sandboxRoot` que `pass1`, après une fermeture
  et un redémarrage **réels** ?
- le **confinement** du variant tient-il — `src-tauri/src/map/sandbox.rs`,
  variable absente = chemin historique, refus explicite de tout ce qui n'est pas
  un basename `[A-Za-z0-9_-]` de 1 à 64 caractères, aucun repli silencieux ?
- le libellé publié reste-t-il **non personnel**, sans chemin absolu ?
- **`X5` :** les **huit** preuves protégées `TASK-0016`/`0017`/`0018` sont-elles
  **bit-for-bit inchangées** ?

### Ce qui reste interdit

- **Aucune relation inter-cerveaux** — `TASK-0020`.
- **Aucune persistance de vue composée** — `P-19`.
- **Aucune campagne `H9`**, aucun seuil. `R8` entière.
- **`B0` n'est pas corrigé**; rien n'est nettoyé dans `src-tauri/target/`.
- **Aucune suppression** du bac à sable, de ses variants, du catalogue ou d'un
  magasin de relations.
- **Aucune fusion vers `main`, PR, release, étiquette, `force push`**, aucune
  réécriture d'historique.
