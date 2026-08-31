// B2 ter — Pilote de mesure du contrôleur corrigé. CODE JETABLE.
//
// Dépendances : AUCUNE. Le moteur est piloté par le protocole CDP, sur le
// client `WebSocket` intégré à Node 24. Aucun paquet n'est installé, ni dans
// le dépôt, ni sur le système.
//
// Les images par seconde sont relevées par l'horloge de rendu du moteur
// (`requestAnimationFrame`), à l'intérieur de la page. Elles ne sont ni
// estimées, ni calculées côté Node.
//
// Tout ce qui est écrit sur le disque va sous `spikes/.work/b2ter/`, ignoré
// par Git — y compris le profil du navigateur. Rien n'est écrit hors du dépôt.
//
// AUCUNE TENTATIVE WEBVIEW2. `DEC-0014` F l'interdit avant qu'un véritable
// hôte Tauri existe. Ce pilote ne connaît que deux moteurs.
//
// Usage : node run-b2ter.mjs <cle-moteur> [phases] [executions]
//   cle-moteur : edge | chrome
//   phases     : liste séparée par des virgules parmi
//                controleur,plancher,calA        (défaut : toutes)

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, '../..');
const WORK = path.resolve(RACINE, 'spikes/.work/b2ter');
const versUrl = (p) => 'file:///' + path.resolve(p).split(path.sep).join('/');
const PAGE = versUrl(path.join(ICI, 'map3.html'));

// Chemins d'exécutables installés. Lecture MINIMALE, CIBLÉE et NON RÉCURSIVE
// de métadonnées d'outillage, autorisée par `TASK-0014` §3 au titre de la
// section « Lecture minimale de l'environnement technique » d'AGENTS.md.
// Aucun dossier personnel, aucun contenu utilisateur, aucune donnée réelle.
const MOTEURS = {
  edge: { exe: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', nom: 'Microsoft Edge' },
  chrome: { exe: 'C:/Program Files/Google/Chrome/Application/chrome.exe', nom: 'Google Chrome' },
};

const CLE = process.argv[2] || 'edge';
const PHASES = (process.argv[3] || 'controleur,plancher,calA').split(',');
const RUNS = Number(process.argv[4] ?? 5);
const PORT = 9370 + Object.keys(MOTEURS).indexOf(CLE);
const M = MOTEURS[CLE];
if (!M) { console.error('moteur inconnu ou interdit : ' + CLE); process.exit(2); }
if (!fs.existsSync(M.exe)) { console.error('exécutable introuvable : ' + M.exe); process.exit(2); }

fs.mkdirSync(WORK, { recursive: true });
const profil = path.join(WORK, 'profil-' + CLE);
const dors = (ms) => new Promise((r) => setTimeout(r, ms));

// ------------------------------------------------------------- lancement
const args = [
  '--remote-debugging-port=' + PORT,
  '--user-data-dir=' + profil,
  '--no-first-run', '--no-default-browser-check',
  '--disable-extensions', '--disable-background-networking',
  '--window-size=1600,900',
  '--headless=new',
  // AUCUN drapeau ne débride la fréquence d'images.
  PAGE,
];
const nav = spawn(M.exe, args, { stdio: 'ignore' });

async function cible() {
  for (let i = 0; i < 160; i++) {
    try {
      const r = await fetch('http://127.0.0.1:' + PORT + '/json/list');
      const l = await r.json();
      const p = l.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
      if (p) return p;
    } catch { /* pas encore à l'écoute */ }
    await dors(150);
  }
  throw new Error('cible CDP introuvable pour ' + CLE);
}

const t = await cible();
const ws = new WebSocket(t.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

let idSeq = 0;
const enAttente = new Map();
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && enAttente.has(m.id)) {
    const { res, rej } = enAttente.get(m.id);
    enAttente.delete(m.id);
    if (m.error) rej(new Error(JSON.stringify(m.error)));
    else res(m.result);
  }
};
const envoie = (method, params) => new Promise((res, rej) => {
  const id = ++idSeq;
  enAttente.set(id, { res, rej });
  ws.send(JSON.stringify({ id, method, params: params || {} }));
});

