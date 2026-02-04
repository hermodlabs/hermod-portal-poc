// src/page/cases/CaseVerifyPage.jsx
import React from "react";

import { Header, Panel, Chip } from "../../component";

import {
  cx,
  computeAbstain,
  comparabilityChecklist,
  gateTone,
  gateLabel,
} from "../../algorithms";

import {
  ArrowLeft,
  GitCompare,
  ChevronRight,
  Ban,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

function RunBadge({ run }) {
  if (!run) return <Chip tone="bad">missing</Chip>;
  const abst = computeAbstain(run);
  return (
    <Chip tone={abst.abstain ? "bad" : "ok"}>
      {abst.abstain ? <Ban size={14} /> : <CheckCircle2 size={14} />}{" "}
      {abst.abstain ? "ABSTAIN" : "OK"}
    </Chip>
  );
}

function ChecklistRow({ item }) {
  return (
    <div className="gateRow">
      <div>
        <div style={{ fontWeight: 750 }}>{item.label}</div>
        {!item.pass && <div className="kicker" style={{ marginTop: 4 }}>{item.whyFail}</div>}
      </div>
      <Chip tone={item.pass ? "ok" : "bad"}>
        {item.pass ? <CheckCircle2 size={14} /> : <Ban size={14} />}{" "}
        {item.pass ? "Pass" : "Fail"}
      </Chip>
    </div>
  );
}

export function CaseVerifyPage({ data, setData, onGo, theCase }) {
  if (!theCase) {
    return (
      <Panel meta="Error" title="Case not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">Need a case object to select a verification run.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/cases")}>Back</button>
      </Panel>
    );
  }

  const baselineRun =
    (theCase.baselineRunId && data.runs.find((r) => r.id === theCase.baselineRunId)) || null;

  // Candidate verification runs: same site + room as the case
  const candidates = data.runs
    .filter((r) => r.siteId === theCase.siteId && r.roomId === theCase.roomId)
    .slice()
    .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));

  const verificationRun =
    (theCase.verificationRunId && data.runs.find((r) => r.id === theCase.verificationRunId)) || null;

  const checklist = comparabilityChecklist(theCase, baselineRun, verificationRun);
  const compareOk = checklist.every((x) => x.pass);

  function setVerification(runId) {
    setData((d) => ({
      ...d,
      cases: d.cases.map((c) => (c.id === theCase.id ? { ...c, verificationRunId: runId } : c)),
    }));
  }

  const canCompare = Boolean(baselineRun && verificationRun);
  const compareUrl = canCompare
    ? `/runs/compare?left=${baselineRun.id}&right=${verificationRun.id}`
    : "";

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/cases/${theCase.id}/verify`}
        title="Verify (select verification run)"
        subtitle="Slice 5: verification is a second run measured on the same ruler. If it isn't comparable, the system must ABSTAIN."
        right={
          <div className="row" style={{ flexWrap: "wrap" }}>
            <Chip tone="accent">
              <GitCompare size={14} /> verify
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
        <Panel meta="Pick" title="Verification run candidates" right={<Chip>{candidates.length}</Chip>}>
          {candidates.length === 0 ? (
            <div className="text">No runs exist for this room yet. Create one in /runs/new.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {candidates.map((r) => {
                const isOn = theCase.verificationRunId === r.id;
                const abst = computeAbstain(r);
                return (
                  <button
                    key={r.id}
                    className={cx("taskRow", isOn && "taskRow--active")}
                    onClick={() => setVerification(r.id)}
                    title={abst.abstain ? `ABSTAIN: ${abst.reasons.join("; ")}` : "OK"}
                  >
                    <div className="row" style={{ gap: 10 }}>
                      <div className="taskIcon">
                        <GitCompare size={16} />
                      </div>
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontWeight: 750 }}>{r.label}</div>
                        <div className="kicker" style={{ marginTop: 4 }}>
                          {r.id} · {r.createdAt} · sensor set: {r.inputs?.sensorSet || "—"}
                        </div>
                      </div>
                    </div>

                    <div className="row" style={{ gap: 10 }}>
                      <Chip tone={abst.abstain ? "bad" : "ok"}>
                        {abst.abstain ? <Ban size={14} /> : <CheckCircle2 size={14} />}{" "}
                        {abst.abstain ? "ABSTAIN" : "OK"}
                      </Chip>
                      <Chip tone={isOn ? "ok" : "neutral"}>{isOn ? "Selected" : "Select"}</Chip>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="hr" />

          <div className="row" style={{ flexWrap: "wrap" }}>
            <button className="btn" onClick={() => onGo("/runs/new")}>
              Create run
            </button>
            {verificationRun && (
              <button className="btn" onClick={() => onGo(`/runs/${verificationRun.id}/provenance`)}>
                Open selected run
              </button>
            )}
          </div>
        </Panel>

        <Panel
          meta="Precheck"
          title="Comparability (must PASS to claim repeatability)"
          right={
            canCompare ? (
              <Chip tone={compareOk ? "ok" : "bad"}>{compareOk ? "PASS" : "FAIL"}</Chip>
            ) : (
              <Chip tone="warn">incomplete</Chip>
            )
          }
        >
          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Baseline</div>
            <div className="row" style={{ justifyContent: "space-between", marginTop: 10 }}>
              <div className="text" style={{ margin: 0 }}>
                {baselineRun ? (
                  <>
                    <b>{baselineRun.label}</b> · {baselineRun.id}
                  </>
                ) : (
                  "— (no baseline selected)"
                )}
              </div>
              <RunBadge run={baselineRun} />
            </div>

            <div className="hr" />

            <div className="kicker">Verification</div>
            <div className="row" style={{ justifyContent: "space-between", marginTop: 10 }}>
              <div className="text" style={{ margin: 0 }}>
                {verificationRun ? (
                  <>
                    <b>{verificationRun.label}</b> · {verificationRun.id}
                  </>
                ) : (
                  "— (select a run)"
                )}
              </div>
              <RunBadge run={verificationRun} />
            </div>
          </div>

          <div className="hr" />

          {!baselineRun ? (
            <div className="box" style={{ padding: 14 }}>
              <div className="kicker">Missing baseline</div>
              <div className="text" style={{ marginTop: 8 }}>
                Verification is meaningless without a baseline run claimed by the Case.
              </div>
              <div className="hr" />
              <button className="btn btn--primary" onClick={() => onGo(`/cases/${theCase.id}/baseline`)}>
                <span className="row" style={{ gap: 8 }}>
                  <ChevronRight size={14} /> Select baseline
                </span>
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {checklist.map((item) => (
                <ChecklistRow key={item.key} item={item} />
              ))}
            </div>
          )}

          <div className="hr" />

          <div className="row" style={{ flexWrap: "wrap" }}>
            <button
              className="btn"
              disabled={!canCompare}
              onClick={() => onGo(compareUrl)}
              title={!canCompare ? "Select baseline + verification first" : "Open evidence compare"}
            >
              <span className="row" style={{ gap: 8 }}>
                <GitCompare size={14} /> Open compare
              </span>
            </button>

            <button
              className="btn btn--primary"
              disabled={!canCompare}
              onClick={() => onGo(`/cases/${theCase.id}/verdict`)}
              title={!canCompare ? "Select baseline + verification first" : "Proceed to verdict"}
            >
              <span className="row" style={{ gap: 8 }}>
                <ChevronRight size={14} /> Go to verdict
              </span>
            </button>

            {!canCompare && (
              <Chip tone="warn">
                <HelpCircle size={14} /> needs baseline + verification
              </Chip>
            )}
          </div>

          <div className="hr" />

          <div className="text">
            Rule: a verification run can be “green” and still be non-comparable. If comparability fails, the verdict must ABSTAIN.
          </div>
        </Panel>
      </div>
    </div>
  );
}

export default CaseVerifyPage;
