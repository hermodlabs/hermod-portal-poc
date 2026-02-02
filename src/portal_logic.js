// portal_logic.js
// Pure, side-effect-free helpers used by the POC UI + engine.
//
// NOTE: Keep this file dependency-free. If you want different logic,
// version it here and keep UI dumb.

const CRITICAL_GATES = ["sensorTrust", "coverage", "timeAlignment"];

export function parseWindowToMin(W) {
  if (!W) return null;
  const s = String(W).trim().toLowerCase();
  if (s.endsWith("m")) {
    const n = parseInt(s, 10);
    return Number.isFinite(n) ? n : null;
  }
  if (s.endsWith("h")) {
    const n = parseInt(s, 10);
    return Number.isFinite(n) ? n * 60 : null;
  }
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
}

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
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

function gateLabel(v) {
  if (v === "pass") return "Pass";
  if (v === "fail") return "Fail";
  return "Unknown";
}

export function computeAbstain(run) {
  const gates = run?.gates || {};
  const reasons = [];

  // Critical gates: anything not PASS blocks interpretation
  for (const k of CRITICAL_GATES) {
    const v = gates[k] || "unknown";
    if (v !== "pass") {
      reasons.push(`${prettyGateName(k)} is ${gateLabel(v).toUpperCase()}`);
    }
  }

  // Any explicit FAIL anywhere is also a block
  for (const [k, v] of Object.entries(gates)) {
    if (v === "fail") {
      const msg = `${prettyGateName(k)} is FAIL`;
      if (!reasons.includes(msg)) reasons.push(msg);
    }
  }

  return { abstain: reasons.length > 0, reasons };
}

/**
 * Compare score for a pocket (higher = more important).
 * Keep this aligned with the UI sorting logic.
 */
export function scorePocket(p) {
  return (
    (p?.severity || 0) * 0.55 +
    (p?.repeatability || 0) * 0.30 +
    clamp01((p?.persistenceMin || 0) / 60) * 0.15
  );
}

export function comparabilityChecklist(caseObj, baselineRun, verificationRun) {
  // Simple, honest, POC rules. Later you’ll formalize.
  return [
    {
      key: "sameRoom",
      label: "Same room",
      pass:
        Boolean(baselineRun?.roomId) &&
        Boolean(verificationRun?.roomId) &&
        baselineRun.roomId === verificationRun.roomId,
      whyFail: "Runs are not for the same room.",
    },
    {
      key: "sameSensorSet",
      label: "Same sensor set",
      pass:
        Boolean(baselineRun?.inputs?.sensorSet) &&
        Boolean(verificationRun?.inputs?.sensorSet) &&
        baselineRun.inputs.sensorSet === verificationRun.inputs.sensorSet,
      whyFail: "Sensor set differs (not comparable).",
    },
    {
      key: "alignmentModeExists",
      label: "Alignment mode exists (event-linked τ/W)",
      pass: Boolean(caseObj?.triggerBinding?.tau && caseObj?.triggerBinding?.windowMin),
      whyFail: "Case has no τ/W binding (no ruler).",
    },
    {
      key: "baselineValid",
      label: "Baseline validity not ABSTAIN",
      pass: baselineRun ? !computeAbstain(baselineRun).abstain : false,
      whyFail: "Baseline run is ABSTAIN (cannot be a baseline).",
    },
    {
      key: "verificationValid",
      label: "Verification validity not ABSTAIN",
      pass: verificationRun ? !computeAbstain(verificationRun).abstain : false,
      whyFail: "Verification run is ABSTAIN (cannot verify).",
    },
  ];
}

export function compareSummary(data, baselineRun, verificationRun) {
  // POC: use pockets as a stand-in for “field outcome”
  // Metric: top pocket severity shift (baseline -> verification)
  const baseP = (data?.runPockets || []).filter((p) => p.runId === baselineRun?.id);
  const verP = (data?.runPockets || []).filter((p) => p.runId === verificationRun?.id);

  const baseTop = baseP.slice().sort((a, b) => scorePocket(b) - scorePocket(a))[0];
  const verTop = verP.slice().sort((a, b) => scorePocket(b) - scorePocket(a))[0];

  const baseSev = baseTop?.severity ?? null;
  const verSev = verTop?.severity ?? null;

  const delta = baseSev != null && verSev != null ? verSev - baseSev : null;

  return { baseTop, verTop, baseSev, verSev, delta };
}

export function verdictFrom(compareOk, summary) {
  // POC rule:
  // - if compareOk false → ABSTAIN
  // - else if delta <= -0.10 (improved) OR verSev <= 0.6 → “Repeatable once (CONFIDENT)”
  // - else ABSTAIN with reason
  if (!compareOk) {
    return {
      status: "ABSTAIN",
      label: "ABSTAIN",
      reasons: ["Comparability failed — cannot claim repeatability."],
    };
  }

  if (!summary || summary.verSev == null) {
    return {
      status: "ABSTAIN",
      label: "ABSTAIN",
      reasons: ["No comparable pocket metric available."],
    };
  }

  const improved = summary.delta != null && summary.delta <= -0.1;
  const acceptable = summary.verSev <= 0.6;

  if (improved || acceptable) {
    return {
      status: "CONFIDENT",
      label: "Repeatable once (CONFIDENT)",
      reasons: ["Comparability passed and verification shows improvement on comparable ruler."],
    };
  }

  return {
    status: "ABSTAIN",
    label: "ABSTAIN",
    reasons: ["Comparability passed but verification did not show improvement strong enough to claim repeatability."],
  };
}
