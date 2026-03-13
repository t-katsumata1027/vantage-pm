"use client";

const formatYen = (v: number) =>
  v >= 1_000_000 ? `¥${(v / 1_000_000).toFixed(1)}M` : `¥${(v / 1_000).toFixed(0)}K`;

export function TargetProgressRing({
  achieved,
  target,
}: {
  achieved: number;
  target: number;
}) {
  const pct = target > 0 ? Math.min(100, Math.round((achieved / target) * 100)) : 0;

  // SVG ring parameters
  const size = 150;
  const strokeWidth = 14;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const dash = (pct / 100) * circumference;

  const color = pct >= 100 ? "#10b981" : pct >= 60 ? "#3b82f6" : pct >= 30 ? "#f59e0b" : "#f43f5e";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--muted)"
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
            style={{ transition: "stroke-dasharray 0.8s ease" }}
          />
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{pct}%</span>
          <span className="text-xs text-muted-foreground">達成率</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        {formatYen(achieved)} / {formatYen(target)}
      </p>
    </div>
  );
}
