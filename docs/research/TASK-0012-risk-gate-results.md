# TASK-0012 — Résultats des bancs d'essai de levée des risques techniques

- **Tâche :** [TASK-0012](../tasks/TASK-0012-technical-risk-gates.md)
- **Branche d'exécution :** `spike/v0.2-technical-risk-gates`
- **Commit de départ :** `db8d3de0b20e7efbfe463a17c218cc14face39a8`
- **Autorisation :** GO P3 explicite de Sébastien, 2026-08-31
- **Exécuteur :** Claude Code
- **Date d'exécution :** 2026-08-31
- **Statut de ce document :** journal de preuves. Il **n'attribue aucun
  `VERIFIED`** et ne modifie aucune fiche `DEC`.

> **Lecture obligatoire.** Chaque chiffre de ce document est une mesure de banc
> d'essai obtenue dans les conditions déclarées ci-dessous, sur du matériel
> unique, avec des données **entièrement synthétiques**. Ce n'est **jamais**
> une capacité annoncée de FileTopo. Ce qui n'a pas été exécuté est marqué
> **« non testé »**. Une cible manquée est publiée comme manquée.

---

## 0. Matériel et outillage de référence

Déclaré **avant la première mesure**, conformément à §12.4 de `TASK-0012`.
Toutes les mesures de `B0` à `B4` proviennent de cette configuration unique.

### 0.1 Machine

| Élément | Valeur |
|---|---|
| Processeur | Intel Core i9-9900K, 3,60 GHz nominal |
| Cœurs | 8 physiques / 16 logiques |
| Mémoire vive | 63,9 Gio |
| Carte graphique | NVIDIA GeForce RTX 2070, pilote 32.0.16.1656 |
| Disque du dépôt | Samsung SSD 970 EVO Plus 1 To, NVMe |
| Volume du dépôt | `C:`, NTFS, 930,6 Gio, 301,6 Gio libres au départ |
| Système | Windows 11 Professionnel, version 10.0.26200, build 26200, 64 bits |
| Mode d'alimentation | « Utilisation normale » (`381b4222-f694-41f0-9685-ff5bb260df2e`) |

**Machine unique.** Aucune mesure n'a été reproduite sur une seconde machine.
Toute conclusion de portabilité est donc **non testée**.

**Machine de développement, non isolée.** Les mesures ont été prises sur un
poste de travail ordinaire, avec ses services habituels en arrière-plan et son
antivirus actif. Elles n'ont **pas** été prises dans un banc d'essai maîtrisé.
Le bruit de fond est réel et non quantifié; c'est la raison pour laquelle les
écarts min–max sont publiés à côté de chaque médiane.

### 0.2 Outillage

| Outil | Version exacte | Relevée par |
|---|---|---|
| Node.js | v24.13.1 | `node --version` |
| pnpm | 10.31.0 | `pnpm --version` |
| npm | 11.17.0 | `npm --version` |
| rustc | 1.98.0 (88d9e12ae 2026-08-18) | `rustc --version` |
| cargo | 1.98.0 (797e8a9bc 2026-08-05) | `cargo --version` |
| Chaîne Rust active | `stable-x86_64-pc-windows-msvc` (défaut) | `rustup show active-toolchain` |

Le canal Rust utilisé est **`stable`**. Le canal `nightly` n'est employé nulle
part, conformément à §10.1.1 de `TASK-0012`.

### 0.3 Protocole commun aux mesures chronométrées

1. **Cinq exécutions minimum** par scénario chronométré.
2. **Médiane** publiée comme valeur de référence, avec **l'écart min–max**
   complet. Aucune moyenne, aucune exécution écartée comme « aberrante ».
3. Le protocole exact de chaque banc est décrit dans sa section.
4. Aucun chiffre n'entre dans `docs/performance/` sans avoir été mesuré.

### 0.4 Isolation et données

- Toutes les données sont **synthétiques**, générées par les spikes.
- Toute écriture disque des spikes reste sous `spikes/.work/`, ignoré par Git.
- Aucun manifeste ni verrou de la racine n'est modifié.
- Aucun fichier de production n'est touché.

---

## Sommaire des verdicts

| Banc | Objet | Verdict | Section |
|---|---|---|---|
| `B0` | Santé du prototype | *en attente* | §1 |
| `B1` | Migration SQLite Windows | *en attente* | §2 |
| `B2` | Rendu HTML/SVG | *en attente* | §3 |
| `B3` | Identité Windows | *en attente* | §4 |
| `B4` | Attributs infonuagiques | *en attente* | §5 |
