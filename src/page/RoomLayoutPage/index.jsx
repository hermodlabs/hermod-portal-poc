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
  ListOrdered,
  Compass,
} from "lucide-react";

function findCaseForRoom(data, siteId, roomId) {
  return (data.cases || []).find((c) => c.siteId === siteId && c.roomId === roomId)?.id || null;
}

export function RoomLayoutPage({ data, setData, onGo, site, room, layout }) {
  if (!site || !room) {
    return (
      <Panel meta="Error" title="Room not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">Need a site + room to show layout.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/sites")}>Back</button>
      </Panel>
    );
  }

  const L =
    layout ||
    (data.layouts || []).find((x) => x.siteId === site.id && x.roomId === room.id) ||
    null;

  const pocketsForRoom = (data.runPockets || []).filter((p) => p.siteId === site.id && p.roomId === room.id);
  const top = pocketsForRoom
    .slice()
    .sort((a, b) => scorePocket(b) - scorePocket(a))
    .slice(0, 3);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/sites/${site.id}/rooms/${room.id}/layout`}
        title="Room layout (baseline)"
        subtitle="Slice 4: layout anchors “where.” Zones + landmarks make pockets walkable."
        right={
          <div className="row" style={{ flexWrap: "wrap" }}>
            <Chip tone="accent">
              <Compass size={14} /> anchor
            </Chip>
            <button className="btn" onClick={() => onGo(`/sites/${site.id}/rooms/${room.id}`)}>
              <span className="row" style={{ gap: 8 }}>
                <ArrowLeft size={14} /> Back
              </span>
            </button>
          </div>
        }
      />

      {!L ? (
        <Panel meta="Missing" title="No layout yet" right={<Chip tone="warn">placeholder</Chip>}>
          <div className="text">
            Create a layout baseline for this room so pockets can be anchored.
          </div>
        </Panel>
      ) : (
        <div className="grid-2" style={{ gridTemplateColumns: "1.2fr 0.8fr" }}>
          <Panel meta="Map" title={`${room.name} layout`} right={<Chip>{L.grid.w}×{L.grid.h}</Chip>}>
            <LayoutMap
              w={L.grid.w}
              h={L.grid.h}
              zones={L.zones}
              landmarks={L.landmarks}
              pockets={top}
            />
            <div className="hr" />
            <div className="text">
              Zones are baseline segments; landmarks are operator reality. Together they make “walk-to-this-spot” possible.
            </div>
          </Panel>

          <Panel meta="Top pockets" title="Ranked (room)" right={<Chip tone="accent">{top.length}</Chip>}>
            {top.length === 0 ? (
              <div className="text">No pockets for this room yet. Run a scan (Slice 4 on a run).</div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {top.map((p) => (
                  <PocketCard
                    key={p.id}
                    pocket={p}
                    onClick={() => onGo(`/runs/${p.runId}/pockets`)}
                    hint="Open run pockets"
                  />
                ))}
              </div>
            )}
            <div className="hr" />
            <button className="btn btn--primary" onClick={() => onGo(`/cases/${findCaseForRoom(data, site.id, room.id) || "case-001"}/pockets`)}>
              <span className="row" style={{ gap: 8 }}>
                <ListOrdered size={14} /> Go to case pockets
              </span>
            </button>
          </Panel>
        </div>
      )}
    </div>
  );
}

export default RoomLayoutPage;