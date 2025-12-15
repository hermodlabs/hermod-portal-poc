import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  DoorOpen,
  Grid3X3,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  ThermometerSun,
  Timer,
  Waves,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/**
 * HermodLabs Cigar Room Portal (POC)
 * ---------------------------------------------------------
 * Start fresh: web-portal UX for customers.
 * - Not a marketing site.
 * - No hardware required (simulated field + events).
 * - Designed to show “what the operator would use.”
 *
 * Usage:
 * - Put this into a Vite + React + Tailwind project as App.jsx.
 */

// ---------------------------
// Utilities
// ---------------------------
const cx = (...xs) => xs.filter(Boolean).join(" ");
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;

function mulberry32(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function fmtTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const ap = h >= 12 ? "PM" : "AM";
  const hh = ((h + 11) % 12) + 1;
  return `${hh}:${m.toString().padStart(2, "0")} ${ap}`;
}

function percent(v) {
  return `${v.toFixed(1)}%`;
}

function humidityColor(h) {
  // subtle accent wash; 62..74 => alpha 0.12..0.44
  const t = clamp((h - 62) / 12, 0, 1);
  return `rgba(56, 189, 248, ${0.12 + 0.32 * t})`;
}

function zoneName(x, y, w, h) {
  const col = x < w / 3 ? "Door-side" : x < (2 * w) / 3 ? "Center" : "Back";
  const row = y < h / 3 ? "Upper" : y < (2 * h) / 3 ? "Middle" : "Lower";
  return `${row} · ${col}`;
}

// ---------------------------
// Simulated model
// ---------------------------
function simulateField({ w, h, z, tMin, doorIntensity, fanMix, seed }) {
  const prng = mulberry32(seed + Math.floor(tMin * 17) + Math.floor(z * 100));
  const base = 69.5;
  const vertical = lerp(-0.9, 0.9, z);

  const door = { x: 1, y: Math.floor(h * 0.45) };
  const doorStrength = 1.0 + 2.6 * doorIntensity;
  const phase = (tMin / 9) % 1;
  const doorPulse = Math.max(0, Math.sin(phase * Math.PI));

  const mix = lerp(0.88, 0.52, fanMix);

  const pockets = [
    { x: Math.floor(w * 0.72), y: Math.floor(h * 0.28), r: 3.7, bias: -1.5 },
    { x: Math.floor(w * 0.66), y: Math.floor(h * 0.78), r: 4.4, bias: +1.1 },
  ];

  const grid = Array.from({ length: h }, (_, y) =>
    Array.from({ length: w }, (_, x) => {
      const gx = (x / (w - 1) - 0.5) * 0.8;
      const gy = (y / (h - 1) - 0.5) * 0.45;
      let v = base + vertical + gx + gy;

      for (const p of pockets) {
        const dx = x - p.x;
        const dy = y - p.y;
        const d2 = dx * dx + dy * dy;
        const k = Math.exp(-d2 / (2 * p.r * p.r));
        v += p.bias * k;
      }

      const yCenter = door.y + Math.round(Math.sin((x / w) * 3 + z * 2 + tMin / 37) * 2);
      const corridor = Math.exp(-Math.pow((y - yCenter) / 2.2, 2));
      const dist = Math.sqrt((x - door.x) ** 2 + (y - door.y) ** 2);
      const decay = Math.exp(-dist / 7.5);
      v += -doorStrength * doorPulse * corridor * decay;

      v += (prng() - 0.5) * 0.35;
      v = base + (v - base) * mix;

      return clamp(v, 60, 76);
    })
  );

  return { grid, door, doorPulse };
}

function summarizeGrid(grid) {
  let min = Infinity,
    max = -Infinity,
    sum = 0,
    n = 0;
  for (const row of grid) {
    for (const v of row) {
      min = Math.min(min, v);
      max = Math.max(max, v);
      sum += v;
      n++;
    }
  }
  return { min, max, avg: sum / n };
}

