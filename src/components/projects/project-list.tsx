"use client";

import { useTranslations } from "next-intl";
import { Chip } from "@heroui/react";

type Project = {
  id: string;
  name: string;
  type: string;
  status: string;
  revenue: string | null;
  probability: number | null;
  duration: number | null;
};

const TYPE_COLOR: Record<string, "primary" | "secondary" | "success" | "warning" | "default"> = {
  SALES: "primary",
  ALLIANCE: "secondary",
  PROMO: "warning",
  RD: "success",
};

export function ProjectList({ projects }: { projects: Project[] }) {
  const t = useTranslations("Projects");

  if (projects.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm dark:shadow-[0_4px_24px_rgba(0,0,0,0.6),0_1px_0_rgba(255,255,255,0.06)_inset]">
        <p className="text-lg font-semibold mb-2">{t("no_projects")}</p>
        <p className="text-muted-foreground">{t("get_started")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm dark:shadow-[0_4px_28px_rgba(0,0,0,0.65),0_1px_0_rgba(255,255,255,0.07)_inset] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-6 py-3 text-left font-semibold text-muted-foreground tracking-wide">{t("table.name")}</th>
            <th className="px-6 py-3 text-left font-semibold text-muted-foreground tracking-wide">{t("table.type")}</th>
            <th className="px-6 py-3 text-left font-semibold text-muted-foreground tracking-wide">{t("table.status")}</th>
            <th className="px-6 py-3 text-left font-semibold text-muted-foreground tracking-wide">{t("table.revenue")}</th>
            <th className="px-6 py-3 text-left font-semibold text-muted-foreground tracking-wide">{t("table.duration")}</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project, idx) => (
            <tr
              key={project.id}
              className={`border-b border-border/60 hover:bg-accent/40 transition-colors cursor-pointer ${
                idx % 2 === 1 ? "bg-muted/20" : ""
              }`}
            >
              <td className="px-6 py-4 font-medium">{project.name}</td>
              <td className="px-6 py-4">
                <Chip size="sm" variant="flat" color={TYPE_COLOR[project.type] ?? "default"}>
                  {project.type}
                </Chip>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-border bg-muted text-muted-foreground">
                  {project.status}
                </span>
              </td>
              <td className="px-6 py-4">
                {project.type === "SALES" ? (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {project.revenue ? `¥${Number(project.revenue).toLocaleString()}` : "—"}
                    </span>
                    {project.probability && (
                      <span className="text-xs text-muted-foreground">({project.probability}%)</span>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="px-6 py-4 text-muted-foreground">
                {project.duration ? `${project.duration}ヶ月` : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
