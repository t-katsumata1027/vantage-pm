"use client";

import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MemberAvatar } from "@/components/ui/member-avatar";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { User, LogOut, Settings } from "lucide-react";

export function UserMenu() {
  const { data: session } = useSession();
  const t = useTranslations("Navigation");
  const params = useParams();
  const locale = params.locale as string;

  if (!session?.user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 outline-none group">
          <MemberAvatar
            name={session.user.name || ""}
            avatarUrl={session.user.image}
            avatarColor={(session.user as any).avatarColor}
            size="sm"
            className="cursor-pointer ring-2 ring-transparent transition-all group-hover:ring-primary/50 group-data-[state=open]:ring-primary"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 mt-1 border-border/50 shadow-xl backdrop-blur-md bg-background/95">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-bold leading-none">{session.user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/50" />
        <DropdownMenuItem asChild className="focus:bg-primary/10 focus:text-primary transition-colors cursor-pointer">
          <Link href={`/${locale}/profile`} className="flex w-full items-center gap-2">
            <User className="w-4 h-4" />
            <span>{t("edit_profile")}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
          className="text-destructive focus:bg-destructive/10 focus:text-destructive transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span>{t("logout")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
