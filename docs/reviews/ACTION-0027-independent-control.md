# ACTION-0027 — Contrôle indépendant de TASK-0017 : X3 et X4 émises et corrigées

- **Date :** 2026-09-01
- **Objet :** contrôle indépendant de la **deuxième tranche de production** de
  l'étape A, livrée par
  [TASK-0017](../tasks/TASK-0017-crosscutting-relations.md) — lecture directe
  du code, du gel et des preuves publiées sur GitHub
- **Contrôleur :** **orchestrateur technique**, instance **distincte** de
  l'exécuteur de `TASK-0017`
- **Rédacteur de la présente fiche :** Claude Code, **exécuteur de la
  correction**, sous le GO technique de l'orchestrateur. **Cette fiche
  enregistre un verdict; elle ne le rend pas.**
- **Verdict :** **`CHANGES_REQUIRED`**, deux réserves : **`X3`** et **`X4`**
- **État de `TASK-0017` :** **`IMPLEMENTED`**, et rien de plus. **`VERIFIED`
  n'est pas attribué**, et ne le sera qu'après un **re-contrôle indépendant**

> **Ce que cette fiche est.** L'enregistrement d'un constat indépendant, des
> deux réserves qu'il émet, et des corrections exécutées en réponse.
>
> **Ce qu'elle n'est pas.** Elle ne **rend** aucun verdict, et elle ne clôt
> rien. `X3` et `X4` sont corrigées, **pas closes** : leur clôture appartient
> au re-contrôle.

## 0. Ce que le contrôle a accepté

- **Le gel précède le code**, sans exception : `51a8cac` est antérieur à
  `a98676e`, et **aucun critère `J1` à `J12` n'a été retouché** après le
  premier résultat.
- **`J1` à `J11` sont acceptables**, sous réserve de `X3`.
- **La révocation de `P-04` n'entre pas dans cette correction.** Elle était
  **explicitement hors du périmètre gelé** — `TASK-0017` §2.2 — et sera traitée
  par une tranche future. Elle n'est **pas** une réserve.

## 1. Réserve `X3` — la création d'une relation `APPROVED` n'était pas verrouillée

### 1.1 Le constat, tel qu'il a été émis

> `RelationStore::insert_established()` accepte `provenance=APPROVED`. Si une
> suggestion est déjà à l'état `approved`, cette méthode peut insérer une
> relation `APPROVED` en utilisant `source_key`, `target_key` et
> `relation_type` **fournis par l'appelant**, sans vérifier qu'ils
> correspondent à la suggestion.
>
> Donc **une suggestion déjà approuvée peut servir de justification à une autre
> relation qu'elle-même.**

### 1.2 Pourquoi c'est bloquant

Le défaut contredit trois points du modèle gelé, et pas seulement un détail
d'implémentation :

- **§4.1** — une suggestion ne devient relation **que** par une approbation
  explicite;
- **`J4`** — une approbation produit **exactement une** relation `APPROVED`
  **correspondante**;
- **§4.1** — **aucun passage silencieux**.

La garde existante vérifiait l'**état** de la suggestion, jamais la
**correspondance**. Une garde qui contrôle qu'une clé existe, sans contrôler ce
qu'elle désigne, ne garantit rien.

**Le défaut était de la même famille que `X2` :** ce qui avait été jugé, c'est
ce que le code *appelle*, pas ce que le stockage *permet*.

### 1.3 La correction

**Sur trois plans, dont deux structurels.**

| Plan | Ce qui a changé |
|---|---|
| **API** | `insert_established` refuse `APPROVED` **sans condition** — suggestion en attente, approuvée, inconnue ou absente. `approve()` est la **seule** voie applicative |
| **Schéma, version 2** | `suggestion_key` **`UNIQUE`** dans `relations_approved`; **clé étrangère** vers `relation_suggestions`; **trois déclencheurs** SQLite |
| **Transaction** | `approve()` écrit un `INSERT` **simple**. `OR IGNORE` transformait un refus en non-événement silencieux |

