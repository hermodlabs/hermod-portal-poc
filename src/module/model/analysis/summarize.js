export function summarizeGrid(grid) {
  let min = Infinity;
  let max = -Infinity;
  let sum = 0;
  let n = 0;

  for (const row of grid) {
    for (const v of row) {
      if (v < min) min = v;
      if (v > max) max = v;
      sum += v;
      n++;
    }
  }

  return { min, max, avg: sum / n };
}
