# ACTION-0021 — Contrôle indépendant de TASK-0012, et clôture

- **Date :** 2026-08-31
- **Objet :** contrôle indépendant des preuves publiées par
  [TASK-0012](../tasks/TASK-0012-technical-risk-gates.md) sur la branche
  `spike/v0.2-technical-risk-gates`
- **Contrôleur :** **orchestrateur technique**, instance **distincte** de
  l'exécuteur des bancs d'essai
- **Cadre :** délégation d'orchestration technique de Sébastien du 2026-08-31
  (voir [AGENTS.md](../../AGENTS.md), section « Délégation d'orchestration
  technique »)
- **Rédacteur de la présente fiche :** Claude Code, sous le **GO technique de
  l'orchestrateur** pour cette **étape documentaire uniquement**
- **Résultat :** **contrôle accepté**. `TASK-0012` passe de `IMPLEMENTED` à
  **`VERIFIED`**, **avec neuf réserves maintenues**

> **Ce que cette fiche est.** L'enregistrement, dans le dépôt, d'un contrôle
> indépendant et des arbitrages qui en découlent.
> **Ce qu'elle n'est pas.** Elle ne rejoue aucune mesure, n'exécute aucun banc
> d'essai et ne produit aucune preuve nouvelle. Les preuves restent celles de
> `TASK-0012`, **inchangées**.

## 1. Ce qui a été contrôlé

| Objet | Emplacement |
|---|---|
| Journal, preuves et verdicts de `B0` à `B4` | [TASK-0012-risk-gate-results.md](../research/TASK-0012-risk-gate-results.md) |
| Mesures de `B2` | [PERF-0001](../performance/PERF-0001-b2-rendering.md) |
| Mesures de `B1` | [PERF-0002](../performance/PERF-0002-b1-sqlite-migration.md) |
| Mesures de `B3` | [PERF-0003](../performance/PERF-0003-b3-windows-identity.md) |
| Bancs d'essai et licence de la dépendance candidate | `spikes/`, dont `spikes/b3-windows-identity/LICENCE.md` |
| Contrôles d'exécution de l'exécuteur | [VALIDATION.md](../ai/VALIDATION.md) section O |

## 2. Résultat du contrôle

**Le contrôle indépendant est accepté.** `TASK-0012` **remplit** ses critères
d'acceptation de §15 : les cinq bancs d'essai ont été exécutés, chacun a rendu
un verdict écrit selon ses propres critères, toutes les données étaient
synthétiques, aucun fichier de production n'a changé, chaque mesure porte son
protocole et son matériel, et les échecs comme les réfutations ont été publiés
sans atténuation.

**`TASK-0012` passe donc à `VERIFIED`.** Cette attribution vient d'une instance
**distincte** de l'exécuteur, conformément à `AGENTS.md` : l'exécuteur ne
s'attribue jamais `VERIFIED`.

**La question 3 de `B4` ne bloque pas `VERIFIED`.** §11.3 de `TASK-0012` prévoit
explicitement qu'une question sans source officielle soit **déclarée non
résolue** : la déclarer est le livrable conforme. Elle bloque autre chose, et
c'est écrit en section 4, point F.

## 3. Les réserves R1 à R9 — conservées, et non recopiées

Le contrôle a assorti son acceptation de **neuf réserves, numérotées `R1` à
`R9`**.

**Leur texte intégral n'a pas été transmis à l'exécuteur documentaire** avec le
GO de clôture : il appartient au rapport de contrôle de l'orchestrateur. Il
n'est donc **ni recopié, ni reformulé, ni résumé dans le dépôt** — une
reformulation de mémoire serait une atténuation, et l'instruction reçue
interdit d'atténuer.

**Ce qui est établi et applicable dès maintenant :**

1. `R1` à `R9` sont **en vigueur**. Le passage à `VERIFIED` ne les lève pas,
   ne les périme pas et ne les affaiblit pas.
2. **Aucune fiche du dépôt ne peut déclarer l'une de ces réserves levée** sans
   une preuve écrite qui la lève nommément.
