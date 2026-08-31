// B1 — Orchestrateur du banc d'essai de migration SQLite. CODE JETABLE.
//
// Couvre les huit points de §8.1 de TASK-0012. Toutes les bases sont
// SYNTHÉTIQUES et vivent sous spikes/.work/b1/, ignoré par Git. Aucun fichier
// de l'utilisateur n'est lu, listé, copié ni migré.
//
// Usage : node run-b1.mjs [nombre-de-noeuds] [nombre-d-executions]

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  MC_STEPS, MCH_STEPS, MB_STEPS, buildLegacyDb, migrateMC, migrateMCHardened, migrateMB,
  rollbackToBackup, inspect, classify, sidecars, tmpOf, bakOf,
} from './migration.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const WORK = path.resolve(HERE, '../.work/b1');
const CHILD = path.join(HERE, 'crash-child.mjs');

const COUNT = Number(process.argv[2] ?? 50000);
const RUNS = Number(process.argv[3] ?? 5);

fs.rmSync(WORK, { recursive: true, force: true });
fs.mkdirSync(WORK, { recursive: true });

const report = { count: COUNT, runs: RUNS, sections: {} };
const say = (s) => { process.stdout.write(s + '\n'); };
const stat = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  return { min: s[0], med: s[(s.length - 1) >> 1], max: s[s.length - 1], n: s.length };
};
const sizeOf = (p) => (fs.existsSync(p) ? fs.statSync(p).size : 0);

// IMPORTANT : `rawListing` n'OUVRE JAMAIS la base. Ouvrir une base WAL crée
// `-wal` et `-shm`; s'en servir pour observer l'état du disque fabriquerait
// l'observation. Toute constatation sur les fichiers annexes passe par ici.
const rawListing = (target) => {
  const dir = path.dirname(target);
  const base = path.basename(target);
  return fs.readdirSync(dir).filter((f) => f.startsWith(base))
    .map((f) => f + ':' + fs.statSync(path.join(dir, f)).size).sort();
};

// ==========================================================================
// Point 2, 3 : bascule M-C, et traitement de .wal / .shm
// ==========================================================================
say('### Point 2-3 : bascule M-C et fichiers annexes');
{
  const { DatabaseSync } = await import('node:sqlite');
  const t = path.join(WORK, 'p23.sqlite');
  const rows = buildLegacyDb(t, { count: COUNT });

  const apresFermetureNette = rawListing(t);

  // Un `-wal` n'existe sur le disque que tant qu'une connexion est ouverte.
  const d = new DatabaseSync(t);
  d.exec('PRAGMA journal_mode = WAL');
  d.prepare('INSERT INTO nodes VALUES (?,?,?,?,?,?)').run(999999, 1, 'sonde-wal', 'file', 1, 1);
  const connexionOuverte = rawListing(t);
  d.close();
  const apresFermeture = rawListing(t);

  const avant = rawListing(t);
  const res = migrateMC(t);
  const apres = rawListing(t);       // relevé AVANT toute réouverture
  const info = inspect(t);           // n'ouvre qu'ensuite

  report.sections.p23 = {
    lignesInitiales: rows + 1,
    apresFermetureNette,
    connexionOuverte,
    apresFermeture,
    avant, resultat: res, apres,
    classement: classify(info),
    integrity: info.integrity,
    lignes: info.lignes,
    colonnes: info.colonnes,
    user_version: info.user_version,
  };
  say(JSON.stringify(report.sections.p23, null, 1));
}

