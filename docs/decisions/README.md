# docs/decisions — Décisions du projet

**Décisions vérifiées :** `DEC-0001` (nom FileTopo), `DEC-0002` (MIT),
`DEC-0003` (Tauri/Rust/React), `DEC-0004` (SQLite et modèle de données),
`DEC-0005` (PixiJS/WebGL et relief). `DEC-0006` (reconstruction sur place)
est `IMPLEMENTED`.

**Décisions approuvées le 2026-08-31**, porte P2 de
[TASK-0011](../tasks/TASK-0011-functional-architecture-baseline.md) franchie
par Sébastien :

| Fiche | État | Ce qui est retenu |
|---|---|---|
| [DEC-0007](DEC-0007-rebuild-tech-stack.md) | `APPROVED` | Option **B** : Tauri 2, Rust stable, React, TypeScript et SQLite conservés; seul le rendu évolue |
| [DEC-0008](DEC-0008-hierarchical-rendering.md) | `APPROVED` | Option **A** : HTML/SVG avec virtualisation et niveaux de détail au MVP; Canvas 2D seulement si `B2` réfute A; WebGL différé |
| [DEC-0009](DEC-0009-data-model-and-relations.md) | `APPROVED` | **I-E** et **R-C** : l'heuristique reste une suggestion et ne préserve jamais automatiquement l'identité ni l'état |
| [DEC-0010](DEC-0010-indexing-and-watching.md) | `APPROVED` | **W-B** avec repli **W-C**; application différentielle **U-B** |
| [DEC-0011](DEC-0011-brain-isolation-and-migrations.md) | `APPROVED` | Stockage **S-C**; **M-C** cible conditionnelle à `B1`, **M-B** repli obligatoire si `B1` échoue |
| [DEC-0012](DEC-0012-ai-architectural-boundary.md) | `APPROVED` | Frontière **F-D** : aucune IA, extraction, embeddings, RAG ni GraphRAG dans le noyau MVP |

**`APPROVED` fixe une direction; ce n'est pas une preuve.** Aucune de ces six
fiches n'a été validée par une exécution : rien n'a été construit, testé ni
mesuré. `M-C` et l'option A restent conditionnées aux bancs d'essai `B1` et
`B2`, spécifiés par [TASK-0012](../tasks/TASK-0012-technical-risk-gates.md),
qui reste `PROPOSED`.

**Mise à jour du 2026-08-31 — les bancs d'essai ont eu lieu.** `TASK-0012` est
`VERIFIED` sur contrôle indépendant
([`ACTION-0021`](../reviews/ACTION-0021-independent-control.md)), et une
septième fiche enregistre les arbitrages qui en découlent :

| Fiche | État | Ce qui est retenu |
|---|---|---|
| [DEC-0013](DEC-0013-post-risk-gate-technical-arbitration.md) | `APPROVED` | **`M-B`** devient la baseline de migration; **Canvas 2D n'est pas ouvert** et le plafond universel de 3 000 blocs est abandonné au profit d'un **budget de rendu auto-régulé**; l'invariant d'identité est le couple **`VolumeSerialNumber` + `FileId`**, `FileId` seul interdit |
| [DEC-0014](DEC-0014-layout-baseline-and-budget-direction.md) | `APPROVED` | Le **pavage squarifié `CAL-B`** devient le calepin baseline; **HTML/SVG accessible** reste la direction; le **contrôleur de budget de `TASK-0013` n'est pas adopté** — `F4` réfutée — mais le **principe** du budget auto-régulé est conservé; **aucune nouvelle tentative WebView2** avant un véritable hôte Tauri |

`DEC-0014` complète `DEC-0008` et `DEC-0013` sur les points que `B2 bis` a
atteints, après le contrôle indépendant
[`ACTION-0023`](../reviews/ACTION-0023-independent-control.md).

**Mise à jour du 2026-08-31 — réalignement produit.** Après le contrôle
indépendant [`ACTION-0024`](../reviews/ACTION-0024-independent-control.md), qui
clôt `TASK-0014` et **rejette** la correction minimale du budget, une huitième
fiche enregistre l'instruction produit de Sébastien et ses suites techniques :