async function evalue(expr) {
  const r = await envoie('Runtime.evaluate', {
    expression: expr, awaitPromise: true, returnByValue: true,
  });
  if (r.exceptionDetails) {
    throw new Error('page : ' + JSON.stringify(r.exceptionDetails.exception?.description
      ?? r.exceptionDetails.text));
  }
  return r.result.value;
}

await envoie('Runtime.enable');
await envoie('Page.enable');

for (let i = 0; i < 160; i++) {
  try { if (await evalue('window.pret === true')) break; } catch { /* pas encore */ }
  await dors(150);
}

// ---------------------------------------------- injection des SOURCES UNIQUES
// Les trois modules sont lus sur le disque et évalués tels quels dans la page,
// après retrait des lignes `import`/`export`. La page exécute donc exactement
// le code que Node importe : aucune copie, aucune divergence possible.
//
// `synthetic-shapes.mjs` et `calepins.mjs` sont ceux de `B2 bis`, repris SANS
// MODIFICATION : la seule variable de cette campagne est le contrôleur.
function sourceInjectable(rel) {
  const brut = fs.readFileSync(path.resolve(RACINE, rel), 'utf8');
  return brut.split('\n').filter((l) => !/^\s*(export|import)\b/.test(l)).join('\n');
}
const MODULES = [
  'spikes/fixtures/synthetic-shapes.mjs',
  'spikes/b2bis-layout-and-budget/calepins.mjs',
  'spikes/b2ter-budget-controller/budget2.mjs',
];
for (const rel of MODULES) {
  await evalue(sourceInjectable(rel) + '\n;window.__injecte = (window.__injecte||0)+1; window.__injecte');
}
const nbInjecte = await evalue('window.__injecte');
if (nbInjecte !== MODULES.length) throw new Error('injection incomplète : ' + nbInjecte);
const presents = await evalue('JSON.stringify({'
  + "construireArbre: typeof construireArbre, decrireArbre: typeof decrireArbre,"
  + "appliqueCalepin: typeof appliqueCalepin, calepinSquarifie: typeof calepinSquarifie,"
  + "creerBudget2: typeof creerBudget2, CONFIG_BUDGET_2: typeof CONFIG_BUDGET_2,"
  + "echelleSeuils: typeof echelleSeuils"
  + '})');
if (Object.values(JSON.parse(presents)).some((v) => v === 'undefined')) {
  throw new Error('point d\'entrée manquant dans la page : ' + presents);
}
console.log('modules injectés :', MODULES.length, '| points d\'entrée :', presents);

const env = JSON.parse(await evalue(`JSON.stringify({
  ua: navigator.userAgent, dpr: window.devicePixelRatio,
  w: window.innerWidth, h: window.innerHeight,
})`));
const version = await envoie('Browser.getVersion').catch(() => ({}));
const configPage = JSON.parse(await evalue('JSON.stringify(CONFIG_BUDGET_2)'));

const stat = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  return {
    med: +s[(s.length - 1) >> 1].toFixed(2),
    min: +s[0].toFixed(2),
    max: +s[s.length - 1].toFixed(2),
    n: s.length,
    brut: s.map((x) => +x.toFixed(2)),
  };
};

const FORMES = ['SYN-EQUILIBRE', 'SYN-DEEP', 'SYN-WIDE', 'SYN-100K'];
const compte = (f) => (f === 'SYN-100K' ? 100000 : 20000);
const GRAINE = 20260831;            // IDENTIQUE à TASK-0013
const DUREE_MS = 14000;
const CHOC_MS = 600;

