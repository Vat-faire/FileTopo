TASK_ID: TASK-0020 — relations inter-cerveaux explicites
AGENT: CLAUDE
RESULT: DONE
BRANCH: build/v0.2-a5-interbrain-relations
BASE_HEAD: 8d1e27151f53d082551e05b00816100cb790542b
GEL_COMMIT: 7746fd4e9c2fad42b23bb9d88a75550d375d3279
FINAL_HEAD: 4a49f8fae37685e6a500715fc85d0872224a59f2
TASK_STATE: IMPLEMENTED — VERIFIED NON attribué
SESSION: début de session normal. Git vérifié d'abord : racine, branche
`build/v0.2-a4-composed-view`, `HEAD` `8d1e271`, arbre propre, aligné sur
`origin`, aucune tâche `IN_PROGRESS`. Aucun écart.

REPRISE: la session d'exécution s'est interrompue APRÈS le commit `eed36e5` et
AVANT sa clôture. Une reprise `/reprise-session` a établi l'état par Git : arbre
propre, `HEAD` `eed36e5`, `origin` resté à `7746fd4`, `main` intacte `91bbe90f`.
Trois choses étaient annoncées mais non enregistrées, et seulement celles-là :
la fiche `TASK-0020` portait encore `APPROVED` alors que `CURRENT_STATE.md`,
`NEXT_ACTION.md` et ce rapport la disaient `IMPLEMENTED`; l'entête de
`HANDOFF.md` désignait encore `TASK-0019` et la branche `a4`; et les deux
commits n'étaient pas poussés. Rien n'a été refait, rien n'effacé, aucune
récupération destructive. §4 de la fiche, GELÉE, est restée intacte — vérifié
par `git diff 7746fd4 HEAD`, qui ne montre que des ajouts après la ligne 672.

SUMMARY:
- LE VERDICT EST ENREGISTRÉ, PAS RENDU PAR L'EXÉCUTEUR. `ACTION-0031` : `X6`
  `CLOSED`, `ACTION-0030` `CLOSED`, `TASK-0019` `VERIFIED`, `HEAD` contrôlé
  `8d1e271`.

- X5 S'ÉTEND À QUATORZE NOMS. Les six preuves de `TASK-0019` deviennent
  canoniques — dont quatre qui sont elles-mêmes des rejeux de régression :
  être un rejeu ne rend pas une preuve moins canonique une fois la tâche
  contrôlée. La protection tient à TROIS endroits parce qu'il y a trois façons
  de détruire une preuve : la porte Rust refuse AVANT tout accès disque;
  `runArtifacts.ts` épelle chaque nom une seule fois; et les scripts
  PowerShell, qui ne l'écrivent pas mais la SUPPRIMENT avant un rejeu,
  dot-sourcent désormais UN seul fichier au lieu d'en recopier la liste. Aucun
  runtime `TASK-0020` n'écrit sous un nom `TASK-0019` : les noms d'artefact ET
  le champ `task:` de la charge utile ont changé ensemble.

- LE GEL PRÉCÈDE LE CODE. `7746fd4` (gel `M1`–`M12`) puis `d1adcf2` (code).
  Aucun critère retouché après le premier résultat. Les SEIZE chemins de
  `XBR-1` ont été confrontés au planificateur de fixtures AVANT le gel : tous
  existent, aucune substitution n'a été nécessaire ni faite, et un test le
  tient désormais contre le planificateur lui-même.

- LE LIEN N'APPARTIENT À AUCUN DES DEUX CERVEAUX.
  `brains/interbrain/relations.sqlite` : à côté des cerveaux et dans aucun
  d'eux, hors de tout `map/` qu'un rebuild remplace, distinct du catalogue.
  Mettre une relation `A → B` dans le magasin d'Alpha aurait fait d'une
  reconstruction d'Alpha la destruction d'un lien dont Gamma est la moitié.

- L'INVALIDE EST IRREPRÉSENTABLE, PAS SEULEMENT INTERDIT. Aucune colonne
  `provenance` — la table où vit une ligne EST sa provenance.
  `CHECK(source_brain_id <> target_brain_id)`, attaqué dans un test EN
  CONTOURNANT Rust. `X3` transposée sur les SIX champs par déclencheurs : le
  test essaie chaque champ séparément PUIS vérifie que la ligne qui correspond
  est acceptée — sans quoi il passerait pour la mauvaise raison.

- M1 À M12 TENUS. `M12` aux vingt-huit étapes, deux passes, WebView2
  `152.0.4191.53`, variant NEUF, fermeture et redémarrage réels. AUCUN
  INDICATEUR FAUX dans tout l'arbre de preuve, aux deux passes. Vraies frappes
  aux étapes 3, 7, 11, 16 et 18 : `isTrusted=true`, 0 clic programmatique, 0
  `dispatchEvent(click)`. Digest déterministe `fnv1a64:3020af7489aab581`
  IDENTIQUE avant et après la reconstruction des trois index; 0 extrémité non
  résolue; `APPROVED` et suggestions persistantes.

