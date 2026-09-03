# HANDOFF — passage de relais

## Relais actuel — TASK-0022 VERIFIED, 2026-09-03

Le verdict rendu par l'orchestrateur technique indépendant est enregistré dans
[`ACTION-0036`](../reviews/ACTION-0036-independent-recontrol.md) : sur le HEAD
`645b9484790f8e766f7eed93107b9431d144aaa6` et le commit substantif `X8`
`d6963e65e9829b8c17196eeb469eabfb3aa86aeb`, `ACTION-0036`, `X8` et
`ACTION-0035` sont **`CLOSED`**; `TASK-0022` est **`VERIFIED`**. Codex a
enregistré ce verdict sans le rendre et sans rouvrir un autre point.

Conséquence X5 : les huit preuves canoniques `TASK-0022` — J12, K11, L12 en
deux passes, M12 en deux passes et N15 en deux passes — sont ajoutées aux 19
preuves antérieures. Rust, TypeScript et PowerShell portent exactement les
mêmes **27** noms, dans le même ordre. Le H9 non exécuté, K12 non publié comme
preuve `TASK-0022` et les variantes `-abandon` ne sont pas protégés.

Validations limitées au périmètre demandé : 26/26 tests TypeScript
`runArtifacts`, 3/3 tests Rust X5 ciblés, et garde PowerShell exercée sur les
27 refus. Aucun scénario WebView2 n'a été rejoué et aucun artefact de preuve
n'a été modifié. `main` est intacte à `91bbe90f0f99026c28cd345784d4f579a0016db2`.

**Prochaine action unique : retour à l'orchestrateur pour définir la prochaine
tranche.** Ne pas créer `TASK-0023` sans nouvelle décision.

## Relais actuel — TASK-0022 IMPLEMENTED, 2026-09-03

`TASK-0022` est livrée sur `build/v0.2-a6-topographic-node-graph`, mais n'est
pas `VERIFIED`. Le commit de gel `289cf9b` précède tout code produit et N1 à
N15 sont restés immuables.

Le backend persiste le schéma carte `3` et
`layout_algorithm = layered-tree-cards-v1`. Le layout construit en parcours
linéaires des cartes `240 × 64`, profondeur en colonnes de 360 unités, et un
monde non comprimé. Un index v2 est refusé puis reconstruit sans toucher au
catalogue ni aux stores intra/inter. `MapSnapshot` et `MapBuildReport` exposent
l'algorithme effectivement lu du backend.

`MapView` conserve un SVG commun à C1/C2/C3. Les cartes root/directory/file et
diagnostic se distinguent sans couleur seule; chaque non-racine porte une
arête hiérarchique orthogonale namespacée. Les relations établies, suggestions
et relations inter-cerveaux sont ancrées bord à bord. Les flèches suivent
parent, premier enfant, frère précédent et frère suivant, avec mise en vue sans
relayout. Pan, zoom, fit et reset ne modifient aucun rectangle.

Preuves : 149 tests Rust et 188 tests TypeScript; check/build/Tauri debug
passés; N15 pass1/pass2 et régressions J12/K11/L12/M12 dans le vrai WebView2
`152.0.4191.53`. Les huit artefacts sont sous
`docs/performance/runs/TASK-0022-*`. Les frappes probatoires sont fiables,
aucun clic programmatique n'est utilisé. Les 19 preuves X5 sont inchangées.

Limites : Beta/deep n'a pas de store intra par contrat historique; cette
absence reste explicite. `F-042`, H9, R8, P-19 et P-21 restent hors de cette
tranche. B0 n'est pas corrigé; employer `CARGO_INCREMENTAL=0` pour les
validations Rust si l'ICE réapparaît.

**Prochaine action unique : contrôle indépendant de `TASK-0022`.** Vérifier les
artefacts et le commit substantif, puis décider seul de `VERIFIED`. Ne pas
créer `TASK-0023` dans ce contrôle.

- **Dernière mise à jour :** 2026-09-02
- **Branche active :** **`build/v0.2-a5-interbrain-relations`**, créée depuis
  le tip **contrôlé** `8d1e27151f53d082551e05b00816100cb790542b` de
  `build/v0.2-a4-composed-view`
- **Dernière tâche vérifiée :** **`TASK-0021`, `VERIFIED`** le 2026-09-02, sur
  **re-contrôle indépendant ciblé**
  [`ACTION-0034`](../reviews/ACTION-0034-independent-recontrol.md) —
  **`CLOSED`**, `HEAD` contrôlé
  **`10cf54e31276edeb00bd99a5586578791d7b5bc2`**, `main` intacte `91bbe90f`.
  **`X7` `CLOSED`**, **`ACTION-0033` `CLOSED`**. Verdict **rendu par
  l'orchestrateur**, **enregistré** par l'exécuteur. **Livrable DOCUMENTAIRE :
  `VERIFIED` atteste que la CIBLE est correctement écrite, jamais qu'elle est
  implémentée**
