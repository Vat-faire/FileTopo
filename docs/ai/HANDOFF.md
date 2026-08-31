# Passation

- **Date :** 2026-08-31
- **Branche :** rebuild/v0.2-project-brain
- **Base de la branche :** 91bbe90f0f99026c28cd345784d4f579a0016db2
- **HEAD au démarrage :** 57e181f5100d69bfbb3dc2bfc749d9ebd96507d7
- **Commit livré :** celui portant le message
  « docs: approve baseline and propose technical risk gates », publié sur
  `origin/rebuild/v0.2-project-brain`
- **Tâches :** TASK-0010 VERIFIED; **TASK-0011 VERIFIED le 2026-08-31**, porte
  P2 franchie par Sébastien; **TASK-0012 PROPOSED**, non exécutée
- **Tâche IN_PROGRESS :** aucune

## Livré et pourquoi

Sébastien a donné un **GO explicite** le 2026-08-31 et a franchi la porte
**P2**. Cette session enregistre cette approbation dans la mémoire versionnée
et prépare la porte suivante. Elle est **entièrement documentaire**.

1. **`TASK-0011` passe à `VERIFIED`.** La section 18 de la fiche consigne le
   franchissement, les vérifications Git préalables, les six arbitrages, l'état
   des sept livrables et ce que l'approbation **n'autorise pas**.
2. **`DEC-0007` à `DEC-0012` passent à `APPROVED`**, chacune avec son option
   retenue écrite dans sa section « Décision » : `B`, `A`, `I-E`+`R-C`,
   `W-B`/`W-C`+`U-B`, `S-C`+`M-C` conditionnelle avec repli `M-B`, `F-D`.
3. **Les sept livrables portent l'état approuvé**, avec la mention explicite
   qu'ils **n'ont jamais été testés physiquement**.
4. **Trois champs `replaced_by`** sont renseignés sur des fiches `VERIFIED` :
   `DEC-0003` → `DEC-0007`, `DEC-0004` → `DEC-0009`, `DEC-0005` → `DEC-0008`.
   Aucun autre contenu de `DEC-0001` à `DEC-0006` n'a changé.
5. **`TASK-0012` est créée au statut `PROPOSED`** et **n'est pas exécutée**.
   Elle spécifie cinq bancs d'essai synthétiques — `B0` santé du prototype,
   `B1` migration SQLite Windows, `B2` rendu HTML/SVG, `B3` identité Windows,
   `B4` attributs infonuagiques — avec branche dédiée, fichiers autorisés,
   répertoire isolé `spikes/`, règle de licence, critères de succès et d'échec,
   conditions d'arrêt immédiat, état final `IMPLEMENTED` jamais `VERIFIED`, et
   **GO P3 obligatoire avant exécution**.

**Aucun fichier de code, de test, de dépendance ni de `graph/` n'a été
modifié.** Aucune commande d'application n'a été lancée.

## Ce que l'approbation n'autorise pas

- Aucune ligne de code de production : la porte **P3** reste à franchir, et
  une tâche d'implémentation approuvée sera encore nécessaire après elle.
- Aucune implémentation de `M-C` tant que `B1` n'a pas été exécuté et publié;
  `M-B` demeure le repli obligatoire.
- Aucun passage à Canvas 2D tant que `B2` n'a pas réfuté HTML/SVG, mesure
  jointe.
- Aucune dépendance ajoutée, y compris la dépendance d'API Windows envisagée
  par `DEC-0007` et `DEC-0009` : son inventaire de licence appartient à `B3`.
- Aucune fusion, PR, publication, release, étiquette, `force push` ni push vers
  `main`.

## Fichiers essentiels

Lire [CLAUDE.md](../../CLAUDE.md), [START_HERE.md](START_HERE.md),
[CURRENT_STATE.md](CURRENT_STATE.md), [NEXT_ACTION.md](NEXT_ACTION.md), puis
[TASK-0012](../tasks/TASK-0012-technical-risk-gates.md) — **seulement pour
l'examiner**, jamais pour l'exécuter avant son approbation.

La baseline approuvée se lit dans cet ordre :
[REQUIREMENTS_BASELINE.md](../product/REQUIREMENTS_BASELINE.md),
[USER_JOURNEY.md](../product/USER_JOURNEY.md),
[ARCHITECTURE_BASELINE.md](../architecture/ARCHITECTURE_BASELINE.md), puis les
six fiches `DEC-0007` à `DEC-0012` et
[docs/decisions/README.md](../decisions/README.md).

## Non vérifié et blocages

- **Rien n'a été exécuté.** Aucun test automatisé, build, installation, essai
  Windows, rendu ni mesure. L'approbation P2 porte sur des **documents**.
- Les tests existants du prototype n'ont **pas** été rejoués; leur état de
  réussite reste **inconnu**. C'est l'objet de `B0`.
- Les cinq bancs d'essai `B0` à `B4` **n'ont pas été exécutés**.
- Le plafond de 3 000 blocs DOM/SVG reste une hypothèse à réfuter, **pas une
  capacité déclarée**.
- L'ambiguïté des attributs infonuagiques reste **non résolue**.
- Trois lacunes de recherche demeurent, déclarées et non comblées : WebGL
  Khronos inaccessible (HTTP 403), journal USN non instruit sur source
  primaire, `DEC-0012` sans source primaire externe — cette dernière étant
  désormais une **exception humaine explicitement acceptée**.
- `graph/` reste ancien et contradictoire; sa normalisation est toujours
  reportée.
- `docs/tasks/TASK-0008-*.md` demeure `IMPLEMENTED` et se décrit encore comme
  « non commitée » : incohérence historique connue, hors périmètre.
- Aucun blocage technique n'est ouvert.

## Prochaine action unique

Sébastien examine et approuve ou corrige
[TASK-0012](../tasks/TASK-0012-technical-risk-gates.md) avant la porte P3
(`ACTION-0020`).

## Commandes sûres

    git rev-parse --show-toplevel
    git branch --show-current
    git rev-parse HEAD
    git status --short
    git show --stat --oneline HEAD

## Message court pour Claude Code

Lis seulement CLAUDE.md, docs/ai/START_HERE.md, docs/ai/CURRENT_STATE.md et
docs/ai/NEXT_ACTION.md. La porte P2 est **franchie** : TASK-0011 est
`VERIFIED` et DEC-0007 à DEC-0012 sont `APPROVED` — mais **rien n'a été
exécuté**, et une décision approuvée n'est pas une preuve. TASK-0012 est
`PROPOSED` et **n'autorise rien**. N'exécute aucun banc d'essai, n'installe
aucune dépendance et n'écris aucune ligne de code avant un GO explicite de
Sébastien sur la porte P3.