function computeAlerts(grid, { low = 66.5, high = 72.5 }) {
  const h = grid.length;
  const w = grid[0].length;
  const lows = [];
  const highs = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = grid[y][x];
      if (v < low) lows.push({ x, y, v });
      if (v > high) highs.push({ x, y, v });
    }
  }
  lows.sort((a, b) => a.v - b.v);
  highs.sort((a, b) => b.v - a.v);
  return { low: lows.slice(0, 6), high: highs.slice(0, 4) };
}

function buildTimeseries({ points = 48, seed = 11, z, doorIntensity, fanMix }) {
  const out = [];
  const now = 14 * 60 + 20;
  for (let i = points - 1; i >= 0; i--) {
    const tMin = now - i * 10;
    const { grid } = simulateField({ w: 20, h: 12, z, tMin, doorIntensity, fanMix, seed });
    const s = summarizeGrid(grid);
    out.push({
      t: fmtTime((tMin + 24 * 60) % (24 * 60)),
      avg: Number(s.avg.toFixed(2)),
      min: Number(s.min.toFixed(2)),
      max: Number(s.max.toFixed(2)),
    });
  }
  return out;
}

function buildEvents({ seed = 11, doorIntensity }) {
  const prng = mulberry32(seed + Math.floor(doorIntensity * 1000));
  const events = [];
  const baseMin = 14 * 60 + 20;
  for (let i = 0; i < 10; i++) {
    const minutesAgo = Math.floor(prng() * 240);
    const when = baseMin - minutesAgo;
    const duration = 10 + Math.floor(prng() * 45);
    const severity = clamp(doorIntensity + (prng() - 0.5) * 0.25, 0, 1);
    events.push({
      id: `evt_${i}`,
      type: "Door cycle",
      when: fmtTime((when + 24 * 60) % (24 * 60)),
      durationSec: duration,
      severity,
      note: severity > 0.66 ? "High traffic burst" : severity > 0.33 ? "Normal traffic" : "Light traffic",
    });
  }
  events.sort((a, b) => (a.when < b.when ? 1 : -1));
  return events;
}

// ---------------------------
// UI primitives
// ---------------------------
function Chip({ children, tone = "neutral" }) {
  const toneCls = {
    neutral: "border-white/10 bg-white/[0.03] text-slate-200",
    accent: "border-sky-400/25 bg-sky-400/10 text-sky-200",
    ok: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
    warn: "border-amber-400/25 bg-amber-400/10 text-amber-200",
    bad: "border-rose-400/25 bg-rose-400/10 text-rose-200",
  };
  return (
    <span
      className={cx(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.16em]",
        toneCls[tone] || toneCls.neutral
      )}
    >
      {children}
    </span>
  );
}

function Panel({ title, meta, right, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/70 to-slate-950/70 shadow-[0_18px_45px_rgba(0,0,0,0.55)]">
      <div className="flex flex-wrap items-end justify-between gap-3 p-6 pb-4">
        <div>
          <div className="text-[12px] uppercase tracking-[0.18em] text-slate-400">{meta}</div>
          <div className="mt-2 text-xl font-semibold text-slate-100">{title}</div>
        </div>
        <div className="flex items-center gap-2">{right}</div>
      </div>
      <div className="px-6 pb-6">{children}</div>
    </div>
  );
}

