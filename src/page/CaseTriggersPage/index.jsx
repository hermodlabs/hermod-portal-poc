import React from "react";

import {
  Header,
  Panel,
  Chip,
} from "../../component";

import {
  parseWindowToMin,
  clampInt,
} from "../../algorithms";

import {
  ArrowLeft,
  CalendarClock,
  Link2,
  Waves,
  ListChecks,
} from "lucide-react";

export function CaseTriggersPage({ data, setData, onGo, theCase }) {
  if (!theCase) {
    return (
      <Panel meta="Error" title="Case not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">No case object to show triggers for.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/cases")}>Back</button>
      </Panel>
    );
  }

  const baseline = data.runs.find((r) => r.id === theCase.baselineRunId);
  const binding = theCase.triggerBinding || {
    tau: theCase.definition?.tau || "Door cycle",
    windowMin: parseWindowToMin(theCase.definition?.W) || 15,
    anchorPolicy: "event-linked",
  };

  function updateBinding(patch) {
    setData((d) => ({
      ...d,
      cases: d.cases.map((c) =>
        c.id === theCase.id ? { ...c, triggerBinding: { ...(c.triggerBinding || binding), ...patch } } : c
      ),
    }));
  }

  const events = baseline?.timeline || [];
  const matched = events.filter((e) => e.label === binding.tau);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/cases/${theCase.id}/triggers`}
        title="Triggers (event-anchored ruler)"
        subtitle="Slice 3: the Case binds its τ/W to the baseline run timeline so comparisons are anchored to the same kind of moment."
        right={
          <div className="row" style={{ flexWrap: "wrap" }}>
            <Chip tone="accent">
              <Waves size={14} /> event-linked
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
        <Panel meta="Binding" title="Anchor settings" right={<Chip tone="accent">τ/W</Chip>}>
          <div style={{ display: "grid", gap: 12 }}>
            <div className="box" style={{ padding: 14 }}>
              <div className="kicker">Baseline run</div>
              <div style={{ fontWeight: 750, marginTop: 8 }}>{baseline ? baseline.label : "— (none selected)"}</div>
              <div className="text" style={{ marginTop: 8 }}>
                {baseline ? `run ${baseline.id}` : "Select a baseline run first."}
              </div>
              <div className="row" style={{ flexWrap: "wrap", marginTop: 12 }}>
                <button className="btn" onClick={() => onGo(`/cases/${theCase.id}/baseline`)}>
                  <span className="row" style={{ gap: 8 }}>
                    <ListChecks size={14} /> Change baseline
                  </span>
                </button>
                {baseline && (
                  <button className="btn" onClick={() => onGo(`/runs/${baseline.id}/timeline`)}>
                    <span className="row" style={{ gap: 8 }}>
                      <CalendarClock size={14} /> View timeline
                    </span>
                  </button>
                )}
              </div>
            </div>

            <label className="label" style={{ marginTop: 0 }}>
              <div className="stat-label">τ — Trigger name (must match timeline label)</div>
              <input
                className="input"
                value={binding.tau}
                onChange={(e) => updateBinding({ tau: e.target.value })}
                placeholder='e.g., "Door cycle"'
                disabled={!baseline}
              />
            </label>

            <label className="label" style={{ marginTop: 0 }}>
              <div className="stat-label">W — Window length (minutes)</div>
              <input
                className="input"
                value={binding.windowMin}
                onChange={(e) => updateBinding({ windowMin: clampInt(e.target.value, 1, 240) })}
                disabled={!baseline}
              />
            </label>

            <div className="box" style={{ padding: 14 }}>
              <div className="kicker">Anchor policy</div>
              <div className="row" style={{ justifyContent: "space-between", marginTop: 10 }}>
                <Chip tone="accent">
                  <Link2 size={14} /> event-linked
                </Chip>
                <Chip tone="neutral">wall-clock (deferred)</Chip>
              </div>
              <div className="text" style={{ marginTop: 10 }}>
                We only ship event-linked in Slice 3. Wall-clock is how dashboards sneak “borrowed confidence” back in.
              </div>
            </div>
          </div>
        </Panel>

        <Panel meta="Preview" title="What this selects" right={<Chip>{matched.length}</Chip>}>
          {!baseline ? (
            <div className="text">No baseline selected. Choose one first.</div>
          ) : (
            <>
              <div className="box" style={{ padding: 14 }}>
                <div className="kicker">Slice sentence (ruler)</div>
                <div className="text" style={{ marginTop: 8 }}>
                  <b>
                    Measure {binding.windowMin}m after each <span style={{ opacity: 0.9 }}>{binding.tau}</span> event.
                  </b>
                </div>
              </div>

              <div className="hr" />

              <div className="box" style={{ padding: 14 }}>
                <div className="kicker">Matched events in baseline</div>
                <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
                  {matched.length === 0 ? (
                    <div className="text">
                      No matching events. (This is good demo friction: if τ doesn’t match the timeline, you can’t pretend it does.)
                    </div>
                  ) : (
                    matched.slice(0, 6).map((e) => (
                      <div key={e.id} className="eventRow">
                        <div className="row" style={{ gap: 10 }}>
                          <div className="taskIcon" style={{ width: 34, height: 34 }}>
                            <Waves size={16} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 750 }}>{e.label}</div>
                            <div className="kicker" style={{ marginTop: 4 }}>
                              anchor @ {e.t} · window: +{binding.windowMin}m
                            </div>
                          </div>
                        </div>
                        <Chip tone={e.severity > 0.66 ? "warn" : "neutral"}>{Math.round(e.severity * 100)}%</Chip>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="hr" />

              <div className="box" style={{ padding: 14 }}>
                <div className="kicker">Why it matters</div>
                <div className="text" style={{ marginTop: 8 }}>
                  Meetings hate ambiguity. This makes ambiguity a state: if τ doesn’t exist, the ruler doesn’t exist.
                  That’s how you avoid storytime.
                </div>
              </div>
            </>
          )}
        </Panel>
      </div>
    </div>
  );
}

export default CaseTriggersPage;