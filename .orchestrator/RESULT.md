TASK_ID: TASK-0019 — vue composée multi-cerveaux
AGENT: CLAUDE
RESULT: DONE
BRANCH: build/v0.2-a4-composed-view
FINAL_HEAD: 6dd3585 (+ le commit de mise à jour du rapport)
TASK_STATE: IMPLEMENTED — VERIFIED NON attribué
SESSION: REPRISE après une session interrompue. L'arbre portait une
implémentation à mi-refactor qui ne compilait pas — 4 fichiers neufs,
`brainSession.ts` supprimé mais encore importé, `composedScenario.ts` absent.
Git et les fichiers réels ont primé : HEAD = upstream = bcbc4aa (le gel §4,
poussé), rien de local non poussé. Le point d'arrêt a été situé, puis le
travail repris. **Rien n'a été effacé, rien n'a été recommencé.**

SUMMARY:
- PLUSIEURS CERVEAUX DANS UN SEUL GRAPHIQUE, sans être mélangés. Un canevas
  `SVG`, un territoire par cerveau, chacun gardant son index, ses relations et
  son état. `C2` : 12 + 12 nœuds, DEUX fichiers `SQLite` distincts. `C3` : 181
  nœuds en trois territoires. ZÉRO arête inter-cerveaux sur 32 dessinées.

- LE GEL PRÉCÈDE LE CODE : `bcbc4aa` fige le modèle, `C1`/`C2`/`C3`, les
  formules de territoire et `L1`–`L12` avant la première ligne de la tranche.
  AUCUN critère n'a été retouché après le premier résultat.

- CRITÈRES : `L1` à `L11` TENUS. `L12` tenu à SEIZE étapes sur DIX-SEPT, dans
  le vrai WebView2 `152.0.4191.53`, DEUX processus, fermeture et redémarrage
  RÉELS. Vraies frappes Windows aux étapes 3, 8, 13 et 14 : `isTrusted=true`,
  0 clic programmatique, 0 `dispatchEvent(click)`.

- LA SEULE CIBLE MANQUÉE, PUBLIÉE COMME MANQUÉE : `L12` étape 7, moitié
  « approuver `S-005` dans Alpha », NON REJOUÉE. Le bac à sable est persistant
  et `S-005` y était déjà approuvée par une exécution antérieure du rejeu
  `K12`; le magasin refuse une seconde approbation — c'est `X3` qui fonctionne.
  Aucune commande de remise à zéro n'existe, et effacer le bac à sable serait
  une SUPPRESSION hors périmètre. La moitié qui porte `L8` — « Gamma
  strictement inchangé » — est TENUE. L'artefact porte
  `approvalReplayable: false` et sa raison.

- L'ISOLATION EST À L'ÉCRAN, PAS SEULEMENT EN BASE. Alpha et Gamma lisent la
  même fixture, donc `node_id = 4` existe des deux côtés : les éléments
  s'appellent `brain-alpha-map-node-4` et `brain-gamma-map-node-4`.
  `aria-activedescendant` pointe vers UN `id` et `getElementById` renvoie LE
  PREMIER — un `id` partagé aurait envoyé le lecteur d'écran ET le scénario
  dans le mauvais cerveau, en silence.

- QUATRE DÉFAUTS TROUVÉS EN CHEMIN, corrigés et gardés :
  1. `scripts/k12-run-real-host.ps1` SUPPRIMAIT `TASK-0018-K12-webview2-pass1
     .json`, devenu preuve canonique d'une tâche VERIFIED par `ACTION-0029`.
     La porte d'écriture de l'application ne dit rien d'un script qui la
     contourne. Les deux scripts portent désormais une liste protégée et un
     `Assert-NotProtected`.
  2. Le rejeu `J12` déclarait `task: "TASK-0018"` dans un fichier `TASK-0019`.
     Corrigé; un TEST DE GARDE exige maintenant l'accord du nom et de la charge
     utile.
  3. Un défaut de MESURE, dans le scénario et non dans le produit : la première
     exécution de `L12` a publié `restoredExactly=false`; la vue ÉTAIT
     restaurée, un rendu plus tard. Corrigé en attendant que la valeur CESSE DE
     CHANGER, jamais qu'elle atteigne une valeur attendue.
  4. Un octet NUL était COMMITÉ dans `src/map/brainScenario.ts`.

