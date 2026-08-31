// Budget de rendu AUTO-RÉGULÉ — TASK-0013 §5.2. CODE JETABLE.
//
// SOURCE UNIQUE : ce fichier est importé par Node (`replay-budget.mjs`,
// contrôle de déterminisme) ET injecté dans la page de mesure par
// `run-b2bis.mjs`, qui retire la dernière ligne `export`. Le contrôleur qui
// décide dans la page est donc, littéralement, celui qui est rejoué hors
// navigateur.
//
// ------------------------------------------------------- ce qu'il règle
// Le bouton de niveau de détail est le SEUIL D'AIRE : un bloc n'est construit
// que si sa surface à l'écran dépasse ce seuil. Monter le seuil agrège
// davantage et construit moins de blocs; le baisser détaille davantage.
//
// -------------------------------------- les cinq exigences de §5.2, tenues
// 1. IL MESURE AVANT DE DÉCIDER. La seule entrée de `observe()` est un temps
//    d'image RÉELLEMENT observé, relevé par l'horloge de rendu du navigateur.
//    Aucune estimation, aucune constante de coût, aucun modèle.
// 2. IL CONVERGE. L'échelle des niveaux est FINIE et discrète; une zone morte
//    sépare les deux décisions; un refroidissement interdit d'inverser le sens
//    avant `refroidissement` fenêtres. Une suite de décisions ne peut donc pas
//    alterner indéfiniment.
// 3. IL EST BORNÉ EN LISIBILITÉ. `seuilMax` est un PLANCHER DE LISIBILITÉ :
//    le contrôleur n'agrège JAMAIS au-delà, même quand la cible d'images par
//    seconde n'est pas atteinte. Il publie alors la décision
//    `plancher-lisibilite`, qui est un échec déclaré, pas un succès.
// 4. IL EST DÉTERMINISTE À CONDITIONS ÉGALES. Aucune horloge, aucun
//    `Date.now()`, aucun `Math.random()`, aucun accès au document : la suite
//    de décisions est une fonction pure de la suite des temps d'image et de la
//    configuration. `replay-budget.mjs` le vérifie en rejouant une trace
//    réelle.
// 5. IL N'ÉCRIT RIEN. Aucun `localStorage`, aucun fichier, aucun état hors de
//    l'objet rendu par `creerBudget()`.

/** Configuration de référence du banc. Déclarée AVANT toute mesure. */
const CONFIG_BUDGET = {
  cibleIps: 30,          // cible d'images par seconde
  fenetre: 12,           // nombre d'images observées avant chaque décision
  seuilMin: 60,          // px² — plafond de détail : on ne descend pas plus bas
  seuilMax: 2400,        // px² — PLANCHER DE LISIBILITÉ : on n'agrège pas plus
  ratio: 1.35,           // pas géométrique entre deux niveaux
  margeHaute: 1.15,      // trop lent au-delà de cibleIps × margeHaute
  margeBasse: 0.75,      // marge disponible en deçà de cibleIps × margeBasse
  refroidissement: 2,    // fenêtres à attendre avant d'inverser le sens
  niveauInitial: 4,
};

/**
 * Échelle discrète et FINIE des seuils d'aire, de `seuilMin` à `seuilMax`.
 * Le dernier niveau est exactement le plancher de lisibilité.
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
 * Crée un contrôleur de budget.
 * `observe(dtMs)` est appelé une fois par image, avec le temps d'image observé.
 * Il rend `null` tant que la fenêtre n'est pas pleine, puis une décision.
 */
function creerBudget(config) {
  const cfg = { ...CONFIG_BUDGET, ...(config || {}) };
  const seuils = echelleSeuils(cfg);
  const nMax = seuils.length - 1;
  let niveau = Math.max(0, Math.min(nMax, cfg.niveauInitial));
  let tampon = [];
  let refroid = 0;
  let dernierSens = 0;      // -1 affine, +1 agrège, 0 aucun
  let inversions = 0;
  let fenetres = 0;
  const journal = [];

  const hautMs = (1000 / cfg.cibleIps) * cfg.margeHaute;   // 38,333 ms à 30 ips
  const basMs = (1000 / cfg.cibleIps) * cfg.margeBasse;    // 25,000 ms à 30 ips

  function observe(dtMs) {
    tampon.push(dtMs);
    if (tampon.length < cfg.fenetre) return null;
    const med = mediane(tampon);
    tampon = [];
    fenetres++;
    const avant = niveau;
    let action;
    if (med > hautMs) {
      if (niveau < nMax) { niveau++; action = 'agrege'; refroid = cfg.refroidissement; }
      else action = 'plancher-lisibilite';
    } else if (med < basMs) {
      if (refroid > 0) { refroid--; action = 'refroidissement'; }
      else if (niveau > 0) { niveau--; action = 'affine'; refroid = cfg.refroidissement; }
      else action = 'detail-max';
    } else {
      if (refroid > 0) refroid--;
      action = 'stable';
    }
    const sens = niveau > avant ? 1 : (niveau < avant ? -1 : 0);
    if (sens !== 0) {
      if (dernierSens !== 0 && sens !== dernierSens) inversions++;
      dernierSens = sens;
    }
    const d = {
      fenetre: fenetres,
      medianeMs: +med.toFixed(3),
      niveauAvant: avant,
      niveauApres: niveau,
      action,
      seuilAvant: seuils[avant],
      seuilApres: seuils[niveau],
      changement: niveau !== avant,
      planchreAtteint: action === 'plancher-lisibilite',
      inversionsCumulees: inversions,
    };
    journal.push(d);
    return d;
  }

  return {
    observe,
    config: cfg,
    seuils,
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

export { CONFIG_BUDGET, echelleSeuils, mediane, creerBudget };
