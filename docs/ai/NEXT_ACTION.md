# Prochaine action

## ACTION-0026 — Contrôle indépendant de TASK-0016

- **Statut :** PROPOSED
- **Responsable :** une instance **distincte de l'exécuteur** de `TASK-0016` —
  orchestrateur technique, **ou Sébastien** s'il choisit de reprendre ce
  contrôle, ce qu'il peut faire à tout moment
- **Action unique :** **contrôler la première tranche verticale livrée par
  [TASK-0016](../tasks/TASK-0016-p4-vertical-slice.md)** — code de production,
  onze critères gelés `H1` à `H11`, preuves commitées et premières mesures dans
  WebView2 — puis décider si elle passe à `VERIFIED`, avec ou sans réserves, ou
  si elle est renvoyée.
- **Résultat attendu :** `TASK-0016` passe de `IMPLEMENTED` à `VERIFIED`, avec
  ou sans réserves, ou elle est renvoyée. **Par écrit**, jamais implicitement.

### Pourquoi c'est la seule action

`TASK-0016` est livrée **`IMPLEMENTED`** et **ne s'est pas auto-attribué
`VERIFIED`** : l'exécuteur ne juge pas ses propres preuves. Aucune tâche n'est
`IN_PROGRESS`. **C'est la première fois que du code de production est soumis à
un contrôle** — le précédent compte.

### Ce que le contrôle doit regarder en priorité

1. **La préséance du gel sur les mesures.** §12 de la fiche a-t-elle bien été
   commitée **avant** la première ligne de code ? L'historique Git le
   montre-t-il — commit `6edd5bd` du gel, puis `130b670` du code ? **Aucun
   critère n'a-t-il été retouché** après le premier résultat ?
2. **`H1` est-il non circulaire ?** Il compare **trois** ensembles : le plan de
   la fixture, un parcours indépendant du disque, et l'index. Le plan
   est-il réellement calculé **sans regarder le disque**, et le parcours
   est-il réellement **indépendant du scanner de production** ? Comparer le
   scanner à lui-même ne prouverait rien.
3. **Les trois défauts de protocole de §10 du journal.** Fenêtre occultée,
   carte de 1 × 1 pixel, remise en page pendant la course. Chacun aurait
   produit un chiffre flatteur. Sont-ils **complètement** décrits ? Est-il
   exact qu'**aucune mesure n'existait avant leur correction** — donc que rien
   n'a été réglé sur un résultat ? Le changement de chemin de rendu est-il
   acceptable à ce titre ?
4. **La butée de 4,20 ms.** Est-elle déclarée comme butée **partout** où elle
   apparaît, et jamais citée comme performance ? `wide` et `mixed`
   sont-ils bien au-dessus de la butée ?
5. **L'écart avec les mesures de spike.** Est-il publié **tel quel**, sans
   explication a posteriori ? Les quatre raisons de non-comparabilité —
   grandeur, charge, chemin de rendu, profil de compilation — sont-elles
   énoncées **avant** le rapprochement chiffré ?
6. **`H6` et `H7` sur disque.** L'empreinte couvre-t-elle **contenu et
   horodatages**, pas seulement les noms ? L'état non reconstructible est-il
   **réellement énuméré** et non présumé vide — et le test prouve-t-il qu'il
   **diffère effectivement** après reconstruction ?
7. **La borne `B-1` n'est-elle pas un budget déguisé ?** Elle doit être un
   plafond **déclaré**, qui ne s'ajuste à rien et ne mesure rien —
   `DEC-0015` F. Un dépassement produit-il bien une **erreur explicite**, sans
   troncature, échantillonnage ni niveau de détail ?
8. **Le périmètre.** Aucune relation transversale, aucune recherche, aucun
   watcher, aucun multi-cerveaux, **aucun sélecteur de dossier réel**, aucun
   contrôleur de budget de spike, ni Canvas 2D ni WebGL, **aucune dépendance
   nouvelle** ?
9. **`B0`.** La reproduction est-elle enregistrée **sans être présentée comme
   corrigée**, et **rien** n'a-t-il été supprimé, nettoyé ou renommé dans
   `src-tauri/target/` — `DEC-0013` E ?
10. **Confidentialité.** **Aucun chemin local personnel** dans le dépôt, y
    compris dans les artefacts de mesure ? Le bac à sable est-il **nommé** et
    jamais épelé ?

### Ce que le contrôle ne doit pas conclure

- **Ne pas lever `R8`.** Elle appartient à l'**étape C**. Les mesures de cette
  tranche sont un **point de comparaison**, pas une validation.
- **Ne pas déclarer une exigence de parité satisfaite au-delà de ce que la
  tranche a prouvé.** Six le sont **sur ce périmètre**, deux sont
  **partielles**, seize ne sont **pas commencées**.
- **Ne pas conclure quoi que ce soit sur le budget adaptatif** : il n'est ni
  employé, ni adopté, ni abandonné, ni validé. Réserve `W2` inchangée.

### Interdit tant que ce contrôle n'a pas conclu

**Ne pas ouvrir la tranche suivante de l'étape A** : elle exigera sa propre
fiche, ses propres critères gelés et son propre GO. **Ne pas commencer
l'étape B** — la parité précède l'esthétique. Ne pas corriger `B0` ni rien
supprimer dans `src-tauri/target/`. Ne pas fusionner vers `main`, ne créer ni
PR, ni release, ni étiquette, ne pas réécrire l'historique.
