# PERF-0005 — Mesures de B2 ter : contrôleur de budget corrigé

- **Banc d'essai :** `B2 ter` de
  [TASK-0014](../tasks/TASK-0014-b2-ter-budget-controller.md)
- **Spike :** `spikes/b2ter-budget-controller/`
- **Date de mesure :** 2026-08-31
- **Journal complet, preuves et verdicts `G1` à `G9` :**
  [TASK-0014-b2-ter-results.md](../research/TASK-0014-b2-ter-results.md)
- **Statut :** mesures de banc d'essai. **Aucune n'est une performance
  annoncée de FileTopo.**

> Ces chiffres viennent d'un prototype jetable, sur **une** machine, avec des
> arborescences **synthétiques**, et **pas dans le moteur de production**. Une
> cible manquée est publiée comme manquée; aucune n'est ajustée après coup.
>
> **Réserve `R8` d'`ACTION-0021`, en vigueur et renforcée par `DEC-0014` F :**
> ces mesures ne sont pas transposables à la production. Elles portent sur
> **Microsoft Edge** et **Google Chrome**, **jamais WebView2**.

## 1. Matériel de référence

**Déclaré et commité AVANT la première mesure**, conformément à §6 de
`TASK-0014`. Relevé par lecture minimale, ciblée et non récursive de
métadonnées système, autorisée par §3 de la fiche.

| Élément | Valeur |
|---|---|
| Processeur | Intel Core i9-9900K, 8 cœurs / 16 fils, 3 600 MHz nominal |
| Mémoire vive | 63,9 Gio |
| Carte graphique | NVIDIA GeForce RTX 2070, pilote 32.0.16.1656 |
| Écran | 1920 × 1080, **240 Hz** |
| Système | Windows 11 Professionnel, 10.0.26200, build 26200 |
| Pilotage | protocole CDP sur le client `WebSocket` **intégré** à Node v24.13.1 |
| Dépendances installées | **aucune** |

**C'est le même matériel que `B2` et `B2 bis`** ([PERF-0001](PERF-0001-b2-rendering.md) §1,
[PERF-0004](PERF-0004-b2bis-layout-and-budget.md) §1).

**Deux moteurs, et deux seulement :**

| Moteur | Version | Rôle dans `B2 ter` |
|---|---|---|
| **Microsoft Edge** | **152.0.4191.53** | **moteur principal du spike** |
| **Google Chrome** | **151.0.7922.175** | **contrôle de continuité** avec `B2` et `B2 bis` |

**Aucune tentative WebView2.** `DEC-0014` F l'interdit avant qu'un véritable
hôte Tauri existe. L'écart entre ces moteurs et WebView2 reste **NON MESURÉ**.

**Ce matériel est nettement au-dessus d'un poste ordinaire.** Les valeurs
publiées sont un **plafond favorable**, pas un cas moyen.

## 2. Protocole

**Déclaré et commité avant la première mesure.**

1. **Images par seconde relevées par l'horloge de rendu du moteur**
   (`requestAnimationFrame`), **dans la page**, jamais estimées côté Node.
   Valeur publiée : `1000 / médiane(intervalle entre images)`.
2. **Cinq exécutions** par scénario. **Médiane et écart min–max publiés.**
   Aucune exécution écartée. **Les critères « sur chacune des 5 exécutions »
   se jugent sur la pire, jamais sur la médiane.**
3. **Aucun drapeau ne débride la fréquence d'images** : ni
   `--disable-gpu-vsync`, ni `--disable-frame-rate-limit`.
4. **Nœuds DOM comptés**, jamais estimés (`querySelectorAll('*')`).
5. **Latence de sélection** : d'un `MouseEvent` réel distribué sur l'élément
   jusqu'à l'image portant le changement, lecture de disposition forcée.
   40 sélections par exécution; 95<sup>e</sup> centile publié.
6. **Fenêtre : `--headless=new`**, 1600 × 900.
7. **Données synthétiques**, graine fixe **20260831** — **identique à
   `TASK-0013`**. Générateurs et calepins repris **sans modification** de
   `spikes/fixtures/synthetic-shapes.mjs` et
   `spikes/b2bis-layout-and-budget/calepins.mjs`.
8. **Calepin fixé à `CAL-B`.** La seule variable de cette campagne est le
   **contrôleur de budget**. `CAL-A` n'apparaît que dans le contrôle ponctuel
   de la phase 3, qui ne fonde aucun critère.

### 2.1 Déroulement d'une exécution du banc de budget

1. la vue part de l'ajustement au contenu, budget au **niveau initial 4**;
2. à **600 ms**, **changement brusque de vue** : saut vers une région dense et
   zoom × 3,5 en une seule image;
3. ensuite, **déplacement continu déterministe fonction du temps écoulé**, en
   translation **et** en zoom;
4. le budget n'observe que les images **postérieures au choc**;
5. **durée observée : 14 000 ms** en phase 1 et 3, **9 000 ms** en phase 2.

### 2.2 De vraies revirtualisations, déclarées avant mesure

`B2 bis` mesurait **`revirtualisations = 0`** : le mode `transform` y était
éprouvé dans son cas **le plus favorable**. `TASK-0014` §5.4 l'interdit.

Le seuil de revirtualisation du prototype est `|k / k_ancre − 1| > 0,10` en
zoom, et un déplacement d'écran supérieur à `0,8 × marge` de la fenêtre en
translation. Les amplitudes de la trajectoire du banc — **rayon 600 unités de
monde**, **± 18 % de zoom**, **période 4 000 ms** — **dépassent les deux
seuils**. Les revirtualisations sont donc **garanties par construction**, pas
espérées.

**Le coût des reconstructions est payé dans l'image** où le contrôleur change
de seuil. Il se retrouve donc dans le temps de l'image suivante, que le
contrôleur observe. **Il n'est jamais mesuré à part puis retranché.**

### 2.3 La contrainte de la phase 2 est déclarée inatteignable AVANT mesure

Réserve `V3` d'`ACTION-0023` : une contrainte destinée à être inatteignable
doit être **déclarée inatteignable avant la mesure**, avec son motif.

La phase 2 porte la cible à **1 000 images par seconde**, ce qui place le seuil
« trop lent » à **1 ms**. **Aucune configuration de cette machine ne peut tenir
1 ms par image** : `B2 bis` a mesuré au mieux 238,10 ips, soit 4,20 ms, et
cette valeur était déjà **butée** contre la synchronisation verticale. Le seuil
rapide est abaissé à **0,8 ms** pour la seule phase 2, afin que l'ordre des
deux seuils reste cohérent.

**Ces deux valeurs ne concernent que la phase 2.** La configuration de
`TASK-0014` §5.2 est **inchangée**, et le plancher de **2 400 px²** ne bouge
pas.

### 2.4 Ce qui a été écrit et commité avant toute mesure

- les **neuf critères `G1` à `G9`**, dans `TASK-0014` §6;
- la **configuration complète du contrôleur**, dans
  `spikes/b2ter-budget-controller/budget2.mjs`;
- le **matériel de référence**, §1 ci-dessus;
- le **protocole**, §2 ci-dessus, y compris les amplitudes de §2.2 et la
  contrainte de §2.3.

**Aucun de ces éléments ne peut être modifié après la première mesure. Toute
modification serait une violation de `G9`, et serait publiée comme telle.**

## 3. Mesures

*Cette section est remplie après la campagne. Elle est vide au moment où les
critères, la configuration, le matériel et le protocole sont commités.*
