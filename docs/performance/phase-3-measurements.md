# Mesures de performance — phase 3

**Date :** 2026-08-26
**Tâche :** `TASK-0005`
**Statut :** mesures locales observées, non promesses produit

## Environnement

- Windows x64;
- Rust 1.98.0, profil de test non optimisé;
- rusqlite 0.40.2 avec SQLite 3.53.2 embarqué;
- index SQLite en mémoire;
- données générées de façon déterministe, sans accès à un corpus réel;
- machine non isolée et processus d'arrière-plan non neutralisés.

## Pipeline mesuré

Pour chaque volume, le test génère les DTO synthétiques, remplace le contenu
d'un index SQLite dans une transaction, puis relit toutes les lignes en pages
de 50 000. Le DTO de terrain reste volontairement plafonné à 2 000 points :
le nombre de lignes indexées n'est pas le nombre de primitives rendues.

| Éléments | Génération | Indexation SQLite | Requête paginée | Total |
|----------|-----------:|------------------:|----------------:|------:|
| 10 000 | 18 ms | 55 ms | 24 ms | 97 ms |
| 100 000 | 77 ms | 726 ms | 224 ms | 1 027 ms |

Commande de reproduction :

```powershell
$env:CARGO_INCREMENTAL = "0"
cargo test --manifest-path src-tauri/Cargo.toml -- --nocapture
```

## Interprétation

Le squelette franchit les preuves 10 k et 100 k sur données synthétiques.
Ces chiffres ne couvrent pas encore un scan disque réel, les exclusions, les
notifications incrémentales, la sérialisation IPC d'une grande collection ou
la mémoire maximale. La phase 4 doit mesurer ces composantes séparément avant
toute affirmation publique de capacité.

## Autres preuves observées

- cinq tests Rust réussis, dont fixture → scanner → SQLite → DTO;
- un test d'interface Vitest réussi;
- TypeScript, Vite et la chaîne Tauri Windows réussis;
- exécutable local et installateur NSIS générés;
- vérification visuelle réelle : relief visible, liste interne défilable et
  fixture synthétique chargée avec 9 éléments et SQLite 3.53.2.
