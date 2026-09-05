# NEXT_PROMPT — TASK-0024

**TARGET_AGENT:** CODEX  
**STATUS:** READY  
**OWNER:** orchestrateur technique  
**TASK:** `TASK-0024 — Deterministic Relation Engine v1`  
**MODE:** exécution autonome depuis le dépôt

> Ce fichier est écrit par l'orchestrateur. L'exécuteur le lit et l'exécute; il ne le réécrit pas pour faciliter son résultat. Le prochain prompt remplacera ce fichier, l'historique Git conservant les précédents.

## /goal

Construire le premier **moteur générique réel de règles déterministes et de suggestions explicables** de FileTopo, sans LLM, à partir des faits fiables déjà disponibles, tout en conservant la frontière stricte de `DEC-0021` :

1. **fait observé** ≠ relation;
2. **relation déterministe** = proposition vraie produite par une règle nommée/versionnée;
3. **suggestion** = hypothèse explicable qui demande une décision humaine et n'est jamais une relation avant approbation.

La tranche doit implémenter `F-043` sans implémenter `F-044` ni `F-045`.

---

# 0 — AUTO-INITIALISATION ET BASE

Appliquer :

- `.agents/skills/debut-session/SKILL.md`;
- `.orchestrator/protocols/debut-session.md`.

Vérifier Git réel avant toute modification.

État attendu :

- dépôt `Vat-faire/FileTopo`;
- branche courante : `build/v0.2-a7-exact-content-observations`;
- le HEAD courant est le commit d'orchestration qui ajoute **ce** fichier `.orchestrator/NEXT_PROMPT.md`;
- son parent direct doit être exactement :
  `44b64824675c1b74528f5d75fd57ef27c664a091`;
- `TASK-0023 = VERIFIED`;
- `ACTION-0039 = CLOSED`;
- `X9 = CLOSED`;
- `X10 = CLOSED`;
- X5 = exactement 29 preuves protégées;
- aucune tâche `IN_PROGRESS`;
- aucune tâche `IMPLEMENTED` en attente de contrôle;
- `main = 91bbe90f0f99026c28cd345784d4f579a0016db2`;
- arbre propre et upstream aligné, à l'exception attendue d'aucune modification locale.

Si un de ces points diverge : **STOP**.

Ne pas reset/rebase/clean pour masquer une divergence.

Créer ensuite la branche :

`build/v0.2-a8-deterministic-relation-engine`

à partir du HEAD qui contient ce prompt.

---

# 1 — LECTURE MINIMALE OBLIGATOIRE

Lire avant de concevoir :

- `AGENTS.md`;
- `docs/ai/CURRENT_STATE.md`;
- `docs/ai/NEXT_ACTION.md`;
- `docs/ai/HANDOFF.md`;
- `docs/product/FEATURE_MATRIX.md` : `F-017`, `F-019`, `F-043`, `F-044`, `F-045`, `F-046`;
- `DEC-0009`;
- `DEC-0012`;
- `DEC-0013`;
- `DEC-0018`;
- `DEC-0019`;
- `DEC-0021`;
- `DEC-0022`;
- `DEC-0025`;
- `TASK-0017`, `TASK-0020`, `TASK-0023` seulement pour les contrats/régressions utiles;
- `src-tauri/src/map/relations.rs`;
- `relation_commands.rs`;
- `cross_relations.rs` / `cross_commands.rs` seulement pour éviter les régressions;
- `content_signals.rs`;
- `store.rs`, `sandbox.rs`;
- `src/map/relations.ts`, `types.ts`, `MapView.tsx` et le panneau de relations;
- `src/map/runArtifacts.ts` et gardes X5.

Important : le `derive()` historique de `TASK-0017` contient `homonymes/v1` et `suites-numerotees/v1`. Ces règles sont **des producteurs synthétiques historiques de preuve**, antérieurs à `DEC-0021`. Elles ne deviennent pas automatiquement les règles du nouveau moteur et ne doivent pas être présentées comme des vérités génériques.

