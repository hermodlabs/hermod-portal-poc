import React from "react";

import {
  Header,
  Panel,
  Chip,
} from "../../component";

import {
  computeAbstain,
} from "../../algorithms";

import {
  Ban,
  CheckCircle2,
  Fingerprint,
} from "lucide-react";

export function ReceiptDetailPage({ data, onGo, receipt }) {
  if (!receipt) {
    return (
      <Panel meta="Error" title="Receipt not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">Receipt object missing.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/receipts")}>Back</button>
      </Panel>
    );
  }

  const run = data.runs.find((r) => r.id === receipt.runId);
  const abst = run ? computeAbstain(run) : { abstain: true, reasons: ["Run missing"] };

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/receipts/${receipt.id}`}
        title={receipt.title}
        subtitle="This is the artifact you point to later. Frozen truth, not meeting vibes."
        right={
          <Chip tone={abst.abstain ? "bad" : "ok"}>
            {abst.abstain ? <Ban size={14} /> : <CheckCircle2 size={14} />}{" "}
            {abst.abstain ? "ABSTAIN" : "OK"}
          </Chip>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.2fr 0.8fr" }}>
        <Panel meta="Receipt" title={receipt.id} right={<Chip>{receipt.when}</Chip>}>
          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Bullets</div>
            <ul className="ul" style={{ marginTop: 10 }}>
              {receipt.bullets.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          </div>

          <div className="hr" />

          <div className="row" style={{ flexWrap: "wrap" }}>
            <button className="btn" onClick={() => onGo("/receipts")}>
              Back to Receipts
            </button>
            {run && (
              <button className="btn btn--primary" onClick={() => onGo(`/runs/${run.id}/provenance`)}>
                <span className="row" style={{ gap: 8 }}>
                  <Fingerprint size={14} /> Open run
                </span>
              </button>
            )}
          </div>
        </Panel>

        <Panel meta="State" title="What this receipt means" right={<Chip tone="accent">binding</Chip>}>
          {abst.abstain ? (
            <AbstainBanner
              reasons={abst.reasons}
              body={
                <div className="text" style={{ marginTop: 8 }}>
                  ABSTAIN is not a failure. It’s disciplined output: evidence missing → claim forbidden.
                </div>
              }
            />
          ) : (
            <div className="box" style={{ padding: 14, border: "1px solid rgba(34,197,94,0.20)" }}>
              <div className="kicker">Interpretation was earned</div>
              <div className="text" style={{ marginTop: 8 }}>
                Critical gates were PASS at receipt time. Claims built on this run are defensible.
              </div>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

export default ReceiptDetailPage;