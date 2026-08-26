# DEC-0001 — Nom public du projet : FileTopo

- **Date :** 2026-08-25
- **Statut :** `VERIFIED`
- **Phase :** 1 (complément, via `TASK-0003`)
- **Décideur :** orchestrateur, sous l'autorisation permanente donnée par
  l'utilisateur le 2026-08-25
- **replaced_by :** —

## Contexte

Le projet a besoin d'un nom stable avant l'architecture et le développement.
`TASK-0002` avait vérifié sept candidats sur npm, PyPI, `crates.io`, GitHub et
le RDAP `.com`, mais n'avait couvert ni les bases officielles de marques ni
les TLD complémentaires. `TASK-0003` a complété cette diligence en lecture
seule, sans réservation, achat, compte ni publication.

Cette décision choisit un **nom de travail public réversible**. Elle
n'autorise pas la fixation irréversible du nom par l'achat d'un domaine, le
dépôt d'une marque ou la création d'un dépôt public.

## Options examinées

| Option | Avantages | Inconvénients / décision |
|--------|-----------|--------------------------|
| `FileTopo` | Court; évoque directement fichiers + topographie; aucun paquet, dépôt exact ou domaine contrôlé trouvé; aucun résultat exact CIPO/EUIPO | « TOPO file » existe comme expression générique et comme extension de fichier; **retenu**, avec contrôle juridique à refaire avant publication |
| `FolderAtlas` | Très compréhensible; neuf contrôles techniques négatifs | **Écarté** : Atlas Intel est un produit récent du même espace, qui cartographie localement fichiers et dossiers; risque de confusion de positionnement malgré l'absence de collision exacte |
| `TerraFolder` | Évocateur; neuf contrôles techniques négatifs | **Écarté** : proximité logicielle avec `terra-folder-tree`, la commande `terra folder` et l'écosystème logiciel Terra |
| `folderscape` | Cinq contrôles techniques négatifs dans `TASK-0002` | **Écarté** : proximité phonétique et orthographique avec le jeu `Foldscape` et le gestionnaire de fichiers `Folderscope`; le mot « folderscape » est déjà employé comme terme descriptif |
| `reliefdoc` | npm, PyPI, `crates.io` et GitHub libres lors du contrôle précédent | Écarté : `.com` déjà enregistré; moins immédiatement lié aux dossiers |
| `cartodoc` | Cinq contrôles techniques négatifs | **Écarté** : collision de positionnement avec CARTO dans le domaine cartographique |
| `topodoc`, `docscape`, `isodoc`, `terradoc` | Certains aspects sémantiques utiles | Écartés : au moins une collision de registre ou de produit documentée par `TASK-0002` |

## Diligence technique du trio final

Contrôles effectués le 2026-08-25. Un HTTP 404 RDAP signifie qu'aucun objet
enregistré n'a été retourné au moment de la requête; il ne constitue ni une
réservation ni une garantie future.

| Candidat | npm | PyPI | crates.io | GitHub exact | `.com` | `.org` | `.app` | `.dev` | `.ca` |
|----------|-----|------|-----------|--------------|--------|--------|--------|--------|-------|
| `filetopo` | 404 | 404 | 404 | 404 | 404 | 404 | 404 | 404 | 404 |
| `folderatlas` | 404 | 404 | 404 | 404 | 404 | 404 | 404 | 404 | 404 |
| `terrafolder` | 404 | 404 | 404 | 404 | 404 | 404 | 404 | 404 | 404 |

Registres consultés : API publiques de npm, PyPI, `crates.io` et GitHub;
RDAP officiels Verisign (`.com`), Public Interest Registry (`.org`), Google
Registry (`.app`/`.dev`) et CIRA (`.ca`). Aucune disponibilité n'a été
réservée.

## Marques officielles

| Base | Résultat de la tentative | Portée |
|------|--------------------------|--------|
| CIPO, Canada | Recherche exacte dans le champ « Trademark » pour `FileTopo OR FolderAtlas OR TerraFolder` : **0 résultat**. Base mise à jour le 2026-08-19. | Résultat direct officiel, recherche de mots exacte seulement; ne couvre pas toutes les similitudes |
| EUIPO, Union européenne | Recherche simple exacte, successivement : `folderatlas` **0**, `filetopo` **0**, `terrafolder` **0**. | Résultat direct officiel, recherche simple seulement |
| USPTO, États-Unis | Interface officielle atteinte, mais les fonctions de recherche n'ont pas chargé à cause du mécanisme AWS WAF (`AwsWafIntegration is not defined`). | **Non vérifié**; aucun résultat positif ou négatif ne peut être affirmé |
| WIPO Global Brand Database | Service officiel et couverture confirmés. Les conditions du service interdisent les requêtes automatisées et le moissonnage; aucune requête automatisée n'a donc été faite. | **Non vérifié**; contrôle manuel/juridique requis avant toute fixation irréversible |

