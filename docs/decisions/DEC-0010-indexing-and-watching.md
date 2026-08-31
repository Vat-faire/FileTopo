# DEC-0010 — Indexation incrémentale et surveillance Windows

- **Date :** 2026-08-31
- **Statut :** `PROPOSED`
- **Phase :** 1
- **Décideur :** Sébastien — **décision non prise.** Fiche soumise à la porte
  P2 de [TASK-0011](../tasks/TASK-0011-functional-architecture-baseline.md).
- **replaced_by :** —

> Cette fiche **compare** et **classe**. Elle ne tranche pas.

## Contexte

La vision promet une carte « maintenue à jour ». Le prototype ne surveille
rien : aucune commande de surveillance n'est exposée par le cœur — la liste
des commandes enregistrées (`src-tauri/src/lib.rs:415-427`) compte `health`,
`demo_snapshot`, `scan_synthetic_fixture`, `list_collections`,
`choose_collection`, `index_collection`, `cancel_indexing`, `index_progress`,
`query_collection_nodes`, `mark_node_seen` et `reveal_indexed_node`, et
aucune autre. Et sa réindexation est un remplacement total
(`src-tauri/src/index.rs:75-107` : `DELETE FROM nodes` puis réinsertion).

La question posée par `TASK-0011` §7.1 points 6 et 7 est **ce qui se passe
quand le mécanisme de surveillance perd des événements**. Ce n'est pas une
hypothèse pessimiste : c'est un comportement **documenté par Microsoft**.

> « If the buffer overflows, **ReadDirectoryChangesExW** will still return
> **true**, but the entire contents of the buffer are discarded and the
> *lpBytesReturned* parameter will be zero... In this case, you should compute
> the changes by enumerating the directory or subtree. »

La perte est donc normale et attendue. Une architecture qui suppose le
mécanisme exhaustif est fausse dès la première rafale.

## Options examinées — réconciliation après perte d'événements

| Option | Avantages | Inconvénients |
|--------|-----------|---------------|
| **W-A — Réénumération complète du cerveau** | Simple; correct par construction; un seul chemin de code, donc testable exhaustivement; garantit un index égal à un scan complet | Coût proportionnel à la **taille du cerveau**, pas au nombre de changements; sur `SYN-100K` cela ramène au temps d'indexation complète (§3.2 de `BASELINE_TARGETS.md`), ce qui viole en pratique l'esprit de F-031 dès qu'une perte survient; une rafale répétée peut enchaîner les réénumérations complètes |
| **W-B — Réénumération du sous-arbre concerné** | Coût proportionnel à la branche touchée, souvent très inférieur; le reste de l'index continue d'être servi pendant l'opération; s'appuie littéralement sur la prescription Microsoft (« enumerating the directory **or subtree** ») | Exige de savoir **quel** sous-arbre est concerné — or le débordement jette le tampon **entièrement**, donc l'information peut manquer; il faut alors une politique de repli explicite; deux chemins à tester |
| **W-C — Réénumération complète différée, avec service continu de l'ancien index** | L'utilisateur n'est jamais bloqué; l'index existant reste cohérent pendant la vérification; la bascule est atomique | Deux index coexistent temporairement : coût en espace disque, et la bascule doit être écrite avec soin; l'utilisateur voit des données périmées pendant la fenêtre, ce qui doit être signalé honnêtement |
| **W-D — Journal USN comme source de réconciliation** | Le journal NTFS enregistre chaque changement de volume et sert explicitement à « recover file system indexing... after a computer or volume failure »; potentiellement bien plus économe qu'une réénumération | **Non étudié sur source primaire pendant `TASK-0011`** : privilèges requis, troncature/enroulement du journal, systèmes de fichiers supportés et coût réel n'ont pas été vérifiés; NTFS seulement; ajouterait un second mécanisme dépendant de la plateforme |

## Options examinées — application des changements

