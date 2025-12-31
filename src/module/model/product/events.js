import { mulberry32 } from "/src/module/algorithm/core/rng.js";
import { clamp } from "/src/module/algorithm/core/math.js";
import { fmtTime } from "/src/module/algorithm/format/time.js";

/**
 * Build UI-ready synthetic event list (door cycles, etc.)
 */
export function buildEvents({ seed = 11, doorIntensity }) {
  const prng = mulberry32(seed + Math.floor((doorIntensity ?? 0) * 1000));
  const events = [];
  const baseMin = 14 * 60 + 20;

  for (let i = 0; i < 10; i++) {
    const minutesAgo = Math.floor(prng() * 240);
    const when = baseMin - minutesAgo;
    const duration = 10 + Math.floor(prng() * 45);
    const severity = clamp((doorIntensity ?? 0) + (prng() - 0.5) * 0.25, 0, 1);

    events.push({
      id: `evt_${i}`,
      type: "Door cycle",
      when: fmtTime((when + 24 * 60) % (24 * 60)),
      durationSec: duration,
      severity,
      note:
        severity > 0.66 ? "High traffic burst" : severity > 0.33 ? "Normal traffic" : "Light traffic",
    });
  }

  // Note: this sorts by the formatted time string; ok for demo.
  // If you want correctness, store a numeric "whenMin" and sort by it.
  events.sort((a, b) => (a.when < b.when ? 1 : -1));

  return events;
}
