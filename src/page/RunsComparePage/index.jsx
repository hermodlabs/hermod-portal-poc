import React from "react";

import {
  Header,
  Panel,
  Chip,
} from "../../component";

import {
  compareSummary,
  computeAbstain,
} from "../../algorithms";

import {
  Ban,
  CheckCircle2,
  GitCompare, 
} from "lucide-react";

export function RunsComparePage({ data, setData, onGo, leftRun, rightRun }) {
  if (!leftRun || !rightRun) {
    return (
      <Panel meta="Error" title="Compare requires two runs" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">Provide left and right run IDs via query string.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/cases")}>Back</button>
      </Panel>
    );
  }

  const summary = compareSummary(data, leftRun, rightRun);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/runs/compare?left=${leftRun.id}&right=${rightRun.id}`}
        title="Compare (evidence view)"
        subtitle="Slice 5: compare UI is evidence. Verdict is separate so you can’t storytime in the compare view."
        right={
          <Chip tone="accent">
            <GitCompare size={14} /> compare
          </Chip>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.1fr 0.9fr" }}>
        <Panel meta="Left" title={leftRun.label} right={<Chip>{leftRun.id}</Chip>}>
          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Validity</div>
            {computeAbstain(leftRun).abstain ? (
              <Chip tone="bad" style={{ marginTop: 10 }}>
                <Ban size={14} /> ABSTAIN
              </Chip>
            ) : (
              <Chip tone="ok" style={{ marginTop: 10 }}>
                <CheckCircle2 size={14} /> OK
              </Chip>
            )}
          </div>

          <div className="hr" />

          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Top pocket metric (POC)</div>
            <div className="text" style={{ marginTop: 8 }}>
              {summary.baseTop ? (
                <>
                  <b>{summary.baseTop.label}</b> · severity{" "}
                  <b>{Math.round(summary.baseTop.severity * 100)}%</b>
                </>
              ) : (
                "No pockets found for left run."
              )}
            </div>
          </div>
        </Panel>

        <Panel meta="Right" title={rightRun.label} right={<Chip>{rightRun.id}</Chip>}>
          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Validity</div>
            {computeAbstain(rightRun).abstain ? (
              <Chip tone="bad" style={{ marginTop: 10 }}>
                <Ban size={14} /> ABSTAIN
              </Chip>
            ) : (
              <Chip tone="ok" style={{ marginTop: 10 }}>
                <CheckCircle2 size={14} /> OK
              </Chip>
            )}
          </div>

          <div className="hr" />

          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Top pocket metric (POC)</div>
            <div className="text" style={{ marginTop: 8 }}>
              {summary.verTop ? (
                <>
                  <b>{summary.verTop.label}</b> · severity{" "}
                  <b>{Math.round(summary.verTop.severity * 100)}%</b>
                </>
              ) : (
                "No pockets found for right run."
              )}
            </div>
          </div>
        </Panel>
      </div>

      <Panel meta="Delta" title="Difference (POC)" right={<Chip tone="accent">evidence</Chip>}>
        <div className="grid-2">
          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Baseline severity</div>
            <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>
              {summary.baseSev == null ? "—" : `${Math.round(summary.baseSev * 100)}%`}
            </div>
          </div>
          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Verification severity</div>
            <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>
              {summary.verSev == null ? "—" : `${Math.round(summary.verSev * 100)}%`}
            </div>
          </div>
        </div>

        <div className="hr" />

        <div className="box" style={{ padding: 14 }}>
          <div className="kicker">Delta (right - left)</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 8 }}>
            {summary.delta == null ? "—" : `${(summary.delta * 100).toFixed(1)}%`}
          </div>
          <div className="text" style={{ marginTop: 10 }}>
            In production, this becomes windowed comparisons on τ/W, pocket persistence deltas, and repeatability tests.
          </div>
        </div>
      </Panel>
    </div>
  );
}

export default RunsComparePage;