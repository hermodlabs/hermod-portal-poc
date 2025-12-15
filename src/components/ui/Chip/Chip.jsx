import React from "react";
import styles from "./Chip.module.css";
import { cx } from "../../../lib/utils.js";

export function Chip({ tone = "neutral", icon: Icon, children }) {
  return (
    <span className={cx(styles.chip, styles[`chip_${tone}`])}>
      {Icon ? <Icon size={14} className={styles.icon} /> : null}
      {children}
    </span>
  );
}
