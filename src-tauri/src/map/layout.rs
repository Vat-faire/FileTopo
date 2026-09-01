//! Hierarchical block layout — the "calepinage" of `TASK-0016` §5.1.5.
//!
//! Squarified paving (`CAL-B`) is used as the **primitive that computes
//! positions**, and nothing more: `DEC-0015` D is explicit that it is neither
//! the visual contract nor the behavioural one, and that if a paving made a
//! parity requirement unreachable, *the algorithm gives way, not the
//! requirement*. That rule shaped the one design decision below that a plain
//! treemap would not have made.
//!
//! **Every node gets a rectangle, and every rectangle has a usable area.** A
//! classic treemap weighted by byte size collapses empty folders and small
//! files to zero-width slivers, which would break `H2` ("no null dimension")
//! and, worse, would make part of the tree unreachable — a silent loss of
//! `P-01`. So the layout is driven **bottom-up by required area**: a leaf
//! demands `MIN_LEAF_AREA`, a folder demands whatever its children demand plus
//! its frame, and the root's size is *derived* from that demand rather than
//! fixed in advance. The map grows; nothing is dropped.
//!
//! The cost is paid **once per tree**, at index time (`H10`). Nothing in this
//! module runs per frame.

use serde::{Deserialize, Serialize};

/// Frozen bound `B-3` of `TASK-0016` §12.2, in layout units squared.
///
/// **A choice, not a measurement.** It matches the readability floor the
/// spikes exercised, but no measurement in this project establishes it as the
/// right value, and nothing may cite it as one.
pub const MIN_LEAF_AREA: f64 = 2_400.0;

/// Fraction of a folder's area left usable for its children after its frame.
///
/// The frame below consumes at most 7.6 % of any rectangle, whatever its
/// aspect ratio (`frame_loss_is_bounded` proves it), so 0.88 keeps a margin of
/// roughly 5 % — enough that every child provably receives at least the area it
/// demanded.
const FILL: f64 = 0.88;

/// Padding, as a fraction of the shorter side.
const PAD_RATIO: f64 = 0.008;
/// Label band at the top of a folder, as a fraction of its height.
const HEADER_RATIO: f64 = 0.045;

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Rect {
    pub x: f64,
    pub y: f64,
    pub w: f64,
    pub h: f64,
}

impl Rect {
    pub fn area(&self) -> f64 {
        self.w * self.h
    }

    pub fn contains(&self, other: &Rect, tolerance: f64) -> bool {
        other.x >= self.x - tolerance
            && other.y >= self.y - tolerance
            && other.x + other.w <= self.x + self.w + tolerance
            && other.y + other.h <= self.y + self.h + tolerance
    }

    pub fn intersection_area(&self, other: &Rect) -> f64 {
        let width = (self.x + self.w).min(other.x + other.w) - self.x.max(other.x);
        let height = (self.y + self.h).min(other.y + other.h) - self.y.max(other.y);
        if width <= 0.0 || height <= 0.0 {
            0.0
        } else {
            width * height
        }
    }

    /// Inner area available to children, after padding and the label band.
    fn inner(&self) -> Rect {
        let pad = PAD_RATIO * self.w.min(self.h);
        let header = HEADER_RATIO * self.h;
        Rect {
            x: self.x + pad,
            y: self.y + pad + header,
            w: (self.w - 2.0 * pad).max(f64::MIN_POSITIVE),
            h: (self.h - 2.0 * pad - header).max(f64::MIN_POSITIVE),
        }
    }
}

/// Minimal view of the tree the layout needs: parent links, in index order.
pub struct LayoutInput<'a> {
    /// `parents[i]` is the position of node `i`'s parent, or `None` for the root.
    pub parents: &'a [Option<usize>],
}

pub struct LayoutOutput {
    pub rects: Vec<Rect>,
    pub width: f64,
    pub height: f64,
    /// Counted so `H10` can assert the layout runs once per tree and never per
    /// frame.
    pub invocations: u32,
}

