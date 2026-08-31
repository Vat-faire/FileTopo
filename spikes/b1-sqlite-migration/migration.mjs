// B1 — Noyau de migration SQLite pour banc d'essai. CODE JETABLE.
//
// Ce fichier n'est PAS du code de production et ne doit jamais être importé
// par FileTopo. Il existe pour observer, sur Windows, le comportement réel des
// deux stratégies de migration de DEC-0011 :
//
//   M-C : construire une base neuve à côté, puis permuter.
//   M-B : copie de sûreté, migration en place, restauration si échec.
//
// Dépendances : AUCUNE. Le module `node:sqlite` est intégré à Node 24.

import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { buildTree, pathHashV1 } from '../fixtures/synthetic-tree.mjs';

/** Points d'interruption énumérés AVANT l'essai, comme l'exige §8.1.4. */
export const MC_STEPS = [
  'S1-ancienne-ouverte',
  'S2-nouvelle-a-moitie-ecrite',
  'S3-nouvelle-ecrite-non-fermee',
  'S4-nouvelle-fermee-et-checkpointee',
  'S5-copie-de-surete-faite',
  'S6-permutation-faite',
  'S7-nettoyage-fait',
];

/**
 * Étapes de la variante DURCIE de M-C.
 *
 * Elle ajoute `S0` : l'ancienne base est checkpointée et refermée proprement
 * AVANT toute lecture, ce qui fait disparaître `-wal` et `-shm` du disque; et
 * `S5b` : tout fichier annexe résiduel du chemin cible est supprimé juste
 * avant la permutation. Sans ces deux étapes, un `-wal` de l'ANCIENNE base
 * survit à la permutation et se retrouve rattaché à la NOUVELLE.
 */
export const MCH_STEPS = [
  'S0-ancienne-checkpointee',
  'S1-ancienne-ouverte',
  'S2-nouvelle-a-moitie-ecrite',
  'S3-nouvelle-ecrite-non-fermee',
  'S4-nouvelle-fermee-et-checkpointee',
  'S5-copie-de-surete-faite',
  'S5b-annexes-cibles-supprimees',
  'S6-permutation-faite',
  'S7-nettoyage-fait',
];

export const MB_STEPS = [
  'T1-copie-de-surete-faite',
  'T2-migration-a-moitie',
  'T3-transaction-validee',
  'T4-base-fermee',
];

/** Interruption BRUTALE du processus : aucun `finally`, aucune fermeture. */
function crashNow(step) {
  process.stdout.write('CRASH_AT=' + step + '\n');
  process.kill(process.pid, 'SIGKILL');
}

// `observe` est appelé À CHAQUE frontière d'étape. Les migrations étant
// entièrement synchrones, elles bloquent la boucle d'événements : un
// échantillonnage par minuterie ne se déclencherait jamais. La mesure d'espace
// disque transitoire se prend donc ici, aux frontières d'étapes.
const mark = (state, step) => {
  if (state.observe) state.observe(step);
  if (state.crashAt === step) crashNow(step);
};

// --------------------------------------------------------------------------
// Chemins dérivés
// --------------------------------------------------------------------------

export const sidecars = (p) => [p, p + '-wal', p + '-shm'];
export const tmpOf = (p) => p + '.migrating';
export const bakOf = (p) => p + '.bak';

// --------------------------------------------------------------------------
// Construction de la base héritée (schéma v1)
// --------------------------------------------------------------------------

export function buildLegacyDb(target, { count, seed = 20260831 }) {
  for (const f of [...sidecars(target), ...sidecars(tmpOf(target)), ...sidecars(bakOf(target))]) {
    if (fs.existsSync(f)) fs.rmSync(f, { force: true });
  }
  const nodes = buildTree({ count, seed });
  const db = new DatabaseSync(target);
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('CREATE TABLE nodes (id INTEGER PRIMARY KEY, parent_id INTEGER, name TEXT NOT NULL, kind TEXT NOT NULL, size INTEGER NOT NULL, mtime INTEGER NOT NULL)');
  db.exec('CREATE INDEX idx_nodes_parent ON nodes(parent_id)');
  const ins = db.prepare('INSERT INTO nodes VALUES (?,?,?,?,?,?)');
  db.exec('BEGIN');
  for (const n of nodes) ins.run(n.id, n.parentId, n.name, n.kind, n.size, n.mtime);
  db.exec('COMMIT');
  db.exec('PRAGMA user_version = 1');
  db.exec('PRAGMA wal_checkpoint(TRUNCATE)');
  db.close();
  return nodes.length;
}

