// Les DEUX calepins comparés par TASK-0013 §5.1. CODE JETABLE.
//
// SOURCE UNIQUE : ce fichier est importé par Node ET injecté dans la page de
// mesure par `run-b2bis.mjs`, qui retire la dernière ligne `export`.
//
// ------------------------------------------------------------------ CAL-A
// `calepinAlterne` est le découpage alterné (« slice and dice ») déjà mesuré
// par `B2`. Il est repris **SANS MODIFICATION** de
// `spikes/b2-svg-rendering/map.html`, fonction `layout()` : même signature,
// même marge, même bandeau de titre de 12 px, même répartition par poids,
// même alternance. Le seul changement est le nom de la fonction. Cette
// reconduction à l'identique est ce qui fait de `CAL-A` une référence.
//
// ------------------------------------------------------------------ CAL-B
// `calepinSquarifie` est le pavage squarifié, ÉCRIT ICI à partir de sa
// description publiée (Bruls, Huizing, van Wijk, « Squarified Treemaps »,
// 2000), et non importé d'une bibliothèque — TASK-0013 §4.3.
//
// Pour que la comparaison ne porte QUE sur le pavage, `CAL-B` conserve
// exactement les mêmes conventions de contenant que `CAL-A` : même marge
// `pad`, même bandeau de titre de 12 px, mêmes surfaces proportionnelles au
// poids, même récursion sur les enfants. Seule la façon de découper le
// rectangle intérieur change.

/**
 * CAL-A — découpage récursif alterné. Repris sans modification de `B2`.
 * Chaque nœud reçoit un rectangle, réparti entre ses enfants
 * proportionnellement à leur poids.
 */
function calepinAlterne(n, x, y, w, h, horizontal) {
  n.x = x; n.y = y; n.w = w; n.h = h;
  if (!n.enfants.length) return;
  const pad = Math.min(2, w * 0.02, h * 0.02);
  let cx = x + pad, cy = y + pad;
  const cw = Math.max(0, w - pad * 2), ch = Math.max(0, h - pad * 2 - 12);
  cy += 12; // bandeau de titre
  const total = n.enfants.reduce((a, c) => a + c.poids, 0) || 1;
  for (const c of n.enfants) {
    const frac = c.poids / total;
    if (horizontal) {
      const cwi = cw * frac;
      calepinAlterne(c, cx, cy, cwi, ch, !horizontal);
      cx += cwi;
    } else {
      const chi = ch * frac;
      calepinAlterne(c, cx, cy, cw, chi, !horizontal);
      cy += chi;
    }
  }
}

/**
 * Pire rapport d'aspect d'une rangée, tel que défini par l'article :
 *   worst(R, w) = max( w² · r_max / s² , s² / (w² · r_min) )
 * où `s` est la somme des aires de la rangée et `w` la longueur du côté le
 * long duquel la rangée est posée.
 */
function pireRapport(aireMin, aireMax, somme, cote) {
  if (somme <= 0 || cote <= 0 || aireMin <= 0) return Infinity;
  const s2 = somme * somme, c2 = cote * cote;
  return Math.max((c2 * aireMax) / s2, s2 / (c2 * aireMin));
}

/**
 * Pose une liste d'éléments `{c, a}` (aires déjà proportionnées) dans le
 * rectangle (x, y, w, h) par rangées squarifiées.
 */
function poseSquarifiee(items, x, y, w, h) {
  let i = 0;
  while (i < items.length) {
    if (w <= 0 || h <= 0) {            // plus de place : rectangles nuls
      for (; i < items.length; i++) {
        const c = items[i].c; c.x = x; c.y = y; c.w = 0; c.h = 0;
      }
      return;
    }
    const cote = Math.min(w, h);
    // Constitution de la rangée : on ajoute tant que le pire rapport s'améliore.
    let j = i, somme = 0, aMin = Infinity, aMax = 0, pire = Infinity;
    while (j < items.length) {
      const a = items[j].a;
      const s2 = somme + a;
      const p2 = pireRapport(Math.min(aMin, a), Math.max(aMax, a), s2, cote);
      if (j > i && p2 > pire) break;
      somme = s2; aMin = Math.min(aMin, a); aMax = Math.max(aMax, a); pire = p2; j++;
    }
    const epaisseur = somme > 0 ? somme / cote : 0;
    if (w <= h) {
      // Rangée horizontale, sur toute la largeur.
      let cx = x;
      for (let k = i; k < j; k++) {
        const c = items[k].c;
        const li = epaisseur > 0 ? items[k].a / epaisseur : 0;
        c.x = cx; c.y = y; c.w = li; c.h = epaisseur;
        cx += li;
      }
      y += epaisseur; h -= epaisseur;
    } else {
      // Rangée verticale, sur toute la hauteur.
      let cy = y;
      for (let k = i; k < j; k++) {
        const c = items[k].c;
        const li = epaisseur > 0 ? items[k].a / epaisseur : 0;
        c.x = x; c.y = cy; c.w = epaisseur; c.h = li;
        cy += li;
      }
      x += epaisseur; w -= epaisseur;
    }
    i = j;
  }
}

/**
 * CAL-B — pavage squarifié.
 * Le tri décroissant se fait sur une COPIE : `n.enfants` conserve son ordre
 * d'origine, donc `aria-posinset`, `aria-setsize` et l'ordre de parcours au
 * clavier sont exactement ceux de `CAL-A`.
 */
function calepinSquarifie(n, x, y, w, h) {
  n.x = x; n.y = y; n.w = w; n.h = h;
  if (!n.enfants.length) return;
  const pad = Math.min(2, w * 0.02, h * 0.02);
  const cx = x + pad, cy = y + pad + 12;          // même bandeau de titre
  const cw = Math.max(0, w - pad * 2), ch = Math.max(0, h - pad * 2 - 12);
  const total = n.enfants.reduce((a, c) => a + c.poids, 0) || 1;
  const aire = cw * ch;
  const items = new Array(n.enfants.length);
  for (let i = 0; i < n.enfants.length; i++) {
    const c = n.enfants[i];
    items[i] = { c, a: (aire * c.poids) / total };
  }
  items.sort((p, q) => q.a - p.a);
  poseSquarifiee(items, cx, cy, cw, ch);
  for (let i = 0; i < n.enfants.length; i++) {
    const c = n.enfants[i];
    calepinSquarifie(c, c.x, c.y, c.w, c.h);
  }
}

/** Point d'entrée commun : applique le calepin nommé à la racine. */
function appliqueCalepin(nom, racine, x, y, w, h) {
  if (nom === 'CAL-B') calepinSquarifie(racine, x, y, w, h);
  else calepinAlterne(racine, x, y, w, h, true);
}

export { calepinAlterne, calepinSquarifie, poseSquarifiee, pireRapport, appliqueCalepin };