---

# 2 — GEL AVANT CODE

Vérifier que ces numéros sont libres :

- `TASK-0024`;
- `DEC-0026`.

S'ils ne sont pas libres : **STOP**, ne pas choisir un autre numéro silencieusement.

Créer avant tout code produit :

- `docs/tasks/TASK-0024-deterministic-relation-engine.md`;
- `docs/decisions/DEC-0026-deterministic-rule-runtime.md`.

Figer dans la tâche les critères `DR1` à `DR14` et `DR15` réel WebView2 définis plus bas.

États :

`TASK-0024: PROPOSED → APPROVED → IN_PROGRESS`

Commit/push de **GEL** avant la première modification du code produit.

Après ce commit, ne pas réécrire les critères pour faire passer l'implémentation.

---

# 3 — DEC-0026 : CONTRAT DU RULE ENGINE

`DEC-0026` doit fixer les principes suivants.

## 3.1 Trois niveaux, inchangés

- `OBSERVED_FACT` : fait lu/démontré, n'est pas une relation.
- `DETERMINISTIC_RELATION` : règle nommée + versionnée + proposition dont les signaux impliquent réellement le sens déclaré.
- `SUGGESTION` : signaux insuffisants pour affirmer; objet distinct, état distinct.

Aucune troisième provenance de relation.

Une relation établie reste :

- `DETERMINISTIC`, ou
- `APPROVED`.

## 3.2 Définition minimale d'une règle

Chaque règle réelle du nouveau moteur possède au minimum :

- `rule_id` stable et générique;
- `version`;
- `output_kind`: deterministic relation ou suggestion;
- `relation_type` proposé/produit;
- `symmetric` explicite;
- définition de **ce qu'elle affirme**;
- signaux requis;
- explication FR;
- explication EN.

Un seuil ou un score ne peut pas remplacer cette définition.

## 3.3 Version du moteur

Nom canonique :

`dre-v1`

Aucune dépendance externe ni IA.

## 3.4 Règles v1 obligatoires

### Règle A — `core.identical-content/v1`

**Sortie : relation déterministe.**

Type de relation :

`content-identical`

Sens exact :

> Les deux occurrences ont eu un contenu binaire non vide avec le même digest `sha256-v1` dans la génération d'observation de contenu utilisée par cette exécution du moteur.

Cette règle n'affirme PAS :

- même fichier physique;
- copie;
- original/copie;
- version;
- référence;
- relation métier.

Elle est sémantiquement **symétrique**, mais une seule arête canonique est stockée.

Pour un groupe de `N` occurrences au même digest, ne pas créer `N×(N-1)/2` arêtes. Utiliser une représentation déterministe **N-1** :

- trier les endpoints;
- le premier endpoint canonique devient l'ancre du groupe;
- une relation vraie `content-identical` relie l'ancre à chaque autre occurrence.

Chaque arête reste vraie individuellement.

**Fichiers vides :** le fait `hash identique` reste disponible dans `content_signals`, mais cette règle ne crée **aucune arête** pour un groupe de fichiers de taille 0. Cela évite de transformer les fichiers vides en faux réseau logique et respecte `F-046`.

### Règle B — `core.numbered-sibling-revision-candidate/v1`

**Sortie : suggestion, jamais relation déterministe.**

Type proposé :

`revision`

Conditions exactes :

- deux fichiers réguliers;
- même dossier direct;
- même extension;
- noms identiques sauf un entier final dans le stem;
- nombres consécutifs `n → n+1`;
- endpoints distincts.

Sens : ces signaux **suggèrent** une relation de révision, mais ne la prouvent pas.

Explication attendue en langage ordinaire, sans score, par exemple :

FR : « Suggestion créée parce que les deux fichiers sont dans le même dossier, ont la même extension et des noms identiques sauf un numéro final consécutif. »

EN équivalent.

