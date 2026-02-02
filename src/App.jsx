import React, { useMemo, useRef, useEffect, useState } from "react";
import {
  SitesPage,
  SiteDetailPage,
  RoomsPage,
  RoomDetailPage,
  RoomSummaryPage,
  SettingsUsersPage,
  SettingsRolesPage,
  CasesListPage,
  CaseNewPage,
  CaseDetailPage,
  CaseDefinePage,
  RunNewPage,
  RunProvenancePage,
  OverviewPage,
  RunValidityPage,
  RunReceiptsPage,
  ReceiptsIndexPage,
  ReceiptDetailPage,
  RunTimelinePage,
  CaseBaselinePage,
  CaseTriggersPage,
  RoomLayoutPage,
  CasePocketsPage,
  RunPocketsPage,
  RunMapPage,
  CaseVerdictPage,
  RunsComparePage,
  CaseReadoutPage,
  ReportsIndexPage,
  ReportNewPage,
  ReportViewPage,
  ReportReceiptsPage,
  ReportExportPage,
} from "./page";

import {
  Header,
  Chip,
  Panel,
  Stat
} from "./component";
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
  ClipboardList,
  FilePlus2,
  Tag,
  Timer,
  Layers,
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
  CalendarClock,
  Link2,
  Waves,
  ListChecks,
  ChevronRight,
  Map as MapIcon,
  MapPin,
  Layers as LayersIcon,
  ListOrdered,
  Compass,
  Target,
  GitCompare, 
  Gavel, 
  XCircle, 
  FileOutput, 
  FolderArchive, 
  FileSearch, 
  FileDown, 
  ClipboardSignature 
} from "lucide-react";

  // inside Slice0SkeletonPOC()
import { createPortalEngine } from "./portal_engine.js";
import { Clock, IdGen, Telemetry } from "./infra.js";




// tiny utils
function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}


