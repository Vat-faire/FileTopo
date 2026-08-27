use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum NodeKind {
    Root,
    Directory,
    File,
    Skipped,
}

impl NodeKind {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Root => "root",
            Self::Directory => "directory",
            Self::File => "file",
            Self::Skipped => "skipped",
        }
    }

    pub fn from_db(value: &str) -> Self {
        match value {
            "root" => Self::Root,
            "directory" => Self::Directory,
            "file" => Self::File,
            _ => Self::Skipped,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NodeDto {
    pub id: i64,
    pub parent_id: Option<i64>,
    pub name: String,
    pub relative_path: String,
    pub kind: NodeKind,
    pub depth: u32,
    pub size_bytes: u64,
    pub modified_unix_ms: Option<i64>,
    pub online_only: bool,
    pub reparse_point: bool,
    pub child_count: u32,
    pub seen: bool,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScanDiagnostic {
    pub code: String,
    pub relative_path: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TerrainPoint {
    pub node_id: i64,
    pub x: f32,
    pub y: f32,
    pub radius: f32,
    pub elevation: f32,
    pub label: String,
    pub kind: NodeKind,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CollectionSnapshot {
    pub collection_id: String,
    pub name: String,
    pub node_count: usize,
    pub total_size_bytes: u64,
    pub diagnostics: Vec<ScanDiagnostic>,
    pub nodes: Vec<NodeDto>,
    pub terrain: Vec<TerrainPoint>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppHealth {
    pub app_version: String,
    pub sqlite_version: String,
    pub mode: String,
    /// True only in development builds. The synthetic fixture is a developer
    /// aid; a release binary must not know where the repository lives.
    pub synthetic_fixture_available: bool,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CollectionSummary {
    pub id: String,
    pub name: String,
    pub root_label: String,
    pub color: String,
    pub node_count: usize,
    pub total_size_bytes: u64,
    pub created_unix_ms: i64,
    pub last_indexed_unix_ms: Option<i64>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct IndexProgress {
    pub collection_id: String,
    pub visited_nodes: usize,
    pub status: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NodePage {
    pub items: Vec<NodeDto>,
    pub total: usize,
    pub limit: usize,
    pub offset: usize,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NodeQueryRequest {
    pub collection_id: String,
    pub query: String,
    pub kind: Option<String>,
    pub online_only: Option<bool>,
    pub unseen_only: bool,
    pub limit: usize,
    pub offset: usize,
}
