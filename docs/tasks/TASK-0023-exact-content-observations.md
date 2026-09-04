# TASK-0023 — Exact Content Observations Foundation

- **Date :** 2026-09-03
- **Branche :** `build/v0.2-a7-exact-content-observations`
- **Base contrôlée :** `cf51d631517956ffb3b0f72ac821eca95c1d3a3b`
- **Statut courant :** `IMPLEMENTED` — contrôle indépendant requis
- **Agent d'exécution :** Codex
- **GO :** prompt technique explicite `TASK-0023` du 2026-09-03
- **Décision :** [`DEC-0025`](../decisions/DEC-0025-exact-content-observation-boundary.md)
- **Prépare :** `F-043` et `F-046`, sans les implémenter entièrement

## 1. Objectif unique

Construire la première source réelle de faits observables de `DEC-0021` :
SHA-256 exact et streaming des fichiers indexés, génération atomique,
persistance locale par cerveau et affichage honnête de la dernière observation.

Une observation n'est ni une identité physique, ni une relation, ni une
suggestion. Aucun nœud n'est fusionné. Aucune IA ni extraction n'entre dans la
tranche.

## 2. Préconditions contrôlées

Avant la première modification : dépôt FileTopo, branche
`build/v0.2-a6-topographic-node-graph`, HEAD
`cf51d631517956ffb3b0f72ac821eca95c1d3a3b`, upstream aligné, arbre propre,
`main` à `91bbe90f0f99026c28cd345784d4f579a0016db2`, `TASK-0022 = VERIFIED`,
`ACTION-0036 = CLOSED`, `X8 = CLOSED`, 27 preuves X5 protégées, aucune tâche
`IN_PROGRESS` ni `IMPLEMENTED` en attente. `DEC-0025`, cette fiche et la branche
cible étaient absentes; aucune reprise partielle n'a été détectée.

## 3. Périmètre écrit

Dans le périmètre :

- dépendance RustCrypto `sha2` auditée et ajoutée de façon minimale;
- moteur SHA-256 streaming à mémoire bornée;
- store `brains/<brain_id>/signals/content.sqlite`, schéma versionné 1;
- campagnes datées, génération opaque et bascule atomique;
- sélection exclusive des nœuds `FILE` indexés et chemins confinés;
- métadonnées avant/après fichier et fingerprint global avant/après;
- statuts `HASHED`, `UNREADABLE`, `UNSTABLE_DURING_READ`, `UNSUPPORTED`;
- API backend d'observation, résumé, lecture par chemin, membres identiques et
  diagnostics;
- section minimale FR/EN dans le détail d'un fichier;
- tests synthétiques spécialisés hors des quatre fixtures gelées;
- migration des destinations runtime vers `TASK-0023-*`;
- scénario réel `EC15` en deux processus et deux artefacts seulement.

## 4. Stockage et modèle gelés

Le chemin logique est `brains/<brain_id>/signals/content.sqlite`, exposé par
un accesseur conceptuel `brain_content_signals_database(brain_id)`. Le magasin
est hors `map/`, hors `relations/`, hors `catalog.sqlite`, hors de la source,
et jamais partagé entre Alpha et Gamma.

`CONTENT_SIGNALS_SCHEMA_VERSION = 1`. Le schéma, les champs, contraintes et
statuts sont ceux de `DEC-0025`; aucune colonne `relation_id`, `provenance`,
`suggestion`, `approved`, `physical_file_id`, `VolumeSerialNumber` ou `FileId`.

La clé applicative durable d'une observation est son `relative_path` dans le
cerveau et sa génération, jamais `node_id`. Un chemin est slash-normalisé,
relatif, non vide pour un fichier, jamais absolu et sans composant `..`.

Le MVP peut ne conserver que la dernière génération committed. Son
remplacement complet est transactionnel; `current_generation_id` est écrit en
dernier dans la même transaction.

## 5. Sélection, lecture et fraîcheur gelées

