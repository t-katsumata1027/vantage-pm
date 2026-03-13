import { getDashboardStats } from "@/actions/dashboard";
import { getTranslations } from "next-intl/server";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const t = await getTranslations("Dashboard");

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground mt-1">{t("description")}</p>
      </div>

      <DashboardClient stats={stats} />
    </div>
  );
}
