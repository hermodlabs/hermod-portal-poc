import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  DoorOpen,
  FileText,
  Grid3X3,
  Hammer,
  LayoutDashboard,
  LogOut,
  MapPinned,
  PlayCircle,
  ScrollText,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Timer,
  Wrench,
  XCircle,
} from "lucide-react";

/**
 * Self-contained POC page (single file).
 * Dependencies: react, lucide-react
 *
 * What this is:
 * - Task-based UI (Job Board → Map/Diagnose/Intervene/Verify/Rules)
 * - Simulated room field + events + “receipts”
 * - Same dark, card/panel, chip-driven style as your sample
 */

// -----------------------------
// tiny utils
// -----------------------------
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
  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  return `${hh}:${mm}`;
}

function percent(v) {
  return `${v.toFixed(1)}%`;
}

function zoneName(x, y, W, H) {
  // friendly-ish label: quadrant + grid coordinate
  const qx = x < W / 2 ? "W" : "E";
  const qy = y < H / 2 ? "N" : "S";
  const row = String.fromCharCode(65 + y); // A, B, C...
  const col = x + 1;
  return `${qx}${qy} · ${row}${col}`;
}

function humidityColor(v) {
  // v in [62..76] roughly. Map to blue->green->amber (still within the vibe).
  const t = clamp((v - 62) / (76 - 62), 0, 1);
  const hue = lerp(210, 38, t); // blue-ish to warm-ish
  const sat = lerp(65, 85, t);
  const light = lerp(28, 44, t);
  return `hsl(${hue} ${sat}% ${light}%)`;
}

function summarizeGrid(grid) {
  let min = Infinity,
    max = -Infinity,
    sum = 0,
    sum2 = 0,
    n = 0;
  for (const row of grid) {
    for (const v of row) {
      min = Math.min(min, v);
      max = Math.max(max, v);
      sum += v;
      sum2 += v * v;
      n++;
    }
  }
  const avg = sum / n;
  const var_ = Math.max(0, sum2 / n - avg * avg);
  const sd = Math.sqrt(var_);
  return { min, max, avg, sd };
}

function computeAlerts(grid, { low = 66.5, high = 72.5 }) {
  const h = grid.length,
    w = grid[0].length;
  const lows = [],
    highs = [];
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const v = grid[y][x];
      if (v < low) lows.push({ x, y, v });
      if (v > high) highs.push({ x, y, v });
    }
  lows.sort((a, b) => a.v - b.v);
  highs.sort((a, b) => b.v - a.v);
  return { low: lows.slice(0, 8), high: highs.slice(0, 6) };
}

// -----------------------------
// simulated model
// -----------------------------
function simulateField({ w, h, z, tMin, doorIntensity, fanMix, seed }) {
  const rng = mulberry32(seed);

  // door location + corridor
  const door = { x: 1, y: Math.floor(h / 2) };
  const corridor = { x0: 0, x1: Math.floor(w * 0.25), y0: Math.floor(h * 0.25), y1: Math.floor(h * 0.75) };

  const timePhase = (tMin / (24 * 60)) * Math.PI * 2;
  const doorPulse = clamp(0.15 + 0.85 * (0.5 + 0.5 * Math.sin(timePhase * 2 + 0.7)) * doorIntensity, 0, 1);
  const zBias = lerp(-0.6, 0.6, z);

  const grid = Array.from({ length: h }, (_, y) =>
    Array.from({ length: w }, (_, x) => {
      // base humidity
      let v = 70.2 + zBias;

      // mild room gradient
      v += lerp(-0.7, 0.7, x / (w - 1));
      v += lerp(0.4, -0.4, y / (h - 1));

      // door corridor effect (dry-ish channel)
      const inCorridor = x >= corridor.x0 && x <= corridor.x1 && y >= corridor.y0 && y <= corridor.y1;
      if (inCorridor) {
        const distToDoor = Math.abs(y - door.y) + Math.abs(x - door.x);
        v -= (0.9 + 0.6 * doorPulse) * Math.exp(-distToDoor / 3.2);
      }

      // "pocket" shelf: a repeat offender corner
      const pocketCenter = { x: Math.floor(w * 0.72), y: Math.floor(h * 0.68) };
      const dx = x - pocketCenter.x;
      const dy = y - pocketCenter.y;
      const d2 = dx * dx + dy * dy;
      v -= 0.9 * Math.exp(-d2 / 10);

      // fan mixing reduces extremes
      const noise = (rng() - 0.5) * lerp(0.8, 0.3, fanMix);
      v += noise;

      return v;
    })
  );

  return { grid, door, doorPulse };
}

function buildTimeseries({ points, seed, doorIntensity, fanMix }) {
  const rng = mulberry32(seed + 101);
  const data = [];
  let base = 70.1;
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    const wave = Math.sin(t * Math.PI * 2 * 1.3 + 0.4) * (0.35 + 0.55 * doorIntensity);
    const drift = (rng() - 0.5) * lerp(0.35, 0.12, fanMix);
    base = base + 0.03 * wave + 0.02 * drift;

    const spread = lerp(1.2, 0.55, fanMix) + 0.25 * doorIntensity + 0.15 * Math.abs(wave);
    const avg = base + wave * 0.2;
    const min = avg - spread;
    const max = avg + spread;
    data.push({
      t: `${String(8 + Math.floor(i / 6)).padStart(2, "0")}:${String((i % 6) * 10).padStart(2, "0")}`,
      avg,
      min,
      max,
    });
  }
  return data;
}

function buildEvents({ seed, doorIntensity }) {
  const rng = mulberry32(seed + 202);
  const n = 10;
  const now = 18 * 60 + 30;
  const out = [];
  for (let i = 0; i < n; i++) {
    const when = now - (n - i) * (12 + Math.floor(rng() * 9));
    const severity = clamp((0.25 + 0.75 * rng()) * doorIntensity, 0, 1);
    out.push({
      id: `ev-${i}`,
      when: fmtTime(clamp(when, 0, 24 * 60 - 1)),
      type: "Door cycle",
      durationSec: 6 + Math.floor(rng() * 38),
      severity,
      note:
        severity > 0.66
          ? "Long dwell (traffic burst)"
          : severity > 0.33
          ? "Normal open/close"
          : "Quick open",
    });
  }
  return out.reverse();
}

// -----------------------------
// “product objects”: tasks + receipts
// -----------------------------
const TASK_TEMPLATES = {
  COMMISSION_MAP: {
    title: "Commission zone map",
    meta: "Map",
    icon: MapPinned,
    description: "Collect a fresh window W, compute zones, validate, and publish a map version.",
    steps: [
      "Confirm sensors are healthy (no dead batteries, no obvious placement errors)",
      "Collect baseline window W (15–30 min)",
      "Compute stable vs unstable zones",
      "Annotate zones with operator notes (vents, doors, shelving)",
      "Publish map version (locks a reference for future receipts)",
    ],
    receipts: [
      "Map version ID + timestamp",
      "Stable zones show lower variance than unstable zones",
      "Pocket catalog seeded (if repeat offenders exist)",
    ],
  },
  INVESTIGATE_POCKET: {
    title: "Investigate pocket: Shelf C3",
    meta: "Diagnose",
    icon: AlertTriangle,
    description: "Determine whether drift is real or sensor drama. Decide next action.",
    steps: [
      "Confirm sensor agreement (compare nearby sensors)",
      "Check event correlation (door cycles / fan changes)",
      "Mark whether pocket is repeatable (same shelf misbehaves)",
      "Choose next action (avoid long-age here, add temp sensor, disturbance test)",
      "Create a short diagnostic receipt",
    ],
    receipts: [
      "Pocket classification (repeatable vs random)",
      "Correlation note (door corridor / HVAC cycle)",
      "Next action selected (non-paralyzing)",
    ],
  },
  PLAN_INTERVENTION: {
    title: "Plan intervention: break the corridor",
    meta: "Intervene",
    icon: Hammer,
    description: "Choose a small, reversible action. Define what “worked” looks like.",
    steps: [
      "Pick target zone/pocket",
      "Pick action (humidifier move, airflow staging, door policy)",
      "Define expected change (e.g., pocket shrinks, variance drops)",
      "Define verification window W (before/after)",
      "Execute + log intervention",
    ],
    receipts: [
      "Intervention log entry",
      "Verification plan (window W + acceptance signal)",
    ],
  },
  VERIFY_INTERVENTION: {
    title: "Verify intervention",
    meta: "Verify",
    icon: ClipboardCheck,
    description: "Compare before/after windows. Generate a receipt operators can audit.",
    steps: [
      "Collect after-window W",
      "Compute deltas (avg, variance, pocket severity)",
      "Confirm acceptance signals",
      "If failed: route to “can’t decide” branch",
      "Generate receipt",
    ],
    receipts: ["Before/after delta summary", "Pass/fail against acceptance signals", "Notes + next step"],
  },
  UPDATE_RULES: {
    title: "Update placement rules",
    meta: "Rules",
    icon: ScrollText,
    description: "Turn conclusions into staff-proof instructions (so the room doesn’t drift back).",
    steps: [
      "Write a placement rule change",
      "Attach reason (map version + receipt reference)",
      "Mark effective date",
      "Publish staff instructions",
      "Confirm acknowledgement (optional)",
    ],
    receipts: ["Rule version + diff", "Linked map/receipt references", "Staff instruction snippet"],
  },
};

