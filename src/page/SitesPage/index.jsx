import React from "react";

import {
  Header,
  Panel,
  Chip,
} from "../../component";

import {
  Building2,
  ArrowRight,
  Map as MapIcon,
  Layers as LayersIcon,
} from "lucide-react";

export function SitesPage({ sites, onGo }) {
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker="/sites"
        title="Sites"
        subtitle="Pick a site. Slice 0 requires these objects exist and are navigable."
        right={
          <Chip tone="accent">
            <Building2 size={14} /> {sites.length} total
          </Chip>
        }
      />

      <Panel meta="Directory" title="All sites" right={<Chip>POC</Chip>}>
        <div style={{ display: "grid", gap: 10 }}>
          {sites.map((s) => (
            <button key={s.id} className="taskRow" onClick={() => onGo(`/sites/${s.id}`)}>
              <div className="row" style={{ gap: 10 }}>
                <div className="taskIcon">
                  <Building2 size={16} />
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 650 }}>{s.name}</div>
                  <div className="kicker" style={{ marginTop: 4 }}>
                    {s.city} · {s.rooms.length} rooms
                  </div>
                </div>
              </div>
              <span className="taskHint">
                Open <ArrowRight size={14} />
              </span>
            </button>
          ))}
        </div>
      </Panel>
    </div>
  );
}

export default SitesPage;