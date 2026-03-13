"use server";

import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";

export async function getProjects() {
  return await db.query.projects.findMany({
    orderBy: (projects, { desc }) => [desc(projects.id)]
  });
}

export async function createProject(formData: FormData) {
  const name = formData.get("name") as string;
  const type = formData.get("type") as "SALES" | "ALLIANCE" | "PROMO" | "RD";
  const revenue = formData.get("revenue") ? Number(formData.get("revenue")) : null;
  const probability = formData.get("probability") ? Number(formData.get("probability")) : null;
  const duration = formData.get("duration") ? Number(formData.get("duration")) : null;

  await db.insert(projects).values({
    name,
    type,
    revenue: revenue?.toString(),
    probability,
    duration,
  });

  revalidatePath("/");
  revalidatePath("/projects");
}
