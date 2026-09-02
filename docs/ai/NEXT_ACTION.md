# Prochaine action

## Contrôler `TASK-0019` de façon indépendante, sur preuves

- **Statut de la tâche :** **`IMPLEMENTED`** le 2026-09-02 — `VERIFIED`
  **non attribué**; l'exécuteur ne s'auto-vérifie pas
- **Fiche :**
  [`TASK-0019`](../tasks/TASK-0019-composed-multibrain-view.md), **§4 gelée**,
  **§7 résultat**
- **Branche :** `build/v0.2-a4-composed-view`
- **Action unique :** **rendre un verdict sur `TASK-0019`**, par une instance
  **distincte de l'exécuteur**, **sur les preuves publiées** — et rien d'autre

### Ce qu'il y a à contrôler

**Le gel précède le code :** `bcbc4aa` fige `L1`–`L12` avant la première ligne
de cette tranche. Vérifier qu'**aucun critère n'a été retouché après le premier
résultat**.

**Les preuves, sous `docs/performance/runs/` :**

| Fichier | Ce qu'il porte |
|---|---|
| `TASK-0019-L12-composed-view-webview2-pass1.json` | `L12` étapes 1 à 14, vraies frappes |
| `TASK-0019-L12-composed-view-webview2-pass2.json` | `L12` étape 17, après redémarrage réel |
| `TASK-0019-K11-readonly-regression-webview2.json` | `L11` lecture seule et `L2`, trois cerveaux |
| `TASK-0019-K12-foundation-regression-webview2-pass{1,2}.json` | la fondation `TASK-0018` non cassée |
| `TASK-0019-J12-relations-regression-webview2.json` | `J12` non cassé, vraie frappe |

**Les huit preuves protégées doivent être bit-for-bit inchangées.**

### La cible manquée, à examiner en priorité

**`L12` étape 7, moitié « approuver `S-005` dans Alpha » : NON REJOUÉE.** Le bac
à sable est persistant et `S-005` y était déjà approuvée. La moitié « Gamma
strictement inchangé » est tenue. **C'est le point sur lequel un contrôle doit
se prononcer** : la cible est-elle manquée de façon acceptable pour cette
tranche, ou faut-il une remise à zéro du bac à sable — qui serait une
**suppression**, donc un point d'arrêt réservé à Sébastien.

### Ce qui reste interdit

- **Aucune relation inter-cerveaux** — `TASK-0020`.
- **Aucune persistance de vue composée** — `P-19`.
- **Aucune campagne `H9`**, aucun seuil. `R8` entière.
- **`B0` n'est pas corrigé**; rien n'est nettoyé dans `src-tauri/target/`.
- **Aucune fusion vers `main`, PR, release, étiquette, `force push`**, aucune
  réécriture d'historique.
