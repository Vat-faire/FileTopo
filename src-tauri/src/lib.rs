mod domain;
mod index;
mod registry;
mod scanner;
mod synthetic;

use domain::{
    AppHealth, CollectionSnapshot, CollectionSummary, IndexProgress, NodePage, NodeQueryRequest,
};
use index::Index;
use registry::Registry;
// `scan_tree` only serves the development-only synthetic fixture and the tests.
#[cfg(debug_assertions)]
use scanner::scan_tree;
use scanner::scan_tree_controlled;
use std::collections::HashMap;
use std::fs;
use std::path::{Component, Path, PathBuf};
use std::process::Command;
use std::sync::atomic::{AtomicBool, AtomicUsize, Ordering};
use std::sync::{Arc, Mutex};
use tauri::Manager;
use tauri_plugin_dialog::DialogExt;

#[derive(Default)]
struct IndexJob {
    cancelled: AtomicBool,
    visited_nodes: AtomicUsize,
}

#[derive(Clone, Default)]
struct IndexJobs(Arc<Mutex<HashMap<String, Arc<IndexJob>>>>);

impl IndexJobs {
    fn start(&self, collection_id: &str) -> Result<Arc<IndexJob>, String> {
        let mut jobs = self
            .0
            .lock()
            .map_err(|_| "index_jobs_unavailable".to_string())?;
        if jobs.contains_key(collection_id) {
            return Err("index_already_running".to_string());
        }
        let job = Arc::new(IndexJob::default());
        jobs.insert(collection_id.to_string(), job.clone());
        Ok(job)
    }

    fn get(&self, collection_id: &str) -> Option<Arc<IndexJob>> {
        self.0.lock().ok()?.get(collection_id).cloned()
    }

    fn finish(&self, collection_id: &str) {
        if let Ok(mut jobs) = self.0.lock() {
            jobs.remove(collection_id);
        }
    }
}

#[tauri::command]
fn health() -> AppHealth {
    AppHealth {
        app_version: env!("CARGO_PKG_VERSION").to_string(),
        sqlite_version: rusqlite::version().to_string(),
        mode: "local_offline".to_string(),
        synthetic_fixture_available: cfg!(debug_assertions),
    }
}

#[tauri::command]
fn demo_snapshot() -> CollectionSnapshot {
    synthetic::demo_snapshot(96)
}

/// Locates the synthetic fixture **at run time**, relative to the current
/// working directory.
///
/// Deliberately not `env!("CARGO_MANIFEST_DIR")`: that macro is expanded by the
/// compiler into a string literal, which would bake the absolute path of the
/// developer's checkout into every binary produced from this source.
#[cfg(debug_assertions)]
fn synthetic_fixture_root() -> Option<PathBuf> {
    let cwd = std::env::current_dir().ok()?;
    let relative = Path::new("tests").join("fixtures_synthetic").join("demo");
    // `cargo test` and `tauri dev` run from the crate directory; a plain
    // `cargo run` from the repository root is also accepted.
    let candidates = [cwd.join("..").join(&relative), cwd.join(&relative)];
    candidates.into_iter().find(|candidate| candidate.is_dir())
}

