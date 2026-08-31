// B2 — Pilote de mesure du rendu HTML/SVG. CODE JETABLE.
//
// Dépendances : AUCUNE. Le navigateur est piloté par le protocole CDP, sur le
// client `WebSocket` intégré à Node 24. Aucun paquet n'est installé, ni dans
// le dépôt, ni sur le système.
//
// Les images par seconde sont relevées par l'horloge de rendu du navigateur
// (`requestAnimationFrame`), à l'intérieur de la page, comme l'exige §9.1.6.
// Elles ne sont ni estimées, ni calculées côté Node.
//
// Usage : node run-b2.mjs [chemin-navigateur] [headless|headed] [executions]

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const WORK = path.resolve(HERE, '../.work/b2');
const PAGE = 'file:///' + path.join(HERE, 'map.html').replace(/\\/g, '/');

const NAVIGATEUR = process.argv[2] || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const MODE = process.argv[3] || 'headless';
const RUNS = Number(process.argv[4] ?? 5);
const PORT = 9333;

fs.mkdirSync(WORK, { recursive: true });
const profil = fs.mkdtempSync(path.join(os.tmpdir(), 'b2-profil-'));

const dors = (ms) => new Promise((r) => setTimeout(r, ms));

// --------------------------------------------------------------- lancement
const args = [
  '--remote-debugging-port=' + PORT,
  '--user-data-dir=' + profil,
  '--no-first-run', '--no-default-browser-check',
  '--disable-extensions', '--disable-background-networking',
  '--window-size=1600,900',
  // AUCUN drapeau ne débride la fréquence d'images : ni
  // --disable-gpu-vsync, ni --disable-frame-rate-limit. Une mesure débridée
  // gonflerait les ips et ne voudrait rien dire.
];
if (MODE === 'headless') args.push('--headless=new');
args.push(PAGE);

const nav = spawn(NAVIGATEUR, args, { stdio: 'ignore' });

