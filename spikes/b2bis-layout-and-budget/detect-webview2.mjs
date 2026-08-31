// B2 bis — Tentative d'instrumentation de WEBVIEW2, exigée en premier par
// TASK-0013 §5.4. CODE JETABLE.
//
// Ce script n'est pas une démonstration a posteriori : c'est la procédure
// réellement exécutée, conservée pour être rejouée. Il n'installe rien, ne
// télécharge rien, n'écrit rien hors de `spikes/.work/b2bis/`.
//
// Il enregistre, pour chaque tentative : la commande exacte, le code de sortie,
// la sortie d'erreur, et si un point d'accès CDP a pu être joint.
//
// Usage : node detect-webview2.mjs [chemin-msedgewebview2.exe]

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, '../..');
const WORK = path.resolve(RACINE, 'spikes/.work/b2bis');
fs.mkdirSync(WORK, { recursive: true });
const versUrl = (p) => 'file:///' + path.resolve(p).split(path.sep).join('/');
const PAGE = versUrl(path.join(ICI, 'map2.html'));
const dors = (ms) => new Promise((r) => setTimeout(r, ms));

const EXE = process.argv[2]
  || 'C:/Program Files (x86)/Microsoft/EdgeWebView/Application/151.0.4129.107/msedgewebview2.exe';

if (!fs.existsSync(EXE)) {
  console.error('msedgewebview2.exe introuvable : ' + EXE);
  process.exit(2);
}

const journal = [];

async function tentative(nom, extra, port) {
  const args = ['--remote-debugging-port=' + port,
    '--user-data-dir=' + path.join(WORK, 'wv2-' + port),
    '--no-first-run', '--window-size=1600,900', ...extra];
  const t0 = Date.now();
  const p = spawn(EXE, args, { stdio: ['ignore', 'pipe', 'pipe'] });
  let err = '', sortie = null, tSortie = null;
  p.stderr.on('data', (d) => { err += d; });
  p.on('exit', (c) => { sortie = c; tSortie = Date.now() - t0; });

  // On martèle le serveur HTTP CDP toutes les 50 ms pendant 6 s.
  let cdp = null, tCdp = null, pageJointe = null;
  for (let i = 0; i < 120; i++) {
    try {
      const r = await fetch('http://127.0.0.1:' + port + '/json/version', { signal: AbortSignal.timeout(300) });
      cdp = await r.json(); tCdp = Date.now() - t0;
      try {
        const l = await (await fetch('http://127.0.0.1:' + port + '/json/list')).json();
        pageJointe = l.map((x) => ({ type: x.type, url: x.url }));
      } catch { /* liste indisponible */ }
      break;
    } catch { /* pas d'écoute */ }
    if (sortie !== null && Date.now() - t0 > 2500) break;
    await dors(50);
  }
  try { p.kill(); } catch { /* déjà mort */ }
  await dors(150);

  const annonce = /DevTools listening on (ws:\S+)/.exec(err);
  const e = {
    nom, commande: [EXE, ...args].join(' '),
    codeSortie: sortie, msAvantSortie: tSortie,
    pointAccesAnnonce: annonce ? annonce[1] : null,
    cdpJoint: !!cdp, msAvantCdp: tCdp,
    cibles: pageJointe,
    stderr: err.trim().split('\n').slice(0, 6).join(' | '),
  };
  journal.push(e);
  console.log(`\n--- ${nom} ---`);
  console.log('commande : ' + e.commande);
  console.log('code de sortie : ' + e.codeSortie + (e.msAvantSortie !== null ? '  après ' + e.msAvantSortie + ' ms' : ''));
  console.log('point d\'accès annoncé : ' + (e.pointAccesAnnonce || 'AUCUN'));
  console.log('serveur CDP joint : ' + (e.cdpJoint ? 'OUI après ' + e.msAvantCdp + ' ms' : 'NON'));
  if (e.stderr) console.log('stderr : ' + e.stderr);
  return e;
}

console.log('Exécutable : ' + EXE);
await tentative('T1 — lancement direct, page du banc', [PAGE], 9471);
await tentative('T2 — --version', ['--version'], 9472);
await tentative('T3 — --headless=new', ['--headless=new', 'about:blank'], 9473);
await tentative('T4 — --embedded-browser-webview=1', ['--embedded-browser-webview=1', 'about:blank'], 9474);
await tentative('T5 — --embedded-browser-webview=1 --keep-alive-for-test', ['--embedded-browser-webview=1', '--keep-alive-for-test', 'about:blank'], 9475);
await tentative('T6 — --embedded-browser-webview=1, page du banc', ['--embedded-browser-webview=1', PAGE], 9476);

const utilisable = journal.some((e) => e.cdpJoint && e.cibles && e.cibles.some((c) => c.type === 'page'));
const bilan = {
  executable: EXE,
  conclusion: utilisable
    ? 'WEBVIEW2 INSTRUMENTABLE — F8 peut être confirmée'
    : 'WEBVIEW2 NON INSTRUMENTABLE sans hôte embarqueur — F8 est réfutée, §5.4 s\'applique',
  tentatives: journal,
};
fs.writeFileSync(path.join(WORK, 'webview2-tentatives.json'), JSON.stringify(bilan, null, 1));
console.log('\n=== ' + bilan.conclusion + ' ===');
console.log('Journal : spikes/.work/b2bis/webview2-tentatives.json');
process.exit(0);
