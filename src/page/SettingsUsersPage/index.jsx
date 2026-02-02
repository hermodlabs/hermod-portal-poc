import React, { useMemo, useState } from "react";

import {
  Header,
  Panel,
  Chip,
} from "../../component";

import {
  UserPlus,
  Users,
} from "lucide-react";

export function SettingsUsersPage({ data, setData }) {
  const rolesById = useMemo(() => Object.fromEntries(data.roles.map((r) => [r.id, r])), [data.roles]);
  const [draft, setDraft] = useState({ name: "", email: "", roleId: "r-view" });

  function addUser() {
    if (!draft.name.trim() || !draft.email.trim()) return;
    const u = { id: `u-${Math.floor(100 + Math.random() * 900)}`, ...draft };
    setData((d) => ({ ...d, users: [u, ...d.users] }));
    setDraft({ name: "", email: "", roleId: "r-view" });
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker="/settings/users"
        title="Users"
        subtitle="Slice 0: minimal admin UI so auth + team isn’t pretend."
        right={
          <Chip tone="accent">
            <Users size={14} /> {data.users.length}
          </Chip>
        }
      />

      <div className="grid-2" style={{ gridTemplateColumns: "1.2fr 0.8fr" }}>
        <Panel meta="Directory" title="Team" right={<Chip>POC</Chip>}>
          <div style={{ display: "grid", gap: 10 }}>
            {data.users.map((u) => (
              <div key={u.id} className="box" style={{ padding: 14 }}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontWeight: 650 }}>{u.name}</div>
                    <div className="kicker" style={{ marginTop: 6 }}>
                      {u.email}
                    </div>
                  </div>
                  <Chip tone={u.roleId === "r-admin" ? "accent" : "neutral"}>
                    {rolesById[u.roleId]?.name || "Role"}
                  </Chip>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel meta="Add" title="Invite / add user" right={<Chip tone="warn">minimal</Chip>}>
          <div style={{ display: "grid", gap: 12 }}>
            <label className="label" style={{ marginTop: 0 }}>
              <div className="stat-label">Name</div>
              <input
                className="input"
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                placeholder="e.g., Sam"
              />
            </label>

            <label className="label" style={{ marginTop: 0 }}>
              <div className="stat-label">Email</div>
              <input
                className="input"
                value={draft.email}
                onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                placeholder="sam@company.com"
              />
            </label>

            <label className="label" style={{ marginTop: 0 }}>
              <div className="stat-label">Role</div>
              <select
                className="input"
                value={draft.roleId}
                onChange={(e) => setDraft((d) => ({ ...d, roleId: e.target.value }))}
              >
                {data.roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </label>

            <button className="btn btn--primary" onClick={addUser} disabled={!draft.name.trim() || !draft.email.trim()}>
              <span className="row" style={{ gap: 8 }}>
                <UserPlus size={14} /> Add user
              </span>
            </button>

            <div className="text">
              In production: this becomes <b>/accept-invite/:token</b> flow + email delivery + audits.
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

export default SettingsUsersPage;