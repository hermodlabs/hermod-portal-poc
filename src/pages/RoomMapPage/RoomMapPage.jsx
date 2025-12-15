import React from "react";
import styles from "./RoomMapPage.module.css";

import { AlertTriangle, Grid3X3, Timer } from "lucide-react";
import { Panel } from "../../components/ui/Panel/Panel.jsx";
import { Chip } from "../../components/ui/Chip/Chip.jsx";
import { Slider } from "../../components/ui/Slider/Slider.jsx";
import { FieldGrid } from "../../components/viz/FieldGrid/FieldGrid.jsx";

import { fmtTime, percent } from "../../lib/utils.js";

export default function RoomMapPage({ model, controls, setControls }) {
  if (!model) return null;

  const { grid, door, alerts, nowLabel, thresholds, zoneLabel } = model;

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div>
          <div className={styles.kicker}>Room map</div>
          <h1 className={styles.h1}>Humidity field slice</h1>
          <p className={styles.sub}>
            In production this is sensor-driven. In the POC, use the knobs to demonstrate drift paths.
          </p>
        </div>

        <div className={styles.headerChips}>
          <Chip tone="neutral" icon={Timer}>{nowLabel}</Chip>
          <Chip tone={alerts.low.length ? "warn" : "ok"} icon={AlertTriangle}>
            {alerts.low.length ? `${alerts.low.length} low zones` : "In range"}
          </Chip>
        </div>
      </header>

      <section className={styles.grid}>
        <Panel meta="Spatial" title="Field view" right={<Chip tone="accent" icon={Grid3X3}>z={Math.round(controls.z * 100)}%</Chip>}>
          <FieldGrid grid={grid} door={door} />
        </Panel>

        <Panel meta="Controls" title="Demo knobs" right={<Chip tone="neutral">POC</Chip>}>
          <div className={styles.controls}>
            <Slider
              label="Height (z slice)"
              value={controls.z}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => setControls((c) => ({ ...c, z: v }))}
              format={(v) => `${Math.round(v * 100)}%`}
            />
            <Slider
              label="Time"
              value={controls.tMin}
              min={0}
              max={24 * 60 - 1}
              step={5}
              onChange={(v) => setControls((c) => ({ ...c, tMin: v }))}
              format={(v) => fmtTime(v)}
            />
            <Slider
              label="Door cycle intensity"
              value={controls.doorIntensity}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => setControls((c) => ({ ...c, doorIntensity: v }))}
              format={(v) => (v < 0.33 ? "Low" : v < 0.66 ? "Medium" : "High")}
            />
            <Slider
              label="Fan mixing"
              value={controls.fanMix}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => setControls((c) => ({ ...c, fanMix: v }))}
              format={(v) => (v < 0.33 ? "Low" : v < 0.66 ? "Medium" : "High")}
            />
          </div>
        </Panel>
      </section>

      <Panel meta="Zones" title="Most stressed zones" right={<Chip tone="neutral">Low &lt; {thresholds.LOW_RH}%</Chip>}>
        <div className={styles.zones}>
          {alerts.low.length === 0 ? (
            <div className={styles.empty}>No low zones detected on this slice.</div>
          ) : (
            alerts.low.map((a, i) => (
              <div key={i} className={styles.zoneRow}>
                <div>
                  <div className={styles.zoneKicker}>{zoneLabel ? zoneLabel(a.x, a.y) : `(${a.x},${a.y})`}</div>
                  <div className={styles.zoneValue}>{percent(a.v)}</div>
                </div>
                <Chip tone="warn">Low</Chip>
              </div>
            ))
          )}
        </div>
      </Panel>
    </div>
  );
}
