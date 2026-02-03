import React, { useMemo, useRef, useEffect, useState } from "react";
import {Style} from "./util"
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

import { cx, clamp01 } from "./algorithms";

function makeSeedData() {
  /**
   * PURPOSE (why this exists):
   * This is “walking skeleton” seed data for the portal POC.
   *
   * It is not trying to be realistic, complete, or scalable.
   * It is trying to make every route *truthfully renderable* on first load:
   * - objects exist
   * - links resolve
   * - the UI can demonstrate “no lies” behavior without a backend
   *
   * In other words: this data is a harness for the product narrative.
   * It lets you demo the posture (“ABSTAIN is binding”, “comparability is required”)
   * without blocking on persistence, auth, or ingestion pipelines.
   */

  /**
   * SITES (why two of them):
   * We need at least one “real-feeling” site and one “demo/simulated” site
   * to show the portal can handle multiple tenants/locations and different room kinds.
   *
   * The Cigar District: a non-cannabis example that still makes microclimate intuitive.
   * Greenhouse Demo: a “POC explicit” environment where simulated status is acceptable.
   *
   * The goal is *scannability*: operator immediately understands “where am I?”
   */
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

  /**
   * USERS (why these two):
   * You need *just enough* identity to make permissions and ownership feel real.
   * - Bobby: “operator reality” (does the work, owns runs/cases)
   * - Avery: “admin reality” (invites, roles, governance)
   *
   * This supports:
   * - “owner” fields on cases/runs/reports
   * - /settings/users and /settings/roles routes
   * - the social story: ops vs admin vs viewer
   */
  const users = [
    { id: "u-001", name: "Bobby", email: "bobby@example.com", roleId: "r-ops" },
    { id: "u-002", name: "Avery", email: "avery@example.com", roleId: "r-admin" },
  ];

  /**
   * ROLES (why these three):
   * This is the minimum RBAC triad:
   * - Admin: can change system state (invite/manage)
   * - Operator: can generate evidence (runs/receipts/verdicts)
   * - Viewer: can read without power (audit/compliance/customer)
   *
   * The product pitch is “audit-grade receipts”—a Viewer role makes that concrete:
   * someone can verify without being able to rewrite history.
   */
  const roles = [
    { id: "r-admin", name: "Admin", desc: "Invite users, manage roles, configure org settings." },
    { id: "r-ops", name: "Operator", desc: "Work tasks, record changes, generate receipts." },
    { id: "r-view", name: "Viewer", desc: "Read-only access to rooms and reports." },
  ];

  /**
   * REPORTS (why a report exists before the system is “done”):
   * The report is the handoff artifact. It’s the thing that survives politics.
   * In the POC, we include one draft report so:
   * - /reports routes are non-empty and demonstrable
   * - you can show the “no screenshot games” stance early
   * - you can show that a report *links to receipts* (frozenReceiptIds)
   *
   * The content is intentionally “operator plausible” rather than “scientifically complete.”
   */
  const reports = [
    {
      id: "rep-001",
      caseId: "case-001",
      title: "Pilot Readout — Top Findings",
      createdAt: "Today",
      owner: "Bobby",
      status: "draft", // "draft" | "frozen"

      // These are placeholders to demonstrate report structure:
      // findings, a single key result, and “next steps” that point back to proof discipline.
      topFindings: [
        "SE shelf pocket (P-01) repeats on comparable Door cycle windows.",
        "Vent shadow zone appears after HVAC cycle; needs targeted verification.",
      ],
      keyResult: "P-01 repeats on comparable cycles (ABSTAIN until sensor trust PASS).",
      nextSteps: [
        "Run verification window after Door cycle with sensor trust PASS (or add temp sensor).",
        "If comparability fails, keep ABSTAIN and log why (prevents storytime).",
      ],

      // This is the governance hook:
      // a report is only credible if it references the frozen receipts it is claiming from.
      frozenReceiptIds: ["rcpt-001"],

      // Optional link-backs so export pages can show “what evidence this was based on.”
      baselineRunId: "run-001",
      verificationRunId: null,
      verdictSnapshot: null,
    },
  ];

  /**
   * CASES (why exactly one case):
   * A case is the contract object: it freezes the question into (Z, τ, W, S).
   * One seeded case proves the routing spine and “contract fields” UI can render.
   *
   * This case is also wired to:
   * - an evidence run (Slice 2)
   * - a baseline run + trigger binding (Slice 3)
   * - a report (Slice 6)
   *
   * So one object exercises the whole narrative chain without additional setup.
   */
  const cases = [
    {
      id: "case-001",
      title: "Door corridor dry band (baseline)",
      status: "defining",
      createdAt: "Today",
      owner: "Bobby",
      siteId: "site-001",
      roomId: "room-001",

      // Slice 2: “evidence exists, but interpretation is gated”
      evidenceRunId: "run-001",

      // Slice 3: “baseline claimed, ruler defined”
      baselineRunId: "run-001",
      triggerBinding: {
        // We bind τ/W to a timeline event so comparisons are apples-to-apples,
        // not arbitrary wall-clock averages.
        tau: "Door cycle",
        windowMin: 15,
        anchorPolicy: "event-linked",
      },

      // The case definition is the anti-theater mechanism.
      // It prevents later meetings from laundering the claim into “overall humidity.”
      definition: {
        Z: "NW · A1",
        tau: "Door cycle",
        W: "15m",
        S: "Mid-cycle",
        sliceSentence:
          "We are talking about zone NW · A1 in window 15m after trigger Door cycle at stage Mid-cycle.",
      },

      // Slice 5/6 hooks (empty until user performs actions)
      verificationRunId: null,
      verdict: null,
      readoutReportId: "rep-001",
    },
  ];

  /**
   * RUNS (why only one run, and why it’s “ABSTAIN-ish”):
   * A Run is the evidence object: provenance + validity gates + receipts.
   * We seed a run that looks “almost good” but is blocked by one critical uncertainty:
   * sensorTrust = unknown.
   *
   * This is deliberate: it demonstrates the product’s spine:
   * “green dashboards lie; unknown trust must force ABSTAIN.”
   *
   * The run includes:
   * - plausible provenance (hash, firmware, sensorSet)
   * - gate states to drive ABSTAIN logic
   * - a timeline to support event-linked windows (Slice 3)
   */
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
        // Critical truth: one unknown blocks interpretation.
        sensorTrust: "unknown",
        coverage: "pass",
        timeAlignment: "pass",

        // Secondary gates pass to keep the demo focused on the one uncertainty.
        calibration: "pass",
        placementSanity: "pass",
        driftFlag: "pass",
      },
      notes: "",
      timeline: buildDemoTimeline(),
    },
  ];

  /**
   * RECEIPTS (why a receipt exists at all in seed data):
   * Receipts are the “time-stamped, defensible artifact.”
   * Even in a POC, you want to show:
   * - receipts can freeze ABSTAIN (not hide it)
   * - receipts link to case + run
   * - the receipt text is what someone reads two weeks later
   *
   * This makes the product feel like governance, not visualization.
   */
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

  /**
   * LAYOUTS (why layout is a first-class object):
   * Pockets are useless if you can’t *walk to them*.
   * The layout gives “where” a coordinate system:
   * - grid = a stable reference (POC simplicity)
   * - landmarks = operator reality (“door”, “vent”, “shelf”)
   * - zones = baseline segmentation (even if manual here)
   *
   * This supports the core claim: “Not averages—localized truth.”
   */
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

  /**
   * RUN POCKETS (why pockets are on runs, not cases):
   * Canonical rule: pockets are discovered/derived from evidence (a run),
   * then a case *consumes* them for action/verdict.
   *
   * This prevents “case drift” from rewriting what the evidence actually said.
   * A pocket references:
   * - runId (provenance)
   * - coordinates (walk-to)
   * - severity / persistence / repeatability (rank + decision support)
   * - trigger (ties back to τ)
   *
   * The values are intentionally “demo-satisfying”: you can see ranking and variety.
   */
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

  /**
   * RUN MAPS (why include a “field” map in the seed):
   * The field map is optional for the product, but valuable for UI demonstration:
   * it lets the user see a continuous surface + pocket overlays.
   *
   * In the POC, the field is deterministic (seeded) so:
   * - the visual stays stable between reloads
   * - tests or screenshots don’t become flaky
   * - you can iterate UI layout without chasing randomness
   */
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

  /**
   * RETURN SHAPE (why everything is returned together):
   * The POC uses a single in-memory “data store” object.
   * Returning all arrays together makes it easy to:
   * - initialize React state in one call
   * - reset state in tests
   * - pass data to the engine with a single reference
   */
  return { sites, users, roles, cases, runs, receipts, reports, layouts, runPockets, runMaps };
}