- **Dernière tâche de code vérifiée :** **`TASK-0020`, `VERIFIED`** le
  2026-09-02, sur **contrôle indépendant**
  [`ACTION-0032`](../reviews/ACTION-0032-independent-control.md) — **`CLOSED`**,
  `HEAD` contrôlé **`9a7206a1e246258259096b1679f19ac5b53005d7`**, `main`
  intacte `91bbe90f`. Verdict **rendu par l'orchestrateur**, **enregistré** par
  l'exécuteur. **Sixième** tâche `VERIFIED` de l'étape A
- **Tâche vérifiée précédente :** **`TASK-0019`, `VERIFIED`** le 2026-09-02, sur
  re-contrôle indépendant
  [`ACTION-0031`](../reviews/ACTION-0031-independent-recontrol.md) — **réserve
  `X6` et `ACTION-0030` : `CLOSED`**, `HEAD` contrôlé `8d1e271`. La cible
  autrefois manquée de `L12` étape 7 a été **corrigée et `L12` rejoué en
  entier** avant ce verdict. `TASK-0018` est `VERIFIED` depuis le 2026-09-01,
  `TASK-0017` depuis le 2026-09-01, `TASK-0016` depuis le 2026-08-31
- **Tâche livrée, NON vérifiée :** **aucune**
- **Son contrôle indépendant s'est déroulé en DEUX temps, et il est clos :**
  [`ACTION-0033`](../reviews/ACTION-0033-independent-control.md),
  **`CHANGES_REQUIRED`** sur `HEAD` `68211c8`, puis **`CLOSED`**. **Le FOND
  avait été accepté en entier**; **aucune** de ses cibles n'est considérée
  implémentée. La réserve **`X7`** était **documentaire** : `X2` désignait
  **déjà** la réserve technique de `TASK-0016` (`ACTION-0026`, `CLOSED`), et
  `TASK-0021` avait réutilisé le même nom pour la correction de `P-02` —
  **deux sens simultanés**, refusés. **La correction de `P-02` s'appelle
  désormais `P02-R1`**, sur **22** occurrences dans **12** fichiers; **le `X2`
  de `TASK-0016` n'a pas bougé** et reste **`CLOSED`**; **la substance de
  `P-02` n'a pas changé**. **`X7` a été fermée** par
  [`ACTION-0034`](../reviews/ACTION-0034-independent-recontrol.md) sur `HEAD`
  `10cf54e` — **les sept points du périmètre gelé sont TENUS**, la collision
  documentaire est **éliminée**. **Aucune réserve n'est ouverte : `X1` à `X7`
  sont toutes `CLOSED`**
- **Ce que `TASK-0021` a livré :** cinq fiches `DEC-0019` à `DEC-0023`; la
  **correction normative `P02-R1`** de `P-02`, dont l'ancienne formulation est
  **conservée et visible**; **huit fonctions** `F-042` à `F-049`, matrice
  **41 → 49**; une **séquence de sept tranches futures**, `PROPOSED` et **non
  exécutée**. **Aucun layout, aucun moteur, aucune IA, aucun serveur
  implémenté.**
- **Ce que `TASK-0020` a livré, désormais `VERIFIED`** — **relations
  inter-cerveaux explicites**, sous
  [`DEC-0018`](../decisions/DEC-0018-explicit-interbrain-relations.md),
  fonction **`F-041`**. Gel `M1`–`M12` en `7746fd4`, **avant la première ligne
  de code** de la tranche. **`M1`–`M12` tenus**, `M12` aux **vingt-huit
  étapes** dans le vrai `WebView2`, **deux passes**, fermeture et redémarrage
  réels, **aucun indicateur faux** dans l'arbre de preuve.
- **Ce que la mesure a trouvé, publié tel quel :** **deux défauts**, corrigés
  **à la source** et non contournés dans la mesure — des classes `CSS`
  partagées entre panneaux et couches d'arêtes, qui faisaient compter `J12` et
  `L12` de travers alors que rien n'était cassé; et un contrôle `DOM` capturé
  avant un `await`, remplacé par un re-rendu. Après correction, `J12` et `L12`
  retrouvent **exactement** leurs valeurs d'origine.
- **Son contrôle indépendant a eu lieu :** `ACTION-0032`, `CLOSED`,
  `TASK-0020` **`VERIFIED`**. **`cek1` n'est accepté que comme repli déclaré,
  PAS comme `I-E` complète.** `R8` reste entière, `P-19` et `P-21` demeurent,
  `B0` n'est pas corrigé
