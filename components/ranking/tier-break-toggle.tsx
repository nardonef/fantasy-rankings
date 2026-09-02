import { SeparatorHorizontal } from "lucide-react";
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
      size="icon-sm"
      onClick={onToggle}
      aria-pressed={active}
      aria-label={active ? "Remove tier break after this player" : "Insert tier break after this player"}
      className={cn(
        "text-[oklch(0.4_0_0)] opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
        active && "text-foreground opacity-100",
      )}
    >
      <SeparatorHorizontal className="size-[15px]" />
    </Button>
  );
}
