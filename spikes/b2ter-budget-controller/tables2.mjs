// B2 ter — Génère les tableaux Markdown de PERF-0005 à partir des rapports
// JSON. CODE JETABLE.
//
// Aucun chiffre n'est recopié à la main : les tableaux publiés sont produits
// par ce script à partir des mesures brutes.
//
// Usage : node tables2.mjs [cle-moteur…]   (défaut : edge chrome)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const WORK = path.resolve(ICI, '../.work/b2ter');
const cles = process.argv.slice(2).length ? process.argv.slice(2) : ['edge', 'chrome'];
const lire = (c) => {
  const p = path.join(WORK, 'rapport-b2ter-' + c + '.json');
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null;
};
const fr = (x) => (x === null || x === undefined ? '—' : String(x).replace('.', ','));
const ec = (s) => (!s ? '—' : s.min === s.max ? fr(s.med) : fr(s.med) + ' [' + fr(s.min) + ' – ' + fr(s.max) + ']');
const oui = (b) => (b ? '**oui**' : '**NON**');

const out = [];
const w = (s) => out.push(s);

for (const cle of cles) {
  const R = lire(cle);
  if (!R) { w('<!-- rapport ' + cle + ' absent -->'); continue; }
  const nom = R.moteurNom + ' ' + (R.versionCdp?.product || '').replace(/^[^/]*\//, '');

  w('\n### Moteur : ' + nom + ' — ' + R.executions + ' exécutions par scénario\n');

  if (R.controleur?.length) {
    w('#### Phase 1 — contrôleur corrigé, `CAL-B`, quatre formes\n');
    w('| Forme | ips régime stable (méd. [min–max]) | ≥ 30 ips sur les 5 ? | Dernier changement (ms) | ≤ 2 s sur les 5 ? | Pire inversions / 10 s | Niveau final | Seuil final (px²) | Blocs | Nœuds DOM |');
    w('|---|---:|:---:|---:|:---:|---:|---:|---:|---:|---:|');
    for (const g of R.controleur) {
      w('| `' + g.forme + '` | **' + ec(g.ipsRegimeStable) + '** | ' + oui(g.toutesAuMoins30ips)
        + ' | **' + ec(g.tDernierChangementMs) + '** | ' + oui(g.toutesConvergentSous2s)
        + ' | ' + g.pireInversions10s.max + ' | ' + ec(g.niveauFinal)
        + ' | ' + ec(g.seuilMaxObserve) + ' | ' + ec(g.blocsFinal) + ' | ' + ec(g.domFinal) + ' |');
    }

    w('\n#### Phase 1 — reconstructions réelles et revirtualisations\n');
    w('> `B2 bis` mesurait `revirtualisations = 0`. Ce banc ne le fait plus : la trajectoire dépasse les deux seuils de revirtualisation, en translation et en zoom.\n');
    w('| Forme | Revirtualisations | Reconstructions | dont changeant le nombre de blocs | Δ blocs max | Coût médian (ms) | Coût max (ms) | Coût total (ms) |');
    w('|---|---:|---:|---:|---:|---:|---:|---:|');
    for (const g of R.controleur) {
      w('| `' + g.forme + '` | **' + ec(g.revirtualisations) + '** | ' + ec(g.nbReconstructions)
        + ' | **' + ec(g.nbReconstructionsChangeantBlocs) + '** | ' + ec(g.deltaBlocsMax)
        + ' | ' + ec(g.coutReconstructionMedianMs) + ' | ' + ec(g.coutReconstructionMaxMs)
        + ' | ' + ec(g.coutReconstructionTotalMs) + ' |');
    }

    w('\n#### Phase 1 — après convergence : déplacement, sélection, accessibilité\n');
    w('| Forme | ips déplacement | Sélection p95 (ms) | ≤ 150 ms sur les 5 ? | Revirt. du déplacement | Blocs | Nœuds DOM | ARIA | Clavier |');
    w('|---|---:|---:|:---:|---:|---:|---:|:---:|:---:|');
    for (const g of R.controleur) {
      w('| `' + g.forme + '` | ' + ec(g.apresConvergenceIpsPan) + ' | **' + ec(g.apresConvergenceSelP95Ms)
        + '** | ' + oui(g.toutesSelSous150ms) + ' | ' + ec(g.apresConvergenceRevirt)
        + ' | ' + ec(g.apresConvergenceBlocs) + ' | ' + ec(g.apresConvergenceDom)
        + ' | ' + oui(g.ariaConformeToutes) + ' | ' + oui(g.clavierConformeToutes) + ' |');
    }
  }

  if (R.plancher?.length) {
    w('\n#### Phase 2 — plancher de lisibilité sous contrainte inatteignable de '
      + R.contraintePlancher.cibleIps + ' ips\n');
    w('> Contrainte déclarée inatteignable **avant** mesure : elle place le seuil « trop lent » à 1 ms, que cette machine ne peut pas tenir.\n');
    w('| Forme | Niveau final / max | Seuil max observé (px²) | Plancher | Fenêtres au plancher | Plancher franchi ? | Atteint sur les 5 ? | Blocs | ips régime stable |');
    w('|---|---:|---:|---:|---:|:---:|:---:|---:|---:|');
    for (const g of R.plancher) {
      w('| `' + g.forme + '` | ' + ec(g.niveauFinal) + ' / ' + ((g.seuils || []).length - 1)
        + ' | **' + ec(g.seuilMaxObserve) + '** | ' + fr(g.plancherLisibilite)
        + ' | ' + ec(g.fenetresAuPlancher)
        + ' | ' + (g.plancherJamaisFranchi ? '**non**' : '**OUI**')
        + ' | ' + oui(g.plancherAtteintTouteslesFois)
        + ' | ' + ec(g.blocsFinal) + ' | ' + ec(g.ipsRegimeStable) + ' |');
    }
  }

  if (R.calA?.length) {
    w('\n#### Phase 3 — contrôle ponctuel `CAL-A` / `SYN-WIDE`\n');
    w('> Configuration exacte qui avait réfuté `F4` dans `TASK-0013`, à 26,60 ips en régime stable. **Ce contrôle ne fonde aucun critère `G1` à `G9`.**\n');
    w('| Calepin | Forme | ips régime stable | ≥ 30 ips sur les 5 ? | Dernier changement (ms) | Niveau final | Seuil max (px²) | Revirtualisations | Blocs |');
    w('|---|---|---:|:---:|---:|---:|---:|---:|---:|');
    for (const g of R.calA) {
      w('| `' + g.calepin + '` | `' + g.forme + '` | **' + ec(g.ipsRegimeStable) + '** | ' + oui(g.toutesAuMoins30ips)
        + ' | ' + ec(g.tDernierChangementMs) + ' | ' + ec(g.niveauFinal) + ' | ' + ec(g.seuilMaxObserve)
        + ' | ' + ec(g.revirtualisations) + ' | ' + ec(g.blocsFinal) + ' |');
    }
  }
}

const md = out.join('\n');
console.log(md);
const sortie = path.join(WORK, 'tableaux-perf-0005.md');
fs.writeFileSync(sortie, md + '\n');
console.log('\nÉcrit : ' + path.relative(path.resolve(ICI, '../..'), sortie).split(path.sep).join('/'));
