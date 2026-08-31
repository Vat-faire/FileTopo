# PERF-0003 — Mesures de B3, identité Windows

- **Banc d'essai :** `B3` de
  [TASK-0012](../tasks/TASK-0012-technical-risk-gates.md)
- **Spike :** `spikes/b3-windows-identity/`
- **Date de mesure :** 2026-08-31
- **Journal complet, preuves et verdict :**
  [TASK-0012-risk-gate-results.md §4](../research/TASK-0012-risk-gate-results.md)
- **Statut :** mesures de banc d'essai. **Aucune n'est une performance
  annoncée de FileTopo.**

## 1. Matériel et outillage

Déclarés **avant** la première mesure, conformément à §12.4 de `TASK-0012`.

| Élément | Valeur |
|---|---|
| Processeur | Intel Core i9-9900K, 8 cœurs / 16 fils, 3,60 GHz nominal |
| Mémoire vive | 63,9 Gio |
| Disque | Samsung SSD 970 EVO Plus 1 To, NVMe |
| Volume | `C:`, **NTFS** |
| Système | Windows 11 Professionnel, 10.0.26200, build 26200 |
| Chaîne Rust | **`stable-x86_64-pc-windows-msvc`**, `rustc 1.98.0` |
| Profil | `--release` (optimisé) |
| Dépendances | `windows-sys =0.61.2`, `windows-link 0.2.1` — toutes deux `MIT OR Apache-2.0` |
| Machine de mesure | poste de développement ordinaire, services et **antivirus actifs** |

**Le canal `nightly` n'a été employé nulle part.**

**L'antivirus est actif.** Il intercepte les ouvertures de fichiers et pèse
donc directement sur la mesure ci-dessous. Ce n'est pas un défaut du protocole :
c'est la condition réelle d'un poste Windows. Mais cela signifie qu'un poste
sans antivirus, ou avec une exclusion, donnerait des chiffres **plus bas**.
**Non mesuré.**

## 2. Protocole

1. Arborescences **synthétiques** créées par le programme sous
   `spikes/.work/b3/`, 200 fichiers par dossier, contenu minuscule et jamais
   relu.
2. Deux parcours du **même** arbre :
   - **sans identité** — `read_dir` + `metadata()` seulement;
   - **avec identité** — idem, plus, pour chaque fichier, un `CreateFileW` en
     **accès nul** suivi de `GetFileInformationByHandleEx(FileIdInfo)` et d'un
     `CloseHandle`.
   L'écart entre les deux isole le **coût propre** de l'identité, comme
   l'exige §10.1.5.
3. **Cinq exécutions** par volumétrie. Médiane publiée, écart min–max complet.
   Aucune exécution écartée.
4. Chronométrage par `std::time::Instant`.
5. Le cache du système de fichiers **n'est pas vidé** entre les exécutions.
   Les arbres viennent d'être écrits : ils sont donc **chauds**. Un parcours à
   froid serait **plus lent**. **Non mesuré.**

## 3. Coût mesuré

| Éléments | Sans identité | Avec identité | Surcoût | Surcoût relatif | Coût par élément |
|---|---|---|---|---|---|
| 1 000 | **0,872 ms** | **33,674 ms** | +32,80 ms | +3 762 % | **32,80 µs** |
| 10 000 | **7,613 ms** | **291,148 ms** | +283,54 ms | +3 724 % | **28,35 µs** |
| 100 000 | **73,665 ms** | **2 903,309 ms** | +2 829,64 ms | +3 841 % | **28,30 µs** |

Écarts min–max, en millisecondes :

| Éléments | Sans identité | Avec identité |
|---|---|---|
| 1 000 | 0,841 – 1,374 | 31,876 – 37,248 |
| 10 000 | 7,329 – 8,334 | 287,480 – 312,203 |
| 100 000 | 73,117 – 84,061 | 2 835,578 – 2 940,970 |

**Taux d'obtention : 100 000 / 100 000.** Aucun échec à aucune volumétrie.

## 4. Lecture des chiffres

**Le coût est linéaire.** 28,35 µs par élément à 10 000, 28,30 µs à 100 000 :
aucun effondrement à l'échelle. La valeur plus élevée à 1 000 (32,80 µs) tient
au poids relatif des frais fixes sur un petit échantillon.

**Le coût relatif est énorme.** Obtenir l'identité multiplie la durée du
parcours par **environ 38**. C'est le poste dominant d'un parcours de
métadonnées, pas un détail d'optimisation.

**Le coût absolu est petit devant la cible.** §3.2 de
[BASELINE_TARGETS.md](BASELINE_TARGETS.md) fixe l'indexation complète de
`SYN-100K` à **≤ 90 s**. Le surcoût d'identité y pèse **2,83 s**, soit
**3,1 %** du budget.

**Les deux lectures sont vraies en même temps, et il faut retenir la seconde
pour décider** : la question posée par §10.2 est la compatibilité avec §3.2,
et elle est satisfaite avec une large marge.

**Réserve à ne pas perdre de vue.** Le parcours mesuré ne fait que parcourir et
ouvrir. Il **n'écrit dans aucune base**, ne calcule aucune empreinte et ne
construit aucun index. Les 90 s de budget devront couvrir tout cela. **2,83 s
n'est pas « négligeable » : c'est 3,1 % d'un budget dont le reste n'a jamais
été mesuré.**

## 5. Ce que ces mesures ne disent pas

- **NTFS uniquement.** Rien sur ReFS, FAT32, exFAT, volume réseau ou support
  amovible.
- **Un seul volume**, un seul poste, un seul système.
- **Arbres chauds en cache.** Un premier parcours à froid serait plus lent.
- **Antivirus actif**, non quantifié.
- **Aucun accès concurrent**, aucun fichier verrouillé, aucun refus de
  permission rencontré.
- **Aucune écriture en base**, donc **aucune mesure d'indexation réelle**. Les
  cibles de `BASELINE_TARGETS.md` restent **non testées** dans leur ensemble :
  `B3` n'en mesure qu'un poste.
- **Aucun fichier infonuagique**, donc rien sur le coût d'obtention de
  l'identité d'un espace réservé.
