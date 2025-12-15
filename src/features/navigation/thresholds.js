import { THRESHOLDS } from "../../lib/constants.js";

export const DEFAULT_THRESHOLDS = THRESHOLDS;

/**
 * Small helper to categorize “room health” from alert counts.
 * Use this for Dashboard chips/tiles.
 */
export function healthToneFromAlerts(alerts) {
  const nLow = alerts?.low?.length ?? 0;
  if (nLow === 0) return "ok";
  if (nLow <= 3) return "warn";
  return "bad";
}
