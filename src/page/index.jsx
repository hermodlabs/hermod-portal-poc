import React, { useMemo, useState } from "react";

import {
  Header,
  Panel,
  Chip,
  Stat
} from "../component";

import {
  CRITICAL_GATES,
  cx,
  riskColor,
  scorePocket,
  parseWindowToMin,
  clampInt,
  comparabilityChecklist,
  compareSummary,
  verdictFrom,
  makeId,
  gateTone,
  gateIcon,
  gateLabel,
  prettyGateName,
  computeAbstain,
  getSiteRoomLabel,
} from "../algorithms";

import {
  BadgeCheck,
  Building2,
  DoorOpen,
  Grid3X3,
  Home,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Settings,
  ShieldCheck,
  UserPlus,
  Users,
  Wrench,
  ArrowRight,
  ClipboardList,
  FilePlus2,
  Tag,
  Timer,
  Layers,
  Ban,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
  ShieldX,
  UploadCloud,
  FileText,
  Fingerprint,
  Database,
  ClipboardCheck,
  ArrowLeft,
  CalendarClock,
  Link2,
  Waves,
  ListChecks,
  ChevronRight,
  Map as MapIcon,
  MapPin,
  Layers as LayersIcon,
  ListOrdered,
  Compass,
  Target,
  GitCompare, 
  Gavel, 
  XCircle, 
  FileOutput, 
  FolderArchive, 
  FileSearch, 
  FileDown, 
  ClipboardSignature 
} from "lucide-react";

export {CaseDefinePage} from "./CaseDefinePage";
export {CaseDetailPage} from "./CaseDetailPage";
export {CaseEvidencePage} from "./CaseEvidencePage";
export {CaseNewPage} from "./CaseNewPage";
export {CasesListPage} from "./CasesListPage";
export {OverviewPage} from "./OverviewPage";
export {ReceiptDetailPage} from "./ReceiptDetailPage";
export {ReceiptsIndexPage} from "./ReceiptsIndexPage";
export {RoomDetailPage} from "./RoomDetailPage";
export {RoomsPage} from "./RoomsPage";
export {RoomSummaryPage} from "./RoomSummaryPage";
export {RunNewPage} from "./RunNewPage";
export {RunProvenancePage} from "./RunProvenancePage";
export {RunReceiptsPage} from "./RunReceiptsPage";
export {RunValidityPage} from "./RunValidityPage";
export {SettingsRolesPage} from "./SettingsRolesPage";
export {SettingsUsersPage} from "./SettingsUsersPage";
export {SiteDetailPage} from "./SiteDetailPage";
export {SitesPage} from "./SitesPage";



































/* =========================================================
   I) UI WIDGETS — add these small components near your atoms
   ========================================================= */

function GateRow({ name, value }) {
  const Icon = gateIcon(value);
  return (
    <div className="gateRow">
      <div className="row" style={{ gap: 10 }}>
        <div className="taskIcon" style={{ width: 34, height: 34 }}>
          <Icon size={16} />
        </div>
        <div>
          <div style={{ fontWeight: 700 }}>{name}</div>
          <div className="kicker" style={{ marginTop: 4 }}>
            {name.includes("Sensor") ? "If unknown → ABSTAIN downstream" : "Contributes to validity posture"}
          </div>
        </div>
      </div>
      <Chip tone={gateTone(value)}>{gateLabel(value)}</Chip>
    </div>
  );
}

function GateEditorRow({ k, v, onChange }) {
  return (
    <div className="gateRow">
      <div>
        <div style={{ fontWeight: 700 }}>{prettyGateName(k)}</div>
        <div className="kicker" style={{ marginTop: 4 }}>
          {CRITICAL_GATES.includes(k) ? "Critical (drives ABSTAIN)" : "Secondary (still matters)"}
        </div>
      </div>

      <div className="row" style={{ gap: 10 }}>
        <select className="gateSelect" value={v} onChange={(e) => onChange(e.target.value)}>
          <option value="pass">Pass</option>
          <option value="unknown">Unknown</option>
          <option value="fail">Fail</option>
        </select>
        <Chip tone={gateTone(v)}>{gateLabel(v)}</Chip>
      </div>
    </div>
  );
}


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