3. Le **texte intégral de `R1` à `R9` doit être joint au dossier** par
   l'orchestrateur, en annexe de la présente fiche, pour que le dépôt soit
   autoportant. **Tant que ce texte n'est pas joint, cette lacune est déclarée
   ici plutôt que comblée**, exactement comme la question 3 de `B4`.

> **Mise à jour du 2026-08-31 — lacune comblée.** Le texte intégral de `R1` à
> `R9` a depuis été transmis, et il est joint en **annexe A** de la présente
> fiche. Le paragraphe ci-dessus est conservé tel qu'écrit : il décrit l'état au
> moment de la clôture. **Aucune réserve n'est levée** par ce complément.

### 3 bis. Réserves déjà écrites dans le dépôt, distinctes de R1 à R9

Ces réserves ont été publiées par `TASK-0012` elle-même. Elles **restent
entières** et sont rappelées ici pour qu'aucune ne se perde à la clôture. Elles
ne sont **pas** une reconstitution de `R1` à `R9`.

| Réserve déjà publiée | Où |
|---|---|
| `SIGKILL` n'est pas une coupure de courant; la durabilité face à une panne d'alimentation n'est **pas** testée | rapport §2.8.1 |
| Disque plein **simulé** par injection `SQLITE_FULL`, jamais réel; les échecs de copie et de renommage par manque d'espace ne sont pas couverts | rapport §2.8.2 |
| Un seul volume, un seul système de fichiers; aucun essai sur volume réseau, support amovible ou dossier synchronisé | rapport §2.8.3 |
| Aucun accès concurrent, aucun antivirus tenant un verrou | rapport §2.8.4 |
| Moteurs différents de la production : `node:sqlite` et non `rusqlite`; Chrome et non WebView2 | rapport §2.8.6, §3.9.2 |
| Une seule machine, nettement au-dessus d'un poste ordinaire : les chiffres de `B2` sont un **plafond favorable** | rapport §3.9.3 |
| Un seul algorithme de calepin; le pavage squarifié **n'a pas été testé** | rapport §3.9.5 |
| `revirtualisations = 0` : le mode `transform` est mesuré dans son cas **le plus favorable** | rapport §3.9.6 |
| Aucun lecteur d'écran réel; la conformité porte sur les **attributs produits** | rapport §3.9.1 |
| Ni Canvas 2D ni WebGL mesurés | rapport §3.9.8 |
| Comportement **inter-volume** de `B3` **non observé** | rapport §4.4 |
| Question 3 de `B4` **non résolue**, recherche interrompue par une limite de dépense | rapport §5.6 |
| **`SYN-100K` n'a pas été joué** par `B2`, alors que le protocole de falsification de `DEC-0008` l'exige | constat de clôture, voir section 4 point C |

## 4. Décisions arrêtées à la clôture

Les six arbitrages sont enregistrés en fiche de décision :
**[DEC-0013](../decisions/DEC-0013-post-risk-gate-technical-arbitration.md)**.
Résumé, sans valeur normative propre — la fiche `DEC-0013` fait foi :

| # | Décision |
|---|---|
| A | `TASK-0012` → **`VERIFIED`**, réserves `R1` à `R9` maintenues; la question 3 de `B4` ne bloque pas |
| B | **`M-B` baseline** : copie de sûreté **de fichier** sur base **quiescée**, migration transactionnelle **en place**, restauration si échec. `M-C` naïve **réfutée**; `M-C` durcie **documentée** comme alternative défensive, jamais baseline. Le `M-B` mesuré **n'exerçait pas** l'API SQLite Online Backup |
| C | **Pas de Canvas 2D maintenant**; HTML/SVG accessible conservé; **plafond universel de 3 000 blocs abandonné**; direction = **budget de rendu auto-régulé** + **étude d'un calepin squarifié**; les valeurs de `B2` ne sont **pas** des plafonds universels; **réserve `SYN-100K`** respectée |
| D | Inter-volume **non testé maintenant**, rien hors dépôt, point conservé **NON TESTÉ**; invariant obligatoire **`VolumeSerialNumber` + `FileId`**, **`FileId` seul interdit** |
| E | **Aucune suppression** dans cette étape; le cache incrémental fautif sera **conservé ou renommé avant** renouvellement, dans une tâche distincte, pour préserver la reproduction de la panique |
| F | Identité après hydratation **ouverte**; risque **requalifié** en perte potentielle d'**état utilisateur non reconstructible, possiblement en masse**; à **fermer avant** l'identité persistante et l'état vu/non vu |

