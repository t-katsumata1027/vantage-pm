"use client";

import { useState, useTransition } from "react";
import {
  createMember, createTeam,
  updateMember, deleteMember,
  updateTeam, deleteTeam,
  updateMemberAvatar,
} from "@/actions/members";
import { AVATAR_COLORS } from "@/lib/avatar-colors";
import { MemberAvatar } from "@/components/ui/member-avatar";
import { AvatarPicker } from "@/components/ui/avatar-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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

import { Button } from "@/components/ui/button";

type Member = {
  id: string; name: string; email: string;
  teamId: string | null; teamName: string | null;
  avatarUrl: string | null; avatarColor: string;
};
type Team = { id: string; name: string; description: string | null };

// ─────────────────────────────────────────────────────────────
// Sub-modals
// ─────────────────────────────────────────────────────────────

function CreateMemberModal({ teams, onClose }: { teams: Team[]; onClose: () => void }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);

  async function handleSubmit(fd: FormData) {
    fd.set("avatarColor", color);
    if (imageDataUrl) fd.set("avatarUrl", imageDataUrl);
    await createMember(fd);
    onClose();
  }

  return (
    <form action={handleSubmit}>
      <DialogHeader>
        <DialogTitle>メンバー追加</DialogTitle>
      </DialogHeader>
      <div className="py-4 space-y-5">
        <AvatarPicker
          name={name || "?"}
          currentColor={color}
          onColorChange={setColor}
          onImageChange={setImageDataUrl}
        />
        
        <div className="space-y-2">
          <Label htmlFor="member-name">名前</Label>
          <Input
            id="member-name"
            name="name"
            placeholder="山田 太郎"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="member-email">メールアドレス</Label>
          <Input
            id="member-email"
            name="email"
            type="email"
            placeholder="example@vantage.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="member-team">チーム（任意）</Label>
          <Select name="teamId">
            <SelectTrigger id="member-team" className="w-full">
              <SelectValue placeholder="チームを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">なし</SelectItem>
              {teams.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>
          キャンセル
        </Button>
        <Button type="submit">追加</Button>
      </DialogFooter>
    </form>
  );
}

