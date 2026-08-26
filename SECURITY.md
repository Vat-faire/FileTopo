# Politique de sécurité

## Versions prises en charge

FileTopo n'est pas encore publié. Jusqu'à une première version publique,
seule la branche locale de développement courante reçoit des correctifs.

## Signaler une vulnérabilité

Aucun canal public n'existe encore. Ne publiez pas de détail sensible dans
une issue publique. Après création éventuelle d'un dépôt public, un canal de
signalement privé devra être configuré et inscrit ici avant la publication.
En attendant, conservez le rapport localement et communiquez-le au
mainteneur par un canal privé déjà convenu.

Un rapport utile indique la version, l'impact, les étapes minimales de
reproduction sur des données synthétiques et les mesures d'atténuation
connues. N'incluez jamais de document personnel, de secret ou de chemin
utilisateur réel.

## Garanties et limites actuelles

- Le scanner lit les noms, chemins relatifs et métadonnées nécessaires; il
  n'ouvre pas le contenu des documents.
- Il refuse de suivre les liens symboliques, jonctions et points de
  réanalyse.
- Les index sont placés dans les données locales de l'application, hors des
  racines indexées.
- L'interface ne reçoit pas le chemin absolu d'une racine. Les opérations
  natives utilisent des identifiants de collection et de nœud.
- Aucun réseau, aucune télémétrie, aucune IA et aucune mise à jour automatique
  ne font partie du MVP.
- L'ouverture dans l'Explorateur reste une action explicite de l'utilisateur.

Ces contrôles réduisent le risque sans constituer une garantie absolue. Le
modèle de menace détaillé se trouve dans `docs/security/threat-model.md`.
