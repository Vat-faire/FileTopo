// B1 — Processus enfant sacrifiable. CODE JETABLE.
//
// Exécute UNE migration et se fait tuer brutalement au point d'interruption
// demandé. Le parent inspecte ensuite le disque. L'enfant ne nettoie rien :
// c'est tout l'intérêt.
//
// Usage : node crash-child.mjs <cible> <mc|mch|mb> <etape-ou-"aucune">

import { migrateMC, migrateMCHardened, migrateMB } from './migration.mjs';

const [target, strategy, crashAt] = process.argv.slice(2);
const step = crashAt === 'aucune' ? null : crashAt;

const run = { mc: migrateMC, mch: migrateMCHardened, mb: migrateMB }[strategy];
const res = run(target, { crashAt: step });

process.stdout.write('FIN_NORMALE=' + JSON.stringify(res) + '\n');
