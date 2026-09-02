# Prochaine action

## Contrôler `TASK-0020` de façon indépendante

- **Statut de la tâche :** **`IMPLEMENTED`** — `VERIFIED` **non attribué**;
  l'exécuteur ne s'auto-vérifie pas
- **Fiche :** [`TASK-0020`](../tasks/TASK-0020-interbrain-relations.md),
  **§4 GELÉE** en `7746fd4` avant toute ligne de code, **§7 résultat**
- **Décision produit :**
  [`DEC-0018`](../decisions/DEC-0018-explicit-interbrain-relations.md),
  fonction **`F-041`**, `MVP`
- **Branche :** `build/v0.2-a5-interbrain-relations`
- **Action unique :** **rendre un verdict sur `TASK-0020`**, par une instance
  **distincte de l'exécuteur**, **sur les preuves publiées** — et rien d'autre

### Les preuves publiées

| Artefact | Ce qu'il porte |
|---|---|
| `TASK-0020-M12-interbrain-relations-webview2-pass1.json` | `M12` étapes 1 à 22, vrai `WebView2`, vraies frappes |
| `TASK-0020-M12-interbrain-relations-webview2-pass2.json` | `M12` étapes 24 à 28, après fermeture et redémarrage réels |
| `TASK-0020-J12-intrabrain-regression-webview2.json` | régression `J12` intra-cerveau |
| `TASK-0020-L12-composed-regression-webview2-pass{1,2}.json` | régression `L12` vue composée |

**Aucun indicateur faux dans l'arbre de preuve de `M12`**, aux deux passes.

### Ce qu'il y a à contrôler

- Le **gel** `7746fd4` précède-t-il le code `d1adcf2` ? Aucun critère
  `M1`–`M12` n'a-t-il été retouché après le premier résultat ?
- **`M1`** : une relation à un seul cerveau, sans type, sans provenance ou avec
  une troisième provenance est-elle vraiment **irreprésentable** — y compris en
  contournant Rust ?
- **`M2`** : les six relations gelées existent-elles **exactement**, avec règle
  et version, digest identique sur deux rejeux, **zéro** inverse ?
- **`M3`** : l'approbation produit-elle **une** relation et une seule, et les
  trois refus tiennent-ils **au niveau `SQLite`** ?
- **`M4`** : les 19 extrémités correspondent-elles à l'attendu **gelé**, et les
  quatre **témoins** portant des relations intra sont-ils bien à `0`/`0` ?
- **`M5`** : après rebuild des trois index, le magasin est-il intact, le digest
  inchangé, et **aucune** extrémité non résolue ?
- **`M6`** : les arêtes traversent-elles vraiment, **zéro** dessinée dans un
  seul cerveau, et la distinction tient-elle **sans couleur** ?
- **`M7`** : les deux panneaux sont-ils **réellement** séparés — y compris dans
  leurs classes `CSS`, après la correction de §7.4 ?
- **`M8`/`M9`** : les frappes sont-elles **réelles** (`isTrusted`, 0 clic
  programmatique), et la navigation hors vue **ne crée-t-elle rien** ?
- **`M10`** : `XB-S01` compte-t-elle `0` avant et **exactement +1** après, sans
  règle inventée ?
- **`M11`** : les **14** preuves protégées sont-elles **bit-for-bit
  inchangées**, les racines analysées intactes, `main` non touchée ?
- **§7.4** : les deux défauts trouvés par la mesure ont-ils été corrigés **à la
  source** plutôt que contournés dans la mesure ?

### Ce qui reste hors sujet pour ce contrôle

- **Aucune campagne `H9`**, aucun seuil. `R8` entière.
- **`I-E` complète** hors périmètre; `cek1` est déclaré comme le repli.
- **Aucune révocation `P-04`**, aucune persistance de composition — `P-19`.
- **`B0` n'est pas corrigé**; rien n'est nettoyé dans `src-tauri/target/`.
- **Aucune fusion vers `main`, PR, release, étiquette, `force push`**, aucune
  réécriture d'historique.
