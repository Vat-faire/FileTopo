# Prochaine action

## Exécuter TASK-0019 — vue composée multi-cerveaux

- **Statut de la tâche :** **`APPROVED`** le 2026-09-01, sous **GO technique**
  de l'orchestrateur
- **Fiche :**
  [`TASK-0019`](../tasks/TASK-0019-composed-multibrain-view.md), **§4 gelée**
- **Branche :** `build/v0.2-a4-composed-view`, créée depuis le tip **contrôlé**
  `9e77a6d83fcde194af26da6d356483f592452612`
- **Action unique :** **implémenter la vue composée multi-cerveaux**, et rien
  d'autre — plusieurs cerveaux dans **un seul graphique**, sans fusionner leurs
  stockages et sans créer aucune relation entre eux

### Le gel précède le code

**§4 est commitée avant la première ligne de code** : modèle de vue composée,
compositions `C1` / `C2` / `C3`, disposition en territoires, identité DOM,
mémoire de session par composition, noms d'artefacts, et **critères `L1` à
`L12`**.

**Aucun `L1`–`L12` ne se retouche après le premier résultat.**

### Ce qui est interdit dans cette tranche

- **Aucune relation inter-cerveaux** — `TASK-0020`.
- **Aucune vue composée sauvegardée sur disque** — `P-19`.
- **Aucune vraie racine utilisateur, aucun sélecteur de dossier, aucune donnée
  réelle.**
- **Aucune nouvelle dépendance.** Si une s'avérait nécessaire : **`BLOCKED`
  avant installation**.
- **Aucune campagne `H9`**, aucun seuil de performance.
- **`B0` n'est pas corrigé**; rien n'est nettoyé dans `src-tauri/target/`.
- **Aucune fusion vers `main`, PR, release, étiquette, `force push`**, aucune
  réécriture d'historique.

### Fin de tranche

**`TASK-0019` termine `IMPLEMENTED`, jamais `VERIFIED`.** L'action suivante
sera le **contrôle indépendant de `TASK-0019`**, par une instance **distincte
de l'exécuteur**, **sur preuves**.
