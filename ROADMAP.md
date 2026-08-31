# Feuille de route de reconstruction

Cette feuille de route remplace l'interprétation trop étroite des anciennes
phases. Les preuves historiques restent valides dans leur portée d'origine,
mais aucune phase future ci-dessous n'est déclarée terminée.

| Phase | Objet | État | Sortie attendue |
|---|---|---|---|
| 0 | Rebaseline et mémoire | IMPLEMENTED | TASK-0010 livrée, validation humaine en attente |
| 1 | Exigences, matrice fonctionnelle et architecture | PROPOSED | critères mesurables, risques et décisions de reconstruction |
| 2 | Moteur d'indexation fiable | PROPOSED | scan robuste, exclusions et identifiants stables |
| 3 | Modèle de données et persistance | PROPOSED | schéma versionné, migrations, reprise et index reconstructible |
| 4 | Carte topographique hiérarchique | PROPOSED | blocs dérivés de l'arborescence réelle |
| 5 | Interactions, panneau et filtres | PROPOSED | navigation, détails, relations, recherche et filtres dynamiques |
| 6 | Surveillance et changements incrémentaux | PROPOSED | détection, journal, vu/non vu et reprise après indisponibilité |
| 7 | Plusieurs cerveaux et personnalisation | PROPOSED | états indépendants, nom, couleur, icône et préférences |
| 8 | Accessibilité, langues et performance | PROPOSED | FR/EN, clavier, contraste et budgets mesurés |
| 9 | Préparation d'une nouvelle alpha publique | PROPOSED | audit, tests, documentation et décision humaine de publication |
| 10 | Extraction de contenu et recherche locale | DEFERRED | formats approuvés, plein texte, citations locales; OCR facultatif |
| 11 | RAG facultatif cité | DEFERRED | recherche hybride, fournisseurs configurables et consentement |
| 12 | GraphRAG facultatif si justifié | DEFERRED | étude fondée sur des besoins et mesures après RAG fiable |

## Règles de passage

Chaque phase exige une tâche approuvée, des critères d'acceptation, des données
synthétiques et des preuves. IMPLEMENTED ne devient VERIFIED qu'après contrôle
indépendant. Une phase ultérieure ne justifie jamais de contourner la lecture
seule, la confidentialité, la validation humaine des relations ou les points
d'arrêt de [AGENTS.md](AGENTS.md).
