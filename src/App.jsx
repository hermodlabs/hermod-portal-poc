import React, { useMemo, useState } from "react";
import {
  BadgeCheck,
  Building2,
  DoorOpen,
  Grid3X3,
  Home,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Settings,
  ShieldCheck,
  UserPlus,
  Users,
  Wrench,
  ArrowRight,
} from "lucide-react";
import {
  ClipboardList,
  FilePlus2,
  Tag,
  Timer,
  Layers,
} from "lucide-react";
import {
  Ban,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
  ShieldX,
  UploadCloud,
  FileText,
  Fingerprint,
  Database,
  ClipboardCheck,
  ArrowLeft,
} from "lucide-react";

import {
  CalendarClock,
  Link2,
  Waves,
  ListChecks,
  ChevronRight,
} from "lucide-react";

import {
  Map as MapIcon,
  MapPin,
  Layers as LayersIcon,
  ListOrdered,
  Compass,
  Target,
} from "lucide-react";


/**
 * Slice 0 — Skeleton (must ship together)
 * Single-file POC in the SAME vibe as your TaskPortalPOC sample.
 *
 * Routes represented (state-router):
 * - /login, /logout, /accept-invite/:inviteToken
 * - /overview (honest placeholder)
 * - /sites, /sites/:siteId, /sites/:siteId/rooms
 * - /sites/:siteId/rooms/:roomId/summary
 * - /settings/users, /settings/roles (minimal)
 *
 * Dependencies: react, lucide-react
 */

// -----------------------------
// tiny utils
// -----------------------------
const cx = (...xs) => xs.filter(Boolean).join(" ");

function parseWindowToMin(W) {
  if (!W) return null;
  const s = String(W).trim().toLowerCase();
  if (s.endsWith("m")) return parseInt(s, 10);
  if (s.endsWith("h")) return parseInt(s, 10) * 60;
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
}
function clampInt(x, a, b) {
  const n = parseInt(x, 10);
  if (!Number.isFinite(n)) return a;
  return Math.max(a, Math.min(b, n));
}

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

