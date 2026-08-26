# FileTopo

FileTopo transforme une arborescence de fichiers en carte topographique
locale. Le projet cible Windows, fonctionne hors ligne et traite uniquement
les métadonnées nécessaires : le contenu des documents n'est pas ouvert par
le scanner.

## État actuel

Les phases 4 et 5 fournissent un MVP Windows local vérifié de bout en bout et
préparé à une éventuelle publication :

- interface React/TypeScript bilingue français/anglais;
- carte PixiJS/WebGL avec relief SVG de secours;
- index DOM accessible et synchronisé avec la sélection;
- scanner Rust itératif qui ne suit pas les liens ou points de réanalyse;
- SQLite 3.53.2 embarqué et accessible uniquement depuis Rust;
- commandes IPC étroites, sans chemin arbitraire ni SQL exposé;
- registre de collections et index SQLite persistants hors des racines;
- choix natif explicite, indexation en arrière-plan, progression et annulation;
- recherche et filtres paginés, états vu/non vu et fichiers en ligne seulement;
- niveau de détail progressif et ouverture confinée dans l’Explorateur Windows;
- fixture physique et générateur de volume entièrement synthétiques;
- exécutable et installateur Windows construits localement.

Ce MVP n'est pas un produit publié. Une collection réelle n’est jamais
choisie ou scannée sans les actions explicites de l’utilisateur.

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

Les guides d’utilisation sont disponibles en [français](docs/user-guide-fr.md)
et en [anglais](docs/user-guide-en.md).

## Sécurité et confidentialité

- aucune télémétrie, mise à jour automatique, IA ou CDN;
- politique de sécurité de contenu restrictive;
- aucune permission Tauri de système de fichiers, shell, SQL ou réseau;
- aucune écriture dans une racine analysée;
- index reconstructible, stocké séparément de la collection;
- fichiers en ligne seulement détectés par attributs, jamais hydratés exprès;
- données de dépôt strictement synthétiques.

Consultez [SECURITY.md](SECURITY.md), [PRIVACY.md](PRIVACY.md), le
[modèle de menace](docs/security/threat-model.md) et le
[guide de contribution](CONTRIBUTING.md).

## Mesures

Les mesures MVP reproductibles de 10 000 et 100 000 éléments sont consignées
dans `docs/performance/phase-4-mvp-measurements.md`. Les budgets et la stratégie vers
un million d'éléments se trouvent dans `docs/performance/phase-2-budgets.md`.

## Licence et auteur

FileTopo est offert sous licence MIT. Création originale de Sébastien Dubé.
Les composants open source verrouillés et leur méthode d'inventaire sont
documentés dans `THIRD_PARTY_NOTICES.md`.

Le nom FileTopo demeure un nom public de travail réversible : aucune marque,
aucun domaine et aucun dépôt distant n'ont été réservés ou publiés.
