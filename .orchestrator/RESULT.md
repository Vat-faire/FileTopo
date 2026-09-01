TASK_ID: TASK-0017 — correction ciblée du contrôle indépendant, réserves X3 et X4
AGENT: CLAUDE
RESULT: DONE
BRANCH: build/v0.2-a2-relations
FINAL_HEAD: <renseigné au commit de clôture>
TASK_STATE: IMPLEMENTED — VERIFIED NON attribué, re-contrôle indépendant attendu
CONTROLE: ACTION-0027, verdict CHANGES_REQUIRED. X3 et X4 CORRIGÉES, NON CLOSES.

SUMMARY:
- X3 — la création d'une relation APPROVED n'était pas verrouillée.
  Le défaut : insert_established() acceptait provenance=APPROVED dès lors que
  la suggestion nommée était déjà approved, SANS vérifier que source, cible et
  type correspondaient à cette suggestion. Une suggestion déjà approuvée
  pouvait donc justifier une relation qui n'était pas elle-même. La garde
  contrôlait qu'une clé EXISTE, pas ce qu'elle DÉSIGNE — même famille que X2 :
  juger ce que le code appelle plutôt que ce que le stockage permet.
  Corrigé sur trois plans, dont deux structurels :
  * insert_established refuse APPROVED SANS CONDITION; approve() est la seule
    voie applicative;
  * schéma version 2 : suggestion_key UNIQUE, clé étrangère vers
    relation_suggestions, et TROIS déclencheurs SQLite exigeant que la ligne
    approuvée SOIT EXACTEMENT sa suggestion — à l'insertion, à la mise à jour,
    et en empêchant la suggestion de dériver ensuite;
  * approve() écrit un INSERT simple : OR IGNORE transformait un refus en
    non-événement silencieux, ce que J4 interdit.
  Migration explicite d'un magasin version 1 : la ligne non conforme n'est pas
  reprise et sa clé est écrite dans relation_meta sous migration_v2_discarded
  — jamais effacée en silence. Données synthétiques uniquement.
  NEUF tests ajoutés, dont CINQ écrivent directement en SQL pour prouver les
  contraintes AU NIVEAU DU STOCKAGE, pas au niveau de l'API qui refuse déjà.

- X4 — J12 n'était pas prouvé intégralement.
  Le défaut : l'artefact déclarait LUI-MÊME qu'aucune frappe Enter de confiance
  n'avait été jouée. Une déclaration d'honnêteté n'est pas une preuve.
  Corrigé : le scénario n'active plus rien. Il pose le focus, écrit un marqueur
  sur la sortie de l'hôte, et attend une VRAIE frappe Windows envoyée par
  scripts/j12-send-real-key.ps1 via WScript.Shell après AppActivate.
  Trois instruments simultanés : isTrusted de l'activation; les compteurs
  d'appels à HTMLElement.click et de dispatchEvent de type click, qui doivent
  rester à ZÉRO sur toute la fenêtre; et le changement observable.
  Si la frappe n'arrive pas, le scénario ÉCHOUE — jamais de repli sur un clic
  synthétique. L'approbation d'une suggestion passe par le même chemin.
  Aucune nouvelle dépendance : WScript.Shell fait partie de Windows.

PREUVE X3 — lue dans le fichier SQLite après exécution:
- user_version = 2
- suggestion_key : index UNIQUE (sqlite_autoindex_relations_approved_2)
- clé étrangère relations_approved.suggestion_key -> relation_suggestions
- déclencheurs présents : approved_must_match_its_suggestion_on_insert,
  approved_must_match_its_suggestion_on_update,
  suggestion_cannot_drift_from_its_relation
- lignes approuvées ne correspondant pas à leur suggestion : 0

PREUVE X4 — TASK-0017-J12-webview2.json, WebView2 151.0.4129.107, binaire final:
- Traversée : méthode WScript.Shell SendKeys après AppActivate; touche {ENTER};
  focus sur BUTTON relation__link « →note-1.txt ◆ déterministe »;
  keydownIsTrusted = true (Enter); activationIsTrusted = TRUE;
  programmaticClickCalls = 0; programmaticClickDispatches = 0;
  endpoint avant map-node-6 -> après map-node-9;
  endpoint attendu LU SUR L'ENTRÉE ACTIVÉE = map-node-9, confirmé par l'index;
  selectionFollowedTheRelation = true; changeCameFromTheKeystroke = true.
- Approbation de S-005 : même méthode, activationIsTrusted = TRUE,
  0 clic programmatique, sortantes 3 -> 4, provenance APPROVED, aucune règle,
  enteredCountsOnlyAfterApproval = true.

