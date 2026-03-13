"use client";

import { useState, useRef } from "react";
import { AVATAR_COLORS } from "@/lib/avatar-colors";

type AvatarPickerProps = {
  name: string;
  currentColor?: string;
  currentAvatarUrl?: string | null;
  onColorChange: (color: string) => void;
  onImageChange: (dataUrl: string) => void;
};

function getInitials(n: string) {
  const parts = n.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AvatarPicker({
  name,
  currentColor = "#6366f1",
  currentAvatarUrl,
  onColorChange,
  onImageChange,
}: AvatarPickerProps) {
  const [color, setColor] = useState(currentColor);
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl ?? null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleColorSelect = (c: string) => {
    setColor(c);
    setPreview(null); // clear image preview when color selected
    onColorChange(c);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      onImageChange(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Preview */}
      <div
        className="group relative w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-xl dark:shadow-[0_8px_30px_rgba(0,0,0,0.6)] overflow-hidden cursor-pointer border-4 border-background ring-2 ring-border hover:ring-primary/50 transition-all duration-300 transform hover:scale-105"
        style={{ backgroundColor: preview ? undefined : color }}
        onClick={() => fileRef.current?.click()}
        title="クリックで画像をアップロード"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="avatar" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        ) : (
          getInitials(name || "?")
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
          <span className="text-xs font-medium text-white">変更</span>
        </div>
      </div>

      {/* Upload hint */}
      <div className="text-center space-y-1">
        <p className="text-xs font-semibold text-foreground/80">アバター設定</p>
        <p className="text-[10px] text-muted-foreground">
          画像アップロード、またはカラー選択
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {/* Color palette */}
      <div className="flex flex-wrap justify-center gap-3 max-w-[240px] p-3 rounded-2xl bg-muted/30 border border-border/50">
        {AVATAR_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => handleColorSelect(c)}
            className={`w-6 h-6 rounded-full border-2 transition-all duration-200 hover:scale-125 hover:shadow-lg ${
              color === c && !preview ? "border-foreground scale-110 ring-2 ring-ring ring-offset-2 ring-offset-background" : "border-transparent"
            }`}
            style={{ backgroundColor: c }}
            title={c}
          />
        ))}
        {/* Custom color picker */}
        <label className="relative w-6 h-6 rounded-full border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/10 transition-all duration-200 group/custom" title="カスタムカラー">
          <span className="text-[10px] text-muted-foreground group-hover/custom:text-primary">+</span>
          <input
            type="color"
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            value={color}
            onChange={(e) => handleColorSelect(e.target.value)}
          />
        </label>
      </div>
    </div>
  );
}
