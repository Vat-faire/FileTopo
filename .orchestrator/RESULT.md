TASK_ID: TASK-0017 — relations transversales avec provenance (étape A, tranche 2)
AGENT: CLAUDE
RESULT: DONE
BRANCH: build/v0.2-a2-relations
FINAL_HEAD: <voir COMMIT ci-dessous>
TASK_STATE: IMPLEMENTED — jamais VERIFIED, l'exécuteur ne s'auto-vérifie pas

SUMMARY:
- Gel COMMITÉ AVANT TOUT CODE (51a8cac) : modèle normatif, deux types, clé
  d'endpoint ek1, lieu de stockage, deux règles déterministes versionnées,
  fixture synthétique (12 relations, 8 suggestions, 5 tentatives invalides,
  comptes attendus nœud par nœud) et critères J1 à J12. Premier code de
  production : a98676e. AUCUN critère retouché après le premier résultat.
- La provenance est STRUCTURELLE : relations_deterministic et
  relations_approved sont deux tables séparées (DEC-0009 R-C). Le schéma lu
  dans le SQLite ne contient NULLE PART de colonne `provenance`, et la table
  des approuvées n'a AUCUNE colonne de règle. Une relation établie sans
  provenance n'est pas seulement interdite : elle est NON REPRÉSENTABLE.
- Correction X1 implémentée : une suggestion est un objet et un état distincts,
  dans sa propre table, jamais dans un compte, transformable seulement par une
  approbation explicite qui bascule l'état et écrit la ligne dans une seule
  transaction.
- Aucun inverse n'est jamais déduit : aucune des deux règles n'est déclarée
  symétrique, et l'absence des huit inverses est vérifiée.
- 4 commandes nouvelles, toutes préfixées map_, donc SOUS la protection des
  tests-gardes X2, qui restent PASS. Aucune commande héritée de la 0.1
  réactivée.
- Interface : panneau groupé par direction puis par type, provenance en toutes
  lettres, règle et version consultables, chaque entrée étant un <button> qui
  sélectionne l'autre extrémité; suggestions dans leur propre section nommée;
  arêtes projetées sur les rectangles DÉJÀ PERSISTÉS, sans recalcul de
  calepinage; relation établie en trait plein à tête de flèche, suggestion en
  trait tireté SANS tête et à anneaux ouverts. Jamais la couleur seule.

CRITERES J1 A J12: 12 / 12 TENUS. Détail chiffré en §7 de la fiche.
- J1/J2/J3 : les 5 tentatives invalides rejetées avec EXACTEMENT le motif gelé,
  aucune n'ayant laissé de ligne établie.
- J5 : 12/12 nœuds conformes à l'attendu gelé, 0 inverse inventé.
- J10 : après reconstruction complète des 4 index, 5 relations approuvées et
  3 suggestions intactes, digest déterministe identique, 0 extrémité non
  résolue.
- J12 : scénario complet dans WebView2 151.0.4129.107.

VALIDATIONS:
- Tests Rust : 75/75, dont exposed_commands_stay_within_the_slice et
  no_exposed_command_can_open_a_folder_picker (gardes X2).
- Tests TypeScript : 81/81, dont 22 nouveaux sur J6 à J9.
- pnpm check (tsc --noEmit) : PASS. pnpm build : PASS.
- Build Tauri release sans empaquetage : PASS, 1 min 21 s.
- J12 dans le vrai WebView2 : PASS — docs/performance/runs/TASK-0017-J12-webview2.json
- J11 isolation : PASS — docs/performance/runs/TASK-0017-J11-isolation.json
  Rejeu de H1 à H7 de TASK-0016 avec les relations en place : verdicts
  IDENTIQUES au relevé publié sur les 4 fixtures.
- Aucune nouvelle dépendance : package.json, pnpm-lock.yaml et Cargo.toml
  inchangés.

TROUVÉ ET PUBLIÉ:
- Une LACUNE DU MODÈLE : le type d'une relation était vérifié non vide mais
  jamais confronté aux deux types déclarés, ce que le gel exige. Corrigé
  (relation_rejected_unknown_type), couvert par un test. Trouvée en supprimant
  du code mort signalé par le compilateur.
