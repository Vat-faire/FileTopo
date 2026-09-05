# NEXT_PROMPT — TASK-0024 / correction X11

**TARGET_AGENT:** CLAUDE  
**STATUS:** READY  
**OWNER:** orchestrateur technique  
**TASK:** `TASK-0024 — correction ciblée X11`  
**MODE:** exécution autonome depuis le dépôt

> Ce fichier enregistre une correction demandée après contrôle indépendant. L'exécuteur l'applique; il ne transforme pas lui-même `X11` en `CLOSED` et ne s'attribue pas `VERIFIED`.

## /goal

Fermer le défaut d'intégration qui empêche le nouveau moteur `dre-v1` d'être réellement utilisable sur **tous les cerveaux** de FileTopo. Ne rouvrir aucun autre élément accepté de `TASK-0024`.

Le moteur backend est générique, mais l'ancienne couche de relations `TASK-0017` garde encore un verrou `RELATIONS_FIXTURE = quasi-empty`. Résultat actuel : `brain-beta` lit `deep`; `map_relations_open` est refusé, `LoadedBrain.relations` devient `null`, `RelationsPanel` retourne avant le bouton **Analyser les relations**, et `analyzeRelations()` ne peut pas terminer son refresh après `map_relation_engine_run`. Cela contredit l'objectif gelé « premier moteur générique réel » et l'action UI explicite de `TASK-0024` / `F-043`.

---

## 0 — synchronisation obligatoire

Appliquer les protocoles projet de début de session.

Avant toute modification :

1. vérifier la branche locale `build/v0.2-a8-deterministic-relation-engine`;
2. aucun fichier local ne doit être modifié;
3. `git fetch origin`;
4. fast-forward uniquement vers `origin/build/v0.2-a8-deterministic-relation-engine`;
5. le HEAD obtenu doit être le commit d'orchestration qui remplace **ce** `.orchestrator/NEXT_PROMPT.md`;
6. son parent direct doit être exactement `2e4c9842c4492d28cc4de54ccdec5d049f1b7e22`;
7. `TASK-0024 = IMPLEMENTED`, jamais VERIFIED;
8. X5 = 29;
9. `main = 91bbe90f0f99026c28cd345784d4f579a0016db2`.

Si divergence, autre modification locale ou fast-forward impossible : STOP/BLOCKED.

---

## 1 — enregistrer le verdict externe

Créer `docs/reviews/ACTION-0040-independent-control.md`.

Le document **ENREGISTRE** un verdict externe rendu par l'orchestrateur; Claude ne rend pas ce verdict.

Enregistrer :

- `TASK-0024 = IMPLEMENTED`;
- `ACTION-0040 = CHANGES_REQUIRED`;
- `X11 = OPEN`;
- HEAD contrôlé avant correction : `2e4c9842c4492d28cc4de54ccdec5d049f1b7e22`;
- commit substantif initial : `6a4a5432b90c65ce02e94e8977e0f4dabc5ac0a6`.

Réserve X11 :

> `dre-v1` est générique côté backend, mais l'interface et les lectures intra-relations restent bloquées par `ensure_in_scope()` / `RELATIONS_FIXTURE = quasi-empty`. `brain-beta` (`deep`) ne peut donc pas ouvrir le panneau générique, exécuter normalement l'analyse depuis l'interface, consulter ses sorties core ou approuver une suggestion core.

---

## 2 — frontière à préserver

**Ne pas généraliser les anciennes règles synthétiques.**

Les producteurs historiques :

- `homonymes/v1`;
- `suites-numerotees/v1`;
- seeds `TASK-0017`;
- self-check J1–J5/J10;

restent strictement limités à `quasi-empty`.

En particulier, ne jamais lancer `derive()` legacy sur `wide`, `deep` ou `mixed` seulement pour rendre le panneau disponible. Le plafond/quadratique historique reste une raison valide de garder ce producteur limité.

Le but est de **découpler le périmètre legacy du périmètre du moteur core**, pas d'élargir le legacy.

---

## 3 — comportement générique requis

Après correction, pour n'importe quel `BrainRecord` valide :

