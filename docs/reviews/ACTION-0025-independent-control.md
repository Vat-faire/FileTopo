# ACTION-0025 — Contrôle indépendant de TASK-0015, et franchissement de P4

- **Date :** 2026-08-31
- **Objet :** contrôle indépendant du **réalignement produit** livré par
  [TASK-0015](../tasks/TASK-0015-cartetopo-functional-parity.md) — contrat de
  parité, reclassement, `DEC-0015`, feuille de route, fiche `TASK-0016` —
  **puis décision sur la porte `P4`**
- **Contrôleur :** **orchestrateur technique**, instance **distincte** de
  l'exécuteur de `TASK-0015`
- **Cadre :** délégation d'orchestration technique de Sébastien du 2026-08-31
  (voir [AGENTS.md](../../AGENTS.md), section « Délégation d'orchestration
  technique »). Les points `A`, `B` et `C` de `DEC-0015` relèvent de la
  **direction produit de Sébastien** et **ne sont pas rejugés ici**.
- **Rédacteur de la présente fiche :** Claude Code, sous le **GO technique de
  l'orchestrateur** qui porte cette clôture
- **Résultat :** **contrôle accepté**. `TASK-0015` passe de `IMPLEMENTED` à
  **`VERIFIED`**, **avec une réserve normative `X1`, corrigée dans le même
  geste**. **La porte `P4` est FRANCHIE.**

> **Ce que cette fiche est.** L'enregistrement d'un contrôle indépendant, de
> la réserve qui l'accompagne, de la correction normative qu'elle ordonne, et
> de la **décision de franchir `P4`**.
>
> **Ce qu'elle n'est pas.** Elle **ne mesure rien**, **n'exécute rien**, et
> **ne lève aucune réserve technique**. `V1` à `V4`, `W1` à `W4`, `R2` à `R9`
> restent en vigueur. Aucun critère de parité n'a été exécuté par
> `TASK-0015` : ce sont toujours des **cibles à falsifier**.
>
> **Elle ne réécrit aucun historique.** Aucune preuve de `TASK-0012` à
> `TASK-0014` n'est retouchée, et aucun paragraphe de `DEC-0014` n'est modifié.

## 1. Ce qui a été contrôlé

| Objet | Emplacement |
|---|---|
| Contrat de parité, 22 exigences, 3 invariants, 5 manques | [CARTETOPO_FUNCTIONAL_PARITY.md](../product/CARTETOPO_FUNCTIONAL_PARITY.md) |
| Décision produit et arbitrage technique | [DEC-0015](../decisions/DEC-0015-product-parity-and-layout-scope.md) |
| Reclassement des quatre fonctions | [REQUIREMENTS_BASELINE.md](../product/REQUIREMENTS_BASELINE.md), [FEATURE_MATRIX.md](../product/FEATURE_MATRIX.md) |
| Feuille de route `A` à `D` | [ROADMAP.md](../../ROADMAP.md) |
| Fiche de la première tâche `P4` | [TASK-0016](../tasks/TASK-0016-p4-vertical-slice.md) |
| Intégrité de `DEC-0014` | [DEC-0014](../decisions/DEC-0014-layout-baseline-and-budget-direction.md) |
| Périmètre d'exécution déclaré | [VALIDATION.md](../ai/VALIDATION.md), section `TASK-0015` |

## 2. Résultat du contrôle

**Le contrôle est accepté.** `TASK-0015` a produit ses six livrables `L1` à
`L6`, n'a touché aucun fichier de production, n'a rien mesuré et ne s'est pas
auto-attribué `VERIFIED`. Elle passe donc à **`VERIFIED`**, par une instance
**distincte de l'exécuteur**.

**`VERIFIED` porte ici sur la qualité du livrable documentaire, pas sur la
faisabilité du contrat.** Le contrat de parité reste **non testé** : aucune de
ses 22 exigences n'a été exécutée. Un critère qui s'avérerait impossible à
tenir devra redescendre **par décision écrite**, jamais par omission — §8 du
contrat, manque `M-4`.

**Une réserve `X1` est émise, et corrigée dans le même geste** — §4.

