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
import {cx} from "/src/module/algorithm/ui/classnames"; 
import {clamp, lerp} from "/src/module/algorithm/core/math"; 
import {mulberry32} from "/src/module/algorithm/core/rng";
import {fmtTime} from "/src/module/algorithm/domain/time"
import {percent} from "/src/module/algorithm/domain/number"
import {humidityColor} from "/src/module/algorithm/format/humidity/color"
import {zoneName} from "/src/module/algorithm/format/zones/naming"

// ---------- simulated model ----------
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
  let min = Infinity, max = -Infinity, sum = 0, n = 0;
  for (const row of grid) for (const v of row) { min = Math.min(min, v); max = Math.max(max, v); sum += v; n++; }
  return { min, max, avg: sum / n };
}

function computeAlerts(grid, { low = 66.5, high = 72.5 }) {
  const h = grid.length, w = grid[0].length;
  const lows = [], highs = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const v = grid[y][x];
    if (v < low) lows.push({ x, y, v });
    if (v > high) highs.push({ x, y, v });
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
    out.push({ t: fmtTime((tMin + 24 * 60) % (24 * 60)), avg: +s.avg.toFixed(2), min: +s.min.toFixed(2), max: +s.max.toFixed(2) });
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

// ---------- UI ----------
function Chip({ tone = "neutral", children }) {
  return <span className={cx("chip", tone === "accent" && "chip--accent", tone === "ok" && "chip--ok", tone === "warn" && "chip--warn", tone === "bad" && "chip--bad")}>{children}</span>;
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
        <div className="kicker">Room slice (top-down)</div>
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
      <input className="range" type="range" value={value} min={min} max={max} step={step} onChange={(e) => onChange(+e.target.value)} />
    </div>
  );
}

// ---------- pages ----------
const NAV = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "map", label: "Room map", icon: Grid3X3 },
  { key: "trends", label: "Trends", icon: BarChart3 },
  { key: "events", label: "Events", icon: DoorOpen },
  { key: "settings", label: "Settings", icon: Settings },
];

function Login({ onLogin }) {
  const [tenant, setTenant] = useState("Cedar & Ash Cigar Lounge");
  const [room, setRoom] = useState("Walk-in Humidor");
  return (
    <div className="login">
      <div className="container">
        <div className="kicker">Portal POC</div>
        <h1 style={{ margin: "12px 0 0", fontSize: 42, fontWeight: 650 }}>Cigar room monitoring portal</h1>
        <p className="text" style={{ maxWidth: 760, marginTop: 12 }}>
          Customer-experience-first demo. Data is simulated. This shows what your team would use if the room were instrumented.
        </p>

        <div className="login-grid">
          <div className="box">
            <div className="kicker">Enter a demo tenant</div>

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
              In production this would be SSO. For the POC, it drops you into the portal immediately.
            </p>
          </div>

          <div className="box" style={{ background: "linear-gradient(180deg, rgba(15,23,42,.75), rgba(2,6,23,.70))", boxShadow: "var(--shadow)" }}>
            <div className="kicker">What this proves</div>
            <div style={{ marginTop: 14 }} className="text">
              Map → drift pockets and door paths. Trends → variance bands. Events → correlation. Settings → thresholds and routing.
            </div>
            <div className="row" style={{ marginTop: 14 }}>
              <Chip tone="accent"><ShieldCheck size={14}/> POC · simulated</Chip>
            </div>
          </div>
        </div>

        <div className="footer">© {new Date().getFullYear()} HermodLabs</div>
      </div>
    </div>
  );
}

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
    const w = 20, h = 12;
    const { grid, door, doorPulse } = simulateField({
      w, h,
      z: controls.z,
      tMin: controls.tMin,
      doorIntensity: controls.doorIntensity,
      fanMix: controls.fanMix,
      seed: 11,
    });
    const summary = summarizeGrid(grid);
    const alerts = computeAlerts(grid, { low: 66.5, high: 72.5 });
    const timeseries = buildTimeseries({ points: 48, seed: 11, z: controls.z, doorIntensity: controls.doorIntensity, fanMix: controls.fanMix });
    const events = buildEvents({ seed: 11, doorIntensity: controls.doorIntensity });

    return { w, h, grid, door, doorPulse, summary, alerts, timeseries, events, nowLabel: fmtTime(controls.tMin) };
  }, [controls]);

  if (!auth) return <Login onLogin={setAuth} />;

  return (
    <>
      <div className="topbar">
        <div className="container">
          <div className="topbar-inner">
            <div>
              <div className="kicker">{auth.tenant}</div>
              <div className="h1">{auth.room}</div>
            </div>
            <div className="row">
              <Chip tone="accent"><ShieldCheck size={14}/> POC · simulated data</Chip>
              <button className="btn" onClick={() => { setAuth(null); setActive("dashboard"); }}>
                <span style={{ display:"inline-flex", gap:8, alignItems:"center" }}><LogOut size={14}/> Logout</span>
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
              <div className="kicker">Operator workflow</div>
              <div style={{ marginTop: 8 }}>
                Map → identify drift path → correlate with events → take action.
              </div>
            </div>
          </aside>

          <main className="main">
            {active === "dashboard" && <Dashboard model={model} />}
            {active === "map" && <RoomMap model={model} controls={controls} setControls={setControls} />}
            {active === "trends" && <Trends model={model} />}
            {active === "events" && <Events model={model} />}
            {active === "settings" && <SettingsPage controls={controls} setControls={setControls} />}
          </main>
        </div>

        <div className="footer">© {new Date().getFullYear()} HermodLabs · Portal POC</div>
      </div>
    </>
  );
}

