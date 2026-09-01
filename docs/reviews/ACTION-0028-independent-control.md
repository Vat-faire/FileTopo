# ACTION-0028 — Contrôle indépendant de TASK-0018 : réserve X5, protection des preuves VERIFIED

- **Date :** 2026-09-01
- **Objet :** contrôle indépendant de la **troisième tranche de production** de
  l'étape A, livrée par
  [TASK-0018](../tasks/TASK-0018-multibrain-foundation.md) — fondation
  multi-cerveaux, catalogue, isolation physique, bascule
- **Contrôleur :** **orchestrateur technique**, instance **distincte** de
  l'exécuteur de `TASK-0018`
- **Rédacteur de la présente fiche :** Claude Code, **exécuteur de la
  correction**, sous le GO technique de l'orchestrateur. **Cette fiche
  enregistre un verdict; elle ne le rend pas.**
- **Verdict :** **`CHANGES_REQUIRED`**, une seule réserve : **`X5`**
- **État de `TASK-0018` :** **`IMPLEMENTED`**, et rien de plus. **`VERIFIED`
  n'est pas attribué**, et ne le sera qu'après un **re-contrôle indépendant**

> **Ce que cette fiche est.** L'enregistrement d'un constat indépendant, de la
> réserve qu'il émet, et de la correction exécutée en réponse.
>
> **Ce qu'elle n'est pas.** Elle ne **rend** aucun verdict, et elle ne clôt
> rien. `X5` est **corrigée, pas close** : sa clôture appartient au
> re-contrôle.

## 0. Ce que le contrôle a accepté

- **Le gel précède le code**, sans exception : `51bb687` (gel `K1`–`K12`) est
  antérieur au premier code `4cb1cf4`, lui-même antérieur aux preuves
  `2424ef2`. **Aucun critère `K1` à `K12` n'a été retouché** après le premier
  résultat.
- **`K1` à `K12` sont tenus sur le fond.**
- **L'isolation est STRUCTURELLE** : elle vit dans la disposition du stockage —
  `brains/<brain_id>/…` — et dans le schéma d'index version 2 qui **nomme** le
  cerveau, pas dans une clause du TypeScript.
- **`K6`** — `brain-alpha` et `brain-gamma` lisent la **même** fixture et
  restent indépendants.
- **`K10`** — la frappe est **réelle**.
- **`K9` / `K12`** — le redémarrage est **réel** : deux passes, deux processus,
  deux artefacts.

## 1. Réserve `X5` — l'outillage courant pouvait écraser la preuve d'une tâche VERIFIED

### 1.1 Le constat, tel qu'il a été émis

> Les outils et scénarios du runtime courant peuvent **écraser les artefacts
> canoniques de tâches antérieures déjà `VERIFIED`.**

Trois faits, vérifiables dans le code de `4cb1cf4` :

1. **`runMeasurement()`** parcourt désormais **les cerveaux** de `TASK-0018`,
   mais écrivait encore
   `docs/performance/runs/TASK-0016-H9-webview2.json`, avec `task: TASK-0016`.
   Cette campagne **n'est plus la campagne gelée de `TASK-0016`** : elle couvre
   les cerveaux du catalogue — `quasi-empty` deux fois et `deep` — et **non**
   les quatre fixtures originales.
2. **`relationScenario.ts`** est désormais adapté à `brain-alpha`, mais
   écrivait encore `TASK-0017-J12-webview2.json`.
3. **`write_run_artifact`** utilise une **écriture remplaçante**.

Le rapport de `TASK-0018` reconnaissait lui-même que `J12` n'avait pas été
rejoué **précisément parce que** cela aurait écrasé la preuve `VERIFIED` de
`TASK-0017`. **Le risque était donc réel, pas théorique** — il avait déjà
coûté une preuve non produite.

### 1.2 Pourquoi c'est bloquant

Une preuve publiée est ce sur quoi un contrôle indépendant se prononce. Si
l'exécution d'une tranche ultérieure peut la remplacer **silencieusement**, la
chaîne de vérification du dépôt ne tient plus : `VERIFIED` ne porterait plus
sur un objet stable.

