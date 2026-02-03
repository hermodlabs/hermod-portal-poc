import React from "react";

import {
  Header,
  Panel,
  Chip,
} from "../../component";

import {
  cx,
} from "../../algorithms";

import {
  FileText,
  ClipboardSignature 
} from "lucide-react";

export function ReportReceiptsPage({ data, setData, onGo, report }) {
  if (!report) {
    return (
      <Panel meta="Error" title="Report not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">Need a report object.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/reports")}>Back</button>
      </Panel>
    );
  }

  // candidate receipts: receipts attached to the case (or runs used by the case)
  const candidates = (data.receipts || []).filter((rcpt) => rcpt.caseId === report.caseId);

  function toggleReceipt(id) {
    setData((d) => ({
      ...d,
      reports: (d.reports || []).map((r) => {
        if (r.id !== report.id) return r;
        const set = new Set(r.frozenReceiptIds || []);
        if (set.has(id)) set.delete(id);
        else set.add(id);
        return { ...r, frozenReceiptIds: Array.from(set) };
      }),
    }));
  }

  function freezeBundle() {
    // freeze report + snapshot verdict
    const caseObj = (data.cases || []).find((c) => c.id === report.caseId);
    setData((d) => ({
      ...d,
      reports: (d.reports || []).map((r) =>
        r.id === report.id
          ? {
              ...r,
              status: "frozen",
              verdictSnapshot: caseObj?.verdict || null,
            }
          : r
      ),
    }));
  }

  const selected = new Set(report.frozenReceiptIds || []);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/reports/${report.id}/receipts`}
        title="Frozen receipt bundle"
        subtitle="This is the anti-politics mechanism: the report links to the exact receipts used for the claims."
        right={
          <Chip tone={report.status === "frozen" ? "ok" : "warn"}>
            <ClipboardSignature size={14} /> {report.status}
          </Chip>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.15fr 0.85fr" }}>
        <Panel meta="Select" title="Receipts to include" right={<Chip>{candidates.length}</Chip>}>
          {candidates.length === 0 ? (
            <div className="text">No receipts found for this case. Generate receipts from runs first (Slice 2).</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {candidates.map((rcpt) => {
                const on = selected.has(rcpt.id);
                return (
                  <button
                    key={rcpt.id}
                    className={cx("taskRow", on && "taskRow--active")}
                    onClick={() => toggleReceipt(rcpt.id)}
                  >
                    <div className="row" style={{ gap: 10 }}>
                      <div className="taskIcon">
                        <FileText size={16} />
                      </div>
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontWeight: 750 }}>{rcpt.title}</div>
                        <div className="kicker" style={{ marginTop: 4 }}>
                          {rcpt.id} · {rcpt.when}
                        </div>
                      </div>
                    </div>
                    <Chip tone={on ? "ok" : "neutral"}>{on ? "Included" : "Include"}</Chip>
                  </button>
                );
              })}
            </div>
          )}
        </Panel>

        <Panel meta="Freeze" title="Lock the handoff pack" right={<Chip tone="accent">Slice 6</Chip>}>
          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Selected</div>
            <div className="text" style={{ marginTop: 8 }}>
              {selected.size} receipt(s) included.
            </div>
          </div>

          <div className="hr" />

          <button className="btn btn--primary" onClick={freezeBundle} disabled={selected.size === 0}>
            <span className="row" style={{ gap: 8 }}>
              <ClipboardSignature size={14} /> Freeze bundle
            </span>
          </button>

          <div className="hr" />

          <div className="row" style={{ flexWrap: "wrap" }}>
            <button className="btn" onClick={() => onGo(`/reports/${report.id}/view`)}>
              Back to report
            </button>
            <button className="btn" onClick={() => onGo(`/reports/${report.id}/export`)}>
              Export pack
            </button>
          </div>
        </Panel>
      </div>
    </div>
  );
}

export default ReportReceiptsPage;