// ==========================================================================
// Point 3 bis : le DANGER réel — un .wal orphelin réassocié à la mauvaise base
// ==========================================================================
say('\n### Point 3 bis : .wal orphelin laissé par un écrivain tué');
{
  const killer = path.join(WORK, 'ecrivain.mjs');
  fs.writeFileSync(killer, [
    "import { DatabaseSync } from 'node:sqlite';",
    "const db = new DatabaseSync(process.argv[2]);",
    "db.exec('PRAGMA journal_mode = WAL');",
    "db.exec('PRAGMA wal_autocheckpoint = 0');",
    "const ins = db.prepare('INSERT INTO nodes VALUES (?,?,?,?,?,?)');",
    "db.exec('BEGIN');",
    "for (let i = 0; i < 20000; i++) ins.run(2000000 + i, 1, 'orphelin-' + i, 'file', i, i);",
    "db.exec('COMMIT');",
    "process.kill(process.pid, 'SIGKILL');",
  ].join('\n'));

  // Le MÊME scénario est joué contre la bascule naïve puis contre la durcie.
  const resultats = {};
  for (const [nom, fn] of [['mc-naive', migrateMC], ['mch-durcie', migrateMCHardened]]) {
    const t = path.join(WORK, `orphelin-${nom}.sqlite`);
    buildLegacyDb(t, { count: COUNT });

    // Un écrivain est tué brutalement alors que son WAL n'est pas checkpointé :
    // `-wal` et `-shm` restent sur le disque, rattachés à l'ANCIENNE base.
    const k = spawnSync(process.execPath, ['--no-warnings', killer, t], { encoding: 'utf8', timeout: 60000 });

    const apresTuerie = rawListing(t);
    const walOrphelinPresent = apresTuerie.some((f) => f.includes('-wal:') && !f.endsWith(':0'));

    // Un lecteur honnête rejoue le WAL : c'est l'état légitime de l'ancienne base.
    const avantBascule = inspect(t);

    const res = fn(t);
    const apresBascule = rawListing(t);
    const info = inspect(t);

    const walSurvivant = apresBascule.filter((f) => f.startsWith(path.basename(t) + '-wal:'));
    const integrite = info.integrity ?? null;

    resultats[nom] = {
      sortieEcrivain: k.status,
      apresTuerie,
      walOrphelinPresent,
      lignesAncienneApresRejeuWal: avantBascule.lignes,
      integrityAncienne: avantBascule.integrity,
      resultat: res,
      apresBascule,
      walDeLAncienneSurvivantALaPermutation: walSurvivant,
      classementFinal: classify(info),
      integrityFinale: typeof integrite === 'string' && integrite.length > 200
        ? integrite.slice(0, 200) + ' […tronqué]'
        : integrite,
      integriteOk: integrite === 'ok',
      lignesFinales: info.lignes ?? null,
      baseNeuveCorrompue: classify(info) === 'CORROMPUE' || integrite !== 'ok',
    };
    say(`${nom} : wal orphelin avant = ${walOrphelinPresent}, wal survivant = [${walSurvivant.join(', ')}], resultat = ${classify(info)}, integrity_ok = ${integrite === 'ok'}`);
  }
  report.sections.orphelinWal = resultats;
}

// ==========================================================================
// Point 4 : arrêt brutal à CHAQUE étape, une étape à la fois
// ==========================================================================
say('\n### Point 4 : arrêt brutal, une étape à la fois');
for (const [strategy, steps] of [['mc', MC_STEPS], ['mch', MCH_STEPS], ['mb', MB_STEPS]]) {
  const out = [];
  for (const step of steps) {
    const t = path.join(WORK, `crash-${strategy}-${step}.sqlite`);
    buildLegacyDb(t, { count: COUNT });
    const avant = rawListing(t);
    const r = spawnSync(process.execPath, ['--no-warnings', CHILD, t, strategy, step], {
      encoding: 'utf8', timeout: 120000,
    });
    const info = inspect(t);
    const cls = classify(info);
    // Le retour à l'ancienne base est-il encore possible après l'interruption ?
    const bak = bakOf(t);
    let retourPossible = null;
    if (fs.existsSync(bak)) {
      const probe = inspect(bak);
      retourPossible = probe.ouvrable && probe.integrity === 'ok';
    }
    out.push({
      etape: step,
      codeSortie: r.status,
      signal: r.signal,
      tueAvant: (r.stdout || '').includes('CRASH_AT=' + step),
      finNormale: (r.stdout || '').includes('FIN_NORMALE'),
      classement: cls,
      integrity: info.integrity ?? null,
      lignes: info.lignes ?? null,
      ouvrable: info.ouvrable ?? false,
      fichiersAvant: avant,
      fichiersApres: info.fichiers.map((f) => f.nom),
      copieDeSureteUtilisable: retourPossible,
      acceptable: cls === 'ANCIENNE-INTACTE' || cls === 'NOUVELLE-COMPLETE',
    });
    say(`${strategy} ${step} -> ${cls} (integrity=${info.integrity ?? 'n/a'}, sortie=${r.status}) fichiers=[${info.fichiers.map((f) => f.nom).join(', ')}]`);
  }
  report.sections['crash_' + strategy] = out;
}

