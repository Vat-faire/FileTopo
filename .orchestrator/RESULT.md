TASK_ID: TASK-0018 — fondation multi-cerveaux, catalogue, isolation, bascule
AGENT: CLAUDE
RESULT: DONE
BRANCH: build/v0.2-a3-multibrain-foundation
FINAL_HEAD: (voir ci-dessous, renseigné au commit de clôture)
TASK_STATE: IMPLEMENTED — VERIFIED NON attribué, contrôle indépendant attendu
SESSION: reprise après une session interrompue; le travail non commité trouvé
au démarrage a été repris, pas refait. Rien n'a été effacé.

SUMMARY:
- La session a été REPRISE. Git disait : gel `51bb687` commité et poussé,
  aucun code commité, et un arbre portant `brains.rs` non suivi plus trois
  fichiers modifiés qui NE COMPILAIENT PAS — six erreurs, toutes des sites
  d'appel non migrés. Le point d'arrêt a été situé là, et le travail a repris
  là. Aucune étape déjà faite n'a été refaite.

- FileTopo a des cerveaux, et L'ISOLATION EST UNE AFFAIRE DE STOCKAGE.
  Le `brain_id` est le nom d'un RÉPERTOIRE, pas une colonne :
  `brains/catalog.sqlite`, `brains/<brain_id>/map/index.sqlite`,
  `brains/<brain_id>/relations/relations.sqlite`. `brain-alpha` et
  `brain-gamma` lisent la MÊME fixture `quasi-empty` et leurs états ne peuvent
  pas se rencontrer parce qu'ils NE SONT PAS DANS LE MÊME FICHIER — et non
  parce qu'une clause WHERE les sépare.
  Trois renforts structurels, en plus du répertoire :
  * l'index NOMME le cerveau pour lequel il a été construit — schéma version 2,
    `map_meta.brain_id`. `open_store` REFUSE un index construit pour un autre
    cerveau, et un index de version 1, qui ne nomme aucun cerveau, n'est celui
    de personne. Le test qui le prouve COPIE RÉELLEMENT l'index d'Alpha à la
    place de celui de Gamma;
  * un `node_id` NE VOYAGE JAMAIS SEUL : les commandes de nœud prennent un
    `BrainNodeRef`. Après une bascule l'interface tient encore la sélection du
    cerveau précédent, et `12` est une ligne valide dans les deux;
  * les clés d'extrémité sont bâties sur le cerveau, donc deux cerveaux sur une
    source produisent deux espaces de clés DISJOINTS.

- Le seed du catalogue CRÉE, il ne corrige jamais : un cerveau renommé reste
  renommé au démarrage suivant. C'est `K7`, et c'est un `INSERT ... ON CONFLICT
  DO NOTHING`, pas un upsert.

LES DOUZE CRITÈRES GELÉS SONT TENUS — K1 à K12.
Gel `51bb687` AVANT le premier code `4cb1cf4`. Aucun critère retouché après le
premier résultat.

PREUVE K12 — deux passes, deux processus, WebView2 151.0.4129.107:
- passe 1 (K12.1 à K12.9) : démarrage sur le cerveau actif; quatre bascules
  Alpha -> Bêta -> Gamma -> Alpha PAR FRAPPE RÉELLE, chacune avec
  activationIsTrusted=true, keydownIsTrusted=true, programmaticClickCalls=0,
  programmaticClickDispatches=0; comptes 12 / 157 / 12 / 12 lus par commande;
  index distincts `brains/brain-alpha/map/index.sqlite` et
  `brains/brain-gamma/map/index.sqlite`; noms et icônes à l'écran;
  session par cerveau restaurée À L'IDENTIQUE (alphaRestored=true,
  betaRestored=true, et les deux états différents); approbation de S-005 dans
  Alpha 4->5 approuvées et 4->3 en attente; GAMMA INCHANGÉ, sa propre S-005
  toujours en attente, magasin distinct; même `node_id`, deux clés d'extrémité.