| Fiche | État | Ce qui est retenu |
|---|---|---|
| [DEC-0015](DEC-0015-product-parity-and-layout-scope.md) | `APPROVED` | **CarteTopo est la référence fonctionnelle**; l'ancienne version publique de FileTopo est un **prototype et audit technique**, pas la référence produit; le [contrat de parité](../product/CARTETOPO_FUNCTIONAL_PARITY.md) devient le **contrat produit courant**; **`F-013`, `F-017`, `F-018`, `F-019` passent d'`ULTÉRIEUR` à `MVP`**; **`CAL-B` reste une primitive technique, pas un contrat visuel ni comportemental**; HTML/SVG accessible reste une **technologie candidate autorisée**, validée dans Tauri/WebView2; le **budget adaptatif reste une piste mais cesse d'être un prérequis à `P4`** |

`DEC-0015` **supplante `DEC-0014` sur deux points seulement** — la lecture
produit du point `B` et le statut de prérequis du point `E`. **Le texte de
`DEC-0014` n'a pas été modifié** : elle reçoit un **renvoi** en tête de fiche.
Ses mesures et ses trois restrictions obligatoires — `V1`, `V2`, `R8` —
demeurent entières. **`DEC-0012` est inchangée** : IA, OCR, extraction, RAG et
GraphRAG restent `DIFFÉRÉ`.

Les points `A`, `B` et `C` de `DEC-0015` relèvent de la **direction produit de
Sébastien**, que la délégation d'orchestration technique **ne couvre pas**.

**Mise à jour du 2026-08-31 — la porte `P4` est franchie.** Le contrôle
indépendant [`ACTION-0025`](../reviews/ACTION-0025-independent-control.md) a
accepté le réalignement produit de `TASK-0015`, émis et **corrigé** la réserve
normative `X1`, et **franchi `P4`**. Une neuvième fiche l'enregistre :

| Fiche | État | Ce qui est retenu |
|---|---|---|
| [DEC-0016](DEC-0016-p4-gate-crossing-and-first-slice.md) | `APPROVED` | **`TASK-0015` est `VERIFIED`**; correction normative **`X1`** — une **suggestion n'est pas une provenance de relation**, une relation établie a pour provenance `déterministe` **ou** `approuvée`; **la porte `P4` est FRANCHIE** et autorise **`TASK-0016`, et rien d'autre**; le manque **`M-1`** ne bloque pas `P4` mais doit être résolu **avant** la tranche qui implémente réellement `P-19` |

`DEC-0016` **ne supplante rien** : elle **complète** `DEC-0015` en tirant la
conséquence de son contrôle. **`DEC-0014` et `DEC-0015` sont inchangées**, et
**aucune réserve n'est levée** — `V1` à `V4`, `W1` à `W4`, `R2` à `R9` restent
en vigueur, `R8` ne pouvant l'être qu'à l'**étape C**.

**Mise à jour du 2026-09-01 — FileTopo est multi-cerveaux.** Une dixième fiche
enregistre une **décision de direction produit**, rendue par Sébastien :

| Fiche | État | Ce qui est retenu |
|---|---|---|
| [DEC-0017](DEC-0017-multibrain-and-composed-views.md) | `APPROVED` | **FileTopo est une application multi-cerveaux**; un cerveau a une **identité `brain_id` distincte de sa source**, son index, ses relations, son état, son nom, sa couleur et son icône; le mode normal affiche **un** cerveau actif; une **vue composée** pourra en afficher plusieurs **dans le même graphique, sans jamais les fusionner**; l'affichage conjoint **ne crée jamais** de relation; une relation inter-cerveaux n'existe **qu'explicitement**, sous le modèle de provenance de `TASK-0017`; **supprimer un cerveau ne supprime jamais sa source**; **la couleur n'est jamais le seul identifiant**; ajout de **`F-040`** au modèle produit (`MVP`, matrice à **40** lignes); séquence **`TASK-0018` → `TASK-0019` → `TASK-0020`** |

