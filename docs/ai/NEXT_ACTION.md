# Prochaine action

## Figer puis exécuter TASK-0016 — la première tranche verticale de production

- **Statut :** `APPROVED` — la porte **`P4` est FRANCHIE**
  ([DEC-0016](../decisions/DEC-0016-p4-gate-crossing-and-first-slice.md))
- **Responsable :** exécuteur de
  [TASK-0016](../tasks/TASK-0016-p4-vertical-slice.md), sous le **GO technique
  de l'orchestrateur** qui nomme cette fiche
- **Action unique :** **figer les critères `H1` à `H11`, les fixtures et la
  borne de charge de `TASK-0016`, puis exécuter la tranche verticale** —
  fixture synthétique → scan Rust en lecture seule → index SQLite persistant
  et reconstructible → calepinage → carte HTML/SVG accessible dans un
  **véritable hôte Tauri/WebView2** → panoramique, zoom, ajuster,
  réinitialiser → sélection souris **et** clavier → détails avec parent et
  enfants directs.
- **Résultat attendu :** `TASK-0016` se termine **`IMPLEMENTED`**, jamais
  `VERIFIED`, sur la branche `build/v0.2-p4-vertical-slice`.

### Ce qui doit être vrai avant la première ligne de code

1. Les critères **`H1` à `H11` sont complétés, commités et figés** — sur le
   modèle de `TASK-0013` et `TASK-0014`. **Aucun critère ne se retouche après
   le premier résultat.**
2. Les **quatre fixtures synthétiques** sont déclarées avec leur graine et
   leur structure, **avant** toute mesure.
3. La **borne de charge** de §5.2 est **déclarée d'avance** et **non
   retouchée ensuite**.

### Le périmètre, et rien de plus

**Six exigences de parité couvertes** — `P-01`, `P-02`, `P-03`, `P-11`,
`P-12`, `P-22` — plus `P-06` **partielle**, pour la seule sélection et
l'accentuation hiérarchique.

**Hors périmètre, explicitement :** relations transversales (`P-04`, `P-05`,
`P-07`), recherche et filtres (`P-08`, `P-09`), légende (`P-10`), contenu
direct listé (`P-13`), copier le chemin et ouvrir dans l'Explorateur (`P-14`,
`P-15`), changements, vu/non vu et surveillance (`P-16` à `P-18`), persistance
des préférences et plusieurs cerveaux (`P-19`, `P-20`), bilinguisme intégral
et audit WCAG complet (`P-21`).

### Interdit pendant cette tâche

- **Aucune donnée réelle, aucun sélecteur de dossier utilisateur** — point
  d'arrêt réservé à Sébastien.
- **Aucun budget de rendu adaptatif**, et **aucune reprise** d'un contrôleur
  de `TASK-0013` ou `TASK-0014` — `DEC-0015` F.
- **Ni Canvas 2D, ni WebGL** — `DEC-0013` C, `DEC-0015` E.
- **Aucune écriture ni modification dans l'arborescence analysée** — `I-1`,
  `I-2`.
- **Aucune suppression, aucun nettoyage, aucun renommage** dans
  `src-tauri/target/` — `DEC-0013` E.
- **Aucune nouvelle dépendance** sans arrêt préalable et justification.
- **Aucune fusion vers `main`, PR, release, étiquette, `force push` ni
  réécriture d'historique.**
- **Aucune levée de réserve** : `V1` à `V4`, `W1` à `W4`, `R2` à `R9` restent
  en vigueur. **`R8` ne peut être levée qu'à l'étape C.**

### Après cette action

L'action suivante sera le **contrôle indépendant de `TASK-0016`**, par une
instance **distincte de son exécuteur**. **L'exécuteur ne s'attribue jamais
`VERIFIED`.**
