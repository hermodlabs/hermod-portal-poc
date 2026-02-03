import React from "react";

import {
  Header,
  Panel,
  Chip,
  AbstainBanner
} from "../../component";

import {
  computeAbstain,
} from "../../algorithms";

import {
  ArrowRight,
  Ban,
  CheckCircle2,
  ShieldAlert,
  FileText,
  ClipboardCheck,
} from "lucide-react";


export function RunReceiptsPage({ data, setData, onGo, run, engine }) {
  if (!run) {
    return (
      <Panel meta="Error" title="Run not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">No run object to receipt.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/runs/new")}>Create run</button>
      </Panel>
    );
  }

  const abst = computeAbstain(run);
  const runReceipts = data.receipts.filter((r) => r.runId === run.id);

  function generateReceiptBundle() {
    if (!engine) return;
    engine.generateReceipt(run.id);
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/runs/${run.id}/receipts`}
        title="Receipts (frozen, defensible)"
        subtitle="Receipts aren’t paperwork. They’re survival: a time-stamped truth you can point to later."
        right={
          <Chip tone={abst.abstain ? "bad" : "ok"}>
            {abst.abstain ? <Ban size={14} /> : <CheckCircle2 size={14} />}{" "}
            {abst.abstain ? "ABSTAIN" : "OK"}
          </Chip>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.1fr 0.9fr" }}>
        <Panel meta="Generate" title="Receipt bundle" right={<Chip tone="accent"><ClipboardCheck size={14}/> frozen</Chip>}>
          {abst.abstain ? (
            <AbstainBanner
              reasons={abst.reasons}
              body={
                <div className="text" style={{ marginTop: 8 }}>
                  You can still generate a receipt — it just freezes the ABSTAIN and its reasons.
                </div>
              }
            />
          ) : (
            <div className="box" style={{ padding: 14, border: "1px solid rgba(34,197,94,0.20)" }}>
              <div className="kicker">Green means earned</div>
              <div className="text" style={{ marginTop: 8 }}>
                Receipt will lock provenance + gate state at generation time.
              </div>
            </div>
          )}

          <div className="hr" />

          <div className="row" style={{ flexWrap: "wrap" }}>
            <button className="btn" onClick={() => onGo(`/runs/${run.id}/validity`)}>
              <span className="row" style={{ gap: 8 }}>
                <ShieldAlert size={14} /> Back to gates
              </span>
            </button>
            <button className="btn btn--primary" onClick={generateReceiptBundle}>
              <span className="row" style={{ gap: 8 }}>
                <FileText size={14} /> Generate receipt
              </span>
            </button>
            <button className="btn" onClick={() => onGo("/receipts")}>
              <span className="row" style={{ gap: 8 }}>
                <FileText size={14} /> View all receipts
              </span>
            </button>
          </div>
        </Panel>

        <Panel meta="Receipts" title="Existing receipts" right={<Chip>{runReceipts.length}</Chip>}>
          {runReceipts.length === 0 ? (
            <div className="text">No receipts yet. Generate one to freeze the truth state.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {runReceipts.map((rcpt) => (
                <button key={rcpt.id} className="taskRow" onClick={() => onGo(`/receipts/${rcpt.id}`)}>
                  <div className="row" style={{ gap: 10 }}>
                    <div className="taskIcon"><FileText size={16} /></div>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontWeight: 650 }}>{rcpt.title}</div>
                      <div className="kicker" style={{ marginTop: 4 }}>
                        {rcpt.when} · {rcpt.frozen ? "frozen" : "draft"}
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
    </div>
  );
}

export default RunReceiptsPage;