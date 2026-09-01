/**
 * The `H9` measurement harness: frame times and selection latency, inside the
 * real engine.
 *
 * `H9` sets **no frames-per-second target**. Success is obtaining the numbers
 * honestly and publishing them without favourable selection — every run counts,
 * and the worst is reported beside the median. Nothing here filters, discards a
 * run, or smooths a curve.
 *
 * What is actually measured, stated plainly so nobody has to infer it:
 *
 * * **frame time** — the interval between two consecutive animation-frame
 *   callbacks while a scripted pan-and-zoom drives the map. It includes the
 *   React commit and whatever the engine schedules around it. It is *not* a
 *   paint timer.
 * * **selection latency** — from the moment a selection is requested to the
 *   start of the frame following the one that paints it, measured with two
 *   chained animation frames.
 */

export interface Stat {
  count: number;
  median: number;
  min: number;
  max: number;
  mean: number;
}

export interface RunSample {
  run: number;
  frameTimesMs: number[];
  selectionLatenciesMs: number[];
}

export interface FixtureMeasurement {
  fixtureId: string;
  nodeCount: number;
  runs: RunSample[];
  frameTime: Stat;
  selectionLatency: Stat;
  /** Slowest single frame across every run — the value `H9` refuses to hide. */
  worstFrameMs: number;
  worstSelectionMs: number;
}

export function summarize(values: number[]): Stat {
  if (values.length === 0) return { count: 0, median: 0, min: 0, max: 0, mean: 0 };
  const sorted = [...values].sort((a, b) => a - b);
  const middle = sorted.length >> 1;
  const median =
    sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
  const total = sorted.reduce((sum, value) => sum + value, 0);
  return {
    count: sorted.length,
    median,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    mean: total / sorted.length,
  };
}

export function aggregate(
  fixtureId: string,
  nodeCount: number,
  runs: RunSample[],
): FixtureMeasurement {
  const frames = runs.flatMap((run) => run.frameTimesMs);
  const selections = runs.flatMap((run) => run.selectionLatenciesMs);
  return {
    fixtureId,
    nodeCount,
    runs,
    frameTime: summarize(frames),
    selectionLatency: summarize(selections),
    worstFrameMs: frames.length ? Math.max(...frames) : 0,
    worstSelectionMs: selections.length ? Math.max(...selections) : 0,
  };
}

export function nextFrame(): Promise<number> {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

/** Resolves once the frame following the current one has begun. */
export async function afterPaint(): Promise<number> {
  await nextFrame();
  return nextFrame();
}

/** Frozen shape of a run, so the five repetitions exercise the same path. */
export const FRAMES_PER_RUN = 150;
export const WARMUP_FRAMES = 12;
export const SELECTIONS_PER_RUN = 12;
export const RUNS_PER_FIXTURE = 5;

/**
 * Scripted view motion, identical on every run and every fixture.
 *
 * Deterministic on purpose: five runs that each wander differently would not be
 * five measurements of the same thing.
 */
export function scriptedStep(frame: number): { zoom: number; dx: number; dy: number } {
  const phase = (frame / FRAMES_PER_RUN) * Math.PI * 2;
  return {
    zoom: 1 + 0.02 * Math.sin(phase * 3),
    dx: 7 * Math.cos(phase),
    dy: 5 * Math.sin(phase * 2),
  };
}

/** Deterministic spread of selection targets across the tree. */
export function selectionTargets(nodeIds: number[], count: number): number[] {
  if (nodeIds.length === 0) return [];
  const stride = Math.max(1, Math.floor(nodeIds.length / count));
  const targets: number[] = [];
  for (let index = 0; targets.length < count && index < nodeIds.length; index += stride) {
    targets.push(nodeIds[index]);
  }
  return targets;
}
