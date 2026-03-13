"use client";

import { createProject } from "@/actions/projects";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useTranslations } from "next-intl";

export function CreateProjectDialog() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<string>("SALES");
  const t = useTranslations("Projects");

  async function action(formData: FormData) {
    formData.append("type", type);
    await createProject(formData);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{t("new_project")}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form action={action}>
          <DialogHeader>
            <DialogTitle>{t("form.title")}</DialogTitle>
            <DialogDescription>
              {t("form.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t("form.name")}</Label>
              <Input id="name" name="name" required placeholder={t("form.name_placeholder")} />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="type">{t("form.type")}</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
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

            {type === "SALES" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="revenue">{t("form.revenue")}</Label>
                  <Input id="revenue" name="revenue" type="number" placeholder="5000000" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="probability">{t("form.probability")}</Label>
                  <Input id="probability" name="probability" type="number" min="0" max="100" placeholder="50" />
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="duration">{t("form.duration")}</Label>
              <Input id="duration" name="duration" type="number" placeholder="3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{t("form.submit")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
