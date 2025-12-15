import React from "react";
import styles from "./SettingsPage.module.css";

import { Settings as SettingsIcon } from "lucide-react";
import { Panel } from "../../components/ui/Panel/Panel.jsx";
import { Chip } from "../../components/ui/Chip/Chip.jsx";
import { Slider } from "../../components/ui/Slider/Slider.jsx";

export default function SettingsPage({ model, controls, setControls }) {
  // model is optional; controls are used in the POC
  const thresholds = model?.thresholds;

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div>
          <div className={styles.kicker}>Settings</div>
          <h1 className={styles.h1}>Thresholds & policy (POC)</h1>
          <p className={styles.sub}>
            Where customers configure thresholds, alert routing, and model assumptions.
          </p>
        </div>

        <div className={styles.headerChips}>
          <Chip tone="neutral" icon={SettingsIcon}>Configuration</Chip>
        </div>
      </header>

      <div className={styles.grid}>
        <Panel meta="Policy" title="Alert routing" right={<Chip tone="neutral">Placeholder</Chip>}>
          <div className={styles.policyCard}>
            <div className={styles.policyKicker}>Notify</div>
            <div className={styles.policyBody}>Owner + staff group when low zones persist for 20 minutes.</div>
          </div>

          <div className={styles.policySpacer} />

          <div className={styles.policyCard}>
            <div className={styles.policyKicker}>Escalate</div>
            <div className={styles.policyBody}>Escalate to manager if repeated drift is detected 3 days in a row.</div>
          </div>

          {thresholds ? (
            <>
              <div className={styles.policySpacer} />
              <div className={styles.policyCard}>
                <div className={styles.policyKicker}>Current thresholds</div>
                <div className={styles.policyBody}>
                  Low &lt; {thresholds.LOW_RH}% · High &gt; {thresholds.HIGH_RH}%
                </div>
              </div>
            </>
          ) : null}
        </Panel>

        <Panel meta="Model" title="Demo defaults" right={<Chip tone="accent">Interactive</Chip>}>
          <div className={styles.controls}>
            <Slider
              label="Door cycle intensity"
              value={controls.doorIntensity}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => setControls((c) => ({ ...c, doorIntensity: v }))}
              format={(v) => (v < 0.33 ? "Low" : v < 0.66 ? "Medium" : "High")}
            />

            <Slider
              label="Fan mixing"
              value={controls.fanMix}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => setControls((c) => ({ ...c, fanMix: v }))}
              format={(v) => (v < 0.33 ? "Low" : v < 0.66 ? "Medium" : "High")}
            />

            <div className={styles.note}>
              In a real deployment, these would be derived from room configuration and observed behavior.
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
