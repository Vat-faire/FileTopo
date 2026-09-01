# PERF-0006 — Premières mesures dans WebView2 : tranche verticale P4-1

- **Tranche :** `TASK-0016`, première tranche verticale de code de production
- **Journal complet, preuves et verdicts `H1` à `H11` :**
  [TASK-0016-p4-vertical-slice-results.md](../research/TASK-0016-p4-vertical-slice-results.md)
- **Preuves brutes :** [`runs/TASK-0016-H9-webview2.json`](runs/TASK-0016-H9-webview2.json),
  [`runs/TASK-0016-H1-H7-verification.json`](runs/TASK-0016-H1-H7-verification.json)
- **Date de mesure :** 2026-08-31; **rejouées intégralement** après la
  correction de la réserve bloquante `X2`
  ([ACTION-0026](../reviews/ACTION-0026-independent-control.md))
- **Statut :** premières mesures **dans le moteur de production**. **Aucune
  n'est une performance annoncée de FileTopo.**

> **Ce que ces chiffres sont.** Le **premier** relevé du projet dans
> **WebView2**, sur du **code de production**, avec des fixtures
> **synthétiques**, des critères **gelés avant exécution** et **cinq
> exécutions** par fixture.
>
> **Ce qu'ils ne sont pas.** Une capacité du produit. Ils viennent d'**une**
> machine, d'**un** écran à 240 Hz, d'un **binaire de développement non
> optimisé**, et d'arborescences d'**au plus 2 420 nœuds**.
>
> **Réserve `R8`, en vigueur.** Elle porte sur la transposabilité à la
> production dans son ensemble; **sa levée appartient à l'étape C**.
>
> **`H9` n'imposait aucune cible d'images par seconde.** Il n'y a donc **ni
> cible atteinte, ni cible manquée** à annoncer.

## 1. Hôte de mesure

Relevé **par l'application elle-même**, en demandant la version au système
plutôt qu'en interprétant `navigator.userAgent`.

| Élément | Valeur |
|---|---|
| **Moteur de rendu** | **WebView2 `151.0.4129.107`** |
| Tauri | `2.11.5` |
| SQLite (`rusqlite` groupé) | `3.53.2` |
| Plateforme | `windows` |
| Profil de compilation | **`dev`, non optimisé** |
| Rendu | **HTML/SVG accessible**, groupe unique transformé |
| Taille de carte, identique pour toutes les fixtures | **870 × 488 points** |

**Une seule machine**, nettement au-dessus d'un poste ordinaire, écran
**240 Hz** — le même plafond favorable que toutes les campagnes précédentes.

## 2. Protocole, gelé avant exécution

| Paramètre | Valeur |
|---|---|
| Exécutions par fixture | **5** |
| Images mesurées par exécution | **150**, après **12** images de chauffe |
| Sélections mesurées par exécution | **12** |
| Total par fixture | **750 images**, **60 sélections** |
| Mouvement | panoramique-zoom **scripté**, identique à chaque exécution |
| Sélections | réparties **déterministement** dans l'arbre |

**Toutes les exécutions comptent.** Aucune n'est écartée, lissée ni rejouée.

**Ce qui est mesuré exactement.** *Temps d'image* = intervalle entre deux
rappels d'animation consécutifs, **commit React inclus**; ce n'est **pas** un
chronomètre de peinture. *Latence de sélection* = du geste jusqu'au début de
l'image **suivant** celle qui peint la sélection.

## 3. Temps d'image et latence de sélection

**Mesures de référence : celles du binaire corrigé de `X2`.** Les valeurs du
commit `8cb752b` sont conservées plus bas, à titre de comparaison, et **elles
étaient meilleures**.

| Fixture | Nœuds | Image médiane | Image min | Image max | Sélection médiane | Sélection min | Sélection max |
|---|---:|---:|---:|---:|---:|---:|---:|
| `quasi-empty` | 12 | **4,20 ms** | 2,00 | 8,80 | **8,30 ms** | 6,40 | 9,80 |
| `deep` | 157 | **4,20 ms** | 2,20 | 8,70 | **8,40 ms** | 4,90 | 12,30 |
| `wide` | 2 207 | **17,80 ms** | 4,10 | 32,10 | **38,45 ms** | 33,90 | 63,90 |
| `mixed` | 2 420 | **21,35 ms** | 4,60 | 40,30 | **42,95 ms** | 37,70 | 77,50 |

### Médianes des cinq exécutions, aucune écartée

| Fixture | Exéc. 1 | Exéc. 2 | Exéc. 3 | Exéc. 4 | Exéc. 5 |
|---|---:|---:|---:|---:|---:|
| `quasi-empty` | 4,20 | 4,20 | 4,20 | 4,20 | 4,20 |
| `deep` | 4,20 | 4,20 | 4,20 | 4,20 | 4,20 |
| `wide` | 17,60 | 17,80 | 17,60 | 17,40 | 18,50 |
| `mixed` | 21,90 | 20,90 | 21,60 | 22,00 | 21,20 |

### Comparaison avec le binaire d'avant la correction de X2

