import React, { useState } from "react";
import {Style} from "../../util"

import {
  Chip,
} from "../../component";
import {
  BadgeCheck,
} from "lucide-react";

export function AcceptInvite({ inviteToken, onAccept, onBack }) {
  const [name, setName] = useState("New Operator");
  const [email, setEmail] = useState("new.user@example.com");
  return (
    <div className="login">
      <Style />
      <div className="container">
        <div className="kicker">Accept invite</div>
        <h1 style={{ margin: "12px 0 0", fontSize: 38, fontWeight: 650 }}>Join the tenant</h1>
        <p className="text" style={{ maxWidth: 900, marginTop: 12 }}>
          Token is treated as a real route object in Slice 0. In production: validates token, selects tenant, provisions
          account, then forwards to Overview.
        </p>

        <div className="login-grid">
          <div className="box" style={{ padding: 16 }}>
            <div className="kicker">Invite token</div>
            <div className="row" style={{ justifyContent: "space-between", marginTop: 10 }}>
              <Chip tone="accent">
                <BadgeCheck size={14} /> {inviteToken || "—"}
              </Chip>
              <button className="btn" onClick={onBack}>
                Back
              </button>
            </div>

            <label className="label">
              <div className="stat-label">Name</div>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </label>

            <label className="label">
              <div className="stat-label">Email</div>
              <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>

            <button className="btn btn--primary" style={{ marginTop: 16 }} onClick={() => onAccept({ name, email })}>
              Accept & enter portal
            </button>
          </div>

          <div className="box" style={{ padding: 16 }}>
            <div className="kicker">Honesty note</div>
            <div className="text" style={{ marginTop: 10 }}>
              Slice 0 is allowed to have fake persistence. What matters: the system has a real place where invite flow
              lives, and it doesn’t get “hand-waved” in demos.
            </div>
            <div className="hr" />
            <div className="text">
              Next slices will attach: evidence gates, runs, receipts, and cases — but those do not belong here.
            </div>
          </div>
        </div>

        <div className="footer">© {new Date().getFullYear()} HermodLabs · Slice 0</div>
      </div>
    </div>
  );
}

export default AcceptInvite;