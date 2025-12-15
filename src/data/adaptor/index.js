// src/data/adapters/index.js
import { GRID, THRESHOLDS } from "../../lib/constants.js";
import { simulateField } from "../simulator/fieldModel.js";
import { summarizeGrid, computeAlerts } from "../simulator/summarize.js";
import { buildTimeseries } from "../simulator/timeseries.js";
import { buildEvents } from "../simulator/events.js";

/**
 * Get room data for the portal.
 * Today: simulator.
 * Later: replace this module with API-backed functions.
 */
export function getRoomData({
  seed = 11,
  w = GRID.W,
  h = GRID.H,
  z = 0.55,
  tMin = 14 * 60 + 20,
  doorIntensity = 0.55,
  fanMix = 0.55,
  thresholds = THRESHOLDS,
} = {}) {
  const { grid, door, doorPulse } = simulateField({
    w,
    h,
    z,
    tMin,
    doorIntensity,
    fanMix,
    seed,
  });

  const summary = summarizeGrid(grid);
  const alerts = computeAlerts(grid, { low: thresholds.LOW_RH, high: thresholds.HIGH_RH });

  const timeseries = buildTimeseries({
    seed,
    z,
    doorIntensity,
    fanMix,
    w,
    h,
  });

  const events = buildEvents({
    seed,
    doorIntensity,
  });

  return {
    w,
    h,
    grid,
    door,
    doorPulse,
    summary,
    alerts,
    timeseries,
    events,
  };
}