- **`X5` couvre désormais les cinq preuves de `TASK-0020`** — `M12`
  `pass{1,2}`, `J12` intra, `L12` composée `pass{1,2}` — **et les gardes ont
  été étendues** par `TASK-0021` : **14 → 19 noms** dans les **trois** gardes.
  Testé : `vitest` 14/14, `cargo test map::commands::tests` 14/14, et le
  module PowerShell refuse effectivement les cinq. **Conséquence assumée :**
  les boutons `M12`, `J12` et `L12` du runtime livré n'écrivent plus — la porte
  refuse. Une tranche qui aurait besoin de rejouer l'un de ces scénarios
  **republie sous son propre nom de tâche**
- **Tâche IN_PROGRESS :** aucune
- **Porte `P4` :** **FRANCHIE** —
  [`DEC-0016`](../decisions/DEC-0016-p4-gate-crossing-and-first-slice.md)

## Où en est le projet

`ACTION-0025` a **clos** `TASK-0015` — contrôle accepté, `VERIFIED`, réserve
normative `X1` corrigée dans le même geste — et **franchi la porte `P4`**.

`TASK-0016` a ensuite produit **la première ligne de code de production du
projet**, et la chaîne complète existe : fixture synthétique → scan en lecture
seule → index SQLite persistant → calepinage → carte HTML/SVG accessible **dans
un véritable hôte Tauri/WebView2** → navigation → sélection → détails.

**Les onze critères gelés sont tenus**, et pour la première fois du projet des
temps d'image ont été relevés **dans le moteur de production**.

`ACTION-0026` a **contrôlé** cette tranche et rendu **`CHANGES_REQUIRED`** :
la réserve bloquante **`X2`** a établi que le runtime enregistrait encore huit
commandes héritées de la 0.1, dont un **sélecteur de dossier réel**. La
correction est faite — le gestionnaire n'expose plus que les neuf commandes de
la tranche — et **deux tests-gardes** empêchent la régression.

**Le re-contrôle indépendant a eu lieu, directement sur GitHub.** `X2` est
**`CLOSED`**, `ACTION-0026` est **`CLOSED`**, et **`TASK-0016` est
`VERIFIED`**. `R8` reste entière, `B0` reste non corrigé, **aucune conclusion
nouvelle sur le budget adaptatif**, et les **états de parité restent
strictement limités au périmètre déjà déclaré**.

## Ce qu'il faut savoir en douze lignes

1. **CarteTopo est la RÉFÉRENCE FONCTIONNELLE.** L'ancienne version publique de
   FileTopo est un **prototype et un audit technique**. « L'ancienne version ne
   le faisait pas » **n'est pas un argument recevable**.
2. **L'apparence est entièrement libre** et peut être **entièrement
   modernisée**; **aucune amélioration visuelle ne supprime la parité**. En cas
   de conflit, **la parité gagne**.
3. **Le contrat exigible est
   [`CARTETOPO_FUNCTIONAL_PARITY.md`](../product/CARTETOPO_FUNCTIONAL_PARITY.md)** :
   22 exigences, 3 invariants. **Six sont satisfaites sur le seul périmètre de
   la première tranche, deux sont partielles, seize ne sont pas commencées.**
4. **Correction `X1` :** une **suggestion n'est pas une provenance de
   relation**. Une relation établie a pour provenance **`déterministe`** ou
   **`approuvée`**, sans troisième valeur; une suggestion est un **objet et un
   état distincts**, affichable mais **jamais** comptée comme relation.
5. **`TASK-0016` est `IMPLEMENTED`, jamais auto-déclarée `VERIFIED`.**
6. **Les critères ont été gelés AVANT le code** — commit `6edd5bd`, code en
   `130b670`. **Aucun n'a été retouché après le premier résultat.**
7. **`H9` n'imposait aucune cible d'images par seconde.** Il n'y a **ni cible
   atteinte, ni cible manquée** à annoncer.
8. **`4,20 ms` est une butée**, pas une mesure : synchronisation verticale à
   4,1667 ms sur un écran 240 Hz. **Jamais citable comme performance.** Seuls
   `wide` (**17,80 ms**) et `mixed` (**21,35 ms**) sont au-dessus de la butée —
   valeurs du **binaire corrigé**, légèrement moins bonnes que celles de
   `8cb752b` et publiées telles quelles.
9. **`R8` n'est pas levée** et ne peut l'être qu'à l'**étape C** : une machine,
   un **binaire de développement**, des fixtures **≤ 2 420 nœuds**.
10. **Aucun budget adaptatif** n'est employé, adopté, abandonné ni validé. La
    borne `B-1` de 5 000 nœuds est un **plafond déclaré**, qui ne s'ajuste à
    rien. Réserve `W2` : **aucune stabilité n'est prouvée**.
11. **`B0` s'est reproduit trois fois et n'est pas corrigé.** **Ne rien
    supprimer** dans `src-tauri/target/` — `DEC-0013` E. Employer
    `CARGO_INCREMENTAL=0`.
