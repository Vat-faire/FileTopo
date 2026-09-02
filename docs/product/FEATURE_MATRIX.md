# Matrice fonctionnelle de reconstruction

Les états portent sur la cible réelle, pas sur les anciennes phases. Aucune
ligne n'est VERIFIED par TASK-0010; les preuves sont des constats statiques et
les tests applicatifs n'ont pas été rejoués.

La colonne « Baseline TASK-0011 » reporte la classification arrêtée par
[REQUIREMENTS_BASELINE.md](REQUIREMENTS_BASELINE.md), qui porte aussi le
motif, la dépendance amont et le critère d'acceptation mesurable de chaque
fonction. Cette classification est `PROPOSED` : elle attend l'examen humain.
Les preuves et constats ci-dessous sont inchangés.

> **Amendement du 2026-08-31 — `TASK-0015`, décision
> [DEC-0015](../decisions/DEC-0015-product-parity-and-layout-scope.md) `C`.**
>
> **La référence produit a changé.** Les colonnes « Prototype actuel »,
> « Preuve dans le dépôt » et « Écart » de ce tableau décrivent l'**ancienne
> version publique de FileTopo**, désormais établie comme **prototype et audit
> technique** — **pas** comme référence produit. La **référence fonctionnelle
> est CarteTopo**, et le contrat exigible est
> [CARTETOPO_FUNCTIONAL_PARITY.md](CARTETOPO_FUNCTIONAL_PARITY.md).
> **Ces constats d'audit restent valides dans leur portée d'origine** et ne
> sont pas retouchés : ils disent ce que le prototype fait, jamais ce que le
> produit doit faire.
>
> **Quatre classifications changent** — `F-013`, `F-017`, `F-018`, `F-019`
> passent d'`ULTÉRIEUR` à **`MVP`**. La valeur d'origine est conservée et
> visible dans la colonne. **Aucune fonction ne descend, aucune n'est ajoutée :
> la matrice reste à 39 lignes.** `F-021`, `F-037`, `F-038` et `F-039` restent
> **`DIFFÉRÉ`**.
>
> La colonne « Priorité » est celle de l'audit d'origine et **n'est pas
> retouchée**; les écarts avec la classification courante sont déclarés en §4
> de [REQUIREMENTS_BASELINE.md](REQUIREMENTS_BASELINE.md).

> **Amendement du 2026-09-01 — `DEC-0017`, direction produit.**
>
> **Une ligne est ajoutée : `F-040` — vue composée multi-cerveaux**, classée
> **`MVP`**. C'est une **extension produit décidée**, déclarée comme telle, et
> **non** une reclassification silencieuse : aucune ligne existante ne change
> de classification, aucune ne descend, aucune ne disparaît.
>
> **La matrice passe de 39 à 40 lignes.** Répartition : **`MVP` 36**,
> **`ULTÉRIEUR` 0**, **`DIFFÉRÉ` 4**, **total 40**.
>
> **`F-040` n'est pas une exigence de parité.** L'exigence de parité
> correspondante reste **`P-20`**, entière et inchangée. Le contrat
> [CARTETOPO_FUNCTIONAL_PARITY.md](CARTETOPO_FUNCTIONAL_PARITY.md) **n'est pas
> retouché** et conserve ses 22 exigences.
>
> La colonne « Prototype actuel » de `F-040` décrit, comme toutes les autres,
> l'**ancienne version publique** — audit technique, jamais référence produit.

