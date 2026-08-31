// Budget de rendu AUTO-RÉGULÉ, CORRIGÉ — TASK-0014 §5.1 et §5.2. CODE JETABLE.
//
// SOURCE UNIQUE : ce fichier est importé par Node (`replay-budget2.mjs`,
// contrôle de déterminisme) ET injecté dans la page de mesure par
// `run-b2ter.mjs`, qui retire les lignes `import`/`export`. Le contrôleur qui
// décide dans la page est donc, littéralement, celui qui est rejoué hors
// navigateur.
//
// ======================================================================
// CE QUI CHANGE PAR RAPPORT AU CONTRÔLEUR DE TASK-0013, ET RIEN D'AUTRE
// ======================================================================
//
// `TASK-0013` a RÉFUTÉ `F4`. `ACTION-0023` a accepté cette réfutation et
// `DEC-0014` D en tire que le contrôleur écrit n'est PAS adopté. Deux causes
// mesurées, et deux seulement, sont corrigées ici.
//
// CAUSE 1 — la zone morte tolérait un régime stable SOUS la cible.
//   Avant : `margeHaute = 1,15` plaçait le déclenchement de l'agrégation à
//   38,333 ms, soit 26,1 ips. Un état à 26,60 ips était donc jugé « stable »
//   par un contrôleur qui vise 30 ips.
//   Après : le seuil lent vaut EXACTEMENT `1000 / cibleIps` ms. Il n'existe
//   AUCUNE marge permettant un régime stable sous la cible. `margeHaute` est
//   supprimée, pas ajustée.
//
// CAUSE 2 — l'affinage continu coûtait trois fenêtres par niveau.
//   Avant : chaque mouvement armait le refroidissement, et la branche
//   « rapide » consommait ce refroidissement au lieu d'affiner — trois
//   fenêtres par niveau, environ 3,6 s pour revenir au détail maximal.
//   Après : plusieurs mouvements DANS LE MÊME SENS s'enchaînent SANS
//   refroidissement. Le refroidissement ne sert QU'À empêcher une INVERSION de
//   direction trop rapide, et il dure 2 fenêtres.
//
// Rien d'autre ne change : ni la cible, ni la taille de fenêtre, ni l'échelle
// des seuils, ni le plancher de lisibilité, ni le niveau initial.
//
// -------------------------------------- les cinq exigences de §5.2, tenues
// 1. IL MESURE AVANT DE DÉCIDER. La seule entrée de `observe()` est un temps
//    d'image RÉELLEMENT observé, relevé par l'horloge de rendu du navigateur.
// 2. IL CONVERGE. L'échelle des niveaux est FINIE et discrète; une zone morte
//    sépare les deux décisions; une inversion de direction ne peut pas suivre
//    immédiatement une autre inversion. Une suite de décisions ne peut donc
//    pas alterner indéfiniment.
// 3. IL EST BORNÉ EN LISIBILITÉ. `seuilMax` est un PLANCHER DE LISIBILITÉ :
//    le contrôleur n'agrège JAMAIS au-delà, même quand la cible n'est pas
//    atteinte. Il publie alors `plancher-lisibilite`, un échec déclaré.
// 4. IL EST DÉTERMINISTE À CONDITIONS ÉGALES. Aucune horloge, aucun
//    `Date.now()`, aucun `Math.random()`, aucun accès au document.
// 5. IL N'ÉCRIT RIEN. Aucun stockage, aucun fichier, aucun état hors de
//    l'objet rendu par `creerBudget2()`.

/**
 * Configuration de référence du banc `B2 ter`.
 *
 * DÉCLARÉE ET COMMITÉE AVANT TOUTE MESURE, conformément à `TASK-0014` §5.2.
 * Aucune de ces valeurs ne peut être retouchée après le premier résultat de
 * performance : ce serait une violation de `G9`.
 */
const CONFIG_BUDGET_2 = {
  cibleIps: 30,          // cible d'images par seconde
  fenetre: 12,           // images observées avant chaque décision
  seuilMin: 60,          // px² — plafond de détail
  seuilMax: 2400,        // px² — PLANCHER DE LISIBILITÉ, jamais franchi
  ratio: 1.35,           // pas géométrique entre deux niveaux
  niveauInitial: 4,
  // Seuil LENT : EXACTEMENT 1000 / cibleIps ms. Aucune marge. Voir CAUSE 1.
  // Il n'est pas paramétrable : le rendre paramétrable rouvrirait la faille.
  // Seuil RAPIDE : 25 ms, soit 40 ips. C'est la seule marge du contrôleur, et
  // elle est du côté SÛR : elle retarde l'affinage, jamais l'agrégation.
  seuilRapideMs: 25,
  // Refroidissement APRÈS INVERSION, en fenêtres. Voir CAUSE 2. Il ne
  // s'applique JAMAIS à un mouvement de même sens.
  refroidissementApresInversion: 2,
};

