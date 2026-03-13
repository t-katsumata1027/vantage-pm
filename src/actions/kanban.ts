"use server";

import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateProjectStatus(projectId: string, newStatus: string) {
  await db.update(projects)
    .set({ status: newStatus })
    .where(eq(projects.id, projectId));
    
  revalidatePath("/");
  revalidatePath("/sales-kanban");
}
