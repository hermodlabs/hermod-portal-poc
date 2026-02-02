import React from "react";

import {
  Header,
  Panel,
  Chip,
} from "../../component";

import {
  Grid3X3,
  MapPinned,
  ArrowRight,
} from "lucide-react";

export function RoomsPage({ site, onGo }) {
  if (!site) {
    return (
      <Panel meta="Error" title="Site not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">Rooms list depends on a real site object.</div>
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
        kicker={`/sites/${site.id}/rooms`}
        title="Rooms"
        subtitle="Slice 0 includes room objects + routes so later slices can attach cases/runs."
        right={
          <Chip tone="accent">
            <Grid3X3 size={14} /> {site.rooms.length} rooms
          </Chip>
        }
      />

      <Panel meta="Directory" title={`Rooms at ${site.name}`} right={<Chip>{site.city}</Chip>}>
        <div style={{ display: "grid", gap: 10 }}>
          {site.rooms.map((rm) => (
            <button key={rm.id} className="taskRow" onClick={() => onGo(`/sites/${site.id}/rooms/${rm.id}`)}>
              <div className="row" style={{ gap: 10 }}>
                <div className="taskIcon">
                  <MapPinned size={16} />
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 650 }}>{rm.name}</div>
                  <div className="kicker" style={{ marginTop: 4 }}>
                    {rm.kind} · {rm.status}
                  </div>
                </div>
              </div>
              <span className="taskHint">
                Open <ArrowRight size={14} />
              </span>
            </button>
          ))}
        </div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo(`/sites/${site.id}`)}>
          Back to Site
        </button>
      </Panel>
    </div>
  );
}

export default RoomsPage;