| Fixture | Avant `X2` (`8cb752b`) | Après correction | Écart |
|---|---:|---:|---:|
| `wide` | 16,70 ms | **17,80 ms** | **+1,10 ms** |
| `mixed` | 20,20 ms | **21,35 ms** | **+1,15 ms** |

**Le binaire corrigé est légèrement plus lent, et c'est publié tel quel.**
**Aucune explication a posteriori n'est proposée.** La correction retire des
enregistrements de commandes, ce qui n'a aucun rapport connu avec le coût d'une
image, et l'écart est du même ordre que la dispersion entre exécutions d'une
même campagne — `wide` s'étale de 17,40 à 18,50 ms. **Rien dans les mesures ne
permet de trancher**, et rien ne sera affirmé au-delà. Le protocole gelé n'a
pas changé d'un paramètre.

### Lecture obligatoire : 4,20 ms est une butée

**Les valeurs de 4,20 ms sont butées par la synchronisation verticale**, dont
le pas est **4,1667 ms** sur cet écran à 240 Hz. Pour `quasi-empty` et `deep`,
la mesure dit **seulement que le rendu tient dans une image** — pas combien de
temps il prend. **Aucune valeur de 4,20 ms ne peut être citée comme une
performance.**

`wide` et `mixed` sont **au-dessus de la butée** : leurs médianes sont des
durées réellement observées.

## 4. Coût du calepinage — un coût d'indexation

Mesuré séparément du coût par image. **Invocations du calepinage pendant la
navigation : exactement zéro**, sur les quatre fixtures.

| Fixture | Nœuds | Scan | **Calepinage** | Index |
|---|---:|---:|---:|---:|
| `quasi-empty` | 12 | 0,7 ms | **0,0 ms** | 7,3 ms |
| `deep` | 157 | 11,6 ms | **0,1 ms** | 6,7 ms |
| `wide` | 2 207 | 95,9 ms | **0,9 ms** | 27,6 ms |
| `mixed` | 2 420 | 91,1 ms | **1,1 ms** | 31,2 ms |

**Binaire de développement non optimisé.** Le **rapport** entre ces colonnes
est instructif — le calepinage pèse moins de 1 % de la construction; leurs
**valeurs absolues ne sont pas une performance du produit**.

## 5. Écart avec les mesures de spike — publié tel quel

`DEC-0014` F déclare l'écart entre WebView2 et Edge/Chrome **NON MESURÉ**. Ce
qui suit est un **premier point de comparaison**, et **rien de plus** : les
deux campagnes **ne mesurent pas la même chose**.

| | Spike `B2 bis` ([PERF-0004](PERF-0004-b2bis-layout-and-budget.md)) | Cette tranche |
|---|---|---|
| Moteur | Edge 152.0.4191.53, Chrome 151 | **WebView2 151.0.4129.107** |
| Grandeur | **images par seconde** en déplacement | **temps d'image**, commit React inclus |
| Charge | **blocs demandés**, 1 000 à 5 000 | **nœuds réels** d'une arborescence |
| Calepinage | `CAL-A` **et** `CAL-B` | `CAL-B` seul |
| Chemin de rendu | reprojection par nœud | **groupe unique transformé** |
| Binaire | page de spike dans un navigateur | **hôte Tauri**, profil `dev` |

Pour mémoire, **sans en déduire quoi que ce soit** : `CAL-B` sur `SYN-WIDE` à
**2 856 blocs visibles** rendait **119,05 ips** sur Edge — soit **≈ 8,4 ms**
par image —, contre **17,80 ms** ici sur `wide` à
**2 207 nœuds**.

**Ce rapprochement ne fonde aucun verdict.** Les grandeurs diffèrent, les
charges ne sont pas comparables, le chemin de rendu a changé, et le profil de
compilation aussi. **Aucune explication a posteriori n'est proposée**, et
**l'écart n'est pas ajusté**.

## 6. Limites

- **`R8` en vigueur.** Une machine, un écran 240 Hz, un binaire `dev`, des
  fixtures ≤ 2 420 nœuds. **Levée à l'étape C, pas ici.**
- **Les valeurs de 4,20 ms sont butées**, pas mesurées.
- **Binaire de développement** : scan, calepinage et index en dépendent
  directement.
- **Volumétrie très inférieure au contrat de parité**, qui exige `P-08` sur
  **100 000 nœuds**.
- **Aucun budget de rendu adaptatif** n'est employé, adopté, abandonné ni
  validé. La borne `B-1` de 5 000 nœuds est un **plafond déclaré**, qui ne
  s'ajuste à rien. Réserve `W2` : **aucune stabilité n'est prouvée**.
- **Aucun lecteur d'écran réel.**
- **L'aire minimale de bloc de 2 400 unités² est un choix, pas une mesure.**
- **Trois défauts de protocole ont été trouvés et corrigés avant la campagne
  publiée** — fenêtre occultée, carte de 1 × 1 pixel, remise en page pendant la
  course. Ils sont décrits en §10 du journal, avec ce que chacun aurait produit.
