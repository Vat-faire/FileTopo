# TASK-0016 — P4-1 : journal, preuves et verdicts H1 à H11

- **Tranche :** première tranche verticale de code de production, étape **A**
- **Fiche :** [TASK-0016](../tasks/TASK-0016-p4-vertical-slice.md), critères
  **gelés en §12 avant la première ligne de code**, commit `6edd5bd`
- **Mesures :** [PERF-0006](../performance/PERF-0006-p4-vertical-slice.md)
- **Preuves brutes :** [`docs/performance/runs/`](../performance/runs/)
- **Date :** 2026-08-31
- **Branche :** `build/v0.2-p4-vertical-slice`, créée depuis le tip contrôlé
  `73f0327` après le commit documentaire de clôture d'`ACTION-0025`
- **Statut de la tâche à l'issue :** **`IMPLEMENTED`, jamais `VERIFIED`.**
  L'exécuteur ne juge pas ses propres preuves.

---

## 1. Résultat, en une phrase

**Les onze critères gelés sont tenus, et pour la première fois du projet des
temps d'image ont été relevés dans le véritable moteur de production.** Aucun
critère n'a été retouché après le premier résultat, et **`H9` n'imposait aucune
cible d'images par seconde** : son succès est d'avoir obtenu les mesures
honnêtement et de les publier sans sélection favorable.

| Critère | Verdict |
|---|---|
| `H1` — ensemble des nœuds : plan = disque = index | **TENU** |
| `H2` — aucune dimension nulle, aucun chevauchement, inclusion = hiérarchie | **TENU** |
| `H3` — parent et enfants directs égaux à l'index | **TENU** |
| `H4` — navigation souris et clavier, aucun état hors bornes, réinitialisation exacte | **TENU** |
| `H5` — panneau de détails égal à l'index, diagnostics affichés | **TENU** |
| `H6` — empreinte de la source identique avant et après | **TENU** |
| `H7` — index supprimé puis reconstruit, équivalent; non reconstructible énuméré | **TENU** |
| `H8` — démarre et rend dans WebView2, moteur et version relevés | **TENU** |
| `H9` — temps d'image et latence de sélection dans WebView2, 5 exécutions | **TENU** — aucune cible n'était fixée |
| `H10` — calepinage payé une fois par arborescence | **TENU** |
| `H11` — bornes déclarées d'avance et respectées | **TENU** |

**Ce que ce résultat ne dit pas** est en §8, et c'est la partie importante.

## 2. Ce qui a été construit

La chaîne complète, en code de production :

**fixture synthétique → scan Rust en lecture seule → index SQLite persistant et
reconstructible → calepinage hiérarchique → carte HTML/SVG accessible dans le
véritable hôte Tauri/WebView2 → panoramique, zoom, ajuster, réinitialiser →
sélection souris et clavier → détails avec parent et enfants directs.**

**Aucun code de spike n'a été repris.** Aucun contrôleur de budget de
`TASK-0013` ni de `TASK-0014` n'apparaît dans le produit — `DEC-0015` F.
**Ni Canvas 2D, ni WebGL.** **Aucune dépendance nouvelle.**

L'application démarre désormais sur cette tranche. **`src/App.tsx`, l'écran
0.1 alpha, est conservé intact** dans le dépôt comme l'audit technique qu'il
est — `DEC-0015` A —, avec ses douze tests.

## 3. Les quatre fixtures réalisées

Graines et règles **gelées avant exécution** (§12.1). Les nombres de nœuds sont
un **résultat**, publié ici.

| Fixture | Graine | Nœuds obtenus | Plafond gelé | Profondeur | Plafond |
|---|---|---:|---:|---:|---:|
| `QUASI_EMPTY` | `20260831001` | **12** | 25 | 3 | 40 |
| `DEEP` | `20260831002` | **157** | 500 | **40** | 40 |
| `WIDE` | `20260831003` | **2 207** | 3 000 | 3 | 40 |
| `MIXED` | `20260831004` | **2 420** | 5 000 | 32 | 40 |

