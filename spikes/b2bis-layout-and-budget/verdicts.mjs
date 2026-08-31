// B2 bis — Application LITTÉRALE des huit critères `F1` à `F8` de TASK-0013 §6
// aux mesures produites par `run-b2bis.mjs`. CODE JETABLE.
//
// Les énoncés sont recopiés en commentaire au-dessus de chaque calcul. Aucun
// seuil n'est ajusté ici : ce script applique, il ne négocie pas. Une cible
// manquée sort « RÉFUTÉE ».
//
// Usage : node verdicts.mjs [cle-moteur]   (défaut : edge)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const WORK = path.resolve(ICI, '../.work/b2bis');
const CLE = process.argv[2] || 'edge';
const R = JSON.parse(fs.readFileSync(path.join(WORK, 'rapport-b2bis-' + CLE + '.json'), 'utf8'));

const SEUIL_IPS = 30;        // §3.6 de BASELINE_TARGETS : ≥ 30 ips soutenues
const SEUIL_SEL_MS = 150;    // §3.6 : ≤ 150 ms au 95e centile

const tous = [...R.matrice, ...R.volumetrie];
const sc = (calepin, forme, cible) => tous.find((x) => x.scenario.calepin === calepin
  && x.scenario.forme === forme && x.scenario.cible === cible);
const bud = (calepin, forme) => (R.budget || []).find((x) => x.calepin === calepin && x.forme === forme);

const verdicts = [];
const ajoute = (id, enonce, ok, mesure, note) => {
  verdicts.push({ id, enonce, verdict: ok ? 'CONFIRMÉE' : 'RÉFUTÉE', mesure, note: note || null });
};

// ------------------------------------------------------------------- F1
// « Le calepin squarifié corrige l'effondrement de SYN-WIDE. »
// Confirmé si CAL-B tient ≥ 30 ips soutenues ET p95 de sélection ≤ 150 ms
// à 3 000 blocs visibles sur SYN-WIDE.
{
  const b = sc('CAL-B', 'SYN-WIDE', 3000);
  const a = sc('CAL-A', 'SYN-WIDE', 3000);
  const ips = b.pan.ipsMedian.med, ipsMin = b.pan.ipsMedian.min;
  const zoom = b.zoom.ipsMedian.med;
  const sel = b.selection.p95Ms.med, selMax = b.selection.p95Ms.max;
  const ok = ips >= SEUIL_IPS && sel <= SEUIL_SEL_MS;
  ajoute('F1', 'Le calepin squarifié corrige l\'effondrement de SYN-WIDE', ok, {
    calepin: 'CAL-B', forme: 'SYN-WIDE', blocsVisibles: b.info.blocsVisibles,
    noeudsDomConstruits: b.info.noeudsDom,
    ipsDeplacementMedian: ips, ipsDeplacementEcart: [b.pan.ipsMedian.min, b.pan.ipsMedian.max],
    ipsZoomMedian: zoom,
    selectionP95MsMedian: sel, selectionP95MsEcart: [b.selection.p95Ms.min, b.selection.p95Ms.max],
    referenceCalA: { ips: a.pan.ipsMedian.med, ipsZoom: a.zoom.ipsMedian.med,
                     selP95Ms: a.selection.p95Ms.med, blocs: a.info.blocsVisibles },
  }, 'Le seuil d\'images par seconde est appliqué au DÉPLACEMENT CONTINU, comme §3.6 de '
   + 'BASELINE_TARGETS. Le zoom est publié à côté. Pire exécution des cinq : ips '
   + ipsMin + ', sélection p95 ' + selMax + ' ms.');
}

