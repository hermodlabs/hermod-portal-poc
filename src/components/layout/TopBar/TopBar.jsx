import React from "react";
import styles from "./TopBar.module.css";
import { Button } from "../../ui/Button/Button.jsx";
import { Chip } from "../../ui/Chip/Chip.jsx";

export function TopBar({ tenant, roomName, rightChips = [], onLogout }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <div className={styles.kicker}>{tenant}</div>
          <div className={styles.title}>{roomName}</div>
        </div>

        <div className={styles.right}>
          {rightChips.map((c, i) => (
            <Chip key={i} tone={c.tone} icon={c.icon}>
              {c.label}
            </Chip>
          ))}
          <Button variant="ghost" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
