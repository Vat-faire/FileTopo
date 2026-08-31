# PERF-0001 — Mesures de B2, rendu HTML/SVG

- **Banc d'essai :** `B2` de
  [TASK-0012](../tasks/TASK-0012-technical-risk-gates.md)
- **Spike :** `spikes/b2-svg-rendering/`
- **Date de mesure :** 2026-08-31
- **Journal complet, preuves et verdict :**
  [TASK-0012-risk-gate-results.md §3](../research/TASK-0012-risk-gate-results.md)
- **Statut :** mesures de banc d'essai. **Aucune n'est une performance
  annoncée de FileTopo.**

> Ces chiffres viennent d'un prototype jetable, sur **une** machine, dans
> **un** navigateur, avec des arborescences **synthétiques**. Une cible manquée
> est publiée comme manquée; aucune n'a été ajustée après coup.

## 1. Matériel de référence

Déclaré **avant** la première mesure, conformément à §12.4 de `TASK-0012`.

| Élément | Valeur |
|---|---|
| Processeur | Intel Core i9-9900K, 8 cœurs / 16 fils, 3,60 GHz nominal |
| Mémoire vive | 63,9 Gio |
| Carte graphique | NVIDIA GeForce RTX 2070, pilote 32.0.16.1656 |
| Écran | 1920 × 1080, **240 Hz**, `devicePixelRatio` = 1 |
| Système | Windows 11 Professionnel, 10.0.26200, build 26200 |
| Navigateur | Google Chrome **151.0.7922.175** (Blink) |
| Pilotage | protocole CDP sur le client `WebSocket` **intégré** à Node v24.13.1 |
| Dépendances installées | **aucune** |

**L'écran est à 240 Hz.** Le seuil de 30 ips n'est donc **pas** masqué par un
plafond de synchronisation verticale à 60 Hz, et les valeurs supérieures à
60 ips publiées plus bas sont réelles.

**Ce matériel est nettement au-dessus d'un poste ordinaire.** Les valeurs
publiées sont un **plafond favorable**, pas un cas moyen.

## 2. Protocole

1. **Images par seconde relevées par l'horloge de rendu du navigateur**
   (`requestAnimationFrame`), **dans la page**, jamais estimées côté Node.
   Valeur publiée : `1000 / médiane(intervalle entre images)`.
2. **Trajectoire scriptée identique** entre exécutions : réinitialisation de la
   page, puis 120 images le long d'un chemin déterministe.
3. **Cinq exécutions** par scénario. Médiane et **écart min–max** publiés.
   Aucune exécution écartée.
4. **Aucun drapeau ne débride la fréquence d'images** : ni
   `--disable-gpu-vsync`, ni `--disable-frame-rate-limit`.
5. **Nœuds DOM comptés**, jamais estimés (`querySelectorAll('*')`).
6. **Latence de sélection** : d'un `MouseEvent` réel distribué sur l'élément
   jusqu'à l'image portant le changement, lecture de disposition forcée.
   40 sélections par exécution; 95<sup>e</sup> centile publié.
7. **Données synthétiques** : 20 000 nœuds, graine fixe `20260831`.

### Un piège de mesure rencontré, et écarté

Une première tentative de recherche de plafond, menée avec **fenêtre
affichée**, s'est **bloquée** : la fenêtre est passée en arrière-plan, Chrome a
mis `document.visibilityState` à `hidden` et **a cessé d'émettre des images**.
Une sonde a confirmé zéro `requestAnimationFrame` en deux secondes. Ces
mesures-là ont été **jetées**, pas publiées.

La recherche de plafond a été refaite **sans affichage** (`--headless=new`),
où aucune fenêtre ne peut être occultée. La comparabilité des deux modes a été
vérifiée séparément : à 3 000 blocs `SYN-DEEP` en mise en œuvre `transform`,
**34,13 ips avec fenêtre contre 34,13 sans**.

## 3. Deux mises en œuvre comparées

| Code | Mise en œuvre |
|---|---|
| `reecriture` | la géométrie de **chaque** bloc visible est réécrite à chaque image |
| `transform` | blocs en coordonnées monde, déplacement par **une seule** transformation de groupe |

## 4. Mesures — mise en œuvre `transform`

| Blocs demandés | Forme | Blocs réels | Nœuds DOM | Déplacement (ips) | min–max | Zoom (ips) | Sélection p95 |
|---|---|---|---|---|---|---|---|
| 1 000 | `SYN-DEEP` | 1 000 | 2 102 | 80,00 | 80,00 – 80,00 | 80,65 | 10,0 ms |
| 1 000 | `SYN-WIDE` | 939 | 1 880 | 47,85 | 47,85 – 48,08 | 40,00 | 17,0 ms |
| 1 000 | `SYN-EQUILIBRE` | 1 000 | 2 139 | 119,05 | 119,05 – 119,05 | 119,05 | 8,3 ms |
| **3 000** | **`SYN-DEEP`** | 3 000 | 6 102 | **34,13** | 30,12 – 34,13 | 34,13 | 26,6 ms |
| **3 000** | **`SYN-WIDE`** | 2 856 | 5 714 | **14,08** | 14,08 – 14,08 | 10,89 | 71,4 ms |
| 3 000 | `SYN-EQUILIBRE` | 3 000 | 6 139 | 40,00 | 40,00 – 40,00 | 39,84 | 22,2 ms |
| 5 000 | `SYN-DEEP` | 5 000 | 10 102 | 18,45 | 18,45 – 19,96 | 18,45 | 45,9 ms |
| 5 000 | `SYN-WIDE` | 4 768 | 9 538 | 8,26 | 7,99 – 8,26 | 7,99 | 137,4 ms |
| 5 000 | `SYN-EQUILIBRE` | 5 002 | 10 143 | 23,98 | 23,98 – 23,98 | 21,79 | 36,1 ms |

