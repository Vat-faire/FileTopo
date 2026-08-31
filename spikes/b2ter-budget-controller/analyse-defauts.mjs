// B2 ter — DÉFAUTS DE PROTOCOLE DÉCOUVERTS APRÈS LA PREMIÈRE MESURE, et
// lectures supplémentaires déclarées. CODE JETABLE.
//
// ======================================================================
// CE SCRIPT NE CHANGE RIEN. IL PUBLIE.
// ======================================================================
//
// `TASK-0014` §6.1 : « Si un problème de protocole est découvert APRÈS la
// première mesure : ne change pas le protocole; publie le défaut; rends le
// critère concerné réfuté ou bloqué selon son texte; ne recommence pas en
// modifiant la cible. »
//
// Ce script est écrit APRÈS la première mesure. Il ne modifie AUCUN seuil,
// AUCUNE constante, AUCUN critère et AUCUN paramètre du contrôleur. Il ne
// rejoue AUCUNE mesure. Il relit les mesures DÉJÀ COLLECTÉES et en tire deux
// choses :
//
//   1. la QUANTIFICATION des deux défauts de protocole découverts;
//   2. des LECTURES SUPPLÉMENTAIRES, explicitement étiquetées comme
//      n'établissant AUCUN verdict `G1` à `G9`.
//
// Une lecture supplémentaire ne remplace jamais un critère manqué. `G1` et
// `G2` restent RÉFUTÉES; `G3` est BLOQUÉE.
//
// Usage : node analyse-defauts.mjs [cle-moteur…]   (défaut : edge chrome)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const WORK = path.resolve(ICI, '../.work/b2ter');
const cles = process.argv.slice(2).length ? process.argv.slice(2) : ['edge', 'chrome'];
const fr = (x) => (x === null || x === undefined ? '—' : String(x).replace('.', ','));
const out = [];
const w = (s) => { out.push(s); console.log(s); };

const med = (xs) => { const s = [...xs].sort((a, b) => a - b); return s.length ? s[(s.length - 1) >> 1] : null; };
const sensDe = (d) => (d.niveauApres > d.niveauAvant ? 1 : (d.niveauApres < d.niveauAvant ? -1 : 0));

/** Pire nombre d'inversions sur une fenêtre glissante de 10 s d'une liste. */
function pireInversions10s(decisions) {
  let pire = 0;
  for (let i = 0; i < decisions.length; i++) {
    const t0 = decisions[i].tMs;
    let inv = 0, prec = 0;
    for (let j = i; j < decisions.length && decisions[j].tMs <= t0 + 10000; j++) {
      const s = sensDe(decisions[j]);
      if (s !== 0) { if (prec !== 0 && s !== prec) inv++; prec = s; }
    }
    if (inv > pire) pire = inv;
  }
  return pire;
}

w('# `B2 ter` — défauts de protocole et lectures supplémentaires\n');
w('> **Écrit après la première mesure.** Aucun seuil, aucune constante, aucun');
w('> critère et aucun paramètre du contrôleur n\'a été modifié. Aucune mesure');
w('> n\'a été rejouée. `G1` et `G2` restent **RÉFUTÉES**; `G3` est **BLOQUÉE**.\n');

// ======================================================================
// DÉFAUT D1 — « régime stable » peut ne contenir presque aucune image
// ======================================================================
w('## Défaut `D1` — le « régime stable » peut ne contenir presque aucune image\n');
w('Le protocole définit le régime stable comme *tout ce qui suit le dernier');
w('changement de niveau, plus 200 ms*. Quand le dernier changement tombe près');
w('de la fin de l\'exécution, cette fenêtre ne contient plus qu\'une poignée');
w('d\'images — parfois **une seule**, parfois **aucune**. `1000 / médiane` sur');
w('un tel échantillon n\'est pas une fréquence de régime : c\'est un artefact.\n');
w('**Conséquence de lecture, obligatoire.** Une valeur `ips régime stable` de');
w('**0** ne signifie PAS « zéro image par seconde mesurée » : elle signifie');
w('**« aucune image après le dernier changement »**. Aucune de ces valeurs ne');
w('peut être citée comme une performance.\n');
w('| Moteur | Forme | Images du régime stable, par exécution | ips régime stable, par exécution | ips médian sur TOUTE la période observée |');
w('|---|---|---|---|---|');
for (const cle of cles) {
  const p = path.join(WORK, 'rapport-b2ter-' + cle + '.json');
  if (!fs.existsSync(p)) continue;
  const R = JSON.parse(fs.readFileSync(p, 'utf8'));
  for (const g of [...(R.controleur || []), ...(R.calA || [])]) {
    const img = g.runs.map((r) => r.imagesRegimeStable);
    const ips = g.runs.map((r) => (r.ipsRegimeStable === null ? 'aucune' : fr(r.ipsRegimeStable)));
    const glob = g.runs.map((r) => fr(r.ipsGlobalMedian));
    w('| ' + R.moteurNom + ' | `' + g.calepin + '` / `' + g.forme + '` | ' + img.join(', ')
      + ' | ' + ips.join(', ') + ' | ' + glob.join(', ') + ' |');
  }
}

