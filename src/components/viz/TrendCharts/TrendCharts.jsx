import React from "react";
import styles from "./TrendCharts.module.css";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function AvgLineChart({ data }) {
  return (
    <div className={styles.chart}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="t" stroke="rgba(255,255,255,0.35)" tick={{ fontSize: 11 }} />
          <YAxis stroke="rgba(255,255,255,0.35)" tick={{ fontSize: 11 }} domain={[63, 75]} />
          <Tooltip
            contentStyle={{
              background: "rgba(2,6,23,0.95)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              color: "#e5e7eb",
            }}
          />
          <Line type="monotone" dataKey="avg" strokeWidth={2} dot={false} stroke="rgba(56,189,248,0.9)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MinMaxBandChart({ data }) {
  return (
    <div className={styles.chart}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="t" stroke="rgba(255,255,255,0.35)" tick={{ fontSize: 11 }} />
          <YAxis stroke="rgba(255,255,255,0.35)" tick={{ fontSize: 11 }} domain={[63, 75]} />
          <Tooltip
            contentStyle={{
              background: "rgba(2,6,23,0.95)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              color: "#e5e7eb",
            }}
          />
          <Area type="monotone" dataKey="max" stroke="rgba(56,189,248,0.65)" fill="rgba(56,189,248,0.12)" />
          <Area type="monotone" dataKey="min" stroke="rgba(56,189,248,0.35)" fill="rgba(56,189,248,0.06)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
