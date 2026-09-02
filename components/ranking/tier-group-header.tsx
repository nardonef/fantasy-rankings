export function TierGroupHeader({ tier, count }: { tier: number; count: number }) {
  return (
    <div
      className="flex items-center gap-2 border-b border-b-hairline bg-surface-wash px-[18px] py-2.5"
      aria-hidden="true"
    >
      <span className="font-mono text-[11px] tracking-[0.1em] text-muted-foreground uppercase">
        Tier {tier}
      </span>
      <span className="font-mono text-[11px] text-muted-3">
        {count} player{count === 1 ? "" : "s"}
      </span>
    </div>
  );
}
