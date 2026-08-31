# B3 — Inventaire de licence de la dépendance candidate

Fiche établie **avant l'installation**, conformément aux cinq exigences de §6
de [TASK-0012](../../docs/tasks/TASK-0012-technical-risk-gates.md).

## La dépendance

| # | Exigence de §6 | Réponse |
|---|---|---|
| 1 | **Nom et version exacts, épinglés** | `windows-sys`, épinglée à **`=0.61.2`** dans `Cargo.toml`. L'opérateur `=` interdit toute résolution vers une autre version |
| 2 | **Licence vérifiée sur la source officielle du paquet** | **`MIT OR Apache-2.0`**, relevée le **2026-08-31** sur le registre officiel des paquets Rust, `crates.io`, à l'adresse `https://crates.io/api/v1/crates/windows-sys/0.61.2`. Version publiée le 2025-10-06. Dépôt déclaré : `https://github.com/microsoft/windows-rs` |
| 3 | **Compatibilité avec la licence MIT du projet** | **Compatible.** `MIT OR Apache-2.0` est une licence au choix : FileTopo peut retenir la branche MIT, identique à sa propre licence ([DEC-0002](../../docs/decisions/DEC-0002-license.md)). Aucune clause de réciprocité, aucune contamination |
| 4 | **Justification en une phrase** | Sans elle, `VolumeSerialNumber` et le `FileId` 128 bits sont **inatteignables sur le canal `stable`** : les méthodes équivalentes de la bibliothèque standard sont `nightly-only`, et le canal `nightly` est interdit par §10.1.1 |
| 5 | **Confinement** | Déclarée **uniquement** dans `spikes/b3-windows-identity/Cargo.toml`, dont la table `[workspace]` vide empêche tout rattachement à un espace de travail parent. **Ni `package.json`, ni `pnpm-lock.yaml`, ni `src-tauri/Cargo.toml`, ni `src-tauri/Cargo.lock` ne sont modifiés** |

## La dépendance transitive, découverte à la compilation

La compilation a tiré **une seconde caisse**, non déclarée dans le manifeste :

| Élément | Valeur |
|---|---|
| Nom et version | `windows-link` **0.2.1** |
| Origine | dépendance **transitive** de `windows-sys 0.61.2`, verrouillée dans `Cargo.lock` de ce spike |
| Licence | **`MIT OR Apache-2.0`**, relevée le **2026-08-31** sur `https://crates.io/api/v1/crates/windows-link/0.2.1`. Version publiée le 2025-10-06 |
| Dépôt déclaré | `https://github.com/microsoft/windows-rs` |
| Compatibilité MIT | **compatible**, même raisonnement qu'au point 3 ci-dessus |
| Confinement | identique : `spikes/b3-windows-identity/` uniquement |

Elle est consignée ici parce que §6 porte sur les dépendances **ajoutées au
spike**, et qu'une dépendance transitive en fait partie : elle est compilée et
liée dans le binaire produit. L'arbre complet du spike se limite à ces **deux**
caisses.

## Une correction apportée pendant l'exécution

Le manifeste initial déclarait trois fonctionnalités; la compilation a échoué
sur `CreateFileW`, dont la signature référence `SECURITY_ATTRIBUTES`. La
fonctionnalité **`Win32_Security`** a été ajoutée. Aucune dépendance nouvelle
n'en découle : `Win32_Security` est une fonctionnalité de `windows-sys`, pas un
paquet.

## Ce que cette fiche n'établit pas

`B3` **établit une candidature; il n'adopte pas la dépendance.** §6 de
`TASK-0012` est explicite : « Aucune dépendance n'est ajoutée au code de
production par cette tâche, y compris la dépendance d'API Windows envisagée par
`DEC-0007` et `DEC-0009`. »

L'adoption éventuelle de `windows-sys` dans `src-tauri/` relève d'une décision
distincte, prise par Sébastien, après lecture des verdicts.

## Observations complémentaires

- **Déjà présente indirectement.** `windows-sys` figure déjà dans l'arbre de
  dépendances transitives du prototype, par l'intermédiaire de `tauri`. Ce
  spike n'introduit donc pas un fournisseur nouveau dans le projet — mais il
  **n'en déduit aucune autorisation** : la dépendance reste confinée ici.
- **Aucune installation système.** Le paquet est récupéré dans le cache local
  de Cargo, sous le profil utilisateur. Rien n'est installé sur le système,
  aucun service, aucun exécutable global.
- **Aucune dépense.** Le registre `crates.io` est public et gratuit.
