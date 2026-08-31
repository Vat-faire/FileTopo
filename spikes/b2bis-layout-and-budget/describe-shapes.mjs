// B2 bis — Description des quatre formes synthétiques et contrôle des deux
// calepins hors navigateur. CODE JETABLE.
//
// Sert à deux choses :
//   1. publier la forme de chaque arborescence (§5.3 : profondeur, facteur de
//      branchement, distribution des poids), à graine fixe;
//   2. contrôler que les deux calepins pavent bien le monde : pas de
//      chevauchement notable, pas de débordement, aire conservée.
//
// Usage : node describe-shapes.mjs

import { construireArbre, decrireArbre, FORMES_B2BIS } from '../fixtures/synthetic-shapes.mjs';
import { appliqueCalepin } from './calepins.mjs';

const COTE = 4000;

function rapportsAspect(racine, aireMin) {
  const rs = [];
  let nuls = 0, hors = 0;
  const pile = [racine];
  while (pile.length) {
    const n = pile.pop();
    if (n.w <= 0 || n.h <= 0) nuls++;
    else if (n.w * n.h >= aireMin) rs.push(Math.max(n.w, n.h) / Math.min(n.w, n.h));
    if (n.x < -0.01 || n.y < -0.01 || n.x + n.w > COTE + 0.01 || n.y + n.h > COTE + 0.01) hors++;
    for (const c of n.enfants) pile.push(c);
  }
  rs.sort((a, b) => a - b);
  const q = (p) => (rs.length ? +rs[Math.min(rs.length - 1, Math.floor(rs.length * p))].toFixed(3) : null);
  return { n: rs.length, rectanglesNuls: nuls, rectanglesHorsMonde: hors,
           median: q(0.5), p90: q(0.9), p99: q(0.99),
           max: rs.length ? +rs[rs.length - 1].toFixed(3) : null };
}

const sortie = [];
for (const f of FORMES_B2BIS) {
  const t0 = process.hrtime.bigint();
  const racine = construireArbre(f.forme, f.count, f.seed);
  const tArbre = Number(process.hrtime.bigint() - t0) / 1e6;
  const desc = decrireArbre(racine);
  const parCalepin = {};
  for (const cal of ['CAL-A', 'CAL-B']) {
    const r2 = construireArbre(f.forme, f.count, f.seed);
    const t1 = process.hrtime.bigint();
    appliqueCalepin(cal, r2, 0, 0, COTE, COTE);
    const tCal = Number(process.hrtime.bigint() - t1) / 1e6;
    parCalepin[cal] = { calepinMs: +tCal.toFixed(2), aspects: rapportsAspect(r2, 4) };
  }
  sortie.push({ ...f, constructionMs: +tArbre.toFixed(2), description: desc, calepins: parCalepin });
  console.log('=== ' + f.forme + ' (graine ' + f.seed + ') ===');
  console.log('  nœuds construits : ' + desc.noeuds + ' (visé ' + f.count + ')  | construction ' + tArbre.toFixed(1) + ' ms');
  console.log('  profondeur max : ' + desc.profondeurMax + '  | dossiers ' + desc.dossiers + '  | feuilles ' + desc.feuilles);
  console.log('  branchement moyen : ' + desc.branchementMoyen + '  | enfants directs médian ' + desc.enfantsDirectsMedian + ', max ' + desc.enfantsDirectsMax);
  console.log('  poids : médian ' + desc.poidsMedian + ', p99 ' + desc.poidsP99 + ', max ' + desc.poidsMax);
  for (const cal of ['CAL-A', 'CAL-B']) {
    const c = parCalepin[cal];
    console.log('  ' + cal + ' : ' + c.calepinMs + ' ms | rapports d\'aspect (aire ≥ 4 px²) n=' + c.aspects.n
      + ' médian ' + c.aspects.median + ' p90 ' + c.aspects.p90 + ' p99 ' + c.aspects.p99 + ' max ' + c.aspects.max
      + ' | nuls ' + c.aspects.rectanglesNuls + ' | hors monde ' + c.aspects.rectanglesHorsMonde);
  }
}
console.log('\nJSON :');
console.log(JSON.stringify(sortie, null, 1).slice(0, 200) + ' …');
const fs = await import('node:fs');
const path = await import('node:path');
const url = await import('node:url');
const ICI = path.dirname(url.fileURLToPath(import.meta.url));
const W = path.resolve(ICI, '../.work/b2bis');
fs.mkdirSync(W, { recursive: true });
fs.writeFileSync(path.join(W, 'formes-et-calepins.json'), JSON.stringify(sortie, null, 1));
console.log('Écrit : spikes/.work/b2bis/formes-et-calepins.json');
