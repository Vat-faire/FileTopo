// B2 ter — Contrôle du DÉTERMINISME du contrôleur corrigé, critère `G5`.
// CODE JETABLE.
//
// « Rejeu de toutes les traces réelles avec le même contrôleur : zéro
//   divergence de décision. »
//
// Un contrôleur qui réagit à des temps d'image mesurés ne peut pas produire
// deux fois la même suite si les temps d'image diffèrent : ce serait une
// exigence impossible. L'exigence porte donc sur le CONTRÔLEUR : à ENTRÉES
// ÉGALES, la suite de décisions doit être identique.
//
// Trois contrôles, sans navigateur :
//   1. une trace SYNTHÉTIQUE construite ici, rejouée deux fois;
//   2. TOUTES les traces RÉELLES relevées dans la page pendant la campagne,
//      rejouées hors navigateur et comparées, décision par décision, à la
//      signature que la page avait produite au moment de la mesure;
//   3. un contrôle statique d'absence d'écriture et d'absence de source
//      d'indéterminisme dans `budget2.mjs`.
//
// Le second contrôle est le plus fort : il prouve que le contrôleur exécuté
// DANS le moteur et celui exécuté DANS Node rendent la même suite de
// décisions sur les mêmes temps d'image.
//
// Usage : node replay-budget2.mjs [cle-moteur…]

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { creerBudget2 } from './budget2.mjs';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const WORK = path.resolve(ICI, '../.work/b2ter');

function rejoue(trace, config) {
  const b = creerBudget2(config || {});
  for (const dt of trace) b.observe(dt);
  return b;
}

let echecs = 0;

// ------------------------------------------------- 1. trace synthétique
// Suite déterministe, sans aucun tirage aléatoire : lente au début — le
// contrôleur doit agréger —, puis rapide — il doit affiner, et l'affinage
// continu ne doit PLUS coûter trois fenêtres par niveau.
const traceSynth = [];
for (let i = 0; i < 600; i++) traceSynth.push(i < 300 ? 45 + (i % 7) : 8 + (i % 3));
const a = rejoue(traceSynth), b = rejoue(traceSynth);
const identiques = a.signature() === b.signature();
console.log('1. Trace synthétique de ' + traceSynth.length + ' images');
console.log('   décisions : ' + a.journal().length + ' | signatures identiques : ' + identiques);
console.log('   niveau final : ' + a.niveau() + ' | seuil final : ' + a.seuilCourant()
  + ' | inversions : ' + a.inversions());
if (!identiques) { echecs++; console.log('   ÉCHEC : deux rejeux de la même trace divergent'); }

// Contrôle explicite de la CAUSE 2 : sur la partie rapide de la trace, le
// contrôleur doit descendre d'un niveau PAR FENÊTRE, sans refroidissement
// intercalé. On compte les fenêtres consécutives qui affinent réellement.
const jr = a.journal();
let plusLongueSerieAffinage = 0, serie = 0;
for (const d of jr) {
  if (d.action === 'affine') { serie++; if (serie > plusLongueSerieAffinage) plusLongueSerieAffinage = serie; }
  else serie = 0;
}
console.log('   plus longue série d\'affinages consécutifs, sans fenêtre perdue : '
  + plusLongueSerieAffinage);
if (plusLongueSerieAffinage < 2) {
  echecs++;
  console.log('   ÉCHEC : l\'affinage continu est encore interrompu — la CAUSE 2 n\'est pas corrigée');
}

// -------------------------------------- 2. traces réelles de la campagne
const cles = process.argv.slice(2);
const fichiers = (cles.length ? cles.map((c) => 'rapport-b2ter-' + c + '.json')
  : fs.existsSync(WORK) ? fs.readdirSync(WORK).filter((f) => /^rapport-b2ter-.*\.json$/.test(f)) : []);

let compares = 0, divergents = 0;
for (const f of fichiers) {
  const p = path.join(WORK, f);
  if (!fs.existsSync(p)) { console.log('\n2. ' + f + ' : absent, ignoré'); continue; }
  const r = JSON.parse(fs.readFileSync(p, 'utf8'));
  const groupes = [...(r.controleur || []), ...(r.plancher || []), ...(r.calA || [])];
  for (const g of groupes) {
    for (let i = 0; i < (g.runs || []).length; i++) {
      const run = g.runs[i];
      if (!run.traceDt || !run.signature) continue;
      const rej = rejoue(run.traceDt, run.config);
      compares++;
      if (rej.signature() !== run.signature) {
        divergents++;
        console.log('   DIVERGENCE : ' + g.calepin + ' ' + g.forme + ' exécution ' + (i + 1));
      }
      // Deuxième rejeu de la même trace, pour la reproductibilité pure.
      if (rejoue(run.traceDt, run.config).signature() !== rej.signature()) {
        divergents++;
        console.log('   DIVERGENCE INTERNE : ' + g.calepin + ' ' + g.forme + ' exécution ' + (i + 1));
      }
    }
  }
  console.log('\n2. ' + f + ' : ' + compares + ' traces réelles rejouées, ' + divergents + ' divergence(s)');
}
if (compares === 0) console.log('\n2. Aucune trace réelle disponible : lancer run-b2ter.mjs d\'abord.');
if (divergents > 0) echecs++;

// ---------------------------------------------- 3. absence d'écriture
// §5.2.5 de TASK-0013, reconduite : le contrôleur n'écrit rien et ne tire
// rien au hasard. Contrôle statique sur sa source, COMMENTAIRES RETIRÉS :
// l'en-tête de `budget2.mjs` NOMME les motifs interdits pour dire qu'il ne les
// emploie pas. Le contrôle doit porter sur le code exécuté, pas sur sa
// documentation.
const brut = fs.readFileSync(path.join(ICI, 'budget2.mjs'), 'utf8');
const src = brut.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|\n)\s*\/\/[^\n]*/g, '$1');
const interdits = ['localStorage', 'sessionStorage', 'indexedDB', 'document.cookie',
                   'writeFile', 'fetch(', 'Date.now', 'Math.random', 'new Date', 'performance.now'];
const trouves = interdits.filter((m) => src.includes(m));
console.log('\n3. Contrôle statique de budget2.mjs, commentaires retirés');
console.log('   lignes de code examinées : ' + src.split('\n').filter((l) => l.trim()).length);
console.log('   motifs interdits trouvés : ' + (trouves.length ? trouves.join(', ') : 'aucun'));
if (trouves.length) echecs++;

console.log('\n=== ' + (echecs === 0
  ? 'DÉTERMINISME ET ABSENCE D\'ÉCRITURE : CONFIRMÉS'
  : 'ÉCHEC : ' + echecs + ' contrôle(s) en défaut') + ' ===');
process.exit(echecs === 0 ? 0 : 1);