Seuls les `MapNode.kind == FILE` de l'index courant sont hachés. Aucun dossier,
diagnostic/skipped, chemin absent de l'index, cible hors racine ou
symlink/reparse point n'est suivi.

Chaque chemin est reconstruit depuis la racine synthétique autorisée et le
chemin relatif validé. La containment est contrôlée avant ouverture. Le moteur
lit en blocs de taille bornée.

Taille et mtime sont capturées avant et après la lecture. Si elles changent,
le statut est `UNSTABLE_DURING_READ` et aucun digest n'est publié. Un seam de
test déterministe déclenche cette transition sans sommeil aléatoire.

Le fingerprint source existant est lu avant et après la campagne. S'il change,
la campagne échoue globalement avec `SOURCE_CHANGED_DURING_OBSERVATION` ou
équivalent et l'ancienne génération demeure courante.

Chaque nouvelle campagne relit les octets et recalcule les digests, même si la
taille et le mtime ressemblent à ceux de la campagne précédente. Les compteurs
`filesOpenedForHash`, `bytesRead` et `digestsComputed` rendent le rehash
observable.

## 6. API backend gelée

Responsabilités séparées :

- `observe_content(brain)` lance une génération;
- `content_observation_summary(brain)` lit l'état du store;
- `content_observation_for_path(brain, relative_path)` lit la dernière
  observation connue;
- `identical_content_members(brain, hash)` liste les occurrences dans ce seul
  cerveau;
- les diagnostics restent des faits de campagne.

Le report expose au minimum : `brainId`, `storePath`, `schemaVersion`,
`signalEngineVersion`, `generationId`, `observedAt`,
`sourceFingerprintBefore`, `sourceFingerprintAfter`, `sourceStable`,
`indexedFileCount`, `hashedCount`, `unreadableCount`, `unstableCount`,
`unsupportedCount`, `bytesRead`, `filesOpenedForHash`, `digestsComputed`,
`hashAlgorithm`, `readOnlyConfirmed`. `storePath` est relatif au sandbox.

## 7. UI minimale gelée

Le détail d'un nœud `FILE` porte une section « Observations de contenu » /
« Content observations ».

- `HASHED` : « SHA-256 observé », digest complet accessible, date/génération,
  nombre d'autres occurrences dans ce cerveau si positif, et « Cette
  observation ne crée aucune relation. »;
- aucune campagne : « Contenu non observé »;
- store persistant relu après redémarrage : « Dernière observation
  enregistrée », jamais « actuelle »;
- `UNREADABLE` / `UNSTABLE_DURING_READ` : diagnostic clair, aucun hash valide.

L'interface existante n'est pas redessinée. Les occurrences restent toutes
présentes. Aucun hash ne devient arête graphique.

## 8. Invariants relationnels gelés

Avant/après observation, les comptes et digests des relations déterministes,
approuvées et suggestions intra-cerveau ainsi que déterministes, approuvées et
pending inter-cerveaux restent identiques. `XB-S01` conserve exactement l'état
issu du seed historique d'un sandbox frais.

La campagne crée zéro hierarchy edge, zéro `RelationEdge`, zéro suggestion,
zéro relation cross et ne modifie aucun store relationnel. Une
`ContentObservation` ne porte jamais `DETERMINISTIC` ni `APPROVED`.

## 9. Fixtures et rebuild gelés

Les fixtures historiques `quasi-empty`, `deep`, `wide`, `mixed`, leurs
générateurs, seeds, chemins, contenus et limites sont intouchables. Les cas
spécialisés utilisent uniquement des répertoires temporaires synthétiques.

Un rebuild Alpha ne touche pas `signals/content.sqlite`, ne change ni
génération ni digest, ne crée aucune relation et le `relative_path` retrouve le
nœud courant.

Alpha et Gamma lisent la même fixture `quasi-empty`, mais observent dans deux
stores distincts. Un même chemin peut produire le même digest tout en gardant
deux `BrainNodeRef` et deux identités de cerveau distincts. Aucune conclusion
de « même fichier physique » n'est permise.