- LA MESURE A TROUVÉ DEUX DÉFAUTS, CORRIGÉS À LA SOURCE.
  1. Le nouveau panneau et les nouvelles arêtes partageaient des classes CSS
     avec les anciennes. `J12` compte `.relations__direction .relation__link`
     et `L12` compte `.map-edge` sur TOUT le document : les deux se sont mis à
     compter des éléments qui ne les regardaient pas et ont publié des écarts
     ALORS QUE RIEN N'ÉTAIT CASSÉ. Même faute qu'un `id` DOM pour deux
     cerveaux, sous un autre habit. Espaces de noms disjoints dans le balisage,
     style partagé par la feuille de style, deux tests de garde. Après
     correction, `J12` et `L12` retrouvent EXACTEMENT leurs valeurs d'origine.
  2. Un contrôle DOM capturé avant un `await` peut être remplacé par un
     re-rendu, et une frappe envoyée à un nœud détaché part dans le vide.
     Re-interrogé à l'instant où il est pressé.

- LES QUATORZE PREUVES PROTÉGÉES SONT INCHANGÉES, vérifié par `git`. Racines
  analysées intactes : 12 et 157 entrées, aucun `.sqlite`, `.json` ni fichier
  `filetopo`. `main` intacte, `91bbe90f`.

FILES:
- src-tauri/src/map/cross_relations.rs, cross_commands.rs (nouveaux)
- src-tauri/src/map/sandbox.rs, mod.rs, commands.rs, src-tauri/src/lib.rs
- src/map/crossRelations.ts, CrossRelationsPanel.tsx, crossScenario.ts,
  crossRelations.test.tsx (nouveaux)
- src/map/MapView.tsx, MapApp.tsx, RelationsPanel.tsx, types.ts, map.css,
  runArtifacts.ts, runArtifacts.test.ts, composedScenario.ts,
  relationScenario.ts, brainScenario.ts, mapView.test.tsx, relations.test.tsx
- scripts/protected-run-artifacts.ps1, m12-run-real-host.ps1,
  j12-run-real-host.ps1 (nouveaux); l12- et k12-run-real-host.ps1
- docs/decisions/DEC-0018, docs/reviews/ACTION-0031, docs/tasks/TASK-0020,
  docs/reviews/ACTION-0030 (clôture), docs/tasks/TASK-0019 (VERIFIED enregistré)
- docs/product/FEATURE_MATRIX.md, REQUIREMENTS_BASELINE.md
- docs/ai/CURRENT_STATE.md, NEXT_ACTION.md, HANDOFF.md, VALIDATION.md,
  CHANGELOG_AI.md
- docs/performance/runs/TASK-0020-M12-interbrain-relations-webview2-pass{1,2}.json,
  TASK-0020-J12-intrabrain-regression-webview2.json,
  TASK-0020-L12-composed-regression-webview2-pass{1,2}.json

VALIDATIONS:
- 144/144 tests Rust (114 → 144)
- 170/170 tests TypeScript (141 → 170)
- `pnpm check` PASS, `pnpm build` PASS
- build Tauri `debug --no-bundle` PASS, sans avertissement
- M12 DEUX PASSES dans le vrai WebView2, même variant, deux processus réels
- régression J12 intra PASS — panneau stabilisé en 22 ms, 4 entrées, 2 sections
- régression L12 composée PASS — `L8` exact : 32 arêtes intra, 0 traversante
- X2 X3 X4 X5 X6 maintenues; 14/14 preuves protégées inchangées

NON TESTÉ / LIMITES:
- K11/L11 NON REJOUÉ — son code fonctionnel n'a pas changé. Déclaré tel, pas
  supposé. L'absence d'artefact FileTopo dans les racines analysées a été
  vérifiée DIRECTEMENT sur le bac à sable de la preuve.
- Aucune campagne H9, aucun seuil. R8 entière.
- I-E complète hors périmètre : `cek1` est le repli déclaré, et un déplacement
  RÉEL casserait une extrémité. Rien ne prétend le contraire.
- Aucune détection automatique entre cerveaux, aucune heuristique : les six
  relations viennent de règles nommées et versionnées sur un jeu figé.
- Persistance de composition toujours non implémentée — P-19, confirmée à
  l'étape 27. Révocation P-04 non implémentée — P-21.
- B0 n'est pas corrigé; rien n'a été supprimé ni renommé dans
  src-tauri/target/. `CARGO_INCREMENTAL=0` utilisé, qui NE SUPPRIME RIEN.
- Une seule machine, un seul runtime WebView2.

GIT: commits sur `build/v0.2-a5-interbrain-relations`, push vers
`origin/build/v0.2-a5-interbrain-relations` (branche de travail DÉJÀ publiée —
`origin` la portait à `7746fd4`). Le push a eu lieu à la REPRISE, pas à
l'exécution : avance rapide seule, aucun commit distant écrasé. AUCUNE fusion
vers `main`, aucune PR, aucune release, aucune étiquette, aucun `force push`,
aucune réécriture d'historique, aucune suppression.

NEXT: contrôle indépendant de `TASK-0020`, par une instance distincte de
l'exécuteur, sur preuves. `TASK-0020` reste `IMPLEMENTED`.
