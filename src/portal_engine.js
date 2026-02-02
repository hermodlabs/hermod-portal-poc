// portal_engine.js
import { Clock, IdGen, Telemetry } from "./infra.js";

// ---- your existing pure logic helpers should be imported or pasted ----
// These are referenced by name below; keep your current implementations.
import {
  computeAbstain,
  comparabilityChecklist,
  compareSummary,
  verdictFrom,
  parseWindowToMin,
} from "./portal_logic.js"; // or keep them in same file if you prefer

export function createPortalEngine({
  // React adapter: pass getData + setData
  getData,
  setData,

  // Nullables
  clock = Clock.create(),
  idGen = IdGen.create(),
  telemetry = Telemetry.create(),
} = {}) {
  if (!getData || !setData) {
    throw new Error("createPortalEngine requires getData() and setData(updater)");
  }

  // small helper
  const update = (fn) => setData((d) => fn(d));

  // ---- public API ----
  return {
    clock,
    idGen,
    telemetry,

    // Output tracking hook
    trackEvents() {
      return telemetry.track();
    },

    // ---------- CASES ----------
    /*
    createCase({ title, siteId, roomId, owner = "Operator" }) {
      const id = idGen.next("case");
      update((d) => {
        const c = {
          id,
          title: title?.trim() || "New case",
          status: "defining",
          createdAt: clock.labelToday(),
          owner,
          siteId,
          roomId,
          definition: { Z: "", tau: "", W: "", S: "", sliceSentence: "" },
          baselineRunId: null,
          evidenceRunId: null,
          verificationRunId: null,
          verdict: null,
          readoutReportId: null,
        };
        return { ...d, cases: [c, ...(d.cases || [])] };
      });
      telemetry.emit({ type: "case_created", caseId: id });
      return id;
    },
    */
    

    defineCase(caseId, { Z, tau, W, S }) {
      const Zt = (Z || "").trim();
      const taut = (tau || "").trim();
      const Wt = (W || "").trim();
      const St = (S || "").trim();
      const sliceSentence = `We are talking about zone ${Zt} in window ${Wt} after trigger ${taut} at stage ${St}.`;

      update((d) => ({
        ...d,
        cases: (d.cases || []).map((c) =>
          c.id === caseId
            ? { ...c, status: "defined", definition: { Z: Zt, tau: taut, W: Wt, S: St, sliceSentence } }
            : c
        ),
      }));
      telemetry.emit({ type: "case_defined", caseId });
    },

    setBaseline(caseId, runId) {
      update((d) => ({
        ...d,
        cases: (d.cases || []).map((c) => {
          if (c.id !== caseId) return c;
          const windowMin = parseWindowToMin(c.definition?.W) || 15;
          const tau = c.definition?.tau || "Door cycle";
          return {
            ...c,
            baselineRunId: runId,
            triggerBinding: c.triggerBinding || { tau, windowMin, anchorPolicy: "event-linked" },
          };
        }),
      }));
      telemetry.emit({ type: "baseline_set", caseId, runId });
    },

    setVerification(caseId, runId) {
      update((d) => ({
        ...d,
        cases: (d.cases || []).map((c) => (c.id === caseId ? { ...c, verificationRunId: runId } : c)),
      }));
      telemetry.emit({ type: "verification_set", caseId, runId });
    },

    // ---------- RUNS ----------
    createRun({ label, siteId, roomId, caseId = null, owner = "Operator" }) {
      const id = idGen.next("run");
      const run = {
        id,
        label: label?.trim() || "Run",
        createdAt: clock.labelNow(),
        owner,
        siteId,
        roomId,
        caseId,
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
        timeline: [],
      };

      update((d) => {
        const next = { ...d, runs: [run, ...(d.runs || [])] };
        if (caseId) {
          next.cases = (d.cases || []).map((c) => (c.id === caseId ? { ...c, evidenceRunId: id } : c));
        }
        return next;
      });

      telemetry.emit({ type: "run_created", runId: id, caseId });
      return id;
    },

    setGate(runId, key, value) {
      update((d) => ({
        ...d,
        runs: (d.runs || []).map((r) =>
          r.id === runId ? { ...r, gates: { ...(r.gates || {}), [key]: value } } : r
        ),
      }));
      telemetry.emit({ type: "run_gate_set", runId, key, value });
    },

    attachFiles(runId, { timeRange = "Last 24h", hash = "sha256:null..." } = {}) {
      update((d) => ({
        ...d,
        runs: (d.runs || []).map((r) =>
          r.id === runId
            ? {
                ...r,
                inputs: { ...r.inputs, filesAttached: true, timeRange, hash },
              }
            : r
        ),
      }));
      telemetry.emit({ type: "run_files_attached", runId });
    },

    // ---------- RECEIPTS ----------
    generateReceipt(runId) {
      const d0 = getData();
      const run = (d0.runs || []).find((r) => r.id === runId);
      if (!run) throw new Error(`generateReceipt: run not found: ${runId}`);

      const abst = computeAbstain(run);
      const id = idGen.next("rcpt");

      const bullets = [
        run.inputs?.filesAttached ? "Inputs attached and hashed" : "Inputs missing (still recorded)",
        `Provenance recorded: sensor set=${run.inputs?.sensorSet}, firmware=${run.inputs?.firmware}`,
        `Validity gates evaluated`,
        ...(abst.abstain ? [`ABSTAIN asserted: ${abst.reasons.join(" · ")}`] : ["Interpretation allowed: critical gates PASS"]),
      ];

      const receipt = {
        id,
        runId,
        caseId: run.caseId || null,
        title: `Receipt bundle · ${abst.abstain ? "ABSTAIN" : "OK to interpret"}`,
        when: clock.labelNow(),
        frozen: true,
        bullets,
      };

      update((d) => ({ ...d, receipts: [receipt, ...(d.receipts || [])] }));

      telemetry.emit({
        type: "receipt_generated",
        receiptId: id,
        runId,
        abstain: abst.abstain,
        reasons: abst.reasons,
      });

      return id;
    },

    // ---------- VERDICT ----------
    computeCaseVerdict(caseId) {
      const d = getData();
      const c = (d.cases || []).find((x) => x.id === caseId);
      if (!c) throw new Error(`computeCaseVerdict: case not found: ${caseId}`);

      const baselineRun = (d.runs || []).find((r) => r.id === c.baselineRunId) || null;
      const verificationRun = (d.runs || []).find((r) => r.id === c.verificationRunId) || null;

      const checklist = comparabilityChecklist(c, baselineRun, verificationRun);
      const compareOk = checklist.every((x) => x.pass);

      if (!baselineRun || !verificationRun) {
        return { status: "ABSTAIN", label: "ABSTAIN", reasons: ["Missing baseline or verification run."] };
      }

      const summary = compareSummary(d, baselineRun, verificationRun);
      return verdictFrom(compareOk, summary);
    },

    setCaseVerdict(caseId) {
      const v = this.computeCaseVerdict(caseId);
      update((d) => ({
        ...d,
        cases: (d.cases || []).map((c) => (c.id === caseId ? { ...c, verdict: { ...v, when: clock.labelNow() } } : c)),
      }));
      telemetry.emit({ type: "case_verdict_set", caseId, verdict: v });
      return v;
    },

    // inside createPortalEngine({ getData, setData, clock, idGen, telemetry })

createCase({ title, siteId, roomId, owner = "Operator" }) {
  if (!title?.trim()) throw new Error("createCase: title required");
  if (!siteId) throw new Error("createCase: siteId required");
  if (!roomId) throw new Error("createCase: roomId required");

  // Generate a deterministic id if idGen is Nullable in tests
  const id = idGen?.next ? idGen.next("case") : `case-${Math.floor(100 + Math.random() * 900)}`;

  const createdAt =
    clock?.labelToday ? clock.labelToday() : "Today";

  const c = {
    id,
    title: title.trim(),
    status: "defining",
    createdAt,
    owner,
    siteId,
    roomId,

    // Slice 1 contract object fields
    definition: { Z: "", tau: "", W: "", S: "", sliceSentence: "" },

    // downstream links (later slices attach here)
    baselineRunId: null,
    evidenceRunId: null,
    verificationRunId: null,
    verdict: null,
    readoutReportId: null,
  };

  setData((d) => ({
    ...d,
    cases: [c, ...(d.cases || [])],
  }));

  // Optional: emit for Output Tracking in tests / telemetry
  if (telemetry?.emit) {
    telemetry.emit({ type: "case_created", caseId: id, siteId, roomId, owner });
  }

  return id;
},

  };
}