async function cible() {
  for (let i = 0; i < 100; i++) {
    try {
      const r = await fetch('http://127.0.0.1:' + PORT + '/json/list');
      const l = await r.json();
      const p = l.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
      if (p) return p;
    } catch { /* le navigateur n'écoute pas encore */ }
    await dors(150);
  }
  throw new Error('cible CDP introuvable');
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

/** Évalue une expression dans la page et rend sa valeur. */
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

// Attendre que la page ait fini de définir ses fonctions.
for (let i = 0; i < 100; i++) {
  try { if (await evalue('window.pret === true')) break; } catch { /* pas encore */ }
  await dors(150);
}

const env = await evalue(`(${JSON.stringify({})}, JSON.stringify({
  ua: navigator.userAgent,
  dpr: window.devicePixelRatio,
  w: window.innerWidth, h: window.innerHeight,
}))`);

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

// --------------------------------------------------------------- scénarios
// Deux mises en œuvre du MÊME rendu HTML/SVG sont comparées :
//   `reecriture` — la géométrie de chaque bloc visible est réécrite à chaque
//                  image (mise en œuvre naïve);
//   `transform`  — les blocs sont posés en coordonnées monde et le déplacement
//                  se fait par UNE transformation de groupe, la virtualisation
//                  n'étant refaite qu'en sortie de marge ou sur un zoom marqué.
// Comparer les deux évite de condamner l'option A de DEC-0008 sur la seule
// foi d'une mise en œuvre médiocre.
const SCENARIOS = [];
for (const mode of ['reecriture', 'transform']) {
  for (const cibleVis of [1000, 3000, 5000]) {
    for (const forme of ['SYN-DEEP', 'SYN-WIDE', 'SYN-EQUILIBRE']) {
      SCENARIOS.push({ mode, forme, cible: cibleVis, count: 20000 });
    }
  }
}

// ------------------------------------------------------- recherche de plafond
// §9.2 exige que « le nombre de blocs au-delà duquel les seuils ne tiennent
// plus » soit MESURÉ et publié. Recherche dichotomique du plus grand nombre de
// blocs visibles qui tient encore les deux seuils, par forme d'arborescence.
if (process.env.B2_PHASE === 'plafond') {
  const SEUIL_IPS = 30, SEUIL_SEL = 150;
  const plafonds = [];
  for (const forme of ['SYN-DEEP', 'SYN-WIDE', 'SYN-EQUILIBRE']) {
    let lo = 100, hi = 8000, dernierOk = null, essais = [];
    for (let it = 0; it < 7; it++) {
      const cible = Math.round((lo + hi) / 2);
      const ips = [], sel = [];
      let vis = 0, dom = 0;
      for (let i = 0; i < 3; i++) {
        const info = JSON.parse(await evalue(`JSON.stringify(window.setup(${JSON.stringify({
          shape: forme, count: 20000, seed: 20260831, cible: 0, mode: 'transform',
        })}))`.replace('"cible":0', '"cible":' + cible)));
        vis = info.blocsVisibles; dom = info.noeudsDom;
        const p = JSON.parse(await evalue('window.runPan(90).then(JSON.stringify)'));
        const s2 = JSON.parse(await evalue('window.runSelect(30).then(JSON.stringify)'));
        ips.push(p.ipsMedian); sel.push(s2.p95Ms);
      }
      const ipsMed = ips.sort((a, b) => a - b)[1];
      const selMed = sel.sort((a, b) => a - b)[1];
      const tient = ipsMed >= SEUIL_IPS && selMed <= SEUIL_SEL;
      essais.push({ cible, blocsVisibles: vis, noeudsDom: dom, ipsMedian: +ipsMed.toFixed(2), selP95Ms: +selMed.toFixed(2), tient });
      console.log(`${forme.padEnd(14)} cible=${String(cible).padStart(4)} vis=${String(vis).padStart(4)} dom=${String(dom).padStart(5)} ips=${ipsMed.toFixed(2)} selP95=${selMed.toFixed(1)}ms -> ${tient ? 'TIENT' : 'ROMPT'}`);
      if (tient) { dernierOk = { cible, vis, ips: +ipsMed.toFixed(2), sel: +selMed.toFixed(2) }; lo = cible; }
      else hi = cible;
      if (hi - lo < 120) break;
    }
    plafonds.push({ forme, plafond: dernierOk, essais });
    console.log(`>>> ${forme} : plafond mesuré = ${dernierOk ? dernierOk.vis + ' blocs visibles' : 'sous 100 blocs'}
`);
  }
  fs.writeFileSync(path.join(WORK, 'plafonds-b2.json'), JSON.stringify({ seuils: { ips: SEUIL_IPS, selectionP95Ms: SEUIL_SEL }, plafonds }, null, 2));
  console.log('Plafonds : spikes/.work/b2/plafonds-b2.json');
  ws.close(); nav.kill(); await dors(400);
  try { fs.rmSync(profil, { recursive: true, force: true }); } catch { /* verrouille */ }
  process.exit(0);
}

const resultats = [];
for (const sc of SCENARIOS) {
  const setup = await evalue(`JSON.stringify(window.setup(${JSON.stringify({
    shape: sc.forme, count: sc.count, seed: 20260831, cible: sc.cible, mode: sc.mode,
  })}))`);
  const info = JSON.parse(setup);

  const pans = [], zooms = [], sels = [], fits = [];
  for (let i = 0; i < RUNS; i++) {
    // Même trajectoire scriptée à chaque exécution : la page repart du même
    // état et parcourt le même chemin.
    await evalue(`JSON.stringify(window.setup(${JSON.stringify({
      shape: sc.forme, count: sc.count, seed: 20260831, cible: sc.cible, mode: sc.mode,
    })}))`);
    pans.push(JSON.parse(await evalue('window.runPan(120).then(JSON.stringify)')));
    zooms.push(JSON.parse(await evalue('window.runZoom(120).then(JSON.stringify)')));
    sels.push(JSON.parse(await evalue('window.runSelect(40).then(JSON.stringify)')));
    fits.push(JSON.parse(await evalue('window.runFit().then(JSON.stringify)')));
  }

  const aria = JSON.parse(await evalue('JSON.stringify(window.checkAria())'));
  const clavier = JSON.parse(await evalue('JSON.stringify(window.checkKeyboard())'));

  const r = {
    scenario: sc,
    info,
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
    aria, clavier,
  };
  resultats.push(r);
  console.log(`${sc.mode.padEnd(11)} ${sc.forme.padEnd(14)} cible=${String(sc.cible).padStart(4)} | vis=${String(info.blocsVisibles).padStart(4)} dom=${String(info.noeudsDom).padStart(5)} | pan ips=${String(r.pan.ipsMedian.med).padStart(6)} [${r.pan.ipsMedian.min}-${r.pan.ipsMedian.max}] | zoom ips=${String(r.zoom.ipsMedian.med).padStart(6)} | sel p95=${String(r.selection.p95Ms.med).padStart(6)}ms | revirt=${r.pan.revirtualisations.med} | aria=${aria.conforme} clav=${clavier.toutesLesTouchesConformes && clavier.focusDomSuit}`);
}

const sortie = {
  mode: MODE, navigateur: NAVIGATEUR, environnement: JSON.parse(env),
  executions: RUNS, resultats,
};
fs.writeFileSync(path.join(WORK, 'rapport-b2-' + MODE + '.json'), JSON.stringify(sortie, null, 2));
console.log('\nRapport : spikes/.work/b2/rapport-b2-' + MODE + '.json');

ws.close();
nav.kill();
await dors(400);
try { fs.rmSync(profil, { recursive: true, force: true }); } catch { /* verrouillé */ }
process.exit(0);