12. **Aucune donnée réelle, aucun sélecteur de dossier, aucun chemin local
    personnel dans le dépôt** — artefacts de mesure compris.

## TASK-0018 — la troisième tranche, livrée et non vérifiée

**FileTopo a des cerveaux.** Un cerveau est une **identité FileTopo**, pas une
source : `brain-alpha` et `brain-gamma` lisent la **même** fixture
`quasi-empty` et sont totalement indépendants.

1. **Le `brain_id` est le nom d'un répertoire, pas une colonne.**
   `<bac>/brains/catalog.sqlite`, `<bac>/brains/<brain_id>/map/index.sqlite`,
   `<bac>/brains/<brain_id>/relations/relations.sqlite`. Deux cerveaux ne
   peuvent pas se rencontrer parce qu'ils **ne sont pas dans le même fichier**.
   **Ne pas remplacer cela par une colonne `brain_id` dans un magasin
   partagé** : ce serait rendre l'isolation dépendante d'une clause `WHERE`.
2. **L'index nomme le cerveau pour lequel il a été construit** — schéma
   **version 2**, `map_meta.brain_id`. `open_store` **refuse** un index
   construit pour un autre cerveau (`MapError::BrainMismatch`), et un index de
   version 1 n'est celui de personne. **Ne pas assouplir cette garde.**
3. **Un `node_id` ne voyage jamais seul.** `map_node_detail` et
   `map_relations_for_node` prennent un **`BrainNodeRef`**. **Ne jamais
   revenir à un `nodeId` nu** : après une bascule, l'interface tient encore la
   sélection du cerveau précédent, et `12` est valide dans les deux.
4. **Le seed du catalogue crée, il ne corrige jamais.** Un cerveau renommé
   reste renommé au démarrage suivant — `K7`. **Ne pas transformer le
   `INSERT … ON CONFLICT DO NOTHING` en upsert.**
5. **L'état de vue par cerveau est SESSION SEULEMENT.** Seuls le **cerveau
   actif** et les **métadonnées** survivent au redémarrage. **Ne pas prétendre
   que `P-19` est faite.**
6. **`K10` s'exerce par une vraie frappe Windows**, comme `J12` : le mécanisme
   est partagé dans `realInput.ts`. **Ne jamais remplacer la frappe par un
   `.click()`** — la preuve est `isTrusted` et les compteurs à zéro.
7. **Le menu du sélecteur ne se referme pas sur un `blur` à `relatedTarget`
   nul.** Ce n'est pas un détail : une **désactivation de fenêtre** produit ce
   `blur`, et refermer dessus faisait arriver la frappe réelle sur un bouton
   démonté. **Ne pas « simplifier » ce gestionnaire.**
8. **La vue n'est ajustée qu'une fois par cerveau** — `shouldFitOnOpen`. Un
   second ajustement, quand le viewport se stabilise, **effaçait** la vue
   qu'un cerveau venait de retrouver. **Ne pas remettre un `fitView`
   inconditionnel dans cet effet.**
9. **UNE EXÉCUTION D'UNE TÂCHE ULTÉRIEURE N'ÉCRASE JAMAIS LA PREUVE
   CANONIQUE D'UNE TÂCHE `VERIFIED`** — réserve `X5`. La règle est tenue **à la
   porte** : `write_run_artifact` refuse les noms de
   `PROTECTED_RUN_ARTIFACTS`, et tous les noms d'artefacts du runtime vivent
   dans `src/map/runArtifacts.ts`. **Ne jamais écrire un nom d'artefact en
   dur**, et ne jamais retirer un nom de la liste protégée pour « débloquer »
   un scénario : renommer le scénario, pas la preuve. `J12` migré écrit
   désormais `TASK-0018-J12-relations-regression-webview2.json`, **et il a été
   rejoué** dans l'hôte réel.
10. **Les campagnes de vérification et de mesure marchent par cerveau** et ne
    couvrent donc plus `wide` ni `mixed`. **Les artefacts publiés de
    `TASK-0016` sont inchangés** et restent le relevé pour ces deux fixtures.
11. **Ne pas afficher deux cerveaux dans le même graphique** (`TASK-0019`) et
    **ne créer aucune relation inter-cerveaux** (`TASK-0020`).
12. **`B0` s'est reproduit une quatrième fois.** Rien n'a été supprimé dans
    `src-tauri/target/`; `CARGO_INCREMENTAL=0` suffit.

### Comment rejouer `K12`

`K12` demande **deux processus et deux passes**, avec une fermeture et un
redémarrage **réels** :

    CARGO_INCREMENTAL=0 pnpm tauri build --debug --no-bundle
    rm -rf .filetopo-sandbox/brains          # repartir du catalogue neuf
    pwsh scripts/k12-run-real-host.ps1

