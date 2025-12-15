import React from "react";
import styles from "./Sidebar.module.css";
import { cx } from "../../../lib/utils.js";

export function SideBar({ items, activeKey, onSelect }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.kicker}>Navigation</div>

      <div className={styles.list}>
        {items.map((it) => {
          const Icon = it.icon;
          const active = it.key === activeKey;
          return (
            <button
              key={it.key}
              className={cx(styles.navBtn, active && styles.navBtnActive)}
              onClick={() => onSelect(it.key)}
              type="button"
            >
              {Icon ? <Icon size={18} className={cx(styles.icon, active && styles.iconActive)} /> : null}
              <span className={styles.label}>{it.label}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.note}>
        <div className={styles.noteKicker}>Operator workflow</div>
        <div className={styles.noteBody}>Map → drift path → correlate with events → take action.</div>
      </div>
    </aside>
  );
}