// ======================================================================
// DÉFAUT D2 — la fenêtre stable de `G3` ne peut, par construction, porter
// aucune inversion
// ======================================================================
w('\n## Défaut `D2` — la fenêtre stable de `G3` est vide par construction\n');
w('`G3` compte les inversions de direction **sur une fenêtre stable de 10 s**.');
w('Le protocole fait commencer le régime stable **au dernier changement de');
w('niveau**. Après ce point, il n\'existe **plus aucun changement**, donc');
w('**plus aucune inversion possible** : la mesure vaut **0 par construction**,');
w('quelle que soit la conduite réelle du contrôleur.\n');
w('**La mesure de `G3` ne peut donc pas falsifier `G3`.** Conformément à');
w('§6.1 de `TASK-0014`, le critère est publié **BLOQUÉ**, jamais confirmé.');
w('Une mesure incapable de réfuter n\'est pas une confirmation.\n');
w('**Lecture supplémentaire, qui n\'est PAS `G3`.** Ci-dessous, le pire nombre');
w('d\'inversions sur une fenêtre glissante de 10 s de **toute la période');
w('observée après le choc**, et non de la seule fenêtre stable. Cette lecture');
w('**n\'établit aucun verdict** : elle porte sur une fenêtre que le critère ne');
w('nomme pas.\n');
w('| Moteur | Forme | Pire inversions / 10 s sur TOUTE la période, par exécution | Inversions totales, par exécution |');
w('|---|---|---|---|');
let pireGlobal = 0;
for (const cle of cles) {
  const p = path.join(WORK, 'rapport-b2ter-' + cle + '.json');
  if (!fs.existsSync(p)) continue;
  const R = JSON.parse(fs.readFileSync(p, 'utf8'));
  for (const g of [...(R.controleur || []), ...(R.calA || [])]) {
    const pires = g.runs.map((r) => pireInversions10s(r.decisions || []));
    const tot = g.runs.map((r) => r.inversionsTotales);
    pireGlobal = Math.max(pireGlobal, ...pires);
    w('| ' + R.moteurNom + ' | `' + g.calepin + '` / `' + g.forme + '` | ' + pires.join(', ')
      + ' | ' + tot.join(', ') + ' |');
  }
}
w('\n**Pire valeur observée, tous moteurs et toutes formes confondus : **'
  + pireGlobal + '**.** Si `G3` avait été écrit sur cette fenêtre, il aurait été '
  + (pireGlobal > 2 ? '**RÉFUTÉ**' : '**tenu**') + '. Ce n\'est pas ce qui a été écrit,');
w('donc ce n\'est pas le verdict : `G3` est **BLOQUÉ**.');

