import React, { useState } from "react";

import {
  Header,
  Panel,
  Chip,
} from "../../component";

import {
  makeId,
} from "../../algorithms";

import {
  FilePlus2,
  Database,
} from "lucide-react";

export function RunNewPage({ data, setData, onGo }) {
  const [label, setLabel] = useState("New run");
  const [siteId, setSiteId] = useState(data.sites[0]?.id || "");
  const site = data.sites.find((s) => s.id === siteId);
  const [roomId, setRoomId] = useState(site?.rooms?.[0]?.id || "");
  const [caseId, setCaseId] = useState(data.cases[0]?.id || "");
  const [owner, setOwner] = useState("Bobby");

  React.useEffect(() => {
    const nextSite = data.sites.find((s) => s.id === siteId);
    setRoomId(nextSite?.rooms?.[0]?.id || "");
  }, [siteId]); // eslint-disable-line react-hooks/exhaustive-deps

  function createRun() {
    const id = makeId("run");
    const run = {
      id,
      label: label.trim() || "Run",
      createdAt: "Now",
      owner,
      siteId,
      roomId,
      caseId: caseId || null,
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
      runs: [run, ...d.runs],
      cases: caseId
        ? d.cases.map((c) => (c.id === caseId ? { ...c, evidenceRunId: id } : c))
        : d.cases,
    }));

    onGo(`/runs/${id}/provenance`);
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker="/runs/new"
        title="Create run (evidence object)"
        subtitle="Slice 2: a Run is where provenance + validity + receipts live. Without a Run, gates are theater."
        right={<Chip tone="accent"><Database size={14}/> Slice 2</Chip>}
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.1fr 0.9fr" }}>
        <Panel meta="Inputs" title="Run metadata" right={<Chip>POC</Chip>}>
          <div style={{ display: "grid", gap: 12 }}>
            <label className="label" style={{ marginTop: 0 }}>
              <div className="stat-label">Label</div>
              <input className="input" value={label} onChange={(e) => setLabel(e.target.value)} />
            </label>

            <label className="label" style={{ marginTop: 0 }}>
              <div className="stat-label">Site</div>
              <select className="input" value={siteId} onChange={(e) => setSiteId(e.target.value)}>
                {data.sites.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </label>

            <label className="label" style={{ marginTop: 0 }}>
              <div className="stat-label">Room</div>
              <select className="input" value={roomId} onChange={(e) => setRoomId(e.target.value)}>
                {(data.sites.find((s) => s.id === siteId)?.rooms || []).map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </label>

            <label className="label" style={{ marginTop: 0 }}>
              <div className="stat-label">Attach to Case (optional)</div>
              <select className="input" value={caseId} onChange={(e) => setCaseId(e.target.value)}>
                {data.cases.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </label>

            <label className="label" style={{ marginTop: 0 }}>
              <div className="stat-label">Owner</div>
              <input className="input" value={owner} onChange={(e) => setOwner(e.target.value)} />
            </label>

            <div className="row" style={{ flexWrap: "wrap" }}>
              <button className="btn" onClick={() => onGo("/cases")}>Back</button>
              <button className="btn btn--primary" onClick={createRun}>
                <span className="row" style={{ gap: 8 }}>
                  <FilePlus2 size={14} /> Create run
                </span>
              </button>
            </div>
          </div>
        </Panel>

        <Panel meta="Why" title="Why runs exist" right={<Chip tone="warn">anti-theater</Chip>}>
          <div className="text">
            Operators have been burned by “green dashboards” running on borrowed confidence.
            A Run makes uncertainty operationally binding:
            <ul className="ul">
              <li>unknown evidence blocks claims</li>
              <li>ABSTAIN is a real output</li>
              <li>receipts are timestamped and defensible</li>
            </ul>
          </div>
        </Panel>
      </div>
    </div>
  );
}

export default RunNewPage;