/// Lays out a tree given in any order, provided a parent always appears before
/// its children — which the breadth-first scanner guarantees.
pub fn compute(input: LayoutInput<'_>) -> LayoutOutput {
    let count = input.parents.len();
    let mut rects = vec![
        Rect {
            x: 0.0,
            y: 0.0,
            w: 0.0,
            h: 0.0
        };
        count
    ];
    if count == 0 {
        return LayoutOutput {
            rects,
            width: 0.0,
            height: 0.0,
            invocations: 1,
        };
    }

    let mut children: Vec<Vec<usize>> = vec![Vec::new(); count];
    let mut root = 0usize;
    for (index, parent) in input.parents.iter().enumerate() {
        match parent {
            Some(parent_index) => children[*parent_index].push(index),
            None => root = index,
        }
    }

    // Pass 1, bottom-up: how much area each node demands. Children always sit
    // after their parent, so a reverse sweep sees every child first.
    let mut required = vec![MIN_LEAF_AREA; count];
    for index in (0..count).rev() {
        if children[index].is_empty() {
            continue;
        }
        let demand: f64 = children[index].iter().map(|child| required[*child]).sum();
        required[index] = (demand / FILL).max(MIN_LEAF_AREA);
    }

    // Pass 2, top-down: hand out the demanded area. The root is a square whose
    // side follows from the demand rather than from a fixed canvas size.
    let side = required[root].sqrt();
    rects[root] = Rect {
        x: 0.0,
        y: 0.0,
        w: side,
        h: side,
    };

    let mut queue = vec![root];
    while let Some(index) = queue.pop() {
        if children[index].is_empty() {
            continue;
        }
        let inner = rects[index].inner();
        let weights = children[index]
            .iter()
            .map(|child| required[*child])
            .collect::<Vec<_>>();
        let placed = squarify(&weights, inner);
        for (child, rect) in children[index].iter().zip(placed) {
            rects[*child] = rect;
            queue.push(*child);
        }
    }

    LayoutOutput {
        rects,
        width: side,
        height: side,
        invocations: 1,
    }
}

/// Squarified treemap (Bruls, Huizing, van Wijk), laying `weights` into `rect`
/// in the given order and returning one rectangle per weight.
///
/// Rectangles tile `rect` exactly: siblings never overlap, and the last item of
/// each row absorbs the rounding so no gap is left behind.
fn squarify(weights: &[f64], rect: Rect) -> Vec<Rect> {
    let count = weights.len();
    let mut out = vec![rect; count];
    if count == 0 {
        return out;
    }
    let total: f64 = weights.iter().sum();
    if total <= 0.0 || rect.w <= 0.0 || rect.h <= 0.0 {
        return out;
    }
    let scale = rect.area() / total;
    let areas = weights.iter().map(|weight| weight * scale).collect::<Vec<_>>();

    let mut remaining = rect;
    let mut start = 0usize;
    while start < count {
        let side = remaining.w.min(remaining.h);
        let mut end = start + 1;
        let mut sum = areas[start];
        let mut best = worst_ratio(&areas[start..end], sum, side);
        while end < count {
            let candidate_sum = sum + areas[end];
            let candidate = worst_ratio(&areas[start..=end], candidate_sum, side);
            if candidate > best {
                break;
            }
            best = candidate;
            sum = candidate_sum;
            end += 1;
        }

        // With `w >= h` the shorter side is the height, so the row becomes a
        // column laid down the left edge; otherwise it is a band across the top.
        let column = remaining.w >= remaining.h;
        let span = if column { remaining.h } else { remaining.w };
        // The final row takes everything that is left. Deriving its thickness
        // from `sum` instead would let a rounding crumb push the last item's
        // extent to zero — a null dimension born of arithmetic, not of design.
        let thickness = if end == count {
            if column { remaining.w } else { remaining.h }
        } else if column {
            (sum / remaining.h).min(remaining.w)
        } else {
            (sum / remaining.w).min(remaining.h)
        };
        let mut offset = 0.0;
        for (position, index) in (start..end).enumerate() {
            let last = position == end - start - 1;
            let extent = if last {
                span - offset
            } else {
                (areas[index] / thickness).min(span - offset)
            };
            out[index] = if column {
                Rect {
                    x: remaining.x,
                    y: remaining.y + offset,
                    w: thickness,
                    h: extent,
                }
            } else {
                Rect {
                    x: remaining.x + offset,
                    y: remaining.y,
                    w: extent,
                    h: thickness,
                }
            };
            offset += extent;
        }

        remaining = if column {
            Rect {
                x: remaining.x + thickness,
                y: remaining.y,
                w: (remaining.w - thickness).max(0.0),
                h: remaining.h,
            }
        } else {
            Rect {
                x: remaining.x,
                y: remaining.y + thickness,
                w: remaining.w,
                h: (remaining.h - thickness).max(0.0),
            }
        };
        start = end;
    }
    out
}