// PHASE PLANCHER — contrainte VOLONTAIREMENT INATTEIGNABLE, déclarée AVANT
// mesure conformément à la réserve `V3` d'ACTION-0023. 1 000 ips place le
// seuil lent à 1 ms : aucune configuration de cette machine ne peut le tenir.
// Le seuil rapide est abaissé en proportion pour que l'ordre des deux seuils
// reste cohérent. Ces deux valeurs ne concernent QUE cette phase; la
// configuration de `TASK-0014` §5.2 est inchangée.
const CONTRAINTE_PLANCHER = { cibleIps: 1000, seuilRapideMs: 0.8 };
const DUREE_PLANCHER_MS = 9000;

async function uneExecution(forme, calepin, config, dureeMs, avecSuite) {
  await evalue('JSON.stringify(window.setup(' + JSON.stringify({
    shape: forme, count: compte(forme), seed: GRAINE, cible: 0, calepin,
  }) + '))');
  const b = JSON.parse(await evalue('window.runBudget2(' + JSON.stringify({
    dureeMs, chocApresMs: CHOC_MS, config,
  }) + ').then(JSON.stringify)'));
  if (avecSuite) {
    // Les deux seuils de §3.6 de BASELINE_TARGETS, relevés DANS l'état où le
    // budget a convergé, et APRÈS les changements de niveau.
    b.apresConvergence = {
      pan: JSON.parse(await evalue('window.runPan(120).then(JSON.stringify)')),
      selection: JSON.parse(await evalue('window.runSelect(40).then(JSON.stringify)')),
      aspects: JSON.parse(await evalue('JSON.stringify(window.aspects())')),
    };
    // G7 : ARIA et clavier APRÈS les changements de niveau du budget.
    b.aria = JSON.parse(await evalue('JSON.stringify(window.checkAria())'));
    b.clavier = JSON.parse(await evalue('JSON.stringify(window.checkKeyboard())'));
  }
  return b;
}

function agrege(calepin, forme, runs, extra) {
  const r = {
    calepin, forme,
    plancherLisibilite: runs[0].plancherLisibilite,
    seuils: runs[0].seuils,
    seuilLentMs: runs[0].seuilLentMs,
    seuilRapideMs: runs[0].seuilRapideMs,
    tDernierChangementMs: stat(runs.map((x) => x.tDernierChangementMs)),
    ipsRegimeStable: stat(runs.map((x) => x.ipsRegimeStable ?? 0)),
    ipsGlobalMedian: stat(runs.map((x) => x.ipsGlobalMedian ?? 0)),
    pireInversions10s: stat(runs.map((x) => x.pireInversionsSurFenetreGlissante10s)),
    inversionsTotales: stat(runs.map((x) => x.inversionsTotales)),
    seuilMaxObserve: stat(runs.map((x) => x.seuilMaxObserve)),
    niveauFinal: stat(runs.map((x) => x.niveauFinal)),
    blocsFinal: stat(runs.map((x) => x.blocsFinal)),
    domFinal: stat(runs.map((x) => x.domFinal)),
    nbDecisions: stat(runs.map((x) => x.nbDecisions)),
    revirtualisations: stat(runs.map((x) => x.revirtualisations)),
    nbReconstructions: stat(runs.map((x) => x.nbReconstructions)),
    nbReconstructionsChangeantBlocs: stat(runs.map((x) => x.nbReconstructionsChangeantBlocs)),
    coutReconstructionMedianMs: stat(runs.map((x) => x.coutReconstructionMedianMs ?? 0)),
    coutReconstructionMaxMs: stat(runs.map((x) => x.coutReconstructionMaxMs ?? 0)),
    coutReconstructionTotalMs: stat(runs.map((x) => x.coutReconstructionTotalMs ?? 0)),
    deltaBlocsMax: stat(runs.map((x) => x.deltaBlocsMax)),
    fenetresAuPlancher: stat(runs.map((x) => x.fenetresAuPlancher)),
    // Verdicts par exécution, jamais par médiane : un critère « sur chacune
    // des 5 exécutions » se juge sur la PIRE, pas sur la médiane.
    toutesAuMoins30ips: runs.every((x) => (x.ipsRegimeStable ?? 0) >= 30),
    toutesConvergentSous2s: runs.every((x) => x.convergenceSous2s),
    toutesAuPlus2Inversions: runs.every((x) => x.pireInversionsSurFenetreGlissante10s <= 2),
    plancherJamaisFranchi: runs.every((x) => !x.plancherFranchi),
    plancherAtteintAuMoinsUneFois: runs.some((x) => x.plancherAtteintSansCible),
    plancherAtteintTouteslesFois: runs.every((x) => x.plancherAtteintSansCible),
    revirtualisationsToujoursNonNulles: runs.every((x) => x.revirtualisations > 0),
    reconstructionReelleAuMoinsUneFois: runs.some((x) => x.nbReconstructionsChangeantBlocs > 0),
    runs,
  };
  if (extra) Object.assign(r, extra(runs));
  return r;
}

