# Architecture de FileTopo — Phase 2

**Date :** 2026-08-25
**Statut :** `VERIFIED` par l'orchestrateur; voir `VALIDATION.md`, section D.

## 1. Résumé des décisions

- Nom : **FileTopo**.
- Licence : MIT (`DEC-0002`).
- Bureau : Tauri 2, Rust stable, React/TypeScript + Vite (`DEC-0003`).
- Index : un SQLite embarqué par collection, piloté uniquement par Rust,
  version corrigée du bogue WAL-reset (`DEC-0004`).
- Carte : PixiJS 8 / WebGL avec tuiles logiques, LOD et représentation DOM
  accessible parallèle (`DEC-0005`).
- Corpus : métadonnées en lecture seule; jamais de contenu dans le MVP.
- Aucune fonction réseau, télémétrie ou mise à jour silencieuse.

## 2. Vue du système

```text
Utilisateur
   │ clavier / souris / lecteur d'écran
   ▼
React DOM ───────────── PixiJS WebGL
   │ commandes typées       ▲ tuiles visibles seulement
   └──────────┬──────────────┘
              │ IPC Tauri étroit, validé
              ▼
Rust Core (autorité unique)
   ├─ catalogue des collections
   ├─ orchestrateur scan / annulation / progression
   ├─ lecteur de métadonnées Windows en lecture seule
   ├─ agrégateur + layout + générateur de tuiles
   ├─ recherche et requêtes paginées
   └─ ouverture Shell d'un chemin déjà indexé et revalidé
              │
      ┌───────┴────────┐
      ▼                ▼
SQLite AppData     Racine choisie
(lecture/écriture) (métadonnées seulement,
                    aucune écriture)
```

Le WebView est non privilégié. Le cœur Rust détient l'accès système et ne
retourne au frontend que des DTO bornés. Aucune permission générique de
filesystem, SQL, shell, HTTP, upload ou processus n'est accordée au frontend.

## 3. Composants

### 3.1 Catalogue

Conserve UUID, nom, couleur, icône, chemin racine brut local, état et chemin
de base de chaque collection. Les collections ne partagent ni nœuds, ni FTS,
ni layout. Supprimer une collection supprime seulement son index après
confirmation; jamais sa racine.

### 3.2 Indexeur

Parcours itératif, travail CPU/I/O hors thread UI, concurrence bornée. Il lit
les attributs sans suivre les points de réanalyse, détecte les placeholders,
applique les exclusions, émet des lots transactionnels et accepte une
annulation coopérative. Chaque entrée devient un nœud ou un diagnostic.

États : `new → scanning → aggregating → laying_out → ready`; états d'échec
`cancelled`, `dirty`, `failed_recoverable`. Un crash ne change jamais le
corpus; un index incohérent est reconstruit.

### 3.3 Surveillance

Le watcher améliore la fraîcheur mais n'est pas une source de vérité. Les
événements sont coalescés par clé stable et appliqués par lots. Overflow,
erreur `ERROR_NOTIFY_ENUM_DIR`, sortie de veille, changement de volume ou
écart de révision marquent la collection `dirty` et déclenchent une
réénumération. Un scan périodique léger pourra être ajouté après mesure.

### 3.4 Requêtes et recherche

API paginée/cursorisée : arborescence, ancêtres, enfants, recherche FTS5 de
noms/chemins, statistiques, diagnostics et tuiles par viewport. Les limites
et tailles maximales sont fixées côté Rust. Aucun SQL transmis par le client.

### 3.5 Layout et tuiles

Le layout transforme l'arbre en territoires déterministes imbriqués. Les
statistiques calculent un relief composite explicable. Des tuiles par zoom
stockent agrégats, géométrie et révision; seules les tuiles du viewport et une
marge sont envoyées. Changer filtre ou poids produit une nouvelle clé de
cache, pas une mutation du corpus.

## 4. Flux principaux

### Ajouter une collection

1. Dialogue natif Tauri; l'utilisateur choisit la racine.
2. Rust canonise sans accepter un chemin arbitraire du WebView, vérifie qu'il
   s'agit d'un dossier lisible et identifie le volume.
3. Création de la base dans AppData et enregistrement catalogue.
4. Scan en lecture seule, progression et aperçu par lots.
5. Agrégation/layout; état `ready`; watcher démarré.

### Ouvrir un élément

1. Le frontend transmet uniquement `collection_id` + `node_id`.
2. Rust résout le chemin autoritatif, vérifie qu'il reste sous la racine et
   que le type n'est pas interdit.
3. Pour un placeholder en ligne seulement, l'ouverture exige une action
   utilisateur explicite et un avertissement d'hydratation potentielle.
4. Ouverture via l'API Windows/Shell sans passer par une commande de shell.

### Mise à jour

1. Watcher produit un événement non fiable.
2. Réconciliation par métadonnées et clé stable.
3. Transaction courte; statistiques et tuiles du sous-arbre invalidées.
4. UI reçoit la nouvelle révision et recharge seulement le visible.

## 5. Menaces et réponses