Cette règle ne doit produire aucune relation établie avant une approbation explicite.

## 3.5 Les règles historiques restent historiques

Ne pas réinterpréter automatiquement :

- `homonymes/v1` historique;
- `suites-numerotees/v1` historique;

comme les règles `core.*` ci-dessus.

Leur comportement gelé peut rester nécessaire aux régressions `TASK-0017`/`J12`, mais le nouveau moteur doit avoir son propre catalogue, sa propre identité et son propre chemin d'exécution.

---

# 4 — ARCHITECTURE DU NOUVEAU MOTEUR

Créer un module Rust distinct, nom recommandé :

`src-tauri/src/map/rule_engine.rs`

ou équivalent clair.

Ne pas enterrer la nouvelle architecture dans le vieux `derive()`.

Le moteur v1 consomme :

- `MapNode` / hiérarchie et métadonnées observées;
- génération courante de `content_signals` quand disponible;
- état relationnel existant pour éviter les collisions.

Le moteur v1 est **intra-cerveau seulement**.

Il ne crée aucune relation inter-cerveaux automatique.

Il doit être conçu pour qu'une future règle inter-cerveaux puisse exister sans refondre le modèle, mais rien de tel n'est implémenté ici.

---

# 5 — SNAPSHOT D'ENTRÉE ET FRAÎCHEUR

Une relation déterministe vraie aujourd'hui ne doit pas rester affichée comme vraie après disparition de sa preuve.

Le moteur doit donc enregistrer un snapshot d'entrée suffisant, au minimum :

- `brain_id`;
- identité/digest reconstructible de la carte courante;
- `content_generation_id` utilisé, nullable si aucune règle de contenu n'a pu être exécutée;
- version `dre-v1`;
- date d'exécution.

Le store doit pouvoir déterminer si le résultat du moteur est **CURRENT** ou **STALE**.

Si une nouvelle campagne de contenu est committée ou si la carte change et que le moteur n'a pas encore été rejoué :

- les résultats `core.*` de l'ancien snapshot ne doivent PAS être présentés comme des relations/suggestions actuelles;
- l'UI doit indiquer « analyse des relations à actualiser » / équivalent;
- les anciennes relations approuvées par humain ne sont PAS supprimées par cette règle de fraîcheur;
- les relations déterministes historiques de fixture ne doivent pas être détruites.

Ne pas résoudre la fraîcheur en lançant silencieusement une lecture de fichiers ou un nouveau hash lors de l'ouverture du panneau.

---

# 6 — STORE : NE PAS DÉTRUIRE L'HISTORIQUE

Le store actuel contient :

- relations déterministes historiques;
- relations approuvées;
- suggestions historiques;
- contraintes `X3`.

La tranche peut migrer `RELATIONS_SCHEMA_VERSION` si nécessaire, avec migration testée.

Mais elle doit permettre de distinguer structurellement les productions du nouveau moteur des productions historiques.

Solution attendue : un champ/namespace de producteur ou une équivalence structurelle robuste, par exemple :

`producer = core-rule-engine`

avec règle/version.

Ne pas utiliser une heuristique fragile du type « tout rule_name qui commence par X est à nous » si un schéma propre peut l'éviter.

Les opérations de reconciliation du nouveau moteur :

- remplacent/reconcilient uniquement les sorties du nouveau moteur;
- ne suppriment jamais les relations déterministes historiques gelées;
- ne suppriment jamais une relation `APPROVED`;
- ne réécrivent jamais une suggestion déjà `approved` comme `pending`;
- ne touchent jamais au store inter-cerveaux.

---

# 7 — SUGGESTIONS EXPLICABLES

Étendre le modèle de suggestion uniquement autant que nécessaire à `F-043`.

Une suggestion produite par le nouveau moteur doit conserver au minimum :

- `suggestion_key` stable;
- `rule_id`;
- `rule_version`;
- `relation_type`;
- source;
- cible;
- explication FR;
- explication EN;
- signaux observés structurés;
- état existant `pending` / `approved`;
- timestamps déjà nécessaires.