- `BrainSelector.tsx` SUPPRIMÉ — §4.4 remplace son UX par la barre de
  composition. Les affirmations `K7`, `K8` et `K10` qu'il portait sont REPRISES
  UNE À UNE dans `brains.test.tsx`; les supprimer avec le composant aurait
  retiré trois critères de la suite sans le dire.

FILES:
- neufs : `src/map/composedView.ts`, `territories.ts`, `compositionSession.ts`,
  `CompositionBar.tsx`, `compositionDriver.ts`, `composedScenario.ts`,
  `composedView.test.ts`, `scripts/l12-run-real-host.ps1`
- modifiés : `MapApp.tsx`, `MapView.tsx`, `runArtifacts.ts`, `types.ts`,
  `brainScenario.ts`, `relationScenario.ts`, `brains.test.tsx`,
  `mapView.test.tsx`, `relations.test.tsx`, `runArtifacts.test.ts`,
  `src-tauri/src/lib.rs`, `src-tauri/src/map/commands.rs`,
  `scripts/k12-run-real-host.ps1`
- supprimés : `src/map/BrainSelector.tsx`, `src/map/brainSession.ts`
- preuves : 6 artefacts `TASK-0019-*` sous `docs/performance/runs/`
- docs : fiche `TASK-0019` §7, `CURRENT_STATE`, `NEXT_ACTION`, `HANDOFF`,
  `VALIDATION`, `CHANGELOG_AI`

VALIDATIONS:
- `pnpm check` PASS
- 139/139 tests TypeScript (107 → 139)
- 107/107 tests Rust
- `pnpm build` PASS; build Tauri `debug --no-bundle` PASS
- `L12` deux passes dans le vrai WebView2, redémarrage réel
- `K12` de régression deux passes; `J12` de régression une passe, vraie frappe
- `L11` lecture seule : empreintes identiques ×3, 0 artefact FileTopo dans les
  racines analysées
- LES HUIT PREUVES PROTÉGÉES SONT INCHANGÉES — `git status` ne montre que des
  ajouts non suivis sous `docs/performance/runs/`

NOT_TESTED / LIMITES:
- Aucune campagne `H9`, aucun seuil, aucune mesure de performance. `R8` entière.
- Persistance de la composition NON implémentée — `P-19`. `L12` §17 le confirme
  sur redémarrage réel : Gamma actif, composition Gamma SEUL.
- Aucune relation inter-cerveaux — `TASK-0020`.
- `P-04` non révoquée; `P-21` non satisfaite.
- `B0` s'est reproduit une SIXIÈME fois — `rustc` a paniqué sur son cache
  incrémental. Contourné par `CARGO_INCREMENTAL=0`, qui NE SUPPRIME RIEN; rien
  n'a été effacé ni renommé dans `src-tauri/target/`.
- Une seule machine, un seul runtime WebView2.

REMOTE / DESTRUCTIF:
- Aucune fusion, aucune PR, aucune release, aucune étiquette, aucun `force
  push`, aucune réécriture d'historique.
- Aucune suppression hors dépôt. Le bac à sable `.filetopo-sandbox` N'A PAS été
  effacé — c'eût été un point d'arrêt réservé à Sébastien.
- Seule écriture distante : `push` de commits vers la branche de travail déjà
  publiée `build/v0.2-a4-composed-view`.

NEXT_ACTION: contrôle indépendant de `TASK-0019`, par une instance DISTINCTE de
l'exécuteur, SUR PREUVES. Le point à trancher en priorité : la moitié
« approuver `S-005` » de `L12` §7, non rejouable sans effacer le bac à sable —
ce qui serait une suppression, donc un point d'arrêt réservé à Sébastien.
