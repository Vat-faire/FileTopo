// B3 — Identité Windows en Rust STABLE. CODE JETABLE.
//
// Ce programme n'est PAS du code de production et ne doit jamais être importé
// par FileTopo. Il répond à une seule question : peut-on obtenir
// `VolumeSerialNumber` + `FileId` sur le canal `stable`, à quel coût, et que
// devient cette identité quand un fichier est renommé ou déplacé ?
//
// Canal `nightly` INTERDIT (§10.1.1 de TASK-0012). Le programme se compile et
// s'exécute sur `stable-x86_64-pc-windows-msvc`.
//
// Toutes les arborescences sont SYNTHÉTIQUES et créées sous spikes/.work/b3/.
// Aucun fichier de l'utilisateur n'est lu, ouvert, déplacé ni même énuméré.

use std::ffi::OsStr;
use std::fs;
use std::os::windows::ffi::OsStrExt;
use std::path::{Path, PathBuf};
use std::time::Instant;

use windows_sys::Win32::Foundation::{CloseHandle, HANDLE, INVALID_HANDLE_VALUE};
use windows_sys::Win32::Storage::FileSystem::{
    CreateFileW, GetFileInformationByHandleEx, FILE_ATTRIBUTE_NORMAL,
    FILE_FLAG_BACKUP_SEMANTICS, FILE_ID_INFO, FILE_SHARE_DELETE, FILE_SHARE_READ,
    FILE_SHARE_WRITE, FileIdInfo, OPEN_EXISTING,
};

// --------------------------------------------------------------------------
// Identité prouvée : VolumeSerialNumber + FileId 128 bits
// --------------------------------------------------------------------------

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
struct Identite {
    volume: u64,
    fichier: [u8; 16],
}

impl Identite {
    fn texte(&self) -> String {
        let mut s = format!("{:016x}:", self.volume);
        for b in self.fichier.iter() {
            s.push_str(&format!("{:02x}", b));
        }
        s
    }
}

fn vers_wide(p: &Path) -> Vec<u16> {
    OsStr::new(p).encode_wide().chain(std::iter::once(0)).collect()
}

/// Ouvre le chemin en accès NUL — un « attribute-only open ». Aucune donnée
/// n'est lue. `FILE_FLAG_BACKUP_SEMANTICS` est requis pour ouvrir un dossier.
fn ouvre_pour_metadonnees(p: &Path) -> Option<HANDLE> {
    let w = vers_wide(p);
    let h = unsafe {
        CreateFileW(
            w.as_ptr(),
            0, // AUCUN accès aux données : ni GENERIC_READ, ni lecture de contenu
            FILE_SHARE_READ | FILE_SHARE_WRITE | FILE_SHARE_DELETE,
            std::ptr::null(),
            OPEN_EXISTING,
            FILE_ATTRIBUTE_NORMAL | FILE_FLAG_BACKUP_SEMANTICS,
            std::ptr::null_mut(),
        )
    };
    if h == INVALID_HANDLE_VALUE {
        None
    } else {
        Some(h)
    }
}

fn identite(p: &Path) -> Option<Identite> {
    let h = ouvre_pour_metadonnees(p)?;
    let mut info: FILE_ID_INFO = unsafe { std::mem::zeroed() };
    let ok = unsafe {
        GetFileInformationByHandleEx(
            h,
            FileIdInfo,
            &mut info as *mut _ as *mut core::ffi::c_void,
            std::mem::size_of::<FILE_ID_INFO>() as u32,
        )
    };
    unsafe { CloseHandle(h) };
    if ok == 0 {
        return None;
    }
    Some(Identite {
        volume: info.VolumeSerialNumber,
        fichier: info.FileId.Identifier,
    })
}

// --------------------------------------------------------------------------
// Repli déterministe par chemin
// --------------------------------------------------------------------------
//
// Ce n'est PAS une identité prouvée : c'est une empreinte du CHEMIN. Elle
// change dès que le chemin change. Elle est versionnée pour qu'un changement
// d'algorithme soit détectable, et strictement reproductible.
//
// L'algorithme est FNV-1a 64 bits sur les octets UTF-8 du chemin relatif
// normalisé en séparateurs `/`. Il est volontairement identique à celui du
// spike B1 en JavaScript, ce qui permet de vérifier la reproductibilité entre
// deux mises en œuvre indépendantes.

fn empreinte_chemin_v1(rel: &str) -> String {
    let mut h: u64 = 0xcbf2_9ce4_8422_2325;
    const P: u64 = 0x0000_0100_0000_01b3;
    for b in rel.as_bytes() {
        h ^= *b as u64;
        h = h.wrapping_mul(P);
    }
    format!("v1:{:016x}", h)
}

// --------------------------------------------------------------------------
// Arborescence synthétique
// --------------------------------------------------------------------------

