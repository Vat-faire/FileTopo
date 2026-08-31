# DEC-0012 — Limite architecturale de l'IA

- **Date :** 2026-08-31
- **Statut :** `PROPOSED`
- **Phase :** 1
- **Décideur :** Sébastien — **décision non prise.** Fiche soumise à la porte
  P2 de [TASK-0011](../tasks/TASK-0011-functional-architecture-baseline.md).
- **replaced_by :** —

> Cette fiche **compare** et **classe**. Elle ne tranche pas.

## Contexte

`PROJECT_VISION.md` est explicite : FileTopo doit être « utilisable sans
compte, connexion Internet ou modèle d'IA », et « Extraction de contenu, OCR,
IA, RAG et GraphRAG sont hors du MVP structurel ».

Le risque n'est pas de construire l'IA trop tôt — la
[baseline fonctionnelle](../product/REQUIREMENTS_BASELINE.md) classe déjà
F-037, F-038 et F-039 en `DIFFÉRÉ`. Le risque réel est **architectural** :
placer la frontière au mauvais endroit, de sorte que l'ajout ultérieur d'une
couche facultative impose une refonte, ou pire, que son absence devienne
anormale.

`DEC-0006` nomme d'ailleurs « étendre le MVP vers l'IA trop tôt » parmi les
risques de la reconstruction.

La question est donc : **où passe la ligne, et quelle forme a-t-elle ?**

## Options examinées