**Le binaire doit être `debug`.** `map_write_run_artifact` n'existe qu'en
`debug` : un binaire `release` ne peut écrire aucune preuve, pas même son
abandon. La première tentative a été perdue exactement ainsi.

Le lanceur démarre `scripts/j12-send-real-key.ps1` pour la passe 1 — **le même
guetteur que `J12`**, sur la même convention de marqueur. Sans lui, `K10`
échoue, et c'est voulu.

## TASK-0017 — la deuxième tranche, VERIFIED

**Un modèle de provenance existe.** C'est la première fois du projet.

1. **La provenance est la table, pas une colonne.** `relations_deterministic`
   et `relations_approved` sont **deux tables séparées** — `DEC-0009` `R-C`.
   Il n'existe **aucune** colonne `provenance` qu'un `NULL` pourrait vider, et
   **aucune** colonne de règle dans la table des approuvées. Une relation
   établie sans provenance est **non représentable**, pas seulement interdite.
2. **Une suggestion n'est pas une relation** — correction `X1`. Table
   distincte, état propre, **jamais** dans un compte, et **seule** une
   approbation explicite la transforme.
3. **Aucun inverse n'est jamais déduit.** Aucune des deux règles n'est
   symétrique.
4. **Les relations vivent hors de l'index reconstructible :**
   `<bac à sable>/relations/<fixture>/relations.sqlite`. Une reconstruction
   complète de `maps/` n'y touche pas — vérifié sur les quatre fixtures.
5. **La clé d'endpoint `ek1|<fixture>|<chemin relatif>` n'est PAS `I-E`.**
   C'est le repli déterministe, déclaré comme tel. `VolumeSerialNumber` +
   `FileId`, déplacements et renommages réels restent entiers.
6. **Les relations ne sont ouvertes que pour `quasi-empty`**, la fixture gelée.
   Toute autre fixture est refusée **en toutes lettres** — la règle
   `homonymes` est quadratique et produirait des centaines de milliers de
   paires sur `wide`. **C'est une portée, pas une troncature.**
7. **`P-04` reste PARTIELLE** : la **révocation** d'une relation approuvée
   n'est pas implémentée, alors que la parité §5.2 l'exige. Déclarée manquante.
8. **Aucune mesure de performance n'a été prise et aucun seuil n'a été
   inventé** : `TASK-0017` n'en demandait aucun.
9. **La création d'une relation `APPROVED` est verrouillée par le stockage**
   — réserve `X3`. `approve()` est la **seule** voie applicative; le schéma de
   **version 2** ajoute `suggestion_key` **`UNIQUE`**, une **clé étrangère** et
   **trois déclencheurs** qui exigent que la ligne approuvée **soit exactement
   sa suggestion**. **Ne pas rouvrir cette porte** en ajoutant un chemin
   d'écriture.
10. **`J12` s'exerce par une vraie frappe clavier Windows** — réserve `X4`.
    Le scénario n'active rien : il attend `scripts/j12-send-real-key.ps1`.
    **Ne jamais remplacer la frappe par un `.click()`** : la preuve est
    `isTrusted` et les compteurs à zéro.
11. **Ne pas s'attribuer `VERIFIED`.** La tâche est `IMPLEMENTED`.

## Comment faire tourner la tranche

    pnpm install
    CARGO_INCREMENTAL=0 pnpm tauri dev

Les quatre fixtures sont **engendrées** au premier clic, dans
`.filetopo-sandbox/` — ignoré par Git, reproductible depuis les graines fixes
`20260831001` à `20260831004`.

Deux modes non surveillés, **développement seulement** :

    CARGO_INCREMENTAL=0 FILETOPO_AUTO_VERIFY=1 pnpm tauri dev     # lecture seule et isolation, par cerveau
    CARGO_INCREMENTAL=0 FILETOPO_AUTO_MEASURE=1 pnpm tauri dev    # campagne d'images, par cerveau
    CARGO_INCREMENTAL=0 FILETOPO_AUTO_RELATIONS=1 pnpm tauri dev  # rejoue J12 en regression
    FILETOPO_AUTO_BRAINS=1|2                                      # les deux passes de K12

Depuis `TASK-0018`, **les deux premières marchent par cerveau** : le runtime
n'expose plus aucune commande indexée par fixture. Elles couvrent donc
`quasi-empty` (deux fois) et `deep`, **et non** `wide` ni `mixed`.

Chacun écrit son artefact sous `docs/performance/runs/`.

**`J12` demande deux processus.** Le scénario n'active rien lui-même : il pose
le focus et attend une **vraie frappe Windows**. Rediriger la sortie vers un
fichier, puis, dans un autre terminal :

    pwsh scripts/j12-send-real-key.ps1 -LogPath run.log

Sans ce second processus, `J12` **échoue** — et c'est voulu : il ne se rabat
jamais sur un clic synthétique.