const sortie = {
  banc: 'B2 ter', tache: 'TASK-0014',
  moteurCle: CLE, moteurNom: M.nom, executable: M.exe,
  versionCdp: version, environnement: env, executions: RUNS,
  page: PAGE, graine: GRAINE,
  configControleur: configPage,
  contraintePlancher: CONTRAINTE_PLANCHER,
  dureeMs: DUREE_MS, chocApresMs: CHOC_MS,
  controleur: [], plancher: [], calA: [],
};

// --------------------------------------------------------------- phase 1
if (PHASES.includes('controleur')) {
  console.log('\n===== PHASE 1 — contrôleur corrigé, CAL-B, quatre formes (' + CLE + ') =====');
  for (const forme of FORMES) {
    const runs = [];
    for (let i = 0; i < RUNS; i++) runs.push(await uneExecution(forme, 'CAL-B', {}, DUREE_MS, true));
    const r = agrege('CAL-B', forme, runs, (rs) => ({
      apresConvergenceIpsPan: stat(rs.map((x) => x.apresConvergence.pan.ipsMedian)),
      apresConvergenceSelP95Ms: stat(rs.map((x) => x.apresConvergence.selection.p95Ms)),
      apresConvergenceBlocs: stat(rs.map((x) => x.apresConvergence.pan.blocsVisibles)),
      apresConvergenceDom: stat(rs.map((x) => x.apresConvergence.pan.noeudsDom)),
      apresConvergenceRevirt: stat(rs.map((x) => x.apresConvergence.pan.revirtualisations)),
      toutesSelSous150ms: rs.every((x) => x.apresConvergence.selection.p95Ms <= 150),
      ariaConformeToutes: rs.every((x) => x.aria.conforme),
      clavierConformeToutes: rs.every((x) => x.clavier.toutesLesTouchesConformes && x.clavier.focusDomSuit),
    }));
    sortie.controleur.push(r);
    console.log(`CAL-B ${forme.padEnd(14)} | ipsStable=${String(r.ipsRegimeStable.med).padStart(7)} [${r.ipsRegimeStable.min}-${r.ipsRegimeStable.max}] >=30 toutes=${r.toutesAuMoins30ips}`
      + ` | tDernierChg=${String(r.tDernierChangementMs.med).padStart(7)}ms [${r.tDernierChangementMs.min}-${r.tDernierChangementMs.max}] <=2s toutes=${r.toutesConvergentSous2s}`
      + ` | pireInv10s=${r.pireInversions10s.max} | niveau=${r.niveauFinal.med} seuil<=${r.seuilMaxObserve.max}/${r.plancherLisibilite}`
      + ` | revirt=${r.revirtualisations.med} reconstr=${r.nbReconstructions.med} (chgBlocs=${r.nbReconstructionsChangeantBlocs.med}) coutMed=${r.coutReconstructionMedianMs.med}ms`
      + ` | selP95=${r.apresConvergenceSelP95Ms.med}ms | aria=${r.ariaConformeToutes} clav=${r.clavierConformeToutes}`);
  }
}

