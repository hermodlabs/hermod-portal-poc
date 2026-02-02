import React from "react";

import {
  Header,
  Panel,
  Chip,
  Stat
} from "../../component";

import {
  Building2,
  Grid3X3,
} from "lucide-react";

export function SiteDetailPage({ site, onGo }) {
  if (!site) {
    return (
      <Panel meta="Error" title="Site not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">This route exists; the object doesn’t. That’s still “honest.”</div>
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
        kicker={`/sites/${site.id}`}
        title={site.name}
        subtitle="Slice 0: site detail exists so rooms aren’t orphaned."
        right={
          <Chip tone="accent">
            <Building2 size={14} /> {site.rooms.length} rooms
          </Chip>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.1fr 0.9fr" }}>
        <Panel meta="Profile" title="Site summary" right={<Chip>{site.city}</Chip>}>
          <div className="grid-2">
            <Stat label="Rooms" value={String(site.rooms.length)} />
            <Stat label="Status" value={"Active (POC)"} />
          </div>
          <div className="hr" />
          <div className="row" style={{ flexWrap: "wrap" }}>
            <button className="btn btn--primary" onClick={() => onGo(`/sites/${site.id}/rooms`)}>
              <span className="row" style={{ gap: 8 }}>
                <Grid3X3 size={14} /> Browse rooms
              </span>
            </button>
            <button className="btn" onClick={() => onGo("/sites")}>
              Back
            </button>
          </div>
        </Panel>

        <Panel meta="Honesty" title="What this is not" right={<Chip tone="warn">placeholder</Chip>}>
          <div className="text">
            There is no analysis on this page. In later slices, this becomes a hub for:
            <ul className="ul">
              <li>active cases in this site</li>
              <li>latest run receipts</li>
              <li>alert routing + operational posture</li>
            </ul>
          </div>
        </Panel>
      </div>
    </div>
  );
}

export default SiteDetailPage;