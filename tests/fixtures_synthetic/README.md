# tests/fixtures_synthetic — Jeux d'essai synthétiques

**Aucun jeu d'essai n'existe à ce jour.** Ce dossier ne contient que ce fichier.

## Règle absolue

> **Aucune donnée réelle n'est autorisée dans ce dépôt.**

Sont interdits, sans exception :

- tout fichier provenant d'un utilisateur, de l'auteur, d'un client, d'un
  employeur ou d'un tiers ;
- toute arborescence copiée depuis une machine réelle ;
- tout nom de fichier, de dossier ou de personne issu d'un corpus réel ;
- tout chemin local personnel, toute adresse électronique, tout identifiant ;
- tout secret : clé, jeton, mot de passe, certificat ;
- tout extrait de document réel, même court, même anonymisé en apparence.

Une anonymisation approximative **ne rend pas** une donnée réelle acceptable.
En cas de doute sur l'origine d'un contenu, il est écarté.

## Ce qui est autorisé

Des jeux d'essai **entièrement fabriqués** :

- arborescences générées de toutes pièces, aux noms manifestement fictifs ;
- contenus produits mécaniquement (texte de remplissage, motifs répétés,
  suites pseudo-aléatoires à graine fixée) ;
- cas limites construits à dessein : dossier vide, arborescence très profonde,
  très grand nombre d'éléments, noms très longs, caractères accentués et
  non latins, extensions inhabituelles, dates extrêmes, doublons.

Chaque jeu s'accompagne d'une description : ce qu'il représente, comment il a
été fabriqué, et à quoi il sert.

## Lecture seule

Les outils du projet **ne modifient jamais** le corpus qu'ils analysent, y
compris ces jeux d'essai. Un jeu qui doit être altéré pour un essai est
**régénéré**, jamais modifié sur place.

## Génération

Les jeux volumineux ne sont pas versionnés : ils sont **régénérés** à partir
d'un script déterministe, lorsqu'un tel script existera. Aucun script de
génération n'a été écrit à ce jour.

## Nommage

`FIX-XXXX-<slug>/`, avec un `README.md` par jeu.
