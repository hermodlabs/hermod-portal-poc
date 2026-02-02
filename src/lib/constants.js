// src/lib/constants.js

// Demo grid size used by the simulator + field view
export const GRID = Object.freeze({
  W: 20,
  H: 12,
});

// Default thresholds (match your POC UI)
export const THRESHOLDS = Object.freeze({
  LOW_RH: 66.5,
  HIGH_RH: 72.5,
});

// Default “now” time for stable demos (minutes since midnight)
export const DEMO_NOW_MIN = 14 * 60 + 20;

// Default control knobs for the simulator
export const DEFAULT_CONTROLS = Object.freeze({
  z: 0.55, // slice height 0..1
  tMin: DEMO_NOW_MIN,
  doorIntensity: 0.55, // 0..1
  fanMix: 0.55, // 0..1
});

// Keys only — icons belong in features/navigation/navConfig.js
export const NAV_KEYS = Object.freeze({
  DASHBOARD: "dashboard",
  MAP: "map",
  TRENDS: "trends",
  EVENTS: "events",
  SETTINGS: "settings",
});

export const NAV_ORDER = Object.freeze([
  NAV_KEYS.DASHBOARD,
  NAV_KEYS.MAP,
  NAV_KEYS.TRENDS,
  NAV_KEYS.EVENTS,
  NAV_KEYS.SETTINGS,
]);

// Storage keys used by lib/storage.js
export const STORAGE_KEYS = Object.freeze({
  AUTH: "hermod.portal.auth",
  ACTIVE_TAB: "hermod.portal.activeTab",
  CONTROLS: "hermod.portal.controls",
});