- passe 2 (K12.10 à K12.12), APRÈS UNE FERMETURE ET UN REDÉMARRAGE RÉELS :
  Gamma toujours actif dans le catalogue ET dans l'interface, métadonnées
  modifiées conservées, le seed n'a rien recréé.

PREUVE K11 — lecture seule et isolation, dans l'hôte:
- empreintes identiques avant/après pour les trois cerveaux; Alpha et Gamma ont
  la MÊME empreinte de source `fnv1a64:bddfe1a1…` — c'est bien la même fixture —
  et DEUX index dans deux fichiers différents;
- 0 artefact FileTopo dans les racines analysées; H1/H2/H3/H5/H7/H10/H11 tenus.

TROUVÉ ET PUBLIÉ — quatre défauts, deux du produit, deux de l'outillage:
1. Le menu du sélecteur se refermait sur un `blur` à `relatedTarget` nul. Une
   DÉSACTIVATION DE FENÊTRE produit exactement ce `blur`, donc la frappe réelle
   arrivait sur un bouton démonté à l'instant où l'hôte ramenait la fenêtre au
   premier plan. K10 avait raison, le contrôle avait tort. Deux tests de
   régression.
2. La vue était RÉ-AJUSTÉE quand le viewport se stabilisait une image plus
   tard, ce qui effaçait la vue qu'un cerveau venait de retrouver. K12 a publié
   `alphaRestored=false` SUR UN PRODUIT DONT LA SÉLECTION REVENAIT PARFAITEMENT
   — un faux négatif. Règle désormais écrite une seule fois, `shouldFitOnOpen`,
   et testée.
3. Un binaire RELEASE NE PEUT PAS ÉCRIRE D'ARTEFACT — `map_write_run_artifact`
   n'existe qu'en debug. La première tentative de K12 a donc échoué SANS RIEN
   PUBLIER, pas même son abandon. Le scénario construit maintenant son évidence
   dans un objet fourni par l'appelant : un échec publie ce qu'il savait. C'est
   ainsi que le défaut n°1 a été diagnostiqué, sur `focus atteint=false`.
4. `Write-Output` dans une fonction PowerShell entre dans sa VALEUR DE RETOUR :
   le lanceur a ANNONCÉ UN SUCCÈS alors que la passe 1 avait abandonné.

VALIDATIONS:
- Tests Rust : 104/104 (84 -> 104).
- Tests TypeScript : 97/97 (82 -> 97).
- pnpm check : PASS. pnpm build : PASS.
- Build Tauri debug --no-bundle : PASS. Build Tauri release --no-bundle : PASS,
  33,17 s.
- Tests-gardes X2 : PASS, plus un test POSITIF exigeant que la surface cerveaux
  existe et reste `map_`.
- Tests X3 / X4 : PASS, inchangés.
- Aucune nouvelle dépendance : package.json, pnpm-lock.yaml, Cargo.toml
  inchangés.

IMPORTANT_FILES:
- src-tauri/src/map/brains.rs (nouveau), sandbox.rs, store.rs, commands.rs,
  relation_commands.rs, relations.rs, mod.rs, lib.rs
- src/map/{BrainSelector.tsx,brainSession.ts,brainScenario.ts,realInput.ts,
  brains.test.tsx} (nouveaux), MapApp.tsx, types.ts, map.css
- scripts/k12-run-real-host.ps1 (nouveau), scripts/j12-send-real-key.ps1
- docs/performance/runs/TASK-0018-{K12-webview2-pass1,K12-webview2-pass2,
  K11-readonly-and-isolation}.json
- docs/tasks/TASK-0018-multibrain-foundation.md (§7)
- docs/ai/{CURRENT_STATE,NEXT_ACTION,HANDOFF,VALIDATION,CHANGELOG_AI}.md