function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

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

  const reports = [
    {
      id: "rep-001",
      caseId: "case-001",
      title: "Pilot Readout — Top Findings",
      createdAt: "Today",
      owner: "Bobby",
      status: "draft", // "draft" | "frozen"
      // what this report claims (POC placeholders)
      topFindings: [
        "SE shelf pocket (P-01) repeats on comparable Door cycle windows.",
        "Vent shadow zone appears after HVAC cycle; needs targeted verification.",
      ],
      keyResult: "P-01 repeats on comparable cycles (ABSTAIN until sensor trust PASS).",
      nextSteps: [
        "Run verification window after Door cycle with sensor trust PASS (or add temp sensor).",
        "If comparability fails, keep ABSTAIN and log why (prevents storytime).",
      ],
      // frozen bundle pointers (built in /reports/:id/receipts)
      frozenReceiptIds: ["rcpt-001"],
      // link back to runs (optional; useful for export summary)
      baselineRunId: "run-001",
      verificationRunId: null,
      verdictSnapshot: null, // copy of case verdict at freeze time
    },
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
      verificationRunId: null, // selected in /cases/:caseId/verify
      verdict: null, // set in /cases/:caseId/verdict

      readoutReportId: "rep-001",
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
    reports, layouts, runPockets, runMaps };
};

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
  const [path, qs] = route.split("?");
  const parts = path.split("/").filter(Boolean);
  const r = { page: "overview", params: {} };


  // helper to parse query
  const q = Object.fromEntries(new URLSearchParams(qs || ""));
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

    // SLICE 5:
    if (parts[2] === "verify") return { page: "caseVerify", params: { caseId } };
    if (parts[2] === "verdict") return { page: "caseVerdict", params: { caseId } };

    // SLICE 6:
    if (parts[2] === "readout") return { page: "caseReadout", params: { caseId } };

    return { page: "case", params: { caseId } };
  }

  // SLICE 2: receipts
  if (parts[0] === "receipts") {
    if (parts.length === 1) return { page: "receipts", params: {} };
    return { page: "receipt", params: { receiptId: parts[1] } };
  }

  if (parts[0] === "runs") {

    if (!parts[1]) return { page: "overview", params: {} };

    if (parts[1] === "compare") {
      return {
        page: "runsCompare",
        params: { left: q.left || "", right: q.right || "" },
      };
    }

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

  // SLICE 6: reports
  if (parts[0] === "reports") {
    if (parts.length === 1) return { page: "reports", params: {} };

    // /reports/new?case=:caseId
    if (parts[1] === "new") return { page: "reportNew", params: { caseId: q.case || "" } };

    const reportId = parts[1];
    if (parts[2] === "view") return { page: "reportView", params: { reportId } };
    if (parts[2] === "export") return { page: "reportExport", params: { reportId } };
    if (parts[2] === "receipts") return { page: "reportReceipts", params: { reportId } };

    // default /reports/:reportId
    return { page: "reportView", params: { reportId } };
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
  { key: "/reports", label: "Reports", icon: FolderArchive },
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

  const dataRef = useRef(data);
  useEffect(() => { dataRef.current = data; }, [data]);

  const engineRef = useRef(null);
  if (!engineRef.current) {
    const getData = () => dataRef.current;
    engineRef.current = createPortalEngine({
      getData,
      setData,
      clock: Clock.create(),
      idGen: IdGen.create(),
      telemetry: Telemetry.create(),
    });
  }
  const engine = engineRef.current;



  /*
  const compareLeft = useMemo(() => data.runs.find((r) => r.id === r.params.left), [data.runs, r.params.left]);
  const compareRight = useMemo(() => data.runs.find((r) => r.id === r.params.right), [data.runs, r.params.right]);

  const currentLayout = useMemo(() => {
    if (!r.params.siteId || !r.params.roomId) return null;
    return data.layouts?.find((l) => l.siteId === r.params.siteId && l.roomId === r.params.roomId) || null;
  }, [data.layouts, r.params.siteId, r.params.roomId]);
  */

  const compareLeft = useMemo(
    () => data.runs.find((run) => run.id === r.params?.left),
    [data.runs, r.params?.left]
  );
  const compareRight = useMemo(
    () => data.runs.find((run) => run.id === r.params?.right),
    [data.runs, r.params?.right]
  );

  const currentLayout = useMemo(() => {
    const siteId = r.params?.siteId;
    const roomId = r.params?.roomId;
    if (!siteId || !roomId) return null;
    return data.layouts?.find((l) => l.siteId === siteId && l.roomId === roomId) || null;
  }, [data.layouts, r.params?.siteId, r.params?.roomId]);


  const currentReport = useMemo(
    () => data.reports?.find((x) => x.id === r.params.reportId) || null,
    [data.reports, r.params.reportId]
  );

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
            {r.page === "overview" && <OverviewPage onGo={go} sites={data.sites}/>}
            {r.page === "sites" && <SitesPage sites={data.sites} onGo={go} />}
            {r.page === "site" && <SiteDetailPage site={site} onGo={go} />}
            {r.page === "rooms" && <RoomsPage site={site} onGo={go} />}
            {r.page === "room" && <RoomDetailPage site={site} room={room} onGo={go} />}
            {r.page === "roomSummary" && <RoomSummaryPage site={site} room={room} onGo={go} />}
            {r.page === "cases" && <CasesListPage data={data} onGo={go} />}
            {r.page === "caseNew" && (
  <CaseNewPage data={data} setData={setData} onGo={go} engine={engine} />
)}
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
            {r.page === "runValidity" && (
              <RunValidityPage data={data} setData={setData} onGo={go} run={currentRun} engine={engine} />
            )}
            {r.page === "runReceipts" && (
              <RunReceiptsPage data={data} setData={setData} onGo={go} run={currentRun} engine={engine} />
            )}
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


            {r.page === "caseVerify" && (
              <CaseVerifyPage data={data} setData={setData} onGo={go} theCase={currentCase} />
            )}
            {r.page === "caseVerdict" && (
              <CaseVerdictPage data={data} setData={setData} onGo={go} theCase={currentCase} engine={engine} />
            )}
            {r.page === "runsCompare" && (
              <RunsComparePage data={data} setData={setData} onGo={go} leftRun={compareLeft} rightRun={compareRight} />
            )}

            {r.page === "caseReadout" && (
              <CaseReadoutPage data={data} setData={setData} onGo={go} theCase={currentCase} />
            )}
            {r.page === "reports" && <ReportsIndexPage data={data} onGo={go} />}
            {r.page === "reportNew" && <ReportNewPage data={data} setData={setData} onGo={go} caseId={r.params.caseId} />}
            {r.page === "reportView" && <ReportViewPage data={data} setData={setData} onGo={go} report={currentReport} />}
            {r.page === "reportExport" && <ReportExportPage data={data} onGo={go} report={currentReport} />}
            {r.page === "reportReceipts" && <ReportReceiptsPage data={data} setData={setData} onGo={go} report={currentReport} />}

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

              "caseVerify",
              "caseVerdict",
              "runsCompare",

              "caseReadout",
              "reports",
              "reportNew",
              "reportView",
              "reportExport",
              "reportReceipts",

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














