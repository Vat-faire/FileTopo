# DEC-0002 — Licence du projet

- **Date :** 2026-08-25
- **Statut :** `VERIFIED`
- **Phase :** 2
- **Décideur :** orchestrateur, sous l'autorisation permanente du 2026-08-25
- **replaced_by :** —

## Contexte

FileTopo est destiné à devenir un logiciel public, gratuit et réutilisable.
La licence doit être simple pour les utilisateurs, les contributeurs et les
distributeurs, tout en restant compatible avec une pile majoritairement MIT
ou Apache-2.0.

## Options examinées

| Option | Avantages | Inconvénients |
|--------|-----------|---------------|
| MIT | Courte, permissive, OSI approuvée, autorise usage/modification/distribution/sous-licence | Pas de clause de brevet explicite; impose de conserver copyright et permission |
| Apache-2.0 | Permissive, clause de brevet explicite, cadre de contributions détaillé | Texte plus long; gestion conditionnelle de `NOTICE` si une œuvre distribuée en contient un |
| MPL-2.0 | Copyleft limité aux fichiers, compatible avec certains usages commerciaux | Plus complexe; obligations de publication des fichiers modifiés |
| GPL-3.0 | Garantit un copyleft fort | Inadaptée à l'objectif de réutilisation permissive et aux intégrations les plus simples |

## Décision

FileTopo sera publié sous **MIT**. Le fichier `LICENSE` sera ajouté avec le
code du squelette, avant tout commit public, avec l'auteur et l'année exacts.

## Motif

MIT correspond à l'intention explicite de logiciel public largement
réutilisable et réduit la friction de contribution. Le bénéfice de la clause
de brevet d'Apache-2.0 ne justifie pas ici la complexité documentaire
supplémentaire. Toute dépendance directe devra rester compatible avec MIT;
les dépendances copyleft fortes sont exclues du produit distribué sauf
nouvelle décision.

## Conséquences

- Ajouter un fichier `LICENSE` MIT au squelette de phase 3.
- Maintenir un inventaire des dépendances et de leurs licences.
- Conserver les avis requis des dépendances distribuées.
- Refuser GPL/AGPL dans le binaire livré sans nouvelle décision documentée.
- Cette décision ne constitue pas encore une publication.

## Preuves

- Open Source Initiative, MIT : https://opensource.org/license/mit
- Apache License 2.0 : https://www.apache.org/licenses/LICENSE-2.0
- Mozilla Public License 2.0 : https://www.mozilla.org/MPL/2.0/
- GNU GPL 3.0 : https://www.gnu.org/licenses/gpl-3.0.html

## Limites

Compatibilité précise des dépendances à vérifier à leur sélection et avant
chaque publication. Ceci n'est pas un avis juridique.
