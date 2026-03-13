"use client";

import { createTask } from "@/actions/tasks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { MemberAvatar, AvatarGroup } from "@/components/ui/member-avatar";
import { PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Project = {
  id: string;
  name: string;
};

type Member = {
  id: string;
  name: string;
  avatarUrl: string | null;
  avatarColor: string;
};

export function CreateTaskDialog({
  projects,
  members,
}: {
  projects: Project[];
  members: Member[];
}) {
  const [open, setOpen] = useState(false);
  const [projectId, setProjectId] = useState<string>(projects[0]?.id || "");
  const [taskType, setTaskType] = useState<string>("HUMAN");
  const [mainMemberId, setMainMemberId] = useState<string>("");
  const [subMemberIds, setSubMemberIds] = useState<string[]>([]);
  const t = useTranslations("Tasks");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (!projectId) return;
    formData.append("projectId", projectId);
    formData.append("taskType", taskType);
    if (mainMemberId) {
      formData.append("mainMemberId", mainMemberId);
    }
    subMemberIds.forEach((id) => {
      formData.append("subMemberIds", id);
    });
    await createTask(formData);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="font-medium gap-2">
          <PlusCircle className="w-4 h-4" />
          {t("new_task")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[540px] p-0 overflow-hidden border-none shadow-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="p-6 bg-muted/30 border-b border-border/50">
            <DialogTitle className="text-xl font-bold tracking-tight">
              {t("form.title")}
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {t("form.description")}
            </p>
          </DialogHeader>

          <div className="p-6 space-y-5">
            {/* Project Selection */}
            <div className="space-y-2">
              <Label htmlFor="project" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("form.project")}
              </Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger id="project" className="h-11 bg-muted/20 border-border/60 hover:border-primary/50 transition-colors">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Task Label */}
            <div className="space-y-2">
              <Label htmlFor="label" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("form.label")}
              </Label>
              <Input
                id="label"
                name="label"
                required
                placeholder={t("form.label_placeholder")}
                className="h-11 bg-muted/20 border-border/60 focus:border-primary/50 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Task Type */}
              <div className="space-y-2">
                <Label htmlFor="taskType" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t("form.task_type")}
                </Label>
                <Select value={taskType} onValueChange={setTaskType}>
                  <SelectTrigger id="taskType" className="h-11 bg-muted/20 border-border/60">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HUMAN">{t("form.type_human")}</SelectItem>
                    <SelectItem value="SYSTEM">{t("form.type_system")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Main Assignee */}
              <div className="space-y-2">
                <Label htmlFor="mainMember" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  主担当者
                </Label>
                <Select value={mainMemberId} onValueChange={setMainMemberId}>
                  <SelectTrigger id="mainMember" className="h-11 bg-muted/20 border-border/60">
                    <SelectValue placeholder="担当者を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        <div className="flex items-center gap-2">
                          <MemberAvatar
                            name={member.name}
                            avatarUrl={member.avatarUrl}
                            avatarColor={member.avatarColor}
                            size="xs"
                          />
                          <span className="text-sm">{member.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sub Assignees (Using simple multiple select simulation with checkboxes if needed, or just a multi-value select) */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                サブ担当者
              </Label>
              <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-border/60 bg-muted/10">
                {members
                  .filter((m) => m.id !== mainMemberId)
                  .map((member) => {
                    const isSelected = subMemberIds.includes(member.id);
                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => {
                          setSubMemberIds((prev) =>
                            prev.includes(member.id)
                              ? prev.filter((id) => id !== member.id)
                              : [...prev, member.id]
                          );
                        }}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200 outline-none",
                          isSelected
                            ? "bg-primary/10 border-primary text-primary shadow-sm"
                            : "bg-background border-border hover:border-muted-foreground/50 text-muted-foreground"
                        )}
                      >
                        <MemberAvatar
                          name={member.name}
                          avatarUrl={member.avatarUrl}
                          avatarColor={member.avatarColor}
                          size="xs"
                        />
                        <span className="text-xs font-medium">{member.name}</span>
                      </button>
                    );
                  })}
                {members.filter((m) => m.id !== mainMemberId).length === 0 && (
                  <p className="text-xs text-muted-foreground italic">メンバーがいません</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t("form.start_date")}
                </Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  required
                  className="h-11 bg-muted/20 border-border/60"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t("form.due_date")}
                </Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  required
                  className="h-11 bg-muted/20 border-border/60"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 bg-muted/30 border-t border-border/50 gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="hover:bg-background"
            >
              キャンセル
            </Button>
            <Button type="submit" className="min-w-[100px] shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
              {t("form.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