function StatTile({ icon: Icon, label, value, tone = "neutral" }) {
  const toneCls = {
    neutral: "border-white/10 bg-white/[0.03]",
    ok: "border-emerald-400/20 bg-emerald-400/5",
    warn: "border-amber-400/20 bg-amber-400/5",
    bad: "border-rose-400/20 bg-rose-400/5",
  };
  return (
    <div className={cx("rounded-2xl border p-4", toneCls[tone] || toneCls.neutral)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[12px] uppercase tracking-[0.16em] text-slate-400">{label}</div>
          <div className="mt-2 text-2xl font-semibold text-slate-100">{value}</div>
        </div>
        {Icon ? <Icon className="text-slate-400" size={18} /> : null}
      </div>
    </div>
  );
}

function FieldGrid({ grid, door }) {
  const H = grid.length;
  const W = grid[0].length;

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="text-[12px] uppercase tracking-[0.16em] text-slate-400">Room slice (top-down)</div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-slate-200/60" />
          <div className="text-[12px] uppercase tracking-[0.14em] text-slate-400">Door</div>
        </div>
      </div>

      <div className="mt-4 grid gap-1" style={{ gridTemplateColumns: `repeat(${W}, minmax(0, 1fr))` }}>
        {grid.map((row, y) =>
          row.map((v, x) => {
            const isDoor = x === door.x && y === door.y;
            return (
              <div
                key={`${x}-${y}`}
                title={`${zoneName(x, y, W, H)} · ${percent(v)}`}
                className={cx(
                  "relative aspect-square rounded-sm border border-white/5",
                  isDoor && "ring-2 ring-slate-200/70"
                )}
                style={{ background: humidityColor(v) }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:10px_10px] opacity-25" />
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <div className="text-[12px] uppercase tracking-[0.16em] text-slate-400">Low</div>
          <div className="mt-1 text-sm text-slate-300">Potentially dry zones</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <div className="text-[12px] uppercase tracking-[0.16em] text-slate-400">Target</div>
          <div className="mt-1 text-sm text-slate-300">Stable band</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <div className="text-[12px] uppercase tracking-[0.16em] text-slate-400">High</div>
          <div className="mt-1 text-sm text-slate-300">Potentially wet zones</div>
        </div>
      </div>
    </div>
  );
}

function SliderRow({ label, value, onChange, min, max, step, format }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[12px] uppercase tracking-[0.16em] text-slate-400">{label}</div>
        <div className="text-xs uppercase tracking-[0.14em] text-slate-300">{format(value)}</div>
      </div>
      <input
        className="mt-3 w-full"
        type="range"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
      />
    </div>
  );
}

// ---------------------------
// Portal layout
// ---------------------------
const NAV = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "map", label: "Room map", icon: Grid3X3 },
  { key: "trends", label: "Trends", icon: BarChart3 },
  { key: "events", label: "Events", icon: DoorOpen },
  { key: "settings", label: "Settings", icon: Settings },
];

function PortalLayout({ tenant, roomName, active, onNav, onLogout, children }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#111827,#020308)] text-slate-100">
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-[12px] uppercase tracking-[0.18em] text-slate-400">{tenant}</div>
              <div className="mt-2 text-2xl font-semibold">{roomName}</div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Chip tone="accent">
                <ShieldCheck size={14} />
                POC · simulated data
              </Chip>
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-3 py-2 text-xs uppercase tracking-[0.14em] text-slate-300 hover:bg-white/[0.04]"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-[260px_1fr] gap-6 px-6 py-8 max-lg:grid-cols-1">
        <aside className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="text-[12px] uppercase tracking-[0.18em] text-slate-400">Navigation</div>
          <div className="mt-3 grid gap-2">
            {NAV.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => onNav(key)}
                className={cx(
                  "flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition",
                  active === key
                    ? "border-sky-400/25 bg-sky-400/10 text-slate-100"
                    : "border-white/10 bg-white/[0.01] text-slate-300 hover:bg-white/[0.03]"
                )}
              >
                <Icon size={18} className={cx(active === key ? "text-sky-200" : "text-slate-400")} />
                <div className="text-sm font-medium">{label}</div>
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="text-[12px] uppercase tracking-[0.18em] text-slate-400">Operator workflow</div>
            <div className="mt-2 text-sm text-slate-300 leading-relaxed">
              Map → identify drift path → correlate with events → take action.
            </div>
          </div>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-6 text-xs uppercase tracking-[0.18em] text-slate-500">
          © {new Date().getFullYear()} HermodLabs · Portal POC
        </div>
      </div>
    </div>
  );
}

// ---------------------------
// Pages
// ---------------------------
function DashboardPage({ model }) {
  const { summary, alerts, doorPulse, nowLabel } = model;
  const healthTone = alerts.low.length > 0 ? (alerts.low.length > 3 ? "bad" : "warn") : "ok";

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[12px] uppercase tracking-[0.18em] text-slate-400">Dashboard</div>
          <div className="mt-2 text-3xl font-semibold">Room health</div>
          <div className="mt-2 text-slate-400 leading-relaxed max-w-3xl">
            Snapshot view: zone alerts, current field summary, and the current door-cycle signal.
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Chip tone={healthTone === "ok" ? "ok" : healthTone === "warn" ? "warn" : "bad"}>
            <AlertTriangle size={14} />
            {alerts.low.length ? `${alerts.low.length} low zones` : "No low zones"}
          </Chip>
          <Chip tone="neutral">
            <Timer size={14} />
            Now · {nowLabel}
          </Chip>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatTile icon={Waves} label="Average" value={percent(summary.avg)} tone={healthTone} />
        <StatTile
          icon={ThermometerSun}
          label="Min"
          value={percent(summary.min)}
          tone={alerts.low.length ? "warn" : "neutral"}
        />
        <StatTile icon={ThermometerSun} label="Max" value={percent(summary.max)} tone="neutral" />
        <StatTile
          icon={DoorOpen}
          label="Door signal"
          value={`${Math.round(doorPulse * 100)}%`}
          tone={doorPulse > 0.66 ? "warn" : "neutral"}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Panel meta="Spatial" title="Current slice" right={<Chip tone="accent">Field view</Chip>}>
          <FieldGrid grid={model.grid} door={model.door} />
        </Panel>

        <Panel meta="Actions" title="Recommended next steps" right={<Chip tone="neutral">POC</Chip>}>
          <div className="space-y-3 text-slate-300 leading-relaxed">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="text-[12px] uppercase tracking-[0.16em] text-slate-400">If low zones persist</div>
              <div className="mt-2">
                Rotate inventory away from the lowest zones and inspect door-side shelves for repeated drift paths.
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="text-[12px] uppercase tracking-[0.16em] text-slate-400">If door signal is high</div>
              <div className="mt-2">
                Reduce door dwell during peak traffic; adjust fan placement to break the door corridor.
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="text-[12px] uppercase tracking-[0.16em] text-slate-400">Note</div>
              <div className="mt-2 text-slate-400">
                Simulated data. The UI is the point: customers understand what they’d see and do.
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function MapPage({ model, controls, setControls }) {
  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[12px] uppercase tracking-[0.18em] text-slate-400">Room map</div>
          <div className="mt-2 text-3xl font-semibold">Humidity field slice</div>
          <div className="mt-2 text-slate-400 leading-relaxed max-w-3xl">
            In a real deployment, this is driven by sensors. In the POC, use the knobs to demonstrate drift paths.
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Chip tone="neutral">
            <Timer size={14} />
            {model.nowLabel}
          </Chip>
          <Chip tone={model.alerts.low.length ? "warn" : "ok"}>
            <AlertTriangle size={14} />
            {model.alerts.low.length ? `${model.alerts.low.length} low zones` : "In range"}
          </Chip>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Panel meta="Spatial" title="Field view" right={<Chip tone="accent">z={Math.round(controls.z * 100)}%</Chip>}>
          <FieldGrid grid={model.grid} door={model.door} />
        </Panel>

        <Panel meta="Controls" title="Demo knobs" right={<Chip tone="neutral">POC</Chip>}>
          <div className="grid gap-4">
            <SliderRow
              label="Height (z slice)"
              value={controls.z}
              onChange={(v) => setControls((c) => ({ ...c, z: v }))}
              min={0}
              max={1}
              step={0.01}
              format={(v) => `${Math.round(v * 100)}%`}
            />
            <SliderRow
              label="Time"
              value={controls.tMin}
              onChange={(v) => setControls((c) => ({ ...c, tMin: v }))}
              min={0}
              max={24 * 60 - 1}
              step={5}
              format={(v) => fmtTime(v)}
            />
            <SliderRow
              label="Door cycle intensity"
              value={controls.doorIntensity}
              onChange={(v) => setControls((c) => ({ ...c, doorIntensity: v }))}
              min={0}
              max={1}
              step={0.01}
              format={(v) => (v < 0.33 ? "Low" : v < 0.66 ? "Medium" : "High")}
            />
            <SliderRow
              label="Fan mixing"
              value={controls.fanMix}
              onChange={(v) => setControls((c) => ({ ...c, fanMix: v }))}
              min={0}
              max={1}
              step={0.01}
              format={(v) => (v < 0.33 ? "Low" : v < 0.66 ? "Medium" : "High")}
            />
          </div>
        </Panel>
      </div>

      <Panel meta="Zones" title="Most stressed zones" right={<Chip tone="neutral">Low &lt; 66.5%</Chip>}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {model.alerts.low.length === 0 ? (
            <div className="text-slate-400">No low zones detected on this slice.</div>
          ) : (
            model.alerts.low.map((a, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3"
              >
                <div>
                  <div className="text-[12px] uppercase tracking-[0.16em] text-slate-400">
                    {zoneName(a.x, a.y, model.w, model.h)}
                  </div>
                  <div className="mt-1 text-slate-100 font-semibold">{percent(a.v)}</div>
                </div>
                <Chip tone="warn">Low</Chip>
              </div>
            ))
          )}
        </div>
      </Panel>
    </div>
  );
}

function TrendsPage({ model }) {
  const data = model.timeseries;
  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[12px] uppercase tracking-[0.18em] text-slate-400">Trends</div>
          <div className="mt-2 text-3xl font-semibold">Humidity over time</div>
          <div className="mt-2 text-slate-400 leading-relaxed max-w-3xl">
            Shows stability and variance. Operators use this to tell whether drift correlates with events.
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Chip tone="neutral">
            <Timer size={14} />
            Last 8 hours
          </Chip>
          <Chip tone="accent">
            <BarChart3 size={14} />
            Avg / Min / Max
          </Chip>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel meta="Trend" title="Average RH" right={<Chip tone="neutral">Simulated</Chip>}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="t" stroke="rgba(255,255,255,0.35)" tick={{ fontSize: 11 }} />
                <YAxis stroke="rgba(255,255,255,0.35)" tick={{ fontSize: 11 }} domain={[63, 75]} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(2,6,23,0.95)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 12,
                    color: "#e5e7eb",
                  }}
                />
                <Line type="monotone" dataKey="avg" strokeWidth={2} dot={false} stroke="rgba(56,189,248,0.9)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-slate-400">
            In the full portal, event markers (door cycles, humidifier runs) would appear on this chart.
          </div>
        </Panel>

        <Panel meta="Spread" title="Min / Max band" right={<Chip tone="neutral">Variance</Chip>}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="t" stroke="rgba(255,255,255,0.35)" tick={{ fontSize: 11 }} />
                <YAxis stroke="rgba(255,255,255,0.35)" tick={{ fontSize: 11 }} domain={[63, 75]} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(2,6,23,0.95)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 12,
                    color: "#e5e7eb",
                  }}
                />
                <Area type="monotone" dataKey="max" stroke="rgba(56,189,248,0.65)" fill="rgba(56,189,248,0.12)" />
                <Area type="monotone" dataKey="min" stroke="rgba(56,189,248,0.35)" fill="rgba(56,189,248,0.06)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-slate-400">
            Wider bands mean more spatial divergence: some shelves or corners are drifting away from the average.
          </div>
        </Panel>
      </div>
    </div>
  );
}

