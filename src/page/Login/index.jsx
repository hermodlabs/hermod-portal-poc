import React, { useState } from "react";
import {Style} from "../../util"
import {
  Header,
  Chip,
  Panel,
  Stat
} from "../../component";

import {
  Building2,
  Settings,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

export function Login({ onLogin, onGoInvite }) {
  const [email, setEmail] = useState("bobby@example.com");
  const [tenant, setTenant] = useState("HermodLabs (POC)");

  return (
    <div className="login">
      <Style />
      <div className="container">
        <div className="kicker">Slice 0 · Skeleton</div>
        <h1 style={{ margin: "12px 0 0", fontSize: 42, fontWeight: 650 }}>
          Portal shell (truthful, navigable, non-lying)
        </h1>
        <p className="text" style={{ maxWidth: 900, marginTop: 12 }}>
          This is <b>not</b> analysis. Slice 0 exists so auth + navigation + sites/rooms are real objects.
          Pages are allowed to be empty, but they must be <b>honest</b>.
        </p>

        <div className="login-grid">
          <div className="box" style={{ padding: 16 }}>
            <div className="kicker">Sign in</div>

            <label className="label">
              <div className="stat-label">Tenant</div>
              <input className="input" value={tenant} onChange={(e) => setTenant(e.target.value)} />
            </label>

            <label className="label">
              <div className="stat-label">Email</div>
              <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>

            <button
              className="btn btn--primary"
              onClick={() => onLogin({ tenant, email })}
              style={{ marginTop: 16 }}
            >
              Enter portal
            </button>

            <div className="hr" />

            <div className="text">
              Or simulate invite accept:
              <button className="btn" style={{ marginLeft: 10 }} onClick={() => onGoInvite("demo-token-7Q2")}>
                <span className="row" style={{ gap: 8 }}>
                  <UserPlus size={14} /> Accept invite
                </span>
              </button>
            </div>
          </div>

          <div
            className="box"
            style={{
              padding: 16,
              background: "linear-gradient(180deg, rgba(15,23,42,.75), rgba(2,6,23,.70))",
              boxShadow: "var(--shadow)",
            }}
          >
            <div className="kicker">What Slice 0 proves</div>
            <div style={{ marginTop: 14 }} className="text">
              <b>Everything is reachable</b> and <b>nothing lies</b>.
            </div>

            <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
              <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                <Chip tone="accent">
                  <ShieldCheck size={14} /> honest shell
                </Chip>
                <Chip>
                  <Building2 size={14} /> sites/rooms
                </Chip>
                <Chip>
                  <Settings size={14} /> minimal settings
                </Chip>
              </div>

              <div className="box" style={{ padding: 14 }}>
                <div className="kicker">Rule</div>
                <div className="text" style={{ marginTop: 8 }}>
                  Overview can be a placeholder — but it must not pretend to be insight.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer">© {new Date().getFullYear()} HermodLabs · Slice 0</div>
      </div>
    </div>
  );
}