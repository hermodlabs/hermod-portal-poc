import {
  Ban
} from "lucide-react";

const cx = (...xs) => xs.filter(Boolean).join(" ");

export function Header({ kicker, title, subtitle, right }) {
  return (
    <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <div className="kicker">{kicker}</div>
        <div style={{ fontSize: 32, fontWeight: 650, marginTop: 6 }}>{title}</div>
        {subtitle && (
          <div className="text" style={{ marginTop: 8, maxWidth: 860 }}>
            {subtitle}
          </div>
        )}
      </div>
      <div className="row">{right}</div>
    </div>
  );
}

export function Chip({ tone = "neutral", children }) {
  return (
    <span
      className={cx(
        "chip",
        tone === "accent" && "chip--accent",
        tone === "ok" && "chip--ok",
        tone === "warn" && "chip--warn",
        tone === "bad" && "chip--bad"
      )}
    >
      {children}
    </span>
  );
}

export function Panel({ meta, title, right, children }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <div className="kicker">{meta}</div>
          <div className="panel-title">{title}</div>
        </div>
        <div className="row">{right}</div>
      </div>
      <div className="panel-body">{children}</div>
    </div>
  );
}


export function Stat({ label, value }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

export function LayoutMap({ w, h, zones = [], landmarks = [], pockets = [], onPocketClick }) {
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

export function PocketCard({ pocket, onClick, hint }) {
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

export function AbstainBanner({ reasons, body }) {
  return (
    <div className="abstain">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <div className="kicker">Hard stop</div>
          <div style={{ fontSize: 18, fontWeight: 800, marginTop: 6 }}>
            🚫 ABSTAIN — you may not interpret this
          </div>
        </div>
        <Chip tone="bad">
          <Ban size={14} /> ABSTAIN
        </Chip>
      </div>

      <div className="text" style={{ marginTop: 10 }}>
        {body}
      </div>

      <div className="hr" />

      <div className="kicker">Reasons</div>
      <ul className="ul" style={{ marginTop: 10 }}>
        {reasons.map((r, i) => (
          <li key={i}>
            <b>{r}</b>
          </li>
        ))}
      </ul>

      <div className="hr" />

      <button className="btn btn--blocked" disabled title="Interpretation is blocked by ABSTAIN">
        <span className="row" style={{ gap: 8 }}>
          <Ban size={14} /> Interpretation blocked
        </span>
      </button>
    </div>
  );
}