/// Development-only: runs the real scanner over the synthetic fixture.
#[cfg(debug_assertions)]
#[tauri::command]
fn scan_synthetic_fixture() -> Result<CollectionSnapshot, String> {
    let root = synthetic_fixture_root().ok_or_else(|| "synthetic_fixture_missing".to_string())?;

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

/// Release builds carry no fixture path at all, so nothing about the machine
/// that compiled them can leak through this command.
#[cfg(not(debug_assertions))]
#[tauri::command]
fn scan_synthetic_fixture() -> Result<CollectionSnapshot, String> {
    Err("synthetic_fixture_unavailable_in_release".to_string())
}

fn registry_for(app: &tauri::AppHandle) -> Result<Registry, String> {
    let app_data = app
        .path()
        .app_data_dir()
        .map_err(|_| "app_data_unavailable".to_string())?;
    Registry::open(app_data.join("registry.sqlite")).map_err(|error| error.to_string())
}

#[tauri::command]
fn list_collections(app: tauri::AppHandle) -> Result<Vec<CollectionSummary>, String> {
    registry_for(&app)?
        .list()
        .map_err(|error| error.to_string())
}

#[tauri::command]
async fn choose_collection(app: tauri::AppHandle) -> Result<Option<CollectionSummary>, String> {
    let picked = app
        .dialog()
        .file()
        .set_title("Choisir une racine FileTopo")
        .blocking_pick_folder();
    let Some(picked) = picked else {
        return Ok(None);
    };
    let root = picked
        .into_path()
        .map_err(|_| "selected_path_invalid".to_string())?;
    let registry = registry_for(&app)?;
    registry
        .register(&root)
        .map(Some)
        .map_err(|error| error.to_string())
}

#[tauri::command]
async fn index_collection(
    app: tauri::AppHandle,
    jobs: tauri::State<'_, IndexJobs>,
    collection_id: String,
) -> Result<CollectionSnapshot, String> {
    let app_data = app
        .path()
        .app_data_dir()
        .map_err(|_| "app_data_unavailable".to_string())?;
    let registry_path = app_data.join("registry.sqlite");
    let job = jobs.start(&collection_id)?;
    let jobs = jobs.inner().clone();
    let worker_id = collection_id.clone();
    let cancel_job = job.clone();
    let progress_job = job.clone();

    let result = tauri::async_runtime::spawn_blocking(move || {
        index_registered_collection_controlled(
            &app_data,
            &registry_path,
            &worker_id,
            || cancel_job.cancelled.load(Ordering::Relaxed),
            |visited| progress_job.visited_nodes.store(visited, Ordering::Relaxed),
        )
    })
    .await
    .map_err(|_| "index_worker_failed".to_string());
    jobs.finish(&collection_id);
    result?
}

#[tauri::command]
fn cancel_indexing(jobs: tauri::State<'_, IndexJobs>, collection_id: String) -> bool {
    let Some(job) = jobs.get(&collection_id) else {
        return false;
    };
    job.cancelled.store(true, Ordering::Relaxed);
    true
}

#[tauri::command]
fn index_progress(
    jobs: tauri::State<'_, IndexJobs>,
    collection_id: String,
) -> Option<IndexProgress> {
    let job = jobs.get(&collection_id)?;
    Some(IndexProgress {
        collection_id,
        visited_nodes: job.visited_nodes.load(Ordering::Relaxed),
        status: if job.cancelled.load(Ordering::Relaxed) {
            "cancelling"
        } else {
            "scanning"
        }
        .to_string(),
    })
}

#[tauri::command]
fn query_collection_nodes(
    app: tauri::AppHandle,
    request: NodeQueryRequest,
) -> Result<NodePage, String> {
    let app_data = app
        .path()
        .app_data_dir()
        .map_err(|_| "app_data_unavailable".to_string())?;
    let registry =
        Registry::open(app_data.join("registry.sqlite")).map_err(|error| error.to_string())?;
    let record = registry
        .resolve(&request.collection_id)
        .map_err(|error| error.to_string())?;
    let index_path = app_data
        .join("collections")
        .join(record.summary.id)
        .join("index.sqlite");
    if !index_path.is_file() {
        return Err("collection_not_indexed".to_string());
    }
    let index = Index::open(&index_path).map_err(|error| error.to_string())?;
    let (items, total) = index
        .query_nodes(
            &request.query,
            request.kind.as_deref(),
            request.online_only,
            request.unseen_only,
            request.limit,
            request.offset,
        )
        .map_err(|error| error.to_string())?;
    Ok(NodePage {
        items,
        total,
        limit: request.limit.clamp(1, 500),
        offset: request.offset,
    })
}

#[tauri::command]
fn mark_node_seen(
    app: tauri::AppHandle,
    collection_id: String,
    node_id: i64,
) -> Result<bool, String> {
    let app_data = app
        .path()
        .app_data_dir()
        .map_err(|_| "app_data_unavailable".to_string())?;
    let registry =
        Registry::open(app_data.join("registry.sqlite")).map_err(|error| error.to_string())?;
    let record = registry
        .resolve(&collection_id)
        .map_err(|error| error.to_string())?;
    let index_path = app_data
        .join("collections")
        .join(record.summary.id)
        .join("index.sqlite");
    if !index_path.is_file() {
        return Err("collection_not_indexed".to_string());
    }
    Index::open(&index_path)
        .and_then(|index| index.mark_seen(node_id))
        .map_err(|error| error.to_string())
}

fn resolve_indexed_target(root: &Path, relative_path: &str) -> Result<PathBuf, String> {
    let mut target = root.to_path_buf();
    if !relative_path.is_empty() {
        for component in Path::new(relative_path).components() {
            let Component::Normal(name) = component else {
                return Err("indexed_path_invalid".to_string());
            };
            target.push(name);
            let metadata = fs::symlink_metadata(&target)
                .map_err(|_| "indexed_target_unavailable".to_string())?;
            if metadata.file_type().is_symlink() || metadata_is_reparse_point(&metadata) {
                return Err("indexed_target_reparse_point".to_string());
            }
        }
    }
    Ok(target)
}

#[cfg(windows)]
fn metadata_is_reparse_point(metadata: &fs::Metadata) -> bool {
    use std::os::windows::fs::MetadataExt;
    metadata.file_attributes() & 0x0000_0400 != 0
}

#[cfg(not(windows))]
fn metadata_is_reparse_point(_metadata: &fs::Metadata) -> bool {
    false
}

#[tauri::command]
fn reveal_indexed_node(
    app: tauri::AppHandle,
    collection_id: String,
    node_id: i64,
) -> Result<bool, String> {
    let app_data = app
        .path()
        .app_data_dir()
        .map_err(|_| "app_data_unavailable".to_string())?;
    let registry =
        Registry::open(app_data.join("registry.sqlite")).map_err(|error| error.to_string())?;
    let record = registry
        .resolve(&collection_id)
        .map_err(|error| error.to_string())?;
    let index_path = app_data
        .join("collections")
        .join(&record.summary.id)
        .join("index.sqlite");
    let index = Index::open(&index_path).map_err(|error| error.to_string())?;
    let node = index
        .node(node_id)
        .map_err(|error| error.to_string())?
        .ok_or_else(|| "indexed_node_missing".to_string())?;
    if node.reparse_point || node.kind == domain::NodeKind::Skipped {
        return Err("indexed_target_not_openable".to_string());
    }
    let target = resolve_indexed_target(&record.root, &node.relative_path)?;

    #[cfg(windows)]
    {
        let argument = if target.is_dir() {
            target.as_os_str().to_os_string()
        } else {
            format!("/select,{}", target.display()).into()
        };
        Command::new("explorer.exe")
            .arg(argument)
            .spawn()
            .map_err(|_| "explorer_launch_failed".to_string())?;
        Ok(true)
    }
    #[cfg(not(windows))]
    {
        let _ = target;
        Err("platform_not_supported".to_string())
    }
}

#[cfg(test)]
fn index_registered_collection(
    app_data: &std::path::Path,
    registry_path: &std::path::Path,
    collection_id: &str,
) -> Result<CollectionSnapshot, String> {
    index_registered_collection_controlled(app_data, registry_path, collection_id, || false, |_| {})
}

fn index_registered_collection_controlled(
    app_data: &std::path::Path,
    registry_path: &std::path::Path,
    collection_id: &str,
    is_cancelled: impl Fn() -> bool,
    report_progress: impl FnMut(usize),
) -> Result<CollectionSnapshot, String> {
    let registry =
        Registry::open(registry_path.to_path_buf()).map_err(|error| error.to_string())?;
    let record = registry
        .resolve(collection_id)
        .map_err(|error| error.to_string())?;
    let scan = scan_tree_controlled(&record.root, is_cancelled, report_progress)
        .map_err(|error| error.to_string())?;
    let node_count = scan.nodes.len();
    let total_size_bytes = scan.nodes.iter().map(|node| node.size_bytes).sum::<u64>();

    let collection_data = app_data.join("collections").join(&record.summary.id);
    fs::create_dir_all(&collection_data)
        .map_err(|_| "collection_data_create_failed".to_string())?;
    let mut index =
        Index::open(&collection_data.join("index.sqlite")).map_err(|error| error.to_string())?;
    index
        .replace_nodes(&scan.nodes)
        .map_err(|error| error.to_string())?;

    registry
        .update_statistics(&record.summary.id, node_count, total_size_bytes)
        .map_err(|error| error.to_string())?;

    let visible_nodes = scan.nodes.into_iter().take(5_000).collect::<Vec<_>>();
    let mut snapshot = synthetic::snapshot_from_nodes(
        &record.summary.id,
        &record.summary.name,
        visible_nodes,
        scan.diagnostics,
    );
    snapshot.node_count = node_count;
    snapshot.total_size_bytes = total_size_bytes;
    Ok(snapshot)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(IndexJobs::default())
        .invoke_handler(tauri::generate_handler![
            health,
            demo_snapshot,
            scan_synthetic_fixture,
            list_collections,
            choose_collection,
            index_collection,
            cancel_indexing,
            index_progress,
            query_collection_nodes,
            mark_node_seen,
            reveal_indexed_node
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
    fn fixture_root_is_resolved_at_runtime_without_a_compiled_in_path() {
        let resolved =
            synthetic_fixture_root().expect("fixture located from the working directory");
        let expected = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .join("..")
            .join("tests")
            .join("fixtures_synthetic")
            .join("demo");

        // Same directory, reached without baking an absolute path into the code.
        assert!(resolved.is_dir());
        assert_eq!(
            resolved.canonicalize().expect("resolved fixture"),
            expected.canonicalize().expect("expected fixture")
        );
    }

    #[test]
    fn health_reports_the_synthetic_fixture_only_in_development() {
        let reported = health();
        // The test binary is always a debug build, so the flag must follow it.
        assert_eq!(reported.synthetic_fixture_available, cfg!(debug_assertions));
        assert!(reported.synthetic_fixture_available);
        assert_eq!(reported.mode, "local_offline");
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

    #[test]
    fn registered_collection_is_indexed_outside_its_root() {
        let temp = tempfile::tempdir().expect("temp");
        let root = temp.path().join("synthetic-root");
        let app_data = temp.path().join("app-data");
        fs::create_dir_all(root.join("notes")).expect("root");
        fs::write(root.join("notes/one.txt"), b"synthetic").expect("fixture");
        let registry_path = app_data.join("registry.sqlite");
        let registry = Registry::open(registry_path.clone()).expect("registry");
        let collection = registry.register(&root).expect("register");
        let before = fixture_fingerprint(&root);

        let snapshot =
            index_registered_collection(&app_data, &registry_path, &collection.id).expect("index");

        assert_eq!(snapshot.node_count, 3);
        assert_eq!(before, fixture_fingerprint(&root));
        assert!(
            app_data
                .join("collections")
                .join(&collection.id)
                .join("index.sqlite")
                .is_file()
        );
        assert!(!root.join("index.sqlite").exists());
        assert_eq!(registry.list().expect("list")[0].node_count, 3);
    }

    #[test]
    fn cancelled_collection_scan_never_writes_a_partial_index() {
        let temp = tempfile::tempdir().expect("temp");
        let root = temp.path().join("synthetic-root");
        let app_data = temp.path().join("app-data");
        fs::create_dir_all(&root).expect("root");
        fs::write(root.join("one.txt"), b"synthetic").expect("fixture");
        let registry_path = app_data.join("registry.sqlite");
        let registry = Registry::open(registry_path.clone()).expect("registry");
        let collection = registry.register(&root).expect("register");

        let result = index_registered_collection_controlled(
            &app_data,
            &registry_path,
            &collection.id,
            || true,
            |_| {},
        );

        assert_eq!(result.expect_err("cancelled"), "scan_cancelled");
        assert!(
            !app_data
                .join("collections")
                .join(&collection.id)
                .join("index.sqlite")
                .exists()
        );
        assert_eq!(registry.list().expect("list")[0].node_count, 0);
    }

    #[test]
    fn indexed_target_resolution_rejects_escape_and_missing_entries() {
        let temp = tempfile::tempdir().expect("temp");
        let root = temp.path().join("synthetic-root");
        fs::create_dir_all(root.join("notes")).expect("root");
        fs::write(root.join("notes/one.txt"), b"synthetic").expect("fixture");

        assert_eq!(
            resolve_indexed_target(&root, "notes/one.txt").expect("safe"),
            root.join("notes/one.txt")
        );
        assert_eq!(
            resolve_indexed_target(&root, "../outside.txt").expect_err("escape"),
            "indexed_path_invalid"
        );
        assert_eq!(
            resolve_indexed_target(&root, "notes/missing.txt").expect_err("missing"),
            "indexed_target_unavailable"
        );
    }
}
