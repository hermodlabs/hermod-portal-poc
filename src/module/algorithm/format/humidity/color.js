// src/module/algorithm/domain/humidity/color.js
import { clamp } from "/src/module/algorithm/core/math.js";

export function humidityColor(h) {
  const t = clamp((h - 62) / 12, 0, 1);
  return `rgba(56, 189, 248, ${0.12 + 0.32 * t})`;
}
