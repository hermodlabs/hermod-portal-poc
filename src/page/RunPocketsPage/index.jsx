import React from "react";

import {
  Header,
  Panel,
  Chip,
  LayoutMap,
  PocketCard
} from "../../component";

import {
  scorePocket,
  makeId,
} from "../../algorithms";

import {
  ArrowLeft,
  Map as MapIcon,
  MapPin,
  Target,
} from "lucide-react";

export function RunPocketsPage({ data, setData, onGo, run }) {
  if (!run) {
    return (
      <Panel meta="Error" title="Run not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">Need a run object to show pockets.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/runs/new")}>Create run</button>
      </Panel>
    );
  }

  const layout = (data.layouts || []).find((l) => l.siteId === run.siteId && l.roomId === run.roomId) || null;

  const pockets = (data.runPockets || [])
    .filter((p) => p.runId === run.id)
    .slice()
    .sort((a, b) => scorePocket(b) - scorePocket(a));

  function addPocket() {
    const id = makeId("p");
    const x = 2 + Math.floor(Math.random() * 16);
    const y = 2 + Math.floor(Math.random() * 8);
    const p = {
      id,
      runId: run.id,
      roomId: run.roomId,
      siteId: run.siteId,
      label: `P-${String(1 + pockets.length).padStart(2, "0")}`,
      title: "New pocket (log)",
      x,
      y,
      severity: Math.round((0.35 + Math.random() * 0.6) * 100) / 100,
      persistenceMin: 10 + Math.floor(Math.random() * 55),
      repeatability: Math.round((0.35 + Math.random() * 0.6) * 100) / 100,
      trigger: "Door cycle",
      note: "Logged in demo.",
      rec: "Add temporary sensor; re-check on comparable trigger window.",
    };

    setData((d) => ({ ...d, runPockets: [p, ...(d.runPockets || [])] }));
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/runs/${run.id}/pockets`}
        title="Run pockets (source of truth)"
        subtitle="Slice 4: pockets originate on a run, then cases consume them. Rank + anchor makes it operational."
        right={
          <div className="row" style={{ flexWrap: "wrap" }}>
            <Chip tone="accent">
              <Target size={14} /> pockets
            </Chip>
            <button className="btn" onClick={() => onGo(`/runs/${run.id}/provenance`)}>
              <span className="row" style={{ gap: 8 }}>
                <ArrowLeft size={14} /> Back
              </span>
            </button>
          </div>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.2fr 0.8fr" }}>
        <Panel meta="Map" title="Overlay (top pockets)" right={<Chip tone={layout ? "ok" : "warn"}>{layout ? "anchored" : "needs layout"}</Chip>}>
          {!layout ? (
            <div className="box" style={{ padding: 14 }}>
              <div className="kicker">Layout required</div>
              <div className="text" style={{ marginTop: 8 }}>
                Create/visit layout to make pockets walkable.
              </div>
              <div className="hr" />
              <button className="btn btn--primary" onClick={() => onGo(`/sites/${run.siteId}/rooms/${run.roomId}/layout`)}>
                <span className="row" style={{ gap: 8 }}>
                  <MapIcon size={14} /> Open layout
                </span>
              </button>
            </div>
          ) : (
            <LayoutMap
              w={layout.grid.w}
              h={layout.grid.h}
              zones={layout.zones}
              landmarks={layout.landmarks}
              pockets={pockets.slice(0, 6)}
            />
          )}

          <div className="hr" />

          <div className="row" style={{ flexWrap: "wrap" }}>
            <button className="btn" onClick={() => onGo(`/runs/${run.id}/map`)}>
              <span className="row" style={{ gap: 8 }}>
                <MapIcon size={14} /> Run map
              </span>
            </button>
            <button className="btn btn--primary" onClick={addPocket}>
              <span className="row" style={{ gap: 8 }}>
                <MapPin size={14} /> Add pocket
              </span>
            </button>
          </div>
        </Panel>

        <Panel meta="Ranked" title="Pocket list" right={<Chip>{pockets.length}</Chip>}>
          {pockets.length === 0 ? (
            <div className="text">No pockets yet. Add one to demonstrate the list→map coupling.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {pockets.map((p) => (
                <PocketCard key={p.id} pocket={p} onClick={() => onGo(`/runs/${run.id}/map`)} hint="Open map" />
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

export default RunPocketsPage;