`DEC-0017` **ne supplante rien** : elle **généralise `P-20`** sans en affaiblir
l'exigence d'isolation, et laisse **`I-1`, `I-2`, `I-3` inchangés**. Le
**contrat de parité n'est pas retouché** et conserve ses 22 exigences. **Aucune
réserve n'est levée.**

**Mise à jour du 2026-09-02 — réalignement produit avant toute nouvelle
implémentation.** `TASK-0020` étant `VERIFIED`
([`ACTION-0032`](../reviews/ACTION-0032-independent-control.md)), Sébastien a
arrêté cinq décisions de **direction produit**, enregistrées par
[`TASK-0021`](../tasks/TASK-0021-product-realignment.md) :

| Fiche | État | Ce qui est retenu |
|---|---|---|
| [DEC-0019](DEC-0019-general-purpose-product-scope.md) | `APPROVED` | **FileTopo n'est PAS un produit juridique.** La cible est **générique** — particuliers, équipes, entreprises, cabinets, développeurs, chercheurs, architecture, comptabilité, juridique, autres. Le juridique est un **cas d'usage important**, jamais une hypothèse d'architecture. **Aucune catégorie métier codée en dur dans le noyau**; des **packs** spécialisés pourront exister plus tard, jamais actifs par défaut |
| [DEC-0020](DEC-0020-topographic-node-graph.md) | `APPROVED` | La **représentation principale finale** est un **graphe topographique hiérarchique à nœuds/cartes et connexions explicites** : nœud identifiable, nom lisible, hiérarchie par **position + connexion**, relations transversales visibles, pan/zoom, repli/dépli et focus **futurs**. Le **treemap n'est PAS la cible visuelle finale** — il reste primitive de calcul, représentation technique et vue secondaire éventuelle. **Correction normative `P02-R1` de `P-02`**, dont l'ancienne formulation est **conservée et visible**. **Aucun algorithme de disposition imposé**; **aucune copie pixel de CarteTopo** |
| [DEC-0021](DEC-0021-deterministic-relation-engine.md) | `APPROVED` | **FileTopo doit être très utile SANS LLM.** *Deterministic Relation Engine* : trois niveaux — **prouvé/observé**, **relation déterministe** (règle nommée, versionnée, explicable), **suggestion**. Une suggestion **n'est jamais** une relation. Architecture de **signaux** extensible; **« hash identique » = contenu binaire identique**, jamais « même fichier physique »; **un score seul ne crée aucune vérité**; workflow humain `PENDING`/`APPROVED`/`REJECTED` avec **file de révision** et **mémoire des rejets**. **Provenance inchangée** : `DETERMINISTIC` ou `APPROVED` |
| [DEC-0022](DEC-0022-optional-byok-ai-layer.md) | `APPROVED` | L'IA n'est **jamais nécessaire au noyau**. Architecture future **provider-agnostic** et **`BYOK`** — le client fournit clé, point de terminaison et contrat. Un `LLM` produit une **suggestion**, **jamais** une relation établie; approuvée, elle reste de provenance **`APPROVED`** — **aucune troisième provenance « AI »**. Niveaux d'autorisation d'envoi à prévoir. **`F-047` `DIFFÉRÉ`**, rien n'est implémenté |
| [DEC-0023](DEC-0023-identity-and-source-permissions.md) | `APPROVED` | **Un seul modèle conceptuel** — `Identity`, `Groups`, `Brains`, `Views`, `Relations`, `Permissions` — pour le **mode personnel** et le **mode équipe**; pas trois produits. **La source reste autoritaire** : NTFS, SMB, NAS, comptes locaux, groupes, AD, autres; **aucun contrôleur de domaine exigé**. « Ne peut pas ouvrir le fichier » **n'est pas suffisant** : nom, chemin, métadonnées, relation, suggestion, résultat et **compteur révélateur** ne sont **pas divulgués**. Toute architecture multi-utilisateur est **permission-aware AVANT** rendu, recherche et relations. **Rien n'est implémenté** |

