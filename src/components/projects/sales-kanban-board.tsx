"use client";

import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Chip } from "@heroui/react";
import { updateProjectStatus } from "@/actions/kanban";
import { useTranslations } from "next-intl";

type Project = {
  id: string;
  name: string;
  type: string;
  status: string;
  revenue: string | null;
  probability: number | null;
};

const COLUMNS = [
  { id: "LEAD",     label: "リード",   dot: "bg-blue-500",   badge: "primary" as const },
  { id: "PLANNING", label: "計画中",   dot: "bg-amber-500",  badge: "warning" as const },
  { id: "PROPOSAL", label: "提案中",   dot: "bg-purple-500", badge: "secondary" as const },
  { id: "WON",      label: "受注",     dot: "bg-emerald-500",badge: "success" as const },
  { id: "LOST",     label: "失注",     dot: "bg-red-500",    badge: "danger" as const },
];

const PROBABILITY_COLOR: (p: number) => "success" | "warning" | "danger" = (p) =>
  p >= 80 ? "success" : p >= 50 ? "warning" : "danger";

export function SalesKanbanBoard({ initialProjects }: { initialProjects: Project[] }) {
  const [isMounted, setIsMounted] = useState(false);
  const [data, setData] = useState(initialProjects);
  const t = useTranslations("Kanban");

  useEffect(() => { setIsMounted(true); }, []);
  if (!isMounted) return null;

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    const destStatus = destination.droppableId;
    const newProjects = [...data];
    const idx = newProjects.findIndex((p) => p.id === draggableId);
    if (idx > -1) {
      newProjects[idx].status = destStatus;
      setData(newProjects);
      await updateProjectStatus(draggableId, destStatus);
    }
  };

  return (
    <div className="flex gap-4 pb-4 items-start overflow-x-auto p-2">
      <DragDropContext onDragEnd={onDragEnd}>
        {COLUMNS.map((col) => {
          const colProjects = data.filter(
            (p) => p.status === col.id || (col.id === "PLANNING" && !p.status)
          );

          return (
            <div
              key={col.id}
              className="flex flex-col w-[290px] shrink-0 rounded-2xl border border-border bg-card shadow-sm dark:shadow-[0_4px_28px_rgba(0,0,0,0.65),0_1px_0_rgba(255,255,255,0.07)_inset] overflow-hidden"
            >
              {/* Column Header */}
              <div className="px-4 py-3 flex items-center justify-between border-b border-border bg-muted/50">
                <span className="flex items-center gap-2 font-semibold text-sm">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.dot} shadow-sm`} />
                  {t(`columns.${col.id}`)}
                </span>
                <Chip size="sm" variant="flat" color={col.badge} className="font-medium">
                  {colProjects.length}
                </Chip>
              </div>

              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-3 min-h-[420px] flex flex-col gap-2.5 transition-colors ${
                      snapshot.isDraggingOver ? "bg-primary/5" : ""
                    }`}
                  >
                    {colProjects.map((project, index) => (
                      <Draggable key={project.id} draggableId={project.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{ ...provided.draggableProps.style }}
                          >
                            {/* Card — explicit bg and border so it contrasts against the column */}
                            <div
                              className={`rounded-xl border p-3.5 transition-all select-none ${
                                snapshot.isDragging
                                  ? "bg-popover border-primary/50 shadow-2xl dark:shadow-[0_12px_40px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.1)_inset] rotate-1 scale-[1.03]"
                                  : "bg-popover border-border hover:border-primary/40 shadow-sm dark:shadow-[0_2px_12px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.06)_inset] hover:shadow-md dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.65),0_1px_0_rgba(255,255,255,0.08)_inset] hover:-translate-y-0.5"
                              }`}
                            >
                              <p className="text-sm font-semibold leading-snug mb-2">{project.name}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                  {project.revenue
                                    ? `¥${Number(project.revenue).toLocaleString()}`
                                    : "—"}
                                </span>
                                {project.probability != null && (
                                  <Chip size="sm" variant="flat" color={PROBABILITY_COLOR(project.probability)}>
                                    {project.probability}%
                                  </Chip>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </DragDropContext>
    </div>
  );
}
