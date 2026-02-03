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

export {CaseBaselinePage} from "./CaseBaselinePage";
export {CaseDefinePage} from "./CaseDefinePage";
export {CaseDetailPage} from "./CaseDetailPage";
export {CaseEvidencePage} from "./CaseEvidencePage";
export {CaseNewPage} from "./CaseNewPage";
export {CasePocketsPage} from "./CasePocketsPage";
export {CaseReadoutPage} from "./CaseReadoutPage"
export {CasesListPage} from "./CasesListPage";
export {CaseTriggersPage} from "./CaseTriggersPage";
export {CaseVerdictPage} from "./CaseVerdictPage";
export {OverviewPage} from "./OverviewPage";
export {ReceiptDetailPage} from "./ReceiptDetailPage";
export {ReceiptsIndexPage} from "./ReceiptsIndexPage";
export {RoomDetailPage} from "./RoomDetailPage";
export {RoomLayoutPage} from "./RoomLayoutPage";
export {RoomsPage} from "./RoomsPage";
export {RoomSummaryPage} from "./RoomSummaryPage";
export {RunMapPage} from "./RunMapPage";
export {RunNewPage} from "./RunNewPage";
export {RunPocketsPage} from "./RunPocketsPage";
export {RunProvenancePage} from "./RunProvenancePage";
export {RunReceiptsPage} from "./RunReceiptsPage";
export {RunsComparePage} from "./RunsComparePage";
export {RunTimelinePage} from "./RunTimelinePage";
export {RunValidityPage} from "./RunValidityPage";
export {SettingsRolesPage} from "./SettingsRolesPage";
export {SettingsUsersPage} from "./SettingsUsersPage";
export {SiteDetailPage} from "./SiteDetailPage";
export {SitesPage} from "./SitesPage";





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