| Menace | Réponse |
|--------|---------|
| Chemin IPC forgé | IDs seulement; résolution Rust; contrôle sous racine |
| `..`, lien, jonction, point de réanalyse | Chemins relatifs bruts; `symlink_metadata`; non-suivi par défaut |
| HTML/nom malveillant | Texte échappé par React; jamais `innerHTML`; CSP locale |
| Navigation Web distante | Refusée; aucune capacité distante; CSP restrictive |
| Hydratation OneDrive involontaire | Attribut recall détecté; aucune lecture de contenu/miniature/hash |
| Watcher incomplet | Overflow/erreur => rescan; révision monotone |
| Base corrompue | `integrity_check`, sauvegarde locale, reconstruction |
| SQLite WAL-reset | SQLite corrigé; un écrivain; version vérifiée au démarrage |
| Disque plein | Transactions atomiques, erreur récupérable, corpus intact |
| Frontend compromis | Capacités minimales, commandes étroites, validation Rust |
| Fuite dans logs | IDs/codes; chemins et noms masqués par défaut dans rapports exportables |

## 6. Modèle de données

Le schéma logique détaillé est dans `DEC-0004`. Principes : chemin relatif
UTF-16LE autoritatif, texte affiché séparé, clé stable opportuniste, versions
de schéma/layout, FTS5 sans contenu de document, erreurs nettoyées. Un index
est jetable; l'état utilisateur non reconstructible (nom/couleur/attention)
est sauvegardé séparément des tables dérivées.

## 7. Relief et rendu

Le territoire vient de la hiérarchie; le relief vient d'un mélange borné de
masse structurelle, récence, diversité, centralité, attention et seulement
5 % de taille logarithmique. Le champ est calculé par tuile dans Rust, puis
rendu en aplats, contours et ombrage léger par PixiJS. La liste DOM demeure
l'accès sémantique complet; le canvas est une exploration visuelle.

## 8. Budgets et validation

Budgets dans `docs/performance/phase-2-budgets.md`. Point dur : à 1 M
d'éléments, première carte <2 s avec index existant, scan initial <120 s sur
SSD de référence, recherche p95 <500 ms, 50 k primitives visibles maximum,
30 fps minimum et mémoire <1,5 Go. Ce sont des critères de rejet, pas des
résultats acquis.

## 9. Tests synthétiques de phase 3

Le générateur déterministe doit produire :

- volumes 10 k / 100 k / 1 M sans créer nécessairement 1 M fichiers physiques
  pour les tests de domaine/layout;
- fixtures physiques plus petites pour l'I/O Windows;
- arbres larges, profonds, mixtes, vides, noms très longs, UTF-16 difficile,
  collisions de casse, extensions variées;
- permissions refusées, disparition pendant scan, jonctions/liens, cycles,
  placeholders simulés, watcher overflow, disque plein et base corrompue;
- migrations depuis au moins deux versions de schéma synthétiques.

Niveaux : tests unitaires purs, tests SQLite temporaires, tests d'intégration
sur arborescence synthétique, benchmarks Criterion, tests frontend, puis petit
E2E Windows. Aucun test ne pointe vers un dossier utilisateur réel.

## 10. Plan de squelette (phase 3)

1. Monorepo Tauri minimal et licence MIT.
2. Types de domaine Rust sans I/O; générateur synthétique.
3. SQLite et migrations; tests de reconstruction/corruption.
4. Scanner d'une fixture locale synthétique en lecture seule.
5. Commandes IPC étroites et React minimal.
6. PixiJS affichant des agrégats/tuiles synthétiques + liste DOM.
7. Benchmarks 10 k/100 k; simulateur 1 M pour layout/requêtes.
8. Preuve Windows d'ouverture contrôlée et de watcher avec overflow simulé.

## 11. Sources principales

- Tauri : https://v2.tauri.app/concept/process-model/
- Capacités Tauri : https://v2.tauri.app/security/capabilities/
- Windows App SDK : https://learn.microsoft.com/en-us/windows/apps/windows-app-sdk/
- Electron sécurité : https://www.electronjs.org/docs/latest/tutorial/security
- Wails : https://wails.io/docs/introduction/
- SQLite WAL : https://www.sqlite.org/wal.html
- SQLite FTS5 : https://www.sqlite.org/fts5.html
- `ReadDirectoryChangesExW` :
  https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-readdirectorychangesexw
- Placeholders Windows :
  https://learn.microsoft.com/en-us/windows-hardware/drivers/ifs/placeholders_guidance
- PixiJS renderers : https://pixijs.com/8.x/guides/components/renderers
- PixiJS accessibilité : https://pixijs.com/8.x/guides/components/accessibility
- MIT : https://opensource.org/license/mit

## 12. Non testé / inconnu

- Débit réel du scanner, poids du binaire et consommation mémoire.
- Compatibilité WebGL/WebView2 sur la machine minimale.
- Packaging hors ligne et comportement antivirus/SmartScreen.
- Ergonomie et compréhension du relief par des utilisateurs.
- Robustesse réelle des identités de fichiers avec fournisseurs nuage.
- Exactitude des budgets avant prototype.