// ==========================================================================
// Point 5 : espace disque insuffisant SIMULÉ par injection d'erreur
// ==========================================================================
say('\n### Point 5 : disque insuffisant simulé (PRAGMA max_page_count)');
{
  const resultats = {};
  for (const [nom, fn] of [['mc', migrateMC], ['mch', migrateMCHardened], ['mb', migrateMB]]) {
    const t = path.join(WORK, `plein-${nom}.sqlite`);
    buildLegacyDb(t, { count: COUNT });
    const avant = inspect(t);
    const res = fn(t, { maxPages: 64 }); // plafond très bas : SQLITE_FULL garanti
    const apres = inspect(t);
    resultats[nom] = {
      resultat: res,
      echecPropre: res.ok === false,
      messageErreur: res.reason ?? null,
      ancienneIntacteApres: classify(apres) === 'ANCIENNE-INTACTE',
      integrityApres: apres.integrity,
      lignesAvant: avant.lignes,
      lignesApres: apres.lignes,
      fichiersApres: apres.fichiers.map((f) => f.nom),
    };
    say(`${nom} -> echec=${res.ok === false} msg=${JSON.stringify(res.reason ?? null)} ancienne_intacte=${resultats[nom].ancienneIntacteApres} integrity=${apres.integrity}`);
  }
  report.sections.disquePlein = resultats;
}

// ==========================================================================
// Point 6 : retour à l'ancienne base après une bascule réussie
// ==========================================================================
say('\n### Point 6 : retour à l’ancienne base');
{
  const t = path.join(WORK, 'retour.sqlite');
  buildLegacyDb(t, { count: COUNT });
  const avantMigration = inspect(t);
  migrateMCHardened(t);
  const apresMigration = inspect(t);
  const r = rollbackToBackup(t);
  const apresRetour = inspect(t);
  report.sections.retour = {
    avantMigration: { classement: classify(avantMigration), lignes: avantMigration.lignes, integrity: avantMigration.integrity },
    apresMigration: { classement: classify(apresMigration), lignes: apresMigration.lignes, integrity: apresMigration.integrity },
    retour: r,
    apresRetour: { classement: classify(apresRetour), lignes: apresRetour.lignes, integrity: apresRetour.integrity, colonnes: apresRetour.colonnes },
    retourReussi: classify(apresRetour) === 'ANCIENNE-INTACTE' && apresRetour.integrity === 'ok'
      && apresRetour.lignes === avantMigration.lignes,
  };
  say(JSON.stringify(report.sections.retour, null, 1));
}

// ==========================================================================
// Point 7 : comparaison chronométrée M-C contre M-B, RUNS exécutions
// ==========================================================================
say(`\n### Point 7 : comparaison M-C / M-B, ${RUNS} exécutions`);
{
  const mesures = { mc: [], mch: [], mb: [] };
  const pics = { mc: [], mch: [], mb: [] };
  for (let i = 0; i < RUNS; i++) {
    for (const [nom, fn] of [['mc', migrateMC], ['mch', migrateMCHardened], ['mb', migrateMB]]) {
      const t = path.join(WORK, `chrono-${nom}.sqlite`);
      for (const f of [...sidecars(t), ...sidecars(tmpOf(t)), ...sidecars(bakOf(t))]) {
        if (fs.existsSync(f)) fs.rmSync(f, { force: true });
      }
      buildLegacyDb(t, { count: COUNT });
      const base = sizeOf(t);
      let pic = base;
      const parts = [t, tmpOf(t), bakOf(t)]
        .flatMap((p) => [p, p + '-wal', p + '-shm']);
      const observe = () => {
        const total = parts.reduce((a, p) => a + sizeOf(p), 0);
        if (total > pic) pic = total;
      };
      const t0 = process.hrtime.bigint();
      const res = fn(t, { observe });
      const t1 = process.hrtime.bigint();
      observe();
      if (!res.ok) throw new Error('migration chronométrée en échec : ' + res.reason);
      mesures[nom].push(Number(t1 - t0) / 1e6);
      pics[nom].push(pic - base); // espace TRANSITOIRE au-delà de la base initiale
    }
  }
  report.sections.chrono = Object.fromEntries(
    ['mc', 'mch', 'mb'].map((k) => [k, {
      ms: stat(mesures[k]),
      brut: mesures[k].map((x) => +x.toFixed(1)),
      transitoireOctets: stat(pics[k]),
    }]),
  );
  say(JSON.stringify(report.sections.chrono, null, 1));
}

fs.writeFileSync(path.join(WORK, 'rapport-b1.json'), JSON.stringify(report, null, 2));
say('\nRapport écrit : spikes/.work/b1/rapport-b1.json');