function buildDemoTimeline() {
  /**
   * PURPOSE (why this exists):
   * This is seed “event truth” for a Run. It supports Slice 3’s core posture:
   *
   *   Measure windows *relative to events* (τ/W), not wall-clock averages.
   *
   * The UI needs a timeline that:
   * - is simple enough to scan (coarse, a handful of events)
   * - has repeated triggers (multiple “Door cycle” events)
   * - has mixed causes (door, hvac, note, intervention)
   *
   * That lets you demo:
   * - trigger binding (case.triggerBinding.tau matches timeline labels)
   * - event-linked window selection (“15m after Door cycle”)
   * - “good friction” when τ doesn’t match anything (comparability/ruler fails honestly)
   */

  /**
   * SHAPE (why each event has these fields):
   * - id: stable key for React lists and future auditing
   * - t: human-readable time for operator scan; not a real timestamp (POC)
   * - type: lightweight category for filtering UI (Door/HVAC/Note/Intervention)
   * - label: the “τ name” that cases bind to (must match exactly)
   * - severity: demo-only scalar (0..1) to color/weight chips and show “risk varies”
   *
   * Importantly: label is the contract surface. Cases reference label, not id,
   * because operators talk in “Door cycle” not “ev-007”.
   */

  /**
   * CONTENT (why these specific events):
   * - Multiple “Door cycle” entries: you can prove repeatability across *comparable moments*.
   * - HVAC cycles: show that not all triggers are human-driven; machinery creates patterns too.
   * - A note (“Stocking activity”): shows humans create confounders that need to be recorded.
   * - An intervention (“Fan moved”): shows that changes are logged as events, enabling
   *   before/after reasoning *without pretending it proves causality*.
   *
   * The times are “24h-ish” but intentionally sparse—enough to demonstrate the feature,
   * not to simulate reality.
   */
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
  /**
   * PURPOSE (why this exists):
   * This generates a deterministic “risk field” for the Run Map page.
   *
   * It’s not physics. It’s not real microclimate modeling. It’s a *UI substrate*:
   * - gives the map route something visually meaningful to render (a continuous gradient)
   * - makes pockets feel grounded in “a field,” not just an arbitrary list
   * - supports Slice 4’s story: “spatial variation exists even when averages look fine”
   *
   * Most importantly: it is deterministic given (w,h,seed), so:
   * - screenshots/demos are stable
   * - tests and debugging aren’t fighting randomness
   * - you can reproduce a map by recording the seed (receipt-friendly)
   */

  /**
   * CONSTRAINTS (why no external deps):
   * This is seed/demo code that should run anywhere (browser, tests, minimal build).
   * No Perlin/noise libs, no crypto RNG, no Node APIs.
   * It’s intentionally lightweight so it doesn’t create build or compatibility risk.
   */

  /**
   * RNG (what this section is doing):
   * We implement a tiny PRNG (pseudo-random number generator) using integer math.
   * - `seed >>> 0` forces an unsigned 32-bit start state.
   * - The bitmixing/imul steps provide a decent distribution for “visual noise.”
   * - Output is normalized to [0,1) by dividing by 2^32.
   *
   * This is “random-looking,” not cryptographic.
   */
  let t = seed >>> 0;
  const rng = () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };

  /**
   * FIELD MODEL (how the value at each cell is constructed):
   * We build a 2D grid of values in roughly [0,1].
   *
   * Each cell combines three components:
   * 1) base gradient: a gentle spatial slope so the map isn’t flat
   * 2) “SE pocket” bump: a localized Gaussian-like hot spot to anchor the narrative
   * 3) small noise: breaks up uniformity so it looks like real spatial texture
   *
   * The result is:
   * - smooth enough to read as a “field”
   * - structured enough to look intentional
   * - varied enough that pockets can plausibly “sit” in interesting areas
   */
  const field = Array.from({ length: h }, (_, y) =>
    Array.from({ length: w }, (_, x) => {
      /**
       * 1) Base gradient:
       * - X contributes ~0.15 across the width
       * - Y contributes ~0.08 across the height
       * - baseline offset of ~0.25 keeps values away from 0
       *
       * This ensures even “no bump” areas aren’t all the same color.
       */
      const base = 0.25 + 0.15 * (x / (w - 1)) + 0.08 * (y / (h - 1));

      /**
       * 2) SE bump (localized hotspot):
       * We create a bump centered around ~72% width, ~68% height.
       * That lands in the “southeast-ish” region of the map.
       *
       * Why: it supports the narrative of “a recurring pocket in a specific corner”
       * and makes the demo’s top pocket visually consistent with the map.
       *
       * The shape uses exp(-(dx^2+dy^2)/18), which is basically a soft Gaussian hill.
       * The 0.55 scales the bump intensity so it matters but doesn’t saturate everything.
       */
      const dx = x - Math.floor(w * 0.72);
      const dy = y - Math.floor(h * 0.68);
      const bump = Math.exp(-(dx * dx + dy * dy) / 18) * 0.55;

      /**
       * 3) Noise:
       * Small symmetric jitter around zero.
       * - rng() in [0,1)
       * - shift to [-0.5, 0.5)
       * - scale to ±0.06 (since *0.12)
       *
       * Purpose: visual texture and mild local variation.
       */
      const noise = (rng() - 0.5) * 0.12;

      /**
       * Clamp:
       * Keep output in [0,1] so color mapping is stable and predictable.
       * (Assumes clamp01 exists elsewhere in the module.)
       */
      return clamp01(base + bump + noise);
    })
  );

  /**
   * OUTPUT:
   * A 2D array: field[y][x] with values in [0,1].
   * This matches how the FieldMap renderer iterates rows and columns.
   */
  return field;
}








