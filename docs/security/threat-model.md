# Modèle de menace du MVP FileTopo

**Révision :** 2026-08-26
**Portée :** application Windows locale, hors ligne et sans IA.

## Actifs et frontières de confiance

Les actifs à protéger sont les documents utilisateur, leurs métadonnées, les
chemins racines et les index locaux. Les frontières principales séparent :

1. la collection choisie, considérée non fiable et strictement en lecture;
2. le cœur Rust natif, seul détenteur des chemins absolus et de SQLite;
3. l'interface WebView, qui reçoit des DTO bornés et des identifiants;
4. le dossier de données de l'application, inscriptible mais distinct de la
   collection;
5. l'Explorateur Windows, invoqué seulement après une action explicite.

## Menaces et contrôles

| Menace | Contrôle actuel | Risque résiduel |
|---|---|---|
| Lecture du contenu d'un document | Scanner limité aux entrées et métadonnées | Le système peut lire les métadonnées et noms sensibles |
| Écriture ou suppression dans la collection | Aucune opération d'écriture exposée; index externe | Un défaut futur doit être détecté par tests de non-écriture |
| Évasion par `..`, identifiant falsifié ou chemin absolu injecté | IPC par identifiants; reconstruction côté Rust; contrôle de confinement | Course entre validation et ouverture possible |
| Lien symbolique, jonction ou point de réanalyse | Entrées refusées et non suivies pendant scan et ouverture | Point de réanalyse créé après vérification (TOCTOU) |
| Nom de fichier malveillant ou très long | Paramètres structurés, SQL paramétré, aucun shell de commande | Limites du système, de WebView ou de l'Explorateur |
| SQL injecté depuis l'interface | SQL interne paramétré; aucun SQL arbitraire exposé | Corruption locale de la base par un autre processus |
| Fichier en nuage téléchargé par surprise | Détection par attributs; contenu non ouvert | Le fournisseur de synchronisation peut réagir à l'énumération |
| Exfiltration réseau | Pas de permission réseau, télémétrie, CDN, IA ou auto-update | WebView2 et le système restent des composants de confiance |
| Déni de service par grande arborescence | Scan itératif, pagination, LOD, progression et annulation | Très grands noms/index peuvent consommer disque, mémoire ou temps |
| Divulgation de l'index local | Données dans le profil de l'application | Pas de chiffrement propre; dépend des contrôles Windows |
| Chaîne d'approvisionnement | Verrouillages, audit de vulnérabilités et inventaire de licences | Une vulnérabilité inconnue ou un outil de build compromis reste possible |

## Invariants à préserver

- Ne jamais suivre de lien, jonction ou point de réanalyse.
- Ne jamais écrire dans une racine enregistrée.
- Ne jamais envoyer un chemin racine absolu à l'interface.
- Ne jamais accepter de chemin ou de SQL arbitraire via IPC.
- Ne jamais ouvrir un élément sans action explicite.
- Ne jamais remplacer un index valide par un scan annulé ou incomplet.

## Hors portée du MVP

Comptes multiples, synchronisation, serveur, télémétrie, OCR, contenu des
documents, IA, chiffrement applicatif, mise à jour automatique et
réorganisation physique des fichiers. Leur ajout imposerait une nouvelle
analyse de menace avant implémentation.

## Vérification avant diffusion

Rejouer les tests synthétiques, Clippy strict, les audits de dépendances et
de fichiers versionnés. Construire depuis les verrous, inspecter l'artefact,
signer seulement selon une procédure humaine séparée et ne publier qu'après
le GO spécial de phase 6.