- `map_relation_engine_status(brain_id)` fonctionne;
- `map_relation_engine_run(brain_id)` fonctionne;
- `map_relations_open(brain_id)` retourne un overview utilisable;
- `map_relations_for_node` fonctionne;
- `map_relations_approve` fonctionne pour une suggestion core `CURRENT`;
- le panneau **Relations internes au cerveau** reste disponible;
- le bouton **Analyser les relations** est accessible;
- aucune règle/seed legacy n'est inventé si le cerveau n'est pas `quasi-empty`.

Pour un cerveau hors scope legacy avant tout run core : overview valide, relations/suggestions core vides, état moteur `NOT_RUN` (ou état exact dérivé), aucune erreur « fixture hors scope ».

Après run core : seules les sorties `core-rule-engine` de ce cerveau sont montrées selon la fraîcheur.

---

## 4 — refactor minimal recommandé

Refactorer `relation_commands.rs` de façon à séparer explicitement :

### A. scope legacy

Un helper du genre `legacy_fixture_spec(brain) -> Option<FixtureSpec>` ou équivalent :

- `Some(quasi-empty)` seulement pour la fixture historique;
- `None` pour les autres fixtures valides;
- fixture inconnue reste une erreur normale.

### B. open générique

`open_relations` :

1. résoudre la source valide;
2. ouvrir snapshot/store du cerveau;
3. si scope legacy : rejouer `derive()` + seeds historiques comme aujourd'hui;
4. sinon : **ne jamais** exécuter `derive()` ni seed legacy;
5. lire les sorties existantes core/humaines;
6. appliquer le filtre `CURRENT/STALE` core existant;
7. retourner un overview générique.

### C. node relations / approval

`node_relations` et `approve_suggestion` ne doivent plus être bloqués par `ensure_in_scope` pour un cerveau valide.

- résolution endpoint par `brain_id` inchangée;
- stale core approval toujours refusée;
- approved reste `APPROVED`;
- legacy reste inchangé sur Alpha/Gamma.

### D. self-check legacy

`self_check` **peut et doit rester** limité à `quasi-empty`, parce qu'il vérifie le contrat gelé `TASK-0017`.

Ne pas affaiblir J12.

---

## 5 — UI

`RelationsPanel` ne doit plus retourner un panneau mort uniquement parce que la fixture n'est pas `quasi-empty`.

Le périmètre legacy et la disponibilité du panneau core sont deux concepts distincts.

Si un indicateur legacy est conservé, il doit seulement expliquer que les **anciennes relations de démonstration TASK-0017** ne s'appliquent pas à ce cerveau; il ne doit jamais masquer :

- le bouton `Analyser les relations`;
- l'état `dre-v1`;
- les relations core;
- les suggestions core;
- leur approbation.

Modifier DTO/nom de champ (`inScope`, `legacyInScope`, etc.) seulement si nécessaire. Préférer le changement le plus petit qui rende la sémantique honnête.

---

## 6 — preuve obligatoire sur Cerveau Bêta

`brain-beta` est le contre-exemple réel du catalogue :

- `brain-alpha` → `quasi-empty`;
- `brain-beta` → `deep`;
- `brain-gamma` → `quasi-empty`.

Ajouter des tests qui prouvent au minimum :

1. build Beta;
2. `open_relations(Beta)` réussit;
3. aucune relation/suggestion legacy n'est seedée ou dérivée pour Beta;
4. status core = `NOT_RUN` avant run;
5. run `dre-v1` Beta réussit sans LLM/réseau;
6. refresh overview après run réussit;
7. node relations Beta réussit;
8. Alpha J12 reste strictement identique sur ses invariants legacy;
9. aucune donnée Alpha/Gamma ne fuit dans Beta;
10. aucun store cross-brain n'est modifié.

Le test ne doit pas affirmer qu'une règle produit forcément une sortie sur `deep` si les signaux n'existent pas : **zéro sortie est un résultat valide**. Ce qui est obligatoire est que le moteur et l'interface fonctionnent génériquement.

---

## 7 — vrai WebView2 ciblé X11

Créer un contrôle réel Windows/WebView2 sur un fresh variant.

Le scénario doit :

