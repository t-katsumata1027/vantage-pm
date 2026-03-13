"use client";

/**
 * MemberAvatar
 * - avatarUrl がある → 画像表示
 * - なし → 名前の頭文字 (initials) を avatarColor 背景で表示
 */

type Size = "xs" | "sm" | "md" | "lg" | "xl";

const SIZE_MAP: Record<Size, { box: string; text: string; ring: string }> = {
  xs: { box: "w-6 h-6",   text: "text-[10px]", ring: "ring-1" },
  sm: { box: "w-8 h-8",   text: "text-xs",     ring: "ring-1" },
  md: { box: "w-9 h-9",   text: "text-sm",     ring: "ring-2" },
  lg: { box: "w-11 h-11", text: "text-base",   ring: "ring-2" },
  xl: { box: "w-14 h-14", text: "text-lg",     ring: "ring-2" },
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export type MemberAvatarProps = {
  name: string;
  avatarUrl?: string | null;
  avatarColor?: string;
  size?: Size;
  /** Ring color e.g. "ring-background" for stacked groups */
  ringColor?: string;
  className?: string;
  title?: string;
};

export function MemberAvatar({
  name,
  avatarUrl,
  avatarColor = "#6366f1",
  size = "md",
  ringColor = "ring-background",
  className = "",
  title,
}: MemberAvatarProps) {
  const { box, text, ring } = SIZE_MAP[size];
  const label = title ?? name;

  return (
    <div
      className={`relative rounded-full ${box} ${ring} ${ringColor} flex-shrink-0 overflow-hidden select-none ${className}`}
      title={label}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt={label} className="w-full h-full object-cover" />
      ) : (
        <div
          className={`w-full h-full flex items-center justify-center font-bold ${text} text-white`}
          style={{ backgroundColor: avatarColor }}
        >
          {getInitials(name)}
        </div>
      )}
    </div>
  );
}

/** Overlapping stack of avatars — shows up to `max`, then +N badge */
export function AvatarGroup({
  members,
  max = 3,
  size = "sm",
}: {
  members: { name: string; avatarUrl?: string | null; avatarColor?: string }[];
  max?: number;
  size?: Size;
}) {
  const visible = members.slice(0, max);
  const extra = members.length - max;
  const { box, text } = SIZE_MAP[size];

  return (
    <div className="flex -space-x-2">
      {visible.map((m, i) => (
        <MemberAvatar
          key={i}
          name={m.name}
          avatarUrl={m.avatarUrl}
          avatarColor={m.avatarColor}
          size={size}
          ringColor="ring-card"
        />
      ))}
      {extra > 0 && (
        <div
          className={`relative rounded-full ${box} ring-2 ring-card flex-shrink-0 flex items-center justify-center bg-muted ${text} font-semibold text-muted-foreground`}
        >
          +{extra}
        </div>
      )}
    </div>
  );
}
