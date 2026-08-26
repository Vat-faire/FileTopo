# TASK-0004 — Phase 2 : architecture et pile technologique

- **Statut :** `VERIFIED`
- **Phase :** 2 — Architecture
- **Ouverte et démarrée le :** 2026-08-25
- **Approuvée via :** autorisation permanente du 2026-08-25
- **Exécutant :** Codex
- **Livrée le :** 2026-08-25 (`IMPLEMENTED`)
- **Vérifiée le :** 2026-08-25 par l'orchestrateur; voir
  `docs/ai/VALIDATION.md`, section D

## Rapport de clôture

Les six livrables existent : rapport d'architecture, décisions de licence,
pile, index/modèle, rendu/relief et budgets de performance. Les quatre
décisions comparent au moins trois options. Les frontières de confiance, le
schéma/migrations, le LOD à 1 M d'éléments, les budgets et les tests
synthétiques sont définis. Aucun fichier source ni manifeste de dépendance
n'a été ajouté. Les deux YAML et le JSONL ont été parsés; aucune référence au
corpus privé interdit n'a été trouvée.

## 1. Objectif unique

Définir une architecture implémentable et vérifiable pour **FileTopo** avant
tout code applicatif : pile Windows, modèle de processus, stockage de l'index,
modèle de données, lecture seule, rendu de grandes cartes, modèle de relief,
performance, sécurité, accessibilité et stratégie de test.

## 2. Livrables

- `docs/architecture/phase-2-architecture.md`
- `docs/decisions/DEC-0002-license.md`
- `docs/decisions/DEC-0003-tech-stack.md`
- `docs/decisions/DEC-0004-index-and-data-model.md`
- `docs/decisions/DEC-0005-rendering-and-relief.md`
- Budget de performance initial dans `docs/performance/`.
- Jeu de données synthétique spécifié pour la phase 3.

## 3. Options à comparer

- Conteneur bureau : Tauri 2, Electron, .NET natif, Wails.
- Interface : React/TypeScript et alternatives justifiées.
- Moteur local : Rust, .NET ou Go selon le conteneur retenu.
- Index : SQLite, fichiers structurés ou moteur embarqué alternatif.
- Rendu : SVG, Canvas 2D, WebGL/WebGPU, avec stratégie de dégradation.
- Relief : hiérarchie spatiale stable, métriques documentaires et densité;
  jamais seulement la taille brute du fichier.

## 4. Contraintes obligatoires

1. Windows d'abord, distribution locale, hors ligne dans le MVP.
2. Aucun envoi de nom, contenu, métadonnée ou chemin vers un service distant.
3. Corpus source ouvert en lecture seule; index séparé, reconstructible et
   versionné.
4. Plusieurs collections indépendantes.
5. Grands arbres : traitement incrémental, annulation, progression et rendu
   progressif.
6. Fichiers en ligne seulement non téléchargés automatiquement.
7. Interface FR/EN et accessibilité clavier/lecteur d'écran.
8. Données synthétiques uniquement dans les tests et captures.
9. Dépendances permissives compatibles avec la licence choisie.
10. Aucun code applicatif avant le statut `IMPLEMENTED` de cette tâche.

## 5. Méthode de preuve

- Prioriser les documentations officielles actuelles des technologies.
- Séparer faits vérifiés, inférences, risques et éléments non testés.
- Produire une matrice de décision pondérée et des diagrammes de flux.
- Définir des budgets mesurables pour 10 k, 100 k et 1 M d'éléments.
- Menacer explicitement les frontières : chemins non fiables, liens
  symboliques/jonctions, permissions, cycles, fichiers nuage, watcher perdu,
  index corrompu, ouverture de fichiers externes.

## 6. Critères d'acceptation

1. Les quatre décisions existent et présentent au moins trois options.
2. La pile retenue est compatible Windows et documentée par sources
   officielles.
3. Les frontières de confiance et le modèle de processus sont explicites.
4. Le schéma de données et la stratégie de migration sont définis.
5. Le rendu et le relief ont une stratégie pour 1 M d'éléments.
6. Les budgets de performance sont chiffrés et falsifiables.
7. La lecture seule et les exclusions sûres sont testables.
8. La stratégie de tests synthétiques couvre erreurs et volumes.
9. Aucun code applicatif ni dépendance n'est ajouté par cette tâche.
10. Les états Markdown/YAML/JSONL restent cohérents.

## 7. Interdictions

- Aucun accès à un corpus privé ou réel.
- Aucun achat, compte, dépôt distant, publication ou télémétrie.
- Aucun téléchargement ou installation de dépendance.
- Aucune copie de code tiers.
- Ne pas s'attribuer `VERIFIED`; livrer `IMPLEMENTED` pour contrôle.
