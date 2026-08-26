# Budgets de performance initiaux — Phase 2

**Date :** 2026-08-25
**Statut :** hypothèses falsifiables; aucune mesure encore effectuée.

Machine de référence minimale à définir en phase 3 : Windows 10/11, SSD,
4 cœurs logiques, 8 Go de RAM, GPU intégré compatible WebGL2. Les mesures
doivent publier matériel, version, taille/forme du jeu synthétique et p50/p95.

| Mesure | 10 k éléments | 100 k | 1 M |
|--------|--------------:|------:|----:|
| Première carte utile après lancement à index existant, p95 | < 0,5 s | < 1 s | < 2 s |
| Indexation initiale métadonnées sur SSD, p95 | < 1 s | < 10 s | < 120 s |
| Recherche de nom préfixe, p95 | < 50 ms | < 100 ms | < 500 ms |
| Requête d'une vue/tuiles, p95 | < 50 ms | < 100 ms | < 250 ms |
| Interaction pan/zoom avec cache chaud, p95 | 60 fps | 60 fps | ≥ 30 fps, cible 60 |
| Mémoire totale au repos après index | < 180 Mo | < 350 Mo | < 1,5 Go |
| Taille d'index hors WAL/cache | < 15 Mo | < 80 Mo | < 600 Mo |
| Primitives GPU simultanées | ≤ 20 k | ≤ 30 k | ≤ 50 k |
| Mise à jour incrémentale habituelle (≤100 changements), p95 | < 1 s | < 2 s | < 3 s |

## Règles de mesure

- Jeux synthétiques reproductibles avec arbres profond, large, mixte, erreurs
  de permission, noms longs/non Unicode, liens/jonctions, fichiers nuage et
  rafales de watcher.
- Séparer temps d'énumération, agrégation, commit SQLite, layout et rendu.
- Aucun benchmark ne lit le contenu des fichiers dans le MVP.
- Un échec de budget n'est pas masqué : il bloque la hausse du volume annoncé
  ou déclenche une nouvelle décision d'architecture.
- Mesurer aussi annulation, reprise après crash, disque plein et corruption.

## Seuils de sécurité

- Lots SQLite : cible 2 000 à 10 000 nœuds, ajustée par mesure.
- File de progression bornée; perte d'événements UI autorisée, perte d'état
  final interdite.
- Watcher overflow : réconciliation obligatoire, jamais de « succès » silencieux.
- Transactions de lecture UI courtes pour éviter la famine des checkpoints.
