# docs/performance — Mesures de performance

**Aucune mesure n'a été prise à ce jour.** Ce dossier est vide de contenu.
Aucun chiffre de performance ne peut être cité pour ce projet.

## Rôle

Recevoir des mesures **réellement effectuées**, avec leurs conditions
d'exécution, afin de fonder les choix d'architecture sur des faits plutôt que
sur des estimations.

## Règles

1. **Aucune donnée réelle.** Les mesures se font sur des jeux d'essai
   synthétiques (`tests/fixtures_synthetic/`).
2. **Lecture seule.** Une mesure ne modifie jamais le corpus mesuré.
3. **Conditions déclarées.** Une mesure sans description de son environnement
   n'est pas exploitable.
4. **Pas d'extrapolation.** Un chiffre obtenu sur un corpus n'est pas présenté
   comme valable pour un autre.
5. **Aucune estimation dans ce dossier.** Ce qui n'a pas été mesuré n'y figure
   pas.

## Nommage

`PERF-XXXX-<slug>.md`

## Gabarit

```markdown
# PERF-XXXX — <objet mesuré>

- **Date :** AAAA-MM-JJ
- **Phase :** <numéro>
- **Statut :** PROPOSED | APPROVED | IN_PROGRESS | BLOCKED | IMPLEMENTED | VERIFIED | REJECTED | DEFERRED
- **Résultat :** mesuré | non testé

## Question
Ce que la mesure cherche à établir.

## Jeu d'essai
Jeu synthétique employé : nombre d'éléments, profondeur, volume total.

## Environnement
Système, matériel pertinent, version des outils. Sans chemin local personnel.

## Protocole
Comment la mesure a été faite, et combien de fois.

## Résultats
| Grandeur | Valeur | Unité |
|----------|--------|-------|

## Limites
Ce que la mesure ne dit pas.
```

## Grandeurs qui deviendront pertinentes

Elles ne sont **pas** des objectifs chiffrés à ce stade : durée du premier
parcours, durée d'une mise à jour incrémentale, taille de l'index, mémoire
occupée, fluidité du rendu de la carte, temps d'ouverture d'une collection.
Aucun seuil n'est fixé tant que la phase 3 n'a pas eu lieu.
