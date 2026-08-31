# TASK-0016 — P4-1 : tranche verticale de production minimale

- **Identifiant :** `TASK-0016`
- **Titre :** Première tranche de code de production — **une tranche verticale
  minimale** de la racine synthétique jusqu'à la carte sélectionnable, dans un
  **véritable hôte Tauri/WebView2**
- **Statut :** **`PROPOSED`**
- **Phase :** étape **A** de la feuille de route — parité fonctionnelle MVP,
  première tranche
- **Proposée le :** 2026-08-31
- **Rédacteur de la fiche :** Claude Code, sous le GO technique de
  l'orchestrateur pour `TASK-0015`
- **Exécuteur :** non désigné
- **GO d'exécution :** **NON ACQUIS.** Cette fiche **ne s'exécute pas.**

> **Rien de cette fiche n'est autorisé aujourd'hui.** Elle **spécifie** une
> tâche future. Son exécution suppose que la porte **`P4` soit franchie**, ce
> qui n'est pas le cas.
>
> Elle ne contient **aucun résultat**, **aucune mesure** et **aucun engagement
> de performance**.

## 1. Ce qui doit être vrai avant que cette fiche puisse démarrer

| # | Préalable | État au 2026-08-31 |
|---|---|---|
| 1 | Le **réalignement produit `TASK-0015`** est contrôlé par une instance distincte de son exécuteur | **non fait** |
| 2 | La porte **`P4`** est **franchie**, explicitement et par écrit | **non franchie** |
| 3 | Un GO d'exécution nomme cette fiche | **non acquis** |

**Tant que ces trois lignes ne sont pas vraies, aucune ligne de code de
production ne peut être écrite.**

## 2. Pourquoi une tranche verticale, et pas l'application

**Une tranche verticale traverse toutes les couches sur un périmètre étroit**,
plutôt que de construire une couche entière sur tout le périmètre. Le motif est
mesuré, pas théorique.

Trois campagnes de spike — `B2`, `B2 bis`, `B2 ter` — ont produit des chiffres
sur **Edge et Chrome**, et **jamais** sur le moteur de production. `DEC-0014` F
a établi que WebView2 **n'est pas instrumentable sans hôte embarqueur**, et que
l'écart avec Edge et Chrome est **NON MESURÉ**. Sur 18 couples non butés,
Chrome rend entre **0,50 et 0,71** fois les images par seconde d'Edge, sur la
même machine et la même page : **le moteur pèse au moins autant que le
mécanisme.**

**Conséquence :** la première chose que le code de production doit produire
n'est pas une fonctionnalité de plus, c'est **un hôte réel dans lequel mesurer
quoi que ce soit ait un sens**. Une tranche étroite l'atteint en semaines
plutôt qu'en mois, et transforme les hypothèses restantes en observations.

**Ce que la tranche n'est pas :** ni une maquette, ni un prototype jetable, ni
une reprise du code des spikes. C'est du **code de production**, écrit pour
durer, sur un périmètre volontairement petit.

## 3. Objectif unique

**Faire exister, en code de production et dans un véritable hôte
Tauri/WebView2, la chaîne complète : racine synthétique → scan → index
persistant → calepinage → carte en blocs hiérarchique → sélection → détails
avec parent et enfants directs.**

Rien d'autre.

## 4. Périmètre — les six exigences de parité couvertes, et aucune autre

| Exigence | Ce que la tranche doit satisfaire | Fonctions |
|---|---|---|
| `P-01` | La carte est construite depuis l'arborescence réellement observée, sans configuration ni catégorie codée en dur | `F-001`, `F-003`, `F-006`, `F-007` |
| `P-02` | Blocs hiérarchiques lisibles : aucune dimension nulle, aucun chevauchement entre frères, inclusion visuelle = relation parent/enfant | `F-007`, `F-008` |
| `P-03` | Parent et enfants directs visibles et atteignables depuis n'importe quel nœud | `F-016` |
| `P-11` | Panoramique, zoom borné, ajuster à l'écran, réinitialiser — souris **et** clavier | `F-009` à `F-012` |
| `P-12` | Panneau de détails : nom, type, chemin réel, taille, dates, parent, enfants, diagnostics d'accès **affichés** | `F-023` |
| `P-22` | **Aucun changement physique de l'arborescence analysée**, contrôlé par empreinte avant/après | `I-1`, `I-2` |

