// src/data/simulator/fieldModel.js
import { mulberry32 } from "./rng.js";
import { clamp, lerp } from "../../lib/utils.js";

/**
 * Map RH to a subtle accent wash (used by FieldGrid).
 * Keep it UI-safe: returns a CSS rgba() string.
 */
export function humidityColor(h) {
  // ~62..74 -> alpha 0.12..0.44
  const t = clamp((h - 62) / 12, 0, 1);
  return `rgba(56, 189, 248, ${0.12 + 0.32 * t})`;
}

export function zoneName(x, y, w, h) {
  const col = x < w / 3 ? "Door-side" : x < (2 * w) / 3 ? "Center" : "Back";
  const row = y < h / 3 ? "Upper" : y < (2 * h) / 3 ? "Middle" : "Lower";
  return `${row} · ${col}`;
}

/**
 * Simulate a 2D slice of a 3D humidity field H(x,y,z,t).
 * Inputs:
 * - w,h: grid size
 * - z: 0..1 (floor..ceiling)
 * - tMin: minutes since midnight
 * - doorIntensity: 0..1
 * - fanMix: 0..1 (more = more mixing, less gradient)
 * - seed: deterministic demo seed
 */
export function simulateField({ w, h, z, tMin, doorIntensity, fanMix, seed = 11 }) {
  const prng = mulberry32(seed + Math.floor(tMin * 17) + Math.floor(z * 100));

  const base = 69.5;               // target room average
  const vertical = lerp(-0.9, 0.9, z);

  // Door location (left edge) and a time-varying impulse
  const door = { x: 1, y: Math.floor(h * 0.45) };
  const doorStrength = 1.0 + 2.6 * doorIntensity;
  const phase = (tMin / 9) % 1; // impulses every ~9 min
  const doorPulse = Math.max(0, Math.sin(phase * Math.PI));

  // Mixing reduces extremes
  const mix = lerp(0.88, 0.52, fanMix);

  // Persistent pockets (dead-air zones / localized bias)
  const pockets = [
    { x: Math.floor(w * 0.72), y: Math.floor(h * 0.28), r: 3.7, bias: -1.5 },
    { x: Math.floor(w * 0.66), y: Math.floor(h * 0.78), r: 4.4, bias: +1.1 },
  ];

  const grid = Array.from({ length: h }, (_, y) =>
    Array.from({ length: w }, (_, x) => {
      // gentle global gradients
      const gx = (x / (w - 1) - 0.5) * 0.8;
      const gy = (y / (h - 1) - 0.5) * 0.45;

      let v = base + vertical + gx + gy;

      // pockets
      for (const p of pockets) {
        const dx = x - p.x;
        const dy = y - p.y;
        const d2 = dx * dx + dy * dy;
        const k = Math.exp(-d2 / (2 * p.r * p.r));
        v += p.bias * k;
      }

      // door drift corridor
      const yCenter =
        door.y + Math.round(Math.sin((x / w) * 3 + z * 2 + tMin / 37) * 2);
      const corridor = Math.exp(-Math.pow((y - yCenter) / 2.2, 2));

      const dist = Math.sqrt((x - door.x) ** 2 + (y - door.y) ** 2);
      const decay = Math.exp(-dist / 7.5);

      v += -doorStrength * doorPulse * corridor * decay;

      // small local texture
      v += (prng() - 0.5) * 0.35;

      // mixing pulls toward base
      v = base + (v - base) * mix;

      return clamp(v, 60, 76);
    })
  );

  return { grid, door, doorPulse };
}
