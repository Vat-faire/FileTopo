# DEC-0025 — Frontière des observations exactes de contenu

- **Date :** 2026-09-03
- **Statut :** `IMPLEMENTED` — contrôle indépendant requis
- **Phase :** étape A — fondation observable du futur moteur déterministe
- **Décideur :** orchestrateur technique, par le GO explicite `TASK-0023` du
  2026-09-03, sous la direction produit enregistrée par `DEC-0021`
- **Rédacteur :** Codex, agent d'exécution
- **Implémentée par :** `TASK-0023`
- **replaced_by :** —

## Contexte

`DEC-0021` sépare les faits observés, les relations déterministes et les
suggestions. FileTopo ne possède encore aucune observation cryptographique du
contenu. La première fondation doit être exacte, reconstructible, persistante
dans l'espace applicatif et incapable de transformer un digest en identité,
relation, copie, version ou suggestion.

## Décision

### A — algorithme et sens exact

L'algorithme v1 est SHA-256. Son nom canonique dans le store et les DTO est :

```text
sha256-v1
```

Le digest représente uniquement les octets effectivement lus pendant une
campagne. Un SHA-256 égal signifie « contenu binaire identique observé ». Il ne
signifie jamais : même objet physique, même fichier, copie, filiation, version,
similarité sémantique ou relation logique.

### B — bibliothèque maintenue, aucune cryptographie maison

SHA-256 n'est pas réimplémenté. La dépendance directe retenue est :

```toml
sha2 = { version = "=0.11.0", default-features = false }
```

Audit préalable au code produit, consulté le 2026-09-03 :

| Élément | Constat |
|---|---|
| Projet | RustCrypto `hashes`, source `https://github.com/RustCrypto/hashes` |
| Paquet | `sha2` 0.11.0, publié sur crates.io le 2026-03-25 |
| Licence | `MIT OR Apache-2.0`; l'option MIT est compatible avec FileTopo |
| Compatibilité | édition 2024, MSRV 1.85; FileTopo compile avec Rust stable 1.98 |
| API | `Sha256` + trait incrémental `Digest`; aucune lecture monolithique requise |
| Features | defaults désactivées : pas d'`alloc` ni d'OID requis par FileTopo |

Résolution transitive normale attendue avec le registre crates.io actuel :

- `digest 0.11.3`, `block-buffer 0.12.1`, `crypto-common 0.2.2`,
  `hybrid-array 0.4.14` et `cpufeatures 0.3.1`, tous `MIT OR Apache-2.0`;
- `cfg-if 1.0.4`, `libc 0.2.189` et `typenum 1.20.1` sont déjà présents dans
  le lockfile et restent réutilisables;
- aucune feature facultative `blobby`, `const-oid`, `ctutils`, `getrandom`,
  `rand_core` ou `zeroize` n'est requise;
- le lockfile contient déjà `sha2 0.10.9` de manière transitive; l'ajout direct
  de `0.11.0` peut donc faire coexister deux versions sans mettre à jour le
  consommateur historique.

La résolution Cargo réelle a confirmé exactement ces six nouveaux paquets :
`sha2 0.11.0` et les cinq transitives listées ci-dessus. Aucun paquet existant
n'a été mis à jour; `cfg-if`, `libc` et `typenum` sont réutilisés. Aucun autre
paquet ne peut être mis à jour par opportunité.

Sources primaires :

- manifeste RustCrypto `sha2 0.11.0` :
  `https://github.com/RustCrypto/hashes/blob/master/sha2/Cargo.toml`;
- documentation et licence de la version publiée :
  `https://docs.rs/sha2/0.11.0/sha2/`;
- manifeste publié :
  `https://docs.rs/crate/sha2/0.11.0/source/Cargo.toml.orig`;
- manifeste `digest 0.11.3` :
  `https://docs.rs/crate/digest/0.11.3/source/Cargo.toml.orig`.

### C — lecture streaming bornée

Chaque fichier est lu par blocs avec un buffer borné. Le moteur ne charge
jamais le fichier entier en mémoire. La taille du buffer est une constante
technique testée; elle ne change pas le sens du digest.

### D — observation persistante, pas identité persistante

Les observations sont dérivées et reconstructibles. Elles peuvent persister
dans `brains/<brain_id>/signals/content.sqlite`, hors `map/`, hors des stores
de relations et hors de la source. Le namespace est `brain_id`, jamais la
fixture ni un chemin source.

Le store ne conserve que chemin relatif, métadonnées minimales, statut,
digest, génération, horodatage et diagnostic sans chemin personnel. Il ne
conserve aucun contenu, extrait, aperçu, texte, chemin absolu, nom de machine,
nom d'utilisateur, secret ou identité système.

### E — aucune confiance dans taille + mtime

