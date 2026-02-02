// __tests__/portal_engine.sociable.test.js
import { createPortalEngine } from "../src/portal_engine.js";
import { Clock, IdGen, Telemetry } from "../src/infra.js";

// -----------------------------
// Signature Shielding (test harness)
// -----------------------------
function createHarness({
  data = makeBaseData(),
  now = "2026-02-01T12:00:00.000Z",
  ids = [
    "case-101", // createCase()
    "rcpt-201", // generateReceipt()
  ],
} = {}) {
  // Node < 17 may not have structuredClone
  const clone = (obj) =>
    typeof structuredClone === "function"
      ? structuredClone(obj)
      : JSON.parse(JSON.stringify(obj));

  // Test-controlled "state store" that mimics React setState semantics.
  let state = clone(data);

  const getData = () => state;
  const setData = (next) => {
    state = typeof next === "function" ? next(state) : next;
  };

  // Nullables (production code with "off" switch)
  const clock = Clock.createNull ? Clock.createNull({ now }) : Clock.create();
  const idGen = IdGen.createNull ? IdGen.createNull({ ids }) : IdGen.create();
  const telemetry = Telemetry.createNull ? Telemetry.createNull() : Telemetry.create();

  // Output Tracking (if supported)
  const events = telemetry.trackEvents ? telemetry.trackEvents() : null;

  const engine = createPortalEngine({
    getData,
    setData,
    clock,
    idGen,
    telemetry,
  });

  return {
    engine,
    getData,
    setData,
    events,
    data: () => state, // snapshot current state
  };
}

// -----------------------------
// Minimal sociable fixtures
// -----------------------------
function makeBaseData() {
  return {
    sites: [{ id: "site-001", name: "Demo Site", rooms: [{ id: "room-001", name: "Room 1" }] }],
    users: [],
    roles: [],
    cases: [],
    runs: [
      {
        id: "run-001",
        label: "Baseline",
        siteId: "site-001",
        roomId: "room-001",
        inputs: { sensorSet: "Rig A", filesAttached: true },
        gates: {
          sensorTrust: "unknown",
          coverage: "pass",
          timeAlignment: "pass",
          calibration: "pass",
          placementSanity: "pass",
          driftFlag: "pass",
        },
      },
      {
        id: "run-002",
        label: "Verification",
        siteId: "site-001",
        roomId: "room-001",
        inputs: { sensorSet: "Rig A", filesAttached: true },
        gates: {
          sensorTrust: "pass",
          coverage: "pass",
          timeAlignment: "pass",
          calibration: "pass",
          placementSanity: "pass",
          driftFlag: "pass",
        },
      },
    ],
    receipts: [],
    reports: [],
    layouts: [],
    runPockets: [
      // baseline top pocket: severity 0.85
      { id: "p-001", runId: "run-001", severity: 0.85, repeatability: 0.7, persistenceMin: 30, label: "P-01", title: "Baseline pocket" },
      // verification top pocket: severity 0.60 (improved)
      { id: "p-002", runId: "run-002", severity: 0.60, repeatability: 0.7, persistenceMin: 30, label: "P-01", title: "Verification pocket" },
    ],
    runMaps: [],
  };
}