## 10. Dépendance et lockfile gelés

La dépendance directe autorisée est uniquement
`sha2 = { version = "=0.11.0", default-features = false }`, selon l'audit de
`DEC-0025`. Le diff `Cargo.toml`/`Cargo.lock` doit être minimal et la résolution
transitive vérifiée. `windows-sys` n'est pas ajouté. Toute dépendance imprévue
ou mise à jour opportuniste bloque la tâche.

## 11. Harnais et X5 gelés

Avant toute nouvelle preuve, les destinations courantes H9, J12, K11, K12,
L12, M12, N15 migrent vers `TASK-0023-*`. Elles ne sont pas rejouées par ce
seul renommage. Le nouveau `EC15` porte aussi `TASK-0023`.

`runtimeWriteOwnership().owningTaskId = TASK-0023`,
`protectedDestinations = []`, `writesUnderItsOwnTaskOnly = true`,
`SEALED_RUNTIME_DESTINATIONS = []`.

Les trois gardes X5 restent exactement à 27 noms, dans le même ordre. Les 27
preuves sont bit-for-bit gelées. Aucune preuve `TASK-0023` n'est protégée avant
contrôle indépendant.

Les deux seules nouvelles preuves obligatoires sont :

- `TASK-0023-EC15-exact-content-observations-webview2-pass1.json`;
- `TASK-0023-EC15-exact-content-observations-webview2-pass2.json`.

## 12. Critères EC1 à EC14 — IMMUTABLES APRÈS CE GEL

### EC1 — HASH ENGINE

SHA-256, moteur `sha256-v1`, bibliothèque vérifiée, aucune crypto maison,
streaming mémoire bornée.

### EC2 — EXACTITUDE

Vecteurs connus exacts : vide, `abc`, données binaires synthétiques; lecture en
plusieurs chunks incluse.

### EC3 — CONTENT EQUALITY

Même octets sous deux chemins : même SHA-256, deux occurrences distinctes,
aucune relation et aucune suggestion.

### EC4 — EMPTY FILES

Deux fichiers vides : même digest et contenu identique observé, sans relation
logique, suggestion ni copie probable.

### EC5 — SAME SIZE DIFFERENT BYTES

Même taille et octets différents : digests différents et aucun groupe de
contenu identique.

### EC6 — STORE

Schéma 1, store par cerveau, hors map/source, chemins relatifs seulement,
génération atomique et contraintes SQL effectives.

### EC7 — ISOLATION

Alpha/Gamma : stores différents, source commune autorisée, même chemin vers
même digest, aucun partage, `BrainNodeRef` distinct.

### EC8 — READ-ONLY

Fingerprint source identique avant/après, zéro artefact FileTopo sous le root
analysé et aucun octet source modifié.

### EC9 — NO RELATION SIDE EFFECT

Digests et comptes des stores relationnels inchangés; aucune arête créée.

### EC10 — REBUILD

Le rebuild map conserve store, génération, digest et résolution par chemin;
relations intactes.

### EC11 — FRESHNESS

Toute nouvelle campagne rehash réellement. Aucun cache fondé seulement sur
taille/mtime; changement de contenu au même chemin donne un nouveau digest.

### EC12 — UNSTABLE READ

Mutation synchronisée pendant lecture : statut `UNSTABLE_DURING_READ`, aucun
digest `HASHED`, aucune fausse vérité.

### EC13 — FAILURE ATOMICITY

Erreur globale avant commit : génération courante précédente intacte; aucune
génération partielle exposée.

### EC14 — GOVERNANCE / X5

27 preuves protégées inchangées, trois gardes exactement à 27, destinations
runtime `TASK-0023`, aucune destination protégée, aucune preuve `TASK-0022`
modifiée, `main` intacte.

## 13. EC15 — VRAI TAURI / WEBVIEW2, IMMUTABLE APRÈS CE GEL