function Dashboard({ model }) {
  const { summary, alerts, doorPulse, nowLabel } = model;
  const tone = alerts.low.length ? (alerts.low.length > 3 ? "bad" : "warn") : "ok";

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <div className="kicker">Dashboard</div>
          <div style={{ fontSize: 32, fontWeight: 650, marginTop: 6 }}>Room health</div>
          <div className="text" style={{ marginTop: 8, maxWidth: 760 }}>
            Snapshot: zone alerts, field summary, and the current door-cycle signal.
          </div>
        </div>
        <div className="row">
          <Chip tone={tone}><AlertTriangle size={14}/> {alerts.low.length ? `${alerts.low.length} low zones` : "No low zones"}</Chip>
          <Chip><Timer size={14}/> Now · {nowLabel}</Chip>
        </div>
      </div>

      <div className="grid-4">
        <Stat label="Average" value={percent(summary.avg)} />
        <Stat label="Min" value={percent(summary.min)} />
        <Stat label="Max" value={percent(summary.max)} />
        <Stat label="Door signal" value={`${Math.round(doorPulse * 100)}%`} />
      </div>

      <div className="grid-2">
        <Panel meta="Spatial" title="Current slice" right={<Chip tone="accent"><Grid3X3 size={14}/> Field view</Chip>}>
          <FieldGrid grid={model.grid} door={model.door} />
        </Panel>

        <Panel meta="Actions" title="Recommended next steps" right={<Chip>POC</Chip>}>
          <div style={{ display: "grid", gap: 10 }}>
            <div className="box" style={{ padding: 14 }}>
              <div className="kicker">If low zones persist</div>
              <div className="text" style={{ marginTop: 6 }}>
                Rotate inventory away from the lowest zones and inspect door-side shelves for repeatable drift.
              </div>
            </div>
            <div className="box" style={{ padding: 14 }}>
              <div className="kicker">If door signal is high</div>
              <div className="text" style={{ marginTop: 6 }}>
                Reduce door dwell during peak traffic; adjust fan placement to break the corridor.
              </div>
            </div>
            <div className="box" style={{ padding: 14 }}>
              <div className="kicker">Note</div>
              <div className="text" style={{ marginTop: 6 }}>
                Data is simulated. The portal workflow is what you’re selling.
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function RoomMap({ model, controls, setControls }) {
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <div className="kicker">Room map</div>
          <div style={{ fontSize: 32, fontWeight: 650, marginTop: 6 }}>Humidity field slice</div>
          <div className="text" style={{ marginTop: 8, maxWidth: 760 }}>
            In production this is sensor-driven. In the POC, use the knobs to demonstrate drift paths.
          </div>
        </div>
        <div className="row">
          <Chip><Timer size={14}/> {model.nowLabel}</Chip>
          <Chip tone={model.alerts.low.length ? "warn" : "ok"}><AlertTriangle size={14}/> {model.alerts.low.length ? `${model.alerts.low.length} low zones` : "In range"}</Chip>
        </div>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: "1.6fr 1fr" }}>
        <Panel meta="Spatial" title="Field view" right={<Chip tone="accent">z={Math.round(controls.z * 100)}%</Chip>}>
          <FieldGrid grid={model.grid} door={model.door} />
        </Panel>

        <Panel meta="Controls" title="Demo knobs" right={<Chip>POC</Chip>}>
          <div style={{ display: "grid", gap: 12 }}>
            <Slider label="Height (z slice)" value={controls.z} min={0} max={1} step={0.01}
              onChange={(v) => setControls((c) => ({ ...c, z: v }))}
              format={(v) => `${Math.round(v * 100)}%`}
            />
            <Slider label="Time" value={controls.tMin} min={0} max={24 * 60 - 1} step={5}
              onChange={(v) => setControls((c) => ({ ...c, tMin: v }))}
              format={(v) => fmtTime(v)}
            />
            <Slider label="Door cycle intensity" value={controls.doorIntensity} min={0} max={1} step={0.01}
              onChange={(v) => setControls((c) => ({ ...c, doorIntensity: v }))}
              format={(v) => (v < 0.33 ? "Low" : v < 0.66 ? "Medium" : "High")}
            />
            <Slider label="Fan mixing" value={controls.fanMix} min={0} max={1} step={0.01}
              onChange={(v) => setControls((c) => ({ ...c, fanMix: v }))}
              format={(v) => (v < 0.33 ? "Low" : v < 0.66 ? "Medium" : "High")}
            />
          </div>
        </Panel>
      </div>

      <Panel meta="Zones" title="Most stressed zones" right={<Chip>Low &lt; 66.5%</Chip>}>
        <div className="grid-2">
          {model.alerts.low.length === 0 ? (
            <div className="text">No low zones detected on this slice.</div>
          ) : (
            model.alerts.low.map((a, i) => (
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
  );
}

function Trends({ model }) {
  const data = model.timeseries;
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <div className="kicker">Trends</div>
          <div style={{ fontSize: 32, fontWeight: 650, marginTop: 6 }}>Humidity over time</div>
          <div className="text" style={{ marginTop: 8, maxWidth: 760 }}>
            Shows stability and variance. Operators use this to correlate drift with events.
          </div>
        </div>
        <div className="row">
          <Chip><Timer size={14}/> Last 8 hours</Chip>
          <Chip tone="accent"><BarChart3 size={14}/> Avg / Min / Max</Chip>
        </div>
      </div>

      <div className="grid-2">
        <Panel meta="Trend" title="Average RH" right={<Chip>Simulated</Chip>}>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="t" stroke="rgba(255,255,255,0.35)" tick={{ fontSize: 11 }} />
                <YAxis stroke="rgba(255,255,255,0.35)" tick={{ fontSize: 11 }} domain={[63, 75]} />
                <Tooltip contentStyle={{ background: "rgba(2,6,23,0.95)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "#e5e7eb" }} />
                <Line type="monotone" dataKey="avg" strokeWidth={2} dot={false} stroke="rgba(56,189,248,0.9)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text" style={{ marginTop: 10 }}>
            In the full portal, event markers (door cycles, humidifier runs) would appear here.
          </div>
        </Panel>

        <Panel meta="Spread" title="Min / Max band" right={<Chip>Variance</Chip>}>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="t" stroke="rgba(255,255,255,0.35)" tick={{ fontSize: 11 }} />
                <YAxis stroke="rgba(255,255,255,0.35)" tick={{ fontSize: 11 }} domain={[63, 75]} />
                <Tooltip contentStyle={{ background: "rgba(2,6,23,0.95)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "#e5e7eb" }} />
                <Area type="monotone" dataKey="max" stroke="rgba(56,189,248,0.65)" fill="rgba(56,189,248,0.12)" />
                <Area type="monotone" dataKey="min" stroke="rgba(56,189,248,0.35)" fill="rgba(56,189,248,0.06)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="text" style={{ marginTop: 10 }}>
            Wider bands mean more spatial divergence: some shelves/corners drift away from the average.
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Events({ model }) {
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <div className="kicker">Events</div>
          <div style={{ fontSize: 32, fontWeight: 650, marginTop: 6 }}>Door cycles & activity</div>
          <div className="text" style={{ marginTop: 8, maxWidth: 760 }}>
            Event stream that would be correlated with drift paths.
          </div>
        </div>
        <div className="row">
          <Chip><DoorOpen size={14}/> Last 4 hours</Chip>
          <Chip tone="accent">Correlation view (POC)</Chip>
        </div>
      </div>

      <Panel meta="Event log" title="Recent door cycles" right={<Chip>Simulated</Chip>}>
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Time</th><th>Type</th><th>Duration</th><th>Severity</th><th>Note</th>
              </tr>
            </thead>
            <tbody>
              {model.events.map((e) => (
                <tr key={e.id}>
                  <td>{e.when}</td>
                  <td>{e.type}</td>
                  <td>{e.durationSec}s</td>
                  <td>
                    <Chip tone={e.severity > 0.66 ? "warn" : e.severity > 0.33 ? "neutral" : "ok"}>
                      {Math.round(e.severity * 100)}%
                    </Chip>
                  </td>
                  <td style={{ color: "var(--muted)" }}>{e.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text" style={{ marginTop: 10 }}>
          In the real portal, clicking an event would highlight the drift path on the map and show before/after deltas.
        </div>
      </Panel>
    </div>
  );
}

function SettingsPage({ controls, setControls }) {
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div>
        <div className="kicker">Settings</div>
        <div style={{ fontSize: 32, fontWeight: 650, marginTop: 6 }}>Thresholds & policy (POC)</div>
        <div className="text" style={{ marginTop: 8, maxWidth: 760 }}>
          Where customers configure alert routing, thresholds, and model assumptions.
        </div>
      </div>

      <div className="grid-2">
        <Panel meta="Policy" title="Alert routing" right={<Chip>Placeholder</Chip>}>
          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Notify</div>
            <div className="text" style={{ marginTop: 8 }}>
              Owner + staff group when low zones persist for 20 minutes.
            </div>
          </div>
          <div style={{ height: 10 }} />
          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Escalate</div>
            <div className="text" style={{ marginTop: 8 }}>
              Escalate to manager if repeated drift is detected 3 days in a row.
            </div>
          </div>
        </Panel>

        <Panel meta="Model" title="Demo defaults" right={<Chip tone="accent">Interactive</Chip>}>
          <div style={{ display: "grid", gap: 12 }}>
            <Slider
              label="Door cycle intensity"
              value={controls.doorIntensity}
              min={0} max={1} step={0.01}
              onChange={(v) => setControls((c) => ({ ...c, doorIntensity: v }))}
              format={(v) => (v < 0.33 ? "Low" : v < 0.66 ? "Medium" : "High")}
            />
            <Slider
              label="Fan mixing"
              value={controls.fanMix}
              min={0} max={1} step={0.01}
              onChange={(v) => setControls((c) => ({ ...c, fanMix: v }))}
              format={(v) => (v < 0.33 ? "Low" : v < 0.66 ? "Medium" : "High")}
            />
            <div className="text">
              In a real deployment, these would be derived from configuration and observed behavior.
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