**Aucune fixture ne dépasse 5 000 nœuds.** `DEEP` atteint exactement la
profondeur 40, comme sa règle l'exige.

**Ces bornes sont des limites de `TASK-0016`, pas des limites produit.** Le
contrat de parité exige `P-08` sur **100 000 nœuds** : cette volumétrie
appartient aux tranches suivantes de l'étape **A**.

## 4. Preuves des critères structurels — H1, H2, H3, H5, H6, H7, H10, H11

Rejouées **deux fois** : par les tests unitaires en répertoires temporaires, et
**à travers les vraies commandes dans le véritable hôte**, ce second passage
étant écrit dans
[`TASK-0016-H1-H7-verification.json`](../performance/runs/TASK-0016-H1-H7-verification.json).

| Fixture | `H1` plan/disque/index | `H2` violations | `H3` écarts | `H5` écarts | `H6` empreinte inchangée | `H7` équivalent | `H10` appels calepinage | `H11` |
|---|---|---:|---:|---:|---|---|---:|---|
| `quasi-empty` | **égaux** | 0 | 0 | 0 | **oui** | **oui** | 1 | **oui** |
| `deep` | **égaux** | 0 | 0 | 0 | **oui** | **oui** | 1 | **oui** |
| `wide` | **égaux** | 0 | 0 | 0 | **oui** | **oui** | 1 | **oui** |
| `mixed` | **égaux** | 0 | 0 | 0 | **oui** | **oui** | 1 | **oui** |

**`H1` compare trois ensembles, pas deux.** Le plan de la fixture est calculé
**sans regarder le disque**, l'arborescence réelle est parcourue par un
**parcours indépendant du scanner de production**, et l'index est lu par
requête. Comparer le scanner à lui-même n'aurait rien prouvé.

**`H6`, empreintes avant/après reconstruction** — noms, structure, tailles,
contenus et horodatages :

| Fixture | Empreinte avant | Après reconstruction | Fichiers de FileTopo dans la racine |
|---|---|---|---|
| `quasi-empty` | `fnv1a64:bddfe1a16cac350f` | **identique** | **aucun** |
| `deep` | `fnv1a64:075a9c069126e8f1` | **identique** | **aucun** |
| `wide` | `fnv1a64:8e2691444371d5e9` | **identique** | **aucun** |
| `mixed` | `fnv1a64:18172f4f13164c02` | **identique** | **aucun** |

**`H7`, reconstruction.** L'index est supprimé puis reconstruit; l'empreinte de
tout ce qui doit se reproduire — nœuds, hiérarchie, **rectangles de
calepinage** — est identique dans les quatre cas. **L'état non reconstructible
est énuméré, et il n'est pas vide :** `built_unix_ms`, l'horodatage de
construction. Un test vérifie qu'il **diffère réellement** après
reconstruction, faute de quoi la déclaration serait décorative.

**`H4`** est vérifié séparément, sur l'arithmétique de vue : **10 000
opérations** pseudo-aléatoires — zooms absurdes dans les deux sens,
panoramiques d'un million de pixels, états jamais bornés fournis par un
appelant hostile — **zéro état hors des bornes déclarées**. « Réinitialiser »
reproduit la vue d'ouverture **paramètre par paramètre**. Le parcours clavier
complet — parent, enfant, frères, zoom, ajuster, réinitialiser, racine — est
exercé par des tests de composant.

## 5. H8 — le moteur de production, enfin nommé

**L'application démarre et rend dans WebView2 sur Windows.**

| Élément | Version relevée |
|---|---|
| **Moteur de rendu** | **WebView2 `151.0.4129.107`** |
| Tauri | `2.11.5` |
| SQLite | `3.53.2` |
| Plateforme | `windows` |

