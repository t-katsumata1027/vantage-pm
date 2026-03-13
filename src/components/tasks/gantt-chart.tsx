"use client";

import { useTranslations } from "next-intl";
import { format, eachDayOfInterval, addDays, min, max, differenceInDays, isSameDay } from "date-fns";
import { MemberAvatar } from "@/components/ui/member-avatar";
import { Badge } from "@/components/ui/badge";

type Project = {
  id: string;
  name: string;
};

type Task = {
  id: string;
  projectId: string;
  label: string;
  taskType: string;
  status: string;
  startDate: string | null;
  dueDate: string | null;
  mainMember?: {
    id: string;
    name: string;
    avatarUrl: string | null;
    avatarColor: string;
  } | null;
};

export function GanttChart({ tasks, projects }: { tasks: Task[], projects: Project[] }) {
  const t = useTranslations("Tasks");

  // Filter tasks that have both dates
  const scheduledTasks = tasks.filter(t => t.startDate && t.dueDate);
  
  // Calculate date range
  const today = new Date();
  let startDate = addDays(today, -7);
  let endDate = addDays(today, 23); // Default 30 days

  if (scheduledTasks.length > 0) {
    const dates = scheduledTasks.flatMap(t => [new Date(t.startDate!), new Date(t.dueDate!)]);
    const minD = min(dates);
    const maxD = max(dates);
    
    // Add padding to the visual range
    startDate = addDays(minD, -7);
    endDate = addDays(maxD, 14);
  }

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const numDays = days.length;

  const projectGroups = projects.map(project => {
    return {
      ...project,
      tasks: scheduledTasks.filter(t => t.projectId === project.id)
    };
  }).filter(p => p.tasks.length > 0);

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center p-12 text-center text-muted-foreground border rounded-lg bg-muted/20">
        {t("gantt.no_tasks")}
      </div>
    );
  }

  return (
    <div className="relative border rounded-lg overflow-x-auto bg-background h-full shadow-sm">
      <div className="min-w-max">
        {/* Header (Dates) */}
        <div className="flex border-b bg-muted/40 sticky top-0 z-10 w-full">
          {/* Fixed column for labels */}
          <div className="w-72 shrink-0 border-r p-3 font-semibold text-sm flex items-center sticky left-0 bg-muted/40 z-20">
            Project / Task / Assignee
          </div>
          {/* Days */}
          <div className="flex flex-1" style={{ minWidth: `${numDays * 40}px` }}>
            {days.map((day, idx) => {
              const isToday = isSameDay(day, today);
              return (
                <div 
                  key={idx} 
                  className={`w-[40px] shrink-0 border-r p-2 flex flex-col items-center justify-center text-xs ${isToday ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground'}`}
                >
                  <span>{format(day, "MMM")}</span>
                  <span>{format(day, "d")}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Body (Projects & Tasks) */}
        <div className="flex flex-col w-full relative">
          {/* Today line marker */}
          <div 
            className="absolute top-0 bottom-0 border-l-2 border-primary/50 z-0 pointer-events-none" 
            style={{ 
              left: `calc(288px + ${differenceInDays(today, startDate)} * 40px + 20px)`,
              display: (today >= startDate && today <= endDate) ? 'block' : 'none'
            }} 
          />

          {projectGroups.map((group) => (
            <div key={group.id} className="flex flex-col w-full border-b last:border-0 relative z-10">
              {/* Project Row */}
              <div className="flex w-full bg-muted/10">
                <div className="w-72 shrink-0 border-r p-3 font-semibold text-sm sticky left-0 bg-background/95 z-10">
                  {group.name}
                </div>
                <div className="flex-1 min-w-[${numDays * 40}px]" />
              </div>

              {/* Task Rows */}
              {group.tasks.map((task) => {
                const taskStart = new Date(task.startDate!);
                const taskEnd = new Date(task.dueDate!);
                const startOffsetDays = differenceInDays(taskStart, startDate);
                const durationDays = differenceInDays(taskEnd, taskStart) + 1; // Inclusive

                return (
                  <div key={task.id} className="flex w-full group hover:bg-muted/30 transition-colors">
                    <div className="w-72 shrink-0 border-r p-3 pl-6 text-sm flex items-center gap-2 sticky left-0 bg-background group-hover:bg-muted/30 z-10">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                      <span className="truncate flex-1">{task.label}</span>
                      {task.mainMember && (
                        <div className="shrink-0" title={task.mainMember.name}>
                          <MemberAvatar
                            name={task.mainMember.name}
                            avatarUrl={task.mainMember.avatarUrl}
                            avatarColor={task.mainMember.avatarColor}
                            size="xs"
                          />
                        </div>
                      )}
                      {task.status === "DONE" && <Badge variant="secondary" className="text-[10px] w-auto h-5 px-1">Done</Badge>}
                    </div>
                    
                    <div className="flex-1 relative border-b border-muted/20" style={{ minWidth: `${numDays * 40}px` }}>
                      {/* Grid lines inside row */}
                      <div className="absolute inset-0 flex pointer-events-none">
                        {days.map((_, i) => (
                          <div key={i} className="w-[40px] shrink-0 border-r border-dashed border-muted/30" />
                        ))}
                      </div>

                      {/* Task Bar */}
                      {startOffsetDays >= 0 && (
                        <div 
                          className={`absolute my-2 h-8 rounded-md shadow flex items-center gap-2 px-3 text-xs font-semibold truncate cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md ${
                            task.taskType === 'HUMAN' 
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-600/20' 
                              : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-600/20'
                          }`}
                          style={{
                            left: `${startOffsetDays * 40}px`,
                            width: `${durationDays * 40}px`,
                          }}
                          title={`${task.label} (${format(taskStart, "MM/dd")} - ${format(taskEnd, "MM/dd")}) ${task.mainMember ? ' - Assigned to: ' + task.mainMember.name : ''}`}
                        >
                          {task.mainMember && durationDays > 1 && (
                            <MemberAvatar
                              name={task.mainMember.name}
                              avatarUrl={task.mainMember.avatarUrl}
                              avatarColor={task.mainMember.avatarColor}
                              size="xs"
                              className="border-white/20"
                            />
                          )}
                          <span className="truncate">{task.label}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Unscheduled Tasks */}
          {tasks.filter(t => !t.startDate || !t.dueDate).length > 0 && (
             <div className="flex flex-col w-full border-b last:border-0 relative z-10">
               <div className="flex w-full bg-muted/10">
                 <div className="w-72 shrink-0 border-r p-3 font-semibold text-sm sticky left-0 bg-background/95 z-10 text-muted-foreground">
                   {t("gantt.unscheduled")}
                 </div>
                 <div className="flex-1 min-w-[${numDays * 40}px]" />
               </div>
               {tasks.filter(t => !t.startDate || !t.dueDate).map((task) => (
                  <div key={task.id} className="flex w-full group hover:bg-muted/30 transition-colors">
                    <div className="w-72 shrink-0 border-r p-3 pl-6 text-sm flex items-center sticky left-0 bg-background group-hover:bg-muted/30 z-10 text-muted-foreground gap-2">
                      <span className="truncate flex-1">{task.label}</span>
                      {task.mainMember && (
                        <div className="shrink-0" title={task.mainMember.name}>
                          <MemberAvatar
                            name={task.mainMember.name}
                            avatarUrl={task.mainMember.avatarUrl}
                            avatarColor={task.mainMember.avatarColor}
                            size="xs"
                          />
                        </div>
                      )}
                    </div>
                  </div>
               ))}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
