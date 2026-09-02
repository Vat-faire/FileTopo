TASK_ID: TASK-0019 — correction de la réserve X6
AGENT: CLAUDE
RESULT: DONE
BRANCH: build/v0.2-a4-composed-view
BASE_HEAD: 21acd64aca0c03b68b7e2eccc792f716fa7f2f9a
TASK_STATE: IMPLEMENTED — VERIFIED NON attribué, X6 reste OPEN
SESSION: début de session normal. Git vérifié d'abord : racine, branche
`build/v0.2-a4-composed-view`, `HEAD` `21acd64`, arbre propre, aligné sur
`origin`. Aucun écart.

SUMMARY:
- ACTION-0030 = CHANGES_REQUIRED est ENREGISTRÉE, pas rendue par l'exécuteur —
  `docs/reviews/ACTION-0030-independent-control.md`. Le fond accepté au §2 n'a
  pas été rouvert; aucun critère `L1`–`L12` n'a été touché.

- X6 DISAIT VRAI. « Gamma inchangé » était prouvé, mais l'ACTE que l'étape 7
  nomme — approuver `S-005` dans Alpha — n'avait pas eu lieu pendant `L12`.
  Une cible manquée reste une cible manquée, même publiée honnêtement.

- RIEN N'A ÉTÉ SUPPRIMÉ. Le bac à sable `<dépôt>/.filetopo-sandbox` est
  INTACT : l'empreinte de son contenu, variants exclus, est IDENTIQUE avant et
  après le rejeu — `17186576c4df5b5d…`. Ni magasin de relations remis à zéro,
  ni catalogue effacé, ni `SQLite` touchée à la main, ni contournement de `X3`,
  ni commande de remise à zéro exposée au runtime.

- CE QUI A ÉTÉ AJOUTÉ EST UN NAMESPACE, PAS UNE DESTINATION.
  `FILETOPO_SANDBOX_VARIANT`, variable de DÉVELOPPEMENT lue par
  `map/sandbox.rs`, résout `<dépôt>/.filetopo-sandbox/variants/<variant>` —
  toujours SOUS le même répertoire. Variable absente : comportement EXACTEMENT
  inchangé. La valeur est un NOM, jamais un chemin : basename ASCII
  `[A-Za-z0-9_-]`, 1 à 64 caractères. Séparateur, `..`, chemin absolu, chaîne
  vide, valeur trop longue : ERREUR EXPLICITE remontée par `map_sandbox`,
  JAMAIS un repli silencieux vers un chemin fourni par l'appelant. Aucun
  sélecteur de dossier, aucune racine choisie par l'utilisateur.

- SIX TESTS DE CONFINEMENT, dont le seul qui compte si la charset change un
  jour : « aucun variant accepté ne sort du bac à sable ». Refusés et prouvés
  tels : `..`, `../x`, `..\x`, `a/b`, `a\b`, `/abs`, `\\share`, `C:\abs`, `C:`,
  `a.b`, `x/../../y`, `a b`, `é`, `%TEMP%`, chaîne vide, 65 caractères.

- `scripts/l12-run-real-host.ps1` tire un variant NEUF par invocation, le garde
  IDENTIQUE pour les deux passes, retire la variable en sortant — et NE
  SUPPRIME PAS le répertoire du variant.

- L12 REJOUÉ EN ENTIER, vrai WebView2 `152.0.4191.53`, deux processus réels,
  fermeture et redémarrage réels. Étape 7, pendant que `C2` [Alpha, Gamma] est
  affichée :

      Alpha  approuvées 4 → 5   en attente 4 → 3   S-005 en attente → approuvée
      Gamma  approuvées 4 → 4   en attente 4 → 4   S-005 en attente → en attente

  `s005WasPending: true`, `approvalReplayable: true`, `approvalError: null`,
  `alphaMovedByExactlyOne: true` (exactement +1 / −1),
  `gammaStrictlyUnchanged: true`, `gammaS005StillPending: true`,
  `separateStores: true`. Vraies frappes aux étapes 3, 8, 13 et 14 :
  `isTrusted=true`, 0 clic programmatique. `pass2` porte le MÊME variant et
  confirme Gamma actif, composition Gamma SEUL.

