# DEC-0003 — Pile technologique

- **Date :** 2026-08-25
- **Statut :** `VERIFIED`
- **Phase :** 2
- **Décideur :** orchestrateur, sous l'autorisation permanente du 2026-08-25
- **replaced_by :** [DEC-0007](DEC-0007-rebuild-tech-stack.md), approuvée par Sébastien le 2026-08-31 (porte P2)

## Contexte

FileTopo doit parcourir de grands arbres Windows sans modifier les sources,
conserver un index local et afficher une carte 2D GPU fluide. La pile doit
séparer les privilèges système de l'interface et rester testable hors ligne.

## Options examinées

Les notes sont un jugement de projet sur 5, pas un benchmark publié.

| Option | Sécurité 25 % | Perf. 20 % | Windows 15 % | Maint. 15 % | UI 10 % | Distribution 10 % | Portabilité 5 % | Note pondérée |
|--------|---------------|-----------|--------------|------------|---------|-------------------|-----------------|----------------|
| Tauri 2 + Rust + WebView | 4,5 | 4,5 | 4,0 | 4,0 | 5,0 | 4,0 | 5,0 | **4,35** |
| WinUI 3 + .NET | 5,0 | 5,0 | 5,0 | 3,5 | 3,5 | 4,0 | 1,0 | 4,20 |
| Wails + Go + WebView | 4,0 | 4,0 | 4,0 | 4,0 | 5,0 | 4,0 | 5,0 | 4,10 |
| Electron + Node | 3,0 | 3,0 | 4,0 | 5,0 | 5,0 | 2,0 | 5,0 | 3,65 |

## Décision

- Conteneur : **Tauri 2**.
- Cœur privilégié : **Rust stable**, sans sidecar.
- Interface : **React + TypeScript**, construction par **Vite**.
- Tests : Rust natif pour le domaine/indexeur; Vitest et Testing Library pour
  l'interface; WebDriver Windows pour un petit nombre de parcours de bout en
  bout.
- Rendu : PixiJS/WebGL, décidé séparément dans `DEC-0005`.
- Index : SQLite via Rust, décidé dans `DEC-0004`.

Les versions exactes seront verrouillées par les fichiers de verrouillage au
squelette de phase 3 après un contrôle de sécurité et de licence. Aucun CDN,
script distant, contenu Web distant ou mise à jour silencieuse n'est permis.

## Motif

Tauri combine une interface Web adaptée à la visualisation 2D avec un cœur
Rust performant. Son modèle place l'accès complet au système dans le processus
Core et centralise l'IPC. Son système de capacités permet de limiter les
permissions par fenêtre. C'est mieux aligné que Electron avec le principe du
moindre privilège et plus adapté que WinUI à un rendu WebGL/PixiJS portable.

## Frontière de confiance obligatoire

- Le WebView ne reçoit **aucune** permission générique de système de fichiers,
  shell, processus, HTTP, upload ou ouverture externe.
- Seules des commandes Rust étroites et typées sont exposées : choisir une
  racine via dialogue natif, lancer/annuler un scan, lire des pages d'index,
  rechercher, enregistrer l'état de vue et ouvrir un chemin déjà indexé après
  validation.
- Toute entrée IPC est validée dans Rust; aucune requête SQL brute et aucun
  chemin arbitraire ne traversent l'IPC.
- CSP restrictive, ressources intégrées seulement, navigation et nouvelles
  fenêtres refusées par défaut.
- Les opérations longues tournent hors du thread UI avec progression,
  annulation et limites de concurrence.

## Conséquences

- Développement Rust et TypeScript nécessaire.
- WebView2 est une dépendance d'exécution Windows à détecter et documenter.
- Les différences de WebView doivent être couvertes par tests Windows réels.
- Le cœur Rust devient l'unique autorité pour le système de fichiers et
  SQLite.
- Tauri SQL et Tauri FS ne sont pas exposés directement au frontend.

## Preuves

- Tauri, modèle de processus : https://v2.tauri.app/concept/process-model/
- Tauri, capacités : https://v2.tauri.app/security/capabilities/
- Electron, modèle de processus :
  https://www.electronjs.org/docs/latest/tutorial/process-model
- Electron, sécurité : https://www.electronjs.org/docs/latest/tutorial/security
- Microsoft, Windows App SDK :
  https://learn.microsoft.com/en-us/windows/apps/windows-app-sdk/
- Wails, introduction : https://wails.io/docs/introduction/

## Limites

La note pondérée est une décision d'architecture à valider par le squelette;
elle ne prouve ni le temps de scan ni le débit de rendu. Le packaging WebView2
et l'installation hors ligne restent à tester en phase 3.