**Partiellement couverte, et déclarée telle :** `P-06`, pour la **seule**
sélection et l'accentuation **hiérarchique** — parent et enfants directs. Ni
relations transversales, ni atténuation liée à `F-017`.

**Explicitement hors périmètre de cette tranche**, et à reprendre dans des
tranches suivantes de l'étape **A** : `P-04`, `P-05`, `P-07` — relations
transversales, directions, panneau des relations —; `P-08`, `P-09` — recherche
et filtres —; `P-10` — légende —; `P-13` — contenu direct listé —; `P-14`,
`P-15` — copier le chemin, ouvrir dans l'Explorateur —; `P-16`, `P-17`,
`P-18` — changements, vu/non vu, surveillance —; `P-19`, `P-20` — persistance
des préférences, plusieurs cerveaux —; `P-21` — FR/EN complet.

**`P-21` mérite une précision.** L'accessibilité **clavier** de `P-11` et
`P-12` est **dans** le périmètre, parce qu'un parcours au clavier qu'on ajoute
après coup se reconstruit. Le **bilinguisme intégral** et l'**audit WCAG
complet** n'y sont pas.

## 5. Ce que la tranche doit produire

### 5.1 Chaîne fonctionnelle

1. **Hôte Tauri réel**, qui démarre sur Windows et charge l'interface dans
   **WebView2**.
2. **Choix d'une racine** parmi des **fixtures synthétiques du dépôt**,
   uniquement. **Aucun sélecteur de dossier réel dans cette tranche** : le
   point d'arrêt « donnée réelle » reste réservé à Sébastien.
3. **Scan** de l'arborescence, en **lecture seule stricte**.
4. **Index persistant**, schéma versionné, **reconstructible** : supprimer
   l'index et relancer produit un index équivalent.
5. **Calepinage** produisant des blocs hiérarchiques. **`CAL-B` est le candidat
   le mieux mesuré, et rien de plus** — `DEC-0015` D. Le code doit traiter le
   calepinage comme un **coût d'indexation**, payé une fois par arborescence,
   **jamais** comme un coût par image.
6. **Rendu** de la carte, **sélection** souris et clavier, **navigation**
   `P-11`, **panneau de détails** `P-12`.

### 5.2 La charge doit être bornée, et déclarée

**`DEC-0015` F l'impose :** cette tranche **n'embarque aucun budget de rendu
adaptatif**. Aucun contrôleur de `TASK-0013` ni de `TASK-0014` ne peut être
repris, en tout ou en partie.

**Elle doit donc borner sa charge autrement, et l'écrire dans la fiche avant
d'exécuter :** une volumétrie maximale de fixture, une profondeur maximale, ou
un plafond de blocs construits — **au choix de l'exécuteur, mais déclaré
d'avance et non retouché ensuite**.

**Interdit :** fixer une constante de budget « au jugé » et la présenter comme
mesurée. **Interdit :** ne rien déclarer.

### 5.3 Première mesure honnête dans WebView2

Une fois l'hôte réel existant, la tranche relève — **pour la première fois du
projet** — des temps d'image et une latence de sélection **dans WebView2**, sur
ses fixtures.

**Ces mesures ne lèvent pas `R8` à elles seules** : la réserve porte sur la
transposabilité à la production dans son ensemble, et sa levée appartient à
l'étape **C**. Elles constituent le **premier point de comparaison réel** entre
le moteur de production et les mesures de spike, et **ce seul écart est déjà un
livrable**.

## 6. Critères d'acceptation — à figer avant exécution

Ils devront être **écrits, commités et non retouchés** avant la première
exécution, sur le modèle de `TASK-0013` et `TASK-0014`. Les énoncés ci-dessous
sont la **trame à compléter**, pas des critères figés.