export function RoomLayoutPage({ data, setData, onGo, site, room, layout }) {
  if (!site || !room) {
    return (
      <Panel meta="Error" title="Room not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">Need a site + room to show layout.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/sites")}>Back</button>
      </Panel>
    );
  }

  const L =
    layout ||
    (data.layouts || []).find((x) => x.siteId === site.id && x.roomId === room.id) ||
    null;

  const pocketsForRoom = (data.runPockets || []).filter((p) => p.siteId === site.id && p.roomId === room.id);
  const top = pocketsForRoom
    .slice()
    .sort((a, b) => scorePocket(b) - scorePocket(a))
    .slice(0, 3);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/sites/${site.id}/rooms/${room.id}/layout`}
        title="Room layout (baseline)"
        subtitle="Slice 4: layout anchors “where.” Zones + landmarks make pockets walkable."
        right={
          <div className="row" style={{ flexWrap: "wrap" }}>
            <Chip tone="accent">
              <Compass size={14} /> anchor
            </Chip>
            <button className="btn" onClick={() => onGo(`/sites/${site.id}/rooms/${room.id}`)}>
              <span className="row" style={{ gap: 8 }}>
                <ArrowLeft size={14} /> Back
              </span>
            </button>
          </div>
        }
      />

      {!L ? (
        <Panel meta="Missing" title="No layout yet" right={<Chip tone="warn">placeholder</Chip>}>
          <div className="text">
            Create a layout baseline for this room so pockets can be anchored.
          </div>
        </Panel>
      ) : (
        <div className="grid-2" style={{ gridTemplateColumns: "1.2fr 0.8fr" }}>
          <Panel meta="Map" title={`${room.name} layout`} right={<Chip>{L.grid.w}×{L.grid.h}</Chip>}>
            <LayoutMap
              w={L.grid.w}
              h={L.grid.h}
              zones={L.zones}
              landmarks={L.landmarks}
              pockets={top}
            />
            <div className="hr" />
            <div className="text">
              Zones are baseline segments; landmarks are operator reality. Together they make “walk-to-this-spot” possible.
            </div>
          </Panel>

          <Panel meta="Top pockets" title="Ranked (room)" right={<Chip tone="accent">{top.length}</Chip>}>
            {top.length === 0 ? (
              <div className="text">No pockets for this room yet. Run a scan (Slice 4 on a run).</div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {top.map((p) => (
                  <PocketCard
                    key={p.id}
                    pocket={p}
                    onClick={() => onGo(`/runs/${p.runId}/pockets`)}
                    hint="Open run pockets"
                  />
                ))}
              </div>
            )}
            <div className="hr" />
            <button className="btn btn--primary" onClick={() => onGo(`/cases/${findCaseForRoom(data, site.id, room.id) || "case-001"}/pockets`)}>
              <span className="row" style={{ gap: 8 }}>
                <ListOrdered size={14} /> Go to case pockets
              </span>
            </button>
          </Panel>
        </div>
      )}
    </div>
  );
}

export function CasePocketsPage({ data, setData, onGo, theCase }) {
  if (!theCase) {
    return (
      <Panel meta="Error" title="Case not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">Need a case object to show pockets.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/cases")}>Back</button>
      </Panel>
    );
  }

  const layout = (data.layouts || []).find((l) => l.siteId === theCase.siteId && l.roomId === theCase.roomId) || null;
  const baselineRun = data.runs.find((r) => r.id === theCase.baselineRunId) || null;

  // Source of truth: run pockets (use baseline run if present; else evidence run)
  const sourceRunId = baselineRun?.id || theCase.evidenceRunId;
  const pockets = (data.runPockets || [])
    .filter((p) => p.runId === sourceRunId)
    .slice()
    .sort((a, b) => scorePocket(b) - scorePocket(a));

  const top = pockets.slice(0, 6);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/cases/${theCase.id}/pockets`}
        title="Pockets (ranked + walkable)"
        subtitle="Slice 4: ranked list + anchored map. No map = not walkable. No rank = not actionable."
        right={
          <div className="row" style={{ flexWrap: "wrap" }}>
            <Chip tone="accent">
              <MapPin size={14} /> walk-to
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
        <Panel meta="Map" title="Pocket map" right={<Chip tone={layout ? "ok" : "warn"}>{layout ? "anchored" : "missing layout"}</Chip>}>
          {!layout ? (
            <div className="box" style={{ padding: 14 }}>
              <div className="kicker">Layout required</div>
              <div className="text" style={{ marginTop: 8 }}>
                You can’t walk to a pocket without a layout anchor. Create/visit:
                <div style={{ marginTop: 10 }}>
                  <button className="btn btn--primary" onClick={() => onGo(`/sites/${theCase.siteId}/rooms/${theCase.roomId}/layout`)}>
                    <span className="row" style={{ gap: 8 }}>
                      <MapIcon size={14} /> Open room layout
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <LayoutMap
              w={layout.grid.w}
              h={layout.grid.h}
              zones={layout.zones}
              landmarks={layout.landmarks}
              pockets={top}
              onPocketClick={(p) => onGo(`/runs/${p.runId}/pockets`)}
            />
          )}

          <div className="hr" />

          <div className="row" style={{ flexWrap: "wrap" }}>
            <button className="btn" onClick={() => onGo(`/sites/${theCase.siteId}/rooms/${theCase.roomId}/layout`)}>
              <span className="row" style={{ gap: 8 }}>
                <Compass size={14} /> Layout
              </span>
            </button>

            {sourceRunId && (
              <button className="btn" onClick={() => onGo(`/runs/${sourceRunId}/map`)}>
                <span className="row" style={{ gap: 8 }}>
                  <MapIcon size={14} /> Run map
                </span>
              </button>
            )}

            {sourceRunId && (
              <button className="btn" onClick={() => onGo(`/runs/${sourceRunId}/pockets`)}>
                <span className="row" style={{ gap: 8 }}>
                  <ListOrdered size={14} /> Run pockets
                </span>
              </button>
            )}
          </div>
        </Panel>

        <Panel meta="Ranked" title="Pocket list (actionable)" right={<Chip>{pockets.length}</Chip>}>
          {pockets.length === 0 ? (
            <div className="text">No pockets yet for the selected run. Add pockets to /runs/:runId/pockets.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {pockets.map((p) => (
                <PocketCard
                  key={p.id}
                  pocket={p}
                  onClick={() => onGo(`/runs/${p.runId}/pockets`)}
                  hint="Open run pockets"
                />
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

export function RunPocketsPage({ data, setData, onGo, run }) {
  if (!run) {
    return (
      <Panel meta="Error" title="Run not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">Need a run object to show pockets.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/runs/new")}>Create run</button>
      </Panel>
    );
  }

  const layout = (data.layouts || []).find((l) => l.siteId === run.siteId && l.roomId === run.roomId) || null;

  const pockets = (data.runPockets || [])
    .filter((p) => p.runId === run.id)
    .slice()
    .sort((a, b) => scorePocket(b) - scorePocket(a));

  function addPocket() {
    const id = makeId("p");
    const x = 2 + Math.floor(Math.random() * 16);
    const y = 2 + Math.floor(Math.random() * 8);
    const p = {
      id,
      runId: run.id,
      roomId: run.roomId,
      siteId: run.siteId,
      label: `P-${String(1 + pockets.length).padStart(2, "0")}`,
      title: "New pocket (log)",
      x,
      y,
      severity: Math.round((0.35 + Math.random() * 0.6) * 100) / 100,
      persistenceMin: 10 + Math.floor(Math.random() * 55),
      repeatability: Math.round((0.35 + Math.random() * 0.6) * 100) / 100,
      trigger: "Door cycle",
      note: "Logged in demo.",
      rec: "Add temporary sensor; re-check on comparable trigger window.",
    };

    setData((d) => ({ ...d, runPockets: [p, ...(d.runPockets || [])] }));
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/runs/${run.id}/pockets`}
        title="Run pockets (source of truth)"
        subtitle="Slice 4: pockets originate on a run, then cases consume them. Rank + anchor makes it operational."
        right={
          <div className="row" style={{ flexWrap: "wrap" }}>
            <Chip tone="accent">
              <Target size={14} /> pockets
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
        <Panel meta="Map" title="Overlay (top pockets)" right={<Chip tone={layout ? "ok" : "warn"}>{layout ? "anchored" : "needs layout"}</Chip>}>
          {!layout ? (
            <div className="box" style={{ padding: 14 }}>
              <div className="kicker">Layout required</div>
              <div className="text" style={{ marginTop: 8 }}>
                Create/visit layout to make pockets walkable.
              </div>
              <div className="hr" />
              <button className="btn btn--primary" onClick={() => onGo(`/sites/${run.siteId}/rooms/${run.roomId}/layout`)}>
                <span className="row" style={{ gap: 8 }}>
                  <MapIcon size={14} /> Open layout
                </span>
              </button>
            </div>
          ) : (
            <LayoutMap
              w={layout.grid.w}
              h={layout.grid.h}
              zones={layout.zones}
              landmarks={layout.landmarks}
              pockets={pockets.slice(0, 6)}
            />
          )}

          <div className="hr" />

          <div className="row" style={{ flexWrap: "wrap" }}>
            <button className="btn" onClick={() => onGo(`/runs/${run.id}/map`)}>
              <span className="row" style={{ gap: 8 }}>
                <MapIcon size={14} /> Run map
              </span>
            </button>
            <button className="btn btn--primary" onClick={addPocket}>
              <span className="row" style={{ gap: 8 }}>
                <MapPin size={14} /> Add pocket
              </span>
            </button>
          </div>
        </Panel>

        <Panel meta="Ranked" title="Pocket list" right={<Chip>{pockets.length}</Chip>}>
          {pockets.length === 0 ? (
            <div className="text">No pockets yet. Add one to demonstrate the list→map coupling.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {pockets.map((p) => (
                <PocketCard key={p.id} pocket={p} onClick={() => onGo(`/runs/${run.id}/map`)} hint="Open map" />
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

export function RunMapPage({ data, setData, onGo, run }) {
  if (!run) {
    return (
      <Panel meta="Error" title="Run not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">Need a run object to show map.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/runs/new")}>Create run</button>
      </Panel>
    );
  }

  const layout = (data.layouts || []).find((l) => l.siteId === run.siteId && l.roomId === run.roomId) || null;
  const map = (data.runMaps || []).find((m) => m.runId === run.id) || null;
  const pockets = (data.runPockets || []).filter((p) => p.runId === run.id).slice().sort((a,b)=>scorePocket(b)-scorePocket(a));

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/runs/${run.id}/map`}
        title="Run map (field + pockets)"
        subtitle="Slice 4 optional route: run-derived field map. Still anchored by layout + pockets."
        right={
          <div className="row" style={{ flexWrap: "wrap" }}>
            <Chip tone="accent">
              <MapIcon size={14} /> map
            </Chip>
            <button className="btn" onClick={() => onGo(`/runs/${run.id}/provenance`)}>
              <span className="row" style={{ gap: 8 }}>
                <ArrowLeft size={14} /> Back
              </span>
            </button>
          </div>
        }
      />

      <Panel meta="Field" title="Map view" right={<Chip tone={layout ? "ok" : "warn"}>{layout ? "anchored" : "needs layout"}</Chip>}>
        {!layout ? (
          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Layout required</div>
            <div className="text" style={{ marginTop: 8 }}>
              Without layout, the map can’t tell you where to walk.
            </div>
            <div className="hr" />
            <button className="btn btn--primary" onClick={() => onGo(`/sites/${run.siteId}/rooms/${run.roomId}/layout`)}>
              <span className="row" style={{ gap: 8 }}>
                <Compass size={14} /> Open layout
              </span>
            </button>
          </div>
        ) : (
          <FieldMap
            w={layout.grid.w}
            h={layout.grid.h}
            field={map?.field}
            pockets={pockets.slice(0, 8)}
          />
        )}

        <div className="hr" />

        <div className="row" style={{ flexWrap: "wrap" }}>
          <button className="btn" onClick={() => onGo(`/runs/${run.id}/pockets`)}>
            <span className="row" style={{ gap: 8 }}>
              <ListOrdered size={14} /> Pockets
            </span>
          </button>
          {run.caseId && (
            <button className="btn" onClick={() => onGo(`/cases/${run.caseId}/pockets`)}>
              <span className="row" style={{ gap: 8 }}>
                <MapPin size={14} /> Case pockets
              </span>
            </button>
          )}
        </div>
      </Panel>
    </div>
  );
}

/* =========================================================
   G) COMPONENTS — map renderers + pocket card
   ========================================================= */

function LayoutMap({ w, h, zones = [], landmarks = [], pockets = [], onPocketClick }) {
  // simple CSS grid; zones are translucent overlays; pockets are pins
  return (
    <div className="layoutMap" style={{ gridTemplateColumns: `repeat(${w}, minmax(0, 1fr))` }}>
      {Array.from({ length: w * h }).map((_, i) => (
        <div key={i} className="cell2" />
      ))}

      {/* zones */}
      {zones.map((z) => (
        <div
          key={z.id}
          className="zoneBox"
          style={{
            gridColumn: `${z.x0 + 1} / ${z.x1 + 2}`,
            gridRow: `${z.y0 + 1} / ${z.y1 + 2}`,
          }}
          title={`${z.id} · ${z.label}`}
        >
          <div className="zoneLabel">{z.id}</div>
        </div>
      ))}

      {/* landmarks */}
      {landmarks.map((lm) => (
        <div
          key={lm.id}
          className="lm"
          style={{ gridColumn: lm.x + 1, gridRow: lm.y + 1 }}
          title={lm.label}
        >
          <span className="lmDot" />
        </div>
      ))}

      {/* pockets */}
      {pockets.map((p) => (
        <button
          key={p.id}
          className="pocketPin"
          style={{ gridColumn: p.x + 1, gridRow: p.y + 1 }}
          title={`${p.label} · ${p.title}`}
          onClick={() => onPocketClick && onPocketClick(p)}
        >
          <span className="pinDot" />
        </button>
      ))}
    </div>
  );
}

function FieldMap({ w, h, field, pockets = [] }) {
  const F = field || Array.from({ length: h }, () => Array.from({ length: w }, () => 0.25));
  return (
    <div className="layoutMap" style={{ gridTemplateColumns: `repeat(${w}, minmax(0, 1fr))` }}>
      {F.flatMap((row, y) =>
        row.map((v, x) => (
          <div
            key={`${x}-${y}`}
            className="cell2"
            style={{ background: riskColor(v) }}
            title={`risk ${(v * 100).toFixed(0)}%`}
          />
        ))
      )}

      {pockets.map((p) => (
        <div
          key={p.id}
          className="pocketPin pocketPin--static"
          style={{ gridColumn: p.x + 1, gridRow: p.y + 1 }}
          title={`${p.label} · ${p.title}`}
        >
          <span className="pinDot" />
        </div>
      ))}
    </div>
  );
}


function PocketCard({ pocket, onClick, hint }) {
  return (
    <button className="taskRow" onClick={onClick}>
      <div className="row" style={{ gap: 10 }}>
        <div className="taskIcon">
          <MapPin size={16} />
        </div>
        <div style={{ textAlign: "left" }}>
          <div style={{ fontWeight: 750 }}>
            {pocket.label} · {pocket.title}
          </div>
          <div className="kicker" style={{ marginTop: 4 }}>
            trigger: {pocket.trigger} · persist: {pocket.persistenceMin}m · repeat: {Math.round((pocket.repeatability || 0) * 100)}%
          </div>
          <div className="text" style={{ marginTop: 8, color: "var(--muted)" }}>
            {pocket.note}
          </div>
        </div>
      </div>

      <div className="row" style={{ gap: 10 }}>
        <Chip tone={pocket.severity > 0.75 ? "warn" : "neutral"}>{Math.round(pocket.severity * 100)}%</Chip>
        <span className="taskHint">
          {hint || "Open"} <ArrowRight size={14} />
        </span>
      </div>
    </button>
  );
}

function findCaseForRoom(data, siteId, roomId) {
  return (data.cases || []).find((c) => c.siteId === siteId && c.roomId === roomId)?.id || null;
}


export function CaseVerdictPage({ data, setData, onGo, theCase, engine }) {
  if (!theCase) {
    return (
      <Panel meta="Error" title="Case not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">Need a case to verdict.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/cases")}>Back</button>
      </Panel>
    );
  }

  const baselineRun = data.runs.find((r) => r.id === theCase.baselineRunId) || null;
  const verificationRun = data.runs.find((r) => r.id === theCase.verificationRunId) || null;

  const checklist = comparabilityChecklist(theCase, baselineRun, verificationRun);
  const compareOk = checklist.every((x) => x.pass);

  const summary =
    baselineRun && verificationRun ? compareSummary(data, baselineRun, verificationRun) : null;

  const computed = summary
    ? verdictFrom(compareOk, summary)
    : { status: "ABSTAIN", label: "ABSTAIN", reasons: ["Missing baseline or verification run."] };

  const locked = theCase.verdict;

  function setVerdict() {
    if (!engine) return;

    // ✅ canonical mutation path
    // engine should stamp time + emit telemetry; it can also recompute internally
    engine.setCaseVerdict(theCase.id);

    // If you haven't implemented engine.setCaseVerdict yet, temporary fallback:
    // setData((d) => ({
    //   ...d,
    //   cases: d.cases.map((c) =>
    //     c.id === theCase.id ? { ...c, verdict: { ...computed, when: "Now" } } : c
    //   ),
    // }));
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/cases/${theCase.id}/verdict`}
        title="Verdict"
        subtitle="Slice 5: verdict is non-arguable. Either “Repeatable once (CONFIDENT)” or ABSTAIN with reasons."
        right={
          <Chip tone={computed.status === "CONFIDENT" ? "ok" : "bad"}>
            <Gavel size={14} /> {computed.status === "CONFIDENT" ? "CONFIDENT" : "ABSTAIN"}
          </Chip>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.2fr 0.8fr" }}>
        <Panel meta="Inputs" title="What the verdict is allowed to use" right={<Chip tone="accent">Slice 5</Chip>}>
          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Baseline</div>
            <div className="text" style={{ marginTop: 8 }}>
              {baselineRun ? baselineRun.label : "— (none)"}
            </div>
          </div>

          <div className="box" style={{ padding: 14, marginTop: 12 }}>
            <div className="kicker">Verification</div>
            <div className="text" style={{ marginTop: 8 }}>
              {verificationRun ? verificationRun.label : "— (none)"}
            </div>
          </div>

          <div className="hr" />

          <div className="row" style={{ flexWrap: "wrap" }}>
            <button className="btn" onClick={() => onGo(`/cases/${theCase.id}/verify`)}>
              <span className="row" style={{ gap: 8 }}>
                <GitCompare size={14} /> Back to verify
              </span>
            </button>

            {baselineRun && verificationRun && (
              <button
                className="btn"
                onClick={() => onGo(`/runs/compare?left=${baselineRun.id}&right=${verificationRun.id}`)}
              >
                <span className="row" style={{ gap: 8 }}>
                  <GitCompare size={14} /> Open compare
                </span>
              </button>
            )}
          </div>

          <div className="hr" />

          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Comparability</div>
            <div className="text" style={{ marginTop: 8 }}>
              {compareOk ? "PASS" : "FAIL"} — if fail, verdict must ABSTAIN (not warn).
            </div>
          </div>

          <div className="hr" />

          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Checklist</div>
            {!verificationRun ? (
              <div className="text" style={{ marginTop: 8 }}>
                Select a verification run to evaluate comparability.
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
                {checklist.map((c) => (
                  <div key={c.key} className="gateRow">
                    <div>
                      <div style={{ fontWeight: 750 }}>{c.label}</div>
                      {!c.pass && <div className="kicker" style={{ marginTop: 4 }}>{c.whyFail}</div>}
                    </div>
                    <Chip tone={c.pass ? "ok" : "bad"}>
                      {c.pass ? <BadgeCheck size={14} /> : <XCircle size={14} />} {c.pass ? "Pass" : "Fail"}
                    </Chip>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Panel>

        <Panel
          meta="Output"
          title="Verdict decision"
          right={<Chip tone={computed.status === "CONFIDENT" ? "ok" : "bad"}>{computed.label}</Chip>}
        >
          {computed.status === "CONFIDENT" ? (
            <div className="box" style={{ padding: 14, border: "1px solid rgba(34,197,94,0.20)" }}>
              <div className="kicker">Repeatable once (CONFIDENT)</div>
              <div className="text" style={{ marginTop: 8 }}>
                Verdict can only be set when comparability passes and evidence shows improvement on the comparable ruler.
              </div>
            </div>
          ) : (
            <AbstainBanner
              reasons={computed.reasons}
              body={
                <div className="text" style={{ marginTop: 8 }}>
                  This is not “being cautious.” It’s being clean: missing comparability or incomplete evidence blocks claims.
                </div>
              }
            />
          )}

          <div className="hr" />

          <div className="row" style={{ flexWrap: "wrap" }}>
            <button
              className="btn btn--primary"
              disabled={!engine || Boolean(locked?.status)}
              onClick={setVerdict}
              title={
                !engine
                  ? "Engine missing (pass engine as prop)"
                  : locked
                  ? "Verdict already set (POC lock). In production, this is versioned."
                  : "Set verdict"
              }
            >
              <span className="row" style={{ gap: 8 }}>
                <Gavel size={14} /> Set verdict
              </span>
            </button>
          </div>

          {locked && (
            <div className="box" style={{ padding: 14, marginTop: 12 }}>
              <div className="kicker">Current verdict (stored)</div>
              <div style={{ fontWeight: 800, marginTop: 8 }}>{locked.label}</div>
              <div className="kicker" style={{ marginTop: 6 }}>{locked.when}</div>
            </div>
          )}

          {!baselineRun || !verificationRun ? (
            <div className="box" style={{ padding: 14, marginTop: 12 }}>
              <div className="kicker">Missing inputs</div>
              <div className="text" style={{ marginTop: 8 }}>
                Select a baseline and a verification run before you can set a verdict.
              </div>
            </div>
          ) : null}
        </Panel>
      </div>
    </div>
  );
}

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

export function ReportsIndexPage({ data, onGo }) {
  const reports = (data.reports || []).slice();

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker="/reports"
        title="Reports"
        subtitle="Index of generated readout packs. Each report must support view + export + frozen receipts."
        right={
          <Chip tone="accent">
            <FolderArchive size={14} /> {reports.length}
          </Chip>
        }
      />

      <Panel meta="Index" title="All reports" right={<Chip>POC</Chip>}>
        {reports.length === 0 ? (
          <div className="text">No reports yet. Create one from a Case readout page.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {reports.map((r) => (
              <button key={r.id} className="taskRow" onClick={() => onGo(`/reports/${r.id}/view`)}>
                <div className="row" style={{ gap: 10 }}>
                  <div className="taskIcon">
                    <FolderArchive size={16} />
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontWeight: 750 }}>{r.title}</div>
                    <div className="kicker" style={{ marginTop: 4 }}>
                      {r.id} · case {r.caseId} · {r.status}
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
  );
}

export function ReportNewPage({ data, setData, onGo, caseId }) {
  const theCase = (data.cases || []).find((c) => c.id === caseId) || null;
  const [title, setTitle] = useState(theCase ? `Pilot Readout — ${theCase.title}` : "Pilot Readout — Top Findings");

  function createReport() {
    const id = makeId("rep");
    const rep = {
      id,
      caseId: theCase?.id || null,
      title: title.trim() || "Pilot Readout",
      createdAt: "Now",
      owner: theCase?.owner || "Operator",
      status: "draft",
      topFindings: [],
      keyResult: "",
      nextSteps: [],
      frozenReceiptIds: [],
      baselineRunId: theCase?.baselineRunId || null,
      verificationRunId: theCase?.verificationRunId || null,
      verdictSnapshot: null,
    };

    setData((d) => ({
      ...d,
      reports: [rep, ...(d.reports || [])],
      cases: theCase
        ? d.cases.map((c) => (c.id === theCase.id ? { ...c, readoutReportId: id } : c))
        : d.cases,
    }));

    onGo(`/reports/${id}/view`);
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/reports/new${caseId ? `?case=${caseId}` : ""}`}
        title="New report"
        subtitle="Create the Report object first. Everything else (view/export/receipts) hangs off this."
        right={<Chip tone="accent"><FileOutput size={14}/> report</Chip>}
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.1fr 0.9fr" }}>
        <Panel meta="Inputs" title="Report metadata" right={<Chip>POC</Chip>}>
          <label className="label" style={{ marginTop: 0 }}>
            <div className="stat-label">Title</div>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>

          <div className="hr" />

          <div className="row" style={{ flexWrap: "wrap" }}>
            <button className="btn" onClick={() => onGo(caseId ? `/cases/${caseId}/readout` : "/reports")}>
              Cancel
            </button>
            <button className="btn btn--primary" onClick={createReport}>
              <span className="row" style={{ gap: 8 }}>
                <FileOutput size={14} /> Create report
              </span>
            </button>
          </div>
        </Panel>

        <Panel meta="Rule" title="Why together" right={<Chip tone="warn">anti-screenshot</Chip>}>
          <div className="text">
            A readout without a report object becomes a screenshot game.
            Slice 6 ships view + export + receipts as a unit so handoff is defensible.
          </div>
        </Panel>
      </div>
    </div>
  );
}

export function ReportViewPage({ data, setData, onGo, report }) {
  if (!report) {
    return (
      <Panel meta="Error" title="Report not found" right={<Chip tone="bad">missing</Chip>}>
        <div className="text">Need a report object.</div>
        <div className="hr" />
        <button className="btn" onClick={() => onGo("/reports")}>Back</button>
      </Panel>
    );
  }

  const [findings, setFindings] = useState((report.topFindings || []).join("\n"));
  const [keyResult, setKeyResult] = useState(report.keyResult || "");
  const [nextSteps, setNextSteps] = useState((report.nextSteps || []).join("\n"));

  function saveDraft() {
    setData((d) => ({
      ...d,
      reports: (d.reports || []).map((r) =>
        r.id === report.id
          ? {
              ...r,
              title: report.title,
              topFindings: findings.split("\n").map((s) => s.trim()).filter(Boolean),
              keyResult: keyResult.trim(),
              nextSteps: nextSteps.split("\n").map((s) => s.trim()).filter(Boolean),
            }
          : r
      ),
    }));
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker={`/reports/${report.id}/view`}
        title={report.title}
        subtitle="Draft view. In Slice 6 this is the canonical readout surface (not a dashboard homepage)."
        right={
          <div className="row" style={{ flexWrap: "wrap" }}>
            <Chip tone="accent">
              <FolderArchive size={14} /> {report.status}
            </Chip>
            <button className="btn" onClick={() => onGo(`/reports/${report.id}/export`)}>
              <span className="row" style={{ gap: 8 }}>
                <FileDown size={14} /> Export
              </span>
            </button>
            <button className="btn" onClick={() => onGo(`/reports/${report.id}/receipts`)}>
              <span className="row" style={{ gap: 8 }}>
                <ClipboardSignature size={14} /> Receipts
              </span>
            </button>
          </div>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.2fr 0.8fr" }}>
        <Panel meta="Report" title="Content (draft)" right={<Chip>editable</Chip>}>
          <label className="label" style={{ marginTop: 0 }}>
            <div className="stat-label">Top findings (one per line)</div>
            <textarea className="textarea" rows={7} value={findings} onChange={(e) => setFindings(e.target.value)} />
          </label>

          <label className="label">
            <div className="stat-label">Key result</div>
            <input className="input" value={keyResult} onChange={(e) => setKeyResult(e.target.value)} />
          </label>

          <label className="label">
            <div className="stat-label">Next steps (one per line)</div>
            <textarea className="textarea" rows={6} value={nextSteps} onChange={(e) => setNextSteps(e.target.value)} />
          </label>

          <div className="hr" />

          <div className="row" style={{ flexWrap: "wrap" }}>
            <button className="btn" onClick={() => onGo("/reports")}>Back</button>
            <button className="btn btn--primary" onClick={saveDraft}>
              <span className="row" style={{ gap: 8 }}>
                <BadgeCheck size={14} /> Save draft
              </span>
            </button>
          </div>
        </Panel>

        <Panel meta="Handoff" title="What makes it defensible" right={<Chip tone="warn">anti-politics</Chip>}>
          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Rule</div>
            <div className="text" style={{ marginTop: 8 }}>
              Report claims must be backed by the frozen receipt bundle.
            </div>
          </div>

          <div className="hr" />

          <div className="box" style={{ padding: 14 }}>
            <div className="kicker">Next step</div>
            <div className="text" style={{ marginTop: 8 }}>
              Go to <b>Receipts</b> and freeze the bundle used for this readout.
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

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