Variant frais `task0023-ec15-<timestamp>-<suffix>`, identique pour les deux
passes, jamais supprimé. Vrai processus Tauri/WebView2. Interactions
probatoires : `keydownIsTrusted = true`, `activationIsTrusted = true` si
applicable, `programmaticClickCalls = 0`, `programmaticClickDispatches = 0`.

### PASS 1

1. Fresh variant.
2. Alpha actif.
3. Construire la map Alpha.
4. Capturer fingerprints source et état relationnel avant.
5. Lancer la vraie campagne Alpha.
6. Store `brains/brain-alpha/signals/content.sqlite`.
7. Schéma 1 et moteur `sha256-v1`.
8. `hashedCount` égale le nombre exact de nœuds `FILE` indexés.
9. Aucun dossier haché.
10. Tous les `HASHED` ont 64 hex minuscules.
11. Aucun chemin absolu dans store/report.
12. Fingerprints avant/après égaux.
13. `readOnlyConfirmed = true`.
14. Zéro artefact FileTopo sous fixture root.
15. Sélectionner un fichier Alpha par vraie interaction.
16. Section « Observations de contenu » visible.
17. SHA-256 complet accessible.
18. Date et génération disponibles.
19. Phrase « aucune relation » visible.
20. Stores/comptes/digests relationnels inchangés.
21. Aucune nouvelle arête relationnelle.
22. Ajouter Gamma par vraie frappe.
23. Construire puis observer Gamma.
24. Store Gamma distinct d'Alpha.
25. Sélectionner le même `relative_path` dans Gamma.
26. Digest Gamma égal au digest Alpha.
27. `BrainNodeRef` distinct.
28. Aucun store partagé ni relation interbrain créée.
29. Comptes cross exactement historiques.
30. Rebuild map Alpha.
31. Store, génération et digest Alpha survivent inchangés.
32. Fingerprint source toujours identique.
33. Aucune preuve protégée modifiée.
34. Fermeture réelle du processus.

### PASS 2

35. Nouveau processus et même variant.
36. Stores Alpha/Gamma présents.
37. Dernières générations persistées.
38. UI dit « dernière observation » ou formulation honnête.
39. Aucune affirmation implicite de fraîcheur.
40. Lancer une nouvelle campagne Alpha.
41. Nouveau `generationId`.
42. Mêmes digests puisque source inchangée.
43. `filesOpenedForHash > 0`.
44. `bytesRead > 0`.
45. `digestsComputed = hashedCount`.
46. Stores relationnels inchangés.
47. Fingerprints source inchangés.
48. X5 reste exactement 27 et aucun artefact historique n'est modifié.
49. Fermeture réelle du processus.

## 14. Tests obligatoires

Rust : vecteurs SHA-256, chunks, égalité/différence/vides, dossiers exclus,
chemins relatifs et traversal refusé, escape symlink/reparse selon plateforme,
schéma et CHECK SQL, isolation Alpha/Gamma, atomicité, campagne échouée,
changement de fichier, garde anti-cache metadata, lecture instable,
illisible sans digest, rebuild, stores relationnels intacts, fingerprint root,
absence d'identité physique persistée.

TypeScript : DTO, fichier `HASHED`, absence d'observation, `UNREADABLE`,
`UNSTABLE`, digest complet, FR, EN, phrase aucune relation, formulation stale,
aucune mutation de comptes, noms `TASK-0023`, ownership runtime, X5 à 27 et
aucune preuve `TASK-0023` protégée.

Validation finale : suite Rust complète, suite TypeScript complète, `pnpm
check`, `pnpm build`, Tauri debug `--no-bundle`, EC1–EC14 et EC15 deux passes.
`CARGO_INCREMENTAL=0` est permis si B0 réapparaît, sans clean ni suppression.

## 15. Hors périmètre absolu

