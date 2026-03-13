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
    <div className="flex flex-col items-center gap-4">
      {/* Preview */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-md dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] overflow-hidden cursor-pointer border-2 border-border hover:opacity-90 transition-opacity"
        style={{ backgroundColor: preview ? undefined : color }}
        onClick={() => fileRef.current?.click()}
        title="クリックで画像をアップロード"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="avatar" className="w-full h-full object-cover" />
        ) : (
          getInitials(name || "?")
        )}
      </div>

      {/* Upload hint */}
      <p className="text-xs text-muted-foreground text-center">
        クリックして画像をアップロード
        <br />
        またはカラーを選択
      </p>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {/* Color palette */}
      <div className="flex flex-wrap justify-center gap-2 max-w-[200px]">
        {AVATAR_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => handleColorSelect(c)}
            className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${
              color === c && !preview ? "border-foreground scale-110 shadow-md" : "border-transparent"
            }`}
            style={{ backgroundColor: c }}
            title={c}
          />
        ))}
        {/* Custom color picker */}
        <label className="relative w-7 h-7 rounded-full border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-colors" title="カスタムカラー">
          <span className="text-xs text-muted-foreground">+</span>
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
