# Manuel opératoire

Complète [AGENTS.md](../../AGENTS.md) sans le remplacer.

## Cycle d'une tâche

1. Vérifier la racine Git, la branche, le HEAD, les remotes et un état propre.
2. Lire la mémoire minimale de [START_HERE.md](START_HERE.md).
3. Confirmer la tâche active et l'unicité de IN_PROGRESS.
4. Travailler uniquement dans son périmètre et sur des données synthétiques.
5. Exécuter les validations autorisées; ne jamais extrapoler leurs résultats.
6. Inscrire commandes, résultats, portée et limites dans VALIDATION.md.
7. Mettre à jour la mémoire persistante et l'action unique.
8. Produire le rapport factuel de la tâche.
9. Demander le GO suivant lorsqu'une décision ou un point d'arrêt humain demeure.
10. Créer un commit ou publier uniquement si l'autorisation reçue couvre précisément cette action.

## États

PROPOSED attend une approbation. APPROVED est autorisée mais non commencée.
IN_PROGRESS est unique. BLOCKED explique l'obstacle. IMPLEMENTED signifie que
les livrables existent sans vérification indépendante. VERIFIED exige des
preuves contrôlées par une autre instance ou un humain. REJECTED motive un
refus. DEFERRED reporte sans travail engagé.

## Régime de preuve

- Vérification documentaire : structure, cohérence, liens, états et diff.
- Test automatisé : commande réellement exécutée et sortie conservée.
- Test manuel : interaction réalisée et observation décrite.
- Test physique : essai sur matériel ou environnement réel identifié.
- Non testé : aucune exécution pertinente pendant la tâche.