// ------------------------------------------------------------------- F2
// « L'avantage du squarifié s'explique par la géométrie. »
// Confirmé si la médiane du rapport d'aspect de CAL-B est STRICTEMENT plus
// proche de 1 que celle de CAL-A sur SYN-WIDE, ET si l'écart d'images par
// seconde suit ce classement sur les trois formes.
{
  const formes = ['SYN-WIDE', 'SYN-DEEP', 'SYN-EQUILIBRE'];
  const lignes = formes.map((f) => {
    const a = sc('CAL-A', f, 3000), b = sc('CAL-B', f, 3000);
    const dA = Math.abs(a.aspects.median.med - 1), dB = Math.abs(b.aspects.median.med - 1);
    return {
      forme: f,
      aspectMedianCalA: a.aspects.median.med, aspectMedianCalB: b.aspects.median.med,
      aspectP99CalA: a.aspects.p99.med, aspectP99CalB: b.aspects.p99.med,
      ipsCalA: a.pan.ipsMedian.med, ipsCalB: b.pan.ipsMedian.med,
      blocsCalA: a.info.blocsVisibles, blocsCalB: b.info.blocsVisibles,
      meilleurAspect: dB < dA ? 'CAL-B' : (dA < dB ? 'CAL-A' : 'égalité'),
      meilleuresIps: b.pan.ipsMedian.med > a.pan.ipsMedian.med ? 'CAL-B'
        : (a.pan.ipsMedian.med > b.pan.ipsMedian.med ? 'CAL-A' : 'égalité'),
    };
  });
  const wide = lignes[0];
  const conditionWide = Math.abs(wide.aspectMedianCalB - 1) < Math.abs(wide.aspectMedianCalA - 1);
  const classementsCoincident = lignes.every((l) => l.meilleurAspect === l.meilleuresIps);
  ajoute('F2', 'L\'avantage du squarifié s\'explique par la géométrie',
    conditionWide && classementsCoincident,
    { cibleBlocs: 3000, lignes, medianeCalBPlusProcheDe1SurWide: conditionWide,
      classementsCoincidentSurLesTroisFormes: classementsCoincident });
}

// ------------------------------------------------------------------- F3
// « Le squarifié ne coûte rien ailleurs. »
// Confirmé si, sur SYN-DEEP et SYN-EQUILIBRE, CAL-B ne perd PAS PLUS DE 5 %
// d'images par seconde contre CAL-A à nombre de blocs égal.
{
  const lignes = [];
  for (const f of ['SYN-DEEP', 'SYN-EQUILIBRE']) {
    for (const cible of [1000, 3000, 5000]) {
      const a = sc('CAL-A', f, cible), b = sc('CAL-B', f, cible);
      const perte = (a.pan.ipsMedian.med - b.pan.ipsMedian.med) / a.pan.ipsMedian.med;
      lignes.push({
        forme: f, cibleBlocs: cible,
        blocsCalA: a.info.blocsVisibles, blocsCalB: b.info.blocsVisibles,
        ecartBlocsPourcent: +(100 * Math.abs(a.info.blocsVisibles - b.info.blocsVisibles)
          / a.info.blocsVisibles).toFixed(2),
        ipsCalA: a.pan.ipsMedian.med, ipsCalB: b.pan.ipsMedian.med,
        pertePourcent: +(100 * perte).toFixed(2),
        dansLaTolerance5: perte <= 0.05,
      });
    }
  }
  ajoute('F3', 'Le squarifié ne coûte rien ailleurs', lignes.every((l) => l.dansLaTolerance5),
    { toleranceMax: '5 % de perte', lignes });
}

// ------------------------------------------------------------------- F4
// « Le budget auto-régulé tient la cible. »
// Confirmé si, sur les QUATRE formes, après un changement brusque de vue, le
// budget converge en ≤ 2 s vers un état qui tient ≥ 30 ips, ET n'oscille pas :
// au plus DEUX inversions de sens sur 10 s en régime stable.
{
  const lignes = [];
  for (const calepin of ['CAL-A', 'CAL-B']) {
    for (const f of ['SYN-EQUILIBRE', 'SYN-DEEP', 'SYN-WIDE', 'SYN-100K']) {
      const g = bud(calepin, f);
      if (!g) continue;
      const conv = g.tDernierChangementMs.max <= 2000;
      const ips = g.ipsRegimeStable.min >= SEUIL_IPS;
      const osc = g.inversionsSurFenetre10s.max <= 2;
      lignes.push({
        calepin, forme: f,
        convergenceMsMedian: g.tDernierChangementMs.med,
        convergenceMsEcart: [g.tDernierChangementMs.min, g.tDernierChangementMs.max],
        convergenceSous2sSurLes5: conv,
        ipsRegimeStableMedian: g.ipsRegimeStable.med,
        ipsRegimeStableEcart: [g.ipsRegimeStable.min, g.ipsRegimeStable.max],
        ipsAuMoins30SurLes5: ips,
        inversions10sMax: g.inversionsSurFenetre10s.max, sansOscillation: osc,
        niveauFinalMedian: g.niveauFinal.med, blocsFinalMedian: g.blocsFinal.med,
        tientLesTroisConditions: conv && ips && osc,
      });
    }
  }
  ajoute('F4', 'Le budget auto-régulé tient la cible',
    lignes.length > 0 && lignes.every((l) => l.tientLesTroisConditions),
    { seuilConvergenceMs: 2000, seuilIps: SEUIL_IPS, inversionsMax: 2, lignes },
    'Les trois conditions sont exigées sur les CINQ exécutions, pas seulement sur la médiane.');
}

