# DEC-0013 — Arbitrage technique après les bancs d'essai de TASK-0012

- **Date :** 2026-08-31
- **Statut :** `APPROVED`
- **Phase :** 1 bis — entre les bancs d'essai de
  [TASK-0012](../tasks/TASK-0012-technical-risk-gates.md) et le premier code
  de production
- **Décideur :** **orchestrateur technique**, sous la **délégation explicite
  de Sébastien du 2026-08-31** (voir [AGENTS.md](../../AGENTS.md), section
  « Délégation d'orchestration technique »). Sébastien conserve la direction
  produit et les points d'arrêt réservés.
- **Approuvée le :** 2026-08-31
- **replaced_by :** —

> **Cette fiche ne remplace ni `DEC-0008`, ni `DEC-0009`, ni `DEC-0011`.**
> Elle les **complète** sur les points que les bancs d'essai `B1` à `B4` ont
> atteints. Le texte de ces trois fiches est conservé intact; chacune porte
> désormais un renvoi vers celle-ci. Aucun historique n'est réécrit.

## Contexte

`TASK-0012` a exécuté cinq bancs d'essai et publié cinq verdicts. Le contrôle
indépendant `ACTION-0021` a été mené, ses preuves acceptées, et `TASK-0012`
est passée à `VERIFIED`
([ACTION-0021-independent-control.md](../reviews/ACTION-0021-independent-control.md)).

Les verdicts **alimentaient** des décisions sans en prendre aucune :
`TASK-0012` §14 interdisait explicitement de modifier une fiche `DEC`. Cette
interdiction a été respectée jusqu'à la clôture. La présente fiche est le lieu
prévu où les verdicts deviennent des décisions.

Six points sont arbitrés ici, et seulement six.

## Décision

| # | Objet | Ce qui est retenu |
|---|---|---|
| A | Statut de `TASK-0012` | `VERIFIED`, réserves `R1` à `R9` du contrôle **maintenues** |
| B | Stratégie de migration | **`M-B` devient la baseline**; `M-C` naïve **réfutée**; `M-C` durcie conservée comme alternative défensive **documentée**, jamais baseline |
| C | Rendu de la carte | **Canvas 2D n'est pas ouvert**; HTML/SVG accessible conservé; le **plafond universel de 3 000 blocs est abandonné** comme règle de conception, remplacé par un **budget de rendu auto-régulé**, avec **étude d'un calepin squarifié** |
| D | Identité Windows | L'invariant **`VolumeSerialNumber` + `FileId`** est obligatoire; **`FileId` seul est interdit**; l'inter-volume reste **NON TESTÉ** et n'est pas testé maintenant |
| E | Échec de `B0` | **Aucun nettoyage maintenant.** Le cache incrémental fautif devra être **conservé ou renommé avant renouvellement**, dans une tâche distincte, pour préserver la reproduction de la panique du compilateur |
| F | Identité après hydratation (`B4` question 3) | **Reste ouverte**, et son risque est **requalifié** : perte potentielle d'**état utilisateur non reconstructible**, possiblement **en masse**. À fermer **avant** l'implémentation de l'identité persistante et de l'état vu/non vu |

---

## A. `TASK-0012` est `VERIFIED`, avec ses réserves

Le contrôle indépendant est accepté. `TASK-0012` passe de `IMPLEMENTED` à
`VERIFIED`, sur les preuves publiées, pas sur une déclaration de l'exécuteur.

**Les neuf réserves `R1` à `R9` émises par le contrôle sont conservées
explicitement.** Elles ne sont ni effacées, ni atténuées, ni réputées levées
par le passage à `VERIFIED`. Leur statut et leur portée sont décrits par
[ACTION-0021-independent-control.md](../reviews/ACTION-0021-independent-control.md).

La question 3 de `B4` **ne bloque pas** `VERIFIED` : elle a été déclarée non
résolue conformément à §11.3 de `TASK-0012`, et une question déclarée non
résolue est un livrable conforme, pas un manquement. Elle bloque autre chose —
voir F.

## B. `M-B` devient la stratégie de migration baseline

**Retenu :** copie de sûreté **de fichier**, prise sur une base **quiescée**,
puis **migration transactionnelle en place**, et **restauration si échec**.

**`M-C` naïve — telle que `DEC-0011` la décrit — est réfutée.** `B1` a
reproduit la corruption : un `-wal` orphelin laissé par un écrivain tué survit
au `rename`, devient mécaniquement le `-wal` de la base neuve, et
`integrity_check` échoue
([rapport §2.3](../research/TASK-0012-risk-gate-results.md)).

**`M-C` durcie reste documentée comme alternative défensive étudiée.** Elle a
passé les points 2 à 7 sur les scénarios joués, pour un coût en temps nul
(776,9 ms contre 778,4 ms). Elle **n'est pas la baseline** et aucun code ne
peut la présumer.

### Une précision qui n'est pas un détail

**Le `M-B` mesuré par `B1` n'exerçait pas l'API SQLite Online Backup.** Le
spike utilisait une **copie de fichier** (`fs.copyFileSync`), base fermée. Il
est **interdit** d'écrire ou de laisser entendre que la limite documentée par
l'éditeur — « if the backup process is restarted frequently enough it may never
run to completion », preuve `P1` de `DEC-0011` — aurait été levée, contournée
ou mesurée. Elle ne l'a pas été.

C'est précisément pourquoi la variante retenue **quiesce la base avant de
copier** : elle évite la limite au lieu de la traiter. Ce que cela impose est
écrit en « Conséquences ».

**Motif du renversement `M-C` → `M-B`.** `DEC-0011` classait `M-C` première
sur un raisonnement : « l'ancienne base n'est pas copiée, elle est laissée
telle quelle ». Ce raisonnement tenait tant que la bascule était supposée
sûre. `B1` a montré que la bascule, écrite comme elle l'était, **détruit la
base cible**. L'avantage revendiqué reposait donc sur une prémisse fausse.
`M-B`, dans sa variante sur base quiescée, n'a **aucune** étape de permutation
à écrire correctement, et `B1` l'a observée sûre sur les mêmes scénarios,
15 % plus rapide.

## C. Rendu : ni Canvas 2D maintenant, ni plafond universel

**Canvas 2D n'est pas ouvert.** `B2` a rendu le verdict « étude Canvas 2D
autorisée » — l'étude, jamais l'adoption. Cette autorisation **n'est pas
exercée maintenant**. Motif : `B2` n'a mesuré **ni Canvas 2D ni WebGL**, et
ARIA et clavier sont conformes dans les 18 scénarios jusqu'à 5 002 blocs —
un acquis que Canvas 2D devrait **entièrement reconstruire**. Ouvrir Canvas
aujourd'hui échangerait un acquis mesuré contre un gain non mesuré.

**HTML/SVG accessible reste la direction**, conformément à l'option A de
`DEC-0008`.

**Le plafond universel fixe de 3 000 blocs est abandonné comme règle de
conception.** `B2` l'a réfuté par le bas et par le haut à la fois : 3 743
blocs sur `SYN-EQUILIBRE`, 3 063 sur `SYN-DEEP`, **entre 939 et 1 795** sur
`SYN-WIDE`. Un plafond exprimé en nombre de blocs ne décrit pas ce qui
détermine le coût; la **géométrie produite** compte autant.

**Direction retenue à sa place :**

1. un **budget de rendu auto-régulé** — le rendu s'ajuste à ce que la machine
   soutient, au lieu d'obéir à une constante écrite d'avance;
2. l'**étude d'un calepin squarifié**, comparé au découpage alterné actuel,
   parce que l'effondrement de `SYN-WIDE` vient de lamelles très étroites et
   très hautes, coûteuses à tramer — une conséquence de l'algorithme de
   calepin, pas une propriété du DOM.

### Deux règles de lecture, obligatoires

**Les valeurs de `B2` ne sont pas des plafonds universels.** Elles ont été
obtenues sur **une** machine nettement au-dessus d'un poste ordinaire, dans
**Chrome 151**, avec **un seul** algorithme de calepin, `revirtualisations = 0`
sur toutes les mesures de déplacement. Aucune fiche, aucune communication et
aucun code ne peut les citer comme une capacité du produit.

**Réserve `SYN-100K` — à ne pas perdre.** Le protocole de falsification écrit
par `DEC-0008` exige `SYN-100K`, `SYN-DEEP` **et** `SYN-WIDE`. `B2` a mesuré
`SYN-EQUILIBRE`, `SYN-DEEP` et `SYN-WIDE`; **`SYN-100K` n'a pas été joué**.
`B2` **ne falsifie donc pas littéralement `DEC-0008` selon son protocole
complet**. Le verdict « étude Canvas 2D autorisée » est valide selon les
critères de `TASK-0012` §9.2, mais la volumétrie exigée par `DEC-0008` reste
un **trou de preuve déclaré**, que la tâche suivante doit combler.

## D. Identité Windows : l'invariant est la paire, jamais le `FileId` seul

**Invariant architectural obligatoire :** une identité système est le couple
**`VolumeSerialNumber` + `FileId` 128 bits**. **Utiliser `FileId` seul est
interdit**, dans tout code, tout schéma, tout index et toute comparaison.

Motif : la source Microsoft citée par `DEC-0009` (`P1`) et par `B4` (`S6`)
n'énonce l'unicité que pour le **couple** — « combine the identifier and the
volume serial number for each file and compare them ». Un `FileId` seul peut
coïncider entre deux volumes; un tel faux positif écrirait une identité
fausse, ce que `I-E` interdit par construction.

**Le comportement inter-volume reste `NON TESTÉ`, et n'est pas testé
maintenant.** Le tester exigerait d'écrire hors du dépôt, ce que §13.2 de
`TASK-0012` érige en condition d'arrêt et que la délégation en vigueur réserve
à Sébastien. Rien n'est lu, listé ni écrit hors du dépôt. Ce point conserve
son étiquette **NON TESTÉ** : aucune fiche ne peut le présenter autrement.

## E. `B0` : rien n'est supprimé maintenant

`cargo build --locked` échoue par une panique interne de `rustc 1.98.0`,
4 fois sur 4, à cause du **cache de compilation incrémentale** de
`src-tauri/target/`, ignoré par Git; `CARGO_INCREMENTAL=0` réussit. Le code
source, lui, compile.

**Aucun nettoyage n'est autorisé dans l'étape courante.** Quand le
renouvellement sera fait, il le sera dans une **tâche distincte**, et le cache
fautif devra être **conservé ou renommé avant** d'être renouvelé, afin que la
**reproduction de la panique reste possible**. Supprimer ce cache détruirait
la seule reproduction connue d'un défaut du compilateur observé sur ce projet.

## F. Identité après hydratation : ouverte, et son risque est requalifié

La question 3 de `B4` — l'identité de fichier survit-elle à une hydratation ou
à une déshydratation ? — **reste ouverte**. Aucune source Microsoft n'a été
trouvée; la recherche par moteur a été interrompue par une limite de dépense
du compte. La lacune est déclarée, jamais comblée.

**Requalification du risque.** Le rapport `B4` §5.6 conclut que le risque est
« d'ergonomie, pas d'intégrité », au motif que l'heuristique de `I-E` n'est
qu'une suggestion. **Cette appréciation est corrigée ici.** Le rapport est
conservé tel quel — on ne réécrit pas une preuve — mais la lecture qui fait
foi pour la suite est la suivante :

> Si l'identité système change à l'hydratation, tout état **attaché à cette
> identité** cesse d'être retrouvé : état vu/non vu, couleur, préférences,
> relations approuvées, journal. C'est une **perte potentielle d'état
> utilisateur non reconstructible**, et elle peut survenir **en masse** —
> un fournisseur de synchronisation peut hydrater ou déshydrater des milliers
> d'éléments en une opération, sans intervention de l'utilisateur.

Un état non reconstructible perdu ne se retrouve pas par réindexation : c'est
exactement la classe de défaut que `S-C` de `DEC-0011` a été retenue pour
éliminer.

**Conséquence de porte :** cette question doit être **fermée avant**
l'implémentation de l'identité persistante et de l'état vu/non vu. Aucune de
ces deux fonctions ne peut être écrite tant qu'elle reste ouverte.

---

## Conséquences

- **`DEC-0011`** : `M-B` est la baseline. Tout code de migration écrit
  ensuite doit **quiescer la base avant la copie de sûreté**, poser un **délai
  maximal**, et **ne jamais** invoquer l'API Online Backup sans traiter sa
  limite `P1`. `M-C` durcie ne peut être choisie que par une décision
  ultérieure explicite.
- **`DEC-0008`** : aucun nombre fixe de blocs ne peut être écrit dans le code
  comme plafond de conception. Le premier rendu écrit devra porter un **budget
  auto-régulé**; l'algorithme de calepin devient une **variable de conception**,
  pas un acquis.
- **`DEC-0009`** : `FileId` seul est interdit; la paire est obligatoire. Le
  repli déterministe par chemin reste la seule autre source d'identité.
- L'implémentation de l'identité persistante et de l'état vu/non vu est
  **bloquée** par F.
- Le renouvellement du cache de `B0` exige une tâche distincte, avec
  conservation préalable.
- **Aucune ligne de code de production n'est autorisée par cette fiche.** La
  porte P4 reste ouverte et non franchie.

## Preuves

| # | Fait | Source | Consultée le |
|---|---|---|---|
| Q1 | Corruption de la base cible par `-wal` orphelin sous `M-C` naïve; `M-C` durcie passe pour un coût en temps nul | [rapport §2.3, §2.6, §2.7](../research/TASK-0012-risk-gate-results.md), [PERF-0002](../performance/PERF-0002-b1-sqlite-migration.md) | 2026-08-31 |
| Q2 | Le `M-B` du spike est une **copie de fichier**, base fermée, pas l'API Online Backup | [rapport §2.1, §2.6](../research/TASK-0012-risk-gate-results.md) | 2026-08-31 |
| Q3 | Limite éditeur de l'API Online Backup, non levée par `B1` | https://www.sqlite.org/backup.html, reprise en `P1` de [DEC-0011](DEC-0011-brain-isolation-and-migrations.md) | 2026-08-31 |
| Q4 | Plafonds mesurés 3 743 / 3 063 / 939–1 795 selon la forme; `SYN-WIDE` à 14,08 ips contre 30 exigées | [rapport §3.6, §3.7](../research/TASK-0012-risk-gate-results.md), [PERF-0001](../performance/PERF-0001-b2-rendering.md) | 2026-08-31 |
| Q5 | Un seul algorithme de calepin mesuré; le pavage squarifié **n'a pas été testé**; `SYN-100K` **n'a pas été joué** | [rapport §3.6, §3.9](../research/TASK-0012-risk-gate-results.md) | 2026-08-31 |
| Q6 | ARIA et clavier conformes dans les 18 scénarios jusqu'à 5 002 blocs; Canvas 2D et WebGL **non mesurés** | [rapport §3.8, §3.9](../research/TASK-0012-risk-gate-results.md) | 2026-08-31 |
| Q7 | Identité obtenable sur Rust stable, 28,3 µs/élément, survit au renommage et au déplacement intra-volume; **inter-volume non observé** | [rapport §4.3, §4.4, §4.5](../research/TASK-0012-risk-gate-results.md), [PERF-0003](../performance/PERF-0003-b3-windows-identity.md) | 2026-08-31 |
| Q8 | L'unicité n'est énoncée que pour le **couple** `VolumeSerialNumber` + `FileId` | https://learn.microsoft.com/en-us/windows/win32/api/winbase/ns-winbase-file_id_info | 2026-08-31 |
| Q9 | Panique de `rustc 1.98.0` reproduite 4 fois sur 4; `CARGO_INCREMENTAL=0` réussit; cause = cache incrémental, pas le code source | [rapport §1.3](../research/TASK-0012-risk-gate-results.md) | 2026-08-31 |
| Q10 | Aucune source Microsoft sur la survie de l'identité à une hydratation; recherche interrompue par une limite de dépense | [rapport §5.6](../research/TASK-0012-risk-gate-results.md) | 2026-08-31 |

## Limites

- **Cette fiche ne mesure rien.** Elle arbitre sur les mesures de `TASK-0012`,
  avec toutes les limites que celles-ci déclarent : une seule machine, un seul
  volume NTFS, `SIGKILL` et non coupure de courant, disque plein simulé,
  moteurs différents de la production (`node:sqlite` et non `rusqlite`,
  Chrome et non WebView2).
- **Le budget de rendu auto-régulé n'existe pas.** C'est une direction, pas un
  mécanisme : aucun algorithme n'est décidé ici, aucun n'a été mesuré.
- **Le calepin squarifié n'a pas été testé.** Rien ne garantit qu'il corrige
  l'effondrement de `SYN-WIDE`; il peut le déplacer ailleurs.
- **La réserve `SYN-100K` n'est pas levée** par cette fiche : elle est
  enregistrée et transmise à la tâche suivante.
- **Le comportement inter-volume reste NON TESTÉ**, par décision, pas par
  oubli.
- Les réserves `R1` à `R9` du contrôle indépendant **restent en vigueur** et ne
  sont pas reproduites ici; voir
  [ACTION-0021-independent-control.md](../reviews/ACTION-0021-independent-control.md).
