# État courant

- **Dernière mise à jour :** 2026-08-31
- **Branche active :** **`spike/v0.2-technical-risk-gates`**, publiée sur
  origin, créée depuis `db8d3de0b20e7efbfe463a17c218cc14face39a8`
- **`rebuild/v0.2-project-brain` :** inchangée, `db8d3de0…`, **non touchée**
- **`main` :** inchangée, `91bbe90f0f99026c28cd345784d4f579a0016db2`, **non
  touchée**
- **Dernière tâche vérifiée :** `TASK-0011`, `VERIFIED` le 2026-08-31
- **Tâche livrée, NON vérifiée :** **`TASK-0012`, `IMPLEMENTED`** — attend le
  contrôle indépendant de Sébastien
- **Tâche IN_PROGRESS :** aucune
- **Code applicatif :** **inchangé.** 0 fichier modifié sous `src/`,
  `src-tauri/`, `tests/`, `public/`, `scripts/`, `.github/` ou `graph/`. Les
  quatre empreintes SHA-256 de `package.json`, `pnpm-lock.yaml`,
  `src-tauri/Cargo.toml` et `src-tauri/Cargo.lock` sont **identiques avant et
  après**

## Porte P3 franchie le 2026-08-31, TASK-0012 exécutée

Sébastien a donné un **GO P3 explicite**, assorti d'une correction des
livrables : `B1`, `B2` et `B3` portent désormais **chacun** sa fiche de
performance distincte.

**Pour la première fois depuis `TASK-0010`, des choses ont été exécutées et
mesurées.** Les cinq bancs d'essai ont rendu leurs verdicts.

| Banc | Verdict |
|---|---|
| `B0` | **SUCCÈS** — l'état réel est connu et écrit, échec compris |
| `B1` | **`M-C` RÉFUTÉE telle qu'écrite**; confirmée seulement durcie |
| `B2` | **Étude Canvas 2D autorisée**; plafonds réels mesurés |
| `B3` | **`I-E` confirmée sur 5 points sur 6**; inter-volume non observé |
| `B4` | **SUCCÈS** — 3 réponses sourcées, 1 déclarée non résolue |

Preuves : [TASK-0012-risk-gate-results.md](../research/TASK-0012-risk-gate-results.md),
[PERF-0001](../performance/PERF-0001-b2-rendering.md),
[PERF-0002](../performance/PERF-0002-b1-sqlite-migration.md),
[PERF-0003](../performance/PERF-0003-b3-windows-identity.md).

### B0 — le prototype, tel qu'il est

**Ce qui passe :** `pnpm install --frozen-lockfile`; **36 / 36** cas Vitest;
`tsc --noEmit`; `vite build`; **13 / 13** tests Rust. Le décompte annoncé par
l'ancien état est donc exact, **et il passe**.

**Ce qui échoue, et n'a pas été corrigé :** `cargo build --locked` échoue avec
une **panique interne du compilateur** `rustc 1.98.0`, **4 fois sur 4**. Un
diagnostic complémentaire — `CARGO_INCREMENTAL=0`, sans rien supprimer —
**réussit**. La cause est donc le **cache de compilation incrémentale** de
`src-tauri/target/`, ignoré par Git, **et non le code source**.

**« Le dépôt ne se construit pas » serait faux.** « Sur cette machine,
`cargo build` échoue tant que le cache incrémental hérité n'est pas
renouvelé » est ce qui a été observé. La correction est **interdite** sans une
autorisation distincte.

### B1 — le résultat le plus important

La bascule `M-C` **telle que `DEC-0011` la décrit produit une base corrompue**.
Un `-wal` orphelin, laissé par un écrivain tué, survit au `rename` : son nom
étant dérivé du chemin cible, il devient mécaniquement le `-wal` de la
**nouvelle** base, que SQLite détruit en le rejouant. `integrity_check` échoue,
la base est illisible. **Ce n'est pas théorique : c'est reproduit.**

Une variante **durcie** — replier le WAL de l'ancienne base, puis supprimer les
annexes de la cible avant la permutation, **dans cet ordre** — passe le même
scénario, pour un **coût en temps nul** (776,9 ms contre 778,4 ms).

Par ailleurs : **20 arrêts brutaux sur 20** laissent la cible soit ancienne
intacte, soit nouvelle complète, jamais un mélange; le disque plein simulé
échoue proprement dans les trois stratégies; le retour en arrière fonctionne.
`M-B` est plus rapide de 15 % mais laisse une base 3,0 % plus grosse, et
**l'argument du double espace disque ne se vérifie pas** (2,6 % d'écart).

### B2 — l'hypothèse de 3 000 blocs est remplacée

À 3 000 blocs visibles, `SYN-WIDE` plafonne à **14,08 ips** contre 30 exigées.
Le seuil est manqué, donc **l'étude de Canvas 2D est autorisée — l'étude, pas
l'adoption**.

