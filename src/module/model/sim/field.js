import { mulberry32 } from "/src/module/algorithm/core/rng.js";
import { clamp, lerp } from "/src/module/algorithm/core/math.js";
import { defaultFieldSimParams, normalizeFieldSimParams } from "./params.js";

/**
 * Simulated humidity/field generator.
 * Returns a grid (h rows × w cols), a door point, and a doorPulse scalar in [0,1].
 */
export function simulateField(params) {
  const { base, clampMin, clampMax } = defaultFieldSimParams;
  const { w, h, z, tMin, doorIntensity, fanMix, seed } = normalizeFieldSimParams(params);

  const prng = mulberry32(seed + Math.floor(tMin * 17) + Math.floor(z * 100));
  const vertical = lerp(-0.9, 0.9, z);

  const door = { x: 1, y: Math.floor(h * 0.45) };
  const doorStrength = 1.0 + 2.6 * doorIntensity;

  // doorPulse: half-wave-ish pulse that rises/falls with time
  const phase = (tMin / 9) % 1;
  const doorPulse = Math.max(0, Math.sin(phase * Math.PI));

  // fanMix: how strongly we “pull” toward the base (smoothing/mixing)
  const mix = lerp(0.88, 0.52, fanMix);

  const pockets = [
    { x: Math.floor(w * 0.72), y: Math.floor(h * 0.28), r: 3.7, bias: -1.5 },
    { x: Math.floor(w * 0.66), y: Math.floor(h * 0.78), r: 4.4, bias: +1.1 },
  ];

  const grid = Array.from({ length: h }, (_, y) =>
    Array.from({ length: w }, (_, x) => {
      const gx = (x / (w - 1) - 0.5) * 0.8;
      const gy = (y / (h - 1) - 0.5) * 0.45;

      // start from a base plane with a vertical gradient + mild spatial tilt
      let v = base + vertical + gx + gy;

      // add “pockets” (local Gaussian bumps/dips)
      for (const p of pockets) {
        const dx = x - p.x;
        const dy = y - p.y;
        const d2 = dx * dx + dy * dy;
        const k = Math.exp(-d2 / (2 * p.r * p.r));
        v += p.bias * k;
      }

      // door corridor: a wavy centerline + decay with distance from the door
      const yCenter = door.y + Math.round(Math.sin((x / w) * 3 + z * 2 + tMin / 37) * 2);
      const corridor = Math.exp(-Math.pow((y - yCenter) / 2.2, 2));
      const dist = Math.sqrt((x - door.x) ** 2 + (y - door.y) ** 2);
      const decay = Math.exp(-dist / 7.5);
      v += -doorStrength * doorPulse * corridor * decay;

      // noise, then “mix” toward base
      v += (prng() - 0.5) * 0.35;
      v = base + (v - base) * mix;

      return clamp(v, clampMin, clampMax);
    })
  );

  return { grid, door, doorPulse };
}
