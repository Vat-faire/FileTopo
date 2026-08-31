// B2 bis — Pilote de mesure. CODE JETABLE.
//
// Dépendances : AUCUNE. Le moteur est piloté par le protocole CDP, sur le
// client `WebSocket` intégré à Node 24. Aucun paquet n'est installé, ni dans
// le dépôt, ni sur le système.
//
// Les images par seconde sont relevées par l'horloge de rendu du moteur
// (`requestAnimationFrame`), à l'intérieur de la page. Elles ne sont ni
// estimées, ni calculées côté Node.
//
// Tout ce qui est écrit sur le disque va sous `spikes/.work/b2bis/`, ignoré
// par Git — y compris le profil du navigateur. Rien n'est écrit hors du dépôt.
//
// Usage : node run-b2bis.mjs <cle-moteur> [phases] [executions]
//   cle-moteur : edge | chrome | webview2
//   phases     : liste séparée par des virgules parmi
//                matrice,volumetrie,budget,plancher   (défaut : toutes)

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, '../..');
const WORK = path.resolve(RACINE, 'spikes/.work/b2bis');
const versUrl = (p) => 'file:///' + path.resolve(p).split(path.sep).join('/');
const PAGE = versUrl(path.join(ICI, 'map2.html'));

const MOTEURS = {
  edge: { exe: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', nom: 'Microsoft Edge' },
  chrome: { exe: 'C:/Program Files/Google/Chrome/Application/chrome.exe', nom: 'Google Chrome' },
  webview2: { exe: 'C:/Program Files (x86)/Microsoft/EdgeWebView/Application/151.0.4129.107/msedgewebview2.exe', nom: 'WebView2 Runtime' },
};

const CLE = process.argv[2] || 'edge';
const PHASES = (process.argv[3] || 'matrice,volumetrie,budget,plancher').split(',');
const RUNS = Number(process.argv[4] ?? 5);
const PORT = 9350 + Object.keys(MOTEURS).indexOf(CLE);
const M = MOTEURS[CLE];
if (!M) { console.error('moteur inconnu : ' + CLE); process.exit(2); }
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
  // AUCUN drapeau ne débride la fréquence d'images : ni --disable-gpu-vsync,
  // ni --disable-frame-rate-limit. Une mesure débridée ne voudrait rien dire.
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
function sourceInjectable(rel) {
  const brut = fs.readFileSync(path.resolve(RACINE, rel), 'utf8');
  return brut.split('\n').filter((l) => !/^\s*(export|import)\b/.test(l)).join('\n');
}
const MODULES = [
  'spikes/fixtures/synthetic-shapes.mjs',
  'spikes/b2bis-layout-and-budget/calepins.mjs',
  'spikes/b2bis-layout-and-budget/budget.mjs',
];
for (const rel of MODULES) {
  await evalue(sourceInjectable(rel) + '\n;window.__injecte = (window.__injecte||0)+1; window.__injecte');
}
const nbInjecte = await evalue('window.__injecte');
if (nbInjecte !== MODULES.length) throw new Error('injection incomplète : ' + nbInjecte);
// Contrôle : les trois points d'entrée existent réellement dans la page.
// Les déclarations `const` d'un script CDP créent une liaison LEXICALE globale,
// qui n'est pas une propriété de `globalThis` : le contrôle porte donc sur les
// identifiants eux-mêmes, pas sur `globalThis[nom]`.
const presents = await evalue('JSON.stringify({'
  + "construireArbre: typeof construireArbre, decrireArbre: typeof decrireArbre,"
  + "appliqueCalepin: typeof appliqueCalepin, calepinAlterne: typeof calepinAlterne,"
  + "calepinSquarifie: typeof calepinSquarifie, creerBudget: typeof creerBudget,"
  + "CONFIG_BUDGET: typeof CONFIG_BUDGET, FORMES_B2BIS: typeof FORMES_B2BIS"
  + '})');
if (JSON.parse(presents) && Object.values(JSON.parse(presents)).some((v) => v === 'undefined')) {
  throw new Error('point d\'entrée manquant dans la page : ' + presents);
}
console.log('modules injectés :', MODULES.length, '| points d\'entrée :', presents);

const env = JSON.parse(await evalue(`JSON.stringify({
  ua: navigator.userAgent, dpr: window.devicePixelRatio,
  w: window.innerWidth, h: window.innerHeight, langues: navigator.languages,
})`));
const version = await envoie('Browser.getVersion').catch(() => ({}));

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

const FORMES_20K = ['SYN-EQUILIBRE', 'SYN-DEEP', 'SYN-WIDE'];
const CIBLES = [1000, 3000, 5000];
const CALEPINS = ['CAL-A', 'CAL-B'];
const compte = (f) => (f === 'SYN-100K' ? 100000 : 20000);
const GRAINE = 20260831;

const config = (sc) => JSON.stringify({
  shape: sc.forme, count: compte(sc.forme), seed: GRAINE,
  cible: sc.cible, calepin: sc.calepin, mode: 'transform',
});

async function mesureScenario(sc) {
  const info = JSON.parse(await evalue('JSON.stringify(window.setup(' + config(sc) + '))'));
  const pans = [], zooms = [], sels = [], fits = [], asp = [];
  for (let i = 0; i < RUNS; i++) {
    await evalue('JSON.stringify(window.setup(' + config(sc) + '))');
    pans.push(JSON.parse(await evalue('window.runPan(120).then(JSON.stringify)')));
    zooms.push(JSON.parse(await evalue('window.runZoom(120).then(JSON.stringify)')));
    sels.push(JSON.parse(await evalue('window.runSelect(40).then(JSON.stringify)')));
    fits.push(JSON.parse(await evalue('window.runFit().then(JSON.stringify)')));
    asp.push(JSON.parse(await evalue('JSON.stringify(window.aspects())')));
  }
  const aria = JSON.parse(await evalue('JSON.stringify(window.checkAria())'));
  const clavier = JSON.parse(await evalue('JSON.stringify(window.checkKeyboard())'));
  const r = {
    scenario: sc, info,
    pan: {
      ipsMedian: stat(pans.map((p) => p.ipsMedian)),
      imageP95Ms: stat(pans.map((p) => p.imageP95Ms)),
      imagePireMs: stat(pans.map((p) => p.imagePireMs)),
      noeudsDom: stat(pans.map((p) => p.noeudsDom)),
      blocsVisibles: stat(pans.map((p) => p.blocsVisibles)),
      revirtualisations: stat(pans.map((p) => p.revirtualisations ?? 0)),
    },
    zoom: { ipsMedian: stat(zooms.map((p) => p.ipsMedian)), imageP95Ms: stat(zooms.map((p) => p.imageP95Ms)) },
    selection: { p95Ms: stat(sels.map((s) => s.p95Ms)), medianMs: stat(sels.map((s) => s.medianMs)), maxMs: stat(sels.map((s) => s.maxMs)) },
    ajustement: { latenceMs: stat(fits.map((f) => f.latenceMs)) },
    aspects: {
      median: stat(asp.map((a) => a.median)),
      p90: stat(asp.map((a) => a.p90)),
      p99: stat(asp.map((a) => a.p99)),
      max: stat(asp.map((a) => a.max)),
      moyenne: stat(asp.map((a) => a.moyenne)),
      partSup10: stat(asp.map((a) => a.partSup10)),
      partSup50: stat(asp.map((a) => a.partSup50)),
      degeneres: stat(asp.map((a) => a.degeneres)),
      n: stat(asp.map((a) => a.n)),
    },
    aria, clavier,
  };
  console.log(`${sc.calepin} ${sc.forme.padEnd(14)} cible=${String(sc.cible).padStart(4)} | vis=${String(info.blocsVisibles).padStart(5)} dom=${String(info.noeudsDom).padStart(6)}`
    + ` | pan ips=${String(r.pan.ipsMedian.med).padStart(7)} [${r.pan.ipsMedian.min}-${r.pan.ipsMedian.max}]`
    + ` | zoom ips=${String(r.zoom.ipsMedian.med).padStart(7)} | sel p95=${String(r.selection.p95Ms.med).padStart(7)}ms`
    + ` | aspect med=${String(r.aspects.median.med).padStart(8)} p99=${String(r.aspects.p99.med).padStart(9)}`
    + ` | revirt=${r.pan.revirtualisations.med} | aria=${aria.conforme} clav=${clavier.toutesLesTouchesConformes && clavier.focusDomSuit}`);
  return r;
}

const sortie = {
  moteurCle: CLE, moteurNom: M.nom, executable: M.exe,
  versionCdp: version, environnement: env, executions: RUNS,
  page: PAGE, date: null,
  matrice: [], volumetrie: [], budget: [],
};

// --------------------------------------------------------------- phase A
if (PHASES.includes('matrice')) {
  console.log('\n===== PHASE A — matrice des calepins (' + CLE + ') =====');
  for (const calepin of CALEPINS) {
    for (const forme of FORMES_20K) {
      for (const cible of CIBLES) {
        sortie.matrice.push(await mesureScenario({ calepin, forme, cible }));
      }
    }
  }
}

// --------------------------------------------------------------- phase B
if (PHASES.includes('volumetrie')) {
  console.log('\n===== PHASE B — volumétrie SYN-100K (' + CLE + ') =====');
  for (const calepin of CALEPINS) {
    for (const cible of CIBLES) {
      sortie.volumetrie.push(await mesureScenario({ calepin, forme: 'SYN-100K', cible }));
    }
  }
}

// --------------------------------------------------------------- phase C
if (PHASES.includes('budget')) {
  console.log('\n===== PHASE C — budget de rendu auto-régulé (' + CLE + ') =====');
  for (const calepin of CALEPINS) {
    for (const forme of [...FORMES_20K, 'SYN-100K']) {
      const runs = [];
      for (let i = 0; i < RUNS; i++) {
        // `cible: 0` : aucun seuil imposé, c'est le budget qui décide.
        await evalue('JSON.stringify(window.setup(' + JSON.stringify({
          shape: forme, count: compte(forme), seed: GRAINE, cible: 0, calepin, mode: 'transform',
        }) + '))');
        const b = JSON.parse(await evalue('window.runBudget({dureeMs:14000,chocApresMs:600}).then(JSON.stringify)'));
        b.aria = JSON.parse(await evalue('JSON.stringify(window.checkAria())'));
        b.clavier = JSON.parse(await evalue('JSON.stringify(window.checkKeyboard())'));
        runs.push(b);
      }
      const r = {
        calepin, forme,
        plancherLisibilite: runs[0].plancherLisibilite,
        seuils: runs[0].seuils,
        tDernierChangementMs: stat(runs.map((x) => x.tDernierChangementMs)),
        ipsRegimeStable: stat(runs.map((x) => x.ipsRegimeStable ?? 0)),
        ipsGlobalMedian: stat(runs.map((x) => x.ipsGlobalMedian ?? 0)),
        inversionsSurFenetre10s: stat(runs.map((x) => x.inversionsSurFenetre10s)),
        seuilMaxObserve: stat(runs.map((x) => x.seuilMaxObserve)),
        niveauFinal: stat(runs.map((x) => x.niveauFinal)),
        blocsFinal: stat(runs.map((x) => x.blocsFinal)),
        domFinal: stat(runs.map((x) => x.domFinal)),
        nbDecisions: stat(runs.map((x) => x.nbDecisions)),
        reconstructions: stat(runs.map((x) => x.reconstructions)),
        convergenceSous2sToutes: runs.every((x) => x.convergenceSous2s),
        plancherFranchiUneFois: runs.some((x) => x.plancherFranchi),
        plancherAtteintSansCible: runs.some((x) => x.plancherAtteintSansCible),
        ariaConformeToutes: runs.every((x) => x.aria.conforme),
        clavierConformeToutes: runs.every((x) => x.clavier.toutesLesTouchesConformes && x.clavier.focusDomSuit),
        runs,
      };
      sortie.budget.push(r);
      console.log(`${calepin} ${forme.padEnd(14)} | tDernierChg=${String(r.tDernierChangementMs.med).padStart(7)}ms `
        + `| ipsStable=${String(r.ipsRegimeStable.med).padStart(7)} | inversions10s=${r.inversionsSurFenetre10s.med} `
        + `| seuilMax=${r.seuilMaxObserve.med}/${r.plancherLisibilite} | niveau=${r.niveauFinal.med} `
        + `| blocs=${r.blocsFinal.med} dom=${r.domFinal.med} | plancherAtteint=${r.plancherAtteintSansCible} `
        + `| aria=${r.ariaConformeToutes} clav=${r.clavierConformeToutes}`);
    }
  }
}

// --------------------------------------------------------------- phase D
// PLANCHER DE LISIBILITÉ SOUS CONTRAINTE. Cette phase n'est PAS la mesure de
// `F4` : elle éprouve l'exigence §5.2.3, « il n'agrège pas davantage même s'il
// n'atteint pas sa cible d'images par seconde ». La cible est portée à 240 ips,
// volontairement inatteignable sur les formes chargées, pour forcer le
// contrôleur à monter jusqu'au plancher et à y rester.
if (PHASES.includes('plancher')) {
  console.log('\n===== PHASE D — plancher de lisibilité sous contrainte (' + CLE + ') =====');
  sortie.plancher = [];
  for (const calepin of CALEPINS) {
    for (const forme of [...FORMES_20K, 'SYN-100K']) {
      const runs = [];
      for (let i = 0; i < RUNS; i++) {
        await evalue('JSON.stringify(window.setup(' + JSON.stringify({
          shape: forme, count: compte(forme), seed: GRAINE, cible: 0, calepin, mode: 'transform',
        }) + '))');
        runs.push(JSON.parse(await evalue(
          'window.runBudget({dureeMs:9000,chocApresMs:600,config:{cibleIps:240}}).then(JSON.stringify)')));
      }
      const r = {
        calepin, forme, cibleIps: 240,
        plancherLisibilite: runs[0].plancherLisibilite,
        seuilMaxObserve: stat(runs.map((x) => x.seuilMaxObserve)),
        niveauFinal: stat(runs.map((x) => x.niveauFinal)),
        blocsFinal: stat(runs.map((x) => x.blocsFinal)),
        ipsRegimeStable: stat(runs.map((x) => x.ipsRegimeStable ?? 0)),
        plancherFranchiUneFois: runs.some((x) => x.plancherFranchi),
        plancherAtteintSansCible: runs.every((x) => x.plancherAtteintSansCible),
        runs,
      };
      sortie.plancher.push(r);
      console.log(`${calepin} ${forme.padEnd(14)} | seuilMax=${String(r.seuilMaxObserve.med).padStart(7)}/${r.plancherLisibilite} `
        + `| niveau=${r.niveauFinal.med}/${runs[0].seuils.length - 1} | blocs=${r.blocsFinal.med} `
        + `| ipsStable=${r.ipsRegimeStable.med} | plancherAtteintEtTenu=${r.plancherAtteintSansCible} `
        + `| PLANCHER FRANCHI=${r.plancherFranchiUneFois}`);
    }
  }
}

const fichier = path.join(WORK, 'rapport-b2bis-' + CLE + '.json');
fs.writeFileSync(fichier, JSON.stringify(sortie, null, 1));
console.log('\nRapport : ' + path.relative(RACINE, fichier).split(path.sep).join('/'));

ws.close();
nav.kill();
await dors(500);
process.exit(0);