function parseRoute(route) {
  /**
   * PURPOSE (why this routing code exists):
   * Slice 0 is a “state-router” POC: we don’t need React Router yet, but we *do* need:
   * - stable, bookmarkable URLs (strings)
   * - deterministic mapping from URL -> { page, params }
   *
   * The output of this function is intentionally small:
   *   { page: "<screenName>", params: { ...ids } }
   *
   * That lets the UI do one honest thing:
   * render the correct page component for r.page, and pass the looked-up objects from params.
   */

  /**
   * SPLIT PATH + QUERY:
   * route is a string like:
   *   "/runs/compare?left=run-001&right=run-002"
   *
   * We separate it into:
   * - path: everything before "?"
   * - qs:   everything after "?" (or undefined)
   */
  const [path, qs] = route.split("?");

  /**
   * TOKENIZE THE PATH:
   * "/sites/site-001/rooms/room-002/summary"
   *   -> ["sites","site-001","rooms","room-002","summary"]
   *
   * filter(Boolean) removes empty segments caused by leading/trailing slashes.
   */
  const parts = path.split("/").filter(Boolean);

  /**
   * DEFAULT ROUTE OBJECT:
   * If we can’t parse anything, or the path is empty, we fall back to overview.
   * This ensures the app never crashes on an unknown route—it just returns an “honest default.”
   */
  const r = { page: "overview", params: {} };

  /**
   * PARSE QUERY STRING INTO AN OBJECT:
   * We use URLSearchParams so:
   * - encoding/decoding is correct
   * - missing qs yields an empty object
   *
   * Example:
   *   qs = "left=run-001&right=run-002"
   *   -> q = { left: "run-001", right: "run-002" }
   */
  const q = Object.fromEntries(new URLSearchParams(qs || ""));

  /**
   * EMPTY PATH:
   * "/" should land you on overview.
   */
  if (parts.length === 0) return r;

  /**
   * TOP-LEVEL ROUTES:
   * These are “stable anchors” that keep the shell coherent.
   * Even if deeper slices are missing, these pages must still exist.
   */
  if (parts[0] === "overview") return { page: "overview", params: {} };

  /**
   * SITES (Slice 0 core navigation):
   * These routes prove that tenant/site/room objects are real and navigable.
   *
   * Patterns used here:
   * - /sites                      -> directory
   * - /sites/:siteId              -> site detail
   * - /sites/:siteId/rooms        -> room list
   * - /sites/:siteId/rooms/:roomId -> room detail
   * - /sites/:siteId/rooms/:roomId/summary -> room summary (explicitly “no analysis yet”)
   */
  if (parts[0] === "sites") {
    if (parts.length === 1) return { page: "sites", params: {} };

    const siteId = parts[1];
    if (parts.length === 2) return { page: "site", params: { siteId } };

    if (parts[2] === "rooms") {
      if (parts.length === 3) return { page: "rooms", params: { siteId } };

      const roomId = parts[3];
      if (parts.length === 4) return { page: "room", params: { siteId, roomId } };

      // /sites/:siteId/rooms/:roomId/summary
      if (parts[4] === "summary") return { page: "roomSummary", params: { siteId, roomId } };

      // SLICE 4: layout anchor makes pockets “walkable”
      if (parts[4] === "layout") return { page: "roomLayout", params: { siteId, roomId } };
    }
  }

  /**
   * SETTINGS (Slice 0 admin reality):
   * These routes exist so “team + roles” isn’t hand-waved.
   * If the second segment is unknown, we default to users (safe/honest).
   */
  if (parts[0] === "settings") {
    if (parts[1] === "users") return { page: "settingsUsers", params: {} };
    if (parts[1] === "roles") return { page: "settingsRoles", params: {} };
    return { page: "settingsUsers", params: {} };
  }

  /**
   * INVITE ACCEPT FLOW (Slice 0 auth scaffold):
   * The invite token is a route parameter so the flow is a real object in the system.
   * In production, you’d validate token server-side; here we prove the route exists.
   */
  if (parts[0] === "accept-invite") {
    return { page: "acceptInvite", params: { inviteToken: parts[1] || "" } };
  }

  /**
   * CASES (Slice 1+ spine):
   * Cases are “contract objects” (Z, τ, W, S) that prevent scope drift and storytime.
   *
   * Note the consistent shape:
   * - /cases                 -> list
   * - /cases/new             -> create
   * - /cases/:caseId         -> detail
   * - /cases/:caseId/<sub>   -> slice pages (define/evidence/baseline/...)
   */
  if (parts[0] === "cases") {
    if (parts.length === 1) return { page: "cases", params: {} };
    if (parts[1] === "new") return { page: "caseNew", params: {} };

    const caseId = parts[1];
    if (parts.length === 2) return { page: "case", params: { caseId } };

    // SLICE 1:
    if (parts[2] === "define") return { page: "caseDefine", params: { caseId } };

    // SLICE 2:
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

    // Unknown sub-route: fall back to case detail (still honest)
    return { page: "case", params: { caseId } };
  }

  /**
   * RECEIPTS (Slice 2 artifact index):
   * Receipts are the “frozen truth bundles” you point to later.
   */
  if (parts[0] === "receipts") {
    if (parts.length === 1) return { page: "receipts", params: {} };
    return { page: "receipt", params: { receiptId: parts[1] } };
  }

  /**
   * RUNS (Slice 2/3/4 infrastructure object):
   * Runs contain provenance, validity gates, and derived outputs (timeline/pockets/map).
   *
   * Special case: /runs/compare uses query params (left/right) not path params.
   * That’s deliberate: it models “compare these two IDs” as a stable URL.
   */
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

    // Slice 2 core:
    if (parts[2] === "provenance") return { page: "runProvenance", params: { runId } };
    if (parts[2] === "validity") return { page: "runValidity", params: { runId } };
    if (parts[2] === "receipts") return { page: "runReceipts", params: { runId } };

    // SLICE 3:
    if (parts[2] === "timeline") return { page: "runTimeline", params: { runId } };

    // SLICE 4:
    if (parts[2] === "pockets") return { page: "runPockets", params: { runId } };
    if (parts[2] === "map") return { page: "runMap", params: { runId } };

    // Default: provenance is the “entry” surface for a run
    return { page: "runProvenance", params: { runId } };
  }

  /**
   * REPORTS (Slice 6 handoff artifacts):
   * Reports are durable readout packs, not dashboards.
   * They support view/export/receipt-bundle.
   *
   * Special case: /reports/new uses a query param "case" to attach to a case.
   */
  if (parts[0] === "reports") {
    if (parts.length === 1) return { page: "reports", params: {} };

    if (parts[1] === "new") return { page: "reportNew", params: { caseId: q.case || "" } };

    const reportId = parts[1];
    if (parts[2] === "view") return { page: "reportView", params: { reportId } };
    if (parts[2] === "export") return { page: "reportExport", params: { reportId } };
    if (parts[2] === "receipts") return { page: "reportReceipts", params: { reportId } };

    // Default: view is the canonical surface
    return { page: "reportView", params: { reportId } };
  }

  /**
   * UNKNOWN ROUTE:
   * Fall back to overview rather than crashing.
   * (In a future slice, you could add an explicit NotFound page.)
   */
  return { page: "overview", params: {} };

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
  /**
   * PURPOSE (why this block exists):
   * This is the “wiring harness” for the Slice 0 portal shell.
   *
   * It establishes three things:
   * 1) Stable in-memory domain state (data) so the UI can be real and navigable.
   * 2) A tiny router state (route → parsed route object) so pages can be linked and testable.
   * 3) A single long-lived “engine” instance that owns mutations (createCase, setGate, generateReceipt, etc.)
   *
   * The goal is not sophistication—it’s coherence:
   * everything is reachable, nothing lies, and mutations go through one canonical path.
   */

  /**
   * SEED DATA (why useMemo here):
   * makeSeedData() creates a full working demo dataset: sites, rooms, cases, runs, receipts, etc.
   *
   * useMemo(..., []) ensures we generate it exactly once per component mount.
   * Without this, React re-renders would regenerate IDs/timestamps/noise fields and the UI would “teleport.”
   */
  const seed = useMemo(() => makeSeedData(), []);

  /**
   * APP STATE (data is the source of truth):
   * data is the entire in-memory domain model for the POC.
   * setData is the single state mutation hook the engine will use to update data immutably.
   */
  const [data, setData] = useState(seed);

  /**
   * AUTH STATE:
   * Slice 0 uses a simple auth flag to gate the shell.
   * It's not security—it’s a routing/UX scaffold so login/invite routes are real.
   */
  const [auth, setAuth] = useState(null);

  /**
   * ROUTING STATE (a minimal state-router):
   * route is a string path (e.g. "/cases/case-001/define").
   * parseRoute(route) translates it into a structured route object with:
   * - r.page: which “screen” to render
   * - r.params: route params like siteId, roomId, caseId, etc.
   *
   * useMemo keeps parseRoute from running unnecessarily, and makes r stable for dependency arrays.
   */
  const [route, setRoute] = useState("/overview");
  const r = useMemo(() => parseRoute(route), [route]);

  /**
   * SELECTION HELPERS (derived state, not stored state):
   * We compute commonly-used objects from {data + route params}.
   * This keeps the source of truth in one place (data) and avoids duplicated state.
   *
   * useMemo prevents repeated linear scans on every render and keeps referential stability.
   */
  const site = useMemo(
    () => data.sites.find((s) => s.id === r.params.siteId),
    [data, r]
  );

  const room = useMemo(
    () => site?.rooms?.find((x) => x.id === r.params.roomId),
    [site, r]
  );

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

  /**
   * DATA REF (why this exists):
   * The engine should be long-lived (created once), but it still needs access to the latest `data`.
   *
   * If we closed over `data` directly when creating the engine, the engine would “see” stale data forever.
   * So we keep a ref updated on every render:
   * - engine calls getData() -> dataRef.current -> always the latest state.
   *
   * This is the “no-stale-closure” bridge between React state updates and a stable engine instance.
   */
  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  /**
   * ENGINE (single instance, canonical mutation path):
   * We intentionally create the engine exactly once and keep it stable across renders.
   * It receives:
   * - getData(): reads latest state (via ref)
   * - setData(): performs immutable updates
   * - Clock/IdGen/Telemetry: infrastructure dependencies (can be real or nulled in tests)
   *
   * This keeps “application logic” out of UI components:
   * pages request mutations (engine.setGate, engine.createCase, etc.)
   * and then render state-based results.
   *
   * NOTE: The if (!engineRef.current) pattern ensures no re-instantiation during renders.
   */
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

  /**
   * COMPARE HELPERS (runs/compare page):
   * The compare screen uses query params (?left=...&right=...) which parseRoute stores in r.params.
   * We derive the “left” and “right” run objects from IDs.
   */
  const compareLeft = useMemo(
    () => data.runs.find((run) => run.id === r.params?.left),
    [data.runs, r.params?.left]
  );

  const compareRight = useMemo(
    () => data.runs.find((run) => run.id === r.params?.right),
    [data.runs, r.params?.right]
  );

  /**
   * LAYOUT LOOKUP (room layout route):
   * Layout is keyed by (siteId, roomId).
   * We compute it only when both params are present.
   * This enables “walk-to-this-spot” rendering and keeps layout optional.
   */
  const currentLayout = useMemo(() => {
    const siteId = r.params?.siteId;
    const roomId = r.params?.roomId;
    if (!siteId || !roomId) return null;
    return data.layouts?.find((l) => l.siteId === siteId && l.roomId === roomId) || null;
  }, [data.layouts, r.params?.siteId, r.params?.roomId]);

  /**
   * REPORT LOOKUP (reports/:id routes):
   * Reports are stored as domain objects (draft/frozen).
   * This makes “readout” a durable artifact instead of a screenshot.
   */
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