## 5. Ce que cette étape a fait, et n'a pas fait

**Fait :** écriture de la présente fiche; création de `DEC-0013`; passage de
`TASK-0012` à `VERIFIED`; renvois ajoutés en fin de `DEC-0008`, `DEC-0009` et
`DEC-0011`; clarification de gouvernance dans `AGENTS.md` et `CLAUDE.md`;
préparation de la fiche `TASK-0013`; mise à jour de la mémoire obligatoire.

**Non fait, volontairement :**

- **Aucun banc d'essai relancé**, aucune mesure refaite, aucun chiffre nouveau.
- **Aucune modification des documents de preuve.** Le rapport de `TASK-0012` et
  les fiches `PERF-0001` à `PERF-0003` sont **intacts**. La requalification du
  risque de `B4` (point F) est écrite dans `DEC-0013`, **pas** dans le rapport :
  on ne réécrit pas une preuve après coup.
- **Aucun texte existant supprimé ni atténué** dans `DEC-0008`, `DEC-0009` et
  `DEC-0011` : les renvois sont **ajoutés en fin de fiche**.
- **Aucun code de production touché**, aucun test, aucune dépendance, aucun
  verrou, aucun fichier de `graph/`.
- **Aucun nettoyage** du cache incrémental de `src-tauri/target/`.
- **Aucun accès hors dépôt**, aucune lecture, aucun listage, aucune écriture.
- **Aucune fusion, PR, release, étiquette, `force push`**, aucun push vers
  `main` ni vers `rebuild/v0.2-project-brain`. **Aucune dépense.**
- **La fiche `TASK-0013` n'est pas exécutée** : elle est `PROPOSED` et attend
  un GO d'exécution.

## 6. Limites de ce contrôle

1. **Le contrôle porte sur les preuves publiées, pas sur une réexécution.**
   Aucun banc d'essai n'a été rejoué par le contrôleur; l'acceptation vaut pour
   la cohérence, la complétude et l'honnêteté des preuves écrites.
2. **Les mesures conservent toutes leurs limites déclarées.** `VERIFIED` porte
   sur la **tâche**, pas sur la généralité des chiffres.
3. **Le texte de `R1` à `R9` manque au dépôt** (section 3). C'est la lacune
   connue de cette fiche.
   **Comblée le 2026-08-31 :** voir l'annexe A. La lacune est close; les neuf
   réserves, elles, restent entières et en vigueur.
4. **Trois points restent ouverts** et le resteront tant qu'une tâche ne les
   ferme pas : l'inter-volume de `B3`, la question 3 de `B4`, et l'échec de
   `B0`.

---

## Annexe A — Texte intégral des réserves `R1` à `R9`

- **Ajoutée le :** 2026-08-31, sous le GO technique de l'orchestrateur donné à
  l'ouverture de `TASK-0013`.
- **Provenance :** rapport de contrôle de l'orchestrateur technique, transmis
  **verbatim**.
- **Effet :** la lacune déclarée en **section 3, point 3** et en **section 6,
  point 3** est **comblée**. Le dépôt est désormais autoportant sur ce point.
- **Ce que cette annexe ne fait pas :** elle **ne lève aucune réserve**, n'en
  atténue aucune, n'en reformule aucune et ne modifie aucun verdict.
  `TASK-0012` reste `VERIFIED` **avec ses neuf réserves maintenues**.

