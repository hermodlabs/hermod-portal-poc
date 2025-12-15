// src/data/simulator/summarize.js

export function summarizeGrid(grid) {
  let min = Infinity;
  let max = -Infinity;
  let sum = 0;
  let n = 0;

  for (const row of grid) {
    for (const v of row) {
      min = Math.min(min, v);
      max = Math.max(max, v);
      sum += v;
      n++;
    }
  }

  return { min, max, avg: sum / Math.max(1, n) };
}

/**
 * Identify “zones” that violate thresholds.
 * Returns small lists for UI (top offenders).
 */
export function computeAlerts(grid, { low = 66.5, high = 72.5, lowTop = 6, highTop = 4 } = {}) {
  const h = grid.length;
  const w = grid[0]?.length ?? 0;

  const lows = [];
  const highs = [];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = grid[y][x];
      if (v < low) lows.push({ x, y, v });
      if (v > high) highs.push({ x, y, v });
    }
  }

  lows.sort((a, b) => a.v - b.v);  // driest first
  highs.sort((a, b) => b.v - a.v); // wettest first

  return {
    low: lows.slice(0, lowTop),
    high: highs.slice(0, highTop),
  };
}
