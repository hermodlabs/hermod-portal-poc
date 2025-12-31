import { fmtTime } from "/src/module/algorithm/format/time.js";
import { simulateField } from "/src/module/model/sim/field.js";
import { summarizeGrid } from "/src/module/model/analysis/summarize.js";

/**
 * Build UI-ready timeseries for a given z slice and knobs.
 * Orchestrates simulateField + summarizeGrid.
 */
export function buildTimeseries({ points = 48, seed = 11, z, doorIntensity, fanMix }) {
  const out = [];
  const now = 14 * 60 + 20; // demo "current time" in minutes

  for (let i = points - 1; i >= 0; i--) {
    const tMin = now - i * 10;

    const { grid } = simulateField({
      w: 20,
      h: 12,
      z,
      tMin,
      doorIntensity,
      fanMix,
      seed,
    });

    const s = summarizeGrid(grid);
    out.push({
      t: fmtTime((tMin + 24 * 60) % (24 * 60)),
      avg: +s.avg.toFixed(2),
      min: +s.min.toFixed(2),
      max: +s.max.toFixed(2),
    });
  }

  return out;
}
