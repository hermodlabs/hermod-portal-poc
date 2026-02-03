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
} from "../../algorithms";

import {
  ArrowLeft,
  Map as MapIcon,
  MapPin,
  ListOrdered,
  Compass,
} from "lucide-react";

export function CasePocketsPage({ data, setData, onGo, theCase }) {
  if (!theCase) {
    return (
      <Panel meta="Error" title="Case not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">Need a case object to show pockets.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/cases")}>Back</button>
      </Panel>
    );
  }

  const layout = (data.layouts || []).find((l) => l.siteId === theCase.siteId && l.roomId === theCase.roomId) || null;
  const baselineRun = data.runs.find((r) => r.id === theCase.baselineRunId) || null;

  // Source of truth: run pockets (use baseline run if present; else evidence run)
  const sourceRunId = baselineRun?.id || theCase.evidenceRunId;
  const pockets = (data.runPockets || [])
    .filter((p) => p.runId === sourceRunId)
    .slice()
    .sort((a, b) => scorePocket(b) - scorePocket(a));

  const top = pockets.slice(0, 6);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/cases/${theCase.id}/pockets`}
        title="Pockets (ranked + walkable)"
        subtitle="Slice 4: ranked list + anchored map. No map = not walkable. No rank = not actionable."
        right={
          <div className="row" style={{ flexWrap: "wrap" }}>
            <Chip tone="accent">
              <MapPin size={14} /> walk-to
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
        <Panel meta="Map" title="Pocket map" right={<Chip tone={layout ? "ok" : "warn"}>{layout ? "anchored" : "missing layout"}</Chip>}>
          {!layout ? (
            <div className="box" style={{ padding: 14 }}>
              <div className="kicker">Layout required</div>
              <div className="text" style={{ marginTop: 8 }}>
                You can’t walk to a pocket without a layout anchor. Create/visit:
                <div style={{ marginTop: 10 }}>
                  <button className="btn btn--primary" onClick={() => onGo(`/sites/${theCase.siteId}/rooms/${theCase.roomId}/layout`)}>
                    <span className="row" style={{ gap: 8 }}>
                      <MapIcon size={14} /> Open room layout
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <LayoutMap
              w={layout.grid.w}
              h={layout.grid.h}
              zones={layout.zones}
              landmarks={layout.landmarks}
              pockets={top}
              onPocketClick={(p) => onGo(`/runs/${p.runId}/pockets`)}
            />
          )}

          <div className="hr" />

          <div className="row" style={{ flexWrap: "wrap" }}>
            <button className="btn" onClick={() => onGo(`/sites/${theCase.siteId}/rooms/${theCase.roomId}/layout`)}>
              <span className="row" style={{ gap: 8 }}>
                <Compass size={14} /> Layout
              </span>
            </button>

            {sourceRunId && (
              <button className="btn" onClick={() => onGo(`/runs/${sourceRunId}/map`)}>
                <span className="row" style={{ gap: 8 }}>
                  <MapIcon size={14} /> Run map
                </span>
              </button>
            )}

            {sourceRunId && (
              <button className="btn" onClick={() => onGo(`/runs/${sourceRunId}/pockets`)}>
                <span className="row" style={{ gap: 8 }}>
                  <ListOrdered size={14} /> Run pockets
                </span>
              </button>
            )}
          </div>
        </Panel>

        <Panel meta="Ranked" title="Pocket list (actionable)" right={<Chip>{pockets.length}</Chip>}>
          {pockets.length === 0 ? (
            <div className="text">No pockets yet for the selected run. Add pockets to /runs/:runId/pockets.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {pockets.map((p) => (
                <PocketCard
                  key={p.id}
                  pocket={p}
                  onClick={() => onGo(`/runs/${p.runId}/pockets`)}
                  hint="Open run pockets"
                />
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

export default CasePocketsPage;