> Les neuf énoncés ci-dessous sont reproduits **sans changement de sens**. Ils
> sont numérotés comme dans le rapport de contrôle.

### `R1` — `SYN-100K` n'a pas été joué

`B2` a mesuré 20 000 nœuds alors que `DEC-0008` écrit sa condition de
falsification sur `SYN-100K`. `B2` respecte `TASK-0012` telle qu'écrite, mais
`DEC-0008` n'a pas été littéralement falsifiée selon son protocole complet.

### `R2` — Catégorie de verdict hors grille dans `B3`

`B3` a utilisé la catégorie « incomplet par périmètre », absente de la grille
écrite **confirmée / sous réserve / réfutée**. Cela ne bloque pas `VERIFIED`,
mais cette déviation de catégorie doit rester déclarée.

### `R3` — `B1` a conclu là où `DEC-0011` imposait un arbitrage

`B1` conclut `M-C` réfutée telle qu'écrite et montre une variante durcie, alors
que `DEC-0011` rendait `M-B` obligatoire dès qu'un point requis échouait. Cela
ne bloque pas `VERIFIED` mais devait être tranché par arbitrage — désormais
`DEC-0013`.

### `R4` — Le `M-B` mesuré n'exerçait pas l'API SQLite Online Backup

Le `M-B` mesuré utilisait une copie de fichier (`fs.copyFileSync`), pas l'API
SQLite Online Backup. L'objection historique de `DEC-0011` contre cette API n'a
donc pas été exercée par `B1`.

### `R5` — Le rapport en 11 points n'existe pas comme fichier unique

Le rapport final en 11 points demandé par `TASK-0012` §17 a été remis à
l'orchestrateur/Sébastien mais n'existe pas comme fichier versionné unique; son
contenu est réparti dans les documents de preuve et de mémoire. Cette réserve
ne bloque pas `VERIFIED`.

### `R6` — Anomalie cosmétique de numérotation

Le journal de résultats possède une anomalie cosmétique de numérotation autour
de §3.7 / §3.7 bis. Aucun effet sur les preuves.

### `R7` — Le chiffre `SYN-WIDE` « 939 » est une borne d'encadrement

Le chiffre `SYN-WIDE` « 939 » utilisé dans certaines synthèses est une borne
d'un encadrement mesuré de **939 à 1 795 blocs**. Toute citation future de 939
doit conserver cet encadrement.

### `R8` — Les mesures ne sont pas transposables à la production

Les mesures ne sont pas directement transposables à la production : `B1`
utilise `node:sqlite` et non `rusqlite`; `B2` utilise Chrome et non WebView2.
Cette limite interdit de présenter les résultats comme mesures de production.

### `R9` — « Aucune dépense » et la limite de dépense de `B4` sont compatibles

`VALIDATION` indique « aucune dépense » tandis que `B4` rapporte qu'une limite
de dépense du compte a interrompu une recherche. Les deux sont compatibles : la
dépense a été **refusée**, rien n'a été facturé. Conserver cette précision.

### Portée des neuf réserves

| Réserve | Bloque `VERIFIED` ? | Où elle continue de s'appliquer |
|---|---|---|
| `R1` | Non | `TASK-0013` `F6` — `SYN-100K` doit réellement être joué |
| `R2` | Non | Toute grille de verdict future doit s'en tenir aux trois catégories écrites |
| `R3` | Non | Tranché par `DEC-0013` B |
| `R4` | Non | `DEC-0013` B, « Une précision qui n'est pas un détail » |
| `R5` | Non | Dossier `TASK-0012`, réserve documentaire ouverte |
| `R6` | Non | Rapport `TASK-0012`, cosmétique, non corrigé pour ne pas réécrire une preuve |
| `R7` | Non | Toute citation de `SYN-WIDE` doit écrire « 939 à 1 795 » |
| `R8` | Non | `TASK-0013` §5.4 et `F8` — moteur réellement employé, étiqueté |
| `R9` | Non | `VALIDATION.md`, précision à conserver |
