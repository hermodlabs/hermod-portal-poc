// src/lib/utils.js

export const cx = (...xs) => xs.filter(Boolean).join(" ");

export const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

export const lerp = (a, b, t) => a + (b - a) * t;

export const round = (x, digits = 2) => {
  const p = Math.pow(10, digits);
  return Math.round(x * p) / p;
};

export const percent = (x, digits = 1) => `${round(x, digits).toFixed(digits)}%`;

export function fmtTime(mins) {
  // mins in [0, 1440)
  const m = ((mins % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  const ap = h >= 12 ? "PM" : "AM";
  const hh = ((h + 11) % 12) + 1;
  return `${hh}:${String(mm).padStart(2, "0")} ${ap}`;
}

export function fmtDateTimeISO(d = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export function safeParseJSON(str, fallback) {
  try {
    if (str == null) return fallback;
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

export function assertNever(x, msg = "Unexpected value") {
  throw new Error(`${msg}: ${String(x)}`);
}