fn graine(mut a: u32) -> impl FnMut() -> f64 {
    move || {
        a = a.wrapping_add(0x6d2b_79f5);
        let mut t = a;
        t = (t ^ (t >> 15)).wrapping_mul(1 | t);
        t = t ^ (t.wrapping_add((t ^ (t >> 7)).wrapping_mul(61 | t)));
        ((t ^ (t >> 14)) as f64) / 4_294_967_296.0
    }
}

/// Crée `n` fichiers synthétiques répartis dans des sous-dossiers.
fn cree_arborescence(racine: &Path, n: usize) -> std::io::Result<Vec<PathBuf>> {
    let _ = fs::remove_dir_all(racine);
    fs::create_dir_all(racine)?;
    let mut r = graine(20_260_831);
    let par_dossier = 200usize;
    let nb_dossiers = n.div_ceil(par_dossier);
    let mut chemins = Vec::with_capacity(n);
    for d in 0..nb_dossiers {
        let dir = racine.join(format!("dossier-{d:05}"));
        fs::create_dir_all(&dir)?;
        for f in 0..par_dossier.min(n - d * par_dossier) {
            let p = dir.join(format!("fichier-{:05}-{:04}.dat", d, f));
            // Contenu synthétique minuscule; jamais relu par ce programme.
            let taille = 8 + (r() * 40.0) as usize;
            fs::write(&p, vec![b'x'; taille])?;
            chemins.push(p);
        }
    }
    Ok(chemins)
}

fn parcours_sans_identite(racine: &Path) -> usize {
    let mut n = 0usize;
    let mut pile = vec![racine.to_path_buf()];
    while let Some(d) = pile.pop() {
        if let Ok(it) = fs::read_dir(&d) {
            for e in it.flatten() {
                let m = match e.metadata() {
                    Ok(m) => m,
                    Err(_) => continue,
                };
                // Métadonnées seulement : taille et type. Aucun contenu lu.
                let _ = m.len();
                if m.is_dir() {
                    pile.push(e.path());
                } else {
                    n += 1;
                }
            }
        }
    }
    n
}

fn parcours_avec_identite(racine: &Path) -> (usize, usize) {
    let mut n = 0usize;
    let mut ok = 0usize;
    let mut pile = vec![racine.to_path_buf()];
    while let Some(d) = pile.pop() {
        if let Ok(it) = fs::read_dir(&d) {
            for e in it.flatten() {
                let m = match e.metadata() {
                    Ok(m) => m,
                    Err(_) => continue,
                };
                let _ = m.len();
                if m.is_dir() {
                    pile.push(e.path());
                } else {
                    n += 1;
                    if identite(&e.path()).is_some() {
                        ok += 1;
                    }
                }
            }
        }
    }
    (n, ok)
}

fn mediane(v: &mut Vec<f64>) -> f64 {
    v.sort_by(|a, b| a.partial_cmp(b).unwrap());
    v[(v.len() - 1) / 2]
}

fn json_ms(v: &[f64]) -> String {
    let mut c = v.to_vec();
    let med = mediane(&mut c);
    format!(
        "{{\"med\":{:.3},\"min\":{:.3},\"max\":{:.3},\"n\":{},\"brut\":[{}]}}",
        med,
        c[0],
        c[c.len() - 1],
        c.len(),
        v.iter().map(|x| format!("{x:.3}")).collect::<Vec<_>>().join(",")
    )
}

// --------------------------------------------------------------------------

