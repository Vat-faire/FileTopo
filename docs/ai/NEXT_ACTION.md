# NEXT_ACTION.md — Prochaine action

**Dernière mise à jour :** 2026-08-26

Ce fichier contient **exactement une** action.

---

## ACTION-0014 — Observer l'alpha avant d'ouvrir une fonction avancée

- **Tâche visée :** aucune tâche ouverte
- **Statut :** `DEFERRED`
- **Exécutant :** orchestrateur après signal concret ou demande du propriétaire
- **Phase :** 7 — fonctions avancées optionnelles

### Objet

Observer les retours et incidents de la préversion source seulement
`v0.1.0-alpha.1`. N'ouvrir une tâche de phase 7 qu'à partir d'un besoin concret,
documenté et compatible avec les garanties locales et en lecture seule.

### Point de départ vérifié le 2026-08-26

`TASK-0009` et la phase 6 sont `VERIFIED`. Le dépôt public, la CI Windows et la
prerelease source seulement sont accessibles. Aucun binaire n'est distribué.

### Interdit dans cette action

Activation implicite d'IA, OCR, connecteur distant ou réorganisation physique;
téléversement de binaire, signature, achat, secret ou accès à un corpus privé.

### Suite attendue

Aucune action immédiate. Conserver la phase 7 en `DEFERRED` jusqu'à un signal
concret; toute nouvelle tâche devra définir ses critères et ses preuves avant
implémentation.
