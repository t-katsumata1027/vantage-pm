"use client";

import { useState } from "react";
import { DashboardStats } from "@/actions/dashboard";
import { PipelineChart } from "./pipeline-chart";
import { RevenueByTypeChart } from "./revenue-type-chart";
import { ProfitabilityChart } from "./profitability-chart";
import { TargetProgressRing } from "./target-progress-ring";

// ── KPI Card ────────────────────────────────────────────────────────────────
function KpiCard({
  label,
  value,
  sub,
  icon,
  gradient,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: string;
  gradient: string;
}) {
  return (
    <div className="relative rounded-2xl border border-border bg-card p-5 shadow-sm dark:shadow-[0_4px_28px_rgba(0,0,0,0.6),0_1px_0_rgba(255,255,255,0.06)_inset] overflow-hidden group hover:-translate-y-1 hover:shadow-md dark:hover:shadow-[0_8px_36px_rgba(0,0,0,0.7),0_1px_0_rgba(255,255,255,0.08)_inset] transition-all duration-200">
      {/* Gradient accent blob */}
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 blur-2xl ${gradient}`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm ${gradient} bg-opacity-20`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm dark:shadow-[0_4px_28px_rgba(0,0,0,0.6),0_1px_0_rgba(255,255,255,0.06)_inset] overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-muted/30">
        <h2 className="text-sm font-semibold tracking-wide">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ── Main Client Component ────────────────────────────────────────────────────
export function DashboardClient({ stats }: { stats: DashboardStats }) {
  // Annual target setting (local state — can be persisted later)
  const [annualTarget, setAnnualTarget] = useState(50_000_000); // 5,000万円デフォルト
  const [editingTarget, setEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState(String(annualTarget / 10000));

  const formatYen = (v: number) =>
    v >= 1_000_000
      ? `¥${(v / 1_000_000).toFixed(1)}M`
      : `¥${(v / 1_000).toFixed(0)}K`;

  const kpiCards = [
    {
      label: "パイプライン総額",
      value: formatYen(stats.totalPipelineValue),
      sub: `${stats.activeDeals}件が進行中`,
      icon: "📊",
      gradient: "bg-blue-500",
    },
    {
      label: "受注総額",
      value: formatYen(stats.wonRevenue),
      sub: `目標比 ${annualTarget > 0 ? Math.round((stats.wonRevenue / annualTarget) * 100) : 0}%`,
      icon: "🏆",
      gradient: "bg-emerald-500",
    },
    {
      label: "勝率",
      value: `${stats.winRate}%`,
      sub: "受注 / (受注 + 失注)",
      icon: "🎯",
      gradient: "bg-violet-500",
    },
    {
      label: "総工数",
      value: `${stats.totalWorkHours.toLocaleString()}h`,
      sub: "全プロジェクト合計",
      icon: "⏱️",
      gradient: "bg-amber-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <KpiCard key={card.label} {...card} />
        ))}
      </div>

      {/* Annual Target + Progress Row */}
      <SectionCard title="年間売上目標 vs 受注実績">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Progress Ring */}
          <div className="flex-shrink-0">
            <TargetProgressRing
              achieved={stats.wonRevenue}
              target={annualTarget}
            />
          </div>

          {/* Target Setting + Stats */}
          <div className="flex-1 space-y-4 w-full">
            {/* Target input */}
            <div className="flex items-center gap-3">
              <p className="text-sm text-muted-foreground font-medium">年間目標:</p>
              {editingTarget ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={targetInput}
                    onChange={(e) => setTargetInput(e.target.value)}
                    className="w-28 rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const val = Number(targetInput) * 10_000;
                        if (val > 0) setAnnualTarget(val);
                        setEditingTarget(false);
                      }
                    }}
                    autoFocus
                  />
                  <span className="text-sm text-muted-foreground">万円</span>
                  <button
                    onClick={() => {
                      const val = Number(targetInput) * 10_000;
                      if (val > 0) setAnnualTarget(val);
                      setEditingTarget(false);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
                  >
                    保存
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{formatYen(annualTarget)}</span>
                  <button
                    onClick={() => setEditingTarget(true)}
                    className="px-2 py-0.5 rounded-md border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                  >
                    変更
                  </button>
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>受注額</span>
                <span>{annualTarget > 0 ? Math.round((stats.wonRevenue / annualTarget) * 100) : 0}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700"
                  style={{ width: `${Math.min(100, annualTarget > 0 ? (stats.wonRevenue / annualTarget) * 100 : 0)}%` }}
                />
              </div>
            </div>

            {/* Pipeline bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>パイプライン（受注見込）</span>
                <span>{annualTarget > 0 ? Math.round((stats.totalPipelineValue / annualTarget) * 100) : 0}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-700"
                  style={{ width: `${Math.min(100, annualTarget > 0 ? (stats.totalPipelineValue / annualTarget) * 100 : 0)}%` }}
                />
              </div>
            </div>

            {/* Remaining */}
            <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 flex justify-between items-center">
              <span className="text-sm text-muted-foreground">残りパイプライン目標</span>
              <span className="text-sm font-semibold text-primary">
                {formatYen(Math.max(0, annualTarget - stats.wonRevenue - stats.totalPipelineValue))}
              </span>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionCard title="ステージ別パイプライン">
          <PipelineChart data={stats.pipelineByStage} />
        </SectionCard>

        <SectionCard title="種別別売上構成">
          <RevenueByTypeChart data={stats.revenueByType} />
        </SectionCard>
      </div>

      {/* Profitability Full Width */}
      <SectionCard title="プロジェクト採算性（売上 vs 工数）">
        <ProfitabilityChart data={stats.profitabilityData} />
      </SectionCard>
    </div>
  );
}