Les signaux structurés ne doivent contenir aucun contenu de fichier, seulement les faits minimaux nécessaires à l'explication.

Exemple de signaux de la règle B :

- `same_parent = true`;
- `same_extension = true`;
- `normalized_prefix = ...`;
- `source_number = 4`;
- `target_number = 5`.

**Aucun `score`, `confidence = 0.87`, probabilité ou seuil numérique dans v1.**

Un `suggestion_key` doit être dérivé de façon stable du contrat de la suggestion : règle/version + brain + endpoints + type, pas d'un timestamp ni d'un row id.

---

# 8 — RELATION `content-identical`

Ajouter le type générique `content-identical` au modèle de relations établi.

Libellés :

FR : `contenu identique`  
EN : `identical content`

L'interface doit pouvoir expliquer une relation déterministe de ce type :

- règle `core.identical-content`;
- version `v1`;
- SHA-256 identique;
- génération d'observation utilisée;
- sens exact « contenu binaire identique observé ».

Ne jamais afficher :

- « même fichier »;
- « doublon physique »;
- « copie ».

La relation est sémantiquement symétrique. Ne pas inventer une seconde arête inverse en stockage.

---

# 9 — ABSENCE DE CONTENT SIGNALS

Le moteur doit rester utilisable quand aucune génération `content_signals` n'existe.

Dans ce cas :

- `core.identical-content/v1` = `SKIPPED_MISSING_SIGNAL` ou équivalent explicite;
- aucune relation de contenu créée;
- `core.numbered-sibling-revision-candidate/v1` peut être évaluée à partir de la carte;
- aucune campagne SHA-256 n'est lancée silencieusement.

Le rapport moteur doit exposer les règles évaluées et les règles sautées avec motif.

---

# 10 — API / REPORT

Créer une commande backend explicite, conceptuellement :

`run_deterministic_relation_engine(brain_id)`

et une lecture d'état :

`relation_engine_status(brain_id)`

Noms exacts adaptés aux conventions du dépôt.

Le report doit contenir au minimum :

- `brainId`;
- `engineVersion = dre-v1`;
- `runId` opaque;
- `mapDigest`;
- `contentGenerationId` nullable;
- `rulesEvaluated`;
- `rulesSkipped` avec motif;
- `deterministicRelationsProduced`;
- `suggestionsProduced`;
- `emptyContentGroupsSkipped`;
- `establishedCollisionSuppressions`;
- `approvedSuggestionPreservations`;
- `sourceReadOnlyConfirmed`;
- `inputState = CURRENT` au terme d'un run réussi.

Aucun chemin absolu personnel dans le report ou les artefacts.

---

# 11 — UI MINIMALE MAIS RÉELLE

Dans le panneau relations existant, ajouter une action accessible :

FR : `Analyser les relations`  
EN : `Analyze relations`

Cette action :

- lance uniquement le moteur `dre-v1`;
- ne lance pas de hash silencieux;
- affiche un résumé du dernier run;
- montre clairement si l'analyse est `à jour` ou `à actualiser`.

Pour une relation déterministe sélectionnée : afficher règle + version + explication.

Pour une suggestion sélectionnée : afficher :

- source;
- cible;
- type proposé;
- règle/version;
- pourquoi;
- signaux observés.

Ne pas construire la file globale « 17 relations à confirmer » : c'est `F-044`.

Ne pas ajouter Rejeter / Plus tard : `F-044/F-045`.

Le bouton d'approbation historique existant peut continuer de fonctionner. Une suggestion `core.*` approuvée devient une relation `APPROVED`, jamais `DETERMINISTIC` et jamais provenance `AI`.

---

# 12 — IDEMPOTENCE ET RECONCILIATION

Deux exécutions consécutives sans changement doivent produire :

