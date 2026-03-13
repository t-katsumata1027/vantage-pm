"use server";

import { db } from "@/lib/db";
import { members, teams, projects, workLogs, projectMembers } from "@/lib/db/schema";
import { sql, eq, and, inArray, desc } from "drizzle-orm";

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

export async function getDashboardStats(accountManagerId?: string): Promise<DashboardStats> {
  // ... (existing implementation)
  // Base query for projects
  let projectQuery = db
    .select({
      id: projects.id,
      name: projects.name,
      type: projects.type,
      status: projects.status,
      revenue: projects.revenue,
    })
    .from(projects);

  if (accountManagerId) {
    // If accountManagerId is provided, filter by project members
    const pmSubquery = db
      .select({ projectId: projectMembers.projectId })
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.memberId, accountManagerId),
          eq(projectMembers.role, "ACCOUNT_MANAGER")
        )
      );
    
    const pmResults = await pmSubquery;
    const projectIds = pmResults.map(r => r.projectId);
    
    if (projectIds.length === 0) {
      return {
        totalPipelineValue: 0,
        wonRevenue: 0,
        activeDeals: 0,
        winRate: 0,
        totalWorkHours: 0,
        pipelineByStage: [],
        revenueByType: [],
        profitabilityData: [],
      };
    }
    
    projectQuery = projectQuery.where(inArray(projects.id, projectIds)) as any;
  }

  // All sales projects for this view
  const allProjects = (await projectQuery).filter((p) => p.type === "SALES");
  const allProjectsAll = await projectQuery; // For revenueByType and profitability that might include other types

  // Total work hours (scoped to selected projects if filtered)
  let workLogsQuery = db.select({ totalHours: sql<number>`sum(${workLogs.hours})` }).from(workLogs);
  if (accountManagerId) {
    const pmResults = await db
      .select({ projectId: projectMembers.projectId })
      .from(projectMembers)
      .where(and(eq(projectMembers.memberId, accountManagerId), eq(projectMembers.role, "ACCOUNT_MANAGER")));
    const projectIds = pmResults.map(r => r.projectId);
    if (projectIds.length > 0) {
      workLogsQuery = workLogsQuery.where(inArray(workLogs.projectId, projectIds)) as any;
    } else {
      // No projects for this member
      return {
        totalPipelineValue: 0,
        wonRevenue: 0,
        activeDeals: 0,
        winRate: 0,
        totalWorkHours: 0,
        pipelineByStage: [],
        revenueByType: [],
        profitabilityData: [],
      };
    }
  }
  const workLogsResult = await workLogsQuery;
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

  // Revenue by project type
  const typeMap: Record<string, number> = {};
  for (const p of allProjectsAll) {
    if (!typeMap[p.type]) typeMap[p.type] = 0;
    typeMap[p.type] += Number(p.revenue ?? 0);
  }
  const revenueByType = Object.entries(typeMap).map(([type, value]) => ({ type, value }));

  // Profitability
  const projectWorkLogsQuery = db
    .select({
      projectId: workLogs.projectId,
      totalHours: sql<number>`sum(${workLogs.hours})`,
    })
    .from(workLogs)
    .groupBy(workLogs.projectId);
  
  if (accountManagerId) {
    const pmResults = await db
      .select({ projectId: projectMembers.projectId })
      .from(projectMembers)
      .where(and(eq(projectMembers.memberId, accountManagerId), eq(projectMembers.role, "ACCOUNT_MANAGER")));
    const projectIds = pmResults.map(r => r.projectId);
    if (projectIds.length > 0) {
      projectWorkLogsQuery.where(inArray(workLogs.projectId, projectIds));
    }
  }
  
  const projectWorkLogs = await projectWorkLogsQuery;

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

export type MemberStats = {
  memberId: string;
  name: string;
  avatarUrl: string | null;
  avatarColor: string;
  teamName: string | null;
  wonRevenue: number;
  activeDeals: number;
  winRate: number;
};

export async function getMembersStats(): Promise<MemberStats[]> {
  // Get all members with their teams
  const allMembers = await db
    .select({
      id: members.id,
      name: members.name,
      avatarUrl: members.avatarUrl,
      avatarColor: members.avatarColor,
      teamName: teams.name,
    })
    .from(members)
    .leftJoin(teams, eq(members.teamId, teams.id));

  // Get project counts and revenue per member (as AM)
  const amProjects = await db
    .select({
      memberId: projectMembers.memberId,
      status: projects.status,
      revenue: projects.revenue,
    })
    .from(projectMembers)
    .innerJoin(projects, eq(projectMembers.projectId, projects.id))
    .where(and(eq(projectMembers.role, "ACCOUNT_MANAGER"), eq(projects.type, "SALES")));

  return allMembers.map(m => {
    const mProjects = amProjects.filter(p => p.memberId === m.id);
    const won = mProjects.filter(p => p.status === "WON");
    const lost = mProjects.filter(p => p.status === "LOST");
    const active = mProjects.filter(p => !["WON", "LOST"].includes(p.status));

    const wonRevenue = won.reduce((acc, p) => acc + Number(p.revenue ?? 0), 0);
    const winRate = won.length + lost.length > 0 ? Math.round((won.length / (won.length + lost.length)) * 100) : 0;

    return {
      memberId: m.id,
      name: m.name,
      avatarUrl: m.avatarUrl,
      avatarColor: m.avatarColor,
      teamName: m.teamName,
      wonRevenue,
      activeDeals: active.length,
      winRate,
    };
  }).sort((a, b) => b.wonRevenue - a.wonRevenue);
}

export type TeamStats = {
  teamId: string;
  name: string;
  description: string | null;
  memberCount: number;
  wonRevenue: number;
  activeDeals: number;
};

export async function getTeamsStats(): Promise<TeamStats[]> {
  const allTeams = await db.select().from(teams);
  const allMembers = await db.select({ id: members.id, teamId: members.teamId }).from(members);
  
  // Reuse AM projects data for calculation
  const amProjects = await db
    .select({
      memberId: projectMembers.memberId,
      status: projects.status,
      revenue: projects.revenue,
    })
    .from(projectMembers)
    .innerJoin(projects, eq(projectMembers.projectId, projects.id))
    .where(and(eq(projectMembers.role, "ACCOUNT_MANAGER"), eq(projects.type, "SALES")));

  return allTeams.map(t => {
    const teamMemberIds = allMembers.filter(m => m.teamId === t.id).map(m => m.id);
    const tProjects = amProjects.filter(p => teamMemberIds.includes(p.memberId));
    
    const won = tProjects.filter(p => p.status === "WON");
    const active = tProjects.filter(p => !["WON", "LOST"].includes(p.status));
    const wonRevenue = won.reduce((acc, p) => acc + Number(p.revenue ?? 0), 0);

    return {
      teamId: t.id,
      name: t.name,
      description: t.description,
      memberCount: teamMemberIds.length,
      wonRevenue,
      activeDeals: active.length,
    };
  }).sort((a, b) => b.wonRevenue - a.wonRevenue);
}
