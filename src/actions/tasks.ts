"use server";

import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getTasks(projectId?: string) {
  if (projectId) {
    return await db.select().from(tasks).where(eq(tasks.projectId, projectId));
  }
  return await db.select().from(tasks);
}

export async function createTask(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const label = formData.get("label") as string;
  const taskType = formData.get("taskType") as "HUMAN" | "SYSTEM";
  const startDate = formData.get("startDate") as string;
  const dueDate = formData.get("dueDate") as string;

  await db.insert(tasks).values({
    projectId,
    label,
    taskType,
    startDate: startDate || null,
    dueDate: dueDate || null,
    status: "PENDING",
  });

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
