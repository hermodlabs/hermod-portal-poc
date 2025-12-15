// src/lib/storage.js
import { safeParseJSON } from "./utils.js";

/**
 * Small, safe localStorage wrapper.
 * - Never throws
 * - Namespaced keys defined in constants.js
 */

export function readJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return safeParseJSON(raw, fallback);
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Merge persisted object into defaults, but only for known keys.
 * Helps avoid crashes if storage is old/dirty.
 */
export function mergeKnown(defaults, persisted) {
  if (!persisted || typeof persisted !== "object") return { ...defaults };
  const out = { ...defaults };
  for (const k of Object.keys(defaults)) {
    if (k in persisted) out[k] = persisted[k];
  }
  return out;
}
