// src/data/simulator/events.js
import { mulberry32 } from "./rng.js";
import { clamp } from "../../lib/utils.js";
import { fmtTime } from "../../lib/utils.js";
import { DEMO_NOW_MIN } from "../../lib/constants.js";

/**
 * Simulated door-cycle event stream.
 * In a real system, this could be:
 * - Door sensor events
 * - POS traffic bursts (proxy)
 * - Staff “door open” logs
 */
export function buildEvents({
  seed = 11,
  doorIntensity = 0.55,
  count = 10,
  lookbackMin = 240, // last 4 hours
  nowMin = DEMO_NOW_MIN,
} = {}) {
  const prng = mulberry32(seed + Math.floor(doorIntensity * 1000));
  const events = [];

  for (let i = 0; i < count; i++) {
    const minutesAgo = Math.floor(prng() * lookbackMin);
    const when = nowMin - minutesAgo;
    const durationSec = 10 + Math.floor(prng() * 45);

    const severity = clamp(doorIntensity + (prng() - 0.5) * 0.25, 0, 1);
    const note =
      severity > 0.66 ? "High traffic burst" : severity > 0.33 ? "Normal traffic" : "Light traffic";

    events.push({
      id: `evt_${i}`,
      type: "Door cycle",
      when: fmtTime((when + 24 * 60) % (24 * 60)),
      durationSec,
      severity,
      note,
    });
  }

  // Sort descending by displayed time label (good enough for POC)
  events.sort((a, b) => (a.when < b.when ? 1 : -1));
  return events;
}
