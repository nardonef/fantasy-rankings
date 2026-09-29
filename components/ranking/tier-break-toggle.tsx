import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TierBreakToggle({
  active,
  onToggle,
}: {
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onToggle}
      aria-pressed={active}
      aria-label={active ? "Remove tier break after this player" : "Insert tier break after this player"}
      className={cn(
        "h-6 rounded-[5px] border border-dashed border-hairline-2 px-1.5 font-mono text-[10px] tracking-[0.14em] uppercase text-chalk-muted",
        active && "border-solid border-rankings text-rankings hover:text-rankings",
      )}
    >
      Break
    </Button>
  );
}
