# Mesures de performance — phase 4

**Date :** 2026-08-26
**Tâche :** `TASK-0006`
**Statut :** mesures locales synthétiques, non promesses produit

## Environnement et méthode

Windows x64, Rust 1.98.0, profil de test non optimisé, rusqlite 0.40.2 avec SQLite 3.53.2 embarqué. Les données sont générées de façon déterministe en mémoire; aucun dossier utilisateur n’est parcouru.

Le test génère les DTO, reconstruit l’index transactionnel, relit toutes les lignes en pages de 50 000, puis exécute deux pages distinctes de 120 résultats avec recherche texte, type `file` et filtre `online_only`.

| Éléments | Génération | Indexation | Lecture paginée | Recherche filtrée paginée |
|---------:|-----------:|-----------:|-----------------:|--------------------------:|
| 10 000 | 7 ms | 54 ms | 19 ms | 14 ms |
| 100 000 | 69 ms | 587 ms | 181 ms | 126 ms |

Commande de reproduction :

```powershell
$env:CARGO_INCREMENTAL = "0"
cargo test --manifest-path src-tauri/Cargo.toml index::tests::measures_synthetic_10k_and_100k_pipeline -- --nocapture
```

Ces chiffres ne mesurent pas un disque réel, les effets d’un antivirus, la sérialisation d’une collection entière ou un million d’éléments. La carte plafonne ses données de relief à 2 000 repères et son niveau de détail initial à 600 afin de rester interactive.
