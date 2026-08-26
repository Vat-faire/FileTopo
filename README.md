# FileTopo

FileTopo transforme une arborescence de fichiers en carte topographique
locale. Le projet cible Windows, fonctionne hors ligne et traite uniquement
les métadonnées nécessaires : le contenu des documents n'est pas ouvert par
le scanner.

## État actuel

La phase 3 fournit un squelette Tauri 2 vérifié de bout en bout :

- interface React/TypeScript bilingue français/anglais;
- carte PixiJS/WebGL avec relief SVG de secours;
- index DOM accessible et synchronisé avec la sélection;
- scanner Rust itératif qui ne suit pas les liens ou points de réanalyse;
- SQLite 3.53.2 embarqué et accessible uniquement depuis Rust;
- commandes IPC étroites, sans chemin arbitraire ni SQL exposé;
- fixture physique et générateur de volume entièrement synthétiques;
- exécutable et installateur Windows construits localement.

Ce squelette n'est pas encore un produit publié. La sélection d'une vraie
collection utilisateur et l'index incrémental relèvent de la phase 4.

## Prérequis de développement

- Windows 10 ou 11 avec WebView2;
- Node.js 24 et pnpm 10;
- Rust stable avec la cible MSVC;
- Visual Studio Build Tools 2022, outils C++ et SDK Windows.

## Installation et vérification

```powershell
pnpm install
pnpm check
pnpm test
pnpm build
```

Dans une console de développement Visual Studio où Rust est dans `PATH` :

```powershell
$env:CARGO_INCREMENTAL = "0"
cargo test --manifest-path src-tauri/Cargo.toml
pnpm tauri build --debug --bundles nsis
```

La désactivation du cache incrémental contourne un défaut de cache observé
avec Rust 1.98 sur cette machine; elle ne change pas le code produit.

## Développement local

```powershell
pnpm tauri dev
```

Le bouton **Démonstration** utilise un générateur déterministe. Le bouton
**Fixture synthétique** exécute le pipeline réel scanner → SQLite → DTO sur
`tests/fixtures_synthetic/demo`. Aucun test ne doit pointer vers un dossier
utilisateur.

## Garanties de sécurité du squelette

- aucune télémétrie, mise à jour automatique, IA ou CDN;
- politique de sécurité de contenu restrictive;
- aucune permission Tauri de système de fichiers, shell, SQL ou réseau;
- aucune écriture dans une racine analysée;
- index reconstructible, stocké séparément de la collection;
- fichiers en ligne seulement détectés par attributs, jamais hydratés exprès;
- données de dépôt strictement synthétiques.

## Mesures

Les mesures reproductibles de 10 000 et 100 000 éléments sont consignées dans
`docs/performance/phase-3-measurements.md`. Les budgets et la stratégie vers
un million d'éléments se trouvent dans `docs/performance/phase-2-budgets.md`.

## Licence et auteur

FileTopo est offert sous licence MIT. Création originale de Sébastien Dubé.
Les avis concernant les composants open source sont préparés dans
`THIRD_PARTY_NOTICES.md` et seront générés précisément avant publication.

Le nom FileTopo demeure un nom public de travail réversible : aucune marque,
aucun domaine et aucun dépôt distant n'ont été réservés ou publiés.
