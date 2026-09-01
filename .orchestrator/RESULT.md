TASK_ID: TASK-0018 — correction de la réserve X5 d'ACTION-0028
AGENT: CLAUDE
RESULT: DONE
BRANCH: build/v0.2-a3-multibrain-foundation
FINAL_HEAD: 151d48a28527e38e99fad97780734c3e35246289 (+ le commit rapport)
TASK_STATE: IMPLEMENTED — VERIFIED NON attribué; X5 corrigée mais OPEN
SESSION: début de session normal. Git conforme au départ : branche attendue,
HEAD = f8f78a8 = upstream, arbre propre. Aucun travail en suspens.

SUMMARY:
- CONTRÔLE INDÉPENDANT ENREGISTRÉ : ACTION-0028 = CHANGES_REQUIRED. Le fond de
  K1 à K12 est ACCEPTÉ — gel 51bb687 avant le code 4cb1cf4, isolation
  structurelle par brain_id, K6 Alpha/Gamma, K10 vraie frappe, K9/K12 vrai
  redémarrage. UNE seule réserve bloque VERIFIED : X5.

- X5 : les outils du runtime courant pouvaient ÉCRASER les artefacts canoniques
  de tâches déjà VERIFIED. runMeasurement() parcourait les cerveaux mais
  écrivait encore TASK-0016-H9-webview2.json avec task=TASK-0016;
  relationScenario.ts était adapté à brain-alpha mais écrivait encore
  TASK-0017-J12-webview2.json; et write_run_artifact écrit par REMPLACEMENT.
  Le risque n'était pas théorique : c'est précisément pour cela que TASK-0018
  avait déclaré J12 NON REJOUÉ.

- RÈGLE INSTAURÉE, TENUE À LA PORTE : une exécution d'une tâche ultérieure ne
  remplace jamais la preuve canonique d'une tâche antérieure VERIFIED.
  write_run_artifact REFUSE un nom de PROTECTED_RUN_ARTIFACTS avant tout accès
  au disque. Ce n'est pas une convention d'appel : c'est un refus.

- NOMS : src/map/runArtifacts.ts porte une seule orthographe de chaque nom, et
  les sept sites d'écriture du runtime l'importent. Les scénarios migrants
  écrivent désormais
  TASK-0018-H9-multibrain-regression-webview2.json et
  TASK-0018-J12-relations-regression-webview2.json (plus leurs -abandon),
  chacun déclarant task, sourceCriterion, nature, doesNotReplace et
  replacesCanonicalEvidence=false.

- AUCUNE CAMPAGNE H9 N'A ÉTÉ EXÉCUTÉE. TASK-0018 n'a aucun critère de
  performance; aucun seuil n'est posé, R8 reste entière.

- J12 DE RÉGRESSION REJOUÉ UNE FOIS DANS LE VRAI WEBVIEW2 (151.0.4129.107), sur
  brain-alpha, VRAIE FRAPPE WINDOWS : activationIsTrusted=true et
  keydownIsTrusted=true sur la traversée ET sur l'approbation,
  programmaticClickCalls=0, programmaticClickDispatches=0, panneau relations
  stabilisé à 4 entrées, traversée réelle map-node-6 -> map-node-2 confirmée
  par l'index, S-005 approuvée explicitement (sortantes 3 -> 4,
  enteredCountsOnlyAfterApproval=true, createdProvenance=APPROVED), X3 respecté
  (5/5 rejets dont relation_rejected_suggestion_is_not_a_relation, aucune
  suggestion parmi les établies), comptes cohérents (countsAgree=true sur 12
  nœuds, replayStable=true, 0 extrémité non résolue, 0 inverse inventé).
  Préparation déterministe : le magasin de relations de brain-alpha — écrit par
  FileTopo, reconstructible, sous .filetopo-sandbox/ — a été remis à neuf pour
  que S-005 soit en attente. AUCUNE PREUVE HISTORIQUE N'A ÉTÉ TOUCHÉE.

- GARDE DE RÉGRESSION : 9 tests neufs, ÉPROUVÉS PAR MUTATION. En réintroduisant
  name: "TASK-0017-J12-webview2.json", deux tests échouent en nommant le
  fichier fautif; restauré ensuite. Aucune architecture générale de gestion des
  preuves n'a été construite.

