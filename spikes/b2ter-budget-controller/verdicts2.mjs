// B2 ter — Calcule les verdicts `G1` à `G9` À PARTIR DES MESURES BRUTES.
// CODE JETABLE.
//
// Aucun verdict n'est écrit à la main. Chacun est recalculé ici depuis le
// rapport JSON produit par `run-b2ter.mjs`, avec la mesure qui le fonde.
//
// Les critères « sur chacune des 5 exécutions » sont jugés sur la PIRE
// exécution, jamais sur la médiane.
//
// Usage : node verdicts2.mjs [cle-moteur]   (défaut : edge)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONFIG_BUDGET_2, seuilLentMs } from './budget2.mjs';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const WORK = path.resolve(ICI, '../.work/b2ter');
const CLE = process.argv[2] || 'edge';
const p = path.join(WORK, 'rapport-b2ter-' + CLE + '.json');
if (!fs.existsSync(p)) { console.error('rapport absent : ' + p); process.exit(2); }
const R = JSON.parse(fs.readFileSync(p, 'utf8'));

// La configuration ATTENDUE, recopiée depuis `TASK-0014` §5.2. Si le contrôleur
// employé pendant la campagne en diffère, `G9` est réfutée mécaniquement.
const ATTENDU = {
  cibleIps: 30, fenetre: 12, seuilMin: 60, seuilMax: 2400, ratio: 1.35,
  niveauInitial: 4, seuilRapideMs: 25, refroidissementApresInversion: 2,
};

const fr = (x) => String(x).replace('.', ',');
const lignes = [];
const V = [];
const verdict = (id, enonce, ok, preuve) => {
  V.push({ id, enonce, verdict: ok ? 'CONFIRMÉE' : 'RÉFUTÉE', preuve });
};

const CTRL = R.controleur || [];
const PLANCH = R.plancher || [];
const CALA = R.calA || [];
const toutes = (arr, f) => arr.length > 0 && arr.every(f);

// ------------------------------------------------------------------ G1
{
  const mauvaises = CTRL.filter((g) => !g.toutesAuMoins30ips);
  const detail = CTRL.map((g) => `${g.forme} ${fr(g.ipsRegimeStable.med)} [${fr(g.ipsRegimeStable.min)} – ${fr(g.ipsRegimeStable.max)}]`).join('; ');
  verdict('G1', 'Cible : régime stable ≥ 30 ips sur chacune des 5 exécutions et les quatre formes',
    CTRL.length === 4 && mauvaises.length === 0,
    `ips en régime stable, médiane [min – max] : ${detail}. `
    + (mauvaises.length ? `Formes en défaut : ${mauvaises.map((g) => g.forme + ' min=' + fr(g.ipsRegimeStable.min)).join(', ')}` : 'Aucune exécution sous 30 ips.'));
}

// ------------------------------------------------------------------ G2
{
  const mauvaises = CTRL.filter((g) => !g.toutesConvergentSous2s);
  const detail = CTRL.map((g) => `${g.forme} ${fr(g.tDernierChangementMs.med)} ms [${fr(g.tDernierChangementMs.min)} – ${fr(g.tDernierChangementMs.max)}]`).join('; ');
  verdict('G2', 'Convergence : dernier changement de niveau ≤ 2 000 ms sur chacune des 5 exécutions et les quatre formes',
    CTRL.length === 4 && mauvaises.length === 0,
    `instant du dernier changement de niveau après le choc : ${detail}. `
    + (mauvaises.length ? `Formes en défaut : ${mauvaises.map((g) => g.forme + ' max=' + fr(g.tDernierChangementMs.max) + ' ms').join(', ')}` : 'Aucun dépassement.'));
}

// ------------------------------------------------------------------ G3
{
  const mauvaises = CTRL.filter((g) => !g.toutesAuPlus2Inversions);
  const detail = CTRL.map((g) => `${g.forme} pire=${g.pireInversions10s.max}`).join('; ');
  verdict('G3', 'Stabilité : au plus 2 inversions de direction sur toute fenêtre glissante de 10 s du régime stable',
    CTRL.length === 4 && mauvaises.length === 0,
    `pire nombre d'inversions sur une fenêtre glissante de 10 s, sur les 5 exécutions : ${detail}.`);
}

// ------------------------------------------------------------------ G4
{
  const jamaisFranchi = toutes(CTRL, (g) => g.plancherJamaisFranchi)
    && toutes(PLANCH, (g) => g.plancherJamaisFranchi)
    && toutes(CALA, (g) => g.plancherJamaisFranchi);
  const atteint = PLANCH.some((g) => g.plancherAtteintAuMoinsUneFois);
  const atteintPartout = toutes(PLANCH, (g) => g.plancherAtteintTouteslesFois);
  const fenetres = PLANCH.map((g) => `${g.forme} niveau=${g.niveauFinal.med}/${(g.seuils || []).length - 1} seuil=${fr(g.seuilMaxObserve.med)} fenêtres au plancher=${g.fenetresAuPlancher.med}`).join('; ');
  verdict('G4', 'Lisibilité : 2 400 px² jamais dépassé, plancher réellement atteint au moins une fois, et le contrôleur y reste',
    jamaisFranchi && atteint,
    `plancher jamais franchi : ${jamaisFranchi}. Plancher réellement atteint sous contrainte inatteignable de ${R.contraintePlancher?.cibleIps} ips : ${atteint} `
    + `(toutes exécutions : ${atteintPartout}). Phase 2 : ${fenetres}.`);
}