La version est demandée **à l'hôte**, pas déduite de `navigator.userAgent`,
qu'un moteur fondé sur Chromium rend délibérément ambigu.

## 6. H9 — première mesure dans WebView2

**Protocole, gelé :** 4 fixtures, **5 exécutions chacune**, 150 images par
exécution après 12 images de chauffe, 12 sélections par exécution. **750 images
et 60 sélections mesurées par fixture.** Toutes les exécutions comptent.

**Ce qui est mesuré, dit franchement.** *Temps d'image* = intervalle entre deux
rappels d'animation consécutifs pendant un panoramique-zoom scripté, **commit
React inclus**; ce n'est **pas** un chronomètre de peinture. *Latence de
sélection* = du geste jusqu'au début de l'image **suivant** celle qui peint la
sélection.

**Toutes les fixtures sont mesurées à la même taille de carte, 870 × 488
points**, et cette taille est publiée avec les chiffres.

| Fixture | Nœuds | Image médiane | Image min–max | Sélection médiane | Sélection min–max |
|---|---:|---:|---:|---:|---:|
| `quasi-empty` | 12 | **4,20 ms** | 2,80 – 6,30 | **8,30 ms** | 8,20 – 8,60 |
| `deep` | 157 | **4,20 ms** | 2,20 – 7,10 | **8,30 ms** | 8,00 – 8,80 |
| `wide` | 2 207 | **16,70 ms** | 4,10 – **21,00** | **34,65 ms** | 32,40 – **60,30** |
| `mixed` | 2 420 | **20,20 ms** | 3,70 – **28,90** | **38,20 ms** | 35,80 – **62,50** |

**Médianes par exécution**, les cinq, sans en écarter aucune :

| Fixture | Exéc. 1 | 2 | 3 | 4 | 5 |
|---|---:|---:|---:|---:|---:|
| `quasi-empty` | 4,20 | 4,20 | 4,20 | 4,20 | 4,20 |
| `deep` | 4,20 | 4,20 | 4,20 | 4,20 | 4,20 |
| `wide` | 16,70 | 16,60 | 16,80 | 16,60 | 16,80 |
| `mixed` | 20,10 | 20,20 | 20,30 | 20,30 | 20,30 |

### 6.1 Une lecture obligatoire : 4,20 ms est une butée, pas une mesure

**Les valeurs de 4,20 ms sont butées par la synchronisation verticale de
l'écran du banc, à 240 Hz, dont le pas est 4,1667 ms.** `CURRENT_STATE.md` le
déclarait déjà pour les campagnes de spike, et cela vaut ici à l'identique :
pour `quasi-empty` et `deep`, **la mesure dit seulement que le rendu tient dans
une image**, pas combien de temps il prend. **Aucun chiffre de 4,20 ms ne peut
être cité comme une performance.**

`wide` et `mixed`, eux, sont **au-dessus de la butée** : 16,70 ms et 20,20 ms
sont des durées réellement observées.

### 6.2 L'écart avec les mesures de spike, publié tel quel

`DEC-0014` F déclare l'écart entre WebView2 et Edge/Chrome **NON MESURÉ**.
Cette tranche donne un premier point de comparaison, et **rien de plus** : les
deux campagnes **ne mesurent pas la même chose**.

| | Spike `B2 bis` | Cette tranche |
|---|---|---|
| Moteur | Edge 152, Chrome 151 | **WebView2 151.0.4129.107** |
| Grandeur | images par seconde en déplacement continu | **temps d'image**, commit React inclus |
| Charge | blocs demandés, 1 000 à 5 000 | **nœuds réels d'une arborescence** |
| Calepinage | `CAL-A` et `CAL-B`, comparés | `CAL-B` seul, sans comparaison |
| Rendu | reprojection par nœud | **transform unique** |

À titre indicatif, et **sans en déduire quoi que ce soit** : `CAL-B` sur
`SYN-WIDE` à 2 856 blocs visibles rendait **119,05 ips** sur Edge — soit
**≈ 8,4 ms** par image —, contre **16,70 ms** ici sur `wide` à 2 207 nœuds.

