# Contribuer à FileTopo

Merci de préserver le principe central : aucune contribution ne doit exiger
l'accès à des documents personnels ou modifier une collection indexée.

## Environnement et vérification

Sous Windows, installez Node.js 24, pnpm 10, Rust stable MSVC, WebView2 et les
Visual Studio Build Tools 2022. Puis exécutez :

```powershell
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
$env:CARGO_INCREMENTAL = '0'
cargo fmt --manifest-path src-tauri/Cargo.toml --all -- --check
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
cargo test --manifest-path src-tauri/Cargo.toml
pwsh -File scripts/dependency-inventory.ps1
pwsh -File scripts/audit-public-readiness.ps1
```

## Données de test

- Utilisez uniquement `tests/fixtures_synthetic` ou un dossier temporaire
  créé et détruit par le test.
- N'ajoutez jamais un chemin absolu personnel, une copie de fichier réel, un
  nom de client, un secret ou une capture contenant des données privées.
- Ne pointez jamais un test, une démonstration ou un benchmark vers un dossier
  utilisateur.
- Les fixtures doivent être petites, déterministes et manifestement fictives.

## Changements sensibles

Toute modification du scanner, de la résolution des chemins, de l'ouverture
Explorer, du stockage ou des commandes Tauri doit inclure des tests de refus :
traversée, lien symbolique/point de réanalyse, identifiant inconnu, annulation
et absence d'écriture dans la racine. Une fonctionnalité réseau, d'IA, d'OCR
ou de réorganisation physique est hors du MVP et doit rester facultative,
désactivée par défaut et faire l'objet d'une décision documentée.

## Dépendances et publication

Les deux fichiers de verrouillage doivent être mis à jour avec tout changement
de dépendance. Relancez l'inventaire et mettez à jour
`THIRD_PARTY_NOTICES.md`. Un commit local n'autorise ni dépôt distant, ni
signature, ni distribution, ni publication.