## 3. Les sept points que NEXT_ACTION.md imposait de regarder

### 3.1 Couverture du contrat de parité

**Contrôlé.** Les 22 exigences couvrent les domaines nommés par l'instruction
produit : construire la carte (`P-01` à `P-03`), relations (`P-04` à `P-07`),
trouver (`P-08` à `P-10`), naviguer (`P-11` à `P-13`), agir (`P-14`, `P-15`),
suivre les changements (`P-16` à `P-18`), durer (`P-19` à `P-22`).

**Les critères sont falsifiables**, et non déclaratifs : ils exigent des
**égalités d'ensembles** contre l'index (`P-01`, `P-03`, `P-07`, `P-12`,
`P-13`), des **propriétés géométriques** vérifiables nœud par nœud (`P-02`),
des **comparaisons paramètre par paramètre** (`P-11`, `P-19`), des
**empreintes avant/après** (`P-22`) et des **volumétries nommées** (`P-08`,
`P-18`). Chacun est exécutable sur fixtures synthétiques.

**Limite retenue, et déclarée :** certains critères portent une volumétrie —
100 000 nœuds pour `P-08`, rafale de 10 000 événements pour `P-18` — qui
**n'est pas atteignable par la première tranche**. Ce n'est pas un défaut du
contrat : c'est ce qui impose que l'étape **A** compte **plusieurs** tranches.

### 3.2 Liberté visuelle et sa subordination

**Contrôlé, et jugé suffisant.** §3 autorise une refonte complète, puis ferme
les cinq voies par lesquelles une fonction pourrait disparaître sans le dire —
suppression, mise hors d'atteinte, retrait d'invariant, substitution d'une
impression à une information, contournement de l'accessibilité. La règle de
conflit est explicite — **la parité gagne** — et un abandon exige une fiche
`DEC`.

**Le point 2 est le plus utile** : reléguer une exigence derrière un geste non
découvrable **compte comme une suppression**. C'est ce qui empêche une refonte
d'être « conforme » tout en rendant le produit inutilisable.

### 3.3 Règle des relations transversales — réserve X1

**Contrôlé.** §5.1 interdit bien toute relation inventée : deux origines, pas
de troisième; provenance visible **à l'écran**, pas seulement en journal;
stockage **hors de l'arborescence analysée**; interdiction explicite de
déduire une relation d'une proximité graphique ou d'une sélection.

**Mais une contradiction interne a été trouvée**, et elle est normative :

> **`X1` — « suggérée » était employée comme provenance d'une relation.**
> §4, exigence `P-04`, énumérait `déterministe`, `approuvée`, `suggérée`
> comme les provenances d'une relation affichée, et §5.1.2 parlait des « trois
> provenances ». **Or §5.1.3 établit correctement qu'une suggestion N'EST PAS
> une relation.** Une suggestion ne peut donc pas être une **valeur de
> provenance de relation** : la même chose y était à la fois relation et
> non-relation.

**Pourquoi cela n'est pas une querelle de mots.** Une provenance `suggérée`
autorise, à la lettre, un modèle de données où une suggestion est **une ligne
de la table des relations**. À partir de là, tout compte de relations
entrantes et sortantes (`P-05`) devient un piège : il faut se souvenir
d'exclure une valeur d'énumération, et l'oubli est silencieux. `I-3` — rien
n'est inventé silencieusement — est précisément ce qui interdit ce genre de
piège.

**Correction ordonnée, et appliquée** — §4.

### 3.4 Reclassement

**Contrôlé.** `F-013`, `F-017`, `F-018` et `F-019` remontent d'`ULTÉRIEUR` à
`MVP`, chacune avec son **motif d'origine conservé et visible** et le motif du
renversement. **Rien n'est descendu.** `F-021`, `F-037`, `F-038` et `F-039`
restent `DIFFÉRÉ`, et `DEC-0012` est inchangée. La matrice reste à **39**
lignes, répartition `MVP` 35 / `ULTÉRIEUR` 0 / `DIFFÉRÉ` 4 : aucune fonction
n'a été inventée, **y compris** pour combler `M-1`.

### 3.5 DEC-0015 contre DEC-0014

