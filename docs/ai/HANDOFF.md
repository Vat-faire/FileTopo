# Passation

- **Date :** 2026-08-31
- **Branche :** rebuild/v0.2-project-brain
- **Base de la branche :** 91bbe90f0f99026c28cd345784d4f579a0016db2
- **Commit livré :** celui portant le message « docs: revise functional architecture baseline », publié sur origin; il révise le commit « docs: establish functional architecture baseline »
- **Tâches :** TASK-0010 VERIFIED le 2026-08-31; TASK-0011 IMPLEMENTED le 2026-08-31 puis **révisée** le 2026-08-31, toujours non vérifiée
- **Tâche IN_PROGRESS :** aucune

## Livré et pourquoi

TASK-0011 a été approuvée par Sébastien le 2026-08-31 (porte P1), puis
exécutée intégralement. Elle produit la baseline qui manquait pour qu'une
phase de développement puisse démarrer sans redécouvrir la conception :

- **L1** — les 39 fonctions `F-001` à `F-039` sont classées `MVP`,
  `ULTÉRIEUR` ou `DIFFÉRÉ` (**31 / 4 / 4** après la révision du 2026-08-31),
  chacune avec un motif, une dépendance amont et un critère d'acceptation
  mesurable;
- **L2** — le parcours utilisateur va de la sélection d'une racine à une carte
  construite automatiquement, sans aucune configuration manuelle de la carte;
- **L3** — la synthèse d'architecture relie modèle de données, indexation,
  surveillance, exclusions, relations, cerveaux et migrations, et énumère
  dix-sept contraintes établies par des sources officielles;
- **L4** — la matrice de formats fixe que le MVP lit des métadonnées et
  n'ouvre aucun contenu;
- **L5** — les objectifs mesurables à 1 000, 10 000 et 100 000 fichiers
  synthétiques, tous marqués « non testé »;
- **L6** — le plan de tests en cinq catégories, sur données synthétiques;
- **L7** — six décisions `DEC-0007` à `DEC-0012`, **toutes `PROPOSED`**,
  chacune comparant au moins deux options réelles.

Aucune décision n'est arrêtée. `DEC-0001` à `DEC-0006` sont inchangées. Le
prototype alpha reste intact : **aucun fichier de code, de test, de dépendance
ni de `graph/` n'a été modifié.**

## Révision du 2026-08-31 — quatre corrections appliquées

La baseline générale a été **acceptée**; la porte **P2 n'est pas franchie**.
Quatre corrections motivées ont été appliquées aux livrables, sans changer
l'état de la tâche ni celui des décisions :

1. **Périmètre MVP** — `F-024` et `F-033` passent à `MVP`; répartition
   **31 / 4 / 4**, 11 écarts déclarés. La portée `MVP` de `F-033` couvre nom,
   couleur, icône, persistance par cerveau et valeurs par défaut sans
   configuration obligatoire.
2. **Rendu (`DEC-0008`)** — HTML/SVG avec virtualisation et niveaux de détail
   au MVP; Canvas 2D seulement sur banc d'essai; WebGL différé. Plafond initial
   de blocs DOM/SVG proposé et marqué **« non testé »**.
3. **Identité (`DEC-0009`)** — stratégie `I-E` : identité Windows si
   disponible, repli déterministe par chemin relatif versionné sinon,
   heuristique réduite à une **suggestion** révocable. Aucune heuristique ne
   préserve automatiquement l'identité, le vu/non-vu ni le journal.
4. **Migration (`DEC-0011`)** — `S-C` conservée; `M-C` conditionnée à un banc
   d'essai synthétique Windows; `M-B` demeure le repli.

Détail complet en section 17 de la
[fiche TASK-0011](../tasks/TASK-0011-functional-architecture-baseline.md) et
en section M de [VALIDATION.md](VALIDATION.md).

## Fichiers essentiels

Lire [CLAUDE.md](../../CLAUDE.md), [START_HERE.md](START_HERE.md),
[CURRENT_STATE.md](CURRENT_STATE.md), [NEXT_ACTION.md](NEXT_ACTION.md), puis
la fiche de la prochaine tâche seulement après son approbation.

La baseline elle-même se lit dans cet ordre :
[REQUIREMENTS_BASELINE.md](../product/REQUIREMENTS_BASELINE.md),
[USER_JOURNEY.md](../product/USER_JOURNEY.md),
[ARCHITECTURE_BASELINE.md](../architecture/ARCHITECTURE_BASELINE.md), puis les
six fiches de décision.

## Non vérifié et blocages

- **Rien n'a été exécuté.** Aucun test automatisé, build, installation, test
  manuel d'interface, essai physique Windows ni mesure de performance.
- Les tests existants du prototype n'ont **pas** été rejoués; leur état de
  réussite au commit de base est inconnu de cette tâche.
- TASK-0011 est `IMPLEMENTED` et **attend une vérification indépendante**.
  L'exécuteur ne s'est pas attribué `VERIFIED`.
- Trois lacunes de recherche sont déclarées et non comblées : les
  spécifications WebGL de Khronos ont renvoyé HTTP 403 et n'ont pas pu être
  consultées; le journal USN n'a pas été instruit sur source primaire;
  `DEC-0012` ne cite aucune source primaire externe et est déclarée
  **incertaine**.
- Deux constats touchent des fiches `VERIFIED` sans les modifier : la tension
  `DEC-0003`/`DEC-0004` sur l'identité de fichier en Rust stable, et l'absence
  de repli Canvas 2D dans PixiJS 8. Voir
  [CURRENT_STATE.md](CURRENT_STATE.md).
- Les deux bancs d'essai introduits par la révision — `B1` (bascule de
  migration Windows) et `B2` (plafond de blocs DOM/SVG) — **n'ont pas été
  exécutés**. Ils conditionnent respectivement `M-C` de `DEC-0011` et tout
  passage à Canvas 2D dans `DEC-0008`.
- `graph/` reste ancien et contradictoire; sa normalisation est toujours
  reportée.
- `docs/tasks/TASK-0008-*.md` demeure `IMPLEMENTED` et se décrit encore comme
  « non commitée » : incohérence historique connue, hors périmètre.
- Aucun blocage technique n'est ouvert.

## Prochaine action unique

Sébastien examine la baseline **corrigée** et les six décisions `DEC-0007` à
`DEC-0012`, puis franchit ou refuse la porte P2 (`ACTION-0019`). Aucune tâche
d'implémentation ne démarre avant P2 **et** P3.

## Commandes sûres

    git rev-parse --show-toplevel
    git branch --show-current
    git rev-parse HEAD
    git status --short
    git show --stat --oneline HEAD

## Message court pour Claude Code

Lis seulement CLAUDE.md, docs/ai/START_HERE.md, docs/ai/CURRENT_STATE.md et
docs/ai/NEXT_ACTION.md. La baseline de TASK-0011 existe, a été corrigée
le 2026-08-31, mais n'est **pas** approuvée : ses six décisions sont `PROPOSED`
et n'autorisent rien. Ne modifie
rien, et n'écris aucune ligne de code, avant un GO explicite de Sébastien sur
les portes P2 puis P3.
