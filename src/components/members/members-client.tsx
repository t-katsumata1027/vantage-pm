"use client";

import { useState } from "react";
import { createMember, createTeam, updateMemberAvatar } from "@/actions/members";
import { AVATAR_COLORS } from "@/lib/avatar-colors";
import { MemberAvatar } from "@/components/ui/member-avatar";
import { AvatarPicker } from "@/components/ui/avatar-picker";
import {
  Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Input, Select, SelectItem, useDisclosure, Chip,
} from "@heroui/react";

type Member = {
  id: string; name: string; email: string;
  teamId: string | null; teamName: string | null;
  avatarUrl: string | null; avatarColor: string;
};
type Team = { id: string; name: string; description: string | null };

// ── Create Member Modal ──────────────────────────────────────────────────────
function CreateMemberModal({ teams, onClose }: { teams: Team[]; onClose: () => void }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(
    AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
  );
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    formData.set("avatarColor", color);
    if (imageDataUrl) formData.set("avatarUrl", imageDataUrl);
    await createMember(formData);
    onClose();
  }

  return (
    <form action={handleSubmit}>
      <ModalHeader>
        <h3 className="text-lg font-semibold">メンバー追加</h3>
      </ModalHeader>
      <ModalBody className="gap-4">
        {/* Avatar Picker */}
        <AvatarPicker
          name={name || "?"}
          currentColor={color}
          onColorChange={setColor}
          onImageChange={setImageDataUrl}
        />
        <Input label="名前" name="name" required variant="bordered"
          value={name} onValueChange={setName} />
        <Input label="メールアドレス" name="email" type="email" required variant="bordered" />
        <Select
          label="チーム（任意）"
          name="teamId"
          variant="bordered"
          items={[{ id: "", name: "なし" }, ...teams]}
        >
          {(team) => <SelectItem key={team.id}>{team.name}</SelectItem>}
        </Select>
      </ModalBody>
      <ModalFooter>
        <Button color="default" variant="light" onPress={onClose}>キャンセル</Button>
        <Button type="submit" color="primary">追加</Button>
      </ModalFooter>
    </form>
  );
}

// ── Create Team Modal ────────────────────────────────────────────────────────
function CreateTeamModal({ onClose }: { onClose: () => void }) {
  return (
    <form action={async (fd) => { await createTeam(fd); onClose(); }}>
      <ModalHeader>
        <h3 className="text-lg font-semibold">チーム追加</h3>
      </ModalHeader>
      <ModalBody className="gap-4">
        <Input label="チーム名" name="name" required variant="bordered" />
        <Input label="説明（任意）" name="description" variant="bordered" />
      </ModalBody>
      <ModalFooter>
        <Button color="default" variant="light" onPress={onClose}>キャンセル</Button>
        <Button type="submit" color="primary">作成</Button>
      </ModalFooter>
    </form>
  );
}

// ── Avatar Edit Modal ────────────────────────────────────────────────────────
function AvatarEditModal({
  member, onClose,
}: { member: Member; onClose: () => void }) {
  const [color, setColor] = useState(member.avatarColor);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(member.avatarUrl);

  return (
    <div className="p-2">
      <ModalHeader>
        <h3 className="text-lg font-semibold">{member.name} のアバター編集</h3>
      </ModalHeader>
      <ModalBody>
        <AvatarPicker
          name={member.name}
          currentColor={color}
          currentAvatarUrl={imageDataUrl}
          onColorChange={(c) => { setColor(c); setImageDataUrl(null); }}
          onImageChange={setImageDataUrl}
        />
      </ModalBody>
      <ModalFooter>
        <Button color="default" variant="light" onPress={onClose}>キャンセル</Button>
        <Button color="primary" onPress={async () => {
          await updateMemberAvatar(member.id, {
            avatarColor: color,
            avatarUrl: imageDataUrl ?? null,
          });
          onClose();
        }}>
          保存
        </Button>
      </ModalFooter>
    </div>
  );
}

// ── Main Client ──────────────────────────────────────────────────────────────
export function MembersClient({ members, teams }: { members: Member[]; teams: Team[] }) {
  const memberModal = useDisclosure();
  const teamModal = useDisclosure();
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const editModal = useDisclosure();

  const groupedByTeam: Record<string, Member[]> = {};
  const noTeam: Member[] = [];
  for (const m of members) {
    if (m.teamName) {
      groupedByTeam[m.teamName] = groupedByTeam[m.teamName] ?? [];
      groupedByTeam[m.teamName].push(m);
    } else {
      noTeam.push(m);
    }
  }

  const MemberCard = ({ m }: { m: Member }) => (
    <div
      className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card shadow-sm dark:shadow-[0_2px_12px_rgba(0,0,0,0.4),0_1px_0_rgba(255,255,255,0.05)_inset] hover:-translate-y-0.5 hover:shadow-md transition-all cursor-pointer"
      onClick={() => { setEditingMember(m); editModal.onOpen(); }}
      title="クリックでアバター編集"
    >
      <MemberAvatar name={m.name} avatarUrl={m.avatarUrl} avatarColor={m.avatarColor} size="md" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{m.name}</p>
        <p className="text-xs text-muted-foreground truncate">{m.email}</p>
      </div>
      {m.teamName && (
        <Chip size="sm" variant="flat" color="secondary">{m.teamName}</Chip>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Actions */}
      <div className="flex gap-3">
        <Button color="primary" onPress={memberModal.onOpen} className="font-medium">
          メンバー追加
        </Button>
        <Button color="default" variant="bordered" onPress={teamModal.onOpen}>
          チーム追加
        </Button>
      </div>

      {/* Members grouped by team */}
      {Object.entries(groupedByTeam).map(([teamName, mems]) => (
        <section key={teamName}>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            🏢 {teamName} <span className="ml-1 text-foreground/40">({mems.length})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {mems.map((m) => <MemberCard key={m.id} m={m} />)}
          </div>
        </section>
      ))}

      {noTeam.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            チーム未割当 <span className="ml-1 text-foreground/40">({noTeam.length})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {noTeam.map((m) => <MemberCard key={m.id} m={m} />)}
          </div>
        </section>
      )}

      {members.length === 0 && (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">まだメンバーがいません。「メンバー追加」から登録してください。</p>
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={memberModal.isOpen} onOpenChange={memberModal.onOpenChange} backdrop="blur">
        <ModalContent>
          {(onClose) => <CreateMemberModal teams={teams} onClose={onClose} />}
        </ModalContent>
      </Modal>

      <Modal isOpen={teamModal.isOpen} onOpenChange={teamModal.onOpenChange} backdrop="blur">
        <ModalContent>
          {(onClose) => <CreateTeamModal onClose={onClose} />}
        </ModalContent>
      </Modal>

      <Modal isOpen={editModal.isOpen} onOpenChange={editModal.onOpenChange} backdrop="blur">
        <ModalContent>
          {(onClose) => editingMember && (
            <AvatarEditModal member={editingMember} onClose={() => { onClose(); setEditingMember(null); }} />
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