**Contrôlé.** La supplantation porte bien sur **deux points seulement** : la
**lecture produit** de `DEC-0014` B, et le **statut de prérequis** de son
point `E`. **`DEC-0014` est intacte** — un renvoi en tête de fiche, aucun
paragraphe modifié. Les **mesures** de `CAL-B` et ses **trois restrictions
obligatoires** `V1`, `V2`, `R8` sont conservées entières, et rappelées dans
`DEC-0015` D.

### 3.6 Fiche TASK-0016

**Contrôlé.** C'est bien une **tranche verticale** : six exigences couvertes,
une septième partielle et déclarée telle, et une liste explicite de ce qui est
**hors périmètre**. Ses préalables interdisent tout démarrage avant `P4`, et
sa §5.2 exige une **borne de charge déclarée avant exécution**, conformément à
`DEC-0015` F. Ses conditions d'arrêt nomment les points réservés à Sébastien.

**Ce que le contrôle exige en plus, et qui devient obligatoire à
l'approbation :** les critères `H1` à `H11` de sa §6 sont une **trame**. Ils
doivent être **complétés, commités et figés avant la première exécution**, sur
le modèle de `TASK-0013` et `TASK-0014`. Voir §5.

### 3.7 Manque M-1

**Contrôlé, et jugé suffisant à ce stade.** La persistance des préférences n'a
pas de fonction propre dans la matrice; `TASK-0015` l'a **déclaré** plutôt que
d'inventer une fonction. C'est le bon geste : inventer une ligne de matrice
pour combler un trou de couverture aurait produit une matrice fausse.

**Mais `M-1` porte une échéance**, et elle est fixée ici — §5, `D6`.

## 4. Réserve X1 et correction normative

**`X1` est émise, et corrigée dans le même geste**, parce que la contradiction
est **interne au contrat** et qu'aucune portée n'a besoin de changer pour la
lever.

**Ce qui est corrigé, et rien d'autre :**

| Emplacement | Avant | Après |
|---|---|---|
| §4, `P-04` | provenance parmi `déterministe`, `approuvée`, `suggérée` | **relation établie** : provenance `déterministe` **ou** `approuvée`, sans troisième valeur; **suggestion = objet distinct**, jamais comptée comme relation avant approbation, affichable mais **jamais présentée comme relation établie** |
| §5.1.2 | « les trois provenances » | **deux** provenances pour une relation établie; la **suggestion** est un **état distinct**, lui aussi distinguable sans recourir à la seule couleur |
| §5.1.3 | « une suggestion n'est pas une relation » | inchangé sur le fond, **précisé** : objet et état distincts, jamais une valeur de provenance; **affichable**; l'approbation la **transforme** en relation de provenance `approuvée`, **seule voie** |

**Ce qui n'est pas corrigé, volontairement :** §5.2 interdisait déjà de
présenter une relation suggérée comme établie et de la faire entrer dans les
comptes de `P-05`. Cette formulation reste, telle quelle : elle était déjà
juste. **Seules les formulations directement contradictoires ont été
alignées.** Aucune portée n'a changé, aucune exigence n'a été ajoutée ni
retirée, et **aucun historique n'a été réécrit**.

**Conséquence obligatoire pour tout code futur :** le modèle de données doit
rendre **non représentable** une relation établie sans provenance
`déterministe` ou `approuvée`, et **ne doit pas** ranger les suggestions parmi
les relations établies sans un état qui les en sépare de façon structurelle.
Une suggestion n'entre dans aucun compte de `P-05`.

**Portée pour la première tranche :** `TASK-0016` **ne contient aucune
relation transversale**. `X1` ne lui impose donc aucun travail; elle contraint
la tranche qui implémentera `P-04`, `P-05` et `P-07`.

## 5. Décisions du contrôle