Taille et mtime ne suffisent pas à réaffirmer un ancien digest. Chaque nouvelle
campagne explicite relit les octets et recalcule les digests. Une observation
persistée est une « dernière observation enregistrée », jamais une vérité
courante implicite. Une optimisation future exige une source de fraîcheur plus
forte : watcher, change token ou identité fiable.

### F — observation datée et génération atomique

Une observation affirme : « digest SHA-256 observé pendant la génération X à
la date Y ». Une campagne construit une génération opaque et ne bascule
`current_generation_id` que dans une transaction complète. Une erreur globale
avant commit laisse l'ancienne génération courante intacte. Aucun mélange de
générations ne peut être présenté comme courant.

La stabilité est contrôlée à deux niveaux : métadonnées avant/après chaque
lecture, puis fingerprint global de source avant/après la campagne. Un fichier
modifié pendant lecture devient `UNSTABLE_DURING_READ` sans digest valide. Une
source globalement modifiée empêche toute bascule et produit
`SOURCE_CHANGED_DURING_OBSERVATION` ou un diagnostic équivalent.

### G — identité Windows explicitement exclue

`DEC-0013` impose, pour une future identité physique, le couple
`VolumeSerialNumber + FileId 128 bits` et interdit `FileId` seul. Mais
`DEC-0013/F` bloque sa persistance tant que `B4` hydratation/déshydratation
n'est pas fermée.

`TASK-0023` ne persiste donc aucun `VolumeSerialNumber`, `FileId`,
`physical_file_identity`, `stable_file_identity` ni identifiant système utilisé
comme clé durable. Elle n'ajoute pas `windows-sys`, ne lie aucun état
utilisateur à une identité Windows et ne prétend pas fermer B4.

## Schéma v1 décidé

`CONTENT_SIGNALS_SCHEMA_VERSION = 1`.

`metadata` porte au minimum `schema_version`, `signal_engine_version`,
`current_generation_id`, `current_generation_observed_at` et
`source_fingerprint`.

`content_observations` porte au minimum `relative_path`, `size_bytes`,
`modified_unix_ms` nullable, `observation_status`, `hash_algorithm` nullable,
`hash_hex` nullable, `observed_at_unix_ms`, `generation_id` et `diagnostic`
nullable.

Statuts v1 exacts : `HASHED`, `UNREADABLE`, `UNSTABLE_DURING_READ`,
`UNSUPPORTED`. `HASHED` impose `sha256-v1` et 64 caractères hexadécimaux
minuscules. Un autre statut interdit un digest valide. Les chemins sont
relatifs, slash-normalisés, non absolus et sans `..`.

Aucune colonne de relation, suggestion, approbation, provenance ou identité
physique n'existe dans ce schéma.

## Conséquences

- seuls les nœuds `FILE` réellement indexés sont candidats;
- containment et absence de symlink/reparse sortant sont vérifiées avant
  ouverture;
- les occurrences ne sont jamais fusionnées ni dédupliquées;
- deux fichiers vides peuvent partager le fait de contenu identique sans créer
  relation ni suggestion;
- Alpha et Gamma peuvent observer le même digest dans deux stores distincts;
- un rebuild de `map/` ne touche jamais `signals/content.sqlite`;
- `F-043`, `F-044`, `F-045` et `F-046` restent `PROPOSED`; cette fondation ne
  termine pas l'identité physique exigée par `F-046`;
- `DEC-0012` reste intacte : aucune extraction, aucun parsing, OCR, embedding,
  RAG, GraphRAG ou IA.

## Alternatives rejetées

- SHA-256 écrit à la main : risque cryptographique injustifié.
- lecture du fichier entier : mémoire non bornée.
- cache validé par taille + mtime : peut publier un fait faux.
- store sous `map/` : détruit au rebuild.
- store commun partitionné par `brain_id` : isolation dépendante d'une clause.
- digest transformé directement en relation `same-hash/v1` : confond le fait
  et le sens d'une relation, réservé à une tâche future.
- identité Windows persistante dans cette tranche : porte B4 non franchie.

## Preuves attendues

Les critères immuables `EC1` à `EC15` de `TASK-0023` constituent le protocole
de preuve. La décision reste `APPROVED` jusqu'au résultat de la tâche, puis ne
pourra être dite `IMPLEMENTED` que si cette frontière est effectivement tenue.
`VERIFIED` appartient à un contrôle indépendant.

## Résultat d'implémentation — 2026-09-03

`TASK-0023` implémente cette frontière sans l'élargir : dépendance exacte et
lockfile minimal, hashing streaming, génération atomique, store par cerveau,
fraîcheur honnête, statuts sans faux digest, UI et preuves EC15. Les critères
gelés sont passés; la décision n'est pas `VERIFIED` avant contrôle indépendant.

`DEC-0013/F` demeure bloquante pour toute identité physique persistante. Aucun
`VolumeSerialNumber`, `FileId`, `windows-sys`, état relationnel ou contenu
source n'a été ajouté par cette implémentation.
