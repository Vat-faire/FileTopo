# HANDOFF.md — Passation

**Date :** 2026-08-26
**De :** orchestrateur, vérification de `TASK-0008`
**Vers :** humain pour la connexion GitHub, puis orchestrateur

## État livré

- `TASK-0001` à `TASK-0007` : `VERIFIED`.
- `TASK-0008` : **`VERIFIED`** après trois tours Claude Code et une
  vérification indépendante de l'orchestrateur.
- `TASK-0009` : `APPROVED`, attend la réauthentification GitHub.
- Phase 6 : `IN_PROGRESS` depuis le GO humain spécial du propriétaire du
  2026-08-26.
- Aucun remote, aucun push, aucune release publique, aucune signature, aucune
  publication. Aucune connexion réseau n'a eu lieu.

## Ce qui a changé depuis la dernière passation

- Documentation publique en **anglais**, avec `README.fr.md` complet et
  équivalent. `docs/ai/**`, `graph/**`, `AGENTS.md`, `CLAUDE.md` et la
  checklist restent en français.
- L'application détecte la langue système : français pour une locale `fr`,
  anglais sinon, anglais en repli. Le bouton FR/EN est conservé et le choix
  explicite est mémorisé sous la clé `filetopo.locale`.
- La **fuite de chemins de compilation est corrigée** et vérifiée sur
  l'artefact : 336 occurrences → 0. Les empreintes SHA-256 de
  `docs/releases/0.1.0-alpha.1.md` sont vérifiées; les empreintes antérieures
  sont périmées et leurs artefacts ne doivent pas être distribués.
- Deux scripts ajoutés : `scripts/build-release-clean.ps1` et
  `scripts/scan-binary-for-personal-paths.ps1`.
- Tests : 4 → **36** côté interface, 11 → **13** côté Rust.

## Ce qui attend l'orchestrateur

1. Commiter localement la candidate `0.1.0-alpha.1` vérifiée.
2. Après la connexion humaine, exécuter `TASK-0009` : dépôt public, push,
   vérification CI et prerelease source seulement.

## Ce qui attend l'humain

- **Réauthentifier le compte GitHub `Vat-faire`** : l'authentification `gh` est
  expirée. Aucun agent ne doit tenter cette connexion.
- Aucune nouvelle autorisation de publication source n'est requise : le GO
  spécial est donné. Toute dépense ou signature reste interdite.

## Règles à ne pas relâcher

- Ne versionner aucun secret, chemin personnel ou donnée réelle.
- Tests exclusivement synthétiques ou temporaires.
- Le GO de phase 6 **ouvre la phase**; il n'autorise aucun agent exécuteur à
  agir hors du dépôt.
- Tout artefact destiné à sortir de la machine passe
  `scripts/scan-binary-for-personal-paths.ps1`, y compris après signature, qui
  réécrit le fichier.
- Ne pas coller un journal de construction brut dans une issue publique : il
  contient le chemin de compilation, contrairement à l'artefact.
- Le nom du propriétaire reste pour la paternité, la licence, la maintenance et
  les métadonnées; les mentions opérationnelles disent « le propriétaire ».
- Un seul exécuteur modifie le dépôt à la fois.
