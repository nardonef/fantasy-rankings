"use client";

import { cn } from "@/lib/utils";
import type { PlayerTier } from "@/app/actions/players";

const TIERS: { value: PlayerTier; className: string; label: string }[] = [
  { value: "green", className: "bg-emerald-500", label: "Green tier" },
  { value: "yellow", className: "bg-amber-400", label: "Yellow tier" },
  { value: "red", className: "bg-red-500", label: "Red tier" },
];

export function TierDots({
  tier,
  onChange,
}: {
  tier: PlayerTier | null;
  onChange: (tier: PlayerTier | null) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {TIERS.map((t) => (
        <button
          key={t.value}
          type="button"
          aria-label={t.label}
          aria-pressed={tier === t.value}
          onClick={() => onChange(tier === t.value ? null : t.value)}
          className={cn(
            "size-3.5 rounded-full border-2 transition-transform",
            t.className,
            tier === t.value
              ? "scale-110 border-foreground"
              : "border-transparent opacity-40 hover:opacity-70",
          )}
        />
      ))}
    </div>
  );
}
