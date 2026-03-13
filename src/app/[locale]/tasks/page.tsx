import { getProjects } from "@/actions/projects";
import { getTasks } from "@/actions/tasks";
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog";
import { GanttChart } from "@/components/tasks/gantt-chart";
import { getTranslations } from "next-intl/server";

export default async function TasksPage() {
  const projects = await getProjects();
  const tasks = await getTasks();
  const t = await getTranslations("Tasks");

  return (
    <div className="container mx-auto p-6 space-y-6 h-[calc(100vh-3.5rem)] flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground mt-2">
            {t("description")}
          </p>
        </div>
        <CreateTaskDialog projects={projects} />
      </div>

      <div className="flex-1 overflow-hidden min-h-[500px]">
        <GanttChart tasks={tasks} projects={projects} />
      </div>
    </div>
  );
}
