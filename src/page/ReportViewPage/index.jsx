import React, { useState } from "react";

import {
  Header,
  Panel,
  Chip,
} from "../../component";


import {
  BadgeCheck,
  FolderArchive, 
  FileDown, 
  ClipboardSignature 
} from "lucide-react";

export function ReportViewPage({ data, setData, onGo, report }) {
  if (!report) {
    return (
      <Panel meta="Error" title="Report not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">Need a report object.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/reports")}>Back</button>
      </Panel>
    );
  }

  const [findings, setFindings] = useState((report.topFindings || []).join("\n"));
  const [keyResult, setKeyResult] = useState(report.keyResult || "");
  const [nextSteps, setNextSteps] = useState((report.nextSteps || []).join("\n"));

  function saveDraft() {
    setData((d) => ({
      ...d,
      reports: (d.reports || []).map((r) =>
        r.id === report.id
          ? {
              ...r,
              title: report.title,
              topFindings: findings.split("\n").map((s) => s.trim()).filter(Boolean),
              keyResult: keyResult.trim(),
              nextSteps: nextSteps.split("\n").map((s) => s.trim()).filter(Boolean),
            }
          : r
      ),
    }));
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/reports/${report.id}/view`}
        title={report.title}
        subtitle="Draft view. In Slice 6 this is the canonical readout surface (not a dashboard homepage)."
        right={
          <div className="row" style={{ flexWrap: "wrap" }}>
            <Chip tone="accent">
              <FolderArchive size={14} /> {report.status}
            </Chip>
            <button className="btn" onClick={() => onGo(`/reports/${report.id}/export`)}>
              <span className="row" style={{ gap: 8 }}>
                <FileDown size={14} /> Export
              </span>
            </button>
            <button className="btn" onClick={() => onGo(`/reports/${report.id}/receipts`)}>
              <span className="row" style={{ gap: 8 }}>
                <ClipboardSignature size={14} /> Receipts
              </span>
            </button>
          </div>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.2fr 0.8fr" }}>
        <Panel meta="Report" title="Content (draft)" right={<Chip>editable</Chip>}>
          <label className="label" style={{ marginTop: 0 }}>
            <div className="stat-label">Top findings (one per line)</div>
            <textarea className="textarea" rows={7} value={findings} onChange={(e) => setFindings(e.target.value)} />
          </label>

          <label className="label">
            <div className="stat-label">Key result</div>
            <input className="input" value={keyResult} onChange={(e) => setKeyResult(e.target.value)} />
          </label>

          <label className="label">
            <div className="stat-label">Next steps (one per line)</div>
            <textarea className="textarea" rows={6} value={nextSteps} onChange={(e) => setNextSteps(e.target.value)} />
          </label>

          <div className="hr" />

          <div className="row" style={{ flexWrap: "wrap" }}>
            <button className="btn" onClick={() => onGo("/reports")}>Back</button>
            <button className="btn btn--primary" onClick={saveDraft}>
              <span className="row" style={{ gap: 8 }}>
                <BadgeCheck size={14} /> Save draft
              </span>
            </button>
          </div>
        </Panel>

        <Panel meta="Handoff" title="What makes it defensible" right={<Chip tone="warn">anti-politics</Chip>}>
          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Rule</div>
            <div className="text" style={{ marginTop: 8 }}>
              Report claims must be backed by the frozen receipt bundle.
            </div>
          </div>

          <div className="hr" />

          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Next step</div>
            <div className="text" style={{ marginTop: 8 }}>
              Go to <b>Receipts</b> and freeze the bundle used for this readout.
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

export default ReportViewPage;