function Header({ kicker, title, subtitle, right }) {
  return (
    <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <div className="kicker">{kicker}</div>
        <div style={{ fontSize: 32, fontWeight: 650, marginTop: 6 }}>{title}</div>
        {subtitle && (
          <div className="text" style={{ marginTop: 8, maxWidth: 860 }}>
            {subtitle}
          </div>
        )}
      </div>
      <div className="row">{right}</div>
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

// -----------------------------
// fake data (Slice 0 needs real objects, even if analysis is empty)
// -----------------------------
function makeSeedData() {
  const sites = [
    {
      id: "site-001",
      name: "The Cigar District",
      city: "Tulsa, OK",
      rooms: [
        { id: "room-001", name: "Walk-in Humidor", kind: "Humidor", status: "Online" },
        { id: "room-002", name: "Retail Cabinet Wall", kind: "Retail", status: "Online" },
      ],
    },
    {
      id: "site-002",
      name: "Greenhouse Demo (POC)",
      city: "Joplin, MO",
      rooms: [{ id: "room-101", name: "Flower Room A", kind: "Grow", status: "Simulated" }],
    },
  ];

  const users = [
    { id: "u-001", name: "Bobby", email: "bobby@example.com", roleId: "r-ops" },
    { id: "u-002", name: "Avery", email: "avery@example.com", roleId: "r-admin" },
  ];

  const roles = [
    { id: "r-admin", name: "Admin", desc: "Invite users, manage roles, configure org settings." },
    { id: "r-ops", name: "Operator", desc: "Work tasks, record changes, generate receipts." },
    { id: "r-view", name: "Viewer", desc: "Read-only access to rooms and reports." },
  ];

  const cases = [
    {
      id: "case-001",
      title: "Door corridor dry band (baseline)",
      status: "defining",
      createdAt: "Today",
      owner: "Bobby",
      siteId: "site-001",
      roomId: "room-001",

      // Slice 2:
      evidenceRunId: "run-001",

      // Slice 3:
      baselineRunId: "run-001", // case “claims” the baseline run
      triggerBinding: {
        // binds case’s τ/W to the baseline run timeline
        tau: "Door cycle",
        windowMin: 15,
        anchorPolicy: "event-linked", // for later: event-linked vs wall-clock
      },

      definition: {
        Z: "NW · A1",
        tau: "Door cycle",
        W: "15m",
        S: "Mid-cycle",
        sliceSentence:
          "We are talking about zone NW · A1 in window 15m after trigger Door cycle at stage Mid-cycle.",
      },
    },
  ];


  const runs = [
    {
      id: "run-001",
      label: "Baseline run (demo)",
      createdAt: "Today",
      owner: "Bobby",
      siteId: "site-001",
      roomId: "room-001",
      caseId: "case-001",
      inputs: {
        filesAttached: true,
        source: "Upload",
        sensorSet: "Rig A",
        firmware: "fw v1.0.0",
        timeRange: "Last 24h",
        hash: "sha256: 9c4a…d2f1",
      },
      gates: {
        sensorTrust: "unknown",
        coverage: "pass",
        timeAlignment: "pass",
        calibration: "pass",
        placementSanity: "pass",
        driftFlag: "pass",
      },
      notes: "",

      // Slice 3: timeline (simple event stream)
      timeline: buildDemoTimeline(),
    },
  ];

  const receipts = [
    {
      id: "rcpt-001",
      runId: "run-001",
      caseId: "case-001",
      title: "Receipt bundle · Provenance + Validity",
      when: "Today",
      frozen: true,
      bullets: [
        "Inputs attached and hashed",
        "Provenance recorded (sensor set, firmware, time range)",
        "Validity gates evaluated",
        "ABSTAIN asserted because Sensor trust is UNKNOWN",
      ],
    },
  ];


  // Add a layout baseline for each room you care about (at least the demo room)
  const layouts = [
    {
      id: "layout-001",
      siteId: "site-001",
      roomId: "room-001",
      name: "Walk-in Humidor layout (baseline)",
      createdAt: "Today",
      // simple grid floorplan (POC): 20x12 cells
      grid: { w: 20, h: 12 },
      // anchors / landmarks (for “walk to this spot”)
      landmarks: [
        { id: "lm-door", label: "Door", x: 1, y: 6 },
        { id: "lm-vent", label: "Supply vent", x: 16, y: 2 },
        { id: "lm-shelf", label: "Shelf block", x: 13, y: 8 },
      ],
      // zones (baseline segmentation). In real life this is derived; here it’s manual.
      zones: [
        { id: "Z1", label: "Stable band", x0: 2, y0: 2, x1: 8, y1: 9 },
        { id: "Z2", label: "Door corridor", x0: 0, y0: 3, x1: 3, y1: 9 },
        { id: "Z3", label: "SE pocket-prone", x0: 12, y0: 6, x1: 19, y1: 11 },
      ],
    },
  ];

  // Canonical: pockets live on the RUN (then case consumes them)
  const runPockets = [
    {
      id: "p-001",
      runId: "run-001",
      roomId: "room-001",
      siteId: "site-001",
      label: "P-01",
      title: "SE shelf pocket",
      // anchor: map coordinate (cell)
      x: 14,
      y: 8,
      // ranking fields
      severity: 0.82, // 0..1
      persistenceMin: 42,
      repeatability: 0.74,
      trigger: "Door cycle",
      note: "Repeat offender near shelf block; worsens after traffic bursts.",
      rec: "Avoid long-age inventory here until verified stable; consider airflow staging.",
    },
    {
      id: "p-002",
      runId: "run-001",
      roomId: "room-001",
      siteId: "site-001",
      label: "P-02",
      title: "Vent shadow zone",
      x: 16,
      y: 3,
      severity: 0.63,
      persistenceMin: 28,
      repeatability: 0.55,
      trigger: "HVAC cycle",
      note: "Localized drift following HVAC cycle; potential stratification.",
      rec: "Add temporary sensor at canopy height; verify after HVAC trigger windows.",
    },
    {
      id: "p-003",
      runId: "run-001",
      roomId: "room-001",
      siteId: "site-001",
      label: "P-03",
      title: "Door corridor edge",
      x: 3,
      y: 6,
      severity: 0.51,
      persistenceMin: 18,
      repeatability: 0.61,
      trigger: "Door cycle",
      note: "Edge of corridor shows variability; not always harmful, but volatile.",
      rec: "Use for quick-turn only; don’t treat as stable storage.",
    },
  ];

  // Optional map derived per run (can be identical to layout baseline in POC)
  const runMaps = [
    {
      id: "map-001",
      runId: "run-001",
      roomId: "room-001",
      siteId: "site-001",
      createdAt: "Today",
      // map is a 2D field; in POC we generate a deterministic heat field
      field: buildDemoMapField(20, 12, 7), // seed=7
    },
  ];

  return { sites, users, roles, cases, runs, receipts,
    layouts, runPockets, runMaps };
};

function buildDemoMapField(w, h, seed = 1) {
  // deterministic-ish simple noise (no external deps)
  let t = seed >>> 0;
  const rng = () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };

  // values roughly 0..1 (higher = “worse” pocket risk)
  const field = Array.from({ length: h }, (_, y) =>
    Array.from({ length: w }, (_, x) => {
      const base = 0.25 + 0.15 * (x / (w - 1)) + 0.08 * (y / (h - 1));
      // add a “SE pocket” bump
      const dx = x - Math.floor(w * 0.72);
      const dy = y - Math.floor(h * 0.68);
      const bump = Math.exp(-(dx * dx + dy * dy) / 18) * 0.55;
      const noise = (rng() - 0.5) * 0.12;
      return clamp01(base + bump + noise);
    })
  );
  return field;
}
function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

function buildDemoTimeline() {
  // 24h-ish, coarse, enough to demo event-linked windows
  // types: "door" | "hvac" | "note" | "intervention"
  return [
    { id: "ev-001", t: "06:10", type: "door", label: "Door cycle", severity: 0.55 },
    { id: "ev-002", t: "06:40", type: "hvac", label: "HVAC cycle", severity: 0.35 },
    { id: "ev-003", t: "07:20", type: "door", label: "Door cycle", severity: 0.78 },
    { id: "ev-004", t: "08:05", type: "note", label: "Stocking activity", severity: 0.20 },
    { id: "ev-005", t: "09:10", type: "door", label: "Door cycle", severity: 0.62 },
    { id: "ev-006", t: "10:15", type: "hvac", label: "HVAC cycle", severity: 0.30 },
    { id: "ev-007", t: "12:20", type: "door", label: "Door cycle", severity: 0.70 },
    { id: "ev-008", t: "15:05", type: "intervention", label: "Fan moved (log)", severity: 0.45 },
    { id: "ev-009", t: "16:10", type: "door", label: "Door cycle", severity: 0.66 },
    { id: "ev-010", t: "18:30", type: "door", label: "Door cycle", severity: 0.52 },
  ];
}


function makeId(prefix = "case") {
  return `${prefix}-${Math.floor(100 + Math.random() * 900)}`;
}

function caseStatusTone(s) {
  if (s === "defined") return "ok";
  return "warn";
}
function caseStatusLabel(s) {
  if (s === "defined") return "Defined";
  return "Defining";
}

function gateLabel(v) {
  if (v === "pass") return "Pass";
  if (v === "fail") return "Fail";
  return "Unknown";
}
function gateTone(v) {
  if (v === "pass") return "ok";
  if (v === "fail") return "bad";
  return "warn";
}
function gateIcon(v) {
  if (v === "pass") return CheckCircle2;
  if (v === "fail") return ShieldX;
  return HelpCircle;
}

const CRITICAL_GATES = ["sensorTrust", "coverage", "timeAlignment"];

function computeAbstain(run) {
  const gates = run?.gates || {};
  const reasons = [];

  for (const k of CRITICAL_GATES) {
    const v = gates[k] || "unknown";
    if (v !== "pass") {
      reasons.push(`${prettyGateName(k)} is ${gateLabel(v).toUpperCase()}`);
    }
  }

  // Also abstain on any explicit FAIL anywhere
  for (const [k, v] of Object.entries(gates)) {
    if (v === "fail" && !reasons.includes(`${prettyGateName(k)} is FAIL`)) {
      reasons.push(`${prettyGateName(k)} is FAIL`);
    }
  }

  const abstain = reasons.length > 0;
  return { abstain, reasons };
}

function prettyGateName(k) {
  const map = {
    sensorTrust: "Sensor trust",
    coverage: "Coverage / density",
    timeAlignment: "Time alignment",
    calibration: "Calibration state",
    placementSanity: "Placement sanity",
    driftFlag: "Drift flags",
  };
  return map[k] || k;
}

function getSiteRoomLabel(data, siteId, roomId) {
  const s = data.sites.find((x) => x.id === siteId);
  const r = s?.rooms?.find((x) => x.id === roomId);
  return { siteName: s?.name || "—", roomName: r?.name || "—" };
}

// -----------------------------
// “router” (simple state route)
// -----------------------------
function parseRoute(route) {
  // route examples:
  // /overview
  // /sites
  // /sites/site-001
  // /sites/site-001/rooms
  // /sites/site-001/rooms/room-001/summary
  // /settings/users
  // /settings/roles
  // /accept-invite/abc123
  const parts = route.split("/").filter(Boolean);
  const r = { page: "overview", params: {} };

  if (parts.length === 0) return r;

  if (parts[0] === "overview") return { page: "overview", params: {} };

  // Extend sites/rooms:
  if (parts[0] === "sites") {
    if (parts.length === 1) return { page: "sites", params: {} };
    const siteId = parts[1];
    if (parts.length === 2) return { page: "site", params: { siteId } };

    if (parts[2] === "rooms") {
      if (parts.length === 3) return { page: "rooms", params: { siteId } };
      const roomId = parts[3];
      if (parts.length === 4) return { page: "room", params: { siteId, roomId } };
      if (parts[4] === "summary") return { page: "roomSummary", params: { siteId, roomId } };

      // SLICE 4:
      if (parts[4] === "layout") return { page: "roomLayout", params: { siteId, roomId } };
    }
  }

  if (parts[0] === "settings") {
    if (parts[1] === "users") return { page: "settingsUsers", params: {} };
    if (parts[1] === "roles") return { page: "settingsRoles", params: {} };
    return { page: "settingsUsers", params: {} };
  }
  if (parts[0] === "accept-invite") {
    return { page: "acceptInvite", params: { inviteToken: parts[1] || "" } };
  }

  // SLICE 1: cases
  if (parts[0] === "cases") {
    if (parts.length === 1) return { page: "cases", params: {} };
    if (parts[1] === "new") return { page: "caseNew", params: {} };
    const caseId = parts[1];
    if (parts.length === 2) return { page: "case", params: { caseId } };
    if (parts[2] === "define") return { page: "caseDefine", params: { caseId } };
    if (parts[2] === "evidence") return { page: "caseEvidence", params: { caseId } };

    // SLICE 3:
    if (parts[2] === "baseline") return { page: "caseBaseline", params: { caseId } };
    if (parts[2] === "triggers") return { page: "caseTriggers", params: { caseId } };

    // SLICE 4:
    if (parts[2] === "pockets") return { page: "casePockets", params: { caseId } };

    return { page: "case", params: { caseId } };
  }

  // SLICE 2: receipts
  if (parts[0] === "receipts") {
    if (parts.length === 1) return { page: "receipts", params: {} };
    return { page: "receipt", params: { receiptId: parts[1] } };
  }

  if (parts[0] === "runs") {
    if (parts[1] === "new") return { page: "runNew", params: {} };
    const runId = parts[1];
    if (parts[2] === "provenance") return { page: "runProvenance", params: { runId } };
    if (parts[2] === "validity") return { page: "runValidity", params: { runId } };
    if (parts[2] === "receipts") return { page: "runReceipts", params: { runId } };

    // SLICE 3:
    if (parts[2] === "timeline") return { page: "runTimeline", params: { runId } };

    // SLICE 4:
    if (parts[2] === "pockets") return { page: "runPockets", params: { runId } };
    if (parts[2] === "map") return { page: "runMap", params: { runId } };

    return { page: "runProvenance", params: { runId } };
  }


  return { page: "overview", params: {} };
}

// -----------------------------
// login / invite
// -----------------------------
function Login({ onLogin, onGoInvite }) {
  const [email, setEmail] = useState("bobby@example.com");
  const [tenant, setTenant] = useState("HermodLabs (POC)");

  return (
    <div className="login">
      <Style />
      <div className="container">
        <div className="kicker">Slice 0 · Skeleton</div>
        <h1 style={{ margin: "12px 0 0", fontSize: 42, fontWeight: 650 }}>
          Portal shell (truthful, navigable, non-lying)
        </h1>
        <p className="text" style={{ maxWidth: 900, marginTop: 12 }}>
          This is <b>not</b> analysis. Slice 0 exists so auth + navigation + sites/rooms are real objects.
          Pages are allowed to be empty, but they must be <b>honest</b>.
        </p>

        <div className="login-grid">
          <div className="box" style={{ padding: 16 }}>
            <div className="kicker">Sign in</div>

            <label className="label">
              <div className="stat-label">Tenant</div>
              <input className="input" value={tenant} onChange={(e) => setTenant(e.target.value)} />
            </label>

            <label className="label">
              <div className="stat-label">Email</div>
              <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>

            <button
              className="btn btn--primary"
              onClick={() => onLogin({ tenant, email })}
              style={{ marginTop: 16 }}
            >
              Enter portal
            </button>

            <div className="hr" />

            <div className="text">
              Or simulate invite accept:
              <button className="btn" style={{ marginLeft: 10 }} onClick={() => onGoInvite("demo-token-7Q2")}>
                <span className="row" style={{ gap: 8 }}>
                  <UserPlus size={14} /> Accept invite
                </span>
              </button>
            </div>
          </div>

          <div
            className="box"
            style={{
              padding: 16,
              background: "linear-gradient(180deg, rgba(15,23,42,.75), rgba(2,6,23,.70))",
              boxShadow: "var(--shadow)",
            }}
          >
            <div className="kicker">What Slice 0 proves</div>
            <div style={{ marginTop: 14 }} className="text">
              <b>Everything is reachable</b> and <b>nothing lies</b>.
            </div>

            <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
              <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                <Chip tone="accent">
                  <ShieldCheck size={14} /> honest shell
                </Chip>
                <Chip>
                  <Building2 size={14} /> sites/rooms
                </Chip>
                <Chip>
                  <Settings size={14} /> minimal settings
                </Chip>
              </div>

              <div className="box" style={{ padding: 14 }}>
                <div className="kicker">Rule</div>
                <div className="text" style={{ marginTop: 8 }}>
                  Overview can be a placeholder — but it must not pretend to be insight.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer">© {new Date().getFullYear()} HermodLabs · Slice 0</div>
      </div>
    </div>
  );
}

function AcceptInvite({ inviteToken, onAccept, onBack }) {
  const [name, setName] = useState("New Operator");
  const [email, setEmail] = useState("new.user@example.com");
  return (
    <div className="login">
      <Style />
      <div className="container">
        <div className="kicker">Accept invite</div>
        <h1 style={{ margin: "12px 0 0", fontSize: 38, fontWeight: 650 }}>Join the tenant</h1>
        <p className="text" style={{ maxWidth: 900, marginTop: 12 }}>
          Token is treated as a real route object in Slice 0. In production: validates token, selects tenant, provisions
          account, then forwards to Overview.
        </p>

        <div className="login-grid">
          <div className="box" style={{ padding: 16 }}>
            <div className="kicker">Invite token</div>
            <div className="row" style={{ justifyContent: "space-between", marginTop: 10 }}>
              <Chip tone="accent">
                <BadgeCheck size={14} /> {inviteToken || "—"}
              </Chip>
              <button className="btn" onClick={onBack}>
                Back
              </button>
            </div>

            <label className="label">
              <div className="stat-label">Name</div>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </label>

            <label className="label">
              <div className="stat-label">Email</div>
              <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>

            <button className="btn btn--primary" style={{ marginTop: 16 }} onClick={() => onAccept({ name, email })}>
              Accept & enter portal
            </button>
          </div>

          <div className="box" style={{ padding: 16 }}>
            <div className="kicker">Honesty note</div>
            <div className="text" style={{ marginTop: 10 }}>
              Slice 0 is allowed to have fake persistence. What matters: the system has a real place where invite flow
              lives, and it doesn’t get “hand-waved” in demos.
            </div>
            <div className="hr" />
            <div className="text">
              Next slices will attach: evidence gates, runs, receipts, and cases — but those do not belong here.
            </div>
          </div>
        </div>

        <div className="footer">© {new Date().getFullYear()} HermodLabs · Slice 0</div>
      </div>
    </div>
  );
}

// -----------------------------
// navigation (Slice 0)
// -----------------------------
const NAV = [
  { key: "/overview", label: "Overview", icon: Home },
  { key: "/sites", label: "Sites", icon: Building2 },
  { key: "/cases", label: "Cases", icon: ClipboardList },
  { key: "/receipts", label: "Receipts", icon: FileText },
  { key: "/settings/users", label: "Users", icon: Users },
  { key: "/settings/roles", label: "Roles", icon: Wrench },
];

// -----------------------------
// main app (Slice 0)
// -----------------------------
export default function Slice0SkeletonPOC() {
  const seed = useMemo(() => makeSeedData(), []);
  const [data, setData] = useState(seed);

  const [auth, setAuth] = useState(null);

  // simple in-app route
  const [route, setRoute] = useState("/overview");
  const r = useMemo(() => parseRoute(route), [route]);

  // selection helpers
  const site = useMemo(() => data.sites.find((s) => s.id === r.params.siteId), [data, r]);
  const room = useMemo(() => site?.rooms?.find((x) => x.id === r.params.roomId), [site, r]);

  // add this memo near site/room memos:
  const currentCase = useMemo(
    () => data.cases.find((c) => c.id === r.params.caseId),
    [data.cases, r.params.caseId]
  );

  const currentRun = useMemo(
    () => data.runs.find((x) => x.id === r.params.runId),
    [data.runs, r.params.runId]
  );

  const currentReceipt = useMemo(
    () => data.receipts.find((x) => x.id === r.params.receiptId),
    [data.receipts, r.params.receiptId]
  );

  const currentLayout = useMemo(() => {
    if (!r.params.siteId || !r.params.roomId) return null;
    return data.layouts?.find((l) => l.siteId === r.params.siteId && l.roomId === r.params.roomId) || null;
  }, [data.layouts, r.params.siteId, r.params.roomId]);

  function go(to) {
    setRoute(to);
  }

  function logout() {
    setAuth(null);
    setRoute("/overview");
  }

  // login / invite accept paths
  if (!auth) {
    if (r.page === "acceptInvite") {
      return (
        <AcceptInvite
          inviteToken={r.params.inviteToken}
          onBack={() => setRoute("/login")}
          onAccept={({ name, email }) => {
            // fake provisioning
            const newUser = { id: `u-${Math.floor(100 + Math.random() * 900)}`, name, email, roleId: "r-ops" };
            setData((d) => ({ ...d, users: [newUser, ...d.users] }));
            setAuth({ tenant: "HermodLabs (POC)", email });
            setRoute("/overview");
          }}
        />
      );
    }

    // treat /login as implied entry page
    return (
      <Login
        onLogin={(a) => {
          setAuth(a);
          setRoute("/overview");
        }}
        onGoInvite={(token) => setRoute(`/accept-invite/${token}`)}
      />
    );
  }

  // authenticated shell
  return (
    <>
      <Style />

      <div className="topbar">
        <div className="container">
          <div className="topbar-inner">
            <div>
              <div className="kicker">{auth.tenant}</div>
              <div className="h1">{auth.email}</div>
            </div>
            <div className="row">
              <Chip tone="accent">
                <ShieldCheck size={14} /> Slice 0 · shell
              </Chip>
              <button className="btn" onClick={logout}>
                <span className="row" style={{ gap: 8 }}>
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
                  className={cx("navbtn", route.startsWith(key) && "navbtn--active")}
                  onClick={() => go(key)}
                >
                  <Icon size={18} style={{ opacity: 0.9 }} />
                  <div style={{ fontWeight: 600, color: route.startsWith(key) ? "var(--text)" : "var(--muted)" }}>
                    {label}
                  </div>
                </button>
              ))}
            </div>

            <div className="sidebar-note">
              <div className="kicker">Slice rule</div>
              <div style={{ marginTop: 8 }}>
                This shell must be <b>coherent</b> without any analytics.
              </div>
              <div className="text" style={{ marginTop: 10 }}>
                If a page can’t tell the truth yet, it must say “placeholder” explicitly.
              </div>
            </div>

            <div className="sidebar-note">
              <div className="kicker">Quick jumps</div>
              <div className="row" style={{ marginTop: 10, flexWrap: "wrap" }}>
                <button className="btn" onClick={() => go("/sites")}>
                  <span className="row" style={{ gap: 8 }}>
                    <Building2 size={14} /> Sites
                  </span>
                </button>
                <button className="btn" onClick={() => go("/settings/users")}>
                  <span className="row" style={{ gap: 8 }}>
                    <Users size={14} /> Users
                  </span>
                </button>

                <button className="btn" onClick={() => go("/cases")}>
                  <span className="row" style={{ gap: 8 }}>
                    <ClipboardList size={14} /> Cases
                  </span>
                </button>
              </div>
            </div>
          </aside>

          <main className="main">
            {r.page === "overview" && <OverviewPage onGo={go} sites={data.sites} />}
            {r.page === "sites" && <SitesPage sites={data.sites} onGo={go} />}
            {r.page === "site" && <SiteDetailPage site={site} onGo={go} />}
            {r.page === "rooms" && <RoomsPage site={site} onGo={go} />}
            {r.page === "room" && <RoomDetailPage site={site} room={room} onGo={go} />}
            {r.page === "roomSummary" && <RoomSummaryPage site={site} room={room} onGo={go} />}
            {r.page === "cases" && <CasesListPage data={data} onGo={go} />}
            {r.page === "caseNew" && <CaseNewPage data={data} setData={setData} onGo={go} />}
            {r.page === "case" && <CaseDetailPage data={data} setData={setData} onGo={go} theCase={currentCase} />}
            {r.page === "caseDefine" && <CaseDefinePage data={data} setData={setData} onGo={go} theCase={currentCase} />}
            {r.page === "settingsUsers" && (
              <SettingsUsersPage data={data} setData={setData} onGo={go} />
            )}

            {r.page === "caseEvidence" && (
              <CaseEvidencePage data={data} setData={setData} onGo={go} theCase={currentCase} />
            )}
            {r.page === "runNew" && <RunNewPage data={data} setData={setData} onGo={go} />}
            {r.page === "runProvenance" && <RunProvenancePage data={data} setData={setData} onGo={go} run={currentRun} />}
            {r.page === "runValidity" && <RunValidityPage data={data} setData={setData} onGo={go} run={currentRun} />}
            {r.page === "runReceipts" && <RunReceiptsPage data={data} setData={setData} onGo={go} run={currentRun} />}
            {r.page === "receipts" && <ReceiptsIndexPage data={data} onGo={go} />}
            {r.page === "receipt" && <ReceiptDetailPage data={data} onGo={go} receipt={currentReceipt} />}
            {r.page === "settingsRoles" && <SettingsRolesPage roles={data.roles} />}

            {r.page === "runTimeline" && <RunTimelinePage data={data} setData={setData} onGo={go} run={currentRun} />}
            {r.page === "caseBaseline" && <CaseBaselinePage data={data} setData={setData} onGo={go} theCase={currentCase} />}
            {r.page === "caseTriggers" && <CaseTriggersPage data={data} setData={setData} onGo={go} theCase={currentCase} />}

            {r.page === "roomLayout" && (
              <RoomLayoutPage data={data} setData={setData} onGo={go} site={site} room={room} layout={currentLayout} />
            )}
            {r.page === "casePockets" && (
              <CasePocketsPage data={data} setData={setData} onGo={go} theCase={currentCase} />
            )}
            {r.page === "runPockets" && (
              <RunPocketsPage data={data} setData={setData} onGo={go} run={currentRun} />
            )}
            {r.page === "runMap" && (
              <RunMapPage data={data} setData={setData} onGo={go} run={currentRun} />
            )}

            {/* fallback */}
            {[
              "overview",
              "sites",
              "site",
              "rooms",
              "room",
              "roomSummary",
              "cases",
              "caseNew",
              "case",
              "caseDefine",
              "caseEvidence",     // NEW
              "runNew",           // NEW
              "runProvenance",    // NEW
              "runValidity",      // NEW
              "runReceipts",      // NEW
              "receipts",         // NEW
              "receipt",          // NEW
              "settingsUsers",
              "settingsRoles",
              "acceptInvite",

              "runTimeline",
              "caseBaseline",
              "caseTriggers",

              "roomLayout",
              "casePockets",
              "runPockets",
              "runMap",
            ].includes(r.page) ? null : (
              <OverviewPage onGo={go} sites={data.sites} />
            )}

          </main>
        </div>

        <div className="footer">© {new Date().getFullYear()} HermodLabs · Slice 0 Skeleton</div>
      </div>
    </>
  );
}

