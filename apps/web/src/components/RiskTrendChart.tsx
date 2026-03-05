"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { SessionSummary } from "@/lib/mockNotes";

type Props = {
  sessions: SessionSummary[];
};

export function RiskTrendChart({ sessions }: Props) {
  const data = sessions.map((s, i) => ({
    name: sessions.length === 1 ? s.dateLabel : `S${i + 1}`,
    high: s.highCount,
    medium: s.mediumCount,
    low: s.lowCount,
  }));

  // If all sessions have zero flags, show a minimal empty state
  const allZero = data.every((d) => d.high === 0 && d.medium === 0 && d.low === 0);
  if (allZero) {
    return (
      <div className="h-32 flex items-center justify-center text-xs text-teal-dark/30">
        No stress flags recorded
      </div>
    );
  }

  return (
    <div className="h-32">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: "#5a7a7a" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 10, fill: "#5a7a7a" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{ fontSize: 11, borderRadius: 6, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}
            cursor={{ fill: "rgba(0,0,0,0.04)" }}
          />
          {/* Stacked: low (bottom) → medium → high (top) */}
          <Bar dataKey="low" name="Low" stackId="risk" fill="#b2d8d8" radius={[0, 0, 2, 2]} />
          <Bar dataKey="medium" name="Medium" stackId="risk" fill="#f5a623" />
          <Bar dataKey="high" name="High" stackId="risk" fill="#ef4444" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