TROUVÉ ET PUBLIÉ — un cinquième défaut de protocole, dans MA PREUVE:
- L'extrémité attendue était calculée depuis outgoing[0] DE L'INDEX, alors que
  le panneau groupe par direction puis par type. La preuve a publié
  selectionFollowedTheRelation=false POUR UN PRODUIT QUI AVAIT RAISON — un faux
  négatif. Corrigé à la source : chaque entrée porte son extrémité en attributs
  data-, la preuve la lit sur l'entrée activée, et l'index confirme que c'est
  bien une relation. Test unitaire ajouté. Publié comme les quatre autres.

VALIDATIONS:
- Tests Rust : 84/84 (75 -> 84, +9 pour X3), dont les deux tests-gardes X2.
- Tests TypeScript : 82/82 (81 -> 82, +1 pour la correspondance des entrées).
- pnpm check : PASS. pnpm build : PASS.
- Build Tauri release sans empaquetage : PASS, 47,8 s.
- J1 à J5 dans l'hôte : 5/5 rejets, rejeu stable, 12/12 nœuds conformes,
  0 inverse inventé, 0 suggestion dans les établies.
- J10 : après reconstruction des 4 index — 8 déterministes, 5 approuvées,
  3 suggestions en attente, 0 correspondance rompue, 0 extrémité non résolue.
- J11 : verdicts H1 à H7 identiques au relevé publié, 0 artefact FileTopo dans
  la racine analysée.
- J12 : COMPLET dans WebView2 sur le binaire final corrigé.
- Aucune nouvelle dépendance : package.json, pnpm-lock.yaml, Cargo.toml
  inchangés.

IMPORTANT_FILES:
- docs/reviews/ACTION-0027-independent-control.md
- docs/tasks/TASK-0017-crosscutting-relations.md (§9 : X3 et X4)
- src-tauri/src/map/relations.rs (schéma v2, déclencheurs, migration, tests)
- src/map/relationScenario.ts, src/map/RelationsPanel.tsx
- scripts/j12-send-real-key.ps1
- docs/performance/runs/TASK-0017-{J12-webview2,J11-isolation}.json
- docs/ai/{CURRENT_STATE,NEXT_ACTION,HANDOFF,VALIDATION,CHANGELOG_AI}.md

LIMITS_OR_BLOCKERS:
- X3 et X4 sont CORRIGÉES, PAS CLOSES. ACTION-0027 reste OPEN. Leur clôture
  appartient au re-contrôle indépendant.
- La révocation de P-04 n'a PAS été ajoutée, conformément au GO : elle était
  hors du périmètre gelé. P-04 demeure PARTIELLE.
- ek1 n'implémente toujours pas I-E.
- Aucune mesure de performance, aucun seuil. R8 entière.
- P-21 non satisfaite : français seulement, aucun audit WCAG complet, aucun
  lecteur d'écran réel. J12 prouve une VRAIE frappe clavier, ce qui n'est pas
  un audit d'accessibilité.
- J12 exige DEUX processus : l'application et scripts/j12-send-real-key.ps1.
  Sans le second, J12 échoue — et c'est voulu.
- B0 non corrigé, rien supprimé dans src-tauri/target. L'avertissement
  unused import: self de map/commands.rs est ANTÉRIEUR et hors périmètre.
- $debut-session en session Codex reste non testé.

ACTIONS_DISTANTES:
- Push sur build/v0.2-a2-relations, déjà publiée. Aucune fusion, PR, release,
  étiquette, force push, réécriture d'historique. Aucune opération destructive
  hors du bac à sable applicatif .filetopo-sandbox/, écrit par FileTopo.

COMMIT: <renseigné au commit de clôture> (clôture) / 8a259e9 (corrections X3 et X4)
PUSHED: <renseigné au push>

NEXT_ORCHESTRATOR_DECISION:
- RE-CONTRÔLE INDÉPENDANT de TASK-0017, par une instance DISTINCTE de
  l'exécuteur, SUR PREUVES. À trancher :
  * X3 : la garantie est-elle STRUCTURELLE ? À lire dans le schéma — UNIQUE,
    clé étrangère, trois déclencheurs — et non dans le Rust.
  * X4 : activationIsTrusted et keydownIsTrusted à true, compteurs de clics
    programmatiques à 0, et selectionFollowedTheRelation vrai CONTRE
    l'extrémité lue sur l'entrée activée.
  * Que rien de gelé n'a bougé : aucun critère J1-J12, aucune fixture, aucune
    règle.
- Puis, seulement ensuite, choisir la tranche suivante de l'étape A.
  Candidates : révocation + fin de P-04, recherche P-08 sur 100 000 nœuds,
  persistance P-19 (qui exige M-1 d'abord, DEC-0016 D), cerveaux multiples P-20.
