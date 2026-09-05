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
    <div className="flex items-center gap-1.5">
      {TIERS.map((t) => (
        <button
          key={t.value}
          type="button"
          aria-label={t.label}
          aria-pressed={tier === t.value}
          onClick={() => onChange(tier === t.value ? null : t.value)}
          className={cn(
            "size-[9px] rounded-full opacity-[0.55] transition-opacity group-hover:opacity-100",
            t.className,
            tier === t.value && "opacity-100 outline-2 outline-offset-1 outline-foreground",
          )}
        />
      ))}
    </div>
  );
}
