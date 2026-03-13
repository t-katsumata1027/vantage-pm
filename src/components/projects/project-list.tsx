"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Info, BarChart2, Calendar } from "lucide-react";

type Project = {
  id: string;
  name: string;
  type: string;
  status: string;
  revenue: string | null;
  probability: number | null;
  duration: number | null;
};

const TYPE_CONFIG: Record<string, { label: string; className: string }> = {
  SALES: { label: "Sales", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  ALLIANCE: { label: "Alliance", className: "bg-violet-500/10 text-violet-500 border-violet-500/20" },
  PROMO: { label: "Promo", className: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  RD: { label: "R&D", className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
};

export function ProjectList({ projects }: { projects: Project[] }) {
  const t = useTranslations("Projects");

  if (projects.length === 0) {
    return (
      <div className="rounded-3xl border border-border/50 bg-card/40 backdrop-blur-sm p-16 text-center shadow-xl animate-in fade-in zoom-in-95 duration-500">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-muted mb-4">
          <Info className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-xl font-black mb-2 tracking-tight">{t("no_projects")}</p>
        <p className="text-muted-foreground font-medium">{t("get_started")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-md shadow-2xl overflow-hidden animate-in fade-in duration-700">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow className="hover:bg-transparent border-border/50">
            <TableHead className="px-6 h-12 font-black text-xs uppercase tracking-widest text-muted-foreground">{t("table.name")}</TableHead>
            <TableHead className="px-6 h-12 font-black text-xs uppercase tracking-widest text-muted-foreground">{t("table.type")}</TableHead>
            <TableHead className="px-6 h-12 font-black text-xs uppercase tracking-widest text-muted-foreground">{t("table.status")}</TableHead>
            <TableHead className="px-6 h-12 font-black text-xs uppercase tracking-widest text-muted-foreground text-right">{t("table.revenue")}</TableHead>
            <TableHead className="px-6 h-12 font-black text-xs uppercase tracking-widest text-muted-foreground text-right">{t("table.duration")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow
              key={project.id}
              className="group border-border/40 hover:bg-primary/5 transition-all cursor-pointer h-16"
            >
              <TableCell className="px-6 font-bold text-base tracking-tight group-hover:text-primary transition-colors">
                {project.name}
              </TableCell>
              <TableCell className="px-6">
                <Badge 
                  variant="outline" 
                  className={cn(
                    "font-bold px-3 py-0.5 rounded-full border shadow-sm",
                    TYPE_CONFIG[project.type]?.className ?? "bg-muted/50"
                  )}
                >
                  {TYPE_CONFIG[project.type]?.label ?? project.type}
                </Badge>
              </TableCell>
              <TableCell className="px-6">
                <div className="inline-flex items-center gap-1.5 bg-muted/50 px-3 py-1 rounded-full border border-border/50 text-[10px] font-black uppercase tracking-tighter text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse" />
                  {project.status}
                </div>
              </TableCell>
              <TableCell className="px-6 text-right">
                {project.type === "SALES" ? (
                  <div className="flex flex-col items-end">
                    <span className="font-black text-sm tracking-tighter">
                      {project.revenue ? `¥${Number(project.revenue).toLocaleString()}` : "—"}
                    </span>
                    {project.probability && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <BarChart2 className="w-2.5 h-2.5 text-muted-foreground/50" />
                        <span className="text-[10px] font-bold text-muted-foreground/70 uppercase">{project.probability}%</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground/40 font-bold">—</span>
                )}
              </TableCell>
              <TableCell className="px-6 text-right font-bold text-muted-foreground/80">
                <div className="flex items-center justify-end gap-1.5">
                  <Calendar className="w-3.5 h-3.5 opacity-30" />
                  {project.duration ? `${project.duration}ヶ月` : "—"}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