| Option | Avantages | Inconvénients |
|--------|-----------|---------------|
| **F-A — Frontière au niveau de la couche de données** : les couches L-TEXT et suivantes de [FORMAT_MATRIX.md](../architecture/FORMAT_MATRIX.md) écrivent dans des tables séparées, dans le même espace de données du cerveau; le noyau structurel ignore leur existence | Ajout ultérieur sans refonte : une nouvelle table, aucune modification du noyau; la reconstruction de l'index structurel n'est pas gênée; couplage faible et vérifiable (le noyau ne référence aucune table d'enrichissement) | Le schéma du cerveau grossit avec des tables inutilisées au MVP; la migration doit gérer des tables qui peuvent être absentes; l'espace de données mélange deux natures de contenu |
| **F-B — Frontière au niveau du processus** : l'enrichissement et le RAG vivent dans un composant séparé, communiquant par une interface explicite; leur absence est l'état par défaut du produit | Séparation la plus nette : l'absence de la couche est **normale par construction**, pas par configuration; le noyau est distribuable et testable seul; une défaillance de la couche facultative ne peut pas dégrader le produit; les fournisseurs et clés restent confinés dans un composant identifiable | Coût d'une interface et d'un cycle de vie de composant à écrire dès le MVP, alors que rien ne l'utilise; risque de concevoir une abstraction pour un besoin non encore formulé, donc de la concevoir mal |
| **F-C — Frontière au niveau de la fonctionnalité** : tout dans le même noyau, activé par des drapeaux de configuration | Coût initial nul; aucune interface à écrire | Le couplage devient invisible et progressif : un drapeau se teste rarement dans les deux positions, et le chemin « désactivé » finit par régresser; c'est le mécanisme par lequel une fonction facultative devient nécessaire; contredit l'exigence « rendre leur absence normale » |
| **F-D — F-A au MVP, F-B au moment où une couche est réellement construite** : le noyau ne référence aucune table d'enrichissement, mais aucune interface de processus n'est écrite tant qu'aucune couche n'existe | Coût initial minimal; l'exigence de découplage est tenue **immédiatement** par la règle de non-référence; l'interface est conçue quand le besoin est connu, donc conçue juste; réversible | Repose sur une règle qui doit être **contrôlée**, pas seulement énoncée; le passage de F-A à F-B est un travail réel qui sera tentant de reporter |

## Décision

**Aucune.** Classement recommandé, soumis à Sébastien :

1. **F-D** (recommandé);
2. **F-B** (correcte, mais coûteuse avant tout besoin établi);
3. **F-A** (acceptable, sans le chemin vers F-B);
4. **F-C** (rejetée : elle rend le couplage invisible).

**Règle proposée, testable, valable dès le MVP :**

> Aucun composant du noyau structurel ne référence une table, un module ou une
> configuration d'enrichissement, d'embeddings, de RAG ou de GraphRAG. Le
> noyau doit se compiler, se tester et se distribuer avec ces éléments
> entièrement absents.

Cette règle a l'avantage d'être **vérifiable mécaniquement** : elle se
contrôle par une recherche de symboles, pas par une revue d'intention.

## Motif

**F-D plutôt que F-B** parce que concevoir une interface de processus
aujourd'hui, pour une couche dont ni le besoin, ni les données, ni les
fournisseurs ne sont établis, revient à figer des hypothèses non vérifiées.
`DATA_PIPELINE_VISION.md` place le GraphRAG après « un index structurel
fiable, une recherche locale mesurée et un RAG hybride cité » — c'est-à-dire
après trois jalons dont aucun n'existe. Une interface conçue avant eux serait
conçue à l'aveugle.

**F-D plutôt que F-A** parce que F-A seule n'a pas de chemin de sortie : elle
laisse le couplage se resserrer au fil des ajouts. F-D est F-A **plus** un
critère explicite de passage à F-B.

**F-C est rejetée** parce qu'elle produit exactement le défaut que le projet
cherche à éviter. Un drapeau de configuration ne rend pas une absence
normale : il rend une présence conditionnelle. Le chemin « désactivé » se
teste rarement, régresse, et un jour l'utilisateur qui n'a pas d'IA découvre
un produit dégradé. La vision exige l'inverse : « Le produit reste utile hors
ligne et sans IA. »

**Pourquoi la règle est formulée comme une contrainte de référence.** « Rendre
l'absence normale » n'est pas contrôlable. « Le noyau ne référence aucun
symbole d'enrichissement » l'est. La formulation choisie transforme une
intention en critère de rejet.

## Conséquences

- **Ce qui reste dans le MVP structurel :** métadonnées (couche L-META),
  index reconstructible, carte hiérarchique, navigation, détails, recherche
  sur noms et chemins, filtres, journal de changements, surveillance, cerveaux
  isolés, personnalisation du cerveau, accessibilité, bilinguisme. Soit les 31
  fonctions classées `MVP`
  par [REQUIREMENTS_BASELINE.md](../product/REQUIREMENTS_BASELINE.md).
- **Ce qui est au-delà de la frontière :** L-TEXT, L-MAIL, L-OCR, L-ENRICH,
  embeddings, recherche vectorielle, RAG, GraphRAG, et **toute relation
  suggérée d'origine statistique**.
- **Cas limite à trancher explicitement : les relations transversales
  déterministes (F-017).** Elles ne relèvent pas de l'IA — une règle
  documentée et versionnée n'est pas un modèle — mais elles arrivent par la
  même porte. La proposition est de les placer **du côté du noyau**, à
  condition que leur règle soit nommée, versionnée et consultable, et que
  toute relation dont l'origine est statistique soit du côté facultatif. Ce
  point mérite l'attention de Sébastien : c'est la seule frontière de cette
  fiche qui ne soit pas nette.
- **Aucune dépendance d'IA n'est ajoutée** au dépôt. `package.json` et
  `Cargo.toml` n'en contiennent aucune au commit `01e6860f`, et cette fiche
  n'en propose aucune.
- Toute construction ultérieure d'une couche au-delà de la frontière exige :
  un GO humain distinct, une analyse de menace renouvelée
  ([threat-model.md](../security/threat-model.md) place explicitement l'IA,
  l'OCR et le contenu des documents « hors portée du MVP », leur ajout
  imposant « une nouvelle analyse de menace avant implémentation »), et un
  consentement utilisateur explicite avant tout transfert distant.
- Le contrôle de la règle proposée devient un test de la catégorie T1 de
  [TEST_STRATEGY.md](../architecture/TEST_STRATEGY.md).

## Preuves

| # | Élément | Source | Consultée le |
|---|---|---|---|
| P1 | « gratuit, général, open source, local d'abord et utilisable sans compte, connexion Internet ou modèle d'IA »; « Extraction de contenu, OCR, IA, RAG et GraphRAG sont hors du MVP structurel »; « Le produit reste utile hors ligne et sans IA. » | [PROJECT_VISION.md](../../PROJECT_VISION.md), dépôt public | 2026-08-31 |
| P2 | GraphRAG « à étudier seulement après un index structurel fiable, une recherche locale mesurée et un RAG hybride cité »; « Son adoption exige un besoin démontré, un modèle de provenance, un coût acceptable, une évaluation sur données synthétiques et une validation humaine des relations. » | [DATA_PIPELINE_VISION.md](../architecture/DATA_PIPELINE_VISION.md) | 2026-08-31 |
| P3 | « Comptes multiples, synchronisation, serveur, télémétrie, OCR, contenu des documents, IA, chiffrement applicatif... Leur ajout imposerait une nouvelle analyse de menace avant implémentation. » | [threat-model.md](../security/threat-model.md) | 2026-08-31 |
| P4 | « étendre le MVP vers l'IA trop tôt » est nommé comme risque de la reconstruction | [DEC-0006](DEC-0006-rebuild-in-place.md) | 2026-08-31 |
| P5 | Constat de code au commit `01e6860f` : aucune dépendance d'IA, d'embeddings ni de graphe dans les manifestes | `package.json`, `src-tauri/Cargo.toml` | 2026-08-31 |

**Absence de source officielle externe, déclarée.** Contrairement aux fiches
`DEC-0007` à `DEC-0011`, cette décision **ne cite aucune source primaire
externe** : c'est une décision de périmètre de produit, pas une décision
contrainte par une plateforme ou une spécification. Conformément à
`TASK-0011` §8 — « Une décision sans source officielle est déclarée
**incertaine** et son risque est écrit » — elle est déclarée **incertaine**,
et son risque est le suivant.

**Risque écrit.** Placer la frontière au mauvais endroit ne se constate qu'au
moment d'ajouter la première couche facultative, c'est-à-dire tard. Si F-D est
retenue et que la règle de non-référence n'est **pas** contrôlée
mécaniquement, le résultat sera indistinguable de F-C : un couplage progressif
et invisible. La règle sans son test ne vaut rien.

## Limites

- **Non testé.** Aucune couche facultative n'existe, donc la frontière n'a
  jamais été éprouvée par un ajout réel.
- Le classement suppose que le besoin d'enrichissement se précisera; si le
  projet décidait de ne jamais aller au-delà de L-META, F-A suffirait et F-D
  serait un surcoût inutile.
- Le placement des relations transversales déterministes est la partie la
  moins solide de cette fiche, et elle est signalée comme telle.
- Aucun fournisseur, aucun modèle, aucune bibliothèque d'IA n'est évalué,
  nommé ni recommandé ici — ce serait hors du périmètre de `TASK-0011`.
