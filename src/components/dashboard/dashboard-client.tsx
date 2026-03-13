"use client";

import { useState, useTransition } from "react";
import { getDashboardStats, getMembersStats, getTeamsStats, type MemberStats, type TeamStats, type DashboardStats } from "@/actions/dashboard";
import { MemberAvatar } from "@/components/ui/member-avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Briefcase, 
  DollarSign, 
  Percent, 
  Clock,
  ArrowUpRight,
  Target,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PipelineChart } from "@/components/dashboard/pipeline-chart";
import { RevenueByTypeChart } from "@/components/dashboard/revenue-type-chart";
import { ProfitabilityChart } from "@/components/dashboard/profitability-chart";
import { TargetProgressRing } from "@/components/dashboard/target-progress-ring";

type Member = {
  id: string;
  name: string;
  avatarUrl: string | null;
  avatarColor: string;
};

export function DashboardClient({
  initialStats,
  members,
}: {
  initialStats: DashboardStats;
  members: Member[];
}) {
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [memberStats, setMemberStats] = useState<MemberStats[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [isPending, startTransition] = useTransition();

  // Annual target setting
  const [annualTarget, setAnnualTarget] = useState(50_000_000); 
  const [editingTarget, setEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState(String(annualTarget / 10000));

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "members" && memberStats.length === 0) {
      startTransition(async () => {
        const data = await getMembersStats();
        setMemberStats(data);
      });
    } else if (value === "teams" && teamStats.length === 0) {
      startTransition(async () => {
        const data = await getTeamsStats();
        setTeamStats(data);
      });
    }
  };

  const formatYen = (v: number) =>
    v >= 1_000_000
      ? `¥${(v / 1_000_000).toFixed(1)}M`
      : `¥${(v / 1_000).toFixed(0)}K`;

  const formatCurrencyFull = (value: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-end">
        <TabsList className="grid w-full md:w-auto grid-cols-3 bg-muted/50 p-1 rounded-xl border border-border/50 h-11">
          <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all px-6">
            全体
          </TabsTrigger>
          <TabsTrigger value="teams" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all px-6">
            チーム別
          </TabsTrigger>
          <TabsTrigger value="members" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all px-6">
            担当者別
          </TabsTrigger>
        </TabsList>
      </div>

      <div className={cn("transition-all duration-300", isPending && "opacity-50 pointer-events-none")}>
        <TabsContent value="overview" className="m-0 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-500/10 rounded-xl">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                  </div>
                  <Target className="w-4 h-4 text-muted-foreground/30" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">パイプライン総額</p>
                  <p className="text-2xl font-bold">{formatYen(stats.totalPipelineValue)}</p>
                  <p className="text-xs text-muted-foreground">{stats.activeDeals}件が進行中</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-emerald-500/10 rounded-xl">
                    <DollarSign className="w-5 h-5 text-emerald-500" />
                  </div>
                  <span className="text-xs font-bold text-emerald-500">
                    {annualTarget > 0 ? Math.round((stats.wonRevenue / annualTarget) * 100) : 0}%
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">受注総額</p>
                  <p className="text-2xl font-bold">{formatYen(stats.wonRevenue)}</p>
                  <p className="text-xs text-muted-foreground">目標比達成率</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-violet-500/10 rounded-xl">
                    <Percent className="w-5 h-5 text-violet-500" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">平均勝率</p>
                  <p className="text-2xl font-bold">{stats.winRate}%</p>
                  <p className="text-xs text-muted-foreground">受注 / (受注 + 失注)</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-amber-500/10 rounded-xl">
                    <Briefcase className="w-5 h-5 text-amber-500" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">総稼働工数</p>
                  <p className="text-2xl font-bold">{stats.totalWorkHours.toLocaleString()}h</p>
                  <p className="text-xs text-muted-foreground">全プロジェクト合計</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Target Card */}
            <Card className="lg:col-span-3 border-none shadow-xl bg-card overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
              <CardHeader className="relative">
                <CardTitle className="text-lg font-bold">売上目標 vs 受注実績</CardTitle>
                <CardDescription>年間目標に対する現在の進捗状況</CardDescription>
              </CardHeader>
              <CardContent className="relative flex flex-col md:flex-row items-center gap-12 p-8 pt-2">
                <div className="flex-shrink-0">
                  <TargetProgressRing achieved={stats.wonRevenue} target={annualTarget} />
                </div>
                <div className="flex-1 space-y-6 w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <p className="text-sm text-muted-foreground font-medium">目標設定:</p>
                      {editingTarget ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={targetInput}
                            onChange={(e) => setTargetInput(e.target.value)}
                            className="w-24 h-9 rounded-lg border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/40 outline-none"
                            autoFocus
                          />
                          <span className="text-sm text-muted-foreground">万円</span>
                          <Button size="sm" onClick={() => {
                            const val = Number(targetInput) * 10_000;
                            if (val > 0) setAnnualTarget(val);
                            setEditingTarget(false);
                          }}>保存</Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">{formatCurrencyFull(annualTarget)}</span>
                          <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => setEditingTarget(true)}>変更</Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-tighter text-muted-foreground">
                        <span>受注確定額</span>
                        <span className="text-primary">{Math.round((stats.wonRevenue / annualTarget) * 100)}%</span>
                      </div>
                      <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-1000 ease-out" 
                          style={{ width: `${Math.min(100, (stats.wonRevenue / annualTarget) * 100)}%` }} 
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-tighter text-muted-foreground">
                        <span>見込合計 (受注+パイプライン)</span>
                        <span className="text-blue-500">{Math.round(((stats.wonRevenue + stats.totalPipelineValue) / annualTarget) * 100)}%</span>
                      </div>
                      <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-1000 ease-out" 
                          style={{ width: `${Math.min(100, ((stats.wonRevenue + stats.totalPipelineValue) / annualTarget) * 100)}%` }} 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-muted/30 p-4 border border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">目標達成まで残り</span>
                    </div>
                    <span className="text-lg font-bold text-primary">{formatCurrencyFull(Math.max(0, annualTarget - stats.wonRevenue))}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-8">
              <Card className="border-none shadow-xl bg-card h-full">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">商談フェーズ分布</CardTitle>
                </CardHeader>
                <CardContent>
                  <PipelineChart data={stats.pipelineByStage} />
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1 space-y-8">
              <Card className="border-none shadow-xl bg-card h-full">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">プロジェクト種別</CardTitle>
                </CardHeader>
                <CardContent>
                  <RevenueByTypeChart data={stats.revenueByType} />
                </CardContent>
              </Card>
            </div>

            <Card className="lg:col-span-3 border-none shadow-xl bg-card">
              <CardHeader>
                <CardTitle className="text-lg font-bold">プロジェクト採算性モニタリング</CardTitle>
              </CardHeader>
              <CardContent>
                <ProfitabilityChart data={stats.profitabilityData} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="teams" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamStats.map((team) => (
              <Card key={team.teamId} className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 group overflow-hidden bg-card/60">
                <div className="h-1.5 bg-gradient-to-r from-primary to-blue-500" />
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">{team.name}</CardTitle>
                    <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                  <CardDescription className="line-clamp-2 min-h-[40px]">{team.description || "説明なし"}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">受注売上</span>
                    <span className="font-bold text-lg">{formatCurrencyFull(team.wonRevenue)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/40 rounded-2xl p-4 text-center">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">進行中案件</p>
                      <p className="text-xl font-black">{team.activeDeals}</p>
                    </div>
                    <div className="bg-muted/40 rounded-2xl p-4 text-center">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">メンバー数</p>
                      <p className="text-xl font-black">{team.memberCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="members" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {memberStats.map((member) => (
              <Card key={member.memberId} className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 group overflow-hidden bg-card/60">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="relative mb-4">
                      <MemberAvatar
                        name={member.name}
                        avatarUrl={member.avatarUrl}
                        avatarColor={member.avatarColor}
                        size="lg"
                        className="w-20 h-20 shadow-xl border-4 border-background"
                      />
                      <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white border-4 border-background shadow-lg">
                        <Users className="w-3 h-3" />
                      </div>
                    </div>
                    <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{member.name}</h3>
                    <p className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full mt-2 uppercase tracking-tighter">
                      {member.teamName || "Personal"}
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-muted/20 px-4 py-3 rounded-2xl">
                      <span className="text-xs font-bold text-muted-foreground uppercase">受注売上</span>
                      <span className="font-bold text-sm tracking-tight">{formatCurrencyFull(member.wonRevenue)}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 pb-2">
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">進行中</p>
                        <p className="font-bold">{member.activeDeals}件</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">勝率</p>
                        <p className="font-bold">{member.winRate}%</p>
                      </div>
                    </div>

                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-1000 ease-in-out" 
                        style={{ width: `${member.winRate}%` }} 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
}