fn main() {
    let racine = PathBuf::from(
        std::env::args().nth(1).unwrap_or_else(|| "../.work/b3".to_string()),
    );
    fs::create_dir_all(&racine).expect("création du répertoire de travail");

    println!("{{");

    // ---- Point 1 : l'identité est-elle obtenable sur stable ? -------------
    let sonde = racine.join("sonde.txt");
    fs::write(&sonde, b"synthetique").unwrap();
    let id_sonde = identite(&sonde);
    println!(
        "  \"point1_identite_sur_stable\": {{\"obtenue\": {}, \"valeur\": {}}},",
        id_sonde.is_some(),
        id_sonde
            .map(|i| format!("\"{}\"", i.texte()))
            .unwrap_or_else(|| "null".into())
    );

    // ---- Point 3 : renommage et déplacement intra-volume -----------------
    // Un FICHIER
    let a = racine.join("scenario_fichier_avant.dat");
    fs::write(&a, b"synthetique").unwrap();
    let id_a = identite(&a).unwrap();
    let b = racine.join("scenario_fichier_renomme.dat");
    fs::rename(&a, &b).unwrap();
    let id_b = identite(&b).unwrap();
    let sous = racine.join("sous_dossier");
    fs::create_dir_all(&sous).unwrap();
    let c = sous.join("scenario_fichier_deplace.dat");
    fs::rename(&b, &c).unwrap();
    let id_c = identite(&c).unwrap();

    // Un DOSSIER
    let d1 = racine.join("dossier_avant");
    fs::create_dir_all(d1.join("interne")).unwrap();
    let id_d1 = identite(&d1).unwrap();
    let d2 = racine.join("dossier_renomme");
    fs::rename(&d1, &d2).unwrap();
    let id_d2 = identite(&d2).unwrap();
    let d3 = sous.join("dossier_deplace");
    fs::rename(&d2, &d3).unwrap();
    let id_d3 = identite(&d3).unwrap();

    // COPIE puis SUPPRESSION : c'est ce que fait un déplacement INTER-VOLUME.
    let src = racine.join("copie_source.dat");
    fs::write(&src, b"synthetique").unwrap();
    let id_src = identite(&src).unwrap();
    let dst = racine.join("copie_destination.dat");
    fs::copy(&src, &dst).unwrap();
    let id_dst = identite(&dst).unwrap();
    fs::remove_file(&src).unwrap();

    println!("  \"point3_renommage_deplacement\": {{");
    println!("    \"fichier_avant\": \"{}\",", id_a.texte());
    println!("    \"fichier_renomme\": \"{}\",", id_b.texte());
    println!("    \"fichier_deplace\": \"{}\",", id_c.texte());
    println!("    \"fichier_identite_survit_renommage\": {},", id_a == id_b);
    println!("    \"fichier_identite_survit_deplacement\": {},", id_b == id_c);
    println!("    \"dossier_avant\": \"{}\",", id_d1.texte());
    println!("    \"dossier_renomme\": \"{}\",", id_d2.texte());
    println!("    \"dossier_deplace\": \"{}\",", id_d3.texte());
    println!("    \"dossier_identite_survit_renommage\": {},", id_d1 == id_d2);
    println!("    \"dossier_identite_survit_deplacement\": {},", id_d2 == id_d3);
    println!("    \"copie_source\": \"{}\",", id_src.texte());
    println!("    \"copie_destination\": \"{}\",", id_dst.texte());
    println!("    \"copie_donne_une_identite_differente\": {}", id_src != id_dst);
    println!("  }},");

    // ---- Point 6 : repli déterministe par chemin -------------------------
    let echantillons = [
        "racine-synthetique/alpha/bravo.txt",
        "racine-synthetique/alpha/bravo.txt",
        "racine-synthetique/charlie/delta.dat",
        "",
    ];
    let mut hs = Vec::new();
    for e in echantillons.iter() {
        hs.push(format!("{{\"entree\":{:?},\"empreinte\":\"{}\"}}", e, empreinte_chemin_v1(e)));
    }
    let stable = empreinte_chemin_v1(echantillons[0]) == empreinte_chemin_v1(echantillons[1]);
    println!("  \"point6_repli_par_chemin\": {{");
    println!("    \"echantillons\": [{}],", hs.join(","));
    println!("    \"meme_entree_meme_sortie\": {}", stable);
    println!("  }},");

    // ---- Point 5 : coût, à 1 000 / 10 000 / 100 000 ----------------------
    println!("  \"point5_cout\": [");
    let volumes = [1000usize, 10_000, 100_000];
    for (vi, v) in volumes.iter().enumerate() {
        let dir = racine.join(format!("cout-{v}"));
        cree_arborescence(&dir, *v).expect("arborescence synthétique");

        let mut sans = Vec::new();
        let mut avec = Vec::new();
        let mut compte = 0usize;
        let mut compte_id = 0usize;
        for _ in 0..5 {
            let t0 = Instant::now();
            compte = parcours_sans_identite(&dir);
            sans.push(t0.elapsed().as_secs_f64() * 1000.0);

            let t1 = Instant::now();
            let (n, ok) = parcours_avec_identite(&dir);
            avec.push(t1.elapsed().as_secs_f64() * 1000.0);
            compte = n.max(compte);
            compte_id = ok;
        }
        let mut sc = sans.clone();
        let mut ac = avec.clone();
        let msans = mediane(&mut sc);
        let mavec = mediane(&mut ac);
        println!("    {{");
        println!("      \"elements\": {v}, \"fichiers_parcourus\": {compte}, \"identites_obtenues\": {compte_id},");
        println!("      \"sans_identite_ms\": {},", json_ms(&sans));
        println!("      \"avec_identite_ms\": {},", json_ms(&avec));
        println!("      \"surcout_ms\": {:.3},", mavec - msans);
        println!("      \"surcout_pourcent\": {:.1},", (mavec / msans - 1.0) * 100.0);
        println!("      \"cout_par_element_us\": {:.3}", (mavec - msans) * 1000.0 / (compte as f64));
        print!("    }}");
        println!("{}", if vi + 1 < volumes.len() { "," } else { "" });
        let _ = fs::remove_dir_all(&dir);
    }
    println!("  ]");
    println!("}}");
}