- QUATRE défauts de protocole, publiés AVEC ce qu'ils auraient produit :
  panneau lu trop tôt (aurait publié les chiffres de la sélection précédente),
  attente bornée en images et non en temps (une seconde ici, autre chose
  ailleurs), atténuation lue sur le groupe et non sur le rectangle (aurait fait
  croire à une absence d'atténuation), et DEUX INSTANCES de l'application en
  parallèle sur le même magasin. Les artefacts contradictoires ont été
  DÉTRUITS; la campagne publiée provient d'une EXÉCUTION UNIQUE sur le BINAIRE
  FINAL, relancée après le dernier changement de code.

IMPORTANT_FILES:
- docs/tasks/TASK-0017-crosscutting-relations.md (gel en §4, résultat en §7)
- src-tauri/src/map/relations.rs, src-tauri/src/map/relation_commands.rs
- src-tauri/src/map/{mod,sandbox,commands}.rs, src-tauri/src/lib.rs
- src/map/{relations.ts,RelationsPanel.tsx,relationScenario.ts,relations.test.tsx}
- src/map/{MapApp.tsx,MapView.tsx,types.ts,map.css,mapView.test.tsx}
- docs/performance/runs/TASK-0017-{J12-webview2,J11-isolation}.json
- docs/ai/{CURRENT_STATE,NEXT_ACTION,HANDOFF,VALIDATION,CHANGELOG_AI}.md

GOUVERNANCE:
- /debut-session RÉELLEMENT EXERCÉE avec succès dans Claude Code 2.1.252, dans
  une NOUVELLE session ouverte après l'installation des skills : skill découvert
  et résolu, protocole partagé .orchestrator/protocols/debut-session.md lu et
  exécuté, Git vérifié AVANT toute lecture, lecture minimale respectée, aucun
  travail interrompu. La réserve « non testé » du 2026-08-31 est LEVÉE pour
  Claude Code. Elle RESTE ENTIÈRE pour Codex : aucun $debut-session n'a été
  joué en session Codex.

LIMITS_OR_BLOCKERS:
- P-04 reste PARTIELLE : la RÉVOCATION d'une relation approuvée n'est pas
  implémentée, alors que la parité §5.2 l'exige. Aucun critère gelé ne la
  nomme, le GO ne la nomme pas. DÉCLARÉE MANQUANTE, reportée.
- ek1 n'implémente PAS I-E. VolumeSerialNumber + FileId, déplacements et
  renommages réels restent entiers.
- Aucune heuristique réelle de suggestion. Les 8 suggestions sont écrites
  d'avance dans la fiche.
- Les relations ne sont ouvertes que pour la fixture gelée quasi-empty. Toute
  autre est refusée EN TOUTES LETTRES (relations_out_of_scope_for_fixture) :
  la règle homonymes est quadratique et produirait des centaines de milliers de
  paires sur wide. Une borne MAX_DERIVED_RELATIONS = 5 000 refuse au lieu de
  tronquer — garde AJOUTÉE, pas un critère gelé. C'est une portée, pas une
  troncature.
- AUCUNE mesure de performance n'a été prise, AUCUN seuil inventé. R8 reste
  entière.
- L'activation au clavier d'une entrée de panneau n'a PAS été jouée par une
  frappe de confiance : un script ne peut pas en forger une. Ce qui est prouvé
  est l'atteignabilité par le focus et l'activation par le comportement propre
  du bouton, celui qu'Enter déclenche. L'artefact le dit explicitement. Les
  flèches de la carte, elles, sont exercées pour de vrai.
- P-21 non satisfaite : français seulement, aucun audit WCAG complet, aucun
  lecteur d'écran réel.
- Douze exigences de parité restent entières, dont P-08, P-09, P-19, P-20.
- B0 non corrigé, rien supprimé dans src-tauri/target/. Un avertissement de
  compilation ANTÉRIEUR subsiste (unused import: self dans map/commands.rs) :
  hors périmètre, non touché.
- Aucune fusion, PR, release, étiquette, force push, réécriture d'historique.

ACTIONS_DISTANTES:
- Branche build/v0.2-a2-relations CRÉÉE et POUSSÉE sur origin, nommée par le GO.
  Aucune autre écriture distante. Aucune opération destructive hors du bac à
  sable applicatif .filetopo-sandbox/, que FileTopo a lui-même écrit.

COMMIT: <renseigné au commit de clôture>
PUSHED: <renseigné au push>

NEXT_ORCHESTRATOR_DECISION:
- CONTRÔLE INDÉPENDANT de TASK-0017, par une instance DISTINCTE de l'exécuteur,
  SUR PREUVES. Points à ne pas manquer : que le gel précède le code
  (51a8cac avant a98676e); que J1 et J2 soient STRUCTURELS et pas seulement
  vérifiés en API; que l'ajustement approved_since_seed du contrôle J5 soit
  LISTÉ et non silencieux; et les quatre défauts de protocole déclarés en §7.5.
- Puis choisir la tranche suivante de l'étape A. Candidates restantes :
  révocation + fin de P-04, recherche P-08 sur 100 000 nœuds, persistance P-19
  (qui exige de résoudre M-1 d'abord, DEC-0016 D), cerveaux multiples P-20.
