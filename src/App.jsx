// Slice0SkeletonPOC.jsx
import React, { useMemo, useRef, useEffect, useState } from "react";
import { Style } from "./util";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
  useParams,
  useSearchParams,
  useOutletContext,
  useLocation,
} from "react-router-dom";

import {
  AcceptInvite,
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
  CaseVerifyPage,
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
  CaseEvidencePage,
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
  Login,
} from "./page";

import { Header, Chip, Panel, Stat } from "./component";

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
  ClipboardSignature,
} from "lucide-react";

import { createPortalEngine } from "./portal_engine.js";
import { Clock, IdGen, Telemetry } from "./infra.js";
import { cx, clamp01 } from "./algorithms";

// -----------------------------
// seed data + demo builders
// -----------------------------
function buildDemoTimeline() {
  return [
    { id: "ev-001", t: "06:10", type: "door", label: "Door cycle", severity: 0.55 },
    { id: "ev-002", t: "06:40", type: "hvac", label: "HVAC cycle", severity: 0.35 },
    { id: "ev-003", t: "07:20", type: "door", label: "Door cycle", severity: 0.78 },
    { id: "ev-004", t: "08:05", type: "note", label: "Stocking activity", severity: 0.2 },
    { id: "ev-005", t: "09:10", type: "door", label: "Door cycle", severity: 0.62 },
    { id: "ev-006", t: "10:15", type: "hvac", label: "HVAC cycle", severity: 0.3 },
    { id: "ev-007", t: "12:20", type: "door", label: "Door cycle", severity: 0.7 },
    { id: "ev-008", t: "15:05", type: "intervention", label: "Fan moved (log)", severity: 0.45 },
    { id: "ev-009", t: "16:10", type: "door", label: "Door cycle", severity: 0.66 },
    { id: "ev-010", t: "18:30", type: "door", label: "Door cycle", severity: 0.52 },
  ];
}