const SCHEMA_V2 = [
  'CREATE TABLE nodes (',
  '  id INTEGER PRIMARY KEY, parent_id INTEGER, name TEXT NOT NULL,',
  '  kind TEXT NOT NULL, size INTEGER NOT NULL, mtime INTEGER NOT NULL,',
  '  depth INTEGER NOT NULL, path_hash TEXT NOT NULL);',
  'CREATE INDEX idx_nodes_parent ON nodes(parent_id);',
  'CREATE INDEX idx_nodes_hash ON nodes(path_hash);',
  'CREATE TABLE node_stats (node_id INTEGER PRIMARY KEY, descendants INTEGER NOT NULL);',
].join('\n');

// --------------------------------------------------------------------------
// M-C — construire à côté, puis permuter
// --------------------------------------------------------------------------

export function migrateMC(target, opts = {}) {
  const state = { crashAt: opts.crashAt ?? null, observe: opts.observe ?? null };
  const tmp = tmpOf(target);
  const bak = bakOf(target);
  const maxPages = opts.maxPages ?? null; // simulation « disque plein »

  for (const f of sidecars(tmp)) if (fs.existsSync(f)) fs.rmSync(f, { force: true });

  const src = new DatabaseSync(target, { readOnly: true });
  mark(state, 'S1-ancienne-ouverte');

  const rows = src.prepare('SELECT id,parent_id,name,kind,size,mtime FROM nodes ORDER BY id').all();

  const dst = new DatabaseSync(tmp);
  dst.exec('PRAGMA journal_mode = WAL');
  if (maxPages !== null) dst.exec('PRAGMA max_page_count = ' + maxPages);
  dst.exec(SCHEMA_V2);
  const ins = dst.prepare('INSERT INTO nodes VALUES (?,?,?,?,?,?,?,?)');

  const byId = new Map(rows.map((r) => [r.id, r]));
  const derive = (r) => {
    const parts = [];
    let cur = r;
    let d = 0;
    while (cur) {
      parts.unshift(cur.name);
      if (cur.parent_id == null) break;
      cur = byId.get(cur.parent_id);
      d++;
    }
    return { depth: d, hash: pathHashV1(parts.join('/')) };
  };

  let insertError = null;
  try {
    dst.exec('BEGIN');
    const half = Math.floor(rows.length / 2);
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const d = derive(r);
      ins.run(r.id, r.parent_id, r.name, r.kind, r.size, r.mtime, d.depth, d.hash);
      if (i === half) mark(state, 'S2-nouvelle-a-moitie-ecrite');
    }
    dst.exec('COMMIT');
    dst.exec('PRAGMA user_version = 2');
  } catch (e) {
    insertError = e;
    try { dst.exec('ROLLBACK'); } catch { /* la transaction est déjà défaite */ }
  }

  if (insertError) {
    // Échec propre : la nouvelle base est abandonnée, l'ancienne n'a pas été
    // touchée une seule fois. Aucune permutation n'a lieu.
    try { dst.close(); } catch { /* base déjà invalide */ }
    src.close();
    for (const f of sidecars(tmp)) if (fs.existsSync(f)) fs.rmSync(f, { force: true });
    return { ok: false, reason: insertError.message, code: insertError.code ?? null };
  }

  mark(state, 'S3-nouvelle-ecrite-non-fermee');

  dst.exec('PRAGMA wal_checkpoint(TRUNCATE)');
  dst.close();
  src.close();
  mark(state, 'S4-nouvelle-fermee-et-checkpointee');

  // Copie de sûreté AVANT la permutation, pour rendre le retour possible.
  fs.copyFileSync(target, bak);
  mark(state, 'S5-copie-de-surete-faite');

  // La permutation. Sur Windows, `fs.renameSync` sur un chemin existant passe
  // par MoveFileExW + MOVEFILE_REPLACE_EXISTING, sur le même volume.
  fs.renameSync(tmp, target);
  mark(state, 'S6-permutation-faite');

  for (const f of [tmp + '-wal', tmp + '-shm']) if (fs.existsSync(f)) fs.rmSync(f, { force: true });
  mark(state, 'S7-nettoyage-fait');

  return { ok: true };
}

