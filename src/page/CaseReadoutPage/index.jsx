import React from "react";

import {
  Header,
  Panel,
  Chip,
} from "../../component";

import {
  ArrowLeft,
  FileOutput, 
  FolderArchive, 
  FileSearch, 
  FileDown, 
  ClipboardSignature 
} from "lucide-react";

export function CaseReadoutPage({ data, setData, onGo, theCase }) {
  if (!theCase) {
    return (
      <Panel meta="Error" title="Case not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">Need a case to generate a readout.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/cases")}>Back</button>
      </Panel>
    );
  }

  // Prefer linked report, else latest report for case
  const report =
    (theCase.readoutReportId && data.reports?.find((r) => r.id === theCase.readoutReportId)) ||
    (data.reports || []).find((r) => r.caseId === theCase.id) ||
    null;

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/cases/${theCase.id}/readout`}
        title="Case readout"
        subtitle="Slice 6: the handoff artifact. No screenshots. A Report object + export + frozen receipts."
        right={
          <div className="row" style={{ flexWrap: "wrap" }}>
            <Chip tone="accent">
              <FolderArchive size={14} /> pack
            </Chip>
            <button className="btn" onClick={() => onGo(`/cases/${theCase.id}`)}>
              <span className="row" style={{ gap: 8 }}>
                <ArrowLeft size={14} /> Back
              </span>
            </button>
          </div>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.2fr 0.8fr" }}>
        <Panel meta="Readout" title="Open or create report" right={<Chip>{report ? "exists" : "none"}</Chip>}>
          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Rule</div>
            <div className="text" style={{ marginTop: 8 }}>
              A “readout” is not a page. It’s a report object you can export, re-open, and defend later.
            </div>
          </div>

          <div className="hr" />

          <div className="row" style={{ flexWrap: "wrap" }}>
            <button className="btn btn--primary" onClick={() => onGo(`/reports/new?case=${theCase.id}`)}>
              <span className="row" style={{ gap: 8 }}>
                <FileOutput size={14} /> New report for case
              </span>
            </button>

            {report && (
              <>
                <button className="btn" onClick={() => onGo(`/reports/${report.id}/view`)}>
                  <span className="row" style={{ gap: 8 }}>
                    <FileSearch size={14} /> View report
                  </span>
                </button>
                <button className="btn" onClick={() => onGo(`/reports/${report.id}/export`)}>
                  <span className="row" style={{ gap: 8 }}>
                    <FileDown size={14} /> Export
                  </span>
                </button>
                <button className="btn" onClick={() => onGo(`/reports/${report.id}/receipts`)}>
                  <span className="row" style={{ gap: 8 }}>
                    <ClipboardSignature size={14} /> Receipt bundle
                  </span>
                </button>
              </>
            )}
          </div>
        </Panel>

        <Panel meta="Why" title="Why this survives politics" right={<Chip tone="accent">handoff</Chip>}>
          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">No screenshot games</div>
            <div className="text" style={{ marginTop: 8 }}>
              The report links to frozen receipts. Claims without receipts are not allowed.
            </div>
          </div>

          <div className="hr" />

          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Narrative defense</div>
            <div className="text" style={{ marginTop: 8 }}>
              If the org rewrites history, you point to the exported pack and the frozen bundle.
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

export default CaseReadoutPage;