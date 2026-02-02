export function OverviewPage({ onGo, sites }) {
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker="/overview"
        title="Overview (honest placeholder)"
        subtitle="This page is allowed to be empty in Slice 0 — but it must not pretend to be insight."
        right={
          <Chip tone="accent">
            <LayoutDashboard size={14} /> shell only
          </Chip>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.2fr 0.8fr" }}>
        <Panel
          meta="Truth posture"
          title="What exists right now"
          right={
            <Chip>
              <ShieldCheck size={14} /> non-lying
            </Chip>
          }
        >
          <div style={{ display: "grid", gap: 10 }}>
            <div className="box" style={{ padding: 14 }}>
              <div className="kicker">Slice 0 guarantee</div>
              <div className="text" style={{ marginTop: 8 }}>
                You can authenticate, navigate, select a site and room, and land on a room summary route that clearly
                states “no analysis yet.”
              </div>
            </div>

            <div className="box" style={{ padding: 14 }}>
              <div className="kicker">What is intentionally missing</div>
              <div className="text" style={{ marginTop: 8 }}>
                Cases, runs, receipts, provenance, validity, pocket ranking, compares, and verdict logic.
              </div>
            </div>

            <div className="row" style={{ flexWrap: "wrap" }}>
              <button className="btn btn--primary" onClick={() => onGo("/sites")}>
                <span className="row" style={{ gap: 8 }}>
                  <Building2 size={14} /> Go to Sites
                </span>
              </button>
              <button className="btn" onClick={() => onGo("/settings/users")}>
                <span className="row" style={{ gap: 8 }}>
                  <Users size={14} /> Manage Users
                </span>
              </button>
            </div>
          </div>
        </Panel>

        <Panel meta="Inventory" title="Sites at a glance" right={<Chip>{sites.length}</Chip>}>
          <div style={{ display: "grid", gap: 10 }}>
            {sites.map((s) => (
              <button key={s.id} className="taskRow" onClick={() => onGo(`/sites/${s.id}`)}>
                <div className="row" style={{ gap: 10 }}>
                  <div className="taskIcon">
                    <Building2 size={16} />
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontWeight: 650 }}>{s.name}</div>
                    <div className="kicker" style={{ marginTop: 4 }}>
                      {s.city} · {s.rooms.length} rooms
                    </div>
                  </div>
                </div>
                <span className="taskHint">
                  Open <ArrowRight size={14} />
                </span>
              </button>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}