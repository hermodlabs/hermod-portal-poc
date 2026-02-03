import React from "react";

import {
  Header,
  Panel,
  Chip,
} from "../../component";

import {
  cx,
  parseWindowToMin,
} from "../../algorithms";

import {
  Database,
  ArrowLeft,
  CalendarClock,
  Link2,
  ListChecks,
  ChevronRight,
} from "lucide-react";

export function CaseBaselinePage({ data, setData, onGo, theCase }) {
  if (!theCase) {
    return (
      <Panel meta="Error" title="Case not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">No case object to select baseline for.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/cases")}>Back</button>
      </Panel>
    );
  }

  const caseRuns = data.runs.filter((r) => r.siteId === theCase.siteId && r.roomId === theCase.roomId);
  const selected = caseRuns.find((r) => r.id === theCase.baselineRunId) || null;

  function setBaseline(runId) {
    setData((d) => ({
      ...d,
      cases: d.cases.map((c) =>
        c.id === theCase.id
          ? {
              ...c,
              baselineRunId: runId,
              // default binding from case definition if available
              triggerBinding: c.triggerBinding || {
                tau: c.definition?.tau || "Door cycle",
                windowMin: parseWindowToMin(c.definition?.W) || 15,
                anchorPolicy: "event-linked",
              },
            }
          : c
      ),
    }));
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/cases/${theCase.id}/baseline`}
        title="Select baseline run"
        subtitle="Slice 3: the Case must “claim” a baseline run so τ/W become a comparable ruler."
        right={
          <div className="row" style={{ flexWrap: "wrap" }}>
            <Chip tone="accent">
              <ListChecks size={14} /> baseline
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
        <Panel meta="Runs" title="Choose baseline" right={<Chip>{caseRuns.length}</Chip>}>
          <div style={{ display: "grid", gap: 10 }}>
            {caseRuns.length === 0 ? (
              <div className="text">No runs for this room yet. Create a run first.</div>
            ) : (
              caseRuns.map((r) => {
                const isOn = theCase.baselineRunId === r.id;
                return (
                  <button
                    key={r.id}
                    className={cx("taskRow", isOn && "taskRow--active")}
                    onClick={() => setBaseline(r.id)}
                  >
                    <div className="row" style={{ gap: 10 }}>
                      <div className="taskIcon">
                        <Database size={16} />
                      </div>
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontWeight: 750 }}>{r.label}</div>
                        <div className="kicker" style={{ marginTop: 4 }}>
                          {r.id} · {r.inputs?.timeRange || "—"}
                        </div>
                      </div>
                    </div>

                    <Chip tone={isOn ? "ok" : "neutral"}>{isOn ? "Selected" : "Select"}</Chip>
                  </button>
                );
              })
            )}
          </div>
        </Panel>

        <Panel meta="Binding" title="Bind τ/W to baseline timeline" right={<Chip tone="accent"><Link2 size={14}/> ruler</Chip>}>
          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Case definition</div>
            <div className="text" style={{ marginTop: 8 }}>
              τ: <b>{theCase.definition?.tau || "—"}</b> · W: <b>{theCase.definition?.W || "—"}</b>
            </div>
          </div>

          <div className="hr" />

          {!selected ? (
            <div className="text">Select a baseline run to continue.</div>
          ) : (
            <div className="box" style={{ padding: 14 }}>
              <div className="kicker">Selected baseline</div>
              <div className="text" style={{ marginTop: 8 }}>
                <b>{selected.label}</b>
              </div>
              <div className="row" style={{ flexWrap: "wrap", marginTop: 12 }}>
                <button className="btn" onClick={() => onGo(`/runs/${selected.id}/timeline`)}>
                  <span className="row" style={{ gap: 8 }}>
                    <CalendarClock size={14} /> View run timeline
                  </span>
                </button>
                <button className="btn btn--primary" onClick={() => onGo(`/cases/${theCase.id}/triggers`)}>
                  <span className="row" style={{ gap: 8 }}>
                    <ChevronRight size={14} /> Go to triggers
                  </span>
                </button>
              </div>
            </div>
          )}

          <div className="hr" />

          <div className="text">
            Why together: timeline alone is fine, but the Case must claim the baseline and bind it to τ/W or you get “choose-your-own ruler.”
          </div>
        </Panel>
      </div>
    </div>
  );
}

export default CaseBaselinePage;