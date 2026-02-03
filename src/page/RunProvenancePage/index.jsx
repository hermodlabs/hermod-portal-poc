import React  from "react";

import {
  Header,
  Panel,
  Chip,
} from "../../component";

import {
  computeAbstain,
  getSiteRoomLabel,
} from "../../algorithms";

import {
  Ban,
  CheckCircle2,
  ShieldAlert,
  UploadCloud,
  Fingerprint,
  ArrowLeft,
  CalendarClock,
  ListOrdered,
  Map as MapIcon
} from "lucide-react";

export function RunProvenancePage({ data, setData, onGo, run }) {
  if (!run) {
    return (
      <Panel meta="Error" title="Run not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">Route exists; object missing.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/runs/new")}>Create run</button>
      </Panel>
    );
  }

  const { siteName, roomName } = getSiteRoomLabel(data, run.siteId, run.roomId);
  const abst = computeAbstain(run);

  function attachDemoFiles() {
    setData((d) => ({
      ...d,
      runs: d.runs.map((x) =>
        x.id === run.id
          ? {
              ...x,
              inputs: {
                ...x.inputs,
                filesAttached: true,
                timeRange: "Last 24h",
                hash: `sha256: ${Math.random().toString(16).slice(2, 6)}…${Math.random().toString(16).slice(2, 6)}`,
              },
            }
          : x
      ),
    }));
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/runs/${run.id}/provenance`}
        title="Provenance"
        subtitle="If the system is going to lie, it should lie in your face while you're watching. Provenance makes that hard."
        right={
          <Chip tone={abst.abstain ? "bad" : "ok"}>
            {abst.abstain ? <Ban size={14} /> : <CheckCircle2 size={14} />}{" "}
            {abst.abstain ? "ABSTAIN" : "OK"}
          </Chip>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.1fr 0.9fr" }}>
        <Panel meta="Run" title={run.label} right={<Chip>{run.id}</Chip>}>
          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Context</div>
            <div className="text" style={{ marginTop: 8 }}>
              site: <b>{siteName}</b> · room: <b>{roomName}</b> · owner: <b>{run.owner}</b>
            </div>
          </div>

          <div className="hr" />

          <div className="box" style={{ padding: 14 }}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div>
                <div className="kicker">Inputs</div>
                <div style={{ fontWeight: 750, marginTop: 6 }}>
                  {run.inputs.filesAttached ? "Files attached" : "No files attached yet"}
                </div>
              </div>
              <Chip tone={run.inputs.filesAttached ? "ok" : "warn"}>
                <UploadCloud size={14} /> {run.inputs.filesAttached ? "hashed" : "missing"}
              </Chip>
            </div>

            <div className="text" style={{ marginTop: 10 }}>
              source: <b>{run.inputs.source}</b> · sensor set: <b>{run.inputs.sensorSet}</b> · firmware:{" "}
              <b>{run.inputs.firmware}</b>
            </div>
            <div className="text" style={{ marginTop: 10 }}>
              time range: <b>{run.inputs.timeRange}</b>
            </div>
            <div className="text" style={{ marginTop: 10 }}>
              hash: <b>{run.inputs.hash}</b>
            </div>

            <div className="row" style={{ flexWrap: "wrap", marginTop: 12 }}>
              <button className="btn btn--primary" onClick={attachDemoFiles}>
                <span className="row" style={{ gap: 8 }}>
                  <UploadCloud size={14} /> Attach demo files
                </span>
              </button>
              <button className="btn" onClick={() => onGo(`/runs/${run.id}/validity`)}>
                <span className="row" style={{ gap: 8 }}>
                  <ShieldAlert size={14} /> Continue to gates
                </span>
              </button>

<button className="btn" onClick={() => onGo(`/runs/${run.id}/map`)}>
  <span className="row" style={{ gap: 8 }}>
    <MapIcon size={14} /> Map
  </span>
</button>

<button className="btn" onClick={() => onGo(`/runs/${run.id}/pockets`)}>
  <span className="row" style={{ gap: 8 }}>
    <ListOrdered size={14} /> Pockets
  </span>
</button>
  <button className="btn" onClick={() => onGo(`/runs/${run.id}/timeline`)}>
    <span className="row" style={{ gap: 8 }}>
      <CalendarClock size={14} /> Timeline
    </span>
  </button>
              {run.caseId && (
                <button className="btn" onClick={() => onGo(`/cases/${run.caseId}/evidence`)}>
                  <span className="row" style={{ gap: 8 }}>
                    <ArrowLeft size={14} /> Back to case evidence
                  </span>
                </button>
              )}
            </div>
          </div>
        </Panel>

        <Panel meta="Why" title="Institutional backbone" right={<Chip tone="accent"><Fingerprint size={14}/> receipts</Chip>}>
          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">What this prevents</div>
            <div className="text" style={{ marginTop: 8 }}>
              Retroactive blame games. If outcomes go bad, you can point to a locked truth:
              “We weren’t allowed to claim it was fixed. We logged an abstain.”
            </div>
          </div>

          <div className="hr" />

          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Operator feeling</div>
            <div className="text" style={{ marginTop: 8 }}>
              The relief of not being tricked into confidence. The system takes the social hit of saying “no.”
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

export default RunProvenancePage;