**Les trois déclencheurs**, lus dans le fichier SQLite après exécution :

| Déclencheur | Ce qu'il interdit |
|---|---|
| `approved_must_match_its_suggestion_on_insert` | écrire une ligne approuvée dont la source, la cible ou le type diffèrent de sa suggestion, ou dont la suggestion n'est pas déjà `approved` |
| `approved_must_match_its_suggestion_on_update` | la même chose, par mise à jour |
| `suggestion_cannot_drift_from_its_relation` | réécrire les extrémités ou le type d'une suggestion dont la relation existe déjà |

**La correspondance n'est donc plus vérifiée en Rust : elle est portée par le
stockage.** Une garantie qui ne tient que si l'appelant emploie la bonne
fonction n'est pas une garantie.

### 1.4 La migration, explicite

Un magasin écrit par la version 1 peut contenir exactement la ligne que `X3`
décrit. La migration **ne la reprend pas**, et **ne la supprime pas en
silence** : sa clé est écrite dans `relation_meta` sous
`migration_v2_discarded`. **Données synthétiques uniquement.**

### 1.5 Les tests négatifs demandés

| Demandé par le contrôle | Test | Niveau |
|---|---|---|
| suggestion en attente → insertion directe `APPROVED` rejetée | `a_pending_suggestion_cannot_be_written_as_a_relation`, `the_storage_refuses_a_pending_suggestion` | API **et** stockage |
| suggestion déjà approuvée → insertion directe rejetée | `an_already_approved_suggestion_cannot_justify_a_direct_write` | API |
| même suggestion + extrémités différentes → rejet | `the_storage_refuses_a_relation_that_is_not_its_suggestion` | **stockage**, 3 variantes |
| une approbation normale produit toujours exactement une relation correspondante | `approving_a_suggestion_produces_exactly_one_relation_and_moves_its_state` | API, extrémité par extrémité |
| seconde approbation explicite refusée | `approving_twice_is_refused_rather_than_duplicated` | API |

**Cinq tests supplémentaires** écrivent **directement en SQL**, en contournant
toute garde Rust : `insert_established_can_never_create_an_approved_relation`,
`an_approved_relation_cannot_exist_without_its_suggestion`,
`one_suggestion_can_never_carry_two_approved_relations`,
`an_approved_suggestion_cannot_drift_away_from_its_relation`, et
`migrating_a_version_1_store_drops_the_mismatched_row_and_names_it`.

**État de `X3` : corrigée, en attente de re-contrôle. Pas close.**

## 2. Réserve `X4` — `J12` n'était pas prouvé intégralement

### 2.1 Le constat

Le gel exige « **parcourir au clavier au moins une relation** ». L'artefact
précédent prouvait le focus, le caractère natif du bouton et une activation
fonctionnelle — mais **déclarait lui-même qu'aucune frappe `Enter` de confiance
n'avait été jouée**.

**Une déclaration d'honnêteté n'est pas une preuve.** Le critère n'était pas
tenu.

### 2.2 La correction

**Le scénario n'active plus rien lui-même.** Il pose le focus, écrit un
marqueur sur la sortie standard de l'hôte, et **attend**.
[`scripts/j12-send-real-key.ps1`](../../scripts/j12-send-real-key.ps1) lit ce
marqueur, ramène la fenêtre FileTopo au premier plan par `AppActivate`, et
envoie la touche par **`WScript.Shell`** — le chemin d'entrée ordinaire de
Windows. **Aucune nouvelle dépendance :** `WScript.Shell` fait partie de
Windows.

**Trois instruments simultanés**, parce qu'aucun ne suffit seul :

1. **`isTrusted`** de l'événement d'activation — `false` pour tout ce qu'un
   script a émis, `true` uniquement pour une activation engendrée par le
   navigateur à partir d'une entrée réelle. **C'est la preuve.**