> **Amendement du 2026-09-02 — `DEC-0018`, direction produit.**
>
> **Une ligne est ajoutée : `F-041` — relations inter-cerveaux explicites**,
> classée **`MVP`**. C'est une **extension produit décidée**, déclarée comme
> telle, et **non** une reclassification silencieuse : aucune ligne existante
> ne change de classification, aucune ne descend, aucune ne disparaît.
>
> **La matrice passe de 40 à 41 lignes.** Répartition : **`MVP` 37**,
> **`ULTÉRIEUR` 0**, **`DIFFÉRÉ` 4**, **total 41**.
>
> **`F-041` n'est pas une exigence de parité.** `P-04`, `P-05`, `P-06` et
> `P-20` restent entières et inchangées, et le contrat
> [CARTETOPO_FUNCTIONAL_PARITY.md](CARTETOPO_FUNCTIONAL_PARITY.md) **n'est pas
> retouché** : il conserve ses 22 exigences.
>
> **Une relation inter-cerveaux ne fusionne jamais deux cerveaux**, n'est jamais
> créée par le seul fait d'un affichage, et n'invente jamais son inverse.

| Identifiant | Fonction | Comportement cible | Prototype actuel | Preuve dans le dépôt | Écart | Priorité | Phase | État | Critères d'acceptation | Baseline TASK-0011 |
|---|---|---|---|---|---|---|---|---|---|---|
| F-001 | Choix de racine | Sélecteur Windows guidé | Présent | src-tauri/src/lib.rs:136 | Flux cerveau incomplet | P0 | 2 | IMPLEMENTED | Sélection synthétique testée, annulation sûre | `MVP` |
| F-002 | Cerveau indépendant | Racine, index et état isolés | Présent mais incomplet | registry.rs:60; lib.rs:229 | Préférences et reprise manquent | P0 | 3 | PROPOSED | Deux cerveaux ne partagent aucun état | `MVP` |
| F-003 | Scan hiérarchique | Dossiers, fichiers, noms, métadonnées | Présent | scanner.rs:46 | Robustesse à étendre | P0 | 2 | IMPLEMENTED | Arbre synthétique exact, sources inchangées | `MVP` |
| F-004 | Identifiants stables | Survivre aux changements raisonnables | IDs recréés par parcours | scanner.rs:68; index.rs:85 | Instables au déplacement | P0 | 2 | PROPOSED | Renommage/déplacement corrélé sans faux positif | `MVP` |
| F-005 | Exclusions | Règles sûres, visibles et configurables | Reparse points ignorés | scanner.rs:121 | Pas de politique complète | P0 | 2 | PROPOSED | Exclusions testées et explicables | `MVP` |
| F-006 | Index reconstructible | Refaire depuis la source sans perte | Schéma versionné, remplacement complet | index.rs:70,75 | Migration/reprise à préciser | P0 | 3 | PROPOSED | Reconstruction déterministe et atomique | `MVP` |
| F-007 | Carte en blocs | Blocs issus de la hiérarchie réelle | Points en spirale | synthetic.rs:79 | À remplacer | P0 | 4 | PROPOSED | Parent/enfants lisibles sur arbres variés | `MVP` |
| F-008 | Adaptation aux arbres | Disposition générique | Échantillonnage uniforme | TerrainMap.tsx:19 | Hiérarchie ignorée | P0 | 4 | PROPOSED | Fixtures de formes différentes restent lisibles | `MVP` |
| F-009 | Panoramique | Déplacer la carte | Aucune preuve trouvée | TerrainMap.tsx | Manquant | P1 | 5 | PROPOSED | Souris, pavé et clavier testés | `MVP` |
| F-010 | Zoom | Zoom avant/arrière | Niveau de détail seulement | TerrainMap.tsx:77 | Pas de transformation de vue | P1 | 5 | PROPOSED | Zoom borné et centré | `MVP` |
| F-011 | Ajuster à l'écran | Cadrer carte ou sélection | Aucune preuve trouvée | TerrainMap.tsx | Manquant | P1 | 5 | PROPOSED | Toute carte peut être recadrée | `MVP` |
| F-012 | Réinitialiser la vue | Restaurer vue initiale/enregistrée | Aucune preuve trouvée | App.tsx | Manquant | P1 | 5 | PROPOSED | Commande déterministe et accessible | `MVP` |
| F-013 | Panneau latéral | Masquer/afficher sans perte | Panneau fixe | App.tsx:358 | Commande et persistance manquent | P1 | 5 | PROPOSED | État conservé au redémarrage | **`MVP`** (parité `P-12`) — *origine : `ULTÉRIEUR`* |
| F-014 | Légende | Couleurs expliquées | Légende dossiers/fichiers/en ligne | App.tsx:345 | Sémantique limitée | P1 | 5 | IMPLEMENTED | Légende accessible suit les données | `MVP` |
| F-015 | Sélection | Sélectionner un bloc | Points/liste sélectionnables | App.tsx:244; TerrainMap.tsx | Pas un bloc hiérarchique | P0 | 5 | IMPLEMENTED | Sélection synchronisée clavier/souris | `MVP` |
| F-016 | Relations hiérarchiques | Parent et enfants directs visibles | parent_id stocké | domain.rs:31 | Non visualisé | P0 | 5 | PROPOSED | Arêtes et panneau concordent avec l'arbre | `MVP` |
| F-017 | Relations transversales | Provenance explicite, jamais inventée | Aucun modèle observé | domain.rs | Manquant | P1 | 5 | PROPOSED | Chaque relation expose type et provenance | **`MVP`** (parité `P-04`) — *origine : `ULTÉRIEUR`* |
| F-018 | Mise en évidence | Accentuer liés, atténuer non liés | Sélection agrandit un point | TerrainMap.tsx:59 | Relations non prises en compte | P1 | 5 | PROPOSED | États visuels accessibles et testés | **`MVP`** (parité `P-06`) — *origine : `ULTÉRIEUR`* |
| F-019 | Relations entrantes/sortantes | Distinguer directions | Aucune preuve trouvée | domain.rs | Manquant | P2 | 5 | PROPOSED | Panneau et carte donnent mêmes comptes | **`MVP`** (parité `P-05`) — *origine : `ULTÉRIEUR`* |
| F-020 | Recherche nom/chemin | Recherche locale simple | Présente et paginée | index.rs:128; App.tsx:113 | Sujet/rôle absent | P0 | 5 | IMPLEMENTED | Résultats exacts, bornés et cités | `MVP` |
| F-021 | Recherche sujet/rôle | Exploiter contenu/enrichissement | Non présente | aucun extracteur | Future | P2 | 10 | DEFERRED | Sources citées, fonctionnement local | `DIFFÉRÉ` |
| F-022 | Filtres dynamiques | Tout, nouveaux, non vus et facettes | Type, en ligne, non vus | App.tsx:366 | Nouveaux et facettes manquent | P1 | 5 | PROPOSED | Filtres dérivés des données et combinables | `MVP` |
| F-023 | Détails | Chemin, dates, parent, enfants, état | Type, taille, nombre d'enfants | App.tsx:389 | Panneau insuffisant | P0 | 5 | PROPOSED | Toutes propriétés essentielles cohérentes | `MVP` |
| F-024 | Copier le chemin | Presse-papiers explicite | Aucune preuve trouvée | App.tsx | Manquant | P1 | 5 | PROPOSED | Copie exacte sans journal sensible | `MVP` |
| F-025 | Ouvrir dans Explorateur | Dossier ouvert/fichier sélectionné | Présent, confinement vérifié par code | lib.rs:310 | Non rejoué dans TASK-0010 | P0 | 5 | IMPLEMENTED | Essai Windows synthétique et erreurs gérées | `MVP` |
| F-026 | Contenu du dossier | Enfants directs consultables | Liste globale filtrée | App.tsx:378 | Vue contextuelle manque | P1 | 5 | PROPOSED | Liste exacte, paginée et navigable | `MVP` |
| F-027 | Journal de changements | Créations, modifications, mouvements, renommages, suppressions | Absent | replace_nodes dans index.rs | Manquant | P0 | 6 | PROPOSED | Événements synthétiques complets et ordonnés | `MVP` |
| F-028 | Vu/non vu | Élément/changement et tout marquer vu | Marquage d'un nœud vu | index.rs:178; App.tsx:244 | Pas changements ni tout marquer | P1 | 6 | PROPOSED | Persistance et commandes unitaires/globales | `MVP` |
| F-029 | Actualisation manuelle | Rafraîchir le cerveau | Réindexation manuelle complète | App.tsx:215 | Destructive pour l'index courant | P0 | 6 | PROPOSED | Mise à jour sûre avec résumé de changements | `MVP` |
| F-030 | Surveillance automatique | Observer sans rescanner inutilement | Absente | aucune commande watcher dans lib.rs | Manquant | P0 | 6 | PROPOSED | Rafales, pertes et reprise testées | `MVP` |
| F-031 | Mise à jour incrémentale | Modifier seulement les éléments touchés | DELETE puis réinsertion | index.rs:75-110 | À remplacer | P0 | 6 | PROPOSED | Coût proportionnel aux changements | `MVP` |
| F-032 | Indisponibilité temporaire | Conserver le dernier état fiable | Diagnostics de lecture | scanner.rs:92 | Reprise complète non prouvée | P0 | 6 | PROPOSED | Lecteur absent ne vide pas l'index | `MVP` |
| F-033 | Personnalisation | Nom, couleur, icône, préférences | Nom/couleur générés, pas d'icône | registry.rs:99-115 | Non configurable | P1 | 7 | PROPOSED | Valeurs éditables et persistantes | `MVP` |
| F-034 | Plusieurs cerveaux | Sélection et chargement indépendants | Onglets enregistrés | App.tsx:148,310 | Onglet ne charge pas l'index | P0 | 7 | PROPOSED | Redémarrage et bascule restaurent chaque carte | `MVP` |
| F-035 | FR/EN | Interface bilingue persistante | Présente | App.tsx; lib/locale.ts | Revalidation requise | P1 | 8 | IMPLEMENTED | Tests des deux langues et repli | `MVP` |
| F-036 | Accessibilité | Clavier, contraste, alternatives | Liste DOM et attributs partiels | App.tsx; TerrainMap.tsx | Audit absent | P1 | 8 | PROPOSED | Audit automatisé, clavier et manuel | `MVP` |
| F-037 | Extraction de contenu | Formats approuvés, facultatifs | Absente | aucun extracteur | Hors MVP structurel | P2 | 10 | DEFERRED | Provenance, opt-in et erreurs par format | `DIFFÉRÉ` |
| F-038 | RAG cité | Réponses avec citations et choix fournisseur | Absent | aucune dépendance IA | Facultatif | P3 | 11 | DEFERRED | Réponse locale/citée, consentement distant | `DIFFÉRÉ` |
| F-039 | GraphRAG | Seulement si besoin démontré | Absent | aucune dépendance graphe IA | Facultatif | P3 | 12 | DEFERRED | Gain mesuré après RAG fiable | `DIFFÉRÉ` |
| F-040 | Vue composée multi-cerveaux | Un ou plusieurs cerveaux indépendants dans le même graphique, sans fusion | Absent | aucun catalogue de cerveaux dans le prototype | Manquant | P1 | 7 | PROPOSED | Deux cerveaux affichés ensemble ne partagent aucun stockage ni aucun état, et chaque élément porte son cerveau d'origine | **`MVP`** (extension produit `DEC-0017`) |
| F-041 | Relations inter-cerveaux explicites | Un nœud d'un cerveau relié explicitement à un nœud d'un autre cerveau, avec provenance, sans jamais fusionner les deux | Absent | aucune relation entre cerveaux dans le prototype | Manquant | P1 | 7 | PROPOSED | Une relation `A → B` porte deux extrémités, un type et une provenance `DETERMINISTIC` ou `APPROVED`; elle survit à une reconstruction d'index; elle n'implique jamais `B → A`; et la ressemblance de noms ou de fichiers n'en crée aucune | **`MVP`** (extension produit `DEC-0018`) |
