import React from "react";

import {
  Header,
  Panel,
  Chip,
} from "../../component";


import {
  FileDown, 
} from "lucide-react";
export function ReportExportPage({ data, onGo, report }) {
  if (!report) {
    return (
      <Panel meta="Error" title="Report not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">Need a report object.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/reports")}>Back</button>
      </Panel>
    );
  }

  const receipts = (data.receipts || []).filter((r) => (report.frozenReceiptIds || []).includes(r.id));
  const caseObj = (data.cases || []).find((c) => c.id === report.caseId);
  const verdict = report.verdictSnapshot || caseObj?.verdict || null;

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/reports/${report.id}/export`}
        title="Export pack (POC)"
        subtitle="In production: PDF + JSON bundle + attachments. Here: a printable pack preview + copyable blocks."
        right={
          <Chip tone="accent">
            <FileDown size={14} /> export
          </Chip>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.15fr 0.85fr" }}>
        <Panel meta="Preview" title="Pack contents" right={<Chip>{receipts.length} receipts</Chip>}>
          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Report</div>
            <div style={{ fontWeight: 800, marginTop: 8 }}>{report.title}</div>
            <div className="kicker" style={{ marginTop: 6 }}>
              status: {report.status} · created: {report.createdAt}
            </div>
          </div>

          <div className="box" style={{ padding: 14, marginTop: 12 }}>
            <div className="kicker">Key result</div>
            <div className="text" style={{ marginTop: 8 }}>{report.keyResult || "—"}</div>
          </div>

          <div className="box" style={{ padding: 14, marginTop: 12 }}>
            <div className="kicker">Verdict snapshot</div>
            <div className="text" style={{ marginTop: 8 }}>
              {verdict ? <b>{verdict.label}</b> : "—"}
            </div>
          </div>

          <div className="box" style={{ padding: 14, marginTop: 12 }}>
            <div className="kicker">Receipts included</div>
            <ul className="ul" style={{ marginTop: 10 }}>
              {receipts.length === 0 ? <li>None selected.</li> : receipts.map((r) => <li key={r.id}>{r.id} · {r.title}</li>)}
            </ul>
          </div>

          <div className="hr" />

          <div className="row" style={{ flexWrap: "wrap" }}>
            <button className="btn" onClick={() => onGo(`/reports/${report.id}/view`)}>Back to report</button>
            <button className="btn" onClick={() => onGo(`/reports/${report.id}/receipts`)}>Receipt bundle</button>
          </div>
        </Panel>

        <Panel meta="Handoff" title="What makes it “survive politics”" right={<Chip tone="warn">anti-screenshot</Chip>}>
          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Rule</div>
            <div className="text" style={{ marginTop: 8 }}>
              Export must include the frozen receipt bundle. Otherwise it’s just a screenshot with vibes.
            </div>
          </div>
          <div className="hr" />
          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">POC note</div>
            <div className="text" style={{ marginTop: 8 }}>
              You can later swap this page to generate a real PDF and zip export.
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

export default ReportExportPage;