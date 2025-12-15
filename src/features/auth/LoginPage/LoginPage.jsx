import React, { useState } from "react";
import styles from "./LoginPage.module.css";
import { ShieldCheck, Grid3X3, BarChart3, DoorOpen, Settings } from "lucide-react";

import { Button } from "../../../components/ui/Button/Button.jsx";
import { Chip } from "../../../components/ui/Chip/Chip.jsx";

export default function LoginPage({ onLogin }) {
  const [tenant, setTenant] = useState("Cedar & Ash Cigar Lounge");
  const [roomName, setRoomName] = useState("Walk-in Humidor");

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.kicker}>Portal POC</div>
        <h1 className={styles.h1}>Cigar room monitoring portal</h1>
        <p className={styles.lead}>
          Customer-experience-first demo. Data is simulated. This shows what your team would use if the room were
          instrumented.
        </p>

        <div className={styles.grid}>
          <div className={styles.box}>
            <div className={styles.kicker}>Enter a demo tenant</div>

            <label className={styles.label}>
              <div className={styles.labelText}>Business</div>
              <input className={styles.input} value={tenant} onChange={(e) => setTenant(e.target.value)} />
            </label>

            <label className={styles.label}>
              <div className={styles.labelText}>Room</div>
              <input className={styles.input} value={roomName} onChange={(e) => setRoomName(e.target.value)} />
            </label>

            <div className={styles.actions}>
              <Button variant="primary" onClick={() => onLogin({ tenant, roomName })}>
                Enter portal
              </Button>
              <Chip tone="accent" icon={ShieldCheck}>
                POC · simulated
              </Chip>
            </div>

            <p className={styles.note}>
              In production this would be SSO. For the POC, it drops you into the portal immediately.
            </p>
          </div>

          <div className={`${styles.box} ${styles.boxAlt}`}>
            <div className={styles.kicker}>What this proves</div>
            <p className={styles.lead2}>
              The portal UX is the product story: map → drift pockets → event correlation → action.
            </p>

            <div className={styles.rows}>
              <FeatureRow icon={Grid3X3} title="Room map" body="Spatial slice; see drift pockets and corridors." />
              <FeatureRow icon={BarChart3} title="Trends" body="Avg/min/max bands reveal variance and instability." />
              <FeatureRow icon={DoorOpen} title="Events" body="Door cycles and activity correlated with drift." />
              <FeatureRow icon={Settings} title="Policy" body="Thresholds and alert routing (POC)." />
            </div>
          </div>
        </div>

        <div className={styles.footer}>© {new Date().getFullYear()} HermodLabs</div>
      </div>
    </div>
  );
}

function FeatureRow({ icon: Icon, title, body }) {
  return (
    <div className={styles.row}>
      <Icon size={18} className={styles.rowIcon} />
      <div>
        <div className={styles.rowTitle}>{title}</div>
        <div className={styles.rowBody}>{body}</div>
      </div>
    </div>
  );
}