Plafonds **réels**, mesurés par dichotomie : `SYN-EQUILIBRE` **3 743**,
`SYN-DEEP` **3 063**, `SYN-WIDE` **entre 939 et 1 795**. L'hypothèse de 3 000
était prudente sur une forme, juste sur une autre, **optimiste d'un facteur 3**
sur la troisième. **Un plafond exprimé en nombre de blocs ne décrit pas ce qui
détermine le coût** : la géométrie produite compte autant.

ARIA et clavier sont **conformes dans les 18 scénarios**, jusqu'à 5 002 blocs —
un acquis que Canvas 2D devrait entièrement reconstruire.

### B3 — l'identité, et son coût

`VolumeSerialNumber` + `FileId` 128 bits sont **obtenables sur Rust stable**,
via `windows-sys =0.61.2` (`MIT OR Apache-2.0`, licence vérifiée), sur un
descripteur ouvert en **accès nul**. L'identité **survit au renommage et au
déplacement intra-volume**, pour un fichier comme pour un dossier.

Coût : **28,3 µs par élément**, linéaire. Cela multiplie un parcours par 38,
mais ne pèse que **2,83 s**, soit **3,1 %** du budget de 90 s de §3.2 de
`BASELINE_TARGETS.md`.

**Le comportement inter-volume n'a pas été observé** : le tester exigerait
d'écrire hors du dépôt, condition d'arrêt de §13.2. Rien n'a été contourné.

### B4 — trois réponses, une question ouverte

Sur sources **Microsoft uniquement**. L'attribut normatif est
`FILE_ATTRIBUTE_RECALL_ON_DATA_ACCESS`. Une **ambiguïté réelle** a été trouvée
dans la source officielle : `FILE_ATTRIBUTE_EA` et
`FILE_ATTRIBUTE_RECALL_ON_OPEN` portent **la même valeur**, et seul le contexte
d'énumération les distingue.

Règle retenue, **inconditionnelle** : **FileTopo ne lit jamais le contenu d'un
fichier de l'utilisateur.** Ne pas faire dépendre la sûreté d'un bit ambigu
supprime la classe entière de défauts.

**Question non résolue, déclarée telle :** aucune source Microsoft trouvée sur
la survie de l'identité à une hydratation. La recherche par moteur a été
**interrompue par une limite de dépense du compte**.

## Ce qui n'a pas changé

La baseline documentaire de `TASK-0011` reste approuvée et **intacte**. **Aucune
fiche `DEC-0001` à `DEC-0012` n'a été modifiée** : les verdicts **alimentent**
des décisions futures, ils ne les prennent pas.

## Limites et risques

- **`SIGKILL` n'est pas une coupure de courant.** Les 20 arrêts brutaux de `B1`
  ne disent **rien** de la résistance à une panne d'alimentation.
- **Le disque plein de `B1` est simulé** par injection `SQLITE_FULL`, pas réel.
  Les échecs de copie et de renommage par manque d'espace ne sont pas couverts.
- **Une seule machine, un seul volume NTFS, un seul système.** Aucune mesure
  reproduite ailleurs. Le matériel est **au-dessus d'un poste ordinaire** : les
  chiffres de `B2` sont un plafond favorable.
- **Moteurs différents de la production.** `B1` mesure SQLite via `node:sqlite`,
  pas `rusqlite`. `B2` mesure Chrome, **pas WebView2**.
- **Ni Canvas 2D ni WebGL n'ont été mesurés.**
- **Aucun lecteur d'écran réel** n'a été essayé; la conformité ARIA porte sur
  les attributs produits.
- **L'application n'a jamais été empaquetée ni lancée.** `tauri build` exigerait
  de télécharger des empaqueteurs, interdit par §7.1.2.
- **Aucune couverture de code mesurée.** « 36 tests passent » ne dit rien de ce
  qu'ils couvrent.
- Les cibles de `BASELINE_TARGETS.md` restent **non testées dans leur
  ensemble** : `B3` n'en mesure qu'un poste.
- Le dossier `graph/` n'a été ni lu ni modifié; ses fichiers restent
  contradictoires.
- `docs/tasks/TASK-0008-*.md` demeure `IMPLEMENTED` et se décrit comme « non
  commitée » : incohérence historique connue, hors périmètre.

## Porte humaine

La porte **P3 est franchie**. La porte **P4 est ouverte et non franchie**.

`TASK-0012` est **`IMPLEMENTED`, jamais auto-déclarée `VERIFIED`** : l'exécuteur
ne juge pas ses propres preuves. Le contrôle indépendant appartient à Sébastien
(`ACTION-0021`).

**Aucune ligne de code de production ne peut être écrite avant P4.** La branche
de spike n'est ni fusionnée, ni destinée à l'être automatiquement : la
conserver, la fusionner ou la supprimer appartient à Sébastien.