## 5. Mesures — mise en œuvre `reecriture`

| Blocs | Forme | Déplacement (ips) | min–max | Sélection p95 |
|---|---|---|---|---|
| 1 000 | `SYN-DEEP` | 80,00 | 80,00 – 80,00 | 9,5 ms |
| 1 000 | `SYN-WIDE` | 47,85 | 47,85 – 47,85 | 16,8 ms |
| 1 000 | `SYN-EQUILIBRE` | 80,00 | 80,00 – 80,00 | 8,3 ms |
| 3 000 | `SYN-DEEP` | 29,94 | 29,94 – 29,94 | 25,1 ms |
| 3 000 | `SYN-WIDE` | 13,30 | 13,30 – 13,32 | 68,7 ms |
| 3 000 | `SYN-EQUILIBRE` | 34,25 | 34,25 – 34,25 | 20,8 ms |
| 5 000 | `SYN-DEEP` | 18,38 | 17,15 – 18,42 | 41,6 ms |
| 5 000 | `SYN-WIDE` | 7,98 | 7,49 – 7,98 | 138,2 ms |
| 5 000 | `SYN-EQUILIBRE` | 20,00 | 20,00 – 21,74 | 33,4 ms |

## 6. Latence de sélection — le seuil de 150 ms tient, de justesse

Le seuil de 150 ms **n'est jamais franchi** — mais il faut dire de combien.

| Scénario | p95 médiane | p95 **pire exécution** | Marge au seuil |
|---|---|---|---|
| `transform`, `SYN-WIDE`, 5 000 blocs | 137,4 ms | **149,6 ms** | **0,4 ms** |
| `reecriture`, `SYN-WIDE`, 5 000 blocs | 138,2 ms | 139,1 ms | 10,9 ms |
| `transform`, `SYN-WIDE`, 3 000 blocs | 71,4 ms | 71,9 ms | 78,1 ms |

Série brute du pire scénario, en millisecondes :
136,0 · 137,4 · 137,4 · 138,1 · **149,6**.

**Le seuil est effleuré, pas confortablement tenu.** À 5 000 blocs sur
`SYN-WIDE`, une exécution sur cinq arrive à **0,4 ms** du seuil. Écrire « la
latence de sélection tient » sans ce chiffre serait trompeur : sur du matériel
plus modeste, ce scénario passerait vraisemblablement au-dessus de 150 ms.
**Non vérifié**, faute d'une seconde machine.

Au seuil de 3 000 blocs — celui qui décide du verdict — la marge est en
revanche large : 71,9 ms au pire, pour un seuil de 150 ms. Le critère de
`DEC-0008` qui échoue à 3 000 blocs est donc bien **uniquement** celui des
images par seconde.

## 7. Ce que ces chiffres ne disent pas

- **Rien sur Canvas 2D, rien sur WebGL.** Aucun des deux n'a été mesuré.
- **Rien sur WebView2**, moteur réel de la future application Tauri. Les
  mesures viennent de Chrome 151.
- **Rien sur un poste modeste**, un écran 60 Hz ou un affichage à forte densité.
- **Rien sur la mémoire**, ni sur une session longue.
- **Rien sur un autre algorithme de calepin.** Le découpage alterné employé ici
  produit, pour `SYN-WIDE`, des rectangles en lamelles particulièrement coûteux
  à tramer; un pavage « squarifié » n'a **pas** été testé.
- **Rien sur le coût d'une revirtualisation en cours de déplacement** : la
  trajectoire reste dans la marge de 25 %, si bien que le compteur de
  revirtualisations vaut **0** partout. Le mode `transform` est donc mesuré
  dans son cas le plus favorable.

## 8. Plafonds réels mesurés

Recherche dichotomique, 7 itérations au plus, **3 exécutions par point**, mise
en œuvre `transform`, sans affichage. Seuils appliqués : `≥ 30 ips` **et**
`p95 de sélection ≤ 150 ms`.

| Forme | **Plafond mesuré** | ips au plafond | Sélection p95 | Premier point qui rompt |
|---|---|---|---|---|
| `SYN-EQUILIBRE` | **3 743 blocs visibles** | 30,03 | 33,4 ms | 3 805 → 29,94 ips |
| `SYN-DEEP` | **3 063 blocs visibles** | 34,13 | 32,7 ms | 3 124 → 29,76 ips |
| `SYN-WIDE` | **939 blocs visibles** | 47,85 | 28,8 ms | 1 795 → 19,96 ips |

**Le plafond de `SYN-WIDE` est un encadrement, pas un point.** Ses
5 000 frères ayant tous la même surface, le seuil d'aire les fait entrer ou
sortir par paliers entiers : seuls 939 et 1 795 sont observables. Le plafond
réel est **entre les deux**, et ce banc d'essai ne le résout pas plus finement.

**L'hypothèse de 3 000 blocs de `DEC-0008` est remplacée** par ces trois
mesures : prudente de 25 % sur `SYN-EQUILIBRE`, juste à 2 % près sur
`SYN-DEEP`, **optimiste d'un facteur 3** sur `SYN-WIDE`. Un plafond unique
exprimé en nombre de blocs ne décrit pas ce qui détermine le coût.
