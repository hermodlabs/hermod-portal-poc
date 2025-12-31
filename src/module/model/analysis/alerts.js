export function computeAlerts(grid, { low = 66.5, high = 72.5 } = {}) {
  const h = grid.length;
  const w = grid[0].length;

  const lows = [];
  const highs = [];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = grid[y][x];
      if (v < low) lows.push({ x, y, v });
      if (v > high) highs.push({ x, y, v });
    }
  }

  lows.sort((a, b) => a.v - b.v);
  highs.sort((a, b) => b.v - a.v);

  return { low: lows.slice(0, 6), high: highs.slice(0, 4) };
}
