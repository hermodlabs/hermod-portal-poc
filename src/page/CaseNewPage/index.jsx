import React, {useState } from "react";

import {
  Header,
  Panel,
  Chip,
} from "../../component";

import {
  FilePlus2,
  Tag,
} from "lucide-react";

export function CaseNewPage({ data, setData, onGo, engine }) {
  const [title, setTitle] = useState("New case");
  const [siteId, setSiteId] = useState(data.sites[0]?.id || "");
  const site = data.sites.find((s) => s.id === siteId);
  const [roomId, setRoomId] = useState(site?.rooms?.[0]?.id || "");
  const [owner, setOwner] = useState("Bobby");

  // keep roomId valid when site changes
  React.useEffect(() => {
    const nextSite = data.sites.find((s) => s.id === siteId);
    const nextRoomId = nextSite?.rooms?.[0]?.id || "";
    setRoomId(nextRoomId);
  }, [siteId]); // eslint-disable-line react-hooks/exhaustive-deps

  function createCase() {
    if (!engine) return;

    if (!title.trim() || !siteId || !roomId) return;

    // ✅ use engine for ID + canonical case insertion (no double-insert)
    const id = engine.createCase({ title, siteId, roomId, owner });

    // go straight to define page (Slice 1 contract)
    onGo(`/cases/${id}/define`);
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker="/cases/new"
        title="Create case"
        subtitle="Slice 1: create the object, then immediately define the slice."
        right={
          <Chip tone="warn">
            <Tag size={14} /> defining
          </Chip>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.1fr 0.9fr" }}>
        <Panel meta="Inputs" title="Case metadata" right={<Chip>POC</Chip>}>
          <div style={{ display: "grid", gap: 12 }}>
            <label className="label" style={{ marginTop: 0 }}>
              <div className="stat-label">Title</div>
              <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>

            <label className="label" style={{ marginTop: 0 }}>
              <div className="stat-label">Site</div>
              <select
                className="input"
                value={siteId}
                onChange={(e) => setSiteId(e.target.value)}
              >
                {data.sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="label" style={{ marginTop: 0 }}>
              <div className="stat-label">Room</div>
              <select
                className="input"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              >
                {(data.sites.find((s) => s.id === siteId)?.rooms || []).map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="label" style={{ marginTop: 0 }}>
              <div className="stat-label">Owner</div>
              <input className="input" value={owner} onChange={(e) => setOwner(e.target.value)} />
            </label>

            <div className="row" style={{ flexWrap: "wrap" }}>
              <button className="btn" onClick={() => onGo("/cases")}>
                Cancel
              </button>
              <button
                className="btn btn--primary"
                onClick={createCase}
                disabled={!title.trim() || !siteId || !roomId || !engine}
                title={!engine ? "Engine missing (pass engine as prop)" : ""}
              >
                <span className="row" style={{ gap: 8 }}>
                  <FilePlus2 size={14} /> Create & define
                </span>
              </button>
            </div>
          </div>
        </Panel>

        <Panel meta="Rule" title="What must ship together" right={<Chip tone="accent">Slice 1</Chip>}>
          <div className="text">
            Slice 1 is only coherent if these routes exist together:
            <ul className="ul">
              <li>/cases (list)</li>
              <li>/cases/new (create)</li>
              <li>/cases/:caseId (detail)</li>
              <li>/cases/:caseId/define (contract object)</li>
            </ul>
            Without /define, a Case is just a title — not a contract.
          </div>
        </Panel>
      </div>
    </div>
  );
}

export default CaseNewPage;