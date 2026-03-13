"use server";

import { db } from "@/lib/db";
import { members, teams, projectMembers, taskMembers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { AVATAR_COLORS } from "@/lib/avatar-colors";

function randomColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

// ── Teams ────────────────────────────────────────────────────────────────────
export async function getTeams() {
  return db.select().from(teams).orderBy(teams.name);
}

export async function createTeam(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string | null;
  await db.insert(teams).values({ name, description: description || null });
  revalidatePath("/[locale]/members", "page");
}

export async function updateTeam(
  teamId: string,
  data: { name: string; description?: string | null }
) {
  await db.update(teams).set(data).where(eq(teams.id, teamId));
  revalidatePath("/[locale]/members", "page");
}

export async function deleteTeam(teamId: string) {
  // Move members in this team to no-team before deleting
  await db
    .update(members)
    .set({ teamId: null })
    .where(eq(members.teamId, teamId));
  await db.delete(teams).where(eq(teams.id, teamId));
  revalidatePath("/[locale]/members", "page");
}

// ── Members ──────────────────────────────────────────────────────────────────
export async function getMembers() {
  return db
    .select({
      id: members.id,
      name: members.name,
      email: members.email,
      teamId: members.teamId,
      avatarUrl: members.avatarUrl,
      avatarColor: members.avatarColor,
      teamName: teams.name,
    })
    .from(members)
    .leftJoin(teams, eq(members.teamId, teams.id))
    .orderBy(members.name);
}

export async function createMember(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const teamId = formData.get("teamId") as string | null;
  const avatarColor = (formData.get("avatarColor") as string) || randomColor();

  await db.insert(members).values({
    name,
    email,
    teamId: teamId || null,
    avatarColor,
  });
  revalidatePath("/[locale]/members", "page");
}

export async function updateMember(
  memberId: string,
  data: { 
    name?: string; 
    email?: string; 
    teamId?: string | null;
    avatarUrl?: string | null;
    avatarColor?: string;
  }
) {
  await db.update(members).set(data).where(eq(members.id, memberId));
  revalidatePath("/[locale]/members", "page");
  revalidatePath("/[locale]", "page");
  revalidatePath("/[locale]/sales-kanban", "page");
  revalidatePath("/[locale]/profile", "page");
}

export async function deleteMember(memberId: string) {
  // Cascade handled by FK, but explicit for safety
  await db.delete(projectMembers).where(eq(projectMembers.memberId, memberId));
  await db.delete(taskMembers).where(eq(taskMembers.memberId, memberId));
  await db.delete(members).where(eq(members.id, memberId));
  revalidatePath("/[locale]/members", "page");
  revalidatePath("/[locale]", "page");
  revalidatePath("/[locale]/sales-kanban", "page");
}

export async function updateMemberAvatar(
  memberId: string,
  updates: { avatarUrl?: string | null; avatarColor?: string }
) {
  await db.update(members).set(updates).where(eq(members.id, memberId));
  revalidatePath("/[locale]/members", "page");
}

// ── Project Members ──────────────────────────────────────────────────────────
export async function getProjectMembers(projectId: string) {
  return db
    .select({
      id: projectMembers.id,
      role: projectMembers.role,
      memberId: members.id,
      memberName: members.name,
      memberEmail: members.email,
      avatarUrl: members.avatarUrl,
      avatarColor: members.avatarColor,
    })
    .from(projectMembers)
    .innerJoin(members, eq(projectMembers.memberId, members.id))
    .where(eq(projectMembers.projectId, projectId));
}

export async function assignProjectMember(
  projectId: string,
  memberId: string,
  role: "ACCOUNT_MANAGER" | "SUB_CONTACT"
) {
  // Only one ACCOUNT_MANAGER per project — remove existing first
  if (role === "ACCOUNT_MANAGER") {
    await db
      .delete(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.role, "ACCOUNT_MANAGER")
        )
      );
  }
  await db.insert(projectMembers).values({ projectId, memberId, role });
  revalidatePath("/[locale]", "page");
  revalidatePath("/[locale]/sales-kanban", "page");
}

export async function removeProjectMember(projectId: string, memberId: string) {
  await db
    .delete(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.memberId, memberId)
      )
    );
  revalidatePath("/[locale]", "page");
  revalidatePath("/[locale]/sales-kanban", "page");
}

// ── Task Members ─────────────────────────────────────────────────────────────
export async function getTaskMembers(taskId: string) {
  return db
    .select({
      id: taskMembers.id,
      role: taskMembers.role,
      memberId: members.id,
      memberName: members.name,
      avatarUrl: members.avatarUrl,
      avatarColor: members.avatarColor,
    })
    .from(taskMembers)
    .innerJoin(members, eq(taskMembers.memberId, members.id))
    .where(eq(taskMembers.taskId, taskId));
}

export async function assignTaskMember(
  taskId: string,
  memberId: string,
  role: "MAIN" | "SUB"
) {
  await db.insert(taskMembers).values({ taskId, memberId, role });
  revalidatePath("/[locale]/tasks", "page");
}

export async function removeTaskMember(taskId: string, memberId: string) {
  await db
    .delete(taskMembers)
    .where(
      and(
        eq(taskMembers.taskId, taskId),
        eq(taskMembers.memberId, memberId)
      )
    );
  revalidatePath("/[locale]/tasks", "page");
}
