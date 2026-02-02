import React from "react";

import {
  Header,
  Panel,
  Chip,
  Stat
} from "../../component";

import {
  caseStatusTone,
  caseStatusLabel,
  getSiteRoomLabel,
} from "../../algorithms";

import {
  MapPinned,
  ShieldCheck,
  Tag,
  Timer,
  Layers,
  Waves,
  ListChecks,
  ListOrdered,
  GitCompare, 
  Gavel, 
  FileSearch, 
} from "lucide-react";

function MiniKV({ icon: Icon, k, v }) {
  return (
    <div className="box" style={{ padding: 12 }}>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div className="row" style={{ gap: 10 }}>
          <div className="taskIcon" style={{ width: 30, height: 30 }}>
            <Icon size={16} />
          </div>
          <div>
            <div className="kicker">{k}</div>
            <div style={{ fontWeight: 700, marginTop: 6 }}>{v}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CaseDetailPage({ data, setData, onGo, theCase }) {
  if (!theCase) {
    return (
      <Panel meta="Error" title="Case not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">Route exists; object missing. Still honest.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/cases")}>
          Back to Cases
        </button>
      </Panel>
    );
  }

  const { siteName, roomName } = getSiteRoomLabel(data, theCase.siteId, theCase.roomId);
  const d = theCase.definition || {};
  const hasDefinition = Boolean(d.Z && d.tau && d.W && d.S);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/cases/${theCase.id}`}
        title={theCase.title}
        subtitle="Slice 1 detail page: shows whether the contract is defined. No analysis is allowed here."
        right={
          <Chip tone={caseStatusTone(theCase.status)}>
            <ShieldCheck size={14} /> {caseStatusLabel(theCase.status)}
          </Chip>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.1fr 0.9fr" }}>
        <Panel meta="Context" title="Where this case lives" right={<Chip>{siteName}</Chip>}>
          <div className="grid-2">
            <Stat label="Room" value={roomName} />
            <Stat label="Owner" value={theCase.owner} />
          </div>

          <div className="hr" />

          {/* ✅ BUTTON ROW — add Baseline + Triggers here */}
          <div className="row" style={{ flexWrap: "wrap" }}>
            <button className="btn btn--primary" onClick={() => onGo(`/cases/${theCase.id}/define`)}>
              <span className="row" style={{ gap: 8 }}>
                <Tag size={14} /> Define slice
              </span>
            </button>

            <button className="btn" onClick={() => onGo(`/cases/${theCase.id}/pockets`)}>
              <span className="row" style={{ gap: 8 }}>
                <ListOrdered size={14} /> Pockets
              </span>
            </button>

            <button className="btn" onClick={() => onGo(`/cases/${theCase.id}/baseline`)}>
              <span className="row" style={{ gap: 8 }}>
                <ListChecks size={14} /> Baseline
              </span>
            </button>

            <button className="btn" onClick={() => onGo(`/cases/${theCase.id}/triggers`)}>
              <span className="row" style={{ gap: 8 }}>
                <Waves size={14} /> Triggers
              </span>
            </button>

            <button className="btn" onClick={() => onGo(`/cases/${theCase.id}/verify`)}>
              <span className="row" style={{ gap: 8 }}>
                <GitCompare size={14} /> Verify
              </span>
            </button>

            <button className="btn" onClick={() => onGo(`/cases/${theCase.id}/verdict`)}>
              <span className="row" style={{ gap: 8 }}>
                <Gavel size={14} /> Verdict
              </span>
            </button>

            <button className="btn" onClick={() => onGo(`/cases/${theCase.id}/readout`)}>
              <span className="row" style={{ gap: 8 }}>
                <FileSearch size={14} /> Readout
              </span>
            </button>

            <button className="btn" onClick={() => onGo("/cases")}>
              Back
            </button>
          </div>
        </Panel>

        <Panel
          meta="Definition"
          title="Frozen slice (Z, τ, W, S)"
          right={<Chip tone={hasDefinition ? "ok" : "warn"}>{hasDefinition ? "complete" : "incomplete"}</Chip>}
        >
          <div style={{ display: "grid", gap: 10 }}>
            <MiniKV icon={MapPinned} k="Z (zone)" v={d.Z || "—"} />
            <MiniKV icon={Timer} k="τ (trigger)" v={d.tau || "—"} />
            <MiniKV icon={Tag} k="W (window)" v={d.W || "—"} />
            <MiniKV icon={Layers} k="S (stage)" v={d.S || "—"} />
          </div>

          <div className="hr" />

          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Slice sentence</div>
            <div className="text" style={{ marginTop: 8 }}>
              {d.sliceSentence || "—"}
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

export default CaseDetailPage;