- PREUVES GELÉES INCHANGÉES, VÉRIFIÉ PAR GIT ET PAR EMPREINTE :
  TASK-0016-H9-webview2.json  sha256 4bb12d9d754ac8bb0ab40c413cdd93e4fe3d50ec51753811e5c17dcbb364e9c8
  TASK-0017-J12-webview2.json sha256 95fbab51aaf0607d020203c4a78829c7bd009fd5ddeac89b54deba6a34cd3340
  git diff vide sur les quatre artefacts protégés.

VALIDATIONS:
- Tests Rust : 106/106 (104 -> 106).
- Tests TypeScript : 104/104 (97 -> 104).
- pnpm check : PASS. pnpm build : PASS.
- Build Tauri debug --no-bundle : PASS, 12,12 s.
- Tests-gardes X2 : PASS. Tests X3 / X4 : PASS, inchangés.
- Nouveau test X5 : PASS, et prouvé utile par mutation.
- J12 de régression dans WebView2 réel : PASS.
- Aucune nouvelle dépendance : package.json, pnpm-lock.yaml, Cargo.toml
  inchangés.

IMPORTANT_FILES:
- src/map/runArtifacts.ts (nouveau), src/map/runArtifacts.test.ts (nouveau)
- src/map/MapApp.tsx, relationScenario.ts, brainScenario.ts
- src-tauri/src/map/commands.rs (PROTECTED_RUN_ARTIFACTS + 2 tests)
- docs/performance/runs/TASK-0018-J12-relations-regression-webview2.json
- docs/reviews/ACTION-0028-independent-control.md (nouveau)
- docs/tasks/TASK-0018-multibrain-foundation.md (§8)
- docs/ai/{CURRENT_STATE,NEXT_ACTION,HANDOFF,VALIDATION,CHANGELOG_AI}.md

LIMITS_OR_BLOCKERS:
- X5 EST CORRIGÉE MAIS RESTE OPEN. Sa clôture appartient au re-contrôle
  indépendant. TASK-0018 reste IMPLEMENTED; VERIFIED n'est pas attribué.
- K12 multi-cerveaux N'A PAS été rejoué : aucun code produit de bascule, de
  catalogue ni de session n'a été modifié. Le seul code produit touché est la
  porte d'écriture d'artefacts, en build de DÉVELOPPEMENT uniquement, exercée
  de bout en bout par le J12 de régression.
- Aucune mesure de performance, aucun seuil. R8 entière.
- La persistance de la vue reste P-19. La révocation de P-04 n'est toujours pas
  implémentée; P-04 demeure PARTIELLE. P-21 non satisfaite.
- B0 S'EST REPRODUIT UNE CINQUIÈME FOIS, sur un `cargo test`. RIEN n'a été
  supprimé ni renommé dans src-tauri/target/; CARGO_INCREMENTAL=0 suffit à
  contourner — DEC-0013 E.
- Observation non corrigée, hors périmètre : src/map/brainScenario.ts contient
  un octet NUL brut comme sentinelle de repli dans une chaîne (`?? "<NUL>"`).
  Cela compile et passe les tests, mais rend le fichier « binaire » pour grep.
  NON TOUCHÉ — ce n'est pas la réserve X5.
- Une seule machine, un seul runtime WebView2.

ACTIONS_DISTANTES:
- Push sur build/v0.2-a3-multibrain-foundation, branche de travail déjà
  publiée. Aucune fusion, PR, release, étiquette, force push, réécriture
  d'historique. Aucune opération destructive hors du bac à sable applicatif
  .filetopo-sandbox/, où seul le dossier relations/ de brain-alpha — écrit par
  FileTopo et reconstructible — a été remis à neuf avant le rejeu.

PUSHED: yes

NEXT_ORCHESTRATOR_DECISION:
- RE-CONTRÔLE INDÉPENDANT DE TASK-0018, SUR X5 UNIQUEMENT, par une instance
  DISTINCTE de l'exécuteur, SUR PREUVES. À trancher :
  * les deux artefacts gelés sont-ils bit-for-bit intacts, vérifié par Git ?
  * le refus est-il STRUCTUREL — write_run_artifact refuse-t-il avant tout
    accès au disque — ou seulement conventionnel ?
  * les artefacts de régression DISENT-ILS qu'ils ne remplacent pas la campagne
    gelée dont ils viennent ?
  * le J12 de régression prouve-t-il une vraie frappe, une vraie traversée, une
    approbation explicite, X3 et des comptes cohérents ?
  * la garde empêche-t-elle réellement le retour de X5 ?
- Puis, seulement ensuite, la suite technique : TASK-0019 vue composée,
  TASK-0020 relations inter-cerveaux, révocation + fin de P-04, recherche P-08,
  persistance P-19.