| Option | Avantages | Inconvénients |
|--------|-----------|---------------|
| **U-A — Remplacement total** (comportement actuel du prototype) | Trivial; toujours cohérent; la transaction protège d'un arrêt brutal | Coût proportionnel à la taille de l'index; **incompatible avec F-031**; l'état non reconstructible doit être sauvé et réappliqué à chaque fois, ce que le prototype ne fait que pour l'état vu, et **par chemin**, donc perdu au renommage |
| **U-B — Application différentielle par clé stable** : seuls les nœuds touchés sont insérés, mis à jour ou supprimés | Coût proportionnel au nombre de changements; l'état non reconstructible n'a pas besoin d'être sauvé et réappliqué, puisqu'il n'est pas détruit; c'est la seule option qui satisfait le critère de rejet de §3.3 de `BASELINE_TARGETS.md` | Dépend entièrement de la qualité de la clé stable de [DEC-0009](DEC-0009-data-model-and-relations.md); une clé instable transforme chaque renommage en suppression + création, donc en bruit; logique de réconciliation nettement plus complexe |
| **U-C — Différentiel avec repli sur remplacement** : différentiel en régime normal, remplacement total quand la cohérence ne peut plus être établie | Garde la propriété de coût de U-B en régime normal, avec une issue de secours prouvée | Le repli réintroduit tous les défauts de U-A, y compris la perte de l'état non reconstructible s'il n'est pas stocké séparément; la condition de bascule doit être écrite et testée, sinon elle deviendra le chemin par défaut |

## Décision

**Aucune.** Classements recommandés, soumis à Sébastien :

**Réconciliation :** 1. **W-B avec repli W-C** (recommandé) — 2. W-C —
3. W-A — 4. W-D (à étudier séparément, données insuffisantes).

**Application :** 1. **U-B** (recommandé) — 2. U-C — 3. U-A (rejetée : elle
rend F-031 inatteignable).

**Invariant proposé, applicable quelle que soit l'option retenue :**

> Aucune opération d'indexation ne supprime de lignes de l'index courant avant
> de disposer d'un remplacement valide et validé.

Ce n'est pas un vœu : c'est ce qui distingue W-C de W-A, et U-B de U-A.

## Motif

**W-B plutôt que W-A** parce que la documentation Microsoft prescrit
littéralement « enumerating the directory **or subtree** » : le sous-arbre
est la granularité que l'éditeur lui-même désigne. W-A est correcte mais
transforme chaque rafale en réindexation complète, ce qui annule le bénéfice
de F-031 exactement au moment où il compte.

**Le repli W-C est nécessaire** parce que le débordement de tampon jette le
tampon **entièrement** : dans ce cas précis, l'application peut ne pas savoir
quel sous-arbre réénumérer. Il faut alors une réénumération plus large, et
elle doit se faire **sans interrompre le service de l'index existant**. C'est
pourquoi les deux options sont recommandées ensemble et non l'une contre
l'autre.

**W-D n'est pas rejetée, elle est déclarée non instruite.** Le journal USN
est une piste sérieuse et documentée, mais aucune source primaire sur ses
privilèges, sa troncature et son support n'a été consultée pendant
`TASK-0011`. La classer sans l'avoir instruite serait malhonnête; la taire
serait pire. Elle mérite une fiche propre.

**U-B plutôt que U-C** parce qu'un repli existe toujours *en pratique* — la
réénumération de W-B/W-C **est** ce repli, au niveau au-dessus. Ajouter un
second repli au niveau de l'application des changements crée un chemin peu
emprunté, donc peu testé, donc faux le jour où il sert.

**U-A est rejetée sur preuve interne** : `replace_nodes` ne préserve l'état vu
que par **chemin relatif**, ce qui le perd à chaque renommage. C'est un
exemple concret du couplage entre U-A et une clé instable.

## Conséquences

- **Cette fiche dépend de `DEC-0009`.** U-B est inapplicable sans une clé
  stable exploitable. Les deux fiches doivent être examinées ensemble : une
  approbation de U-B sans une clé stable retenue serait vide.
- Un état de cerveau **« à vérifier »** doit exister dans la machine à états
  ([ARCHITECTURE_BASELINE.md](../architecture/ARCHITECTURE_BASELINE.md) §4.3).
  Il n'est ni « à jour » ni « en erreur » : il signale honnêtement que la
  fraîcheur n'est pas garantie pendant que la réconciliation travaille.
