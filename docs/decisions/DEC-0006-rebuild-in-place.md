# DEC-0006 — Reconstruire dans le dépôt existant

- **Date :** 2026-08-31
- **Statut :** IMPLEMENTED
- **Décisionnaire :** Sébastien, par approbation explicite de TASK-0010

## Contexte

Le dépôt public contient une version alpha fonctionnelle dans une portée
réduite, mais le produit demandé exige une carte hiérarchique automatique,
persistante et générique plus complète. Il faut repartir de la vision réelle
sans perdre les preuves ni présenter le prototype comme le produit final.

## Options considérées

1. Supprimer le dépôt et recommencer : rejeté, car destructif pour l'historique.
2. Transformer directement une interface privée de référence : rejeté, car
   interdit, non généralisable et incompatible avec la confidentialité.
3. Modifier immédiatement le prototype sur main : rejeté, car risqué et sans
   rebaseline contrôlé.
4. Reconstruire progressivement sur des branches du dépôt existant : retenu.

## Décision

FileTopo reste le projet public officiel. Le dépôt, tout son historique Git, la
licence MIT et la version alpha sont conservés. Aucun commit ne sera supprimé,
aucun historique réécrit et aucun force push utilisé. Le prototype devient une
référence historique; il n'est plus présenté comme le produit final demandé.

La nouvelle conception progresse sur des branches de reconstruction. Le code
existant reste intact pendant TASK-0010. Une fonction ne peut être réutilisée
qu'après inspection, tests et décision documentée; sa présence partielle ne la
rend pas terminée.

## Raisons

- Continuité des preuves, licences, décisions et contributions.
- Comparaison possible entre l'alpha et la reconstruction.
- Changements réversibles et examinables.
- Séparation claire entre mémoire, architecture et développement futur.
- Aucun transfert depuis une source privée.

## Conséquences

La documentation doit distinguer vision finale et état actuel. Les anciennes
validations restent historiques et limitées à leurs critères. Les phases de
reconstruction repartent de critères correspondant au produit réel. Aucun tag
ni release alpha n'est modifié par cette décision.

## Risques

Confondre ancien et nouveau périmètre, réutiliser du code sans preuve, laisser
des états historiques contradictoires ou étendre le MVP vers l'IA trop tôt.
Ces risques sont réduits par la matrice fonctionnelle, une seule tâche active et
une validation indépendante.

## Éléments conservés

Projet FileTopo, dépôt et commits, licence MIT, prototype alpha, tests
synthétiques, décisions historiques et modules réutilisables après réévaluation.

## Éléments non approuvés

Suppression du prototype, réécriture d'historique, force push, fusion directe
dans main, transformation d'une interface privée de référence, reprise automatique de code,
catégories personnelles codées, finalisation du nom public ou de la pile future,
et affirmation que le MVP réel est terminé.

## Conditions de retour

Réexaminer cette décision seulement sur preuve d'un obstacle majeur dans le
dépôt, d'une contrainte juridique ou de sécurité nouvelle, ou sur décision
explicite de Sébastien après analyse des conséquences. Aucun retour ne doit
effacer l'historique.