function makeInitialTasks() {
  const make = (id, key, status) => ({
    id,
    key,
    status, // "todo" | "doing" | "blocked" | "done"
    createdAt: "Today",
    owner: "Bobby",
    completed: new Set(),
    notes: "",
    receipt: null,
  });
  return [
    make("t-001", "COMMISSION_MAP", "doing"),
    make("t-002", "INVESTIGATE_POCKET", "todo"),
    make("t-003", "PLAN_INTERVENTION", "todo"),
    make("t-004", "VERIFY_INTERVENTION", "blocked"),
    make("t-005", "UPDATE_RULES", "todo"),
  ];
}

function statusTone(s) {
  if (s === "done") return "ok";
  if (s === "blocked") return "bad";
  if (s === "doing") return "accent";
  return "neutral";
}

function statusLabel(s) {
  if (s === "todo") return "To do";
  if (s === "doing") return "In progress";
  if (s === "blocked") return "Blocked";
  if (s === "done") return "Done";
  return s;
}

function makeReceipt(task, model) {
  const tpl = TASK_TEMPLATES[task.key];
  const when = model?.nowLabel ?? "Now";
  const id = `R-${task.id.replace("t-", "")}-${Math.floor(100 + Math.random() * 900)}`;
  const summary = {
    id,
    title: `${tpl.meta} Receipt · ${tpl.title}`,
    when,
    bullets: [
      ...tpl.receipts.slice(0, 2),
      `Snapshot: avg=${percent(model.summary.avg)} · sd=${model.summary.sd.toFixed(2)}`,
      model.alerts.low.length ? `Low zones observed: ${model.alerts.low.length}` : "No low zones observed",
    ],
  };
  return summary;
}

// -----------------------------
// UI atoms
// -----------------------------
function Chip({ tone = "neutral", children }) {
  return (
    <span
      className={cx(
        "chip",
        tone === "accent" && "chip--accent",
        tone === "ok" && "chip--ok",
        tone === "warn" && "chip--warn",
        tone === "bad" && "chip--bad"
      )}
    >
      {children}
    </span>
  );
}

