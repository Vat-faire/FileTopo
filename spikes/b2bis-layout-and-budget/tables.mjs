// B2 bis — Génère les tableaux Markdown de PERF-0004 à partir des rapports
// JSON. CODE JETABLE.
//
// Aucun chiffre n'est recopié à la main : les tableaux publiés sont produits
// par ce script à partir des mesures brutes.
//
// Usage : node tables.mjs [cle-moteur…]   (défaut : edge chrome)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const WORK = path.resolve(ICI, '../.work/b2bis');
const cles = process.argv.slice(2).length ? process.argv.slice(2) : ['edge', 'chrome'];
const lire = (c) => {
  const p = path.join(WORK, 'rapport-b2bis-' + c + '.json');
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null;
};
const fr = (x) => (x === null || x === undefined ? '—' : String(x).replace('.', ','));
const ecart = (s) => (s.min === s.max ? fr(s.med) : fr(s.med) + ' [' + fr(s.min) + ' – ' + fr(s.max) + ']');

const out = [];
const w = (s) => out.push(s);

for (const cle of cles) {
  const R = lire(cle);
  if (!R) { w('<!-- rapport ' + cle + ' absent -->'); continue; }
  const nom = R.moteurNom + ' ' + (R.versionCdp?.product || '').replace(/^[^/]*\//, '');
  const tous = [...R.matrice, ...R.volumetrie];

  w('\n### Moteur : ' + nom + ' — ' + R.executions + ' exécutions par mesure\n');

  w('#### Matrice des calepins — déplacement continu, zoom, sélection\n');
  w('| Calepin | Forme | Blocs demandés | Blocs visibles | Nœuds DOM construits | ips déplacement (méd. [min–max]) | ips zoom | Sélection p95 (ms) | Ajustement (ms) | Revirt. |');
  w('|---|---|---:|---:|---:|---:|---:|---:|---:|---:|');
  for (const x of tous) {
    w('| `' + x.scenario.calepin + '` | `' + x.scenario.forme + '` | ' + x.scenario.cible
      + ' | **' + x.info.blocsVisibles + '** | ' + x.info.noeudsDom
      + ' | **' + ecart(x.pan.ipsMedian) + '** | ' + ecart(x.zoom.ipsMedian)
      + ' | ' + ecart(x.selection.p95Ms) + ' | ' + ecart(x.ajustement.latenceMs)
      + ' | ' + fr(x.pan.revirtualisations.med) + ' |');
  }

  w('\n#### Distribution des rapports d\'aspect des rectangles construits\n');
  w('Rapport = grand côté / petit côté, en pixels d\'écran. **1,0 est le carré parfait.**\n');
  w('| Calepin | Forme | Blocs demandés | Médian | p90 | p99 | Maximum | Part ≥ 10 | Part ≥ 50 |');
  w('|---|---|---:|---:|---:|---:|---:|---:|---:|');
  for (const x of tous) {
    w('| `' + x.scenario.calepin + '` | `' + x.scenario.forme + '` | ' + x.scenario.cible
      + ' | **' + fr(x.aspects.median.med) + '** | ' + fr(x.aspects.p90.med)
      + ' | ' + fr(x.aspects.p99.med) + ' | ' + fr(x.aspects.max.med)
      + ' | ' + fr(Math.round(x.aspects.partSup10.med * 1000) / 10) + ' % | '
      + fr(Math.round(x.aspects.partSup50.med * 1000) / 10) + ' % |');
  }

  if (R.budget && R.budget.length) {
    w('\n#### Budget de rendu auto-régulé — cible 30 ips\n');
    w('| Calepin | Forme | Convergence (ms) | ips régime stable | Inversions / 10 s | Niveau final | Seuil d\'aire final (px²) | Blocs | Nœuds DOM | ips après conv. | Sélection p95 (ms) |');
    w('|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|');
    for (const g of R.budget) {
      w('| `' + g.calepin + '` | `' + g.forme + '` | ' + ecart(g.tDernierChangementMs)
        + ' | **' + ecart(g.ipsRegimeStable) + '** | ' + ecart(g.inversionsSurFenetre10s)
        + ' | ' + ecart(g.niveauFinal) + ' | ' + fr(g.seuilMaxObserve.med)
        + ' | ' + ecart(g.blocsFinal) + ' | ' + ecart(g.domFinal)
        + ' | ' + ecart(g.apresConvergenceIpsPan) + ' | ' + ecart(g.apresConvergenceSelP95Ms) + ' |');
    }
  }

  if (R.plancher && R.plancher.length) {
    w('\n#### Plancher de lisibilité sous contrainte — cible portée à '
      + R.plancher[0].cibleIps + ' ips, physiquement inatteignable\n');
    w('| Calepin | Forme | Seuil d\'aire atteint (px²) | Plancher déclaré (px²) | Plancher franchi ? | Plancher atteint et tenu ? | Niveau final | Blocs | ips régime stable |');
    w('|---|---|---:|---:|---|---|---:|---:|---:|');
    for (const g of R.plancher) {
      w('| `' + g.calepin + '` | `' + g.forme + '` | **' + ecart(g.seuilMaxObserve) + '** | '
        + fr(g.plancherLisibilite) + ' | ' + (g.plancherFranchiUneFois ? '**OUI**' : 'non')
        + ' | ' + (g.plancherAtteintSansCible ? '**oui**' : 'non') + ' | ' + ecart(g.niveauFinal)
        + ' | ' + ecart(g.blocsFinal) + ' | ' + ecart(g.ipsRegimeStable) + ' |');
    }
  }

  w('\n#### ARIA et clavier\n');
  const lignes = [...tous.map((x) => ({ c: x.scenario.calepin, f: x.scenario.forme,
      s: String(x.scenario.cible), n: x.aria.nbTreeitem, a: x.aria.conforme,
      m: Object.values(x.aria.attributsManquants).reduce((p, q) => p + q, 0),
      e: x.aria.sansAriaExpanded,
      k: x.clavier.toutesLesTouchesConformes && x.clavier.focusDomSuit })),
    ...(R.budget || []).map((g) => ({ c: g.calepin, f: g.forme, s: 'budget actif',
      n: g.blocsFinal.med, a: g.ariaConformeToutes, m: 0, e: 0, k: g.clavierConformeToutes }))];
  w('Scénarios contrôlés : **' + lignes.length + '**. `treeitem` conformes : **'
    + lignes.filter((x) => x.a).length + '/' + lignes.length + '**. Clavier conforme : **'
    + lignes.filter((x) => x.k).length + '/' + lignes.length + '**.\n');
  const fautifs = lignes.filter((x) => !x.a || !x.k);
  if (fautifs.length) {
    w('| Calepin | Forme | Scénario | `treeitem` | Attributs manquants | Sans `aria-expanded` | Clavier |');
    w('|---|---|---|---:|---:|---:|---|');
    for (const x of fautifs) {
      w('| `' + x.c + '` | `' + x.f + '` | ' + x.s + ' | ' + x.n + ' | ' + x.m + ' | ' + x.e
        + ' | ' + (x.k ? 'conforme' : '**NON CONFORME**') + ' |');
    }
  } else {
    w('**Aucune régression.** Zéro attribut `aria-level`, `aria-selected`, `aria-setsize` ou '
      + '`aria-posinset` manquant; zéro nœud à enfants construits sans `aria-expanded`; '
      + '`document.activeElement` suit le focus interne sur les huit touches, dans tous les scénarios.');
  }
}

// ---------------------------------------- comparaison entre moteurs
const dispo = cles.map((c) => ({ c, R: lire(c) })).filter((x) => x.R);
if (dispo.length > 1) {
  w('\n### Écart entre les deux moteurs mesurés\n');
  w('| Calepin | Forme | Blocs demandés | ' + dispo.map((x) => x.R.moteurNom + ' — ips').join(' | ') + ' | Écart |');
  w('|---|---|---:|' + dispo.map(() => '---:|').join('') + '---:|');
  const base = [...dispo[0].R.matrice, ...dispo[0].R.volumetrie];
  for (const x of base) {
    const vals = dispo.map((d) => {
      const t = [...d.R.matrice, ...d.R.volumetrie].find((y) => y.scenario.calepin === x.scenario.calepin
        && y.scenario.forme === x.scenario.forme && y.scenario.cible === x.scenario.cible);
      return t ? t.pan.ipsMedian.med : null;
    });
    const e = (vals[0] && vals[1]) ? +(100 * (vals[1] - vals[0]) / vals[0]).toFixed(1) : null;
    w('| `' + x.scenario.calepin + '` | `' + x.scenario.forme + '` | ' + x.scenario.cible + ' | '
      + vals.map(fr).join(' | ') + ' | ' + (e === null ? '—' : fr(e) + ' %') + ' |');
  }
}

const dest = path.join(WORK, 'tableaux-perf-0004.md');
fs.writeFileSync(dest, out.join('\n') + '\n');
console.log(out.join('\n'));
console.log('\n<!-- écrit dans spikes/.work/b2bis/tableaux-perf-0004.md -->');