function buildDemoMapField(w, h, seed = 1) {
  let t = seed >>> 0;
  const rng = () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };

  const field = Array.from({ length: h }, (_, y) =>
    Array.from({ length: w }, (_, x) => {
      const base = 0.25 + 0.15 * (x / (w - 1)) + 0.08 * (y / (h - 1));
      const dx = x - Math.floor(w * 0.72);
      const dy = y - Math.floor(h * 0.68);
      const bump = Math.exp(-(dx * dx + dy * dy) / 18) * 0.55;
      const noise = (rng() - 0.5) * 0.12;
      return clamp01(base + bump + noise);
    })
  );

  return field;
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
      status: "draft",
      topFindings: [
        "SE shelf pocket (P-01) repeats on comparable Door cycle windows.",
        "Vent shadow zone appears after HVAC cycle; needs targeted verification.",
      ],
      keyResult: "P-01 repeats on comparable cycles (ABSTAIN until sensor trust PASS).",
      nextSteps: [
        "Run verification window after Door cycle with sensor trust PASS (or add temp sensor).",
        "If comparability fails, keep ABSTAIN and log why (prevents storytime).",
      ],
      frozenReceiptIds: ["rcpt-001"],
      baselineRunId: "run-001",
      verificationRunId: null,
      verdictSnapshot: null,
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
      evidenceRunId: "run-001",
      baselineRunId: "run-001",
      triggerBinding: { tau: "Door cycle", windowMin: 15, anchorPolicy: "event-linked" },
      definition: {
        Z: "NW · A1",
        tau: "Door cycle",
        W: "15m",
        S: "Mid-cycle",
        sliceSentence:
          "We are talking about zone NW · A1 in window 15m after trigger Door cycle at stage Mid-cycle.",
      },
      verificationRunId: null,
      verdict: null,
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

  const layouts = [
    {
      id: "layout-001",
      siteId: "site-001",
      roomId: "room-001",
      name: "Walk-in Humidor layout (baseline)",
      createdAt: "Today",
      grid: { w: 20, h: 12 },
      landmarks: [
        { id: "lm-door", label: "Door", x: 1, y: 6 },
        { id: "lm-vent", label: "Supply vent", x: 16, y: 2 },
        { id: "lm-shelf", label: "Shelf block", x: 13, y: 8 },
      ],
      zones: [
        { id: "Z1", label: "Stable band", x0: 2, y0: 2, x1: 8, y1: 9 },
        { id: "Z2", label: "Door corridor", x0: 0, y0: 3, x1: 3, y1: 9 },
        { id: "Z3", label: "SE pocket-prone", x0: 12, y0: 6, x1: 19, y1: 11 },
      ],
    },
  ];

  const runPockets = [
    {
      id: "p-001",
      runId: "run-001",
      roomId: "room-001",
      siteId: "site-001",
      label: "P-01",
      title: "SE shelf pocket",
      x: 14,
      y: 8,
      severity: 0.82,
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

  const runMaps = [
    {
      id: "map-001",
      runId: "run-001",
      roomId: "room-001",
      siteId: "site-001",
      createdAt: "Today",
      field: buildDemoMapField(20, 12, 7),
    },
  ];

  return { sites, users, roles, cases, runs, receipts, reports, layouts, runPockets, runMaps };
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
// main app (Slice 0) — React Router
// -----------------------------
export default function Slice0SkeletonPOC() {
  const seed = useMemo(() => makeSeedData(), []);
  const [data, setData] = useState(seed);
  const [auth, setAuth] = useState(null);

  // keep dataRef updated (engine reads latest data)
  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // engine: single instance
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

  return (
    <BrowserRouter>
      <RouterApp data={data} setData={setData} auth={auth} setAuth={setAuth} engine={engine} />
    </BrowserRouter>
  );
}

// -----------------------------
// Router switch (authed vs unauthed)
// -----------------------------
function RouterApp({ data, setData, auth, setAuth, engine }) {
  if (!auth) {
    return (
      <Routes>
        <Route path="/accept-invite" element={<AcceptInviteRoute setAuth={setAuth} setData={setData} />} />
        <Route
          path="/accept-invite/:inviteToken"
          element={<AcceptInviteRoute setAuth={setAuth} setData={setData} />}
        />
        <Route path="/login" element={<LoginRoute setAuth={setAuth} />} />
        <Route path="*" element={<LoginRoute setAuth={setAuth} />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<AuthedLayout auth={auth} onLogout={() => setAuth(null)} />}>
        <Route index element={<Navigate to="overview" replace />} />

        <Route path="overview" element={<OverviewRoute data={data} />} />

        <Route path="sites" element={<SitesRoute data={data} />} />
        <Route path="sites/:siteId" element={<SiteDetailRoute data={data} />} />
        <Route path="sites/:siteId/rooms" element={<RoomsRoute data={data} />} />
        <Route path="sites/:siteId/rooms/:roomId" element={<RoomDetailRoute data={data} />} />
        <Route path="sites/:siteId/rooms/:roomId/summary" element={<RoomSummaryRoute data={data} />} />
        <Route
          path="sites/:siteId/rooms/:roomId/layout"
          element={<RoomLayoutRoute data={data} setData={setData} />}
        />
        <Route path="sites/:siteId/rooms/:roomId/*" element={<RoomDetailRoute data={data} />} />

        <Route path="settings" element={<Navigate to="/settings/users" replace />} />
        <Route path="settings/users" element={<SettingsUsersRoute data={data} setData={setData} />} />
        <Route path="settings/roles" element={<SettingsRolesRoute data={data} />} />
        <Route path="settings/*" element={<Navigate to="/settings/users" replace />} />

        <Route path="cases" element={<CasesListRoute data={data} />} />
        <Route path="cases/new" element={<CaseNewRoute data={data} setData={setData} engine={engine} />} />
        <Route path="cases/:caseId" element={<CaseDetailRoute data={data} setData={setData} />} />
        <Route path="cases/:caseId/define" element={<CaseDefineRoute data={data} setData={setData} />} />
        <Route path="cases/:caseId/evidence" element={<CaseEvidenceRoute data={data} setData={setData} />} />
        <Route path="cases/:caseId/baseline" element={<CaseBaselineRoute data={data} setData={setData} />} />
        <Route path="cases/:caseId/triggers" element={<CaseTriggersRoute data={data} setData={setData} />} />
        <Route path="cases/:caseId/pockets" element={<CasePocketsRoute data={data} setData={setData} />} />
        <Route path="cases/:caseId/verify" element={<CaseVerifyRoute data={data} setData={setData} />} />
        <Route
          path="cases/:caseId/verdict"
          element={<CaseVerdictRoute data={data} setData={setData} engine={engine} />}
        />
        <Route path="cases/:caseId/readout" element={<CaseReadoutRoute data={data} setData={setData} />} />
        <Route path="cases/:caseId/*" element={<CaseDetailRoute data={data} setData={setData} />} />

        <Route path="receipts" element={<ReceiptsIndexRoute data={data} />} />
        <Route path="receipts/:receiptId" element={<ReceiptDetailRoute data={data} />} />

        <Route path="runs">
          <Route path="new" element={<RunNewRoute data={data} setData={setData} />} />
          <Route path="compare" element={<RunsCompareRoute data={data} setData={setData} />} />

          <Route path=":runId" element={<Outlet />}>
            <Route index element={<Navigate to="provenance" replace />} />
            <Route path="provenance" element={<RunProvenanceRoute data={data} setData={setData} />} />
            <Route path="validity" element={<RunValidityRoute data={data} setData={setData} engine={engine} />} />
            <Route path="receipts" element={<RunReceiptsRoute data={data} setData={setData} engine={engine} />} />
            <Route path="timeline" element={<RunTimelineRoute data={data} setData={setData} />} />
            <Route path="pockets" element={<RunPocketsRoute data={data} setData={setData} />} />
            <Route path="map" element={<RunMapRoute data={data} setData={setData} />} />
            <Route path="*" element={<Navigate to="provenance" replace />} />
          </Route>
        </Route>

        <Route path="reports">
          <Route index element={<ReportsIndexRoute data={data} />} />
          <Route path="new" element={<ReportNewRoute data={data} setData={setData} />} />

          <Route path=":reportId" element={<Outlet />}>
            <Route index element={<Navigate to="view" replace />} />
            <Route path="view" element={<ReportViewRoute data={data} setData={setData} />} />
            <Route path="export" element={<ReportExportRoute data={data} />} />
            <Route path="receipts" element={<ReportReceiptsRoute data={data} setData={setData} />} />
            <Route path="*" element={<Navigate to="view" replace />} />
          </Route>
        </Route>

        <Route path="login" element={<Navigate to="/overview" replace />} />
        <Route path="*" element={<Navigate to="/overview" replace />} />
      </Route>
    </Routes>
  );
}

// -----------------------------
// Authed layout shell
// -----------------------------
function AuthedLayout({ auth, onLogout }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const go = (to) => navigate(to);

  function logout() {
    onLogout?.();
    navigate("/overview"); // unauth router will show Login
  }

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
                  className={cx("navbtn", pathname.startsWith(key) && "navbtn--active")}
                  onClick={() => go(key)}
                >
                  <Icon size={18} style={{ opacity: 0.9 }} />
                  <div style={{ fontWeight: 600, color: pathname.startsWith(key) ? "var(--text)" : "var(--muted)" }}>
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
            <Outlet context={{ go }} />
          </main>
        </div>

        <div className="footer">© {new Date().getFullYear()} HermodLabs · Slice 0 Skeleton</div>
      </div>
    </>
  );
}

function useGo() {
  const { go } = useOutletContext();
  return go;
}

function useGoNavigate() {
  const navigate = useNavigate();
  return (to) => navigate(to);
}

// -----------------------------
// Unauthed routes
// -----------------------------
export function LoginRoute({ setAuth }) {
  const navigate = useNavigate();
  return (
    <Login
      onLogin={(a) => {
        setAuth(a);
        navigate("/overview");
      }}
      onGoInvite={(token) => navigate(`/accept-invite/${token}`)}
    />
  );
}

export function AcceptInviteRoute({ setAuth, setData }) {
  const navigate = useNavigate();
  const { inviteToken = "" } = useParams();

  return (
    <AcceptInvite
      inviteToken={inviteToken}
      onBack={() => navigate("/login")}
      onAccept={({ name, email }) => {
        const newUser = {
          id: `u-${Math.floor(100 + Math.random() * 900)}`,
          name,
          email,
          roleId: "r-ops",
        };
        setData((d) => ({ ...d, users: [newUser, ...d.users] }));
        setAuth({ tenant: "HermodLabs (POC)", email });
        navigate("/overview");
      }}
    />
  );
}

// ------------------------------------------------------------
// Authed wrapper routes (ALL updated to useGoNavigate())
// ------------------------------------------------------------
export function OverviewRoute({ data }) {
  const go = useGoNavigate();
  return <OverviewPage onGo={go} sites={data.sites} />;
}

// ----- Sites -----
export function SitesRoute({ data }) {
  const go = useGoNavigate();
  return <SitesPage sites={data.sites} onGo={go} />;
}

export function SiteDetailRoute({ data }) {
  const go = useGoNavigate();
  const { siteId } = useParams();
  const site = data.sites.find((s) => s.id === siteId);
  return site ? <SiteDetailPage site={site} onGo={go} /> : <OverviewPage onGo={go} sites={data.sites} />;
}

export function RoomsRoute({ data }) {
  const go = useGoNavigate();
  const { siteId } = useParams();
  const site = data.sites.find((s) => s.id === siteId);
  return site ? <RoomsPage site={site} onGo={go} /> : <OverviewPage onGo={go} sites={data.sites} />;
}

export function RoomDetailRoute({ data }) {
  const go = useGoNavigate();
  const { siteId, roomId } = useParams();
  const site = data.sites.find((s) => s.id === siteId);
  const room = site?.rooms?.find((r) => r.id === roomId);
  return site && room ? (
    <RoomDetailPage site={site} room={room} onGo={go} />
  ) : (
    <OverviewPage onGo={go} sites={data.sites} />
  );
}

export function RoomSummaryRoute({ data }) {
  const go = useGoNavigate();
  const { siteId, roomId } = useParams();
  const site = data.sites.find((s) => s.id === siteId);
  const room = site?.rooms?.find((r) => r.id === roomId);
  return site && room ? (
    <RoomSummaryPage site={site} room={room} onGo={go} />
  ) : (
    <OverviewPage onGo={go} sites={data.sites} />
  );
}

export function RoomLayoutRoute({ data, setData }) {
  const go = useGoNavigate();
  const { siteId, roomId } = useParams();
  const site = data.sites.find((s) => s.id === siteId);
  const room = site?.rooms?.find((r) => r.id === roomId);
  const layout = data.layouts?.find((l) => l.siteId === siteId && l.roomId === roomId) || null;

  return site && room ? (
    <RoomLayoutPage
      data={data}
      setData={setData}
      onGo={go}
      site={site}
      room={room}
      layout={layout}
    />
  ) : (
    <OverviewPage onGo={go} sites={data.sites} />
  );
}

// ----- Settings -----
export function SettingsUsersRoute({ data, setData }) {
  const go = useGoNavigate();
  return <SettingsUsersPage data={data} setData={setData} onGo={go} />;
}

export function SettingsRolesRoute({ data }) {
  // your SettingsRolesPage doesn’t take onGo in your original code
  return <SettingsRolesPage roles={data.roles} />;
}

// ----- Cases -----
export function CasesListRoute({ data }) {
  const go = useGoNavigate();
  return <CasesListPage data={data} onGo={go} />;
}

export function CaseNewRoute({ data, setData, engine }) {
  const go = useGoNavigate();
  return <CaseNewPage data={data} setData={setData} onGo={go} engine={engine} />;
}

export function CaseDetailRoute({ data, setData }) {
  const go = useGoNavigate();
  const { caseId } = useParams();
  const theCase = data.cases.find((c) => c.id === caseId);
  return <CaseDetailPage data={data} setData={setData} onGo={go} theCase={theCase} />;
}

export function CaseDefineRoute({ data, setData }) {
  const go = useGoNavigate();
  const { caseId } = useParams();
  const theCase = data.cases.find((c) => c.id === caseId);
  return <CaseDefinePage data={data} setData={setData} onGo={go} theCase={theCase} />;
}

export function CaseEvidenceRoute({ data, setData }) {
  const go = useGoNavigate();
  const { caseId } = useParams();
  const theCase = data.cases.find((c) => c.id === caseId);
  return <CaseEvidencePage data={data} setData={setData} onGo={go} theCase={theCase} />;
}

export function CaseBaselineRoute({ data, setData }) {
  const go = useGoNavigate();
  const { caseId } = useParams();
  const theCase = data.cases.find((c) => c.id === caseId);
  return <CaseBaselinePage data={data} setData={setData} onGo={go} theCase={theCase} />;
}

export function CaseTriggersRoute({ data, setData }) {
  const go = useGoNavigate();
  const { caseId } = useParams();
  const theCase = data.cases.find((c) => c.id === caseId);
  return <CaseTriggersPage data={data} setData={setData} onGo={go} theCase={theCase} />;
}

export function CasePocketsRoute({ data, setData }) {
  const go = useGoNavigate();
  const { caseId } = useParams();
  const theCase = data.cases.find((c) => c.id === caseId);
  return <CasePocketsPage data={data} setData={setData} onGo={go} theCase={theCase} />;
}

export function CaseVerifyRoute({ data, setData }) {
  const go = useGoNavigate();
  const { caseId } = useParams();
  const theCase = data.cases.find((c) => c.id === caseId);
  return <CaseVerifyPage data={data} setData={setData} onGo={go} theCase={theCase} />;
}

export function CaseVerdictRoute({ data, setData, engine }) {
  const go = useGoNavigate();
  const { caseId } = useParams();
  const theCase = data.cases.find((c) => c.id === caseId);
  return <CaseVerdictPage data={data} setData={setData} onGo={go} theCase={theCase} engine={engine} />;
}

export function CaseReadoutRoute({ data, setData }) {
  const go = useGoNavigate();
  const { caseId } = useParams();
  const theCase = data.cases.find((c) => c.id === caseId);
  return <CaseReadoutPage data={data} setData={setData} onGo={go} theCase={theCase} />;
}

// ----- Receipts -----
export function ReceiptsIndexRoute({ data }) {
  const go = useGoNavigate();
  return <ReceiptsIndexPage data={data} onGo={go} />;
}

export function ReceiptDetailRoute({ data }) {
  const go = useGoNavigate();
  const { receiptId } = useParams();
  const receipt = data.receipts.find((x) => x.id === receiptId);
  return <ReceiptDetailPage data={data} onGo={go} receipt={receipt} />;
}

// ----- Runs -----
export function RunNewRoute({ data, setData }) {
  const go = useGoNavigate();
  return <RunNewPage data={data} setData={setData} onGo={go} />;
}

export function RunProvenanceRoute({ data, setData }) {
  const go = useGoNavigate();
  const { runId } = useParams();
  const run = data.runs.find((x) => x.id === runId);
  return <RunProvenancePage data={data} setData={setData} onGo={go} run={run} />;
}

export function RunValidityRoute({ data, setData, engine }) {
  const go = useGoNavigate();
  const { runId } = useParams();
  const run = data.runs.find((x) => x.id === runId);
  return <RunValidityPage data={data} setData={setData} onGo={go} run={run} engine={engine} />;
}

export function RunReceiptsRoute({ data, setData, engine }) {
  const go = useGoNavigate();
  const { runId } = useParams();
  const run = data.runs.find((x) => x.id === runId);
  return <RunReceiptsPage data={data} setData={setData} onGo={go} run={run} engine={engine} />;
}

export function RunTimelineRoute({ data, setData }) {
  const go = useGoNavigate();
  const { runId } = useParams();
  const run = data.runs.find((x) => x.id === runId);
  return <RunTimelinePage data={data} setData={setData} onGo={go} run={run} />;
}

export function RunPocketsRoute({ data, setData }) {
  const go = useGoNavigate();
  const { runId } = useParams();
  const run = data.runs.find((x) => x.id === runId);
  return <RunPocketsPage data={data} setData={setData} onGo={go} run={run} />;
}

export function RunMapRoute({ data, setData }) {
  const go = useGoNavigate();
  const { runId } = useParams();
  const run = data.runs.find((x) => x.id === runId);
  return <RunMapPage data={data} setData={setData} onGo={go} run={run} />;
}

export function RunsCompareRoute({ data, setData }) {
  const go = useGoNavigate();
  const [sp] = useSearchParams();
  const leftId = sp.get("left") || "";
  const rightId = sp.get("right") || "";
  const leftRun = data.runs.find((r) => r.id === leftId);
  const rightRun = data.runs.find((r) => r.id === rightId);

  return (
    <RunsComparePage
      data={data}
      setData={setData}
      onGo={go}
      leftRun={leftRun}
      rightRun={rightRun}
    />
  );
}

// ----- Reports -----
export function ReportsIndexRoute({ data }) {
  const go = useGoNavigate();
  return <ReportsIndexPage data={data} onGo={go} />;
}

export function ReportNewRoute({ data, setData }) {
  const go = useGoNavigate();
  const [sp] = useSearchParams();
  const caseId = sp.get("case") || "";
  return <ReportNewPage data={data} setData={setData} onGo={go} caseId={caseId} />;
}

export function ReportViewRoute({ data, setData }) {
  const go = useGoNavigate();
  const { reportId } = useParams();
  const report = data.reports?.find((x) => x.id === reportId) || null;
  return <ReportViewPage data={data} setData={setData} onGo={go} report={report} />;
}

export function ReportExportRoute({ data }) {
  const go = useGoNavigate();
  const { reportId } = useParams();
  const report = data.reports?.find((x) => x.id === reportId) || null;
  return <ReportExportPage data={data} onGo={go} report={report} />;
}

export function ReportReceiptsRoute({ data, setData }) {
  const go = useGoNavigate();
  const { reportId } = useParams();
  const report = data.reports?.find((x) => x.id === reportId) || null;
  return <ReportReceiptsPage data={data} setData={setData} onGo={go} report={report} />;
}
