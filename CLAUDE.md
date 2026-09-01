@AGENTS.md

Claude Code doit traiter AGENTS.md comme règle canonique. Après une reprise ou
un compactage, relire la séquence minimale de docs/ai/START_HERE.md. Les
commandes de session ne remplacent jamais la mémoire versionnée du dépôt.

Depuis le 2026-08-31, les **GO techniques** peuvent venir de l'orchestrateur
technique, sous la délégation de Sébastien décrite dans AGENTS.md, section
« Délégation d'orchestration technique ». Un GO technique n'autorise que ce
qu'il nomme. Les points d'arrêt réservés à Sébastien — dépense, donnée réelle
ou personnelle, publication externe exceptionnelle, opération destructive ou
hors dépôt, changement important de portée produit — ne sont **jamais**
délégués : devant l'un d'eux, s'arrêter et demander Sébastien.

Depuis le 2026-08-31, une tâche APPROVED peut autoriser la **lecture minimale,
ciblée et non récursive** de métadonnées d'environnement et d'outillage
nécessaires à son exécution — version de compilateur, de moteur d'exécution ou
de navigateur, présence et chemin d'un exécutable, métadonnées système
strictement techniques. Cela **n'autorise jamais** de lire ou de lister du
contenu utilisateur, des dossiers personnels, des documents, des secrets ou des
données réelles, et **n'ajoute aucune écriture hors du dépôt**. Les points
d'arrêt réservés à Sébastien restent inchangés. Voir AGENTS.md, section
« Lecture minimale de l'environnement technique ».

Depuis le 2026-08-31, trois procédures de session sont disponibles en
**skills de projet** : `/debut-session`, `/reprise-session` et
`/fermeture-session`. Leur logique vit dans `.orchestrator/protocols/`,
**partagée avec Codex**; les fiches sous `.claude/skills/` ne sont que des
renvois et ne doivent pas la recopier. Le rapport compact de la dernière
exécution s'écrit dans `.orchestrator/RESULT.md`. Voir AGENTS.md, section
« Sessions : trois procédures partagées ».
