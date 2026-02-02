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