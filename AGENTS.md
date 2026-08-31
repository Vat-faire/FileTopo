# AGENTS.md — Règles canoniques

## Périmètre et confidentialité

- Travailler uniquement dans ce dépôt public; ne jamais lire, lister ou écrire ailleurs.
- L'interface privée de référence est interdite d'accès. Ne jamais en copier noms, chemins, données, métadonnées, code ou historique.
- Aucun secret, chemin local personnel ou donnée réelle dans le dépôt.
- Tests et exemples exclusivement synthétiques.
- FileTopo analyse les documents en lecture seule. Index, caches et rapports restent dans l'espace applicatif, jamais dans la racine analysée.

## Reprise minimale

Lire, dans cet ordre :

1. AGENTS.md ou CLAUDE.md;
2. docs/ai/START_HERE.md;
3. docs/ai/CURRENT_STATE.md;
4. docs/ai/NEXT_ACTION.md;
5. la fiche de la tâche active ou approuvée;
6. seulement les fichiers supplémentaires qu'elle nomme.

## Tâches et Git

- États permis uniquement : PROPOSED, APPROVED, IN_PROGRESS, BLOCKED, IMPLEMENTED, VERIFIED, REJECTED, DEFERRED.
- Au plus une tâche IN_PROGRESS. Toute tâche existe dans docs/tasks avant son démarrage.
- Aucune modification sans tâche APPROVED et périmètre écrit.
- Avant une tâche : vérifier racine, branche, HEAD, remote et état Git propre. S'arrêter devant tout changement inattendu.
- Ne jamais confondre IMPLEMENTED (livrable produit) et VERIFIED (contrôle indépendant sur preuves). L'exécuteur ne s'attribue pas VERIFIED.
- Préserver les changements d'autrui et l'historique; aucun reset destructif, clean, force push ou réécriture.

## Exécution et preuves

- Rester dans les fichiers autorisés; aucune donnée utilisateur réelle ni accès implicite à un dossier.
- Tester proportionnellement au risque avec données synthétiques. Toute affirmation cite une preuve vérifiable.
- Dire explicitement non testé pour ce qui n'a pas été exécuté; rapporter les échecs tels quels.
- Avant de terminer : mettre à jour CURRENT_STATE.md, NEXT_ACTION.md, HANDOFF.md, VALIDATION.md et CHANGELOG_AI.md. Ne modifier graph/ que si la tâche l'autorise explicitement.
- NEXT_ACTION.md contient exactement une action.

## Points d'arrêt

GO explicite de Sébastien requis avant toute publication ou écriture distante non déjà autorisée, dépense, achat, usage payant, opération destructive, accès hors dépôt, ou changement important de portée. Ne jamais modifier les documents analysés.

## Rapport final minimal

Donner : résultat, branche et commits, fichiers touchés, validations et sorties utiles, non-testé/limites, état exact de la tâche, état Git final, action unique suivante et confirmation des actions distantes ou destructives. Attendre l'examen humain lorsque la tâche reste IMPLEMENTED.
