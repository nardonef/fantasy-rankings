"use client";

import { cn } from "@/lib/utils";
import type { PlayerTier } from "@/app/actions/players";

const TIERS: { value: PlayerTier; className: string; label: string }[] = [
  { value: "green", className: "bg-rankings", label: "Green tier" },
  { value: "yellow", className: "bg-flag-yellow", label: "Yellow tier" },
  { value: "red", className: "bg-regret", label: "Red tier" },
];

export function TierDots({
  tier,
  onChange,
}: {
  tier: PlayerTier | null;
  onChange: (tier: PlayerTier | null) => void;
}) {
  return (
    <div className="flex items-center gap-[5px]">
      {TIERS.map((t) => (
        <button
          key={t.value}
          type="button"
          aria-label={t.label}
          aria-pressed={tier === t.value}
          onClick={() => onChange(tier === t.value ? null : t.value)}
          className={cn(
            "size-[11px] rounded-full transition-opacity",
            t.className,
            tier === t.value
              ? "opacity-100 ring-1 ring-chalk ring-offset-2 ring-offset-page"
              : "opacity-30 hover:opacity-60",
          )}
        />
      ))}
    </div>
  );
}
