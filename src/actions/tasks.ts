"use server";

import { db } from "@/lib/db";
import { tasks, taskMembers, members } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getTasks(projectId?: string) {
  const query = db
    .select({
      id: tasks.id,
      label: tasks.label,
      startDate: tasks.startDate,
      dueDate: tasks.dueDate,
      status: tasks.status,
      taskType: tasks.taskType,
      projectId: tasks.projectId,
      mainMember: {
        id: members.id,
        name: members.name,
        avatarUrl: members.avatarUrl,
        avatarColor: members.avatarColor,
      },
    })
    .from(tasks)
    .leftJoin(taskMembers, and(eq(tasks.id, taskMembers.taskId), eq(taskMembers.role, "MAIN")))
    .leftJoin(members, eq(taskMembers.memberId, members.id));

  if (projectId) {
    return await query.where(eq(tasks.projectId, projectId));
  }
  return await query;
}

export async function createTask(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const label = formData.get("label") as string;
  const taskType = formData.get("taskType") as "HUMAN" | "SYSTEM";
  const startDate = formData.get("startDate") as string;
  const dueDate = formData.get("dueDate") as string;
  const mainMemberId = formData.get("mainMemberId") as string | null;
  const subMemberIds = formData.getAll("subMemberIds") as string[];

  const [inserted] = await db.insert(tasks).values({
    projectId,
    label,
    taskType,
    startDate: startDate || null,
    dueDate: dueDate || null,
    status: "PENDING",
  }).returning({ id: tasks.id });

  if (inserted?.id) {
    // Add main member
    if (mainMemberId) {
      await db.insert(taskMembers).values({
        taskId: inserted.id,
        memberId: mainMemberId,
        role: "MAIN",
      });
    }
    // Add sub members
    if (subMemberIds.length > 0) {
      const values = subMemberIds
        .filter(id => id !== mainMemberId)
        .map(id => ({
          taskId: inserted.id,
          memberId: id,
          role: "SUB" as const,
        }));
      if (values.length > 0) {
        await db.insert(taskMembers).values(values);
      }
    }
  }

  revalidatePath("/");
  revalidatePath("/tasks");
}

export async function updateTaskDates(taskId: string, startDate: string, dueDate: string) {
  await db.update(tasks)
    .set({ startDate, dueDate })
    .where(eq(tasks.id, taskId));

  revalidatePath("/");
  revalidatePath("/tasks");
}

export async function updateTaskStatus(taskId: string, status: string) {
  await db.update(tasks)
    .set({ status })
    .where(eq(tasks.id, taskId));

  revalidatePath("/");
  revalidatePath("/tasks");
}
