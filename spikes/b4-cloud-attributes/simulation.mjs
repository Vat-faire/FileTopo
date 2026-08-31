// B4 — Simulation des attributs infonuagiques Windows. CODE JETABLE.
//
// AVERTISSEMENT, à lire avant tout chiffre produit par ce fichier.
//
// Ceci est une SIMULATION. Les vecteurs d'attributs ci-dessous sont FABRIQUÉS
// à la main à partir des constantes officielles Microsoft citées dans
// docs/research/TASK-0012-risk-gate-results.md §5. Ils ne proviennent
// d'AUCUN fichier réel.
//
// Ce programme :
//   - n'ouvre aucun fichier;
//   - ne lit aucun contenu;
//   - n'énumère aucun dossier;
//   - ne touche à AUCUN espace réservé d'un fournisseur de synchronisation.
//
// Il ne prouve donc pas le comportement de Windows. Il vérifie seulement que
// la RÈGLE DE DÉCISION que FileTopo appliquerait est cohérente avec la
// documentation officielle, sur des cas construits.

// --------------------------------------------------------------------------
// Constantes officielles (valeurs exactes de la page « File Attribute
// Constants », consultée le 2026-08-31).
// --------------------------------------------------------------------------
export const ATTR = {
  FILE_ATTRIBUTE_DIRECTORY:               0x00000010,
  FILE_ATTRIBUTE_SPARSE_FILE:             0x00000200,
  FILE_ATTRIBUTE_REPARSE_POINT:           0x00000400,
  FILE_ATTRIBUTE_OFFLINE:                 0x00001000,
  FILE_ATTRIBUTE_PINNED:                  0x00080000,
  FILE_ATTRIBUTE_UNPINNED:                0x00100000,
  // ATTENTION : Microsoft documente FILE_ATTRIBUTE_RECALL_ON_OPEN et
  // FILE_ATTRIBUTE_EA à la MÊME valeur, 262144 (0x00040000), sur la même page.
  // Ce bit est donc AMBIGU hors contexte : il ne se lit comme « recall on
  // open » que dans les classes d'énumération de répertoire.
  FILE_ATTRIBUTE_RECALL_ON_OPEN:          0x00040000,
  FILE_ATTRIBUTE_EA:                      0x00040000,
  FILE_ATTRIBUTE_RECALL_ON_DATA_ACCESS:   0x00400000,
};

// Étiquettes de point d'analyse d'un fournisseur infonuagique. Les valeurs
// exactes ne sont pas nécessaires à la règle : seule compte la présence d'une
// étiquette reconnue comme « nuage ».
export const TAG = { IO_REPARSE_TAG_CLOUD: 0x9000001A, AUCUN: 0 };

/**
 * Classe un élément à partir de ses seuls attributs et de son étiquette.
 *
 * `contexteEnumeration` dit si les attributs proviennent d'une énumération de
 * répertoire (`FindFirstFile` / `FindNextFile`). C'est le SEUL contexte où le
 * bit 0x00040000 doit être lu comme `RECALL_ON_OPEN`.
 */
export function classe(attrs, tag, contexteEnumeration) {
  const a = (b) => (attrs & b) === b;

  const estDossier = a(ATTR.FILE_ATTRIBUTE_DIRECTORY);
  const recallDonnees = a(ATTR.FILE_ATTRIBUTE_RECALL_ON_DATA_ACCESS);
  const recallOuverture = contexteEnumeration && a(ATTR.FILE_ATTRIBUTE_RECALL_ON_OPEN);
  const horsLigne = a(ATTR.FILE_ATTRIBUTE_OFFLINE);
  const pointAnalyse = a(ATTR.FILE_ATTRIBUTE_REPARSE_POINT);

  // Un accès aux DONNÉES risque une hydratation dès que l'un des deux bits de
  // rappel est posé, ou que l'élément est marqué hors ligne.
  const hydratationRisquee = recallDonnees || recallOuverture || horsLigne;

  let etat;
  if (recallDonnees || recallOuverture) etat = 'PAS-ENTIEREMENT-LOCAL';
  else if (horsLigne) etat = 'STOCKAGE-HORS-LIGNE';
  else etat = 'PRESENT-LOCALEMENT';

  return {
    estDossier,
    etat,
    bits: {
      RECALL_ON_DATA_ACCESS: recallDonnees,
      RECALL_ON_OPEN_lisible: recallOuverture,
      OFFLINE: horsLigne,
      REPARSE_POINT: pointAnalyse,
      etiquetteNuage: tag === TAG.IO_REPARSE_TAG_CLOUD,
    },
    // --- LA RÈGLE FileTopo -------------------------------------------------
    // Les métadonnées sont TOUJOURS sûres : elles proviennent de
    // l'énumération ou d'une ouverture en accès nul.
    lectureMetadonneesAutorisee: true,
    // Le contenu n'est JAMAIS lu par FileTopo. La règle ne dépend même pas des
    // bits : elle est inconditionnelle. Les bits ne servent qu'à AFFICHER
    // l'état à l'utilisateur.
    lectureContenuAutorisee: false,
    hydratationRisqueeSiOnLisaitLeContenu: hydratationRisquee,
  };
}

