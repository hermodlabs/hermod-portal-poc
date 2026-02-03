// src/page/cases/CaseVerifyPage.jsx
import React, { useMemo } from "react";

import { Header, Panel, Chip, AbstainBanner } from "../../component";

import {
  cx,
  makeId,
  computeAbstain,
  comparabilityChecklist,
  getSiteRoomLabel,
} from "../../algorithms";

import {
  ArrowLeft,
  GitCompare,
  Database,
  FilePlus2,
  UploadCloud,
  CheckCircle2,
  Ban,
  XCircle,
  ChevronRight,
} from "lucide-react";

export function CaseVerifyPage({ data, setData, onGo, theCase }) {
  if (!theCase) {
    return (
      <Panel meta="Error" title="Case not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">Need a case object to select a verification run.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/cases")}>
          Back
        </button>
      </Panel>
    );
  }

  const baselineRun = useMemo(
    () => (data.runs || []).find((r) => r.id === theCase.baselineRunId) || null,
    [data.runs, theCase.baselineRunId]
  );

  const candidateRuns = useMemo(() => {
    const runs = data.runs || [];
    return runs
      .filter((r) => r.siteId === theCase.siteId && r.roomId === theCase.roomId)
      .slice()
      .sort((a, b) => String(a.createdAt || "").localeCompare(String(b.createdAt || "")));
  }, [data.runs, theCase.siteId, theCase.roomId]);

  const verificationRun = useMemo(
    () => (data.runs || []).find((r) => r.id === theCase.verificationRunId) || null,
    [data.runs, theCase.verificationRunId]
  );

  const { siteName, roomName } = getSiteRoomLabel(data, theCase.siteId, theCase.roomId);

  const checklist = useMemo(
    () => comparabilityChecklist(theCase, baselineRun, verificationRun),
    [theCase, baselineRun, verificationRun]
  );

  const compareOk = checklist.every((x) => x.pass);
  const verAbst = verificationRun ? computeAbstain(verificationRun) : { abstain: true, reasons: ["No verification run selected."] };

  function selectVerification(runId) {
    setData((d) => ({
      ...d,
      cases: (d.cases || []).map((c) => (c.id === theCase.id ? { ...c, verificationRunId: runId } : c)),
    }));
  }

  function createVerificationRun() {
    const id = makeId("run");
    const newRun = {
      id,
      label: `Verification run for ${theCase.id}`,
      createdAt: "Now",
      owner: theCase.owner || "Operator",
      siteId: theCase.siteId,
      roomId: theCase.roomId,
      caseId: theCase.id,
      inputs: {
        filesAttached: false,
        source: "Upload",
        sensorSet: baselineRun?.inputs?.sensorSet || "Rig A",
        firmware: baselineRun?.inputs?.firmware || "fw v1.0.0",
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
      timeline: baselineRun?.timeline ? [...baselineRun.timeline] : [],
    };

    setData((d) => ({
      ...d,
      runs: [newRun, ...(d.runs || [])],
      cases: (d.cases || []).map((c) => (c.id === theCase.id ? { ...c, verificationRunId: id } : c)),
    }));

    onGo(`/runs/${id}/provenance`);
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/cases/${theCase.id}/verify`}
        title="Select verification run"
        subtitle="Slice 5: pick the run you’ll use to verify the baseline. The verdict page will refuse to claim anything if comparability fails."
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
        <Panel meta="Context" title={theCase.title} right={<Chip>{siteName}</Chip>}>
          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Where</div>
            <div style={{ fontWeight: 750, marginTop: 8 }}>{roomName}</div>
            <div className="text" style={{ marginTop: 10 }}>
              {theCase.definition?.sliceSentence || "Case not defined yet."}
            </div>
          </div>

          <div className="hr" />

          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Baseline</div>
            <div className="text" style={{ marginTop: 8 }}>
              {baselineRun ? (
                <>
                  <b>{baselineRun.label}</b> · {baselineRun.id}
                </>
              ) : (
                "No baseline selected yet. Go to Baseline first."
              )}
            </div>
            <div className="row" style={{ flexWrap: "wrap", marginTop: 12 }}>
              <button className="btn" onClick={() => onGo(`/cases/${theCase.id}/baseline`)}>
                Baseline page
              </button>
              {baselineRun && (
                <button className="btn" onClick={() => onGo(`/runs/${baselineRun.id}/provenance`)}>
                  <span className="row" style={{ gap: 8 }}>
                    <UploadCloud size={14} /> Open baseline run
                  </span>
                </button>
              )}
            </div>
          </div>
        </Panel>

        <Panel
          meta="Comparability"
          title="Preview (must PASS)"
          right={<Chip tone={compareOk ? "ok" : "bad"}>{compareOk ? "PASS" : "FAIL"}</Chip>}
        >
          <div style={{ display: "grid", gap: 10 }}>
            {checklist.map((c) => (
              <div key={c.key} className="gateRow">
                <div>
                  <div style={{ fontWeight: 750 }}>{c.label}</div>
                  {!c.pass && <div className="kicker" style={{ marginTop: 4 }}>{c.whyFail}</div>}
                </div>
                <Chip tone={c.pass ? "ok" : "bad"}>
                  {c.pass ? <CheckCircle2 size={14} /> : <XCircle size={14} />} {c.pass ? "Pass" : "Fail"}
                </Chip>
              </div>
            ))}
          </div>

          <div className="hr" />

          <div className="row" style={{ flexWrap: "wrap" }}>
            <button
              className="btn btn--primary"
              onClick={() => onGo(`/cases/${theCase.id}/verdict`)}
              disabled={!baselineRun || !verificationRun}
              title={!baselineRun || !verificationRun ? "Select baseline + verification first" : ""}
            >
              <span className="row" style={{ gap: 8 }}>
                <ChevronRight size={14} /> Go to verdict
              </span>
            </button>
          </div>
        </Panel>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: "1.2fr 0.8fr" }}>
        <Panel
          meta="Runs"
          title="Choose verification"
          right={
            <button className="btn btn--primary" onClick={createVerificationRun}>
              <span className="row" style={{ gap: 8 }}>
                <FilePlus2 size={14} /> New verification run
              </span>
            </button>
          }
        >
          {candidateRuns.length === 0 ? (
            <div className="text">No runs exist for this room yet. Create a run first.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {candidateRuns.map((r) => {
                const isBaseline = r.id === theCase.baselineRunId;
                const isSelected = r.id === theCase.verificationRunId;
                const v = computeAbstain(r);

                return (
                  <button
                    key={r.id}
                    className={cx("taskRow", isSelected && "taskRow--active")}
                    onClick={() => selectVerification(r.id)}
                    disabled={isBaseline}
                    title={isBaseline ? "Baseline run cannot also be verification" : ""}
                  >
                    <div className="row" style={{ gap: 10 }}>
                      <div className="taskIcon">
                        <Database size={16} />
                      </div>
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontWeight: 750 }}>
                          {r.label} {isBaseline ? "· (baseline)" : ""}
                        </div>
                        <div className="kicker" style={{ marginTop: 4 }}>
                          {r.id} · {r.inputs?.sensorSet || "—"} · {r.inputs?.timeRange || "—"}
                        </div>
                      </div>
                    </div>

                    <div className="row" style={{ gap: 10 }}>
                      <Chip tone={v.abstain ? "bad" : "ok"}>{v.abstain ? "ABSTAIN" : "OK"}</Chip>
                      <Chip tone={isSelected ? "ok" : "neutral"}>{isSelected ? "Selected" : "Select"}</Chip>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Panel>

        <Panel
          meta="Validity"
          title="Verification posture"
          right={
            <Chip tone={verificationRun && !verAbst.abstain ? "ok" : "bad"}>
              {verificationRun && !verAbst.abstain ? <CheckCircle2 size={14} /> : <Ban size={14} />}{" "}
              {verificationRun && !verAbst.abstain ? "OK" : "ABSTAIN"}
            </Chip>
          }
        >
          {!verificationRun ? (
            <div className="text">Select a verification run to see its posture.</div>
          ) : verAbst.abstain ? (
            <AbstainBanner
              reasons={verAbst.reasons}
              body={
                <div className="text" style={{ marginTop: 8 }}>
                  This run cannot support a claim yet. You can still proceed to Verdict, but it should ABSTAIN unless
                  evidence is earned.
                </div>
              }
            />
          ) : (
            <div className="box" style={{ padding: 14, border: "1px solid rgba(34,197,94,0.20)" }}>
              <div className="kicker">Interpretation earned</div>
              <div className="text" style={{ marginTop: 8 }}>
                Critical gates are PASS on the verification run. Now comparability determines whether a verdict is even allowed.
              </div>
            </div>
          )}

          <div className="hr" />

          {verificationRun && (
            <div className="row" style={{ flexWrap: "wrap" }}>
              <button className="btn" onClick={() => onGo(`/runs/${verificationRun.id}/provenance`)}>
                <span className="row" style={{ gap: 8 }}>
                  <UploadCloud size={14} /> Open verification run
                </span>
              </button>
              <button className="btn" onClick={() => onGo(`/runs/${verificationRun.id}/validity`)}>
                Validity gates
              </button>
              <button className="btn" onClick={() => onGo(`/runs/${verificationRun.id}/receipts`)}>
                Receipts
              </button>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

export default CaseVerifyPage;