| # | Décision |
|---|---|
| `D1` | **`TASK-0015` passe à `VERIFIED`**, avec la réserve `X1`, **corrigée** |
| `D2` | **Le contrat de parité est accepté** comme contrat produit courant, avec sa correction `X1` |
| `D3` | **CarteTopo reste la référence FONCTIONNELLE.** **L'apparence de FileTopo reste libre et peut être entièrement modernisée** — la parité gagne en cas de conflit |
| `D4` | **`F-013`, `F-017`, `F-018`, `F-019` restent `MVP`** |
| `D5` | **IA, OCR, extraction de contenu, RAG et GraphRAG restent `DIFFÉRÉ`.** `DEC-0012` inchangée |
| `D6` | **`M-1` ne bloque pas `P4`.** Il **devra être résolu avant la tranche qui implémente réellement la persistance complète des préférences** — `P-19`. Le résoudre veut dire : créer une fonction propre dans la matrice, **ou** rattacher explicitement chaque valeur à une fonction existante, par décision écrite |
| `D7` | **`H1` à `H11` de `TASK-0016` deviennent obligatoires**, et doivent être **complétés, commités et figés avant la première exécution** |
| `D8` | **La porte `P4` est FRANCHIE** — §6 |

## 6. La porte P4 est franchie

**`P4` est FRANCHIE.**

**Ce que le franchissement autorise :** l'**approbation puis l'exécution de
[`TASK-0016`](../tasks/TASK-0016-p4-vertical-slice.md)**, dans le périmètre
écrit de sa §4, et **rien d'autre**.

**Ce qu'il n'autorise pas**, explicitement :

- **aucune autre tâche d'implémentation** — une tranche suivante exige sa
  propre fiche et son propre GO;
- **aucun élargissement** de `TASK-0016` au-delà de sa §4 — ni relations
  transversales, ni recherche, ni surveillance, ni journal, ni plusieurs
  cerveaux;
- **aucun budget adaptatif**, et **aucune reprise** d'un contrôleur de
  `TASK-0013` ou `TASK-0014` — `DEC-0015` F;
- **ni Canvas 2D, ni WebGL** — `DEC-0013` C, `DEC-0015` E;
- **aucun sélecteur de dossier réel**, aucune donnée réelle, aucune dépense,
  aucune publication externe exceptionnelle : **points d'arrêt réservés à
  Sébastien**, inchangés;
- **aucune levée de réserve.** `R8` en particulier ne peut être levée qu'à
  l'**étape C**. Les premières mesures dans WebView2 sont un **point de
  comparaison**, pas une validation.

**Ce que le franchissement ne présume pas.** Il ne présume ni que le contrat
de parité est tenable, ni que HTML/SVG suffira dans WebView2, ni qu'une
performance quelconque sera atteinte. Il constate que **la cible est écrite et
contrôlée**, et que la seule façon d'en apprendre plus est désormais d'écrire
du code et de mesurer dans le moteur de production.

La décision est enregistrée dans
[`DEC-0016`](../decisions/DEC-0016-p4-gate-crossing-and-first-slice.md).

## 7. Ce que ce contrôle n'a pas fait

- **Il n'a rien mesuré ni exécuté.** Aucun critère de parité n'a été joué.
- **Il n'a rejugé aucune décision produit de Sébastien** — `DEC-0015` `A`,
  `B`, `C`. Ces points ne sont pas délégués.
- **Il n'a levé aucune réserve technique** : `V1` à `V4`, `W1` à `W4`, `R2` à
  `R9` restent en vigueur, `R1` restant levée depuis `ACTION-0023`.
- **Il n'a retouché aucune preuve** de `TASK-0012` à `TASK-0014`, ni le texte
  de `DEC-0014`.
- **Il n'a pas comblé `M-1`**, ni fermé la question 3 de `B4`, ni corrigé
  l'échec de `B0`, ni testé l'inter-volume de `B3`.

## 8. Suites ordonnées

1. **`TASK-0016` passe à `APPROVED`**, puis est **figée** — critères `H1` à
   `H11` complets, fixtures et borne de charge déclarées — **avant** toute
   modification de code.
2. **Branche dédiée** `build/v0.2-p4-vertical-slice`, créée depuis le tip
   contrôlé, après le commit documentaire de la présente clôture.
3. **`TASK-0016` se terminera `IMPLEMENTED`**, jamais `VERIFIED` : l'exécuteur
   ne juge pas ses propres preuves.