Cette recherche est une diligence préliminaire, pas un avis juridique ni une
recherche d'antériorité exhaustive. L'USPTO, la WIPO, les variantes proches,
les classes pertinentes et le droit non enregistré devront être contrôlés à
nouveau avant publication ou dépôt de marque.

## Recherche Web et collisions

- `FileTopo` : aucun produit logiciel exact trouvé. Les résultats observés
  sont surtout une variable `fileTopo` dans du code de topographie et des
  pages sur l'extension générique `.topo`. Risque principal : caractère
  partiellement descriptif, pas confusion avec un produit exact identifié.
- `FolderAtlas` : aucune marque exacte trouvée dans les contrôles directs,
  mais **Atlas Intel** se présente comme un analyseur local qui scanne le
  disque et cartographie fichiers et dossiers. La proximité fonctionnelle et
  le mot dominant « Atlas » rendent ce candidat inutilement risqué.
- `TerraFolder` : aucun produit exact trouvé, mais `terra-folder-tree` est un
  composant logiciel publié et `terra folder` une commande de l'outil Terra.
  La proximité est plus faible qu'une collision exacte, mais supérieure à
  celle de `FileTopo`.
- `folderscape` : `Foldscape` est un jeu distribué comme « downloadable
  folderscape »; `Folderscope` est un gestionnaire de fichiers Windows. Les
  ressemblances phonétiques, orthographiques et sectorielles sont trop fortes.

## Décision

Le nom de travail public du projet est **FileTopo**. La marque s'écrit avec
un `F` et un `T` majuscules; l'identifiant technique est `filetopo`.

Le dossier local `TopographicDocumentMap` peut conserver son nom provisoire
jusqu'à une opération de renommage sûre et isolée. Aucun domaine, compte,
dépôt distant ou marque n'est créé par cette décision.

## Motif

`FileTopo` offre le meilleur compromis entre sens, mémorisation et risque de
collision observé. Il est le seul du trio final sans produit logiciel exact
ou voisin identifié dans le même positionnement. Les neuf contrôles
techniques sont négatifs, et les recherches exactes accessibles à la CIPO et
à l'EUIPO n'ont produit aucun résultat. Les limites USPTO/WIPO empêchent une
conclusion juridique définitive, mais pas l'adoption réversible d'un nom de
travail pour poursuivre l'architecture et le développement local.

## Conséquences

- Employer **FileTopo** dans la documentation et l'interface à venir.
- Employer `filetopo` pour les identifiants internes quand un identifiant est
  nécessaire.
- Refaire la disponibilité des domaines et des registres juste avant toute
  publication.
- Effectuer une recherche manuelle ou professionnelle USPTO/WIPO, par classes
  et similarités, avant achat, dépôt de marque ou publication importante.
- Ne pas réserver de domaine et ne pas créer de dépôt public sans le GO humain
  spécial prévu pour les actions externes irréversibles.
- Cette décision ne fixe ni la licence ni la pile technologique.

## Preuves

Sources officielles et directes :

- CIPO : https://ised-isde.canada.ca/cipo/trademark-search/srch?lang=eng
- USPTO : https://www.uspto.gov/trademarks/search
- WIPO : https://www.wipo.int/en/web/global-brand-database
- WIPO, conditions d'utilisation (§2.1) :
  https://www.wipo.int/en/web/global-brand-database/terms_and_conditions
- EUIPO eSearch : https://euipo.europa.eu/eSearch/
- RDAP IANA : https://data.iana.org/rdap/dns.json
- npm : https://registry.npmjs.org/filetopo
- PyPI : https://pypi.org/pypi/filetopo/json
- crates.io : https://crates.io/api/v1/crates/filetopo

Collisions Web à l'appui des rejets :

- Foldscape : https://porpentine.itch.io/foldscape
- Folderscope : https://www.softpedia.com/get/File-managers/Folderscope.shtml
- Atlas Intel : https://atlasfileintel.com/
- `terra-folder-tree` :
  https://jspm-packages.deno.dev/package/terra-folder-tree%401.6.1
- Terra CLI : https://github.com/DataBiosphere/terra-cli

Preuves antérieures :

- `docs/research/phase-1-research-and-positioning.md`, sections 7.4 et 7.8.
- `docs/ai/VALIDATION.md`, section A.7.

## Limites explicites

- **Vérifié :** disponibilité technique ponctuelle du trio final sur neuf
  points de contrôle; absence de résultat exact CIPO et EUIPO; collisions Web
  citées.
- **Non vérifié :** résultats de recherche USPTO et WIPO; recherche juridique
  exhaustive par classes et similarités; disponibilité future.
- **Inconnu :** existence éventuelle de droits non indexés ou non enregistrés.
