import React from "react";

import {
  Header,
  Panel,
  Chip,
} from "../../component";

import {
  scorePocket,
} from "../../algorithms";

import {
  ArrowLeft,
  Map as MapIcon,
  MapPin,
  ListOrdered,
  Compass,
} from "lucide-react";

function FieldMap({ w, h, field, pockets = [] }) {
  const F = field || Array.from({ length: h }, () => Array.from({ length: w }, () => 0.25));
  return (
    <div className="layoutMap" style={{ gridTemplateColumns: `repeat(${w}, minmax(0, 1fr))` }}>
      {F.flatMap((row, y) =>
        row.map((v, x) => (
          <div
            key={`${x}-${y}`}
            className="cell2"
            style={{ background: riskColor(v) }}
            title={`risk ${(v * 100).toFixed(0)}%`}
          />
        ))
      )}

      {pockets.map((p) => (
        <div
          key={p.id}
          className="pocketPin pocketPin--static"
          style={{ gridColumn: p.x + 1, gridRow: p.y + 1 }}
          title={`${p.label} · ${p.title}`}
        >
          <span className="pinDot" />
        </div>
      ))}
    </div>
  );
}

export function RunMapPage({ data, setData, onGo, run }) {
  if (!run) {
    return (
      <Panel meta="Error" title="Run not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">Need a run object to show map.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/runs/new")}>Create run</button>
      </Panel>
    );
  }

  const layout = (data.layouts || []).find((l) => l.siteId === run.siteId && l.roomId === run.roomId) || null;
  const map = (data.runMaps || []).find((m) => m.runId === run.id) || null;
  const pockets = (data.runPockets || []).filter((p) => p.runId === run.id).slice().sort((a,b)=>scorePocket(b)-scorePocket(a));

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/runs/${run.id}/map`}
        title="Run map (field + pockets)"
        subtitle="Slice 4 optional route: run-derived field map. Still anchored by layout + pockets."
        right={
          <div className="row" style={{ flexWrap: "wrap" }}>
            <Chip tone="accent">
              <MapIcon size={14} /> map
            </Chip>
            <button className="btn" onClick={() => onGo(`/runs/${run.id}/provenance`)}>
              <span className="row" style={{ gap: 8 }}>
                <ArrowLeft size={14} /> Back
              </span>
            </button>
          </div>
        }
      />

      <Panel meta="Field" title="Map view" right={<Chip tone={layout ? "ok" : "warn"}>{layout ? "anchored" : "needs layout"}</Chip>}>
        {!layout ? (
          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Layout required</div>
            <div className="text" style={{ marginTop: 8 }}>
              Without layout, the map can’t tell you where to walk.
            </div>
            <div className="hr" />
            <button className="btn btn--primary" onClick={() => onGo(`/sites/${run.siteId}/rooms/${run.roomId}/layout`)}>
              <span className="row" style={{ gap: 8 }}>
                <Compass size={14} /> Open layout
              </span>
            </button>
          </div>
        ) : (
          <FieldMap
            w={layout.grid.w}
            h={layout.grid.h}
            field={map?.field}
            pockets={pockets.slice(0, 8)}
          />
        )}

        <div className="hr" />

        <div className="row" style={{ flexWrap: "wrap" }}>
          <button className="btn" onClick={() => onGo(`/runs/${run.id}/pockets`)}>
            <span className="row" style={{ gap: 8 }}>
              <ListOrdered size={14} /> Pockets
            </span>
          </button>
          {run.caseId && (
            <button className="btn" onClick={() => onGo(`/cases/${run.caseId}/pockets`)}>
              <span className="row" style={{ gap: 8 }}>
                <MapPin size={14} /> Case pockets
              </span>
            </button>
          )}
        </div>
      </Panel>
    </div>
  );
}

export default RunMapPage;