function EventsPage({ model }) {
  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[12px] uppercase tracking-[0.18em] text-slate-400">Events</div>
          <div className="mt-2 text-3xl font-semibold">Door cycles & activity</div>
          <div className="mt-2 text-slate-400 leading-relaxed max-w-3xl">
            Shows the event stream that would be correlated with drift paths.
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Chip tone="neutral">
            <DoorOpen size={14} />
            Last 4 hours
          </Chip>
          <Chip tone="accent">Correlation view (POC)</Chip>
        </div>
      </div>

      <Panel meta="Event log" title="Recent door cycles" right={<Chip tone="neutral">Simulated</Chip>}>
        <div className="overflow-auto rounded-2xl border border-white/10">
          <table className="min-w-full text-sm">
            <thead className="bg-white/[0.03]">
              <tr>
                <th className="px-4 py-3 text-left text-[12px] uppercase tracking-[0.16em] text-slate-400">Time</th>
                <th className="px-4 py-3 text-left text-[12px] uppercase tracking-[0.16em] text-slate-400">Type</th>
                <th className="px-4 py-3 text-left text-[12px] uppercase tracking-[0.16em] text-slate-400">Duration</th>
                <th className="px-4 py-3 text-left text-[12px] uppercase tracking-[0.16em] text-slate-400">Severity</th>
                <th className="px-4 py-3 text-left text-[12px] uppercase tracking-[0.16em] text-slate-400">Note</th>
              </tr>
            </thead>
            <tbody>
              {model.events.map((e) => (
                <tr key={e.id} className="border-t border-white/10">
                  <td className="px-4 py-3 text-slate-200">{e.when}</td>
                  <td className="px-4 py-3 text-slate-300">{e.type}</td>
                  <td className="px-4 py-3 text-slate-300">{e.durationSec}s</td>
                  <td className="px-4 py-3">
                    <Chip tone={e.severity > 0.66 ? "warn" : e.severity > 0.33 ? "neutral" : "ok"}>
                      {Math.round(e.severity * 100)}%
                    </Chip>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{e.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-sm text-slate-400">
          In the real portal, clicking an event would highlight the drift path on the map and show before/after zone deltas.
        </div>
      </Panel>
    </div>
  );
}

function SettingsPage({ controls, setControls }) {
  return (
    <div className="grid grid-cols-1 gap-6">
      <div>
        <div className="text-[12px] uppercase tracking-[0.18em] text-slate-400">Settings</div>
        <div className="mt-2 text-3xl font-semibold">Thresholds & policy (POC)</div>
        <div className="mt-2 text-slate-400 leading-relaxed max-w-3xl">
          Where customers would configure thresholds, alert routing, and model assumptions.
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel meta="Policy" title="Alert routing" right={<Chip tone="neutral">Placeholder</Chip>}>
          <div className="space-y-3 text-slate-300 leading-relaxed">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="text-[12px] uppercase tracking-[0.16em] text-slate-400">Notify</div>
              <div className="mt-2">Owner + staff group when low zones persist for 20 minutes.</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="text-[12px] uppercase tracking-[0.16em] text-slate-400">Escalate</div>
              <div className="mt-2">Escalate to manager if repeated drift is detected 3 days in a row.</div>
            </div>
          </div>
        </Panel>

        <Panel meta="Model" title="Demo defaults" right={<Chip tone="accent">Interactive</Chip>}>
          <div className="grid gap-4">
            <SliderRow
              label="Door cycle intensity"
              value={controls.doorIntensity}
              onChange={(v) => setControls((c) => ({ ...c, doorIntensity: v }))}
              min={0}
              max={1}
              step={0.01}
              format={(v) => (v < 0.33 ? "Low" : v < 0.66 ? "Medium" : "High")}
            />
            <SliderRow
              label="Fan mixing"
              value={controls.fanMix}
              onChange={(v) => setControls((c) => ({ ...c, fanMix: v }))}
              min={0}
              max={1}
              step={0.01}
              format={(v) => (v < 0.33 ? "Low" : v < 0.66 ? "Medium" : "High")}
            />
            <div className="text-sm text-slate-400">
              In a real setup, these would be derived from room configuration and observed behavior.
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

// ---------------------------
// Auth (POC)
// ---------------------------
function Login({ onLogin }) {
  const [tenant, setTenant] = useState("Cedar & Ash Cigar Lounge");
  const [room, setRoom] = useState("Walk-in Humidor");

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#111827,#020308)] text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="max-w-xl">
          <div className="text-[12px] uppercase tracking-[0.18em] text-slate-400">Portal POC</div>
          <h1 className="mt-3 text-4xl font-semibold">Cigar room monitoring portal</h1>
          <p className="mt-3 text-slate-400 leading-relaxed">
            This demo starts from the customer experience. Data is simulated. The UI shows what your team would use if the
            room were instrumented.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <div className="text-[12px] uppercase tracking-[0.18em] text-slate-400">Enter a demo tenant</div>

            <label className="mt-4 block">
              <div className="text-[12px] uppercase tracking-[0.16em] text-slate-400">Business</div>
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-slate-100 outline-none focus:border-sky-300/40"
                value={tenant}
                onChange={(e) => setTenant(e.target.value)}
              />
            </label>

            <label className="mt-4 block">
              <div className="text-[12px] uppercase tracking-[0.16em] text-slate-400">Room</div>
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-slate-100 outline-none focus:border-sky-300/40"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
              />
            </label>

            <button
              onClick={() => onLogin({ tenant, room })}
              className="mt-6 inline-flex items-center justify-center rounded-full bg-sky-400 px-4 py-2 text-xs uppercase tracking-[0.16em] font-semibold text-slate-950 hover:bg-sky-300"
            >
              Enter portal
            </button>

            <div className="mt-4 text-sm text-slate-400">
              In production this would be SSO. For now it drops you into the portal.
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/70 to-slate-950/70 p-6">
            <div className="text-[12px] uppercase tracking-[0.18em] text-slate-400">What this proves</div>
            <div className="mt-4 grid gap-3 text-slate-300 leading-relaxed">
              <Row icon={Grid3X3} title="Map" body="A spatial view: drift pockets and door paths." />
              <Row icon={BarChart3} title="Trends" body="Avg/min/max bands that reveal variance." />
              <Row icon={DoorOpen} title="Events" body="Door cycles correlated with drift." />
              <Row icon={Settings} title="Policy" body="Thresholds and alert routing (POC)." />
            </div>
          </div>
        </div>

        <div className="mt-12 text-xs uppercase tracking-[0.18em] text-slate-500">© {new Date().getFullYear()} HermodLabs</div>
      </div>
    </div>
  );
}

function Row({ icon: Icon, title, body }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={18} className="mt-0.5 text-slate-400" />
      <div>
        <div className="font-semibold text-slate-100">{title}</div>
        <div className="text-slate-400">{body}</div>
      </div>
    </div>
  );
}

// ---------------------------
// App
// ---------------------------
export default function App() {
  const [auth, setAuth] = useState(null);
  const [active, setActive] = useState("dashboard");

  const [controls, setControls] = useState({
    z: 0.55,
    tMin: 14 * 60 + 20,
    doorIntensity: 0.55,
    fanMix: 0.55,
  });

  const model = useMemo(() => {
    const w = 20;
    const h = 12;
    const { grid, door, doorPulse } = simulateField({
      w,
      h,
      z: controls.z,
      tMin: controls.tMin,
      doorIntensity: controls.doorIntensity,
      fanMix: controls.fanMix,
      seed: 11,
    });
    const summary = summarizeGrid(grid);
    const alerts = computeAlerts(grid, { low: 66.5, high: 72.5 });
    const timeseries = buildTimeseries({
      points: 48,
      seed: 11,
      z: controls.z,
      doorIntensity: controls.doorIntensity,
      fanMix: controls.fanMix,
    });
    const events = buildEvents({ seed: 11, doorIntensity: controls.doorIntensity });

    return { w, h, grid, door, doorPulse, summary, alerts, timeseries, events, nowLabel: fmtTime(controls.tMin) };
  }, [controls]);

  if (!auth) return <Login onLogin={(a) => setAuth(a)} />;

  return (
    <PortalLayout
      tenant={auth.tenant}
      roomName={auth.room}
      active={active}
      onNav={setActive}
      onLogout={() => {
        setAuth(null);
        setActive("dashboard");
      }}
    >
      {active === "dashboard" && <DashboardPage model={model} />}
      {active === "map" && <MapPage model={model} controls={controls} setControls={setControls} />}
      {active === "trends" && <TrendsPage model={model} />}
      {active === "events" && <EventsPage model={model} />}
      {active === "settings" && <SettingsPage controls={controls} setControls={setControls} />}
    </PortalLayout>
  );
}
