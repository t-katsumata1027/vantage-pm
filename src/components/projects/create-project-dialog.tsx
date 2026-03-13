"use client";

import { createProject } from "@/actions/projects";
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
import { MemberAvatar } from "@/components/ui/member-avatar";
import { PlusCircle } from "lucide-react";

type Member = {
  id: string;
  name: string;
  avatarUrl: string | null;
  avatarColor: string;
};

export function CreateProjectDialog({ members }: { members: Member[] }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<string>("SALES");
  const [accountManagerId, setAccountManagerId] = useState<string>("");
  const t = useTranslations("Projects");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("type", type);
    if (accountManagerId) {
      formData.append("accountManagerId", accountManagerId);
    }
    await createProject(formData);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="font-medium gap-2 shadow-md hover:shadow-lg transition-all">
          <PlusCircle className="w-4 h-4" />
          {t("new_project")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[500px] p-0 overflow-hidden border-none shadow-2xl">
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
            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("form.name")}
              </Label>
              <Input
                id="name"
                name="name"
                required
                placeholder={t("form.name_placeholder")}
                className="h-11 bg-muted/20 border-border/60 focus:border-primary/50"
              />
            </div>

            {/* Account Manager Selection */}
            <div className="space-y-2">
              <Label htmlFor="accountManager" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                顧客窓口担当者
              </Label>
              <Select value={accountManagerId} onValueChange={setAccountManagerId}>
                <SelectTrigger id="accountManager" className="h-11 bg-muted/20 border-border/60">
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

            {/* Project Type */}
            <div className="space-y-2">
              <Label htmlFor="type" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("form.type")}
              </Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="type" className="h-11 bg-muted/20 border-border/60">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SALES">{t("form.type_sales")}</SelectItem>
                  <SelectItem value="ALLIANCE">{t("form.type_alliance")}</SelectItem>
                  <SelectItem value="PROMO">{t("form.type_promo")}</SelectItem>
                  <SelectItem value="RD">{t("form.type_rd")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Conditional Fields for SALES */}
            {type === "SALES" && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="revenue" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t("form.revenue")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="revenue"
                      name="revenue"
                      type="number"
                      placeholder="5000000"
                      className="h-11 bg-muted/20 border-border/60 pl-8"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">¥</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="probability" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t("form.probability")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="probability"
                      name="probability"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="50"
                      className="h-11 bg-muted/20 border-border/60 pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("form.duration")}
              </Label>
              <div className="relative">
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  placeholder="3"
                  className="h-11 bg-muted/20 border-border/60 pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">ヶ月</span>
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
            <Button type="submit" className="min-w-[100px] shadow-lg shadow-primary/20">
              {t("form.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
