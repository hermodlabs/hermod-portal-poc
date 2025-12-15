import React from "react";
import styles from "./DashboardPage.module.css";

import { AlertTriangle, DoorOpen, Grid3X3, Timer, Waves, ThermometerSun } from "lucide-react";
import { Panel } from "../../components/ui/Panel/Panel.jsx";
import { Chip } from "../../components/ui/Chip/Chip.jsx";
import { StatTile } from "../../components/ui/StatTile/StatTile.jsx";
import { FieldGrid } from "../../components/viz/FieldGrid/FieldGrid.jsx";

import { percent } from "../../lib/utils.js";
import { healthToneFromAlerts } from "../../features/room/thresholds.js";

export default function DashboardPage({ model }) {
  if (!model) return null;

  const { summary, alerts, doorPulse, nowLabel, grid, door } = model;
  const tone = healthToneFromAlerts(alerts);

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div>
          <div className={styles.kicker}>Dashboard</div>
          <h1 className={styles.h1}>Room health</h1>
          <p className={styles.sub}>
            Snapshot view: zone alerts, field summary, and the current door-cycle signal.
          </p>
        </div>

        <div className={styles.headerChips}>
          <Chip tone={tone} icon={AlertTriangle}>
            {alerts.low.length ? `${alerts.low.length} low zones` : "No low zones"}
          </Chip>
          <Chip tone="neutral" icon={Timer}>
            Now · {nowLabel}
          </Chip>
        </div>
      </header>

      <section className={styles.stats}>
        <StatTile icon={Waves} label="Average" value={percent(summary.avg)} tone={tone} />
        <StatTile
          icon={ThermometerSun}
          label="Min"
          value={percent(summary.min)}
          tone={alerts.low.length ? "warn" : "neutral"}
        />
        <StatTile icon={ThermometerSun} label="Max" value={percent(summary.max)} tone="neutral" />
        <StatTile
          icon={DoorOpen}
          label="Door signal"
          value={`${Math.round(doorPulse * 100)}%`}
          tone={doorPulse > 0.66 ? "warn" : "neutral"}
        />
      </section>

      <section className={styles.grid}>
        <Panel meta="Spatial" title="Current slice" right={<Chip tone="accent" icon={Grid3X3}>Field view</Chip>}>
          <FieldGrid grid={grid} door={door} />
        </Panel>

        <Panel meta="Actions" title="Recommended next steps" right={<Chip tone="neutral">POC</Chip>}>
          <div className={styles.actions}>
            <ActionCard
              title="If low zones persist"
              body="Rotate inventory away from the lowest zones and inspect door-side shelves for repeatable drift."
            />
            <ActionCard
              title="If door signal is high"
              body="Reduce door dwell during peak traffic; adjust fan placement to break the corridor."
            />
            <ActionCard
              title="Note"
              body="Simulated data. The portal workflow is what you’re selling."
              subtle
            />
          </div>
        </Panel>
      </section>
    </div>
  );
}

function ActionCard({ title, body, subtle = false }) {
  return (
    <div className={styles.actionCard}>
      <div className={styles.actionKicker}>{title}</div>
      <div className={subtle ? styles.actionBodySubtle : styles.actionBody}>{body}</div>
    </div>
  );
}
