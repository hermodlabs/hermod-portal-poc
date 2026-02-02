import React from "react";

import {
  Header,
  Panel,
  Chip,
  Stat
} from "../../component";

import {
  MapIcon,
  DoorOpen,
  LayoutDashboard,
} from "lucide-react";

export function RoomDetailPage({ site, room, onGo }) {
  if (!site || !room) {
    return (
      <Panel meta="Error" title="Room not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">This route exists; object missing means data mismatch or permissions — still honest.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/sites")}>
          Back to Sites
        </button>
      </Panel>
    );
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/sites/${site.id}/rooms/${room.id}`}
        title={room.name}
        subtitle="Slice 0 room detail: a stable anchor for later ‘room summary’, runs, and cases."
        right={
          <Chip>
            <DoorOpen size={14} /> {room.status}
          </Chip>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.1fr 0.9fr" }}>
        <Panel meta="Profile" title="Room metadata" right={<Chip tone="accent">{room.kind}</Chip>}>
          <div className="grid-2">
            <Stat label="Room ID" value={room.id} />
            <Stat label="Site" value={site.name} />
          </div>
          <div className="hr" />
          <div className="row" style={{ flexWrap: "wrap" }}>
            <button className="btn btn--primary" onClick={() => onGo(`/sites/${site.id}/rooms/${room.id}/summary`)}>
              <span className="row" style={{ gap: 8 }}>
                <LayoutDashboard size={14} /> Room summary
              </span>
            </button>
            <button className="btn" onClick={() => onGo(`/sites/${site.id}/rooms/${room.id}/layout`)}>
              <span className="row" style={{ gap: 8 }}>
                <MapIcon size={14} /> Layout
              </span>
            </button>
            <button className="btn" onClick={() => onGo(`/sites/${site.id}/rooms`)}>
              Back to Rooms
            </button>
          </div>
        </Panel>

        <Panel meta="Future" title="What will attach here" right={<Chip tone="warn">not yet</Chip>}>
          <div className="text">
            Later slices will add:
            <ul className="ul">
              <li>cases list filtered to this room</li>
              <li>runs timeline</li>
              <li>receipts + validity uptime</li>
            </ul>
            For Slice 0, we only guarantee navigation and object integrity.
          </div>
        </Panel>
      </div>
    </div>
  );
}

export default RoomDetailPage;