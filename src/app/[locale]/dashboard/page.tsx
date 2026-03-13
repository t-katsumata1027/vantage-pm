import { getDashboardStats } from "@/actions/dashboard";
import { getMembers } from "@/actions/members";
import { getTranslations } from "next-intl/server";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default async function DashboardPage() {
  const [stats, members] = await Promise.all([
    getDashboardStats(),
    getMembers(),
  ]);
  const t = await getTranslations("Dashboard");

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
      </div>

      <DashboardClient initialStats={stats} members={members} />
    </div>
  );
}
