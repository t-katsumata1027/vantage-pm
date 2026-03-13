"use server";

import { db } from "@/lib/db";
import { projects, projectMembers, members } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export type ProjectWithMembers = {
  id: string;
  name: string;
  type: string;
  status: string;
  revenue: string | null;
  probability: number | null;
  duration: number | null;
  customFields: unknown;
  accountManager: {
    id: string; name: string; avatarUrl: string | null; avatarColor: string;
  } | null;
  subContacts: {
    id: string; name: string; avatarUrl: string | null; avatarColor: string;
  }[];
};

export async function getProjects(): Promise<ProjectWithMembers[]> {
  // Get all projects
  const allProjects = await db.select().from(projects).orderBy(projects.id);

  // Get all project members with member info
  const allPm = await db
    .select({
      projectId: projectMembers.projectId,
      role: projectMembers.role,
      memberId: members.id,
      memberName: members.name,
      avatarUrl: members.avatarUrl,
      avatarColor: members.avatarColor,
    })
    .from(projectMembers)
    .innerJoin(members, eq(projectMembers.memberId, members.id));

  return allProjects.map((p) => {
    const pms = allPm.filter((pm) => pm.projectId === p.id);
    const am = pms.find((pm) => pm.role === "ACCOUNT_MANAGER");
    const subs = pms.filter((pm) => pm.role === "SUB_CONTACT");
    return {
      ...p,
      revenue: p.revenue ?? null,
      probability: p.probability ?? null,
      duration: p.duration ?? null,
      accountManager: am
        ? { id: am.memberId, name: am.memberName, avatarUrl: am.avatarUrl, avatarColor: am.avatarColor }
        : null,
      subContacts: subs.map((s) => ({
        id: s.memberId, name: s.memberName, avatarUrl: s.avatarUrl, avatarColor: s.avatarColor,
      })),
    };
  });
}

export async function createProject(formData: FormData) {
  const name = formData.get("name") as string;
  const type = formData.get("type") as "SALES" | "ALLIANCE" | "PROMO" | "RD";
  const revenue = formData.get("revenue") ? Number(formData.get("revenue")) : null;
  const probability = formData.get("probability") ? Number(formData.get("probability")) : null;
  const duration = formData.get("duration") ? Number(formData.get("duration")) : null;
  const accountManagerId = formData.get("accountManagerId") as string | null;

  const [inserted] = await db.insert(projects).values({
    name,
    type,
    revenue: revenue?.toString(),
    probability,
    duration,
  }).returning({ id: projects.id });

  // Assign account manager if provided
  if (accountManagerId && inserted?.id) {
    await db.insert(projectMembers).values({
      projectId: inserted.id,
      memberId: accountManagerId,
      role: "ACCOUNT_MANAGER",
    });
  }

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/sales-kanban");
}
