import React from "react";
import styles from "./Panel.module.css";

export function Panel({ meta, title, right, children }) {
  return (
    <section className={styles.panel}>
      <header className={styles.head}>
        <div>
          <div className={styles.meta}>{meta}</div>
          <div className={styles.title}>{title}</div>
        </div>
        <div className={styles.right}>{right}</div>
      </header>
      <div className={styles.body}>{children}</div>
    </section>
  );
}
