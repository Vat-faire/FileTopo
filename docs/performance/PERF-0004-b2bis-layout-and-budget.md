# PERF-0004 — Mesures de B2 bis : calepins comparés, budget de rendu, SYN-100K

- **Banc d'essai :** `B2 bis` de
  [TASK-0013](../tasks/TASK-0013-b2-bis-layout-and-render-budget.md)
- **Spike :** `spikes/b2bis-layout-and-budget/`
- **Date de mesure :** 2026-08-31
- **Journal complet, preuves et verdicts `F1` à `F8` :**
  [TASK-0013-b2-bis-results.md](../research/TASK-0013-b2-bis-results.md)
- **Statut :** mesures de banc d'essai. **Aucune n'est une performance
  annoncée de FileTopo.**

> Ces chiffres viennent d'un prototype jetable, sur **une** machine, avec des
> arborescences **synthétiques**, et **pas dans le moteur de production**. Une
> cible manquée est publiée comme manquée; aucune n'a été ajustée après coup.
>
> **Réserve `R8` du contrôle indépendant `ACTION-0021`** : les mesures ne sont
> pas directement transposables à la production. `B2` mesurait Chrome; `B2 bis`
> mesure **Microsoft Edge** et **Google Chrome** — **pas WebView2**. Voir §3.

## 1. Matériel de référence

Déclaré **avant la première mesure publiée**, conformément à §6 de `TASK-0013`.
Ce paragraphe a été écrit et **commité avant** le lancement de la campagne.

| Élément | Valeur |
|---|---|
| Processeur | Intel Core i9-9900K, 8 cœurs / 16 fils, 3 600 MHz nominal |
| Mémoire vive | 63,9 Gio |
| Carte graphique | NVIDIA GeForce RTX 2070, pilote 32.0.16.1656 |
| Écran | 1920 × 1080, **240 Hz** |
| Système | Windows 11 Professionnel, 10.0.26200, build 26200 |
| Pilotage | protocole CDP sur le client `WebSocket` **intégré** à Node v24.13.1 |
| Dépendances installées | **aucune** |

**Trois moteurs sont en présence sur cette machine**, et ils sont nommés
partout où une mesure est publiée :

| Moteur | Version | Rôle dans `B2 bis` |
|---|---|---|
| **Microsoft Edge** | **152.0.4191.53** | **substitut de référence**, §3 |
| **Google Chrome** | **151.0.7922.175** | **contrôle de continuité** avec `B2`, §3 |
| **WebView2 Evergreen Runtime** | **151.0.4129.107** | **moteur visé, non instrumentable**, §3 |

**C'est le même matériel que `B2`** ([PERF-0001](PERF-0001-b2-rendering.md) §1).
Les comparaisons avec `B2` portent donc sur la même machine — mais **pas** sur
le même moteur.

**L'écran est à 240 Hz.** Le seuil de 30 images par seconde n'est donc pas
masqué par un plafond de synchronisation verticale à 60 Hz, et les valeurs
supérieures à 60 ips publiées plus bas sont réelles.

**Ce matériel est nettement au-dessus d'un poste ordinaire.** Les valeurs
publiées sont un **plafond favorable**, pas un cas moyen.

## 2. Protocole

Repris de `B2`, inchangé sur tous les points communs, afin que la comparaison
entre `B2` et `B2 bis` reste licite.

1. **Images par seconde relevées par l'horloge de rendu du moteur**
   (`requestAnimationFrame`), **dans la page**, jamais estimées côté Node.
   Valeur publiée : `1000 / médiane(intervalle entre images)`.
2. **Trajectoire scriptée identique** entre exécutions, entre calepins et
   entre formes : réinitialisation de la page, puis 120 images le long d'un
   chemin déterministe.
3. **Cinq exécutions** par mesure. **Médiane et écart min–max publiés.** Aucune
   exécution écartée.
4. **Aucun drapeau ne débride la fréquence d'images** : ni
   `--disable-gpu-vsync`, ni `--disable-frame-rate-limit`.
5. **Nœuds DOM comptés**, jamais estimés (`querySelectorAll('*')`).
6. **Latence de sélection** : d'un `MouseEvent` réel distribué sur l'élément
   jusqu'à l'image portant le changement, lecture de disposition forcée.
   40 sélections par exécution; 95<sup>e</sup> centile publié.
7. **Fenêtre affichée : `--headless=new`.** `B2` a montré qu'une fenêtre
   visible passée en arrière-plan cesse d'émettre des images; le mode sans
   affichage évite ce piège de mesure.
8. **Données synthétiques**, graine fixe `20260831`.
9. **Mode de rendu fixé à `transform`** pour les deux calepins : la seule
   variable de cette campagne est le **calepin**, puis le **budget**.

### 2.1 Ce qui a été écrit avant toute mesure publiée

- les **huit critères `F1` à `F8`**, dans `TASK-0013` §6, **avant** l'ouverture
  de la tâche;
- le **plancher de lisibilité** du budget, `2 400 px²`, et toute la
  configuration du contrôleur, dans `spikes/b2bis-layout-and-budget/budget.mjs`;
- le **matériel de référence**, §1 ci-dessus.

**Aucun de ces éléments n'a été modifié après la première mesure.**

<!-- Les sections 3 et suivantes sont ajoutées après la campagne. -->
