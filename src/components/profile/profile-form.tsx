"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AvatarPicker } from "@/components/ui/avatar-picker";
import { updateMember } from "@/actions/members";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Loader2, Save, X } from "lucide-react";

export function ProfileForm() {
  const { data: session, update } = useSession();
  const t = useTranslations("Members");
  const tNav = useTranslations("Navigation");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [name, setName] = useState(session?.user?.name || "");
  const [avatarUrl, setAvatarUrl] = useState(session?.user?.image || "");
  const [avatarColor, setAvatarColor] = useState((session?.user as any)?.avatarColor || "#6366f1");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const userId = (session?.user as any)?.id;
      if (!userId) return;

      await updateMember(userId, {
        name,
        email: session?.user?.email || "",
        avatarUrl,
        avatarColor,
      });
      
      if (session) {
        await update({
          ...session,
          user: {
            ...session.user,
            name,
            image: avatarUrl,
            avatarColor
          }
        });
      }
      
      router.refresh();
    });
  };

  if (!session || !session.user) return null;

  return (
    <Card className="max-w-2xl mx-auto shadow-2xl border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      <CardHeader className="space-y-1 pb-6 border-b border-border/50 bg-muted/30">
        <CardTitle className="text-2xl font-black tracking-tight">{tNav("edit_profile")}</CardTitle>
        <CardDescription className="font-medium">{session.user?.email || ""}</CardDescription>
      </CardHeader>
      
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="flex flex-col md:flex-row gap-10 items-center md:items-start text-center md:text-left">
            <div className="space-y-4">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                {t("form.avatar")}
              </Label>
              <AvatarPicker
                name={name}
                currentAvatarUrl={avatarUrl}
                currentColor={avatarColor}
                onImageChange={setAvatarUrl}
                onColorChange={setAvatarColor}
              />
            </div>
            
            <div className="flex-1 w-full space-y-8">
              <div className="space-y-2.5">
                <Label htmlFor="profile-name" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                  {t("form.name")}
                </Label>
                <Input
                  id="profile-name"
                  placeholder={t("form.name_placeholder")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 rounded-xl bg-background/50 border-border/50 focus:border-primary/50 transition-all font-medium"
                  required
                />
              </div>
              
              <div className="space-y-2.5">
                <div className="flex justify-between items-center ml-1">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    {t("form.email")}
                  </Label>
                  <span className="text-[10px] font-bold text-amber-500/80 uppercase">Read Only</span>
                </div>
                <Input
                  value={session.user?.email || ""}
                  className="h-11 rounded-xl bg-muted/50 border-border/30 text-muted-foreground cursor-not-allowed font-medium"
                  readOnly
                  disabled
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-border/50">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
              disabled={isPending}
              className="h-11 px-6 rounded-xl font-bold hover:bg-muted/80 transition-all"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending}
              className="h-11 px-8 rounded-xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 shadow-lg shadow-blue-500/20 transition-all"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {t("form.save")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