// -----------------------------
// Pages (Slice 0)
// -----------------------------
function OverviewPage({ onGo, sites }) {
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker="/overview"
        title="Overview (honest placeholder)"
        subtitle="This page is allowed to be empty in Slice 0 — but it must not pretend to be insight."
        right={
          <Chip tone="accent">
            <LayoutDashboard size={14} /> shell only
          </Chip>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.2fr 0.8fr" }}>
        <Panel
          meta="Truth posture"
          title="What exists right now"
          right={
            <Chip>
              <ShieldCheck size={14} /> non-lying
            </Chip>
          }
        >
          <div style={{ display: "grid", gap: 10 }}>
            <div className="box" style={{ padding: 14 }}>
              <div className="kicker">Slice 0 guarantee</div>
              <div className="text" style={{ marginTop: 8 }}>
                You can authenticate, navigate, select a site and room, and land on a room summary route that clearly
                states “no analysis yet.”
              </div>
            </div>

            <div className="box" style={{ padding: 14 }}>
              <div className="kicker">What is intentionally missing</div>
              <div className="text" style={{ marginTop: 8 }}>
                Cases, runs, receipts, provenance, validity, pocket ranking, compares, and verdict logic.
              </div>
            </div>

            <div className="row" style={{ flexWrap: "wrap" }}>
              <button className="btn btn--primary" onClick={() => onGo("/sites")}>
                <span className="row" style={{ gap: 8 }}>
                  <Building2 size={14} /> Go to Sites
                </span>
              </button>
              <button className="btn" onClick={() => onGo("/settings/users")}>
                <span className="row" style={{ gap: 8 }}>
                  <Users size={14} /> Manage Users
                </span>
              </button>
            </div>
          </div>
        </Panel>

        <Panel meta="Inventory" title="Sites at a glance" right={<Chip>{sites.length}</Chip>}>
          <div style={{ display: "grid", gap: 10 }}>
            {sites.map((s) => (
              <button key={s.id} className="taskRow" onClick={() => onGo(`/sites/${s.id}`)}>
                <div className="row" style={{ gap: 10 }}>
                  <div className="taskIcon">
                    <Building2 size={16} />
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontWeight: 650 }}>{s.name}</div>
                    <div className="kicker" style={{ marginTop: 4 }}>
                      {s.city} · {s.rooms.length} rooms
                    </div>
                  </div>
                </div>
                <span className="taskHint">
                  Open <ArrowRight size={14} />
                </span>
              </button>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function SitesPage({ sites, onGo }) {
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker="/sites"
        title="Sites"
        subtitle="Pick a site. Slice 0 requires these objects exist and are navigable."
        right={
          <Chip tone="accent">
            <Building2 size={14} /> {sites.length} total
          </Chip>
        }
      />

      <Panel meta="Directory" title="All sites" right={<Chip>POC</Chip>}>
        <div style={{ display: "grid", gap: 10 }}>
          {sites.map((s) => (
            <button key={s.id} className="taskRow" onClick={() => onGo(`/sites/${s.id}`)}>
              <div className="row" style={{ gap: 10 }}>
                <div className="taskIcon">
                  <Building2 size={16} />
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 650 }}>{s.name}</div>
                  <div className="kicker" style={{ marginTop: 4 }}>
                    {s.city} · {s.rooms.length} rooms
                  </div>
                </div>
              </div>
              <span className="taskHint">
                Open <ArrowRight size={14} />
              </span>
            </button>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function SiteDetailPage({ site, onGo }) {
  if (!site) {
    return (
      <Panel meta="Error" title="Site not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">This route exists; the object doesn’t. That’s still “honest.”</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/sites")}>
          Back to Sites
        </button>
      </Panel>
    );
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/sites/${site.id}`}
        title={site.name}
        subtitle="Slice 0: site detail exists so rooms aren’t orphaned."
        right={
          <Chip tone="accent">
            <Building2 size={14} /> {site.rooms.length} rooms
          </Chip>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.1fr 0.9fr" }}>
        <Panel meta="Profile" title="Site summary" right={<Chip>{site.city}</Chip>}>
          <div className="grid-2">
            <Stat label="Rooms" value={String(site.rooms.length)} />
            <Stat label="Status" value={"Active (POC)"} />
          </div>
          <div className="hr" />
          <div className="row" style={{ flexWrap: "wrap" }}>
            <button className="btn btn--primary" onClick={() => onGo(`/sites/${site.id}/rooms`)}>
              <span className="row" style={{ gap: 8 }}>
                <Grid3X3 size={14} /> Browse rooms
              </span>
            </button>
            <button className="btn" onClick={() => onGo("/sites")}>
              Back
            </button>
          </div>
        </Panel>

        <Panel meta="Honesty" title="What this is not" right={<Chip tone="warn">placeholder</Chip>}>
          <div className="text">
            There is no analysis on this page. In later slices, this becomes a hub for:
            <ul className="ul">
              <li>active cases in this site</li>
              <li>latest run receipts</li>
              <li>alert routing + operational posture</li>
            </ul>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function RoomsPage({ site, onGo }) {
  if (!site) {
    return (
      <Panel meta="Error" title="Site not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">Rooms list depends on a real site object.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/sites")}>
          Back to Sites
        </button>
      </Panel>
    );
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/sites/${site.id}/rooms`}
        title="Rooms"
        subtitle="Slice 0 includes room objects + routes so later slices can attach cases/runs."
        right={
          <Chip tone="accent">
            <Grid3X3 size={14} /> {site.rooms.length} rooms
          </Chip>
        }
      />

      <Panel meta="Directory" title={`Rooms at ${site.name}`} right={<Chip>{site.city}</Chip>}>
        <div style={{ display: "grid", gap: 10 }}>
          {site.rooms.map((rm) => (
            <button key={rm.id} className="taskRow" onClick={() => onGo(`/sites/${site.id}/rooms/${rm.id}`)}>
              <div className="row" style={{ gap: 10 }}>
                <div className="taskIcon">
                  <MapPinned size={16} />
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 650 }}>{rm.name}</div>
                  <div className="kicker" style={{ marginTop: 4 }}>
                    {rm.kind} · {rm.status}
                  </div>
                </div>
              </div>
              <span className="taskHint">
                Open <ArrowRight size={14} />
              </span>
            </button>
          ))}
        </div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo(`/sites/${site.id}`)}>
          Back to Site
        </button>
      </Panel>
    </div>
  );
}

function RoomDetailPage({ site, room, onGo }) {
  if (!site || !room) {
    return (
      <Panel meta="Error" title="Room not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">This route exists; object missing means data mismatch or permissions — still honest.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/sites")}>
          Back to Sites
        </button>
      </Panel>
    );
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/sites/${site.id}/rooms/${room.id}`}
        title={room.name}
        subtitle="Slice 0 room detail: a stable anchor for later ‘room summary’, runs, and cases."
        right={
          <Chip>
            <DoorOpen size={14} /> {room.status}
          </Chip>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.1fr 0.9fr" }}>
        <Panel meta="Profile" title="Room metadata" right={<Chip tone="accent">{room.kind}</Chip>}>
          <div className="grid-2">
            <Stat label="Room ID" value={room.id} />
            <Stat label="Site" value={site.name} />
          </div>
          <div className="hr" />
          <div className="row" style={{ flexWrap: "wrap" }}>
            <button className="btn btn--primary" onClick={() => onGo(`/sites/${site.id}/rooms/${room.id}/summary`)}>
              <span className="row" style={{ gap: 8 }}>
                <LayoutDashboard size={14} /> Room summary
              </span>
            </button>
            <button className="btn" onClick={() => onGo(`/sites/${site.id}/rooms/${room.id}/layout`)}>
              <span className="row" style={{ gap: 8 }}>
                <MapIcon size={14} /> Layout
              </span>
            </button>
            <button className="btn" onClick={() => onGo(`/sites/${site.id}/rooms`)}>
              Back to Rooms
            </button>
          </div>
        </Panel>

        <Panel meta="Future" title="What will attach here" right={<Chip tone="warn">not yet</Chip>}>
          <div className="text">
            Later slices will add:
            <ul className="ul">
              <li>cases list filtered to this room</li>
              <li>runs timeline</li>
              <li>receipts + validity uptime</li>
            </ul>
            For Slice 0, we only guarantee navigation and object integrity.
          </div>
        </Panel>
      </div>
    </div>
  );
}

function RoomSummaryPage({ site, room, onGo }) {
  if (!site || !room) {
    return (
      <Panel meta="Error" title="Room summary unavailable" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">Room object missing; summary cannot render.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/sites")}>
          Back to Sites
        </button>
      </Panel>
    );
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/sites/${site.id}/rooms/${room.id}/summary`}
        title="Room summary (truthful placeholder)"
        subtitle="This exists in Slice 0 so the nav doesn’t collapse. It does NOT claim insights."
        right={
          <Chip tone="accent">
            <LayoutDashboard size={14} /> summary route
          </Chip>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.2fr 0.8fr" }}>
        <Panel meta="Honest state" title="No analysis yet" right={<Chip tone="warn">placeholder</Chip>}>
          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">What you can do in Slice 0</div>
            <ul className="ul">
              <li>Confirm you’re in the right tenant/site/room.</li>
              <li>Use this as a stable anchor route for bookmarking and permissions.</li>
              <li>Navigate to Settings to manage users/roles.</li>
            </ul>
          </div>

          <div className="hr" />

          <div className="row" style={{ flexWrap: "wrap" }}>
            <button className="btn" onClick={() => onGo(`/sites/${site.id}/rooms/${room.id}`)}>
              Back to Room
            </button>
            <button className="btn btn--primary" onClick={() => onGo(`/sites/${site.id}/rooms`)}>
              Room list
            </button>
          </div>
        </Panel>

        <Panel meta="Room" title="Context" right={<Chip>{room.kind}</Chip>}>
          <div className="grid-2">
            <Stat label="Site" value={site.name} />
            <Stat label="Status" value={room.status} />
          </div>
          <div className="hr" />
          <div className="text">
            Next slice that meaningfully changes this page is <b>Slice 1</b> (Case definition spine) and <b>Slice 2</b>{" "}
            (Evidence gates + ABSTAIN).
          </div>
        </Panel>
      </div>
    </div>
  );
}

function SettingsUsersPage({ data, setData }) {
  const rolesById = useMemo(() => Object.fromEntries(data.roles.map((r) => [r.id, r])), [data.roles]);
  const [draft, setDraft] = useState({ name: "", email: "", roleId: "r-view" });

  function addUser() {
    if (!draft.name.trim() || !draft.email.trim()) return;
    const u = { id: `u-${Math.floor(100 + Math.random() * 900)}`, ...draft };
    setData((d) => ({ ...d, users: [u, ...d.users] }));
    setDraft({ name: "", email: "", roleId: "r-view" });
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker="/settings/users"
        title="Users"
        subtitle="Slice 0: minimal admin UI so auth + team isn’t pretend."
        right={
          <Chip tone="accent">
            <Users size={14} /> {data.users.length}
          </Chip>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.2fr 0.8fr" }}>
        <Panel meta="Directory" title="Team" right={<Chip>POC</Chip>}>
          <div style={{ display: "grid", gap: 10 }}>
            {data.users.map((u) => (
              <div key={u.id} className="box" style={{ padding: 14 }}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontWeight: 650 }}>{u.name}</div>
                    <div className="kicker" style={{ marginTop: 6 }}>
                      {u.email}
                    </div>
                  </div>
                  <Chip tone={u.roleId === "r-admin" ? "accent" : "neutral"}>
                    {rolesById[u.roleId]?.name || "Role"}
                  </Chip>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel meta="Add" title="Invite / add user" right={<Chip tone="warn">minimal</Chip>}>
          <div style={{ display: "grid", gap: 12 }}>
            <label className="label" style={{ marginTop: 0 }}>
              <div className="stat-label">Name</div>
              <input
                className="input"
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                placeholder="e.g., Sam"
              />
            </label>

            <label className="label" style={{ marginTop: 0 }}>
              <div className="stat-label">Email</div>
              <input
                className="input"
                value={draft.email}
                onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                placeholder="sam@company.com"
              />
            </label>

            <label className="label" style={{ marginTop: 0 }}>
              <div className="stat-label">Role</div>
              <select
                className="input"
                value={draft.roleId}
                onChange={(e) => setDraft((d) => ({ ...d, roleId: e.target.value }))}
              >
                {data.roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </label>

            <button className="btn btn--primary" onClick={addUser} disabled={!draft.name.trim() || !draft.email.trim()}>
              <span className="row" style={{ gap: 8 }}>
                <UserPlus size={14} /> Add user
              </span>
            </button>

            <div className="text">
              In production: this becomes <b>/accept-invite/:token</b> flow + email delivery + audits.
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function SettingsRolesPage({ roles }) {
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker="/settings/roles"
        title="Roles"
        subtitle="Slice 0: minimal visibility so permissions aren’t hand-waved."
        right={
          <Chip tone="accent">
            <Wrench size={14} /> {roles.length}
          </Chip>
        }
      />

      <Panel meta="RBAC" title="Role catalog" right={<Chip>POC</Chip>}>
        <div style={{ display: "grid", gap: 10 }}>
          {roles.map((r) => (
            <div key={r.id} className="box" style={{ padding: 14 }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 650 }}>{r.name}</div>
                  <div className="kicker" style={{ marginTop: 6 }}>
                    {r.id}
                  </div>
                </div>
                <Chip tone={r.id === "r-admin" ? "accent" : "neutral"}>{r.id === "r-admin" ? "privileged" : "standard"}</Chip>
              </div>
              <div className="text" style={{ marginTop: 10 }}>
                {r.desc}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function CasesListPage({ data, onGo }) {
  const rank = { defining: 0, defined: 1 };
  const ordered = [...data.cases].sort((a, b) => rank[a.status] - rank[b.status]);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker="/cases"
        title="Cases"
        subtitle="Slice 1: create a Case and freeze a slice (Z, τ, W, S). No analysis yet."
        right={
          <button className="btn btn--primary" onClick={() => onGo("/cases/new")}>
            <span className="row" style={{ gap: 8 }}>
              <FilePlus2 size={14} /> New case
            </span>
          </button>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.2fr 0.8fr" }}>
        <Panel meta="List" title="All cases" right={<Chip tone="accent">{data.cases.length}</Chip>}>
          <div style={{ display: "grid", gap: 10 }}>
            {ordered.length === 0 ? (
              <div className="text">No cases yet. Create one to establish the contract object.</div>
            ) : (
              ordered.map((c) => {
                const { siteName, roomName } = getSiteRoomLabel(data, c.siteId, c.roomId);
                return (
                  <button key={c.id} className="taskRow" onClick={() => onGo(`/cases/${c.id}`)}>
                    <div className="row" style={{ gap: 10 }}>
                      <div className="taskIcon">
                        <ClipboardList size={16} />
                      </div>
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontWeight: 650 }}>{c.title}</div>
                        <div className="kicker" style={{ marginTop: 4 }}>
                          {siteName} · {roomName} · owner: {c.owner}
                        </div>
                      </div>
                    </div>
                    <div className="row" style={{ gap: 10 }}>
                      <Chip tone={caseStatusTone(c.status)}>{caseStatusLabel(c.status)}</Chip>
                      <span className="taskHint">
                        Open <ArrowRight size={14} />
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </Panel>

        <Panel
          meta="Contract"
          title="What a Case is (in Slice 1)"
          right={
            <Chip tone="accent">
              <ShieldCheck size={14} /> spine
            </Chip>
          }
        >
          <div style={{ display: "grid", gap: 10 }}>
            <div className="box" style={{ padding: 14 }}>
              <div className="kicker">Case definition</div>
              <div className="text" style={{ marginTop: 8 }}>
                A Case is a durable object that freezes the question into{" "}
                <b>(Z, τ, W, S)</b> so later evidence can be compared honestly.
              </div>
            </div>
            <div className="box" style={{ padding: 14 }}>
              <div className="kicker">Allowed truth</div>
              <div className="text" style={{ marginTop: 8 }}>
                If definition is incomplete, status stays <b>Defining</b>. No verdicts, no claims.
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function CaseNewPage({ data, setData, onGo }) {
  const [title, setTitle] = useState("New case");
  const [siteId, setSiteId] = useState(data.sites[0]?.id || "");
  const site = data.sites.find((s) => s.id === siteId);
  const [roomId, setRoomId] = useState(site?.rooms?.[0]?.id || "");
  const [owner, setOwner] = useState("Bobby");

  // keep roomId valid when site changes
  React.useEffect(() => {
    const nextSite = data.sites.find((s) => s.id === siteId);
    const nextRoomId = nextSite?.rooms?.[0]?.id || "";
    setRoomId(nextRoomId);
  }, [siteId]); // eslint-disable-line react-hooks/exhaustive-deps

  function createCase() {
    if (!title.trim() || !siteId || !roomId) return;
    const id = makeId("case");
    const c = {
      id,
      title: title.trim(),
      status: "defining",
      createdAt: "Today",
      owner,
      siteId,
      roomId,
      definition: { Z: "", tau: "", W: "", S: "", sliceSentence: "" },
    };
    setData((d) => ({ ...d, cases: [c, ...d.cases] }));
    onGo(`/cases/${id}/define`);
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker="/cases/new"
        title="Create case"
        subtitle="Slice 1: create the object, then immediately define the slice."
        right={
          <Chip tone="warn">
            <Tag size={14} /> defining
          </Chip>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.1fr 0.9fr" }}>
        <Panel meta="Inputs" title="Case metadata" right={<Chip>POC</Chip>}>
          <div style={{ display: "grid", gap: 12 }}>
            <label className="label" style={{ marginTop: 0 }}>
              <div className="stat-label">Title</div>
              <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>

            <label className="label" style={{ marginTop: 0 }}>
              <div className="stat-label">Site</div>
              <select className="input" value={siteId} onChange={(e) => setSiteId(e.target.value)}>
                {data.sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="label" style={{ marginTop: 0 }}>
              <div className="stat-label">Room</div>
              <select className="input" value={roomId} onChange={(e) => setRoomId(e.target.value)}>
                {(data.sites.find((s) => s.id === siteId)?.rooms || []).map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="label" style={{ marginTop: 0 }}>
              <div className="stat-label">Owner</div>
              <input className="input" value={owner} onChange={(e) => setOwner(e.target.value)} />
            </label>

            <div className="row" style={{ flexWrap: "wrap" }}>
              <button className="btn" onClick={() => onGo("/cases")}>
                Cancel
              </button>
              <button className="btn btn--primary" onClick={createCase} disabled={!title.trim() || !siteId || !roomId}>
                <span className="row" style={{ gap: 8 }}>
                  <FilePlus2 size={14} /> Create & define
                </span>
              </button>
            </div>
          </div>
        </Panel>

        <Panel meta="Rule" title="What must ship together" right={<Chip tone="accent">Slice 1</Chip>}>
          <div className="text">
            Slice 1 is only coherent if these routes exist together:
            <ul className="ul">
              <li>/cases (list)</li>
              <li>/cases/new (create)</li>
              <li>/cases/:caseId (detail)</li>
              <li>/cases/:caseId/define (contract object)</li>
            </ul>
            Without /define, a Case is just a title — not a contract.
          </div>
        </Panel>
      </div>
    </div>
  );
}

function CaseDetailPage({ data, setData, onGo, theCase }) {
  if (!theCase) {
    return (
      <Panel meta="Error" title="Case not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">Route exists; object missing. Still honest.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/cases")}>
          Back to Cases
        </button>
      </Panel>
    );
  }

  const { siteName, roomName } = getSiteRoomLabel(data, theCase.siteId, theCase.roomId);
  const d = theCase.definition || {};
  const hasDefinition = Boolean(d.Z && d.tau && d.W && d.S);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/cases/${theCase.id}`}
        title={theCase.title}
        subtitle="Slice 1 detail page: shows whether the contract is defined. No analysis is allowed here."
        right={
          <Chip tone={caseStatusTone(theCase.status)}>
            <ShieldCheck size={14} /> {caseStatusLabel(theCase.status)}
          </Chip>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.1fr 0.9fr" }}>
        <Panel meta="Context" title="Where this case lives" right={<Chip>{siteName}</Chip>}>
          <div className="grid-2">
            <Stat label="Room" value={roomName} />
            <Stat label="Owner" value={theCase.owner} />
          </div>

          <div className="hr" />

          {/* ✅ BUTTON ROW — add Baseline + Triggers here */}
          <div className="row" style={{ flexWrap: "wrap" }}>
            <button className="btn btn--primary" onClick={() => onGo(`/cases/${theCase.id}/define`)}>
              <span className="row" style={{ gap: 8 }}>
                <Tag size={14} /> Define slice
              </span>
            </button>

            <button className="btn" onClick={() => onGo(`/cases/${theCase.id}/pockets`)}>
              <span className="row" style={{ gap: 8 }}>
                <ListOrdered size={14} /> Pockets
              </span>
            </button>

            <button className="btn" onClick={() => onGo(`/cases/${theCase.id}/baseline`)}>
              <span className="row" style={{ gap: 8 }}>
                <ListChecks size={14} /> Baseline
              </span>
            </button>

            <button className="btn" onClick={() => onGo(`/cases/${theCase.id}/triggers`)}>
              <span className="row" style={{ gap: 8 }}>
                <Waves size={14} /> Triggers
              </span>
            </button>

            <button className="btn" onClick={() => onGo("/cases")}>
              Back
            </button>
          </div>
        </Panel>

        <Panel
          meta="Definition"
          title="Frozen slice (Z, τ, W, S)"
          right={<Chip tone={hasDefinition ? "ok" : "warn"}>{hasDefinition ? "complete" : "incomplete"}</Chip>}
        >
          <div style={{ display: "grid", gap: 10 }}>
            <MiniKV icon={MapPinned} k="Z (zone)" v={d.Z || "—"} />
            <MiniKV icon={Timer} k="τ (trigger)" v={d.tau || "—"} />
            <MiniKV icon={Tag} k="W (window)" v={d.W || "—"} />
            <MiniKV icon={Layers} k="S (stage)" v={d.S || "—"} />
          </div>

          <div className="hr" />

          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Slice sentence</div>
            <div className="text" style={{ marginTop: 8 }}>
              {d.sliceSentence || "—"}
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}


function CaseDefinePage({ data, setData, onGo, theCase }) {
  if (!theCase) {
    return (
      <Panel meta="Error" title="Case not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">Can’t define a missing object.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/cases")}>
          Back to Cases
        </button>
      </Panel>
    );
  }

  const initial = theCase.definition || { Z: "", tau: "", W: "", S: "", sliceSentence: "" };
  const [def, setDef] = useState(initial);

  const canSave = Boolean(def.Z.trim() && def.tau.trim() && def.W.trim() && def.S.trim());

  function saveDefinition() {
    const Z = def.Z.trim();
    const tau = def.tau.trim();
    const W = def.W.trim();
    const S = def.S.trim();
    const sliceSentence = `We are talking about zone ${Z} in window ${W} after trigger ${tau} at stage ${S}.`;

    setData((d) => ({
      ...d,
      cases: d.cases.map((c) =>
        c.id === theCase.id
          ? { ...c, status: "defined", definition: { Z, tau, W, S, sliceSentence } }
          : c
      ),
    }));

    onGo(`/cases/${theCase.id}`);
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/cases/${theCase.id}/define`}
        title="Define the slice (contract)"
        subtitle="This is the first anti-theater milestone: freeze the question into a speakable object."
        right={
          <Chip tone={canSave ? "ok" : "warn"}>
            <ShieldCheck size={14} /> {canSave ? "ready" : "incomplete"}
          </Chip>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.1fr 0.9fr" }}>
        <Panel meta="Inputs" title="Case definition fields" right={<Chip tone="accent">Slice 1</Chip>}>
          <div style={{ display: "grid", gap: 12 }}>
            <label className="label" style={{ marginTop: 0 }}>
              <div className="stat-label">Z — Zone</div>
              <input
                className="input"
                value={def.Z}
                onChange={(e) => setDef((x) => ({ ...x, Z: e.target.value }))}
                placeholder='e.g., "NW · A1" or "Shelf C3"'
              />
            </label>

            <label className="label" style={{ marginTop: 0 }}>
              <div className="stat-label">τ — Trigger (event anchor)</div>
              <input
                className="input"
                value={def.tau}
                onChange={(e) => setDef((x) => ({ ...x, tau: e.target.value }))}
                placeholder='e.g., "Door cycle" or "Lights off"'
              />
            </label>

            <label className="label" style={{ marginTop: 0 }}>
              <div className="stat-label">W — Window</div>
              <input
                className="input"
                value={def.W}
                onChange={(e) => setDef((x) => ({ ...x, W: e.target.value }))}
                placeholder='e.g., "15m" or "2h"'
              />
            </label>

            <label className="label" style={{ marginTop: 0 }}>
              <div className="stat-label">S — Stage</div>
              <input
                className="input"
                value={def.S}
                onChange={(e) => setDef((x) => ({ ...x, S: e.target.value }))}
                placeholder='e.g., "Mid-cycle" or "Late flower"'
              />
            </label>

            <div className="row" style={{ flexWrap: "wrap" }}>
              <button className="btn" onClick={() => onGo(`/cases/${theCase.id}`)}>
                Cancel
              </button>
              <button className="btn btn--primary" onClick={saveDefinition} disabled={!canSave}>
                <span className="row" style={{ gap: 8 }}>
                  <ShieldCheck size={14} /> Save definition
                </span>
              </button>
            </div>
          </div>
        </Panel>

        <Panel meta="Preview" title="Slice sentence (speakable)" right={<Chip>contract</Chip>}>
          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Output sentence</div>
            <div className="text" style={{ marginTop: 10 }}>
              <b>
                We are talking about zone{" "}
                {def.Z.trim() ? def.Z.trim() : "—"} in window{" "}
                {def.W.trim() ? def.W.trim() : "—"} after trigger{" "}
                {def.tau.trim() ? def.tau.trim() : "—"} at stage{" "}
                {def.S.trim() ? def.S.trim() : "—"}.
              </b>
            </div>
          </div>

          <div className="hr" />

          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Why this matters</div>
            <div className="text" style={{ marginTop: 8 }}>
              Later slices can only compare evidence honestly if the ruler is explicit. This definition is the ruler.
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function MiniKV({ icon: Icon, k, v }) {
  return (
    <div className="box" style={{ padding: 12 }}>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div className="row" style={{ gap: 10 }}>
          <div className="taskIcon" style={{ width: 30, height: 30 }}>
            <Icon size={16} />
          </div>
          <div>
            <div className="kicker">{k}</div>
            <div style={{ fontWeight: 700, marginTop: 6 }}>{v}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   H) SLICE 2 PAGES — paste these below your existing pages
   ========================================================= */

function CaseEvidencePage({ data, setData, onGo, theCase }) {
  if (!theCase) {
    return (
      <Panel meta="Error" title="Case not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">No case object to attach evidence to.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/cases")}>Back</button>
      </Panel>
    );
  }

  const { siteName, roomName } = getSiteRoomLabel(data, theCase.siteId, theCase.roomId);
  const run = data.runs.find((r) => r.id === theCase.evidenceRunId);
  const abst = run ? computeAbstain(run) : { abstain: true, reasons: ["No run attached yet"] };

  function createRunForCase() {
    const id = makeId("run");
    const newRun = {
      id,
      label: `Run for ${theCase.id}`,
      createdAt: "Now",
      owner: theCase.owner || "Operator",
      siteId: theCase.siteId,
      roomId: theCase.roomId,
      caseId: theCase.id,
      inputs: {
        filesAttached: false,
        source: "Upload",
        sensorSet: "Rig A",
        firmware: "fw v1.0.0",
        timeRange: "—",
        hash: "—",
      },
      gates: {
        sensorTrust: "unknown",
        coverage: "unknown",
        timeAlignment: "unknown",
        calibration: "unknown",
        placementSanity: "unknown",
        driftFlag: "unknown",
      },
      notes: "",
    };

    setData((d) => ({
      ...d,
      runs: [newRun, ...d.runs],
      cases: d.cases.map((c) => (c.id === theCase.id ? { ...c, evidenceRunId: id } : c)),
    }));

    onGo(`/runs/${id}/provenance`);
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/cases/${theCase.id}/evidence`}
        title="Evidence gates (ABSTAIN is binding)"
        subtitle="Not a warning. A hard stop the operator can defend. Unknown means: you may not interpret."
        right={
          <Chip tone={abst.abstain ? "bad" : "ok"}>
            {abst.abstain ? <Ban size={14} /> : <CheckCircle2 size={14} />}{" "}
            {abst.abstain ? "ABSTAIN" : "INTERPRET OK"}
          </Chip>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.2fr 0.8fr" }}>
        <Panel meta="Case" title={theCase.title} right={<Chip>{siteName}</Chip>}>
          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Where</div>
            <div style={{ fontWeight: 700, marginTop: 8 }}>{roomName}</div>
            <div className="text" style={{ marginTop: 10 }}>
              {theCase.definition?.sliceSentence || "Case not defined yet."}
            </div>
          </div>

          <div className="hr" />

          <div className="row" style={{ flexWrap: "wrap" }}>
            <button className="btn" onClick={() => onGo(`/cases/${theCase.id}`)}>
              <span className="row" style={{ gap: 8 }}>
                <ArrowLeft size={14} /> Back to case
              </span>
            </button>
            {!run ? (
              <button className="btn btn--primary" onClick={createRunForCase}>
                <span className="row" style={{ gap: 8 }}>
                  <FilePlus2 size={14} /> Create run
                </span>
              </button>
            ) : (
              <button className="btn btn--primary" onClick={() => onGo(`/runs/${run.id}/provenance`)}>
                <span className="row" style={{ gap: 8 }}>
                  <UploadCloud size={14} /> Open run
                </span>
              </button>
            )}
          </div>
        </Panel>

        <Panel meta="State" title="Operational posture" right={<Chip tone="accent">Slice 2</Chip>}>
          {abst.abstain ? (
            <AbstainBanner
              reasons={abst.reasons}
              body={
                <>
                  <div className="text" style={{ marginTop: 8 }}>
                    This is the moment the product carries the social weight:
                    not “⚠️ warning”, but “🚫 you may not interpret this.”
                  </div>
                  <div className="text" style={{ marginTop: 10 }}>
                    ABSTAIN isn’t cautious. It’s clean.
                  </div>
                </>
              }
            />
          ) : (
            <div className="box" style={{ padding: 14, border: "1px solid rgba(34,197,94,0.20)" }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div className="kicker">Interpretation earned</div>
                <Chip tone="ok">
                  <CheckCircle2 size={14} /> allowed
                </Chip>
              </div>
              <div className="text" style={{ marginTop: 10 }}>
                Critical evidence gates are PASS. Downstream routes may interpret, compare, and verdict in later slices.
              </div>
            </div>
          )}

          <div className="hr" />

          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Pass if… (emotionally)</div>
            <div className="text" style={{ marginTop: 8 }}>
              Unknown trust implies ABSTAIN downstream (not warning-only). Don’t make the human be the conscience.
            </div>
          </div>
        </Panel>
      </div>

      {run && (
        <div className="grid-2">
          <Panel meta="Run" title="Evidence object" right={<Chip>{run.id}</Chip>}>
            <div style={{ display: "grid", gap: 10 }}>
              <div className="box" style={{ padding: 14 }}>
                <div className="kicker">Input status</div>
                <div className="row" style={{ justifyContent: "space-between", marginTop: 10 }}>
                  <div className="text">
                    files attached: <b>{run.inputs.filesAttached ? "yes" : "no"}</b>
                  </div>
                  <Chip tone={run.inputs.filesAttached ? "ok" : "warn"}>
                    <UploadCloud size={14} /> {run.inputs.filesAttached ? "ready" : "missing"}
                  </Chip>
                </div>
                <div className="text" style={{ marginTop: 10 }}>
                  source: <b>{run.inputs.source}</b> · sensor set: <b>{run.inputs.sensorSet}</b>
                </div>
              </div>

              <div className="row" style={{ flexWrap: "wrap" }}>
                <button className="btn" onClick={() => onGo(`/runs/${run.id}/provenance`)}>
                  <span className="row" style={{ gap: 8 }}>
                    <Fingerprint size={14} /> Provenance
                  </span>
                </button>
                <button className="btn" onClick={() => onGo(`/runs/${run.id}/validity`)}>
                  <span className="row" style={{ gap: 8 }}>
                    <ShieldAlert size={14} /> Validity gates
                  </span>
                </button>
                <button className="btn" onClick={() => onGo(`/runs/${run.id}/receipts`)}>
                  <span className="row" style={{ gap: 8 }}>
                    <FileText size={14} /> Receipts
                  </span>
                </button>

                <button className="btn" onClick={() => onGo(`/cases/${theCase.id}/evidence`)}>
                  <span className="row" style={{ gap: 8 }}>
                    <ShieldAlert size={14} /> Evidence gates
                  </span>
                </button>
              </div>
            </div>
          </Panel>

          <Panel meta="Gates" title="Critical gates (drive ABSTAIN)" right={<Chip tone="accent">hard stop</Chip>}>
            <div style={{ display: "grid", gap: 10 }}>
              {CRITICAL_GATES.map((k) => (
                <GateRow key={k} name={prettyGateName(k)} value={run.gates[k]} />
              ))}
            </div>
            <div className="hr" />
            <div className="text">
              “Assume everything else is fine. Now tell me what this single uncertainty does.”
              If Sensor trust is UNKNOWN, downstream must ABSTAIN.
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}

function RunNewPage({ data, setData, onGo }) {
  const [label, setLabel] = useState("New run");
  const [siteId, setSiteId] = useState(data.sites[0]?.id || "");
  const site = data.sites.find((s) => s.id === siteId);
  const [roomId, setRoomId] = useState(site?.rooms?.[0]?.id || "");
  const [caseId, setCaseId] = useState(data.cases[0]?.id || "");
  const [owner, setOwner] = useState("Bobby");

  React.useEffect(() => {
    const nextSite = data.sites.find((s) => s.id === siteId);
    setRoomId(nextSite?.rooms?.[0]?.id || "");
  }, [siteId]); // eslint-disable-line react-hooks/exhaustive-deps

  function createRun() {
    const id = makeId("run");
    const run = {
      id,
      label: label.trim() || "Run",
      createdAt: "Now",
      owner,
      siteId,
      roomId,
      caseId: caseId || null,
      inputs: {
        filesAttached: false,
        source: "Upload",
        sensorSet: "Rig A",
        firmware: "fw v1.0.0",
        timeRange: "—",
        hash: "—",
      },
      gates: {
        sensorTrust: "unknown",
        coverage: "unknown",
        timeAlignment: "unknown",
        calibration: "unknown",
        placementSanity: "unknown",
        driftFlag: "unknown",
      },
      notes: "",
    };

    setData((d) => ({
      ...d,
      runs: [run, ...d.runs],
      cases: caseId
        ? d.cases.map((c) => (c.id === caseId ? { ...c, evidenceRunId: id } : c))
        : d.cases,
    }));

    onGo(`/runs/${id}/provenance`);
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker="/runs/new"
        title="Create run (evidence object)"
        subtitle="Slice 2: a Run is where provenance + validity + receipts live. Without a Run, gates are theater."
        right={<Chip tone="accent"><Database size={14}/> Slice 2</Chip>}
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.1fr 0.9fr" }}>
        <Panel meta="Inputs" title="Run metadata" right={<Chip>POC</Chip>}>
          <div style={{ display: "grid", gap: 12 }}>
            <label className="label" style={{ marginTop: 0 }}>
              <div className="stat-label">Label</div>
              <input className="input" value={label} onChange={(e) => setLabel(e.target.value)} />
            </label>

            <label className="label" style={{ marginTop: 0 }}>
              <div className="stat-label">Site</div>
              <select className="input" value={siteId} onChange={(e) => setSiteId(e.target.value)}>
                {data.sites.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </label>

            <label className="label" style={{ marginTop: 0 }}>
              <div className="stat-label">Room</div>
              <select className="input" value={roomId} onChange={(e) => setRoomId(e.target.value)}>
                {(data.sites.find((s) => s.id === siteId)?.rooms || []).map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </label>

            <label className="label" style={{ marginTop: 0 }}>
              <div className="stat-label">Attach to Case (optional)</div>
              <select className="input" value={caseId} onChange={(e) => setCaseId(e.target.value)}>
                {data.cases.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </label>

            <label className="label" style={{ marginTop: 0 }}>
              <div className="stat-label">Owner</div>
              <input className="input" value={owner} onChange={(e) => setOwner(e.target.value)} />
            </label>

            <div className="row" style={{ flexWrap: "wrap" }}>
              <button className="btn" onClick={() => onGo("/cases")}>Back</button>
              <button className="btn btn--primary" onClick={createRun}>
                <span className="row" style={{ gap: 8 }}>
                  <FilePlus2 size={14} /> Create run
                </span>
              </button>
            </div>
          </div>
        </Panel>

        <Panel meta="Why" title="Why runs exist" right={<Chip tone="warn">anti-theater</Chip>}>
          <div className="text">
            Operators have been burned by “green dashboards” running on borrowed confidence.
            A Run makes uncertainty operationally binding:
            <ul className="ul">
              <li>unknown evidence blocks claims</li>
              <li>ABSTAIN is a real output</li>
              <li>receipts are timestamped and defensible</li>
            </ul>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function RunProvenancePage({ data, setData, onGo, run }) {
  if (!run) {
    return (
      <Panel meta="Error" title="Run not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">Route exists; object missing.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/runs/new")}>Create run</button>
      </Panel>
    );
  }

  const { siteName, roomName } = getSiteRoomLabel(data, run.siteId, run.roomId);
  const abst = computeAbstain(run);

  function attachDemoFiles() {
    setData((d) => ({
      ...d,
      runs: d.runs.map((x) =>
        x.id === run.id
          ? {
              ...x,
              inputs: {
                ...x.inputs,
                filesAttached: true,
                timeRange: "Last 24h",
                hash: `sha256: ${Math.random().toString(16).slice(2, 6)}…${Math.random().toString(16).slice(2, 6)}`,
              },
            }
          : x
      ),
    }));
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/runs/${run.id}/provenance`}
        title="Provenance"
        subtitle="If the system is going to lie, it should lie in your face while you're watching. Provenance makes that hard."
        right={
          <Chip tone={abst.abstain ? "bad" : "ok"}>
            {abst.abstain ? <Ban size={14} /> : <CheckCircle2 size={14} />}{" "}
            {abst.abstain ? "ABSTAIN" : "OK"}
          </Chip>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.1fr 0.9fr" }}>
        <Panel meta="Run" title={run.label} right={<Chip>{run.id}</Chip>}>
          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Context</div>
            <div className="text" style={{ marginTop: 8 }}>
              site: <b>{siteName}</b> · room: <b>{roomName}</b> · owner: <b>{run.owner}</b>
            </div>
          </div>

          <div className="hr" />

          <div className="box" style={{ padding: 14 }}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div>
                <div className="kicker">Inputs</div>
                <div style={{ fontWeight: 750, marginTop: 6 }}>
                  {run.inputs.filesAttached ? "Files attached" : "No files attached yet"}
                </div>
              </div>
              <Chip tone={run.inputs.filesAttached ? "ok" : "warn"}>
                <UploadCloud size={14} /> {run.inputs.filesAttached ? "hashed" : "missing"}
              </Chip>
            </div>

            <div className="text" style={{ marginTop: 10 }}>
              source: <b>{run.inputs.source}</b> · sensor set: <b>{run.inputs.sensorSet}</b> · firmware:{" "}
              <b>{run.inputs.firmware}</b>
            </div>
            <div className="text" style={{ marginTop: 10 }}>
              time range: <b>{run.inputs.timeRange}</b>
            </div>
            <div className="text" style={{ marginTop: 10 }}>
              hash: <b>{run.inputs.hash}</b>
            </div>

            <div className="row" style={{ flexWrap: "wrap", marginTop: 12 }}>
              <button className="btn btn--primary" onClick={attachDemoFiles}>
                <span className="row" style={{ gap: 8 }}>
                  <UploadCloud size={14} /> Attach demo files
                </span>
              </button>
              <button className="btn" onClick={() => onGo(`/runs/${run.id}/validity`)}>
                <span className="row" style={{ gap: 8 }}>
                  <ShieldAlert size={14} /> Continue to gates
                </span>
              </button>

<button className="btn" onClick={() => onGo(`/runs/${run.id}/map`)}>
  <span className="row" style={{ gap: 8 }}>
    <MapIcon size={14} /> Map
  </span>
</button>

<button className="btn" onClick={() => onGo(`/runs/${run.id}/pockets`)}>
  <span className="row" style={{ gap: 8 }}>
    <ListOrdered size={14} /> Pockets
  </span>
</button>
  <button className="btn" onClick={() => onGo(`/runs/${run.id}/timeline`)}>
    <span className="row" style={{ gap: 8 }}>
      <CalendarClock size={14} /> Timeline
    </span>
  </button>
              {run.caseId && (
                <button className="btn" onClick={() => onGo(`/cases/${run.caseId}/evidence`)}>
                  <span className="row" style={{ gap: 8 }}>
                    <ArrowLeft size={14} /> Back to case evidence
                  </span>
                </button>
              )}
            </div>
          </div>
        </Panel>

        <Panel meta="Why" title="Institutional backbone" right={<Chip tone="accent"><Fingerprint size={14}/> receipts</Chip>}>
          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">What this prevents</div>
            <div className="text" style={{ marginTop: 8 }}>
              Retroactive blame games. If outcomes go bad, you can point to a locked truth:
              “We weren’t allowed to claim it was fixed. We logged an abstain.”
            </div>
          </div>

          <div className="hr" />

          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Operator feeling</div>
            <div className="text" style={{ marginTop: 8 }}>
              The relief of not being tricked into confidence. The system takes the social hit of saying “no.”
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function RunValidityPage({ data, setData, onGo, run }) {
  if (!run) {
    return (
      <Panel meta="Error" title="Run not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">No run object to gate.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/runs/new")}>Create run</button>
      </Panel>
    );
  }

  const abst = computeAbstain(run);

  function setGate(key, value) {
    setData((d) => ({
      ...d,
      runs: d.runs.map((x) => (x.id === run.id ? { ...x, gates: { ...x.gates, [key]: value } } : x)),
    }));
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/runs/${run.id}/validity`}
        title="Validity gates (ABSTAIN is binding)"
        subtitle="Warning-only systems shrug. This system forbids interpretation when evidence is incomplete."
        right={
          <Chip tone={abst.abstain ? "bad" : "ok"}>
            {abst.abstain ? <Ban size={14} /> : <CheckCircle2 size={14} />}{" "}
            {abst.abstain ? "ABSTAIN" : "INTERPRET OK"}
          </Chip>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.2fr 0.8fr" }}>
        <Panel meta="Gates" title="Set gate states (stress-test honesty)" right={<Chip tone="accent">tri-state</Chip>}>
          <div style={{ display: "grid", gap: 10 }}>
            {Object.keys(run.gates).map((k) => (
              <GateEditorRow key={k} k={k} v={run.gates[k]} onChange={(v) => setGate(k, v)} />
            ))}
          </div>

          <div className="hr" />

          <div className="row" style={{ flexWrap: "wrap" }}>
            <button className="btn" onClick={() => onGo(`/runs/${run.id}/provenance`)}>
              <span className="row" style={{ gap: 8 }}>
                <Fingerprint size={14} /> Back to provenance
              </span>
            </button>
            <button className="btn btn--primary" onClick={() => onGo(`/runs/${run.id}/receipts`)}>
              <span className="row" style={{ gap: 8 }}>
                <FileText size={14} /> Continue to receipts
              </span>
            </button>
          </div>
        </Panel>

        <Panel meta="Result" title="Downstream posture" right={<Chip tone={abst.abstain ? "bad" : "ok"}>{abst.abstain ? "ABSTAIN" : "OK"}</Chip>}>
          {abst.abstain ? (
            <AbstainBanner
              reasons={abst.reasons}
              body={
                <>
                  <div className="text" style={{ marginTop: 8 }}>
                    This is operationally binding. Not “be careful.” Not “maybe.” A hard stop.
                  </div>
                  <div className="text" style={{ marginTop: 10 }}>
                    The UI carries the weight: “🚫 you may not interpret this.”
                  </div>
                </>
              }
            />
          ) : (
            <div className="box" style={{ padding: 14, border: "1px solid rgba(34,197,94,0.20)" }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div className="kicker">Interpretation allowed</div>
                <Chip tone="ok">
                  <CheckCircle2 size={14} /> earned
                </Chip>
              </div>
              <div className="text" style={{ marginTop: 10 }}>
                Critical gates are PASS. This run can support downstream compare/verdict in later slices.
              </div>
            </div>
          )}

          <div className="hr" />

          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Pass if…</div>
            <div className="text" style={{ marginTop: 8 }}>
              Setting Sensor trust = UNKNOWN must flip the system into ABSTAIN downstream (not warning-only).
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function RunReceiptsPage({ data, setData, onGo, run }) {
  if (!run) {
    return (
      <Panel meta="Error" title="Run not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">No run object to receipt.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/runs/new")}>Create run</button>
      </Panel>
    );
  }

  const abst = computeAbstain(run);
  const runReceipts = data.receipts.filter((r) => r.runId === run.id);

  function generateReceiptBundle() {
    const id = makeId("rcpt");
    const bullets = [
      run.inputs.filesAttached ? "Inputs attached and hashed" : "Inputs missing (still recorded)",
      `Provenance recorded: sensor set=${run.inputs.sensorSet}, firmware=${run.inputs.firmware}`,
      `Validity gates evaluated`,
      ...(abst.abstain
        ? [`ABSTAIN asserted: ${abst.reasons.join(" · ")}`]
        : ["Interpretation allowed: critical gates PASS"]),
    ];

    const receipt = {
      id,
      runId: run.id,
      caseId: run.caseId || null,
      title: `Receipt bundle · ${abst.abstain ? "ABSTAIN" : "OK to interpret"}`,
      when: "Now",
      frozen: true,
      bullets,
    };

    setData((d) => ({ ...d, receipts: [receipt, ...d.receipts] }));
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/runs/${run.id}/receipts`}
        title="Receipts (frozen, defensible)"
        subtitle="Receipts aren’t paperwork. They’re survival: a time-stamped truth you can point to later."
        right={
          <Chip tone={abst.abstain ? "bad" : "ok"}>
            {abst.abstain ? <Ban size={14} /> : <CheckCircle2 size={14} />}{" "}
            {abst.abstain ? "ABSTAIN" : "OK"}
          </Chip>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.1fr 0.9fr" }}>
        <Panel meta="Generate" title="Receipt bundle" right={<Chip tone="accent"><ClipboardCheck size={14}/> frozen</Chip>}>
          {abst.abstain ? (
            <AbstainBanner
              reasons={abst.reasons}
              body={
                <div className="text" style={{ marginTop: 8 }}>
                  You can still generate a receipt — it just freezes the ABSTAIN and its reasons.
                </div>
              }
            />
          ) : (
            <div className="box" style={{ padding: 14, border: "1px solid rgba(34,197,94,0.20)" }}>
              <div className="kicker">Green means earned</div>
              <div className="text" style={{ marginTop: 8 }}>
                Receipt will lock provenance + gate state at generation time.
              </div>
            </div>
          )}

          <div className="hr" />

          <div className="row" style={{ flexWrap: "wrap" }}>
            <button className="btn" onClick={() => onGo(`/runs/${run.id}/validity`)}>
              <span className="row" style={{ gap: 8 }}>
                <ShieldAlert size={14} /> Back to gates
              </span>
            </button>
            <button className="btn btn--primary" onClick={generateReceiptBundle}>
              <span className="row" style={{ gap: 8 }}>
                <FileText size={14} /> Generate receipt
              </span>
            </button>
            <button className="btn" onClick={() => onGo("/receipts")}>
              <span className="row" style={{ gap: 8 }}>
                <FileText size={14} /> View all receipts
              </span>
            </button>
          </div>
        </Panel>

        <Panel meta="Receipts" title="Existing receipts" right={<Chip>{runReceipts.length}</Chip>}>
          {runReceipts.length === 0 ? (
            <div className="text">No receipts yet. Generate one to freeze the truth state.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {runReceipts.map((rcpt) => (
                <button key={rcpt.id} className="taskRow" onClick={() => onGo(`/receipts/${rcpt.id}`)}>
                  <div className="row" style={{ gap: 10 }}>
                    <div className="taskIcon"><FileText size={16} /></div>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontWeight: 650 }}>{rcpt.title}</div>
                      <div className="kicker" style={{ marginTop: 4 }}>
                        {rcpt.when} · {rcpt.frozen ? "frozen" : "draft"}
                      </div>
                    </div>
                  </div>
                  <span className="taskHint">
                    Open <ArrowRight size={14} />
                  </span>
                </button>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

function ReceiptsIndexPage({ data, onGo }) {
  const ordered = [...data.receipts];

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker="/receipts"
        title="Receipts"
        subtitle="Frozen bundles the operator can hand off. No vibes. Just time-stamped claims (or abstains)."
        right={<Chip tone="accent"><FileText size={14}/> {ordered.length}</Chip>}
      />

      <Panel meta="Index" title="All receipts" right={<Chip>frozen</Chip>}>
        {ordered.length === 0 ? (
          <div className="text">No receipts yet.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {ordered.map((rcpt) => (
              <button key={rcpt.id} className="taskRow" onClick={() => onGo(`/receipts/${rcpt.id}`)}>
                <div className="row" style={{ gap: 10 }}>
                  <div className="taskIcon"><FileText size={16} /></div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontWeight: 650 }}>{rcpt.title}</div>
                    <div className="kicker" style={{ marginTop: 4 }}>
                      {rcpt.when} · run {rcpt.runId}
                    </div>
                  </div>
                </div>
                <span className="taskHint">
                  Open <ArrowRight size={14} />
                </span>
              </button>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

function ReceiptDetailPage({ data, onGo, receipt }) {
  if (!receipt) {
    return (
      <Panel meta="Error" title="Receipt not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">Receipt object missing.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/receipts")}>Back</button>
      </Panel>
    );
  }

  const run = data.runs.find((r) => r.id === receipt.runId);
  const abst = run ? computeAbstain(run) : { abstain: true, reasons: ["Run missing"] };

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/receipts/${receipt.id}`}
        title={receipt.title}
        subtitle="This is the artifact you point to later. Frozen truth, not meeting vibes."
        right={
          <Chip tone={abst.abstain ? "bad" : "ok"}>
            {abst.abstain ? <Ban size={14} /> : <CheckCircle2 size={14} />}{" "}
            {abst.abstain ? "ABSTAIN" : "OK"}
          </Chip>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.2fr 0.8fr" }}>
        <Panel meta="Receipt" title={receipt.id} right={<Chip>{receipt.when}</Chip>}>
          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Bullets</div>
            <ul className="ul" style={{ marginTop: 10 }}>
              {receipt.bullets.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          </div>

          <div className="hr" />

          <div className="row" style={{ flexWrap: "wrap" }}>
            <button className="btn" onClick={() => onGo("/receipts")}>
              Back to Receipts
            </button>
            {run && (
              <button className="btn btn--primary" onClick={() => onGo(`/runs/${run.id}/provenance`)}>
                <span className="row" style={{ gap: 8 }}>
                  <Fingerprint size={14} /> Open run
                </span>
              </button>
            )}
          </div>
        </Panel>

        <Panel meta="State" title="What this receipt means" right={<Chip tone="accent">binding</Chip>}>
          {abst.abstain ? (
            <AbstainBanner
              reasons={abst.reasons}
              body={
                <div className="text" style={{ marginTop: 8 }}>
                  ABSTAIN is not a failure. It’s disciplined output: evidence missing → claim forbidden.
                </div>
              }
            />
          ) : (
            <div className="box" style={{ padding: 14, border: "1px solid rgba(34,197,94,0.20)" }}>
              <div className="kicker">Interpretation was earned</div>
              <div className="text" style={{ marginTop: 8 }}>
                Critical gates were PASS at receipt time. Claims built on this run are defensible.
              </div>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

/* =========================================================
   I) UI WIDGETS — add these small components near your atoms
   ========================================================= */

function GateRow({ name, value }) {
  const Icon = gateIcon(value);
  return (
    <div className="gateRow">
      <div className="row" style={{ gap: 10 }}>
        <div className="taskIcon" style={{ width: 34, height: 34 }}>
          <Icon size={16} />
        </div>
        <div>
          <div style={{ fontWeight: 700 }}>{name}</div>
          <div className="kicker" style={{ marginTop: 4 }}>
            {name.includes("Sensor") ? "If unknown → ABSTAIN downstream" : "Contributes to validity posture"}
          </div>
        </div>
      </div>
      <Chip tone={gateTone(value)}>{gateLabel(value)}</Chip>
    </div>
  );
}

function GateEditorRow({ k, v, onChange }) {
  return (
    <div className="gateRow">
      <div>
        <div style={{ fontWeight: 700 }}>{prettyGateName(k)}</div>
        <div className="kicker" style={{ marginTop: 4 }}>
          {CRITICAL_GATES.includes(k) ? "Critical (drives ABSTAIN)" : "Secondary (still matters)"}
        </div>
      </div>

      <div className="row" style={{ gap: 10 }}>
        <select className="gateSelect" value={v} onChange={(e) => onChange(e.target.value)}>
          <option value="pass">Pass</option>
          <option value="unknown">Unknown</option>
          <option value="fail">Fail</option>
        </select>
        <Chip tone={gateTone(v)}>{gateLabel(v)}</Chip>
      </div>
    </div>
  );
}

function AbstainBanner({ reasons, body }) {
  return (
    <div className="abstain">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <div className="kicker">Hard stop</div>
          <div style={{ fontSize: 18, fontWeight: 800, marginTop: 6 }}>
            🚫 ABSTAIN — you may not interpret this
          </div>
        </div>
        <Chip tone="bad">
          <Ban size={14} /> ABSTAIN
        </Chip>
      </div>

      <div className="text" style={{ marginTop: 10 }}>
        {body}
      </div>

      <div className="hr" />

      <div className="kicker">Reasons</div>
      <ul className="ul" style={{ marginTop: 10 }}>
        {reasons.map((r, i) => (
          <li key={i}>
            <b>{r}</b>
          </li>
        ))}
      </ul>

      <div className="hr" />

      <button className="btn btn--blocked" disabled title="Interpretation is blocked by ABSTAIN">
        <span className="row" style={{ gap: 8 }}>
          <Ban size={14} /> Interpretation blocked
        </span>
      </button>
    </div>
  );
}

function RunTimelinePage({ data, setData, onGo, run }) {
  if (!run) {
    return (
      <Panel meta="Error" title="Run not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">No run object to show timeline for.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/runs/new")}>Create run</button>
      </Panel>
    );
  }

  const events = run.timeline || [];
  const [filter, setFilter] = useState("all"); // all/door/hvac/note/intervention

  const shown = events.filter((e) => (filter === "all" ? true : e.type === filter));

  function addEvent(type) {
    const id = makeId("ev");
    const t = `${String(6 + Math.floor(Math.random() * 13)).padStart(2, "0")}:${String(
      Math.floor(Math.random() * 6) * 10
    ).padStart(2, "0")}`;
    const label =
      type === "door"
        ? "Door cycle"
        : type === "hvac"
        ? "HVAC cycle"
        : type === "intervention"
        ? "Intervention log"
        : "Operator note";

    const ev = { id, t, type, label, severity: Math.round((0.2 + Math.random() * 0.7) * 100) / 100 };

    setData((d) => ({
      ...d,
      runs: d.runs.map((x) => (x.id === run.id ? { ...x, timeline: [...(x.timeline || []), ev] } : x)),
    }));
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/runs/${run.id}/timeline`}
        title="Run timeline"
        subtitle="Slice 3: the default ruler is event-linked windows, not wall-clock averages."
        right={
          <div className="row" style={{ flexWrap: "wrap" }}>
            <Chip tone="accent">
              <CalendarClock size={14} /> events
            </Chip>
            <button className="btn" onClick={() => onGo(`/runs/${run.id}/provenance`)}>
              <span className="row" style={{ gap: 8 }}>
                <ArrowLeft size={14} /> Back
              </span>
            </button>
          </div>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.2fr 0.8fr" }}>
        <Panel meta="Stream" title="Events" right={<Chip>{events.length}</Chip>}>
          <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
            <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
              <button className={cx("btn", filter === "all" && "btn--primary")} onClick={() => setFilter("all")}>
                All
              </button>
              <button className={cx("btn", filter === "door" && "btn--primary")} onClick={() => setFilter("door")}>
                Door
              </button>
              <button className={cx("btn", filter === "hvac" && "btn--primary")} onClick={() => setFilter("hvac")}>
                HVAC
              </button>
              <button
                className={cx("btn", filter === "intervention" && "btn--primary")}
                onClick={() => setFilter("intervention")}
              >
                Intervention
              </button>
              <button className={cx("btn", filter === "note" && "btn--primary")} onClick={() => setFilter("note")}>
                Notes
              </button>
            </div>

            <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
              <button className="btn" onClick={() => addEvent("door")}>+ Door</button>
              <button className="btn" onClick={() => addEvent("hvac")}>+ HVAC</button>
              <button className="btn" onClick={() => addEvent("intervention")}>+ Intervention</button>
            </div>
          </div>

          <div className="hr" />

          <div style={{ display: "grid", gap: 10 }}>
            {shown.length === 0 ? (
              <div className="text">No events in this filter.</div>
            ) : (
              shown
                .slice()
                .sort((a, b) => (a.t > b.t ? 1 : -1))
                .map((e) => (
                  <div key={e.id} className="eventRow">
                    <div className="row" style={{ gap: 10 }}>
                      <div className="taskIcon" style={{ width: 34, height: 34 }}>
                        <CalendarClock size={16} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 750 }}>{e.label}</div>
                        <div className="kicker" style={{ marginTop: 4 }}>
                          {e.t} · type: {e.type}
                        </div>
                      </div>
                    </div>
                    <Chip tone={e.severity > 0.66 ? "warn" : "neutral"}>{Math.round(e.severity * 100)}%</Chip>
                  </div>
                ))
            )}
          </div>
        </Panel>

        <Panel meta="Why" title="Event-linked windows" right={<Chip tone="accent"><Link2 size={14}/> ruler</Chip>}>
          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">The default ruler</div>
            <div className="text" style={{ marginTop: 8 }}>
              If you measure “after the trigger” you can compare apples-to-apples.
              If you measure wall-clock averages, you get storytime.
            </div>
          </div>
          <div className="hr" />
          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Slice 3 constraint</div>
            <div className="text" style={{ marginTop: 8 }}>
              The Case must claim a baseline run, then bind to τ/W from the case definition.
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function CaseBaselinePage({ data, setData, onGo, theCase }) {
  if (!theCase) {
    return (
      <Panel meta="Error" title="Case not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">No case object to select baseline for.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/cases")}>Back</button>
      </Panel>
    );
  }

  const caseRuns = data.runs.filter((r) => r.siteId === theCase.siteId && r.roomId === theCase.roomId);
  const selected = caseRuns.find((r) => r.id === theCase.baselineRunId) || null;

  function setBaseline(runId) {
    setData((d) => ({
      ...d,
      cases: d.cases.map((c) =>
        c.id === theCase.id
          ? {
              ...c,
              baselineRunId: runId,
              // default binding from case definition if available
              triggerBinding: c.triggerBinding || {
                tau: c.definition?.tau || "Door cycle",
                windowMin: parseWindowToMin(c.definition?.W) || 15,
                anchorPolicy: "event-linked",
              },
            }
          : c
      ),
    }));
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/cases/${theCase.id}/baseline`}
        title="Select baseline run"
        subtitle="Slice 3: the Case must “claim” a baseline run so τ/W become a comparable ruler."
        right={
          <div className="row" style={{ flexWrap: "wrap" }}>
            <Chip tone="accent">
              <ListChecks size={14} /> baseline
            </Chip>
            <button className="btn" onClick={() => onGo(`/cases/${theCase.id}`)}>
              <span className="row" style={{ gap: 8 }}>
                <ArrowLeft size={14} /> Back
              </span>
            </button>
          </div>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.2fr 0.8fr" }}>
        <Panel meta="Runs" title="Choose baseline" right={<Chip>{caseRuns.length}</Chip>}>
          <div style={{ display: "grid", gap: 10 }}>
            {caseRuns.length === 0 ? (
              <div className="text">No runs for this room yet. Create a run first.</div>
            ) : (
              caseRuns.map((r) => {
                const isOn = theCase.baselineRunId === r.id;
                return (
                  <button
                    key={r.id}
                    className={cx("taskRow", isOn && "taskRow--active")}
                    onClick={() => setBaseline(r.id)}
                  >
                    <div className="row" style={{ gap: 10 }}>
                      <div className="taskIcon">
                        <Database size={16} />
                      </div>
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontWeight: 750 }}>{r.label}</div>
                        <div className="kicker" style={{ marginTop: 4 }}>
                          {r.id} · {r.inputs?.timeRange || "—"}
                        </div>
                      </div>
                    </div>

                    <Chip tone={isOn ? "ok" : "neutral"}>{isOn ? "Selected" : "Select"}</Chip>
                  </button>
                );
              })
            )}
          </div>
        </Panel>

        <Panel meta="Binding" title="Bind τ/W to baseline timeline" right={<Chip tone="accent"><Link2 size={14}/> ruler</Chip>}>
          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Case definition</div>
            <div className="text" style={{ marginTop: 8 }}>
              τ: <b>{theCase.definition?.tau || "—"}</b> · W: <b>{theCase.definition?.W || "—"}</b>
            </div>
          </div>

          <div className="hr" />

          {!selected ? (
            <div className="text">Select a baseline run to continue.</div>
          ) : (
            <div className="box" style={{ padding: 14 }}>
              <div className="kicker">Selected baseline</div>
              <div className="text" style={{ marginTop: 8 }}>
                <b>{selected.label}</b>
              </div>
              <div className="row" style={{ flexWrap: "wrap", marginTop: 12 }}>
                <button className="btn" onClick={() => onGo(`/runs/${selected.id}/timeline`)}>
                  <span className="row" style={{ gap: 8 }}>
                    <CalendarClock size={14} /> View run timeline
                  </span>
                </button>
                <button className="btn btn--primary" onClick={() => onGo(`/cases/${theCase.id}/triggers`)}>
                  <span className="row" style={{ gap: 8 }}>
                    <ChevronRight size={14} /> Go to triggers
                  </span>
                </button>
              </div>
            </div>
          )}

          <div className="hr" />

          <div className="text">
            Why together: timeline alone is fine, but the Case must claim the baseline and bind it to τ/W or you get “choose-your-own ruler.”
          </div>
        </Panel>
      </div>
    </div>
  );
}

function CaseTriggersPage({ data, setData, onGo, theCase }) {
  if (!theCase) {
    return (
      <Panel meta="Error" title="Case not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">No case object to show triggers for.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/cases")}>Back</button>
      </Panel>
    );
  }

  const baseline = data.runs.find((r) => r.id === theCase.baselineRunId);
  const binding = theCase.triggerBinding || {
    tau: theCase.definition?.tau || "Door cycle",
    windowMin: parseWindowToMin(theCase.definition?.W) || 15,
    anchorPolicy: "event-linked",
  };

  function updateBinding(patch) {
    setData((d) => ({
      ...d,
      cases: d.cases.map((c) =>
        c.id === theCase.id ? { ...c, triggerBinding: { ...(c.triggerBinding || binding), ...patch } } : c
      ),
    }));
  }

  const events = baseline?.timeline || [];
  const matched = events.filter((e) => e.label === binding.tau);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/cases/${theCase.id}/triggers`}
        title="Triggers (event-anchored ruler)"
        subtitle="Slice 3: the Case binds its τ/W to the baseline run timeline so comparisons are anchored to the same kind of moment."
        right={
          <div className="row" style={{ flexWrap: "wrap" }}>
            <Chip tone="accent">
              <Waves size={14} /> event-linked
            </Chip>
            <button className="btn" onClick={() => onGo(`/cases/${theCase.id}`)}>
              <span className="row" style={{ gap: 8 }}>
                <ArrowLeft size={14} /> Back
              </span>
            </button>
          </div>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.2fr 0.8fr" }}>
        <Panel meta="Binding" title="Anchor settings" right={<Chip tone="accent">τ/W</Chip>}>
          <div style={{ display: "grid", gap: 12 }}>
            <div className="box" style={{ padding: 14 }}>
              <div className="kicker">Baseline run</div>
              <div style={{ fontWeight: 750, marginTop: 8 }}>{baseline ? baseline.label : "— (none selected)"}</div>
              <div className="text" style={{ marginTop: 8 }}>
                {baseline ? `run ${baseline.id}` : "Select a baseline run first."}
              </div>
              <div className="row" style={{ flexWrap: "wrap", marginTop: 12 }}>
                <button className="btn" onClick={() => onGo(`/cases/${theCase.id}/baseline`)}>
                  <span className="row" style={{ gap: 8 }}>
                    <ListChecks size={14} /> Change baseline
                  </span>
                </button>
                {baseline && (
                  <button className="btn" onClick={() => onGo(`/runs/${baseline.id}/timeline`)}>
                    <span className="row" style={{ gap: 8 }}>
                      <CalendarClock size={14} /> View timeline
                    </span>
                  </button>
                )}
              </div>
            </div>

            <label className="label" style={{ marginTop: 0 }}>
              <div className="stat-label">τ — Trigger name (must match timeline label)</div>
              <input
                className="input"
                value={binding.tau}
                onChange={(e) => updateBinding({ tau: e.target.value })}
                placeholder='e.g., "Door cycle"'
                disabled={!baseline}
              />
            </label>

            <label className="label" style={{ marginTop: 0 }}>
              <div className="stat-label">W — Window length (minutes)</div>
              <input
                className="input"
                value={binding.windowMin}
                onChange={(e) => updateBinding({ windowMin: clampInt(e.target.value, 1, 240) })}
                disabled={!baseline}
              />
            </label>

            <div className="box" style={{ padding: 14 }}>
              <div className="kicker">Anchor policy</div>
              <div className="row" style={{ justifyContent: "space-between", marginTop: 10 }}>
                <Chip tone="accent">
                  <Link2 size={14} /> event-linked
                </Chip>
                <Chip tone="neutral">wall-clock (deferred)</Chip>
              </div>
              <div className="text" style={{ marginTop: 10 }}>
                We only ship event-linked in Slice 3. Wall-clock is how dashboards sneak “borrowed confidence” back in.
              </div>
            </div>
          </div>
        </Panel>

        <Panel meta="Preview" title="What this selects" right={<Chip>{matched.length}</Chip>}>
          {!baseline ? (
            <div className="text">No baseline selected. Choose one first.</div>
          ) : (
            <>
              <div className="box" style={{ padding: 14 }}>
                <div className="kicker">Slice sentence (ruler)</div>
                <div className="text" style={{ marginTop: 8 }}>
                  <b>
                    Measure {binding.windowMin}m after each <span style={{ opacity: 0.9 }}>{binding.tau}</span> event.
                  </b>
                </div>
              </div>

              <div className="hr" />

              <div className="box" style={{ padding: 14 }}>
                <div className="kicker">Matched events in baseline</div>
                <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
                  {matched.length === 0 ? (
                    <div className="text">
                      No matching events. (This is good demo friction: if τ doesn’t match the timeline, you can’t pretend it does.)
                    </div>
                  ) : (
                    matched.slice(0, 6).map((e) => (
                      <div key={e.id} className="eventRow">
                        <div className="row" style={{ gap: 10 }}>
                          <div className="taskIcon" style={{ width: 34, height: 34 }}>
                            <Waves size={16} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 750 }}>{e.label}</div>
                            <div className="kicker" style={{ marginTop: 4 }}>
                              anchor @ {e.t} · window: +{binding.windowMin}m
                            </div>
                          </div>
                        </div>
                        <Chip tone={e.severity > 0.66 ? "warn" : "neutral"}>{Math.round(e.severity * 100)}%</Chip>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="hr" />

              <div className="box" style={{ padding: 14 }}>
                <div className="kicker">Why it matters</div>
                <div className="text" style={{ marginTop: 8 }}>
                  Meetings hate ambiguity. This makes ambiguity a state: if τ doesn’t exist, the ruler doesn’t exist.
                  That’s how you avoid storytime.
                </div>
              </div>
            </>
          )}
        </Panel>
      </div>
    </div>
  );
}

function RoomLayoutPage({ data, setData, onGo, site, room, layout }) {
  if (!site || !room) {
    return (
      <Panel meta="Error" title="Room not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">Need a site + room to show layout.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/sites")}>Back</button>
      </Panel>
    );
  }

  const L =
    layout ||
    (data.layouts || []).find((x) => x.siteId === site.id && x.roomId === room.id) ||
    null;

  const pocketsForRoom = (data.runPockets || []).filter((p) => p.siteId === site.id && p.roomId === room.id);
  const top = pocketsForRoom
    .slice()
    .sort((a, b) => scorePocket(b) - scorePocket(a))
    .slice(0, 3);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/sites/${site.id}/rooms/${room.id}/layout`}
        title="Room layout (baseline)"
        subtitle="Slice 4: layout anchors “where.” Zones + landmarks make pockets walkable."
        right={
          <div className="row" style={{ flexWrap: "wrap" }}>
            <Chip tone="accent">
              <Compass size={14} /> anchor
            </Chip>
            <button className="btn" onClick={() => onGo(`/sites/${site.id}/rooms/${room.id}`)}>
              <span className="row" style={{ gap: 8 }}>
                <ArrowLeft size={14} /> Back
              </span>
            </button>
          </div>
        }
      />

      {!L ? (
        <Panel meta="Missing" title="No layout yet" right={<Chip tone="warn">placeholder</Chip>}>
          <div className="text">
            Create a layout baseline for this room so pockets can be anchored.
          </div>
        </Panel>
      ) : (
        <div className="grid-2" style={{ gridTemplateColumns: "1.2fr 0.8fr" }}>
          <Panel meta="Map" title={`${room.name} layout`} right={<Chip>{L.grid.w}×{L.grid.h}</Chip>}>
            <LayoutMap
              w={L.grid.w}
              h={L.grid.h}
              zones={L.zones}
              landmarks={L.landmarks}
              pockets={top}
            />
            <div className="hr" />
            <div className="text">
              Zones are baseline segments; landmarks are operator reality. Together they make “walk-to-this-spot” possible.
            </div>
          </Panel>

          <Panel meta="Top pockets" title="Ranked (room)" right={<Chip tone="accent">{top.length}</Chip>}>
            {top.length === 0 ? (
              <div className="text">No pockets for this room yet. Run a scan (Slice 4 on a run).</div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {top.map((p) => (
                  <PocketCard
                    key={p.id}
                    pocket={p}
                    onClick={() => onGo(`/runs/${p.runId}/pockets`)}
                    hint="Open run pockets"
                  />
                ))}
              </div>
            )}
            <div className="hr" />
            <button className="btn btn--primary" onClick={() => onGo(`/cases/${findCaseForRoom(data, site.id, room.id) || "case-001"}/pockets`)}>
              <span className="row" style={{ gap: 8 }}>
                <ListOrdered size={14} /> Go to case pockets
              </span>
            </button>
          </Panel>
        </div>
      )}
    </div>
  );
}

function CasePocketsPage({ data, setData, onGo, theCase }) {
  if (!theCase) {
    return (
      <Panel meta="Error" title="Case not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">Need a case object to show pockets.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/cases")}>Back</button>
      </Panel>
    );
  }

  const layout = (data.layouts || []).find((l) => l.siteId === theCase.siteId && l.roomId === theCase.roomId) || null;
  const baselineRun = data.runs.find((r) => r.id === theCase.baselineRunId) || null;

  // Source of truth: run pockets (use baseline run if present; else evidence run)
  const sourceRunId = baselineRun?.id || theCase.evidenceRunId;
  const pockets = (data.runPockets || [])
    .filter((p) => p.runId === sourceRunId)
    .slice()
    .sort((a, b) => scorePocket(b) - scorePocket(a));

  const top = pockets.slice(0, 6);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/cases/${theCase.id}/pockets`}
        title="Pockets (ranked + walkable)"
        subtitle="Slice 4: ranked list + anchored map. No map = not walkable. No rank = not actionable."
        right={
          <div className="row" style={{ flexWrap: "wrap" }}>
            <Chip tone="accent">
              <MapPin size={14} /> walk-to
            </Chip>
            <button className="btn" onClick={() => onGo(`/cases/${theCase.id}`)}>
              <span className="row" style={{ gap: 8 }}>
                <ArrowLeft size={14} /> Back
              </span>
            </button>
          </div>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.2fr 0.8fr" }}>
        <Panel meta="Map" title="Pocket map" right={<Chip tone={layout ? "ok" : "warn"}>{layout ? "anchored" : "missing layout"}</Chip>}>
          {!layout ? (
            <div className="box" style={{ padding: 14 }}>
              <div className="kicker">Layout required</div>
              <div className="text" style={{ marginTop: 8 }}>
                You can’t walk to a pocket without a layout anchor. Create/visit:
                <div style={{ marginTop: 10 }}>
                  <button className="btn btn--primary" onClick={() => onGo(`/sites/${theCase.siteId}/rooms/${theCase.roomId}/layout`)}>
                    <span className="row" style={{ gap: 8 }}>
                      <MapIcon size={14} /> Open room layout
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <LayoutMap
              w={layout.grid.w}
              h={layout.grid.h}
              zones={layout.zones}
              landmarks={layout.landmarks}
              pockets={top}
              onPocketClick={(p) => onGo(`/runs/${p.runId}/pockets`)}
            />
          )}

          <div className="hr" />

          <div className="row" style={{ flexWrap: "wrap" }}>
            <button className="btn" onClick={() => onGo(`/sites/${theCase.siteId}/rooms/${theCase.roomId}/layout`)}>
              <span className="row" style={{ gap: 8 }}>
                <Compass size={14} /> Layout
              </span>
            </button>

            {sourceRunId && (
              <button className="btn" onClick={() => onGo(`/runs/${sourceRunId}/map`)}>
                <span className="row" style={{ gap: 8 }}>
                  <MapIcon size={14} /> Run map
                </span>
              </button>
            )}

            {sourceRunId && (
              <button className="btn" onClick={() => onGo(`/runs/${sourceRunId}/pockets`)}>
                <span className="row" style={{ gap: 8 }}>
                  <ListOrdered size={14} /> Run pockets
                </span>
              </button>
            )}
          </div>
        </Panel>

        <Panel meta="Ranked" title="Pocket list (actionable)" right={<Chip>{pockets.length}</Chip>}>
          {pockets.length === 0 ? (
            <div className="text">No pockets yet for the selected run. Add pockets to /runs/:runId/pockets.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {pockets.map((p) => (
                <PocketCard
                  key={p.id}
                  pocket={p}
                  onClick={() => onGo(`/runs/${p.runId}/pockets`)}
                  hint="Open run pockets"
                />
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

function RunPocketsPage({ data, setData, onGo, run }) {
  if (!run) {
    return (
      <Panel meta="Error" title="Run not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">Need a run object to show pockets.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/runs/new")}>Create run</button>
      </Panel>
    );
  }

  const layout = (data.layouts || []).find((l) => l.siteId === run.siteId && l.roomId === run.roomId) || null;

  const pockets = (data.runPockets || [])
    .filter((p) => p.runId === run.id)
    .slice()
    .sort((a, b) => scorePocket(b) - scorePocket(a));

  function addPocket() {
    const id = makeId("p");
    const x = 2 + Math.floor(Math.random() * 16);
    const y = 2 + Math.floor(Math.random() * 8);
    const p = {
      id,
      runId: run.id,
      roomId: run.roomId,
      siteId: run.siteId,
      label: `P-${String(1 + pockets.length).padStart(2, "0")}`,
      title: "New pocket (log)",
      x,
      y,
      severity: Math.round((0.35 + Math.random() * 0.6) * 100) / 100,
      persistenceMin: 10 + Math.floor(Math.random() * 55),
      repeatability: Math.round((0.35 + Math.random() * 0.6) * 100) / 100,
      trigger: "Door cycle",
      note: "Logged in demo.",
      rec: "Add temporary sensor; re-check on comparable trigger window.",
    };

    setData((d) => ({ ...d, runPockets: [p, ...(d.runPockets || [])] }));
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/runs/${run.id}/pockets`}
        title="Run pockets (source of truth)"
        subtitle="Slice 4: pockets originate on a run, then cases consume them. Rank + anchor makes it operational."
        right={
          <div className="row" style={{ flexWrap: "wrap" }}>
            <Chip tone="accent">
              <Target size={14} /> pockets
            </Chip>
            <button className="btn" onClick={() => onGo(`/runs/${run.id}/provenance`)}>
              <span className="row" style={{ gap: 8 }}>
                <ArrowLeft size={14} /> Back
              </span>
            </button>
          </div>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.2fr 0.8fr" }}>
        <Panel meta="Map" title="Overlay (top pockets)" right={<Chip tone={layout ? "ok" : "warn"}>{layout ? "anchored" : "needs layout"}</Chip>}>
          {!layout ? (
            <div className="box" style={{ padding: 14 }}>
              <div className="kicker">Layout required</div>
              <div className="text" style={{ marginTop: 8 }}>
                Create/visit layout to make pockets walkable.
              </div>
              <div className="hr" />
              <button className="btn btn--primary" onClick={() => onGo(`/sites/${run.siteId}/rooms/${run.roomId}/layout`)}>
                <span className="row" style={{ gap: 8 }}>
                  <MapIcon size={14} /> Open layout
                </span>
              </button>
            </div>
          ) : (
            <LayoutMap
              w={layout.grid.w}
              h={layout.grid.h}
              zones={layout.zones}
              landmarks={layout.landmarks}
              pockets={pockets.slice(0, 6)}
            />
          )}

          <div className="hr" />

          <div className="row" style={{ flexWrap: "wrap" }}>
            <button className="btn" onClick={() => onGo(`/runs/${run.id}/map`)}>
              <span className="row" style={{ gap: 8 }}>
                <MapIcon size={14} /> Run map
              </span>
            </button>
            <button className="btn btn--primary" onClick={addPocket}>
              <span className="row" style={{ gap: 8 }}>
                <MapPin size={14} /> Add pocket
              </span>
            </button>
          </div>
        </Panel>

        <Panel meta="Ranked" title="Pocket list" right={<Chip>{pockets.length}</Chip>}>
          {pockets.length === 0 ? (
            <div className="text">No pockets yet. Add one to demonstrate the list→map coupling.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {pockets.map((p) => (
                <PocketCard key={p.id} pocket={p} onClick={() => onGo(`/runs/${run.id}/map`)} hint="Open map" />
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

function RunMapPage({ data, setData, onGo, run }) {
  if (!run) {
    return (
      <Panel meta="Error" title="Run not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">Need a run object to show map.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/runs/new")}>Create run</button>
      </Panel>
    );
  }

  const layout = (data.layouts || []).find((l) => l.siteId === run.siteId && l.roomId === run.roomId) || null;
  const map = (data.runMaps || []).find((m) => m.runId === run.id) || null;
  const pockets = (data.runPockets || []).filter((p) => p.runId === run.id).slice().sort((a,b)=>scorePocket(b)-scorePocket(a));

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/runs/${run.id}/map`}
        title="Run map (field + pockets)"
        subtitle="Slice 4 optional route: run-derived field map. Still anchored by layout + pockets."
        right={
          <div className="row" style={{ flexWrap: "wrap" }}>
            <Chip tone="accent">
              <MapIcon size={14} /> map
            </Chip>
            <button className="btn" onClick={() => onGo(`/runs/${run.id}/provenance`)}>
              <span className="row" style={{ gap: 8 }}>
                <ArrowLeft size={14} /> Back
              </span>
            </button>
          </div>
        }
      />

      <Panel meta="Field" title="Map view" right={<Chip tone={layout ? "ok" : "warn"}>{layout ? "anchored" : "needs layout"}</Chip>}>
        {!layout ? (
          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Layout required</div>
            <div className="text" style={{ marginTop: 8 }}>
              Without layout, the map can’t tell you where to walk.
            </div>
            <div className="hr" />
            <button className="btn btn--primary" onClick={() => onGo(`/sites/${run.siteId}/rooms/${run.roomId}/layout`)}>
              <span className="row" style={{ gap: 8 }}>
                <Compass size={14} /> Open layout
              </span>
            </button>
          </div>
        ) : (
          <FieldMap
            w={layout.grid.w}
            h={layout.grid.h}
            field={map?.field}
            pockets={pockets.slice(0, 8)}
          />
        )}

        <div className="hr" />

        <div className="row" style={{ flexWrap: "wrap" }}>
          <button className="btn" onClick={() => onGo(`/runs/${run.id}/pockets`)}>
            <span className="row" style={{ gap: 8 }}>
              <ListOrdered size={14} /> Pockets
            </span>
          </button>
          {run.caseId && (
            <button className="btn" onClick={() => onGo(`/cases/${run.caseId}/pockets`)}>
              <span className="row" style={{ gap: 8 }}>
                <MapPin size={14} /> Case pockets
              </span>
            </button>
          )}
        </div>
      </Panel>
    </div>
  );
}

/* =========================================================
   G) COMPONENTS — map renderers + pocket card
   ========================================================= */

function LayoutMap({ w, h, zones = [], landmarks = [], pockets = [], onPocketClick }) {
  // simple CSS grid; zones are translucent overlays; pockets are pins
  return (
    <div className="layoutMap" style={{ gridTemplateColumns: `repeat(${w}, minmax(0, 1fr))` }}>
      {Array.from({ length: w * h }).map((_, i) => (
        <div key={i} className="cell2" />
      ))}

      {/* zones */}
      {zones.map((z) => (
        <div
          key={z.id}
          className="zoneBox"
          style={{
            gridColumn: `${z.x0 + 1} / ${z.x1 + 2}`,
            gridRow: `${z.y0 + 1} / ${z.y1 + 2}`,
          }}
          title={`${z.id} · ${z.label}`}
        >
          <div className="zoneLabel">{z.id}</div>
        </div>
      ))}

      {/* landmarks */}
      {landmarks.map((lm) => (
        <div
          key={lm.id}
          className="lm"
          style={{ gridColumn: lm.x + 1, gridRow: lm.y + 1 }}
          title={lm.label}
        >
          <span className="lmDot" />
        </div>
      ))}

      {/* pockets */}
      {pockets.map((p) => (
        <button
          key={p.id}
          className="pocketPin"
          style={{ gridColumn: p.x + 1, gridRow: p.y + 1 }}
          title={`${p.label} · ${p.title}`}
          onClick={() => onPocketClick && onPocketClick(p)}
        >
          <span className="pinDot" />
        </button>
      ))}
    </div>
  );
}

function FieldMap({ w, h, field, pockets = [] }) {
  const F = field || Array.from({ length: h }, () => Array.from({ length: w }, () => 0.25));
  return (
    <div className="layoutMap" style={{ gridTemplateColumns: `repeat(${w}, minmax(0, 1fr))` }}>
      {F.flatMap((row, y) =>
        row.map((v, x) => (
          <div
            key={`${x}-${y}`}
            className="cell2"
            style={{ background: riskColor(v) }}
            title={`risk ${(v * 100).toFixed(0)}%`}
          />
        ))
      )}

      {pockets.map((p) => (
        <div
          key={p.id}
          className="pocketPin pocketPin--static"
          style={{ gridColumn: p.x + 1, gridRow: p.y + 1 }}
          title={`${p.label} · ${p.title}`}
        >
          <span className="pinDot" />
        </div>
      ))}
    </div>
  );
}

function riskColor(v) {
  // 0..1 → cool to warm (still within your vibe)
  const hue = 210 - v * 165; // 210 (blue) → ~45 (amber)
  const sat = 75;
  const light = 26 + v * 18;
  return `hsl(${hue} ${sat}% ${light}%)`;
}

function scorePocket(p) {
  // simple rank score; tweak later
  return (p.severity || 0) * 0.55 + (p.repeatability || 0) * 0.30 + clamp01((p.persistenceMin || 0) / 60) * 0.15;
}

function PocketCard({ pocket, onClick, hint }) {
  return (
    <button className="taskRow" onClick={onClick}>
      <div className="row" style={{ gap: 10 }}>
        <div className="taskIcon">
          <MapPin size={16} />
        </div>
        <div style={{ textAlign: "left" }}>
          <div style={{ fontWeight: 750 }}>
            {pocket.label} · {pocket.title}
          </div>
          <div className="kicker" style={{ marginTop: 4 }}>
            trigger: {pocket.trigger} · persist: {pocket.persistenceMin}m · repeat: {Math.round((pocket.repeatability || 0) * 100)}%
          </div>
          <div className="text" style={{ marginTop: 8, color: "var(--muted)" }}>
            {pocket.note}
          </div>
        </div>
      </div>

      <div className="row" style={{ gap: 10 }}>
        <Chip tone={pocket.severity > 0.75 ? "warn" : "neutral"}>{Math.round(pocket.severity * 100)}%</Chip>
        <span className="taskHint">
          {hint || "Open"} <ArrowRight size={14} />
        </span>
      </div>
    </button>
  );
}

function findCaseForRoom(data, siteId, roomId) {
  return (data.cases || []).find((c) => c.siteId === siteId && c.roomId === roomId)?.id || null;
}

/* =========================================================
   8) Optional: CSS tweaks (if you want select styling)
   ========================================================= */
// your .input already styles <select> fine.
// nothing required here.


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
.taskIcon{
  width: 30px; height: 30px; border-radius: 12px;
  display:flex; align-items:center; justify-content:center;
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(2,6,23,.30);
}
.taskHint{ color: var(--muted2); font-weight: 650; display:inline-flex; align-items:center; gap: 8px; }

.ul{ margin: 10px 0 0; padding-left: 18px; color: var(--muted); }
.ul li{ margin: 8px 0; }

.gateRow{
  display:flex;
  align-items:center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(2,6,23,.25);
}
.gateSelect{
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(2,6,23,.35);
  color: var(--text);
  outline: none;
  font-weight: 650;
}
.gateSelect:focus{ border-color: rgba(56,189,248,.35); box-shadow: 0 0 0 4px rgba(56,189,248,.08); }

.abstain{
  border-radius: 16px;
  border: 1px solid rgba(248,113,113,0.30);
  background: linear-gradient(180deg, rgba(248,113,113,0.08), rgba(2,6,23,0.25));
  padding: 14px;
}
.btn--blocked{
  width: 100%;
  border-color: rgba(248,113,113,0.35);
  background: rgba(248,113,113,0.12);
}

.eventRow{
  display:flex;
  align-items:center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(2,6,23,.25);
}

.layoutMap{
  display:grid;
  gap: 6px;
  padding: 10px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(2,6,23,.32);
  position: relative;
}
.cell2{
  border-radius: 8px;
  aspect-ratio: 1 / 1;
  border: 1px solid rgba(255,255,255,.06);
  background: rgba(2,6,23,.22);
}
.zoneBox{
  border-radius: 14px;
  border: 1px solid rgba(56,189,248,.22);
  background: rgba(56,189,248,.06);
  position: relative;
}
.zoneLabel{
  position:absolute;
  top: 6px; left: 8px;
  font-size: 11px;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: rgba(148,163,184,.85);
}
.lm{
  display:flex; align-items:center; justify-content:center;
  pointer-events:none;
}
.lmDot{
  width: 8px; height: 8px;
  border-radius: 999px;
  background: rgba(226,232,240,.70);
  box-shadow: 0 0 0 4px rgba(226,232,240,.08);
}
.pocketPin{
  display:flex;
  align-items:center;
  justify-content:center;
  border: 0;
  background: transparent;
  cursor: pointer;
  padding: 0;
}
.pocketPin--static{ cursor: default; }
.pinDot{
  width: 10px; height: 10px;
  border-radius: 999px;
  background: rgba(251,191,36,.85);
  box-shadow: 0 0 0 5px rgba(251,191,36,.10);
}
`}</style>
  );
}














