import React from "react";

import {
  Header,
  Panel,
  Chip,
} from "../../component";

import {
  CRITICAL_GATES,
  makeId,
  prettyGateName,
  computeAbstain,
  getSiteRoomLabel,
} from "../../algorithms";

import {
  FilePlus2,
  Ban,
  CheckCircle2,
  ShieldAlert,
  UploadCloud,
  FileText,
  Fingerprint,
  ArrowLeft,
} from "lucide-react";

export function CaseEvidencePage({ data, setData, onGo, theCase }) {
  if (!theCase) {
    return (
      <Panel meta="Error" title="Case not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">No case object to attach evidence to.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/cases")}>Back</button>
      </Panel>
    );
  }

  const { siteName, roomName } = getSiteRoomLabel(data, theCase.siteId, theCase.roomId);
  const run = data.runs.find((r) => r.id === theCase.evidenceRunId);
  const abst = run ? computeAbstain(run) : { abstain: true, reasons: ["No run attached yet"] };

  function createRunForCase() {
    const id = makeId("run");
    const newRun = {
      id,
      label: `Run for ${theCase.id}`,
      createdAt: "Now",
      owner: theCase.owner || "Operator",
      siteId: theCase.siteId,
      roomId: theCase.roomId,
      caseId: theCase.id,
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
    };

    setData((d) => ({
      ...d,
      runs: [newRun, ...d.runs],
      cases: d.cases.map((c) => (c.id === theCase.id ? { ...c, evidenceRunId: id } : c)),
    }));

    onGo(`/runs/${id}/provenance`);
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/cases/${theCase.id}/evidence`}
        title="Evidence gates (ABSTAIN is binding)"
        subtitle="Not a warning. A hard stop the operator can defend. Unknown means: you may not interpret."
        right={
          <Chip tone={abst.abstain ? "bad" : "ok"}>
            {abst.abstain ? <Ban size={14} /> : <CheckCircle2 size={14} />}{" "}
            {abst.abstain ? "ABSTAIN" : "INTERPRET OK"}
          </Chip>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.2fr 0.8fr" }}>
        <Panel meta="Case" title={theCase.title} right={<Chip>{siteName}</Chip>}>
          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Where</div>
            <div style={{ fontWeight: 700, marginTop: 8 }}>{roomName}</div>
            <div className="text" style={{ marginTop: 10 }}>
              {theCase.definition?.sliceSentence || "Case not defined yet."}
            </div>
          </div>

          <div className="hr" />

          <div className="row" style={{ flexWrap: "wrap" }}>
            <button className="btn" onClick={() => onGo(`/cases/${theCase.id}`)}>
              <span className="row" style={{ gap: 8 }}>
                <ArrowLeft size={14} /> Back to case
              </span>
            </button>
            {!run ? (
              <button className="btn btn--primary" onClick={createRunForCase}>
                <span className="row" style={{ gap: 8 }}>
                  <FilePlus2 size={14} /> Create run
                </span>
              </button>
            ) : (
              <button className="btn btn--primary" onClick={() => onGo(`/runs/${run.id}/provenance`)}>
                <span className="row" style={{ gap: 8 }}>
                  <UploadCloud size={14} /> Open run
                </span>
              </button>
            )}
          </div>
        </Panel>

        <Panel meta="State" title="Operational posture" right={<Chip tone="accent">Slice 2</Chip>}>
          {abst.abstain ? (
            <AbstainBanner
              reasons={abst.reasons}
              body={
                <>
                  <div className="text" style={{ marginTop: 8 }}>
                    This is the moment the product carries the social weight:
                    not “⚠️ warning”, but “🚫 you may not interpret this.”
                  </div>
                  <div className="text" style={{ marginTop: 10 }}>
                    ABSTAIN isn’t cautious. It’s clean.
                  </div>
                </>
              }
            />
          ) : (
            <div className="box" style={{ padding: 14, border: "1px solid rgba(34,197,94,0.20)" }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div className="kicker">Interpretation earned</div>
                <Chip tone="ok">
                  <CheckCircle2 size={14} /> allowed
                </Chip>
              </div>
              <div className="text" style={{ marginTop: 10 }}>
                Critical evidence gates are PASS. Downstream routes may interpret, compare, and verdict in later slices.
              </div>
            </div>
          )}

          <div className="hr" />

          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Pass if… (emotionally)</div>
            <div className="text" style={{ marginTop: 8 }}>
              Unknown trust implies ABSTAIN downstream (not warning-only). Don’t make the human be the conscience.
            </div>
          </div>
        </Panel>
      </div>

      {run && (
        <div className="grid-2">
          <Panel meta="Run" title="Evidence object" right={<Chip>{run.id}</Chip>}>
            <div style={{ display: "grid", gap: 10 }}>
              <div className="box" style={{ padding: 14 }}>
                <div className="kicker">Input status</div>
                <div className="row" style={{ justifyContent: "space-between", marginTop: 10 }}>
                  <div className="text">
                    files attached: <b>{run.inputs.filesAttached ? "yes" : "no"}</b>
                  </div>
                  <Chip tone={run.inputs.filesAttached ? "ok" : "warn"}>
                    <UploadCloud size={14} /> {run.inputs.filesAttached ? "ready" : "missing"}
                  </Chip>
                </div>
                <div className="text" style={{ marginTop: 10 }}>
                  source: <b>{run.inputs.source}</b> · sensor set: <b>{run.inputs.sensorSet}</b>
                </div>
              </div>

              <div className="row" style={{ flexWrap: "wrap" }}>
                <button className="btn" onClick={() => onGo(`/runs/${run.id}/provenance`)}>
                  <span className="row" style={{ gap: 8 }}>
                    <Fingerprint size={14} /> Provenance
                  </span>
                </button>
                <button className="btn" onClick={() => onGo(`/runs/${run.id}/validity`)}>
                  <span className="row" style={{ gap: 8 }}>
                    <ShieldAlert size={14} /> Validity gates
                  </span>
                </button>
                <button className="btn" onClick={() => onGo(`/runs/${run.id}/receipts`)}>
                  <span className="row" style={{ gap: 8 }}>
                    <FileText size={14} /> Receipts
                  </span>
                </button>

                <button className="btn" onClick={() => onGo(`/cases/${theCase.id}/evidence`)}>
                  <span className="row" style={{ gap: 8 }}>
                    <ShieldAlert size={14} /> Evidence gates
                  </span>
                </button>
              </div>
            </div>
          </Panel>

          <Panel meta="Gates" title="Critical gates (drive ABSTAIN)" right={<Chip tone="accent">hard stop</Chip>}>
            <div style={{ display: "grid", gap: 10 }}>
              {CRITICAL_GATES.map((k) => (
                <GateRow key={k} name={prettyGateName(k)} value={run.gates[k]} />
              ))}
            </div>
            <div className="hr" />
            <div className="text">
              “Assume everything else is fine. Now tell me what this single uncertainty does.”
              If Sensor trust is UNKNOWN, downstream must ABSTAIN.
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}

export default CaseEvidencePage;