- même ensemble de relations déterministes `core.*`;
- mêmes `suggestion_key` pending;
- aucune duplication;
- aucune croissance artificielle de tables;
- un nouveau `runId` autorisé;
- une explication identique pour les mêmes faits.

Une suggestion déjà approuvée :

- reste approuvée;
- sa relation `APPROVED` reste unique;
- le moteur ne recrée pas une nouvelle pending équivalente.

Si une relation établie de même source/cible/type existe déjà :

- ne pas créer une suggestion concurrente du même type;
- enregistrer une suppression/collision dans le report.

---

# 13 — CAS CONTENT-IDENTICAL

Tests synthétiques spécialisés hors fixtures gelées :

A. deux fichiers non vides mêmes octets, chemins différents :
- même SHA-256;
- une relation `content-identical`;
- provenance `DETERMINISTIC`;
- règle/version présentes;
- pas de « copie ».

B. trois fichiers mêmes octets :
- exactement `N-1 = 2` arêtes;
- ancre canonique déterministe;
- jamais 3 paires complètes.

C. deux fichiers vides :
- même fait SHA-256 possible;
- zéro relation `content-identical` créée par la règle.

D. même taille / octets différents :
- zéro relation.

E. ancien digest devenu stale après nouvelle génération :
- ancienne relation `core.*` non exposée comme actuelle avant rerun;
- après rerun, relation supprimée si preuve disparue.

---

# 14 — CAS SUGGESTION NUMÉROTÉE

Tests :

`rapport-4.pdf` + `rapport-5.pdf`, même dossier :
- une suggestion `revision`;
- aucune relation déterministe `revision`;
- rule/version présents;
- explication FR/EN;
- signaux structurés;
- aucun score.

Contre-exemples :

- dossiers différents → aucune suggestion;
- extensions différentes → aucune suggestion;
- numéros non consécutifs → aucune suggestion;
- préfixes différents → aucune suggestion;
- fichier + dossier → aucune suggestion;
- même endpoint → impossible.

---

# 15 — ISOLATION CERVEAUX

Le moteur s'exécute pour UN `brain_id`.

Alpha et Gamma peuvent observer le même contenu synthétique mais :

- leurs runs sont distincts;
- leurs stores restent isolés;
- aucune relation inter-cerveaux n'est créée;
- les endpoint keys restent namespacées par cerveau;
- une suggestion Alpha n'apparaît pas dans Gamma.

Aucun store commun de règles mutable par utilisateur dans cette tranche.

Le catalogue de règles v1 peut être statique/read-only dans le code.

---

# 16 — LEGACY / RÉGRESSIONS

Conserver les invariants historiques :

- provenance seulement `DETERMINISTIC` / `APPROVED`;
- suggestion ≠ relation;
- `X3` approval constraints;
- pas d'inverse inventé;
- rebuild ne casse pas les endpoints;
- anciennes fixtures/règles historiques continuent de satisfaire `J12`.

Le nouveau moteur ne doit pas modifier les quatre fixtures gelées.

Ne pas « nettoyer » les vieux noms de règle uniquement pour esthétique.

---

# 17 — MIGRATION DES ARTEFACTS AVANT TOUT REPLAY

X5 contient maintenant **29** preuves.

Les deux EC15 `TASK-0023` sont scellées et le runtime actuel les épelle encore.

AVANT tout scénario réel : migrer **toutes les destinations runtime courantes** de `TASK-0023-*` vers `TASK-0024-*` :

- H9;
- J12;
- K11;
- K12;
- L12;
- M12;
- N15;
- EC15.

Ajouter DR15 sous `TASK-0024`.

Après migration et avant replay :

- `protectedArtifactCount = 29`;
- `protectedDestinations = []`;
- `writesUnderItsOwnTaskOnly = true`;
- owning task = `TASK-0024`.

Ne modifier aucune des 29 preuves protégées.

Les preuves `TASK-0024` ne sont pas ajoutées à X5 tant que la tâche n'est pas `VERIFIED`.