**Ce rapprochement ne fonde aucun verdict**, pour trois raisons écrites
d'avance : les grandeurs diffèrent, les charges ne sont pas comparables, et le
chemin de rendu a changé. **Aucune explication a posteriori n'est proposée.**

## 7. H10 — le calepinage est bien un coût d'indexation

Mesuré **séparément** du coût par image, et le nombre d'invocations du
calepinage **pendant la navigation est exactement zéro** : la carte est
dessinée en coordonnées de calepinage dans un seul groupe transformé, et un
panoramique change un attribut.

| Fixture | Nœuds | Scan | **Calepinage** | Index | Part du calepinage |
|---|---:|---:|---:|---:|---:|
| `quasi-empty` | 12 | 0,7 ms | **0,0 ms** | 5,3 ms | négligeable |
| `deep` | 157 | 11,1 ms | **0,1 ms** | 6,7 ms | 0,6 % |
| `wide` | 2 207 | 86,8 ms | **0,9 ms** | 27,5 ms | 0,8 % |
| `mixed` | 2 420 | 89,9 ms | **1,1 ms** | 29,6 ms | 0,9 % |

**Ces trois colonnes viennent d'un binaire de développement**, non optimisé —
§8. Le rapport entre elles est instructif; leurs valeurs absolues ne sont pas
une performance du produit.

## 8. Ce qui n'est PAS prouvé, et qu'il faut dire

1. **`R8` n'est pas levée**, et ne peut pas l'être ici. Ces mesures portent sur
   **une** machine, **un** écran 240 Hz, **un** binaire de développement, et
   des arborescences **synthétiques ≤ 2 420 nœuds**. Sa levée appartient à
   l'**étape C**.
2. **Le binaire mesuré est un binaire de développement** (`cargo run`, profil
   `dev`, non optimisé). Les temps de **scan**, de **calepinage** et
   d'**index** en dépendent directement. Les temps d'**image** dépendent
   surtout du moteur et du bundle web, lequel est bien un bundle de
   production — mais **aucune mesure ne l'établit**, et rien ne doit le
   supposer.
3. **Les valeurs de 4,20 ms sont butées**, pas mesurées — §6.1.
4. **Une seule machine**, nettement au-dessus d'un poste ordinaire, comme pour
   toutes les campagnes précédentes. Plafond favorable.
5. **Aucun lecteur d'écran réel n'a été employé.** L'accessibilité contrôlée
   porte sur les attributs produits et sur le parcours clavier, pas sur
   l'expérience d'une technologie d'assistance.
6. **`P-21` n'est pas satisfaite** : l'interface est **en français seulement**,
   et aucun audit WCAG complet n'a été mené. Le bilinguisme intégral était
   **hors périmètre**, déclaré tel dans la fiche.
7. **Six exigences de parité seulement** sont touchées, plus `P-06`
   **partiellement**. Seize restent entières, dont **toutes** les relations
   transversales.
8. **L'aire minimale de bloc de 2 400 unités² est un choix, pas une mesure.**
   Elle est déclarée comme telle dans le code et dans la fiche.
9. **Le budget adaptatif n'est ni adopté, ni abandonné, ni validé.** La borne
   `B-1` est un **plafond déclaré**, qui ne s'ajuste à rien et ne mesure rien.
   Réserve `W2` : **aucune stabilité n'est prouvée**, ici comme ailleurs.
10. **`B0` n'est pas corrigé** — §9.
11. **Le premier essai de mesure a été abandonné**, et le renderer a changé
    ensuite — §10. **Aucun chiffre n'existait avant ce changement**, donc rien
    n'a été réglé sur un résultat; mais le fait est consigné plutôt que tu.

## 9. B0 s'est reproduit, deux fois, et n'a pas été corrigé