2. **`HTMLElement.prototype.click` et `EventTarget.prototype.dispatchEvent`
   sont comptés** pendant toute la fenêtre d'attente. Les deux doivent rester à
   **zéro** : c'est ce que « aucune activation programmatique » veut dire quand
   on le **mesure** au lieu de l'**affirmer**.
3. **Le changement observable**, pour qu'un clic de confiance sans effet ne
   passe pas pour un succès.

**Si la frappe n'arrive pas, le scénario échoue et l'écrit.** Il ne se rabat
**jamais** sur un clic synthétique.

**L'approbation d'une suggestion passe par le même chemin** : `J12` demande
d'« approuver une suggestion synthétique », et un clic envoyé par un script
n'est pas quelqu'un qui approuve.

### 2.3 La preuve rejouée

`docs/performance/runs/TASK-0017-J12-webview2.json`, **WebView2
`151.0.4129.107`**, sur le **binaire portant les deux corrections**.

| Élément demandé par le contrôle | Traversée | Approbation |
|---|---|---|
| Méthode d'entrée | `WScript.Shell SendKeys` après `AppActivate` | idem |
| Touche envoyée | `{ENTER}` | `{ENTER}` |
| Élément ayant le focus avant | `BUTTON` `relation__link`, « →note-1.txt ◆ déterministe » | `BUTTON` `suggestion__approve`, « Approuver S-005 » |
| `keydown` de confiance | **`true`**, touche `Enter` | **`true`**, touche `Enter` |
| Activation de confiance | **`true`** | **`true`** |
| Appels programmatiques `click()` | **0** | **0** |
| `dispatchEvent` de type `click` | **0** | **0** |
| Endpoint sélectionné avant | `map-node-6` | — |
| Endpoint sélectionné après | **`map-node-9`** | — |
| Endpoint attendu, lu **sur l'entrée activée** | `map-node-9`, clé `ek1|quasi-empty|dossier-b/note-1.txt` | — |
| L'index confirme que c'est une relation | **`true`** | — |
| Changement dû à la frappe | **`true`** | **`true`** |
| Attente | 1 173 ms | ~1 000 ms |

**État de `X4` : corrigée et preuve rejouée, en attente de re-contrôle. Pas
close.**

## 3. Un cinquième défaut de protocole, trouvé en rejouant

**Ma preuve était fausse, pas le produit.**

Le premier rejeu avec frappe réelle a publié
`selectionFollowedTheRelation: false`. L'extrémité attendue était calculée à
partir de `outgoing[0]` **de l'index**, alors que le panneau **groupe par
direction puis par type** : la première entrée à l'écran n'est pas la première
entrée de l'index. La sélection était allée **exactement** où l'entrée activée
menait.

**Corrigé à la source :** chaque entrée du panneau porte désormais son
extrémité en attributs `data-` — `data-endpoint-key`,
`data-endpoint-node-id`, `data-direction`, `data-relation-type`,
`data-provenance`. La preuve lit l'extrémité **sur l'entrée qui a été
activée**, puis demande à l'index si c'est bien une relation de ce nœud : ni
une hypothèse sur un ordre, ni une tautologie. Un test unitaire verrouille la
correspondance entre l'attribut et ce que l'activation sélectionne.

**Ce défaut allait dans le bon sens** — un faux négatif, pas un faux positif —
mais il est publié comme les quatre autres.

## 4. Revalidation complète

Le stockage Rust ayant changé, tout a été rejoué.

