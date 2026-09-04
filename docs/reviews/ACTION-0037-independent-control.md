# ACTION-0037 — Contrôle indépendant de TASK-0023 : CHANGES_REQUIRED

- **Date :** 2026-09-04
- **Objet :** enregistrement du contrôle indépendant de `TASK-0023`, de son
  commit substantif, d'EC1–EC15, des deux preuves WebView2 et de l'intégrité
  des 27 preuves X5
- **Contrôleur :** **orchestrateur technique indépendant**, instance distincte
  de l'exécuteur de `TASK-0023`
- **Rédacteur :** Claude Code. **Ce document ENREGISTRE le verdict rendu par
  l'orchestrateur; Claude ne rend pas ce verdict, ne ferme pas `X9` et ne
  s'attribue pas `VERIFIED`.**
- **HEAD contrôlé :**
  `12b3c87c1fb0d89194faf2363bc93f092cff097e`
- **Commit de gel `TASK-0023` :**
  `711071c5c9bb2d22fab0128b3c15e3c58d2902ec`
- **Commit substantif `TASK-0023` :**
  `756b97bd1b04f6b214c8519581cc681cd7f1e25f`
- **`main` :** `91bbe90f0f99026c28cd345784d4f579a0016db2`, intacte

## 1. Verdict rendu par l'orchestrateur

| Élément | Verdict |
|---|---|
| `ACTION-0037` | **`CHANGES_REQUIRED`** |
| `TASK-0023` | **`IMPLEMENTED`** |
| Réserve `X9` | **`OPEN`** |
| `DEC-0025` | **`IMPLEMENTED`** — contrôle indépendant requis |

## 2. Ce que le contrôle indépendant accepte

- le gel `711071c` antérieur à tout code produit;
- la dépendance `sha2 0.11.0`, auditée et minimale;
- le moteur de digest de fichier `sha256-v1`;
- le caractère **streaming** du moteur de digest de fichier;
- le store par cerveau `brains/<brain_id>/signals/content.sqlite`;
- le schéma `1`;
- la génération transactionnelle et sa bascule atomique;
- la fraîcheur sans cache fondé sur taille+mtime;
- `EC2`–`EC11`;
- `EC13`–`EC15` **sur leur substance**;
- l'isolation Alpha/Gamma;
- l'absence de relation et de suggestion;
- l'absence d'identité Windows persistante;
- `DEC-0013/F` toujours bloquante;
- `X5` exactement à **27**;
- `main` intacte.

## 3. Réserve unique — X9

Le fingerprint **global** de campagne, lu avant et après la campagne, appelait
encore `fixtures::fingerprint(root)`. Cette fonction :

- peut suivre un symlink fichier via `fs::read(path)`;
- peut donc **lire hors de la racine analysée**;
- accumule les contenus dans un `Vec<u8>`;
- n'est donc **pas** à mémoire bornée à l'échelle d'un cerveau.

`X9` porte **uniquement** sur ce fingerprint global de campagne. Aucun autre
élément accepté de `TASK-0023` n'est rouvert.

## 4. Correction enregistrée — 2026-09-04

Une correction ciblée `X9` a été livrée sur
`build/v0.2-a7-exact-content-observations`. Elle est décrite dans
[`TASK-0023`](../tasks/TASK-0023-exact-content-observations.md), section
« Correction ciblée `X9` ». En résumé :

- nouvelle primitive `content_signals::content_source_fingerprint`, publiée
  comme `sha256-tree-v1:<64 hex minuscules>`, déterministe, streaming, à
  mémoire bornée par un unique tampon réutilisé de 64 KiB;
- un symlink, une jonction ou tout autre reparse point est enregistré comme
  **lien** : sa cible n'est jamais ouverte, lue, parcourue ni canonicalisée;
- un type d'entrée non interprétable est traité comme **non traversable**;
- `observe_root_with_hook` n'utilise plus que cette primitive pour
  `sourceFingerprintBefore` et `sourceFingerprintAfter`;
- `fixtures::fingerprint` (`fnv1a64:…`) est **inchangée** et conserve son rôle
  historique de fingerprint des fixtures gelées et des preuves
  `TASK-0016`..`TASK-0022`;
- `sha256-tree-v1` (arbre source d'une campagne) et `sha256-v1` (contenu d'un
  fichier) sont deux rôles distincts, jamais interchangeables.

Les deux preuves `EC15` ont été régénérées sur la variante fraîche
`task0023-ec15-x9-20260904145356-6ebb99`, puisque le moteur publié par
`sourceFingerprintBefore/After` a changé.

**Après cette correction, l'état enregistré reste inchangé :**
`ACTION-0037` = `CHANGES_REQUIRED`, `TASK-0023` = `IMPLEMENTED`,
`X9` = `OPEN`. L'exécuteur de la correction ne clôt pas sa propre réserve.

## 5. Action suivante

Re-contrôle indépendant **ciblé `X9`** de `TASK-0023`, sur le commit
substantif de correction, par une instance distincte de l'exécuteur. Aucune
autre partie de `TASK-0023` n'est à rouvrir.
