import React from "react";

import {
  Header,
  Panel,
  Chip,
} from "../../component";


import {
  ArrowRight,
  FileText,
} from "lucide-react";

export function ReceiptsIndexPage({ data, onGo }) {
  const ordered = [...data.receipts];

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker="/receipts"
        title="Receipts"
        subtitle="Frozen bundles the operator can hand off. No vibes. Just time-stamped claims (or abstains)."
        right={<Chip tone="accent"><FileText size={14}/> {ordered.length}</Chip>}
      />

      <Panel meta="Index" title="All receipts" right={<Chip>frozen</Chip>}>
        {ordered.length === 0 ? (
          <div className="text">No receipts yet.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {ordered.map((rcpt) => (
              <button key={rcpt.id} className="taskRow" onClick={() => onGo(`/receipts/${rcpt.id}`)}>
                <div className="row" style={{ gap: 10 }}>
                  <div className="taskIcon"><FileText size={16} /></div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontWeight: 650 }}>{rcpt.title}</div>
                    <div className="kicker" style={{ marginTop: 4 }}>
                      {rcpt.when} · run {rcpt.runId}
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

export default ReceiptsIndexPage;