`cargo build --locked` et `tauri dev` ont **tous deux** déclenché la panique
interne de `rustc 1.98.0` décrite par `DEC-0013` E, sur le cache de compilation
incrémentale de `src-tauri/target/`. Le message est identique à celui du banc
`B0` : *« error: the compiler unexpectedly panicked »*, avec
`-C incremental=[REDACTED]` dans les indicateurs.

**Rien n'a été supprimé, nettoyé ni renommé dans `src-tauri/target/`.** La
reproduction est **conservée**, conformément à `DEC-0013` E. Tous les builds de
cette tâche ont employé `CARGO_INCREMENTAL=0`, qui réussit.

**`B0` n'est pas corrigé, et rien ici ne doit laisser entendre le contraire.**

## 10. Trois défauts trouvés en essayant de mesurer

Consignés parce qu'ils expliquent pourquoi la première tentative n'a rien
produit, et parce que chacun aurait pu fabriquer un chiffre flatteur.

| # | Défaut | Ce qu'il aurait produit | Correction |
|---|---|---|---|
| `E1` | La campagne attendait une image qui n'arrivait jamais. Chromium **suspend `requestAnimationFrame`** pour une fenêtre occultée | Une attente indéfinie, **impossible à distinguer d'une course lente** | Échéance de 8 s par image : une course suspendue **échoue explicitement** et écrit pourquoi |
| `E2` | La première fixture était mesurée alors que la carte faisait **1 × 1 pixel** | Des images **rapides parce que rien n'était affiché** | La campagne attend que la carte ait une taille réelle |
| `E3` | Le tableau des résultats s'affichait pendant la campagne et **remettait la page en page** | Chaque fixture mesurée à une **taille de carte différente** — 855 × 652 puis 870 × 488 | Résultats publiés à la fin; **la taille de vue est écrite dans l'artefact** |

**Un quatrième point, de rendu.** La première version reprojetait chaque nœud à
chaque image. Elle a été remplacée par un **groupe unique transformé**, ce qui
est aussi ce que `H10` demande dans son esprit. **Aucune mesure n'existait
avant ce remplacement** : il n'y avait pas de résultat à améliorer.

## 11. Confidentialité et périmètre

- **Aucune donnée réelle.** Les quatre fixtures sont **engendrées** à partir de
  graines fixes; leur contenu est un texte synthétique dérivé du chemin.
- **Aucun sélecteur de dossier utilisateur** dans cette tranche. Aucun dossier
  personnel n'a été lu, listé ni écrit.
- **Aucun chemin local personnel dans le dépôt.** Le bac à sable est **nommé**
  — `<dépôt>/.filetopo-sandbox` — et jamais épelé, dans l'interface comme dans
  les artefacts. Un défaut inverse a été trouvé et corrigé avant tout commit
  d'artefact, et un test le verrouille.
- **L'index et tout état de FileTopo vivent hors de la racine analysée**, et
  les quatre contrôles d'intégrité le confirment sur disque.
- **Aucune dépense, aucune publication externe, aucune donnée personnelle.**
- **Aucune fusion, PR, release, étiquette, `force push`**, aucune réécriture
  d'historique.

## 12. Documents liés

- [TASK-0016](../tasks/TASK-0016-p4-vertical-slice.md) — fiche et gel §12
- [PERF-0006](../performance/PERF-0006-p4-vertical-slice.md) — mesures
- [`TASK-0016-H9-webview2.json`](../performance/runs/TASK-0016-H9-webview2.json)
- [`TASK-0016-H1-H7-verification.json`](../performance/runs/TASK-0016-H1-H7-verification.json)
- [ACTION-0025](../reviews/ACTION-0025-independent-control.md), [DEC-0016](../decisions/DEC-0016-p4-gate-crossing-and-first-slice.md)
- [CARTETOPO_FUNCTIONAL_PARITY.md](../product/CARTETOPO_FUNCTIONAL_PARITY.md)