---

# 18 — PREUVES CANONIQUES DE TASK-0024

Publier seulement comme nouvelles preuves obligatoires :

- `docs/performance/runs/TASK-0024-DR15-deterministic-relation-engine-webview2-pass1.json`
- `docs/performance/runs/TASK-0024-DR15-deterministic-relation-engine-webview2-pass2.json`

Et, parce que le store intra-relations est réellement modifié/migré :

- rejouer `J12` sous son nom `TASK-0024-J12-intrabrain-relations-regression-webview2.json`.

Ne pas rejouer K11/K12/L12/M12/N15/H9 sauf si leur code fonctionnel partagé est réellement modifié au-delà du simple renommage des destinations.

---

# 19 — DR1 À DR14 GELÉS

## DR1 — Rule catalog

Deux règles `core.*` exactement en v1, chacune avec id/version/output/type/sens/signaux/FR/EN/symétrie.

## DR2 — Deterministic truth

`core.identical-content/v1` produit uniquement des relations vraies `content-identical`, provenance `DETERMINISTIC`.

## DR3 — No pair explosion

Groupe de N contenus identiques non vides → N-1 arêtes canoniques, déterministes.

## DR4 — Empty files

Groupe de fichiers vides → zéro arête `content-identical` du moteur.

## DR5 — Suggestion boundary

`core.numbered-sibling-revision-candidate/v1` produit uniquement des suggestions, jamais une relation automatique.

## DR6 — Explainability

Chaque relation/suggestion `core.*` expose règle/version et une explication FR/EN; suggestion expose signaux structurés; aucun score.

## DR7 — Idempotence

Deux runs sans changement → mêmes sorties logiques, aucune duplication.

## DR8 — Approval preservation

Une suggestion `core.*` approuvée via le flux existant reste `APPROVED`; rerun ne recrée pas pending et ne change pas sa provenance.

## DR9 — Freshness

Changement de map/content generation invalide l'état `CURRENT`; les anciennes sorties core ne sont pas présentées comme actuelles. Rerun réconcilie correctement.

## DR10 — Brain isolation

Aucun état/résultat automatique ne traverse Alpha/Gamma; aucune relation interbrain créée.

## DR11 — Rebuild

Rebuild de map sans changement logique : endpoint resolution et sorties du moteur restent cohérentes après rerun; relations approuvées intactes.

## DR12 — Legacy regression

J12 historique passe sous `TASK-0024`; anciennes règles synthétiques/relations approuvées gardent leurs invariants.

## DR13 — Read-only / no AI

Aucune source modifiée; aucune donnée réelle; aucune IA, réseau, API, embedding, extraction, OCR, RAG ou vector DB.

## DR14 — Governance/X5

29 preuves X5 inchangées; runtime migré `TASK-0024`; main intacte; aucune preuve protégée réécrite.

---

# 20 — DR15 : VRAI TAURI / WEBVIEW2

Créer un fresh variant :

`task0024-dr15-<timestamp>-<suffix>`

Même variant pass1/pass2.

## PASS 1

1. vrai processus Tauri/WebView2;
2. fresh variant;
3. Alpha actif;
4. build map Alpha;
5. exécuter une vraie campagne de contenu Alpha pour disposer de `sha256-v1` actuel;
6. vérifier le moteur `dre-v1` initialement non exécuté/stale;
7. lancer **Analyser les relations** par vraie interaction utilisateur;
8. `keydownIsTrusted = true` / activation réelle selon le contrôle utilisé;
9. zéro clic programmatique de repli;
10. report `dre-v1` CURRENT;
11. les deux règles du catalogue sont présentes;
12. la règle content-identical est évaluée;
13. la règle numbered sibling est évaluée;
14. vérifier sur les données synthétiques de preuve prévues pour DR15 au moins une relation `content-identical` non vide et au moins une suggestion `revision`;
15. relation déterministe montre rule id/version et explication;
16. suggestion montre rule id/version, pourquoi et signaux;
17. aucun score visible/stocké dans le DTO de suggestion;
18. suggestion distincte visuellement et textuellement d'une relation;
19. approuver UNE suggestion DR15 via le mécanisme historique réel disponible;
20. elle devient exactement une relation `APPROVED`;
21. provenance jamais `AI`/`SUGGESTED`;
22. rerun moteur sans changement;
23. relation approuvée persiste;
24. suggestion approuvée ne revient pas pending;
25. relation content-identical n'est pas dupliquée;
26. source fingerprints avant/après inchangés;
27. relation store cross-brain inchangé;
28. X5 = 29, aucune destination protégée;
29. fermeture réelle du processus.

