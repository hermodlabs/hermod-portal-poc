import React from "react";
import styles from "./Slider.module.css";

export function Slider({ label, value, onChange, min, max, step, format }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.top}>
        <div className={styles.label}>{label}</div>
        <div className={styles.value}>{format ? format(value) : String(value)}</div>
      </div>
      <input
        className={styles.range}
        type="range"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
      />
    </div>
  );
}
