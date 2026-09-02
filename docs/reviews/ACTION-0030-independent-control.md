# ACTION-0030 — Contrôle indépendant de TASK-0019 : CHANGES_REQUIRED, réserve X6

- **Date :** 2026-09-02
- **Objet :** **contrôle indépendant** de `TASK-0019` — vue composée
  multi-cerveaux — sur les preuves publiées, et **rien d'autre**
- **Contrôleur :** **orchestrateur technique**, instance **distincte** de
  l'exécuteur de `TASK-0019`
- **Rédacteur de la présente fiche :** Claude Code, **exécuteur**, sous le GO
  technique de l'orchestrateur ouvrant la correction de `X6`. **Cette fiche
  enregistre un verdict rendu par l'orchestrateur; elle ne le rend pas.**
- **`HEAD` contrôlé :** **`21acd64aca0c03b68b7e2eccc792f716fa7f2f9a`**, tip de
  `build/v0.2-a4-composed-view`
- **Verdict :** **`CHANGES_REQUIRED`**

## 1. Le verdict, tel qu'il a été rendu

| Élément | État attribué par l'orchestrateur |
|---|---|
| `ACTION-0030` | **`CHANGES_REQUIRED`** |
| Réserve `X6` | **`OPEN`** |
| `TASK-0019` | **reste `IMPLEMENTED`** — `VERIFIED` **interdit** avant re-contrôle indépendant |
| `X2`, `X3`, `X4`, `X5` | **maintenues** |

## 2. Ce que le contrôle accepte

Le fond de la tranche est accepté, et **n'est pas rouvert** :

- le **gel `bcbc4aa` précède le code `6dd3585`** — `L1`–`L12` figés avant la
  première ligne de la tranche;
- `L1` à `L11`, **tenus**;
- `L12`, **étapes 1 à 6 et 8 à 17**;
- les compositions `C2` et `C3`;
- **un seul `SVG`**, et les territoires;
- les **collisions `DOM`** Alpha / Gamma;
- les relations **intra-cerveau seulement**;
- la **mémoire** de session par composition, `C2` et `C3`;
- le **clavier réel**;
- le **redémarrage réel**.

## 3. La seule réserve — `X6`

**`L12` étape 7 exigeait explicitement :**

> « approuver `S-005` dans Alpha et confirmer Gamma inchangé ».

**La preuve publiée à `21acd64` indiquait :**

| Valeur | Publiée |
|---|---|
| `s005WasPending` | `false` |
| `approvalReplayable` | `false` |
| `alphaMovedByExactlyOne` | `false` |

**« Gamma inchangé » était prouvé. L'ACTE d'approbation demandé n'avait pas eu
lieu pendant `L12`.** Le bac à sable de développement est persistant et une
exécution antérieure du rejeu `K12` avait déjà approuvé `S-005`; le magasin
refusait une seconde approbation, ce qui est **`X3` qui fonctionne**. La
publication de l'échec était honnête — `approvalReplayable: false` et sa raison
figuraient dans l'artefact — mais **une cible manquée reste une cible manquée**,
et un critère gelé ne se satisfait pas d'une moitié.

**Ce que la réserve n'autorise pas.** Ni la suppression du bac à sable, ni la
remise à zéro du magasin de relations ou du catalogue, ni un contournement de
`X3`, ni une écriture directe dans `SQLite` pour rendre `S-005` de nouveau en
attente, ni une commande de remise à zéro exposée au runtime. Le bac existant
**reste intact**.

## 4. La correction exécutée

Enregistrée ici pour que la réserve et sa réponse se lisent au même endroit.
**Elle ne clôt pas `X6`** : l'exécuteur ne ferme pas sa propre réserve.

Un **namespace de bac à sable neuf**, demandé par le scénario de preuve et
**confiné** sous le même répertoire :

    <dépôt>/.filetopo-sandbox/variants/<variant>

- variable d'environnement de **développement** `FILETOPO_SANDBOX_VARIANT`,
  lue par `src-tauri/src/map/sandbox.rs`;
- **absente : comportement exactement inchangé** — `<dépôt>/.filetopo-sandbox`;
- la valeur est un **nom**, jamais un chemin : un seul basename ASCII
  `[A-Za-z0-9_-]`, 1 à 64 caractères. Séparateur, `..`, chemin absolu, chaîne
  vide ou valeur trop longue : **erreur explicite**, jamais un repli silencieux
  vers un chemin fourni par l'appelant;
- **aucune racine choisie par l'utilisateur, aucun sélecteur de dossier**;
- **six tests** couvrent le confinement, dont « aucun variant accepté ne sort
  du bac à sable » et « le libellé publié ne porte aucun chemin absolu ».

`scripts/l12-run-real-host.ps1` tire un variant **neuf** par invocation, le
garde **identique** pour les deux passes, retire la variable en sortant, et
**ne supprime rien** — ni le bac existant, ni le répertoire du variant.

**Le rejeu complet, `WebView2` `152.0.4191.53`, deux processus réels :**

| | Alpha avant | Alpha après | Gamma avant | Gamma après |
|---|---|---|---|---|
| approuvées | **4** | **5** | 4 | 4 |
| en attente | **4** | **3** | 4 | 4 |
| `S-005` | **en attente** | **approuvée** | en attente | **en attente** |

`s005WasPending: true`, `approvalReplayable: true`, `approvalError: null`,
`alphaMovedByExactlyOne: true`, `gammaStrictlyUnchanged: true`,
`gammaS005StillPending: true`, `separateStores: true`.

**`X5` est préservée :** les **huit** preuves protégées `TASK-0016`,
`TASK-0017` et `TASK-0018` sont **bit-for-bit inchangées**. Seuls les deux
artefacts `L12` de `TASK-0019` — tâche **non `VERIFIED`** — ont été remplacés
par la preuve corrigée de cette même tâche.

## 5. Ce que le re-contrôle a à faire

**`X6` uniquement**, sur les preuves. Le fond accepté au §2 n'est pas rouvert.

- l'étape 7 de `TASK-0019-L12-composed-view-webview2-pass1.json` porte-t-elle
  bien les cinq valeurs déclarées, et la variation `+1` / `-1` ?
- l'approbation a-t-elle eu lieu **pendant que `C2` était affichée** ?
- `pass2` partage-t-il le **même variant** que `pass1`, après une fermeture et
  un redémarrage réels ?
- le confinement du variant tient-il, et le libellé publié reste-t-il **non
  personnel** ?
- les **huit** preuves protégées sont-elles inchangées ?