| # | Trame d'énoncé falsifiable |
|---|---|
| `H1` | Sur **quatre** fixtures synthétiques de formes différentes — large, profonde, mixte, quasi vide —, l'ensemble des nœuds cartographiés **égale** l'ensemble attendu, nœud par nœud |
| `H2` | Aucun bloc de dimension nulle, aucun chevauchement entre frères, et l'inclusion visuelle reproduit la relation parent/enfant **sur chaque nœud** |
| `H3` | Parent et enfants directs affichés **égalent** ceux de l'index, pour **chaque** nœud des quatre fixtures |
| `H4` | Panoramique, zoom borné, ajuster et réinitialiser sont atteignables **à la souris et au clavier**; **aucun état de vue hors bornes n'est atteignable**; « réinitialiser » reproduit exactement la vue d'ouverture, comparée paramètre par paramètre |
| `H5` | Le panneau de détails affiche des valeurs **égales à l'index** pour chaque nœud, **diagnostics d'accès compris**, jamais masqués |
| `H6` | **Empreinte de la fixture identique avant et après** une session complète exerçant `H1` à `H5`; **aucun fichier de FileTopo dans la racine analysée** |
| `H7` | Supprimer l'index puis relancer produit un index **équivalent** — mêmes nœuds, mêmes relations hiérarchiques; l'état non reconstructible est **énuméré** |
| `H8` | L'application **démarre et rend dans WebView2** sur Windows; le moteur employé et sa version sont **relevés et déclarés** |
| `H9` | Temps d'image et latence de sélection relevés **dans WebView2**, sur les fixtures, avec **médiane et écart min–max**, **cinq exécutions**; l'écart avec les mesures Edge et Chrome des spikes est **publié tel quel**, sans être expliqué a posteriori |
| `H10` | Le calepinage est payé **une fois par arborescence**, mesuré séparément du coût par image |
| `H11` | La borne de charge de §5.2 est **déclarée avant exécution** et **respectée** |

**Une cible manquée se publie comme manquée.** Aucune ne se réécrit après coup.

## 7. Conditions d'arrêt immédiat

L'exécution **s'arrête et demande**, sans contourner, si :

1. une étape exigerait une **donnée réelle**, un fichier ou un dossier de
   l'utilisateur — **point d'arrêt réservé à Sébastien**;
2. une action écrirait **hors du dépôt public**, hors de l'espace applicatif
   normal de l'application en cours d'exécution;
3. une action **modifierait** un élément de l'arborescence analysée —
   invariant `I-1`;
4. une **dépendance nouvelle** serait nécessaire sans être justifiée et
   approuvée;
5. l'état Git observé **diffère** de l'état attendu;
6. la portée s'élargit au-delà de §4 — **notamment** vers les relations
   transversales, la surveillance, la recherche ou plusieurs cerveaux;
7. il faudrait **reprendre un contrôleur de budget** de `TASK-0013` ou
   `TASK-0014` — `DEC-0015` F l'interdit.

## 8. Portes

| Porte | Objet | État |
|---|---|---|
| **P4** | **Autoriser la première tâche d'implémentation** | **Ouverte, non franchie.** Cette fiche ne peut pas démarrer avant |
| P5 | GO de Sébastien pour publication externe exceptionnelle, dépense, donnée réelle, opération destructive ou hors dépôt | Permanente |

**Qui franchit `P4`.** `TASK-0012` §18 la définit comme « autoriser la première
tâche d'implémentation, après lecture des verdicts ». C'est une **porte
technique**, que la délégation du 2026-08-31 place chez l'**orchestrateur
technique** — **sauf si Sébastien choisit de la reprendre**, ce qu'il peut
faire à tout moment. La décision de la franchir **n'est pas prise par cette
fiche**.

## 9. État final attendu

**`TASK-0016` se terminera `IMPLEMENTED`, jamais `VERIFIED`.** L'exécuteur ne
juge pas ses propres preuves.

## 10. Historique de l'état

- 2026-08-31 — `PROPOSED` : fiche rédigée par `TASK-0015`, **non approuvée,
  non exécutée**. Aucune ligne de code, aucune mesure, aucune branche créée.

## 11. Ce que cette fiche ne fait pas

Elle **n'exécute rien**, **ne franchit pas `P4`**, **n'écrit aucune ligne de
code**, **ne crée aucune branche**, **n'installe aucune dépendance** et **ne
mesure rien**. Elle ne lève aucune réserve : `V1` à `V4`, `W1` à `W4` et `R2` à
`R9` restent en vigueur.
