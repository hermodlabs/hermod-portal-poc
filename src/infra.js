// infra.js
//import { EventEmitter } from "node:events";
import { createEmitter } from "./emitter.js";


// ---------- OutputTracker (simple) ----------
export class OutputTracker {
  static create(emitter, eventName) {
    return new OutputTracker(emitter, eventName);
  }
  constructor(emitter, eventName) {
    this._emitter = emitter;
    this._eventName = eventName;
    this._data = [];
    this._fn = (payload) => this._data.push(payload);
    this._emitter.on(this._eventName, this._fn);
  }
  get data() { return this._data; }
  clear() {
    const out = [...this._data];
    this._data.length = 0;
    return out;
  }
  stop() { this._emitter.off(this._eventName, this._fn); }
}

// ---------- Clock (Nullable) ----------
export class Clock {
  static create() {
    return new Clock(() => new Date());
  }
  static createNull({ now = new Date("2026-02-01T00:00:00.000Z"), label = "Now" } = {}) {
    return new Clock(() => now, label);
  }
  constructor(nowFn, label = "Now") {
    this._nowFn = nowFn;
    this._label = label;
  }
  now() { return this._nowFn(); }
  labelNow() { return this._label; }
  labelToday() { return "Today"; } // keep your current vibe
}

// ---------- IdGen (Nullable / configurable sequence) ----------
export class IdGen {
  static create() {
    return new IdGen(() => Math.random());
  }
  static createNull({ seq = [101, 102, 103] } = {}) {
    const list = Array.isArray(seq) ? [...seq] : [seq];
    return new IdGen(() => {
      const n = list.shift();
      if (n === undefined) throw new Error("IdGen: no more ids configured");
      // Convert integer -> 0..1-ish
      return (n % 1000) / 1000;
    });
  }
  constructor(rngFn) {
    this._rngFn = rngFn;
  }
  next(prefix = "id") {
    const n = Math.floor(100 + this._rngFn() * 900); // 100..999
    return `${prefix}-${n}`;
  }
}

// ---------- Telemetry/Event bus (Output Tracking) ----------
export const Telemetry = {
  create(opts = {}) {
    const bus = createEmitter();
    const { buffer = false, maxBuffer = 200 } = opts;

    const buf = [];

    function pushBuffered(entry) {
      if (!buffer) return;
      buf.push(entry);
      if (buf.length > maxBuffer) buf.shift();
    }

    return {
      // Subscribe to an event name (e.g. "telemetry", "engine", "error")
      // Returns unsubscribe()
      on(eventName, handler) {
        return bus.on(eventName, handler);
      },

      off(eventName, handler) {
        return bus.off(eventName, handler);
      },

      // Emit an event
      emit(eventName, payload) {
        bus.emit(eventName, payload);
      },

      // Convenience: standardized telemetry event
      track(name, props = {}) {
        const entry = {
          name,
          props,
          ts: Date.now(),
        };
        pushBuffered(entry);
        bus.emit("telemetry", entry);
      },

      // Optional: your engine can call this before export / handoff
      flush() {
        // For now: no-op. If you want, return buffered telemetry.
        return buffer ? buf.slice() : [];
      },

      // Optional: clear buffered telemetry + handlers
      reset() {
        buf.length = 0;
        bus.clear();
      },
    };
  },

  // Useful for tests / storybook
  createNull() {
    return {
      on() { return () => {}; },
      off() {},
      emit() {},
      track() {},
      flush() { return []; },
      reset() {},
    };
  },
};