function Panel({ meta, title, right, children }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <div className="kicker">{meta}</div>
          <div className="panel-title">{title}</div>
        </div>
        <div className="row">{right}</div>
      </div>
      <div className="panel-body">{children}</div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

function FieldGrid({ grid, door }) {
  const H = grid.length;
  const W = grid[0].length;
  return (
    <div className="field">
      <div className="field-top">
        <div>
          <div className="kicker">Room slice (top-down)</div>
          <div className="text" style={{ marginTop: 6 }}>
            Zones are conceptual here; the point is the workflow: detect → decide → receipt.
          </div>
        </div>
        <div className="row">
          <span style={{ width: 8, height: 8, borderRadius: 999, background: "rgba(226,232,240,.6)" }} />
          <div className="kicker">Door</div>
        </div>
      </div>

      <div className="field-grid" style={{ gridTemplateColumns: `repeat(${W}, minmax(0, 1fr))` }}>
        {grid.map((row, y) =>
          row.map((v, x) => {
            const isDoor = x === door.x && y === door.y;
            return (
              <div
                key={`${x}-${y}`}
                className={cx("cell", isDoor && "cell--door")}
                style={{ background: humidityColor(v) }}
                title={`${zoneName(x, y, W, H)} · ${percent(v)}`}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

function Slider({ label, value, onChange, min, max, step, format }) {
  return (
    <div className="slider">
      <div className="slider-top">
        <div className="stat-label">{label}</div>
        <div className="kicker">{format(value)}</div>
      </div>
      <input
        className="range"
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(+e.target.value)}
      />
    </div>
  );
}

function MiniSparkLine({ data, height = 64 }) {
  // expects [{avg,min,max}...] – draw avg line
  const W = 220;
  const H = height;
  const xs = data.map((_, i) => (i / (data.length - 1)) * (W - 8) + 4);
  const ys = data.map((d) => d.avg);
  const minV = Math.min(...ys);
  const maxV = Math.max(...ys);
  const yMap = (v) => {
    const t = (v - minV) / Math.max(1e-6, maxV - minV);
    return H - (t * (H - 8) + 4);
  };
  const d = xs
    .map((x, i) => `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${yMap(ys[i]).toFixed(2)}`)
    .join(" ");
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <path d={d} fill="none" stroke="rgba(56,189,248,0.85)" strokeWidth="2" />
      <path
        d={`M 0 ${H - 1} H ${W}`}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="1"
      />
    </svg>
  );
}

// -----------------------------
// navigation
// -----------------------------
const NAV = [
  { key: "jobboard", label: "Job board", icon: LayoutDashboard },
  { key: "map", label: "Map", icon: Grid3X3 },
  { key: "diagnose", label: "Diagnose", icon: AlertTriangle },
  { key: "intervene", label: "Intervene", icon: Hammer },
  { key: "verify", label: "Verify", icon: ClipboardCheck },
  { key: "rules", label: "Rules", icon: ScrollText },
  { key: "settings", label: "Settings", icon: Settings },
];

// -----------------------------
// login
// -----------------------------
function Login({ onLogin }) {
  const [tenant, setTenant] = useState("The Cigar District");
  const [room, setRoom] = useState("Walk-in Humidor");
  return (
    <div className="login">
      <Style />
      <div className="container">
        <div className="kicker">Portal POC</div>
        <h1 style={{ margin: "12px 0 0", fontSize: 42, fontWeight: 650 }}>Task-based operator portal</h1>
        <p className="text" style={{ maxWidth: 820, marginTop: 12 }}>
          This is a <b>workflow-first</b> proof-of-concept: map → diagnose → intervene → verify → update rules.
          Data is simulated. The product is the loop and the receipts.
        </p>

        <div className="login-grid">
          <div className="box">
            <div className="kicker">Enter demo tenant</div>

            <label className="label">
              <div className="stat-label">Business</div>
              <input className="input" value={tenant} onChange={(e) => setTenant(e.target.value)} />
            </label>

            <label className="label">
              <div className="stat-label">Room</div>
              <input className="input" value={room} onChange={(e) => setRoom(e.target.value)} />
            </label>

            <button className="btn btn--primary" onClick={() => onLogin({ tenant, room })} style={{ marginTop: 16 }}>
              Enter portal
            </button>

            <p className="text" style={{ marginTop: 12 }}>
              In production this is SSO + facility selection. Here we drop straight into the job board.
            </p>
          </div>

          <div
            className="box"
            style={{
              background: "linear-gradient(180deg, rgba(15,23,42,.75), rgba(2,6,23,.70))",
              boxShadow: "var(--shadow)",
            }}
          >
            <div className="kicker">What this proves</div>
            <div style={{ marginTop: 14 }} className="text">
              A “dashboard” can be a <b>task inbox</b>. Charts are evidence inside tasks.
            </div>

            <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
              <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                <Chip tone="accent">
                  <ShieldCheck size={14} /> POC · simulated
                </Chip>
                <Chip>
                  <FileText size={14} /> receipts
                </Chip>
                <Chip>
                  <Wrench size={14} /> next actions
                </Chip>
              </div>

              <div className="box" style={{ padding: 14 }}>
                <div className="kicker">Operator spine</div>
                <div className="text" style={{ marginTop: 8 }}>
                  Map → Place → Monitor → Diagnose → Intervene → Verify → Update rules
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer">© {new Date().getFullYear()} HermodLabs</div>
      </div>
    </div>
  );
}

// -----------------------------
// main app
// -----------------------------
export default function TaskPortalPOC() {
  const [auth, setAuth] = useState(null);
  const [active, setActive] = useState("jobboard");
  const [selectedTaskId, setSelectedTaskId] = useState("t-001");

  const [controls, setControls] = useState({
    z: 0.55,
    tMin: 14 * 60 + 20,
    doorIntensity: 0.55,
    fanMix: 0.55,
    low: 66.5,
    high: 72.5,
  });

  const [tasks, setTasks] = useState(() => makeInitialTasks());

  const model = useMemo(() => {
    const w = 20,
      h = 12;
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
    const alerts = computeAlerts(grid, { low: controls.low, high: controls.high });
    const timeseries = buildTimeseries({
      points: 48,
      seed: 11,
      doorIntensity: controls.doorIntensity,
      fanMix: controls.fanMix,
    });
    const events = buildEvents({ seed: 11, doorIntensity: controls.doorIntensity });
    const agreement = clamp(0.92 - 0.25 * controls.doorIntensity + 0.1 * controls.fanMix, 0.55, 0.98); // fake “sensor agreement”
    const pocketScore = clamp(0.35 + 0.55 * controls.doorIntensity - 0.3 * controls.fanMix, 0.05, 0.95); // fake “pocket severity”
    return {
      w,
      h,
      grid,
      door,
      doorPulse,
      summary,
      alerts,
      timeseries,
      events,
      nowLabel: fmtTime(controls.tMin),
      agreement,
      pocketScore,
    };
  }, [controls]);

  const selectedTask = useMemo(() => tasks.find((t) => t.id === selectedTaskId) ?? tasks[0], [tasks, selectedTaskId]);

  const receiptsNeeded = useMemo(
    () => tasks.filter((t) => t.status !== "done" && !t.receipt && (t.status === "doing" || t.status === "blocked")),
    [tasks]
  );

  function openTask(taskId, nextPage) {
    setSelectedTaskId(taskId);
    if (nextPage) setActive(nextPage);
  }

  function setTaskStatus(taskId, status) {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
  }

  function toggleStep(taskId, stepIdx) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const next = new Set([...t.completed]);
        if (next.has(stepIdx)) next.delete(stepIdx);
        else next.add(stepIdx);
        return { ...t, completed: next, status: next.size ? "doing" : t.status === "blocked" ? "blocked" : "todo" };
      })
    );
  }

  function generateReceipt(taskId) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const receipt = makeReceipt(t, model);
        return { ...t, receipt, status: "done" };
      })
    );
  }

  function updateNotes(taskId, notes) {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, notes } : t)));
  }

  if (!auth) return <Login onLogin={setAuth} />;

  return (
    <>
      <Style />

      <div className="topbar">
        <div className="container">
          <div className="topbar-inner">
            <div>
              <div className="kicker">{auth.tenant}</div>
              <div className="h1">{auth.room}</div>
            </div>
            <div className="row">
              <Chip tone="accent">
                <ShieldCheck size={14} /> POC · simulated data
              </Chip>
              <button
                className="btn"
                onClick={() => {
                  setAuth(null);
                  setActive("jobboard");
                }}
              >
                <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                  <LogOut size={14} /> Logout
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="layout">
          <aside className="sidebar">
            <div className="kicker">Navigation</div>

            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
              {NAV.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  className={cx("navbtn", active === key && "navbtn--active")}
                  onClick={() => setActive(key)}
                >
                  <Icon size={18} style={{ opacity: 0.9 }} />
                  <div style={{ fontWeight: 600, color: active === key ? "var(--text)" : "var(--muted)" }}>{label}</div>
                </button>
              ))}
            </div>

            <div className="sidebar-note">
              <div className="kicker">Operator spine</div>
              <div style={{ marginTop: 8 }}>
                <b>Map</b> → <b>Diagnose</b> → <b>Intervene</b> → <b>Verify</b> → <b>Rules</b>
              </div>
              <div className="text" style={{ marginTop: 10 }}>
                The “dashboard” is the task list. Evidence lives inside each task.
              </div>
            </div>

            <div className="sidebar-note">
              <div className="kicker">Now</div>
              <div className="row" style={{ marginTop: 8, justifyContent: "space-between" }}>
                <Chip>
                  <Timer size={14} /> {model.nowLabel}
                </Chip>
                <Chip tone={model.alerts.low.length ? "warn" : "ok"}>
                  <AlertTriangle size={14} /> {model.alerts.low.length ? `${model.alerts.low.length} lows` : "In range"}
                </Chip>
              </div>
              <div style={{ marginTop: 10 }} className="text">
                door pulse: <b>{Math.round(model.doorPulse * 100)}%</b> · agreement:{" "}
                <b>{Math.round(model.agreement * 100)}%</b>
              </div>
            </div>
          </aside>

          <main className="main">
            {active === "jobboard" && (
              <JobBoard
                model={model}
                tasks={tasks}
                selectedTaskId={selectedTaskId}
                onSelectTask={(id) => setSelectedTaskId(id)}
                onOpenTask={(id, page) => openTask(id, page)}
                receiptsNeeded={receiptsNeeded}
              />
            )}

            {active === "map" && (
              <MapPage
                model={model}
                controls={controls}
                setControls={setControls}
                tasks={tasks}
                selectedTask={selectedTask}
                onOpenTask={(id) => openTask(id, "map")}
                onToggleStep={toggleStep}
                onGenerateReceipt={generateReceipt}
                onSetStatus={setTaskStatus}
                onNotes={updateNotes}
              />
            )}

            {active === "diagnose" && (
              <DiagnosePage
                model={model}
                tasks={tasks}
                selectedTask={selectedTask}
                onOpenTask={(id) => openTask(id, "diagnose")}
                onToggleStep={toggleStep}
                onGenerateReceipt={generateReceipt}
                onSetStatus={setTaskStatus}
                onNotes={updateNotes}
              />
            )}

            {active === "intervene" && (
              <IntervenePage
                model={model}
                tasks={tasks}
                selectedTask={selectedTask}
                onOpenTask={(id) => openTask(id, "intervene")}
                onToggleStep={toggleStep}
                onGenerateReceipt={generateReceipt}
                onSetStatus={setTaskStatus}
                onNotes={updateNotes}
              />
            )}

            {active === "verify" && (
              <VerifyPage
                model={model}
                tasks={tasks}
                selectedTask={selectedTask}
                onOpenTask={(id) => openTask(id, "verify")}
                onToggleStep={toggleStep}
                onGenerateReceipt={generateReceipt}
                onSetStatus={setTaskStatus}
                onNotes={updateNotes}
              />
            )}

            {active === "rules" && (
              <RulesPage
                model={model}
                tasks={tasks}
                selectedTask={selectedTask}
                onOpenTask={(id) => openTask(id, "rules")}
                onToggleStep={toggleStep}
                onGenerateReceipt={generateReceipt}
                onSetStatus={setTaskStatus}
                onNotes={updateNotes}
              />
            )}

            {active === "settings" && <SettingsPage controls={controls} setControls={setControls} model={model} />}
          </main>
        </div>

        <div className="footer">© {new Date().getFullYear()} HermodLabs · Task Portal POC</div>
      </div>
    </>
  );
}