// --------------------------------------------------------------------------
// M-C DURCIE — même bascule, mais les fichiers annexes sont maîtrisés
// --------------------------------------------------------------------------
//
// Deux différences, et deux seulement, avec `migrateMC` :
//
//   S0  — l'ancienne base est checkpointée puis refermée proprement. SQLite
//         replie le contenu du `-wal` dans le fichier principal et supprime
//         `-wal` et `-shm`. La copie de sûreté prise plus tard est donc
//         complète, et le chemin cible n'a plus d'annexe.
//   S5b — tout fichier annexe résiduel du chemin cible est supprimé juste
//         avant la permutation, après la copie de sûreté.
//
// L'ordre compte : supprimer le `-wal` AVANT le checkpoint perdrait les
// transactions qu'il contient.

export function migrateMCHardened(target, opts = {}) {
  const state = { crashAt: opts.crashAt ?? null, observe: opts.observe ?? null };
  const tmp = tmpOf(target);
  const bak = bakOf(target);
  const maxPages = opts.maxPages ?? null;

  for (const f of sidecars(tmp)) if (fs.existsSync(f)) fs.rmSync(f, { force: true });

  // S0 : replier le WAL de l'ancienne base, puis la refermer proprement.
  {
    const fold = new DatabaseSync(target);
    fold.exec('PRAGMA journal_mode = WAL');
    fold.exec('PRAGMA wal_checkpoint(TRUNCATE)');
    fold.close();
  }
  mark(state, 'S0-ancienne-checkpointee');

  const src = new DatabaseSync(target, { readOnly: true });
  mark(state, 'S1-ancienne-ouverte');

  const rows = src.prepare('SELECT id,parent_id,name,kind,size,mtime FROM nodes ORDER BY id').all();

  const dst = new DatabaseSync(tmp);
  dst.exec('PRAGMA journal_mode = WAL');
  if (maxPages !== null) dst.exec('PRAGMA max_page_count = ' + maxPages);
  dst.exec(SCHEMA_V2);
  const ins = dst.prepare('INSERT INTO nodes VALUES (?,?,?,?,?,?,?,?)');

  const byId = new Map(rows.map((r) => [r.id, r]));
  const derive = (r) => {
    const parts = [];
    let cur = r;
    let d = 0;
    while (cur) {
      parts.unshift(cur.name);
      if (cur.parent_id == null) break;
      cur = byId.get(cur.parent_id);
      d++;
    }
    return { depth: d, hash: pathHashV1(parts.join('/')) };
  };

  let insertError = null;
  try {
    dst.exec('BEGIN');
    const half = Math.floor(rows.length / 2);
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const d = derive(r);
      ins.run(r.id, r.parent_id, r.name, r.kind, r.size, r.mtime, d.depth, d.hash);
      if (i === half) mark(state, 'S2-nouvelle-a-moitie-ecrite');
    }
    dst.exec('COMMIT');
    dst.exec('PRAGMA user_version = 2');
  } catch (e) {
    insertError = e;
    try { dst.exec('ROLLBACK'); } catch { /* déjà défaite */ }
  }

  if (insertError) {
    try { dst.close(); } catch { /* base déjà invalide */ }
    src.close();
    for (const f of sidecars(tmp)) if (fs.existsSync(f)) fs.rmSync(f, { force: true });
    return { ok: false, reason: insertError.message, code: insertError.code ?? null };
  }

  mark(state, 'S3-nouvelle-ecrite-non-fermee');

  dst.exec('PRAGMA wal_checkpoint(TRUNCATE)');
  dst.close();
  src.close();
  mark(state, 'S4-nouvelle-fermee-et-checkpointee');

  fs.copyFileSync(target, bak);
  mark(state, 'S5-copie-de-surete-faite');

  // S5b : aucune annexe de l'ancienne base ne doit survivre à la permutation.
  for (const f of [target + '-wal', target + '-shm']) {
    if (fs.existsSync(f)) fs.rmSync(f, { force: true });
  }
  mark(state, 'S5b-annexes-cibles-supprimees');

  fs.renameSync(tmp, target);
  mark(state, 'S6-permutation-faite');

  for (const f of [tmp + '-wal', tmp + '-shm']) if (fs.existsSync(f)) fs.rmSync(f, { force: true });
  mark(state, 'S7-nettoyage-fait');

  return { ok: true };
}

// --------------------------------------------------------------------------
// M-B — copie de sûreté, migration EN PLACE, restauration si échec
// --------------------------------------------------------------------------

