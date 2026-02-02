import React from "react";

import {
  Header,
  Panel,
  Chip,
  Stat
} from "../../component";

import {
  LayoutDashboard,
} from "lucide-react";

export function RoomSummaryPage({ site, room, onGo }) {
  if (!site || !room) {
    return (
      <Panel meta="Error" title="Room summary unavailable" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">Room object missing; summary cannot render.</div>
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
        kicker={`/sites/${site.id}/rooms/${room.id}/summary`}
        title="Room summary (truthful placeholder)"
        subtitle="This exists in Slice 0 so the nav doesn’t collapse. It does NOT claim insights."
        right={
          <Chip tone="accent">
            <LayoutDashboard size={14} /> summary route
          </Chip>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.2fr 0.8fr" }}>
        <Panel meta="Honest state" title="No analysis yet" right={<Chip tone="warn">placeholder</Chip>}>
          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">What you can do in Slice 0</div>
            <ul className="ul">
              <li>Confirm you’re in the right tenant/site/room.</li>
              <li>Use this as a stable anchor route for bookmarking and permissions.</li>
              <li>Navigate to Settings to manage users/roles.</li>
            </ul>
          </div>

          <div className="hr" />

          <div className="row" style={{ flexWrap: "wrap" }}>
            <button className="btn" onClick={() => onGo(`/sites/${site.id}/rooms/${room.id}`)}>
              Back to Room
            </button>
            <button className="btn btn--primary" onClick={() => onGo(`/sites/${site.id}/rooms`)}>
              Room list
            </button>
          </div>
        </Panel>

        <Panel meta="Room" title="Context" right={<Chip>{room.kind}</Chip>}>
          <div className="grid-2">
            <Stat label="Site" value={site.name} />
            <Stat label="Status" value={room.status} />
          </div>
          <div className="hr" />
          <div className="text">
            Next slice that meaningfully changes this page is <b>Slice 1</b> (Case definition spine) and <b>Slice 2</b>{" "}
            (Evidence gates + ABSTAIN).
          </div>
        </Panel>
      </div>
    </div>
  );
}

export default RoomSummaryPage;