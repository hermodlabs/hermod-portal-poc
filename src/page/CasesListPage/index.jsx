import React from "react";

import {
  caseStatusTone,
  caseStatusLabel,
  getSiteRoomLabel,
} from "../../algorithms";

import {
  Header,
  Panel,
  Chip,
} from "../../component";

import {
  ShieldCheck,
  ArrowRight,
  ClipboardList,
  FilePlus2,
} from "lucide-react";

export function CasesListPage({ data, onGo }) {
  const rank = { defining: 0, defined: 1 };
  const ordered = [...data.cases].sort((a, b) => rank[a.status] - rank[b.status]);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker="/cases"
        title="Cases"
        subtitle="Slice 1: create a Case and freeze a slice (Z, τ, W, S). No analysis yet."
        right={
          <button className="btn btn--primary" onClick={() => onGo("/cases/new")}>
            <span className="row" style={{ gap: 8 }}>
              <FilePlus2 size={14} /> New case
            </span>
          </button>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.2fr 0.8fr" }}>
        <Panel meta="List" title="All cases" right={<Chip tone="accent">{data.cases.length}</Chip>}>
          <div style={{ display: "grid", gap: 10 }}>
            {ordered.length === 0 ? (
              <div className="text">No cases yet. Create one to establish the contract object.</div>
            ) : (
              ordered.map((c) => {
                const { siteName, roomName } = getSiteRoomLabel(data, c.siteId, c.roomId);
                return (
                  <button key={c.id} className="taskRow" onClick={() => onGo(`/cases/${c.id}`)}>
                    <div className="row" style={{ gap: 10 }}>
                      <div className="taskIcon">
                        <ClipboardList size={16} />
                      </div>
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontWeight: 650 }}>{c.title}</div>
                        <div className="kicker" style={{ marginTop: 4 }}>
                          {siteName} · {roomName} · owner: {c.owner}
                        </div>
                      </div>
                    </div>
                    <div className="row" style={{ gap: 10 }}>
                      <Chip tone={caseStatusTone(c.status)}>{caseStatusLabel(c.status)}</Chip>
                      <span className="taskHint">
                        Open <ArrowRight size={14} />
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </Panel>

        <Panel
          meta="Contract"
          title="What a Case is (in Slice 1)"
          right={
            <Chip tone="accent">
              <ShieldCheck size={14} /> spine
            </Chip>
          }
        >
          <div style={{ display: "grid", gap: 10 }}>
            <div className="box" style={{ padding: 14 }}>
              <div className="kicker">Case definition</div>
              <div className="text" style={{ marginTop: 8 }}>
                A Case is a durable object that freezes the question into{" "}
                <b>(Z, τ, W, S)</b> so later evidence can be compared honestly.
              </div>
            </div>
            <div className="box" style={{ padding: 14 }}>
              <div className="kicker">Allowed truth</div>
              <div className="text" style={{ marginTop: 8 }}>
                If definition is incomplete, status stays <b>Defining</b>. No verdicts, no claims.
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

export default CasesListPage;