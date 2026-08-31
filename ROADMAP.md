# Feuille de route de reconstruction

Cette feuille de route remplace l'interprétation trop étroite des anciennes
phases. Les preuves historiques restent valides dans leur portée d'origine,
mais aucune phase future ci-dessous n'est déclarée terminée.

| Phase | Objet | État | Sortie attendue |
|---|---|---|---|
| 0 | Rebaseline et mémoire | VERIFIED | TASK-0010 vérifiée le 2026-08-31 |
| 1 | Exigences, matrice fonctionnelle et architecture | VERIFIED | TASK-0011 vérifiée le 2026-08-31, porte P2 franchie : baseline L1 à L7 approuvée, DEC-0007 à DEC-0012 au statut APPROVED |
| 1 bis | Bancs d'essai de levée des risques techniques | PROPOSED | TASK-0012 : B0 à B4 sur données synthétiques, avant tout code de production; GO P3 requis |
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

## État réel au 2026-08-31

Les phases 2 à 12 restent PROPOSED ou DEFERRED : **aucune ligne de code n'a été
écrite depuis TASK-0010**. La phase 1 est VERIFIED **au sens documentaire** :
Sébastien a franchi la porte P2 le 2026-08-31, la baseline est approuvée et les
six décisions DEC-0007 à DEC-0012 sont APPROVED.

**Une décision approuvée n'est pas une preuve.** Rien n'a été construit, testé
ni mesuré. La phase 1 bis (TASK-0012, PROPOSED) doit lever quatre risques
techniques sur données synthétiques — santé du prototype, migration SQLite
Windows, rendu HTML/SVG, identité Windows — plus l'ambiguïté des attributs
infonuagiques, **avant** le premier code de production. La phase 2 ne peut pas
démarrer avant que TASK-0012 soit approuvée (porte P3), exécutée, et ses
verdicts lus.

## Règles de passage

Chaque phase exige une tâche approuvée, des critères d'acceptation, des données
synthétiques et des preuves. IMPLEMENTED ne devient VERIFIED qu'après contrôle
indépendant. Une phase ultérieure ne justifie jamais de contourner la lecture
seule, la confidentialité, la validation humaine des relations ou les points
d'arrêt de [AGENTS.md](AGENTS.md).
