import { getMembers } from "@/actions/members";
import { getTeams } from "@/actions/members";
import { getTranslations } from "next-intl/server";
import { MembersClient } from "@/components/members/members-client";

export default async function MembersPage() {
  const [members, teams] = await Promise.all([getMembers(), getTeams()]);
  const t = await getTranslations("Members");

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground mt-1">{t("description")}</p>
      </div>
      <MembersClient members={members} teams={teams} />
    </div>
  );
}
