use crate::domain::{NodeDto, NodeKind};
use rusqlite::{Connection, Result, params};
use std::path::Path;

pub struct Index {
    connection: Connection,
}

impl Index {
    pub fn in_memory() -> Result<Self> {
        let connection = Connection::open_in_memory()?;
        let index = Self { connection };
        index.initialize()?;
        Ok(index)
    }

    #[allow(dead_code)]
    pub fn open(path: &Path) -> Result<Self> {
        let connection = Connection::open(path)?;
        connection.execute_batch(
            "PRAGMA journal_mode=WAL; PRAGMA synchronous=NORMAL; PRAGMA foreign_keys=ON;",
        )?;
        let index = Self { connection };
        index.initialize()?;
        Ok(index)
    }

    fn initialize(&self) -> Result<()> {
        self.connection.execute_batch(
            "
            PRAGMA foreign_keys=ON;
            PRAGMA user_version=1;
            CREATE TABLE IF NOT EXISTS schema_meta (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );
            INSERT OR REPLACE INTO schema_meta(key, value) VALUES ('schema_version', '1');
            CREATE TABLE IF NOT EXISTS nodes (
                id INTEGER PRIMARY KEY,
                parent_id INTEGER REFERENCES nodes(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                relative_path TEXT NOT NULL,
                kind TEXT NOT NULL,
                depth INTEGER NOT NULL,
                size_bytes INTEGER NOT NULL,
                modified_unix_ms INTEGER,
                online_only INTEGER NOT NULL,
                reparse_point INTEGER NOT NULL,
                child_count INTEGER NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_nodes_parent ON nodes(parent_id, name);
            CREATE INDEX IF NOT EXISTS idx_nodes_relative_path ON nodes(relative_path);
            ",
        )
    }

    pub fn replace_nodes(&mut self, nodes: &[NodeDto]) -> Result<()> {
        let transaction = self.connection.transaction()?;
        transaction.execute("DELETE FROM nodes", [])?;
        {
            let mut statement = transaction.prepare(
                "INSERT INTO nodes (
                    id, parent_id, name, relative_path, kind, depth, size_bytes,
                    modified_unix_ms, online_only, reparse_point, child_count
                 ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
            )?;
            for node in nodes {
                statement.execute(params![
                    node.id,
                    node.parent_id,
                    node.name,
                    node.relative_path,
                    node.kind.as_str(),
                    i64::from(node.depth),
                    i64::try_from(node.size_bytes).unwrap_or(i64::MAX),
                    node.modified_unix_ms,
                    node.online_only,
                    node.reparse_point,
                    i64::from(node.child_count),
                ])?;
            }
        }
        transaction.commit()
    }

    pub fn list_nodes(&self, limit: usize, offset: usize) -> Result<Vec<NodeDto>> {
        let bounded_limit = limit.clamp(1, 50_000) as i64;
        let bounded_offset = offset as i64;
        let mut statement = self.connection.prepare(
            "SELECT id, parent_id, name, relative_path, kind, depth, size_bytes,
                    modified_unix_ms, online_only, reparse_point, child_count
             FROM nodes ORDER BY id LIMIT ?1 OFFSET ?2",
        )?;
        let rows = statement.query_map(params![bounded_limit, bounded_offset], |row| {
            let kind: String = row.get(4)?;
            let size: i64 = row.get(6)?;
            Ok(NodeDto {
                id: row.get(0)?,
                parent_id: row.get(1)?,
                name: row.get(2)?,
                relative_path: row.get(3)?,
                kind: NodeKind::from_db(&kind),
                depth: row.get::<_, i64>(5)?.max(0) as u32,
                size_bytes: size.max(0) as u64,
                modified_unix_ms: row.get(7)?,
                online_only: row.get(8)?,
                reparse_point: row.get(9)?,
                child_count: row.get::<_, i64>(10)?.max(0) as u32,
            })
        })?;
        rows.collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::synthetic;
    use std::time::Instant;

    #[test]
    fn round_trips_nodes_and_uses_fixed_sqlite() {
        assert!(
            rusqlite::version_number() >= 3_051_003,
            "bundled SQLite must include the WAL-reset fix"
        );
        let snapshot = synthetic::demo_snapshot(32);
        let mut index = Index::in_memory().expect("index");
        index.replace_nodes(&snapshot.nodes).expect("replace");
        let listed = index.list_nodes(1_000, 0).expect("list");
        assert_eq!(listed.len(), snapshot.nodes.len());
        assert_eq!(listed[0].kind, NodeKind::Root);
    }

    #[test]
    fn measures_synthetic_10k_and_100k_pipeline() {
        for count in [10_000, 100_000] {
            let generation_started = Instant::now();
            let snapshot = synthetic::scale_snapshot(count);
            let generation_ms = generation_started.elapsed().as_millis();

            let indexing_started = Instant::now();
            let mut index = Index::in_memory().expect("index");
            index.replace_nodes(&snapshot.nodes).expect("replace");
            let indexing_ms = indexing_started.elapsed().as_millis();

            let query_started = Instant::now();
            let first_page = index.list_nodes(50_000, 0).expect("first page");
            let second_page = index.list_nodes(50_000, 50_000).expect("second page");
            let query_ms = query_started.elapsed().as_millis();

            assert_eq!(first_page.len() + second_page.len(), count);
            println!(
                "PERF nodes={count} generation_ms={generation_ms} indexing_ms={indexing_ms} query_ms={query_ms}"
            );
        }
    }
}
