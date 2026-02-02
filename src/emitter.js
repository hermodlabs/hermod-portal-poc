// emitter.js — browser-safe mini EventEmitter
export function createEmitter() {
  /** @type {Map<string, Set<Function>>} */
  const map = new Map();

  return {
    on(evt, fn) {
      if (!map.has(evt)) map.set(evt, new Set());
      map.get(evt).add(fn);
      return () => this.off(evt, fn);
    },
    off(evt, fn) {
      const set = map.get(evt);
      if (!set) return;
      set.delete(fn);
      if (set.size === 0) map.delete(evt);
    },
    emit(evt, ...args) {
      const set = map.get(evt);
      if (!set) return;
      // copy to avoid issues if handlers unregister during emit
      [...set].forEach((fn) => fn(...args));
    },
    clear(evt) {
      if (evt) map.delete(evt);
      else map.clear();
    },
  };
}
