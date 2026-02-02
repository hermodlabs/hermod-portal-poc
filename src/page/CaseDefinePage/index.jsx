import React, { useState } from "react";

import {
  Header,
  Panel,
  Chip,
} from "../../component";

import {
  ShieldCheck,
} from "lucide-react";

export function CaseDefinePage({ data, setData, onGo, theCase }) {
  if (!theCase) {
    return (
      <Panel meta="Error" title="Case not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">Can’t define a missing object.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/cases")}>
          Back to Cases
        </button>
      </Panel>
    );
  }

  const initial = theCase.definition || { Z: "", tau: "", W: "", S: "", sliceSentence: "" };
  const [def, setDef] = useState(initial);

  const canSave = Boolean(def.Z.trim() && def.tau.trim() && def.W.trim() && def.S.trim());

  function saveDefinition() {
    const Z = def.Z.trim();
    const tau = def.tau.trim();
    const W = def.W.trim();
    const S = def.S.trim();
    const sliceSentence = `We are talking about zone ${Z} in window ${W} after trigger ${tau} at stage ${S}.`;

    setData((d) => ({
      ...d,
      cases: d.cases.map((c) =>
        c.id === theCase.id
          ? { ...c, status: "defined", definition: { Z, tau, W, S, sliceSentence } }
          : c
      ),
    }));

    onGo(`/cases/${theCase.id}`);
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/cases/${theCase.id}/define`}
        title="Define the slice (contract)"
        subtitle="This is the first anti-theater milestone: freeze the question into a speakable object."
        right={
          <Chip tone={canSave ? "ok" : "warn"}>
            <ShieldCheck size={14} /> {canSave ? "ready" : "incomplete"}
          </Chip>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.1fr 0.9fr" }}>
        <Panel meta="Inputs" title="Case definition fields" right={<Chip tone="accent">Slice 1</Chip>}>
          <div style={{ display: "grid", gap: 12 }}>
            <label className="label" style={{ marginTop: 0 }}>
              <div className="stat-label">Z — Zone</div>
              <input
                className="input"
                value={def.Z}
                onChange={(e) => setDef((x) => ({ ...x, Z: e.target.value }))}
                placeholder='e.g., "NW · A1" or "Shelf C3"'
              />
            </label>

            <label className="label" style={{ marginTop: 0 }}>
              <div className="stat-label">τ — Trigger (event anchor)</div>
              <input
                className="input"
                value={def.tau}
                onChange={(e) => setDef((x) => ({ ...x, tau: e.target.value }))}
                placeholder='e.g., "Door cycle" or "Lights off"'
              />
            </label>

            <label className="label" style={{ marginTop: 0 }}>
              <div className="stat-label">W — Window</div>
              <input
                className="input"
                value={def.W}
                onChange={(e) => setDef((x) => ({ ...x, W: e.target.value }))}
                placeholder='e.g., "15m" or "2h"'
              />
            </label>

            <label className="label" style={{ marginTop: 0 }}>
              <div className="stat-label">S — Stage</div>
              <input
                className="input"
                value={def.S}
                onChange={(e) => setDef((x) => ({ ...x, S: e.target.value }))}
                placeholder='e.g., "Mid-cycle" or "Late flower"'
              />
            </label>

            <div className="row" style={{ flexWrap: "wrap" }}>
              <button className="btn" onClick={() => onGo(`/cases/${theCase.id}`)}>
                Cancel
              </button>
              <button className="btn btn--primary" onClick={saveDefinition} disabled={!canSave}>
                <span className="row" style={{ gap: 8 }}>
                  <ShieldCheck size={14} /> Save definition
                </span>
              </button>
            </div>
          </div>
        </Panel>

        <Panel meta="Preview" title="Slice sentence (speakable)" right={<Chip>contract</Chip>}>
          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Output sentence</div>
            <div className="text" style={{ marginTop: 10 }}>
              <b>
                We are talking about zone{" "}
                {def.Z.trim() ? def.Z.trim() : "—"} in window{" "}
                {def.W.trim() ? def.W.trim() : "—"} after trigger{" "}
                {def.tau.trim() ? def.tau.trim() : "—"} at stage{" "}
                {def.S.trim() ? def.S.trim() : "—"}.
              </b>
            </div>
          </div>

          <div className="hr" />

          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Why this matters</div>
            <div className="text" style={{ marginTop: 8 }}>
              Later slices can only compare evidence honestly if the ruler is explicit. This definition is the ruler.
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

export default CaseDefinePage;