**Avant de rejouer `J12` :** remettre le magasin de relations **du cerveau**
à neuf — `rm -rf .filetopo-sandbox/brains/brain-alpha/relations` — pour que
`S-005` soit bien en attente, et **n'ouvrir qu'une seule instance de
l'application**. Deux instances partageant le même magasin produisent des
artefacts contradictoires; c'est arrivé, c'est déclaré, et les artefacts
concernés ont été détruits.

**Si une course reste muette :** la fenêtre doit rester visible. Chromium
suspend `requestAnimationFrame` pour une fenêtre occultée; la course échoue
alors explicitement au bout de 8 s au lieu d'attendre indéfiniment.

## Gouvernance en vigueur

Les **GO techniques** viennent de l'**orchestrateur technique**, sous
délégation de Sébastien. **Restent réservés à Sébastien**, sans délégation :
dépense, **donnée réelle ou personnelle**, publication externe exceptionnelle
(fusion vers `main`, PR, release, étiquette, nouveau distant), opération
destructive ou hors dépôt, **changement important de portée produit**.

## État Git

| Référence | SHA |
|---|---|
| `main` locale et distante | `91bbe90f0f99026c28cd345784d4f579a0016db2` — **non touchée** |
| `rebuild/v0.2-project-brain` | `db8d3de0b20e7efbfe463a17c218cc14face39a8` — **non touchée** |
| `spike/v0.2-technical-risk-gates` | `746f1b5f93c9d7085516c0e56473a95dc2c2d178` — **non touchée** |
| `spike/v0.2-render-budget` | `933bd0d5e7e05e4e7fe233c5fc6b9320a194264d` — **non touchée** |
| `spike/v0.2-budget-controller` | porte la clôture d'`ACTION-0025` |
| `build/v0.2-p4-vertical-slice` | branche de `TASK-0016`, voir `git rev-parse HEAD` |

Aucune fusion, aucune PR, aucune release, aucune étiquette, aucun `force push`,
aucune réécriture d'historique, aucune suppression de branche.

## Points ouverts

| # | Point | Ce qui est demandé |
|---|---|---|
| 1 | **Aucune tranche suivante n'a de fiche** | La spécifier et **geler ses critères avant tout code**. `P4` n'autorisait que `TASK-0016` |
| 1 bis | **La surface runtime doit rester celle de la tranche** | Les deux tests-gardes échouent si une commande hors tranche est réenregistrée. **Ne pas les contourner** |
| 2 | **Seize exigences de parité non commencées** | Chaque tranche suivante exige sa **propre fiche**, ses **critères gelés** et son **GO**. Les relations transversales portent la correction `X1` |
| 3 | **`P-12` et `P-06` sont partielles** | Masquage du panneau, survie au redémarrage, relations transversales et atténuation liée à `F-017` restent à faire |
| 4 | **`P-08` exige 100 000 nœuds** | La borne de 5 000 est une **limite de `TASK-0016`**, pas une limite produit |
| 5 | **Manque `M-1`** — persistance des préférences | À résoudre **avant** la tranche qui implémente réellement `P-19` — `DEC-0016` D |
| 6 | **`R8`** | En vigueur. **Levée seulement à l'étape C** |
| 7 | **Réserves `V1`–`V4`, `W1`–`W4`, `R2`–`R9`** | Toutes en vigueur; `R1` levée depuis `ACTION-0023` |
| 8 | **`B0`, `B3` inter-volume, `B4` question 3** | Inchangés. Le cache fautif est **conservé**; la question 3 se ferme **avant** l'identité persistante et l'état vu/non vu |
| 9 | **`P-21`** | Interface **en français seulement**; bilinguisme intégral et audit WCAG restent à faire |
| 10 | **Aucune réserve `X` ouverte** | `X1` à `X7` sont **toutes `CLOSED`**. `X7` a été fermée par [`ACTION-0034`](../reviews/ACTION-0034-independent-recontrol.md) le 2026-09-02 |

## Sessions : trois procédures partagées

`/debut-session`, `/reprise-session`, `/fermeture-session` côté Claude;
`$debut-session`, `$reprise-session`, `$fermeture-session` côté Codex. La
logique vit dans **`.orchestrator/protocols/`**, en un seul exemplaire; les
`SKILL.md` ne sont que des renvois.

**`.orchestrator/RESULT.md`** est le rapport compact de la **dernière
exécution seulement**, commité et poussé — c'est lui que l'orchestrateur lit
avant de contrôler GitHub, ce qui permet au rapport terminal de rester court.

## Prochaine action unique

**Le réalignement produit est FIGÉ et `VERIFIED`.** `TASK-0021` est
`VERIFIED`, `X7` et `ACTION-0033` sont `CLOSED`, **aucune réserve n'est
ouverte**, aucune tâche n'est `IN_PROGRESS` ni `IMPLEMENTED` en attente.