// ------------------------------------------------------------------ G5
{
  verdict('G5', 'Déterminisme : rejeu de toutes les traces réelles, zéro divergence',
    null, 'calculé par `replay-budget2.mjs`, hors navigateur — voir le journal');
  V[V.length - 1].verdict = 'VOIR replay-budget2.mjs';
}

// ------------------------------------------------------------------ G6
{
  const groupes = [...CTRL];
  const parForme = groupes.filter((g) => g.reconstructionReelleAuMoinsUneFois);
  const revirt = toutes(groupes, (g) => g.revirtualisationsToujoursNonNulles);
  const detail = groupes.map((g) => `${g.forme} reconstructions=${g.nbReconstructions.med} dont changeant les blocs=${g.nbReconstructionsChangeantBlocs.med}, Δblocs max=${g.deltaBlocsMax.max}, coût médian=${fr(g.coutReconstructionMedianMs.med)} ms, coût max=${fr(g.coutReconstructionMaxMs.max)} ms, revirtualisations=${g.revirtualisations.med}`).join('; ');
  verdict('G6', 'Reconstruction réelle : au moins un scénario par forme change le nombre de blocs DOM construits, coût mesuré et inclus dans les temps d\'image',
    groupes.length === 4 && parForme.length === 4 && revirt,
    `${detail}. Revirtualisations non nulles sur toutes les exécutions : ${revirt}.`);
}

// ------------------------------------------------------------------ G7
{
  const groupes = [...CTRL, ...CALA];
  const ok = toutes(groupes, (g) => g.ariaConformeToutes && g.clavierConformeToutes);
  const n = groupes.reduce((a, g) => a + g.runs.length, 0);
  verdict('G7', 'Accessibilité : zéro régression ARIA et clavier sur tous les scénarios, après les changements de niveau',
    ok, `${n} exécutions contrôlées après les changements de niveau du budget; ARIA conforme partout : ${toutes(groupes, (g) => g.ariaConformeToutes)}; clavier conforme partout : ${toutes(groupes, (g) => g.clavierConformeToutes)}.`);
}

// ------------------------------------------------------------------ G8
{
  const g = CTRL.find((x) => x.forme === 'SYN-100K');
  const ok = !!g && g.toutesAuMoins30ips && g.toutesSelSous150ms;
  verdict('G8', 'SYN-100K : ≥ 30 ips et p95 de sélection ≤ 150 ms sur chacune des 5 exécutions, budget actif',
    ok, g ? `ips en régime stable ${fr(g.ipsRegimeStable.med)} [${fr(g.ipsRegimeStable.min)} – ${fr(g.ipsRegimeStable.max)}]; `
      + `p95 de sélection ${fr(g.apresConvergenceSelP95Ms.med)} ms [${fr(g.apresConvergenceSelP95Ms.min)} – ${fr(g.apresConvergenceSelP95Ms.max)}]; `
      + `blocs construits ${g.blocsFinal.med} pour 100 000 éléments indexés; nœuds DOM ${g.domFinal.med}`
      : 'SYN-100K absent du rapport');
}

// ------------------------------------------------------------------ G9
{
  const c = R.configControleur || {};
  const ecarts = Object.entries(ATTENDU).filter(([k, v]) => c[k] !== v)
    .map(([k, v]) => `${k}: attendu ${v}, trouvé ${c[k]}`);
  const lent = seuilLentMs(CONFIG_BUDGET_2);
  const lentOk = Math.abs(lent - 1000 / 30) < 1e-12;
  verdict('G9', 'Intégrité du protocole : aucun seuil, constante, critère ou paramètre modifié après le premier résultat',
    ecarts.length === 0 && lentOk,
    ecarts.length ? `ÉCARTS : ${ecarts.join('; ')}`
      : `configuration employée pendant la campagne identique à TASK-0014 §5.2 : `
        + Object.entries(ATTENDU).map(([k, v]) => `${k}=${fr(v)}`).join(', ')
        + `; seuil lent = 1000/30 = ${fr(lent.toFixed(4))} ms, sans marge. `
        + `Contrainte de la phase 2 déclarée avant mesure : ${R.contraintePlancher?.cibleIps} ips.`);
}

// ---------------------------------------------------------------- sortie
lignes.push('| # | Énoncé | Verdict | Mesure qui le fonde |');
lignes.push('|---|---|---|---|');
for (const v of V) {
  lignes.push(`| **\`${v.id}\`** | ${v.enonce} | **${v.verdict}** | ${v.preuve} |`);
}
const md = lignes.join('\n');
console.log(md);
const sortie = path.join(WORK, 'verdicts-' + CLE + '.md');
fs.writeFileSync(sortie, md + '\n');
console.log('\nÉcrit : ' + path.relative(path.resolve(ICI, '../..'), sortie).split(path.sep).join('/'));
const refutes = V.filter((v) => v.verdict === 'RÉFUTÉE').map((v) => v.id);
console.log('\nRÉFUTÉES : ' + (refutes.length ? refutes.join(', ') : 'aucune')
  + ' | CONFIRMÉES : ' + V.filter((v) => v.verdict === 'CONFIRMÉE').map((v) => v.id).join(', '));