// -----------------------------
// pages
// -----------------------------
function JobBoard({ model, tasks, selectedTaskId, onSelectTask, onOpenTask, receiptsNeeded }) {
  const done = tasks.filter((t) => t.status === "done").length;
  const blocked = tasks.filter((t) => t.status === "blocked").length;
  const doing = tasks.filter((t) => t.status === "doing").length;

  const priority = [...tasks].sort((a, b) => {
    const rank = { doing: 0, blocked: 1, todo: 2, done: 3 };
    return rank[a.status] - rank[b.status];
  });

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <div className="kicker">Job board</div>
          <div style={{ fontSize: 32, fontWeight: 650, marginTop: 6 }}>Today’s work</div>
          <div className="text" style={{ marginTop: 8, maxWidth: 860 }}>
            This is the “dashboard”: tasks, receipts, and what changed. Charts are evidence, not the homepage.
          </div>
        </div>
        <div className="row">
          <Chip tone={doing ? "accent" : "neutral"}>
            <PlayCircle size={14} /> {doing} doing
          </Chip>
          <Chip tone={blocked ? "bad" : "ok"}>
            <XCircle size={14} /> {blocked} blocked
          </Chip>
          <Chip tone="ok">
            <CheckCircle2 size={14} /> {done} done
          </Chip>
          <Chip>
            <Timer size={14} /> {model.nowLabel}
          </Chip>
        </div>
      </div>

      <div className="grid-4">
        <Stat label="Average" value={percent(model.summary.avg)} />
        <Stat label="Min" value={percent(model.summary.min)} />
        <Stat label="Max" value={percent(model.summary.max)} />
        <Stat label="Door signal" value={`${Math.round(model.doorPulse * 100)}%`} />
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: "1.2fr 0.8fr" }}>
        <Panel
          meta="Tasks"
          title="Active tasks"
          right={
            <Chip tone="accent">
              <Sparkles size={14} /> next action
            </Chip>
          }
        >
          <div style={{ display: "grid", gap: 10 }}>
            {priority.map((t) => {
              const tpl = TASK_TEMPLATES[t.key];
              const Icon = tpl.icon;
              const selected = t.id === selectedTaskId;
              return (
                <button
                  key={t.id}
                  className={cx("taskRow", selected && "taskRow--active")}
                  onClick={() => onSelectTask(t.id)}
                >
                  <div className="row" style={{ gap: 10 }}>
                    <div className="taskIcon">
                      <Icon size={16} />
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontWeight: 650 }}>{tpl.title}</div>
                      <div className="kicker" style={{ marginTop: 4 }}>
                        {tpl.meta} · owner: {t.owner}
                      </div>
                    </div>
                  </div>

                  <div className="row" style={{ gap: 10 }}>
                    <Chip tone={statusTone(t.status)}>
                      {t.status === "done" ? <BadgeCheck size={14} /> : <AlertTriangle size={14} style={{ opacity: 0.8 }} />}{" "}
                      {statusLabel(t.status)}
                    </Chip>
                    <span className="taskHint">
                      Open <ArrowRight size={14} />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="hr" />

          <div className="row" style={{ justifyContent: "space-between" }}>
            <div className="text">
              Tip: click a task, then jump into the corresponding page (Map/Diagnose/…).
            </div>
            <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
              <button className="btn" onClick={() => onOpenTask("t-001", "map")}>
                <span className="row" style={{ gap: 8 }}>
                  <Grid3X3 size={14} /> Go to Map
                </span>
              </button>
              <button className="btn" onClick={() => onOpenTask("t-002", "diagnose")}>
                <span className="row" style={{ gap: 8 }}>
                  <AlertTriangle size={14} /> Go to Diagnose
                </span>
              </button>
              <button className="btn" onClick={() => onOpenTask("t-003", "intervene")}>
                <span className="row" style={{ gap: 8 }}>
                  <Hammer size={14} /> Go to Intervene
                </span>
              </button>
            </div>
          </div>
        </Panel>

        <div style={{ display: "grid", gap: 18 }}>
          <Panel meta="Receipts" title="Receipts needed" right={<Chip>{receiptsNeeded.length}</Chip>}>
            {receiptsNeeded.length === 0 ? (
              <div className="text">No missing receipts right now.</div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {receiptsNeeded.map((t) => {
                  const tpl = TASK_TEMPLATES[t.key];
                  return (
                    <div key={t.id} className="box" style={{ padding: 14 }}>
                      <div className="row" style={{ justifyContent: "space-between" }}>
                        <div>
                          <div className="kicker">{tpl.meta}</div>
                          <div style={{ fontWeight: 650, marginTop: 6 }}>{tpl.title}</div>
                        </div>
                        <Chip tone="warn">
                          <FileText size={14} /> missing
                        </Chip>
                      </div>
                      <div className="text" style={{ marginTop: 8 }}>
                        Without a receipt, it’s vibes. With a receipt, it’s an auditable decision.
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>

          <Panel meta="Evidence" title="Stability snapshot" right={<Chip tone="accent"><BarChart3 size={14}/> trend</Chip>}>
            <div className="box" style={{ padding: 14 }}>
              <div className="kicker">Average RH (last 8h)</div>
              <div style={{ marginTop: 10 }}>
                <MiniSparkLine data={model.timeseries} />
              </div>
              <div className="text" style={{ marginTop: 10 }}>
                In the real portal, event markers + map links live here. In the POC: it proves the “charts as evidence” stance.
              </div>
            </div>
          </Panel>
        </div>
      </div>

      <div className="grid-2">
        <Panel meta="Spatial" title="Current slice" right={<Chip tone="accent"><Grid3X3 size={14}/> field</Chip>}>
          <FieldGrid grid={model.grid} door={model.door} />
        </Panel>

        <Panel meta="Changes" title="Recent events" right={<Chip><DoorOpen size={14}/> door</Chip>}>
          <div style={{ display: "grid", gap: 10 }}>
            {model.events.slice(0, 5).map((e) => (
              <div key={e.id} className="box" style={{ padding: 14 }}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div>
                    <div className="kicker">{e.when}</div>
                    <div style={{ fontWeight: 650, marginTop: 6 }}>{e.type}</div>
                  </div>
                  <Chip tone={e.severity > 0.66 ? "warn" : e.severity > 0.33 ? "neutral" : "ok"}>
                    {Math.round(e.severity * 100)}%
                  </Chip>
                </div>
                <div className="text" style={{ marginTop: 8, color: "var(--muted)" }}>
                  {e.note} · {e.durationSec}s
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function MapPage({ model, controls, setControls, tasks, selectedTask, onOpenTask, onToggleStep, onGenerateReceipt, onSetStatus, onNotes }) {
  const mapTask = tasks.find((t) => t.key === "COMMISSION_MAP") ?? selectedTask;
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker="Map"
        title="Commissioning & zone map"
        subtitle="In the real system: sensor-driven. In the POC: knobs exist to demonstrate drift paths and decision points."
        right={
          <>
            <Chip>
              <Timer size={14} /> {model.nowLabel}
            </Chip>
            <Chip tone={model.alerts.low.length ? "warn" : "ok"}>
              <AlertTriangle size={14} /> {model.alerts.low.length ? `${model.alerts.low.length} low zones` : "In range"}
            </Chip>
          </>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.55fr 1fr" }}>
        <Panel meta="Spatial" title="Field view" right={<Chip tone="accent">z={Math.round(controls.z * 100)}%</Chip>}>
          <FieldGrid grid={model.grid} door={model.door} />
        </Panel>

        <Panel meta="Task" title="Commission zone map" right={<Chip tone={statusTone(mapTask.status)}>{statusLabel(mapTask.status)}</Chip>}>
          <TaskCard
            task={mapTask}
            model={model}
            onOpen={() => onOpenTask(mapTask.id)}
            onToggleStep={onToggleStep}
            onGenerateReceipt={onGenerateReceipt}
            onSetStatus={onSetStatus}
            onNotes={onNotes}
          />
        </Panel>
      </div>

      <div className="grid-2">
        <Panel meta="Controls" title="Demo knobs" right={<Chip><SlidersHorizontal size={14}/> POC</Chip>}>
          <div style={{ display: "grid", gap: 12 }}>
            <Slider
              label="Height (z slice)"
              value={controls.z}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => setControls((c) => ({ ...c, z: v }))}
              format={(v) => `${Math.round(v * 100)}%`}
            />
            <Slider
              label="Time"
              value={controls.tMin}
              min={0}
              max={24 * 60 - 1}
              step={5}
              onChange={(v) => setControls((c) => ({ ...c, tMin: v }))}
              format={(v) => fmtTime(v)}
            />
            <Slider
              label="Door cycle intensity"
              value={controls.doorIntensity}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => setControls((c) => ({ ...c, doorIntensity: v }))}
              format={(v) => (v < 0.33 ? "Low" : v < 0.66 ? "Medium" : "High")}
            />
            <Slider
              label="Fan mixing"
              value={controls.fanMix}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => setControls((c) => ({ ...c, fanMix: v }))}
              format={(v) => (v < 0.33 ? "Low" : v < 0.66 ? "Medium" : "High")}
            />
          </div>
        </Panel>

        <Panel meta="Stressed zones" title="Most stressed (low)" right={<Chip>Low &lt; {controls.low}%</Chip>}>
          <div className="grid-2">
            {model.alerts.low.length === 0 ? (
              <div className="text">No low zones detected on this slice.</div>
            ) : (
              model.alerts.low.slice(0, 6).map((a, i) => (
                <div key={i} className="box" style={{ padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                  <div>
                    <div className="kicker">{zoneName(a.x, a.y, model.w, model.h)}</div>
                    <div style={{ marginTop: 6, fontWeight: 650 }}>{percent(a.v)}</div>
                  </div>
                  <Chip tone="warn">Low</Chip>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function DiagnosePage({ model, tasks, selectedTask, onOpenTask, onToggleStep, onGenerateReceipt, onSetStatus, onNotes }) {
  const diagTask = tasks.find((t) => t.key === "INVESTIGATE_POCKET") ?? selectedTask;
  const cantDecide = diagTask.status !== "done" && model.agreement < 0.75;

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker="Diagnose"
        title="Pocket triage (real vs sensor drama)"
        subtitle="The honest moment is “I don’t know.” The product is what happens next."
        right={
          <>
            <Chip tone={model.agreement > 0.85 ? "ok" : model.agreement > 0.7 ? "warn" : "bad"}>
              <ShieldCheck size={14} /> agreement {Math.round(model.agreement * 100)}%
            </Chip>
            <Chip tone={model.pocketScore > 0.66 ? "warn" : "neutral"}>
              <AlertTriangle size={14} /> pocket {Math.round(model.pocketScore * 100)}%
            </Chip>
          </>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.1fr 0.9fr" }}>
        <Panel meta="Evidence" title="What changed" right={<Chip><DoorOpen size={14}/> events</Chip>}>
          <div style={{ display: "grid", gap: 10 }}>
            {model.events.slice(0, 6).map((e) => (
              <div key={e.id} className="box" style={{ padding: 14 }}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div>
                    <div className="kicker">{e.when}</div>
                    <div style={{ fontWeight: 650, marginTop: 6 }}>{e.type}</div>
                  </div>
                  <Chip tone={e.severity > 0.66 ? "warn" : e.severity > 0.33 ? "neutral" : "ok"}>
                    {Math.round(e.severity * 100)}%
                  </Chip>
                </div>
                <div className="text" style={{ marginTop: 8, color: "var(--muted)" }}>
                  {e.note} · {e.durationSec}s
                </div>
              </div>
            ))}
          </div>

          <div className="hr" />

          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">POC explanation</div>
            <div className="text" style={{ marginTop: 8 }}>
              This page is not “a new chart.” It’s where the operator decides: is drift repeatable, correlated, and actionable?
            </div>
          </div>
        </Panel>

        <Panel meta="Task" title="Investigate pocket: Shelf C3" right={<Chip tone={statusTone(diagTask.status)}>{statusLabel(diagTask.status)}</Chip>}>
          <TaskCard
            task={diagTask}
            model={model}
            onOpen={() => onOpenTask(diagTask.id)}
            onToggleStep={onToggleStep}
            onGenerateReceipt={onGenerateReceipt}
            onSetStatus={onSetStatus}
            onNotes={onNotes}
          />

          {cantDecide && (
            <div className="box" style={{ marginTop: 12, padding: 14, border: "1px solid rgba(248,113,113,0.25)" }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div className="kicker">Can’t decide branch</div>
                <Chip tone="bad">
                  <XCircle size={14} /> low agreement
                </Chip>
              </div>
              <div className="text" style={{ marginTop: 8 }}>
                Don’t freeze. Pick a reversible next step:
              </div>
              <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
                <ActionRow icon={Wrench} title="Add temporary sensor (48h)" desc="Reduce ambiguity; confirm repeatability." />
                <ActionRow icon={PlayCircle} title="Run disturbance test (10 min)" desc="Small change → observe response." />
                <ActionRow icon={Grid3X3} title="Re-commission map" desc="If the world changed, refresh the reference." />
              </div>
            </div>
          )}
        </Panel>
      </div>

      <div className="grid-2">
        <Panel meta="Spatial" title="Field view (for context)" right={<Chip tone="accent"><Grid3X3 size={14}/> field</Chip>}>
          <FieldGrid grid={model.grid} door={model.door} />
        </Panel>

        <Panel meta="Receipts" title="What success looks like" right={<Chip><FileText size={14}/> auditable</Chip>}>
          <div style={{ display: "grid", gap: 10 }}>
            <div className="box" style={{ padding: 14 }}>
              <div className="kicker">Repeatability</div>
              <div className="text" style={{ marginTop: 8 }}>
                “Same shelf misbehaves” beats “random whack-a-mole.”
              </div>
            </div>
            <div className="box" style={{ padding: 14 }}>
              <div className="kicker">Correlation</div>
              <div className="text" style={{ marginTop: 8 }}>
                Door corridor or HVAC cycle explains the shape of drift.
              </div>
            </div>
            <div className="box" style={{ padding: 14 }}>
              <div className="kicker">Next action</div>
              <div className="text" style={{ marginTop: 8 }}>
                Avoid long-aging inventory in ambiguous zones until confidence improves.
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function IntervenePage({ model, tasks, selectedTask, onOpenTask, onToggleStep, onGenerateReceipt, onSetStatus, onNotes }) {
  const ivTask = tasks.find((t) => t.key === "PLAN_INTERVENTION") ?? selectedTask;
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker="Intervene"
        title="Plan a small, reversible action"
        subtitle="Operators don’t need a 40-slide model story. They need an action + a verification plan."
        right={
          <>
            <Chip tone="accent">
              <Hammer size={14} /> action
            </Chip>
            <Chip>
              <Timer size={14} /> {model.nowLabel}
            </Chip>
          </>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.1fr 0.9fr" }}>
        <Panel meta="Action library" title="Common plays" right={<Chip>POC</Chip>}>
          <div style={{ display: "grid", gap: 10 }}>
            <ActionRow icon={DoorOpen} title="Reduce door dwell" desc="Cut corridor injection during peak traffic." />
            <ActionRow icon={Wrench} title="Airflow staging" desc="Place a small fan to break a channel." />
            <ActionRow icon={Hammer} title="Move humidifier 1–2 ft" desc="Small move; measure response." />
            <ActionRow icon={Grid3X3} title="Relocate one shelf batch" desc="Move long-age away from unstable pocket." />
          </div>

          <div className="hr" />

          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Design principle</div>
            <div className="text" style={{ marginTop: 8 }}>
              Every intervention must include: <b>target</b>, <b>expected change</b>, <b>verification window W</b>.
            </div>
          </div>
        </Panel>

        <Panel meta="Task" title="Plan intervention" right={<Chip tone={statusTone(ivTask.status)}>{statusLabel(ivTask.status)}</Chip>}>
          <TaskCard
            task={ivTask}
            model={model}
            onOpen={() => onOpenTask(ivTask.id)}
            onToggleStep={onToggleStep}
            onGenerateReceipt={onGenerateReceipt}
            onSetStatus={onSetStatus}
            onNotes={onNotes}
          />
        </Panel>
      </div>

      <div className="grid-2">
        <Panel meta="Evidence" title="Trend context" right={<Chip tone="accent"><BarChart3 size={14}/> evidence</Chip>}>
          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Average RH (last 8h)</div>
            <div style={{ marginTop: 10 }}>
              <MiniSparkLine data={model.timeseries} height={72} />
            </div>
            <div className="text" style={{ marginTop: 10 }}>
              In the full system, interventions appear as markers and are linkable receipts.
            </div>
          </div>
        </Panel>

        <Panel meta="Spatial" title="Target context" right={<Chip tone="accent"><Grid3X3 size={14}/> field</Chip>}>
          <FieldGrid grid={model.grid} door={model.door} />
        </Panel>
      </div>
    </div>
  );
}

function VerifyPage({ model, tasks, selectedTask, onOpenTask, onToggleStep, onGenerateReceipt, onSetStatus, onNotes }) {
  const vTask = tasks.find((t) => t.key === "VERIFY_INTERVENTION") ?? selectedTask;
  const pass = model.summary.sd < 0.95 && model.alerts.low.length < 3;

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker="Verify"
        title="Before/after receipts"
        subtitle="If it’s not verifiable, it’s not operational."
        right={
          <>
            <Chip tone={pass ? "ok" : "warn"}>
              <ClipboardCheck size={14} /> {pass ? "looks improved" : "needs follow-up"}
            </Chip>
            <Chip>
              <Timer size={14} /> {model.nowLabel}
            </Chip>
          </>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.1fr 0.9fr" }}>
        <Panel meta="Receipt preview" title="Delta summary (POC)" right={<Chip><FileText size={14}/> receipt</Chip>}>
          <div className="box" style={{ padding: 14 }}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div>
                <div className="kicker">Acceptance signals</div>
                <div style={{ fontWeight: 650, marginTop: 6 }}>Variance + low-zone count</div>
              </div>
              <Chip tone={pass ? "ok" : "warn"}>{pass ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />} {pass ? "Pass-ish" : "Investigate"}</Chip>
            </div>

            <div className="grid-2" style={{ marginTop: 12 }}>
              <div className="miniStat">
                <div className="kicker">Std dev</div>
                <div className="miniStatV">{model.summary.sd.toFixed(2)}</div>
              </div>
              <div className="miniStat">
                <div className="kicker">Low zones</div>
                <div className="miniStatV">{model.alerts.low.length}</div>
              </div>
            </div>

            <div className="text" style={{ marginTop: 12 }}>
              In production, this card is generated from two windows W (before/after) + intervention log.
            </div>
          </div>

          <div className="box" style={{ padding: 14, marginTop: 12 }}>
            <div className="kicker">Trend evidence</div>
            <div style={{ marginTop: 10 }}>
              <MiniSparkLine data={model.timeseries} height={72} />
            </div>
          </div>
        </Panel>

        <Panel meta="Task" title="Verify intervention" right={<Chip tone={statusTone(vTask.status)}>{statusLabel(vTask.status)}</Chip>}>
          <TaskCard
            task={vTask}
            model={model}
            onOpen={() => onOpenTask(vTask.id)}
            onToggleStep={onToggleStep}
            onGenerateReceipt={onGenerateReceipt}
            onSetStatus={onSetStatus}
            onNotes={onNotes}
          />
        </Panel>
      </div>

      <Panel meta="Spatial" title="Field view (after window)" right={<Chip tone="accent"><Grid3X3 size={14}/> field</Chip>}>
        <FieldGrid grid={model.grid} door={model.door} />
      </Panel>
    </div>
  );
}

function RulesPage({ model, tasks, selectedTask, onOpenTask, onToggleStep, onGenerateReceipt, onSetStatus, onNotes }) {
  const rTask = tasks.find((t) => t.key === "UPDATE_RULES") ?? selectedTask;
  const [rulesText, setRulesText] = useState(
    [
      "Placement rules (v0.1)",
      "",
      "• Long-age inventory: Zone NW shelves (stable band).",
      "• Quick-turn: near door corridor is allowed (higher variability).",
      "• Fragile wrappers: avoid SE pocket shelves until verified stable.",
      "• If “can’t decide”: park long-age in stable zones and add temporary sensor for 48h.",
    ].join("\n")
  );

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker="Rules"
        title="Turn conclusions into staff-proof instructions"
        subtitle="This is how you stop the room drifting back into chaos because someone stocked “where there was space.”"
        right={
          <>
            <Chip tone="accent">
              <ScrollText size={14} /> playbook
            </Chip>
            <Chip>
              <Timer size={14} /> {model.nowLabel}
            </Chip>
          </>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.1fr 0.9fr" }}>
        <Panel meta="Rules editor" title="Placement rules" right={<Chip>draft</Chip>}>
          <textarea
            className="textarea"
            value={rulesText}
            onChange={(e) => setRulesText(e.target.value)}
            rows={16}
          />
          <div className="row" style={{ justifyContent: "space-between", marginTop: 12 }}>
            <div className="text">In production: versioned diffs + linked receipts/map versions.</div>
            <button className="btn btn--primary">
              <span className="row" style={{ gap: 8 }}>
                <ScrollText size={14} /> Publish rules
              </span>
            </button>
          </div>
        </Panel>

        <Panel meta="Task" title="Update placement rules" right={<Chip tone={statusTone(rTask.status)}>{statusLabel(rTask.status)}</Chip>}>
          <TaskCard
            task={rTask}
            model={model}
            onOpen={() => onOpenTask(rTask.id)}
            onToggleStep={onToggleStep}
            onGenerateReceipt={onGenerateReceipt}
            onSetStatus={onSetStatus}
            onNotes={onNotes}
          />
        </Panel>
      </div>

      <div className="grid-2">
        <Panel meta="Staff" title="Printable instructions" right={<Chip><FileText size={14}/> one-pager</Chip>}>
          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Humidor stocking quick rules</div>
            <ul className="ul">
              <li>Long-age stays in stable zones (map version is the source of truth).</li>
              <li>Door corridor is “high variance”: use for quick-turn only.</li>
              <li>If you moved equipment: create an event entry. It invalidates old assumptions.</li>
              <li>If uncertain: park valuable inventory in stable zones and escalate a quick re-check.</li>
            </ul>
          </div>
        </Panel>

        <Panel meta="Context" title="Field snapshot" right={<Chip tone="accent"><Grid3X3 size={14}/> field</Chip>}>
          <FieldGrid grid={model.grid} door={model.door} />
        </Panel>
      </div>
    </div>
  );
}

function SettingsPage({ controls, setControls, model }) {
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker="Settings"
        title="Thresholds & policy (POC)"
        subtitle="Where customers configure alert thresholds, routing, and model assumptions."
        right={
          <>
            <Chip>
              <Settings size={14} /> config
            </Chip>
            <Chip tone={model.alerts.low.length ? "warn" : "ok"}>
              <AlertTriangle size={14} /> {model.alerts.low.length ? "alerts active" : "quiet"}
            </Chip>
          </>
        }
      />

      <div className="grid-2">
        <Panel meta="Thresholds" title="Alert bounds" right={<Chip tone="accent">Interactive</Chip>}>
          <div style={{ display: "grid", gap: 12 }}>
            <Slider
              label="Low threshold"
              value={controls.low}
              min={60}
              max={70}
              step={0.1}
              onChange={(v) => setControls((c) => ({ ...c, low: v }))}
              format={(v) => `${v.toFixed(1)}%`}
            />
            <Slider
              label="High threshold"
              value={controls.high}
              min={70}
              max={78}
              step={0.1}
              onChange={(v) => setControls((c) => ({ ...c, high: v }))}
              format={(v) => `${v.toFixed(1)}%`}
            />

            <div className="box" style={{ padding: 14 }}>
              <div className="kicker">Routing (placeholder)</div>
              <div className="text" style={{ marginTop: 8 }}>
                Notify owner + staff group when low zones persist 20 minutes. Escalate if repeat drift appears 3 days in a row.
              </div>
            </div>
          </div>
        </Panel>

        <Panel meta="Model" title="Demo assumptions" right={<Chip><SlidersHorizontal size={14}/> knobs</Chip>}>
          <div style={{ display: "grid", gap: 12 }}>
            <Slider
              label="Door cycle intensity"
              value={controls.doorIntensity}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => setControls((c) => ({ ...c, doorIntensity: v }))}
              format={(v) => (v < 0.33 ? "Low" : v < 0.66 ? "Medium" : "High")}
            />
            <Slider
              label="Fan mixing"
              value={controls.fanMix}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => setControls((c) => ({ ...c, fanMix: v }))}
              format={(v) => (v < 0.33 ? "Low" : v < 0.66 ? "Medium" : "High")}
            />
            <div className="text">
              In a real deployment, these become learned parameters + configuration, not user sliders.
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

// -----------------------------
// task detail widget (reused)
// -----------------------------
function TaskCard({ task, model, onOpen, onToggleStep, onGenerateReceipt, onSetStatus, onNotes }) {
  const tpl = TASK_TEMPLATES[task.key];
  const Icon = tpl.icon;
  const stepsDone = task.completed?.size ?? 0;
  const progress = stepsDone / tpl.steps.length;

  return (
    <div>
      <div className="box" style={{ padding: 14 }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div className="row" style={{ gap: 10 }}>
            <div className="taskIcon" style={{ width: 34, height: 34 }}>
              <Icon size={16} />
            </div>
            <div>
              <div className="kicker">{tpl.meta}</div>
              <div style={{ fontWeight: 650, marginTop: 6 }}>{tpl.title}</div>
            </div>
          </div>
          <Chip tone={statusTone(task.status)}>{statusLabel(task.status)}</Chip>
        </div>

        <div className="text" style={{ marginTop: 10 }}>
          {tpl.description}
        </div>

        <div style={{ marginTop: 12 }}>
          <div className="kicker">Progress</div>
          <div className="progress">
            <div className="progress-bar" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
          <div className="row" style={{ justifyContent: "space-between", marginTop: 6 }}>
            <div className="kicker">{stepsDone}/{tpl.steps.length} steps done</div>
            <div className="kicker">avg {percent(model.summary.avg)} · sd {model.summary.sd.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="box" style={{ padding: 14, marginTop: 12 }}>
        <div className="kicker">Checklist</div>
        <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
          {tpl.steps.map((s, idx) => {
            const checked = task.completed?.has?.(idx);
            return (
              <button
                key={idx}
                className={cx("checkRow", checked && "checkRow--on")}
                onClick={() => onToggleStep(task.id, idx)}
              >
                <span className={cx("checkDot", checked && "checkDot--on")}>
                  {checked ? <CheckCircle2 size={14} /> : <span style={{ width: 14, height: 14, display: "inline-block" }} />}
                </span>
                <span style={{ textAlign: "left" }}>{s}</span>
              </button>
            );
          })}
        </div>

        <div className="hr" />

        <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
            <button className="btn" onClick={onOpen}>
              <span className="row" style={{ gap: 8 }}>
                <ArrowRight size={14} /> Focus
              </span>
            </button>
            <button className="btn" onClick={() => onSetStatus(task.id, "blocked")}>
              <span className="row" style={{ gap: 8 }}>
                <XCircle size={14} /> Block
              </span>
            </button>
            <button className="btn" onClick={() => onSetStatus(task.id, "doing")}>
              <span className="row" style={{ gap: 8 }}>
                <PlayCircle size={14} /> Work
              </span>
            </button>
          </div>

          <button
            className={cx("btn", "btn--primary")}
            disabled={stepsDone < Math.max(2, tpl.steps.length - 1)}
            onClick={() => onGenerateReceipt(task.id)}
            title={stepsDone < tpl.steps.length - 1 ? "Complete most steps first" : "Generate receipt"}
          >
            <span className="row" style={{ gap: 8 }}>
              <FileText size={14} /> Generate receipt
            </span>
          </button>
        </div>
      </div>

      <div className="box" style={{ padding: 14, marginTop: 12 }}>
        <div className="kicker">Operator notes</div>
        <textarea
          className="textarea"
          value={task.notes ?? ""}
          onChange={(e) => onNotes(task.id, e.target.value)}
          rows={4}
          placeholder="Add quick notes: what changed, what you tried, what you suspect."
          style={{ marginTop: 10 }}
        />
      </div>

      {task.receipt && (
        <div className="box" style={{ padding: 14, marginTop: 12, border: "1px solid rgba(34,197,94,0.18)" }}>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div>
              <div className="kicker">Receipt</div>
              <div style={{ fontWeight: 650, marginTop: 6 }}>{task.receipt.id}</div>
            </div>
            <Chip tone="ok">
              <BadgeCheck size={14} /> generated
            </Chip>
          </div>
          <div className="text" style={{ marginTop: 10 }}>
            <b>{task.receipt.title}</b> · {task.receipt.when}
          </div>
          <ul className="ul" style={{ marginTop: 10 }}>
            {task.receipt.bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Header({ kicker, title, subtitle, right }) {
  return (
    <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <div className="kicker">{kicker}</div>
        <div style={{ fontSize: 32, fontWeight: 650, marginTop: 6 }}>{title}</div>
        <div className="text" style={{ marginTop: 8, maxWidth: 860 }}>
          {subtitle}
        </div>
      </div>
      <div className="row">{right}</div>
    </div>
  );
}

function ActionRow({ icon: Icon, title, desc }) {
  return (
    <div className="actionRow">
      <div className="actionIcon">
        <Icon size={16} />
      </div>
      <div>
        <div style={{ fontWeight: 650 }}>{title}</div>
        <div className="kicker" style={{ marginTop: 4 }}>
          {desc}
        </div>
      </div>
    </div>
  );
}

// -----------------------------
// CSS (same vibe as your sample)
// -----------------------------
function Style() {
  return (
    <style>{`
:root{
  --bg0:#020617;
  --bg1:#0b1220;
  --panel: rgba(15,23,42,.55);
  --panel2: rgba(15,23,42,.35);
  --border: rgba(255,255,255,.10);
  --border2: rgba(255,255,255,.14);
  --text: rgba(226,232,240,.95);
  --muted: rgba(148,163,184,.92);
  --muted2: rgba(148,163,184,.75);
  --shadow: 0 18px 60px rgba(0,0,0,.42);
  --shadow2: 0 10px 26px rgba(0,0,0,.35);
  --r: 18px;
}

*{ box-sizing: border-box; }
html, body { height:100%; background: radial-gradient(1200px 900px at 10% 10%, rgba(56,189,248,.10), transparent 55%),
             radial-gradient(900px 700px at 85% 20%, rgba(34,197,94,.08), transparent 60%),
             radial-gradient(900px 700px at 50% 95%, rgba(244,63,94,.06), transparent 60%),
             linear-gradient(180deg, var(--bg1), var(--bg0));
            color: var(--text); margin:0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; }
a{ color: inherit; }

.container{ width: min(1200px, calc(100% - 40px)); margin: 0 auto; }
.footer{ color: var(--muted2); font-size: 12px; padding: 22px 0 26px; text-align: center; }

.kicker{ font-size: 12px; letter-spacing: .12em; text-transform: uppercase; color: var(--muted2); }
.text{ color: var(--muted); font-size: 14px; line-height: 1.55; }
.h1{ font-size: 22px; font-weight: 700; margin-top: 4px; }

.topbar{
  position: sticky; top: 0; z-index: 10;
  backdrop-filter: blur(10px);
  background: linear-gradient(180deg, rgba(2,6,23,.78), rgba(2,6,23,.55));
  border-bottom: 1px solid rgba(255,255,255,.08);
}
.topbar-inner{ display:flex; align-items:center; justify-content:space-between; padding: 18px 0; gap: 12px; }

.row{ display:flex; align-items:center; gap: 12px; }

.layout{ display:grid; grid-template-columns: 270px 1fr; gap: 18px; padding: 18px 0 0; }
@media (max-width: 980px){
  .layout{ grid-template-columns: 1fr; }
}

.sidebar{
  background: linear-gradient(180deg, rgba(15,23,42,.55), rgba(15,23,42,.35));
  border: 1px solid rgba(255,255,255,.10);
  border-radius: var(--r);
  padding: 14px;
  box-shadow: var(--shadow2);
  height: fit-content;
}
.sidebar-note{
  margin-top: 12px;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(2,6,23,.35);
  color: var(--muted);
  font-size: 13px;
  line-height: 1.5;
}

.main{ padding-bottom: 12px; }

.navbtn{
  width: 100%;
  display:flex;
  align-items:center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(2,6,23,.25);
  cursor: pointer;
  transition: transform .06s ease, border-color .12s ease, background .12s ease;
}
.navbtn:hover{ transform: translateY(-1px); border-color: rgba(255,255,255,.18); background: rgba(2,6,23,.35); }
.navbtn--active{ border-color: rgba(56,189,248,.35); background: rgba(2,6,23,.40); }

.panel{
  border-radius: var(--r);
  border: 1px solid rgba(255,255,255,.10);
  background: linear-gradient(180deg, rgba(15,23,42,.55), rgba(15,23,42,.35));
  box-shadow: var(--shadow2);
  overflow: hidden;
}
.panel-head{
  padding: 14px 14px 12px;
  display:flex; justify-content:space-between; align-items:flex-start; gap: 14px;
  border-bottom: 1px solid rgba(255,255,255,.08);
}
.panel-title{ font-size: 18px; font-weight: 700; margin-top: 6px; }
.panel-body{ padding: 14px; }

.box{
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(2,6,23,.32);
}

.grid-2{ display:grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.grid-4{ display:grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
@media (max-width: 980px){
  .grid-2{ grid-template-columns: 1fr; }
  .grid-4{ grid-template-columns: repeat(2, 1fr); }
}

.stat{
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(2,6,23,.30);
  padding: 12px 14px;
}
.stat-label{ color: var(--muted2); font-size: 12px; letter-spacing: .08em; text-transform: uppercase; }
.stat-value{ font-size: 22px; font-weight: 750; margin-top: 8px; }

.miniStat{
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(2,6,23,.25);
  padding: 10px 12px;
}
.miniStatV{ font-size: 18px; font-weight: 750; margin-top: 6px; }

.chip{
  display:inline-flex; align-items:center; gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(2,6,23,.32);
  color: var(--text);
  font-size: 12px;
  font-weight: 650;
}
.chip--accent{ border-color: rgba(56,189,248,.35); background: rgba(56,189,248,.10); }
.chip--ok{ border-color: rgba(34,197,94,.35); background: rgba(34,197,94,.10); }
.chip--warn{ border-color: rgba(251,191,36,.35); background: rgba(251,191,36,.10); }
.chip--bad{ border-color: rgba(248,113,113,.35); background: rgba(248,113,113,.10); }

.btn{
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(2,6,23,.28);
  color: var(--text);
  border-radius: 14px;
  padding: 10px 12px;
  cursor: pointer;
  transition: transform .06s ease, border-color .12s ease, background .12s ease;
  font-weight: 650;
}
.btn:hover{ transform: translateY(-1px); border-color: rgba(255,255,255,.18); background: rgba(2,6,23,.38); }
.btn:disabled{ opacity: .45; cursor: not-allowed; transform: none; }
.btn--primary{
  border-color: rgba(56,189,248,.40);
  background: rgba(56,189,248,.12);
}

.field{ display:grid; gap: 10px; }
.field-top{ display:flex; align-items:flex-start; justify-content: space-between; gap: 12px; }
.field-grid{
  display:grid;
  gap: 6px;
  padding: 10px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(2,6,23,.32);
}
.cell{
  border-radius: 9px;
  aspect-ratio: 1 / 1;
  border: 1px solid rgba(255,255,255,.06);
}
.cell--door{
  outline: 2px solid rgba(226,232,240,.65);
  outline-offset: 2px;
}

.slider{ border-radius: 14px; border: 1px solid rgba(255,255,255,.10); background: rgba(2,6,23,.25); padding: 12px; }
.slider-top{ display:flex; justify-content:space-between; align-items:center; gap: 10px; }
.range{ width: 100%; margin-top: 10px; }

.label{ display:grid; gap: 8px; margin-top: 12px; }
.input{
  width:100%;
  padding: 12px 12px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(2,6,23,.35);
  color: var(--text);
  outline: none;
}
.input:focus{ border-color: rgba(56,189,248,.35); box-shadow: 0 0 0 4px rgba(56,189,248,.08); }

.textarea{
  width:100%;
  padding: 12px 12px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(2,6,23,.35);
  color: var(--text);
  outline: none;
  resize: vertical;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 13px;
  line-height: 1.5;
}
.textarea:focus{ border-color: rgba(56,189,248,.35); box-shadow: 0 0 0 4px rgba(56,189,248,.08); }

.login{ min-height: 100vh; display:flex; align-items: center; padding: 40px 0; }
.login-grid{ display:grid; grid-template-columns: 1.1fr 0.9fr; gap: 18px; margin-top: 18px; }
@media (max-width: 980px){
  .login{ padding: 26px 0; }
  .login-grid{ grid-template-columns: 1fr; }
}

.hr{ height: 1px; background: rgba(255,255,255,.08); margin: 12px 0; }

.taskRow{
  width: 100%;
  text-align: left;
  display:flex; align-items:center; justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(2,6,23,.25);
  cursor: pointer;
  transition: transform .06s ease, border-color .12s ease, background .12s ease;
}
.taskRow:hover{ transform: translateY(-1px); border-color: rgba(255,255,255,.18); background: rgba(2,6,23,.35); }
.taskRow--active{ border-color: rgba(56,189,248,.35); background: rgba(2,6,23,.42); }
.taskIcon{
  width: 30px; height: 30px; border-radius: 12px;
  display:flex; align-items:center; justify-content:center;
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(2,6,23,.30);
}
.taskHint{ color: var(--muted2); font-weight: 650; display:inline-flex; align-items:center; gap: 8px; }

.checkRow{
  width:100%;
  display:flex; align-items:flex-start; gap: 10px;
  padding: 10px 10px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(2,6,23,.22);
  cursor: pointer;
  transition: border-color .12s ease, background .12s ease, transform .06s ease;
  color: var(--text);
}
.checkRow:hover{ transform: translateY(-1px); border-color: rgba(255,255,255,.16); background: rgba(2,6,23,.30); }
.checkRow--on{ border-color: rgba(34,197,94,.28); background: rgba(34,197,94,.06); }
.checkDot{
  width: 26px; height: 26px; border-radius: 10px;
  display:flex; align-items:center; justify-content:center;
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(2,6,23,.25);
}
.checkDot--on{ border-color: rgba(34,197,94,.35); background: rgba(34,197,94,.10); }

.progress{
  width: 100%;
  height: 10px;
  border-radius: 999px;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.08);
  overflow: hidden;
  margin-top: 8px;
}
.progress-bar{
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(56,189,248,.85), rgba(34,197,94,.65));
}

.actionRow{
  display:flex; gap: 12px; align-items:flex-start;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(2,6,23,.25);
}
.actionIcon{
  width: 34px; height: 34px; border-radius: 14px;
  display:flex; align-items:center; justify-content:center;
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(2,6,23,.30);
}

.ul{ margin: 10px 0 0; padding-left: 18px; color: var(--muted); }
.ul li{ margin: 8px 0; }
`}</style>
  );
}
