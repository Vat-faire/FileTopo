# Vision du pipeline de données

Ce document décrit une direction évolutive, pas une pile finale. Chaque couche
doit pouvoir fonctionner localement et préserver la lecture seule des sources.

## Principes transversaux

Les artefacts résident dans l'espace applicatif. L'index est reconstructible,
versionné et migrable; chaque migration est testée sur données synthétiques.
Les exclusions sont explicites et auditables. Les fichiers infonuagiques
indisponibles sont représentés par leurs métadonnées sans téléchargement
automatique. Les fournisseurs futurs restent adaptables et les clés
appartiennent à l'utilisateur.

## Couche 1 — Structure locale

Arborescence, dossiers, fichiers, noms, extensions, tailles, dates, attributs,
état local ou infonuagique, exclusions et diagnostics. Des identifiants stables
doivent survivre autant que possible aux renommages et déplacements. Un journal
versionné enregistre créations, modifications, déplacements, renommages et
suppressions. Cette couche est le socle obligatoire du MVP.

## Couche 2 — Extraction facultative de contenu

Extracteurs séparés et désactivables pour TXT, Markdown, PDF texte, DOCX,
courriels et autres formats approuvés. Chaque extraction conserve la provenance,
la version de l'extracteur et les erreurs. L'OCR est facultatif, coûteux,
désactivé par défaut et soumis à consentement.

## Couche 3 — Recherche locale

Index plein texte local, filtres, classement explicable et citations vers les
fichiers et emplacements extraits. Aucune connexion Internet obligatoire. Une
reconstruction complète doit être possible à partir des sources et paramètres.

## Couche 4 — Enrichissement facultatif

Catégories proposées, étiquettes, personnes, organisations, dates, lieux,
événements, similarités et relations suggérées. Toute suggestion est distinguée
d'un fait structurel et requiert validation humaine avant de devenir relation
approuvée. Les règles déterministes sont documentées et versionnées.

## Couche 5 — RAG facultatif

Chatbot d'interrogation d'un cerveau avec réponses fondées sur les sources et
citations précises. Recherche hybride plein texte et vectorielle; embeddings
facultatifs. Fournisseurs configurables, modèles locaux possibles, clés sous le
contrôle de l'utilisateur et consentement explicite avant tout transfert
distant. Le mode local sans fournisseur reste possible.

## Couche 6 — GraphRAG facultatif

À étudier seulement après un index structurel fiable, une recherche locale
mesurée et un RAG hybride cité. GraphRAG n'est pas requis pour le MVP. Son
adoption exige un besoin démontré, un modèle de provenance, un coût acceptable,
une évaluation sur données synthétiques et une validation humaine des relations.

## Versionnement et migrations

Chaque cerveau porte versions de schéma, index, extracteurs et règles. Les
migrations sont atomiques, sauvegardables et réversibles lorsque possible. Une
migration impossible doit laisser l'ancien index lisible ou déclencher une
reconstruction, jamais modifier les documents sources.
