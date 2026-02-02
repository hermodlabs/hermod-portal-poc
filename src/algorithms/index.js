import {
  CheckCircle2,
  HelpCircle,
  ShieldX,
} from "lucide-react";

export const CRITICAL_GATES = ["sensorTrust", "coverage", "timeAlignment"];

export function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}

export function riskColor(v) {
  // 0..1 → cool to warm (still within your vibe)
  const hue = 210 - v * 165; // 210 (blue) → ~45 (amber)
  const sat = 75;
  const light = 26 + v * 18;
  return `hsl(${hue} ${sat}% ${light}%)`;
}

export function scorePocket(p) {
  // simple rank score; tweak later
  return (p.severity || 0) * 0.55 + (p.repeatability || 0) * 0.30 + clamp01((p.persistenceMin || 0) / 60) * 0.15;
}

export function parseWindowToMin(W) {
  if (!W) return null;
  const s = String(W).trim().toLowerCase();
  if (s.endsWith("m")) return parseInt(s, 10);
  if (s.endsWith("h")) return parseInt(s, 10) * 60;
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
}

export function clampInt(x, a, b) {
  const n = parseInt(x, 10);
  if (!Number.isFinite(n)) return a;
  return Math.max(a, Math.min(b, n));
}

export function comparabilityChecklist(caseObj, baselineRun, verificationRun) {
  // Simple, honest, POC rules. Later you’ll formalize.
  const out = [
    {
      key: "sameRoom",
      label: "Same room",
      pass: baselineRun?.roomId && verificationRun?.roomId && baselineRun.roomId === verificationRun.roomId,
      whyFail: "Runs are not for the same room.",
    },
    {
      key: "sameSensorSet",
      label: "Same sensor set",
      pass:
        baselineRun?.inputs?.sensorSet &&
        verificationRun?.inputs?.sensorSet &&
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

  return out;
}

export function compareSummary(data, baselineRun, verificationRun) {
  // POC: use pockets as a stand-in for “field outcome”
  // Metric: top pocket severity shift (baseline -> verification)
  const baseP = (data.runPockets || []).filter((p) => p.runId === baselineRun?.id);
  const verP = (data.runPockets || []).filter((p) => p.runId === verificationRun?.id);

  const baseTop = baseP.slice().sort((a,b)=>scorePocket(b)-scorePocket(a))[0];
  const verTop = verP.slice().sort((a,b)=>scorePocket(b)-scorePocket(a))[0];

  const baseSev = baseTop?.severity ?? null;
  const verSev = verTop?.severity ?? null;

  const delta = baseSev != null && verSev != null ? verSev - baseSev : null;

  return {
    baseTop,
    verTop,
    baseSev,
    verSev,
    delta,
  };
}

export function verdictFrom(compareOk, summary) {
  // POC rule:
  // - if compareOk false → ABSTAIN
  // - else if delta <= -0.10 (improved) OR verSev <= 0.6 → “Repeatable once (CONFIDENT)”
  // - else ABSTAIN with reason
  if (!compareOk) {
    return { status: "ABSTAIN", label: "ABSTAIN", reasons: ["Comparability failed — cannot claim repeatability."] };
  }

  if (summary.verSev == null) {
    return { status: "ABSTAIN", label: "ABSTAIN", reasons: ["No comparable pocket metric available."] };
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

// -----------------------------
// fake data (Slice 0 needs real objects, even if analysis is empty)
// -----------------------------

export function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}


export function makeId(prefix = "case") {
  return `${prefix}-${Math.floor(100 + Math.random() * 900)}`;
}

export function caseStatusTone(s) {
  if (s === "defined") return "ok";
  return "warn";
}

export  function caseStatusLabel(s) {
  if (s === "defined") return "Defined";
  return "Defining";
}

export function gateTone(v) {
  if (v === "pass") return "ok";
  if (v === "fail") return "bad";
  return "warn";
}

export function gateIcon(v) {
  if (v === "pass") return CheckCircle2;
  if (v === "fail") return ShieldX;
  return HelpCircle;
}

export function gateLabel(v) {
  if (v === "pass") return "Pass";
  if (v === "fail") return "Fail";
  return "Unknown";
}



export function prettyGateName(k) {
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

export function computeAbstain(run) {
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

export function getSiteRoomLabel(data, siteId, roomId) {
  const s = data.sites.find((x) => x.id === siteId);
  const r = s?.rooms?.find((x) => x.id === roomId);
  return { siteName: s?.name || "—", roomName: r?.name || "—" };
}