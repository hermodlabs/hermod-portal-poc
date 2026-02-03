import React from "react";

import {
  Header,
  Panel,
  Chip,
  AbstainBanner
} from "../../component";

import {
  comparabilityChecklist,
  compareSummary,
  verdictFrom,
} from "../../algorithms";

import {
  BadgeCheck,
  GitCompare, 
  Gavel, 
  XCircle, 
} from "lucide-react";

export function CaseVerdictPage({ data, setData, onGo, theCase, engine }) {
  if (!theCase) {
    return (
      <Panel meta="Error" title="Case not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">Need a case to verdict.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/cases")}>Back</button>
      </Panel>
    );
  }

  const baselineRun = data.runs.find((r) => r.id === theCase.baselineRunId) || null;
  const verificationRun = data.runs.find((r) => r.id === theCase.verificationRunId) || null;

  const checklist = comparabilityChecklist(theCase, baselineRun, verificationRun);
  const compareOk = checklist.every((x) => x.pass);

  const summary =
    baselineRun && verificationRun ? compareSummary(data, baselineRun, verificationRun) : null;

  const computed = summary
    ? verdictFrom(compareOk, summary)
    : { status: "ABSTAIN", label: "ABSTAIN", reasons: ["Missing baseline or verification run."] };

  const locked = theCase.verdict;

  function setVerdict() {
    if (!engine) return;

    // ✅ canonical mutation path
    // engine should stamp time + emit telemetry; it can also recompute internally
    engine.setCaseVerdict(theCase.id);

    // If you haven't implemented engine.setCaseVerdict yet, temporary fallback:
    // setData((d) => ({
    //   ...d,
    //   cases: d.cases.map((c) =>
    //     c.id === theCase.id ? { ...c, verdict: { ...computed, when: "Now" } } : c
    //   ),
    // }));
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/cases/${theCase.id}/verdict`}
        title="Verdict"
        subtitle="Slice 5: verdict is non-arguable. Either “Repeatable once (CONFIDENT)” or ABSTAIN with reasons."
        right={
          <Chip tone={computed.status === "CONFIDENT" ? "ok" : "bad"}>
            <Gavel size={14} /> {computed.status === "CONFIDENT" ? "CONFIDENT" : "ABSTAIN"}
          </Chip>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.2fr 0.8fr" }}>
        <Panel meta="Inputs" title="What the verdict is allowed to use" right={<Chip tone="accent">Slice 5</Chip>}>
          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Baseline</div>
            <div className="text" style={{ marginTop: 8 }}>
              {baselineRun ? baselineRun.label : "— (none)"}
            </div>
          </div>

          <div className="box" style={{ padding: 14, marginTop: 12 }}>
            <div className="kicker">Verification</div>
            <div className="text" style={{ marginTop: 8 }}>
              {verificationRun ? verificationRun.label : "— (none)"}
            </div>
          </div>

          <div className="hr" />

          <div className="row" style={{ flexWrap: "wrap" }}>
            <button className="btn" onClick={() => onGo(`/cases/${theCase.id}/verify`)}>
              <span className="row" style={{ gap: 8 }}>
                <GitCompare size={14} /> Back to verify
              </span>
            </button>

            {baselineRun && verificationRun && (
              <button
                className="btn"
                onClick={() => onGo(`/runs/compare?left=${baselineRun.id}&right=${verificationRun.id}`)}
              >
                <span className="row" style={{ gap: 8 }}>
                  <GitCompare size={14} /> Open compare
                </span>
              </button>
            )}
          </div>

          <div className="hr" />

          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Comparability</div>
            <div className="text" style={{ marginTop: 8 }}>
              {compareOk ? "PASS" : "FAIL"} — if fail, verdict must ABSTAIN (not warn).
            </div>
          </div>

          <div className="hr" />

          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Checklist</div>
            {!verificationRun ? (
              <div className="text" style={{ marginTop: 8 }}>
                Select a verification run to evaluate comparability.
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
                {checklist.map((c) => (
                  <div key={c.key} className="gateRow">
                    <div>
                      <div style={{ fontWeight: 750 }}>{c.label}</div>
                      {!c.pass && <div className="kicker" style={{ marginTop: 4 }}>{c.whyFail}</div>}
                    </div>
                    <Chip tone={c.pass ? "ok" : "bad"}>
                      {c.pass ? <BadgeCheck size={14} /> : <XCircle size={14} />} {c.pass ? "Pass" : "Fail"}
                    </Chip>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Panel>

        <Panel
          meta="Output"
          title="Verdict decision"
          right={<Chip tone={computed.status === "CONFIDENT" ? "ok" : "bad"}>{computed.label}</Chip>}
        >
          {computed.status === "CONFIDENT" ? (
            <div className="box" style={{ padding: 14, border: "1px solid rgba(34,197,94,0.20)" }}>
              <div className="kicker">Repeatable once (CONFIDENT)</div>
              <div className="text" style={{ marginTop: 8 }}>
                Verdict can only be set when comparability passes and evidence shows improvement on the comparable ruler.
              </div>
            </div>
          ) : (
            <AbstainBanner
              reasons={computed.reasons}
              body={
                <div className="text" style={{ marginTop: 8 }}>
                  This is not “being cautious.” It’s being clean: missing comparability or incomplete evidence blocks claims.
                </div>
              }
            />
          )}

          <div className="hr" />

          <div className="row" style={{ flexWrap: "wrap" }}>
            <button
              className="btn btn--primary"
              disabled={!engine || Boolean(locked?.status)}
              onClick={setVerdict}
              title={
                !engine
                  ? "Engine missing (pass engine as prop)"
                  : locked
                  ? "Verdict already set (POC lock). In production, this is versioned."
                  : "Set verdict"
              }
            >
              <span className="row" style={{ gap: 8 }}>
                <Gavel size={14} /> Set verdict
              </span>
            </button>
          </div>

          {locked && (
            <div className="box" style={{ padding: 14, marginTop: 12 }}>
              <div className="kicker">Current verdict (stored)</div>
              <div style={{ fontWeight: 800, marginTop: 8 }}>{locked.label}</div>
              <div className="kicker" style={{ marginTop: 6 }}>{locked.when}</div>
            </div>
          )}

          {!baselineRun || !verificationRun ? (
            <div className="box" style={{ padding: 14, marginTop: 12 }}>
              <div className="kicker">Missing inputs</div>
              <div className="text" style={{ marginTop: 8 }}>
                Select a baseline and a verification run before you can set a verdict.
              </div>
            </div>
          ) : null}
        </Panel>
      </div>
    </div>
  );
}

export default CaseVerdictPage;