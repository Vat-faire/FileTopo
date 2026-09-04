# ACTION-0039 — Re-contrôle indépendant ciblé X10 : CLOSED, TASK-0023 VERIFIED

- **Date :** 2026-09-04
- **Objet :** enregistrement du re-contrôle indépendant ciblé `X10` de
  `TASK-0023`, dernière réserve ouverte d'`ACTION-0038`
- **Contrôleur :** **orchestrateur technique indépendant**, instance distincte
  de l'exécuteur de `TASK-0023`
- **Rédacteur :** Claude Code. **Ce document ENREGISTRE le verdict rendu par
  l'orchestrateur technique indépendant; Claude ne rend pas ce verdict, ne
  clôt pas `X10` de sa propre autorité et ne s'attribue pas `VERIFIED`.**
- **HEAD re-contrôlé :**
  `adba65683562436b1313ef6449bee2c1edb8abec`
- **Commit substantif de correction `X10` :**
  `9e9fb37ac8129e32d439a7d0a7b3759523858739`
- **`main` :** `91bbe90f0f99026c28cd345784d4f579a0016db2`, intacte
- **Contrôle précédent :** [`ACTION-0038`](ACTION-0038-independent-recontrol.md),
  qui avait clos `X9` et laissé `X10` seule ouverte

## 1. Verdict externe enregistré

| Élément | Verdict |
|---|---|
| Réserve `X9` | **`CLOSED`** (inchangé depuis `ACTION-0038`) |
| Réserve `X10` | **`CLOSED`** |
| `ACTION-0038` | **`CLOSED`** |
| `ACTION-0039` | **`CLOSED`** |
| `TASK-0023` | **`VERIFIED`** |

Aucune réserve ne reste ouverte sur `TASK-0023`.

## 2. Motifs de clôture de X10

Enregistrés tels que rendus, factuellement :

- ouverture Windows avec `FILE_FLAG_OPEN_REPARSE_POINT`;
- classification faite sur la metadata du **HANDLE réellement ouvert**, et non
  sur une observation antérieure du pathname;
- le composant final n'est **jamais rouvert par pathname** pour le hash;
- la racine et les composants intermédiaires sont **épinglés** par des handles
  conservés pendant toute la décision;
- `FILE_SHARE_DELETE` est **omis**, de sorte qu'un composant épinglé ne peut
  être supprimé ni renommé sous l'opération;
- les répertoires restent **ouverts pendant `read_dir` et la récursion**;
- le remplacement concurrent **fichier → reparse point** est testé;
- le remplacement concurrent **répertoire → jonction réelle** est testé;
- le renommage d'un **composant intermédiaire épinglé** est réellement
  **refusé** par le système, et le test l'observe;
- **zéro octet extérieur lu** dans les trois tests TOCTOU synchronisés;
- `sha256-tree-v1` **conserve** la garantie close en `X9` : streaming borné,
  non-suivi des liens, marquage sans ouverture de la cible;
- `EC15` `pass1`/`pass2` régénérées en hôte réel : **réussi**;
- **aucune nouvelle dépendance**; `Cargo.toml` et `Cargo.lock` inchangés;
- `main` intacte.

## 3. Limite conservée

La garantie race-safe apportée par `X10` est **actuellement prouvée sur
Windows**. Le repli `cfg(not(windows))` conserve le non-suivi statique
historique mais **ne doit pas être présenté comme race-safe** : il n'a été ni
compilé ni exécuté sur cet hôte, et aucune preuve TOCTOU ne le couvre.

`DEC-0013/F` **reste bloquante** pour l'identité physique persistante. La
clôture de `TASK-0023` porte sur l'observation de **contenu exact**, pas sur
l'identité « même objet physique ».

## 4. Scellement X5 — 27 → 29

`TASK-0023` possède exactement **deux** preuves canoniques, celles sur
lesquelles ce contrôle s'est prononcé :

- `TASK-0023-EC15-exact-content-observations-webview2-pass1.json`
- `TASK-0023-EC15-exact-content-observations-webview2-pass2.json`

Elles rejoignent la réserve `X5` et deviennent intouchables. Les **27** noms
antérieurs restent exactement dans le même ordre; les deux `EC15` sont
ajoutées à la suite. Les trois gardes canoniques — Rust
(`src-tauri/src/map/commands.rs`), TypeScript (`src/map/runArtifacts.ts`) et
PowerShell (`scripts/protected-run-artifacts.ps1`) — portent les **29** mêmes
noms dans le même ordre.

**Aucune autre preuve `TASK-0023` ne devient canonique.** Les replays `H9`,
`J12`, `K11`, `K12`, `L12`, `M12`, `N15` que la tranche a migrés, et toutes les
variantes `-abandon`, restent hors du scellement : une vérification scelle la
preuve sur laquelle elle s'est prononcée, pas tout ce que la tranche a écrit.

## 5. État dérivé attendu du runtime après scellement

Le runtime livré dans ce checkout écrit **encore** sous `TASK-0023`. Après
scellement, ses deux destinations `EC15` sont donc **volontairement
protégées** :

```
protectedArtifactCount   = 29
protectedDestinations    = [ TASK-0023-EC15-…-pass1.json,
                             TASK-0023-EC15-…-pass2.json ]
writesUnderItsOwnTaskOnly = false
```

**C'est normal après `VERIFIED`**, et c'est exactement ce qui est arrivé à
`TASK-0020` en son temps. Ce n'est pas un défaut à réparer en renommant dès
maintenant le runtime en `TASK-0024`. La prochaine tranche **migrera les
destinations avant tout nouveau rejeu**, comme chaque tranche précédente l'a
fait. Jusque-là, le refus du portail est ce qui sépare un clic de bouton de la
destruction de deux preuves publiées.

`SEALED_RUNTIME_DESTINATIONS` publie cette intersection exacte dans
`src/map/runArtifacts.ts`.

## 6. Contrôles de garde exécutés à la fermeture

- exactement **29** preuves protégées, dans les trois gardes;
- les **27** anciennes inchangées, dans le même ordre, sans doublon;
- exactement les **2** `EC15` de `TASK-0023` ajoutées, en fin de liste;
- **parité** Rust / TypeScript / PowerShell, vérifiée en lisant les trois
  sources et en comparant les listes elles-mêmes;
- les deux `EC15` sont désormais **refusées en écriture** par
  `write_run_artifact`;
- **aucune autre destination `TASK-0023`** n'est protégée;
- **aucune preuve n'a été modifiée** pendant cette fermeture.

`EC15` n'a pas été rejouée. `J12`, `K11`, `K12`, `L12`, `M12`, `N15` et `H9`
n'ont pas été rejoués.

## 7. Portée de cette action

Gouvernance et scellement seulement. Aucune modification de
`content_signals.rs`, de `SHA-256`, de `sha256-tree-v1`, de SQLite, du layout,
des relations, des fixtures, des JSON `EC15`, de `Cargo.toml` ni de
`Cargo.lock`.

## 8. État et action suivante

`X9` `CLOSED`, `X10` `CLOSED`, `ACTION-0038` `CLOSED`, `ACTION-0039` `CLOSED`,
`TASK-0023` **`VERIFIED`**.

L'action suivante est un **retour à l'orchestrateur** pour définir la prochaine
tranche. Aucune `TASK-0024` n'est créée par cette action.
