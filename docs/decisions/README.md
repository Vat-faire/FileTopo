# docs/decisions — Décisions du projet

**Décisions vérifiées :** `DEC-0001` (nom FileTopo), `DEC-0002` (MIT),
`DEC-0003` (Tauri/Rust/React), `DEC-0004` (SQLite et modèle de données) et
`DEC-0005` (PixiJS/WebGL et relief). Aucune décision n'autorise une
réservation, un achat ou une publication.

## Rôle

Consigner les décisions qui engagent le projet, avec leur date, leur motif et
les options écartées, afin que personne n'ait à les redécouvrir ni à les
rejouer.

## Ce qui mérite une fiche

- Nom public du projet.
- Licence.
- Plateformes cibles.
- Pile technologique et format de stockage de l'index.
- Modèle de données et modèle de relief.
- Toute règle qui contraint durablement la suite.

## Nommage

`DEC-XXXX-<slug>.md`, numérotation à quatre chiffres, dans l'ordre de décision.

## Gabarit

```markdown
# DEC-XXXX — <titre>

- **Date :** AAAA-MM-JJ
- **Statut :** PROPOSED | APPROVED | IN_PROGRESS | BLOCKED | IMPLEMENTED | VERIFIED | REJECTED | DEFERRED
- **Phase :** <numéro>
- **Décideur :** <humain ayant donné le GO>
- **replaced_by :** <DEC-YYYY ou vide>

## Contexte
Ce qui a rendu la décision nécessaire.

## Options examinées
| Option | Avantages | Inconvénients |
|--------|-----------|---------------|

## Décision
Ce qui est retenu, en une phrase.

## Motif
Pourquoi cette option et pas les autres.

## Conséquences
Ce que cela impose ou interdit pour la suite.

## Preuves
Sources, mesures ou constats à l'appui. « Non testé » si rien n'a été vérifié.
```

## Règles

- Une fiche n'est pas modifiée après avoir atteint `VERIFIED` : elle est
  **remplacée** par une nouvelle fiche, et son champ `replaced_by` pointe vers
  la fiche remplaçante (ex. `DEC-0002`).
- Une décision locale et réversible peut être prise sous l'autorisation
  permanente du 2026-08-25. Une fixation externe ou irréversible requiert le
  GO humain spécial prévu par les règles du projet.
- Une décision sans preuve est marquée comme telle.
