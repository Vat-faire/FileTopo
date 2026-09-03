# DEC-0022 — L'IA est une couche facultative `BYOK` : elle suggère, elle n'établit jamais

- **Date :** 2026-09-02
- **Statut :** `APPROVED`
- **Phase :** étape **A** de la feuille de route — **réalignement produit**.
  La **fonction** est `DIFFÉRÉ`; seule la **frontière** est arrêtée maintenant
- **Décideur :** **Sébastien**, direction produit, relayée par l'orchestrateur
  technique dans le prompt de réalignement du 2026-09-02. **La direction
  produit n'est pas déléguée.**
- **Rédacteur de la fiche :** Claude Code, **exécuteur**. **Cette fiche
  enregistre une décision; elle ne la prend pas.**
- **Fondée sur :** [DEC-0012](DEC-0012-ai-architectural-boundary.md)
  (frontière `F-D`), [DEC-0021](DEC-0021-deterministic-relation-engine.md)
  (trois niveaux sémantiques, workflow humain),
  [DEC-0009](DEC-0009-data-model-and-relations.md) et la correction normative
  **`X1`** (une suggestion n'est pas une provenance),
  [PROJECT_VISION.md](../../PROJECT_VISION.md) (« fournisseurs configurables et
  modèles locaux », « consentement avant tout transfert distant »)
- **replaced_by :** —
- **Supplante :** rien. Elle **complète `DEC-0012`** : `DEC-0012` a dit **où
  passe la ligne**; celle-ci dit **ce qui a le droit de la traverser, et dans
  quel sens**

> **Cette fiche n'implémente rien, n'évalue aucun fournisseur, ne crée aucune
> dépendance et n'engage aucune dépense.**
>
> **Aucune clé, aucun compte, aucun point de terminaison, aucun modèle** n'est
> configuré, mentionné comme retenu, ni testé.
>
> **`F-047` est classée `DIFFÉRÉ`.** Rien n'en est construit avant une décision
> humaine séparée.

## Contexte

`DEC-0012` a placé la frontière de l'IA au bon endroit et l'a dit clairement :
aucune IA, aucune extraction, aucun embedding, aucun RAG dans le noyau MVP,
frontière `F-D`. Cela répondait à la question « où ? ».

`DEC-0021` vient de créer un objet qui n'existait pas quand `DEC-0012` a été
écrite : la **suggestion**, niveau 3, avec son workflow de confirmation et sa
mémoire de rejets. Cet objet change la question. Il existe désormais un endroit
du modèle où une source **faillible** peut légitimement déposer quelque chose
sans mentir — et c'est exactement la place qu'un `LLM` peut occuper.

Le risque, si on ne l'écrit pas maintenant, est double et symétrique : soit
l'IA s'installe comme **productrice de relations établies** parce que rien ne
l'interdit explicitement, soit elle s'installe comme **dépendance** — un
fournisseur unique, une clé attendue, un produit dégradé sans elle.

## La décision

### 1. L'IA n'est JAMAIS nécessaire au noyau de FileTopo

Un utilisateur **sans clé, sans compte, sans connexion et sans modèle local**
obtient un produit **complet**. Pas un produit bridé, pas un essai, pas un
mode dégradé, pas un bandeau qui propose d'activer quelque chose.

C'est la conséquence directe du principe fondamental de
[`DEC-0021`](DEC-0021-deterministic-relation-engine.md) §1 : **FileTopo doit
être très utile sans LLM.**

### 2. Architecture future provider-agnostic

Si une couche IA est un jour construite, elle est **agnostique du
fournisseur** :

- **OpenAI**;
- **Anthropic**;
- **Gemini**;
- **Mistral**;
- **fournisseurs compatibles**;
- **modèle local**;
- **autres, futurs**.

**FileTopo ne doit pas dépendre d'un fournisseur unique.** Aucun n'est
privilégié, aucun n'est un défaut, et le retrait de n'importe lequel ne casse
rien. Cette liste est **illustrative**, arrêtée à la date de la fiche : elle ne
constitue ni une évaluation, ni une sélection, ni un engagement.

### 3. `BYOK` — le client fournit sa propre clé

**Le client fournit sa propre clé, son point de terminaison, son contrat.**

FileTopo ne revend rien, n'intermédie rien, ne facture rien et ne détient
aucune clé pour le compte de quiconque. Une dépense, un abonnement ou un usage
payant relève **exclusivement** de l'utilisateur, avec son propre fournisseur.

**Cette fiche n'engage aucune dépense** et n'en autorise aucune : toute dépense
demeure un **point d'arrêt réservé à Sébastien**, sans délégation.

### 4. Un `LLM` ne crée JAMAIS silencieusement une relation établie

**Principe non négociable.**

Une couche IA produit une **SUGGESTION enrichie** — niveau 3 de `DEC-0021` —
et **rien d'autre**. Cette suggestion peut porter :

- la **source**;
- la **cible**;
- le **type proposé**;
- une **justification**;
- des **extraits/références autorisés**;
- le **fournisseur** et le **modèle**;
- la **date**;
- les **paramètres de provenance nécessaires à l'audit**.

L'humain peut ensuite **`APPROVE`** ou **`REJECT`**, par le workflow de
`DEC-0021` §8 — le même workflow, la même file de révision, les mêmes trois
actions. Une suggestion d'origine IA n'a **pas** de circuit privilégié.

**Une relation approuvée issue d'une suggestion IA reste de provenance
applicative `APPROVED`.**

**Aucune troisième provenance « AI » n'est introduite.** Le modèle reste
exactement celui de `DEC-0009` et de la correction `X1` : une relation établie
vaut `DETERMINISTIC` **ou** `APPROVED`. La trace du fournisseur, du modèle et
de la date vit dans les **métadonnées d'audit de la suggestion d'origine**,
jamais dans la provenance de la relation.

### 5. L'utilisateur choisit explicitement ce qui sort

**L'utilisateur choisit explicitement ce qu'un fournisseur externe peut
recevoir.** Le défaut est le silence : **rien ne sort tant que rien n'a été
autorisé**.

Niveaux d'autorisation à prévoir **conceptuellement** — non spécifiés, non
implémentés :

- **métadonnées seulement**;
- **contenu**;
- **pièces jointes**;
- **OCR**;
- **aucun envoi externe**.

Ces niveaux devront s'articuler avec
[`DEC-0023`](DEC-0023-identity-and-source-permissions.md) : **ce qu'un
utilisateur n'a pas le droit de voir ne peut pas être envoyé à un fournisseur
externe en son nom.** Une couche IA posée sur un modèle non conscient des
permissions serait une voie d'exfiltration, et c'est la raison pour laquelle la
séquence de `TASK-0021` §6 place les permissions **avant** l'IA.

### 6. Aucune implémentation maintenant

**Aucune** dépendance ajoutée, **aucun** `SDK`, **aucune** interface de
processus écrite, **aucun** champ de schéma réservé, **aucun** libellé
d'interface. `DEC-0012` a explicitement retenu `F-D` — l'interface de processus
s'écrit **au moment où la couche est réellement construite**, pas avant. Cette
fiche ne déclenche pas ce moment.

## Options examinées

| Option | Avantages | Inconvénients |
|--------|-----------|---------------|
| **A-A — Pas d'IA du tout, jamais** | Simplicité totale; aucune fuite possible; aucune dépendance | Ferme une piste qui a une vraie valeur pour des relations que nulle règle n'atteint; contredit `PROJECT_VISION.md`, qui prévoit un RAG facultatif cité |
| **A-B — IA intégrée, un fournisseur, dans le produit** | Expérience homogène; facile à démontrer | Dépendance à un tiers; coût récurrent porté par le projet; produit inutilisable hors ligne; contredit la vision et `DEC-0012` |
| **A-C — Couche facultative `BYOK`, provider-agnostic, productrice de suggestions seulement** *(retenue)* | Le noyau reste entier sans elle; aucun coût pour le projet; l'utilisateur maîtrise clé, fournisseur et données envoyées; l'IA entre par la porte prévue — le niveau 3 — sans toucher au modèle de provenance | Demande une abstraction de fournisseur; l'utilisateur doit fournir une clé, ce qui est une friction réelle; la qualité varie selon le modèle, donc les suggestions aussi |
| **A-D — IA autorisée à créer des relations établies sous une provenance « AI »** | Beaucoup de liens, sans travail humain | Détruit la garantie centrale du produit : trois provenances signifient qu'aucune ne veut plus rien dire; contredit `X1` frontalement; rend chaque relation invérifiable |

## Motif

**`A-C` plutôt que `A-D`** parce qu'une troisième provenance annulerait
exactement ce que la correction `X1` a établi. La valeur de `DETERMINISTIC` et
`APPROVED` tient à ce qu'il n'y a **que** ces deux-là : l'une est reproductible,
l'autre est assumée par un humain. Une provenance « AI » ne serait ni l'une ni
l'autre — irreproductible **et** non assumée — et l'utilisateur n'aurait aucun
moyen de savoir ce qu'il regarde.

**`A-C` plutôt que `A-B`** parce que la dépendance à un fournisseur unique est
un risque produit autant que technique : tarification, disponibilité,
conditions d'usage et confidentialité changent sans préavis, et un produit
gratuit, local d'abord et open source ne peut pas absorber cela.

**`A-C` plutôt que `A-A`** parce qu'interdire définitivement serait décider
aujourd'hui, sans besoin mesuré, l'inverse de ce que `DEC-0012` a
soigneusement évité : figer une hypothèse. `A-C` ne construit rien et n'empêche
rien.

## Conséquences

- **Une fonction est ajoutée à la matrice : `F-047`** — couche IA facultative
  `BYOK`, classée **`DIFFÉRÉ`**, aux côtés de `F-021`, `F-037`, `F-038`,
  `F-039`.
- **`DEC-0012` est inchangée** et reste en vigueur. La frontière `F-D` tient.
- **Aucune exigence de parité ne peut être satisfaite au moyen de cette
  couche** — contrat de parité §6, inchangé. Un produit sans IA satisfait
  **l'intégralité** du contrat.
- **La couche IA dépend de deux tranches antérieures** : le **workflow de
  validation** (`DEC-0021` §8), sans lequel une suggestion n'a nulle part où
  aller, et les **permissions** (`DEC-0023`), sans lesquelles l'envoi externe
  est une exfiltration. C'est le rang **7** de la séquence proposée.
- **Aucune dépense n'est engagée ni autorisée.** Toute dépense reste un point
  d'arrêt réservé à Sébastien.
- **Aucune donnée réelle n'est concernée.** Rien de ce qui précède ne
  s'applique à des données réelles tant qu'un GO explicite de Sébastien ne
  l'autorise pas : c'est également un point d'arrêt réservé.

## Preuves

**Aucune. Cette fiche est une décision de frontière, pas un résultat.** Aucun
fournisseur, aucun modèle, aucune bibliothèque n'a été évalué, testé, mesuré ni
contacté. Aucune source primaire externe n'appuie cette fiche : comme
`DEC-0012`, c'est une décision **interne de périmètre**, et l'absence de source
est déclarée ici.