**Première tranche d'implémentation de la cible post-réalignement :
`TASK-0022` — layout topographique hiérarchique à nœuds/cartes et connexions
explicites**, sous
[`DEC-0020`](../decisions/DEC-0020-topographic-node-graph.md) et **`P02-R1`**.
Elle devra **remplacer la représentation principale imbriquée par une vraie
topographie à nœuds reliés**, **sans supprimer les capacités `VERIFIED`
existantes**. Détail dans [NEXT_ACTION.md](NEXT_ACTION.md).

**`TASK-0022` n'est ni créée ni exécutée à ce stade.** Le **prochain prompt de
l'orchestrateur** définira son architecture, ses fixtures, ses critères gelés,
sa compatibilité multi-cerveaux, ses relations intra et inter-cerveaux, son
`pan`/`zoom`, son clavier, ses labels et ses tests réels `WebView2`.

## Commandes sûres

    git rev-parse --show-toplevel
    git branch --show-current
    git rev-parse HEAD
    git status --short
    git log --oneline 73f0327..HEAD
    git show 6edd5bd --stat    # TASK-0016 : le gel, AVANT tout code
    git show 130b670 --stat    # TASK-0016 : le premier code de production
    git show 51a8cac --stat    # TASK-0017 : le gel, AVANT tout code
    git show a98676e --stat    # TASK-0017 : le premier code de production
    git show 8a259e9 --stat    # TASK-0017 : les corrections X3 et X4
    git show 51bb687 --stat    # TASK-0018 : le gel, AVANT tout code
    git show 4cb1cf4 --stat    # TASK-0018 : le premier code de production
    git show 2424ef2 --stat    # TASK-0018 : les preuves K11 et K12

    CARGO_INCREMENTAL=0 cargo test --manifest-path src-tauri/Cargo.toml --lib
    pnpm check && pnpm test

## Message court pour Claude Code

Lance `/debut-session`. Elle lit ce qu'il faut, dans l'ordre, et rien de plus.

`TASK-0012` à `TASK-0018` sont **closes et `VERIFIED`** — `TASK-0018` par
`ACTION-0029`, qui a clos `X5`. **`TASK-0019` est `IMPLEMENTED`** : gel
`L1`–`L12` commité avant tout code, douze critères tenus, preuves publiées. Son
contrôle indépendant, `ACTION-0030`, a rendu **`CHANGES_REQUIRED`** sur une
seule réserve, **`X6`** — `L12` étape 7 exigeait d'**approuver** `S-005` dans
Alpha, et l'**acte** n'avait pas eu lieu. Elle est **corrigée, `L12` rejoué en
entier, et `X6` reste `OPEN`** : `TASK-0019` **attend son re-contrôle**, sur
`X6` **uniquement**.

**FileTopo est multi-cerveaux** — `DEC-0017`. **Un `brain_id` n'est pas un
`fixture_id`** : deux cerveaux peuvent partager une source et **doivent** rester
indépendants. **Un `node_id` seul n'est jamais une identité globale.**
**Deux cerveaux s'affichent maintenant dans le même graphique** — un canevas
`SVG`, un territoire chacun, `TASK-0019`. **Composer est un affichage :**
ajouter ou retirer ne touche ni catalogue, ni index, ni relation, ni source.
**Un `id` DOM est namespacé par `brain_id`** — `brain-alpha-map-node-4` — parce
que deux cerveaux sur une même source portent le même `node_id`. **Ne crée
aucune relation inter-cerveaux** — c'est `TASK-0020`. **Ne persiste aucune
composition** — c'est `P-19`; au redémarrage, le cerveau actif seul.

**Une preuve devenue canonique ne se supprime pas non plus depuis un script.**
La porte d'écriture de l'application ne dit rien d'un outil qui la contourne :
`scripts/*-run-real-host.ps1` portent une liste protégée et refusent d'y toucher.

**Le bac à sable `<dépôt>/.filetopo-sandbox` est persistant**, et rien
n'annule une approbation. Un scénario qui approuve `S-005` sans vérifier
qu'elle est en attente échoue à sa deuxième exécution — **et l'effacer serait
une suppression, réservée à Sébastien.** Quand un scénario de preuve a besoin
d'un état **neuf**, il ne supprime rien : il demande un **namespace** avec la
variable de développement `FILETOPO_SANDBOX_VARIANT`, et travaille sous
`<dépôt>/.filetopo-sandbox/variants/<variant>`. **Variable absente :
comportement exactement inchangé.** La valeur est un **nom**, jamais un chemin
— basename ASCII `[A-Za-z0-9_-]`, 1 à 64 caractères; tout le reste est une
**erreur explicite**. **N'ajoute ni sélecteur de dossier, ni racine choisie par
l'utilisateur, ni commande de remise à zéro au runtime.**

**Une tranche suivante exige sa propre fiche, ses critères gelés d'avance et
son propre GO.** Ne t'attribue pas `VERIFIED`.