function EditMemberModal({ member, teams, onClose }: { member: Member; teams: Team[]; onClose: () => void }) {
  const [name, setName] = useState(member.name);
  const [email, setEmail] = useState(member.email);
  const [selectedTeam, setSelectedTeam] = useState(member.teamId ?? "none");
  const [color, setColor] = useState(member.avatarColor);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(member.avatarUrl);
  const [isPending, startTransition] = useTransition();

  const save = () => {
    startTransition(async () => {
      await updateMember(member.id, {
        name, email,
        teamId: selectedTeam === "none" ? null : selectedTeam,
      });
      await updateMemberAvatar(member.id, {
        avatarColor: color,
        avatarUrl: imageDataUrl ?? null,
      });
      onClose();
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>メンバー編集</DialogTitle>
      </DialogHeader>
      <div className="py-4 space-y-5">
        <AvatarPicker
          name={name || "?"}
          currentColor={color}
          currentAvatarUrl={imageDataUrl}
          onColorChange={(c) => { setColor(c); setImageDataUrl(null); }}
          onImageChange={setImageDataUrl}
        />
        <div className="space-y-2">
          <Label htmlFor="edit-name">名前</Label>
          <Input id="edit-name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-email">メールアドレス</Label>
          <Input id="edit-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-team">チーム</Label>
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger id="edit-team" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">なし</SelectItem>
              {teams.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>キャンセル</Button>
        <Button onClick={save} disabled={isPending}>{isPending ? "保存中..." : "保存"}</Button>
      </DialogFooter>
    </>
  );
}

function DeleteMemberModal({ member, onClose }: { member: Member; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-danger flex items-center gap-2">
          ⚠️ メンバー削除
        </DialogTitle>
      </DialogHeader>
      <div className="py-4 space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
          <MemberAvatar name={member.name} avatarUrl={member.avatarUrl}
            avatarColor={member.avatarColor} size="md" />
          <div className="min-w-0">
            <p className="font-semibold truncate">{member.name}</p>
            <p className="text-xs text-muted-foreground truncate">{member.email}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          このメンバーを完全に削除します。案件・タスクの担当者情報も削除されます。この操作は元に戻せません。
        </p>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>キャンセル</Button>
        <Button variant="destructive" disabled={isPending} onClick={() => {
          startTransition(async () => { await deleteMember(member.id); onClose(); });
        }}>
          {isPending ? "削除中..." : "削除する"}
        </Button>
      </DialogFooter>
    </>
  );
}

function CreateTeamModal({ onClose }: { onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  return (
    <form action={async (fd) => { 
      startTransition(async () => {
        await createTeam(fd); 
        onClose(); 
      });
    }}>
      <DialogHeader>
        <DialogTitle>チーム追加</DialogTitle>
      </DialogHeader>
      <div className="py-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="team-name">チーム名</Label>
          <Input id="team-name" name="name" required placeholder="営業部、開発チームなど" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="team-desc">説明（任意）</Label>
          <Input id="team-desc" name="description" placeholder="チームの役割など" />
        </div>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>キャンセル</Button>
        <Button type="submit" disabled={isPending}>{isPending ? "作成中..." : "作成"}</Button>
      </DialogFooter>
    </form>
  );
}

function EditTeamModal({ team, onClose }: { team: Team; onClose: () => void }) {
  const [name, setName] = useState(team.name);
  const [desc, setDesc] = useState(team.description ?? "");
  const [isPending, startTransition] = useTransition();
  return (
    <>
      <DialogHeader>
        <DialogTitle>チーム編集</DialogTitle>
      </DialogHeader>
      <div className="py-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="edit-team-name">チーム名</Label>
          <Input id="edit-team-name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-team-desc">説明</Label>
          <Input id="edit-team-desc" value={desc} onChange={(e) => setDesc(e.target.value)} />
        </div>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>キャンセル</Button>
        <Button disabled={isPending} onClick={() => {
          startTransition(async () => {
            await updateTeam(team.id, { name, description: desc || null });
            onClose();
          });
        }}>
          {isPending ? "保存中..." : "保存"}
        </Button>
      </DialogFooter>
    </>
  );
}

function DeleteTeamModal({ team, memberCount, onClose }: { team: Team; memberCount: number; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-danger flex items-center gap-2">
          ⚠️ チーム削除
        </DialogTitle>
      </DialogHeader>
      <div className="py-4 space-y-3">
        <p className="font-semibold text-base">「{team.name}」を削除しますか？</p>
        {memberCount > 0 && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive font-medium">
              ⚠️ 注意: このチームには {memberCount} 名のメンバーがいます。
            </p>
            <p className="text-xs text-destructive/80 mt-1">
              削除するとメンバーは「チーム未割当」になります。
            </p>
          </div>
        )}
        <p className="text-sm text-muted-foreground">この操作は元に戻せません。</p>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>キャンセル</Button>
        <Button variant="destructive" disabled={isPending} onClick={() => {
          startTransition(async () => { await deleteTeam(team.id); onClose(); });
        }}>
          {isPending ? "削除中..." : "削除する"}
        </Button>
      </DialogFooter>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────
type ModalState =
  | { type: "create-member" }
  | { type: "edit-member";   member: Member }
  | { type: "delete-member"; member: Member }
  | { type: "create-team" }
  | { type: "edit-team";     team: Team }
  | { type: "delete-team";   team: Team }
  | null;

export function MembersClient({ members, teams }: { members: Member[]; teams: Team[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modal, setModal] = useState<ModalState>(null);

  const open = (m: ModalState) => { setModal(m); setIsOpen(true); };
  const close = () => { setIsOpen(false); setTimeout(() => setModal(null), 300); };

  // Group members by team
  const groupedByTeam: Record<string, { team: Team; members: Member[] }> = {};
  for (const t of teams) groupedByTeam[t.id] = { team: t, members: [] };
  const noTeam: Member[] = [];
  for (const m of members) {
    if (m.teamId && groupedByTeam[m.teamId]) {
      groupedByTeam[m.teamId].members.push(m);
    } else {
      noTeam.push(m);
    }
  }

  const MemberCard = ({ m }: { m: Member }) => (
    <div className="group relative flex items-center gap-3 p-3 rounded-xl border border-border bg-card shadow-sm dark:shadow-[0_2px_12px_rgba(0,0,0,0.4),0_1px_0_rgba(255,255,255,0.05)_inset] hover:-translate-y-0.5 hover:shadow-md transition-all">
      {/* Avatar */}
      <div className="cursor-pointer" onClick={() => open({ type: "edit-member", member: m })} title="クリックで編集">
        <MemberAvatar name={m.name} avatarUrl={m.avatarUrl} avatarColor={m.avatarColor} size="md" />
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => open({ type: "edit-member", member: m })}>
        <p className="text-sm font-semibold truncate">{m.name}</p>
        <p className="text-xs text-muted-foreground truncate">{m.email}</p>
      </div>
      {/* Actions — visible on hover */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => open({ type: "edit-member", member: m })}
          title="編集"
        >
          ✏️
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => open({ type: "delete-member", member: m })}
          className="hover:bg-danger/10 text-muted-foreground hover:text-danger"
          title="削除"
        >
          🗑️
        </Button>
      </div>
    </div>
  );

  const TeamSection = ({
    teamId, teamName, teamObj, teamMembers,
  }: {
    teamId: string | null; teamName: string; teamObj?: Team; teamMembers: Member[];
  }) => (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex-1">
          {teamId ? "🏢" : "📭"} {teamName}
          <span className="ml-2 text-foreground/40 normal-case tracking-normal">({teamMembers.length}名)</span>
        </h2>
        {teamObj && (
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs px-2"
              onClick={() => open({ type: "edit-team", team: teamObj })}
            >
              編集
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs px-2 hover:bg-danger/10 hover:text-destructive hover:border-destructive/50"
              onClick={() => open({ type: "delete-team", team: teamObj })}
            >
              削除
            </Button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {teamMembers.map((m) => <MemberCard key={m.id} m={m} />)}
        {teamMembers.length === 0 && (
          <p className="text-xs text-muted-foreground col-span-full py-2">メンバーがいません</p>
        )}
      </div>
    </section>
  );

  return (
    <div className="space-y-8">
      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => open({ type: "create-member" })} className="font-medium shadow-sm">
          ＋ メンバー追加
        </Button>
        <Button variant="outline" onClick={() => open({ type: "create-team" })} className="shadow-sm">
          ＋ チーム追加
        </Button>
      </div>

      {/* Teams */}
      <div className="space-y-10">
        {Object.values(groupedByTeam).map(({ team, members: mems }) => (
          <TeamSection key={team.id} teamId={team.id} teamName={team.name}
            teamObj={team} teamMembers={mems} />
        ))}

        {/* No-team members */}
        {(noTeam.length > 0 || teams.length === 0) && (
          <TeamSection teamId={null} teamName="チーム未割当" teamMembers={noTeam} />
        )}
      </div>

      {/* Empty state */}
      {members.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center dark:shadow-[0_4px_28px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.06)_inset]">
          <p className="text-3xl mb-3">👥</p>
          <p className="font-semibold text-lg mb-1">メンバーがいません</p>
          <p className="text-sm text-muted-foreground">「メンバー追加」から最初のメンバーを登録してください。</p>
        </div>
      )}

      {/* Unified Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[480px]">
          {modal?.type === "create-member" && <CreateMemberModal teams={teams} onClose={close} />}
          {modal?.type === "edit-member"   && <EditMemberModal   member={modal.member} teams={teams} onClose={close} />}
          {modal?.type === "delete-member" && <DeleteMemberModal member={modal.member} onClose={close} />}
          {modal?.type === "create-team"   && <CreateTeamModal   onClose={close} />}
          {modal?.type === "edit-team"     && <EditTeamModal     team={modal.team} onClose={close} />}
          {modal?.type === "delete-team"   && (
            <DeleteTeamModal 
              team={modal.team} 
              memberCount={groupedByTeam[modal.team.id]?.members.length ?? 0} 
              onClose={close} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