// --------------------------------------------------------------- phase 2
if (PHASES.includes('plancher')) {
  console.log('\n===== PHASE 2 — plancher de lisibilité, contrainte inatteignable ' + CONTRAINTE_PLANCHER.cibleIps + ' ips (' + CLE + ') =====');
  for (const forme of FORMES) {
    const runs = [];
    for (let i = 0; i < RUNS; i++) {
      runs.push(await uneExecution(forme, 'CAL-B', CONTRAINTE_PLANCHER, DUREE_PLANCHER_MS, false));
    }
    const r = agrege('CAL-B', forme, runs);
    r.cibleIpsContrainte = CONTRAINTE_PLANCHER.cibleIps;
    sortie.plancher.push(r);
    console.log(`CAL-B ${forme.padEnd(14)} | seuilMax=${String(r.seuilMaxObserve.med).padStart(7)}/${r.plancherLisibilite}`
      + ` | niveau=${r.niveauFinal.med}/${runs[0].seuils.length - 1} | fenetresAuPlancher=${r.fenetresAuPlancher.med}`
      + ` | plancherAtteint TOUTES=${r.plancherAtteintTouteslesFois} | PLANCHER FRANCHI=${!r.plancherJamaisFranchi}`
      + ` | blocs=${r.blocsFinal.med} ipsStable=${r.ipsRegimeStable.med}`);
  }
}

// --------------------------------------------------------------- phase 3
// CONTRÔLE PONCTUEL. `CAL-A` / `SYN-WIDE` est la configuration exacte qui
// avait réfuté `F4` dans `TASK-0013`, avec un régime stable à 26,60 ips.
// Ce contrôle NE FONDE AUCUN critère G1 à G9 : il situe, il ne décide pas.
if (PHASES.includes('calA')) {
  console.log('\n===== PHASE 3 — contrôle ponctuel CAL-A / SYN-WIDE (' + CLE + ') =====');
  const runs = [];
  for (let i = 0; i < RUNS; i++) runs.push(await uneExecution('SYN-WIDE', 'CAL-A', {}, DUREE_MS, true));
  const r = agrege('CAL-A', 'SYN-WIDE', runs, (rs) => ({
    apresConvergenceSelP95Ms: stat(rs.map((x) => x.apresConvergence.selection.p95Ms)),
    ariaConformeToutes: rs.every((x) => x.aria.conforme),
    clavierConformeToutes: rs.every((x) => x.clavier.toutesLesTouchesConformes && x.clavier.focusDomSuit),
  }));
  sortie.calA.push(r);
  console.log(`CAL-A SYN-WIDE       | ipsStable=${r.ipsRegimeStable.med} [${r.ipsRegimeStable.min}-${r.ipsRegimeStable.max}] >=30 toutes=${r.toutesAuMoins30ips}`
    + ` | tDernierChg=${r.tDernierChangementMs.med}ms | niveau=${r.niveauFinal.med} | revirt=${r.revirtualisations.med}`);
}

const fichier = path.join(WORK, 'rapport-b2ter-' + CLE + '.json');
if (fs.existsSync(fichier)) {
  const ancien = JSON.parse(fs.readFileSync(fichier, 'utf8'));
  for (const ph of ['controleur', 'plancher', 'calA']) {
    if (!PHASES.includes(ph) && ancien[ph]) sortie[ph] = ancien[ph];
  }
  console.log('rapport fusionné avec le précédent; phases rejouées : ' + PHASES.join(', '));
}
fs.writeFileSync(fichier, JSON.stringify(sortie, null, 1));
console.log('\nRapport : ' + path.relative(RACINE, fichier).split(path.sep).join('/'));

ws.close();
nav.kill();
await dors(500);
process.exit(0);
