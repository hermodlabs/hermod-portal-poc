import React from "react";
import styles from "./Button.module.css";
import { cx } from "../../../lib/utils.js";

export function Button({ variant = "ghost", className, children, ...props }) {
  return (
    <button
      className={cx(styles.btn, styles[`btn_${variant}`], className)}
      {...props}
    >
      {children}
    </button>
  );
}