/** Seuil « trop lent », en millisecondes. Exactement la cible, sans marge. */
function seuilLentMs(cfg) {
  return 1000 / cfg.cibleIps;
}

/**
 * Échelle discrète et FINIE des seuils d'aire, de `seuilMin` à `seuilMax`.
 * Le dernier niveau est exactement le plancher de lisibilité.
 * Reprise sans modification du contrôleur de `TASK-0013`.
 */
function echelleSeuils(cfg) {
  const s = [];
  let v = cfg.seuilMin;
  while (v < cfg.seuilMax) { s.push(+v.toFixed(4)); v *= cfg.ratio; }
  s.push(cfg.seuilMax);
  return s;
}

/** Médiane d'un tableau non vide. Pas de tri en place sur l'entrée. */
function mediane(xs) {
  const s = [...xs].sort((a, b) => a - b);
  return s[(s.length - 1) >> 1];
}

/**
 * Crée un contrôleur de budget corrigé.
 * `observe(dtMs)` est appelé une fois par image, avec le temps d'image
 * réellement observé. Il rend `null` tant que la fenêtre n'est pas pleine,
 * puis une décision.
 */
function creerBudget2(config) {
  const cfg = { ...CONFIG_BUDGET_2, ...(config || {}) };
  const seuils = echelleSeuils(cfg);
  const nMax = seuils.length - 1;
  let niveau = Math.max(0, Math.min(nMax, cfg.niveauInitial));
  let tampon = [];
  let refroid = 0;          // fenêtres restantes pendant lesquelles une
                            // INVERSION est interdite
  let dernierSens = 0;      // -1 affine, +1 agrège, 0 aucun mouvement encore
  let inversions = 0;
  let fenetres = 0;
  const journal = [];

  const lentMs = seuilLentMs(cfg);          // 33,3333… ms à 30 ips
  const rapideMs = cfg.seuilRapideMs;       // 25 ms

  function observe(dtMs) {
    tampon.push(dtMs);
    if (tampon.length < cfg.fenetre) return null;
    const med = mediane(tampon);
    tampon = [];
    fenetres++;
    const avant = niveau;

    // 1. Le sens VOULU, décidé sur la seule médiane observée.
    //    Strictement au-dessus du seuil lent : trop lent, il faut agréger.
    //    Strictement en dessous du seuil rapide : de la marge, il faut affiner.
    let sensVoulu = 0;
    if (med > lentMs) sensVoulu = 1;
    else if (med < rapideMs) sensVoulu = -1;

    // 2. Le refroidissement n'interdit QU'UNE INVERSION. Un mouvement de même
    //    sens passe toujours : c'est la correction de la CAUSE 2.
    const inversion = sensVoulu !== 0 && dernierSens !== 0 && sensVoulu !== dernierSens;
    let action;
    let armeRefroidissement = false;

    if (sensVoulu === 0) {
      action = 'stable';
    } else if (inversion && refroid > 0) {
      action = 'refroidissement';
    } else if (sensVoulu === 1 && niveau >= nMax) {
      action = 'plancher-lisibilite';
    } else if (sensVoulu === -1 && niveau <= 0) {
      action = 'detail-max';
    } else {
      niveau += sensVoulu;
      action = sensVoulu === 1 ? 'agrege' : 'affine';
      if (inversion) { inversions++; refroid = cfg.refroidissementApresInversion; armeRefroidissement = true; }
      dernierSens = sensVoulu;
    }

    // 3. Décrément de fin de fenêtre, sauf si le refroidissement vient d'être
    //    armé : il doit alors durer les DEUX fenêtres suivantes, pleines.
    if (!armeRefroidissement && refroid > 0) refroid--;

    const d = {
      fenetre: fenetres,
      medianeMs: +med.toFixed(3),
      ipsFenetre: +(1000 / med).toFixed(2),
      niveauAvant: avant,
      niveauApres: niveau,
      action,
      sensVoulu,
      inversion,
      refroidRestant: refroid,
      seuilAvant: seuils[avant],
      seuilApres: seuils[niveau],
      changement: niveau !== avant,
      plancherAtteint: action === 'plancher-lisibilite',
      inversionsCumulees: inversions,
    };
    journal.push(d);
    return d;
  }

  return {
    observe,
    config: cfg,
    seuils,
    seuilLentMs: lentMs,
    seuilRapideMs: rapideMs,
    niveauMax: nMax,
    niveau: () => niveau,
    seuilCourant: () => seuils[niveau],
    plancherLisibilite: cfg.seuilMax,
    inversions: () => inversions,
    journal: () => journal,
    // Signature compacte de la suite de décisions, pour comparer deux
    // exécutions caractère par caractère.
    signature: () => journal.map((d) => d.fenetre + ':' + d.medianeMs + ':' + d.niveauAvant
      + '>' + d.niveauApres + ':' + d.action).join('|'),
  };
}

export { CONFIG_BUDGET_2, seuilLentMs, echelleSeuils, mediane, creerBudget2 };
