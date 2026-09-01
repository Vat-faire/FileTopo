//! Where the slice is allowed to write.
//!
//! Three destinations, and nothing else:
//!
//! * `fixtures/` — the synthetic trees the slice analyses. **Never a user
//!   folder**: the slice ships no folder picker, and `TASK-0016` §12.4 keeps
//!   real data as a stop point reserved to Sébastien.
//! * `maps/` — the SQLite index, **beside** the analysed tree, never inside it
//!   (`I-2`).
//! * `runs/` — measurement artefacts, development builds only.
//!
//! In a development build the sandbox sits in the repository, under the
//! git-ignored `.filetopo-sandbox/`, so every piece of evidence stays
//! inspectable without leaving the repository. A release build has no
//! repository to find and falls back to the application's own data directory.

use std::path::{Path, PathBuf};

#[derive(Debug, Clone)]
pub struct SandboxPaths {
    pub fixtures: PathBuf,
    pub maps: PathBuf,
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
            maps: root.join("maps"),
            label: label.to_string(),
        }
    }

    pub fn map_database(&self, fixture_id: &str) -> PathBuf {
        self.maps.join(fixture_id).join("map.sqlite")
    }

    /// Where the sandbox lives, named rather than spelled out, so a reader can
    /// see that nothing is written to a user folder without the absolute path
    /// being published along with it.
    pub fn display_root(&self) -> String {
        self.label.clone()
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
        let database = paths.map_database("wide");

        assert!(
            !database.starts_with(&fixture_root),
            "I-2: {database:?} must not live inside {fixture_root:?}"
        );
        assert!(database.starts_with(&paths.maps));
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
        assert!(paths.maps.starts_with(&app_data));
    }
}