- afficher/focaliser `brain-beta`;
- confirmer que le panneau relations n'est pas « hors scope »;
- confirmer que le bouton `Analyser les relations` est présent et activable;
- l'activer par vraie frappe clavier (`keydownIsTrusted = true`, `activationIsTrusted = true`);
- `programmaticClickCalls = 0` et `programmaticClickDispatches = 0`;
- obtenir un report `brainId = brain-beta`, `engineVersion = dre-v1`, `inputState = CURRENT`;
- confirmer que `map_relations_open` réussit après run;
- confirmer qu'aucun producer legacy n'a été créé pour Beta;
- source read-only;
- X5 = 29;
- process réellement fermé.

Publier cette preuve comme **preuve corrective non canonique** :

`docs/performance/runs/TASK-0024-X11-generic-brain-webview2.json`

Elle ne rejoint PAS X5 et ne remplace aucune des trois preuves canoniques gelées de TASK-0024.

---

## 8 — régressions à rejouer

Comme le chemin `open_relations` / panneau / approbation change :

- rejouer DR15 pass1/pass2 sur un **nouveau variant frais** et réécrire seulement les deux preuves TASK-0024 DR15 (elles ne sont pas protégées tant que TASK-0024 n'est pas VERIFIED);
- rejouer J12 réel et réécrire seulement `TASK-0024-J12-intrabrain-relations-regression-webview2.json`;
- ne pas rejouer K11/K12/L12/M12/N15/H9 sauf dépendance directe imprévue.

Les 29 preuves X5 historiques restent intouchables.

---

## 9 — tests et validations

Exécuter au minimum :

- tests Rust ciblés relation_commands/rule_engine/relations;
- suite Rust complète;
- suite TypeScript complète;
- `pnpm check`;
- `pnpm build`;
- Tauri debug `--no-bundle`;
- X11 WebView2 Beta;
- DR15 pass1/pass2 frais;
- J12 réel.

B0 : `CARGO_INCREMENTAL=0` autorisé si nécessaire; aucun `clean`, aucune suppression `target`.

---

## 10 — X5 / Git

X5 reste **exactement 29**.

Aucune preuve TASK-0024 n'est protégée maintenant.

Runtime reste propriétaire `TASK-0024` :

- `protectedDestinations = []`;
- `writesUnderItsOwnTaskOnly = true`.

`main` reste exactement `91bbe90f0f99026c28cd345784d4f579a0016db2`.

Aucun merge, PR, release, tag, force push, rebase/reset destructif.

---

## 11 — gouvernance de fin

Mettre à jour :

- `ACTION-0040`;
- `TASK-0024`;
- `DEC-0026` seulement dans une section résultat/implémentation si utile, sans réécrire sa décision gelée;
- `CURRENT_STATE`;
- `NEXT_ACTION`;
- `HANDOFF`;
- `VALIDATION`;
- `CHANGELOG_AI`;
- `.orchestrator/RESULT.md`.

À la fin de l'exécution :

- `TASK-0024 = IMPLEMENTED`;
- `F-043 = IMPLEMENTED`;
- `ACTION-0040 = CHANGES_REQUIRED`;
- `X11 = OPEN`;
- aucune nouvelle réserve auto-fermée;
- aucune `TASK-0025` créée.

Claude **ne ferme pas X11** et ne met pas TASK-0024 VERIFIED.

`NEXT_ACTION` = re-contrôle indépendant ciblé X11 / TASK-0024.

## RESULT.md

```text
TASK_ID: TASK-0024 — correction X11
AGENT: CLAUDE
RESULT: DONE | BLOCKED | FAILED
BRANCH: build/v0.2-a8-deterministic-relation-engine
FINAL_HEAD: <commit substantif correction X11>

SUMMARY:
-

VALIDATIONS:
-

IMPORTANT_FILES:
-

COMMIT:
PUSHED: yes/no

LIMITS_OR_BLOCKERS:
- DEC-0013/F physical identity persistence remains blocked
- non-Windows X10 guarantee remains unproven

NEXT_ORCHESTRATOR_DECISION:
- re-contrôle indépendant X11 / TASK-0024
```

Appliquer ensuite le protocole de fermeture de session, commit/push fast-forward, rapport terminal court, puis arrêt.