**Une suggestion n'est jamais une relation** — correction `X1`. **La provenance
d'une relation établie n'a que deux valeurs**, et c'est la table qui la porte.
**`approve()` est la seule voie vers une relation approuvée**, et le stockage
l'impose — réserve `X3`. **N'implémente aucune heuristique réelle de
suggestion.** **Ne prétends pas que `ek1` implémente `I-E`.**

**N'ouvre pas Canvas 2D ni WebGL.** **Ne reprends aucun contrôleur de budget de
spike.** **Ne corrige pas `B0` et ne supprime rien** dans `src-tauri/target/`.
**Ne cite jamais 4,20 ms comme une performance** — c'est une butée de
synchronisation verticale. **Ne lève pas `R8`.** Ne fusionne rien, ne crée ni
PR, ni release, ni étiquette.

---

## Depuis `TASK-0020` — les relations inter-cerveaux

**Une relation entre deux cerveaux n'appartient à aucun des deux.** Elle vit
dans `brains/interbrain/relations.sqlite`, **à côté** des cerveaux et dans aucun
d'eux, **hors** de tout `map/` qu'un rebuild remplace, **distinct** du
catalogue. **Ne la range jamais dans le magasin privé d'un cerveau** : une
reconstruction de ce cerveau détruirait un lien dont l'autre est la moitié.

**`source_brain_id` doit différer de `target_brain_id`**, et c'est un `CHECK`,
pas une convention. **Il n'y a pas de colonne `provenance`** : la table où vit
une ligne *est* sa provenance, comme dans `TASK-0017`. **`approve()` est la
seule voie** vers une relation `APPROVED`, et les déclencheurs l'imposent sur
les **six** champs. **N'invente jamais l'inverse d'une relation.**

**`cek1` n'est pas `I-E`.** C'est le repli déterministe : un déplacement ou un
renommage réel casserait une extrémité, et rien ne prétend le contraire.

**Le magasin ignore la composition.** Une relation vers un cerveau non affiché
— ou dont l'index n'a jamais été construit — revient quand même, et
l'interface le **dit** : « hors de la vue ». **Suivre une relation est une
navigation** : elle ajoute le cerveau à la vue et **ne crée, ne modifie ni
n'approuve rien**.

**Deux panneaux, deux espaces de noms `CSS` disjoints; deux couches d'arêtes,
deux classes disjointes.** Ce n'est pas cosmétique : les scénarios `J12` et
`L12` comptent `.relations__direction .relation__link` et `.map-edge` sur tout
le document, et une classe partagée leur fait compter les mauvais éléments —
la même faute qu'un `id` `DOM` pour deux cerveaux. **N'ajoute jamais une classe
`relation__*`, `relations__*`, `suggestion*` ou `map-edge` à un élément
inter-cerveaux.**

**Ne capture pas un contrôle `DOM` avant un `await` pour le presser après** :
un re-rendu peut l'avoir remplacé, et la frappe part dans le vide. Re-interroge
au moment de presser.

**N'implémente aucune détection automatique entre cerveaux**, aucune
heuristique, aucun glisser-déposer, aucun éditeur manuel de relations. **Ne
fusionne jamais deux cerveaux.**

## X8 — une preuve se dérive, elle ne se recopie pas

`M12.28` affirmait « j'écris sous ma propre tâche » en comparant le nom qu'il
venait d'écrire à un préfixe `TASK-0020-` **écrit à la main**, et annonçait le
nombre de preuves protégées par un **littéral**. Les deux étaient vrais quand
ils ont été écrits. La migration des noms sous `TASK-0022` a rendu le premier
faux, et deux extensions de `X5` ont rendu le second périmé — sans que rien
n'échoue, parce qu'une affirmation recopiée ne peut pas se contredire.

**Ne réécris jamais un constat que le produit peut calculer.** L'identité de
tâche se lit dans le nom d'artefact — `artifactTaskId()` — et la tâche
propriétaire se **découvre** en analysant toutes les destinations —
`runtimeWriteOwnership()`. Le nombre de noms protégés est la **longueur** de
`PROTECTED_RUN_ARTIFACTS`, jamais un chiffre. La source canonique reste la
garde Rust `PROTECTED_RUN_ARTIFACTS: [&str; 19]` de
`src-tauri/src/map/commands.rs` — celle qui refuse réellement l'écriture; un
test lit ce source et échoue si le miroir TypeScript diverge.

**Corollaire pour la tranche suivante :** ne « répare » pas ce genre de défaut
en remplaçant `TASK-0022` par `TASK-0023`. Le remplacement littéral reconduit
la panne d'un cran. Un test de garde interdit désormais, dans toute source
d'écriture, `startsWith("TASK-00xx-")` et tout compte de noms protégés écrit en
chiffres ou en lettres.
