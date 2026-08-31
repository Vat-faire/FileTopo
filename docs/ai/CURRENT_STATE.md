# État courant

- **Dernière mise à jour :** 2026-08-31
- **Branche :** rebuild/v0.2-project-brain, publiée sur origin
- **Commit de base :** 91bbe90f0f99026c28cd345784d4f579a0016db2
- **Dernière tâche vérifiée :** TASK-0010, VERIFIED le 2026-08-31
- **Tâche proposée :** TASK-0011, PROPOSED, en attente de décision humaine
- **Tâche IN_PROGRESS :** aucune
- **Dernière validation :** vérification indépendante du commit publié et des
  fichiers critiques de TASK-0010, approuvée par Sébastien; aucun test
  applicatif exécuté
- **Code applicatif :** inchangé

## État réel du prototype

Audit statique confirmé : Tauri 2, Rust, React/TypeScript, Vite, SQLite, registre
de collections, scan local de métadonnées, recherche simple, filtres, ouverture
dans l'Explorateur, FR/EN et vu/non vu minimal. Le démarrage charge une
démonstration synthétique. La carte est un nuage de points placé
artificiellement, pas une carte hiérarchique en blocs. Changer d'onglet de
collection ne charge pas son index.

## Décision

FileTopo, son dépôt, son historique, sa licence MIT et le prototype alpha sont
conservés. La conception réelle sera reconstruite progressivement sur branche;
aucune fonction partielle du prototype n'est réputée terminée sans inspection,
tests et décision documentée.

## Limites et risques

Surveillance incrémentale, journal de changements, relations transversales,
panneau complet, préférences de cerveaux et restauration persistante complète
sont absents ou insuffisants. Les tests historiques n'ont pas été rejoués.
Le dossier graph/ n'a pas été modifié : ses fichiers contiennent des états
contradictoires et ne sont pas une source fiable pour l'état courant.

## Porte humaine

Sébastien a validé la mémoire permanente, la décision de reconstruction et le
bilan alpha le 2026-08-31. La fiche TASK-0011 est maintenant écrite et soumise
au statut PROPOSED : elle n'autorise rien tant que Sébastien ne l'a pas
approuvée. Aucune ligne de code ne peut être écrite avant cette approbation,
puis celle des décisions et de la tâche d'implémentation qui suivront.