**Ces cinq fiches ne supplantent rien.** `DEC-0020` **corrige `P-02`** du
contrat de parité et **prolonge** `DEC-0015`; `DEC-0021` **construit sur**
`DEC-0009` et la correction `X1`, dont le modèle de provenance est **inchangé**;
`DEC-0022` **complète** `DEC-0012`, dont la frontière `F-D` tient; `DEC-0023`
**généralise** `DEC-0017` sans affaiblir l'isolation de `P-20`. **`DEC-0011`,
`DEC-0013`, `DEC-0014`, `DEC-0018` sont inchangées. Aucune réserve n'est
levée** — `R8` demeure entière.

**Huit fonctions sont ajoutées** — `F-042` à `F-049` —, la matrice passe de
**41 à 49 lignes**, et **aucune classification existante ne change**. **Le
contrat de parité conserve ses 22 exigences.**

Les points `B` à `N` du prompt de réalignement relèvent de la **direction
produit de Sébastien**, que la délégation d'orchestration technique **ne couvre
pas**. **Aucune de ces cinq fiches n'est prouvée** : ce sont des décisions,
pas des résultats.

`DEC-0013` **complète** `DEC-0008`, `DEC-0009` et `DEC-0011` sans les
remplacer : chacune porte un **amendement en fin de fiche**, et leur texte
d'origine est conservé intact. Le paragraphe ci-dessus reste vrai **au moment
où il a été écrit**; il n'est pas réécrit après coup.

**Exception humaine consignée.** `DEC-0012` ne cite aucune source primaire
externe. Sébastien a accepté cette absence le 2026-08-31 : c'est une décision
**interne de périmètre**, fondée sur la vision approuvée, et l'absence de
source reste déclarée dans la fiche.

Aucune décision n'autorise une réservation, un achat, une publication ni une
ligne de code de production.

## Rôle

Consigner les décisions qui engagent le projet, avec leur date, leur motif et
les options écartées, afin que personne n'ait à les redécouvrir ni à les
rejouer.

## Ce qui mérite une fiche

- Nom public du projet.
- Licence.
- Plateformes cibles.
- Pile technologique et format de stockage de l'index.
- Modèle de données et modèle de relief.
- Toute règle qui contraint durablement la suite.

## Nommage

`DEC-XXXX-<slug>.md`, numérotation à quatre chiffres, dans l'ordre de décision.

## Gabarit

```markdown
# DEC-XXXX — <titre>

- **Date :** AAAA-MM-JJ
- **Statut :** PROPOSED | APPROVED | IN_PROGRESS | BLOCKED | IMPLEMENTED | VERIFIED | REJECTED | DEFERRED
- **Phase :** <numéro>
- **Décideur :** <humain ayant donné le GO>
- **replaced_by :** <DEC-YYYY ou vide>

## Contexte
Ce qui a rendu la décision nécessaire.

## Options examinées
| Option | Avantages | Inconvénients |
|--------|-----------|---------------|

## Décision
Ce qui est retenu, en une phrase.

## Motif
Pourquoi cette option et pas les autres.

## Conséquences
Ce que cela impose ou interdit pour la suite.

## Preuves
Sources, mesures ou constats à l'appui. « Non testé » si rien n'a été vérifié.
```

## Règles

- Une fiche n'est pas modifiée après avoir atteint `VERIFIED` : elle est
  **remplacée** par une nouvelle fiche, et son champ `replaced_by` pointe vers
  la fiche remplaçante (ex. `DEC-0002`). Renseigner `replaced_by` sur une fiche
  `VERIFIED` est la **seule** modification permise, et seulement sous GO
  humain. Trois l'ont été le 2026-08-31 : `DEC-0003` → `DEC-0007`,
  `DEC-0004` → `DEC-0009`, `DEC-0005` → `DEC-0008`; aucun autre contenu de
  `DEC-0001` à `DEC-0006` n'a changé.
- Une fiche `APPROVED` fixe une direction. Elle ne devient `IMPLEMENTED` qu'une
  fois le code correspondant écrit, ni `VERIFIED` avant un contrôle
  indépendant sur preuves.
- Une décision locale et réversible peut être prise sous l'autorisation
  permanente du 2026-08-25. Une fixation externe ou irréversible requiert le
  GO humain spécial prévu par les règles du projet.
- Une décision sans preuve est marquée comme telle.
