# NEXT_ACTION.md — Prochaine action

**Dernière mise à jour :** 2026-08-26

Ce fichier contient **exactement une** action.

---

## ACTION-0013 — Réauthentifier GitHub puis publier la source

- **Tâche visée :** `TASK-0009`
- **Statut :** `BLOCKED` — attend la réauthentification humaine GitHub
- **Exécutant :** humain pour la connexion, puis orchestrateur
- **GO humain :** spécial de phase 6, donné par le propriétaire le 2026-08-26
- **Phase :** 6

### Objet

Réauthentifier le compte GitHub `Vat-faire`, puis créer le dépôt public
`Vat-faire/FileTopo`, pousser la branche vérifiée et publier la prerelease
source seulement `v0.1.0-alpha.1`.

### Préparation vérifiée le 2026-08-26

`TASK-0008` est `VERIFIED`. Documentation anglaise/française, divulgation IA,
36 tests interface, 13 tests Rust, audits et release nettoyée sont vérifiés.
La décision est une publication **source seulement**, sans binaire.

### Interdit dans cette action

Téléversement de binaire, signature, achat, secret, journal local, package,
domaine, page ou accès à un corpus utilisateur ou privé.

### Suite attendue

Le propriétaire doit compléter `gh auth login` pour `Vat-faire`. Le GO spécial
et l'identité publique sont déjà approuvés; aucune autre autorisation n'est
requise pour les actions exactement bornées par `TASK-0009`.
