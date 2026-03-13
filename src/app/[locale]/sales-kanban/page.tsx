import { getProjects } from "@/actions/projects";
import { SalesKanbanBoard } from "@/components/projects/sales-kanban-board";
import { getTranslations } from "next-intl/server";

export default async function SalesKanbanPage() {
  const projects = await getProjects();
  const salesProjects = projects.filter(p => p.type === "SALES");
  const t = await getTranslations("Kanban");

  return (
    <div className="container mx-auto p-6 space-y-8 h-[calc(100vh-3.5rem)] flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground mt-2">
            {t("description")}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <SalesKanbanBoard initialProjects={salesProjects} />
      </div>
    </div>
  );
}
