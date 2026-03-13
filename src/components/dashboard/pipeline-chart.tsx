"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

type Stage = { stage: string; value: number; count: number };

const STAGE_LABELS: Record<string, string> = {
  LEAD: "リード",
  PLANNING: "計画中",
  PROPOSAL: "提案中",
  WON: "受注",
  LOST: "失注",
};

const STAGE_COLORS: Record<string, string> = {
  LEAD: "#3b82f6",
  PLANNING: "#f59e0b",
  PROPOSAL: "#8b5cf6",
  WON: "#10b981",
  LOST: "#f43f5e",
};

const formatYen = (value: number) =>
  value >= 1_000_000
    ? `¥${(value / 1_000_000).toFixed(1)}M`
    : `¥${(value / 1_000).toFixed(0)}K`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as Stage;
  return (
    <div className="rounded-xl border border-border bg-popover px-4 py-3 shadow-lg dark:shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
      <p className="font-semibold text-sm mb-1">{STAGE_LABELS[d.stage] ?? d.stage}</p>
      <p className="text-xs text-muted-foreground">案件数: <span className="text-foreground font-medium">{d.count}</span></p>
      <p className="text-xs text-muted-foreground">金額合計: <span className="text-foreground font-medium">{formatYen(d.value)}</span></p>
    </div>
  );
};

export function PipelineChart({ data }: { data: Stage[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 20, right: 16, left: 0, bottom: 4 }} barSize={38}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="stage"
          tickFormatter={(s) => STAGE_LABELS[s] ?? s}
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatYen}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          width={60}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.stage} fill={STAGE_COLORS[entry.stage] ?? "#6b7280"} />
          ))}
          <LabelList
            dataKey="count"
            position="top"
            formatter={(v: any) => (Number(v) > 0 ? `${v}件` : "")}
            style={{ fontSize: 11, fill: "var(--muted-foreground)", fontWeight: 600 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
