mod domain;
mod index;
mod scanner;
mod synthetic;

use domain::{AppHealth, CollectionSnapshot};
use index::Index;
use scanner::scan_tree;
use std::path::PathBuf;

#[tauri::command]
fn health() -> AppHealth {
    AppHealth {
        app_version: env!("CARGO_PKG_VERSION").to_string(),
        sqlite_version: rusqlite::version().to_string(),
        mode: "local_offline".to_string(),
    }
}

#[tauri::command]
fn demo_snapshot() -> CollectionSnapshot {
    synthetic::demo_snapshot(96)
}

#[tauri::command]
fn scan_synthetic_fixture() -> Result<CollectionSnapshot, String> {
    let root = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("..")
        .join("tests")
        .join("fixtures_synthetic")
        .join("demo");

    if !root.is_dir() {
        return Err("synthetic_fixture_missing".to_string());
    }

    let scan = scan_tree(&root).map_err(|error| error.to_string())?;
    let mut index = Index::in_memory().map_err(|error| error.to_string())?;
    index
        .replace_nodes(&scan.nodes)
        .map_err(|error| error.to_string())?;
    let nodes = index
        .list_nodes(5_000, 0)
        .map_err(|error| error.to_string())?;
    Ok(synthetic::snapshot_from_nodes(
        "fixture-demo",
        "Fixture synthétique",
        nodes,
        scan.diagnostics,
    ))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            health,
            demo_snapshot,
            scan_synthetic_fixture
        ])
        .run(tauri::generate_context!())
        .expect("FileTopo could not start");
}

#[cfg(test)]
mod integration_tests {
    use super::*;
    use std::collections::hash_map::DefaultHasher;
    use std::fs;
    use std::hash::{Hash, Hasher};
    use std::path::Path;

    fn fixture_fingerprint(root: &Path) -> u64 {
        fn visit(path: &Path, hasher: &mut DefaultHasher) {
            let mut entries = fs::read_dir(path)
                .expect("read fixture")
                .map(|entry| entry.expect("fixture entry"))
                .collect::<Vec<_>>();
            entries.sort_by_key(|entry| entry.file_name());
            for entry in entries {
                entry.file_name().hash(hasher);
                if entry.file_type().expect("file type").is_dir() {
                    visit(&entry.path(), hasher);
                } else {
                    fs::read(entry.path())
                        .expect("synthetic content")
                        .hash(hasher);
                }
            }
        }

        let mut hasher = DefaultHasher::new();
        visit(root, &mut hasher);
        hasher.finish()
    }

    #[test]
    fn fixture_to_index_to_render_dto_is_read_only() {
        let root = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .join("..")
            .join("tests")
            .join("fixtures_synthetic")
            .join("demo");
        let before = fixture_fingerprint(&root);

        let snapshot = scan_synthetic_fixture().expect("fixture pipeline");

        assert_eq!(before, fixture_fingerprint(&root));
        assert_eq!(snapshot.collection_id, "fixture-demo");
        assert!(snapshot.node_count >= 8);
        assert_eq!(snapshot.node_count, snapshot.nodes.len());
        assert_eq!(snapshot.terrain.len(), snapshot.node_count - 1);
        assert!(
            snapshot
                .nodes
                .iter()
                .all(|node| !node.relative_path.contains(".."))
        );
    }
}