- X5 PRÉSERVÉE : les HUIT preuves protégées `TASK-0016`/`0017`/`0018` sont
  bit-for-bit INCHANGÉES, vérifiées une à une. Seuls les deux artefacts `L12`
  de `TASK-0019` — tâche NON `VERIFIED` — ont été remplacés par la preuve
  corrigée de cette même tâche.

- UN DÉFAUT TROUVÉ EN CHEMIN : un octet `NUL` était COMMITÉ dans la fiche
  `TASK-0019` elle-même, dans la phrase qui décrit le `NUL` de
  `brainScenario.ts`. Il rendait la fiche BINAIRE pour `git diff` et `grep` —
  illisible en revue, sur le fichier même qu'un contrôle indépendant doit lire.
  Écrit `<NUL>`.

- UNE CHOSE RESTAURÉE PLUTÔT QUE LIVRÉE : `cargo fmt` avait reformaté HUIT
  fichiers `src-tauri/src/map/*.rs` que la tâche ne touche pas. Restaurés à
  leur contenu commité; le diff reste confiné à `sandbox.rs` et à une ligne de
  `lib.rs`.

FILES:
- src-tauri/src/map/sandbox.rs — variant, validation, confinement, six tests
- src-tauri/src/lib.rs — `map_sandbox` propage l'erreur de résolution (1 ligne)
- scripts/l12-run-real-host.ps1 — variant neuf par invocation, retiré en sortie
- docs/performance/runs/TASK-0019-L12-composed-view-webview2-pass{1,2}.json
- docs/reviews/ACTION-0030-independent-control.md (nouveau)
- docs/tasks/TASK-0019-composed-multibrain-view.md — §7.1, §7.2, §7.3, §7.4,
  historique; §4 GELÉE, non touchée
- docs/ai/CURRENT_STATE.md, NEXT_ACTION.md, HANDOFF.md, VALIDATION.md,
  CHANGELOG_AI.md

VALIDATIONS:
- 113/113 tests Rust (107 → 113)
- 139/139 tests TypeScript
- `pnpm check` PASS, `pnpm build` PASS
- build Tauri `debug --no-bundle` PASS
- L12 DEUX PASSES dans le vrai WebView2, même variant, deux processus
- 8/8 preuves protégées inchangées; empreinte du bac à sable identique

NON TESTÉ / LIMITES:
- K11, K12 et J12 de régression NON REJOUÉS — leur code fonctionnel n'a pas
  changé. Déclaré tel, pas supposé.
- Aucune campagne H9, aucun seuil. R8 entière.
- Persistance de composition toujours non implémentée — P-19.
- Aucune relation inter-cerveaux — TASK-0020.
- B0 s'est reproduit une SEPTIÈME fois : `rustc` a paniqué sur son cache
  incrémental (`Failed to recover key for impl_trait_header`). Contourné par
  `CARGO_INCREMENTAL=0`, qui NE SUPPRIME RIEN; rien n'a été effacé ni renommé
  dans `src-tauri/target/`.
- Une seule machine, un seul runtime WebView2.

GIT: commit sur `build/v0.2-a4-composed-view`, push vers
`origin/build/v0.2-a4-composed-view` (branche de travail déjà publiée). AUCUNE
fusion vers `main`, aucune PR, aucune release, aucune étiquette, aucun `force
push`, aucune réécriture d'historique, aucune suppression.

NEXT: re-contrôle indépendant de `TASK-0019` sur la réserve `X6` UNIQUEMENT,
par une instance distincte de l'exécuteur, sur preuves. `X6` reste `OPEN`;
`TASK-0019` reste `IMPLEMENTED`.
