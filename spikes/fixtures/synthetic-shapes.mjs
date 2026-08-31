// Générateur des QUATRE formes d'arborescence ENTIÈREMENT SYNTHÉTIQUES de
// `B2 bis` (TASK-0013).
//
// Aucune donnée réelle. Aucun accès au disque de l'utilisateur. Aucun nom, ni
// chemin, ni taille, ni date provenant d'un fichier existant. Tout est produit
// par un générateur pseudo-aléatoire à graine fixe, donc reproductible.
//
// SOURCE UNIQUE. Ce fichier est :
//   - importé tel quel par Node, pour décrire et vérifier les formes;
//   - injecté tel quel dans la page de mesure par `run-b2bis.mjs`, qui retire
//     la dernière ligne `export`.
// Les deux chemins exécutent donc EXACTEMENT le même code : la page et le
// pilote ne peuvent pas diverger.
//
// `SYN-DEEP`, `SYN-WIDE` et `SYN-EQUILIBRE` sont repris **sans modification**
// de `spikes/b2-svg-rendering/map.html` (banc `B2` de TASK-0012), afin que la
// comparaison avec `B2` reste valide. `SYN-100K` est ajouté par TASK-0013 §5.3.

/** PRNG déterministe (mulberry32). Même graine, même arborescence. */
function rngB2bis(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), 1 | t);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEG_B2BIS = ['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'hotel',
                   'india', 'juliett', 'kilo', 'lima', 'mike', 'november', 'oscar', 'papa'];

/**
 * Construit une des quatre formes synthétiques.
 *
 * @param {'SYN-DEEP'|'SYN-WIDE'|'SYN-EQUILIBRE'|'SYN-100K'} shape
 * @param {number} count nombre total de nœuds
 * @param {number} seed  graine fixe
 */
function construireArbre(shape, count, seed) {
  const r = rngB2bis(seed);
  let id = 0;
  const mk = (depth) => ({ id: id++, nom: SEG_B2BIS[(id * 7) % SEG_B2BIS.length] + '-' + id.toString(36),
                           enfants: [], poids: 1, depth });
  const racine = mk(0);

  if (shape === 'SYN-WIDE') {
    // Une branche de 5 000 enfants directs, plus du remplissage autour.
    for (let i = 0; i < 5000; i++) racine.enfants.push(mk(1));
    let reste = count - 5001;
    while (reste > 0) {
      const p = racine.enfants[Math.floor(r() * racine.enfants.length)];
      p.enfants.push(mk(2)); reste--;
    }
  } else if (shape === 'SYN-DEEP') {
    // Une chaîne de profondeur 40, chaque niveau portant quelques feuilles.
    let cur = racine;
    for (let d = 1; d <= 40; d++) {
      const n = mk(d);
      cur.enfants.push(n);
      cur = n;
    }
    let reste = count - 41;
    const tous = [];
    (function collecte(n) { tous.push(n); n.enfants.forEach(collecte); })(racine);
    while (reste > 0) {
      const p = tous[Math.floor(r() * tous.length)];
      const n = mk(p.depth + 1);
      p.enfants.push(n); tous.push(n); reste--;
    }
  } else if (shape === 'SYN-100K') {
    // ------------------------------------------------------------------ §5.3
    // Forme de volumétrie, ajoutée par TASK-0013 pour rendre applicable À LA
    // LETTRE le protocole de falsification de DEC-0008.
    //
    //   - nombre d'éléments : `count` (100 000 dans le banc);
    //   - remplissage en largeur d'abord, donc arborescence RÉGULIÈRE;
    //   - facteur de branchement tiré uniformément dans [4, 14];
    //   - profondeur maximale autorisée : 8 niveaux sous la racine;
    //   - graine fixe.
    //
    // La distribution des tailles n'est pas inventée séparément : comme dans
    // `B2`, la surface d'un bloc est proportionnelle à son POIDS, c'est-à-dire
    // à son nombre de descendants. Elle découle donc de la forme, et elle est
    // mesurée puis publiée par `decrireArbre()`.
    const file = [racine];
    let reste = count - 1;
    while (reste > 0 && file.length) {
      const p = file.shift();
      if (p.depth >= 8) continue;
      const k = 4 + Math.floor(r() * 11);
      for (let i = 0; i < k && reste > 0; i++) {
        const n = mk(p.depth + 1);
        p.enfants.push(n); reste--;
        if (n.depth < 8) file.push(n);
      }
    }
    // Filet de sécurité : si la file s'épuise avant le compte visé, on complète
    // sur les nœuds les moins profonds. N'a pas été atteint aux paramètres du
    // banc; conservé pour que la fonction reste totale.
    if (reste > 0) {
      const tous = [];
      (function collecte(n) { if (n.depth < 8) tous.push(n); n.enfants.forEach(collecte); })(racine);
      let i = 0;
      while (reste > 0 && tous.length) {
        const p = tous[i++ % tous.length];
        p.enfants.push(mk(p.depth + 1)); reste--;
      }
    }
  } else {
    const tous = [racine];
    for (let i = 1; i < count; i++) {
      const p = tous[Math.floor(r() * tous.length)];
      const n = mk(p.depth + 1);
      p.enfants.push(n); tous.push(n);
    }
  }

  // Poids = nombre de descendants, pour la répartition des surfaces.
  (function poids(n) {
    let s = 1;
    for (const c of n.enfants) s += poids(c);
    n.poids = s;
    return s;
  })(racine);
  return racine;
}

/** Décrit une arborescence par sa forme : compte, profondeur, branchement, poids. */
function decrireArbre(racine) {
  let n = 0, profondeurMax = 0, feuilles = 0;
  const enfantsParDossier = [];
  const poids = [];
  const pile = [racine];
  while (pile.length) {
    const x = pile.pop();
    n++;
    if (x.depth > profondeurMax) profondeurMax = x.depth;
    poids.push(x.poids);
    if (x.enfants.length) enfantsParDossier.push(x.enfants.length);
    else feuilles++;
    for (let i = 0; i < x.enfants.length; i++) pile.push(x.enfants[i]);
  }
  const q = (xs, p) => {
    if (!xs.length) return 0;
    const s = [...xs].sort((a, b) => a - b);
    return s[Math.min(s.length - 1, Math.floor(s.length * p))];
  };
  return {
    noeuds: n,
    profondeurMax,
    feuilles,
    dossiers: n - feuilles,
    enfantsDirectsMax: enfantsParDossier.length ? Math.max(...enfantsParDossier) : 0,
    enfantsDirectsMedian: q(enfantsParDossier, 0.5),
    branchementMoyen: enfantsParDossier.length
      ? +((n - 1) / enfantsParDossier.length).toFixed(3) : 0,
    poidsMedian: q(poids, 0.5),
    poidsP99: q(poids, 0.99),
    poidsMax: poids.length ? Math.max(...poids) : 0,
  };
}

/** Paramètres des quatre formes du banc. Graine fixe, identique pour toutes. */
const FORMES_B2BIS = [
  { forme: 'SYN-EQUILIBRE', count: 20000, seed: 20260831 },
  { forme: 'SYN-DEEP', count: 20000, seed: 20260831 },
  { forme: 'SYN-WIDE', count: 20000, seed: 20260831 },
  { forme: 'SYN-100K', count: 100000, seed: 20260831 },
];

export { rngB2bis, construireArbre, decrireArbre, FORMES_B2BIS };
