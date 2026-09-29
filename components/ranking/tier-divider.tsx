export function TierDivider({ tier, count }: { tier: number; count?: number }) {
  return (
    <div className="flex items-center gap-3 pt-3.5 pb-1.5" aria-hidden="true">
      <span className="kicker text-rankings">Tier {tier}</span>
      {count !== undefined && (
        <span className="font-mono text-[11px] text-chalk-muted">{count}</span>
      )}
      <div className="h-px flex-1 bg-hairline" />
    </div>
  );
}