Identité physique persistante et toute forme de `VolumeSerialNumber`/`FileId`;
B4, hydratation cloud, OneDrive/Dropbox/Google Drive/SMB/ReFS/inter-volume et
hardlinks produit; moteur F-043, règle `same-hash`, relation ou suggestion;
workflow F-044, mémoire F-045; IA/BYOK/OCR/extraction/RAG/GraphRAG; recherche
P-08, watcher, indexation incrémentale, vu/non-vu; permissions multiutilisateur;
collapse/focus F-042; vrai picker, données réelles; H9, seuil 100K, release.

`F-043`, `F-044`, `F-045` et `F-046` restent `PROPOSED`. Pour `F-046`, seule
la fondation de contenu exact est livrable; l'identité physique demeure
bloquée par `DEC-0013/F`. Aucun état `PARTIAL` n'est inventé.

## 16. Conditions de stop

`BLOCKED` sans contournement si l'état Git initial diverge, si `DEC-0025`
existe déjà, si une fixture ou preuve protégée devrait changer, si une identité
Windows persistante/B4/donnée réelle/root hors sandbox/relation/suggestion est
nécessaire, si taille+mtime devrait être crue, si la dépendance est non auditée
ou le lockfile incontrôlé, si une action destructive ou une modification de
`main` est nécessaire, ou si `EC1`–`EC15` devraient être réécrits après ce gel.

## 17. Historique d'état

| Date | État | Motif |
|---|---|---|
| 2026-09-03 | `PROPOSED` | Fiche créée depuis le prompt technique autoritatif, avant toute ligne de code |
| 2026-09-03 | `APPROVED` | Périmètre, décision, EC1–EC15, validations, limites et hors-scope intégralement écrits |
| 2026-09-03 | `IN_PROGRESS` | Gel prêt à être commité et poussé avant la première modification de code produit |
| 2026-09-03 | `IMPLEMENTED` | EC1–EC15 passés; deux processus WebView2 réels; aucun statut `VERIFIED` attribué par l'exécuteur |
| 2026-09-04 | `IMPLEMENTED` | `ACTION-0037` = `CHANGES_REQUIRED`, réserve unique `X9`; correction ciblée livrée, `X9` laissée `OPEN` par l'exécuteur |

## 18. État final attendu

Si et seulement si EC1–EC15 passent, `TASK-0023` devient `IMPLEMENTED`, jamais
`VERIFIED` par Codex. L'action unique suivante est le contrôle indépendant de
`TASK-0023`. L'orchestrateur décidera ensuite de la prochaine tranche; aucune
`TASK-0024` n'est créée ici.

## 19. Résultat d'exécution

Le gel `711071c` a été poussé avant tout code produit. L'implémentation fournit
`sha256-v1` par `sha2 0.11.0`, un buffer streaming borné à 64 KiB, le schéma
SQLite 1 par cerveau, la bascule transactionnelle de génération, les statuts
de lecture, les compteurs de rehash, les commandes Tauri et la section UI
FR/EN. Aucun contenu, chemin absolu, identifiant physique, relation,
suggestion ou provenance n'est persisté dans le store de signaux.

Validations exécutées : 171 tests Rust, 208 tests TypeScript, `pnpm check`,
`pnpm build`, Tauri debug `--no-bundle`, puis EC15 pass1/pass2 dans WebView2
`152.0.4191.62` sur une même variante fraîche. La passe 2 ouvre 8 fichiers,
relit 1 424 octets et recalcule 8 digests malgré la génération persistée.

Les deux seules nouvelles preuves sont les artefacts EC15 prévus. Les 27
preuves X5 restent bit-for-bit inchangées et non remplacées;
`runtimeWriteOwnership()` publie `TASK-0023`, aucune destination protégée et
`writesUnderItsOwnTaskOnly = true`.

`F-043`, `F-044`, `F-045` et `F-046` restent `PROPOSED`. La fondation de
contenu exact de `F-046` existe désormais, mais l'identité physique persistante
reste non implémentée et bloquée par `DEC-0013/F`. La tâche attend un contrôle
indépendant et ne se déclare pas `VERIFIED`.

