import React from "react";
import styles from "./TrendsPage.module.css";

import { BarChart3, Timer } from "lucide-react";
import { Panel } from "../../components/ui/Panel/Panel.jsx";
import { Chip } from "../../components/ui/Chip/Chip.jsx";
import { AvgLineChart, MinMaxBandChart } from "../../components/viz/TrendCharts/TrendCharts.jsx";

export default function TrendsPage({ model }) {
  if (!model) return null;

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div>
          <div className={styles.kicker}>Trends</div>
          <h1 className={styles.h1}>Humidity over time</h1>
          <p className={styles.sub}>
            Operators use this to see stability/variance and to correlate drift with events.
          </p>
        </div>

        <div className={styles.headerChips}>
          <Chip tone="neutral" icon={Timer}>Last 8 hours</Chip>
          <Chip tone="accent" icon={BarChart3}>Avg / Min / Max</Chip>
        </div>
      </header>

      <div className={styles.grid}>
        <Panel meta="Trend" title="Average RH" right={<Chip tone="neutral">Simulated</Chip>}>
          <AvgLineChart data={model.timeseries} />
          <div className={styles.note}>In the full portal, door-cycle markers would appear on this chart.</div>
        </Panel>

        <Panel meta="Spread" title="Min / Max band" right={<Chip tone="neutral">Variance</Chip>}>
          <MinMaxBandChart data={model.timeseries} />
          <div className={styles.note}>Wide bands indicate spatial divergence: some zones drift away from the average.</div>
        </Panel>
      </div>
    </div>
  );
}