LIMITS_OR_BLOCKERS:
- J12 N'A PAS ÉTÉ REJOUÉ DANS L'HÔTE. Le scénario a été migré vers
  `brain-alpha` — même fixture gelée, même mécanisme de frappe réelle, extrait
  dans realInput.ts sans changement — il compile et typecheck, mais IL N'A PAS
  ÉTÉ EXÉCUTÉ : le rejouer aurait ÉCRASÉ TASK-0017-J12-webview2.json, preuve
  publiée d'une tâche VERIFIED. DÉCLARÉ NON TESTÉ.
- Les campagnes de vérification et de mesure marchent DÉSORMAIS PAR CERVEAU, le
  runtime n'exposant plus aucune commande indexée par fixture. Elles couvrent
  `quasi-empty` (deux fois) et `deep`, ET NON `wide` ni `mixed`. Les artefacts
  publiés de TASK-0016 sont INCHANGÉS et restent le relevé pour ces deux
  fixtures.
- Aucune mesure de performance, aucun seuil. R8 entière.
- La persistance de la vue reste P-19 : l'état de session NE SURVIT PAS au
  redémarrage, et rien ne le prétend. Seuls le cerveau actif et les
  métadonnées survivent.
- La révocation de P-04 n'est toujours pas implémentée. P-04 demeure PARTIELLE.
- ek1 n'implémente toujours pas I-E; rien ne prétend qu'il soit globalement
  unique entre cerveaux — l'isolation vient du stockage.
- P-21 non satisfaite : français seulement, aucun audit WCAG, aucun lecteur
  d'écran réel. K10 prouve une VRAIE FRAPPE, ce qui n'est pas un audit
  d'accessibilité.
- B0 S'EST REPRODUIT UNE QUATRIÈME FOIS, sur un `pnpm tauri build --debug`.
  RIEN n'a été supprimé ni renommé dans src-tauri/target/; CARGO_INCREMENTAL=0
  suffit à contourner — DEC-0013 E.
- K12 exige DEUX processus et un binaire DEBUG. Sans le guetteur de frappes,
  K10 échoue — et c'est voulu.
- Les anciens `.filetopo-sandbox/{maps,relations}/` subsistent, INUTILISÉS.
  Aucun accesseur n'y mène; RIEN N'A ÉTÉ SUPPRIMÉ.
- Une seule machine, un seul runtime WebView2.
- $debut-session en session Codex reste non testé.

ACTIONS_DISTANTES:
- Push sur build/v0.2-a3-multibrain-foundation, branche de travail déjà
  publiée. Aucune fusion, PR, release, étiquette, force push, réécriture
  d'historique. Aucune opération destructive hors du bac à sable applicatif
  .filetopo-sandbox/, où seul le dossier `brains/` — écrit par FileTopo et
  reconstructible — a été remis à neuf entre deux exécutions de K12.

PUSHED: yes

NEXT_ORCHESTRATOR_DECISION:
- CONTRÔLE INDÉPENDANT de TASK-0018, par une instance DISTINCTE de l'exécuteur,
  SUR PREUVES. À trancher :
  * le gel `51bb687` précède-t-il bien le code `4cb1cf4` ?
  * K3 : l'isolation est-elle STRUCTURELLE ? À lire dans la DISPOSITION DU
    STOCKAGE et dans le SCHÉMA D'INDEX version 2, pas dans le TypeScript.
  * K5 : un `node_id` peut-il fuir ? Les commandes prennent un BrainNodeRef et
    refusent une référence frappée ailleurs.
  * K6 : Alpha et Gamma, sur la MÊME fixture, sont-ils indépendants ?
  * K10/K12 : la frappe est-elle réelle ? isTrusted à true et compteurs à 0 sur
    les quatre bascules.
  * K9 : le redémarrage est-il réel ? Deux passes, deux processus, deux
    artefacts.
  * que rien de gelé n'a bougé : aucun critère H, J ou K, aucune fixture,
    aucune règle, aucun artefact publié de TASK-0016 ou TASK-0017.
- Puis, seulement ensuite, choisir la tranche suivante. Candidates : TASK-0019
  vue composée, TASK-0020 relations inter-cerveaux, révocation + fin de P-04,
  recherche P-08, persistance P-19.
