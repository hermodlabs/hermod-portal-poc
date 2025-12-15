import React from "react";
import styles from "./FieldGrid.module.css";
import { cx, percent } from "../../../lib/utils.js";
import { humidityColor, zoneName } from "../../../data/simulator/fieldModel.js";

export function FieldGrid({ grid, door }) {
  const H = grid.length;
  const W = grid[0].length;

  return (
    <div className={styles.wrap}>
      <div className={styles.top}>
        <div className={styles.kicker}>Room slice (top-down)</div>
        <div className={styles.doorLegend}>
          <span className={styles.doorDot} />
          <div className={styles.kicker}>Door</div>
        </div>
      </div>

      <div className={styles.grid} style={{ gridTemplateColumns: `repeat(${W}, minmax(0, 1fr))` }}>
        {grid.map((row, y) =>
          row.map((v, x) => {
            const isDoor = x === door.x && y === door.y;
            return (
              <div
                key={`${x}-${y}`}
                className={cx(styles.cell, isDoor && styles.cellDoor)}
                style={{ background: humidityColor(v) }}
                title={`${zoneName(x, y, W, H)} · ${percent(v)}`}
              />
            );
          })
        )}
      </div>

      <div className={styles.legend}>
        <LegendCard label="Low" hint="Potentially dry zones" />
        <LegendCard label="Target" hint="Stable band" />
        <LegendCard label="High" hint="Potentially wet zones" />
      </div>
    </div>
  );
}

function LegendCard({ label, hint }) {
  return (
    <div className={styles.legendCard}>
      <div className={styles.legendLabel}>{label}</div>
      <div className={styles.legendHint}>{hint}</div>
    </div>
  );
}
