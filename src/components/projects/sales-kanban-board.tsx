"use client";

import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Badge } from "@/components/ui/badge";
import { updateProjectStatus } from "@/actions/kanban";
import { useTranslations } from "next-intl";
import { MemberAvatar, AvatarGroup } from "@/components/ui/member-avatar";
import type { ProjectWithMembers } from "@/actions/projects";
import { BarChart2, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

const COLUMNS = [
  { id: "LEAD",     dot: "bg-blue-500",    className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { id: "PLANNING", dot: "bg-amber-500",   className: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  { id: "PROPOSAL", dot: "bg-purple-500",  className: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  { id: "WON",      dot: "bg-emerald-500", className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  { id: "LOST",     dot: "bg-red-500",     className: "bg-red-500/10 text-red-500 border-red-500/20" },
];

const getProbabilityColor = (p: number) => {
  if (p >= 80) return "bg-emerald-500/20 text-emerald-500 border-emerald-500/30";
  if (p >= 50) return "bg-amber-500/20 text-amber-500 border-amber-500/30";
  return "bg-rose-500/20 text-rose-500 border-rose-500/30";
};

export function SalesKanbanBoard({ initialProjects }: { initialProjects: ProjectWithMembers[] }) {
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
    const next = [...data];
    const idx = next.findIndex((p) => p.id === draggableId);
    if (idx > -1) {
      next[idx] = { ...next[idx], status: destStatus };
      setData(next);
      await updateProjectStatus(draggableId, destStatus);
    }
  };

  return (
    <div className="flex gap-6 pb-6 items-start overflow-x-auto p-4 snap-x">
      <DragDropContext onDragEnd={onDragEnd}>
        {COLUMNS.map((col) => {
          const colProjects = data.filter(
            (p) => p.status === col.id || (col.id === "PLANNING" && !p.status)
          );
          return (
            <div
              key={col.id}
              className="flex flex-col w-[320px] shrink-0 rounded-3xl border border-border/40 bg-muted/30 backdrop-blur-sm shadow-xl overflow-hidden snap-center"
            >
              {/* Column Header */}
              <div className="px-5 py-4 flex items-center justify-between border-b border-border/40 bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)] ${col.dot}`} />
                  <span className="font-black text-xs uppercase tracking-widest text-foreground">
                    {t(`columns.${col.id}`)}
                  </span>
                </div>
                <Badge variant="secondary" className="rounded-full px-2.5 h-6 font-black text-[10px] bg-background/50 border-border/50">
                  {colProjects.length}
                </Badge>
              </div>

              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "flex-1 p-4 min-h-[500px] flex flex-col gap-4 transition-all duration-300",
                      snapshot.isDraggingOver ? "bg-primary/5 ring-2 ring-primary/20 ring-inset" : ""
                    )}
                  >
                    {colProjects.map((project, index) => (
                      <Draggable key={project.id} draggableId={project.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={provided.draggableProps.style}
                          >
                            <div
                              className={cn(
                                "group rounded-2xl border p-4 transition-all duration-300 select-none",
                                snapshot.isDragging
                                  ? "bg-card border-primary shadow-2xl scale-[1.05] -rotate-1 z-50 ring-4 ring-primary/10"
                                  : "bg-card/80 border-border/50 hover:border-primary/40 shadow-sm hover:shadow-xl hover:-translate-y-1"
                              )}
                            >
                              {/* Project name */}
                              <h3 className="text-sm font-black leading-snug mb-4 tracking-tight group-hover:text-primary transition-colors">
                                {project.name}
                              </h3>

                              {/* Revenue + probability */}
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold">
                                  <DollarSign className="w-3 h-3 opacity-50" />
                                  <span>
                                    {project.revenue
                                      ? `¥${Number(project.revenue).toLocaleString()}`
                                      : "—"}
                                  </span>
                                </div>
                                {project.probability != null && (
                                  <Badge 
                                    variant="outline" 
                                    className={cn(
                                      "h-5 text-[10px] font-black rounded-full px-2 border-0 shadow-none",
                                      getProbabilityColor(project.probability)
                                    )}
                                  >
                                    {project.probability}%
                                  </Badge>
                                )}
                              </div>

                              {/* Assignees */}
                              {(project.accountManager || project.subContacts.length > 0) && (
                                <div className="flex items-center justify-between pt-4 border-t border-border/30">
                                  {project.accountManager ? (
                                    <div className="flex items-center gap-2" title={`AM: ${project.accountManager.name}`}>
                                      <MemberAvatar
                                        name={project.accountManager.name}
                                        avatarUrl={project.accountManager.avatarUrl}
                                        avatarColor={project.accountManager.avatarColor}
                                        size="xs"
                                        className="ring-2 ring-primary/10"
                                      />
                                      <span className="text-[10px] font-black text-muted-foreground tracking-tighter truncate max-w-[90px] uppercase">
                                        {project.accountManager.name.split(" ")[0]}
                                      </span>
                                    </div>
                                  ) : <div />}
                                  
                                  {project.subContacts.length > 0 && (
                                    <div className="flex -space-x-2">
                                      {project.subContacts.slice(0, 3).map((sub, i) => (
                                        <MemberAvatar
                                          key={sub.id}
                                          name={sub.name}
                                          avatarUrl={sub.avatarUrl}
                                          avatarColor={sub.avatarColor}
                                          size="xs"
                                          className="w-5 h-5 ring-2 ring-background ring-offset-0"
                                        />
                                      ))}
                                      {project.subContacts.length > 3 && (
                                        <div className="w-5 h-5 rounded-full bg-muted border border-border flex items-center justify-center text-[8px] font-black z-10">
                                          +{project.subContacts.length - 3}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
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
