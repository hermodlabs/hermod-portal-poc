export const defaultFieldSimParams = {
  base: 69.5,
  clampMin: 60,
  clampMax: 76,
};

export function normalizeFieldSimParams(p) {
  // Keeps callers flexible while making sim/field.js assume everything is present.
  return {
    ...p,
    doorIntensity: p.doorIntensity ?? 0.5,
    fanMix: p.fanMix ?? 0.5,
    seed: p.seed ?? 11,
  };
}
