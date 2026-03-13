"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type ProfitabilityData = {
  name: string;
  revenue: number;
  hours: number;
  efficiency: number;
};

const formatYen = (v: number) =>
  v >= 1_000_000 ? `¥${(v / 1_000_000).toFixed(1)}M` : v > 0 ? `¥${(v / 1_000).toFixed(0)}K` : "—";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as ProfitabilityData;
  return (
    <div className="rounded-xl border border-border bg-popover px-4 py-3 shadow-lg dark:shadow-[0_8px_32px_rgba(0,0,0,0.6)] max-w-[200px]">
      <p className="font-semibold text-sm mb-2 truncate">{d.name}</p>
      <p className="text-xs text-muted-foreground">売上: <span className="text-foreground font-medium">{formatYen(d.revenue)}</span></p>
      <p className="text-xs text-muted-foreground">工数: <span className="text-foreground font-medium">{d.hours}h</span></p>
      {d.hours > 0 && (
        <p className="text-xs text-muted-foreground">効率: <span className="text-emerald-500 font-medium">{formatYen(d.efficiency)}/h</span></p>
      )}
    </div>
  );
};

export function ProfitabilityChart({ data }: { data: ProfitabilityData[] }) {
  if (!data.length) {
    return (
      <div className="flex h-[260px] items-center justify-center text-muted-foreground text-sm">
        データがありません
      </div>
    );
  }

  const trimmedLabels = data.map((d) => ({
    ...d,
    shortName: d.name.length > 10 ? d.name.slice(0, 10) + "…" : d.name,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={trimmedLabels} margin={{ top: 8, right: 16, left: 0, bottom: 4 }} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="shortName"
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          yAxisId="revenue"
          orientation="left"
          tickFormatter={formatYen}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          width={64}
        />
        <YAxis
          yAxisId="hours"
          orientation="right"
          tickFormatter={(v) => `${v}h`}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
        <Legend
          formatter={(value) => (
            <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
              {value === "revenue" ? "売上" : "工数(h)"}
            </span>
          )}
        />
        <Bar yAxisId="revenue" dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} name="revenue" barSize={22} />
        <Bar yAxisId="hours" dataKey="hours" fill="#f59e0b" radius={[6, 6, 0, 0]} name="hours" barSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}