// ------------------------------------------------------------------- F5
// « Le budget reste lisible. »
// Confirmé si le plancher de lisibilité déclaré en §5.2.3 n'est JAMAIS
// franchi, sur aucune forme, y compris quand la cible d'images par seconde
// n'est pas atteinte.
{
  const groupes = [...(R.budget || []).map((g) => ({ ...g, phase: 'C — cible 30 ips' })),
                   ...(R.plancher || []).map((g) => ({ ...g, phase: 'D — cible 240 ips, inatteignable' }))];
  const lignes = groupes.map((g) => ({
    phase: g.phase, calepin: g.calepin, forme: g.forme,
    plancherLisibilite: g.plancherLisibilite,
    seuilMaxObserveMedian: g.seuilMaxObserve.med, seuilMaxObserveMax: g.seuilMaxObserve.max,
    plancherFranchi: g.plancherFranchiUneFois,
    plancherAtteintEtTenu: g.plancherAtteintSansCible,
    ipsRegimeStableMedian: g.ipsRegimeStable.med,
    blocsFinalMedian: g.blocsFinal.med,
  }));
  const jamaisFranchi = lignes.every((l) => !l.plancherFranchi);
  const exerce = lignes.some((l) => l.plancherAtteintEtTenu);
  ajoute('F5', 'Le budget reste lisible', jamaisFranchi,
    { plancherDeclarePx2: groupes.length ? groupes[0].plancherLisibilite : null,
      jamaisFranchi, plancherReellementAtteintAuMoinsUneFois: exerce, lignes },
    exerce
      ? 'Le plancher a été RÉELLEMENT atteint sous contrainte (phase D) et le budget a refusé '
        + 'd\'agréger davantage malgré une cible d\'images par seconde non atteinte.'
      : 'ATTENTION : le plancher n\'a jamais été atteint; le critère est confirmé, mais faiblement exercé.');
}

// ------------------------------------------------------------------- F6
// « SYN-100K tient le protocole de DEC-0008. »
// Confirmé si, sur SYN-100K, avec budget ACTIF et CAL-B, les DEUX seuils de
// §3.6 sont tenus, et si le nombre de blocs simultanément visibles est RELEVÉ.
{
  const g = bud('CAL-B', 'SYN-100K');
  const ips = g ? g.apresConvergenceIpsPan.min >= SEUIL_IPS : false;
  const sel = g ? g.apresConvergenceSelP95Ms.max <= SEUIL_SEL_MS : false;
  const gA = bud('CAL-A', 'SYN-100K');
  ajoute('F6', 'SYN-100K tient le protocole de DEC-0008', !!(g && ips && sel), {
    forme: 'SYN-100K', noeudsIndexes: 100000, calepin: 'CAL-B', budget: 'actif',
    seuilsExiges: { ipsDeplacement: '≥ ' + SEUIL_IPS, selectionP95Ms: '≤ ' + SEUIL_SEL_MS },
    ipsApresConvergenceMedian: g ? g.apresConvergenceIpsPan.med : null,
    ipsApresConvergenceEcart: g ? [g.apresConvergenceIpsPan.min, g.apresConvergenceIpsPan.max] : null,
    selectionP95MsMedian: g ? g.apresConvergenceSelP95Ms.med : null,
    selectionP95MsEcart: g ? [g.apresConvergenceSelP95Ms.min, g.apresConvergenceSelP95Ms.max] : null,
    blocsSimultanementVisiblesMedian: g ? g.apresConvergenceBlocs.med : null,
    blocsSimultanementVisiblesEcart: g ? [g.apresConvergenceBlocs.min, g.apresConvergenceBlocs.max] : null,
    noeudsDomConstruitsMedian: g ? g.apresConvergenceDom.med : null,
    seuilAireRetenuMedian: g ? g.seuilMaxObserve.med : null,
    referenceCalA: gA ? { ips: gA.apresConvergenceIpsPan.med, selP95Ms: gA.apresConvergenceSelP95Ms.med,
                          blocs: gA.apresConvergenceBlocs.med } : null,
  }, 'Le nombre de blocs est COMPTÉ dans la page, pas supposé. Les deux seuils sont exigés '
   + 'sur les cinq exécutions.');
}