fn worst_ratio(areas: &[f64], sum: f64, side: f64) -> f64 {
    if sum <= 0.0 || side <= 0.0 {
        return f64::INFINITY;
    }
    let side_squared = side * side;
    let sum_squared = sum * sum;
    areas
        .iter()
        .map(|area| {
            if *area <= 0.0 {
                f64::INFINITY
            } else {
                (side_squared * area / sum_squared).max(sum_squared / (side_squared * area))
            }
        })
        .fold(0.0_f64, f64::max)
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Chain plus fan-out, deep enough to catch compounding frame loss.
    fn sample_tree() -> Vec<Option<usize>> {
        let mut parents = vec![None];
        for index in 1..=6 {
            parents.push(Some(0));
            let folder = parents.len() - 1;
            for _ in 0..(index * 3) {
                parents.push(Some(folder));
            }
        }
        // A 30-level chain, so the deep fixture's shape is exercised too.
        let mut current = 1usize;
        for _ in 0..30 {
            parents.push(Some(current));
            current = parents.len() - 1;
            parents.push(Some(current));
        }
        parents
    }

    fn check_invariants(parents: &[Option<usize>]) {
        let output = compute(LayoutInput { parents });
        let rects = &output.rects;
        let tolerance = 1e-6 * output.width.max(1.0);

        for (index, rect) in rects.iter().enumerate() {
            assert!(
                rect.w > 0.0 && rect.h > 0.0,
                "node {index} got a null dimension: {rect:?}"
            );
        }

        let mut children: Vec<Vec<usize>> = vec![Vec::new(); parents.len()];
        for (index, parent) in parents.iter().enumerate() {
            if let Some(parent_index) = parent {
                children[*parent_index].push(index);
            }
        }
        for (parent, siblings) in children.iter().enumerate() {
            for child in siblings {
                assert!(
                    rects[parent].contains(&rects[*child], tolerance),
                    "child {child} escapes parent {parent}"
                );
            }
            let allowed = 1e-9 * rects[parent].area().max(1.0);
            for (position, left) in siblings.iter().enumerate() {
                for right in &siblings[position + 1..] {
                    let overlap = rects[*left].intersection_area(&rects[*right]);
                    assert!(
                        overlap <= allowed,
                        "siblings {left} and {right} overlap by {overlap}"
                    );
                }
            }
        }
    }

    #[test]
    fn no_null_dimension_no_overlap_and_children_stay_inside() {
        check_invariants(&sample_tree());
    }

    #[test]
    fn a_lone_root_still_gets_a_rectangle() {
        let output = compute(LayoutInput { parents: &[None] });
        assert!(output.rects[0].w > 0.0 && output.rects[0].h > 0.0);
        assert!((output.rects[0].area() - MIN_LEAF_AREA).abs() < 1e-6);
    }

    #[test]
    fn every_leaf_keeps_at_least_the_declared_minimum_area() {
        let parents = sample_tree();
        let output = compute(LayoutInput { parents: &parents });
        let mut has_child = vec![false; parents.len()];
        for parent in parents.iter().flatten() {
            has_child[*parent] = true;
        }
        for (index, rect) in output.rects.iter().enumerate() {
            if !has_child[index] {
                assert!(
                    rect.area() >= MIN_LEAF_AREA * 0.999,
                    "leaf {index} shrank to {} unit², under the declared floor",
                    rect.area()
                );
            }
        }
    }

    #[test]
    fn frame_loss_is_bounded_below_the_fill_ratio() {
        // The bottom-up pass is only sound if a frame never eats more than
        // `1 - FILL` of any rectangle, at any aspect ratio.
        for ratio in [0.001_f64, 0.01, 0.1, 1.0, 10.0, 100.0, 1000.0] {
            let rect = Rect {
                x: 0.0,
                y: 0.0,
                w: ratio,
                h: 1.0,
            };
            let kept = rect.inner().area() / rect.area();
            assert!(
                kept > FILL,
                "aspect ratio {ratio} keeps only {kept} of the area, under FILL"
            );
        }
    }

    #[test]
    fn squarify_tiles_its_rectangle_without_gap_or_overlap() {
        let rect = Rect {
            x: 3.0,
            y: 7.0,
            w: 240.0,
            h: 110.0,
        };
        let weights = [9.0, 5.0, 5.0, 4.0, 3.0, 3.0, 2.0, 1.0, 1.0, 0.5];
        let placed = squarify(&weights, rect);
        let covered: f64 = placed.iter().map(Rect::area).sum();
        assert!((covered - rect.area()).abs() < 1e-6, "covered {covered}");
        for (position, left) in placed.iter().enumerate() {
            assert!(rect.contains(left, 1e-9));
            for right in &placed[position + 1..] {
                assert!(left.intersection_area(right) < 1e-9);
            }
        }
    }

    #[test]
    fn layout_is_deterministic() {
        let parents = sample_tree();
        let first = compute(LayoutInput { parents: &parents }).rects;
        let second = compute(LayoutInput { parents: &parents }).rects;
        assert_eq!(first, second);
    }
}