| Contrôle | Résultat |
|---|---|
| Tests Rust | **84 / 84** (75 avant, **+9** pour `X3`) |
| Tests-gardes `X2` | **PASS** |
| Tests TypeScript | **82 / 82** (81 avant, **+1** pour la correspondance des entrées) |
| `pnpm check` | **PASS** |
| `pnpm build` | **PASS** |
| Build Tauri release, sans empaquetage | **PASS**, `47,8 s` |
| `J1` à `J5` dans l'hôte | 5/5 rejets, rejeu stable, **12/12 nœuds conformes**, 0 inverse inventé |
| `J10` reconstruction | **PASS** — après reconstruction des 4 index : 8 déterministes, **5 approuvées**, 3 suggestions en attente, **0 correspondance rompue** |
| `J11` isolation | **PASS** — verdicts `H1` à `H7` identiques, **0 artefact** dans la racine analysée |
| `J12` complet dans WebView2 | **PASS**, sur le binaire final corrigé |

**Le schéma, lu dans le fichier après exécution :** `user_version = 2`,
`suggestion_key` indexée en **unique**, clé étrangère vers
`relation_suggestions`, **trois déclencheurs** présents, et **0** ligne
approuvée ne correspondant pas à sa suggestion.

## 5. Ce qui n'a pas changé

- **Aucun critère `J1` à `J12`**, **aucune fixture gelée**, **aucune règle
  gelée** n'a été modifié.
- **Aucune optimisation de performance**, **aucune mesure**, **aucun seuil**.
  `R8` reste entière.
- **Aucune nouvelle dépendance.** `package.json`, `pnpm-lock.yaml` et
  `Cargo.toml` sont inchangés.
- **Aucune donnée réelle, aucun sélecteur de dossier.**
- **`B0` non corrigé**, rien supprimé dans `src-tauri/target/`.
- **La révocation de `P-04` n'est toujours pas implémentée**, et reste hors
  périmètre. **`P-04` demeure PARTIELLE.**

## 6. État

| Élément | État |
|---|---|
| `X3` | **`CLOSED`** — clos par le re-contrôle du 2026-09-01 |
| `X4` | **`CLOSED`** — clos par le re-contrôle du 2026-09-01 |
| `ACTION-0027` | **`CLOSED`** |
| `TASK-0017` | **`VERIFIED`** — attribué par le re-contrôle indépendant |

## 7. Re-contrôle indépendant du 2026-09-01 — verdict

- **Date :** 2026-09-01
- **Contrôleur :** **orchestrateur technique**, instance **distincte de
  l'exécuteur** de `TASK-0017` et de la correction `8a259e9`
- **Objet du re-contrôle :** les corrections `X3` et `X4` publiées en
  `8a259e9`, puis le rapport `50de16b`, sur la branche
  `build/v0.2-a2-relations`
- **Verdict rendu :** **`X3` `CLOSED`**, **`X4` `CLOSED`**,
  **`ACTION-0027` `CLOSED`**, **`TASK-0017` `VERIFIED`**

> **Ce paragraphe enregistre un verdict rendu par l'orchestrateur indépendant.
> Il ne le rend pas.** L'exécuteur qui écrit cette ligne ne s'attribue rien :
> la règle « l'exécuteur ne s'attribue pas `VERIFIED` » est intacte, et le
> contrôle a été mené par une instance distincte, sur preuves.

### 7.1 Ce que `VERIFIED` porte, et ce qu'il ne porte pas

**Porté :** la qualité des preuves de la tranche `TASK-0017`, le verrouillage
structurel de la création d'une relation `APPROVED`, et la réalité de la
frappe clavier de `J12`.

**Non porté :** le reste du contrat de parité. **La révocation de `P-04` n'est
toujours pas implémentée** — elle était déclarée hors du périmètre gelé de
`TASK-0017`, elle le reste, et **`P-04` demeure PARTIELLE**. Sa clôture
appartient à une tranche future, avec sa propre fiche, ses critères gelés et
son propre GO. **`TASK-0018` ne l'implémente pas.**

**L'action unique suivante n'est plus le re-contrôle de `TASK-0017` :
`TASK-0018` ouvre la fondation multi-cerveaux.**
