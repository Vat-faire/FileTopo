# Prochaine action

## ACTION-0025 — Contrôle du réalignement produit, puis décision de franchir P4

- **Statut :** PROPOSED
- **Responsable :** une instance **distincte de l'exécuteur** de `TASK-0015` —
  orchestrateur technique pour le contrôle et pour la porte technique;
  **Sébastien** s'il choisit de reprendre `P4`, ce qu'il peut faire à tout
  moment
- **Action unique :** **contrôler le réalignement produit livré par
  [TASK-0015](../tasks/TASK-0015-cartetopo-functional-parity.md)** — contrat de
  parité, reclassement, `DEC-0015`, feuille de route et fiche `TASK-0016` —
  **puis décider de franchir ou non la porte `P4`.**
- **Résultat attendu :** `TASK-0015` passe de `IMPLEMENTED` à `VERIFIED`, avec
  ou sans réserves, ou elle est renvoyée; **et** la porte `P4` est **franchie
  ou maintenue fermée**, par écrit.

### Pourquoi c'est la seule action

`TASK-0015` est livrée **`IMPLEMENTED`** et **ne s'est pas auto-attribué
`VERIFIED`** : l'exécuteur ne juge pas son propre livrable. Aucune tâche n'est
`IN_PROGRESS`.

**Le contrôle et la porte forment une seule action** parce que la porte dépend
du contrôle : `P4` autorise la première tâche d'implémentation, et cette tâche
est [`TASK-0016`](../tasks/TASK-0016-p4-vertical-slice.md), dont le périmètre
est **entièrement dérivé** du contrat de parité. Franchir `P4` avant d'avoir
jugé le contrat reviendrait à autoriser du code contre une cible non contrôlée.

### Ce que le contrôle doit regarder en priorité

1. **La couverture du contrat de parité.** Les 22 exigences `P-01` à `P-22`
   couvrent-elles réellement les points nommés par l'instruction produit ?
   Chaque critère d'acceptation est-il **falsifiable sur données
   synthétiques**, ou seulement déclaratif ?
2. **La règle de liberté visuelle et sa subordination.** §3 du contrat
   autorise-t-il une refonte complète tout en rendant impossible la
   **disparition silencieuse** d'une fonction ? Le mécanisme de conflit — la
   parité gagne, une suppression exige une fiche `DEC` — est-il suffisant ?
3. **La règle des relations transversales.** §5 interdit-il réellement toute
   relation inventée ? La provenance est-elle exigée **visible à l'écran**, et
   le stockage **hors de l'arborescence analysée** ?
4. **Le reclassement.** Les quatre remontées `F-013`, `F-017`, `F-018`, `F-019`
   sont-elles justifiées, la classification d'origine est-elle **conservée et
   visible**, et **rien** n'est-il descendu ? `F-021`, `F-037`, `F-038`,
   `F-039` sont-elles bien restées `DIFFÉRÉ` ?
5. **`DEC-0015` contre `DEC-0014`.** La supplantation porte-t-elle bien sur
   **deux points seulement** — lecture produit de `B`, statut de prérequis de
   `E` ? **`DEC-0014` est-elle restée intacte**, avec un simple renvoi ? Les
   trois restrictions obligatoires de `CAL-B` — `V1`, `V2`, `R8` — sont-elles
   conservées ?
6. **La fiche `TASK-0016`.** Est-elle une **tranche verticale** et non
   l'application entière ? Sa borne de charge est-elle exigée **avant**
   exécution, conformément à `DEC-0015` F ? Ses préalables interdisent-ils bien
   tout démarrage avant `P4` ?
7. **Le manque `M-1`**, déclaré plutôt que comblé : la persistance des
   préférences sans fonction propre. Juger si le déclarer suffit à ce stade.

### Ce que la décision sur P4 doit trancher

- **Franchir `P4`** autorise l'approbation puis l'exécution de `TASK-0016`, et
  **rien d'autre** : une tranche verticale, sur fixtures synthétiques, dans un
  véritable hôte Tauri/WebView2, sans budget adaptatif et avec une borne de
  charge déclarée d'avance.
- **Ne pas franchir `P4`** maintient l'interdiction de toute ligne de code de
  production, et exige d'écrire ce qui manque encore.

**Dans les deux cas, la décision est écrite** — fiche de contrôle ou fiche
`DEC` —, jamais implicite.

### Interdit tant que ce contrôle n'a pas conclu

**N'écrire aucune ligne de code de production : la porte `P4` reste ouverte et
non franchie.** Ne pas approuver ni exécuter `TASK-0016`. Ne pas adopter de
budget, ni reprendre l'un des deux contrôleurs de spike — `DEC-0015` F. Ne pas
ouvrir Canvas 2D ni WebGL. **Ne tenter aucune instrumentation de WebView2**
avant qu'un véritable hôte Tauri existe — `DEC-0014` F. Ne rien supprimer du
cache incrémental de `src-tauri/target/` — `DEC-0013` E. Ne retoucher aucune
preuve de `TASK-0012` à `TASK-0014`. Ne fusionner rien, ne créer ni PR, ni
release, ni étiquette.
