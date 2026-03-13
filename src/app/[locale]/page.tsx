import { getProjects } from "@/actions/projects";
import { getMembers } from "@/actions/members";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import { ProjectList } from "@/components/projects/project-list";
import { getTranslations } from "next-intl/server";

export default async function ProjectsPage() {
  const [projects, members] = await Promise.all([getProjects(), getMembers()]);
  const t = await getTranslations("Projects");

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground mt-2">
            {t("description")}
          </p>
        </div>
        <CreateProjectDialog members={members} />
      </div>

      <ProjectList projects={projects} />
    </div>
  );
}
