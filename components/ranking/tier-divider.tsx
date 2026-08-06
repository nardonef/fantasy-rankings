export function TierDivider({ tier }: { tier: number }) {
  return (
    <div className="flex items-center gap-3 py-1" aria-hidden="true">
      <span className="text-xs font-semibold tracking-wide text-muted-foreground">
        Tier {tier}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
