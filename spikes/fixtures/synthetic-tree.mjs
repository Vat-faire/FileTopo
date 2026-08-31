// Générateur d'arborescences ENTIÈREMENT SYNTHÉTIQUES pour les bancs d'essai
// de TASK-0012.
//
// Aucune donnée réelle. Aucun accès au disque de l'utilisateur. Aucun nom, ni
// chemin, ni taille, ni date provenant d'un fichier existant. Tout est produit
// par un générateur pseudo-aléatoire à graine fixe, donc reproductible.

/** PRNG déterministe (mulberry32). Même graine, même arborescence. */
export function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), 1 | t);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEGMENTS = [
  'alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'hotel',
  'india', 'juliett', 'kilo', 'lima', 'mike', 'november', 'oscar', 'papa',
];
const EXTS = ['.txt', '.md', '.csv', '.json', '.dat', '.bin', '.log2'];

/**
 * Construit une arborescence synthétique plate en mémoire.
 *
 * @param {object} opts
 * @param {number} opts.count   nombre total de nœuds
 * @param {number} opts.seed    graine du générateur
 * @param {number} opts.branch  nombre d'enfants visé par dossier
 * @returns {Array<{id:number,parentId:number|null,name:string,kind:string,
 *                  size:number,mtime:number,depth:number}>}
 */
export function buildTree({ count, seed = 20260831, branch = 12 }) {
  const r = rng(seed);
  const nodes = [
    { id: 1, parentId: null, name: 'racine-synthetique', kind: 'dir', size: 0, mtime: 1700000000, depth: 0 },
  ];
  const dirs = [1];
  for (let id = 2; id <= count; id++) {
    const parentIdx = Math.floor(r() * dirs.length);
    const parentId = dirs[parentIdx];
    const parent = nodes[parentId - 1];
    const isDir = r() < 1 / branch;
    const seg = SEGMENTS[Math.floor(r() * SEGMENTS.length)];
    const name = isDir
      ? `${seg}-${id.toString(36)}`
      : `${seg}-${id.toString(36)}${EXTS[Math.floor(r() * EXTS.length)]}`;
    nodes.push({
      id,
      parentId,
      name,
      kind: isDir ? 'dir' : 'file',
      size: isDir ? 0 : Math.floor(r() * 4_000_000),
      mtime: 1_600_000_000 + Math.floor(r() * 100_000_000),
      depth: parent.depth + 1,
    });
    if (isDir) dirs.push(id);
  }
  return nodes;
}

/** Empreinte versionnée et déterministe d'un chemin relatif synthétique. */
export function pathHashV1(relPath) {
  // FNV-1a 64 bits, en BigInt, préfixé par sa version.
  let h = 0xcbf29ce484222325n;
  const P = 0x100000001b3n;
  const M = 0xffffffffffffffffn;
  for (const b of Buffer.from(relPath, 'utf8')) {
    h = ((h ^ BigInt(b)) * P) & M;
  }
  return 'v1:' + h.toString(16).padStart(16, '0');
}
