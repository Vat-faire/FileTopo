# Prochaine action

## ACTION-0022 — Approuver ou corriger TASK-0013 avant son exécution

- **Statut :** PROPOSED
- **Responsable :** orchestrateur technique, sous la délégation du 2026-08-31
- **Action unique :** **examiner
  [TASK-0013](../tasks/TASK-0013-b2-bis-layout-and-render-budget.md)**, puis
  donner le **GO d'exécution** ou renvoyer la fiche avec des corrections
  motivées.
- **Résultat attendu :** `TASK-0013` passe à `APPROVED` et son exécution
  s'ouvre, ou elle reste `PROPOSED` avec des corrections écrites.

### Pourquoi c'est la seule action

`TASK-0012` est **`VERIFIED`** depuis le 2026-08-31, sur contrôle indépendant
[`ACTION-0021`](../reviews/ACTION-0021-independent-control.md), **avec neuf
réserves maintenues**. Les six arbitrages qui en découlent sont enregistrés
dans [DEC-0013](../decisions/DEC-0013-post-risk-gate-technical-arbitration.md).
Aucune tâche n'est `IN_PROGRESS`. La suite technique décidée est un `B2 bis`,
spécifié mais **non exécuté**.

### Ce que TASK-0013 demandera, une fois approuvée

1. comparer le calepin actuel à un **calepin squarifié**;
2. éprouver un **budget de rendu auto-régulé**;
3. conserver **HTML/SVG** et l'**accessibilité**, sans régression;
4. combler la réserve de volumétrie avec **`SYN-100K`**;
5. mesurer dans **WebView2**, ou démontrer précisément l'impossibilité et
   déclarer le substitut le plus proche;
6. **données synthétiques uniquement**, **aucun code de production**;
7. les **critères falsifiables `F1` à `F8` sont déjà écrits**, avant toute
   mesure, et ne sont pas ajustables après coup.

### Interdit tant que le GO d'exécution n'est pas donné

Ne créer aucun répertoire de spike, aucune branche, aucune mesure. Ne pas
ouvrir Canvas 2D — `DEC-0013` C ne l'ouvre pas. Ne pas tester l'inter-volume :
cela suppose d'écrire hors du dépôt, ce qui reste réservé à Sébastien. Ne rien
supprimer du cache incrémental de `src-tauri/target/` — `DEC-0013` E l'interdit
dans cette étape. N'écrire aucune ligne de code de production : la porte **P4**
reste ouverte et non franchie. Ne fusionner rien, ne créer ni PR, ni release,
ni étiquette.

### Note, sans statut d'action

Le **texte intégral des réserves `R1` à `R9`** du contrôle indépendant n'est pas
encore dans le dépôt. La lacune est déclarée en section 3 de
[`ACTION-0021`](../reviews/ACTION-0021-independent-control.md); l'orchestrateur
peut la combler quand il le souhaite. Ce n'est pas une action distincte : cela
s'attache au dossier `ACTION-0021`, déjà clos.