// ======================================================================
// Lecture supplémentaire — coût des reconstructions rapporté au temps d'image
// ======================================================================
w('\n## Lecture supplémentaire — le coût d\'une reconstruction, rapporté au temps d\'image\n');
w('Le coût d\'une reconstruction est payé **dans l\'image** où le contrôleur');
w('change de seuil. À 30 images par seconde, le budget d\'une image est de');
w('**33,3 ms**. Les valeurs ci-dessous disent combien d\'images ce coût occupe.\n');
w('| Moteur | Forme | Coût médian (ms) | Coût max (ms) | Coût médian, en images de 33,3 ms | Reconstructions changeant le nombre de blocs |');
w('|---|---|---:|---:|---:|---:|');
for (const cle of cles) {
  const p = path.join(WORK, 'rapport-b2ter-' + cle + '.json');
  if (!fs.existsSync(p)) continue;
  const R = JSON.parse(fs.readFileSync(p, 'utf8'));
  for (const g of (R.controleur || [])) {
    const couts = g.runs.flatMap((r) => (r.reconstructions || []).map((x) => x.coutMs));
    const m = med(couts), mx = couts.length ? Math.max(...couts) : null;
    const n = g.runs.reduce((a, r) => a + r.nbReconstructionsChangeantBlocs, 0);
    w('| ' + R.moteurNom + ' | `' + g.forme + '` | ' + fr(m === null ? null : m.toFixed(2))
      + ' | ' + fr(mx === null ? null : mx.toFixed(2))
      + ' | ' + fr(m === null ? null : (m / (1000 / 30)).toFixed(2)) + ' | ' + n + ' |');
  }
}

// ======================================================================
// Lecture supplémentaire — les DEUX seuils tombent EXACTEMENT sur un pas de
// la synchronisation verticale
// ======================================================================
w('\n## Lecture supplémentaire — les deux seuils tombent sur un pas de synchronisation verticale\n');
w("L'écran est à **240 Hz** : les temps d'image sont quantifiés en marches de");
w('**4,1667 ms**. Or :\n');
w('- le seuil lent vaut **1000 / 30 = 33,3333 ms**, soit **exactement 8 marches**;');
w('- le seuil rapide vaut **25,0 ms**, soit **exactement 6 marches**.\n');
w('Les deux bornes de la zone morte coïncident donc avec une valeur que le');
w('moteur produit **très fréquemment**. Une fluctuation inférieure à la');
w("milliseconde fait alors basculer la décision d'un côté ou de l'autre.\n");
w('| Moteur | Fenêtres de décision | Médianes dans la marche des 33,3 ms (= 30,0 ips) | Part | Médianes dans la marche des 25,0 ms (= 40,0 ips) | Part |');
w('|---|---:|---:|---:|---:|---:|');
const PAS_VSYNC = 1000 / 240;
for (const cle of cles) {
  const p2 = path.join(WORK, 'rapport-b2ter-' + cle + '.json');
  if (!fs.existsSync(p2)) continue;
  const R = JSON.parse(fs.readFileSync(p2, 'utf8'));
  const meds = [];
  for (const g of [...(R.controleur || []), ...(R.plancher || []), ...(R.calA || [])]) {
    if (g.cibleIpsContrainte) continue;   // la phase 2 a d'autres seuils
    for (const r of g.runs) for (const d of (r.decisions || [])) meds.push(d.medianeMs);
  }
  const pres = (cible) => meds.filter((m) => Math.abs(m - cible) < PAS_VSYNC / 2).length;
  const a = pres(1000 / 30), b = pres(25);
  w('| ' + R.moteurNom + ' | ' + meds.length + ' | **' + a + '** | ' + fr((100 * a / meds.length).toFixed(1))
    + ' % | **' + b + '** | ' + fr((100 * b / meds.length).toFixed(1)) + ' % |');
}
w('\nCe que cela explique, et qui est mesuré. Une part importante des fenêtres');
w('de décision se présente **exactement sur une borne**. Le contrôleur corrigé');
w("n'a **aucune marge** au seuil lent — c'est la correction demandée de la");
w('CAUSE 1 — et **aucun refroidissement** ne freine un mouvement de même sens —');
w('correction de la CAUSE 2. Sur cette borne, il **bascule**. C\u2019est la cause');
w('mesurée du battement observé plus haut, et de la convergence tardive : une');
w("médiane à 25,0 ms n'est **pas** « strictement inférieure à 25 », donc le");
w("contrôleur **n'affine pas** et attend.\n");
w('**Ce constat n\u2019excuse aucun critère manqué.** `G1` et `G2` restent réfutées.');

const sortie = path.join(WORK, 'defauts-et-lectures.md');
fs.writeFileSync(sortie, out.join('\n') + '\n');
console.log('\nÉcrit : ' + path.relative(path.resolve(ICI, '../..'), sortie).split(path.sep).join('/'));
