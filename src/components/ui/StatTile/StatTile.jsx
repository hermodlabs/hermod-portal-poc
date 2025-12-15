import React from "react";
import styles from "./StatTile.module.css";
import { cx } from "../../../lib/utils.js";

export function StatTile({ label, value, icon: Icon, tone = "neutral" }) {
  return (
    <div className={cx(styles.tile, styles[`tile_${tone}`])}>
      <div className={styles.top}>
        <div>
          <div className={styles.label}>{label}</div>
          <div className={styles.value}>{value}</div>
        </div>
        {Icon ? <Icon size={18} className={styles.icon} /> : null}
      </div>
    </div>
  );
}
