import React from "react";
import styles from "./PortalLayout.module.css";
import { TopBar } from "../TopBar/TopBar.jsx";
import { Sidebar } from "../SideBar/SideBar.jsx";

export function PortalLayout({
  tenant,
  roomName,
  navItems,
  activeKey,
  onSelectNav,
  onLogout,
  topRightChips = [],
  children,
}) {
  return (
    <div className={styles.page}>
      <TopBar tenant={tenant} roomName={roomName} rightChips={topRightChips} onLogout={onLogout} />

      <div className={styles.container}>
        <div className={styles.grid}>
          <Sidebar items={navItems} activeKey={activeKey} onSelect={onSelectNav} />
          <main className={styles.main}>{children}</main>
        </div>

        <footer className={styles.footer}>
          © {new Date().getFullYear()} HermodLabs · Portal POC
        </footer>
      </div>
    </div>
  );
}
