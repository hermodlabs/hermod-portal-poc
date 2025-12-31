// src/module/algorithm/domain/zones/naming.js
export function zoneName(x, y, w, h) {
  const col = x < w / 3 ? "Door-side" : x < (2 * w) / 3 ? "Center" : "Back";
  const row = y < h / 3 ? "Upper" : y < (2 * h) / 3 ? "Middle" : "Lower";
  return `${row} · ${col}`;
}