### 1.3 La règle instaurée

> **Une exécution d'une tâche ultérieure ne remplace JAMAIS silencieusement la
> preuve canonique d'une tâche antérieure `VERIFIED`.**

Les artefacts historiques suivants restent **bit-for-bit inchangés** — ni
réécrits, ni supprimés, ni renommés :

- `docs/performance/runs/TASK-0016-H1-H7-verification.json`
- `docs/performance/runs/TASK-0016-H9-webview2.json`
- `docs/performance/runs/TASK-0017-J11-isolation.json`
- `docs/performance/runs/TASK-0017-J12-webview2.json`

**Aucun critère `H` ou `J` gelé n'a été modifié pour y parvenir.**

### 1.4 La correction

**Sur trois plans, dont un structurel.**

| Plan | Ce qui a changé |
|---|---|
| **Structurel — la porte** | `write_run_artifact` **refuse** un nom figurant dans `PROTECTED_RUN_ARTIFACTS`, **avant tout accès au disque**. La règle est tenue à l'unique endroit qui écrit, pas confiée à chaque appelant. |
| **Nommage — une seule orthographe** | `src/map/runArtifacts.ts` porte tous les noms d'artefacts du runtime. Les sept sites d'écriture les importent; plus aucune chaîne dupliquée. |
| **Contenu — l'artefact se déclare** | Chaque artefact migrant porte `task`, `sourceCriterion`, `nature`, `doesNotReplace` et `replacesCanonicalEvidence: false`. |

**Les scénarios migrants, renommés :**

| Ce qui s'exécute | Écrivait | Écrit désormais |
|---|---|---|
| boucle de mesure, par cerveau | `TASK-0016-H9-webview2.json` | `TASK-0018-H9-multibrain-regression-webview2.json` |
| idem, en cas d'abandon | `TASK-0016-H9-webview2-abandon.json` | `TASK-0018-H9-multibrain-regression-webview2-abandon.json` |
| scénario relations, sur `brain-alpha` | `TASK-0017-J12-webview2.json` | `TASK-0018-J12-relations-regression-webview2.json` |
| idem, en cas d'abandon | `TASK-0017-J12-webview2-abandon.json` | `TASK-0018-J12-relations-regression-webview2-abandon.json` |

**La mesure `H9` n'a PAS été rejouée.** `TASK-0018` n'a **aucun critère de
performance** : une campagne complète aurait été coûteuse et n'aurait rien
prouvé. **Aucun seuil n'est posé; `R8` reste entière.**

## 2. Le `J12` de régression, rejoué dans le vrai WebView2

Le code des relations ayant été **substantiellement adapté** par `TASK-0018`,
la tranche déclarait `J12` **non rejoué**. Les noms corrigés, il a été rejoué
**une fois**, sur `brain-alpha`, dans l'hôte réel, **frappe Windows réelle**
(réserve `X4`, même mécanisme, `scripts/j12-send-real-key.ps1`).

**Préparation déterministe :** le magasin de relations de `brain-alpha` — écrit
par FileTopo, reconstructible, sous `.filetopo-sandbox/` — a été remis à neuf
avant l'exécution, pour que la suggestion `S-005` soit bien **en attente**.
**Aucune preuve historique n'a été touchée pour obtenir ce résultat.**

**Artefact publié :**
[`TASK-0018-J12-relations-regression-webview2.json`](../performance/runs/TASK-0018-J12-relations-regression-webview2.json)

| Point exigé | Observé |
|---|---|
| Panneau relations | 4 entrées, totaux `3 sortante(s) · 1 entrante(s) · 1 suggestion(s) non comptée(s)`, panneau stabilisé |
| Traversée réelle au clavier | `map-node-6 → map-node-2 → map-node-6`; l'entrée activée mène bien à son extrémité, confirmée par l'index |
| `activationIsTrusted` | **`true`** (traversée **et** approbation) |
| `keydownIsTrusted` | **`true`** (traversée **et** approbation) |
| `click()` programmatique | **0** |
| `dispatchEvent(click)` | **0** |
| Approbation explicite | `S-005`, sortantes `3 → 4`, `createdProvenance = APPROVED`, `enteredCountsOnlyAfterApproval = true` |
| `X3` respecté | 5/5 rejets, dont `relation_rejected_suggestion_is_not_a_relation`; `suggestionsInEstablished` vide |
| Comptes cohérents | `countsAgree = true` sur 12 nœuds, `replayStable = true`, 0 extrémité non résolue, 0 inverse inventé |

