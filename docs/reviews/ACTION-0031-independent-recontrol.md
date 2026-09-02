# ACTION-0031 — Re-contrôle indépendant de TASK-0019 : clôture de X6, TASK-0019 VERIFIED

- **Date :** 2026-09-02
- **Objet :** **re-contrôle indépendant** de la correction de la réserve `X6`
  d'[`ACTION-0030`](ACTION-0030-independent-control.md), et **rien d'autre** —
  le fond de `L1` à `L12` avait déjà été accepté par `ACTION-0030` §2 et n'a
  **pas** été rouvert
- **Contrôleur :** **orchestrateur technique**, instance **distincte** de
  l'exécuteur de `TASK-0019` et de l'exécuteur de la correction `X6`
- **Rédacteur de la présente fiche :** Claude Code, **exécuteur**, sous le GO
  technique de l'orchestrateur ouvrant `TASK-0020`. **Cette fiche enregistre un
  verdict rendu par l'orchestrateur; elle ne le rend pas, et l'exécuteur ne
  s'attribue rien.**
- **`HEAD` contrôlé :** **`8d1e27151f53d082551e05b00816100cb790542b`**, tip de
  `build/v0.2-a4-composed-view`
- **Verdict :** **`APPROVED`**

## 1. Le verdict, tel qu'il a été rendu

| Élément | État attribué par l'orchestrateur |
|---|---|
| Réserve `X6` | **`CLOSED`** |
| `ACTION-0030` | **`CLOSED`** |
| `TASK-0019` | **`VERIFIED`** |
| `HEAD` contrôlé | `8d1e27151f53d082551e05b00816100cb790542b` |

**`TASK-0019` est la cinquième tâche `VERIFIED` de l'étape A**, après
`TASK-0015`, `TASK-0016`, `TASK-0017` et `TASK-0018`. Comme les précédentes,
elle l'est **sur preuves** et **par une instance distincte de l'exécuteur**.

## 2. Ce que la clôture de `X6` emporte

`X6` ne disait pas que la vue composée était fausse. Elle disait qu'une
**cible nommée n'avait pas été atteinte** : `L12` étape 7 exige l'**acte** —
approuver `S-005` dans Alpha **pendant que `C2` est affichée** — et cet acte
n'avait pas eu lieu, parce que le bac à sable persistant portait déjà
l'approbation d'un run antérieur.

La correction n'a **rien supprimé**. Elle a ajouté un **espace de noms** :
`FILETOPO_SANDBOX_VARIANT` résout
`<dépôt>/.filetopo-sandbox/variants/<variant>`, **toujours sous le même
répertoire**, la variable absente laissant le comportement **exactement**
inchangé. La valeur est un **nom**, jamais un chemin — basename ASCII
`[A-Za-z0-9_-]`, 1 à 64 caractères — et tout le reste est une **erreur
explicite**, jamais un repli silencieux.

`L12` a ensuite été **rejoué en entier**, deux passes, deux processus réels,
fermeture et redémarrage réels, et l'étape 7 a eu lieu pendant que `C2`
[Alpha, Gamma] était affichée :

| Ce qu'il fallait voir | Observé |
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

**`X5` a tenu pendant l'opération** : les **huit** preuves protégées de
`TASK-0016`, `TASK-0017` et `TASK-0018` sont **bit-for-bit inchangées**. Seuls
les deux artefacts `L12` de `TASK-0019` — tâche alors **non** `VERIFIED` — ont
été remplacés par la preuve corrigée de cette **même** tâche.

## 3. Conséquence directe — `X5` s'étend, appliquée par `TASK-0020` §5

`TASK-0019` étant désormais `VERIFIED`, **ses preuves entrent à leur tour dans
la liste protégée**, et la règle instaurée le 2026-09-01 s'applique sans
retouche :

> **Une exécution d'une tâche ultérieure ne remplace jamais la preuve canonique
> d'une tâche antérieure `VERIFIED`.**

Six artefacts rejoignent la protection :

| Preuve désormais protégée | Ce qu'elle porte |
|---|---|
| `TASK-0019-J12-relations-regression-webview2.json` | `J12` intra-cerveau, rejoué sur le runtime composé |
| `TASK-0019-K11-readonly-regression-webview2.json` | lecture seule, isolation, `L2` |
| `TASK-0019-K12-foundation-regression-webview2-pass1.json` | fondation multi-cerveaux, passe 1 |
| `TASK-0019-K12-foundation-regression-webview2-pass2.json` | fondation multi-cerveaux, passe 2 |
| `TASK-0019-L12-composed-view-webview2-pass1.json` | `L12` étapes 1 à 14, vrai `WebView2` |
| `TASK-0019-L12-composed-view-webview2-pass2.json` | `L12` étape 17, après redémarrage réel |

La liste protégée passe donc de **8** à **14** noms, à la porte Rust
`write_run_artifact`, dans `src/map/runArtifacts.ts`, et dans **les trois
scripts PowerShell** qui pourraient supprimer un artefact avant un rejeu.
**Aucun runtime `TASK-0020` n'écrit sous un nom `TASK-0019`.**

## 4. Ce que ce verdict n'emporte pas

- Il ne rouvre **rien** de `L1`–`L12`, déjà accepté par `ACTION-0030` §2.
- Il ne rend **aucune** relation inter-cerveaux acquise : c'est `TASK-0020`.
- Il ne rend **aucune** persistance de vue composée acquise : `P-19` reste
  entière, la composition reste de session.
- Il ne lève **aucune** limite déclarée : `B0` n'est pas corrigé, `R8` reste
  entière, aucun seuil de performance n'existe.
- Il ne porte **aucune** autorisation de fusion vers `main`, de `PR`, de
  release, d'étiquette, de `force push` ni de réécriture d'historique.

## 5. Preuves

- `docs/performance/runs/TASK-0019-L12-composed-view-webview2-pass1.json`
- `docs/performance/runs/TASK-0019-L12-composed-view-webview2-pass2.json`
- `docs/performance/runs/TASK-0019-J12-relations-regression-webview2.json`
- `docs/performance/runs/TASK-0019-K11-readonly-regression-webview2.json`
- `docs/performance/runs/TASK-0019-K12-foundation-regression-webview2-pass{1,2}.json`
- `src-tauri/src/map/sandbox.rs` — variant, validation, confinement, six tests
- `docs/tasks/TASK-0019-composed-multibrain-view.md` §7
- `git` : `bcbc4aa` (gel) → `6dd3585` (code) → `8bd0bba` (correction `X6`) →
  `8d1e271` (tip contrôlé)
