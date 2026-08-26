# ROADMAP.md — Feuille de route

> **État.** Les phases 0 à 3 sont exécutées et vérifiées. FileTopo possède un
> squelette Windows construit, testé et inspecté visuellement sur données
> synthétiques. La phase 4 — MVP local sans IA — est en cours. Les phases 5 à
> 7 demeurent différées et aucune publication n'est autorisée sans le GO
> humain spécial prévu pour la phase 6.

| Phase | Intitulé | Statut |
|-------|----------|--------|
| 0 | Isolation et démarrage | VERIFIED (TASK-0001) |
| 1 | Recherche et positionnement | VERIFIED (TASK-0002 et TASK-0003) |
| 2 | Architecture | VERIFIED (TASK-0004) |
| 3 | Squelette vérifiable | VERIFIED (TASK-0005) |
| 4 | MVP local sans IA | IN_PROGRESS (TASK-0006) |
| 5 | Préparation publique | DEFERRED |
| 6 | Publication | DEFERRED |
| 7 | Fonctions avancées facultatives | DEFERRED |

Depuis l'autorisation permanente du 2026-08-25, le passage d'une phase à la
suivante se fait de façon **autonome** dès lors que les critères d'acceptation
et les preuves de la phase précédente sont satisfaits, sans GO répété. Un
agent s'arrête et demande un GO humain uniquement en cas d'ambiguïté
importante, de secret/identifiant manquant, de dépense, d'action destructive
sur des documents utilisateur, ou d'action externe hors objectif. La phase 6
(publication) reste l'exception : elle exige, en plus du régime général, un
**GO humain spécial et distinct**, après audits, et ne peut être abordée que
si les phases précédentes sont vérifiées.

---

## Phase 0 — Isolation et démarrage

**But.** Créer un dépôt local isolé, doté d'une mémoire écrite, stable et
vérifiable, et s'assurer de l'absence de toute donnée privée avant toute
recherche et tout code.

**Contenu.** Nouveau dépôt local, mémoire du projet (règles pour agents,
vision, feuille de route, dossier `docs/`, graphe d'état minimal, dossier de
jeux d'essai synthétiques), contrôle d'absence de données privées.

**Sortie.** Un dépôt local documenté, sans code, sans dépendance, sans commit.

**Statut.** `VERIFIED` le 2026-08-25, vérifié par l'orchestrateur sur preuves
(voir `docs/ai/VALIDATION.md`).

---

## Phase 1 — Recherche et positionnement

**But.** Savoir ce qui existe déjà, ce que ce projet apporterait, et trancher
les questions de nom public et de licence.

**Contenu envisagé.**
- Comparaison des solutions existantes de visualisation de dossiers et de
  documents (forces, limites, licences, plateformes).
- Étude de *GraphRAG Workbench* et des approches de graphe documentaire :
  ce qui est transposable, ce qui ne l'est pas pour un MVP sans IA.
- Recherche de noms publics candidats et vérification de disponibilité.
- Analyse des licences (dont MIT) et de leurs implications.

**Sortie attendue.** Un rapport de recherche daté, avec sources, et une liste
d'options tranchables, dont le **nom public** et la **licence**.

**Statut.** `VERIFIED` le 2026-08-25, sur preuves indépendantes de
l'orchestrateur — voir `docs/ai/VALIDATION.md`, section A.7. Livrable :
`docs/research/phase-1-research-and-positioning.md`. Le rapport
recommandait un nom et une licence. `TASK-0003` a ensuite retenu **FileTopo**
comme nom de travail public réversible dans
`docs/decisions/DEC-0001-public-name.md`; cette décision a été vérifiée avant
l'ouverture de la phase 2. Aucun nom n'est réservé et aucune licence n'est
apposée.

---

## Phase 2 — Architecture

**But.** Décrire le système avant de l'écrire, et trancher la pile
technologique et la méthode de rendu.

**Statut.** `VERIFIED` via `TASK-0004` le 2026-08-25.

**Contenu envisagé.** Modèle de données (cerveau, racine, élément, relation,
relief), pile technologique, comparaison des méthodes de rendu (SVG, Canvas,
WebGL) avant décision, format d'index reconstructible et versionné, garanties
de lecture seule, budget de performance. Chaque décision est consignée dans
`docs/decisions/` sous forme de fiche datée avec alternatives écartées.

---

## Phase 3 — Squelette vérifiable

**But.** Poser un squelette minimal démontrant la faisabilité technique, sans
fonctionnalité complète.

**Contenu envisagé.** Structure de projet, chaîne de construction minimale,
preuve de bout en bout (lecture seule → index → rendu minimal) sur jeux
d'essai synthétiques.

**Statut.** `VERIFIED` via `TASK-0005` le 2026-08-26. TypeScript, Vitest,
Vite, cinq tests Rust, l'exécutable Tauri et l'installateur NSIS ont réussi.
Les mesures 10 k/100 k et l'inspection visuelle sont consignées dans
`docs/performance/phase-3-measurements.md` et `docs/ai/VALIDATION.md`.

---

## Phase 4 — MVP local sans IA

**But.** Un produit utilisable, local, hors ligne, sans intelligence
artificielle.

**Statut.** `IN_PROGRESS` via `TASK-0006` depuis le 2026-08-26.

**Contenu envisagé.** Plusieurs cerveaux indépendants (nom, couleur, icône),
choix d'une racine, index incrémental reconstructible et versionné,
exclusions sûres, carte progressive navigable, cherchable et filtrable,
ouverture des fichiers et dossiers via Windows, distinction vu/non vu, gestion
des fichiers en ligne seulement (non téléchargés automatiquement), robustesse
sur Windows, accessibilité et bilinguisme FR/EN.

---

## Phase 5 — Préparation publique

**But.** Rendre le projet publiable sans risque.

**Contenu envisagé.** Licence apposée, mentions de tiers, relecture de
sécurité et de confidentialité, absence de donnée réelle, guide de
contribution, notes de version.

---

## Phase 6 — Publication

**But.** Publier le projet.

**Contenu envisagé.** Dépôt public, release. **Exige un GO humain spécial et
distinct**, en plus du régime général de GO, avant toute publication.

---

## Phase 7 — Fonctions avancées facultatives

**But.** Envisager des fonctions futures, optionnelles et explicites,
au-delà du MVP.

**Contenu envisagé.** IA, OCR, connecteurs distants — toujours facultatifs,
désactivés par défaut, et déclenchés explicitement par l'utilisateur. Éventuel
classement virtuel du corpus, soumis à aperçu, simulation, confirmation,
journal et restauration ; jamais de réorganisation physique automatique des
documents de l'utilisateur.