Cela lève le « `J12` non rejoué après migration multi-cerveaux » **sans
toucher** à la preuve `VERIFIED` originale, dont l'empreinte est inchangée.

## 3. Garde de régression

- **TypeScript** — `src/map/runArtifacts.test.ts`, **7 tests** : aucun nom de
  destination n'est un artefact protégé; les quatre noms migrants portent
  `TASK-0018` et `regression`; chaque site d'écriture des trois sources du
  runtime prend son nom de `runArtifacts.ts`; aucune source n'épelle un nom
  protégé comme destination; tous les noms restent acceptables pour la garde
  Rust.
- **Rust** — `map::commands::tests`, **2 tests** : la porte refuse chacun des
  quatre artefacts protégés, **sans rien écrire**; les noms du runtime courant
  n'entrent en collision avec aucun d'eux.

**Les deux gardes ont été éprouvées par mutation :** en réintroduisant
`name: "TASK-0017-J12-webview2.json"`, deux tests échouent en nommant le
fichier fautif. Restaurés ensuite.

**Aucune architecture générale de gestion des preuves n'a été construite.**
Correction ciblée : une constante partagée, une liste de refus, deux fichiers
de test.

## 4. Revalidation

| Contrôle | Résultat |
|---|---|
| Tests Rust | **106 / 106** (104 avant, **+2** pour `X5`) |
| Tests TypeScript | **104 / 104** (97 avant, **+7** pour `X5`) |
| Tests-gardes `X2` | **PASS** |
| Tests `X3` / `X4` | **PASS**, inchangés |
| `pnpm check` | **PASS** |
| `pnpm build` | **PASS** |
| Build Tauri debug, sans empaquetage | **PASS**, `12,12 s` |
| `J12` de régression dans WebView2 `151.0.4129.107` | **PASS** |
| `TASK-0016-H9-webview2.json` | **inchangé** — `sha256 4bb12d9d…`, `git diff` vide |
| `TASK-0017-J12-webview2.json` | **inchangé** — `sha256 95fbab51…`, `git diff` vide |

**`K12` multi-cerveaux n'a pas été rejoué :** aucun code produit de bascule, de
catalogue ni de session n'a été modifié. Le seul code produit touché est la
porte d'écriture d'artefacts, en **build de développement uniquement**, et elle
a été exercée de bout en bout par le `J12` de régression.

## 5. Ce qui n'a pas changé

- **Aucun critère `H`, `J` ou `K`**, **aucune fixture gelée**, **aucune règle
  gelée** n'a été modifié.
- **Aucune mesure de performance, aucun seuil.** `R8` reste entière.
- **Aucune nouvelle dépendance.** `package.json`, `pnpm-lock.yaml` et
  `Cargo.toml` sont inchangés.
- **Aucune donnée réelle, aucun sélecteur de dossier.**
- **`B0` non corrigé** — il s'est **reproduit une cinquième fois**, sur
  `cargo test`; `CARGO_INCREMENTAL=0` suffit à contourner (`DEC-0013` E).
  **Rien n'a été supprimé dans `src-tauri/target/`.**
- **La révocation de `P-04` n'est toujours pas implémentée.** `P-04` demeure
  **PARTIELLE**.
- **La persistance de la vue reste `P-19`.**

## 6. État

| Élément | État |
|---|---|
| `X5` | **`OPEN`** — **corrigée, NON close**. Sa clôture appartient au re-contrôle indépendant |
| `ACTION-0028` | **`CHANGES_REQUIRED`** |
| `TASK-0018` | **`IMPLEMENTED`** — **`VERIFIED` non attribué** |

**L'action unique suivante est le re-contrôle indépendant de `TASK-0018`,
portant sur `X5` uniquement.**