// --------------------------------------------------------------------------
// Fixture entièrement fabriquée. Aucun de ces éléments n'existe sur le disque.
// --------------------------------------------------------------------------
const A = ATTR;
export const FIXTURE = [
  { nom: 'fichier-ordinaire-local',        attrs: 0x00000020, tag: TAG.AUCUN, attendu: 'PRESENT-LOCALEMENT' },
  { nom: 'dossier-ordinaire-local',        attrs: A.FILE_ATTRIBUTE_DIRECTORY, tag: TAG.AUCUN, attendu: 'PRESENT-LOCALEMENT' },
  { nom: 'espace-reserve-integral',        attrs: 0x20 | A.FILE_ATTRIBUTE_REPARSE_POINT | A.FILE_ATTRIBUTE_RECALL_ON_DATA_ACCESS | A.FILE_ATTRIBUTE_OFFLINE, tag: TAG.IO_REPARSE_TAG_CLOUD, attendu: 'PAS-ENTIEREMENT-LOCAL' },
  { nom: 'espace-reserve-partiel',         attrs: 0x20 | A.FILE_ATTRIBUTE_SPARSE_FILE | A.FILE_ATTRIBUTE_RECALL_ON_DATA_ACCESS, tag: TAG.IO_REPARSE_TAG_CLOUD, attendu: 'PAS-ENTIEREMENT-LOCAL' },
  { nom: 'fichier-nuage-hydrate-epingle',  attrs: 0x20 | A.FILE_ATTRIBUTE_PINNED, tag: TAG.IO_REPARSE_TAG_CLOUD, attendu: 'PRESENT-LOCALEMENT' },
  { nom: 'fichier-nuage-desepingle',       attrs: 0x20 | A.FILE_ATTRIBUTE_UNPINNED | A.FILE_ATTRIBUTE_RECALL_ON_DATA_ACCESS, tag: TAG.IO_REPARSE_TAG_CLOUD, attendu: 'PAS-ENTIEREMENT-LOCAL' },
  { nom: 'archive-hors-ligne-hsm',         attrs: 0x20 | A.FILE_ATTRIBUTE_OFFLINE, tag: TAG.AUCUN, attendu: 'STOCKAGE-HORS-LIGNE' },
  { nom: 'dossier-virtualise',             attrs: A.FILE_ATTRIBUTE_DIRECTORY | A.FILE_ATTRIBUTE_RECALL_ON_DATA_ACCESS, tag: TAG.IO_REPARSE_TAG_CLOUD, attendu: 'PAS-ENTIEREMENT-LOCAL' },
  // Le cas AMBIGU : bit 0x00040000 posé, hors contexte d'énumération. Il doit
  // alors être lu comme FILE_ATTRIBUTE_EA, PAS comme RECALL_ON_OPEN.
  { nom: 'ambigu-0x40000-hors-enumeration', attrs: 0x20 | 0x00040000, tag: TAG.AUCUN, enumeration: false, attendu: 'PRESENT-LOCALEMENT' },
  { nom: 'ambigu-0x40000-en-enumeration',   attrs: 0x20 | 0x00040000, tag: TAG.AUCUN, enumeration: true,  attendu: 'PAS-ENTIEREMENT-LOCAL' },
];

if (import.meta.url === ('file:///' + process.argv[1].replace(/\\/g, '/'))) {
  const lignes = [];
  let ok = 0;
  for (const f of FIXTURE) {
    const enumr = f.enumeration !== undefined ? f.enumeration : true;
    const r = classe(f.attrs, f.tag, enumr);
    const conforme = r.etat === f.attendu;
    if (conforme) ok++;
    lignes.push({
      nom: f.nom,
      attrsHex: '0x' + f.attrs.toString(16).padStart(8, '0'),
      contexteEnumeration: enumr,
      etat: r.etat,
      attendu: f.attendu,
      conforme,
      lectureMetadonneesAutorisee: r.lectureMetadonneesAutorisee,
      lectureContenuAutorisee: r.lectureContenuAutorisee,
      hydratationRisqueeSiOnLisaitLeContenu: r.hydratationRisqueeSiOnLisaitLeContenu,
    });
  }
  const jamaisDeLectureContenu = lignes.every((l) => l.lectureContenuAutorisee === false);
  console.log(JSON.stringify({
    avertissement: 'SIMULATION sur attributs fabriqués. Aucun fichier réel lu, ouvert ou énuméré.',
    cas: lignes,
    casConformes: ok + '/' + FIXTURE.length,
    regleInvariante_aucuneLectureDeContenu: jamaisDeLectureContenu,
  }, null, 2));
}