## 20. Correction ciblée `X9` — 2026-09-04

Portée : **la seule réserve `X9`** de
[`ACTION-0037`](../reviews/ACTION-0037-independent-control.md). Aucun autre
élément accepté de `TASK-0023` n'est rouvert; `EC1`–`EC15`, les quatre fixtures
gelées et les 27 preuves protégées restent intouchés.

**Défaut corrigé.** Le fingerprint **global de campagne** appelait encore
`fixtures::fingerprint(root)` : cette fonction suit un symlink fichier par
`fs::read(path)`, donc peut lire hors de la racine analysée, et accumule tous
les contenus dans un `Vec<u8>`, donc n'est pas à mémoire bornée à l'échelle
d'un cerveau.

**Nouvelle primitive.** `content_signals::content_source_fingerprint` publie
`sha256-tree-v1:<64 hex minuscules>`. Pour chaque entrée sous la racine, elle
mêle de façon déterministe le `relative_path` normalisé, le type d'entrée, la
taille et l'horodatage de modification s'il existe. Un fichier régulier autorisé
est lu **en streaming** par un unique tampon réutilisé de 64 KiB; un répertoire
normal est parcouru dans un ordre déterministe; un symlink, une jonction ou
tout autre reparse point est enregistré comme **lien** — sa cible n'est jamais
ouverte, lue, parcourue ni canonicalisée — et un type d'entrée non
interprétable est traité comme **non traversable**. `fs::read` de contenu et
accumulation globale d'octets sont exclus par construction.

**Deux rôles distincts, jamais confondus :** `sha256-tree-v1` est l'empreinte
de l'arbre source d'une campagne; `sha256-v1` reste le digest du contenu d'un
fichier. `fixtures::fingerprint` (`fnv1a64:…`) est **inchangée** et conserve son
rôle historique pour les fixtures gelées et les preuves
`TASK-0016`..`TASK-0022`; `X9` ne la rend pas générique.

**Branchement.** Seuls les deux usages de `observe_root_with_hook` changent :
`sourceFingerprintBefore` et `sourceFingerprintAfter` proviennent désormais de
la nouvelle primitive. Le digest de fichier, le schéma `content.sqlite`, les
relations, la map, le catalogue et l'identité sont inchangés. L'invariant
`fingerprint before != fingerprint after` → `SOURCE_CHANGED_DURING_OBSERVATION`
→ génération non commitée → génération courante intacte est conservé, et
`EC12`/`EC13` passent.

**Preuves ajoutées.** Jonction Windows réelle créée sans privilège par
`mklink /J` : classée comme lien, et l'agrandissement de sa cible hors racine
ne change pas l'empreinte — l'ancien moteur échouait sur ce même arbre en
`Accès refusé`. Détection déterministe de `FILE_ATTRIBUTE_REPARSE_POINT` et
classification pure des liens, indépendantes de tout privilège. Preuve de
streaming par compteur de lectures sur un fichier de `2 × 64 KiB + 17` octets :
au moins trois chunks, chacun borné, somme égale à la taille. Déterminisme,
sensibilité et indépendance de chemin. Quatre équivalents `#[cfg(unix)]` sont
écrits mais **non compilés sur cet hôte Windows**.

**`EC15` rejouée.** Le moteur publié par `sourceFingerprintBefore`/`After`
ayant changé, les deux seules preuves `TASK-0023-EC15-*` ont été régénérées sur
la variante fraîche `task0023-ec15-x9-20260904145356-6ebb99`, identique pour
les deux passes. Aucune preuve `TASK-0016`..`TASK-0022` n'est touchée. `X5`
reste exactement **27**.

**État après correction :** `TASK-0023` reste `IMPLEMENTED`, `X9` reste
`OPEN`, `ACTION-0037` reste `CHANGES_REQUIRED`. L'exécuteur ne clôt pas sa
propre réserve et ne s'attribue pas `VERIFIED`. Action unique suivante :
re-contrôle indépendant ciblé `X9`.
