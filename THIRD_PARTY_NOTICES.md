# Avis de tiers

FileTopo dépend de composants open source. Les composants directs du
squelette vérifié sont :

| Composant | Version observée | Licence déclarée |
|-----------|------------------|-------------------|
| Tauri | 2.11.5 | MIT ou Apache-2.0 |
| Tauri CLI | 2.11.4 | MIT ou Apache-2.0 |
| React / React DOM | 19.2.8 | MIT |
| Vite | 7.3.6 | MIT |
| PixiJS | 8.20.0 | MIT |
| rusqlite | 0.40.2 | MIT |
| SQLite embarqué | 3.53.2 | domaine public |

Ce fichier prépare l'avis de tiers mais ne remplace pas l'inventaire
transitif. Avant toute release, les fichiers `pnpm-lock.yaml` et
`src-tauri/Cargo.lock` doivent servir à générer une nomenclature complète,
copier les textes de licence requis et échouer si une licence est inconnue
ou incompatible. Aucun binaire n'est publié au stade actuel.