Les données spécialisées nécessaires à DR15 doivent être synthétiques et ne doivent PAS modifier les quatre fixtures historiques gelées. Utiliser un mécanisme de fixture/scénario temporaire explicitement TASK-0024 si nécessaire.

## PASS 2

30. nouveau vrai processus;
31. même variant;
32. relation APPROVED de pass1 persiste;
33. dernière exécution du moteur est retrouvée;
34. état `CURRENT` si map/content snapshot n'a pas changé;
35. aucune pending équivalente à l'approbation;
36. rerun moteur;
37. idempotence confirmée;
38. relation deterministic set identique;
39. approved set identique;
40. suggestion pending set identique hors suggestion approuvée;
41. aucun store cross-brain modifié;
42. source read-only;
43. X5 toujours 29;
44. fermeture réelle.

---

# 21 — TESTS RUST OBLIGATOIRES

Au minimum :

- catalogue règle complet;
- IDs/version uniques;
- aucune règle sans sens/explication;
- relation type validé;
- content-identical 2 fichiers;
- groupe 3 → 2 arêtes;
- groupe vide → 0;
- same-size/different-content → 0;
- numbered suggestion positive;
- tous les contre-exemples de §14;
- stable suggestion key;
- stable deterministic output;
- no score field/serialization;
- relation store migration;
- ancien store v2 → nouveau schema sans perte;
- legacy deterministic rows préservées;
- approved rows préservées;
- approved suggestion non recréée;
- collision established supprime suggestion;
- engine-owned reconciliation ne touche pas legacy;
- stale map/content snapshot;
- missing content generation;
- Alpha/Gamma isolation;
- map rebuild;
- cross store unchanged;
- read-only;
- 29 preuves protégées;
- aucune identité physique persistante ajoutée.

---

# 22 — TESTS TYPESCRIPT

Au minimum :

- libellé `content-identical` FR/EN;
- règle/version relation visible;
- suggestion explication FR/EN;
- signaux visibles sans score;
- stale/current UI;
- action Analyze relations accessible clavier;
- suggestion n'est pas accentuée comme relation établie;
- approved provenance reste APPROVED;
- runtime artifact ownership TASK-0024;
- X5 exact 29;
- protectedDestinations [] après migration;
- aucune preuve TASK-0024 protégée.

---

# 23 — F-043 / F-044 / F-045 / F-046

Si DR1–DR15 passent :

- `F-043 → IMPLEMENTED`;
- jamais `VERIFIED` par l'exécuteur.

Conserver :

- `F-044 = PROPOSED` : pas de file de révision complète;
- `F-045 = PROPOSED` : pas de mémoire de rejet;
- `F-046 = PROPOSED` : identité physique toujours absente; seule la fondation de contenu exact et la relation au sens strict `content-identical` progressent;
- `DEC-0013/F` reste bloquante.

Ne pas inventer un état PARTIAL si la matrice ne le permet pas.

---

# 24 — HORS SCOPE ABSOLU

Ne pas implémenter :

