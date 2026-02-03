import React from "react";

import {
  Header,
  Panel,
  Chip,
} from "../../component";

import {
  ArrowRight,
  FolderArchive, 
} from "lucide-react";

export function ReportsIndexPage({ data, onGo }) {
  const reports = (data.reports || []).slice();

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker="/reports"
        title="Reports"
        subtitle="Index of generated readout packs. Each report must support view + export + frozen receipts."
        right={
          <Chip tone="accent">
            <FolderArchive size={14} /> {reports.length}
          </Chip>
        }
      />

      <Panel meta="Index" title="All reports" right={<Chip>POC</Chip>}>
        {reports.length === 0 ? (
          <div className="text">No reports yet. Create one from a Case readout page.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {reports.map((r) => (
              <button key={r.id} className="taskRow" onClick={() => onGo(`/reports/${r.id}/view`)}>
                <div className="row" style={{ gap: 10 }}>
                  <div className="taskIcon">
                    <FolderArchive size={16} />
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontWeight: 750 }}>{r.title}</div>
                    <div className="kicker" style={{ marginTop: 4 }}>
                      {r.id} · case {r.caseId} · {r.status}
                    </div>
                  </div>
                </div>
                <span className="taskHint">
                  Open <ArrowRight size={14} />
                </span>
              </button>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

export default ReportsIndexPage;