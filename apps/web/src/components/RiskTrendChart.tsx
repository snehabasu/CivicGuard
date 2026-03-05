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

const CORNER_RADIUS = 2;

type SegmentBarProps = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
  topRounded: boolean;
  bottomRounded: boolean;
};

function SegmentBar({ x = 0, y = 0, width = 0, height = 0, fill, topRounded, bottomRounded }: SegmentBarProps) {
  if (width <= 0 || height <= 0) return null;
  const r = Math.min(CORNER_RADIUS, width / 2, height);

  if (topRounded && bottomRounded) {
    // All four corners rounded — only segment visible in this stack
    return <rect x={x} y={y} width={width} height={height} fill={fill} rx={r} ry={r} />;
  }
  if (topRounded) {
    // Top-left and top-right corners rounded
    return (
      <path
        fill={fill}
        d={`M${x},${y + r} a${r},${r} 0 0 1 ${r},${-r} h${width - 2 * r} a${r},${r} 0 0 1 ${r},${r} v${height - r} h${-width} z`}
      />
    );
  }
  if (bottomRounded) {
    // Bottom-left and bottom-right corners rounded
    return (
      <path
        fill={fill}
        d={`M${x},${y} h${width} v${height - r} a${r},${r} 0 0 1 ${-r},${r} h${-(width - 2 * r)} a${r},${r} 0 0 1 ${-r},${-r} z`}
      />
    );
  }
  return <rect x={x} y={y} width={width} height={height} fill={fill} />;
}

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

  // For each data point, determine which tier is the topmost visible segment
  const topTier = data.map((d) => {
    if (d.high > 0) return "high";
    if (d.medium > 0) return "medium";
    return "low";
  });

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
          {/* Stacked: low (bottom) → medium → high (top).
              Top-corner rounding is applied only to the topmost non-zero segment
              so the bar always looks fully rounded regardless of which tiers are present. */}
          <Bar
            dataKey="low"
            name="Low"
            stackId="risk"
            fill="#b2d8d8"
            shape={(props: Record<string, unknown>) => (
              <SegmentBar
                x={props.x as number}
                y={props.y as number}
                width={props.width as number}
                height={props.height as number}
                fill={props.fill as string}
                topRounded={topTier[props.index as number] === "low"}
                bottomRounded
              />
            )}
          />
          <Bar
            dataKey="medium"
            name="Medium"
            stackId="risk"
            fill="#f5a623"
            shape={(props: Record<string, unknown>) => (
              <SegmentBar
                x={props.x as number}
                y={props.y as number}
                width={props.width as number}
                height={props.height as number}
                fill={props.fill as string}
                topRounded={topTier[props.index as number] === "medium"}
                bottomRounded={false}
              />
            )}
          />
          <Bar
            dataKey="high"
            name="High"
            stackId="risk"
            fill="#ef4444"
            shape={(props: Record<string, unknown>) => (
              <SegmentBar
                x={props.x as number}
                y={props.y as number}
                width={props.width as number}
                height={props.height as number}
                fill={props.fill as string}
                topRounded={topTier[props.index as number] === "high"}
                bottomRounded={false}
              />
            )}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
