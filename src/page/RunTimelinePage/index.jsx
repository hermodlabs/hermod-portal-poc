import React, { useState } from "react";

import {
  Header,
  Panel,
  Chip,
} from "../../component";

import {
  cx,
  makeId,
} from "../../algorithms";

import {
  ArrowLeft,
  CalendarClock,
  Link2,
} from "lucide-react";

export function RunTimelinePage({ data, setData, onGo, run }) {
  if (!run) {
    return (
      <Panel meta="Error" title="Run not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">No run object to show timeline for.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/runs/new")}>Create run</button>
      </Panel>
    );
  }

  const events = run.timeline || [];
  const [filter, setFilter] = useState("all"); // all/door/hvac/note/intervention

  const shown = events.filter((e) => (filter === "all" ? true : e.type === filter));

  function addEvent(type) {
    const id = makeId("ev");
    const t = `${String(6 + Math.floor(Math.random() * 13)).padStart(2, "0")}:${String(
      Math.floor(Math.random() * 6) * 10
    ).padStart(2, "0")}`;
    const label =
      type === "door"
        ? "Door cycle"
        : type === "hvac"
        ? "HVAC cycle"
        : type === "intervention"
        ? "Intervention log"
        : "Operator note";

    const ev = { id, t, type, label, severity: Math.round((0.2 + Math.random() * 0.7) * 100) / 100 };

    setData((d) => ({
      ...d,
      runs: d.runs.map((x) => (x.id === run.id ? { ...x, timeline: [...(x.timeline || []), ev] } : x)),
    }));
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/runs/${run.id}/timeline`}
        title="Run timeline"
        subtitle="Slice 3: the default ruler is event-linked windows, not wall-clock averages."
        right={
          <div className="row" style={{ flexWrap: "wrap" }}>
            <Chip tone="accent">
              <CalendarClock size={14} /> events
            </Chip>
            <button className="btn" onClick={() => onGo(`/runs/${run.id}/provenance`)}>
              <span className="row" style={{ gap: 8 }}>
                <ArrowLeft size={14} /> Back
              </span>
            </button>
          </div>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.2fr 0.8fr" }}>
        <Panel meta="Stream" title="Events" right={<Chip>{events.length}</Chip>}>
          <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
            <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
              <button className={cx("btn", filter === "all" && "btn--primary")} onClick={() => setFilter("all")}>
                All
              </button>
              <button className={cx("btn", filter === "door" && "btn--primary")} onClick={() => setFilter("door")}>
                Door
              </button>
              <button className={cx("btn", filter === "hvac" && "btn--primary")} onClick={() => setFilter("hvac")}>
                HVAC
              </button>
              <button
                className={cx("btn", filter === "intervention" && "btn--primary")}
                onClick={() => setFilter("intervention")}
              >
                Intervention
              </button>
              <button className={cx("btn", filter === "note" && "btn--primary")} onClick={() => setFilter("note")}>
                Notes
              </button>
            </div>

            <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
              <button className="btn" onClick={() => addEvent("door")}>+ Door</button>
              <button className="btn" onClick={() => addEvent("hvac")}>+ HVAC</button>
              <button className="btn" onClick={() => addEvent("intervention")}>+ Intervention</button>
            </div>
          </div>

          <div className="hr" />

          <div style={{ display: "grid", gap: 10 }}>
            {shown.length === 0 ? (
              <div className="text">No events in this filter.</div>
            ) : (
              shown
                .slice()
                .sort((a, b) => (a.t > b.t ? 1 : -1))
                .map((e) => (
                  <div key={e.id} className="eventRow">
                    <div className="row" style={{ gap: 10 }}>
                      <div className="taskIcon" style={{ width: 34, height: 34 }}>
                        <CalendarClock size={16} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 750 }}>{e.label}</div>
                        <div className="kicker" style={{ marginTop: 4 }}>
                          {e.t} · type: {e.type}
                        </div>
                      </div>
                    </div>
                    <Chip tone={e.severity > 0.66 ? "warn" : "neutral"}>{Math.round(e.severity * 100)}%</Chip>
                  </div>
                ))
            )}
          </div>
        </Panel>

        <Panel meta="Why" title="Event-linked windows" right={<Chip tone="accent"><Link2 size={14}/> ruler</Chip>}>
          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">The default ruler</div>
            <div className="text" style={{ marginTop: 8 }}>
              If you measure “after the trigger” you can compare apples-to-apples.
              If you measure wall-clock averages, you get storytime.
            </div>
          </div>
          <div className="hr" />
          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Slice 3 constraint</div>
            <div className="text" style={{ marginTop: 8 }}>
              The Case must claim a baseline run, then bind to τ/W from the case definition.
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

export default RunTimelinePage;