export function migrateMB(target, opts = {}) {
  const state = { crashAt: opts.crashAt ?? null, observe: opts.observe ?? null };
  const bak = bakOf(target);
  const maxPages = opts.maxPages ?? null;

  for (const f of sidecars(bak)) if (fs.existsSync(f)) fs.rmSync(f, { force: true });
  fs.copyFileSync(target, bak);
  for (const ext of ['-wal', '-shm']) {
    if (fs.existsSync(target + ext)) fs.copyFileSync(target + ext, bak + ext);
  }
  mark(state, 'T1-copie-de-surete-faite');

  const db = new DatabaseSync(target);
  db.exec('PRAGMA journal_mode = WAL');
  if (maxPages !== null) db.exec('PRAGMA max_page_count = ' + maxPages);

  let err = null;
  try {
    db.exec('BEGIN');
    db.exec('ALTER TABLE nodes ADD COLUMN depth INTEGER NOT NULL DEFAULT -1');
    db.exec('ALTER TABLE nodes ADD COLUMN path_hash TEXT NOT NULL DEFAULT ""');
    db.exec('CREATE TABLE node_stats (node_id INTEGER PRIMARY KEY, descendants INTEGER NOT NULL)');

    const rows = db.prepare('SELECT id,parent_id,name FROM nodes ORDER BY id').all();
    const byId = new Map(rows.map((r) => [r.id, r]));
    const upd = db.prepare('UPDATE nodes SET depth = ?, path_hash = ? WHERE id = ?');
    const half = Math.floor(rows.length / 2);
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const parts = [];
      let cur = r;
      let d = 0;
      while (cur) {
        parts.unshift(cur.name);
        if (cur.parent_id == null) break;
        cur = byId.get(cur.parent_id);
        d++;
      }
      upd.run(d, pathHashV1(parts.join('/')), r.id);
      if (i === half) mark(state, 'T2-migration-a-moitie');
    }
    db.exec('CREATE INDEX idx_nodes_hash ON nodes(path_hash)');
    db.exec('COMMIT');
    db.exec('PRAGMA user_version = 2');
    mark(state, 'T3-transaction-validee');
  } catch (e) {
    err = e;
    try { db.exec('ROLLBACK'); } catch { /* déjà défaite */ }
  }

  try { db.exec('PRAGMA wal_checkpoint(TRUNCATE)'); } catch { /* base en erreur */ }
  db.close();
  mark(state, 'T4-base-fermee');

  if (err) {
    // Restauration explicite depuis la copie de sûreté.
    for (const f of [target + '-wal', target + '-shm']) if (fs.existsSync(f)) fs.rmSync(f, { force: true });
    fs.copyFileSync(bak, target);
    return { ok: false, reason: err.message, code: err.code ?? null, restored: true };
  }
  return { ok: true };
}

// --------------------------------------------------------------------------
// Retour à l'ancienne base après une bascule M-C
// --------------------------------------------------------------------------

export function rollbackToBackup(target) {
  const bak = bakOf(target);
  if (!fs.existsSync(bak)) return { ok: false, reason: 'aucune copie de sûreté' };
  for (const f of [target + '-wal', target + '-shm']) if (fs.existsSync(f)) fs.rmSync(f, { force: true });
  fs.copyFileSync(bak, target);
  return { ok: true };
}

// --------------------------------------------------------------------------
// Inspection : que vaut le chemin cible, après coup ?
// --------------------------------------------------------------------------

export function inspect(target) {
  const dir = path.dirname(target);
  const base = path.basename(target);
  const files = fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((f) => f.startsWith(base))
        .map((f) => ({ nom: f, octets: fs.statSync(path.join(dir, f)).size }))
        .sort((a, b) => a.nom.localeCompare(b.nom))
    : [];
  const out = { existe: fs.existsSync(target), fichiers: files };
  if (!out.existe) return out;
  try {
    const db = new DatabaseSync(target, { readOnly: true });
    out.user_version = db.prepare('PRAGMA user_version').get().user_version;
    out.integrity = db.prepare('PRAGMA integrity_check').get().integrity_check;
    out.colonnes = db.prepare('PRAGMA table_info(nodes)').all().map((c) => c.name);
    out.lignes = db.prepare('SELECT COUNT(*) n FROM nodes').get().n;
    out.ouvrable = true;
    db.close();
  } catch (e) {
    out.ouvrable = false;
    out.erreur = e.message;
  }
  return out;
}

/** Le schéma vu est-il purement v1, purement v2, ou un mélange ? */
export function classify(info) {
  if (!info.existe) return 'ABSENTE';
  if (!info.ouvrable) return 'CORROMPUE';
  const c = new Set(info.colonnes ?? []);
  const v2 = c.has('depth') && c.has('path_hash');
  if (info.user_version === 1 && !v2) return 'ANCIENNE-INTACTE';
  if (info.user_version === 2 && v2) return 'NOUVELLE-COMPLETE';
  return 'MELANGE';
}
