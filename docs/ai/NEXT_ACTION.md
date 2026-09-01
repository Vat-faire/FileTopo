# Prochaine action

## Spécifier la prochaine tranche de l'étape A

- **Statut :** PROPOSED — **en attente du GO de l'orchestrateur technique**
- **Responsable :** orchestrateur technique pour le choix de la tranche et le
  GO; **Sébastien** pour tout ce qui touche la portée produit
- **Action unique :** **choisir la prochaine tranche de l'étape A, en écrire la
  fiche, et en geler les critères — avant toute ligne de code.**
- **Résultat attendu :** une fiche de tâche `PROPOSED` puis `APPROVED`, avec
  ses critères, ses fixtures et ses bornes **gelés et commités avant le premier
  changement de code**, sur le modèle de `TASK-0016` §12.

### Pourquoi c'est la seule action

`TASK-0016` est **`VERIFIED`** depuis le re-contrôle indépendant
[`ACTION-0026`](../reviews/ACTION-0026-independent-control.md) du commit
`a6cf092` : réserve `X2` **`CLOSED`**, `ACTION-0026` **`CLOSED`**. Aucune tâche
n'est `IN_PROGRESS`, et **aucune tranche suivante n'a de fiche**.

La porte `P4` n'autorisait que `TASK-0016`. **Une tranche suivante exige sa
propre fiche, ses propres critères gelés et son propre GO** — `DEC-0016` C.

### Ce que la prochaine tranche devra trancher

**Seize exigences de parité ne sont pas commencées**, et elles ne se valent
pas :

- **`P-04`, `P-05`, `P-07`** — relations transversales. Elles portent la
  correction **`X1`** : une **suggestion n'est pas une provenance de
  relation**. Le modèle de provenance est **entièrement à écrire**, et
  `DEC-0015` C le signale comme la charge principale ajoutée au MVP.
- **`P-08`** — recherche, sur **100 000 nœuds**. La borne de 5 000 était une
  limite de `TASK-0016`, **pas une limite produit** : cette tranche devra
  franchir un ordre de grandeur, ce qui remet le calepinage et le rendu à
  l'épreuve.
- **`P-19`** — persistance des préférences. **Le manque `M-1` doit être résolu
  AVANT** cette tranche — `DEC-0016` D.
- **`P-12` et `P-06`** sont **partielles** : masquage du panneau, survie au
  redémarrage, atténuation liée à `F-017`.

### Ce qui reste interdit

- **Ne pas commencer l'étape B** — la parité précède l'esthétique.
- **Ne pas lever `R8`** : elle appartient à l'**étape C**.
- **Ne rien conclure sur le budget adaptatif** : ni employé, ni adopté, ni
  abandonné, ni validé.
- **Ne pas corriger `B0`**, ne rien supprimer dans `src-tauri/target/`.
- **Ne pas contourner les tests-gardes** de la surface runtime : le
  gestionnaire n'expose que la tranche courante.
- **Aucune donnée réelle, aucun sélecteur de dossier utilisateur** sans GO de
  Sébastien.
- **Aucune fusion vers `main`, PR, release, étiquette, `force push`**, aucune
  réécriture d'historique.
