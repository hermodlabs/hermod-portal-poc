import React, { useState } from "react";

import {
  Header,
  Panel,
  Chip,
} from "../../component";

import {
  makeId,
} from "../../algorithms";

import {
  FileOutput, 
} from "lucide-react";

export function ReportNewPage({ data, setData, onGo, caseId }) {
  const theCase = (data.cases || []).find((c) => c.id === caseId) || null;
  const [title, setTitle] = useState(theCase ? `Pilot Readout — ${theCase.title}` : "Pilot Readout — Top Findings");

  function createReport() {
    const id = makeId("rep");
    const rep = {
      id,
      caseId: theCase?.id || null,
      title: title.trim() || "Pilot Readout",
      createdAt: "Now",
      owner: theCase?.owner || "Operator",
      status: "draft",
      topFindings: [],
      keyResult: "",
      nextSteps: [],
      frozenReceiptIds: [],
      baselineRunId: theCase?.baselineRunId || null,
      verificationRunId: theCase?.verificationRunId || null,
      verdictSnapshot: null,
    };

    setData((d) => ({
      ...d,
      reports: [rep, ...(d.reports || [])],
      cases: theCase
        ? d.cases.map((c) => (c.id === theCase.id ? { ...c, readoutReportId: id } : c))
        : d.cases,
    }));

    onGo(`/reports/${id}/view`);
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/reports/new${caseId ? `?case=${caseId}` : ""}`}
        title="New report"
        subtitle="Create the Report object first. Everything else (view/export/receipts) hangs off this."
        right={<Chip tone="accent"><FileOutput size={14}/> report</Chip>}
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.1fr 0.9fr" }}>
        <Panel meta="Inputs" title="Report metadata" right={<Chip>POC</Chip>}>
          <label className="label" style={{ marginTop: 0 }}>
            <div className="stat-label">Title</div>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>

          <div className="hr" />

          <div className="row" style={{ flexWrap: "wrap" }}>
            <button className="btn" onClick={() => onGo(caseId ? `/cases/${caseId}/readout` : "/reports")}>
              Cancel
            </button>
            <button className="btn btn--primary" onClick={createReport}>
              <span className="row" style={{ gap: 8 }}>
                <FileOutput size={14} /> Create report
              </span>
            </button>
          </div>
        </Panel>

        <Panel meta="Rule" title="Why together" right={<Chip tone="warn">anti-screenshot</Chip>}>
          <div className="text">
            A readout without a report object becomes a screenshot game.
            Slice 6 ships view + export + receipts as a unit so handoff is defensible.
          </div>
        </Panel>
      </div>
    </div>
  );
}

export default ReportNewPage;