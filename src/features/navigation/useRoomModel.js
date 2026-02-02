import { useMemo } from "react";
import { getRoomData } from "src/data/adapters/index.js";
import { DEFAULT_CONTROLS, THRESHOLDS } from "../../lib/constants.js";
import { fmtTime } from "../../lib/utils.js";
import { zoneName as zoneNameSim } from "../../data/simulator/fieldModel.js";

/**
 * Central hook: pages consume this, not the simulator directly.
 * Later: swap getRoomData() to API-backed data without rewriting pages.
 */
export function useRoomModel({
  session,
  controls = DEFAULT_CONTROLS,
  seed = 11,
  thresholds = THRESHOLDS,
} = {}) {
  return useMemo(() => {
    if (!session) return null;

    const data = getRoomData({
      seed,
      z: controls.z,
      tMin: controls.tMin,
      doorIntensity: controls.doorIntensity,
      fanMix: controls.fanMix,
      thresholds,
    });

    return {
      ...data,
      tenant: session.tenant,
      roomName: session.roomName,
      nowLabel: fmtTime(controls.tMin),
      thresholds,
      zoneLabel: (x, y) => zoneNameSim(x, y, data.w, data.h),
    };
  }, [session, controls, seed, thresholds]);
}
