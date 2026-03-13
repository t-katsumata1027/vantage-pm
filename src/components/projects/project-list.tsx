"use client";

import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

type Project = {
  id: string;
  name: string;
  type: string;
  status: string;
  revenue: string | null;
  probability: number | null;
  duration: number | null;
};

export function ProjectList({ projects }: { projects: Project[] }) {
  const t = useTranslations("Projects");

  if (projects.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-12 text-center">
        <CardTitle className="mb-2">{t("no_projects")}</CardTitle>
        <CardDescription>
          {t("get_started")}
        </CardDescription>
      </Card>
    );
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "SALES":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
      case "ALLIANCE":
        return "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20";
      case "PROMO":
        return "bg-pink-500/10 text-pink-500 hover:bg-pink-500/20";
      case "RD":
        return "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20";
      default:
        return "";
    }
  };

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("table.name")}</TableHead>
            <TableHead>{t("table.type")}</TableHead>
            <TableHead>{t("table.status")}</TableHead>
            <TableHead>{t("table.revenue")}</TableHead>
            <TableHead>{t("table.duration")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
              <TableCell className="font-medium">
                  {project.name}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={getTypeColor(project.type)}>
                  {project.type}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{project.status}</Badge>
              </TableCell>
              <TableCell>
                {project.type === "SALES" ? (
                  <div className="flex items-center gap-2">
                    {project.revenue ? `¥${Number(project.revenue).toLocaleString()}` : "-"}
                    {project.probability && (
                      <span className="text-xs text-muted-foreground">
                        ({project.probability}%)
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                {project.duration ? `${project.duration}` : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
