"use server";

import { db } from "@/lib/db";
import { projects, workLogs } from "@/lib/db/schema";
import { sql, eq, and, not, inArray } from "drizzle-orm";

export type DashboardStats = {
  totalPipelineValue: number;
  wonRevenue: number;
  activeDeals: number;
  winRate: number;
  totalWorkHours: number;
  pipelineByStage: { stage: string; value: number; count: number }[];
  revenueByType: { type: string; value: number }[];
  profitabilityData: { name: string; revenue: number; hours: number; efficiency: number }[];
};

export async function getDashboardStats(): Promise<DashboardStats> {
  // All sales projects
  const allProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.type, "SALES"));

  // Total work hours
  const workLogsResult = await db
    .select({ totalHours: sql<number>`sum(${workLogs.hours})` })
    .from(workLogs);

  const totalWorkHours = Number(workLogsResult[0]?.totalHours ?? 0);

  // KPI calculations
  const active = allProjects.filter((p) => !["WON", "LOST"].includes(p.status));
  const won = allProjects.filter((p) => p.status === "WON");
  const lost = allProjects.filter((p) => p.status === "LOST");

  const totalPipelineValue = active.reduce((acc, p) => acc + Number(p.revenue ?? 0), 0);
  const wonRevenue = won.reduce((acc, p) => acc + Number(p.revenue ?? 0), 0);
  const winRate =
    won.length + lost.length > 0
      ? Math.round((won.length / (won.length + lost.length)) * 100)
      : 0;

  // Pipeline by stage
  const stageOrder = ["LEAD", "PLANNING", "PROPOSAL", "WON", "LOST"];
  const pipelineByStage = stageOrder.map((stage) => {
    const stageProjects = allProjects.filter((p) => p.status === stage);
    return {
      stage,
      value: stageProjects.reduce((acc, p) => acc + Number(p.revenue ?? 0), 0),
      count: stageProjects.length,
    };
  });

  // Revenue by project type (all projects)
  const allProjectsAll = await db.select().from(projects);
  const typeMap: Record<string, number> = {};
  for (const p of allProjectsAll) {
    if (!typeMap[p.type]) typeMap[p.type] = 0;
    typeMap[p.type] += Number(p.revenue ?? 0);
  }
  const revenueByType = Object.entries(typeMap).map(([type, value]) => ({ type, value }));

  // Profitability — revenue per project vs work hours logged
  const projectWorkLogs = await db
    .select({
      projectId: workLogs.projectId,
      totalHours: sql<number>`sum(${workLogs.hours})`,
    })
    .from(workLogs)
    .groupBy(workLogs.projectId);

  const profitabilityData = allProjectsAll
    .filter((p) => Number(p.revenue ?? 0) > 0)
    .map((p) => {
      const logEntry = projectWorkLogs.find((wl) => wl.projectId === p.id);
      const hours = Number(logEntry?.totalHours ?? 0);
      const revenue = Number(p.revenue ?? 0);
      const efficiency = hours > 0 ? Math.round(revenue / hours) : 0;
      return { name: p.name, revenue, hours, efficiency };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  return {
    totalPipelineValue,
    wonRevenue,
    activeDeals: active.length,
    winRate,
    totalWorkHours,
    pipelineByStage,
    revenueByType,
    profitabilityData,
  };
}
