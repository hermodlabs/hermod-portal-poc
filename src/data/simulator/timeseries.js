// src/data/simulator/timeseries.js
import { simulateField } from "./fieldModel.js";
import { summarizeGrid } from "./summarize.js";
import { fmtTime } from "../../lib/utils.js";
import { GRID, DEMO_NOW_MIN } from "../../lib/constants.js";

/**
 * Produce time series for charts (avg/min/max) over the last N points.
 * Default: last 8 hours at 10-minute increments.
 */
export function buildTimeseries({
  points = 48,
  stepMin = 10,
  nowMin = DEMO_NOW_MIN,
  seed = 11,
  z = 0.55,
  doorIntensity = 0.55,
  fanMix = 0.55,
  w = GRID.W,
  h = GRID.H,
} = {}) {
  const out = [];

  for (let i = points - 1; i >= 0; i--) {
    const tMin = nowMin - i * stepMin;
    const { grid } = simulateField({ w, h, z, tMin, doorIntensity, fanMix, seed });
    const s = summarizeGrid(grid);

    out.push({
      t: fmtTime((tMin + 24 * 60) % (24 * 60)),
      avg: Number(s.avg.toFixed(2)),
      min: Number(s.min.toFixed(2)),
      max: Number(s.max.toFixed(2)),
    });
  }

  return out;
}
