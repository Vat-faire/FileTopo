//! Where the slice is allowed to write.
//!
//! Three destinations, and nothing else:
//!
//! * `fixtures/` — the synthetic trees the slice analyses. **Never a user
//!   folder**: the slice ships no folder picker, and `TASK-0016` §12.4 keeps
//!   real data as a stop point reserved to Sébastien. A fixture root is
//!   **shared** by every brain that reads it, and read **only**.
//! * `brains/` — everything FileTopo knows about a brain, **namespaced by
//!   `brain_id`** (`TASK-0018` §4.4): the common catalogue, then one index and
//!   one relations store **per brain**.
//! * `runs/` — measurement artefacts, development builds only.
//!
//! **The namespace is the `brain_id`, never the source.** `brain-alpha` and
//! `brain-gamma` read the same fixture and must not share a byte of FileTopo
//! state, so their storage is separated by a **directory**, not by a column
//! somebody could forget in a `WHERE` clause. `K3` compares the two paths and
//! fails if they ever meet.
//!
//! The `TASK-0016`/`TASK-0017` layout — `maps/<fixture>/` and
//! `relations/<fixture>/` — keyed FileTopo state by the **source**, which is
//! exactly the confusion `DEC-0017` removes. Those directories may still exist
//! in a developer's sandbox; **nothing here reads or deletes them**, and no
//! accessor leads to them any more.
//!
//! In a development build the sandbox sits in the repository, under the
//! git-ignored `.filetopo-sandbox/`, so every piece of evidence stays
//! inspectable without leaving the repository. A release build has no
//! repository to find and falls back to the application's own data directory.

use std::path::{Path, PathBuf};

#[derive(Debug, Clone)]
pub struct SandboxPaths {
    /// Kept so a path can be *named* relative to it. Never published as is.
    root: PathBuf,
    pub fixtures: PathBuf,
    /// Everything FileTopo knows about brains — `TASK-0018` §4.4.
    pub brains: PathBuf,
    /// How the sandbox is *named* on screen and in artefacts.
    ///
    /// Never the absolute path. `AGENTS.md` forbids a personal local path from
    /// reaching the repository, and a measurement artefact committed as
    /// evidence is exactly the place one would slip through unnoticed.
    pub label: String,
}

impl SandboxPaths {
    /// Test-only shorthand: production always names its sandbox through
    /// [`resolve`], which is what keeps the published label free of an absolute
    /// path.
    #[cfg(test)]
    pub fn under(root: PathBuf) -> Self {
        Self::labelled(root, "<bac à sable>")
    }

    pub fn labelled(root: PathBuf, label: &str) -> Self {
        Self {
            fixtures: root.join("fixtures"),
            brains: root.join("brains"),
            root,
            label: label.to_string(),
        }
    }

    /// The common catalogue — `DEC-0011` `S-C`: the small shared store holding
    /// the **non-reconstructible** state of every brain, and nothing derived.
    pub fn catalog_database(&self) -> PathBuf {
        self.brains.join("catalog.sqlite")
    }

    /// A brain's own space. Everything below it belongs to that brain alone.
    pub fn brain_root(&self, brain_id: &str) -> PathBuf {
        self.brains.join(brain_id)
    }

    /// A brain's index — **derived**, rebuildable, and its own.
    pub fn brain_map_database(&self, brain_id: &str) -> PathBuf {
        self.brain_root(brain_id).join("map").join("index.sqlite")
    }

    /// A brain's relations. **Never** under its `map/`, which a rebuild wipes,
    /// and never inside the analysed tree.
    pub fn brain_relations_database(&self, brain_id: &str) -> PathBuf {
        self.brain_root(brain_id)
            .join("relations")
            .join("relations.sqlite")
    }

    /// Where the sandbox lives, named rather than spelled out, so a reader can
    /// see that nothing is written to a user folder without the absolute path
    /// being published along with it.
    pub fn display_root(&self) -> String {
        self.label.clone()
    }

    /// A path as it may be **published**: relative to the sandbox root, with
    /// forward slashes.
    ///
    /// `K3` has to compare real storage paths and show they differ. Publishing
    /// the absolute ones would put a personal local path in the repository, so
    /// what is published is the part that carries the meaning — the part below
    /// the sandbox — and the sandbox itself stays named.
    pub fn relative_name(&self, path: &Path) -> String {
        path.strip_prefix(&self.root)
            .unwrap_or(path)
            .to_string_lossy()
            .replace('\\', "/")
    }
}

/// Resolves the sandbox for the running application, preferring the repository
/// checkout in development.
///
/// Callers that must control the destination — every test — build a
/// [`SandboxPaths`] directly instead, so a test never writes into the shared
/// development sandbox and two tests never collide over the same fixture.
///
/// The repository is located **at run time** by walking up from the working
/// directory, never through `env!("CARGO_MANIFEST_DIR")`: that macro expands
/// to a string literal and would bake the developer's absolute path into every
/// binary built from this source. The existing `scan_synthetic_fixture` avoids
/// it for the same reason.
pub fn resolve(app_data: &Path) -> SandboxPaths {
    if cfg!(debug_assertions) {
        if let Some(repository) = repository_root() {
            return SandboxPaths::labelled(
                repository.join(".filetopo-sandbox"),
                "<dépôt>/.filetopo-sandbox",
            );
        }
    }
    SandboxPaths::labelled(app_data.join("sandbox"), "<données d'application>/sandbox")
}