// ------------------------------------------------------------------- F7
// « L'accessibilité ne régresse pas. »
// Confirmé si ZÉRO attribut ARIA manquant et navigation clavier conforme sur
// TOUS les scénarios, les DEUX calepins, budget actif.
{
  const scenarios = tous.map((x) => ({
    origine: 'matrice/volumétrie', calepin: x.scenario.calepin, forme: x.scenario.forme,
    cible: x.scenario.cible, nbTreeitem: x.aria.nbTreeitem,
    ariaConforme: x.aria.conforme,
    attributsManquants: Object.values(x.aria.attributsManquants).reduce((a, b) => a + b, 0),
    sansAriaExpanded: x.aria.sansAriaExpanded,
    clavierConforme: x.clavier.toutesLesTouchesConformes && x.clavier.focusDomSuit,
  }));
  const budgets = (R.budget || []).map((g) => ({
    origine: 'budget actif', calepin: g.calepin, forme: g.forme, cible: 'budget',
    nbTreeitem: g.blocsFinal.med,
    ariaConforme: g.ariaConformeToutes, attributsManquants: 0, sansAriaExpanded: 0,
    clavierConforme: g.clavierConformeToutes,
  }));
  const l = [...scenarios, ...budgets];
  const ok = l.every((x) => x.ariaConforme && x.clavierConforme);
  ajoute('F7', 'L\'accessibilité ne régresse pas', ok, {
    scenariosControles: l.length,
    scenariosAriaConformes: l.filter((x) => x.ariaConforme).length,
    scenariosClavierConformes: l.filter((x) => x.clavierConforme).length,
    regressions: l.filter((x) => !x.ariaConforme || !x.clavierConforme),
    lignes: l,
  }, 'La conformité porte sur les ATTRIBUTS PRODUITS et sur `document.activeElement`. '
   + 'Aucun lecteur d\'écran réel n\'a été essayé.');
}

// ------------------------------------------------------------------- F8
// « Le moteur de référence est WebView2. »
// Confirmé si les mesures publiées sont relevées DANS WebView2.
{
  const p = path.join(WORK, 'webview2-tentatives.json');
  const w = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null;
  const dansWebView2 = R.moteurCle === 'webview2';
  ajoute('F8', 'Le moteur de référence est WebView2', dansWebView2, {
    moteurReellementEmploye: R.moteurNom + ' ' + (R.versionCdp?.product || ''),
    cleMoteur: R.moteurCle,
    userAgent: R.environnement?.ua,
    webview2Installe: w ? w.executable : null,
    tentatives: w ? w.tentatives.map((t) => ({ nom: t.nom, codeSortie: t.codeSortie,
      msAvantSortie: t.msAvantSortie, pointAccesAnnonce: t.pointAccesAnnonce,
      cdpJoint: t.cdpJoint })) : null,
    conclusionTentatives: w ? w.conclusion : null,
  }, 'RÉFUTÉE signifie ici : l\'instrumentation directe est impossible dans le périmètre. '
   + '§5.4 de TASK-0013 s\'applique intégralement — substitut déclaré, écart NON MESURÉ.');
}

// ------------------------------------------------------------------- sortie
const dest = path.join(WORK, 'verdicts-' + CLE + '.json');
fs.writeFileSync(dest, JSON.stringify({ moteur: R.moteurNom, cle: R.moteurCle,
  version: R.versionCdp?.product, executions: R.executions, verdicts }, null, 1));

console.log('MOTEUR RÉELLEMENT EMPLOYÉ : ' + R.moteurNom + ' — ' + (R.versionCdp?.product || '?')
  + '  (' + R.executions + ' exécutions par mesure)\n');
for (const v of verdicts) {
  console.log(v.id + ' — ' + v.verdict + ' — ' + v.enonce);
}
console.log('\nDétail : ' + path.relative(path.resolve(ICI, '../..'), dest).split(path.sep).join('/'));