- `REJECTED` / mémoire de rejet;
- file « N relations à confirmer »;
- `Plus tard`;
- éditeur de règles;
- configuration de seuils;
- packs métier;
- relation automatique inter-cerveaux;
- identité physique persistante;
- FileId / VolumeSerialNumber stockés;
- fermeture B4;
- extraction de contenu;
- plein texte nouveau;
- RAG;
- vector DB;
- embeddings;
- GraphRAG;
- chatbot;
- LLM/BYOK;
- OCR;
- IA;
- permissions multi-utilisateur;
- watcher;
- recherche sémantique;
- données réelles;
- folder picker réel;
- H9/performance 100K;
- release/merge/main.

---

# 25 — VALIDATION FINALE

Exécuter :

- suite Rust complète;
- suite TypeScript complète;
- `pnpm check`;
- `pnpm build`;
- Tauri debug `--no-bundle`;
- DR1–DR14;
- DR15 pass1;
- DR15 pass2;
- J12 regression TASK-0024.

Si ICE incrémental B0 revient :

`CARGO_INCREMENTAL=0` autorisé.

Ne jamais :

- `cargo clean`;
- supprimer `target`;
- prétendre B0 corrigé.

---

# 26 — DOCUMENTATION / GOUVERNANCE

Si tout passe :

- `TASK-0024 = IMPLEMENTED`, jamais VERIFIED;
- `DEC-0026 = IMPLEMENTED — contrôle indépendant requis`;
- `F-043 = IMPLEMENTED`, contrôle indépendant requis;
- aucune autre fonction promue sans preuve.

Mettre à jour :

- `docs/tasks/TASK-0024-deterministic-relation-engine.md`;
- `docs/decisions/DEC-0026-deterministic-rule-runtime.md`;
- `docs/decisions/README.md`;
- `docs/product/FEATURE_MATRIX.md`;
- `docs/ai/CURRENT_STATE.md`;
- `docs/ai/NEXT_ACTION.md`;
- `docs/ai/HANDOFF.md`;
- `docs/ai/VALIDATION.md`;
- `docs/ai/CHANGELOG_AI.md`;
- `.orchestrator/RESULT.md`.

Ne pas modifier `.orchestrator/NEXT_PROMPT.md` : il est l'instruction reçue.

`NEXT_ACTION` : contrôle indépendant de TASK-0024.

Ne pas créer TASK-0025.

---

# 27 — RESULT.md

Remplacer `.orchestrator/RESULT.md` :

```text
TASK_ID: TASK-0024
AGENT: CODEX
RESULT: DONE | PAUSED | BLOCKED | FAILED
BRANCH: build/v0.2-a8-deterministic-relation-engine
FINAL_HEAD: <commit substantif>

SUMMARY:
-

VALIDATIONS:
-

IMPORTANT_FILES:
-

COMMIT:
PUSHED: yes/no

LIMITS_OR_BLOCKERS:
-
- DEC-0013/F physical identity persistence remains blocked
- F-044/F-045 not implemented

NEXT_ORCHESTRATOR_DECISION:
- contrôle indépendant TASK-0024
```

---

# 28 — GIT / STOP

Commit/push sur la nouvelle branche uniquement.

Interdit :

- main;
- merge;
- PR;
- release;
- tag;
- label;
- force push;
- rebase destructif;
- reset destructif;
- clean;
- suppression target;
- modification/suppression/renommage d'une des 29 preuves protégées;
- données réelles.

STOP/BLOCKED si :

- la base ne correspond pas;
- TASK-0024 ou DEC-0026 existe déjà;
- une fixture gelée doit être modifiée;
- une preuve X5 doit changer;
- le modèle nécessiterait une troisième provenance;
- une suggestion devrait être stockée comme relation pour réussir;
- une règle deterministic ne peut pas définir une proposition réellement impliquée par ses signaux;
- une identité physique persistante devient nécessaire;
- une dépendance externe/IA est nécessaire;
- une action destructive est nécessaire;
- les critères gelés devraient être affaiblis.

Appliquer ensuite le protocole de fermeture de session, push, arbre propre, rapport terminal court, puis arrêt.
