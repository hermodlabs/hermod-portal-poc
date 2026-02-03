export function Style() {
  return (
    <style>{`
:root{
  --bg0:#020617;
  --bg1:#0b1220;
  --panel: rgba(15,23,42,.55);
  --panel2: rgba(15,23,42,.35);
  --border: rgba(255,255,255,.10);
  --border2: rgba(255,255,255,.14);
  --text: rgba(226,232,240,.95);
  --muted: rgba(148,163,184,.92);
  --muted2: rgba(148,163,184,.75);
  --shadow: 0 18px 60px rgba(0,0,0,.42);
  --shadow2: 0 10px 26px rgba(0,0,0,.35);
  --r: 18px;
}

*{ box-sizing: border-box; }
html, body { height:100%; background: radial-gradient(1200px 900px at 10% 10%, rgba(56,189,248,.10), transparent 55%),
             radial-gradient(900px 700px at 85% 20%, rgba(34,197,94,.08), transparent 60%),
             radial-gradient(900px 700px at 50% 95%, rgba(244,63,94,.06), transparent 60%),
             linear-gradient(180deg, var(--bg1), var(--bg0));
            color: var(--text); margin:0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; }
a{ color: inherit; }

.container{ width: min(1200px, calc(100% - 40px)); margin: 0 auto; }
.footer{ color: var(--muted2); font-size: 12px; padding: 22px 0 26px; text-align: center; }

.kicker{ font-size: 12px; letter-spacing: .12em; text-transform: uppercase; color: var(--muted2); }
.text{ color: var(--muted); font-size: 14px; line-height: 1.55; }
.h1{ font-size: 22px; font-weight: 700; margin-top: 4px; }

.topbar{
  position: sticky; top: 0; z-index: 10;
  backdrop-filter: blur(10px);
  background: linear-gradient(180deg, rgba(2,6,23,.78), rgba(2,6,23,.55));
  border-bottom: 1px solid rgba(255,255,255,.08);
}
.topbar-inner{ display:flex; align-items:center; justify-content:space-between; padding: 18px 0; gap: 12px; }

.row{ display:flex; align-items:center; gap: 12px; }

.layout{ display:grid; grid-template-columns: 270px 1fr; gap: 18px; padding: 18px 0 0; }
@media (max-width: 980px){
  .layout{ grid-template-columns: 1fr; }
}

.sidebar{
  background: linear-gradient(180deg, rgba(15,23,42,.55), rgba(15,23,42,.35));
  border: 1px solid rgba(255,255,255,.10);
  border-radius: var(--r);
  padding: 14px;
  box-shadow: var(--shadow2);
  height: fit-content;
}
.sidebar-note{
  margin-top: 12px;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(2,6,23,.35);
  color: var(--muted);
  font-size: 13px;
  line-height: 1.5;
}

.main{ padding-bottom: 12px; }

.navbtn{
  width: 100%;
  display:flex;
  align-items:center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(2,6,23,.25);
  cursor: pointer;
  transition: transform .06s ease, border-color .12s ease, background .12s ease;
}
.navbtn:hover{ transform: translateY(-1px); border-color: rgba(255,255,255,.18); background: rgba(2,6,23,.35); }
.navbtn--active{ border-color: rgba(56,189,248,.35); background: rgba(2,6,23,.40); }

.panel{
  border-radius: var(--r);
  border: 1px solid rgba(255,255,255,.10);
  background: linear-gradient(180deg, rgba(15,23,42,.55), rgba(15,23,42,.35));
  box-shadow: var(--shadow2);
  overflow: hidden;
}
.panel-head{
  padding: 14px 14px 12px;
  display:flex; justify-content:space-between; align-items:flex-start; gap: 14px;
  border-bottom: 1px solid rgba(255,255,255,.08);
}
.panel-title{ font-size: 18px; font-weight: 700; margin-top: 6px; }
.panel-body{ padding: 14px; }

.box{
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(2,6,23,.32);
}

.grid-2{ display:grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.grid-4{ display:grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
@media (max-width: 980px){
  .grid-2{ grid-template-columns: 1fr; }
  .grid-4{ grid-template-columns: repeat(2, 1fr); }
}

.stat{
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(2,6,23,.30);
  padding: 12px 14px;
}
.stat-label{ color: var(--muted2); font-size: 12px; letter-spacing: .08em; text-transform: uppercase; }
.stat-value{ font-size: 22px; font-weight: 750; margin-top: 8px; }

.chip{
  display:inline-flex; align-items:center; gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(2,6,23,.32);
  color: var(--text);
  font-size: 12px;
  font-weight: 650;
}
.chip--accent{ border-color: rgba(56,189,248,.35); background: rgba(56,189,248,.10); }
.chip--ok{ border-color: rgba(34,197,94,.35); background: rgba(34,197,94,.10); }
.chip--warn{ border-color: rgba(251,191,36,.35); background: rgba(251,191,36,.10); }
.chip--bad{ border-color: rgba(248,113,113,.35); background: rgba(248,113,113,.10); }

.btn{
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(2,6,23,.28);
  color: var(--text);
  border-radius: 14px;
  padding: 10px 12px;
  cursor: pointer;
  transition: transform .06s ease, border-color .12s ease, background .12s ease;
  font-weight: 650;
}
.btn:hover{ transform: translateY(-1px); border-color: rgba(255,255,255,.18); background: rgba(2,6,23,.38); }
.btn:disabled{ opacity: .45; cursor: not-allowed; transform: none; }
.btn--primary{
  border-color: rgba(56,189,248,.40);
  background: rgba(56,189,248,.12);
}

.label{ display:grid; gap: 8px; margin-top: 12px; }
.input{
  width:100%;
  padding: 12px 12px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(2,6,23,.35);
  color: var(--text);
  outline: none;
}
.input:focus{ border-color: rgba(56,189,248,.35); box-shadow: 0 0 0 4px rgba(56,189,248,.08); }

.login{ min-height: 100vh; display:flex; align-items: center; padding: 40px 0; }
.login-grid{ display:grid; grid-template-columns: 1.1fr 0.9fr; gap: 18px; margin-top: 18px; }
@media (max-width: 980px){
  .login{ padding: 26px 0; }
  .login-grid{ grid-template-columns: 1fr; }
}

.hr{ height: 1px; background: rgba(255,255,255,.08); margin: 12px 0; }

.taskRow{
  width: 100%;
  text-align: left;
  display:flex; align-items:center; justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(2,6,23,.25);
  cursor: pointer;
  transition: transform .06s ease, border-color .12s ease, background .12s ease;
}
.taskRow:hover{ transform: translateY(-1px); border-color: rgba(255,255,255,.18); background: rgba(2,6,23,.35); }
.taskIcon{
  width: 30px; height: 30px; border-radius: 12px;
  display:flex; align-items:center; justify-content:center;
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(2,6,23,.30);
}
.taskHint{ color: var(--muted2); font-weight: 650; display:inline-flex; align-items:center; gap: 8px; }

.ul{ margin: 10px 0 0; padding-left: 18px; color: var(--muted); }
.ul li{ margin: 8px 0; }

.gateRow{
  display:flex;
  align-items:center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(2,6,23,.25);
}
.gateSelect{
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(2,6,23,.35);
  color: var(--text);
  outline: none;
  font-weight: 650;
}
.gateSelect:focus{ border-color: rgba(56,189,248,.35); box-shadow: 0 0 0 4px rgba(56,189,248,.08); }

.abstain{
  border-radius: 16px;
  border: 1px solid rgba(248,113,113,0.30);
  background: linear-gradient(180deg, rgba(248,113,113,0.08), rgba(2,6,23,0.25));
  padding: 14px;
}
.btn--blocked{
  width: 100%;
  border-color: rgba(248,113,113,0.35);
  background: rgba(248,113,113,0.12);
}

.eventRow{
  display:flex;
  align-items:center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(2,6,23,.25);
}

.layoutMap{
  display:grid;
  gap: 6px;
  padding: 10px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(2,6,23,.32);
  position: relative;
}
.cell2{
  border-radius: 8px;
  aspect-ratio: 1 / 1;
  border: 1px solid rgba(255,255,255,.06);
  background: rgba(2,6,23,.22);
}
.zoneBox{
  border-radius: 14px;
  border: 1px solid rgba(56,189,248,.22);
  background: rgba(56,189,248,.06);
  position: relative;
}
.zoneLabel{
  position:absolute;
  top: 6px; left: 8px;
  font-size: 11px;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: rgba(148,163,184,.85);
}
.lm{
  display:flex; align-items:center; justify-content:center;
  pointer-events:none;
}
.lmDot{
  width: 8px; height: 8px;
  border-radius: 999px;
  background: rgba(226,232,240,.70);
  box-shadow: 0 0 0 4px rgba(226,232,240,.08);
}
.pocketPin{
  display:flex;
  align-items:center;
  justify-content:center;
  border: 0;
  background: transparent;
  cursor: pointer;
  padding: 0;
}
.pocketPin--static{ cursor: default; }
.pinDot{
  width: 10px; height: 10px;
  border-radius: 999px;
  background: rgba(251,191,36,.85);
  box-shadow: 0 0 0 5px rgba(251,191,36,.10);
}
`}</style>
  );
}