// -----------------------------
// Sociable tests (engine + portal_logic together)
// -----------------------------
describe("Portal engine (sociable)", () => {
  it("creates a Case with stable contract fields (no UI)", () => {
    const h = harness();

    const caseId = h.engine.createCase({
      title: "Humidity pocket behind rack",
      siteId: "site-001",
      roomId: "room-001",
      owner: "Bobby",
    });

    // State-based assertions (not interactions)

    // 1) ID should be well-formed and should match the stored object.
    expect(caseId).toMatch(/^case-\d+$/);

    const created = h.data().cases.find((c) => c.id === caseId);
    expect(created).toBeTruthy();
    expect(created.id).toBe(caseId);

    // 2) Contract fields we care about (don't lock in implementation details)
    expect(created).toEqual(
      expect.objectContaining({
        title: "Humidity pocket behind rack",
        siteId: "site-001",
        roomId: "room-001",
        owner: "Bobby",
        status: "defining",
      })
    );

    // 3) Expected defaults that define the *contract object shape*
    //    (these are safe to check because they're part of the Case's public state)
    expect(created.definition).toEqual(
      expect.objectContaining({
        Z: "",
        tau: "",
        W: "",
        S: "",
        sliceSentence: "",
      })
    );

    // 4) Downstream links should start empty
    expect(created.baselineRunId).toBeNull();
    expect(created.evidenceRunId).toBeNull();
    expect(created.verificationRunId).toBeNull();
    expect(created.verdict).toBeNull();
    expect(created.readoutReportId).toBeNull();
  });

  // --- helpers (Signature Shielding / Parameterless Instantiation style) ---
  function harness({ initialData, idSequence } = {}) {
    const dataRef = {
      current:
        initialData ??
        {
          sites: [],
          rooms: [],
          users: [],
          roles: [],
          cases: [],
          runs: [],
          receipts: [],
          reports: [],
          layouts: [],
          runPockets: [],
          runMaps: [],
        },
    };

    const getData = () => dataRef.current;
    const setData = (updater) => {
      dataRef.current = typeof updater === "function" ? updater(dataRef.current) : updater;
    };

    const telemetry = Telemetry.createNull?.() ?? Telemetry.create();
    const clock = Clock.createNull?.({ now: "Today" }) ?? Clock.create();
    const idGen =
      IdGen.createNull?.({ sequence: idSequence ?? [101, 190, 777] }) ??
      IdGen.create(); // fallback if your IdGen doesn't support Nullables yet

    const engine = createPortalEngine({ getData, setData, clock, idGen, telemetry });

    return {
      engine,
      data: () => dataRef.current,
    };
  }

  test("sets a validity gate on a Run and the state reflects it", () => {
    const h = createHarness();
    const before = h.data().runs.find((r) => r.id === "run-001");
    expect(before.gates.sensorTrust).toBe("unknown");

    h.engine.setGate("run-001", "sensorTrust", "pass");

    const after = h.data().runs.find((r) => r.id === "run-001");
    expect(after.gates.sensorTrust).toBe("pass");

    // Optional: paranoia telemetry (Output Tracking)
    if (h.events) {
      expect(h.events.data.length).toBeGreaterThan(0);
    }
  });

  test("generates a receipt that freezes ABSTAIN when critical gate is UNKNOWN", () => {
    const h = createHarness({ ids: ["rcpt-201"] });

    // run-001 has sensorTrust UNKNOWN, so ABSTAIN should be frozen into receipt bullets
    h.engine.generateReceipt("run-001");

    const receipts = h.data().receipts;
    expect(receipts.length).toBe(1);

    const rcpt = receipts[0];
    expect(rcpt).toEqual(
      expect.objectContaining({
        runId: "run-001",
        frozen: true,
      })
    );

    // State-based assertion: should contain ABSTAIN bullet(s)
    const bullets = rcpt.bullets || [];
    expect(bullets.join(" ")).toMatch(/ABSTAIN/i);
    expect(bullets.join(" ")).toMatch(/SENSOR TRUST/i);
  });

  test("sets verdict to ABSTAIN when comparability fails", () => {
    const h = createHarness({ ids: ["case-101"] });

    const caseId = h.engine.createCase({
      title: "Comparability should fail",
      siteId: "site-001",
      roomId: "room-001",
      owner: "Bobby",
    });

    // Patch the case to reference runs (narrow test: focus on verdict rules, not UI selection)
    h.setData((d) => ({
      ...d,
      cases: d.cases.map((c) =>
        c.id !== caseId
          ? c
          : {
              ...c,
              baselineRunId: "run-001",
              verificationRunId: "run-002",
              triggerBinding: { tau: "Door cycle", windowMin: 15, anchorPolicy: "event-linked" },
            }
      ),
      // Force comparability failure: verification run in different room
      runs: d.runs.map((r) => (r.id === "run-002" ? { ...r, roomId: "room-999" } : r)),
    }));

    h.engine.setCaseVerdict(caseId);

    const updated = h.data().cases.find((c) => c.id === caseId);
    expect(updated.verdict).toBeTruthy();
    expect(updated.verdict.status).toBe("ABSTAIN");
    expect((updated.verdict.reasons || []).join(" ")).toMatch(/Comparability failed/i);
  });

  test("sets verdict to CONFIDENT when comparability passes and pocket severity improves", () => {
    const h = createHarness({ ids: ["case-101"] });

    const caseId = h.engine.createCase({
      title: "Should become CONFIDENT",
      siteId: "site-001",
      roomId: "room-001",
      owner: "Bobby",
    });

    // Ensure case has baseline + verification and a τ/W binding
    h.setData((d) => ({
      ...d,
      cases: d.cases.map((c) =>
        c.id !== caseId
          ? c
          : {
              ...c,
              baselineRunId: "run-001",
              verificationRunId: "run-002",
              triggerBinding: { tau: "Door cycle", windowMin: 15, anchorPolicy: "event-linked" },
            }
      ),
      // Ensure baseline run is not ABSTAIN (critical gate PASS)
      runs: d.runs.map((r) =>
        r.id === "run-001" ? { ...r, gates: { ...r.gates, sensorTrust: "pass" } } : r
      ),
    }));

    h.engine.setCaseVerdict(caseId);

    const updated = h.data().cases.find((c) => c.id === caseId);
    expect(updated.verdict).toBeTruthy();
    expect(updated.verdict.status).toBe("CONFIDENT");
    expect(updated.verdict.label).toMatch(/Repeatable once/i);
  });
});
