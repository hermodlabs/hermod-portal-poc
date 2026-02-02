import React from "react";

import {
  Header,
  Panel,
  Chip,
} from "../../component";

import {
  Wrench,
} from "lucide-react";

export function SettingsRolesPage({ roles }) {
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Header
        kicker="/settings/roles"
        title="Roles"
        subtitle="Slice 0: minimal visibility so permissions aren’t hand-waved."
        right={
          <Chip tone="accent">
            <Wrench size={14} /> {roles.length}
          </Chip>
        }
      />

      <Panel meta="RBAC" title="Role catalog" right={<Chip>POC</Chip>}>
        <div style={{ display: "grid", gap: 10 }}>
          {roles.map((r) => (
            <div key={r.id} className="box" style={{ padding: 14 }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 650 }}>{r.name}</div>
                  <div className="kicker" style={{ marginTop: 6 }}>
                    {r.id}
                  </div>
                </div>
                <Chip tone={r.id === "r-admin" ? "accent" : "neutral"}>{r.id === "r-admin" ? "privileged" : "standard"}</Chip>
              </div>
              <div className="text" style={{ marginTop: 10 }}>
                {r.desc}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

export default SettingsRolesPage;