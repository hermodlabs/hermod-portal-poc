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
  HelpCircle,
  FileText,
  Fingerprint,
} from "lucide-react";

export function RunValidityPage({ data, setData, onGo, run, engine }) {
  if (!run) {
    return (
      <Panel meta="Error" title="Run not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">No run object to gate.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/runs/new")}>
          Create run
        </button>
      </Panel>
    );
  }

  const abst = computeAbstain(run);

  function setGate(key, value) {
    if (!engine) return;

    // ✅ canonical mutation path (no duplicated setData logic)
    engine.setGate(run.id, key, value);

    // If you haven't implemented engine.setGate yet, temporary fallback:
    // setData((d) => ({
    //   ...d,
    //   runs: d.runs.map((x) => (x.id === run.id ? { ...x, gates: { ...x.gates, [key]: value } } : x)),
    // }));
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/runs/${run.id}/validity`}
        title="Validity gates (ABSTAIN is binding)"
        subtitle="Warning-only systems shrug. This system forbids interpretation when evidence is incomplete."
        right={
          <Chip tone={abst.abstain ? "bad" : "ok"}>
            {abst.abstain ? <Ban size={14} /> : <CheckCircle2 size={14} />}{" "}
            {abst.abstain ? "ABSTAIN" : "INTERPRET OK"}
          </Chip>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.2fr 0.8fr" }}>
        <Panel meta="Gates" title="Set gate states (stress-test honesty)" right={<Chip tone="accent">tri-state</Chip>}>
          <div style={{ display: "grid", gap: 10 }}>
            {Object.keys(run.gates).map((k) => (
              <GateEditorRow key={k} k={k} v={run.gates[k]} onChange={(v) => setGate(k, v)} />
            ))}
          </div>

          <div className="hr" />

          <div className="row" style={{ flexWrap: "wrap" }}>
            <button className="btn" onClick={() => onGo(`/runs/${run.id}/provenance`)}>
              <span className="row" style={{ gap: 8 }}>
                <Fingerprint size={14} /> Back to provenance
              </span>
            </button>
            <button className="btn btn--primary" onClick={() => onGo(`/runs/${run.id}/receipts`)}>
              <span className="row" style={{ gap: 8 }}>
                <FileText size={14} /> Continue to receipts
              </span>
            </button>

            {!engine && (
              <Chip tone="warn">
                <HelpCircle size={14} /> engine missing
              </Chip>
            )}
          </div>
        </Panel>

        <Panel
          meta="Result"
          title="Downstream posture"
          right={<Chip tone={abst.abstain ? "bad" : "ok"}>{abst.abstain ? "ABSTAIN" : "OK"}</Chip>}
        >
          {abst.abstain ? (
            <AbstainBanner
              reasons={abst.reasons}
              body={
                <>
                  <div className="text" style={{ marginTop: 8 }}>
                    This is operationally binding. Not “be careful.” Not “maybe.” A hard stop.
                  </div>
                  <div className="text" style={{ marginTop: 10 }}>
                    The UI carries the weight: “🚫 you may not interpret this.”
                  </div>
                </>
              }
            />
          ) : (
            <div className="box" style={{ padding: 14, border: "1px solid rgba(34,197,94,0.20)" }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div className="kicker">Interpretation allowed</div>
                <Chip tone="ok">
                  <CheckCircle2 size={14} /> earned
                </Chip>
              </div>
              <div className="text" style={{ marginTop: 10 }}>
                Critical gates are PASS. This run can support downstream compare/verdict in later slices.
              </div>
            </div>
          )}

          <div className="hr" />

          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Pass if…</div>
            <div className="text" style={{ marginTop: 8 }}>
              Setting Sensor trust = UNKNOWN must flip the system into ABSTAIN downstream (not warning-only).
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

export default RunValidityPage;