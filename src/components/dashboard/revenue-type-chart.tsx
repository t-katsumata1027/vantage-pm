"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type TypeData = { type: string; value: number };

const TYPE_LABELS: Record<string, string> = {
  SALES: "販売",
  ALLIANCE: "協業",
  PROMO: "広報",
  RD: "研究開発",
};

const TYPE_COLORS: Record<string, string> = {
  SALES: "#3b82f6",
  ALLIANCE: "#8b5cf6",
  PROMO: "#f59e0b",
  RD: "#10b981",
};

const formatYen = (v: number) =>
  v >= 1_000_000 ? `¥${(v / 1_000_000).toFixed(1)}M` : `¥${(v / 1_000).toFixed(0)}K`;

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="rounded-xl border border-border bg-popover px-4 py-3 shadow-lg dark:shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
      <p className="font-semibold text-sm">{TYPE_LABELS[name] ?? name}</p>
      <p className="text-xs text-muted-foreground mt-1">{formatYen(value)}</p>
    </div>
  );
};

const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function RevenueByTypeChart({ data }: { data: TypeData[] }) {
  if (data.every((d) => d.value === 0)) {
    return (
      <div className="flex h-[220px] items-center justify-center text-muted-foreground text-sm">
        データがありません
      </div>
    );
  }

  const colored = data.filter((d) => d.value > 0);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={colored}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
          nameKey="type"
          labelLine={false}
          label={renderLabel}
        >
          {colored.map((entry) => (
            <Cell key={entry.type} fill={TYPE_COLORS[entry.type] ?? "#6b7280"} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
              {TYPE_LABELS[value] ?? value}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