- **La surveillance ne peut pas être supposée disponible.**
  `ReadDirectoryChangesExW` est documenté « currently supported only for the
  NTFS file system », et échoue avec `ERROR_INVALID_PARAMETER` au-delà de
  64 Kio de tampon sur un répertoire réseau. Sur un cerveau non NTFS, le
  produit doit se déclarer sans surveillance et se replier sur un parcours
  périodique — jamais afficher « à jour » sur la foi d'un mécanisme absent.
- Le test **R6** de [TEST_STRATEGY.md](../architecture/TEST_STRATEGY.md) —
  perte d'événements forcée, réconciliation aboutissant à un index égal à un
  scan complet de référence — est le test de rejet de cette fiche.
- Le critère de rejet de §3.3 de
  [BASELINE_TARGETS.md](../performance/BASELINE_TARGETS.md) (rapport ≤ 2 entre
  `SYN-100K` et `SYN-1K` à 10 changements) est la mesure qui départage U-A
  et U-B.

## Preuves

| # | Fait | Source primaire | Consultée le |
|---|---|---|---|
| P1 | Débordement de tampon : « will still return **true**, but the entire contents of the buffer are discarded and the *lpBytesReturned* parameter will be zero... you should compute the changes by enumerating the directory or subtree » | https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-readdirectorychangesexw | 2026-08-31 |
| P2 | « **ReadDirectoryChangesExW** fails with **ERROR_NOTIFY_ENUM_DIR** when the system was unable to record all the changes to the directory. In this case, you should compute the changes by enumerating the directory or subtree. » | idem | 2026-08-31 |
| P3 | « **ReadDirectoryChangesExW** is currently supported only for the NTFS file system. » | idem | 2026-08-31 |
| P4 | « fails with **ERROR_INVALID_PARAMETER** when the buffer length is greater than 64 KB and the application is monitoring a directory over the network. This is due to a packet size limitation with the underlying file sharing protocols. » | idem | 2026-08-31 |
| P5 | Le tampon est alloué au premier appel, « associated with the directory handle until it is closed and its size does not change during its lifetime » | idem | 2026-08-31 |
| P6 | Journal USN NTFS : « When any change is made to a file or directory in a volume, the USN change journal for that volume is updated with a description of the change and the name of the file or directory. » Sert à « recover file system indexing... after a computer or volume failure » | https://learn.microsoft.com/en-us/windows/win32/fileio/change-journals | 2026-08-31 |
| P7 | `fs::symlink_metadata` ne suit pas les liens symboliques — mécanisme de non-suivi déjà employé par le prototype | https://doc.rust-lang.org/std/fs/fn.symlink_metadata.html | 2026-08-31 |
| P8 | Constat de code au commit `01e6860f` : **aucune** commande de surveillance dans la liste des commandes enregistrées; `replace_nodes` exécute `DELETE FROM nodes` puis réinsère, en préservant l'état vu **par chemin relatif** | `src-tauri/src/lib.rs:415-427`, `src-tauri/src/index.rs:75-107` | 2026-08-31 |

**Source secondaire, marquée comme telle.** La documentation de la caisse Rust
`notify` déclare « Large directory watching may result in missed events » et
une licence `CC0-1.0` (https://docs.rs/notify/latest/notify/, consultée le
2026-08-31). *Elle documente une bibliothèque, pas la plateforme : elle
illustre le problème, elle ne le prouve pas.* Aucune bibliothèque de
surveillance n'est recommandée par cette fiche.

## Limites

- **Non testé.** Aucune surveillance n'a été exécutée, aucune rafale
  provoquée, aucun débordement observé, aucune mesure prise.
- **W-D n'a pas été instruite** : les privilèges, la troncature et le support
  du journal USN n'ont été vérifiés sur aucune source primaire. C'est une
  lacune déclarée, pas une conclusion.
- La granularité réelle de l'information disponible après un débordement de
  tampon (quel sous-arbre réénumérer ?) n'est **pas établie** par les sources
  consultées; c'est l'incertitude qui rend le repli W-C nécessaire.
- Le comportement des fournisseurs de synchronisation infonuagique face à la
  surveillance de répertoire n'est établi par aucune source consultée.
- La tenue du critère de §3.3 de `BASELINE_TARGETS.md` par U-B est une
  **hypothèse**, pas un résultat.
