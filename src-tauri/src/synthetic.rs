use crate::domain::{CollectionSnapshot, NodeDto, NodeKind, ScanDiagnostic, TerrainPoint};
use std::collections::HashMap;

pub fn demo_snapshot(count: usize) -> CollectionSnapshot {
    scale_snapshot(count.clamp(16, 2_000))
}

pub fn scale_snapshot(count: usize) -> CollectionSnapshot {
    let count = count.max(16);
    let mut nodes = Vec::with_capacity(count);
    nodes.push(NodeDto {
        id: 1,
        parent_id: None,
        name: "FileTopo Demo".to_string(),
        relative_path: String::new(),
        kind: NodeKind::Root,
        depth: 0,
        size_bytes: 0,
        modified_unix_ms: None,
        online_only: false,
        reparse_point: false,
        child_count: 0,
        seen: false,
    });

    let folder_count = 8.min(count.saturating_sub(1));
    for folder in 0..folder_count {
        let id = folder as i64 + 2;
        nodes.push(NodeDto {
            id,
            parent_id: Some(1),
            name: format!("Territoire {:02}", folder + 1),
            relative_path: format!("territoire-{:02}", folder + 1),
            kind: NodeKind::Directory,
            depth: 1,
            size_bytes: 0,
            modified_unix_ms: None,
            online_only: false,
            reparse_point: false,
            child_count: 0,
            seen: false,
        });
    }

    while nodes.len() < count {
        let item = nodes.len();
        let parent = (item % folder_count) as i64 + 2;
        nodes.push(NodeDto {
            id: item as i64 + 1,
            parent_id: Some(parent),
            name: format!("document-{:04}.md", item),
            relative_path: format!(
                "territoire-{:02}/document-{:04}.md",
                (item % folder_count) + 1,
                item
            ),
            kind: NodeKind::File,
            depth: 2,
            size_bytes: 512 + ((item * 97) % 65_536) as u64,
            modified_unix_ms: None,
            online_only: item % 23 == 0,
            reparse_point: false,
            child_count: 0,
            seen: false,
        });
    }

    update_child_counts(&mut nodes);
    snapshot_from_nodes("demo-local", "Démonstration locale", nodes, Vec::new())
}

pub fn snapshot_from_nodes(
    collection_id: &str,
    name: &str,
    nodes: Vec<NodeDto>,
    diagnostics: Vec<ScanDiagnostic>,
) -> CollectionSnapshot {
    let total_size_bytes = nodes.iter().map(|node| node.size_bytes).sum();
    let terrain = nodes
        .iter()
        .filter(|node| node.kind != NodeKind::Root)
        .take(2_000)
        .enumerate()
        .map(|(index, node)| {
            let angle = index as f32 * 2.399_963_1;
            let spread = 22.0 + (index as f32).sqrt() * 24.0;
            let elevation = ((node.child_count as f32 + 1.0).ln() * 0.32
                + ((node.id % 17) as f32 / 17.0) * 0.48
                + ((node.size_bytes + 1) as f32).ln() / 80.0)
                .clamp(0.08, 1.0);
            TerrainPoint {
                node_id: node.id,
                x: 480.0 + angle.cos() * spread,
                y: 330.0 + angle.sin() * spread * 0.68,
                radius: 5.0 + elevation * 20.0,
                elevation,
                label: node.name.clone(),
                kind: node.kind,
            }
        })
        .collect::<Vec<_>>();

    CollectionSnapshot {
        collection_id: collection_id.to_string(),
        name: name.to_string(),
        node_count: nodes.len(),
        total_size_bytes,
        diagnostics,
        nodes,
        terrain,
    }
}

fn update_child_counts(nodes: &mut [NodeDto]) {
    let mut counts = HashMap::<i64, u32>::new();
    for node in nodes.iter() {
        if let Some(parent_id) = node.parent_id {
            *counts.entry(parent_id).or_default() += 1;
        }
    }
    for node in nodes {
        node.child_count = counts.get(&node.id).copied().unwrap_or_default();
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn generator_is_bounded_and_deterministic() {
        let first = demo_snapshot(100);
        let second = demo_snapshot(100);
        assert_eq!(first, second);
        assert_eq!(first.node_count, 100);
        assert!(first.terrain.len() < first.node_count);
    }
}