/// Walks up from the working directory looking for this repository's markers.
///
/// Both markers are required: a lone `AGENTS.md` somewhere up the tree is not
/// proof that we are in the FileTopo checkout, and guessing wrong would mean
/// writing outside the repository.
pub fn repository_root() -> Option<PathBuf> {
    let mut current = std::env::current_dir().ok()?;
    loop {
        if current.join("AGENTS.md").is_file() && current.join("src-tauri").is_dir() {
            return Some(current);
        }
        if !current.pop() {
            return None;
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn index_never_lands_inside_the_analysed_tree() {
        let paths = SandboxPaths::under(PathBuf::from("/sandbox"));
        let fixture_root = paths.fixtures.join("wide");
        let database = paths.brain_map_database("brain-beta");

        assert!(
            !database.starts_with(&fixture_root),
            "I-2: {database:?} must not live inside {fixture_root:?}"
        );
        assert!(database.starts_with(&paths.brains));
    }

    /// `J10`, structurally: the rebuild deletes the brain's `map/`, so
    /// relations must not live there.
    #[test]
    fn relations_live_outside_the_rebuildable_index() {
        let paths = SandboxPaths::under(PathBuf::from("/sandbox"));
        let relations = paths.brain_relations_database("brain-alpha");
        let index = paths.brain_map_database("brain-alpha");
        let fixture_root = paths.fixtures.join("quasi-empty");

        assert!(!relations.starts_with(index.parent().expect("map dir")));
        assert!(!relations.starts_with(&fixture_root));
        assert!(relations.starts_with(paths.brain_root("brain-alpha")));
    }

    /// `K3`, at the layout level: two brains reading the **same** fixture get
    /// two **different** storage spaces.
    ///
    /// This is the assertion the whole slice turns on. If it ever holds only
    /// because the two brains happen to have different sources, it proves
    /// nothing — so the sources here are deliberately identical.
    #[test]
    fn two_brains_on_the_same_source_never_share_a_file() {
        let paths = SandboxPaths::under(PathBuf::from("/sandbox"));

        // Both read `quasi-empty`; the path never mentions it.
        let alpha_index = paths.brain_map_database("brain-alpha");
        let gamma_index = paths.brain_map_database("brain-gamma");
        let alpha_relations = paths.brain_relations_database("brain-alpha");
        let gamma_relations = paths.brain_relations_database("brain-gamma");

        assert_ne!(alpha_index, gamma_index);
        assert_ne!(alpha_relations, gamma_relations);
        assert!(!alpha_index.starts_with(paths.brain_root("brain-gamma")));
        assert!(!gamma_index.starts_with(paths.brain_root("brain-alpha")));
        assert!(!alpha_relations.starts_with(paths.brain_root("brain-gamma")));
        assert!(!gamma_relations.starts_with(paths.brain_root("brain-alpha")));

        // The catalogue is shared, and it is the **only** thing that is.
        let catalog = paths.catalog_database();
        assert!(!catalog.starts_with(paths.brain_root("brain-alpha")));
        assert!(!catalog.starts_with(paths.brain_root("brain-gamma")));
    }

    #[test]
    fn a_published_storage_path_is_relative_to_the_sandbox_and_never_absolute() {
        let paths = SandboxPaths::labelled(
            PathBuf::from(r"C:\Users\quelquun\Documents\depot\.filetopo-sandbox"),
            "<dépôt>/.filetopo-sandbox",
        );
        let published = paths.relative_name(&paths.brain_map_database("brain-alpha"));

        assert_eq!(published, "brains/brain-alpha/map/index.sqlite");
        assert!(!published.contains("Users"));
        assert!(!published.contains(':'));
        assert!(!published.contains('\\'));
    }

    #[test]
    fn the_published_label_never_carries_an_absolute_path() {
        let paths = SandboxPaths::labelled(
            PathBuf::from(r"C:\Users\quelquun\Documents\depot\.filetopo-sandbox"),
            "<dépôt>/.filetopo-sandbox",
        );
        let shown = paths.display_root();
        assert_eq!(shown, "<dépôt>/.filetopo-sandbox");
        assert!(!shown.contains("Users"));
        assert!(!shown.contains(':'));
    }

    #[test]
    fn a_release_style_resolution_stays_under_the_application_directory() {
        let app_data = PathBuf::from("/app-data");
        let paths = SandboxPaths::under(app_data.join("sandbox"));
        assert!(paths.fixtures.starts_with(&app_data));
        assert!(paths.brains.starts_with(&app_data));
        assert!(paths.catalog_database().starts_with(&app_data));
        assert!(
            paths
                .brain_map_database("brain-alpha")
                .starts_with(&app_data)
        );
    }
}
